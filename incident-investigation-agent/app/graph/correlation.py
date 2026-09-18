from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.schemas.evidence import CorrelationLink, EvidenceItem


def _as_dt(value: datetime | str | None) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except Exception:
        return None


def temporal_score(left: datetime | None, right: datetime | None, max_seconds: float = 1800.0) -> float:
    if not left or not right:
        return 0.0
    delta = abs((left - right).total_seconds())
    if delta > max_seconds:
        return 0.0
    return max(0.0, 1.0 - (delta / max_seconds))


def same_service(left: EvidenceItem, right: EvidenceItem) -> bool:
    if left.service and right.service:
        return left.service.lower() == right.service.lower()
    return False


def correlate_evidence(
    evidence: list[EvidenceItem],
    related_services: set[str] | None = None,
) -> list[CorrelationLink]:
    links: list[CorrelationLink] = []
    related = {item.lower() for item in (related_services or set())}
    for i, left in enumerate(evidence):
        left_ts = _as_dt(left.timestamp)
        for right in evidence[i + 1 :]:
            right_ts = _as_dt(right.timestamp)
            reasons: list[str] = []
            score = 0.0
            t_score = temporal_score(left_ts, right_ts)
            if t_score > 0:
                reasons.append("temporal")
                score += 0.45 * t_score
            if same_service(left, right):
                reasons.append("service")
                score += 0.35
            elif left.service and right.service and left.service.lower() in related and right.service.lower() in related:
                reasons.append("related_service")
                score += 0.2
            types = {left.type, right.type}
            if "deployment" in types and ("metric" in types or "kubernetes_event" in types or "alert" in types):
                reasons.append("change_and_symptom")
                score += 0.2
            if "metric" in types and "kubernetes_event" in types:
                reasons.append("metric_and_event")
                score += 0.1
            score = min(score, 1.0)
            if score >= 0.35 and reasons:
                links.append(
                    CorrelationLink(
                        left_id=left.id,
                        right_id=right.id,
                        reason="+".join(reasons),
                        score=round(score, 4),
                        details={
                            "left_type": left.type,
                            "right_type": right.type,
                            "left_source": left.source,
                            "right_source": right.source,
                        },
                    )
                )
    links.sort(key=lambda item: item.score, reverse=True)
    return links[:200]


def metric_change_flags(prometheus_payload: dict[str, Any] | None) -> list[dict[str, Any]]:
    flags: list[dict[str, Any]] = []
    if not prometheus_payload:
        return flags
    series_bundle = prometheus_payload.get("series") or []
    for series in series_bundle:
        query = series.get("query")
        result = ((series.get("result") or {}).get("result")) or []
        for item in result:
            values = item.get("values") or []
            numbers: list[float] = []
            for sample in values:
                try:
                    numbers.append(float(sample[1]))
                except (TypeError, ValueError, IndexError):
                    continue
            if len(numbers) < 2:
                continue
            start, end = numbers[0], numbers[-1]
            peak = max(numbers)
            baseline = abs(start) if start != 0 else 1.0
            rel = abs(end - start) / baseline
            if rel >= 0.5 or (peak > start * 1.5 and start >= 0):
                flags.append(
                    {
                        "query": query,
                        "start": start,
                        "end": end,
                        "peak": peak,
                        "relative_change": rel,
                        "metric": item.get("metric"),
                    }
                )
    return flags
