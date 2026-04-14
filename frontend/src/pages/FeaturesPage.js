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
import { Card, CardHeader, CardContent } from '../components/ui/card';

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
    title: 'APEX Verification',
    description: 'Our proprietary, multi-stage verification framework. Every lawyer is subjected to rigorous credential checks, peer reviews, conduct audits, and AI-driven performance scoring before appearing in your results. It ensures trusted, high-quality legal consultation for complex or high-stakes matters with more details of their verified expertise.',
    tag: 'Both',
    color: 'green',
    badge: 'Verified',
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
  { icon: Fingerprint, title: 'APEX वेरिफिकेशन', description: 'हमारा मालिकाना बहु-चरणीय सत्यापन ढांचा। हर वकील की क्रेडेंशियल जांच, सहकर्मी समीक्षा और एआई-संचालित प्रदर्शन स्कोरिंग से गुज़रना पड़ता है। यह जटिल मामलों के लिए विश्वसनीय परामर्श सुनिश्चित करता है।', tag: 'Both', color: 'green', badge: 'सत्यापित', },
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

const CardDecorator = ({ children, colorTheme }) => {
    let iconClass = "text-blue-500";
    if (colorTheme === 'red') iconClass = "text-red-500";
    if (colorTheme === 'green') iconClass = "text-emerald-500";

    return (
        <div aria-hidden className="relative mx-auto size-36 transform scale-[1.1] mb-2 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
            <div className="absolute inset-0 [--border:rgba(0,0,0,0.1)] dark:[--border:rgba(255,255,255,0.15)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"/>
            <div className={`bg-transparent absolute inset-0 m-auto flex size-12 items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl ${iconClass}`}>{children}</div>
        </div>
    );
};

function FeatureCard({ feature, index }) {
  const { lang } = useLang();
  
  return (
      <Card 
        className="group relative overflow-hidden bg-white dark:bg-black border-slate-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-black/5"
        style={{
            animationName: 'cardEnter',
            animationDuration: '0.55s',
            animationTimingFunction: 'cubic-bezier(.22,.68,0,1.2)',
            animationFillMode: 'both',
            animationDelay: `${index * 0.07}s`,
        }}
      >
          <CardHeader className="pb-3 text-center relative z-10">
              {feature.badge && (
                  <div className="absolute -top-1 -right-2 transform scale-75">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${feature.color === 'red' ? 'text-red-600 border-red-500/30 bg-red-500/10' : feature.color === 'green' ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' : 'text-blue-600 border-blue-500/30 bg-blue-500/10'} animate-pulse`}>
                          {feature.badge}
                      </span>
                  </div>
              )}
              <CardDecorator colorTheme={feature.color}>
                  <feature.icon className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white transition-colors">{feature.title}</h3>
          </CardHeader>

          <CardContent className="text-center relative z-10">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
          </CardContent>
          
          {/* Subtle background glow on hover */}
          <div className={`absolute top-0 inset-x-0 h-40 mix-blend-screen pointer-events-none opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700 bg-gradient-to-b ${feature.color === 'red' ? 'from-red-600' : feature.color === 'green' ? 'from-emerald-600' : 'from-blue-600'} to-transparent`} />
      </Card>
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
        {/* Platform capabilities title */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">{d.cap_sub}</span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors">{d.cap_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl mx-auto">{d.cap_desc}</p>
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