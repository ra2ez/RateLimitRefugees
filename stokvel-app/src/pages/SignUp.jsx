import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const s = {
  page:      { minHeight:'100vh', display:'flex', fontFamily:'system-ui,sans-serif', background:'#f8f9fa', color:'#191c1d' },
  left:      { width:'42%', background:'linear-gradient(160deg,#002c13,#014421)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'52px 48px', position:'relative', overflow:'hidden' },
  leftCircle:{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(151,213,165,0.06)' },
  brandTitle:{ fontSize:'26px', fontWeight:'800', color:'#fff', letterSpacing:'-0.5px', margin:0 },
  brandSub:  { fontSize:'11px', fontWeight:'600', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginTop:'4px' },
  steps:     { display:'flex', flexDirection:'column', gap:'24px', position:'relative', zIndex:1 },
  step:      { display:'flex', alignItems:'flex-start', gap:'14px' },
  stepNum:   { width:'30px', height:'30px', borderRadius:'50%', border:'1.5px solid rgba(254,212,136,0.4)', background:'rgba(254,212,136,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', color:'#fed488', flexShrink:0 },
  stepTitle: { fontSize:'14px', fontWeight:'700', color:'#fff', marginBottom:'3px' },
  stepDesc:  { fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:1.5 },
  tagline:   { fontSize:'11px', fontWeight:'600', color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' },
  right:     { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', overflowY:'auto' },
  wrap:      { width:'100%', maxWidth:'380px' },
  h1:        { fontSize:'28px', fontWeight:'800', color:'#191c1d', letterSpacing:'-0.5px', marginBottom:'6px' },
  sub:       { fontSize:'14px', color:'#404941', marginBottom:'28px' },
  error:     { background:'#ffdad6', borderRadius:'8px', padding:'12px 16px', color:'#93000a', fontSize:'13px', marginBottom:'18px' },
  field:     { display:'flex', flexDirection:'column', gap:'5px', marginBottom:'16px' },
  label:     { fontSize:'11px', fontWeight:'600', color:'#404941', letterSpacing:'0.08em', textTransform:'uppercase' },
  input:     { padding:'12px 14px', background:'#fff', border:'1.5px solid rgba(192,201,190,0.4)', borderRadius:'8px', fontSize:'15px', color:'#191c1d', fontFamily:'inherit', outline:'none', width:'100%', boxShadow:'0 1px 3px rgba(25,28,29,0.04)', transition:'border-color 0.2s,box-shadow 0.2s' },
  inputErr:  { borderColor:'#ba1a1a' },
  fieldErr:  { fontSize:'12px', color:'#ba1a1a', marginTop:'2px' },
  btn:       { width:'100%', marginTop:'6px', padding:'13px', background:'#002c13', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,44,19,0.25)', letterSpacing:'0.02em', transition:'background 0.2s' },
  divRow:    { display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' },
  divLine:   { flex:1, height:'1px', background:'rgba(192,201,190,0.35)' },
  divTxt:    { fontSize:'11px', color:'#717970', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'600' },
  footer:    { textAlign:'center', fontSize:'14px', color:'#404941' },
  link:      { color:'#775a19', fontWeight:'700', textDecoration:'none' },
  // success
  successPage:{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fa', fontFamily:'system-ui,sans-serif', padding:'24px' },
  successCard:{ background:'#fff', borderRadius:'16px', padding:'52px 44px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 20px 40px rgba(25,28,29,0.06)' },
  checkCircle:{ width:'60px', height:'60px', borderRadius:'50%', background:'#014421', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' },
  successH:  { fontSize:'24px', fontWeight:'800', color:'#191c1d', marginBottom:'10px' },
  successP:  { fontSize:'14px', color:'#404941', lineHeight:1.6, marginBottom:'28px' },
  backBtn:   { display:'inline-block', padding:'12px 28px', background:'#002c13', color:'#fff', borderRadius:'8px', fontSize:'15px', fontWeight:'700', textDecoration:'none', boxShadow:'0 4px 14px rgba(0,44,19,0.25)' },
}

const focusInput = (e) => { e.target.style.borderColor='#002c13'; e.target.style.boxShadow='0 0 0 3px rgba(0,44,19,0.08)' }
const blurInput  = (e) => { e.target.style.borderColor='rgba(192,201,190,0.4)'; e.target.style.boxShadow='0 1px 3px rgba(25,28,29,0.04)' }

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
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
          We sent a confirmation link to <strong style={{ color:'#002c13' }}>{email}</strong>. Click it to activate your account.
        </p>
        <Link to="/login" style={s.backBtn}>Back to sign in</Link>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftCircle} />
        <div>
          <p style={s.brandTitle}>Heritage Ledger</p>
          <p style={s.brandSub}>Active Stokvel</p>
        </div>
        <div style={s.steps}>
          {[
            { n:'1', title:'Create your account', desc:'Sign up with your name and email.' },
            { n:'2', title:'Join or start a group', desc:'Connect with your stokvel circle.' },
            { n:'3', title:'Track contributions', desc:'Log payouts and grow together.' },
          ].map(({ n, title, desc }) => (
            <div key={n} style={s.step}>
              <div style={s.stepNum}>{n}</div>
              <div>
                <p style={s.stepTitle}>{title}</p>
                <p style={s.stepDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={s.tagline}>Built for community. Rooted in trust.</p>
      </div>

      {/* Right form panel */}
      <div style={s.right}>
        <div style={s.wrap}>
          <h1 style={s.h1}>Create your account</h1>
          <p style={s.sub}>Join your stokvel and start tracking together</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSignUp}>
            {[
              { label:'Full name',        type:'text',     value:fullName,  set:setFullName,  ph:'Thando Dlamini' },
              { label:'Email address',    type:'email',    value:email,     set:setEmail,     ph:'you@example.com' },
              { label:'Password',         type:'password', value:password,  set:setPassword,  ph:'Min. 6 characters' },
              { label:'Confirm password', type:'password', value:confirm,   set:setConfirm,   ph:'Re-enter password', isConfirm:true },
            ].map(({ label, type, value, set, ph, isConfirm }) => (
              <div key={label} style={s.field}>
                <label style={s.label}>{label}</label>
                <input
                  type={type} required value={value} onChange={e => set(e.target.value)}
                  placeholder={ph} onFocus={focusInput} onBlur={blurInput}
                  style={{ ...s.input, ...(isConfirm && confirm && confirm !== password ? s.inputErr : {}) }}
                />
                {isConfirm && confirm && confirm !== password && (
                  <span style={s.fieldErr}>Passwords don&apos;t match</span>
                )}
              </div>
            ))}
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
