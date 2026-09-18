from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Deployment, Service, ServiceDependency
from app.schemas.schemas import GraphEdge, GraphNode, IncidentGraphResponse


async def list_services(db: AsyncSession) -> list[Service]:
    result = await db.execute(select(Service).order_by(Service.name.asc()))
    return list(result.scalars().all())


async def get_service_by_id(db: AsyncSession, service_id: str) -> Service | None:
    result = await db.execute(
        select(Service)
        .options(selectinload(Service.outgoing_dependencies), selectinload(Service.incoming_dependencies))
        .where(Service.id == service_id)
    )
    return result.scalars().first()


async def get_service_by_name(db: AsyncSession, name: str) -> Service | None:
    result = await db.execute(select(Service).where(Service.name == name))
    return result.scalars().first()


async def list_deployments(db: AsyncSession, service_id: str | None = None) -> list[Deployment]:
    stmt = select(Deployment).order_by(Deployment.deployed_at.desc())
    if service_id:
        stmt = stmt.where(Deployment.service_id == service_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def recent_deployments(db: AsyncSession, minutes: int = 60) -> list[Deployment]:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    result = await db.execute(
        select(Deployment)
        .options(selectinload(Deployment.service))
        .where(Deployment.deployed_at >= cutoff)
        .order_by(Deployment.deployed_at.desc())
    )
    return list(result.scalars().all())


async def service_graph(db: AsyncSession) -> tuple[list[Service], list[ServiceDependency]]:
    services = await list_services(db)
    deps = (await db.execute(select(ServiceDependency))).scalars().all()
    return services, list(deps)


async def catalog_graph_payload(db: AsyncSession) -> dict:
    services, deps = await service_graph(db)
    by_id = {s.id: s.name for s in services}
    return {
        "nodes": [
            {
                "id": s.name,
                "label": s.display_name,
                "type": s.kind,
                "business_function": s.business_function,
                "criticality": s.criticality.value if s.criticality else None,
            }
            for s in services
        ],
        "edges": [
            {
                "id": d.id,
                "source": by_id.get(d.source_service_id, d.source_service_id),
                "target": by_id.get(d.target_service_id, d.target_service_id),
                "type": d.dependency_type,
            }
            for d in deps
        ],
    }


def related_service_names(service_name: str, graph: dict, hops: int = 2) -> set[str]:
    related = {service_name}
    frontier = {service_name}
    for _ in range(hops):
        nxt: set[str] = set()
        for edge in graph.get("edges", []):
            source, target = edge.get("source"), edge.get("target")
            if source in frontier:
                nxt.add(target)
            if target in frontier:
                nxt.add(source)
        nxt -= related
        if not nxt:
            break
        related |= nxt
        frontier = nxt
    return related


def incident_graph_from_payload(incident_id: str, graph: dict | None) -> IncidentGraphResponse:
    graph = graph or {"nodes": [], "edges": []}
    nodes = [
        GraphNode(
            id=node.get("id") or node.get("label"),
            type=node.get("type", "service"),
            label=node.get("label") or node.get("id"),
            data={k: v for k, v in node.items() if k not in {"id", "label", "type"}},
        )
        for node in graph.get("nodes", [])
    ]
    edges = [
        GraphEdge(
            id=edge.get("id") or f"{edge.get('source')}-{edge.get('target')}",
            source=edge.get("source"),
            target=edge.get("target"),
            label=edge.get("label") or edge.get("type"),
            data={k: v for k, v in edge.items() if k not in {"id", "source", "target", "label"}},
        )
        for edge in graph.get("edges", [])
    ]
    return IncidentGraphResponse(incident_id=incident_id, nodes=nodes, edges=edges)
