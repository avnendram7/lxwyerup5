
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send, ArrowLeft, Sparkles, ShieldCheck, Trash2,
  Info, ArrowRight, Clock, Zap, Scale,
  X, Lightbulb, User, Ghost, Bot, Menu
} from 'lucide-react'
import { NavbarWave } from '../components/NavbarWave'
import { GradientOrbs } from '../components/GradientOrbs'

/* ========== CARD DEFINITIONS ========== */
const CARD_DEFS = [
  { id: 'case-overview', icon: '📋', title: 'Case Overview', preview: 'Quick summary of your legal situation, charges, or dispute', readTime: '2 min' },
  { id: 'applicable-laws', icon: '⚖️', title: 'Applicable Laws & Sections', preview: 'Specific legal provisions, acts, and section numbers relevant here', readTime: '3 min' },
  { id: 'bail-bond', icon: '🔓', title: 'Bail/Bond Information', preview: 'Eligibility, amount, timeline, and conditions for getting bail', readTime: '2 min' },
  { id: 'precedents', icon: '📚', title: 'Precedents & Similar Cases', preview: 'Past judgments, success rates, and how courts typically rule', readTime: '4 min' },
  { id: 'timeline', icon: '⏱️', title: 'Timeline & Procedure', preview: 'Step-by-step process and expected duration at each stage', readTime: '3 min' },
  { id: 'penalties', icon: '💰', title: 'Potential Penalties & Outcomes', preview: 'Possible consequences, fines, imprisonment, and best/worst cases', readTime: '2 min' },
  { id: 'rights', icon: '🛡️', title: 'Rights & Protections', preview: 'Your constitutional and legal rights at every stage', readTime: '3 min' },
  { id: 'documents', icon: '📝', title: 'Required Documents', preview: 'Paperwork needed at each stage and evidence to collect', readTime: '2 min' },
  { id: 'strategy', icon: '👨‍⚖️', title: 'Legal Strategy & Options', preview: 'Defense approaches, settlement options, and tactical considerations', readTime: '4 min' },
  { id: 'considerations', icon: '⚠️', title: 'Important Considerations', preview: 'Critical factors, mistakes to avoid, red flags, and urgent actions', readTime: '2 min' },
  { id: 'next-steps', icon: '🔍', title: 'Next Steps', preview: 'Immediate actions, how to find a lawyer, and resources available', readTime: '2 min' },
]

/* ========== SUGGESTIONS ========== */
const SUGGESTED_QUERIES = [
  { text: 'What is murder under IPC?', icon: '👮' },
  { text: 'How to file for divorce?', icon: '🏠' },
  { text: 'Steps for company incorporation', icon: '💼' },
  { text: 'What are my rights during arrest?', icon: '⚖️' },
]

/* ========== CLASSIFIERS ========== */
const CRIMINAL_KW = ['murder', 'theft', 'assault', 'fir', 'bail', 'arrest', 'jail', 'crime', 'police', 'warrant', 'ipc', 'penal', 'robbery', 'kidnap', 'fraud', 'cheat', 'forgery', 'section 302', 'section 420', 'killing']
const FAMILY_KW = ['divorce', 'marriage', 'custody', 'alimony', 'property', 'will', 'ancestral', 'tenant', 'landlord', 'rent', 'inheritance', 'child', 'adoption', 'dowry', 'domestic', 'maintenance']
const CORPORATE_KW = ['company', 'gst', 'tax', 'incorporation', 'startup', 'contract', 'agreement', 'salary', 'employment', 'cheque', 'corporate', 'share', 'director', 'compliance', 'trademark', 'patent']
const GREETING_KW = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']

const INTENT_LABELS = ['Criminal Law 👮', 'Family/Civil 🏠', 'Corporate 💼']
const SENTIMENT_LABELS = ['Neutral 😐', 'URGENT 🚨', 'Positive 🟢']

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

function generateResponse(query) {
  const lower = query.toLowerCase().trim()
  if (GREETING_KW.includes(lower)) {
    return {
      acknowledgment: "Hello! I am **LxwyerAI**, your AI Legal Assistant. I can help you with Indian laws, legal procedures, and rights.\n\nHow can I assist you today?",
      cards: null, intent: null, sentiment: null, isGreeting: true,
    }
  }
  const intent = classifyIntent(query)
  const sentiment = classifySentiment(query)
  const intentLabel = INTENT_LABELS[intent]
  const sentimentLabel = SENTIMENT_LABELS[sentiment]
  const acknowledgment = `Thank you for reaching out. I've analyzed your query about **"${query}"** and classified it under **${intentLabel}** with **${sentimentLabel}** sentiment.\n\n⚠️ *DISCLAIMER: I provide legal information, not legal advice. For your specific situation, please consult a qualified attorney.*\n\nI've organized all the information you need into easy-to-navigate cards below. Click on any card to see detailed information.`
  return { acknowledgment, cards: CARD_DEFS, intent, sentiment, intentLabel, sentimentLabel, isGreeting: false, query }
}

export default function QuickChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [expandedCtx, setExpandedCtx] = useState(null)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSend = async (text) => {
    const query = (text || input).trim()
    if (!query) return

    // 1. Add User Message
    const userMsg = { role: 'user', content: query, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // 2. Call Backend API
      const response = await fetch('http://localhost:5001/api/chat/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history: [] }) // Simple history for now
      })

      if (!response.ok) throw new Error('API Error')

      const data = await response.json()

      // 3. Add Assistant Message
      setMessages(prev => [...prev, {
        role: 'assistant',
        id: Date.now() + 1,
        content: data.response, // The main text
        intentLabel: data.intent,
        sentimentLabel: data.sentiment,
        sentiment: data.sentiment === 'URGENT 🚨' ? 1 : data.sentiment === 'Positive 🟢' ? 2 : 0,
        cards: null, // We can restore cards logic later if needed
        isGreeting: data.intent === 'Greeting/Casual 💬'
      }])

    } catch (error) {
      console.error("Chat Error:", error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        id: Date.now() + 1,
        content: "I apologize, but I'm having trouble connecting to my legal database right now. Please try again later.",
        sentimentLabel: "Error ⚠️",
        sentiment: 0
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const openCard = (card, ctx) => { setExpandedCard(card); setExpandedCtx(ctx) }
  const closeCard = () => { setExpandedCard(null); setExpandedCtx(null) }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black -z-10" />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Scale size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">Lxwyer <span className="text-blue-600 dark:text-blue-400">AI</span></h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Legal Intelligence</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">About This Assistant</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    AI-powered legal information based on Indian Constitution, IPC, and BNS. Not a substitute for professional legal advice.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">AI Pipeline</h4>
              <div className="space-y-1">
                {['Sentiment Analysis', 'Intent Classification', 'RAG Legal Search', 'Answer Generation', 'Safety Check', 'Recommendations'].map((step, idx) => (
                  <div key={step} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 group transition-colors">
                    <div className={`w-2 h-2 rounded-full ${idx === 5 ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 transition-colors'}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button onClick={() => setMessages([])} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-sm font-medium">
              <Trash2 size={16} /> Clear Chat
            </button>
            <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-sm font-medium">
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full">
        {/* Header */}
        <header className="h-16 px-4 md:px-8 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm absolute top-0 w-full z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">System Online</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Safety Protocols Active</span>
          </div>
        </header>

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pt-20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 ring-1 ring-blue-500/20 backdrop-blur-xl">
                <Scale size={48} className="text-blue-600 dark:text-blue-400 drop-shadow-lg" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">LxwyerAI</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg">
                Your intelligent legal companion. Ask about criminal charges, family disputes, or corporate regulations in India.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTED_QUERIES.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sq.text)}
                    className="group flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left backdrop-blur-sm"
                  >
                    <span className="text-xl p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">{sq.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{sq.text}</span>
                    <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto pb-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                    }`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>

                  <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-5 rounded-3xl shadow-sm backdrop-blur-sm ${msg.role === 'user'
                      ? 'bg-blue-600 dark:bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      }`}>
                      {msg.role === 'assistant' && !msg.isGreeting && msg.intentLabel && (
                        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100/50 dark:border-slate-700/50">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${msg.sentiment === 1 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' :
                            msg.sentiment === 2 ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' :
                              'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                            <Zap size={10} /> {msg.sentimentLabel}
                          </span>
                        </div>
                      )}

                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                        {(msg.acknowledgment || msg.content || '').split('\n').map((line, i) => (
                          line.trim() === '' ? <div key={i} className="h-3" /> : <p key={i} className="mb-1">{line.replace(/\*\*/g, '')}</p>
                        ))}
                      </div>

                      {msg.role === 'assistant' && msg.cards && (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
                          {msg.cards.map((card, i) => (
                            <button
                              key={card.id}
                              className="text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group animate-in zoom-in duration-500 fill-mode-backwards"
                              style={{ animationDelay: `${i * 0.1}s` }}
                              onClick={() => openCard(card, { intent: msg.intent, sentiment: msg.sentiment, query: msg.query })}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="text-2xl p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">{card.icon}</div>
                                <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md flex items-center gap-1">
                                  <Clock size={10} /> {card.readTime}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{card.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{card.preview}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 max-w-4xl justify-start animate-in fade-in duration-300">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot size={18} />
                  </div>
                  <div className="p-4 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Processing legal data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* New Input Area Design - Glowing Sphere Style */}
        <div className="p-4 md:p-6 pb-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent z-20">
          <div className="max-w-4xl mx-auto relative group">
            {/* Ambient Glow behind input */}
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center gap-2 p-2 pl-6 bg-slate-900/5 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/80 rounded-full shadow-2xl shadow-slate-200/20 dark:shadow-black/40 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-500/20 transition-all backdrop-blur-2xl">
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium py-3 text-lg"
                placeholder="Ask a legal question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={`
                  p-4 rounded-full transition-all duration-300 transform
                  ${!input.trim() || isTyping
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-90'
                    : 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] hover:scale-105 active:scale-95'
                  }
                `}
              >
                <div className={`transition-transform duration-300 ${isTyping ? 'animate-spin' : ''}`}>
                  {isTyping ? <Sparkles size={24} /> : <Send size={24} className={input.trim() ? 'translate-x-0.5 translate-y-0.5' : ''} />}
                </div>
              </button>
            </div>
            <p className="text-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-4 font-semibold opacity-70">
              AI-Generated Information • Verify with Counsel
            </p>
          </div>
        </div>
      </main>

      {/* Expanded Card Modal */}
      {expandedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={closeCard}>
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300 ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0">
              <div className="flex gap-5">
                <div className="text-4xl p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">{expandedCard.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{expandedCard.title}</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock size={14} /> {expandedCard.readTime} read
                  </p>
                </div>
              </div>
              <button onClick={closeCard} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <ExpandedCardContent cardId={expandedCard.id} ctx={expandedCtx} />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <button onClick={closeCard} className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpandedCardContent({ cardId, ctx }) {
  const intent = ctx?.intent ?? 0
  const intentLabels = ['Criminal Law', 'Family/Civil Law', 'Corporate/Business Law']
  const severities = ['🟡 Moderate', '🔴 Serious', '🟢 Minor']

  const styles = {
    h3: "text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2",
    p: "text-slate-700 dark:text-slate-300 leading-7 text-[15px]"
  }

  const Section = ({ title, children }) => (
    <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
      <h3 className={styles.h3}>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {title}
      </h3>
      <div className={styles.p}>{children}</div>
    </div>
  )

  const List = ({ items }) => (
    <ul className="space-y-3 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 text-[15px]">
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
          <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800/50">{intentLabels[intent]}</span>
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
        <Ghost className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Detailed content for this section is being updated.</p>
      </div>
    )
  }
}
