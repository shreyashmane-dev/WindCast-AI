"""
PyTest configuration and global dependency fixtures.
Initializes the FastAPI TestClient and overrides security checks for unit testing.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Inject backend path into sys.path for local discovery
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from app.api.deps import get_current_user

# Mock Operator details for testing scopes
MOCK_USER = {
    "uid": "test-user-uid-9999",
    "email": "operator.test@windcast.ai",
    "name": "Audit Test Operator",
    "role": "Grid-Auditor"
}

# Override route dependency to return mock details without validating real keys
def override_get_current_user():
  return MOCK_USER

@pytest.fixture(scope="module")
def client():
  """
  Provides a TestClient wrapper around our FastAPI dispatcher app.
  """
  # Override get_current_user dependency during tests
  app.dependency_overrides[get_current_user] = override_get_current_user
  
  with TestClient(app) as test_client:
    yield test_client
    
  # Clear overrides after tests complete
  app.dependency_overrides.clear()
