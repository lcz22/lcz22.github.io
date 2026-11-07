"""Image / motion storage abstraction.

Local storage is used now; an OSS/S3 implementation can replace this class
without changing the API endpoints.
"""

from __future__ import annotations

import io
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from PIL import Image, ImageOps, UnidentifiedImageError
from pillow_heif import register_heif_opener

from .config import Settings, settings

register_heif_opener()


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

        is_quicktime = content_type == "video/quicktime" or suffix == ".mov"
        extension = ".mov" if is_quicktime else ".mp4"
        mime = "video/quicktime" if is_quicktime else "video/mp4"
        filename = f"{uuid4().hex}{extension}"
        (self.directory / filename).write_bytes(payload)
        return StoredMotion(
            filename=filename,
            url=f"{self.config.public_base_url}/uploads/{filename}",
            mime=mime,
        )

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
