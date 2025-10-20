import pytest
from fastapi.testclient import TestClient

from src import app as module


@pytest.fixture(scope="module")
def client():
    """Provide a TestClient for the FastAPI app."""
    with TestClient(module.app) as c:
        yield c
