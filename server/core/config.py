import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # --- DATABASE ---
    # Best Practice: Default to None or localhost to avoid leaking cloud credentials
    MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://AbhiSha08:sde%402026@cluster0.vo0tmvi.mongodb.net/") 
    DB_NAME = os.getenv("DB_NAME", "cybersafe_db")

    # --- SECURITY ---
    JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
    JWT_ALGORITHM = "HS256"
    # Ensure this matches the logic in security.py (Hours vs Minutes)
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "72"))

    # --- AI SERVICES ---
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "") 

    # --- CORS ---
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

settings = Settings()