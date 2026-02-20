import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Scale, Users, CheckCircle, XCircle, Clock, Eye, User, Mail, Phone,
  MapPin, Briefcase, GraduationCap, Star, ArrowLeft, Loader2, RefreshCw, LogOut,
  Building2, Globe, FileText, X, TrendingUp, Calendar, Activity, Award,
  Sparkles, Home, Bell, Search, BarChart3, PieChart, Settings, ChevronRight,
  Pencil, Trash2, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { dummyLawyers } from '../data/lawyersData';
import { dummyLawFirms } from '../data/lawFirmsData';

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
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const handleEditClick = (app, e) => {
    e.stopPropagation();
    setEditingApp({ ...app });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (app, type, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      // Optimistic UI update
      if (type === 'lawyer') {
        const updated = lawyerApplications.filter(a => (a._id || a.id) !== (app._id || app.id));
        setLawyerApplications(updated);
        setApprovedLawyers(approvedLawyers.filter(a => (a._id || a.id) !== (app._id || app.id)));
      } else if (type === 'lawfirm') {
        const updated = lawfirmApplications.filter(a => (a._id || a.id) !== (app._id || app.id));
        setLawfirmApplications(updated);
      } else if (type === 'firmlawyer') {
        const updated = firmLawyerApplications.filter(a => (a._id || a.id) !== (app._id || app.id));
        setFirmLawyerApplications(updated);
      } else if (type === 'firmclient') {
        const updated = firmClientApplications.filter(a => (a._id || a.id) !== (app._id || app.id));
        setFirmClientApplications(updated);
      } else if (type === 'user') {
        const updated = users.filter(u => (u._id || u.id) !== (app._id || app.id));
        setUsers(updated);
      }
      toast.success(`${type} deleted successfully`);
    }
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
      const token = sessionStorage.getItem('token');
      // Even if generic token is present, we try to fetch real data
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fire ALL API calls in parallel instead of sequentially
      const [lawyerRes, firmRes, firmLawyerRes, appRes, paidClientRes, approvedLawyersRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/lawyer-applications`, { headers }).catch((err) => {
          console.error("Lawyer Apps Fetch Error:", err);
          toast.error("Failed to fetch lawyer applications");
          return { data: { applications: [], stats: { pending: 0, approved: 0, rejected: 0 } } };
        }),
        axios.get(`${API}/admin/lawfirm-applications`, { headers }).catch(() => ({ data: { applications: [], stats: { pending: 0, approved: 0, rejected: 0 } } })),
        axios.get(`${API}/firm-lawyers/applications`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/firm-clients/applications/all`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/firm-clients/pending-approvals`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/lawyers`, { headers }).catch(() => ({ data: { lawyers: [] } })),
        axios.get(`${API}/admin/users`, { headers }).catch(() => ({ data: { users: [] } }))
      ]);

      // --- Process & Merge Lawyer Applications ---
      const realLawyerApps = lawyerRes.data.applications || [];
      if (realLawyerApps.length > 0) {
        toast.success(`Loaded ${realLawyerApps.length} real lawyer applications`, { id: 'real-data-load' });
      } else {
        console.warn("No real lawyer applications found in response");
      }

      // Map dummy lawyers to match application structure
      const dummyLawyerApps = dummyLawyers.slice(0, 5).map(l => ({ // Reduced dummy count to 5 to make real apps more visible
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

    } catch (error) {
      console.error("Error fetching data, using fallback:", error);
      // Even on error, ensure dummy data is set so dashboard isn't empty
      // (This catch might not be hit if we handle individual axios errors above, but good as safety net)
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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
        const token = sessionStorage.getItem('token');
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

  const handleUpdateLawyerState = async (lawyerId, newState) => {
    setActionLoading(lawyerId);
    try {
      const token = sessionStorage.getItem('token');
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
            approvedLawyers;
  const currentStats = activeSection === 'lawyers' ? lawyerStats :
    activeSection === 'lawfirms' ? lawfirmStats :
      activeSection === 'firmlawyers' ? firmLawyerStats :
        activeSection === 'firmclients' ? firmClientStats :
          activeSection === 'users' ? { pending: users.length, approved: 0, rejected: 0 } :
            { pending: 0, approved: approvedLawyers.length, rejected: 0 };

  const filteredApps = currentApplications.filter(app => {
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
        image: app.photo || `https://randomuser.me/api/portraits/men/${parseInt(app._id?.slice(-2) || '10', 16) % 90}.jpg`
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
      }
    };

    const config = configs[type] || configs.user; // Fallback to user if type not found
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className={`bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 cursor-pointer ${config.border} transition-all group`}
        onClick={() => setSelectedApp({ ...app, type })}
      >
        <div className="flex items-start gap-4">
          {config.image ? (
            <img
              src={config.image}
              alt={config.name}
              className={`w-14 h-14 rounded-xl object-cover border-2 border-${config.color}-500/30 shadow-lg shadow-${config.color}-500/10`}
            />
          ) : (
            <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white truncate group-hover:text-white">{config.name}</h3>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${app.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  type === 'user' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                {app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1)) : 'Active'}
              </span>
            </div>
            <p className={`text-${config.color}-400 text-sm mb-2`}>{config.subtitle}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                {type === 'user' ? <Mail className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                {config.detail1}
              </span>
              <span className="flex items-center gap-1">
                {type === 'user' ? <Phone className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                {config.detail2}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">
            <Calendar className="w-3 h-3 inline mr-1" />
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
      user: { color: 'cyan', title: 'Client Details', action: () => { } }
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
              {app.type === 'lawyer' ? (
                <img
                  src={app.photo || `https://randomuser.me/api/portraits/men/${parseInt(app._id?.slice(-2) || '10', 16) % 90}.jpg`}
                  alt={app.name}
                  className={`w-20 h-20 rounded-2xl object-cover border-2 border-${config.color}-500 shadow-lg shadow-${config.color}-500/20`}
                />
              ) : (
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
                {app.court && <p className="text-slate-400 text-sm mt-1">{app.court}</p>}
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
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                  {actionLoading === (app.id || app._id) && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-500 mt-2">Lawyers will only see discussions from their assigned state network.</p>
              </div>
            )}

            {/* Actions */}
            {(app.status === 'pending' || app.status === 'pending_approval') && (
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
                  handleDeleteClick(app, app.type, e);
                  onClose();
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
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-400">Lxwyer Up Platform</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-8 mb-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Welcome back, Admin</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Platform Overview</h2>
              <p className="text-slate-400 max-w-lg">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Clock} label="Pending Review" value={totalPending} trend={5} color="amber" delay={0} />
          <StatCard icon={CheckCircle} label="Approved" value={totalApproved} trend={12} color="emerald" delay={0.1} />
          <StatCard icon={XCircle} label="Rejected" value={totalRejected} color="pink" delay={0.2} />
          <StatCard icon={Users} label="Total Applications" value={totalPending + totalApproved + totalRejected} trend={8} color="blue" delay={0.3} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex flex-wrap gap-3 mb-6">
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
            </div>

            {/* Search and Filter */}
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

            {/* Applications Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              'lawyer'}
                  />
                ))
              )}
            </div>
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
    </div>
  );
}
