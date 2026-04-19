import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const s = {
  root:   { minHeight: '100vh', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },

  nav:    { background: '#fff', borderBottom: '1px solid rgba(192,201,190,0.35)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 },
  brand:  { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon:{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#c49a2a,#fed488)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:{ fontSize: '15px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.3px' },

  page:   { maxWidth: '680px', margin: '0 auto', padding: '40px 24px' },
  back:   { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#717970', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', fontFamily: 'inherit' },
  h1:     { fontSize: '24px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.4px', margin: '0 0 4px' },
  sub:    { fontSize: '14px', color: '#5a6360', margin: '0 0 32px' },

  card:   { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(25,28,29,0.07)', border: '1px solid rgba(192,201,190,0.25)' },

  sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#9ca39a', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' },
  divider:{ height: '1px', background: 'rgba(192,201,190,0.3)', margin: '8px 0 24px' },

  row2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:  { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' },
  label:  { fontSize: '11px', fontWeight: '600', color: '#404941', letterSpacing: '0.08em', textTransform: 'uppercase' },
  hint:   { fontSize: '11px', color: '#9ca39a' },
  input:  { padding: '11px 13px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '8px', fontSize: '14px', color: '#191c1d', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.18s,box-shadow 0.18s' },
  prefixWrap: { position: 'relative' },
  prefixSym:  { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#717970', fontWeight: '600', pointerEvents: 'none' },
  prefixInput:{ paddingLeft: '26px' },
  textarea: { padding: '11px 13px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '8px', fontSize: '14px', color: '#191c1d', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '80px', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.18s,box-shadow 0.18s' },
  select: { padding: '11px 13px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '8px', fontSize: '14px', color: '#191c1d', fontFamily: 'inherit', outline: 'none', width: '100%', cursor: 'pointer', transition: 'border-color 0.18s,box-shadow 0.18s' },

  error:  { background: '#ffdad6', borderRadius: '10px', padding: '12px 16px', color: '#93000a', fontSize: '13px', marginBottom: '20px' },

  actions:{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  cancelBtn:{ padding: '11px 22px', background: 'transparent', border: '1.5px solid rgba(192,201,190,0.5)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#404941', cursor: 'pointer', fontFamily: 'inherit' },
  submitBtn:(loading) => ({ padding: '11px 28px', background: loading ? 'rgba(0,44,19,0.45)' : '#002c13', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 12px rgba(0,44,19,0.22)', transition: 'background 0.18s' }),

  successWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif', padding: '24px' },
  successCard: { background: '#fff', borderRadius: '16px', padding: '52px 44px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(25,28,29,0.07)' },
  checkCircle: { width: '60px', height: '60px', borderRadius: '50%', background: '#014421', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  codeBox: { marginTop: '24px', padding: '16px 20px', background: '#f0f2f0', borderRadius: '12px', border: '1px dashed rgba(0,44,19,0.2)' },
  codeLabel:{ fontSize: '11px', fontWeight: '700', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' },
  code:    { fontSize: '22px', fontWeight: '800', color: '#002c13', letterSpacing: '0.15em', fontFamily: 'monospace' },
  codeHint:{ fontSize: '12px', color: '#9ca39a', marginTop: '6px' },
}

const focus = (e) => Object.assign(e.target.style, { borderColor: '#002c13', boxShadow: '0 0 0 3px rgba(0,44,19,0.08)' })
const blur  = (e) => Object.assign(e.target.style, { borderColor: 'rgba(192,201,190,0.45)', boxShadow: 'none' })

export default function CreateGroup() {
  const navigate = useNavigate()
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [amount,      setAmount]      = useState('')
  const [maxMembers,  setMaxMembers]  = useState('')
  const [payout,      setPayout]      = useState('monthly')
  const [meeting,     setMeeting]     = useState('monthly')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [created,     setCreated]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Group name is required.'); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Enter a valid contribution amount.'); return }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('session user id:', session?.user?.id)
      console.log('session:', session)

      if (!session) { navigate('/login'); return }

      console.log('inserting group with created_by:', session.user.id)

      const { data: group, error: gErr } = await supabase
        .from('groups')
        .insert({
          name:                name.trim(),
          description:         description.trim() || null,
          contribution_amount: Number(amount),
          payout_cycle:        payout,
          meeting_frequency:   meeting,
          max_members:         maxMembers ? Number(maxMembers) : null,
          created_by:          session.user.id,
        })
        .select()
        .single()

      console.log('group insert result:', group, 'error:', gErr)

      if (gErr) throw gErr

      const { error: mErr } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: session.user.id, role: 'admin' })

      console.log('member insert error:', mErr)

      if (mErr) throw mErr

      setCreated({ name: name.trim(), inviteCode: group.invite_code })
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (created) return (
    <div style={s.successWrap}>
      <div style={s.successCard}>
        <div style={s.checkCircle}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#191c1d', margin: '0 0 8px' }}>Group Created!</h2>
        <p style={{ fontSize: '14px', color: '#5a6360', lineHeight: 1.6, margin: '0 0 4px' }}>
          <strong style={{ color: '#191c1d' }}>{created.name}</strong> is ready. Share the invite code below with your members.
        </p>
        <div style={s.codeBox}>
          <p style={s.codeLabel}>Invite Code</p>
          <p style={s.code}>{created.inviteCode}</p>
          <p style={s.codeHint}>Members use this code on the "Join Group" page.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
          <button style={s.cancelBtn} onClick={() => { setCreated(null); setName(''); setAmount(''); setDescription(''); setMaxMembers('') }}>Create Another</button>
          <button style={s.submitBtn(false)} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
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
        <h1 style={s.h1}>Create a stokvel group</h1>
        <p style={s.sub}>Set up your group — members join using an invite code you'll receive after creation.</p>

        <div style={s.card}>
          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <p style={s.sectionLabel}>Group info</p>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Group name <span style={{ color: '#ba1a1a' }}>*</span></label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ikhaya Savings Circle"
                  style={s.input} onFocus={focus} onBlur={blur} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Max members</label>
                <input type="number" min="2" max="100" value={maxMembers} onChange={e => setMaxMembers(e.target.value)}
                  placeholder="e.g. 10 (optional)"
                  style={s.input} onFocus={focus} onBlur={blur} />
                <span style={s.hint}>Leave blank for unlimited</span>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="What is this group saving for? Any rules members should know?"
                style={s.textarea} onFocus={focus} onBlur={blur} />
            </div>

            <div style={s.divider} />
            <p style={s.sectionLabel}>Financial setup</p>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Monthly contribution <span style={{ color: '#ba1a1a' }}>*</span></label>
                <div style={s.prefixWrap}>
                  <span style={s.prefixSym}>R</span>
                  <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="500"
                    style={{ ...s.input, ...s.prefixInput }} onFocus={focus} onBlur={blur} />
                </div>
                <span style={s.hint}>Amount per member per cycle</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Payout cycle</label>
                <select value={payout} onChange={e => setPayout(e.target.value)} style={s.select} onFocus={focus} onBlur={blur}>
                  <option value="monthly">Monthly</option>
                  <option value="bi-monthly">Bi-monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
                <span style={s.hint}>How often one member receives the pot</span>
              </div>
            </div>

            <div style={{ ...s.field, maxWidth: '50%' }}>
              <label style={s.label}>Meeting frequency</label>
              <select value={meeting} onChange={e => setMeeting(e.target.value)} style={s.select} onFocus={focus} onBlur={blur}>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div style={s.actions}>
              <button type="button" style={s.cancelBtn} onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" disabled={loading} style={s.submitBtn(loading)}>
                {loading ? 'Creating…' : 'Create group'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(0,44,19,0.05)', borderRadius: '10px', border: '1px solid rgba(0,44,19,0.1)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#404941', lineHeight: 1.6 }}>
            <strong>Note:</strong> After creating the group you'll get an <strong>invite code</strong>. Share it with members so they can join from the Join Group page. Your role will be set to <strong>admin</strong> automatically.
          </p>
        </div>
      </div>
    </div>
  )
}