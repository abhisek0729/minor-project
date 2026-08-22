import os
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/toursphere")
os.environ.setdefault("JWT_SECRET", "test-secret")
from fastapi.testclient import TestClient
from app.main import app

def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
