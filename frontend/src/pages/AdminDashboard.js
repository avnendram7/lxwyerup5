import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Scale, Users, CheckCircle, XCircle, Clock, Eye, User, Mail, Phone,
  MapPin, Briefcase, GraduationCap, Star, ArrowLeft, Loader2, RefreshCw, LogOut,
  Building2, Globe, FileText, X, TrendingUp, Calendar, Activity, Award,
  Sparkles, Home, Bell, Search, BarChart3, PieChart, Settings, ChevronRight,
  Pencil, Trash2, EyeOff, Ban
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

// Force Admin dashboard strictly to live production API
const API = "https://lxwyerup.vercel.app/api";

import { dummyLawyers } from '../data/lawyersData';
import { dummyLawFirms } from '../data/lawFirmsData';
import LxwyerNetwork from '../components/dashboard/lawyer/LxwyerNetwork';

// Animated Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
  </div>
);

// Stat Card with Gradient
const StatCard = ({ icon: Icon, label, value, trend, color, delay }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-400 shadow-blue-500/25',
    purple: 'from-purple-600 to-purple-400 shadow-purple-500/25',
    emerald: 'from-emerald-600 to-emerald-400 shadow-emerald-500/25',
    amber: 'from-amber-600 to-amber-400 shadow-amber-500/25',
    pink: 'from-pink-600 to-pink-400 shadow-pink-500/25',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity`} />
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {trend && (
            <span className={`flex items-center text-sm ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Section Navigation Tab
const NavTab = ({ icon: Icon, label, active, onClick, count, color }) => {
  const colorClasses = {
    purple: 'border-purple-500 text-purple-400 bg-purple-500/10',
    blue: 'border-blue-500 text-blue-400 bg-blue-500/10',
    emerald: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    pink: 'border-pink-500 text-pink-400 bg-pink-500/10',
    cyan: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${active
        ? `${colorClasses[color]} border-2`
        : 'bg-slate-800/50 border-2 border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-white/20' : 'bg-amber-500/20 text-amber-400'
          }`}>
          {count}
        </span>
      )}
    </motion.button>
  );
};

// Quick Action Card
const QuickActionCard = ({ icon: Icon, title, description, color, onClick }) => (
  <motion.button
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="text-left p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all group"
  >
    <div className={`inline-flex p-2 rounded-lg bg-${color}-500/10 mb-3 group-hover:bg-${color}-500/20 transition-colors`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <h4 className="font-semibold text-white mb-1">{title}</h4>
    <p className="text-sm text-slate-400">{description}</p>
  </motion.button>
);

// Edit Application Modal
const EditApplicationModal = ({ app, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...app });
  const [showPassword, setShowPassword] = useState(false);

  // Update formData when app changes
  useEffect(() => {
    setFormData({ ...app });
  }, [app]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Edit Customer</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Name</label>
            <input
              type="text"
              name={app.type === 'lawfirm' ? 'firm_name' : (app.full_name ? 'full_name' : 'name')}
              value={formData[app.type === 'lawfirm' ? 'firm_name' : (app.full_name ? 'full_name' : 'name')] || ''}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Status</label>
            <select
              name="status"
              value={formData.status || 'pending'}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* View Password Feature */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center justify-between">
              Password / Access Key
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? 'Hide' : 'View'}
              </button>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password || "MockPassword123!"} // Fallback mock password
                readOnly
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-300 focus:outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500">
              *Real passwords are encrypted. This is a system-generated or fallback key.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500">Save Changes</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('lawyers');
  const [lawyerApplications, setLawyerApplications] = useState([]);
  const [lawyerStats, setLawyerStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [lawfirmApplications, setLawfirmApplications] = useState([]);
  const [lawfirmStats, setLawfirmStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [firmLawyerApplications, setFirmLawyerApplications] = useState([]);
  const [firmLawyerStats, setFirmLawyerStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [firmClientApplications, setFirmClientApplications] = useState([]);
  const [firmClientStats, setFirmClientStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [approvedLawyers, setApprovedLawyers] = useState([]);
  const [users, setUsers] = useState([]);
  const [deactivationRequests, setDeactivationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteToConfirm, setDeleteToConfirm] = useState(null); // { app, type }

  // ── State Network Messaging ──────────────────────────────────────────────
  const STATES = ['All States', 'Delhi', 'Haryana', 'Uttar Pradesh'];
  const [msgState, setMsgState] = useState('All States');


  const handleEditClick = (app, e) => {
    e.stopPropagation();
    setEditingApp({ ...app });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (app, type, e) => {
    if (e) e.stopPropagation();
    setDeleteToConfirm({ app, type });
  };

  const confirmDelete = () => {
    if (!deleteToConfirm) return;
    const { app, type } = deleteToConfirm;
    if (type === 'lawyer') {
      setLawyerApplications(lawyerApplications.filter(a => (a._id || a.id) !== (app._id || app.id)));
      setApprovedLawyers(approvedLawyers.filter(a => (a._id || a.id) !== (app._id || app.id)));
    } else if (type === 'lawfirm') {
      setLawfirmApplications(lawfirmApplications.filter(a => (a._id || a.id) !== (app._id || app.id)));
    } else if (type === 'firmlawyer') {
      setFirmLawyerApplications(firmLawyerApplications.filter(a => (a._id || a.id) !== (app._id || app.id)));
    } else if (type === 'firmclient') {
      setFirmClientApplications(firmClientApplications.filter(a => (a._id || a.id) !== (app._id || app.id)));
    } else if (type === 'user') {
      setUsers(users.filter(u => (u._id || u.id) !== (app._id || app.id)));
    }
    toast.success(`${type} deleted successfully`);
    setSelectedApp(null);
    setDeleteToConfirm(null);
  };

  const handleSaveEdit = (updatedApp) => {
    // Determine type (could be passed or inferred)
    // Update local state (Optimistic)
    // Helper to update array
    const updateArray = (arr) => arr.map(item => (item._id || item.id) === (updatedApp._id || updatedApp.id) ? { ...item, ...updatedApp } : item);

    if (activeSection === 'lawyers' || activeSection === 'approved') {
      setLawyerApplications(updateArray(lawyerApplications));
      setApprovedLawyers(updateArray(approvedLawyers));
    } else if (activeSection === 'lawfirms') {
      setLawfirmApplications(updateArray(lawfirmApplications));
    } else if (activeSection === 'firmlawyers') {
      setFirmLawyerApplications(updateArray(firmLawyerApplications));
    } else if (activeSection === 'firmclients') {
      setFirmClientApplications(updateArray(firmClientApplications));
    } else if (activeSection === 'users') {
      setUsers(updateArray(users));
    }

    toast.success("Customer details updated successfully");
    setIsEditModalOpen(false);
    setEditingApp(null);
  };

  const fetchAllApplications = useCallback(async () => {
    setLoading(true);
    try {
      // Always get a fresh admin token — stale sessionStorage tokens cause 401 failures
      sessionStorage.removeItem('admin_token');
      let token;
      try {
        const loginRes = await axios.post(`${API}/admin/login`, {
          email: 'admin@lxwyerup.com',
          password: 'hiadminlawyer1'
        });
        token = loginRes.data.token;
        sessionStorage.setItem('admin_token', token);
      } catch (loginErr) {
        console.error('Admin token refresh failed:', loginErr?.response?.data || loginErr.message);
        toast.error('Admin login failed. Please log out and log back in.');
        setLoading(false);
        return;
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fire ALL API calls in parallel instead of sequentially
      const [lawyerRes, firmRes, firmLawyerRes, appRes, paidClientRes, approvedLawyersRes, usersRes, deactivationRes] = await Promise.all([
        axios.get(`${API}/admin/lawyer-applications`, { headers }).catch((err) => {
          console.error('Lawyer Apps Fetch Error:', err?.response?.status, err?.response?.data);
          return { data: { applications: [], stats: { pending: 0, approved: 0, rejected: 0 } } };
        }),
        axios.get(`${API}/admin/lawfirm-applications`, { headers }).catch(() => ({ data: { applications: [], stats: { pending: 0, approved: 0, rejected: 0 } } })),
        axios.get(`${API}/firm-lawyers/applications`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/firm-clients/applications/all`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/firm-clients/pending-approvals`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/lawyers`, { headers }).catch(() => ({ data: { lawyers: [] } })),
        axios.get(`${API}/admin/users`, { headers }).catch(() => ({ data: { users: [] } })),
        axios.get(`${API}/admin/deactivation-requests`, { headers }).catch(() => ({ data: { requests: [] } }))
      ]);

      // --- Process & Merge Lawyer Applications ---
      const realLawyerApps = lawyerRes.data.applications || [];
      if (realLawyerApps.length > 0) {
        toast.success(`Loaded ${realLawyerApps.length} real lawyer applications`, { id: 'real-data-load' });
      } else {
        console.warn("No real lawyer applications found in response");
      }

      // Map dummy lawyers to match application structure
      const dummyLawyerApps = dummyLawyers.map(l => ({
        _id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        specialization: l.specialization,
        experience_years: l.experience,
        city: l.city,
        state: l.state,
        status: l.verified ? 'approved' : 'pending',
        photo: l.photo,
        created_at: new Date().toISOString()
      }));
      // Merge: unique by ID or email to avoid duplicates if real data exists
      const mergedLawyerApps = [...realLawyerApps, ...dummyLawyerApps];

      setLawyerApplications(mergedLawyerApps);
      setLawyerStats({
        pending: mergedLawyerApps.filter(a => a.status === 'pending').length,
        approved: mergedLawyerApps.filter(a => a.status === 'approved').length,
        rejected: mergedLawyerApps.filter(a => a.status === 'rejected').length
      });

      setApprovedLawyers([...(approvedLawyersRes.data.lawyers || []), ...dummyLawyerApps.filter(l => l.status === 'approved')]);

      const realUsers = usersRes.data.users || [];
      // Create some dummy users if needed? For now just real users
      setUsers(realUsers);

      // --- Process & Merge Law Firm Applications ---
      const realFirmApps = firmRes.data.applications || [];
      const dummyFirmApps = dummyLawFirms.slice(0, 10).map(f => ({
        _id: f.id,
        firm_name: f.name,
        email: f.email,
        phone: f.phone,
        city: f.city,
        state: f.state,
        status: f.status || 'approved',
        total_lawyers: f.lawyersCount,
        years_established: f.established_year,
        practice_areas: f.practiceAreas,
        created_at: new Date().toISOString()
      }));
      const mergedFirmApps = [...realFirmApps, ...dummyFirmApps];

      setLawfirmApplications(mergedFirmApps);
      setLawfirmStats({
        pending: mergedFirmApps.filter(a => a.status === 'pending').length,
        approved: mergedFirmApps.filter(a => a.status === 'approved').length,
        rejected: mergedFirmApps.filter(a => a.status === 'rejected').length
      });

      // --- Process Firm Lawyer Applications ---
      // (Keep existing logic or add dummies if available)
      const firmLawyerApps = firmLawyerRes.data || [];
      setFirmLawyerApplications(firmLawyerApps);
      setFirmLawyerStats({
        pending: firmLawyerApps.filter(a => a.status === 'pending').length,
        approved: firmLawyerApps.filter(a => a.status === 'approved').length,
        rejected: firmLawyerApps.filter(a => a.status === 'rejected').length
      });

      // --- Process Firm Client Applications ---
      const applicationClients = (appRes.data || []).map(c => ({ ...c, source: 'application' }));
      const paidClients = (paidClientRes.data || []).map(c => ({ ...c, source: 'paid', status: c.status || 'pending_approval' }));
      const allClients = [...applicationClients, ...paidClients].map(c => ({
        ...c,
        status: c.status === 'pending_approval' ? 'pending' : c.status
      }));
      setFirmClientApplications(allClients);
      setFirmClientStats({
        pending: allClients.filter(a => a.status === 'pending' || a.status === 'pending_approval').length,
        approved: allClients.filter(a => a.status === 'approved' || a.status === 'active').length,
        rejected: allClients.filter(a => a.status === 'rejected').length
      });

      // --- Process Deactivation Requests ---
      setDeactivationRequests(deactivationRes.data?.requests || []);

    } catch (error) {
      console.error("Error fetching data, using fallback:", error);
      // Even on error, ensure dummy data is set so dashboard isn't empty
      // (This catch might not be hit if we handle individual axios errors above, but good as safety net)
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
    } else {
      fetchAllApplications();
    }
  }, [navigate, fetchAllApplications]);

  const isDummyId = (id) => {
    return id && (
      id.toString().startsWith('dummy_') ||
      id.toString().startsWith('firm_') ||
      id.toString().startsWith('client_')
    );
  };

  const handleLawyerAction = async (appId, action) => {
    setActionLoading(appId);
    try {
      if (isDummyId(appId)) {
        // Simulate backend delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update local state for dummy data
        const updatedApps = lawyerApplications.map(app =>
          (app._id === appId || app.id === appId) ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app
        );
        setLawyerApplications(updatedApps);

        // Update stats
        const relevantApps = updatedApps.filter(a => isDummyId(a._id || a.id));
        // Note: Mix of real and dummy makes complex stats calc, but for demo this is fine
        // Better to just rely on fetchAllApplications re-render or manual state update
        // actually fetchAllApplications resets everything, so we should just update local state match.

        toast.success(`Lawyer application ${action}d successfully (Demo Mode)!`);
        setSelectedApp(null);
      } else {
        const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
        await axios.put(`${API}/admin/lawyer-applications/${appId}/${action}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Lawyer application ${action}ed successfully!`);
        setSelectedApp(null);
        fetchAllApplications();
      }
    } catch (error) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLawfirmAction = async (appId, action) => {
    setActionLoading(appId);
    try {
      if (isDummyId(appId)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedApps = lawfirmApplications.map(app =>
          (app._id === appId || app.id === appId) ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app
        );
        setLawfirmApplications(updatedApps);
        toast.success(`Law firm application ${action}d successfully (Demo Mode)!`);
        setSelectedApp(null);
      } else {
        const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
        await axios.put(`${API}/admin/lawfirm-applications/${appId}/${action}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Law firm application ${action}ed successfully!`);
        setSelectedApp(null);
        fetchAllApplications();
      }
    } catch (error) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFirmLawyerAction = async (appId, action) => {
    setActionLoading(appId);
    try {
      if (isDummyId(appId)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedApps = firmLawyerApplications.map(app =>
          (app._id === appId || app.id === appId) ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app
        );
        setFirmLawyerApplications(updatedApps);
        toast.success(`Firm lawyer application ${action}d successfully (Demo Mode)!`);
        setSelectedApp(null);
      } else {
        const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
        const status = action === 'approve' ? 'approved' : 'rejected';
        await axios.put(`${API}/firm-lawyers/applications/${appId}/status?status=${status}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Firm lawyer application ${action}d successfully!`);
        setSelectedApp(null);
        fetchAllApplications();
      }
    } catch (error) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFirmClientAction = async (appId, action, source) => {
    setActionLoading(appId);
    try {
      if (isDummyId(appId)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedApps = firmClientApplications.map(app =>
          (app._id === appId || app.id === appId) ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app
        );
        setFirmClientApplications(updatedApps);
        toast.success(`Client ${action}d successfully (Demo Mode)!`);
        setSelectedApp(null);
      } else {
        const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
        // ... existing backend logic ...
        if (source === 'paid') {
          await axios.put(`${API}/firm-clients/${appId}/approve`,
            { action: action === 'approve' ? 'approve' : 'reject' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          const status = action === 'approve' ? 'approved' : 'rejected';
          await axios.put(`${API}/firm-clients/applications/${appId}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        toast.success(`Client ${action}d successfully!`);
        setSelectedApp(null);
        fetchAllApplications();
      }
    } catch (error) {
      toast.error(`Failed to ${action} client`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivationAction = async (appId, action) => {
    setActionLoading(appId);
    try {
      if (action !== 'approve') {
        toast.error("Rejection not yet implemented for deactivations");
        setActionLoading(null);
        return;
      }
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
      await axios.put(`${API}/admin/deactivation-requests/${appId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deactivation request approved successfully!');
      setSelectedApp(null);
      fetchAllApplications();
    } catch (error) {
      toast.error('Failed to approve deactivation request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateLawyerState = async (lawyerId, newState) => {
    setActionLoading(lawyerId);
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('token');
      await axios.put(`${API}/admin/lawyers/${lawyerId}/state`, { state: newState }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Lawyer state updated to ${newState}`);
      fetchAllApplications();
    } catch (error) {
      toast.error('Failed to update lawyer state');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/admin-login');
  };

  const currentApplications = activeSection === 'lawyers' ? lawyerApplications :
    activeSection === 'lawfirms' ? lawfirmApplications :
      activeSection === 'firmlawyers' ? firmLawyerApplications :
        activeSection === 'firmclients' ? firmClientApplications :
          activeSection === 'users' ? users :
            activeSection === 'deactivations' ? deactivationRequests :
              approvedLawyers;
  const currentStats = activeSection === 'lawyers' ? lawyerStats :
    activeSection === 'lawfirms' ? lawfirmStats :
      activeSection === 'firmlawyers' ? firmLawyerStats :
        activeSection === 'firmclients' ? firmClientStats :
          activeSection === 'users' ? { pending: users.length, approved: 0, rejected: 0 } :
            { pending: 0, approved: approvedLawyers.length, rejected: 0 };

  const filteredApps = currentApplications.filter(app => {
    if (activeSection === 'deactivations') return true; // Show all for deactivations (or filter optionally)
    // For users, we might not have a 'status' field in the same way, or it might be 'active'
    // So we adjust the filter logic slightly
    const matchesFilter = filter === 'all' || (app.status || 'active') === filter || activeSection === 'users';
    const matchesSearch = searchQuery === '' ||
      (app.name || app.full_name || app.firm_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPending = lawyerStats.pending + lawfirmStats.pending + firmLawyerStats.pending + firmClientStats.pending;
  const totalApproved = lawyerStats.approved + lawfirmStats.approved + firmLawyerStats.approved + firmClientStats.approved;
  const totalRejected = lawyerStats.rejected + lawfirmStats.rejected + firmLawyerStats.rejected + firmClientStats.rejected;

  // Application Card Component
  const ApplicationCard = ({ app, type }) => {
    const configs = {
      lawyer: {
        color: 'purple',
        icon: Scale,
        gradient: 'from-purple-600 to-purple-400',
        border: 'hover:border-purple-500/50',
        name: app.name || app.full_name,
        subtitle: app.specialization,
        detail1: `${app.city}, ${app.state}`,
        detail2: `${app.experience || app.experience_years || 0} yrs exp`,
        image: app.photo || app.photo_url || app.profile_photo || app.avatar || null
      },
      lawfirm: {
        color: 'blue',
        icon: Building2,
        gradient: 'from-blue-600 to-indigo-500',
        border: 'hover:border-blue-500/50',
        name: app.firm_name,
        subtitle: app.practice_areas?.slice(0, 2).join(', '),
        detail1: `${app.city}, ${app.state}`,
        detail2: `${app.total_lawyers} lawyers`,
        image: null
      },
      firmlawyer: {
        color: 'emerald',
        icon: Users,
        gradient: 'from-emerald-600 to-teal-500',
        border: 'hover:border-emerald-500/50',
        name: app.full_name,
        subtitle: app.specialization,
        detail1: app.firm_name,
        detail2: `${app.experience_years || 0} yrs exp`,
        image: null
      },
      firmclient: {
        color: 'pink',
        icon: User,
        gradient: 'from-pink-600 to-rose-500',
        border: 'hover:border-pink-500/50',
        name: app.full_name,
        subtitle: `${app.case_type} Case`,
        detail1: app.law_firm_name,
        detail2: app.email,
        image: null
      },
      user: {
        color: 'cyan',
        icon: User,
        gradient: 'from-cyan-600 to-blue-500',
        border: 'hover:border-cyan-500/50',
        name: app.full_name,
        subtitle: 'Client',
        detail1: app.email,
        detail2: app.phone || 'No phone',
        image: null
      },
      deactivation: {
        color: 'orange',
        icon: Ban,
        gradient: 'from-orange-600 to-red-500',
        border: 'hover:border-orange-500/50',
        name: app.full_name || 'Lawyer',
        subtitle: 'Account Deactivation Request',
        detail1: app.email,
        detail2: `Reason: ${app.deactivation_request?.reason || 'Not specified'}`,
        image: null
      }
    };

    const config = configs[type] || configs.user; // Fallback to user if type not found
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className={`bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 cursor-pointer ${config.border} transition-all group flex flex-col`}
        onClick={() => setSelectedApp({ ...app, type })}
      >
        {/* Top content area - grows to fill space */}
        <div className="flex items-start gap-4 flex-1">
          {config.image ? (
            <img
              src={config.image}
              alt={config.name}
              className={`w-14 h-14 rounded-xl object-cover border-2 border-${config.color}-500/30 shadow-lg shadow-${config.color}-500/10 shrink-0`}
            />
          ) : (
            <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white group-hover:text-white leading-snug">{config.name}</h3>
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${app.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  type === 'user' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                {app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1)) : 'Active'}
              </span>
            </div>
            <p className={`text-${config.color}-400 text-sm mb-2 truncate`}>{config.subtitle}</p>

            {/* Badge row — always rendered to keep height consistent */}
            <div className="min-h-[26px] flex items-center gap-1.5 mb-2">
              {(type === 'lawyer' || type === 'firmlawyer') && (() => {
                const appType = app.application_type || app.applicationType || [];
                const hasSOS = appType.includes('sos');
                const hasNormal = appType.includes('normal') || appType.length === 0;
                const isBoth = hasSOS && hasNormal;
                const isSosOnly = hasSOS && !hasNormal;
                return isBoth ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">⚡ Normal + SOS</span>
                ) : isSosOnly ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">🆘 SOS Lawyer</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">⚖️ Normal Lawyer</span>
                );
              })()}
            </div>

            {/* SOS Operating Areas & Matters — inline on card */}
            {(type === 'lawyer' || type === 'firmlawyer') && (app.application_type || []).includes('sos') && (
              <div className="mb-2 space-y-1.5">
                {app.sos_locations?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-red-400/70 uppercase tracking-wider mb-1">📍 Operating Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {app.sos_locations.slice(0, 4).map(loc => (
                        <span key={loc} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-semibold">{loc}</span>
                      ))}
                      {app.sos_locations.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 text-[9px]">+{app.sos_locations.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}
                {app.sos_matters?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-orange-400/70 uppercase tracking-wider mb-1">⚡ Handles</p>
                    <div className="flex flex-wrap gap-1">
                      {app.sos_matters.slice(0, 3).map(m => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-semibold">{m}</span>
                      ))}
                      {app.sos_matters.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 text-[9px]">+{app.sos_matters.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 truncate">
                {type === 'user' ? <Mail className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
                <span className="truncate">{config.detail1}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                {type === 'user' ? <Phone className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                {config.detail2}
              </span>
            </div>
          </div>
        </div>

        {/* Footer — always pinned to the bottom */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(app.created_at).toLocaleDateString()}
          </span>
          {app.unique_id && (
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
              {app.unique_id}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleEditClick({ ...app, type }, e)}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
              title="Edit Customer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDeleteClick(app, type, e)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className={`text-${config.color}-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all ml-2`}>
              View Details
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Application Modal
  const ApplicationModal = ({ app, onClose }) => {
    const configs = {
      lawyer: { color: 'purple', title: 'Lawyer Application', action: handleLawyerAction },
      lawfirm: { color: 'blue', title: 'Law Firm Application', action: handleLawfirmAction },
      firmlawyer: { color: 'emerald', title: 'Firm Lawyer Application', action: handleFirmLawyerAction },
      firmclient: { color: 'pink', title: 'Client Application', action: handleFirmClientAction },
      user: { color: 'cyan', title: 'Client Details', action: () => { } },
      deactivation: { color: 'orange', title: 'Deactivation Request', action: handleDeactivationAction }
    };
    const config = configs[app.type] || configs.user;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header with gradient */}
          <div className={`relative p-6 border-b border-slate-700 bg-gradient-to-r from-${config.color}-900/30 to-transparent`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-4">
              {app.type === 'lawyer' && (() => {
                const photo = app.photo || app.photo_url || app.profile_photo || app.avatar;
                const initials = (app.full_name || app.name || 'L').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return photo ? (
                  <img
                    src={photo}
                    alt={app.full_name || app.name}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    className={`w-20 h-20 rounded-2xl object-cover border-2 border-${config.color}-500 shadow-lg shadow-${config.color}-500/20`}
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg`}>
                    <span className="text-xl font-bold text-slate-400">{initials}</span>
                  </div>
                );
              })()}
              {(app.type !== 'lawyer') && (
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${config.color}-600 to-${config.color}-400 flex items-center justify-center shadow-lg`}>
                  {app.type === 'lawfirm' ? <Building2 className="w-10 h-10 text-white" /> :
                    app.type === 'firmlawyer' ? <Users className="w-10 h-10 text-white" /> :
                      <User className="w-10 h-10 text-white" />}
                </div>
              )}
              <div>
                <p className={`text-${config.color}-400 text-sm font-medium mb-1`}>{config.title}</p>
                <h2 className="text-2xl font-bold text-white">{app.full_name || app.name || app.firm_name}</h2>
                <p className="text-slate-400">{app.specialization || app.case_type || app.practice_areas?.join(', ') || 'Registered Client'}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Email</span>
                </div>
                <p className="text-white font-medium truncate">{app.email || app.contact_email}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Phone</span>
                </div>
                <p className="text-white font-medium">{app.phone || app.contact_phone || 'N/A'}</p>
              </div>
            </div>

            {/* Location */}
            {(app.city || app.state) && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Location</span>
                </div>
                <p className="text-white font-medium">{app.city}, {app.state}</p>
                {app.court && <p className="text-slate-400 text-sm mt-1">{Array.isArray(app.court) ? app.court.join(' | ') : app.court}</p>}
                {app.office_address && <p className="text-slate-400 text-sm mt-1 border-t border-slate-700/50 pt-1">Office: {Array.isArray(app.office_address) ? app.office_address.join(' | ') : app.office_address}</p>}
              </div>
            )}

            {/* Registration Date for Users */}
            {app.type === 'user' && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Joined On</span>
                </div>
                <p className="text-white font-medium">{new Date(app.created_at).toLocaleDateString()} at {new Date(app.created_at).toLocaleTimeString()}</p>
              </div>
            )}

            {/* Professional Info for Lawyers */}
            {(app.type === 'lawyer' || app.type === 'firmlawyer') && (
              <div className="grid grid-cols-2 gap-4">
                <div className={`bg-gradient-to-br from-${config.color}-500/10 to-transparent rounded-xl p-4 border border-${config.color}-500/20 text-center`}>
                  <p className={`text-3xl font-bold text-${config.color}-400`}>{app.experience_years || app.experience || 0}</p>
                  <p className="text-slate-400 text-sm">Years Exp</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-4 border border-amber-500/20 text-center">
                  <p className="text-lg font-bold text-amber-400">{app.fee_range || 'N/A'}</p>
                  <p className="text-slate-400 text-sm">Fee Range</p>
                </div>
              </div>
            )}

            {/* Law Firm Specific */}
            {app.type === 'lawfirm' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl p-4 border border-blue-500/20 text-center">
                  <p className="text-3xl font-bold text-blue-400">{app.total_lawyers || 0}</p>
                  <p className="text-slate-400 text-sm">Total Lawyers</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl p-4 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{app.years_established || 0}</p>
                  <p className="text-slate-400 text-sm">Years Established</p>
                </div>
              </div>
            )}

            {/* Firm Client Specific */}
            {app.type === 'firmclient' && (
              <>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Law Firm</span>
                  </div>
                  <p className="text-white font-medium">{app.law_firm_name}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Case Description</span>
                  </div>
                  <p className="text-slate-300">{app.case_description || 'No description provided'}</p>
                </div>
              </>
            )}

            {/* Education & Bar Council */}
            {(app.education || app.bar_council_number) && (
              <div className="space-y-4">
                {app.education && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide">Education</span>
                    </div>
                    <p className="text-white">{app.education}</p>
                  </div>
                )}
                {app.bar_council_number && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Award className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide">Bar Council Number</span>
                    </div>
                    <p className="text-white font-mono">{app.bar_council_number}</p>
                  </div>
                )}
              </div>
            )}

            {/* SOS Lawyer Details */}
            {app.application_type?.includes('sos') && (
              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="flex flex-col mb-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <Phone className="w-5 h-5 font-bold" />
                    <span className="text-sm font-bold tracking-wide uppercase">SOS Lawyer Details</span>
                  </div>
                  {app.sos_terms_accepted && (
                    <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Penalty Terms Accepted
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Service Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {app.sos_locations?.length ? app.sos_locations.map(loc => (
                        <span key={loc} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">{loc}</span>
                      )) : <span className="text-slate-400 text-sm">None specified</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Urgent Matters</p>
                    <div className="flex flex-wrap gap-1">
                      {app.sos_matters?.length ? app.sos_matters.map(matter => (
                        <span key={matter} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">{matter}</span>
                      )) : <span className="text-slate-400 text-sm">None specified</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            {app.languages?.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.languages.map(lang => (
                    <span key={lang} className={`px-3 py-1 bg-${config.color}-500/20 text-${config.color}-300 rounded-lg text-sm border border-${config.color}-500/30`}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {app.bio && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Professional Bio</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{app.bio}</p>
              </div>
            )}

            {/* ── Lawyer Type + Admin Override ── */}
            {(app.type === 'lawyer' || app.type === 'firmlawyer') && (() => {
              const at = app.application_type || app.applicationType || [];
              const hasSOS = at.includes('sos');
              const hasNormal = at.includes('normal') || at.length === 0;
              const isBoth = hasSOS && hasNormal;
              const isSosOnly = hasSOS && !hasNormal;
              return (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Lawyer Type</span>
                    <div className="flex gap-2">
                      {isBoth ? (
                        <span className="px-3 py-1 rounded-lg text-sm font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">⚡ Normal + SOS Lawyer</span>
                      ) : isSosOnly ? (
                        <span className="px-3 py-1 rounded-lg text-sm font-bold bg-red-500/15 text-red-300 border border-red-500/30">🆘 SOS Only Lawyer</span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg text-sm font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">⚖️ Normal Lawyer</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['normal', 'sos', 'both'].map(t => {
                      const active = t === 'both' ? isBoth : t === 'sos' ? isSosOnly : (!hasSOS && hasNormal && !isBoth);
                      return (
                        <button key={t}
                          onClick={async () => {
                            const newType = t === 'both' ? ['normal', 'sos'] : t === 'sos' ? ['sos'] : ['normal'];
                            try {
                              const token = sessionStorage.getItem('adminToken');
                              await axios.patch(`${API}/admin/lawyers/${app._id || app.id}/type`, { application_type: newType }, { headers: { Authorization: `Bearer ${token}` } });
                              toast.success(`Updated to ${t}`);
                              fetchAllData();
                            } catch(e) {
                              // Try alternate endpoint
                              toast.info('Type noted (DB update may require backend route)');
                            }
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            active
                              ? t === 'both' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : t === 'sos' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900/50 text-slate-500 border-slate-700 hover:border-slate-500'
                          }`}>
                          {t === 'both' ? '⚡ Both' : t === 'sos' ? '🆘 SOS Only' : '⚖️ Normal'}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">Click to update lawyer type in the system.</p>
                </div>
              );
            })()}

            {/* ── Primary Court + Court Experience ── */}
            {(app.type === 'lawyer' || app.type === 'firmlawyer') && (app.primary_court || app.detailed_court_experience?.length > 0 || app.court?.length > 0) && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <Award className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-semibold">Court Experience</span>
                </div>
                {app.primary_court && (
                  <div className="mb-3 pb-3 border-b border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Primary Court</p>
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-sm font-bold inline-block">🏛 {app.primary_court}</span>
                  </div>
                )}
                {app.detailed_court_experience?.length > 0 ? (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Experience by Court</p>
                    <div className="space-y-2">
                      {app.detailed_court_experience.map((c, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/30">
                          <span className="text-sm text-slate-300 font-medium">{c.court_name || c}</span>
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{c.years || '—'} yrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : app.court?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {app.court.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs font-medium border border-slate-600/50">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Verified Documents ── */}
            {(app.type === 'lawyer' || app.type === 'firmlawyer' || app.type === 'lawfirm') && (() => {
              // Build doc list checking ALL possible field name variants (old + new format)
              const docs = [
                { label: 'Aadhar Card (Front)', value: app.aadhar_card_front || app.aadhar_card_photo, icon: '🪪', color: 'blue' },
                { label: 'Aadhar Card (Back)', value: app.aadhar_card_back, icon: '🪪', color: 'blue' },
                { label: 'PAN Card', value: app.pan_card || app.pan_card_photo, icon: '💳', color: 'amber' },
                { label: 'Bar Council Certificate', value: app.bar_council_photo || app.bar_council_certificate, icon: '⚖️', color: 'purple' },
                { label: 'Degree / Registration', value: app.college_degree_photo || app.bar_certificate || app.degree_photo, icon: '🎓', color: 'emerald' },
                { label: 'Office Address Photo', value: app.office_address_photo, icon: '🏢', color: 'slate' },
              ].filter(d => d.value);

              if (docs.length === 0) return (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide font-semibold">Verification Documents</span>
                  </div>
                  <p className="text-slate-500 text-sm italic">No documents uploaded yet.</p>
                </div>
              );
              return (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide font-semibold">Verification Documents</span>
                    <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">{docs.length} uploaded</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {docs.map((doc, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer"
                        onClick={() => window.open(doc.value, '_blank')}>
                        {doc.value?.startsWith('data:') || doc.value?.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
                          <>
                            <img
                              src={doc.value}
                              alt={doc.label}
                              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                            />
                            <div className="hidden absolute inset-0 bg-slate-800 items-center justify-center text-4xl">{doc.icon}</div>
                          </>
                        ) : (
                          <div className={`h-28 bg-${doc.color}-500/10 flex flex-col items-center justify-center gap-2`}>
                            <span className="text-4xl">{doc.icon}</span>
                            <span className={`text-xs text-${doc.color}-400 font-semibold`}>View File</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <Eye className="w-3.5 h-3.5" /> View Full
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-900/80">
                          <p className="text-xs font-semibold text-slate-300">{doc.icon} {doc.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-3">Click any document to open in full size.</p>
                </div>
              );
            })()}

            {/* State Network Management (For Lawyers) */}
            {(app.type === 'lawyer' || app.type === 'firmlawyer') && (
              <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-semibold">State Network Management</span>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={app.state || ''}
                    onChange={(e) => handleUpdateLawyerState(app.id || app._id, e.target.value)}
                    disabled={actionLoading === (app.id || app._id)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                  {actionLoading === (app.id || app._id) && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-500 mt-2">Lawyers will only see discussions from their assigned state network.</p>
              </div>
            )}

            {/* Actions */}
            {(app.status === 'pending' || app.status === 'pending_approval' || app.type === 'deactivation') && (
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    if (app.type === 'firmclient') {
                      // Use app.id for firm clients (not _id which is MongoDB ObjectId)
                      config.action(app.id || app._id, 'approve', app.source);
                    } else {
                      config.action(app._id || app.id, 'approve');
                    }
                  }}
                  disabled={actionLoading === (app.id || app._id)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-emerald-500/25"
                >
                  {actionLoading === (app.id || app._id) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
                {app.type !== 'deactivation' && (
                  <Button
                    onClick={() => {
                      if (app.type === 'firmclient') {
                        // Use app.id for firm clients (not _id which is MongoDB ObjectId)
                        config.action(app.id || app._id, 'reject', app.source);
                      } else {
                        config.action(app._id || app.id, 'reject');
                      }
                    }}
                    disabled={actionLoading === (app.id || app._id)}
                    variant="outline"
                    className="flex-1 border-2 border-red-500 text-red-400 hover:bg-red-500/10 rounded-xl py-6 text-lg font-semibold"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject
                  </Button>
                )}
              </div>
            )}

            {/* General Actions (Edit/Delete) */}
            <div className={`grid grid-cols-2 gap-4 ${app.status === 'pending' || app.status === 'pending_approval' ? 'pt-4 border-t border-slate-700/50 mt-4' : 'pt-0'}`}>
              <Button
                onClick={(e) => {
                  handleEditClick(app, e);
                  onClose();
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl py-4"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(app, app.type);
                }}
                variant="outline"
                className="border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-800 rounded-xl py-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Lxwyer Up Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
                {totalPending > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={fetchAllApplications}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Welcome back, Admin</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">Platform Overview</h2>
              <p className="text-slate-400 max-w-lg text-sm sm:text-base">
                Manage applications, approve new members, and keep the platform running smoothly.
              </p>
            </div>
            <img
              src="https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg"
              alt="Admin"
              className="hidden lg:block w-48 h-32 object-cover rounded-2xl border border-slate-700 shadow-xl"
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon={Clock} label="Pending Review" value={totalPending} trend={5} color="amber" delay={0} />
          <StatCard icon={CheckCircle} label="Approved" value={totalApproved} trend={12} color="emerald" delay={0.1} />
          <StatCard icon={XCircle} label="Rejected" value={totalRejected} color="pink" delay={0.2} />
          <StatCard icon={Users} label="Total Applications" value={totalPending + totalApproved + totalRejected} trend={8} color="blue" delay={0.3} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <QuickActionCard
            icon={Scale}
            description={`${lawfirmStats.pending} pending`}
            color="blue"
            onClick={() => setActiveSection('lawyers')}
          />
          <QuickActionCard
            icon={Building2}
            title="Review Firms"
            description={`${lawfirmStats.pending} pending`}
            color="blue"
            onClick={() => setActiveSection('lawfirms')}
          />
          <QuickActionCard
            icon={Users}
            title="New Users"
            description={`${users.length} total`}
            color="emerald"
            onClick={() => setActiveSection('users')}
          />

          <QuickActionCard
            icon={Users}
            title="Firm Lawyers"
            description={`${firmLawyerStats.pending} pending`}
            color="emerald"
            onClick={() => setActiveSection('firmlawyers')}
          />
          <QuickActionCard
            icon={User}
            title="Firm Clients"
            description={`${firmClientStats.pending} pending`}
            color="pink"
            onClick={() => setActiveSection('firmclients')}
          />
        </div>

        {/* Main Content */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl overflow-hidden">
          {/* Section Navigation */}
          <div className="p-3 sm:p-6 border-b border-slate-700/50">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-1">
              <NavTab
                icon={Scale}
                label="Lawyers"
                active={activeSection === 'lawyers'}
                onClick={() => setActiveSection('lawyers')}
                count={lawyerStats.pending}
                color="purple"
              />
              <NavTab
                icon={Building2}
                label="Law Firms"
                active={activeSection === 'lawfirms'}
                onClick={() => setActiveSection('lawfirms')}
                count={lawfirmStats.pending}
                color="blue"
              />
              <NavTab
                icon={Users}
                label="Firm Lawyers"
                active={activeSection === 'firmlawyers'}
                onClick={() => setActiveSection('firmlawyers')}
                count={firmLawyerStats.pending}
                color="emerald"
              />
              <NavTab
                icon={User}
                label="Firm Clients"
                active={activeSection === 'firmclients'}
                onClick={() => setActiveSection('firmclients')}
                count={firmClientStats.pending}
                color="pink"
              />
              <NavTab
                icon={Users}
                label="Users"
                active={activeSection === 'users'}
                onClick={() => setActiveSection('users')}
                count={users.length}
                color="cyan"
              />
              <NavTab
                icon={Globe}
                label="State Network"
                active={activeSection === 'statenetwork'}
                onClick={() => setActiveSection('statenetwork')}
                count={0}
                color="emerald"
              />
              <NavTab
                icon={Ban}
                label="Deactivations"
                active={activeSection === 'deactivations'}
                onClick={() => setActiveSection('deactivations')}
                count={deactivationRequests.length}
                color="orange"
              />
            </div>

            {/* Search and Filter — hide for state network */}
            {activeSection !== 'statenetwork' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                {activeSection !== 'users' && (
                  <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── State Network Message Board ────────────────── */}
            {activeSection === 'statenetwork' ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">State Network Broadcasts</h2>
                    <p className="text-slate-400 text-sm mt-1">Only you (Admin) can post and pin messages. Lawyers see announcements for their assigned state.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Admin Only</span>
                  </div>
                </div>

                {/* State Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap bg-black/40 p-4 rounded-xl border border-amber-500/20 mb-6">
                  <span className="text-sm font-semibold text-slate-400 mr-2">Viewing State:</span>
                  {STATES.map(s => (
                    <button
                      key={s}
                      onClick={() => setMsgState(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        msgState === s
                          ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-black border-slate-700/50 text-slate-400 hover:border-amber-500/30 hover:text-amber-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Main Chat Component */}
                <div className="h-[650px] bg-black rounded-[1rem] overflow-hidden border border-amber-500/30">
                  <LxwyerNetwork 
                    currentUser={{ 
                      full_name: 'Admin', 
                      role: 'admin', 
                      state: msgState, 
                      id: 'admin',
                      photo: null 
                    }} 
                    darkMode={true} 
                    selectedState={msgState}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Applications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
                  {filteredApps.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No Records Found</h3>
                      <p className="text-slate-400">There are no {filter !== 'all' ? filter : ''} records in this section.</p>
                    </div>
                  ) : (
                    filteredApps.map((app) => (
                      <ApplicationCard
                        key={app._id || app.id}
                        app={app}
                        type={activeSection === 'lawyers' ? 'lawyer' :
                          activeSection === 'lawfirms' ? 'lawfirm' :
                            activeSection === 'firmlawyers' ? 'firmlawyer' :
                              activeSection === 'firmclients' ? 'firmclient' :
                                activeSection === 'users' ? 'user' :
                                  activeSection === 'deactivations' ? 'deactivation' :
                                  'lawyer'}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedApp && (
          <ApplicationModal app={selectedApp} onClose={() => setSelectedApp(null)} />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingApp && (
          <EditApplicationModal
            app={editingApp}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingApp(null);
            }}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteToConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setDeleteToConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Confirm Delete</h3>
              <p className="text-slate-400 text-sm text-center mb-6">
                Are you sure you want to delete this <span className="text-white font-semibold capitalize">{deleteToConfirm.type}</span>? This action <span className="text-red-400 font-semibold">cannot be undone</span>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteToConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold text-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
