import { useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('Supabase connected!', data)
    })
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-green-600">Stokvel App</h1>
      <p className="text-gray-500">Welcome! We are live.</p>
    </div>
  )
}

export default App