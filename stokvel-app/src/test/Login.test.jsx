import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({}),
    },
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import Login from '../pages/Login'

const renderPage = () => render(<MemoryRouter><Login /></MemoryRouter>)

describe('Login', () => {
  it('renders Welcome Back heading', () => {
    renderPage()
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })

  it('renders email input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/thando@example.com/i)).toBeInTheDocument()
  })

  it('renders sign in submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders Continue with GitHub button', () => {
    renderPage()
    expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
  })

  it('renders Forgot password link', () => {
    renderPage()
    expect(screen.getByText(/forgot/i)).toBeInTheDocument()
  })

  it('renders Create an Account link', () => {
    renderPage()
    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
  })

  it('renders security badge', () => {
    renderPage()
    expect(screen.getByText(/encrypted/i)).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    const { container } = renderPage()
    const passwordInput = container.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()
    const eyeBtn = container.querySelector('form button[type="button"]')
    fireEvent.click(eyeBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')
    fireEvent.click(eyeBtn)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows error message when login fails', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
    const { container } = renderPage()
    fireEvent.change(screen.getByPlaceholderText(/thando@example.com/i), { target: { value: 'test@test.com' } })
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'wrongpass' } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() => expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument())
  })

  it('navigates to dashboard on successful login', async () => {
    const { supabase } = await import('../supabaseClient')
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null })
    const { container } = renderPage()
    fireEvent.change(screen.getByPlaceholderText(/thando@example.com/i), { target: { value: 'test@test.com' } })
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'validpass' } })
    fireEvent.submit(container.querySelector('form'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })
})
