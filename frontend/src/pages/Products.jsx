import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle2, Mail, X, ShieldCheck, Upload, ExternalLink, Send, FileText, Image as ImageIcon, Edit, Zap, Clock } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import api from '../services/api'

export default function Products() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'exact', 'similar'
  
  // Real-time scan progress details
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('Initializing search...');
  const [estTimeLeft, setEstTimeLeft] = useState(15);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [editableEmail, setEditableEmail] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false); 

  // Dynamic Scan Progress effect
  useEffect(() => {
    let timer;
    let progressTimer;
    
    if (isLoading) {
      setScanProgress(0);
      setEstTimeLeft(15);
      setScanStep('Initializing deep image feature extraction...');
      
      // Est remaining countdown
      timer = setInterval(() => {
        setEstTimeLeft((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
      
      // Progress simulation through optimized pipeline steps
      progressTimer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev < 15) {
            setScanStep('Uploading reference design to global search nodes...');
            return prev + 4;
          } else if (prev < 45) {
            setScanStep('Scanning 500M+ e-commerce & retail platform endpoints...');
            return prev + 8;
          } else if (prev < 75) {
            setScanStep('Parallel fetching e-commerce listing links (pooled socket)...');
            return prev + 6;
          } else if (prev < 95) {
            setScanStep('Finalizing visual AI matching & confidence levels...');
            return prev + 3;
          } else {
            return 98;
          }
        });
      }, 500);
    } else {
      setScanProgress(0);
      setEstTimeLeft(15);
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [isLoading]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
      
      // Auto-trigger search
      await triggerSearch(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    disabled: isLoading
  });

  const triggerSearch = async (fileToUpload) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', fileToUpload);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;
      if (data.error) throw new Error(data.error);
      
      setResults({
        exact: data.exactMatches || [],
        similar: data.similarMatches || [],
        matching_websites: data.matching_websites || []
      });
      setScanTime(data.scan_duration || 'N/A');
      setFilterMode('all'); // Reset filter mode to All upon new scan
    } catch (err) {
      setError(err.message || 'Error uploading image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowNotice = (email, matchObj) => {
    const domain = new URL(matchObj.url).hostname;
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
    setIsEditing(false); // Reset editing state
    setIsModalOpen(true);
  };

  const handleSendNotice = async () => {
    if (!selectedNotice) return;
    setIsSending(true);

    try {
      const payload = {
        email: editableEmail,
        website_url: selectedNotice.url,
        original_image_url: selectedImage,
        copied_image_url: selectedNotice.copied_image_url || selectedNotice.thumbnail,
        content: editableContent
      };

      const res = await api.post('/api/notices', payload);
      if (res.data.error) throw new Error(res.data.error);

      // Update UI status locally
      setResults(prev => ({
          ...prev,
          exact: prev.exact.map(m => m.url === selectedNotice.url ? { ...m, status: 'Sent' } : m),
          similar: prev.similar.map(m => m.url === selectedNotice.url ? { ...m, status: 'Sent' } : m)
      }));

      setIsModalOpen(false);
      alert('Copyright Notice issued successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Combine exact and similar matches for unified single-section display
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
      {/* Main Experience Content - Centered and full width */}
      <div className="flex-1 p-6 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          
          {!results && !isLoading ? (
            <div className="space-y-16 mt-6">
              {/* Premium Glow Upload Card */}
              <div 
                {...getRootProps()} 
                className={`
                  relative overflow-hidden group cursor-pointer transition-all duration-500
                  bg-gradient-to-br from-white to-slate-50/50 border-2 border-dashed rounded-[48px] p-16 md:p-20 text-center
                  shadow-[0_30px_60px_-15px_rgba(79,70,229,0.06)] hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.12)]
                  ${isDragActive ? 'border-indigo-600 bg-indigo-50/30 scale-[1.01]' : 'border-indigo-100 hover:border-indigo-400'}
                `}
              >
                <input {...getInputProps()} />
                
                {/* Visual Glow Effect */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl group-hover:bg-indigo-200/40 transition-all duration-500 -z-10"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-all duration-500 -z-10"></div>

                {/* Animated Scanner Radar Rings around Icon */}
                <div className="relative w-36 h-36 mx-auto mb-10">
                  {/* Ripple Rings */}
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute -inset-4 bg-indigo-500/5 rounded-full animate-pulse opacity-40"></div>
                  {/* Center Icon Container */}
                  <div className="absolute inset-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-[38px] flex items-center justify-center shadow-xl shadow-indigo-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                  Your Design. Protected.
                </h2>
                
                <p className="text-slate-500 text-lg font-medium mb-10 max-w-md mx-auto leading-relaxed">
                  {isDragActive 
                    ? 'Drop your design here to initiate scanning...' 
                    : 'Drag and drop your creative design here, or browse files to initiate scanning'}
                </p>

                {/* Supported formats badges */}
                <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Supported:</span>
                  {['PNG', 'JPG', 'WEBP', 'JPEG'].map((fmt) => (
                    <span key={fmt} className="px-3.5 py-1.5 bg-slate-100/80 text-slate-600 rounded-full font-bold text-xs tracking-wider border border-slate-200/30">
                      {fmt}
                    </span>
                  ))}
                </div>

                <div className="relative inline-block z-10 group/btn">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-30 group-hover/btn:opacity-60 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl cursor-pointer hover:from-slate-900 hover:to-slate-900 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0">
                    Choose Creative Asset
                  </div>
                </div>
              </div>

              {/* Seamless Procedural How-It-Works Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500/20"></div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mb-6 group-hover:scale-110 transition-transform">1</div>
                  <h4 className="font-extrabold text-slate-900 text-lg mb-2">Upload Original Asset</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">Upload any catalog, digital artwork, or photography in standard web image formats.</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 left-0 w-2 h-full bg-violet-500/20"></div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold mb-6 group-hover:scale-110 transition-transform">2</div>
                  <h4 className="font-extrabold text-slate-900 text-lg mb-2">Neural Visual Matching</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">Our advanced computer vision cross-references 500M+ retail listings in seconds.</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 left-0 w-2 h-full bg-rose-500/20"></div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold mb-6 group-hover:scale-110 transition-transform">3</div>
                  <h4 className="font-extrabold text-slate-900 text-lg mb-2">Direct Takedown Action</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">Identify copycats, track similarity metrics, and issue instant formal copyright notices.</p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-[64px] p-16 md:p-24 text-center border border-slate-100 shadow-2xl mb-16 mt-12 max-w-3xl mx-auto relative overflow-hidden">
              {/* Radial Glowing Background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/20 via-white to-violet-50/20 -z-10"></div>
              
              {/* Spinning Scanner Orb */}
              <div className="relative w-28 h-28 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border-8 border-slate-100 border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-4 rounded-full bg-indigo-50/50 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Neural Web Scan Active</h3>
              <p className="text-indigo-600 font-extrabold uppercase tracking-[0.2em] text-xs mb-8 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                Blazing Speed Optimization Engaged
              </p>

              {/* Progress Slider */}
              <div className="max-w-md mx-auto mb-12 bg-slate-50 p-6 rounded-[28px] border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Progress</span>
                  <span className="text-sm font-black text-indigo-600">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-3 mb-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-violet-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                
                {/* Active task steps */}
                <div className="text-slate-600 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[20px]">
                  {scanStep}
                </div>
              </div>

              {/* ESTIMATED TIMEOUT COUNTER */}
              <div className="inline-flex items-center gap-3 bg-rose-50 text-rose-700 px-6 py-3 rounded-2xl border border-rose-100/50 font-black text-xs uppercase tracking-widest shadow-inner">
                <Clock className="w-4 h-4 text-rose-600 animate-spin" />
                <span>Est. Fetch Time Remaining: {estTimeLeft}s</span>
              </div>
            </div>
          ) : results ? (
            <div className="animate-in fade-in slide-in-from-bottom-10 shadow-2xl shadow-indigo-50/20 duration-1000 mt-8">
              {/* Reset/Upload New Header */}
              <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-md">
                    <img src={selectedImage} alt="Scanned" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Scan Analysis</h3>
                    <p className="text-slate-400 font-medium">Verified original design asset</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setResults(null); setSelectedImage(null); setFilterMode('all'); }}
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
                  {/* optimized speed hint */}
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
                    <CheckCircle2 className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                    <h4 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-tight">No Matches Found</h4>
                    <p className="text-slate-600 font-medium italic">No scan items match your filter criteria.</p>
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
                    Takedown Action: {new URL(selectedNotice.url).hostname.replace('www.', '')}
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

// Reusable Lite Match Card Component
function MatchCard({ match, index, onNotice, isExact, selectedImage }) {
  const domain = match.brand_name || new URL(match.url).hostname.replace('www.', '');
  
  return (
    <div className="flex flex-col bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group relative">
      <div className="p-10">
        
        {/* Exact or Similar Match Status Banner */}
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
