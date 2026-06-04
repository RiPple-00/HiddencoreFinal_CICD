# 공통 전처리 가이드

## 왜 한 번만 하는가

`data/gallery`와 `data/patients` 원본은 **사람이 관리하는 마스터 데이터**입니다.  
모델 입력을 안정화하기 위한 밝기·노이즈·letterbox(640×640)는 **공통 전처리**로 한 번만 적용하고,  
`gallery_preprocessed` / `patients_preprocessed`를 이후 모든 단계의 입력으로 사용합니다.

프로그램 분류(종이접기/그리기/춤)용으로 전처리를 **다시 하지 않습니다.**

## 공통 전처리 vs 얼굴 후처리

| 단계 | 입력 | 출력 | 내용 |
|------|------|------|------|
| 공통 전처리 | `data/gallery`, `data/patients` | `*_preprocessed` | EXIF, mild CLAHE, denoise, 640 letterbox |
| 얼굴 후처리 | `*_preprocessed` | `activity_faces/`, `face_db/` | InsightFace 검출, crop, align 112×112, embedding |

공통 전처리에서 **얼굴 crop·배경 제거·강한 회전**을 하지 않습니다.

## 실행

```bash
python main.py --step preprocess
# 또는
python scripts/preprocess_images.py --overwrite
```

## 재생성

`--overwrite` 시 `*_preprocessed`만 삭제 후 재생성합니다. **원본은 건드리지 않습니다.**
