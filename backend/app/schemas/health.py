from __future__ import annotations

from typing import Dict

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    uptime_seconds: float
    model_status: Dict[str, str]
    environment: str
