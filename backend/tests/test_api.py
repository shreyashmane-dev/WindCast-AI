from __future__ import annotations


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"].lower() == "healthy"
    assert "model_status" in body or "ML_inference_engine" in body


def test_prediction_validation(client):
    response = client.post(
        "/api/v1/predict",
        json={
            "temperature": 25,
            "relativehu": 70,
            "dewpoint": 20,
            "windspeed": 8,
            "winddirec": 180,
            "windgust": 12,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["predicted_power"] >= 0
    assert 0 <= body["confidence_score"] <= 1
    assert body["model_used"]


def test_bad_prediction_payload(client):
    response = client.post(
        "/api/v1/predict",
        json={
            "temperature": 25,
            "relativehu": 150,
            "dewpoint": 20,
            "windspeed": 8,
            "winddirec": 180,
            "windgust": 12,
        },
    )
    assert response.status_code == 422


def test_models(client):
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    assert "available_models" in response.json() or any("name" in m for m in response.json())


def test_analytics(client):
    response = client.get("/api/v1/analytics")
    assert response.status_code == 200
    body = response.json()
    assert (body.get("sample_count") is not None and body["sample_count"] > 0) or (body.get("total_records_processed") is not None and body["total_records_processed"] > 0)
    assert isinstance(body.get("trend_analysis") or body.get("power_history") or [], list)
