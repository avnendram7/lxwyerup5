import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Briefcase, MapPin, ArrowRight, ChevronLeft, ChevronRight, ChevronUp, Scale, X, Check, GraduationCap, Sparkles, Award, Star, Calendar, MoreHorizontal, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { dummyLawyers, states, specializations, searchLawyers } from '../data/lawyersData';
import LawyerCard from '../components/LawyerCard';
import { getLawyerPhoto, getInitials, onPhotoError } from '../utils/lawyerPhoto';
import { useLang } from '../context/LanguageContext';
import { useScrollLock } from '../hooks/useScrollLock';



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

const ReadMore = ({ text, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text && text.length > maxLength;
  
  if (!text) return null;
  
  return (
    <div>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
        {shouldTruncate && !isExpanded ? `${text.slice(0, maxLength)}...` : text}
      </p>
      {shouldTruncate && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="mt-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
        >
          {isExpanded ? 'Read Less' : 'Read More...'}
        </button>
      )}
    </div>
  );
};

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
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('fl_searchQuery') || '');
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem('fl_filters');
    if (saved) return JSON.parse(saved);
    return {
      state: '',
      city: '',
      specialization: '',
      court: '',
      minRating: 0,
      consultationType: '',
      priceMax: '',
      withAchievement: false,
      onlySignature: false,
      noSignature: false
    };
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => parseInt(sessionStorage.getItem('fl_currentPage')) || 1);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [dbLawyers, setDbLawyers] = useState(() => {
    const saved = sessionStorage.getItem('fl_dbLawyers');
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingLawyers, setLoadingLawyers] = useState(!sessionStorage.getItem('fl_dbLawyers'));
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const debounceRef = useRef(null);
  const lawyersPerPage = 10;

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

  // Lock body scroll when modal OR filter sheet is open
  useScrollLock(!!(selectedLawyer || showFilters));

  // Collapse search bar on mobile scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 640) {
        setSearchCollapsed(window.scrollY > 300);
      } else {
        setSearchCollapsed(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist local state to sessionStorage
  useEffect(() => { sessionStorage.setItem('fl_filters', JSON.stringify(filters)); }, [filters]);
  useEffect(() => { sessionStorage.setItem('fl_searchQuery', searchQuery); }, [searchQuery]);
  useEffect(() => { sessionStorage.setItem('fl_currentPage', currentPage); }, [currentPage]);

  // Fetch verified lawyers from backend
  useEffect(() => {
    const fetchLawyers = async () => {
      setLoadingLawyers(true);
      try {
        const response = await axios.get(`${API}/lawyers`, { timeout: 5000 });
        setDbLawyers(response.data || []);
        sessionStorage.setItem('fl_dbLawyers', JSON.stringify(response.data || []));
      } catch (error) {
        console.warn('Backend unavailable, using local data:', error.message);
        setDbLawyers([]);
      } finally {
        setLoadingLawyers(false);
      }
    };
    
    // Only fetch if not already populated from cache
    if (dbLawyers.length === 0) {
      fetchLawyers();
    }
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
    // 1. Filter by Signature if toggled
    if (filters.onlySignature && !lawyer.isSignature) return false;
    if (filters.noSignature && lawyer.isSignature) return false;

    // 2. Filter by Search
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

  const ratioWeavedLawyers = useMemo(() => {
    if (filters.onlySignature) return filteredLawyers; // Maintain sorting if strictly filtered

    const signature = filteredLawyers.filter(l => l.isSignature);
    const normal = filteredLawyers.filter(l => !l.isSignature);
    
    const result = [];
    let s_idx = 0, n_idx = 0;
    const pattern = ['S', 'S', 'N',  'S', 'S', 'N', 'N',  'S', 'S', 'N', 'N'];
    let p_idx = 0;

    while (s_idx < signature.length || n_idx < normal.length) {
      const want = pattern[p_idx % pattern.length];
      p_idx++;

      if (want === 'S') {
        if (s_idx < signature.length) result.push(signature[s_idx++]);
        else if (n_idx < normal.length) result.push(normal[n_idx++]);
      } else {
        if (n_idx < normal.length) result.push(normal[n_idx++]);
        else if (s_idx < signature.length) result.push(signature[s_idx++]);
      }
    }
    return result;
  }, [filteredLawyers, filters.onlySignature]);

  // Pagination
  const totalPages = Math.ceil(ratioWeavedLawyers.length / lawyersPerPage);
  const startIndex = (currentPage - 1) * lawyersPerPage;
  const endIndex = startIndex + lawyersPerPage;
  const currentLawyers = ratioWeavedLawyers.slice(startIndex, endIndex);

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
      withAchievement: false,
      onlySignature: false,
      noSignature: false
    });
    setSearchQuery('');
    setDebouncedQuery('');
    setCurrentPage(1);
  };

  const handleProfileClick = (lawyer) => {
    if (lawyer.isSignature) {
      navigate('/signature-profile/' + lawyer.id);
    } else {
      setSelectedLawyer(lawyer);
    }
  };

  const handleBookConsultation = (lawyer) => {
    if (lawyer.isSignature) {
      navigate('/signature-booking', { state: { lawyer } });
    } else {
      navigate('/book-consultation-signup', { state: { lawyer } });
    }
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
    ...(filters.withAchievement ? [{ key: 'withAchievement', value: d.hasAchievements }] : []),
    ...(filters.onlySignature ? [{ key: 'onlySignature', value: 'Signature' }] : []),
    ...(filters.noSignature ? [{ key: 'noSignature', value: 'No Signature' }] : [])
  ].filter(f => f.value);

  return (
    <WaveLayout activePage="find-lawyer" className="!bg-black" hideOrbs={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">

        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-12 transition-colors duration-500">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6 tracking-tight text-slate-900 dark:text-white"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-[#1A1A1A] border border-blue-100 dark:border-[#333] mb-6"
          >
            <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-medium text-blue-600 dark:text-slate-400">{t('fl_verified')}</span>
          </motion.div>
        </div>

        {/* ── Mobile Filter Bottom Sheet (sm:hidden) ── */}
        <AnimatePresence>
          {showFilters && (
            <div className="sm:hidden">
              {/* Backdrop */}
              <motion.div
                key="filter-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowFilters(false)}
              />
              {/* Slide-up sheet */}
              <motion.div
                key="filter-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-white dark:bg-[#121212] border-t border-slate-200 dark:border-[#2a2a2a] shadow-2xl"
                style={{ maxHeight: '88vh' }}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-500" /> Filters
                    {currentFilters.length > 0 && <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">{currentFilters.length}</span>}
                  </h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 rounded-full bg-slate-100 dark:bg-[#222] text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Scrollable filter content */}
                <div
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
                  style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {[
                    { label: t('fl_state'), key: 'state', options: Object.keys(states), defaultLabel: t('fl_all_states'), extra: (e) => { handleFilterChange('city', ''); handleFilterChange('court', ''); } },
                    { label: t('fl_city'), key: 'city', options: getCities(), defaultLabel: t('fl_all_cities'), disabled: !filters.state },
                    { label: t('fl_specialization'), key: 'specialization', options: specializations, defaultLabel: t('fl_all_specs') },
                    { label: t('fl_court'), key: 'court', options: getCourts(), defaultLabel: t('fl_all_courts'), disabled: !filters.state },
                    { label: d.maxFee, key: 'priceMax', options: ['1000', '3000', '5000', '10000', '20000', '50000'], labels: [`${d.under} ₹1,000`, `${d.under} ₹3,000`, `${d.under} ₹5,000`, `${d.under} ₹10,000`, `${d.under} ₹20,000`, `${d.under} ₹50,000`], defaultLabel: d.anyPrice },
                  ].map(({ label, key, options, defaultLabel, disabled, labels, extra }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
                      <select
                        value={filters[key]}
                        disabled={disabled}
                        onChange={(e) => { handleFilterChange(key, e.target.value); extra && extra(e); }}
                        className="w-full p-3 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="">{defaultLabel}</option>
                        {options.map((opt, i) => <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>)}
                      </select>
                    </div>
                  ))}
                  {/* Consultation type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('fl_consult_type')}</label>
                    <div className="flex gap-2 flex-wrap">
                      {[{ val: '', label: 'Any' }, { val: 'video', label: '🎥 Video Call' }, { val: 'in_person', label: '🏛️ In-Person' }].map(opt => (
                        <button key={opt.val} onClick={() => handleFilterChange('consultationType', opt.val)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${filters.consultationType === opt.val ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  {/* Achievements toggle */}
                  <div className="flex items-center gap-3 pb-2">
                    <button onClick={() => handleFilterChange('withAchievement', !filters.withAchievement)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${filters.withAchievement ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.withAchievement ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Award className="w-4 h-4 text-blue-500" /> {t('fl_achievements')}</span>
                  </div>

                  {/* Signature Lawyers toggle */}
                  <div className="flex items-center gap-3 pb-2">
                    <button
                      onClick={() => {
                        handleFilterChange('onlySignature', !filters.onlySignature);
                        if (!filters.onlySignature) handleFilterChange('noSignature', false);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${filters.onlySignature ? 'bg-[#d4af37]' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.onlySignature ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">✨ Signature Lawyers</span>
                  </div>

                  {/* Standard Lawyers toggle */}
                  <div className="flex items-center gap-3 pb-2">
                    <button
                      onClick={() => {
                        handleFilterChange('noSignature', !filters.noSignature);
                        if (!filters.noSignature) handleFilterChange('onlySignature', false);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${filters.noSignature ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.noSignature ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">⚖️ Standard Lawyers</span>
                  </div>
                </div>
                {/* Pinned Apply bar — always visible, never scrolls away */}
                <div className="shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#121212] flex gap-3">
                  <button onClick={clearFilters} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 dark:border-[#333] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1A1A1A] transition-colors active:bg-slate-100">{t('fl_clear_filters')}</button>
                  <Button onClick={() => setShowFilters(false)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm">Apply Filters</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

          {/* Unbreakable Fixed Minimized Button — perfectly replaces filter button's visual position */}
          <AnimatePresence>
            {searchCollapsed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className="sm:hidden fixed pt-[2px] right-4 lg:right-8 z-[9999]" 
                style={{ top: '6rem' }}
              >
                <button
                  onClick={() => setShowFilters(true)}
                  className="shrink-0 h-[46px] w-[54px] flex items-center justify-center rounded-xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] shadow-lg shadow-black/10 text-slate-600 dark:text-slate-300 transition-transform active:scale-95 relative"
                >
                  <MoreHorizontal className="w-5 h-5" />
                  {currentFilters.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center shrink-0 shadow-sm">{currentFilters.length}</span>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Filters — sticky wrapper smoothly fades out without altering document height */}
          <div className={`sticky top-20 sm:top-24 z-30 mb-6 sm:mb-12 transition-all duration-300 ease-out ${searchCollapsed ? 'opacity-0 pointer-events-none -translate-y-4 sm:opacity-100 sm:pointer-events-auto sm:translate-y-0' : 'opacity-100 pointer-events-auto translate-y-0'}`}>
            <FloatingCard className="w-full p-4 sm:p-6">
              <div className="flex flex-row gap-2 sm:gap-3 items-center">
                <div className="relative flex-1">
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
                className={`shrink-0 h-[46px] sm:h-[50px] px-3 sm:px-4 border-slate-200 dark:border-[#333] dark:bg-[#1A1A1A] ${showFilters || currentFilters.length > 0 ? 'bg-blue-50 dark:bg-[#222] border-blue-200 dark:border-[#444] text-blue-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'} transition-all shadow-sm`}
              >
                <Filter className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('fl_filters')}</span>
                {currentFilters.length > 0 && (
                  <span className="ml-1.5 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
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
                  <button onClick={() => handleFilterChange(f.key, (f.key === 'withAchievement' || f.key === 'onlySignature' || f.key === 'noSignature') ? false : '')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
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
                {/* Scrollable filter dropdowns — max height on mobile so Apply button stays visible */}
                <div className="overflow-y-auto" style={{ maxHeight: 'min(55vh, 420px)' }}>
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
                </div>

                {/* Apply button row — always visible, outside the scrollable area */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-5 w-full sm:w-auto">
                    {/* Signature Filter */}
                    <div className="flex items-center gap-2">
                       <button
                         onClick={() => {
                            handleFilterChange('onlySignature', !filters.onlySignature);
                            if (!filters.onlySignature) handleFilterChange('noSignature', false);
                         }}
                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.onlySignature ? 'bg-[#d4af37]' : 'bg-slate-300 dark:bg-slate-700'}`}
                       >
                         <span className="sr-only">Toggle Signature</span>
                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.onlySignature ? 'translate-x-6' : 'translate-x-1'}`} />
                       </button>
                       <span className="text-xl" style={{ color: '#d4af37', fontFamily: '"Great Vibes", cursive' }}>
                         Signature Lawyers
                       </span>
                    </div>

                    {/* No Signature Filter */}
                    <div className="flex items-center gap-2 ml-4">
                       <button
                         onClick={() => {
                            handleFilterChange('noSignature', !filters.noSignature);
                            if (!filters.noSignature) handleFilterChange('onlySignature', false);
                         }}
                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.noSignature ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                       >
                         <span className="sr-only">Toggle No Signature</span>
                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.noSignature ? 'translate-x-6' : 'translate-x-1'}`} />
                       </button>
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         Standard Lawyers
                       </span>
                    </div>

                    {/* Achievements Filter */}
                    <div className="flex items-center gap-2">
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
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-slate-500 hover:text-slate-600 font-medium transition-colors"
                    >
                      {t('fl_clear_filters')}
                    </button>
                    <Button 
                      onClick={() => setShowFilters(false)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FloatingCard>
        </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-12">
            {currentLawyers.map((lawyer, index) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                index={index}
                onProfileClick={handleProfileClick}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 32 }}>
            {/* Prev button */}
            <button
              type="button"
              onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              style={{
                width: 40, height: 40, borderRadius: 12, border: '1px solid',
                borderColor: currentPage === 1 ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.5)',
                background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: currentPage === 1 ? 0.4 : 1,
                transition: 'all 0.15s',
                color: 'inherit',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      border: isActive ? 'none' : '1px solid rgba(148,163,184,0.3)',
                      background: isActive ? '#2563eb' : 'transparent',
                      color: isActive ? '#ffffff' : 'inherit',
                      fontSize: 14, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              style={{
                width: 40, height: 40, borderRadius: 12, border: '1px solid',
                borderColor: currentPage === totalPages ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.5)',
                background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: currentPage === totalPages ? 0.4 : 1,
                transition: 'all 0.15s',
                color: 'inherit',
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
              className="dark relative w-full max-w-5xl rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] border border-white/5"
              style={{ background: '#000000', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}
            >
              {/* Modal Header */}
              <div className="h-32 relative shrink-0" style={{ background: '#000000' }}>
                {/* Watermark — smaller, shifted to bottom-right without background */}
                <span
                  className="absolute bottom-2 right-4 select-none pointer-events-none font-bold"
                  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.08)', letterSpacing: '0.25em', textTransform: 'uppercase' }}
                >Lxwyer Up</span>
                {/* Close button — top-left, transparent bg */}
                <button
                  onClick={() => setSelectedLawyer(null)}
                  className="absolute top-4 left-4 p-2 rounded-full transition-colors z-10"
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  <X className="w-5 h-5" />
                </button>
                {/* Subtle gradient separator */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              </div>

              <div
                className="flex-1 overflow-y-auto px-5 sm:px-10 pb-10 custom-scrollbar"
                style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                onWheel={e => e.stopPropagation()}
                onTouchMove={e => e.stopPropagation()}
              >
                {/* Avatar + name row */}
                <div className="flex items-center gap-5 pt-6 pb-6 mb-2 border-b border-white/8" style={{borderBottomColor:'rgba(255,255,255,0.08)'}}>
                  {/* Avatar */}
                  <div style={{ width:80, height:80, borderRadius:16, overflow:'hidden', border:'3px solid rgba(255,255,255,0.12)', boxShadow:'0 8px 24px rgba(0,0,0,0.6)', flexShrink:0 }}>
                    {getLawyerPhoto(selectedLawyer.photo, selectedLawyer.name) ? (
                      <img
                        src={getLawyerPhoto(selectedLawyer.photo, selectedLawyer.name)}
                        alt={selectedLawyer.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1e3a8a,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:28, fontWeight:900, color:'#fff' }}>{getInitials(selectedLawyer.name)}</span>
                      </div>
                    )}
                  </div>
                  {/* Name / spec */}
                  <div className="flex-1 min-w-0">
                    <h2 style={{ fontSize:'clamp(1.2rem,4vw,1.75rem)', fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selectedLawyer.name}</h2>
                    <p style={{ color:'#60a5fa', fontWeight:600, fontSize:'0.95rem', marginTop:2 }}>{selectedLawyer.specialization}</p>
                  </div>
                  {/* Verified badge */}
                  {selectedLawyer.verified && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(16,185,129,0.12)', color:'#34d399', fontSize:'0.78rem', fontWeight:700, borderRadius:8, border:'1px solid rgba(16,185,129,0.25)', flexShrink:0 }}>
                      <Check className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div style={{ padding:'20px 24px', background:'rgba(255,255,255,0.04)', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(148,163,184,0.7)', marginBottom:8, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>
                      <Briefcase className="w-4 h-4" style={{color:'#60a5fa'}} /> {d.experience}
                    </div>
                    <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff' }}>{selectedLawyer.experience} {d.years}</div>
                  </div>
                  <div style={{ padding:'20px 24px', background:'rgba(255,255,255,0.04)', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(148,163,184,0.7)', marginBottom:8, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>
                      <MapPin className="w-4 h-4" style={{color:'#60a5fa'}} /> {d.location}
                    </div>
                    <div style={{ fontSize:'1.25rem', fontWeight:800, color:'#fff' }}>{selectedLawyer.city}</div>
                  </div>
                </div>

                <div style={{ marginBottom:32, padding:'20px 24px', background:'rgba(255,255,255,0.04)', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(148,163,184,0.7)', marginBottom:10, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700 }}>
                    <GraduationCap className="w-4 h-4" style={{color:'#60a5fa'}} /> {d.education}
                  </div>
                  <div style={{ fontSize:'1.05rem', fontWeight:700, color:'#fff', lineHeight:1.5 }}>{selectedLawyer.education}</div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                      {d.about}
                      <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />
                    </h3>
                    {selectedLawyer.bio ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        <ReadMore text={selectedLawyer.bio} maxLength={250} />
                      </div>
                    ) : (
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
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                                <p className="font-bold text-lg sm:text-xl leading-snug break-words text-slate-900 dark:text-emerald-50 w-full sm:w-auto flex-1 pr-2">
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4">
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
                              <div className="flex flex-wrap items-center gap-3">
                                {fee30 && <span style={{ minWidth: 100, display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between' }} className="bg-slate-100 dark:bg-[#222] text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#333] text-sm tracking-wide font-bold">₹{fee30} <span className="text-xs font-medium opacity-60 ml-1">/ 30m</span></span>}
                                {fee60 && <span style={{ minWidth: 100, display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between' }} className="bg-slate-100 dark:bg-[#222] text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#333] text-sm tracking-wide font-bold">₹{fee60} <span className="text-xs font-medium opacity-60 ml-1">/ 1h</span></span>}
                              </div>
                            );
                          }

                          const f = fallback || '—';
                          if (f === '—') return f;
                          return typeof f === 'number' ? `₹${f}` : String(f).startsWith('₹') ? f : `₹${f}`;
                        })()}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 px-5 py-4">
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


      {/* Floating AI Lawyer Matching Button — hidden when filter sheet open */}
      {!selectedLawyer && !showFilters && (
        <div className="fixed bottom-6 right-4 md:right-8 z-30">
          <motion.button
            onClick={() => navigate('/find-lawyer/ai')}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center rounded-full bg-[#050505] border-[1.5px] border-blue-600 hover:border-blue-400 hover:bg-[#111] text-blue-50 font-semibold shadow-2xl shadow-blue-900/40 transition-all cursor-pointer transform scale-[0.7] md:scale-100 origin-bottom-right"
            style={{ padding: '8px 16px', fontSize: 13, letterSpacing: '0.04em' }}
          >
            <Sparkles className="w-4 h-4 sm:hidden mr-2" />
            <span className="hidden sm:inline">AI Lawyer Matching</span>
            <span className="sm:hidden text-xs">AI Lawyer Matching</span>
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
