"""Re-export review CSV/Excel from existing similarity results."""

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import settings as S
from face.review_exporter import export_similarity_reports


def main() -> None:
    csv_path = S.OUTPUT_REPORTS_DIR / "face_similarity_results.csv"
    if not csv_path.is_file():
        print(f"[ERROR] {csv_path} 없음. 먼저 --step match")
        sys.exit(1)
    df = pd.read_csv(csv_path)
    paths = export_similarity_reports(df)
    for k, v in paths.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    main()
