# Labels (Phase 2)

## 폴더 구조

```
data/labels/
├── templates/
│   └── label_template.json
└── ground_truth/             # 갤러리 경로와 동일한 트리
    ├── 1/
    │   └── origami_1.json
    ├── 2/
    │   └── drawing_5.json
    └── 3/
        └── dance_1.json
```

- 갤러리 `data/gallery/2/drawing_5.png`
  → 정답 `data/labels/ground_truth/2/drawing_5.json`

## 라벨 값 (`patient_id_gt`)

| 값 | 의미 |
|----|------|
| `patient_1` ~ `patient_6` | 해당 환자로 확인 |
| `unknown` | 사람은 보이나 환자 1~6 중 누구인지 모름 |
| `no_face` | person 박스 안에 식별 가능한 얼굴 없음 |
| `null` | **아직 미작성** (평가에서 제외) |

작성 완료 시 `"label_status": "done"` 으로 변경.

## 워크플로

1. `python scripts/preprocess_images.py` — (필요 시) 전처리
2. `python main.py` — 분석
3. `python scripts/init_ground_truth.py` — 라벨 뼈대 생성
4. `output/1.png`, `2.png`, … 보면서 JSON의 `patient_id_gt` 입력 (`output_index`로 매칭)
5. `python scripts/eval_identity.py` — 정확도 리포트

자세한 규칙: `docs/labeling_guide.md`
