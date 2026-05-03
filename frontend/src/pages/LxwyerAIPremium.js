
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import axios from 'axios'
import {
  Send, ArrowLeft, Sparkles, ShieldCheck, Trash2,
  Info, ArrowRight, Clock, Zap, Scale, ChevronDown, ChevronUp,
  X, Lightbulb, User, Ghost, Bot, Menu,
  MapPin, Phone, Mail, Building2, Briefcase, Users
} from 'lucide-react'
import { dummyLawyers } from '../data/lawyersData'
import { dummyLawFirms } from '../data/lawFirmsData'
import { legalInfo, customQA, greetings, farewells, thanks, acknowledgements, aboutBot } from '../data/chatbotData'
import { API } from '../App'
import FirmCard from '../components/FirmCard'
import LawyerCard from '../components/LawyerCard'
import { smartMatchLawyers, smartMatchFirms } from '../utils/aiMatchingEngine'

import GenerativeBubble from '../components/GenerativeBubble'

/* ========== CARD DEFINITIONS ========== */
const CARD_DEFS = [
  { id: 'case-overview', icon: '📋', title: 'Case Overview', preview: 'Quick summary of your legal situation, charges, or dispute', readTime: '2 min' },
  { id: 'applicable-laws', icon: 'Book', title: 'Applicable Laws & Sections', preview: 'Specific legal provisions, acts, and section numbers relevant here', readTime: '3 min' },
  { id: 'bail-bond', icon: '🔓', title: 'Bail/Bond Information', preview: 'Eligibility, amount, timeline, and conditions for getting bail', readTime: '2 min' },
  { id: 'precedents', icon: '📚', title: 'Precedents & Similar Cases', preview: 'Past judgments, success rates, and how courts typically rule', readTime: '4 min' },
  { id: 'timeline', icon: '⏱️', title: 'Timeline & Procedure', preview: 'Step-by-step process and expected duration at each stage', readTime: '3 min' },
  { id: 'penalties', icon: '💰', title: 'Potential Penalties & Outcomes', preview: 'Possible consequences, fines, imprisonment, and best/worst cases', readTime: '2 min' },
  { id: 'rights', icon: '🛡️', title: 'Rights & Protections', preview: 'Your constitutional and legal rights at every stage', readTime: '3 min' },
  { id: 'documents', icon: '📝', title: 'Required Documents', preview: 'Paperwork needed at each stage and evidence to collect', readTime: '2 min' },
  { id: 'strategy', icon: 'Shield', title: 'Legal Strategy & Options', preview: 'Defense approaches, settlement options, and tactical considerations', readTime: '4 min' },
  { id: 'considerations', icon: '⚠️', title: 'Important Considerations', preview: 'Critical factors, mistakes to avoid, red flags, and urgent actions', readTime: '2 min' },
  { id: 'next-steps', icon: '🔍', title: 'Next Steps', preview: 'Immediate actions, how to find a lawyer, and resources available', readTime: '2 min' },
]

/* ========== SUGGESTIONS ========== */
const SUGGESTED_QUERIES = [
  { text: 'Find law firm in Delhi',         icon: '🏛️', opts: { recType: 'firm',   city: 'delhi' } },
  { text: 'Recommend a lawyer in Delhi',    icon: '⚖️', opts: { recType: 'lawyer', city: 'delhi' } },
  { text: 'How to file for divorce?',       icon: '↗',  opts: {} },
  { text: 'What are my rights during arrest?', icon: '↗', opts: {} },
]

/* ========== CLASSIFIERS ========== */
const CRIMINAL_KW = ['murder', 'theft', 'assault', 'fir', 'bail', 'arrest', 'jail', 'crime', 'police', 'warrant', 'ipc', 'penal', 'robbery', 'kidnap', 'fraud', 'cheat', 'forgery', 'section 302', 'section 420', 'killing']
const FAMILY_KW = ['divorce', 'marriage', 'custody', 'alimony', 'property', 'will', 'ancestral', 'tenant', 'landlord', 'rent', 'inheritance', 'child', 'adoption', 'dowry', 'domestic', 'maintenance']
const CORPORATE_KW = ['company', 'gst', 'tax', 'incorporation', 'startup', 'contract', 'agreement', 'salary', 'employment', 'cheque', 'corporate', 'share', 'director', 'compliance', 'trademark', 'patent']
const GREETING_KW = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']

// Recommendation intent keywords
const LAWYER_REC_KW = ['recommend', 'find lawyer', 'suggest lawyer', 'need lawyer', 'want lawyer', 'good lawyer', 'lawyer in', 'lawyer for', 'attorney', 'advocate', 'legal counsel', 'find me a lawyer', 'show me lawyers', 'get me a lawyer']
const FIRM_REC_KW = ['law firm', 'legal firm', 'firm in', 'find firm', 'suggest firm', 'recommend firm', 'best firm', 'legal team', 'law office']

function detectRecommendationIntent(text) {
  const l = text.toLowerCase()
  const isFirm = FIRM_REC_KW.some(k => l.includes(k))
  const isLawyer = LAWYER_REC_KW.some(k => l.includes(k))
  if (isFirm) return 'firm'
  if (isLawyer) return 'lawyer'
  return null
}

function extractLocation(text) {
  const cities = ['delhi', 'new delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune', 'jaipur', 'jodhpur', 'lucknow', 'noida', 'gurgaon', 'gurugram', 'faridabad', 'ahmedabad', 'surat', 'chandigarh', 'ludhiana', 'kochi', 'bhopal', 'indore', 'patna', 'ranchi', 'bhubaneswar', 'agra', 'meerut'];
  const l = text.toLowerCase()
  return cities.find(c => l.includes(c)) || null
}

function extractSpecialization(text) {
  const msg = text.toLowerCase();
  
  if (/^(show all|browse all|see all|all lawyers|hello|hi|help me)$/i.test(msg.trim())) return null;

  const highPriority = [
    ['Debt Recovery',        ['ibc insolvency','insolvency resolution','cheque bounce','cheque dishonour','sarfaesi','npa recovery','drt appeal','loan recovery','debt recovery']],
    ['Cyber Law',            ['data breach','cyber crime','cyber fraud','online fraud','hacking of','phishing attack','identity theft','ransomware','deepfake','cyberbullying','social media crime']],
    ['Intellectual Property',['trademark infringement','patent infringement','copyright infringement','intellectual property','patent filing','patent registration','trademark filing','ip law','trade secret','brand protection']],
    ['Consumer Law',         ['consumer forum','consumer court','consumer complaint','consumer protection','product defect','unfair trade practice']],
    ['Labour Law',           ['tds dispute with employer','wrongful dismissal','unfair termination','fired by employer','fired me','retrenchment','layoff','posh complaint','pf dispute','esic dispute','gratuity dispute','industrial dispute','maternity benefit','contract labour']],
    ['Family Law',           ['498a','domestic violence','child custody','custody of child','guardianship of child','custody dispute','matrimonial dispute','alimony claim','dowry case','dowry harassment','domestic dispute','guardianship petition','adoption legal']],
    ['Tax Law',              ['income tax notice','itr filing','tds dispute','tds notice','gst notice','gst demand','advance tax','benami property','tax tribunal','itat','tax evasion','tax raid','tax demand']],
    ['Real Estate',          ['property dispute','property lawyer','property case','property registration','land encroachment','land dispute','tenant eviction','eviction case','eviction notice','partition of property','ancestral property','lease dispute','lease deed','commercial property','rera complaint','builder dispute','flat possession','boundary dispute','zameen','sale deed','registry help','stamp duty','conveyance deed','mutation help','possession dispute']],
    ['Arbitration',          ['commercial arbitration','arbitration clause','arbitral award','dispute resolution','adr mediation','mediation for business']],
    ['Environmental Law',    ['pollution case','ngt complaint','forest clearance','wildlife protection','environmental clearance','factory pollution','emission violation']],
    ['Immigration Law',      ['visa overstay','oci card','nri legal','work permit','immigration case','deportation case','citizenship renounce','asylum claim']],
    ['Banking Law',          ['bank fraud','banking regulation','rbi compliance','nbfc compliance','fema violation','foreign exchange violation']],
    ['Criminal Law',         ['criminal case','fir filed','anticipatory bail','regular bail','bail application','bail for','murder case','narcotics case','ndps case','pocso case','money laundering','pmla','extortion threat','corruption case','cbi inquiry','forgery case','cheating case ipc','robbery case']],
    ['Corporate Law',        ['company incorporation','shareholder dispute','merger acquisition','startup legal','sebi compliance','roc compliance','roc filing','llp registration','company registration','director dispute','nclt petition','due diligence','board meeting']],
  ];
  for (const [caseType, keywords] of highPriority) {
    if (keywords.some(kw => msg.includes(kw))) return caseType;
  }

  const broad = [
    ['Debt Recovery',        ['insolvency','liquidation','cheque','dishonour','sarfaesi','drt','npa','debt','loan recovery']],
    ['Cyber Law',            ['cyber','hacking','phishing','ransomware','malware','deepfake','digital crime']],
    ['Intellectual Property',['patent','trademark','copyright','trade secret','ip','infringement','licensing','royalty']],
    ['Consumer Law',         ['consumer','deficiency','refund','warranty','guarantee','product defect']],
    ['Family Law',           ['divorce','custody','alimony','maintenance','matrimonial','guardianship','adoption','inheritance','will','probate','dowry','498a','domestic violence']],
    ['Tax Law',              ['income tax','itr','tds','gst','tax evasion','advance tax','benami','tribunal','tax audit']],
    ['Labour Law',           ['labour','employment','employee','termination','dismissal','retrenchment','salary','wages','pf','epf','esic','gratuity','bonus','maternity','posh','union']],
    ['Real Estate',          ['land','plot','flat','apartment','registry','mutation','sale deed','encroachment','eviction','rent','landlord','tenant','lease deed','trespassing','zameen','ghar','makaan','partition','property']],
    ['Criminal Law',         ['criminal','crime','arrest','bail','fir','murder','fraud','cheating','assault','robbery','narcotics','corruption','bribery','forgery','blackmail','extortion']],
    ['Corporate Law',        ['company','corporate','startup','llp','partnership','director','shareholder','sebi','roc','compliance','merger','acquisition','mou','nda','contract','agreement']],
    ['Arbitration',          ['arbitration','mediation','conciliation','adr']],
    ['Environmental Law',    ['pollution','environment','ngt','forest','wildlife','waste','emission']],
    ['Immigration Law',      ['visa','passport','oci','nri','citizenship','asylum','deportation','work permit','immigration']],
  ];
  for (const [caseType, keywords] of broad) {
    if (keywords.some(kw => msg.includes(kw))) return caseType;
  }

  return null;
}

const INTENT_LABELS = ['Criminal Law', 'Family/Civil', 'Corporate']
const SENTIMENT_LABELS = ['Neutral', 'URGENT', 'Positive']

function classifyIntent(t) {
  const l = t.toLowerCase()
  const c = CRIMINAL_KW.filter(k => l.includes(k)).length
  const f = FAMILY_KW.filter(k => l.includes(k)).length
  const b = CORPORATE_KW.filter(k => l.includes(k)).length
  if (c >= f && c >= b) return c > 0 ? 0 : 1
  if (f >= c && f >= b) return 1
  return 2
}

function classifySentiment(t) {
  const l = t.toLowerCase()
  const u = ['urgent', 'emergency', 'help', 'danger', 'threat', 'attack', 'killed', 'beaten', 'harass', 'abuse', 'immediately'].filter(k => l.includes(k)).length
  const p = ['thank', 'great', 'good', 'appreciate', 'helpful'].filter(k => l.includes(k)).length
  if (u > p) return 1
  if (p > 0 && u === 0) return 2
  return 0
}

/* ── Chat History helpers ── */
const HISTORY_KEY = 'lxwyer_chat_history'
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(sessions) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions)) } catch { }
}

export default function LxwyerAIPremium({ embedded = false, darkMode: darkModeProp }) {

  // Reactively track the app theme (next-themes puts 'dark' class on <html>)
  const { resolvedTheme } = useTheme()
  const [htmlDark, setHtmlDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setHtmlDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  const dm = embedded ? !!darkModeProp : true // lxwyerai always monochrome dark

  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [expandedCtx, setExpandedCtx] = useState(null)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [chatHistory, setChatHistory] = useState(() => loadHistory())
  const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString())
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Persist current session whenever messages change
  useEffect(() => {
    if (messages.length === 0) return
    const title = messages.find(m => m.role === 'user')?.content?.slice(0, 60) || 'New Chat'
    const session = { id: currentSessionId, title, messages, ts: Date.now() }
    setChatHistory(prev => {
      const filtered = prev.filter(s => s.id !== currentSessionId)
      const next = [session, ...filtered].slice(0, 30) // keep max 30 sessions
      saveHistory(next)
      return next
    })
  }, [messages])

  const startNewChat = () => {
    setMessages([])
    setCurrentSessionId(Date.now().toString())
  }

  const loadSession = (session) => {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
  }

  const deleteSession = (id, e) => {
    e.stopPropagation()
    setChatHistory(prev => {
      const next = prev.filter(s => s.id !== id)
      saveHistory(next)
      return next
    })
    if (id === currentSessionId) startNewChat()
  }

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current
      chatContainerRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' })
    }
  }

  useEffect(() => { scrollToBottom() }, [messages, isTyping])
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSend = async (text, opts = {}) => {
    const query = (text || input).trim()
    if (!query) return

    const userMsg = { role: 'user', content: query, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // --- Check for recommendation intent first ---
    // opts.recType / opts.city can be forced by quick-action chips (bypass NLP)
    const recIntent = opts.recType || detectRecommendationIntent(query)
    if (recIntent) {
      const city = opts.city || extractLocation(query)
      const spec = opts.spec || extractSpecialization(query)
      try {
        if (recIntent === 'lawyer') {
          const matchData = await smartMatchLawyers(query);
          let results = [];
          if (matchData && matchData.results && matchData.results.length > 0) {
            results = [...matchData.results];
          }
          
          // Always merge dummy lawyers to ensure robust profiles
          const dummyMatches = dummyLawyers.filter(l => {
            const ALLOWED_STATES = ['delhi', 'new delhi', 'uttar pradesh', 'haryana'];
            const inRegion = ALLOWED_STATES.includes((l.state || '').toLowerCase());
            const locMatch = city ? (l.city || '').toLowerCase().includes(city) : true;
            const specMatch = spec ? (l.specialization || '').toLowerCase().includes(spec.toLowerCase()) : true;
            return inRegion && locMatch && specMatch;
          });
          results = [...results, ...dummyMatches];

          if (results.length > 0) {
            const shuffled = [...results].sort(() => Math.random() - 0.5);
            const signatureList = shuffled.filter(l => l.isSignature || String(l.package).toLowerCase() === 'signature' || String(l.plan).toLowerCase() === 'signature');
            const normalList = shuffled.filter(l => !(l.isSignature || String(l.package).toLowerCase() === 'signature' || String(l.plan).toLowerCase() === 'signature'));
            
            const topSig = signatureList.slice(0, 3);
            const remainingSlots = Math.max(0, results.length - topSig.length);
            const fillers = normalList.slice(0, remainingSlots);
            
            results = [...topSig, ...fillers];
          }

          setMessages(prev => [...prev, {
            role: 'assistant',
            id: Date.now() + 1,
            is_recommendation: true,
            rec_type: 'lawyer',
            rec_items: results.slice(0, 5),
            rec_query: query,
            city, spec,
            intentLabel: 'Lawyer Finder',
            sentiment: 0,
            cards: [],
            sources: [],
          }])
        } else {
          const matchData = await smartMatchFirms(query);
          let results = [];
          if (matchData && matchData.results && matchData.results.length > 0) {
            results = [...matchData.results];
          }
          
          // Merge dummy firms — match by city OR fall back to all allowed-region firms
          const dummyFirmsMatches = dummyLawFirms.filter(f => {
            const ALLOWED_STATES = ['delhi', 'new delhi', 'uttar pradesh', 'haryana'];
            const inRegion = ALLOWED_STATES.includes((f.state || '').toLowerCase());
            // If city extracted, match city; otherwise show all in-region firms
            const locMatch = city
              ? (f.city || '').toLowerCase().includes(city) ||
                (f.state || '').toLowerCase().includes(city)
              : true;
            const specMatch = spec
              ? (f.practiceAreas?.join(' ') || '').toLowerCase().includes(spec.toLowerCase())
              : true;
            return inRegion && locMatch && specMatch;
          });
          results = [...results, ...dummyFirmsMatches];

          if (results.length > 0) {
            const shuffled = [...results].sort(() => Math.random() - 0.5);
            const signatureList = shuffled.filter(l => l.isSignature || String(l.package).toLowerCase() === 'signature');
            const normalList = shuffled.filter(l => !(l.isSignature || String(l.package).toLowerCase() === 'signature'));
            const topSig = signatureList.slice(0, 3);
            const fillers = normalList.slice(0, Math.max(0, 5 - topSig.length));
            results = [...topSig, ...fillers];

            setMessages(prev => [...prev, {
              role: 'assistant',
              id: Date.now() + 1,
              is_recommendation: true,
              rec_type: 'firm',
              rec_items: results.slice(0, 5),
              rec_query: query,
              city, spec,
              intentLabel: 'Firm Finder',
              sentiment: 0,
              cards: [],
              sources: [],
            }])
          } else {
            // No results — friendly guidance
            setMessages(prev => [...prev, {
              role: 'assistant', id: Date.now() + 1, is_greeting: true,
              greeting_text: `🏛️ No verified law firms found for your query yet.\n\n**Our network currently covers:**\n• 🔴 **Delhi NCR** — New Delhi, Noida, Greater Noida\n• 🟠 **Uttar Pradesh** — Lucknow, Agra, Meerut, Kanpur\n• 🟡 **Haryana** — Gurgaon, Faridabad, Panipat\n\nTry: _"Find law firm in Delhi"_ or _"Corporate law firm in Noida"_`,
              intentLabel: 'Firm Finder', sentiment: 0, cards: [], sources: [],
            }])
          }
        }
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant', id: Date.now() + 1, is_greeting: true,
          greeting_text: '⚠️ Could not fetch recommendations right now. Please try again.',
          intentLabel: 'Error', sentiment: 0, cards: [], sources: [],
        }])
      } finally {
        setIsTyping(false)
      }
      return
    }

    // Try chatbotData match first before hitting backend
    const msgLower = query.toLowerCase().trim();

    const conversationalData = [greetings, farewells, thanks, acknowledgements, aboutBot].filter(Boolean);
    for (const item of conversationalData) {
      if (item.keywords?.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(msgLower))) {
         const reply = Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses;
         await new Promise(r => setTimeout(r, 500));
         setMessages(prev => [...prev, {
            role: 'assistant',
            id: Date.now() + 1,
            is_greeting: true,
            greeting_text: reply,
            intro: reply,
            intentLabel: 'Greeting',
            sentimentLabel: 'Neutral',
            sentiment: 0,
            sources: [],
            cards: [],
         }]);
         setIsTyping(false);
         return;
      }
    }

    for (const item of [...legalInfo, ...customQA]) {
      if (item.keywords.some(kw => msgLower.includes(kw))) {
         const reply = Array.isArray(item.responses) ? item.responses[Math.floor(Math.random() * item.responses.length)] : item.responses;
         await new Promise(r => setTimeout(r, 500));
         setMessages(prev => [...prev, {
            role: 'assistant',
            id: Date.now() + 1,
            intro: reply,
            cards: [],
            intentLabel: 'Legal Info',
            sentimentLabel: 'Neutral',
            sentiment: 0,
            sources: [],
            is_greeting: false,
            greeting_text: '',
         }]);
         setIsTyping(false);
         return;
      }
    }

    // --- Default: legal information from AI ---
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/chat/legal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history: [] })
      })

      if (!response.ok) throw new Error('API Error')
      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        id: Date.now() + 1,
        intro: data.intro || '',
        cards: data.cards || [],
        intentLabel: data.intent,
        sentimentLabel: data.sentiment,
        sentiment: data.sentiment?.includes('URGENT') ? 1 : data.sentiment?.includes('Positive') ? 2 : 0,
        sources: data.sources || [],
        is_greeting: data.is_greeting || false,
        greeting_text: data.greeting_text || '',
        needs_location: data.needs_location || false,
        detected_spec: data.detected_spec || '',
      }])
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        id: Date.now() + 1,
        is_greeting: true,
        greeting_text: "⚠️ I'm having trouble connecting right now. Please try again in a moment.",
        intentLabel: 'Error',
        sentimentLabel: 'Neutral',
        sentiment: 0,
        cards: [],
        sources: [],
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Auto-send initialQuery passed via route state on first mount
  // e.g. navigate('/lxwyerai', { state: { initialQuery: 'find law firm in delhi' } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const q = location?.state?.initialQuery
    if (q) setTimeout(() => handleSend(q), 500)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCard = (card, ctx) => { setExpandedCard(card); setExpandedCtx(ctx) }
  const closeCard = () => { setExpandedCard(null); setExpandedCtx(null) }

  // ── Semantic color helpers keyed to dm ──────────────────────────────────
  // ── Strict monochrome palette for LxwyerAI standalone ─────────────────
  const bg = dm ? 'bg-black' : 'bg-white'
  const surfaceBg = dm ? 'bg-black' : 'bg-white'
  const borderCol = dm ? 'border-zinc-800' : 'border-zinc-200'
  const textPrimary = dm ? 'text-white' : 'text-zinc-900'
  const textMuted = dm ? 'text-zinc-500' : 'text-zinc-500'
  const inputBg = dm ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/70 border-zinc-300'
  const suggCard = dm ? 'bg-zinc-900/70 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600' : 'bg-zinc-50 border-zinc-200 hover:bg-white hover:border-zinc-400'
  const typingBg = dm ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
  const msgAst = dm ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-500 text-white'

  return (
    <div className={`flex ${embedded ? 'h-full w-full' : 'h-screen w-full'} ${bg} font-sans overflow-hidden transition-colors duration-300 relative`}>

      {/* Background Decor (standalone only) */}
      {!embedded && (
        <div className={`absolute inset-0 -z-10 ${dm ? 'bg-black' : 'bg-white'}`} />
      )}

      {/* Sidebar (standalone only) */}
      {!embedded && (
        <aside className={`fixed inset-y-0 left-0 z-30 w-44 ${dm ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'} border-r flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className={`p-4 border-b ${borderCol} shrink-0`}>
            <div className="flex items-center justify-between">
              <h1 className={`font-bold text-base ${textPrimary} leading-tight`}>Lxwyer <span className="text-blue-400">AI</span></h1>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-widest">v0.1</span>
            </div>
            <p className={`text-[10px] ${textMuted} mt-0.5`}>Indian Legal Intelligence Engine</p>
          </div>

          {/* New Chat button */}
          <div className={`px-3 pt-3 shrink-0`}>
            <button
              onClick={startNewChat}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border border-dashed transition-all
                ${dm ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-white/[0.04]' : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="text-base">+</span> New Chat
            </button>
          </div>

          {/* Chat history list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {chatHistory.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6 opacity-60`}>No previous chats</p>
            ) : chatHistory.map(session => (
              <div
                key={session.id}
                onClick={() => loadSession(session)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm
                  ${session.id === currentSessionId
                    ? (dm ? 'bg-white/[0.08] text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-200')
                    : (dm ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
              >
                <span className="flex-1 truncate">{session.title}</span>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all shrink-0
                    ${dm ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                  title="Delete this chat"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div className={`p-3 border-t ${borderCol} space-y-1 shrink-0`}>
            <button
              onClick={startNewChat}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${dm ? 'text-red-400 hover:bg-red-900/10' : 'text-red-600 hover:bg-red-50'} transition-all text-sm font-medium`}
            >
              <Trash2 size={16} /> Clear Chat
            </button>
            <button onClick={() => navigate('/home')} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${dm ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} transition-all text-sm font-medium`}>
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">

        {/* Standalone Header */}
        {!embedded && (
          <header className={`h-14 px-4 md:px-6 border-b ${borderCol}/50 flex items-center justify-between ${dm ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm absolute top-0 w-full z-20`}>
            {/* Left: mobile menu toggle + PREMIUM banner */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`md:hidden p-2 -ml-2 ${dm ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'} rounded-lg`}>
                <Menu size={20} />
              </button>
              <div className="hidden md:flex items-center gap-2">
                <span className={`font-bold text-sm ${textPrimary}`}>Lxwyer<span className="text-blue-400">AI</span></span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-widest">v0.1</span>
              </div>
            </div>

            {/* Right: About & Guidelines + Safety badge */}
            <div className="flex items-center gap-3 relative">
              {/* About & Guidelines toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowGuidelines(g => !g)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${showGuidelines
                      ? (dm ? 'bg-white/10 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-400 text-slate-700')
                      : (dm ? 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200' : 'bg-slate-100/80 border-slate-200 text-slate-500 hover:text-slate-700')}`}
                >
                  <Info size={12} />
                  <span>About &amp; Guidelines</span>
                  <ChevronDown size={11} className={`transition-transform ${showGuidelines ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown panel */}
                {showGuidelines && (
                  <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden
                    ${dm ? 'bg-[#111] border-white/10 shadow-black/60' : 'bg-white border-slate-200 shadow-slate-200/80'}`}>
                    <div className={`px-4 py-3 border-b ${dm ? 'border-white/5' : 'border-slate-100'} flex items-center justify-between`}>
                      <span className={`text-xs font-bold uppercase tracking-widest ${dm ? 'text-slate-300' : 'text-slate-700'}`}>About &amp; Guidelines</span>
                      <button onClick={() => setShowGuidelines(false)} className={`p-1 rounded-lg ${dm ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}><X size={14} /></button>
                    </div>
                    <div className={`px-4 py-4 space-y-3 text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                      <p>AI-powered legal info based on <strong className={dm ? 'text-slate-200' : 'text-slate-800'}>Indian Constitution, IPC, and BNS</strong>.</p>
                      <p>Best for understanding laws, rights, procedures, and general legal terms.</p>
                      <p>For lawyer or firm recommendations, ask: <em>"Find a lawyer in Delhi"</em></p>
                      <p className={`font-semibold pt-1 border-t ${dm ? 'border-white/5 text-amber-400/80' : 'border-slate-100 text-amber-700'}`}>Not a substitute for professional legal advice. Always consult a qualified advocate for your case.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Safety badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border
                ${dm ? 'bg-white/[0.04] border-white/10 text-slate-400' : 'bg-slate-100/80 border-slate-200/80 text-slate-500'}`}>
                <ShieldCheck size={13} className={dm ? 'text-slate-400' : 'text-slate-500'} />
                <span className="hidden sm:inline">Safety Protocols Active</span>
              </div>
            </div>
          </header>
        )}

        {/* Chat Area */}
        <div ref={chatContainerRef} className={`flex-1 overflow-y-auto ${embedded ? 'px-2 md:px-6 py-6' : 'px-4 md:px-8 py-6 pt-20'}`}>
          <GenerativeBubble active={messages.length > 0 && input.length === 0} typing={input.length > 0} color="#3b82f6" />


          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto" style={{ position: 'relative', zIndex: 1, animation: 'fadeSlideUp 0.7s ease 0.35s both' }}>
              <h2 className={`text-3xl font-extrabold text-white mb-1 tracking-tight`}>
                Lxwyer<span className="text-blue-400">AI</span> <span className="text-blue-400 text-xl">v0.1</span>
              </h2>
              <p className={`text-xs ${textMuted} mb-2`}>Indian Legal Intelligence Engine</p>
              <div className={`flex flex-wrap gap-2 justify-center mb-6 text-[10px] font-medium`}>
                {['Auto-detects specialization','Finds lawyers by city','Covers BNS • IPC • BNSS • CPC','No ratings — only experience'].map((f,i)=>(
                  <span key={i} className={`px-2.5 py-1 rounded-full border ${dm?'bg-slate-900 border-slate-700 text-slate-400':'bg-slate-100 border-slate-200 text-slate-500'}`}>{f}</span>
                ))}
              </div>

              {/* 2 small flat pill buttons */}
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                {SUGGESTED_QUERIES.slice(0, 2).map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sq.text, sq.opts || {})}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 backdrop-blur-sm
                      ${dm
                        ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                        : 'bg-white/70 border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                      }`}
                  >
                    <span>{sq.icon}</span>
                    <span>{sq.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-full flex flex-col space-y-8 max-w-4xl mx-auto pb-6 px-4 sm:px-6" style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex-1" />
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-4 duration-500`}>
                  {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user'
                    ? (dm ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600')
                    : (dm ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white')
                    }`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>

                  {/* Message bubble */}
                  <div className={`flex flex-col gap-2 w-[calc(100vw-5rem)] md:w-auto sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                    {/* USER bubble — monochrome */}
                    {msg.role === 'user' && (
                      <div className={`px-5 py-3 rounded-3xl rounded-tr-sm shadow-sm ${dm ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white'}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    )}

                    {/* ASSISTANT — greeting (plain text, with markdown bullets) */}
                    {msg.role === 'assistant' && msg.is_greeting && (
                      <div className={`px-5 py-4 rounded-3xl rounded-tl-sm ${msgAst} border shadow-sm`}>
                        {(msg.greeting_text || '').split('\n').map((line, li) => {
                          if (!line.trim()) return <div key={li} className="h-1" />
                          const parts = line.split(/\*\*([^*]+)\*\*/g)
                          const formatted = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
                          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                            return <p key={li} className="flex gap-2 text-sm leading-relaxed mb-0.5"><span className="text-blue-400 mt-0.5">•</span><span>{formatted}</span></p>
                          }
                          return <p key={li} className="text-sm leading-relaxed">{formatted}</p>
                        })}
                      </div>
                    )}

                    {/* ASSISTANT — recommendation cards */}
                    {msg.role === 'assistant' && msg.is_recommendation && (
                      <div className="w-full space-y-3 max-w-full">
                        {/* Humanized intro */}
                        <div className={`px-4 py-3.5 rounded-2xl rounded-tl-sm ${msgAst} border shadow-sm`}>
                          <p className={`text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>
                            {msg.rec_items.length > 0
                              ? msg.rec_type === 'lawyer'
                                ? `Great news! I found ${msg.rec_items.length} lawyer${msg.rec_items.length > 1 ? 's' : ''}` + (msg.city ? ` in ${msg.city.charAt(0).toUpperCase() + msg.city.slice(1)}` : '') + ` who match your needs. Here are the best options for you:`
                                : `I found ${msg.rec_items.length} law firm${msg.rec_items.length > 1 ? 's' : ''}` + (msg.city ? ` in ${msg.city.charAt(0).toUpperCase() + msg.city.slice(1)}` : '') + ` that could be a great fit:`
                              : msg.rec_type === 'lawyer'
                                ? `I appreciate your interest, but currently, we only operate and provide verified lawyers within **Delhi, Uttar Pradesh, and Haryana**. We do not have lawyers in your requested location at this time.`
                                : `I appreciate your interest, but currently, we only operate and provide verified firms within **Delhi, Uttar Pradesh, and Haryana**. We do not have firms in your requested location at this time.`
                            }
                          </p>
                        </div>
                        {msg.rec_items.map((item, i) => (
                          msg.rec_type === 'lawyer'
                            ? <LawyerCard
                                key={item.id || item._id || i}
                                lawyer={item}
                                dm={dm}
                                onProfileClick={(l) => navigate(`/lawyer/${l.id || l._id}`, { state: { lawyer: l } })}
                                onBookClick={(l) => navigate('/book-consultation-signup', { state: { lawyer: l } })}
                              />
                            : <FirmCard key={item.id || item._id || i} firm={item} expanded={true} dm={dm} />
                        ))}
                        {msg.rec_items.length > 0 && (
                          <button
                            onClick={() => navigate(msg.rec_type === 'lawyer' ? '/find-lawyer/manual' : '/find-lawfirm/manual')}
                            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              } transition-colors`}
                          >
                            Browse all {msg.rec_type === 'lawyer' ? 'lawyers' : 'law firms'} <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* ASSISTANT — legal response (cards) */}
                    {msg.role === 'assistant' && !msg.is_greeting && !msg.is_recommendation && (
                      <div className="w-full space-y-3">

                        {/* Intent + Sentiment badges + intro */}
                        <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${msgAst} border shadow-sm`}>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${dm ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{msg.intentLabel}</span>
                            {msg.sentiment === 1 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-900/30 text-red-400 border-red-800"><Zap size={10} /> URGENT</span>
                            )}
                          </div>
                          {(msg.intro || '').split('\n').map((line, li) => {
                            if (!line.trim()) return <div key={li} className="h-1" />
                            const parts = line.split(/\*\*([^*]+)\*\*/g)
                            const fmt = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
                            return <p key={li} className={`text-sm leading-relaxed ${textMuted}`}>{fmt}</p>
                          })}
                        </div>

                        {/* Summary cards grid */}
                        {msg.cards && msg.cards.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.cards.map((card, i) => (
                              <button
                                key={card.id}
                                onClick={() => openCard(card, msg)}
                                className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group ${dm
                                  ? 'bg-zinc-900 border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-800/80'
                                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                  } animate-in zoom-in duration-300 fill-mode-backwards`}
                                style={{ animationDelay: `${i * 80}ms` }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className={`text-2xl p-2 rounded-xl ${dm ? 'bg-zinc-800' : 'bg-slate-100'} group-hover:scale-110 transition-transform`}>{card.icon}</span>
                                  <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md ${dm ? 'bg-zinc-800 text-blue-400 border border-zinc-700' : 'bg-blue-50 text-blue-500 border border-blue-100'} flex items-center gap-1`}>
                                    <ArrowRight size={9} /> Expand
                                  </span>
                                </div>
                                <h4 className={`font-bold text-sm mb-2 ${dm ? 'text-white' : 'text-slate-900'}`}>{card.title}</h4>
                                {/* Bullet-point summary */}
                                <div className={`space-y-0.5`}>
                                  {(card.summary || '').split('\n').filter(l => l.trim()).map((line, li) => (
                                    <p key={li} className={`text-xs ${textMuted} flex gap-1.5 items-start leading-relaxed`}>
                                      <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                                      <span>{line.replace(/^[•\-]\s*/, '')}</span>
                                    </p>
                                  ))}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Location follow-up prompt */}
                        {msg.needs_location && (
                          <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border ${dm ? 'bg-blue-950/40 border-blue-800/50 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                            <MapPin size={14} className="shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">
                              <strong>To find verified lawyers near you</strong> — tell me your <strong>city</strong> (e.g. Delhi, Mumbai, Bangalore). You can also mention your preferred <strong>fee range</strong> (e.g. under ₹5000/hr) or <strong>consultation mode</strong> (in-person / video call).
                            </p>
                          </div>
                        )}

                        {/* Sources row */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>📚 Sources:</span>
                            {msg.sources.map((src, i) => (
                              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${dm ? 'bg-zinc-800 text-slate-400 border-zinc-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{src}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4 max-w-4xl justify-start animate-in fade-in duration-300">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white shrink-0 shadow-md`}>
                    <Bot size={18} />
                  </div>
                  <div className={`p-4 rounded-3xl rounded-tl-sm ${typingBg} border flex items-center gap-3 shadow-sm`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 ${dm ? 'bg-slate-400' : 'bg-slate-500'} rounded-full animate-bounce [animation-delay:-0.3s]`} />
                      <div className={`w-2 h-2 ${dm ? 'bg-slate-400' : 'bg-slate-500'} rounded-full animate-bounce [animation-delay:-0.15s]`} />
                      <div className={`w-2 h-2 ${dm ? 'bg-slate-400' : 'bg-slate-500'} rounded-full animate-bounce`} />
                    </div>
                    <span className={`text-xs font-medium ${textMuted}`}>Processing legal data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-4 md:p-6 pb-8 ${dm
          ? 'bg-gradient-to-t from-black via-black/90 to-transparent'
          : 'bg-gradient-to-t from-white via-white/90 to-transparent'} z-20`}>
          <div className="max-w-4xl mx-auto relative group">

            {/* ── Persistent Quick-Action Chips ── always visible */}
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {[
                { label: '🏛️ Find Law Firm in Delhi',    opts: { recType: 'firm',   city: 'delhi' },  query: 'Find law firm in Delhi' },
                { label: '⚖️ Recommend Lawyer in Delhi', opts: { recType: 'lawyer', city: 'delhi' },  query: 'Recommend a lawyer in Delhi' },
                { label: '🔍 Criminal Lawyer Delhi',     opts: { recType: 'lawyer', city: 'delhi', spec: 'Criminal Law' }, query: 'Find a criminal lawyer in Delhi' },
                { label: '🏠 Property Lawyer Delhi',    opts: { recType: 'lawyer', city: 'delhi', spec: 'Property Law' }, query: 'Find a property lawyer in Delhi' },
              ].map((chip) => (
                <button
                  key={chip.query}
                  onClick={() => handleSend(chip.query, chip.opts)}
                  disabled={isTyping}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                    ${dm
                      ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:border-blue-500/60 hover:text-white hover:bg-zinc-800'
                      : 'bg-white/80 border-zinc-300 text-zinc-600 hover:border-blue-400 hover:text-zinc-900 hover:bg-white'
                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="absolute inset-0 rounded-full blur-3xl opacity-0 group-hover:opacity-0" />
            <div className={`relative flex items-center gap-2 p-1.5 pl-5 ${inputBg} border rounded-full shadow-xl focus-within:border-zinc-600 transition-all backdrop-blur-2xl`} style={{ outline: 'none' }}>
              <input
                ref={inputRef}
                className={`flex-1 bg-transparent border-none ${textPrimary} ${dm ? 'placeholder-slate-600' : 'placeholder-slate-400'} font-medium py-2 text-sm`}
                style={{ outline: 'none', boxShadow: 'none' }}
                placeholder="Ask a legal question or find a lawyer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-full transition-all duration-300 transform ${!input.trim() || isTyping
                  ? (dm ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-200 text-zinc-400') + ' cursor-not-allowed scale-90'
                  : 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95'
                  }`}
              >
                <div className={`transition-transform duration-300 ${isTyping ? 'animate-spin' : ''}`}>
                  {isTyping ? <Sparkles size={18} /> : <Send size={18} className={input.trim() ? 'translate-x-0.5 translate-y-0.5' : ''} />}
                </div>
              </button>
            </div>
            <p className={`text-center text-[10px] uppercase tracking-widest ${dm ? 'text-slate-600' : 'text-slate-400'} mt-4 font-semibold opacity-70`}>
              AI-Generated Information • Verify with Counsel
            </p>
          </div>
        </div>
      </main >

      {/* Expanded Card Modal */}
      {
        expandedCard && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${dm ? 'bg-black/80' : 'bg-slate-900/40'} backdrop-blur-md animate-in fade-in duration-300`} onClick={closeCard}>
            <div className={`${dm ? 'bg-slate-950 border-slate-800' : 'bg-white border-white/20'} w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border animate-in zoom-in-95 duration-300 ring-1 ring-black/5`} onClick={e => e.stopPropagation()}>
              <div className={`p-6 md:p-8 ${dm ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-slate-50 to-white border-slate-100'} border-b flex items-start justify-between shrink-0`}>
                <div className="flex gap-5">
                  <div className={`text-4xl p-4 ${dm ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} rounded-2xl shadow-sm border`}>{expandedCard.icon}</div>
                  <div>
                    <h2 className={`text-2xl font-bold ${textPrimary} mb-1`}>{expandedCard.title}</h2>
                    <p className={`text-sm font-medium ${textMuted}`}>{expandedCard.summary}</p>
                  </div>
                </div>
                <button onClick={closeCard} className={`p-2 ${dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} rounded-full transition-all`}>
                  <X size={20} />
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${dm ? 'bg-slate-950' : 'bg-white'}`}>
                {/* Render card.detail markdown */}
                <div className={`space-y-2 text-sm leading-7 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                  {(expandedCard.detail || '').split('\n').map((line, i) => {
                    if (line.trim() === '') return <div key={i} className="h-2" />
                    // Bold **text**
                    const parts = line.split(/\*\*([^*]+)\*\*/g)
                    const formatted = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
                    // Numbered list
                    if (/^\d+\./.test(line.trim())) {
                      return <p key={i} className="flex gap-2 mb-1"><span className={`font-bold ${dm ? 'text-blue-400' : 'text-blue-600'}`}>{line.trim().match(/^\d+\./)}</span><span>{formatted}</span></p>
                    }
                    // Bullet point
                    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                      return <p key={i} className="flex gap-2 pl-2 mb-1"><span className={dm ? 'text-blue-400' : 'text-blue-500'}>•</span><span>{formatted}</span></p>
                    }
                    // Heading (emoji prefix or **bold** only line)
                    if (parts.length === 3 && parts[0].trim() === '' && parts[2].trim() === '') {
                      return <p key={i} className={`font-bold text-base mt-4 mb-1 ${dm ? 'text-white' : 'text-slate-900'}`}>{parts[1]}</p>
                    }
                    // Italic / disclaimer
                    if (line.trim().startsWith('*') && line.trim().endsWith('*')) {
                      return <p key={i} className={`text-xs italic ${textMuted} mt-3`}>{line.replace(/\*/g, '')}</p>
                    }
                    return <p key={i} className="mb-1">{formatted}</p>
                  })}
                </div>
              </div>

              <div className={`p-4 ${dm ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'} border-t`}>
                <button onClick={closeCard} className={`w-full py-3 ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border rounded-xl font-medium transition-colors`}>
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

function ExpandedCardContent({ cardId, ctx, dm }) {
  const intent = ctx?.intent ?? 0
  const intentLabels = ['Criminal Law', 'Family/Civil Law', 'Corporate/Business Law']

  const textMuted = dm ? 'text-slate-400' : 'text-slate-500'
  const textBody = dm ? 'text-slate-300' : 'text-slate-700'

  const Section = ({ title, children }) => (
    <div className={`p-5 ${dm ? 'bg-slate-900/30 border-slate-800/50' : 'bg-slate-50/50 border-slate-100'} rounded-2xl border`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${textMuted} mb-3 flex items-center gap-2`}>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {title}
      </h3>
      <div className={`${textBody} leading-7 text-[15px]`}>{children}</div>
    </div>
  )

  const List = ({ items }) => (
    <ul className="space-y-3 mt-2">
      {items.map((item, i) => (
        <li key={i} className={`flex gap-3 ${textBody} text-[15px]`}>
          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  )

  switch (cardId) {
    case 'case-overview': return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 ${dm ? 'bg-blue-900/20 text-blue-300 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-100'} rounded-lg text-xs font-bold border`}>{intentLabels[intent]}</span>
        </div>
        <Section title="Legal Summary">
          {intent === 0 ? 'This query falls under Criminal Law in India. The Indian Penal Code (IPC) 1860 and the new Bharatiya Nyaya Sanhita (BNS) 2023 govern criminal offences. Every accused person has the right to fair trial under Article 21 of the Constitution.' :
            intent === 1 ? 'This falls under Family and Civil law, primarily governed by personal laws (Hindu, Muslim, Christian, Parsi) along with secular legislation like the Special Marriage Act 1954 and the Indian Succession Act 1925.' :
              'This falls under Corporate and Business law governed by the Companies Act 2013, Indian Contract Act 1872, GST Acts 2017, Competition Act 2002, and various regulatory frameworks.'}
        </Section>
      </div>
    )
    case 'applicable-laws': return (
      <div className="space-y-6">
        <Section title="Primary Legislation">
          {intent === 0 ? <List items={['Indian Penal Code (IPC), 1860', 'Bharatiya Nyaya Sanhita (BNS), 2023', 'Code of Criminal Procedure (CrPC), 1973']} /> :
            <List items={['Hindu Marriage Act, 1955', 'Special Marriage Act, 1954', 'Indian Evidence Act, 1872']} />}
        </Section>
      </div>
    )
    default: return (
      <div className="text-center py-12">
        <Ghost className={`mx-auto h-12 w-12 ${dm ? 'text-slate-700' : 'text-slate-300'} mb-3`} />
        <p className={textMuted}>Detailed content for this section is being updated.</p>
      </div>
    )
  }
}
