import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    from: vi.fn(),
  },
}))

global.fetch = vi.fn()

const GROUP = {
  id: 'group-123', name: 'Test Stokvel', contribution_amount: 500,
  payout_cycle: 'monthly', max_members: 10, created_by: 'user-123',
  invite_code: 'ABC123', description: 'Saving together', meeting_frequency: 'monthly',
}

const makeChain = (overrides = {}) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: GROUP }),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  then: (res, rej) => Promise.resolve({
    data: [{ id: 'm1', user_id: 'user-123', role: 'admin', joined_at: '2026-01-01', profiles: { full_name: 'Test User', email: 'test@test.com' } }],
    error: null,
  }).then(res, rej),
  catch: (fn) => Promise.resolve({ data: [], error: null }).catch(fn),
  ...overrides,
})

import GroupDashboard from '../pages/GroupDashboard'
import { supabase } from '../supabaseClient'

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/group/group-123']}>
      <Routes>
        <Route path="/group/:id" element={<GroupDashboard />} />
      </Routes>
    </MemoryRouter>
  )

describe('GroupDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123', email: 'test@test.com' } } },
    })
    // loadAll makes 6 from() calls in order:
    // 1. groups → maybeSingle → GROUP
    // 2. group_members (role check) → maybeSingle → { role: 'admin' }
    // 3. group_members (members list) → then → members array
    // 4. contributions → then → []
    // 5. meetings → then → []
    // 6. payouts → then → []
    supabase.from
      .mockReturnValueOnce(makeChain())  // groups
      .mockReturnValueOnce(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }) }))  // role
      .mockReturnValue(makeChain())  // rest
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ repo: 6.75, prime: 10.25 }),
    })
  })

  it('shows loading state on initial render', () => {
    renderPage()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders group name after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Test Stokvel')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders brand name', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/stokvel management platform/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders back to dashboard link', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('renders overview tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('overview')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders members tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('members')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders contributions tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('contributions')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders meetings tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('meetings')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders payouts tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('payouts')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('shows SA interest rates card', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/sa interest rates/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('shows live repo rate', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('6.75%')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('shows live prime rate', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('10.25%')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders group description', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Saving together')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders invite code for admin', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('ABC123')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders copy code button', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/copy code/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('switches to members tab on click', async () => {
    renderPage()
    await waitFor(() => screen.getByText('members'), { timeout: 3000 })
    fireEvent.click(screen.getByText('members'))
    await waitFor(() => expect(screen.getByText(/members \(/i)).toBeInTheDocument())
  })

  it('switches to contributions tab on click', async () => {
    renderPage()
    await waitFor(() => screen.getByText('contributions'), { timeout: 3000 })
    fireEvent.click(screen.getByText('contributions'))
    await waitFor(() => expect(screen.getByText(/log contribution/i)).toBeInTheDocument())
  })

  it('switches to meetings tab on click', async () => {
    renderPage()
    await waitFor(() => screen.getByText('meetings'), { timeout: 3000 })
    fireEvent.click(screen.getByText('meetings'))
    await waitFor(() => expect(screen.getByText(/schedule meeting/i)).toBeInTheDocument())
  })

  it('switches to payouts tab on click', async () => {
    renderPage()
    await waitFor(() => screen.getByText('payouts'), { timeout: 3000 })
    fireEvent.click(screen.getByText('payouts'))
    await waitFor(() => expect(screen.getByText(/initiate payout/i)).toBeInTheDocument())
  })

  it('redirects to login when no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    renderPage()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })

  it('shows not found when group missing', async () => {
    supabase.from.mockReset()
    supabase.from.mockReturnValue(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }))
    renderPage()
    await waitFor(() => expect(screen.getByText(/group not found/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders nav element', async () => {
    const { container } = renderPage()
    await waitFor(() => expect(container.querySelector('nav')).toBeInTheDocument(), { timeout: 3000 })
  })
})
