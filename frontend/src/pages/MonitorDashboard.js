import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Use dynamic API endpoint to allow local testing
import { API } from '../App';

const TK = 'monitor_token';
const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const G = (v, fb='—') => (v !== undefined && v !== null && v !== '') ? v : fb;

const STATUS_COLOR = { pending:'#f59e0b', approved:'#10b981', rejected:'#ef4444', active:'#10b981', inactive:'#64748b', completed:'#3b82f6', confirmed:'#10b981', cancelled:'#ef4444', in_progress:'#8b5cf6', searching:'#f59e0b', matched:'#06b6d4' };

const TYPE_COLOR = { BOOKING:'#3b82f6', MESSAGE:'#8b5cf6', SOS:'#ef4444', CLIENT_APP:'#06b6d4', LAWYER_APP:'#f59e0b', LAWYER_APPLICATION:'#10b981', CASE_UPDATE:'#a78bfa' };

const s = {
  app: { height:'100vh', overflow:'hidden', background:'#030712', color:'#e2e8f0', fontFamily:"'JetBrains Mono','Courier New',monospace" },
  grid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(0,255,200,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,200,0.018) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' },
  sidebar: { width:230, background:'rgba(0,8,18,0.97)', borderRight:'1px solid rgba(0,255,180,0.1)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100, overflowY:'auto' },
  content: { marginLeft:230, height:'100vh', overflowY:'auto', padding:'24px 28px', overflowX:'hidden' },
  card: { background:'rgba(0,18,38,0.7)', border:'1px solid rgba(0,255,180,0.1)', borderRadius:6, padding:'20px', marginBottom:16 },
  statCard: { background:'rgba(0,18,38,0.8)', border:'1px solid rgba(0,255,180,0.13)', borderRadius:6, padding:'16px 18px', flex:1, minWidth:130 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:11 },
  th: { textAlign:'left', padding:'7px 10px', color:'rgba(0,255,180,0.45)', fontSize:9, letterSpacing:2, borderBottom:'1px solid rgba(0,255,180,0.1)', whiteSpace:'nowrap' },
  td: { padding:'8px 10px', borderBottom:'1px solid rgba(0,255,180,0.05)', verticalAlign:'middle', color:'#cbd5e1', fontSize:11, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  badge: (st) => ({ display:'inline-block', padding:'2px 7px', borderRadius:2, fontSize:9, fontWeight:700, letterSpacing:1, color:'#030712', background: STATUS_COLOR[st] || '#64748b' }),
  input: { background:'rgba(0,255,180,0.04)', border:'1px solid rgba(0,255,180,0.18)', borderRadius:3, padding:'7px 12px', color:'#00ffb2', fontSize:11, outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  btn: (active) => ({ background: active ? 'rgba(0,255,180,0.08)' : 'transparent', border: active ? '1px solid rgba(0,255,180,0.2)' : '1px solid transparent', color: active ? '#00ffb2' : 'rgba(0,255,180,0.38)', borderRadius:4, padding:'9px 12px', cursor:'pointer', fontSize:11, letterSpacing:1, fontFamily:'inherit', width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:8, marginBottom:2, transition:'all 0.15s' }),
};

const TABS = [
  { id:'live',     icon:'⬡', label:'LIVE FEED',    color:'#ef4444' },
  { id:'overview', icon:'◈', label:'OVERVIEW',     color:'#00ffb2' },
  { id:'waitlist', icon:'📋', label:'WAITLIST',    color:'#f97316' },
  { id:'messages', icon:'✉', label:'MESSAGES',     color:'#8b5cf6' },
  { id:'threads',  icon:'⇄', label:'THREADS',      color:'#a78bfa' },
  { id:'bookings', icon:'📅', label:'BOOKINGS',    color:'#3b82f6' },
  { id:'sos',      icon:'🆘', label:'SOS',         color:'#ef4444' },
  { id:'cases',    icon:'⚖', label:'CASES',        color:'#06b6d4' },
  { id:'users',    icon:'◎', label:'USERS',        color:'#00ffb2' },
  { id:'lawyers',  icon:'⚖', label:'LAWYERS',      color:'#00ffb2' },
  { id:'lawfirms', icon:'⬢', label:'LAW FIRMS',    color:'#818cf8' },
  { id:'firmlawyers', icon:'◉', label:'FIRM LAWYERS', color:'#818cf8' },
  { id:'firmclients', icon:'◈', label:'FIRM CLIENTS', color:'#818cf8' },
  { id:'applications', icon:'◆', label:'APPLICATIONS', color:'#f59e0b' },
];

function Stat({ label, value, color='#00ffb2', sub }) {
  return (
    <div style={s.statCard}>
      <div style={{ color:'rgba(0,255,180,0.38)', fontSize:9, letterSpacing:2, marginBottom:7 }}>{label}</div>
      <div style={{ color, fontSize:26, fontWeight:700, lineHeight:1 }}>{value ?? '—'}</div>
      {sub && <div style={{ color:'rgba(0,255,180,0.3)', fontSize:10, marginTop:5 }}>{sub}</div>}
    </div>
  );
}

function Search({ value, onChange, placeholder }) {
  return <input style={{ ...s.input, width:'100%', maxWidth:380, marginBottom:14 }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder || '> search...'} />;
}

function ExpandRow({ row, cols, keyF }) {
  const [open, setOpen] = useState(false);
  return <>
    <tr onClick={()=>setOpen(o=>!o)} style={{ cursor:'pointer' }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,180,0.025)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      {cols.map((c,i)=><td key={i} style={s.td} title={c.render?'':String(row[c.key]||'')}>{c.render?c.render(row):G(row[c.key])}</td>)}
      <td style={{ ...s.td, color:'#00ffb2', fontSize:9 }}>{open?'▲':'▼'}</td>
    </tr>
    {open && <tr><td colSpan={cols.length+1} style={{ padding:0 }}>
      <div style={{ background:'rgba(0,255,180,0.018)', borderLeft:'2px solid rgba(0,255,180,0.18)', margin:'0 8px 8px', padding:14 }}>
        <pre style={{ color:'#94a3b8', fontSize:10, margin:0, whiteSpace:'pre-wrap', maxHeight:360, overflowY:'auto' }}>{JSON.stringify(row, null, 2)}</pre>
      </div>
    </td></tr>}
  </>;
}

function Table({ items, cols, search, searchKeys=[] }) {
  const filtered = search ? items.filter(r => searchKeys.some(k => String(r[k]||'').toLowerCase().includes(search.toLowerCase()))) : items;
  if (!filtered.length) return <div style={{ color:'rgba(0,255,180,0.25)', padding:'24px 0', textAlign:'center', fontSize:11 }}>NO DATA</div>;
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={s.table}>
        <thead><tr>{cols.map((c,i)=><th key={i} style={s.th}>{c.label}</th>)}<th style={s.th}>EXPAND</th></tr></thead>
        <tbody>{filtered.map((row,i)=><ExpandRow key={row.id||row._id||i} row={row} cols={cols} />)}</tbody>
      </table>
      <div style={{ color:'rgba(0,255,180,0.25)', fontSize:9, marginTop:8 }}>{filtered.length} RECORD{filtered.length!==1?'S':''}</div>
    </div>
  );
}

export default function MonitorDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState('live');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isWebsiteRestricted, setIsWebsiteRestricted] = useState(false);
  const refreshInterval = useRef(null);
  const token = localStorage.getItem(TK);
  const headers = { Authorization:`Bearer ${token}` };

  const [d, setD] = useState({ overview:null, waitlist:[], messages:[], threads:[], bookings:[], sos:[], cases:[], users:[], lawyers:[], lawFirms:[], firmLawyers:[], firmClients:[], lawyerApps:[], clientApps:[], live:[] });
  const [errors, setErrors] = useState({});

  const fetch1 = useCallback(async (key, url) => {
    const freshToken = localStorage.getItem(TK);
    if (!freshToken) { nav('/monitor-login'); return; }
    setLoading(p=>({...p,[key]:true}));
    setErrors(p=>({...p,[key]:null}));
    try {
      const r = await axios.get(`${API}${url}`, { headers: { Authorization:`Bearer ${freshToken}` } });
      setD(p=>({...p,[key]:r.data}));
    } catch(e) {
      const msg = e.response?.data?.detail || e.message || 'Failed to load';
      setErrors(p=>({...p,[key]:msg}));
      if(e.response?.status===401 || e.response?.status===403) nav('/monitor-login');
    }
    finally { setLoading(p=>({...p,[key]:false})); }
  }, [nav]);

  const fetchLive = useCallback(() => fetch1('live','/monitor/activity-feed?limit=150'), [fetch1]);
  const fetchOverview = useCallback(() => fetch1('overview','/monitor/overview'), [fetch1]);

  const fetchWebsiteStatus = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/monitor/website-status`);
      setIsWebsiteRestricted(r.data.is_restricted);
    } catch(e) {}
  }, []);

  const toggleWebsiteStatus = async () => {
    const newVal = !isWebsiteRestricted;
    if (!window.confirm(`Are you sure you want to turn ${newVal ? 'OFF' : 'ON'} the entire website?`)) return;
    try {
      const freshToken = localStorage.getItem(TK);
      await axios.post(`${API}/monitor/website-status`, { is_restricted: newVal }, { headers: { Authorization: `Bearer ${freshToken}` } });
      setIsWebsiteRestricted(newVal);
      alert(`Website is now ${newVal ? 'RESTRICTED (OFF)' : 'ACTIVE (ON)'}`);
    } catch(e) {
      alert('Failed to update website status');
    }
  };

  // Tab → URL map
  const TAB_URL = {
    waitlist:'/monitor/waitlist-full',
    messages:'/monitor/messages-full', threads:'/monitor/message-threads',
    bookings:'/monitor/bookings-full', sos:'/monitor/sos-full',
    cases:'/monitor/cases-full', users:'/monitor/users-full',
    lawyers:'/monitor/lawyers-full', lawfirms:'/monitor/law-firms-full',
    firmlawyers:'/monitor/firm-lawyers-full', firmclients:'/monitor/firm-clients-full',
  };
  const TAB_KEY = { waitlist:'waitlist', messages:'messages', threads:'threads', bookings:'bookings', sos:'sos', cases:'cases', users:'users', lawyers:'lawyers', lawfirms:'lawFirms', firmlawyers:'firmLawyers', firmclients:'firmClients' };

  useEffect(() => {
    if (!token) { nav('/monitor-login'); return; }
    fetchOverview(); fetchLive(); fetchWebsiteStatus();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => { fetchLive(); fetchOverview(); fetchWebsiteStatus(); }, 30000);
    } else clearInterval(refreshInterval.current);
    return () => clearInterval(refreshInterval.current);
  }, [autoRefresh, fetchLive, fetchOverview, fetchWebsiteStatus]);

  const handleTab = (id) => {
    setTab(id); setSearch('');
    if (id === 'live') { fetchLive(); return; }
    if (id === 'overview') { fetchOverview(); return; }
    if (id === 'applications') {
      fetch1('lawyerApps','/monitor/firm-lawyer-applications-full');
      fetch1('clientApps','/monitor/firm-client-applications-full');
      return;
    }
    const key = TAB_KEY[id];
    const url = TAB_URL[id];
    if (key && url) fetch1(key, url);
  };

  const logout = () => { localStorage.removeItem(TK); nav('/monitor-login'); };
  const ov = d.overview;

  const liveFiltered = search ? d.live.filter(e => e.summary?.toLowerCase().includes(search.toLowerCase())) : d.live;

  return (
    <div style={s.app}>
      <div style={s.grid} />
      <style>{`
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes slidein{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#030712}::-webkit-scrollbar-thumb{background:rgba(0,255,180,0.18);border-radius:2px}
      `}</style>

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={{ padding:'18px 14px', borderBottom:'1px solid rgba(0,255,180,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>🛰️</span>
            <div>
              <div style={{ color:'#00ffb2', fontSize:11, fontWeight:700, letterSpacing:2 }}>SURVEILLENCE</div>
              <div style={{ color:'rgba(0,255,180,0.35)', fontSize:8, letterSpacing:1 }}>LXWYERUP MONITOR v3</div>
            </div>
            <div style={{ marginLeft:'auto', width:8, height:8, background:'#00ffb2', borderRadius:'50%', animation:'pulse 2s infinite', boxShadow:'0 0 8px #00ffb2', flexShrink:0 }} />
          </div>
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>setAutoRefresh(a=>!a)} style={{ background: autoRefresh?'rgba(0,255,180,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${autoRefresh?'rgba(0,255,180,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:3, color: autoRefresh?'#00ffb2':'#ef4444', padding:'4px 8px', fontSize:9, letterSpacing:1, cursor:'pointer', fontFamily:'inherit' }}>
              {autoRefresh ? '⏻ LIVE ON' : '⏸ PAUSED'}
            </button>
            <span style={{ color:'rgba(0,255,180,0.25)', fontSize:8 }}>(30s refresh)</span>
          </div>
        </div>

        <nav style={{ flex:1, padding:'10px 8px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>handleTab(t.id)} style={s.btn(tab===t.id)}>
              <span style={{ width:16 }}>{t.icon}</span>
              <span>{t.label}</span>
              {loading[TAB_KEY[t.id]||t.id] && <span style={{ marginLeft:'auto', fontSize:8, color:'rgba(0,255,180,0.4)', animation:'blink 0.8s infinite' }}>•••</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(0,255,180,0.1)' }}>
          <button onClick={toggleWebsiteStatus} style={{ ...s.btn(false), marginBottom:6, justifyContent:'center', border: isWebsiteRestricted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,255,180,0.3)', color: isWebsiteRestricted ? '#ef4444' : '#00ffb2', background: isWebsiteRestricted ? 'rgba(239,68,68,0.1)' : 'rgba(0,255,180,0.1)' }}>
            {isWebsiteRestricted ? '⚠ WEBSITE OFF' : '🌐 WEBSITE ON'}
          </button>
          <button onClick={()=>{handleTab(tab); fetchOverview(); fetchLive(); fetchWebsiteStatus();}} style={{ ...s.btn(false), marginBottom:6, justifyContent:'center', border:'1px solid rgba(0,255,180,0.15)' }}>↻ REFRESH ALL</button>
          <button onClick={logout} style={{ ...s.btn(false), color:'#ef4444', borderColor:'rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)', justifyContent:'center' }}>⏻ LOGOUT</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        {/* ── LIVE FEED ── */}
        {tab==='live' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:8, height:8, background:'#ef4444', borderRadius:'50%', animation:'pulse 1s infinite', boxShadow:'0 0 8px #ef4444' }} />
              <span style={{ color:'#ef4444', fontSize:10, letterSpacing:3 }}>LIVE ACTIVITY FEED</span>
              <span style={{ color:'rgba(0,255,180,0.25)', fontSize:9, marginLeft:'auto' }}>AUTO-REFRESH EVERY 30s</span>
              <button onClick={fetchLive} style={{ background:'transparent', border:'1px solid rgba(0,255,180,0.2)', borderRadius:3, color:'#00ffb2', padding:'3px 10px', fontSize:9, cursor:'pointer', fontFamily:'inherit', letterSpacing:1 }}>↻ NOW</button>
            </div>
            <Search value={search} onChange={setSearch} placeholder="> filter activity..." />
            {loading.live ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING FEED...</div> : (
              <div>
                {liveFiltered.map((ev, i) => (
                  <div key={i} style={{ background:'rgba(0,18,38,0.6)', border:`1px solid ${ev.color || '#00ffb2'}22`, borderLeft:`3px solid ${ev.color||'#00ffb2'}`, borderRadius:4, padding:'10px 14px', marginBottom:8, animation:'slidein 0.2s ease', display:'flex', alignItems:'flex-start', gap:12 }}>
                    <span style={{ background:`${ev.color||'#00ffb2'}18`, border:`1px solid ${ev.color||'#00ffb2'}44`, borderRadius:3, padding:'2px 7px', fontSize:8, letterSpacing:1, color: ev.color||'#00ffb2', whiteSpace:'nowrap', flexShrink:0 }}>{ev.type}</span>
                    <span style={{ color:'#94a3b8', fontSize:11, flex:1 }}>{ev.summary}</span>
                    <span style={{ color:'rgba(0,255,180,0.25)', fontSize:9, whiteSpace:'nowrap', flexShrink:0 }}>{fmt(ev.time)}</span>
                  </div>
                ))}
                {!liveFiltered.length && <div style={{ color:'rgba(0,255,180,0.25)', fontSize:11, textAlign:'center', padding:24 }}>NO ACTIVITY</div>}
              </div>
            )}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:18 }}>SYSTEM OVERVIEW</div>
            {loading.overview ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : ov && <>
              <div style={{ color:'rgba(0,255,180,0.35)', fontSize:9, letterSpacing:2, marginBottom:10 }}>CORE PLATFORM</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
                <Stat label="USERS" value={ov.total_users} />
                <Stat label="LAWYERS" value={ov.total_lawyers} />
                <Stat label="BOOKINGS" value={ov.total_bookings} sub={`${ov.active_bookings} active`} />
                <Stat label="MESSAGES" value={ov.total_messages} color='#8b5cf6' />
                <Stat label="CASES" value={ov.total_cases} color='#06b6d4' />
                <Stat label="SOS ACTIVE" value={ov.sos_active} color={ov.sos_active>0?'#ef4444':'#00ffb2'} />
              </div>
              <div style={{ color:'rgba(0,255,180,0.35)', fontSize:9, letterSpacing:2, marginBottom:10 }}>FIRM ECOSYSTEM</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                <Stat label="LAW FIRMS" value={ov.total_law_firms} color='#818cf8' />
                <Stat label="FIRM LAWYERS" value={ov.total_firm_lawyers} color='#818cf8' />
                <Stat label="FIRM CLIENTS" value={ov.total_firm_clients} color='#818cf8' />
                <Stat label="PENDING LAWYER APPS" value={ov.pending_firm_lawyer_apps} color={ov.pending_firm_lawyer_apps>0?'#f59e0b':'#10b981'} />
                <Stat label="PENDING CLIENT APPS" value={ov.pending_firm_client_apps} color={ov.pending_firm_client_apps>0?'#f59e0b':'#10b981'} />
              </div>
            </>}
          </div>
        )}

        {/* ── WAITLIST (Early Access Signups) ── */}
        {tab==='waitlist' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <span style={{ color:'#f97316', fontSize:9, letterSpacing:3 }}>📋 EARLY ACCESS WAITLIST</span>
              <span style={{ marginLeft:'auto', color:'rgba(0,255,180,0.3)', fontSize:9 }}>{d.waitlist.length} SIGNUPS</span>
            </div>
            <Search value={search} onChange={setSearch} placeholder="> filter by name / email / role..." />
            {loading.waitlist ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.waitlist} search={search} searchKeys={['full_name','email','phone','role','message']}
                cols={[
                  { label:'SIGNED UP', render:r=>fmt(r.created_at) },
                  { label:'NAME', key:'full_name' },
                  { label:'EMAIL', key:'email' },
                  { label:'PHONE', key:'phone' },
                  { label:'ROLE', render:r=><span style={{ background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:2, padding:'2px 6px', fontSize:9, color:'#f97316' }}>{(r.role||'—').toUpperCase()}</span> },
                  { label:'MESSAGE', render:r=><span title={r.message||''}>{String(r.message||'—').slice(0,50)}{String(r.message||'').length>50?'…':''}</span> },
                ]} />
            )}
          </div>
        )}

        {/* ── MESSAGES (every single message) ── */}
        {tab==='messages' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>✉ ALL MESSAGES — FULL CONTENT</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by sender / content..." />
            {loading.messages ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING MESSAGES...</div> : (
              <Table items={d.messages} search={search} searchKeys={['sender_name','receiver_name','content','sender_id','receiver_id']}
                cols={[
                  { label:'TIME', render:r=>fmt(r.created_at) },
                  { label:'FROM', render:r=>`${r.sender_name||r.sender_id||'?'} (${r.sender_type||'?'})` },
                  { label:'TO', render:r=>`${r.receiver_name||r.receiver_id||'?'} (${r.receiver_type||'?'})` },
                  { label:'CONTENT', render:r=><span title={r.content||''}>{String(r.content||'').slice(0,60)}{String(r.content||'').length>60?'…':''}</span> },
                  { label:'TYPE', key:'message_type' },
                  { label:'READ', render:r=>r.is_read?'✓':'—' },
                ]} />
            )}
          </div>
        )}

        {/* ── THREADS ── */}
        {tab==='threads' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>⇄ CONVERSATION THREADS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by participant..." />
            {loading.threads ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.threads} search={search} searchKeys={['participant_1_name','participant_2_name','participant_1_type','participant_2_type']}
                cols={[
                  { label:'PARTICIPANT 1', render:r=>`${r.participant_1_name} (${r.participant_1_type})` },
                  { label:'PARTICIPANT 2', render:r=>`${r.participant_2_name} (${r.participant_2_type})` },
                  { label:'MESSAGES', key:'message_count' },
                  { label:'LAST MESSAGE', render:r=>r.last_message?String(r.last_message.content||'').slice(0,50)+'…':'—' },
                  { label:'LAST ACTIVE', render:r=>fmt(r.last_message?.created_at) },
                ]} />
            )}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab==='bookings' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>📅 ALL BOOKINGS / APPOINTMENTS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by user / lawyer / status..." />
            {loading.bookings ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.bookings} search={search} searchKeys={['user_name','lawyer_name','status','booking_type','user_email','lawyer_email']}
                cols={[
                  { label:'CLIENT', render:r=>r.user_name||r.user_id||'—' },
                  { label:'CLIENT PHONE', render:r=>r.user_phone||'—' },
                  { label:'LAWYER', render:r=>r.lawyer_name||r.lawyer_id||'—' },
                  { label:'SPECIALIZATION', render:r=>r.lawyer_specialization||'—' },
                  { label:'DATE', render:r=>fmtDate(r.booking_date||r.scheduled_date||r.date||r.created_at) },
                  { label:'TIME', render:r=>r.time_slot||r.time||'—' },
                  { label:'TYPE', key:'booking_type' },
                  { label:'AMOUNT', render:r=>r.amount?`₹${r.amount}`:'—' },
                  { label:'STATUS', render:r=><span style={s.badge(r.status)}>{(r.status||'?').toUpperCase()}</span> },
                  { label:'BOOKED ON', render:r=>fmt(r.created_at) },
                ]} />
            )}
          </div>
        )}

        {/* ── SOS ── */}
        {tab==='sos' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:8, height:8, background:'#ef4444', borderRadius:'50%', animation:'pulse 1s infinite' }} />
              <span style={{ color:'#ef4444', fontSize:9, letterSpacing:3 }}>SOS SESSIONS — ALL TIME</span>
            </div>
            <Search value={search} onChange={setSearch} placeholder="> filter by user / lawyer / status..." />
            {loading.sos ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.sos} search={search} searchKeys={['user_name','lawyer_name','status','matter_type','location']}
                cols={[
                  { label:'USER', render:r=>r.user_name||r.user_id||'—' },
                  { label:'USER PHONE', render:r=>r.user_phone||'—' },
                  { label:'LAWYER', render:r=>r.lawyer_name||r.matched_lawyer_id||'UNMATCHED' },
                  { label:'SPECIALIZATION', render:r=>r.lawyer_specialization||'—' },
                  { label:'MATTER', render:r=>r.matter_type||r.sos_matter||'—' },
                  { label:'LOCATION', key:'location' },
                  { label:'STATUS', render:r=><span style={s.badge(r.status)}>{(r.status||'?').toUpperCase()}</span> },
                  { label:'STARTED', render:r=>fmt(r.created_at) },
                  { label:'ENDED', render:r=>fmt(r.ended_at) },
                ]} />
            )}
          </div>
        )}

        {/* ── CASES ── */}
        {tab==='cases' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>⚖ ALL CASES</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by client / lawyer / type..." />
            {loading.cases ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.cases} search={search} searchKeys={['user_name','lawyer_name','case_type','title','status']}
                cols={[
                  { label:'TITLE', render:r=>r.title||r.case_title||'—' },
                  { label:'CLIENT', render:r=>r.user_name||'—' },
                  { label:'LAWYER', render:r=>r.lawyer_name||'—' },
                  { label:'TYPE', render:r=>r.case_type||r.type||'—' },
                  { label:'STATUS', render:r=><span style={s.badge(r.status||'pending')}>{(r.status||'?').toUpperCase()}</span> },
                  { label:'COURT', key:'court' },
                  { label:'NEXT HEARING', render:r=>fmtDate(r.next_hearing_date) },
                  { label:'FILED', render:r=>fmt(r.created_at) },
                ]} />
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab==='users' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>◎ REGISTERED USERS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by name / email..." />
            {loading.users ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.users} search={search} searchKeys={['full_name','email','phone']}
                cols={[
                  { label:'ID', render:r=>r.unique_id||'—' },
                  { label:'NAME', key:'full_name' },{ label:'EMAIL', key:'email' },{ label:'PHONE', key:'phone' },
                  { label:'JOINED', render:r=>fmtDate(r.created_at) },
                  { label:'BOOKINGS', render:r=>r.bookings?.length||0 },
                  { label:'CASES', render:r=>r.cases?.length||0 },
                  { label:'MESSAGES', render:r=>r.threads?.reduce((a,t)=>a+t.messages?.length||0,0)||0 },
                  { label:'SOS', render:r=>r.sos_sessions?.length||0 },
                ]} />
            )}
          </div>
        )}

        {/* ── LAWYERS ── */}
        {tab==='lawyers' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>⚖ INDEPENDENT LAWYERS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by name / specialization / state..." />
            {loading.lawyers ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.lawyers} search={search} searchKeys={['full_name','email','specialization','state','bar_council_number']}
                cols={[
                  { label:'ID', render:r=>r.unique_id||'—' },
                  { label:'NAME', key:'full_name' },{ label:'EMAIL', key:'email' },
                  { label:'SPECIALIZATION', key:'specialization' },{ label:'STATE', key:'state' },
                  { label:'BAR COUNCIL', key:'bar_council_number' },{ label:'RATING', key:'rating' },
                  { label:'TYPE', render:r=>r.application_type?.join('+') || 'normal' },
                  { label:'BOOKINGS', render:r=>r.bookings?.length||0 },
                  { label:'SOS HANDLED', render:r=>r.sos_sessions?.length||0 },
                ]} />
            )}
          </div>
        )}

        {/* ── LAW FIRMS ── */}
        {tab==='lawfirms' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>⬢ LAW FIRMS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by firm name / city..." />
            {loading.lawfirms ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.lawFirms} search={search} searchKeys={['firm_name','city','state','contact_email']}
                cols={[
                  { label:'FIRM', key:'firm_name' },{ label:'CONTACT EMAIL', key:'contact_email' },
                  { label:'CITY', key:'city' },{ label:'STATE', key:'state' },
                  { label:'REG NO', key:'registration_number' },
                  { label:'TEAM SIZE', render:r=>r.team_lawyers?.length||0 },
                  { label:'CLIENTS', render:r=>r.team_clients?.length||0 },
                  { label:'PENDING APPS', render:r=>(r.lawyer_applications?.filter(a=>a.status==='pending').length||0)+(r.client_applications?.filter(a=>a.status==='pending').length||0) },
                ]} />
            )}
          </div>
        )}

        {/* ── FIRM LAWYERS ── */}
        {tab==='firmlawyers' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>◉ FIRM LAWYERS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by name / firm..." />
            {loading.firmlawyers ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.firmLawyers} search={search} searchKeys={['full_name','email','firm_name','specialization']}
                cols={[
                  { label:'NAME', key:'full_name' },{ label:'EMAIL', key:'email' },
                  { label:'FIRM', key:'firm_name' },{ label:'SPECIALIZATION', key:'specialization' },
                  { label:'EXP', render:r=>r.experience_years?`${r.experience_years}yr`:'—' },
                  { label:'STATUS', render:r=><span style={s.badge(r.is_active!==false?'active':'inactive')}>{r.is_active!==false?'ACTIVE':'INACTIVE'}</span> },
                  { label:'TASKS', render:r=>r.tasks?.length||0 },
                  { label:'CLIENTS', render:r=>r.assigned_clients?.length||0 },
                ]} />
            )}
          </div>
        )}

        {/* ── FIRM CLIENTS ── */}
        {tab==='firmclients' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:12 }}>◈ FIRM CLIENTS</div>
            <Search value={search} onChange={setSearch} placeholder="> filter by name / firm / case type..." />
            {loading.firmclients ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
              <Table items={d.firmClients} search={search} searchKeys={['full_name','email','law_firm_name','case_type']}
                cols={[
                  { label:'NAME', key:'full_name' },{ label:'EMAIL', key:'email' },{ label:'PHONE', key:'phone' },
                  { label:'LAW FIRM', key:'law_firm_name' },{ label:'CASE TYPE', key:'case_type' },
                  { label:'LAWYER', key:'assigned_lawyer_name' },
                  { label:'STATUS', render:r=><span style={s.badge(r.status||'pending')}>{(r.status||'?').toUpperCase()}</span> },
                  { label:'UPDATES', render:r=>r.case_updates?.length||0 },
                  { label:'JOINED', render:r=>fmtDate(r.created_at) },
                ]} />
            )}
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {tab==='applications' && (
          <div>
            <div style={{ color:'rgba(0,255,180,0.4)', fontSize:9, letterSpacing:3, marginBottom:16 }}>◆ ALL FIRM APPLICATIONS</div>
            <div style={s.card}>
              <div style={{ color:'#f59e0b', fontSize:10, letterSpacing:2, marginBottom:12 }}>FIRM LAWYER APPLICATIONS ({d.lawyerApps?.length||0})</div>
              <Search value={search} onChange={setSearch} placeholder="> filter..." />
              {loading.lawyerApps ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
                <Table items={d.lawyerApps||[]} search={search} searchKeys={['full_name','email','firm_name','specialization','status']}
                  cols={[
                    { label:'NAME', key:'full_name' },{ label:'EMAIL', key:'email' },
                    { label:'FIRM', key:'firm_name' },{ label:'SPECIALIZATION', key:'specialization' },
                    { label:'EXP', render:r=>r.experience_years?`${r.experience_years}yr`:'—' },
                    { label:'BAR COUNCIL', key:'bar_council_number' },
                    { label:'STATUS', render:r=><span style={s.badge(r.status||'pending')}>{(r.status||'?').toUpperCase()}</span> },
                    { label:'APPLIED', render:r=>fmt(r.created_at) },
                  ]} />
              )}
            </div>
            <div style={s.card}>
              <div style={{ color:'#06b6d4', fontSize:10, letterSpacing:2, marginBottom:12 }}>FIRM CLIENT APPLICATIONS ({d.clientApps?.length||0})</div>
              {loading.clientApps ? <div style={{ color:'rgba(0,255,180,0.3)', fontSize:11 }}>LOADING...</div> : (
                <Table items={d.clientApps||[]} search={''} searchKeys={[]}
                  cols={[
                    { label:'NAME', key:'full_name' },{ label:'EMAIL', key:'email' },{ label:'PHONE', key:'phone' },
                    { label:'LAW FIRM', key:'law_firm_name' },{ label:'CASE TYPE', key:'case_type' },
                    { label:'STATUS', render:r=><span style={s.badge(r.status||'pending')}>{(r.status||'?').toUpperCase()}</span> },
                    { label:'APPLIED', render:r=>fmt(r.created_at) },
                  ]} />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
