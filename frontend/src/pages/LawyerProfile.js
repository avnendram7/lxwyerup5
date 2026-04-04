import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Briefcase, MapPin, ArrowLeft, Phone, Mail,
  GraduationCap, CheckCircle, Award, Video, User, Globe,
  Calendar, Building, Shield, ChevronRight, ExternalLink
} from 'lucide-react';
import { dummyLawyers } from '../data/lawyersData';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Deterministic gradient from lawyer id/name
const HERO_GRADIENTS = [
  ['#1e40af', '#4f46e5'],
  ['#7c3aed', '#a21caf'],
  ['#be123c', '#db2777'],
  ['#047857', '#0891b2'],
  ['#c2410c', '#d97706'],
  ['#0e7490', '#1d4ed8'],
];
function getGradient(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  const [a, b] = HERO_GRADIENTS[Math.abs(h) % HERO_GRADIENTS.length];
  return { from: a, to: b };
}

const Pill = ({ children, color = 'blue' }) => {
  const map = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${map[color] || map.blue}`}>
      {children}
    </span>
  );
};

const InfoCard = ({ icon: Icon, label, value, accent = '#4f46e5' }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
      <Icon className="w-4 h-4" style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value || '—'}</p>
    </div>
  </div>
);

const SectionCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
  >
    <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 inline-block" />
      {title}
    </h2>
    {children}
  </motion.div>
);

export default function LawyerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const dummy = dummyLawyers.find(l => l.id === id);
      if (dummy) {
        setLawyer({
          ...dummy,
          is_verified: dummy.verified,
          location: dummy.location || `${dummy.city || ''}, ${dummy.state || ''}`.replace(/^,\s*|,\s*$/, ''),
          feeMin: dummy.feeMin || 'N/A',
          feeMax: dummy.feeMax || 'N/A',
          image: (dummy.photo && dummy.photo.length > 5) ? dummy.photo : null,
          consultationModes: dummy.consultationModes || ['In-Person', 'Video Call'],
        });
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/lawyers`);
        const found = res.data.find(l => l.id === id);
        if (found) {
          const loc = `${found.city || ''}, ${found.state || ''}`.replace(/^,\s*|,\s*$/, '');
          const feeStr = found.fee_range || '';
          const parts = feeStr.split('-');
          setLawyer({
            ...found,
            name: found.full_name || found.name,
            experience: found.experience_years || found.experience,
            feeMin: parts[0]?.replace(/[^\d]/g, '') || 'N/A',
            feeMax: parts[1]?.replace(/[^\d]/g, '') || 'N/A',
            location: loc,
            image: (found.photo && found.photo.length > 5) ? found.photo : null,
            consultationModes: ['In-Person', 'Video Call', 'Phone'],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Scale className="w-12 h-12 text-slate-300" />
        <p className="text-xl font-bold text-slate-700">Lawyer not found</p>
        <button onClick={() => navigate('/find-lawyer/manual')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
          Browse Lawyers
        </button>
      </div>
    );
  }

  const grad = getGradient(lawyer.name || lawyer.id || '');
  const displayName = lawyer.name || lawyer.full_name || 'Lawyer';
  const photoSrc = lawyer.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${grad.from.replace('#', '')}&color=fff&size=200`;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>

      {/* Minimal sticky navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-slate-800 hover:text-indigo-600 transition-colors">
            <Scale className="w-5 h-5 text-indigo-600" />
            Lxwyer Up
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Login</button>
            <button onClick={() => navigate('/register')} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16">
        {/* Gradient Banner */}
        <div className="relative h-52 md:h-64 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
          {/* Diagonal stripe texture */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '18px 18px' }} />
          {/* Watermark */}
          <span className="absolute top-6 right-8 text-white/10 font-black text-4xl tracking-[0.3em] uppercase select-none">LXWYER UP</span>
          {/* Decorative circles */}
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -top-8 right-32 w-32 h-32 rounded-full bg-white/5" />

          {/* Back button */}
          <button onClick={() => navigate(-1)}
            className="absolute top-5 left-5 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* Profile photo + name — overlapping the banner */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12 mb-6">
            {/* Photo */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
              className="relative shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl bg-indigo-100">
                <img src={photoSrc} alt={displayName} className="w-full h-full object-cover"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=200` }} />
              </div>
              {lawyer.is_verified && (
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>

            {/* Name + specialization + quick tags */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{displayName}</h1>
                {lawyer.is_verified && <Pill color="green"><CheckCircle className="w-3 h-3" /> Verified</Pill>}
                {lawyer.featured && <Pill color="amber"><Award className="w-3 h-3" /> Featured</Pill>}
              </div>
              <p className="text-indigo-600 font-semibold text-lg">{lawyer.specialization}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                {lawyer.experience && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {lawyer.experience} yrs experience</span>}
                {lawyer.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {lawyer.location}</span>}
              </div>
            </motion.div>

            {/* Fee + Book (desktop) */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              className="hidden md:flex flex-col items-end gap-3 pb-2">
              {(lawyer.feeMin !== 'N/A' || lawyer.feeMax !== 'N/A') && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consultation Fee</p>
                  <p className="text-2xl font-black text-slate-800 flex items-center justify-end">
                    <span className="text-xs font-bold text-slate-400 mr-1.5 uppercase">30m</span>₹{lawyer.feeMin !== 'N/A' ? lawyer.feeMin : '--'}
                    <span className="text-slate-300 font-light mx-2">/</span>
                    <span className="text-xs font-bold text-slate-400 mr-1.5 uppercase">1h</span>₹{lawyer.feeMax !== 'N/A' ? lawyer.feeMax : '--'}
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate(`/booking/${lawyer.id}`)}
                className="px-6 py-3 rounded-2xl text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
                style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
              >
                Book Consultation <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Stats ribbon */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Experience', value: lawyer.experience ? `${lawyer.experience} Years` : '—' },
              { label: 'Location', value: lawyer.location || '—' },
              { label: 'Education', value: lawyer.education || '—' },
              { label: 'Fee', value: lawyer.feeMin !== 'N/A' ? `30m: ₹${lawyer.feeMin} | 1h: ₹${lawyer.feeMax}` : 'Contact for fee' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Main grid */}
          <div className="grid md:grid-cols-3 gap-6 pb-20 md:pb-12">

            {/* LEFT — 2 cols */}
            <div className="md:col-span-2 space-y-5">

              {/* About */}
              {lawyer.bio && (
                <SectionCard title="About" delay={0.1}>
                  <p className="text-slate-600 leading-relaxed text-sm">{lawyer.bio}</p>
                </SectionCard>
              )}

              {/* Practice Areas */}
              <SectionCard title="Practice Areas" delay={0.15}>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specialization && (
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}>
                      {lawyer.specialization}
                    </span>
                  )}
                  {lawyer.secondarySpecializations?.map((spec, i) => (
                    <span key={i} className="px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {spec}
                    </span>
                  ))}
                  {lawyer.practice_areas?.map((area, i) => (
                    <span key={i} className="px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {area}
                    </span>
                  ))}
                </div>
              </SectionCard>

              {/* Consultation Modes */}
              {lawyer.consultationModes?.length > 0 && (
                <SectionCard title="Consultation Modes" delay={0.2}>
                  <div className="grid grid-cols-3 gap-3">
                    {lawyer.consultationModes.map((mode, i) => (
                      <div key={i} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          {mode === 'In-Person' && <User className="w-5 h-5 text-indigo-600" />}
                          {mode === 'Video Call' && <Video className="w-5 h-5 text-blue-600" />}
                          {mode === 'Phone' && <Phone className="w-5 h-5 text-emerald-600" />}
                          {mode === 'Audio Call' && <Phone className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{mode}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Court */}
              {(lawyer.court || lawyer.barCouncilNumber) && (
                <SectionCard title="Court & Bar Council" delay={0.25}>
                  <div className="flex flex-col gap-2">
                    {lawyer.court && (
                      <InfoCard icon={Building} label="Primary Court" value={lawyer.court} accent={grad.from} />
                    )}
                    {lawyer.barCouncilNumber && (
                      <InfoCard icon={Shield} label="Bar Council Number" value={lawyer.barCouncilNumber} accent={grad.to} />
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Achievements */}
              {lawyer.achievements && Array.isArray(lawyer.achievements) && lawyer.achievements.length > 0 && (
                <SectionCard title="Achievements & Milestones" delay={0.3} className="bg-gradient-to-br from-amber-50/50 to-yellow-100/50 border-amber-200/50 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <Award className="w-48 h-48 text-amber-500" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    {[...lawyer.achievements]
                      .sort((a, b) => b.pinned - a.pinned)
                      .map((ach, i) => (
                        <div key={i}
                          className={`flex gap-5 p-5 items-center rounded-2xl border transition-all shadow-sm hover:shadow-md ${ach.pinned
                            ? 'bg-gradient-to-r from-white to-amber-50/50 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                            : 'bg-white/80 backdrop-blur-md border-amber-100 hover:border-amber-300/50'}`}
                        >
                          {ach.photo ? (
                            <img src={ach.photo.startsWith('http') || ach.photo.startsWith('data:') ? ach.photo : `${API.replace('/api', '')}${ach.photo}`} alt="achievement" className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-amber-200 shadow-sm" />
                          ) : (
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 shadow-inner">
                              <Award className="w-10 h-10 text-amber-500 drop-shadow-sm" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-bold text-[17px] leading-snug text-slate-900">
                                {ach.title}
                              </p>
                              {ach.pinned && (
                                <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full tracking-wider uppercase border border-amber-200">
                                  <Star className="w-3 h-3 fill-current" /> Featured
                                </span>
                              )}
                            </div>
                            {ach.date && (
                              <p className="text-[13px] font-medium text-amber-700/70 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> {ach.date}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* RIGHT — 1 col */}
            <div className="space-y-5">

              {/* Mobile Book Button */}
              <div className="md:hidden">
                <button
                  onClick={() => navigate(`/booking/${lawyer.id}`)}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
                >
                  Book Consultation <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Contact */}
              <SectionCard title="Contact" delay={0.1}>
                <div className="space-y-3">
                  {lawyer.phone && <InfoCard icon={Phone} label="Phone" value={lawyer.phone} accent={grad.from} />}
                  {lawyer.email && <InfoCard icon={Mail} label="Email" value={lawyer.email} accent={grad.to} />}
                  {lawyer.location && <InfoCard icon={MapPin} label="Location" value={lawyer.location} accent="#10b981" />}
                </div>
              </SectionCard>

              {/* Education */}
              {lawyer.education && (
                <SectionCard title="Education" delay={0.15}>
                  <InfoCard icon={GraduationCap} label="Degree / Institution" value={lawyer.education} accent={grad.from} />
                </SectionCard>
              )}

              {/* Languages */}
              {lawyer.languages?.length > 0 && (
                <SectionCard title="Languages" delay={0.2}>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.languages.map((lang, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Globe className="w-3 h-3" /> {lang}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Availability */}
              {lawyer.availability?.length > 0 && (
                <SectionCard title="Availability" delay={0.25}>
                  <div className="flex flex-wrap gap-1.5">
                    {lawyer.availability.map((day, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{ background: `${grad.from}18`, color: grad.from }}>
                        {day}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA (mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 shadow-lg">
        <button
          onClick={() => navigate(`/booking/${lawyer.id}`)}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
        >
          Book Consultation <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
