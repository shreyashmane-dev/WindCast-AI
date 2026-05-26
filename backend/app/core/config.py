"""
Configuration and settings module for the FastAPI backend.
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
  # Application Core
  PROJECT_NAME: str = "WindCast AI API"
  API_V1_STR: str = "/api/v1"
  ENVIRONMENT: str = "development"

  # Allowed CORS origins
  ALLOWED_ORIGINS: str = "*"

  @property
  def allowed_origins_list(self) -> List[str]:
    return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

  # Machine Learning settings
  MODEL_PATH: str = "trained_models"

  # Firebase configurations
  FIREBASE_CREDENTIALS_PATH: str = "secret/firebase-service-account.json"

  # JWT Local Authentication (used as backup)
  JWT_SECRET_KEY: str = "cyber-secret-jwt-key-windcast-ai-2026-dynamic-strobe"
  JWT_ALGORITHM: str = "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

  class Config:
    env_file = ".env"
    case_sensitive = True

settings = Settings()
