import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, AlertTriangle, ExternalLink, Mail, CheckCircle, Search, Clock } from 'lucide-react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

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

export default function ProductDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState({id, name: 'Loading...', brand: '-', images: [], status: 'Inactive'})
  const [scanning, setScanning] = useState(false)
  const [detections, setDetections] = useState({ exact: [], similar: [] })
  const [loadingDetections, setLoadingDetections] = useState(false)

  useEffect(() => {
    fetchProductAndDetections()
  }, [id])

  const fetchProductAndDetections = async () => {
    try {
      const api = (await import('../services/api')).default
      
      // 1. Fetch products from local or API (currently using local as source of truth for name/brand)
      const raw = localStorage.getItem('dp_products')
      const parsed = raw ? JSON.parse(raw) : []
      const found = parsed.find(p => String(p.id) === String(id))
      if(found) setProduct(found)
      
      // 2. Fetch live detections from backend
      setLoadingDetections(true)
      const detRes = await api.get('/api/detections')
      const productDetections = detRes.data.data.filter(d => String(d.id).includes(id) || d.productName === found?.name)
      
      setDetections({
        exact: productDetections.filter(d => d.similarity >= 98),
        similar: productDetections.filter(d => d.similarity < 98)
      })
    } catch (err) {
      console.error('Failed to fetch product data', err)
    } finally {
      setLoadingDetections(false)
    }
  }

  async function handleStartScan(){
    if(scanning) return
    setScanning(true)
    
    try {
      const api = (await import('../services/api')).default
      const res = await api.post('/api/detections/scan', {
        imageUrl: product.imageUrl || (product.images && product.images[0]?.dataUrl),
        productId: id
      })
      
      alert(`Scan complete! Found ${res.data.results_count} potential matches.`)
      fetchProductAndDetections() // Refresh results on page
    } catch (err) {
      console.error('Scan failed', err)
      alert('Failed to start scan: ' + (err.response?.data?.message || err.message))
    } finally {
      setScanning(false)
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  function handleDelete(){ setShowDeleteModal(true) }
  function performDeleteSingle(){
    try{
      const raw = localStorage.getItem('dp_products')
      const parsed = raw ? JSON.parse(raw) : []
      const remaining = parsed.filter(p => String(p.id) !== String(id))
      localStorage.setItem('dp_products', JSON.stringify(remaining))
    }catch(e){}
    setShowDeleteModal(false)
    navigate('/products')
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      {/* Product Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-inner">
           <img src={product.imageUrl || (product.images && product.images[0]?.dataUrl) || 'https://via.placeholder.com/300?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{product.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <span className="font-bold text-brand-forest uppercase text-xs tracking-widest">{product.brand}</span>
                <span>•</span>
                <span className="text-xs">{product.status || 'Protection Active'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleStartScan} disabled={scanning} className="btn-gradient flex items-center gap-2">
                {scanning ? <Search className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                {scanning ? 'Running Neural Scan...' : 'Start Global Scan'}
              </button>
              <button onClick={handleDelete} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100">
                <DeleteConfirmModal 
                  open={showDeleteModal} 
                  title="Delete Product?" 
                  message="This will remove the product and all scan history." 
                  onCancel={() => setShowDeleteModal(false)} 
                  onConfirm={performDeleteSingle} 
                />
                Delete
              </button>
            </div>
          </div>
          
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
             <DetailStat label="Total Scans" value="12" icon={<Clock size={14} />} />
             <DetailStat label="Exact Matches" value={detections.exact.length} icon={<CheckCircle size={14} className="text-green-500" />} />
             <DetailStat label="Similar Designs" value={detections.similar.length} icon={<AlertTriangle size={14} className="text-amber-500" />} />
             <DetailStat label="Marketplaces" value="3" icon={<Search size={14} />} />
          </div>
        </div>
      </div>

      {/* DETECTIONS SECTION */}
      <div className="space-y-12 pb-20">
        
        {/* 1. Exact Matches Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.1em] flex items-center gap-2">
              <span className="w-2 h-8 bg-red-600 rounded-full"></span>
              Exact Matches (100%)
            </h3>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{detections.exact.length} results</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingDetections ? <Loader /> : detections.exact.length === 0 ? <EmptyState /> : (
              detections.exact.map((det, i) => <DetectionCard key={i} det={det} isExact={true} />)
            )}
          </div>
        </section>

        {/* 2. Similar Matches Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.1em] flex items-center gap-2">
              <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
              Similar Designs
            </h3>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{detections.similar.length} results</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingDetections ? <Loader /> : detections.similar.length === 0 ? <EmptyState msg="No similar design variations found." /> : (
              detections.similar.map((det, i) => <DetectionCard key={i} det={det} isExact={false} />)
            )}
          </div>
        </section>
      </div>

      <Link to="/products" className="fixed bottom-6 right-6 px-6 py-3 bg-slate-800 text-white rounded-full shadow-2xl hover:bg-slate-900 transition-all font-bold flex items-center gap-2 z-50">
        Back to Inventory
      </Link>
    </div>
  )
}

function DetailStat({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {icon} {label}
      </div>
      <div className="text-lg font-black text-slate-800 dark:text-white">{value}</div>
    </div>
  )
}

function DetectionCard({ det, isExact }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0">
        <img src={det.image || 'https://via.placeholder.com/300'} alt="Infringing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${isExact ? 'bg-red-600' : 'bg-amber-500'} text-white`}>
          {isExact ? '100% Exact Match' : `${Math.round(det.similarity)}% Similar Design`}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white truncate">{parseUrlSafely(det.website).hostname.replace('www.', '')}</h4>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Found: {det.dateFound}</p>
            {det.contact_email && (
              <span className="text-[10px] font-black text-brand-forest flex items-center gap-1">
                <Mail size={10} /> {det.contact_email}
              </span>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between gap-3">
          <a href={det.website} target="_blank" rel="noreferrer" className="flex-1 py-3 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <ExternalLink size={14} /> Open
          </a>
          <button 
            onClick={() => det.contact_email ? window.location.href = `mailto:${det.contact_email}?subject=Copyright Infringement Notice&body=Dear ${parseUrlSafely(det.website).hostname} Support Team...` : alert('Crawl in progress or no email found.')}
            className={`flex-[2] py-3 text-center text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${det.contact_email ? 'bg-brand-forest hover:shadow-brand-forest/20' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            <Mail size={14} /> {det.contact_email ? 'Send Legal Notice' : 'Searching for Email...'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Loader() {
  return [1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>)
}

function EmptyState({ msg = "No matching designs found in this category." }) {
  return (
    <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-950/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
       <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
       <p className="text-slate-400 font-medium">{msg}</p>
    </div>
  )
}
