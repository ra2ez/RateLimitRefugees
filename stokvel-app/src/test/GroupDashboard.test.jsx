import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

// ── Router mock — spy on navigate calls without actually navigating ────────────
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Supabase mock — covers auth, DB queries, storage, and realtime channels ───
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth:          { getSession: vi.fn() },
    from:          vi.fn(),
    storage:       { from: vi.fn() },
    channel:       vi.fn(),
    removeChannel: vi.fn(),
  },
}))

global.fetch = vi.fn()

// ── Fake data ─────────────────────────────────────────────────────────────────

const GROUP = {
  id: 'group-123', name: 'Test Stokvel', contribution_amount: 500,
  payout_cycle: 'monthly', max_members: 10, created_by: 'user-123',
  invite_code: 'ABC123', description: 'Saving together', meeting_frequency: 'monthly',
}

const MEMBER = {
  id: 'm1', user_id: 'user-123', role: 'admin',
  joined_at: '2026-01-01',
  profiles: { full_name: 'Test User', email: 'test@test.com' },
}

const OTHER_MEMBER = {
  id: 'm2', user_id: 'user-456', role: 'member',
  joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  profiles: { full_name: 'Other User', email: 'other@test.com' },
}

const PENDING_CONTRIB = {
  id: 'c1', user_id: 'user-456', amount: 500, status: 'pending',
  payment_date: new Date().toISOString(), payment_method: 'EFT',
  proof_of_payment: null, profiles: { full_name: 'Other User' },
}

const CONFIRMED_CONTRIB = {
  id: 'c2', user_id: 'user-123', amount: 500, status: 'confirmed',
  payment_date: new Date().toISOString(), payment_method: 'Cash',
  proof_of_payment: 'proofs/receipt.jpg', profiles: { full_name: 'Test User' },
}

const MISSED_CONTRIB = {
  id: 'c3', user_id: 'user-456', amount: 500, status: 'missed',
  payment_date: new Date().toISOString(), payment_method: 'EFT',
  proof_of_payment: null, profiles: { full_name: 'Other User' },
}

const MEETING = {
  id: 'meet1', title: 'April Meeting', group_id: 'group-123',
  meeting_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Community Hall', meeting_link: null, agenda: 'Monthly review', minutes: null,
}

const PAYOUT = {
  id: 'pay1', amount: 1000, status: 'pending',
  payout_date: new Date().toISOString(), created_at: new Date().toISOString(),
  receiver_id: 'user-456', initiated_by: 'user-123',
  proof_of_payment: null,
  receiver: { full_name: 'Other User' },
}

// ── Chainable supabase query builder ──────────────────────────────────────────
// Supabase calls chain like: .from().select().eq().order() — each returns `this`.
// The final `await` hits the `then()` method, so we make the chain object thenable.
const makeChain = (overrides = {}) => ({
  select:      vi.fn().mockReturnThis(),
  eq:          vi.fn().mockReturnThis(),
  neq:         vi.fn().mockReturnThis(),
  in:          vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: GROUP }),
  single:      vi.fn().mockResolvedValue({ data: null, error: null }),
  insert:      vi.fn().mockReturnThis(),
  update:      vi.fn().mockReturnThis(),
  delete:      vi.fn().mockReturnThis(),
  order:       vi.fn().mockReturnThis(),
  limit:       vi.fn().mockReturnThis(),
  filter:      vi.fn().mockReturnThis(),
  then:  (res, rej) => Promise.resolve({ data: [MEMBER], error: null }).then(res, rej),
  catch: (fn)       => Promise.resolve({ data: [], error: null }).catch(fn),
  ...overrides,
})

// Storage mock — for proof-of-payment uploads and signed URL generation
const makeStorage = () => ({
  upload:          vi.fn().mockResolvedValue({ data: { path: 'proof/test.jpg' }, error: null }),
  createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/proof.jpg' }, error: null }),
})

// Channel mock — realtime subscriptions just need to not throw
const makeChannel = () => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })

// ── Import after mocks are set up ─────────────────────────────────────────────
import GroupDashboard from '../pages/GroupDashboard'
import { supabase }   from '../supabaseClient'

// ── Render helper ─────────────────────────────────────────────────────────────
const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/group/group-123']}>
      <Routes>
        <Route path="/group/:id" element={<GroupDashboard />} />
      </Routes>
    </MemoryRouter>
  )

// ── Universal setup helper ─────────────────────────────────────────────────────
// loadAll() makes exactly 6 supabase.from() calls:
//   1. groups            → maybeSingle → GROUP
//   2. group_members     → maybeSingle → { role }     (role check for current user)
//   3. group_members     → then        → members list
//   4. contributions     → then        → contribs list
//   5. meetings          → then        → meetings list
//   6. payouts           → then        → payouts list
function setup({ role = 'admin', members = [MEMBER], contribs = [], meetings = [], payouts = [], extraCalls = [] } = {}) {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: 'user-123', email: 'test@test.com' } } },
  })

  let chain = supabase.from
    .mockReturnValueOnce(makeChain())
    .mockReturnValueOnce(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: { role } }) }))
    .mockReturnValueOnce(makeChain({ then: (r) => Promise.resolve({ data: members, error: null }).then(r) }))
    .mockReturnValueOnce(makeChain({ then: (r) => Promise.resolve({ data: contribs, error: null }).then(r) }))
    .mockReturnValueOnce(makeChain({ then: (r) => Promise.resolve({ data: meetings, error: null }).then(r) }))
    .mockReturnValueOnce(makeChain({ then: (r) => Promise.resolve({ data: payouts,  error: null }).then(r) }))

  // any extra supabase.from calls after loadAll (e.g. confirm, update, insert)
  extraCalls.forEach(override => chain.mockReturnValueOnce(makeChain(override)))

  supabase.storage.from.mockReturnValue(makeStorage())
  supabase.channel.mockReturnValue(makeChannel())
  global.fetch.mockResolvedValue({ json: () => Promise.resolve({ repo: 6.75, prime: 10.25 }) })
}

// Wait for the loading spinner to disappear — page is fully loaded after this
const waitForLoad = () =>
  waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 3000 })

// Navigate to a tab and wait for a landmark element to appear
const goToTab = async (tabName, landmark) => {
  fireEvent.click(screen.getByText(tabName))
  if (landmark) await waitFor(() => expect(screen.getByText(landmark)).toBeInTheDocument(), { timeout: 3000 })
}


// ─────────────────────────────────────────────────────────────────────────────
describe('GroupDashboard', () => {

  // reset ALL mock state (calls + implementations + queues) before each test
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })


  // ── Loading & Auth ────────────────────────────────────────────────────────

  describe('Loading & Auth', () => {

    it('shows a loading spinner while data is being fetched', () => {
      setup()
      renderPage()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('navigates to /login when there is no active session', async () => {
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
      supabase.channel.mockReturnValue(makeChannel())
      // fetch must be mocked so the rates useEffect doesn't throw on an undefined return
      global.fetch.mockResolvedValue({ json: () => Promise.resolve({ repo: 6.75, prime: 10.25 }) })
      renderPage()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
    })

    it('shows "group not found" when the group does not exist in DB', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })
      supabase.from.mockReturnValue(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }))
      supabase.channel.mockReturnValue(makeChannel())
      global.fetch.mockResolvedValue({ json: () => Promise.resolve({ repo: 6.75, prime: 10.25 }) })
      renderPage()
      await waitFor(() => expect(screen.getByText(/group not found/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('clicking "Back to Dashboard" on the not-found page navigates home', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      })
      supabase.from.mockReturnValue(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }))
      supabase.channel.mockReturnValue(makeChannel())
      global.fetch.mockResolvedValue({ json: () => Promise.resolve({ repo: 6.75, prime: 10.25 }) })
      renderPage()
      await waitFor(() => screen.getByText(/back to dashboard/i), { timeout: 3000 })
      fireEvent.click(screen.getByText(/back to dashboard/i))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

  })


  // ── Core Layout ───────────────────────────────────────────────────────────

  describe('Core Layout', () => {

    it('renders the group name in the heading', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('Test Stokvel')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('renders the brand name in the nav', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText(/stokvel management platform/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('renders the group description', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('Saving together')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('renders the nav element', async () => {
      setup()
      const { container } = renderPage()
      await waitForLoad()
      expect(container.querySelector('nav')).toBeInTheDocument()
    })

    it('renders the Analytics button', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('Analytics')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows the admin role pill', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('admin')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('clicking the back button navigates to /dashboard', async () => {
      setup()
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByText(/← back to dashboard/i))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('clicking the Analytics button navigates to the analytics page', async () => {
      setup()
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByText('Analytics'))
      expect(mockNavigate).toHaveBeenCalledWith('/group/group-123/analytics')
    })

  })


  // ── Invite Code Banner ────────────────────────────────────────────────────

  describe('Invite Code Banner (admin only)', () => {

    it('shows the invite code for admins', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('ABC123')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows a Copy Code button', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText(/copy code/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('clicking Copy Code changes the button to "✓ Copied!"', async () => {
      setup()
      Object.assign(navigator, { clipboard: { writeText: vi.fn() } })
      renderPage()
      await waitFor(() => screen.getByText(/copy code/i), { timeout: 3000 })
      fireEvent.click(screen.getByText(/copy code/i))
      await waitFor(() => expect(screen.getByText(/copied/i)).toBeInTheDocument())
    })

  })


  // ── Tabs ──────────────────────────────────────────────────────────────────

  describe('Tabs', () => {

    it('renders all 6 tabs for an admin', async () => {
      setup()
      renderPage()
      await waitForLoad()
      for (const tab of ['overview', 'members', 'contributions', 'meetings', 'payouts', 'settings']) {
        expect(screen.getByText(tab)).toBeInTheDocument()
      }
    })

    it('overview is the active tab by default', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText(/sa interest rates/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('member role does not see the settings tab', async () => {
      setup({ role: 'member' })
      renderPage()
      await waitForLoad()
      expect(screen.queryByText('settings')).not.toBeInTheDocument()
    })

    it('clicking the members tab shows the members table', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('members', /members \(/i)
    })

    it('clicking the contributions tab shows the log contribution button', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('contributions', /log contribution/i)
    })

    it('clicking the meetings tab shows the schedule meeting button', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('meetings', /schedule meeting/i)
    })

    it('clicking the payouts tab shows the initiate payout button', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('payouts', /initiate payout/i)
    })

    it('clicking the settings tab shows the settings form (admin only)', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('settings', /group settings/i)
    })

  })


  // ── Overview Tab ─────────────────────────────────────────────────────────

  describe('Overview Tab', () => {

    it('shows the SA Interest Rates card', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText(/sa interest rates/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows the live repo rate fetched from the API', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('6.75%')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows the live prime rate fetched from the API', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('10.25%')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows "…" for rates when the fetch fails (graceful fallback)', async () => {
      setup()
      global.fetch.mockRejectedValueOnce(new Error('network error'))
      renderPage()
      await waitForLoad()
      // both rate boxes show dots while rates are null
      const dots = screen.getAllByText('…')
      expect(dots.length).toBeGreaterThanOrEqual(2)
    })

    it('shows the Total Pool stat card', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('Total Pool')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows the contribution amount stat', async () => {
      setup()
      renderPage()
      await waitFor(() => expect(screen.getByText('R 500')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows "no confirmed contributions" message when pool is empty', async () => {
      setup()
      renderPage()
      // wait for loading to finish first, then the overview renders
      await waitForLoad()
      // Both the line-chart component AND the rates card show "No confirmed contributions yet."
      // Use the exact short string (the graph div) to avoid the multiple-match error.
      await waitFor(() => expect(screen.getByText('No confirmed contributions yet.')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows savings projections when there are confirmed contributions', async () => {
      setup({ contribs: [CONFIRMED_CONTRIB] })
      renderPage()
      await waitFor(() => expect(screen.getByText(/in 6 months/i)).toBeInTheDocument(), { timeout: 3000 })
      expect(screen.getByText(/in 12 months/i)).toBeInTheDocument()
      expect(screen.getByText(/in 24 months/i)).toBeInTheDocument()
    })

  })


  // ── Members Tab ───────────────────────────────────────────────────────────

  describe('Members Tab', () => {

    it('shows the member count', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('members')
      await waitFor(() => expect(screen.getByText(/members \(1\)/i)).toBeInTheDocument())
    })

    it('shows the member name in the table', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('members')
      await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument())
    })

    it('shows "You" label for the current user row (admins can\'t change their own role)', async () => {
      setup({ members: [MEMBER, OTHER_MEMBER] })
      renderPage()
      await waitForLoad()
      await goToTab('members')
      await waitFor(() => expect(screen.getByText('You')).toBeInTheDocument())
    })

    it('shows a role change dropdown for OTHER members (admin view)', async () => {
      setup({ members: [MEMBER, OTHER_MEMBER] })
      renderPage()
      await waitForLoad()
      await goToTab('members')
      // the select's current option text is "Member" (capital M in the option label)
      await waitFor(() => expect(screen.getByDisplayValue('Member')).toBeInTheDocument())
    })

    it('changing a member role calls supabase update', async () => {
      setup({
        members: [MEMBER, OTHER_MEMBER],
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('members')
      await waitFor(() => screen.getByDisplayValue('Member'))
      fireEvent.change(screen.getByDisplayValue('Member'), { target: { value: 'treasurer' } })
      await waitFor(() => expect(screen.getByText(/role updated/i)).toBeInTheDocument())
    })

  })


  // ── Contributions Tab ─────────────────────────────────────────────────────

  describe('Contributions Tab', () => {

    it('opens the log contribution form on button click', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      fireEvent.click(screen.getByText(/\+ log contribution/i))
      await waitFor(() => expect(screen.getByText(/payment due/i)).toBeInTheDocument())
    })

    it('shows payment method buttons — EFT, Cash, SnapScan, Other', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      fireEvent.click(screen.getByText(/\+ log contribution/i))
      // buttons render with emoji prefix (e.g. "🏦 EFT"), so use { exact: false }
      await waitFor(() => expect(screen.getByText('EFT', { exact: false })).toBeInTheDocument())
      expect(screen.getByText('Cash',     { exact: false })).toBeInTheDocument()
      expect(screen.getByText('SnapScan', { exact: false })).toBeInTheDocument()
      expect(screen.getByText('Other',    { exact: false })).toBeInTheDocument()
    })

    it('shows the proof of payment upload field', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      fireEvent.click(screen.getByText(/\+ log contribution/i))
      // the label reads "Proof of Payment *" — use the asterisk to distinguish it
      // from the drop-zone text "📎 Attach proof of payment" (avoids multiple-match error)
      await waitFor(() => expect(screen.getByText(/proof of payment \*/i)).toBeInTheDocument())
    })

    it('shows an error when submitting without attaching proof', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      fireEvent.click(screen.getByText(/\+ log contribution/i))
      // use role query because button text is "🏦 EFT" (emoji prefix makes exact match fail)
      await waitFor(() => screen.getByRole('button', { name: /EFT/i }))
      fireEvent.click(screen.getByRole('button', { name: /EFT/i }))
      // selecting EFT enables the submit button; clicking it without a proof file triggers the error
      fireEvent.click(screen.getByText(/submit payment/i))
      await waitFor(() => expect(screen.getByText(/please attach proof/i)).toBeInTheDocument())
    })

    it('shows existing contributions in the table', async () => {
      setup({ contribs: [PENDING_CONTRIB] })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      // the status pill renders the status text
      await waitFor(() => expect(screen.getByText('pending')).toBeInTheDocument())
    })

    it('shows Confirm + Flag buttons for pending contributions (admin)', async () => {
      setup({ contribs: [PENDING_CONTRIB] })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => expect(screen.getByText('Confirm')).toBeInTheDocument())
      expect(screen.getByText('Flag')).toBeInTheDocument()
    })

    it('confirming a contribution shows a success message', async () => {
      setup({
        contribs: [PENDING_CONTRIB],
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => screen.getByText('Confirm'))
      fireEvent.click(screen.getByText('Confirm'))
      await waitFor(() => expect(screen.getByText(/contribution confirmed/i)).toBeInTheDocument())
    })

    it('flagging a contribution as missed shows a success message', async () => {
      setup({
        contribs: [PENDING_CONTRIB],
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => screen.getByText('Flag'))
      fireEvent.click(screen.getByText('Flag'))
      await waitFor(() => expect(screen.getByText(/flagged/i)).toBeInTheDocument())
    })

    it('shows Unflag button for missed contributions', async () => {
      setup({ contribs: [MISSED_CONTRIB] })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => expect(screen.getByText('Unflag')).toBeInTheDocument())
    })

    it('unflagging a missed contribution shows a success message', async () => {
      setup({
        contribs: [MISSED_CONTRIB],
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => screen.getByText('Unflag'))
      fireEvent.click(screen.getByText('Unflag'))
      await waitFor(() => expect(screen.getByText(/unflagged/i)).toBeInTheDocument())
    })

    it('shows the 📎 Proof button when a contribution has proof attached', async () => {
      setup({ contribs: [CONFIRMED_CONTRIB] })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => expect(screen.getByText(/📎 proof/i)).toBeInTheDocument())
    })

    it('shows an error when confirming fails (DB error)', async () => {
      setup({
        contribs: [PENDING_CONTRIB],
        extraCalls: [{ then: (r) => Promise.resolve({ error: { message: 'DB error' } }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('contributions')
      await waitFor(() => screen.getByText('Confirm'))
      fireEvent.click(screen.getByText('Confirm'))
      await waitFor(() => expect(screen.getByText(/db error/i)).toBeInTheDocument())
    })

  })


  // ── Meetings Tab ──────────────────────────────────────────────────────────

  describe('Meetings Tab', () => {

    it('shows "no meetings scheduled yet" when there are none', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('meetings', /schedule meeting/i)
      expect(screen.getByText(/no meetings scheduled yet/i)).toBeInTheDocument()
    })

    it('clicking Schedule Meeting reveals the form', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('meetings')
      fireEvent.click(screen.getByText(/\+ schedule meeting/i))
      await waitFor(() => expect(screen.getByPlaceholderText(/april meeting/i)).toBeInTheDocument())
    })

    it('shows a meeting card when meetings exist', async () => {
      setup({ meetings: [MEETING] })
      renderPage()
      await waitForLoad()
      await goToTab('meetings')
      await waitFor(() => expect(screen.getByText('April Meeting')).toBeInTheDocument(), { timeout: 3000 })
      // location renders with a pin emoji: "📍 Community Hall" — use regex to avoid exact-match failure
      expect(screen.getByText(/community hall/i)).toBeInTheDocument()
    })

    it('saving a meeting shows a success message', async () => {
      const savedMeeting = { id: 'meet-new', title: 'Test Meeting', meeting_date: '2026-06-01T10:00', group_id: 'group-123', location: '', meeting_link: '', agenda: '', minutes: null }
      setup({
        extraCalls: [{ single: vi.fn().mockResolvedValue({ data: savedMeeting, error: null }) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('meetings')

      fireEvent.click(screen.getByText(/\+ schedule meeting/i))
      await waitFor(() => screen.getByPlaceholderText(/april meeting/i))

      // fill in required fields
      fireEvent.change(screen.getByPlaceholderText(/april meeting/i), { target: { value: 'Test Meeting' } })
      const dateInputs = screen.getAllByDisplayValue('')
      fireEvent.change(dateInputs[0], { target: { value: '2026-06-01T10:00' } })

      fireEvent.click(screen.getByText('Save Meeting'))
      await waitFor(() => expect(screen.getByText(/meeting scheduled/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('deleting a meeting shows a success message when confirmed', async () => {
      window.confirm = vi.fn().mockReturnValue(true)
      setup({
        meetings: [MEETING],
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('meetings')
      await waitFor(() => screen.getByText('April Meeting'))

      fireEvent.click(screen.getByText('Delete'))
      await waitFor(() => expect(screen.getByText(/meeting deleted/i)).toBeInTheDocument())
    })

    it('does NOT delete the meeting if the user cancels the confirm dialog', async () => {
      window.confirm = vi.fn().mockReturnValue(false)
      setup({ meetings: [MEETING] })
      renderPage()
      await waitForLoad()
      await goToTab('meetings')
      await waitFor(() => screen.getByText('April Meeting'))

      fireEvent.click(screen.getByText('Delete'))
      // meeting is still there because user cancelled
      expect(screen.getByText('April Meeting')).toBeInTheDocument()
    })

    it('clicking Edit on a meeting opens the edit form', async () => {
      setup({ meetings: [MEETING] })
      renderPage()
      await waitForLoad()
      await goToTab('meetings')
      await waitFor(() => screen.getByText('April Meeting'))

      fireEvent.click(screen.getByText('Edit'))
      await waitFor(() => expect(screen.getByText(/edit meeting/i)).toBeInTheDocument())
    })

    it('the ✕ button closes the edit meeting form', async () => {
      setup({ meetings: [MEETING] })
      renderPage()
      await waitForLoad()
      await goToTab('meetings')
      await waitFor(() => screen.getByText('April Meeting'))

      fireEvent.click(screen.getByText('Edit'))
      await waitFor(() => screen.getByText(/edit meeting/i))
      fireEvent.click(screen.getByText('✕'))
      await waitFor(() => expect(screen.queryByText(/edit meeting/i)).not.toBeInTheDocument())
    })

  })


  // ── Payouts Tab ───────────────────────────────────────────────────────────

  describe('Payouts Tab', () => {

    it('shows "no payouts yet" when there are none', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('payouts', /initiate payout/i)
      expect(screen.getByText(/no payouts yet/i)).toBeInTheDocument()
    })

    it('clicking Initiate Payout shows the payout form', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('payouts')
      fireEvent.click(screen.getByText(/\+ initiate payout/i))
      // after clicking, both the form heading AND the submit button say "Initiate Payout"
      // so target something unique inside the form instead — the member receiver dropdown
      await waitFor(() => expect(screen.getByText(/select a member/i)).toBeInTheDocument())
    })

    it('shows existing payouts in the table', async () => {
      setup({ payouts: [PAYOUT] })
      renderPage()
      await waitForLoad()
      await goToTab('payouts')
      await waitFor(() => expect(screen.getByText('Other User')).toBeInTheDocument(), { timeout: 3000 })
    })

    it('shows the payout amount', async () => {
      setup({ payouts: [PAYOUT] })
      renderPage()
      await waitForLoad()
      await goToTab('payouts')
      // toLocaleString() format varies by Node.js locale — use regex instead of hardcoding "1,000"
      await waitFor(() => expect(screen.getByText(/R\s1[,\s]?000/)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('admin can update payout status via the dropdown', async () => {
      setup({
        payouts: [PAYOUT],
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('payouts')
      await waitFor(() => screen.getByDisplayValue('Pending'), { timeout: 3000 })
      fireEvent.change(screen.getByDisplayValue('Pending'), { target: { value: 'completed' } })
      await waitFor(() => expect(screen.getByText(/payout status updated/i)).toBeInTheDocument())
    })

  })


  // ── Settings Tab ──────────────────────────────────────────────────────────

  describe('Settings Tab', () => {

    it('pre-fills the group name input', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('settings')
      await waitFor(() => expect(screen.getByDisplayValue('Test Stokvel')).toBeInTheDocument())
    })

    it('pre-fills the description textarea', async () => {
      setup()
      renderPage()
      await waitForLoad()
      await goToTab('settings')
      await waitFor(() => expect(screen.getByDisplayValue('Saving together')).toBeInTheDocument())
    })

    it('saving settings shows a success message', async () => {
      setup({
        extraCalls: [{ then: (r) => Promise.resolve({ error: null }).then(r) }],
      })
      renderPage()
      await waitForLoad()
      await goToTab('settings')
      await waitFor(() => screen.getByText('Save Changes'))
      fireEvent.click(screen.getByText('Save Changes'))
      await waitFor(() => expect(screen.getByText(/settings saved/i)).toBeInTheDocument())
    })

  })


  // ── Notification Sidebar ──────────────────────────────────────────────────

  describe('Notification Sidebar', () => {

    it('clicking the bell icon opens the notification sidebar', async () => {
      setup()
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => expect(screen.getByText(/all caught up/i)).toBeInTheDocument())
    })

    it('shows "all caught up" when there are no notifications', async () => {
      setup()
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => expect(screen.getByText(/all caught up/i)).toBeInTheDocument())
    })

    it('the ✕ button closes the notification sidebar', async () => {
      setup()
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => screen.getByText(/all caught up/i))
      fireEvent.click(screen.getByText('✕'))
      await waitFor(() => expect(screen.queryByText(/all caught up/i)).not.toBeInTheDocument())
    })

    it('shows a notification for a pending contribution from another member', async () => {
      setup({ contribs: [PENDING_CONTRIB] })
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => expect(screen.getByText(/logged a contribution/i)).toBeInTheDocument())
    })

    it('shows a notification for an upcoming meeting', async () => {
      setup({ meetings: [MEETING] }) // MEETING is 3 days away — within the 7-day window
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => expect(screen.getByText(/upcoming/i)).toBeInTheDocument())
    })

    it('shows a notification for a pending payout', async () => {
      setup({ payouts: [PAYOUT] })
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => expect(screen.getByText(/payout.*pending/i)).toBeInTheDocument())
    })

    it('shows a notification for missed contributions', async () => {
      setup({ contribs: [MISSED_CONTRIB] })
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      // the title is "1 missed contribution" — the body also says "missed contributions"
      // so narrow it down to the title format: digit + "missed contribution"
      await waitFor(() => expect(screen.getByText(/\d+ missed contribution/i)).toBeInTheDocument())
    })

    it('"Mark all read" saves seen IDs to localStorage', async () => {
      setup({ contribs: [PENDING_CONTRIB] })
      renderPage()
      await waitForLoad()
      fireEvent.click(screen.getByTitle('Notifications'))
      await waitFor(() => screen.getByText(/mark all read/i))
      fireEvent.click(screen.getByText(/mark all read/i))
      // localStorage should now have the seen notification IDs
      const stored = JSON.parse(localStorage.getItem('seen_notifs') ?? '[]')
      expect(stored.length).toBeGreaterThan(0)
    })

    it('shows a bell badge when there are notifications', async () => {
      setup({ contribs: [PENDING_CONTRIB] })
      renderPage()
      await waitForLoad()
      // jsdom converts hex colours to rgb(), so we can't use a CSS attribute selector on the colour.
      // Instead: find the bell button by its accessible title and check it has a badge span child.
      const bellBtn = screen.getByTitle('Notifications')
      const badge   = bellBtn.querySelector('span')
      expect(badge).not.toBeNull()
      // 1 notification (Other User's pending contrib) → badge shows "1"
      expect(badge.textContent).toBe('1')
    })

  })

})
