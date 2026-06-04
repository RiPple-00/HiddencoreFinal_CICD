"""Build per-file descriptions for the project guide Excel."""

from __future__ import annotations

import ast
import re
from dataclasses import dataclass
from fnmatch import fnmatch
from pathlib import Path

import settings as CFG

ROOT = CFG.ROOT


@dataclass
class FileEntry:
    rel_path: str
    category: str
    extension: str
    size_kb: float
    summary: str
    why_needed: str
    preserve: str  # 보존 | 재생성 | 삭제가능 | Git무시


# --- Explicit descriptions for important paths (Korean) ---
KNOWN: dict[str, tuple[str, str, str]] = {
    "main.py": (
        "CLI 진입점. --step preprocess/build-patient-db/detect-faces/match/export-review/all",
        "파이프라인 단계를 한 줄 명령으로 실행",
        "보존",
    ),
    "pipeline.py": (
        "단계 오케스트레이션: run_preprocess, run_match, reset_regenerable_outputs",
        "main.py와 face/preprocessing 모듈 연결",
        "보존",
    ),
    "pipeline_legacy.py": (
        "구 YOLO person 검출 후 crop 영역에서 InsightFace 실행",
        "legacy-yolo 단계·예전 실험 재현",
        "보존",
    ),
    "settings.py": (
        "경로·SIMILARITY_THRESHOLD·InsightFace·전처리·PATIENT_IDS 중앙 설정",
        "모든 모듈이 동일 경로/임계값 참조",
        "보존",
    ),
    "schema.py": (
        "MATCHED/UNKNOWN/UNCERTAIN/LOW_CONFIDENCE/NO_FACE/FAILED 상태 상수",
        "CSV·JSON·코드 간 동일 상태 문자열",
        "보존",
    ),
    "export_excel.py": (
        "CSV→Excel export 래퍼. analysis_result.json 기반 구버전 엑셀도 지원",
        "엑셀만 다시 만들 때 실행",
        "보존",
    ),
    "requirements.txt": (
        "pip 의존성: opencv, insightface, pandas, openpyxl, ultralytics 등",
        "환경 재현",
        "보존",
    ),
    "README.md": (
        "프로젝트 소개·빠른 시작·단계 표",
        "온보딩 문서",
        "보존",
    ),
    "yolov8n.pt": (
        "Ultralytics YOLOv8 nano 가중치 (legacy-yolo 전용)",
        "pipeline_legacy.py person 검출",
        "보존",
    ),
    ".gitignore": (
        "Git 제외 규칙 (__pycache__, output, 대용량 이미지 등)",
        "저장소 오염 방지",
        "보존",
    ),
    "data/gallery_index.json": (
        "94장 갤러리 매핑: index, program_id, gallery_path, legacy_image_id",
        "숫자 파일명·GT·CSV·시각화 연결",
        "재생성",
    ),
    "data/face_db/build_log.json": (
        "환자 DB 빌드 시 사진별 성공/실패 로그",
        "등록 사진 품질 점검",
        "재생성",
    ),
    "data/labels/templates/label_template.json": (
        "GT JSON 작성용 빈 양식 (image_id, persons, patient_id_gt)",
        "라벨 파일 구조 통일",
        "보존",
    ),
    "data/labels/README.md": (
        "patient_id_gt 허용 값·라벨링 절차 요약",
        "라벨러 참고",
        "보존",
    ),
    "output/analysis_result.json": (
        "이미지 단위 유사도 결과 (persons, patient_scores, output_index)",
        "백엔드·eval·GT init 입력",
        "재생성",
    ),
    "output/face_similarity_results.json": (
        "얼굴 단위 flat JSON (match 단계)",
        "API·디버깅",
        "재생성",
    ),
}

KNOWN.update(
    {
        f"face/{name}": desc
        for name, desc in {
            "__init__.py": (
                "face 패키지. 검출·embedding·유사도·export",
                "모듈 import 경로",
                "보존",
            ),
            "detector.py": (
                "InsightFace buffalo_l 초기화·detect()·bbox/landmark",
                "환자·활동 사진 얼굴 위치 검출",
                "보존",
            ),
            "embedder.py": (
                "정렬 얼굴→512차원 embedding, l2_normalize",
                "유사도 비교용 벡터 생성",
                "보존",
            ),
            "patient_db.py": (
                "build_patient_database, load_representatives",
                "patients_preprocessed→face_db 대표 벡터",
                "보존",
            ),
            "activity.py": (
                "detect_activity_faces: gallery_preprocessed 순회, crop/align/emb 저장",
                "활동 사진 얼굴 검출 CSV 생성",
                "보존",
            ),
            "match.py": (
                "match_activity_faces: activity embedding vs face_db, analysis_result.json",
                "유사도 매칭 핵심",
                "보존",
            ),
            "similarity.py": (
                "cosine_similarity, rank_patients, decide_match (threshold/margin)",
                "환자 식별 판정 규칙",
                "보존",
            ),
            "visualize.py": (
                "visualize_matches: gallery·gallery_preprocessed에 bbox/라벨 PNG",
                "사람 눈으로 결과 확인",
                "보존",
            ),
            "review_exporter.py": (
                "export_similarity_reports: CSV·xlsx·상태별 분리",
                "match 결과 테이블 export",
                "보존",
            ),
            "excel_reports.py": (
                "유사도_라벨링.xlsx, 프로젝트_파일_가이드.xlsx 생성",
                "한글 라벨링·파일 가이드",
                "보존",
            ),
            "project_file_catalog.py": (
                "프로젝트 전체 파일 스캔·설명 자동 생성",
                "가이드 엑셀 전체파일목록 시트",
                "보존",
            ),
            "augment.py": (
                "mild_augment, augment_patient_dir (--augment 옵션)",
                "환자 DB 다양성 (기본 OFF)",
                "보존",
            ),
            "io_utils.py": (
                "load/save_image_bgr, iter_images, setup_logger, program_info_from_rel",
                "공통 I/O",
                "보존",
            ),
        }.items()
    }
)

KNOWN.update(
    {
        f"preprocessing/{name}": desc
        for name, desc in {
            "__init__.py": ("전처리 패키지", "import용", "보존"),
            "config.py": ("전처리 상수 (letterbox, CLAHE)", "transforms/runner 설정", "보존"),
            "transforms.py": (
                "EXIF·CLAHE·denoise·640 letterbox common_preprocess_pipeline",
                "검출 입력 품질 통일",
                "보존",
            ),
            "runner.py": (
                "preprocess_tree, preprocess_gallery_tree",
                "patients/gallery 일괄 전처리",
                "보존",
            ),
            "gallery_index.py": (
                "numeric_relpath, build_gallery_index, rename, migrate GT",
                "1~94 숫자 파일명·레거시 매핑",
                "보존",
            ),
        }.items()
    }
)

KNOWN.update(
    {
        f"labeling/{name}": desc
        for name, desc in {
            "__init__.py": ("라벨링·평가 패키지", "import용", "보존"),
            "constants.py": (
                "VALID_GT_LABELS, LABEL_PENDING/DONE",
                "GT 값 검증",
                "보존",
            ),
            "paths.py": (
                "GROUND_TRUTH_DIR, EVAL_* 경로",
                "eval 스크립트 경로",
                "보존",
            ),
            "gt_io.py": (
                "load/save_ground_truth, gt_path_for_image, iter_ground_truth_files",
                "GT JSON CRUD",
                "보존",
            ),
        }.items()
    }
)

SCRIPTS = {
    "preprocess_images.py": "preprocess 단계만 실행",
    "build_patient_db.py": "build-patient-db만 실행",
    "detect_activity_faces.py": "detect-faces만 실행",
    "export_review_csv.py": "export-review만 실행",
    "export_excel_reports.py": "유사도_라벨링·가이드 Excel 재생성",
    "eval_identity.py": "GT vs 예측 정확도·wrong_matches",
    "init_ground_truth.py": "analysis_result 기준 GT JSON 뼈대 생성",
    "rename_gallery_raw.py": "gallery 숫자 rename + GT migrate",
    "rename_gallery_preprocessed.py": "gallery_preprocessed 숫자 rename",
}
for name, why in SCRIPTS.items():
    KNOWN[f"scripts/{name}"] = (
        f"scripts/{name} CLI 래퍼",
        why,
        "보존",
    )

DOCS = {
    "pipeline_stages.md": "단계 0~6 로드맵·향후 프로그램 분류",
    "preprocessing_guide.md": "공통 전처리 1회·원본 보존 원칙",
    "similarity_threshold_guide.md": "threshold/margin·manual_label",
    "labeling_guide.md": "GT 작성·eval 규칙·상태 의미",
}
for name, summary in DOCS.items():
    KNOWN[f"docs/{name}"] = (summary, "운영·라벨링 문서", "보존")

SCHEMAS = {
    "analysis_result_v1.json": "analysis_result.json 필드 스키마",
    "face_similarity_v1.json": "얼굴 단위 유사도 JSON 스키마",
    "ground_truth_v1.json": "GT JSON 필드 스키마",
}
for name, summary in SCHEMAS.items():
    KNOWN[f"schemas/{name}"] = (summary, "백엔드·프론트 계약", "보존")


def _pycache_source(rel: str) -> str:
    name = Path(rel).name
    m = re.match(r"(.+)\.cpython-\d+\.pyc", name)
    if not m:
        return "?"
    stem = m.group(1)
    parent = Path(rel).parent.parent
    return str(parent / f"{stem}.py").replace("\\", "/")


def _summarize_python(path: Path) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return ""
    doc = ast.get_docstring(ast.parse(text))
    funcs = []
    classes = []
    for node in ast.walk(ast.parse(text)):
        if isinstance(node, ast.FunctionDef) and not node.name.startswith("_"):
            funcs.append(node.name)
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)
    parts = []
    if doc:
        parts.append(doc.split("\n")[0][:120])
    if classes:
        parts.append("class: " + ", ".join(classes[:8]))
    if funcs:
        parts.append("def: " + ", ".join(funcs[:12]))
    return " | ".join(parts) if parts else "Python 소스"


def _match_pattern(rel: str) -> FileEntry | None:
    p = rel.replace("\\", "/")
    ext = Path(p).suffix.lower()

    if "/__pycache__/" in p or p.startswith("__pycache__/"):
        src = _pycache_source(p)
        return FileEntry(
            rel_path=p,
            category="Python캐시",
            extension=ext,
            size_kb=0,
            summary=f"`{src}` 컴파일된 바이트코드 (.pyc)",
            why_needed="import 속도 향상. Python이 .py 실행 시 자동 생성",
            preserve="삭제가능(Git무시)",
        )

    if fnmatch(p, "data/gallery/.gitkeep"):
        return FileEntry(
            p, "데이터", ext, 0,
            "빈 gallery 폴더 Git 유지용 placeholder",
            "저장소에 빈 폴더 구조 보존",
            "보존",
        )

    if fnmatch(p, "data/gallery/*/*.png"):
        parts = Path(p).parts
        return FileEntry(
            p, "데이터(원본)", ext, 0,
            f"활동 프로그램 원본 사진 (폴더 {parts[-2]}, 전역번호는 gallery_index.json 참조)",
            "마스터 아카이브. 전처리·시각화 원본",
            "보존",
        )

    if fnmatch(p, "data/gallery_preprocessed/*/*.png"):
        return FileEntry(
            p, "데이터(전처리)", ext, 0,
            "활동 사진 640 letterbox 전처리본",
            "detect-faces 입력. match 파이프라인 필수",
            "재생성",
        )

    if fnmatch(p, "data/patients/patient_*/*"):
        return FileEntry(
            p, "데이터(원본)", ext, 0,
            "등록 환자 원본 얼굴 사진",
            "face_db 유일 원천",
            "보존",
        )

    if fnmatch(p, "data/patients_preprocessed/patient_*/*"):
        return FileEntry(
            p, "데이터(전처리)", ext, 0,
            "환자 사진 전처리본",
            "build-patient-db 입력",
            "재생성",
        )

    if fnmatch(p, "data/face_db/aligned_patients/patient_*/*"):
        return FileEntry(
            p, "중간산출물", ext, 0,
            "환자 등록 사진 112×112 정렬 얼굴",
            "DB 품질 확인·디버깅",
            "재생성",
        )

    if fnmatch(p, "data/face_db/embeddings/patient_*.npy"):
        return FileEntry(
            p, "중간산출물", ".npy", 0,
            "환자별 embedding 벡터 배열",
            "representatives 계산 전 단계",
            "재생성",
        )

    if p == "data/face_db/representatives/patient_representatives.npy":
        return FileEntry(
            p, "중간산출물", ".npy", 0,
            "환자 6명 대표 embedding (dict serialized)",
            "match 단계 유사도 비교 기준",
            "재생성",
        )

    if fnmatch(p, "data/activity_faces/crops/*/*"):
        return FileEntry(
            p, "중간산출물", ext, 0,
            "활동 사진에서 잘린 얼굴 bbox crop",
            "검수·재학습용 중간 결과",
            "재생성",
        )

    if fnmatch(p, "data/activity_faces/aligned/*/*_aligned.jpg"):
        return FileEntry(
            p, "중간산출물", ".jpg", 0,
            "112×112 정렬된 활동 얼굴",
            "embedding 추출 입력",
            "재생성",
        )

    if fnmatch(p, "data/activity_faces/aligned/*/*_emb.npy"):
        return FileEntry(
            p, "중간산출물", ".npy", 0,
            "활동 얼굴 embedding (match에서 로드)",
            "재검출 없이 유사도 계산",
            "재생성",
        )

    if fnmatch(p, "data/labels/ground_truth/*/*.json"):
        stem = Path(p).stem
        return FileEntry(
            p, "라벨(GT)", ".json", 0,
            f"사진 {stem}번 수동 정답 (image_id, persons[].patient_id_gt, label_status)",
            "eval_identity 정확도 측정 기준",
            "보존",
        )

    if fnmatch(p, "output/visualized/gallery/*.png"):
        n = Path(p).stem
        return FileEntry(
            p, "산출물(시각화)", ".png", 0,
            f"원본 갤러리 + 유사도 라벨 오버레이 (전역번호 {n})",
            "라벨링·검수용 눈으로 확인",
            "재생성",
        )

    if fnmatch(p, "output/visualized/gallery_preprocessed/*.png"):
        n = Path(p).stem
        return FileEntry(
            p, "산출물(시각화)", ".png", 0,
            f"전처리 갤러리 + bbox·라벨 (전역번호 {n})",
            "라벨링 시 output_index와 1:1 매칭",
            "재생성",
        )

    if fnmatch(p, "output/reports/*.csv"):
        name = Path(p).name
        descs = {
            "face_similarity_results.csv": "얼굴별 유사도·예측·P1~P6 점수 전체",
            "face_detection_results.csv": "검출 bbox·crop·embedding 경로",
            "manual_review_template.csv": "검수 필요 행만 (수동라벨 입력용)",
            "uncertain_faces.csv": "UNCERTAIN 상태만",
            "unknown_faces.csv": "UNKNOWN 상태만",
            "low_confidence_faces.csv": "LOW_CONFIDENCE·낮은 점수",
            "eval_identity_summary.csv": "GT 대비 정확도 요약",
            "wrong_matches.csv": "오매칭 목록",
        }
        if name.startswith("status_"):
            st = name.replace("status_", "").upper()
            return FileEntry(
                p, "산출물(CSV)", ".csv", 0,
                f"예측상태 {st} 행만 필터링한 CSV",
                "상태별 빠른 검수",
                "재생성",
            )
        if name in descs:
            return FileEntry(
                p, "산출물(CSV)", ".csv", 0,
                descs[name],
                "엑셀·스크립트·수동 검수 입력",
                "재생성",
            )
        return FileEntry(p, "산출물(CSV)", ".csv", 0, name, "파이프라인 리포트", "재생성")

    if fnmatch(p, "output/reports/*.xlsx"):
        name = Path(p).name
        xdesc = {
            "유사도_라벨링.xlsx": "한글 라벨링 시트·드롭다운·이미지별요약",
            "프로젝트_파일_가이드.xlsx": "전체 파일 목록·코드·캐시 설명 (본 파일)",
            "face_similarity_results.xlsx": "영문 시트 all/matched/unknown 등",
            "manual_review_template.xlsx": "검수 필요 행만",
            "eval_identity_report.xlsx": "평가 리포트 엑셀",
        }
        return FileEntry(
            p, "산출물(Excel)", ".xlsx", 0,
            xdesc.get(name, name),
            "사람 검수·문서화",
            "재생성",
        )

    if fnmatch(p, "output/logs/*.log"):
        return FileEntry(
            p, "산출물(로그)", ".log", 0,
            f"단계 실행 로그 ({Path(p).stem})",
            "오류·경고 추적",
            "재생성",
        )

    if fnmatch(p, "data/augmented/patients/patient_*/*"):
        return FileEntry(
            p, "데이터(증강)", ext, 0,
            "--augment 옵션 시 생성된 환자 증강 이미지",
            "face_db 다양성 (기본 미사용)",
            "재생성",
        )

    return None


def describe_file(path: Path) -> FileEntry:
    rel = path.relative_to(ROOT).as_posix()
    ext = path.suffix.lower()
    size_kb = round(path.stat().st_size / 1024, 2) if path.is_file() else 0

    if rel in KNOWN:
        summary, why, preserve = KNOWN[rel]
        cat = "코드" if ext == ".py" else "설정/문서"
        if ext == ".md":
            cat = "문서"
        elif ext == ".json" and rel.startswith("schemas/"):
            cat = "스키마"
        elif ext == ".json":
            cat = "데이터/설정"
        elif ext == ".pt":
            cat = "모델"
        return FileEntry(rel, cat, ext, size_kb, summary, why, preserve)

    matched = _match_pattern(rel)
    if matched:
        matched.size_kb = size_kb
        return matched

    if ext == ".py":
        summary = _summarize_python(path)
        return FileEntry(
            rel, "코드", ext, size_kb, summary,
            "Python 소스 모듈",
            "보존",
        )

    return FileEntry(
        rel,
        "기타",
        ext or "(없음)",
        size_kb,
        f"확장자 {ext} 파일",
        "프로젝트 데이터 또는 산출물",
        "재생성",
    )


def scan_project(root: Path | None = None) -> list[FileEntry]:
    root = root or ROOT
    entries: list[FileEntry] = []
    for path in sorted(root.rglob("*")):
        if path.is_file():
            entries.append(describe_file(path))
    return entries


def entries_to_rows(entries: list[FileEntry]) -> list[tuple]:
    header = (
        "상대경로",
        "분류",
        "확장자",
        "크기(KB)",
        "내용요약",
        "왜필요한가",
        "보존/삭제",
    )
    rows = [header]
    for e in entries:
        rows.append(
            (
                e.rel_path,
                e.category,
                e.extension,
                e.size_kb,
                e.summary,
                e.why_needed,
                e.preserve,
            )
        )
    return rows
