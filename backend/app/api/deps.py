"""
FastAPI dependency injection utilities.
Provides route guards and authentication token extractors.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_firebase_token

# Configure bearer authentication token extractor
reusable_oauth2 = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(reusable_oauth2)
) -> dict:
  """
  Route guard dependency that extracts and validates the Bearer token.
  Raises HTTP 401 Unauthorized if token is missing, invalid, or expired.
  """
  if not credentials:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication credentials are missing.",
        headers={"WWW-Authenticate": "Bearer"},
    )

  token = credentials.credentials
  user_claims = verify_firebase_token(token)
  
  if not user_claims:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Decryption key has expired or is invalid.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
  return user_claims
