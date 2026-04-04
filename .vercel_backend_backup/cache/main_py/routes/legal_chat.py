"""
Legal Chat API — Card-Based Response System
Each legal query returns a short intro + an array of domain-specific cards.
Each card has: id, icon, title, summary (2 lines shown in chat),
               detail (full content shown in modal when card is tapped).
"""

import random
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Any

router = APIRouter(prefix="/chat", tags=["Legal Chat"])


# ── MODELS ────────────────────────────────────────────────────────────────────

class LegalChatRequest(BaseModel):
    query: str
    history: Optional[List[dict]] = []


class LegalCard(BaseModel):
    id: str
    icon: str
    title: str
    summary: str        # 1-2 line preview shown on card chip
    detail: str         # Full markdown shown in expanded modal


class LegalChatResponse(BaseModel):
    intro: str          # 1-line intro sentence shown above cards
    intent: str
    sentiment: str
    sources: List[str] = []
    cards: List[Any] = []
    is_greeting: bool = False
    greeting_text: str = ""


# ── CASUAL RESPONSE POOLS ─────────────────────────────────────────────────────

GREETING_RESPONSES = [
    "Hello! 👋 I'm your AI Legal Assistant specialising in Indian law. How can I help you today?",
    "Hey there! 😊 I'm here to help with any legal questions about Indian law. What's on your mind?",
    "Hi! 🙏 Welcome! Ask me about IPC, BNS, Constitution, property, divorce — anything Indian law.",
    "Namaste! 🙏 I'm your legal AI assistant. Feel free to ask about any legal matter.",
    "Hello! 😊 Ready to help with any legal queries — from FIR procedures to property disputes.",
]
FAREWELL_RESPONSES = [
    "Goodbye! 👋 Don't hesitate to come back if you have more legal questions!",
    "See you later! 😊 I'm always here if you need legal guidance.",
    "Bye! 🙏 Stay safe and feel free to reach out anytime.",
]
HOW_ARE_YOU_RESPONSES = [
    "I'm doing great, thanks! 😊 Ready to help with legal questions. What can I do for you?",
    "All good on my end! 😊 Now tell me — what legal query do you have?",
]
THANKS_RESPONSES = [
    "You're most welcome! 😊 Let me know if you have any more questions!",
    "Glad I could assist! 🙏 Don't hesitate to ask if anything else comes up.",
]
ABOUT_ME_RESPONSES = [
    "I'm an AI Legal Assistant 🤖⚖️ specialising in Indian law!\n\nI cover:\n- 👮 Criminal Law (IPC, BNS, CrPC)\n- 🏠 Family & Civil Law (Property, Divorce, Custody)\n- 💼 Corporate Law (Companies Act, GST, Contracts)\n\nJust ask me a question!",
]

FAREWELL_KW = {'bye', 'goodbye', 'see you', 'see ya', 'take care', 'good bye', 'alvida'}
HOW_ARE_YOU_KW = {'how are you', "how's it going", 'how are you doing', 'kaise ho', 'kya haal'}
THANKS_KW = {'thanks', 'thank you', 'thank you so much', 'appreciate', 'dhanyavaad', 'shukriya'}
ABOUT_ME_KW = {'who are you', 'what are you', 'what can you do', 'tell me about yourself', 'what is your name', 'are you a bot', 'are you ai'}

SERIOUS_ROOTS = {
    'crash', 'accident', 'kill', 'murder', 'rape', 'assault', 'stole', 'robb', 'thief', 'theft',
    'kidnap', 'police', 'jail', 'prison', 'arrest', 'custody', 'divorce', 'dowry', 'threat',
    'harass', 'fraud', 'scam', 'cheat', 'property', 'death', 'dead', 'died', 'injur',
    'crime', 'criminal', 'victim', 'complaint', 'bail', 'lawyer', 'legal', 'fir', 'damages', 'compensation'
}
SERIOUS_EXACT = {'hit', 'sue', 'law', 'case', 'ban', 'fine', 'tax', 'will', 'hurt', 'lost', 'beat'}
SERIOUS_PHRASES = ['hit and run', 'drunk driving', 'domestic violence', 'dowry harassment']

CRIMINAL_KW = ['murder', 'theft', 'assault', 'fir', 'bail', 'arrest', 'jail', 'crime', 'police',
               'warrant', 'ipc', 'penal', 'robbery', 'kidnap', 'fraud', 'cheat', 'forgery', 'killing', 'bns']
FAMILY_KW = ['divorce', 'marriage', 'custody', 'alimony', 'property', 'will', 'ancestral', 'tenant',
             'landlord', 'rent', 'inheritance', 'child', 'adoption', 'dowry', 'domestic', 'maintenance']
CORPORATE_KW = ['company', 'gst', 'tax', 'incorporation', 'startup', 'contract', 'agreement', 'salary',
                'employment', 'cheque', 'corporate', 'share', 'director', 'compliance', 'trademark', 'patent']
URGENT_KW = ['urgent', 'emergency', 'help', 'danger', 'threat', 'attack', 'killed', 'beaten', 'harass', 'abuse', 'immediately']

INTENT_LABELS = {0: "Criminal Law 👮", 1: "Family/Civil 🏠", 2: "Corporate 💼", 3: "Greeting/Casual 💬"}
SENTIMENT_LABELS = {0: "Neutral 😐", 1: "URGENT 🚨", 2: "Positive 🟢"}


def handle_casual(query: str) -> str:
    q = query.lower().strip()
    for kw in FAREWELL_KW:
        if kw in q: return random.choice(FAREWELL_RESPONSES)
    for kw in HOW_ARE_YOU_KW:
        if kw in q: return random.choice(HOW_ARE_YOU_RESPONSES)
    for kw in THANKS_KW:
        if kw in q: return random.choice(THANKS_RESPONSES)
    for kw in ABOUT_ME_KW:
        if kw in q: return random.choice(ABOUT_ME_RESPONSES)
    return random.choice(GREETING_RESPONSES)


def classify_intent(query: str) -> int:
    q = query.lower()
    tokens = set(q.split())
    is_casual = not any(r in q for r in SERIOUS_ROOTS) \
                and not any(w in tokens for w in SERIOUS_EXACT) \
                and not any(p in q for p in SERIOUS_PHRASES)
    if is_casual:
        return 3
    c = sum(1 for k in CRIMINAL_KW if k in q)
    f = sum(1 for k in FAMILY_KW if k in q)
    b = sum(1 for k in CORPORATE_KW if k in q)
    if c >= f and c >= b: return 0
    if f >= c and f >= b: return 1
    return 2


def classify_sentiment(query: str) -> int:
    q = query.lower()
    u = sum(1 for k in URGENT_KW if k in q)
    p = sum(1 for k in ['thank', 'great', 'good', 'appreciate', 'helpful'] if k in q)
    if u > p: return 1
    if p > 0 and u == 0: return 2
    return 0


# ── DOMAIN-SPECIFIC CARD TEMPLATES ───────────────────────────────────────────

def get_cards_for_intent(intent_idx: int, query: str, ai_text: str) -> list:
    """Return 4 structured cards based on legal domain."""

    q_display = query[:60] + ("…" if len(query) > 60 else "")

    if intent_idx == 0:  # Criminal Law
        return [
            {
                "id": "overview", "icon": "📋", "title": "Case Overview",
                "summary": f"Summary of your query: {q_display}",
                "detail": ai_text or (
                    "**Criminal Law Overview**\n\n"
                    "Criminal offences in India are governed by the **Bharatiya Nyaya Sanhita (BNS) 2023** "
                    "(which replaced the Indian Penal Code 1860) and procedural matters by the "
                    "**Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023** (replacing CrPC).\n\n"
                    "Key principles:\n"
                    "- Every accused is **innocent until proven guilty**.\n"
                    "- The state must prove guilt **beyond reasonable doubt**.\n"
                    "- Article 21 guarantees the right to a fair trial."
                )
            },
            {
                "id": "charges", "icon": "⚖️", "title": "Applicable Laws & Charges",
                "summary": "Relevant IPC/BNS sections, Acts & legal provisions",
                "detail": (
                    "**Applicable Laws — Criminal Domain**\n\n"
                    "**Primary Statutes:**\n"
                    "- Bharatiya Nyaya Sanhita (BNS) 2023 — replaced IPC 1860\n"
                    "- Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 — replaced CrPC\n"
                    "- Indian Evidence Act 1872 / Bharatiya Sakshya Adhiniyam 2023\n\n"
                    "**Key Sections (common):**\n"
                    "- Murder: BNS §101 (formerly IPC §302) — life/death penalty\n"
                    "- Culpable Homicide: BNS §100 (formerly IPC §304)\n"
                    "- Theft: BNS §303 (formerly IPC §378)\n"
                    "- Fraud/Cheating: BNS §318 (formerly IPC §420)\n"
                    "- Assault: BNS §131 (formerly IPC §351)\n\n"
                    "⚠️ Exact section depends on specific facts of the case. Consult a lawyer."
                )
            },
            {
                "id": "bail", "icon": "🔓", "title": "Bail & Arrest Rights",
                "summary": "Eligibility, bail types, your rights during arrest",
                "detail": (
                    "**Bail & Arrest Rights**\n\n"
                    "**Types of Bail:**\n"
                    "- **Regular Bail (§ 480 BNSS):** After arrest, filed in Sessions/HC Court\n"
                    "- **Anticipatory Bail (§ 484 BNSS):** Before arrest — apply to Sessions Court or HC\n"
                    "- **Interim Bail:** Temporary, granted pending full hearing\n\n"
                    "**Bailable vs. Non-Bailable:**\n"
                    "- Bailable offences: Police must grant bail — you have a right to it\n"
                    "- Non-bailable offences: Only court can grant bail (not police)\n\n"
                    "**Your Rights on Arrest:**\n"
                    "- Right to know grounds of arrest (Article 22)\n"
                    "- Right to be produced before magistrate within 24 hours\n"
                    "- Right to legal representation at all stages\n"
                    "- Right to remain silent (cannot be forced to self-incriminate)"
                )
            },
            {
                "id": "nextsteps", "icon": "🔍", "title": "Immediate Next Steps",
                "summary": "What to do right now — actions, do's & don'ts",
                "detail": (
                    "**Immediate Actions to Take**\n\n"
                    "✅ **Do this NOW:**\n"
                    "- Preserve all evidence: messages, photos, recordings, documents\n"
                    "- File an FIR at the nearest police station (free of charge)\n"
                    "- If denied FIR, approach the Superintendent of Police or file a complaint to the Magistrate\n"
                    "- Contact a criminal defence lawyer immediately\n"
                    "- Note names, badge numbers of any officers involved\n\n"
                    "❌ **Do NOT:**\n"
                    "- Give any written statement without a lawyer present\n"
                    "- Destroy or tamper with any evidence\n"
                    "- Pay any 'settlement' to police without legal advice\n\n"
                    "📞 **Emergency Numbers:**\n"
                    "- Police: **100**\n"
                    "- Women Helpline: **1091**\n"
                    "- Legal Aid: **15100** (NALSA)"
                )
            },
        ]

    elif intent_idx == 1:  # Family / Civil
        return [
            {
                "id": "overview", "icon": "📋", "title": "Case Overview",
                "summary": f"Family/Civil law analysis for: {q_display}",
                "detail": ai_text or (
                    "**Family & Civil Law Overview**\n\n"
                    "Family law in India is governed by **personal laws** (based on religion) and **secular statutes**.\n\n"
                    "- Hindus: Hindu Marriage Act 1955, Hindu Succession Act 1956\n"
                    "- Muslims: Muslim Personal Law (Shariat) Application Act 1937\n"
                    "- Christians: Indian Divorce Act 1869\n"
                    "- All religions: Special Marriage Act 1954 (secular option)\n\n"
                    "Courts encourage **mediation and reconciliation** before granting divorce or resolving disputes."
                )
            },
            {
                "id": "charges", "icon": "⚖️", "title": "Applicable Laws & Provisions",
                "summary": "Relevant personal laws, sections & legal rights",
                "detail": (
                    "**Applicable Laws — Family/Civil Domain**\n\n"
                    "**Divorce & Separation:**\n"
                    "- Hindu Marriage Act §13: Grounds for divorce (cruelty, desertion, adultery, etc.)\n"
                    "- §13B: Mutual consent divorce (minimum 6 month wait, waivable by court)\n"
                    "- Special Marriage Act §27: Secular divorce\n\n"
                    "**Maintenance:**\n"
                    "- CrPC §125 / BNSS §144: Maintenance for wife, children, and parents\n"
                    "- Hindu Adoption & Maintenance Act for Hindu women\n\n"
                    "**Property & Inheritance:**\n"
                    "- Hindu Succession Act 1956: Equal rights for daughters (amended 2005)\n"
                    "- Transfer of Property Act 1882: Governs buying/selling/gifting property\n\n"
                    "**Child Custody:**\n"
                    "- Guardians & Wards Act 1890: Court decides based on child's best interests"
                )
            },
            {
                "id": "bail", "icon": "📄", "title": "Documentation Needed",
                "summary": "Key documents to gather for your case",
                "detail": (
                    "**Documents to Prepare**\n\n"
                    "**For Divorce:**\n"
                    "- Marriage certificate (registered)\n"
                    "- Proof of marriage (photos, invitation cards)\n"
                    "- Evidence of cruelty/desertion if applicable (messages, medical records)\n"
                    "- List of assets and liabilities\n\n"
                    "**For Property Disputes:**\n"
                    "- Sale deed / title deed\n"
                    "- Property tax receipts\n"
                    "- Encumbrance certificate\n"
                    "- Mutation records from revenue dept\n\n"
                    "**For Maintenance:**\n"
                    "- Proof of income of both parties\n"
                    "- Bank statements (6 months)\n"
                    "- Children's school fee receipts and expenses\n\n"
                    "**General:**\n"
                    "- Aadhaar card, PAN card, passport photos"
                )
            },
            {
                "id": "nextsteps", "icon": "🔍", "title": "Immediate Next Steps",
                "summary": "Recommended actions — mediation, court procedure & timeline",
                "detail": (
                    "**Next Steps — Family/Civil Matters**\n\n"
                    "1. **Consult a Family Lawyer** — get a professional assessment of your specific situation.\n\n"
                    "2. **Try Mediation First:**\n"
                    "   - Family courts have mandatory mediation for matrimonial disputes\n"
                    "   - Faster, cheaper, and less traumatic than litigation\n"
                    "   - Lok Adalats can resolve cases in a single sitting\n\n"
                    "3. **File a Petition:**\n"
                    "   - File in Family Court of the jurisdiction where you reside or marriage took place\n"
                    "   - Mutual consent divorce: typically resolved in 6–18 months\n"
                    "   - Contested divorce: can take 3–7 years\n\n"
                    "4. **Interim Relief:**\n"
                    "   - Apply for interim maintenance immediately if needed\n"
                    "   - Apply for custody/visitation rights pending final order\n\n"
                    "📞 **Helplines:** Women's Helpline **181** | Childline **1098**"
                )
            },
        ]

    else:  # Corporate / Tax
        return [
            {
                "id": "overview", "icon": "📋", "title": "Case Overview",
                "summary": f"Corporate/Tax law analysis for: {q_display}",
                "detail": ai_text or (
                    "**Corporate & Business Law Overview**\n\n"
                    "Business law in India is governed by multiple statutes depending on the entity type and issue:\n\n"
                    "- **Companies:** Companies Act 2013, administered by MCA\n"
                    "- **Contracts:** Indian Contract Act 1872\n"
                    "- **Taxation:** Income Tax Act 1961, GST Acts 2017\n"
                    "- **Employment:** Industrial Disputes Act, Shops & Establishments Acts\n"
                    "- **IP:** Patents Act 1970, Trade Marks Act 1999, Copyright Act 1957\n\n"
                    "Compliance is mandatory — non-compliance leads to significant penalties and disqualification of directors."
                )
            },
            {
                "id": "charges", "icon": "⚖️", "title": "Applicable Laws & Regulations",
                "summary": "Relevant Acts, sections, regulatory requirements",
                "detail": (
                    "**Applicable Laws — Corporate Domain**\n\n"
                    "**Company Formation:**\n"
                    "- Companies Act 2013 §7: Incorporation via MCA SPICe+ form\n"
                    "- Minimum 2 directors for Private Ltd, 3 for Public Ltd\n"
                    "- DIN (Director Identification Number) required for all directors\n\n"
                    "**GST:**\n"
                    "- Mandatory registration if turnover > ₹20L (₹10L in special states)\n"
                    "- CGST + SGST for intra-state; IGST for inter-state\n"
                    "- Monthly/Quarterly filing of returns compulsory\n\n"
                    "**Contracts:**\n"
                    "- Indian Contract Act §10: Valid contract requires offer, acceptance, consideration, capacity\n"
                    "- Stamp duty mandatory on agreements (varies by state)\n\n"
                    "**Employment:**\n"
                    "- PF mandatory for firms with 20+ employees (EPF Act)\n"
                    "- ESIC mandatory for firms with 10+ employees"
                )
            },
            {
                "id": "bail", "icon": "📋", "title": "Compliance Checklist",
                "summary": "Key filings, deadlines, and regulatory requirements",
                "detail": (
                    "**Corporate Compliance Checklist**\n\n"
                    "**Annual Filings (MCA Portal):**\n"
                    "- AOC-4: Financial statements — due within 60 days of AGM\n"
                    "- MGT-7: Annual return — due within 60 days of AGM\n"
                    "- DIR-3 KYC: Director KYC — due by 30 September each year\n\n"
                    "**Tax Compliance:**\n"
                    "- Income Tax Return: due 31 July (non-audit) / 31 October (audit)\n"
                    "- GST Returns: GSTR-1 monthly/quarterly, GSTR-3B monthly\n"
                    "- TDS: Deposit by 7th of next month, file quarterly returns\n\n"
                    "**Other:**\n"
                    "- Renew Shop & Establishment license annually\n"
                    "- Maintain statutory registers (members, directors, charges)\n"
                    "- Board Meeting: hold at least 4 per year (within 120-day gap)\n\n"
                    "⚠️ Non-compliance penalties range from ₹10,000/day to company strike-off."
                )
            },
            {
                "id": "nextsteps", "icon": "🔍", "title": "Immediate Next Steps",
                "summary": "Action plan — registrations, advisors & resources",
                "detail": (
                    "**Next Steps — Corporate/Business Matters**\n\n"
                    "1. **Consult a Professional:**\n"
                    "   - CA (Chartered Accountant) for tax and financial compliance\n"
                    "   - CS (Company Secretary) for MCA filings and corporate governance\n"
                    "   - Corporate Lawyer for contracts, disputes, and IP\n\n"
                    "2. **Key Government Portals:**\n"
                    "   - MCA: mca.gov.in (company registration, filings)\n"
                    "   - GST: gst.gov.in (registration, returns)\n"
                    "   - IT: incometax.gov.in (PAN, Returns)\n"
                    "   - IP India: ipindia.gov.in (trademark, patent filing)\n\n"
                    "3. **Startup Benefits:**\n"
                    "   - Register under DPIIT for Startup India recognition\n"
                    "   - Eligible for 3-year tax holiday (Sec 80-IAC)\n"
                    "   - Exemption from angel tax if DPIIT registered\n\n"
                    "4. **Dispute Resolution:**\n"
                    "   - NCLT for company law matters and insolvency\n"
                    "   - Commercial Courts for disputes above ₹3 lakh"
                )
            },
        ]


# ── ENDPOINT ──────────────────────────────────────────────────────────────────

@router.post("/legal")
async def legal_chat(req: LegalChatRequest):
    query = req.query.strip()
    if not query:
        return LegalChatResponse(
            intro="Please enter a question.",
            intent="Greeting/Casual 💬", sentiment="Neutral 😐",
            is_greeting=True, greeting_text="Please ask a legal question."
        )

    # Intent
    intent_idx = classify_intent(query)

    # Casual / greeting → simple text response, no cards
    if intent_idx == 3:
        return LegalChatResponse(
            intro="", intent="Greeting/Casual 💬", sentiment="Neutral 😐",
            is_greeting=True, greeting_text=handle_casual(query)
        )

    intent_label = INTENT_LABELS[intent_idx]
    sentiment_idx = classify_sentiment(query)
    sentiment_label = SENTIMENT_LABELS[sentiment_idx]

    # Build cards using hardcoded templates (no external AI)
    cards = get_cards_for_intent(intent_idx, query, None)

    # Sources
    sources_map = {
        0: ["BNS 2023", "IPC 1860", "CrPC / BNSS"],
        1: ["Hindu Marriage Act 1955", "Special Marriage Act 1954", "CrPC §125"],
        2: ["Companies Act 2013", "GST Act 2017", "Indian Contract Act 1872"],
    }
    sources = sources_map.get(intent_idx, [])

    # Short intro sentence
    intros = {
        0: f"Here's a legal breakdown for your criminal law query:",
        1: f"Here's what Indian family law says about your situation:",
        2: f"Here's the corporate/commercial law analysis:",
    }
    intro = intros.get(intent_idx, "Here's what I found:")
    if "URGENT" in sentiment_label:
        intro = "🚨 This looks urgent — here's what you need to know immediately:"

    return LegalChatResponse(
        intro=intro,
        intent=intent_label,
        sentiment=sentiment_label,
        sources=sources,
        cards=cards,
        is_greeting=False,
        greeting_text=""
    )
