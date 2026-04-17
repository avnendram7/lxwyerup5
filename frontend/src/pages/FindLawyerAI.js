import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Send, Bot, User, Loader2, Star, Briefcase, MapPin, ArrowRight, ArrowLeft, X, CheckCircle, MessageSquare, Sparkles, Phone, Mail, Calendar, GraduationCap, Check, Video, Users, Award, ChevronDown, ChevronUp, HelpCircle, Zap, Shield, Clock } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import LawyerCard from '../components/LawyerCard';
import FirmCard from '../components/FirmCard';
import { dummyLawyers, specializations } from '../data/lawyersData';
import { dummyLawFirms } from '../data/lawFirmsData';
import { greetings, farewells, thanks, acknowledgements, aboutBot, legalInfo, customQA, fallbackResponses, caseTypeKeywords, locationKeywords, advancedLegalInfo, hindiPhrases, proceduralQA, advancedCaseTypeKeywords, nameQueryResponses } from '../data/chatbotData';
import { legalKnowledge, csvQAPairs, topAdvocates, totalCasesProcessed } from '../data/processedLegalData';
import { WaveLayout } from '../components/WaveLayout';
import { getLawyerPhoto, onPhotoError } from '../utils/lawyerPhoto';
import { buildKnowledgeBase, lookupByName, getPlatformAwarenessResponse, getSuggestiveChips } from '../utils/lawyerKnowledgeBase';
import { useLang } from '../context/LanguageContext';

// ── FAQ Data ────────────────────────────────────────────────────────────────
const LAWYER_FAQ = [
  { q: 'How does the AI lawyer matching work?', a: 'Our AI analyses your legal issue, location, budget, and language preference, then scores thousands of lawyers using a real-time smart-match algorithm to find the most relevant advocates for your case.' },
  { q: 'Are the lawyers verified?', a: 'Yes. All lawyers on Lxwyer Up are background-verified. Verified lawyers are marked with a ✓ badge and have submitted their Bar Council registration, qualifications, and practice details.' },
  { q: 'Which areas do you currently serve?', a: 'We currently cover Delhi, Haryana, and Uttar Pradesh (Noida, Gurgaon, Faridabad, Lucknow, Agra and more). We are rapidly expanding to other states.' },
  { q: 'Can I consult a lawyer online?', a: 'Yes! Many lawyers on our platform offer video consultations. Simply mention "video call" or "online consultation" in your message and the AI will filter accordingly.' },
  { q: 'What if I cannot afford a lawyer?', a: 'Say "free legal aid" or "pro bono" and the AI will look for lawyers who offer free or subsidised consultations. You can also approach your District Legal Services Authority (DLSA).' },
  { q: 'How do I book a consultation?', a: 'Once the AI shows your matched lawyers, click "Book Consultation" on any card. You will be guided through a quick signup and appointment booking flow.' },
  { q: 'What types of cases can you help with?', a: 'Criminal law, family & divorce, property disputes, corporate law, labour law, cyber law, consumer protection, tax disputes, immigration, intellectual property, and more.' },
  { q: 'Can I search for a lawyer in Hindi?', a: 'हाँ! आप Hindi में भी बात कर सकते हैं। बस अपना legal issue और city Hindi में बताएं, हमारा AI समझ जाएगा।' },
  { q: 'Is my conversation private?', a: 'Your conversation is processed on secure servers and is not shared with third parties. We do not store identifying personal data from your chat session.' },
  { q: 'What if no lawyer matches my query?', a: 'The AI will ask follow-up questions to narrow down your requirement. You can also browse all lawyers manually by typing "show all lawyers" or clicking the browse button.' },
];

// ── Follow-up question bank ──────────────────────────────────────────────────
const FOLLOWUP_QUESTIONS = [
  { key: 'budget',       text: 'What is your approximate consultation budget?', chips: ['Under ₹1,000', 'Under ₹2,500', 'Under ₹5,000', 'No budget limit'] },
  { key: 'consultType',  text: 'How would you prefer to consult?',             chips: ['Video call', 'In-person meeting', 'Either works'] },
  { key: 'language',     text: 'Which language do you prefer?',                chips: ['English', 'Hindi', 'Both English & Hindi'] },
  { key: 'experience',   text: 'How much experience should the lawyer have?',   chips: ['Any experience', '3+ years', '5+ years', '10+ years'] },
  { key: 'urgency',      text: 'How urgent is your matter?',                   chips: ['Not urgent', 'Within a week', 'Urgent — today/tomorrow'] },
];

// ── Defined OUTSIDE the component so React never remounts existing messages on keystroke ──
const ChatMessage = ({ message, isBot }) => (
  <div className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md flex-shrink-0 ${
      isBot ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-300'
      }`}>
      {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
    </div>
    <div className={`max-w-[82%] rounded-3xl px-5 py-3.5 shadow-sm ${
      isBot
        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
        : 'bg-slate-700 text-white rounded-tr-sm'
      }`}>
      <p className="whitespace-pre-wrap leading-relaxed text-sm break-words">{message.content?.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</p>
    </div>
  </div>
);

const GRADIENTS = [
  'from-black to-black',
];

const ALLOWED_LAWYER_STATES = ['delhi', 'haryana', 'uttar pradesh'];

// ── FAQ Accordion Item ────────────────────────────────────────────────────
const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-slate-800/60 last:border-0"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
const LOCAL_TEXT_AI = {
  en: {
    topMatches: 'TOP MATCHES',
    found: 'Found',
    chat: 'Chat',
    verified: 'Verified',
    experience: 'Experience',
    years: 'Years',
    location: 'Location',
    consultationFee: 'Consultation Fee',
    contactForFee: 'Contact for fee',
    viewProfile: 'View Profile',
    bookNow: 'Book Now',
    showLess: 'Show Less',
    showAllMatches: 'Show all matches',
    browseAllLawyers: 'Browse all lawyers',
    education: 'Education',
    notSpecified: 'Not specified',
    about: 'About',
    noBio: 'No bio available.',
    milestones: 'Milestones & Achievements',
    featured: 'Featured',
    courtExp: 'Court Experience',
    mode: 'Mode',
    videoInPerson: 'Video & In-Person',
    inPerson: 'In-Person',
    videoCall: 'Video Call',
    bookConsultation: 'Book Consultation',
    aiLawyerMatching: 'AI LAWYER MATCHING',
    describeCase: 'Describe your case · find the right advocate',
    matches: 'Matches',
    searchingLawyers: 'Searching lawyers...',
  },
  hi: {
    topMatches: 'शीर्ष मैच',
    found: 'मिले',
    chat: 'चैट',
    verified: 'सत्यापित',
    experience: 'अनुभव',
    years: 'वर्ष',
    location: 'स्थान',
    consultationFee: 'परामर्श शुल्क',
    contactForFee: 'शुल्क के लिए संपर्क करें',
    viewProfile: 'प्रोफ़ाइल देखें',
    bookNow: 'अभी बुक करें',
    showLess: 'कम दिखाएं',
    showAllMatches: 'सभी मैच दिखाएं',
    browseAllLawyers: 'सभी वकील ब्राउज़ करें',
    education: 'शिक्षा',
    notSpecified: 'उल्लेखित नहीं है',
    about: 'के बारे में',
    noBio: 'कोई बायो उपलब्ध नहीं है।',
    milestones: 'मील के पत्थर और उपलब्धियां',
    featured: 'विशेष रुप से प्रदर्शित',
    courtExp: 'अदालत का अनुभव',
    mode: 'मोड',
    videoInPerson: 'वीडियो और व्यक्तिगत रूप से',
    inPerson: 'व्यक्तिगत रूप से',
    videoCall: 'वीडियो कॉल',
    bookConsultation: 'परामर्श बुक करें',
    aiLawyerMatching: 'एआई वकील मिलान',
    describeCase: 'अपने मामले का वर्णन करें · सही वकील खोजें',
    matches: 'मैच',
    searchingLawyers: 'वकील खोज रहे हैं...',
  }
};

export default function FindLawyerAI({ hideNavbar = false, embedded = false }) {
  const { t, lang, setLang } = useLang();
  const d = LOCAL_TEXT_AI[lang] || LOCAL_TEXT_AI.en;
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState('chat'); // 'chat' | 'matches'
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI legal assistant. We operate in Delhi, Haryana, and Uttar Pradesh. Tell me about your legal issue and city, and I'll find the right lawyer for you.\n\nFor example: \"I need a criminal lawyer in Delhi with more than 3 years of experience\"",
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedLawyers, setRecommendedLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showAllLawyers, setShowAllLawyers] = useState(false);
  const [allLawyersList, setAllLawyersList] = useState(dummyLawyers);
  const [quickChips, setQuickChips] = useState([]);
  const [followUpQueue, setFollowUpQueue] = useState([]);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [showFAQ, setShowFAQ] = useState(false);
  const [loadingText, setLoadingText] = useState(t('ai_searching') || 'Searching lawyers...');
  // Live-training index built from fetched backend lawyers
  const [liveIndex, setLiveIndex] = useState({ cities: new Set(), specs: new Set(), specCityMap: {} });
  // Full knowledge base — seeded from dummy data immediately, enriched after backend fetch
  const [knowledgeBase, setKnowledgeBase] = useState(() => buildKnowledgeBase(dummyLawyers));
  // Multi-turn memory
  const [memory, setMemory] = useState({ caseType: null, location: null, budget: null, language: null, consultType: null, urgent: false });
  // Suggestive chips from typing
  const [typingChips, setTypingChips] = useState([]);
  const suggestDebounceRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch verified lawyers from backend for fallback display
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await axios.get(`${API}/lawyers`);
        const formattedDbLawyers = response.data.map(lawyer => ({
          ...lawyer,
          id: lawyer.id || lawyer._id,
          name: lawyer.full_name || lawyer.name,
          experience: lawyer.experience_years || lawyer.experience || 5,
          education: lawyer.education || 'Legal Qualification',
          photo: getLawyerPhoto(lawyer.photo, lawyer.full_name || lawyer.name),
          feeMin: lawyer.consultation_fee || 2000,
          feeMax: lawyer.consultation_fee ? lawyer.consultation_fee * 2 : 5000,
          fee: lawyer.consultation_fee || lawyer.fee_range || 'Contact for fee',
          consultation_preferences: lawyer.consultation_preferences || 'video',
          languages: lawyer.languages || ['English'],
          rating: 4.8,
          verified: lawyer.is_approved || lawyer.status === 'approved' || lawyer.verified === true,
          secondarySpecializations: [],
          casesWon: lawyer.cases_won || 50,
          featured: false
        }));
        
        let formattedDbFirms = [];
        try {
          const firmResponse = await axios.get(`${API}/lawfirms`);
          formattedDbFirms = firmResponse.data.map(firm => ({
            ...firm,
            id: firm.id || firm._id,
            name: firm.firm_name || firm.name,
            isFirm: true,
            city: firm.city,
            state: firm.state,
            practiceAreas: firm.practice_areas || [],
            lawyersCount: firm.total_lawyers || 0,
            description: firm.description || 'No description provided',
            image: firm.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
            unique_id: firm.unique_id,
            feeMin: firm.min_fee || firm.consultation_fee,
          }));
        } catch (e) { }

        const mappedDummyFirms = dummyLawFirms.map(f => ({ ...f, isFirm: true }));
        const merged = [...formattedDbLawyers, ...dummyLawyers, ...formattedDbFirms, ...mappedDummyFirms];
        setAllLawyersList(merged);

        // ── AUTO-TRAIN: build live index from backend data ──────────────────
        const cities = new Set();
        const specs  = new Set();
        const specCityMap = {};
        merged.forEach(l => {
          if (l.city)  cities.add(l.city.toLowerCase());
          if (l.state) cities.add(l.state.toLowerCase());
          if (l.specialization) {
            specs.add(l.specialization.toLowerCase());
            if (l.city) {
              const key = l.specialization.toLowerCase();
              if (!specCityMap[key]) specCityMap[key] = new Set();
              specCityMap[key].add(l.city);
            }
          }
          (l.secondarySpecializations || []).forEach(s => specs.add(s.toLowerCase()));
          (l.practiceAreas || []).forEach(s => specs.add(s.toLowerCase()));
        });
        setLiveIndex({ cities, specs, specCityMap });

        // ── BUILD FULL KNOWLEDGE BASE for name queries & platform awareness ──
        const kb = buildKnowledgeBase(merged);
        setKnowledgeBase(kb);
      } catch (error) {
        console.error('Error fetching lawyers:', error);
      }
    };
    fetchLawyers();
  }, []);


  // Data-driven case type detection — uses liveIndex for real-time enrichment
  const detectCaseType = (message) => {
    const msg = message.toLowerCase();

    // First pass: check live specialisation index from backend data
    for (const spec of liveIndex.specs) {
      const words = spec.split(/\s+/);
      if (words.every(w => msg.includes(w))) {
        // Capitalise each word to match the stored format
        const canonical = spec.replace(/\b\w/g, c => c.toUpperCase());
        return canonical;
      }
    }

    // Second pass: hardcoded keyword bank
    for (const [caseType, keywords] of Object.entries(caseTypeKeywords)) {
      for (const kw of keywords) {
        if (kw.length <= 4 || ['bail', 'fir', 'ed', 'tax', 'esi', 'pf', 'oc', 'pod', 'npa', 'ibc'].includes(kw)) {
          const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(msg)) return caseType;
        } else {
          if (msg.includes(kw)) return caseType;
        }
      }
    }

    // Third pass: advanced training keywords
    for (const [caseType, keywords] of Object.entries(advancedCaseTypeKeywords)) {
      if (keywords.some(kw => msg.includes(kw))) return caseType;
    }

    // Extended keyword bank trained on common Indian legal queries
    const extendedKeywords = {
      'Criminal Law': ['murder','robbery','extortion','cheating','fraud','assault','rape','kidnap','abduction','dowry','domestic violence','attempt to murder','hurt','grievous','dacoity','theft','possession','ndps','narcotics','drugs','eve teasing','stalking','sexual harassment','pocso','cybercrime','blackmail','forgery','counterfeit','bribe','corruption','money laundering','pcm act'],
      'Family Law': ['matrimonial','custody','visitation','alimony','maintenance','guardianship','adoption','succession','inheritance','will','probate','domestic dispute','marital','conjugal','restitution','desertion','cruelty','dowry harassment','498a'],
      'Property Law': ['land','plot','flat','apartment','registry','mutation','conveyance deed','sale deed','encroachment','possession','eviction','rent','landlord','tenant','lease','licence','trespassing','easement','khata','khasra','revenue','zameen','ghar','makaan','shop','commercial property','boundary dispute','partition'],
      'Corporate Law': ['company','incorporation','compliance','board','director','shareholder','equity','merger','acquisition','demerger','joint venture','mou','nda','contract','agreement','llp','partnership','sebi','regulatory','annual return','incorporation','gst registration','startup','due diligence'],
      'Labour Law': ['employment','employee','employer','termination','dismissal','retrenchment','layoff','salary','wages','pf','epf','esic','gratuity','bonus','leave','maternity','sexual harassment at workplace','posh','labour court','industrial dispute','union','contract labour'],
      'Consumer Law': ['consumer forum','consumer court','deficiency of service','product defect','compensation','refund','cheat','mislead','fraud purchase','online shopping','ecommerce','unfair trade','warranty','guarantee'],
      'Cyber Law': ['cyber','hacking','phishing','data breach','identity theft','online fraud','social media','stalking online','deepfake','digital','it act','computer crime','ransomware','malware'],
      'Tax Law': ['income tax','itr','notice','demand','gst','tds','tax evasion','assessment','appeal','tribunal','tax raid','benami','black money','advance tax'],
      'Immigration Law': ['visa','passport','oci','nri','citizenship','refugee','asylum','deportation','work permit','immigration','foreign national'],
      'Intellectual Property': ['trademark','copyright','patent','design','trade secret','infringement','licensing','royalty','ip'],
      'Debt Recovery': ['loan','recovery','npa','bank','emi','default','cheque bounce','dishonour','negotiable instrument','debt','drt','sarfaesi','auction','property seizure'],
      'Environmental Law': ['pollution','environment','ecb','ngt','forest','wildlife','green','waste','emission'],
      'Arbitration': ['arbitration','mediation','conciliation','dispute resolution','adr','arbitral','award','commercial dispute'],
    };
    for (const [caseType, keywords] of Object.entries(extendedKeywords)) {
      if (keywords.some(kw => msg.includes(kw))) return caseType;
    }

    return null;
  };

  // Emotional / non-legal message detection — respond with empathy, not legal info
  const getEmotionalResponse = (message) => {
    const msg = message.toLowerCase().trim();
    // Stress / anxiety / overwhelm — most common false trigger
    if (/\b(stress|stressed|anxious|anxiety|worried|overwhelmed|panicking|panic|scared|fear|afraid|nervous|depressed|depression|sad|upset|frustrated|helpless|hopeless|exhausted|burnt out|mental health|not okay|not fine|struggling|rough day|tough time|hard time)\b/i.test(msg)) {
      return `I hear you — it sounds like you're going through a tough time. 💙\n\nI'm a legal AI assistant, so I can't provide mental health support, but here are some helpful resources:\n\n📞 **iCall Helpline**: 9152987821\n📞 **Vandrevala Foundation**: 1860-2662-345 (24/7)\n📞 **Vandrevala (WhatsApp)**: +91-1800-2333-330\n\nIf you also have a **legal problem** causing your stress — property, family, job, or anything else — I can help find the right lawyer. Just describe your legal issue! 🙏`;
    }
    // Anger / vent
    if (/\b(angry|furious|mad|hate|upset with|so done|cheated|betrayed|screwed|ripped off)\b/i.test(msg) && !/\blawyer\b|\bcase\b|\bcourt\b/i.test(msg)) {
      return `I understand you're frustrated. 😔 If someone has wronged you legally — cheated you, harassed you, or violated your rights — I can find the right lawyer to help you fight back.\n\nJust tell me:\n• What happened?\n• Which city are you in?\n\nI'll match you with the right advocate!`;
    }
    return null;
  };

  // Location detection — enriched by live city index from backend data
  const detectLocation = (message) => {
    const msg = message.toLowerCase();

    // Check live cities from backend first (most precise)
    for (const city of liveIndex.cities) {
      if (msg.includes(city)) {
        const formatted = city.replace(/\b\w/g, c => c.toUpperCase());
        return { city: formatted, state: formatted };
      }
    }

    // Fallback: static keyword bank
    const sorted = Object.entries(locationKeywords).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of sorted) {
      if (msg.includes(key)) return value;
    }
    return null;
  };

  // Budget / fee detection
  const detectBudget = (message) => {
    // Strip commas from numbers to handle inputs like "2,500"
    const msg = message.toLowerCase().replace(/(\d),(\d)/g, '$1$2');
    if (msg.includes('free') || msg.includes('no fee') || msg.includes('pro bono')) return { max: 0, label: 'Free / Pro Bono' };
    if (msg.includes('budget') || msg.includes('affordable') || msg.includes('cheap') || msg.includes('low cost')) return { max: 2000, label: 'Budget-Friendly (under ₹2,000)' };
    const underMatch = msg.match(/(?:under|max|maximum|below)\s*(?:rs\.?|₹|inr|-)?\s*(\d+)/i) || msg.match(/(?:rs\.?|₹|inr)\s*(\d+)\s*(?:or\s*less|max)/i);
    if (underMatch) return { max: parseInt(underMatch[1]), label: `Under ₹${parseInt(underMatch[1]).toLocaleString()}` };
    return null;
  };

  // Language detection
  const detectLanguage = (message) => {
    const msg = message.toLowerCase();
    if (/[\u0900-\u097F]/.test(message)) return 'Hindi';
    const hindiKeywords = ['hindi', 'vakil', 'vakeel', 'kanoon', 'madad', 'mujhe', 'mera', 'meri', 'chahiye', 'lawyer chahiye', 'nyay', 'adaalat', 'namaste', 'namaskar'];
    if (hindiKeywords.some(kw => msg.includes(kw))) return 'Hindi';
    const otherLangs = { 'tamil': 'Tamil', 'telugu': 'Telugu', 'bengali': 'Bengali', 'marathi': 'Marathi', 'gujarati': 'Gujarati', 'kannada': 'Kannada', 'malayalam': 'Malayalam', 'punjabi': 'Punjabi', 'english': 'English' };
    for (const [kw, lang] of Object.entries(otherLangs)) {
      if (msg.includes(kw)) return lang;
    }
    return null;
  };

  // Hindi conversational replies
  const getHindiResponse = (message) => {
    const msg = message.toLowerCase();
    const isHindi = /[\u0900-\u097F]/.test(message) || ['vakil', 'kanoon', 'madad', 'chahiye', 'mujhe', 'mera'].some(kw => msg.includes(kw));
    if (!isHindi) return null;
    if (['namaste', 'namaskar', 'hello', 'hi'].some(kw => msg.includes(kw)))
      return 'नमस्ते! 🙏 मैं आपका AI legal assistant हूँ। हम Delhi, Haryana और Uttar Pradesh में verified lawyers से connect करते हैं। आपको किस तरह की legal help चाहिए?';
    if (msg.includes('vakil') || msg.includes('vakeel') || msg.includes('lawyer'))
      return 'हम आपके लिए सही vakeel ढूंढेंगे। कृपया बताएं — आपका case किस बारे में है? (जैसे: criminal, family, property, divorce, bail, FIR) और आप किस city में हैं?';
    if (msg.includes('madad') || msg.includes('help chahiye') || msg.includes('problem'))
      return 'हम आपकी madad ज़रूर करेंगे! 🤝 बताइए — आपको किस तरह की legal problem है और आप Delhi, Haryana या UP में कहाँ हैं?';
    if (msg.includes('bail') || msg.includes('thana') || msg.includes('police'))
      return 'समझते हैं — यह serious matter है। हम आपको Delhi, Haryana या UP में criminal lawyers से connect कर सकते हैं। आप किस city में हैं?';
    if (msg.includes('divorce') || msg.includes('talaq') || msg.includes('family'))
      return 'Family law matters के लिए हमारे पास experienced vakeel हैं। आप किस city में हैं — Delhi, Gurgaon, Noida, या कोई और जगह?';
    if (msg.includes('property') || msg.includes('zameen') || msg.includes('ghar'))
      return 'Property disputes के लिए हमारे पास expert lawyers हैं। आपका property matter किस city में है?';
    if (msg.includes('paisa') || msg.includes('fees') || msg.includes('kitna'))
      return 'Lawyers की fees case और experience के हिसाब से अलग होती है। आम तौर पर consultation ₹500 – ₹5,000 तक होती है। पहले बताएं — आपको किस type का lawyer चाहिए?';
    return 'समझ गया! 😊 कृपया थोड़ा और बताएं — आपका legal issue क्या है और आप किस city में हैं? (Delhi, Haryana, या Uttar Pradesh)';
  };

  // Consultation type detection
  const detectConsultType = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('in person') || msg.includes('in-person') || msg.includes('offline') || msg.includes('visit')) return 'in_person';
    if (msg.includes('video') || msg.includes('online') || msg.includes('virtual') || msg.includes('zoom')) return 'video';
    if (msg.includes('both') || msg.includes('either')) return 'both';
    return null;
  };

  // Urgency detection
  const detectUrgency = (message) => {
    return /\burgent\b|\bemergency\b|\basap\b|\bimmediately\b|\bright away\b|\btoday\b/.test(message.toLowerCase());
  };

  // Session ID for seeded jitter (stable per browser session)
  const sessionId = useRef(Math.random().toString(36).slice(2)).current;

  // ── BACKEND SMART MATCH ────────────────────────────────────────────────────
  const smartMatchLawyers = async (query) => {
    try {
      const res = await axios.post(`${API}/smart-match/lawyers`, {
        query,
        session_id: sessionId,
      });
      return res.data; // { results, total_found, query_summary }
    } catch (err) {
      console.error('Smart match API error:', err);
      return null;
    }
  };

  // Fallback: local client-side match (when backend unavailable)
  const predictLawyerMatch = (userQuery, lawyer) => {
    let score = 0;
    const query = userQuery.toLowerCase();
    const factors = [];

    const caseType = detectCaseType(userQuery);
    if (caseType && (lawyer.specialization === caseType || (lawyer.practiceAreas && lawyer.practiceAreas.includes(caseType)))) { score += 40; factors.push('Specialization Match'); }
    else if (caseType && lawyer.secondarySpecializations?.includes(caseType)) { score += 25; factors.push('Related Spec'); }

    const location = detectLocation(userQuery);
    if (location) {
      if (location.city && lawyer.city === location.city) { score += 30; factors.push('City Match'); }
      else if (lawyer.state === location.state) { score += 20; factors.push('State Match'); }
    }

    score += (lawyer.rating / 5) * 10;
    score += Math.min(lawyer.experience, 20) / 2;
    if (lawyer.verified) { score += 5; factors.push('Verified'); }

    return { score: Math.max(0, Math.min(Math.round(score), 99)), factors };
  };

  // Shuffle utility — Fisher-Yates
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Data-driven conversational response (reads from chatbotData.js)
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const getConversationalResponse = (message) => {
    const msg = message.toLowerCase().trim();

    // Check greetings
    if (greetings.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) {
      return pick(greetings.responses);
    }
    // Check farewells
    if (farewells.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) {
      return pick(farewells.responses);
    }
    // Check thanks
    if (thanks.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) {
      return pick(thanks.responses);
    }
    // Check acknowledgements
    if (acknowledgements.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) {
      return pick(acknowledgements.responses);
    }
    // Check about bot
    if (aboutBot.keywords.some(kw => msg.includes(kw))) {
      return pick(aboutBot.responses);
    }
    return null;
  };

  // Check legal knowledge Q&A (used as fallback only when no lawyer search happens)
  const getLegalKnowledgeResponse = (message) => {
    const msg = message.toLowerCase().trim();

    // ── NEW: Advanced legal info (UPI fraud, POCSO, NRI law, etc.) ──────────
    for (const item of advancedLegalInfo) {
      if (item.keywords.some(kw => msg.includes(kw))) return pick(item.responses);
    }
    // ── NEW: Hindi phrase training ───────────────────────────────────────────
    for (const item of hindiPhrases) {
      if (item.keywords.some(kw => msg.includes(kw))) return pick(item.responses);
    }
    // ── NEW: Procedural Q&A ─────────────────────────────────────────────────
    for (const item of proceduralQA) {
      if (item.keywords.some(kw => msg.includes(kw))) return pick(item.responses);
    }
    // Check legal info Q&A
    for (const item of legalInfo) {
      if (item.keywords.some(kw => msg.includes(kw))) return pick(item.responses);
    }
    // Check custom Q&A
    for (const item of customQA) {
      if (item.keywords.some(kw => msg.includes(kw))) return pick(item.responses);
    }
    // Check CSV-generated Q&A pairs
    if (csvQAPairs) {
      for (const item of csvQAPairs) {
        if (item.keywords.some(kw => msg.includes(kw))) return pick(item.responses);
      }
    }
    return null;
  };

  // ── Name query detection using live KB ─────────────────────────────────────
  const getNameQueryResponse = (message) => {
    if (!knowledgeBase) return null;
    const nameResult = lookupByName(knowledgeBase, message);
    if (!nameResult.extractedName) return null;

    if (nameResult.found && nameResult.results.length > 0) {
      // Set them as recommended lawyers so the cards render
      const formatted = nameResult.results.map(l => ({
        ...l,
        matchBadges: ['Name Match'],
        score: 99,
      }));
      setRecommendedLawyers(formatted);
      const plural = nameResult.results.length > 1 ? 's' : '';
      return `${nameQueryResponses.found(nameResult.results, nameResult.extractedName)}\n\n✅ Showing ${nameResult.results.length} lawyer${plural} in the panel →`;
    }
    // Name not found — helpful fallback
    const currentSpec = memory.caseType;
    return nameQueryResponses.notFound(nameResult.extractedName) + (currentSpec ? `\n\nShowing verified ${currentSpec} lawyers instead.` : '');
  };

  // Get legal context from CSV data for a case type
  const getLegalContext = (caseType) => {
    // Direct lookup first
    let knowledge = legalKnowledge[caseType];

    // Fallback data for case types not in processedLegalData
    if (!knowledge) {
      const fallbackKnowledge = {
        'Family Law': {
          count: 50,
          sample_sections: [
            'Section 13 of Hindu Marriage Act',
            'Section 498a IPC',
            'Article 21',
            'Section 125 of Criminal Procedure Code',
            'Section 24 of Hindu Marriage Act',
            'Section 9 of Hindu Marriage Act',
            'Section 25 of Hindu Marriage Act',
            'Section 26 of Hindu Marriage Act',
            'Section 27 of Hindu Marriage Act',
            'Section 13b of Hindu Marriage Act'
          ],
          sample_cases: [
            'Sunitha K.R vs State Of Kerala on 17 January, 2011',
            'Dr Suroor V vs Adi Chunchanagiri on 7 March, 2008',
            'Daulat P Bhatia vs State Of Karnataka on 25 August, 2010',
            'Itticheriyan vs State Of Kerala on 18 October, 2010',
            'Prasanna Kumar vs State Of Kerala on 8 April, 2010'
          ]
        },
        'Intellectual Property': {
          count: 35,
          sample_sections: [
            'Section 29 of Trade Marks Act',
            'Section 51 of Copyright Act',
            'Section 48 of Patents Act',
            'Section 134 of Trade Marks Act',
            'Section 2 of Designs Act',
            'Section 63 of Copyright Act',
            'Section 104 of Patents Act',
            'Section 135 of Trade Marks Act'
          ],
          sample_cases: [
            'Yahoo Inc. vs Akash Arora on 19 February, 1999',
            'Cadila Healthcare vs Cadila Pharmaceuticals on 26 March, 2001',
            'Novartis AG vs Union Of India on 1 April, 2013',
            'Super Cassettes Industries vs Myspace Inc. on 23 June, 2017',
            'Bayer Corporation vs Union Of India on 12 March, 2014'
          ]
        },
        'Immigration Law': {
          count: 25,
          sample_sections: [
            'Section 3 of Citizenship Act',
            'Section 5 of Passports Act',
            'Section 3 of Foreigners Act',
            'Section 9 of Citizenship Act',
            'Section 14a of Foreigners Act',
            'Section 6 of Citizenship Act'
          ],
          sample_cases: [
            'National Human Rights Commission vs State Of Arunachal Pradesh on 9 January, 1996',
            'Sarbananda Sonowal vs Union Of India on 12 July, 2005',
            'Louis De Raedt vs Union Of India on 14 February, 1991',
            'Hans Muller vs Superintendent Presidency Jail on 3 May, 1955'
          ]
        }
      };
      knowledge = fallbackKnowledge[caseType];
    }

    if (!knowledge) return '';
    let context = '';
    if (knowledge.sample_sections && knowledge.sample_sections.length > 0) {
      context += `\n📚 Relevant Legal Provisions:\n`;
      knowledge.sample_sections.slice(0, 6).forEach(sec => {
        context += `• ${sec}\n`;
      });
    }
    return context;
  };

  // ── Suggestive chips as user types (debounced) ──────────────────────────────
  const handleInputChange = (val) => {
    setInputMessage(val);
    setTypingChips([]);
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    if (!val.trim() || val.length < 3 || !knowledgeBase) return;
    suggestDebounceRef.current = setTimeout(() => {
      const chips = getSuggestiveChips(knowledgeBase, val, memory);
      setTypingChips(chips);
    }, 280);
  };

  const handleSendMessage = async (overrideMsg) => {
    const raw = overrideMsg || inputMessage;
    if (!raw.trim() || isLoading) return;
    const userMessage = raw.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);
    setQuickChips([]);
    setTypingChips([]);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800));

    // STEP -1: Emotional / wellbeing check FIRST — stops false-positive legal matches
    const emotionalReply = getEmotionalResponse(userMessage);
    if (emotionalReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: emotionalReply }]);
      setIsLoading(false);
      return;
    }

    // STEP 0A: Name-based query ("who is Sarthak", "find lawyer named Priya")
    const nameReply = getNameQueryResponse(userMessage);
    if (nameReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: nameReply }]);
      setIsLoading(false);
      return;
    }

    // STEP 0A: Name lookup (who is Prateek Sharma?)
    if (knowledgeBase) {
      const nameCheck = lookupByName(knowledgeBase, userMessage);
      if (nameCheck.found && nameCheck.results.length > 0) {
        setRecommendedLawyers(nameCheck.results.map(r => ({
          ...r,
          id: r.id || r._id,
          name: r.name || r.full_name || r.firm_name || '',
          experience: r.experience_years || r.experience || 0,
          specialization: Array.isArray(r.specialization) ? r.specialization[0] : (r.specialization || 'Lawyer'),
          feeMin: typeof r.consultation_fee === 'string' ? parseInt(r.consultation_fee.replace(/\D/g, '')) || 0 : (r.consultation_fee || r.feeMin || 0),
          fee: r.consultation_fee || r.fee,
          photo: getLawyerPhoto(r.photo, r.name),
          verified: r.is_approved || r.verified || false,
          rating: r.rating || 4.8,
          matchBadges: ['Name Match'],
          score: 100,
        })));
        setShowAllLawyers(false);
        setMessages(prev => [...prev, { role: 'assistant', content: `Here is the profile and details for **${nameCheck.extractedName.replace(/\b\w/g, c => c.toUpperCase())}** you asked about! 👇` }]);
        setIsLoading(false);
        return;
      } else if (nameCheck.extractedName) {
        // Name extracted but not found in DB
        setMessages(prev => [...prev, { role: 'assistant', content: `I'm sorry, but I couldn't find any lawyer or law firm named "**${nameCheck.extractedName.replace(/\b\w/g, c => c.toUpperCase())}**" in our current verified database.\n\nHowever, I can still help you find the right advocate. What kind of legal issue do you need help with?` }]);
        setQuickChips(['Criminal lawyer', 'Property dispute', 'Divorce lawyer']);
        setIsLoading(false);
        return;
      }
    }

    // STEP 0B: Platform-awareness query ("how many lawyers do you have", "which cities")
    if (knowledgeBase) {
      const platformReply = getPlatformAwarenessResponse(knowledgeBase, userMessage);
      if (platformReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: platformReply }]);
        setQuickChips(['Criminal lawyers Delhi', 'Property lawyer Noida', 'Show all specializations']);
        setIsLoading(false);
        return;
      }
    }

    // STEP 0C: Hindi language check
    const hindiReply = getHindiResponse(userMessage);
    if (hindiReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: hindiReply }]);
      setIsLoading(false);
      return;
    }

    // STEP 1: Conversational shortcuts
    const convoReply = getConversationalResponse(userMessage);
    if (convoReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: convoReply }]);
      setIsLoading(false);
      return;
    }

    // Show-all shortcut
    if (/show all|browse all|see all|all lawyers/i.test(userMessage)) {
      navigate('/find-lawyer/manual');
      setIsLoading(false);
      return;
    }

    // STEP 2: Detect all intents — merge with memory for multi-turn
    const newCaseType   = detectCaseType(userMessage);
    const newLocation   = detectLocation(userMessage);
    const newBudget     = detectBudget(userMessage);
    const newLang       = detectLanguage(userMessage);
    const newConsult    = detectConsultType(userMessage);
    const isUrgent      = detectUrgency(userMessage);
    const expMatch      = userMessage.match(/(\d+)\+?\s*(?:year|yr)s?/i);
    const requiredExp   = expMatch ? parseInt(expMatch[1], 10) : null;

    const caseType    = newCaseType   || memory.caseType;
    const location    = newLocation   || memory.location;
    const budget      = newBudget     || memory.budget;
    const language    = newLang       || memory.language;
    const consultType = newConsult    || memory.consultType;
    const urgent      = isUrgent      || memory.urgent;

    // Update memory
    setMemory({ caseType, location, budget, language, consultType, urgent });

    // Informational intent check — if the user is clearly asking for information
    // (not for a lawyer), route to Q&A FIRST before lawyer matching
    const isInfoQuery = /^(what|how|why|when|can i|is it|explain|tell me|what is|who can|what happens|what are|help me understand|tips|advice|rights|steps|process|procedure|document|duration|timeline|legal process|guide|how long|how to|what should)/i.test(userMessage.trim()) && !/\b(near me|in delhi|in noida|in mumbai|find|lawyer|advocate|vakeel|recommend|suggest)/i.test(userMessage);

    if (isInfoQuery) {
      const knowledgeReply = getLegalKnowledgeResponse(userMessage);
      if (knowledgeReply) {
        const caseContext = caseType ? `\n\n💼 Need a ${caseType} lawyer? Tell me your city and I'll match you!` : '';
        setMessages(prev => [...prev, { role: 'assistant', content: knowledgeReply + caseContext }]);
        if (caseType) setQuickChips([`Find ${caseType} lawyer in Delhi`, `Find ${caseType} lawyer in Noida`, 'Tell me more']);
        setIsLoading(false);
        return;
      }
    }

    // STEP 3: Run matching if we have at least one signal
    if (caseType || location || budget || language || consultType) {

      // ── Backend smart match ──────────────────────────────────────────────
      const backendResult = await smartMatchLawyers(userMessage);

      let enriched = [];

      if (backendResult && backendResult.results && backendResult.results.length > 0) {
        // Map backend results to the card format the UI expects
        enriched = backendResult.results.map(r => ({
          ...r,
          id: r.id,
          name: r.name,
          experience: r.experience,
          specialization: r.specialization,
          city: r.city,
          state: r.state,
          feeMin: typeof r.fee === 'string' ? parseInt(String(r.fee).split('-')[0].replace(/\D/g, '')) || 0 : (r.fee || 0),
          fee: r.fee,
          languages: r.languages || ['English'],
          photo: getLawyerPhoto(r.photo, r.name),
          verified: r.verified,
          rating: 4.8,
          matchBadges: r.match_reasons || [],
          score: r.score,
        }));
      }

      // ── Always merge local client-side matching to ensure rich dummy data ──────────────────────────
      const basePool = allLawyersList.filter(l => {
        const loc = ((l.state || '') + ' ' + (l.city || '')).toLowerCase();
        return ALLOWED_LAWYER_STATES.some(s => loc.includes(s));
      });

        const scoredLawyers = basePool.map(lawyer => {
          const prediction = predictLawyerMatch(userMessage, lawyer);
          return { ...lawyer, ...prediction };
        });

        const localEnriched = scoredLawyers
          .filter(l => {
            const specMatch  = caseType && (l.specialization === caseType || l.secondarySpecializations?.includes(caseType));
            const locMatch   = location && ((location.city && l.city === location.city) || (location.state && l.state === location.state));
            const expReq     = requiredExp ? l.experience >= requiredExp : true;
            const budgetReq  = budget ? ((l.feeMin || 0) <= budget.max || budget.max === 0) : true;
            const langReq    = language ? (l.languages || []).some(lg => lg.toLowerCase().includes(language.toLowerCase())) : true;
            const consultReq = consultType && consultType !== 'both'
              ? (l.consultation_preferences === consultType || l.consultation_preferences === 'both')
              : true;

            let baseMatch = true;
            if (caseType && location) baseMatch = specMatch && locMatch;
            else if (caseType) baseMatch = specMatch;
            else if (location) baseMatch = locMatch;

            return baseMatch && expReq && budgetReq && langReq && consultReq;
          })
          .sort((a, b) => {
            if (urgent) return (b.experience || 0) - (a.experience || 0);
            if (b.score === a.score) return Math.random() - 0.5;
            return b.score - a.score;
          })
          .map(l => {
            const badges = [];
            if (caseType && (l.specialization === caseType)) badges.push('Specialization');
            if (location && l.city === location.city) badges.push('Location');
            if (budget && (l.feeMin || 0) <= budget.max) badges.push('Budget');
            if (language) badges.push('Language');
            if (urgent) badges.push('Urgent');
            return { ...l, matchBadges: badges };
          })
          .slice(0, 15);
          
      // Merge, filter out duplicates, and ensure robust UI
      const combined = [...enriched, ...localEnriched];
      enriched = Array.from(new Map(combined.map(item => [item.id || item._id, item])).values());

      // --- NEW: Universal Shuffling and Signature Priority Algorithm ---
      // We take the matches (either from backend or fallback), shuffle them randomly,
      // and ensure exactly up to 3 signature lawyers appear at the top.
      if (enriched.length > 0) {
        const shuffled = [...enriched].sort(() => Math.random() - 0.5);
        const signatureList = shuffled.filter(l => l.isSignature || String(l.package).toLowerCase() === 'signature' || String(l.plan).toLowerCase() === 'signature');
        const normalList = shuffled.filter(l => !(l.isSignature || String(l.package).toLowerCase() === 'signature' || String(l.plan).toLowerCase() === 'signature'));
        
        const topSig = signatureList.slice(0, 3);
        const remainingSlots = Math.max(0, enriched.length - topSig.length);
        const fillers = normalList.slice(0, remainingSlots);
        
        enriched = [...topSig, ...fillers];
      }

      let responseContent = '';
      if (enriched.length > 0) {
        const total = backendResult?.total_found || enriched.length;
        const locationText = location ? (location.city || location.state) : (backendResult?.query_summary?.location?.city || 'India');
        const caseText = caseType || (language ? `${language}-speaking lawyers` : 'your request');
        const askedForBest = /\b(best|top|greatest|good)\b/i.test(userMessage);
        
        responseContent = `I’ve gathered some excellent matches for you! Here are the top ${enriched.length} highly rated ${caseText.toLowerCase()} experts in ${locationText} that fit your needs.\n\n`;
        
        const requirements = [];
        if (budget) requirements.push(`${budget.label || `Under ₹${budget}`}`);
        if (language) requirements.push(`${language}`);
        if (requiredExp) requirements.push(`${requiredExp}+ years exp`);
        if (urgent) requirements.push(`Urgent Help`);
        if (consultType) requirements.push(`${consultType === 'in_person' ? 'In-Person' : consultType === 'video' ? 'Video Call' : 'Any mode'}`);
        if (requirements.length) responseContent += `*Applied filters: ${requirements.join(' · ')}*\n\n`;

        if (caseType) { const ctx = getLegalContext(caseType); if (ctx) responseContent += ctx; }
        
        responseContent += `\nYou can view their verified profiles in the panel. Let me know if you want to refine this list further!`;
        setRecommendedLawyers(enriched);
        setShowAllLawyers(false);

        // Build follow-up queue — only for fields not yet collected
        const missingFollowUps = FOLLOWUP_QUESTIONS.filter(fq => {
          if (fq.key === 'budget' && budget) return false;
          if (fq.key === 'consultType' && consultType) return false;
          if (fq.key === 'language' && language) return false;
          if (fq.key === 'urgency' && urgent) return false;
          return true;
        }).slice(0, 2); // ask at most 2 follow-ups

        setFollowUpQueue(missingFollowUps);
        setFollowUpIndex(0);

        // Schedule first follow-up as chips
        if (missingFollowUps.length > 0) {
          setQuickChips(missingFollowUps[0].chips);
        } else {
          setQuickChips(['Show all lawyers', 'Book consultation', 'New search']);
        }
      } else if (caseType && !location) {
        responseContent = `I understand you need help with ${caseType}.\n\nPlease also mention your location.\nExample: "${caseType.replace(' Law', '')} lawyer in Delhi"`;
        const ctx = getLegalContext(caseType);
        if (ctx) responseContent += `\n\nMeanwhile:${ctx}`;
      } else if (!caseType && location) {
        const locationText = location.city || location.state;
        responseContent = `Got it, you're in ${locationText}.\n\nWhat's your legal issue?\nExample: "Property dispute" or "Divorce case"`;
      } else {
        responseContent = `I'm sorry, I couldn't find a lawyer exactly matching your criteria. However, we have highly qualified Criminal Lawyers in Delhi, Property Lawyers in Noida, and Family Lawyers in Mumbai. Would any of those help? Or type "show all" to browse our complete directory.`;
        setQuickChips(['Show all lawyers', 'Criminal lawyer Delhi', 'Property dispute Noida']);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
      setIsLoading(false);
      return;
    }

    // STEP 4: Legal Q&A fallback
    const knowledgeReply = getLegalKnowledgeResponse(userMessage);
    if (knowledgeReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: knowledgeReply }]);
      setIsLoading(false);
      return;
    }

    // STEP 5: Honest fallback — don't guess or misdirect
    const msg = userMessage.toLowerCase().trim();
    const isVeryShort = userMessage.trim().split(' ').length <= 3;
    const honestFallback = isVeryShort
      ? `I'm not sure what you meant by "${userMessage}". Could you be more specific?\n\nYou can ask me:\n• Legal questions (e.g. "How do I file an FIR?")\n• Find a lawyer (e.g. "Property lawyer in Delhi")\n• About your rights (e.g. "What are my rights if arrested?")`
      : `I'm sorry, I don't have a clear answer for that specific question. I'm a **legal AI assistant** — I work best when you ask me about:\n\n⚖️ **Find lawyers** — "Divorce lawyer in Delhi"\n📚 **Legal info** — "What is FIR?", "How to get bail?"\n🔍 **Your rights** — "Rights if arrested", "Tenant rights"\n💼 **Case types** — Property, Criminal, Family, Corporate, Tax\n\nIf your question is outside legal topics, I'd recommend consulting a general resource. I'd rather be honest than give you wrong information!`;
    setMessages(prev => [...prev, { role: 'assistant', content: honestFallback }]);
    setIsLoading(false);
  };

  const logFeedback = (lawyer_id, action) => {
    // Only send feedback for actual backend DB matches (checks for mongo object id length)
    if (!lawyer_id || typeof lawyer_id !== 'string' || lawyer_id.length < 10) return;
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content || '';
    axios.post(`${API}/smart-match/feedback`, {
      lawyer_id,
      action,
      session_id: sessionId,
      query: lastUserMessage,
    }).catch(e => console.log('Feedback log error', e));
  };

  const handleBookConsultation = (lawyer) => {
    logFeedback(lawyer.id || lawyer._id, 'book');
    navigate('/book-consultation-signup', { state: { lawyer } });
  };

  const handleViewProfile = (lawyer) => {
    logFeedback(lawyer.id || lawyer._id, 'view');
    setSelectedLawyer(lawyer);
  };

  const content = (
    <>
      <div className={`flex bg-black text-white overflow-hidden ${embedded ? '' : 'pt-16'}`}
        style={{ height: '100dvh' }}
      >

        {/* ── Left: Chat Panel ── */}
        <div className={`flex flex-col transition-all duration-500
          ${mobileView === 'matches' ? 'hidden lg:flex' : 'flex'}
          ${recommendedLawyers.length > 0 ? 'w-full lg:w-[52%]' : 'w-full'}
          border-r border-slate-800/60`}>

          {/* Top bar */}
          <div className="shrink-0 h-14 border-b border-slate-800/60 bg-black/80 backdrop-blur-sm px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">{d.aiLawyerMatching}</h1>
                <p className="text-[10px] text-slate-500 font-medium">{d.describeCase}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {recommendedLawyers.length > 0 && (
                <>
                  {/* Mobile toggle — show on small screens only */}
                  <button
                    onClick={() => setMobileView('matches')}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                  >
                    {recommendedLawyers.length} {d.matches} <ArrowRight className="w-3 h-3" />
                  </button>
                  {/* Desktop badge */}
                  <span className="hidden lg:inline text-xs font-bold bg-slate-900 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full">
                    {recommendedLawyers.length} {d.matches}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold text-white mb-1">
                  AI <span className="text-blue-400">Lawyer</span> Matching
                </h2>
                <p className="text-xs text-slate-500 mb-8">Tell me your legal issue — I'll find the right lawyer</p>
                <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center">
                  {['Criminal lawyer in Delhi', 'Property dispute Mumbai', 'Divorce lawyer Bangalore', 'Corporate law Chennai'].map((q, i) => (
                    <button key={i} onClick={() => handleSendMessage(q)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-300 text-xs font-medium transition-all hover:scale-[1.02]">
                      <ArrowRight className="w-3 h-3" /> {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} isBot={msg.role === 'assistant'} />
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shadow-md shrink-0">
                  <Bot className="w-4 h-4 text-slate-200" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <div key={d} className={`w-2 h-2 bg-slate-400 rounded-full animate-bounce`} style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{t('ai_searching') || 'Searching lawyers...'}</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 pb-6 pt-3 bg-gradient-to-t from-black via-black/90 to-transparent">
            {/* Typing-suggestion chips — real-time from KB */}
            {typingChips.length > 0 && (
              <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 mb-1 scrollbar-hide w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                {typingChips.map((chip, i) => (
                  <button key={i} onClick={() => handleSendMessage(chip)}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-800/50 bg-blue-950/40 text-blue-400 hover:border-blue-500 hover:text-blue-300 text-[11px] sm:text-xs font-medium transition-all hover:scale-[1.02]">
                    <Sparkles className="w-3 h-3" /> {chip}
                  </button>
                ))}
              </div>
            )}
            {/* Quick chips */}
            {quickChips.length > 0 && (
              <div className="flex flex-nowrap overflow-x-auto pb-3 gap-2 mb-1 scrollbar-hide w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                {quickChips.map((chip, i) => (
                  <button key={i} onClick={() => handleSendMessage(chip)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-300 text-[11px] sm:text-xs font-medium transition-all hover:scale-[1.02]">
                    <ArrowRight className="w-3 h-3" /> {chip}
                  </button>
                ))}
              </div>
            )}
            {/* Follow-up question label */}
            {followUpQueue.length > 0 && followUpIndex < followUpQueue.length && (
              <p className="text-xs text-slate-400 mb-2 pl-1">{followUpQueue[followUpIndex].text}</p>
            )}
            <div className="relative flex items-center gap-2 p-1.5 pl-5 bg-slate-900/80 border border-slate-700/60 rounded-full shadow-xl focus-within:border-slate-500 transition-all backdrop-blur-2xl" style={{ outline: 'none' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? 'Listening...' : followUpQueue[followUpIndex]?.text || 'Describe your legal issue...'}
                className="flex-1 bg-transparent border-none text-white placeholder-slate-600 font-medium py-2 text-sm"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-3 rounded-full transition-all duration-300 transform ${!inputMessage.trim() || isLoading
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed scale-90'
                  : 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95'
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold opacity-70">
                AI-Powered Matching · Verified Lawyers · India
              </p>
              <button
                onClick={() => setShowFAQ(f => !f)}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-semibold uppercase tracking-widest"
              >
                <HelpCircle className="w-3 h-3" /> FAQ
              </button>
            </div>

            {/* FAQ Accordion */}
            <AnimatePresence>
              {showFAQ && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold py-3 border-b border-slate-800">Frequently Asked Questions</p>
                    {LAWYER_FAQ.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Lawyer Matches Panel ── */}
        <AnimatePresence>
          {recommendedLawyers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex flex-col flex-1 bg-black overflow-hidden
                ${mobileView === 'matches' ? 'flex' : 'hidden lg:flex'}`}
            >
              <div className="shrink-0 px-5 py-4 border-b border-slate-800/60 h-14 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">

                  {d.topMatches}
                  <span className="ml-1 text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {recommendedLawyers.length} {d.found}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  {/* Mobile back */}
                  <button
                    onClick={() => setMobileView('chat')}
                    className="lg:hidden flex items-center gap-1.5 text-slate-400 text-xs font-semibold hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {d.chat}
                  </button>
                  {/* Close / dismiss panel — visible on all screens */}
                  <button
                    onClick={() => { setRecommendedLawyers([]); setMobileView('chat'); setQuickChips([]); setFollowUpQueue([]); }}
                    title="Close results"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(showAllLawyers ? recommendedLawyers : recommendedLawyers.slice(0, 5)).map((lawyer, index) => {
                  const grad = GRADIENTS[index % GRADIENTS.length];
                  const photoSrc = getLawyerPhoto(lawyer.photo, lawyer.name);

                  if (lawyer.isFirm) {
                    return (
                      <div key={lawyer.id} className="cursor-pointer">
                        <FirmCard 
                           firm={lawyer} 
                           index={index} 
                           onProfileClick={(firm) => handleViewProfile({ ...firm, isFirm: true })} 
                           onBookClick={(firm) => handleBookConsultation(firm)} 
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={lawyer.id} className="cursor-pointer mb-2">
                       <LawyerCard 
                          lawyer={lawyer} 
                          index={index} 
                          onProfileClick={(l) => handleViewProfile(l)} 
                          onBookClick={(l) => handleBookConsultation(l)} 
                       />
                    </div>
                  );
                })}
                {recommendedLawyers.length > 5 && (
                  <button onClick={() => setShowAllLawyers(!showAllLawyers)}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 transition-all">
                    {showAllLawyers ? d.showLess : `${d.showAllMatches} (${recommendedLawyers.length})`} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => navigate('/find-lawyer/manual', { state: { specialization: memory.caseType || '', location: memory.location ? (memory.location.city || memory.location.state) : '', budget: memory.budget ? memory.budget.max : '' } })}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 transition-all">
                  {d.browseAllLawyers} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lawyer Profile Modal — same design as FindLawyerManual */}
      <AnimatePresence>
        {selectedLawyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLawyer(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:shadow-none overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-[#2A2A2A]"
            >
              {/* Banner */}
              <div className="h-36 bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 dark:from-slate-800 dark:via-[#111] dark:to-black relative shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <span className="absolute top-5 right-7 text-white/20 dark:text-white/5 font-black text-5xl tracking-widest select-none pointer-events-none uppercase">Lxwyer Up</span>
                <button onClick={() => setSelectedLawyer(null)} className="absolute top-5 left-5 p-2 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-md z-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedLawyer.isFirm ? (
                 <div className="flex-1 overflow-y-auto overscroll-contain">
                 <div className="relative h-64">
                   <img src={selectedLawyer.image} alt={selectedLawyer.name} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                   <div className="absolute bottom-6 left-8 right-8 text-white">
                     <h2 className="text-3xl font-bold mb-2">{selectedLawyer.name}</h2>
                     <div className="flex items-center gap-4 text-slate-200">
                       <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedLawyer.city}, {selectedLawyer.state}</span>
                       <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedLawyer.lawyersCount} {d.lawyers}</span>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 p-5 sm:p-8">
                   <div className="md:col-span-2 space-y-8">
                     <div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{d.aboutFirm || 'About Firm'}</h3>
                       <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedLawyer.description}</p>
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Practice Areas</h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedLawyer.practiceAreas?.map((area, idx) => (
                           <div key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg border border-blue-100 dark:border-blue-800">
                             {area}
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Managing Partners */}
                     {selectedLawyer.managing_partners && selectedLawyer.managing_partners.length > 0 && (
                       <div className="pt-6 border-t border-slate-100 dark:border-[#2a2a2a]">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Managing Partners</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {selectedLawyer.managing_partners.map((partner, idx) => (
                             <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-100 dark:border-[#2a2a2a]">
                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                 {partner.name.charAt(0)}
                               </div>
                               <div className="min-w-0">
                                 <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{partner.name}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {partner.bar_council_id}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                     
                     {/* Additional Details */}
                     <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-[#2a2a2a]">
                       {selectedLawyer.languages_spoken && (
                         <div>
                           <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Languages</h4>
                           <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedLawyer.languages_spoken.join(', ')}</p>
                         </div>
                       )}
                       {selectedLawyer.billing_models && (
                         <div>
                           <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Billing</h4>
                           <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedLawyer.billing_models.join(' • ')}</p>
                         </div>
                       )}
                       {selectedLawyer.branch_offices && (
                         <div className="col-span-2">
                           <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Branch Offices</h4>
                           <div className="flex flex-wrap gap-2 mt-1">
                             {selectedLawyer.branch_offices.map((office, idx) => (
                               <span key={idx} className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                                 {office}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>                     
                   </div>
                   
                   <div className="space-y-6 h-fit">
                     {selectedLawyer.platform_metrics && (
                      <div className="p-5 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-100 dark:border-[#2a2a2a]">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm tracking-widest uppercase">Firm Performance</h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center bg-white dark:bg-[#222] p-3 rounded-xl border border-slate-100 dark:border-[#333]">
                              <span className="text-xs font-semibold text-slate-500">Cases Handled</span>
                              <span className="font-black text-blue-600">{selectedLawyer.platform_metrics.cases_resolved}+</span>
                           </div>
                           <div className="flex justify-between items-center bg-white dark:bg-[#222] p-3 rounded-xl border border-slate-100 dark:border-[#333]">
                              <span className="text-xs font-semibold text-slate-500">Client Score</span>
                              <span className="font-black text-yellow-500 flex items-center gap-1">{selectedLawyer.platform_metrics.csat} / 5.0</span>
                           </div>
                           {selectedLawyer.average_response_time_mins && (
                             <div className="flex justify-between items-center bg-white dark:bg-[#222] p-3 rounded-xl border border-slate-100 dark:border-[#333]">
                                <span className="text-xs font-semibold text-slate-500">Avg Response</span>
                                <span className="font-black text-emerald-500">&lt; {selectedLawyer.average_response_time_mins}m</span>
                             </div>
                           )}
                        </div>
                      </div>
                     )}                   
                     <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                       <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">{d.bookConsultation}</h3>
                       <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">{d.scheduleMeeting || 'Schedule a meeting'}</p>
                       <Button onClick={() => handleBookConsultation(selectedLawyer)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                         {d.bookConsultation}
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
              ) : (
                <>
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 sm:px-10 pb-10">
                {/* Avatar + name row */}
                <div className="flex items-center gap-5 pt-6 pb-6 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl shrink-0">
                    {getLawyerPhoto(selectedLawyer.photo, selectedLawyer.name) ? (
                      <img src={getLawyerPhoto(selectedLawyer.photo, selectedLawyer.name)} alt={selectedLawyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <span className="text-2xl font-black text-white">{selectedLawyer.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">{selectedLawyer.name}</h2>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-base mt-0.5">{selectedLawyer.specialization}</p>
                  </div>
                  {selectedLawyer.verified && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-lg border border-green-100 dark:border-green-800 shrink-0">
                      <Check className="w-4 h-4" /> {d.verified}
                    </span>
                  )}
                </div>

                {/* Info tiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-[#333] shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold"><Briefcase className="w-4 h-4 text-blue-500" /> {d.experience}</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedLawyer.experience} {d.years}</div>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-[#333] shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold"><MapPin className="w-4 h-4 text-blue-500" /> {d.location}</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedLawyer.city || selectedLawyer.state || 'India'}</div>
                  </div>
                </div>

                {/* Education */}
                <div className="mb-6 p-6 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-[#333] shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-3 text-xs uppercase tracking-wider font-bold"><GraduationCap className="w-4 h-4 text-blue-500" /> {d.education}</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{selectedLawyer.education || d.notSpecified}</div>
                </div>

                {/* About */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      {d.about} <div className="h-px flex-1 bg-slate-100 dark:bg-[#2A2A2A]" />
                    </h3>
                    {selectedLawyer.bio ? (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{selectedLawyer.bio}</p>
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 italic text-base">{d.noBio}</p>
                    )}
                  </div>

                  {/* Achievements */}
                  {selectedLawyer?.achievements && Array.isArray(selectedLawyer.achievements) && selectedLawyer.achievements.length > 0 && (
                    <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-[#0a0f1a] dark:to-[#05080f] rounded-3xl border border-blue-200/50 dark:border-blue-500/20 relative overflow-hidden">
                      <h3 className="text-base font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                        <Award className="w-5 h-5 text-blue-500" /> {d.milestones}
                        <div className="h-px flex-1 bg-gradient-to-r from-blue-200/50 dark:from-blue-500/20 to-transparent" />
                      </h3>
                      <div className="space-y-4">
                        {[...selectedLawyer.achievements].sort((a, b) => b.pinned - a.pinned).map(ach => (
                          <div key={ach.id} className={`rounded-2xl border p-5 flex gap-5 items-center transition-all shadow-sm hover:shadow-md ${ach.pinned ? 'bg-white dark:bg-[#0d1520] border-blue-300 dark:border-blue-500/40' : 'bg-white/80 dark:bg-[#111]/80 border-blue-100 dark:border-blue-500/10 hover:border-blue-300/50 dark:hover:border-blue-500/30'}`}>
                            {ach.photo ? (
                              <img src={ach.photo.startsWith('http') || ach.photo.startsWith('data:') ? ach.photo : `${API.replace('/api', '')}${ach.photo}`} alt="achievement" className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-blue-200 dark:border-blue-500/30 shadow-sm" />
                            ) : (
                              <div className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 border border-blue-200 dark:border-blue-700/50">
                                <Award className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-bold text-lg leading-snug text-slate-900 dark:text-white">{ach.title}</p>
                                {ach.pinned && (
                                  <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full tracking-wider uppercase border border-blue-200 dark:border-blue-800/50">
                                    <Star className="w-3 h-3 fill-current" /> {d.featured}
                                  </span>
                                )}
                              </div>
                              {ach.date && <p className="text-sm font-medium text-blue-700/70 dark:text-blue-500/60 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {ach.date}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Court & Fee details */}
                  <div className="divide-y divide-slate-100 dark:divide-[#2A2A2A] border border-slate-100 dark:border-[#2A2A2A] rounded-xl overflow-hidden">
                    <div className="flex flex-col gap-3 px-5 py-5">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-0.5">{d.courtExp}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedLawyer.court) ? selectedLawyer.court : (selectedLawyer.court || d.notSpecified).split(',')).map((court, i) => (
                          <span key={i} className="px-3 py-1.5 text-sm font-medium bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-slate-700 dark:text-slate-200">{court.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-5 py-5">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{d.consultationFee}</div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {selectedLawyer.feeMin ? `₹${selectedLawyer.feeMin.toLocaleString()} – ₹${selectedLawyer.feeMax?.toLocaleString()}` : (selectedLawyer.fee || d.contactForFee)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{d.mode}</div>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
                          {selectedLawyer.consultation_preferences === 'both' ? d.videoInPerson : selectedLawyer.consultation_preferences === 'in_person' ? d.inPerson : selectedLawyer.consultation_preferences === 'online' ? d.videoCall : d.notSpecified}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom booking bar */}
              <div className="shrink-0 px-6 sm:px-10 py-5 border-t border-slate-100 dark:border-[#2A2A2A] bg-white dark:bg-[#121212]">
                <button
                  onClick={() => handleBookConsultation(selectedLawyer)}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base tracking-wide transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {d.bookConsultation} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <WaveLayout activePage="find-lawyer">
      {content}
    </WaveLayout>
  );
}

