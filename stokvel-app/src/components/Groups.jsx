export default function Groups() {
  return (
    <section className="py-24 px-6 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#ffdea5] bg-[#002c13] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Community</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#002c13] mt-4 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Find Your Perfect Stokvel Circle
          </h2>
          <p className="text-[#404941] max-w-2xl mx-auto">
            Join existing groups or create your own. Connect with trusted members who share your savings goals.
          </p>
        </div>

        {/* Add your groups content here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Group cards will go here */}
        </div>
      </div>
    </section>
  )
}
