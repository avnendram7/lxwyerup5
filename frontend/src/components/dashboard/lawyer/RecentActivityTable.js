import { Calendar, MoreVertical, FileText } from 'lucide-react';

const RecentActivityTable = ({ cases = [], darkMode = true }) => {

    return (
        <div className={`p-6 rounded-[2.5rem] shadow-sm border h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-blue-50'}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Cases</h3>
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <Calendar className="w-3 h-3" />
                    All Time
                </button>
            </div>

            <div className="flex-1 overflow-x-auto no-scrollbar">
                {cases.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`text-xs uppercase tracking-wider border-b ${darkMode ? 'text-gray-500 border-white/5' : 'text-gray-400 border-gray-100'}`}>
                                <th className="pb-3 pl-2 font-medium">Case No.</th>
                                <th className="pb-3 font-medium">Client Name</th>
                                <th className="pb-3 font-medium">Type</th>
                                <th className="pb-3 font-medium">Date Joined</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium text-right pr-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {cases.map((c, idx) => (
                                <tr key={c.id || idx} className={`group transition-colors rounded-xl border-b last:border-0 ${darkMode ? 'hover:bg-white/5 border-white/5' : 'hover:bg-blue-50/30 border-gray-50'}`}>
                                    <td className={`py-4 pl-2 font-medium rounded-l-xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>#{c.case_number || c.id?.substring(0, 6) || idx + 1}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                                {c.client_name ? c.client_name.charAt(0) : 'U'}
                                            </div>
                                            <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.client_name || 'Unknown Client'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-500">{c.title || c.case_type || 'Legal Case'}</td>
                                    <td className="py-4 text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${(c.status === 'Active' || c.status === 'active') ? (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700') :
                                            (c.status === 'Pending' || c.status === 'pending') ? (darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                                                (darkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700')
                                            }`}>
                                            {c.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right pr-2 rounded-r-xl">
                                        <button className={`p-2 rounded-full transition-all ${darkMode ? 'hover:bg-white/10 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                        <p>No recent cases found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivityTable;
