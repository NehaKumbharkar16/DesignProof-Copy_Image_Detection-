import React, { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, AlertOctagon, ExternalLink, Mail, ArrowRight, Trash2, Loader2, Check, ShieldAlert, Send, X, Edit, CheckCircle2, Eye, Image as ImageIcon } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

// Helper to parse domain safely from a URL
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

const getPlatformName = (urlStr) => {
  const host = parseUrlSafely(urlStr).hostname.toLowerCase();
  if (host.includes('ebay.com')) return 'eBay';
  if (host.includes('amazon.com')) return 'Amazon';
  if (host.includes('etsy.com')) return 'Etsy';
  if (host.includes('aliexpress.com')) return 'AliExpress';
  if (host.includes('shopify.com')) return 'Shopify';
  return 'Web Store';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export default function Takedowns() {
  const [activeTab, setActiveTab] = useState('all')
  const [notices, setNotices] = useState([])
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Inline notice composer state
  const [composingForId, setComposingForId] = useState(null)
  const [composeEmail, setComposeEmail] = useState('')
  const [composeContent, setComposeContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [noticesRes, detectionsRes] = await Promise.all([
        api.get('/api/notices'),
        api.get('/api/detections')
      ])
      if (noticesRes.data && noticesRes.data.data) {
        setNotices(noticesRes.data.data)
      }
      if (detectionsRes.data && detectionsRes.data.data) {
        setDetections(detectionsRes.data.data)
      }
    } catch (err) {
      console.error("Error fetching takedown data:", err)
      toast.error("Failed to fetch enforcement data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // --- Notice actions (existing) ---
  const handleResend = async (id) => {
    setActionLoadingId(id)
    const toastId = toast.loading("Resending legal notice email...")
    try {
      await api.post(`/api/notices/${id}/resend`)
      toast.success("Legal notice email resent successfully!", { id: toastId })
      await fetchAll()
    } catch (err) {
      console.error("Resend notice error:", err)
      toast.error("Failed to resend notice email: " + (err.response?.data?.message || err.message), { id: toastId })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    const actionLabel = status === 'escalated' ? 'Escalating...' : 'Verifying removal...'
    const successLabel = status === 'escalated' ? 'Takedown escalated successfully.' : 'Takedown verified resolved.'
    const toastId = toast.loading(actionLabel)
    try {
      await api.put(`/api/notices/${id}`, { status })
      toast.success(successLabel, { id: toastId })
      setNotices(prev => prev.map(n => n.id === id ? { ...n, status } : n))
    } catch (err) {
      console.error("Status update error:", err)
      toast.error("Failed to update status: " + (err.response?.data?.message || err.message), { id: toastId })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice record? This will not undo any sent emails but will remove it from this dashboard.")) {
      return;
    }
    const toastId = toast.loading("Deleting record...")
    try {
      await api.delete(`/api/notices/${id}`)
      toast.success("Notice record deleted successfully.", { id: toastId })
      setNotices(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error("Delete notice error:", err)
      toast.error("Failed to delete notice: " + (err.response?.data?.message || err.message), { id: toastId })
    }
  }

  // --- Send takedown from detection ---
  const openComposer = (detection) => {
    const url = detection.website || detection.infringing_url || '';
    const domain = parseUrlSafely(url).hostname;
    setComposingForId(detection.id)
    setComposeEmail(detection.contact_email || detection.contactEmail || 'support@' + domain)
    setComposeContent(
`Dear Sir/Madam,

I hope this message finds you well.

I am writing to inform you that an image owned by me has been identified on your website without my permission. The image is my original work, and its usage on your platform appears to be unauthorized.

**Details of the issue:**

* Website URL: ${url}
* Original Image Owner: [Your Name / Company Name]
* Proof of Ownership: [Evidence Case ID: ${detection.id}]

I kindly request you to remove the image from your website at the earliest or provide proper authorization/credit if applicable.

Please treat this as an urgent matter related to intellectual property rights. I would appreciate your cooperation in resolving this issue promptly.

If the image is not removed within a reasonable timeframe, I may be required to take further action.

Thank you for your understanding and cooperation.

Sincerely,
[Your Full Name]
[Your Contact Information]
[Your Email Address]`
    )
  }

  const handleSendFromDetection = async (detection) => {
    setIsSending(true)
    const toastId = toast.loading("Sending takedown notice...")
    try {
      const url = detection.website || detection.infringing_url || '';
      const payload = {
        detected_match_id: detection.id,
        email: composeEmail,
        website_url: url,
        original_image_url: detection.productImage || detection.image || '',
        copied_image_url: detection.image || detection.infringing_image_url || '',
        content: composeContent
      }
      await api.post('/api/notices', payload)
      toast.success("Takedown notice sent successfully!", { id: toastId })
      setComposingForId(null)
      await fetchAll()
    } catch (err) {
      console.error("Send notice error:", err)
      toast.error("Failed to send notice: " + (err.response?.data?.message || err.message), { id: toastId })
    } finally {
      setIsSending(false)
    }
  }

  // --- Build unified list ---
  // Map notice websiteUrls for quick lookup
  const noticedUrls = new Set(notices.map(n => (n.websiteUrl || '').toLowerCase().trim()))

  // Detections that don't have a matching notice yet
  const pendingDetections = detections.filter(d => {
    const url = (d.website || d.infringing_url || '').toLowerCase().trim();
    return !noticedUrls.has(url);
  })

  // Filter logic
  const getFilteredNotices = () => {
    return notices.filter(t => {
      const st = (t.status || '').toLowerCase();
      if (activeTab === 'all') return true;
      if (activeTab === 'notices') {
        return st !== 'removed' && st !== 'escalated';
      }
      if (activeTab === 'escalated') return st === 'escalated';
      if (activeTab === 'resolved') return st === 'removed';
      return false; // 'detections' tab doesn't show notices
    })
  }

  const showDetections = activeTab === 'all' || activeTab === 'detections'
  const filteredNotices = activeTab === 'detections' ? [] : getFilteredNotices()
  const filteredDetections = showDetections ? pendingDetections : []

  // Counts for tabs
  const noticesSentCount = notices.filter(n => {
    const st = (n.status || '').toLowerCase();
    return st !== 'removed' && st !== 'escalated';
  }).length
  const escalatedCount = notices.filter(n => (n.status || '').toLowerCase() === 'escalated').length
  const resolvedCount = notices.filter(n => (n.status || '').toLowerCase() === 'removed').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <FileText className="text-brand-gold" />
            Enforcement & Compliance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track detected infringements, legal notices, and automated takedowns.</p>
        </div>
        <button 
          onClick={fetchAll}
          disabled={loading}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition-all disabled:opacity-50 dark:text-white"
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          label="Pending Detections" 
          value={pendingDetections.length} 
          color="text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400"
          icon={<ShieldAlert size={18} />}
          onClick={() => setActiveTab('detections')}
          active={activeTab === 'detections'}
        />
        <SummaryCard 
          label="Notices Sent" 
          value={noticesSentCount}
          color="text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400"
          icon={<Mail size={18} />}
          onClick={() => setActiveTab('notices')}
          active={activeTab === 'notices'}
        />
        <SummaryCard 
          label="Escalated" 
          value={escalatedCount}
          color="text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400"
          icon={<AlertOctagon size={18} />}
          onClick={() => setActiveTab('escalated')}
          active={activeTab === 'escalated'}
        />
        <SummaryCard 
          label="Resolved" 
          value={resolvedCount}
          color="text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400"
          icon={<CheckCircle size={18} />}
          onClick={() => setActiveTab('resolved')}
          active={activeTab === 'resolved'}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        {[
          { key: 'all', label: `All (${pendingDetections.length + notices.length})` },
          { key: 'detections', label: `Pending Detections (${pendingDetections.length})` },
          { key: 'notices', label: `Notices Sent (${noticesSentCount})` },
          { key: 'escalated', label: `Escalated (${escalatedCount})` },
          { key: 'resolved', label: `Resolved (${resolvedCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-brand-navy text-brand-navy dark:text-brand-gold dark:border-brand-gold bg-slate-50 dark:bg-slate-800/50 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-400 text-xs mt-4 font-semibold uppercase tracking-widest animate-pulse">Loading enforcement data...</p>
          </div>
        ) : (filteredDetections.length === 0 && filteredNotices.length === 0) ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-20 text-center shadow-sm">
            <FileText className="w-14 h-14 text-indigo-100 dark:text-slate-800 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">No Records Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">
              {activeTab === 'detections' 
                ? "No pending detections. All detected infringements have been actioned." 
                : activeTab === 'notices' 
                ? "No notices have been sent yet. Scan an image and send a takedown notice."
                : "No enforcement records found. Upload a design to scan for infringements."}
            </p>
          </div>
        ) : (
          <>
            {/* Pending Detections Section */}
            {filteredDetections.length > 0 && (
              <>
                <div className="flex items-center gap-3 mt-2">
                  <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                  <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    Pending Detections — Awaiting Takedown Action
                  </h3>
                </div>
                {filteredDetections.map(d => (
                  <DetectionCard 
                    key={`det-${d.id}`} 
                    detection={d} 
                    isComposing={composingForId === d.id}
                    composeEmail={composeEmail}
                    composeContent={composeContent}
                    isSending={isSending}
                    onOpenComposer={() => openComposer(d)}
                    onCloseComposer={() => setComposingForId(null)}
                    onEmailChange={setComposeEmail}
                    onContentChange={setComposeContent}
                    onSend={() => handleSendFromDetection(d)}
                  />
                ))}
              </>
            )}

            {/* Notices Section */}
            {filteredNotices.length > 0 && (
              <>
                {filteredDetections.length > 0 && (
                  <div className="flex items-center gap-3 mt-6">
                    <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                    <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      Sent Notices & Active Enforcement
                    </h3>
                  </div>
                )}
                {filteredNotices.map(t => (
                  <NoticeCard 
                    key={`notice-${t.id}`}
                    notice={t}
                    actionLoadingId={actionLoadingId}
                    onResend={handleResend}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// --- Summary Card ---
function SummaryCard({ label, value, color, icon, onClick, active }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.97] ${
        active 
          ? 'border-brand-forest dark:border-brand-gold ring-2 ring-brand-forest/20 dark:ring-brand-gold/20' 
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        <div className="text-xl font-extrabold text-slate-800 dark:text-white leading-none mt-0.5">{value}</div>
      </div>
    </div>
  )
}

// --- Detection Card (new) ---
function DetectionCard({ detection, isComposing, composeEmail, composeContent, isSending, onOpenComposer, onCloseComposer, onEmailChange, onContentChange, onSend }) {
  const url = detection.website || detection.infringing_url || '';
  const domain = parseUrlSafely(url).hostname;
  const infringerName = domain.replace('www.', '');
  const platform = getPlatformName(url);
  const similarity = Number(detection.similarity || detection.similarity_score || 0);
  const isExact = similarity >= 85;
  const dateStr = detection.dateFound || detection.createdAt || detection.created_at;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Main row */}
      <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Image preview */}
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50">
            {(detection.image || detection.productImage) ? (
              <img 
                src={detection.image || detection.productImage} 
                alt="detection" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display='none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon size={20} />
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight truncate max-w-xs md:max-w-md">{infringerName}</h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-500 border border-slate-100 dark:border-slate-700/50">
                {platform}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                isExact
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {isExact ? `${Math.round(similarity)}% Exact` : `${Math.round(similarity)}% Similar`}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30">
                No Notice Sent
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-slate-400 shrink-0">URL:</span>
              <a href={url} target="_blank" rel="noreferrer" className="text-brand-gold hover:underline truncate flex-1 flex items-center gap-1">
                {url} <ExternalLink size={12} className="inline shrink-0" />
              </a>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-450 flex flex-wrap gap-x-4 gap-y-1">
              {detection.contact_email && (
                <span><strong className="text-slate-400 font-semibold">Contact:</strong> {detection.contact_email}</span>
              )}
              <span><strong className="text-slate-400 font-semibold">Detected:</strong> {formatDate(dateStr)}</span>
              {detection.productName && (
                <span><strong className="text-slate-400 font-semibold">Product:</strong> {detection.productName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0 justify-between md:justify-end">
          {!isComposing ? (
            <button 
              onClick={onOpenComposer}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-forest hover:bg-brand-forest/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-brand-forest/20"
            >
              <Send size={14} /> Send Takedown
            </button>
          ) : (
            <button 
              onClick={onCloseComposer}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Inline Email Composer */}
      {isComposing && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Recipient Email</label>
              <input 
                type="email"
                value={composeEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-forest focus:outline-none dark:text-white"
                placeholder="legal@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Notice Content</label>
            <textarea
              rows={8}
              value={composeContent}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium resize-none focus:ring-2 focus:ring-brand-forest focus:outline-none dark:text-white leading-relaxed"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCloseComposer}
              className="px-5 py-2.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={isSending || !composeEmail}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-forest hover:bg-brand-forest/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-brand-forest/20 disabled:opacity-50"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isSending ? 'Sending...' : 'Deploy Takedown Notice'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Notice Card (existing, refactored) ---
function NoticeCard({ notice: t, actionLoadingId, onResend, onStatusUpdate, onDelete }) {
  const domain = parseUrlSafely(t.websiteUrl).hostname;
  const infringerName = domain.replace('www.', '');
  const platform = getPlatformName(t.websiteUrl);
  const statusLower = (t.status || '').toLowerCase();
  const isRemoved = statusLower === 'removed';
  const isEscalated = statusLower === 'escalated';
  const isPending = !isRemoved && !isEscalated;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group transition-all hover:shadow-md">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className={`p-3.5 rounded-2xl shrink-0 ${
          isRemoved ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400' :
          isEscalated ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' :
          'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
        }`}>
          {isRemoved ? <CheckCircle size={22} /> :
           isEscalated ? <AlertOctagon size={22} /> :
           <Mail size={22} />}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight truncate max-w-xs md:max-w-md">{infringerName}</h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-500 border border-slate-100 dark:border-slate-700/50">
              {platform}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
              isRemoved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              isEscalated ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {t.status}
            </span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-slate-400 shrink-0">Source URL:</span>
            <a href={t.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-gold hover:underline truncate flex-1 flex items-center gap-1">
              {t.websiteUrl} <ExternalLink size={12} className="inline shrink-0" />
            </a>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-450 flex flex-wrap gap-x-4 gap-y-1">
            <span><strong className="text-slate-400 font-semibold">Recipient:</strong> {t.recipientEmail}</span>
            <span><strong className="text-slate-400 font-semibold">Dispatched:</strong> {formatDate(t.sentAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0 justify-between md:justify-end">
        
        {isPending && (
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => onResend(t.id)}
              disabled={actionLoadingId === t.id}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {actionLoadingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail size={14} />}
              Resend
            </button>
            <button 
              onClick={() => onStatusUpdate(t.id, 'escalated')}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-rose-100/50"
            >
              <ArrowRight size={14} /> Escalate
            </button>
            <button 
              onClick={() => onStatusUpdate(t.id, 'removed')}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-50 hover:bg-green-100/85 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-green-100/50"
              title="Mark Verified Removed"
            >
              <Check size={14} /> Solved
            </button>
          </div>
        )}

        {isEscalated && (
          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon size={14} /> Escalated
            </div>
            <button 
              onClick={() => onStatusUpdate(t.id, 'removed')}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100/85 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-green-100/50"
            >
              <Check size={12} /> Mark Solved
            </button>
          </div>
        )}

        {isRemoved && (
          <div className="px-4 py-2.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle size={14} /> Removed
          </div>
        )}

        <button 
          onClick={() => onDelete(t.id)}
          className="p-2.5 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all ml-1 shrink-0"
          title="Delete Notice Record"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>
    </div>
  )
}
