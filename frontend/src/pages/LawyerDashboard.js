import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  RefreshCw,
  CalendarCheck,
  XCircle,
  X,
  Globe,
  AlertTriangle,
  HelpCircle,
  Award,
  Trophy,
  ImagePlus,
  Trash2,
  Plus,
  Star,
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
import HowToUseModal from "../components/dashboard/lawyer/HowToUseModal";


// Convert a booking time string like "9:05 PM" + date like "2026-02-24" → valid ISO "2026-02-24T21:05:00"
function to24hrISO(dateStr, timeStr) {
  if (!dateStr) return new Date().toISOString();
  if (!timeStr) return `${dateStr}T00:00:00`;
  // Already looks like HH:MM or HH:MM:SS (24-hr) — no AM/PM
  if (!/[aApP][mM]/.test(timeStr)) {
    return `${dateStr}T${timeStr.trim().length === 5 ? timeStr.trim() + ':00' : timeStr.trim()}`;
  }
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/);
  if (!match) return `${dateStr}T00:00:00`;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'AM' && hours === 12) hours = 0;
  if (period === 'PM' && hours !== 12) hours += 12;
  return `${dateStr}T${String(hours).padStart(2, '0')}:${minutes}:00`;
}
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
  const [msgPermission, setMsgPermission] = useState(null); // { allowed, reason, quota_left }
  const [sosCalls, setSosCalls] = useState([]);

  // SOS Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedCallForDispute, setSelectedCallForDispute] = useState(null);
  const [disputeFile, setDisputeFile] = useState(null);
  const [sosType, setSosType] = useState(null); // 'sos_talk' | 'sos_full' — loaded from user profile
  const [sosTypeLoading, setSosTypeLoading] = useState(false);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [acceptingSos, setAcceptingSos] = useState(false);

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

  // Create mock pending bookings for demonstration purposes
  const mockPendingBookings = [
    {
      id: "mock_booking_1",
      client_name: "Sarah Jenkins",
      date: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
      time: "14:30",
      description: "Needs assistance with property dispute and contract review.",
      consultation_type: "video",
      status: "pending"
    },
    {
      id: "mock_booking_2",
      client_name: "Michael Chen",
      date: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
      time: "10:00",
      description: "Initial consultation for tech startup incorporation.",
      consultation_type: "in_person",
      status: "pending"
    }
  ];

  const pendingBookings = bookings.length > 0 ? bookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "requested" ||
      (!b.status && b.payment_status === "paid"), // Handle bookings without status but paid
  ) : (user?.id?.startsWith('dummy_') || user?.id === '73bad559-643c-4ec2-bd7c-c769171efaa2') ? mockPendingBookings : [];

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

  // Folder State (client-side folders)
  const [folders, setFolders] = useState([
    { id: 'general', name: 'General', icon: '📁', color: '#2563eb', docIds: [] },
  ]);
  const [activeFolderId, setActiveFolderId] = useState(null); // null = show all
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Deletion State
  const [docToDelete, setDocToDelete] = useState(null);
  const [bookingToDecline, setBookingToDecline] = useState(null);

  // Session View Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Fallbacks to prevent crashes while features are being built
  const [documents, setDocuments] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingStats, setBillingStats] = useState({ total_earned: 0, total_transactions: 0, pending_payments: 0 });

  // ─── Achievements State ────────────────────────────────
  const [achievements, setAchievements] = useState([]);
  
  // Sync initial achievements when user loads
  useEffect(() => {
    if (user?.achievements && Array.isArray(user.achievements)) {
      setAchievements(user.achievements);
    }
  }, [user]);

  // Save achievements to backend whenever they change
  const isFirstRenderForAch = useRef(true);
  useEffect(() => {
    if (isFirstRenderForAch.current) {
      isFirstRenderForAch.current = false;
      return;
    }
    const saveAchievements = async () => {
      try {
        const token = sessionStorage.getItem('token');
        await axios.put(`${API}/auth/me`, { achievements }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to save achievements', err);
      }
    };
    saveAchievements();
  }, [achievements]);

  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchDate, setNewAchDate] = useState('');
  const [newAchPhoto, setNewAchPhoto] = useState(null); // base64 or URL
  const achPhotoRef = useRef(null);

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
  const chatBottomRef = useRef(null);
  const [showNewMsg, setShowNewMsg] = useState(false);

  const fetchData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };

    const fetchSafe = async (name, url, setter) => {
      try {
        const res = await axios.get(url, { headers, timeout: 10000 });
        setter(res.data);
        return { success: true, name };
      } catch (e) {
        console.error(`Failed to fetch ${name}:`, e);
        return { success: false, name, error: e };
      }
    };

    const promises = [
      fetchSafe("cases", `${API}/cases`, setCases),
      fetchSafe("bookings", `${API}/bookings`, setBookings),
      fetchSafe("dashboard", `${API}/dashboard/lawyer`, setDashboardData),
      fetchSafe("events", `${API}/events`, (data) => setEvents(data || [])),
      fetchSafe("notifications", `${API}/notifications`, setNotifications),
      fetchSafe("documents", `${API}/documents`, setDocuments),
      fetchSafe("billing", `${API}/billing/history`, setBillingHistory),
      fetchSafe("billingStats", `${API}/billing/stats`, setBillingStats),
    ];

    // Fetch messages: merge recents + eligible-contacts
    try {
      const [recentsRes, eligibleRes] = await Promise.allSettled([
        axios.get(`${API}/messages/recents`, { headers }),
        axios.get(`${API}/messages/eligible-contacts`, { headers }),
      ]);
      const recents = recentsRes.status === 'fulfilled' && Array.isArray(recentsRes.value.data) ? recentsRes.value.data : [];
      const eligible = eligibleRes.status === 'fulfilled' && Array.isArray(eligibleRes.value.data) ? eligibleRes.value.data : [];
      const recentIds = new Set(recents.map(r => r.other_user_id || r.id));
      const merged = [...recents];
      for (const ec of eligible) {
        if (!recentIds.has(ec.other_user_id)) merged.push(ec);
      }
      setMessages(merged);
    } catch { }

    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (userData?.application_type?.includes("sos")) {
      promises.push(fetchSafe("sos", `${API}/sos/my-missed-calls`, (data) => setSosCalls(data.missed_calls || [])));
    }

    const results = await Promise.all(promises);

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

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchData();
    }
  }, [fetchData]);

  // ── SOS Polling ──
  useEffect(() => {
    let interval;
    if (user && user.application_type && user.application_type.includes("sos")) {
      const fetchBroadcasts = async () => {
        try {
          const res = await axios.get(`${API}/sos/active-broadcasts`, { headers: { Authorization: `Bearer ${token}` } });
          setActiveBroadcasts(res.data.broadcasts || []);
        } catch (e) {
          // Silent catch
        }
      };
      fetchBroadcasts();
      interval = setInterval(fetchBroadcasts, 5000);
    }
    return () => { if (interval) clearInterval(interval); }
  }, [user, token]);

  const handleAcceptSos = async (sessionId) => {
    setAcceptingSos(true);
    try {
      await axios.post(`${API}/sos/accept/${sessionId}`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("SOS Request accepted successfully!");
      setActiveBroadcasts((prev) => prev.filter(b => b._id !== sessionId && b.id !== sessionId));
      // Option to navigate to session or open it based on your UI
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to accept SOS request. It might have been taken.");
      setActiveBroadcasts((prev) => prev.filter(b => b._id !== sessionId && b.id !== sessionId));
    } finally {
      setAcceptingSos(false);
    }
  };

  const handleImageUpload = (newPhotoUrl) => {
    if (typeof newPhotoUrl !== 'string') return;

    // Update local user state with new photo from the modal
    const updatedUser = { ...user, photo: newPhotoUrl };
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser)); // Persist to storage
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // ─── Earnings helpers ──────────────────────────────────
  const thisMonthEarnings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .filter(b => {
      if (!b.created_at) return false;
      const d = new Date(b.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const pendingPayments = bookings
    .filter(b => b.status === 'pending' || b.status === 'rescheduled')
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const totalSosPenalties = sosCalls
    .filter(c => c.status === 'penalized')
    .reduce((sum, c) => sum + (c.penalty_amount || 250), 0);

  // ─── Generate Report ───────────────────────────────────
  const generateEarningsReport = () => {
    const rows = bookings
      .filter(b => b.price > 0)
      .map(b => `<tr><td>${b.client_name || 'Client'}</td><td>${b.date || '—'}</td><td>₹${Number(b.price).toLocaleString('en-IN')}</td><td>${(b.status || 'pending').toUpperCase()}</td></tr>`)
      .join('');
    const html = `<html><head><title>Earnings Report — LxwyerUp</title>
      <style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1e293b}h1{color:#2563eb;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:14px}th{background:#f1f5f9;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:0.05em}.footer{margin-top:32px;font-size:12px;color:#94a3b8;text-align:center}.total{font-size:18px;font-weight:700;margin-top:20px}</style></head><body>
      <h1>⚖️ LxwyerUp — Earnings Report</h1>
      <p style="color:#64748b;font-size:13px">${user?.full_name || 'Lawyer'} • Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p class="total">Total Revenue: ₹${(dashboardData.stats.revenue || 0).toLocaleString('en-IN')} &nbsp;|&nbsp; This Month: ₹${thisMonthEarnings.toLocaleString('en-IN')} &nbsp;|&nbsp; Pending: ₹${pendingPayments.toLocaleString('en-IN')} ${user?.application_type?.includes('sos') ? `&nbsp;|&nbsp; SOS Penalties: <span style="color:#ef4444">-₹${totalSosPenalties.toLocaleString('en-IN')}</span>` : ''}</p>
      <table><thead><tr><th>Client</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#94a3b8">No billing data yet</td></tr>'}</tbody></table>
      <p class="footer">System-generated report from LxwyerUp. For queries, contact support.</p>
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ─── Document stats (computed, memoized) ─────────────────────────
  const { totalStorageBytes, storagePercent, isStorageFull, totalStorageDisplay, recentUploadsCount, STORAGE_LIMIT_BYTES } = useMemo(() => {
    const LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB
    const bytes = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);
    const pct = Math.min((bytes / LIMIT) * 100, 100);
    const full = bytes >= LIMIT;
    const display = bytes > 1024 * 1024 * 1024
      ? (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
      : bytes > 1024 * 1024
        ? (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        : bytes > 1024
          ? (bytes / 1024).toFixed(0) + ' KB'
          : bytes > 0 ? bytes + ' B' : '0 B';
    const recent = documents.filter(d => {
      if (!d.uploaded_at) return false;
      const diff = Date.now() - new Date(d.uploaded_at).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;
    return { totalStorageBytes: bytes, storagePercent: pct, isStorageFull: full, totalStorageDisplay: display, recentUploadsCount: recent, STORAGE_LIMIT_BYTES: LIMIT };
  }, [documents]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      if (bookingId.startsWith('mock_') || bookingId.startsWith('dummy_')) {
        toast.success("Booking confirmed! ✓");
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
        );
        return;
      }

      await axios.patch(
        `${API}/bookings/${bookingId}/status?status=confirmed`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Booking confirmed! ✓");
      // Optimistically update local state
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
      );
      fetchData();
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error(error.response?.data?.detail || "Failed to accept booking");
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      if (bookingId.startsWith('mock_') || bookingId.startsWith('dummy_')) {
        toast.success("Booking declined");
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
        return;
      }

      await axios.patch(
        `${API}/bookings/${bookingId}/status?status=cancelled`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Booking declined");
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      fetchData();
    } catch (error) {
      console.error("Error declining booking:", error);
      toast.error("Failed to decline booking");
    }
  };

  const handleRescheduleBooking = async () => {
    if (
      !selectedBookingForReschedule ||
      !rescheduleData.date ||
      !rescheduleData.time
    ) {
      toast.error('Please select both a new date and time.');
      return;
    }

    // Enforce: rescheduled slot must be within next 24 hours
    const newDateTime = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
    const now = new Date();
    const diffMs = newDateTime - now;
    if (diffMs < 0) {
      toast.error('Cannot reschedule to a time in the past.');
      return;
    }
    if (diffMs > 24 * 60 * 60 * 1000) {
      toast.error('Rescheduled time must be within the next 24 hours.');
      return;
    }

    const bookingId = selectedBookingForReschedule.id;

    try {
      if (bookingId.startsWith('mock_') || bookingId.startsWith('dummy_')) {
        toast.success('Booking rescheduled!');
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? { ...b, date: rescheduleData.date, time: rescheduleData.time, status: 'rescheduled' } : b)
        );
        setShowRescheduleModal(false);
        return;
      }

      await axios.patch(
        `${API}/bookings/${selectedBookingForReschedule.id}/reschedule`,
        rescheduleData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success('Booking rescheduled!');
      setShowRescheduleModal(false);
      fetchData();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule');
    }
  };

  // ── Lawyer responds to user's counter-proposal ────────────────────────────
  const handleLawyerRescheduleResponse = async (bookingId, action) => {
    try {
      const res = await axios.post(
        `${API}/bookings/${bookingId}/lawyer-reschedule-response`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (action === 'accept') {
        toast.success(`✅ Appointment confirmed at ${res.data.date} ${res.data.time}`);
        setBookings(prev => prev.map(b =>
          b.id === bookingId
            ? { ...b, status: 'confirmed', date: res.data.date, time: res.data.time, proposed_date: null, proposed_time: null, reschedule_deadline: null }
            : b
        ));
      } else {
        toast.success('Appointment cancelled — could not agree on time.');
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to respond to counter-proposal');
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

  const markAllNotificationsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n =>
        axios.patch(`${API}/notifications/${n.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleFileUpload = async (e, folderId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use the active folder if no explicit folderId passed
    const targetFolderId = folderId || activeFolderId;

    // Check storage limit
    if (isStorageFull) {
      toast.error('Storage limit reached (1 GB). Please delete some files to upload new ones.');
      e.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("source", "personal"); // tag as personal upload, not network
    if (targetFolderId) formData.append("folder_id", targetFolderId);

    setLoading(true);
    try {
      const res = await axios.post(`${API}/documents/upload`, formData, {
        timeout: 45000,
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Document uploaded successfully!");
      // Auto-assign to active folder if one is selected
      if (targetFolderId) {
        const uploadedDocId = res.data?.id || res.data?.document_id;
        if (uploadedDocId) {
          setFolders(prev => prev.map(f => ({
            ...f,
            docIds: f.id === targetFolderId
              ? [...new Set([...f.docIds, uploadedDocId])]
              : f.docIds,
          })));
        }
      }
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || "Failed to upload document";
      toast.error(msg);
    } finally {
      setLoading(false);
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
      if (bookingId.startsWith('mock_') || bookingId.startsWith('dummy_')) {
        toast.success(`Booking ${status}!`);
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? { ...b, status: status } : b)
        );
        return;
      }
      // Continue...
      await axios.patch(`${API}/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Booking ${status}!`);
      fetchData();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason) return toast.error("Please provide a dispute reason.");

    setLoading(true);
    try {
      // Typically we'd handle file upload here. Assuming text-only or a mock URL for this demo.
      const payload = {
        dispute_reason: disputeReason,
        dispute_file_url: disputeFile ? "uploaded_file_placeholder_url" : null
      };

      await axios.post(`${API}/sos/missed-calls/${selectedCallForDispute.id}/dispute`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Dispute submitted successfully");
      setShowDisputeModal(false);
      setDisputeReason("");
      setDisputeFile(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit dispute");
    } finally {
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
    if (!token) {
      toast.error("Please log in to add events");
      return;
    }
    try {
      if (!newEventData.title || !newEventData.start_time || !newEventData.end_time) {
        toast.error("Please fill in all required fields");
        return;
      }

      const startDate = new Date(newEventData.start_time);
      const endDate = new Date(newEventData.end_time);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("Invalid date format. Please use the date picker.");
        return;
      }

      if (endDate <= startDate) {
        toast.error("End time must be after start time");
        return;
      }

      const payload = {
        title: newEventData.title.trim(),
        type: newEventData.type || "meeting",
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        description: (newEventData.description || "").trim() || null,
      };

      await axios.post(
        `${API}/events`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Event added to calendar!");
      setShowEventModal(false);
      setNewEventData({
        title: "",
        type: "meeting",
        start_time: "",
        end_time: "",
        description: "",
      });
      fetchData();
    } catch (error) {
      console.error("Event creation error:", error?.response?.data || error);
      let msg = "Failed to add event";
      const detail = error.response?.data?.detail;
      if (detail) {
        if (typeof detail === "string") msg = detail;
        else if (Array.isArray(detail)) msg = detail.map((d) => d.msg || d.message || JSON.stringify(d)).join("; ");
        else if (detail?.message) msg = detail.message;
      } else if (error.message) msg = error.message;
      if (error.response?.status === 401) msg = "Please log in again.";
      if (error.response?.status === 403) msg = "Only lawyers can add events.";
      toast.error(msg);
    }
  };

  const handleSignatureApplication = async (plan) => {
    try {
      setLoading(true);
      await axios.post(
        `${API}/lawyers/apply-signature`,
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Signature Exclusivity Contract submitted. Application under review.");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Application process failed. Please contact admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setMsgPermission(null);
    try {
      const otherId = chat.id || chat.other_user_id;
      const [histRes, permRes] = await Promise.allSettled([
        axios.get(`${API}/messages/${otherId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/messages/can-message/${otherId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (histRes.status === 'fulfilled') setChatHistory(histRes.value.data);
      if (permRes.status === 'fulfilled') setMsgPermission(permRes.value.data);
    } catch {
      toast.error("Failed to load chat history");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    if (msgPermission && !msgPermission.allowed) {
      toast.error(msgPermission.reason || 'Messaging not allowed for this client yet.');
      return;
    }
    try {
      const otherId = selectedChat.id || selectedChat.other_user_id;
      await axios.post(`${API}/messages`, { receiver_id: otherId, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewMessage("");
      const [histRes, permRes] = await Promise.allSettled([
        axios.get(`${API}/messages/${otherId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/messages/can-message/${otherId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (histRes.status === 'fulfilled') setChatHistory(histRes.value.data);
      if (permRes.status === 'fulfilled') setMsgPermission(permRes.value.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || "Failed to send message");
    }
  };

  // Poll for new messages when a chat is open
  useEffect(() => {
    if (!selectedChat || activeTab !== 'messages') return;
    const otherId = selectedChat.id || selectedChat.other_user_id;
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/messages/${otherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatHistory(res.data);
      } catch { }
    }, 4000);
    return () => clearInterval(poll);
  }, [selectedChat, activeTab, token]);

  const [showHowToUse, setShowHowToUse] = useState(false);

  const baseNavItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "appointments", icon: CalendarCheck, label: "Appointments" },
    { id: "signature_apply", icon: Star, label: "Signature Tier" },
    { id: "cases", icon: FileText, label: "Cases" },
    { id: "calendar", icon: CalendarIcon, label: "Calendar" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "network", icon: Users, label: "Lxwyer Network" },
    { id: "achievements", icon: Trophy, label: "Achievements" },
    { id: "paralegal", icon: Bot, label: "Lxwyer Paralegal AI" },
    { id: "earnings", icon: TrendingUp, label: "Earnings" },
  ];

  const navItems = user?.application_type?.includes("sos")
    ? [...baseNavItems, { id: "sos", icon: AlertTriangle, label: "SOS Performance" }]
    : baseNavItems;

  return (
    <div
      className={`min-h-screen ${isFullScreen ? "p-0 block" : "p-2 md:p-4 flex items-center justify-center"} font-sans transition-all duration-300 relative overflow-hidden ${darkMode ? "bg-black text-gray-100" : "bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0F2FE] text-[#1F2937]"}`}
    >
      {!isFullScreen && <ParticleBackground darkMode={darkMode} />}

      {showHowToUse && (
        <HowToUseModal darkMode={darkMode} onClose={() => setShowHowToUse(false)} />
      )}

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
        className={`${isFullScreen ? "w-screen h-screen rounded-none border-0 fixed inset-0" : "w-full max-w-[1440px] h-[96vh] rounded-[2.5rem] border relative"} ${darkMode ? "bg-[#0f1012] border-gray-800" : "bg-white border-white"} shadow-2xl overflow-hidden flex z-10 transition-all duration-300`}
      >
        <aside
          className={`w-44 flex flex-col py-3 border-r z-10 relative transition-colors duration-300 shrink-0 ${darkMode ? 'border-white/5 bg-black/40 backdrop-blur-md' : 'border-white/20 bg-white/60 backdrop-blur-md'
            }`}
        >
          {/* Logo */}
          <div className="px-4 py-3 flex items-center gap-2.5 mb-1">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className={`font-bold text-xs tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Lxwyer Up</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-1 space-y-0.5 flex flex-col overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-left ${isActive
                    ? 'bg-blue-600 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                      : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                  <item.icon className="w-[15px] h-[15px] shrink-0" />
                  <span className="text-[12px] font-semibold truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom: Theme + Profile + Logout */}
          <div className={`px-2 pb-3 pt-2 border-t flex flex-col gap-0.5 ${darkMode ? 'border-white/5' : 'border-slate-200'
            }`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${darkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
              {darkMode ? <Sun className="w-[14px] h-[14px] shrink-0" /> : <Moon className="w-[14px] h-[14px] shrink-0" />}
              <span className="text-[11px] font-semibold">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${darkMode ? 'text-gray-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <div className={`w-[14px] h-[14px] rounded-full overflow-hidden shrink-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-slate-200'
                }`}>
                {user?.photo && !imgError ? (
                  <img src={user.photo.startsWith('http') || user.photo.startsWith('data:') ? user.photo : `http://localhost:8000${user.photo}`} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span className="text-[8px] font-bold">{user?.full_name?.[0] || 'L'}</span>
                )}
              </div>
              <span className="text-[11px] font-semibold truncate">My Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-red-400 ${darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
            >
              <LogOut className="w-[14px] h-[14px] shrink-0" />
              <span className="text-[11px] font-semibold">Sign Out</span>
            </button>
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

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      <Trophy className="w-6 h-6 text-amber-400" /> Achievements
                    </h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      Showcase your <strong>major</strong> milestones and high-profile cases. We recommend adding only your most significant professional achievements to stand out and attract more clients.
                    </p>
                  </div>
                </div>

                {/* Compose Box */}
                <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-gradient-to-br from-[#1a1200] via-[#111008] to-[#0a0800] border-amber-900/40' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Add New Achievement</span>
                  </div>
                  <textarea
                    value={newAchTitle}
                    onChange={e => setNewAchTitle(e.target.value)}
                    placeholder="Describe your achievement... e.g. Won landmark property case at Delhi High Court"
                    rows={3}
                    className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none border mb-3 ${darkMode ? 'bg-black/40 border-amber-900/30 text-white placeholder:text-gray-600 focus:border-amber-500/50' : 'bg-white border-amber-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-400'}`}
                  />
                  <div className="flex flex-[1_1_100%] w-full mb-3 mt-1">
                    <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">Note: Please ensure achievement image uploads are strictly under the 3MB limit.</p>
                  </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <label className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>Date <span className="text-red-500">*</span></label>
                        <input type="month" value={newAchDate} onChange={e => setNewAchDate(e.target.value)}
                          className={`rounded-xl px-3 py-2 text-sm outline-none border ${!newAchDate ? 'border-red-500/40' : darkMode ? 'border-amber-900/30' : 'border-amber-200'} ${darkMode ? 'bg-black/40 text-white' : 'bg-white text-slate-800'}`}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>Photo <span className="text-red-500">*</span></label>
                        <button onClick={() => achPhotoRef.current?.click()}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${!newAchPhoto ? 'border-red-500/50 ' : ''} ${darkMode ? 'border-amber-900/40 text-amber-400 hover:bg-amber-900/20' : 'border-amber-300 text-amber-700 hover:bg-amber-50'}`}
                        >
                          <ImagePlus className="w-4 h-4" />
                          {newAchPhoto ? 'Change Photo' : 'Add Photo'}
                        </button>
                      </div>
                    <input ref={achPhotoRef} type="file" accept="image/*" className="hidden"
                      onChange={async e => {
                        const file = e.target.files[0]; if (!file) return;
                        if (file.size > 3 * 1024 * 1024) {
                           toast.error('Image exceeds 3MB limit. Please upload a smaller file.');
                           e.target.value = '';
                           return;
                        }
                        const toastId = toast.loading('Uploading image...');
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          const token = sessionStorage.getItem('token');
                          const res = await axios.post(`${API}/auth/upload-image`, formData, {
                            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                          });
                          setNewAchPhoto(res.data.url);
                          toast.success('Image attached seamlessly.', { id: toastId });
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to attach image.', { id: toastId });
                        }
                      }}
                    />
                    {newAchPhoto && <img src={newAchPhoto.startsWith('http') || newAchPhoto.startsWith('data:') ? newAchPhoto : `${API.replace('/api', '')}${newAchPhoto}`} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-amber-500/30" />}
                    <button
                      onClick={() => {
                        if (!newAchTitle.trim()) return toast.error('Please write your achievement first');
                        if (!newAchPhoto) return toast.error('Photo is required — please add an achievement photo');
                        if (!newAchDate) return toast.error('Date is required — please select the month/year');
                        setAchievements(prev => [{ id: Date.now(), title: newAchTitle.trim(), date: newAchDate, photo: newAchPhoto, pinned: false }, ...prev]);
                        setNewAchTitle(''); setNewAchDate(''); setNewAchPhoto(null);
                        toast.success('Achievement added to your profile!');
                      }}
                      className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-900/30"
                    >
                      <Plus className="w-4 h-4" /> Publish
                    </button>
                  </div>
                </div>

                {/* Achievement Cards */}
                <div className="space-y-4">
                  {achievements.length === 0 && (
                    <div className={`text-center py-16 rounded-2xl border ${darkMode ? 'border-white/5 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
                      <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No achievements yet. Add your first one above!</p>
                    </div>
                  )}
                  {[...achievements].sort((a, b) => b.pinned - a.pinned).map(ach => (
                    <motion.div key={ach.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl border p-5 flex gap-4 relative overflow-hidden transition-all ${ach.pinned
                        ? darkMode ? 'bg-gradient-to-r from-[#1a1200] to-[#0f0900] border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.12)]' : 'bg-amber-50 border-amber-300'
                        : darkMode ? 'bg-[#131416] border-white/5 hover:border-amber-900/30' : 'bg-white border-slate-100 hover:border-amber-200'}`}
                    >
                      {ach.pinned && (
                        <div className="absolute top-3 right-12 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-black">📌 Pinned</div>
                      )}
                      {ach.photo
                        ? <img src={ach.photo.startsWith('http') || ach.photo.startsWith('data:') ? ach.photo : `${API.replace('/api', '')}${ach.photo}`} alt="achievement" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-500/20" />
                        : <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-100'}`}><Award className="w-7 h-7 text-amber-400" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-snug mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{ach.title}</p>
                        {ach.date && <p className={`text-xs ${darkMode ? 'text-amber-600' : 'text-amber-500'}`}>{ach.date}</p>}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setAchievements(prev => prev.map(a => a.id === ach.id ? { ...a, pinned: !a.pinned } : a))}
                          className={`p-1.5 rounded-lg transition-all ${ach.pinned ? 'text-amber-400 bg-amber-900/20' : darkMode ? 'text-gray-600 hover:text-amber-400' : 'text-slate-400 hover:text-amber-500'}`}
                          title={ach.pinned ? 'Unpin' : 'Pin to top'}
                        ><Star className={`w-4 h-4 ${ach.pinned ? 'fill-amber-400' : ''}`} /></button>
                        <button onClick={() => { setAchievements(prev => prev.filter(a => a.id !== ach.id)); toast.success('Removed'); }}
                          className={`p-1.5 rounded-lg transition-all ${darkMode ? 'text-gray-600 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                          title="Delete"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Application Pending Banner */}
                {(!user?.is_approved || user?.status === 'pending') && (
                  <div className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${darkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className={`text-base font-bold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Application Pending Review</h3>
                      <p className={`text-sm mt-1 leading-relaxed ${darkMode ? 'text-amber-200/70' : 'text-amber-700/80'}`}>
                        Your application is currently being evaluated by our Apex system. The application fee (₹2000 for standard, ₹3000 for SOS) ensures commitment. If selected, you will be respectively refunded ₹1000 or ₹2000, and awarded a complimentary 2-month verified subscription (value up to ₹4000). If not selected, you will receive a full refund within 48 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* SOS Active Broadcasts Overlay */}
                {activeBroadcasts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key="sos-radar"
                    className="mb-6 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #dc2626)', border: '2px solid rgba(255,255,255,0.2)' }}
                  >
                    <div className="absolute inset-0 z-0">
                       <div className="absolute top-1/2 left-12 w-24 h-24 -translate-y-1/2 rounded-full border border-white/30" style={{ animation: 'esPing 2s infinite' }}></div>
                       <div className="absolute top-1/2 left-12 w-48 h-48 -translate-x-12 -translate-y-1/2 rounded-full border border-white/20" style={{ animation: 'esPing 2s infinite 0.5s' }}></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col text-white">
                       <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-8 h-8 text-yellow-300" />
                          <h2 className="text-2xl font-black uppercase tracking-wider text-white">SOS Alert in your area</h2>
                       </div>
                       <p className="text-white/90 font-medium text-lg">
                         <strong className="text-yellow-300">{activeBroadcasts[0].sos_type === 'sos_full' ? 'Full Legal SOS' : 'SOS Talk'}</strong> for <strong>{activeBroadcasts[0].issue_type}</strong> issue.
                       </p>
                       <p className="text-white/80 text-sm mt-1">Location: {activeBroadcasts[0].user_city}, {activeBroadcasts[0].user_state} | ₹{activeBroadcasts[0].base_amount}</p>
                    </div>

                    <div className="relative z-10 w-full sm:w-auto shrink-0 flex items-center justify-center">
                       <Button 
                          onClick={() => handleAcceptSos(activeBroadcasts[0].id || activeBroadcasts[0]._id)}
                          disabled={acceptingSos}
                          className="w-full sm:w-48 h-14 bg-white hover:bg-slate-100 text-[#b91c1c] font-bold text-xl uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
                       >
                         {acceptingSos ? "Accepting..." : "ACCEPT NOW"}
                       </Button>
                    </div>
                  </motion.div>
                )}

                {/* Greeting Header & Actions */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1
                      className={`text-3xl font-bold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      Hi, {user?.full_name?.split(" ")[0] || "Lawyer"} 👋
                    </h1>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Here's what's happening with your practice today.
                    </p>
                    {user?.unique_id && (
                      <div className="mt-2 text-xs font-mono bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 inline-block">
                        ID: {user.unique_id}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {/* How-to-Use */}
                    <Button
                      variant="outline"
                      onClick={() => setShowHowToUse(true)}
                      className={`w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-sm border transition-all ${darkMode
                        ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-indigo-500/10'
                        : 'bg-white border-slate-200 text-indigo-500 hover:bg-indigo-50'
                        }`}
                      title="How to use this dashboard"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={`w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-sm border transition-all ${darkMode
                        ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      title="Refresh Dashboard"
                    >
                      <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
                    </Button>

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

                    {/* Notification Bell */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowNotifications(prev => !prev)}
                        className={`w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-sm border transition-all ${darkMode
                          ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        title="Notifications"
                      >
                        <Bell className="w-5 h-5" />
                        {notifications.filter(n => !n.is_read).length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                            {notifications.filter(n => !n.is_read).length}
                          </span>
                        )}
                      </Button>

                      {/* Notification Dropdown */}
                      {showNotifications && (
                        <>
                          {/* Backdrop */}
                          <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                          <div className={`absolute right-0 top-14 w-96 max-h-[480px] rounded-2xl shadow-2xl border z-40 overflow-hidden flex flex-col ${darkMode ? 'bg-[#1a1b1e] border-white/10' : 'bg-white border-slate-200'}`}>
                            {/* Header */}
                            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                              <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                              <div className="flex items-center gap-2">
                                {notifications.filter(n => !n.is_read).length > 0 && (
                                  <button
                                    onClick={markAllNotificationsRead}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  >
                                    Mark all read
                                  </button>
                                )}
                                <button onClick={() => setShowNotifications(false)} className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Notification List */}
                            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                              {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                  <Bell className={`w-10 h-10 mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No notifications yet</p>
                                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>New updates will appear here</p>
                                </div>
                              ) : (
                                notifications.slice(0, 20).map((notif) => {
                                  const icons = {
                                    booking_request: { emoji: '📩', color: 'text-blue-500' },
                                    booking_confirmed: { emoji: '✅', color: 'text-emerald-500' },
                                    booking_accepted: { emoji: '✅', color: 'text-emerald-500' },
                                    booking_rescheduled: { emoji: '📅', color: 'text-amber-500' },
                                    booking_cancelled: { emoji: '❌', color: 'text-red-500' },
                                    booking_declined: { emoji: '❌', color: 'text-red-500' },
                                    booking_completed: { emoji: '🎉', color: 'text-purple-500' },
                                  };
                                  const notifIcon = icons[notif.type] || { emoji: '🔔', color: 'text-blue-500' };
                                  const timeAgo = (() => {
                                    if (!notif.created_at) return '';
                                    const diff = Date.now() - new Date(notif.created_at).getTime();
                                    const mins = Math.floor(diff / 60000);
                                    if (mins < 1) return 'Just now';
                                    if (mins < 60) return `${mins}m ago`;
                                    const hrs = Math.floor(mins / 60);
                                    if (hrs < 24) return `${hrs}h ago`;
                                    return `${Math.floor(hrs / 24)}d ago`;
                                  })();
                                  return (
                                    <div
                                      key={notif.id}
                                      onClick={() => { if (!notif.is_read) markNotificationRead(notif.id); }}
                                      className={`flex items-start gap-3 px-5 py-3.5 border-b cursor-pointer transition-colors ${darkMode
                                        ? `border-white/5 ${notif.is_read ? 'bg-transparent hover:bg-white/3' : 'bg-blue-500/5 hover:bg-blue-500/10'}`
                                        : `border-slate-50 ${notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`
                                        }`}
                                    >
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                                        {notifIcon.emoji}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'} ${!notif.is_read ? '' : 'opacity-70'}`}>
                                          {notif.title}
                                        </p>
                                        <p className={`text-xs mt-0.5 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'} ${!notif.is_read ? '' : 'opacity-60'}`}>
                                          {notif.message}
                                        </p>
                                        <p className={`text-[10px] mt-1 font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                          {timeAgo}
                                        </p>
                                      </div>
                                      {!notif.is_read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Footer: Pending Appointments link */}
                            {pendingBookings.length > 0 && (
                              <div className={`px-5 py-3 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                <button
                                  onClick={() => { setShowNotifications(false); setShowPendingModal(true); }}
                                  className="w-full text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View {pendingBookings.length} pending appointment{pendingBookings.length > 1 ? 's' : ''}
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
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

            {/* ─── Appointments Tab ─────────────────────────── */}
            {activeTab === "appointments" && (() => {
              const statusConfig = {
                pending: { label: 'Pending', bg: darkMode ? 'bg-amber-900/20 border-amber-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700' },
                confirmed: { label: 'Confirmed', bg: darkMode ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                cancelled: { label: 'Cancelled', bg: darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700' },
                rescheduled: { label: 'Rescheduled', bg: darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700' },
                rescheduled_by_lawyer: { label: 'Awaiting Client', bg: darkMode ? 'bg-amber-900/20 border-amber-700 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-700' },
                rescheduled_by_user: { label: 'Client Counter', bg: darkMode ? 'bg-violet-900/20 border-violet-700 text-violet-400' : 'bg-violet-50 border-violet-300 text-violet-700' },
                completed: { label: 'Completed', bg: darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600' },
              };
              const typeIcon = { video: '🎥', audio: '📞', in_person: '🏛️' };
              const sortedBookings = [...bookings].sort((a, b) => {
                const order = { pending: 0, confirmed: 1, rescheduled: 2, completed: 3, cancelled: 4 };
                return (order[a.status] ?? 5) - (order[b.status] ?? 5);
              });

              const appType = user?.application_type || [];
              const isNormalLawyer = appType.includes('normal') && !appType.includes('sos');
              const isSosLawyer = appType.includes('sos') && !appType.includes('normal');
              const isBothLawyer = appType.includes('normal') && appType.includes('sos');

              // Tag bookings — if booking has source='sos' or sos_session_id, it's SOS-originated
              const normalBookings = sortedBookings.filter(b => !b.sos_session_id && b.source !== 'sos');
              const sosBookings = sortedBookings.filter(b => b.sos_session_id || b.source === 'sos');

              const BookingCard = ({ booking, isSOS }) => {
                const cfg = statusConfig[booking.status] || statusConfig.pending;
                const isPending = booking.status === 'pending' || booking.status === 'rescheduled_by_lawyer';
                const isConfirmed = booking.status === 'confirmed';
                return (
                  <div key={booking.id}
                    className={`rounded-2xl border p-5 transition-all ${darkMode ? 'bg-[#1a1b1e] border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-md shadow-sm'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: client info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${isSOS ? (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600') : (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
                          {(booking.client_name || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {booking.client_name || 'Client'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg}`}>{cfg.label}</span>
                            {isSOS
                              ? <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">🆘 SOS Client</span>
                              : <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">⚖️ Normal Client</span>
                            }
                            {isPending && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">⏳ Awaiting your response</span>}
                          </div>
                          <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {typeIcon[booking.consultation_type] || '📋'} {booking.consultation_type === 'video' ? 'Video' : booking.consultation_type === 'audio' ? 'Audio' : 'In-Person'} • {booking.date} at {booking.time}
                          </p>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {booking.price != null && (
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {booking.is_free_trial ? 'Free Trial' : `₹${booking.price}`}
                          </span>
                        )}
                        {isPending && (
                          <>
                            <button onClick={() => handleAcceptBooking(booking.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">✓ Accept</button>
                            <button onClick={() => { setSelectedBookingForReschedule(booking); setShowRescheduleModal(true); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>↻ Reschedule</button>
                            <button onClick={() => setBookingToDecline(booking.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${darkMode ? 'border-red-800 text-red-400 hover:bg-red-900/25' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>✕ Decline</button>
                          </>
                        )}
                        {isConfirmed && (() => {
                          const [h, mRest] = (booking.time || '00:00 AM').split(':');
                          const [m, period] = (mRest || '00 AM').split(' ');
                          let hours = parseInt(h, 10); const mins = parseInt(m, 10);
                          if (period === 'PM' && hours !== 12) hours += 12;
                          if (period === 'AM' && hours === 12) hours = 0;
                          const meetDate = booking.date ? new Date(`${booking.date}T00:00:00`) : null;
                          if (meetDate) meetDate.setHours(hours, mins, 0, 0);
                          const now = new Date();
                          const fiveMinBefore = meetDate ? new Date(meetDate.getTime() - 5 * 60 * 1000) : null;
                          const meetingEnded = meetDate ? now > new Date(meetDate.getTime() + 60 * 60 * 1000) : false;
                          const canJoin = fiveMinBefore && now >= fiveMinBefore && !meetingEnded;
                          if (!booking.meet_link || meetingEnded) return null;
                          return canJoin
                            ? <a href={booking.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors animate-pulse">🎥 Join Meet</a>
                            : <span title="Join opens 5 minutes before the meeting" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-not-allowed opacity-60 ${darkMode ? 'border-slate-700 text-slate-400 bg-slate-800' : 'border-slate-200 text-slate-400 bg-slate-100'}`}>🎥 Join Meet</span>;
                        })()}
                        {isConfirmed && (
                          <button onClick={() => handleBookingStatus(booking.id, 'completed')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${darkMode ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-900/25' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>✓ Mark Complete</button>
                        )}
                      </div>
                    </div>
                    {isConfirmed && (booking.consultation_type === 'video' || booking.consultation_type === 'audio') && (
                      <p className={`mt-2 text-[11px] ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>⏱ Sessions are limited to <strong>1 hour</strong>. Join becomes active 5 minutes before the scheduled time.</p>
                    )}
                    {booking.description && (
                      <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm ${darkMode ? 'bg-black/20 text-slate-300 border border-white/5' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                        <span className="font-semibold">Client note: </span>{booking.description}
                      </div>
                    )}
                    {/* ── User counter-proposed a new time — lawyer must respond ── */}
                    {booking.status === 'rescheduled_by_user' && (() => {
                      const dl = booking.reschedule_deadline ? new Date(booking.reschedule_deadline) : null;
                      const minsLeft = dl ? Math.max(0, Math.round((dl - new Date()) / 60000)) : 0;
                      const dlLabel = dl ? (minsLeft > 60 ? `${Math.floor(minsLeft/60)}h ${minsLeft%60}m left` : minsLeft > 0 ? `${minsLeft}m left` : 'Expired') : '';
                      return (
                        <div className={`mt-3 rounded-xl p-3 border ${darkMode ? 'bg-violet-900/20 border-violet-700/40' : 'bg-violet-50 border-violet-200'}`}>
                          <p className={`text-xs font-bold ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>🔄 Client Proposed New Time</p>
                          <p className={`text-sm font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{booking.proposed_date} at {booking.proposed_time}</p>
                          {dlLabel && <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-violet-400' : 'text-violet-500'}`}>⏱ {dlLabel} to respond — auto-cancels if no reply</p>}
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleLawyerRescheduleResponse(booking.id, 'accept')}
                              className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">✅ Accept Client's Time</button>
                            <button onClick={() => handleLawyerRescheduleResponse(booking.id, 'reject')}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${darkMode ? 'border-red-700 text-red-400 hover:bg-red-900/20' : 'border-red-300 text-red-600 hover:bg-red-50'} transition-colors`}>❌ Decline & Cancel</button>
                          </div>
                        </div>
                      );
                    })()}
                    {/* ── Waiting for user to respond banner ── */}
                    {booking.status === 'rescheduled_by_lawyer' && (() => {
                      const dl = booking.reschedule_deadline ? new Date(booking.reschedule_deadline) : null;
                      const minsLeft = dl ? Math.max(0, Math.round((dl - new Date()) / 60000)) : 0;
                      const dlLabel = dl ? (minsLeft > 60 ? `${Math.floor(minsLeft/60)}h ${minsLeft%60}m left` : minsLeft > 0 ? `${minsLeft}m left` : 'Expired') : '';
                      return (
                        <div className={`mt-3 rounded-xl p-3 border ${darkMode ? 'bg-amber-900/20 border-amber-700/40' : 'bg-amber-50 border-amber-200'}`}>
                          <p className={`text-xs font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>📅 Reschedule Sent — Awaiting Client Response</p>
                          <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Proposed: <strong>{booking.proposed_date} at {booking.proposed_time}</strong></p>
                          {dlLabel && <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>⏱ Client has {dlLabel} to respond — auto-cancels if no reply</p>}
                        </div>
                      );
                    })()}
                  </div>
                );
              };

              const SectionHeader = ({ label, count, color, icon }) => (
                <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h2 className={`font-bold text-lg ${color}`}>{label}</h2>
                    <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{count} appointment{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              );

              return (
                <div className={`p-8 min-h-full ${darkMode ? 'bg-[#0f1012]' : 'bg-slate-50'} transition-colors`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Appointments</h1>
                      <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage all incoming and upcoming consultation requests</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {Object.entries(statusConfig).map(([s, cfg]) => {
                        const cnt = bookings.filter(b => b.status === s).length;
                        if (!cnt) return null;
                        return <span key={s} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg}`}>{cfg.label}: {cnt}</span>;
                      })}
                    </div>
                  </div>

                  {/* Lawyer type context banner */}
                  <div className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border ${isBothLawyer ? (darkMode ? 'bg-purple-900/10 border-purple-800/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700')
                      : isSosLawyer ? (darkMode ? 'bg-red-900/10 border-red-800/40 text-red-300' : 'bg-red-50 border-red-200 text-red-700')
                        : (darkMode ? 'bg-blue-900/10 border-blue-800/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700')
                    }`}>
                    <span className="text-2xl">{isBothLawyer ? '⚡' : isSosLawyer ? '🆘' : '⚖️'}</span>
                    <div>
                      <p className="font-semibold text-sm">
                        {isBothLawyer ? 'You are a Normal + SOS Lawyer' : isSosLawyer ? 'You are an SOS Lawyer' : 'You are a Normal Lawyer'}
                      </p>
                      <p className="text-xs opacity-70">
                        {isBothLawyer ? 'Your clients are split below: Normal consultation bookings and emergency SOS clients appear in separate sections.'
                          : isSosLawyer ? 'You handle emergency SOS calls. Appointment bookings below may be follow-ups from SOS sessions.'
                            : 'You handle regular consultation bookings. Clients can book appointments for video, audio, or in-person sessions.'}
                      </p>
                    </div>
                  </div>

                  {sortedBookings.length === 0 ? (
                    <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${darkMode ? 'border-slate-800 text-slate-500' : 'border-gray-200 text-gray-400'}`}>
                      <CalendarCheck className="w-14 h-14 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-lg mb-1">No appointments yet</p>
                      <p className="text-sm opacity-70">When clients book consultations with you, they'll appear here.</p>
                    </div>
                  ) : isBothLawyer ? (
                    /* Split view for both-type lawyers */
                    <div className="space-y-10">
                      {/* Normal clients section */}
                      <div>
                        <SectionHeader label="Normal Clients" count={normalBookings.length} icon="⚖️" color={darkMode ? 'text-blue-400' : 'text-blue-700'} />
                        {normalBookings.length === 0
                          ? <div className={`text-center py-10 rounded-xl border-dashed border-2 text-sm ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>No normal consultation bookings yet</div>
                          : <div className="space-y-4">{normalBookings.map((b, i) => <BookingCard key={b.id || i} booking={b} isSOS={false} />)}</div>
                        }
                      </div>
                      {/* SOS clients section */}
                      <div>
                        <SectionHeader label="SOS Emergency Clients" count={sosBookings.length} icon="🆘" color={darkMode ? 'text-red-400' : 'text-red-700'} />
                        {sosBookings.length === 0
                          ? <div className={`text-center py-10 rounded-xl border-dashed border-2 text-sm ${darkMode ? 'border-red-900/30 border-red-800/40 text-red-500/50' : 'border-red-100 text-red-300'}`}>No SOS follow-up bookings yet</div>
                          : <div className="space-y-4">{sosBookings.map((b, i) => <BookingCard key={b.id || i} booking={b} isSOS={true} />)}</div>
                        }
                      </div>
                    </div>
                  ) : (
                    /* Single-type view */
                    <div className="space-y-4">
                      {sortedBookings.map((booking, idx) => (
                        <BookingCard key={booking.id || idx} booking={booking} isSOS={isSosLawyer} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === "cases" && (
              <CasesView cases={cases} darkMode={darkMode} onNewCase={() => setShowCaseModal(true)} />
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
                    // Custom events — blue
                    ...events
                      .filter((e) => e.type !== 'consultation')
                      .map((e) => ({
                        ...e,
                        start_time: e.start_time || new Date().toISOString(),
                        end_time: e.end_time || new Date().toISOString(),
                        color: e.type === 'hearing' ? 'amber' : e.type === 'personal' ? 'purple' : 'blue',
                        sessionType: 'EVENT',
                      })),
                    // Auto-added consultation events — color by consultation_type
                    ...events
                      .filter((e) => e.type === 'consultation')
                      .map((e) => {
                        const ctColor =
                          e.consultation_type === 'video' ? 'teal'
                            : e.consultation_type === 'in_person' ? 'rose'
                              : e.consultation_type === 'audio' ? 'blue'
                                : 'purple';
                        return {
                          ...e,
                          start_time: e.start_time || new Date().toISOString(),
                          end_time: e.end_time || new Date().toISOString(),
                          color: ctColor,
                          sessionType: 'CONSULTATION',
                        };
                      }),
                    // Court hearings — amber
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
                    // Confirmed bookings not yet in events — color by consultation_type
                    ...bookings
                      .filter((b) => b.status === "confirmed" || b.status === "pending")
                      .map((b) => {
                        const isPending = b.status === "pending";
                        const ctColor = isPending ? 'amber'
                          : b.consultation_type === 'video' ? 'teal'
                            : b.consultation_type === 'in_person' ? 'rose'
                              : b.consultation_type === 'audio' ? 'blue'
                                : 'purple';
                        return {
                          ...b,
                          id: `booking-${b.id}`,
                          title: isPending
                            ? `⏳ ${b.client_name || "Pending"} (${(b.consultation_type || 'video').replace('_', ' ')})`
                            : `📅 ${b.client_name || "Consultation"} (${(b.consultation_type || 'video').replace('_', ' ')})`,
                          start_time:
                            b.date && b.time
                              ? to24hrISO(b.date, b.time)
                              : b.start_time
                                ? new Date(b.start_time).toISOString()
                                : new Date().toISOString(),
                          type: "consultation",
                          color: ctColor,
                          sessionType: "CONSULTATION",
                          case: b.description || "Legal Consultation",
                        };
                      }),
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
                  <div className="relative">
                    <Button
                      onClick={() => setShowNewMsg(v => !v)}
                      className={`${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#0F2944] hover:bg-[#0F2944]/90"} text-white rounded-xl px-6 shadow-lg`}
                    >
                      + New Message
                    </Button>
                    {showNewMsg && (() => {
                      const seen = new Set();
                      const contacts = [];
                      bookings.forEach(b => {
                        const id = b.user_id || b.client_id;
                        if (id && !seen.has(id)) {
                          seen.add(id);
                          contacts.push({ id, name: b.user_name || b.client_name || 'Client', avatar: (b.user_name || b.client_name || 'C')[0].toUpperCase() });
                        }
                      });
                      if (contacts.length === 0) return (
                        <div className={`absolute right-0 top-12 w-64 rounded-2xl shadow-2xl border p-4 z-50 ${darkMode ? 'bg-[#1c1c1c] border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <p className="text-sm text-center">No clients yet. Clients who book you will appear here.</p>
                        </div>
                      );
                      return (
                        <div className={`absolute right-0 top-12 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden ${darkMode ? 'bg-[#1c1c1c] border-white/10' : 'bg-white border-gray-200'}`}>
                          <p className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b ${darkMode ? 'text-gray-500 border-white/5' : 'text-gray-400 border-gray-100'}`}>Message a Client</p>
                          {contacts.map(c => (
                            <div key={c.id} onClick={() => { handleSelectChat(c); setShowNewMsg(false); }} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{c.avatar}</div>
                              <p className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{c.name}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
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

                        {/* Permission Banner */}
                        {msgPermission && (
                          <div className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b
                            ${ !msgPermission.allowed
                              ? (darkMode ? 'bg-red-900/20 border-red-800/40 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
                              : msgPermission.quota_left === 1
                              ? (darkMode ? 'bg-amber-900/20 border-amber-800/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700')
                              : (darkMode ? 'bg-green-900/20 border-green-800/40 text-green-400' : 'bg-green-50 border-green-200 text-green-700')
                            }`}>
                            <span>
                              {!msgPermission.allowed ? '🔒' : msgPermission.quota_left === -1 ? '✅' : '⏳'}
                            </span>
                            <span>
                              {!msgPermission.allowed
                                ? msgPermission.reason
                                : msgPermission.quota_left === -1
                                ? 'Full messaging enabled — case approved'
                                : `Client has ${msgPermission.quota_left} pre-appointment message remaining`}
                            </span>
                          </div>
                        )}
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
                              placeholder={msgPermission && !msgPermission.allowed ? 'Confirm appointment to unlock messaging' : "Type your message..."}
                              disabled={msgPermission && !msgPermission.allowed}
                              className={`flex-1 rounded-full px-5 ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white text-gray-900 border-gray-200"} ${msgPermission && !msgPermission.allowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <Button
                              type="submit"
                              disabled={msgPermission && !msgPermission.allowed}
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${msgPermission && !msgPermission.allowed ? 'opacity-40 cursor-not-allowed bg-gray-500' : 'bg-blue-600 hover:bg-blue-500'}`}
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
            {activeTab === "documents" && (() => {
              // Only show documents uploaded from the dashboard (source=personal)
              // Fall back: exclude docs that have LxwyerNetwork-style fields (file_url from network)
              const personalDocs = documents.filter(d =>
                d.source === 'personal' || (!d.source && !d.network_message_id)
              );

              // If a folder is active, also filter by folder docIds
              const activeFolderObj = folders.find(f => f.id === activeFolderId);
              const displayedDocs = activeFolderId
                ? personalDocs.filter(d => activeFolderObj?.docIds.includes(d.id))
                : personalDocs;

              const handleCreateFolder = () => {
                if (!newFolderName.trim()) return;
                const folderColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#16a34a', '#0891b2'];
                const id = 'folder_' + Date.now();
                setFolders(prev => [...prev, {
                  id,
                  name: newFolderName.trim(),
                  icon: '📁',
                  color: folderColors[folders.length % folderColors.length],
                  docIds: [],
                }]);
                setNewFolderName('');
                setShowNewFolderModal(false);
                toast.success(`Folder "${newFolderName.trim()}" created!`);
              };

              const moveDocToFolder = (docId, folderId) => {
                setFolders(prev => prev.map(f => ({
                  ...f,
                  docIds: folderId === f.id
                    ? [...new Set([...f.docIds, docId])]
                    : f.docIds.filter(id => id !== docId),
                })));
              };

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}>
                          Document Vault
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center ${darkMode ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-100 text-green-700 border-green-200"}`}>
                          <Shield className="w-3 h-3 mr-1" />End-to-End Encrypted
                        </span>
                      </div>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Your personal documents only · {personalDocs.length} file{personalDocs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* New Folder button */}
                      <button
                        onClick={() => setShowNewFolderModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <span className="text-base">📁</span> New Folder
                      </button>
                      {/* Upload button */}
                      {!hasUploadPermission ? (
                        <Button
                          onClick={() => { setHasUploadPermission(true); toast.success("Access granted!"); }}
                          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 shadow-lg shadow-amber-900/20 flex items-center space-x-2"
                        >
                          <Shield className="w-4 h-4" /><span>Grant Upload Access</span>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} />
                          <Button
                            onClick={() => document.getElementById('doc-upload').click()}
                            className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl px-5 shadow-lg flex items-center gap-2`}
                            disabled={loading}
                          >
                            <FileText className="w-4 h-4" />
                            {loading ? 'Uploading...' : (activeFolderId ? `Upload to ${folders.find(f => f.id === activeFolderId)?.name || 'Folder'}` : 'Upload File')}
                          </Button>
                          <button
                            onClick={() => setHasUploadPermission(false)}
                            className={`text-xs ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                          >Revoke</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-7">
                    {/* My Documents */}
                    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500`}><FileText className="w-5 h-5" /></div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>My Documents</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#0F2944]'}`}>{personalDocs.length}</p>
                      </div>
                    </div>
                    {/* Storage Used with progress bar */}
                    <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isStorageFull ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}><span className="text-lg">💾</span></div>
                        <div>
                          <p className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Storage Used</p>
                          <p className={`text-lg font-bold ${isStorageFull ? 'text-red-500' : darkMode ? 'text-white' : 'text-[#0F2944]'}`}>{totalStorageDisplay} <span className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 1 GB</span></p>
                        </div>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-amber-500' : 'bg-purple-500'
                            }`}
                          style={{ width: `${Math.max(storagePercent, 1)}%` }}
                        />
                      </div>
                      {isStorageFull && <p className="text-red-500 text-[10px] font-medium mt-1">Storage full — delete files to upload more</p>}
                    </div>
                    {/* Recent Uploads */}
                    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-100'} shadow-sm`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500`}><Clock className="w-5 h-5" /></div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recent Uploads</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#0F2944]'}`}>{recentUploadsCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Folders Row */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Folders</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {/* All files chip */}
                      <button
                        onClick={() => setActiveFolderId(null)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${activeFolderId === null
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        🗂️ All Files <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFolderId === null ? 'bg-white/20' : darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>{personalDocs.length}</span>
                      </button>
                      {folders.map(folder => (
                        <button
                          key={folder.id}
                          onClick={() => setActiveFolderId(folder.id === activeFolderId ? null : folder.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${activeFolderId === folder.id
                            ? 'text-white shadow-md'
                            : darkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          style={activeFolderId === folder.id ? { background: folder.color, borderColor: folder.color } : {}}
                        >
                          {folder.icon} {folder.name}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFolderId === folder.id ? 'bg-white/20' : darkMode ? 'bg-white/10' : 'bg-gray-200'
                            }`}>{folder.docIds.length}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className={`rounded-2xl border shadow-sm ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full min-w-[700px]">
                        <thead className={`border-b ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <tr>
                          {['Document Name', 'Folder', 'Type', 'Date', 'Size', 'Actions'].map(h => (
                            <th key={h} className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedDocs.length > 0 ? (
                          displayedDocs.map((doc, idx) => (
                            <tr key={idx} className={`border-b transition-all duration-200 ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <td className="px-6 py-4 flex items-center space-x-2">
                                <FileText className={`w-5 h-5 ${doc.file_type?.includes('pdf') ? 'text-red-500' : 'text-blue-500'}`} />
                                <a
                                  href={`${API.replace('/api', '')}${doc.file_url}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className={`font-medium transition-colors ${darkMode ? 'text-gray-200 hover:text-blue-400' : 'text-[#0F2944] hover:text-blue-600'}`}
                                >{doc.title}</a>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={folders.find(f => f.docIds.includes(doc.id))?.id || ''}
                                  onChange={e => moveDocToFolder(doc.id, e.target.value)}
                                  className={`text-xs rounded-lg px-2 py-1 border outline-none cursor-pointer ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                    }`}
                                >
                                  <option value="">No folder</option>
                                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${darkMode ? 'bg-white/10 text-gray-300 border-white/5' : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}>
                                  {doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'MMM d, yyyy') : 'N/A'}
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {doc.file_size ? (doc.file_size / 1024).toFixed(1) + ' KB' : '---'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => { setSelectedDocForShare(doc); setShowShareModal(true); }}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-1" title="Share"
                                  ><Share2 className="w-5 h-5" /></button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1" title="Delete"
                                  ><Archive className="w-5 h-5" /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className={`px-6 py-16 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                              <p className="text-sm mb-4">{activeFolderId ? 'No documents in this folder yet.' : 'No personal documents yet. Upload your first file above.'}</p>
                              {activeFolderId && hasUploadPermission && (
                                <>
                                  <input type="file" id={`folder-upload-${activeFolderId}`} className="hidden" onChange={(e) => handleFileUpload(e, activeFolderId)} />
                                  <button
                                    onClick={() => document.getElementById(`folder-upload-${activeFolderId}`).click()}
                                    disabled={loading}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${darkMode
                                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                      }`}
                                  >
                                    <FileText className="w-4 h-4" />
                                    {loading ? 'Uploading...' : `Upload to ${folders.find(f => f.id === activeFolderId)?.name || 'Folder'}`}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      </table>
                    </div>
                  </div>

                  {/* New Folder Modal */}
                  {showNewFolderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewFolderModal(false)}>
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                      <div
                        className={`relative z-10 w-96 rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-[#1c1c1c] border border-white/10' : 'bg-white border border-gray-200'}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Folder</h3>
                        <input
                          type="text"
                          placeholder="Folder name…"
                          value={newFolderName}
                          onChange={e => setNewFolderName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                          autoFocus
                          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none mb-4 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                            }`}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleCreateFolder}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                          >Create Folder</button>
                          <button
                            onClick={() => setShowNewFolderModal(false)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                          >Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })()}


            {/* Lawyer Network Tab */}
            {/* Lawyer Network Tab */}
            {activeTab === "network" && (
              <div className="absolute inset-0 top-[60px]" style={{ zIndex: 10 }}>
                <LxwyerNetwork currentUser={user} darkMode={darkMode} />
              </div>
            )}


            {/* Signature Application Tab */}
            {activeTab === "signature_apply" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 pb-32 min-h-[85vh] bg-black rounded-[2.5rem]">
                <div className="max-w-4xl mx-auto mt-12">
                  <div className="text-center mb-12">
                    <Star className="w-16 h-16 text-[#d4af37] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
                    <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4">Ascend to Signature</h1>
                    <p className="text-[#d4af37] tracking-widest uppercase text-sm font-bold bg-[#d4af37]/10 py-2 px-6 rounded-full inline-flex border border-[#d4af37]/30">Exclusive Legal Network</p>
                  </div>
                  
                  <div className="bg-[#111] border border-[#d4af37]/30 rounded-[2rem] p-8 sm:p-12 shadow-[0_0_50px_rgba(212,175,55,0.05)] relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Strict Exclusivity Mandate</h2>
                    <p className="text-white/70 text-lg leading-relaxed font-medium relative z-10">
                      The Signature tier is the highest echelon of LxwyerUp. By applying, you agree to absolute exclusivity: 
                      <span className="text-[#d4af37] font-black"> You cannot register, list, or broker consultations on any other legal digital platform. </span>
                      Breach of this mandate results in instant delisting and forfeit of premium access metrics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Vantage Plan */}
                    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:border-[#d4af37]/50 transition-colors flex flex-col relative group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent group-hover:via-[#d4af37] transition-all"></div>
                      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Vantage Plan</h3>
                      <p className="text-white/50 font-bold uppercase text-xs mb-6 tracking-widest">Yearly Retainer</p>
                      <div className="text-4xl font-black text-[#d4af37] mb-8">₹40,000<span className="text-sm text-white/30">/yr</span></div>
                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 items-center text-white/80 font-medium"><CheckCircle className="w-5 h-5 text-[#d4af37]" /> Priority Global Routing</li>
                        <li className="flex gap-3 items-center text-white/80 font-medium"><CheckCircle className="w-5 h-5 text-[#d4af37]" /> Dedicated Account Concierge</li>
                        <li className="flex gap-3 items-center text-white/80 font-medium"><CheckCircle className="w-5 h-5 text-[#d4af37]" /> Zero Platform Commision</li>
                      </ul>
                      <button onClick={() => handleSignatureApplication('yearly')} disabled={loading} className="w-full py-4 bg-white/5 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-[#d4af37] hover:text-black transition-all border border-white/10 hover:border-[#d4af37] disabled:opacity-50">Apply for Vantage</button>
                    </div>

                    {/* Focus Plan */}
                    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-colors flex flex-col relative group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/50 transition-all"></div>
                      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Focus Plan</h3>
                      <p className="text-white/50 font-bold uppercase text-xs mb-6 tracking-widest">6-Month Terminal</p>
                      <div className="text-4xl font-black text-white mb-8">₹25,000<span className="text-sm text-white/30">/6mo</span></div>
                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 items-center text-white/80 font-medium"><CheckCircle className="w-5 h-5 text-white/50" /> Premium Routing</li>
                        <li className="flex gap-3 items-center text-white/80 font-medium"><CheckCircle className="w-5 h-5 text-white/50" /> Standard Support SLA</li>
                        <li className="flex gap-3 items-center text-white/80 font-medium"><CheckCircle className="w-5 h-5 text-white/50" /> Baseline Exclusivity Benefits</li>
                      </ul>
                      <button onClick={() => handleSignatureApplication('6month')} disabled={loading} className="w-full py-4 bg-white/5 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all border border-white/10 hover:border-white disabled:opacity-50">Apply for Focus</button>
                    </div>
                  </div>

                </div>
              </motion.div>
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
                    onClick={generateEarningsReport}
                    className={`${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-[#0F2944] hover:bg-[#0F2944]/90 text-white"} rounded-xl px-6 shadow-lg`}
                  >
                    Generate Report
                  </Button>
                </div>

                {/* Revenue Stats */}
                <div className={`grid grid-cols-1 md:grid-cols-${user?.application_type?.includes('sos') ? '4' : '3'} gap-6 mb-8`}>
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
                      ₹{(billingStats.total_earned || dashboardData.stats.revenue || 0).toLocaleString('en-IN')}
                    </h3>
                    <p className={`text-xs mt-1 relative z-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {billingStats.total_transactions || 0} consultations
                    </p>
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
                      ₹{thisMonthEarnings.toLocaleString('en-IN')}
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
                      ₹{pendingPayments.toLocaleString('en-IN')}
                    </h3>
                  </div>

                  {user?.application_type?.includes('sos') && (
                    <div
                      className={`backdrop-blur-xl rounded-2xl border p-6 relative overflow-hidden group shadow-lg ${darkMode ? "bg-red-900/10 border-red-500/10" : "bg-red-50/70 border-red-200"}`}
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50"></div>
                      <p
                        className={`text-sm mb-2 relative z-10 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        SOS Penalties
                      </p>
                      <h3
                        className={`text-4xl font-bold relative z-10 text-red-500`}
                      >
                        -₹{totalSosPenalties.toLocaleString('en-IN')}
                      </h3>
                      <p className={`text-xs mt-1 relative z-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Deducted from payouts
                      </p>
                    </div>
                  )}
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

                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[700px]">
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
                        billingHistory.map((bill, idx) => {
                          const status = bill.status || 'paid';
                          const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
                          const statusClass = status === 'paid'
                            ? darkMode ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-100 text-green-700 border border-green-200'
                            : status === 'pending'
                              ? darkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              : darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-700 border border-red-200';
                          return (
                            <tr
                              key={idx}
                              className={`border-b transition-all duration-200 ${darkMode ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                            >
                              <td className={`px-6 py-4 font-mono text-xs font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                #{(bill.id || '').substring(0, 8).toUpperCase()}
                              </td>
                              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-[#0F2944]"}`}>
                                {bill.description?.replace('Consultation with ', '') || 'Client'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                {bill.consultation_type || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {bill.date ? new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              </td>
                              <td className={`px-6 py-4 font-semibold ${darkMode ? "text-white" : "text-[#0F2944]"}`}>
                                ₹{Number(bill.amount || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                                  {displayStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className={`px-6 py-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                          >
                            No billing history found — completed consultations will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SOS Performance Tab */}
            {activeTab === "sos" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#0F2944]"}`}>
                      SOS Performance & Disputes
                    </h1>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Track missed urgent calls and resulting penalties
                    </p>
                  </div>
                </div>

                {/* ── SOS Mode Toggle Panel ── */}
                <div className={`rounded-2xl border mb-6 overflow-hidden ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-blue-50 border-blue-100'}`}>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/5' : 'border-blue-100'}`}>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Your SOS Participation Mode</h2>
                    <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      You can change your SOS mode at any time. Changes take effect immediately.
                    </p>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Talk Only Card */}
                    <button
                      onClick={async () => {
                        setSosTypeLoading(true);
                        try {
                          const token = localStorage.getItem('token');
                          await axios.patch(`${API}/sos/lawyer/toggle-type`, { sos_type: 'sos_talk' }, { headers: { Authorization: `Bearer ${token}` } });
                          setSosType('sos_talk');
                          toast.success('SOS mode updated: Talk Only');
                        } catch (e) { toast.error('Failed to update SOS mode'); }
                        finally { setSosTypeLoading(false); }
                      }}
                      disabled={sosTypeLoading || (user?.sos_type || sosType) === 'sos_talk'}
                      className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                        (user?.sos_type || sosType) === 'sos_talk' || (!user?.sos_type && !sosType)
                          ? darkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'
                          : darkMode ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {((user?.sos_type || sosType) === 'sos_talk' || (!user?.sos_type && !sosType)) && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">ACTIVE</span>
                      )}
                      <div className="text-2xl mb-2">🎙️</div>
                      <p className={`font-bold text-base mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>SOS Talk Only</p>
                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Handle emergency consultations <strong>remotely via call or video</strong>. You will NOT be required to physically travel to any client.
                      </p>
                      <div className={`mt-3 text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Client fee: ₹300 / session</div>
                    </button>

                    {/* Full SOS Card */}
                    <button
                      onClick={async () => {
                        setSosTypeLoading(true);
                        try {
                          const token = localStorage.getItem('token');
                          await axios.patch(`${API}/sos/lawyer/toggle-type`, { sos_type: 'sos_full' }, { headers: { Authorization: `Bearer ${token}` } });
                          setSosType('sos_full');
                          toast.success('SOS mode updated: Full SOS Lawyer');
                        } catch (e) { toast.error('Failed to update SOS mode'); }
                        finally { setSosTypeLoading(false); }
                      }}
                      disabled={sosTypeLoading || (user?.sos_type || sosType) === 'sos_full'}
                      className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                        (user?.sos_type || sosType) === 'sos_full'
                          ? darkMode ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'
                          : darkMode ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {(user?.sos_type || sosType) === 'sos_full' && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">ACTIVE</span>
                      )}
                      <div className="text-2xl mb-2">🚗</div>
                      <p className={`font-bold text-base mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Full SOS Lawyer</p>
                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        You may be required to <strong>physically travel to the client</strong> within 30 minutes when requested. You can decline if genuinely unavailable.
                      </p>
                      <div className={`mt-3 text-xs font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Client fee: ₹1,100 base + ₹400/30 min extra</div>
                    </button>
                  </div>
                  {sosTypeLoading && (
                    <div className="px-6 pb-4 flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Updating SOS mode...
                    </div>
                  )}
                </div>
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "bg-[#1c1c1c] border-white/5" : "bg-white border-gray-200"}`}>
                  <div className={`p-6 border-b ${darkMode ? "border-white/5" : "border-gray-100"}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}>
                      SOS Missed Calls History
                    </h2>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[700px]">
                    <thead className={`border-b ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <tr>
                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Time</th>
                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Penalty Amount</th>
                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                        <th className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sosCalls.length > 0 ? (
                        sosCalls.map((call, idx) => {
                          const statusClass = call.status === 'penalized'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : call.status === 'disputed'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : call.status === 'waived'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200';

                          return (
                            <tr key={call.id || idx} className={`border-b transition-all duration-200 ${darkMode ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}>
                              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                {new Date(call.call_timestamp).toLocaleString()}
                              </td>
                              <td className={`px-6 py-4 font-semibold ${darkMode ? "text-white" : "text-[#0F2944]"}`}>
                                ₹{call.penalty_amount || 250}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                                  {call.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {(call.status === 'pending' || call.status === 'penalized') ? (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCallForDispute(call);
                                      setShowDisputeModal(true);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    File Dispute
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-sm">Action Complete</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className={`px-6 py-8 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                            No SOS missed calls recorded. Excellent work!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dispute Modal */}
            {showDisputeModal && selectedCallForDispute && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-white"}`}
                >
                  <div className={`p-6 border-b flex justify-between items-center ${darkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F2944]"}`}>
                      Dispute Missed SOS Call
                    </h3>
                    <button
                      onClick={() => setShowDisputeModal(false)}
                      className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleDisputeSubmit} className="p-6 space-y-4">
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Time: {new Date(selectedCallForDispute.call_timestamp).toLocaleString()}
                    </p>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Reason for Missing Call *
                      </label>
                      <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Please explain why you missed the call..."
                        rows={4}
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-blue-500" : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Attach Proof (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setDisputeFile(e.target.files[0])}
                        className={`w-full p-2 border rounded-lg text-sm ${darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowDisputeModal(false)}
                        className={darkMode ? "text-gray-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      >
                        {loading ? "Submitting..." : "Submit Dispute"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
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
                    <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-medium ${darkMode ? 'bg-amber-900/20 text-amber-400 border border-amber-800/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      <span className="text-base leading-none mt-0.5">⏰</span>
                      <span>Rescheduled slot must be <strong>within the next 24 hours</strong> from now.</span>
                    </div>
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
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
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
                    {/* Share to Lxwyer Network */}
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setActiveTab('network');
                        toast.info(`Navigate to Network to share "${selectedDocForShare?.title}"`);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all group ${darkMode
                        ? 'border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10'
                        : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-bold group-hover:text-blue-500 ${darkMode ? 'text-white' : 'text-[#0F2944]'}`}>
                          Share to Lxwyer Network
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Share with other lawyers on the platform
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    </button>

                    <div className={`flex items-center gap-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                      <div className="flex-1 h-px bg-current" />
                      <span className="text-xs font-medium uppercase tracking-wider">or share with client</span>
                      <div className="flex-1 h-px bg-current" />
                    </div>

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
                          className={`text-center py-4 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}
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

                          {selectedSession.consultation_type === "video" && (() => {
                            const [h, mRest] = (selectedSession.time || '00:00 AM').split(':');
                            const [m, period] = (mRest || '00 AM').split(' ');
                            let hours = parseInt(h, 10);
                            const mins = parseInt(m, 10);
                            if (period === 'PM' && hours !== 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            const meetDate = selectedSession.date ? new Date(`${selectedSession.date}T00:00:00`) : null;
                            if (meetDate) meetDate.setHours(hours, mins, 0, 0);
                            const now = new Date();
                            const fiveMinBefore = meetDate ? new Date(meetDate.getTime() - 5 * 60 * 1000) : null;
                            const meetingEnded = meetDate ? now > new Date(meetDate.getTime() + 60 * 60 * 1000) : false;
                            const canJoin = fiveMinBefore && now >= fiveMinBefore && !meetingEnded;
                            return (
                              <div className="pt-2">
                                {canJoin ? (
                                  <a
                                    href={selectedSession.meet_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors font-medium animate-pulse"
                                  >
                                    <Video className="w-5 h-5" />
                                    <span>Join</span>
                                  </a>
                                ) : (() => {
                                  const minsLeft = fiveMinBefore ? Math.ceil((fiveMinBefore - now) / 60000) : null;
                                  return (
                                    <div className={`flex items-center justify-center space-x-2 w-full py-3 rounded-xl font-medium text-sm border cursor-not-allowed opacity-60 ${darkMode ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                      <Video className="w-5 h-5" />
                                      <span>Join</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })()}

                          {/* 1-hour disclaimer in modal */}
                          {(selectedSession.consultation_type === 'video' || selectedSession.consultation_type === 'audio') && (
                            <p className={`text-[11px] mt-1 ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
                              ⏱ Sessions are limited to <strong>1 hour</strong>. Join becomes active 5 minutes before the scheduled time.
                            </p>
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

      {/* Booking Decline Confirmation Modal */}
      {bookingToDecline && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBookingToDecline(null)} />
          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${darkMode ? 'bg-[#111113] border-white/10' : 'bg-white border-slate-200'
            }`}>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h3 className={`text-lg font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Decline Appointment?
            </h3>
            <p className={`text-sm text-center mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Are you sure you want to decline this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingToDecline(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Keep
              </button>
              <button
                onClick={() => { handleDeclineBooking(bookingToDecline); setBookingToDecline(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Yes, Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Appointments Modal */}
      <PendingAppointmentsModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        bookings={pendingBookings}
        onAccept={handleAcceptBooking}
        onDecline={(id) => setBookingToDecline(id)}
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
