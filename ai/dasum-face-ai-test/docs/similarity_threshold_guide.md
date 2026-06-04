# 유사도 threshold / margin 가이드

설정 파일: `settings.py`

```python
SIMILARITY_THRESHOLD = 0.55   # top1 최소 유사도
SIMILARITY_MARGIN = 0.05      # top1 - top2 최소 격차
LOW_CONFIDENCE_THRESHOLD = 0.45
REVIEW_NEAR_THRESHOLD_GAP = 0.05
```

## 판정 규칙 (`face/similarity.py`)

| 조건 | status |
|------|--------|
| top1 ≥ threshold **且** gap ≥ margin | `MATCHED` |
| top1 ≥ threshold **且** gap < margin | `UNCERTAIN` |
| top1 < LOW_CONFIDENCE_THRESHOLD | `LOW_CONFIDENCE` |
| 그 외 | `UNKNOWN` |

## threshold vs margin

- **threshold**: “이 정도는 같은 사람 같다”는 절대 기준 (cosine similarity, L2-normalized embedding)
- **margin**: 1위와 2위가 비슷하면 **혼동** → `UNCERTAIN`으로 검수 대상

## 조정 방법

1. `settings.py` 값 수정
2. `python main.py --step match --overwrite` 재실행
3. `output/reports/uncertain_faces.csv`, `unknown_faces.csv` 검수
4. GT가 있으면 `python scripts/eval_identity.py`

## unknown / uncertain / no_face

- **NO_FACE**: 활동 사진에서 얼굴 미검출
- **UNKNOWN**: 얼굴은 있으나 환자 1~6 매칭 실패
- **UNCERTAIN**: threshold는 넘지만 2위와 격차가 작음
- **LOW_CONFIDENCE**: 유사도가 매우 낮음 → 검수 권장

## 검수 CSV

- `output/reports/manual_review_template.csv`
- `manual_label`: `patient_1`~`patient_6`, `unknown`, `ignore`

검수 후 승인된 aligned face는 `data/face_db/review_approved_candidates/`에 복사해 DB 재구축에 활용할 수 있습니다.
