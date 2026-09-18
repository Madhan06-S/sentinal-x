from typing import Any
from sqlalchemy.orm import Session

from app.models.engine import KnowledgeDocumentRecord
from app.rag.seed_data import SEED_KNOWLEDGE_DOCUMENTS


def seed_knowledge_base_if_empty(db: Session) -> None:
    count = db.query(KnowledgeDocumentRecord).count()
    if count == 0:
        for doc in SEED_KNOWLEDGE_DOCUMENTS:
            record = KnowledgeDocumentRecord(
                doc_type=doc["doc_type"],
                error_code=doc.get("error_code"),
                title=doc["title"],
                service=doc.get("service"),
                content=doc["content"],
                remediation_suggestion=doc.get("remediation_suggestion"),
                metadata_json=doc.get("metadata_json", {}),
            )
            db.add(record)
        db.commit()


def store_resolved_incident_as_knowledge(
    db: Session,
    incident_id: str,
    service: str,
    symptoms: list[str],
    root_cause: str,
    resolution_action: str,
    verification_result: str,
) -> None:
    """
    Stores resolved incident as future RAG historical knowledge.
    Accumulates incident knowledge without requiring ML training.
    """
    title = f"Historical Incident {incident_id}: {service} - {root_cause[:50]}"
    content = (
        f"Historical Incident: {incident_id}\n"
        f"Service: {service}\n"
        f"Symptoms: {', '.join(symptoms)}\n"
        f"Root Cause: {root_cause}\n"
        f"Resolution Executed: {resolution_action}\n"
        f"Verification: {verification_result}\n"
    )
    doc = KnowledgeDocumentRecord(
        doc_type="historical",
        error_code=symptoms[0] if symptoms else None,
        title=title,
        service=service,
        content=content,
        remediation_suggestion=resolution_action,
        metadata_json={
            "incident_id": incident_id,
            "root_cause": root_cause,
            "verification": verification_result,
        },
    )
    db.add(doc)
    db.commit()
