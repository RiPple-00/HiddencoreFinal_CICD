"""Schema constants for analysis output and design mapping."""

SCHEMA_VERSION = "1.0.0"
PIPELINE_STAGE = "identity_face_similarity"

# --- Pipeline identity_status (자동 예측) ---
IDENTITY_NO_FACE = "NO_FACE"
IDENTITY_MATCHED = "MATCHED"
IDENTITY_UNKNOWN = "UNKNOWN"
IDENTITY_UNCERTAIN = "UNCERTAIN"
IDENTITY_LOW_CONFIDENCE = "LOW_CONFIDENCE"
IDENTITY_FAILED = "FAILED"

# Backward-compatible aliases (기존 코드)
IDENTITY_MATCHED_ALIAS = IDENTITY_MATCHED

# --- Ground-truth patient_id_gt (수동 라벨) ---
# patient_1 .. patient_6 | "unknown" | "no_face"
# manual_review: patient_1..6 | unknown | ignore
