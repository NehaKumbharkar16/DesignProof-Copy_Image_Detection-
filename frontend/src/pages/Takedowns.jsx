import React, { useState } from 'react'
import { FileText, Clock, CheckCircle, AlertOctagon, ExternalLink, Mail, ArrowRight } from 'lucide-react'

// Mock Takedown Data
const takedowns = [
  {
    id: 1,
    brand: 'Example Brand',
    infringer: 'shop-copy.com',
    url: 'https://shop-copy.com/products/fake',
    status: 'pending', // pending, removed, escalated, ignored
    sentDate: '2023-10-20',
    lastCheck: '2 hours ago',
    platform: 'Shopify'
  },
  {
    id: 2,
    brand: 'Example Brand',
    infringer: 'ebay.com/usr/thief123',
    url: 'https://ebay.com/itm/12345',
    status: 'removed',
    sentDate: '2023-10-18',
    lastCheck: '1 hour ago',
    platform: 'eBay'
  },
  {
    id: 3,
    brand: 'Example Brand',
    infringer: 'bad-site.net',
    url: 'https://bad-site.net/item/1',
    status: 'escalated',
    sentDate: '2023-10-15',
    lastCheck: 'Yesterday',
    platform: 'Custom Domain'
  }
]

export default function Takedowns() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? takedowns : takedowns.filter(t => t.status === activeTab)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FileText className="text-brand-gold" />
          Enforcement & Compliance
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Track the status of legal notices and automated takedowns.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        {['all', 'pending', 'removed', 'escalated'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === tab
                ? 'border-brand-navy text-brand-navy dark:text-brand-gold dark:border-brand-gold bg-slate-50 dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">

            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-full shrink-0 ${t.status === 'removed' ? 'bg-green-100 text-green-600' :
                  t.status === 'escalated' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                }`}>
                {t.status === 'removed' ? <CheckCircle size={20} /> :
                  t.status === 'escalated' ? <AlertOctagon size={20} /> :
                    <Clock size={20} />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">{t.infringer}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{t.platform}</span>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-1">
                  <a href={t.url} target="_blank" rel="noreferrer" className="hover:text-brand-navy flex items-center gap-1">
                    {t.url.substring(0, 40)}... <ExternalLink size={12} />
                  </a>
                </div>
                <div className="text-xs text-slate-600">
                  Notice Sent: {t.sentDate} • Last Check: {t.lastCheck}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">

              {t.status === 'pending' && (
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                    <Mail size={16} /> Resend Notice
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors">
                    Escalate <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {t.status === 'removed' && (
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <CheckCircle size={16} /> Verified Removed
                </div>
              )}

              {t.status === 'escalated' && (
                <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <AlertOctagon size={16} /> Escalation Active
                </div>
              )}

            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
