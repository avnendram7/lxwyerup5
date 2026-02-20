import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Scale,
  LogOut,
  LayoutDashboard,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  Search,
  MoreVertical,
  User,
  Clock,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  Archive,
  Shield,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Share2,
  Sun,
  Moon,
  Bell,
  Maximize2,
  Minimize2,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import axios from "axios";
import { API } from "../App";
import CalendarView from "../components/dashboard/CalendarView";
import ParticleBackground from "../components/ParticleBackground";

// New Components
import StatCard from "../components/dashboard/lawyer/StatCard";
import AnalyticsChart from "../components/dashboard/lawyer/AnalyticsChart";
import DemographicsChart from "../components/dashboard/lawyer/DemographicsChart";
import RecentActivityTable from "../components/dashboard/lawyer/RecentActivityTable";
import PendingAppointmentsModal from "../components/dashboard/lawyer/PendingAppointmentsModal";
import LawyerProfileModal from "../components/dashboard/lawyer/LawyerProfileModal";
import LxwyerNetwork from "../components/dashboard/lawyer/LxwyerNetwork";
import CasesView from "../components/dashboard/lawyer/CasesView";

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cases, setCases] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // Theme State
  const [darkMode, setDarkMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(
          `Error attempting to enable full-screen mode: ${e.message} (${e.name})`,
        );
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const token = sessionStorage.getItem("token");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [dashboardData, setDashboardData] = useState({
    stats: {
      active_cases: 0,
      total_clients: 0,
      consultations_this_month: 0,
      revenue: 0,
    },
    upcoming_hearings: [],
    recent_clients: [],
  });

  const [showPendingModal, setShowPendingModal] = useState(false);
  const pendingBookings = bookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "requested" ||
      (b.payment_status === "paid" && !b.status),
  );

  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] =
    useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  // New Case State
  const [newCaseData, setNewCaseData] = useState({
    title: "",
    client_name: "",
    case_type: "",
    court: "",
    status: "active",
  });

  // New Event State
  const [newEventData, setNewEventData] = useState({
    title: "",
    type: "meeting",
    start_time: "",
    end_time: "",
    description: "",
  });

  // Sharing State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocForShare, setSelectedDocForShare] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [hasUploadPermission, setHasUploadPermission] = useState(false);

  // Deletion State
  const [docToDelete, setDocToDelete] = useState(null);

  // Session View Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Fallbacks to prevent crashes while features are being built
  const [documents, setDocuments] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);

  // Use fetched cases or empty array
  const activeCases = cases || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchData();
    }
  }, [fetchData]);

  const fetchData = useCallback(async () => {
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
      fetchSafe("cases", `${API}/cases`, setCases),
      fetchSafe("bookings", `${API}/bookings`, setBookings),
      fetchSafe("dashboard", `${API}/dashboard/lawyer`, setDashboardData),
      fetchSafe("messages", `${API}/messages/recents`, setMessages),
      fetchSafe("events", `${API}/events`, (data) => setEvents(data || [])),
      fetchSafe("notifications", `${API}/notifications`, setNotifications),
      fetchSafe("documents", `${API}/documents`, setDocuments),
      fetchSafe("billing", `${API}/billing/history`, setBillingHistory),
    ]);

    const failures = results.filter((r) => !r.success);
    if (failures.length === results.length) {
      toast.error("Dashboard failed to load. Please check your connection.");
    } else if (failures.length > 0) {
      const failedNames = failures.map((f) => f.name).join(", ");
      console.warn(`Partial load failure: ${failedNames}`);
      // Don't spam toasts for minor failures if some data loaded
      if (failures.find((f) => f.name === "dashboard" || f.name === "cases")) {
        toast.error(`Some critical data failed to load: ${failedNames}`);
      }
    }
  }, [token]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const response = await axios.post(`${API}/lawyers/me/photo`, formData, {
        headers,
      });

      // Update local user state with new photo
      const updatedUser = { ...user, photo: response.data.photo_url };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist to storage

      toast.success("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await axios.patch(
        `${API}/bookings/${bookingId}/status`,
        { status: "confirmed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Booking confirmed!");
      fetchData();
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept booking");
    }
  };

  const handleCancelBooking = async (bookingId, reason = "") => {
    try {
      await axios.patch(
        `${API}/bookings/${bookingId}/cancel`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Booking cancelled");
      fetchData();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleRescheduleBooking = async () => {
    if (
      !selectedBookingForReschedule ||
      !rescheduleData.date ||
      !rescheduleData.time
    )
      return;
    try {
      await axios.patch(
        `${API}/bookings/${selectedBookingForReschedule.id}/reschedule`,
        rescheduleData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
      await axios.patch(
        `${API}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    // Optional: formData.append('case_id', 'some_id');

    setLoading(true);
    console.log("Starting document upload for:", file.name);

    try {
      await axios.post(`${API}/documents/upload`, formData, {
        timeout: 45000, // 45 seconds timeout
        headers: {
          Authorization: `Bearer ${token}`,
          // Let Axios handle Content-Type boundary for multipart/form-data
        },
      });
      toast.success("Document uploaded successfully!");
      fetchData();
    } catch (error) {
      console.error("Error uploading document:", error);
      const msg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to upload document";
      toast.error(msg);
      if (error.code === "ECONNABORTED") {
        toast.error("Upload timed out. Is the file too large?");
      }
    } finally {
      setLoading(false);
      // Reset the file input so the same file can be selected again if needed
      e.target.value = null;
    }
  };

  const handleDeleteDocument = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    setDocToDelete(doc);
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;

    try {
      await axios.delete(`${API}/documents/${docToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments((prev) => prev.filter((doc) => doc.id !== docToDelete.id));
      toast.success("Document deleted successfully");
      setDocToDelete(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleShareDocument = async (clientId) => {
    if (!selectedDocForShare) return;

    const formData = new FormData();
    formData.append("client_id", clientId);

    setLoading(true);
    try {
      await axios.post(
        `${API}/documents/${selectedDocForShare.id}/share`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
      await axios.patch(
        `${API}/bookings/${bookingId}/status?status=${status}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
        headers: { Authorization: `Bearer ${token}` },
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
      await axios.post(
        `${API}/events`,
        {
          ...newEventData,
          start_time: new Date(newEventData.start_time).toISOString(),
          end_time: new Date(newEventData.end_time).toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatHistory(res.data);
    } catch (error) {
      toast.error("Failed to load chat history");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await axios.post(
        `${API}/messages`,
        {
          receiver_id: selectedChat.other_user_id,
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNewMessage("");
      // Refresh chat (optimistic update or re-fetch)
      const res = await axios.get(
        `${API}/messages/${selectedChat.other_user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setChatHistory(res.data);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "cases", icon: FileText, label: "Cases" },
    { id: "calendar", icon: CalendarIcon, label: "Calendar" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "network", icon: Users, label: "Lxwyer Network" },
    { id: "paralegal", icon: Bot, label: "Lxwyer Paralegal AI" },
    { id: "earnings", icon: TrendingUp, label: "Earnings" },
  ];

  return (
    <div
      className={`min-h-screen ${isFullScreen ? "p-0 block" : "p-4 md:p-8 flex items-center justify-center"} font-sans transition-all duration-300 relative overflow-hidden ${darkMode ? "bg-black text-gray-100" : "bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0F2FE] text-[#1F2937]"}`}
    >
      {!isFullScreen && <ParticleBackground darkMode={darkMode} />}

      {/* Profile Modal */}
      {showProfileModal && (
        <LawyerProfileModal
          user={user}
          darkMode={darkMode}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          onImageUpdate={handleImageUpload}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${isFullScreen ? "w-screen h-screen rounded-none border-0 fixed inset-0" : "w-full max-w-[1440px] h-[90vh] rounded-[2.5rem] border relative"} ${darkMode ? "bg-[#0f1012] border-gray-800" : "bg-white border-white"} shadow-2xl overflow-hidden flex z-10 transition-all duration-300`}
      >
        {/* Left Sidebar - Narrow Pill */}
        <aside
          className={`w-24 flex flex-col items-center py-8 border-r z-10 relative transition-colors duration-300 ${darkMode ? "border-white/5 bg-black/40 backdrop-blur-md" : "border-white/20 bg-white/30 backdrop-blur-md"}`}
        >
          {/* Logo */}
          <div className="mb-12 relative group cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#0EA5E9] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <Scale className="w-7 h-7 text-white relative z-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
          </div>

          {/* Navigation Line */}


          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col items-center space-y-4 w-full overflow-y-auto no-scrollbar py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    relative w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center group
                    ${isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 ring-4 ring-blue-500/20"
                      : darkMode
                        ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 shadow-sm border border-white/5"
                        : "bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm border border-slate-100"
                    }
                  `}
                  title={item.label}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "animate-pulse" : ""}`}
                  />

                  {/* Tooltip (Custom) */}
                  <div
                    className={`absolute left-full ml-4 px-3 py-1 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border ${darkMode ? "bg-gray-800 text-white border-white/10" : "bg-slate-800 text-white border-slate-700"}`}
                  >
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle & User Profile (Bottom) */}
          <div className="mt-auto flex flex-col items-center gap-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm group ${darkMode
                ? "bg-white/5 border border-white/5 text-yellow-400 hover:bg-yellow-400/10"
                : "bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 transition-transform group-hover:rotate-90" />
              ) : (
                <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
              )}
            </button>

            <div
              className={`relative group p-1 rounded-full shadow-sm border ${darkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-100"}`}
            >
              <div
                onClick={() => setShowProfileModal(true)}
                className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all border-2 ${darkMode ? "bg-gray-800 border-transparent" : "bg-slate-200 border-white"}`}
                title="View Profile"
              >
                {user?.photo && !imgError ? (
                  <img
                    src={
                      user.photo.startsWith("http") ||
                        user.photo.startsWith("data:")
                        ? user.photo
                        : `http://localhost:8000${user.photo}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (!imgError) {
                        setImgError(true);
                        e.target.src = `https://ui-avatars.com/api/?name=${user.full_name || "User"}&background=random`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                    {user?.full_name?.[0] || "L"}
                  </div>
                )}
              </div>
            </div>
            {/* Removed Logout Button */}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Center Content */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            {/* Paralegal Tab */}
            {activeTab === "paralegal" && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 h-full">
                <div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group ${darkMode ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}
                  />
                  <Bot
                    className={`w-12 h-12 ${darkMode ? "text-indigo-400" : "text-indigo-600"} relative z-10`}
                  />
                </div>
                <h2
                  className={`text-3xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  Lxwyer Paralegal AI
                </h2>
                <p
                  className={`max-w-md mx-auto mb-8 text-lg font-medium leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Your AI-powered legal assistant is currently in development.
                  It will help you draft documents, research case law, and
                  manage your workflow efficiently.
                </p>
                <div
                  className={`px-8 py-3 rounded-full font-bold tracking-wider uppercase text-base border-2 ${darkMode ? "bg-white/10 border-indigo-400 text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.3)]" : "bg-indigo-50 border-indigo-400 text-indigo-600 shadow-lg"}`}
                >
                  Coming Soon
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Greeting Header & Actions */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1
                      className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {(() => {
                        const hour = new Date().getHours();
                        if (hour < 12) return "Good Morning";
                        if (hour < 18) return "Good Afternoon";
                        return "Good Evening";
                      })()}
                      , {user?.full_name?.split(" ")[0] || "Lawyer"} 👋
                    </h1>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Here's what's happening with your practice today.
                    </p>
                    {user?.unique_id && (
                      <div
                        className={`text-xs font-mono mt-1 ${darkMode ? "text-gray-500" : "text-slate-400"}`}
                      >
                        ID: {user.unique_id}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={toggleFullScreen}
                      className={`w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-sm border transition-all ${darkMode
                        ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                      {isFullScreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowPendingModal(true)}
                      className={`relative rounded-full h-12 px-4 shadow-sm border transition-all ${darkMode
                        ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <Bell className="w-5 h-5" />
                      <span className="ml-2 font-medium">New Appointments</span>
                      {pendingBookings.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                          {pendingBookings.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Clients"
                    value={dashboardData.stats.total_clients || "0"}
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600"
                    delay={0}
                    darkMode={darkMode}
                  />
                  <StatCard
                    title="Active Cases"
                    value={dashboardData.stats.active_cases || "0"}
                    icon={FileText}
                    colorClass="bg-red-50 text-red-600"
                    delay={0.1}
                    darkMode={darkMode}
                  />
                  <StatCard
                    title="Appointments"
                    value={dashboardData.stats.consultations_this_month || "0"}
                    icon={CalendarIcon}
                    colorClass="bg-cyan-50 text-cyan-500"
                    delay={0.2}
                    darkMode={darkMode}
                  />
                </div>

                {/* Row 2: Analytics & Cases */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[350px]">
                  <div className="lg:col-span-2 h-full">
                    <AnalyticsChart bookings={bookings} darkMode={darkMode} />
                  </div>
                  <div className="h-full">
                    <DemographicsChart cases={cases} darkMode={darkMode} />
                  </div>
                </div>

                {/* Row 3: Recent Activity */}
                <div className="grid grid-cols-1">
                  <div className="min-h-[300px]">
                    <RecentActivityTable
                      cases={cases.slice(0, 10)}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cases" && (
              <CasesView cases={cases} darkMode={darkMode} />
            )}

            {/* Calendar Tab - New Revamped View */}
            {activeTab === "calendar" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <CalendarView
                  events={[
                    ...events.map((e) => ({
                      ...e,
                      start_time: e.start_time || new Date().toISOString(),
                      end_time: e.end_time || new Date().toISOString(),
                      color: "blue",
                      sessionType: "EVENT",
                    })),
                    ...(dashboardData.upcoming_hearings || []).map((h) => ({
                      ...h,
                      id: h.id,
                      title: h.case_name || h.title,
                      start_time: h.date
                        ? `${h.date}T${h.time || "10:00"}`
                        : new Date().toISOString(),
                      type: "hearing",
                      color: "amber",
                      sessionType: "HEARING",
                    })),
                    ...bookings
                      .filter((b) => b.status === "confirmed")
                      .map((b) => ({
                        ...b,
                        id: b.id,
                        title: b.client_name || "Consultation",
                        start_time:
                          b.date && b.time
                            ? `${b.date}T${b.time}`
                            : b.start_time
                              ? new Date(b.start_time).toISOString()
                              : new Date().toISOString(),
                        type: b.consultation_type,
                        color: "purple",
                        sessionType: "CONSULTATION",
                        case: b.description || "Legal Consultation",
                      })),
                  ]}
                  onAddEvent={() => setShowEventModal(true)}
                  onEventClick={(event) => {
                    setSelectedSession(event);
                    setShowSessionModal(true);
                  }}
                  user={user}
                  darkMode={darkMode}
                />
              </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1
                        className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                      >
                        Messages
                      </h1>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center ${darkMode ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-100 text-green-700 border-green-200"}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        End-to-End Encrypted
                      </span>
                    </div>
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Secure communication with your clients
                    </p>
                  </div>
                  <Button
                    className={`${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#0F2944] hover:bg-[#0F2944]/90"} text-white rounded-xl px-6 shadow-lg`}
                  >
                    + New Message
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                  {/* Conversations List */}
                  <div
                    className={`rounded-2xl border overflow-hidden flex flex-col shadow-sm ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white border-gray-200"}`}
                  >
                    <div
                      className={`p-4 border-b ${darkMode ? "border-white/5" : "border-gray-100"}`}
                    >
                      <div className="relative">
                        <Search
                          className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        />
                        <Input
                          placeholder="Search conversations..."
                          className={`pl-10 rounded-xl focus:ring-2 ${darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:ring-blue-500/50" : "bg-gray-50 border-gray-200 text-[#0F2944] placeholder-gray-400 focus:ring-[#0F2944]/20"}`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {messages.length > 0 ? (
                        messages.map((chat, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectChat(chat)}
                            className={`flex items-center space-x-3 p-4 cursor-pointer transition-all ${selectedChat?.other_user_id === chat.other_user_id
                              ? darkMode
                                ? "bg-blue-600/10 border-l-4 border-blue-500"
                                : "bg-blue-50 border-l-4 border-blue-500"
                              : darkMode
                                ? "hover:bg-white/5 border-l-4 border-transparent"
                                : "hover:bg-gray-50 border-l-4 border-transparent"
                              }`}
                          >
                            <div className="relative flex-shrink-0">
                              <div
                                className={`w-12 h-12 ${chat.avatar ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600") : darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"} rounded-full flex items-center justify-center shadow-sm`}
                              >
                                <span className="font-bold">
                                  {chat.avatar || "?"}
                                </span>
                              </div>
                              {chat.online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`font-bold truncate ${darkMode ? "text-gray-200" : "text-[#0F2944]"}`}
                                >
                                  {chat.name}
                                </h4>
                                <span
                                  className={`text-xs whitespace-nowrap ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  {new Date(chat.timestamp).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                              <p
                                className={`text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {chat.message}
                              </p>
                            </div>
                            {chat.unread > 0 && (
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-white">
                                  {chat.unread}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div
                          className={`p-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                        >
                          No messages yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div
                    className={`lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col shadow-sm ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white border-gray-200"}`}
                  >
                    {selectedChat ? (
                      <>
                        {/* Chat Header */}
                        <div
                          className={`p-4 border-b flex items-center justify-between ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}
                              >
                                <span className="font-bold">
                                  {selectedChat.avatar || "?"}
                                </span>
                              </div>
                              {selectedChat.online && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                              )}
                            </div>
                            <div>
                              <p
                                className={`font-semibold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                              >
                                {selectedChat.name}
                              </p>
                              <p className="text-xs text-green-600">Online</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-sm ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                            >
                              <MoreVertical
                                className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Messages */}
                        <div
                          className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? "bg-black/20" : "bg-gray-50/30"}`}
                        >
                          <div className="flex items-center justify-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${darkMode ? "bg-white/10 text-gray-400" : "bg-gray-200 text-gray-600"}`}
                            >
                              Today
                            </span>
                          </div>

                          {chatHistory.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start space-x-3 ${msg.sender_id === user.id ? "justify-end" : ""}`}
                            >
                              {msg.sender_id !== user.id && (
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}
                                >
                                  <span className="text-sm font-bold">
                                    {selectedChat.avatar || "?"}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`max-w-[70%] ${msg.sender_id === user.id ? "text-right" : ""}`}
                              >
                                <div
                                  className={`p-4 shadow-sm rounded-2xl ${msg.sender_id === user.id
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : darkMode
                                      ? "bg-[#2a2a2a] text-gray-200 rounded-tl-none"
                                      : "bg-white border border-gray-200 text-[#0F2944] rounded-tl-none"
                                    }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(msg.timestamp).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Input */}
                        <div
                          className={`p-4 border-t ${darkMode ? "border-white/5 bg-[#1c1c1c]" : "border-gray-200 bg-white"}`}
                        >
                          <form
                            onSubmit={handleSendMessage}
                            className="flex items-center space-x-3"
                          >
                            <button
                              type="button"
                              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors pointer shadow-sm ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
                            >
                              <span className="text-xl">📎</span>
                            </button>
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your message..."
                              className={`flex-1 rounded-full px-5 ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900 border-gray-200"}`}
                            />
                            <Button
                              type="submit"
                              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center"
                            >
                              <span className="text-xl">➤</span>
                            </Button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div
                        className={`flex-1 flex flex-col items-center justify-center ${darkMode ? "text-gray-500 bg-white/5" : "text-gray-500 bg-gray-50/50"}`}
                      >
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">
                          Select a conversation
                        </p>
                        <p className="text-sm">
                          Choose a chat from the list to start messaging
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1
                        className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                      >
                        Document Management
                      </h1>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center ${darkMode ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-100 text-green-700 border-green-200"}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        End-to-End Encrypted
                      </span>
                    </div>
                    <p
                      className={`flex items-center text-sm ${darkMode ? "text-green-500" : "text-green-600"}`}
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 "></span>
                      Secure encrypted vault
                    </p>
                  </div>
                  {!hasUploadPermission ? (
                    <Button
                      onClick={() => {
                        setHasUploadPermission(true);
                        toast.success(
                          "Access granted! You can now upload documents.",
                        );
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 shadow-lg shadow-amber-900/20 flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Grant Upload Access</span>
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="doc-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        onClick={() =>
                          document.getElementById("doc-upload").click()
                        }
                        className={`${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-[#0F2944] hover:bg-[#0F2944]/90 text-white"} rounded-xl px-6 shadow-lg`}
                        disabled={loading}
                      >
                        {loading ? "Uploading..." : "Confirm & Upload"}
                      </Button>
                      <button
                        onClick={() => setHasUploadPermission(false)}
                        className={`text-xs transition-colors ${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}
                      >
                        Revoke Access
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div
                    className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white/70 border-white/50"}`}
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                    <div className="flex items-center space-x-3 relative z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}
                      >
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p
                          className={`text-xs uppercase mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Total Documents
                        </p>
                        <h3
                          className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                        >
                          {documents.length || 0}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white/70 border-white/50"}`}
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
                    <div className="flex items-center space-x-3 relative z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}
                      >
                        <span className="text-2xl">💾</span>
                      </div>
                      <div>
                        <p
                          className={`text-xs uppercase mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Storage Used
                        </p>
                        <h3
                          className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                        >
                          0.0 GB
                        </h3>
                        <p className="text-xs text-gray-400">/ 50 GB</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white/70 border-white/50"}`}
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
                    <div className="flex items-center space-x-3 relative z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 ${darkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"}`}
                      >
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p
                          className={`text-xs uppercase mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Recent Uploads
                        </p>
                        <h3
                          className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                        >
                          0
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Table */}
                <div
                  className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white border-gray-200"}`}
                >
                  <table className="w-full">
                    <thead
                      className={`border-b ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
                    >
                      <tr>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Document Name
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Associated Case
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Type
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Date
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Size
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length > 0 ? (
                        documents.map((doc, idx) => (
                          <tr
                            key={idx}
                            className={`border-b transition-all duration-200 ${darkMode ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                          >
                            <td className="px-6 py-4 flex items-center space-x-2">
                              <FileText
                                className={`w-5 h-5 ${doc.file_type?.includes("pdf") ? "text-red-500" : "text-blue-500"}`}
                              />
                              <a
                                href={`${API.replace("/api", "")}${doc.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-medium transition-colors ${darkMode ? "text-gray-200 hover:text-blue-400" : "text-[#0F2944] hover:text-blue-600"}`}
                              >
                                {doc.title}
                              </a>
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {doc.case_id || "Unassigned"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${darkMode ? "bg-white/10 text-gray-300 border-white/5" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                              >
                                {doc.file_type?.split("/")[1]?.toUpperCase() ||
                                  "FILE"}
                              </span>
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {doc.uploaded_at
                                ? format(
                                  new Date(doc.uploaded_at),
                                  "MMM d, yyyy",
                                )
                                : "N/A"}
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {doc.file_size
                                ? (doc.file_size / 1024).toFixed(1) + " KB"
                                : "---"}
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
                          <td
                            colSpan="6"
                            className={`px-6 py-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                          >
                            No documents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Lawyer Network Tab */}
            {/* Lawyer Network Tab */}
            {activeTab === "network" && (
              <div className="h-[calc(100vh-140px)]">
                <LxwyerNetwork currentUser={user} darkMode={darkMode} />
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1
                      className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      Earnings & Billing
                    </h1>
                    <p
                      className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Track your income and manage your finances
                    </p>
                  </div>
                  <Button
                    className={`${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-[#0F2944] hover:bg-[#0F2944]/90 text-white"} rounded-xl px-6 shadow-lg`}
                  >
                    Generate Report
                  </Button>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div
                    className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white/70 border-white/50"}`}
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                    <p
                      className={`text-sm mb-2 relative z-10 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Total Revenue
                    </p>
                    <h3
                      className={`text-4xl font-bold relative z-10 ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      ₹{dashboardData.stats.revenue?.toLocaleString() || "0"}
                    </h3>
                  </div>

                  <div
                    className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white/70 border-white/50"}`}
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
                    <p
                      className={`text-sm mb-2 relative z-10 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      This Month
                    </p>
                    <h3
                      className={`text-4xl font-bold relative z-10 ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      ₹0.00
                    </h3>
                  </div>

                  <div
                    className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white/70 border-white/50"}`}
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-50"></div>
                    <p
                      className={`text-sm mb-2 relative z-10 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Pending Payments
                    </p>
                    <h3
                      className={`text-4xl font-bold relative z-10 ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      ₹0.00
                    </h3>
                  </div>
                </div>

                {/* Billing History */}
                <div
                  className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white border-gray-200"}`}
                >
                  <div
                    className={`p-6 border-b ${darkMode ? "border-white/5" : "border-gray-100"}`}
                  >
                    <h2
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      Billing History
                    </h2>
                  </div>

                  <table className="w-full">
                    <thead
                      className={`border-b ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
                    >
                      <tr>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Invoice ID
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Client Name
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Case
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Date
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Amount
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.length > 0 ? (
                        billingHistory.map((bill, idx) => (
                          <tr
                            key={idx}
                            className={`border-b transition-all duration-200 ${darkMode ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                          >
                            <td
                              className={`px-6 py-4 font-medium ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                            >
                              {bill.invoice}
                            </td>
                            <td
                              className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-[#0F2944]"}`}
                            >
                              {bill.client}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {bill.case}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {bill.date}
                            </td>
                            <td
                              className={`px-6 py-4 font-semibold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                            >
                              {bill.amount}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === "Paid"
                                  ? darkMode
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-green-100 text-green-700 border border-green-200"
                                  : bill.status === "Pending"
                                    ? darkMode
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-amber-100 text-amber-700 border border-amber-200"
                                    : darkMode
                                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                      : "bg-red-100 text-red-700 border border-red-200"
                                  }`}
                              >
                                {bill.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className={`px-6 py-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                          >
                            No billing history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* New Case Modal */}
            {showCaseModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div
                    className={`p-6 border-b flex justify-between items-center ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}
                  >
                    <h3
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      Create New Case
                    </h3>
                    <button
                      onClick={() => setShowCaseModal(false)}
                      className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateCase} className="p-6 space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Case Title
                      </label>
                      <Input
                        value={newCaseData.title}
                        onChange={(e) =>
                          setNewCaseData({
                            ...newCaseData,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Smith vs Jones"
                        className={`${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900"}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Client Name
                        </label>
                        <Input
                          required
                          value={newCaseData.client_name}
                          onChange={(e) =>
                            setNewCaseData({
                              ...newCaseData,
                              client_name: e.target.value,
                            })
                          }
                          placeholder="Client Name"
                          className={`${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900"}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Case Type
                        </label>
                        <select
                          className={`w-full rounded-xl border p-2 focus:outline-none focus:ring-2 ${darkMode ? "bg-[#1c1c1c] border-white/10 text-white focus:ring-blue-500/50" : "border-gray-200 bg-white text-gray-900 focus:ring-blue-500"}`}
                          value={newCaseData.case_type}
                          onChange={(e) =>
                            setNewCaseData({
                              ...newCaseData,
                              case_type: e.target.value,
                            })
                          }
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
                      <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Court / Stage
                      </label>
                      <Input
                        value={newCaseData.court}
                        onChange={(e) =>
                          setNewCaseData({
                            ...newCaseData,
                            court: e.target.value,
                          })
                        }
                        placeholder="e.g. High Court / Filing"
                        className={`${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900"}`}
                      />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCaseModal(false)}
                        className={`${darkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className={`${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-[#0F2944] text-white hover:bg-[#0F2944]/90"}`}
                      >
                        Create Case
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {docToDelete && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3
                      className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Delete Document?
                    </h3>
                    <p
                      className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Are you sure you want to delete{" "}
                      <span
                        className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        "{docToDelete.title}"
                      </span>
                      ? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setDocToDelete(null)}
                        className={`${darkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-700 hover:bg-gray-50"} px-6`}
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
            {showEventModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div
                    className={`p-6 border-b flex justify-between items-center ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}
                  >
                    <h3
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      Add to Calendar
                    </h3>
                    <button
                      onClick={() => setShowEventModal(false)}
                      className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Event Title
                      </label>
                      <Input
                        required
                        value={newEventData.title}
                        onChange={(e) =>
                          setNewEventData({
                            ...newEventData,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Meeting with Associate"
                        className={`${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900"}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Type
                        </label>
                        <select
                          className={`w-full rounded-xl border p-2 focus:outline-none focus:ring-2 ${darkMode ? "bg-[#1c1c1c] border-white/10 text-white focus:ring-blue-500/50" : "border-gray-200 bg-white text-gray-900 focus:ring-blue-500"}`}
                          value={newEventData.type}
                          onChange={(e) =>
                            setNewEventData({
                              ...newEventData,
                              type: e.target.value,
                            })
                          }
                        >
                          <option value="meeting">Meeting</option>
                          <option value="personal">Personal</option>
                          <option value="hearing">Hearing</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Start Time
                        </label>
                        <Input
                          type="datetime-local"
                          required
                          value={newEventData.start_time}
                          onChange={(e) =>
                            setNewEventData({
                              ...newEventData,
                              start_time: e.target.value,
                            })
                          }
                          className={`${darkMode ? "bg-white/5 border-white/10 text-white scheme-dark" : "bg-white text-gray-900"}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          End Time
                        </label>
                        <Input
                          type="datetime-local"
                          required
                          value={newEventData.end_time}
                          onChange={(e) =>
                            setNewEventData({
                              ...newEventData,
                              end_time: e.target.value,
                            })
                          }
                          className={`${darkMode ? "bg-white/5 border-white/10 text-white scheme-dark" : "bg-white text-gray-900"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Description
                      </label>
                      <textarea
                        className={`w-full rounded-xl border p-2 focus:outline-none focus:ring-2 ${darkMode ? "bg-white/5 border-white/10 text-white" : "border-gray-200 bg-white text-gray-900 focus:ring-blue-500"}`}
                        rows="3"
                        value={newEventData.description}
                        onChange={(e) =>
                          setNewEventData({
                            ...newEventData,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEventModal(false)}
                        className={`${darkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className={`${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-[#0F2944] text-white hover:bg-[#0F2944]/90"}`}
                      >
                        Add Event
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Reschedule Booking Modal */}
            {showRescheduleModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-md shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div
                    className={`p-6 border-b flex justify-between items-center ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}
                  >
                    <h3
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                    >
                      Reschedule Consultation
                    </h3>
                    <button
                      onClick={() => setShowRescheduleModal(false)}
                      className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Propose a new date and time for this consultation.
                    </p>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        New Date
                      </label>
                      <Input
                        type="date"
                        required
                        value={rescheduleData.date}
                        onChange={(e) =>
                          setRescheduleData({
                            ...rescheduleData,
                            date: e.target.value,
                          })
                        }
                        className={`${darkMode ? "bg-white/5 border-white/10 text-white scheme-dark" : "bg-white text-gray-900"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        New Time
                      </label>
                      <Input
                        type="time"
                        required
                        value={rescheduleData.time}
                        onChange={(e) =>
                          setRescheduleData({
                            ...rescheduleData,
                            time: e.target.value,
                          })
                        }
                        className={`${darkMode ? "bg-white/5 border-white/10 text-white scheme-dark" : "bg-white text-gray-900"}`}
                      />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowRescheduleModal(false)}
                        className={`${darkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-700"}`}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRescheduleBooking}
                        className="bg-amber-500 text-white hover:bg-amber-600"
                      >
                        Confirm Reschedule
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Share Document Modal */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-md shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div
                    className={`p-6 border-b flex justify-between items-center ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}
                  >
                    <div>
                      <h3
                        className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                      >
                        Share Document
                      </h3>
                      <p
                        className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Sharing: {selectedDocForShare?.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="relative">
                      <Search
                        className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      />
                      <Input
                        placeholder="Search client name..."
                        value={shareSearchQuery}
                        onChange={(e) => setShareSearchQuery(e.target.value)}
                        className={`pl-10 ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900"}`}
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                      {cases
                        .filter((c) =>
                          c.client_name
                            .toLowerCase()
                            .includes(shareSearchQuery.toLowerCase()),
                        )
                        .map((c, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${darkMode ? "border-white/10 hover:bg-white/5 hover:border-white/20" : "border-gray-100 hover:bg-blue-50 hover:border-blue-200"}`}
                            onClick={() => handleShareDocument(c.user_id)} // Sharing with client user ID
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}
                              >
                                {c.client_name.charAt(0)}
                              </div>
                              <div>
                                <p
                                  className={`font-semibold group-hover:text-blue-500 ${darkMode ? "text-white" : "text-[#0F2944]"}`}
                                >
                                  {c.client_name}
                                </p>
                                <p
                                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  {c.title}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className={`opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? "bg-white text-black" : "bg-[#0F2944] text-white"}`}
                            >
                              Share
                            </Button>
                          </div>
                        ))}
                      {cases.length === 0 && (
                        <div
                          className={`text-center py-8 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          No active cases or clients found.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowShareModal(false)}
                        className={`${darkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-700"}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Session Details Modal */}
            {showSessionModal && selectedSession && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-md shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {selectedSession.sessionType}
                        </h3>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {format(
                            parseISO(
                              selectedSession.start_time ||
                              selectedSession.date ||
                              new Date().toISOString(),
                            ),
                            "MMMM d, yyyy",
                          )}{" "}
                          • {selectedSession.time}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowSessionModal(false)}
                        className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                      >
                        <h4
                          className={`font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                        >
                          {selectedSession.case}
                        </h4>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {selectedSession.description ||
                            "No description provided"}
                        </p>
                      </div>

                      {selectedSession.sessionType === "CONSULTATION" && (
                        <div className="space-y-3">
                          <div
                            className={`flex items-center space-x-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <User className="w-5 h-5 text-blue-600" />
                            <span>
                              Client:{" "}
                              {selectedSession.client_name || "Client Name"}
                            </span>
                          </div>

                          {selectedSession.consultation_type === "video" && (
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

                          {selectedSession.consultation_type === "audio" && (
                            <div
                              className={`p-4 rounded-xl border ${darkMode ? "bg-green-500/10 border-green-500/20" : "bg-green-50 border-green-100"}`}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <Phone className="w-5 h-5 text-green-600" />
                                <span
                                  className={`font-medium ${darkMode ? "text-green-400" : "text-green-900"}`}
                                >
                                  Audio Call Number
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-green-700 tracking-wider font-mono select-all">
                                {selectedSession.location || "831216968"}
                              </p>
                            </div>
                          )}

                          {selectedSession.consultation_type ===
                            "in_person" && (
                              <div
                                className={`p-4 rounded-xl border ${darkMode ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-100"}`}
                              >
                                <div className="flex items-center space-x-3 mb-2">
                                  <MapPin className="w-5 h-5 text-purple-600" />
                                  <span
                                    className={`font-medium ${darkMode ? "text-purple-400" : "text-purple-900"}`}
                                  >
                                    Meeting Location
                                  </span>
                                </div>
                                <p
                                  className={`font-medium ${darkMode ? "text-purple-300" : "text-purple-800"}`}
                                >
                                  {selectedSession.location ||
                                    "Office Address Pending"}
                                </p>
                              </div>
                            )}
                        </div>
                      )}

                      {selectedSession.sessionType !== "CONSULTATION" && (
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {selectedSession.court || selectedSession.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowSessionModal(false)}
                        className={`${darkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-700 text-gray-700"}`}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </motion.div>

      {/* Pending Appointments Modal */}
      <PendingAppointmentsModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        bookings={pendingBookings}
        onAccept={handleAcceptBooking}
        onDecline={(id) => handleCancelBooking(id, "Declined by lawyer")}
        onReschedule={(booking) => {
          setSelectedBookingForReschedule(booking);
          setShowRescheduleModal(true);
          setShowPendingModal(false);
        }}
        darkMode={darkMode}
      />
    </div >
  );
}
