import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const GROUP = {
  id: 'group-123',
  name: 'Test Stokvel',
  contribution_amount: 500,
  payout_cycle: 'monthly',
  max_members: 10,
  created_by: 'user-123',
  invite_code: 'ABC123',
  description: 'Saving together',
  meeting_frequency: 'monthly',
}

const MEMBERS = [
  { id: 'm1', user_id: 'user-123', role: 'admin', joined_at: '2026-01-01', profiles: { full_name: 'Test User', email: 'test@test.com' } },
]

vi.mock('../supabaseClient', () => {
  let chain
  chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue({
      data: {
        id: 'group-123', name: 'Test Stokvel', contribution_amount: 500,
        payout_cycle: 'monthly', max_members: 10, created_by: 'user-123',
        invite_code: 'ABC123', description: 'Saving together', meeting_frequency: 'monthly',
      },
    }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    then: (res, rej) =>
      Promise.resolve({
        data: [
          { id: 'm1', user_id: 'user-123', role: 'admin', joined_at: '2026-01-01',
            profiles: { full_name: 'Test User', email: 'test@test.com' } },
        ],
        error: null,
      }).then(res, rej),
    catch: (fn) => Promise.resolve({ data: [], error: null }).catch(fn),
  }
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-123', email: 'test@test.com' } } },
        }),
      },
      from: vi.fn(() => chain),
    },
  }
})

import GroupDashboard from '../pages/GroupDashboard'

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/group/group-123']}>
      <Routes>
        <Route path="/group/:id" element={<GroupDashboard />} />
      </Routes>
    </MemoryRouter>
  )

describe('GroupDashboard', () => {
  it('shows loading state on initial render', () => {
    renderPage()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders group name after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Test Stokvel')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders Heritage Ledger brand after loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/heritage ledger/i)).toBeInTheDocument(), { timeout: 3000 })
  })

  it('renders back to dashboard navigation', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('renders tab navigation', async () => {
    renderPage()
    await waitFor(() => {
      const tabs = document.querySelectorAll('button')
      expect(tabs.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('renders group subline info', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/monthly/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('renders stokvel group name in heading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/test stokvel/i).length).toBeGreaterThan(0), { timeout: 3000 })
  })

  it('component renders without crashing after full load', async () => {
    const { container } = renderPage()
    await waitFor(() => expect(container.querySelector('nav')).toBeInTheDocument(), { timeout: 3000 })
  })
})
