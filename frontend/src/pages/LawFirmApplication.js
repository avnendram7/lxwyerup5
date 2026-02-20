import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Phone, Mail, MapPin, FileText, CheckCircle, ArrowRight, ArrowLeft, Crown, CreditCard, Check, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';
import { WaveLayout } from '../components/WaveLayout';

// Subscription Plans Data
const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small firms',
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    lawyers: 5,
    clients: 50,
    features: [
      'Up to 5 Lawyers',
      'Up to 50 Clients',
      'Basic Dashboard',
      'Email Support',
      'Case Management',
      'Client Portal'
    ],
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing firms',
    monthlyPrice: 9999,
    yearlyPrice: 99999,
    lawyers: 15,
    clients: 200,
    features: [
      'Up to 15 Lawyers',
      'Up to 200 Clients',
      'Advanced Dashboard',
      'Priority Support',
      'Case Management',
      'Client Portal',
      'Analytics & Reports',
      'Document Management'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large law firms',
    monthlyPrice: 19999,
    yearlyPrice: 199999,
    lawyers: 50,
    clients: 'Unlimited',
    features: [
      'Up to 50 Lawyers',
      'Unlimited Clients',
      'Premium Dashboard',
      '24/7 Dedicated Support',
      'Advanced Case Management',
      'Client Portal',
      'Custom Analytics',
      'Document Management',
      'API Access',
      'White-label Option'
    ],
    popular: false
  }
];

export default function LawFirmApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  // const [step, setStep] = useState(4);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const [formData, setFormData] = useState({
    firm_name: '',
    registration_number: '',
    established_year: '',
    website: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_designation: '',
    password: '',
    confirm_password: '',
    address: '',
    city: '',
    state: '',
    court: '',
    pincode: '',
    practice_areas: [],
    total_lawyers: '',
    total_staff: '',
    description: '',
    consultation_fee: '',
    achievements: '',
    // Payment
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });

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

  const practiceAreas = [
    "Criminal Law", "Family Law", "Property Law", "Corporate Law",
    "Civil Law", "Tax Law", "Labour Law", "Intellectual Property",
    "Banking Law", "Consumer Law", "Immigration Law", "Environmental Law"
  ];

  const handlePracticeAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      practice_areas: prev.practice_areas.includes(area)
        ? prev.practice_areas.filter(a => a !== area)
        : [...prev.practice_areas, area]
    }));
  };

  const getSelectedPlanDetails = () => {
    return subscriptionPlans.find(p => p.id === selectedPlan);
  };

  const getPrice = () => {
    const plan = getSelectedPlanDetails();
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getGST = () => Math.round(getPrice() * 0.18);
  const getTotal = () => getPrice() + getGST();

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.firm_name || !formData.registration_number || !formData.established_year) {
          toast.error('Please fill all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.contact_name || !formData.contact_email || !formData.contact_phone || !formData.password) {
          toast.error('Please fill all required fields');
          return false;
        }
        if (formData.password !== formData.confirm_password) {
          toast.error('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        break;
      case 3:
        if (!formData.city || !formData.state || !formData.court || formData.practice_areas.length === 0) {
          toast.error('Please fill location (including court) and select at least one practice area');
          return false;
        }
        break;
      case 4:
        if (!formData.total_lawyers || !formData.description) {
          toast.error('Please fill all required fields');
          return false;
        }
        break;
      case 5:
        // Subscription plan - no validation needed
        break;
      case 6:
        if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
          toast.error('Please fill all payment details');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const processPayment = async () => {
    if (!validateStep()) return;

    setPaymentProcessing(true);

    // Simulate payment processing (2 seconds)
    setTimeout(async () => {
      try {
        await axios.post(`${API}/lawfirms/applications`, {
          firm_name: formData.firm_name,
          registration_number: formData.registration_number,
          established_year: parseInt(formData.established_year),
          website: formData.website,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          contact_designation: formData.contact_designation,
          password: formData.password,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          court: formData.court,
          pincode: formData.pincode,
          practice_areas: formData.practice_areas,
          total_lawyers: parseInt(formData.total_lawyers),
          total_staff: parseInt(formData.total_staff) || 0,
          description: formData.description,
          consultation_fee: parseInt(formData.consultation_fee) || 0,
          achievements: formData.achievements,
          subscription_plan: selectedPlan,
          billing_cycle: billingCycle,
          subscription_amount: getTotal()
        });

        toast.success('Payment successful! Application submitted.');
        setPaymentProcessing(false);
        setStep(7); // Success step
      } catch (error) {
        setPaymentProcessing(false);
        const errorMsg = error.response?.data?.detail;
        if (typeof errorMsg === 'string') {
          toast.error(errorMsg);
        } else {
          // Fallback if backend error but likely payment simulation
          toast.error('Failed to submit application. Please try again.');
          console.error(error);
        }
      }
    }, 2000);
  };

  const steps = [
    { num: 1, title: 'Firm Details', icon: Building2 },
    { num: 2, title: 'Contact', icon: User },
    { num: 3, title: 'Location', icon: MapPin },
    { num: 4, title: 'Firm Info', icon: FileText },
    { num: 5, title: 'Plan', icon: Crown },
    { num: 6, title: 'Payment', icon: CreditCard }
  ];

  // Success Page
  if (step === 7) {
    const plan = getSelectedPlanDetails();
    return (
      <WaveLayout>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Registration Successful!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Your law firm <strong>{formData.firm_name}</strong> has been registered successfully.
            </p>

            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 text-left border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Subscription Details</h3>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-500">Plan</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-500">Billing</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Amount Paid</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{getTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/login')}
                className="flex-1 bg-slate-900 text-white rounded-xl py-6 hover:bg-slate-800"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl py-6"
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </WaveLayout>
    );
  }

  return (
    <WaveLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-3">Register Your Law Firm</h1>
          <p className="text-slate-600 dark:text-slate-400">Join India's leading legal platform</p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-4xl flex justify-center mb-8 overflow-x-auto pb-4 no-scrollbar">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center min-w-[60px] mx-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${step >= s.num
                    ? 'bg-teal-700 text-white shadow-teal-200'
                    : 'bg-white text-slate-400 border border-slate-200'
                    }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s.num ? 'text-teal-900 font-medium' : 'text-slate-500'}`}>
                    {s.title}
                  </span>
                </div>
                {idx !== steps.length - 1 && (
                  <div className={`w-8 h-1 mx-1 rounded ${step > s.num ? 'bg-teal-700' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="w-full max-w-4xl bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Firm Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Building2 className="w-8 h-8 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-800">Firm Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Firm Name *</label>
                  <Input
                    value={formData.firm_name}
                    onChange={(e) => setFormData({ ...formData, firm_name: e.target.value })}
                    placeholder="e.g., Sharma & Associates"
                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Registration Number *</label>
                  <Input
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="Bar Council Registration Number"
                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Established Year *</label>
                    <Input
                      type="number"
                      value={formData.established_year}
                      onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                      placeholder="e.g., 2010"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Website (Optional)</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourfirm.com"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Person */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-8 h-8 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-800">Contact Person</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Contact person name"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Designation</label>
                    <Input
                      value={formData.contact_designation}
                      onChange={(e) => setFormData({ ...formData, contact_designation: e.target.value })}
                      placeholder="e.g., Managing Partner"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@yourfirm.com"
                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone *</label>
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password *</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password *</label>
                    <Input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      placeholder="Re-enter password"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location & Practice */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-8 h-8 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-800">Location & Practice Areas</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Office Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full office address"
                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '', court: '' })}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                      disabled={!formData.state}
                    >
                      <option value="">Select City</option>
                      {formData.state && citiesByState[formData.state]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Court *</label>
                    <select
                      value={formData.court}
                      onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                      disabled={!formData.state}
                    >
                      <option value="">Select Court</option>
                      {formData.state && courtsByState[formData.state]?.map(court => (
                        <option key={court} value={court}>{court}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pincode</label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="110001"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Practice Areas * (Select all that apply)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {practiceAreas.map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handlePracticeAreaToggle(area)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${formData.practice_areas.includes(area)
                          ? 'bg-teal-700 text-white shadow-md shadow-teal-200'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Firm Info */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-8 h-8 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-800">Firm Information</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Lawyers *</label>
                    <Input
                      type="number"
                      value={formData.total_lawyers}
                      onChange={(e) => setFormData({ ...formData, total_lawyers: e.target.value })}
                      placeholder="Number of lawyers"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Staff</label>
                    <Input
                      type="number"
                      value={formData.total_staff}
                      onChange={(e) => setFormData({ ...formData, total_staff: e.target.value })}
                      placeholder="Support staff count"
                      className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">About Your Firm *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your firm's expertise, values, and approach..."
                    rows={4}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Consultation Fee (₹) *</label>
                  <Input
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                    placeholder="e.g., 2000"
                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Achievements (Optional)</label>
                  <textarea
                    value={formData.achievements}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    placeholder="Notable cases won, awards, recognitions..."
                    rows={3}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 5: Subscription Plans */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Crown className="w-12 h-12 text-teal-700 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-slate-800">Choose Your Plan</h2>
                  <p className="text-slate-500">Select a subscription that fits your needs</p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly'
                        ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-teal-300 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-teal-900 dark:hover:text-teal-400'
                        }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly'
                        ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-teal-300 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-teal-900 dark:hover:text-teal-400'
                        }`}
                    >
                      Yearly
                      <span className="ml-1 text-xs text-green-600 dark:text-green-400 font-bold">Save 17%</span>
                    </button>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id
                        ? 'border-teal-700 bg-teal-50/50 dark:bg-teal-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 bg-white/50 dark:bg-slate-900/50'
                        }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-teal-700 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
                      </div>

                      <div className="text-center mb-4">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          ₹{(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {selectedPlan === plan.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-6 h-6 text-teal-700" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 6: Payment */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="w-8 h-8 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-800">Payment</h2>
                </div>

                <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-slate-700">Total Amount</span>
                    <span className="text-2xl font-bold text-slate-900">₹{getTotal().toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-500">Includes 18% GST on {billingCycle} plan</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                    <Input
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      placeholder="0000 0000 0000 0000"
                      className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                      <Input
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        placeholder="MM/YY"
                        className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                      <Input
                        type="password"
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                        placeholder="123"
                        className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                    <Input
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      placeholder="Name on card"
                      className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 -ml-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {step < 6 ? (
              <Button
                onClick={handleNext}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30 dark:shadow-teal-900/40 rounded-xl px-8"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={processPayment}
                disabled={paymentProcessing}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30 dark:shadow-teal-900/40 rounded-xl px-8"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay & Submit'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </WaveLayout>
  );
}
