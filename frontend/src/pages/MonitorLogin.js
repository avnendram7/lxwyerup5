import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Force monitor login strictly to live production API 
const API = "https://lxwyerup.vercel.app/api";

const MONITOR_TOKEN_KEY = 'monitor_token';

export default function MonitorLogin() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [dots, setDots] = useState([]);

    // Animate background particles
    useEffect(() => {
        const arr = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 3,
            duration: Math.random() * 4 + 3,
        }));
        setDots(arr);
        // redirect if already logged in
        if (localStorage.getItem(MONITOR_TOKEN_KEY)) navigate('/monitor-dashboard'); 
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API}/monitor/login`, { email: 'monitor@lxwyerup.com', password });
            localStorage.setItem(MONITOR_TOKEN_KEY, res.data.token);
            navigate('/monitor-dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            position: 'relative', overflow: 'hidden'
        }}>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap" rel="stylesheet" />

            {/* Grid background */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(0,255,200,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* Glowing center orb */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 600, height: 600,
                background: 'radial-gradient(ellipse, rgba(0,255,180,0.06) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Floating particles */}
            {dots.map(d => (
                <div key={d.id} style={{
                    position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                    width: d.size, height: d.size,
                    background: '#00ffb2', borderRadius: '50%', opacity: 0.4,
                    animation: `pulse ${d.duration}s ${d.delay}s ease-in-out infinite`,
                    boxShadow: '0 0 6px #00ffb2'
                }} />
            ))}

            <style>{`
        @keyframes pulse { 0%,100%{opacity:0.1;transform:scale(0.8)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,255,180,0.3)} 50%{box-shadow:0 0 40px rgba(0,255,180,0.6)} }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0px 1000px #0a1628 inset !important; -webkit-text-fill-color:#00ffb2 !important; }
      `}</style>

            {/* Scanline effect */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(0,255,180,0.4), transparent)',
                animation: 'scanline 8s linear infinite', pointerEvents: 'none', zIndex: 1
            }} />

            {/* Login Card */}
            <div style={{
                position: 'relative', zIndex: 10, width: 420,
                background: 'rgba(0,10,20,0.85)',
                border: '1px solid rgba(0,255,180,0.25)',
                borderRadius: 4,
                boxShadow: '0 0 60px rgba(0,255,180,0.08), inset 0 0 60px rgba(0,255,180,0.02)',
                animation: 'glow 4s ease-in-out infinite',
                backdropFilter: 'blur(20px)',
                padding: '40px 36px',
            }}>
                {/* Header */}
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 56, height: 56,
                        border: '1px solid rgba(0,255,180,0.4)', borderRadius: 4,
                        marginBottom: 16, position: 'relative',
                        background: 'rgba(0,255,180,0.05)'
                    }}>
                        <span style={{ fontSize: 24 }}>🛰️</span>
                        <div style={{
                            position: 'absolute', top: -1, right: -1, width: 8, height: 8,
                            background: '#00ffb2', borderRadius: '50%',
                            boxShadow: '0 0 8px #00ffb2', animation: 'pulse 2s infinite'
                        }} />
                    </div>

                    <div style={{ color: 'rgba(0,255,180,0.5)', fontSize: 10, letterSpacing: 4, marginBottom: 6 }}>
                        LXWYERUP SYSTEM v2.4.1
                    </div>
                    <div style={{ color: '#00ffb2', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
                        MONITOR ACCESS
                    </div>
                    <div style={{ color: 'rgba(0,255,180,0.4)', fontSize: 11, marginTop: 4, letterSpacing: 1 }}>
                        RESTRICTED — AUTHORIZED PERSONNEL ONLY
                    </div>
                </div>

                {/* Terminal-style line */}
                <div style={{
                    borderTop: '1px solid rgba(0,255,180,0.15)',
                    marginBottom: 28,
                    paddingTop: 16,
                    color: 'rgba(0,255,180,0.3)', fontSize: 10, letterSpacing: 1
                }}>
                    &gt; AUTHENTICATION REQUIRED
                    <span style={{ animation: 'blink 1s infinite', marginLeft: 2 }}>█</span>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)',
                        borderRadius: 3, padding: '10px 14px', marginBottom: 20,
                        color: '#ff6b6b', fontSize: 12, letterSpacing: 0.5
                    }}>
                        ✗ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin}>

                    <div style={{ marginBottom: 28 }}>
                        <div style={{ color: 'rgba(0,255,180,0.5)', fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
                            ACCESS KEY
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                placeholder="••••••••"
                                style={{
                                    width: '100%', background: 'rgba(0,255,180,0.04)',
                                    border: '1px solid rgba(0,255,180,0.2)', borderRadius: 3,
                                    padding: '12px 44px 12px 14px', color: '#00ffb2', fontSize: 13,
                                    outline: 'none', letterSpacing: 3, boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,255,180,0.6)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,255,180,0.2)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(0,255,180,0.5)', padding: 0, display: 'flex', alignItems: 'center',
                                }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword
                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                }
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '14px',
                        background: loading ? 'rgba(0,255,180,0.1)' : 'rgba(0,255,180,0.12)',
                        border: '1px solid rgba(0,255,180,0.5)',
                        borderRadius: 3, color: '#00ffb2', fontSize: 13, fontWeight: 700,
                        letterSpacing: 3, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', fontFamily: 'inherit',
                    }}
                        onMouseEnter={e => { if (!loading) { e.target.style.background = 'rgba(0,255,180,0.2)'; e.target.style.boxShadow = '0 0 20px rgba(0,255,180,0.2)'; } }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(0,255,180,0.12)'; e.target.style.boxShadow = 'none'; }}
                    >
                        {loading ? '> AUTHENTICATING...' : '> INITIATE ACCESS'}
                    </button>
                </form>

                <div style={{
                    marginTop: 24, textAlign: 'center',
                    color: 'rgba(0,255,180,0.2)', fontSize: 10, letterSpacing: 1
                }}>
                    SESSION WILL EXPIRE AFTER 24H OF INACTIVITY
                </div>
            </div>
        </div>
    );
}
