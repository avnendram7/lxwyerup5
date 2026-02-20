/**
 * CHATBOT TRAINING DATA
 * =====================
 * Add your custom Q&A pairs here to train the AI assistant.
 * 
 * HOW TO ADD NEW RESPONSES:
 * 1. Add keywords that the user might type in the "keywords" array
 * 2. Add one or more responses in the "responses" array (bot picks randomly)
 * 
 * SECTIONS:
 * - greetings: hi, hello, hey, etc.
 * - farewells: bye, goodbye, etc.
 * - thanks: thank you, thanks, etc.
 * - about: who are you, what can you do, etc.
 * - legalInfo: general legal knowledge responses
 * - customQA: add ANY custom question-answer pairs here
 */

// ==========================================
// GREETINGS
// ==========================================
export const greetings = {
    keywords: ['hi', 'hello', 'hey', 'hii', 'hola', 'namaste', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup'],
    responses: [
        "Hello! 👋 How can I help you today? Tell me about your legal issue and I'll find the right lawyer for you.",
        "Hi there! I'm your AI legal assistant. What kind of legal help are you looking for?",
        "Hey! Welcome to Lxwyer Up. Describe your legal concern and I'll match you with the best lawyers.",
        "Namaste! 🙏 I'm here to help you find the perfect lawyer. What's your legal issue?",
        "Hello! I'm ready to help. Just describe your case and location, and I'll recommend the best lawyers for you."
    ]
};

// ==========================================
// FAREWELLS
// ==========================================
export const farewells = {
    keywords: ['bye', 'goodbye', 'see you', 'exit', 'quit', 'close', 'later', 'take care'],
    responses: [
        "Goodbye! 👋 Feel free to come back anytime you need legal help. Take care!",
        "See you later! Don't hesitate to return if you need legal assistance. 😊",
        "Bye! Wishing you the best with your legal matters. Come back anytime!"
    ]
};

// ==========================================
// THANKS
// ==========================================
export const thanks = {
    keywords: ['thanks', 'thank you', 'thx', 'ty', 'appreciated', 'great', 'awesome', 'perfect', 'nice', 'cool', 'wonderful'],
    responses: [
        "You're welcome! 😊 Let me know if you need anything else.",
        "Happy to help! Feel free to ask if you have any other legal queries.",
        "Glad I could help! If you need more recommendations, just describe your case again.",
        "Anytime! I'm here whenever you need legal assistance. 🙏"
    ]
};

// ==========================================
// ACKNOWLEDGEMENTS (ok, yes, no, hmm)
// ==========================================
export const acknowledgements = {
    keywords: ['ok', 'okay', 'yes', 'no', 'sure', 'alright', 'got it', 'k', 'yep', 'nope', 'hmm', 'right', 'fine'],
    responses: [
        "Got it! If you're ready to find a lawyer, just tell me:\n\n• What's your legal issue?\n• Which city/state are you in?\n\nFor example: \"Property dispute in Mumbai\"",
        "Alright! Whenever you're ready, describe your case and I'll find the best lawyers for you.",
        "Sure! Just tell me your legal issue and location, and I'll get started right away."
    ]
};

// ==========================================
// ABOUT THE BOT
// ==========================================
export const aboutBot = {
    keywords: ['who are you', 'what can you do', 'help me', 'how does this work', 'what do you do', 'tell me about yourself', 'your name', 'about you', 'how to use'],
    responses: [
        "I'm the Lxwyer Up AI Assistant! Here's what I can do:\n\n1. 🔍 Find lawyers by specialization (divorce, property, criminal, etc.)\n2. 📍 Match lawyers in your city/state\n3. ⭐ Rank them by rating, experience & match score\n4. 📋 Show detailed profiles with fees & availability\n\nJust say something like: \"I need a divorce lawyer in Delhi\"",
        "I'm your AI legal assistant powered by Lxwyer Up! I analyze 500+ lawyers and match you with the best ones based on your case type and location. Try asking: \"Property lawyer in Mumbai\""
    ]
};

// ==========================================
// LEGAL INFORMATION (General legal knowledge)
// ==========================================
export const legalInfo = [
    {
        keywords: ['what is fir', 'fir meaning', 'first information report', 'how to file fir'],
        responses: [
            "An FIR (First Information Report) is a written document prepared by the police when they receive information about the commission of a cognizable offence.\n\n📌 Key points:\n• You can file an FIR at any police station\n• It's free of cost\n• Police cannot refuse to register an FIR\n• You can also file an online FIR in many states\n\nWould you like me to find a criminal lawyer to help you with an FIR-related matter? Just tell me your city!"
        ]
    },
    {
        keywords: ['what is bail', 'bail meaning', 'how to get bail', 'bail process'],
        responses: [
            "Bail is the temporary release of an accused person awaiting trial, sometimes with a security deposit.\n\n📌 Types of Bail:\n• Regular Bail (under Section 437/439 CrPC)\n• Anticipatory Bail (before arrest, under Section 438)\n• Interim Bail (temporary, until the hearing)\n\nWould you like me to find a criminal lawyer who handles bail matters? Tell me your location!"
        ]
    },
    {
        keywords: ['divorce process', 'how to get divorce', 'divorce in india', 'mutual divorce', 'contested divorce'],
        responses: [
            "Divorce in India can be obtained through:\n\n1. **Mutual Consent Divorce** (Section 13B) — Both parties agree\n   • Takes 6-18 months\n   • Requires 1 year of separation\n\n2. **Contested Divorce** — One party files\n   • Grounds: cruelty, adultery, desertion, mental disorder, etc.\n   • Can take 2-5 years\n\n📌 Required Documents: Marriage certificate, address proof, photos, income proof\n\nNeed a family lawyer? Just tell me your city and I'll find the best ones!"
        ]
    },
    {
        keywords: ['property dispute', 'land dispute', 'property rights', 'property registration'],
        responses: [
            "Property disputes are among the most common legal issues in India.\n\n📌 Common Types:\n• Title disputes (ownership claims)\n• Boundary disputes\n• Tenant-landlord disputes\n• Ancestral property partition\n• Illegal encroachment\n\n📌 Key Laws: Transfer of Property Act, Registration Act, Land Revenue Act\n\nI can find a property lawyer for you! Just tell me your location."
        ]
    },
    {
        keywords: ['consumer complaint', 'consumer rights', 'consumer court', 'defective product', 'poor service'],
        responses: [
            "You can file a consumer complaint under the Consumer Protection Act, 2019.\n\n📌 Where to file:\n• District Commission (claims up to ₹1 crore)\n• State Commission (₹1-10 crore)\n• National Commission (above ₹10 crore)\n\n📌 You can complain about:\n• Defective goods\n• Deficient services\n• Unfair trade practices\n• Overcharging\n\nWant me to find a consumer law expert? Tell me your city!"
        ]
    },
    {
        keywords: ['cheque bounce', 'cheque dishonour', 'section 138', 'bounced cheque'],
        responses: [
            "Cheque bounce is a criminal offence under Section 138 of the Negotiable Instruments Act.\n\n📌 Steps to take:\n1. Send a legal notice within 30 days of cheque return\n2. Wait 15 days for payment\n3. File a complaint in court within 30 days after notice period\n\n📌 Punishment: Up to 2 years imprisonment or fine (twice the cheque amount)\n\nNeed a lawyer for a cheque bounce case? Tell me your city!"
        ]
    },
    {
        keywords: ['gst', 'gst registration', 'gst filing', 'goods and services tax'],
        responses: [
            "GST (Goods and Services Tax) is India's indirect tax system.\n\n📌 Key Points:\n• Registration required if turnover exceeds ₹40 lakhs (₹20 lakhs for services)\n• Returns: GSTR-1, GSTR-3B filed monthly/quarterly\n• GST rates: 0%, 5%, 12%, 18%, 28%\n\nNeed a tax lawyer for GST issues? Tell me your location!"
        ]
    },
    {
        keywords: ['cyber crime', 'online fraud', 'hacking', 'cyber complaint', 'online scam'],
        responses: [
            "Cyber crimes in India are dealt with under the IT Act, 2000.\n\n📌 Common Cyber Crimes:\n• Online fraud / phishing\n• Identity theft\n• Hacking\n• Cyberstalking\n• Data theft\n\n📌 Where to report:\n• cybercrime.gov.in (National Portal)\n• Local cyber cell\n• Police station (FIR)\n\nWant me to find a cyber law expert? Just mention your city!"
        ]
    },
    {
        keywords: ['labour law', 'employee rights', 'wrongful termination', 'salary dispute', 'fired'],
        responses: [
            "Indian labour laws protect employee rights.\n\n📌 Key Protections:\n• Minimum wages must be paid\n• Notice period required before termination\n• Gratuity after 5 years of service\n• PF and ESI contributions mandatory\n• No discrimination in workplace\n\n📌 Where to complain: Labour Commissioner, Labour Court\n\nNeed a labour lawyer? Tell me your location and I'll find the best ones!"
        ]
    },
    {
        keywords: ['startup', 'company registration', 'llp', 'incorporate', 'business registration'],
        responses: [
            "Starting a business in India? Here are your options:\n\n📌 Business Structures:\n• Private Limited Company — Best for startups\n• LLP (Limited Liability Partnership) — Less compliance\n• Sole Proprietorship — Simplest form\n• Partnership Firm — For 2+ partners\n\n📌 Key Registrations: GST, MSME, Trademark, FSSAI (food)\n\nNeed a corporate lawyer to help with registration? Tell me your city!"
        ]
    }
];

// ==========================================
// CUSTOM Q&A PAIRS
// Add your own questions and answers here!
// ==========================================
export const customQA = [
    // EXAMPLE FORMAT:
    // {
    //   keywords: ['your keyword 1', 'your keyword 2'],
    //   responses: [
    //     "Your custom response here",
    //     "Another variation of the response (optional)"
    //   ]
    // },

    {
        keywords: ['how much', 'lawyer cost', 'fees', 'pricing', 'charges', 'consultation fee'],
        responses: [
            "Lawyer fees vary based on specialization, experience, and location.\n\n📌 Typical Ranges:\n• Consultation: ₹500 – ₹5,000\n• Property matters: ₹10,000 – ₹50,000+\n• Criminal cases: ₹15,000 – ₹1,00,000+\n• Family law: ₹10,000 – ₹50,000+\n• Corporate: ₹20,000 – ₹2,00,000+\n\nTell me your case type and city, and I'll show exact fees for each lawyer!"
        ]
    },
    {
        keywords: ['how long', 'time taken', 'duration', 'how many days', 'how many months'],
        responses: [
            "Case duration depends on the type of case:\n\n📌 Typical Timelines:\n• Mutual Divorce: 6-18 months\n• Contested Divorce: 2-5 years\n• Property Dispute: 1-10 years\n• Criminal Case: 6 months - 7 years\n• Consumer Complaint: 3-12 months\n• Cheque Bounce: 1-3 years\n\nA good lawyer can help speed things up. Tell me your case type and location!"
        ]
    },
    {
        keywords: ['documents needed', 'required documents', 'what documents', 'paperwork'],
        responses: [
            "Documents vary by case type. Here are common ones:\n\n📌 General:\n• ID Proof (Aadhaar, PAN)\n• Address Proof\n• Relevant contracts/agreements\n\n📌 Property: Sale deed, title documents, property tax receipts\n📌 Divorce: Marriage certificate, income proof, photos\n📌 Criminal: FIR copy, medical reports, evidence\n📌 Consumer: Bill/invoice, complaint letters, warranty card\n\nTell me your specific case and I'll guide you better!"
        ]
    }
];

// ==========================================
// FALLBACK (when nothing matches)
// ==========================================
export const fallbackResponses = [
    "I'm not sure what legal help you need. Could you describe your issue more clearly?\n\nFor example:\n• \"I have a property dispute in Delhi\"\n• \"Need a divorce lawyer in Mumbai\"\n• \"Criminal case help in Bangalore\"\n\nYou can mention any legal area like property, divorce, criminal, corporate, tax, consumer, cyber law, etc.",
    "I didn't quite catch that. Could you try describing your legal issue? For example: \"Divorce lawyer in Delhi\" or \"Property dispute in Mumbai\"",
    "I'd love to help! Please mention:\n1. Your legal issue (divorce, property, criminal, etc.)\n2. Your location (Delhi, Mumbai, etc.)\n\nFor example: \"Consumer complaint in Bangalore\""
];

// ==========================================
// CASE TYPE KEYWORDS (for lawyer matching)
// Add more keywords to improve detection
// ==========================================
export const caseTypeKeywords = {
    'Property Law': ['property', 'land', 'real estate', 'plot', 'flat', 'house', 'apartment', 'encroachment', 'tenant', 'landlord', 'rent', 'lease', 'registry', 'mutation', 'title', 'deed', 'possession'],
    'Family Law': ['divorce', 'custody', 'family', 'marriage', 'alimony', 'maintenance', 'domestic violence', 'child support', 'adoption', 'dowry', 'matrimonial', 'separation', 'wife', 'husband', 'spouse'],
    'Criminal Law': ['criminal', 'fir', 'police', 'arrest', 'theft', 'murder', 'assault', 'robbery', 'kidnapping', 'bail', 'fraud', 'cheating', 'forgery', 'threat', 'blackmail', 'extortion'],
    'Corporate Law': ['business', 'company', 'corporate', 'startup', 'partnership', 'llp', 'incorporate', 'merger', 'acquisition', 'shareholder', 'director', 'board', 'compliance', 'mou', 'agreement'],
    'Civil Law': ['civil', 'dispute', 'compensation', 'suit', 'damages', 'injunction', 'declaration', 'recovery', 'money', 'debt', 'contract', 'breach', 'negligence'],
    'Tax Law': ['tax', 'gst', 'income tax', 'taxation', 'it return', 'tax notice', 'tax evasion', 'tds', 'assessment', 'appeal', 'tribunal'],
    'Labour Law': ['labour', 'employee', 'worker', 'employment', 'termination', 'salary', 'wages', 'pf', 'provident fund', 'gratuity', 'esi', 'factory', 'retrenchment', 'layoff', 'fired', 'job'],
    'Consumer Law': ['consumer', 'product', 'service', 'refund', 'defective', 'warranty', 'complaint', 'overcharging', 'misleading', 'unfair trade'],
    'Cyber Law': ['cyber', 'online', 'hack', 'internet', 'data', 'privacy', 'phishing', 'scam', 'identity theft', 'social media'],
    'Immigration Law': ['immigration', 'visa', 'passport', 'citizenship', 'deportation', 'asylum', 'oci', 'nri', 'foreign'],
    'Environmental Law': ['environment', 'pollution', 'ngt', 'waste', 'forest', 'wildlife', 'emission', 'green'],
    'Medical Negligence': ['medical', 'doctor', 'hospital', 'negligence', 'malpractice', 'surgery', 'treatment', 'patient', 'death'],
    'Intellectual Property': ['patent', 'trademark', 'copyright', 'ip', 'design', 'piracy', 'infringement', 'brand'],
    'Banking Law': ['banking', 'loan', 'cheque', 'bank', 'npa', 'recovery', 'wilful defaulter', 'moratorium', 'emi', 'credit card'],
    'Constitutional Law': ['constitution', 'fundamental', 'writ', 'pil', 'rights', 'article', 'amendment', 'supreme court']
};

// ==========================================
// LOCATION KEYWORDS (for lawyer matching)
// Add more cities/states to improve detection
// ==========================================
export const locationKeywords = {
    'delhi': { city: null, state: 'Delhi' },
    'new delhi': { city: 'New Delhi', state: 'Delhi' },
    'south delhi': { city: 'South Delhi', state: 'Delhi' },
    'north delhi': { city: 'North Delhi', state: 'Delhi' },
    'west delhi': { city: 'West Delhi', state: 'Delhi' },
    'east delhi': { city: 'East Delhi', state: 'Delhi' },
    'mumbai': { city: 'Mumbai', state: 'Maharashtra' },
    'pune': { city: 'Pune', state: 'Maharashtra' },
    'nagpur': { city: 'Nagpur', state: 'Maharashtra' },
    'maharashtra': { city: null, state: 'Maharashtra' },
    'bangalore': { city: 'Bangalore', state: 'Karnataka' },
    'bengaluru': { city: 'Bangalore', state: 'Karnataka' },
    'karnataka': { city: null, state: 'Karnataka' },
    'chennai': { city: 'Chennai', state: 'Tamil Nadu' },
    'tamil nadu': { city: null, state: 'Tamil Nadu' },
    'kolkata': { city: 'Kolkata', state: 'West Bengal' },
    'west bengal': { city: null, state: 'West Bengal' },
    'hyderabad': { city: 'Hyderabad', state: 'Telangana' },
    'telangana': { city: null, state: 'Telangana' },
    'ahmedabad': { city: 'Ahmedabad', state: 'Gujarat' },
    'gujarat': { city: null, state: 'Gujarat' },
    'lucknow': { city: 'Lucknow', state: 'Uttar Pradesh' },
    'noida': { city: 'Noida', state: 'Uttar Pradesh' },
    'ghaziabad': { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    'varanasi': { city: 'Varanasi', state: 'Uttar Pradesh' },
    'uttar pradesh': { city: null, state: 'Uttar Pradesh' },
    'up': { city: null, state: 'Uttar Pradesh' },
    'gurgaon': { city: 'Gurgaon', state: 'Haryana' },
    'gurugram': { city: 'Gurgaon', state: 'Haryana' },
    'faridabad': { city: 'Faridabad', state: 'Haryana' },
    'haryana': { city: null, state: 'Haryana' },
    'chandigarh': { city: 'Chandigarh', state: 'Punjab' },
    'punjab': { city: null, state: 'Punjab' },
    'jaipur': { city: 'Jaipur', state: 'Rajasthan' },
    'rajasthan': { city: null, state: 'Rajasthan' },
    'indore': { city: 'Indore', state: 'Madhya Pradesh' },
    'bhopal': { city: 'Bhopal', state: 'Madhya Pradesh' },
    'madhya pradesh': { city: null, state: 'Madhya Pradesh' },
    'patna': { city: 'Patna', state: 'Bihar' },
    'bihar': { city: null, state: 'Bihar' },
    'kochi': { city: 'Kochi', state: 'Kerala' },
    'kerala': { city: null, state: 'Kerala' },
};
