import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';

const AnalyticsChart = ({ bookings = [], darkMode = true }) => {
    // Process bookings to get weekly data
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(today, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start, end });

    const chartData = days.map(day => {
        const dayBookings = bookings.filter(b => {
            if (b.date) {
                return b.date === format(day, 'yyyy-MM-dd');
            }
            const bookingDate = b.start_time ? new Date(b.start_time) : null;
            return bookingDate && isSameDay(bookingDate, day);
        });

        // specific logic for 'active' vs 'completed' based on status
        const active = dayBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
        const completed = dayBookings.filter(b => b.status === 'completed').length;

        return {
            name: format(day, 'EEE'), // Mon, Tue, etc.
            active,
            completed
        };
    });

    const totalBookings = bookings.length;

    return (
        <div className={`p-6 rounded-[2.5rem] shadow-sm border h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-blue-50'}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Weekly Appointments</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-2xl font-bold ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}>{totalBookings}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'text-blue-400 bg-blue-500/10' : 'text-blue-500 bg-blue-50'}`}>Total Appointments</span>
                    </div>
                </div>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <Calendar className="w-4 h-4" />
                    This Week
                </button>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={32}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: darkMode ? '#2C2C2C' : '#F3F4F6', radius: 10 }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: darkMode ? '#2C2C2C' : '#FFFFFF',
                                color: darkMode ? '#FFF' : '#1F2937',
                                boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: darkMode ? '#E5E7EB' : '#374151' }}
                            labelStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
                        />
                        <Bar dataKey="active" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} name="Scheduled" />
                        <Bar dataKey="completed" stackId="a" fill={darkMode ? "#1D4ED8" : "#93C5FD"} radius={[4, 4, 0, 0]} name="Completed" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsChart;
