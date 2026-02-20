import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building2, LogOut, LayoutDashboard, Users, Calendar, FileText, TrendingUp, MessageSquare, Settings, Search, MoreVertical, Clock, CheckCircle, AlertCircle, Phone, Video, Mail, MapPin, Briefcase, Scale, Shield, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export default function LawFirmDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dummy Data
  const [dashboardData, setDashboardData] = useState(null);

  // Derived Data from Dashboard API (or defaults)
  const firmStats = {
    totalLawyers: dashboardData?.stats?.total_lawyers || 0,
    activeCases: dashboardData?.stats?.active_cases || 0,
    monthlyRevenue: dashboardData?.stats?.revenue ? `₹${dashboardData.stats.revenue.toLocaleString()}` : '₹0',
    clientSatisfaction: '94%', // Static for now
    pendingConsultations: dashboardData?.stats?.pending_approvals || 0,
    casesWon: 0 // Static for now
  };

  const firmLawyers = dashboardData?.top_lawyers?.map((l, i) => ({
    id: i,
    name: l.name,
    specialization: 'General', // Backend doesn't send this yet
    experience: 5, // Default
    activeCases: l.cases,
    status: 'active',
    photo: `https://ui-avatars.com/api/?name=${l.name}&background=random`
  })) || [];

  // Keep other dummy lists for now as backend doesn't provide them yet
  const firmCases = [];
  const upcomingHearings = [];
  const recentActivity = [];
  const clientMessages = [];
  const clientApplications = [];

  useEffect(() => {
    const fetchDashboardData = (token) => {
      axios.get(`${API}/dashboard/law-firm`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setDashboardData(res.data))
        .catch(err => console.error("Dashboard fetch error", err));
    };

    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/lawfirm-login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchDashboardData(token);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0F2944] rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold block text-[#0F2944]">Lxwyer Up</span>
              <span className="text-xs text-blue-600">LAW FIRM PORTAL</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="px-6 py-3">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">MENU</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'lawyers', icon: Users, label: 'Manage Lawyers' },
            { id: 'clients', icon: Shield, label: 'Client Applications', badge: 3 },
            { id: 'cases', icon: FileText, label: 'Cases' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'messages', icon: MessageSquare, label: 'Messages', badge: 2 },
            { id: 'reports', icon: TrendingUp, label: 'Reports' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              data-testid={`lawfirm-${item.id}-nav`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
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

        {/* Add Lawyer Button */}
        <div className="p-4">
          <Button className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-6 shadow-lg">
            <Plus className="w-5 h-5 mr-2" /> Add Lawyer
          </Button>
        </div>

        {/* Firm Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F2944]">{user?.firm_name || user?.full_name || 'Law Firm'}</p>
              <p className="text-xs text-blue-600">Premium Partner</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-green-600 flex items-center mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Monday, January 20, 2026
                </p>
                <h1 className="text-4xl font-bold text-[#0F2944]">
                  Welcome, <span className="text-blue-600">{user?.firm_name || 'Law Firm'}</span>
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input placeholder="Search..." className="pl-10 bg-white border-gray-200 rounded-xl w-64 text-gray-800" />
                </div>
                <Button className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl px-6 shadow-lg">
                  + New Case
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Lawyers', value: firmStats.totalLawyers, icon: Users, color: 'blue', subtext: '2 on leave' },
                { label: 'Active Cases', value: firmStats.activeCases, icon: FileText, color: 'purple', subtext: '+5 this month' },
                { label: 'Monthly Revenue', value: firmStats.monthlyRevenue, icon: TrendingUp, color: 'green', subtext: '+18% growth' },
                { label: 'Cases Won', value: firmStats.casesWon, icon: CheckCircle, color: 'amber', subtext: '78% win rate' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      stat.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        stat.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          'bg-gradient-to-br from-amber-400 to-amber-500'
                      }`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-[#0F2944]">{stat.value}</h3>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                      stat.color === 'green' ? 'text-green-600' :
                        'text-amber-600'
                    }`}>{stat.subtext}</p>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Hearings */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#0F2944]">Upcoming Hearings</h2>
                  <Button variant="ghost" className="text-gray-500 hover:text-[#0F2944]">View All</Button>
                </div>
                <div className="space-y-4">
                  {upcomingHearings.map((hearing, idx) => (
                    <div key={idx} className={`flex items-center space-x-4 p-4 rounded-xl ${idx === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-100'} hover:shadow-sm transition-all`}>
                      <div className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-center min-w-[60px]">
                        <p className="text-lg font-bold">{hearing.date.split(' ')[1]}</p>
                        <p className="text-xs">{hearing.date.split(' ')[0]}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0F2944]">{hearing.case}</p>
                        <p className="text-sm text-gray-500">📍 {hearing.court}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">{hearing.time}</p>
                        <p className="text-xs text-blue-600">{hearing.lawyer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0F2944] mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Top Performing Lawyers */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Top Performing Lawyers</h2>
                <div className="space-y-3">
                  {firmLawyers.slice(0, 4).map((lawyer, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                      <img src={lawyer.photo} alt={lawyer.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#0F2944] text-sm">{lawyer.name}</p>
                        <p className="text-xs text-gray-500">{lawyer.specialization}</p>
                      </div>
                      <div className="text-sm font-semibold text-[#0F2944]">
                        {lawyer.activeCases} cases
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Messages */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0F2944] mb-4">Client Messages</h2>
                <div className="space-y-3">
                  {clientMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                      <div className={`w-10 h-10 ${msg.color} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold">{msg.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F2944] text-sm">{msg.name}</p>
                        <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">{msg.time}</span>
                        {msg.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lawyers Tab */}
        {activeTab === 'lawyers' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Our Lawyers</h1>
                <p className="text-slate-400">Manage your firm's legal team</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl px-6 shadow-lg shadow-blue-500/50">
                <Plus className="w-4 h-4 mr-2" /> Add Lawyer
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass rounded-2xl border border-blue-500/20 p-6">
                <p className="text-xs text-slate-400 uppercase mb-2">Total Lawyers</p>
                <h3 className="text-3xl font-bold text-white">{firmLawyers.length}</h3>
              </div>
              <div className="glass rounded-2xl border border-green-500/20 p-6">
                <p className="text-xs text-slate-400 uppercase mb-2">Active</p>
                <h3 className="text-3xl font-bold text-white">{firmLawyers.filter(l => l.status === 'active').length}</h3>
              </div>
              <div className="glass rounded-2xl border border-amber-500/20 p-6">
                <p className="text-xs text-slate-400 uppercase mb-2">On Leave</p>
                <h3 className="text-3xl font-bold text-white">{firmLawyers.filter(l => l.status === 'on_leave').length}</h3>
              </div>
              <div className="glass rounded-2xl border border-purple-500/20 p-6">
                <p className="text-xs text-slate-400 uppercase mb-2">Total Cases</p>
                <h3 className="text-3xl font-bold text-white">{firmLawyers.reduce((sum, l) => sum + l.activeCases, 0)}</h3>
              </div>
            </div>

            {/* Lawyers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {firmLawyers.map(lawyer => (
                <motion.div
                  key={lawyer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img src={lawyer.photo} alt={lawyer.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30" />
                      <div>
                        <h3 className="font-semibold text-white">{lawyer.name}</h3>
                        <p className="text-sm text-blue-400">{lawyer.specialization}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lawyer.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                      {lawyer.status === 'active' ? 'Active' : 'On Leave'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{lawyer.experience}</p>
                      <p className="text-xs text-slate-400">Years Exp</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{lawyer.activeCases}</p>
                      <p className="text-xs text-slate-400">Active Cases</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button size="sm" className="flex-1 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-lg">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Client Applications Tab */}
        {activeTab === 'clients' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Client Applications</h2>
              <p className="text-slate-400">Review and approve client applications to join your firm</p>
            </div>

            <div className="space-y-4">
              {clientApplications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:bg-slate-900/70 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={application.photo}
                        alt={application.full_name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-white">{application.full_name}</h3>
                        <p className="text-sm text-slate-400">{application.email}</p>
                        <p className="text-sm text-slate-400">{application.phone}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Pending Review
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Case Type</p>
                      <p className="text-white font-medium">{application.case_type}</p>
                    </div>
                    {application.company_name && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Company</p>
                        <p className="text-white font-medium">{application.company_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Applied On</p>
                      <p className="text-white font-medium">{new Date(application.applied_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Case Description</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{application.case_description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Assign Lawyer</p>
                      <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                        <option value="">Select Lawyer</option>
                        {firmLawyers.filter(l => l.status === 'active').map(lawyer => (
                          <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-lg py-3 font-semibold transition-colors"
                      onClick={() => {
                        toast.success(`Application approved! ${application.full_name} can now login.`);
                      }}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg py-3 font-semibold transition-colors border border-red-500/30"
                      onClick={() => {
                        toast.error(`Application rejected for ${application.full_name}`);
                      }}
                    >
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {clientApplications.length === 0 && (
              <div className="text-center py-16">
                <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Pending Applications</h3>
                <p className="text-slate-400">Client applications will appear here for review</p>
              </div>
            )}
          </div>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Case Management</h1>
                <p className="text-slate-400">Track all firm cases and their progress</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl px-6 shadow-lg shadow-blue-500/50">
                + New Case
              </Button>
            </div>

            {/* Cases Table */}
            <div className="glass rounded-2xl border border-blue-500/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Case</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Client</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Lawyer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Next Hearing</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {firmCases.map(caseItem => (
                    <tr key={caseItem.id} className="border-b border-slate-800/30 hover:bg-slate-900/30 transition-all">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{caseItem.title}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{caseItem.client}</td>
                      <td className="px-6 py-4 text-blue-400">{caseItem.lawyer}</td>
                      <td className="px-6 py-4 text-slate-400">{caseItem.type}</td>
                      <td className="px-6 py-4 text-slate-300">{caseItem.nextHearing}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${caseItem.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          caseItem.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                            caseItem.status === 'Won' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700/50 text-slate-400'
                          }`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${caseItem.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          caseItem.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                            caseItem.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700/50 text-slate-400'
                          }`}>
                          {caseItem.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Firm Calendar</h1>
                <p className="text-slate-400">All hearings and appointments across your firm</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl px-6">
                + Add Event
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Grid */}
              <div className="lg:col-span-2 glass rounded-2xl border border-blue-500/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">January 2026</h2>
                <div className="grid grid-cols-7 gap-2 text-center mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs text-slate-500 font-semibold py-2">{day}</div>
                  ))}
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const hasEvent = [20, 22, 25, 28].includes(day);
                    const isToday = day === 20;
                    return (
                      <div
                        key={day}
                        className={`py-3 text-sm rounded-lg cursor-pointer transition-all ${isToday ? 'bg-blue-600 text-white font-bold' :
                          hasEvent ? 'bg-blue-500/20 text-blue-400 font-semibold' :
                            'text-slate-400 hover:bg-slate-800'
                          }`}
                      >
                        {day}
                        {hasEvent && !isToday && <div className="w-1 h-1 bg-blue-400 rounded-full mx-auto mt-1"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="glass rounded-2xl border border-blue-500/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">This Week</h2>
                <div className="space-y-4">
                  {upcomingHearings.map((hearing, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-blue-400 font-semibold">{hearing.date} • {hearing.time}</span>
                      </div>
                      <p className="font-semibold text-white text-sm">{hearing.case}</p>
                      <p className="text-xs text-slate-400">{hearing.lawyer}</p>
                      <p className="text-xs text-slate-500">📍 {hearing.court}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">Messages</h1>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center">
                    <Shield className="w-3 h-3 mr-1" /> Encrypted
                  </span>
                </div>
                <p className="text-slate-400">Communication with clients and team</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <div className="glass rounded-2xl border border-blue-500/20 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800/50">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input placeholder="Search messages..." className="pl-10 bg-slate-900/50 border-slate-700 rounded-xl text-white" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {clientMessages.concat([
                    { name: 'Internal: Legal Team', message: 'Meeting tomorrow at 10 AM', time: '2 hr', unread: false, avatar: 'L', color: 'bg-indigo-500' },
                    { name: 'Rahul Kumar', message: 'Bail was granted, thank you!', time: '3 hr', unread: true, avatar: 'R', color: 'bg-red-500' }
                  ]).map((chat, idx) => (
                    <div key={idx} className={`flex items-center space-x-3 p-4 cursor-pointer transition-all ${idx === 0 ? 'bg-blue-500/10 border-l-4 border-blue-500' : 'hover:bg-slate-800/50 border-l-4 border-transparent'
                      }`}>
                      <div className={`w-12 h-12 ${chat.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold">{chat.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white truncate">{chat.name}</p>
                          <span className="text-xs text-slate-500">{chat.time}</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{chat.message}</p>
                      </div>
                      {chat.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 glass rounded-2xl border border-blue-500/20 flex flex-col">
                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Rajesh Sharma</p>
                      <p className="text-xs text-green-400">Online • Property Dispute Case</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700">
                      <Video className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-slate-500">Today</span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">R</span>
                    </div>
                    <div className="max-w-[70%]">
                      <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4">
                        <p className="text-white text-sm">When is my next hearing date? I need to prepare the documents.</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">10:30 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start justify-end">
                    <div className="max-w-[70%]">
                      <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4">
                        <p className="text-white text-sm">Your next hearing is on January 25th at Delhi High Court. I'll send you the document checklist shortly.</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-right">10:45 AM ✓✓</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700">
                      <span className="text-xl">📎</span>
                    </button>
                    <Input placeholder="Type your message..." className="flex-1 bg-slate-900/50 border-slate-700 rounded-full px-5 text-white" />
                    <Button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center">
                      <span className="text-xl">➤</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab - Now Reports */}
        {activeTab === 'reports' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Firm Reports</h1>
                <p className="text-slate-400">Comprehensive reports on lawyers, tasks, and performance</p>
              </div>
              <Button variant="outline" className="border-slate-700 text-slate-300">
                Download Report
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass rounded-2xl border border-blue-500/20 p-6">
                <p className="text-sm text-slate-400 mb-2">Total Lawyers</p>
                <h3 className="text-4xl font-bold text-white">{firmLawyers.length}</h3>
                <p className="text-sm text-green-400 mt-2">{firmLawyers.filter(l => l.status === 'active').length} active</p>
              </div>
              <div className="glass rounded-2xl border border-green-500/20 p-6">
                <p className="text-sm text-slate-400 mb-2">Tasks Completed</p>
                <h3 className="text-4xl font-bold text-white">156</h3>
                <p className="text-sm text-green-400 mt-2">+12 this week</p>
              </div>
              <div className="glass rounded-2xl border border-amber-500/20 p-6">
                <p className="text-sm text-slate-400 mb-2">Pending Tasks</p>
                <h3 className="text-4xl font-bold text-white">23</h3>
                <p className="text-sm text-amber-400 mt-2">5 urgent</p>
              </div>
              <div className="glass rounded-2xl border border-purple-500/20 p-6">
                <p className="text-sm text-slate-400 mb-2">Completion Rate</p>
                <h3 className="text-4xl font-bold text-white">87%</h3>
                <p className="text-sm text-green-400 mt-2">+5% vs last month</p>
              </div>
            </div>

            {/* Lawyer Performance Report */}
            <div className="glass rounded-2xl border border-blue-500/20 p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Lawyer Performance Report</h2>
              <table className="w-full">
                <thead className="border-b border-slate-800/50">
                  <tr>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Lawyer</th>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Specialization</th>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Tasks</th>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Completion</th>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Active Cases</th>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Active Cases</th>
                    <th className="text-left py-3 text-xs text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {firmLawyers.map((lawyer, idx) => (
                    <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-900/30">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <img src={lawyer.photo} alt="" className="w-10 h-10 rounded-full border-2 border-blue-500/30" />
                          <span className="text-white font-medium">{lawyer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-blue-400">{lawyer.specialization}</td>
                      <td className="py-4 text-slate-300">{15 + idx * 3} / {20 + idx * 3}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                              style={{ width: `${75 + idx * 3}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-400 text-sm">{75 + idx * 3}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-white font-semibold">{lawyer.activeCases}</td>
                      <td className="py-4">
                        <span className="text-white font-semibold">{lawyer.experience} yrs</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lawyer.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                          {lawyer.status === 'active' ? 'Active' : 'On Leave'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Revenue & Cases Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl border border-blue-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Revenue by Practice Area</h2>
                <div className="space-y-4">
                  {[
                    { area: 'Criminal Law', revenue: '₹12,50,000', percent: 25 },
                    { area: 'Corporate Law', revenue: '₹15,00,000', percent: 30 },
                    { area: 'Family Law', revenue: '₹8,00,000', percent: 16 },
                    { area: 'Property Law', revenue: '₹10,50,000', percent: 21 },
                    { area: 'Tax Law', revenue: '₹4,00,000', percent: 8 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.area}</span>
                        <span className="text-slate-400">{item.revenue}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percent}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-blue-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Case Status Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-white">156</h3>
                    <p className="text-sm text-green-400">Cases Won</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-white">48</h3>
                    <p className="text-sm text-blue-400">Active Cases</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-white">12</h3>
                    <p className="text-sm text-amber-400">Pending Review</p>
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 text-center">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-3xl font-bold text-white">216</h3>
                    <p className="text-sm text-slate-400">Total Cases</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Firm Settings</h1>
                <p className="text-slate-400">Manage your firm profile and preferences</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <div className="glass rounded-2xl border border-blue-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Firm Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Firm Name</label>
                    <Input defaultValue={user?.firm_name || user?.full_name || 'Sharma & Associates'} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Contact Email</label>
                    <Input defaultValue={user?.email || 'contact@sharmaassociates.com'} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Phone</label>
                    <Input defaultValue="+91 98765 43210" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Address</label>
                    <Input defaultValue="123 Legal Complex, Connaught Place, New Delhi - 110001" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>
                <Button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white">Save Changes</Button>
              </div>

              <div className="glass rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Subscription</h2>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-500/30">
                  <div>
                    <p className="font-semibold text-white">Premium Partner Plan</p>
                    <p className="text-sm text-slate-400">₹25,000/month • Unlimited lawyers</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
