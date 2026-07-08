# DORA Metrics Telemetry Server (Backend)

This is the production-ready Node.js Express backend for the Release Health Dashboard: DORA Metrics. It aggregates telemetry from Azure DevOps REST APIs and computes DORA metrics in real-time.

---

## 🛠️ Features
- **Direct Integration:** Communicates with Azure DevOps REST API v7.1 using Personal Access Tokens (PAT).
- **Real-Time DORA Calculations:** Dynamically computes Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Restore (MTTR) from builds, deployments, commits, and outage work items.
- **In-Memory Caching:** Uses path-based TTL cache blocks to avoid hitting Azure API rate limits.
- **Multi-User Isolation:** Cache and request execution contexts support dynamic client token overrides.
- **Centralized Validation & Errors:** Prevents invalid query requests and masks raw Azure exceptions into clean envelopes.

---

## ⚙️ Configuration Setup

1. **Create the Environment Config File:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. **Configure your Variables:**
   Edit `.env` and fill in your Azure DevOps credentials:
   - `PORT`: Server port (defaults to `5000`).
   - `AZURE_PAT`: Personal Access Token generated in Azure DevOps (needs scopes: `Build (Read)`, `Release (Read, Write/Queue)`, `Work Items (Read, Write)`).
   - `AZURE_ORGANIZATION`: The name of your Azure DevOps organization.
   - `AZURE_PROJECT`: The name of your target team project.
   - `AZURE_INCIDENT_WORK_ITEM_TYPE`: The type of work item tracked as incidents/outages (defaults to `Bug`).
   - `FRONTEND_URL`: Origin address of your React frontend (defaults to `http://localhost:5173`).

---

## 🚀 How to Run the Server

### 1. Install Dependencies
Navigate to the `backend` directory and run:
```bash
npm install
```

### 2. Launch in Development Mode
Starts the telemetry server with `nodemon` auto-refresh tracking:
```bash
npm run dev
```

### 3. Launch in Production Mode
Starts the standard node process:
```bash
npm start
```

---

## 📊 API Reference Guide

All endpoints return JSON responses. If an incoming `Authorization` header contains `Bearer <token>`, it overrides the default PAT configuration for that request.

### Endpoints List

- `GET /api/health`: Performs connectivity verification and returns diagnostics status.
- `GET /api/auth/me`: Retrieves details of the authenticated PAT owner.
- `GET /api/dashboard`: Aggregates DORA metrics, charts, deployments, and active alarms.
- `GET /api/metrics`: Compiles aggregated DORA calculations and ratings.
- `GET /api/metrics/trends/:period`: Returns weekly or monthly charts.
- `GET /api/deployments`: Lists paginated deployments ledger.
- `POST /api/deployments`: Triggers a new pipeline run.
- `GET /api/incidents`: Lists paginated active and closed outages.
- `POST /api/incidents`: Creates a new incident work item.
- `PUT /api/incidents/:id/resolve`: Moves an active incident state to Resolved/Closed.
- `GET /api/projects`: Lists organization projects.
- `GET /api/pipelines`: Lists build pipelines.
- `GET /api/builds`: Lists recent build execution history.
- `GET /api/work-items`: Lists recent backlog work items.
