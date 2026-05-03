import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Building2, LogOut, LayoutDashboard, Users, FileText, TrendingUp,
  MessageSquare, Settings, Shield, Plus, Eye, Edit, Trash2, Menu, X,
  CheckCircle, AlertCircle, Clock, Briefcase, Star, Phone, Mail,
  ChevronRight, ArrowUpRight, UserCheck, UserX, Search, BarChart3,
  Calendar, Bell, Download, RefreshCw, Filter, Award, ListTodo, Folder, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

const cls = 'bg-white/5 dark:bg-white/5';
const cardBase = 'bg-slate-900 border border-slate-800 rounded-2xl p-6';
const labelCls = 'block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider';
const inputCls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 rounded-xl';
const btnPrimary = 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl font-semibold shadow-lg shadow-teal-900/30';
const btnGhost = 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl';

function StatCard({ label, value, icon: Icon, color = 'teal', sub }) {
  const colors = { teal: 'from-teal-600/20 to-teal-500/10 border-teal-800 text-teal-400', blue: 'from-blue-600/20 to-blue-500/10 border-blue-800 text-blue-400', amber: 'from-amber-600/20 to-amber-500/10 border-amber-800 text-amber-400', rose: 'from-rose-600/20 to-rose-500/10 border-rose-800 text-rose-400', indigo: 'from-indigo-600/20 to-indigo-500/10 border-indigo-800 text-indigo-400' };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6" />
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Badge({ status }) {
  const map = { active: 'bg-teal-900/60 text-teal-300 border-teal-700', inactive: 'bg-slate-800 text-slate-400 border-slate-700', pending: 'bg-amber-900/60 text-amber-300 border-amber-700', approved: 'bg-teal-900/60 text-teal-300 border-teal-700', rejected: 'bg-rose-900/60 text-rose-300 border-rose-700', completed: 'bg-blue-900/60 text-blue-300 border-blue-700' };
  return <span className={`px-2.5 py-0.5 text-xs font-semibold border rounded-full ${map[status] || map.pending}`}>{status}</span>;
}

export default function LawFirmDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientApps, setClientApps] = useState([]);
  const [report, setReport] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Modals
  const [showAddLawyer, setShowAddLawyer] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showClientDetail, setShowClientDetail] = useState(null);
  const [appFilter, setAppFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lawyerApps, setLawyerApps] = useState([]);
  const [showLawyerAppDetail, setShowLawyerAppDetail] = useState(null);
  const [showPriorityCases, setShowPriorityCases] = useState(false);

  // Forms
  const [newLawyer, setNewLawyer] = useState({ full_name: '', email: '', phone: '', password: '', specialization: '', experience_years: 1, bar_council_number: '', languages: ['Hindi', 'English'] });
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  const getFirmId = (u) => u?.unique_id || u?.id || u?._id || '';

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const stored = sessionStorage.getItem('user');
    if (!token || !stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchAll(getFirmId(u));
  }, [navigate]);

  const fetchAll = async (firmId) => {
    if (!firmId) return;
    setLoading(true);
    const [lRes, cRes, aRes, rRes, laRes] = await Promise.allSettled([
      axios.get(`${API}/firm-lawyers/by-firm/${firmId}`),
      axios.get(`${API}/firm-clients/firm/${firmId}/list`),
      axios.get(`${API}/firm-clients/applications/firm/${firmId}`),
      axios.get(`${API}/firm-lawyers/reports/firm/${firmId}`),
      axios.get(`${API}/firm-lawyers/applications/by-firm/${firmId}`)
    ]);
    if (lRes.status === 'fulfilled') setLawyers(lRes.value.data || []);
    if (cRes.status === 'fulfilled') setClients(cRes.value.data || []);
    if (aRes.status === 'fulfilled') setClientApps(aRes.value.data || []);
    if (rRes.status === 'fulfilled') setReport(rRes.value.data);
    if (laRes.status === 'fulfilled') setLawyerApps(laRes.value.data || []);
    setLoading(false);
  };

  const refetch = () => fetchAll(getFirmId(user));

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const approveApp = async (appId) => {
    try {
      await axios.put(`${API}/firm-clients/applications/${appId}/status`, { status: 'approved', reviewed_by: user?.contact_email || user?.email });
      toast.success('Client application approved!');
      refetch();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to approve'); }
  };

  const rejectApp = async (appId) => {
    try {
      await axios.put(`${API}/firm-clients/applications/${appId}/status`, { status: 'rejected', reviewed_by: user?.contact_email || user?.email, rejection_reason: 'Does not meet criteria' });
      toast.success('Application rejected');
      refetch();
    } catch (e) { toast.error('Failed to reject'); }
  };

  const assignLawyer = async (clientId, lawyerId, lawyerName) => {
    try {
      await axios.put(`${API}/firm-clients/${clientId}/assign-lawyer`, { lawyer_id: lawyerId, lawyer_name: lawyerName });
      toast.success(`${lawyerName} assigned successfully!`);
      setShowAssign(null);
      refetch();
    } catch (e) { toast.error('Failed to assign lawyer'); }
  };

  const handleAddLawyer = async () => {
    if (!newLawyer.full_name || !newLawyer.email || !newLawyer.password || !newLawyer.specialization) {
      toast.error('Please fill all required fields'); return;
    }
    const firmId = getFirmId(user);
    try {
      await axios.post(`${API}/firm-lawyers?firm_id=${firmId}&firm_name=${encodeURIComponent(user?.firm_name || '')}`, newLawyer);
      toast.success('Lawyer added successfully!');
      setShowAddLawyer(false);
      setNewLawyer({ full_name: '', email: '', phone: '', password: '', specialization: '', experience_years: 1, bar_council_number: '', languages: ['Hindi', 'English'] });
      refetch();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to add lawyer'); }
  };

  const toggleLawyerStatus = async (lawyerId, isActive) => {
    try {
      await axios.put(`${API}/firm-lawyers/${lawyerId}/status?is_active=${!isActive}`);
      toast.success(`Lawyer ${isActive ? 'deactivated' : 'activated'}`);
      refetch();
    } catch (e) { toast.error('Failed to update status'); }
  };


  const approveLawyerApp = async (appId) => {
    try {
      await axios.put(`${API}/firm-lawyers/applications/${appId}/status?status=approved`);
      toast.success('Lawyer approved! Account created.');
      refetch();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to approve'); }
  };

  const rejectLawyerApp = async (appId) => {
    try {
      await axios.put(`${API}/firm-lawyers/applications/${appId}/status?status=rejected`);
      toast.success('Application rejected');
      refetch();
    } catch (e) { toast.error('Failed to reject'); }
  };

  const deleteLawyer = async (lawyerId) => {
    if (!window.confirm('Delete this lawyer?')) return;
    try {
      await axios.delete(`${API}/firm-lawyers/${lawyerId}`);
      toast.success('Lawyer removed');
      refetch();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const createTask = async (lawyerId) => {
    if (!newTask.title) { toast.error('Task title required'); return; }
    try {
      await axios.post(`${API}/firm-lawyers/tasks?assigned_by=${user?.contact_email || user?.email}`, { ...newTask, assigned_to: lawyerId });
      toast.success('Task created!');
      setShowAddTask(null);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      refetch();
    } catch (e) { toast.error('Failed to create task'); }
  };

  const pendingApps = clientApps.filter(a => a.status === 'pending');
  const filteredApps = appFilter === 'all' ? clientApps : clientApps.filter(a => a.status === appFilter);
  const filteredLawyers = lawyers.filter(l => l.full_name?.toLowerCase().includes(search.toLowerCase()) || l.specialization?.toLowerCase().includes(search.toLowerCase()));
  const filteredClients = clients.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.case_type?.toLowerCase().includes(search.toLowerCase()));

  const nav = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'lawyers', icon: Users, label: 'Lawyers', badge: lawyers.length },
    { id: 'clients', icon: Shield, label: 'Clients', badge: pendingApps.length || null },
    { id: 'cases', icon: FileText, label: 'Cases' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { id: 'documents', icon: Folder, label: 'Documents' },
    { id: 'reports', icon: TrendingUp, label: 'Reports' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (!user) return null;

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden" style={{ height: '100dvh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:z-auto shrink-0`}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">LxwyerUp</span>
            <span className="text-xs text-teal-400 font-semibold">FIRM PORTAL</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearch(''); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id ? 'bg-gradient-to-r from-teal-600/30 to-teal-500/10 text-teal-300 border border-teal-700/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge ? <span className="ml-auto bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <button onClick={() => { setShowAddLawyer(true); setSidebarOpen(false); }}
          className="mx-4 mb-4 flex items-center gap-2 justify-center py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-900/30">
          <Plus className="w-4 h-4" /> Add Lawyer
        </button>

        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-400 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.firm_name || user?.full_name || 'My Firm'}</p>
            <p className="text-xs text-teal-400">Premium Partner</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 sm:px-6 gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white p-2 -ml-2">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white capitalize">{nav.find(n => n.id === activeTab)?.label || 'Dashboard'}</h1>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={refetch} className="p-2 text-slate-400 hover:text-teal-400 transition-colors"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            <div className="w-8 h-8 bg-teal-600/20 border border-teal-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto dashboard-scroll custom-scrollbar p-4 sm:p-6">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Welcome back, <span className="text-teal-400">{user?.firm_name || 'Firm'}</span></h2>
                  <p className="text-slate-400 text-sm mt-1">Here's what's happening at your firm today.</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Lawyers" value={report?.total_lawyers ?? lawyers.length} icon={Users} color="teal" />
                  <StatCard label="Active Clients" value={clients.filter(c => c.status === 'active').length} icon={Shield} color="blue" />
                  <StatCard label="Pending Applications" value={pendingApps.length} icon={Clock} color="amber" sub="clients" />
                  <StatCard label="Task Completion" value={`${report?.completion_rate ?? 0}%`} icon={CheckCircle} color="indigo" />
                </div>

                {/* Recent Client Applications */}
                {pendingApps.length > 0 && (
                  <div className={cardBase}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-400" />Pending Applications</h3>
                      <button onClick={() => setActiveTab('clients')} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-3">
                      {pendingApps.slice(0, 3).map(app => (
                        <div key={app.id} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl">
                          <div className="w-9 h-9 bg-teal-600/20 border border-teal-700 rounded-lg flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-teal-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{app.full_name}</p>
                            <p className="text-xs text-slate-400">{app.case_type} · {app.email}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => approveApp(app.id)} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all">Approve</button>
                            <button onClick={() => rejectApp(app.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lawyer Performance */}
                {report?.lawyer_stats?.length > 0 && (
                  <div className={cardBase}>
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-teal-400" />Lawyer Performance</h3>
                    <div className="space-y-3">
                      {report.lawyer_stats.slice(0, 5).map((l, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-600/30 to-teal-400/10 border border-teal-700/50 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-teal-300">#{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{l.name}</p>
                            <p className="text-xs text-slate-400">{l.specialization} · {l.total_tasks} tasks</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-teal-400">{l.completion_rate}%</p>
                            <div className="flex items-center gap-1 text-xs text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />{l.rating}
                            </div>
                          </div>
                          <div className="w-20 bg-slate-700 rounded-full h-1.5 shrink-0">
                            <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${l.completion_rate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Cases & Developments */}
                {clients.length > 0 && (
                  <div className={cardBase}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-400" />Recent Cases & Developments</h3>
                      <button onClick={() => setActiveTab('cases')} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">All Cases <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-3">
                      {clients.slice(0, 4).map((c, i) => (
                        <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{c.full_name} <span className="text-slate-400 font-normal">({c.case_type})</span></p>
                            <p className="text-xs text-indigo-300 mt-1 font-medium bg-indigo-900/30 inline-block px-2 py-0.5 rounded">
                              {i % 3 === 0 ? 'Hearing scheduled for tomorrow' : i % 3 === 1 ? 'New document uploaded by client' : 'Awaiting court response'}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 shrink-0">{i === 0 ? '1h ago' : i === 1 ? '3h ago' : '1d ago'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loading && lawyers.length === 0 && clients.length === 0 && (
                  <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Your firm is ready!</h3>
                    <p className="text-slate-500 mb-6">Start by adding lawyers to your team or approving client applications.</p>
                    <button onClick={() => setShowAddLawyer(true)} className={`${btnPrimary} px-6 py-2.5 text-sm`}>Add First Lawyer</button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── LAWYERS TAB ── */}
            {activeTab === 'lawyers' && (
              <motion.div key="lawyers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Lawyer Team <span className="text-slate-500 text-sm font-normal">({lawyers.length})</span></h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lawyers..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500" />
                    </div>
                    <button onClick={() => setShowAddLawyer(true)} className={`${btnPrimary} px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap`}>
                      <Plus className="w-4 h-4" />Add
                    </button>
                  </div>
                </div>

                
                {/* Pending Lawyer Applications */}
                {lawyerApps.filter(a => a.status === 'pending').length > 0 && (
                  <div className={cardBase}>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='font-bold text-white flex items-center gap-2'>
                        <AlertCircle className='w-5 h-5 text-amber-400' />
                        Pending Lawyer Applications
                        <span className='bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full'>{lawyerApps.filter(a => a.status === 'pending').length}</span>
                      </h3>
                    </div>
                    <div className='space-y-4'>
                      {lawyerApps.filter(a => a.status === 'pending').map(app => (
                        <div key={app.id} className='bg-slate-800/60 rounded-xl border border-amber-700/30 p-4'>
                          <div className='flex flex-col sm:flex-row sm:items-start gap-3 mb-3'>
                            <div className='w-11 h-11 bg-gradient-to-br from-amber-600/30 to-amber-400/10 border border-amber-700/50 rounded-xl flex items-center justify-center shrink-0'>
                              <span className='text-amber-300 font-bold text-base'>{app.full_name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='font-bold text-white'>{app.full_name}</p>
                              <p className='text-xs text-slate-400'>{app.email} · {app.phone}</p>
                              <p className='text-xs text-teal-400 mt-1'>{app.specialization} · {app.experience_years} yr exp</p>
                            </div>
                            <div className='flex gap-2 shrink-0'>
                              <button onClick={() => setShowLawyerAppDetail(app)} className='px-3 py-1.5 text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-600 transition-all'>View Details</button>
                              <button onClick={() => approveLawyerApp(app.id)} className='px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-all flex items-center gap-1'><UserCheck className='w-3 h-3' />Approve</button>
                              <button onClick={() => rejectLawyerApp(app.id)} className='px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 hover:border-rose-600 rounded-lg transition-all flex items-center gap-1'><UserX className='w-3 h-3' />Reject</button>
                            </div>
                          </div>
                          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
                            {[['Education', app.education],['Bar Council', app.bar_council_number || 'Provided'],['Languages', app.languages?.join(', ') || 'Hindi, English'],['State', app.state || 'N/A']].map(([l,v]) => (
                              <div key={l} className='bg-slate-800 rounded-lg p-2'>
                                <p className='text-slate-500'>{l}</p>
                                <p className='text-slate-200 font-semibold truncate'>{v || '-'}</p>
                              </div>
                            ))}
                          </div>
                          <div className='mt-2 flex gap-2 text-xs'>
                            {app.bar_council_photo && <span className='px-2 py-0.5 bg-teal-900/40 text-teal-300 border border-teal-700/40 rounded'>✓ Bar Council</span>}
                            {app.aadhar_card_front && <span className='px-2 py-0.5 bg-teal-900/40 text-teal-300 border border-teal-700/40 rounded'>✓ Aadhaar</span>}
                            {app.pan_card && <span className='px-2 py-0.5 bg-teal-900/40 text-teal-300 border border-teal-700/40 rounded'>✓ PAN</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {lawyerApps.filter(a => a.status !== 'pending').length > 0 && (
                  <div className={cardBase}>
                    <h3 className='font-bold text-white mb-3 text-sm'>All Lawyer Applications</h3>
                    <div className='overflow-x-auto'>
                      <table className='w-full text-xs'>
                        <thead><tr className='text-slate-500 border-b border-slate-800'>
                          <th className='pb-2 text-left'>Name</th><th className='pb-2 text-left'>Specialization</th><th className='pb-2 text-left'>Exp</th><th className='pb-2 text-left'>Status</th>
                        </tr></thead>
                        <tbody className='divide-y divide-slate-800/50'>
                          {lawyerApps.filter(a => a.status !== 'pending').map(app => (
                            <tr key={app.id} className='hover:bg-slate-800/30'>
                              <td className='py-2 pr-3 font-semibold text-white'>{app.full_name}</td>
                              <td className='py-2 pr-3 text-slate-400'>{app.specialization}</td>
                              <td className='py-2 pr-3 text-slate-400'>{app.experience_years}yr</td>
                              <td className='py-2'><Badge status={app.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

{loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : filteredLawyers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">No lawyers found</p>
                    <button onClick={() => setShowAddLawyer(true)} className={`${btnPrimary} px-5 py-2 text-sm mt-4`}>Add Lawyer</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredLawyers.map(l => (
                      <div key={l.id} className="bg-slate-900 border border-slate-800 hover:border-teal-700/50 rounded-2xl p-5 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-teal-600/30 to-teal-400/10 border border-teal-700/50 rounded-xl flex items-center justify-center">
                              <span className="text-teal-300 font-bold text-sm">{l.full_name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{l.full_name}</p>
                              <p className="text-xs text-slate-400">{l.specialization || 'General'}</p>
                            </div>
                          </div>
                          <Badge status={l.is_active !== false ? 'active' : 'inactive'} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                            <p className="text-lg font-bold text-white">{l.cases_assigned || 0}</p>
                            <p className="text-xs text-slate-400">Cases</p>
                          </div>
                          <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                            <p className="text-lg font-bold text-white">{l.tasks_completed || 0}</p>
                            <p className="text-xs text-slate-400">Tasks Done</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddTask(l)} className="flex-1 py-1.5 text-xs font-semibold bg-teal-600/20 text-teal-300 border border-teal-700/50 rounded-lg hover:bg-teal-600/40 transition-all">+ Task</button>
                          <button onClick={() => toggleLawyerStatus(l.id, l.is_active !== false)} className="flex-1 py-1.5 text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all">
                            {l.is_active !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => deleteLawyer(l.id)} className="py-1.5 px-2.5 text-xs text-rose-400 border border-rose-900/40 bg-rose-900/10 rounded-lg hover:bg-rose-900/30 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {l.bar_council_number && <p className="mt-2 text-xs text-slate-500">BC: {l.bar_council_number}</p>}
                        {l.email && <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" />{l.email}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── CLIENTS TAB ── */}
            {activeTab === 'clients' && (
              <motion.div key="clients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Clients & Applications</h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500" />
                  </div>
                </div>

                {/* Applications section */}
                {clientApps.length > 0 && (
                  <div className={cardBase}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />Applications</h3>
                      <div className="flex gap-1">
                        {['all', 'pending', 'approved', 'rejected'].map(f => (
                          <button key={f} onClick={() => setAppFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${appFilter === f ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-slate-500 text-xs border-b border-slate-800">
                          <th className="pb-3 text-left font-semibold">Client</th>
                          <th className="pb-3 text-left font-semibold">Case Type</th>
                          <th className="pb-3 text-left font-semibold">Status</th>
                          <th className="pb-3 text-left font-semibold">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {filteredApps.map(app => (
                            <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 pr-4">
                                <p className="font-semibold text-white">{app.full_name}</p>
                                <p className="text-xs text-slate-400">{app.email}</p>
                              </td>
                              <td className="py-3 pr-4"><span className="text-slate-300">{app.case_type}</span></td>
                              <td className="py-3 pr-4"><Badge status={app.status} /></td>
                              <td className="py-3">
                                {app.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <button onClick={() => approveApp(app.id)} className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"><UserCheck className="w-3 h-3" />Approve</button>
                                    <button onClick={() => rejectApp(app.id)} className="px-3 py-1 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"><UserX className="w-3 h-3" />Reject</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Active Clients */}
                <div className={cardBase}>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-400" />Active Clients ({clients.length})</h3>
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No clients yet</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredClients.map(c => (
                        <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-teal-700/30 transition-all">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600/30 to-blue-400/10 border border-blue-700/40 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-blue-300 font-bold text-sm">{c.full_name?.[0]?.toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white">{c.full_name}</p>
                            <p className="text-xs text-slate-400">{c.case_type} · {c.email}</p>
                            {c.assigned_lawyer_name && <p className="text-xs text-teal-400 mt-0.5">Assigned to: {c.assigned_lawyer_name}</p>}
                          </div>
                          <div className="flex gap-2 items-center shrink-0">
                            <Badge status={c.status} />
                            <button onClick={() => setShowAssign(c)} className="px-3 py-1.5 bg-teal-600/20 text-teal-300 border border-teal-700/50 text-xs font-semibold rounded-lg hover:bg-teal-600/40 transition-all">
                              {c.assigned_lawyer_id ? 'Reassign' : 'Assign Lawyer'}
                            </button>
                            <button onClick={() => setShowClientDetail(c)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── CASES TAB ── */}
            {activeTab === 'cases' && (
              <motion.div key="cases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Cases Overview</h2>
                  <button onClick={() => setShowPriorityCases(!showPriorityCases)} className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all flex items-center gap-2 ${showPriorityCases ? 'bg-amber-600/20 text-amber-400 border-amber-600/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}>
                    <Star className={`w-4 h-4 ${showPriorityCases ? 'fill-amber-400' : ''}`} /> {showPriorityCases ? 'Showing Priority Cases' : 'View Priority Cases'}
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard label="Active Cases" value={clients.filter(c => c.status === 'active').length} icon={FileText} color="teal" />
                  <StatCard label="Completed" value={clients.filter(c => c.status === 'completed').length} icon={CheckCircle} color="blue" />
                  <StatCard label="Unassigned" value={clients.filter(c => !c.assigned_lawyer_id).length} icon={AlertCircle} color="amber" />
                </div>
                <div className={cardBase}>
                  <h3 className="font-bold text-white mb-4">{showPriorityCases ? 'Priority Cases' : 'All Client Cases'}</h3>
                  {clients.length === 0 ? <p className="text-slate-500 text-center py-8">No cases yet</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-slate-500 text-xs border-b border-slate-800">
                          <th className="pb-3 text-left w-8"></th>
                          <th className="pb-3 text-left">Client</th>
                          <th className="pb-3 text-left">Case Type</th>
                          <th className="pb-3 text-left">Assigned Lawyer</th>
                          <th className="pb-3 text-left">Status</th>
                          <th className="pb-3 text-left">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {clients.filter(c => showPriorityCases ? c.is_priority : true).map(c => (
                            <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 pr-2 text-center">
                                <button className="text-slate-500 hover:text-amber-400 transition-colors" onClick={() => {
                                  // Toggle locally for demo
                                  const updated = clients.map(cl => cl.id === c.id ? { ...cl, is_priority: !cl.is_priority } : cl);
                                  setClients(updated);
                                }}>
                                  <Star className={`w-4 h-4 ${c.is_priority ? 'fill-amber-400 text-amber-400' : ''}`} />
                                </button>
                              </td>
                              <td className="py-3 pr-4"><p className="font-semibold text-white">{c.full_name}</p><p className="text-xs text-slate-400">{c.phone}</p></td>
                              <td className="py-3 pr-4 text-slate-300">{c.case_type}</td>
                              <td className="py-3 pr-4 text-slate-300">{c.assigned_lawyer_name || <span className="text-amber-400 text-xs">Unassigned</span>}</td>
                              <td className="py-3 pr-4"><Badge status={c.status} /></td>
                              <td className="py-3">
                                <button onClick={() => setShowAssign(c)} className="px-2.5 py-1 bg-teal-600/20 text-teal-300 border border-teal-700/40 text-xs rounded-lg hover:bg-teal-600/40 transition-all">Assign</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {showPriorityCases && clients.filter(c => c.is_priority).length === 0 && (
                        <p className="text-slate-500 text-center py-8">No priority cases found. Star a case to add it here.</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── TASKS TAB ── */}
            {activeTab === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Tasks Management</h2>
                  <button className={`${btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}><Plus className="w-4 h-4"/> New Task</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {['To Do', 'In Progress', 'In Review', 'Completed'].map(status => (
                    <div key={status} className="w-72 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col max-h-[70vh]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{status}</h3>
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">0</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        <div className="text-center py-8 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">No tasks here</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── CALENDAR TAB ── */}
            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Calendar & Schedule</h2>
                    <p className="text-sm text-slate-400">Manage hearings, deadlines, and meetings.</p>
                  </div>
                  <button className={`${btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}><Plus className="w-4 h-4"/> New Event</button>
                </div>
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
                  <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-800/30">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight className="w-4 h-4 rotate-180"/></button>
                      <span className="font-bold text-white flex items-center">Current Week</span>
                      <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight className="w-4 h-4"/></button>
                    </div>
                    <div className="flex gap-2">
                      <select className="bg-slate-800 border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                        <option>All Types</option>
                        <option>Hearings</option>
                        <option>Deadlines</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-5 divide-x divide-slate-800">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                      <div key={day} className="p-4 flex flex-col">
                        <p className="text-xs font-bold text-slate-500 uppercase text-center mb-4">{day}</p>
                        <div className="flex-1 border border-dashed border-slate-800/50 rounded-xl flex items-center justify-center">
                          <span className="text-slate-700 text-xs">No events</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DOCUMENTS TAB ── */}
            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Document Vault</h2>
                    <p className="text-sm text-slate-400">Manage all your legal documents and templates.</p>
                  </div>
                  <div className="flex gap-3">
                    <button className={`${btnGhost} px-4 py-2 text-sm flex items-center gap-2`}><Download className="w-4 h-4"/> Import</button>
                    <button className={`${btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}><Plus className="w-4 h-4"/> New Document</button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Sidebar filters */}
                  <div className="w-full md:w-64 shrink-0 space-y-1">
                    {['All Documents', 'Pleadings', 'Affidavits', 'Petitions', 'Client Records', 'Templates', 'Trash'].map((f, i) => (
                      <button key={f} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${i === 0 ? 'bg-teal-600/20 text-teal-300 border border-teal-700/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  {/* Main doc area */}
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <Folder className="w-16 h-16 text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No documents found</h3>
                    <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">Upload your first document or start with a template to get your library organized.</p>
                    <button className={`${btnPrimary} px-6 py-2.5 text-sm`}>Upload Document</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── REPORTS TAB ── */}
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="text-xl font-bold text-white">Firm Reports</h2>
                {!report ? <p className="text-slate-500">Loading report data...</p> : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard label="Total Lawyers" value={report.total_lawyers} icon={Users} color="teal" />
                      <StatCard label="Total Tasks" value={report.total_tasks} icon={FileText} color="blue" />
                      <StatCard label="Completed" value={report.completed_tasks} icon={CheckCircle} color="indigo" />
                      <StatCard label="Completion Rate" value={`${report.completion_rate}%`} icon={TrendingUp} color="amber" />
                    </div>
                    <div className={cardBase}>
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-teal-400" />Lawyer Performance</h3>
                      {report.lawyer_stats?.length === 0 ? <p className="text-slate-500 text-center py-4">No data yet</p> : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="text-slate-500 text-xs border-b border-slate-800">
                              <th className="pb-3 text-left">Lawyer</th>
                              <th className="pb-3 text-center">Tasks</th>
                              <th className="pb-3 text-center">Done</th>
                              <th className="pb-3 text-center">Rate</th>
                              <th className="pb-3 text-center">Rating</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {report.lawyer_stats?.map((l, i) => (
                                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="py-3 pr-4"><p className="font-semibold text-white">{l.name}</p><p className="text-xs text-slate-400">{l.specialization}</p></td>
                                  <td className="py-3 text-center text-slate-300">{l.total_tasks}</td>
                                  <td className="py-3 text-center text-teal-400 font-semibold">{l.completed_tasks}</td>
                                  <td className="py-3 text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                      <div className="w-16 bg-slate-700 rounded-full h-1.5"><div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${l.completion_rate}%` }} /></div>
                                      <span className="text-xs font-bold text-white">{l.completion_rate}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-center"><span className="text-amber-400 flex items-center gap-1 justify-center"><Star className="w-3 h-3 fill-amber-400" />{l.rating}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div className={cardBase}>
                      <h3 className="font-bold text-white mb-4">Task Breakdown</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/60 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-amber-400">{report.pending_tasks}</p><p className="text-xs text-slate-400 mt-1">Pending</p></div>
                        <div className="bg-slate-800/60 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-400">{report.in_progress_tasks}</p><p className="text-xs text-slate-400 mt-1">In Progress</p></div>
                        <div className="bg-slate-800/60 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-teal-400">{report.completed_tasks}</p><p className="text-xs text-slate-400 mt-1">Completed</p></div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── MESSAGES TAB ── */}
            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <h2 className="text-xl font-bold text-white">Messages</h2>
                <div className={`${cardBase} text-center py-16`}>
                  <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">Messaging System</p>
                  <p className="text-slate-500 text-sm mt-2">Messages between firm, lawyers, and clients appear here.</p>
                </div>
              </motion.div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="text-xl font-bold text-white">Firm Settings</h2>
                <div className={cardBase}>
                  <h3 className="font-bold text-white mb-5 flex items-center gap-2"><Building2 className="w-5 h-5 text-teal-400" />Firm Profile</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      ['Firm Name', user?.firm_name],
                      ['Registration Number', user?.registration_number],
                      ['Contact Email', user?.contact_email],
                      ['Contact Phone', user?.contact_phone],
                      ['State', user?.state],
                      ['City', user?.city],
                      ['Established', user?.established_year],
                      ['Plan', user?.subscription_plan || 'Professional'],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-slate-800/60 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        <p className="text-sm font-semibold text-white">{val || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {user?.practice_areas?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-2">Practice Areas</p>
                      <div className="flex flex-wrap gap-2">{user.practice_areas.map(a => <span key={a} className="px-2.5 py-1 bg-teal-600/20 text-teal-300 border border-teal-700/40 text-xs rounded-lg">{a}</span>)}</div>
                    </div>
                  )}
                </div>
                <div className={cardBase}>
                  <h3 className="font-bold text-white mb-5 flex items-center gap-2"><Shield className="w-5 h-5 text-amber-400" />Account Actions</h3>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-rose-900/30 hover:bg-rose-900/60 text-rose-400 border border-rose-800 rounded-xl text-sm font-semibold transition-all">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {/* Add Lawyer Modal */}
        {showAddLawyer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add New Lawyer</h3>
                <button onClick={() => setShowAddLawyer(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {[['Full Name *', 'full_name', 'text', 'e.g. Ramesh Kumar'],['Email *', 'email', 'email', 'lawyer@firm.com'],['Phone', 'phone', 'tel', '10-digit number'],['Password *', 'password', 'password', 'Min 6 chars'],['Bar Council No.', 'bar_council_number', 'text', 'Optional']].map(([label, field, type, ph]) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <Input type={type} value={newLawyer[field]} onChange={e => setNewLawyer(p => ({ ...p, [field]: e.target.value }))} placeholder={ph} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>Specialization *</label>
                  <select value={newLawyer.specialization} onChange={e => setNewLawyer(p => ({ ...p, specialization: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500">
                    <option value="">Select</option>
                    {['Criminal Law','Family Law','Corporate Law','Property Law','Civil Law','Tax Law','Labour Law','Intellectual Property','Banking Law','Environmental Law'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Experience (Years)</label>
                  <Input type="number" min="0" value={newLawyer.experience_years} onChange={e => setNewLawyer(p => ({ ...p, experience_years: parseInt(e.target.value) || 1 }))} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddLawyer(false)} className={`flex-1 py-2.5 text-sm font-semibold ${btnGhost}`}>Cancel</button>
                <button onClick={handleAddLawyer} className={`flex-1 py-2.5 text-sm font-semibold ${btnPrimary}`}>Add Lawyer</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Assign Lawyer Modal */}
        {showAssign && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Assign Lawyer to {showAssign.full_name}</h3>
                <button onClick={() => setShowAssign(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {lawyers.length === 0 ? <p className="text-slate-400 text-center py-6">No lawyers available. Add lawyers first.</p> : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lawyers.filter(l => l.is_active !== false).map(l => (
                    <button key={l.id} onClick={() => assignLawyer(showAssign.id, l.id, l.full_name)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${showAssign.assigned_lawyer_id === l.id ? 'bg-teal-600/20 border-teal-600 text-teal-300' : 'bg-slate-800 border-slate-700 hover:border-teal-700 text-white'}`}>
                      <div className="w-9 h-9 bg-teal-600/20 border border-teal-700/50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-teal-300 font-bold text-sm">{l.full_name?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{l.full_name}</p>
                        <p className="text-xs text-slate-400">{l.specialization || 'General'} · {l.cases_assigned || 0} cases</p>
                      </div>
                      {showAssign.assigned_lawyer_id === l.id && <CheckCircle className="w-4 h-4 text-teal-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Assign Task to {showAddTask.full_name}</h3>
                <button onClick={() => setShowAddTask(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Task Title *</label>
                  <Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Prepare case brief" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Details..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500">
                      {['low','medium','high','urgent'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddTask(null)} className={`flex-1 py-2.5 text-sm font-semibold ${btnGhost}`}>Cancel</button>
                <button onClick={() => createTask(showAddTask.id)} className={`flex-1 py-2.5 text-sm font-semibold ${btnPrimary}`}>Create Task</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Client Detail Modal */}
        {showClientDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Client Details</h3>
                <button onClick={() => setShowClientDetail(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {[['Full Name', showClientDetail.full_name],['Email', showClientDetail.email],['Phone', showClientDetail.phone],['Case Type', showClientDetail.case_type],['Assigned Lawyer', showClientDetail.assigned_lawyer_name || 'Unassigned'],['Status', showClientDetail.status],['Law Firm', showClientDetail.law_firm_name]].map(([label, val]) => (
                  <div key={label} className="flex gap-3 bg-slate-800/60 rounded-xl p-3">
                    <span className="text-slate-500 text-xs w-28 shrink-0 pt-0.5">{label}</span>
                    <span className="text-white text-sm font-semibold">{val || '—'}</span>
                  </div>
                ))}
                {showClientDetail.case_description && (
                  <div className="bg-slate-800/60 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Case Description</p>
                    <p className="text-sm text-white">{showClientDetail.case_description}</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setShowAssign(showClientDetail); setShowClientDetail(null); }} className={`w-full mt-4 py-2.5 text-sm font-semibold ${btnPrimary}`}>
                {showClientDetail.assigned_lawyer_id ? 'Reassign Lawyer' : 'Assign Lawyer'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Lawyer Application Detail Modal */}
        {showLawyerAppDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Application — {showLawyerAppDetail.full_name}</h3>
                <button onClick={() => setShowLawyerAppDetail(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {[
                  ['Full Name', showLawyerAppDetail.full_name],
                  ['Email', showLawyerAppDetail.email],
                  ['Phone', showLawyerAppDetail.phone],
                  ['Specialization', showLawyerAppDetail.specialization],
                  ['Experience', showLawyerAppDetail.experience_years ? showLawyerAppDetail.experience_years + ' years' : '-'],
                  ['Education', showLawyerAppDetail.education],
                  ['Bar Council No.', showLawyerAppDetail.bar_council_number || '-'],
                  ['Languages', showLawyerAppDetail.languages?.join(', ') || '-'],
                  ['State', showLawyerAppDetail.state || '-'],
                  ['Status', showLawyerAppDetail.status],
                  ['Applied On', showLawyerAppDetail.created_at ? new Date(showLawyerAppDetail.created_at).toLocaleDateString('en-IN') : '-'],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-3 bg-slate-800/60 rounded-xl p-3">
                    <span className="text-slate-500 text-xs w-32 shrink-0 pt-0.5">{label}</span>
                    <span className="text-white text-sm font-semibold capitalize">{val || '-'}</span>
                  </div>
                ))}
                {showLawyerAppDetail.bio && (
                  <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Bio</p><p className="text-sm text-white">{showLawyerAppDetail.bio}</p></div>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Documents Submitted</p>
                  <div className="flex flex-wrap gap-2">
                    {showLawyerAppDetail.bar_council_photo && <span className="px-2.5 py-1 bg-teal-900/40 text-teal-300 border border-teal-700/40 text-xs rounded-lg">✓ Bar Council</span>}
                    {showLawyerAppDetail.aadhar_card_front && <span className="px-2.5 py-1 bg-teal-900/40 text-teal-300 border border-teal-700/40 text-xs rounded-lg">✓ Aadhaar Front</span>}
                    {showLawyerAppDetail.aadhar_card_back && <span className="px-2.5 py-1 bg-teal-900/40 text-teal-300 border border-teal-700/40 text-xs rounded-lg">✓ Aadhaar Back</span>}
                    {showLawyerAppDetail.pan_card && <span className="px-2.5 py-1 bg-teal-900/40 text-teal-300 border border-teal-700/40 text-xs rounded-lg">✓ PAN Card</span>}
                    {!showLawyerAppDetail.bar_council_photo && !showLawyerAppDetail.aadhar_card_front && <span className="text-slate-500 text-xs">No documents attached</span>}
                  </div>
                </div>
              </div>
              {showLawyerAppDetail.status === 'pending' && (
                <div className="flex gap-3 mt-5">
                  <button onClick={() => { rejectLawyerApp(showLawyerAppDetail.id); setShowLawyerAppDetail(null); }} className="flex-1 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition-all">Reject</button>
                  <button onClick={() => { approveLawyerApp(showLawyerAppDetail.id); setShowLawyerAppDetail(null); }} className="flex-1 py-2.5 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-all">✓ Approve & Create Account</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
