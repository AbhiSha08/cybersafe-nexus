from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from core.config import settings
from core.database import db
# Ensure you have 'admin.py' inside your 'routes' folder
from routes import auth, lessons, tools, users, admin
import logging
import os
import uvicorn

# --- LOGGING ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Nexus-Core")

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("⚡ SYSTEM INITIALIZATION PROTOCOL STARTED...")
    try:
        # Check Database Connection
        await db.command("ping")
        logger.info("✅ MongoDB Atlas: CONNECTED")
    except Exception as e:
        logger.error(f"❌ MongoDB Atlas: FAILED - {e}")

    if settings.GEMINI_API_KEY:
        logger.info("✅ Nexus AI Engine: ONLINE (Gemini 2.5 Flash Ready)")
    else:
        logger.warning("⚠️ Nexus AI Engine: OFFLINE (API Key Missing)")

    logger.info("🚀 CyberSafe Nexus API is Ready to Serve.")
    yield 
    logger.info("🛑 Shutting down CyberSafe Nexus services...")

app = FastAPI(
    title="CyberSafe Nexus API",
    version="2.5.0",
    lifespan=lifespan
)

# --- EXCEPTION HANDLER ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"🔥 UNHANDLED ERROR: {str(exc)} | Route: {request.url}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "Internal System Error", "detail": str(exc)}
    )

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER REGISTRATION ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["User Intelligence"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Curriculum Engine"])
app.include_router(tools.router, prefix="/api/tools", tags=["Cyber Tools"])

# FIX: Changed prefix to '/api/admin' to match Frontend requests
app.include_router(admin.router, prefix="/api/admin", tags=["Root Console"])

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "system": "CyberSafe Nexus", 
        "status": "Operational", 
        "version": "v2.5.0"
    }

if __name__ == "__main__":
    # Clears terminal on restart for cleaner logs
    os.system('cls' if os.name == 'nt' else 'clear')
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)