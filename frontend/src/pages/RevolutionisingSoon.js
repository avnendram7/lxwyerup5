import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import { useLang } from '../context/LanguageContext';
/* ─── Signup Form ─────────────────────────────────────────── */
const VisionaryForm = memo(function VisionaryForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = e => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) return;
    if (form.phone && form.phone.length < 10) {
      setStatus('invalid_phone');
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch(`${API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          message: form.message
        }),
      });
      if (!response.ok) {
        let errData = {};
        try { errData = await response.json(); } catch (e) { }

        const detailStr = JSON.stringify(errData?.detail || '');
        const detailObj = errData?.detail;

        if (response.status === 400 && detailStr.toLowerCase().includes('already registered')) {
          setStatus('already_registered');
        } else if (response.status === 422 || detailStr.toLowerCase().includes('validation') || detailStr.toLowerCase().includes('email')) {
          setStatus('invalid_email');
        } else if (typeof detailObj === 'string' && detailObj) {
          // Dynamic error from backend
          setStatus('backend_error');
          // Temporarily attach it to form state or a ref if needed, but for now just use a specific status
        } else {
          setStatus('error');
        }
        return;
      }
      setStatus('success');
      // Fire GA4 event
      if (window.gtag) {
        window.gtag('event', 'waitlist_signup', {
          event_category: 'engagement',
          event_label: form.role,
        });
      }
    } catch { setStatus('error'); }
  };

  if (status === 'success') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '2rem 0' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(37,99,235,0.4)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af' }}>You're on the list!</p>
      <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>We'll reach out at {form.email} when we launch.</p>
    </div>
  );

  const inp = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    fontSize: '0.85rem', color: '#0f172a', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <div className="form-grid-2">
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required style={inp}
            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required style={inp}
            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
      </div>
      <div className="form-grid-2">
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" style={inp}
            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>I Am A *</label>
          <select name="role" value={form.role} onChange={handleChange} required style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Select role</option>
            <option value="client">Client / Individual</option>
            <option value="lawyer">Lawyer</option>
            <option value="lawfirm">Law Firm</option>
            <option value="student">Law Student</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>What Excites You? (Optional)</label>
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="AI legal matching, SOS help, transparent fees..." rows={3}
          style={{ ...inp, resize: 'vertical', minHeight: 64 }}
          onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
      </div>
      <button type="submit" disabled={status === 'loading'} style={{
        marginTop: 4, padding: '13px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff',
        fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.02em',
        boxShadow: '0 6px 20px rgba(37,99,235,0.35)', fontFamily: 'inherit',
        transition: 'opacity 0.2s', opacity: status === 'loading' ? 0.7 : 1,
      }}>
        {status === 'loading' ? 'Sending…' : 'Join the Movement →'}
      </button>
      {status === 'error' && <p style={{ fontSize: '0.8rem', color: '#ef4444', textAlign: 'center' }}>Something went wrong. Please try again.</p>}
      {status === 'invalid_email' && <p style={{ fontSize: '0.8rem', color: '#ef4444', textAlign: 'center' }}>Please enter a valid email address.</p>}
      {status === 'invalid_phone' && <p style={{ fontSize: '0.8rem', color: '#ef4444', textAlign: 'center' }}>Phone number must be 10 digits.</p>}
      {status === 'already_registered' && <p style={{ fontSize: '0.8rem', color: '#f59e0b', textAlign: 'center' }}>✉️ This email is already registered! We'll reach out when we launch.</p>}
      {status === 'backend_error' && <p style={{ fontSize: '0.8rem', color: '#f59e0b', textAlign: 'center' }}>Something went wrong. Please verify your details.</p>}
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: 2 }}>
        Questions? <a href="mailto:avnendram.7@gmail.com" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>avnendram.7@gmail.com</a>
      </p>
    </form>
  );
});

/* ─── Main ────────────────────────────────────────────────── */
export default function RevolutionisingSoon() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [trianglePhase, setTrianglePhase] = useState('idle'); // 'idle' | 'zoom' | 'done'
  const signupRef = useRef(null);
  const bannerRef = useRef(null);

  // Spotlight — starts off-screen so watermark is invisible until mouse moves
  const [spot, setSpot] = useState({ x: -999, y: -999, r: 56 });
  const target = useRef({ x: -999, y: -999 });
  const current = useRef({ x: -999, y: -999 });
  const targetRadius = useRef(56);
  const currentRadius = useRef(56);
  const isTransitioningRef = useRef(false);
  const hasMoved = useRef(false);
  const raf = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const targets = [signupRef.current, bannerRef.current].filter(Boolean);
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('rs-in'); }), { threshold: 0.06 });
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.06);
      current.current.y = lerp(current.current.y, target.current.y, 0.06);
      const rLerpSpeed = isTransitioningRef.current ? 0.04 : 0.06;
      currentRadius.current = lerp(currentRadius.current, targetRadius.current, rLerpSpeed);
      setSpot({ x: current.current.x, y: current.current.y, r: currentRadius.current });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const onMouseMove = useCallback(e => {
    const r = e.currentTarget.getBoundingClientRect();
    if (!hasMoved.current) hasMoved.current = true;
    target.current = {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  }, []);

  const goDemo = () => {
    if (transitioning) return;
    setTransitioning(true);
    // Start the triangle zoom animation after a short delay (let overlay appear first)
    setTimeout(() => setTrianglePhase('zoom'), 50);
    // Navigate to /home after the triangle animation completes (~2.2s)
    setTimeout(() => {
      sessionStorage.setItem('fromLanding', 'true');
      navigate('/home');
    }, 2200);
  };

  const sx = spot.x.toFixed(1), sy = spot.y.toFixed(1), sr = spot.r.toFixed(1);
  const mask = `radial-gradient(circle ${sr}px at ${sx}% ${sy}%, black 0%, transparent 100%)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #000; font-family: 'Outfit','Inter',sans-serif; overflow-x: hidden; }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
        select option { background: #fff; color: #0f172a; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.2); border-radius: 3px; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { from { background-position:200% center; } to { background-position:-200% center; } }
        @keyframes floatOrb{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
        @keyframes pulse   {
          0%  { box-shadow: 0 0 0 0 rgba(37,99,235,0.55); }
          70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100%{ box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        @keyframes reveal  { from{opacity:0;transform:scale(0.97);} to{opacity:1;transform:scale(1);} }
        @keyframes mirrorShimmer { 0%{opacity:0.08;} 50%{opacity:0.18;} 100%{opacity:0.08;} }
        @keyframes reflectionReveal { from{opacity:0;transform:scaleY(0.7);} to{opacity:1;transform:scaleY(1);} }

        .rs-reveal { opacity:0; transform:translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .rs-reveal.rs-in { opacity:1; transform:translateY(0); }

        .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        .rs-card {
          display:flex; width:100%; max-width:880px; border-radius:22px; overflow:hidden;
          border:1px solid rgba(255,255,255,0.12);
          box-shadow:0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .rs-card-left {
          flex:0 0 55%; background:rgba(255,255,255,0.88);
          backdrop-filter:blur(26px) saturate(1.8); -webkit-backdrop-filter:blur(26px) saturate(1.8);
          border-right:1px solid rgba(255,255,255,0.18);
          padding:clamp(2rem,4vw,3.2rem); display:flex; flex-direction:column;
        }
        .rs-card-right {
          flex:1; background:rgba(5,12,40,0.55);
          backdrop-filter:blur(26px) saturate(1.6); -webkit-backdrop-filter:blur(26px) saturate(1.6);
          border-left:1px solid rgba(255,255,255,0.06);
          padding:clamp(2rem,4vw,3.2rem); display:flex; flex-direction:column;
          justify-content:space-between; position:relative; overflow:hidden;
        }

        @media (max-width:700px) {
          .rs-card { flex-direction:column; border-radius:16px; }
          .rs-card-left { flex:none; border-right:none; border-bottom:1px solid rgba(255,255,255,0.18); }
          .rs-card-right { flex:none; border-left:none; min-height:240px; }
          .form-grid-2 { grid-template-columns:1fr; }
        }

        /* ── Triangle transition overlay ── */
        @keyframes triangleZoomOut {
          0%   { transform: scale(0.08); opacity: 0; stroke-width: 6px; }
          15%  { opacity: 1; }
          30%  { transform: scale(1.2); opacity: 1; stroke-width: 4px; }
          100% { transform: scale(120); opacity: 0; stroke-width: 0.2px; }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tri-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          animation: overlayFadeIn 0.3s ease forwards;
          pointer-events: all;
        }
        .tri-svg {
          width: 120px; height: 120px;
          transform-origin: center center;
          animation: triangleZoomOut 2.2s cubic-bezier(0.25, 1, 0.4, 1) forwards;
        }
      `}</style>

      {/* ── Triangle transition overlay (black screen + blue triangle) ── */}
      {transitioning && (
        <div className="tri-overlay">
          <svg className="tri-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="50,10 90,85 10,85"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section
        style={{ position: 'relative', width: '100%', height: '100dvh', background: '#000', overflow: 'hidden', cursor: 'default' }}
        onMouseMove={onMouseMove}
      >


        {/* BG spotlight reveal — only shown when NOT transitioning */}
        {!transitioning && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
            maskImage: mask,
            WebkitMaskImage: mask,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              inset: 0,
              justifyContent: 'center',
              gap: 'clamp(180px, 20vh, 25vh)',
            }}>
              <span style={{
                fontSize: 'clamp(9vw, 14vw, 16vw)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                fontFamily: "'Outfit','Inter',sans-serif",
                lineHeight: 0.85,
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg,#93c5fd 0%,#60a5fa 50%,#3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'shimmer 5s linear infinite',
              }}>LxwyerUp</span>
              <span style={{
                fontSize: 'clamp(9vw, 14vw, 16vw)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                fontFamily: "'Outfit','Inter',sans-serif",
                lineHeight: 0.85,
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg,#93c5fd 0%,#60a5fa 50%,#3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'shimmer 5s linear infinite',
              }}>LxwyerUp</span>
            </div>
          </div>
        )}

        {/* Center foreground — minimal text stack */}
        {/* Top brand bar — logo + brand exactly like home page */}
        <div className="w-full mx-auto px-4 md:px-6 xl:px-12" style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '3.5rem',
        }}>
          {/* Logo — same as Navbar.js on home page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo.png"
              alt="Lxwyer Up Logo"
              className="w-8 h-8 xl:w-9 xl:h-9 object-contain rounded" style={{ mixBlendMode: 'screen' }}
            />
            <span className="text-base md:text-lg xl:text-[20px] font-bold tracking-tight text-white font-['Outfit'] select-none">Lxwyer Up</span>
          </div>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(148,163,184,0.45)',
          }}>Legal Tech Platform</span>
        </div>

        {/* Center content — perfectly anchored so 'Coming Soon' sits exactly at the 50% vertical center */}
        <div className="absolute inset-x-0 z-10 flex flex-col items-center text-center px-6 top-[50%] transform -translate-y-[60px] md:-translate-y-[80px]">
          {/* COMING SOON block */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Primary COMING SOON text */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 7vw, 6rem)',
              fontWeight: 900,
              letterSpacing: mounted ? '-0.02em' : '0.12em',
              filter: mounted ? 'blur(0px)' : 'blur(12px)',
              transform: mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
              opacity: mounted ? 1 : 0,
              transition: 'all 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: '#ffffff',
              margin: 0,
              padding: 0,
            }}>Coming Soon</h1>

            {/* Subtle underline instead of reflection */}
            <div style={{
              width: '120px',
              height: '3px',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.8), transparent)',
              marginTop: '1.5rem',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1.2s ease 0.8s, transform 1.2s ease 0.8s',
              transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
            }} />
          </div>

          {/* Tagline */}
          <p style={{
            marginTop: 'clamp(1.5rem,3vw,2rem)',
            fontSize: 'clamp(0.85rem,1.8vw,0.95rem)',
            color: 'rgba(203,213,225,0.8)',
            letterSpacing: '0.04em',
            lineHeight: 1.6,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.9s',
            maxWidth: '32rem',
          }}>India's legal revolution — AI, Dashboard, Apex lawyers, SOS help, transparent fees and more.</p>

          {/* Explore Demo */}
          <div style={{
            marginTop: 'clamp(2rem,4vw,2.5rem)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 1.2s',
          }}>
            <button
              onClick={goDemo}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 32px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(180deg, rgba(37,99,235,0.15) 0%, rgba(30,58,138,0.25) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#fff',
                fontSize: '0.85rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(37,99,235,0.3) 0%, rgba(30,58,138,0.4) 100%)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(37,99,235,0.15) 0%, rgba(30,58,138,0.25) 100%)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
                <polygon points="10 8 16 12 10 16" fill="white" />
              </svg>
              Explore Demo
            </button>
          </div>
        </div>

        {/* Scroll Down Arrow to explore more */}
        <div
          onClick={() => signupRef.current?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            opacity: mounted ? 0.7 : 0,
            transition: 'opacity 1.5s ease 1.5s',
            zIndex: 20
          }}
          className="hover:opacity-100 group"
        >
          <div style={{ animation: 'floatOrb 2s ease-in-out infinite' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — SIGNUP (same as before)
      ══════════════════════════════════════ */}
      <section style={{
        position: 'relative', background: 'rgba(3,8,24,0.92)', zIndex: 1,
        minHeight: 'auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(2.5rem,6vw,5rem) clamp(1rem,4vw,3rem)',
      }}>

        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(29,78,216,0.15) 0%,transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '12%', right: '6%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', animation: 'floatOrb 10s ease-in-out 2s infinite', pointerEvents: 'none' }} />

        <div ref={signupRef} className="rs-reveal rs-card">

          {/* LEFT — white form panel */}
          <div className="rs-card-left">
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e40af', marginBottom: '1.8rem', letterSpacing: '0.01em' }}>Lxwyer Up</p>
            <h2 style={{ fontSize: 'clamp(1.4rem,2.6vw,2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Sign up for<br />Early Access
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.8rem', maxWidth: 340 }}>
              Join India's future legal platform. Get priority access and be first to experience smarter justice.
            </p>
            <VisionaryForm />
          </div>

          {/* RIGHT — dark brand panel */}
          <div className="rs-card-right">
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 340, height: 340, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.1)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.05)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '12%', right: '-12%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.28) 0%,transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(147,197,253,0.55)', marginBottom: '1rem' }}>For Visionaries</p>
              <h3 style={{ fontSize: 'clamp(1.4rem,2.5vw,2.1rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', marginBottom: '1rem' }}>
                Revolutionise<br />
                <span style={{ backgroundImage: 'linear-gradient(135deg,#93c5fd,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }}>
                  Legal Justice
                </span>
              </h3>
              <p style={{ color: 'rgba(148,163,184,0.6)', lineHeight: 1.8, fontSize: '0.85rem', marginBottom: '1.6rem' }}>
                AI-matched lawyers, SOS legal help, transparent fees — justice that truly works.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {['SOS Legal Help — instant 24/7 access', 'AI Lawyer Matching — perfect fit every time', '1000+ Apex Lawyers — coming soon', 'Transparent Fees — zero hidden charges'].map(tx => (
                  <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 2, height: 14, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#6366f1)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(203,213,225,0.72)', lineHeight: 1.4 }}>{tx}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(148,163,184,0.22)', letterSpacing: '0.15em', textTransform: 'uppercase', position: 'relative', zIndex: 2, marginTop: '1.5rem' }}>Made in India — AI-Powered</p>
          </div>
        </div>

        {/* India badge - redesigned to be clean, non-absolute to avoid mobile overlaps */}
        <div ref={bannerRef} className="rs-reveal" style={{ width: '100%', textAlign: 'center', zIndex: 2, padding: '3rem 1rem 1rem 1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 32px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)' }}>
              {t('landing_hero_badge')}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
