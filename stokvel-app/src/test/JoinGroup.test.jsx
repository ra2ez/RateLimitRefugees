import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const GROUP_DATA = {
  id: 'g1',
  name: 'Savings Circle',
  contribution_amount: 300,
  payout_cycle: 'monthly',
  max_members: 8,
}

vi.mock('../supabaseClient', () => {
  let chain
  chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    then: (res, rej) => Promise.resolve({ data: null, error: null }).then(res, rej),
    catch: (fn) => Promise.resolve({ data: null, error: null }).catch(fn),
  }
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
        }),
      },
      from: vi.fn(() => chain),
    },
  }
})

import JoinGroup from '../pages/JoinGroup'

const renderPage = () => render(<MemoryRouter><JoinGroup /></MemoryRouter>)

describe('JoinGroup', () => {
  it('renders Join a group heading', () => {
    renderPage()
    expect(screen.getByText(/join a group/i)).toBeInTheDocument()
  })

  it('renders invite code input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('ABC123')).toBeInTheDocument()
  })

  it('renders Find Group button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /find group/i })).toBeInTheDocument()
  })

  it('Find Group button is disabled when code is empty', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /find group/i })).toBeDisabled()
  })

  it('Find Group button is disabled when code is less than 4 chars', () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'AB' } })
    expect(screen.getByRole('button', { name: /find group/i })).toBeDisabled()
  })

  it('Find Group button is enabled when code is 4+ chars', () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'ABCD' } })
    expect(screen.getByRole('button', { name: /find group/i })).not.toBeDisabled()
  })

  it('converts input to uppercase', () => {
    renderPage()
    const input = screen.getByPlaceholderText('ABC123')
    fireEvent.change(input, { target: { value: 'abc123' } })
    expect(input.value).toBe('ABC123')
  })

  it('shows group not found error on failed lookup', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'ZZZZ' } })
    fireEvent.click(screen.getByRole('button', { name: /find group/i }))
    await waitFor(() => expect(screen.getByText(/no group found/i)).toBeInTheDocument())
  })

  it('shows group preview after successful lookup', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: GROUP_DATA }),
    })
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'SAVE01' } })
    fireEvent.click(screen.getByRole('button', { name: /find group/i }))
    await waitFor(() => expect(screen.getByText('Savings Circle')).toBeInTheDocument())
  })

  it('shows join button after group is found', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: GROUP_DATA }),
    })
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'SAVE01' } })
    fireEvent.click(screen.getByRole('button', { name: /find group/i }))
    await waitFor(() => expect(screen.getByText(/join savings circle/i)).toBeInTheDocument())
  })

  it('renders Heritage Ledger brand', () => {
    renderPage()
    expect(screen.getByText(/heritage ledger/i)).toBeInTheDocument()
  })

  it('renders create a group link', () => {
    renderPage()
    expect(screen.getByText(/create a group/i)).toBeInTheDocument()
  })

  it('renders subtext about invite code', () => {
    renderPage()
    expect(screen.getAllByText(/invite code/i).length).toBeGreaterThan(0)
  })
})
