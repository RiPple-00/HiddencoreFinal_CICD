"""InsightFace initialization and face detection."""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
from insightface.app import FaceAnalysis
from insightface.utils import face_align

import settings as S


@dataclass
class DetectedFace:
    bbox: list[float]  # x1,y1,x2,y2
    det_score: float
    embedding: np.ndarray | None = None
    kps: np.ndarray | None = None

    @property
    def area(self) -> float:
        x1, y1, x2, y2 = self.bbox
        return max(0.0, x2 - x1) * max(0.0, y2 - y1)


class FaceDetector:
    def __init__(self) -> None:
        self.app = FaceAnalysis(name=S.INSIGHTFACE_MODEL)
        self.app.prepare(
            ctx_id=S.INSIGHTFACE_CTX_ID,
            det_size=S.INSIGHTFACE_DET_SIZE,
        )

    def detect(self, image_bgr: np.ndarray) -> list[DetectedFace]:
        raw_faces = self.app.get(image_bgr)
        faces: list[DetectedFace] = []
        for f in raw_faces:
            x1, y1, x2, y2 = f.bbox.tolist()
            faces.append(
                DetectedFace(
                    bbox=[float(x1), float(y1), float(x2), float(y2)],
                    det_score=float(getattr(f, "det_score", 0.0)),
                    embedding=getattr(f, "embedding", None),
                    kps=getattr(f, "kps", None),
                )
            )
        faces.sort(key=lambda x: x.area, reverse=True)
        return faces

    @staticmethod
    def largest_face(faces: list[DetectedFace]) -> DetectedFace | None:
        return faces[0] if faces else None

    @staticmethod
    def align_crop(image_bgr: np.ndarray, face: DetectedFace) -> np.ndarray:
        if face.kps is not None:
            return face_align.norm_crop(image_bgr, landmark=face.kps, image_size=S.FACE_ALIGN_SIZE)
        x1, y1, x2, y2 = map(int, face.bbox)
        h, w = image_bgr.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        crop = image_bgr[y1:y2, x1:x2]
        if crop.size == 0:
            raise ValueError("empty face crop")
        return cv2.resize(crop, (S.FACE_ALIGN_SIZE, S.FACE_ALIGN_SIZE))

    @staticmethod
    def crop_bbox(image_bgr: np.ndarray, face: DetectedFace, pad: float = 0.1) -> np.ndarray:
        h, w = image_bgr.shape[:2]
        x1, y1, x2, y2 = face.bbox
        bw, bh = x2 - x1, y2 - y1
        x1 = max(0, int(x1 - bw * pad))
        y1 = max(0, int(y1 - bh * pad))
        x2 = min(w, int(x2 + bw * pad))
        y2 = min(h, int(y2 + bh * pad))
        crop = image_bgr[y1:y2, x1:x2]
        if crop.size == 0:
            raise ValueError("empty bbox crop")
        return crop

