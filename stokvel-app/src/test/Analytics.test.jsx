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
  order: vi.fn().mockReturnThis(),
  then: (res, rej) => Promise.resolve({ data: [], error: null }).then(res, rej),
  catch: (fn) => Promise.resolve({ data: [], error: null }).catch(fn),
  ...overrides,
})

import Analytics from '../pages/Analytics'
import { supabase } from '../supabaseClient'

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/group/group-123/analytics']}>
      <Routes>
        <Route path="/group/:id/analytics" element={<Analytics />} />
      </Routes>
    </MemoryRouter>
  )

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123', email: 'test@test.com' } } },
    })
    supabase.from
      .mockReturnValueOnce(makeChain())
      .mockReturnValueOnce(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }) }))
      .mockReturnValue(makeChain())
  })

  it('shows loading analytics on initial render', () => {
    renderPage()
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument()
  })

  it('renders Analytics heading after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Analytics')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders brand name', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/stokvel management platform/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders Back to Group button', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/back to group/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders Contribution Compliance tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/contribution compliance/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('renders Payout History tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/payout history/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('renders Savings Summary tab', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/savings summary/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('renders nav element', async () => {
    const { container } = renderPage()
    await waitFor(() => expect(container.querySelector('nav')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('redirects to login when no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    renderPage()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })

  it('switches to Payout History tab', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText(/payout history/i).length > 0, { timeout: 3000 })
    fireEvent.click(screen.getAllByText(/payout history/i)[0])
    await waitFor(() => expect(screen.getAllByText(/payout history/i).length).toBeGreaterThan(0))
  })

  it('switches to Savings Summary tab', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText(/savings summary/i).length > 0, { timeout: 3000 })
    fireEvent.click(screen.getAllByText(/savings summary/i)[0])
    await waitFor(() => expect(screen.getAllByText(/savings summary/i).length).toBeGreaterThan(0))
  })

  it('navigates to dashboard when group missing', async () => {
    supabase.from.mockReset()
    supabase.from.mockReturnValue(makeChain({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }))
    renderPage()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'), { timeout: 3000 })
  })
})
