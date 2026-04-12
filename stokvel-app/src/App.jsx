import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'


function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('Supabase connected!', data)
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="p-10">
            <h1 className="text-3xl font-bold text-green-600">Stokvel App</h1>
            <p className="text-gray-500">Welcome! We are live.</p>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<div>Dashboard coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )

}

export default App
