import React from 'react'

export default function DetectionCard({detection, onOpen}){
  return (
    <div className="card flex items-center gap-4">
      <img src={detection.thumb} alt="thumb" className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <div className="font-semibold">{detection.product}</div>
        <div className="text-sm muted">{detection.source}</div>
      </div>
      <div className="text-sm mr-2">{(detection.confidence*100).toFixed(0)}%</div>
      <button onClick={()=>onOpen && onOpen(detection)} className="btn-primary">Review</button>
    </div>
  )
}
