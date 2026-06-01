import React from 'react'

import { Link } from 'react-router-dom'

function IconCheck() {
  return (
    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  )
}

export default function Home() {
  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Hero */}
      <section className="bg-brand-navy dark:bg-slate-950 text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-[1600px] mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-brand-gold text-sm font-semibold mb-6">
            PROTECT YOUR BRAND — AI-ASSISTED
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Protect Your Designs From <span className="text-brand-gold">Copycats Using AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Detect copied designs, automate takedowns, and protect your revenue with continuous monitoring and compliant workflows.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-gradient px-8 py-4 text-lg font-bold shadow-lg hover:shadow-brand-gold/20">
              Start Free Trial
            </Link>
            <Link to="/login" className="btn-outline px-8 py-4 text-lg font-bold shadow-lg text-white hover:text-slate-900 hover:bg-white border-white">
              Log In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="w-full py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text Content - Left */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-brand-charcoal dark:text-white tracking-wide">Brands lose millions due to copied designs</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed text-lg">Counterfeit and unauthorized sellers erode brand value, dilute product revenue, and create legal headaches. Monitoring the web manually is slow and expensive.</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-slate-600 font-medium"><span className="text-green-400"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></span> Hard to monitor the internet at scale</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><span className="text-green-400"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></span> Manual legal process is time-consuming</li>
                <li className="flex items-center gap-3 text-slate-600 font-medium"><span className="text-green-400"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></span> Revenue loss from unauthorized resellers</li>
              </ul>
            </div>

            {/* Stats Cards - Right (Stacked) */}
            <div className="md:w-1/2 w-full flex flex-col gap-5">
              {/* Card 1: $1.2M - Pale Blue + Stacked Effect */}
              <div className="relative group">
                {/* Stacked Shadow Effect */}
                <div className="absolute inset-x-4 -bottom-2 h-full bg-slate-100 dark:bg-slate-800 rounded-xl opacity-60 scale-95 duration-300"></div>
                <div className="relative bg-gradient-to-br from-[#f8faff] to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="text-3xl font-bold text-brand-navy dark:text-white">$1.2M</div>
                    <div className="text-slate-400 font-medium mt-1 text-sm">Avg. losses/year</div>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
              </div>

              {/* Card 2: 75% - Pale Lavender */}
              <div className="bg-gradient-to-br from-[#faf8ff] to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="text-3xl font-bold text-brand-navy dark:text-white">75%</div>
                  <div className="text-slate-400 font-medium mt-1 text-sm">Of listings unmonitored</div>
                </div>
                <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </div>
              </div>

              {/* Card 3: Time - Neutral White */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="text-3xl font-bold text-brand-navy dark:text-white">3-6 mo</div>
                  <div className="text-slate-400 text-sm font-medium mt-1">Avg manual takedown time</div>
                </div>
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="w-full py-16 bg-brand-offwhite dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6">
          <h3 className="text-xl font-semibold mb-6 text-brand-forest dark:text-white">Core Features</h3>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {/* Card 1: Light Blue */}
            <div className="rounded-[12px] border border-black/5 dark:border-slate-700 p-6 bg-gradient-to-br from-[#E0E7FF] to-[#DBEAFE] dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="font-semibold text-slate-800 dark:text-white">AI Design Detection</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-2">Detect copies, edits, and inspired variants using ML.</div>
            </div>
            {/* Card 2: Mint Green */}
            <div className="rounded-[12px] border border-black/5 dark:border-slate-700 p-6 bg-gradient-to-br from-[#DCFCE7] to-[#F0FDF4] dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="font-semibold text-slate-800 dark:text-white">Automated Monitoring</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-2">Continuous scans across stores, marketplaces, and ads.</div>
            </div>
            {/* Card 3: Warm Peach */}
            <div className="rounded-[12px] border border-black/5 dark:border-slate-700 p-6 bg-gradient-to-br from-[#FFEDD5] to-[#FFF7ED] dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="font-semibold text-slate-800 dark:text-white">Legal Takedown Notices</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-2">Generate compliant notices and track responses.</div>
            </div>
            {/* Card 4: Soft Rose */}
            <div className="rounded-[12px] border border-black/5 dark:border-slate-700 p-6 bg-gradient-to-br from-[#FCE7F3] to-[#FFF1F2] dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="font-semibold text-slate-800 dark:text-white">Revenue Protection</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-2">Estimate recovered revenue and ROI for enforcement.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works preview */}
      <section className="w-full py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6">
          <h3 className="text-xl font-semibold mb-8 text-brand-forest dark:text-white">How it works</h3>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {/* Step 1 */}
            <div className="animate-float card text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-500 text-2xl font-bold text-blue-600 mb-3">1</div>
              <div className="font-semibold mt-2 dark:text-white">Upload</div>
              <div className="muted text-sm mt-1 dark:text-slate-400">Add your designs or import from Shopify.</div>
            </div>
            {/* Step 2 */}
            <div className="animate-float card text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700" style={{ animationDelay: '1s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-fuchsia-500 text-2xl font-bold text-fuchsia-600 mb-3">2</div>
              <div className="font-semibold mt-2 dark:text-white">Detect</div>
              <div className="muted text-sm mt-1 dark:text-slate-400">AI scans the web for similar images.</div>
            </div>
            {/* Step 3 */}
            <div className="animate-float card text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700" style={{ animationDelay: '2s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-orange-500 text-2xl font-bold text-orange-600 mb-3">3</div>
              <div className="font-semibold mt-2 dark:text-white">Approve</div>
              <div className="muted text-sm mt-1 dark:text-slate-400">Review matches and approve takedowns.</div>
            </div>
            {/* Step 4 */}
            <div className="animate-float card text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700" style={{ animationDelay: '3s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-green-500 text-2xl font-bold text-green-600 mb-3">4</div>
              <div className="font-semibold mt-2 dark:text-white">Remove</div>
              <div className="muted text-sm mt-1 dark:text-slate-400">Notices sent and removals tracked.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full py-16 bg-brand-offwhite dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6">
          <h3 className="text-3xl font-bold mb-8 text-brand-charcoal dark:text-white tracking-wide">Benefits</h3>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Card 1: Soft Sky Blue */}
            <div className="rounded-lg p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-gradient-to-br from-[#f0f9ff] to-white dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="font-bold text-xl text-brand-navy dark:text-white mb-2">Saves time</div>
              <div className="text-slate-500 dark:text-slate-400 leading-relaxed">Automate discovery and enforcement workflows so your team can focus on design.</div>
            </div>

            {/* Card 2: Pale Sage Green */}
            <div className="rounded-lg p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-gradient-to-br from-[#f0fdf4] to-white dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="font-bold text-xl text-brand-navy dark:text-white mb-2">Protects revenue</div>
              <div className="text-slate-500 dark:text-slate-400 leading-relaxed">Reduce unauthorized sales and recover earnings by removing copycat listings.</div>
            </div>

            {/* Card 3: Light Warm Sand */}
            <div className="rounded-lg p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-gradient-to-br from-[#fffaf3] to-white dark:from-slate-800 dark:to-slate-900 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="font-bold text-xl text-brand-navy dark:text-white mb-2">Legal safe automation</div>
              <div className="text-slate-500 dark:text-slate-400 leading-relaxed">Compliant takedown templates and audit trails ensure you stay protected.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6">
          <h3 className="text-3xl font-bold mb-8 text-brand-charcoal dark:text-white tracking-wide">Trusted by brands</h3>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="rounded-lg p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-yellow-400 mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                ))}
              </div>
              <div className="font-medium text-lg text-slate-700 dark:text-slate-200 italic mb-4">"DesignProof stopped unauthorized sellers within weeks. It's truly a game changer."</div>
              <div className="text-slate-500 text-sm border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                <div>
                  <div className="font-semibold text-brand-navy dark:text-white">Sarah Jenkins</div>
                  <div className="text-xs">Head of Ops, Brand A</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-yellow-400 mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                ))}
              </div>
              <div className="font-medium text-lg text-slate-700 dark:text-slate-200 italic mb-4">"Our revenue recovered after the first month. The automation is seamless."</div>
              <div className="text-slate-500 text-sm border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                <div>
                  <div className="font-semibold text-brand-navy dark:text-white">Mike Ross</div>
                  <div className="text-xs">Legal Counsel, Brand B</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-yellow-400 mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                ))}
              </div>
              <div className="font-medium text-lg text-slate-700 dark:text-slate-200 italic mb-4">"Easy to use and legally safe. I can finally sleep at night."</div>
              <div className="text-slate-500 text-sm border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                <div>
                  <div className="font-semibold text-brand-navy dark:text-white">Jessica Pearson</div>
                  <div className="text-xs">Founder, Brand C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-20 text-white bg-brand-forest dark:bg-brand-dark-footer transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Start Protecting Your Designs Today</h3>
            <p className="muted mt-2 text-white/80">Sign up for a free trial or book a demo to see the platform in action.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="btn-gradient">Get Started</Link>
            <Link to="/login" className="btn-outline text-white hover:text-slate-900 hover:bg-white border-white">Log In</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

