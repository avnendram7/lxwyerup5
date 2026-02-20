import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Briefcase } from 'lucide-react';

const DemographicsChart = ({ cases = [], darkMode = true }) => {

    // Calculate status counts
    const activeCount = cases.filter(c => c.status === 'active' || c.status === 'open').length;
    const pendingCount = cases.filter(c => c.status === 'pending').length;
    const closedCount = cases.filter(c => c.status === 'closed' || c.status === 'completed').length;

    const totalCases = cases.length;

    const data = [
        { name: 'Active', value: activeCount, color: '#3B82F6' }, // Blue
        { name: 'Pending', value: pendingCount, color: '#A78BFA' }, // Purple
        { name: 'Closed', value: closedCount, color: darkMode ? '#4B5563' : '#F3F4F6' }, // Dark Gray vs Light Gray
    ];

    // Filter out zero values for cleaner chart if needed, 
    // but keeping them creates the full ring visual even if empty segments exist.
    // However, Recharts handles 0 values fine.

    return (
        <div className={`p-6 rounded-[2.5rem] shadow-sm border h-full flex flex-col relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-blue-50'}`}>
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Case Status</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{totalCases}</h2>
                        <span className="text-xs text-gray-400">Total Cases</span>
                    </div>
                </div>
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <Briefcase className="w-3 h-3" />
                    All Time
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs font-medium relative z-10">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Closed</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px] relative z-0 mt-auto">
                {/* Semi-circle gauge effect using Pie Chart */}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="60%"
                            outerRadius="100%"
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: darkMode ? '#2C2C2C' : '#FFFFFF',
                                color: darkMode ? '#FFF' : '#1F2937',
                                boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: darkMode ? '#E5E7EB' : '#374151' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text Overlay */}
                <div className="absolute inset-x-0 bottom-4 text-center">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Cases</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{totalCases}</p>
                </div>
            </div>

            {/* Decorative gradient background similar to design */}
            <div className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none rounded-b-[2.5rem] bg-gradient-to-t from-transparent ${darkMode ? 'from-white/5' : 'from-blue-50/50'}`} />
        </div>
    );
};

export default DemographicsChart;
