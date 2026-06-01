import React from 'react'
import { Link } from 'react-router-dom'
import { Lock, Shield, CheckCircle, ExternalLink, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-dark-footer text-slate-300 pt-16 pb-8 border-t border-white/5 transition-colors duration-300 md:pl-64">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">

          {/* Brand Column (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="text-3xl font-bold text-white mb-2">DesignProof</div>
              <p className="text-brand-accent-gold font-medium text-lg">AI-Powered Brand Protection SaaS</p>
              <p className="text-base text-slate-400 mt-1">Detect. Approve. Enforce.</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>© {new Date().getFullYear()} DesignProof, Inc.</span>
              <span>All rights reserved.</span>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Lock size={16} className="text-brand-accent-gold" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield size={16} className="text-brand-accent-gold" />
                <span>No auto takedowns without approval</span>
              </div>
              <div className="text-xs text-slate-600 uppercase tracking-wider">
                We are not a law firm
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold text-lg mb-6">Platform</h4>
            <ul className="space-y-3 text-base">
              <li><Link to="/features" className="hover:text-brand-accent-gold transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-brand-accent-gold transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-accent-gold transition-colors">Pricing</Link></li>
              <li><a href="#" className="hover:text-brand-accent-gold transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-brand-accent-gold transition-colors">API Access</a></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold text-lg mb-6">Legal</h4>
            <ul className="space-y-3 text-base">
              <li><Link to="/terms" className="hover:text-brand-accent-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-accent-gold transition-colors">Privacy Policy</Link></li>
              <li><a href="#" className="hover:text-brand-accent-gold transition-colors">Acceptable Use Policy</a></li>
              <li><a href="#" className="hover:text-brand-accent-gold transition-colors">IP Enforcement Authorization</a></li>
              <li><a href="#" className="hover:text-brand-accent-gold transition-colors">Data Processing Agreement</a></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold text-lg mb-6">Security</h4>
            <ul className="space-y-3 text-base">
              <li><span className="flex items-center gap-2"><CheckCircle size={18} className="text-brand-accent-gold" /> End-to-End Encryption</span></li>
              <li><span className="flex items-center gap-2"><CheckCircle size={18} className="text-brand-accent-gold" /> GDPR Compliant</span></li>
              <li><span className="flex items-center gap-2"><CheckCircle size={18} className="text-brand-accent-gold" /> Human-Approved Enforcement</span></li>
              <li><span className="flex items-center gap-2"><CheckCircle size={18} className="text-brand-accent-gold" /> Full Audit Trail Logging</span></li>
              <li><span className="flex items-center gap-2"><CheckCircle size={18} className="text-brand-accent-gold" /> Secure Cloud Infrastructure</span></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-base">
              <li className="flex items-center gap-2"><Mail size={18} className="text-brand-accent-gold" /> <a href="mailto:support@designproof.ai" className="hover:text-brand-accent-gold transition-colors">support@designproof.ai</a></li>
              <li className="flex items-center gap-2"><Mail size={18} className="text-brand-accent-gold" /> <a href="mailto:legal@designproof.ai" className="hover:text-brand-accent-gold transition-colors">legal@designproof.ai</a></li>
              <li className="pt-2"><Link to="/contact" className="hover:text-brand-accent-gold transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-brand-accent-gold transition-colors">Help Center</a></li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> <a href="#" className="hover:text-brand-accent-gold transition-colors">Status Page</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span>Trusted by global brands for safe, compliant design protection.</span>
          </div>
          <div className="flex gap-4">
            {/* Social icons or other small elements can go here if needed, keeping it clean for now as requested */}
          </div>
        </div>
      </div>
    </footer>
  )
}
