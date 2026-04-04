import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Scale, ArrowLeft, Building2, User, Mail, Phone, Briefcase, GraduationCap, Languages, CheckCircle, ArrowRight, ShieldCheck, CreditCard, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

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

export default function FirmLawyerApplication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lawFirms, setLawFirms] = useState([]);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    firm_id: '',
    specialization: '',
    experience_years: '',
    bar_council_number: '',
    education: '',
    languages: '',
    bio: '',
    catchphrase: ''
  });

  const specializations = [
    'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law', 
    'Property Law', 'Tax Law', 'Labour Law', 'Consumer Law',
    'Constitutional Law', 'Intellectual Property', 'Banking Law', 'Cyber Law'
  ];

  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const response = await axios.get(`${API}/lawfirms`);
        if (response.data && Array.isArray(response.data)) {
          setLawFirms(response.data);
        }
      } catch (error) {
        console.log('Error fetching law firms');
      }
    };
    fetchLawFirms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Note: e.preventDefault() removed as this will be called from a button click not form sumbit
    
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.firm_id) {
      toast.error('Please select a law firm');
      return;
    }

    setLoading(true);
    
    try {
      const selectedFirm = lawFirms.find(f => f.id === formData.firm_id);
      
      const applicationData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        firm_id: formData.firm_id,
        firm_name: selectedFirm?.firm_name || selectedFirm?.full_name || 'Unknown Firm',
        specialization: formData.specialization,
        experience_years: parseInt(formData.experience_years) || 1,
        bar_council_number: formData.bar_council_number,
        education: formData.education,
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
        bio: formData.bio,
        catchphrase: formData.catchphrase
      };

      await axios.post(`${API}/firm-lawyer-applications`, applicationData);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <SimpleNavbar navigate={navigate} />
        
        <div className="pt-24 flex items-center justify-center px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#0F2944] mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Your application to join the law firm has been submitted successfully. 
              You will be notified once the admin reviews and approves your application.
            </p>
            <Button
              onClick={() => navigate('/lawfirm-role')}
              className="bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl px-8"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SimpleNavbar navigate={navigate} />

      <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= s ? 'bg-[#0F2944] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#0F2944]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-[#0F2944]/10 text-[#0F2944] rounded-full text-xs font-medium mb-4">
              FIRM LAWYER APPLICATION
            </span>
            <h2 className="text-2xl font-bold text-[#0F2944] mb-2">
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Select Your Law Firm'}
              {step === 3 && 'Professional Details'}
              {step === 4 && 'Application Processing Fee'}
            </h2>
            <p className="text-gray-600 text-sm">
              {step === 1 && 'Enter your basic information'}
              {step === 2 && 'Choose the law firm you want to join'}
              {step === 3 && 'Tell us about your legal expertise'}
              {step === 4 && 'Final step to submit your application'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Adv. Your Name"
                      required
                      className="bg-white border-gray-200 text-black pl-10 rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="bg-white border-gray-200 text-black pl-10 rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      className="bg-white border-gray-200 text-black pl-10 rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-2">Password *</label>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="bg-white border-gray-200 text-black rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-2">Confirm Password *</label>
                    <Input
                      name="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="bg-white border-gray-200 text-black rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
                      toast.error('Please fill all required fields');
                      return;
                    }
                    if (formData.password !== formData.confirm_password) {
                      toast.error('Passwords do not match');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3 mt-4"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Select Law Firm */}
            {step === 2 && (
              <div className="space-y-4">
                {lawFirms.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {lawFirms.map((firm) => (
                      <div
                        key={firm.id}
                        onClick={() => setFormData({ ...formData, firm_id: firm.id })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.firm_id === firm.id
                            ? 'bg-[#0F2944]/10 border-[#0F2944]'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#0F2944] rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#0F2944]">{firm.firm_name || firm.full_name}</h3>
                            <p className="text-sm text-gray-600">{firm.city}, {firm.state}</p>
                            {firm.practice_areas && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {firm.practice_areas.slice(0, 3).map((area, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {formData.firm_id === firm.id && (
                            <CheckCircle className="w-6 h-6 text-[#0F2944]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No law firms available yet.</p>
                    <p className="text-sm mt-2">Please check back later or contact support.</p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!formData.firm_id) {
                        toast.error('Please select a law firm');
                        return;
                      }
                      setStep(3);
                    }}
                    disabled={lawFirms.length === 0}
                    className="flex-1 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Professional Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 text-black rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-2">Experience (Years) *</label>
                    <Input
                      name="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={handleChange}
                      placeholder="5"
                      required
                      className="bg-white border-gray-200 text-black rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F2944] mb-2">Bar Council Number</label>
                    <Input
                      name="bar_council_number"
                      value={formData.bar_council_number}
                      onChange={handleChange}
                      placeholder="DL/1234/2020"
                      className="bg-white border-gray-200 text-black rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Education</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="LLB, Delhi University"
                      className="bg-white border-gray-200 text-black pl-10 rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Languages (comma separated)</label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="Hindi, English, Punjabi"
                      className="bg-white border-gray-200 text-black pl-10 rounded-xl py-3 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">Catchphrase / One Liner * (Max 20 words)</label>
                  <Input
                    name="catchphrase"
                    value={formData.catchphrase || ''}
                    onChange={handleChange}
                    placeholder="Why should clients choose you?"
                    className="bg-white border-gray-200 text-black rounded-xl py-3 placeholder:text-gray-400 mb-4"
                  />
                  <label className="block text-sm font-medium text-[#0F2944] mb-2">About You</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your experience and expertise..."
                    rows={3}
                    className="w-full bg-white border border-gray-200 text-black rounded-xl px-4 py-3 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F2944]/20 focus:border-[#0F2944]"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!formData.specialization || !formData.experience_years || !formData.catchphrase) {
                        toast.error('Please fill required professional details including catchphrase');
                        return;
                      }
                      if (formData.catchphrase && formData.catchphrase.trim().split(/\s+/).length > 20) {
                        toast.error('Catchphrase must be under 20 words');
                        return;
                      }
                      setStep(4);
                    }}
                    className="flex-1 bg-[#0F2944] hover:bg-[#0F2944]/90 text-white rounded-xl py-3"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Checkout */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">Payment Summary</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>Application Evaluation</span>
                        <span>₹1,694.92</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>GST (18%)</span>
                        <span>₹305.08</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                        <span>Total Secure Payment</span>
                        <span className="text-emerald-600 dark:text-emerald-400">₹2,000.00</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 mb-2 shadow-sm">
                      <div className="flex gap-3">
                        <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1.5" /></div>
                        <div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 text-[15px]">100% Refundable Guarantee</h4>
                          <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                            The ₹2000 application fee establishes commitment. If selected, you will be refunded ₹1000 and receive a 2-month Apex Verified subscription (worth ₹2,500). If not selected, you will receive a full ₹2000 refund within 48 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2 mb-6">
                  <Lock className="w-3.5 h-3.5" /> Payments are securely processed via 256-bit AES encryption.
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ₹2500 & Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-500">Already approved? </span>
            <button 
              onClick={() => navigate('/lawfirm-lawyer-login')}
              className="text-[#0F2944] hover:underline font-semibold"
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
