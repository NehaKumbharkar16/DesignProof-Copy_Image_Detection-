import React from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, Search, CheckCircle, Shield, Gavel, FileText, Globe,
  Zap, Lock, Eye, BarChart3, Fingerprint, RefreshCw, Mail,
  Server, ShieldCheck, AlertTriangle, UserCheck, Scale, History,
  FileSignature, ChevronRight, UserPlus
} from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">

      {/* Hero Section */}
      <section className="bg-brand-forest dark:bg-slate-950 text-white py-20 px-6">
        <div className="max-w-[1600px] mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-green-300 text-sm font-semibold mb-6">
            TRANSPARENT PROTECTION JOURNEY
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">How DesignProof Works</h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10">
            A step-by-step look at how we combine AI speed with legal safety to protect your brand.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-gradient px-8 py-3 text-lg">Start Free Trial</Link>
          </div>
        </div>
      </section>

      {/* 1. Step 0 - Onboarding (New Section) */}
      <section className="py-16 px-6 max-w-[1000px] mx-auto relative z-10 -mt-10">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 text-center md:text-left">
              <div className="inline-block bg-slate-100 dark:bg-slate-700 text-brand-navy dark:text-white px-3 py-1 rounded-md text-sm font-bold mb-3">
                STEP 0
              </div>
              <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-2">Secure Brand Verification</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Before we start, we ensure legal authority.</p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <VerificationStep icon={<UserPlus size={20} />} text="Submit Brand Details" />
              <VerificationStep icon={<Globe size={20} />} text="Verify Site Ownership" />
              <VerificationStep icon={<FileSignature size={20} />} text="Sign Authorization" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Journey Steps */}
      <section className="py-16 px-6 max-w-[1600px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">The Protection Workflow</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Your daily journey from upload to enforcement.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>

          <StepCard number="1" icon={<Upload size={32} />} title="Upload" desc="Sync Shopify or upload images. AI generates unique fingerprints." />
          <StepCard number="2" icon={<Search size={32} />} title="Detect" desc="System scans global markets and social media for matches." />
          <StepCard number="3" icon={<Eye size={32} />} title="Approve" desc="AI presents matches. You review and authorize action." />
          <StepCard number="4" icon={<Gavel size={32} />} title="Enforce" desc="System sends compliant notices and tracks removal." />
        </div>
      </section>

      {/* 3. Human-in-the-Loop (Core Principle) */}
      <section className="py-20 bg-brand-offwhite dark:bg-slate-800/50">
        <div className="px-6 max-w-[1600px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">AI Never Acts Alone — You Stay in Control</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Our "Human-in-the-Loop" workflow ensures no false takedowns.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 max-w-4xl mx-auto">
            <FlowCard
              icon={<Search size={40} />}
              title="AI Detects Only"
              desc="System identifies potential copies but takes NO action."
              color="blue"
            />
            <div className="hidden md:block text-slate-300 dark:text-slate-600"><ChevronRight size={40} /></div>
            <div className="md:hidden text-slate-300 dark:text-slate-600 rotate-90"><ChevronRight size={40} /></div>

            <FlowCard
              icon={<UserCheck size={40} />}
              title="Client Approves"
              desc="You manually review and click 'Take Down' on valid matches."
              color="orange"
            />
            <div className="hidden md:block text-slate-300 dark:text-slate-600"><ChevronRight size={40} /></div>
            <div className="md:hidden text-slate-300 dark:text-slate-600 rotate-90"><ChevronRight size={40} /></div>

            <FlowCard
              icon={<ShieldCheck size={40} />}
              title="System Enforces"
              desc="Only then does the system send the legal notice."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* 4. Behind the Scenes */}
      <section className="py-20 px-6 max-w-[1600px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">What Happens Behind the Scenes</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">The automated tasks that power your protection.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProcessCard
            icon={<Fingerprint className="text-purple-500" size={28} />}
            title="Visual Fingerprinting"
            desc="Creating unique ID signatures for every image pixel."
          />
          <ProcessCard
            icon={<RefreshCw className="text-purple-500" size={28} />}
            title="Continuous Crawling"
            desc="24/7 scanning of new URL listings worldwide."
          />
          <ProcessCard
            icon={<BarChart3 className="text-purple-500" size={28} />}
            title="Similarity Scoring"
            desc="Calculating match confidence to filter noise."
          />
          <ProcessCard
            icon={<FileText className="text-purple-500" size={28} />}
            title="Evidence Collection"
            desc="Auto-saving screenshots and timestamps as proof."
          />
        </div>
      </section>

      {/* 5. After Takedown & Legal Safety */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="px-6 max-w-[1600px] mx-auto grid md:grid-cols-2 gap-16">

          {/* Post-Action */}
          <div>
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white mb-6 flex items-center gap-3">
              <RefreshCw className="text-brand-gold" /> What Happens After Takedown
            </h3>
            <ul className="space-y-4">
              <ListItem title="Daily Auto-Recheck" desc="System pings the URL every 24h to verify removal." />
              <ListItem title="Reminder Automation" desc="Sends follow-up emails if the first notice is ignored." />
              <ListItem title="Escalation Workflow" desc="Notifies ISP/Host if the site owner doesn't comply." />
              <ListItem title="Resolution Tracking" desc="Marked as 'Resolved' only when the listing is gone." />
            </ul>
          </div>

          {/* Legal Safety */}
          <div>
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white mb-6 flex items-center gap-3">
              <Shield className="text-brand-gold" /> Legal Safety Flow
            </h3>
            <ul className="space-y-4">
              <ListItem title="Pre-Enforcement Authorization" desc="We only act within the scope you explicitly authorize." />
              <ListItem title="Manual Approval Gate" desc="No automated legal threats ever sent without eyes on." />
              <ListItem title="Immutable Audit Trail" desc="Every click and action is logged for legal defense." />
              <ListItem title="Jurisdiction Matching" desc="Notices adapt to US DMCA, EU GDPR, etc. automatically." />
            </ul>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-forest dark:bg-brand-dark-footer text-center px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Safe, Transparent, Effective.</h2>
          <p className="text-lg text-brand-cream/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of brands who trust DesignProof to protect their intellectual property.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link to="/register" className="btn-gradient px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Get Started
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            <Lock size={16} className="text-brand-accent-gold" />
            <span>No auto-takedowns without your approval.</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function VerificationStep({ icon, text }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
      <div className="text-brand-gold">{icon}</div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{text}</span>
    </div>
  )
}

function StepCard({ number, icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 text-center relative z-10">
      <div className="w-16 h-16 mx-auto bg-brand-offwhite dark:bg-slate-900 rounded-full flex items-center justify-center text-brand-navy dark:text-white mb-4 shadow-inner">
        {icon}
      </div>
      <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 dark:text-slate-600">0{number}</div>
      <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-snug">{desc}</p>
    </div>
  )
}

function FlowCard({ icon, title, desc, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  }
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all text-center w-full md:w-1/3">
      <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{desc}</p>
    </div>
  )
}

function ProcessCard({ icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
      <div className="shrink-0 mt-1">{icon}</div>
      <div>
        <h4 className="font-bold text-brand-navy dark:text-white">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  )
}

function ListItem({ title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 text-green-500"><CheckCircle size={20} /></div>
      <div>
        <h4 className="font-bold text-brand-navy dark:text-white">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  )
}
