"""Optional mild augmentation for patient registration images."""

from __future__ import annotations

import random
from pathlib import Path

import cv2
import numpy as np

import settings as S
from face.io_utils import save_image_bgr


def mild_augment(image_bgr: np.ndarray, rng: random.Random) -> np.ndarray:
    out = image_bgr.copy()
    # brightness
    alpha = rng.uniform(0.9, 1.1)
    beta = rng.uniform(-10, 10)
    out = cv2.convertScaleAbs(out, alpha=alpha, beta=beta)
    # contrast (mild CLAHE)
    if rng.random() < 0.5:
        lab = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(4, 4))
        l = clahe.apply(l)
        out = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
    # rotation -7 ~ +7
    angle = rng.uniform(-7, 7)
    h, w = out.shape[:2]
    m = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    out = cv2.warpAffine(out, m, (w, h), borderMode=cv2.BORDER_REFLECT_101)
    # gaussian blur
    if rng.random() < 0.4:
        k = rng.choice([3, 5])
        out = cv2.GaussianBlur(out, (k, k), rng.uniform(0.3, 0.8))
    # noise
    if rng.random() < 0.4:
        noise = np.random.normal(0, rng.uniform(2, 6), out.shape).astype(np.float32)
        out = np.clip(out.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    # slight scale crop
    if rng.random() < 0.4:
        scale = rng.uniform(0.92, 0.98)
        nh, nw = int(h * scale), int(w * scale)
        resized = cv2.resize(out, (nw, nh), interpolation=cv2.INTER_LINEAR)
        canvas = np.zeros_like(out)
        y0 = (h - nh) // 2
        x0 = (w - nw) // 2
        canvas[y0 : y0 + nh, x0 : x0 + nw] = resized
        out = canvas
    if S.USE_FLIP_AUGMENTATION and rng.random() < 0.5:
        out = cv2.flip(out, 1)
    return out


def augment_patient_dir(
    src_dir: Path,
    dst_dir: Path,
    per_face: int | None = None,
    seed: int = 42,
) -> int:
    per_face = S.AUGMENT_PER_FACE if per_face is None else per_face
    rng = random.Random(seed)
    count = 0
    dst_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted(src_dir.glob("*")):
        if not src.is_file() or src.suffix.lower() not in S.IMAGE_EXTENSIONS:
            continue
        from face.io_utils import load_image_bgr

        try:
            img = load_image_bgr(src)
        except Exception:
            continue
        for i in range(per_face):
            aug = mild_augment(img, rng)
            out = dst_dir / f"{src.stem}_aug{i+1}{src.suffix}"
            save_image_bgr(out, aug)
            count += 1
    return count
