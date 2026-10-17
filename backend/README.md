# ModeraAI Node.js backend

Express + MongoDB backend replacing the previous FastAPI/Python API. The React frontend and `/api/...` routes are kept compatible.

## Structure
- `server.js` starts the backend and manages shutdown.
- `app.js` configures Express and mounts the API routers.
- `routes/` maps endpoints to request middleware and controllers.
- `controllers/` handles HTTP input and response behavior.
- `services/` contains database-facing operations and moderation analysis.
- `middleware/` contains authentication, upload handling, and error responses.
- `config.js` and `db.js` centralize application settings and MongoDB setup.

## Requirements
- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection string

## Run
```bash
cd backend
npm install
cp .env.example .env
# Set MONGODB_URI and replace JWT_SECRET in .env
npm run dev
```

API health: http://localhost:5000/api/health

## Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/videos` (multipart `file`, optional `duration`)
- `GET /api/videos?q=&risk=&status=&sort=newest|risk|name&limit=&skip=`
- `GET /api/videos/:videoId`, `DELETE /api/videos/:videoId`
- `POST /api/videos/:videoId/analyze?force=true`
- `GET /api/videos/:videoId/result`
- `GET /api/reviews?status=pending|resolved|all`
- `POST /api/events/:eventId/decision` with `{ "action": "allow|flag|mute|blur|block", "reason": "optional" }`

## Important limitation
The analyzer is intentionally a deterministic **placeholder**, ported from the previous backend. It does not actually inspect video frames, audio, or speech yet. Replace `analyzeChunk()` and the `runAnalysis()` pipeline with real models when ready. The browser UI is unchanged and its demo mode remains enabled by default.
