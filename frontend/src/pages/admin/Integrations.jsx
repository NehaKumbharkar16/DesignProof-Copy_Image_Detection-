import React, { useState } from 'react'
import { Zap, Server, Globe, CreditCard, ShoppingBag, Terminal, ExternalLink, Activity, Info } from 'lucide-react'

export default function AdminIntegrations() {
    const [integrations, setIntegrations] = useState([
        { id: 'shopify', name: 'Shopify API', active: true, desc: 'Auto-submit IP complaints via Partner API', icon: <ShoppingBag /> },
        { id: 'aws', name: 'Hosting Providers', active: true, desc: 'Escalation notices to major hosting providers (AWS, GCP, Azure)', icon: <Server /> },
        { id: 'stripe', name: 'Payment Gateways', active: false, desc: 'Stripe, PayPal infringement notices', icon: <CreditCard /> },
        { id: 'google', name: 'Google Transparency Report', active: true, desc: 'Lumen Database integration', icon: <Globe /> },
    ])

    const toggle = (id) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i))
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Terminal className="text-brand-gold" />
                    Platform Integrations
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Manage external connections and automated escalation channels.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${item.active ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-slate-100 text-slate-400'}`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                                <div
                                    onClick={() => toggle(item.id)}
                                    className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-brand-navy' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{item.desc}</p>

                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                                <span className="flex items-center gap-1 group cursor-pointer hover:text-brand-navy">
                                    <Activity size={14} /> View Logs
                                </span>
                                <span className="flex items-center gap-1 group cursor-pointer hover:text-brand-navy">
                                    <ExternalLink size={14} /> Configure API Keys
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex gap-4">
                <Info className="text-amber-600 shrink-0" />
                <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Legal Control</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300/80">
                        Disabling these integrations will stop automated legal escalations. Manual downloads will still be available.
                        Changes here affect ALL clients globally.
                    </p>
                </div>
            </div>

        </div>
    )
}
