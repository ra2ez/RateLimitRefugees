import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

function projectSavings(principal, annualRate, months) {
  if (!principal || principal <= 0) return 0
  const r = annualRate / 100 / 12
  return principal * Math.pow(1 + r, months)
}

// ── BUILD NOTIFICATIONS ───────────────────────────────────────────────────────
function buildNotifications(groups, contributions, meetings, payouts, members) {
  const notifs  = []
  const now     = new Date()

  // Map groupId -> groupName
  const groupMap = {}
  groups.forEach(g => { groupMap[g.id] = g.name })

  // Map userId -> name from members list (reliable fallback)
  const nameMap = {}
  members.forEach(m => {
    if (m.profiles?.full_name) nameMap[m.user_id] = m.profiles.full_name
  })
  const getName = (c) => c.profiles?.full_name ?? nameMap[c.user_id] ?? 'A member'

  // ── Pending contributions — one per contribution with member name and group
  contributions.filter(c => c.status === 'pending').forEach(c => {
    notifs.push({
      id:        `contrib-notif-${c.id}`,
      type:      'contribution',
      icon:      '💰',
      title:     `${getName(c)} logged a contribution`,
      body:      `R ${parseFloat(c.amount).toLocaleString()} — awaiting confirmation.`,
      groupId:   c.group_id,
      groupName: groupMap[c.group_id] ?? 'Unknown group',
      color:     '#d97706',
      bg:        'rgba(217,119,6,0.08)',
    })
  })

  // ── Missed contributions per group
  const missedByGroup = {}
  contributions.filter(c => c.status === 'missed').forEach(c => {
    if (!missedByGroup[c.group_id]) missedByGroup[c.group_id] = 0
    missedByGroup[c.group_id]++
  })
  Object.entries(missedByGroup).forEach(([gid, count]) => {
    notifs.push({
      id:        `missed-${gid}`,
      type:      'contribution',
      icon:      '⚠️',
      title:     `${count} missed contribution${count > 1 ? 's' : ''}`,
      body:      'Please follow up with your treasurer.',
      groupId:   gid,
      groupName: groupMap[gid] ?? 'Unknown group',
      color:     '#dc2626',
      bg:        'rgba(220,38,38,0.08)',
    })
  })

  // ── Upcoming meetings within next 7 days
  meetings.forEach(m => {
    const d    = new Date(m.meeting_date)
    const diff = (d - now) / (1000 * 60 * 60 * 24)
    if (diff < 0 || diff > 7) return
    notifs.push({
      id:        `meeting-${m.id}`,
      type:      'meeting',
      icon:      '📅',
      title:     `Upcoming: ${m.title}`,
      body:      `${d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${m.location ? ` · ${m.location}` : ''}`,
      groupId:   m.group_id,
      groupName: groupMap[m.group_id] ?? 'Unknown group',
      color:     '#1d4ed8',
      bg:        'rgba(59,130,246,0.08)',
    })
  })

  // ── Pending payouts per group
  const pendingPayoutsByGroup = {}
  payouts.filter(p => p.status === 'pending').forEach(p => {
    if (!pendingPayoutsByGroup[p.group_id]) pendingPayoutsByGroup[p.group_id] = { count: 0, total: 0 }
    pendingPayoutsByGroup[p.group_id].count++
    pendingPayoutsByGroup[p.group_id].total += parseFloat(p.amount)
  })
  Object.entries(pendingPayoutsByGroup).forEach(([gid, { count, total }]) => {
    notifs.push({
      id:        `payout-pending-${gid}`,
      type:      'payout',
      icon:      '💸',
      title:     `${count} payout${count > 1 ? 's' : ''} pending`,
      body:      `R ${total.toLocaleString()} to be paid out.`,
      groupId:   gid,
      groupName: groupMap[gid] ?? 'Unknown group',
      color:     '#014421',
      bg:        'rgba(1,68,33,0.08)',
    })
  })

  // ── Completed payouts in last 7 days
  payouts
    .filter(p => p.status === 'completed' && (now - new Date(p.created_at)) / (1000 * 60 * 60 * 24) <= 7)
    .forEach(p => {
      notifs.push({
        id:        `payout-done-${p.id}`,
        type:      'payout',
        icon:      '✅',
        title:     `Payout completed`,
        body:      `R ${parseFloat(p.amount).toLocaleString()} paid out${p.receiver?.full_name ? ` to ${p.receiver.full_name}` : ''}.`,
        groupId:   p.group_id,
        groupName: groupMap[p.group_id] ?? 'Unknown group',
        color:     '#15803d',
        bg:        'rgba(22,163,74,0.08)',
      })
    })

  // ── New members joined in last 7 days
  members
    .filter(m => m.joined_at && (now - new Date(m.joined_at)) / (1000 * 60 * 60 * 24) <= 7)
    .forEach(m => {
      notifs.push({
        id:        `member-${m.user_id}-${m.group_id}`,
        type:      'member',
        icon:      '🤝',
        title:     `New member joined`,
        body:      `${m.profiles?.full_name ?? 'Someone'} joined the group.`,
        groupId:   m.group_id,
        groupName: groupMap[m.group_id] ?? 'Unknown group',
        color:     '#775a19',
        bg:        'rgba(254,212,136,0.15)',
      })
    })

  return notifs
}
// ──────────────────────────────────────────────────────────────────────────────

const s = {
  root:        { minHeight: '100vh', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },

  // Nav
  nav:         { background: '#fff', borderBottom: '1px solid rgba(192,201,190,0.35)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 },
  brand:       { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon:   { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#c49a2a,#fed488)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:   { fontSize: '15px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.3px' },
  navRight:    { display: 'flex', alignItems: 'center', gap: '14px' },
  navEmail:    { fontSize: '13px', color: '#717970' },
  signOut:     { padding: '7px 16px', background: '#002c13', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', border: 'none', fontFamily: 'inherit' },

  // Bell
  bellBtn:     { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' },
  bellBadge:   { position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' },

  // Notification sidebar
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(25,28,29,0.3)', zIndex: 40, backdropFilter: 'blur(2px)' },
  sidebar:     { position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', background: '#fff', boxShadow: '-8px 0 32px rgba(25,28,29,0.12)', zIndex: 50, display: 'flex', flexDirection: 'column' },
  sidebarHead: { padding: '20px 24px 16px', borderBottom: '1px solid rgba(192,201,190,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  sidebarTitle:{ fontSize: '16px', fontWeight: '800', color: '#191c1d', margin: 0 },
  sidebarClose:{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#717970', padding: '2px', lineHeight: 1 },
  sidebarBody: { overflowY: 'auto', flex: 1, padding: '12px 16px' },

  // Notification item — clickable
  notifItem:   { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', transition: 'filter 0.15s' },
  notifIcon:   { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  notifTitle:  { fontSize: '13px', fontWeight: '700', margin: '0 0 2px' },
  notifBody:   { fontSize: '12px', color: '#717970', margin: '0 0 4px', lineHeight: 1.5 },
  notifGroup:  { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#002c13', background: 'rgba(0,44,19,0.07)', padding: '2px 8px', borderRadius: '20px' },
  emptyNotif:  { textAlign: 'center', padding: '48px 24px', color: '#9ca39a', fontSize: '13px' },

  // Page
  page:        { maxWidth: '1060px', margin: '0 auto', padding: '40px 40px' },
  header:      { marginBottom: '24px' },
  greeting:    { fontSize: '26px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.4px', margin: '0 0 4px' },
  subline:     { fontSize: '14px', color: '#5a6360', margin: 0 },

  // Rates banner
  ratesBanner:     { background: 'linear-gradient(135deg,#002c13,#014421)', borderRadius: '16px', padding: '20px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  ratesBannerLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  ratesBannerTitle:{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' },
  ratesBannerSub:  { fontSize: '11px', color: 'rgba(255,255,255,0.3)' },
  ratesRow:    { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  rateItem:    { display: 'flex', flexDirection: 'column', gap: '2px' },
  rateLabel:   { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  rateValue:   { fontSize: '26px', fontWeight: '800', color: '#fed488', letterSpacing: '-0.5px' },
  rateSub:     { fontSize: '11px', color: 'rgba(255,255,255,0.35)' },

  // Projection card
  projCard:    { background: '#fff', borderRadius: '16px', padding: '24px 28px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)' },
  projTitle:   { fontSize: '13px', fontWeight: '700', color: '#9ca39a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' },
  projGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' },
  projItem:    { display: 'flex', flexDirection: 'column', gap: '4px' },
  projLabel:   { fontSize: '11px', fontWeight: '600', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.08em' },
  projValue:   { fontSize: '22px', fontWeight: '800', color: '#002c13', letterSpacing: '-0.4px' },
  projSub:     { fontSize: '12px', color: '#9ca39a' },
  projNote:    { fontSize: '11px', color: '#9ca39a', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(192,201,190,0.25)' },

  // Empty state
  emptyWrap:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' },
  emptyCard:   { background: '#fff', borderRadius: '16px', padding: '40px 36px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' },
  emptyIcon:   { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '4px' },
  emptyH:      { fontSize: '17px', fontWeight: '800', color: '#191c1d', margin: 0 },
  emptyP:      { fontSize: '13px', color: '#5a6360', lineHeight: 1.6, margin: 0 },
  emptyBtn:    (accent) => ({ display: 'inline-block', marginTop: '8px', padding: '11px 28px', background: accent ? '#002c13' : 'transparent', color: accent ? '#fff' : '#002c13', border: accent ? 'none' : '1.5px solid #002c13', borderRadius: '9px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: accent ? '0 4px 12px rgba(0,44,19,0.22)' : 'none', cursor: 'pointer' }),

  // Group cards
  sectionTitle:{ fontSize: '13px', fontWeight: '700', color: '#9ca39a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' },
  groupCard:   { background: '#fff', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', marginBottom: '12px', cursor: 'pointer', transition: 'box-shadow 0.18s, border-color 0.18s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  gcLeft:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  gcName:      { fontSize: '17px', fontWeight: '800', color: '#002c13', margin: 0, letterSpacing: '-0.3px' },
  gcMeta:      { fontSize: '13px', color: '#717970', margin: 0 },
  gcRight:     { display: 'flex', alignItems: 'center', gap: '10px' },
  rolePill:    (r) => ({ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'capitalize', ...(r === 'admin' ? { background: 'rgba(254,212,136,0.2)', color: '#775a19' } : r === 'treasurer' ? { background: 'rgba(59,130,246,0.12)', color: '#1d4ed8' } : { background: 'rgba(0,44,19,0.08)', color: '#014421' }) }),
  arrow:       { fontSize: '18px', color: '#9ca39a' },

  loading:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif', color: '#5a6360', fontSize: '15px' },
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [user,        setUser]       = useState(null)
  const [profile,     setProfile]    = useState(null)
  const [groups,      setGroups]     = useState([])
  const [totalPool,   setTotalPool]  = useState(0)
  const [rates,       setRates]      = useState({ repo: null, prime: null })
  const [showNotifs,  setShowNotifs] = useState(false)
  const [seenIds,      setSeenIds]    = useState(() => new Set(JSON.parse(localStorage.getItem('seen_notifs') || '[]')))
  const [allContribs, setAllContribs] = useState([])
  const [allMeetings, setAllMeetings] = useState([])
  const [allPayouts,  setAllPayouts]  = useState([])
  const [allMembers,  setAllMembers]  = useState([])

  const [realtimeNotifs, setRealtimeNotifs] = useState([])
  const sidebarRef  = useRef(null)
  const groupIdsRef = useRef([])
  const userRef     = useRef(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { navigate('/login'); return }
      const u = session.user
      setUser(u)

      const [profRes, memsRes, contribsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', u.id).maybeSingle(),
        supabase.from('group_members').select('role, groups(id, name, contribution_amount, payout_cycle, max_members)').eq('user_id', u.id),
        supabase.from('contributions').select('amount, status').eq('user_id', u.id).in('status', ['confirmed', 'paid']),
      ])

      setProfile(profRes.data)

      let groupIds = []
      if (memsRes.data) {
        const grps = memsRes.data.filter(m => m.groups).map(m => ({ ...m.groups, myRole: m.role }))
        setGroups(grps)
        groupIds = grps.map(g => g.id)
        groupIdsRef.current = groupIds
      }
      userRef.current = u
      if (contribsRes.data) {
        setTotalPool(contribsRes.data.reduce((sum, c) => sum + parseFloat(c.amount), 0))
      }

      // Fetch cross-group data for notifications
      // We fetch contributions per group individually (same as GroupDashboard does)
      // to avoid RLS issues that block cross-group queries
      if (groupIds.length > 0) {
        const [nm, np, nmem] = await Promise.all([
          supabase.from('meetings').select('id, title, meeting_date, location, group_id').in('group_id', groupIds).order('meeting_date', { ascending: true }),
          supabase.from('payouts').select('id, amount, status, payout_date, created_at, group_id, receiver_id, receiver:profiles!payouts_receiver_id_fkey(full_name)').in('group_id', groupIds).order('created_at', { ascending: false }),
          supabase.from('group_members').select('user_id, joined_at, group_id, profiles(full_name)').in('group_id', groupIds).order('joined_at', { ascending: false }),
        ])

        // Fetch contributions per group individually — this respects RLS correctly
        const contribResults = await Promise.all(
          groupIds.map(gid =>
            supabase.from('contributions')
              .select('id, status, amount, group_id, user_id, payment_date, profiles(full_name)')
              .eq('group_id', gid)
          )
        )
        const allC = contribResults.flatMap(r => r.data ?? [])

        setAllContribs(allC)
        setAllMeetings(nm.data ?? [])
        setAllPayouts(np.data ?? [])
        setAllMembers(nmem.data ?? [])
      }
    })

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 4000)
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-sa-rates`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setRates(data))
      .catch(() => {})
      .finally(() => clearTimeout(timeout))

    // ── Realtime: new contribution logged in any of user's groups
    const contribChannel = supabase
      .channel('dashboard-contribs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contributions' }, async (payload) => {
        const gids = groupIdsRef.current
        const me   = userRef.current
        if (!gids.includes(payload.new.group_id)) return
        // fetch contributor name and group name
        const [profRes, grpRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', payload.new.user_id).maybeSingle(),
          supabase.from('groups').select('name').eq('id', payload.new.group_id).maybeSingle(),
        ])
        const who   = profRes.data?.full_name ?? 'A member'
        const grpNm = grpRes.data?.name ?? 'a group'
        // only notify admins/treasurers (not the person who logged it)
        if (me && payload.new.user_id !== me.id) {
          setRealtimeNotifs(prev => [{
            id:        `rt-contrib-${payload.new.id}`,
            type:      'contribution',
            icon:      '💰',
            title:     'New contribution logged',
            body:      `${who} logged R ${parseFloat(payload.new.amount).toLocaleString()} — awaiting confirmation.`,
            groupId:   payload.new.group_id,
            groupName: grpNm,
            color:     '#d97706',
            bg:        'rgba(217,119,6,0.08)',
          }, ...prev])
        }
        // also refresh allContribs
        setAllContribs(prev => [payload.new, ...prev])
      })
      .subscribe()

    // ── Realtime: payout initiated — notify the receiver
    const payoutChannel = supabase
      .channel('dashboard-payouts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payouts' }, async (payload) => {
        const gids = groupIdsRef.current
        const me   = userRef.current
        if (!gids.includes(payload.new.group_id)) return
        const [receiverRes, grpRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', payload.new.receiver_id).maybeSingle(),
          supabase.from('groups').select('name').eq('id', payload.new.group_id).maybeSingle(),
        ])
        const receiverName = receiverRes.data?.full_name ?? 'A member'
        const grpNm        = grpRes.data?.name ?? 'a group'
        setRealtimeNotifs(prev => [{
          id:        `rt-payout-${payload.new.id}`,
          type:      'payout',
          icon:      '💸',
          title:     me && payload.new.receiver_id === me.id ? '🎉 You have a payout!' : `Payout initiated`,
          body:      me && payload.new.receiver_id === me.id
            ? `R ${parseFloat(payload.new.amount).toLocaleString()} is being paid to you from ${grpNm}.`
            : `R ${parseFloat(payload.new.amount).toLocaleString()} payout to ${receiverName} in ${grpNm}.`,
          groupId:   payload.new.group_id,
          groupName: grpNm,
          color:     me && payload.new.receiver_id === me.id ? '#15803d' : '#014421',
          bg:        me && payload.new.receiver_id === me.id ? 'rgba(22,163,74,0.08)' : 'rgba(1,68,33,0.08)',
        }, ...prev])
        setAllPayouts(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(contribChannel)
      supabase.removeChannel(payoutChannel)
    }
  }, [navigate])

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!showNotifs) return
    const handle = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showNotifs])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const markAllSeen = (notifList) => {
    const newSeen = new Set([...seenIds, ...notifList.map(n => n.id)])
    setSeenIds(newSeen)
    localStorage.setItem('seen_notifs', JSON.stringify([...newSeen]))
  }

  const handleNotifClick = (groupId, notifId) => {
    const newSeen = new Set([...seenIds, notifId])
    setSeenIds(newSeen)
    localStorage.setItem('seen_notifs', JSON.stringify([...newSeen]))
    // Small delay so user sees it disappear before navigating
    setTimeout(() => {
      setShowNotifs(false)
      navigate(`/group/${groupId}`)
    }, 200)
  }

  if (!user) return (
    <div style={s.root}>
      <nav style={s.nav}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 10V21M9 10V21M15 10V21M19 10V21M12 3L2 9h20L12 3z" stroke="#002c13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brandName}>Stokvel Management Platform</span>
        </div>
      </nav>
      <div style={s.page}>
        <div style={{ height: '32px', width: '220px', background: 'rgba(192,201,190,0.3)', borderRadius: '8px', marginBottom: '12px' }} />
        <div style={{ height: '16px', width: '160px', background: 'rgba(192,201,190,0.2)', borderRadius: '6px', marginBottom: '32px' }} />
        <div style={{ height: '88px', background: 'rgba(192,201,190,0.2)', borderRadius: '16px', marginBottom: '20px' }} />
        <div style={{ height: '120px', background: 'rgba(192,201,190,0.15)', borderRadius: '16px' }} />
      </div>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0]
    ?? user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'

  const hasGroups = groups.length > 0
  const primeRate = rates.prime
  const repoRate  = rates.repo
  const proj6m    = primeRate ? projectSavings(totalPool, primeRate, 6)  : null
  const proj12m   = primeRate ? projectSavings(totalPool, primeRate, 12) : null
  const proj24m   = primeRate ? projectSavings(totalPool, primeRate, 24) : null
  const growth12m = proj12m != null ? proj12m - totalPool : null

  const builtNotifs   = buildNotifications(groups, allContribs, allMeetings, allPayouts, allMembers)
  const allNotifs     = [...realtimeNotifs, ...builtNotifs]
  const notifications = allNotifs.filter(n => !seenIds.has(n.id))
  const unreadCount   = notifications.length

  return (
    <div style={s.root}>

      {/* ── NOTIFICATION SIDEBAR ── */}
      {showNotifs && (
        <>
          <div style={s.overlay} />
          <div style={s.sidebar} ref={sidebarRef}>
            <div style={s.sidebarHead}>
              <p style={s.sidebarTitle}>
                🔔 Notifications
                {unreadCount > 0 && (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#717970', marginLeft: '6px' }}>({unreadCount})</span>
                )}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {notifications.length > 0 && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#775a19', fontWeight: '600', fontFamily: 'inherit' }} onClick={() => markAllSeen(notifications)}>
                    Mark all read
                  </button>
                )}
                <button style={s.sidebarClose} onClick={() => setShowNotifs(false)}>✕</button>
              </div>
            </div>
            <div style={s.sidebarBody}>
              {notifications.length === 0 ? (
                <div style={s.emptyNotif}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
                  <p style={{ fontWeight: '700', color: '#404941', margin: '0 0 4px' }}>All caught up!</p>
                  <p style={{ margin: 0 }}>No new notifications right now.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    style={{ ...s.notifItem, background: n.bg }}
                    onClick={() => handleNotifClick(n.groupId, n.id)}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.96)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    <div style={{ ...s.notifIcon, background: n.bg }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...s.notifTitle, color: n.color }}>{n.title}</p>
                      <p style={s.notifBody}>{n.body}</p>
                      <span style={s.notifGroup}>🏦 {n.groupName}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#9ca39a', flexShrink: 0 }}>→</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 10V21M9 10V21M15 10V21M19 10V21M12 3L2 9h20L12 3z" stroke="#002c13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brandName}>Stokvel Management Platform</span>
        </div>
        <div style={s.navRight}>
          <span style={s.navEmail}>{user?.email}</span>
          <button
            style={s.bellBtn}
            onClick={() => setShowNotifs(v => !v)}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,201,190,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#191c1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={s.bellBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <button style={s.signOut} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div style={s.page}>

        <div style={s.header}>
          <h1 style={s.greeting}>Good day, {firstName} 👋</h1>
          <p style={s.subline}>
            {hasGroups
              ? `You are in ${groups.length} group${groups.length > 1 ? 's' : ''}`
              : 'No group yet — get started below'}
          </p>
        </div>

        {/* Rates banner */}
        <div style={s.ratesBanner}>
          <div style={s.ratesBannerLeft}>
            <span style={s.ratesBannerTitle}>🏦 SA Live Rates</span>
            <span style={s.ratesBannerSub}>Source: South African Reserve Bank (SARB) · Live</span>
          </div>
          <div style={s.ratesRow}>
            <div style={s.rateItem}>
              <span style={s.rateLabel}>Repo Rate</span>
              <span style={s.rateValue}>{rates.repo != null ? `${rates.repo}%` : '…'}</span>
              <span style={s.rateSub}>SARB base rate</span>
            </div>
            <div style={s.rateItem}>
              <span style={s.rateLabel}>Prime Rate</span>
              <span style={s.rateValue}>{rates.prime != null ? `${rates.prime}%` : '…'}</span>
              <span style={s.rateSub}>Repo + 3.5%</span>
            </div>
          </div>
        </div>

        {/* Projection card */}
        {hasGroups && totalPool > 0 && (
          <div style={s.projCard}>
            <p style={s.projTitle}>Your Combined Savings Projection (All Groups)</p>
            <div style={s.projGrid}>
              <div style={s.projItem}>
                <span style={s.projLabel}>Current Total</span>
                <span style={s.projValue}>R {totalPool.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span style={s.projSub}>Confirmed across all groups</span>
              </div>
              <div style={s.projItem}>
                <span style={s.projLabel}>In 6 Months</span>
                <span style={s.projValue}>{proj6m ? `R ${proj6m.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '…'}</span>
                <span style={s.projSub}>{primeRate ? `At ${primeRate}% prime rate` : 'Loading rate…'}</span>
              </div>
              <div style={s.projItem}>
                <span style={s.projLabel}>In 12 Months</span>
                <span style={s.projValue}>{proj12m != null ? `R ${proj12m.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '…'}</span>
                <span style={s.projSub}>{growth12m != null ? `+R ${growth12m.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} growth` : ''}</span>
              </div>
              <div style={s.projItem}>
                <span style={s.projLabel}>In 24 Months</span>
                <span style={s.projValue}>{proj24m != null ? `R ${proj24m.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '…'}</span>
                <span style={s.projSub}>{primeRate ? `At ${primeRate}% prime rate` : ''}</span>
              </div>
            </div>
            <p style={s.projNote}>
              * Projections use compound interest based on the current SA prime lending rate of {primeRate ?? '…'}% (Repo: {repoRate ?? '…'}%).
              These are estimates for informational purposes only and do not constitute financial advice.
            </p>
          </div>
        )}

        {/* Empty state */}
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