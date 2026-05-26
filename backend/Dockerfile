# Production Dockerfile for WindCast AI Backend
# Multi-stage optimized build using Python 3.11-slim

# --- Stage 1: Build Dependencies ---
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system compilation packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Cache and build wheels for dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt


# --- Stage 2: Final Production Runtime ---
FROM python:3.11-slim AS runner

WORKDIR /workspace

# Create secure system non-root user
RUN groupadd -g 999 appuser && \
    useradd -r -u 999 -g appuser appuser

# Copy installed dependency packages from Stage 1
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy backend files and configurations
COPY --chown=appuser:appuser app/ ./app/
COPY --chown=appuser:appuser trained_models/ ./trained_models/

# Segregate directory permissions
RUN mkdir -p secret && chown -R appuser:appuser secret/

# Host parameters configurations
EXPOSE 8000
ENV PYTHONUNBUFFERED=1

# Execute as secure non-root user
USER appuser

# Launch production server via Uvicorn dispatcher
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
