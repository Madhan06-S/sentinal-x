import math
import re
from collections import Counter
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import KnowledgeDocument, Incident, Alert
from app.services.seed_data import SEED_KNOWLEDGE_DOCUMENTS
from app.core.logging import logger


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


async def seed_knowledge_base_if_empty(db: AsyncSession) -> None:
    result = await db.execute(select(KnowledgeDocument).where(KnowledgeDocument.error_code == "DB-104").limit(1))
    existing = result.scalars().first()
    if existing:
        return

    logger.info("Seeding Knowledge Base with initial troubleshooting documents...")
    for doc_data in SEED_KNOWLEDGE_DOCUMENTS:
        doc = KnowledgeDocument(
            document_type=doc_data.get("document_type", "error_code"),
            title=doc_data["title"],
            content=doc_data["content"],
            service=doc_data.get("service"),
            error_code=doc_data.get("error_code"),
            remediation_suggestion=doc_data.get("remediation_suggestion"),
            tags=doc_data.get("tags"),
        )
        db.add(doc)
    await db.commit()
    logger.info("Knowledge Base seeded successfully with %d documents.", len(SEED_KNOWLEDGE_DOCUMENTS))


async def retrieve_knowledge(
    db: AsyncSession,
    error_code: str | None,
    service: str | None,
    environment: str | None = None,
    query: str | None = None,
    limit: int = 5,
) -> list[KnowledgeDocument]:
    """
    RAG Retrieval Strategy:
    1. Automatic seeding if knowledge base is empty
    2. Exact error_code match (+3.0)
    3. Metadata filtering by service (+1.5)
    4. TF-IDF cosine similarity scoring (+0.0 to +2.0)
    """
    await seed_knowledge_base_if_empty(db)

    result = await db.execute(select(KnowledgeDocument))
    all_docs = list(result.scalars().all())
    if not all_docs:
        return []

    scored_docs: list[tuple[float, KnowledgeDocument]] = []
    query_str = f"{service or ''} {error_code or ''} {query or ''}"

    for doc in all_docs:
        score = 0.0

        if error_code and doc.error_code == error_code:
            score += 3.0

        if service and doc.service and doc.service.lower() == service.lower():
            score += 1.5

        if query_str.strip():
            tfidf_score = _cosine_tfidf_score(query_str, f"{doc.title} {doc.content}")
            score += tfidf_score * 2.0

        if score > 0.1:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    top_docs = [doc for score, doc in scored_docs[:limit]]

    # If TF-IDF filtering produced no hits, fall back to SQL search or recent docs
    if not top_docs and (error_code or service or query):
        stmt = select(KnowledgeDocument)
        conditions = []
        if error_code:
            conditions.append(KnowledgeDocument.error_code == error_code)
        if service:
            conditions.append(KnowledgeDocument.service == service)
        if query:
            search_term = f"%{query}%"
            conditions.append(
                or_(
                    KnowledgeDocument.title.ilike(search_term),
                    KnowledgeDocument.content.ilike(search_term),
                )
            )
        if conditions:
            stmt = stmt.where(or_(*conditions))
        stmt = stmt.order_by(KnowledgeDocument.updated_at.desc()).limit(limit)
        res = await db.execute(stmt)
        top_docs = list(res.scalars().all())

    logger.info(
        "Retrieved %d RAG documents for error_code=%s, service=%s, query=%s",
        len(top_docs),
        error_code,
        service,
        query,
    )
    return top_docs


async def save_resolved_incident_as_knowledge(db: AsyncSession, incident: Incident) -> KnowledgeDocument | None:
    """
    When an incident is resolved, store summary data so future investigations can retrieve similar historical incidents.
    """
    if not incident.root_cause and not incident.analysis_summary:
        return None

    content = f"Root Cause: {incident.root_cause}\n"
    content += f"Analysis Summary: {incident.analysis_summary}\n"
    if incident.recommended_action:
        content += f"Remediation Action Taken: {incident.recommended_action}\n"

    services = []
    error_codes = []
    res = await db.execute(select(Alert).where(Alert.incident_id == incident.id))
    alerts = res.scalars().all()
    for alert in alerts:
        if alert.service and alert.service not in services:
            services.append(alert.service)
        if alert.error_code and alert.error_code not in error_codes:
            error_codes.append(alert.error_code)

    doc = KnowledgeDocument(
        title=f"Incident Resolution: {incident.title}",
        content=content,
        document_type="historical_incident",
        service=services[0] if services else None,
        environment=None,
        error_code=error_codes[0] if error_codes else None,
        remediation_suggestion=incident.recommended_action,
        tags={"incident_id": incident.id, "severity": incident.severity.value if hasattr(incident.severity, "value") else str(incident.severity)},
    )

    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    logger.info("Saved incident %s as KnowledgeDocument %s", incident.id, doc.id)
    return doc
