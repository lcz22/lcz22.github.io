"""Image / motion storage abstraction.

Local storage is used now; an OSS/S3 implementation can replace this class
without changing the API endpoints.
"""

from __future__ import annotations

import asyncio
import io
import shutil
from abc import ABC, abstractmethod
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from uuid import uuid4

from PIL import Image, ImageOps, UnidentifiedImageError
from pillow_heif import register_heif_opener

from .config import Settings, settings

register_heif_opener()


@lru_cache(maxsize=1)
def ffmpeg_executable() -> str | None:
    if settings.ffmpeg_binary:
        return settings.ffmpeg_binary
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


class InvalidImageError(ValueError):
    pass


class InvalidMotionError(ValueError):
    pass


@dataclass(slots=True)
class StoredImage:
    filename: str
    url: str


@dataclass(slots=True)
class StoredMotion:
    filename: str
    url: str
    mime: str


class ImageStorage(ABC):
    @abstractmethod
    async def save(self, upload_file) -> StoredImage:
        raise NotImplementedError

    @abstractmethod
    async def save_motion(self, upload_file) -> StoredMotion:
        raise NotImplementedError

    @abstractmethod
    def delete(self, filename: str | None) -> None:
        raise NotImplementedError


class LocalImageStorage(ImageStorage):
    def __init__(self, config: Settings = settings):
        self.config = config
        self.directory = Path(config.upload_dir)
        self.directory.mkdir(parents=True, exist_ok=True)

    async def save(self, upload_file) -> StoredImage:
        content_type = (upload_file.content_type or "").lower()
        original_name = (upload_file.filename or "").lower()
        suffix = Path(original_name).suffix
        image_suffixes = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".heic", ".heif"}
        if content_type and not content_type.startswith("image/") and suffix not in image_suffixes:
            raise InvalidImageError("只支持图片文件")

        payload = await upload_file.read(self.config.max_upload_bytes + 1)
        if not payload:
            raise InvalidImageError("图片文件为空")
        if len(payload) > self.config.max_upload_bytes:
            raise InvalidImageError("图片超过 20MB")

        try:
            with Image.open(io.BytesIO(payload)) as probe:
                probe.verify()
            with Image.open(io.BytesIO(payload)) as source:
                image = ImageOps.exif_transpose(source)
                if image.mode not in {"RGB", "L"}:
                    image = image.convert("RGB")
                elif image.mode == "L":
                    image = image.convert("RGB")
                image.thumbnail(
                    (self.config.max_image_side, self.config.max_image_side),
                    Image.Resampling.LANCZOS,
                )
                filename = f"{uuid4().hex}.jpg"
                output = self.directory / filename
                image.save(
                    output,
                    format="JPEG",
                    quality=self.config.jpeg_quality,
                    optimize=True,
                    progressive=True,
                )
        except (UnidentifiedImageError, Image.DecompressionBombError, OSError, ValueError) as exc:
            raise InvalidImageError("无法识别这张图片") from exc

        return StoredImage(
            filename=filename,
            url=f"{self.config.public_base_url}/uploads/{filename}",
        )

    async def save_motion(self, upload_file) -> StoredMotion:
        content_type = (upload_file.content_type or "").lower()
        original_name = (upload_file.filename or "").lower()
        suffix = Path(original_name).suffix
        allowed = {"video/mp4", "video/quicktime"}
        if content_type not in allowed and suffix not in {".mp4", ".mov"}:
            raise InvalidMotionError("实况视频只支持 MP4 / MOV")

        payload = await upload_file.read(self.config.max_motion_bytes + 1)
        if not payload:
            raise InvalidMotionError("实况视频为空")
        if len(payload) > self.config.max_motion_bytes:
            raise InvalidMotionError("实况视频超过 60MB")
        if len(payload) < 12 or payload[4:8] != b"ftyp":
            raise InvalidMotionError("实况视频格式无法识别，请使用 MP4 / MOV")

        ffmpeg = ffmpeg_executable()
        if not ffmpeg:
            raise InvalidMotionError("服务器缺少 ffmpeg，暂时无法处理实况视频")

        input_suffix = ".mov" if content_type == "video/quicktime" or suffix == ".mov" else ".mp4"
        input_path = self.directory / f".motion-{uuid4().hex}{input_suffix}"
        filename = f"{uuid4().hex}.mp4"
        output_path = self.directory / filename
        input_path.write_bytes(payload)

        try:
            await self._transcode(ffmpeg, input_path, output_path)
            if not output_path.exists() or output_path.stat().st_size == 0:
                raise InvalidMotionError("实况视频转码失败")
        except InvalidMotionError:
            output_path.unlink(missing_ok=True)
            raise
        except Exception as exc:
            output_path.unlink(missing_ok=True)
            raise InvalidMotionError("实况视频转码失败，请换一段 MP4 / MOV") from exc
        finally:
            input_path.unlink(missing_ok=True)

        return StoredMotion(
            filename=filename,
            url=f"{self.config.public_base_url}/uploads/{filename}",
            mime="video/mp4",
        )

    async def _transcode(self, ffmpeg: str, input_path: Path, output_path: Path) -> None:
        scale = f"scale=w=min({self.config.motion_max_side}\\,iw):h=-2:flags=lanczos"
        command = [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(input_path),
            "-t",
            str(self.config.motion_max_seconds),
            "-map",
            "0:v:0",
            "-map",
            "0:a?",
            "-vf",
            scale,
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            str(self.config.motion_crf),
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "96k",
            "-movflags",
            "+faststart",
            str(output_path),
        ]
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            _, stderr = await asyncio.wait_for(process.communicate(), timeout=180)
        except asyncio.TimeoutError as exc:
            process.kill()
            await process.wait()
            raise InvalidMotionError("实况视频转码超时") from exc
        if process.returncode != 0:
            message = stderr.decode("utf-8", "ignore")[-500:]
            print(f"ffmpeg failed: {message}")
            raise InvalidMotionError("实况视频转码失败，请换一段 MP4 / MOV")

    def delete(self, filename: str | None) -> None:
        if not filename:
            return
        # Keep deletion inside the configured upload directory.
        if Path(filename).name != filename:
            return
        path = self.directory / filename
        try:
            if path.resolve().parent == self.directory.resolve():
                path.unlink(missing_ok=True)
        except OSError:
            pass


_storage = LocalImageStorage()


def get_storage() -> ImageStorage:
    return _storage
