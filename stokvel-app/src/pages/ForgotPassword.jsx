import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const s = {
  page:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif', background:'#f8f9fa' },
  card:    { background:'#fff', borderRadius:'16px', padding:'48px 44px', maxWidth:'400px', width:'100%', boxShadow:'0 20px 40px rgba(25,28,29,0.06)' },
  h1:      { fontSize:'26px', fontWeight:'800', color:'#191c1d', letterSpacing:'-0.5px', marginBottom:'8px' },
  sub:     { fontSize:'14px', color:'#404941', marginBottom:'28px' },
  field:   { display:'flex', flexDirection:'column', gap:'5px', marginBottom:'16px' },
  label:   { fontSize:'11px', fontWeight:'600', color:'#404941', letterSpacing:'0.08em', textTransform:'uppercase' },
  input:   { padding:'12px 14px', background:'#fff', border:'1.5px solid rgba(192,201,190,0.4)', borderRadius:'8px', fontSize:'15px', color:'#191c1d', fontFamily:'inherit', outline:'none', width:'100%', boxShadow:'0 1px 3px rgba(25,28,29,0.04)', transition:'border-color 0.2s,box-shadow 0.2s' },
  btn:     { width:'100%', marginTop:'6px', padding:'13px', background:'#002c13', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,44,19,0.25)', letterSpacing:'0.02em' },
  error:   { background:'#ffdad6', borderRadius:'8px', padding:'12px 16px', color:'#93000a', fontSize:'13px', marginBottom:'18px' },
  success: { background:'#d8f3dc', borderRadius:'8px', padding:'12px 16px', color:'#014421', fontSize:'13px', marginBottom:'18px' },
  footer:  { textAlign:'center', fontSize:'14px', color:'#404941', marginTop:'24px' },
  link:    { color:'#775a19', fontWeight:'700', textDecoration:'none' },
}

const focusInput = (e) => { e.target.style.borderColor='#002c13'; e.target.style.boxShadow='0 0 0 3px rgba(0,44,19,0.08)' }
const blurInput  = (e) => { e.target.style.borderColor='rgba(192,201,190,0.4)'; e.target.style.boxShadow='0 1px 3px rgba(25,28,29,0.04)' }

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.h1}>Forgot password?</h1>
        <p style={s.sub}>Enter your email and we'll send you a reset link.</p>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>Reset link sent! Check your email.</div>}

        <form onSubmit={handleReset}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" onFocus={focusInput} onBlur={blurInput}
              style={s.input}
            />
          </div>
          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p style={s.footer}>
          Remember your password? <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
