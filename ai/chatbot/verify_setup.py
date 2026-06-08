"""PDF / ChromaDB / OpenAI 키 존재 여부만 확인 (서버 기동 없음)."""
from pathlib import Path
import os
import sqlite3

BASE = Path(__file__).parent
data_dir = BASE / "data"
pdfs = sorted(data_dir.glob("*.pdf"))
print("=== PDF ===")
if pdfs:
    for p in pdfs:
        print(f"  OK  {p.name}  ({p.stat().st_size:,} bytes)")
else:
    print("  MISSING  ai/chatbot/data/*.pdf")

chroma_db = BASE / "chroma_db" / "chroma.sqlite3"
print("\n=== ChromaDB ===")
if chroma_db.is_file():
    print(f"  OK  chroma.sqlite3  ({chroma_db.stat().st_size:,} bytes)")
else:
    print("  MISSING  chroma_db/chroma.sqlite3")

env_file = BASE / ".env"
print("\n=== OpenAI API Key ===")
from dotenv import load_dotenv

load_dotenv(env_file)
key = os.getenv("OPENAI_API_KEY", "").strip()
if key:
    print(f"  OK  OPENAI_API_KEY set (length {len(key)})")
else:
    print("  MISSING  ai/chatbot/.env 에 OPENAI_API_KEY 필요 (.env.example 참고)")
