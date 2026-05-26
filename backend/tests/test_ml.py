"""
Unit tests for the ML service layer, checking fallbacks, constraints, and metrics scaling.
"""

import pytest
from app.ml.service import ml_service

def test_ml_service_models_list():
  models = ml_service.get_available_models()
  assert len(models) >= 4
  names = [m["name"] for m in models]
  assert "Random Forest" in names
  assert "XGBoost" in names
  assert "Linear Regression" in names
  assert "LSTM" in names

def test_ml_service_predict_successful():
  weather = {
      "temperature": 18.5,
      "relativehu": 45.0,
      "dewpoint": 6.8,
      "windspeed": 12.4,
      "winddirec": 240.0,
      "windgust": 14.8
  }

  models = ["Random Forest", "XGBoost", "Linear Regression", "LSTM"]

  for model in models:
    res = ml_service.predict(model, weather)
    assert res["model_used"] == model
    assert res["predicted_power"] >= 0.0
    assert res["predicted_power"] <= 2200.0
    assert res["efficiency"] >= 0.0 and res["efficiency"] <= 100.0
    assert "alert_status" in res
    assert res["confidence_score"] > 0.6

def test_ml_service_models_return_distinct_outputs():
  weather = {
      "temperature": 20.25,
      "relativehu": 51.36,
      "dewpoint": 10.7,
      "windspeed": 7.43,
      "winddirec": 222.76,
      "windgust": 9.06
  }

  outputs = {
      model: ml_service.predict(model, weather)["predicted_power"]
      for model in ["Random Forest", "XGBoost", "Linear Regression", "LSTM"]
  }

  assert len(set(outputs.values())) >= 3

def test_ml_service_model_status_operational():
  status = ml_service.get_model_status()
  assert {item["name"] for item in status} == {"Random Forest", "XGBoost", "Linear Regression", "LSTM"}
  assert all(item["operational"] for item in status)
  assert all(item["inference_mode"] in {"trained_model", "surrogate"} for item in status)

def test_ml_service_safeguard_alerts():
  # 1. Storm cut-off alert (>25 m/s)
  storm_weather = {
      "temperature": 18.5,
      "relativehu": 45.0,
      "dewpoint": 6.8,
      "windspeed": 27.5, # Heavy storm!
      "winddirec": 240.0,
      "windgust": 31.2
  }
  res = ml_service.predict("Random Forest", storm_weather)
  assert res["alert_status"] == "Storm Safety Cut-off Active"

  # 2. Idle state alert (<3 m/s)
  calm_weather = {
      "temperature": 18.5,
      "relativehu": 45.0,
      "dewpoint": 6.8,
      "windspeed": 1.2, # Extremely calm!
      "winddirec": 240.0,
      "windgust": 1.5
  }
  res = ml_service.predict("Random Forest", calm_weather)
  assert res["alert_status"] == "Sub-optimal Wind: Idle State"

def test_ml_service_fallback_mechanisms():
  weather = {
      "temperature": 18.5,
      "relativehu": 45.0,
      "dewpoint": 6.8,
      "windspeed": 12.4,
      "winddirec": 240.0,
      "windgust": 14.8
  }

  # Request a fake model name that does not exist on disk
  res = ml_service.predict("Nonexistent Neural Net Model", weather)
  
  # Assert it fell back gracefully and printed a warning
  assert res["model_used"] in ["XGBoost", "Random Forest", "Linear Regression"]
  assert "warning" in res
  assert res["warning"] is not None
  assert "fallback" in res["warning"]
