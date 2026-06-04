# 파이프라인 단계

| 단계 | 내용 | 산출물 |
|------|------|--------|
| 0 | 공통 전처리 (1회) | `gallery_preprocessed`, `patients_preprocessed` |
| 1 | 환자 face DB | `face_db/embeddings`, `representatives` |
| 2 | 활동 사진 얼굴 검출 | `activity_faces/crops`, `aligned` |
| 3 | 유사도 매칭 + 검수 CSV | `output/reports/*` |
| 4 | GT 라벨링 + eval | `ground_truth`, `eval_identity_summary.csv` |
| 5 | (향후) 프로그램 분류 | `program_id` 활용 |
| 6 | (향후) 백엔드 GALLERYCARD | API |

## 명령

```bash
python main.py --step preprocess
python main.py --step build-patient-db
python main.py --step detect-faces
python main.py --step match
python scripts/eval_identity.py
```

## 프로그램 연결 (향후)

`program_id` / `program_label` (origami, drawing, dance)는 검출·유사도 CSV에 이미 포함됩니다.  
추후 프로그램 분류 모델은 **동일한 `gallery_preprocessed`** 를 입력으로 사용하면 됩니다.
