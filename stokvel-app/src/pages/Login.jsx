import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

const s = {
  page:      { minHeight:'100vh', display:'flex', fontFamily:'system-ui,sans-serif', background:'#f8f9fa', color:'#191c1d' },
  left:      { width:'42%', background:'linear-gradient(160deg,#002c13,#014421)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'52px 48px', position:'relative', overflow:'hidden' },
  leftCircle:{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(151,213,165,0.06)' },
  brandTitle:{ fontSize:'26px', fontWeight:'800', color:'#fff', letterSpacing:'-0.5px', margin:0 },
  brandSub:  { fontSize:'11px', fontWeight:'600', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginTop:'4px' },
  quote:     { position:'relative', zIndex:1 },
  quoteText: { fontSize:'24px', fontWeight:'700', color:'#fff', lineHeight:1.4, marginBottom:'12px' },
  quoteEm:   { color:'#fed488' },
  quoteCap:  { fontSize:'13px', color:'rgba(255,255,255,0.4)' },
  stats:     { display:'flex', gap:'28px' },
  statVal:   { fontSize:'20px', fontWeight:'800', color:'#fed488' },
  statLbl:   { fontSize:'10px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'2px' },
  right:     { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' },
  wrap:      { width:'100%', maxWidth:'380px' },
  h1:        { fontSize:'28px', fontWeight:'800', color:'#191c1d', letterSpacing:'-0.5px', marginBottom:'6px' },
  sub:       { fontSize:'14px', color:'#404941', marginBottom:'32px' },
  error:     { background:'#ffdad6', borderRadius:'8px', padding:'12px 16px', color:'#93000a', fontSize:'13px', marginBottom:'20px' },
  field:     { display:'flex', flexDirection:'column', gap:'5px', marginBottom:'18px' },
  label:     { fontSize:'11px', fontWeight:'600', color:'#404941', letterSpacing:'0.08em', textTransform:'uppercase' },
  labelRow:  { display:'flex', justifyContent:'space-between', alignItems:'center' },
  input:     { padding:'12px 14px', background:'#fff', border:'1.5px solid rgba(192,201,190,0.4)', borderRadius:'8px', fontSize:'15px', color:'#191c1d', fontFamily:'inherit', outline:'none', width:'100%', boxShadow:'0 1px 3px rgba(25,28,29,0.04)', transition:'border-color 0.2s,box-shadow 0.2s' },
  forgot:    { fontSize:'12px', color:'#775a19', fontWeight:'600', textDecoration:'none' },
  btn:       { width:'100%', marginTop:'6px', padding:'13px', background:'#002c13', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,44,19,0.25)', letterSpacing:'0.02em', transition:'background 0.2s' },
  divRow:    { display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' },
  divLine:   { flex:1, height:'1px', background:'rgba(192,201,190,0.35)' },
  divTxt:    { fontSize:'11px', color:'#717970', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' },
  footer:    { textAlign:'center', fontSize:'14px', color:'#404941' },
  link:      { color:'#775a19', fontWeight:'700', textDecoration:'none' },
}

const focusInput  = (e) => { e.target.style.borderColor='#002c13'; e.target.style.boxShadow='0 0 0 3px rgba(0,44,19,0.08)' }
const blurInput   = (e) => { e.target.style.borderColor='rgba(192,201,190,0.4)'; e.target.style.boxShadow='0 1px 3px rgba(25,28,29,0.04)' }

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    options: {
      redirectTo: window.location.origin + '/dashboard'
    }
  })
}

  return (
    <div style={s.page}>
      {/* Left panel — hidden on mobile via inline media would need CSS; shown always here for simplicity */}
      <div style={s.left}>
        <div style={s.leftCircle} />
        <div>
          <p style={s.brandTitle}>Heritage Ledger</p>
          <p style={s.brandSub}>Active Stokvel</p>
        </div>
        <div style={s.quote}>
          <p style={s.quoteText}>
            Where <span style={s.quoteEm}>community</span> becomes capital, and trust becomes treasure.
          </p>
          <p style={s.quoteCap}>Managing stokvels with dignity since day one.</p>
        </div>
        <div style={s.stats}>
          <div><p style={s.statVal}>R 84,250</p><p style={s.statLbl}>Avg. Pool</p></div>
          <div><p style={s.statVal}>1,200+</p><p style={s.statLbl}>Groups</p></div>
          <div><p style={s.statVal}>98%</p><p style={s.statLbl}>On-time</p></div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={s.right}>
        <div style={s.wrap}>
          <h1 style={s.h1}>Welcome back</h1>
          <p style={s.sub}>Sign in to your stokvel group</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" style={s.input} onFocus={focusInput} onBlur={blurInput} />
            </div>
            <div style={s.field}>
              <div style={s.labelRow}>
                <label style={s.label}>Password</label>
                <Link to="/forgot-password" style={s.forgot}>Forgot password?</Link>
              </div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={s.input} onFocus={focusInput} onBlur={blurInput} />
            </div>
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={s.divRow}>
            <div style={s.divLine} /><span style={s.divTxt}>or</span><div style={s.divLine} />
          </div>
          <button onClick={handleGithubLogin} style={{ ...s.btn, background: '#24292e', marginTop: '0' }}>
            Sign in with GitHub
          </button>
          <p style={s.footer}>
            New here? <Link to="/signup" style={s.link}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
