import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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
  '#8b0000', '#cc2200', '#e85d04', '#f48c06',
  '#606c38', '#283618', '#386641', '#1d3557'
]

const LOCATION_RULES = {
  'schroders': 'Old Street',
  'caine': 'Whitechapel',
}

function BarChart({ data, tooltipFormatter }) {
  const [tooltip, setTooltip] = useState(null)
  const entries = Object.entries(data).sort((a, b) => b[1].minutes - a[1].minutes)
  if (entries.length === 0) return <p style={{ color: 'rgba(80,20,20,0.3)', fontSize: '0.75em', letterSpacing: '2px' }}>Not enough data yet.</p>

  const maxVal = Math.max(...entries.map(([, v]) => v.minutes || 0))
  const chartHeight = 160

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: `${chartHeight + 40}px`, padding: '0 4px' }}>
        {entries.map(([name, data], i) => {
          const val = data.minutes || 0
          const barH = Math.max(8, (val / maxVal) * chartHeight)
          const label = `${Math.floor(data.minutes / 60)}h${data.minutes % 60}m`
          return (
            <div key={name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.58em', color: 'rgba(80,20,20,0.5)', marginBottom: '6px', fontFamily: 'Montserrat', letterSpacing: '1px' }}>
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
                fontSize: '0.55em', color: 'rgba(80,20,20,0.5)', marginTop: '8px',
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
      }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', padding: '50px 0 40px' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.2em, 7vw, 3.5em)',
            fontWeight: 300, color: '#8b0000',
            letterSpacing: '8px', textTransform: 'uppercase', lineHeight: 1,
          }}>Ross' Sports Tracker</h1>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #8b0000, transparent)', margin: '16px auto' }} />
          <p style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.6em', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 500 }}>
            Performance & Training Log
          </p>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

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
                    <BarChart
                      data={activityData}
                      tooltipFormatter={(name, d) => `${name} — ${d.count} session${d.count !== 1 ? 's' : ''} · ${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m`}
                    />
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

              {/* Session List */}
              {sessions.length === 0 ? (
                <p style={{ color: 'rgba(80,20,20,0.3)', fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No sessions recorded yet.</p>
              ) : (
                sessions.map((session, i) => (
                  <div key={session.id} className="session-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    {editingId === session.id ? (
                      <div>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25em', color: '#2a0a0a', fontWeight: 600, marginBottom: '6px' }}>
                            {session.sport_name}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.65em', letterSpacing: '2px', textTransform: 'uppercase' }}>{formatUKDate(session.date)}</span>
                            <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.65em', letterSpacing: '2px', textTransform: 'uppercase' }}>{session.duration_mins} min</span>
                            {session.location && (
                              <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.65em', letterSpacing: '2px', textTransform: 'uppercase' }}>📍 {session.location}</span>
                            )}
                          </div>
                        </div>
                        <button className="edit-btn" onClick={() => startEdit(session)}>Edit</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App