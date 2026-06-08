# ai/chatbot/chatbot.py
# FastAPI + OpenAI GPT + ChromaDB RAG (PDF 직접 지원)

import os
import re
import sys
from pathlib import Path
from typing import List


def safe_print(*args, **kwargs):
    """Windows cp949 콘솔에서도 서버가 죽지 않도록 출력."""
    text = " ".join(str(a) for a in args)
    try:
        print(text, **kwargs)
    except UnicodeEncodeError:
        enc = getattr(sys.stdout, "encoding", None) or "utf-8"
        sys.stdout.buffer.write((text + kwargs.get("end", "\n")).encode(enc, errors="replace"))
        sys.stdout.flush()

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import chromadb
from chromadb.utils import embedding_functions

# ── 환경 변수 ──────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not OPENAI_API_KEY:
    raise RuntimeError(".env 파일에 OPENAI_API_KEY 가 없습니다.")

# ── 경로 설정 ──────────────────────────────────────────────────
DATA_DIR   = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "chroma_db"
COLLECTION = "thasoom_rag"

# ── OpenAI + ChromaDB 초기화 ───────────────────────────────────
openai_client = OpenAI(api_key=OPENAI_API_KEY)

chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
embed_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-small",
)
collection = chroma_client.get_or_create_collection(
    name=COLLECTION,
    embedding_function=embed_fn,
)

SYSTEM_PROMPT = """
당신은 따숨 요양원의 전담 AI 상담사입니다.
친절하고 따뜻한 말투로 어르신 보호자분들의 질문에 답변해 주세요.

[답변 원칙]
1. 요양원 시설·주차·서류·원무·면회·입퇴원 절차·연락처·시간 등은 제공된 참고 문서를 최우선으로 활용하세요.
2. 문서에 없는 시설·행정 정보는 추측하지 말고 "담당자에게 직접 문의 바랍니다 (02-6901-7098)" 라고 안내하세요.
3. 당뇨병·고혈압·치매 등 일반 건강·질병·생활 상식 질문은 LLM 일반 지식으로 쉬운 말로 설명해도 됩니다.
   - 단, 진단·처방·약 복용 변경·응급 판단은 하지 말고, 필요 시 의료진·담당자 상담을 권하세요.
4. 답변은 간결하고 명확하게 작성하세요.
5. 단계가 있는 내용은 번호 목록으로 안내하세요.

[시설 기본 정보]
- 이름: 따숨 요양원
- 주소: 서울특별시 종로구 종로12길 15 (관철동 13-13)
- 대표번호: 02-6901-7098
- 오시는 길: 지하철 1호선 종각역 4번 출구 도보 5분
""".strip()

FACILITY_KEYWORDS = (
    "요양원", "주차", "면회", "입원", "퇴원", "서류", "원무", "오시는", "연락처",
    "증명서", "의무기록", "시설", "비용", "요금", "등록", "면회", "입퇴원", "주소",
    "종각", "대표번호", "전화", "방문", "발급", "절차", "준비물",
)

GENERAL_HEALTH_KEYWORDS = (
    "당뇨", "고혈압", "치매", "질병", "건강", "증상", "혈압", "혈당", "인슐린",
    "약", "운동", "식이", "영양", "감기", "독감", "뇌졸중", "심장", "관절", "통증",
    "우울", "불면", "치료", "예방", "설명해", "뭐야", "무엇",
)


def is_facility_query(text: str) -> bool:
    t = text or ""
    return any(kw in t for kw in FACILITY_KEYWORDS)


def is_general_health_query(text: str) -> bool:
    t = text or ""
    return any(kw in t for kw in GENERAL_HEALTH_KEYWORDS)


def build_system_content(user_message: str, context: str, language: str = "ko") -> str:
    lang_instr = LANGUAGE_INSTRUCTION.get(language, "")

    if is_general_health_query(user_message) and not is_facility_query(user_message):
        return (
            SYSTEM_PROMPT
            + "\n\n[이번 질문 유형] 일반 건강·질병 상식 질문입니다."
            + " 참고 문서와 관계없이 이해하기 쉬운 말로 5~8문장 정도 설명하세요."
            + " 진단·처방·약 변경·응급 여부 판단은 하지 말고,"
            + " 마지막에 필요 시 요양원 담당자(02-6901-7098) 또는 의료진 상담을 권하세요."
            + lang_instr
        )
    system_content = SYSTEM_PROMPT
    if context:
        system_content += f"\n\n[참고 문서]\n{context}"
    system_content += lang_instr
    return system_content


def extract_pdf_text(pdf_path: Path) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(pdf_path))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text() or ""
            text = re.sub(r"[ \t]{2,}", " ", text)
            text = re.sub(r"\n{3,}", "\n\n", text)
            pages_text.append(text.strip())
        return "\n\n".join(t for t in pages_text if t)
    except ImportError:
        raise RuntimeError("pypdf 가 없습니다. pip install pypdf 실행하세요.")


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    section_pattern = r"(?=\n(?:요양원 안내|주차 안내|서류 안내|원무 안내|진료 및 입원|시설 소개|오시는 길|주요 연락|주차 요금|차량 높이|차량 등록|전기차|증명서 발급|의무기록|퇴원|면회|입원절차|원무팀|입원 준비|보호자 준비|응급 입원))"
    sections = re.split(section_pattern, text)
    chunks = []
    for section in sections:
        section = section.strip()
        if len(section) < 30:
            continue
        if len(section) <= chunk_size:
            chunks.append(section)
        else:
            start = 0
            while start < len(section):
                chunks.append(section[start:start + chunk_size])
                start += chunk_size - overlap
    return [c for c in chunks if len(c.strip()) > 30]


def load_documents():
    if collection.count() > 0:
        safe_print(f"[ChromaDB] 기존 {collection.count()}개 청크 로드됨 - 색인 스킵")
        return

    all_chunks, all_ids, all_metas = [], [], []

    for pdf_path in sorted(DATA_DIR.glob("*.pdf")):
        safe_print(f"[색인] PDF: {pdf_path.name}")
        try:
            text = extract_pdf_text(pdf_path)
            chunks = chunk_text(text)
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_ids.append(f"{pdf_path.stem}_{i}")
                all_metas.append({"source": pdf_path.name, "chunk": i})
            safe_print(f"       -> {len(chunks)}개 청크")
        except Exception as e:
            safe_print(f"[경고] {e}")

    for ext in ["*.txt", "*.md"]:
        for fpath in sorted(DATA_DIR.glob(ext)):
            safe_print(f"[색인] TXT: {fpath.name}")
            text = fpath.read_text(encoding="utf-8")
            chunks = chunk_text(text)
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_ids.append(f"{fpath.stem}_{i}")
                all_metas.append({"source": fpath.name, "chunk": i})

    if not all_chunks:
        safe_print(f"[경고] {DATA_DIR} 에 문서가 없습니다.")
        return

    batch_size = 50
    for i in range(0, len(all_chunks), batch_size):
        collection.add(
            documents=all_chunks[i:i+batch_size],
            ids=all_ids[i:i+batch_size],
            metadatas=all_metas[i:i+batch_size],
        )
    safe_print(f"[ChromaDB] {len(all_chunks)}개 청크 색인 완료")


def retrieve_context(query: str, top_k: int = 5) -> str:
    if collection.count() == 0:
        return ""
    results = collection.query(query_texts=[query], n_results=top_k)
    docs = results.get("documents", [[]])[0]
    return "\n\n---\n\n".join(docs) if docs else ""


app = FastAPI(title="따숨 요양원 챗봇 API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    language: str = "ko"  # "ko" | "en" | "ja"

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []


LANGUAGE_INSTRUCTION = {
    "en": "\n\n[IMPORTANT] You MUST respond in English only, regardless of the language of the question or documents.",
    "ja": "\n\n【重要】質問や資料の言語に関わらず、必ず日本語のみで回答してください。",
}


@app.get("/health")
def health():
    return {"status": "ok", "docs_indexed": collection.count()}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages 가 비어 있습니다.")

    last_user_msg = next(
        (m.content for m in reversed(req.messages) if m.role == "user"), ""
    )
    language = req.language if req.language in ("ko", "en", "ja") else "ko"

    use_rag = is_facility_query(last_user_msg) or not is_general_health_query(
        last_user_msg
    )
    context = retrieve_context(last_user_msg) if use_rag else ""
    system_content = build_system_content(last_user_msg, context, language)

    history = [{"role": m.role, "content": m.content} for m in req.messages[-10:]]

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system_content}, *history],
        temperature=0.5 if not use_rag else 0.3,
        max_tokens=700,
    )

    reply = response.choices[0].message.content.strip()

    sources: List[str] = []
    if use_rag and context:
        results = collection.query(query_texts=[last_user_msg], n_results=3)
        metas = results.get("metadatas", [[]])[0]
        sources = list({m["source"] for m in metas if "source" in m})

    return ChatResponse(reply=reply, sources=sources)


@app.on_event("startup")
def startup():
    safe_print("\n" + "=" * 50)
    safe_print("따숨 요양원 챗봇 서버 시작")
    safe_print("=" * 50)
    load_documents()
    port = int(os.getenv("CHATBOT_PORT", "8001"))
    safe_print(f"서버 준비 완료 - http://localhost:{port}\n")


if __name__ == "__main__":
    port = int(os.getenv("CHATBOT_PORT", "8001"))
    uvicorn.run("chatbot:app", host="0.0.0.0", port=port, reload=False)