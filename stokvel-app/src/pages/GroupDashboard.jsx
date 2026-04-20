import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const s = {
  root:    { minHeight: '100vh', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },
  nav:     { background: '#fff', borderBottom: '1px solid rgba(192,201,190,0.35)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 },
  brand:   { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon:{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#c49a2a,#fed488)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:{ fontSize: '15px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.3px' },

  page:    { maxWidth: '1060px', margin: '0 auto', padding: '40px 40px' },
  back:    { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#717970', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', fontFamily: 'inherit' },

  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  h1:      { fontSize: '26px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.4px', margin: '0 0 6px' },
  subline: { fontSize: '14px', color: '#5a6360', margin: 0 },
  rolePill:(r) => ({ display: 'inline-flex', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'capitalize', ...(r === 'admin' ? { background: 'rgba(254,212,136,0.2)', color: '#775a19' } : r === 'treasurer' ? { background: 'rgba(59,130,246,0.12)', color: '#1d4ed8' } : { background: 'rgba(0,44,19,0.08)', color: '#014421' }) }),

  // tabs
  tabBar:  { display: 'flex', gap: '4px', borderBottom: '1px solid rgba(192,201,190,0.35)', marginBottom: '28px' },
  tab:     (active) => ({ padding: '10px 18px', background: 'none', border: 'none', borderBottom: active ? '2px solid #002c13' : '2px solid transparent', color: active ? '#002c13' : '#717970', fontWeight: active ? '700' : '500', cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize', fontFamily: 'inherit', marginBottom: '-1px' }),

  // alerts
  alertErr:  { background: '#ffdad6', borderRadius: '10px', padding: '12px 16px', color: '#93000a', fontSize: '13px', marginBottom: '20px' },
  alertOk:   { background: '#d8f3dc', borderRadius: '10px', padding: '12px 16px', color: '#014421', fontSize: '13px', marginBottom: '20px' },

  // invite code banner
  codeBanner: { background: 'linear-gradient(135deg,#002c13,#014421)', borderRadius: '14px', padding: '20px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  codeBannerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  codeBannerLabel: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' },
  codeBannerCode: { fontSize: '22px', fontWeight: '800', color: '#fed488', letterSpacing: '0.2em', fontFamily: 'monospace' },
  codeBannerHint: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  copyBtn: { padding: '8px 18px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' },

  // stat cards
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '28px' },
  card:    { background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)' },
  clabel:  { fontSize: '11px', fontWeight: '600', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' },
  cvalue:  { fontSize: '24px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.5px', margin: '0 0 4px' },
  csub:    { fontSize: '12px', color: '#9ca39a', margin: 0 },

  sectionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#191c1d', margin: 0 },

  // tables
  tableWrap: { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', marginBottom: '28px' },
  tableHead: (cols) => ({ display: 'grid', gridTemplateColumns: cols, padding: '12px 20px', borderBottom: '1px solid rgba(192,201,190,0.3)', background: '#fafbfa' }),
  tableHCell:{ fontSize: '11px', fontWeight: '600', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.08em' },
  tableRow:  (cols, last) => ({ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: last ? 'none' : '1px solid rgba(192,201,190,0.15)', alignItems: 'center' }),
  tCell:     { fontSize: '13px', color: '#191c1d' },
  tCellSub:  { fontSize: '13px', color: '#717970' },
  emptyRow:  { padding: '32px 20px', textAlign: 'center', fontSize: '13px', color: '#9ca39a' },

  // status pills
  statusPill: (s) => {
    if (s === 'confirmed' || s === 'paid' || s === 'completed') return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#15803d', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: '20px' }
    if (s === 'pending') return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#92400e', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '20px' }
    if (s === 'missed') return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#b91c1c', background: 'rgba(220,38,38,0.09)', padding: '2px 8px', borderRadius: '20px' }
    return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#717970', background: 'rgba(192,201,190,0.2)', padding: '2px 8px', borderRadius: '20px' }
  },

  // action buttons
  btnPrimary: { padding: '8px 18px', background: '#002c13', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnSuccess: { padding: '5px 12px', background: '#014421', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger:  { padding: '5px 12px', background: '#ffdad6', color: '#93000a', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },

  // settings form
  settingsCard: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(25,28,29,0.07)', border: '1px solid rgba(192,201,190,0.25)', maxWidth: '560px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:  { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' },
  label:  { fontSize: '11px', fontWeight: '600', color: '#404941', letterSpacing: '0.08em', textTransform: 'uppercase' },
  input:  { padding: '11px 13px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '8px', fontSize: '14px', color: '#191c1d', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '11px 13px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '8px', fontSize: '14px', color: '#191c1d', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '80px', width: '100%', boxSizing: 'border-box' },
  select: { padding: '11px 13px', background: '#fafbfa', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '8px', fontSize: '14px', color: '#191c1d', fontFamily: 'inherit', outline: 'none', width: '100%' },

  // meetings
  meetingCard: { background: '#fff', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', marginBottom: '12px' },

  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif', color: '#5a6360', fontSize: '15px' },
  notFound:{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },
}

const TABS = {
  admin:     ['overview', 'members', 'contributions', 'meetings', 'payouts', 'settings'],
  treasurer: ['overview', 'members', 'contributions', 'meetings', 'payouts'],
  member:    ['overview', 'members', 'contributions', 'meetings', 'payouts'],
}

export default function GroupDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading,       setLoading]       = useState(true)
  const [group,         setGroup]         = useState(null)
  const [myRole,        setMyRole]        = useState(null)
  const [currentUser,   setCurrentUser]   = useState(null)
  const [members,       setMembers]       = useState([])
  const [contributions, setContributions] = useState([])
  const [meetings,      setMeetings]      = useState([])
  const [payouts,       setPayouts]       = useState([])
  const [activeTab,     setActiveTab]     = useState('overview')
  const [copied,        setCopied]        = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState('')

  // meeting form state
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [meetingForm, setMeetingForm] = useState({ title: '', meeting_date: '', location: '', meeting_link: '', agenda: '' })
  const [savingMeeting, setSavingMeeting] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutForm, setPayoutForm] = useState({ receiver_id: '', amount: '', payout_date: '' })
  const [savingPayout, setSavingPayout] = useState(false)
  const [showContribForm, setShowContribForm] = useState(false)
  const [contribForm, setContribForm] = useState({ amount: '', payment_method: '', payment_date: '' })
  const [savingContrib, setSavingContrib] = useState(false)

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
    setCurrentUser(session.user)

    const { data: grp } = await supabase.from('groups').select('*').eq('id', id).maybeSingle()
    if (!grp) { setLoading(false); return }
    setGroup(grp)

    const { data: me } = await supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', session.user.id).maybeSingle()
    setMyRole(me?.role ?? null)

    const { data: mems } = await supabase.from('group_members').select('role, user_id, joined_at, profiles(full_name, email)').eq('group_id', id)
    setMembers(mems ?? [])

    const { data: contribs } = await supabase.from('contributions').select('id, user_id, amount, status, payment_date, payment_method, profiles(full_name)').eq('group_id', id).order('created_at', { ascending: false })
    setContributions(contribs ?? [])

    const { data: meets } = await supabase.from('meetings').select('*').eq('group_id', id).order('meeting_date', { ascending: true })
    setMeetings(meets ?? [])

    const { data: pays } = await supabase.from('payouts').select('id, amount, status, payout_date, created_at, receiver:profiles!payouts_receiver_id_fkey(full_name)').eq('group_id', id).order('created_at', { ascending: false })
    setPayouts(pays ?? [])

    setLoading(false)
  }

  function notify(type, msg) {
    if (type === 'error') setError(msg)
    else setSuccess(msg)
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase.from('group_members').update({ role: newRole }).eq('group_id', id).eq('user_id', userId)
    if (error) { notify('error', error.message); return }
    setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole } : m))
    notify('ok', 'Role updated.')
  }

  const handleConfirm = async (contributionId) => {
    const { error } = await supabase.from('contributions').update({ status: 'confirmed', confirmed_by: currentUser.id, confirmed_at: new Date().toISOString() }).eq('id', contributionId)
    if (error) { notify('error', error.message); return }
    setContributions(contributions.map(c => c.id === contributionId ? { ...c, status: 'confirmed' } : c))
    notify('ok', 'Contribution confirmed.')
  }

  const handleFlag = async (contributionId) => {
    const { error } = await supabase.from('contributions').update({ status: 'missed' }).eq('id', contributionId)
    if (error) { notify('error', error.message); return }
    setContributions(contributions.map(c => c.id === contributionId ? { ...c, status: 'missed' } : c))
    notify('ok', 'Contribution flagged as missed.')
  }
  const handleUnflag = async (contributionId) => {
    const { error } = await supabase.from('contributions').update({ status: 'pending' }).eq('id', contributionId)
    if (error) { notify('error', error.message); return }
    setContributions(contributions.map(c => c.id === contributionId ? { ...c, status: 'pending' } : c))
    notify('ok', 'Contribution unflagged, status set back to pending.')
    }

  const handleSaveMeeting = async (e) => {
    e.preventDefault()
    setSavingMeeting(true)
    const { data, error } = await supabase.from('meetings').insert({ ...meetingForm, group_id: id }).select().single()
    if (error) { notify('error', error.message); setSavingMeeting(false); return }
    setMeetings([...meetings, data])
    setShowMeetingForm(false)
    setMeetingForm({ title: '', meeting_date: '', location: '', meeting_link: '', agenda: '' })
    notify('ok', 'Meeting scheduled.')
    setSavingMeeting(false)
  }
  
  const handleDeleteMeeting = async (meetingId) => {
  if (!window.confirm('Delete this meeting?')) return
  const { error } = await supabase.from('meetings').delete().eq('id', meetingId)
  if (error) { notify('error', error.message); return }
  setMeetings(meetings.filter(m => m.id !== meetingId))
  notify('ok', 'Meeting deleted.')
}

const handleEditMeeting = async (e) => {
  e.preventDefault()
  setSavingMeeting(true)
  const { error } = await supabase.from('meetings').update({
    title: editingMeeting.title,
    meeting_date: editingMeeting.meeting_date,
    location: editingMeeting.location,
    meeting_link: editingMeeting.meeting_link,
    agenda: editingMeeting.agenda,
    minutes: editingMeeting.minutes,
  }).eq('id', editingMeeting.id)
  if (error) { notify('error', error.message); setSavingMeeting(false); return }
    setMeetings(meetings.map(m => m.id === editingMeeting.id ? { ...m, ...editingMeeting } : m))
    setEditingMeeting(null)
    notify('ok', 'Meeting updated.')
    setSavingMeeting(false)
}

const handleInitiatePayout = async (e) => {
  e.preventDefault()
  setSavingPayout(true)
  const { data, error } = await supabase.from('payouts').insert({
    group_id: id,
    receiver_id: payoutForm.receiver_id,
    amount: parseFloat(payoutForm.amount),
    payout_date: payoutForm.payout_date || new Date().toISOString(),
    status: 'pending',
    initiated_by: currentUser.id
  }).select(`id, amount, status, payout_date, created_at, receiver:profiles!payouts_receiver_id_fkey(full_name)`).single()
  if (error) { notify('error', error.message); setSavingPayout(false); return }
  setPayouts([data, ...payouts])
  setShowPayoutForm(false)
  setPayoutForm({ receiver_id: '', amount: '', payout_date: '' })
  notify('ok', 'Payout initiated.')
  setSavingPayout(false)
}
const handleUpdatePayoutStatus = async (payoutId, newStatus) => {
  const { error } = await supabase.from('payouts').update({ status: newStatus }).eq('id', payoutId)
  if (error) { notify('error', error.message); return }
  setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status: newStatus } : p))
  notify('ok', 'Payout status updated.')
}
const handleLogContribution = async (e) => {
  e.preventDefault()
  setSavingContrib(true)
  const { data, error } = await supabase.from('contributions').insert({
    group_id: id,
    user_id: currentUser.id,
    amount: parseFloat(contribForm.amount),
    payment_method: contribForm.payment_method || null,
    payment_date: contribForm.payment_date || new Date().toISOString(),
    status: 'pending'
  }).select('id, user_id, amount, status, payment_date, payment_method, profiles(full_name)').single()
  if (error) { notify('error', error.message); setSavingContrib(false); return }
  setContributions([data, ...contributions])
  setShowContribForm(false)
  setContribForm({ amount: '', payment_method: '', payment_date: '' })
  notify('ok', 'Contribution logged! Awaiting confirmation from treasurer.')
  setSavingContrib(false)
}
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const updates = {
      name:                fd.get('name'),
      description:         fd.get('description'),
      contribution_amount: parseFloat(fd.get('contribution_amount')),
      payout_cycle:        fd.get('payout_cycle'),
      meeting_frequency:   fd.get('meeting_frequency'),
      max_members:         fd.get('max_members') ? parseInt(fd.get('max_members')) : null,
    }
    const { error } = await supabase.from('groups').update(updates).eq('id', id)
    if (error) { notify('error', error.message); return }
    setGroup({ ...group, ...updates })
    notify('ok', 'Settings saved.')
  }

  if (loading) return <div style={s.loading}>Loading group…</div>
  if (!group)  return (
    <div style={s.notFound}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#191c1d', marginBottom: '12px' }}>Group not found</p>
        <button style={s.btnPrimary} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  )

  const totalPool = contributions
  .filter(c => c.status === 'confirmed' || c.status === 'paid')
  .reduce((sum, c) => sum + parseFloat(c.amount), 0)
  const paidCount  = contributions.filter(c => c.status === 'confirmed' || c.status === 'paid').length
  const myContribs = contributions.filter(c => c.user_id === currentUser?.id)
  const tabs       = TABS[myRole] ?? TABS.member

  const MEMBER_COLS  = myRole === 'admin' ? '1fr 120px 140px 120px' : '1fr 120px 140px'
  const CONTRIB_COLS = myRole !== 'member' ? '1fr 100px 110px 120px 100px 120px' : '100px 110px 120px 100px'
  const PAYOUT_COLS  = myRole === 'member' ? '1fr 120px 120px 110px' : '1fr 120px 120px 110px 140px'

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
        <Link to="/dashboard" style={{ fontSize: '13px', color: '#717970', textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={s.page}>
        <button style={s.back} onClick={() => navigate('/dashboard')}>← Back to dashboard</button>

        {/* Header */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.h1}>{group.name}</h1>
            <p style={s.subline}>{group.description ?? 'No description'}</p>
          </div>
          {myRole && <span style={s.rolePill(myRole)}>{myRole}</span>}
        </div>

        {/* Alerts */}
        {error   && <div style={s.alertErr}>{error}</div>}
        {success && <div style={s.alertOk}>{success}</div>}

        {/* Invite code banner — admin only */}
        {myRole === 'admin' && group.invite_code && (
          <div style={s.codeBanner}>
            <div style={s.codeBannerLeft}>
              <span style={s.codeBannerLabel}>Invite Code</span>
              <span style={s.codeBannerCode}>{group.invite_code}</span>
              <span style={s.codeBannerHint}>Share this code with members so they can join.</span>
            </div>
            <button style={s.copyBtn} onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy Code'}</button>
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabBar}>
          {tabs.map(t => (
            <button key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={s.grid}>
            <div style={s.card}>
              <p style={s.clabel}>Total Pool</p>
              <p style={s.cvalue}>R {totalPool.toLocaleString()}</p>
              <p style={s.csub}>{contributions.filter(c => c.status === 'confirmed' || c.status === 'paid').length} confirmed contributions</p>
            </div>
            <div style={s.card}>
              <p style={s.clabel}>Contribution</p>
              <p style={s.cvalue}>R {group.contribution_amount}</p>
              <p style={s.csub}>Per {group.payout_cycle}</p>
            </div>
            <div style={s.card}>
              <p style={s.clabel}>Payout Cycle</p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#191c1d', margin: '0 0 4px', textTransform: 'capitalize' }}>{group.payout_cycle}</p>
              <p style={s.csub}>Meeting: {group.meeting_frequency}</p>
            </div>
            <div style={s.card}>
              <p style={s.clabel}>My Contributions</p>
              <p style={s.cvalue}>{myContribs.length}</p>
              <p style={s.csub}>{myContribs.filter(c => c.status === 'confirmed').length} confirmed</p>
            </div>
            <div style={s.card}>
              <p style={s.clabel}>Confirmed</p>
              <p style={s.cvalue}>{paidCount}</p>
              <p style={s.csub}>This cycle</p>
            </div>
            <div style={s.card}>
              <p style={s.clabel}>Meetings</p>
              <p style={s.cvalue}>{meetings.length}</p>
              <p style={s.csub}>Scheduled</p>
            </div>
          </div>
        )}

        {/* ── MEMBERS ── */}
        {activeTab === 'members' && (
          <>
            <div style={s.sectionRow}>
              <p style={s.sectionTitle}>Members ({members.length})</p>
            </div>
            <div style={s.tableWrap}>
              <div style={s.tableHead(MEMBER_COLS)}>
                <span style={s.tableHCell}>Name</span>
                <span style={s.tableHCell}>Role</span>
                <span style={s.tableHCell}>Joined</span>
                {myRole === 'admin' && <span style={s.tableHCell}>Change Role</span>}
              </div>
              {members.length === 0 && <div style={s.emptyRow}>No members yet.</div>}
              {members.map((m, i) => (
                <div key={m.user_id} style={s.tableRow(MEMBER_COLS, i === members.length - 1)}>
                  <div>
                    <span style={s.tCell}>{m.profiles?.full_name ?? 'Unknown'}</span>
                    {m.profiles?.email && <div style={{ fontSize: '12px', color: '#9ca39a' }}>{m.profiles.email}</div>}
                  </div>
                  <span style={s.rolePill(m.role)}>{m.role}</span>
                  <span style={s.tCellSub}>
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  {myRole === 'admin' && (
                    m.user_id === currentUser?.id
                      ? <span style={s.tCellSub}>You</span>
                      : <select
                          value={m.role}
                          onChange={e => handleRoleChange(m.user_id, e.target.value)}
                          style={{ padding: '6px 10px', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '6px', fontSize: '13px', outline: 'none', cursor: 'pointer', background: '#fafbfa' }}
                        >
                          <option value="member">Member</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="admin">Admin</option>
                        </select>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CONTRIBUTIONS ── */}
        {activeTab === 'contributions' && (
          <>
            <div style={s.sectionRow}>
                <p style={s.sectionTitle}>
                    {myRole === 'member' ? 'My Contributions' : `All Contributions (${contributions.length})`}
                </p>
                <button style={s.btnPrimary} onClick={() => setShowContribForm(!showContribForm)}>
                    {showContribForm ? 'Cancel' : '+ Log Contribution'}
                </button>
            </div>

                {showContribForm && (
                <div style={{ ...s.settingsCard, marginBottom: '24px', maxWidth: '100%' }}>
                    <p style={{ fontWeight: '700', color: '#191c1d', margin: '0 0 16px' }}>Log a Contribution</p>
                    <form onSubmit={handleLogContribution} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={s.fieldRow}>
                        <div style={s.field}>
                        <label style={s.label}>Amount (R) *</label>
                        <input required type="number" min="1" style={s.input}
                            value={contribForm.amount}
                            onChange={e => setContribForm({ ...contribForm, amount: e.target.value })}
                            placeholder={`e.g. ${group.contribution_amount}`} />
                        </div>
                        <div style={s.field}>
                        <label style={s.label}>Payment Method</label>
                        <select style={s.select} value={contribForm.payment_method} onChange={e => setContribForm({ ...contribForm, payment_method: e.target.value })}>
                            <option value="">Select method</option>
                            <option value="EFT">EFT</option>
                            <option value="Cash">Cash</option>
                            <option value="PayFast">PayFast</option>
                            <option value="SnapScan">SnapScan</option>
                            <option value="Other">Other</option>
                        </select>
                        </div>
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Payment Date</label>
                        <input type="date" style={s.input}
                        value={contribForm.payment_date}
                        onChange={e => setContribForm({ ...contribForm, payment_date: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={savingContrib} style={{ ...s.btnPrimary, opacity: savingContrib ? 0.6 : 1 }}>
                        {savingContrib ? 'Logging…' : 'Log Contribution'}
                        </button>
                    </div>
                    </form>
                </div>
                )}
            <div style={s.tableWrap}>
              <div style={s.tableHead(CONTRIB_COLS)}>
                {myRole !== 'member' && <span style={s.tableHCell}>Member</span>}
                <span style={s.tableHCell}>Amount</span>
                <span style={s.tableHCell}>Status</span>
                <span style={s.tableHCell}>Date</span>
                <span style={s.tableHCell}>Method</span>
                {(myRole === 'admin' || myRole === 'treasurer') && <span style={s.tableHCell}>Actions</span>}
              </div>
              {contributions.length === 0 && <div style={s.emptyRow}>No contributions recorded yet.</div>}
              {(myRole === 'member' ? myContribs : contributions).map((c, i, arr) => (
                <div key={c.id} style={s.tableRow(CONTRIB_COLS, i === arr.length - 1)}>
                  {myRole !== 'member' && <span style={s.tCell}>{c.profiles?.full_name ?? 'Unknown'}</span>}
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#002c13' }}>R {parseFloat(c.amount).toLocaleString()}</span>
                  <span style={s.statusPill(c.status)}>{c.status}</span>
                  <span style={s.tCellSub}>{c.payment_date ? new Date(c.payment_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}</span>
                  <span style={s.tCellSub}>{c.payment_method ?? '—'}</span>
                  {(myRole === 'admin' || myRole === 'treasurer') && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {c.status === 'pending' && <>
                        <button style={s.btnSuccess} onClick={() => handleConfirm(c.id)}>Confirm</button>
                        <button style={s.btnDanger}  onClick={() => handleFlag(c.id)}>Flag</button>
                        </>}
                        {c.status === 'missed' && <>
                        <button style={s.btnSuccess} onClick={() => handleUnflag(c.id)}>Unflag</button>
                        </>}
                        {c.status === 'confirmed' && <span style={s.tCellSub}>—</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MEETINGS ── */}
        {activeTab === 'meetings' && (
          <>
            <div style={s.sectionRow}>
              <p style={s.sectionTitle}>Meetings ({meetings.length})</p>
              {(myRole === 'admin' || myRole === 'treasurer') && (
                <button style={s.btnPrimary} onClick={() => setShowMeetingForm(!showMeetingForm)}>
                  {showMeetingForm ? 'Cancel' : '+ Schedule Meeting'}
                </button>
              )}
            </div>

            {/* Meeting form */}
            {showMeetingForm && (
              <div style={{ ...s.settingsCard, marginBottom: '24px', maxWidth: '100%' }}>
                <form onSubmit={handleSaveMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={s.fieldRow}>
                    <div style={s.field}>
                      <label style={s.label}>Title *</label>
                      <input required style={s.input} value={meetingForm.title} onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="e.g. April Meeting" />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Date & Time *</label>
                      <input required type="datetime-local" style={s.input} value={meetingForm.meeting_date} onChange={e => setMeetingForm({ ...meetingForm, meeting_date: e.target.value })} />
                    </div>
                  </div>
                  <div style={s.fieldRow}>
                    <div style={s.field}>
                      <label style={s.label}>Location</label>
                      <input style={s.input} value={meetingForm.location} onChange={e => setMeetingForm({ ...meetingForm, location: e.target.value })} placeholder="e.g. Community Hall" />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Online Link</label>
                      <input style={s.input} value={meetingForm.meeting_link} onChange={e => setMeetingForm({ ...meetingForm, meeting_link: e.target.value })} placeholder="https://meet.google.com/..." />
                    </div>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Agenda</label>
                    <textarea style={s.textarea} value={meetingForm.agenda} onChange={e => setMeetingForm({ ...meetingForm, agenda: e.target.value })} placeholder="Meeting agenda..." />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={savingMeeting} style={{ ...s.btnPrimary, opacity: savingMeeting ? 0.6 : 1 }}>
                      {savingMeeting ? 'Saving…' : 'Save Meeting'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {meetings.length === 0 && <div style={{ ...s.emptyRow, background: '#fff', borderRadius: '14px', padding: '40px' }}>No meetings scheduled yet.</div>}
            {editingMeeting && (
                <div style={{ ...s.settingsCard, marginBottom: '24px', maxWidth: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontWeight: '700', color: '#191c1d', margin: 0 }}>Edit Meeting</p>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#717970', fontSize: '18px' }} onClick={() => setEditingMeeting(null)}>✕</button>
                    </div>
                    <form onSubmit={handleEditMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={s.fieldRow}>
                        <div style={s.field}>
                        <label style={s.label}>Title *</label>
                        <input required style={s.input} value={editingMeeting.title} onChange={e => setEditingMeeting({ ...editingMeeting, title: e.target.value })} />
                        </div>
                        <div style={s.field}>
                        <label style={s.label}>Date & Time *</label>
                        <input required type="datetime-local" style={s.input} value={editingMeeting.meeting_date} onChange={e => setEditingMeeting({ ...editingMeeting, meeting_date: e.target.value })} />
                        </div>
                    </div>
                    <div style={s.fieldRow}>
                        <div style={s.field}>
                        <label style={s.label}>Location</label>
                        <input style={s.input} value={editingMeeting.location || ''} onChange={e => setEditingMeeting({ ...editingMeeting, location: e.target.value })} />
                        </div>
                        <div style={s.field}>
                        <label style={s.label}>Online Link</label>
                        <input style={s.input} value={editingMeeting.meeting_link || ''} onChange={e => setEditingMeeting({ ...editingMeeting, meeting_link: e.target.value })} />
                        </div>
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Agenda</label>
                        <textarea style={s.textarea} value={editingMeeting.agenda || ''} onChange={e => setEditingMeeting({ ...editingMeeting, agenda: e.target.value })} />
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Minutes</label>
                        <textarea style={s.textarea} value={editingMeeting.minutes || ''} onChange={e => setEditingMeeting({ ...editingMeeting, minutes: e.target.value })} placeholder="Record meeting minutes here after the meeting..." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" style={{ ...s.btnDanger, padding: '8px 18px' }} onClick={() => setEditingMeeting(null)}>Cancel</button>
                        <button type="submit" disabled={savingMeeting} style={{ ...s.btnPrimary, opacity: savingMeeting ? 0.6 : 1 }}>
                        {savingMeeting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                    </form>
                </div>
                )}
            {meetings.map(m => (
              <div key={m.id} style={s.meetingCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#191c1d', margin: '0 0 4px' }}>{m.title}</p>
                    <p style={{ fontSize: '13px', color: '#717970', margin: 0 }}>
                    📅 {new Date(m.meeting_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' '}at {new Date(m.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                {(myRole === 'admin' || myRole === 'treasurer') && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ ...s.btnPrimary, fontSize: '12px', padding: '5px 12px' }} onClick={() => setEditingMeeting({ ...m, meeting_date: new Date(m.meeting_date).toISOString().slice(0,16) })}>Edit</button>
                    <button style={s.btnDanger} onClick={() => handleDeleteMeeting(m.id)}>Delete</button>
                    </div>
                )}
                </div>
                {m.location && <p style={{ fontSize: '13px', color: '#717970', margin: '4px 0' }}>📍 {m.location}</p>}
                {m.meeting_link && <a href={m.meeting_link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#775a19', fontWeight: '600' }}>🔗 Join Online</a>}
                {m.agenda && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Agenda</p>
                    <p style={{ fontSize: '13px', color: '#404941', lineHeight: 1.6, margin: 0 }}>{m.agenda}</p>
                  </div>
                )}
                {m.minutes && (
                  <div style={{ marginTop: '8px', padding: '12px 14px', background: '#d8f3dc', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#014421', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Minutes</p>
                    <p style={{ fontSize: '13px', color: '#014421', lineHeight: 1.6, margin: 0 }}>{m.minutes}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── PAYOUTS ── */}
        {activeTab === 'payouts' && (
            <>
                <div style={s.sectionRow}>
                <p style={s.sectionTitle}>Payouts ({payouts.length})</p>
                {(myRole === 'admin' || myRole === 'treasurer') && (
                    <button style={s.btnPrimary} onClick={() => setShowPayoutForm(!showPayoutForm)}>
                    {showPayoutForm ? 'Cancel' : '+ Initiate Payout'}
                    </button>
                )}
                </div>

                {showPayoutForm && (
                <div style={{ ...s.settingsCard, marginBottom: '24px', maxWidth: '100%' }}>
                    <p style={{ fontWeight: '700', color: '#191c1d', margin: '0 0 16px' }}>Initiate Payout</p>
                    <form onSubmit={handleInitiatePayout} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={s.fieldRow}>
                        <div style={s.field}>
                        <label style={s.label}>Receiver *</label>
                        <select required style={s.select} value={payoutForm.receiver_id} onChange={e => setPayoutForm({ ...payoutForm, receiver_id: e.target.value })}>
                            <option value="">Select a member</option>
                            {members.map(m => (
                            <option key={m.user_id} value={m.user_id}>
                                {m.profiles?.full_name ?? m.profiles?.email ?? 'Unknown'}
                            </option>
                            ))}
                        </select>
                        </div>
                        <div style={s.field}>
                        <label style={s.label}>Amount (R) *</label>
                        <input required type="number" min="1" style={s.input} value={payoutForm.amount}
                            onChange={e => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                            placeholder={`e.g. ${totalPool}`} />
                        </div>
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Payout Date</label>
                        <input type="date" style={s.input} value={payoutForm.payout_date}
                        onChange={e => setPayoutForm({ ...payoutForm, payout_date: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={savingPayout} style={{ ...s.btnPrimary, opacity: savingPayout ? 0.6 : 1 }}>
                        {savingPayout ? 'Initiating…' : 'Initiate Payout'}
                        </button>
                    </div>
                    </form>
                </div>
                )}
            <div style={s.tableWrap}>
              <div style={s.tableHead(PAYOUT_COLS)}>
                <span style={s.tableHCell}>Receiver</span>
                <span style={s.tableHCell}>Amount</span>
                <span style={s.tableHCell}>Date</span>
                <span style={s.tableHCell}>Status</span>
                {(myRole === 'admin' || myRole === 'treasurer') && <span style={s.tableHCell}>Actions</span>}
              </div>
              {payouts.length === 0 && <div style={s.emptyRow}>No payouts yet.</div>}
              {payouts.map((p, i) => (
                <div key={p.id} style={s.tableRow(PAYOUT_COLS, i === payouts.length - 1)}>
                    <span style={s.tCell}>{p.receiver?.full_name ?? 'Unknown'}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#002c13' }}>R {parseFloat(p.amount).toLocaleString()}</span>
                    <span style={s.tCellSub}>{p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                    <span style={s.statusPill(p.status)}>{p.status}</span>
                    {(myRole === 'admin' || myRole === 'treasurer') && (
                    <select
                        value={p.status}
                        onChange={e => handleUpdatePayoutStatus(p.id, e.target.value)}
                        style={{ padding: '5px 8px', border: '1.5px solid rgba(192,201,190,0.45)', borderRadius: '6px', fontSize: '12px', outline: 'none', cursor: 'pointer', background: '#fafbfa' }}
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    )}
                </div>
                ))}
            </div>
          </>
        )}

        {/* ── SETTINGS (admin only) ── */}
        {activeTab === 'settings' && myRole === 'admin' && (
          <>
            <p style={{ ...s.sectionTitle, marginBottom: '20px' }}>Group Settings</p>
            <div style={s.settingsCard}>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <div style={s.field}>
                  <label style={s.label}>Group Name</label>
                  <input name="name" defaultValue={group.name} style={s.input} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea name="description" defaultValue={group.description} style={s.textarea} />
                </div>
                <div style={s.fieldRow}>
                  <div style={s.field}>
                    <label style={s.label}>Contribution Amount (R)</label>
                    <input name="contribution_amount" type="number" defaultValue={group.contribution_amount} style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Max Members</label>
                    <input name="max_members" type="number" defaultValue={group.max_members} style={s.input} placeholder="Leave blank for unlimited" />
                  </div>
                </div>
                <div style={s.fieldRow}>
                  <div style={s.field}>
                    <label style={s.label}>Payout Cycle</label>
                    <select name="payout_cycle" defaultValue={group.payout_cycle} style={s.select}>
                      <option value="monthly">Monthly</option>
                      <option value="bi-monthly">Bi-monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Meeting Frequency</label>
                    <select name="meeting_frequency" defaultValue={group.meeting_frequency} style={s.select}>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" style={s.btnPrimary}>Save Changes</button>
                </div>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  )
}