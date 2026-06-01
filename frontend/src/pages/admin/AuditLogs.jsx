import React from 'react'
import { FileText, Shield, User, Clock, Check } from 'lucide-react'

const logs = [
    { id: 1, user: 'John Doe (Brand Admin)', action: 'Approved Takedown', target: 'shop-copycat.com/product/1', time: '2 mins ago', ip: '192.168.1.1' },
    { id: 2, user: 'Admin System', action: 'Sent Legal Notice', target: 'legal@shop-copycat.com', time: '2 mins ago', ip: 'System' },
    { id: 3, user: 'Sarah Smith', action: 'Ignored Match', target: 'pinterest.com/pin/12345', time: '15 mins ago', ip: '192.168.1.4' },
    { id: 4, user: 'Michael Brown', action: 'Uploaded Design', target: 'Summer Collection 2024', time: '1 hour ago', ip: '192.168.1.12' },
    { id: 5, user: 'Admin User', action: 'Updated Subscription', target: 'Scale Plan', time: '3 hours ago', ip: '10.0.0.5' },
]

export default function AuditLogs() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Shield className="text-brand-gold" />
                    Audit Logs
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Immutable record of all enforcement actions and system changes.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">User / Actor</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Action Performed</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Target / Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Proof</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 dark:text-slate-300">{log.user}</div>
                                                <div className="text-xs text-slate-400">{log.ip}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${log.action.includes('Takedown') ? 'bg-red-100 text-red-600' :
                                                log.action.includes('Ignored') ? 'bg-slate-100 text-slate-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {log.action}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">{log.target}</td>
                                    <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                                        <Clock size={14} /> {log.time}
                                    </td>
                                    <td>
                                        <button className="text-brand-navy hover:text-brand-gold font-medium text-xs flex items-center gap-1">
                                            <FileText size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
