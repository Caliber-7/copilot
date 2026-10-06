# Mission Operations Copilot — Backend & AI Layer

**Spacecraft:** SC-01  
**Framework:** FastAPI + Python 3.11+  
**Architecture:** Evidence-Grounded AI Investigation & RAG Decision-Support System  
**Safety Classification:** Simulation and Decision-Support Only (Direct Spacecraft Commanding Prohibited)

---

## 1. System Overview

The Mission Operations Copilot backend provides an end-to-end telemetry analysis, vector retrieval (RAG), telemetry correlation, evidence validation, and AI investigation pipeline for flight operations personnel monitoring the **SC-01** spacecraft.

It is designed to back the Mission Operations Copilot React frontend across all 9 mission console views:
1. **Mission Dashboard** (Health gauges, active anomalies, recent alerts, timeline)
2. **Anomaly Center** (Filtering by severity, subsystem, status, confidence)
3. **Investigation Workspace** (Structured findings, hypotheses, next steps, confidence breakdown)
4. **Evidence Explorer** (Detailed telemetry, log, procedure, and incident evidence with sparklines)
5. **Telemetry Explorer** (Real-time & historical multi-parameter time-series comparison)
6. **Incident Timeline** (Chronological sequence of telemetry excursions and automated events)
7. **Audit Trail** (Immutable record of operator actions and AI Copilot executions)
8. **AI Copilot / AI Assistant** (Context-grounded natural language Q&A)
9. **Demo Mode** (Instant reset & loading of prepared `ANOM-004` Battery Thermal Anomaly scenario)

---

## 2. Investigation Pipeline

```text
Operator / Frontend
        ↓
FastAPI Endpoints
        ↓
Investigation Request (/api/investigations/run)
        ↓
Evidence Retrieval (Telemetry Excursions, Logs, Procedures, Historical Incidents)
        ↓
Telemetry Correlation (Cross-Parameter Pearson Coefficients & Time-Lag Detection)
        ↓
Vector / RAG Retrieval (ChromaDB + Cosine Semantic Index)
        ↓
AI Analysis (Configurable LLM / Grounded Operational Simulation Engine)
        ↓
Evidence Validation (Physical Threshold Verification & Status Tagging)
        ↓
Structured Investigation Report
        ↓
Audit Trail Event Logging
        ↓
Frontend Console
```

---

## 3. Technology Stack

- **Runtime:** Python 3.11+
- **API Framework:** FastAPI with asynchronous ASGI execution
- **Validation & Schemas:** Pydantic v2
- **Database & ORM:** SQLAlchemy 2.0 (PostgreSQL compatible; SQLite default for instant zero-dependency local runs)
- **Vector Storage:** ChromaDB with built-in zero-dependency fallback vector engine
- **Correlation Engine:** NumPy vector math (Pearson $r$ & cross-correlation lag shift)
- **LLM Integration:** Configurable via HTTPX (`mock`, `openai`, `gemini`, `anthropic`, or local `ollama`)
- **Testing:** Pytest & FastAPI TestClient

---

## 4. Directory Structure

```text
backend/
│
├── app/
│   ├── main.py                     # Application entrypoint & startup lifecycle
│   │
│   ├── api/
│   │   ├── anomalies.py            # Anomaly listing, filtering, updates
│   │   ├── evidence.py             # Evidence items & validation endpoints
│   │   ├── telemetry.py            # Telemetry query, metadata & correlation
│   │   ├── investigations.py       # Investigation execution pipeline
│   │   ├── copilot.py              # Interactive AI chat Q&A
│   │   ├── timeline.py             # Chronological event reconstruction
│   │   ├── audit.py                # Audit log tracking & inspection
│   │   ├── dashboard.py            # Mission status, gauges & recent alerts
│   │   └── demo.py                 # Reset & load demo scenario
│   │
│   ├── models/
│   │   ├── anomaly.py              # Anomaly SQLAlchemy model
│   │   ├── evidence.py             # Evidence item model
│   │   ├── telemetry.py            # Telemetry record model
│   │   ├── mission_log.py          # Mission flight log model
│   │   ├── procedure.py            # Operating procedure model
│   │   ├── incident.py             # Historical incident model
│   │   ├── audit.py                # Audit trail event model
│   │   └── investigation.py        # Structured investigation report model
│   │
│   ├── schemas/
│   │   ├── anomaly.py              # Pydantic anomaly schemas
│   │   ├── evidence.py             # Pydantic evidence schemas
│   │   ├── telemetry.py            # Pydantic telemetry & correlation schemas
│   │   ├── investigation.py        # Investigation & Copilot request/responses
│   │   └── audit.py                # Audit trail schemas
│   │
│   ├── services/
│   │   ├── rag.py                  # ChromaDB & semantic vector index
│   │   ├── retrieval.py            # Multi-source candidate retrieval
│   │   ├── evidence_engine.py      # Threshold validation & relevance weighting
│   │   ├── correlation.py          # Pearson r & temporal lag detection
│   │   ├── investigation.py        # Full pipeline orchestrator & LLM caller
│   │   ├── confidence.py           # Multi-factor grounded confidence scoring
│   │   └── audit.py                # Audit logging service
│   │
│   ├── db/
│   │   ├── database.py             # DB engine & session factory
│   │   └── seed.py                 # Database seeder & scenario populator
│   │
│   └── config.py                   # Pydantic settings & environment management
│
├── data/
│   ├── telemetry/                  # Simulated SC-01 telemetry (sc01_telemetry.json)
│   ├── logs/                       # Flight logs & FDIR entries (sc01_logs.json)
│   ├── procedures/                 # Procedures (procedures.json: PWR-204, COMM-015, etc.)
│   └── incidents/                  # 20 Fictional Historical Incidents (INC-001 - INC-020)
│
├── tests/
│   ├── test_api.py                 # API endpoints test suite
│   └── test_services.py            # Math, RAG, & correlation test suite
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## 5. Configuration (.env)

Configuration is managed via environment variables. See `.env.example`:

```ini
APP_NAME="Mission Operations Copilot Backend"
PORT=8000
HOST="0.0.0.0"

# Database: SQLite default; use PostgreSQL URL when available:
DATABASE_URL=sqlite:///./mission_ops.db
# DATABASE_URL=postgresql://user:password@localhost:5432/mission_ops

# Vector DB
VECTOR_DB_PATH=./data/vector_store
CHROMA_COLLECTION_NAME=mission_knowledge_base

# AI / LLM Provider: 'ollama' or 'gemini' (or 'mock', 'openai', 'anthropic')
LLM_PROVIDER=ollama
LLM_TEMPERATURE=0.2

# 1. Ollama (Local Open Source - No API Key Needed)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
# (Run locally with: ollama run llama3)

# 2. Google Gemini (Cloud)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Safety & Simulation Guardrails
SIMULATION_MODE=True
SPACECRAFT_ID=SC-01
ALLOW_HARDWARE_COMMANDS=False
```

> **Resilient Cascade:** If `LLM_PROVIDER=ollama` is selected but your local Ollama daemon is not yet running, or if `LLM_PROVIDER=gemini` is selected without an API key, the system automatically falls back to its deterministic, evidence-grounded aerospace simulation engine without throwing unhandled exceptions.

---

## 6. Setup & Execution

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Seed Database (Optional - auto-seeds on first launch)
```bash
python -m app.db.seed
```

### 3. Run FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 4. Run Test Suite
```bash
pytest -v
```

---

## 7. API Reference

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/dashboard/stats` | `GET` | Spacecraft status, active anomalies, health %, recent alerts, queue |
| `GET /api/anomalies` | `GET` | List anomalies with severity, subsystem, status, search, and pagination |
| `GET /api/anomalies/{id}` | `GET` | Get single anomaly details |
| `POST /api/anomalies` | `POST` | Create or trigger a new mission anomaly |
| `PATCH /api/anomalies/{id}` | `PATCH` | Update anomaly status (e.g. mark reviewed/closed) |
| `GET /api/telemetry` | `GET` | Query raw telemetry records with filters |
| `GET /api/telemetry/parameters` | `GET` | Get available telemetry parameters, units, bounds, and latest values |
| `GET /api/telemetry/series` | `GET` | Time-series query for multi-curve charting |
| `POST /api/telemetry/correlate` | `POST` | Calculate Pearson correlation & time-lag between parameters |
| `GET /api/evidence` | `GET` | Filter evidence items by anomaly ID, source type, relevance |
| `GET /api/evidence/{id}` | `GET` | Evidence detail with sparkline and original record |
| `POST /api/evidence/validate` | `POST` | Mark evidence as VALIDATED, CONTRADICTED, or UNVERIFIED |
| `GET /api/investigations` | `GET` | List all investigation reports |
| `GET /api/investigations/{id}` | `GET` | Get complete investigation for an anomaly |
| `POST /api/investigations/run` | `POST` | Execute end-to-end AI investigation pipeline |
| `PATCH /api/investigations/{id}` | `PATCH` | Update investigation status (e.g. mark reviewed) |
| `POST /api/copilot/query` | `POST` | Grounded interactive Q&A assistant |
| `GET /api/timeline` | `GET` | Chronological event timeline leading up to anomaly |
| `GET /api/audit` | `GET` | Complete immutable audit trail log |
| `POST /api/audit` | `POST` | Record operator action to audit trail |
| `POST /api/demo/load` | `POST` | Reset and reload `ANOM-004` demo scenario |

---

## 8. Safety Boundaries & Operational Constraints

1. **Strictly Decision-Support Only:** Direct hardware commanding of SC-01 is permanently prohibited in flight software. `ALLOW_HARDWARE_COMMANDS=False` is enforced at the architectural layer.
2. **Thermal Safety Guardrails:** Automated validation alerts on any action violating flight rules (e.g., cycling power relays while battery temperature > 35°C).
3. **RF Link Priority:** Requires verified continuous S-band lock before recommending charge regulator reconfigurations.
4. **Audit Logging:** Every investigation generation, operator query, and recommendation review is immutably logged with actor, timestamp, and signature.
