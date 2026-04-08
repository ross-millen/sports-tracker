import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const P = {
  blue: '#1e3a8a',
  blueLight: '#2563eb',
  blueMuted: 'rgba(30,58,138,0.4)',
  blueFaint: 'rgba(30,58,138,0.08)',
  surface: '#ffffff',
  surfaceAlt: '#f0f5ff',
  text: '#0f2044',
  textMuted: 'rgba(15,32,68,0.45)',
  textFaint: 'rgba(15,32,68,0.25)',
}

const pushupStyles = `
  @keyframes puFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes puShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .pu-fade-up { animation: puFadeUp 0.5s ease forwards; }
  .pu-fade-up-delay { animation: puFadeUp 0.5s ease 0.1s both; }
  .pu-fade-up-delay-2 { animation: puFadeUp 0.5s ease 0.2s both; }

  .pu-nav-btn {
    flex: 1; padding: 14px; background: transparent;
    color: rgba(15,32,68,0.3); border: none; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase; font-size: 0.68em;
    transition: all 0.3s ease; position: relative;
  }
  .pu-nav-btn:hover { color: #1e3a8a; }
  .pu-nav-btn.active { color: #1e3a8a; background: rgba(30,58,138,0.05); }
  .pu-nav-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%;
    height: 2px; background: #1e3a8a;
  }

  .pu-input {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(30,58,138,0.2);
    color: #0f2044; font-family: 'Montserrat', sans-serif;
    font-size: 0.9em; font-weight: 400; transition: border-color 0.3s ease; outline: none;
  }
  .pu-input:focus { border-bottom-color: #2563eb; }
  .pu-input::placeholder { color: rgba(15,32,68,0.2); font-weight: 300; }

  .pu-inline-input {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(30,58,138,0.25); color: #0f2044;
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
  }
  .pu-inline-input:focus { border-bottom-color: #2563eb; }

  .pu-save-btn {
    width: 100%; padding: 15px; background: #1e3a8a; color: #f0f5ff;
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 600;
    font-size: 0.7em; letter-spacing: 4px; text-transform: uppercase;
    margin-top: 10px; transition: all 0.3s ease;
  }
  .pu-save-btn:hover {
    background: #1e40af; letter-spacing: 5px;
    box-shadow: 0 4px 20px rgba(30,58,138,0.25);
  }

  .pu-card {
    border-left: 2px solid rgba(30,58,138,0.15);
    padding: 16px 20px; margin-bottom: 12px;
    transition: all 0.3s ease; background: white;
    border-radius: 0 4px 4px 0; animation: puFadeUp 0.4s ease forwards;
  }
  .pu-card:hover {
    border-left-color: #2563eb;
    box-shadow: 0 2px 16px rgba(30,58,138,0.08);
  }

  .pu-edit-btn {
    background: none; border: 1px solid rgba(30,58,138,0.25);
    color: #1e3a8a; padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .pu-edit-btn:hover { background: #1e3a8a; color: white; }

  .pu-cancel-btn {
    background: none; border: 1px solid rgba(15,32,68,0.15);
    color: rgba(15,32,68,0.4); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease; margin-right: 8px;
  }
  .pu-cancel-btn:hover { background: rgba(15,32,68,0.04); }

  .pu-delete-btn {
    background: none; border: 1px solid rgba(30,58,138,0.2);
    color: rgba(30,58,138,0.45); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .pu-delete-btn:hover { background: #1e3a8a; color: white; border-color: #1e3a8a; }

  .pu-kpi-shimmer {
    background: linear-gradient(90deg, #1e3a8a, #3b82f6, #1e3a8a);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: puShimmer 3s linear infinite;
  }

  .pu-bar-segment {
    transition: opacity 0.2s ease; cursor: pointer;
  }
  .pu-bar-segment:hover { opacity: 0.75; }

  .pu-tooltip {
    position: fixed; background: #0f2044; color: white;
    padding: 8px 12px; border-radius: 3px; font-size: 0.7em;
    font-family: 'Montserrat', sans-serif; letter-spacing: 1px;
    pointer-events: none; z-index: 1000; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`

const BAR_COLORS = [
  '#1e3a8a', '#7aaad4', '#85b4d4', '#90bfcd',
  '#7a9ec4', '#8aaabf', '#7ab0c9', '#80b8d4'
]

function PushupDonutChart({ entries }) {
  const [tooltip, setTooltip] = useState(null)
  if (entries.length === 0) return (
    <p style={{ color: P.textFaint, fontSize: '0.75em', letterSpacing: '2px' }}>Not enough data yet.</p>
  )

  const total = entries.reduce((s, e) => s + e.value, 0)
  const R = 80, cx = 110, cy = 95, stroke = 28
  let cumAngle = -Math.PI / 2

  const slices = entries.map((entry, i) => {
    const frac = entry.value / total
    const angle = frac * 2 * Math.PI
    const startAngle = cumAngle
    cumAngle += angle
    return { label: entry.label, value: entry.value, color: BAR_COLORS[i % BAR_COLORS.length], startAngle, endAngle: cumAngle, frac }
  })

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 220 190" style={{ width: '180px', flexShrink: 0 }}>
          {slices.map((s, i) => {
            const x1 = cx + R * Math.cos(s.startAngle)
            const y1 = cy + R * Math.sin(s.startAngle)
            const x2 = cx + R * Math.cos(s.endAngle)
            const y2 = cy + R * Math.sin(s.endAngle)
            const large = s.frac > 0.5 ? 1 : 0
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                onMouseOver={e => { e.target.style.opacity = '0.8' }}
                onMouseOut={e => { e.target.style.opacity = '1' }}
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, s })}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}
          {slices.map((s, i) => {
            const inner = R - stroke / 2, outer = R + stroke / 2
            return (
              <line key={i}
                x1={cx + inner * Math.cos(s.startAngle)} y1={cy + inner * Math.sin(s.startAngle)}
                x2={cx + outer * Math.cos(s.startAngle)} y2={cy + outer * Math.sin(s.startAngle)}
                stroke="black" strokeWidth="1.5"
              />
            )
          })}
          <circle cx={cx} cy={cy} r={R - stroke / 2} fill="none" stroke="black" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={R + stroke / 2} fill="none" stroke="black" strokeWidth="1.5" />
          <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fill: P.text, fontWeight: 600 }}>
            {total.toLocaleString()}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: 'Montserrat', fontSize: '7px', fill: P.text, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
            REPS
          </text>
        </svg>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: '100px' }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7em', color: P.text, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '0.5em', color: P.textMuted, letterSpacing: '1px', fontFamily: 'Montserrat' }}>
                  {s.value.toLocaleString()} reps
                </div>
              </div>
              <div style={{ fontSize: '0.6em', color: P.textMuted, fontFamily: 'Montserrat', fontWeight: 600 }}>
                {Math.round(s.frac * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="pu-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
          {tooltip.s.label} — {tooltip.s.value.toLocaleString()} reps
        </div>
      )}
    </div>
  )
}

function PushupBarChart({ entries }) {
  const [tooltip, setTooltip] = useState(null)
  if (entries.length === 0) return (
    <p style={{ color: P.textFaint, fontSize: '0.75em', letterSpacing: '2px' }}>Not enough data yet.</p>
  )

  const maxVal = Math.max(...entries.map(e => e.value))
  const chartHeight = 160

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: `${chartHeight + 40}px`, padding: '0 4px' }}>
        {entries.map((entry, i) => {
          const barH = Math.max(8, (entry.value / maxVal) * chartHeight)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.58em', color: '#1a1a1a', marginBottom: '6px', fontFamily: 'Montserrat', letterSpacing: '1px' }}>
                {entry.value}
              </div>
              <div
                className="pu-bar-segment"
                style={{
                  width: '100%', height: `${barH}px`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                  borderRadius: '3px 3px 0 0',
                  animation: `puFadeUp 0.6s ease ${i * 0.1}s both`,
                }}
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, entry })}
                onMouseLeave={() => setTooltip(null)}
              />
              <div style={{
                fontSize: '0.55em', color: '#1a1a1a', marginTop: '8px',
                fontFamily: 'Montserrat', letterSpacing: '1px', textTransform: 'uppercase',
                textAlign: 'center', maxWidth: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700,
              }}>
                {entry.label}
              </div>
            </div>
          )
        })}
      </div>
      {tooltip && (
        <div className="pu-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
          {tooltip.entry.label} — {tooltip.entry.value} reps{tooltip.entry.target ? ` · ${tooltip.entry.target}` : ''}
        </div>
      )}
    </div>
  )
}

export default function PushupTracker({ onBack }) {
  const [page, setPage] = useState('log')
  const [date, setDate] = useState('')
  const [target, setTarget] = useState('')
  const [count, setCount] = useState('')
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editCount, setEditCount] = useState('')

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('pushup_sessions')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setSessions(data)
  }

  useEffect(() => {
    if (page === 'history') fetchSessions()
  }, [page])

  const handleSubmit = async () => {
    if (!date || !count) { alert('Please fill in at least date and count'); return }
    const { error } = await supabase
      .from('pushup_sessions')
      .insert([{ date, target: target || null, count: parseInt(count) }])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setDate(''); setTarget(''); setCount('')
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditDate(s.date || '')
    setEditTarget(s.target || '')
    setEditCount(s.count || '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditDate(''); setEditTarget(''); setEditCount('')
  }

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this session?')) return
    const { error } = await supabase.from('pushup_sessions').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('pushup_sessions')
      .update({ date: editDate, target: editTarget || null, count: parseInt(editCount) })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalReps = sessions.reduce((sum, s) => sum + (parseInt(s.count) || 0), 0)
  const bestSetSession = sessions.reduce((best, s) => (parseInt(s.count) || 0) > (parseInt(best?.count) || 0) ? s : best, null)
  const bestSet = bestSetSession?.count || 0
  const bestSetDate = bestSetSession ? formatUKDate(bestSetSession.date) : ''

  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b > a ? 1 : -1)
  const localDate = (offset = 0) => {
    const d = new Date(); d.setDate(d.getDate() + offset)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const today = localDate(0)
  const yesterday = localDate(-1)
  let streak = 0
  if (uniqueDates.length && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
    let cur = new Date(uniqueDates[0] + 'T12:00:00')
    for (const d of uniqueDates) {
      const curStr = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`
      if (d === curStr) {
        streak++
        cur.setDate(cur.getDate() - 1)
      } else break
    }
  }

  const byTarget = {}
  sessions.forEach(s => {
    const raw = s.target ? s.target.trim() : ''
    const key = raw.toLowerCase() || 'unspecified'
    if (!byTarget[key]) byTarget[key] = { label: raw || 'Unspecified', reps: 0, sessions: 0 }
    byTarget[key].reps += parseInt(s.count) || 0
    byTarget[key].sessions += 1
  })
  const repsByTarget = Object.values(byTarget)
    .sort((a, b) => b.reps - a.reps)
    .map(v => ({ label: v.label, value: v.reps }))
  const sessionsByTarget = Object.values(byTarget)
    .sort((a, b) => b.sessions - a.sessions)
    .map(v => ({ label: v.label, value: v.sessions }))

  const labelStyle = {
    fontSize: '0.58em', letterSpacing: '3px', color: P.textMuted,
    textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500,
    fontFamily: 'Montserrat',
  }

  const editLabelStyle = {
    fontSize: '0.6em', letterSpacing: '2px', color: P.textFaint,
    textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat',
  }

  return (
    <>
      <style>{pushupStyles}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Back link */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: P.textMuted, fontSize: '0.6em', letterSpacing: '3px',
              textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500,
              padding: 0,
            }}
          >
            ← Ross' Tracker
          </button>
        </div>

        {/* Title */}
        <div className="pu-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8em, 6vw, 2.8em)',
            fontWeight: 300, color: P.blue,
            letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1,
          }}>Pushup Log</h2>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, ${P.blue}, transparent)`, margin: '14px auto' }} />
        </div>

        {/* Nav */}
        <div className="pu-fade-up-delay" style={{
          display: 'flex', border: '1px solid rgba(30,58,138,0.15)', borderRadius: '2px',
          marginBottom: '40px', overflow: 'hidden', background: 'white',
          boxShadow: '0 2px 12px rgba(30,58,138,0.06)',
        }}>
          <button className={`pu-nav-btn ${page === 'log' ? 'active' : ''}`} onClick={() => setPage('log')}>Log Session</button>
          <div style={{ width: '1px', background: 'rgba(30,58,138,0.1)' }} />
          <button className={`pu-nav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
        </div>

        {/* Log Page */}
        {page === 'log' && (
          <div className="pu-fade-up-delay-2" style={{
            background: 'white', borderRadius: '4px', padding: '32px',
            boxShadow: '0 2px 20px rgba(30,58,138,0.06)', border: '1px solid rgba(30,58,138,0.08)',
          }}>
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: P.blueMuted, textTransform: 'uppercase', marginBottom: '28px', fontWeight: 600 }}>New Session</div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Date</div>
              <input className="pu-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Target Area <span style={{ opacity: 0.5 }}>(optional)</span></div>
              <input className="pu-input" type="text" placeholder="Chest, triceps, shoulders..." value={target} onChange={e => setTarget(e.target.value)} />
            </div>

            <div style={{ marginBottom: '36px' }}>
              <div style={labelStyle}>Count</div>
              <input className="pu-input" type="number" placeholder="82" value={count} onChange={e => setCount(e.target.value)} />
            </div>

            <button className="pu-save-btn" onClick={handleSubmit}>Record Session</button>

            {saved && (
              <div style={{
                marginTop: '16px', padding: '12px', border: `1px solid rgba(30,58,138,0.15)`,
                borderRadius: '2px', textAlign: 'center', color: P.blue,
                fontSize: '0.65em', letterSpacing: '3px', textTransform: 'uppercase',
                animation: 'puFadeUp 0.4s ease', background: P.blueFaint,
              }}>✦ Session Recorded</div>
            )}
          </div>
        )}

        {/* History Page */}
        {page === 'history' && (
          <div className="pu-fade-up-delay-2">
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: P.blueMuted, textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>Session Archive</div>

            {sessions.length > 0 && (
              <>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Total Reps', value: totalReps.toLocaleString() },
                    { label: 'Sessions', value: sessions.length },
                    { label: 'Best Set', value: bestSet, sub: bestSetDate },
                    { label: 'Day Streak', value: streak },
                  ].map(kpi => (
                    <div key={kpi.label} style={{
                      padding: '16px 12px', background: 'white', border: '1px solid rgba(30,58,138,0.1)',
                      borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(30,58,138,0.05)',
                    }}>
                      <div style={{ fontSize: '0.5em', letterSpacing: '2px', color: P.textFaint, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500, fontFamily: 'Montserrat' }}>{kpi.label}</div>
                      <div className="pu-kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7em', fontWeight: 600 }}>{kpi.value}</div>
                      {kpi.sub && <div style={{ fontSize: '0.5em', letterSpacing: '1px', color: P.textFaint, marginTop: '6px', fontFamily: 'Montserrat' }}>{kpi.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Count chart */}
                <div style={{
                  background: 'white', border: '1px solid rgba(30,58,138,0.08)',
                  borderRadius: '4px', padding: '24px', marginBottom: '28px',
                  boxShadow: '0 2px 12px rgba(30,58,138,0.05)',
                }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: P.blueMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>
                    Reps by Target Area
                  </div>
                  <PushupDonutChart entries={repsByTarget} />
                </div>

                <div style={{
                  background: 'white', border: '1px solid rgba(30,58,138,0.08)',
                  borderRadius: '4px', padding: '24px', marginBottom: '28px',
                  boxShadow: '0 2px 12px rgba(30,58,138,0.05)',
                }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: P.blueMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>
                    Sessions by Target Area
                  </div>
                  <PushupBarChart entries={sessionsByTarget} />
                </div>
              </>
            )}

            {/* Timeline */}
            {sessions.length === 0 ? (
              <p style={{ color: P.textFaint, fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No sessions recorded yet.</p>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '28px' }}>
                <div style={{
                  position: 'absolute', left: '7px', top: '8px', bottom: '8px',
                  width: '1px', background: 'linear-gradient(to bottom, #1e3a8a, rgba(30,58,138,0.1))',
                }} />
                {sessions.map((session, i) => (
                  <div key={session.id} style={{ position: 'relative', marginBottom: '20px', animation: `puFadeUp 0.4s ease ${i * 0.06}s both` }}>
                    <div style={{
                      position: 'absolute', left: '-24px', top: '42px',
                      width: '9px', height: '9px', borderRadius: '50%',
                      background: editingId === session.id ? P.blue : 'white',
                      border: `2px solid ${P.blue}`,
                      boxShadow: `0 0 0 3px rgba(30,58,138,0.08)`,
                    }} />
                    {editingId === session.id ? (
                      <div style={{
                        background: 'white', borderRadius: '4px', padding: '20px',
                        border: `1px solid rgba(30,58,138,0.15)`, boxShadow: '0 2px 16px rgba(30,58,138,0.08)',
                      }}>
                        <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: P.blueMuted, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Date</div>
                          <input className="pu-inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Target Area</div>
                          <input className="pu-inline-input" type="text" value={editTarget} onChange={e => setEditTarget(e.target.value)} placeholder="Optional" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={editLabelStyle}>Count</div>
                          <input className="pu-inline-input" type="number" value={editCount} onChange={e => setEditCount(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button className="pu-delete-btn" onClick={() => deleteSession(session.id)}>Delete</button>
                          <div>
                            <button className="pu-cancel-btn" onClick={cancelEdit}>Cancel</button>
                            <button className="pu-edit-btn" onClick={() => saveEdit(session.id)}>Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: 'white', borderRadius: '4px', padding: '16px 20px',
                        border: '1px solid rgba(30,58,138,0.07)',
                        boxShadow: '0 1px 8px rgba(30,58,138,0.05)',
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                      }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(30,58,138,0.1)'; e.currentTarget.style.borderColor = 'rgba(30,58,138,0.2)' }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(30,58,138,0.05)'; e.currentTarget.style.borderColor = 'rgba(30,58,138,0.07)' }}
                      >
                        <div style={{ fontSize: '0.52em', letterSpacing: '2px', color: P.blueMuted, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                          {formatUKDate(session.date)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3em', color: P.text, fontWeight: 600, marginBottom: '6px', lineHeight: 1.1 }}>
                              {session.count} reps
                            </div>
                            {session.target && (
                              <span style={{ color: P.textMuted, fontSize: '0.62em', letterSpacing: '2px', textTransform: 'uppercase' }}>{session.target}</span>
                            )}
                          </div>
                          <button className="pu-edit-btn" onClick={() => startEdit(session)}>Edit</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
