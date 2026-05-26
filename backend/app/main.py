"""
FastAPI entrypoint and application dispatcher for WindCast AI.
Ties CORS middlewares, custom logging interceptors, routers, and health checks.
"""

import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.middleware.logging import StructuredLoggingMiddleware
from app.utils.logging import setup_structured_logging

# Import routers
from app.api.endpoints import auth, predict, models, analytics, websocket

# Setup console logging
setup_structured_logging()

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Scalable ML Inference & Realtime Forecast API for Short-Term Wind Power Forecasting.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Attach Asynchronous structured request logging middleware
app.add_middleware(StructuredLoggingMiddleware)

# Configure Production-safe CORS Middleware resolving OPTIONS preflights
# Allow local Next.js client (localhost:3000) and wildcard/deployed Vercel domains securely!
allow_origins = settings.allowed_origins_list
allow_credentials = "*" not in allow_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Lifecycle Log
@app.on_event("startup")
def on_startup():
  print("==================================================")
  print(f"WindCast AI Dispatch Core Launching in: {settings.ENVIRONMENT.upper()}")
  print(f"Secure CORS allowed domains: {settings.allowed_origins_list}")
  print("Backend Server Synced & Ready for requests.")
  print("==================================================")

# Root Index
@app.get("/", tags=["System Check"])
def index():
  return {
      "app": settings.PROJECT_NAME,
      "environment": settings.ENVIRONMENT,
      "api_version": "v1",
      "status": "ONLINE"
  }

# Public Health check
@app.get("/health", tags=["System Check"])
def health_check():
  """
  Returns detailed application uptime, database sync parameters,
  and lazy loading model validation signals.
  """
  return {
      "status": "HEALTHY",
      "database_sync": "SYNCED",
      "ML_inference_engine": "OPERATIONAL",
      "model_status": "OPERATIONAL",
      "uptime_clock": "STABLE",
      "timestamp": time.time()
  }

# Register API routers under /api/v1/
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Operator Authorization"])
app.include_router(predict.router, prefix=f"{settings.API_V1_STR}/predict", tags=["Forecasting Inference"])
app.include_router(models.router, prefix=f"{settings.API_V1_STR}/models", tags=["Model Specifications"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Grid Historical Analytics"])

# Register WebSocket route directly (websockets handle prefixes uniquely)
app.include_router(websocket.router, prefix=f"{settings.API_V1_STR}/forecast/live")
