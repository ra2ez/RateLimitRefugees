import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'g1', invite_code: 'ABC123' }, error: null }),
    }),
  },
}))

import CreateGroup from '../pages/CreateGroup'

const renderPage = () => render(<MemoryRouter><CreateGroup /></MemoryRouter>)

describe('CreateGroup', () => {
  it('renders Create a stokvel group heading', () => {
    renderPage()
    expect(screen.getByText(/create a stokvel group/i)).toBeInTheDocument()
  })

  it('renders group name input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/ikhaya savings circle/i)).toBeInTheDocument()
  })

  it('renders contribution amount input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('500')).toBeInTheDocument()
  })

  it('renders create group submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument()
  })

  it('renders payout cycle dropdown', () => {
    renderPage()
    expect(screen.getAllByDisplayValue('Monthly').length).toBeGreaterThan(0)
  })

  it('renders back to dashboard link', () => {
    renderPage()
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0)
  })

  it('renders cancel button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows error when group name is empty on submit', async () => {
    renderPage()
    fireEvent.submit(screen.getByRole('button', { name: /create group/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/group name is required/i)).toBeInTheDocument())
  })

  it('shows error when contribution amount is invalid', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/ikhaya savings circle/i), { target: { value: 'Test Group' } })
    fireEvent.submit(screen.getByRole('button', { name: /create group/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/valid contribution amount/i)).toBeInTheDocument())
  })

  it('renders description textarea', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/what is this group saving for/i)).toBeInTheDocument()
  })

  it('renders max members input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/e.g. 10/i)).toBeInTheDocument()
  })
})
