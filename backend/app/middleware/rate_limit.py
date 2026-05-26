from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.config import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        settings = get_settings()
        if request.url.path in {"/health", "/"}:
            return await call_next(request)

        now = time.time()
        client = request.client.host if request.client else "anonymous"
        bucket = self.requests[client]
        while bucket and now - bucket[0] > 60:
            bucket.popleft()
        if len(bucket) >= settings.rate_limit_per_minute:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
        bucket.append(now)
        return await call_next(request)
