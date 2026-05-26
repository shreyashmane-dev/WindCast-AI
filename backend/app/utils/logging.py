"""
Logger configurations for structured console prints.
"""

import logging

def setup_structured_logging():
  logging.basicConfig(
      level=logging.INFO,
      format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
      handlers=[
          logging.StreamHandler()
      ]
  )
  # Disable noisy third-party loggers during data training
  logging.getLogger("pydantic").setLevel(logging.WARNING)
  logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
