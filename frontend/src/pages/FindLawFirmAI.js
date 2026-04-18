import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Send, Bot, Briefcase, MapPin, ArrowRight, ArrowLeft, X, CheckCircle, MessageSquare, Sparkles, User, Loader2, Star, Globe, Mic, MicOff, Phone, Mail, Users, ChevronDown, ChevronUp, HelpCircle, Scale, Shield, Zap, Clock } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';
import { Button } from '../components/ui/button';
import FirmCard from '../components/FirmCard';
import { dummyLawFirms, states, practiceAreas } from '../data/lawFirmsData';
import { greetings, farewells, thanks, acknowledgements, aboutBot, legalInfo, customQA, fallbackResponses, caseTypeKeywords, locationKeywords, advancedLegalInfo, hindiPhrases, proceduralQA, nameQueryResponses } from '../data/chatbotData';
import VoiceModeOverlay from '../components/VoiceModeOverlay';
import { buildKnowledgeBase, lookupByName, getPlatformAwarenessResponse, getSuggestiveChips } from '../utils/lawyerKnowledgeBase';
import { useLang } from '../context/LanguageContext';

// ── FAQ Data ────────────────────────────────────────────────────────────────
const FIRM_FAQ = [
  { q: 'How does AI law firm matching work?', a: 'Our AI analyses your requirement (practice area, location, size) and scores law firms using a smart-match algorithm, surfacing the most relevant firms for your legal needs instantly.' },
  { q: 'What types of law firms are on Lxwyer Up?', a: 'We list boutique and full-service firms covering Corporate, Criminal, IP, Tax, Real Estate, Family Law, Labour Law, Consumer Law, Cyber Law, and more.' },
  { q: 'Can I contact a law firm directly?', a: 'Yes. Click "Book Consultation" on any matched firm to schedule a meeting with their senior partners or a dedicated team.' },
  { q: 'Do law firms offer virtual consultations?', a: 'Many listed firms offer video consultations. Mention "online" or "virtual" in your message and the AI will filter firms accordingly.' },
  { q: 'What if no firm matches my location?', a: 'The AI will broaden its search to nearby cities or the state level, or suggest that you try the manual browse page for more results.' },
  { q: 'How do I know which practice area I need?', a: 'Just describe your legal issue in plain English — the AI will automatically identify the most relevant practice area and find matching firms.' },
  { q: 'Are the firms verified?', a: 'All firms on Lxwyer Up are onboarded after a verification process. Verified firms have submitted registration details and practice area credentials.' },
  { q: 'Can large corporates use this platform?', a: 'Absolutely. You can specify "corporate retainer", "M&A", "due diligence", or other corporate legal needs and the AI will match high-capacity firms.' },
  { q: 'Is my information kept private?', a: 'Your conversation is processed securely and not shared with third parties. Firms only receive your details after you initiate a booking.' },
  { q: 'What if I need multiple practice areas?', a: 'Simply list all your needs — e.g. "IP and Employment law firm in Mumbai" — and the AI will find firms with multi-disciplinary capabilities.' },
];

// ── Follow-up question bank ───────────────────────────────────────────────
const FIRM_FOLLOWUP = [
  { key: 'size',     text: 'What size of firm do you prefer?',             chips: ['Boutique (1–10 lawyers)', 'Mid-size (10–50)', 'Large firm (50+)', 'Any size'] },
  { key: 'mode',     text: 'How would you like to consult?',               chips: ['In-person visit', 'Video call', 'Either works'] },
  { key: 'budget',   text: 'What is your approximate budget?',             chips: ['Under ₹5,000', 'Under ₹15,000', 'Above ₹15,000', 'Discuss with firm'] },
  { key: 'urgency',  text: 'How urgent is this matter?',                  chips: ['Not urgent', 'Within a week', 'Urgent — ASAP'] },
  { key: 'language', text: 'Which language do you prefer?',               chips: ['English', 'Hindi', 'Regional language', 'Doesn\'t matter'] },
];

// ── Defined OUTSIDE the component so React never remounts on keystroke ──
const ChatMessage = ({ message, isBot }) => (
  <div className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
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

// ── FAQ Accordion Item ────────────────────────────────────────────────────
const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
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

const ALLOWED_FIRM_STATES = null; // Law firms are available nationwide

const LOCAL_TEXT_FIRM_AI_PAGE = {
  en: {
    topMatches: 'TOP MATCHES',
    found: 'Found',
    chat: 'Chat',
    browseAllFirms: 'Browse all law firms',
    aboutFirm: 'About the Firm',
    practiceAreas: 'Practice Areas',
    lawyers: 'lawyers',
    close: 'Close',
    bookConsultation: 'Book Consultation',
    aiFirmMatching: 'AI FIRM MATCHING',
    describeFirm: 'Describe your need · find the right firm',
    matches: 'Matches',
    matchingFirms: 'Matching firms...'
  },
  hi: {
    topMatches: 'शीर्ष मैच',
    found: 'मिले',
    chat: 'चैट',
    browseAllFirms: 'सभी लॉ फर्म ब्राउज़ करें',
    aboutFirm: 'फर्म के बारे में',
    practiceAreas: 'अभ्यास क्षेत्र',
    lawyers: 'वकील',
    close: 'बंद करें',
    bookConsultation: 'परामर्श बुक करें',
    aiFirmMatching: 'एआई फर्म मिलान',
    describeFirm: 'अपनी आवश्यकता का वर्णन करें · सही फर्म खोजें',
    matches: 'मैच',
    matchingFirms: 'फर्में ढूँढ रहे हैं...'
  }
};

export default function FindLawFirmAI() {
  const { t, lang, setLang } = useLang();
  const d = LOCAL_TEXT_FIRM_AI_PAGE[lang] || LOCAL_TEXT_FIRM_AI_PAGE.en;
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm your AI consultant for finding the right law firm. Describe your legal requirement and city — I'll match you with the best firms.\n\nFor example: \"Looking for a corporate law firm in Mumbai\" or \"IP law firm in Delhi\"",
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recommendedFirms, setRecommendedFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [mobileView, setMobileView] = useState('chat');
  const [allFirms, setAllFirms] = useState(dummyLawFirms);
  const [quickChips, setQuickChips] = useState([]);
  const [followUpQueue, setFollowUpQueue] = useState([]);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  // Live-training index from fetched backend firm data
  const [liveIndex, setLiveIndex] = useState({ cities: new Set(), areas: new Set() });
  // Full knowledge base for name queries & platform awareness
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  // Suggestive chips from typing
  const [typingChips, setTypingChips] = useState([]);
  const suggestDebounceRef = useRef(null);
  // Multi-turn memory
  const [memory, setMemory] = useState({ practiceArea: null, location: null, budget: null, mode: null, language: null, urgent: false });

  // Fetch verified law firms
  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await axios.get(`${API}/lawfirms`);
        const formattedDbFirms = response.data.map(firm => ({
          ...firm,
          id: firm.id || firm._id,
          name: firm.firm_name || firm.name,
          city: firm.city,
          state: firm.state,
          practiceAreas: firm.practice_areas || [],
          lawyersCount: firm.total_lawyers || 0,
          description: firm.description || 'A verified law firm on Lxwyer Up.',
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
          unique_id: firm.unique_id,
          feeMin: 5000,
          feeRange: '₹5,000 - ₹15,000',
        }));
        const merged = [...formattedDbFirms, ...dummyLawFirms];
        setAllFirms(merged);

        // ── AUTO-TRAIN: build live index from backend firm data ───────────
        const cities = new Set();
        const areas  = new Set();
        merged.forEach(f => {
          if (f.city)  cities.add(f.city.toLowerCase());
          if (f.state) cities.add(f.state.toLowerCase());
          (f.practiceAreas || []).forEach(a => areas.add(a.toLowerCase()));
        });
        setLiveIndex({ cities, areas });

        // Build full KB for name/platform queries
        // Map firms to a lawyer-like structure the KB builder understands
        const firmAsLawyer = merged.map(f => ({
          name: f.name || f.firm_name,
          specialization: (f.practiceAreas || [])[0] || '',
          city: f.city,
          state: f.state,
          feeMin: f.feeMin || 5000,
          languages: f.languages || ['English'],
        }));
        setKnowledgeBase(buildKnowledgeBase(firmAsLawyer));
      } catch (error) {
        setAllFirms(dummyLawFirms);
      }
    };
    fetchFirms();
  }, []);

  // Auto-scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  // ── Detection Helpers ─────────────────────────────────────────────────────
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const detectPracticeArea = (message) => {
    const msg = message.toLowerCase();

    // First pass: live practice area index from backend firms
    for (const area of liveIndex.areas) {
      const words = area.split(/\s+/);
      if (words.every(w => msg.includes(w))) {
        return area.replace(/\b\w/g, c => c.toUpperCase());
      }
    }

    // Second pass: extended keyword bank (150+ terms, 15 categories)
    for (const [type, keywords] of Object.entries(caseTypeKeywords)) {
      if (keywords.some(kw => msg.includes(kw))) return type;
    }
    const extra = {
      'Corporate Law':           ['corporate','business','company','merger','acquisition','board','shareholder','llp','partnership','startup','venture','due diligence','mou','nda','sebi','compliance','incorporation','directorship','roc','memorandum','articles'],
      'Intellectual Property':   ['ip','intellectual','patent','trademark','copyright','design','trade secret','infringement','licensing','royalty','brand protection','geographical indication'],
      'Tax Law':                 ['tax','gst','tds','itr','income tax','tax evasion','advance tax','benami','tribunal','assessment','demand notice','tax audit','service tax','customs'],
      'Real Estate':             ['real estate','property','land','plot','flat','apartment','registration','conveyance','mutation','lease','rent','sale deed','builder','reit','rera','housing'],
      'Criminal Law':            ['criminal','crime','arrest','bail','fir','murder','fraud','cheating','assault','robbery','narcotics','pocso','kidnapping','extortion','blackmail','corruption','bribery','forgery'],
      'Family Law':              ['family','divorce','custody','alimony','maintenance','matrimonial','guardianship','adoption','inheritance','will','probate','498a','dowry','domestic violence'],
      'Labour Law':              ['labour','employment','employee','termination','salary','wages','pf','epf','esic','gratuity','posh','retrenchment','layoff','maternity','contract labour','industrial dispute'],
      'Consumer Law':            ['consumer','complaint','deficiency','refund','product defect','warranty','unfair trade','consumer forum','consumer court','compensation'],
      'Cyber Law':               ['cyber','hacking','data breach','online fraud','it act','ransomware','phishing','deepfake','identity theft','social media crime','digital'],
      'Immigration Law':         ['immigration','visa','passport','oci','nri','citizenship','asylum','deportation','work permit','foreign national'],
      'Debt Recovery':           ['debt','loan','recovery','cheque bounce','npa','drt','sarfaesi','emi','default','dishonour','insolvency','ibc','liquidation'],
      'Environmental Law':       ['environment','pollution','ngt','forest','wildlife','waste','emission','green','ecb','contamination'],
      'Arbitration':             ['arbitration','mediation','adr','dispute resolution','arbitral','commercial dispute','conciliation'],
      'Banking Law':             ['banking','bank','nbfc','rbi','financial regulation','fema','foreign exchange','credit','loan default'],
      'Media & Entertainment':   ['media','entertainment','film','music','publishing','defamation','content','celebrity','ott','streaming'],
    };
    for (const [type, keywords] of Object.entries(extra)) {
      if (keywords.some(kw => msg.includes(kw))) return type;
    }
    return null;
  };

  const detectLocation = (message) => {
    const msg = message.toLowerCase();

    // First: live cities from fetched backend firms
    for (const city of liveIndex.cities) {
      if (msg.includes(city)) return city.replace(/\b\w/g, c => c.toUpperCase());
    }

    // Fallback: static keyword bank
    const sorted = Object.entries(locationKeywords).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of sorted) {
      if (msg.includes(key)) {
        if (typeof value === 'object') return value.city || value.state || key;
        return value;
      }
    }
    const extras = { delhi:'Delhi', mumbai:'Mumbai', pune:'Pune', bangalore:'Bangalore', bengaluru:'Bangalore', chennai:'Chennai', hyderabad:'Hyderabad', kolkata:'Kolkata', ahmedabad:'Ahmedabad', jaipur:'Jaipur', lucknow:'Lucknow', noida:'Noida', gurgaon:'Gurgaon', chandigarh:'Chandigarh', surat:'Surat', indore:'Indore', bhopal:'Bhopal', nagpur:'Nagpur', kochi:'Kochi', bhubaneswar:'Bhubaneswar', patna:'Patna', ranchi:'Ranchi', coimbatore:'Coimbatore', vadodara:'Vadodara', agra:'Agra', faridabad:'Faridabad', meerut:'Meerut', varanasi:'Varanasi' };
    for (const [key, val] of Object.entries(extras)) { if (msg.includes(key)) return val; }
    return null;
  };

  const detectUrgency = (msg) => /urgent|asap|emergency|immediately|right away|today/i.test(msg);

  const detectBudget = (message) => {
    const msg = message.toLowerCase().replace(/(\d),(\d)/g, '$1$2');
    if (msg.includes('free') || msg.includes('no fee') || msg.includes('pro bono')) return { max: 0, label: 'Free / Pro Bono' };
    if (msg.includes('budget') || msg.includes('affordable') || msg.includes('cheap') || msg.includes('low cost')) return { max: 2000, label: 'Budget-Friendly (under ₹2,000)' };
    const underMatch = msg.match(/(?:under|max|maximum|below)\s*(?:rs\.?|₹|inr|-)?\s*(\d+)/i) || msg.match(/(?:rs\.?|₹|inr)\s*(\d+)\s*(?:or\s*less|max)/i);
    if (underMatch) return { max: parseInt(underMatch[1]), label: `Under ₹${parseInt(underMatch[1]).toLocaleString()}` };
    return null;
  };

  const getEmotionalResponse = (message) => {
    if (/\b(stress|stressed|anxious|anxiety|worried|overwhelmed|panicking|panic|scared|fear|nervous|depressed|sad|helpless|hopeless|exhausted)\b/i.test(message)) {
      return `I hear you — it sounds like you're going through a difficult time. 💙\n\nI'm a legal AI assistant, so I can't provide mental health support. But please reach out:\n\n📞 iCall Helpline: 9152987821\n📞 Vandrevala Foundation: 1860-2662-345 (24/7)\n\nIf your stress is due to a legal matter, I can find the right law firm to help. Just describe your issue and city!`;
    }
    return null;
  };

  const getConversationalResponse = (message) => {
    const msg = message.toLowerCase().trim();
    if (greetings.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) return pick(greetings.responses);
    if (farewells.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) return pick(farewells.responses);
    if (thanks.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msg))) return pick(thanks.responses);
    if (aboutBot.keywords?.some(kw => msg.includes(kw))) return pick(aboutBot.responses);
    return null;
  };

  const getLegalKnowledgeResponse = (message) => {
    const msg = message.toLowerCase().trim();
    for (const item of advancedLegalInfo) {
      if (item.keywords.some(kw => msg.includes(kw))) return (Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses);
    }
    for (const item of hindiPhrases) {
      if (item.keywords.some(kw => msg.includes(kw))) return (Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses);
    }
    for (const item of proceduralQA) {
      if (item.keywords.some(kw => msg.includes(kw))) return (Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses);
    }
    for (const item of legalInfo) {
      if (item.keywords.some(kw => msg.includes(kw))) return (Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses);
    }
    for (const item of customQA) {
      if (item.keywords.some(kw => msg.includes(kw))) return (Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses);
    }
    return null;
  };

  // ── Firm Matching ─────────────────────────────────────────────────────────
  const localMatchFirms = (practiceArea, location) => {
    let filtered = [...allFirms];
    if (practiceArea) {
      filtered = filtered.filter(f =>
        f.practiceAreas?.some(pa => pa.toLowerCase().includes(practiceArea.toLowerCase()) || practiceArea.toLowerCase().includes(pa.toLowerCase()))
      );
    }
    if (location && typeof location === 'string') {
      const loc = location.toLowerCase();
      filtered = filtered.filter(f =>
        (f.state && f.state.toLowerCase().includes(loc)) ||
        (f.city && f.city.toLowerCase().includes(loc))
      );
    }
    filtered.sort((a, b) => (b.lawyersCount || 0) - (a.lawyersCount || 0));
    return filtered.slice(0, 5);
  };

  // Backend smart match
  const smartMatchFirms = async (query) => {
    try {
      let sessionId = sessionStorage.getItem('firm_match_session_id');
      if (!sessionId) { sessionId = Math.random().toString(36).substring(2, 15); sessionStorage.setItem('firm_match_session_id', sessionId); }
      const response = await axios.post(`${API}/smart-match/firms`, { query, session_id: sessionId });
      return response.data;
    } catch (error) {
      return null;
    }
  };

  // ── Send Message ─────────────────────────────────────────────────────────
  const handleSendMessage = async (overrideMsg) => {
    const raw = overrideMsg || inputMessage;
    if (!raw.trim() || isLoading) return;
    const userMessage = raw.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);
    setQuickChips([]);
    setTypingChips([]);

    await new Promise(r => setTimeout(r, 700));

    // Platform-awareness ("how many firms", "which cities")
    if (knowledgeBase) {
      const platformReply = getPlatformAwarenessResponse(knowledgeBase, userMessage);
      if (platformReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: platformReply }]);
        setQuickChips(['Corporate firms Delhi', 'IP law Mumbai', 'Show all firms']);
        setIsLoading(false);
        return;
      }
    }

    // Emotional check
    const emotionalReply = getEmotionalResponse(userMessage);
    if (emotionalReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: emotionalReply }]);
      setIsLoading(false);
      return;
    }

    // Conversational shortcuts
    const convoReply = getConversationalResponse(userMessage);
    if (convoReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: convoReply }]);
      setIsLoading(false);
      return;
    }

    // Legal Knowledge fallback
    const knowledgeReply = getLegalKnowledgeResponse(userMessage);
    if (knowledgeReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: knowledgeReply }]);
      setIsLoading(false);
      return;
    }

    // Show-all shortcut
    if (/show all|browse all|see all|all firms/i.test(userMessage)) {
      navigate('/find-lawfirm/manual');
      setIsLoading(false);
      return;
    }

    // Detect intents + merge with memory
    const newPracticeArea = detectPracticeArea(userMessage);
    const newLocation    = detectLocation(userMessage);
    const isUrgent       = detectUrgency(userMessage);
    const newBudget      = detectBudget(userMessage);
    const practiceArea   = newPracticeArea || memory.practiceArea;
    const location       = newLocation || memory.location;
    const urgent         = isUrgent || memory.urgent;
    const budget         = newBudget || memory.budget;

    setMemory(prev => ({ ...prev, practiceArea, location, urgent, budget }));

    // ── Run backend smart match first ─────────────────────────────────────
    const matchData = await smartMatchFirms(userMessage);

    let enriched = [];
    if (matchData && matchData.results && matchData.results.length > 0) {
      enriched = matchData.results;
    }
    
    // Always merge local matches to ensure rich dummy data is present
    let localMatches = [];
    if (practiceArea || location) {
      localMatches = localMatchFirms(practiceArea, location);
      // Broaden if nothing found
      if (localMatches.length === 0 && location) localMatches = localMatchFirms(null, location).slice(0, 3);
      if (localMatches.length === 0 && practiceArea) localMatches = localMatchFirms(practiceArea, null).slice(0, 3);
    } else {
      localMatches = allFirms.slice(0, 10);
    }
    
    const combined = [...enriched, ...localMatches];
    enriched = Array.from(new Map(combined.map(item => [item.id || item._id, item])).values());

    if (enriched.length > 0) {
      const shuffled = [...enriched].sort(() => Math.random() - 0.5);
      const signatureList = shuffled.filter(l => l.isSignature || String(l.package).toLowerCase() === 'signature' || String(l.plan).toLowerCase() === 'signature');
      const normalList = shuffled.filter(l => !(l.isSignature || String(l.package).toLowerCase() === 'signature' || String(l.plan).toLowerCase() === 'signature'));
      
      const topSig = signatureList.slice(0, 3);
      const remainingSlots = Math.max(0, enriched.length - topSig.length);
      const fillers = normalList.slice(0, remainingSlots);
      
      enriched = [...topSig, ...fillers];
      
      setRecommendedFirms(enriched);

      const locationText = location || (matchData?.query_summary?.location?.city) || 'India';
      const areaText = practiceArea || 'your requirement';
      
      let responseContent = `I’ve gathered some excellent matches for you! Here are the top ${enriched.length} highly rated law firms specializing in ${areaText.toLowerCase()} in ${locationText} that fit your needs.\n\n`;
      const requirements = [];
      if (memory.budget) requirements.push(`Under ₹${memory.budget.max}`);
      if (memory.language) requirements.push(`${memory.language}`);
      if (memory.mode) requirements.push(`${memory.mode === 'in_person' ? 'In-Person' : 'Video'}`);
      if (urgent) requirements.push(`Urgent Help`);
      if (requirements.length) responseContent += `*Applied filters: ${requirements.join(' · ')}*\n\n`;

      responseContent += `You can view their verified firm profiles in the panel. Let me know if you want to refine this list further!`;

      // Build follow-up queue
      const missingFollowUps = FIRM_FOLLOWUP.filter(fq => {
        if (fq.key === 'budget' && memory.budget) return false;
        if (fq.key === 'mode' && memory.mode) return false;
        if (fq.key === 'language' && memory.language) return false;
        if (fq.key === 'urgency' && urgent) return false;
        return true;
      }).slice(0, 2);

      setFollowUpQueue(missingFollowUps);
      setFollowUpIndex(0);

      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
      if (missingFollowUps.length > 0) {
        setQuickChips(missingFollowUps[0].chips);
      } else {
        setQuickChips(['Book consultation', 'Show all firms', 'New search']);
      }
    } else if (practiceArea && !location) {
      setMessages(prev => [...prev, { role: 'assistant', content: `I understand you need help with ${practiceArea}.\n\nPlease also mention your city or state.\nExample: "${practiceArea} firm in Delhi"` }]);
      setQuickChips(['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad']);
    } else if (!practiceArea && location) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Got it, you're in ${location}.\n\nWhat type of legal expertise does your firm need?\nExample: "Corporate", "IP", "Tax", "Criminal"` }]);
      setQuickChips(['Corporate Law', 'Intellectual Property', 'Tax Law', 'Criminal Law', 'Family Law']);
    } else if (practiceArea && location) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm sorry, I couldn't find a firm exactly matching your criteria. However, we have highly qualified Corporate Firms in Delhi, IP Firms in Mumbai, and Criminal Firms in Bangalore. Would any of those help? Or type "show all firms" to browse our complete directory.`
      }]);
      setQuickChips(['Corporate firm in Delhi', 'IP firm in Mumbai', 'Criminal firm in Bangalore', 'Show all firms']);
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I can help match you with the right law firm! Try describing:\n\n1. Legal area (Corporate, IP, Tax, Criminal...)\n2. Your city or state\n\nOr type "show all firms" to browse manually.`,
      }]);
      setQuickChips(['Corporate firm in Delhi', 'IP firm in Mumbai', 'Criminal firm in Bangalore', 'Show all firms']);
    }

    setIsLoading(false);
  };

  const handleBook = (firm) => {
    navigate('/book-consultation-signup', {
      state: {
        lawyer: {
          ...firm,
          photo: firm.image,
          consultation_fee: firm.feeMin || 5000,
          fee: firm.feeRange || '₹5,000 - ₹15,000',
          specialization: firm.practiceAreas?.[0] || 'Corporate Law',
        }
      }
    });
  };

  return (
    <WaveLayout activePage="find-law-firm">
      <div
        className="flex bg-black text-white overflow-hidden"
        style={{ height: 'calc(100dvh - 64px)' }}
      >
        {/* ── Left: Chat Panel ── */}
        <div className={`flex flex-col transition-all duration-500
          ${mobileView === 'results' ? 'hidden lg:flex' : 'flex'}
          ${recommendedFirms.length > 0 ? 'w-full lg:w-[52%]' : 'w-full'}
          border-r border-slate-800/60`}>

          {/* Top bar */}
          <div className="shrink-0 h-14 border-b border-slate-800/60 bg-black/80 backdrop-blur-sm px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">{d.aiFirmMatching}</h1>
                <p className="text-[10px] text-slate-500 font-medium">{d.describeFirm}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase transition hover:text-white"
              >
                {lang === 'en' ? 'hi' : 'en'}
              </button>
              {recommendedFirms.length > 0 && (
                <>
                  <button
                    onClick={() => setMobileView('results')}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                  >
                    {recommendedFirms.length} {d.matches} <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="hidden lg:inline text-xs font-bold bg-slate-900 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full">
                    {recommendedFirms.length} {d.matches}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
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
                      <div key={d} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{d.matchingFirms}</span>
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
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-800/50 bg-indigo-950/40 text-indigo-400 hover:border-indigo-500 hover:text-indigo-300 text-[11px] sm:text-xs font-medium transition-all hover:scale-[1.02]">
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

            {/* Follow-up label */}
            {followUpQueue.length > 0 && followUpIndex < followUpQueue.length && (
              <p className="text-xs text-slate-400 mb-2 pl-1">{followUpQueue[followUpIndex].text}</p>
            )}

            <div className="relative flex items-center gap-2 p-1.5 pl-5 bg-slate-900/80 border border-slate-700/60 rounded-full shadow-xl focus-within:border-slate-500 transition-all backdrop-blur-2xl" style={{ outline: 'none' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => { setInputMessage(e.target.value); if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current); if (e.target.value.length > 2 && knowledgeBase) { suggestDebounceRef.current = setTimeout(() => setTypingChips(getSuggestiveChips(knowledgeBase, e.target.value, memory)), 280); } else { setTypingChips([]); } }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? 'Listening...' : followUpQueue[followUpIndex]?.text || 'Describe your legal requirement...'}
                className="flex-1 bg-transparent border-none text-white placeholder-slate-600 font-medium py-2 text-sm"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              <button
                onClick={() => setShowVoiceMode(true)}
                title="Voice Mode"
                className="p-2.5 rounded-full transition-all text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-3 rounded-full transition-all duration-300 transform ${!inputMessage.trim() || isLoading
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed scale-90'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold opacity-70">
                AI-Powered Matching · Verified Firms · India
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
                    {FIRM_FAQ.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Firm Matches Panel ── */}
        <AnimatePresence>
          {recommendedFirms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex flex-col flex-1 h-full min-w-0 min-h-0 bg-black overflow-hidden
                ${mobileView === 'results' ? 'flex absolute inset-0 z-50' : 'hidden lg:flex'}`}
            >
              <div className="shrink-0 px-5 py-4 border-b border-slate-800/60 h-14 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  {d.topMatches}
                  <span className="ml-1 text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {recommendedFirms.length} {d.found}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobileView('chat')}
                    className="lg:hidden flex items-center gap-1.5 text-slate-400 text-xs font-semibold hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {d.chat}
                  </button>
                  {/* X / Close button — all screens */}
                  <button
                    onClick={() => { setRecommendedFirms([]); setMobileView('chat'); setQuickChips([]); setFollowUpQueue([]); }}
                    title="Dismiss results"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
                {recommendedFirms.map((firm, index) => (
                  <FirmCard 
                    key={firm.id || index}
                    firm={firm}
                    index={index}
                    onDetails={setSelectedFirm}
                    onBook={handleBook}
                    dm={true}
                  />
                ))}

                {/* Browse all CTA */}
                <button
                  onClick={() => navigate('/find-lawfirm/manual')}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
                >
                  {d.browseAllFirms} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Firm Detail Modal ── */}
      <AnimatePresence>
        {selectedFirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-900/60 to-slate-900">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
                <button
                  onClick={() => setSelectedFirm(null)}
                  className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-xl mb-3">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedFirm.name}</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedFirm.city}{selectedFirm.state ? `, ${selectedFirm.state}` : ''}
                    {selectedFirm.lawyersCount > 0 && <span className="ml-2">· {selectedFirm.lawyersCount} {d.lawyers}</span>}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{d.aboutFirm}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedFirm.description}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{d.practiceAreas}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedFirm.practiceAreas || []).map((area, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-indigo-900/30 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-800/40">{area}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => { setSelectedFirm(null); }}
                    className="py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    {d.close}
                  </button>
                  <button
                    onClick={() => { setSelectedFirm(null); handleBook(selectedFirm); }}
                    className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {d.bookConsultation} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <VoiceModeOverlay
        open={showVoiceMode}
        onClose={() => setShowVoiceMode(false)}
        onSend={(text) => handleSendMessage(text)}
        accentColor="#6366f1"
      />
    </WaveLayout>
  );
}
