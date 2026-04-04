import { useState, useEffect, useRef } from "react";
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import ApplicationBackground from '../components/ApplicationBackground';
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Briefcase,
  GraduationCap,
  IndianRupee,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ArrowRight,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { API } from "../App";
import { dummyLawFirms } from "../data/lawFirmsDataExtended";
import { WaveLayout } from "../components/WaveLayout";
import GoogleSignupButton from "../components/GoogleSignupButton";
import IndianPhoneInput from "../components/IndianPhoneInput";
import OtpVerificationModal from "../components/OtpVerificationModal";

const states = ["Delhi", "Haryana", "Uttar Pradesh"];
const citiesByState = {
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  Haryana: [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kheri",
    "Kushinagar",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],
};

const courtsByState = {
  Delhi: [
    "Delhi High Court",
    "Tis Hazari Courts Complex",
    "Patiala House Courts Complex",
    "Karkardooma Courts Complex",
    "Rohini Courts Complex",
    "Dwarka Courts Complex",
    "Saket Courts Complex",
    "Rouse Avenue Courts Complex",
  ],
  Haryana: [
    "Punjab and Haryana High Court",
    "District Court Ambala",
    "District Court Bhiwani",
    "District Court Charkhi Dadri",
    "District Court Faridabad",
    "District Court Fatehabad",
    "District Court Gurugram",
    "District Court Hisar",
    "District Court Jhajjar",
    "District Court Jind",
    "District Court Kaithal",
    "District Court Karnal",
    "District Court Kurukshetra",
    "District Court Mahendragarh",
    "District Court Nuh",
    "District Court Palwal",
    "District Court Panchkula",
    "District Court Panipat",
    "District Court Rewari",
    "District Court Rohtak",
    "District Court Sirsa",
    "District Court Sonipat",
    "District Court Yamunanagar",
  ],
  "Uttar Pradesh": [
    "Allahabad High Court",
    "Allahabad High Court - Lucknow Bench",
    "District Court Agra",
    "District Court Aligarh",
    "District Court Ambedkar Nagar",
    "District Court Amethi",
    "District Court Amroha",
    "District Court Auraiya",
    "District Court Ayodhya",
    "District Court Azamgarh",
    "District Court Baghpat",
    "District Court Bahraich",
    "District Court Ballia",
    "District Court Balrampur",
    "District Court Banda",
    "District Court Barabanki",
    "District Court Bareilly",
    "District Court Basti",
    "District Court Bhadohi",
    "District Court Bijnor",
    "District Court Budaun",
    "District Court Bulandshahr",
    "District Court Chandauli",
    "District Court Chitrakoot",
    "District Court Deoria",
    "District Court Etah",
    "District Court Etawah",
    "District Court Farrukhabad",
    "District Court Fatehpur",
    "District Court Firozabad",
    "District Court Gautam Buddha Nagar",
    "District Court Ghaziabad",
    "District Court Ghazipur",
    "District Court Gonda",
    "District Court Gorakhpur",
    "District Court Hamirpur",
    "District Court Hapur",
    "District Court Hardoi",
    "District Court Hathras",
    "District Court Jalaun",
    "District Court Jaunpur",
    "District Court Jhansi",
    "District Court Kannauj",
    "District Court Kanpur Dehat",
    "District Court Kanpur Nagar",
    "District Court Kasganj",
    "District Court Kaushambi",
    "District Court Kheri",
    "District Court Kushinagar",
    "District Court Lalitpur",
    "District Court Lucknow",
    "District Court Maharajganj",
    "District Court Mahoba",
    "District Court Mainpuri",
    "District Court Mathura",
    "District Court Mau",
    "District Court Meerut",
    "District Court Mirzapur",
    "District Court Moradabad",
    "District Court Muzaffarnagar",
    "District Court Pilibhit",
    "District Court Pratapgarh",
    "District Court Prayagraj",
    "District Court Raebareli",
    "District Court Rampur",
    "District Court Saharanpur",
    "District Court Sambhal",
    "District Court Sant Kabir Nagar",
    "District Court Shahjahanpur",
    "District Court Shamli",
    "District Court Shravasti",
    "District Court Siddharthnagar",
    "District Court Sitapur",
    "District Court Sonbhadra",
    "District Court Sultanpur",
    "District Court Unnao",
    "District Court Varanasi",
  ],
};

const specializations = [
  "Criminal Law",
  "Family Law",
  "Property Law",
  "Corporate Law",
  "Civil Law",
  "Cyber Law",
  "Tax Law",
  "Labour Law",
  "Constitutional Law",
  "Consumer Law",
  "Banking Law",
  "Immigration Law",
  "Intellectual Property",
  "Medical Negligence",
  "Environmental Law",
];
const languageOptions = [
  "Hindi",
  "English",
  "Marathi",
  "Punjabi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Bengali",
  "Kannada",
  "Malayalam",
  "Urdu",
];

const urgentMatters = [
  "Bail",
  "Police Station",
  "Medical Emergency",
  "Domestic Violence",
  "Property Dispute",
  "Cyber Crime",
  "Other Urgent Matters"
];

const calculateExperience = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const diffInMonths =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const years = diffInMonths / 12;
  return Math.max(0, Math.floor(years));
};


/* ── Warm particle-network background ── */
function LegalBG() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Palette
    const nodeColor = dark ? 'rgba(59,130,246,' : 'rgba(37,99,235,';
    const lineColor = dark ? 'rgba(59,130,246,' : 'rgba(37,99,235,';
    const glowColor = dark ? 'rgba(96,165,250,' : 'rgba(147,197,253,';

    // Particles
    const N = 55;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.5 + 1.5,
      pulse: Math.random() * Math.PI * 2,
      pSpeed: 0.012 + Math.random() * 0.01,
    }));

    const CONNECT_DIST = 160;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update + draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        p.pulse += p.pSpeed;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        const alpha = 0.4 + 0.3 * Math.sin(p.pulse);
        glow.addColorStop(0, glowColor + alpha + ')');
        glow.addColorStop(0.4, nodeColor + (alpha * 0.5) + ')');
        glow.addColorStop(1, nodeColor + '0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor + (0.6 + 0.3 * Math.sin(p.pulse)) + ')';
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor + alpha + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [dark]);

  // Orb colors
  const orb1 = dark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.07)';
  const orb2 = dark ? 'rgba(30,64,175,0.09)' : 'rgba(30,64,175,0.05)';
  const orb3 = dark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)';

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

      {/* Particle network canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Warm background orbs for depth */}
      <div style={{ position: 'absolute', left: '5%', top: '10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${orb1} 0%, transparent 70%)`, filter: 'blur(90px)', animation: 'laBreath 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', right: '4%', bottom: '15%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${orb2} 0%, transparent 70%)`, filter: 'blur(80px)', animation: 'laBreath 26s ease-in-out 8s infinite' }} />
      <div style={{ position: 'absolute', left: '42%', top: '50%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${orb3} 0%, transparent 70%)`, filter: 'blur(100px)', animation: 'laBreath 16s ease-in-out 4s infinite', transform: 'translate(-50%,-50%)' }} />
    </div>
  );
}



export default function LawyerApplication() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lawFirms, setLawFirms] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    photo: "",
    lawyerType: "", // 'independent' or 'law_firm'
    lawFirmId: "",
    lawFirmName: "",
    barCouncilNumber: "",
    specialization: "",
    practiceStart: "", // Replaces hardcoded experience
    state: "",
    city: "",
    courts: [""],
    detailed_court_experience: [{ court_name: "", years: "" }],
    primary_court: "",
    education: "",
    graduationDate: "", // New field
    languages: [],
    feeMin: "",
    feeMax: "",
    charge30min: "",
    charge60min: "",
    bio: "",
    catchphrase: "",
    officeAddresses: [""],
    barCouncilPhoto: "",
    collegeDegreePhoto: "",
    officeAddressPhoto: "",
    aadharCardPhoto: "",
    aadharCardFront: "",
    aadharCardBack: "",
    panCard: "",
    applicationType: ["normal"], // 'normal', 'sos'
    sosLocations: [],
    sosMatters: [],
    sosTermsAccepted: false,
    sosType: 'sos_talk', // 'sos_talk' | 'sos_full'
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateFields = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        // 3MB limit
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(
          `File is ${sizeMB} MB. Please upload a profile photo under 3 MB.`,
        );
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        // 3MB limit
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(
          `File is ${sizeMB} MB. Please upload a document under 3 MB.`,
        );
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.password
      ) {
        toast.error("Please fill all required fields");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (formData.applicationType.length === 0) {
        toast.error("Please select an Application Type (Normal or SOS)");
        return false;
      }
      if (!formData.lawyerType) {
        toast.error(
          "Please select if you are Independent or Law Firm Associate",
        );
        return false;
      }
      if (formData.lawyerType === "law_firm" && !formData.lawFirmId) {
        toast.error("Please select your law firm");
        return false;
      }
    }
    if (stepNum === 2) {
      if (
        !formData.barCouncilNumber ||
        !formData.specialization ||
        !formData.practiceStart
      ) {
        toast.error("Please fill all required fields");
        return false;
      }
      if (!formData.barCouncilPhoto) {
        toast.error("Bar Council ID Photo is required");
        return false;
      }
      if (!formData.aadharCardFront) {
        toast.error("Aadhaar Card Front side is required");
        return false;
      }
      if (!formData.aadharCardBack) {
        toast.error("Aadhaar Card Back side is required");
        return false;
      }
      if (!formData.panCard) {
        toast.error("PAN Card is required to verify your identity");
        return false;
      }
    }
    if (stepNum === 3) {
      if (
        !formData.state ||
        !formData.city ||
        formData.detailed_court_experience.filter((c) => c.court_name && c.years).length === 0 ||
        !formData.primary_court
      ) {
        toast.error("Please select your location details");
        return false;
      }
    }
    if (stepNum === 4) {
      if (
        !formData.education ||
        !formData.graduationDate ||
        formData.languages.length === 0 ||
        !formData.bio ||
        !formData.catchphrase
      ) {
        toast.error("Please complete your additional information");
        return false;
      }
      const catchphraseWordCount = formData.catchphrase.trim().split(/\s+/).length;
      if (catchphraseWordCount > 20) {
        toast.error(`One liner must be under 20 words. Current: ${catchphraseWordCount} words.`);
        return false;
      }
      const bioWordCount = formData.bio.trim().split(/\s+/).length;
      if (bioWordCount < 100 || bioWordCount > 300) {
        toast.error(`Bio must be between 100 and 300 words. Current: ${bioWordCount} words.`);
        return false;
      }
    }
    if (stepNum === 5) {
      if (formData.sosLocations.length === 0) {
        toast.error("Please provide at least one location for SOS calls");
        return false;
      }
      if (formData.sosMatters.length === 0) {
        toast.error("Please select at least one urgent matter you can handle");
        return false;
      }
      if (!formData.sosTermsAccepted) {
        toast.error("Please accept the SOS Missed Call Penalty terms");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1) {
        // Validate phone length
        if (formData.phone.length !== 10) {
          toast.error("Please enter a valid 10-digit phone number");
          return;
        }
        setOtpModalOpen(true); // Show OTP modal before advancing
      } else {
        const totalSteps = formData.applicationType.includes("sos") ? 6 : 5; // Added Payment Step
        if (step < totalSteps) {
          setStep(step + 1);
        }
      }
    }
  };

  const handleGoogleSignup = (googleData) => {
    updateFields({
      name: googleData.name,
      email: googleData.email,
      phone: googleData.phone,
      photo: googleData.picture || "",
      password: `google_${Date.now()}`,
      confirmPassword: `google_${Date.now()}`,
    });
    // If lawyer type is already chosen, advance; otherwise stay on step 1 to pick lawyer type
    toast.success(
      "Google account connected! Please choose your professional type to continue.",
    );
  };

  const handleSubmit = async () => {
    const totalSteps = formData.applicationType.includes("sos") ? 6 : 5;
    if (!validateStep(totalSteps - 1)) return;

    // Hard gate: SOS lawyers MUST accept T&C before submission
    if (formData.applicationType.includes("sos") && !formData.sosTermsAccepted) {
      toast.error("You must accept the SOS Missed Call Penalty Agreement before submitting.");
      return;
    }
    setLoading(true);
    try {
      const isFirmLawyer = formData.lawyerType === "law_firm";

      if (isFirmLawyer) {
        // Route to firm-lawyers/applications — firm manager will approve from LawFirmDashboard
        const firmPayload = {
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          firm_id: formData.lawFirmId,
          firm_name: formData.lawFirmName,
          specialization: formData.specialization,
          experience_years: calculateExperience(formData.practiceStart),
          bar_council_number: formData.barCouncilNumber,
          education: formData.education,
          languages: formData.languages,
          bio: formData.bio,
          catchphrase: formData.catchphrase,
          // Additional APEX fields
          state: formData.state,
          city: formData.city,
          photo: formData.photo || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 90)}.jpg`,
          bar_council_photo: formData.barCouncilPhoto,
          aadhar_card_front: formData.aadharCardFront,
          aadhar_card_back: formData.aadharCardBack,
          pan_card: formData.panCard,
        };
        await axios.post(`${API}/firm-lawyers/applications`, firmPayload);
        setSubmitted(true);
        toast.success("Application sent to your law firm! The firm manager will review and approve your application.");
        return;
      }

      // Independent lawyer — normal APEX route
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        photo:
          formData.photo ||
          `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 90)}.jpg`,
        lawyer_type: formData.lawyerType,
        law_firm_id: null,
        law_firm_name: null,
        bar_council_number: formData.barCouncilNumber,
        specialization: formData.specialization,
        experience: calculateExperience(formData.practiceStart),
        practice_start_date: formData.practiceStart,
        cases_won: 0,
        state: formData.state,
        city: formData.city,
        court: formData.detailed_court_experience.filter((c) => c.court_name).map((c) => c.court_name),
        detailed_court_experience: formData.detailed_court_experience.filter((c) => c.court_name && c.years).map(c => ({ ...c, years: parseInt(c.years) || 0 })),
        primary_court: formData.primary_court,
        education: `${formData.education} (Graduated: ${formData.graduationDate})`,
        education_details: { degree: formData.education, graduation_date: formData.graduationDate },
        languages: formData.languages,
        fee_range: formData.feeMin && formData.feeMax ? `₹${formData.feeMin} - ₹${formData.feeMax}` : formData.charge30min ? `₹${formData.charge30min} - ₹${formData.charge60min || formData.charge30min * 2}` : '',
        charge_30min: formData.charge30min,
        charge_60min: formData.charge60min,
        bio: formData.bio,
        catchphrase: formData.catchphrase,
        office_address: formData.officeAddresses.filter((a) => a.trim()),
        bar_council_photo: formData.barCouncilPhoto,
        college_degree_photo: formData.collegeDegreePhoto,
        office_address_photo: formData.officeAddressPhoto,
        aadhar_card_photo: formData.aadharCardPhoto,
        aadhar_card_front: formData.aadharCardFront,
        aadhar_card_back: formData.aadharCardBack,
        pan_card: formData.panCard,
        application_type: formData.applicationType,
        sos_type: formData.sosType,
        sos_locations: formData.sosLocations,
        sos_matters: formData.sosMatters,
        sos_terms_accepted: formData.sosTermsAccepted
      };

      await axios.post(`${API}/lawyers/applications`, payload);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Submission error details:", {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config,
      });
      let errorMsg = error.message || "Failed to submit application";
      const errorData = error.response?.data?.detail;

      if (errorData) {
        if (typeof errorData === "string") {
          errorMsg = errorData;
        } else if (Array.isArray(errorData)) {
          // Handle Pydantic validation errors
          errorMsg = errorData
            .map((err) => err.msg || JSON.stringify(err))
            .join(". ");
        } else if (typeof errorData === "object") {
          errorMsg =
            errorData.msg || errorData.message || JSON.stringify(errorData);
        }
      }
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
            className="w-full max-w-md text-center p-8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/10 shadow-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('la_success_title')}
            </h2>
            <p className="text-slate-300 mb-4">
              {t('la_success_sub')}
            </p>

            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 text-left border border-blue-100 dark:border-blue-900/30">
              <p className="text-sm text-slate-200">
                <strong>Application Type:</strong>{" "}
                {formData.lawyerType === "independent"
                  ? "Independent Lawyer"
                  : "Law Firm Associate"}
              </p>
              {formData.lawyerType === "law_firm" && (
                <p className="text-sm text-slate-200 mt-1">
                  <strong>Law Firm:</strong> {formData.lawFirmName}
                </p>
              )}
              <p className="text-sm text-slate-400 mt-2">
                Once approved, you can login with{" "}
                <strong>{formData.email}</strong> to access your dashboard.
              </p>
            </div>

            <Button
              onClick={() => navigate("/")}
              className="w-full bg-slate-900 text-white rounded-xl py-6 hover:bg-slate-800"
            >
              {t('la_back_home')}
            </Button>
          </motion.div>
        </div>
      </WaveLayout>
    );
  }

  return (
    <WaveLayout>
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerified={() => {
          setOtpModalOpen(false);
          setStep(2);
        }}
        email={formData.email}
        phone={formData.phone}
      />


      {/* ── Animated dark background ── */}
      <ApplicationBackground />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 pt-24 pb-12" style={{ position: 'relative', zIndex: 1 }}>

        {/* Progress Steps */}
        <div className="w-full max-w-2xl flex md:items-center overflow-x-auto justify-start md:justify-center mb-8 px-2 hide-scrollbar">
          {Array.from({ length: formData.applicationType.includes("sos") ? 6 : 5 }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all text-sm ${
                  s === step
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : s < step
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-slate-400 border border-white/15'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < (formData.applicationType.includes("sos") ? 6 : 5) && (
                <div
                  className={`w-8 md:w-16 h-1 mx-1 md:mx-2 rounded ${
                    s < step ? 'bg-blue-600' : 'bg-white/10'
                  }`}
                />
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
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
          className="w-full max-w-2xl rounded-2xl p-4 sm:p-6 md:p-8"
        >
          {/* Step 1: Personal Info + Lawyer Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Personal Information
                </h2>
                <p className="text-slate-400">
                  Let's start with your basic details
                </p>
              </div>

              {/* Google Signup */}
              <GoogleSignupButton
                onSuccess={handleGoogleSignup}
                theme="light"
                buttonLabel="Sign up with Google"
              />

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 font-medium">
                  OR FILL MANUALLY
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Adv. Rajesh Kumar"
                      className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="advocate@example.com"
                      className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <IndianPhoneInput
                  value={formData.phone}
                  onChange={(digits) => updateField("phone", digits)}
                  label="Phone Number"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          updateField("confirmPassword", e.target.value)
                        }
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Application Type Selection — only for Independent lawyers */}
                {formData.lawyerType === "law_firm" ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-900/20 dark:border-blue-800"
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Law Firm Associate Application</p>
                        <p className="text-xs text-indigo-700 dark:text-blue-300 mt-1">Your application will be sent directly to your selected law firm. The firm manager will review, approve, and assign you work from their dashboard. You will be tagged as a <strong>Law Firm Lawyer</strong>.</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">✓ Normal &amp; SOS classification will be decided by your firm manager.</p>
                      </div>
                    </div>
                  </motion.div>
                ) : formData.lawyerType === "independent" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Application Type (Select one or both) *
                  </label>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        let newTypes = [...formData.applicationType];
                        if (newTypes.includes("normal")) {
                          if (newTypes.length > 1) newTypes = newTypes.filter(t => t !== "normal");
                        } else {
                          newTypes.push("normal");
                        }
                        updateField("applicationType", newTypes);
                      }}
                      className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${formData.applicationType.includes("normal")
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-bold"
                        : "border-white/10 hover:border-blue-200 bg-white/5 text-slate-300"
                        }`}
                    >
                      <Briefcase className={`w-5 h-5 ${formData.applicationType.includes("normal") ? "text-blue-600" : "text-slate-400"}`} />
                      Normal Lawyer
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        let newTypes = [...formData.applicationType];
                        if (newTypes.includes("sos")) {
                          if (newTypes.length > 1) newTypes = newTypes.filter(t => t !== "sos");
                        } else {
                          newTypes.push("sos");
                        }
                        updateField("applicationType", newTypes);
                      }}
                      className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${formData.applicationType.includes("sos")
                        ? "border-red-600 bg-red-50/50 dark:bg-red-900/20 text-red-900 dark:text-red-100 font-bold"
                        : "border-white/10 hover:border-red-200 bg-white/5 text-slate-300"
                        }`}
                    >
                      <Phone className={`w-5 h-5 ${formData.applicationType.includes("sos") ? "text-red-600" : "text-slate-400"}`} />
                      SOS Lawyer <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-1">Urgent</span>
                    </button>
                  </div>

                  {formData.applicationType.includes("sos") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30"
                    >
                      <h4 className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-400 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        SOS Lawyer Terms & Conditions
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        By selecting to act as an <strong>SOS Lawyer</strong>, you are committing to handling urgent legal matters (e.g., immediate bail, police station visits) at short notice.
                        <br /><br />
                        <strong>Terms & Conditions:</strong>
                      </p>
                      <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                        <li>You must be available to respond to SOS requests quickly.</li>
                        <li>Missing more than one SOS call will result in a <strong>₹250 penalty</strong> deducted from your earnings.</li>
                        <li>You will have an option to dispute penalties with a valid reason.</li>
                      </ul>
                    </motion.div>
                  )}
                </div>
                ) : null}

                {/* Lawyer Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Professional Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        updateFields({
                          lawyerType: "independent",
                          lawFirmId: "",
                          lawFirmName: "",
                        });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.lawyerType === "independent"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-white/10 hover:border-blue-200 dark:hover:border-blue-800 bg-white/5"
                        }`}
                    >
                      <User
                        className={`w-8 h-8 ${formData.lawyerType === "independent" ? "text-blue-600" : "text-slate-400"}`}
                      />
                      <span
                        className={`font-medium ${formData.lawyerType === "independent" ? "text-blue-900" : "text-slate-600"}`}
                      >
                        Independent
                      </span>
                      <span className="text-xs text-slate-500 text-center">
                        Personal practice
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField("lawyerType", "law_firm")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.lawyerType === "law_firm"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-white/10 hover:border-blue-200 dark:hover:border-blue-800 bg-white/5"
                        }`}
                    >
                      <Building2
                        className={`w-8 h-8 ${formData.lawyerType === "law_firm" ? "text-blue-600" : "text-slate-400"}`}
                      />
                      <span
                        className={`font-medium ${formData.lawyerType === "law_firm" ? "text-blue-900" : "text-slate-600"}`}
                      >
                        Associate
                      </span>
                      <span className="text-xs text-slate-500 text-center">
                        Law Firm
                      </span>
                    </button>
                  </div>
                </div>

                {/* Law Firm Selection (if law_firm type selected) */}
                <AnimatePresence>
                  {formData.lawyerType === "law_firm" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Select Your Law Firm *
                      </label>
                      <select
                        value={formData.lawFirmId}
                        onChange={(e) => {
                          const selectedFirm = lawFirms.find(
                            (f) => f.id === e.target.value,
                          );
                          updateFields({
                            lawFirmId: e.target.value,
                            lawFirmName: selectedFirm?.firm_name || "",
                          });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">Select a law firm</option>
                        {lawFirms.map((firm) => (
                          <option key={firm.id} value={firm.id}>
                            {firm.firm_name} - {firm.city}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">
                        Don't see your firm? Ask your firm admin to register
                        first.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <ProfilePhotoUpload
                   value={formData.photo}
                   onChange={(dataUrl) => updateField('photo', dataUrl)}
                   label="Profile Photo"
                   hint="This is the first thing clients see on your profile card — make it count!"
                 />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Professional Details
                </h2>
                <p className="text-slate-500">
                  Your expertise and qualifications
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Bar Council Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.barCouncilNumber}
                      onChange={(e) =>
                        updateField("barCouncilNumber", e.target.value)
                      }
                      placeholder="D/1234/2015"
                      className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Bar Council ID Photo (Max 3MB) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleDocumentUpload("barCouncilPhoto", e)
                        }
                        className="pl-10 bg-white/5 border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 text-white"
                      />
                    </div>
                    {formData.barCouncilPhoto && (
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={formData.barCouncilPhoto}
                          alt="ID Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>


                {/* ── Trust / Why-we-ask banner ── */}
                <div className="rounded-2xl p-4 border border-blue-400/30 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-900/10 flex gap-3 items-start">
                  <span className="text-2xl mt-0.5">🛡️</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Why do we need your Aadhaar?</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                      Lxwyer Up verifies every lawyer's identity to <strong>eliminate fake profiles</strong> and protect clients.
                      Your Aadhaar is used <em>only</em> for one-time KYC verification — it is never shared with clients
                      and is stored with bank-grade encryption. Verified lawyers receive a <strong>✓ Verified</strong> badge
                      that boosts trust and increases client bookings.
                    </p>
                  </div>
                </div>

                {/* ── Aadhaar Front ── */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Aadhaar Card — <span className="text-indigo-500 font-semibold">Front Side</span> (Max 3MB) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleDocumentUpload("aadharCardFront", e)}
                        className="pl-10 bg-white/5 border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 text-white"
                      />
                    </div>
                    {formData.aadharCardFront && (
                      <div className="h-14 w-20 rounded-xl overflow-hidden border-2 border-indigo-400/50 shadow-sm">
                        <img src={formData.aadharCardFront} alt="Aadhaar Front" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 pl-1">📸 Side showing your name, photo &amp; Aadhaar number</p>
                </div>

                {/* ── Aadhaar Back ── */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Aadhaar Card — <span className="text-purple-500 font-semibold">Back Side</span> (Max 3MB) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleDocumentUpload("aadharCardBack", e)}
                        className="pl-10 bg-white/5 border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400 text-white"
                      />
                    </div>
                    {formData.aadharCardBack && (
                      <div className="h-14 w-20 rounded-xl overflow-hidden border-2 border-purple-400/50 shadow-sm">
                        <img src={formData.aadharCardBack} alt="Aadhaar Back" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 pl-1">📸 Side showing your address &amp; barcode</p>
                </div>

                {/* ── PAN Card ── */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    PAN Card — <span className="text-emerald-500 font-semibold">Photo / Scan</span> (Max 3MB) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleDocumentUpload("panCard", e)}
                        className="pl-10 bg-white/5 border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-blue-100 dark:file:bg-emerald-900/30 dark:file:text-blue-400 text-white"
                      />
                    </div>
                    {formData.panCard && (
                      <div className="h-14 w-20 rounded-xl overflow-hidden border-2 border-blue-400/50 shadow-sm">
                        <img src={formData.panCard} alt="PAN Card" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 pl-1">🪪 Required for tax identity verification — stored securely & never shared</p>
                </div>


                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Specialization *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) =>
                      updateField("specialization", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Start of Practice *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="month"
                        value={formData.practiceStart}
                        onChange={(e) =>
                          updateField("practiceStart", e.target.value)
                        }
                        className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                        max={new Date().toISOString().slice(0, 7)}
                      />
                    </div>
                  </div>
                  <div className="flex items-end pb-3">
                    <p className="text-sm text-slate-500">
                      Experience:{" "}
                      <span className="font-bold text-blue-600">
                        {calculateExperience(formData.practiceStart)} Years
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Practice Location
                </h2>
                <p className="text-slate-500">Where you actively practice</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      updateFields({
                        state: e.target.value,
                        city: "",
                        courts: [""],
                      });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    disabled={!formData.state}
                  >
                    <option value="">Select City</option>
                    {formData.state &&
                      citiesByState[formData.state]?.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Detailed Court Experience *
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Add each court you practice in and your years of experience there.</p>
                  
                  {formData.detailed_court_experience.map((courtExp, index) => (
                    <div key={index} className="flex gap-2 mb-3 items-start">
                      <div className="flex-1">
                        <select
                          value={courtExp.court_name}
                          onChange={(e) => {
                            const newExp = [...formData.detailed_court_experience];
                            newExp[index].court_name = e.target.value;
                            
                            // If primary court was selected but is now removed, clear it
                            if (formData.primary_court === courtExp.court_name && e.target.value !== courtExp.court_name) {
                              setFormData(prev => ({ ...prev, detailed_court_experience: newExp, primary_court: "" }));
                            } else {
                              setFormData(prev => ({ ...prev, detailed_court_experience: newExp }));
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          disabled={!formData.state}
                        >
                          <option value="">Select Court</option>
                          <option value="Supreme Court of India">Supreme Court of India</option>
                          {formData.state && (
                            <optgroup label={`${formData.state} Courts`}>
                              {courtsByState[formData.state]?.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      
                      <div className="w-1/3">
                        <Input
                          type="number"
                          min="0"
                          max="80"
                          placeholder="Years"
                          value={courtExp.years}
                          onChange={(e) => {
                            const newExp = [...formData.detailed_court_experience];
                            newExp[index].years = e.target.value;
                            setFormData(prev => ({ ...prev, detailed_court_experience: newExp }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const removedCourt = courtExp.court_name;
                            const newExp = formData.detailed_court_experience.filter((_, i) => i !== index);
                            
                            if (formData.primary_court === removedCourt) {
                              setFormData(prev => ({ ...prev, detailed_court_experience: newExp, primary_court: "" }));
                            } else {
                              setFormData(prev => ({ ...prev, detailed_court_experience: newExp }));
                            }
                          }}
                          className="px-3 py-3 h-full border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        detailed_court_experience: [...prev.detailed_court_experience, { court_name: "", years: "" }],
                      }))
                    }
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    + Add Another Court
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Primary Court *
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Select the court where you handle the majority of your cases.</p>
                  <select
                    value={formData.primary_court}
                    onChange={(e) => updateField("primary_court", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    disabled={formData.detailed_court_experience.filter(c => c.court_name).length === 0}
                  >
                    <option value="">Select Primary Court</option>
                    {formData.detailed_court_experience
                      .filter(c => c.court_name)
                      .map((c, idx) => (
                        <option key={idx} value={c.court_name}>
                          {c.court_name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Office Addresses *
                  </label>
                  {formData.officeAddresses.map((address, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <textarea
                        value={address}
                        onChange={(e) => {
                          const newAddrs = [...formData.officeAddresses];
                          newAddrs[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            officeAddresses: newAddrs,
                          }));
                        }}
                        placeholder="e.g. Chamber 405, Delhi High Court..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newAddrs = formData.officeAddresses.filter(
                              (_, i) => i !== index,
                            );
                            setFormData((prev) => ({
                              ...prev,
                              officeAddresses: newAddrs,
                            }));
                          }}
                          className="px-3 border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        officeAddresses: [...prev.officeAddresses, ""],
                      }))
                    }
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    + Add Another Address
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Office Address Photo (Max 3MB)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleDocumentUpload("officeAddressPhoto", e)
                        }
                        className="pl-10 bg-white/5 border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 text-white"
                      />
                    </div>
                    {formData.officeAddressPhoto && (
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={formData.officeAddressPhoto}
                          alt="Office Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Additional Information
                </h2>
                <p className="text-slate-500">Finishing touches</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Education & Qualifications *
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input
                      value={formData.education}
                      onChange={(e) => updateField("education", e.target.value)}
                      placeholder="LLB from Delhi University, LLM from NLS"
                      className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    College Degree Photo (Max 3MB) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleDocumentUpload("collegeDegreePhoto", e)
                        }
                        className="pl-10 bg-white/5 border-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 text-white"
                      />
                    </div>
                    {formData.collegeDegreePhoto && (
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={formData.collegeDegreePhoto}
                          alt="Degree Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Graduation Month/Year *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="month"
                      value={formData.graduationDate}
                      onChange={(e) =>
                        updateField("graduationDate", e.target.value)
                      }
                      className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      max={new Date().toISOString().slice(0, 7)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Languages *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.languages.includes(lang)
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Affordability Advisory */}
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
                  <span className="text-xl shrink-0">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Keep Charges Affordable</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Affordable lawyers get <strong>3× more bookings</strong>. We suggest ₹300–₹800 for 30 min and ₹500–₹1500 for 1 hour for new lawyers. You can always increase as your reviews grow.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Consultation Charges <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">⏱ 30-Minute Session</p>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          value={formData.charge30min}
                          onChange={(e) => updateField("charge30min", e.target.value)}
                          placeholder="e.g. 500"
                          className="pl-9 bg-white/5 border-slate-200 dark:border-slate-700 text-white focus:border-blue-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">Suggested: ₹300 – ₹800</p>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">⏱ 1-Hour Session</p>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          value={formData.charge60min}
                          onChange={(e) => updateField("charge60min", e.target.value)}
                          placeholder="e.g. 900"
                          className="pl-9 bg-white/5 border-slate-200 dark:border-slate-700 text-white focus:border-blue-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">Suggested: ₹500 – ₹1500</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Catchphrase / One Liner *
                  </label>
                  <Input
                    value={formData.catchphrase || ""}
                    onChange={(e) => updateField("catchphrase", e.target.value)}
                    placeholder="Why should clients choose you? (Max 20 words)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 mb-1"
                  />
                  <div className="flex justify-between items-center mb-6">
                     <p className={`text-xs ${formData.catchphrase.trim().split(/\s+/).length > 20 ? "text-red-500" : "text-slate-500"}`}>
                        Word count: {formData.catchphrase.trim() ? formData.catchphrase.trim().split(/\s+/).length : 0} / 20
                     </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Professional Bio *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Write a brief description about your practice, areas of expertise, and professional background..."
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p
                      className={`text-xs ${formData.bio.trim().split(/\s+/).length < 100 || formData.bio.trim().split(/\s+/).length > 300 ? "text-red-500" : "text-slate-500"}`}
                    >
                      Word count:{" "}
                      {formData.bio.trim()
                        ? formData.bio.trim().split(/\s+/).length
                        : 0}{" "}
                      / 100-300 words
                    </p>
                    <p className="text-xs text-slate-400">
                      Describe yourself, your expertise, and your approach to
                      law.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: SOS Details */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency Response Profile</span>
                </div>
                <h2 className="text-2xl font-bold text-white">SOS Lawyer Details</h2>
                <p className="text-slate-400 text-sm mt-1">Define your SOS coverage and availability type</p>
              </div>

              <div className="space-y-5">

                {/* ── SOS Type Selection ── */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
                  <label className="block text-sm font-bold text-white mb-1">
                    SOS Service Type <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-4">Choose how you want to participate in the SOS network. You can change this anytime from your dashboard.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    {/* Talk Only */}
                    <button
                      type="button"
                      onClick={() => updateField('sosType', 'sos_talk')}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        formData.sosType === 'sos_talk'
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                          : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'
                      }`}
                    >
                      {formData.sosType === 'sos_talk' && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          formData.sosType === 'sos_talk' ? 'bg-blue-500/20' : 'bg-slate-700'
                        }`}>
                          <Phone className={`w-5 h-5 ${formData.sosType === 'sos_talk' ? 'text-blue-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${formData.sosType === 'sos_talk' ? 'text-white' : 'text-slate-300'}`}>🎙️ SOS Talk Only</p>
                          <p className="text-[10px] text-slate-500">Call / Video Consultation</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        You handle emergency consultations <strong className="text-slate-200">remotely via call or video</strong>. You will <strong className="text-slate-200">NOT</strong> be required to travel to the client physically.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-800/40">
                        <span className="text-[10px] text-blue-400 font-semibold">Client Fee: ₹300 / session</span>
                      </div>
                    </button>

                    {/* Full SOS */}
                    <button
                      type="button"
                      onClick={() => updateField('sosType', 'sos_full')}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        formData.sosType === 'sos_full'
                          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                          : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'
                      }`}
                    >
                      {formData.sosType === 'sos_full' && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          formData.sosType === 'sos_full' ? 'bg-red-500/20' : 'bg-slate-700'
                        }`}>
                          <MapPin className={`w-5 h-5 ${formData.sosType === 'sos_full' ? 'text-red-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${formData.sosType === 'sos_full' ? 'text-white' : 'text-slate-300'}`}>🚗 Full SOS Lawyer</p>
                          <p className="text-[10px] text-slate-500">Call + Physical Visit Option</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        You may be required to <strong className="text-slate-200">physically travel to the client's location</strong> within 30 minutes when requested. You can decline if unavailable.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-900/30 border border-red-800/40">
                        <span className="text-[10px] text-red-400 font-semibold">Client Fee: ₹1,100 base + ₹400/30 min extra</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── District-based Location Coverage ── */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-1">
                    <label className="block text-sm font-bold text-white">
                      Service Districts <span className="text-red-400">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      📍 Within 30 min / 15–20 km
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Select all districts you can serve. For Full SOS, these are areas you can physically reach within 30 minutes from your practice area or home.
                  </p>

                  {/* Selected Count Badge */}
                  {formData.sosLocations.length > 0 && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                        ✓ {formData.sosLocations.length} district{formData.sosLocations.length > 1 ? 's' : ''} selected
                      </span>
                      <button
                        type="button"
                        onClick={() => updateField('sosLocations', [])}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                      >Clear all</button>
                    </div>
                  )}

                  {/* Districts by State */}
                  {[
                    {
                      state: 'Delhi',
                      districts: ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi']
                    },
                    {
                      state: 'Haryana',
                      districts: ['Ambala', 'Faridabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Karnal', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar']
                    },
                    {
                      state: 'Uttar Pradesh',
                      districts: ['Agra', 'Aligarh', 'Ayodhya', 'Baghpat', 'Bulandshahr', 'Firozabad', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Hapur', 'Kanpur Nagar', 'Lucknow', 'Mathura', 'Meerut', 'Muzaffarnagar', 'Prayagraj', 'Saharanpur', 'Varanasi']
                    }
                  ].map(({ state, districts }) => (
                    <div key={state} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{state}</span>
                        <div className="flex-1 h-px bg-slate-700" />
                        <button
                          type="button"
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                          onClick={() => {
                            const allSelected = districts.every(d => formData.sosLocations.includes(d));
                            if (allSelected) {
                              updateField('sosLocations', formData.sosLocations.filter(l => !districts.includes(l)));
                            } else {
                              const merged = [...new Set([...formData.sosLocations, ...districts])];
                              updateField('sosLocations', merged);
                            }
                          }}
                        >
                          {districts.every(d => formData.sosLocations.includes(d)) ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {districts.map((district) => {
                          const selected = formData.sosLocations.includes(district);
                          return (
                            <button
                              key={district}
                              type="button"
                              onClick={() => {
                                if (selected) {
                                  updateField('sosLocations', formData.sosLocations.filter(l => l !== district));
                                } else {
                                  updateField('sosLocations', [...formData.sosLocations, district]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                selected
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-900/40'
                                  : 'bg-slate-900/60 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {selected ? '✓ ' : ''}{district}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── 30-min Reachability Warning ── */}
                {formData.sosType === 'sos_full' && (
                  <div className="bg-amber-950/40 border border-amber-700/50 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-amber-400 text-xl shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <p className="text-amber-300 font-bold text-sm mb-1">Full SOS Physical Commitment</p>
                      <p className="text-amber-400/80 text-xs leading-relaxed">
                        By selecting Full SOS, you commit to reaching any selected district within <strong className="text-amber-300">30 minutes</strong> from your practice area or home.
                        If a client requests your physical presence and you are unable to respond without a valid reason, you may face <strong className="text-amber-300">account suspension or penalties</strong>.
                        You may decline a request if genuinely unavailable — the system will auto-assign the next available lawyer.
                      </p>
                    </div>
                  </div>
                )}

                {/* Urgent Matters */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
                  <label className="block text-sm font-bold text-white mb-3">
                    Urgent Matters Handled <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {urgentMatters.map((matter) => (
                      <button
                        key={matter}
                        type="button"
                        onClick={() => {
                          const newMatters = formData.sosMatters.includes(matter)
                            ? formData.sosMatters.filter((m) => m !== matter)
                            : [...formData.sosMatters, matter];
                          updateField("sosMatters", newMatters);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          formData.sosMatters.includes(matter)
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40"
                            : "bg-slate-700/60 text-slate-300 border-slate-600/50 hover:bg-slate-700 hover:border-slate-500"
                        }`}
                      >
                        {formData.sosMatters.includes(matter) ? '✓ ' : ''}{matter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Penalty Agreement */}
                <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sosTermsAccepted}
                      onChange={(e) => updateField("sosTermsAccepted", e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-blue-500 rounded focus:ring-blue-500 shrink-0"
                    />
                    <div>
                      <span className="block text-sm font-bold text-white mb-1">
                        ⚠️ SOS Commitment Agreement <span className="text-red-400">*</span>
                      </span>
                      <span className="block text-xs text-slate-400 leading-relaxed">
                        I understand my duties as an SOS Lawyer on LxwyerUp. Unanswered requests (beyond one) without valid reason will incur a <strong className="text-slate-200">₹250 penalty</strong> on payouts.
                        {formData.sosType === 'sos_full' && (
                          <span> For Full SOS, I commit to physically reaching clients within 30 minutes when requested and accept that failure to do so may result in account review.</span>
                        )}
                        {' '}I may dispute penalties by submitting valid proof (court hearing, medical emergency, etc.).
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Payment Checkout Step */}
          {((!formData.applicationType.includes("sos") && step === 5) || (formData.applicationType.includes("sos") && step === 6)) && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                  Application Processing Fee
                </h2>
                <p className="text-slate-500 mt-2">Final step to submit your application</p>
              </div>

              {/* SOS Terms Lock Warning — shown if T&C not yet accepted */}
              {formData.applicationType.includes("sos") && !formData.sosTermsAccepted && (
                <div className="flex items-start gap-3 bg-red-950/60 border border-red-600/60 rounded-xl px-5 py-4 mb-2">
                  <span className="text-red-400 text-xl mt-0.5">🔒</span>
                  <div>
                    <p className="text-red-300 font-bold text-sm mb-1">SOS Terms & Conditions Required</p>
                    <p className="text-red-400/80 text-xs leading-relaxed">
                      You selected SOS Lawyer. You must go back to Step 5 and accept the <strong className="text-red-300">SOS Missed Call Penalty Agreement</strong> before this application can be submitted.
                    </p>
                  </div>
                </div>
              )}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">Payment Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Application Evaluation</span>
                      <span>{formData.applicationType.includes("sos") ? "₹2,542.37" : "₹1,694.92"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>GST (18%)</span>
                      <span>{formData.applicationType.includes("sos") ? "₹457.63" : "₹305.08"}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg text-white pt-3 border-t border-white/10">
                      <span>Total Secure Payment</span>
                      <span className="text-blue-600 dark:text-blue-400">{formData.applicationType.includes("sos") ? "₹3,000.00" : "₹2,000.00"}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 mb-2 shadow-sm">
                    <div className="flex gap-3">
                      <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1.5" /></div>
                      <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 text-[15px]">100% Refundable Guarantee</h4>
                        <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                          {formData.applicationType.includes("sos")
                            ? "The ₹3000 application fee establishes commitment. If selected, you will be refunded ₹2000 and receive a 2-month Apex Verified + SOS Lawyer subscription (worth ₹4,000). If not selected, you will receive a full ₹3000 refund within 48 hours."
                            : "The ₹2000 application fee establishes commitment. If selected, you will be refunded ₹1000 and receive a 2-month Apex Verified subscription (worth ₹2,500). If not selected, you will receive a full ₹2000 refund within 48 hours."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Payments are securely processed via 256-bit AES encryption.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 -ml-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {step < (formData.applicationType.includes("sos") ? 6 : 5) ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/40 rounded-xl px-8"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || (formData.applicationType.includes("sos") && !formData.sosTermsAccepted)}
                className={`text-white shadow-lg rounded-xl px-8 w-full md:w-auto text-lg h-12 transition-all ${
                  formData.applicationType.includes("sos") && !formData.sosTermsAccepted
                    ? 'bg-slate-600 cursor-not-allowed opacity-60 shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/40'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing Secure Payment...
                  </>
                ) : formData.applicationType.includes("sos") && !formData.sosTermsAccepted ? (
                  <>
                    🔒 Accept SOS Terms to Proceed
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹2500 & Submit Application
                  </>
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
