import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, MoreVertical, Calendar, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const CasesView = ({ cases = [], darkMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending, closed

    // Filter cases based on search and status
    const filteredCases = cases.filter(c => {
        const matchesSearch =
            (c.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (c.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (c.case_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && (c.status?.toLowerCase() === filterStatus);
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return darkMode ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-green-700 bg-green-100 border-green-200';
            case 'pending': return darkMode ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-amber-700 bg-amber-100 border-amber-200';
            case 'closed': return darkMode ? 'text-gray-400 bg-gray-400/10 border-gray-400/20' : 'text-gray-700 bg-gray-100 border-gray-200';
            default: return darkMode ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-blue-700 bg-blue-100 border-blue-200';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-8 h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#0F2944]'}`}>
                        Case Management
                    </h1>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Manage and track all your legal cases
                    </p>
                </div>
                <Button className={`${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#0F2944] hover:bg-[#0F2944]/90'} text-white rounded-xl px-6 shadow-lg`}>
                    + New Case
                </Button>
            </div>

            {/* Filters & Search */}
            <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row gap-4 items-center ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="relative flex-1 w-full">
                    <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                        placeholder="Search by client, case no, or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-10 rounded-xl ${darkMode ? 'bg-white/5 border-white/5 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-[#0F2944]'}`}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'active', 'pending', 'closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap ${filterStatus === status
                                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-[#0F2944] text-white')
                                    : (darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cases Grid */}
            {filteredCases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredCases.map((c, idx) => (
                        <motion.div
                            key={c.id || idx}
                            variants={itemVariants}
                            className={`rounded-2xl border p-6 group cursor-pointer transition-all hover:shadow-lg ${darkMode ? 'bg-[#1c1c1c] border-white/5 hover:border-blue-500/30' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <button className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                        #{c.case_number || c.id?.substring(0, 8)}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getStatusColor(c.status || 'active')}`}>
                                        {c.status || 'Active'}
                                    </span>
                                </div>
                                <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${darkMode ? 'text-white' : 'text-[#0F2944]'}`}>
                                    {c.title || c.case_type || 'Untitled Case'}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {c.court || 'Court not specified'}
                                </p>
                            </div>

                            <div className={`flex items-center gap-3 pt-4 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                    {c.client_name ? c.client_name.charAt(0) : 'U'}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {c.client_name || 'Unknown Client'}
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {c.updated_at ? `Updated ${new Date(c.updated_at).toLocaleDateString()}` : 'No updates'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className={`flex-1 flex flex-col items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <FileText className="w-10 h-10 opacity-20" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>No cases found</h3>
                    <p className="max-w-xs text-center">
                        {searchTerm || filterStatus !== 'all' ? "Try adjusting your search or filters" : "Get started by creating a new case"}
                    </p>
                    {(!searchTerm && filterStatus === 'all') && (
                        <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                            Create First Case
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default CasesView;
