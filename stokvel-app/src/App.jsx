import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import ErrorPage from './pages/ErrorPage'


function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('Supabase connected!', data)
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<div>Dashboard coming soon</div>} />
        <Route path="*" element={<ErrorPage />} />
        
      </Routes>
    </BrowserRouter>
  )

}

export default App
