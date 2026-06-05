"""Image I/O and logging helpers."""

from __future__ import annotations

import io
import logging
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

import settings as S


def setup_logger(name: str, log_file: Path | None = None) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        fh = logging.FileHandler(log_file, encoding="utf-8")
        fh.setFormatter(fmt)
        logger.addHandler(fh)
    return logger


def load_image_bgr(path: Path | str) -> np.ndarray:
    path = Path(path)
    with path.open("rb") as f:
        data = f.read()
    pil = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
    rgb = np.array(pil.convert("RGB"))
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def save_image_bgr(path: Path | str, image: np.ndarray) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    ext = path.suffix.lower()
    encode_ext = {".jfif": ".jpg", ".jpeg": ".jpg"}.get(ext, ext)
    if encode_ext not in {".jpg", ".png", ".webp", ".bmp"}:
        path = path.with_suffix(".jpg")
        encode_ext = ".jpg"
    ok, encoded = cv2.imencode(encode_ext, image)
    if not ok:
        raise ValueError(f"이미지 저장 실패: {path}")
    path.write_bytes(encoded.tobytes())
    return path


def iter_images(root: Path):
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.suffix.lower() in S.IMAGE_EXTENSIONS:
            yield path.relative_to(root).as_posix(), path


def program_info_from_rel(rel_path: str) -> tuple[str, str]:
    parts = Path(rel_path).parts
    program_id = parts[0] if parts else ""
    label = S.PROGRAM_ID_TO_LABEL.get(program_id, program_id)
    return program_id, label
