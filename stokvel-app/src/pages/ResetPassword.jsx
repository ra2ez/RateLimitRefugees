import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const s = {
  page:      { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif', background:'#f8f9fa' },
  card:      { background:'#fff', borderRadius:'16px', padding:'48px 44px', maxWidth:'400px', width:'100%', boxShadow:'0 20px 40px rgba(25,28,29,0.06)' },
  h1:        { fontSize:'26px', fontWeight:'800', color:'#191c1d', letterSpacing:'-0.5px', marginBottom:'8px' },
  sub:       { fontSize:'14px', color:'#404941', marginBottom:'28px' },
  field:     { display:'flex', flexDirection:'column', gap:'5px', marginBottom:'16px' },
  label:     { fontSize:'11px', fontWeight:'600', color:'#404941', letterSpacing:'0.08em', textTransform:'uppercase' },
  inputWrap: { position:'relative', display:'flex', alignItems:'center' },
  input:     { padding:'12px 42px 12px 14px', background:'#fff', border:'1.5px solid rgba(192,201,190,0.4)', borderRadius:'8px', fontSize:'15px', color:'#191c1d', fontFamily:'inherit', outline:'none', width:'100%', boxShadow:'0 1px 3px rgba(25,28,29,0.04)', transition:'border-color 0.2s,box-shadow 0.2s' },
  eyeBtn:    { position:'absolute', right:'12px', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'2px' },
  fieldErr:  { fontSize:'12px', color:'#ba1a1a', marginTop:'2px' },
  btn:       { width:'100%', marginTop:'6px', padding:'13px', background:'#002c13', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,44,19,0.25)', letterSpacing:'0.02em' },
  error:     { background:'#ffdad6', borderRadius:'8px', padding:'12px 16px', color:'#93000a', fontSize:'13px', marginBottom:'18px' },
  footer:    { textAlign:'center', fontSize:'14px', color:'#404941', marginTop:'24px' },
  link:      { color:'#775a19', fontWeight:'700', textDecoration:'none' },
  successCard:{ background:'#fff', borderRadius:'16px', padding:'52px 44px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 20px 40px rgba(25,28,29,0.06)' },
  checkCircle:{ width:'60px', height:'60px', borderRadius:'50%', background:'#014421', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' },
  successH:  { fontSize:'22px', fontWeight:'800', color:'#191c1d', marginBottom:'8px' },
  successP:  { fontSize:'14px', color:'#404941', lineHeight:1.6, marginBottom:'28px' },
  actionBtn: { display:'inline-block', padding:'12px 28px', background:'#002c13', color:'#fff', borderRadius:'8px', fontSize:'15px', fontWeight:'700', textDecoration:'none', boxShadow:'0 4px 14px rgba(0,44,19,0.25)' },
}

const focusInput = (e) => { e.target.style.borderColor='#002c13'; e.target.style.boxShadow='0 0 0 3px rgba(0,44,19,0.08)' }
const blurInput  = (e) => { e.target.style.borderColor='rgba(192,201,190,0.4)'; e.target.style.boxShadow='0 1px 3px rgba(25,28,29,0.04)' }

const EyeOpen   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const EyeClosed = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div style={s.page}>
      <div style={s.successCard}>
        <div style={s.checkCircle}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={s.successH}>Password updated!</h2>
        <p style={s.successP}>Your password has been changed successfully. You can now sign in with your new password.</p>
        <Link to="/login" style={s.actionBtn}>Sign in</Link>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.h1}>Reset your password</h1>
        <p style={s.sub}>Enter a new password for your account.</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleUpdate}>
          <div style={s.field}>
            <label style={s.label}>New password</label>
            <div style={s.inputWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                onFocus={focusInput} onBlur={blurInput}
                style={s.input}
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm new password</label>
            <div style={s.inputWrap}>
              <input
                type={showConf ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                onFocus={focusInput} onBlur={blurInput}
                style={{ ...s.input, ...(confirm && confirm !== password ? { borderColor:'#ba1a1a' } : {}) }}
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowConf(!showConf)}>
                {showConf ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <span style={s.fieldErr}>Passwords do not match</span>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p style={s.footer}>
          <Link to="/login" style={s.link}>Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}