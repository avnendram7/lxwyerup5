import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, LogOut, User, Briefcase, Calendar, FileText, Clock, CheckCircle, MessageSquare, Phone, Mail, Building2, Bell, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { API } from '../App';

export default function FirmClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [caseUpdates, setCaseUpdates] = useState([]);

  // Dummy data for demo
  const dummyClient = {
    id: 'dummy_client_1',
    full_name: 'Dummy Client',
    email: 'dummy.client@example.com',
    phone: '+91 9876543210',
    law_firm_name: 'Dummy Law Firm',
    law_firm_id: '1',
    case_type: 'Civil Law',
    case_description: 'This is a dummy case description for demonstration purposes.',
    assigned_lawyer_name: 'Dummy Lawyer',
    assigned_lawyer_id: 'dummy_lawyer_1',
    status: 'active',
    payment_status: 'paid',
    payment_amount: 2000,
    created_at: '2025-01-01T00:00:00'
  };

  const dummyCaseUpdates = [
    {
      id: '1',
      update_type: 'hearing_date',
      title: 'Dummy Court Hearing',
      description: 'This is a dummy case update for demonstration purposes.',
      created_at: '2025-01-22T10:00:00',
      created_by: 'Dummy Lawyer'
    }
  ];

  const dummyLawyer = {
    name: 'Dummy Lawyer',
    specialization: 'Civil Law',
    experience: '10+ years',
    phone: '+91 98765 43210',
    email: 'dummy.lawyer@example.com'
  };

  const upcomingEvents = [
    { date: 'Jan 28', title: 'Review Meeting', time: '3:00 PM', type: 'meeting' },
    { date: 'Feb 15', title: 'Court Hearing', time: '10:00 AM', type: 'hearing' },
    { date: 'Feb 20', title: 'Document Submission', time: '11:00 AM', type: 'deadline' }
  ];

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setClient(user);

    if (token) {
      axios.get(`${API}/dashboard/firm-client`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setDashboardData(res.data);
          if (res.data.updates) {
            setCaseUpdates(res.data.updates.map((u, i) => ({
              id: i,
              title: "Case Update",
              description: u.message,
              created_at: u.date,
              update_type: 'generic',
              created_by: 'Firm'
            })));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'hearing_date': return Calendar;
      case 'document_submitted': return FileText;
      case 'meeting_scheduled': return Clock;
      default: return Bell;
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'hearing_date': return 'bg-blue-100 text-blue-600';
      case 'document_submitted': return 'bg-green-100 text-green-600';
      case 'meeting_scheduled': return 'bg-purple-100 text-purple-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0F2944] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const displayClient = client || dummyClient;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50" data-testid="firm-client-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0F2944] rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F2944]">Client Dashboard</h1>
                <p className="text-xs text-blue-600">{displayClient.law_firm_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#0F2944]">{displayClient.full_name}</p>
                <p className="text-xs text-gray-500">{displayClient.email}</p>
              </div>
              <button
                onClick={handleLogout}
                data-testid="logout-btn"
                className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0F2944] mb-2">
            Welcome back, {displayClient.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your case with {displayClient.law_firm_name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <Briefcase className="w-8 h-8 text-white/80" />
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-green-100 text-sm mb-1">Case Status</p>
            <p className="text-2xl font-bold text-white capitalize">{displayClient.status || 'Active'}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 text-white/80" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Next Hearing</p>
            <p className="text-xl font-bold text-white">Feb 15, 2025</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-white/80" />
            </div>
            <p className="text-purple-100 text-sm mb-1">Documents</p>
            <p className="text-2xl font-bold text-white">8</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-500/20">
            <div className="flex items-center justify-between mb-3">
              <Bell className="w-8 h-8 text-white/80" />
            </div>
            <p className="text-orange-100 text-sm mb-1">Updates</p>
            <p className="text-2xl font-bold text-white">{caseUpdates.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Case Updates - Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Updates */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#0F2944]">Case Updates</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
                  {caseUpdates.length} Updates
                </span>
              </div>

              <div className="space-y-4">
                {caseUpdates.map((update, index) => {
                  const Icon = getUpdateIcon(update.update_type);
                  const colorClass = getUpdateColor(update.update_type);
                  return (
                    <div
                      key={update.id || index}
                      className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-[#0F2944] font-semibold">{update.title}</h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(update.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                          <p className="text-xs text-gray-500">By: {update.created_by}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#0F2944] mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${event.type === 'hearing' ? 'bg-red-50 text-red-500' :
                        event.type === 'meeting' ? 'bg-blue-50 text-blue-500' :
                          'bg-orange-50 text-orange-500'
                        }`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[#0F2944] font-semibold">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Lawyer */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F2944] mb-4">Your Lawyer</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0F2944] to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F2944]">{displayClient.assigned_lawyer_name || dummyLawyer.name}</p>
                    <p className="text-sm text-blue-600">{dummyLawyer.specialization}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{dummyLawyer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{dummyLawyer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{dummyLawyer.experience} experience</span>
                  </div>
                </div>

                <Button className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white font-semibold py-3 rounded-xl transition-all">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Message Lawyer
                </Button>
              </div>
            </div>

            {/* Case Information */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F2944] mb-4">Case Details</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Law Firm</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <p className="text-[#0F2944] font-semibold">{displayClient.law_firm_name}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Case Type</p>
                  <p className="text-[#0F2944] font-semibold capitalize">{displayClient.case_type}</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-semibold capitalize">
                    {displayClient.status || 'Active'}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Started On</p>
                  <p className="text-[#0F2944] font-semibold">
                    {new Date(displayClient.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {displayClient.payment_status && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs text-green-600 mb-1">Payment Status</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#0F2944] font-semibold capitalize">{displayClient.payment_status}</span>
                      <span className="text-green-600 font-bold">₹{displayClient.payment_amount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F2944] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full border-gray-200 text-[#0F2944] hover:bg-gray-50 font-medium py-3 rounded-xl">
                  <FileText className="w-5 h-5 mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full border-gray-200 text-[#0F2944] hover:bg-gray-50 font-medium py-3 rounded-xl">
                  <Calendar className="w-5 h-5 mr-2" />
                  Request Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
