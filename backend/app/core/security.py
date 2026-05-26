"""
Security and authentication layer.
Initializes the Firebase Admin SDK and manages secure token verifications.
"""

import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings

# Passwords hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Global variables for Firebase Admin SDK state
FIREBASE_INITIALIZED = False

try:
  cred_path = Path(settings.FIREBASE_CREDENTIALS_PATH)
  if cred_path.exists():
    print(f"Initializing Firebase Admin SDK using credentials at: {cred_path}...")
    cred = credentials.Certificate(str(cred_path))
    firebase_admin.initialize_app(cred)
    FIREBASE_INITIALIZED = True
    print("Firebase Admin SDK initialized successfully!")
  else:
    print(f"Warning: Firebase credentials not found at: {cred_path}. Operating in developer fallback mode.")
except Exception as err:
  print(f"Error initializing Firebase Admin SDK: {err}. Operating in developer fallback mode.")

def verify_firebase_token(token: str) -> Optional[Dict[str, Any]]:
  """
  Verifies a Firebase ID token.
  If operating in developer fallback mode, validates simulated developer claim keys.
  """
  if FIREBASE_INITIALIZED:
    try:
      decoded = auth.verify_id_token(token)
      return {
          "uid": decoded.get("uid"),
          "email": decoded.get("email"),
          "name": decoded.get("name", "Operator User"),
          "role": "Grid-Operator"
      }
    except Exception as err:
      print(f"Firebase token verification failed: {err}")
      return None

  # --- Developer Mock Bypass Fallbacks ---
  # Allows testing the frontend-backend connection without active Firebase Admin credentials
  if token in ["developer-claims-operator-jwt-verify-token", "google-sso-claims-operator-jwt-verify-token"]:
    return {
        "uid": "mock-operator-uid-12345",
        "email": "admin@windcast.ai" if "developer" in token else "google.operator@windcast.ai",
        "name": "Developer Operator" if "developer" in token else "Google Operator SSO",
        "role": "Super-Administrator" if "developer" in token else "Grid-Operator"
    }

  # Fallback: check if it's a locally encoded JWT
  try:
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    return {
        "uid": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name", "Local Operator"),
        "role": payload.get("role", "Operator")
    }
  except JWTError:
    return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
  return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.utcnow() + expires_delta
  else:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
  return encoded_jwt
