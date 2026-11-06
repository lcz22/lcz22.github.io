"""Image storage abstraction.

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

from .config import Settings, settings


class InvalidImageError(ValueError):
    pass


@dataclass(slots=True)
class StoredImage:
    filename: str
    url: str


class ImageStorage(ABC):
    @abstractmethod
    async def save(self, upload_file) -> StoredImage:
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
        if content_type and not content_type.startswith("image/"):
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
