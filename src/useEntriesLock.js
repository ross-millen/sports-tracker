import { useState, useRef } from 'react'

// Change the password here
export const ENTRIES_PASSWORD = '1066'

const SESSION_KEY = 'entries_unlocked'

export function useEntriesLock() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [showPrompt, setShowPrompt] = useState(false)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)
  const pendingFn = useRef(null)

  const guard = (fn) => {
    if (unlocked) {
      fn()
      return
    }
    pendingFn.current = fn
    setShowPrompt(s => !s)
    setWrong(false)
    setInput('')
  }

  const submit = () => {
    if (input === ENTRIES_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setUnlocked(true)
      setShowPrompt(false)
      setInput('')
      setWrong(false)
      pendingFn.current?.()
      pendingFn.current = null
    } else {
      setWrong(true)
      setInput('')
    }
  }

  return { unlocked, showPrompt, input, setInput, wrong, submit, guard }
}

export function EntriesLockPrompt({ lock, accent, dark }) {
  const inputColor = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'
  const bg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 16px', marginBottom: '12px',
      border: `1px solid ${accent}`,
      borderRadius: '4px', background: bg,
    }}>
      <input
        type="password"
        value={lock.input}
        onChange={e => lock.setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && lock.submit()}
        placeholder="Password"
        autoFocus
        style={{
          flex: 1, background: 'transparent', border: 'none',
          borderBottom: `1px solid ${accent}`,
          fontFamily: 'Montserrat', fontSize: '0.8em',
          outline: 'none', padding: '4px 0', letterSpacing: '6px',
          color: inputColor, colorScheme: dark ? 'dark' : 'light',
        }}
      />
      {lock.wrong && (
        <span style={{
          fontSize: '0.5em', fontFamily: 'Montserrat', letterSpacing: '2px',
          color: '#EF0107', textTransform: 'uppercase', flexShrink: 0,
        }}>
          Incorrect
        </span>
      )}
      <button
        onClick={lock.submit}
        style={{
          background: 'none', border: `1px solid ${accent}`,
          color: accent, padding: '5px 12px', borderRadius: '2px',
          cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.55em',
          letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600,
          flexShrink: 0,
        }}
      >
        Unlock
      </button>
    </div>
  )
}

export function LockIcon() {
  return (
    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" style={{ marginLeft: '6px', verticalAlign: 'middle', display: 'inline-block' }}>
      <rect x="0.75" y="3.75" width="6.5" height="5" rx="1" fill="currentColor" fillOpacity="0.55" />
      <path d="M2 3.75V2.5a2 2 0 0 1 4 0v1.25" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" fill="none" />
    </svg>
  )
}
