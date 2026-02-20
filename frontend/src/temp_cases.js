import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Assuming path
import { Input } from '@/components/ui/input';
import { Search, Filter, Briefcase, Clock, CheckCircle, FileText, MoreHorizontal, MoreVertical, X } from 'lucide-react';

export default function CasesTab({ activeTab, cases, pendingBookings, showCaseModal, setShowCaseModal, darkMode, activeCases }) {
    return (
        <>
            {activeTab === 'cases' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#131313]'}`}>Case Management</h1>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track your active cases, clients, and legal proceedings.</p>
                        </div>
                        <Button
                            onClick={() => setShowCaseModal(true)}
                            className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#131313] hover:bg-black text-white'} rounded-xl px-6 py-6 shadow-lg`}
                        >
                            + New Case
                        </Button>
                    </div>

                    {/* Case Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                    Active
                                </span>
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{cases.length}</div>
                            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Active Cases</div>
                        </div>

                        <div className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                    Pending
                                </span>
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{pendingBookings.length}</div>
                            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Upcoming Hearings</div>
                        </div>

                        <div className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    Completed
                                </span>
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>12</div>
                            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cases Resolved</div>
                        </div>
                    </div>

                    {/* Case List */}
                    <div className={`rounded-3xl shadow-sm border overflow-hidden transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#131313]'}`}>Recent Cases</h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <Input
                                        placeholder="Search cases..."
                                        className={`pl-9 w-64 ${darkMode ? 'bg-slate-900 border-slate-700 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                    />
                                </div>
                                <Button variant="outline" className={`${darkMode ? 'border-slate-700 text-gray-300 hover:bg-slate-700' : ''}`}>
                                    <Filter className="w-4 h-4 mr-2" /> Filter
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${darkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Case Title</th>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Client</th>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stage</th>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Next Hearing</th>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Activity</th>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeCases.length > 0 ? (
                                        activeCases.map((caseItem) => (
                                            <tr key={caseItem.id} className={`border-b transition-all duration-200 ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                                                <td className="px-6 py-4">
                                                    <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-[#0F2944]'}`}>{caseItem.title}</p>
                                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>#{caseItem.caseNumber}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                            {caseItem.client.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{caseItem.client}</p>
                                                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>+91 98765 43210</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${caseItem.stage === 'Discovery' ? (darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100') :
                                                            caseItem.stage === 'Hearing' ? (darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-100') :
                                                                (darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-100')
                                                        }`}>
                                                        {caseItem.stage}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {new Date(caseItem.nextHearing).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            style={{ width: '65%' }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs mt-1 block ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>65% Complete</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${caseItem.priority === 'High' ? (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600') :
                                                            caseItem.priority === 'Medium' ? (darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600') :
                                                                (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')
                                                        }`}>
                                                        {caseItem.priority} Priority
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button variant="ghost" size="sm" className={`${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600'}`}>
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                                    <FileText className={`w-6 h-6 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                                                </div>
                                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No active cases found</p>
                                                <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'} mt-1`}>Add a new case to get started</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className={`px-6 py-4 border-t flex justify-between items-center ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Showing 1-{activeCases.length} of {activeCases.length} cases</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled className={`${darkMode ? 'border-white/10 text-gray-500' : ''}`}>Previous</Button>
                                <Button variant="outline" size="sm" disabled className={`${darkMode ? 'border-white/10 text-gray-500' : ''}`}>Next</Button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities & Tasks */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Upcoming Hearings */}
                        <div className={`col-span-1 rounded-3xl shadow-sm border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Hearings</h3>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600">View All</Button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white shadow-sm text-gray-900'}`}>
                                            <span>FEB</span>
                                            <span className="text-sm">2{i + 4}</span>
                                        </div>
                                        <div>
                                            <h4 className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>State vs. Sharma</h4>
                                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Hearing • High Court</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className={`text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400`}>10:00 AM</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tasks / To-Do */}
                        <div className={`col-span-2 rounded-3xl shadow-sm border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pending Tasks</h3>
                                <Button size="sm" className="h-8 bg-indigo-600 text-white rounded-lg">Add Task</Button>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border group hover:border-indigo-200 transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                            {i === 0 && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium text-sm ${i === 0 ? 'line-through text-gray-400' : (darkMode ? 'text-gray-200' : 'text-gray-900')}`}>
                                                Review case documents for Mr. Verma
                                            </p>
                                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Due Today • {i === 0 ? 'Completed' : 'Pending'}</p>
                                        </div>
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-slate-800" />
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px]">
                                                +2
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Case Details Modal - Simplified for now */}
                    {showCaseModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add New Case</h2>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter case details to track progress</p>
                                    </div>
                                    <Button variant="ghost" onClick={() => setShowCaseModal(false)} className="rounded-full h-10 w-10 p-0">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Case Title</label>
                                        <Input placeholder="e.g. State vs. Sharma" className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Client Name</label>
                                        <Input placeholder="Client Name" className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Case Number</label>
                                        <Input placeholder="CNR Number" className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Court Type</label>
                                        <select className={`w-full h-10 rounded-md border px-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                                            <option>High Court</option>
                                            <option>District Court</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Initial Hearing</label>
                                        <Input type="date" className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''}`} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Case Description</label>
                                        <textarea
                                            className={`w-full rounded-md border p-3 h-24 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                                            placeholder="Brief description of the case..."
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setShowCaseModal(false)} className={`${darkMode ? 'border-slate-700 text-gray-300' : ''}`}>Cancel</Button>
                                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700 px-8">Create Case</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </motion.div>

            )}
        </>
    );
}
