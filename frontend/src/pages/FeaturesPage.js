import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavbarWave } from '../components/NavbarWave';
import {
  MessageSquare, FileText, Calendar, Bell, Shield,
  BarChart, Users, Clock, Siren, Fingerprint, Phone,
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
          <CardHeader className="pb-3 pt-6 px-4 sm:pt-8 sm:px-8 text-center relative z-10">
              {feature.badge && (
                  <div className="absolute -top-1 -right-2 transform scale-75">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${feature.color === 'red' ? 'text-red-600 border-red-500/30 bg-red-500/10' : feature.color === 'green' ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' : 'text-blue-600 border-blue-500/30 bg-blue-500/10'} animate-pulse`}>
                          {feature.badge}
                      </span>
                  </div>
              )}
              <CardDecorator colorTheme={feature.color}>
                  <feature.icon className="size-7" aria-hidden />
              </CardDecorator>

              <h3 className="mt-3 text-[0.95rem] sm:text-[1.35rem] font-bold text-slate-900 dark:text-white transition-colors">{feature.title}</h3>
          </CardHeader>

          <CardContent className="text-center relative z-10 px-4 pb-5 sm:px-8 sm:pb-8">
              <p className="text-[0.78rem] sm:text-[0.95rem] text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
          </CardContent>
          
          {/* Subtle background glow on hover */}
          <div className={`absolute top-0 inset-x-0 h-40 mix-blend-screen pointer-events-none opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700 bg-gradient-to-b ${feature.color === 'red' ? 'from-red-600' : feature.color === 'green' ? 'from-emerald-600' : 'from-blue-600'} to-transparent`} />
      </Card>
  );
}

/* ── Bento CSS injected once ── */
const BENTO_CSS = `
@keyframes bentoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes bentoPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
@keyframes bentoSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes bentoFade  { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes bentoLine  { 0%{stroke-dashoffset:400} 100%{stroke-dashoffset:0} }
@keyframes sosRing    { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
@keyframes apexScan   { 0%{transform:translateY(-100%) scaleY(0.5); opacity:0} 50%{opacity:1} 100%{transform:translateY(200%) scaleY(0.5); opacity:0} }
@keyframes chartLine  { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }

.bento-card { animation: bentoFade .55s ease both; }
.bento-card:nth-child(1){animation-delay:.05s} .bento-card:nth-child(2){animation-delay:.12s}
.bento-card:nth-child(3){animation-delay:.18s} .bento-card:nth-child(4){animation-delay:.22s}
.bento-card:nth-child(5){animation-delay:.26s} .bento-card:nth-child(6){animation-delay:.30s}
.bento-card:nth-child(7){animation-delay:.34s} .bento-card:nth-child(8){animation-delay:.38s}
.bento-card:nth-child(9){animation-delay:.42s} .bento-card:nth-child(10){animation-delay:.46s}
`;
if (typeof document !== 'undefined' && !document.getElementById('bento-css')) {
  const s = document.createElement('style'); s.id = 'bento-css'; s.textContent = BENTO_CSS; document.head.appendChild(s);
}

function BentoFeaturePage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const d = TEXT[lang] || TEXT.en;
  const featuresList = lang === 'hi' ? FEATURES_HI : FEATURES;
  const [sos, apex, ai, booking, caseTrack, docs, clients, notifs, analytics, allDay] = featuresList;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <NavbarWave />

      {/* Hero */}
      <section className="pt-28 pb-6 px-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 leading-tight" style={{ letterSpacing: '-0.02em' }}>{d.heroTitle1}</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">{d.cap_desc}</p>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 mt-6 relative z-10">
        <div className="grid grid-cols-6 gap-4 sm:gap-6">

          {/* ── ROW 1 ── */}

          <div className="bento-card col-span-6 lg:col-span-2 relative overflow-hidden rounded-2xl border border-red-900/40 bg-[#0e0608] hover:border-red-500/50 transition-colors duration-300 group" style={{ minHeight: 336 }}>
            {/* Animated ping rings inside card */}
            <div style={{ position: 'absolute', top: '38%', right: '18%', width: 72, height: 72, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(239,68,68,0.5)', animation: 'sosRing 2.5s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(239,68,68,0.3)', animation: 'sosRing 2.5s ease-out .6s infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(239,68,68,0.1)', animation: 'sosRing 2.5s ease-out 1.2s infinite' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
                <Phone style={{ width: 13, height: 13, color: '#fff' }} />
              </div>
            </div>
            {/* Ambient subtle glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 40%, rgba(239,68,68,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
            
            <div className="relative z-10 p-8 flex flex-col h-full justify-between" style={{ minHeight: 336 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', padding: '3px 10px', borderRadius: 100, animation: 'bentoPulse 2s ease-in-out infinite' }}>{sos.badge || 'LIVE NOW'}</span>
                </div>
                <p style={{ fontSize: 42, fontWeight: 900, color: '#ef4444', margin: '0 0 4px 0', lineHeight: 1 }}>₹300</p>
                <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 16px 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>per SOS session</p>
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{sos.title}</h2>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0, paddingRight: 40 }}>{sos.description.slice(0, 100)}…</p>
                <button onClick={() => navigate('/sos')} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', width: 'fit-content' }}>
                  Access SOS <ArrowRight style={{ width: 11, height: 11 }} />
                </button>
              </div>
            </div>
          </div>

          <div className="bento-card col-span-3 lg:col-span-2 relative overflow-hidden rounded-2xl border border-teal-900/30 bg-[#050d0b] hover:border-teal-500/40 transition-colors duration-300" style={{ minHeight: 336 }}>
            {/* Fingerprint SVG */}
            <div style={{ position: 'absolute', bottom: -15, right: -15, width: 140, height: 140, opacity: 0.12, pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z"/>
                <path d="M12 5a7 7 0 0 0-7 7m14 0a7 7 0 0 0-7-7m-5 7a5 5 0 0 1 10 0m-8 0a3 3 0 0 1 6 0m-4 0a1 1 0 0 1 2 0"/>
                <path d="M12 22v-3" />
              </svg>
            </div>
            {/* Scanning line */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.8), transparent)', boxShadow: '0 0 10px rgba(45,212,191,0.5)', animation: 'apexScan 3s linear infinite' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 100%, rgba(45,212,191,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
            
            <div className="relative z-10 p-8 flex flex-col h-full justify-between" style={{ minHeight: 336 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5eead4', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginBottom: 14 }}>{apex.badge || 'APEX'}</span>
                <p style={{ fontSize: 38, fontWeight: 900, color: '#2dd4bf', margin: '0 0 4px 0', lineHeight: 1 }}>100%</p>
                <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 16px 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>verified lawyers only</p>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>{apex.title}</h2>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0, paddingRight: 20 }}>{apex.description.slice(0, 100)}…</p>
              </div>
            </div>
          </div>

          <div className="bento-card col-span-3 lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/6 bg-[#08090e] hover:border-blue-500/30 transition-colors duration-300" style={{ minHeight: 336 }}>
            {/* Visual Chat nodes behind */}
            <div style={{ position: 'absolute', top: 20, right: 16, display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.35, pointerEvents: 'none' }}>
              <div style={{ padding: '6px 10px', borderRadius: '12px 12px 0 12px', background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.4)', fontSize: 9, color: '#fff', whiteSpace: 'nowrap', animation: 'bentoFloat 4s ease-in-out infinite', alignSelf: 'flex-end' }}>FIR Procedure</div>
              <div style={{ padding: '6px 10px', borderRadius: '12px 12px 12px 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 9, color: '#fff', whiteSpace: 'nowrap', marginLeft: -20, animation: 'bentoFloat 4.5s ease-in-out .5s infinite', alignSelf: 'flex-start' }}>Generating drafted response</div>
              <div style={{ padding: '6px 10px', borderRadius: '12px 12px 0 12px', background: 'rgba(59,130,246,0.5)', border: '1px solid rgba(59,130,246,0.6)', fontSize: 9, color: '#fff', whiteSpace: 'nowrap', animation: 'bentoFloat 5s ease-in-out 1s infinite', alignSelf: 'flex-end', display: 'flex', gap: 4 }}><span style={{width:4,height:4,borderRadius:'50%',background:'#fff',animation:'bentoPulse 1s infinite'}}/><span style={{width:4,height:4,borderRadius:'50%',background:'#fff',animation:'bentoPulse 1s .2s infinite'}}/><span style={{width:4,height:4,borderRadius:'50%',background:'#fff',animation:'bentoPulse 1s .4s infinite'}}/></div>
            </div>
            
            <div className="relative z-10 p-8 flex flex-col h-full justify-between" style={{ minHeight: 336 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', letterSpacing: '0.05em' }}>24/7 AI</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', letterSpacing: '0.05em' }}>Gemini Pro</span>
                </div>
              </div>
              <div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(30,58,138,0.2))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <MessageSquare style={{ width: 16, height: 16, color: '#60a5fa' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>{ai.title}</h2>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{ai.description}</p>
              </div>
            </div>
          </div>

          {/* ── ROW 2 — Booking + Case Tracking ── */}
          {[
            { 
              f: booking, 
              icon: <Calendar style={{ width: 16, height: 16, color: '#94a3b8' }} />,
              visual: (
                <div style={{ position: 'absolute', bottom: 12, right: 12, width: '45%', height: 40, opacity: 0.25, pointerEvents: 'none' }}>
                  <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%' }}>
                    <rect x="0" y="5" width="20" height="25" rx="3" fill="rgba(255,255,255,0.3)"/>
                    <rect x="25" y="5" width="20" height="25" rx="3" fill="rgba(255,255,255,0.3)"/>
                    <rect x="50" y="5" width="20" height="25" rx="3" fill="#3b82f6"/>
                    <rect x="75" y="5" width="20" height="25" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)"/>
                  </svg>
                </div>
              )
            },
            { 
              f: caseTrack, 
              icon: <FileText style={{ width: 16, height: 16, color: '#94a3b8' }} />,
              visual: (
                <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.35, pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} /><div style={{ height: 4, width: 30, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }}/></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'bentoPulse 1.5s infinite' }} /><div style={{ height: 4, width: 45, background: 'linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.3))', borderRadius: 2 }}/></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', border: '1px solid #475569' }} /><div style={{ height: 4, width: 25, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}/></div>
                </div>
              )
            },
          ].map(({ f, icon, visual }, i) => (
            <div key={i} className="bento-card col-span-3 relative overflow-hidden rounded-2xl border border-white/5 bg-[#0b0c13] hover:bg-[#10131f] transition-colors duration-300" style={{ minHeight: 224 }}>
              {visual}
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>{f.title}</h2>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0, paddingRight: 40 }}>{f.description.slice(0, 80)}…</p>
                </div>
              </div>
            </div>
          ))}

          {/* ── ROW 3 — Docs, Clients, Notifications ── */}
          {[
            { f: docs, icon: <Shield style={{ width: 14, height: 14, color: '#94a3b8' }} /> },
            { f: clients, icon: <Users style={{ width: 14, height: 14, color: '#94a3b8' }} /> },
            { f: notifs, icon: <Bell style={{ width: 14, height: 14, color: '#94a3b8' }} /> },
          ].map(({ f, icon }, i) => (
            <div key={i} className="bento-card col-span-2 relative overflow-hidden rounded-2xl border border-white/5 bg-[#0b0c13] hover:bg-[#10131f] transition-colors duration-300" style={{ minHeight: 210 }}>
              <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{icon}</div>
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>{f.title}</h2>
                  <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{f.description.slice(0, 75)}…</p>
                </div>
              </div>
            </div>
          ))}

          <div className="bento-card col-span-3 relative overflow-hidden rounded-2xl border border-white/5 bg-[#0b0c13] hover:bg-[#10131f] transition-colors duration-300" style={{ minHeight: 224 }}>
            {/* Chart line trace */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, left: 10, height: 70, opacity: 0.25, pointerEvents: 'none' }}>
              <svg viewBox="0 0 300 70" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <polyline points="0,60 40,45 80,50 120,30 160,38 200,15 240,25 300,5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="400" style={{ animation: 'chartLine 3s ease-out forwards' }} />
                <polyline points="0,60 40,45 80,50 120,30 160,38 200,15 240,25 300,5 300,70 0,70" fill="rgba(59,130,246,0.1)" />
              </svg>
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <BarChart style={{ width: 14, height: 14, color: '#94a3b8' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>{analytics.title}</h2>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0, paddingRight: 40 }}>{analytics.description.slice(0, 80)}…</p>
              </div>
            </div>
          </div>

          <div className="bento-card col-span-3 relative overflow-hidden rounded-2xl border border-white/5 bg-[#0b0c13] hover:bg-[#10131f] transition-colors duration-300" style={{ minHeight: 224 }}>
            {/* Uptime dots */}
            <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 4, flexWrap: 'wrap', width: 95, opacity: 0.35, pointerEvents: 'none' }}>
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i > 15 ? '#374151' : '#22c55e', animation: i <= 15 ? `bentoPulse ${2 + (i % 3) * 0.5}s ease-in-out ${i * 0.1}s infinite` : 'none', opacity: i > 15 ? 0.3 : 1 }} />
              ))}
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Clock style={{ width: 14, height: 14, color: '#94a3b8' }} />
              </div>
              <div>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>99.9%</p>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>{allDay.title}</h2>
                <p style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{allDay.description}</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl border border-blue-900/40 bg-gradient-to-br from-[#03060f] via-[#060d1e] to-[#030609] p-8 sm:p-12 text-center relative overflow-hidden bento-card">
          <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 300, height: 100, background: 'radial-gradient(ellipse,rgba(37,99,235,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5, pointerEvents: 'none' }} />
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 10, boxShadow: '0 0 20px rgba(59,130,246,0.1)' }}>
            <Scale style={{ width: 22, height: 22, color: '#60a5fa' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight relative z-10">{d.cta_title}</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg mx-auto relative z-10">{d.cta_sub}</p>
          <div className="flex flex-wrap gap-4 justify-center relative z-10">
            <button onClick={() => navigate('/user-get-started')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: '#2563eb', color: '#fff', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)' }}>
              {d.cta_consult} <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={() => navigate('/contact')} style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              {d.cta_contact}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return <BentoFeaturePage />;
}