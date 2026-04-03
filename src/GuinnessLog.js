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
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editCount, setEditCount] = useState('')

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
      .insert([{ date, count: parseInt(count) }])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setDate(''); setCount('')
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditDate(s.date || '')
    setEditCount(s.count || '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditDate(''); setEditCount('')
  }

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    const { error } = await supabase.from('guinness_sessions').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('guinness_sessions')
      .update({ date: editDate, count: parseInt(editCount) })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalPints = sessions.reduce((sum, s) => sum + (parseInt(s.count) || 0), 0)
  const bestSessionEntry = sessions.reduce((best, s) => (parseInt(s.count) || 0) > (parseInt(best?.count) || 0) ? s : best, null)
  const bestSession = bestSessionEntry?.count || 0
  const bestSessionDate = bestSessionEntry ? formatUKDate(bestSessionEntry.date) : ''

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
              ← Ross' Tracker
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

              <div style={{ marginBottom: '36px' }}>
                <div style={labelStyle}>Pints</div>
                <input className="gu-input" type="number" placeholder="4" value={count} onChange={e => setCount(e.target.value)} />
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
                    { label: 'Best Session', value: bestSession, sub: bestSessionDate },
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

              {sessions.length === 0 ? (
                <p style={{ color: 'rgba(245,236,215,0.2)', fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No sessions recorded yet.</p>
              ) : (
                sessions.map((session, i) => (
                  <div key={session.id} className="gu-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    {editingId === session.id ? (
                      <div>
                        <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: G.goldMuted, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Date</div>
                          <input className="gu-inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <div style={editLabelStyle}>Pints</div>
                          <input className="gu-inline-input" type="number" value={editCount} onChange={e => setEditCount(e.target.value)} />
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25em', color: G.cream, fontWeight: 600, marginBottom: '6px' }}>
                            {session.count} pints
                          </div>
                          <span style={{ color: G.creamMuted, fontSize: '0.65em', letterSpacing: '2px', textTransform: 'uppercase' }}>{formatUKDate(session.date)}</span>
                        </div>
                        <button className="gu-edit-btn" onClick={() => startEdit(session)}>Edit</button>
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
