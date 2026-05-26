# Deployment Guide

## Render

1. Push the repository to GitHub.
2. Create a new Render Web Service.
3. Select Docker.
4. Use `backend/Dockerfile`.
5. Set environment variables from `backend/.env.example`.
6. Deploy and verify `/health`.

## Railway

1. Import the repository.
2. Railway detects `backend/railway.json`.
3. Add environment variables.
4. Deploy and verify `/api/v1/health`.

## Docker

```bash
docker compose up --build
```

## Vercel

Vercel serverless can host lightweight FastAPI routes, but this ML backend uses scikit-learn, XGBoost, TensorFlow, and model artifacts. Prefer Docker-based deployment for production. If using Vercel, reduce dependencies and deploy only the API subset needed by the frontend.
