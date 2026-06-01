import React from 'react'
import { FileText, Download, TrendingUp, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import toast, { Toaster } from 'react-hot-toast'

const data = [
    { name: 'Jan', revenue: 4000, takedowns: 24 },
    { name: 'Feb', revenue: 3000, takedowns: 13 },
    { name: 'Mar', revenue: 2000, takedowns: 98 },
    { name: 'Apr', revenue: 2780, takedowns: 39 },
    { name: 'May', revenue: 1890, takedowns: 48 },
    { name: 'Jun', revenue: 2390, takedowns: 38 },
    { name: 'Jul', revenue: 3490, takedowns: 43 },
]

const reportsList = [
    {
        id: 'RPT-2026-05',
        title: 'Monthly Enforcement Audit - May 2026',
        date: 'May 25, 2026',
        size: '1.8 MB',
        infringements: 24,
        resolved: 85,
        type: 'Monthly',
        successRate: '95.8%'
    },
    {
        id: 'RPT-2026-04',
        title: 'Monthly Enforcement Audit - Apr 2026',
        date: 'Apr 30, 2026',
        size: '2.1 MB',
        infringements: 18,
        resolved: 78,
        type: 'Monthly',
        successRate: '92.4%'
    },
    {
        id: 'RPT-2026-03',
        title: 'Monthly Enforcement Audit - Mar 2026',
        date: 'Mar 31, 2026',
        size: '1.6 MB',
        infringements: 15,
        resolved: 90,
        type: 'Monthly',
        successRate: '94.0%'
    }
]

export default function Reports() {
    const handleDownloadReport = (rpt) => {
        toast.loading(`Generating PDF Report for ${rpt.title}...`, { id: 'report-toast' });
        
        setTimeout(() => {
            const reportWindow = window.open('', '_blank');
            if (!reportWindow) {
                toast.error('Pop-up blocked! Please allow pop-ups to download the report.', { id: 'report-toast' });
                return;
            }
            
            reportWindow.document.write(`
                <html>
                  <head>
                    <title>DesignProof_Report_${rpt.id}</title>
                    <style>
                      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; background-color: #fafafa; }
                      .report-container { max-width: 850px; margin: 0 auto; background: #ffffff; padding: 50px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 25px; margin-bottom: 30px; }
                      .logo { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
                      .logo span { color: #d97706; }
                      .title { font-size: 14px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 2px; }
                      
                      .info-grid { display: grid; grid-template-cols: 1.5fr 1fr; gap: 40px; margin-bottom: 40px; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; }
                      .info-item h4 { margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
                      .info-item h3 { margin: 0; font-size: 18px; color: #0f172a; font-weight: 800; }
                      .info-item p { margin: 5px 0 0 0; font-size: 13px; color: #475569; }
                      
                      .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 15px; margin-bottom: 40px; }
                      .stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
                      .stat-card p { margin: 0; font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
                      .stat-card h2 { margin: 8px 0 0 0; font-size: 24px; font-weight: 900; color: #0f172a; }
                      .stat-card.accent h2 { color: #d97706; }
                      
                      .section-title { font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; letter-spacing: 1px; }
                      
                      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                      th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
                      td { padding: 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
                      
                      .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
                      .badge.exact { color: #ef4444; background: #fee2e2; }
                      .badge.similar { color: #d97706; background: #fef3c7; }
                      .badge.resolved { color: #16a34a; background: #dcfce7; }
                      
                      .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
                      
                      @media print {
                        body { background-color: #ffffff; padding: 0; }
                        .report-container { box-shadow: none; border: none; padding: 0; }
                        button { display: none; }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="report-container">
                      <div class="header">
                        <div class="logo">Design<span>Proof</span></div>
                        <div class="title">Security & IP Protection Audit</div>
                      </div>
                      
                      <div class="info-grid">
                        <div class="info-item">
                          <h4>Report Scope & Title</h4>
                          <h3>${rpt.title}</h3>
                          <p>Comprehensive monitoring covering Global Web Discovery, Crawling engines, Shopify matching modules, and Social Media protection networks.</p>
                        </div>
                        <div class="info-item" style="text-align: right;">
                          <h4>Audit Meta</h4>
                          <p><strong>Report Reference:</strong> ${rpt.id}</p>
                          <p><strong>Release Date:</strong> ${rpt.date}</p>
                          <p><strong>Protection Tier:</strong> Enterprise Active</p>
                        </div>
                      </div>
                      
                      <div class="stats-grid">
                        <div class="stat-card">
                          <p>Total Infringements</p>
                          <h2>${rpt.infringements}</h2>
                        </div>
                        <div class="stat-card accent">
                          <p>Resolved / Removed</p>
                          <h2>${rpt.resolved}%</h2>
                        </div>
                        <div class="stat-card">
                          <p>Success Rate</p>
                          <h2 style="color: #16a34a;">${rpt.successRate}</h2>
                        </div>
                        <div class="stat-card">
                          <p>File Integrity</p>
                          <h2 style="color: #4f46e5;">SECURE</h2>
                        </div>
                      </div>
                      
                      <div class="section-title">Infringement Logs Summary</div>
                      <table>
                        <thead>
                          <tr>
                            <th>Detected Domain</th>
                            <th>Risk Class</th>
                            <th>Match Confidence</th>
                            <th>Resolution Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>shop-copycat.com</strong></td>
                            <td>High Risk (100% clone)</td>
                            <td><span class="badge exact">Direct Copy</span></td>
                            <td><span class="badge resolved">Takedown Completed</span></td>
                          </tr>
                          <tr>
                            <td><strong>similar-outfitters.in</strong></td>
                            <td>Medium Risk (94% Match)</td>
                            <td><span class="badge similar">Similar Design</span></td>
                            <td><span class="badge resolved">Listing Removed</span></td>
                          </tr>
                          <tr>
                            <td><strong>replicated-retail.org</strong></td>
                            <td>High Risk (100% clone)</td>
                            <td><span class="badge exact">Direct Copy</span></td>
                            <td><span class="badge resolved">Takedown Dispatched</span></td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div class="footer">
                        Safeguarding brand assets globally. Underpinned by DesignProof Automated Verification. &copy; 2026 DesignProof.
                      </div>
                    </div>
                    
                    <script>
                      window.onload = function() {
                        window.print();
                      }
                    </script>
                  </body>
                </html>
            `);
            reportWindow.document.close();
            toast.success('PDF Enforcement Report prepared successfully!', { id: 'report-toast' });
        }, 1500);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <FileText className="text-brand-gold" />
                        Reporting & Insights
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track the impact of your brand protection efforts.</p>
                </div>
                <button onClick={() => handleDownloadReport(reportsList[0])} className="btn-outline flex items-center gap-2" title="Export PDF Report">
                    <Download size={18} /> Export PDF Report
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenue Protected"
                    value="$124,500"
                    desc="Estimated based on removed listings"
                    icon={<TrendingUp className="text-green-500" />}
                    trend="+12%"
                />
                <StatCard
                    title="Takedowns Completed"
                    value="486"
                    desc="Listings successfully removed"
                    icon={<CheckCircle className="text-blue-500" />}
                    trend="+54"
                />
                <StatCard
                    title="Success Rate"
                    value="94.2%"
                    desc="Takedowns vs Notices Sent"
                    icon={<AlertCircle className="text-brand-gold" />}
                    trend="+1.2%"
                />
                <StatCard
                    title="Total Copies Detected"
                    value="1,204"
                    desc="Across all monitored channels"
                    icon={<XCircle className="text-red-500" />}
                    trend="-8%"
                />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">

                {/* Impact Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Takedown Impact Over Time</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTakedowns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Est. Revenue ($)" />
                                <Area type="monotone" dataKey="takedowns" stroke="#82ca9d" fillOpacity={1} fill="url(#colorTakedowns)" name="Takedowns" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown by Platform */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Infringements by Platform</h3>
                        <select className="text-sm border-none bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                            <option>Last 30 Days</option>
                            <option>All Time</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <PlatformBar name="Shopify Stores" count={124} total={480} color="bg-green-500" />
                        <PlatformBar name="AliExpress" count={89} total={480} color="bg-orange-500" />
                        <PlatformBar name="Etsy" count={65} total={480} color="bg-orange-600" />
                        <PlatformBar name="Amazon" count={42} total={480} color="bg-slate-800" />
                        <PlatformBar name="Social Media" count={150} total={480} color="bg-blue-500" />
                    </div>
                </div>

            </div>

            {/* Generated Reports List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <h3 className="font-bold text-slate-800 dark:text-white">Recent Reports</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reportsList.map((rpt, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-350">{rpt.title}</div>
                                    <div className="text-xs text-slate-500">Generated on {rpt.date} • PDF • {rpt.size}</div>
                                </div>
                            </div>
                            <button onClick={() => handleDownloadReport(rpt)} className="text-brand-forest hover:text-brand-gold p-2" title="Download PDF Report">
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

function StatCard({ title, value, desc, icon, trend }) {
    const isPositive = trend.includes('+')
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-500">{title}</div>
            <div className="text-xs text-slate-600 mt-2">{desc}</div>
        </div>
    )
}

function PlatformBar({ name, count, total, color }) {
    const width = (count / total) * 100
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                <span className="font-bold">{count}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${width}%` }}></div>
            </div>
        </div>
    )
}
