from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
GALLERY_DIR = DATA_DIR / "gallery"
LABELS_DIR = DATA_DIR / "labels"
GROUND_TRUTH_DIR = LABELS_DIR / "ground_truth"
TEMPLATES_DIR = LABELS_DIR / "templates"
OUTPUT_DIR = ROOT / "output"
OUTPUT_REPORTS_DIR = OUTPUT_DIR / "reports"
ANALYSIS_RESULT_PATH = OUTPUT_DIR / "analysis_result.json"
FACE_SIMILARITY_CSV = OUTPUT_REPORTS_DIR / "face_similarity_results.csv"
EVAL_SUMMARY_CSV = OUTPUT_REPORTS_DIR / "eval_identity_summary.csv"
EVAL_WRONG_MATCHES_CSV = OUTPUT_REPORTS_DIR / "wrong_matches.csv"
EVAL_REPORT_JSON = OUTPUT_DIR / "eval_identity_report.json"
EVAL_REPORT_XLSX = OUTPUT_DIR / "eval_identity_report.xlsx"
