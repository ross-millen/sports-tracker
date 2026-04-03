import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const pushupStyles = `
  .pu-bar-segment {
    transition: opacity 0.2s ease; cursor: pointer;
  }
  .pu-bar-segment:hover { opacity: 0.75; }
`

const COLORS = [
  '#8b0000', '#cc2200', '#e85d04', '#f48c06',
  '#606c38', '#283618', '#386641', '#1d3557'
]

function PushupBarChart({ entries }) {
  const [tooltip, setTooltip] = useState(null)
  if (entries.length === 0) return (
    <p style={{ color: 'rgba(80,20,20,0.3)', fontSize: '0.75em', letterSpacing: '2px' }}>Not enough data yet.</p>
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
              <div style={{ fontSize: '0.58em', color: 'rgba(80,20,20,0.5)', marginBottom: '6px', fontFamily: 'Montserrat', letterSpacing: '1px' }}>
                {entry.value}
              </div>
              <div
                className="pu-bar-segment"
                style={{
                  width: '100%', height: `${barH}px`,
                  background: COLORS[i % COLORS.length],
                  borderRadius: '3px 3px 0 0',
                  animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
                }}
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, entry })}
                onMouseLeave={() => setTooltip(null)}
              />
              <div style={{
                fontSize: '0.55em', color: 'rgba(80,20,20,0.5)', marginTop: '8px',
                fontFamily: 'Montserrat', letterSpacing: '1px', textTransform: 'uppercase',
                textAlign: 'center', maxWidth: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.label}
              </div>
            </div>
          )
        })}
      </div>
      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
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
  const bestSet = sessions.reduce((max, s) => Math.max(max, parseInt(s.count) || 0), 0)

  const chartEntries = [...sessions]
    .sort((a, b) => a.date > b.date ? 1 : -1)
    .slice(-10)
    .map(s => ({ label: formatUKDate(s.date), value: parseInt(s.count) || 0, target: s.target }))

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
      <style>{pushupStyles}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Back link */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(80,20,20,0.45)', fontSize: '0.6em', letterSpacing: '3px',
              textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500,
              padding: 0, display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            ← Sports Tracker
          </button>
        </div>

        {/* Title */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8em, 6vw, 2.8em)',
            fontWeight: 300, color: '#8b0000',
            letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1,
          }}>Pushup Log</h2>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #8b0000, transparent)', margin: '14px auto' }} />
        </div>

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
              <div style={labelStyle}>Date</div>
              <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Target Area <span style={{ opacity: 0.5 }}>(optional)</span></div>
              <input className="input-field" type="text" placeholder="Chest, triceps, shoulders..." value={target} onChange={e => setTarget(e.target.value)} />
            </div>

            <div style={{ marginBottom: '36px' }}>
              <div style={labelStyle}>Count</div>
              <input className="input-field" type="number" placeholder="82" value={count} onChange={e => setCount(e.target.value)} />
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Total Reps', value: totalReps.toLocaleString() },
                    { label: 'Sessions', value: sessions.length },
                    { label: 'Best Set', value: bestSet },
                  ].map(kpi => (
                    <div key={kpi.label} style={{
                      padding: '16px 12px', background: 'white', border: '1px solid rgba(139,0,0,0.1)',
                      borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
                    }}>
                      <div style={{ fontSize: '0.5em', letterSpacing: '2px', color: 'rgba(80,20,20,0.35)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>{kpi.label}</div>
                      <div className="kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7em', fontWeight: 600 }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Count chart */}
                <div style={{
                  background: 'white', border: '1px solid rgba(139,0,0,0.08)',
                  borderRadius: '4px', padding: '24px', marginBottom: '28px',
                  boxShadow: '0 2px 12px rgba(139,0,0,0.05)',
                }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>
                    Reps per Session
                  </div>
                  <PushupBarChart entries={chartEntries} />
                </div>
              </>
            )}

            {/* Session list */}
            {sessions.length === 0 ? (
              <p style={{ color: 'rgba(80,20,20,0.3)', fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No sessions recorded yet.</p>
            ) : (
              sessions.map((session, i) => (
                <div key={session.id} className="session-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  {editingId === session.id ? (
                    <div>
                      <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: 'rgba(139,0,0,0.5)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={editLabelStyle}>Date</div>
                        <input className="inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={editLabelStyle}>Target Area</div>
                        <input className="inline-input" type="text" value={editTarget} onChange={e => setEditTarget(e.target.value)} placeholder="Optional" />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={editLabelStyle}>Count</div>
                        <input className="inline-input" type="number" value={editCount} onChange={e => setEditCount(e.target.value)} />
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
                          {session.count} reps
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.65em', letterSpacing: '2px', textTransform: 'uppercase' }}>{formatUKDate(session.date)}</span>
                          {session.target && (
                            <span style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.65em', letterSpacing: '2px', textTransform: 'uppercase' }}>{session.target}</span>
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
    </>
  )
}
