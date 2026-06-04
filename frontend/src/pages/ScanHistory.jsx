import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, AlertCircle, CheckCircle2, Mail, X, ShieldCheck, ExternalLink, Send, FileText, Image as ImageIcon, Edit, Zap, Clock, Trash2 } from 'lucide-react'
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

export default function ScanHistory() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'exact', 'similar'
  const [publicSearchUrl, setPublicSearchUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [editableEmail, setEditableEmail] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [scanning, setScanning] = useState(false);

  const handleStartScan = async () => {
    if (scanning || !selectedProductId) return;
    setScanning(true);
    try {
      const res = await api.post('/api/detections/scan', {
        imageUrl: selectedImage,
        productId: selectedProductId
      });
      alert(`Scan complete! Found ${res.data.results_count} potential matches.`);
      // Re-load detections for this product to refresh UI
      await handleSelectProduct({
        id: selectedProductId,
        primary_image_url: selectedImage,
        public_search_url: publicSearchUrl
      });
    } catch (err) {
      console.error('Scan failed', err);
      alert('Failed to start scan: ' + (err.response?.data?.message || err.message));
    } finally {
      setScanning(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/products');
      if (res.data && res.data.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching scan history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectProduct = async (product) => {
    setIsLoading(true);
    setResults(null);
    setSelectedProductId(product.id);
    setSelectedImage(product.primary_image_url);
    setPublicSearchUrl(product.public_search_url);
    setError(null);
    try {
      const res = await api.get(`/api/detections?productId=${product.id}`);
      if (res.data && res.data.data) {
        const detections = res.data.data;
        const normalizedExact = detections
          .filter(d => d.match_type === 'exact_match' || Number(d.similarity) >= 85)
          .map(d => {
            const parsedUrl = parseUrlSafely(d.website);
            return {
              id: d.id,
              url: parsedUrl.href,
              website_url: parsedUrl.href,
              copied_image_url: d.image,
              similarity_score: Number(d.similarity),
              match_type: 'Exact Match',
              emails: d.contact_email ? [{ email: d.contact_email, status: 'Ready' }] : [],
              status: d.status
            };
          });
        
        const normalizedSimilar = detections
          .filter(d => d.match_type !== 'exact_match' && Number(d.similarity) < 85)
          .map(d => {
            const parsedUrl = parseUrlSafely(d.website);
            return {
              id: d.id,
              url: parsedUrl.href,
              website_url: parsedUrl.href,
              copied_image_url: d.image,
              similarity_score: Number(d.similarity),
              match_type: 'Similar Match',
              emails: d.contact_email ? [{ email: d.contact_email, status: 'Ready' }] : [],
              status: d.status
            };
          });

        setResults({
          exact: normalizedExact,
          similar: normalizedSimilar,
          matching_websites: [...normalizedExact, ...normalizedSimilar]
        });
        setScanTime('Loaded from History');
        setFilterMode('all');
      }
    } catch (err) {
      setError(err.message || 'Error loading product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this scan and all its matched links?")) return;
    
    try {
      await api.delete(`/api/products/${productId}`);
      setHistory(prev => prev.filter(p => p.id !== productId));
      
      if (selectedProductId === productId) {
        setResults(null);
        setSelectedImage(null);
        setPublicSearchUrl(null);
        setSelectedProductId(null);
      }
    } catch (err) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleShowNotice = (email, matchObj) => {
    setSelectedNotice(matchObj);
    setEditableEmail(email || '');
    setEditableContent(
`Dear Sir/Madam,

I hope this message finds you well.

I am writing to inform you that an image owned by me has been identified on your website without my permission. The image is my original work, and its usage on your platform appears to be unauthorized.

**Details of the issue:**

* Website URL: ${matchObj.url}
* Original Image Owner: [Your Name / Company Name]
* Proof of Ownership: [Evidence Case ID: ${matchObj.id}]

I kindly request you to remove the image from your website at the earliest or provide proper authorization/credit if applicable.

Please treat this as an urgent matter related to intellectual property rights. I would appreciate your cooperation in resolving this issue promptly.

If the image is not removed within a reasonable timeframe, I may be required to take further action.

Thank you for your understanding and cooperation.

Sincerely,
[Your Full Name]
[Your Contact Information]
[Your Email Address]`
    );
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSendNotice = async () => {
    if (!selectedNotice) return;
    setIsSending(true);

    try {
      const payload = {
        detected_match_id: selectedNotice.id,
        email: editableEmail,
        website_url: selectedNotice.url,
        original_image_url: selectedImage,
        copied_image_url: selectedNotice.copied_image_url || selectedNotice.thumbnail,
        content: editableContent
      };

      const res = await api.post('/api/notices', payload);
      if (res.data.error) throw new Error(res.data.error);

      setResults(prev => ({
          ...prev,
          exact: prev.exact.map(m => m.url === selectedNotice.url ? { ...m, status: 'approved' } : m),
          similar: prev.similar.map(m => m.url === selectedNotice.url ? { ...m, status: 'approved' } : m)
      }));

      setIsModalOpen(false);
      alert('Copyright Notice issued successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const allMatches = results ? [
    ...results.exact.map(m => ({ ...m, isExact: true })),
    ...results.similar.map(m => ({ ...m, isExact: false }))
  ] : [];

  const filteredMatches = allMatches.filter(match => {
    if (filterMode === 'exact') return match.isExact;
    if (filterMode === 'similar') return !match.isExact;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex font-['Inter',sans-serif] text-slate-800 selection:bg-indigo-100 w-full">
      {/* Sidebar - History */}
      <div className="w-80 border-r border-slate-100 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto custom-scrollbar p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider pl-2 border-l-4 border-indigo-600">Scan History</h3>
          <button
            onClick={() => navigate('/products')}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all"
            title="Scan a new image"
          >
            + New Scan
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium text-sm italic">
              No recent scans found.
            </div>
          ) : (
            history.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`flex items-center gap-4 p-4 rounded-[24px] border cursor-pointer transition-all duration-300 group ${
                  selectedProductId === product.id
                    ? 'border-indigo-600 bg-indigo-50/30'
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-[16px] overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                  <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-slate-900 text-sm truncate leading-tight group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteProduct(product.id, e)}
                  className="p-2 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Experience Content - Centered and full width */}
      <div className="flex-1 p-6 md:p-12 lg:p-16 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {!results && !isLoading ? (
            <div className="bg-white rounded-[48px] p-24 text-center border border-slate-100 shadow-inner mt-12 max-w-3xl mx-auto">
              <Clock className="w-16 h-16 text-indigo-100 mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Review Scan History</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                Select a scan from the left sidebar to review detected infringements, view visual match details, and take action.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all"
              >
                Scan a New Image
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[48px] border border-slate-100 mt-12 shadow-sm max-w-3xl mx-auto">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-slate-450 text-xs font-black uppercase tracking-widest mt-6 animate-pulse">Loading scan data...</p>
            </div>
          ) : results ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 shadow-2xl shadow-indigo-50/20 duration-300 mt-8">
              {/* Reset/Upload New Header */}
              <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-md">
                    <img src={selectedImage} alt="Scanned" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Scan Analysis</h3>
                    <p className="text-slate-400 font-medium">Verified original design asset</p>
                    {publicSearchUrl && (
                      <div className="mt-2 flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Public Fetch URL:</span>
                        <a href={publicSearchUrl} target="_blank" rel="noreferrer" className="underline hover:text-indigo-900 truncate max-w-xs md:max-w-md">
                          {publicSearchUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all"
                >
                  Scan New Design
                </button>
              </div>

              {/* Industry Stats Cluster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-slate-50 p-3.5 rounded-2xl text-slate-400"><Search className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Scan Performance Metrics</span>
                  </div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    {scanTime}
                    <span className="text-sm font-bold ml-2 text-slate-200 uppercase tracking-widest">Processing Time</span>
                  </div>
                  <span className="block mt-3 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">⚡ Blazing Speed Active (Connection Pooling, Threaded Maps)</span>
                </div>
                
                <div className="bg-white p-10 rounded-[48px] border-b-4 border-rose-500 shadow-xl shadow-rose-50/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-rose-50 p-3.5 rounded-2xl text-rose-600"><ShieldCheck className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">High Risk Flags</span>
                  </div>
                  <div className="text-5xl font-black text-rose-600 tracking-tighter">
                    {results.exact.length}
                    <span className="text-sm font-bold ml-2 text-rose-200">EXACT</span>
                    <span className="text-2xl font-black mx-2 text-slate-100">/</span>
                    <span className="text-3xl text-indigo-400">{results.similar.length}</span>
                    <span className="text-xs font-bold ml-2 text-indigo-100 uppercase tracking-widest">Similar</span>
                  </div>
                </div>
              </div>

              {/* Consolidated Results Section */}
              <div className="mb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-6">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-4 border-l-4 border-indigo-600 pl-6 uppercase tracking-[0.15em]">
                      Detected Matches ({filteredMatches.length})
                    </h2>
                    <div className="hidden sm:block h-0.5 w-24 bg-slate-100 rounded-full"></div>
                  </div>
                  
                  {/* Interactive filter tabs */}
                  <div className="flex bg-slate-100 p-1.5 rounded-[20px] self-start md:self-auto border border-slate-200/50">
                    <button 
                      onClick={() => setFilterMode('all')}
                      className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-wider transition-all duration-300 ${filterMode === 'all' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      All Matches ({allMatches.length})
                    </button>
                    <button 
                      onClick={() => setFilterMode('exact')}
                      className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-wider transition-all duration-300 ${filterMode === 'exact' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Exact ({results.exact.length})
                    </button>
                    <button 
                      onClick={() => setFilterMode('similar')}
                      className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-wider transition-all duration-300 ${filterMode === 'similar' ? 'bg-white text-indigo-500 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Similar ({results.similar.length})
                    </button>
                  </div>
                </div>

                {filteredMatches.length === 0 ? (
                  <div className="bg-white rounded-[48px] p-24 text-center border border-slate-100 shadow-inner">
                    <CheckCircle2 className="w-16 h-16 text-emerald-100 mx-auto mb-6 animate-pulse" />
                    <h4 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-tight">No Matches Found</h4>
                    <p className="text-slate-600 font-medium italic mb-8">No scan items match your filter criteria or this design has not been scanned yet.</p>
                    <button
                      onClick={handleStartScan}
                      disabled={scanning}
                      className="bg-indigo-600 hover:bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                    >
                      {scanning ? 'Running Neural Scan...' : 'Scan / Re-Scan Design Now'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredMatches.map((match, i) => (
                      <MatchCard 
                        key={match.isExact ? `exact-${i}` : `similar-${i}`} 
                        match={match} 
                        index={i} 
                        isExact={match.isExact} 
                        selectedImage={selectedImage} 
                        onNotice={handleShowNotice} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] mt-12 flex items-center gap-6 animate-in zoom-in duration-300">
              <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-200"><AlertCircle className="text-white w-6 h-6" /></div>
              <div>
                <span className="block text-rose-900 font-black text-lg">Detection Process Interrupted</span>
                <span className="block text-rose-400 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notice Modal */}
      {isModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[64px] w-full max-w-6xl shadow-[0_80px_100px_-20px_rgba(0,0,0,0.2)] relative flex flex-col md:flex-row overflow-hidden max-h-[95vh] border-8 border-white/20">
            {/* Visual Evidence */}
            <div className="md:w-2/5 bg-slate-50 p-12 flex flex-col border-r border-slate-100">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12">Evidence Package</h3>
              <div className="space-y-12 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest pl-2">Original</span>
                    <span className="text-[10px] font-bold text-slate-500">AUTHENTIC DESIGN</span>
                  </div>
                  <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl ring-4 ring-white border-2 border-slate-100">
                    <img src={selectedImage} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest pl-2">Detected</span>
                    <span className="text-[10px] font-bold text-slate-500">{selectedNotice.similarity_score}% SIMILARITY</span>
                  </div>
                  <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl ring-4 ring-white border-2 border-slate-100">
                    <img src={selectedNotice.copied_image_url || selectedNotice.thumbnail} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="md:w-3/5 p-16 flex flex-col bg-white overflow-hidden">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-3 text-slate-300 hover:text-slate-900 transition-all active:scale-95">
                 <X className="w-8 h-8" />
               </button>

               <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">Direct Infringement Case</span>
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4">
                    Takedown Action: {parseUrlSafely(selectedNotice.url).hostname.replace('www.', '')}
                  </h3>
               </div>

               <div className="flex-1 overflow-y-auto pr-8 custom-scrollbar">
                  <div className="bg-slate-50 p-12 rounded-[56px] border border-slate-100 mb-8 shadow-inner shadow-slate-100/50">
                    <div className="flex items-center gap-6 mb-12">
                      <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                         <Mail className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Target Contact Email</label>
                        <input 
                          type="email" 
                          value={editableEmail}
                          onChange={(e) => setEditableEmail(e.target.value)}
                          readOnly={!isEditing}
                          className={`w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-black text-2xl text-slate-900 placeholder:text-slate-200 ${isEditing ? '' : 'cursor-not-allowed'}`}
                          placeholder="legal@marketplace.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Formal Notice Draft</label>
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-600 hover:text-indigo-600'}`}
                        >
                          {isEditing ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                          {isEditing ? 'Lock Draft' : 'Edit Notice'}
                        </button>
                      </div>
                      <textarea 
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full bg-white border p-8 rounded-[40px] h-72 outline-none transition-all font-medium text-slate-600 shadow-inner resize-none text-sm leading-relaxed ${isEditing ? 'border-indigo-200 focus:ring-8 focus:ring-indigo-50' : 'border-slate-50 cursor-not-allowed'}`}
                      />
                    </div>
                  </div>
               </div>

               <div className="pt-10 flex items-center gap-8">
                  <button onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-slate-500 font-black uppercase text-[11px] tracking-[0.2em] hover:text-slate-900 transition-colors">Discard Case</button>
                  <button 
                    onClick={handleSendNotice}
                    disabled={isSending}
                    className="flex-1 bg-indigo-600 text-white px-16 py-7 rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSending ? 'Transmitting Notice...' : 'Approve & Send Notice'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, index, onNotice, isExact, selectedImage }) {
  const domain = match.brand_name || parseUrlSafely(match.url).hostname.replace('www.', '');
  
  return (
    <div className="flex flex-col bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group relative">
      <div className="p-10">
        <div className={`mb-6 p-4 rounded-[20px] text-center font-black text-xs uppercase tracking-wider border transition-all duration-300 ${
          isExact 
            ? 'bg-rose-50/80 border-rose-100 text-rose-700 shadow-sm' 
            : 'bg-indigo-50/60 border-indigo-100 text-indigo-700 shadow-sm'
        }`}>
          {isExact ? '✨ This image is an exact match' : '🔍 This image is a similar match'}
        </div>

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm tracking-tighter ${isExact ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600 shadow-inner'}`}>
              #{index + 1}
            </div>
            <div>
              <span className="block font-black text-slate-900 text-lg tracking-tighter leading-tight uppercase truncate max-w-[120px]">{domain}</span>
              <span className={`block text-[9px] font-black uppercase tracking-[0.3em] ${isExact ? 'text-rose-400' : 'text-slate-300'}`}>{isExact ? "Unauthorized" : "Inspired"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className={`text-[11px] font-black tracking-widest uppercase ${isExact ? 'text-rose-600' : 'text-indigo-400'}`}>
                {isExact ? '100% EXACT MATCH' : `${Math.round(match.similarity_score)}% SIMILAR DESIGN`}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-5 mb-10">
           <div className="flex-1 aspect-[4/5] rounded-[36px] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-[1.04] transition-all duration-700 relative">
             <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-700"></div>
             <div className="absolute top-3 left-3 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/40">Reference</div>
           </div>
           
           <div className="flex-1 aspect-[4/5] rounded-[36px] overflow-hidden bg-white border border-slate-100 shadow-inner group-hover:scale-[1.04] transition-all duration-700 relative">
             {match.copied_image_url || match.thumbnail ? (
               <img src={match.copied_image_url || match.thumbnail} alt="Copy" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-200">
                  <ShieldCheck className="w-10 h-10 opacity-20 mb-2" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Scan Only</span>
               </div>
             )}
             <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg ${isExact ? 'bg-rose-600' : 'bg-slate-900'}`}>Evidence</div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50/60 p-5 rounded-[28px] border border-slate-100/50 shadow-inner overflow-hidden">
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 pl-2">Platform URL</span>
            <div className="flex items-center gap-3">
              <a href={match.url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-600 text-[12px] font-bold truncate flex-1 transition-all">
                {match.url}
              </a>
              <ExternalLink className="w-4 h-4 text-slate-200" />
            </div>
          </div>

          <button 
            onClick={() => onNotice(match.emails?.[0]?.email || '', match)}
            className={`w-full py-6 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] ${
              isExact 
                ? 'bg-slate-900 hover:bg-rose-600 text-white shadow-2xl shadow-slate-200' 
                : 'bg-white border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-slate-500'
            }`}
          >
            <FileText className="w-5 h-5" /> 
            {match.emails && match.emails.length > 0 ? "Edit & Dispatch Notice" : "Edit & Verify Case"}
          </button>
        </div>
      </div>
    </div>
  );
}
