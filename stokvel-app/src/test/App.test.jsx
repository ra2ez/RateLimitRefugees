import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}))

vi.mock('../pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }))
vi.mock('../pages/Login', () => ({ default: () => <div>Login Page</div> }))
vi.mock('../pages/Home', () => ({ default: () => <div>Home Page</div> }))
vi.mock('../pages/SignUp', () => ({ default: () => <div>SignUp Page</div> }))
vi.mock('../pages/ForgotPassword', () => ({ default: () => <div>ForgotPassword Page</div> }))
vi.mock('../pages/ErrorPage', () => ({ default: () => <div>Error Page</div> }))
vi.mock('../pages/CreateGroup', () => ({ default: () => <div>CreateGroup Page</div> }))
vi.mock('../pages/JoinGroup', () => ({ default: () => <div>JoinGroup Page</div> }))
vi.mock('../pages/GroupDashboard', () => ({ default: () => <div>GroupDashboard Page</div> }))
vi.mock('../pages/Analytics', () => ({ default: () => <div>Analytics Page</div> }))

import App from '../App'
import { supabase } from '../supabaseClient'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('renders nothing while session is loading', () => {
    supabase.auth.getSession.mockReturnValue(new Promise(() => {}))
    const { container } = render(<App />)
    expect(container.firstChild).toBeNull()
  })

  it('renders Home at "/" when no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Home Page')).toBeInTheDocument())
  })

  it('redirects /login to /dashboard when session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    })
    window.history.pushState({}, '', '/login')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })

  it('renders Login at /login when no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    window.history.pushState({}, '', '/login')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })

  it('redirects /dashboard to /login when no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })

  it('renders Dashboard at /dashboard when session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    })
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })

  it('renders ErrorPage for unknown routes', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    window.history.pushState({}, '', '/nonexistent-route')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Error Page')).toBeInTheDocument())
  })

  it('updates session on auth state change', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    supabase.auth.onAuthStateChange.mockImplementation((cb) => {
      setTimeout(() => cb('SIGNED_IN', { user: { id: 'u1' } }), 10)
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument(), { timeout: 3000 })
  })
})
