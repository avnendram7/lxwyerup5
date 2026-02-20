import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Scale, LogOut, LayoutDashboard, Calendar, MessageSquare, FileText, Send, User, Clock, MapPin, Shield, FileCheck, Mic, CheckCircle, Search, Gavel, AlertTriangle, ListChecks, BookOpen, TrendingUp, Video, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

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

// Lawyer Recommendation Card Component
const LawyerCard = ({ name, specialization, experience, successRate, location, hourlyRate, onBook, darkMode }) => (
  <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-xl p-5 border shadow-md hover:shadow-lg transition-all`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
        <User className="w-7 h-7 text-white" />
      </div>
      <div>
        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</h4>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <p className="text-sm text-blue-600 font-medium">{specialization}</p>
      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{experience} yrs • {successRate}% success</p>
      <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'} flex items-center`}>
        <MapPin className="w-3 h-3 mr-1" />{location} • <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} ml-1`}>₹{hourlyRate}/hr</span>
      </p>
    </div>
    <div className="flex gap-2">
      <Button onClick={onBook} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
        Book Appointment
      </Button>
      <Button variant="outline" className={`${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300'} rounded-lg px-3`}>
        <Video className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`} />
      </Button>
    </div>
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

// Dummy lawyers data
const dummyLawyers = [
  { id: 1, name: 'Dummy Recommended Lawyer', specialization: 'Criminal Defense', experience: 15, successRate: 95, location: 'Delhi', hourlyRate: 2500 }
];

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
  const [dashboardData, setDashboardData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchData();
    }
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [casesRes, docsRes, bookingsRes, lawyersRes, dashboardRes, messagesRes] = await Promise.all([
        axios.get(`${API}/cases`, { headers }),
        axios.get(`${API}/documents`, { headers }),
        axios.get(`${API}/bookings`, { headers }),
        axios.get(`${API}/lawyers`),
        axios.get(`${API}/dashboard/user`, { headers }),
        axios.get(`${API}/messages/recents`, { headers })
      ]);
      setCases(casesRes.data);
      setDocuments(docsRes.data);
      setBookings(bookingsRes.data);
      setLawyers(lawyersRes.data);
      setDashboardData(dashboardRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput, isStructured: false };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, { message: chatInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const aiResponse = response.data.response;
      const legalData = parseLegalResponse(aiResponse);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        isStructured: !!legalData,
        legalData: legalData
      }]);
    } catch (error) {
      toast.error('Chat error');
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
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

  const exampleQuestions = [
    "What is Section 302 IPC?",
    "Explain anticipatory bail",
    "Property dispute rights",
    "Consumer complaint process"
  ];

  return (
    <div className={`h-screen ${darkMode ? 'bg-slate-950' : 'bg-[#ecf5ff]'} flex overflow-hidden font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      {/* Floating Sidebar */}
      <div className={`w-24 m-4 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white/50'} rounded-[2.5rem] flex flex-col items-center py-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border backdrop-blur-sm z-20 h-[calc(100vh-2rem)] transition-all duration-300`}>
        {/* Logo */}
        {/* Logo Icon Only */}
        <div className="p-6 flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl">L</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-4 flex flex-col items-center">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'consultation', icon: Calendar, label: 'Consultation' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
            { id: 'chatbot', icon: Scale, label: 'AI Assistant' },
            { id: 'documents', icon: FileText, label: 'Documents' }
          ].map((item) => (
            <button
              key={item.id}
              data-testid={`${item.id}-nav-btn`}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110'
                : `${darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-blue-400' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`
                }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>

        {/* User Profile - Bottom Sidebar */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-gray-100'} flex flex-col items-center gap-4`}>
          <button
            onClick={toggleDarkMode}
            className={`w-10 h-10 rounded-full border ${darkMode ? 'border-slate-700 bg-slate-800 text-yellow-400' : 'border-gray-200 text-gray-400 hover:text-blue-600'} flex items-center justify-center transition-all`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className={`text-gray-400 hover:text-red-500 transition-colors ${darkMode ? 'hover:bg-slate-800 p-2 rounded-full' : ''}`}
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Floating Glassmorphic Container */}
      <div className={`flex-1 m-4 ml-0 ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white/40 border-white/60'} backdrop-blur-xl rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col relative transition-all duration-300`}>

        {/* Top Header Bar */}
        <div className={`px-8 py-6 flex items-center justify-between ${darkMode ? 'bg-slate-900/30 border-slate-700/50' : 'bg-white/30 border-white/40'} backdrop-blur-md border-b sticky top-0 z-10 transition-colors`}>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Good Morning, {user?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="text-sm text-gray-500 font-medium">Your weekly legal update <span className="text-blue-500">▼</span></p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search here"
                className={`pl-10 pr-4 py-2.5 ${darkMode ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-white text-gray-900'} rounded-full text-sm border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-blue-500 w-64 transition-all`}
              />
            </div>
            <button className={`w-10 h-10 ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-white text-gray-500 hover:text-blue-600'} rounded-full flex items-center justify-center shadow-sm transition-colors`}>
              <AlertTriangle className="w-5 h-5" />
            </button>
            <button className={`w-10 h-10 ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-white text-gray-500 hover:text-blue-600'} rounded-full flex items-center justify-center shadow-sm transition-colors`}>
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px]">
              <div className={`w-full h-full rounded-full ${darkMode ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
                {/* Placeholder Avatar if no image */}
                <User className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="p-8 space-y-8">

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
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Gavel className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Active Cases</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{cases.length}</span>
                        <span className={`text-xs ${darkMode ? 'text-green-400 bg-green-900/30' : 'text-green-500 bg-green-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>+2 new</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Updated just now</p>
                    </div>
                  </div>

                  {/* Card 2 - Pending Docs */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Pending Docs</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{documents.length}</span>
                        <span className={`text-xs ${darkMode ? 'text-orange-400 bg-orange-900/30' : 'text-orange-500 bg-orange-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>Action needed</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Requires review</p>
                    </div>
                  </div>

                  {/* Card 3 - Hearings */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-orange-900/20' : 'bg-orange-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>Next Hearing</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{bookings.length}</span>
                        <span className={`text-xs ${darkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-500 bg-blue-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>Upcoming</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Check schedule</p>
                    </div>
                  </div>

                  {/* Card 4 - Messages */}
                  <div className={`${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-sm'} rounded-[1.5rem] p-5 hover:shadow-md transition-all border relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 w-20 h-20 ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} rounded-bl-[2.5rem] transition-colors group-hover:bg-green-100 dark:group-hover:bg-green-900/30`}></div>
                    <div className="relative z-10">
                      <div className={`w-10 h-10 ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h3 className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium mb-1`}>New Messages</h3>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>3</span>
                        <span className={`text-xs ${darkMode ? 'text-green-400 bg-green-900/30' : 'text-green-500 bg-green-50'} font-bold mb-1.5 px-2 py-0.5 rounded-full`}>Active</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Response needed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Featured Section - My Legal Status */}
                <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold">Case<br />Status</h3>
                        <button className="text-white/70 hover:text-white">
                          <span className="text-xl">⋮</span>
                        </button>
                      </div>

                      {/* Radial Progress Placeholder */}
                      <div className="flex justify-center mb-6">
                        <div className="relative w-40 h-24 overflow-hidden">
                          <div className="absolute top-0 left-0 w-40 h-40 border-[12px] border-white/20 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-40 h-40 border-[12px] border-t-white border-r-white border-b-transparent border-l-transparent rounded-full rotate-[-45deg]"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center mb-2">
                            <span className="text-3xl font-bold">75%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Ongoing Analysis</h4>
                      <p className="text-blue-100 text-sm mb-4">Your case documentation is 75% complete. Review pending items.</p>
                      <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upcoming List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Timeline & Activity</h2>
                    <span className={`text-xs font-semibold px-3 py-1 ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-500'} rounded-full shadow-sm cursor-pointer`}>View History</span>
                  </div>

                  <div className={`${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-white/60 border-white/60'} backdrop-blur-md rounded-[2rem] p-6 shadow-sm border`}>
                    <div className="space-y-4">
                      {/* Activity Item 1 */}
                      <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-slate-800 border-slate-700 shadow-none' : 'bg-white border-gray-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'} rounded-2xl border hover:shadow-md transition-all`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center`}>
                            <Gavel className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>New Evidence Submitted</h4>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Case #4829 • Property Dispute</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'} block`}>Today</span>
                          <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>10:42 AM</span>
                        </div>
                      </div>

                      {/* Activity Item 2 */}
                      <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-slate-800 border-slate-700 shadow-none' : 'bg-white border-gray-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'} rounded-2xl border hover:shadow-md transition-all`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'} rounded-xl flex items-center justify-center`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Meeting Confirmed</h4>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Adv. Sharma • Consultation</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'} block`}>Tomorrow</span>
                          <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>2:00 PM</span>
                        </div>
                      </div>

                      {/* Chart Placeholder Area */}
                      <div className="mt-4 p-4">
                        <div className="flex items-end justify-between h-32 gap-2">
                          {[40, 65, 30, 85, 50, 60, 90].map((h, i) => (
                            <div key={i} className={`flex-1 ${darkMode ? 'bg-slate-800' : 'bg-blue-100'} rounded-t-lg relative group overflow-hidden`}>
                              <div
                                className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                                style={{ height: `${h}%` }}
                              ></div>
                            </div>
                          ))}
                        </div>
                        <div className={`flex justify-between mt-2 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'} font-medium px-1`}>
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                          <span>Sun</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                {/* Last section for Dashboard Tab */}
              </div>

            </div>
          )}

          {/* Consultation Tab */}
          {activeTab === 'consultation' && (
            <div className={`p-8 ${darkMode ? 'bg-slate-950' : 'bg-white'} min-h-full transition-colors`}>
              <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Find Your Legal Expert</h1>

              {/* Consultation Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="relative overflow-hidden rounded-3xl shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600"
                    alt="Consultation"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">Direct Consultation</h3>
                    <p className="text-gray-200 text-sm mb-4">Browse our directory of vetted lawyers. Filter by specialization, experience, and location to find your perfect match.</p>
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 rounded-xl shadow-lg">
                      Find a Lawyer →
                    </Button>
                  </div>
                </div>

                <div className={`relative overflow-hidden rounded-3xl ${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-800' : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500'} border p-6 flex flex-col shadow-xl`}>
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">AI-Powered Recommendation</h3>
                  <p className="text-blue-100 text-sm mb-4 flex-1">Answer a few questions and let our advanced AI match you with the best lawyer for your specific case instantly.</p>
                  <Button className="bg-white hover:bg-gray-100 text-blue-700 rounded-xl shadow-lg">
                    Start Matching 🔒
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl p-6 border text-center shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-14 h-14 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Shield className="w-7 h-7" />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>End-to-End Encrypted</h4>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} text-sm`}>Your privacy is guaranteed. No recordings, ever.</p>
                </div>

                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl p-6 border text-center shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-14 h-14 ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>PDF Transcripts</h4>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} text-sm`}>Receive a searchable PDF transcript of your call.</p>
                </div>

                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl p-6 border text-center shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`w-14 h-14 ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Mic className="w-7 h-7" />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Voice Assistant</h4>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} text-sm`}>Easily navigate and control your call with voice.</p>
                </div>
              </div>

              {/* Recommended Lawyers */}
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recommended Lawyers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dummyLawyers.map((lawyer) => (
                  <LawyerCard
                    key={lawyer.id}
                    name={lawyer.name}
                    specialization={lawyer.specialization}
                    experience={lawyer.experience}
                    successRate={lawyer.successRate}
                    location={lawyer.location}
                    hourlyRate={lawyer.hourlyRate}
                    onBook={() => toast.success(`Booking request sent to ${lawyer.name}`)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ChatBot Tab - Enhanced with Legal Analysis Cards */}
          {activeTab === 'chatbot' && (
            <div className={`h-full flex flex-col ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} transition-colors`}>
              <div className={`p-6 border-b ${darkMode ? 'border-slate-800 bg-gradient-to-r from-blue-900 to-indigo-900' : 'border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
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
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
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
                                    borderColor="border-red-500"
                                    bgColor="bg-red-500"
                                    darkMode={darkMode}
                                  />
                                  <LegalAnalysisCard
                                    icon={Clock}
                                    title="Trial Timeline"
                                    content={msg.legalData.analysis.timeline}
                                    borderColor="border-green-500"
                                    bgColor="bg-green-500"
                                    darkMode={darkMode}
                                  />
                                  <LegalAnalysisCard
                                    icon={AlertTriangle}
                                    title="Punishment"
                                    content={msg.legalData.analysis.punishment}
                                    borderColor="border-orange-500"
                                    bgColor="bg-orange-500"
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
                                    borderColor="border-purple-500"
                                    bgColor="bg-purple-500"
                                  />
                                  <LegalAnalysisCard
                                    icon={TrendingUp}
                                    title="Severity"
                                    content={msg.legalData.analysis.severity}
                                    borderColor="border-amber-500"
                                    bgColor="bg-amber-500"
                                  />
                                </div>

                                {/* Recommended Lawyers */}
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Legal Experts</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {dummyLawyers.map((lawyer) => (
                                      <LawyerCard
                                        key={lawyer.id}
                                        name={lawyer.name}
                                        specialization={lawyer.specialization}
                                        experience={lawyer.experience}
                                        successRate={lawyer.successRate}
                                        location={lawyer.location}
                                        hourlyRate={lawyer.hourlyRate}
                                        onBook={() => toast.success(`Booking request sent to ${lawyer.name}`)}
                                        darkMode={darkMode}
                                      />
                                    ))}
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
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
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-200 text-gray-400'} rounded-lg transition-colors`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          {
            activeTab === 'messages' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        End-to-End Encrypted
                      </span>
                    </div>
                    <p className="text-gray-500">Secure communication with your lawyers</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-lg shadow-blue-200">
                    + New Message
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                  {/* Conversations List */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input placeholder="Search conversations..." className="pl-10 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20" />
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
                                <h4 className="font-bold text-gray-900 truncate">{chat.name}</h4>
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
                              <p className="font-semibold text-gray-900">{selectedChat.name}</p>
                              <p className="text-xs text-green-600">Online • Your Legal Counsel</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                              <ListChecks className="w-5 h-5 text-gray-500" />
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
                                  ? 'bg-blue-600 text-white rounded-tr-none'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
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
                              className="flex-1 bg-gray-100 border-gray-200 rounded-full px-5 text-gray-900"
                            />
                            <Button type="submit" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center">
                              <Send className="w-4 h-4 text-white" />
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
              </div>
            )
          }

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-8 bg-white min-h-full">
              <h1 className="text-3xl font-bold mb-8 text-gray-900">My Documents</h1>

              {documents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No documents uploaded yet.</p>
                  <p className="text-gray-500 text-sm">Upload your first document to get started.</p>
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-200">
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {documents.map(doc => (
                    <div key={doc.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-bold mb-2 text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">Type: {doc.file_type}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
