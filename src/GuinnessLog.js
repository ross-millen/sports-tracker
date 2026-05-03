import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const G = {
  bg: '#0d0c0b',
  surface: '#1c1a17',
  surfaceAlt: '#252219',
  gold: '#c9a452',
  goldMuted: 'rgba(201,164,82,0.4)',
  goldFaint: 'rgba(201,164,82,0.12)',
  cream: '#f5ecd7',
  creamMuted: 'rgba(245,236,215,0.5)',
  creamFaint: 'rgba(245,236,215,0.15)',
}

function GuinnessLineChart({ sessions, formatUKDate }) {
  const [tooltip, setTooltip] = useState(null)
  const byDay = {}
  for (const s of sessions) {
    byDay[s.date] = (byDay[s.date] || 0) + (parseInt(s.count) || 0)
  }
  const points = Object.keys(byDay)
    .sort()
    .map(date => ({ date: formatUKDate(date), value: byDay[date] }))

  if (points.length < 2) return null

  const W = 400, H = 120, padX = 8, padY = 12
  const maxVal = Math.max(...points.map(p => p.value))
  const minVal = Math.min(...points.map(p => p.value))
  const range = maxVal - minVal || 1

  const x = i => padX + (i / (points.length - 1)) * (W - padX * 2)
  const y = v => padY + (1 - (v - minVal) / range) * (H - padY * 2)

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const areaPath = `${linePath} L ${x(points.length - 1)} ${H} L ${x(0)} ${H} Z`

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="guGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G.gold} stopOpacity="0.3" />
            <stop offset="100%" stopColor={G.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#guGrad)" />
        <path d={linePath} fill="none" stroke={G.gold} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const cx = x(i), cy = y(p.value)
          const labelY = cy - 8 < padY + 4 ? cy + 14 : cy - 8
          return (
            <g key={i}>
              <circle
                cx={cx} cy={cy} r="3"
                fill={G.gold} stroke={G.surface} strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, p })}
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                x={cx} y={labelY}
                textAnchor="middle"
                fill={G.gold}
                fontSize="8"
                fontFamily="Montserrat"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {p.value}
              </text>
            </g>
          )
        })}
      </svg>
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 40,
          background: '#0d0c0b', color: G.cream, padding: '8px 12px',
          borderRadius: '3px', fontSize: '0.7em', fontFamily: 'Montserrat',
          letterSpacing: '1px', pointerEvents: 'none', zIndex: 1000,
          whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          border: `1px solid ${G.goldFaint}`,
        }}>
          {tooltip.p.date} — {tooltip.p.value} pints
        </div>
      )}
    </div>
  )
}

const BUBBLE_COLORS = [
  '#c9a452', '#8faa5a', '#4a90a4', '#c4756b',
  '#7b68b0', '#d4956a', '#6aab7a', '#c9607a',
]

function GoldBubbleChart({ data }) {
  const [tooltip, setTooltip] = useState(null)
  const entries = Object.values(data).sort((a, b) => b.pints - a.pints)
  const maxPints = entries.length > 0 ? entries[0].pints : 1
  const sizes = entries.map(e => Math.round(80 + Math.sqrt(e.pints / maxPints) * 35))

  if (entries.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
        {entries.map((e, i) => {
          const d = sizes[i]
          const fontSize = Math.max(9, Math.floor(d * 0.11))
          return (
            <div
              key={e.label}
              style={{
                width: `${d}px`, height: `${d}px`,
                borderRadius: '50%',
                background: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                opacity: 0.9, flexShrink: 0,
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                cursor: 'default', userSelect: 'none',
              }}
              onMouseMove={ev => setTooltip({ x: ev.clientX, y: ev.clientY, e })}
              onMouseLeave={() => setTooltip(null)}
            >
              <div style={{
                fontSize: `${fontSize}px`,
                color: G.bg, fontFamily: 'Montserrat', fontWeight: 700,
                letterSpacing: '0.5px', textAlign: 'center', lineHeight: 1.25,
                maxWidth: `${Math.floor(d * 0.78)}px`, overflowWrap: 'break-word',
              }}>
                {e.label}
              </div>
              <div style={{
                fontSize: `${Math.max(7, Math.floor(fontSize * 0.85))}px`,
                color: 'rgba(13,12,11,0.65)', fontFamily: 'Montserrat',
                fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px',
              }}>
                {e.pints}p
              </div>
            </div>
          )
        })}
      </div>
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 40,
          background: G.bg, color: G.cream, padding: '8px 12px',
          borderRadius: '3px', fontSize: '0.7em', fontFamily: 'Montserrat',
          letterSpacing: '1px', pointerEvents: 'none', zIndex: 1000,
          whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          border: `1px solid ${G.goldFaint}`,
        }}>
          {tooltip.e.label} — {tooltip.e.pints} pint{tooltip.e.pints !== 1 ? 's' : ''} · {tooltip.e.sessions} session{tooltip.e.sessions !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

const guinnessStyles = `
  @keyframes guFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes guShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .gu-fade-up { animation: guFadeUp 0.5s ease forwards; }
  .gu-fade-up-delay { animation: guFadeUp 0.5s ease 0.1s both; }
  .gu-fade-up-delay-2 { animation: guFadeUp 0.5s ease 0.2s both; }

  .gu-nav-btn {
    flex: 1; padding: 14px; background: transparent;
    color: rgba(245,236,215,0.3); border: none; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase; font-size: 0.68em;
    transition: all 0.3s ease; position: relative;
  }
  .gu-nav-btn:hover { color: ${G.gold}; }
  .gu-nav-btn.active { color: ${G.gold}; background: ${G.goldFaint}; }
  .gu-nav-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%;
    height: 2px; background: ${G.gold};
  }

  .gu-input {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(201,164,82,0.25);
    color: ${G.cream}; font-family: 'Montserrat', sans-serif;
    font-size: 0.9em; font-weight: 400; transition: border-color 0.3s ease; outline: none;
    color-scheme: dark;
  }
  .gu-input:focus { border-bottom-color: ${G.gold}; }
  .gu-input::placeholder { color: rgba(245,236,215,0.2); font-weight: 300; }

  .gu-inline-input {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(201,164,82,0.3); color: ${G.cream};
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
    color-scheme: dark;
  }
  .gu-inline-input:focus { border-bottom-color: ${G.gold}; }

  .gu-save-btn {
    width: 100%; padding: 15px; background: ${G.gold}; color: ${G.bg};
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 700;
    font-size: 0.7em; letter-spacing: 4px; text-transform: uppercase;
    margin-top: 10px; transition: all 0.3s ease;
  }
  .gu-save-btn:hover {
    background: #e0b85a; letter-spacing: 5px;
    box-shadow: 0 4px 20px rgba(201,164,82,0.3);
  }

  .gu-card {
    border-left: 2px solid rgba(201,164,82,0.2);
    padding: 16px 20px; margin-bottom: 12px;
    transition: all 0.3s ease; background: ${G.surface};
    border-radius: 0 4px 4px 0; animation: guFadeUp 0.4s ease forwards;
  }
  .gu-card:hover {
    border-left-color: ${G.gold};
    box-shadow: 0 2px 16px rgba(201,164,82,0.08);
  }

  .gu-edit-btn {
    background: none; border: 1px solid rgba(201,164,82,0.3);
    color: ${G.gold}; padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .gu-edit-btn:hover { background: ${G.gold}; color: ${G.bg}; }

  .gu-cancel-btn {
    background: none; border: 1px solid rgba(245,236,215,0.15);
    color: rgba(245,236,215,0.4); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease; margin-right: 8px;
  }
  .gu-cancel-btn:hover { background: rgba(245,236,215,0.05); }

  .gu-delete-btn {
    background: none; border: 1px solid rgba(245,236,215,0.15);
    color: rgba(245,236,215,0.3); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .gu-delete-btn:hover { background: rgba(245,236,215,0.08); color: ${G.cream}; }

  .gu-kpi-shimmer {
    background: linear-gradient(90deg, ${G.gold}, #f0d080, ${G.gold});
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: guShimmer 3s linear infinite;
  }
`

export default function GuinnessLog({ onBack }) {
  const [page, setPage] = useState('log')
  const [date, setDate] = useState('')
  const [count, setCount] = useState('')
  const [location, setLocation] = useState('')
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const [editDate, setEditDate] = useState('')
  const [editCount, setEditCount] = useState('')
  const [editLocation, setEditLocation] = useState('')

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('guinness_sessions')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setSessions(data)
  }

  useEffect(() => {
    if (page === 'history') fetchSessions()
  }, [page])

  const handleSubmit = async () => {
    if (!date || !count) { alert('Please fill in date and count'); return }
    const { error } = await supabase
      .from('guinness_sessions')
      .insert([{ date, count: parseInt(count), location: location || null }])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setDate(''); setCount(''); setLocation('')
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditDate(s.date || '')
    setEditCount(s.count || '')
    setEditLocation(s.location || '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditDate(''); setEditCount(''); setEditLocation('')
  }

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    const { error } = await supabase.from('guinness_sessions').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('guinness_sessions')
      .update({ date: editDate, count: parseInt(editCount), location: editLocation || null })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalPints = sessions.reduce((sum, s) => sum + (parseInt(s.count) || 0), 0)

  const pintsByDate = {}
  sessions.forEach(s => {
    if (!s.date) return
    pintsByDate[s.date] = (pintsByDate[s.date] || 0) + (parseInt(s.count) || 0)
  })
  const bestDayEntry = Object.entries(pintsByDate).reduce((best, [date, pints]) => pints > (best?.pints || 0) ? { date, pints } : best, null)
  const bestDay = bestDayEntry?.pints || 0
  const bestDayDate = bestDayEntry ? formatUKDate(bestDayEntry.date) : ''

  const locationData = {}
  sessions.filter(s => s.location).forEach(s => {
    const key = s.location.trim().toLowerCase()
    const label = s.location.trim()
    if (!locationData[key]) locationData[key] = { label, pints: 0, sessions: 0 }
    locationData[key].pints += parseInt(s.count) || 0
    locationData[key].sessions += 1
  })

  const labelStyle = {
    fontSize: '0.58em', letterSpacing: '3px', color: G.creamMuted,
    textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500,
    fontFamily: 'Montserrat',
  }

  const editLabelStyle = {
    fontSize: '0.6em', letterSpacing: '2px', color: 'rgba(245,236,215,0.4)',
    textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat',
  }

  return (
    <>
      <style>{guinnessStyles}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* Back link */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={onBack}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(80,20,20,0.45)', fontSize: '0.6em', letterSpacing: '3px',
                textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500,
                padding: 0,
              }}
            >
              ← home
            </button>
          </div>

          {/* Title */}
          <div className="gu-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.8em, 6vw, 2.8em)',
              fontWeight: 300, color: G.gold,
              letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1,
            }}>Guinness Log</h2>
            <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, ${G.gold}, transparent)`, margin: '14px auto' }} />
            <p style={{ color: G.creamMuted, fontSize: '0.58em', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500 }}>
              Settled & Logged
            </p>
          </div>

          {/* Nav */}
          <div className="gu-fade-up-delay" style={{
            display: 'flex', border: `1px solid rgba(201,164,82,0.2)`, borderRadius: '2px',
            marginBottom: '40px', overflow: 'hidden', background: G.surface,
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}>
            <button className={`gu-nav-btn ${page === 'log' ? 'active' : ''}`} onClick={() => setPage('log')}>Log Session</button>
            <div style={{ width: '1px', background: 'rgba(201,164,82,0.15)' }} />
            <button className={`gu-nav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
          </div>

          {/* Log Page */}
          {page === 'log' && (
            <div className="gu-fade-up-delay-2" style={{
              background: G.surface, borderRadius: '4px', padding: '32px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.3)', border: `1px solid rgba(201,164,82,0.1)`,
            }}>
              <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: G.goldMuted, textTransform: 'uppercase', marginBottom: '28px', fontWeight: 600 }}>New Entry</div>

              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Date</div>
                <input className="gu-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Pints</div>
                <input className="gu-input" type="number" placeholder="4" value={count} onChange={e => setCount(e.target.value)} />
              </div>

              <div style={{ marginBottom: '36px' }}>
                <div style={labelStyle}>Location <span style={{ opacity: 0.5 }}>(optional)</span></div>
                <input className="gu-input" type="text" placeholder="The Harp, Covent Garden..." value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              <button className="gu-save-btn" onClick={handleSubmit}>Record Session</button>

              {saved && (
                <div style={{
                  marginTop: '16px', padding: '12px', border: `1px solid ${G.goldFaint}`,
                  borderRadius: '2px', textAlign: 'center', color: G.gold,
                  fontSize: '0.65em', letterSpacing: '3px', textTransform: 'uppercase',
                  animation: 'guFadeUp 0.4s ease', background: G.goldFaint,
                }}>✦ Session Recorded</div>
              )}
            </div>
          )}

          {/* History Page */}
          {page === 'history' && (
            <div className="gu-fade-up-delay-2">
              <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: G.goldMuted, textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>Archive</div>

              {sessions.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                  {[
                    { label: 'Total Pints', value: totalPints },
                    { label: 'Best Day', value: bestDay, sub: bestDayDate },
                  ].map(kpi => (
                    <div key={kpi.label} style={{
                      padding: '20px', background: G.surface, border: `1px solid rgba(201,164,82,0.12)`,
                      borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }}>
                      <div style={{ fontSize: '0.55em', letterSpacing: '2px', color: 'rgba(245,236,215,0.3)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500, fontFamily: 'Montserrat' }}>{kpi.label}</div>
                      <div className="gu-kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9em', fontWeight: 600 }}>{kpi.value}</div>
                      {kpi.sub && <div style={{ fontSize: '0.5em', letterSpacing: '1px', color: 'rgba(245,236,215,0.3)', marginTop: '6px', fontFamily: 'Montserrat' }}>{kpi.sub}</div>}
                    </div>
                  ))}
                </div>
              )}

              {sessions.length >= 2 && (
                <div style={{
                  background: G.surface, border: `1px solid rgba(201,164,82,0.1)`,
                  borderRadius: '4px', padding: '24px', marginBottom: '28px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: G.goldMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>
                    Pints Over Time
                  </div>
                  <GuinnessLineChart sessions={sessions} formatUKDate={formatUKDate} />
                </div>
              )}

              {Object.keys(locationData).length > 0 && (
                <div style={{
                  background: G.surface, border: `1px solid rgba(201,164,82,0.1)`,
                  borderRadius: '4px', padding: '24px', marginBottom: '28px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: G.goldMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>
                    Locations
                  </div>
                  <GoldBubbleChart data={locationData} />
                </div>
              )}

              {sessions.length === 0 ? (
                <p style={{ color: 'rgba(245,236,215,0.2)', fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No sessions recorded yet.</p>
              ) : (
                <>
                  <button onClick={() => setLogsOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(201,164,82,0.08)', border: '1px solid rgba(201,164,82,0.2)', borderRadius: '4px', cursor: 'pointer', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '0.62em', letterSpacing: '4px', color: 'rgba(201,164,82,0.9)', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'Montserrat' }}>Entries</span>
                    <span style={{ fontSize: '0.8em', color: 'rgba(201,164,82,0.9)', fontFamily: 'Montserrat', display: 'inline-block', transform: logsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                  </button>
                  {logsOpen && <div style={{ position: 'relative', paddingLeft: '28px' }}>
                  <div style={{
                    position: 'absolute', left: '7px', top: '8px', bottom: '8px',
                    width: '1px', background: `linear-gradient(to bottom, ${G.gold}, rgba(201,164,82,0.1))`,
                  }} />
                  {sessions.map((session, i) => (
                    <div key={session.id} style={{ position: 'relative', marginBottom: '20px', animation: `guFadeUp 0.4s ease ${i * 0.06}s both` }}>
                      <div style={{
                        position: 'absolute', left: '-24px', top: '42px',
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: editingId === session.id ? G.gold : G.surface,
                        border: `2px solid ${G.gold}`,
                        boxShadow: `0 0 0 3px ${G.goldFaint}`,
                      }} />
                      {editingId === session.id ? (
                        <div style={{
                          background: G.surface, borderRadius: '4px', padding: '20px',
                          border: `1px solid rgba(201,164,82,0.2)`, boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                        }}>
                          <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: G.goldMuted, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Date</div>
                            <input className="gu-inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Pints</div>
                            <input className="gu-inline-input" type="number" value={editCount} onChange={e => setEditCount(e.target.value)} />
                          </div>
                          <div style={{ marginBottom: '16px' }}>
                            <div style={editLabelStyle}>Location</div>
                            <input className="gu-inline-input" type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Optional" />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="gu-delete-btn" onClick={() => deleteSession(session.id)}>Delete</button>
                            <div>
                              <button className="gu-cancel-btn" onClick={cancelEdit}>Cancel</button>
                              <button className="gu-edit-btn" onClick={() => saveEdit(session.id)}>Save</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: G.surface, borderRadius: '4px', padding: '16px 20px',
                          border: `1px solid rgba(201,164,82,0.08)`,
                          boxShadow: '0 1px 8px rgba(0,0,0,0.15)',
                          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                        }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor = `rgba(201,164,82,0.25)` }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.15)'; e.currentTarget.style.borderColor = `rgba(201,164,82,0.08)` }}
                        >
                          <div style={{ fontSize: '0.52em', letterSpacing: '2px', color: G.goldMuted, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                            {formatUKDate(session.date)}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3em', color: G.cream, fontWeight: 600, lineHeight: 1.1 }}>
                                {session.count} pints
                              </div>
                              {session.location && (
                                <div style={{ color: G.creamMuted, fontSize: '0.62em', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '6px' }}>{session.location}</div>
                              )}
                            </div>
                            <button className="gu-edit-btn" onClick={() => startEdit(session)}>Edit</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>}
                </>
              )}
            </div>
          )}
      </div>
    </>
  )
}
