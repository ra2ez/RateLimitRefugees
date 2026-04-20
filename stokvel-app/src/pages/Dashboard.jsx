import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

const s = {
  root:    { minHeight: '100vh', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },

  nav:     { background: '#fff', borderBottom: '1px solid rgba(192,201,190,0.35)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 },
  brand:   { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon:{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#c49a2a,#fed488)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:{ fontSize: '15px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.3px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  navEmail: { fontSize: '13px', color: '#717970' },
  signOut: { padding: '7px 16px', background: '#002c13', borderRadius: '8px', fontSize: '13px', fontWeight: '600',color: '#fff', cursor: 'pointer' },

  page:    { maxWidth: '1060px', margin: '0 auto', padding: '40px 40px' },

  header:    { marginBottom: '32px' },
  greeting:  { fontSize: '26px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.4px', margin: '0 0 4px' },
  subline:   { fontSize: '14px', color: '#5a6360', margin: 0 },

  // empty state
  emptyWrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' },
  emptyCard: { background: '#fff', borderRadius: '16px', padding: '40px 36px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' },
  emptyIcon: { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '4px' },
  emptyH:    { fontSize: '17px', fontWeight: '800', color: '#191c1d', margin: 0 },
  emptyP:    { fontSize: '13px', color: '#5a6360', lineHeight: 1.6, margin: 0 },
  emptyBtn:  (accent) => ({ display: 'inline-block', marginTop: '8px', padding: '11px 28px', background: accent ? '#002c13' : 'transparent', color: accent ? '#fff' : '#002c13', border: accent ? 'none' : '1.5px solid #002c13', borderRadius: '9px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: accent ? '0 4px 12px rgba(0,44,19,0.22)' : 'none', cursor: 'pointer' }),

  // group card
  sectionTitle: { fontSize: '13px', fontWeight: '700', color: '#9ca39a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' },
  groupCard: { background: '#fff', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', marginBottom: '12px', cursor: 'pointer', transition: 'box-shadow 0.18s, border-color 0.18s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  gcLeft:    { display: 'flex', flexDirection: 'column', gap: '4px' },
  gcName:    { fontSize: '17px', fontWeight: '800', color: '#002c13', margin: 0, letterSpacing: '-0.3px' },
  gcMeta:    { fontSize: '13px', color: '#717970', margin: 0 },
  gcRight:   { display: 'flex', alignItems: 'center', gap: '10px' },
  rolePill:  (r) => ({ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'capitalize', ...(r === 'admin' ? { background: 'rgba(254,212,136,0.2)', color: '#775a19' } : r === 'treasurer' ? { background: 'rgba(59,130,246,0.12)', color: '#1d4ed8' } : { background: 'rgba(0,44,19,0.08)', color: '#014421' }) }),
  arrow:     { fontSize: '18px', color: '#9ca39a' },

  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif', color: '#5a6360', fontSize: '15px' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading,     setLoading]     = useState(true)
  const [user,        setUser]        = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [groups,      setGroups]      = useState([]) // all groups user belongs to

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate('/login'); return }
      const u = data.session.user
      setUser(u)

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', u.id).maybeSingle()
      setProfile(prof)

      // fetch ALL groups the user belongs to
      const { data: mems } = await supabase
        .from('group_members')
        .select('role, groups(id, name, contribution_amount, payout_cycle, max_members)')
        .eq('user_id', u.id)

      if (mems) {
        setGroups(mems.filter(m => m.groups).map(m => ({ ...m.groups, myRole: m.role })))
      }

      setLoading(false)
    })
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <div style={s.loading}>Loading your dashboard…</div>

  const firstName = profile?.full_name?.split(' ')[0]
    ?? user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'

  const hasGroups = groups.length > 0

  return (
    <div style={s.root}>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 10V21M9 10V21M15 10V21M19 10V21M12 3L2 9h20L12 3z"
                stroke="#002c13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brandName}>Stokvel Management Platform</span>
        </div>
        <div style={s.navRight}>
          <span style={s.navEmail}>{user?.email}</span>
          <button style={s.signOut} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <h1 style={s.greeting}>Good day, {firstName} 👋</h1>
          <p style={s.subline}>
            {hasGroups ? `You are in ${groups.length} group${groups.length > 1 ? 's' : ''}` : 'No group yet — get started below'}
          </p>
        </div>

        {/* No group */}
        {!hasGroups && (
          <div style={s.emptyWrap}>
            <div style={s.emptyCard}>
              <div style={{ ...s.emptyIcon, background: 'rgba(0,44,19,0.07)' }}>🏦</div>
              <h3 style={s.emptyH}>Create a Group</h3>
              <p style={s.emptyP}>Start your own stokvel. Set the contribution amount, payout cycle, and invite your members.</p>
              <Link to="/create-group" style={s.emptyBtn(true)}>+ Create Group</Link>
            </div>
            <div style={s.emptyCard}>
              <div style={{ ...s.emptyIcon, background: 'rgba(254,212,136,0.15)' }}>🤝</div>
              <h3 style={s.emptyH}>Join a Group</h3>
              <p style={s.emptyP}>Enter an invite code shared by your group admin to join an existing stokvel circle.</p>
              <Link to="/join-group" style={s.emptyBtn(false)}>Join with Code</Link>
            </div>
          </div>
        )}

        {/* Groups list */}
        {hasGroups && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={s.sectionTitle}>Your groups</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/join-group"   style={{ ...s.emptyBtn(false), marginTop: 0, padding: '8px 16px', fontSize: '13px' }}>Join Group</Link>
                <Link to="/create-group" style={{ ...s.emptyBtn(true),  marginTop: 0, padding: '8px 16px', fontSize: '13px' }}>+ New Group</Link>
              </div>
            </div>

            {groups.map(g => (
              <div
                key={g.id}
                style={s.groupCard}
                onClick={() => navigate(`/group/${g.id}`)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,44,19,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,44,19,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(25,28,29,0.06)'; e.currentTarget.style.borderColor = 'rgba(192,201,190,0.25)' }}
              >
                <div style={s.gcLeft}>
                  <p style={s.gcName}>{g.name}</p>
                  <p style={s.gcMeta}>
                    R {g.contribution_amount} · <span style={{ textTransform: 'capitalize' }}>{g.payout_cycle}</span> payouts
                    {g.max_members ? ` · up to ${g.max_members} members` : ''}
                  </p>
                </div>
                <div style={s.gcRight}>
                  <span style={s.rolePill(g.myRole)}>{g.myRole}</span>
                  <span style={s.arrow}>→</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}