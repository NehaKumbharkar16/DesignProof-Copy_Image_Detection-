import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Search, Shield, Globe, ShoppingBag, Instagram, Zap, Clock, CheckCircle, Loader2 } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

export default function Monitoring() {
    const navigate = useNavigate()
    const [scanType, setScanType] = useState('continuous')
    const [frequency, setFrequency] = useState('daily')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    const [monitoredSources, setMonitoredSources] = useState({
        monitor_d2c: true,
        monitor_shopify: true,
        monitor_marketplaces: true,
        monitor_google_images: true,
        monitor_social_media: false
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true)
                const res = await api.get('/api/monitoring')
                if (res.data && res.data.data) {
                    const data = res.data.data
                    setScanType(data.scan_type || 'continuous')
                    setFrequency(data.scan_frequency || 'daily')
                    setMonitoredSources({
                        monitor_d2c: data.monitor_d2c ?? true,
                        monitor_shopify: data.monitor_shopify ?? true,
                        monitor_marketplaces: data.monitor_marketplaces ?? true,
                        monitor_google_images: data.monitor_google_images ?? true,
                        monitor_social_media: data.monitor_social_media ?? false
                    })
                }
            } catch (err) {
                console.error("Error fetching monitoring settings:", err)
                toast.error("Failed to load monitoring settings.")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const saveSettings = async (updates) => {
        try {
            setSaving(true)
            const payload = {
                scan_type: updates.scanType !== undefined ? updates.scanType : scanType,
                scan_frequency: updates.frequency !== undefined ? updates.frequency : frequency,
                monitor_d2c: updates.monitoredSources ? updates.monitoredSources.monitor_d2c : monitoredSources.monitor_d2c,
                monitor_shopify: updates.monitoredSources ? updates.monitoredSources.monitor_shopify : monitoredSources.monitor_shopify,
                monitor_marketplaces: updates.monitoredSources ? updates.monitoredSources.monitor_marketplaces : monitoredSources.monitor_marketplaces,
                monitor_google_images: updates.monitoredSources ? updates.monitoredSources.monitor_google_images : monitoredSources.monitor_google_images,
                monitor_social_media: updates.monitoredSources ? updates.monitoredSources.monitor_social_media : monitoredSources.monitor_social_media
            }
            await api.put('/api/monitoring', payload)
        } catch (err) {
            console.error("Error saving monitoring settings:", err)
            toast.error("Failed to save monitoring settings.")
        } finally {
            setSaving(false)
        }
    }

    const handleScanTypeChange = (type) => {
        setScanType(type)
        saveSettings({ scanType: type })
    }

    const handleFrequencyChange = (freq) => {
        setFrequency(freq)
        saveSettings({ frequency: freq })
    }

    const handleToggleSource = (key) => {
        const nextSources = {
            ...monitoredSources,
            [key]: !monitoredSources[key]
        }
        setMonitoredSources(nextSources)
        saveSettings({ monitoredSources: nextSources })
    }

    const handleOneTimeScan = async () => {
        try {
            setScanType('onetime')
            await saveSettings({ scanType: 'onetime' })
            toast.loading("Initiating deep scan...", { id: "scan-toast" })
            
            const res = await api.post('/api/monitoring/scan')
            if (res.data) {
                toast.success("Deep scan initiated! Checking all selected channels.", { id: "scan-toast" })
            }
        } catch (err) {
            console.error("Scan error:", err)
            toast.error("Failed to initiate deep scan.", { id: "scan-toast" })
        }
    }

    const sources = [
        { key: 'monitor_d2c', name: 'D2C Websites', icon: <Globe size={24} />, active: monitoredSources.monitor_d2c, desc: 'Scans independent brand stores & domains' },
        { key: 'monitor_shopify', name: 'Shopify Stores', icon: <ShoppingBag size={24} />, active: monitoredSources.monitor_shopify, desc: 'Deep scan of Shopify-powered storefronts' },
        { key: 'monitor_marketplaces', name: 'Marketplaces', icon: <ShoppingBag size={24} />, active: monitoredSources.monitor_marketplaces, desc: 'Amazon, eBay, Etsy, AliExpress' },
        { key: 'monitor_google_images', name: 'Google Images', icon: <Search size={24} />, active: monitoredSources.monitor_google_images, desc: 'Reverse image search across the web' },
        { key: 'monitor_social_media', name: 'Social Media', icon: <Instagram size={24} />, active: monitoredSources.monitor_social_media, desc: 'Instagram & Facebook Ad Library (Beta)' },
    ]

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase animate-pulse">Loading monitoring configuration...</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Radio className="text-brand-gold" />
                    Monitoring & Detection
                    {saving && (
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                            Auto-Saving...
                        </span>
                    )}
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
                            onClick={() => handleScanTypeChange('continuous')}
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
                                    onClick={(e) => { e.stopPropagation(); handleFrequencyChange('daily') }}
                                    className={`text-xs px-2 py-1 rounded-md border cursor-pointer transition-colors ${frequency === 'daily' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    Daily
                                </span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleFrequencyChange('weekly') }}
                                    className={`text-xs px-2 py-1 rounded-md border cursor-pointer transition-colors ${frequency === 'weekly' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    Weekly
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={handleOneTimeScan}
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

                    <button 
                        onClick={() => navigate('/history')}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-sm font-semibold border border-white/20"
                    >
                        View Audit Log
                    </button>
                </div>
            </div>

            {/* 2. Sources Scanned */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Monitored Sources</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {sources.map(source => (
                        <div 
                            key={source.key} 
                            onClick={() => handleToggleSource(source.key)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-sm ${source.active ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg transition-colors ${source.active ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-400'}`}>
                                    {source.icon}
                                </div>
                                <div className={`w-3 h-3 rounded-full transition-all ${source.active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
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
