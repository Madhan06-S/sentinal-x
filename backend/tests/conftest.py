import pytest
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.seed import seed_catalog
from app.services import jobs

@pytest.fixture(autouse=True)
async def initialize_test_database():
    jobs.ENABLED = False
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_catalog(session)
    yield
