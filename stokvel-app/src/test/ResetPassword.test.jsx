import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

import ResetPassword from '../pages/ResetPassword'

const renderPage = () => render(<MemoryRouter><ResetPassword /></MemoryRouter>)

describe('ResetPassword', () => {

  it('renders heading', () => {
    renderPage()
    expect(screen.getByText(/reset your password/i)).toBeInTheDocument()
  })

  it('renders subtext', () => {
    renderPage()
    expect(screen.getByText(/enter a new password/i)).toBeInTheDocument()
  })

  it('renders new password input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/min. 6 characters/i)).toBeInTheDocument()
  })

  it('renders confirm password input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/re-enter new password/i)).toBeInTheDocument()
  })

  it('renders update password button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
  })

  it('renders back to sign in link', () => {
    renderPage()
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'different123' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument())
  })

  it('shows error when password is too short', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'abc' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'abc' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument())
  })

  it('shows success screen after password update', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'newpassword123' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'newpassword123' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/password updated/i)).toBeInTheDocument())
  })

  it('shows error when update fails', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.updateUser.mockResolvedValueOnce({ error: { message: 'Update failed' } })
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'newpassword123' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'newpassword123' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/update failed/i)).toBeInTheDocument())
  })

  it('shows loading state while submitting', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.updateUser.mockImplementationOnce(() => new Promise(() => {}))
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'newpassword123' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'newpassword123' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/updating/i)).toBeInTheDocument())
  })

  it('toggles password visibility', () => {
    renderPage()
    const passwordInput = screen.getByPlaceholderText(/min. 6 characters/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    const toggleBtns = screen.getAllByRole('button').filter(btn => btn.type === 'button')
    fireEvent.click(toggleBtns[0])
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('shows inline mismatch warning while typing confirm password', () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter new password/i), { target: { value: 'different' } })
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

})
