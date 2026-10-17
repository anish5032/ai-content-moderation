# ModeraAI – AI Content Moderation

React + Vite + Tailwind frontend (generated with Magic Patterns) with a **Node.js / Express + MongoDB** backend.

The project has two modes, switched by one variable:

| `VITE_USE_MOCK_API` | What you get |
|---|---|
| `false` (default) | Backend mode: login, video upload/library, analysis results, and review decisions use the API. |
| `true` | Pure demo. No login or backend needed; screens use local demo data. |

## Quick start – demo mode (no backend)

```bash
npm install
# Set VITE_USE_MOCK_API=true in .env.local to use demo data without a backend.
npm run dev
```

## Quick start – with the backend

You need Node.js 20+ and MongoDB (local via Docker, or a free MongoDB Atlas cluster).

**1. MongoDB**
```bash
docker compose up -d          # local MongoDB on :27017
```
(or create an Atlas cluster and use its connection string in step 2)

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env           # then edit: set MONGODB_URI and a real JWT_SECRET
npm run dev                  # API runs on port 5000
```
Health check: http://localhost:5000/api/health

**3. Frontend**
```bash
cp .env.example .env.local     # in the project root; backend mode is enabled by default
npm install
npm run dev
```
Open http://localhost:5173, create an account, upload an MP4/WebM, and click **Analyze**. Open **Results** from the video library or visit the moderation page to inspect saved analysis output. The review queue persists decisions to MongoDB.

## What is connected (and what is not)

This is the first slice of the backend, roughly 20% of the finished product.

| Area | Status |
|---|---|
| Accounts (register / login / JWT) | ✅ real |
| Video upload + library (search, filters, delete) | ✅ real, stored per-user |
| Analysis pipeline (chunk → score → fuse → save) | ✅ real pipeline, **placeholder analyzer** |
| Review queue + decisions API | ✅ connected and persisted |
| Moderation results | ✅ reads saved backend analysis results |
| Video playback | ⏳ stored media is not exposed by the API; demo mode still includes the local simulator |
| Dashboard / Analytics / Models / MLOps / Settings | ⏳ demo data |
| Real ML models | ⏳ not included |

> **Important:** the analyzer is a stand-in that generates deterministic fake scores
> (results are labelled `analyzer: "placeholder-v0"`). Do not use it to make real moderation decisions.

## Project layout

```
src/                 React app (pages, components, hooks, services)
  lib/api.js         fetch wrapper + token storage
  lib/auth.jsx       login state, route guard
  services/apiService.js   calls to the backend
backend/             Node.js / Express app (see backend/README.md)
docker-compose.yml   local MongoDB
```

The frontend uses JavaScript and JSX; TypeScript source and type-checking configuration have been removed.

## Commands

```bash
npm run dev          # frontend dev server
npm test             # frontend tests (vitest)
npm run build        # production build
cd backend && npm install && npm run dev   # backend API
```
