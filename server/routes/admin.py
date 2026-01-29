from fastapi import APIRouter, Depends, HTTPException, status
from core.security import validate_admin  # Centralized security gatekeeper
from core.database import db
from datetime import datetime, timezone
import psutil
import time

router = APIRouter()

# --- 1. USER MANAGEMENT: PERSONNEL REGISTRY ---
@router.get("/all-users", dependencies=[Depends(validate_admin)])
async def get_all_personnel():
    """
    Retrieves all cadets and their total XP for the Root Registry.
    MongoDB Aggregation Pipeline handles the join and sum on the server side.
    """
    pipeline = [
        {
            "$lookup": {
                "from": "user_progress",
                "localField": "user_id",
                "foreignField": "user_id",
                "as": "progress"
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": "$user_id",
                "name": 1,
                "email": 1,
                "profile_type": 1,
                "role": 1,
                "xp": {"$sum": "$progress.xp_gained"}
            }
        }
    ]
    return await db.users.aggregate(pipeline).to_list(length=100)

# --- 2. ADVANCED INTELLIGENCE: GLOBAL ANALYTICS ---
@router.get("/intel/global-analytics", dependencies=[Depends(validate_admin)])
async def get_advanced_intelligence():
    """
    Performs real-time data mining across all collections to provide 
    a high-level snapshot of system activity and user performance.
    """
    # User Demographics Distribution
    user_dist = await db.users.aggregate([
        {"$group": {"_id": "$profile_type", "count": {"$sum": 1}}}
    ]).to_list(10)

    # Threat Simulation Metrics (SIEM Analysis)
    threat_metrics = await db.security_logs.aggregate([
        {"$group": {"_id": "$tool", "count": {"$sum": 1}}}
    ]).to_list(10)

    # Learning Progress Aggregation
    progress_stats = await db.user_progress.aggregate([
        {
            "$group": {
                "_id": None,
                "avg_quiz_score": {"$avg": "$quiz_score"},
                "total_system_xp": {"$sum": "$xp_gained"}
            }
        }
    ]).to_list(1)

    total_users = await db.users.count_documents({})

    return {
        "demographics": {item["_id"]: item["count"] for item in user_dist},
        "threat_landscape": threat_metrics,
        "performance": progress_stats[0] if progress_stats else {"avg_quiz_score": 0, "total_system_xp": 0},
        "total_nodes": total_users
    }

# --- 3. INFRASTRUCTURE MONITORING: SYSTEM HEALTH ---
@router.get("/system/health", dependencies=[Depends(validate_admin)])
async def get_system_health():
    """
    Monitors hardware vitals and database latency.
    Essential for presenting the 'Production-Ready' status of the app.
    """
    # Database Latency Check (Ping)
    start_time = time.time()
    await db.command("ping")
    db_latency = round((time.time() - start_time) * 1000, 2)

    # Hardware Resource Usage
    cpu_usage = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory().percent
    
    return {
        "status": "Optimal" if cpu_usage < 80 else "Strained",
        "cpu": f"{cpu_usage}%",
        "memory": f"{memory}%",
        "db_latency": f"{db_latency}ms"
    }

# --- 4. BROADCAST: PUSH TO GLOBAL TICKER ---
@router.post("/push-alert", dependencies=[Depends(validate_admin)])
async def push_global_alert(payload: dict):
    message = payload.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Broadcast message is empty.")

    alert_doc = {
        "message": message,
        "type": "admin_alert",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.global_alerts.insert_one(alert_doc)
    return {"status": "Intel Broadcasted Successfully"}

# --- 5. SYSTEM MODERATION: RESET & PURGE PROTOCOLS ---
@router.delete("/delete-user/{user_id}", dependencies=[Depends(validate_admin)])
async def purge_user(user_id: str):
    res1 = await db.users.delete_one({"user_id": user_id})
    res2 = await db.user_progress.delete_many({"user_id": user_id})
    if res1.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "User Purged", "logs_cleared": res2.deleted_count}

@router.post("/system/reset", dependencies=[Depends(validate_admin)])
async def global_system_reset():
    """
    Emergency Protocol: Wipes all progress, logs, and alerts for a clean demo start.
    """
    try:
        p1 = await db.user_progress.delete_many({})
        p2 = await db.security_logs.delete_many({})
        p3 = await db.global_alerts.delete_many({})
        # Optional: Reset user streaks to zero
        await db.users.update_many({}, {"$set": {"streak_count": 0}})

        return {
            "status": "Global Reset Complete",
            "records_purged": p1.deleted_count + p2.deleted_count + p3.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Reset Protocol Interrupted")