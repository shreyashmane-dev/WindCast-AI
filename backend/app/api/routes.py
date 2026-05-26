from __future__ import annotations

import io
import asyncio
import time
from typing import Any, Dict

import pandas as pd
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect

from app.api.deps import get_ml_service
from app.core.config import get_settings
from app.core.security import create_access_token, optional_auth
from app.schemas.analytics import AnalyticsResponse
from app.schemas.auth import TokenResponse
from app.schemas.health import HealthResponse
from app.schemas.models import ModelsResponse
from app.schemas.prediction import BatchPredictionResponse, PredictionResponse, WeatherInput
from app.services.ml_service import MLService


router = APIRouter()
started_at = time.time()


@router.get("/")
async def root() -> Dict[str, str]:
    return {"status": "ok", "service": "WindCast AI Backend", "docs": "/docs", "api": "/api/v1"}


@router.get("/health", response_model=HealthResponse)
async def health(service: MLService = Depends(get_ml_service)) -> Dict[str, Any]:
    settings = get_settings()
    models = service.available_models()
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.api_version,
        "uptime_seconds": round(time.time() - started_at, 3),
        "model_status": {
            "active": service.active_model_name(),
            "loaded": ",".join(service._models.keys()) or "lazy",
            "available": ",".join(models) if models else "none",
        },
        "environment": settings.environment,
    }


@router.post("/auth/demo-token", response_model=TokenResponse)
async def demo_token() -> Dict[str, str]:
    return {"access_token": create_access_token("frontend-demo", {"scope": "read:predict"})}


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    payload: WeatherInput,
    service: MLService = Depends(get_ml_service),
    _: Dict[str, Any] | None = Depends(optional_auth),
) -> Dict[str, Any]:
    return await service.predict(payload.model_dump(exclude={"timestamp"}), timestamp=payload.timestamp)


@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    file: UploadFile = File(...),
    service: MLService = Depends(get_ml_service),
    _: Dict[str, Any] | None = Depends(optional_auth),
) -> Dict[str, Any]:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file")
    content = await file.read()
    try:
        frame = pd.read_csv(io.BytesIO(content))
        return await service.predict_batch(frame)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/models", response_model=ModelsResponse)
async def models(service: MLService = Depends(get_ml_service)) -> Dict[str, Any]:
    metrics = service.metrics()
    best = metrics[0] if metrics else {}
    return {
        "active_model": service.active_model_name(),
        "available_models": service.available_models(),
        "metrics": metrics,
        "comparison": {
            "best_model": best.get("model", service.active_model_name()),
            "best_rmse": best.get("rmse", 0.0),
            "selection_logic": "lowest_rmse",
        },
    }


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(background_tasks: BackgroundTasks, service: MLService = Depends(get_ml_service)) -> Dict[str, Any]:
    background_tasks.add_task(service.cache.set, "last_analytics_refresh", time.time())
    return service.analytics()


@router.get("/forecast/live")
async def forecast_live(limit: int = 12, service: MLService = Depends(get_ml_service)) -> Dict[str, Any]:
    limit = max(1, min(limit, 120))
    return {"stream": await service.live_points(limit), "transport": "http-polling", "websocket": "/api/v1/ws/live"}


@router.websocket("/ws/live")
async def websocket_live(websocket: WebSocket, service: MLService = Depends(get_ml_service)) -> None:
    await websocket.accept()
    try:
        while True:
            points = await service.live_points(1)
            await websocket.send_json(points[0])
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        return
