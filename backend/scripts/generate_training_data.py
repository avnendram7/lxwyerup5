"""
Lxwyer AI v0.1 — Training Data Generator
Generates a comprehensive knowledge base with:
- 500 general human conversation Q&As
- 200 core Indian legal Q&As (from previous run)
- 150 State-specific law Q&As
- 100 RTI procedure Q&As
- 100 GST & Startup legal Q&As
- 150 NRI legal issues Q&As
- 150 Women's safety & POSH Q&As
- 100 Landmark Supreme Court case Q&As
- 100 Police & false accusation Q&As
Total target: ~1550 unique training instances
"""

import json
import os
import random

# ── GREETING POOL ──────────────────────────────────────────────────────────────
GREETING_VARIANTS = [
    "hi", "hello", "hey", "hii", "helo", "Hi", "Hello", "Hey",
    "good morning", "good afternoon", "good evening", "namaste",
    "howdy", "greetings", "yo", "sup", "what's up", "wassup",
    "hi there", "hello there", "hey there", "hiya",
]
GREETING_INTRO_TEMPLATES = [
    "{}", "{} friend", "{} lxwyer", "{} ai", "{}", "{}, what can you do?",
    "{} how are you", "{} need help", "{}!", "{}?",
]
GREETING_RESPONSE = {
    "intro": "",
    "intent": "Greeting/Casual 💬",
    "sentiment": "Neutral 😐",
    "sources": [],
    "cards": [],
    "is_greeting": True,
    "greeting_text": "Hello! 👋 I'm **Lxwyer AI v0.1** — your Indian legal intelligence engine.\n\n• Tell me your legal issue in plain language\n• I'll auto-detect the area of law\n• Then ask for your city and preferences to find lawyers\n\n**What is your legal problem today?**",
    "needs_location": False,
    "detected_spec": ""
}

# ── CASUAL POOL ────────────────────────────────────────────────────────────────
CASUAL_QA = [
    ("thanks", "You're welcome! 😊 Ask me anything else."),
    ("thank you", "Happy to help! 🙏 Any more questions?"),
    ("thx", "Anytime! Describe another issue if you have one."),
    ("bye", "Goodbye! 👋 Come back anytime you need legal help."),
    ("goodbye", "See you! 😊 Return whenever you need assistance."),
    ("ok", "Got it! Tell me your legal issue and city — e.g. 'Property dispute in Delhi'"),
    ("okay", "Sure! Describe your case and I'll find the right lawyer."),
    ("sure", "Great! What's your legal issue?"),
    ("how are you", "I'm functioning at full capacity! ⚖️ What legal matter can I help with?"),
    ("what is your name", "I'm Lxwyer AI v0.1 — your Indian legal intelligence assistant."),
    ("are you a bot", "Yes! I'm Lxwyer AI v0.1 — trained on Indian laws and real legal cases."),
    ("are you human", "I'm an AI legal assistant trained on Indian law. Always verify with a real advocate!"),
    ("lol", "😄 Now — what legal issue can I help you with?"),
    ("haha", "😄 Ready to help whenever you are!"),
    ("interesting", "Indeed! What legal matter can I assist with?"),
    ("wow", "Ready to help! What's your legal question?"),
    ("nice", "Thanks! Any legal questions I can help with?"),
    ("good", "Great! What legal matter shall we tackle?"),
    ("help", "Of course! Tell me your legal issue and city — I'll find verified lawyers near you."),
    ("i need help", "I'm here! Describe your legal problem and tell me your city."),
]

def make_casual_response(text):
    return {
        "intro": "",
        "intent": "Greeting/Casual 💬",
        "sentiment": "Neutral 😐",
        "sources": [],
        "cards": [],
        "is_greeting": True,
        "greeting_text": text,
        "needs_location": False,
        "detected_spec": ""
    }

# ── CARD BUILDER HELPER ────────────────────────────────────────────────────────
def make_card(id, icon, title, summary_bullets, detail):
    return {
        "id": id,
        "icon": icon,
        "title": title,
        "summary": "\n".join(f"• {b}" for b in summary_bullets),
        "detail": detail
    }

def make_legal_response(intro, intent, sentiment, sources, cards, detected_spec="", needs_location=True):
    return {
        "intro": intro,
        "intent": intent,
        "sentiment": sentiment,
        "sources": sources,
        "cards": cards,
        "is_greeting": False,
        "greeting_text": "",
        "needs_location": needs_location,
        "detected_spec": detected_spec
    }

# ── CORE INDIAN LEGAL Q&As ────────────────────────────────────────────────────
CORE_LEGAL_QA = [
    # ── CRIMINAL ──
    {
        "queries": ["what is fir", "how to file fir", "fir process", "first information report", "file police complaint", "register fir"],
        "response": make_legal_response(
            "I've detected this is a **Criminal Law 👮** matter. Here's a legal breakdown:",
            "Criminal Law 👮", "Neutral 😐",
            ["BNS 2023", "BNSS 2023"],
            [
                make_card("overview", "📋", "FIR — What It Is",
                    ["Free to file at any police station", "Police cannot refuse cognizable offence FIR", "You receive a signed copy immediately"],
                    "**FIR (First Information Report) — Key Facts:**\n\n• Free of cost at any police station\n• Police **cannot** refuse to register for cognizable offences\n• You get a signed copy after registration\n• Online FIR available in Delhi, UP, Maharashtra\n• Zero FIR — file at any station, transferred later\n\n**What happens after FIR:**\n• Police investigate within 60 days\n• Chargesheet filed if evidence found\n• Court takes cognizance and trial begins"),
                make_card("steps", "📝", "How to File an FIR",
                    ["Go to nearest police station", "Give written / oral complaint", "Insist on registration if refused"],
                    "**Step-by-Step FIR Process:**\n\n1. **Visit** nearest police station (or station with jurisdiction)\n2. **Submit** written complaint (or state orally — they must write it)\n3. **Read** the FIR written by police before signing\n4. **Collect** your free signed copy immediately\n5. If **refused** — write to SP/DCP or file Magistrate complaint\n6. **Alternative** — file online on state police portal or cybercrime.gov.in\n\n*Tell me your city and I'll find criminal lawyers near you!*"),
            ],
            "criminal"
        )
    },
    {
        "queries": ["how to get bail", "bail process", "anticipatory bail", "regular bail", "bail application", "bail hearing"],
        "response": make_legal_response(
            "I've detected this is a **Criminal Law 👮** matter. Here's how bail works:",
            "Criminal Law 👮", "Neutral 😐",
            ["BNSS 2023", "IPC 1860"],
            [
                make_card("bail-types", "🔓", "Types of Bail",
                    ["Anticipatory bail — before arrest (Sec 438)", "Regular bail — after arrest (Sec 437)", "Interim bail — short-term emergency relief"],
                    "**Bail Types in India:**\n\n• **Anticipatory Bail (§ 438 BNSS)** — Apply before arrest if threat of arrest exists\n• **Regular Bail (§ 436/437 BNSS)** — After arrest; bailable offences = right to bail\n• **Interim Bail** — Temporary; usually granted while hearing anticipatory bail\n• **Default Bail** — Automatic if police don't file chargesheet in 60/90 days\n\n**Bailable vs Non-Bailable:**\n• Bailable — police must grant bail on request + surety\n• Non-bailable — only court can grant bail"),
                make_card("steps", "📋", "Bail Application Process",
                    ["File bail application in Sessions Court", "State grounds — medical, no flight risk", "Surety / bail bond required"],
                    "**How to Apply for Bail:**\n\n1. **Hire a criminal advocate** immediately\n2. **File bail application** before Magistrate / Sessions Court\n3. State grounds — no prior record, medical condition, roots in community\n4. **Anticipatory bail** — file in Sessions Court or High Court\n5. **Surety** — someone guarantees accused will appear\n6. Court hears prosecution's objection + decides\n7. If rejected — appeal to Higher Court within 30 days\n\n*Tell me your city to find experienced bail advocates!*"),
            ],
            "criminal"
        )
    },
    {
        "queries": ["murder ipc", "section 302", "murder case india", "what is murder law", "homicide india"],
        "response": make_legal_response(
            "I've detected this is a **Criminal Law 👮** matter — specifically involving homicide/murder.",
            "Criminal Law 👮", "URGENT 🚨",
            ["BNS 2023", "IPC 1860"],
            [
                make_card("overview", "📋", "Murder Under Indian Law",
                    ["BNS § 101 / IPC § 302 — murder", "Punishment: death penalty or life imprisonment", "Non-bailable, cognizable, non-compoundable"],
                    "**Murder — Indian Law:**\n\n• **IPC § 302 / BNS § 101** — Punishment for murder\n• Penalty: Death penalty OR life imprisonment + fine\n• **Culpable Homicide not amounting to murder** — IPC § 304 (lesser intent)\n• **Rarest of rare** doctrine — death penalty only in extreme cases\n• Cognizable + Non-bailable — police can arrest without warrant\n\n**Key distinctions:**\n• Murder requires **intention to kill** + act causing death\n• Culpable homicide — lesser intention or knowledge\n• Exception: grave provocation, self-defence can reduce charges"),
                make_card("next-steps", "🔍", "Immediate Steps",
                    ["Hire a senior criminal advocate immediately", "Preserve all evidence", "Apply for bail if falsely accused"],
                    "**If You Are Accused:**\n\n1. **Do not speak** to police without a lawyer\n2. **Hire a senior criminal advocate** immediately\n3. Apply for **bail** — unlikely for murder but possible in exceptional cases\n4. **Preserve alibi evidence** — CCTV, witnesses, phone records\n5. Legal aid available free if you cannot afford a lawyer (Sec 304 CrPC)\n\n**If You Are a Victim's Family:**\n1. Ensure FIR is registered under § 302\n2. Get a copy of the FIR immediately\n3. Track case on eCourts app\n\n*Tell me your city to find top criminal lawyers!*"),
            ],
            "criminal"
        )
    },

    # ── FAMILY ──
    {
        "queries": ["how to get divorce", "divorce process india", "mutual divorce", "contested divorce", "separation", "divorce petition"],
        "response": make_legal_response(
            "I've detected this is a **Family/Matrimonial Law 👨‍👩‍👧** matter. Here's a complete divorce guide:",
            "Family/Matrimonial Law 👨‍👩‍👧", "Neutral 😐",
            ["Hindu Marriage Act 1955", "Special Marriage Act 1954"],
            [
                make_card("divorce-types", "📋", "Types of Divorce",
                    ["Mutual Consent — 6 to 18 months", "Contested — 2 to 5 years", "Grounds: cruelty, adultery, desertion, mental disorder"],
                    "**Divorce in India:**\n\n**Mutual Consent (§ 13B HMA / § 28 SMA):**\n• Both spouses agree to divorce\n• 6-month cooling period (SC can waive it)\n• Fastest route — 6 months to 1.5 years\n• Joint petition filed in Family Court\n\n**Contested:**\n• One spouse files against the other\n• Valid grounds: cruelty, adultery, desertion (2+ yrs), mental disorder, leprosy, conversion\n• Takes 2–5 years typically\n• Court hearings, evidence, arguments required"),
                make_card("maintenance", "💰", "Maintenance & Alimony",
                    ["Interim maintenance applied immediately", "Permanent alimony based on income", "Children's expenses also covered"],
                    "**Maintenance Rights:**\n\n• **Interim Maintenance** — Apply immediately; payable during proceedings (§ 24 HMA)\n• **Permanent Alimony** — § 25 HMA; court considers income, assets, lifestyle\n• **Child Maintenance** — school fees, medical, extracurricular\n• **Sec 125 CrPC** — anyone can claim maintenance (not just Hindus)\n• Non-payment of maintenance = contempt of court\n\n*Tell me your city to find experienced family lawyers!*"),
            ],
            "family"
        )
    },
    {
        "queries": ["domestic violence", "husband hitting wife", "wife beating", "abuse at home", "domestic abuse india", "dv act"],
        "response": make_legal_response(
            "🚨 This sounds urgent. I've detected **Domestic Violence** — here's what to do immediately:",
            "Family/Matrimonial Law 👨‍👩‍👧", "URGENT 🚨",
            ["Domestic Violence Act 2005", "BNS 2023"],
            [
                make_card("dv-law", "🛡️", "Domestic Violence Act 2005",
                    ["Protection order — stops the abuser immediately", "Residence order — cannot be evicted", "Free to file — no court fee"],
                    "**Protection of Women from Domestic Violence Act 2005:**\n\n• Covers: physical, sexual, verbal, emotional, economic abuse\n• **Protection Order** — court orders abuser to stop all contact\n• **Residence Order** — wife cannot be evicted from shared home\n• **Monetary Relief** — medical costs, loss of earnings\n• **Custody Order** — for children's safety\n\n**Who can file:** Wife, girlfriend (live-in), sister, mother — any woman in domestic relationship\n• File before **Protection Officer** (free) or directly in Magistrate court"),
                make_card("steps", "🔍", "What To Do Right Now",
                    ["Call 100 (police) or 181 (women helpline)", "File complaint with Protection Officer", "Apply for Emergency Protection Order"],
                    "**Immediate Action Plan:**\n\n1. **Call 181** — Women Helpline (24/7, free)\n2. **Call 100** — Police emergency\n3. Go to nearest **Protection Officer** (District Women & Child Office)\n4. **File complaint** — free, no advocate needed\n5. **Emergency Protection Order** — issued within 24 hours in urgent cases\n6. **Medical examination** — document injuries immediately\n7. **NCW (National Commission for Women)** — ncwapps.nic.in for online complaint\n\n*Tell me your city and I'll find women's rights lawyers near you!*"),
            ],
            "family"
        )
    },
    {
        "queries": ["child custody", "who gets custody", "custody battle", "visitation rights", "custody after divorce"],
        "response": make_legal_response(
            "I've detected this is a **Family Law** matter regarding child custody.",
            "Family/Matrimonial Law 👨‍👩‍👧", "Neutral 😐",
            ["Guardians and Wards Act 1890", "Hindu Minority and Guardianship Act 1956"],
            [
                make_card("custody", "👶", "Child Custody Rules",
                    ["Best interest of child — always paramount", "Physical vs legal custody are different", "Child preference considered above ~9 years"],
                    "**Custody Framework:**\n\n• Courts apply **best interest of child** — no gender bias\n• **Physical custody** — who child lives with\n• **Legal custody** — who makes education/medical decisions\n• **Joint custody** — increasingly awarded by Indian courts\n• **Visitation rights** — non-custodial parent has right to meet child\n\n**Factors courts consider:**\n• Financial stability of parent\n• Emotional bond with child\n• Stability of home environment\n• Child's medical/educational needs\n• Child's preferences (if mature enough)"),
                make_card("steps", "🔍", "How to Apply",
                    ["File guardianship petition in Family Court", "Interim custody can be applied immediately", "Social worker investigation may be ordered"],
                    "**Custody Process:**\n\n1. File **guardianship petition** in Family Court of child's residence\n2. Apply for **interim custody** immediately\n3. Court may appoint social worker to investigate home\n4. Both parents present arguments\n5. Court visits / counselling may be ordered\n6. Final order passed based on best interests\n\n*Tell me your city to find experienced child custody lawyers!*"),
            ],
            "family"
        )
    },

    # ── PROPERTY ──
    {
        "queries": ["property dispute", "land dispute", "property problem", "ancestral property", "plot dispute"],
        "response": make_legal_response(
            "I've detected this is a **Property Law 🏠** matter. Here's your legal breakdown:",
            "Property Law 🏠", "Neutral 😐",
            ["Transfer of Property Act 1882", "Indian Registration Act 1908"],
            [
                make_card("overview", "🏠", "Property Dispute Overview",
                    ["Civil suit for title declaration", "Injunction to stop encroachment", "Criminal trespass FIR if forcible"],
                    "**Property Dispute — Key Facts:**\n\n• **Civil Remedies** — declaration suit, injunction, partition\n• **Criminal Remedies** — criminal trespass, forgery FIR\n• **Revenue Appeals** — mutation disputes in Tehsil/SDM court\n\n**Common Types:**\n• Title / ownership disputes\n• Boundary / encroachment disputes\n• Ancestral property partition\n• Builder fraud / RERA complaints\n• Tenant eviction disputes"),
                make_card("steps", "🔍", "Immediate Steps",
                    ["Collect title deed, sale deed, mutation records", "Send legal notice to opposite party", "File civil suit in District Court"],
                    "**Action Plan:**\n\n1. **Collect all documents** — title deed, registry, mutation, survey map\n2. **Encumbrance Certificate** from Sub-Registrar (shows loans/claims)\n3. **Send legal notice** through advocate (30-day response period)\n4. **File civil suit** for injunction + declaration in District Court\n5. For **builder fraud** — RERA complaint (online, on state RERA portal)\n\n*Tell me your city to find property law specialists!*"),
            ],
            "property"
        )
    },

    # ── CONSUMER ──
    {
        "queries": ["consumer court", "how to file consumer complaint", "consumer forum india", "product defect complaint", "refund complaint", "e-commerce refund"],
        "response": make_legal_response(
            "I've detected this is a **Consumer Protection** matter. Here's how to fight for your rights:",
            "Consumer Protection Law 🛍️", "Neutral 😐",
            ["Consumer Protection Act 2019"],
            [
                make_card("overview", "🛍️", "Consumer Rights",
                    ["District Commission — up to ₹1 crore", "E-filing on E-Daakhil portal", "No lawyer mandatory below ₹5 lakh"],
                    "**Consumer Protection Act 2019:**\n\n• **District Commission** — claims up to ₹1 crore\n• **State Commission** — ₹1 crore to ₹10 crore\n• **National Commission** — above ₹10 crore\n• E-filing on **edaakhil.nic.in** — convenient and free\n• Resolution target: 90 days\n• You can appear yourself for small claims"),
                make_card("steps", "📋", "Filing Steps",
                    ["Step 1: Send notice to company (30 days)", "Step 2: File on E-Daakhil portal", "Step 3: Attend hearings online if needed"],
                    "**How to File a Complaint:**\n\n1. **Send email/letter** to company's customer care (keep proof)\n2. Wait **30 days** for resolution\n3. **Register** on edaakhil.nic.in\n4. **Fill complaint form** — describe defect/deficiency, attach bills, screenshots\n5. Pay **filing fee** (₹200–5000 based on claim)\n6. Consumer Commission **issues notice** to opposite party\n7. Hearings may be online\n\n*Tell me your city to find consumer lawyers if needed!*"),
            ],
            "consumer"
        )
    },

    # ── CYBER ──
    {
        "queries": ["online fraud", "cyber fraud", "upi fraud", "bank fraud online", "phishing", "cyber crime report"],
        "response": make_legal_response(
            "I've detected this is a **Cyber Law 💻** matter. Act fast — here's what to do:",
            "Cyber Law 💻", "URGENT 🚨",
            ["IT Act 2000", "IT Amendment Act 2008"],
            [
                make_card("report", "💻", "Report Cyber Crime NOW",
                    ["Call 1930 immediately for financial fraud", "File at cybercrime.gov.in", "Do NOT delete any conversation/transaction records"],
                    "**Cyber Crime Reporting — Urgent Steps:**\n\n🚨 **For financial fraud (UPI/bank):**\n• Call **1930** immediately — National Cyber Crime Helpline\n• This can freeze fraudulent transactions if reported fast!\n\n**Online Reporting:**\n• Go to **cybercrime.gov.in**\n• File under 'Financial Fraud' or 'Other Cyber Crime'\n• Get acknowledgment number — follow up weekly\n\n**Local Cyber Cell:**\n• Visit district police cyber cell\n• Bring: transaction records, screenshots, account statements"),
                make_card("steps", "🔍", "Evidence to Preserve",
                    ["Screenshot all conversations with fraudster", "Note exact times / transaction IDs", "Bank statement showing debit"],
                    "**Evidence You Must Preserve:**\n\n1. **Screenshots** of all chats, messages, calls with fraudster\n2. **Transaction IDs** / UTR / Reference numbers\n3. **Bank/UPI statements** showing debit\n4. **Fraudster's phone number** — do not block yet\n5. **Email headers** if phishing email received\n6. **Website URL** if fake website involved\n\n*Tell me your city to find cyber law specialists!*"),
            ],
            "cyber"
        )
    },
]

# ── RTI Q&As ──────────────────────────────────────────────────────────────────
RTI_QA = [
    {
        "queries": ["what is rti", "right to information", "how to file rti", "rti india", "rti application", "rti process"],
        "response": make_legal_response(
            "I've detected an **RTI (Right to Information)** query. Here's the complete guide:",
            "Constitutional Law ⚖️", "Neutral 😐",
            ["RTI Act 2005"],
            [
                make_card("overview", "📋", "RTI — Right to Information Act 2005",
                    ["Any citizen can seek information from government", "PIO must reply within 30 days", "₹10 application fee (free for BPL)"],
                    "**RTI Act 2005 — Key Facts:**\n\n• Any Indian citizen can ask **any government body** for information\n• **PIO (Public Information Officer)** must respond within **30 days**\n• **Life & Liberty matters** — must respond in 48 hours\n• Application fee: ₹10 (free for BPL card holders)\n• All government bodies — central + state — covered\n• Private bodies receiving substantial government funding also covered\n\n**Exemptions (cannot ask for):**\n• Cabinet papers, defence secrets, third-party info affecting privacy"),
                make_card("how-to", "📝", "How to File RTI",
                    ["Write to PIO of concerned department", "Online at rtionline.gov.in for central govt", "First appeal if no reply in 30 days"],
                    "**Filing an RTI Application:**\n\n**Online (Central Govt):**\n1. Go to **rtionline.gov.in**\n2. Register / login\n3. Select ministry / department\n4. Write your query clearly\n5. Pay ₹10 online\n6. Get registration number\n\n**Offline:**\n• Write application to PIO of department\n• Attach ₹10 (postal order / DD)\n• Send by speed post (keep receipt)\n\n**If no reply in 30 days:**\n→ File **First Appeal** to Appellate Authority (free)\n→ No response → **Second Appeal** to Central/State Information Commission\n\n*Tell me your city for RTI advocates near you!*"),
            ],
            "constitutional"
        )
    },
    {
        "queries": ["rti first appeal", "rti not replied", "rti appeal process", "rti second appeal", "information commission"],
        "response": make_legal_response(
            "Here's what to do when an RTI is not replied to:",
            "Constitutional Law ⚖️", "Neutral 😐",
            ["RTI Act 2005"],
            [
                make_card("appeal", "⚖️", "RTI Appeal Process",
                    ["First Appeal — to Appellate Authority (30 days)", "Second Appeal — to Information Commission (90 days)", "Commission can impose penalty on PIO"],
                    "**RTI Appeal Hierarchy:**\n\n**First Appeal:**\n• File if no reply in 30 days OR unsatisfied with reply\n• Address: Appellate Authority of same dept\n• File within 30 days of deadline\n• Decision within 30–45 days\n\n**Second Appeal:**\n• File if first appeal not replied / unsatisfied\n• To: Central Information Commission (CIC) / State IC\n• File within 90 days of first appeal deadline\n• CIC can impose ₹25,000 penalty on errant PIO\n• Hearings usually via video conference\n\n**Online Second Appeal:**\n• cic.gov.in for central matters\n\n*Tell me your city for RTI lawyers near you!*"),
            ],
            "constitutional"
        )
    },
]

# ── GST & STARTUP Q&As ────────────────────────────────────────────────────────
GST_QA = [
    {
        "queries": ["gst registration", "how to register for gst", "gst threshold", "gst india", "goods and services tax"],
        "response": make_legal_response(
            "I've detected a **GST & Business Law** query. Here's the complete guide:",
            "Corporate/Business Law 💼", "Neutral 😐",
            ["GST Act 2017", "CGST Act 2017"],
            [
                make_card("gst-basics", "💼", "GST Registration Basics",
                    ["Mandatory if turnover > ₹20L (₹10L in special states)", "GSTIN issued within 3–7 working days", "E-commerce sellers must register regardless of turnover"],
                    "**GST Registration — Key Facts:**\n\n• **Threshold:** ₹20 lakh turnover (₹10L in special category states)\n• **E-commerce sellers** — must register regardless of turnover\n• **GSTIN** — 15-digit number issued after registration\n• **Composition Scheme** — for small businesses; pay flat 1/2/5% tax\n• Registration on **gst.gov.in** — free, takes 3–7 days\n\n**Documents needed:**\n• PAN card\n• Aadhaar\n• Address proof\n• Bank account details\n• Business registration proof"),
                make_card("returns", "📋", "GST Return Filing",
                    ["GSTR-1: Sales details (monthly/quarterly)", "GSTR-3B: Summary return (monthly)", "Late fee: ₹50/day (₹20 for nil returns)"],
                    "**GST Return Calendar:**\n\n• **GSTR-1** — Sales detail: 11th of next month (monthly) / quarterly for QRMP\n• **GSTR-3B** — Summary + tax payment: 20th of next month\n• **GSTR-9** — Annual return: 31st December\n\n**Late Fee:**\n• ₹50/day for delayed filing\n• ₹20/day for nil returns\n• Maximum late fee capped\n\n**Input Tax Credit (ITC):**\n• Claim credit for GST paid on purchases\n• Must match with supplier's GSTR-1\n\n*Tell me your city for GST consultants/CA near you!*"),
            ],
            "corporate"
        )
    },
    {
        "queries": ["how to register startup", "startup india", "company registration india", "pvt ltd company", "llp registration", "mca21", "incorporate company"],
        "response": make_legal_response(
            "I've detected a **Startup & Company Registration** query. Here's everything you need:",
            "Corporate/Business Law 💼", "Neutral 😐",
            ["Companies Act 2013", "LLP Act 2008"],
            [
                make_card("structures", "🚀", "Business Structure Options",
                    ["Pvt Ltd — best for funding & credibility", "LLP — flexible, less compliance", "Proprietorship — simplest, no liability protection"],
                    "**Choosing Your Business Structure:**\n\n• **Private Limited Company** — best for startups seeking funding\n  - 2+ directors, 2+ shareholders\n  - Limited liability protection\n  - MCA registration via SPICe+ form\n\n• **LLP (Limited Liability Partnership)** — for services firms\n  - 2+ partners, flexible management\n  - Lower compliance than Pvt Ltd\n\n• **Sole Proprietorship** — simplest\n  - No registration mandatory (shop license needed)\n  - No liability protection\n  - Not suitable for external funding"),
                make_card("steps", "📋", "Startup India Registration",
                    ["Register on startupindia.gov.in for DPIIT recognition", "3-year income tax holiday (Sec 80-IAC)", "Angel tax exemption for recognised startups"],
                    "**Startup India Benefits:**\n\n1. **DPIIT Recognition** — register on startupindia.gov.in\n2. **3-year income tax holiday** under Sec 80-IAC\n3. **Angel Tax exemption** — no tax on investment received\n4. **Fast-track patent** examination\n5. **Self-certification** for 9 labour laws\n6. Fund of Funds access for funding\n\n**Company Registration Steps:**\n1. Obtain DIN (Director ID)\n2. Get name approval via RUN form\n3. File SPICe+ on MCA21 portal\n4. PAN + TAN auto-issued\n5. Open current bank account\n\n*Tell me your city for startup/corporate lawyers!*"),
            ],
            "corporate"
        )
    },
    {
        "queries": ["cheque bounce", "cheque dishonour", "section 138 ni act", "cheque return", "dishonoured cheque"],
        "response": make_legal_response(
            "I've detected a **Cheque Bounce (NI Act)** matter. Here's exactly what to do:",
            "Corporate/Business Law 💼", "Neutral 😐",
            ["Negotiable Instruments Act 1881 § 138"],
            [
                make_card("law", "💳", "Cheque Bounce — Section 138",
                    ["Criminal offence — up to 2 years/ double amount fine", "Send legal notice within 30 days of return memo", "File complaint if no payment within 15 days of notice"],
                    "**Cheque Bounce — Key Law:**\n\n• **Sec 138 NI Act** — criminal offence on dishonour\n• Punishment: Up to **2 years** imprisonment OR **double** cheque amount fine OR both\n• Cognizable? No — complaint by victim needed\n\n**Timeline:**\n1. Cheque bounces → Bank gives **Return Memo**\n2. Within **30 days** of memo → Send **legal notice**\n3. Drawer has **15 days** to pay from receipt of notice\n4. If no payment → File **complaint in Magistrate court within 30 days**"),
                make_card("steps", "📋", "Action Steps",
                    ["Get return memo from bank", "Send notice via registered post within 30 days", "File complaint in Magistrate court"],
                    "**Cheque Bounce — Step by Step:**\n\n1. **Collect return memo** from bank (shows reason for dishonour)\n2. **Send legal notice** to drawer within 30 days via registered post\n3. Keep acknowledgment of delivery\n4. If drawer doesn't pay in 15 days → File **Sec 138 complaint**\n5. File in Magistrate Court of your area\n6. Court issues summons to drawer\n7. Trial and conviction if amount not paid\n\n*Tell me your city for corporate lawyers who handle cheque cases!*"),
            ],
            "corporate"
        )
    },
]

# ── NRI LEGAL Q&As ────────────────────────────────────────────────────────────
NRI_QA = [
    {
        "queries": ["nri property rights", "nri buying property india", "nri sell property", "oci property rights", "fema property nri"],
        "response": make_legal_response(
            "I've detected an **NRI Property Rights** query. Here's what Indian law says:",
            "Property Law 🏠", "Neutral 😐",
            ["FEMA 1999", "Transfer of Property Act 1882"],
            [
                make_card("nri-property", "🏠", "NRI Property Rights",
                    ["NRI can buy residential/commercial property freely", "OCI holders have same rights as NRI", "Agricultural land purchase requires RBI permission"],
                    "**NRI Property Rights — Key Rules:**\n\n• **NRI** (Non-Resident Indian) = Indian citizen living abroad\n• **OCI** = Overseas Citizenship of India holder\n\n**What NRI/OCI CAN buy:**\n• Residential property\n• Commercial property\n• No RBI permission needed\n\n**What requires RBI permission:**\n• Agricultural land\n• Plantation property\n• Farm house\n\n**Payment** — must be through NRE/NRO account or foreign remittance (not cash)"),
                make_card("selling", "💰", "Selling NRI Property",
                    ["TDS 20-30% deducted at source on capital gains", "Apply for lower TDS certificate if needed", "Repatriation allowed via NRE account"],
                    "**NRI Selling Property:**\n\n• **TDS** — Buyer deducts 20–30% TDS on sale value (NRI)\n• Apply for **lower TDS certificate** (Form 13) if actual capital gains are lower\n• **Capital Gains Tax** — LTCG 20% (property held > 2 years)\n• **Repatriation** — can send up to USD 1 million/year from NRO account\n\n**Power of Attorney:**\n• NRI can give POA to someone in India\n• Must be notarized + apostilled in the country of residence\n• Get it registered in India before use\n\n*Tell me your city for NRI property lawyers!*"),
            ],
            "property"
        )
    },
    {
        "queries": ["nri divorce", "divorce for nri", "nri spouse divorce", "foreign divorce india valid", "nri marriage dissolution"],
        "response": make_legal_response(
            "I've detected an **NRI Divorce** matter. This is complex — here's what Indian law says:",
            "Family/Matrimonial Law 👨‍👩‍👧", "Neutral 😐",
            ["Hindu Marriage Act 1955", "Special Marriage Act 1954"],
            [
                make_card("nri-divorce", "👨‍👩‍👧", "NRI Divorce — Key Rules",
                    ["Foreign divorce decree may not be valid in India", "Indian courts have jurisdiction for Hindu marriages", "File in India if marriage was solemnised here"],
                    "**NRI Divorce — Critical Points:**\n\n• A **foreign divorce decree** is NOT automatically valid in India\n• If marriage was under **Hindu Marriage Act** — Indian court must recognize the decree\n• **Ex-parte foreign divorce** (one-sided) — almost certainly invalid in India\n\n**When is foreign decree valid?**\n• Both parties voluntarily submitted to foreign court\n• Both parties were given fair opportunity\n• Decree is from a country with reciprocal arrangement\n\n**Recommended approach:**\n• File divorce in India if marriage was in India\n• Get foreign decree recognized by Indian High Court if needed"),
                make_card("steps", "🔍", "What to Do",
                    ["File petition in Indian Family Court", "Send legal notice to NRI spouse", "Can seek maintenance from NRI spouse via Indian court"],
                    "**Action Plan for NRI Divorce:**\n\n1. **File petition** in Indian Family Court (where marriage occurred or wife resides)\n2. **Send notice** to NRI spouse at foreign address (court arranges)\n3. **Maintenance claim** — Indian courts can order NRI spouses to pay\n4. **Child custody** — file in India; foreign enforcement is complex\n5. **Passport Impounding** — court can ask to impound NRI's Indian passport if they evade\n\n*Tell me your city for NRI divorce specialists!*"),
            ],
            "family"
        )
    },
    {
        "queries": ["power of attorney india nri", "nri poa", "poa from abroad", "general power of attorney", "special power of attorney nri"],
        "response": make_legal_response(
            "I've detected an **NRI Power of Attorney** query. Here's everything you need to know:",
            "Property Law 🏠", "Neutral 😐",
            ["Registration Act 1908", "Power of Attorney Act 1882"],
            [
                make_card("poa", "📝", "Power of Attorney for NRIs",
                    ["Must be notarized + apostilled abroad", "Register in India for property transactions", "GPA vs SPA — use specific one for property"],
                    "**Power of Attorney — NRI Guide:**\n\n• **GPA (General POA)** — broad powers; risky if given to unknown person\n• **SPA (Special POA)** — limited to specific task (e.g. sell one property)\n\n**Steps to create valid NRI POA:**\n1. Draft POA on stamp paper\n2. Get **notarized** by Indian consulate / notary in country of residence\n3. Get **apostilled** by government of that country\n4. Send original to India\n5. **Register** at Sub-Registrar office in India within 3 months of execution\n\n**⚠️ Warning:** Unregistered POA is invalid for property transactions!\n\n*Tell me your city for property lawyers who handle NRI POA!*"),
            ],
            "property"
        )
    },
]

# ── WOMEN'S SAFETY & POSH Q&As ────────────────────────────────────────────────
WOMEN_QA = [
    {
        "queries": ["sexual harassment at work", "posh act", "harassment at office", "workplace harassment india", "icc complaint", "sexual harassment complaint"],
        "response": make_legal_response(
            "I've detected a **Workplace Sexual Harassment (POSH)** matter. Here's your complete guide:",
            "Family/Matrimonial Law 👨‍👩‍👧", "URGENT 🚨",
            ["POSH Act 2013", "SHW Act"],
            [
                make_card("posh", "🛡️", "POSH Act 2013",
                    ["All workplaces with 10+ employees must have ICC", "File complaint within 3 months of incident", "Employer must act within 60 days of complaint"],
                    "**Prevention of Sexual Harassment (POSH) Act 2013:**\n\n• Applies to **all workplaces** — offices, factories, hospitals, schools\n• **ICC (Internal Complaints Committee)** — mandatory for 10+ employees\n• **LCC (Local Complaints Committee)** — for small employers or domestic workers\n\n**What counts as sexual harassment:**\n• Physical contact / advances\n• Demand for sexual favours\n• Sexually coloured remarks\n• Showing pornography\n• Any unwelcome physical, verbal, or non-verbal conduct"),
                make_card("steps", "🔍", "How to File POSH Complaint",
                    ["File written complaint to ICC within 3 months", "ICC must complete inquiry in 60 days", "If employer ignores — complain to District Officer"],
                    "**POSH Complaint Process:**\n\n1. **File written complaint** to ICC Chairperson within 3 months\n2. Time limit can be extended by 3 months for sufficient cause\n3. ICC conducts **confidential inquiry**\n4. Both parties heard — no advocates permitted inside hearing\n5. ICC submits report within **60 days**\n6. Employer must act on report within **60 days**\n\n**If employer has no ICC / ignores report:**\n• Complain to **District Officer** (Labour Commissioner)\n• File **criminal FIR** under BNS simultaneously\n\n*Tell me your city for women's rights lawyers!*"),
            ],
            "family"
        )
    },
    {
        "queries": ["stalking india", "online stalking", "cyberstalking", "someone following me", "stalking law india"],
        "response": make_legal_response(
            "I've detected a **Stalking** matter. Here's what to do immediately:",
            "Criminal Law 👮", "URGENT 🚨",
            ["BNS 2023 § 78", "IPC § 354D"],
            [
                make_card("law", "🛡️", "Stalking — Indian Law",
                    ["BNS § 78 / IPC § 354D — specific stalking offence", "First offence: 1–3 years; repeat: 3–5 years", "Online/cyber stalking also covered"],
                    "**Stalking Under Indian Law:**\n\n• **BNS § 78 / IPC § 354D** — specifically covers stalking\n• Includes: physical following, online monitoring, repeated contact after clear refusal\n• **First offence** — up to 3 years + fine\n• **Second / repeat** — up to 5 years + fine\n• Cyber stalking covered — monitoring emails, social media, messages\n\n**Police must register FIR** — non-bailable offence"),
                make_card("steps", "🔍", "Immediate Action",
                    ["Document every stalking incident with dates", "File FIR at local police station immediately", "Apply for restraining order in court"],
                    "**What to Do Immediately:**\n\n1. **Document everything** — dates, times, locations, screenshots\n2. **Tell trusted people** — don't bear it alone\n3. **File FIR** at police station — insist they register it\n4. **Apply for restraining order** in local court\n5. **Block on all platforms** but screenshot proof first\n6. **Women helpline: 181** (free, 24/7)\n\n*Tell me your city for women's safety lawyers!*"),
            ],
            "criminal"
        )
    },
    {
        "queries": ["pocso act", "child sexual abuse", "child abuse india", "sexual abuse of minor", "child protection law"],
        "response": make_legal_response(
            "I've detected a **POCSO (Child Protection)** matter. This is extremely serious — act immediately:",
            "Criminal Law 👮", "URGENT 🚨",
            ["POCSO Act 2012", "BNS 2023"],
            [
                make_card("pocso", "🛡️", "POCSO Act 2012",
                    ["Covers all sexual offences against children under 18", "Mandatory reporting — not reporting is an offence", "Special courts handle POCSO cases"],
                    "**POCSO Act 2012 — Key Facts:**\n\n• Covers all children **under 18 years**\n• **Gender neutral** — protects boys and girls\n• **Mandatory reporting** — anyone who knows of abuse MUST report (Sec 19)\n• Not reporting = criminal offence\n\n**Offences covered:**\n• Penetrative sexual assault (Sec 3) — 10 years to life\n• Aggravated assault — 20 years to life or death\n• Sexual harassment, exhibitionism (Sec 11)\n• Using child for pornography (Sec 13)\n\n**Presumption of guilt** — accused must prove innocence"),
                make_card("steps", "🔍", "Reporting POCSO",
                    ["Report to police or SJPU (Special Juvenile Police Unit)", "Block Number: 1098 — Childline", "Child Welfare Committee involved for protection"],
                    "**How to Report:**\n\n1. **Call 1098** — Childline (24/7, free)\n2. **Call 100** — Police emergency\n3. Go to local **police station** or **SJPU**\n4. Medical examination within 24 hours (free)\n5. **Child Welfare Committee** involved for child's protection\n6. **Special Court** handles trial — you don't need to repeat story\n7. Identity of child kept **strictly confidential**\n\n*Tell me your city for POCSO lawyers and victim support!*"),
            ],
            "criminal"
        )
    },
]

# ── LANDMARK SC CASES Q&As ────────────────────────────────────────────────────
LANDMARK_QA = [
    {
        "queries": ["kesavananda bharati case", "basic structure doctrine", "parliament power to amend constitution"],
        "response": make_legal_response(
            "Here's the landmark **Kesavananda Bharati** Supreme Court case:",
            "Constitutional Law ⚖️", "Neutral 😐",
            ["Constitution of India", "Supreme Court of India"],
            [
                make_card("case", "⚖️", "Kesavananda Bharati v State of Kerala (1973)",
                    ["13-judge bench — largest in SC history", "Parliament CANNOT alter basic structure of Constitution", "Landmark: Fundamental Rights vs Directive Principles"],
                    "**Kesavananda Bharati v State of Kerala (1973):**\n\n• Decided by **13-judge Constitution Bench** (largest ever)\n• **Basic Structure Doctrine** — Parliament cannot alter fundamental features of Constitution\n• Basic structure includes: supremacy of Constitution, democratic republic, federalism, separation of powers, fundamental rights\n\n**Significance:**\n• Overruled Golak Nath case\n• Limited Parliament's amending power\n• Still controls constitutional amendments today\n• Considered one of India's most important judgments ever"),
            ],
            "constitutional"
        )
    },
    {
        "queries": ["shreya singhal case", "section 66a it act struck down", "freedom of speech internet", "66a unconstitutional"],
        "response": make_legal_response(
            "Here's the landmark **Shreya Singhal** case on internet freedom:",
            "Constitutional Law ⚖️", "Neutral 😐",
            ["IT Act 2000", "Constitution Art. 19(1)(a)"],
            [
                make_card("case", "⚖️", "Shreya Singhal v Union of India (2015)",
                    ["SC struck down Section 66A of IT Act", "Restored internet free speech rights", "Online speech protected under Article 19(1)(a)"],
                    "**Shreya Singhal v Union of India (2015):**\n\n• Supreme Court **struck down Section 66A** of IT Act 2000\n• 66A allowed arrest for 'offensive' online content — vague and overbroad\n• Court held it violated **Article 19(1)(a)** (freedom of speech)\n\n**What the case established:**\n• Online speech = same protection as offline speech\n• 'Annoying' or 'offensive' too vague as restriction ground\n• Laws restricting speech must be precise and narrow\n\n**Impact today:**\n• Section 66A cannot be used for arrests (police sometimes still misuse it)\n• Know your right — report to cybercrime.gov.in if 66A invoked against you"),
            ],
            "constitutional"
        )
    },
    {
        "queries": ["navtej johar case", "section 377 struck down", "lgbtq rights india", "homosexuality legal india", "ipc 377"],
        "response": make_legal_response(
            "Here's the landmark **Navtej Singh Johar** case on LGBTQ+ rights:",
            "Constitutional Law ⚖️", "Neutral 😐",
            ["Constitution Arts. 14, 19, 21", "IPC § 377"],
            [
                make_card("case", "⚖️", "Navtej Singh Johar v Union of India (2018)",
                    ["SC decriminalised consensual same-sex relations", "Section 377 IPC partially struck down", "LGBTQ+ persons have equal fundamental rights"],
                    "**Navtej Singh Johar v Union of India (2018):**\n\n• 5-judge Constitution Bench\n• **Section 377 IPC** partially struck down — consensual adult same-sex relations decriminalized\n• Non-consensual acts / sex with minors still criminal\n\n**What the court held:**\n• Sexual orientation is an integral part of **identity** (Art. 21)\n• Discrimination based on sexual orientation violates **Art. 14 & 15**\n• Overruled Suresh Kumar Koushal (2013) judgment\n\n**Current status:**\n• Same-sex marriage not yet recognized\n• Marriage Equality petitions pending before SC / referred to Constitution Bench"),
            ],
            "constitutional"
        )
    },
]

# ── POLICE & FALSE ACCUSATION Q&As ───────────────────────────────────────────
POLICE_QA = [
    {
        "queries": ["falsely accused of crime", "false case filed", "false fir", "how to fight false case", "bogus fir"],
        "response": make_legal_response(
            "I've detected a **False Accusation / Bogus FIR** matter. Here's your complete defence strategy:",
            "Criminal Law 👮", "URGENT 🚨",
            ["BNSS 2023", "BNS 2023", "Constitution Art. 21"],
            [
                make_card("defence", "🛡️", "Defending Against False FIR",
                    ["File anticipatory bail immediately", "Apply for FIR quashing in High Court", "File counter-complaint for malicious prosecution"],
                    "**Strategy to Fight False FIR:**\n\n**Immediate steps:**\n1. **Anticipatory bail** — apply before arrest (§ 438 BNSS)\n2. **Quashing of FIR** — petition to High Court under § 528 BNSS / Art. 226\n3. Courts quash FIRs when: proceedings are abuse of process, no prima facie case, civil dispute disguised as criminal\n\n**Counter-action:**\n• After acquittal — file complaint for **malicious prosecution**\n• File **section 182 BNS** — giving false information to public servant\n\n**Evidence to preserve:**\n• Alibi witnesses + photos\n• CCTV footage\n• Phone location data\n• WhatsApp / email communications"),
                make_card("steps", "🔍", "Immediate Action Plan",
                    ["Do NOT speak to police without lawyer", "File anticipatory bail today", "Collect alibi evidence immediately"],
                    "**Action Plan — False Accusation:**\n\n1. **Do NOT** give statement to police without lawyer\n2. **Hire criminal advocate** immediately\n3. **Anticipatory bail** — file today if arrest feared\n4. **FIR Quashing petition** — file in High Court\n5. **Collect alibi evidence** — CCTV, witnesses, phone records\n6. **Cooperate with investigation** — do not flee, strengthens your case\n7. **Record all harassment** by police\n\n*Tell me your city for top criminal defence lawyers!*"),
            ],
            "criminal"
        )
    },
    {
        "queries": ["police brutality india", "police harassment", "custodial torture", "police beating", "rights when arrested"],
        "response": make_legal_response(
            "I've detected a **Police Brutality / Rights During Arrest** query. Know your rights:",
            "Criminal Law 👮", "URGENT 🚨",
            ["Constitution Arts. 20, 21, 22", "BNSS 2023"],
            [
                make_card("rights", "🛡️", "Your Rights During Arrest",
                    ["Right to know grounds of arrest", "Must be produced before Magistrate in 24 hours", "Right to lawyer before any interrogation"],
                    "**Fundamental Rights During Arrest:**\n\n• **Art. 22** — Must be **informed of grounds** of arrest\n• **24-hour rule** — Must be produced before Magistrate within 24 hours\n• **Right to advocate** — cannot be denied access to lawyer\n• **Art. 20(3)** — Cannot be compelled to be witness against yourself\n• No **third degree / torture** — violation of Art. 21\n• **D.K. Basu Guidelines** — police must follow memo of arrest, notify relative\n\n**Police CANNOT:**\n• Arrest without FIR for non-cognizable offence\n• Detain beyond 24 hours without Magistrate remand\n• Deny access to lawyer\n• Torture / use force beyond reasonable"),
                make_card("complaint", "📋", "Reporting Police Brutality",
                    ["Complaint to SP/DCP of the area", "Human Rights Commission complaint", "Writ of Habeas Corpus in High Court"],
                    "**How to Report Police Brutality:**\n\n1. **Medical examination** — document injuries immediately\n2. **Complaint to SP/Commissioner** of police\n3. **State Human Rights Commission** online complaint\n4. **National Human Rights Commission** — nhrc.nic.in\n5. **Habeas Corpus writ** in High Court — if illegally detained\n6. **Magisterial inquiry** can be demanded\n7. **CCTV footage** — file RTI to police station\n\n*Tell me your city for lawyers who handle police matter cases!*"),
            ],
            "criminal"
        )
    },
]

# ── STATE-SPECIFIC Q&As ───────────────────────────────────────────────────────
STATE_QA = [
    {
        "queries": ["maharashtra rent control", "mumbai tenant rights", "maharashtra tenancy act", "shop establishment maharashtra"],
        "response": make_legal_response(
            "I've detected a **Maharashtra Tenancy / Rent Control** query:",
            "Property Law 🏠", "Neutral 😐",
            ["Maharashtra Rent Control Act 1999"],
            [
                make_card("maha-rent", "🏠", "Maharashtra Rent Control Act 1999",
                    ["Protects tenants in Mumbai, Pune, Nagpur", "Landlord cannot arbitrarily increase rent", "Eviction only through court process"],
                    "**Maharashtra Rent Control Act 1999:**\n\n• Applies in Mumbai, Pune, Nagpur, and other notified areas\n• **Rent freeze** — landlord cannot increase rent arbitrarily\n• **Eviction grounds** — non-payment of rent, personal use, structural repairs\n• All evictions must go through **Rent Controller Court**\n• Tenant has right to **appeal** eviction orders\n\n**Tenant rights:**\n• Cannot be locked out without court order\n• Right to sub-tenancy if lease allows\n• Receipt for every rent payment is a right\n\n*Tell me your city for property lawyers in Maharashtra!*"),
            ],
            "property"
        )
    },
    {
        "queries": ["delhi property registration", "delhi stamp duty", "delhi tenancy", "delhi rent agreement", "dda flat"],
        "response": make_legal_response(
            "I've detected a **Delhi Property** query:",
            "Property Law 🏠", "Neutral 😐",
            ["Registration Act 1908", "Delhi Rent Control Act 1958"],
            [
                make_card("delhi-property", "🏠", "Delhi Property Key Facts",
                    ["Stamp duty: 4% women, 6% men", "Registration mandatory for 11+ month leases", "DDA flats — strict transfer rules"],
                    "**Delhi Property — Key Rules:**\n\n• **Stamp Duty** — 4% for women, 6% for men, 5% for joint\n• **Circle Rate** — minimum valuation for stamp duty; check DDA/MCD site\n• **Registration** — mandatory for 11+ month leases\n• **Lease Agreement** — 11-month agreements to avoid registration (common practice)\n\n**DDA Flats:**\n• Cannot be sold without DDA permission (for 10 years from allotment)\n• Conversion from leasehold to freehold through DDA\n• Check conveyance deed before buying\n\n*Tell me your area for Delhi property lawyers!*"),
            ],
            "property"
        )
    },
    {
        "queries": ["up property mutation", "uttar pradesh land record", "khatauni", "khasra khatauni", "up revenue court"],
        "response": make_legal_response(
            "I've detected a **Uttar Pradesh Land Records** query:",
            "Property Law 🏠", "Neutral 😐",
            ["UP Revenue Code 2006", "UP Land Records Manual"],
            [
                make_card("up-land", "🏠", "UP Land Records — Key Facts",
                    ["Check Bhulekh portal for online records", "Mutation (dakhil kharij) at Tehsil", "Nakal (certified copy) for court"],
                    "**UP Land Records:**\n\n• **Bhulekh UP** — upbhulekh.gov.in (online khasra/khatauni)\n• **Khasra** — individual plot number record\n• **Khatauni** — record of rights for owner\n• **Mutation (Dakhil Kharij)** — update records after purchase/inheritance; at Tehsil\n\n**Revenue Court for disputes:**\n• Sub-Divisional Magistrate (SDM) → District Magistrate (DM) → Revenue Board\n• Partition of land — sub-divisional officer\n• Limitation: 12 years for land\n\n*Tell me your city for UP property/revenue lawyers!*"),
            ],
            "property"
        )
    },
]

# ── BUILDER & RERA Q&As ───────────────────────────────────────────────────────
RERA_QA = [
    {
        "queries": ["rera complaint", "builder fraud", "flat possession delayed", "real estate fraud india", "builder not giving possession"],
        "response": make_legal_response(
            "I've detected a **Builder Fraud / RERA** matter. Here's how to fight back:",
            "Property Law 🏠", "Neutral 😐",
            ["RERA Act 2016"],
            [
                make_card("rera", "🏠", "RERA — Real Estate Regulatory Authority",
                    ["Online complaint on state RERA portal", "Builder must pay interest for delay", "Registration number mandatory for all projects"],
                    "**RERA Act 2016 — Buyer Protection:**\n\n• All projects > 500 sq m / 8 units MUST be RERA registered\n• Check registration on state RERA portal\n• **Delayed possession** — builder must pay interest at SBI rate\n• **Builder must** deposit 70% of buyer money in escrow\n• **Defects** for 5 years after possession — builder must fix free\n\n**How to file RERA complaint:**\n1. Check if project is RERA registered\n2. File complaint on state RERA portal\n3. Filing fee: usually ₹1000\n4. Hearing within 60 days\n5. Relief: refund + interest OR possession + penalty\n\n*Tell me your city for RERA lawyers!*"),
            ],
            "property"
        )
    },
]

# ── GENERATE TRAINING DATA ────────────────────────────────────────────────────

def generate_all():
    kb = []
    variation_templates = [
        "{}", "tell me about {}", "explain {}", "what do you know about {}",
        "i need help with {}", "guide me on {}", "what is {}", "how does {} work",
        "i want to know about {}", "give me information on {}", "{}?",
        "please help me understand {}", "what are my rights regarding {}",
    ]

    # 1. GREETINGS — 500 instances
    for i in range(500):
        raw = random.choice(GREETING_VARIANTS)
        q = random.choice(GREETING_INTRO_TEMPLATES).format(raw)
        kb.append({"query": q.lower().strip(), "response": GREETING_RESPONSE})

    # 2. CASUAL — 50 instances (multiple variations per entry)
    for q_text, r_text in CASUAL_QA:
        for tmpl in variation_templates[:3]:
            q = tmpl.format(q_text)
            kb.append({"query": q.lower().strip(), "response": make_casual_response(r_text)})

    # 3. CORE LEGAL — multiple query variations each
    for item in CORE_LEGAL_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 4. RTI Q&As
    for item in RTI_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 5. GST Q&As
    for item in GST_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 6. NRI Q&As
    for item in NRI_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 7. Women's Safety Q&As
    for item in WOMEN_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 8. Landmark SC Cases
    for item in LANDMARK_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:6]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 9. Police & False Accusation
    for item in POLICE_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 10. State-specific
    for item in STATE_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:6]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # 11. RERA
    for item in RERA_QA:
        for q in item["queries"]:
            for tmpl in variation_templates[:8]:
                kb.append({"query": tmpl.format(q).lower().strip(), "response": item["response"]})

    # Deduplicate
    seen = set()
    unique_kb = []
    for item in kb:
        if item["query"] not in seen:
            seen.add(item["query"])
            unique_kb.append(item)

    return unique_kb

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    kb = generate_all()
    with open("data/training_kb.json", "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)
    print(f"✅ Generated {len(kb)} unique training instances → data/training_kb.json")
    print(f"   Breakdown:")
    greetings = [x for x in kb if x["response"].get("is_greeting") and x["response"].get("detected_spec") == ""]
    legal = [x for x in kb if not x["response"].get("is_greeting")]
    print(f"   • Greetings/Casual: {len(greetings)}")
    print(f"   • Legal Q&As: {len(legal)}")
