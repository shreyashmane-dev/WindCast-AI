from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel


class ModelMetric(BaseModel):
    model: str
    mae: float
    rmse: float
    r2: float
    mape: float


class ModelsResponse(BaseModel):
    active_model: str
    available_models: List[str]
    metrics: List[ModelMetric]
    comparison: Dict[str, str | float]
