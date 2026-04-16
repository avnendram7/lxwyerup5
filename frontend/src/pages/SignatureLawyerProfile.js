import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, MapPin, ArrowLeft, CheckCircle, Award, Shield, Clock,
  BookOpen, Star, ChevronRight, Phone, Mail, Globe, Gavel
} from 'lucide-react';
import GoldenStars from '../components/GoldenStars';
import { dummyLawyers } from '../data/lawyersData';
import axios from 'axios';
import { getLawyerPhoto, getInitials } from '../utils/lawyerPhoto';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/* ─── Design tokens ─────────────────────────────────────── */
const GOLD   = '#C9A84C';
const GOLD_LIGHT = '#E2C97E';
const BG     = '#060608';
const PANEL  = '#0D0D10';
const BORDER = 'rgba(201,168,76,0.15)';
const FONT_SERIF = '"Playfair Display", Georgia, serif';
const FONT_SANS  = '"Inter", system-ui, sans-serif';

/* ─── Topbar ─────────────────────────────────────────────── */
const SignatureNavbar = ({ navigate }) => (
  <nav style={{
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(6,6,8,0.92)', backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${BORDER}`,
  }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Wordmark */}
      <button onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <Gavel size={18} color={GOLD} strokeWidth={1.5} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.18em',
          textTransform: 'uppercase', fontFamily: FONT_SANS }}>
          Lxwyer<span style={{ color: GOLD }}> Up</span>
        </span>
        <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
        <span style={{ fontSize: 11, color: GOLD, letterSpacing: '0.12em',
          fontFamily: FONT_SERIF, fontStyle: 'italic', opacity: 0.9 }}>
          Signature Dossier
        </span>
      </button>

      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT_SANS,
        transition: 'all 0.2s'
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GOLD; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
      >
        <ArrowLeft size={13} /> Directory
      </button>
    </div>
  </nav>
);

/* ─── Divider with label ─────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
    <span style={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: '0.22em',
      textTransform: 'uppercase', fontFamily: FONT_SANS }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: BORDER }} />
  </div>
);

/* ─── Info row ───────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
      textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: FONT_SANS,
      paddingTop: 1 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
      fontFamily: FONT_SANS, maxWidth: 220, textAlign: 'right', lineHeight: 1.5 }}>{value || '—'}</span>
  </div>
);

/* ─── Verified chip ──────────────────────────────────────── */
const VerifiedChip = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7,
    padding: '6px 12px', borderRadius: 6,
    background: 'rgba(201,168,76,0.07)', border: `1px solid rgba(201,168,76,0.2)` }}>
    <CheckCircle size={11} color={GOLD} strokeWidth={2.5} />
    <span style={{ fontSize: 10, fontWeight: 700, color: GOLD,
      letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT_SANS }}>{label}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
export default function SignatureLawyerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchLawyer = async () => {
      const dummy = dummyLawyers.find(l => l.id === id);
      if (dummy) {
        setLawyer({
          ...dummy,
          is_verified: true,
          location: dummy.location || `${dummy.city || ''}, ${dummy.state || ''}`.replace(/^,\s*|,\s*$/, ''),
          feeMin: dummy.feeMin || 'N/A',
          feeMax: dummy.feeMax || 'N/A',
          image: (dummy.photo && dummy.photo.length > 5) ? dummy.photo : null,
          consultationModes: dummy.consultationModes || ['In-Person', 'Video Call', 'Phone'],
          achievements: dummy.achievements || [],
          lawFirm: dummy.firm || 'Exclusive Legal Practice'
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
            consultationModes: ['In-Person', 'Video Call', 'Priority Channel'],
            achievements: found.achievements || [],
            lawFirm: found.firm || 'Exclusive Legal Practice'
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id]);

  /* Loading */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: BG }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%',
          border: `2px solid rgba(201,168,76,0.2)`,
          borderTopColor: GOLD, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* Not found */
  if (!lawyer) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <GoldenStars />
        <SignatureNavbar navigate={navigate} />
        <Scale size={40} color={`${GOLD}50`} strokeWidth={1} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.1em',
          fontFamily: FONT_SERIF }}>Dossier Unavailable</h1>
        <p style={{ fontSize: 11, color: GOLD, letterSpacing: '0.18em', textTransform: 'uppercase',
          fontFamily: FONT_SANS }}>Profile cannot be located</p>
        <button onClick={() => navigate('/find-lawyer/manual')} style={{
          marginTop: 8, padding: '12px 28px', background: GOLD, color: '#000',
          fontWeight: 800, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: FONT_SANS
        }}>Return to Directory</button>
      </div>
    );
  }

  const displayName = lawyer.name || lawyer.full_name || 'Counsel';
  const allTags = [lawyer.specialization, ...(lawyer.secondarySpecializations || [])].filter(Boolean);
  const photoSrc = getLawyerPhoto(lawyer.image || lawyer.photo, displayName);

  const finalAchievements = (lawyer.achievements && lawyer.achievements.length > 0)
    ? lawyer.achievements
    : [
        { title: `Landmark ruling in ${lawyer.specialization || 'High Court'} jurisdiction`, date: '2023' },
        { title: 'Designated as Top Tier Legal Counsel — LxwyerUp Signature Index', date: '2024' },
        { title: 'Successful resolution of multi-crore corporate settlement', date: '2021' }
      ];

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff',
      fontFamily: FONT_SANS, overflowX: 'hidden' }}>
      <GoldenStars />
      <SignatureNavbar navigate={navigate} />

      {/* Subtle ambient gradient */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50vh',
        background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.06) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0 }} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px',
        position: 'relative', zIndex: 1 }}>

        {/* ═══ IDENTITY CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: PANEL, border: `1px solid ${BORDER}`,
            borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}
        >
          {/* Thin gold rule at top */}
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            {/* ── Photo column ── */}
            <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${BORDER}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '36px 28px', gap: 16 }}>

              {/* Profile image — COLORED, no grayscale */}
              <div style={{ width: 140, height: 160, borderRadius: 10,
                overflow: 'hidden', border: `1px solid rgba(201,168,76,0.3)`,
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)', flexShrink: 0 }}>
                {photoSrc ? (
                  <img src={photoSrc} alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 5%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #1a1200, #3d2b00)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: GOLD,
                      fontFamily: FONT_SERIF }}>{getInitials(displayName)}</span>
                  </div>
                )}
              </div>

              {/* Signature badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 6,
                background: 'rgba(201,168,76,0.08)', border: `1px solid rgba(201,168,76,0.25)` }}>
                <Shield size={11} color={GOLD} strokeWidth={2} />
                <span style={{ fontSize: 9, fontWeight: 800, color: GOLD,
                  letterSpacing: '0.18em', textTransform: 'uppercase' }}>Signature</span>
              </div>
            </div>

            {/* ── Identity column ── */}
            <div style={{ flex: 1, minWidth: 260, padding: '36px 32px', display: 'flex',
              flexDirection: 'column', justifyContent: 'center', gap: 0 }}>

              {/* Case number / dossier ref */}
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em',
                textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
                Dossier Ref · SD-{id?.slice(0,8)?.toUpperCase() || 'XXXXXXXX'}
              </div>

              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.15,
                fontFamily: FONT_SERIF, marginBottom: 6, letterSpacing: '-0.01em' }}>
                {displayName}
              </h1>

              <p style={{ fontSize: 13, fontWeight: 600, color: GOLD_LIGHT,
                marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {lawyer.lawFirm}
              </p>

              {/* Specialization chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                {allTags.map((tag, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600,
                    color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key stats row */}
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff',
                    fontFamily: FONT_SERIF, lineHeight: 1 }}>
                    {lawyer.experience || '10+'}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      fontWeight: 500, marginLeft: 4 }}>yrs</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>Experience</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff',
                    fontFamily: FONT_SERIF, lineHeight: 1 }}>
                    {finalAchievements.length || 3}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>Milestones</div>
                </div>
              </div>

              {/* Verification chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <VerifiedChip label="Identity Verified" />
                <VerifiedChip label="Zero Misconduct" />
                <VerifiedChip label="Priority Access" />
              </div>
            </div>

            {/* ── CTA column ── */}
            <div style={{ width: 200, flexShrink: 0, borderLeft: `1px solid ${BORDER}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '32px 24px', gap: 12 }}>
              <button
                onClick={() => navigate('/signature-booking', { state: { lawyer } })}
                style={{
                  width: '100%', padding: '14px 0',
                  background: `linear-gradient(135deg, ${GOLD} 0%, #b08a34 100%)`,
                  color: '#000', fontWeight: 800, fontSize: 11, letterSpacing: '0.12em',
                  textTransform: 'uppercase', border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontFamily: FONT_SANS, boxShadow: '0 6px 24px rgba(201,168,76,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,168,76,0.25)'}
              >
                Book Consultation
              </button>

              {/* Fee preview */}
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em',
                  textTransform: 'uppercase', marginBottom: 4 }}>Starting from</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: GOLD, fontFamily: FONT_SERIF }}>
                  ₹{lawyer.feeMin !== 'N/A' ? Number(lawyer.feeMin).toLocaleString() : '15,000'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ BODY — 2 column layout ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24,
          alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ background: PANEL, border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 14, padding: '28px 28px' }}
            >
              <SectionLabel><BookOpen size={9} style={{ display: 'inline', marginRight: 6 }} />Executive Summary</SectionLabel>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85,
                fontFamily: FONT_SANS }}>
                {lawyer.bio || `${displayName} is a distinguished member of the LxwyerUp Signature panel — hand-selected for exceptional legal standing, verified conduct, and demonstrated mastery in ${lawyer.specialization?.toLowerCase() || 'legal advisory'}. Available exclusively through Priority Access channels.`}
              </p>
            </motion.div>

            {/* Milestones & Achievements */}
            {finalAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ background: PANEL, border: `1px solid rgba(255,255,255,0.06)`,
                  borderRadius: 14, padding: '28px 28px' }}
              >
                <SectionLabel><Award size={9} style={{ display: 'inline', marginRight: 6 }} />Key Decisions &amp; Milestones</SectionLabel>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {finalAchievements.map((ach, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 16,
                      padding: '14px 0',
                      borderBottom: i < finalAchievements.length - 1
                        ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      {/* Image or Number Placeholder */}
                      {(ach.photo || ach.image) ? (
                        <div style={{
                          width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
                          flexShrink: 0, border: `1px solid rgba(201,168,76,0.3)`,
                          background: 'rgba(255,255,255,0.02)'
                        }}>
                          <img 
                            src={(ach.photo || ach.image).startsWith('http') || (ach.photo || ach.image).startsWith('data:') ? (ach.photo || ach.image) : `${API.replace('/api', '')}${ach.photo || ach.image}`} 
                            alt={ach.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      ) : (
                        <div style={{ width: 34, height: 34, borderRadius: 6,
                          background: 'rgba(201,168,76,0.04)', border: `1px solid rgba(201,168,76,0.15)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 11, fontWeight: 800, color: GOLD,
                          letterSpacing: '0.02em', alignSelf: 'center' }}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      )}
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: (ach.photo || ach.image) ? 44 : 34 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                          lineHeight: 1.5, marginBottom: ach.date ? 4 : 0, fontFamily: FONT_SANS }}>
                          {ach.title}
                        </p>
                        {ach.date && (
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)',
                            letterSpacing: '0.1em', fontWeight: 600,
                            textTransform: 'uppercase' }}>{ach.date}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Academic & Courts */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
            >
              <div style={{ background: PANEL, border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 14, padding: '24px 24px' }}>
                <SectionLabel>Academic Credentials</SectionLabel>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.6, fontFamily: FONT_SERIF }}>
                  {lawyer.education || 'Master of Laws (LL.M.)'}
                </p>
              </div>
              <div style={{ background: PANEL, border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 14, padding: '24px 24px' }}>
                <SectionLabel>Bar Admissions</SectionLabel>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.7, fontFamily: FONT_SANS }}>
                  Supreme Court of India<br />
                  High Courts (Various)<br />
                  Bar Council of India
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Retainer specs */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14 }}
              style={{ background: PANEL, border: `1px solid ${BORDER}`,
                borderRadius: 14, padding: '24px 24px' }}
            >
              <SectionLabel><Clock size={9} style={{ display: 'inline', marginRight: 6 }} />Retainer Details</SectionLabel>
              <InfoRow label="Standard Retainer"
                value={`₹${lawyer.feeMin !== 'N/A' ? Number(lawyer.feeMin).toLocaleString() : '15,000'}`} />
              <InfoRow label="Extended Access"
                value={`₹${lawyer.feeMax !== 'N/A' ? Number(lawyer.feeMax).toLocaleString() : '35,000'}`} />
              <InfoRow label="Languages"
                value={lawyer.languages ? lawyer.languages.join(', ') : 'English'} />
              <InfoRow label="Channels"
                value={(lawyer.consultationModes || []).join(' · ')} />
            </motion.div>

            {/* Practice location */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ background: PANEL, border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 14, padding: '24px 24px' }}
            >
              <SectionLabel><MapPin size={9} style={{ display: 'inline', marginRight: 6 }} />Practice Location</SectionLabel>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
                fontFamily: FONT_SANS, marginBottom: 16 }}>
                101 Signature Tower A<br />
                Financial District<br />
                {lawyer.city || 'Metropolis'}, {lawyer.state || 'India'}
              </p>
              {/* Minimal map placeholder */}
              <div style={{ width: '100%', height: 80, borderRadius: 8,
                background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <MapPin size={16} color={`${GOLD}80`} strokeWidth={1.5} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.1em', textTransform: 'uppercase' }}>Location Confidential</span>
              </div>
            </motion.div>

            {/* Verified highlights */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 }}
              style={{ background: PANEL, border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 14, padding: '24px 24px' }}
            >
              <SectionLabel><Shield size={9} style={{ display: 'inline', marginRight: 6 }} />Verified Standing</SectionLabel>
              {[
                'Contact Information Verified',
                'Premium Standing Active',
                'Zero Misconduct Records',
                'Priority Consultation Access',
                'Accepts High-Value Referrals',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 0',
                  borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%',
                    background: GOLD, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)',
                    fontWeight: 500, fontFamily: FONT_SANS }}>{item}</span>
                </div>
              ))}
            </motion.div>

            {/* Book CTA sticky-ish */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 }}
            >
              <button
                onClick={() => navigate('/signature-booking', { state: { lawyer } })}
                style={{
                  width: '100%', padding: '16px 0',
                  background: `linear-gradient(135deg, ${GOLD} 0%, #b08a34 100%)`,
                  color: '#000', fontWeight: 800, fontSize: 12, letterSpacing: '0.14em',
                  textTransform: 'uppercase', border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: FONT_SANS, boxShadow: '0 8px 28px rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(201,168,76,0.38)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Request Priority Consultation
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Responsive grid override */}
      <style>{`
        @media (max-width: 860px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 680px) {
          main > div:first-child > div > div:first-child {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(201,168,76,0.15) !important;
          }
          main > div:first-child > div > div:last-child {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid rgba(201,168,76,0.15) !important;
          }
        }
      `}</style>
    </div>
  );
}
