import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const C = {
  bg:         'transparent',
  card:       '#ffffff',
  border:     'rgba(139,0,0,0.1)',
  borderHover:'rgba(139,0,0,0.35)',
  text:       '#1a0505',
  muted:      'rgba(80,20,20,0.45)',
  faint:      'rgba(80,20,20,0.2)',
  football:   '#8b0000',
  arsenal:    '#EF0107',
  guinness:   '#c9a452',
  pushups:    '#1a3a6b',
  office:     '#1a5c38',
  takeaway:   '#92400e',
  win:        '#166534',
  draw:       '#92400e',
  loss:       '#991b1b',
}

const PUSHUP_COLORS = ['#1e3a8a', '#2e8b57', '#7b68b0', '#c4756b', '#d4956a', '#4a90a4']

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .db-wrap {
    max-width: 480px;
    margin: 0 auto;
    font-family: 'Inter', system-ui, sans-serif;
    color: ${C.text};
  }

  .db-back-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: ${C.muted};
    font-size: 0.6em;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
    font-weight: 500;
    padding: 0;
  }

  .db-elapsed-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 6px rgba(139,0,0,0.06);
    margin-bottom: 32px;
  }

  .db-elapsed-label {
    font-size: 0.58em;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 16px;
  }

  .db-elapsed-units {
    display: flex;
    gap: 0;
  }

  .db-elapsed-unit {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 6px;
    border-right: 1px solid ${C.border};
  }
  .db-elapsed-unit:first-child { padding-left: 0; }
  .db-elapsed-unit:last-child { border-right: none; padding-right: 0; }

  .db-elapsed-num {
    font-size: 2.4em;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1px;
    color: ${C.text};
    font-variant-numeric: tabular-nums;
  }

  .db-elapsed-unit-label {
    font-size: 0.52em;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${C.muted};
    margin-top: 8px;
  }

  .db-section-heading {
    font-size: 0.58em;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${C.faint};
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .db-section-heading::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${C.border};
  }

  .db-tracker-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 8px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(139,0,0,0.06);
    transition: border-color 0.15s, box-shadow 0.15s;
    cursor: default;
    margin-bottom: 28px;
  }
  .db-tracker-card:hover {
    border-color: ${C.borderHover};
    box-shadow: 0 4px 16px rgba(139,0,0,0.1);
  }

  .db-tracker-top {
    height: 3px;
  }

  .db-tracker-body {
    padding: 16px 18px 18px;
    text-align: center;
  }

  .db-tracker-label {
    font-size: 0.58em;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .db-big-num {
    font-size: 2.4em;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1px;
    color: ${C.text};
    font-variant-numeric: tabular-nums;
  }

  .db-unit {
    font-size: 0.62em;
    font-weight: 400;
    color: ${C.muted};
    margin-top: 6px;
    letter-spacing: 0.3px;
  }

  .db-stat-pair {
    display: flex;
    justify-content: center;
    align-items: stretch;
  }

  .db-stat-pair-item {
    padding: 0 28px;
  }
  .db-stat-pair-item:first-child { padding-left: 0; }
  .db-stat-pair-item:last-child  { padding-right: 0; }

  .db-stat-divider {
    width: 1px;
    background: ${C.border};
    flex-shrink: 0;
  }

  .db-wdl-row {
    display: flex;
    gap: 14px;
    margin-bottom: 14px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .db-wdl-block {}

  .db-wdl-num {
    font-size: 2em;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1px;
    font-variant-numeric: tabular-nums;
  }

  .db-wdl-label {
    font-size: 0.55em;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${C.muted};
    margin-top: 4px;
  }

  .db-proportion-bar {
    display: flex;
    height: 4px;
    border-radius: 3px;
    overflow: hidden;
    gap: 2px;
  }

  .db-proportion-seg {
    border-radius: 3px;
    transition: opacity 0.2s;
  }
  .db-proportion-seg:hover { opacity: 0.75; }

  .db-divider {
    height: 1px;
    background: ${C.border};
    margin: 16px 0;
  }

  .db-loading {
    color: ${C.faint};
    font-size: 0.7em;
    letter-spacing: 3px;
    text-transform: uppercase;
    text-align: center;
    padding: 100px 0;
  }

  @media (max-width: 380px) {
    .db-elapsed-num { font-size: 1.9em; }
    .db-elapsed-unit { padding: 0 3px; }
  }
`

function TrackerCard({ color, label, children }) {
  return (
    <div className="db-tracker-card">
      <div className="db-tracker-top" style={{ background: color }} />
      <div className="db-tracker-body">
        <div className="db-tracker-label" style={{ color }}>{label}</div>
        {children}
      </div>
    </div>
  )
}

const START = new Date('2026-04-04T00:00:00')

function getElapsed() {
  const totalSecs = Math.floor(Math.max(0, Date.now() - START) / 1000)
  return {
    days:  Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins:  Math.floor((totalSecs % 3600) / 60),
    secs:  totalSecs % 60,
  }
}

export default function Dashboard({ onBack }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [elapsed, setElapsed] = useState(getElapsed)

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetchAll() {
      const [
        { data: football },
        { data: arsenal },
        { data: guinness },
        { data: pushups },
        { data: office },
        { data: takeaways },
      ] = await Promise.all([
        supabase.from('sessions').select('date,duration_mins'),
        supabase.from('arsenal_games').select('date,result'),
        supabase.from('guinness_sessions').select('date,count'),
        supabase.from('pushup_sessions').select('date,count,target'),
        supabase.from('office_days').select('date,wfh_approved,annual_leave'),
        supabase.from('takeaways').select('date,price'),
      ])

      const fb = football || []
      const ar = arsenal || []
      const gu = guinness || []
      const pu = pushups || []
      const of = office || []
      const ta = takeaways || []

      const elapsedDays = Math.max(1, (Date.now() - START) / 86400000)

      const fbMins  = fb.reduce((s, r) => s + (r.duration_mins || 0), 0)
      const arWins  = ar.filter(g => g.result === 'W').length
      const arDraws = ar.filter(g => g.result === 'D').length
      const arLoss  = ar.filter(g => g.result === 'L').length
      const guPints    = gu.reduce((s, r) => s + (r.count || 0), 0)
      const guAvgDaily = guPints / elapsedDays
      const guAvgSesh  = gu.length ? guPints / gu.length : 0
      const puTotal = pu.reduce((s, r) => s + (r.count || 0), 0)
      const ofIn    = of.filter(d => !d.wfh_approved && !d.annual_leave).length
      const taSpend = ta.reduce((s, r) => s + (r.price || 0), 0)

      const puPerDay = Math.round(puTotal / elapsedDays * 10) / 10

      const puByTarget = {}
      pu.forEach(s => {
        const key = s.target ? s.target.trim() : 'Unspecified'
        puByTarget[key] = (puByTarget[key] || 0) + (parseInt(s.count) || 0)
      })
      const puTargets = Object.entries(puByTarget)
        .sort((a, b) => b[1] - a[1])
        .map(([label, reps]) => ({ label, reps }))

      const taAvgDaily = taSpend / elapsedDays

      setStats({
        fbHours: Math.round(fbMins / 60 * 10) / 10,
        arWins, arDraws, arLoss, arTotal: ar.length,
        guPints, guAvgDaily, guAvgSesh,
        puTotal, puPerDay, puTargets,
        ofIn,
        taSpend, taAvgDaily,
      })
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="db-wrap">

        <div style={{ marginBottom: '24px' }}>
          <button className="db-back-btn" onClick={onBack}>← home</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8em, 6vw, 2.8em)', fontWeight: 300, color: '#8b0000', letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1 }}>
            Dashboard
          </h2>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #8b0000, transparent)', margin: '14px auto' }} />
        </div>

        {loading ? (
          <div className="db-loading">Loading…</div>
        ) : (
          <>
            <div className="db-elapsed-card">
              <div style={{ flex: 1 }}>
                <div className="db-elapsed-label">Active since 4 April 2026</div>
                <div className="db-elapsed-units">
                  {[
                    { val: elapsed.days,  label: 'Days' },
                    { val: elapsed.hours, label: 'Hours' },
                    { val: elapsed.mins,  label: 'Minutes' },
                    { val: elapsed.secs,  label: 'Seconds' },
                  ].map(({ val, label }) => (
                    <div key={label} className="db-elapsed-unit">
                      <div className="db-elapsed-num">{String(val).padStart(2, '0')}</div>
                      <div className="db-elapsed-unit-label">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Football */}
            <div className="db-section-heading">Football</div>
            <TrackerCard color={C.football} label="Football">
              <div className="db-big-num">
                {stats.fbHours}
                <span style={{ fontSize: '0.38em', fontWeight: 600, color: C.muted, marginLeft: '3px' }}>h</span>
              </div>
              <div className="db-unit">total time played</div>
            </TrackerCard>

            {/* Arsenal */}
            <div className="db-section-heading">Arsenal</div>
            <TrackerCard color={C.arsenal} label="Arsenal">
              <div className="db-wdl-row">
                <div className="db-wdl-block">
                  <div className="db-wdl-num" style={{ color: C.win }}>{stats.arWins}</div>
                  <div className="db-wdl-label">Wins</div>
                </div>
                <div className="db-wdl-block">
                  <div className="db-wdl-num" style={{ color: C.draw }}>{stats.arDraws}</div>
                  <div className="db-wdl-label">Draws</div>
                </div>
                <div className="db-wdl-block">
                  <div className="db-wdl-num" style={{ color: C.loss }}>{stats.arLoss}</div>
                  <div className="db-wdl-label">Losses</div>
                </div>
              </div>
              {stats.arTotal > 0 && (
                <div className="db-proportion-bar">
                  {stats.arWins  > 0 && <div className="db-proportion-seg" style={{ flex: stats.arWins,  background: C.win  }} />}
                  {stats.arDraws > 0 && <div className="db-proportion-seg" style={{ flex: stats.arDraws, background: C.draw }} />}
                  {stats.arLoss  > 0 && <div className="db-proportion-seg" style={{ flex: stats.arLoss,  background: C.loss }} />}
                </div>
              )}
            </TrackerCard>

            {/* Guinness */}
            <div className="db-section-heading">Guinness</div>
            <TrackerCard color={C.guinness} label="Guinness">
              <div className="db-stat-pair">
                <div className="db-stat-pair-item">
                  <div className="db-big-num">{stats.guPints}</div>
                  <div className="db-unit">total pints</div>
                </div>
                <div className="db-stat-divider" />
                <div className="db-stat-pair-item">
                  <div className="db-big-num">{(stats.guAvgDaily ?? 0).toFixed(1)}</div>
                  <div className="db-unit">avg / day</div>
                </div>
                <div className="db-stat-divider" />
                <div className="db-stat-pair-item">
                  <div className="db-big-num">{(stats.guAvgSesh ?? 0).toFixed(1)}</div>
                  <div className="db-unit">avg / session</div>
                </div>
              </div>
            </TrackerCard>

            {/* Pushups */}
            <div className="db-section-heading">Pushups</div>
            <TrackerCard color={C.pushups} label="Pushups">
              <div className="db-stat-pair">
                <div className="db-stat-pair-item">
                  <div className="db-big-num">{stats.puTotal.toLocaleString()}</div>
                  <div className="db-unit">total reps</div>
                </div>
                <div className="db-stat-divider" />
                <div className="db-stat-pair-item">
                  <div className="db-big-num">{stats.puPerDay}</div>
                  <div className="db-unit">reps / day</div>
                </div>
              </div>
              {stats.puTargets.length > 0 && (
                <>
                  <div className="db-divider" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '10px' }}>
                    {stats.puTargets.map((t, i) => (
                      <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PUSHUP_COLORS[i % PUSHUP_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: '0.58em', fontFamily: 'Montserrat', fontWeight: 600, letterSpacing: '2px', color: C.muted, textTransform: 'uppercase' }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="db-proportion-bar">
                    {stats.puTargets.map((t, i) => (
                      <div key={t.label} className="db-proportion-seg" style={{ flex: t.reps, background: PUSHUP_COLORS[i % PUSHUP_COLORS.length] }} />
                    ))}
                  </div>
                </>
              )}
            </TrackerCard>

            {/* Office */}
            <div className="db-section-heading">Office</div>
            <TrackerCard color={C.office} label="Office">
              <div className="db-big-num">{stats.ofIn}</div>
              <div className="db-unit">days in office</div>
            </TrackerCard>

            {/* Takeaway */}
            <div className="db-section-heading">Takeaway</div>
            <TrackerCard color={C.takeaway} label="Takeaway">
              <div className="db-stat-pair">
                <div className="db-stat-pair-item">
                  <div className="db-big-num">£{stats.taSpend.toFixed(2)}</div>
                  <div className="db-unit">total spent</div>
                </div>
                <div className="db-stat-divider" />
                <div className="db-stat-pair-item">
                  <div className="db-big-num">£{stats.taAvgDaily.toFixed(2)}</div>
                  <div className="db-unit">avg daily spend</div>
                </div>
              </div>
            </TrackerCard>

          </>
        )}
      </div>
    </>
  )
}
