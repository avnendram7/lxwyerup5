import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavbarWave } from '../components/NavbarWave';
import {
  MessageSquare, FileText, Calendar, Bell, Shield,
  BarChart, Users, Clock, Siren, Fingerprint,
  Scale, Star, ArrowRight, Lock, CheckCircle,
  Award, Search, BadgeCheck, ClipboardCheck, Microscope, TrendingUp
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const TEXT = {
  en: {
    heroBadge: 'Trusted Legal Platform · India',
    heroTitle1: 'Platform Features',
    heroTitle2: 'Built for Legal Excellence',
    heroSub: "A comprehensive suite of tools crafted for India's legal ecosystem — connecting citizens, lawyers, and institutions with precision and trust.",
    querySolved: 'Queries Solved',
    verifiedLawyers: 'Verified Lawyers',
    satisfactionRate: 'Satisfaction Rate',
    cap_sub: 'Platform Capabilities',
    cap_title: 'Everything in one place',
    cap_desc: 'A complete legal operating system — for individuals, lawyers, and firms.',
    apex_title_1: 'Not every lawyer makes it ',
    apex_title_2: 'through APEX.',
    apex_desc_1: 'APEX is our proprietary, multi-stage verification framework — the most rigorous evaluation system in Indian legal tech today. Every lawyer on Lxwyer Up has been put through credential checks, peer reviews, conduct audits, and AI-driven performance scoring before they ever appear in your results.',
    apex_quote: '"We do not promise volume. We promise precision. The right lawyer for your exact situation — verified, accountable, and held to the highest standard we know."',
    apex_promise: "Our APEX Promise — if a match doesn't serve you, we find you a better one. No compromise, no shortcuts.",
    pipeline: 'The 6-Stage APEX Verification Pipeline',
    cta_title: 'Ready to Get Started?',
    cta_sub: "Join thousands of clients and lawyers already using LxwyerUp to navigate India's legal system with confidence.",
    cta_consult: 'Consult Now',
    cta_contact: 'Contact Us',
    forPre: 'For ',
  },
  hi: {
    heroBadge: 'विश्वसनीय कानूनी मंच · भारत',
    heroTitle1: 'प्लेटफ़ॉर्म की विशेषताएं',
    heroTitle2: 'कानूनी उत्कृष्टता के लिए निर्मित',
    heroSub: "भारत के कानूनी पारिस्थितिकी तंत्र के लिए तैयार किए गए उपकरणों का एक व्यापक सूट - नागरिकों, वकीलों और संस्थानों को सटीकता और विश्वास के साथ जोड़ता है।",
    querySolved: 'समस्याएं हल की गईं',
    verifiedLawyers: 'सत्यापित वकील',
    satisfactionRate: 'संतुष्टि दर',
    cap_sub: 'प्लेटफॉर्म क्षमताएं',
    cap_title: 'सब कुछ एक ही स्थान पर',
    cap_desc: 'एक संपूर्ण कानूनी ऑपरेटिंग सिस्टम — व्यक्तियों, वकीलों और फर्मों के लिए।',
    apex_title_1: 'हर वकील पास नहीं होता ',
    apex_title_2: 'APEX के माध्यम से।',
    apex_desc_1: 'APEX हमारा मालिकाना, बहु-चरणीय सत्यापन ढांचा है — जो आज भारतीय कानूनी तकनीक में सबसे कठोर मूल्यांकन प्रणाली है। Lxwyer Up पर प्रत्येक वकील को आपके परिणामों में प्रदर्शित होने से पहले क्रेडेंशियल जांच, सहकर्मी समीक्षा, आचरण ऑडिट और AI-संचालित प्रदर्शन स्कोरिंग से गुज़रना पड़ता है।',
    apex_quote: '"हम मात्रा का वादा नहीं करते। हम सटीकता का वादा करते हैं। आपकी सटीक स्थिति के लिए सही वकील — सत्यापित, जवाबदेह, और उच्चतम मानक पर खरा।"',
    apex_promise: "हमारा APEX वादा - यदि कोई मैच आप की सेवा नहीं कर पाता, तो हम आपको एक बेहतर खोज कर देंगे। कोई समझौता नहीं, कोई शॉर्टकट नहीं।",
    pipeline: '6-चरणीय APEX सत्यापन पाइपलाइन',
    cta_title: 'क्या आप शुरू करने के लिए तैयार हैं?',
    cta_sub: "लीगल सिस्टम को आत्मविश्वास के साथ नेविगेट करने के लिए LxwyerUp का उपयोग कर रहे हजारों ग्राहकों और वकीलों से जुड़ें।",
    cta_consult: 'अभी परामर्श लें',
    cta_contact: 'संपर्क करें',
    forPre: 'के लिए ',
  }
};


const cardEnterCSS = `
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes iconPulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--glow, rgba(99,102,241,.35)); }
  50%       { box-shadow: 0 0 0 12px transparent; }
}
@keyframes floatDot {
  0%, 100% { transform: translateY(0) scale(1); opacity:.4; }
  50%       { transform: translateY(-8px) scale(1.2); opacity:.9; }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('fc-enter-css')) {
  const s = document.createElement('style');
  s.id = 'fc-enter-css';
  s.textContent = cardEnterCSS;
  document.head.appendChild(s);
}

const FEATURES = [
  {
    icon: Siren,
    title: 'SOS Legal Support',
    description: 'Provides immediate access to verified lawyers during urgent legal situations. With one click, connect quickly, receive timely guidance, and understand your next steps — reducing panic and helping you respond confidently.',
    tag: 'Clients',
    color: 'red',
    badge: 'Live Now',
  },
  {
    icon: Fingerprint,
    title: 'Lxwyer Up Signature',
    description: 'Lxwyer Up Signature for users provides access to highly verified, premium lawyers with proven expertise and strong track records. It ensures trusted, high-quality legal consultation for complex or high-stakes matters, offering users greater confidence, reliability, and professional support when precision and experience matter most.',
    tag: 'Both',
    color: 'blue',
    badge: 'Coming Soon',
  },
  {
    icon: MessageSquare,
    title: 'AI Legal Chatbot',
    description: 'Get instant, structured answers to your legal questions in plain language. Powered by Gemini — available 24/7.',
    tag: 'Both',
    color: 'blue',
  },
  {
    icon: Calendar,
    title: 'Consultation Booking',
    description: 'Book video or in-person consultations with verified lawyers in seconds. Manage all appointments in one calendar.',
    tag: 'Clients',
    color: 'blue',
  },
  {
    icon: FileText,
    title: 'Case Tracking',
    description: 'Monitor your case status, stages, and key deadlines in real-time. Never miss an update or hearing.',
    tag: 'Clients',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Document Management',
    description: 'Securely upload, organise, and share legal documents. Everything encrypted and accessible from any device.',
    tag: 'Both',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Lawyers can manage multiple clients, track case progress, and maintain professional communication — all in one place.',
    tag: 'Lawyers',
    color: 'blue',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Automated alerts for case updates, upcoming hearings, document requests, and important deadlines.',
    tag: 'Both',
    color: 'blue',
  },
  {
    icon: BarChart,
    title: 'Case Analytics',
    description: 'Insights into case progress, success patterns, and AI-powered recommendations for your next step.',
    tag: 'Both',
    color: 'blue',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Your dashboard, documents, and AI assistant are always on — from any device, at any hour.',
    tag: 'Both',
    color: 'blue',
  },
];

const FEATURES_HI = [
  { icon: Siren, title: 'SOS कानूनी सहायता', description: 'तत्काल कानूनी स्थितियों के दौरान सत्यापित वकीलों तक तत्काल पहुंच प्रदान करता है। एक क्लिक के साथ, जल्दी से जुड़ें, समय पर मार्गदर्शन प्राप्त करें, और अपने अगले कदम को समझें।', tag: 'Clients', color: 'red', badge: 'अभी लाइव', },
  { icon: Fingerprint, title: 'Lxwyer Up सिग्नेचर', description: 'लॉयर अप सिग्नेचर उपयोगकर्ताओं को प्रमाणित विशेषज्ञता और मजबूत ट्रैक रिकॉर्ड वाले अत्यधिक सत्यापित, प्रीमियम वकीलों तक पहुंच प्रदान करता है।', tag: 'Both', color: 'blue', badge: 'जल्द आ रहा है', },
  { icon: MessageSquare, title: 'AI कानूनी चैटबॉट', description: 'साधारण भाषा में अपने कानूनी सवालों के तुरंत, संरचित उत्तर पाएं। जेमिनी द्वारा संचालित — 24/7 उपलब्ध।', tag: 'Both', color: 'blue', },
  { icon: Calendar, title: 'परामर्श बुकिंग', description: 'सेकंडों में सत्यापित वकीलों के साथ वीडियो या व्यक्तिगत परामर्श बुक करें। सभी नियुक्तियों को एक कैलेंडर में प्रबंधित करें।', tag: 'Clients', color: 'blue', },
  { icon: FileText, title: 'केस ट्रैकिंग', description: 'रीयल-टाइम में अपने केस की स्थिति, चरणों और महत्वपूर्ण समय सीमाओं की निगरानी करें। कभी भी कोई अपडेट या सुनवाई न चूकें।', tag: 'Clients', color: 'blue', },
  { icon: Shield, title: 'दस्तावेज़ प्रबंधन', description: 'कानूनी दस्तावेज़ सुरक्षित रूप से अपलोड करें, व्यवस्थित करें और साझा करें। सब कुछ एन्क्रिप्टेड और किसी भी डिवाइस से सुलभ है।', tag: 'Both', color: 'blue', },
  { icon: Users, title: 'क्लाइंट प्रबंधन', description: 'वकील एक ही स्थान पर कई ग्राहकों को प्रबंधित कर सकते हैं, केस की प्रगति को ट्रैक कर सकते हैं, और पेशेवर संवाद बनाए रख सकते हैं।', tag: 'Lawyers', color: 'blue', },
  { icon: Bell, title: 'स्मार्ट सूचनाएं', description: 'केस अपडेट, आगामी सुनवाई, दस्तावेज़ अनुरोध और महत्वपूर्ण समय सीमाओं के लिए स्वचालित अलर्ट।', tag: 'Both', color: 'blue', },
  { icon: BarChart, title: 'केस एनालिटिक्स', description: 'केस की प्रगति, सफलता पैटर्न और आपके अगले कदम के लिए AI-संचालित सिफारिशों में अंतर्दृष्टि।', tag: 'Both', color: 'blue', },
  { icon: Clock, title: '24/7 उपलब्धता', description: 'आपका डैशबोर्ड, दस्तावेज़ और AI सहायक हमेशा चालू रहते हैं — किसी भी डिवाइस से, किसी भी समय।', tag: 'Both', color: 'blue', },
];

const COLOR = {
  red: { border: 'border-red-500/20', lightHeader: 'bg-red-50', darkHeader: 'bg-red-950', iconBg: 'bg-red-500/15 border-red-500/25', icon: 'text-red-500 dark:text-red-400', tag: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20', glow: 'bg-red-500/15', ring: 'hover:ring-red-500/30 hover:border-red-500/40', shadow: 'hover:shadow-red-500/10' },
  purple: { border: 'border-purple-500/20', lightHeader: 'bg-purple-50', darkHeader: 'bg-purple-950', iconBg: 'bg-purple-500/15 border-purple-500/25', icon: 'text-purple-500 dark:text-purple-400', tag: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20', glow: 'bg-purple-500/15', ring: 'hover:ring-purple-500/30 hover:border-purple-500/40', shadow: 'hover:shadow-purple-500/10' },
  blue: { border: 'border-blue-500/20', lightHeader: 'bg-blue-50', darkHeader: 'bg-blue-950', iconBg: 'bg-blue-500/15 border-blue-500/25', icon: 'text-blue-500 dark:text-blue-400', tag: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20', glow: 'bg-blue-500/15', ring: 'hover:ring-blue-500/30 hover:border-blue-500/40', shadow: 'hover:shadow-blue-500/10' },
  violet: { border: 'border-violet-500/20', lightHeader: 'bg-violet-50', darkHeader: 'bg-violet-950', iconBg: 'bg-violet-500/15 border-violet-500/25', icon: 'text-violet-500 dark:text-violet-400', tag: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20', glow: 'bg-violet-500/15', ring: 'hover:ring-violet-500/30 hover:border-violet-500/40', shadow: 'hover:shadow-violet-500/10' },
  cyan: { border: 'border-cyan-500/20', lightHeader: 'bg-cyan-50', darkHeader: 'bg-cyan-950', iconBg: 'bg-cyan-500/15 border-cyan-500/25', icon: 'text-cyan-600 dark:text-cyan-400', tag: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20', glow: 'bg-cyan-500/15', ring: 'hover:ring-cyan-500/30 hover:border-cyan-500/40', shadow: 'hover:shadow-cyan-500/10' },
  emerald: { border: 'border-emerald-500/20', lightHeader: 'bg-emerald-50', darkHeader: 'bg-emerald-950', iconBg: 'bg-emerald-500/15 border-emerald-500/25', icon: 'text-emerald-600 dark:text-emerald-400', tag: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20', glow: 'bg-emerald-500/15', ring: 'hover:ring-emerald-500/30 hover:border-emerald-500/40', shadow: 'hover:shadow-emerald-500/10' },
  amber: { border: 'border-amber-500/20', lightHeader: 'bg-amber-50', darkHeader: 'bg-amber-950', iconBg: 'bg-amber-500/15 border-amber-500/25', icon: 'text-amber-600 dark:text-amber-400', tag: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20', glow: 'bg-amber-500/15', ring: 'hover:ring-amber-500/30 hover:border-amber-500/40', shadow: 'hover:shadow-amber-500/10' },
  rose: { border: 'border-rose-500/20', lightHeader: 'bg-rose-50', darkHeader: 'bg-rose-950', iconBg: 'bg-rose-500/15 border-rose-500/25', icon: 'text-rose-500 dark:text-rose-400', tag: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20', glow: 'bg-rose-500/15', ring: 'hover:ring-rose-500/30 hover:border-rose-500/40', shadow: 'hover:shadow-rose-500/10' },
  indigo: { border: 'border-indigo-500/20', lightHeader: 'bg-indigo-50', darkHeader: 'bg-indigo-950', iconBg: 'bg-indigo-500/15 border-indigo-500/25', icon: 'text-indigo-500 dark:text-indigo-400', tag: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20', glow: 'bg-indigo-500/15', ring: 'hover:ring-indigo-500/30 hover:border-indigo-500/40', shadow: 'hover:shadow-indigo-500/10' },
  teal: { border: 'border-teal-500/20', lightHeader: 'bg-teal-50', darkHeader: 'bg-teal-950', iconBg: 'bg-teal-500/15 border-teal-500/25', icon: 'text-teal-600 dark:text-teal-400', tag: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20', glow: 'bg-teal-500/15', ring: 'hover:ring-teal-500/30 hover:border-teal-500/40', shadow: 'hover:shadow-teal-500/10' },
  gold: { border: 'border-yellow-500/30', lightHeader: 'bg-yellow-50', darkHeader: 'bg-yellow-950', iconBg: 'bg-yellow-500/15 border-yellow-500/25', icon: 'text-yellow-600 dark:text-yellow-400', tag: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20', glow: 'bg-yellow-500/15', ring: 'hover:ring-yellow-500/30 hover:border-yellow-500/40', shadow: 'hover:shadow-yellow-500/10' },
};

const GLOW_VAR = {
  red: 'rgba(239,68,68,.35)',
  purple: 'rgba(168,85,247,.35)',
  blue: 'rgba(59,130,246,.35)',
  violet: 'rgba(139,92,246,.35)',
  cyan: 'rgba(6,182,212,.35)',
  emerald: 'rgba(16,185,129,.35)',
  amber: 'rgba(245,158,11,.35)',
  rose: 'rgba(244,63,94,.35)',
  indigo: 'rgba(99,102,241,.35)',
  teal: 'rgba(20,184,166,.35)',
};

/* ── Animated trust stat (each is its own component to satisfy hooks rules) ── */
function StatItem({ target, suffix, label }) {
  const [count, setCount] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / (1800 / 16)));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <CheckCircle size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
      <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
        {count.toLocaleString('en-IN')}{suffix}
      </span>
      <span>{label}</span>
    </div>
  );
}

function TrustCounters() {
  const { lang } = useLang();
  const d = TEXT[lang] || TEXT.en;
  return (
    <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
      <StatItem target={10000} suffix="+" label={d.querySolved} />
      <StatItem target={1000} suffix="+" label={d.verifiedLawyers} />
      <StatItem target={98} suffix="%" label={d.satisfactionRate} />
    </div>
  );
}


const DOT_COLORS = {
  red: 'bg-red-400', purple: 'bg-purple-400', blue: 'bg-blue-400', violet: 'bg-violet-400',
  cyan: 'bg-cyan-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400',
  rose: 'bg-rose-400', indigo: 'bg-indigo-400', teal: 'bg-teal-400',
};

function FeatureCard({ feature, index }) {
  const c = COLOR[feature.color] || COLOR.blue;
  const glow = GLOW_VAR[feature.color] || GLOW_VAR.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border ${c.border} dark:border-white/5 bg-white dark:bg-[#161616] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${c.shadow} ring-1 ring-transparent ${c.ring}`}
      style={{
        '--glow': glow,
        animationName: 'cardEnter',
        animationDuration: '0.55s',
        animationTimingFunction: 'cubic-bezier(.22,.68,0,1.2)',
        animationFillMode: 'both',
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* ── Visual header panel ── */}
      <div className={`relative h-44 flex items-center justify-center overflow-hidden ${c.lightHeader} dark:bg-[#111]`}>
        {/* Large blurred glow behind icon */}
        <div
          className={`absolute w-32 h-32 ${c.glow} rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
        />


        {/* Badge pills */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
          {feature.badge && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.tag} animate-pulse`}>
              {feature.badge}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${c.tag}`}>
            {lang === 'hi' ? TEXT.hi.forPre : TEXT.en.forPre}{feature.tag === 'Clients' ? (lang === 'hi' ? 'मुवक्किल' : 'Clients') : feature.tag === 'Lawyers' ? (lang === 'hi' ? 'वकील' : 'Lawyers') : (lang === 'hi' ? 'दोनों' : 'Both')}
          </span>
        </div>

        {/* Main icon — pulsing glow ring on hover */}
        <div
          className={`relative z-10 w-20 h-20 rounded-2xl ${c.iconBg} border flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
          style={{ '--glow': glow }}
        >
          <feature.icon className={`w-10 h-10 ${c.icon} transition-all duration-300`} />
          {/* Ping ring */}
          <span
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 0 3px ${glow}`,
              animationName: 'iconPulse',
              animationDuration: '1.8s',
              animationIterationCount: 'infinite',
              '--glow': glow,
            }}
          />
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors">{feature.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const d = TEXT[lang] || TEXT.en;
  const featuresList = lang === 'hi' ? FEATURES_HI : FEATURES;

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300">

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <NavbarWave />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-36 pb-16 px-6 text-center">
        {/* Formal badge */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 mb-8">
          {d.heroBadge}
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900 dark:text-white">
          {d.heroTitle1}<br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            {d.heroTitle2}
          </span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          {d.heroSub}
        </p>

        {/* Animated trust indicators */}
        <TrustCounters />
      </section>

      {/* Thin divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
      </div>


      {/* ── PLATFORM CAPABILITIES ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">{d.cap_sub}</span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors">{d.cap_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl mx-auto">{d.cap_desc}</p>
        </div>

        {/* ── APEX System Hero Card ── */}
        <div
          className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#00100a] via-[#001a10] to-[#000d08] mb-8 shadow-2xl shadow-emerald-500/8"
          style={{ animationName: 'cardEnter', animationDuration: '0.6s', animationTimingFunction: 'cubic-bezier(.22,.68,0,1.2)', animationFillMode: 'both' }}
        >
          {/* Background radial glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-600/6 rounded-full blur-3xl" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)' }} />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ── Left: Visionary copy ── */}
            <div className="p-10 lg:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold tracking-widest uppercase mb-6 w-fit">
                <Award className="w-3.5 h-3.5" />
                Lxwyer Up — APEX System
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5">
                {d.apex_title_1}{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                  {d.apex_title_2}
                </span>
              </h2>

              <p className="text-slate-300 text-[15px] leading-relaxed mb-5">
                {d.apex_desc_1}
              </p>

              <p className="text-slate-400 text-sm leading-relaxed mb-8 italic border-l-2 border-emerald-500/40 pl-4">
                {d.apex_quote}
                <span className="block mt-1 text-emerald-600/80 not-italic font-semibold text-xs">— Lxwyer Up</span>
              </p>

              <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 w-fit max-w-sm">
                <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100 text-sm font-medium leading-relaxed">
                  {d.apex_promise}
                </span>
              </div>
            </div>

            {/* ── Right: 6-stage pipeline ── */}
            <div className="p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-emerald-500/10 flex flex-col justify-center gap-5">
              <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-1">
                {d.pipeline}
              </p>

              {[
                { icon: Search,         step: '01', title: lang === 'hi' ? 'दस्तावेज़ सत्यापन' : 'Document Verification',     desc: lang === 'hi' ? 'बार काउंसिल नामांकन, कानून की डिग्री और राष्ट्रीय रजिस्ट्रियों के खिलाफ पहचान की जांच।' : 'Bar Council enrollment, law degree, and identity cross-checked against national registries.' },
                { icon: ClipboardCheck, step: '02', title: lang === 'hi' ? 'विशेषज्ञता मूल्यांकन' : 'Specialisation Assessment', desc: lang === 'hi' ? 'केस-इतिहास विश्लेषण पुष्टि करता है कि घोषित विशेषज्ञता वास्तविक कोर्टरूम ट्रैक रिकॉर्ड द्वारा समर्थित है।' : 'Case-history analysis confirms that declared expertise is backed by real courtroom track records.' },
                { icon: Microscope,     step: '03', title: lang === 'hi' ? 'आचरण और नैतिकता की समीक्षा' : 'Conduct & Ethics Review',   desc: lang === 'hi' ? 'अनुशासनात्मक रिकॉर्ड, सहकर्मी संदर्भ और ग्राहक प्रतिक्रिया की समीक्षा हमारे स्वतंत्र कानूनी पैनल द्वारा की जाती है।' : 'Disciplinary records, peer references, and client feedback reviewed by our independent legal panel.' },
                { icon: TrendingUp,     step: '04', title: lang === 'hi' ? 'प्रदर्शन स्कोरिंग' : 'Performance Scoring',       desc: lang === 'hi' ? 'केस परिणामों, प्रतिक्रिया के समय और समय के साथ ग्राहकों की संतुष्टि के रुझानों पर एआई-संचालित स्कोरिंग।' : 'AI-driven scoring across case outcomes, response times, and client satisfaction trends over time.' },
                { icon: Shield,         step: '05', title: lang === 'hi' ? 'मानदंड मिलान इंजन' : 'Criteria Matching Engine',  desc: lang === 'hi' ? 'स्मार्ट अनुक्रमणिका आपकी सटीक क्वेरी को मैप करती है - बजट, स्थान, भाषा, परामर्श मोड - सबसे उपयुक्त खोजने के लिए।' : 'Smart indexing maps your exact query — budget, location, language, consultation mode — to the best fit.' },
                { icon: BadgeCheck,     step: '06', title: lang === 'hi' ? 'APEX सील प्रदान किया गया' : 'APEX Seal Awarded',         desc: lang === 'hi' ? 'केवल हर चरण को पार करने वाले वकीलों को ही उनकी प्रोफ़ाइल पर APEX सील गर्व के साथ प्रदर्शित करने को मिलता है।' : 'Only lawyers who pass every stage earn the APEX seal displayed proudly on their profile.' },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div key={step} className="flex items-start gap-4 group">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/18 transition-colors duration-200">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black text-emerald-600/80 tracking-widest">{step}</span>
                      <span className="text-sm font-bold text-white">{title}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-28 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-br from-[#03060f] via-[#060d1e] to-[#030609] p-12">
          {/* Ambient glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/3 to-transparent pointer-events-none rounded-3xl" />
          {/* Decorative scales icon */}
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Scale className="w-7 h-7 text-blue-400" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
              {d.cta_title}
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              {d.cta_sub}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => navigate('/user-get-started')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-all hover:gap-3 text-sm shadow-lg shadow-blue-600/20"
              >
                {d.cta_consult} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all"
              >
                {d.cta_contact}
              </button>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}