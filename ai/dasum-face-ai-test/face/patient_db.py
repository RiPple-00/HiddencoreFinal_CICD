"""Build and load patient face embedding database."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

import settings as S
from face.augment import augment_patient_dir
from face.detector import FaceDetector
from face.embedder import FaceEmbedder, l2_normalize
from face.io_utils import iter_images, load_image_bgr, save_image_bgr, setup_logger


def _rep_path() -> Path:
    return S.FACE_DB_REPRESENTATIVES / "patient_representatives.npy"


def load_representatives() -> dict[str, np.ndarray]:
    path = _rep_path()
    if not path.is_file():
        raise FileNotFoundError(
            f"환자 대표 embedding 없음: {path}\n"
            "먼저 실행: python main.py --step build-patient-db"
        )
    data = np.load(path, allow_pickle=True).item()
    return {k: np.asarray(v, dtype=np.float32) for k, v in data.items()}


def save_representatives(reps: dict[str, np.ndarray]) -> Path:
    S.FACE_DB_REPRESENTATIVES.mkdir(parents=True, exist_ok=True)
    path = _rep_path()
    np.save(path, reps)
    return path


def build_patient_database(
    overwrite: bool = False,
    use_augmentation: bool | None = None,
) -> dict[str, np.ndarray]:
    use_aug = S.USE_FACE_AUGMENTATION if use_augmentation is None else use_augmentation
    log = setup_logger("build_patient_db", S.OUTPUT_LOGS_DIR / "build_patient_db.log")

    if not S.PATIENTS_PREPROCESSED_DIR.is_dir():
        raise FileNotFoundError(
            f"전처리 환자 폴더 없음: {S.PATIENTS_PREPROCESSED_DIR}\n"
            "먼저: python main.py --step preprocess"
        )

    detector = FaceDetector()
    embedder = FaceEmbedder(detector)
    representatives: dict[str, np.ndarray] = {}
    build_log: list[dict] = []

    for patient_id in S.PATIENT_IDS:
        src_dir = S.PATIENTS_PREPROCESSED_DIR / patient_id
        if not src_dir.is_dir():
            log.warning("%s folder missing", patient_id)
            continue

        aligned_dir = S.FACE_DB_ALIGNED_PATIENTS / patient_id
        emb_path = S.FACE_DB_EMBEDDINGS / f"{patient_id}.npy"

        if overwrite and aligned_dir.exists():
            for p in aligned_dir.glob("*"):
                if p.is_file():
                    p.unlink()

        sources: list[Path] = []
        for _, p in iter_images(src_dir):
            sources.append(p)

        if use_aug:
            aug_dir = S.AUGMENTED_DIR / patient_id
            if overwrite and aug_dir.exists():
                for p in aug_dir.glob("*"):
                    if p.is_file():
                        p.unlink()
            n_aug = augment_patient_dir(src_dir, aug_dir, per_face=S.AUGMENT_PER_FACE)
            log.info("%s augmented %d images", patient_id, n_aug)
            for _, p in iter_images(aug_dir):
                sources.append(p)

        embeddings: list[np.ndarray] = []
        aligned_dir.mkdir(parents=True, exist_ok=True)

        for src_path in sources:
            try:
                image = load_image_bgr(src_path)
            except Exception as e:
                log.warning("load fail %s: %s", src_path, e)
                build_log.append(
                    {"patient_id": patient_id, "source": str(src_path), "status": "load_fail"}
                )
                continue

            faces = detector.detect(image)
            face = FaceDetector.largest_face(faces)
            if face is None:
                log.warning("no face: %s", src_path)
                build_log.append(
                    {"patient_id": patient_id, "source": str(src_path), "status": "no_face"}
                )
                continue

            if len(faces) > 1:
                log.warning("multiple faces, using largest: %s", src_path)

            try:
                aligned = FaceDetector.align_crop(image, face)
                emb = embedder.from_detected_face(image, face)
            except Exception as e:
                log.warning("embed fail %s: %s", src_path, e)
                build_log.append(
                    {"patient_id": patient_id, "source": str(src_path), "status": "embed_fail"}
                )
                continue

            stem = src_path.stem
            if src_path.parent.name == patient_id:
                out_aligned = aligned_dir / f"{stem}_aligned.jpg"
            else:
                out_aligned = aligned_dir / f"{src_path.parent.name}_{stem}_aligned.jpg"

            save_image_bgr(out_aligned, aligned)
            embeddings.append(emb)
            build_log.append(
                {
                    "patient_id": patient_id,
                    "source": str(src_path),
                    "aligned_face": str(out_aligned),
                    "bbox": face.bbox,
                    "det_score": face.det_score,
                    "status": "ok",
                }
            )
            log.info("[등록] %s <- %s", patient_id, src_path.name)

        S.FACE_DB_EMBEDDINGS.mkdir(parents=True, exist_ok=True)
        if embeddings:
            np.save(emb_path, np.stack(embeddings, axis=0))
            rep = l2_normalize(np.mean(embeddings, axis=0))
            representatives[patient_id] = rep
            log.info("[완료] %s: %d embeddings", patient_id, len(embeddings))
        else:
            log.error("[ERROR] %s: no valid embeddings", patient_id)
            build_log.append({"patient_id": patient_id, "status": "no_valid_embeddings"})

        n = len(embeddings)
        if n == 0:
            log.warning("%s has no valid embeddings.", patient_id)
        elif n < S.MIN_VALID_EMBEDDINGS_WARN:
            log.warning("%s has only %d valid embeddings.", patient_id, n)

    save_representatives(representatives)

    log_path = S.FACE_DB_DIR / "build_log.json"
    log_path.write_text(json.dumps(build_log, ensure_ascii=False, indent=2), encoding="utf-8")
    pd.DataFrame(build_log).to_csv(S.OUTPUT_REPORTS_DIR / "patient_db_build.csv", index=False)

    return representatives
