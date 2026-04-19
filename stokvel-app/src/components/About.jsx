export default function About() {
  return (
    <section className="pt-8 pb-16 px-6 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section - Trust Badges */}
        <div className="mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center pt-20 pb-5">
              <span className="text-[#ffdea5] bg-[#002c13] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                About
              </span>
            </div>
            <p className="text-[#5f6c72] text-base font-medium">
              Trusted by 15,000+ members across Africa
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-3">
              <span className="text-[#002c13] text-sm font-bold tracking-wide">SOUTH BANK</span>
              <span className="text-[#002c13] text-sm font-bold tracking-wide">COMMUNITY FOUNDATION</span>
              <span className="text-[#775a19] text-sm font-bold tracking-wide">UBUNTU CAPITAL</span>
              <span className="text-[#002c13] text-sm font-bold tracking-wide">UNITY TRUST</span>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Large Feature: The Concept - OUR HERITAGE */}
          <div className="md:col-span-7 bg-[#002c13] rounded-[2.5rem] p-10 flex flex-col justify-between text-emerald-50 relative overflow-hidden min-h-[500px]">
            <div className="relative z-10 space-y-4">
              <span className="text-[#ffdea5] font-bold tracking-widest uppercase text-xs">Our Heritage</span>
              <h2 className="text-4xl font-bold leading-tight max-w-md" style={{ fontFamily: 'Manrope, sans-serif' }}>
                More than a savings club—<br />it's a promise of mutual growth.
              </h2>
              <p className="text-emerald-100/70 max-w-sm leading-relaxed">
                Stokvels represent the heartbeat of communal finance in South Africa. 
                We provide the digital vault to protect that heartbeat.
              </p>
            </div>
            
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4 opacity-30 mix-blend-overlay">
              <img 
                alt="Trust" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuqhMBnoEpU6rDGheK9CvfIdre72G6vDyK0uq8HqC7kPR39dLig5uv2Wy69Hd9V1K1ug-q5VmXuSkH9kELYUHK6dfv3ZONE4HHiU_2nq7B070IdO-m5eNlvbHjdgqwkJtBxSP3vrDW2UOcPzgPLgCcub2QPaKjNeiJHvC37Bg5Gjd4w0EYQEGrgZY0mmHqYLty6k4lW2IlKqkdXDXvQo8TywIWyUPGVo6BIunQfwh9KaMpcXEd3o-NhYw8PtSQwz414N9uvqPvgVo"
              />
            </div>
          </div>

          {/* Small Feature: Automated Contributions */}
          <div className="md:col-span-5 bg-white rounded-[2.5rem] p-10 flex flex-col shadow-sm border border-[#c0c9be]/20">
            <div className="bg-[#fed488]/20 w-14 h-14 rounded-2xl flex items-center justify-center text-[#775a19] mb-8">
              <span className="material-symbols-outlined text-3xl">payments</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002c13] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Automated Contributions
            </h3>
            <p className="text-[#404941] leading-relaxed mb-6">
              Never miss a cycle. Set up recurring payments that reflect instantly in your group's shared ledger.
            </p>
            <div className="mt-auto pt-6 border-t border-[#c0c9be]/10">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-[#404941]">
                  <span className="material-symbols-outlined text-[#002c13] text-sm">check_circle</span> 
                  Instant bank verification
                </li>
                <li className="flex items-center gap-2 text-sm text-[#404941]">
                  <span className="material-symbols-outlined text-[#002c13] text-sm">check_circle</span> 
                  Cycle tracking & reminders
                </li>
              </ul>
            </div>
          </div>

          {/* Small Feature: Transparent Payouts */}
          <div className="md:col-span-5 bg-white rounded-[2.5rem] p-10 flex flex-col shadow-sm border border-[#c0c9be]/20">
            <div className="bg-[#014421]/10 w-14 h-14 rounded-2xl flex items-center justify-center text-[#014421] mb-8">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002c13] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Transparent Payouts
            </h3>
            <p className="text-[#404941] leading-relaxed mb-6">
              Fair, timely, and documented. Every member knows exactly when their payout is coming, guaranteed by smart logic.
            </p>
            <div className="mt-auto pt-6 border-t border-[#c0c9be]/10">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiXxGoEqOiLlG1WJDmWWCHESRFvgtm8en-2Oy9GiDRiFlv0lYs9_3gAXhHe14zO0T27EK_JE4MEIDwmhjGj2qqyJj3LOjQOeKHCTT5vuGePowp_eJxOXUzehsiNckl2xkyNr1LzuuBtshIHHnFErlDYNceXxtEWOoNgS9Kfy3RxW4UN4XZg80i5flz280W_Z_tCtMSk0wkMGcf1r9ZWHProOHTyDM1YgmFiYcFon5iWcq0Z592PWKQVZzlY7cOBREadWu62J-Bb14"/>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZXAVrxPgGtGJ4Z-EY_lc9pkCZZ3XkfUhmAPvK5ADAojOT5VhBxfUKiDcSXN2cOJKEOaCb_teS8LdGYDgH0ppNrovKNjYQIDFL_yEqTeHgXBTGpjqv6wkKI6DP_GMcQIoh9farNwbNv9LRB5Tb56anSt2eBL31HkVWJoO7V-fgp9obNZxgu57iLKRgHVXDtOqSF616T1_5w-ZaQgMqjRxPd2zmtPdJGkr_9wSe_0Ph_qZxMXBIZKL4BxWHGWcXwXjz1SwF8nQZToY"/>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaL1pZ2w2B3JJa53Y0_J9nFl9GQxmQZUbfyTQEUELj4ReZsFoXsV2tSmBAUWsRaFN4Bl8uDNOEykGp3TtvZKnz19TdsNHOZOV4FIwr07q8g2djVI5Vp1yUKHqrkweCIr6HeNMFM_5tIzrZWT81Y_k3BjffJs1uYmjRToM5sMKMmwRgD0i0hAjiqR_9pOd4ALxGxvISV03bbUUwVKVqWrKf8CbS47qZM97G3gs3uDQGYOshNsCsDI0b_ZRjP7gIOTF52relrjdJNfA"/>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#014421] text-[10px] text-emerald-50 flex items-center justify-center font-bold">+12</div>
              </div>
              <p className="text-xs text-[#404941] mt-2 font-medium">All members must approve major withdrawals.</p>
            </div>
          </div>

          {/* Large Feature: Fortified by Heritage Security */}
          <div className="md:col-span-7 bg-[#edeeef] rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-[#c0c9be]/10">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-[#002c13]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Fortified by Heritage Security
              </h3>
              <p className="text-[#404941] leading-relaxed">
                We use enterprise-grade encryption and multi-sig authorization, ensuring your group's hard-earned savings are safer than any physical ledger could ever be.
              </p>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-[#014421]/5 rounded-lg text-[#014421] text-xs font-bold border border-[#014421]/10 tracking-widest">
                  AES-256
                </div>
                <div className="px-4 py-2 bg-[#014421]/5 rounded-lg text-[#014421] text-xs font-bold border border-[#014421]/10 tracking-widest">
                  FISP COMPLIANT
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 h-48 rounded-2xl bg-[#014421] flex items-center justify-center relative overflow-hidden group">
              <span className="material-symbols-outlined text-emerald-50 text-6xl opacity-20 group-hover:scale-110 transition-transform">security</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[#002c13]/80 to-transparent"></div>
              <span className="absolute bottom-4 text-emerald-50 text-xs font-bold uppercase tracking-widest">Bank-Level Grade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}