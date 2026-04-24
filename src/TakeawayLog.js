import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const T = {
  orange: '#c2410c',
  orangeDark: '#9a3412',
  orangeMuted: 'rgba(194,65,12,0.4)',
  orangeFaint: 'rgba(194,65,12,0.07)',
  surface: '#ffffff',
  text: '#1c0a00',
  textMuted: 'rgba(28,10,0,0.45)',
  textFaint: 'rgba(28,10,0,0.25)',
}

const takeawayStyles = `
  @keyframes taFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes taShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .ta-fade-up { animation: taFadeUp 0.5s ease forwards; }
  .ta-fade-up-delay { animation: taFadeUp 0.5s ease 0.1s both; }
  .ta-fade-up-delay-2 { animation: taFadeUp 0.5s ease 0.2s both; }

  .ta-nav-btn {
    flex: 1; padding: 14px; background: transparent;
    color: rgba(28,10,0,0.3); border: none; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase; font-size: 0.68em;
    transition: all 0.3s ease; position: relative;
  }
  .ta-nav-btn:hover { color: #c2410c; }
  .ta-nav-btn.active { color: #c2410c; background: rgba(194,65,12,0.04); }
  .ta-nav-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 20%; right: 20%;
    height: 2px; background: #c2410c;
  }

  .ta-input {
    width: 100%; padding: 12px 0; background: transparent;
    border: none; border-bottom: 1px solid rgba(194,65,12,0.2);
    color: #1c0a00; font-family: 'Montserrat', sans-serif;
    font-size: 0.9em; font-weight: 400; transition: border-color 0.3s ease; outline: none;
  }
  .ta-input:focus { border-bottom-color: #c2410c; }
  .ta-input::placeholder { color: rgba(28,10,0,0.2); font-weight: 300; }

  .ta-inline-input {
    background: transparent; border: none;
    border-bottom: 1px solid rgba(194,65,12,0.25); color: #1c0a00;
    font-family: 'Montserrat', sans-serif; font-size: 0.85em;
    outline: none; padding: 2px 4px; width: 100%; margin-top: 4px;
  }
  .ta-inline-input:focus { border-bottom-color: #c2410c; }

  .ta-save-btn {
    width: 100%; padding: 15px; background: #c2410c; color: white;
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-weight: 600;
    font-size: 0.7em; letter-spacing: 4px; text-transform: uppercase;
    margin-top: 10px; transition: all 0.3s ease;
  }
  .ta-save-btn:hover {
    background: #9a3412; letter-spacing: 5px;
    box-shadow: 0 4px 20px rgba(194,65,12,0.25);
  }

  .ta-edit-btn {
    background: none; border: 1px solid rgba(194,65,12,0.25);
    color: #c2410c; padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .ta-edit-btn:hover { background: #c2410c; color: white; }

  .ta-cancel-btn {
    background: none; border: 1px solid rgba(28,10,0,0.15);
    color: rgba(28,10,0,0.4); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease; margin-right: 8px;
  }
  .ta-cancel-btn:hover { background: rgba(28,10,0,0.04); }

  .ta-delete-btn {
    background: none; border: 1px solid rgba(194,65,12,0.2);
    color: rgba(194,65,12,0.45); padding: 5px 12px; border-radius: 2px;
    cursor: pointer; font-family: 'Montserrat', sans-serif;
    font-size: 0.6em; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .ta-delete-btn:hover { background: #c2410c; color: white; border-color: #c2410c; }

  .ta-kpi-shimmer {
    background: linear-gradient(90deg, #c2410c, #f97316, #c2410c);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: taShimmer 3s linear infinite;
  }
`

export default function TakeawayLog({ onBack }) {
  const [page, setPage] = useState('log')
  const [date, setDate] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [price, setPrice] = useState('')
  const [isBreakfast, setIsBreakfast] = useState(false)
  const [saved, setSaved] = useState(false)
  const [orders, setOrders] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editRestaurant, setEditRestaurant] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [logsOpen, setLogsOpen] = useState(false)

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('takeaways')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setOrders(data)
  }

  useEffect(() => { fetchOrders() }, [])

  const handleSubmit = async () => {
    if (!date || !restaurant || !price) { alert('Please fill in all fields'); return }
    const { error } = await supabase
      .from('takeaways')
      .insert([{ date, restaurant, price: parseFloat(price), is_breakfast: isMcDonalds ? isBreakfast : false }])
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setDate(''); setRestaurant(''); setPrice(''); setIsBreakfast(false)
      fetchOrders()
    }
  }

  const startEdit = (o) => {
    setEditingId(o.id)
    setEditDate(o.date || '')
    setEditRestaurant(o.restaurant || '')
    setEditPrice(o.price != null ? String(o.price) : '')
  }

  const cancelEdit = () => {
    setEditingId(null); setEditDate(''); setEditRestaurant(''); setEditPrice('')
  }

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return
    const { error } = await supabase.from('takeaways').delete().eq('id', id)
    if (error) { alert('Error deleting: ' + error.message) } else { setEditingId(null); fetchOrders() }
  }

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('takeaways')
      .update({ date: editDate, restaurant: editRestaurant, price: parseFloat(editPrice) })
      .eq('id', id)
    if (error) { alert('Error updating: ' + error.message) } else { setEditingId(null); fetchOrders() }
  }

  const formatUKDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const totalOrders = orders.length
  const totalSpend = orders.reduce((s, o) => s + (parseFloat(o.price) || 0), 0)
  const avgOrder = totalOrders ? totalSpend / totalOrders : 0

  const restaurantCounts = {}
  orders.forEach(o => {
    if (o.restaurant) restaurantCounts[o.restaurant] = (restaurantCounts[o.restaurant] || 0) + 1
  })
  const topRestaurant = Object.entries(restaurantCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const isMcDonalds = /mc\s*donald/i.test(restaurant)

  const labelStyle = {
    fontSize: '0.58em', letterSpacing: '3px', color: T.textMuted,
    textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500,
    fontFamily: 'Montserrat',
  }
  const editLabelStyle = {
    fontSize: '0.6em', letterSpacing: '2px', color: T.textFaint,
    textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Montserrat',
  }

  return (
    <>
      <style>{takeawayStyles}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Back */}
        <div style={{ marginBottom: '24px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: '0.6em', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 500, padding: 0 }}>
            ← home
          </button>
        </div>

        {/* Title */}
        <div className="ta-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8em, 6vw, 2.8em)', fontWeight: 300, color: T.orange, letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1 }}>
            Takeaway
          </h2>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, ${T.orange}, transparent)`, margin: '14px auto' }} />
        </div>

        {/* Nav */}
        <div className="ta-fade-up-delay" style={{ display: 'flex', border: '1px solid rgba(194,65,12,0.15)', borderRadius: '2px', marginBottom: '40px', overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(194,65,12,0.06)' }}>
          <button className={`ta-nav-btn ${page === 'log' ? 'active' : ''}`} onClick={() => setPage('log')}>Log Order</button>
          <div style={{ width: '1px', background: 'rgba(194,65,12,0.1)' }} />
          <button className={`ta-nav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
        </div>

        {/* Log Page */}
        {page === 'log' && (
          <div className="ta-fade-up-delay-2" style={{ background: 'white', borderRadius: '4px', padding: '32px', boxShadow: '0 2px 20px rgba(194,65,12,0.06)', border: '1px solid rgba(194,65,12,0.08)' }}>
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: T.orangeMuted, textTransform: 'uppercase', marginBottom: '28px', fontWeight: 600 }}>New Order</div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Date</div>
              <input className="ta-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={labelStyle}>Restaurant</div>
              <input className="ta-input" type="text" placeholder="e.g. Dishoom..." value={restaurant} onChange={e => { setRestaurant(e.target.value); setIsBreakfast(false) }} />
            </div>

            {isMcDonalds && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isBreakfast}
                    onChange={e => setIsBreakfast(e.target.checked)}
                    style={{ accentColor: T.orange, width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.72em', letterSpacing: '1px', color: isBreakfast ? T.orange : T.textMuted, fontFamily: 'Montserrat', fontWeight: 500, transition: 'color 0.2s' }}>Breakfast</span>
                </label>
              </div>
            )}

            <div style={{ marginBottom: '36px' }}>
              <div style={labelStyle}>Price (£)</div>
              <input className="ta-input" type="number" step="0.01" min="0" placeholder="e.g. 24.50" value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            <button className="ta-save-btn" onClick={handleSubmit}>Record Order</button>

            {saved && (
              <div style={{ marginTop: '16px', padding: '12px', border: '1px solid rgba(194,65,12,0.15)', borderRadius: '2px', textAlign: 'center', color: T.orange, fontSize: '0.65em', letterSpacing: '3px', textTransform: 'uppercase', animation: 'taFadeUp 0.4s ease', background: T.orangeFaint }}>
                ✦ Order Recorded
              </div>
            )}
          </div>
        )}

        {/* History Page */}
        {page === 'history' && (
          <div className="ta-fade-up-delay-2">
            <div style={{ fontSize: '0.58em', letterSpacing: '5px', color: T.orangeMuted, textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>Archive</div>

            {orders.length === 0 ? (
              <p style={{ color: T.textFaint, fontSize: '0.75em', letterSpacing: '2px', textTransform: 'uppercase' }}>No orders recorded yet.</p>
            ) : (
              <>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                  {[
                    { label: 'Total Orders', value: totalOrders },
                    { label: 'Total Spend', value: `£${totalSpend.toFixed(2)}` },
                    { label: 'Avg Order', value: `£${avgOrder.toFixed(2)}` },
                    { label: 'Top Restaurant', value: topRestaurant },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ padding: '16px 12px', background: 'white', border: '1px solid rgba(194,65,12,0.1)', borderRadius: '4px', textAlign: 'center', boxShadow: '0 2px 12px rgba(194,65,12,0.05)' }}>
                      <div style={{ fontSize: '0.5em', letterSpacing: '2px', color: T.textFaint, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500, fontFamily: 'Montserrat' }}>{kpi.label}</div>
                      <div className="ta-kpi-shimmer" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7em', fontWeight: 600 }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Entries */}
                <button onClick={() => setLogsOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'white', border: '1px solid rgba(194,65,12,0.15)', borderRadius: '4px', cursor: 'pointer', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(194,65,12,0.05)' }}>
                  <span style={{ fontSize: '0.62em', letterSpacing: '4px', color: T.orangeMuted, textTransform: 'uppercase', fontWeight: 600, fontFamily: 'Montserrat' }}>Entries</span>
                  <span style={{ fontSize: '0.8em', color: T.orangeMuted, fontFamily: 'Montserrat', display: 'inline-block', transform: logsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                </button>

                {logsOpen && (
                  <div style={{ position: 'relative', paddingLeft: '28px' }}>
                    <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '1px', background: `linear-gradient(to bottom, ${T.orange}, rgba(194,65,12,0.1))` }} />
                    {orders.map((order, i) => (
                      <div key={order.id} style={{ position: 'relative', marginBottom: '20px', animation: `taFadeUp 0.4s ease ${i * 0.06}s both` }}>
                        <div style={{ position: 'absolute', left: '-24px', top: '28px', width: '9px', height: '9px', borderRadius: '50%', background: editingId === order.id ? T.orange : 'white', border: `2px solid ${T.orange}`, boxShadow: '0 0 0 3px rgba(194,65,12,0.08)' }} />

                        {editingId === order.id ? (
                          <div style={{ background: 'white', borderRadius: '4px', padding: '20px', border: '1px solid rgba(194,65,12,0.15)', boxShadow: '0 2px 16px rgba(194,65,12,0.08)' }}>
                            <div style={{ fontSize: '0.58em', letterSpacing: '2px', color: T.orangeMuted, textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Editing</div>
                            <div style={{ marginBottom: '12px' }}>
                              <div style={editLabelStyle}>Date</div>
                              <input className="ta-inline-input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <div style={editLabelStyle}>Restaurant</div>
                              <input className="ta-inline-input" type="text" value={editRestaurant} onChange={e => setEditRestaurant(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                              <div style={editLabelStyle}>Price (£)</div>
                              <input className="ta-inline-input" type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <button className="ta-delete-btn" onClick={() => deleteOrder(order.id)}>Delete</button>
                              <div>
                                <button className="ta-cancel-btn" onClick={cancelEdit}>Cancel</button>
                                <button className="ta-edit-btn" onClick={() => saveEdit(order.id)}>Save</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ background: 'white', borderRadius: '4px', padding: '16px 20px', border: '1px solid rgba(194,65,12,0.07)', boxShadow: '0 1px 8px rgba(194,65,12,0.05)', transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
                            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(194,65,12,0.1)'; e.currentTarget.style.borderColor = 'rgba(194,65,12,0.2)' }}
                            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(194,65,12,0.05)'; e.currentTarget.style.borderColor = 'rgba(194,65,12,0.07)' }}
                          >
                            <div style={{ fontSize: '0.52em', letterSpacing: '2px', color: T.orangeMuted, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                              {formatUKDate(order.date)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3em', color: T.text, fontWeight: 600, lineHeight: 1.1 }}>
                                  {order.restaurant}
                                </div>
                                {order.is_breakfast && (
                                  <span style={{ marginTop: '6px', display: 'inline-block', fontSize: '0.55em', fontFamily: 'Montserrat', fontWeight: 600, letterSpacing: '2px', color: 'white', background: T.orange, padding: '2px 8px', borderRadius: '2px' }}>Breakfast</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1em', color: T.orange, fontWeight: 600 }}>£{parseFloat(order.price).toFixed(2)}</span>
                                <button className="ta-edit-btn" onClick={() => startEdit(order)}>Edit</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
