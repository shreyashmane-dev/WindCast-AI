"""
Forecasting and prediction API endpoints router.
"""

import io
import re
import uuid
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse

from app.api.deps import get_current_user
from app.ml.regions import display_region, list_regions, resolve_model_location
from app.ml.service import ml_service
from app.schemas.predict import BatchPredictionResponse, PredictionResponse, WeatherInput


router = APIRouter()
BACKEND_DIR = Path(__file__).resolve().parents[3]
RESULTS_DIR = BACKEND_DIR / "generated_reports"
SAMPLE_CSV = (
    "temperature,relativehu,dewpoint,windspeed,winddirec,windgust,region\n"
    "28,65,20,15,120,18,Mumbai India\n"
    "30,60,22,18,140,22,Texas USA\n"
)

COLUMN_ALIASES = {
    "temperature": ["temperature", "temp", "ambient temp", "air temp", "temperature c", "temperature celsius", "t"],
    "relativehu": ["relativehu", "humidity", "relative humidity", "rel humidity", "humidity percent", "rh"],
    "dewpoint": ["dewpoint", "dew pt", "dew point", "dew point c", "dewpoint c", "dp"],
    "windspeed": ["windspeed", "wind speed", "speed", "wind speed m/s", "windspeed m/s", "ws"],
    "winddirec": ["winddirec", "wind direction", "direction", "wind direction deg", "winddirec deg", "wd"],
    "windgust": ["windgust", "wind gust", "gust", "wind gust m/s", "windgust m/s", "wg"],
    "Power": ["power", "actual power", "power output", "actual power kw", "power kw", "generation", "p"],
    "region": ["region", "location", "city", "country", "site", "area"],
}


def _normalize_column(value: str) -> str:
  return re.sub(r"[^a-z0-9]+", " ", str(value).strip().lower()).strip()


def _detect_columns(frame: pd.DataFrame) -> dict[str, str]:
  normalized_columns = {_normalize_column(column): column for column in frame.columns}
  mapping: dict[str, str] = {}
  for canonical, aliases in COLUMN_ALIASES.items():
    for alias in aliases:
      normalized_alias = _normalize_column(alias)
      if normalized_alias in normalized_columns:
        mapping[canonical] = normalized_columns[normalized_alias]
        break
  return mapping


def _numeric_value(row: pd.Series, mapping: dict[str, str], key: str, row_number: int, default: float | None = None) -> float:
  column = mapping.get(key)
  if column is None:
    if default is None:
      raise ValueError(f"Row {row_number}: missing required column '{key}'.")
    return default

  value = pd.to_numeric(row[column], errors="coerce")
  if pd.isna(value):
    if default is None:
      raise ValueError(f"Row {row_number}: column '{column}' must contain a valid number.")
    return default
  return float(value)


def _build_insights(mode: str, windspeeds: list[float], predictions: list[float], alert_count: int, r2_value: float | None) -> list[str]:
  insights = []
  avg_wind = float(np.mean(windspeeds))
  avg_power = float(np.mean(predictions))

  if avg_wind >= 12.0:
    insights.append("High wind conditions detected. Expected power efficiency is strong for the selected region.")
  elif avg_wind < 4.0:
    insights.append("Low wind conditions detected. Several intervals may remain near turbine idle range.")
  else:
    insights.append("Stable wind conditions detected. Forecast output is suitable for operational planning.")

  if alert_count:
    insights.append(f"{alert_count} rows triggered operational alerts and should be reviewed before dispatch.")
  else:
    insights.append("No critical wind safety alerts were detected in the uploaded file.")

  insights.append(f"Average predicted output is {avg_power:.2f} kW across the uploaded rows.")

  if mode == "analytics" and r2_value is not None:
    if r2_value >= 0.70:
      insights.append(f"Historical analytics mode found useful alignment with actual power values (R2: {r2_value:.3f}).")
    else:
      insights.append(f"Historical analytics mode found prediction drift against actual values (R2: {r2_value:.3f}).")
  return insights


@router.get("/regions")
def get_supported_regions(current_user: dict = Depends(get_current_user)):
  return {"regions": list_regions()}


@router.get("/sample-csv")
def download_sample_csv(current_user: dict = Depends(get_current_user)):
  return StreamingResponse(
      io.BytesIO(SAMPLE_CSV.encode("utf-8")),
      media_type="text/csv",
      headers={"Content-Disposition": "attachment; filename=windcast_sample_upload.csv"},
  )


@router.get("/batch/download/{file_id}")
def download_batch_result(file_id: str, current_user: dict = Depends(get_current_user)):
  safe_file = Path(file_id).name
  path = RESULTS_DIR / safe_file
  if not path.exists() or path.suffix.lower() != ".csv":
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction result file was not found or has expired.")
  return FileResponse(path, media_type="text/csv", filename="predicted_results.csv")


@router.post("", response_model=PredictionResponse)
def get_prediction(payload: WeatherInput, current_user: dict = Depends(get_current_user)):
  """
  Executes an ML forecast on a single weather telemetry snapshot.
  """
  features = {
      "temperature": payload.temperature,
      "relativehu": payload.relativehu,
      "dewpoint": payload.dewpoint,
      "windspeed": payload.windspeed,
      "winddirec": payload.winddirec,
      "windgust": payload.windgust,
      "location": resolve_model_location(payload.location),
  }

  try:
    prediction = ml_service.predict(payload.model, features)
    return PredictionResponse(**prediction)
  except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"ML pipeline execution failure: {str(e)}",
    )


@router.post("/batch", response_model=BatchPredictionResponse)
async def get_batch_prediction(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
  """
  Upload weather parameter CSVs for batch prediction or historical analytics.
  """
  if not file.filename or not file.filename.lower().endswith(".csv"):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"message": "Invalid file format. Upload a CSV file.", "sample_url": "/api/v1/predict/sample-csv"},
    )

  try:
    contents = await file.read()
    frame = pd.read_csv(io.BytesIO(contents))
  except Exception as err:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Could not read CSV. Please upload a clean comma-separated file. Error: {str(err)}",
    )

  if frame.empty:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV dataset is empty.")

  mapping = _detect_columns(frame)
  required = ["temperature", "windspeed"]
  missing = [column for column in required if column not in mapping]
  if missing:
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={
            "message": f"Missing required columns: {', '.join(missing)}",
            "required_minimum": required,
            "recommended_template": "temperature,relativehu,dewpoint,windspeed,winddirec,windgust,region",
            "sample_url": "/api/v1/predict/sample-csv",
        },
    )

  mode = "analytics" if "Power" in mapping else "predict"
  validation_warnings = []
  if "relativehu" not in mapping:
    validation_warnings.append("relativehu missing; defaulted to 60%.")
  if "dewpoint" not in mapping:
    validation_warnings.append("dewpoint missing; estimated from temperature and humidity.")
  if "winddirec" not in mapping:
    validation_warnings.append("winddirec missing; defaulted to 180 degrees.")
  if "windgust" not in mapping:
    validation_warnings.append("windgust missing; estimated as windspeed x 1.25.")
  if "region" not in mapping:
    validation_warnings.append("region missing; defaulted to Mumbai, India.")

  predictions: list[float] = []
  confidences: list[float] = []
  efficiencies: list[float] = []
  alerts: list[str] = []
  regions: list[str] = []
  windspeeds: list[float] = []
  temperatures: list[float] = []
  actuals: list[float] = []
  alert_count = 0

  try:
    for index, row in frame.iterrows():
      row_number = int(index) + 2
      temp_val = _numeric_value(row, mapping, "temperature", row_number)
      ws_val = _numeric_value(row, mapping, "windspeed", row_number)
      rh_val = _numeric_value(row, mapping, "relativehu", row_number, default=60.0)
      wd_val = _numeric_value(row, mapping, "winddirec", row_number, default=180.0)
      wg_val = _numeric_value(row, mapping, "windgust", row_number, default=ws_val * 1.25)
      dp_val = _numeric_value(row, mapping, "dewpoint", row_number, default=temp_val - ((100.0 - rh_val) / 5.0))
      region_raw = str(row[mapping["region"]]) if "region" in mapping and pd.notna(row[mapping["region"]]) else "Mumbai, India"
      model_location = resolve_model_location(region_raw)

      result = ml_service.predict(
          "XGBoost",
          {
              "temperature": temp_val,
              "relativehu": rh_val,
              "dewpoint": dp_val,
              "windspeed": ws_val,
              "winddirec": wd_val,
              "windgust": wg_val,
              "location": model_location,
          },
      )

      predictions.append(float(result["predicted_power"]))
      confidences.append(float(result["confidence_score"]))
      efficiencies.append(float(result["efficiency"]))
      alerts.append(str(result["alert_status"]))
      regions.append(display_region(model_location))
      windspeeds.append(ws_val)
      temperatures.append(temp_val)

      if result["alert_status"] != "Normal Grid Synced":
        alert_count += 1
      if mode == "analytics":
        actuals.append(_numeric_value(row, mapping, "Power", row_number))
  except ValueError as err:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(err))
  except Exception as err:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Batch prediction failed: {str(err)}")

  result_frame = frame.copy()
  result_frame["Predicted_Power"] = predictions
  result_frame["Prediction_Confidence"] = confidences
  result_frame["Efficiency_Percent"] = efficiencies
  result_frame["Alert_Status"] = alerts
  result_frame["Resolved_Region"] = regions

  RESULTS_DIR.mkdir(parents=True, exist_ok=True)
  file_id = f"{uuid.uuid4().hex}.csv"
  result_path = RESULTS_DIR / file_id
  result_frame.to_csv(result_path, index=False)

  mae_val = rmse_val = r2_val = None
  if mode == "analytics" and actuals:
    actual_arr = np.asarray(actuals, dtype=float)
    pred_arr = np.asarray(predictions, dtype=float)
    mae_val = float(np.mean(np.abs(actual_arr - pred_arr)))
    rmse_val = float(np.sqrt(np.mean((actual_arr - pred_arr) ** 2)))
    ss_res = float(np.sum((actual_arr - pred_arr) ** 2))
    ss_tot = float(np.sum((actual_arr - np.mean(actual_arr)) ** 2))
    r2_val = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 1.0

  return BatchPredictionResponse(
      mode=mode,
      total_records=len(predictions),
      count=len(predictions),
      average_predicted_power=round(float(np.mean(predictions)), 2),
      peak_predicted_power=round(float(np.max(predictions)), 2),
      min_predicted_power=round(float(np.min(predictions)), 2),
      alert_records_count=alert_count,
      predictions=[round(value, 2) for value in predictions],
      windspeeds=windspeeds,
      temperatures=temperatures,
      download_url=f"/api/v1/predict/batch/download/{file_id}",
      result_file_id=file_id,
      column_mapping=mapping,
      validation_warnings=validation_warnings,
      result_preview=result_frame.head(10).to_dict(orient="records"),
      actual_power=actuals if mode == "analytics" else None,
      mae=round(mae_val, 2) if mae_val is not None else None,
      rmse=round(rmse_val, 2) if rmse_val is not None else None,
      r2=round(r2_val, 3) if r2_val is not None else None,
      ai_insights=_build_insights(mode, windspeeds, predictions, alert_count, r2_val),
  )
