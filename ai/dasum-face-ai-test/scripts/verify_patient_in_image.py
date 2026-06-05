"""업로드 사진 얼굴 인식: 전체 환자 목록 + 시연 대상(patient_6=기만경) 포함 여부. stdout JSON 1줄."""
from __future__ import annotations

import json
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import schema as S  # noqa: E402
import settings as CFG  # noqa: E402
from face.detector import FaceDetector  # noqa: E402
from face.embedder import FaceEmbedder  # noqa: E402
from face.io_utils import load_image_bgr  # noqa: E402
from face.patient_db import (  # noqa: E402
    _rep_path,
    build_patient_database,
    load_representatives,
)
from face.similarity import SimilarityResult, decide_match, rank_patients  # noqa: E402
from preprocessing.runner import preprocess_tree  # noqa: E402

PATIENT_DISPLAY_NAMES: dict[str, str] = {
    "patient_1": "나채영",
    "patient_2": "김영희",
    "patient_3": "강나연",
    "patient_4": "김태우",
    "patient_5": "장원준",
    "patient_6": "기만경",
}

DEMO_GUARDIAN_PATIENT_KEY = "patient_6"
DEMO_GUARDIAN_PATIENT_NAME = PATIENT_DISPLAY_NAMES[DEMO_GUARDIAN_PATIENT_KEY]


def ensure_representatives() -> dict:
    if _rep_path().is_file():
        return load_representatives()
    CFG.OUTPUT_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    CFG.OUTPUT_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    if not CFG.PATIENTS_PREPROCESSED_DIR.is_dir():
        preprocess_tree(CFG.PATIENTS_RAW_DIR, CFG.PATIENTS_PREPROCESSED_DIR)
    return build_patient_database()


def patient_sort_key(patient_key: str) -> int:
    if patient_key.startswith("patient_"):
        try:
            return int(patient_key.split("_", 1)[1])
        except ValueError:
            return 999
    return 999


def resolve_recognized_patient(result: SimilarityResult) -> str | None:
    """단체 사진에서 얼굴 1개당 대표 환자 키 (patient_1~6)."""
    if result.predicted_patient in PATIENT_DISPLAY_NAMES and result.status in (
        S.IDENTITY_MATCHED,
        S.IDENTITY_UNCERTAIN,
    ):
        return result.predicted_patient

    top1 = result.top1_patient
    if (
        top1 in PATIENT_DISPLAY_NAMES
        and result.top1_similarity >= CFG.LOW_CONFIDENCE_THRESHOLD
    ):
        return top1

    return None


def collect_detected_patients(all_faces: list[dict]) -> list[str]:
    keys: set[str] = set()
    for face in all_faces:
        patient_key = face.get("recognized_patient")
        if patient_key in PATIENT_DISPLAY_NAMES:
            keys.add(patient_key)
    return sorted(keys, key=patient_sort_key)


def format_patient_names(patient_keys: list[str]) -> list[str]:
    return [PATIENT_DISPLAY_NAMES[key] for key in patient_keys]


def build_result_message(
    *,
    accepted: bool,
    detected_keys: list[str],
    detected_names: list[str],
) -> str:
    if not detected_names:
        return (
            f"인식된 환자가 없습니다. {DEMO_GUARDIAN_PATIENT_NAME}이 보이는 사진을 올려 주세요."
        )

    listed = ", ".join(detected_names)
    if accepted:
        return (
            f"인식된 환자: {listed}. "
            f"{DEMO_GUARDIAN_PATIENT_NAME}이 포함되어 보호자 사진 기록에 등록합니다."
        )

    return (
        f"인식된 환자: {listed}. "
        f"{DEMO_GUARDIAN_PATIENT_NAME}이 없어 보호자 사진 기록에 등록되지 않습니다."
    )


def is_target_face(result, target: str, scores: dict[str, float]) -> bool:
    """단체 사진: 얼굴 중 하나라도 target(patient_6)이면 통과."""
    top1 = result.top1_patient
    top1_sim = result.top1_similarity
    target_sim = scores.get(target, 0.0)

    if top1 == target and top1_sim >= CFG.LOW_CONFIDENCE_THRESHOLD:
        return True

    if result.predicted_patient == target and result.status in (
        S.IDENTITY_MATCHED,
        S.IDENTITY_UNCERTAIN,
    ):
        return True

    if target_sim >= CFG.SIMILARITY_THRESHOLD and top1 == target:
        return True

    return False


def verify(image_path: str, target_patient: str = DEMO_GUARDIAN_PATIENT_KEY) -> dict:
    representatives = ensure_representatives()
    if target_patient not in representatives:
        return {
            "accepted": False,
            "reason": "TARGET_NOT_IN_DB",
            "message": f"환자 DB에 {target_patient} 정보가 없습니다.",
            "target_patient": target_patient,
            "target_patient_name": PATIENT_DISPLAY_NAMES.get(target_patient, target_patient),
            "faces_detected": 0,
            "detected_patients": [],
            "detected_patient_names": [],
            "patient_display_names": PATIENT_DISPLAY_NAMES,
        }

    image = load_image_bgr(image_path)
    detector = FaceDetector()
    embedder = FaceEmbedder(detector)
    faces = detector.detect(image)

    if not faces:
        return {
            "accepted": False,
            "reason": "NO_FACE",
            "message": (
                f"사진에서 얼굴을 찾을 수 없습니다. "
                f"{DEMO_GUARDIAN_PATIENT_NAME}이 보이는 사진을 올려 주세요."
            ),
            "target_patient": target_patient,
            "target_patient_name": PATIENT_DISPLAY_NAMES.get(target_patient, target_patient),
            "faces_detected": 0,
            "matched_faces": [],
            "detected_patients": [],
            "detected_patient_names": [],
            "patient_display_names": PATIENT_DISPLAY_NAMES,
        }

    matched_faces: list[dict] = []
    all_faces: list[dict] = []

    for index, face in enumerate(faces):
        try:
            embedding = embedder.from_detected_face(image, face)
            scores = rank_patients(embedding, representatives)
            result = decide_match(scores)
            recognized = resolve_recognized_patient(result)
            info = {
                "face_index": index,
                "predicted_patient": result.predicted_patient,
                "recognized_patient": recognized,
                "recognized_patient_name": (
                    PATIENT_DISPLAY_NAMES.get(recognized) if recognized else None
                ),
                "status": result.status,
                "top1_patient": result.top1_patient,
                "top1_similarity": result.top1_similarity,
                f"{target_patient}_similarity": round(scores.get(target_patient, 0.0), 4),
            }
            all_faces.append(info)
            if is_target_face(result, target_patient, scores):
                matched_faces.append(info)
        except Exception:
            continue

    accepted = len(matched_faces) > 0
    detected_keys = collect_detected_patients(all_faces)
    detected_names = format_patient_names(detected_keys)

    return {
        "accepted": accepted,
        "reason": "PATIENT_MATCHED" if accepted else "PATIENT_NOT_FOUND",
        "message": build_result_message(
            accepted=accepted,
            detected_keys=detected_keys,
            detected_names=detected_names,
        ),
        "target_patient": target_patient,
        "target_patient_name": PATIENT_DISPLAY_NAMES.get(target_patient, target_patient),
        "faces_detected": len(faces),
        "matched_faces": matched_faces,
        "all_faces": all_faces,
        "detected_patients": detected_keys,
        "detected_patient_names": detected_names,
        "patient_display_names": PATIENT_DISPLAY_NAMES,
    }


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if len(sys.argv) < 2:
        print(json.dumps({"accepted": False, "error": "image_path required"}, ensure_ascii=False))
        sys.exit(1)
    target = sys.argv[2] if len(sys.argv) > 2 else DEMO_GUARDIAN_PATIENT_KEY
    result = verify(sys.argv[1], target)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
