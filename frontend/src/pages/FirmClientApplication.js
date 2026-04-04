import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Building2, ArrowRight, Mail, Phone, Briefcase, FileText, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { dummyLawFirms } from '../data/lawFirmsData';

const SimpleNavbar = ({ navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <img src="/logo.png" alt="Lxwyer Up Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-md" style={{ mixBlendMode: "screen" }} />
            <span className="text-xl font-bold text-[#0F2944]">Lxwyer Up</span>
          </button>
          
          <button
            onClick={() => navigate('/lawfirm-role')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0F2944] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </nav>
  );
};

export default function FirmClientApplication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lawFirms, setLawFirms] = useState(dummyLawFirms);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    company_name: '',
    case_type: 'civil',
    case_description: '',
    law_firm_id: '',
    law_firm_name: ''
  });

  useEffect(() => {
    fetchLawFirms();
  }, []);

  const fetchLawFirms = async () => {
    try {
      const response = await axios.get(`${API}/lawfirms`);
      if (response.data && response.data.length > 0) {
        const approvedFirms = response.data.filter(firm => firm.status === 'approved');
        setLawFirms([...approvedFirms, ...dummyLawFirms]);
      }
    } catch (error) {
      console.log('Using dummy law firms data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const selectedFirm = lawFirms.find(f => f.id === formData.law_firm_id);
      if (!selectedFirm) {
        toast.error('Please select a law firm');
        setLoading(false);
        return;
      }

      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company_name: formData.company_name,
        case_type: formData.case_type,
        case_description: formData.case_description,
        law_firm_id: formData.law_firm_id,
        law_firm_name: selectedFirm.firm_name
      };

      await axios.post(`${API}/firm-clients/applications`, payload);
      
      toast.success('Application submitted successfully! You will receive an email once approved.');
      setTimeout(() => navigate('/lawfirm-role'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />

      {/* Main Content */}
      <main className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#0F2944]/10 border border-[#0F2944]/20 rounded-lg mb-6">
            <Building2 className="w-5 h-5 text-[#0F2944]" />
            <span className="text-[#0F2944] text-sm font-medium">Firm Client Application</span>
          </div>
          <h1 className="text-4xl font-bold text-[#0F2944] mb-4">
            Join a Law Firm as Client
          </h1>
          <p className="text-gray-600 text-lg">
            Apply to work with a law firm and get professional legal assistance
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#0F2944] mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                      className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Company Name (Optional)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Your Company Ltd."
                      className="pl-10 bg-white border-gray-200 rounded-xl text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#0F2944] mb-4">Account Credentials</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set your password for login after approval
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password (min 6 characters)"
                      className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944] transition-colors duration-200"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944] transition-colors duration-200"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirm_password && formData.password !== formData.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#0F2944] mb-4">Case Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">
                    Select Law Firm *
                  </label>
                  <select
                    value={formData.law_firm_id}
                    onChange={(e) => setFormData({ ...formData, law_firm_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944] transition-colors duration-200"
                    required
                  >
                    <option value="">Choose a law firm</option>
                    {lawFirms.map(firm => (
                      <option key={firm.id} value={firm.id}>
                        {firm.firm_name} - {firm.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">
                    Case Type *
                  </label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944] transition-colors duration-200"
                    required
                  >
                    <option value="civil">Civil</option>
                    <option value="criminal">Criminal</option>
                    <option value="corporate">Corporate</option>
                    <option value="family">Family</option>
                    <option value="property">Property</option>
                    <option value="tax">Tax</option>
                    <option value="intellectual_property">Intellectual Property</option>
                    <option value="labor">Labor & Employment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">
                    Case Description *
                  </label>
                  <textarea
                    value={formData.case_description}
                    onChange={(e) => setFormData({ ...formData, case_description: e.target.value })}
                    placeholder="Describe your case in detail..."
                    rows="6"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944] transition-colors duration-200 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Please provide as much detail as possible to help us understand your case
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-6 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Application...' : (
                  <>
                    Submit Application
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Your application will be reviewed by the law firm. You'll receive an email once approved.
              </p>
            </div>
          </form>
        </div>

        {/* Already Applied */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already applied?{' '}
            <button 
              onClick={() => navigate('/firm-client-login')}
              className="text-[#0F2944] hover:underline font-medium transition-colors"
            >
              Login here
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
