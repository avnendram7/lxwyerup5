import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Send, Sparkles, MessageSquare, MapPin, Users, Calendar, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { WaveLayout } from '../components/WaveLayout';

const AILawFirmFinder = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const topFirms = [
    {
      name: 'Shah & Associates',
      description: 'Premier law firm with expertise in civil, criminal, and corporate matters.',
      location: 'Delhi',
      lawyers: 15,
      since: 2010,
      areas: ['Civil Law', 'Criminal Law'],
      consultation: '₹2999'
    },
    {
      name: 'Mehta Legal Solutions',
      description: 'Specialized in family law and property disputes.',
      location: 'Mumbai',
      lawyers: 10,
      since: 2012,
      areas: ['Family Law', 'Property Law'],
      consultation: '₹2499'
    },
    {
      name: 'Reddy & Partners',
      description: 'Leading corporate law firm serving startups and large corporations.',
      location: 'Hyderabad',
      lawyers: 20,
      since: 2015,
      areas: ['Corporate Law', 'Intellectual Property'],
      consultation: '₹2499'
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <WaveLayout>
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              AI Law Firm Finder
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Tell me about your legal needs and I'll find the perfect law firm for you
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-xl border-slate-100 overflow-hidden h-full flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-700 dark:text-slate-300">
                          Hello! I'm your AI assistant. I can help you find the perfect law firm for your legal needs. Tell me about your case or what type of legal assistance you're looking for.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Describe your legal needs..."
                      className="w-full px-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Try: "I need help with a divorce case" or "Looking for corporate lawyers"
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <Button
                    onClick={handleSend}
                    className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-6 rounded-xl font-semibold shadow-lg shadow-slate-900/20 dark:shadow-blue-500/20 transition-all"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Top Law Firms Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-6 ml-1">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Top Law Firms</h2>
                </div>

                {topFirms.map((firm, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-blue-900/5 dark:shadow-blue-900/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-800">
                          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{firm.name}</h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{firm.description}</p>

                    <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{firm.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{firm.lawyers} lawyers</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Since {firm.since}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {firm.areas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Consultation</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{firm.consultation}</p>
                      </div>
                      <Button
                        className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-slate-900/20 dark:shadow-blue-500/20 group transition-all"
                      >
                        Join Firm
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </WaveLayout>
  );
};

export default AILawFirmFinder;