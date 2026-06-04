import React, { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle, XCircle, Slash, ExternalLink, Search, Filter, AlertTriangle, Trash2 } from 'lucide-react'
import api from '../services/api'

const parseUrlSafely = (urlStr) => {
    try {
        if (!urlStr) {
            return { hostname: 'unknown-platform.com', href: '#' };
        }
        let cleanUrl = urlStr.trim();
        if (!/^https?:\/\//i.test(cleanUrl)) {
            cleanUrl = 'https://' + cleanUrl;
        }
        const parsed = new URL(cleanUrl);
        return {
            hostname: parsed.hostname || 'unknown-platform.com',
            href: parsed.href
        };
    } catch (e) {
        return { hostname: 'unknown-platform.com', href: urlStr || '#' };
    }
};

export default function Matches() {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                setLoading(true)
                const res = await api.get('/api/detections')
                // Direct mapping from backend keys to frontend keys
                const mappedData = res.data.data.map(item => {
                    const parsedUrl = parseUrlSafely(item.website);
                    return {
                        id: item.id,
                        productName: item.productName || 'Unknown Product',
                        similarity: item.similarity,
                        platform: parsedUrl.hostname.replace('www.', ''),
                        domain: parsedUrl.hostname,
                        url: parsedUrl.href,
                        status: item.status === 'pending_review' ? 'pending' : item.status,
                        originalImage: item.productImage || 'https://via.placeholder.com/300?text=Scan+Image',
                        infringingImage: item.image,
                        dateFound: item.dateFound,
                        confidence: item.similarity > 95 ? 'Direct Copy' : 'Modified Copy'
                    };
                })
                setMatches(mappedData)
            } catch (err) {
                console.error("Failed to fetch matches", err)
            } finally {
                setLoading(false)
            }
        }
        fetchMatches()
    }, [])

    const handleAction = async (id, action) => {
        try {
            await api.put(`/api/detections/${id}`, { status: action })
            setMatches(prev => prev.map(m => m.id === id ? { ...m, status: action } : m))
        } catch (err) {
            console.error("Failed to update status in DB:", err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this match?")) return;
        try {
            await api.delete(`/api/detections/${id}`)
            setMatches(prev => prev.filter(m => m.id !== id))
        } catch (err) {
            console.error("Failed to delete match in DB:", err)
        }
    }

    const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter)

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        Review & Approval
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Review suspected infringements found by our AI.</p>
                </div>

                <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    {['pending', 'approved', 'ignored', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Pending Review</div>
                    <div className="text-2xl font-bold text-orange-500">{matches.filter(m => m.status === 'pending').length}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Avg. Similarity</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">88%</div>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Match List */}
            <div className="space-y-10 pb-20">
                {filteredMatches.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                        <h3 className="text-lg font-bold">All Caught Up!</h3>
                        <p>No matches found with this filter status.</p>
                    </div>
                ) : (
                    <>
                        {/* Section 1: Exact Duplicates */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Exact Duplicates (100%)</h3>
                            </div>
                            {filteredMatches.filter(m => m.similarity >= 99).length === 0 ? (
                                <p className="text-xs text-slate-500 italic pl-5">No exact matches found.</p>
                            ) : (
                                filteredMatches.filter(m => m.similarity >= 99).map(match => (
                                    <MatchCard key={match.id} match={match} onAction={handleAction} onDelete={handleDelete} />
                                ))
                            )}
                        </div>

                        {/* Section 2: Similar Matches */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Similar Designs</h3>
                            </div>
                            {filteredMatches.filter(m => m.similarity < 99).length === 0 ? (
                                <p className="text-xs text-slate-500 italic pl-5">No similar matches found.</p>
                            ) : (
                                filteredMatches.filter(m => m.similarity < 99).map(match => (
                                    <MatchCard key={match.id} match={match} onAction={handleAction} onDelete={handleDelete} />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    )
}

function MatchCard({ match, onAction, onDelete }) {
    const isPending = match.status === 'pending'

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

            {/* Header Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${match.confidence === 'Direct Copy' ? 'bg-red-100 text-red-600 border border-red-200' :
                            match.confidence === 'Modified Copy' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                'bg-blue-100 text-blue-600 border border-blue-200'
                        }`}>
                        {match.confidence}
                    </span>
                    <span className="text-slate-600">Found on <span className="font-bold text-slate-700 dark:text-slate-300">{match.platform}</span></span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-600">{match.dateFound}</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href={match.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-gold hover:underline">
                        View Source <ExternalLink size={14} />
                    </a>
                    <button 
                        onClick={() => onDelete(match.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95"
                        title="Delete Match"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="p-6 grid lg:grid-cols-12 gap-6">

                {/* Images: Side by Side */}
                <div className="lg:col-span-8 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 uppercase text-center">Your Original</div>
                        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                            <img src={match.originalImage} alt="Original" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="space-y-2 relative">
                        <div className="text-xs font-bold text-slate-700 uppercase text-center">Detected Match</div>
                        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group ring-2 ring-red-500/20">
                            <img src={match.infringingImage} alt="Infringing" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                {match.similarity}% Match
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Actions */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{match.productName}</h3>
                        <p className="text-sm text-slate-500 mb-4">{match.domain}</p>

                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={`font-bold capitalize ${match.status === 'pending' ? 'text-orange-500' :
                                        match.status === 'approved' ? 'text-green-500' :
                                            'text-slate-500'
                                    }`}>{match.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Similarity:</span>
                                <span className="font-bold">{match.similarity}%</span>
                            </div>
                        </div>
                    </div>

                    {isPending && (
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => onAction(match.id, 'approved')}
                                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all">
                                <AlertTriangle size={18} /> Approve Takedown
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onAction(match.id, 'ignored')}
                                    className="py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    Ignore
                                </button>
                                <button
                                    onClick={() => onAction(match.id, 'authorized')}
                                    className="py-2 border border-brand-gold text-brand-gold rounded-lg font-bold hover:bg-brand-gold/10 transition-all">
                                    Authorize
                                </button>
                            </div>
                        </div>
                    )}

                    {!isPending && (
                        <div className="pt-4 text-center">
                            <button onClick={() => onAction(match.id, 'pending')} className="text-sm text-slate-400 underline hover:text-brand-navy">Undo Action</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
