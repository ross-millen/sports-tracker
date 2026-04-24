import { useState } from 'react'
import PushupTracker from './PushupTracker'
import GuinnessLog from './GuinnessLog'
import OfficeDays from './OfficeDays'
import ArsenalTracker from './ArsenalTracker'
import FootballLog from './FootballLog'

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
  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); }
    to   { transform: translateX(100%); }
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

  .location-scroll::-webkit-scrollbar { height: 4px; }
  .location-scroll::-webkit-scrollbar-track { background: rgba(139,0,0,0.05); border-radius: 2px; }
  .location-scroll::-webkit-scrollbar-thumb { background: rgba(139,0,0,0.25); border-radius: 2px; }
  .location-scroll::-webkit-scrollbar-thumb:hover { background: #8b0000; }

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

function App() {
  const [tracker, setTracker] = useState('home')
  const [closing, setClosing] = useState(false)

  const openTracker = (key) => {
    setClosing(false)
    setTracker(key)
  }

  const closeTracker = () => {
    setClosing(true)
    setTimeout(() => { setTracker('home'); setClosing(false) }, 280)
  }

  return (
    <>
      <style>{globalStyles}</style>

      {/* Home page — always in the background */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f5f0eb 0%, #ede4d8 100%)',
        padding: '0 20px 60px',
        fontFamily: "'Montserrat', sans-serif",
      }}>
        <div className="fade-up" style={{ textAlign: 'center', padding: '50px 0 40px' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.2em, 7vw, 3.5em)',
            fontWeight: 300, color: '#8b0000',
            letterSpacing: '8px', textTransform: 'uppercase', lineHeight: 1,
          }}>tracker</h1>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #8b0000, transparent)', margin: '16px auto' }} />
          <p style={{ color: 'rgba(80,20,20,0.4)', fontSize: '0.6em', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 500 }}>
            Active since 4th April 2026
          </p>
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {[
              { label: 'Football', key: 'football' },
              { label: 'Arsenal', key: 'arsenal' },
              { label: 'Guinness', key: 'guinness' },
              { label: 'Pushups', key: 'pushups' },
              { label: 'Office', key: 'office' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => openTracker(item.key)}
                style={{
                  background: 'none', border: '1px solid rgba(139,0,0,0.2)', cursor: 'pointer',
                  color: 'rgba(80,20,20,0.5)', fontSize: '0.68em', letterSpacing: '4px',
                  textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500,
                  padding: '18px 0', borderRadius: '2px', transition: 'all 0.3s ease',
                  width: '260px', textAlign: 'center',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#8b0000'; e.currentTarget.style.color = '#f5f0eb'; e.currentTarget.style.borderColor = '#8b0000' }}
                onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(80,20,20,0.5)'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.2)' }}
              >
                {item.label} →
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tracker overlay — slides in from right, slides out to right */}
      {tracker !== 'home' && (
        <div
          key={tracker}
          style={{
            position: 'fixed', inset: 0, zIndex: 10,
            background: 'linear-gradient(160deg, #f5f0eb 0%, #ede4d8 100%)',
            overflowY: 'auto',
            padding: '40px 20px 60px',
            fontFamily: "'Montserrat', sans-serif",
            animation: `${closing ? 'slideOutRight' : 'slideInRight'} 0.28s ease forwards`,
          }}
        >
          {tracker === 'arsenal'  && <ArsenalTracker onBack={closeTracker} />}
          {tracker === 'guinness' && <GuinnessLog    onBack={closeTracker} />}
          {tracker === 'pushups'  && <PushupTracker  onBack={closeTracker} />}
          {tracker === 'office'   && <OfficeDays     onBack={closeTracker} />}
          {tracker === 'football' && <FootballLog    onBack={closeTracker} />}
        </div>
      )}
    </>
  )
}

export default App