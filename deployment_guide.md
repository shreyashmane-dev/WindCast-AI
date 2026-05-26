# WindCast AI – Vercel & Render Deployment Guide

This guide details the step-by-step procedure to deploy the **WindCast AI** next-generation renewables platform, hosting the Next.js frontend on **Vercel** and the FastAPI backend on **Render**.

---

## 1. Backend Deployment (Render)

The backend is configured as a Docker-based service. Render will read the root `docker-compose.yml` or `backend/Dockerfile` to build the Python FastAPI application container automatically.

### Steps to Deploy
1. **Sign In**: Log into your [Render Console](https://dashboard.render.com).
2. **New Service**: Click **New +** in the top navigation and select **Web Service**.
3. **Connect Repository**: Link your GitHub repository (`WindCast-AI`).
4. **Service Settings**:
   * **Name**: `windcast-ai-backend` (or your preferred slug).
   * **Environment**: `Docker`
   * **Docker Command**: Leave default (Docker will read the `backend/Dockerfile` configuration).
   * **Dockerfile Path**: Set to `backend/Dockerfile`.
   * **Root Directory**: Leave blank (default is repository root).
5. **Environment Variables**: Click **Advanced** -> **Add Environment Variable** and enter:
   * `ENVIRONMENT` = `production`
   * `ALLOWED_ORIGINS` = `*` *(The backend codebase defaults to `*` allowing all client origins, so you do not need to specify or maintain a specific frontend URL here)*
6. **Deploy**: Click **Create Web Service**. Render will build and deploy the container, providing you with a live URL (e.g., `https://windcast-ai-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

The frontend is a standard Next.js application located in the `frontend/` subdirectory.

### Steps to Deploy
1. **Sign In**: Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. **Add Project**: Click **Add New** -> **Project**.
3. **Import Repository**: Select your GitHub repository (`WindCast-AI`).
4. **Configure Project**:
   * **Framework Preset**: Select `Next.js`
   * **Root Directory**: Click *Edit* and select the **`frontend`** folder (Vercel will scope all build scripts inside the `frontend/` directory).
5. **Environment Variables**: Expand the environment variables card and enter:
   * **`NEXT_PUBLIC_API_URL`**: `https://windcast-ai-backend.onrender.com/api/v1` *(Set this to the live Render URL generated in Section 1)*
   * **`NEXT_PUBLIC_FIREBASE_API_KEY`**: `AIzaSyByt0G9K6f8sFUdRWJcBe_rwC_l6RTgwb8`
   * **`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`**: `e-commerce-dfd65.firebaseapp.com`
   * **`NEXT_PUBLIC_FIREBASE_PROJECT_ID`**: `e-commerce-dfd65`
   * **`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`**: `e-commerce-dfd65.firebasestorage.app`
   * **`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`**: `1040687151295`
   * **`NEXT_PUBLIC_FIREBASE_APP_ID`**: `1:1040687151295:web:d8265649899bdaf1926e0a`
6. **Deploy**: Click **Deploy**. Vercel will build the Next.js bundle and provide your live frontend URL (e.g., `https://windcast-ai-frontend.vercel.app`).

---

## 3. Post-Deployment Verification
1. Open your Vercel deployment URL in a browser.
2. The landing page should render instantly. Clicking **"Open Live Dashboard"** or **"Make Prediction"** will route you to the `/login` auth gate.
3. Sign in or register a new terminal account.
4. Verify that live simulation tickers load, parameter manual sliders and text inputs are functional, and all advanced analytical graphs render without CORS errors.
