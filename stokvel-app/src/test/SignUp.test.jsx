import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

import SignUp from '../pages/SignUp'

const renderPage = () => render(<MemoryRouter><SignUp /></MemoryRouter>)

const fillForm = ({ name = 'Test User', email = 'test@test.com', password = 'password123', confirm = 'password123' } = {}) => {
  fireEvent.change(screen.getByPlaceholderText(/heritage ledger/i), { target: { value: name } })
  fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: email } })
  fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: password } })
  fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), { target: { value: confirm } })
}

describe('SignUp', () => {
  it('renders Create your account heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
  })

  it('renders full name input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/heritage ledger/i)).toBeInTheDocument()
  })

  it('renders email input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
  })

  it('renders password and confirm inputs', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/min. 6 characters/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/re-enter password/i)).toBeInTheDocument()
  })

  it('renders sign in link', () => {
    renderPage()
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('shows inline validation when passwords do not match', () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText(/min. 6 characters/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), { target: { value: 'different' } })
    expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
  })

  it('shows error on submit when passwords do not match', async () => {
    renderPage()
    fillForm({ confirm: 'different' })
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument())
  })

  it('shows error when password is too short', async () => {
    renderPage()
    fillForm({ password: 'abc', confirm: 'abc' })
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument())
  })

  it('shows success screen after valid signup', async () => {
    renderPage()
    fillForm()
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument())
  })

  it('shows supabase error message on signup failure', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.signUp.mockResolvedValueOnce({ error: { message: 'Email already registered' } })
    renderPage()
    fillForm()
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'))
    await waitFor(() => expect(screen.getByText(/email already registered/i)).toBeInTheDocument())
  })
})
