import pytest


@pytest.fixture(scope="session", autouse=True)
def _ensure_data_dir():
    from pathlib import Path

    Path("data").mkdir(exist_ok=True)
