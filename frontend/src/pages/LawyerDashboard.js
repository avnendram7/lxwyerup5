import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Scale, LogOut, LayoutDashboard, Calendar as CalendarIcon, MessageSquare, FileText, Users, TrendingUp, Search, MoreVertical, User, Clock, Phone, Video, CheckCircle, AlertCircle, Archive, Shield, ChevronLeft, ChevronRight, MapPin, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  isToday, parseISO
} from 'date-fns';
import axios from 'axios';
import { API } from '../App';
import CalendarView from '../components/dashboard/CalendarView';

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [networkChat, setNetworkChat] = useState([]);
  const [newNetworkMessage, setNewNetworkMessage] = useState('');

  const token = localStorage.getItem('token');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [dashboardData, setDashboardData] = useState({
    stats: { active_cases: 0, total_clients: 0, consultations_this_month: 0, revenue: 0 },
    upcoming_hearings: [],
    recent_clients: []
  });

  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  // New Case State
  const [newCaseData, setNewCaseData] = useState({
    title: '', client_name: '', case_type: '', court: '', status: 'active'
  });

  // New Event State
  const [newEventData, setNewEventData] = useState({
    title: '', type: 'meeting', start_time: '', end_time: '', description: ''
  });

  // Sharing State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocForShare, setSelectedDocForShare] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  const [hasUploadPermission, setHasUploadPermission] = useState(false);

  // Deletion State
  const [docToDelete, setDocToDelete] = useState(null);

  // Session View Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Fallbacks to prevent crashes while features are being built
  const [documents, setDocuments] = useState([]);
  const billingHistory = [];
  const networkMessages = [];

  // Use fetched cases or empty array
  const activeCases = cases || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    const fetchSafe = async (name, url, setter) => {
      try {
        const res = await axios.get(url, { headers });
        setter(res.data);
        return { success: true, name };
      } catch (e) {
        console.error(`Failed to fetch ${name}:`, e);
        return { success: false, name, error: e };
      }
    };

    const results = await Promise.all([
      fetchSafe('cases', `${API}/cases`, setCases),
      fetchSafe('bookings', `${API}/bookings`, setBookings),
      fetchSafe('dashboard', `${API}/dashboard/lawyer`, setDashboardData),
      fetchSafe('messages', `${API}/messages/recents`, setMessages),
      fetchSafe('events', `${API}/events`, (data) => setEvents(data || [])),
      fetchSafe('notifications', `${API}/notifications`, setNotifications),
      fetchSafe('documents', `${API}/documents`, setDocuments)
    ]);

    const failures = results.filter(r => !r.success);
    if (failures.length === results.length) {
      toast.error("Dashboard failed to load. Please check your connection.");
    } else if (failures.length > 0) {
      const failedNames = failures.map(f => f.name).join(', ');
      console.warn(`Partial load failure: ${failedNames}`);
      // Don't spam toasts for minor failures if some data loaded
      if (failures.find(f => f.name === 'dashboard' || f.name === 'cases')) {
        toast.error(`Some critical data failed to load: ${failedNames}`);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      const response = await axios.post(`${API}/lawyers/me/photo`, formData, { headers });

      // Update local user state with new photo
      const updatedUser = { ...user, photo: response.data.photo_url };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist to storage

      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await axios.patch(`${API}/bookings/${bookingId}/status`, { status: 'confirmed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking confirmed!");
      fetchData();
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept booking");
    }
  };

  const handleCancelBooking = async (bookingId, reason = "") => {
    try {
      await axios.patch(`${API}/bookings/${bookingId}/cancel`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking cancelled");
      fetchData();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleRescheduleBooking = async () => {
    if (!selectedBookingForReschedule || !rescheduleData.date || !rescheduleData.time) return;
    try {
      await axios.patch(`${API}/bookings/${selectedBookingForReschedule.id}/reschedule`, rescheduleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking rescheduled!");
      setShowRescheduleModal(false);
      fetchData();
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      toast.error("Failed to reschedule");
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.patch(`${API}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    // Optional: formData.append('case_id', 'some_id');

    setLoading(true);
    console.log("Starting document upload for:", file.name);

    try {
      await axios.post(`${API}/documents/upload`, formData, {
        timeout: 45000, // 45 seconds timeout
        headers: {
          Authorization: `Bearer ${token}`
          // Let Axios handle Content-Type boundary for multipart/form-data
        }
      });
      toast.success("Document uploaded successfully!");
      fetchData();
    } catch (error) {
      console.error("Error uploading document:", error);
      const msg = error.response?.data?.detail || error.message || "Failed to upload document";
      toast.error(msg);
      if (error.code === 'ECONNABORTED') {
        toast.error("Upload timed out. Is the file too large?");
      }
    } finally {
      setLoading(false);
      // Reset the file input so the same file can be selected again if needed
      e.target.value = null;
    }
  };

  const handleDeleteDocument = (docId) => {
    const doc = documents.find(d => d.id === docId);
    setDocToDelete(doc);
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;

    try {
      await axios.delete(`${API}/documents/${docToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(prev => prev.filter(doc => doc.id !== docToDelete.id));
      toast.success('Document deleted successfully');
      setDocToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleShareDocument = async (clientId) => {
    if (!selectedDocForShare) return;

    const formData = new FormData();
    formData.append('client_id', clientId);

    setLoading(true);
    try {
      await axios.post(`${API}/documents/${selectedDocForShare.id}/share`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Document shared successfully!");
      setShowShareModal(false);
      fetchData();
    } catch (error) {
      console.error("Error sharing document:", error);
      toast.error("Failed to share document");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    setLoading(true);
    try {
      await axios.patch(`${API}/bookings/${bookingId}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Booking ${status}!`);

      fetchData();
    } catch (error) {
      toast.error("Failed to update booking status");
      setLoading(false);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/cases`, newCaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Case created successfully!");
      setShowCaseModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create case");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      // Ensure dates are ISO strings
      // If using datetime-local input, they are "YYYY-MM-DDTHH:MM"
      await axios.post(`${API}/events`, {
        ...newEventData,
        start_time: new Date(newEventData.start_time).toISOString(),
        end_time: new Date(newEventData.end_time).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Event added to calendar!");
      setShowEventModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to add event");
    }
  };


  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await axios.get(`${API}/messages/${chat.other_user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistory(res.data);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await axios.post(`${API}/messages`, {
        receiver_id: selectedChat.other_user_id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      // Refresh chat (optimistic update or re-fetch)
      const res = await axios.get(`${API}/messages/${selectedChat.other_user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistory(res.data);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const fetchNetworkMessages = async () => {
    try {
      const res = await axios.get(`${API}/network/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNetworkChat(res.data);
    } catch (error) {
      console.error("Error fetching network messages", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'network') {
      fetchNetworkMessages();
      const interval = setInterval(fetchNetworkMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleSendNetworkMessage = async (e) => {
    e.preventDefault();
    if (!newNetworkMessage.trim()) return;

    try {
      await axios.post(`${API}/network/messages`, {
        content: newNetworkMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewNetworkMessage('');
      fetchNetworkMessages();
    } catch (error) {
      toast.error('Failed to send message to network');
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'cases', icon: FileText, label: 'Cases' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'network', icon: Users, label: 'Network' },
    { id: 'earnings', icon: TrendingUp, label: 'Earnings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0F2FE] p-4 md:p-8 flex items-center justify-center font-sans text-[#1F2937]">
      {/* App Window Container */}
      <div className="w-full max-w-[1600px] h-[90vh] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex relative border border-white/50">

        {/* Left Sidebar - Narrow Pill */}
        <aside className="w-24 flex flex-col items-center py-8 border-r border-white/20 bg-white/30 backdrop-blur-md z-10 relative">
          {/* Logo */}
          <div className="mb-12 relative group cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#0EA5E9] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <Scale className="w-7 h-7 text-white relative z-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* Navigation Line */}
          <div className="absolute left-12 top-32 bottom-32 w-px bg-slate-200/50 -z-10" />

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col items-center space-y-8 w-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    relative w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center group
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50'
                      : 'bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm border border-slate-100'
                    }
                  `}
                  title={item.label}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />

                  {/* Tooltip (Custom) */}
                  <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout (Bottom) */}
          <div className="mt-auto flex flex-col items-center gap-6">
            <div className="relative group p-1 bg-white rounded-full shadow-sm border border-slate-100">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <div
                onClick={() => fileInputRef.current.click()}
                className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all border-2 border-white"
                title="Upload Profile Photo"
              >
                {user?.photo && !imgError ? (
                  <img
                    src={`http://localhost:8000${user.photo}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
                    {user?.full_name?.[0] || 'L'}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Center Content */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Good Morning, {user?.full_name || 'Counsel'}</h1>
                    <p className="text-gray-400 text-sm">Your schedule this week is looking productive.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 w-64 shadow-sm"
                      />
                    </div>
                    <button onClick={() => setShowNotifications(!showNotifications)} className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#3B82F6] hover:shadow-md transition-all relative">
                      <span className="text-lg">🔔</span>
                      {notifications.filter(n => !n.is_read).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
                    </button>
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-50 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3B82F6] flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <MoreVertical className="w-5 h-5 text-gray-300 cursor-pointer" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium mb-1">Total Patients</h3>
                      <div className="flex items-end gap-2">
                        <h2 className="text-3xl font-bold text-gray-800">{dashboardData.stats.total_clients}</h2>
                        <span className="text-xs text-green-500 font-medium mb-1.5 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-50 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3B82F6] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <MoreVertical className="w-5 h-5 text-gray-300 cursor-pointer" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium mb-1">Active Cases</h3>
                      <div className="flex items-end gap-2">
                        <h2 className="text-3xl font-bold text-gray-800">{dashboardData.stats.active_cases}</h2>
                        <span className="text-xs text-blue-500 font-medium mb-1.5 px-2 py-0.5 bg-blue-50 rounded-lg">
                          High Priority: {activeCases.filter(c => c.status === 'active').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-50 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3B82F6] flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <MoreVertical className="w-5 h-5 text-gray-300 cursor-pointer" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium mb-1">Appointments</h3>
                      <div className="flex items-end gap-2">
                        <h2 className="text-3xl font-bold text-gray-800">{dashboardData.stats.consultations_this_month}</h2>
                        <span className="text-xs text-purple-500 font-medium mb-1.5">
                          This Month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule and Messages */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Today's Schedule Card */}
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-none border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-[#131313]">Today's Schedule</h2>
                        {(() => {
                          const todayStr = format(new Date(), 'yyyy-MM-dd');
                          const todayItems = [
                            ...(dashboardData.upcoming_hearings || []).map(h => ({ ...h, sessionType: 'HEARING' })),
                            ...(events || []).map(e => ({ ...e, date: (e.date || e.start_time?.split('T')[0]), sessionType: 'EVENT', case: e.title, court: e.description || e.type }))
                          ].filter(item => item.date === todayStr);

                          return (
                            <p className="text-gray-400 text-sm">
                              {todayItems.length} items scheduled
                            </p>
                          );
                        })()}
                      </div>
                      <Button variant="ghost" className="rounded-full w-10 h-10 p-0"><MoreVertical className="w-5 h-5" /></Button>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const todayStr = format(new Date(), 'yyyy-MM-dd');
                        const todayItems = [
                          ...(dashboardData.upcoming_hearings || []).map(h => ({ ...h, sessionType: 'HEARING' })),
                          ...(events || []).map(e => ({ ...e, date: (e.date || e.start_time?.split('T')[0]), sessionType: 'EVENT', case: e.title, court: e.description || e.type })),
                          ...(bookings || []).filter(b => b.status === 'confirmed').map(b => ({
                            ...b,
                            sessionType: 'CONSULTATION',
                            case: b.description || 'Legal Consultation',
                            court: b.consultation_type === 'video' ? 'Video Call' : (b.consultation_type === 'audio' ? 'Audio Call' : 'In-Person')
                          }))
                        ].filter(item => item.date === todayStr)
                          .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

                        return todayItems.length > 0 ? (
                          todayItems.map((session, idx) => (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={idx}
                              className={`flex items-center p-4 rounded-3xl transition-all duration-300 ${idx === 0 ? 'bg-[#1C1C1E] text-white' : 'bg-white text-gray-800 border border-gray-100'
                                } hover:scale-[1.02]`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mr-4 ${idx === 0 ? 'bg-[#191970] text-white' : 'bg-gray-50 text-[#1C1C1E]'}`}>
                                {session.time?.split(':')[0] || '12'}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg ${idx === 0 ? 'text-white' : 'text-[#131313]'}`}>{session.case}</h4>
                                <p className={`text-sm ${idx === 0 ? 'text-gray-400' : 'text-gray-500'}`}>{session.court} • {session.sessionType}</p>
                              </div>
                              {idx === 0 && (
                                <Button onClick={() => { setSelectedSession(session); setShowSessionModal(true); }} className="rounded-xl px-6 bg-white text-black hover:bg-gray-200">View</Button>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div className="h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                            <Users className="w-8 h-8 mb-2 opacity-50" />
                            No items scheduled for today.
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Appointment Timeline View */}
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-blue-50 flex-1 min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Appointment</h2>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          {format(new Date(), 'dd MMMM yyyy')}
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          Today
                        </p>
                      </div>
                      <div className="flex bg-gray-50 p-1 rounded-xl">
                        <button className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white shadow-sm text-gray-800">Day</button>
                        <button className="px-4 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-gray-600">Week</button>
                        <button className="px-4 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-gray-600">Month</button>
                      </div>
                      <Button className="bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs px-4 h-9">
                        + Add New
                      </Button>
                    </div>

                    {/* Timeline Content */}
                    <div className="relative">
                      {/* Time Markers */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-300 font-medium py-2">
                        {['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm'].map(t => <div key={t}>{t}</div>)}
                      </div>

                      {/* Events Grid */}
                      <div className="ml-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Dynamic Events Mapping */}
                        {(() => {
                          // Dummy timeline slots for visual representation if no real data
                          const dummyEvents = [
                            { title: 'Darlene Robertson', role: 'Family Therapist', time: '09:00 am - 10:00 am', col: 0, color: 'bg-blue-50 border-blue-100 text-[#3B82F6]' },
                            { title: 'Ronald Richards', role: 'Psychiatrist', time: '10:00 am - 11:30 am', col: 1, color: 'bg-purple-50 border-purple-100 text-purple-600' },
                            { title: 'Court Hearing', role: 'High Court', time: '01:00 pm - 02:00 pm', col: 2, color: 'bg-amber-50 border-amber-100 text-amber-600' },
                            { title: 'Cody Fisher', role: 'Consultation', time: '11:00 am - 12:00 pm', col: 0, color: 'bg-green-50 border-green-100 text-green-600' },
                            { title: 'Esther Howard', role: 'Follow-up', time: '02:00 pm - 03:00 pm', col: 3, color: 'bg-pink-50 border-pink-100 text-pink-600' }
                          ];

                          // Attempt to map real active bookings to this structure
                          const realEvents = [...(bookings || []), ...(dashboardData.upcoming_hearings || [])].slice(0, 5).map((e, idx) => ({
                            title: e.client_name || e.title || 'Client Meeting',
                            role: e.case_type || 'Consultation',
                            time: e.time || '10:00 am - 11:00 am',
                            col: idx % 4,
                            color: ['bg-blue-50 border-blue-100 text-[#3B82F6]', 'bg-purple-50 border-purple-100 text-purple-600', 'bg-amber-50 border-amber-100 text-amber-600'][idx % 3]
                          }));

                          const eventsToRender = realEvents.length > 0 ? realEvents : dummyEvents;

                          return eventsToRender.map((event, i) => (
                            <div key={i} className={`p-4 rounded-2xl border-l-[3px] ${event.color.replace('text', 'border')} ${event.color} bg-opacity-50`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                                  {event.title[0]}
                                </div>
                                <div className="text-xs text-gray-500">{event.role}</div>
                              </div>
                              <h4 className="font-bold text-gray-800 text-sm mb-1">{event.title}</h4>
                              <p className="text-[10px] text-gray-400">{event.time}</p>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Current Time Line */}
                      <div className="absolute left-12 right-0 top-1/3 h-px bg-[#3B82F6] z-10 hidden md:block">
                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#3B82F6] ring-4 ring-blue-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cases Tab - Dark Theme */}
            {activeTab === 'cases' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-[#131313]">Case Management</h1>
                    <p className="text-gray-500">Track your active cases, clients, and legal proceedings.</p>
                  </div>
                  <Button
                    onClick={() => setShowCaseModal(true)}
                    className="bg-[#131313] hover:bg-black text-white rounded-xl px-6 py-6 shadow-lg"
                  >
                    + New Case
                  </Button>
                </div>

                {/* Bento Stats for Cases */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-[#F5F5F0] text-[#1C1C1E] rounded-2xl flex items-center justify-center shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-[#1C1C1E]">{activeCases.length}</h3>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Cases</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#191970] rounded-[2rem] p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white">{activeCases.filter(c => c.status === 'active').length}</h3>
                        <p className="text-xs text-white/60 uppercase font-bold tracking-wider">Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-[#F5F5F0] text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-[#1C1C1E]">{activeCases.filter(c => c.status === 'pending').length}</h3>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pending</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4 relative z-10">
                      <div className="w-12 h-12 bg-[#F5F5F0] text-gray-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Archive className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-[#1C1C1E]">{activeCases.filter(c => c.status === 'closed').length}</h3>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search cases, clients..."
                      className="pl-10 bg-white border-gray-200 rounded-xl text-[#0F2944] placeholder-gray-400 focus:ring-2 focus:ring-[#0F2944]/20"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl">
                      <span className="mr-2">⚙️</span> Filter
                    </Button>
                    <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20">
                      <option>Sort by Date</option>
                    </select>
                  </div>
                </div>

                {/* Cases Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case Details</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCases.length > 0 ? (
                        activeCases.map((caseItem) => (
                          <tr key={caseItem.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-[#0F2944]">{caseItem.title}</p>
                              <p className="text-sm text-gray-500">👤 {caseItem.client_name || 'Unknown'}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.case_type || 'General'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(caseItem.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${caseItem.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' :
                                caseItem.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                  'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-gray-400 hover:text-[#0F2944] transition-colors">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No active cases found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Calendar Tab - New Revamped View */}
            {activeTab === 'calendar' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <CalendarView
                  events={[
                    ...events.map(e => ({
                      ...e,
                      start_time: e.start_time,
                      end_time: e.end_time,
                      color: 'blue',
                      sessionType: 'EVENT'
                    })),
                    ...(dashboardData.upcoming_hearings || []).map(h => ({
                      ...h,
                      id: h.id,
                      title: h.case_name || h.title,
                      start_time: h.date ? `${h.date}T${h.time || '10:00'}` : new Date().toISOString(),
                      type: 'hearing',
                      color: 'amber',
                      sessionType: 'HEARING'
                    })),
                    ...bookings.filter(b => b.status === 'confirmed').map(b => ({
                      ...b,
                      id: b.id,
                      title: b.client_name || 'Consultation',
                      start_time: `${b.date}T${b.time}`,
                      type: b.consultation_type,
                      color: 'purple',
                      sessionType: 'CONSULTATION',
                      case: b.description || 'Legal Consultation'
                    }))
                  ]}
                  onAddEvent={() => setShowEventModal(true)}
                  onEventClick={(event) => {
                    setSelectedSession(event);
                    setShowSessionModal(true);
                  }}
                  user={user}
                />
              </motion.div>
            )}

            {/* Messages Tab */}
            {
              activeTab === 'messages' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-[#0F2944]">Messages</h1>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          End-to-End Encrypted
                        </span>
                      </div>
                      <p className="text-gray-500">Secure communication with your clients</p>
                    </div>
                    <Button className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl px-6 shadow-lg shadow-blue-900/20">
                      + New Message
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Conversations List */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input placeholder="Search conversations..." className="pl-10 bg-gray-50 border-gray-200 rounded-xl text-[#0F2944] placeholder-gray-400 focus:ring-2 focus:ring-[#0F2944]/20" />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        {messages.length > 0 ? (
                          messages.map((chat, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectChat(chat)}
                              className={`flex items-center space-x-3 p-4 cursor-pointer transition-all ${selectedChat?.other_user_id === chat.other_user_id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }`}>
                              <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 ${chat.avatar ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} rounded-full flex items-center justify-center shadow-sm`}>
                                  <span className="font-bold">{chat.avatar || '?'}</span>
                                </div>
                                {chat.online && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-[#0F2944] truncate">{chat.name}</h4>
                                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.message}</p>
                              </div>
                              {chat.unread > 0 && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            No messages yet.
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Chat Window */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                      {selectedChat ? (
                        <>
                          {/* Chat Header */}
                          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                  <span className="font-bold">{selectedChat.avatar || '?'}</span>
                                </div>
                                {selectedChat.online && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-[#0F2944]">{selectedChat.name}</p>
                                <p className="text-xs text-green-600">Online</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            <div className="flex items-center justify-center">
                              <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">Today</span>
                            </div>

                            {chatHistory.map((msg, idx) => (
                              <div key={idx} className={`flex items-start space-x-3 ${msg.sender_id === user.id ? 'justify-end' : ''}`}>
                                {msg.sender_id !== user.id && (
                                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold">{selectedChat.avatar || '?'}</span>
                                  </div>
                                )}
                                <div className={`max-w-[70%] ${msg.sender_id === user.id ? 'text-right' : ''}`}>
                                  <div className={`p-4 shadow-sm rounded-2xl ${msg.sender_id === user.id
                                    ? 'bg-[#0F2944] text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-[#0F2944] rounded-tl-none'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Message Input */}
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                              <button type="button" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors pointer shadow-sm">
                                <span className="text-xl">📎</span>
                              </button>
                              <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-white text-gray-900 border-gray-200 rounded-full px-5"
                              />
                              <Button type="submit" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center">
                                <span className="text-xl">➤</span>
                              </Button>
                            </form>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                          <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Select a conversation</p>
                          <p className="text-sm">Choose a chat from the list to start messaging</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            }

            {/* Documents Tab */}
            {
              activeTab === 'documents' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-[#0F2944]">Document Management</h1>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          End-to-End Encrypted
                        </span>
                      </div>
                      <p className="text-green-600 flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 "></span>
                        Secure encrypted vault
                      </p>
                    </div>
                    {!hasUploadPermission ?
                      <Button
                        onClick={() => {
                          setHasUploadPermission(true);
                          toast.success("Access granted! You can now upload documents.");
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 shadow-lg shadow-amber-900/20 flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Grant Upload Access</span>
                      </Button>
                      :
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          id="doc-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button
                          onClick={() => document.getElementById('doc-upload').click()}
                          className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl px-6 shadow-lg shadow-blue-900/20"
                          disabled={loading}
                        >
                          {loading ? 'Uploading...' : 'Confirm & Upload'}
                        </Button>
                        <button
                          onClick={() => setHasUploadPermission(false)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Revoke Access
                        </button>
                      </div>
                    }
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Total Documents</p>
                          <h3 className="text-3xl font-bold text-[#0F2944]">{documents.length || 0}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                          <span className="text-2xl">💾</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Storage Used</p>
                          <h3 className="text-3xl font-bold text-[#0F2944]">0.0 GB</h3>
                          <p className="text-xs text-gray-400">/ 50 GB</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Recent Uploads</p>
                          <h3 className="text-3xl font-bold text-[#0F2944]">0</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Name</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Associated Case</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.length > 0 ? (
                          documents.map((doc, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                              <td className="px-6 py-4 flex items-center space-x-2">
                                <FileText className={`w-5 h-5 ${doc.file_type?.includes('pdf') ? 'text-red-500' : 'text-blue-500'}`} />
                                <a href={`${API.replace('/api', '')}${doc.file_url}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[#0F2944] hover:text-blue-600 transition-colors">
                                  {doc.title}
                                </a>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{doc.case_id || 'Unassigned'}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase border border-gray-200">
                                  {doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'MMM d, yyyy') : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {doc.file_size ? (doc.file_size / 1024).toFixed(1) + ' KB' : '---'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedDocForShare(doc);
                                      setShowShareModal(true);
                                    }}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                                    title="Share Document"
                                  >
                                    <Share2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                    title="Delete Document"
                                  >
                                    <Archive className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              No documents found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            }

            {/* Lawyer Network Tab */}
            {
              activeTab === 'network' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-[#0F2944]">Lawyer Network</h1>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          State Bar Association: {user?.state || 'Verified'}
                        </span>
                      </div>
                      <p className="text-gray-500">Connect with fellow legal professionals in your jurisdiction</p>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0F2944] rounded-full flex items-center justify-center text-white">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0F2944]">{user?.state || 'General'} State Network</h3>
                          <p className="text-xs text-gray-500">{loading ? 'Connecting...' : 'Online'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                      {networkChat.length > 0 ? (
                        networkChat.map((msg, idx) => {
                          const isMe = msg.sender_id === user?.id;
                          return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className="flex items-center space-x-2 mb-1">
                                  {!isMe && <span className="text-xs font-bold text-gray-900">{msg.sender_name}</span>}
                                  <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`p-3 rounded-2xl shadow-sm ${isMe
                                  ? 'bg-[#0F2944] text-white rounded-br-none'
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                  }`}>
                                  <p className="text-sm">{msg.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                          <p>No messages yet. Start the discussion!</p>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                      <form onSubmit={handleSendNetworkMessage} className="flex space-x-4">
                        <Input
                          value={newNetworkMessage}
                          onChange={(e) => setNewNetworkMessage(e.target.value)}
                          placeholder={`Message ${user?.state || ''} Network...`}
                          className="flex-1 bg-white text-gray-900 border-gray-200"
                        />
                        <Button type="submit" className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white">
                          Send
                        </Button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )
            }


            {/* Earnings Tab */}
            {
              activeTab === 'earnings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-[#0F2944] mb-2">Earnings & Billing</h1>
                      <p className="text-gray-500">Track your income and manage your finances</p>
                    </div>
                    <Button className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl px-6 shadow-lg shadow-blue-900/20">
                      Generate Report
                    </Button>
                  </div>

                  {/* Revenue Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                      <p className="text-sm text-gray-500 mb-2 relative z-10 uppercase tracking-wider">Total Revenue</p>
                      <h3 className="text-4xl font-bold text-[#0F2944] relative z-10">₹{dashboardData.stats.revenue?.toLocaleString() || '0'}</h3>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
                      <p className="text-sm text-gray-500 mb-2 relative z-10 uppercase tracking-wider">This Month</p>
                      <h3 className="text-4xl font-bold text-[#0F2944] relative z-10">₹0.00</h3>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-6 relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-50"></div>
                      <p className="text-sm text-gray-500 mb-2 relative z-10 uppercase tracking-wider">Pending Payments</p>
                      <h3 className="text-4xl font-bold text-[#0F2944] relative z-10">₹0.00</h3>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-[#0F2944]">Billing History</h2>
                    </div>

                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice ID</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.length > 0 ? (
                          billingHistory.map((bill, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                              <td className="px-6 py-4 font-medium text-[#0F2944]">{bill.invoice}</td>
                              <td className="px-6 py-4 text-[#0F2944]">{bill.client}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{bill.case}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{bill.date}</td>
                              <td className="px-6 py-4 font-semibold text-[#0F2944]">{bill.amount}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  bill.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    'bg-red-100 text-red-700 border border-red-200'
                                  }`}>
                                  {bill.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              No billing history found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            }


            {/* New Case Modal */}
            {
              showCaseModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-[#0F2944]">Create New Case</h3>
                      <button onClick={() => setShowCaseModal(false)} className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </div>
                    <form onSubmit={handleCreateCase} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
                        <Input
                          value={newCaseData.title}
                          onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })}
                          placeholder="e.g. Smith vs Jones"
                          className="text-gray-900 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                          <Input
                            required
                            value={newCaseData.client_name}
                            onChange={(e) => setNewCaseData({ ...newCaseData, client_name: e.target.value })}
                            placeholder="Client Name"
                            className="text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                          <select
                            className="w-full rounded-xl border border-gray-200 p-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCaseData.case_type}
                            onChange={(e) => setNewCaseData({ ...newCaseData, case_type: e.target.value })}
                          >
                            <option value="">Select Type</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Civil">Civil</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Family">Family</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Court / Stage</label>
                        <Input
                          value={newCaseData.court}
                          onChange={(e) => setNewCaseData({ ...newCaseData, court: e.target.value })}
                          placeholder="e.g. High Court / Filing"
                          className="text-gray-900 bg-white"
                        />
                      </div>
                      <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={() => setShowCaseModal(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</Button>
                        <Button type="submit" className="bg-[#0F2944] text-white hover:bg-[#0F2944]/90">Create Case</Button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )
            }

            {/* Delete Confirmation Modal */}
            {docToDelete && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
                >
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Document?</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Are you sure you want to delete <span className="font-semibold text-gray-700">"{docToDelete.title}"</span>? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setDocToDelete(null)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={confirmDeleteDocument}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg shadow-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Add Event Modal */}
            {
              showEventModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-[#0F2944]">Add to Calendar</h3>
                      <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </div>
                    <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <Input
                          required
                          value={newEventData.title}
                          onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                          placeholder="e.g. Meeting with Associate"
                          className="text-gray-900 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            className="w-full rounded-xl border border-gray-200 p-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newEventData.type}
                            onChange={(e) => setNewEventData({ ...newEventData, type: e.target.value })}
                          >
                            <option value="meeting">Meeting</option>
                            <option value="personal">Personal</option>
                            <option value="hearing">Hearing</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <Input
                            type="datetime-local"
                            required
                            value={newEventData.start_time}
                            onChange={(e) => setNewEventData({ ...newEventData, start_time: e.target.value })}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <Input
                            type="datetime-local"
                            required
                            value={newEventData.end_time}
                            onChange={(e) => setNewEventData({ ...newEventData, end_time: e.target.value })}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          className="w-full rounded-xl border border-gray-200 p-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          value={newEventData.description}
                          onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                        ></textarea>
                      </div>
                      <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={() => setShowEventModal(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</Button>
                        <Button type="submit" className="bg-[#0F2944] text-white hover:bg-[#0F2944]/90">Add Event</Button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )
            }

            {/* Reschedule Booking Modal */}
            {
              showRescheduleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-[#0F2944]">Reschedule Consultation</h3>
                      <button onClick={() => setShowRescheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-600">Propose a new date and time for this consultation.</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                        <Input
                          type="date"
                          required
                          value={rescheduleData.date}
                          onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                          className="text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                        <Input
                          type="time"
                          required
                          value={rescheduleData.time}
                          onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                          className="text-gray-900 bg-white"
                        />
                      </div>
                      <div className="pt-4 flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setShowRescheduleModal(false)} className="border-gray-300 text-gray-700">Cancel</Button>
                        <Button onClick={handleRescheduleBooking} className="bg-amber-500 text-white hover:bg-amber-600">Confirm Reschedule</Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )
            }

            {/* Share Document Modal */}
            {
              showShareModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="text-xl font-bold text-[#0F2944]">Share Document</h3>
                        <p className="text-xs text-gray-500 mt-1">Sharing: {selectedDocForShare?.title}</p>
                      </div>
                      <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Search client name..."
                          value={shareSearchQuery}
                          onChange={(e) => setShareSearchQuery(e.target.value)}
                          className="pl-10 text-gray-900 bg-white"
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                        {cases
                          .filter(c => c.client_name.toLowerCase().includes(shareSearchQuery.toLowerCase()))
                          .map((c, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group"
                              onClick={() => handleShareDocument(c.user_id)} // Sharing with client user ID
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                  {c.client_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#0F2944] group-hover:text-blue-700">{c.client_name}</p>
                                  <p className="text-xs text-gray-500">{c.title}</p>
                                </div>
                              </div>
                              <Button size="sm" className="bg-[#0F2944] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                Share
                              </Button>
                            </div>
                          ))}
                        {cases.length === 0 && (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            No active cases or clients found.
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button variant="outline" onClick={() => setShowShareModal(false)} className="border-gray-300 text-gray-700">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )
            }

            {/* Session Details Modal */}
            {showSessionModal && selectedSession && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedSession.sessionType}</h3>
                        <p className="text-sm text-gray-500">{format(parseISO(selectedSession.date), 'MMMM d, yyyy')} • {selectedSession.time}</p>
                      </div>
                      <button onClick={() => setShowSessionModal(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-1">{selectedSession.case}</h4>
                        <p className="text-sm text-gray-600">{selectedSession.description || 'No description provided'}</p>
                      </div>

                      {selectedSession.sessionType === 'CONSULTATION' && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-gray-700">
                            <User className="w-5 h-5 text-blue-600" />
                            <span>Client: {selectedSession.client_name || 'Client Name'}</span>
                          </div>

                          {selectedSession.consultation_type === 'video' && (
                            <div className="pt-2">
                              <a
                                href={selectedSession.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors font-medium"
                              >
                                <Video className="w-5 h-5" />
                                <span>Join Google Meet</span>
                              </a>
                            </div>
                          )}

                          {selectedSession.consultation_type === 'audio' && (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <Phone className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-green-900">Audio Call Number</span>
                              </div>
                              <p className="text-2xl font-bold text-green-700 tracking-wider font-mono select-all">
                                {selectedSession.location || '831216968'}
                              </p>
                            </div>
                          )}

                          {selectedSession.consultation_type === 'in_person' && (
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <MapPin className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-purple-900">Meeting Location</span>
                              </div>
                              <p className="text-purple-800 font-medium">
                                {selectedSession.location || 'Office Address Pending'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedSession.sessionType !== 'CONSULTATION' && (
                        <p className="text-gray-600">
                          {selectedSession.court || selectedSession.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button variant="outline" onClick={() => setShowSessionModal(false)}>Close</Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

          </div>

          {/* Right Sidebar - Calendar & Activity */}
          {activeTab === 'dashboard' && (
            <aside className="w-80 bg-white/50 backdrop-blur-sm border-l border-white/20 p-6 flex flex-col gap-8 overflow-y-auto hidden xl:flex">
              {/* Mini Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">Calendar</h3>
                  <button className="text-xs text-[#3B82F6] font-medium hover:underline">See All</button>
                </div>
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm">{format(currentMonth, 'MMMM yyyy')}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-medium mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {eachDayOfInterval({
                      start: startOfWeek(startOfMonth(currentMonth)),
                      end: endOfWeek(endOfMonth(currentMonth))
                    }).map((day, idx) => {
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(day)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/30' :
                            !isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Activity Stats (Dummy) */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Activity</h3>
                <div className="bg-[#3B82F6] rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-blue-100 text-xs mb-1">Weekly Progress</p>
                        <h4 className="text-2xl font-bold">Excellent</h4>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-blue-100">Client Satisfaction</span>
                          <span className="font-bold">92%</span>
                        </div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-white rounded-full" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-blue-100">Case Efficiency</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative Circles */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                  <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-400/30 rounded-full blur-xl" />
                </div>
              </div>

              {/* Upcoming Hearings List (Simplified) */}
              <div className="flex-1 overflow-auto no-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">Upcoming hearings</h3>
                </div>
                <div className="space-y-3">
                  {(dashboardData.upcoming_hearings || []).slice(0, 3).map((hearing, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        {format(new Date(hearing.date), 'dd')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate">{hearing.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{hearing.time} • {hearing.court}</p>
                      </div>
                    </div>
                  ))}
                  {(dashboardData.upcoming_hearings || []).length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-4">No hearings scheduled</p>
                  )}
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
