import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

const A = {
  red: '#EF0107',
  redDark: '#b30005',
  redMuted: 'rgba(239,1,7,0.4)',
  redFaint: 'rgba(239,1,7,0.07)',
  gold: '#9C824A',
  goldMuted: 'rgba(156,130,74,0.5)',
  surface: '#ffffff',
  bg: '#fff8f8',
  text: '#1a0000',
  textMuted: 'rgba(26,0,0,0.45)',
  textFaint: 'rgba(26,0,0,0.25)',
}

const COMPETITIONS = ['Premier League', 'Champions League', 'FA Cup', 'Carabao Cup']
const CL_STAGES = ['Group Stage', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final']
const CARABAO_STAGES = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Quarter Final', 'Semi Final', 'Final']
const VENUES = ['Home', 'Away', 'Neutral']
const RESULTS = ['W', 'D', 'L']

const resultColor = { W: '#1a5c38', D: '#d97706', L: '#EF0107' }
const resultLabel = { W: 'Win', D: 'Draw', L: 'Loss' }

const arsenalStyles = `
  @keyframes arFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes arShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .ar-fade-up { animation: arFadeUp 0.5s ease forwards; }
  .ar-fade-up-delay { animation: arFadeUp 0.5s ease 0.1s both; }
  .ar-fade-up-delay-2 { animation: arFadeUp 0.5s ease 0.2s both; }

  .ar-nav-btn {
    flex: 1; padding: 14px; background: transparent;
    color: rgba(26,0,0,0.3); border: none; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase; font-size: 0.68em;
    transition: all 0.3s ease; position: relative;
  }
  .ar-nav-btn:hover { color: #EF0107; }
  .ar-nav-btn.active { color: #EF0107; background: rgba(239,1,7,0.04); }
  .ar-nav-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%;
    height: 2px; background: #EF0107;
  }

  .ar-input {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(239,1,7,0.2);
    color: #1a0000; font-family: 'Montserrat', sans-serif;
    font-size: 0.9em; font-weight: 400; transition: border-color 0.3s ease; outline: none;
  }
  .ar-input:focus { border-bottom-color: #EF0107; }
  .ar-input::placeholder { color: rgba(26,0,0,0.2); font-weight: 300; }

  .ar-select {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(239,1,7,0.2);
    color: #1a0000; font-family: 'Montserrat', sans-serif;
    font-size: 0.85em; font-weight: 400; outline: none; cursor: pointer;
    appearance: none; transition: border-color 0.3s ease;
  }
  .ar-select:focus { border-bottom-color: #EF0107; }

  .ar-inline-input {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(239,1,7,0.25); color: #1a0000;
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
  }
  .ar-inline-input:focus { border-bottom-color: #EF0107; }

  .ar-inline-select {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(239,1,7,0.25); color: #1a0000;
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
    appearance: none; cursor: pointer;
  }
  .ar-inline-select:focus { border-bottom-color: #EF0107; }

  .ar-save-btn {
    width: 100%; padding: 15px; background: #EF0107; color: white;
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 600;
    font-size: 0.7em; letter-spacing: 4px; text-transform: uppercase;
    margin-top: 10px; transition: all 0.3s ease;
  }
  .ar-save-btn:hover {
    background: #b30005; letter-spacing: 5px;
    box-shadow: 0 4px 20px rgba(239,1,7,0.25);
  }

  .ar-edit-btn {
    background: none; border: 1px solid rgba(239,1,7,0.25);
    color: #EF0107; padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .ar-edit-btn:hover { background: #EF0107; color: white; }

  .ar-cancel-btn {
    background: none; border: 1px solid rgba(26,0,0,0.15);
    color: rgba(26,0,0,0.4); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease; margin-right: 8px;
  }
  .ar-cancel-btn:hover { background: rgba(26,0,0,0.04); }

  .ar-delete-btn {
    background: none; border: 1px solid rgba(239,1,7,0.2);
    color: rgba(239,1,7,0.45); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .ar-delete-btn:hover { background: #EF0107; color: white; border-color: #EF0107; }

  .ar-kpi-shimmer {
    background: linear-gradient(90deg, #EF0107, #9C824A, #EF0107);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: arShimmer 3s linear infinite;
  }

  .ar-toggle-btn {
    flex: 1; padding: 8px 4px; border: 1px solid rgba(239,1,7,0.2);
    background: transparent; color: rgba(26,0,0,0.4);
    font-family: 'Montserrat', sans-serif; font-size: 0.58em;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
    transition: all 0.2s ease; font-weight: 500;
  }
  .ar-toggle-btn.selected { background: #EF0107; color: white; border-color: #EF0107; }
  .ar-toggle-btn:first-child { border-radius: 2px 0 0 2px; }
  .ar-toggle-btn:last-child { border-radius: 0 2px 2px 0; }
`


function ResultDonut({ games }) {
  const [tooltip, setTooltip] = useState(null)
  const counts = { W: 0, D: 0, L: 0 }
  games.forEach(g => { if (counts[g.result] !== undefined) counts[g.result]++ })
  const entries = RESULTS.map(r => ({ label: resultLabel[r], value: counts[r], color: resultColor[r] })).filter(e => e.value > 0)
  if (entries.length === 0) return null

  const total = entries.reduce((s, e) => s + e.value, 0)
  const R = 70, cx = 95, cy = 85, stroke = 26
  let cumAngle = -Math.PI / 2

  const slices = entries.map(e => {
    const frac = e.value / total
    const angle = frac * 2 * Math.PI
    const startAngle = cumAngle
    cumAngle += angle
    return { ...e, startAngle, endAngle: cumAngle, frac }
  })

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 190 170" style={{ width: '160px', flexShrink: 0 }}>
          {slices.map((s, i) => {
            const x1 = cx + R * Math.cos(s.startAngle), y1 = cy + R * Math.sin(s.startAngle)
            const x2 = cx + R * Math.cos(s.endAngle), y2 = cy + R * Math.sin(s.endAngle)
            return (
              <path key={i}
                d={`M ${x1} ${y1} A ${R} ${R} 0 ${s.frac > 0.5 ? 1 : 0} 1 ${x2} ${y2}`}
                fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseOver={e => e.target.style.opacity = '0.8'}
                onMouseOut={e => e.target.style.opacity = '1'}
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY, s })}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}
          {slices.map((s, i) => {
            const inner = R - stroke / 2, outer = R + stroke / 2
            return <line key={i}
              x1={cx + inner * Math.cos(s.startAngle)} y1={cy + inner * Math.sin(s.startAngle)}
              x2={cx + outer * Math.cos(s.startAngle)} y2={cy + outer * Math.sin(s.startAngle)}
              stroke="white" strokeWidth="1.5" />
          })}
          <circle cx={cx} cy={cy} r={R - stroke / 2} fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={R + stroke / 2} fill="none" stroke="white" strokeWidth="1.5" />
          <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fill: A.text, fontWeight: 600 }}>{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: 'Montserrat', fontSize: '6px', fill: A.textMuted, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>GAMES</text>
        </svg>
        <div style={{ flex: 1 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7em', color: A.text, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '0.5em', color: A.textMuted, letterSpacing: '1px', fontFamily: 'Montserrat' }}>{s.value} game{s.value !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ fontSize: '0.6em', color: A.textMuted, fontFamily: 'Montserrat', fontWeight: 600 }}>{Math.round(s.frac * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 40, background: A.text, color: 'white', padding: '8px 12px', borderRadius: '3px', fontSize: '0.7em', fontFamily: 'Montserrat', letterSpacing: '1px', pointerEvents: 'none', zIndex: 1000, whiteSpace: 'nowrap' }}>
          {tooltip.s.label} — {tooltip.s.value} ({Math.round(tooltip.s.frac * 100)}%)
        </div>
      )}
    </div>
  )
}


const BUBBLE_COLORS = [
  '#EF0107', '#b30005', '#9C824A', '#1a5c38',
  '#2563eb', '#7b68b0', '#d97706', '#c9607a',
  '#4a90a4', '#5a6ebd', '#6aab7a', '#c4956a',
]

function OpponentBubbleChart({ games }) {
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const stateRef = useRef([])
  const [positions, setPositions] = useState([])

  const byOpponent = {}
  games.forEach(g => {
    if (!byOpponent[g.opponent]) byOpponent[g.opponent] = { label: g.opponent, count: 0, W: 0, D: 0, L: 0 }
    byOpponent[g.opponent].count++
    if (g.result) byOpponent[g.opponent][g.result]++
  })
  const entries = Object.values(byOpponent).sort((a, b) => b.count - a.count)
  const maxCount = entries.length > 0 ? entries[0].count : 1
  const sizes = entries.map(e => Math.round(44 + Math.sqrt(e.count / maxCount) * 22))
  const sizesRef = useRef(sizes)
  sizesRef.current = sizes

  const resolveCollisions = (bs, W, H) => {
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const ri = sizesRef.current[i] / 2, rj = sizesRef.current[j] / 2
          const dx = (bs[j].x + rj) - (bs[i].x + ri)
          const dy = (bs[j].y + rj) - (bs[i].y + ri)
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
          const minDist = ri + rj
          if (dist < minDist) {
            const nx = dx / dist, ny = dy / dist
            const push = (minDist - dist) / 2
            bs[i].x -= nx * push; bs[i].y -= ny * push
            bs[j].x += nx * push; bs[j].y += ny * push
            bs[i].x = Math.max(0, Math.min(W - sizesRef.current[i], bs[i].x))
            bs[i].y = Math.max(0, Math.min(H - sizesRef.current[i], bs[i].y))
            bs[j].x = Math.max(0, Math.min(W - sizesRef.current[j], bs[j].x))
            bs[j].y = Math.max(0, Math.min(H - sizesRef.current[j], bs[j].y))
          }
        }
      }
    }
  }

  useEffect(() => {
    if (!containerRef.current || entries.length === 0) return
    const W = containerRef.current.offsetWidth
    const H = 300
    stateRef.current = entries.map((_, i) => {
      const d = sizesRef.current[i]
      return {
        x: Math.random() * Math.max(1, W - d),
        y: Math.random() * Math.max(1, H - d),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
      }
    })
    resolveCollisions(stateRef.current, W, H)

    const tick = () => {
      const W2 = containerRef.current ? containerRef.current.offsetWidth : W
      const H2 = 300
      const bs = stateRef.current.map(b => ({ ...b }))

      for (let i = 0; i < bs.length; i++) { bs[i].x += bs[i].vx; bs[i].y += bs[i].vy }

      for (let i = 0; i < bs.length; i++) {
        const d = sizesRef.current[i]
        if (bs[i].x <= 0) { bs[i].x = 0; bs[i].vx = Math.abs(bs[i].vx) }
        if (bs[i].x + d >= W2) { bs[i].x = W2 - d; bs[i].vx = -Math.abs(bs[i].vx) }
        if (bs[i].y <= 0) { bs[i].y = 0; bs[i].vy = Math.abs(bs[i].vy) }
        if (bs[i].y + d >= H2) { bs[i].y = H2 - d; bs[i].vy = -Math.abs(bs[i].vy) }
      }

      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const ri = sizesRef.current[i] / 2, rj = sizesRef.current[j] / 2
          const dx = (bs[j].x + rj) - (bs[i].x + ri)
          const dy = (bs[j].y + rj) - (bs[i].y + ri)
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
          const minDist = ri + rj
          if (dist < minDist) {
            const nx = dx / dist, ny = dy / dist
            const push = (minDist - dist) / 2
            bs[i].x -= nx * push; bs[i].y -= ny * push
            bs[j].x += nx * push; bs[j].y += ny * push
            const dvn = (bs[j].vx - bs[i].vx) * nx + (bs[j].vy - bs[i].vy) * ny
            if (dvn < 0) {
              bs[i].vx += dvn * nx; bs[i].vy += dvn * ny
              bs[j].vx -= dvn * nx; bs[j].vy -= dvn * ny
            }
          }
        }
      }

      stateRef.current = bs
      setPositions(bs.map(b => ({ x: b.x, y: b.y })))
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length])

  if (entries.length === 0) return null

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '300px', overflow: 'hidden', borderRadius: '4px' }}>
      {entries.map((e, i) => {
        const pos = positions[i] || { x: 0, y: 0 }
        const d = sizes[i]
        const nameFontSize = Math.max(5, Math.floor((d * 0.78) / (e.label.length * 0.60)))
        const countFontSize = Math.max(5, Math.floor(nameFontSize * 0.8))
        return (
          <div key={e.label} style={{
            position: 'absolute', left: `${pos.x}px`, top: `${pos.y}px`,
            width: `${d}px`, height: `${d}px`, borderRadius: '50%',
            background: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            opacity: 0.92, boxShadow: '0 6px 20px rgba(0,0,0,0.13)',
            cursor: 'default', userSelect: 'none',
          }}
            onMouseMove={ev => setTooltip({ x: ev.clientX, y: ev.clientY, e })}
            onMouseLeave={() => setTooltip(null)}
          >
            <div style={{
              fontSize: `${nameFontSize}px`, color: 'white', fontFamily: 'Montserrat',
              fontWeight: 700, letterSpacing: '0.3px', textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>{e.label}</div>
            <div style={{
              fontSize: `${countFontSize}px`,
              color: 'rgba(255,255,255,0.75)', fontFamily: 'Montserrat',
              letterSpacing: '0.5px', marginTop: '2px',
            }}>{e.count} game{e.count !== 1 ? 's' : ''}</div>
          </div>
        )
      })}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 40,
          background: A.text, color: 'white', padding: '8px 12px',
          borderRadius: '3px', fontSize: '0.7em', fontFamily: 'Montserrat',
          letterSpacing: '1px', pointerEvents: 'none', zIndex: 1000, whiteSpace: 'nowrap',
        }}>
          {tooltip.e.label} — {tooltip.e.W}W {tooltip.e.D}D {tooltip.e.L}L
        </div>
      )}
    </div>
  )
}

export default function ArsenalTracker({ onBack }) {
  const [page, setPage] = useState('log')
  const [date, setDate] = useState('')
  const [opponent, setOpponent] = useState('')
  const [competition, setCompetition] = useState('Premier League')
  const [clStage, setClStage] = useState('Group Stage')
  const [carabaoStage, setCarabaoStage] = useState('Round 1')
  const [venue, setVenue] = useState('Home')
  const [result, setResult] = useState('W')
  const [score, setScore] = useState('')
  const [saved, setSaved] = useState(false)
  const [games, setGames] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editOpponent, setEditOpponent] = useState('')
  const [editCompetition, setEditCompetition] = useState('')
  const [editClStage, setEditClStage] = useState('Group Stage')
  const [editCarabaoStage, setEditCarabaoStage] = useState('Round 1')
  const [editVenue, setEditVenue] = useState('')
  const [editResult, setEditResult] = useState('')
  const [editScore, setEditScore] = useState('')

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('arsenal_games')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setGames(data)
  }

  useEffect(() => {
    if (page === 'history') fetchGames()
  }, [page])

  const handleSubmit = async () => {
    if (!date || !opponent) { alert('Please fill in date and opponent'); return }
    const { error } = await supabase
      .from('arsenal_games')
      .insert([{ date, opponent, competition: competition === 'Champions League' ? `Champions League · ${clStage}` : competition === 'Carabao Cup' ? `Carabao Cup · ${carabaoStage}` : competition, venue, result, score: score || null }])
    if (error) { alert('Error saving: ' + error.message) } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setDate(''); setOpponent(''); setScore('')
      setCompetition('Premier League'); setVenue('Home'); setResult('W')
    }
  }

  const startEdit = (g) => {
    setEditingId(g.id); setEditDate(g.date || ''); setEditOpponent(g.opponent || '')
    const isCL = g.competition && g.competition.startsWith('Champions League ·')
    const isCarabao = g.competition && g.competition.startsWith('Carabao Cup ·')
    setEditCompetition(isCL ? 'Champions League' : isCarabao ? 'Carabao Cup' : (g.competition || 'Premier League'))
    setEditClStage(isCL ? g.competition.split(' · ')[1] : 'Group Stage')
    setEditCarabaoStage(isCarabao ? g.competition.split(' · ')[1] : 'Round 1')
    setEditVenue(g.venue || 'Home')
    setEditResult(g.result || 'W'); setEditScore(g.score || '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditDate(''); setEditOpponent(''); setEditCompetition('')
    setEditVenue(''); setEditResult(''); setEditScore('')
  }

  const deleteGame = async (id) => {
    if (!window.confirm('Delete this game?')) return
    const { error } = await supabase.from('arsenal_games').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchGames() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('arsenal_games')
      .update({ date: editDate, opponent: editOpponent, competition: editCompetition === 'Champions League' ? `Champions League · ${editClStage}` : editCompetition === 'Carabao Cup' ? `Carabao Cup · ${editCarabaoStage}` : editCompetition, venue: editVenue, result: editResult, score: editScore || null })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchGames() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalGames = games.length
  const wins = games.filter(g => g.result === 'W').length
  const winPct = totalGames ? Math.round((wins / totalGames) * 100) : 0

  let unbeatenRun = 0
  for (const g of games) {
    if (g.result === 'L') break
    unbeatenRun++
  }

  const goalsSeen = games.reduce((sum, g) => {
    if (!g.score) return sum
    const arsenalGoals = parseInt(g.score.split('-')[0])
    return sum + (isNaN(arsenalGoals) ? 0 : arsenalGoals)
  }, 0)

  const labelStyle = {
    fontSize: '0.58em', letterSpacing: '3px', color: A.textMuted,
    textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500, fontFamily: 'Montserrat',
  }
  const editLabelStyle = {
    fontSize: '0.6em', letterSpacing: '2px', color: A.textFaint,
    textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat',
  }

  return (
    <>
      <style>{arsenalStyles}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Back */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.textMuted, fontSize: '0.6em', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500, padding: 0 }}>
            ← Ross' Tracker
          </button>
        </div>

        {/* Title */}
        <div className="ar-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8em,6vw,2.8em)', fontWeight: 300, color: A.red, letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1 }}>
            Arsenal
          </h2>
          <div style={{ fontSize: '0.48em', letterSpacing: '5px', color: A.goldMuted, textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 600, marginTop: '6px' }}>Games Seen Live · Since Season Ticket Access</div>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, ${A.red}, transparent)`, margin: '14px auto' }} />
        </div>

        {/* Nav */}
        <div className="ar-fade-up-delay" style={{ display: 'flex', border: '1px solid rgba(239,1,7,0.15)', borderRadius: '2px', marginBottom: '40px', overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(239,1,7,0.06)' }}>
          <button className={`ar-nav-btn ${page === 'log' ? 'active' : ''}`} onClick={() => setPage('log')}>Log Game</button>
          <div style={{ width: '1px', background: 'rgba(239,1,7,0.1)' }} />
          <button className={`ar-nav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
        </div>

        {/* Log Page */}
        {page === 'log' && (
          <div className="ar-fade-up-delay-2" style={{ background: 'white', borderRadius: '4px', padding: '32px', boxShadow: '0 2px 20px rgba(239,1,7,0.06)', border: '1px solid rgba(239,1,7,0.08)' }}>
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: A.redMuted, textTransform: 'uppercase', marginBottom: '28px', fontWeight: 600 }}>New Game</div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Date</div>
              <input className="ar-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Opponent</div>
              <input className="ar-input" type="text" placeholder="Manchester City..." value={opponent} onChange={e => setOpponent(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Competition</div>
              <select className="ar-select" value={competition} onChange={e => setCompetition(e.target.value)}>
                {COMPETITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {competition === 'Champions League' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Stage</div>
                <select className="ar-select" value={clStage} onChange={e => setClStage(e.target.value)}>
                  {CL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            {competition === 'Carabao Cup' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={labelStyle}>Stage</div>
                <select className="ar-select" value={carabaoStage} onChange={e => setCarabaoStage(e.target.value)}>
                  {CARABAO_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Venue</div>
              <div style={{ display: 'flex' }}>
                {VENUES.map(v => (
                  <button key={v} className={`ar-toggle-btn ${venue === v ? 'selected' : ''}`} onClick={() => setVenue(v)}>{v}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Result</div>
              <div style={{ display: 'flex' }}>
                {RESULTS.map(r => (
                  <button key={r} className={`ar-toggle-btn ${result === r ? 'selected' : ''}`}
                    style={result === r ? { background: resultColor[r], borderColor: resultColor[r] } : {}}
                    onClick={() => setResult(r)}>{resultLabel[r]}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <div style={labelStyle}>Score</div>
              <input className="ar-input" type="text" placeholder="2-1" value={score} onChange={e => setScore(e.target.value)} />
            </div>

            <button className="ar-save-btn" onClick={handleSubmit}>Record Game</button>

            {saved && (
              <div style={{ marginTop: '16px', padding: '12px', border: `1px solid rgba(239,1,7,0.15)`, borderRadius: '2px', textAlign: 'center', color: A.red, fontSize: '0.65em', letterSpacing: '3px', textTransform: 'uppercase', animation: 'arFadeUp 0.4s ease', background: A.redFaint }}>
                ✦ Game Recorded
              </div>
            )}
          </div>
        )}

        {/* History Page */}
        {page === 'history' && (
          <div className="ar-fade-up-delay-2">
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: A.redMuted, textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>Match Archive</div>

            {games.length > 0 && (
              <>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Games Seen', value: totalGames },
                    { label: 'Win Rate', value: `${winPct}%` },
                    { label: 'Unbeaten Run', value: unbeatenRun },
                    { label: 'Arsenal Goals', value: goalsSeen || '—' },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ padding: '16px 12px', background: 'white', border: '1px solid rgba(239,1,7,0.1)', borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(239,1,7,0.05)' }}>
                      <div style={{ fontSize: '0.5em', letterSpacing: '2px', color: A.textFaint, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500, fontFamily: 'Montserrat' }}>{kpi.label}</div>
                      <div className="ar-kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.7em', fontWeight: 600 }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Results donut */}
                <div style={{ background: 'white', border: '1px solid rgba(239,1,7,0.08)', borderRadius: '4px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(239,1,7,0.05)' }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: A.redMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>Results</div>
                  <ResultDonut games={games} />
                </div>

                {/* Opponents bubble chart */}
                <div style={{ background: 'white', border: '1px solid rgba(239,1,7,0.08)', borderRadius: '4px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 12px rgba(239,1,7,0.05)' }}>
                  <div style={{ fontSize: '0.58em', letterSpacing: '3px', color: A.redMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>Opponents</div>
                  <OpponentBubbleChart games={games} />
                </div>

              </>
            )}

            {/* Timeline */}
            {games.length === 0 ? (
              <p style={{ color: A.textFaint, fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No games recorded yet.</p>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '28px' }}>
                <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '1px', background: `linear-gradient(to bottom, ${A.red}, rgba(239,1,7,0.1))` }} />
                {games.map((game, i) => (
                  <div key={game.id} style={{ position: 'relative', marginBottom: '20px', animation: `arFadeUp 0.4s ease ${i * 0.06}s both` }}>
                    <div style={{ position: 'absolute', left: '-24px', top: '28px', width: '9px', height: '9px', borderRadius: '50%', background: editingId === game.id ? A.red : 'white', border: `2px solid ${A.red}`, boxShadow: `0 0 0 3px rgba(239,1,7,0.08)` }} />

                    {editingId === game.id ? (
                      <div style={{ background: 'white', borderRadius: '4px', padding: '20px', border: `1px solid rgba(239,1,7,0.15)`, boxShadow: '0 2px 16px rgba(239,1,7,0.08)' }}>
                        <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: A.redMuted, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Date</div>
                          <input className="ar-inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Opponent</div>
                          <input className="ar-inline-input" type="text" value={editOpponent} onChange={e => setEditOpponent(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Competition</div>
                          <select className="ar-inline-select" value={editCompetition} onChange={e => setEditCompetition(e.target.value)}>
                            {COMPETITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {editCompetition === 'Champions League' && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Stage</div>
                            <select className="ar-inline-select" value={editClStage} onChange={e => setEditClStage(e.target.value)}>
                              {CL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                        {editCompetition === 'Carabao Cup' && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={editLabelStyle}>Stage</div>
                            <select className="ar-inline-select" value={editCarabaoStage} onChange={e => setEditCarabaoStage(e.target.value)}>
                              {CARABAO_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Venue</div>
                          <select className="ar-inline-select" value={editVenue} onChange={e => setEditVenue(e.target.value)}>
                            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={editLabelStyle}>Result</div>
                          <select className="ar-inline-select" value={editResult} onChange={e => setEditResult(e.target.value)}>
                            {RESULTS.map(r => <option key={r} value={r}>{resultLabel[r]}</option>)}
                          </select>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={editLabelStyle}>Score</div>
                          <input className="ar-inline-input" type="text" value={editScore} onChange={e => setEditScore(e.target.value)} placeholder="e.g. 2-1" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button className="ar-delete-btn" onClick={() => deleteGame(game.id)}>Delete</button>
                          <div>
                            <button className="ar-cancel-btn" onClick={cancelEdit}>Cancel</button>
                            <button className="ar-edit-btn" onClick={() => saveEdit(game.id)}>Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'white', borderRadius: '4px', padding: '16px 20px', border: '1px solid rgba(239,1,7,0.07)', boxShadow: '0 1px 8px rgba(239,1,7,0.05)', transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
                        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(239,1,7,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,1,7,0.2)' }}
                        onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(239,1,7,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,1,7,0.07)' }}
                      >
                        <div style={{ fontSize: '0.52em', letterSpacing: '2px', color: A.redMuted, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                          {formatUKDate(game.date)} · {game.competition} · {game.venue}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3em', color: A.text, fontWeight: 600, lineHeight: 1.1 }}>
                              Arsenal vs {game.opponent}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                              <span style={{ fontSize: '0.58em', fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: '2px', color: 'white', background: resultColor[game.result], padding: '2px 8px', borderRadius: '2px' }}>
                                {resultLabel[game.result]}
                              </span>
                              {game.score && <span style={{ fontSize: '0.6em', color: A.textMuted, fontFamily: 'Montserrat', letterSpacing: '2px' }}>{game.score}</span>}
                            </div>
                          </div>
                          <button className="ar-edit-btn" onClick={() => startEdit(game)}>Edit</button>
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
