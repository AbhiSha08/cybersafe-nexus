from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from core.config import settings
from core.database import db
# Ensure all route modules exist in your 'routes' folder
from routes import auth, lessons, tools, users, admin
import logging
import os
import uvicorn

# --- LOGGING CONFIGURATION ---
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

    # Check AI Engine Status
    if settings.GEMINI_API_KEY:
        logger.info("✅ Nexus AI Engine: ONLINE (Gemini 2.5 Flash Ready)")
    else:
        logger.warning("⚠️ Nexus AI Engine: OFFLINE (API Key Missing)")

    logger.info("🚀 CyberSafe Nexus API is Ready to Serve.")
    yield 
    logger.info("🛑 Shutting down CyberSafe Nexus services...")

# --- APP SETUP ---
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

# --- CORS (Allow Frontend Access) ---
# Add your production frontend URL here once deployed to Vercel
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cybersafe-nexus.vercel.app"  # Placeholder for your production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER REGISTRATION ---

# 1. Authentication
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# 2. User Management
app.include_router(users.router, prefix="/api/users", tags=["User Intelligence"])

# 3. Curriculum / Lessons
app.include_router(lessons.router, prefix="/api/lessons", tags=["Curriculum Engine"])

# 4. Tactical Tools (AI, Phishing, Alerts)
app.include_router(tools.router, prefix="/api/tools", tags=["Cyber Tools"])

# 5. Admin / Root Console
app.include_router(admin.router, prefix="/admin", tags=["Root Console"])

# --- ROOT ENDPOINT (UPDATED FOR RENDER HEALTH CHECKS) ---
# Explicitly allowing 'HEAD' method fixes the 405 error on deployment
@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "system": "CyberSafe Nexus", 
        "status": "Operational", 
        "version": "v2.5.0"
    }

if __name__ == "__main__":
    # Auto-clear terminal for cleaner logs (Optional dev feature)
    os.system('cls' if os.name == 'nt' else 'clear')
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)