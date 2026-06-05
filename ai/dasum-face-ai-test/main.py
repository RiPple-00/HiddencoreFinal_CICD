"""Ddasum face similarity pipeline — stepwise entry point."""

import argparse
import sys


STEPS = (
    "preprocess",
    "build-patient-db",
    "detect-faces",
    "match",
    "export-review",
    "all",
    "legacy-yolo",  # optional old YOLO+person path
)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Ddasum activity photo patient face similarity pipeline"
    )
    parser.add_argument(
        "--step",
        choices=STEPS,
        default="all",
        help="실행 단계 (독립 실행 가능)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="재생성 가능 산출물 덮어쓰기",
    )
    parser.add_argument(
        "--augment",
        action="store_true",
        help="환자 DB 생성 시 mild augmentation 사용 (기본: 비활성)",
    )
    parser.add_argument(
        "--use-raw",
        action="store_true",
        help="legacy-yolo 단계에서만: 원본 이미지 사용",
    )
    args = parser.parse_args()

    import pipeline as P

    if args.step == "preprocess":
        n = P.run_preprocess(overwrite=args.overwrite)
        print(f"[완료] 공통 전처리 {n}장")
    elif args.step == "build-patient-db":
        reps = P.run_build_patient_db(
            overwrite=args.overwrite,
            use_augmentation=args.augment if args.augment else None,
        )
        print(f"[완료] 환자 DB: {list(reps.keys())}")
    elif args.step == "detect-faces":
        df = P.run_detect_faces(overwrite=args.overwrite)
        print(f"[완료] 얼굴 검출 {len(df)}행")
    elif args.step == "match":
        df, _ = P.run_match(overwrite=args.overwrite)
        print(f"[완료] 유사도 매칭 {len(df)}행")
        print(f"  JSON: output/analysis_result.json")
        print(f"  CSV:  output/reports/face_similarity_results.csv")
        print(f"  Excel (라벨링): output/reports/유사도_라벨링.xlsx")
        print(f"  Excel (가이드): output/reports/프로젝트_파일_가이드.xlsx")
    elif args.step == "export-review":
        paths = P.run_export_review()
        for k, v in paths.items():
            print(f"  {k}: {v}")
    elif args.step == "all":
        df, _ = P.run_all(
            overwrite=args.overwrite,
            use_augmentation=True if args.augment else None,
        )
        print(f"[완료] 전체 파이프라인 완료, 얼굴 {len(df)}행")
    elif args.step == "legacy-yolo":
        _run_legacy_yolo(use_raw=args.use_raw)


def _run_legacy_yolo(use_raw: bool = False) -> None:
    import os

    if use_raw:
        os.environ["USE_RAW"] = "1"
    from pipeline_legacy import (
        analyze_gallery,
        build_patient_embeddings,
        init_face_model,
        init_person_detector,
        save_result,
    )

    detector = init_person_detector()
    app = init_face_model()
    patient_embeddings = build_patient_embeddings(app)
    if not patient_embeddings:
        print("[종료] 환자 임베딩 없음")
        sys.exit(1)
    result = analyze_gallery(detector, app, patient_embeddings)
    print(save_result(result))


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(e, file=sys.stderr)
        sys.exit(1)
