"""Generate Korean labeling Excel + project guide (no pipeline re-run)."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import pandas as pd

import settings as CFG
from face.excel_reports import export_all_excel_reports, export_project_guide_workbook
from face.review_exporter import export_similarity_reports


def main() -> None:
    csv_path = CFG.OUTPUT_REPORTS_DIR / "face_similarity_results.csv"
    if not csv_path.is_file():
        print(f"[오류] 없음: {csv_path}")
        print("먼저: python main.py --step match")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    paths = export_similarity_reports(df)
    print("[완료] Excel / CSV 리포트:")
    for k, v in sorted(paths.items()):
        print(f"  {k}")
        print(f"    -> {v}")

    guide = export_project_guide_workbook()
    print(f"\n[참고] 프로젝트 가이드만 다시 만들기: {guide}")


if __name__ == "__main__":
    main()
