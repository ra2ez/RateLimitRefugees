import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

const s = {
  page:        { minHeight:'100vh', display:'flex', fontFamily:"'Georgia','Times New Roman',serif", background:'#fff', color:'#191c1d' },
  card:        { display:'flex', width:'100%', minHeight:'100vh' },
  left:        { width:'48%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 44px', position:'relative', overflow:'hidden' },
  leftBg:      { position:'absolute', inset:0, background:'url("/src/assets/background_home.jpg") center/cover no-repeat' },
  leftOverlay: { position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(0,26,11,0.99),rgba(1,68,33,0.90))' },
  leftContent: { position:'relative', zIndex:1, display:'flex', flexDirection:'column', height:'100%', justifyContent:'space-between' },
  brand:       { display:'flex', alignItems:'center', gap:'10px' },
  brandIcon:   { width:'38px', height:'38px', borderRadius:'9px', background:'linear-gradient(135deg,#c49a2a,#fed488)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.25)', flexShrink:0 },
  brandName:   { fontSize:'17px', fontWeight:'700', color:'#fff', letterSpacing:'-0.3px' },
  headline:    { fontSize:'36px', fontWeight:'700', color:'#fff', lineHeight:1.2, letterSpacing:'-0.5px', margin:'0 0 16px' },
  subtext:     { fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:'280px' },
  copyright:   { fontSize:'10px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' },
  right:       { flex:1, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 44px' },
  wrap:        { width:'100%', maxWidth:'320px' },
  h1:          { fontSize:'26px', fontWeight:'700', color:'#191c1d', letterSpacing:'-0.4px', marginBottom:'6px' },
  sub:         { fontSize:'14px', color:'#6b7280', marginBottom:'28px', fontFamily:'system-ui,sans-serif' },
  githubBtn:   { width:'100%', padding:'12px', background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', fontWeight:'600', color:'#191c1d', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontFamily:'system-ui,sans-serif', transition:'background 0.2s,border-color 0.2s', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' },
  divRow:      { display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' },
  divLine:     { flex:1, height:'1px', background:'#f0ede8' },
  divTxt:      { fontSize:'11px', color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600', fontFamily:'system-ui,sans-serif' },
  error:       { background:'#ffdad6', borderRadius:'8px', padding:'11px 14px', color:'#93000a', fontSize:'13px', marginBottom:'16px', fontFamily:'system-ui,sans-serif' },
  fieldWrap:   { position:'relative', marginBottom:'14px' },
  fieldLabel:  { fontSize:'10px', fontWeight:'600', color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif', display:'block', marginBottom:'5px' },
  inputWrap:   { position:'relative', display:'flex', alignItems:'center' },
  inputIcon:   { position:'absolute', left:'13px', color:'#9ca3af', pointerEvents:'none' },
  input:       { width:'100%', padding:'11px 14px 11px 38px', background:'#f9fafb', border:'1.5px solid #f0ede8', borderRadius:'9px', fontSize:'14px', color:'#191c1d', fontFamily:'system-ui,sans-serif', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' },
  eyeBtn:      { position:'absolute', right:'12px', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'2px' },
  labelRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' },
  forgot:      { fontSize:'12px', color:'#775a19', fontWeight:'600', textDecoration:'none', fontFamily:'system-ui,sans-serif' },
  btn:         { width:'100%', marginTop:'8px', padding:'13px', background:'#013918', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'pointer', letterSpacing:'0.02em', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(0,44,19,0.25)', transition:'background 0.2s' },
  securityBadge:{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'20px', background:'#fdf8ee', border:'1px solid #f0e4b8', borderRadius:'8px', padding:'9px 14px' },
  badgeText:   { fontSize:'11px', color:'#775a19', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' },
  footer:      { textAlign:'center', fontSize:'14px', color:'#6b7280', marginTop:'20px', fontFamily:'system-ui,sans-serif' },
  link:        { color:'#775a19', fontWeight:'700', textDecoration:'none' },
}

const focusInput = (e) => { e.target.style.borderColor = '#002c13'; e.target.style.boxShadow = '0 0 0 3px rgba(0,44,19,0.08)'; e.target.style.background = '#fff' }
const blurInput  = (e) => { e.target.style.borderColor = '#f0ede8'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb' }

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

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
              <span style={s.brandName}>Heritage Ledger</span>
            </div>

            {/* Headline */}
            <div>
              <h2 style={s.headline}>
                Securing the<br />
                future of<br />
                communal wealth.
              </h2>
              <p style={s.subtext}>
                Digitizing South Africa's legacy of trust. Join thousands of Stokvels managing their collective prosperity with transparency and ease.
              </p>
            </div>

            {/* Copyright */}
            <p style={s.copyright}>© 2026 Rate Limit Refugees • SD Project</p>
          </div>
        </div>

        {/* RIGHT */}
        <div style={s.right}>
          <div style={s.wrap}>
            <h1 style={s.h1}>Welcome Back</h1>
            <p style={s.sub}>Continue your journey toward collective growth.</p>

            {/* GitHub */}
            <button
              onClick={handleGithubLogin}
              style={s.githubBtn}
              onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            <div style={s.divRow}>
              <div style={s.divLine} />
              <span style={s.divTxt}>or email</span>
              <div style={s.divLine} />
            </div>

            {error && <div style={s.error}>{error}</div>}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={s.fieldWrap}>
                <label style={s.fieldLabel}>Email or Phone</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. thando@example.com"
                    style={s.input} onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={s.fieldWrap}>
                <div style={s.labelRow}>
                  <label style={s.fieldLabel}>Password</label>
                  <Link to="/forgot-password" style={s.forgot}>Forgot?</Link>
                </div>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={s.input} onFocus={focusInput} onBlur={blurInput}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p style={s.footer}>
              New to the Ledger? <Link to="/signup" style={s.link}>Create an Account</Link>
            </p>

            {/* Security badge */}
            <div style={s.securityBadge}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#775a19" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={s.badgeText}>End-to-end encrypted secure access</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
