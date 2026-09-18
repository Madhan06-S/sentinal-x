import math
import re
from collections import Counter
from typing import Any
from sqlalchemy.orm import Session

from app.models.engine import KnowledgeDocumentRecord
from app.rag.knowledge_base import seed_knowledge_base_if_empty


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\w+", (text or "").lower())


def _compute_tf(text: str) -> dict[str, float]:
    tokens = _tokenize(text)
    if not tokens:
        return {}
    counts = Counter(tokens)
    num_tokens = len(tokens)
    return {word: count / num_tokens for word, count in counts.items()}


def _cosine_tfidf_score(query: str, doc_text: str) -> float:
    q_tf = _compute_tf(query)
    d_tf = _compute_tf(doc_text)
    if not q_tf or not d_tf:
        return 0.0

    common_words = set(q_tf.keys()).intersection(d_tf.keys())
    if not common_words:
        return 0.0

    dot_product = sum(q_tf[w] * d_tf[w] for w in common_words)
    q_norm = math.sqrt(sum(v**2 for v in q_tf.values()))
    d_norm = math.sqrt(sum(v**2 for v in d_tf.values()))

    if q_norm == 0 or d_norm == 0:
        return 0.0

    return dot_product / (q_norm * d_norm)


def retrieve_relevant_knowledge(
    db: Session,
    service: str,
    error_codes: list[str],
    symptoms: list[str],
    max_results: int = 5,
) -> list[dict[str, Any]]:
    """
    Lightweight Hybrid RAG Retriever:
    1. Exact error-code matching (Priority 1)
    2. Service metadata filtering
    3. Keyword / TF-IDF similarity scoring
    Returns small, highly relevant evidence context for Groq.
    """
    seed_knowledge_base_if_empty(db)

    all_docs = db.query(KnowledgeDocumentRecord).all()
    if not all_docs:
        return []

    scored_docs: list[tuple[float, KnowledgeDocumentRecord]] = []
    query_str = f"{service} {' '.join(error_codes)} {' '.join(symptoms)}"

    for doc in all_docs:
        score = 0.0

        # Exact error code match (+3.0)
        if doc.error_code and doc.error_code in error_codes:
            score += 3.0

        # Service match (+1.5)
        if doc.service and doc.service.lower() == service.lower():
            score += 1.5

        # TF-IDF keyword similarity score (+0.0 to +2.0)
        tfidf_score = _cosine_tfidf_score(query_str, f"{doc.title} {doc.content}")
        score += tfidf_score * 2.0

        if score > 0.1:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    top_docs = scored_docs[:max_results]

    results = []
    for score, doc in top_docs:
        results.append(
            {
                "id": doc.id,
                "doc_type": doc.doc_type,
                "error_code": doc.error_code,
                "title": doc.title,
                "service": doc.service,
                "content": doc.content,
                "remediation_suggestion": doc.remediation_suggestion,
                "relevance_score": round(score, 3),
            }
        )

    return results
