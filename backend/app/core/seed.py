from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Deployment, DeploymentStatus, Service, ServiceDependency, Severity


DEMO_SERVICES = [
    {
        "name": "api-gateway",
        "display_name": "API Gateway",
        "kind": "gateway",
        "business_function": "Customer entrypoint",
        "criticality": Severity.HIGH,
    },
    {
        "name": "payment-service",
        "display_name": "Payment Service",
        "kind": "application",
        "business_function": "Checkout / customer transactions",
        "criticality": Severity.CRITICAL,
    },
    {
        "name": "postgres-primary",
        "display_name": "PostgreSQL",
        "kind": "database",
        "business_function": "Transaction persistence",
        "criticality": Severity.CRITICAL,
    },
    {
        "name": "auth-service",
        "display_name": "Authentication Service",
        "kind": "application",
        "business_function": "Identity",
        "criticality": Severity.HIGH,
    },
    {
        "name": "order-service",
        "display_name": "Order Service",
        "kind": "application",
        "business_function": "Order management",
        "criticality": Severity.HIGH,
    },
    {
        "name": "redis",
        "display_name": "Redis",
        "kind": "cache",
        "business_function": "Session / cache",
        "criticality": Severity.MEDIUM,
    },
]

DEMO_DEPENDENCIES = [
    ("api-gateway", "payment-service"),
    ("api-gateway", "auth-service"),
    ("api-gateway", "order-service"),
    ("payment-service", "postgres-primary"),
    ("payment-service", "redis"),
    ("order-service", "postgres-primary"),
    ("auth-service", "redis"),
]


async def seed_catalog(db: AsyncSession) -> None:
    result = await db.execute(select(Service))
    existing = {service.name: service for service in result.scalars().all()}

    if not existing:
        for item in DEMO_SERVICES:
            db.add(Service(**item))
        await db.flush()
        result = await db.execute(select(Service))
        existing = {service.name: service for service in result.scalars().all()}

        for source_name, target_name in DEMO_DEPENDENCIES:
            db.add(
                ServiceDependency(
                    source_service_id=existing[source_name].id,
                    target_service_id=existing[target_name].id,
                    dependency_type="runtime",
                )
            )

    deploy_result = await db.execute(select(Deployment))
    if not deploy_result.scalars().first() and "payment-service" in existing:
        now = datetime.now(timezone.utc)
        db.add(
            Deployment(
                service_id=existing["payment-service"].id,
                version="v2.4.1",
                environment="production",
                status=DeploymentStatus.SUCCEEDED,
                source="github-actions",
                deployed_at=now - timedelta(minutes=2),
                meta={"commit": "abc1234", "author": "payments-bot", "bad_release": True},
            )
        )
        db.add(
            Deployment(
                service_id=existing["payment-service"].id,
                version="v2.4.0",
                environment="production",
                status=DeploymentStatus.SUCCEEDED,
                source="github-actions",
                deployed_at=now - timedelta(days=2),
                meta={"commit": "def5678", "stable": True},
            )
        )

    await db.commit()
