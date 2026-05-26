"""
Structured asynchronous request logging middleware for audit trails.
"""

import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
  async def dispatch(self, request: Request, call_next) -> Response:
    start_time = time.time()
    
    # Process the request
    try:
      response = await call_next(request)
    except Exception as e:
      # Log critical unhandled crashes
      process_time = (time.time() - start_time) * 1000
      print(f"CRITICAL FAULT: {request.method} {request.url.path} failed in {process_time:.2f}ms. Error: {str(e)}")
      raise e

    process_time = (time.time() - start_time) * 1000
    
    # Add custom diagnostic header
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    
    # Exclude websocket pings or static health checks from cluttering the terminal
    if request.url.path not in ["/", "/health", "/forecast/live"]:
      print(
          f"AUDIT LOG: {request.method} {request.url.path} "
          f"Status: {response.status_code} | Latency: {process_time:.2f}ms"
      )
      
    return response
