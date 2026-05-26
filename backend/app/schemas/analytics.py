from __future__ import annotations

from typing import List

from pydantic import BaseModel


class TrendPoint(BaseModel):
    timestamp: str
    power: float
    windspeed: float


class AnalyticsResponse(BaseModel):
    average_power: float
    max_power: float
    min_power: float
    efficiency: float
    sample_count: int
    trend_direction: str
    trend_analysis: List[TrendPoint]
