"""
Pydantic validation schemas for ML forecasts and batch file uploads.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class WeatherInput(BaseModel):
  temperature: float = Field(..., description="Ambient temperature in C", json_schema_extra={"example": 22.4})
  relativehu: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in %", json_schema_extra={"example": 55.0})
  dewpoint: float = Field(..., description="Dewpoint in C", json_schema_extra={"example": 12.8})
  windspeed: float = Field(..., ge=0.0, description="Average wind speed in m/s", json_schema_extra={"example": 8.5})
  winddirec: float = Field(..., ge=0.0, le=360.0, description="Wind direction in degrees", json_schema_extra={"example": 210.0})
  windgust: float = Field(..., ge=0.0, description="Wind gust speed in m/s", json_schema_extra={"example": 10.2})
  location: str = Field("Mumbai, India", description="Human region name or city/country", json_schema_extra={"example": "Mumbai, India"})
  model: str = Field("XGBoost", description="Forecasting ML model to execute", json_schema_extra={"example": "XGBoost"})


class PredictionResponse(BaseModel):
  predicted_power: float = Field(..., description="Predicted wind power generation output in kW")
  efficiency: float = Field(..., description="Calculated turbine conversion efficiency ratio in %")
  alert_status: str = Field(..., description="Turbine safeguard warning message")
  confidence_score: float = Field(..., description="Active ML model validation accuracy index")
  model_used: str = Field(..., description="Name of the model executed for inference")
  region: Optional[str] = Field(None, description="Resolved human-readable wind region")
  warning: Optional[str] = Field(None, description="Fallback or data warning flags")


class BatchPredictionResponse(BaseModel):
  mode: str = Field(..., description="Active upload audit mode: 'predict' or 'analytics'")
  total_records: int = Field(..., description="Total rows parsed from CSV upload")
  count: int = Field(..., description="Total rows parsed from CSV upload for backwards compatibility")
  average_predicted_power: float = Field(..., description="Average predicted kW across all rows")
  peak_predicted_power: float = Field(..., description="Maximum single predicted kW in sequence")
  min_predicted_power: Optional[float] = Field(None, description="Minimum predicted kW across all rows")
  alert_records_count: int = Field(..., description="Total intervals triggering operational warnings")
  predictions: List[float] = Field(..., description="Full array of generated power outputs")
  windspeeds: List[float] = Field(..., description="Array of wind speed inputs in m/s")
  temperatures: List[float] = Field(..., description="Array of temperature inputs in C")
  download_url: Optional[str] = Field(None, description="Download URL for CSV with Predicted_Power column")
  result_file_id: Optional[str] = Field(None, description="Generated result file identifier")
  column_mapping: Optional[Dict[str, str]] = Field(None, description="Detected CSV column mapping")
  validation_warnings: List[str] = Field(default_factory=list, description="Non-fatal upload normalization warnings")
  result_preview: List[Dict[str, Any]] = Field(default_factory=list, description="First result rows for dashboard preview")

  # Mode 2 historical actuals analytics.
  actual_power: Optional[List[float]] = Field(None, description="Actual power output values if provided")
  mae: Optional[float] = Field(None, description="Mean Absolute Error of model prediction accuracy")
  rmse: Optional[float] = Field(None, description="Root Mean Squared Error of predictions")
  r2: Optional[float] = Field(None, description="R-Squared variance coefficient score")

  ai_insights: List[str] = Field(..., description="AI grid alerts and efficiency summaries")
