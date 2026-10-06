import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.seed import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    seed_database()

@pytest.fixture
def client():
    return TestClient(app)

def test_root_and_health(client):
    r1 = client.get("/")
    assert r1.status_code == 200
    assert r1.json()["status"] == "ONLINE"
    assert r1.json()["simulation_mode"] is True

    r2 = client.get("/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"

def test_dashboard_stats(client):
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["spacecraft_id"] == "SC-01"
    assert "recent_alerts" in data
    assert len(data["recent_alerts"]) >= 4
    assert "investigation_queue" in data

def test_anomalies_list_and_get(client):
    res = client.get("/api/anomalies")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 5
    assert any(a["id"] == "ANOM-004" for a in data["items"])

    res_single = client.get("/api/anomalies/ANOM-004")
    assert res_single.status_code == 200
    assert res_single.json()["subsystem"] == "POWER"

def test_telemetry_endpoints(client):
    res_list = client.get("/api/telemetry?limit=10")
    assert res_list.status_code == 200
    assert len(res_list.json()) > 0

    res_params = client.get("/api/telemetry/parameters")
    assert res_params.status_code == 200
    param_names = [p["parameter"] for p in res_params.json()]
    assert "Battery Current" in param_names
    assert "Battery Temperature" in param_names

    res_corr = client.post("/api/telemetry/correlate", json={"subsystem": "POWER"})
    assert res_corr.status_code == 200
    corr_data = res_corr.json()
    assert "correlations" in corr_data

def test_evidence_endpoints(client):
    res_ev = client.get("/api/evidence?anomaly_id=ANOM-004")
    assert res_ev.status_code == 200
    assert res_ev.json()["total"] >= 5

    res_val = client.post("/api/evidence/validate", json={
        "evidence_id": "TEL-4821",
        "validation_status": "VALIDATED",
        "validation_notes": "Tested in test suite"
    })
    assert res_val.status_code == 200
    assert res_val.json()["validation_status"] == "VALIDATED"

def test_investigation_and_copilot(client):
    res_inv = client.get("/api/investigations/ANOM-004")
    assert res_inv.status_code == 200
    data = res_inv.json()
    assert data["anomaly_id"] == "ANOM-004"
    assert data["confidence"] > 0.70
    assert len(data["next_steps"]) >= 4

    res_chat = client.post("/api/copilot/query", json={
        "query": "Why was this anomaly detected?",
        "anomaly_id": "ANOM-004"
    })
    assert res_chat.status_code == 200
    chat_data = res_chat.json()
    assert "battery current" in chat_data["answer"].lower()
    assert chat_data["confidence"] > 0.70

def test_timeline_and_audit(client):
    res_timeline = client.get("/api/timeline?anomaly_id=ANOM-004")
    assert res_timeline.status_code == 200
    assert len(res_timeline.json()) >= 5

    res_audit = client.get("/api/audit")
    assert res_audit.status_code == 200
    assert res_audit.json()["total"] > 0

def test_demo_reset(client):
    res_demo = client.post("/api/demo/load")
    assert res_demo.status_code == 200
    assert res_demo.json()["status"] == "success"
