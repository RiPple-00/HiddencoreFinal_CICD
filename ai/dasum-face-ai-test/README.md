# dasum-face-ai-test

요양시설 프로그램 활동 사진 — **InsightFace embedding 기반 환자 유사도** POC

## 빠른 시작

```bash
pip install -r requirements.txt
python main.py --step all --overwrite
```

## 실행 단계

| 단계 | 명령 | 산출물 |
|------|------|--------|
| 공통 전처리 | `--step preprocess` | `data/*_preprocessed/` |
| 환자 DB | `--step build-patient-db` | `data/face_db/` |
| 활동 얼굴 검출 | `--step detect-faces` | `data/activity_faces/` |
| 유사도 매칭 | `--step match` | `output/reports/*.csv`, `output/visualized/` |
| 검수 export | `--step export-review` | uncertain/unknown/low_conf CSV |
| Excel (라벨링) | `python scripts/export_excel_reports.py` | `유사도_라벨링.xlsx`, `프로젝트_파일_가이드.xlsx` |

## 데이터 보존

| 유지 (덮어쓰지 않음) | 재생성 가능 |
|---------------------|-------------|
| `data/patients/`, `data/gallery/` | `*_preprocessed/` |
| `data/labels/ground_truth/` | `activity_faces/`, `face_db/` |
| | `output/` |

## 설정

`settings.py` — threshold, margin, augmentation 플래그

```python
SIMILARITY_THRESHOLD = 0.55
SIMILARITY_MARGIN = 0.05
USE_FACE_AUGMENTATION = False  # 기본 비활성
```

증강 사용: `python main.py --step build-patient-db --augment`

## 문서

- `docs/preprocessing_guide.md` — 공통 전처리 1회
- `docs/similarity_threshold_guide.md` — threshold/margin
- `docs/labeling_guide.md` — GT 라벨
- `docs/pipeline_stages.md` — 로드맵

## Excel 라벨링

`match` 또는 `export-review` 실행 시 자동 생성됩니다.

| 파일 | 용도 |
|------|------|
| `output/reports/유사도_라벨링.xlsx` | **라벨링_작성** 시트: P1~P6 유사도, `수동라벨_입력` 드롭다운 |
| `output/reports/프로젝트_파일_가이드.xlsx` | **전체 파일 목록** (코드·캐시·data·output 전부) |

```bash
python scripts/export_excel_reports.py   # CSV만 있을 때 Excel만 재생성
python scripts/export_project_guide.py   # 파일 가이드 Excel만 재생성
python export_excel.py                   # 동일
```

`프로젝트_파일_가이드.xlsx` 시트: **전체파일목록**(1716+행), **Python캐시_pyc**, **코드파일_py**, **data폴더**, **읽는법**  
(파일이 Excel에서 열려 있으면 `프로젝트_파일_가이드_new.xlsx`로 저장됨)

`시각화파일` 열(`output/visualized/gallery_preprocessed/N.png`)과 나란히 보며 `수동라벨_입력`을 채웁니다.

## 평가

```bash
python scripts/eval_identity.py
```

## Legacy

구 YOLO person + crop 방식: `python main.py --step legacy-yolo`
