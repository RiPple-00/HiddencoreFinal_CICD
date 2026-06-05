# 라벨링 가이드 (2단계: 환자 식별 GT)

## 목적

자동 파이프라인(YOLO person → InsightFace)이 **얼마나 맞는지** 측정하기 위해,  
사람(person) 단위로 **정답 환자 ID**를 수동으로 기록합니다.

> Action(행동) 라벨은 **4단계**에서 `data/labels/action/` 등으로 확장 예정입니다.

---

## 설계안과 상태 코드 매핑

| 파이프라인 `identity_status` | 설계안 의미 |
|------------------------------|-------------|
| `NO_FACE` | person 안 얼굴 없음 → **unknown**, A·B 스킵 |
| `UNKNOWN` | 얼굴 있으나 환자 1~6 매칭 실패 |
| `MATCHED` | 환자 식별 성공 (`patient_id` 있음) |

라벨 파일의 `patient_id_gt`는 **사람이 본 정답**입니다.

| `patient_id_gt` | 예측과 비교 시 |
|-----------------|----------------|
| `patient_N` | `MATCHED` 이고 `patient_id == patient_N` 이면 정답 |
| `unknown` | `UNKNOWN` 이면 정답 (얼굴은 있는데 모르는 경우) |
| `no_face` | `NO_FACE` 이면 정답 |

---

## 라벨링 절차

### 1) 뼈대 파일 생성

```bash
python scripts/init_ground_truth.py
```

- `output/analysis_result.json` 기준으로 `data/labels/ground_truth/**/*.json` 생성
- `person_index`, `person_bbox`는 자동 복사, `patient_id_gt`는 `null`

### 2) 시각 확인

- 시각화 이미지: `output/1.png`, `output/2.png`, … (갤러리 순서와 `analysis_result.json`의 `output_index` 대응)
- 예: `output_index: 5` → `image_id`로 원본 경로 확인 (예: `2/drawing_5.png`)
- 주황 박스 = person, 초록 박스 = face

### 3) JSON 작성

`data/labels/ground_truth/2/drawing_5.json` 예:

```json
{
  "schema_version": "1.0.0",
  "image_id": "2/drawing_5.png",
  "is_background": false,
  "label_status": "done",
  "labeled_at": "2026-05-27T12:00:00+09:00",
  "labeled_by": "홍길동",
  "persons": [
    {
      "person_index": 1,
      "person_bbox": [ ... ],
      "patient_id_gt": "patient_1",
      "notes": "왼쪽 회색머리 여성"
    },
    {
      "person_index": 2,
      "patient_id_gt": "patient_4",
      "notes": "가운데 금발"
    },
    {
      "person_index": 3,
      "patient_id_gt": "no_face",
      "notes": "등만 보임"
    }
  ]
}
```

### 4) 배경 사진

YOLO person 0명인 경우:

```json
{
  "image_id": "...",
  "is_background": true,
  "label_status": "done",
  "persons": []
}
```

---

## 주의사항

1. **person_index**는 분석 결과와 동일하게 유지 (재분석 후 바뀌면 `init_ground_truth.py --force`로 갱신).
2. **여러 명**이면 person마다 각각 `patient_id_gt` 입력.
3. 애매하면 `unknown` — 억지로 patient_N 붙이지 않기.
4. 환자 등록 사진(`data/patients/`)과 실제 인물이 다르면 GT는 **실제 인물 기준**으로 적기.

---

## 평가 실행

```bash
python scripts/eval_identity.py
```

- `output/eval_identity_report.json`
- `output/eval_identity_report.xlsx`

`label_status: done` 이고 `patient_id_gt` 가 채워진 항목만 집계합니다.
