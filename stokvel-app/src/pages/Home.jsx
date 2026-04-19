import { Link } from 'react-router-dom'
import heroImg from '../assets/background_home.jpg'
import About from "../components/About"
import Group from '../components/Groups'
import Groups from '../components/Groups'
import Security from '../components/Security'


export default function Home() {
  return (
    <div className="bg-surface text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold text-emerald-950 tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Stokvel Management Platform
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="font-semibold text-sm text-amber-500 border-b-2 border-amber-500 pb-1" href="#">Solutions</a>
            <a className="font-semibold text-sm text-emerald-800 hover:text-emerald-950 transition-all" href="#about">About Us</a>
            <a className="font-semibold text-sm text-emerald-800 hover:text-emerald-950 transition-all" href="#groups">Groups</a>
            <a className="font-semibold text-sm text-emerald-800 hover:text-emerald-950 transition-all" href="#security">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-emerald-900 border border-emerald-900 rounded-full hover:bg-gray-100 transition-all duration-300" style={{ fontFamily: 'Manrope, sans-serif' }}>Login</Link>
            <Link to="/signup" className="px-6 py-2 bg-amber-600 text-white rounded-full text-sm font-bold hover:bg-amber-500 transition-all duration-300" style={{ fontFamily: 'Manrope, sans-serif' }}>Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-emerald-950 pt-20">
        <div className="absolute inset-0 opacity-40">
          <img 
              src={heroImg} 
              alt="" 
              className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900 text-emerald-300 rounded-full text-xs font-bold tracking-widest uppercase">
              Digitizing the Legacy of Communial Trust
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-50 leading-tight tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Communal Wealth, <span className="text-amber-300">Secured</span> for Generations.
            </h1>
            <p className="text-base text-emerald-100/80 max-w-lg leading-relaxed font-light">
              The Stokvel Management Platform brings modern transparency to the ancient tradition of Stokvels. Manage contributions, payouts, and group growth with absolute trust.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/signup" className="px-8 py-4 bg-amber-600 text-white font-bold rounded-xl shadow-2xl hover:bg-amber-500 transition-all" style={{ fontFamily: 'Manrope, sans-serif', textDecoration: 'none' }}>
                Start Your Ledger
              </Link>
              <Link to="/login" className="px-8 py-4 border border-emerald-100/20 text-emerald-50 font-bold rounded-xl hover:bg-white/10 transition-all" style={{ fontFamily: 'Manrope, sans-serif', textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*About Section*/}
      <section id='about' className="relative pt-0 pb-24 bg-[#f8f9fa]">
        <About />
      </section>

      <section id='groups' className="relative pt-0 pb-0">
        <Groups />
      </section>

      <section id='security' className="relative pt-0 pb-0">
        <Security />
      </section>


      {/* Footer - from original design */}
      <footer className="w-full py-16 px-8 border-t border-emerald-900/30 bg-emerald-950">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="font-headline font-bold text-emerald-50 text-2xl tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Stokvel Management Platform
            </div>
            <p className="text-xs uppercase tracking-widest text-emerald-200/60 max-w-xs leading-loose">
              © 2026 Rate Limit Refugees. DIGITIZING THE LEGACY OF COMMUNAL TRUST.
            </p>
            <div className="flex gap-4">
              <a className="text-emerald-200/50 hover:text-amber-500 transition-colors" href="#">
                <span className="material-symbols-outlined">social_leaderboard</span>
              </a>
              <a className="text-emerald-200/50 hover:text-amber-500 transition-colors" href="#">
                <span className="material-symbols-outlined">share_reviews</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-amber-500 text-xs uppercase tracking-widest">Platform</h4>
              <nav className="flex flex-col gap-3">
                <a className="text-xs uppercase tracking-widest text-emerald-200/50 hover:text-emerald-50 transition-colors" href="#">Privacy Policy</a>
                <a className="text-xs uppercase tracking-widest text-emerald-200/50 hover:text-emerald-50 transition-colors" href="#">Terms of Service</a>
                <a className="text-xs uppercase tracking-widest text-emerald-200/50 hover:text-emerald-50 transition-colors" href="#">Member Rights</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-amber-400 text-xs uppercase tracking-widest">Community</h4>
              <nav className="flex flex-col gap-3">
                <a className="text-xs uppercase tracking-widest text-emerald-200/50 hover:text-emerald-50 transition-colors" href="#">Contact Support</a>
                <a className="text-xs uppercase tracking-widest text-emerald-200/50 hover:text-emerald-50 transition-colors" href="#">Safety Center</a>
                <a className="text-xs uppercase tracking-widest text-emerald-200/50 hover:text-emerald-50 transition-colors" href="#">Success Stories</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-emerald-900/20 text-center">
          <p className="text-[10px] text-emerald-200/30 uppercase tracking-[0.2em]">Authorized Financial Services Provider • Built in South Africa</p>
        </div>
      </footer>
    </div>
  )
}
