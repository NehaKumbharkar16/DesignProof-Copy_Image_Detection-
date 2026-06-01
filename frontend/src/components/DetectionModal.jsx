import React from 'react'

export default function DetectionModal({open, detection, onClose, onApprove, onIgnore}){
  if(!open || !detection) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 p-4 rounded shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-indigo-600">Review Detection</h3>
          <button onClick={onClose} className="text-slate-500">Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm muted mb-2">Original</div>
            <img src={detection.original} alt="original" className="w-full h-80 object-contain bg-slate-100 rounded" />
          </div>
          <div>
            <div className="text-sm muted mb-2">Detected</div>
            <img src={detection.matched} alt="matched" className="w-full h-80 object-contain bg-slate-100 rounded" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-sm">Similarity: <span className="font-semibold">{(detection.confidence*100).toFixed(0)}%</span></div>
            <div className="text-sm muted">Source: {detection.source}</div>
            <div className="text-sm muted">Confidence tag: {detection.tag || 'Direct copy'}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>onIgnore && onIgnore(detection)} className="btn-outline">Ignore</button>
            <button onClick={()=>onApprove && onApprove(detection)} className="btn-primary">Approve takedown</button>
          </div>
        </div>
      </div>
    </div>
  )
}
