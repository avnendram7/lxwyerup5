import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Scale, LogOut, LayoutDashboard, FileText, Calendar, MessageSquare, CheckCircle, Clock, AlertCircle, TrendingUp, Users, Target, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function FirmLawyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dummy data for firm lawyer
  const lawyerStats = {
    tasksCompleted: 28,
    tasksPending: 5,
    casesActive: 8,
    casesWon: 45,
    monthlyTarget: 85
  };

  const pendingTasks = [
    { id: 1, title: 'Review contract for Sharma Industries', deadline: 'Today', priority: 'high', case: 'Corporate Law' },
    { id: 2, title: 'Prepare witness statement - Kumar case', deadline: 'Tomorrow', priority: 'high', case: 'Criminal Law' },
    { id: 3, title: 'Submit bail application documents', deadline: 'Jan 22', priority: 'medium', case: 'Criminal Law' },
    { id: 4, title: 'Client meeting preparation - Gupta divorce', deadline: 'Jan 23', priority: 'medium', case: 'Family Law' },
    { id: 5, title: 'File property title verification report', deadline: 'Jan 25', priority: 'low', case: 'Property Law' }
  ];

  const recentCases = [
    { id: 1, title: 'Sharma vs Builder Corp', status: 'Active', type: 'Property', progress: 65 },
    { id: 2, title: 'Kumar Criminal Defense', status: 'Active', type: 'Criminal', progress: 40 },
    { id: 3, title: 'Gupta Divorce Settlement', status: 'Active', type: 'Family', progress: 80 },
    { id: 4, title: 'Tech Corp Tax Appeal', status: 'Pending', type: 'Tax', progress: 25 }
  ];

  const upcomingHearings = [
    { date: 'Jan 22', case: 'Kumar Criminal Defense', court: 'Sessions Court', time: '10:30 AM' },
    { date: 'Jan 25', case: 'Sharma vs Builder Corp', court: 'High Court', time: '11:00 AM' },
    { date: 'Jan 28', case: 'Gupta Divorce', court: 'Family Court', time: '09:30 AM' }
  ];

  const performanceMetrics = [
    { label: 'Cases Won', value: '92%', trend: '+5%' },
    { label: 'Client Satisfaction', value: '4.8/5', trend: '+0.2' },
    { label: 'Task Completion', value: '95%', trend: '+3%' },
    { label: 'Response Time', value: '2.5 hrs', trend: '-30min' }
  ];

  // Calendar data
  const calendarEvents = [
    {
      id: 1,
      date: '2026-01-22',
      time: '10:30 AM',
      title: 'Kumar Criminal Defense - Court Hearing',
      location: 'Sessions Court, Delhi',
      type: 'hearing',
      color: 'red'
    },
    {
      id: 2,
      date: '2026-01-22',
      time: '3:00 PM',
      title: 'Client Meeting - Sharma Industries',
      location: 'Office',
      type: 'meeting',
      color: 'blue'
    },
    {
      id: 3,
      date: '2026-01-23',
      time: '11:00 AM',
      title: 'Document Review - Gupta Divorce Case',
      location: 'Office',
      type: 'task',
      color: 'green'
    },
    {
      id: 4,
      date: '2026-01-25',
      time: '11:00 AM',
      title: 'Sharma vs Builder Corp - High Court Hearing',
      location: 'Delhi High Court',
      type: 'hearing',
      color: 'red'
    },
    {
      id: 5,
      date: '2026-01-26',
      time: '2:00 PM',
      title: 'Consultation - New Client',
      location: 'Office',
      type: 'meeting',
      color: 'blue'
    },
    {
      id: 6,
      date: '2026-01-28',
      time: '9:30 AM',
      title: 'Gupta Divorce Settlement - Family Court',
      location: 'Family Court, Delhi',
      type: 'hearing',
      color: 'red'
    },
    {
      id: 7,
      date: '2026-01-29',
      time: '4:00 PM',
      title: 'Team Meeting - Case Strategy Discussion',
      location: 'Conference Room',
      type: 'meeting',
      color: 'blue'
    }
  ];

  // Messages data
  const messages = [
    {
      id: 1,
      sender: 'Mr. Rajesh Kumar',
      role: 'Client',
      message: 'Hello Advocate, I wanted to know the status of my criminal case. When is the next hearing scheduled?',
      time: '10 mins ago',
      unread: true,
      avatar: 'RK'
    },
    {
      id: 2,
      sender: 'Adv. Priya Sharma',
      role: 'Senior Partner',
      message: 'Please review the contract documents for Sharma Industries and send me your feedback by EOD.',
      time: '1 hour ago',
      unread: true,
      avatar: 'PS'
    },
    {
      id: 3,
      sender: 'Ms. Sunita Gupta',
      role: 'Client',
      message: 'Thank you for the update on my divorce case. I have signed the documents and will courier them today.',
      time: '3 hours ago',
      unread: false,
      avatar: 'SG'
    },
    {
      id: 4,
      sender: 'Court Clerk',
      role: 'Court Official',
      message: 'Your hearing for Case No. CR/123/2025 has been scheduled for 22nd January at 10:30 AM.',
      time: '5 hours ago',
      unread: false,
      avatar: 'CC'
    },
    {
      id: 5,
      sender: 'Mr. Vikram Singh',
      role: 'Client',
      message: 'I need to discuss some urgent matters regarding my property case. Can we schedule a call today?',
      time: 'Yesterday',
      unread: false,
      avatar: 'VS'
    },
    {
      id: 6,
      sender: 'Firm Manager',
      role: 'Manager',
      message: 'Please submit your monthly performance report by Friday. Great work on the Kumar case!',
      time: 'Yesterday',
      unread: false,
      avatar: 'FM'
    }
  ];

  // Enhanced performance data
  const monthlyPerformance = {
    casesHandled: 12,
    casesWon: 11,
    casesOngoing: 8,
    clientsMet: 24,
    hoursWorked: 186,
    revenue: '₹8,50,000',
    targetAchievement: 94
  };

  const performanceChart = [
    { month: 'Aug', cases: 8, wins: 7 },
    { month: 'Sep', cases: 10, wins: 9 },
    { month: 'Oct', cases: 12, wins: 11 },
    { month: 'Nov', cases: 11, wins: 10 },
    { month: 'Dec', cases: 13, wins: 12 },
    { month: 'Jan', cases: 12, wins: 11 }
  ];

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Changed localStorage.removeItem to sessionStorage.removeItem
    sessionStorage.removeItem('user'); // Changed localStorage.removeItem to sessionStorage.removeItem
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0F2944] rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold block text-[#0F2944]">Lxwyer Up</span>
              <span className="text-xs text-purple-600">FIRM LAWYER</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'tasks', icon: CheckCircle, label: 'My Tasks', badge: 5 },
            { id: 'cases', icon: FileText, label: 'My Cases' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
            { id: 'performance', icon: TrendingUp, label: 'Performance' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                ? 'bg-[#0F2944] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F2944]'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F2944]">{user?.full_name || 'Adv. Amit Sharma'}</p>
              <p className="text-xs text-gray-500">{user?.firm_name || 'Sharma & Associates'}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0F2944] mb-2">Welcome back, {user?.full_name || 'Advocate'}</h1>
              <p className="text-gray-500">Here's your work summary for today</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-green-600 text-sm font-medium">+5 today</span>
                </div>
                <p className="text-3xl font-bold text-[#0F2944]">{lawyerStats.tasksCompleted}</p>
                <p className="text-gray-500 text-sm">Tasks Completed</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-amber-600 text-sm font-medium">2 urgent</span>
                </div>
                <p className="text-3xl font-bold text-[#0F2944]">{lawyerStats.tasksPending}</p>
                <p className="text-gray-500 text-sm">Tasks Pending</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0F2944]">{lawyerStats.casesActive}</p>
                <p className="text-gray-500 text-sm">Active Cases</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0F2944]">{lawyerStats.monthlyTarget}%</p>
                <p className="text-gray-500 text-sm">Monthly Target</p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Tasks */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#0F2944]">Pending Tasks</h2>
                  <Button variant="ghost" className="text-gray-500 hover:text-[#0F2944]">View All</Button>
                </div>
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                        <div>
                          <p className="font-medium text-[#0F2944]">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.case}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${task.deadline === 'Today' ? 'text-red-600' :
                          task.deadline === 'Tomorrow' ? 'text-amber-600' : 'text-gray-500'
                          }`}>{task.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Hearings */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0F2944] mb-6">Upcoming Hearings</h2>
                <div className="space-y-4">
                  {upcomingHearings.map((hearing, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-600 font-semibold text-sm">{hearing.date}</span>
                        <span className="text-gray-500 text-xs">{hearing.time}</span>
                      </div>
                      <p className="font-medium text-[#0F2944] text-sm">{hearing.case}</p>
                      <p className="text-xs text-gray-500">📍 {hearing.court}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F2944] mb-6">Performance Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-[#0F2944]">{metric.value}</p>
                    <p className="text-gray-500 text-sm">{metric.label}</p>
                    <p className="text-green-600 text-xs mt-1">{metric.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">My Tasks</h1>
            <div className="space-y-4">
              {pendingTasks.map(task => (
                <div key={task.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" className="w-5 h-5 rounded border-zinc-700" />
                    <div>
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-sm text-zinc-500">{task.case} • Due: {task.deadline}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                    }`}>{task.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">My Cases</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentCases.map(caseItem => (
                <div key={caseItem.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{caseItem.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${caseItem.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{caseItem.status}</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-4">{caseItem.type} Law</p>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${caseItem.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">{caseItem.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
              <p className="text-zinc-400">Your schedule and upcoming events</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Today's Schedule</h2>
                  <div className="space-y-3">
                    {calendarEvents
                      .filter(event => event.date === '2026-01-22')
                      .map(event => (
                        <div key={event.id} className={`p-4 rounded-xl border-l-4 ${event.color === 'red' ? 'bg-red-500/10 border-red-500' :
                          event.color === 'blue' ? 'bg-blue-500/10 border-blue-500' :
                            'bg-green-500/10 border-green-500'
                          }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${event.color === 'red' ? 'text-red-400' :
                                  event.color === 'blue' ? 'text-blue-400' :
                                    'text-green-400'
                                  }`}>{event.time}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${event.type === 'hearing' ? 'bg-red-500/20 text-red-300' :
                                  event.type === 'meeting' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-green-500/20 text-green-300'
                                  }`}>{event.type}</span>
                              </div>
                              <p className="font-medium text-white mb-1">{event.title}</p>
                              <p className="text-sm text-zinc-500">📍 {event.location}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Upcoming This Week</h2>
                  <div className="space-y-3">
                    {calendarEvents
                      .filter(event => event.date !== '2026-01-22')
                      .map(event => (
                        <div key={event.id} className="p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-400 font-semibold text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="text-zinc-500 text-xs">{event.time}</span>
                          </div>
                          <p className="font-medium text-white text-sm mb-1">{event.title}</p>
                          <p className="text-xs text-zinc-500">{event.location}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Mini Calendar & Stats */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">January 2026</h3>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-center text-xs text-zinc-500 font-semibold">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const hasEvent = calendarEvents.some(e => parseInt(e.date.split('-')[2]) === day);
                      const isToday = day === 22;
                      return (
                        <div key={i} className={`text-center p-2 text-sm rounded-lg ${isToday ? 'bg-purple-600 text-white font-bold' :
                          hasEvent ? 'bg-blue-500/20 text-blue-400' :
                            'text-zinc-400 hover:bg-zinc-800'
                          }`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">This Week</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Total Events</span>
                      <span className="text-white font-bold">{calendarEvents.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Court Hearings</span>
                      <span className="text-red-400 font-bold">{calendarEvents.filter(e => e.type === 'hearing').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Meetings</span>
                      <span className="text-blue-400 font-bold">{calendarEvents.filter(e => e.type === 'meeting').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Tasks</span>
                      <span className="text-green-400 font-bold">{calendarEvents.filter(e => e.type === 'task').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
              <p className="text-zinc-400">Your conversations and notifications</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="divide-y divide-zinc-800">
                {messages.map(msg => (
                  <div key={msg.id} className={`p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer ${msg.unread ? 'bg-purple-500/5' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${msg.unread ? 'bg-purple-600' : 'bg-zinc-700'
                        }`}>
                        {msg.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{msg.sender}</h3>
                            {msg.unread && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-zinc-500 mb-1">{msg.role}</p>
                        <p className={`text-sm ${msg.unread ? 'text-white font-medium' : 'text-zinc-400'} line-clamp-2`}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
              <p className="text-zinc-400">Your detailed performance metrics and insights</p>
            </div>

            {/* Monthly Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6">
                <p className="text-purple-200 text-sm mb-2">Cases Handled</p>
                <p className="text-4xl font-bold text-white mb-1">{monthlyPerformance.casesHandled}</p>
                <p className="text-purple-200 text-xs">This month</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
                <p className="text-green-200 text-sm mb-2">Cases Won</p>
                <p className="text-4xl font-bold text-white mb-1">{monthlyPerformance.casesWon}</p>
                <p className="text-green-200 text-xs">92% Success Rate</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
                <p className="text-blue-200 text-sm mb-2">Hours Worked</p>
                <p className="text-4xl font-bold text-white mb-1">{monthlyPerformance.hoursWorked}</p>
                <p className="text-blue-200 text-xs">This month</p>
              </div>
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6">
                <p className="text-amber-200 text-sm mb-2">Revenue Generated</p>
                <p className="text-4xl font-bold text-white mb-1">{monthlyPerformance.revenue}</p>
                <p className="text-amber-200 text-xs">This month</p>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-6">6-Month Performance Trend</h2>
              <div className="flex items-end justify-between gap-4 h-64">
                {performanceChart.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1">
                      <div
                        className="flex-1 bg-purple-600 rounded-t transition-all hover:bg-purple-500"
                        style={{ height: `${(data.cases / 15) * 200}px` }}
                        title={`${data.cases} cases`}
                      ></div>
                      <div
                        className="flex-1 bg-green-600 rounded-t transition-all hover:bg-green-500"
                        style={{ height: `${(data.wins / 15) * 200}px` }}
                        title={`${data.wins} wins`}
                      ></div>
                    </div>
                    <span className="text-zinc-400 text-sm font-medium">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span className="text-zinc-400 text-sm">Cases Handled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span className="text-zinc-400 text-sm">Cases Won</span>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div>
                        <p className="text-zinc-400 text-sm">{metric.label}</p>
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                      </div>
                      <span className="text-green-400 font-semibold">{metric.trend}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Monthly Breakdown</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">Cases Ongoing</span>
                      <span className="text-white font-bold">{monthlyPerformance.casesOngoing}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">Clients Met</span>
                      <span className="text-white font-bold">{monthlyPerformance.clientsMet}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">Target Achievement</span>
                      <span className="text-white font-bold">{monthlyPerformance.targetAchievement}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${monthlyPerformance.targetAchievement}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
