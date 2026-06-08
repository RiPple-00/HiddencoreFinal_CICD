"""로컬 MySQL 접속 정보 (Git 제외 파일·환경 변수). 스크립트 실행용."""
import os
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent


def _parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def mysql_connect_kwargs() -> dict[str, str]:
    """
    우선순위:
    1) 환경 변수 MYSQL_*
    2) backend/scripts/local_db.env (gitignore, 본인 비번)
    3) 로컬 개발 기본값 (application-local.yml 과 동일한 데모 비번)
    """
    file_values = _parse_env_file(_SCRIPT_DIR / "local_db.env")

    password = (
        os.environ.get("MYSQL_PASSWORD", "").strip()
        or file_values.get("MYSQL_PASSWORD", "").strip()
        or "12345"
    )

    return {
        "host": os.environ.get("MYSQL_HOST", "").strip()
        or file_values.get("MYSQL_HOST", "localhost"),
        "user": os.environ.get("MYSQL_USERNAME", "").strip()
        or file_values.get("MYSQL_USERNAME", "root"),
        "password": password,
        "database": os.environ.get("MYSQL_DATABASE", "").strip()
        or file_values.get("MYSQL_DATABASE", "ddasum"),
        "charset": "utf8mb4",
    }
