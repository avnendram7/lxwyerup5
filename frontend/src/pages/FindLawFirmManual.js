import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, Filter, MapPin, Users, ArrowRight, Star, Globe, Phone, Mail, Award, Check, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { WaveLayout } from '../components/WaveLayout';
import { Button } from '../components/ui/button';
import { dummyLawFirms, states, practiceAreas } from '../data/lawFirmsData';




const FloatingCard = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-blue-900/5 dark:shadow-blue-900/20 rounded-2xl ${className}`}
  >
    {children}
  </motion.div>
);

export default function FindLawFirmManual() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    practiceArea: '',
    priceMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const firmsPerPage = 9;

  // Fetch verified law firms from backend
  const [dbFirms, setDbFirms] = useState([]);
  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await axios.get(`${API}/lawfirms`);
        setDbFirms(response.data);
      } catch (error) {
        console.error('Error fetching law firms:', error);
      }
    };
    fetchFirms();
  }, []);

  // Memoize DB firms mapping so shuffle only recalculates when DB data changes
  const formattedDbFirms = useMemo(() => dbFirms.map(firm => ({
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
    consultation_fee: firm.consultation_fee || firm.min_fee || firm.fee,
    feeMin: firm.min_fee || firm.consultation_fee,
    feeRange: firm.fee_range || firm.price_range
  })), [dbFirms]);

  // Deterministic daily Fisher-Yates shuffle — same as FindLawyerManual
  // Order changes each day so no firm is permanently promoted
  const allFirms = useMemo(() => {
    const combined = [...formattedDbFirms, ...dummyLawFirms];
    const today = new Date();
    const seed = today.getFullYear() * 1000 + Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
    // Proper Fisher-Yates — guarantees uniform distribution
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined;
  }, [formattedDbFirms]);

  // Memoized filter — only re-runs when search/filters or shuffled list changes
  const filteredFirms = useMemo(() => allFirms.filter(firm => {
    const matchesSearch =
      (firm.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (firm.practiceAreas || []).some(area => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (firm.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = !filters.state || firm.state === filters.state;
    const matchesCity = !filters.city || firm.city === filters.city;
    const matchesArea = !filters.practiceArea || (firm.practiceAreas || []).includes(filters.practiceArea);

    const matchesPrice = !filters.priceMax || (() => {
      const maxFee = parseInt(filters.priceMax);
      const feeClean = typeof firm.consultation_fee === 'string' ? firm.consultation_fee.replace(/[^0-9]/g, '') : firm.consultation_fee;
      const parsedFee = firm.feeMin || parseInt(feeClean) || 0;
      return parsedFee <= maxFee;
    })();

    return matchesSearch && matchesState && matchesCity && matchesArea && matchesPrice;
  }), [allFirms, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredFirms.length / firmsPerPage);
  const startIndex = (currentPage - 1) * firmsPerPage;
  const endIndex = startIndex + firmsPerPage;
  const currentFirms = filteredFirms.slice(startIndex, endIndex);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ state: '', city: '', practiceArea: '', priceMax: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getCities = () => {
    if (!filters.state) return [];
    return states[filters.state] || [];
  };

  return (
    <WaveLayout activePage="find-law-firm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-6"
          >
            Partner with Leading <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Law Firms</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2 sm:px-0"
          >
            Discover and connect with prestigious law firms specialized in handling complex legal matters for businesses and individuals.
          </motion.p>
        </div>

        {/* Search & Filters */}
        <FloatingCard className="p-4 sm:p-6 mb-6 sm:mb-12 sticky top-20 sm:top-24 z-30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by firm name, practice area, or location..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:min-w-[120px] sm:w-auto h-[46px] sm:h-[50px] border-slate-200 dark:border-slate-700 ${showFilters ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                    <select
                      value={filters.state}
                      onChange={(e) => {
                        handleFilterChange('state', e.target.value);
                        handleFilterChange('city', '');
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">All States</option>
                      {Object.keys(states).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                    <select
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      disabled={!filters.state}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">All Cities</option>
                      {getCities().map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Practice Area</label>
                    <select
                      value={filters.practiceArea}
                      onChange={(e) => handleFilterChange('practiceArea', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">All Practice Areas</option>
                      {practiceAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Fee (₹)</label>
                    <select
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Any Price</option>
                      <option value="5000">Under ₹5,000</option>
                      <option value="10000">Under ₹10,000</option>
                      <option value="20000">Under ₹20,000</option>
                      <option value="50000">Under ₹50,000</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FloatingCard>

        {/* Results Grid */}
        <div className="mb-8 flex items-center justify-between text-slate-600 dark:text-slate-400 px-2">
          <p>Showing <span className="font-semibold text-slate-900 dark:text-white">{startIndex + 1}-{Math.min(endIndex, filteredFirms.length)}</span> of <span className="font-semibold text-slate-900 dark:text-white">{filteredFirms.length}</span> firms</p>
        </div>

        {currentFirms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-12">
            {currentFirms.map((firm, index) => (
              <FloatingCard key={firm.id} delay={index * 0.05} className="group flex flex-col h-full">
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                  <img
                    src={firm.image}
                    alt={firm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 shadow-sm">{firm.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-200 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {firm.city}, {firm.state}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {firm.practiceAreas.slice(0, 3).map((area, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-md">
                        {area}
                      </span>
                    ))}
                    {firm.practiceAreas.length > 3 && (
                      <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-md">
                        +{firm.practiceAreas.length - 3}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-6 flex-1">
                    {firm.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    {firm.unique_id && (
                      <span className="text-xs font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                        ID: {firm.unique_id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{firm.lawyersCount} Lawyers</span>
                    </div>
                    <Button
                      onClick={() => setSelectedFirm(firm)}
                      className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white shadow-lg shadow-slate-900/20 dark:shadow-blue-500/20"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No firms found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">We couldn't find any law firms matching your current criteria.</p>
            <Button onClick={clearFilters} variant="outline" className="dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl disabled:opacity-50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 px-2">
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl disabled:opacity-50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
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
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 p-5 sm:p-8">
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

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Achievements</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[1, 2, 3].map((_, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Award className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">Top Legal Firm 2025</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Awarded for excellence in corporate law</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Book Consultation</h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">Schedule a meeting with senior partners or specialized teams.</p>
                  <Button
                    onClick={() => navigate('/book-consultation-signup', {
                      state: {
                        lawyer: {
                          ...selectedFirm,
                          // Map firm specific fields to what booking page expects
                          consultation_fee: selectedFirm.consultation_fee || selectedFirm.feeMin || 5000,
                          fee: selectedFirm.feeRange || "₹5,000 - ₹15,000",
                          specialization: selectedFirm.practiceAreas?.[0] || "Corporate Law"
                        }
                      }
                    })}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                  >
                    Book Consultation
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Floating AI Lawyer Matching Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-50">
        <motion.button
          onClick={() => navigate('/ai-firm-finder')}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center px-8 py-3.5 rounded-full bg-[#050505] border-[1.5px] border-blue-600 hover:border-blue-400 hover:bg-[#111] text-blue-50 font-bold text-sm tracking-wide shadow-2xl shadow-blue-900/40 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Find Firm with AI</span>
        </motion.button>
      </div>

    </WaveLayout>
  );
}
