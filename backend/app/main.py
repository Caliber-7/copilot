from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import init_db, SessionLocal
from app.db.seed import seed_database
from app.models.anomaly import Anomaly
from app.models.procedure import Procedure
from app.models.incident import HistoricalIncident
from app.services.rag import rag_service

from app.api import (
    anomalies,
    evidence,
    telemetry,
    investigations,
    copilot,
    timeline,
    audit,
    dashboard,
    demo
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and RAG Index
    print(f"[Mission Ops Copilot] Initializing backend database for {settings.SPACECRAFT_ID}...")
    init_db()

    # Seed initial data if database is empty
    db = SessionLocal()
    try:
        anomaly_count = db.query(Anomaly).count()
        if anomaly_count == 0:
            print("[Mission Ops Copilot] Database empty. Seeding initial mission datasets...")
            seed_database(db=db)

        # Index procedures and incidents into RAG vector store
        procedures = db.query(Procedure).all()
        for p in procedures:
            rag_service.index_document(
                doc_id=p.id,
                text=p.document_content,
                metadata={"title": p.title, "subsystem": p.subsystem, "doc_type": "procedure"}
            )

        incidents = db.query(HistoricalIncident).all()
        for inc in incidents:
            rag_service.index_document(
                doc_id=inc.id,
                text=inc.document_content,
                metadata={"title": inc.title, "subsystem": inc.subsystem, "doc_type": "incident"}
            )
        print(f"[Mission Ops Copilot] Vector RAG index initialized ({len(procedures)} procedures, {len(incidents)} incidents).")
    finally:
        db.close()

    yield
    print("[Mission Ops Copilot] Shutting down backend services.")

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Mission Operations Copilot Backend — Grounded AI & RAG Decision-Support System "
        "for simulated spacecraft operations (SC-01). STRICT SAFETY NOTICE: Simulation and "
        "decision-support only. Direct spacecraft commanding is prohibited."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(anomalies.router)
app.include_router(evidence.router)
app.include_router(telemetry.router)
app.include_router(investigations.router)
app.include_router(copilot.router)
app.include_router(timeline.router)
app.include_router(audit.router)
app.include_router(demo.router)

@app.get("/", tags=["System"])
def root():
    return {
        "name": settings.APP_NAME,
        "status": "ONLINE",
        "spacecraft": settings.SPACECRAFT_ID,
        "simulation_mode": settings.SIMULATION_MODE,
        "allow_hardware_commands": settings.ALLOW_HARDWARE_COMMANDS,
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "simulation_mode": settings.SIMULATION_MODE,
        "spacecraft_id": settings.SPACECRAFT_ID,
        "llm_provider": settings.LLM_PROVIDER
    }
