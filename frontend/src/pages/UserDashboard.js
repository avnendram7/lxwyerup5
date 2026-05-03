import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Scale, LogOut, LayoutDashboard, Calendar, MessageSquare, FileText, Send, User, Clock, MapPin, Shield, FileCheck, Mic, CheckCircle, Search, Gavel, AlertTriangle, ListChecks, BookOpen, TrendingUp, Video, Moon, Sun, Sparkles, Bell, X, Briefcase, RefreshCw, Camera, HelpCircle, Zap, Filter, ChevronDown, ChevronUp, ExternalLink, PhoneCall, Phone, Star, Download, Share2, Archive, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import UserHowToUseModal from '../components/dashboard/user/HowToUseModal';
import LawyerCard from '../components/LawyerCard';
import VoiceModeOverlay from '../components/VoiceModeOverlay';

// Legal Analysis Card Component
const LegalAnalysisCard = ({ icon: Icon, title, content, borderColor, bgColor, darkMode }) => (
  <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'} rounded-xl p-4 border-t-4 ${borderColor} ${darkMode ? 'shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'shadow-md'} hover:shadow-lg transition-all`}>
    <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{title}</h4>
    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{content}</p>
  </div>
);

// Legal Sections Component
const LegalSectionsCard = ({ sections, darkMode }) => (
  <div className={`bg-gradient-to-br ${darkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-slate-50 to-blue-50 border-blue-100'} rounded-xl p-5 border`}>
    <div className="flex items-center space-x-2 mb-4">
      <BookOpen className="w-5 h-5 text-blue-600" />
      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Relevant Legal Sections</h4>
    </div>
    <div className="space-y-3">
      {sections.map((section, idx) => (
        <div key={idx} className="text-sm">
          <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{section.title}:</span>
          <span className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} ml-1`}>{section.description}</span>
        </div>
      ))}
    </div>
  </div>
);

// Parse AI response to detect if it's a legal query
const parseLegalResponse = (response) => {
  const lowerResponse = response.toLowerCase();

  // Keywords that indicate a legal case discussion
  const legalKeywords = ['section', 'ipc', 'bail', 'punishment', 'court', 'trial', 'offense', 'crime', 'murder', 'theft', 'fraud', 'property', 'divorce', 'custody', 'maintenance', 'cheque bounce', 'consumer', 'complaint', 'fir', 'cognizable', 'non-bailable', 'bailable', 'imprisonment', 'fine', 'hearing', 'advocate', 'lawyer'];

  const isLegalQuery = legalKeywords.some(keyword => lowerResponse.includes(keyword));

  if (!isLegalQuery) return null;

  // Try to extract case type from response
  let caseType = 'General Legal Matter';
  let severity = 'Moderate';
  let bailInfo = 'Depends on case specifics';
  let punishment = 'Varies based on offense';
  let timeline = '6-24 months typically';
  let crimeType = 'Civil/Criminal';
  let firstSteps = 'Consult a lawyer immediately';
  let sections = [];

  // Detect specific case types
  if (lowerResponse.includes('murder') || lowerResponse.includes('302')) {
    caseType = 'Murder under Section 302 IPC';
    severity = 'Extreme';
    bailInfo = 'Generally not granted';
    punishment = 'Life imprisonment or death penalty';
    timeline = '24-60 months';
    crimeType = 'Non-bailable, Cognizable';
    firstSteps = 'Immediate legal consultation, evidence preservation';
    sections = [
      { title: 'Section 302 - Murder', description: 'Punishment for murder - death or life imprisonment' },
      { title: 'Section 300 - Murder definition', description: 'Defines what constitutes murder' },
      { title: 'Section 304 - Culpable homicide', description: 'Not amounting to murder - up to 10 years' }
    ];
  } else if (lowerResponse.includes('theft') || lowerResponse.includes('379')) {
    caseType = 'Theft under Section 379 IPC';
    severity = 'Moderate';
    bailInfo = 'Generally granted';
    punishment = 'Up to 3 years imprisonment';
    timeline = '6-18 months';
    crimeType = 'Bailable, Cognizable';
    firstSteps = 'File FIR, gather evidence, consult lawyer';
    sections = [
      { title: 'Section 378 - Theft definition', description: 'Moving property without consent' },
      { title: 'Section 379 - Punishment', description: 'Up to 3 years imprisonment or fine' },
      { title: 'Section 380 - Theft in dwelling', description: 'Up to 7 years imprisonment' }
    ];
  } else if (lowerResponse.includes('divorce') || lowerResponse.includes('marriage') || lowerResponse.includes('custody')) {
    caseType = 'Family Law Matter';
    severity = 'Moderate';
    bailInfo = 'Not applicable (civil matter)';
    punishment = 'Alimony/Maintenance as per court';
    timeline = '12-36 months';
    crimeType = 'Civil Matter';
    firstSteps = 'Gather marriage documents, financial records';
    sections = [
      { title: 'Hindu Marriage Act', description: 'Governs Hindu marriages and divorce' },
      { title: 'Section 125 CrPC', description: 'Maintenance for wife, children' },
      { title: 'Domestic Violence Act', description: 'Protection against domestic abuse' }
    ];
  } else if (lowerResponse.includes('property') || lowerResponse.includes('land') || lowerResponse.includes('possession')) {
    caseType = 'Property Dispute';
    severity = 'Moderate';
    bailInfo = 'Generally granted if applicable';
    punishment = 'Civil remedies, possible criminal charges';
    timeline = '12-48 months';
    crimeType = 'Civil/Criminal';
    firstSteps = 'Verify documents, title search, legal notice';
    sections = [
      { title: 'Transfer of Property Act', description: 'Governs property transfers' },
      { title: 'Section 420 IPC', description: 'Cheating and dishonestly inducing delivery' },
      { title: 'Specific Relief Act', description: 'Recovery of possession' }
    ];
  } else if (lowerResponse.includes('consumer') || lowerResponse.includes('defect') || lowerResponse.includes('service')) {
    caseType = 'Consumer Complaint';
    severity = 'Low to Moderate';
    bailInfo = 'Not applicable (civil matter)';
    punishment = 'Compensation, refund, replacement';
    timeline = '3-12 months';
    crimeType = 'Civil Matter';
    firstSteps = 'Collect bills, complaint to company first';
    sections = [
      { title: 'Consumer Protection Act 2019', description: 'Rights of consumers' },
      { title: 'Section 2(7) - Consumer', description: 'Definition of consumer' },
      { title: 'Section 35 - District Forum', description: 'Filing complaints up to ₹1 crore' }
    ];
  } else if (lowerResponse.includes('bail') || lowerResponse.includes('anticipatory')) {
    caseType = 'Bail Application';
    severity = 'Varies';
    bailInfo = 'Depends on offense type';
    punishment = 'Not applicable';
    timeline = '1-4 weeks for hearing';
    crimeType = 'Procedural';
    firstSteps = 'Prepare bail application, surety arrangements';
    sections = [
      { title: 'Section 436 CrPC', description: 'Bail in bailable offenses' },
      { title: 'Section 437 CrPC', description: 'Bail in non-bailable offenses' },
      { title: 'Section 438 CrPC', description: 'Anticipatory bail' }
    ];
  } else if (lowerResponse.includes('cheque') || lowerResponse.includes('138') || lowerResponse.includes('dishonour')) {
    caseType = 'Cheque Bounce - Section 138 NI Act';
    severity = 'Moderate';
    bailInfo = 'Generally granted';
    punishment = 'Up to 2 years imprisonment or fine';
    timeline = '6-18 months';
    crimeType = 'Bailable, Compoundable';
    firstSteps = 'Send legal notice within 30 days of return';
    sections = [
      { title: 'Section 138 NI Act', description: 'Dishonor of cheque for insufficiency' },
      { title: 'Section 141 NI Act', description: 'Offenses by companies' },
      { title: 'Section 143 NI Act', description: 'Summary trial procedure' }
    ];
  }

  return {
    caseType,
    analysis: {
      bailInfo,
      punishment,
      timeline,
      crimeType,
      severity,
      firstSteps
    },
    sections
  };
};


export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [msgPermission, setMsgPermission] = useState(null); // { allowed, reason, quota_left }
  const [dashboardData, setDashboardData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('lxwyerDashboardTheme');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('lxwyerDashboardTheme', JSON.stringify(darkMode));
  }, [darkMode]);
  const [lawyerSearch, setLawyerSearch] = useState('');
  const [lawyerFilter, setLawyerFilter] = useState('');
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [msgSearch, setMsgSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  // Booking modal
  const [bookingLawyer, setBookingLawyer] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingType, setBookingType] = useState('video');
  const [lawyersLoaded, setLawyersLoaded] = useState(false);
  // Cancel booking confirm
  const [cancelBookingId, setCancelBookingId] = useState(null);
  // Reschedule response state (user responding to lawyer's reschedule)
  const [rescheduleResponse, setRescheduleResponse] = useState(null); // { bookingId, proposedDate, proposedTime, deadline }
  const [counterDate, setCounterDate] = useState('');
  const [counterTime, setCounterTime] = useState('');
  const [showCounterForm, setShowCounterForm] = useState(null); // bookingId
  // Case creation
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseType, setNewCaseType] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [caseLoading, setCaseLoading] = useState(false);
  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileExpandedCard, setProfileExpandedCard] = useState(null);
  // Doc upload
  const [docUploading, setDocUploading] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  // Folder state (client-side)
  const [folders, setFolders] = useState([
    { id: 'general', name: 'General', icon: '📁', color: '#2563eb', docIds: [] },
  ]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocForShare, setSelectedDocForShare] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  // Rating modal
  const [ratingModal, setRatingModal] = useState(null); // { bookingId, lawyerName }
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSaving, setRatingSaving] = useState(false);
  // Voice mode for Legal AI Chat
  const [showVoiceModeAI, setShowVoiceModeAI] = useState(false);
  // ── SOS (inline) state ──────────────────────────────────────────────────
  const [sosMode, setSosMode] = useState(null);           // 'talk' | 'visit'
  const [sosStep, setSosStep] = useState('select');       // select|form|radar_preview|payment|searching|matched|session|no_lawyer|error
  const [sosForm, setSosForm] = useState({ state: '', city: '', issueType: '', name: '', phone: '' });
  const [sosMatchedLawyer, setSosMatchedLawyer] = useState(null);
  const [sosSessionId, setSosSessionId] = useState(null);
  const [sosActiveSession, setSosActiveSession] = useState(null);
  const [sosDeclineCount, setSosDeclineCount] = useState(0);
  const [sosTxnId, setSosTxnId] = useState(null);
  const [sosPotentialLawyers, setSosPotentialLawyers] = useState([]);
  const [sosPaymentMethod, setSosPaymentMethod] = useState('upi');
  const [sosUpiId, setSosUpiId] = useState('');
  const [sosCardNum, setSosCardNum] = useState('');
  const [sosCardExp, setSosCardExp] = useState('');
  const [sosCardCvv, setSosCardCvv] = useState('');
  const [sosPaymentProcessing, setSosPaymentProcessing] = useState(false);
  const [sosTicks, setSosTicks] = useState(0);
  const [sosOtp, setSosOtp] = useState('');
  const [sosCurrentOtp, setSosCurrentOtp] = useState(null);
  const [sosShowOtp, setSosShowOtp] = useState(false);
  const SOS_STATES = ['Delhi', 'Haryana', 'Uttar Pradesh'];
  const SOS_CITIES = {
    'Delhi': ['Central Delhi','East Delhi','New Delhi','North Delhi','South Delhi','West Delhi'],
    'Haryana': ['Ambala','Faridabad','Gurugram','Hisar','Karnal','Panipat','Rohtak','Sonipat'],
    'Uttar Pradesh': ['Agra','Aligarh','Ghaziabad','Kanpur','Lucknow','Mathura','Meerut','Prayagraj','Varanasi'],
  };
  const SOS_ISSUE_TYPES = {
    criminal: '⚖️ Criminal / Bail', family: '👨‍👩‍👧 Family / Divorce',
    civil: '🏠 Civil / Property',   cyber: '💻 Cyber / Fraud',
    traffic: '🚗 Traffic / Accident', other: '📋 Other Urgent',
  };

  // Storage stats for Document Vault
  const { totalStorageBytes, storagePercent, isStorageFull, totalStorageDisplay, recentUploadsCount, STORAGE_LIMIT_BYTES } = useMemo(() => {
    const LIMIT = 1024 * 1024 * 1024; // 1 GB
    const bytes = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);
    const pct = Math.min(100, (bytes / LIMIT) * 100);
    const full = pct >= 100;
    let display = bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    const recent = documents.filter(d => {
      if (!d.uploaded_at) return false;
      const diff = Date.now() - new Date(d.uploaded_at).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
    }).length;
    return { totalStorageBytes: bytes, storagePercent: pct, isStorageFull: full, totalStorageDisplay: display, recentUploadsCount: recent, STORAGE_LIMIT_BYTES: LIMIT };
  }, [documents]);



  // SOS: short-poll for lawyer match when in searching state
  useEffect(() => {
    let id;
    if (sosStep === 'searching' && sosSessionId) {
      id = setInterval(async () => {
        try {
          const res = await axios.get(`${API}/sos/status/${sosSessionId}`);
          if (res.data.status === 'matched') {
            setSosMatchedLawyer(res.data.lawyer);
            setSosStep('matched');
            clearInterval(id);
          } else if (res.data.status === 'no_lawyer') {
            setSosStep('no_lawyer');
            clearInterval(id);
          }
        } catch (_) {}
      }, 3000);
    }
    return () => { if (id) clearInterval(id); };
  }, [sosStep, sosSessionId]);


  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target.result);
      sessionStorage.setItem('profileImage', ev.target.result);
    };
    reader.readAsDataURL(file);
    // Upload to API
    try {
      const fd = new FormData();
      fd.append('file', file);
      const tok = getToken();
      const res = await axios.post(`${API}/auth/upload-image`, fd, {
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'multipart/form-data' }
      });
      const updated = { ...user, photo: res.data.url };
      setUser(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Photo preview saved locally. API upload failed.');
    }
  };

  const buildNotifications = () => {
    const notifs = [];
    if (bookings.filter(b => b.status === 'pending').length > 0)
      notifs.push({ id: 'pending-bookings', icon: Calendar, text: `${bookings.filter(b => b.status === 'pending').length} appointment(s) awaiting confirmation`, tab: 'consultation' });
    if (cases.filter(c => c.status === 'active').length > 0)
      notifs.push({ id: 'active-cases', icon: Briefcase, text: `${cases.filter(c => c.status === 'active').length} active case(s) need attention`, tab: 'cases' });
    if (documents.length > 0)
      notifs.push({ id: 'docs', icon: FileText, text: `${documents.length} document(s) in your vault`, tab: 'documents' });
    return notifs;
  };

  const markOneRead = (id) => setReadNotifIds(prev => [...prev, id]);

  const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');
  const token = getToken(); // kept for compatibility in places that still use it directly

  // Safely extract a string from an API error (FastAPI 422 returns detail as array of objects)
  const getErrMsg = (err, fallback = 'Something went wrong') => {
    const d = err?.response?.data?.detail;
    if (!d) return fallback;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map(e => e?.msg || String(e)).join(', ');
    if (typeof d === 'object') return d.msg || JSON.stringify(d);
    return String(d);
  };

  const fetchData = useCallback(async () => {

    const tok = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!tok) return;
    const headers = { Authorization: `Bearer ${tok}` };

    const [casesRes, docsRes, bookingsRes, lawyersRes, dashboardRes, messagesRes, eligibleRes] =
      await Promise.allSettled([
        axios.get(`${API}/cases`, { headers }),
        axios.get(`${API}/documents`, { headers }),
        axios.get(`${API}/bookings`, { headers }),
        axios.get(`${API}/lawyers`),
        axios.get(`${API}/dashboard/user`, { headers }),
        axios.get(`${API}/messages/recents`, { headers }),
        axios.get(`${API}/messages/eligible-contacts`, { headers }),
      ]);

    // Smart extract: handles both [] and {cases:[]} / {bookings:[]}
    // IMPORTANT: returns null (not the raw object) to prevent Pydantic errors from being set as state
    const extract = (res, keys) => {
      if (res.status !== 'fulfilled') return null;
      const d = res.value.data;
      if (Array.isArray(d)) return d;
      for (const k of keys) if (d && Array.isArray(d[k])) return d[k];
      return null; // was `return d` — caused Pydantic error objects to crash React renderer
    };

    const casesData = extract(casesRes, ['cases']);
    const docsData = extract(docsRes, ['documents', 'docs']);
    const bookingsData = extract(bookingsRes, ['bookings']);
    const lawyersData = extract(lawyersRes, ['lawyers', 'data']);
    const messagesData = extract(messagesRes, ['conversations', 'messages', 'recents']);
    const eligibleData = eligibleRes.status === 'fulfilled' && Array.isArray(eligibleRes.value.data) ? eligibleRes.value.data : [];

    if (Array.isArray(casesData)) setCases(casesData);
    if (Array.isArray(docsData)) setDocuments(docsData);
    if (Array.isArray(bookingsData)) setBookings(bookingsData);
    if (Array.isArray(lawyersData)) {
      if (lawyersData.length === 0) {
        // Fallback dummy lawyers so UI is visible during testing when remote DB is empty
        setLawyers([
          {
            id: 'dummy_lawyer_1',
            name: 'Karan Bajaj',
            specialization: 'Corporate Law',
            experience_years: 10,
            fee_30min: 1500,
            city: 'Delhi',
            successRate: 98,
            photo: 'https://i.pravatar.cc/150?u=karan'
          },
          {
            id: 'dummy_lawyer_2',
            name: 'Priya Sharma',
            specialization: 'Corporate Law',
            experience_years: 8,
            fee_30min: 1200,
            city: 'Mumbai',
            successRate: 95,
            photo: 'https://i.pravatar.cc/150?u=priya'
          },
          {
            id: 'dummy_lawyer_3',
            name: 'Rahul Singh',
            specialization: 'Criminal Law',
            experience_years: 12,
            fee_30min: 2000,
            city: 'Delhi',
            successRate: 92,
            photo: 'https://i.pravatar.cc/150?u=rahul'
          },
          {
            id: 'dummy_lawyer_4',
            name: 'Amit Gupta',
            specialization: 'Family Law',
            experience_years: 5,
            fee_30min: 1000,
            city: 'Bangalore',
            successRate: 90,
            photo: 'https://i.pravatar.cc/150?u=amit'
          }
        ]);
      } else {
        setLawyers(lawyersData);
      }
    }
    setLawyersLoaded(true);
    if (dashboardRes.status === 'fulfilled' && dashboardRes.value.data && typeof dashboardRes.value.data === 'object' && !Array.isArray(dashboardRes.value.data) && !dashboardRes.value.data.detail) {
      setDashboardData(dashboardRes.value.data);
    }

    // Merge eligible contacts with actual message history (eligible-first, then fill in last msg from recents)
    const recents = Array.isArray(messagesData) ? messagesData : [];
    const recentIds = new Set(recents.map(r => r.other_user_id || r.id));
    const merged = [...recents];
    for (const ec of eligibleData) {
      if (!recentIds.has(ec.other_user_id)) merged.push(ec);
    }
    setMessages(merged);
  }, []);


  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { }
    }
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput, isStructured: false };
    setChatMessages(prev => [...prev, userMsg]);
    const q = chatInput;
    setChatInput('');
    setLoading(true);
    const tok = getToken();
    try {
      const response = await axios.post(`${API}/chat/legal`, { message: q }, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      const aiResponse = response.data.response || response.data.reply || response.data.message || JSON.stringify(response.data);
      const legalData = parseLegalResponse(aiResponse);
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse, isStructured: !!legalData, legalData }]);
    } catch {
      try {
        const fallback = await axios.post(`${API}/chat/legal`, { message: q });
        const aiResponse = fallback.data.response || fallback.data.reply || fallback.data.message || 'I could not process that request.';
        const legalData = parseLegalResponse(aiResponse);
        setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse, isStructured: !!legalData, legalData }]);
      } catch {
        toast.error('AI service unavailable. Please try again.');
        setChatMessages(prev => prev.slice(0, -1));
      }
    } finally { setLoading(false); }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setMsgPermission(null);
    const tok = getToken();
    try {
      const otherId = chat.other_user_id || chat.id;
      const [historyRes, permRes] = await Promise.allSettled([
        axios.get(`${API}/messages/${otherId}`, { headers: { Authorization: `Bearer ${tok}` } }),
        axios.get(`${API}/messages/can-message/${otherId}`, { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      if (historyRes.status === 'fulfilled') setChatHistory(historyRes.value.data);
      if (permRes.status === 'fulfilled') setMsgPermission(permRes.value.data);
    } catch { toast.error('Failed to load chat'); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    if (msgPermission && !msgPermission.allowed) {
      toast.error(msgPermission.reason || 'Messaging not allowed');
      return;
    }
    const tok = getToken();
    const otherId = selectedChat.other_user_id || selectedChat.id;
    try {
      await axios.post(`${API}/messages`, {
        receiver_id: otherId, content: newMessage
      }, { headers: { Authorization: `Bearer ${tok}` } });
      setNewMessage('');
      const [histRes, permRes] = await Promise.allSettled([
        axios.get(`${API}/messages/${otherId}`, { headers: { Authorization: `Bearer ${tok}` } }),
        axios.get(`${API}/messages/can-message/${otherId}`, { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      if (histRes.status === 'fulfilled') setChatHistory(histRes.value.data);
      if (permRes.status === 'fulfilled') setMsgPermission(permRes.value.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || 'Failed to send message');
    }
  };

  const exampleQuestions = [
    "What is Section 302 IPC?",
    "Explain anticipatory bail",
    "Property dispute rights",
    "Consumer complaint process"
  ];

  // ── Book Appointment ─────────────────────────────────────────────────────
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingLawyer || !bookingDate || !bookingTime) {
      toast.error('Please fill all required fields'); return;
    }
    setBookingLoading(true);
    try {
      await axios.post(`${API}/bookings`, {
        lawyer_id: bookingLawyer._id || bookingLawyer.id,
        lawyer_name: bookingLawyer.full_name || bookingLawyer.name,
        date: bookingDate, time: bookingTime, notes: bookingNote,
        consultation_type: bookingType,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success('Appointment booked successfully!');
      setBookingLawyer(null);
      setBookingDate(''); setBookingTime(''); setBookingNote(''); setBookingType('video');
      fetchData();
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to book appointment'));
    } finally { setBookingLoading(false); }
  };

  // ── Cancel Booking ────────────────────────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    try {
      await axios.patch(`${API}/bookings/${cancelBookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success('Appointment cancelled');
      setBookings(prev => prev.map(b => (b._id || b.id) === cancelBookingId ? { ...b, status: 'cancelled' } : b));
    } catch { toast.error('Failed to cancel appointment'); }
    finally { setCancelBookingId(null); }
  };

  // ── Reschedule Response (User) ────────────────────────────────────────────
  const handleAcceptReschedule = async (bookingId, proposedDate, proposedTime) => {
    try {
      await axios.post(`${API}/bookings/${bookingId}/reschedule-response`,
        { action: 'accept' },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('✅ Reschedule accepted! Appointment confirmed.');
      setBookings(prev => prev.map(b =>
        (b._id || b.id) === bookingId
          ? { ...b, status: 'confirmed', date: proposedDate, time: proposedTime, proposed_date: null, proposed_time: null, reschedule_deadline: null }
          : b
      ));
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to accept reschedule'));
    }
  };

  const handleCounterReschedule = async (bookingId) => {
    if (!counterDate || !counterTime) { toast.error('Please pick a date and time'); return; }
    try {
      await axios.post(`${API}/bookings/${bookingId}/reschedule-response`,
        { action: 'counter', date: counterDate, time: counterTime },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('🔄 Counter-proposal sent! Waiting for lawyer to respond.');
      setBookings(prev => prev.map(b =>
        (b._id || b.id) === bookingId
          ? { ...b, status: 'rescheduled_by_user', proposed_date: counterDate, proposed_time: counterTime }
          : b
      ));
      setShowCounterForm(null); setCounterDate(''); setCounterTime('');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to send counter-proposal'));
    }
  };

  // ── Create Case ──────────────────────────────────────────────────────────
  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseTitle || !newCaseType) { toast.error('Title and type are required'); return; }
    setCaseLoading(true);
    try {
      const res = await axios.post(`${API}/cases`, {
        title: newCaseTitle,
        case_type: newCaseType,
        description: newCaseDesc || 'No description provided',
        case_number: `CASE-${Date.now()}`,
        status: 'active',
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setCases(prev => [res.data, ...prev]);
      toast.success('Case created successfully!');
      setShowCaseForm(false);
      setNewCaseTitle(''); setNewCaseType(''); setNewCaseDesc('');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to create case'));
    } finally { setCaseLoading(false); }
  };

  // ── Save Profile ─────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await axios.put(`${API}/auth/me`, profileForm, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const updated = { ...user, ...res.data };
      setUser(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated!');
      setEditingProfile(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileSaving(false); }
  };

  // ── Upload Document ───────────────────────────────────────────────────────
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', file.name);
      const res = await axios.post(`${API}/documents/upload`, fd, {
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [res.data, ...prev]);
      toast.success('Document uploaded!');
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setDocUploading(false);
    }
  };

  // ── Rate Lawyer ───────────────────────────────────────────────────────────
  const handleRateLawyer = async () => {
    if (!ratingModal || ratingValue === 0) { toast.error('Please select a star rating'); return; }
    setRatingSaving(true);
    try {
      await axios.post(`${API}/bookings/${ratingModal.bookingId}/review`, {
        rating: ratingValue, comment: ratingComment
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success('Thank you for your review!');
      setRatingModal(null); setRatingValue(0); setRatingComment('');
      fetchData();
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to submit review'));
    } finally { setRatingSaving(false); }
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      await axios.delete(`${API}/documents/${docToDelete._id || docToDelete.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setDocuments(prev => prev.filter(d => (d._id || d.id) !== (docToDelete._id || docToDelete.id)));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDocToDelete(null);
    }
  };

  // Load saved profile image
  useEffect(() => {
    const saved = sessionStorage.getItem('profileImage');
    if (saved && saved !== 'null' && saved !== 'undefined') {
      setProfileImage(saved);
    } else if (user && user.photo) {
      setProfileImage(user.photo);
    } else {
      setProfileImage(null);
    }
  }, [user]);

  // Sync profileForm when user loads
  useEffect(() => {
    if (user) setProfileForm({ full_name: user.full_name || user.name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  return (
    <>
    <div className={`${darkMode ? 'bg-black' : 'bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0F2FE]'} flex overflow-hidden font-sans`}
      style={{ height: '100dvh' }}
    >
      {showHowToUse && (
        <UserHowToUseModal darkMode={darkMode} onClose={() => setShowHowToUse(false)} />
      )}
      {/* Floating Sidebar — hidden on mobile, visible on md+ */}
      <div className={`hidden md:flex w-44 m-3 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white/50'} rounded-2xl flex-col py-3 shadow-[0_4px_20px_rgba(0,0,0,0.10)] border backdrop-blur-sm z-20 h-[calc(100dvh-1.5rem)] transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className="px-4 py-3 flex items-center gap-2.5 mb-1">
          <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 rounded-xl object-contain shadow shadow-blue-500/30 shrink-0" style={{ mixBlendMode: darkMode ? "normal" : "screen", backgroundColor: darkMode ? "transparent" : "#1e40af" }} />
          <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>LxwyerUp</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'consultation', icon: Calendar, label: 'Book a Lawyer' },
            { id: 'cases', icon: Briefcase, label: 'My Cases' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
            { id: 'documents', icon: FileText, label: 'Documents' },
            { id: 'profile', icon: User, label: 'My Profile' },
          ].map((item) => (
            <button
              key={item.id}
              data-testid={`${item.id}-nav-btn`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
                : `${darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-blue-400' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`
                }`}
            >
              <item.icon className="w-[14px] h-[14px] shrink-0" />
              <span className="text-[11px] font-semibold truncate">{item.label}</span>
            </button>
          ))}
          {/* LxwyerAI Premium — external */}
          <button
            data-testid="lxwyerai-nav-btn"
            onClick={() => navigate('/lxwyerai-premium')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-blue-400' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <Sparkles className="w-[14px] h-[14px] shrink-0" />
            <span className="text-[11px] font-semibold truncate">LxwyerAI ✨</span>
          </button>
        </nav>

        {/* Bottom buttons */}
        <div className={`px-2 pb-2 pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-gray-100'} flex flex-col gap-0.5`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-blue-400' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            {darkMode ? <Sun className="w-[14px] h-[14px] shrink-0" /> : <Moon className="w-[14px] h-[14px] shrink-0" />}
            <span className="text-[11px] font-semibold truncate">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {/* SOS Emergency — inline in dashboard */}
          <button
            onClick={() => setActiveTab('sos')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all font-bold ${
              activeTab === 'sos'
                ? 'bg-red-600 text-white shadow shadow-red-500/20'
                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <PhoneCall className="w-[14px] h-[14px] shrink-0" />
            <span className="text-[11px] font-semibold">SOS / Emergency</span>
          </button>

          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-red-400 ${darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
          >
            <LogOut className="w-[14px] h-[14px] shrink-0" />
            <span className="text-[11px] font-semibold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 m-2 md:m-4 md:ml-0 mb-0 ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white/40 border-white/60'} backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col relative transition-all duration-300`}>

        {/* Top Header Bar */}
        <div className={`px-6 py-4 flex items-center justify-between ${darkMode ? 'bg-slate-900/30 border-slate-700/50' : 'bg-white/30 border-white/40'} backdrop-blur-md border-b sticky top-0 z-50 transition-colors`}>
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Hi, {(user?.full_name || user?.name || 'User').split(' ')[0]} 👋
              {user?.unique_id && (
                <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                  ID: {user.unique_id}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 font-medium">Your weekly legal update</p>
          </div>

          <div className="flex items-center gap-3">
            {/* How-to-Use */}
            <button
              onClick={() => setShowHowToUse(true)}
              className={`w-10 h-10 ${darkMode ? 'bg-slate-800 text-blue-400 hover:text-blue-300' : 'bg-white text-blue-500 hover:text-blue-600'} rounded-full flex items-center justify-center shadow-sm transition-colors`}
              title="How to use this dashboard"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className={`w-10 h-10 ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-white text-gray-500 hover:text-blue-600'} rounded-full flex items-center justify-center shadow-sm transition-all`}
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-5 h-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-white text-gray-500 hover:text-blue-600'} rounded-full flex items-center justify-center shadow-sm transition-colors`}
              >
                <Bell className="w-5 h-5" />
                {(() => {
                  const unreadCount = buildNotifications().filter(n => !readNotifIds.includes(n.id)).length;
                  if (unreadCount === 0) return null;
                  return (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  );
                })()}
              </button>
              {showNotifications && (() => {
                const allNotifs = buildNotifications();
                return (
                  <div className={`absolute right-0 top-12 w-80 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl border z-50 overflow-hidden`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {allNotifs.length === 0 ? (
                        <p className={`text-sm text-center py-6 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>No new notifications</p>
                      ) : allNotifs.map(n => (
                        <button key={n.id} onClick={() => { markOneRead(n.id); setActiveTab(n.tab); setShowNotifications(false); }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${!readNotifIds.includes(n.id) ? (darkMode ? 'bg-blue-900/10' : 'bg-blue-50') : ''} ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-blue-100'}`}>
                            <n.icon className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{n.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Profile avatar */}
            <button
              onClick={() => setActiveTab('profile')}
              title="My Profile"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-900 p-[2px] hover:scale-105 transition-transform"
            >
              <div className={`w-full h-full rounded-full ${darkMode ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
                {profileImage
                  ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" onError={(e) => { e.target.style.display = 'none'; setProfileImage(null); }} />
                  : <User className="w-5 h-5 text-gray-400" />}
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto dashboard-scroll custom-scrollbar p-0 pb-16 md:pb-0">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="p-4 md:p-8 space-y-8">

              {/* Stats Section with Horizontal Scroll/Grid */}
              <div>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Overview</h2>
                  <div className="flex gap-2">
                    <button className={`w-8 h-8 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-gray-400 hover:text-blue-600'} flex items-center justify-center shadow-sm transition-colors`}><span className="text-lg">‹</span></button>
                    <button className={`w-8 h-8 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-gray-400 hover:text-blue-600'} flex items-center justify-center shadow-sm transition-colors`}><span className="text-lg">›</span></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1 - Active Cases */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group cursor-pointer`} onClick={() => setActiveTab('cases')}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-blue-100`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Gavel className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Active Cases</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{cases.filter(c => c.status === 'active' || c.status === 'open').length}</span>
                        {cases.filter(c => c.status === 'active' || c.status === 'open').length > 0 && (
                          <span className={`text-xs ${darkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-500 bg-blue-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>In progress</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{cases.length === 0 ? 'No cases yet' : `${cases.length} total case${cases.length !== 1 ? 's' : ''}`}</p>
                    </div>
                  </div>

                  {/* Card 2 - Pending Docs */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group cursor-pointer`} onClick={() => setActiveTab('documents')}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-blue-100`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Documents</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{documents.length}</span>
                        {documents.length > 0 && <span className={`text-xs ${darkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-500 bg-blue-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>In vault</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{documents.length === 0 ? 'No documents yet' : 'Click to manage'}</p>
                    </div>
                  </div>

                  {/* Card 3 - Appointments */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group cursor-pointer`} onClick={() => setActiveTab('consultation')}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-blue-100`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Appointments</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}</span>
                        {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                          <span className={`text-xs ${darkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-500 bg-blue-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>Upcoming</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{bookings.length === 0 ? 'No bookings yet' : `${bookings.length} total`}</p>
                    </div>
                  </div>

                  {/* Card 4 - Messages */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group cursor-pointer`} onClick={() => setActiveTab('messages')}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-blue-100`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Messages</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{messages.length}</span>
                        {messages.length > 0 && <span className={`text-xs ${darkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-500 bg-blue-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>Active</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{messages.length === 0 ? 'No messages yet' : 'Click to view'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Account Summary Card */}
                {(() => {
                  const totalItems = cases.length + documents.length + bookings.length;
                  const activeItems = cases.filter(c => c.status === 'active' || c.status === 'open').length
                    + bookings.filter(b => b.status === 'confirmed').length;
                  const pct = totalItems === 0 ? 0 : Math.round((activeItems / Math.max(totalItems, 1)) * 100);
                  const nextBooking = bookings
                    .filter(b => b.status === 'confirmed' || b.status === 'pending')
                    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                  return (
                    <div className="lg:col-span-1 bg-gradient-to-br from-blue-800 to-black rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold mb-4">Account Summary</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-100">Cases</span>
                              <span className="font-bold">{cases.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-100">Appointments</span>
                              <span className="font-bold">{bookings.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-100">Documents</span>
                              <span className="font-bold">{documents.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-100">Messages</span>
                              <span className="font-bold">{messages.length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          {nextBooking ? (
                            <>
                              <h4 className="font-semibold mb-1 text-sm">Next Appointment</h4>
                              <p className="text-blue-100 text-xs mb-3">{nextBooking.date} {nextBooking.time ? `at ${nextBooking.time}` : ''}</p>
                            </>
                          ) : (
                            <p className="text-blue-100 text-xs mb-3">No upcoming appointments</p>
                          )}
                          <button onClick={() => setActiveTab('consultation')} className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                            Book a Lawyer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Upcoming List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Timeline & Activity</h2>
                    <span onClick={() => setActiveTab('consultation')} className={`text-xs font-semibold px-3 py-1 ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600'} rounded-full shadow-sm cursor-pointer transition-colors`}>View History →</span>
                  </div>

                  <div className={`${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-white/60 border-white/60'} backdrop-blur-md rounded-[2rem] p-6 shadow-sm border`}>
                    <div className="space-y-3">
                      {/* Real bookings as timeline items */}
                      {bookings.length === 0 && cases.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-8 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          <Calendar className="w-10 h-10 mb-2 opacity-40" />
                          <p className="text-sm">No activity yet. Book a lawyer to get started.</p>
                        </div>
                      ) : (
                        [...bookings.slice(0, 3).map(b => ({ type: 'booking', data: b })),
                        ...cases.slice(0, 2).map(c => ({ type: 'case', data: c }))]
                          .slice(0, 4)
                          .map((item, idx) => {
                            if (item.type === 'booking') {
                              const b = item.data;
                              const isCancelled = b.status === 'cancelled';
                              return (
                                <div key={`b-${idx}`} className={`flex items-center justify-between p-4 ${isCancelled
                                  ? (darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100')
                                  : (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]')
                                  } rounded-2xl border hover:shadow-md transition-all`}>
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${isCancelled ? 'bg-red-100 text-red-500' : (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600')} rounded-xl flex items-center justify-center`}>
                                      <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Appointment {isCancelled ? '(Cancelled)' : `— ${b.status}`}
                                      </h4>
                                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {b.lawyer_name || 'Lawyer'} • {b.date || 'Date TBD'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xs font-bold ${isCancelled ? 'text-red-500' : (darkMode ? 'text-gray-300' : 'text-gray-800')} block capitalize`}>{b.status}</span>
                                    <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{b.time || ''}</span>
                                  </div>
                                </div>
                              );
                            } else {
                              const c = item.data;
                              return (
                                <div key={`c-${idx}`} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'} rounded-2xl border hover:shadow-md transition-all`}>
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center`}>
                                      <Gavel className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{c.title || 'Case'}</h4>
                                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{c.case_type || c.type || 'Legal Matter'} • {c.status}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xs font-bold capitalize ${darkMode ? 'text-gray-300' : 'text-gray-800'} block`}>{c.status}</span>
                                  </div>
                                </div>
                              );
                            }
                          })
                      )}

                      {/* Upcoming Appointments List */}
                      {(() => {
                        const upcoming = bookings
                          .filter(b => b.status === 'confirmed' || b.status === 'pending')
                          .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
                          .slice(0, 4);
                        return (
                          <div className="mt-4 p-4">
                            <p className={`text-xs font-semibold mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>📅 Upcoming Appointments</p>
                            {upcoming.length === 0 ? (
                              <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-400'} text-center py-4`}>No upcoming appointments</p>
                            ) : (
                              <div className="space-y-2">
                                {upcoming.map((b, i) => (
                                  <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${b.status === 'confirmed' ? 'bg-blue-400' : 'bg-slate-400'}`} />
                                      <span className={`text-xs font-medium truncate ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                                        {b.lawyer_name || 'Lawyer'}
                                      </span>
                                    </div>
                                    <span className={`text-xs flex-shrink-0 ml-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                      {b.date}{b.time ? ` ${b.time}` : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Overview + Legal Tips Row */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Activity Chart (pure CSS SVG bars) */}
                <div className={`lg:col-span-3 rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>Activity Overview</h3>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Your legal activity this week</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>Last 7 days</span>
                  </div>
                  {(() => {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    // Build per-day activity counts from actual bookings data
                    const today = new Date();
                    const dayData = days.map((d, i) => {
                      const date = new Date(today);
                      date.setDate(today.getDate() - (6 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const cnt = bookings.filter(b => b.created_at && b.created_at.startsWith(dateStr)).length
                        + cases.filter(c => c.created_at && c.created_at.startsWith(dateStr)).length;
                      return { label: d, value: cnt, isToday: i === 6 };
                    });
                    const maxVal = Math.max(...dayData.map(d => d.value), 1);
                    return (
                      <div className="flex items-end gap-3 h-28">
                        {dayData.map(({ label, value, isToday }) => (
                          <div key={label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                              <div
                                className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-blue-500' : darkMode ? 'bg-slate-700 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-400'}`}
                                style={{ height: `${Math.max(((value / maxVal) * 80), 6)}px` }}
                                title={`${value} action${value !== 1 ? 's' : ''}`}
                              />
                            </div>
                            <span className={`text-[10px] font-semibold ${isToday ? 'text-blue-500' : darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dashed border-opacity-30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-sm ${darkMode ? 'bg-slate-700' : 'bg-blue-100'}`} />
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>This Week</span>
                    </div>
                    <span className={`ml-auto text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {bookings.length + cases.length} total actions
                    </span>
                  </div>
                </div>

                {/* Legal Tips Carousel */}
                <div className={`lg:col-span-2 rounded-2xl border p-5 flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className={`font-bold text-base mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💡 Legal Tips</h3>
                  {(() => {
                    const tips = [
                      { title: 'Know Your FIR Rights', body: 'You have the right to get a free copy of the FIR. Police cannot refuse under Section 154 CrPC.', icon: '⚖️' },
                      { title: 'Tenant Rights', body: 'A landlord cannot cut water/electricity to evict you. This is illegal under Rent Control Acts.', icon: '🏠' },
                      { title: 'Consumer Protection', body: 'File complaints online at consumerhelpline.gov.in. Response is mandated within 30 days.', icon: '🛡️' },
                      { title: 'Bail Eligibility', body: 'Most bailable offences allow you to get bail directly from the police station without a court hearing.', icon: '🔑' },
                      { title: 'Right to Silence', body: 'You can refuse to answer questions that may incriminate you. You are not bound to be a witness against yourself.', icon: '🤐' },
                    ];
                    const idx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % tips.length;
                    const tip = tips[idx];
                    return (
                      <div className="flex-1 flex flex-col gap-3">
                        <div className={`flex-1 rounded-xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                          <div className="text-2xl mb-2">{tip.icon}</div>
                          <h4 className={`font-bold text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tip.title}</h4>
                          <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{tip.body}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Tip of the day • Indian Law</span>
                          <button onClick={() => navigate('/lxwyerai-premium')} className="text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors">Ask AI →</button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pb-6">

                <h2 className={`text-lg font-bold mb-4 px-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Book a Lawyer', icon: Calendar, color: 'from-blue-500 to-blue-600', tab: 'consultation' },
                    { label: 'LxwyerAI ✨', icon: Sparkles, color: 'from-blue-600 to-blue-800', action: () => navigate('/lxwyerai-premium') },
                    { label: 'Upload Doc', icon: FileText, color: 'from-slate-700 to-slate-900', tab: 'documents' },
                    { label: 'Open Case', icon: Gavel, color: 'from-blue-900 to-black', tab: 'cases' },
                  ].map(({ label, icon: Icon, color, tab, action }) => (
                    <button key={label} onClick={action || (() => setActiveTab(tab))}
                      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg hover:scale-105 active:scale-95 transition-all`}>
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Consultation Tab */}
          {activeTab === 'consultation' && (
            <div className={`p-6 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} min-h-full`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Book a Lawyer</h1>
                  <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Browse verified lawyers and book instantly.</p>
                </div>
                <button onClick={() => navigate('/find-lawyer/manual')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow transition-colors">
                  <ExternalLink className="w-4 h-4" /> Full Directory
                </button>
              </div>

              {/* Search & Filter */}
              <div className={`flex flex-wrap gap-3 mb-6 p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={lawyerSearch} onChange={e => setLawyerSearch(e.target.value)} placeholder="Search by name or specialization..."
                    className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                </div>
                <select value={lawyerFilter} onChange={e => setLawyerFilter(e.target.value)}
                  className={`px-4 py-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                  <option value="">All Specializations</option>
                  {['Criminal', 'Family', 'Property', 'Consumer', 'Corporate', 'Civil', 'Tax', 'Labour', 'Immigration'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {(lawyerSearch || lawyerFilter) && (
                  <button onClick={() => { setLawyerSearch(''); setLawyerFilter(''); }}
                    className={`px-4 py-2.5 text-sm rounded-xl border font-medium ${darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Reset</button>
                )}
              </div>

              {/* Recommended Lawyers based on last appointment */}
              {(() => {
                // Find most recent booking's lawyer ID
                const lastBooking = bookings.length > 0 ? bookings[0] : null;
                const lastLawyerId = lastBooking ? (lastBooking.lawyer_id || lastBooking.lawyerId) : null;

                if (!lastLawyerId || lawyers.length === 0) return null;

                const bookedLawyer = lawyers.find(l => (l.id || l._id) === lastLawyerId);
                const spec = bookedLawyer?.specialization || bookedLawyer?.practice_area;
                if (!spec) return null;

                const specSearch = spec.toLowerCase();
                const recommended = lawyers.filter(l => {
                  const s = (l.specialization || l.practice_area || '').toLowerCase();
                  return s === specSearch;
                });

                if (recommended.length === 0) return null;

                return (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recommended for you ({spec})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
                      {recommended.slice(0, 3).map((lawyer, idx) => {
                        const lid = lawyer._id || lawyer.id;
                        // Format lawyer specifically for LawyerCard component to ensure compatibility
                        const formattedLawyer = {
                          ...lawyer,
                          name: lawyer.full_name || lawyer.name,
                          experience: lawyer.experience_years || lawyer.experience,
                          feeMin: lawyer.fee_30min || lawyer.hourly_rate || lawyer.fee
                        };
                        return (
                          <div key={lid} className="relative">
                            <LawyerCard
                              lawyer={formattedLawyer}
                              index={idx}
                              onProfileClick={() => navigate(`/lawyer/${lid}`)}
                              onBookClick={() => setBookingLawyer(lawyer)}
                            />
                            <div className="absolute -top-3 -right-2 z-10 py-1 px-3 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-lg">TOP MATCH</div>
                          </div>
                        );
                      })}
                    </div>
                    {recommended.length > 3 && (
                      <div className="flex justify-center mt-2">
                        <button onClick={() => navigate('/find-lawyer/manual')} className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                          View {recommended.length - 3} more <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* All Lawyer Cards */}
              {(() => {
                const filtered = lawyers.filter(l => {
                  const name = (l.full_name || l.name || '').toLowerCase();
                  const spec = (l.specialization || l.practice_area || '').toLowerCase();
                  const search = lawyerSearch.toLowerCase();
                  return (!search || name.includes(search) || spec.includes(search)) &&
                    (!lawyerFilter || spec.includes(lawyerFilter.toLowerCase()));
                });
                if (filtered.length === 0) return (
                  <div className={`text-center py-14 rounded-2xl border mb-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" />
                    {!lawyersLoaded ? (
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Loading lawyers...</p>
                    ) : lawyers.length === 0 ? (
                      <>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>No approved lawyers yet</p>
                        <p className={`text-xs mt-1 mb-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Lawyers need admin approval before appearing here.</p>
                        <button onClick={() => navigate('/find-lawyer/manual')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow">Browse Full Directory</button>
                      </>
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No lawyers match your search.</p>
                    )}
                  </div>
                );

                return (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Lawyers</h2>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{filtered.length} found</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
                      {filtered.slice(0, 3).map((lawyer, idx) => {
                        const lid = lawyer._id || lawyer.id;
                        // Format lawyer specifically for LawyerCard component to ensure compatibility
                        const formattedLawyer = {
                          ...lawyer,
                          name: lawyer.full_name || lawyer.name,
                          experience: lawyer.experience_years || lawyer.experience,
                          feeMin: lawyer.fee_30min || lawyer.hourly_rate || lawyer.fee
                        };
                        return (
                          <LawyerCard
                            key={lid}
                            lawyer={formattedLawyer}
                            index={idx}
                            onProfileClick={() => navigate(`/lawyer/${lid}`)}
                            onBookClick={() => setBookingLawyer(lawyer)}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => navigate('/find-lawyer/manual')} className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-semibold text-sm shadow-md transition-colors flex items-center gap-2">
                        Browse Full Directory <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* My Appointments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Appointments</h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{bookings.length} total</span>
                </div>
                {bookings.length === 0 ? (
                  <div className={`text-center py-10 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No appointments yet. Book a lawyer above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => {
                      const bid = b._id || b.id;
                      const isRescheduledByLawyer = b.status === 'rescheduled_by_lawyer';
                      const isRescheduledByUser = b.status === 'rescheduled_by_user';
                      let deadlineLabel = '';
                      if ((isRescheduledByLawyer || isRescheduledByUser) && b.reschedule_deadline) {
                        const dl = new Date(b.reschedule_deadline);
                        const minsLeft = Math.max(0, Math.round((dl - new Date()) / 60000));
                        deadlineLabel = minsLeft > 60 ? `${Math.floor(minsLeft / 60)}h left` : minsLeft > 0 ? `${minsLeft}m left` : 'Expired';
                      }
                      const statusColor = b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : b.status === 'completed' ? 'bg-blue-100 text-blue-700' : isRescheduledByLawyer ? 'bg-amber-100 text-amber-700' : isRescheduledByUser ? 'bg-violet-100 text-violet-700' : 'bg-yellow-100 text-yellow-700';
                      let canJoin = false, meetingEnded = false;
                      if (b.status === 'confirmed' && b.meet_link && b.date && b.time) {
                        try {
                          const [h, mRest] = (b.time || '00:00 AM').split(':');
                          const [m, period] = (mRest || '00 AM').split(' ');
                          let hours = parseInt(h, 10); const mins = parseInt(m || 0, 10);
                          if (period === 'PM' && hours !== 12) hours += 12;
                          if (period === 'AM' && hours === 12) hours = 0;
                          const meetDate = new Date(`${b.date}T00:00:00`);
                          meetDate.setHours(hours, mins, 0, 0);
                          const now = new Date();
                          meetingEnded = now > new Date(meetDate.getTime() + 60 * 60 * 1000);
                          canJoin = now >= new Date(meetDate.getTime() - 5 * 60 * 1000) && !meetingEnded;
                        } catch { }
                      }
                      return (
                        <div key={bid} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><Calendar className="w-5 h-5" /></div>
                              <div>
                                <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{b.lawyer_name || 'Lawyer'}</h4>
                                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{b.date}{b.time ? ` at ${b.time}` : ''}{b.consultation_type ? ` • ${b.consultation_type === 'video' ? '🎥 Video' : b.consultation_type === 'audio' ? '📞 Audio' : '🏛️ In-Person'}` : ''}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColor}`}>{b.status}</span>
                              {b.status === 'confirmed' && b.meet_link && !meetingEnded && (canJoin ? <a href={b.meet_link} target="_blank" rel="noreferrer" className="px-3 py-1 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg animate-pulse">🎥 Join</a> : <span className={`px-3 py-1 text-xs font-semibold rounded-lg opacity-50 cursor-not-allowed ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>🎥 Join</span>)}
                              {b.status === 'completed' && !b.rating && <button onClick={() => setRatingModal({ bookingId: bid, lawyerName: b.lawyer_name || 'Lawyer' })} className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1"><Star className="w-3 h-3" /> Rate</button>}
                              {(b.status === 'confirmed' || b.status === 'completed') && b.lawyer_id && <button onClick={() => { setActiveTab('messages'); setTimeout(() => handleSelectChat({ other_user_id: b.lawyer_id, id: b.lawyer_id, name: b.lawyer_name || 'Lawyer', avatar: (b.lawyer_name || 'L')[0]?.toUpperCase() }), 100); }} className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Message</button>}
                              {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => setCancelBookingId(bid)} className="px-3 py-1 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50">Cancel</button>}
                            </div>
                          </div>
                          {isRescheduledByLawyer && (
                            <div className={`mt-3 rounded-xl p-3 border ${darkMode ? 'bg-blue-900/20 border-blue-700/40' : 'bg-blue-50 border-blue-200'}`}>
                              <p className={`text-xs font-bold ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>📅 Lawyer Proposed: {b.proposed_date} at {b.proposed_time}</p>
                              {deadlineLabel && <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>⏱ {deadlineLabel} to respond</p>}
                              {showCounterForm === bid ? (
                                <div className="mt-2 space-y-2">
                                  <div className="flex gap-2">
                                    <input type="date" value={counterDate} onChange={e => setCounterDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={`flex-1 text-xs px-2 py-1.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                                    <input type="time" value={counterTime} onChange={e => setCounterTime(e.target.value)} className={`flex-1 text-xs px-2 py-1.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => handleCounterReschedule(bid)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white">Send Proposal</button>
                                    <button onClick={() => setShowCounterForm(null)} className={`px-3 py-1.5 text-xs rounded-lg border ${darkMode ? 'border-slate-600 text-slate-300' : 'border-gray-300 text-gray-600'}`}>Back</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleAcceptReschedule(bid, b.proposed_date, b.proposed_time)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white">✅ Accept</button>
                                  <button onClick={() => setShowCounterForm(bid)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-500 text-blue-600'}`}>🗓 Counter</button>
                                </div>
                              )}
                            </div>
                          )}
                          {isRescheduledByUser && (
                            <div className={`mt-3 rounded-xl p-3 border ${darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'}`}>
                              <p className={`text-xs font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>🔄 Counter-Proposal Sent: {b.proposed_date} at {b.proposed_time}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legal AI Chat Tab */}
          {activeTab === 'legalai' && (
            <div className={`h-full flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} transition-colors`}>
              <div className={`p-6 border-b ${darkMode ? 'border-slate-800 bg-gradient-to-r from-blue-900 to-black' : 'border-gray-200 bg-gradient-to-r from-blue-700 to-blue-900'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-1 text-white">Legal AI Assistant</h1>
                    <p className="text-blue-100 text-sm">24/7 Instant legal analysis and lawyer recommendations</p>
                  </div>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30">PRO USER</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className={`max-w-2xl rounded-2xl p-4 ${darkMode ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white shadow-lg`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* AI Avatar and basic response */}
                        <div className="flex justify-start">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                            <Scale className="w-5 h-5 text-white" />
                          </div>
                          <div className="max-w-3xl">
                            {!msg.isStructured ? (
                              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow-sm`}>
                                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} whitespace-pre-wrap`}>{msg.content}</p>
                                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'} mt-2`}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* AI Legal Analysis Header */}
                                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow-sm`}>
                                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>AI Legal Analysis</h3>
                                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{msg.legalData.caseType}</p>
                                </div>

                                {/* Analysis Cards Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <LegalAnalysisCard
                                    icon={Gavel}
                                    title="Bail Information"
                                    content={msg.legalData.analysis.bailInfo}
                                    borderColor="border-blue-700"
                                    bgColor="bg-blue-700"
                                    darkMode={darkMode}
                                  />
                                  <LegalAnalysisCard
                                    icon={Clock}
                                    title="Trial Timeline"
                                    content={msg.legalData.analysis.timeline}
                                    borderColor="border-blue-500"
                                    bgColor="bg-blue-500"
                                    darkMode={darkMode}
                                  />
                                  <LegalAnalysisCard
                                    icon={AlertTriangle}
                                    title="Punishment"
                                    content={msg.legalData.analysis.punishment}
                                    borderColor="border-blue-600"
                                    bgColor="bg-blue-600"
                                    darkMode={darkMode}
                                  />
                                  <LegalAnalysisCard
                                    icon={ListChecks}
                                    title="First Steps"
                                    content={msg.legalData.analysis.firstSteps}
                                    borderColor="border-blue-500"
                                    bgColor="bg-blue-500"
                                  />
                                  <LegalAnalysisCard
                                    icon={Shield}
                                    title="Crime Type"
                                    content={msg.legalData.analysis.crimeType}
                                    borderColor="border-slate-600"
                                    bgColor="bg-slate-600"
                                  />
                                  <LegalAnalysisCard
                                    icon={TrendingUp}
                                    title="Severity"
                                    content={msg.legalData.analysis.severity}
                                    borderColor="border-blue-400"
                                    bgColor="bg-blue-400"
                                  />
                                </div>

                                {/* Recommended Lawyers */}
                                <div>
                                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recommended Legal Experts</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(lawyers.length > 0 ? lawyers.slice(0, 3) : []).map((lawyer) => (
                                      <LawyerCard
                                        key={lawyer._id || lawyer.id}
                                        name={lawyer.full_name || lawyer.name}
                                        specialization={lawyer.specialization || lawyer.practice_area || 'General Practice'}
                                        experience={lawyer.experience_years || lawyer.experience || 0}
                                        successRate={lawyer.success_rate || lawyer.successRate || 90}
                                        location={lawyer.city || lawyer.location || 'India'}
                                        hourlyRate={lawyer.hourly_rate || lawyer.hourlyRate || 0}
                                        onBook={() => setBookingLawyer(lawyer)}
                                        darkMode={darkMode}
                                      />
                                    ))}
                                    {lawyers.length === 0 && (
                                      <p className={`text-sm col-span-3 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No lawyers available right now.</p>
                                    )}
                                  </div>
                                </div>

                                {/* Legal Sections */}
                                {msg.legalData.sections.length > 0 && (
                                  <div className="col-span-2 md:col-span-3 mt-2">
                                    <LegalSectionsCard sections={msg.legalData.sections} darkMode={darkMode} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-900 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow-sm flex items-center gap-2`}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              <div className={`p-6 border-t ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-white'}`}>
                <form onSubmit={handleChat} className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      className={`w-full p-4 pr-12 ${darkMode ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'} rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner`}
                      placeholder="Describe your legal situation... (e.g., 'I received a cheque bounce notice')"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowVoiceModeAI(true)}
                      title="Voice Input"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 ${darkMode ? 'hover:bg-slate-800 text-blue-400 hover:text-blue-300' : 'hover:bg-gray-200 text-blue-500 hover:text-blue-600'} rounded-lg transition-colors`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="p-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !chatInput.trim()}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </form>
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {exampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(q)}
                      className={`px-4 py-2 ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100'} text-xs font-medium rounded-full border whitespace-nowrap transition-colors`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className={`p-8 ${darkMode ? 'bg-slate-950' : 'bg-white'} min-h-full`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${darkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                      <Shield className="w-3 h-3" /> End-to-End Encrypted
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Secure communication with your lawyers</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 260px)' }}>
                {/* Conversations List */}
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden flex flex-col shadow-sm`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {messages.filter(c => !msgSearch || (c.name || '').toLowerCase().includes(msgSearch.toLowerCase())).length > 0 ? (
                      messages.filter(c => !msgSearch || (c.name || '').toLowerCase().includes(msgSearch.toLowerCase())).map((chat, idx) => (
                        <div key={idx} onClick={() => handleSelectChat(chat)}
                          className={`flex items-center space-x-3 p-4 cursor-pointer transition-all border-l-4 ${selectedChat?.other_user_id === chat.other_user_id
                            ? (darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-500')
                            : (darkMode ? 'border-transparent hover:bg-slate-800' : 'border-transparent hover:bg-gray-50')
                            }`}>
                          <div className="relative flex-shrink-0">
                            <div className={`w-11 h-11 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center font-bold shadow-sm`}>
                              {(chat.avatar || (chat.name || '?')[0]).toUpperCase()}
                            </div>
                            {chat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{chat.name}</h4>
                              <span className={`text-xs whitespace-nowrap ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{chat.message}</p>
                          </div>
                          {chat.unread > 0 && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-bold text-white">{chat.unread}</span></div>}
                        </div>
                      ))
                    ) : (
                      <div className={`p-8 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {messages.length === 0 ? 'No conversations yet.' : 'No results.'}
                      </div>
                    )}
                  </div>
                </div>
                {/* Chat Window */}
                <div className={`lg:col-span-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden flex flex-col shadow-sm`}>
                  {selectedChat ? (
                    <>
                      <div className={`p-4 border-b ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'} flex items-center justify-between`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center font-bold`}>
                            {(selectedChat.avatar || (selectedChat.name || '?')[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedChat.name}</p>
                            <p className="text-xs text-blue-400">Your Legal Counsel</p>
                          </div>
                        </div>
                      </div>
                      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-slate-950/50' : 'bg-gray-50/30'}`}>
                        <div className="flex items-center justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-600'}`}>Today</span>
                        </div>
                        {chatHistory.map((msg, idx) => (
                          <div key={idx} className={`flex items-start space-x-3 ${msg.sender_id === user?.id ? 'justify-end' : ''}`}>
                            {msg.sender_id !== user?.id && (
                              <div className={`w-8 h-8 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold`}>
                                {(selectedChat.avatar || '?')[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className={`max-w-[70%] ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                              <div className={`p-3 rounded-2xl text-sm ${msg.sender_id === user?.id
                                  ? 'bg-blue-600 text-white rounded-tr-none'
                                  : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 border' : 'bg-white border border-gray-200 text-gray-900') + ' rounded-tl-none'
                                }`}>
                                {msg.content}
                              </div>
                              <p className={`text-[10px] mt-1 ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Permission Banner */}
                      {msgPermission && (
                        <div className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b
                          ${!msgPermission.allowed
                            ? (darkMode ? 'bg-slate-900/20 border-slate-800/40 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700')
                            : msgPermission.quota_left === 1
                              ? (darkMode ? 'bg-blue-900/20 border-blue-800/40 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700')
                              : msgPermission.quota_left === 0 && msgPermission.allowed === false
                                ? (darkMode ? 'bg-slate-900/20 border-slate-800/40 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700')
                                : (darkMode ? 'bg-blue-900/20 border-blue-800/40 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700')
                          }`}>
                          <span>
                            {!msgPermission.allowed ? '🔒'
                              : msgPermission.quota_left === -1 ? '✅'
                                : msgPermission.quota_left >= 1 ? '⏳'
                                  : '🔒'}
                          </span>
                          <span>
                            {!msgPermission.allowed
                              ? msgPermission.reason
                              : msgPermission.quota_left === -1
                                ? 'Full messaging enabled — case approved'
                                : `Pre-appointment: ${msgPermission.quota_left} message${msgPermission.quota_left !== 1 ? 's' : ''} remaining`}
                          </span>
                        </div>
                      )}
                      <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                          <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                            placeholder={msgPermission && !msgPermission.allowed ? 'Messaging locked — book & confirm an appointment first' : 'Type your message...'}
                            disabled={msgPermission && !msgPermission.allowed}
                            className={`flex-1 px-5 py-2.5 text-sm rounded-full border outline-none transition-colors
                              ${msgPermission && !msgPermission.allowed
                                ? (darkMode ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed')
                                : (darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-100 border-gray-200 text-gray-900')
                              }`} />
                          <button type="submit"
                            disabled={msgPermission && !msgPermission.allowed}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                              ${msgPermission && !msgPermission.allowed
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                              }`}>
                            <Send className="w-4 h-4 text-white" />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className={`flex-1 flex flex-col items-center justify-center ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      <MessageSquare className="w-14 h-14 mb-4 opacity-30" />
                      <p className="text-base font-medium">Select a conversation</p>
                      <p className="text-sm mt-1">Choose a chat from the list, or confirm an appointment to start messaging</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (() => {
            const personalDocs = documents.filter(d =>
              d.source === 'personal' || (!d.source && !d.network_message_id)
            );
            const activeFolderObj = folders.find(f => f.id === activeFolderId);
            const displayedDocs = activeFolderId
              ? personalDocs.filter(d => activeFolderObj?.docIds.includes(d.id || d._id))
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
              <div className={`p-8 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} min-h-full`}>
                <input ref={docInputRef} type="file" className="hidden" onChange={handleDocUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Document Vault
                      </h1>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center ${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        <Shield className="w-3 h-3 mr-1" />End-to-End Encrypted
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Your personal documents · {personalDocs.length} file{personalDocs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNewFolderModal(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="text-base">📁</span> New Folder
                    </button>
                    <button
                      onClick={() => docInputRef.current?.click()}
                      disabled={docUploading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg transition-colors disabled:opacity-60"
                    >
                      <FileText className="w-4 h-4" />
                      {docUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-7">
                  <div className={`rounded-2xl border p-5 flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>My Documents</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{personalDocs.length}</p>
                    </div>
                  </div>
                  <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isStorageFull ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}><span className="text-lg">💾</span></div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Storage Used</p>
                        <p className={`text-lg font-bold ${isStorageFull ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>{totalStorageDisplay} <span className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 1 GB</span></p>
                      </div>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${storagePercent > 90 ? 'bg-red-600' : storagePercent > 70 ? 'bg-blue-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.max(storagePercent, 1)}%` }}
                      />
                    </div>
                    {isStorageFull && <p className="text-red-500 text-[10px] font-medium mt-1">Storage full — delete files to upload more</p>}
                  </div>
                  <div className={`rounded-2xl border p-5 flex items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500"><Clock className="w-5 h-5" /></div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recent Uploads</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{recentUploadsCount}</p>
                    </div>
                  </div>
                </div>

                {/* Folders Row */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Folders</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveFolderId(null)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${activeFolderId === null
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      🗂️ All Files <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFolderId === null ? 'bg-white/20' : darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>{personalDocs.length}</span>
                    </button>
                    {folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => setActiveFolderId(folder.id === activeFolderId ? null : folder.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${activeFolderId === folder.id
                          ? 'text-white shadow-md'
                          : darkMode ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        style={activeFolderId === folder.id ? { background: folder.color, borderColor: folder.color } : {}}
                      >
                        {folder.icon} {folder.name}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFolderId === folder.id ? 'bg-white/20' : darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>{folder.docIds.length}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Documents Table */}
                <div className={`rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[700px]">
                    <thead className={`border-b ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                      <tr>
                        {['Document Name', 'Folder', 'Type', 'Date', 'Size', 'Actions'].map(h => (
                          <th key={h} className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedDocs.length > 0 ? (
                        displayedDocs.map((doc, idx) => {
                          const docId = doc.id || doc._id;
                          return (
                            <tr key={idx} className={`border-b transition-all duration-200 ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <FileText className={`w-5 h-5 flex-shrink-0 ${doc.file_type?.includes('pdf') ? 'text-red-500' : 'text-blue-500'}`} />
                                  {doc.file_url ? (
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                      className={`font-medium transition-colors truncate max-w-[180px] ${darkMode ? 'text-gray-200 hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'}`}>
                                      {doc.title || doc.file_name}
                                    </a>
                                  ) : (
                                    <span className={`font-medium truncate max-w-[180px] ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{doc.title || doc.file_name}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={folders.find(f => f.docIds.includes(docId))?.id || ''}
                                  onChange={e => moveDocToFolder(docId, e.target.value)}
                                  className={`text-xs rounded-lg px-2 py-1 border outline-none cursor-pointer ${darkMode ? 'bg-slate-700 border-slate-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                >
                                  <option value="">No folder</option>
                                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${darkMode ? 'bg-slate-800 text-gray-300 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                  {doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                              </td>
                              <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {doc.file_size ? (doc.file_size / 1024).toFixed(1) + ' KB' : '---'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => { setSelectedDocForShare(doc); setShowShareModal(true); }}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-1" title="Share"
                                  ><Share2 className="w-4 h-4" /></button>
                                  {doc.file_url && (
                                    <a href={doc.file_url} download={doc.file_name || doc.title}
                                      className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Download">
                                      <Download className="w-4 h-4" /></a>
                                  )}
                                  <button
                                    onClick={() => setDocToDelete(doc)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1" title="Delete"
                                  ><Archive className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className={`px-6 py-20 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm mb-4">{activeFolderId ? 'No documents in this folder yet.' : 'No documents uploaded yet. Upload your first file above.'}</p>
                            {!activeFolderId && (
                              <button onClick={() => docInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all">
                                <FileText className="w-4 h-4" /> Upload First Document
                              </button>
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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                      className={`relative z-10 w-96 rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'}`}
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
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none mb-4 ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                      />
                      <div className="flex gap-3">
                        <button onClick={handleCreateFolder}
                          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                          Create Folder
                        </button>
                        <button onClick={() => setShowNewFolderModal(false)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Modal */}
                {showShareModal && selectedDocForShare && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowShareModal(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                      className={`relative z-10 w-[480px] rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'}`}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Share Document</h3>
                        <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedDocForShare.title || selectedDocForShare.file_name}</span>
                      </div>
                      {selectedDocForShare.file_url && (
                        <div className="mb-4">
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shareable Link</p>
                          <div className={`flex items-center gap-2 p-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`text-xs flex-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedDocForShare.file_url}</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(selectedDocForShare.file_url); toast.success('Link copied!'); }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                            >Copy Link</button>
                          </div>
                        </div>
                      )}
                      <button onClick={() => setShowShareModal(false)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


          {/* ── SOS Emergency Tab (inline) ── */}
          {activeTab === 'sos' && (
            <div className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>SOS Emergency</h1>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Immediate legal assistance — day or night</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/10 border border-red-600/20 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE
                    </span>
                  </div>
                </div>

                {/* Mode Selection */}
                {sosStep === 'select' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button onClick={() => { setSosMode('talk'); setSosStep('form'); }}
                      className={`p-6 rounded-2xl text-left border transition-all hover:-translate-y-1 ${
                        darkMode ? 'bg-slate-900 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}>
                      <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-4">
                        <Phone className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>SOS Talk</h3>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Immediate phone/video consultation with an SOS lawyer.</p>
                      <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹300 <span className={`text-sm font-normal ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>/ session</span></div>
                    </button>
                    <button onClick={() => { setSosMode('visit'); setSosStep('form'); }}
                      className={`p-6 rounded-2xl text-left border transition-all hover:-translate-y-1 ${
                        darkMode ? 'bg-slate-900 border-slate-700 hover:border-red-500' : 'bg-white border-gray-200 hover:border-red-400'
                      }`}>
                      <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center mb-4">
                        <PhoneCall className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                      <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Full SOS</h3>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>A verified lawyer physically visits your location within 30 min.</p>
                      <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹1,100 <span className={`text-sm font-normal ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>+ ₹400/30 min</span></div>
                    </button>
                  </div>
                )}

                {/* Form */}
                {sosStep === 'form' && (
                  <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <button onClick={() => { setSosStep('select'); setSosMode(null); }}
                      className={`flex items-center gap-1 text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      ← Change mode
                    </button>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Details</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`text-xs font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>State *</label>
                          <select value={sosForm.state} onChange={e => setSosForm(f => ({ ...f, state: e.target.value, city: '' }))}
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                            <option value="">Select state</option>
                            {SOS_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={`text-xs font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>District</label>
                          <select value={sosForm.city} onChange={e => setSosForm(f => ({ ...f, city: e.target.value }))}
                            disabled={!sosForm.state}
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${!sosForm.state ? 'opacity-40' : ''}`}>
                            <option value="">Select district</option>
                            {(SOS_CITIES[sosForm.state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Legal Issue *</label>
                        <select value={sosForm.issueType} onChange={e => setSosForm(f => ({ ...f, issueType: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                          <option value="">Select issue type</option>
                          {Object.entries(SOS_ISSUE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Your Name</label>
                        <input value={sosForm.name} onChange={e => setSosForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Full name"
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                      </div>
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider block mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Phone Number (10 digits) *</label>
                        <div className="flex gap-2">
                          <span className={`px-3 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>+91</span>
                          <input value={sosForm.phone} onChange={e => setSosForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                            placeholder="9876543210" type="tel" maxLength={10}
                            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none ${darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                        </div>
                      </div>
                      <button
                        disabled={sosForm.phone.length !== 10 || !sosForm.state || !sosForm.issueType}
                        onClick={() => {
                          if (sosForm.phone.length !== 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
                          setSosStep('radar_preview');
                          setTimeout(() => setSosStep('payment'), 4500);
                        }}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm mt-2 transition-all ${
                          sosForm.phone.length === 10 && sosForm.state && sosForm.issueType
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                            : `${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                        }`}>
                        ₹ Proceed to Payment
                      </button>
                      <p className={`text-xs text-center ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>100% refund if no lawyer found within 10 minutes.</p>
                    </div>
                  </div>
                )}

                {/* Radar Preview */}
                {sosStep === 'radar_preview' && (
                  <div className="text-center py-16">
                    <div className="relative w-40 h-40 mx-auto mb-8">
                      <div className={`absolute inset-0 rounded-full border-2 animate-ping ${
                        sosMode === 'talk' ? 'border-blue-500/30' : 'border-red-500/30'
                      }`} />
                      <div className={`absolute inset-4 rounded-full border-2 animate-ping animation-delay-300 ${
                        sosMode === 'talk' ? 'border-blue-500/20' : 'border-red-500/20'
                      }`} />
                      <div className={`absolute inset-0 flex items-center justify-center`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
                          sosMode === 'talk' ? 'bg-blue-600/10 border-blue-500/40' : 'bg-red-600/10 border-red-500/40'
                        }`}>
                          <PhoneCall className={`w-8 h-8 ${sosMode === 'talk' ? 'text-blue-400' : 'text-red-400'}`} />
                        </div>
                      </div>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Scanning for lawyers in {sosForm.state}...</h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Broadcasting your SOS request to the LxwyerUp network</p>
                  </div>
                )}

                {/* Payment */}
                {sosStep === 'payment' && (
                  <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-600/10 border border-green-600/20 text-green-400 mb-2">
                          ✓ Lawyers Found Nearby
                        </span>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Secure Payment</h3>
                      </div>
                      <div className={`text-right px-4 py-2 rounded-xl ${
                        sosMode === 'talk' ? 'bg-blue-600/10' : 'bg-red-600/10'
                      }`}>
                        <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{sosMode === 'talk' ? '300' : '1,100'}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>to pay</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {['upi','card','netbanking'].map(m => (
                        <button key={m} onClick={() => setSosPaymentMethod(m)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            sosPaymentMethod === m ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`
                          }`}>
                          {m === 'upi' ? 'UPI' : m === 'card' ? 'Card' : 'Net Banking'}
                        </button>
                      ))}
                    </div>
                    {sosPaymentMethod === 'upi' && (
                      <input value={sosUpiId} onChange={e => setSosUpiId(e.target.value)}
                        placeholder="yourname@ybl"
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none mb-4 ${
                          darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`} />
                    )}
                    {sosPaymentMethod === 'card' && (
                      <div className="space-y-3 mb-4">
                        <input value={sosCardNum} onChange={e => setSosCardNum(e.target.value.replace(/\D/g,'').slice(0,16))}
                          placeholder="Card Number (16 digits)"
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`} />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={sosCardExp} onChange={e => { const r=e.target.value.replace(/\D/g,'').slice(0,4); setSosCardExp(r.length>2?r.slice(0,2)+'/'+r.slice(2):r); }}
                            placeholder="MM/YY"
                            className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                              darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`} />
                          <input value={sosCardCvv} onChange={e => setSosCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                            placeholder="CVV" type="password" maxLength={3}
                            className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                              darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`} />
                        </div>
                      </div>
                    )}
                    <button
                      disabled={sosPaymentProcessing}
                      onClick={async () => {
                        setSosPaymentProcessing(true);
                        await new Promise(r => setTimeout(r, 2200));
                        const txnId = 'LXW' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
                        setSosTxnId(txnId);
                        setSosPaymentProcessing(false);
                        toast.success(`Payment successful! Txn: ${txnId}`);
                        setSosStep('searching');
                        try {
                          const res = await axios.post(`${API}/sos/request`, {
                            user_phone: sosForm.phone, user_name: sosForm.name || undefined,
                            user_state: sosForm.state, user_city: sosForm.city || sosForm.state,
                            issue_type: sosForm.issueType,
                            sos_type: sosMode === 'talk' ? 'sos_talk' : 'sos_full',
                            transaction_id: txnId,
                          });
                          setSosSessionId(res.data.session_id);
                          if (res.data.status === 'matched') { setSosMatchedLawyer(res.data.lawyer); setTimeout(() => setSosStep('matched'), 1500); }
                          else if (res.data.status === 'searching') { setSosPotentialLawyers(res.data.potential_lawyers || []); }
                          else { setSosStep('no_lawyer'); }
                        } catch { setSosStep('error'); }
                      }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                      {sosPaymentProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Shield className="w-4 h-4" /> Pay ₹{sosMode === 'talk' ? '300' : '1,100'} Securely</>}
                    </button>
                  </div>
                )}

                {/* Searching */}
                {sosStep === 'searching' && (
                  <div className="text-center py-16">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-600/10 border-2 border-blue-500/40 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                      </div>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Broadcasting SOS to Lawyers...</h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Matching you with a verified lawyer in {sosForm.state}</p>
                    {sosTxnId && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600/10 border border-green-600/20 text-green-400">Payment Confirmed · {sosTxnId}</span>}
                  </div>
                )}

                {/* Matched */}
                {sosStep === 'matched' && sosMatchedLawyer && (
                  <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-green-600/10 border border-green-600/20">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-bold">Lawyer Found!</p>
                    </div>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sosMatchedLawyer.name || 'SOS Assigned Lawyer'}</h4>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{sosMatchedLawyer.specialization || 'Legal Expert'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        const otp = Math.floor(100000 + Math.random() * 900000).toString();
                        setSosCurrentOtp(otp); setSosShowOtp(true);
                        setSosActiveSession({ session_id: sosSessionId, sos_type: sosMode === 'talk' ? 'sos_talk' : 'sos_full', lawyer_name: sosMatchedLawyer?.name, lawyer_phone: sosMatchedLawyer?.phone, lawyer_specialization: sosMatchedLawyer?.specialization });
                        setSosStep('session');
                      }} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" /> {sosMode === 'talk' ? 'Start Call' : 'Begin Session'}
                      </button>
                      <button onClick={() => {
                        setSosDeclineCount(c => c + 1);
                        if (sosDeclineCount >= 2) { setSosStep('no_lawyer'); toast.error('All lawyers are busy. Please try again.'); }
                        else { toast.info('Searching for next lawyer...'); setSosStep('searching'); }
                      }} className={`px-4 py-3 rounded-xl border font-bold text-sm ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Session */}
                {sosStep === 'session' && sosActiveSession && (
                  <div className={`rounded-2xl border p-6 space-y-4 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-600/10 border border-green-600/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-green-400 font-bold text-sm">Session Active</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{sosActiveSession.sos_type === 'sos_full' ? '🚗 Full SOS — Lawyer en route' : '🎙️ SOS Talk — Call in progress'}</p>
                      </div>
                      <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{sosActiveSession.sos_type === 'sos_full' ? (1100 + sosTicks * 400).toLocaleString('en-IN') : '300'}</p>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{ borderColor: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}>
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sosActiveSession.lawyer_name || 'SOS Lawyer'}</p>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{sosActiveSession.lawyer_specialization || 'Legal Expert'}</p>
                      </div>
                      {sosActiveSession.lawyer_phone && (
                        <a href={`tel:+91${sosActiveSession.lawyer_phone}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/15 border border-green-600/30 text-green-400 text-sm font-bold">
                          <Phone className="w-4 h-4" /> Call
                        </a>
                      )}
                    </div>
                    {sosShowOtp && sosCurrentOtp && (
                      <div className={`p-4 rounded-xl border ${
                        darkMode ? 'bg-blue-900/10 border-blue-700/30' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <p className={`font-bold text-sm mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔑 Presence OTP</p>
                        <div className={`text-center py-3 rounded-xl mb-3 ${
                          darkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
                        }`}>
                          <p className={`text-xs uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Your Session OTP</p>
                          <p className="text-3xl font-black tracking-widest text-blue-400 font-mono">{sosCurrentOtp}</p>
                        </div>
                        <div className="flex gap-2">
                          <input value={sosOtp} onChange={e => setSosOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                            placeholder="Enter 6-digit OTP" maxLength={6}
                            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm text-center font-mono tracking-widest outline-none ${
                              darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`} />
                          <button onClick={() => {
                            if (sosOtp === sosCurrentOtp) {
                              toast.success('✓ Verified!'); setSosOtp(''); setSosShowOtp(false);
                              if (sosActiveSession.sos_type === 'sos_full') setSosTicks(t => t + 1);
                              const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                              setSosCurrentOtp(newOtp);
                              setTimeout(() => setSosShowOtp(true), 1800000);
                            } else { toast.error('Incorrect OTP. Try again.'); }
                          }} disabled={sosOtp.length !== 6}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              sosOtp.length === 6 ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                            }`}>Verify</button>
                        </div>
                      </div>
                    )}
                    <button onClick={() => {
                      setSosStep('select'); setSosMode(null); setSosMatchedLawyer(null);
                      setSosPotentialLawyers([]); setSosSessionId(null); setSosActiveSession(null);
                      setSosDeclineCount(0); setSosTxnId(null); setSosTicks(0);
                      setSosForm({ state:'',city:'',issueType:'',name:'',phone:'' });
                      setSosUpiId(''); setSosCardNum(''); setSosCardExp(''); setSosCardCvv('');
                      setSosOtp(''); setSosCurrentOtp(null); setSosShowOtp(false);
                      toast.success('Session ended. Thank you for using LxwyerUp SOS.');
                    }} className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-600/10 transition-all">
                      End Session &amp; Stop Billing
                    </button>
                  </div>
                )}

                {/* No Lawyer / Error */}
                {(sosStep === 'no_lawyer' || sosStep === 'error') && (
                  <div className={`rounded-2xl border p-8 text-center ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {sosStep === 'no_lawyer' ? 'All lawyers are currently busy' : 'Something went wrong'}
                    </h3>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {sosStep === 'no_lawyer' ? `No lawyer available in ${sosForm.state} right now. Your payment will be refunded within 24 hours.` : 'Connection error. Payment was not processed.'}
                    </p>
                    <button onClick={() => { setSosStep(sosMode ? 'form' : 'select'); setSosMatchedLawyer(null); setSosDeclineCount(0); }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm">
                      Try Again
                    </button>
                  </div>
                )}

                {/* Polling for match */}
                {sosStep === 'searching' && sosSessionId && (() => {
                  // Polling effect inline via a small hidden component
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* My Cases Tab */}
          {activeTab === 'cases' && (
            <div className={`p-8 ${darkMode ? 'bg-slate-950' : 'bg-white'} min-h-full`}>
              <div className="flex items-center justify-between mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Cases</h1>
                <button onClick={() => setShowCaseForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg transition-colors">
                  + New Case
                </button>
              </div>

              {/* Case creation form */}
              {showCaseForm && (
                <form onSubmit={handleCreateCase} className={`mb-8 p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-blue-50 border-blue-100'} space-y-4`}>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Case</h3>
                  <input value={newCaseTitle} onChange={e => setNewCaseTitle(e.target.value)} required
                    placeholder="Case Title *" className={`w-full px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'} outline-none`} />
                  <select value={newCaseType} onChange={e => setNewCaseType(e.target.value)} required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'} outline-none`}>
                    <option value="">Select Case Type *</option>
                    <option>Criminal</option><option>Family</option><option>Property</option>
                    <option>Consumer</option><option>Corporate</option><option>Civil</option><option>Other</option>
                  </select>
                  <textarea value={newCaseDesc} onChange={e => setNewCaseDesc(e.target.value)} rows={3}
                    placeholder="Brief description (optional)" className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'} outline-none`} />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCaseForm(false)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${darkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-600'}`}>
                      Cancel
                    </button>
                    <button type="submit" disabled={caseLoading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                      {caseLoading ? 'Creating...' : 'Create Case'}
                    </button>
                  </div>
                </form>
              )}

              {cases.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                  <Gavel className="w-14 h-14 mx-auto mb-4 opacity-30 text-gray-400" />
                  <p className={`text-lg mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>No cases yet</p>
                  <p className="text-gray-500 text-sm">Create your first case to start tracking it.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map(c => {
                    const cid = c._id || c.id;
                    const isExpanded = expandedCaseId === cid;
                    const statusStyle = c.status === 'active' || c.status === 'open'
                      ? 'bg-blue-100 text-blue-700'
                      : c.status === 'closed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-700';
                    return (
                      <div key={cid} className={`rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} ${isExpanded ? 'shadow-md' : 'hover:shadow-md'}`}>
                        <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpandedCaseId(isExpanded ? null : cid)}>
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.status === 'active' || c.status === 'open' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600') : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-400')}`}>
                              <Gavel className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.title}</h4>
                              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{c.case_type || c.type} • {new Date(c.created_at || c.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusStyle}`}>{c.status || 'pending'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className={`px-5 pb-5 space-y-3 border-t ${darkMode ? 'border-slate-800' : 'border-gray-100'} pt-4`}>
                            {c.description && <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{c.description}</p>}
                            <div className="flex gap-3">
                              <button onClick={() => { setActiveTab('consultation'); }}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                Book Lawyer for This Case
                              </button>
                              <button onClick={() => navigate('/lxwyerai-premium')}
                                className={`flex-1 py-2 border text-sm font-semibold rounded-xl transition-colors ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                Get AI Advice ✨
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`p-8 ${darkMode ? 'bg-black' : 'bg-white'} min-h-full`}>
              <h1 className={`text-2xl font-bold mb-8 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Profile</h1>

              <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* ── LEFT: Profile Card + Form ─────────────────────────── */}
                <div className="w-full xl:max-w-2xl space-y-6 flex-shrink-0">

                  {/* Avatar + quick stats */}
                  <div className={`rounded-2xl p-6 border flex flex-col sm:flex-row items-center gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg ring-4 ring-blue-500/20">
                        {profileImage
                          ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; setProfileImage(null); }} />
                          : <span className="text-3xl font-bold text-white">{user?.full_name?.[0]?.toUpperCase() || 'U'}</span>}
                      </div>
                      <label htmlFor="profileImageUpload" className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <input id="profileImageUpload" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                      </label>
                    </div>

                    {/* Name + stats */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.full_name || 'User'}</h2>
                      <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{user?.email}</p>
                      <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                        {[
                          { label: 'Bookings', value: bookings.length },
                          { label: 'Documents', value: documents.length },
                          { label: 'Cases', value: cases.length },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <p className="text-lg font-bold text-blue-400">{s.value}</p>
                            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Edit form */}
                  <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                      {!editingProfile && (
                        <button onClick={() => { setEditingProfile(true); setProfileForm({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' }); }}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 border border-blue-400/30 hover:border-blue-400/60 px-3 py-1.5 rounded-lg transition-colors">
                          Edit
                        </button>
                      )}
                    </div>

                    {editingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        {[
                          { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Your full name' },
                          { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
                          { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{f.label}</label>
                            <input
                              type={f.type}
                              value={profileForm[f.key] || ''}
                              onChange={e => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                              placeholder={f.placeholder}
                              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            />
                          </div>
                        ))}
                        <div className="flex gap-3 pt-2">
                          <button type="submit" disabled={profileSaving}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                            {profileSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" onClick={() => setEditingProfile(false)}
                            className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-1">
                        {/* User ID — copyable */}
                        <div className={`p-3 rounded-xl mb-3 ${darkMode ? 'bg-slate-800/60 border border-slate-700' : 'bg-blue-50 border border-blue-100'}`}>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-blue-400'}`}>User ID</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono flex-1 truncate ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{user?.id || user?._id || '—'}</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(user?.id || user?._id || ''); }}
                              title="Copy ID"
                              className={`text-xs px-2 py-0.5 rounded-lg border shrink-0 transition-colors ${darkMode ? 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-400' : 'border-blue-200 text-blue-500 hover:bg-blue-100'}`}
                            >Copy</button>
                          </div>
                        </div>

                        {/* Info grid */}
                        {[
                          { label: 'Full Name', value: user?.full_name || '—' },
                          { label: 'Email Address', value: user?.email || '—' },
                          { label: 'Phone', value: user?.phone || 'Not provided' },
                          {
                            label: 'Account Type',
                            value: null,
                            badge: (user?.role || 'user').toUpperCase(),
                            color: 'blue',
                          },
                          {
                            label: 'Account Status',
                            value: null,
                            badge: user?.is_verified ? '✓ Verified' : user?.status || 'Active',
                            color: user?.is_verified ? 'green' : 'blue',
                          },
                          {
                            label: 'Login Method',
                            value: null,
                            badge: user?.google_id ? '🔵 Google' : '🔑 Email',
                            color: 'slate',
                          },
                          {
                            label: 'Plan',
                            value: null,
                            badge: user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free',
                            color: user?.plan && user.plan !== 'free' ? 'amber' : 'slate',
                          },
                          {
                            label: 'Member Since',
                            value: user?.created_at
                              ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '—',
                          },
                        ].map(row => (
                          <div key={row.label} className={`flex justify-between items-center py-2.5 border-b last:border-b-0 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                            <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{row.label}</span>
                            {row.badge ? (
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.color === 'blue' ? (darkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200') :
                                  row.color === 'green' ? (darkMode ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-green-50 text-green-700 border border-green-200') :
                                    row.color === 'amber' ? (darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200') :
                                      (darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-gray-100 text-gray-600 border border-gray-200')
                                }`}>{row.badge}</span>
                            ) : (
                              <span className={`text-sm font-medium max-w-[55%] text-right truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{row.value}</span>
                            )}
                          </div>
                        ))}

                        {/* Activity summary */}
                        <div className={`mt-4 grid grid-cols-3 gap-2 pt-3 border-t ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                          {[
                            { label: 'Appointments', value: bookings.length },
                            { label: 'Documents', value: documents.length },
                            { label: 'Cases', value: cases.length },
                          ].map(s => (
                            <div key={s.label} className={`rounded-xl p-3 text-center border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                              <p className="text-lg font-bold text-blue-400">{s.value}</p>
                              <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── RIGHT: Flagship Systems ────────────────────────────── */}
                <div className="w-full xl:flex-1 space-y-4">
                  <h3 className={`font-semibold text-sm uppercase tracking-widest mb-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Flagship Systems</h3>
                  {[
                    {
                      id: 'lxwyerai', title: 'LxwyerAI 1.0', emoji: '🤖',
                      tagline: 'Next-Gen AI Legal Assistant',
                      summary: 'LxwyerAI 1.0 is our flagship AI-powered legal assistant, trained on thousands of Indian legal cases. Get instant answers to legal queries, draft documents, understand your rights, and navigate complex legal situations — all with the precision of an experienced lawyer.',
                      gradient: 'from-blue-600 to-blue-900',
                    },
                    {
                      id: 'apex', title: 'Apex System', emoji: '⚖️',
                      tagline: 'Smart Lawyer Matching Engine',
                      summary: 'The Apex System analyzes your case complexity, budget, location, and legal requirements to surface the most compatible lawyer for your needs. Powered by multi-dimensional scoring — not just proximity — it ensures you always get the best available representation.',
                      gradient: 'from-slate-700 to-slate-900',
                    },
                    {
                      id: 'signature', title: 'Signature', emoji: '✍️',
                      tagline: 'Verified Legal Professionals',
                      summary: 'Signature is our premium tier of verified legal professionals who have passed LxwyerUp\'s rigorous vetting process. These lawyers are recognized for their expertise, client satisfaction, and track record — giving you access to elite-level counsel.',
                      gradient: 'from-blue-900 to-black',
                    },
                  ].map(item => {
                    const isOpen = profileExpandedCard === item.id;
                    return (
                      <div key={item.id}
                        className={`rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${darkMode ? 'border-slate-800' : 'border-gray-200'}`}
                        onClick={() => setProfileExpandedCard(isOpen ? null : item.id)}>
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${item.gradient} p-5 flex items-center justify-between`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.emoji}</span>
                            <div>
                              <p className="text-white font-bold text-sm">{item.title}</p>
                              <p className="text-white/60 text-xs">{item.tagline}</p>
                            </div>
                          </div>
                          <svg className={`w-5 h-5 text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                        {/* Expanded */}
                        {isOpen && (
                          <div className={`px-5 py-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{item.summary}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security & Privacy Section */}
              <div className={`rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} p-6`}>
                <div className="flex items-center gap-2 mb-5">
                  <Shield className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                  <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security & Privacy</h2>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Password</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Change your account password</p>
                    </div>
                    <button onClick={() => navigate('/login?action=change-password')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                      Change
                    </button>
                  </div>
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Login Sessions</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Logged in as: {user?.email || 'Unknown'}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Account Danger Zone */}
              <div className={`rounded-2xl border ${darkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-200'} p-6`}>
                <h2 className="text-sm font-bold text-red-500 mb-1">⚠ Danger Zone</h2>
                <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>These actions are irreversible. Please be certain.</p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you absolutely sure you want to delete your account? This cannot be undone.')) {
                      toast.error('Account deletion requires contacting support. Email: support@lxwyerup.com');
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-red-500 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">
                  Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* ── Book Appointment Modal (was completely missing!) ─────────────── */}
          {bookingLawyer && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBookingLawyer(null)} />
              <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                        {bookingLawyer.photo
                          ? <img src={bookingLawyer.photo} alt="" className="w-full h-full object-cover rounded-full" />
                          : <span className="text-white font-bold text-lg">{(bookingLawyer.full_name || bookingLawyer.name || 'L')[0].toUpperCase()}</span>}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{bookingLawyer.full_name || bookingLawyer.name}</h3>
                        <p className="text-blue-200 text-xs">{bookingLawyer.specialization || bookingLawyer.practice_area || 'General Practice'}</p>
                      </div>
                    </div>
                    <button onClick={() => setBookingLawyer(null)} className="text-white/70 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Form */}
                <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
                  {/* Consultation Type */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Consultation Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'video', label: '🎥 Video', desc: 'Online Call' },
                        { value: 'audio', label: '📞 Audio', desc: 'Phone Call' },
                        { value: 'in_person', label: '🏛️ In-Person', desc: 'Visit Office' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setBookingType(opt.value)}
                          className={`p-3 rounded-xl border text-center transition-all ${bookingType === opt.value
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          <div className="text-lg">{opt.label.split(' ')[0]}</div>
                          <div className="text-[10px] font-semibold mt-0.5">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Date *</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Time *</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        required
                        className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      />
                    </div>
                  </div>
                  {/* Notes */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Brief Note (optional)</label>
                    <textarea
                      value={bookingNote}
                      onChange={e => setBookingNote(e.target.value)}
                      rows={3}
                      placeholder="Describe your legal issue briefly..."
                      className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  {/* Fee info */}
                  {(bookingLawyer.fee_30min || bookingLawyer.hourly_rate) && (
                    <div className={`rounded-xl p-3 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'} flex items-center gap-3`}>
                      <Clock className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div className="text-xs">
                        {bookingLawyer.fee_30min && <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>₹{bookingLawyer.fee_30min} / 30 min &nbsp;•&nbsp;</span>}
                        {bookingLawyer.hourly_rate && <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>₹{bookingLawyer.hourly_rate} / 60 min</span>}
                      </div>
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setBookingLawyer(null); setBookingDate(''); setBookingTime(''); setBookingNote(''); setBookingType('video'); }}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 shadow"
                    >
                      {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {cancelBookingId && (

            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelBookingId(null)} />
              <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <h3 className={`text-lg font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cancel Appointment?</h3>
                <p className={`text-sm text-center mb-6 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setCancelBookingId(null)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${darkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-600'}`}>Keep</button>
                  <button onClick={handleCancelBooking}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Yes, Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* ── Rate Lawyer Modal ─────────────────────────────────── */}
          {ratingModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setRatingModal(null); setRatingValue(0); setRatingComment(''); }} />
              <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold text-center mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Rate Your Consultation</h3>
                <p className={`text-sm text-center mb-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>with {ratingModal.lawyerName}</p>
                {/* Star picker */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setRatingValue(s)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${s <= ratingValue ? 'text-blue-400 scale-110' : (darkMode ? 'text-slate-600' : 'text-gray-300')} hover:scale-125`}>
                      <Star className={`w-7 h-7 ${s <= ratingValue ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
                <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} rows={3}
                  placeholder="Share your experience (optional)"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none outline-none mb-4 ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                <div className="flex gap-3">
                  <button onClick={() => { setRatingModal(null); setRatingValue(0); setRatingComment(''); }}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${darkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-600'}`}>Skip</button>
                  <button onClick={handleRateLawyer} disabled={ratingSaving || ratingValue === 0}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                    {ratingSaving ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Delete Document Confirm ────────────────────────────── */}
          {docToDelete && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDocToDelete(null)} />
              <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <h3 className={`text-lg font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete Document?</h3>
                <p className={`text-sm text-center mb-1 font-medium ${darkMode ? 'text-slate-300' : 'text-gray-800'}`}>"{docToDelete.title || docToDelete.file_name}"</p>
                <p className={`text-xs text-center mb-6 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDocToDelete(null)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${darkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-600'}`}>Cancel</button>
                  <button onClick={handleDeleteDocument}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar (hidden on md+) ── */}
      <div className={`fixed bottom-0 inset-x-0 z-50 md:hidden border-t ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} safe-bottom`}>
        <div className="flex items-center justify-around px-1 py-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'consultation', icon: Calendar, label: 'Book' },
            { id: 'cases', icon: Briefcase, label: 'Cases' },
            { id: 'messages', icon: MessageSquare, label: 'Chat' },
            { id: 'documents', icon: FileText, label: 'Docs' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${activeTab === id
                  ? 'text-blue-500'
                  : darkMode ? 'text-slate-500' : 'text-gray-400'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          ))}
          {/* SOS mobile button */}
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
              activeTab === 'sos' ? 'text-red-500' : darkMode ? 'text-slate-500' : 'text-gray-400'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span className="text-[9px] font-semibold">SOS</span>
          </button>
        </div>
      </div>
    </div>
    {/* Voice Mode Overlay for Legal AI Chat */}
    <VoiceModeOverlay
      open={showVoiceModeAI}
      onClose={() => setShowVoiceModeAI(false)}
      onSend={(text) => { setChatInput(text); setShowVoiceModeAI(false); }}
      accentColor="#3b82f6"
    />
    </>
  );
}

