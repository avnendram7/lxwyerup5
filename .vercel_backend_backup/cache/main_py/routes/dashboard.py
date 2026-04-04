from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from routes.auth import get_current_user
from services.database import get_db, db
from models.user import User
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Hardcoded Dummy Data for Demo Accounts
DUMMY_DATA = {
    "user": {
        "recent_cases": [
            {
                "id": "dummy_case_1",
                "title": "State vs Demo User",
                "status": "Active",
                "next_hearing": "2026-03-15",
                "lawyer": "Adv. Demo Lawyer"
            }
        ],
        "upcoming_hearings": [
            {
                "date": "2026-03-15",
                "time": "10:00 AM",
                "court": "Delhi High Court",
                "case": "State vs Demo User"
            }
        ],
        "stats": {
            "active_cases": 1,
            "pending_documents": 2,
            "total_spent": 5000
        }
    },
    "lawyer": {
        "stats": {
            "active_cases": 12,
            "total_clients": 45,
            "consultations_this_month": 8,
            "revenue": 150000
        },
        "upcoming_hearings": [
            {"date": "2026-03-10", "court": "Supreme Court", "case": "Sharma vs State"},
            {"date": "2026-03-12", "court": "District Court", "case": "Mehta Property Dispute"}
        ],
        "recent_clients": [
            {"name": "Rahul Kumar", "case": "Divorce Petition", "status": "New"},
            {"name": "Priya Singh", "case": "Corporate Fraud", "status": "Ongoing"}
        ]
    },
    "law_firm": {
        "stats": {
            "total_lawyers": 15,
            "active_cases": 120,
            "revenue": 5000000,
            "pending_approvals": 3
        },
        "top_lawyers": [
            {"name": "Adv. Vikram", "cases": 25, "rating": 4.9},
            {"name": "Adv. Anjali", "cases": 18, "rating": 4.8}
        ]
    },
    "firm_client": {
        "case_details": {
            "title": "Corporate Merger - Tech Corp",
            "status": "In Progress",
            "lawyer": "Adv. Demo Firm Lawyer",
            "firm": "Demo Law Firm"
        },
        "updates": [
            {"date": "2026-02-10", "message": "Draft agreement shared for review"},
            {"date": "2026-02-01", "message": "Initial consultation completed"}
        ]
    },
    "firm_lawyer": {
        "stats": {
            "assigned_cases": 8,
            "hours_billed": 120,
            "pending_tasks": 5
        },
        "tasks": [
            {"title": "Review Merger Agreement", "due": "2026-02-15", "priority": "High"},
            {"title": "Client Meeting - Tech Corp", "due": "2026-02-16", "priority": "Medium"}
        ]
    }
}

@router.get("/user")
async def get_user_user_dashboard(current_user: dict = Depends(get_current_user)):
    # Check if dummy user
    if current_user["id"].startswith("dummy_"):
        return DUMMY_DATA["user"]
    
    user_id = current_user["id"]
    
    # Recent Cases
    recent_cases = []
    async for case in db.cases.find({"user_id": user_id}).sort("created_at", -1).limit(3):
        recent_cases.append({
            "id": case.get("id", str(case.get("_id"))),
            "title": case.get("title", "Untitled Case"),
            "status": case.get("status", "Unknown"),
            "next_hearing": case.get("next_hearing", "N/A"),
            "lawyer": case.get("lawyer_name", "N/A")
        })
        
    # Upcoming hearings
    upcoming_hearings = []
    async for case in db.cases.find({"user_id": user_id, "next_hearing": {"$ne": None}}).sort("next_hearing", 1).limit(3):
        upcoming_hearings.append({
            "date": case.get("next_hearing"),
            "time": "10:00 AM",
            "court": case.get("court", "N/A"),
            "case": case.get("title", "Untitled Case")
        })
        
    # Stats First
    active_cases_count = await db.cases.count_documents({"user_id": user_id, "status": "active"})
    pending_docs = await db.documents.count_documents({"user_id": user_id, "status": "pending"})
    
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]
    try:
        spend_res = await db.bookings.aggregate(pipeline).to_list(length=1)
        total_spent = spend_res[0]["total"] if spend_res else 0
    except Exception:
        total_spent = 0
        
    # If entirely empty, provide realistic fallback "welcome" data
    if active_cases_count == 0 and pending_docs == 0 and total_spent == 0:
        return {
            "recent_cases": [
                {
                    "title": "Welcome to LxwyerUp!",
                    "status": "Getting Started",
                    "next_hearing": "N/A",
                    "lawyer": "System"
                }
            ],
            "upcoming_hearings": [],
            "stats": {
                "active_cases": 0,
                "pending_documents": 0,
                "total_spent": 0
            }
        }
        
    return {
        "recent_cases": recent_cases,
        "upcoming_hearings": upcoming_hearings,
        "stats": {
            "active_cases": active_cases_count,
            "pending_documents": pending_docs,
            "total_spent": total_spent
        }
    }

@router.get("/lawyer")
async def get_lawyer_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["id"].startswith("dummy_"):
        return DUMMY_DATA["lawyer"]
        
    user_id = current_user["id"]
    
    # 1. Active Cases
    active_cases_count = await db.cases.count_documents({"user_id": user_id, "status": "active"})
    
    # 2. Total Clients (Unique names)
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$client_name"}},
        {"$count": "count"}
    ]
    try:
        client_res = await db.cases.aggregate(pipeline).to_list(length=1)
        total_clients = client_res[0]["count"] if client_res else 0
    except Exception:
        total_clients = 0

    # 3. Consultations (Bookings) & Revenue
    consultations_count = await db.bookings.count_documents({"lawyer_id": user_id})
    
    pipeline = [
        {"$match": {"lawyer_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]
    try:
        revenue_res = await db.bookings.aggregate(pipeline).to_list(length=1)
        revenue = revenue_res[0]["total"] if revenue_res else 0
    except Exception:
        revenue = 0
    
    # 4. Hearings
    upcoming_hearings = []
    async for case in db.cases.find({"user_id": user_id, "next_hearing": {"$ne": None}}).sort("next_hearing", 1).limit(5):
        upcoming_hearings.append({
            "date": case.get("next_hearing"),
            "court": case.get("court", "N/A"),
            "case": case.get("title")
        })
        
    # 5. Recent Clients
    recent_clients = []
    async for case in db.cases.find({"user_id": user_id}).sort("created_at", -1).limit(5):
        recent_clients.append({
            "name": case.get("client_name", "Unknown"),
            "case": case.get("title"),
            "status": case.get("status")
        })

    return {
        "stats": {
            "active_cases": active_cases_count,
            "total_clients": total_clients,
            "consultations_this_month": consultations_count,
            "revenue": revenue
        },
        "upcoming_hearings": upcoming_hearings,
        "recent_clients": recent_clients
    }

@router.get("/law-firm")
async def get_law_firm_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["id"].startswith("dummy_"):
        return DUMMY_DATA["law_firm"]
        
    return {
        "stats": {"total_lawyers": 0, "active_cases": 0, "revenue": 0, "pending_approvals": 0},
        "top_lawyers": []
    }

@router.get("/firm-client")
async def get_firm_client_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["id"].startswith("dummy_"):
        return DUMMY_DATA["firm_client"]
        
    return {
        "case_details": None,
        "updates": []
    }

@router.get("/firm-lawyer")
async def get_firm_lawyer_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["id"].startswith("dummy_"):
        return DUMMY_DATA["firm_lawyer"]
        
    return {
        "stats": {"assigned_cases": 0, "hours_billed": 0, "pending_tasks": 0},
        "tasks": []
    }
