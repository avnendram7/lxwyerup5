import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Mail, Phone, Lock, MapPin, Briefcase, GraduationCap, IndianRupee, FileText, Camera, CheckCircle, ArrowLeft, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { dummyLawFirms } from '../data/lawFirmsDataExtended';
import { WaveLayout } from '../components/WaveLayout';

const states = ["Delhi", "Haryana", "Uttar Pradesh"];
const citiesByState = {
  "Delhi": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ],
  "Haryana": [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind",
    "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari",
    "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat",
    "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor",
    "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad",
    "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur",
    "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar",
    "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri",
    "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh",
    "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur",
    "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
  ]
};

const courtsByState = {
  "Delhi": [
    "Delhi High Court", "Tis Hazari Courts Complex", "Patiala House Courts Complex",
    "Karkardooma Courts Complex", "Rohini Courts Complex", "Dwarka Courts Complex",
    "Saket Courts Complex", "Rouse Avenue Courts Complex"
  ],
  "Haryana": [
    "Punjab and Haryana High Court", "District Court Ambala", "District Court Bhiwani", "District Court Charkhi Dadri",
    "District Court Faridabad", "District Court Fatehabad", "District Court Gurugram", "District Court Hisar",
    "District Court Jhajjar", "District Court Jind", "District Court Kaithal", "District Court Karnal",
    "District Court Kurukshetra", "District Court Mahendragarh", "District Court Nuh", "District Court Palwal",
    "District Court Panchkula", "District Court Panipat", "District Court Rewari", "District Court Rohtak",
    "District Court Sirsa", "District Court Sonipat", "District Court Yamunanagar"
  ],
  "Uttar Pradesh": [
    "Allahabad High Court", "Allahabad High Court - Lucknow Bench",
    "District Court Agra", "District Court Aligarh", "District Court Ambedkar Nagar", "District Court Amethi",
    "District Court Amroha", "District Court Auraiya", "District Court Ayodhya", "District Court Azamgarh",
    "District Court Baghpat", "District Court Bahraich", "District Court Ballia", "District Court Balrampur",
    "District Court Banda", "District Court Barabanki", "District Court Bareilly", "District Court Basti",
    "District Court Bhadohi", "District Court Bijnor", "District Court Budaun", "District Court Bulandshahr",
    "District Court Chandauli", "District Court Chitrakoot", "District Court Deoria", "District Court Etah",
    "District Court Etawah", "District Court Farrukhabad", "District Court Fatehpur", "District Court Firozabad",
    "District Court Gautam Buddha Nagar", "District Court Ghaziabad", "District Court Ghazipur", "District Court Gonda",
    "District Court Gorakhpur", "District Court Hamirpur", "District Court Hapur", "District Court Hardoi",
    "District Court Hathras", "District Court Jalaun", "District Court Jaunpur", "District Court Jhansi",
    "District Court Kannauj", "District Court Kanpur Dehat", "District Court Kanpur Nagar", "District Court Kasganj",
    "District Court Kaushambi", "District Court Kheri", "District Court Kushinagar", "District Court Lalitpur",
    "District Court Lucknow", "District Court Maharajganj", "District Court Mahoba", "District Court Mainpuri",
    "District Court Mathura", "District Court Mau", "District Court Meerut", "District Court Mirzapur",
    "District Court Moradabad", "District Court Muzaffarnagar", "District Court Pilibhit", "District Court Pratapgarh",
    "District Court Prayagraj", "District Court Raebareli", "District Court Rampur", "District Court Saharanpur",
    "District Court Sambhal", "District Court Sant Kabir Nagar", "District Court Shahjahanpur", "District Court Shamli",
    "District Court Shravasti", "District Court Siddharthnagar", "District Court Sitapur", "District Court Sonbhadra",
    "District Court Sultanpur", "District Court Unnao", "District Court Varanasi"
  ]
};

const specializations = [
  "Criminal Law", "Family Law", "Property Law", "Corporate Law", "Civil Law",
  "Cyber Law", "Tax Law", "Labour Law", "Constitutional Law", "Consumer Law",
  "Banking Law", "Immigration Law", "Intellectual Property", "Medical Negligence", "Environmental Law"
];
const languageOptions = ["Hindi", "English", "Marathi", "Punjabi", "Gujarati", "Tamil", "Telugu", "Bengali", "Kannada", "Malayalam", "Urdu"];

export default function LawyerApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lawFirms, setLawFirms] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    photo: '',
    lawyerType: '', // 'independent' or 'law_firm'
    lawFirmId: '',
    lawFirmName: '',
    barCouncilNumber: '',
    specialization: '',
    experience: '',
    state: '',
    city: '',
    court: '',
    education: '',
    languages: [],
    feeMin: '',
    feeMax: '',
    bio: '',
    officeAddress: ''
  });

  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const response = await axios.get(`${API}/lawfirms`);
        if (response.data && response.data.length > 0) {
          setLawFirms([...response.data, ...dummyLawFirms]);
        } else {
          setLawFirms(dummyLawFirms);
        }
      } catch (error) {
        setLawFirms(dummyLawFirms);
      }
    };
    fetchLawFirms();
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast.error('Please fill all required fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      if (!formData.lawyerType) {
        toast.error('Please select if you are Independent or Law Firm Associate');
        return false;
      }
      if (formData.lawyerType === 'law_firm' && !formData.lawFirmId) {
        toast.error('Please select your law firm');
        return false;
      }
    }
    if (stepNum === 2) {
      if (!formData.barCouncilNumber || !formData.specialization || !formData.experience) {
        toast.error('Please fill all required fields');
        return false;
      }
    }
    if (stepNum === 3) {
      if (!formData.state || !formData.city || !formData.court) {
        toast.error('Please select your location details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.education || formData.languages.length === 0 || !formData.bio) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        photo: formData.photo || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 90)}.jpg`,
        lawyer_type: formData.lawyerType,
        law_firm_id: formData.lawyerType === 'law_firm' ? formData.lawFirmId : null,
        law_firm_name: formData.lawyerType === 'law_firm' ? formData.lawFirmName : null,
        bar_council_number: formData.barCouncilNumber,
        specialization: formData.specialization,
        experience: parseInt(formData.experience) || 0,
        cases_won: 0,
        state: formData.state,
        city: formData.city,
        court: formData.court,
        education: formData.education,
        languages: formData.languages,
        fee_range: `₹${formData.feeMin} - ₹${formData.feeMax}`,
        bio: formData.bio,
        office_address: formData.officeAddress
      };

      const response = await axios.post(`${API}/lawyers/applications`, payload);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Submission error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to submit application';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <WaveLayout>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center p-8 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Application Submitted!</h2>
            <p className="text-slate-600 mb-4">
              Thank you for applying to join LxwyerAI. Our team will review your application and get back to you within 24-48 hours.
            </p>

            <div className="bg-blue-50/50 rounded-xl p-4 mb-6 text-left border border-blue-100">
              <p className="text-sm text-slate-800">
                <strong>Application Type:</strong> {formData.lawyerType === 'independent' ? 'Independent Lawyer' : 'Law Firm Associate'}
              </p>
              {formData.lawyerType === 'law_firm' && (
                <p className="text-sm text-slate-800 mt-1">
                  <strong>Law Firm:</strong> {formData.lawFirmName}
                </p>
              )}
              <p className="text-sm text-slate-600 mt-2">
                Once approved, you can login with <strong>{formData.email}</strong> to access your dashboard.
              </p>
            </div>

            <Button
              onClick={() => navigate('/')}
              className="w-full bg-slate-900 text-white rounded-xl py-6 hover:bg-slate-800"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>
      </WaveLayout>
    );
  }

  return (
    <WaveLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Progress Steps */}
        <div className="w-full max-w-2xl flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all shadow-sm ${s === step ? 'bg-indigo-600 text-white shadow-indigo-200' :
                s < step ? 'bg-green-500 text-white' :
                  'bg-white text-slate-400 border border-slate-200'
                }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 mx-2 rounded ${s < step ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-6 sm:p-8"
        >
          {/* Step 1: Personal Info + Lawyer Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                <p className="text-slate-500">Let's start with your basic details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Adv. Rajesh Kumar"
                      className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="advocate@example.com"
                      className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Lawyer Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Professional Type *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        updateFields({
                          lawyerType: 'independent',
                          lawFirmId: '',
                          lawFirmName: ''
                        });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.lawyerType === 'independent'
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-indigo-200 bg-white/50'
                        }`}
                    >
                      <User className={`w-8 h-8 ${formData.lawyerType === 'independent' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className={`font-medium ${formData.lawyerType === 'independent' ? 'text-indigo-900' : 'text-slate-600'}`}>
                        Independent
                      </span>
                      <span className="text-xs text-slate-500 text-center">Personal practice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('lawyerType', 'law_firm')}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.lawyerType === 'law_firm'
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-indigo-200 bg-white/50'
                        }`}
                    >
                      <Building2 className={`w-8 h-8 ${formData.lawyerType === 'law_firm' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className={`font-medium ${formData.lawyerType === 'law_firm' ? 'text-indigo-900' : 'text-slate-600'}`}>
                        Associate
                      </span>
                      <span className="text-xs text-slate-500 text-center">Law Firm</span>
                    </button>
                  </div>
                </div>

                {/* Law Firm Selection (if law_firm type selected) */}
                <AnimatePresence>
                  {formData.lawyerType === 'law_firm' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-2">Select Your Law Firm *</label>
                      <select
                        value={formData.lawFirmId}
                        onChange={(e) => {
                          const selectedFirm = lawFirms.find(f => f.id === e.target.value);
                          updateFields({
                            lawFirmId: e.target.value,
                            lawFirmName: selectedFirm?.firm_name || ''
                          });
                        }}
                        className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="">Select a law firm</option>
                        {lawFirms.map(firm => (
                          <option key={firm.id} value={firm.id}>
                            {firm.firm_name} - {firm.city}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">
                        Don't see your firm? Ask your firm admin to register first.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo (Max 10MB)</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="pl-10 bg-white/50 border-slate-200 file:bg-indigo-50 file:text-indigo-700 file:border-0 file:rounded-lg text-slate-900"
                      />
                    </div>
                    {formData.photo && (
                      <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={formData.photo}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Professional Details</h2>
                <p className="text-slate-500">Your expertise and qualifications</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bar Council Number *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.barCouncilNumber}
                      onChange={(e) => updateField('barCouncilNumber', e.target.value)}
                      placeholder="D/1234/2015"
                      className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialization *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => updateField('specialization', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="number"
                        value={formData.experience}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 2);
                          updateField('experience', val);
                        }}
                        placeholder="10"
                        className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Practice Location</h2>
                <p className="text-slate-500">Where you actively practice</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      updateFields({
                        state: e.target.value,
                        city: '',
                        court: ''
                      });
                    }}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    disabled={!formData.state}
                  >
                    <option value="">Select City</option>
                    {formData.state && citiesByState[formData.state]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Court *</label>
                  <select
                    value={formData.court}
                    onChange={(e) => updateField('court', e.target.value)}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    disabled={!formData.state}
                  >
                    <option value="">Select Court</option>
                    {formData.state && courtsByState[formData.state]?.map(court => (
                      <option key={court} value={court}>{court}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Office Address *</label>
                  <textarea
                    value={formData.officeAddress}
                    onChange={(e) => updateField('officeAddress', e.target.value)}
                    placeholder="e.g. Chamber 405, Delhi High Court..."
                    rows={2}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Additional Information</h2>
                <p className="text-slate-500">Finishing touches</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Education & Qualifications *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.education}
                      onChange={(e) => updateField('education', e.target.value)}
                      placeholder="LLB from Delhi University, LLM from NLS"
                      className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Languages *</label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.languages.includes(lang)
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Fee Range *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="number"
                        value={formData.feeMin}
                        onChange={(e) => updateField('feeMin', e.target.value)}
                        placeholder="Min (e.g., 3000)"
                        className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="number"
                        value={formData.feeMax}
                        onChange={(e) => updateField('feeMax', e.target.value)}
                        placeholder="Max (e.g., 10000)"
                        className="pl-10 bg-white/50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Professional Bio *</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Write a brief description about your practice..."
                    rows={4}
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 -ml-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <Button
                onClick={handleNext}
                className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl px-8"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Info Note */}
        <p className="text-center text-slate-500 text-sm mt-6">
          By submitting, you agree to our verification process.
        </p>
      </div>
    </WaveLayout>
  );
}
