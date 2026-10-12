# Textile Factory Audit & Regulatory Compliance Platform

Sensor-driven regulatory compliance, energy efficiency, and audit reporting platform for MSME textile manufacturing factories in India.

---

## 🚀 Architecture Overview

This project is a complete fullstack application consisting of:

- **Frontend**: [React 19](file:///c:/Users/A/finalmdm/package.json), TypeScript, [Vite 8](file:///c:/Users/A/finalmdm/vite.config.ts), and Tailwind CSS v4.
- **Backend**: [Express.js](file:///c:/Users/A/finalmdm/server/index.ts) REST API engine running on port 5000 with CORS, request logging, and live dataset simulation.
- **AI Integration**: [Gemini AI Service](file:///c:/Users/A/finalmdm/server/geminiService.ts) using `@google/genai` (with intelligent statutory rule-engine fallback).
- **Compliance Frameworks**: BEE ADEETIE, SIDBI 4E Green Loan, CPCB Environmental Norms, ISO 50001, and Indian Factories Act 1948.

---

## 📡 Live Application Status

- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Vite Proxy**: Requests from the frontend to `/api/*` are automatically forwarded to `http://localhost:5000`.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health, server uptime, monitored mills, and AI engine status |
| `GET` | `/api/v1/companies` | List all monitored factories and high-level compliance ratings |
| `GET` | `/api/v1/companies/:name/summary` | Comprehensive factory KPI metrics, peak demand, and machine breakdown |
| `GET` | `/api/v1/companies/:name/readings` | Sensor telemetry stream with query filters (`limit`, `shift`, `fault_only`) |
| `POST` | `/api/v1/companies/:name/readings` | Ingest a new sensor telemetry reading |
| `GET` | `/api/v1/companies/:name/audit` | Regulatory audit findings, machine scores, and optimization roadmap |
| `GET` | `/api/v1/audit/compare` | Multi-factory comparative matrix with national benchmark standings |
| `GET` | `/api/v1/companies/:name/dispatches` | Floor dispatch alerts with multi-language translations and acknowledgment status |
| `POST` | `/api/v1/companies/:name/dispatches/:id/acknowledge` | Acknowledge a floor alert with shift supervisor stamp |
| `GET` | `/api/v1/companies/:name/dpr` | Detailed Project Report (DPR) for BEE ADEETIE & SIDBI soft loans |
| `GET` | `/api/v1/companies/:name/cluster` | Federated MSME cluster benchmarking against regional peer mills |
| `GET` | `/api/v1/companies/:name/tariffs` | Time-of-Day (ToD) tariff slots and peak demand shifting suggestions |
| `POST` | `/api/v1/ai/audit-insight` | AI-powered auditor executive summary & risk analysis (Gemini / Rule Engine) |
| `POST` | `/api/v1/companies/:name/simulate-tick` | Inject a live synthetic telemetry tick into the data stream |

---

## 🛠️ Running the Application

### 1. Run Fullstack (Frontend + Backend concurrently)
```bash
npm run dev
```

### 2. Run Only Backend Server (Port 5000)
```bash
npm run server
```

### 3. Run Only Frontend Client (Port 3000)
```bash
npm run client
```

### 4. Build for Production & Serve
```bash
npm run build
npm start
```
*Note: In production mode, the Express server serves both the REST API and the optimized static bundle from `dist/` on port 5000.*

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key configuration parameters:
- `PORT`: Backend port (default: `5000`)
- `GEMINI_API_KEY`: (Optional) Your Google Gemini API Key for dynamic AI audit summaries. If omitted, the platform uses its built-in industrial expert rule engine.
