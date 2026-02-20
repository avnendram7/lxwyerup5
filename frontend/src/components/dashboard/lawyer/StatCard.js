import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay = 0, darkMode = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-6 rounded-[2rem] shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-blue-50'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${colorClass} bg-opacity-10 flex items-center justify-center text-xl`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
                <button className={`transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-300 hover:text-gray-500'}`}>
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
            <div>
                <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
                <div className="flex items-end gap-2 flex-wrap">
                    <h2 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{value}</h2>
                    {subtext && (
                        <span className={`text-xs font-medium mb-1.5 px-2 py-0.5 rounded-lg ${subtext.includes('+') ? (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600') : (darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                            }`}>
                            {subtext}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
