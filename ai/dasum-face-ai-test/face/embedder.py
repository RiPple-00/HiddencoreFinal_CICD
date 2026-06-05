"""Face embedding extraction and normalization."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from face.detector import FaceDetector
from face.io_utils import load_image_bgr


def l2_normalize(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm


class FaceEmbedder:
    def __init__(self, detector: FaceDetector | None = None) -> None:
        self.detector = detector or FaceDetector()

    def from_aligned_image(self, aligned_bgr: np.ndarray) -> np.ndarray:
        faces = self.detector.detect(aligned_bgr)
        if faces and faces[0].embedding is not None:
            return l2_normalize(np.asarray(faces[0].embedding, dtype=np.float32))
        # 112x112 aligned crop: pad then re-detect
        import cv2

        h, w = aligned_bgr.shape[:2]
        pad = max(64, 112 - min(h, w))
        padded = cv2.copyMakeBorder(
            aligned_bgr, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(128, 128, 128)
        )
        faces = self.detector.detect(padded)
        if faces and faces[0].embedding is not None:
            return l2_normalize(np.asarray(faces[0].embedding, dtype=np.float32))
        raise ValueError("aligned image에서 embedding 추출 실패")

    def from_image_path(self, path: Path | str) -> np.ndarray:
        image = load_image_bgr(path)
        faces = self.detector.detect(image)
        face = FaceDetector.largest_face(faces)
        if face is None or face.embedding is None:
            raise ValueError(f"얼굴 embedding 없음: {path}")
        return l2_normalize(np.asarray(face.embedding, dtype=np.float32))

    def from_detected_face(self, image_bgr: np.ndarray, face) -> np.ndarray:
        if face.embedding is not None:
            return l2_normalize(np.asarray(face.embedding, dtype=np.float32))
        aligned = FaceDetector.align_crop(image_bgr, face)
        return self.from_aligned_image(aligned)
