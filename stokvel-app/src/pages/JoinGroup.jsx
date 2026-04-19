import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const s = {
  root:   { minHeight: '100vh', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },

  nav:    { background: '#fff', borderBottom: '1px solid rgba(192,201,190,0.35)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 },
  brand:  { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon:{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#c49a2a,#fed488)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:{ fontSize: '15px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.3px' },

  page:   { maxWidth: '480px', margin: '0 auto', padding: '40px 24px' },
  back:   { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#717970', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', fontFamily: 'inherit' },
  h1:     { fontSize: '24px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.4px', margin: '0 0 4px' },
  sub:    { fontSize: '14px', color: '#5a6360', margin: '0 0 32px' },

  card:   { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(25,28,29,0.07)', border: '1px solid rgba(192,201,190,0.25)' },

  field:  { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' },
  label:  { fontSize: '11px', fontWeight: '600', color: '#404941', letterSpacing: '0.08em', textTransform: 'uppercase' },
  codeInput: { padding: '14px 16px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '10px', fontSize: '22px', fontWeight: '800', color: '#002c13', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', outline: 'none', width: '100%', boxSizing: 'border-box', textAlign: 'center', transition: 'border-color 0.18s,box-shadow 0.18s' },

  error:   { background: '#ffdad6', borderRadius: '10px', padding: '12px 16px', color: '#93000a', fontSize: '13px', marginBottom: '16px' },
  preview: { background: 'rgba(0,44,19,0.05)', border: '1px solid rgba(0,44,19,0.12)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' },
  previewName: { fontSize: '16px', fontWeight: '800', color: '#191c1d', margin: '0 0 4px' },
  previewMeta: { fontSize: '13px', color: '#5a6360', margin: 0 },

  btn:    { width: '100%', padding: '13px', background: '#002c13', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,44,19,0.22)', fontFamily: 'inherit', transition: 'background 0.18s' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  successWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif', padding: '24px' },
  successCard: { background: '#fff', borderRadius: '16px', padding: '52px 44px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(25,28,29,0.07)' },
  checkCircle: { width: '60px', height: '60px', borderRadius: '50%', background: '#014421', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
}

const focus = (e) => Object.assign(e.target.style, { borderColor: '#002c13', boxShadow: '0 0 0 3px rgba(0,44,19,0.08)' })
const blur  = (e) => Object.assign(e.target.style, { borderColor: 'rgba(192,201,190,0.45)', boxShadow: 'none' })

export default function JoinGroup() {
  const navigate = useNavigate()
  const [code,      setCode]      = useState('')
  const [preview,   setPreview]   = useState(null)  // group data after lookup
  const [looking,   setLooking]   = useState(false)
  const [joining,   setJoining]   = useState(false)
  const [error,     setError]     = useState('')
  const [joined,    setJoined]    = useState(false)

  // Look up the group by invite code
  const handleLookup = async () => {
    if (code.trim().length < 4) { setError('Enter a valid invite code.'); return }
    setError('')
    setLooking(true)
    setPreview(null)

    const { data, error: err } = await supabase
      .from('groups')
      .select('id,name,contribution_amount,payout_cycle,max_members')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle()

    if (err || !data) {
      setError('No group found with that code. Check with your admin.')
    } else {
      setPreview(data)
    }
    setLooking(false)
  }

  // Join the group
  const handleJoin = async () => {
    if (!preview) return
    setError('')
    setJoining(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      // Check already a member
      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', preview.id)
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (existing) { setError("You're already a member of this group."); setJoining(false); return }

      // Check max members
      if (preview.max_members) {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', preview.id)
        if (count >= preview.max_members) { setError('This group is full.'); setJoining(false); return }
      }

      const { error: mErr } = await supabase
        .from('group_members')
        .insert({ group_id: preview.id, user_id: session.user.id, role: 'member' })

      if (mErr) throw mErr
      setJoined(true)
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setJoining(false)
    }
  }

  if (joined) return (
    <div style={s.successWrap}>
      <div style={s.successCard}>
        <div style={s.checkCircle}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#191c1d', margin: '0 0 8px' }}>You're in! 🎉</h2>
        <p style={{ fontSize: '14px', color: '#5a6360', lineHeight: 1.6, margin: '0 0 28px' }}>
          You've joined <strong style={{ color: '#191c1d' }}>{preview?.name}</strong>. Head to your dashboard to see the group details.
        </p>
        <button style={s.btn} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    </div>
  )

  return (
    <div style={s.root}>
      <nav style={s.nav}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 10V21M9 10V21M15 10V21M19 10V21M12 3L2 9h20L12 3z" stroke="#002c13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brandName}>Heritage Ledger</span>
        </div>
        <Link to="/dashboard" style={{ fontSize: '13px', color: '#717970', textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={s.page}>
        <button style={s.back} onClick={() => navigate('/dashboard')}>← Back to dashboard</button>
        <h1 style={s.h1}>Join a group</h1>
        <p style={s.sub}>Enter the invite code your group admin shared with you.</p>

        <div style={s.card}>
          {error && <div style={s.error}>{error}</div>}

          <div style={s.field}>
            <label style={s.label}>Invite Code</label>
            <input
              style={s.codeInput}
              type="text"
              maxLength={8}
              placeholder="ABC123"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setPreview(null); setError('') }}
              onFocus={focus}
              onBlur={blur}
            />
          </div>

          {/* Group preview */}
          {preview && (
            <div style={s.preview}>
              <p style={s.previewName}>{preview.name}</p>
              <p style={s.previewMeta}>
                R {preview.contribution_amount} / {preview.payout_cycle} · {preview.max_members ? `up to ${preview.max_members} members` : 'Unlimited members'}
              </p>
            </div>
          )}

          {!preview ? (
            <button
              style={{ ...s.btn, ...(looking || code.length < 4 ? s.btnDisabled : {}) }}
              disabled={looking || code.length < 4}
              onClick={handleLookup}
            >
              {looking ? 'Looking up…' : 'Find Group'}
            </button>
          ) : (
            <button
              style={{ ...s.btn, ...(joining ? s.btnDisabled : {}) }}
              disabled={joining}
              onClick={handleJoin}
            >
              {joining ? 'Joining…' : `Join ${preview.name}`}
            </button>
          )}
        </div>

        <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(0,44,19,0.05)', borderRadius: '10px', border: '1px solid rgba(0,44,19,0.1)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#404941', lineHeight: 1.6 }}>
            <strong>Don't have a code?</strong> Ask your group admin — they receive it when they create the group. Want to start your own?{' '}
            <Link to="/create-group" style={{ color: '#002c13', fontWeight: '700', textDecoration: 'none' }}>Create a group</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
