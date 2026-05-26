from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class WeatherInput(BaseModel):
    temperature: float = Field(..., ge=-100, le=100)
    relativehu: float = Field(..., ge=0, le=100)
    dewpoint: float = Field(..., ge=-100, le=100)
    windspeed: float = Field(..., ge=0, le=100)
    winddirec: float = Field(..., ge=0, le=360)
    windgust: float = Field(..., ge=0, le=150)
    timestamp: Optional[datetime] = None


class PredictionResponse(BaseModel):
    predicted_power: float
    confidence_score: float
    model_used: str
    units: str = "normalized_power"
    alert: str
    inference_ms: float
    request_timestamp: str


class BatchPredictionItem(BaseModel):
    index: int
    predicted_power: float
    confidence_score: float
    model_used: str


class BatchPredictionResponse(BaseModel):
    count: int
    predictions: List[BatchPredictionItem]
    average_predicted_power: float
    inference_ms: float
