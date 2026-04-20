import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../supabaseClient', () => {
  let chain
  chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn(() => chain),
    order: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    then: (res, rej) => Promise.resolve({ data: [], error: null }).then(res, rej),
    catch: (fn) => Promise.resolve({ data: [], error: null }).catch(fn),
  }
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123', email: 'test@test.com', user_metadata: { full_name: 'Test User' } },
            },
          },
        }),
        signOut: vi.fn().mockResolvedValue({}),
      },
      from: vi.fn(() => chain),
    },
  }
})

import Dashboard from '../pages/Dashboard'

const renderPage = () => render(<MemoryRouter><Dashboard /></MemoryRouter>)

describe('Dashboard', () => {
  it('shows loading state on initial render', () => {
    renderPage()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders Heritage Ledger brand after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/stokvel management platform/i).length).toBeGreaterThan(0))
  })

  it('shows greeting with user name after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/good day/i)).toBeInTheDocument())
  })

  it('shows Create a Group card when user has no groups', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/create a group/i)).toBeInTheDocument())
  })

  it('shows Join a Group card when user has no groups', async () => {
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

  it('shows groups list when user has groups', async () => {
    const { supabase } = await import('../supabaseClient')
    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: 'Test User' } }),
    }
    const membersChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (res, rej) =>
        Promise.resolve({
          data: [
            { role: 'admin', groups: { id: 'g1', name: 'My Savings Club', contribution_amount: 500, payout_cycle: 'monthly', max_members: 10 } },
          ],
          error: null,
        }).then(res, rej),
      catch: (fn) => Promise.resolve({ data: [] }).catch(fn),
    }
    supabase.from
      .mockReturnValueOnce(profileChain)
      .mockReturnValueOnce(membersChain)

    renderPage()
    await waitFor(() => expect(screen.getByText('My Savings Club')).toBeInTheDocument())
  })

  it('shows group count when user has groups', async () => {
    const { supabase } = await import('../supabaseClient')
    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }
    const membersChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (res, rej) =>
        Promise.resolve({
          data: [
            { role: 'member', groups: { id: 'g2', name: 'Family Fund', contribution_amount: 200, payout_cycle: 'monthly', max_members: 5 } },
          ],
          error: null,
        }).then(res, rej),
      catch: (fn) => Promise.resolve({ data: [] }).catch(fn),
    }
    supabase.from
      .mockReturnValueOnce(profileChain)
      .mockReturnValueOnce(membersChain)

    renderPage()
    await waitFor(() => expect(screen.getByText(/you are in 1 group/i)).toBeInTheDocument())
  })

  it('navigates to login on sign out', async () => {
    renderPage()
    await waitFor(() => screen.getByText(/sign out/i))
    fireEvent.click(screen.getByText(/sign out/i))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })
})
