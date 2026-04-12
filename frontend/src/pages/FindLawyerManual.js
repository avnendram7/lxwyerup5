import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Briefcase, MapPin, ArrowRight, ChevronLeft, ChevronRight, Scale, X, Check, GraduationCap, Sparkles, Award, Star, Calendar } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { dummyLawyers, states, specializations, searchLawyers } from '../data/lawyersData';
import LawyerCard from '../components/LawyerCard';
import { getLawyerPhoto, getInitials, onPhotoError } from '../utils/lawyerPhoto';
import { useLang } from '../context/LanguageContext';



const FloatingCard = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white/80 dark:bg-[#121212] backdrop-blur-xl border border-white/20 dark:border-[#2A2A2A] shadow-xl shadow-blue-900/5 dark:shadow-none rounded-2xl hover:-translate-y-1 transition-transform duration-200 ${className}`}
  >
    {children}
  </motion.div>
);

const LOCAL_TEXT = {
  en: {
    aiFiltersSuccess: 'AI search filters automatically applied!',
    maxFee: 'Max Fee (₹)',
    anyPrice: 'Any Price',
    under: 'Under',
    hasAchievements: 'Has Achievements',
    bothVideoInPerson: 'Video/In-person',
    videoCall: 'Video Call',
    inPerson: 'In-Person',
    about: 'About',
    experience: 'Experience',
    years: 'Years',
    location: 'Location',
    education: 'Education',
    noBio: 'No bio available.',
    milestones: 'Milestones & Achievements',
    featured: 'Featured',
    courtExp: 'Court Experience',
    primary: 'Primary',
    yrs: 'yrs',
    notSpecified: 'Not specified',
    consultationFee: 'Consultation Fee',
    mode: 'Mode',
  },
  hi: {
    aiFiltersSuccess: 'AI खोज फ़िल्टर स्वचालित रूप से लागू हो गए!',
    maxFee: 'अधिकतम शुल्क (₹)',
    anyPrice: 'कोई भी कीमत',
    under: 'के अंतर्गत',
    hasAchievements: 'उपलब्धियां हैं',
    bothVideoInPerson: 'वीडियो/इन-पर्सन',
    videoCall: 'वीडियो कॉल',
    inPerson: 'व्यक्तिगत रूप से',
    about: 'के बारे में',
    experience: 'अनुभव',
    years: 'वर्ष',
    location: 'स्थान',
    education: 'शिक्षा',
    noBio: 'कोई बायो उपलब्ध नहीं है।',
    milestones: 'मील के पत्थर और उपलब्धियां',
    featured: 'विशेष रुप से प्रदर्शित',
    courtExp: 'अदालत का अनुभव',
    primary: 'प्राथमिक',
    yrs: 'वर्ष',
    notSpecified: 'उल्लेखित नहीं है',
    consultationFee: 'परामर्श शुल्क',
    mode: 'मोड',
  }
};

export default function FindLawyerManual() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLang();
  const d = LOCAL_TEXT[lang] || LOCAL_TEXT.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    specialization: '',
    court: '',
    minRating: 0,
    consultationType: '',
    priceMax: '',
    withAchievement: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [dbLawyers, setDbLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef(null);
  const lawyersPerPage = 12;

  // Initialize filters from URL parameters if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specParam = params.get('specialization');
    const locParam = params.get('location');

    if (specParam || locParam) {
      setFilters(prev => ({
        ...prev,
        specialization: specParam || '',
      }));
      if (locParam) {
        setSearchQuery(locParam);
      }
    }
  }, [location.search]);

  // Apply state from FindLawyerAI
  useEffect(() => {
    if (location.state) {
      let applied = false;
      setFilters(prev => {
        const nf = { ...prev };
        if (location.state.specialization) { nf.specialization = location.state.specialization; applied = true; }
        if (location.state.budget) { nf.priceMax = location.state.budget; applied = true; }
        return nf;
      });
      if (location.state.location) {
        setSearchQuery(location.state.location);
        applied = true;
      }
      if (applied) {
        toast.success(d.aiFiltersSuccess);
      }
    }
  }, [location.state]);

  // Fetch verified lawyers from backend
  useEffect(() => {
    const fetchLawyers = async () => {
      setLoadingLawyers(true);
      try {
        const response = await axios.get(`${API}/lawyers`, { timeout: 5000 });
        setDbLawyers(response.data || []);
      } catch (error) {
        console.warn('Backend unavailable, using local data:', error.message);
        setDbLawyers([]);
      } finally {
        setLoadingLawyers(false);
      }
    };
    fetchLawyers();
  }, []);

  // Map DB lawyers to match component structure
  const formattedDbLawyers = useMemo(() => dbLawyers.map(lawyer => ({
    ...lawyer,
    id: lawyer.id || lawyer._id,
    name: lawyer.full_name || lawyer.name,
    experience: lawyer.experience_years || lawyer.experience,
    education: lawyer.education || 'Legal Qualification',
    photo: lawyer.photo
      ? (lawyer.photo.startsWith('http') || lawyer.photo.startsWith('data:image')
        ? lawyer.photo
        : `${API.replace('/api', '')}${lawyer.photo.startsWith('/') ? '' : '/'}${lawyer.photo}`)
      : null,
    court: Array.isArray(lawyer.court) ? lawyer.court : (lawyer.court ? [lawyer.court] : (lawyer.courts ? (Array.isArray(lawyer.courts) ? lawyer.courts : [lawyer.courts]) : [])),
    specialization: Array.isArray(lawyer.specialization) ? lawyer.specialization[0] : (lawyer.specialization || (lawyer.specializations && lawyer.specializations[0]) || ''),
    fee: lawyer.consultation_fee || lawyer.fee_range || 'Contact for fee',
    languages: lawyer.languages || ['English'],
    rating: lawyer.rating || 4.8,
    verified: true,
    isDatabaseLawyer: true,
    // Explicitly carry these fields so expanded card always has them
    achievements: Array.isArray(lawyer.achievements) ? lawyer.achievements : [],
    bio: lawyer.bio || '',
    unique_id: lawyer.unique_id || '',
  })), [dbLawyers]);

  // Shuffle ALL lawyers (DB + approved dummies) together so no one is promoted
  const shuffledLawyers = useMemo(() => {
    const all = [
      ...formattedDbLawyers,
      ...dummyLawyers.filter(l => l.verified),
    ];
    const today = new Date();
    const seed = today.getFullYear() * 1000 + Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [formattedDbLawyers]);

  // Debounce search query updates
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  }, []);

  // Search and filter logic — memoized, only re-runs when debounced query or filters change
  const filteredLawyers = useMemo(() => shuffledLawyers.filter(lawyer => {
    const matchesSearch =
      (lawyer.name?.toLowerCase() || '').includes(debouncedQuery.toLowerCase()) ||
      (lawyer.specialization?.toLowerCase() || '').includes(debouncedQuery.toLowerCase()) ||
      (lawyer.city?.toLowerCase() || '').includes(debouncedQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filters.state && lawyer.state !== filters.state) return false;
    if (filters.city && lawyer.city !== filters.city) return false;
    if (filters.specialization && lawyer.specialization !== filters.specialization) return false;
    if (filters.court) {
      const lawyerCourts = Array.isArray(lawyer.court) ? lawyer.court : (lawyer.court ? [lawyer.court] : []);
      if (!lawyerCourts.some(c => c === filters.court)) return false;
    }
    if (filters.consultationType) {
      const modes = new Set();
      (lawyer.consultation_types || []).forEach(t => modes.add(t.toLowerCase().replace(/ /g, '_')));
      if (lawyer.consultation_preferences) {
        const pref = lawyer.consultation_preferences.toLowerCase().trim();
        if (pref === 'both') { modes.add('video'); modes.add('in_person'); }
        else modes.add(pref.replace(/ /g, '_'));
      }
      const sel = filters.consultationType;
      if (sel === 'video' && !modes.has('video')) return false;
      if (sel === 'in_person' && !modes.has('in_person')) return false;
      if (sel === 'both' && !(modes.has('video') && modes.has('in_person'))) return false;
    }

    if (filters.priceMax) {
      const maxFee = parseInt(filters.priceMax);
      const feeClean = typeof lawyer.fee === 'string' ? lawyer.fee.replace(/[^0-9]/g, '') : lawyer.fee;
      const parsedFee = lawyer.feeMin || parseInt(feeClean) || 0;
      if (parsedFee > maxFee) return false;
    }

    if (filters.withAchievement && (!lawyer.achievements || !Array.isArray(lawyer.achievements) || lawyer.achievements.length === 0)) return false;

    return true;
  }), [shuffledLawyers, debouncedQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredLawyers.length / lawyersPerPage);
  const startIndex = (currentPage - 1) * lawyersPerPage;
  const endIndex = startIndex + lawyersPerPage;
  const currentLawyers = filteredLawyers.slice(startIndex, endIndex);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      city: '',
      specialization: '',
      court: '',
      minRating: 0,
      consultationType: '',
      priceMax: '',
      withAchievement: false
    });
    setSearchQuery('');
    setDebouncedQuery('');
    setCurrentPage(1);
  };

  const handleBookConsultation = (lawyer) => {
    navigate('/book-consultation-signup', { state: { lawyer } });
  };

  const getCities = () => {
    if (!filters.state) return [];
    return states[filters.state]?.cities || [];
  };

  const getCourts = () => {
    if (!filters.state) return [];
    return states[filters.state]?.courts || [];
  };

  const currentFilters = [
    { key: 'specialization', value: filters.specialization },
    { key: 'state', value: filters.state },
    { key: 'city', value: filters.city },
    { key: 'court', value: filters.court },
    { key: 'consultationType', value: filters.consultationType },
    { key: 'priceMax', value: filters.priceMax ? `${d.under} ₹${filters.priceMax}` : '' },
    ...(filters.withAchievement ? [{ key: 'withAchievement', value: d.hasAchievements }] : [])
  ].filter(f => f.value);

  return (
    <WaveLayout activePage="find-lawyer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">

        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-6 tracking-tight"
          >
            {t('fl_title')} <span className="text-blue-600 dark:text-slate-200">{t('fl_title_2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4 sm:mb-6 px-2 sm:px-0"
          >
            {t('fl_sub')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-[#1A1A1A] border border-blue-100 dark:border-[#333] rounded-full"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-slate-400" />
            <span className="text-xs font-medium text-blue-600 dark:text-slate-400">{t('fl_verified')}</span>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <FloatingCard className="p-4 sm:p-6 mb-6 sm:mb-12 sticky top-20 sm:top-24 z-30">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('fl_search_ph')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-slate-700/50 dark:focus:border-[#444] transition-all shadow-sm dark:shadow-none"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:min-w-[120px] sm:w-auto h-[46px] sm:h-[50px] border-slate-200 dark:border-[#333] dark:bg-[#1A1A1A] ${showFilters || currentFilters.length > 0 ? 'bg-blue-50 dark:bg-[#222] border-blue-200 dark:border-[#444] text-blue-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('fl_filters')}
              {currentFilters.length > 0 && (
                <span className="ml-2 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                  {currentFilters.length}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filter Badges */}
          {currentFilters.length > 0 && !showFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {currentFilters.map(f => (
                <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-slate-300 border dark:border-[#333] rounded-lg text-sm font-medium">
                  {f.key === 'consultationType' ? (f.value === 'both' ? d.bothVideoInPerson : (f.value === 'video' ? d.videoCall : d.inPerson)) : f.value}
                  <button onClick={() => handleFilterChange(f.key, f.key === 'withAchievement' ? false : '')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-slate-700 font-medium ml-2">{t('fl_clear_all')}</button>
            </div>
          )}

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fl_state')}</label>
                    <select
                      value={filters.state}
                      onChange={(e) => {
                        handleFilterChange('state', e.target.value);
                        handleFilterChange('city', '');
                        handleFilterChange('court', '');
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-[#555]"
                    >
                      <option value="">{t('fl_all_states')}</option>
                      {Object.keys(states).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fl_city')}</label>
                    <select
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      disabled={!filters.state}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 dark:focus:border-[#555]"
                    >
                      <option value="">{t('fl_all_cities')}</option>
                      {getCities().map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fl_specialization')}</label>
                    <select
                      value={filters.specialization}
                      onChange={(e) => handleFilterChange('specialization', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-[#555]"
                    >
                      <option value="">{t('fl_all_specs')}</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fl_court')}</label>
                    <select
                      value={filters.court}
                      onChange={(e) => handleFilterChange('court', e.target.value)}
                      disabled={!filters.state}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 dark:focus:border-[#555]"
                    >
                      <option value="">{t('fl_all_courts')}</option>
                      {getCourts().map(court => (
                        <option key={court} value={court}>{court}</option>
                      ))}
                    </select>
                  </div>

                  {/* Consultation Type filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fl_consult_type')}</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { val: '', label: 'Any' },
                        { val: 'video', label: '🎥 Video Call' },
                        { val: 'in_person', label: '🏛️ In-Person' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => handleFilterChange('consultationType', opt.val)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filters.consultationType === opt.val
                            ? 'bg-blue-600 border-blue-600 text-white shadow'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{d.maxFee}</label>
                    <select
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-[#555]"
                    >
                      <option value="">{d.anyPrice}</option>
                      <option value="1000">{d.under} ₹1,000</option>
                      <option value="3000">{d.under} ₹3,000</option>
                      <option value="5000">{d.under} ₹5,000</option>
                      <option value="10000">{d.under} ₹10,000</option>
                      <option value="20000">{d.under} ₹20,000</option>
                      <option value="50000">{d.under} ₹50,000</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleFilterChange('withAchievement', !filters.withAchievement)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.withAchievement ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className="sr-only">Toggle Achievements</span>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.withAchievement ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-500" /> {t('fl_achievements')}
                    </span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-500 hover:text-slate-600 font-medium transition-colors"
                  >
                    {t('fl_clear_filters')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FloatingCard>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between text-slate-600 dark:text-slate-400 px-2">
          <div className="flex items-center gap-3">
            {loadingLawyers ? (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                {t('fl_loading')}
              </div>
            ) : (
              <p>
                {t('fl_showing')} <span className="font-semibold text-slate-900 dark:text-white">{startIndex + 1}–{Math.min(endIndex, filteredLawyers.length)}</span> {t('fl_of')}{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{filteredLawyers.length}</span> {t('fl_lawyers')}
              </p>
            )}
          </div>
        </div>



        {currentLawyers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {currentLawyers.map((lawyer, index) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                index={index}
                onProfileClick={setSelectedLawyer}
                onBookClick={handleBookConsultation}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('fl_no_found')}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">{t('fl_no_found_sub')}</p>
            <Button onClick={clearFilters} variant="outline">
              {t('fl_clear_filters')}
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
              className="w-10 h-10 rounded-xl disabled:opacity-50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600"
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
              className="w-10 h-10 rounded-xl disabled:opacity-50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
              className="relative w-full max-w-5xl bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:shadow-none overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-[#2A2A2A]"
            >
              {/* Modal Header — pure gradient banner, no overflowing image */}
              <div className="h-44 bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 dark:from-slate-800 dark:via-[#111] dark:to-black relative shrink-0">
                {/* Fine pattern overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                {/* Watermark */}
                <span className="absolute top-5 right-7 text-white/20 dark:text-white/5 font-black text-5xl tracking-widest select-none pointer-events-none uppercase">Lxwyer Up</span>
                {/* Close button */}
                <button
                  onClick={() => setSelectedLawyer(null)}
                  className="absolute top-5 left-5 p-2 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 rounded-full text-white dark:text-slate-300 transition-colors backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-10 pb-10 custom-scrollbar">
                {/* Avatar + name row — in normal flow, no absolute overlap */}
                <div className="flex items-center gap-5 pt-6 pb-6 mb-2 border-b border-slate-100 dark:border-slate-800">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl shrink-0">
                    {getLawyerPhoto(selectedLawyer.photo, selectedLawyer.name) ? (
                      <img
                        src={getLawyerPhoto(selectedLawyer.photo, selectedLawyer.name)}
                        alt={selectedLawyer.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <span className="text-2xl font-black text-white">{getInitials(selectedLawyer.name)}</span>
                      </div>
                    )}
                  </div>
                  {/* Name / spec */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">{selectedLawyer.name}</h2>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-base mt-0.5">{selectedLawyer.specialization}</p>
                  </div>
                  {/* Verified badge */}
                  {selectedLawyer.verified && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-lg border border-green-100 dark:border-green-800 shrink-0">
                      <Check className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-[#333] shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                      <Briefcase className="w-4 h-4 text-blue-500" /> {d.experience}
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedLawyer.experience} {d.years}</div>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-[#333] shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-bold">
                      <MapPin className="w-4 h-4 text-blue-500" /> {d.location}
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedLawyer.city}</div>
                  </div>
                </div>

                <div className="mb-10 p-6 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-[#333] shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-3 text-xs uppercase tracking-wider font-bold">
                    <GraduationCap className="w-4 h-4 text-blue-500" /> {d.education}
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{selectedLawyer.education}</div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      {d.about}
                      <div className="h-px flex-1 bg-slate-100 dark:bg-[#2A2A2A]" />
                    </h3>
                    {selectedLawyer.bio ? (() => {
                      const parts = selectedLawyer.bio
                        .split(/\s*[\u2014\u2013\-]{2,}\s*/)
                        .map(s => s.trim())
                        .filter(Boolean);
                      return (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                          {parts.length > 1 ? parts.map((para, i) => (
                            <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{para}</p>
                          )) : (
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                              {selectedLawyer.bio}
                            </p>
                          )}
                        </div>
                      );
                    })() : (
                      <p className="text-slate-400 dark:text-slate-500 italic text-lg">{d.noBio}</p>
                    )}
                  </div>

                  {/* Achievements Section */}
                  {selectedLawyer?.achievements && Array.isArray(selectedLawyer.achievements) && selectedLawyer.achievements.length > 0 && (
                    <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 dark:from-[#05150f] dark:to-[#020a07] rounded-3xl border border-emerald-200/50 dark:border-emerald-500/20 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Award className="w-48 h-48 text-emerald-500" />
                      </div>

                      <h3 className="text-base font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-5 flex items-center gap-3 relative z-10">
                        <Award className="w-5 h-5 text-emerald-500" />
                        {d.milestones}
                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-200/50 dark:from-emerald-500/20 to-transparent" />
                      </h3>

                      <div className="space-y-4 relative z-10">
                        {[...selectedLawyer.achievements].sort((a, b) => b.pinned - a.pinned).map(ach => (
                          <div key={ach.id}
                            className={`rounded-2xl border p-5 flex gap-5 items-center relative overflow-hidden transition-all shadow-sm hover:shadow-md group cursor-default ${ach.pinned
                                ? 'bg-gradient-to-r from-white to-emerald-50/50 dark:from-[#05150f] dark:to-[#020a07] border-emerald-300 dark:border-emerald-500/40 shadow-emerald-500/5'
                                : 'bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border-emerald-100 dark:border-emerald-500/10 hover:border-emerald-300/50 dark:hover:border-emerald-500/30'
                              }`}
                          >
                            {/* Shine Effect Hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent -skew-x-12 z-0 pointer-events-none" style={{ animation: "none" }}
                                 onMouseEnter={(e) => { e.currentTarget.style.animation = 'shimmer 1.5s infinite'; }}
                                 onMouseLeave={(e) => { e.currentTarget.style.animation = 'none'; }}
                            />

                            <style>{`
                              @keyframes shimmer {
                                100% { transform: translateX(200%); }
                              }
                            `}</style>
                            
                            {ach.photo ? (
                              <img
                                src={ach.photo.startsWith('http') || ach.photo.startsWith('data:') ? ach.photo : `${API.replace('/api', '')}${ach.photo}`}
                                alt="achievement"
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-emerald-200 dark:border-emerald-500/30 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform relative z-10"
                                onClick={() => setExpandedImage(ach.photo.startsWith('http') || ach.photo.startsWith('data:') ? ach.photo : `${API.replace('/api', '')}${ach.photo}`)}
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 shadow-inner relative z-10">
                                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-bold text-lg sm:text-xl leading-snug break-words text-slate-900 dark:text-emerald-50 flex-1">
                                  {ach.title}
                                </p>
                                {ach.pinned && (
                                  <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full tracking-wider uppercase border border-emerald-200 dark:border-emerald-800/50">
                                    <Star className="w-3 h-3 fill-current" /> {d.featured}
                                  </span>
                                )}
                              </div>
                              {ach.date && (
                                <p className="text-[13px] font-medium text-emerald-700/70 dark:text-emerald-500/60 flex items-center gap-1.5 break-words">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" /> {ach.date}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details row */}
                  <div className="divide-y divide-slate-100 dark:divide-[#2A2A2A] border border-slate-100 dark:border-[#2A2A2A] rounded-xl overflow-hidden">

                    {/* Practice Court */}
                    <div className="flex flex-col gap-3 px-5 py-5 border-b border-slate-100 dark:border-[#2A2A2A]">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-0.5">{d.courtExp}</span>
                      </div>

                      {selectedLawyer.primary_court && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
                            {d.primary}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{selectedLawyer.primary_court}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(selectedLawyer.detailed_court_experience) && selectedLawyer.detailed_court_experience.length > 0 ? (
                          selectedLawyer.detailed_court_experience.map((c, i) => (
                            <div key={i} className="flex items-center text-xs font-medium bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-lg overflow-hidden group hover:border-slate-300 dark:hover:border-[#444] transition-colors">
                              <span className="px-3 py-1.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#222]">
                                {c.court_name}
                              </span>
                              <span className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#111] text-slate-500 border-l border-slate-200 dark:border-[#333]">
                                {c.years} {d.yrs}
                              </span>
                            </div>
                          ))
                        ) : Array.isArray(selectedLawyer.court) && selectedLawyer.court.length > 0 ? (
                          selectedLawyer.court.map((c, i) => (
                            <span key={i} className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#222] border border-slate-200 dark:border-[#333] px-3 py-1.5 rounded-lg">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400 italic">{selectedLawyer.court || d.notSpecified}</span>
                        )}
                      </div>
                    </div>

                    {/* Consultation Fee */}
                    <div className="flex items-center gap-4 px-5 py-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest w-36 shrink-0">{d.consultationFee}</span>
                      <span className="text-base font-semibold text-slate-900 dark:text-white">
                        {(() => {
                          const p30 = selectedLawyer.charge_30min || selectedLawyer.consultation_fee_30min;
                          const p60 = selectedLawyer.charge_60min || selectedLawyer.consultation_fee_60min;
                          const fallback = selectedLawyer.fee || selectedLawyer.consultation_fee || selectedLawyer.feeMin || selectedLawyer.price || selectedLawyer.fee_range;

                          let fee30 = p30;
                          let fee60 = p60;
                          
                          if (!fee60 && fallback) {
                            const rawVal = String(fallback).split('-')[0].replace(/[^0-9]/g, '');
                            const num = parseInt(rawVal, 10);
                            if (!isNaN(num)) {
                               fee60 = num; 
                               if (!fee30) fee30 = Math.ceil(num / 2);
                            }
                          } else if (fee60 && !fee30) {
                            fee30 = Math.ceil(fee60 / 2);
                          } else if (fee30 && !fee60) {
                            fee60 = fee30 * 2;
                          }

                          if (fee30 || fee60) {
                            return (
                              <div className="flex items-center gap-3">
                                {fee30 && <span className="bg-slate-100 dark:bg-[#222] text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#333] text-sm tracking-wide font-bold">₹{fee30} <span className="text-xs font-medium opacity-80">/ 30m</span></span>}
                                {fee60 && <span className="bg-slate-100 dark:bg-[#222] text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#333] text-sm tracking-wide font-bold">₹{fee60} <span className="text-xs font-medium opacity-80">/ 1h</span></span>}
                              </div>
                            );
                          }

                          const f = fallback || '—';
                          if (f === '—') return f;
                          return typeof f === 'number' ? `₹${f}` : String(f).startsWith('₹') ? f : `₹${f}`;
                        })()}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 px-5 py-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest w-36 shrink-0 pt-0.5">{d.mode}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const pref = (selectedLawyer.consultation_preferences || '').toLowerCase().trim();
                          const types = (selectedLawyer.consultation_types || []).map(t => t.toLowerCase());
                          const hasVideo = pref === 'video' || pref === 'both' || types.some(t => t.includes('video'));
                          const hasInPerson = pref === 'in_person' || pref === 'both' || types.some(t => t.includes('in_person') || t.includes('in person'));
                          const modes = [];
                          if (hasVideo) modes.push(d.videoCall);
                          if (hasInPerson) modes.push(d.inPerson);
                          return modes.length > 0 ? modes.map((m, i) => (
                            <span key={i} className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#222] border border-slate-200 dark:border-[#333] px-2.5 py-1 rounded-md">{m}</span>
                          )) : <span className="text-sm text-slate-400 dark:text-slate-500 italic">{d.notSpecified}</span>;
                        })()}
                      </div>
                    </div>

                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-[#333] flex gap-4">
                    <Button
                      onClick={() => handleBookConsultation(selectedLawyer)}
                      className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-slate-200 dark:to-slate-300 hover:from-blue-800 hover:to-indigo-800 dark:hover:from-white dark:hover:to-slate-200 shadow-xl shadow-blue-900/20 dark:shadow-none text-white dark:text-slate-900 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      {t('fl_book')} <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Floating AI Lawyer Matching Button */}
      {!selectedLawyer && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-50">
          <motion.button
            onClick={() => navigate('/find-lawyer/ai')}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center px-8 py-3.5 rounded-full bg-[#050505] border-[1.5px] border-blue-600 hover:border-blue-400 hover:bg-[#111] text-blue-50 font-bold text-sm tracking-wide shadow-2xl shadow-blue-900/40 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{t('fl_ai_btn')}</span>
          </motion.button>
        </div>
      )}

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-slate-400 bg-black/50 rounded-full backdrop-blur-md transition-colors shadow-lg border border-white/20"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={expandedImage}
                alt="Expanded Achievement"
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WaveLayout>
  );
}
