"""
End-to-end API route tests validating prediction boundaries and authentication states.
"""

import io
from fastapi.testclient import TestClient

def test_root_endpoint(client: TestClient):
  response = client.get("/")
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "ONLINE"
  assert "api_version" in data

def test_health_check_endpoint(client: TestClient):
  response = client.get("/health")
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "HEALTHY"
  assert data["ML_inference_engine"] == "OPERATIONAL"

def test_operator_login_endpoint(client: TestClient):
  # Valid Login credentials
  payload = {"email": "admin@windcast.ai", "password": "admin123"}
  response = client.post("/api/v1/auth/login", json=payload)
  assert response.status_code == 200
  data = response.json()
  assert "access_token" in data
  assert data["token_type"] == "bearer"
  assert data["user"]["email"] == "admin@windcast.ai"

  # Malformed Login credentials
  bad_payload = {"email": "admin@windcast.ai", "password": "wrongpassword"}
  bad_response = client.post("/api/v1/auth/login", json=bad_payload)
  assert bad_response.status_code == 401
  assert "detail" in bad_response.json()

def test_prediction_endpoint(client: TestClient):
  # Valid weather parameters
  payload = {
      "temperature": 20.5,
      "relativehu": 60.0,
      "dewpoint": 12.0,
      "windspeed": 8.5,
      "winddirec": 180.0,
      "windgust": 10.5,
      "model": "Random Forest"
  }
  
  response = client.post("/api/v1/predict", json=payload)
  assert response.status_code == 200
  data = response.json()
  assert "predicted_power" in data
  assert "efficiency" in data
  assert data["model_used"] == "Random Forest"
  assert data["efficiency"] >= 0.0 and data["efficiency"] <= 100.0

def test_prediction_boundary_validations(client: TestClient):
  # Test invalid negative wind speed boundary
  payload_bad_wind = {
      "temperature": 20.5,
      "relativehu": 60.0,
      "dewpoint": 12.0,
      "windspeed": -2.5, # Out of boundary!
      "winddirec": 180.0,
      "windgust": 10.5,
      "model": "Random Forest"
  }
  response = client.post("/api/v1/predict", json=payload_bad_wind)
  assert response.status_code == 422 # Pydantic validation error

  # Test invalid humidity bounds (>100%)
  payload_bad_humidity = {
      "temperature": 20.5,
      "relativehu": 125.0, # Out of boundary!
      "dewpoint": 12.0,
      "windspeed": 8.5,
      "winddirec": 180.0,
      "windgust": 10.5,
      "model": "Random Forest"
  }
  response = client.post("/api/v1/predict", json=payload_bad_humidity)
  assert response.status_code == 422

def test_historical_analytics_endpoint(client: TestClient):
  response = client.get("/api/v1/analytics")
  assert response.status_code == 200
  data = response.json()
  assert "average_power" in data
  assert "peak_power" in data
  assert "overall_turbine_efficiency" in data
  assert data["total_records_processed"] > 0

def test_models_listing_endpoint(client: TestClient):
  response = client.get("/api/v1/models")
  assert response.status_code == 200
  data = response.json()
  assert isinstance(data, list)
  assert len(data) >= 4
  assert data[0]["name"] in ["Hist Gradient Boosting", "Linear Regression", "Random Forest", "XGBoost"]

def test_models_status_endpoint(client: TestClient):
  response = client.get("/api/v1/models/status")
  assert response.status_code == 200
  data = response.json()
  models = data["models"]
  assert {item["name"] for item in models} == {"Random Forest", "XGBoost", "Linear Regression", "LSTM"}
  assert all(item["operational"] for item in models)

def test_batch_prediction_endpoint(client: TestClient):
  # Construct a mock CSV dataset file stream in memory
  csv_content = (
      "temperature,relativehu,dewpoint,windspeed,winddirec,windgust\n"
      "20.25,51.36,10.7,7.43,222.76,9.06\n"
      "19.24,70.29,13.25,5.6,115.44,7.18\n"
      "21.54,51.46,12.52,8.17,173.52,11.69\n"
  )
  
  csv_file = io.BytesIO(csv_content.encode("utf-8"))
  files = {"file": ("test_weather.csv", csv_file, "text/csv")}
  
  response = client.post("/api/v1/predict/batch", files=files)
  assert response.status_code == 200
  data = response.json()
  assert data["total_records"] == 3
  assert len(data["predictions"]) == 3
  assert "average_predicted_power" in data
  assert "peak_predicted_power" in data
