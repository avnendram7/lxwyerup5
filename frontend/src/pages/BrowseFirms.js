import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Search, Filter, Building2, MapPin, Users, Calendar, ArrowRight, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { dummyLawFirms, specializationsList, statesList } from '../data/lawFirmsDataExtended';

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
              onClick={() => navigate('/ai-firm-finder')}
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

const BrowseFirms = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [filters, setFilters] = useState({
    specialization: '',
    state: '',
    lawyersMin: '',
    verified: false
  });

  // Filter and search firms
  const filteredFirms = useMemo(() => {
    return dummyLawFirms.filter(firm => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          firm.firm_name.toLowerCase().includes(query) ||
          firm.description.toLowerCase().includes(query) ||
          firm.city.toLowerCase().includes(query) ||
          firm.practice_areas.some(area => area.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Specialization filter
      if (filters.specialization && !firm.practice_areas.includes(filters.specialization)) {
        return false;
      }

      // State filter
      if (filters.state && firm.state !== filters.state) {
        return false;
      }

      // Lawyers count filter
      if (filters.lawyersMin && firm.total_lawyers < parseInt(filters.lawyersMin)) {
        return false;
      }



      // Verified filter
      if (filters.verified && !firm.verified) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);
  const paginatedFirms = filteredFirms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setFilters({
      specialization: '',
      state: '',
      lawyersMin: '',
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

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Practice Area</label>
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

                    {/* Min Lawyers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Lawyers</label>
                      <select
                        value={filters.lawyersMin}
                        onChange={(e) => { setFilters({ ...filters, lawyersMin: e.target.value }); setCurrentPage(1); }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                      >
                        <option value="">Any</option>
                        <option value="5">5+ lawyers</option>
                        <option value="10">10+ lawyers</option>
                        <option value="20">20+ lawyers</option>
                        <option value="30">30+ lawyers</option>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredFirms.length)} of {filteredFirms.length} law firms
            </p>
          </motion.div>

          {/* Firms Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedFirms.map((firm, index) => (
              <motion.div
                key={firm.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={firm.logo}
                      alt={firm.firm_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {firm.verified ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : firm.id.startsWith('dummy') && (
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gray-500 rounded-full flex items-center justify-center border border-white">
                        <span className="text-[10px] text-white font-bold">DUMMY</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#0F2944] mb-1">{firm.firm_name}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{firm.description}</p>

                <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{firm.city}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{firm.total_lawyers} lawyers</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Since {firm.established_year}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {firm.practice_areas.slice(0, 3).map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#0F2944]/10 text-[#0F2944] text-xs rounded-full font-medium"
                    >
                      {area}
                    </span>
                  ))}
                  {firm.practice_areas.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{firm.practice_areas.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Consultation</p>
                    <p className="text-lg font-bold text-[#0F2944]">{firm.consultation}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/firm/${firm.id}`)}
                      variant="outline"
                      className="border-2 border-gray-300 text-[#0F2944] hover:bg-gray-50 px-4 py-3 rounded-xl font-semibold"
                    >
                      View Profile
                    </Button>
                    <Button
                      onClick={() => navigate(`/join-firm/${firm.id}`)}
                      className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white px-6 py-3 rounded-xl font-semibold group"
                    >
                      Join Firm
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
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

export default BrowseFirms;
