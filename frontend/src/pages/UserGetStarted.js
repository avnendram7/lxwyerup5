import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Building2, User, ArrowRight, Sparkles, Search } from 'lucide-react';
import NavigationHeader from '../components/NavigationHeader';
import { WaveLayout } from '../components/WaveLayout';
import { Button } from '../components/ui/button';

export default function UserGetStarted() {
  const navigate = useNavigate();

  return (
    <WaveLayout>
      <div className="min-h-screen pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-outfit">Get Started with Legal Assistance</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose how you want to find legal help and connect with the right experts.</p>
          </motion.div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {/* Option 1: Independent Lawyer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-3">I Want a Lawyer</h2>
                <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Connect with verified independent lawyers across India for specialized legal representation.</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium pt-0.5">Browse verified lawyers by specialization</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium pt-0.5">Direct consultation with legal experts</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium pt-0.5">Flexible pricing and consultation options</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/find-lawyer/ai')}
                    className="w-full h-auto py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Sparkles className="w-5 h-5" />
                    Find with AI Assistant
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    onClick={() => navigate('/find-lawyer/manual')}
                    variant="outline"
                    className="w-full h-auto py-4 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Search className="w-5 h-5" />
                    Browse Manually
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Option 2: Law Firm */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-3">I Want a Law Firm</h2>
                <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Join established law firms with comprehensive legal services and team-based support.</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium pt-0.5">Access to team of specialized lawyers</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium pt-0.5">Comprehensive case management</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium pt-0.5">Established reputation and resources</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/find-lawfirm/ai')}
                    className="w-full h-auto py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Sparkles className="w-5 h-5" />
                    Find with AI Assistant
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    onClick={() => navigate('/find-lawfirm/manual')}
                    variant="outline"
                    className="w-full h-auto py-4 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Search className="w-5 h-5" />
                    Browse Law Firms
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center relative z-10"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium bg-white/50 dark:bg-slate-900/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm border border-white/60 dark:border-white/10">
              Not sure which option to choose? Our AI assistant can help you decide!
            </p>
          </motion.div>
        </div>
      </div>
    </WaveLayout>
  );
}
