"""Ground-truth label values for phase-2 identity evaluation."""

GT_SCHEMA_VERSION = "1.0.0"

# 정답 라벨 (라벨러가 입력)
# patient_1 .. patient_6 | unknown | no_face
VALID_PATIENT_LABELS = {f"patient_{i}" for i in range(1, 7)}
VALID_GT_LABELS = VALID_PATIENT_LABELS | {"unknown", "no_face"}

# 라벨 파일 작성 상태
LABEL_PENDING = "pending"
LABEL_DONE = "done"

# 설계안 ↔ 파이프라인 상태 매핑 (docs/labeling_guide.md 참고)
# NO_FACE  : person crop 안 얼굴 없음 → 설계상 unknown, A·B 스킵
# UNKNOWN  : 얼굴 있으나 환자 매칭 실패
# MATCHED  : 환자 식별 성공
