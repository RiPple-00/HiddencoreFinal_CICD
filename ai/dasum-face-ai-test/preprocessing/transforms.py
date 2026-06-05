"""Common preprocessing: stabilize model input without face-specific ops."""

from __future__ import annotations

import io
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

from preprocessing.config import (
    CLAHE_CLIP_LIMIT,
    CLAHE_TILE_GRID,
    DENOISE_D,
    DENOISE_SIGMA_COLOR,
    DENOISE_SIGMA_SPACE,
    LETTERBOX_PAD_COLOR,
    LETTERBOX_SIZE,
)


def load_image_bgr(path: str) -> np.ndarray:
    """Load with EXIF orientation; return BGR uint8."""
    with open(path, "rb") as f:
        data = f.read()
    pil = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
    rgb = np.array(pil.convert("RGB"))
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def save_image_bgr(path: str, image: np.ndarray) -> str:
    path_obj = Path(path)
    ext = path_obj.suffix.lower()
    encode_ext = {".jfif": ".jpg", ".jpeg": ".jpg"}.get(ext, ext)
    if encode_ext not in {".jpg", ".png", ".webp", ".bmp"}:
        path_obj = path_obj.with_suffix(".jpg")
        encode_ext = ".jpg"
        path = str(path_obj)
    ok, encoded = cv2.imencode(encode_ext, image)
    if not ok:
        raise ValueError(f"이미지 저장 실패: {path}")
    with open(path, "wb") as f:
        f.write(encoded.tobytes())
    return path


def letterbox(image: np.ndarray, size: int = LETTERBOX_SIZE) -> np.ndarray:
    """Aspect-ratio preserving resize + padding to size×size."""
    h, w = image.shape[:2]
    scale = min(size / w, size / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR
    resized = cv2.resize(image, (new_w, new_h), interpolation=interp)
    canvas = np.full((size, size, 3), LETTERBOX_PAD_COLOR, dtype=np.uint8)
    top = (size - new_h) // 2
    left = (size - new_w) // 2
    canvas[top : top + new_h, left : left + new_w] = resized
    return canvas


def adjust_brightness_contrast(image: np.ndarray) -> np.ndarray:
    """Mild CLAHE on L channel."""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=CLAHE_CLIP_LIMIT, tileGridSize=CLAHE_TILE_GRID)
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)


def remove_noise(image: np.ndarray) -> np.ndarray:
    """Mild edge-preserving denoise."""
    return cv2.bilateralFilter(
        image,
        d=DENOISE_D,
        sigmaColor=DENOISE_SIGMA_COLOR,
        sigmaSpace=DENOISE_SIGMA_SPACE,
    )


def common_preprocess_pipeline(image_bgr: np.ndarray) -> np.ndarray:
    """EXIF applied at load; BGR throughout."""
    image = adjust_brightness_contrast(image_bgr)
    image = remove_noise(image)
    image = letterbox(image)
    return image
