import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// ── styles (matches GroupDashboard exactly) ─────────────────────────────────
const s = {
  root:       { minHeight: '100vh', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif' },
  nav:        { background: '#fff', borderBottom: '1px solid rgba(192,201,190,0.35)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 },
  brand:      { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon:  { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#c49a2a,#fed488)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:  { fontSize: '15px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.3px' },
  page:       { maxWidth: '1060px', margin: '0 auto', padding: '40px 40px' },
  back:       { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#717970', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', fontFamily: 'inherit' },
  headerRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  h1:         { fontSize: '26px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.4px', margin: '0 0 6px' },
  subline:    { fontSize: '14px', color: '#5a6360', margin: 0 },
  tabBar:     { display: 'flex', gap: '4px', borderBottom: '1px solid rgba(192,201,190,0.35)', marginBottom: '28px' },
  tab:        (active) => ({ padding: '10px 18px', background: 'none', border: 'none', borderBottom: active ? '2px solid #002c13' : '2px solid transparent', color: active ? '#002c13' : '#717970', fontWeight: active ? '700' : '500', cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize', fontFamily: 'inherit', marginBottom: '-1px' }),
  card:       { background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)' },
  clabel:     { fontSize: '11px', fontWeight: '600', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' },
  cvalue:     { fontSize: '24px', fontWeight: '800', color: '#191c1d', letterSpacing: '-0.5px', margin: '0 0 4px' },
  csub:       { fontSize: '12px', color: '#9ca39a', margin: 0 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '28px' },
  sectionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#191c1d', margin: 0 },
  tableWrap:  { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(25,28,29,0.06)', border: '1px solid rgba(192,201,190,0.25)', marginBottom: '28px' },
  tableHead:  (cols) => ({ display: 'grid', gridTemplateColumns: cols, padding: '12px 20px', borderBottom: '1px solid rgba(192,201,190,0.3)', background: '#fafbfa' }),
  tableHCell: { fontSize: '11px', fontWeight: '600', color: '#717970', textTransform: 'uppercase', letterSpacing: '0.08em' },
  tableRow:   (cols, last) => ({ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: last ? 'none' : '1px solid rgba(192,201,190,0.15)', alignItems: 'center' }),
  tCell:      { fontSize: '13px', color: '#191c1d' },
  tCellSub:   { fontSize: '13px', color: '#717970' },
  emptyRow:   { padding: '32px 20px', textAlign: 'center', fontSize: '13px', color: '#9ca39a' },
  statusPill: (st) => {
    if (st === 'confirmed') return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#15803d', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: '20px' }
    if (st === 'pending')   return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#92400e', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '20px' }
    if (st === 'missed')    return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#b91c1c', background: 'rgba(220,38,38,0.09)', padding: '2px 8px', borderRadius: '20px' }
    return { display: 'inline-flex', fontSize: '12px', fontWeight: '600', color: '#717970', background: 'rgba(192,201,190,0.2)', padding: '2px 8px', borderRadius: '20px' }
  },
  btnPrimary: { padding: '8px 18px', background: '#002c13', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnOutline: { padding: '8px 18px', background: '#fff', color: '#002c13', border: '1.5px solid #002c13', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  loading:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0', fontFamily: 'system-ui,sans-serif', color: '#5a6360', fontSize: '15px' },
  exportRow:  { display: 'flex', gap: '10px' },
  barWrap:    { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' },
  barRow:     { display: 'grid', gridTemplateColumns: '160px 1fr 48px', alignItems: 'center', gap: '12px' },
  barName:    { fontSize: '13px', color: '#191c1d', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack:   { height: '10px', background: 'rgba(192,201,190,0.25)', borderRadius: '999px', overflow: 'hidden' },
  barFill:    (pct, color) => ({ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.4s ease' }),
  barPct:     { fontSize: '12px', fontWeight: '700', color: '#191c1d', textAlign: 'right' },
}

// ── CSV helper ───────────────────────────────────────────────────────────────
function downloadCSV(filename, rows, headers) {
  const escape = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(','), ...rows.map(r => r.map(escape).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── PDF helper (uses jsPDF loaded from CDN via dynamic import) ───────────────
async function downloadPDF(title, headers, rows, filename) {
  // Dynamically load jsPDF from CDN if not already loaded
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.setTextColor(0, 44, 19)
  doc.text('Stokvel Management Platform', 14, 16)
  doc.setFontSize(12)
  doc.setTextColor(90, 99, 96)
  doc.text(title, 14, 24)
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 30)
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 36,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [0, 44, 19], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  })
  doc.save(filename)
}

// ── Report 1 — Contribution Compliance ──────────────────────────────────────
function ComplianceReport({ contributions, members, groupName }) {
  const stats = members.map(m => {
    const mine = contributions.filter(c => c.user_id === m.user_id)
    const confirmed = mine.filter(c => c.status === 'confirmed').length
    const missed    = mine.filter(c => c.status === 'missed').length
    const pending   = mine.filter(c => c.status === 'pending').length
    const total     = mine.length
    const rate      = total > 0 ? Math.round((confirmed / total) * 100) : 0
    return { name: m.profiles?.full_name ?? m.profiles?.email ?? 'Unknown', confirmed, missed, pending, total, rate, userId: m.user_id }
  }).sort((a, b) => b.rate - a.rate)

  const handleCSV = () => {
    downloadCSV(
      `contribution-compliance-${groupName}.csv`,
      stats.map(r => [r.name, r.confirmed, r.missed, r.pending, r.total, `${r.rate}%`]),
      ['Member', 'Confirmed', 'Missed', 'Pending', 'Total', 'Compliance Rate']
    )
  }

  const handlePDF = () => {
    downloadPDF(
      `Contribution Compliance — ${groupName}`,
      ['Member', 'Confirmed', 'Missed', 'Pending', 'Total', 'Compliance Rate'],
      stats.map(r => [r.name, r.confirmed, r.missed, r.pending, r.total, `${r.rate}%`]),
      `contribution-compliance-${groupName}.pdf`
    )
  }

  const barColor = (rate) => rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626'

  return (
    <div>
      <div style={s.sectionRow}>
        <div>
          <p style={s.sectionTitle}>Contribution Compliance</p>
          <p style={{ fontSize: '12px', color: '#9ca39a', margin: '4px 0 0' }}>On-time payment rate per member</p>
        </div>
        <div style={s.exportRow}>
          <button style={s.btnOutline} onClick={handleCSV}>↓ CSV</button>
          <button style={s.btnPrimary} onClick={handlePDF}>↓ PDF</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={s.grid}>
        <div style={s.card}>
          <p style={s.clabel}>Total Contributions</p>
          <p style={s.cvalue}>{contributions.length}</p>
          <p style={s.csub}>Across all members</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Confirmed</p>
          <p style={{ ...s.cvalue, color: '#15803d' }}>{contributions.filter(c => c.status === 'confirmed').length}</p>
          <p style={s.csub}>{contributions.length > 0 ? Math.round((contributions.filter(c => c.status === 'confirmed').length / contributions.length) * 100) : 0}% of total</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Missed</p>
          <p style={{ ...s.cvalue, color: '#b91c1c' }}>{contributions.filter(c => c.status === 'missed').length}</p>
          <p style={s.csub}>{contributions.length > 0 ? Math.round((contributions.filter(c => c.status === 'missed').length / contributions.length) * 100) : 0}% of total</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Pending</p>
          <p style={{ ...s.cvalue, color: '#92400e' }}>{contributions.filter(c => c.status === 'pending').length}</p>
          <p style={s.csub}>Awaiting confirmation</p>
        </div>
      </div>

      {/* Bar chart per member */}
      {stats.length === 0 ? (
        <div style={{ ...s.tableWrap }}>
          <p style={s.emptyRow}>No contribution data yet.</p>
        </div>
      ) : (
        <div style={{ ...s.card, marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca39a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Compliance Rate per Member</p>
          <div style={s.barWrap}>
            {stats.map(m => (
              <div key={m.userId} style={s.barRow}>
                <span style={s.barName}>{m.name}</span>
                <div style={s.barTrack}>
                  <div style={s.barFill(m.rate, barColor(m.rate))} />
                </div>
                <span style={{ ...s.barPct, color: barColor(m.rate) }}>{m.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail table */}
      <div style={s.tableWrap}>
        <div style={s.tableHead('2fr 80px 80px 80px 80px 100px')}>
          <span style={s.tableHCell}>Member</span>
          <span style={s.tableHCell}>Confirmed</span>
          <span style={s.tableHCell}>Missed</span>
          <span style={s.tableHCell}>Pending</span>
          <span style={s.tableHCell}>Total</span>
          <span style={s.tableHCell}>Rate</span>
        </div>
        {stats.length === 0
          ? <p style={s.emptyRow}>No data yet.</p>
          : stats.map((m, i) => (
            <div key={m.userId} style={s.tableRow('2fr 80px 80px 80px 80px 100px', i === stats.length - 1)}>
              <span style={{ ...s.tCell, fontWeight: '600' }}>{m.name}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#15803d' }}>{m.confirmed}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#b91c1c' }}>{m.missed}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>{m.pending}</span>
              <span style={s.tCellSub}>{m.total}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: barColor(m.rate) }}>{m.rate}%</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Report 2 — Payout History & Projections ──────────────────────────────────
function PayoutReport({ payouts, members, group, groupName }) {
  const completed = payouts.filter(p => {
    const st = (p.status ?? '').replace(/'/g, '')
    return st === 'completed' || st === 'paid'
  })
  const pending = payouts.filter(p => {
    const st = (p.status ?? '').replace(/'/g, '')
    return st === 'pending'
  })

  // Members who have NOT received a payout yet (potential upcoming)
  const receivedUserIds = new Set(completed.map(p => p.receiver_id ?? p.receiver?.id))
  const upcomingMembers = members.filter(m => !receivedUserIds.has(m.user_id))

  // Project next payout date based on payout cycle
  const cycleToMonths = { weekly: 0.25, monthly: 1, 'bi-monthly': 2, quarterly: 3, annually: 12 }
  const monthsPerCycle = cycleToMonths[group?.payout_cycle] ?? 1
  const lastPayout = completed.length > 0
    ? new Date(completed[0].payout_date ?? completed[0].created_at)
    : new Date()
  const projectedNextDate = (offsetIndex) => {
    const d = new Date(lastPayout)
    d.setDate(d.getDate() + Math.round(offsetIndex * monthsPerCycle * 30))
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const handleCSV = () => {
    downloadCSV(
      `payout-history-${groupName}.csv`,
      [
        ...completed.map(p => [
          p.receiver?.full_name ?? 'Unknown',
          `R ${parseFloat(p.amount).toLocaleString()}`,
          p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-ZA') : '—',
          'Completed'
        ]),
        ...pending.map(p => [
          p.receiver?.full_name ?? 'Unknown',
          `R ${parseFloat(p.amount).toLocaleString()}`,
          p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-ZA') : '—',
          'Pending'
        ]),
      ],
      ['Member', 'Amount', 'Date', 'Status']
    )
  }

  const handlePDF = () => {
    downloadPDF(
      `Payout History & Projections — ${groupName}`,
      ['Member', 'Amount', 'Date', 'Status'],
      [
        ...completed.map(p => [p.receiver?.full_name ?? 'Unknown', `R ${parseFloat(p.amount).toLocaleString()}`, p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-ZA') : '—', 'Completed']),
        ...pending.map(p => [p.receiver?.full_name ?? 'Unknown', `R ${parseFloat(p.amount).toLocaleString()}`, p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-ZA') : '—', 'Pending']),
        ...upcomingMembers.map((m, i) => [m.profiles?.full_name ?? 'Unknown', `R ${parseFloat(group?.contribution_amount ?? 0).toLocaleString()}`, projectedNextDate(completed.length + pending.length + i + 1), 'Projected']),
      ],
      `payout-history-${groupName}.pdf`
    )
  }

  const totalPaidOut = completed.reduce((sum, p) => sum + parseFloat(p.amount ?? 0), 0)

  return (
    <div>
      <div style={s.sectionRow}>
        <div>
          <p style={s.sectionTitle}>Payout History & Projections</p>
          <p style={{ fontSize: '12px', color: '#9ca39a', margin: '4px 0 0' }}>Completed payouts and upcoming rotation</p>
        </div>
        <div style={s.exportRow}>
          <button style={s.btnOutline} onClick={handleCSV}>↓ CSV</button>
          <button style={s.btnPrimary} onClick={handlePDF}>↓ PDF</button>
        </div>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <p style={s.clabel}>Total Paid Out</p>
          <p style={s.cvalue}>R {totalPaidOut.toLocaleString()}</p>
          <p style={s.csub}>{completed.length} completed payouts</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Pending Payouts</p>
          <p style={{ ...s.cvalue, color: '#92400e' }}>{pending.length}</p>
          <p style={s.csub}>Awaiting disbursement</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Remaining in Rotation</p>
          <p style={s.cvalue}>{upcomingMembers.length}</p>
          <p style={s.csub}>Members yet to receive</p>
        </div>
      </div>

      {/* Payout history table */}
      <p style={{ fontSize: '13px', fontWeight: '700', color: '#191c1d', marginBottom: '10px' }}>Payout History</p>
      <div style={s.tableWrap}>
        <div style={s.tableHead('2fr 120px 130px 100px')}>
          <span style={s.tableHCell}>Member</span>
          <span style={s.tableHCell}>Amount</span>
          <span style={s.tableHCell}>Date</span>
          <span style={s.tableHCell}>Status</span>
        </div>
        {payouts.length === 0
          ? <p style={s.emptyRow}>No payouts yet.</p>
          : payouts.map((p, i) => {
              const st = (p.status ?? '').replace(/'/g, '')
              return (
                <div key={p.id} style={s.tableRow('2fr 120px 130px 100px', i === payouts.length - 1)}>
                  <span style={{ ...s.tCell, fontWeight: '600' }}>{p.receiver?.full_name ?? 'Unknown'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#002c13' }}>R {parseFloat(p.amount).toLocaleString()}</span>
                  <span style={s.tCellSub}>{p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  <span style={s.statusPill(st)}>{st || 'pending'}</span>
                </div>
              )
            })
        }
      </div>

      {/* Upcoming rotation */}
      <p style={{ fontSize: '13px', fontWeight: '700', color: '#191c1d', margin: '0 0 10px' }}>Projected Upcoming Payouts</p>
      <div style={s.tableWrap}>
        <div style={s.tableHead('2fr 130px 130px')}>
          <span style={s.tableHCell}>Member</span>
          <span style={s.tableHCell}>Expected Amount</span>
          <span style={s.tableHCell}>Projected Date</span>
        </div>
        {upcomingMembers.length === 0
          ? <p style={s.emptyRow}>All members have received payouts.</p>
          : upcomingMembers.map((m, i) => (
            <div key={m.user_id} style={s.tableRow('2fr 130px 130px', i === upcomingMembers.length - 1)}>
              <span style={{ ...s.tCell, fontWeight: '600' }}>{m.profiles?.full_name ?? m.profiles?.email ?? 'Unknown'}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#002c13' }}>R {parseFloat(group?.contribution_amount ?? 0).toLocaleString()}</span>
              <span style={{ ...s.tCellSub, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.12)', color: '#92400e', padding: '2px 6px', borderRadius: '20px', fontWeight: '600' }}>Projected</span>
                {projectedNextDate(completed.length + pending.length + i + 1)}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Report 3 — Group Savings Summary (custom view) ────────────────────────────
function SavingsReport({ contributions, group, groupName }) {
  // Group confirmed contributions by month
  const byMonth = {}
  contributions
    .filter(c => c.status === 'confirmed')
    .forEach(c => {
      const d = new Date(c.payment_date ?? c.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      byMonth[key] = (byMonth[key] ?? 0) + parseFloat(c.amount ?? 0)
    })

  const months = Object.keys(byMonth).sort()
  let runningTotal = 0
  const rows = months.map(m => {
    runningTotal += byMonth[m]
    const label = new Date(m + '-01').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
    return { key: m, label, monthly: byMonth[m], cumulative: runningTotal }
  })

  const maxMonthly = Math.max(...rows.map(r => r.monthly), 1)

  const handleCSV = () => {
    downloadCSV(
      `savings-summary-${groupName}.csv`,
      rows.map(r => [r.label, `R ${r.monthly.toLocaleString()}`, `R ${r.cumulative.toLocaleString()}`]),
      ['Month', 'Collected This Month', 'Cumulative Total']
    )
  }

  const handlePDF = () => {
    downloadPDF(
      `Group Savings Summary — ${groupName}`,
      ['Month', 'Collected This Month', 'Cumulative Total'],
      rows.map(r => [r.label, `R ${r.monthly.toLocaleString()}`, `R ${r.cumulative.toLocaleString()}`]),
      `savings-summary-${groupName}.pdf`
    )
  }

  const totalConfirmed = contributions.filter(c => c.status === 'confirmed').reduce((s, c) => s + parseFloat(c.amount ?? 0), 0)
  const avgMonthly = rows.length > 0 ? (totalConfirmed / rows.length) : 0

  return (
    <div>
      <div style={s.sectionRow}>
        <div>
          <p style={s.sectionTitle}>Group Savings Summary</p>
          <p style={{ fontSize: '12px', color: '#9ca39a', margin: '4px 0 0' }}>Monthly confirmed collections and cumulative growth</p>
        </div>
        <div style={s.exportRow}>
          <button style={s.btnOutline} onClick={handleCSV}>↓ CSV</button>
          <button style={s.btnPrimary} onClick={handlePDF}>↓ PDF</button>
        </div>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <p style={s.clabel}>Total Collected</p>
          <p style={s.cvalue}>R {totalConfirmed.toLocaleString()}</p>
          <p style={s.csub}>All confirmed contributions</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Avg per Month</p>
          <p style={s.cvalue}>R {Math.round(avgMonthly).toLocaleString()}</p>
          <p style={s.csub}>Over {rows.length} month{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={s.card}>
          <p style={s.clabel}>Group Contribution</p>
          <p style={s.cvalue}>R {parseFloat(group?.contribution_amount ?? 0).toLocaleString()}</p>
          <p style={s.csub}>Per {group?.payout_cycle}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={s.tableWrap}>
          <p style={s.emptyRow}>No confirmed contributions yet. Data will appear once the treasurer confirms payments.</p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div style={{ ...s.card, marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca39a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Monthly Collections</p>
            <div style={s.barWrap}>
              {rows.map(r => (
                <div key={r.key} style={s.barRow}>
                  <span style={{ ...s.barName, fontSize: '12px' }}>{r.label}</span>
                  <div style={s.barTrack}>
                    <div style={s.barFill(Math.round((r.monthly / maxMonthly) * 100), '#002c13')} />
                  </div>
                  <span style={s.barPct}>R {Math.round(r.monthly / 1000) > 0 ? (r.monthly / 1000).toFixed(1) + 'k' : r.monthly}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail table */}
          <div style={s.tableWrap}>
            <div style={s.tableHead('2fr 160px 180px')}>
              <span style={s.tableHCell}>Month</span>
              <span style={s.tableHCell}>Collected</span>
              <span style={s.tableHCell}>Cumulative Total</span>
            </div>
            {rows.map((r, i) => (
              <div key={r.key} style={s.tableRow('2fr 160px 180px', i === rows.length - 1)}>
                <span style={{ ...s.tCell, fontWeight: '600' }}>{r.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#002c13' }}>R {r.monthly.toLocaleString()}</span>
                <span style={{ ...s.tCell, color: '#15803d', fontWeight: '700' }}>R {r.cumulative.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading,       setLoading]       = useState(true)
  const [group,         setGroup]         = useState(null)
  const [members,       setMembers]       = useState([])
  const [contributions, setContributions] = useState([])
  const [payouts,       setPayouts]       = useState([])
  const [activeTab,     setActiveTab]     = useState('compliance')
  const [myRole,        setMyRole]        = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      const { data: grp } = await supabase.from('groups').select('*').eq('id', id).maybeSingle()
      if (!grp) { navigate('/dashboard'); return }
      setGroup(grp)

      const { data: me } = await supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', session.user.id).maybeSingle()
      setMyRole(me?.role ?? null)

      const { data: mems } = await supabase
        .from('group_members')
        .select('role, user_id, joined_at, profiles(full_name, email)')
        .eq('group_id', id)
      setMembers(mems ?? [])

      const { data: contribs } = await supabase
        .from('contributions')
        .select('id, user_id, amount, status, payment_date, payment_method, created_at, profiles(full_name)')
        .eq('group_id', id)
        .order('created_at', { ascending: false })
      setContributions(contribs ?? [])

      const { data: pays } = await supabase
        .from('payouts')
        .select('id, amount, status, payout_date, created_at, receiver_id, receiver:profiles!payouts_receiver_id_fkey(full_name)')
        .eq('group_id', id)
        .order('created_at', { ascending: false })
      setPayouts(pays ?? [])

      setLoading(false)
    }
    load()
  }, [id, navigate])

  if (loading) return <div style={s.loading}>Loading analytics…</div>
  if (!group)  return <div style={s.loading}>Group not found.</div>

  const TABS = [
    { key: 'compliance', label: 'Contribution Compliance' },
    { key: 'payouts',    label: 'Payout History' },
    { key: 'savings',    label: 'Savings Summary' },
  ]

  return (
    <div style={s.root}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#775a19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brandName}>Stokvel Management Platform</span>
        </div>
        <button onClick={() => navigate(`/group/${id}`)} style={{ padding: '7px 16px', background: '#f0f2f0', border: '1px solid rgba(192,201,190,0.5)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#404941', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back to Group
        </button>
      </nav>

      <div style={s.page}>
        {/* Header */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.h1}>Analytics</h1>
            <p style={s.subline}>{group.name} · {myRole ? myRole.charAt(0).toUpperCase() + myRole.slice(1) : ''}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabBar}>
          {TABS.map(t => (
            <button key={t.key} style={s.tab(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Reports */}
        {activeTab === 'compliance' && (
          <ComplianceReport
            contributions={contributions}
            members={members}
            groupName={group.name}
          />
        )}
        {activeTab === 'payouts' && (
          <PayoutReport
            payouts={payouts}
            members={members}
            group={group}
            groupName={group.name}
          />
        )}
        {activeTab === 'savings' && (
          <SavingsReport
            contributions={contributions}
            group={group}
            groupName={group.name}
          />
        )}
      </div>
    </div>
  )
}