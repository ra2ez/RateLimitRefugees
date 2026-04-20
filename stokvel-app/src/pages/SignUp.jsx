import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom' 
import bgImage from '../assets/background_home.jpg'

const s = {
  page:        { minHeight:'100vh', display:'flex', fontFamily:"'Georgia','Times New Roman',serif", background:'#fff', color:'#191c1d' },

  // LEFT PANEL
  left:        { width:'48%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 44px', position:'relative', overflow:'hidden' },
  leftBg: { position:'absolute', inset:0, background:`url(${bgImage}) center/cover no-repeat` },
  leftOverlay: { position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(0,26,11,0.99),rgba(1,68,33,0.90))' },
  leftContent: { position:'relative', zIndex:1, display:'flex', flexDirection:'column', height:'100%', justifyContent:'space-between' },
  brand:       { display:'flex', alignItems:'center', gap:'10px' },
  brandIcon:   { width:'38px', height:'38px', borderRadius:'9px', background:'linear-gradient(135deg,#c49a2a,#fed488)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.25)', flexShrink:0 },
  brandName:   { fontSize:'17px', fontWeight:'700', color:'#fff', letterSpacing:'-0.3px' },
  headline:    { fontSize:'36px', fontWeight:'700', color:'#fff', lineHeight:1.2, letterSpacing:'-0.5px', margin:'0 0 16px' },
  subtext:     { fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:'280px' },
  copyright:   { fontSize:'10px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' },

  // RIGHT PANEL
  right:       { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', overflowY:'auto' },
  wrap:        { width:'100%', maxWidth:'340px' },
  h1:          { fontSize:'26px', fontWeight:'700', color:'#191c1d', letterSpacing:'-0.4px', marginBottom:'6px' },
  sub:         { fontSize:'14px', color:'#6b7280', marginBottom:'28px', fontFamily:'system-ui,sans-serif' },
  error:       { background:'#ffdad6', borderRadius:'8px', padding:'11px 14px', color:'#93000a', fontSize:'13px', marginBottom:'16px', fontFamily:'system-ui,sans-serif' },
  field:       { display:'flex', flexDirection:'column', gap:'5px', marginBottom:'14px' },
  label:       { fontSize:'10px', fontWeight:'600', color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' },
  inputWrap:   { position:'relative', display:'flex', alignItems:'center' },
  inputIcon:   { position:'absolute', left:'13px', color:'#9ca3af', pointerEvents:'none' },
  input:       { width:'100%', padding:'11px 14px 11px 38px', background:'#f9fafb', border:'1.5px solid #f0ede8', borderRadius:'9px', fontSize:'14px', color:'#191c1d', fontFamily:'system-ui,sans-serif', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' },
  inputNoIcon: { width:'100%', padding:'11px 14px', background:'#f9fafb', border:'1.5px solid #f0ede8', borderRadius:'9px', fontSize:'14px', color:'#191c1d', fontFamily:'system-ui,sans-serif', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' },
  inputErr:    { borderColor:'#ba1a1a' },
  fieldErr:    { fontSize:'12px', color:'#ba1a1a', marginTop:'2px', fontFamily:'system-ui,sans-serif' },
  eyeBtn:      { position:'absolute', right:'12px', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'2px' },
  btn:         { width:'100%', marginTop:'8px', padding:'13px', background:'#013918', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,44,19,0.25)', letterSpacing:'0.02em', transition:'background 0.2s', fontFamily:'system-ui,sans-serif' },
  divRow:      { display:'flex', alignItems:'center', gap:'12px', margin:'20px 0' },
  divLine:     { flex:1, height:'1px', background:'#f0ede8' },
  divTxt:      { fontSize:'11px', color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', fontFamily:'system-ui,sans-serif' },
  footer:      { textAlign:'center', fontSize:'14px', color:'#6b7280', fontFamily:'system-ui,sans-serif' },
  link:        { color:'#775a19', fontWeight:'700', textDecoration:'none' },

  // SUCCESS
  successPage: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fa', fontFamily:'system-ui,sans-serif', padding:'24px' },
  successCard: { background:'#fff', borderRadius:'16px', padding:'52px 44px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 20px 40px rgba(25,28,29,0.06)' },
  checkCircle: { width:'60px', height:'60px', borderRadius:'50%', background:'#014421', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' },
  successH:    { fontSize:'24px', fontWeight:'800', color:'#191c1d', marginBottom:'10px' },
  successP:    { fontSize:'14px', color:'#404941', lineHeight:1.6, marginBottom:'28px' },
  backBtn:     { display:'inline-block', padding:'12px 28px', background:'#013918', color:'#fff', borderRadius:'10px', fontSize:'15px', fontWeight:'700', textDecoration:'none', boxShadow:'0 4px 14px rgba(0,44,19,0.25)' },
}

const focusInput = (e) => { e.target.style.borderColor='#002c13'; e.target.style.boxShadow='0 0 0 3px rgba(0,44,19,0.08)'; e.target.style.background='#fff' }
const blurInput  = (e) => { e.target.style.borderColor='#f0ede8'; e.target.style.boxShadow='none'; e.target.style.background='#f9fafb' }

export default function SignUp() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } },
    })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div style={s.successPage}>
      <div style={s.successCard}>
        <div style={s.checkCircle}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={s.successH}>Check your email</h2>
        <p style={s.successP}>
          We sent a confirmation link to <strong style={{ color:'#013918' }}>{email}</strong>. Click it to activate your account.
        </p>
        <Link to="/login" style={s.backBtn}>Back to sign in</Link>
      </div>
    </div>
  )

  const EyeOpen  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  const EyeClosed= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

  return (
    <div style={s.page}>

      {/* LEFT */}
      <div style={s.left}>
        <div style={s.leftBg} />
        <div style={s.leftOverlay} />
        <div style={s.leftContent}>

          {/* Brand */}
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M3 10h18M5 10V21M9 10V21M15 10V21M19 10V21M12 3L2 9h20L12 3z"
                  stroke="#002c13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={s.brandName}>Stokvel Management Platform</span>
          </div>

          {/* Headline */}
          <div>
            <h2 style={s.headline}>
              Join thousands<br />
              building wealth<br />
              together.
            </h2>
            <p style={s.subtext}>
              Create your account and connect with your stokvel circle. Track contributions, manage payouts, and grow together.
            </p>
          </div>

          {/* Copyright */}
          <p style={s.copyright}>© 2026 Rate Limit Refugees • SD Project</p>
        </div>
      </div>

      {/* RIGHT */}
      <div style={s.right}>
        <div style={s.wrap}>
          <h1 style={s.h1}>Create your account</h1>
          <p style={s.sub}>Join your stokvel and start tracking together</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSignUp}>

            {/* Full Name */}
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input
                  type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Heritage Ledger"
                  style={s.input} onFocus={focusInput} onBlur={blurInput}
                />
              </div>
            </div>

            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={s.input} onFocus={focusInput} onBlur={blurInput}
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={s.input} onFocus={focusInput} onBlur={blurInput}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={s.field}>
              <label style={s.label}>Confirm Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'} required value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ ...s.input, ...(confirm && confirm !== password ? s.inputErr : {}) }}
                  onFocus={focusInput} onBlur={blurInput}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <span style={s.fieldErr}>Passwords don't match</span>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div style={s.divRow}>
            <div style={s.divLine} /><span style={s.divTxt}>or</span><div style={s.divLine} />
          </div>
          <p style={s.footer}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
