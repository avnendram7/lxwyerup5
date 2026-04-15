import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Shield, Clock, AlertCircle, CheckCircle2, Loader2,
  User, X, IndianRupee, ArrowRight, KeyRound, Car, ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { useLang } from '../context/LanguageContext';

const STATES = ['Delhi', 'Haryana', 'Uttar Pradesh'];
const CITIES = {
  'Delhi': ['Central Delhi','East Delhi','New Delhi','North Delhi','North East Delhi','North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi'],
  'Haryana': ['Ambala','Faridabad','Gurugram','Hisar','Karnal','Panipat','Rohtak','Sonipat','Yamunanagar'],
  'Uttar Pradesh': ['Agra','Aligarh','Ghaziabad','Gautam Buddha Nagar','Kanpur','Lucknow','Mathura','Meerut','Prayagraj','Varanasi'],
};

const ISSUE_TYPES_EN = {
  criminal: '⚖️ Criminal / Bail',
  family: '👨‍👩‍👧 Family / Divorce',
  civil: '🏠 Civil / Property',
  cyber: '💻 Cyber / Fraud',
  traffic: '🚗 Traffic / Accident',
  other: '📋 Other Urgent',
};

const ISSUE_TYPES_HI = {
  criminal: '⚖️ आपराधिक / ज़मानत',
  family: '👨‍👩‍👧 पारिवारिक / तलाक',
  civil: '🏠 नागरिक / संपत्ति',
  cyber: '💻 साइबर / धोखाधड़ी',
  traffic: '🚗 यातायात / दुर्घटना',
  other: '📋 अन्य आपातकाल',
};

// Input style helper
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '11px 14px',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'Outfit', sans-serif",
  transition: 'border-color 0.2s',
  appearance: 'none',
};

/* ── Active Session Panel ── */
function ActiveSession({ session, onEndSession }) {
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [currentOtp, setCurrentOtp] = useState(null);
  const [ticks, setTicks] = useState(0);

  const totalBilled = session.sos_type === 'sos_full'
    ? 1100 + ticks * 400
    : 300;

  useEffect(() => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(generated);
    setShowOtpInput(true);
  }, []);

  const handleVerifyOtp = () => {
    if (otp === currentOtp) {
      toast.success('✓ Presence verified! Session continues.');
      setOtp('');
      setShowOtpInput(false);
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentOtp(newOtp);
      if (session.sos_type === 'sos_full') setTicks(t => t + 1);
      setTimeout(() => setShowOtpInput(true), 1800000);
    } else {
      toast.error('Incorrect OTP. Session will be cancelled if not verified.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Session Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px', borderRadius: 16,
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.18)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'esPulse 1.5s infinite' }} />
        <div>
          <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 14, margin: 0 }}>Session Active</p>
          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
            {session.sos_type === 'sos_full' ? '🚗 Full SOS — Lawyer en route' : '🎙️ SOS Talk — Call in progress'}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0 }}>₹{totalBilled.toLocaleString('en-IN')}</p>
          <p style={{ color: '#475569', fontSize: 10, margin: 0 }}>
            {session.sos_type === 'sos_full' ? `Base ₹1,100 + ${ticks} × ₹400` : '₹300 flat'}
          </p>
        </div>
      </div>

      {/* Lawyer Card */}
      <div style={{
        padding: '16px 20px', borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User style={{ width: 22, height: 22, color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 15 }}>{session.lawyer_name || 'SOS Lawyer'}</h4>
          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{session.lawyer_specialization || 'Legal Expert'}</p>
        </div>
        {session.lawyer_phone && (
          <a href={`tel:+91${session.lawyer_phone}`} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            <Phone style={{ width: 14, height: 14 }} /> Call Now
          </a>
        )}
      </div>

      {/* OTP */}
      {showOtpInput && currentOtp && (
        <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <KeyRound style={{ width: 18, height: 18, color: '#60a5fa', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 4px 0' }}>OTP Presence Verification</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: 0, lineHeight: 1.6 }}>Both you and the lawyer must enter this OTP to confirm presence.</p>
            </div>
          </div>
          <div style={{ marginBottom: 14, padding: '14px', borderRadius: 12, background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: '#475569', marginBottom: 6, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Your Session OTP</p>
            <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '0.3em', color: '#60a5fa', fontFamily: 'monospace', margin: 0 }}>{currentOtp}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', textAlign: 'center', fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.3em', outline: 'none' }} maxLength={6} />
            <button onClick={handleVerifyOtp} disabled={otp.length !== 6}
              style={{ padding: '12px 20px', background: otp.length === 6 ? '#2563eb' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, color: otp.length === 6 ? '#fff' : '#475569', fontWeight: 700, fontSize: 13, cursor: otp.length === 6 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              Verify
            </button>
          </div>
        </div>
      )}

      <button onClick={onEndSession} style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        End Session & Stop Billing
      </button>
    </div>
  );
}

/* ── Main Page ── */
const EmergencyPage = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();
  const ISSUE_TYPES = lang === 'hi' ? ISSUE_TYPES_HI : ISSUE_TYPES_EN;
  
  const [sosMode, setSosMode] = useState(null);
  const [formData, setFormData] = useState({ state: '', city: '', issueType: '', name: '', phone: '' });
  const [step, setStep] = useState('select');
  const [matchedLawyer, setMatchedLawyer] = useState(null);
  const [potentialLawyers, setPotentialLawyers] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [declineCount, setDeclineCount] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  // Payment gateway state
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const cities = formData.state ? (CITIES[formData.state] || []) : [];

  const handleProceedToPayment = () => {
    if (!formData.state || !formData.phone || !formData.issueType) {
      toast.error(lang === 'hi' ? 'कृपया राज्य, फोन और समस्या का प्रकार भरें' : 'Please fill in State, Phone, and Issue Type');
      return;
    }
    const digits = formData.phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      toast.error(lang === 'hi' ? 'कृपया 10-अंकीय फ़ोन नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setStep('radar_preview');
    setTimeout(() => {
        setStep('payment');
    }, 4500);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'upi' && !upiId.trim()) { toast.error('Please enter your UPI ID'); return; }
    if (paymentMethod === 'card') {
      if (cardNum.replace(/\s/g, '').length < 16) { toast.error('Please enter a valid 16-digit card number'); return; }
      if (!cardExp || !cardCvv) { toast.error('Please fill all card details'); return; }
    }
    
    setPaymentProcessing(true);
    await new Promise(r => setTimeout(r, 2200)); // Simulate gateway
    const txnId = 'LXW' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    setTransactionId(txnId);
    setPaymentProcessing(false);
    toast.success(`Payment successful! Txn ID: ${txnId}`);
    
    setStep('searching');
    try {
      const res = await axios.post(`${API}/sos/request`, {
        user_phone: formData.phone,
        user_name: formData.name || undefined,
        user_state: formData.state,
        user_city: formData.city || formData.state,
        issue_type: formData.issueType,
        sos_type: sosMode === 'talk' ? 'sos_talk' : 'sos_full',
        transaction_id: txnId,
      });
      setSessionId(res.data.session_id);
      
      if (res.data.status === 'searching') {
        setPotentialLawyers(res.data.potential_lawyers || []);
        // The polling useEffect will take over
      } else if (res.data.status === 'matched') {
        setMatchedLawyer(res.data.lawyer);
        setTimeout(() => setStep('matched'), 1500);
      } else {
        setStep('no_lawyer');
      }
    } catch (err) {
      setStep('error');
    }
  };

  // ── Short Polling for Match ──
  useEffect(() => {
    let intervalId;
    if (step === 'searching' && sessionId) {
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`${API}/sos/status/${sessionId}`);
          if (res.data.status === 'matched') {
            setMatchedLawyer(res.data.lawyer);
            setStep('matched');
            clearInterval(intervalId);
          } else if (res.data.status === 'no_lawyer') {
             setStep('no_lawyer');
             clearInterval(intervalId);
          }
        } catch (err) {
           // Ignore network blips
        }
      }, 3000); // 3 seconds
    }
    return () => {
       if (intervalId) clearInterval(intervalId);
    };
  }, [step, sessionId]);

  const handleDecline = () => {
    setDeclineCount(c => c + 1);
    if (declineCount >= 2) {
      setStep('no_lawyer');
      toast.error('All available lawyers are currently busy. Please try again shortly.');
    } else {
      toast.info('Lawyer is busy. Searching for next available lawyer...');
      setStep('searching');
      setTimeout(() => handlePayment(), 2000); // Re-run search logic without re-charging
    }
  };

  const handleStartSession = () => {
    setActiveSession({
      session_id: sessionId,
      sos_type: sosMode === 'talk' ? 'sos_talk' : 'sos_full',
      lawyer_name: matchedLawyer?.name,
      lawyer_phone: matchedLawyer?.phone,
      lawyer_specialization: matchedLawyer?.specialization,
    });
    setStep('session');
  };

  const handleEndSession = () => {
    setStep('select');
    setSosMode(null);
    setMatchedLawyer(null);
    setPotentialLawyers([]);
    setSessionId(null);
    setActiveSession(null);
    setDeclineCount(0);
    setTransactionId(null);
    setFormData({ state: '', city: '', issueType: '', name: '', phone: '' });
    setUpiId(''); setCardNum(''); setCardExp(''); setCardCvv('');
    toast.success('Session ended. Thank you for using LxwyerUp SOS.');
  };

  const resetForm = () => {
    setStep(sosMode ? 'form' : 'select');
    setMatchedLawyer(null);
    setDeclineCount(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000000', fontFamily: "'Outfit', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes esPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes esPing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
        .es-input:focus { border-color: rgba(59,130,246,0.5) !important; }
        .es-select option { background: #0f172a; color: #fff; }
        .es-card-talk:hover { border-color: rgba(59,130,246,0.5) !important; transform: translateY(-3px); }
        .es-card-visit:hover { border-color: rgba(239,68,68,0.5) !important; transform: translateY(-3px); }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Navbar Minimal Setup */}
      <nav style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px, 4vw, 48px)', height: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Lxwyer Up Logo" className="w-8 h-8 xl:w-9 xl:h-9 object-contain rounded" style={{ mixBlendMode: 'screen' }} />
          <span className="text-base md:text-lg xl:text-[20px] font-bold tracking-tight text-white font-['Outfit'] select-none">Lxwyer Up <span style={{ color: '#f87171' }}>SOS</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{lang === 'en' ? 'हिं' : 'EN'}</button>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}><ChevronLeft style={{ width: 14, height: 14 }} /> {lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</button>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,32px)' }}>
        <AnimatePresence mode="wait">

          {/* ── Mode Selection ── */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 24 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'esPulse 1.5s infinite' }} />
                  <span style={{ color: '#fca5a5', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>{lang === 'hi' ? 'तत्काल सहायता' : 'IMMEDIATE ASSISTANCE'}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#fff', margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{lang === 'hi' ? 'हम आपकी कैसे मदद करें?' : 'How can we help you?'}</h1>
                <p style={{ color: '#64748b', fontSize: 'clamp(14px,2vw,17px)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>{lang === 'hi' ? 'तत्काल कानूनी सहायता — जिस तरह का समर्थन आपको अभी चाहिए उसे चुनें।' : 'Get immediate legal assistance — choose the type of support you need right now.'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, maxWidth: 800, margin: '0 auto 40px auto' }}>
                {/* Talk Mode */}
                <button className="es-card-talk" onClick={() => { setSosMode('talk'); setStep('form'); }} style={{ position: 'relative', padding: '36px 32px', borderRadius: 20, textAlign: 'left', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(37,99,235,0.25)', backdropFilter: 'blur(20px)', cursor: 'pointer', transition: 'all 0.25s ease', outline: 'none', overflow: 'hidden' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Phone style={{ width: 22, height: 22, color: '#60a5fa' }} /></div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 0 10px 0' }}>{lang === 'hi' ? 'SOS कॉल' : 'SOS Talk'}</h3>
                  <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.7, margin: '0 0 20px 0' }}>{lang === 'hi' ? 'फ़ोन या वीडियो कॉल के माध्यम से SOS वकील के साथ तत्काल परामर्श। अनुपलब्ध होने पर अगले वकील को स्वतः सौंपा जाता है।' : 'Immediate consultation with an SOS lawyer via phone or video call. If unavailable, next lawyer is auto-assigned.'}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                    {(lang === 'hi' ? ['तत्काल फ़ोन/वीडियो परामर्श', 'वकील अनुपलब्ध होने पर स्वतः पुनः असाइन', 'सुरक्षित एवं गोपनीय सत्र'] : ['Instant phone/video consultation', 'Auto-reassigned if lawyer unavailable', 'Secure & confidential session']).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CheckCircle2 style={{ width: 14, height: 14, color: '#60a5fa', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#94a3b8' }}>{f}</span></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContents: 'space-between' }}>
                    <div style={{ flex: 1 }}><p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>₹300</p><p style={{ fontSize: 11, color: '#475569', margin: 0 }}>{lang === 'hi' ? 'प्रति सत्र' : 'per session'}</p></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700 }}>{lang === 'hi' ? 'वकील पाएं' : 'Get Lawyer'} <ArrowRight style={{ width: 13, height: 13 }} /></div>
                  </div>
                </button>

                {/* Visit Mode */}
                <button className="es-card-visit" onClick={() => { setSosMode('visit'); setStep('form'); }} style={{ position: 'relative', padding: '36px 32px', borderRadius: 20, textAlign: 'left', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(185,28,28,0.25)', backdropFilter: 'blur(20px)', cursor: 'pointer', transition: 'all 0.25s ease', outline: 'none', overflow: 'hidden' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Car style={{ width: 22, height: 22, color: '#f87171' }} /></div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 0 10px 0' }}>{lang === 'hi' ? 'पूर्ण SOS' : 'Full SOS'}</h3>
                  <p style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.7, margin: '0 0 20px 0' }}>{lang === 'hi' ? 'सत्यापित SOS वकील 30 मिनट के अंदर आपके स्थान पर पहुंचता है। अनुपलब्ध होने पर अगले वकील को स्वतः सौंपा जाता है।' : 'A verified SOS lawyer physically travels to your location within 30 minutes. Next lawyer is auto-assigned if unavailable.'}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                    {(lang === 'hi' ? ['30 मिनट में वकील आपके पास पहुंचेगा', 'हर 30 मिनट पर OTP से उपस्थिति की पुष्टि', 'वकील की उपस्थिति के दौरान बिलिंग जारी'] : ['Lawyer reaches you within 30 min', 'OTP verified every 30 min to confirm presence', 'Billing continues while lawyer is present']).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CheckCircle2 style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#94a3b8' }}>{f}</span></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContents: 'space-between' }}>
                    <div style={{ flex: 1 }}><p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>₹1100</p><p style={{ fontSize: 11, color: '#475569', margin: 0 }}>{lang === 'hi' ? 'आधार + अतिरिक्त/30 मिनट' : 'base + extra/30 min'}</p></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700 }}>{lang === 'hi' ? 'विज़िट अनुरोध' : 'Request Visit'} <ArrowRight style={{ width: 13, height: 13 }} /></div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Form Step ── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ maxWidth: 520, margin: '0 auto' }}>
              <button onClick={() => { setStep('select'); setSosMode(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}><ChevronLeft style={{ width: 15, height: 15 }} /> {lang === 'hi' ? 'मोड बदलें' : 'Change mode'}</button>
              
              <div style={{ background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(24px,4vw,36px)', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 6px 0' }}>{lang === 'hi' ? 'आपका विवरण' : 'Your Details'}</h3>
                <p style={{ color: '#475569', fontSize: 13.5, margin: '0 0 28px 0' }}>{lang === 'hi' ? 'हम आपके क्षेत्र के सबसे अच्छे उपलब्ध SOS वकील से आपका मिलान करेंगे।' : "We'll match you with the best available SOS lawyer in your area."}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'राज्य *' : 'State *'}</label>
                      <select className="es-select" value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value, city: '' }))} style={inputStyle}>
                        <option value="">{lang === 'hi' ? 'राज्य चुनें' : 'Select state'}</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'जिला' : 'District'}</label>
                      <select className="es-select" value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} disabled={!formData.state} style={{ ...inputStyle, opacity: !formData.state ? 0.4 : 1 }}>
                        <option value="">{lang === 'hi' ? 'जिला चुनें' : 'Select district'}</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'कानूनी समस्या *' : 'Legal Issue *'}</label>
                    <select className="es-select" value={formData.issueType} onChange={e => setFormData(f => ({ ...f, issueType: e.target.value }))} style={inputStyle}>
                      <option value="">{lang === 'hi' ? 'समस्या का प्रकार चुनें' : 'Select issue type'}</option>
                      {Object.entries(ISSUE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'आपका नाम' : 'Your Name'}</label>
                    <input className="es-input" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder={lang === 'hi' ? 'राजेश कुमार' : 'Rajesh Kumar'} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'फ़ोन नंबर (केवल 10 अंक) *' : 'Phone Number (10 digits) *'}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ ...inputStyle, width: 'auto', flexShrink: 0, color: '#64748b' }}>+91</div>
                      <input className="es-input" value={formData.phone} onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(f => ({ ...f, phone: digits }));
                      }} placeholder="9876543210" type="tel" inputMode="numeric" maxLength={10} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button onClick={handleProceedToPayment} disabled={formData.phone.length !== 10} style={{
                    width: '100%', padding: '14px', background: formData.phone.length === 10 ? (sosMode === 'talk' ? '#2563eb' : '#dc2626') : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 12, color: formData.phone.length === 10 ? '#fff' : '#475569', fontSize: 15, fontWeight: 700, cursor: formData.phone.length === 10 ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', marginTop: 10
                  }}>
                    <IndianRupee style={{ width: 18, height: 18 }} /> {lang === 'hi' ? 'भुगतान पर जाएं' : 'Proceed to Payment'}
                  </button>

                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle2 style={{ width: 15, height: 15, color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.7 }}>
                      <strong style={{ color: '#4ade80' }}>{lang === 'hi' ? '100% रिफंड गारंटी:' : '100% Refund Guarantee:'}</strong>{' '}
                      {lang === 'hi' ? 'यदि कोई वकील नहीं मिला, तो 24 घंटे में पूरा पैसा वापस मिलेगा।' : 'If no lawyer is found, your full payment will be refunded within 24 hours.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Radar Preview (Pre-Payment) ── */}
          {step === 'radar_preview' && (
            <motion.div key="radar_preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 32 }}>
              <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', zIndex: 10, width: 112, height: 112, borderRadius: '50%', background: sosMode === 'talk' ? 'rgba(37,99,235,0.12)' : 'rgba(185,28,28,0.12)', border: `2px solid ${sosMode === 'talk' ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sosMode === 'talk' ? <Phone style={{ width: 44, height: 44, color: '#60a5fa' }} /> : <Car style={{ width: 44, height: 44, color: '#f87171' }} />}
                </div>
                {/* Ping rings */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 112, height: 112, borderRadius: '50%', border: `2px solid ${sosMode === 'talk' ? 'rgba(96,165,250,0.3)' : 'rgba(248,113,113,0.3)'}`, animation: 'esPing 1.5s ease-out infinite' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 112, height: 112, borderRadius: '50%', border: `2px solid ${sosMode === 'talk' ? 'rgba(96,165,250,0.15)' : 'rgba(248,113,113,0.15)'}`, animation: 'esPing 1.5s ease-out infinite 0.75s' }} />

                {/* Simulated lawyers appearing */}
                {[0, 1, 2].map((idx) => (
                     <motion.div 
                       key={idx}
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 1.0 + (idx * 0.8) }}
                       style={{ 
                         position: 'absolute', 
                         width: 44, height: 44, borderRadius: '50%', 
                         background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', 
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         border: '2px solid rgba(255,255,255,0.2)',
                         transform: `rotate(${(idx / 3) * 360}deg) translateY(-${80 + idx*20}px) rotate(-${(idx / 3) * 360}deg)`,
                         zIndex: 20
                       }}
                     >
                       <User style={{ width: 20, height: 20, color: '#fff' }} />
                     </motion.div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 10px 0' }}>{lang === 'hi' ? `${formData.state} में वकीलों की खोज की जा रही है...` : `Searching for Lawyers in ${formData.state}...`}</h3>
                <p style={{ color: '#64748b', fontSize: 14 }}>{lang === 'hi' ? 'नेटवर्क स्कैन किया जा रहा है...' : 'Scanning the LxwyerUp network...'}</p>
              </div>
            </motion.div>
          )}

          {/* ── Payment Step ── */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ maxWidth: 520, margin: '0 auto' }}>
              <button onClick={() => setStep('form')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: 24 }}><ChevronLeft style={{ width: 15, height: 15 }} /> {lang === 'hi' ? 'वापस जाएं' : 'Back'}</button>
              
              <div style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(20px,4vw,32px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContents: 'space-between', marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(34,197,94,0.15)', borderRadius: '20px', marginBottom: '8px' }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#4ade80' }} />
                      <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>Lawyers Found Nearby</span>
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 0 4px 0' }}>{lang === 'hi' ? 'सुरक्षित भुगतान' : 'Secure Payment'}</h3>
                    <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>{lang === 'hi' ? 'आपकी जानकारी एन्क्रिप्टेड है' : 'Pay to instantly connect with an available lawyer'}</p>
                  </div>
                  <div style={{ padding: '10px 16px', borderRadius: 12, textAlign: 'center', background: sosMode === 'talk' ? 'rgba(37,99,235,0.15)' : 'rgba(185,28,28,0.15)' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>₹{sosMode === 'talk' ? '300' : '1,100'}</p>
                    <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>to pay</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {['upi', 'card', 'netbanking'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: paymentMethod === m ? '#2563eb' : 'rgba(255,255,255,0.08)', color: paymentMethod === m ? '#fff' : '#94a3b8' }}>
                      {m === 'upi' ? 'UPI' : m === 'card' ? (lang === 'hi' ? 'कार्ड' : 'Card') : 'Net Banking'}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'upi' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>UPI ID</label>
                    <input className="es-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@ybl" style={inputStyle} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                        <button key={app} onClick={() => setUpiId(`${formData.phone}@${app.toLowerCase()}`)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>{app}</button>
                      ))}
                    </div>
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'कार्ड नंबर' : 'Card Number'}</label>
                      <input className="es-input" value={cardNum} onChange={e => { const r = e.target.value.replace(/\D/g, '').slice(0, 16); setCardNum(r.match(/.{1,4}/g)?.join(' ') || r); }} placeholder="1234 5678 9012 3456" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{lang === 'hi' ? 'एक्सपायरी' : 'Expiry'}</label>
                        <input className="es-input" value={cardExp} onChange={e => { const r = e.target.value.replace(/\D/g, '').slice(0, 4); setCardExp(r.length > 2 ? r.slice(0, 2) + '/' + r.slice(2) : r); }} placeholder="MM/YY" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>CVV</label>
                        <input className="es-input" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="•••" type="password" maxLength={3} style={{ ...inputStyle, letterSpacing: '0.2em' }} />
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handlePayment} disabled={paymentProcessing} style={{ width: '100%', padding: '15px', background: paymentProcessing ? 'rgba(59,130,246,0.3)' : '#2563eb', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: paymentProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                  {paymentProcessing ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} /> Processing Payment...</> : <><Shield style={{ width: 18, height: 18 }} /> Pay ₹{sosMode === 'talk' ? '300' : '1,100'} Securely</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Searching / Processing ── */}
          {step === 'searching' && (
            <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 32 }}>
              <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* Potential Lawyers Radar Overlay */}
                {potentialLawyers.map((lw, idx) => {
                   const angle = (idx / Math.max(potentialLawyers.length, 1)) * 360;
                   const radius = 80 + (idx % 3) * 20; // 80 to 120px radius
                   return (
                     <motion.div 
                       key={lw.id}
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: idx * 0.15 }}
                       style={{ 
                         position: 'absolute', 
                         width: 44, height: 44, borderRadius: '50%', 
                         background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', 
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         border: '2px solid rgba(255,255,255,0.2)',
                         transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
                         zIndex: 20
                       }}
                       title={lw.name}
                     >
                       <User style={{ width: 20, height: 20, color: '#fff' }} />
                     </motion.div>
                   )
                })}

                <div style={{ position: 'relative', zIndex: 10, width: 112, height: 112, borderRadius: '50%', background: sosMode === 'talk' ? 'rgba(37,99,235,0.12)' : 'rgba(185,28,28,0.12)', border: `2px solid ${sosMode === 'talk' ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sosMode === 'talk' ? <Phone style={{ width: 44, height: 44, color: '#60a5fa' }} /> : <Car style={{ width: 44, height: 44, color: '#f87171' }} />}
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 112, height: 112, borderRadius: '50%', border: `2px solid ${sosMode === 'talk' ? 'rgba(96,165,250,0.3)' : 'rgba(248,113,113,0.3)'}`, animation: 'esPing 1.5s ease-out infinite' }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 10px 0' }}>{declineCount > 0 ? 'Finding Next Available Lawyer...' : 'Broadcasting SOS to Lawyers...'}</h3>
                <p style={{ color: '#64748b', fontSize: 14 }}>Matching you with a verified lawyer in {formData.state}...</p>
                <div style={{ marginTop: 12, padding: '8px 16px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', borderRadius: 8, fontSize: 12, display: 'inline-block' }}>Payment Confirmed (Txn: {transactionId})</div>
              </div>
            </motion.div>
          )}

          {/* ── Matched ── */}
          {step === 'matched' && matchedLawyer && (
            <motion.div key="matched" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 480, margin: '0 auto', background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', background: 'rgba(34,197,94,0.1)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContents: 'center' }}><CheckCircle2 style={{ width: 20, height: 20, color: '#fff' }} /></div>
                <div><p style={{ color: '#4ade80', fontWeight: 800, fontSize: 16, margin: 0 }}>{lang === 'hi' ? 'वकील मिल गया!' : 'Lawyer Found!'}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User style={{ width: 28, height: 28, color: '#fff' }} /></div>
                <div><h4 style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: '0 0 4px 0' }}>{matchedLawyer.name || 'SOS Assigned Lawyer'}</h4><p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{matchedLawyer.specialization || 'General Legal Expert'}</p></div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <button onClick={handleStartSession} style={{ flex: 1, padding: '14px', background: '#22c55e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContents: 'center', gap: 8 }}><Phone style={{ width: 18, height: 18 }} /> {sosMode === 'talk' ? 'Start Call' : 'Begin Session'}</button>
                <button onClick={handleDecline} style={{ width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#cbd5e1', cursor: 'pointer', flexShrink: 0 }} title="Ignore & find next"><RefreshCw style={{ width: 20, height: 20 }} /></button>
              </div>
            </motion.div>
          )}

          {/* ── Active Session ── */}
          {step === 'session' && activeSession && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 500, margin: '0 auto' }}>
              <ActiveSession session={activeSession} onEndSession={handleEndSession} />
            </motion.div>
          )}

          {/* ── No Lawyer / Error ── */}
          {(step === 'no_lawyer' || step === 'error') && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center', padding: '40px', background: 'rgba(10,15,30,0.8)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              <AlertCircle style={{ width: 64, height: 64, color: '#f59e0b', margin: '0 auto 20px auto' }} />
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 12 }}>{step === 'no_lawyer' ? 'All lawyers are currently busy' : 'Something went wrong'}</h3>
              {step === 'no_lawyer' ? (
                <>
                  <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>We couldn't assign a lawyer in {formData.state} at this exact moment. Please try again in a few minutes.</p>
                  <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: 10, color: '#4ade80', fontSize: 13, marginBottom: 24 }}>Refund processed. Your transaction ({transactionId}) will be reversed within 24 hours.</div>
                </>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>There was a connection error. Your payment was not processed.</p>
              )}
              <button onClick={resetForm} style={{ padding: '12px 24px', background: '#2563eb', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Try Again</button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default EmergencyPage;
