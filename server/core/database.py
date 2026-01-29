from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
import logging

logger = logging.getLogger("database")

# Preserving your specific Render/Dev TLS bypass
client_kwargs = {
    "tlsAllowInvalidCertificates": True, 
    "serverSelectionTimeoutMS": 5000,
}

client = AsyncIOMotorClient(settings.MONGO_URL, **client_kwargs)
db = client[settings.DB_NAME]