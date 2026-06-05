"""Legacy YOLO person + InsightFace in crop (optional)."""

import glob
import json
import os
from datetime import datetime, timezone

import cv2
import numpy as np
from insightface.app import FaceAnalysis
from ultralytics import YOLO

import schema as S

OUTPUT_DIR = "output"
USE_PREPROCESSED = os.environ.get("USE_RAW", "").lower() not in ("1", "true", "yes")
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".jfif", ".bmp")

import settings as CFG

PATIENTS_DIR = str(
    CFG.PATIENTS_PREPROCESSED_DIR
    if USE_PREPROCESSED
    else CFG.PATIENTS_RAW_DIR
)
GALLERY_DIR = str(
    CFG.GALLERY_PREPROCESSED_DIR if USE_PREPROCESSED else CFG.GALLERY_RAW_DIR
)

SIMILARITY_THRESHOLD = CFG.SIMILARITY_THRESHOLD
YOLO_MODEL = CFG.YOLO_MODEL
YOLO_PERSON_CLASS = 0
PERSON_CONF_THRESHOLD = CFG.PERSON_CONF_THRESHOLD
PERSON_CROP_PADDING = 0.05


def l2_normalize(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    return vector / norm if norm else vector


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(l2_normalize(a), l2_normalize(b)))


def load_image(image_path: str) -> np.ndarray:
    data = np.fromfile(image_path, dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"이미지를 읽을 수 없습니다: {image_path}")
    return image


def init_face_model() -> FaceAnalysis:
    app = FaceAnalysis(name=CFG.INSIGHTFACE_MODEL)
    app.prepare(ctx_id=CFG.INSIGHTFACE_CTX_ID, det_size=CFG.INSIGHTFACE_DET_SIZE)
    return app


def init_person_detector() -> YOLO:
    return YOLO(YOLO_MODEL)


def build_patient_embeddings(app: FaceAnalysis) -> dict[str, np.ndarray]:
    from face.embedder import l2_normalize as l2n

    patient_embeddings = {}
    for patient_id in sorted(os.listdir(PATIENTS_DIR)):
        patient_path = os.path.join(PATIENTS_DIR, patient_id)
        if not os.path.isdir(patient_path):
            continue
        embeddings = []
        for filename in sorted(os.listdir(patient_path)):
            if not filename.lower().endswith(IMAGE_EXTENSIONS):
                continue
            image_path = os.path.join(patient_path, filename)
            image = load_image(image_path)
            faces = app.get(image)
            if not faces:
                continue
            face = max(
                faces,
                key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
            )
            embeddings.append(l2n(face.embedding))
        if embeddings:
            patient_embeddings[patient_id] = l2n(np.mean(embeddings, axis=0))
    return patient_embeddings


def identify_face(face_embedding: np.ndarray, patient_embeddings: dict) -> dict:
    scores = {
        pid: round(cosine_similarity(face_embedding, pe), 4)
        for pid, pe in patient_embeddings.items()
    }
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top1, s1 = ranked[0]
    status = S.IDENTITY_MATCHED if s1 >= SIMILARITY_THRESHOLD else S.IDENTITY_UNKNOWN
    return {
        "patient_id": top1 if status == S.IDENTITY_MATCHED else None,
        "similarity": s1,
        "identity_status": status,
        "patient_scores": scores,
    }


def detect_persons(detector, image):
    results = detector.predict(
        image, classes=[YOLO_PERSON_CLASS], conf=PERSON_CONF_THRESHOLD, verbose=False
    )
    persons = []
    if not results or results[0].boxes is None:
        return persons
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        persons.append(
            {
                "person_bbox": [round(v, 1) for v in (x1, y1, x2, y2)],
                "person_confidence": round(float(box.conf[0]), 4),
            }
        )
    return persons


def analyze_gallery(detector, app, patient_embeddings):
    images = []
    for root, _, files in os.walk(GALLERY_DIR):
        for filename in sorted(files):
            if not filename.lower().endswith(IMAGE_EXTENSIONS):
                continue
            rel = os.path.relpath(os.path.join(root, filename), GALLERY_DIR).replace(
                "\\", "/"
            )
            images.append((rel, os.path.join(root, filename)))
    out = []
    for idx, (rel, path) in enumerate(images, start=1):
        image = load_image(path)
        persons = detect_persons(detector, image)
        person_results = []
        for i, p in enumerate(persons, start=1):
            x1, y1, x2, y2 = p["person_bbox"]
            crop = image[int(y1) : int(y2), int(x1) : int(x2)]
            faces = app.get(crop) if crop.size else []
            if not faces:
                person_results.append(
                    {
                        "person_index": i,
                        "identity_status": S.IDENTITY_NO_FACE,
                        "patient_id": None,
                        "similarity": None,
                        "patient_scores": None,
                    }
                )
            else:
                face = max(
                    faces,
                    key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
                )
                m = identify_face(l2_normalize(face.embedding), patient_embeddings)
                person_results.append({"person_index": i, **m})
        out.append(
            {
                "output_index": idx,
                "image_id": rel,
                "person_count": len(persons),
                "persons": person_results,
            }
        )
    return {
        "schema_version": S.SCHEMA_VERSION,
        "pipeline_stage": "legacy_yolo",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "images": out,
    }


def save_result(result: dict, filename: str = "analysis_result.json") -> str:
    path = os.path.join(OUTPUT_DIR, filename)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    return path
