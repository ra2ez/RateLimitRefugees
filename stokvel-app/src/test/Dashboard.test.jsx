import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from:          vi.fn(),
    // Dashboard uses supabase.channel() for realtime subscriptions — mock it so it doesn't crash
    channel:       vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() }),
    removeChannel: vi.fn(),
  },
}))

global.fetch = vi.fn()

const SESSION = {
  user: { id: 'user-123', email: 'test@test.com', user_metadata: { full_name: 'Test User' } },
}

const makeChain = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null }),
  then: (res, rej) => Promise.resolve({ data: [], error: null }).then(res, rej),
  catch: (fn) => Promise.resolve({ data: [], error: null }).catch(fn),
})

import Dashboard from '../pages/Dashboard'
import { supabase } from '../supabaseClient'

const renderPage = () => render(<MemoryRouter><Dashboard /></MemoryRouter>)

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.onAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_IN', SESSION), 0)
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    supabase.auth.signOut.mockResolvedValue({})
    supabase.from.mockReturnValue(makeChain())
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ repo: 6.75, prime: 10.25 }),
    })
  })

  it('renders brand name', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/stokvel management platform/i).length).toBeGreaterThan(0))
  })

  it('shows greeting after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/good day/i)).toBeInTheDocument())
  })

  it('shows Create a Group card when no groups', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/create a group/i)).toBeInTheDocument())
  })

  it('shows Join a Group card when no groups', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/join a group/i)).toBeInTheDocument())
  })

  it('renders sign out button', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/sign out/i)).toBeInTheDocument())
  })

  it('shows user email in nav', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('test@test.com')).toBeInTheDocument())
  })

  it('navigates to login on sign out', async () => {
    renderPage()
    await waitFor(() => screen.getByText(/sign out/i))
    fireEvent.click(screen.getByText(/sign out/i))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })

  it('redirects to login when no session', async () => {
    supabase.auth.onAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_OUT', null), 0)
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    renderPage()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })

  it('shows SA Live Rates banner', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/sa live rates/i)).toBeInTheDocument())
  })

  it('shows live repo rate in banner', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('6.75%')).toBeInTheDocument())
  })

  it('shows live prime rate in banner', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('10.25%')).toBeInTheDocument())
  })

  it('shows Repo Rate label', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/repo rate/i)).toBeInTheDocument())
  })

  it('shows Prime Rate label', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/prime rate/i)).toBeInTheDocument())
  })

  it('shows no group subline when no groups', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/no group yet/i)).toBeInTheDocument())
  })

  it('shows groups list when user has groups', async () => {
    supabase.from
      .mockReturnValueOnce({ ...makeChain(), maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: 'Test User' } }) })
      .mockReturnValueOnce({
        ...makeChain(),
        then: (res, rej) => Promise.resolve({
          data: [{ role: 'admin', groups: { id: 'g1', name: 'My Savings Club', contribution_amount: 500, payout_cycle: 'monthly', max_members: 10 } }],
          error: null,
        }).then(res, rej),
      })
      .mockReturnValue(makeChain())
    renderPage()
    await waitFor(() => expect(screen.getByText('My Savings Club')).toBeInTheDocument())
  })

  it('shows group count when user has groups', async () => {
    supabase.from
      .mockReturnValueOnce(makeChain())
      .mockReturnValueOnce({
        ...makeChain(),
        then: (res, rej) => Promise.resolve({
          data: [{ role: 'member', groups: { id: 'g2', name: 'Family Fund', contribution_amount: 200, payout_cycle: 'monthly', max_members: 5 } }],
          error: null,
        }).then(res, rej),
      })
      .mockReturnValue(makeChain())
    renderPage()
    await waitFor(() => expect(screen.getByText(/you are in 1 group/i)).toBeInTheDocument())
  })
})
