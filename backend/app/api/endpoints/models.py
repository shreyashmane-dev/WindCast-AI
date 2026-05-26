"""
Model management and metrics query router.
"""

from fastapi import APIRouter
from app.ml.regions import list_regions
from app.ml.service import ml_service

router = APIRouter()

@router.get("")
def get_available_models():
  """
  Returns the list of all forecasting algorithms currently compiled on the system,
  along with their individual MAE, RMSE, R2, and MAPE performance weights.
  """
  return ml_service.get_available_models()

@router.get("/active")
def get_active_model():
  """
  Returns information regarding the active forecasting model.
  """
  return {"active_model": "XGBoost"}


@router.get("/status")
def get_models_status():
  """
  Returns whether each frontend model option is served by a bundled trained file
  or a lightweight production surrogate.
  """
  return {"models": ml_service.get_model_status()}


@router.get("/regions")
def get_model_regions():
  """
  Returns human-readable region metadata mapped to internal model locations.
  """
  return {"regions": list_regions()}
