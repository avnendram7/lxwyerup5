from fastapi import APIRouter, Depends
from routes.auth import get_current_user
from services.database import db
from datetime import datetime, timezone

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _case_query_for_client(uid):
    return {"$or": [{"client_id": uid}, {"user_id": uid}]}


def _case_query_for_lawyer(uid):
    return {"$or": [{"lawyer_id": uid}, {"user_id": uid}]}


@router.get("/user")
async def get_user_dashboard(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    q = _case_query_for_client(uid)

    recent_cases = []
    async for case in db.cases.find(q).sort("created_at", -1).limit(5):
        recent_cases.append({
            "id": case.get("id", str(case.get("_id", ""))),
            "title": case.get("title", "Untitled Case"),
            "status": case.get("status", "Unknown"),
            "next_hearing": case.get("next_hearing"),
            "lawyer": case.get("lawyer_name", "N/A"),
            "case_type": case.get("case_type", "General"),
            "case_number": case.get("case_number", ""),
        })

    upcoming_hearings = []
    async for case in db.cases.find({**q, "next_hearing": {"$ne": None}}).sort("next_hearing", 1).limit(5):
        upcoming_hearings.append({
            "date": case.get("next_hearing"),
            "time": "10:00 AM",
            "court": case.get("court", "N/A"),
            "case": case.get("title", "Untitled"),
        })

    active_cases_count = await db.cases.count_documents({**q, "status": {"$in": ["active", "open"]}})
    total_cases_count = await db.cases.count_documents(q)
    pending_docs = await db.documents.count_documents({"user_id": uid})

    bk_q = {"$or": [{"client_id": uid}, {"user_id": uid}]}
    total_bookings = await db.bookings.count_documents(bk_q)
    upcoming_bookings = await db.bookings.count_documents({**bk_q, "status": {"$in": ["confirmed", "pending"]}})

    try:
        spend_res = await db.bookings.aggregate([
            {"$match": bk_q},
            {"$group": {"_id": None, "total": {"$sum": "$price"}}}
        ]).to_list(length=1)
        total_spent = spend_res[0]["total"] if spend_res else 0
    except Exception:
        total_spent = 0

    return {
        "recent_cases": recent_cases,
        "upcoming_hearings": upcoming_hearings,
        "stats": {
            "active_cases": active_cases_count,
            "total_cases": total_cases_count,
            "pending_documents": pending_docs,
            "total_spent": total_spent,
            "total_bookings": total_bookings,
            "upcoming_bookings": upcoming_bookings,
        }
    }


@router.get("/lawyer")
async def get_lawyer_dashboard(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    q = _case_query_for_lawyer(uid)

    active_cases_count = await db.cases.count_documents({**q, "status": {"$in": ["active", "open"]}})
    total_cases_count = await db.cases.count_documents(q)

    try:
        client_res = await db.cases.aggregate([
            {"$match": q},
            {"$group": {"_id": "$client_name"}},
            {"$count": "count"}
        ]).to_list(length=1)
        total_clients = client_res[0]["count"] if client_res else 0
    except Exception:
        total_clients = 0

    bk_q = {"lawyer_id": uid}
    consultations_count = await db.bookings.count_documents(bk_q)
    upcoming_count = await db.bookings.count_documents({**bk_q, "status": {"$in": ["confirmed", "pending"]}})

    try:
        revenue_res = await db.bookings.aggregate([
            {"$match": {**bk_q, "status": {"$in": ["confirmed", "completed"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$price"}}}
        ]).to_list(length=1)
        revenue = revenue_res[0]["total"] if revenue_res else 0
    except Exception:
        revenue = 0

    upcoming_hearings = []
    async for case in db.cases.find({**q, "next_hearing": {"$ne": None}}).sort("next_hearing", 1).limit(5):
        upcoming_hearings.append({
            "date": case.get("next_hearing"),
            "court": case.get("court", "N/A"),
            "case": case.get("title"),
            "client": case.get("client_name", ""),
            "status": case.get("status", "active"),
        })

    recent_clients = []
    async for case in db.cases.find(q).sort("created_at", -1).limit(5):
        recent_clients.append({
            "name": case.get("client_name", "Unknown"),
            "case": case.get("title"),
            "status": case.get("status"),
            "case_type": case.get("case_type", ""),
        })

    return {
        "stats": {
            "active_cases": active_cases_count,
            "total_cases": total_cases_count,
            "total_clients": total_clients,
            "consultations_this_month": consultations_count,
            "upcoming_appointments": upcoming_count,
            "revenue": revenue,
        },
        "upcoming_hearings": upcoming_hearings,
        "recent_clients": recent_clients,
    }


@router.get("/law-firm")
async def get_law_firm_dashboard(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]

    # Count lawyers in this firm
    total_lawyers = await db.users.count_documents({"firm_id": uid, "user_type": "firm_lawyer"})
    total_clients = await db.firm_clients.count_documents({"law_firm_id": uid})
    active_clients = await db.firm_clients.count_documents({"law_firm_id": uid, "status": "active"})

    # Get lawyer IDs for task/case aggregation
    lawyers = await db.users.find({"firm_id": uid, "user_type": "firm_lawyer"}, {"id": 1, "_id": 0}).to_list(100)
    lawyer_ids = [l["id"] for l in lawyers]

    pending_tasks = await db.firm_tasks.count_documents({"assigned_to": {"$in": lawyer_ids}, "status": "pending"})
    completed_tasks = await db.firm_tasks.count_documents({"assigned_to": {"$in": lawyer_ids}, "status": "completed"})
    in_progress_tasks = await db.firm_tasks.count_documents({"assigned_to": {"$in": lawyer_ids}, "status": "in_progress"})
    total_tasks = pending_tasks + completed_tasks + in_progress_tasks

    try:
        revenue_res = await db.billing.aggregate([
            {"$match": {"lawyer_id": {"$in": lawyer_ids}, "status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(length=1)
        revenue = revenue_res[0]["total"] if revenue_res else 0
    except Exception:
        revenue = 0

    top_lawyers = []
    for lawyer in await db.users.find({"firm_id": uid, "user_type": "firm_lawyer"}, {"_id": 0, "password": 0, "password_hash": 0}).to_list(10):
        t_count = await db.firm_tasks.count_documents({"assigned_to": lawyer["id"]})
        top_lawyers.append({
            "name": lawyer.get("full_name", ""),
            "specialization": lawyer.get("specialization", "General"),
            "cases": t_count,
            "rating": lawyer.get("rating", 4.5),
        })

    return {
        "stats": {
            "total_lawyers": total_lawyers,
            "total_clients": total_clients,
            "active_clients": active_clients,
            "active_cases": active_clients,
            "revenue": revenue,
            "pending_approvals": 0,
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks,
        },
        "top_lawyers": top_lawyers,
    }


@router.get("/firm-client")
async def get_firm_client_dashboard(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    client = await db.firm_clients.find_one({"id": uid}, {"_id": 0, "password": 0, "password_hash": 0})
    updates = await db.client_case_updates.find({"client_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return {
        "case_details": client,
        "updates": updates,
    }


@router.get("/firm-lawyer")
async def get_firm_lawyer_dashboard(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]

    tasks = await db.firm_tasks.find({"assigned_to": uid}, {"_id": 0}).sort("created_at", -1).to_list(20)
    pending_tasks = len([t for t in tasks if t.get("status") == "pending"])
    completed_tasks = len([t for t in tasks if t.get("status") == "completed"])
    in_progress_tasks = len([t for t in tasks if t.get("status") == "in_progress"])

    events = await db.events.find(
        {"$or": [{"lawyer_id": uid}, {"user_id": uid}]},
        {"_id": 0}
    ).sort("start_time", 1).to_list(10)

    return {
        "stats": {
            "assigned_cases": len(tasks),
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "hours_billed": completed_tasks * 2,
        },
        "tasks": tasks,
        "events": events,
    }
