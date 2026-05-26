from __future__ import annotations

import math
from datetime import datetime
from typing import Dict

import numpy as np
import pandas as pd

from app.ml.regions import resolve_model_location


RAW_COLUMNS = ["temperature", "relativehu", "dewpoint", "windspeed", "winddirec", "windgust"]
LOCATION_VALUES = ["Location1", "Location2", "Location3", "Location4"]
LOCATION_COLUMNS = [f"location_{location.lower()}" for location in LOCATION_VALUES]
DERIVED_COLUMNS = [
    "hour",
    "day",
    "month",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos",
    "winddirec_sin",
    "winddirec_cos",
    "windspeed_sq",
    "windspeed_cu",
    "gust_factor",
    "gust_delta",
    "temp_dew_spread",
]
FEATURE_COLUMNS = RAW_COLUMNS + DERIVED_COLUMNS + LOCATION_COLUMNS
TARGET_COLUMN = "Power"


def add_time_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.copy()
    if "timestamp" in enriched.columns:
        time_values = pd.to_datetime(enriched["timestamp"], errors="coerce")
    elif "Time" in enriched.columns:
        time_values = pd.to_datetime(enriched["Time"], errors="coerce")
    else:
        time_values = pd.Series(pd.Timestamp.utcnow(), index=enriched.index)
    time_values = time_values.fillna(pd.Timestamp.utcnow())
    enriched["hour"] = time_values.dt.hour
    enriched["day"] = time_values.dt.day
    enriched["month"] = time_values.dt.month
    return add_weather_features(enriched)


def add_weather_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.copy()
    for column in RAW_COLUMNS:
        enriched[column] = pd.to_numeric(enriched[column], errors="coerce")

    hour_angle = 2 * math.pi * enriched["hour"].astype(float) / 24.0
    month_angle = 2 * math.pi * (enriched["month"].astype(float) - 1.0) / 12.0
    direction_angle = np.deg2rad(enriched["winddirec"].astype(float))
    windspeed = enriched["windspeed"].astype(float).clip(lower=0)
    windgust = enriched["windgust"].astype(float).clip(lower=0)

    enriched["hour_sin"] = np.sin(hour_angle)
    enriched["hour_cos"] = np.cos(hour_angle)
    enriched["month_sin"] = np.sin(month_angle)
    enriched["month_cos"] = np.cos(month_angle)
    enriched["winddirec_sin"] = np.sin(direction_angle)
    enriched["winddirec_cos"] = np.cos(direction_angle)
    enriched["windspeed_sq"] = windspeed**2
    enriched["windspeed_cu"] = windspeed**3
    enriched["gust_factor"] = windgust / np.maximum(windspeed, 0.1)
    enriched["gust_delta"] = windgust - windspeed
    enriched["temp_dew_spread"] = enriched["temperature"].astype(float) - enriched["dewpoint"].astype(float)
    location = enriched.get("location", "Location1")
    if not isinstance(location, pd.Series):
        location = pd.Series(location, index=enriched.index)
    location = location.fillna("Location1").astype(str).map(resolve_model_location)
    for value, column in zip(LOCATION_VALUES, LOCATION_COLUMNS):
        enriched[column] = (location.str.lower() == value.lower()).astype(float)
    return enriched


def weather_to_frame(payload: Dict[str, float], timestamp: datetime | None = None, location: str = "Location1") -> pd.DataFrame:
    row = {column: float(payload[column]) for column in RAW_COLUMNS}
    ts = timestamp or datetime.utcnow()
    row.update({"hour": ts.hour, "day": ts.day, "month": ts.month, "location": location})
    return add_weather_features(pd.DataFrame([row]))[FEATURE_COLUMNS]
