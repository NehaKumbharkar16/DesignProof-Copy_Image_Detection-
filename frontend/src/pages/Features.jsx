import React from 'react'
import { Link } from 'react-router-dom'
import {
  Scan, Gavel, Zap, BarChart3, ShieldCheck,
  Fingerprint, Globe, Eye, UserCheck, FileText,
  Mail, AlertTriangle, Lock, Server, CheckCircle,
  Database, Layers, Smartphone
} from 'lucide-react'

export default function Features() {
  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">

      {/* Hero Section */}
      <section className="bg-brand-navy dark:bg-slate-950 text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-[1600px] mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-brand-gold text-sm font-semibold mb-6">
            POWERFUL BRAND PROTECTION TECHNOLOGY
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Enterprise-Grade <span className="text-brand-gold">Detection & Enforcement</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            The most advanced AI infrastructure for identifying and removing intellectual property infringements at scale.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-gradient px-8 py-4 text-lg font-bold shadow-lg hover:shadow-brand-gold/20">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* 1. Detection Intelligence (AI Power) */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="md:w-1/3">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Scan size={36} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">Detection Intelligence</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Our proprietary visual recognition engine scans millions of images daily to find unauthorized usage of your designs, even when modified.
            </p>
          </div>
          <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
            <FeatureBlock
              icon={<Fingerprint size={28} />}
              title="Visual Fingerprint Technology"
              desc="Generates a unique digital signature for every design to identify matches with 99.8% accuracy."
              color="blue"
            />
            <FeatureBlock
              icon={<Layers size={28} />}
              title="Modified Copy Detection"
              desc="Detects complex alterations including background removal, color swaps, and model changes."
              color="blue"
            />
            <FeatureBlock
              icon={<Globe size={28} />}
              title="Multi-Source Monitoring"
              desc="Simultaneously scans marketplaces (Amazon, Etsy), social media, standalone sites, and Google Images."
              color="blue"
            />
            <FeatureBlock
              icon={<Eye size={28} />}
              title="False-Positive Filtering"
              desc="Smart confidence scoring filters out irrelevant matches so you focus only on real infringements."
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* 2. Legal Enforcement Engine */}
      <section className="py-24 bg-brand-offwhite dark:bg-slate-800/50">
        <div className="px-6 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="md:w-1/3 text-right">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 ml-auto">
                <Gavel size={36} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">Legal Enforcement Engine</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Automate the legal heavy lifting with a system built on robust intellectual property laws and compliance frameworks.
              </p>
            </div>
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
              <FeatureBlock
                icon={<FileText size={28} />}
                title="Compliant Notice Templates"
                desc="Pre-vetted legal templates that adhere to DMCA, GDPR, and platform-specific IP policies."
                color="indigo"
              />
              <FeatureBlock
                icon={<Server size={28} />}
                title="Platform Automation"
                desc="Direct API integrations with major platforms to submit takedown requests instantly."
                color="indigo"
              />
              <FeatureBlock
                icon={<UserCheck size={28} />}
                title="Authorized IP Representation"
                desc="We act as your designated enforcement agent, protecting your identity while taking action."
                color="indigo"
              />
              <FeatureBlock
                icon={<Globe size={28} />}
                title="Country-Adaptive Language"
                desc="Automatically translates legal assertions to match the jurisdiction of the infringing host."
                color="indigo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Automation */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/3">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
              <Zap size={36} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">Workflow Automation</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Streamline your protection operations. What used to take days of manual work now happens in minutes.
            </p>
          </div>
          <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
            <FeatureBlock
              icon={<Database size={28} />}
              title="Bulk Approval Actions"
              desc="Review and approve hundreds of matches at once with intelligent grouping."
              color="orange"
            />
            <FeatureBlock
              icon={<Mail size={28} />}
              title="Auto Reminder Emails"
              desc="Automatically sends follow-up notices if the initial takedown request is ignored."
              color="orange"
            />
            <FeatureBlock
              icon={<AlertTriangle size={28} />}
              title="Escalation Engine"
              desc="Triggers elevated notices to hosting providers and payment gateways for stubborn infringers."
              color="orange"
            />
            <FeatureBlock
              icon={<CheckCircle size={28} />}
              title="Compliance Tracking"
              desc="Real-time status updates on every notice sent, from 'Submitted' to 'Resolved'."
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* 4. Business Protection Insights */}
      <section className="py-24 bg-brand-offwhite dark:bg-slate-800/50">
        <div className="px-6 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="md:w-1/3 text-right">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 ml-auto">
                <BarChart3 size={36} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">Business Protection Insights</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Turn protection into a growth metric. Understand the financial impact of your enforcement efforts.
              </p>
            </div>
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
              <FeatureBlock
                icon={<Smartphone size={28} />}
                title="Revenue Impact Analytics"
                desc="Estimate recovered revenue based on traffic redirected from taken-down listings."
                color="green"
              />
              <FeatureBlock
                icon={<Layers size={28} />}
                title="Copy Trend Monitoring"
                desc="Identify hotspots and regions where your brand is being targeted the most."
                color="green"
              />
              <FeatureBlock
                icon={<CheckCircle size={28} />}
                title="Enforcement Success Rate"
                desc="Track the effectiveness of notices across different platforms and hosts."
                color="green"
              />
              <FeatureBlock
                icon={<FileText size={28} />}
                title="Exportable Legal Reports"
                desc="Generate comprehensive PDF reports for internal audits or legal counsel."
                color="green"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Security & Compliance */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="px-6 max-w-[1600px] mx-auto text-center">
          <div className="inline-block p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
            <ShieldCheck className="text-brand-forest dark:text-brand-gold" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-10">Security & Compliance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <SecurityCard icon={<Lock className="text-green-500" />} title="End-to-End Encryption" desc="All data encrypted at rest and in transit." />
            <SecurityCard icon={<CheckCircle className="text-green-500" />} title="GDPR Compliance" desc="Full adherence to EU data protection standards." />
            <SecurityCard icon={<FileText className="text-green-500" />} title="Full Audit Trail" desc="Immutable logs of every user and system action." />
            <SecurityCard icon={<Eye className="text-green-500" />} title="Abuse Monitoring" desc="Systems to prevent misuse of enforcement tools." />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-forest dark:bg-brand-dark-footer text-center px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Equip Your Brand With The Best</h2>
          <p className="text-lg text-brand-cream/80 mb-10 max-w-2xl mx-auto">
            Get the power of enterprise-grade protection technology for your business today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link to="/register" className="btn-gradient px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Get Started
            </Link>
          </div>
          <p className="text-sm text-white/50">Full feature access available in free trial.</p>
        </div>
      </section>

    </div>
  )
}

function FeatureBlock({ icon, title, desc, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 flex gap-5">
      <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function SecurityCard({ icon, title, desc }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h4 className="font-bold text-brand-navy dark:text-white">{title}</h4>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 ml-9">{desc}</p>
    </div>
  )
}
