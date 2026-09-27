from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_token():
    # Creates (or reuses) a test user and returns a valid access token
    client.post("/register", json={"username": "testuser", "password": "testpass123"})
    response = client.post("/login", data={"username": "testuser", "password": "testpass123"})
    return response.json()["access_token"]


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, this is my first FastAPI app!"}


def test_get_all_tasks():
    token = get_token()
    response = client.get("/tasks", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_create_task():
    token = get_token()
    response = client.post(
        "/tasks",
        json={"title": "Test task from pytest", "done": False},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test task from pytest"
    assert data["done"] == False
    assert "id" in data