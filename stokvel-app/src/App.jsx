import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import ErrorPage from './pages/ErrorPage'
import Dashboard from './pages/Dashboard'
import CreateGroup from './pages/CreateGroup'
import JoinGroup from './pages/JoinGroup'
import GroupDashboard from './pages/GroupDashboard'

function App() {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Don't render routes until we know auth state
  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Guest only — redirect to dashboard if already logged in */}
        <Route path="/login"  element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <SignUp />} />

        {/* Protected — redirect to login if not authenticated */}
        <Route path="/dashboard"    element={session ? <Dashboard />    : <Navigate to="/login" replace />} />
        <Route path="/create-group" element={session ? <CreateGroup />  : <Navigate to="/login" replace />} />
        <Route path="/join-group"   element={session ? <JoinGroup />    : <Navigate to="/login" replace />} />
        <Route path="/group/:id" element={session ? <GroupDashboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
