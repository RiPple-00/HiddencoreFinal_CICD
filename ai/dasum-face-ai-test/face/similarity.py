"""Cosine similarity and patient match decision."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

import schema as S
import settings as CFG
from face.embedder import l2_normalize


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(l2_normalize(a), l2_normalize(b)))


@dataclass
class SimilarityResult:
    patient_similarities: dict[str, float]
    top1_patient: str | None
    top1_similarity: float
    top2_patient: str | None
    top2_similarity: float
    similarity_gap: float
    predicted_patient: str
    status: str
    review_flag: bool


def rank_patients(
    embedding: np.ndarray,
    representatives: dict[str, np.ndarray],
) -> dict[str, float]:
    scores = {
        pid: round(cosine_similarity(embedding, rep), 4)
        for pid, rep in representatives.items()
    }
    return scores


def decide_match(
    scores: dict[str, float],
    threshold: float | None = None,
    margin: float | None = None,
    low_conf_threshold: float | None = None,
    near_gap: float | None = None,
) -> SimilarityResult:
    threshold = CFG.SIMILARITY_THRESHOLD if threshold is None else threshold
    margin = CFG.SIMILARITY_MARGIN if margin is None else margin
    low_conf_threshold = (
        CFG.LOW_CONFIDENCE_THRESHOLD if low_conf_threshold is None else low_conf_threshold
    )
    near_gap = CFG.REVIEW_NEAR_THRESHOLD_GAP if near_gap is None else near_gap

    if not scores:
        return SimilarityResult(
            patient_similarities={},
            top1_patient=None,
            top1_similarity=0.0,
            top2_patient=None,
            top2_similarity=0.0,
            similarity_gap=0.0,
            predicted_patient="unknown",
            status=S.IDENTITY_UNKNOWN,
            review_flag=True,
        )

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top1_patient, top1_sim = ranked[0]
    top2_patient, top2_sim = (ranked[1] if len(ranked) > 1 else (None, 0.0))
    gap = round(top1_sim - top2_sim, 4)

    review_flag = (
        top1_sim < low_conf_threshold
        or abs(top1_sim - threshold) <= near_gap
    )

    if top1_sim >= threshold and gap >= margin:
        status = S.IDENTITY_MATCHED
        predicted = top1_patient
    elif top1_sim >= threshold and gap < margin:
        status = S.IDENTITY_UNCERTAIN
        predicted = top1_patient
    elif top1_sim < low_conf_threshold:
        status = S.IDENTITY_LOW_CONFIDENCE
        predicted = "unknown"
        review_flag = True
    else:
        status = S.IDENTITY_UNKNOWN
        predicted = "unknown"

    return SimilarityResult(
        patient_similarities=scores,
        top1_patient=top1_patient,
        top1_similarity=top1_sim,
        top2_patient=top2_patient,
        top2_similarity=top2_sim,
        similarity_gap=gap,
        predicted_patient=predicted,
        status=status,
        review_flag=review_flag,
    )
