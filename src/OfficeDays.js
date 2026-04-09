import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const O = {
  green: '#1a5c38',
  greenLight: '#2d7a4f',
  greenMuted: 'rgba(26,92,56,0.4)',
  greenFaint: 'rgba(26,92,56,0.08)',
  surface: '#ffffff',
  text: '#0f2a1c',
  textMuted: 'rgba(15,42,28,0.45)',
  textFaint: 'rgba(15,42,28,0.25)',
}

const officeStyles = `
  @keyframes ofFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes ofShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes ofSlideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ofSlideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .of-fade-up { animation: ofFadeUp 0.5s ease forwards; }
  .of-fade-up-delay { animation: ofFadeUp 0.5s ease 0.1s both; }
  .of-fade-up-delay-2 { animation: ofFadeUp 0.5s ease 0.2s both; }

  .of-nav-btn {
    flex: 1; padding: 14px; background: transparent;
    color: rgba(15,42,28,0.3); border: none; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase; font-size: 0.68em;
    transition: all 0.3s ease; position: relative;
  }
  .of-nav-btn:hover { color: #1a5c38; }
  .of-nav-btn.active { color: #1a5c38; background: rgba(26,92,56,0.05); }
  .of-nav-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%;
    height: 2px; background: #1a5c38;
  }

  .of-input {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(26,92,56,0.2);
    color: #0f2a1c; font-family: 'Montserrat', sans-serif;
    font-size: 0.9em; font-weight: 400; transition: border-color 0.3s ease; outline: none;
  }
  .of-input:focus { border-bottom-color: #2d7a4f; }
  .of-input::placeholder { color: rgba(15,42,28,0.2); font-weight: 300; }

  .of-inline-input {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(26,92,56,0.25); color: #0f2a1c;
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
  }
  .of-inline-input:focus { border-bottom-color: #2d7a4f; }

  .of-save-btn {
    width: 100%; padding: 15px; background: #1a5c38; color: #f0f7f3;
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 600;
    font-size: 0.7em; letter-spacing: 4px; text-transform: uppercase;
    margin-top: 10px; transition: all 0.3s ease;
  }
  .of-save-btn:hover {
    background: #14472c; letter-spacing: 5px;
    box-shadow: 0 4px 20px rgba(26,92,56,0.25);
  }

  .of-edit-btn {
    background: none; border: 1px solid rgba(26,92,56,0.25);
    color: #1a5c38; padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .of-edit-btn:hover { background: #1a5c38; color: white; }

  .of-cancel-btn {
    background: none; border: 1px solid rgba(15,42,28,0.15);
    color: rgba(15,42,28,0.4); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease; margin-right: 8px;
  }
  .of-cancel-btn:hover { background: rgba(15,42,28,0.04); }

  .of-delete-btn {
    background: none; border: 1px solid rgba(26,92,56,0.2);
    color: rgba(26,92,56,0.45); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .of-delete-btn:hover { background: #1a5c38; color: white; border-color: #1a5c38; }

  .of-kpi-shimmer {
    background: linear-gradient(90deg, #1a5c38, #4a9e6e, #1a5c38);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: ofShimmer 3s linear infinite;
  }
`

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['M','T','W','T','F','S','S']

function OfficeHeatmap({ sessions }) {
  const officeDates = new Set(sessions.map(s => s.date))
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const START_MONTH = 3 // April (0-indexed)
  const months = []
  for (let m = START_MONTH; m <= now.getMonth(); m++) months.push(m)

  const [idx, setIdx] = useState(months.length - 1)
  const [dir, setDir] = useState(null) // 'left' | 'right'
  const [animKey, setAnimKey] = useState(0)

  const navigate = (direction) => {
    const nextIdx = direction === 'right' ? Math.min(idx + 1, months.length - 1) : Math.max(idx - 1, 0)
    if (nextIdx === idx) return
    setDir(direction)
    setAnimKey(k => k + 1)
    setIdx(nextIdx)
  }

  const month = months[idx]

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const getWeeks = (year, m) => {
    const firstDay = new Date(year, m, 1)
    const lastDay = new Date(year, m + 1, 0)
    const offset = (firstDay.getDay() || 7) - 1 // days back to Monday
    const weeks = []
    const cur = new Date(firstDay)
    cur.setDate(cur.getDate() - offset)
    while (cur <= lastDay) {
      const week = []
      for (let d = 0; d < 7; d++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }
      weeks.push(week)
    }
    return weeks
  }

  const weeks = getWeeks(now.getFullYear(), month)
  const slideIn = dir === 'right' ? 'ofSlideInRight' : dir === 'left' ? 'ofSlideInLeft' : 'ofFadeUp'

  return (
    <div>
      {/* Nav header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => navigate('left')}
          disabled={idx === 0}
          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? O.textFaint : O.green, fontSize: '1em', padding: '4px 8px', fontFamily: 'Montserrat', opacity: idx === 0 ? 0.3 : 1, transition: 'opacity 0.2s' }}
        >←</button>
        <div style={{ fontSize: '0.62em', letterSpacing: '4px', color: O.green, textTransform: 'uppercase', fontWeight: 600, fontFamily: 'Montserrat' }}>
          {MONTH_NAMES[month]}
        </div>
        <button
          onClick={() => navigate('right')}
          disabled={idx === months.length - 1}
          style={{ background: 'none', border: 'none', cursor: idx === months.length - 1 ? 'default' : 'pointer', color: idx === months.length - 1 ? O.textFaint : O.green, fontSize: '1em', padding: '4px 8px', fontFamily: 'Montserrat', opacity: idx === months.length - 1 ? 0.3 : 1, transition: 'opacity 0.2s' }}
        >→</button>
      </div>

      {/* Calendar */}
      <div key={animKey} style={{ animation: `${slideIn} 0.25s ease forwards` }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '6px 1fr', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '0.42em', color: i >= 5 ? O.textFaint : O.textMuted, fontFamily: 'Montserrat', fontWeight: 600, letterSpacing: '1px' }}>{d}</div>
            ))}
          </div>
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => {
          const weekdaysInMonth = week.slice(0, 5).filter(d => d.getMonth() === month)
          const officeCount = weekdaysInMonth.filter(d => officeDates.has(fmt(d))).length
          const hasWeekdays = weekdaysInMonth.length > 0
          const indicatorColor = !hasWeekdays ? 'transparent'
            : officeCount >= 3 ? '#1a5c38'
            : officeCount >= 1 ? '#d97706'
            : '#dc2626'

          return (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: '6px 1fr', gap: '6px', marginBottom: '3px', alignItems: 'stretch' }}>
              <div style={{ borderRadius: '2px', background: indicatorColor, minHeight: '28px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                {week.map((day, di) => {
                  const isThisMonth = day.getMonth() === month
                  const dateStr = fmt(day)
                  const isOffice = officeDates.has(dateStr)
                  const isWeekend = di >= 5
                  const isFuture = dateStr > todayStr
                  const isToday = dateStr === todayStr

                  let bg, color
                  if (!isThisMonth)   { bg = 'transparent';         color = 'transparent' }
                  else if (isOffice)  { bg = '#1a5c38';              color = 'white' }
                  else if (isWeekend) { bg = 'rgba(26,92,56,0.04)'; color = O.textFaint }
                  else if (isFuture)  { bg = 'rgba(26,92,56,0.03)'; color = O.textFaint }
                  else                { bg = 'rgba(26,92,56,0.07)'; color = O.textMuted }

                  return (
                    <div key={di} style={{
                      aspectRatio: '1', borderRadius: '3px', background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.5em', color, fontFamily: 'Montserrat',
                      fontWeight: isOffice ? 600 : 400,
                      border: isToday ? `1.5px solid ${O.green}` : '1.5px solid transparent',
                    }}>
                      {isThisMonth ? day.getDate() : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default function OfficeDays({ onBack }) {
  const [page, setPage] = useState('log')
  const [date, setDate] = useState('')
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('office_days')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setSessions(data)
  }

  useEffect(() => { fetchSessions() }, [])

  const handleSubmit = async () => {
    if (!date) { alert('Please fill in the date'); return }
    const { error } = await supabase
      .from('office_days')
      .insert([{ date }])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setDate('')
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditDate(s.date || '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditDate('')
  }

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    const { error } = await supabase.from('office_days').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('office_days')
      .update({ date: editDate })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchSessions() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalDays = sessions.length

  const labelStyle = {
    fontSize: '0.58em', letterSpacing: '3px', color: O.textMuted,
    textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500,
    fontFamily: 'Montserrat',
  }

  const editLabelStyle = {
    fontSize: '0.6em', letterSpacing: '2px', color: O.textFaint,
    textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat',
  }

  return (
    <>
      <style>{officeStyles}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Back link */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: O.textMuted, fontSize: '0.6em', letterSpacing: '3px',
              textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500,
              padding: 0,
            }}
          >
            ← Ross' Tracker
          </button>
        </div>

        {/* Title */}
        <div className="of-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8em, 6vw, 2.8em)',
            fontWeight: 300, color: O.green,
            letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1,
          }}>Office Days</h2>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, ${O.green}, transparent)`, margin: '14px auto' }} />
        </div>

        {/* Nav */}
        <div className="of-fade-up-delay" style={{
          display: 'flex', border: '1px solid rgba(26,92,56,0.15)', borderRadius: '2px',
          marginBottom: '40px', overflow: 'hidden', background: 'white',
          boxShadow: '0 2px 12px rgba(26,92,56,0.06)',
        }}>
          <button className={`of-nav-btn ${page === 'log' ? 'active' : ''}`} onClick={() => setPage('log')}>Log Day</button>
          <div style={{ width: '1px', background: 'rgba(26,92,56,0.1)' }} />
          <button className={`of-nav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
        </div>

        {/* Log Page */}
        {page === 'log' && (
          <div className="of-fade-up-delay-2" style={{
            background: 'white', borderRadius: '4px', padding: '32px',
            boxShadow: '0 2px 20px rgba(26,92,56,0.06)', border: '1px solid rgba(26,92,56,0.08)',
          }}>
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: O.greenMuted, textTransform: 'uppercase', marginBottom: '28px', fontWeight: 600 }}>New Entry</div>

            <div style={{ marginBottom: '36px' }}>
              <div style={labelStyle}>Date</div>
              <input className="of-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <button className="of-save-btn" onClick={handleSubmit}>Record Day</button>

            {saved && (
              <div style={{
                marginTop: '16px', padding: '12px', border: `1px solid rgba(26,92,56,0.15)`,
                borderRadius: '2px', textAlign: 'center', color: O.green,
                fontSize: '0.65em', letterSpacing: '3px', textTransform: 'uppercase',
                animation: 'ofFadeUp 0.4s ease', background: O.greenFaint,
              }}>✦ Day Recorded</div>
            )}
          </div>
        )}

        {/* History Page */}
        {page === 'history' && (
          <div className="of-fade-up-delay-2">
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: O.greenMuted, textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>Archive</div>

            {sessions.length > 0 && (
              <div style={{ padding: '16px 12px', background: 'white', border: '1px solid rgba(26,92,56,0.1)', borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(26,92,56,0.05)', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.5em', letterSpacing: '2px', color: O.textFaint, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500, fontFamily: 'Montserrat' }}>Total Days</div>
                <div className="of-kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7em', fontWeight: 600 }}>{totalDays}</div>
              </div>
            )}

            {/* Heatmap */}
            {sessions.length > 0 && (
              <div style={{
                background: 'white', border: '1px solid rgba(26,92,56,0.08)',
                borderRadius: '4px', padding: '24px', marginBottom: '28px',
                boxShadow: '0 2px 12px rgba(26,92,56,0.05)',
              }}>
                <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: O.greenMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>
                  Weekly Overview
                </div>
                <OfficeHeatmap sessions={sessions} />
              </div>
            )}

            {/* Timeline */}
            {sessions.length === 0 ? (
              <p style={{ color: O.textFaint, fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No days recorded yet.</p>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '28px' }}>
                <div style={{
                  position: 'absolute', left: '7px', top: '8px', bottom: '8px',
                  width: '1px', background: `linear-gradient(to bottom, ${O.green}, rgba(26,92,56,0.1))`,
                }} />
                {sessions.map((session, i) => (
                  <div key={session.id} style={{ position: 'relative', marginBottom: '20px', animation: `ofFadeUp 0.4s ease ${i * 0.06}s both` }}>
                    <div style={{
                      position: 'absolute', left: '-24px', top: '28px',
                      width: '9px', height: '9px', borderRadius: '50%',
                      background: editingId === session.id ? O.green : 'white',
                      border: `2px solid ${O.green}`,
                      boxShadow: `0 0 0 3px rgba(26,92,56,0.08)`,
                    }} />
                    {editingId === session.id ? (
                      <div style={{
                        background: 'white', borderRadius: '4px', padding: '20px',
                        border: `1px solid rgba(26,92,56,0.15)`, boxShadow: '0 2px 16px rgba(26,92,56,0.08)',
                      }}>
                        <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: O.greenMuted, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={editLabelStyle}>Date</div>
                          <input className="of-inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button className="of-delete-btn" onClick={() => deleteSession(session.id)}>Delete</button>
                          <div>
                            <button className="of-cancel-btn" onClick={cancelEdit}>Cancel</button>
                            <button className="of-edit-btn" onClick={() => saveEdit(session.id)}>Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: 'white', borderRadius: '4px', padding: '16px 20px',
                        border: '1px solid rgba(26,92,56,0.07)',
                        boxShadow: '0 1px 8px rgba(26,92,56,0.05)',
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                      }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(26,92,56,0.1)'; e.currentTarget.style.borderColor = 'rgba(26,92,56,0.2)' }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(26,92,56,0.05)'; e.currentTarget.style.borderColor = 'rgba(26,92,56,0.07)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3em', color: O.text, fontWeight: 600, lineHeight: 1.1 }}>
                            {formatUKDate(session.date)}
                          </div>
                          <button className="of-edit-btn" onClick={() => startEdit(session)}>Edit</button>
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
