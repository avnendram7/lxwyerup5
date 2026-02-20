import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Send, Bot, Briefcase, MapPin, ArrowRight, X, AlertCircle, CheckCircle, MessageSquare, Sparkles, User, Loader2, Star, Globe, Mic, MicOff, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';
import { Button } from '../components/ui/button';
import { dummyLawFirms, states, practiceAreas } from '../data/lawFirmsData';
import { greetings, farewells, thanks, acknowledgements, aboutBot, legalInfo, customQA, fallbackResponses, caseTypeKeywords, locationKeywords } from '../data/chatbotData';

const ChatMessage = ({ message, isBot }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${isBot ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
      }`}>
      {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
    </div>
    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isBot
      ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'
      : 'bg-blue-600 dark:bg-blue-600 text-white rounded-tr-none shadow-blue-500/20'
      }`}>
      {message.content && <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>}

      {message.cards && (
        <div className="space-y-3 mt-3">
          {message.cards.map((card, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${card.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800' :
              card.type === 'alert' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800' :
                'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600'
              }`}>
              <div className="flex items-start gap-3">
                {card.icon === 'check' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                {card.icon === 'alert' && <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />}
                {card.icon === 'message' && <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{card.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{card.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

export default function FindLawFirmAI() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI consultant for connecting with top law firms. I can help find the right legal partners for your business or personal needs.",
      cards: [
        {
          type: 'info',
          icon: 'message',
          title: 'How can I assist?',
          content: 'Describe your requirements. For example: "Looking for a corporate law firm in Mumbai" or "Need help with intellectual property rights"'
        }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recommendedFirms, setRecommendedFirms] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [allFirms, setAllFirms] = useState(dummyLawFirms);
  const [conversationState, setConversationState] = useState({
    practiceArea: null,
    state: null,
    hasRecommended: false
  });

  // Fetch verified law firms locally
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
          description: firm.description || 'No description provided',
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
          unique_id: firm.unique_id,
          // Ensure fee fields exist for booking
          feeMin: 5000,
          feeRange: "₹5,000 - ₹15,000"
        }));
        setAllFirms([...formattedDbFirms, ...dummyLawFirms]);
      } catch (error) {
        console.error('Error fetching law firms:', error);
        // Fallback to dummy data on error
        setAllFirms(dummyLawFirms);
      }
    };
    fetchFirms();
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const detectPracticeArea = (message) => {
    const msg = message.toLowerCase();
    // Use keywords from imported data if possible, or fallback loop
    for (const [type, keywords] of Object.entries(caseTypeKeywords)) {
      if (keywords.some(kw => msg.includes(kw))) return type;
    }
    // Fallback checks
    if (msg.includes('corporate') || msg.includes('business') || msg.includes('merger')) return 'Corporate Law';
    if (msg.includes('ip') || msg.includes('intellectual') || msg.includes('patent')) return 'Intellectual Property';
    if (msg.includes('tax') || msg.includes('gst')) return 'Tax Law';
    if (msg.includes('real estate') || msg.includes('property')) return 'Real Estate';
    if (msg.includes('criminal')) return 'Criminal Defense';
    if (msg.includes('family') || msg.includes('divorce')) return 'Family Law';
    return null;
  };

  const detectState = (message) => {
    const msg = message.toLowerCase();
    // Sort by key length descending
    const sorted = Object.entries(locationKeywords).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of sorted) {
      if (msg.includes(key)) {
        // Fix: If value is an object (common in locationKeywords), return the city or state name string
        if (typeof value === 'object') {
          return value.city || value.state || key;
        }
        return value;
      }
    }
    // Fallback simple checks
    if (msg.includes('delhi')) return 'Delhi';
    if (msg.includes('mumbai')) return 'Mumbai';
    if (msg.includes('pune')) return 'Pune';
    if (msg.includes('maharashtra')) return 'Maharashtra';
    if (msg.includes('bangalore') || msg.includes('bengaluru')) return 'Bangalore';
    if (msg.includes('karnataka')) return 'Karnataka';
    if (msg.includes('chennai')) return 'Chennai';
    if (msg.includes('tamil nadu')) return 'Tamil Nadu';
    if (msg.includes('hyderabad')) return 'Hyderabad';
    if (msg.includes('telangana')) return 'Telangana';
    if (msg.includes('kolkata')) return 'Kolkata';
    if (msg.includes('west bengal')) return 'West Bengal';
    if (msg.includes('ahmedabad')) return 'Ahmedabad';
    if (msg.includes('gujarat')) return 'Gujarat';
    if (msg.includes('jaipur')) return 'Jaipur';
    if (msg.includes('rajasthan')) return 'Rajasthan';
    if (msg.includes('lucknow')) return 'Lucknow';
    if (msg.includes('noida')) return 'Noida';
    if (msg.includes('uttar pradesh')) return 'Uttar Pradesh';
    return null;
  };

  const recommendFirms = (practiceArea, state) => {
    let filtered = [...allFirms];

    // 1. Filter by Practice Area (if detected)
    if (practiceArea) {
      filtered = filtered.filter(f =>
        f.practiceAreas?.some(pa => pa.toLowerCase().includes(practiceArea.toLowerCase())) ||
        f.practiceAreas?.includes(practiceArea)
      );
    }

    // 2. Filter by Location (State OR City)
    if (state && typeof state === 'string') {
      filtered = filtered.filter(f =>
        (f.state && f.state.toLowerCase() === state.toLowerCase()) ||
        (f.city && f.city.toLowerCase() === state.toLowerCase()) ||
        (f.state && f.state.toLowerCase().includes(state.toLowerCase())) ||
        (f.city && f.city.toLowerCase().includes(state.toLowerCase()))
      );
    }

    // Scorable sort
    filtered.sort((a, b) => (b.lawyersCount || 0) - (a.lawyersCount || 0));
    return filtered.slice(0, 3);
  };

  // Conversational Responses
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getConversationalResponse = (message) => {
    const msg = message.toLowerCase().trim();
    if (greetings.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) return pick(greetings.responses);
    if (farewells.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) return pick(farewells.responses);
    if (thanks.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) return pick(thanks.responses);
    return null;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      // 1. Check conversational responses
      const conversationalResp = getConversationalResponse(userMessage);
      if (conversationalResp) {
        setMessages(prev => [...prev, { role: 'assistant', content: conversationalResp }]);
        setIsLoading(false);
        return;
      }

      // 2. Firm Recommendation Logic
      const detectedArea = detectPracticeArea(userMessage);
      const detectedState = detectState(userMessage);

      // Merge with previous state to remember context
      const nextPracticeArea = detectedArea || conversationState.practiceArea;
      const nextState = detectedState || conversationState.state;

      const newState = {
        practiceArea: nextPracticeArea,
        state: nextState,
        hasRecommended: false
      };
      setConversationState(newState);

      let responseContent = '';
      let responseCards = [];

      // Logic to determine response based on what we know
      if (nextPracticeArea && nextState) {
        // We have both, recommend firms
        const firms = recommendFirms(nextPracticeArea, nextState);

        if (firms.length > 0) {
          responseContent = `I've found ${firms.length} top-tier firms in ${nextState} specializing in ${nextPracticeArea}.`;
          setRecommendedFirms(firms);
          setShowRecommendations(true);
          // Mark as recommended so we don't loop endlessly if user just says "thanks" later
          setConversationState(prev => ({ ...prev, hasRecommended: true }));
        } else {
          // Fallback: try searching just by state if strict match failed
          const firmsBroad = recommendFirms(null, nextState);
          if (firmsBroad.length > 0) {
            responseContent = `I couldn't find a firm purely for ${nextPracticeArea} in ${nextState}, but here are some top firms in that region.`;
            setRecommendedFirms(firmsBroad.slice(0, 3));
            setShowRecommendations(true);
          } else {
            responseContent = `I'm currently expanding my network in ${nextState}. Please try another major city.`;
          }
        }
      } else if (nextPracticeArea && !nextState) {
        responseContent = `Excellent choice. For ${nextPracticeArea}, where are you looking for a firm?`;
        responseCards.push({
          type: 'info',
          icon: 'message',
          title: 'Location Required',
          content: 'Please confirm your preferred state (e.g., Delhi, Maharashtra) to identify local firms.'
        });
      } else if (!nextPracticeArea && nextState) {
        responseContent = `Got it, ${nextState}. What specific legal expertise does your organization require? (e.g. Corporate, IP, Tax)`;
      } else {
        // Fallback to legal info if no clear intent
        responseContent = "Could you elaborate on your requirements? I need to understand the practice area and desired location.";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseContent,
        cards: responseCards.length > 0 ? responseCards : undefined
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleBook = (firm) => {
    navigate('/book-consultation-signup', {
      state: {
        lawyer: {
          ...firm,
          // Map firm specific fields to what booking page expects
          consultation_fee: firm.feeMin || 5000,
          fee: firm.feeRange || "₹5,000 - ₹15,000",
          specialization: firm.practiceAreas?.[0] || "Corporate Law"
        }
      }
    });
  };

  return (
    <WaveLayout activePage="find-law-firm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">AI Firm Matching</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Connect with  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Legal Excellence</span>
          </motion.h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[600px]">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`transition-all duration-500 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-none rounded-3xl flex flex-col overflow-hidden ${showRecommendations ? 'lg:col-span-7' : 'lg:col-span-12'}`}
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} isBot={msg.role === 'assistant'} />
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <div className="flex gap-3 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe your legal requirements..."
                  className="flex-1 pl-6 pr-14 py-4 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
                <Button
                  onClick={toggleListening}
                  variant="ghost"
                  className={`absolute right-14 top-2 h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 ${isListening ? 'text-red-500' : 'text-slate-400'}`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Recommendations Interface */}
          <AnimatePresence>
            {showRecommendations && (
              <motion.div
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                className="lg:col-span-5 space-y-4 overflow-y-auto pr-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Matches Found
                  </h3>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">
                    {recommendedFirms.length} Firms
                  </span>
                </div>

                {recommendedFirms.map((firm, index) => (
                  <motion.div
                    key={firm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-blue-900/5 dark:shadow-blue-900/20 rounded-2xl p-0 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className="h-32 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                      <img src={firm.image} alt={firm.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-4 z-20">
                        <h4 className="font-bold text-white shadow-sm">{firm.name}</h4>
                        <p className="text-slate-200 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {firm.city}</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {firm.practiceAreas.slice(0, 2).map((area, i) => (
                          <span key={i} className="text-xs font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">{area}</span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFirm(firm)}
                          className="text-xs w-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBook(firm)}
                          className="text-xs w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
                        >
                          Book Now <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Firm Detail Modal */}
      <AnimatePresence>
        {selectedFirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFirm(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-64">
                <img
                  src={selectedFirm.image}
                  alt={selectedFirm.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedFirm(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-6 left-8 right-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedFirm.name}</h2>
                  <div className="flex items-center gap-4 text-slate-200">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedFirm.city}, {selectedFirm.state}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedFirm.lawyersCount} Lawyers</span>
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 Rating</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 p-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About the Firm</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedFirm.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Practice Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFirm.practiceAreas.map((area, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg border border-blue-100 dark:border-blue-800">
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Book Consultation</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">Schedule a meeting with senior partners or specialized teams.</p>
                    <Button
                      onClick={() => handleBook(selectedFirm)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WaveLayout>
  );
}
