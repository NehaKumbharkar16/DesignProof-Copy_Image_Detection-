import React, { useState } from 'react'
import { Radio, Search, Shield, Globe, ShoppingBag, Instagram, Zap, Clock, CheckCircle } from 'lucide-react'

export default function Monitoring() {
    const [scanType, setScanType] = useState('continuous')
    const [frequency, setFrequency] = useState('daily')

    const sources = [
        { id: 1, name: 'D2C Websites', icon: <Globe size={24} />, active: true, desc: 'Scans independent brand stores & domains' },
        { id: 2, name: 'Shopify Stores', icon: <ShoppingBag size={24} />, active: true, desc: 'Deep scan of Shopify-powered storefronts' },
        { id: 3, name: 'Marketplaces', icon: <ShoppingBag size={24} />, active: true, desc: 'Amazon, eBay, Etsy, AliExpress' },
        { id: 4, name: 'Google Images', icon: <Search size={24} />, active: true, desc: 'Reverse image search across the web' },
        { id: 5, name: 'Social Media', icon: <Instagram size={24} />, active: false, desc: 'Instagram & Facebook Ad Library (Beta)' },
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Radio className="text-brand-gold" />
                    Monitoring & Detection
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Configure how and where our AI scans for your intellectual property.</p>
            </div>

            {/* 1. Monitoring Configuration */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Scan Frequency Card */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" />
                        Scan Frequency
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setScanType('continuous')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${scanType === 'continuous' ? 'border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-800 dark:text-white">Continuous Monitoring</span>
                                {scanType === 'continuous' && <CheckCircle size={20} className="text-brand-gold" />}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Automated scanning of all selected sources. Best for active brand protection.
                            </p>
                            <div className="flex gap-2">
                                <span
                                    onClick={(e) => { e.stopPropagation(); setFrequency('daily') }}
                                    className={`text-xs px-2 py-1 rounded-md border cursor-pointer ${frequency === 'daily' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200'}`}
                                >
                                    Daily
                                </span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); setFrequency('weekly') }}
                                    className={`text-xs px-2 py-1 rounded-md border cursor-pointer ${frequency === 'weekly' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200'}`}
                                >
                                    Weekly
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => setScanType('onetime')}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${scanType === 'onetime' ? 'border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-800 dark:text-white">One-Time Scan</span>
                                {scanType === 'onetime' && <CheckCircle size={20} className="text-brand-gold" />}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Run a deep scan right now. Useful after a new product launch.
                            </p>
                            <div className="mt-4">
                                <span className="text-xs font-bold text-slate-400 uppercase">Credits: 1 Scan = 5 Credits</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Protection Score / Status */}
                <div className="bg-gradient-to-br from-brand-navy to-brand-forest rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <h3 className="font-semibold text-lg mb-1 relative z-10">Active Protection</h3>
                    <div className="text-4xl font-bold mb-4 relative z-10">98.5%</div>
                    <p className="text-sm opacity-80 mb-6 relative z-10">Your designs are being monitored across 150+ marketplaces and platforms.</p>

                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-sm font-semibold border border-white/20">
                        View Audit Log
                    </button>
                </div>
            </div>

            {/* 2. Sources Scanned */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Monitored Sources</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {sources.map(source => (
                        <div key={source.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${source.active ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800 opacity-60'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${source.active ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-400'}`}>
                                    {source.icon}
                                </div>
                                <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{source.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{source.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. AI Capabilities Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-brand-gold" />
                    AI Detection Capabilities
                </h3>
                <div className="grid sm:grid-cols-3 gap-6 text-sm">
                    <div className="flex gap-3">
                        <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block text-slate-700 dark:text-slate-300">Exact & Modified Copies</span>
                            <span className="text-slate-500 dark:text-slate-400">Detects pixel-perfect copies and minor color variations.</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block text-slate-700 dark:text-slate-300">Background Removal</span>
                            <span className="text-slate-500 dark:text-slate-400">Identifies designs even if the background or model is changed.</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block text-slate-700 dark:text-slate-300">Reseller Verification</span>
                            <span className="text-slate-500 dark:text-slate-400">Distinguishes between authorized resellers and infringers.</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
