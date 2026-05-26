"""
Authentication endpoints router.
Allows manual administrator JWT authorization keys generation.
"""

from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import UserLogin, TokenResponse, OperatorUserDetail
from app.core.security import create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login_operator(credentials: UserLogin):
  """
  Login administrator credentials to generate a secure local JWT token.
  """
  email = credentials.email
  password = credentials.password

  # Validate against standard administrator credentials
  if email == "admin@windcast.ai" and password == "admin123":
    operator_detail = OperatorUserDetail(
        name="Lead Operator Administrator",
        email="admin@windcast.ai",
        role="Super-Administrator",
        terminalId="WCAST-EDGE-NODE-04"
    )
    
    # Generate secure JWT access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "dev-uid-12345", "email": email, "role": "Super-Administrator"},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        user=operator_detail
    )
    
  raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid email or password decryption keys.",
      headers={"WWW-Authenticate": "Bearer"},
  )
