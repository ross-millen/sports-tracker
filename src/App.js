import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import PushupTracker from './PushupTracker'
import GuinnessLog from './GuinnessLog'

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f5f0eb; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #f5f0eb; }
  ::-webkit-scrollbar-thumb { background: #8b0000; border-radius: 2px; }

  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: none; opacity: 0.5; cursor: pointer;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .fade-up { animation: fadeUp 0.5s ease forwards; }
  .fade-up-delay { animation: fadeUp 0.5s ease 0.1s both; }
  .fade-up-delay-2 { animation: fadeUp 0.5s ease 0.2s both; }

  .nav-btn {
    flex: 1; padding: 14px; background: transparent;
    color: rgba(80,20,20,0.4); border: none; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase; font-size: 0.68em;
    transition: all 0.3s ease; position: relative;
  }
  .nav-btn:hover { color: #8b0000; }
  .nav-btn.active { color: #8b0000; background: rgba(139,0,0,0.04); }
  .nav-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%;
    height: 2px; background: #8b0000;
  }

  .save-btn {
    width: 100%; padding: 15px; background: #8b0000; color: #f5f0eb;
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 600;
    font-size: 0.7em; letter-spacing: 4px; text-transform: uppercase;
    margin-top: 10px; transition: all 0.3s ease;
  }
  .save-btn:hover {
    background: #6b0000; letter-spacing: 5px;
    box-shadow: 0 4px 20px rgba(139,0,0,0.25);
  }

  .input-field {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(139,0,0,0.2);
    color: #2a0a0a; font-family: 'Montserrat', sans-serif;
    font-size: 0.9em; font-weight: 400; transition: border-color 0.3s ease; outline: none;
  }
  .input-field:focus { border-bottom-color: #8b0000; }
  .input-field::placeholder { color: rgba(80,20,20,0.25); font-weight: 300; }
  .input-field:disabled { color: rgba(80,20,20,0.4); cursor: not-allowed; }

  .session-card {
    border-left: 2px solid rgba(139,0,0,0.2);
    padding: 16px 20px; margin-bottom: 12px;
    transition: all 0.3s ease; background: white;
    border-radius: 0 4px 4px 0; animation: fadeUp 0.4s ease forwards;
  }
  .session-card:hover {
    border-left-color: #8b0000;
    box-shadow: 0 2px 16px rgba(139,0,0,0.08);
  }

  .edit-btn {
    background: none; border: 1px solid rgba(139,0,0,0.25);
    color: #8b0000; padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .edit-btn:hover { background: #8b0000; color: white; }

  .cancel-btn {
    background: none; border: 1px solid rgba(80,20,20,0.2);
    color: rgba(80,20,20,0.5); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease; margin-right: 8px;
  }
  .cancel-btn:hover { background: rgba(80,20,20,0.05); }

  .delete-btn {
    background: none; border: 1px solid rgba(139,0,0,0.25);
    color: rgba(139,0,0,0.5); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .delete-btn:hover { background: #8b0000; color: white; border-color: #8b0000; }

  .kpi-shimmer {
    background: linear-gradient(90deg, #8b0000, #cc2200, #8b0000);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }

  .inline-input {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(139,0,0,0.3); color: #2a0a0a;
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
  }
  .inline-input:focus { border-bottom-color: #8b0000; }

  .bar-segment {
    transition: opacity 0.2s ease; cursor: pointer;
  }
  .bar-segment:hover { opacity: 0.75; }

  .tooltip {
    position: fixed; background: #2a0a0a; color: white;
    padding: 8px 12px; border-radius: 3px; font-size: 0.7em;
    font-family: 'Montserrat', sans-serif; letter-spacing: 1px;
    pointer-events: none; z-index: 1000; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .auto-fill-hint {
    font-size: 0.6em; color: #8b0000; letter-spacing: 1px;
    margin-top: 6px; font-family: 'Montserrat', sans-serif;
    animation: fadeUp 0.3s ease;
  }
`

const COLORS = [
  '#c4756b', '#d4956a', '#c9a97a', '#8fa88a',
  '#7a9aad', '#9b8aad', '#b8956a', '#7a8a7a'
]

const LOCATION_RULES = {
  'schroders': 'Old Street',
  'caine': 'Whitechapel',
}

function DonutChart({ data }) {
  const [tooltip, setTooltip] = useState(null)
  const entries = Object.entries(data).sort((a, b) => b[1].minutes - a[1].minutes)
  if (entries.length === 0) return null

  const total = entries.reduce((s, [, v]) => s + v.minutes, 0)
  const R = 80, cx = 110, cy = 95, stroke = 28
  let cumAngle = -Math.PI / 2

  const slices = entries.map(([name, val], i) => {
    const frac = val.minutes / total
    const angle = frac * 2 * Math.PI
    const x1 = cx + R * Math.cos(cumAngle)
    const y1 = cy + R * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + R * Math.cos(cumAngle)
    const y2 = cy + R * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    const midAngle = cumAngle - angle / 2
    return { name, val, color: COLORS[i % COLORS.length], x1, y1, x2, y2, large, midAngle, frac }
  })

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 220 190" style={{ width: 'min(180px, 45vw)', flexShrink: 0 }}>
          {slices.map((s, i) => {
            const startAngle = i === 0 ? -Math.PI / 2 : slices.slice(0, i).reduce((a, sl) => a + sl.frac * 2 * Math.PI, -Math.PI / 2)
            const endAngle = startAngle + s.frac * 2 * Math.PI
            const x1 = cx + R * Math.cos(startAngle)
            const y1 = cy + R * Math.sin(startAngle)
            const x2 = cx + R * Math.cos(endAngle)
            const y2 = cy + R * Math.sin(endAngle)
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
            const boundaryAngle = i === 0 ? -Math.PI / 2 : slices.slice(0, i).reduce((a, sl) => a + sl.frac * 2 * Math.PI, -Math.PI / 2)
            const inner = R - stroke / 2, outer = R + stroke / 2
            return (
              <line key={i}
                x1={cx + inner * Math.cos(boundaryAngle)} y1={cy + inner * Math.sin(boundaryAngle)}
                x2={cx + outer * Math.cos(boundaryAngle)} y2={cy + outer * Math.sin(boundaryAngle)}
                stroke="black" strokeWidth="1.5"
              />
            )
          })}
          <circle cx={cx} cy={cy} r={R - stroke / 2} fill="none" stroke="black" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={R + stroke / 2} fill="none" stroke="black" strokeWidth="1.5" />
          <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fill: '#2a0a0a', fontWeight: 600 }}>
            {Math.floor(total / 60)}h
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: 'Montserrat', fontSize: '7px', fill: '#1a1a1a', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
            TOTAL
          </text>
        </svg>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: '100px' }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7em', color: '#2a0a0a', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: '0.5em', color: 'rgba(80,20,20,0.4)', letterSpacing: '1px', fontFamily: 'Montserrat' }}>
                  {Math.floor(s.val.minutes / 60)}h {s.val.minutes % 60}m · {s.val.count} session{s.val.count !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ fontSize: '0.6em', color: 'rgba(80,20,20,0.4)', fontFamily: 'Montserrat', fontWeight: 600 }}>
                {Math.round(s.frac * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
          {tooltip.s.name} — {tooltip.s.val.count} session{tooltip.s.val.count !== 1 ? 's' : ''} · {Math.floor(tooltip.s.val.minutes / 60)}h {tooltip.s.val.minutes % 60}m
        </div>
      )}
    </div>
  )
}

function BarChart({ data, tooltipFormatter }) {
  const [tooltip, setTooltip] = useState(null)
  const entries = Object.entries(data).sort((a, b) => b[1].minutes - a[1].minutes)
  if (entries.length === 0) return <p style={{ color: 'rgba(80,20,20,0.3)', fontSize: '0.75em', letterSpacing: '2px' }}>Not enough data yet.</p>

  const maxVal = Math.max(...entries.map(([, v]) => v.minutes || 0))
  const chartHeight = 160

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${chartHeight + 40}px`, padding: '0 4px' }}>
        {entries.map(([name, data], i) => {
          const val = data.minutes || 0
          const barH = Math.max(8, (val / maxVal) * chartHeight)
          const label = `${Math.floor(data.minutes / 60)}h${data.minutes % 60}m`
          return (
            <div key={name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.58em', color: '#1a1a1a', marginBottom: '6px', fontFamily: 'Montserrat', letterSpacing: '1px' }}>
                {label}
              </div>
              <div
                className="bar-segment"
                style={{
                  width: '100%', height: `${barH}px`,
                  background: COLORS[i % COLORS.length],
                  borderRadius: '3px 3px 0 0',
                  animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
                }}
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, name, data })}
                onMouseLeave={() => setTooltip(null)}
              />
              <div style={{
                fontSize: '0.55em', color: '#1a1a1a', marginTop: '8px', fontWeight: 700,
                fontFamily: 'Montserrat', letterSpacing: '1px', textTransform: 'uppercase',
                textAlign: 'center', maxWidth: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {name}
              </div>
            </div>
          )
        })}
      </div>
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
          {tooltipFormatter(tooltip.name, tooltip.data)}
        </div>
      )}
    </div>
  )
}

function App() {
  const [tracker, setTracker] = useState('sports')
  const [page, setPage] = useState('log')
  const [sportName, setSportName] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [location, setLocation] = useState('')
  const [locationAutoFilled, setLocationAutoFilled] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editSport, setEditSport] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editLocation, setEditLocation] = useState('')

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setSessions(data)
  }

  useEffect(() => {
    if (page === 'history') fetchSessions()
  }, [page])

  const handleSportChange = (value) => {
    setSportName(value)
    const rule = LOCATION_RULES[value.toLowerCase().trim()]
    if (rule) {
      setLocation(rule)
      setLocationAutoFilled(true)
    } else {
      if (locationAutoFilled) {
        setLocation('')
        setLocationAutoFilled(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!sportName || !date || !duration) { alert('Please fill in all fields'); return }
    const { error } = await supabase
      .from('sessions')
      .insert([{ type: 'sport', sport_name: sportName, date, duration_mins: duration, location }])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setSportName(''); setDate(''); setDuration(''); setLocation(''); setLocationAutoFilled(false)
    }
  }

  const startEdit = (session) => {
    setEditingId(session.id)
    setEditSport(session.sport_name)
    setEditDate(session.date || '')
    setEditDuration(session.duration_mins)
    setEditLocation(session.location || '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditSport(''); setEditDate(''); setEditDuration(''); setEditLocation('')
  }

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this session?')) return
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('sessions')
      .update({ sport_name: editSport, date: editDate, duration_mins: editDuration, location: editLocation })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + (parseInt(s.duration_mins) || 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  const activityData = {}
  sessions.forEach(s => {
    const key = s.sport_name || 'Unknown'
    if (!activityData[key]) activityData[key] = { minutes: 0, count: 0 }
    activityData[key].minutes += parseInt(s.duration_mins) || 0
    activityData[key].count += 1
  })

  const locationData = {}
  sessions.filter(s => s.location).forEach(s => {
    const key = s.location
    if (!locationData[key]) locationData[key] = { minutes: 0, count: 0 }
    locationData[key].minutes += parseInt(s.duration_mins) || 0
    locationData[key].count += 1
  })

  const labelStyle = {
    fontSize: '0.58em', letterSpacing: '3px', color: 'rgba(80,20,20,0.45)',
    textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500
  }

  const editLabelStyle = {
    fontSize: '0.6em', letterSpacing: '2px', color: 'rgba(80,20,20,0.4)',
    textTransform: 'uppercase', marginBottom: '4px'
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f5f0eb 0%, #ede4d8 100%)',
        padding: '0 20px 60px',
        fontFamily: "'Montserrat', sans-serif",
        overflowX: 'hidden',
      }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', padding: 'clamp(24px, 6vw, 50px) 0 40px' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8em, 7vw, 3.5em)',
            fontWeight: 300, color: '#8b0000',
            letterSpacing: 'clamp(3px, 2vw, 8px)', textTransform: 'uppercase', lineHeight: 1,
          }}>Ross' Tracker</h1>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #8b0000, transparent)', margin: '16px auto' }} />
          <p style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.6em', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 500 }}>
            Performance & Training Log
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Pushups', key: 'pushups' },
              { label: 'Guinness', key: 'guinness' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setTracker(item.key)}
                style={{
                  background: 'none', border: '1px solid rgba(139,0,0,0.2)', cursor: 'pointer',
                  color: 'rgba(80,20,20,0.5)', fontSize: '0.58em', letterSpacing: '3px',
                  textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500,
                  padding: '8px 18px', borderRadius: '2px', transition: 'all 0.3s ease',
                }}
                onMouseOver={e => { e.target.style.background = '#8b0000'; e.target.style.color = '#f5f0eb' }}
                onMouseOut={e => { e.target.style.background = 'none'; e.target.style.color = 'rgba(80,20,20,0.5)' }}
              >
                {item.label} →
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {tracker === 'pushups' && <PushupTracker onBack={() => setTracker('sports')} />}
          {tracker === 'guinness' && <GuinnessLog onBack={() => setTracker('sports')} />}
          {tracker === 'sports' && (<>

          {/* Nav */}
          <div className="fade-up-delay" style={{
            display: 'flex', border: '1px solid rgba(139,0,0,0.15)', borderRadius: '2px',
            marginBottom: '40px', overflow: 'hidden', background: 'white',
            boxShadow: '0 2px 12px rgba(139,0,0,0.06)',
          }}>
            <button className={`nav-btn ${page === 'log' ? 'active' : ''}`} onClick={() => setPage('log')}>Log Session</button>
            <div style={{ width: '1px', background: 'rgba(139,0,0,0.1)' }} />
            <button className={`nav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
          </div>

          {/* Log Page */}
          {page === 'log' && (
            <div className="fade-up-delay-2" style={{
              background: 'white', borderRadius: '4px', padding: '32px',
              boxShadow: '0 2px 20px rgba(139,0,0,0.06)', border: '1px solid rgba(139,0,0,0.08)',
            }}>
              <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', marginBottom: '28px', fontWeight: 600 }}>New Session</div>

              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Sport / Activity</div>
                <input className="input-field" type="text" placeholder="Football, Tennis, Schroders..." value={sportName} onChange={e => handleSportChange(e.target.value)} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Date</div>
                <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Duration (minutes)</div>
                <input className="input-field" type="number" placeholder="90" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>

              <div style={{ marginBottom: '36px' }}>
                <div style={labelStyle}>Location <span style={{ opacity: 0.5 }}>(optional)</span></div>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Emirates Stadium, Local gym..."
                  value={location}
                  disabled={locationAutoFilled}
                  onChange={e => setLocation(e.target.value)}
                />
                {locationAutoFilled && (
                  <div className="auto-fill-hint">✦ Auto-filled based on activity</div>
                )}
              </div>

              <button className="save-btn" onClick={handleSubmit}>Record Session</button>

              {saved && (
                <div style={{
                  marginTop: '16px', padding: '12px', border: '1px solid rgba(139,0,0,0.15)',
                  borderRadius: '2px', textAlign: 'center', color: '#8b0000',
                  fontSize: '0.65em', letterSpacing: '3px', textTransform: 'uppercase',
                  animation: 'fadeUp 0.4s ease', background: 'rgba(139,0,0,0.03)',
                }}>✦ Session Recorded</div>
              )}
            </div>
          )}

          {/* History Page */}
          {page === 'history' && (
            <div className="fade-up-delay-2">
              <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>Session Archive</div>

              {sessions.length > 0 && (
                <>
                  {/* KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { label: 'Total Time', value: `${totalHours}h ${remainingMins}m` },
                      { label: 'Sessions', value: sessions.length },
                    ].map(kpi => (
                      <div key={kpi.label} style={{
                        padding: '20px', background: 'white', border: '1px solid rgba(139,0,0,0.1)',
                        borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
                      }}>
                        <div style={{ fontSize: '0.55em', letterSpacing: '2px', color: 'rgba(80,20,20,0.35)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>{kpi.label}</div>
                        <div className="kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9em', fontWeight: 600 }}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Chart */}
                  <div style={{
                    background: 'white', border: '1px solid rgba(139,0,0,0.08)',
                    borderRadius: '4px', padding: '24px', marginBottom: '16px',
                    boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
                  }}>
                    <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>
                      Time by Activity
                    </div>
                    <DonutChart data={activityData} />
                  </div>

                  {/* Location Chart */}
                  {Object.keys(locationData).length > 0 && (
                    <div style={{
                      background: 'white', border: '1px solid rgba(139,0,0,0.08)',
                      borderRadius: '4px', padding: '24px', marginBottom: '28px',
                      boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
                    }}>
                      <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>
                        Time by Location
                      </div>
                      <BarChart
                        data={locationData}
                        tooltipFormatter={(name, d) => `${name} — ${d.count} session${d.count !== 1 ? 's' : ''} · ${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m`}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Timeline */}
              {sessions.length === 0 ? (
                <p style={{ color: 'rgba(80,20,20,0.3)', fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No sessions recorded yet.</p>
              ) : (
                <div style={{ position: 'relative', paddingLeft: '28px' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute', left: '7px', top: '8px', bottom: '8px',
                    width: '1px', background: 'linear-gradient(to bottom, #8b0000, rgba(139,0,0,0.1))',
                  }} />

                  {sessions.map((session, i) => (
                    <div key={session.id} style={{ position: 'relative', marginBottom: '20px', animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                      {/* Dot on the line */}
                      <div style={{
                        position: 'absolute', left: '-24px', top: '42px',
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: editingId === session.id ? '#8b0000' : 'white',
                        border: '2px solid #8b0000',
                        boxShadow: '0 0 0 3px rgba(139,0,0,0.08)',
                      }} />

                      {editingId === session.id ? (
                        <div style={{
                          background: 'white', borderRadius: '4px', padding: '20px',
                          border: '1px solid rgba(139,0,0,0.15)', boxShadow: '0 2px 16px rgba(139,0,0,0.08)',
                        }}>
                          <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>

                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Sport / Activity</div>
                            <input className="inline-input" value={editSport} onChange={e => setEditSport(e.target.value)} />
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Date</div>
                            <input className="inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Duration (minutes)</div>
                            <input className="inline-input" type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)} />
                          </div>
                          <div style={{ marginBottom: '16px' }}>
                            <div style={editLabelStyle}>Location</div>
                            <input className="inline-input" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Optional" />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="delete-btn" onClick={() => deleteSession(session.id)}>Delete</button>
                            <div>
                              <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                              <button className="edit-btn" onClick={() => saveEdit(session.id)}>Save</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: 'white', borderRadius: '4px', padding: '16px 20px',
                          border: '1px solid rgba(139,0,0,0.07)',
                          boxShadow: '0 1px 8px rgba(139,0,0,0.05)',
                          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                        }}
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(139,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.2)' }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(139,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.07)' }}
                        >
                          {/* Date stamp above card */}
                          <div style={{ fontSize: '0.52em', letterSpacing: '2px', color: 'rgba(139,0,0,0.4)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                            {formatUKDate(session.date)}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3em', color: '#2a0a0a', fontWeight: 600, marginBottom: '6px', lineHeight: 1.1 }}>
                                {session.sport_name}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.62em', letterSpacing: '2px', textTransform: 'uppercase' }}>{session.duration_mins} min</span>
                                {session.location && (
                                  <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.62em', letterSpacing: '2px', textTransform: 'uppercase' }}>· {session.location}</span>
                                )}
                              </div>
                            </div>
                            <button className="edit-btn" onClick={() => startEdit(session)}>Edit</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </>)}
        </div>
      </div>
    </>
  )
}

export default App