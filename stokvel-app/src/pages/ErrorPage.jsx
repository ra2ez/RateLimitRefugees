import { useState } from 'react'
import { Link } from 'react-router-dom'

const jokes = [
  "This page ran off with the stokvel funds. We're investigating.",
  "Gone. Like that one member who owes everyone money.",
  "Our treasurer blamed load shedding. We're not so sure.",
  "This page is on a payout cycle that hasn't come around yet.",
]

export default function ErrorPage() {
  const [joke, setJoke] = useState(0)

  return (
    <div style={{ minHeight: '100vh', background: '#002c13', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '48px 40px', maxWidth: '460px', width: '100%', textAlign: 'center' }}>

        {/* Animated emoji */}
        <div style={{ fontSize: '80px', marginBottom: '16px', display: 'inline-block', animation: 'spin 2s ease-in-out infinite alternate' }}>
          😵
        </div>

        <h1 style={{ fontSize: '72px', fontWeight: '800', color: '#002c13', margin: '0', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#191c1d', margin: '12px 0 24px' }}>
          This page pulled a disappearing act.
        </h2>

        {/* Joke box — click to change joke */}
        <div
          onClick={() => setJoke((joke + 1) % jokes.length)}
          style={{ background: '#f8f9f0', border: '2px dashed #c0c9be', borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', marginBottom: '8px' }}
        >
          <p style={{ margin: 0, color: '#404941', fontStyle: 'italic', fontSize: '14px' }}>
            💸 "{jokes[joke]}"
          </p>
        </div>
        <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '28px' }}>👆 tap for another excuse</p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" style={{ padding: '12px 24px', background: '#013918', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
            🏠 Go Home
          </Link>
          <Link to="/login" style={{ padding: '12px 24px', background: '#fff', color: '#013918', border: '1.5px solid #c0c9be', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
            🔑 Login
          </Link>
        </div>

      </div>

      {/* Spinning animation for the emoji */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(-15deg); }
          to   { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  )
}
