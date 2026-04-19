import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

import ForgotPassword from '../pages/ForgotPassword'

const renderPage = () => render(<MemoryRouter><ForgotPassword /></MemoryRouter>)

describe('ForgotPassword', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  it('renders subtext', () => {
    renderPage()
    expect(screen.getAllByText(/reset link/i).length).toBeGreaterThan(0)
  })

  it('renders email input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
  })

  it('renders send reset link button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('renders sign in link', () => {
    renderPage()
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('shows success message after form submit', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@test.com' } })
    fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/reset link sent/i)).toBeInTheDocument())
  })

  it('shows error when reset fails', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'Email not found' } })
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'bad@bad.com' } })
    fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/email not found/i)).toBeInTheDocument())
  })

  it('shows loading state while submitting', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.resetPasswordForEmail.mockImplementationOnce(() => new Promise(() => {}))
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@test.com' } })
    fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/sending/i)).toBeInTheDocument())
  })
})
