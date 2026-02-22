"""
FastAPI Main Application

ReachIQ Growth Curve Prediction System
"""

from pathlib import Path

from dotenv import load_dotenv

# Load .env from Backend, project root, and Frontend (GNEWS_API_KEY)
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv(Path(__file__).parent.parent / "Frontend" / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from routes import analytics, companies, dashboard, news

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting ReachIQ API...")
    # Initialize services here if needed
    yield
    logger.info("Shutting down ReachIQ API...")


# Create FastAPI app
app = FastAPI(
    title="ReachIQ API",
    description="Growth Curve Prediction and Analytics API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(news.router, prefix="/api/news", tags=["News"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "ReachIQ Growth Curve Prediction API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "reachiq-api"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
