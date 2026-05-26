"""
Pydantic schemas for authentication and operator authorization.
Uses native regex validation patterns to eliminate external email-validator dependencies.
"""

from pydantic import BaseModel, Field

class UserRegister(BaseModel):
  name: str = Field(..., min_length=2, description="Operator full name")
  email: str = Field(
      ..., 
      pattern=r"^\S+@\S+\.\S+$", 
      description="Administrator email registry",
      json_schema_extra={"example": "admin@windcast.ai"}
  )
  password: str = Field(..., min_length=6, description="Terminal secure access password")

class UserLogin(BaseModel):
  email: str = Field(
      ..., 
      pattern=r"^\S+@\S+\.\S+$", 
      description="Operator email credentials",
      json_schema_extra={"example": "admin@windcast.ai"}
  )
  password: str = Field(..., description="Terminal access password")

class OperatorUserDetail(BaseModel):
  name: str
  email: str
  role: str
  terminalId: str

class TokenResponse(BaseModel):
  access_token: str
  token_type: str = "bearer"
  user: OperatorUserDetail
