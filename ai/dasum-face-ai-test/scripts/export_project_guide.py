"""Regenerate project file guide Excel only."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from face.excel_reports import export_project_guide_workbook
from face.project_file_catalog import scan_project


def main() -> None:
    entries = scan_project()
    path = export_project_guide_workbook()
    print(f"[완료] 파일 {len(entries)}개 스캔")
    print(f"  -> {path}")
    print("시트: 전체파일목록, 코드파일_py, Python캐시_pyc, data폴더, output산출물, ...")


if __name__ == "__main__":
    main()
