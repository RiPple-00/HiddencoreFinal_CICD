"""
보호자 주간 보고서 LLM 서비스 (FastAPI + OpenAI).

엔드포인트:
  GET  /health
  POST /api/weekly-narrative      — 체크리스트 기반 주간 요약
  POST /api/prescription-summary  — 스캔 등록 처방전·진단 기반 환자 상태 분석
  POST /api/program-recommendation — 모집 중 프로그램 기반 분야별 추천
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, List, Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")
# 챗봇과 동일 키 공유 (ai-report/.env 없을 때)
if not os.getenv("OPENAI_API_KEY", "").strip():
    load_dotenv(BASE_DIR.parent / "chatbot" / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
PORT = int(os.getenv("AI_REPORT_PORT", "8002"))

if not OPENAI_API_KEY:
    print(
        "[ai-report] OPENAI_API_KEY 없음 — ai/ai-report/.env 또는 ai/chatbot/.env 설정 필요",
        file=sys.stderr,
    )

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

app = FastAPI(title="Ddasum AI Report", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 요청/응답 스키마 ───────────────────────────────────────────


class WeeklyNarrativeRequest(BaseModel):
    period_start: str
    period_end: str
    patient_name: str = "환자"
    overall_rate: int = 0
    risk_level: str = "안정"
    risk_flags: List[str] = Field(default_factory=list)
    meal_morning_missing: int = 0
    meal_lunch_missing: int = 0
    meal_dinner_missing: int = 0
    meal_percent: int = 0
    hygiene_percent: int = 0
    condition_percent: int = 0
    elimination_percent: int = 0
    diagnosis_title: str = ""
    diagnosis_comment: str = ""
    language: str = "ko"


class WeeklyNarrativeResponse(BaseModel):
    summary_text: str = ""
    checklist_insight: str = ""
    ai_comments: List[str] = Field(default_factory=list)
    next_week_tips: List[str] = Field(default_factory=list)
    program_section: Optional[dict] = None


class MedicationItem(BaseModel):
    medication_id: Optional[int] = None
    prescription_date: Optional[str] = None
    medicine_summary: Optional[str] = None
    medicine_name: Optional[str] = None
    effect: Optional[str] = None
    use_method: Optional[str] = None
    caution: Optional[str] = None
    warning: Optional[str] = None
    side_effect: Optional[str] = None


class PrescriptionSummaryRequest(BaseModel):
    patient_name: str = "환자"
    period_start: str = ""
    period_end: str = ""
    overall_rate: int = 0
    risk_level: str = "안정"
    risk_flags: List[str] = Field(default_factory=list)
    diagnosis_title: str = ""
    diagnosis_comment: str = ""
    medications: List[MedicationItem] = Field(default_factory=list)
    language: str = "ko"


class AvailableProgramItem(BaseModel):
    post_id: int = 0
    title: str = ""
    description: str = ""
    category: str = ""
    program_start_at: str = ""


class MedicationSummaryItem(BaseModel):
    summary: str = ""


class ProgramRecommendationRequest(BaseModel):
    patient_name: str = "환자"
    period_start: str = ""
    period_end: str = ""
    next_week_start: str = ""
    overall_rate: int = 0
    risk_level: str = "안정"
    risk_flags: List[str] = Field(default_factory=list)
    meal_percent: int = 0
    hygiene_percent: int = 0
    condition_percent: int = 0
    elimination_percent: int = 0
    diagnosis_title: str = ""
    diagnosis_comment: str = ""
    medication_summaries: List[MedicationSummaryItem] = Field(default_factory=list)
    available_programs: List[AvailableProgramItem] = Field(default_factory=list)
    language: str = "ko"


class CategoryRecommendationItem(BaseModel):
    category: str = ""
    reason: str = ""
    has_program: bool = False
    post_id: Optional[int] = None
    program_title: str = ""
    no_program_message: str = ""


class ProgramRecommendationResponse(BaseModel):
    activity_title: str = ""
    activity_description: str = ""
    effects: List[str] = Field(default_factory=list)
    category_recommendations: List[CategoryRecommendationItem] = Field(default_factory=list)


class PrescriptionSummaryResponse(BaseModel):
    summary_text: str = ""
    medication_highlights: List[str] = Field(default_factory=list)
    cautions: List[str] = Field(default_factory=list)
    care_tips: List[str] = Field(default_factory=list)


# ── LLM 유틸 ───────────────────────────────────────────────────


def _strip_code_fence(raw: str) -> str:
    s = raw.strip()
    if not s.startswith("```"):
        return s
    s = re.sub(r"^```[a-zA-Z]*\n", "", s)
    s = re.sub(r"\n```$", "", s)
    return s.strip()


def _chat_json(system: str, user: str, max_tokens: int = 700) -> dict[str, Any]:
    if client is None:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY 가 설정되지 않았습니다.")

    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=0.2,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    raw = (completion.choices[0].message.content or "").strip()
    if not raw:
        raise HTTPException(status_code=502, detail="LLM 응답이 비어 있습니다.")
    try:
        return json.loads(_strip_code_fence(raw))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail=f"LLM JSON 파싱 실패: {exc}") from exc


WEEKLY_SYSTEM = """
너는 요양시설 보호자용 주간 돌봄 보고서 작성 도우미다.
출력은 반드시 JSON 하나만 반환한다. 마크다운·코드블록 금지.
진단·처방 변경을 단정하지 말고 관찰 중심으로 공손한 존댓말을 사용한다.
""".strip()

_LANG_SUFFIX = {
    "en": "\nRespond in English only. All text values in the JSON must be written in English.",
    "ja": "\nRespond in Japanese only (日本語). All text values in the JSON must be written in Japanese.",
}


def _system(base: str, language: str) -> str:
    return base + _LANG_SUFFIX.get(language, "")

PRESCRIPTION_SYSTEM = """
너는 요양시설 보호자에게 전달할 처방전·복약 상태 분석 도우미다.
출력은 반드시 JSON 하나만 반환한다. 마크다운·코드블록 금지.
의사의 진단·처방 변경·약 중단을 지시하지 말고, 등록된 약 정보·원무 등록 진단 정보·주간 돌봄 맥락을 바탕으로
보호자가 이해하기 쉬운 관찰·주의·생활 관리 포인트를 제시한다.
""".strip()

PROGRAM_SYSTEM = """
너는 요양시설 보호자 주간 보고서의 프로그램 추천 도우미다.
출력은 반드시 JSON 하나만 반환한다. 마크다운·코드블록 금지.

규칙:
1) 환자의 등록 진단(원무), 주간 체크리스트, 등록 약 정보를 종합해 도움이 될 '분야'만 추천한다.
2) 추천 분야가 없으면 categoryRecommendations 를 빈 배열로 반환한다.
3) 추천 분야가 있으면, 반드시 available_programs 목록 안에서만 프로그램을 고른다.
4) 해당 분야에 모집 중 프로그램이 없으면 hasProgram=false, noProgramMessage="현재 모집 중인 해당 분야 프로그램이 없습니다."
5) 목록에 없는 post_id 를 만들지 말 것. hasProgram=true 일 때 post_id·programTitle 은 목록과 일치해야 한다.
6) next_week_start 이후 시작하는 프로그램만 후보이므로, 이미 제공된 available_programs 만 사용한다.
7) activityTitle/activityDescription/effects 는 이번 주 돌봄·진단 맥락의 활동 요약(관찰 중심)이다.
8) 알츠하이머·치매 진단 환자에게는 '나만의 추억 앨범 만들기', '숫자 카드 순서 맞추기' 등 인지·추억 프로그램이 후보에 있으면 우선 추천한다.
""".strip()


# ── 엔드포인트 ─────────────────────────────────────────────────


@app.get("/health")
def health():
    return {
        "status": "ok",
        "openai_configured": bool(OPENAI_API_KEY),
        "model": OPENAI_MODEL,
    }


@app.post("/api/weekly-narrative", response_model=WeeklyNarrativeResponse)
def weekly_narrative(body: WeeklyNarrativeRequest):
    user_prompt = f"""
아래 주간 돌봄 데이터로 보호자용 요약 JSON을 생성해라.

반드시 아래 스키마만 반환:
{{
  "summaryText": "문자열",
  "checklistInsight": "문자열",
  "aiComments": ["문자열"],
  "nextWeekTips": ["문자열"],
  "programSection": {{
    "activityTitle": "문자열",
    "activityDescription": "문자열",
    "effects": ["문자열"],
    "recommendations": ["문자열"]
  }}
}}

제약:
- summaryText: 1~2문장
- checklistInsight: 1문장
- aiComments: 2~4개
- nextWeekTips: 2~3개
- programSection.effects: 1~2개
- programSection.recommendations: 2~3개

입력:
환자: {body.patient_name}
기간: {body.period_start} ~ {body.period_end}
전체 수행률: {body.overall_rate}%
위험도: {body.risk_level}
위험 플래그: {", ".join(body.risk_flags) or "없음"}
식사 미기입: 아침 {body.meal_morning_missing}, 점심 {body.meal_lunch_missing}, 저녁 {body.meal_dinner_missing}
항목 수행률: 식사 {body.meal_percent}%, 위생 {body.hygiene_percent}%, 상태 {body.condition_percent}%, 배변 {body.elimination_percent}%

원무 등록 진단명:
{body.diagnosis_title or "없음"}

원무 등록 진단 코멘트:
{body.diagnosis_comment or "없음"}
""".strip()

    data = _chat_json(_system(WEEKLY_SYSTEM, body.language), user_prompt)
    return WeeklyNarrativeResponse(
        summary_text=str(data.get("summaryText", "")).strip(),
        checklist_insight=str(data.get("checklistInsight", "")).strip(),
        ai_comments=[str(x).strip() for x in data.get("aiComments", []) if str(x).strip()],
        next_week_tips=[str(x).strip() for x in data.get("nextWeekTips", []) if str(x).strip()],
        program_section=data.get("programSection") if isinstance(data.get("programSection"), dict) else None,
    )


@app.post("/api/prescription-summary", response_model=PrescriptionSummaryResponse)
def prescription_summary(body: PrescriptionSummaryRequest):
    if not body.medications:
        return PrescriptionSummaryResponse(
            summary_text="등록된 처방전이 없어 복약 분석을 제공할 수 없습니다.",
            medication_highlights=[],
            cautions=["보호자 앱에서 처방전 QR을 스캔해 등록해 주세요."],
            care_tips=[],
        )

    med_lines = []
    for m in body.medications:
        med_lines.append(
            "\n".join(
                filter(
                    None,
                    [
                        f"- 처방일: {m.prescription_date or '-'}",
                        f"  약명: {m.medicine_name or m.medicine_summary or '-'}",
                        f"  효능: {(m.effect or '')[:200]}",
                        f"  복용: {(m.use_method or '')[:200]}",
                        f"  주의: {(m.caution or m.warning or '')[:200]}",
                        f"  부작용: {(m.side_effect or '')[:150]}",
                    ],
                )
            )
        )

    user_prompt = f"""
보호자에게 전달할 처방전·복약 상태 분석 JSON을 생성해라.

반드시 아래 스키마만 반환:
{{
  "summaryText": "문자열",
  "medicationHighlights": ["문자열"],
  "cautions": ["문자열"],
  "careTips": ["문자열"]
}}

제약:
- summaryText: 2~3문장, 환자 {body.patient_name} 님의 복약·돌봄 맥락 종합
- medicationHighlights: 등록 약 2~4개 핵심 (약명·목적 위주)
- cautions: 2~3개 (부작용·상호작용·관찰 포인트, 의료진 상담 권고 포함 가능)
- careTips: 2~3개 (요양원·보호자가 실천할 수 있는 관리 팁)

주간 돌봄 맥락:
기간: {body.period_start} ~ {body.period_end}
수행률: {body.overall_rate}%, 위험도: {body.risk_level}
위험 플래그: {", ".join(body.risk_flags) or "없음"}

원무 등록 진단명:
{body.diagnosis_title or "없음"}

원무 등록 진단 코멘트:
{body.diagnosis_comment or "없음"}

등록 처방전·약 정보:
{chr(10).join(med_lines)}
""".strip()

    data = _chat_json(_system(PRESCRIPTION_SYSTEM, body.language), user_prompt, max_tokens=800)
    return PrescriptionSummaryResponse(
        summary_text=str(data.get("summaryText", "")).strip(),
        medication_highlights=[
            str(x).strip() for x in data.get("medicationHighlights", []) if str(x).strip()
        ],
        cautions=[str(x).strip() for x in data.get("cautions", []) if str(x).strip()],
        care_tips=[str(x).strip() for x in data.get("careTips", []) if str(x).strip()],
    )


@app.post("/api/program-recommendation", response_model=ProgramRecommendationResponse)
def program_recommendation(body: ProgramRecommendationRequest):
    if not body.available_programs:
        return ProgramRecommendationResponse(
            activity_title="주간 돌봄 기반 활동 요약",
            activity_description=(
                f"{body.period_start}~{body.period_end} 기간 돌봄 기록과 진단 정보를 검토했으나, "
                f"{body.next_week_start} 이후 신청 가능한 모집 중 프로그램이 없어 분야별 추천을 제공하지 않습니다."
            ),
            effects=["현재 모집 중인 프로그램이 없어 기존 돌봄 루틴 유지를 권장합니다."],
            category_recommendations=[],
        )

    program_lines = []
    for p in body.available_programs:
        program_lines.append(
            f"- post_id={p.post_id}, 분야={p.category}, 제목={p.title}, "
            f"시작={p.program_start_at or '미정'}, 설명={p.description[:120]}"
        )

    med_lines = [f"- {m.summary}" for m in body.medication_summaries if m.summary]

    user_prompt = f"""
환자 {body.patient_name} 님의 다음 주 프로그램 추천 JSON을 생성해라.

반드시 아래 스키마만 반환:
{{
  "activityTitle": "문자열",
  "activityDescription": "문자열",
  "effects": ["문자열"],
  "categoryRecommendations": [
    {{
      "category": "분야명",
      "reason": "추천 이유",
      "hasProgram": true,
      "postId": 123,
      "programTitle": "프로그램 제목",
      "noProgramMessage": ""
    }},
    {{
      "category": "분야명",
      "reason": "추천 이유",
      "hasProgram": false,
      "postId": null,
      "programTitle": "",
      "noProgramMessage": "현재 모집 중인 해당 분야 프로그램이 없습니다."
    }}
  ]
}}

제약:
- categoryRecommendations: 0~3개. 환자 상태에 맞는 분야만. 맞는 분야가 없으면 [].
- hasProgram=true 이면 available_programs 의 post_id 만 사용.
- effects: 1~2개
- activityDescription: 진단·체크리스트·약 정보를 반영한 이번 주 활동/관찰 요약

보고 기간: {body.period_start} ~ {body.period_end}
다음 주 시작(신청 대상): {body.next_week_start}
수행률: {body.overall_rate}%, 위험도: {body.risk_level}
위험 플래그: {", ".join(body.risk_flags) or "없음"}
체크리스트: 식사 {body.meal_percent}%, 위생 {body.hygiene_percent}%, 상태 {body.condition_percent}%, 배변 {body.elimination_percent}%

원무 등록 진단명:
{body.diagnosis_title or "없음"}

원무 등록 진단 코멘트:
{body.diagnosis_comment or "없음"}

등록 약 요약:
{chr(10).join(med_lines) or "없음"}

신청 가능·모집 중 프로그램 후보(이 목록에서만 선택):
{chr(10).join(program_lines)}
""".strip()

    data = _chat_json(_system(PROGRAM_SYSTEM, body.language), user_prompt, max_tokens=900)

    raw_items = data.get("categoryRecommendations", [])
    allowed_ids = {p.post_id for p in body.available_programs}
    programs_by_id = {p.post_id: p for p in body.available_programs}
    programs_by_category: dict[str, list[AvailableProgramItem]] = {}
    for p in body.available_programs:
        programs_by_category.setdefault(p.category, []).append(p)

    category_recommendations: list[CategoryRecommendationItem] = []
    if isinstance(raw_items, list):
        for item in raw_items:
            if not isinstance(item, dict):
                continue
            category = str(item.get("category", "")).strip()
            if not category:
                continue
            reason = str(item.get("reason", "")).strip()
            has_program = bool(item.get("hasProgram", False))
            post_id = item.get("postId")
            if has_program:
                pid = int(post_id) if post_id is not None else 0
                matched = programs_by_id.get(pid)
                if matched is None:
                    candidates = programs_by_category.get(category, [])
                    matched = candidates[0] if candidates else None
                if matched is not None:
                    category_recommendations.append(
                        CategoryRecommendationItem(
                            category=category,
                            reason=reason,
                            has_program=True,
                            post_id=matched.post_id,
                            program_title=matched.title,
                        )
                    )
                else:
                    category_recommendations.append(
                        CategoryRecommendationItem(
                            category=category,
                            reason=reason,
                            has_program=False,
                            no_program_message="현재 모집 중인 해당 분야 프로그램이 없습니다.",
                        )
                    )
            else:
                category_recommendations.append(
                    CategoryRecommendationItem(
                        category=category,
                        reason=reason,
                        has_program=False,
                        no_program_message=str(
                            item.get("noProgramMessage", "")
                        ).strip()
                        or "현재 모집 중인 해당 분야 프로그램이 없습니다.",
                    )
                )

    return ProgramRecommendationResponse(
        activity_title=str(data.get("activityTitle", "")).strip(),
        activity_description=str(data.get("activityDescription", "")).strip(),
        effects=[str(x).strip() for x in data.get("effects", []) if str(x).strip()],
        category_recommendations=category_recommendations,
    )


if __name__ == "__main__":
    uvicorn.run("report_service:app", host="0.0.0.0", port=PORT, reload=False)
