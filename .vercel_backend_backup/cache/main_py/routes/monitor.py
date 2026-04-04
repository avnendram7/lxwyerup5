from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timezone
import os

from services.database import db
from services.auth import create_admin_token, verify_admin_token

router = APIRouter(prefix="/monitor", tags=["Monitor"])
security = HTTPBearer()

MONITOR_EMAIL = os.environ.get("MONITOR_EMAIL", "monitor@lxwyerup.com")
MONITOR_PASSWORD = os.environ.get("MONITOR_PASSWORD", "monitor123")


class MonitorLogin(BaseModel):
    email: str
    password: str


def get_monitor(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_admin_token(credentials.credentials)


# ─────────────────── Login ────────────────────────────────────────────────────
@router.post("/login")
async def monitor_login(data: MonitorLogin):
    if data.email != MONITOR_EMAIL or data.password != MONITOR_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid monitor credentials")
    token = create_admin_token(data.email)
    return {"token": token, "message": "Monitor login successful"}


# ─────────────────── Overview ─────────────────────────────────────────────────
@router.get("/overview")
async def monitor_overview(admin=Depends(get_monitor)):
    total_users   = await db.users.count_documents({"user_type": {"$in": ["client", "user"]}})
    total_lawyers = await db.users.count_documents({"user_type": "lawyer"})
    total_books   = await db.bookings.count_documents({})
    active_books  = await db.bookings.count_documents({"status": {"$in": ["confirmed", "pending"]}})
    total_msgs    = await db.messages.count_documents({})
    total_cases   = await db.cases.count_documents({})
    sos_active    = await db.sos_sessions.count_documents({"status": {"$in": ["searching", "matched", "active"]}})
    total_firms   = await db.users.count_documents({"user_type": "law_firm"})
    total_firm_lawyers = await db.firm_lawyers.count_documents({})
    total_firm_clients = await db.firm_clients.count_documents({})
    pending_lawyer_apps = await db.firm_lawyer_applications.count_documents({"status": "pending"})
    pending_client_apps = await db.firm_client_applications.count_documents({"status": "pending"})

    return {
        "total_users": total_users,
        "total_lawyers": total_lawyers,
        "total_bookings": total_books,
        "active_bookings": active_books,
        "total_messages": total_msgs,
        "total_cases": total_cases,
        "sos_active": sos_active,
        "total_law_firms": total_firms,
        "total_firm_lawyers": total_firm_lawyers,
        "total_firm_clients": total_firm_clients,
        "pending_firm_lawyer_apps": pending_lawyer_apps,
        "pending_firm_client_apps": pending_client_apps,
    }


def clean(doc: dict, strip=("password",)) -> dict:
    return {k: v for k, v in doc.items() if k not in strip}


# ─────────────────── Users (full detail) ──────────────────────────────────────
@router.get("/users-full")
async def users_full(admin=Depends(get_monitor)):
    users = await db.users.find(
        {"user_type": {"$in": ["client", "user"]}}, {"password": 0}
    ).sort("created_at", -1).to_list(500)
    result = []
    for u in users:
        u["_id"] = str(u.get("_id", ""))
        uid = u.get("id", "")
        bookings = await db.bookings.find({"user_id": uid}).sort("created_at", -1).to_list(50)
        for b in bookings:
            b["_id"] = str(b.get("_id", ""))
            if b.get("lawyer_id") and not b.get("lawyer_name"):
                l = await db.users.find_one({"id": b["lawyer_id"]}, {"full_name": 1})
                if l: b["lawyer_name"] = l.get("full_name", "")
        cases = await db.cases.find({"user_id": uid}).sort("created_at", -1).to_list(50)
        for c in cases: c["_id"] = str(c.get("_id", ""))
        convos = await db.messages.distinct("receiver_id", {"sender_id": uid})
        convos += await db.messages.distinct("sender_id", {"receiver_id": uid})
        partner_ids = list(set(convos) - {uid})
        threads = []
        for pid in partner_ids[:10]:
            msgs = await db.messages.find({"$or": [{"sender_id": uid, "receiver_id": pid}, {"sender_id": pid, "receiver_id": uid}]}).sort("created_at", -1).to_list(20)
            for m in msgs: m["_id"] = str(m.get("_id", ""))
            partner = await db.users.find_one({"id": pid}, {"full_name": 1, "user_type": 1})
            threads.append({"partner_id": pid, "partner_name": partner.get("full_name", "Unknown") if partner else pid, "partner_type": partner.get("user_type", "?") if partner else "?", "messages": msgs[:10], "last_message": msgs[0] if msgs else None})
        sos = await db.sos_sessions.find({"user_id": uid}).sort("created_at", -1).to_list(10)
        for s in sos: s["_id"] = str(s.get("_id", ""))
        result.append({**u, "bookings": bookings, "cases": cases, "threads": threads, "sos_sessions": sos})
    return result


# ─────────────────── Lawyers (full detail) ────────────────────────────────────
@router.get("/lawyers-full")
async def lawyers_full(admin=Depends(get_monitor)):
    lawyers = await db.users.find({"user_type": "lawyer"}, {"password": 0}).sort("created_at", -1).to_list(500)
    result = []
    for l in lawyers:
        l["_id"] = str(l.get("_id", ""))
        lid = l.get("id", "")
        bookings = await db.bookings.find({"lawyer_id": lid}).sort("created_at", -1).to_list(50)
        for b in bookings:
            b["_id"] = str(b.get("_id", ""))
            if b.get("user_id") and not b.get("user_name"):
                u = await db.users.find_one({"id": b["user_id"]}, {"full_name": 1, "email": 1})
                if u: b["user_name"] = u.get("full_name") or u.get("email", "")
        convos = await db.messages.distinct("receiver_id", {"sender_id": lid})
        convos += await db.messages.distinct("sender_id", {"receiver_id": lid})
        partner_ids = list(set(convos) - {lid})
        threads = []
        for pid in partner_ids[:10]:
            msgs = await db.messages.find({"$or": [{"sender_id": lid, "receiver_id": pid}, {"sender_id": pid, "receiver_id": lid}]}).sort("created_at", -1).to_list(20)
            for m in msgs: m["_id"] = str(m.get("_id", ""))
            partner = await db.users.find_one({"id": pid}, {"full_name": 1, "user_type": 1})
            threads.append({"partner_id": pid, "partner_name": partner.get("full_name", "Unknown") if partner else pid, "partner_type": partner.get("user_type", "?") if partner else "?", "messages": msgs[:10], "last_message": msgs[0] if msgs else None})
        sos = await db.sos_sessions.find({"matched_lawyer_id": lid}).sort("created_at", -1).to_list(10)
        for s in sos: s["_id"] = str(s.get("_id", ""))
        result.append({**l, "bookings": bookings, "threads": threads, "sos_sessions": sos})
    return result


# ─────────────────── Law Firms (full detail) ──────────────────────────────────
@router.get("/law-firms-full")
async def law_firms_full(admin=Depends(get_monitor)):
    firms = await db.users.find(
        {"user_type": "law_firm"}, {"password": 0, "password_hash": 0}
    ).sort("created_at", -1).to_list(500)
    result = []
    for f in firms:
        f["_id"] = str(f.get("_id", ""))
        fid = f.get("unique_id") or f.get("id", "")
        firm_lawyers = await db.firm_lawyers.find({"firm_id": fid}, {"password_hash": 0}).sort("created_at", -1).to_list(100)
        for fl in firm_lawyers: fl["_id"] = str(fl.get("_id", ""))
        firm_clients = await db.firm_clients.find({"law_firm_id": fid}, {"password_hash": 0}).sort("created_at", -1).to_list(100)
        for fc in firm_clients: fc["_id"] = str(fc.get("_id", ""))
        lawyer_apps = await db.firm_lawyer_applications.find({"firm_id": fid}, {"password_hash": 0}).sort("created_at", -1).to_list(50)
        for a in lawyer_apps: a["_id"] = str(a.get("_id", ""))
        client_apps = await db.firm_client_applications.find({"law_firm_id": fid}, {"password_hash": 0}).sort("created_at", -1).to_list(50)
        for a in client_apps: a["_id"] = str(a.get("_id", ""))
        result.append({**f, "team_lawyers": firm_lawyers, "team_clients": firm_clients, "lawyer_applications": lawyer_apps, "client_applications": client_apps})
    return result


# ─────────────────── Firm Lawyers (full detail) ───────────────────────────────
@router.get("/firm-lawyers-full")
async def firm_lawyers_full(admin=Depends(get_monitor)):
    lawyers = await db.firm_lawyers.find({}, {"password_hash": 0}).sort("created_at", -1).to_list(500)
    result = []
    for fl in lawyers:
        fl["_id"] = str(fl.get("_id", ""))
        lid = fl.get("id", "")
        tasks = await db.firm_lawyer_tasks.find({"lawyer_id": lid}).sort("created_at", -1).to_list(50)
        for t in tasks: t["_id"] = str(t.get("_id", ""))
        clients = await db.firm_clients.find({"assigned_lawyer_id": lid}, {"password_hash": 0}).to_list(50)
        for c in clients: c["_id"] = str(c.get("_id", ""))
        result.append({**fl, "tasks": tasks, "assigned_clients": clients})
    return result


# ─────────────────── Firm Clients (full detail) ───────────────────────────────
@router.get("/firm-clients-full")
async def firm_clients_full(admin=Depends(get_monitor)):
    clients = await db.firm_clients.find({}, {"password_hash": 0}).sort("created_at", -1).to_list(500)
    result = []
    for fc in clients:
        fc["_id"] = str(fc.get("_id", ""))
        cid = fc.get("id", "")
        updates = await db.case_updates.find({"client_id": cid}).sort("created_at", -1).to_list(50)
        for u in updates: u["_id"] = str(u.get("_id", ""))
        result.append({**fc, "case_updates": updates})
    return result


# ─────────────────── Firm Lawyer Applications ────────────────────────────────
@router.get("/firm-lawyer-applications-full")
async def firm_lawyer_apps_full(admin=Depends(get_monitor)):
    apps = await db.firm_lawyer_applications.find({}, {"password_hash": 0}).sort("created_at", -1).to_list(500)
    for a in apps: a["_id"] = str(a.get("_id", ""))
    return apps


# ─────────────────── Firm Client Applications ────────────────────────────────
@router.get("/firm-client-applications-full")
async def firm_client_apps_full(admin=Depends(get_monitor)):
    apps = await db.firm_client_applications.find({}, {"password_hash": 0}).sort("created_at", -1).to_list(500)
    for a in apps: a["_id"] = str(a.get("_id", ""))
    return apps


# ─────────────────── All Messages (full surveillance) ────────────────────────
@router.get("/messages-full")
async def messages_full(admin=Depends(get_monitor)):
    """Every message on platform with sender/receiver enrichment"""
    msgs = await db.messages.find({}).sort("created_at", -1).to_list(2000)
    user_cache = {}
    async def get_user(uid):
        if uid not in user_cache:
            u = await db.users.find_one({"id": uid}, {"full_name": 1, "user_type": 1, "email": 1})
            user_cache[uid] = u or {}
        return user_cache[uid]
    result = []
    for m in msgs:
        m["_id"] = str(m.get("_id", ""))
        sender = await get_user(m.get("sender_id", ""))
        receiver = await get_user(m.get("receiver_id", ""))
        m["sender_name"] = sender.get("full_name") or sender.get("email") or m.get("sender_id")
        m["sender_type"] = sender.get("user_type", "?")
        m["receiver_name"] = receiver.get("full_name") or receiver.get("email") or m.get("receiver_id")
        m["receiver_type"] = receiver.get("user_type", "?")
        result.append(m)
    return result


# ─────────────────── Message Threads (grouped by conversation) ────────────────
@router.get("/message-threads")
async def message_threads(admin=Depends(get_monitor)):
    """All unique conversation threads with participants and message count"""
    msgs = await db.messages.find({}).sort("created_at", -1).to_list(5000)
    threads = {}
    for m in msgs:
        m["_id"] = str(m.get("_id", ""))
        sid, rid = m.get("sender_id",""), m.get("receiver_id","")
        key = tuple(sorted([sid, rid]))
        if key not in threads:
            threads[key] = {"participants": list(key), "messages": [], "message_count": 0, "last_message": None}
        threads[key]["messages"].append(m)
        threads[key]["message_count"] += 1
        if not threads[key]["last_message"]:
            threads[key]["last_message"] = m
    user_cache = {}
    async def get_name(uid):
        if uid not in user_cache:
            u = await db.users.find_one({"id": uid}, {"full_name": 1, "user_type": 1})
            user_cache[uid] = u or {}
        return user_cache[uid]
    result = []
    for key, thread in threads.items():
        p1 = await get_name(key[0])
        p2 = await get_name(key[1])
        result.append({
            "thread_id": f"{key[0]}_{key[1]}",
            "participant_1_id": key[0],
            "participant_1_name": p1.get("full_name", key[0]),
            "participant_1_type": p1.get("user_type", "?"),
            "participant_2_id": key[1],
            "participant_2_name": p2.get("full_name", key[1]),
            "participant_2_type": p2.get("user_type", "?"),
            "message_count": thread["message_count"],
            "last_message": thread["last_message"],
            "messages": thread["messages"][:50],
        })
    result.sort(key=lambda x: x["last_message"].get("created_at","") if x["last_message"] else "", reverse=True)
    return result


# ─────────────────── All Bookings/Appointments ────────────────────────────────
@router.get("/bookings-full")
async def bookings_full(admin=Depends(get_monitor)):
    """Every booking/appointment with full client+lawyer detail"""
    bookings = await db.bookings.find({}).sort("created_at", -1).to_list(2000)
    result = []
    for b in bookings:
        b["_id"] = str(b.get("_id", ""))
        if b.get("user_id") and not b.get("user_name"):
            u = await db.users.find_one({"id": b["user_id"]}, {"full_name": 1, "email": 1, "phone": 1})
            if u:
                b["user_name"] = u.get("full_name") or u.get("email")
                b["user_email"] = u.get("email")
                b["user_phone"] = u.get("phone")
        if b.get("lawyer_id") and not b.get("lawyer_name"):
            l = await db.users.find_one({"id": b["lawyer_id"]}, {"full_name": 1, "email": 1, "specialization": 1})
            if l:
                b["lawyer_name"] = l.get("full_name")
                b["lawyer_email"] = l.get("email")
                b["lawyer_specialization"] = l.get("specialization")
        result.append(b)
    return result


# ─────────────────── All SOS Sessions ────────────────────────────────────────
@router.get("/sos-full")
async def sos_full(admin=Depends(get_monitor)):
    """Every SOS session with user+lawyer enrichment"""
    sessions = await db.sos_sessions.find({}).sort("created_at", -1).to_list(1000)
    result = []
    for s in sessions:
        s["_id"] = str(s.get("_id", ""))
        if s.get("user_id"):
            u = await db.users.find_one({"id": s["user_id"]}, {"full_name": 1, "email": 1, "phone": 1})
            if u:
                s["user_name"] = u.get("full_name") or u.get("email")
                s["user_phone"] = u.get("phone")
        if s.get("matched_lawyer_id"):
            l = await db.users.find_one({"id": s["matched_lawyer_id"]}, {"full_name": 1, "specialization": 1})
            if l:
                s["lawyer_name"] = l.get("full_name")
                s["lawyer_specialization"] = l.get("specialization")
        result.append(s)
    return result


# ─────────────────── All Cases ────────────────────────────────────────────────
@router.get("/cases-full")
async def cases_full(admin=Depends(get_monitor)):
    """Every case with client+lawyer enrichment"""
    cases = await db.cases.find({}).sort("created_at", -1).to_list(1000)
    result = []
    for c in cases:
        c["_id"] = str(c.get("_id", ""))
        if c.get("user_id"):
            u = await db.users.find_one({"id": c["user_id"]}, {"full_name": 1, "email": 1})
            if u: c["user_name"] = u.get("full_name") or u.get("email")
        if c.get("lawyer_id"):
            l = await db.users.find_one({"id": c["lawyer_id"]}, {"full_name": 1, "specialization": 1})
            if l:
                c["lawyer_name"] = l.get("full_name")
                c["lawyer_specialization"] = l.get("specialization")
        result.append(c)
    return result


# ─────────────────── Live Activity Feed ──────────────────────────────────────
@router.get("/activity-feed")
async def activity_feed(admin=Depends(get_monitor), limit: int = 100):
    """Recent activity across ALL collections — unified live feed"""
    from datetime import timedelta
    events = []

    # Recent bookings
    bookings = await db.bookings.find({}).sort("created_at", -1).to_list(30)
    for b in bookings:
        b["_id"] = str(b.get("_id",""))
        events.append({"type": "BOOKING", "color": "#3b82f6", "time": b.get("created_at",""), "summary": f"Booking: {b.get('user_name','?')} → {b.get('lawyer_name','?')} [{b.get('status','?')}]", "data": b})

    # Recent messages
    msgs = await db.messages.find({}).sort("created_at", -1).to_list(30)
    for m in msgs:
        m["_id"] = str(m.get("_id",""))
        events.append({"type": "MESSAGE", "color": "#8b5cf6", "time": m.get("created_at",""), "summary": f"Msg: {m.get('sender_id','?')[:8]}... → {m.get('receiver_id','?')[:8]}...: {str(m.get('content',''))[:60]}", "data": m})

    # Recent SOS
    sos = await db.sos_sessions.find({}).sort("created_at", -1).to_list(20)
    for s in sos:
        s["_id"] = str(s.get("_id",""))
        events.append({"type": "SOS", "color": "#ef4444", "time": s.get("created_at",""), "summary": f"SOS: User {s.get('user_id','?')[:8]}... status={s.get('status','?')}", "data": s})

    # Recent firm client apps
    capps = await db.firm_client_applications.find({}).sort("created_at", -1).to_list(20)
    for a in capps:
        a["_id"] = str(a.get("_id",""))
        events.append({"type": "CLIENT_APP", "color": "#06b6d4", "time": a.get("created_at",""), "summary": f"Firm Client App: {a.get('full_name','?')} → {a.get('law_firm_name','?')} [{a.get('status','pending')}]", "data": a})

    # Recent firm lawyer apps
    lapps = await db.firm_lawyer_applications.find({}).sort("created_at", -1).to_list(20)
    for a in lapps:
        a["_id"] = str(a.get("_id",""))
        events.append({"type": "LAWYER_APP", "color": "#f59e0b", "time": a.get("created_at",""), "summary": f"Firm Lawyer App: {a.get('full_name','?')} → {a.get('firm_name','?')} [{a.get('status','pending')}]", "data": a})

    # Recent lawyer applications
    la = await db.lawyer_applications.find({}).sort("created_at", -1).to_list(20)
    for a in la:
        a["_id"] = str(a.get("_id",""))
        events.append({"type": "LAWYER_APPLICATION", "color": "#10b981", "time": a.get("created_at",""), "summary": f"Lawyer App: {a.get('name',a.get('full_name','?'))} [{a.get('status','pending')}]", "data": a})

    # Recent case updates
    updates = await db.case_updates.find({}).sort("created_at", -1).to_list(20)
    for u in updates:
        u["_id"] = str(u.get("_id",""))
        events.append({"type": "CASE_UPDATE", "color": "#a78bfa", "time": u.get("created_at",""), "summary": f"Case Update: {u.get('title','?')} by {u.get('created_by','?')}", "data": u})

    # Sort all by time desc
    events.sort(key=lambda x: str(x.get("time","")), reverse=True)
    return events[:limit]
