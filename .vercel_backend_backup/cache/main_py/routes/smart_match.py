"""
Smart Match API — Data-driven lawyer & law firm recommendation engine.

Architecture:
 - All data is fetched LIVE from MongoDB on every request → no stale profiles
 - New approved profiles are automatically included (zero retraining needed)
 - Scoring is pure algorithmic: no AI API, no bias from registration order
 - Multi-factor weighted scoring:
     Specialization match  40 pts
     Location match        30 pts  (city 30, state 20)
     Language match        10 pts
     Experience            10 pts  (capped at 20 yrs = 10 pts)
     Budget fit             5 pts
     Consult mode match     3 pts
     Verification bonus     2 pts
 - Jitter: ±3 pts seeded-random so ties rotate fairly across sessions
"""

import re
import math
import random
import hashlib
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.database import db

router = APIRouter(prefix="/smart-match", tags=["Smart Match"])

logger = logging.getLogger(__name__)

# ── MODELS ────────────────────────────────────────────────────────────────────

class MatchQuery(BaseModel):
    query: str
    session_id: Optional[str] = ""   # used for seeded jitter

class LawyerMatchResult(BaseModel):
    id: str
    name: str
    specialization: str
    city: str
    state: str
    experience: int
    fee: str
    languages: List[str]
    photo: Optional[str] = ""
    verified: bool
    unique_id: Optional[str] = ""
    bio: Optional[str] = ""
    court: Optional[List[str]] = []
    education: Optional[str] = ""
    score: int
    match_reasons: List[str]

class FirmMatchResult(BaseModel):
    id: str
    name: str
    city: str
    state: str
    practice_areas: List[str]
    lawyers_count: int
    fee_min: Optional[int] = 0
    description: Optional[str] = ""
    image: Optional[str] = ""
    unique_id: Optional[str] = ""
    score: int
    match_reasons: List[str]

class MatchResponse(BaseModel):
    results: list
    total_found: int
    query_summary: dict    # What the engine extracted from the query

# ── NLP EXTRACTION ────────────────────────────────────────────────────────────

SPECIALIZATION_MAP = {
    # Criminal
    "criminal":      "Criminal Law",  "murder":      "Criminal Law",
    "theft":         "Criminal Law",  "robbery":     "Criminal Law",
    "bail":          "Criminal Law",  "fir":         "Criminal Law",
    "arrest":        "Criminal Law",  "police":      "Criminal Law",
    "fraud":         "Criminal Law",  "ipc":         "Criminal Law",
    "bns":           "Criminal Law",  "assault":     "Criminal Law",
    "rape":          "Criminal Law",  "kidnap":      "Criminal Law",
    # Family
    "divorce":       "Family Law",    "custody":     "Family Law",
    "alimony":       "Family Law",    "maintenance": "Family Law",
    "marriage":      "Family Law",    "matrimonial": "Family Law",
    "talaq":         "Family Law",    "dowry":       "Family Law",
    "adoption":      "Family Law",    "family":      "Family Law",
    # Property / Civil
    "property":      "Property Law",  "land":        "Property Law",
    "tenant":        "Property Law",  "landlord":    "Property Law",
    "rent":          "Property Law",  "zameen":      "Property Law",
    "real estate":   "Property Law",  "possession":  "Property Law",
    # Corporate
    "corporate":     "Corporate Law", "company":     "Corporate Law",
    "contract":      "Corporate Law", "startup":     "Corporate Law",
    "merger":        "Corporate Law", "acquisition": "Corporate Law",
    "director":      "Corporate Law", "shareholder": "Corporate Law",
    "mca":           "Corporate Law",
    # Tax
    "tax":           "Tax Law",       "gst":         "Tax Law",
    "income tax":    "Tax Law",       "itr":         "Tax Law",
    "tds":           "Tax Law",
    # Cyber Law
    "cyber":         "Cyber Law",     "hacking":     "Cyber Law",
    "online fraud":  "Cyber Law",     "data theft":  "Cyber Law",
    "it act":        "Cyber Law",
    # Labour
    "labour":        "Labour Law",    "employment":  "Labour Law",
    "fired":         "Labour Law",    "salary":      "Labour Law",
    "termination":   "Labour Law",    "pf":          "Labour Law",
    "esic":          "Labour Law",
    # Consumer
    "consumer":      "Consumer Law",  "defective":   "Consumer Law",
    "refund":        "Consumer Law",  "cheating":    "Consumer Law",
    # IPR
    "ipr":           "Intellectual Property", "trademark": "Intellectual Property",
    "patent":        "Intellectual Property", "copyright": "Intellectual Property",
    # Medical
    "medical":       "Medical Law",   "hospital":    "Medical Law",
    "negligence":    "Medical Law",
    # Banking
    "banking":       "Banking Law",   "loan":        "Banking Law",
    "npa":           "Banking Law",   "cheque bounce": "Banking Law",
    # Immigration
    "immigration":   "Immigration Law", "visa":      "Immigration Law",
    "passport":      "Immigration Law",
    # Civil
    "civil":         "Civil Law",     "suit":        "Civil Law",
    "injunction":    "Civil Law",     "damages":     "Civil Law",
}

LOCATION_MAP = {
    # Cities
    "delhi":         {"city": "Delhi",           "state": "Delhi"},
    "new delhi":     {"city": "Delhi",           "state": "Delhi"},
    "gurgaon":       {"city": "Gurugram",        "state": "Haryana"},
    "gurugram":      {"city": "Gurugram",        "state": "Haryana"},
    "faridabad":     {"city": "Faridabad",       "state": "Haryana"},
    "rohtak":        {"city": "Rohtak",          "state": "Haryana"},
    "panipat":       {"city": "Panipat",         "state": "Haryana"},
    "ambala":        {"city": "Ambala",          "state": "Haryana"},
    "hisar":         {"city": "Hisar",           "state": "Haryana"},
    "karnal":        {"city": "Karnal",          "state": "Haryana"},
    "panchkula":     {"city": "Panchkula",       "state": "Haryana"},
    "sonipat":       {"city": "Sonipat",         "state": "Haryana"},
    "sonepat":       {"city": "Sonipat",         "state": "Haryana"},
    "lucknow":       {"city": "Lucknow",         "state": "Uttar Pradesh"},
    "noida":         {"city": "Noida",           "state": "Uttar Pradesh"},
    "greater noida": {"city": "Greater Noida",   "state": "Uttar Pradesh"},
    "agra":          {"city": "Agra",            "state": "Uttar Pradesh"},
    "kanpur":        {"city": "Kanpur",          "state": "Uttar Pradesh"},
    "allahabad":     {"city": "Prayagraj",       "state": "Uttar Pradesh"},
    "prayagraj":     {"city": "Prayagraj",       "state": "Uttar Pradesh"},
    "meerut":        {"city": "Meerut",          "state": "Uttar Pradesh"},
    "varanasi":      {"city": "Varanasi",        "state": "Uttar Pradesh"},
    "mathura":       {"city": "Mathura",         "state": "Uttar Pradesh"},
    # State-level
    "haryana":       {"city": None,              "state": "Haryana"},
    "uttar pradesh": {"city": None,              "state": "Uttar Pradesh"},
    "up":            {"city": None,              "state": "Uttar Pradesh"},
}

LANGUAGE_KEYWORDS = {
    "hindi": "Hindi", "english": "English", "punjabi": "Punjabi",
    "urdu": "Urdu", "bengali": "Bengali", "tamil": "Tamil",
    "telugu": "Telugu", "gujarati": "Gujarati", "marathi": "Marathi",
    "kannada": "Kannada", "odia": "Odia",
}

CONSULT_KEYWORDS = {
    "video": "video", "online": "video", "virtual": "video",
    "zoom": "video", "in person": "in_person", "in-person": "in_person",
    "offline": "in_person", "meet": "in_person", "visit": "in_person",
}

URGENT_WORDS = {"urgent", "emergency", "asap", "immediately", "today", "right now", "help"}


def extract_intent(query: str) -> dict:
    """Extract structured intent from a free-text query."""
    q = query.lower()

    # Specialization — longest-match first
    spec = None
    for kw in sorted(SPECIALIZATION_MAP.keys(), key=len, reverse=True):
        if kw in q:
            spec = SPECIALIZATION_MAP[kw]
            break

    # Location — longest-match first
    loc = None
    for kw in sorted(LOCATION_MAP.keys(), key=len, reverse=True):
        if kw in q:
            loc = LOCATION_MAP[kw]
            break

    # Language
    lang = None
    for kw, lang_name in LANGUAGE_KEYWORDS.items():
        if kw in q:
            lang = lang_name
            break
    # Auto-detect Hindi from Devanagari script
    if not lang and re.search(r'[\u0900-\u097F]', query):
        lang = "Hindi"

    # Consult type
    consult = None
    for kw, mode in CONSULT_KEYWORDS.items():
        if kw in q:
            consult = mode
            break

    # Experience (e.g., "5+ years", "10 years")
    exp_match = re.search(r'(\d+)\+?\s*(?:year|yr)s?', q)
    min_exp = int(exp_match.group(1)) if exp_match else None

    # Budget
    budget = None
    if re.search(r'\bfree\b|pro bono|no fee', q):
        budget = 0
    else:
        under_match = re.search(r'under\s*(?:rs\.?|₹)?\s*(\d+)', q) or \
                      re.search(r'(?:rs\.?|₹)\s*(\d+)\s*(?:or\s*less|max)', q)
        if under_match:
            budget = int(under_match.group(1))
        elif re.search(r'\baffordable\b|\bcheap\b|\blow.cost\b|\bbudget\b', q):
            budget = 2000

    # Urgency
    urgent = any(w in q.split() or w in q for w in URGENT_WORDS)

    return {
        "specialization": spec,
        "location": loc,
        "language": lang,
        "consult_type": consult,
        "min_experience": min_exp,
        "budget": budget,
        "urgent": urgent,
    }


def seeded_jitter(entity_id: str, session_id: str, max_jitter: int = 3) -> int:
    """Deterministic ±jitter based on entity+session so results rotate per user session."""
    seed_str = f"{entity_id}:{session_id}"
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    return (h % (max_jitter * 2 + 1)) - max_jitter


# ── LAWYER SCORING ────────────────────────────────────────────────────────────

def score_lawyer(lawyer: dict, intent: dict, session_id: str) -> tuple[int, list]:
    score = 0
    reasons = []

    # 1. Specialization (40 pts)
    spec = intent.get("specialization")
    if spec:
        lawyer_specs = lawyer.get("specialization", [])
        if isinstance(lawyer_specs, str):
            lawyer_specs = [lawyer_specs]
        if any(spec.lower() in s.lower() for s in lawyer_specs):
            score += 40
            reasons.append(f"Specialization: {spec}")
        else:
            # Partial keyword overlap check
            spec_words = set(spec.lower().split())
            for s in lawyer_specs:
                if spec_words & set(s.lower().split()):
                    score += 20
                    reasons.append(f"Related: {s}")
                    break

    # 2. Location (30 pts)
    loc = intent.get("location")
    if loc:
        city = (lawyer.get("city") or "").strip()
        state = (lawyer.get("state") or "").strip()
        if loc.get("city") and loc["city"].lower() == city.lower():
            score += 30
            reasons.append(f"City: {city}")
        elif loc.get("state") and loc["state"].lower() == state.lower():
            score += 20
            reasons.append(f"State: {state}")

    # 3. Language (10 pts)
    lang = intent.get("language")
    if lang:
        lawyer_langs = lawyer.get("languages") or []
        if any(lang.lower() in lg.lower() for lg in lawyer_langs):
            score += 10
            reasons.append(f"Language: {lang}")

    # 4. Experience (10 pts max, 1 pt per 2 years capped at 20 yrs)
    exp = lawyer.get("experience_years") or lawyer.get("experience") or 0
    try:
        exp = int(exp)
    except (ValueError, TypeError):
        exp = 0
    score += min(exp, 20) // 2
    if exp >= 15:
        reasons.append("Senior Advocate")

    # 5. Budget fit (5 pts)
    budget = intent.get("budget")
    if budget is not None:
        fee = lawyer.get("consultation_fee") or 0
        try:
            fee = int(fee)
        except (ValueError, TypeError):
            fee = 0
        if budget == 0 or fee <= budget:
            score += 5
            reasons.append("Within Budget")

    # 6. Consult mode (3 pts)
    consult = intent.get("consult_type")
    if consult:
        pref = lawyer.get("consultation_preferences") or "both"
        if pref == consult or pref == "both":
            score += 3
            reasons.append("Consult Mode Match")

    # 7. Verification (2 pts)
    is_approved = lawyer.get("is_approved") or lawyer.get("status") == "approved"
    if is_approved:
        score += 2
        if "Verified" not in reasons:
            reasons.append("Verified")

    # 8. Seeded jitter ±3 pts (no bias, just rotation)
    score += seeded_jitter(str(lawyer.get("_id", "")), session_id, 3)

    return max(0, min(score, 100)), reasons


def passes_hard_filters(lawyer: dict, intent: dict) -> bool:
    """Hard filter — must pass ALL specified constraints."""
    # Minimum experience
    min_exp = intent.get("min_experience")
    if min_exp is not None:
        exp = lawyer.get("experience_years") or lawyer.get("experience") or 0
        try:
            if int(exp) < min_exp:
                return False
        except (ValueError, TypeError):
            return False

    # Budget hard cap
    budget = intent.get("budget")
    if budget is not None and budget > 0:
        fee = lawyer.get("consultation_fee") or 0
        try:
            if int(fee) > budget:
                return False
        except (ValueError, TypeError):
            pass  # If fee unknown, include anyway

    return True


# ── FIRM SCORING ──────────────────────────────────────────────────────────────

def score_firm(firm: dict, intent: dict, session_id: str) -> tuple[int, list]:
    score = 0
    reasons = []

    # 1. Practice area match (40 pts)
    spec = intent.get("specialization")
    if spec:
        areas = firm.get("practice_areas") or []
        if isinstance(areas, str):
            areas = [areas]
        spec_words = set(spec.lower().split())
        for area in areas:
            if spec.lower() in area.lower() or spec_words & set(area.lower().split()):
                score += 40
                reasons.append(f"Practice Area: {area}")
                break
            # Partial
            if len(spec_words & set(area.lower().split())) >= 1:
                score += 20
                reasons.append(f"Related: {area}")
                break

    # 2. Location (30 pts)
    loc = intent.get("location")
    if loc:
        city = (firm.get("city") or "").strip()
        state = (firm.get("state") or "").strip()
        if loc.get("city") and loc["city"].lower() == city.lower():
            score += 30
            reasons.append(f"City: {city}")
        elif loc.get("state") and loc["state"].lower() == state.lower():
            score += 20
            reasons.append(f"State: {state}")

    # 3. Firm size — team size mentioned
    q_lower = ""  # no direct query in firm scorer, use intent heuristics
    lawyers_count = firm.get("total_lawyers") or 0
    try:
        lawyers_count = int(lawyers_count)
    except (ValueError, TypeError):
        lawyers_count = 0
    score += min(lawyers_count // 5, 10)   # Up to 10 pts for large teams

    # 4. Budget fit (5 pts)
    budget = intent.get("budget")
    if budget is not None and budget > 0:
        fee_min = firm.get("min_fee") or firm.get("consultation_fee") or 0
        try:
            if int(fee_min) <= budget:
                score += 5
                reasons.append("Within Budget")
        except (ValueError, TypeError):
            pass

    # 5. Verification (2 pts)
    if firm.get("is_approved") or firm.get("status") == "approved":
        score += 2
        reasons.append("Verified")

    # 6. Seeded jitter ±3 pts
    score += seeded_jitter(str(firm.get("_id", "")), session_id, 3)

    return max(0, min(score, 100)), reasons


# ── ENDPOINTS ─────────────────────────────────────────────────────────────────

@router.post("/lawyers", response_model=MatchResponse)
async def smart_match_lawyers(req: MatchQuery):
    """
    AI-powered lawyer matching.
    Fetches fresh data from DB every call — new profiles included automatically.
    """
    intent = extract_intent(req.query)
    logger.info(f"Lawyer match intent: {intent}")

    # Always fetch live from DB — auto-includes new approved profiles
    query_filter = {
        "user_type": "lawyer",
        "$or": [{"is_approved": True}, {"status": "approved"}]
    }
    lawyers = await db.users.find(query_filter, {"password": 0}).to_list(2000)

    # Score and filter
    scored = []
    for lawyer in lawyers:
        if not passes_hard_filters(lawyer, intent):
            continue
        s, reasons = score_lawyer(lawyer, intent, req.session_id or "")

        # Only include if there's at least some relevance signal
        # (score > 0 when no intent extracted = show everyone; score > threshold when intent exists)
        has_intent = any([
            intent.get("specialization"), intent.get("location"),
            intent.get("language"), intent.get("consult_type"),
            intent.get("min_experience"), intent.get("budget") is not None
        ])
        if has_intent and s < 15:
            continue

        # Build clean response
        exp = lawyer.get("experience_years") or lawyer.get("experience") or 0
        specs = lawyer.get("specialization") or []
        if isinstance(specs, str):
            specs = [specs]

        scored.append({
            "id": str(lawyer.get("_id", "")),
            "name": lawyer.get("full_name") or lawyer.get("name") or "",
            "specialization": specs[0] if specs else "",
            "city": lawyer.get("city") or "",
            "state": lawyer.get("state") or "",
            "experience": int(exp) if str(exp).isdigit() else 0,
            "fee": str(lawyer.get("consultation_fee") or lawyer.get("fee_range") or "Contact"),
            "languages": lawyer.get("languages") or ["English"],
            "photo": lawyer.get("photo") or "",
            "verified": bool(lawyer.get("is_approved") or lawyer.get("status") == "approved"),
            "unique_id": lawyer.get("unique_id") or "",
            "bio": lawyer.get("bio") or "",
            "court": lawyer.get("court") or [],
            "education": lawyer.get("education") or "",
            "score": s,
            "match_reasons": reasons,
        })

    # Sort: urgent → by experience desc; normal → by score desc
    if intent.get("urgent"):
        scored.sort(key=lambda x: (-x.get("experience", 0), -x.get("score", 0)))
    else:
        scored.sort(key=lambda x: -x.get("score", 0))

    return MatchResponse(
        results=scored[:20],        # Top 20 results
        total_found=len(scored),
        query_summary=intent
    )


@router.post("/firms", response_model=MatchResponse)
async def smart_match_firms(req: MatchQuery):
    """
    AI-powered law firm matching.
    Fetches fresh data from DB every call — new approved firms included automatically.
    """
    intent = extract_intent(req.query)
    logger.info(f"Firm match intent: {intent}")

    # Always fetch live from DB
    query_filter = {
        "user_type": "law_firm",
        "$or": [{"is_approved": True}, {"status": "approved"}]
    }
    firms = await db.users.find(query_filter, {"password": 0}).to_list(500)

    scored = []
    for firm in firms:
        s, reasons = score_firm(firm, intent, req.session_id or "")

        has_intent = any([
            intent.get("specialization"), intent.get("location"),
            intent.get("budget") is not None
        ])
        if has_intent and s < 15:
            continue

        fee_min = firm.get("min_fee") or firm.get("consultation_fee") or 0
        try:
            fee_min = int(fee_min)
        except (ValueError, TypeError):
            fee_min = 0

        scored.append({
            "id": str(firm.get("_id", "")),
            "name": firm.get("firm_name") or firm.get("name") or "",
            "city": firm.get("city") or "",
            "state": firm.get("state") or "",
            "practice_areas": firm.get("practice_areas") or [],
            "lawyers_count": int(firm.get("total_lawyers") or 0),
            "fee_min": fee_min,
            "description": firm.get("description") or "",
            "image": "",
            "unique_id": firm.get("unique_id") or "",
            "score": s,
            "match_reasons": reasons,
        })

    scored.sort(key=lambda x: -x.get("score", 0))

    return MatchResponse(
        results=scored[:15],
        total_found=len(scored),
        query_summary=intent
    )
