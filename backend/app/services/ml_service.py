from __future__ import annotations

import asyncio
import json
import time
from pathlib import Path
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

from app.core.config import get_settings
from app.ml.features import FEATURE_COLUMNS, RAW_COLUMNS, TARGET_COLUMN, add_time_features, weather_to_frame
from app.services.cache import TTLCache
from app.utils.time import utc_now_iso


class MLService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model_dir = Path(settings.model_dir)
        self.dataset_path = Path(settings.dataset_path)
        if not self.dataset_path.is_absolute():
            self.dataset_path = Path.cwd() / self.dataset_path
        self.cache = TTLCache(settings.cache_ttl_seconds)
        self._models: dict[str, Any] = {}
        self._active_model_name = settings.default_model_name
        self._dataset: pd.DataFrame | None = None
        self._started_at = time.time()

    @property
    def uptime_seconds(self) -> float:
        return time.time() - self._started_at

    def metadata(self) -> dict[str, Any]:
        path = self.model_dir / "metadata.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
        return {"best_model": self._active_model_name, "feature_columns": FEATURE_COLUMNS}

    def available_models(self) -> List[str]:
        names = [path.stem for path in self.model_dir.glob("*.pkl") if path.stem not in {"lstm_scaler"}]
        if (self.model_dir / "lstm.h5").exists():
            names.append("lstm")
        return sorted(set(names))

    def active_model_name(self) -> str:
        metadata = self.metadata()
        best = metadata.get("best_model")
        if best and (self.model_dir / f"{best}.pkl").exists():
            return best
        if (self.model_dir / "best_model.pkl").exists():
            return "best_model"
        return self._active_model_name

    def load_model(self, name: str | None = None):
        model_name = name or self.active_model_name()
        if model_name in self._models:
            return self._models[model_name], model_name
        candidates = [self.model_dir / f"{model_name}.pkl", self.model_dir / "best_model.pkl"]
        for path in candidates:
            if path.exists():
                model = joblib.load(path)
                self._models[model_name] = model
                return model, model_name
        raise RuntimeError("No trained model found. Run: python backend/scripts/train_models.py")

    def load_dataset(self) -> pd.DataFrame:
        if self._dataset is not None:
            return self._dataset
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found: {self.dataset_path}")
        frame = pd.read_csv(self.dataset_path)
        frame = add_time_features(frame)
        frame = frame.dropna(subset=RAW_COLUMNS + [TARGET_COLUMN])
        self._dataset = frame
        return frame

    def confidence(self, prediction: float) -> float:
        metrics = self.metrics()
        active = self.active_model_name()
        rmse = next((item["rmse"] for item in metrics if item["model"] == active), None)
        if rmse is None and metrics:
            rmse = metrics[0].get("rmse")
        rmse = float(rmse or 0.25)
        score = 1.0 - min(rmse / max(abs(prediction), 1.0), 0.95)
        return round(float(np.clip(score, 0.05, 0.99)), 4)

    async def predict(self, payload: Dict[str, float], timestamp=None) -> Dict[str, Any]:
        cache_key = json.dumps({**payload, "timestamp": str(timestamp)}, sort_keys=True)
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        start = time.perf_counter()
        model, model_name = self.load_model()
        frame = weather_to_frame(payload, timestamp=timestamp)
        prediction = await asyncio.to_thread(model.predict, frame[FEATURE_COLUMNS])
        value = float(max(prediction[0], 0.0))
        result = {
            "predicted_power": round(value, 6),
            "confidence_score": self.confidence(value),
            "model_used": model_name,
            "units": "normalized_power",
            "alert": "low_power" if value < get_settings().low_power_threshold else "normal",
            "inference_ms": round((time.perf_counter() - start) * 1000, 3),
            "request_timestamp": utc_now_iso(),
        }
        self.cache.set(cache_key, result)
        return result

    async def predict_batch(self, frame: pd.DataFrame) -> Dict[str, Any]:
        start = time.perf_counter()
        missing = [column for column in RAW_COLUMNS if column not in frame.columns]
        if missing:
            raise ValueError(f"CSV missing required columns: {missing}")
        model, model_name = self.load_model()
        prepared = add_time_features(frame)
        for column in RAW_COLUMNS:
            prepared[column] = pd.to_numeric(prepared[column], errors="coerce")
        prepared[RAW_COLUMNS] = prepared[RAW_COLUMNS].fillna(prepared[RAW_COLUMNS].median(numeric_only=True))
        predictions = await asyncio.to_thread(model.predict, prepared[FEATURE_COLUMNS])
        values = np.maximum(predictions, 0.0)
        items = [
            {
                "index": int(index),
                "predicted_power": round(float(value), 6),
                "confidence_score": self.confidence(float(value)),
                "model_used": model_name,
            }
            for index, value in enumerate(values)
        ]
        return {
            "count": len(items),
            "predictions": items,
            "average_predicted_power": round(float(np.mean(values)), 6) if len(values) else 0.0,
            "inference_ms": round((time.perf_counter() - start) * 1000, 3),
        }

    def metrics(self) -> List[Dict[str, Any]]:
        path = self.model_dir / "metrics.csv"
        if not path.exists():
            return []
        return pd.read_csv(path).to_dict(orient="records")

    def analytics(self) -> Dict[str, Any]:
        cached = self.cache.get("analytics")
        if cached:
            return cached
        frame = self.load_dataset()
        recent = frame.tail(48).copy()
        avg_power = float(frame[TARGET_COLUMN].mean())
        max_power = float(frame[TARGET_COLUMN].max())
        first = float(recent[TARGET_COLUMN].head(12).mean())
        last = float(recent[TARGET_COLUMN].tail(12).mean())
        trend = "rising" if last > first else "falling" if last < first else "stable"
        time_column = "Time" if "Time" in recent.columns else None
        points = []
        for _, row in recent.tail(24).iterrows():
            points.append(
                {
                    "timestamp": str(row[time_column]) if time_column else utc_now_iso(),
                    "power": round(float(row[TARGET_COLUMN]), 6),
                    "windspeed": round(float(row["windspeed"]), 6),
                }
            )
        result = {
            "average_power": round(avg_power, 6),
            "max_power": round(max_power, 6),
            "min_power": round(float(frame[TARGET_COLUMN].min()), 6),
            "efficiency": round(avg_power / max(max_power, 1e-9), 6),
            "sample_count": int(len(frame)),
            "trend_direction": trend,
            "trend_analysis": points,
        }
        self.cache.set("analytics", result)
        return result

    async def live_points(self, count: int = 12) -> List[Dict[str, Any]]:
        frame = self.load_dataset()
        base = frame.sample(1).iloc[0]
        points = []
        for step in range(count):
            payload = {
                "temperature": float(base["temperature"] + np.random.normal(0, 0.5)),
                "relativehu": float(np.clip(base["relativehu"] + np.random.normal(0, 2), 0, 100)),
                "dewpoint": float(base["dewpoint"] + np.random.normal(0, 0.4)),
                "windspeed": float(max(0, base["windspeed"] + np.sin(step / 3) + np.random.normal(0, 0.25))),
                "winddirec": float(np.mod(base["winddirec"] + np.random.normal(0, 8), 360)),
                "windgust": float(max(0, base["windgust"] + np.random.normal(0, 0.5))),
            }
            prediction = await self.predict(payload)
            points.append({"step": step + 1, "weather": payload, **prediction})
        return points


ml_service = MLService()
