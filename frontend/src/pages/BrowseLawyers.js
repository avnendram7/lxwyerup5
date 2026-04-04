import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Search, Filter, Briefcase, MapPin, ArrowRight, X, ChevronDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { dummyLawyers, specializationsList, statesList } from '../data/lawyersData';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-[#0F2944]">Lxwyer Up</span>
          </button>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/ai-lawyer-chat')}
              variant="ghost"
              className="text-[#0F2944] hover:text-[#0F2944]/80"
            >
              Try AI Assistant
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="text-[#0F2944] hover:text-[#0F2944]/80"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/role-selection')}
              className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const BrowseLawyers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [lawyers, setLawyers] = useState(dummyLawyers.map(l => ({ ...l, is_verified: l.verified })));
  const [loading, setLoading] = useState(true);

  // Fetch lawyers
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await axios.get(`${API}/lawyers`);
        const realLawyers = res.data.map(l => ({
          ...l,
          name: l.full_name || l.name,
          experience: l.experience_years || l.experience,
          _isReal: true, // Tag as real DB lawyer
        }));

        // Merge: Real lawyers first, then dummy
        const allLawyers = [...realLawyers, ...dummyLawyers.map(l => ({ ...l, is_verified: l.verified, _isReal: false }))];

        // Sort: Real lawyers first, then verified first within each group
        allLawyers.sort((a, b) => {
          if (a._isReal !== b._isReal) return a._isReal ? -1 : 1;
          if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
          return 0;
        });

        setLawyers(allLawyers);
      } catch (error) {
        console.error("Failed to fetch lawyers:", error);
        // Fallback is already set in initial state, but ensure it's consistent
        setLawyers(dummyLawyers.map(l => ({ ...l, is_verified: l.verified })));
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  // Filter states
  const [filters, setFilters] = useState({
    specialization: '',
    state: '',
    experienceMin: '',
    experienceMax: '',
    verified: false
  });

  // Filter and search lawyers
  const filteredLawyers = useMemo(() => {
    return lawyers.filter(lawyer => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          lawyer.name.toLowerCase().includes(query) ||
          lawyer.name.toLowerCase().includes(query) ||
          lawyer.specialization?.toLowerCase().includes(query) ||
          lawyer.city?.toLowerCase().includes(query) ||
          lawyer.state?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Specialization filter
      if (filters.specialization && lawyer.specialization !== filters.specialization) {
        return false;
      }

      // State filter
      if (filters.state && lawyer.state !== filters.state) {
        return false;
      }

      // Experience filter
      const exp = parseInt(lawyer.experience_years || lawyer.experience || 0);
      if (filters.experienceMin && exp < parseInt(filters.experienceMin)) {
        return false;
      }
      if (filters.experienceMax && exp > parseInt(filters.experienceMax)) {
        return false;
      }



      // Verified filter
      if (filters.verified && !lawyer.is_verified) {
        return false;
      }

      return true;
    });
  }, [lawyers, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
  const paginatedLawyers = filteredLawyers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setFilters({
      specialization: '',
      state: '',
      experienceMin: '',
      experienceMax: '',
      verified: false
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by name, specialization, or location..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={`border-2 ${activeFiltersCount > 0 ? 'border-[#0F2944] bg-[#0F2944]/5' : 'border-gray-300'} text-[#0F2944] hover:bg-gray-50 px-6 py-4 rounded-xl font-semibold relative`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#0F2944] text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white rounded-xl border border-gray-200 p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#0F2944]">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-[#0F2944]"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <select
                        value={filters.specialization}
                        onChange={(e) => { setFilters({ ...filters, specialization: e.target.value }); setCurrentPage(1); }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      >
                        <option value="">All</option>
                        {specializationsList.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <select
                        value={filters.state}
                        onChange={(e) => { setFilters({ ...filters, state: e.target.value }); setCurrentPage(1); }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      >
                        <option value="">All States</option>
                        {statesList.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Min Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience</label>
                      <select
                        value={filters.experienceMin}
                        onChange={(e) => { setFilters({ ...filters, experienceMin: e.target.value }); setCurrentPage(1); }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      >
                        <option value="">Any</option>
                        <option value="5">5+ years</option>
                        <option value="10">10+ years</option>
                        <option value="15">15+ years</option>
                        <option value="20">20+ years</option>
                      </select>
                    </div>

                    {/* Max Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience</label>
                      <select
                        value={filters.experienceMax}
                        onChange={(e) => { setFilters({ ...filters, experienceMax: e.target.value }); setCurrentPage(1); }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      >
                        <option value="">Any</option>
                        <option value="5">Up to 5 years</option>
                        <option value="10">Up to 10 years</option>
                        <option value="15">Up to 15 years</option>
                        <option value="25">Up to 25 years</option>
                      </select>
                    </div>

                    {/* Verified Only */}
                    <div className="flex items-end">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verified}
                          onChange={(e) => { setFilters({ ...filters, verified: e.target.checked }); setCurrentPage(1); }}
                          className="w-4 h-4 text-[#0F2944] border-gray-300 rounded focus:ring-[#0F2944]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <p className="text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredLawyers.length)} of {filteredLawyers.length} lawyers
            </p>
          </motion.div>

          {/* Lawyers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLawyers.map((lawyer, index) => (
              <motion.div
                key={lawyer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={(lawyer.photo && lawyer.photo.length > 5) ? lawyer.photo : (lawyer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=0D8ABC&color=fff`)}
                      alt={lawyer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {lawyer.is_verified ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : null}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#0F2944] mb-1">{lawyer.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{lawyer.specialization}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{lawyer.experience_years || lawyer.experience || 0} years exp</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{lawyer.city}, {lawyer.state}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/lawyer/${lawyer.id}`)}
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-[#0F2944] hover:bg-gray-50 py-3 rounded-xl font-semibold"
                  >
                    View Profile
                  </Button>
                  <Button
                    onClick={() => navigate(`/booking/${lawyer.id}`)}
                    className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white py-3 rounded-xl font-semibold group"
                  >
                    Book
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="border-gray-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
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
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    className={currentPage === pageNum ? 'bg-[#0F2944]' : 'border-gray-300'}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="border-gray-300"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseLawyers;
