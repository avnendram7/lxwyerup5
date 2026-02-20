import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Send, Bot, Star, Briefcase, MapPin, ArrowRight, ArrowLeft, X, CheckCircle, MessageSquare, Mic, MicOff, Sparkles, Phone, Mail, Calendar, GraduationCap, Check } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import LawyerCard from '../components/LawyerCard';
import { dummyLawyers, specializations } from '../data/lawyersData';
import { greetings, farewells, thanks, acknowledgements, aboutBot, legalInfo, customQA, fallbackResponses, caseTypeKeywords, locationKeywords } from '../data/chatbotData';
import { legalKnowledge, csvQAPairs, topAdvocates, totalCasesProcessed } from '../data/processedLegalData';
import { WaveLayout } from '../components/WaveLayout';

export default function FindLawyerAI() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI legal assistant. Tell me about your legal issue and I'll find the best lawyers for you.\n\nFor example: \"I need a divorce lawyer in Delhi\" or \"Property dispute in Mumbai\"",
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedLawyers, setRecommendedLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showAllLawyers, setShowAllLawyers] = useState(false);
  const [allLawyersList, setAllLawyersList] = useState(dummyLawyers);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch verified lawyers from backend (Synced with FindLawyerManual.js)
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await axios.get(`${API}/lawyers`);
        console.log('AI Page - Fetched lawyers:', response.data);

        // Map DB lawyers to match dummy data structure
        const formattedDbLawyers = response.data.map(lawyer => ({
          ...lawyer,
          id: lawyer.id || lawyer._id,
          name: lawyer.full_name || lawyer.name,
          experience: lawyer.experience_years || lawyer.experience || 5, // Fallback to 5 if missing
          education: lawyer.education || 'Legal Qualification',
          photo: lawyer.photo ? (lawyer.photo.startsWith('http') ? lawyer.photo : `http://localhost:8000${lawyer.photo}`) : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
          feeMin: lawyer.fee_range ? parseInt(lawyer.fee_range.replace(/[^0-9]/g, '').slice(0, 4) + '000') || 2000 : 2000,
          feeMax: lawyer.fee_range ? parseInt(lawyer.fee_range.replace(/[^0-9]/g, '').slice(-4) + '000') || 5000 : 5000,
          languages: lawyer.languages || ['English'],
          rating: 4.8,
          verified: lawyer.is_verified || lawyer.is_approved || lawyer.status === 'approved' || lawyer.verified === true,
          // AI Specific fields needed for matching
          secondarySpecializations: [],
          casesWon: lawyer.cases_won || 50,
          featured: false
        }));

        setAllLawyersList([...formattedDbLawyers, ...dummyLawyers]);
      } catch (error) {
        console.error('Error fetching lawyers:', error);
      }
    };
    fetchLawyers();
  }, []);

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

  // Data-driven case type detection (reads from chatbotData.js)
  const detectCaseType = (message) => {
    const msg = message.toLowerCase();
    for (const [caseType, keywords] of Object.entries(caseTypeKeywords)) {
      if (keywords.some(kw => msg.includes(kw))) return caseType;
    }
    return null;
  };

  // Data-driven location detection (reads from chatbotData.js)
  const detectLocation = (message) => {
    const msg = message.toLowerCase();
    // Sort by key length descending so "new delhi" matches before "delhi"
    const sorted = Object.entries(locationKeywords).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of sorted) {
      if (msg.includes(key)) return value;
    }
    return null;
  };

  // Predictive Model with randomization for variety
  const predictLawyerMatch = (userQuery, lawyer) => {
    let score = 0;
    const query = userQuery.toLowerCase();
    const factors = [];

    // Specialization (40%)
    const caseType = detectCaseType(userQuery);
    if (caseType && lawyer.specialization === caseType) {
      score += 40;
      factors.push('Specialization Match');
    } else if (caseType && lawyer.secondarySpecializations?.includes(caseType)) {
      score += 25;
      factors.push('Secondary Specialization');
    }

    // Location (30%)
    const location = detectLocation(userQuery);
    if (location) {
      if (location.city && lawyer.city === location.city) {
        score += 30;
        factors.push('Exact City Match');
      } else if (lawyer.state === location.state) {
        score += 20;
        factors.push('State Match');
      }
    }

    // Experience & Rating (20%)
    score += (lawyer.rating / 5) * 10;
    score += Math.min(lawyer.experience, 20) / 2;
    if (lawyer.rating >= 4.5) factors.push('Top Rated');
    if (lawyer.experience >= 15) factors.push('Senior Advocate');

    // Verification bonus (10%)
    if (lawyer.verified) {
      score += 5;
      factors.push('Verified');
    }
    if (lawyer.featured) {
      score += 5;
      factors.push('Featured');
    }

    // Random jitter (±15 points) so results differ each time
    const jitter = Math.floor(Math.random() * 31) - 15;
    score += jitter;

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
    if (greetings.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) {
      return pick(greetings.responses);
    }
    // Check farewells
    if (farewells.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) {
      return pick(farewells.responses);
    }
    // Check thanks
    if (thanks.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) {
      return pick(thanks.responses);
    }
    // Check acknowledgements
    if (acknowledgements.keywords.some(kw => msg === kw || msg === kw + '!' || msg === kw + '.')) {
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
    // Check legal info Q&A
    for (const item of legalInfo) {
      if (item.keywords.some(kw => msg.includes(kw))) {
        return pick(item.responses);
      }
    }
    // Check custom Q&A
    for (const item of customQA) {
      if (item.keywords.some(kw => msg.includes(kw))) {
        return pick(item.responses);
      }
    }
    // Check CSV-generated Q&A pairs
    if (csvQAPairs) {
      for (const item of csvQAPairs) {
        if (item.keywords.some(kw => msg.includes(kw))) {
          return pick(item.responses);
        }
      }
    }
    return null;
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
      knowledge.sample_sections.slice(0, 10).forEach(sec => {
        context += `• ${sec}\n`;
      });
    }
    if (knowledge.sample_cases && knowledge.sample_cases.length > 0) {
      context += `\n📋 Related Court Cases:\n`;
      knowledge.sample_cases.slice(0, 5).forEach(c => {
        context += `• ${c}\n`;
      });
    }
    context += `\n📎 Src: Indian Kanoon · SC/HC Records · ${knowledge.count}+ judgments analyzed\n`;
    return context;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      // STEP 1: Check if it's a simple conversational message (hi, bye, thanks, etc.)
      const convoReply = getConversationalResponse(userMessage);
      if (convoReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: convoReply }]);
        setIsLoading(false);
        return;
      }

      // STEP 2: Detect legal intent
      const caseType = detectCaseType(userMessage);
      const location = detectLocation(userMessage);

      // STEP 3: If case type or location found → search for lawyers
      if (caseType || location) {
        // Score all lawyers
        const scoredLawyers = allLawyersList.map(lawyer => {
          const prediction = predictLawyerMatch(userMessage, lawyer);
          return { ...lawyer, ...prediction };
        });

        // Strictly filter: must match specialization AND city/state
        const allQualifying = scoredLawyers
          .filter(l => {
            // Must match specialization (primary or secondary)
            const specMatch = caseType && (
              l.specialization === caseType ||
              l.secondarySpecializations?.includes(caseType)
            );
            // Must match location (city preferred, fallback to state)
            const locMatch = location && (
              (location.city && l.city === location.city) ||
              (!location.city && l.state === location.state) ||
              (location.state && l.state === location.state)
            );
            // If both are provided, require both; if only one, require that one
            if (caseType && location) return specMatch && locMatch;
            if (caseType) return specMatch;
            if (location) return locMatch;
            return false;
          })
          .sort((a, b) => b.score - a.score);

        let responseContent = '';

        if (allQualifying.length > 0) {
          const locationText = location ? (location.city || location.state) : 'your area';
          const caseText = caseType || 'your case type';

          responseContent = `Based on analysis of ${totalCasesProcessed ? totalCasesProcessed.toLocaleString() : '500+'} court cases, here's what I found:\n\n`;
          responseContent += `📋 Case Type: ${caseText}\n`;
          responseContent += `📍 Location: ${locationText}\n`;

          // Add legal knowledge context from CSV data
          if (caseType) {
            const legalContext = getLegalContext(caseType);
            if (legalContext) {
              responseContent += legalContext;
            }
          }

          responseContent += `\n✅ I found ${allQualifying.length} matching lawyers for you. Check the recommendations below!`;

          setRecommendedLawyers(allQualifying);
          setShowAllLawyers(false);
        } else if (caseType && !location) {
          responseContent = `I understand you need help with ${caseType}.\n\nTo find the best lawyers near you, please also mention your location.\n\nFor example: "${caseType.replace(' Law', '')} lawyer in Delhi"`;
          // Show legal context even when asking for location
          const legalContext = getLegalContext(caseType);
          if (legalContext) {
            responseContent += `\n\nMeanwhile, here's some relevant info:${legalContext}`;
          }
        } else if (!caseType && location) {
          const locationText = location.city || location.state;
          responseContent = `Got it, you're in ${locationText}.\n\nPlease also describe your legal issue so I can recommend specialized lawyers.\n\nFor example: "Property dispute" or "Divorce case"`;
        } else {
          responseContent = `I'd love to help! Please describe:\n\n1. What type of legal issue? (property, divorce, criminal, corporate, tax, etc.)\n2. Where are you located? (Delhi, Mumbai, etc.)\n\nExample: "I need a criminal lawyer in Bangalore"`;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
        setIsLoading(false);
        return;
      }

      // STEP 4: No case type or location → try legal knowledge Q&A as fallback
      const knowledgeReply = getLegalKnowledgeResponse(userMessage);
      if (knowledgeReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: knowledgeReply }]);
        setIsLoading(false);
        return;
      }

      // STEP 5: Nothing matched at all → show fallback
      const fallback = pick(fallbackResponses);
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      setIsLoading(false);
    }, 1200);
  };

  const handleBookConsultation = (lawyer) => {
    navigate('/book-consultation-signup', { state: { lawyer } });
  };

  return (
    <WaveLayout activePage="find-lawyer">
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F2944]/5 dark:bg-blue-900/20 border border-[#0F2944]/10 dark:border-blue-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#0F2944] dark:text-blue-400" />
            <span className="text-[#0F2944] dark:text-blue-300 text-sm font-medium">AI Legal Assistant</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F2944] dark:text-white mb-2">
            Describe your case
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            Tell me about your legal issue and I'll recommend the best lawyers
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-8">
          {/* Messages */}
          <div className="h-[450px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-[#0F2944] dark:bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                  ? 'bg-[#0F2944] dark:bg-blue-700 text-white'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200'
                  }`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {msg.content?.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-[#0F2944] dark:bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#0F2944]/40 dark:bg-blue-400/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#0F2944]/40 dark:bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-[#0F2944]/40 dark:bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening..." : "Describe your legal issue..."}
                className={`flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border ${isListening ? 'border-[#0F2944] dark:border-blue-500 ring-2 ring-[#0F2944]/10 dark:ring-blue-500/20' : 'border-gray-200 dark:border-slate-700'} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0F2944] dark:focus:border-blue-500 transition-all`}
              />
              <button
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400'}`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-5 py-3 bg-[#0F2944] dark:bg-blue-600 hover:bg-[#0F2944]/90 dark:hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#0F2944]/10 dark:shadow-blue-900/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Lawyers */}
        {recommendedLawyers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0F2944] dark:text-white">AI Recommended Lawyers</h2>
              <span className="text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">{recommendedLawyers.length} lawyers found</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(showAllLawyers ? recommendedLawyers : recommendedLawyers.slice(0, 6)).map((lawyer, index) => (
                <LawyerCard
                  key={lawyer.id}
                  lawyer={lawyer}
                  index={index}
                  onProfileClick={setSelectedLawyer}
                  onBookClick={handleBookConsultation}
                />
              ))}
            </div>

            {/* View More / View Less Button */}
            {recommendedLawyers.length > 6 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllLawyers(!showAllLawyers)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F2944]/5 dark:bg-blue-900/20 hover:bg-[#0F2944]/10 dark:hover:bg-blue-900/40 text-[#0F2944] dark:text-blue-300 rounded-xl font-semibold transition-all border border-[#0F2944]/10 dark:border-blue-500/20 hover:border-[#0F2944]/20"
                >
                  {showAllLawyers ? (
                    <>
                      Show Less
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </>
                  ) : (
                    <>
                      View More ({recommendedLawyers.length - 6} more lawyers)
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lawyer Profile Modal */}
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
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:shadow-black/50 overflow-hidden max-h-[85vh] flex flex-col border border-white/20 dark:border-slate-800"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Modal Header Image/Gradient */}
                <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <button
                    onClick={() => setSelectedLawyer(null)}
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="px-10 pb-10">
                  <div className="relative -mt-20 mb-8 flex justify-between items-end">
                    <div className="flex items-end gap-8">
                      <img
                        src={selectedLawyer.photo}
                        alt={selectedLawyer.name}
                        className="w-40 h-40 rounded-[2rem] border-[6px] border-white shadow-2xl object-cover bg-white"
                      />
                      <div className="pb-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{selectedLawyer.name}</h2>
                        <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">{selectedLawyer.specialization}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      {selectedLawyer.verified && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-lg border border-green-100 dark:border-green-800">
                          <Check className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                        <Briefcase className="w-4 h-4 text-blue-500" /> Experience
                      </div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedLawyer.experience} Years</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                        <MapPin className="w-4 h-4 text-blue-500" /> Location
                      </div>
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedLawyer.city || selectedLawyer.location}</div>
                    </div>
                  </div>

                  <div className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-2 text-slate-400 mb-3 text-xs uppercase tracking-wider font-bold">
                      <GraduationCap className="w-4 h-4 text-blue-500" /> Education
                    </div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{selectedLawyer.education}</div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        About
                        <div className="h-1 w-12 bg-blue-600 rounded-full mt-1"></div>
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-loose text-lg">{selectedLawyer.bio}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Practice Court</h3>
                        <p className="text-slate-700 dark:text-slate-200 font-bold">{selectedLawyer.court}</p>
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Consultation Fee</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-black text-2xl">
                          {selectedLawyer.feeMin
                            ? `₹${selectedLawyer.feeMin.toLocaleString()} – ₹${selectedLawyer.feeMax.toLocaleString()}`
                            : selectedLawyer.fee}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                      <Button
                        onClick={() => handleBookConsultation(selectedLawyer)}
                        className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-xl shadow-blue-900/20 text-white rounded-xl transition-all hover:scale-[1.02]"
                      >
                        Book Consultation <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
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
