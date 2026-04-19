// Security.jsx
export default function Security() {
  return (
    <section className="py-24 px-6 bg-[#edeeef]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#ffdea5] bg-[#002c13] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Protection</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#002c13] mt-4 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Bank-Level Security
          </h2>
          <p className="text-[#404941] max-w-2xl mx-auto">
            Your savings are protected with enterprise-grade encryption and multi-signature authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  
        {/* Security Feature 1 - Row Level Security */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#c0c9be]/20">
            <div className="w-16 h-16 rounded-2xl bg-[#014421]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-[#014421]">data_usage</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002c13] mb-3">Row Level Security (RLS)</h3>
            <p className="text-[#404941] leading-relaxed">
            Every user can only see their own data. Our RLS policies ensure that no member can view another member's personal information or contribution history unless authorized.
            </p>
        </div>

        {/* Security Feature 2 - Supabase Authentication */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#c0c9be]/20">
            <div className="w-16 h-16 rounded-2xl bg-[#014421]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-[#014421]">login</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002c13] mb-3">Supabase Authentication</h3>
            <p className="text-[#404941] leading-relaxed">
            Secure email/password authentication with GitHub OAuth support. Passwords are hashed and sessions managed using JWT tokens for stateless, secure access.
            </p>
        </div>

        {/* Security Feature 3 - Auto-Profile Creation */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#c0c9be]/20">
            <div className="w-16 h-16 rounded-2xl bg-[#014421]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-[#014421]">sync_alt</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002c13] mb-3">Auto-Profile Creation</h3>
            <p className="text-[#404941] leading-relaxed">
            When a user signs up, their profile is automatically created in the database. No manual intervention needed — the database trigger handles it instantly and securely.
            </p>
        </div>

        {/* Security Feature 4 - Environment Variable Protection */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#c0c9be]/20">
            <div className="w-16 h-16 rounded-2xl bg-[#014421]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-[#014421]">encrypted</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002c13] mb-3">Environment Variable Protection</h3>
            <p className="text-[#404941] leading-relaxed">
            API keys and credentials are never exposed in code or committed to GitHub. Secrets are stored in .env files locally and as environment variables in production on Netlify.
            </p>
        </div>

        </div>

        <div className="mt-12 p-8 bg-[#014421] rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#ffdea5]">verified</span>
                <span className="text-[#ffdea5] font-bold uppercase tracking-wider">RLS POLICIES ACTIVE • JWT AUTHENTICATION • .ENV SECURED</span>
            </div>
            <p className="text-emerald-100/80 text-sm">
                Supabase Auth • GitHub OAuth • Database Triggers • Netlify Environment Variables
            </p>
        </div>
      </div>
    </section>
  )
}