import React, {useState} from 'react'
import DetectionCard from '../components/DetectionCard'
import DetectionModal from '../components/DetectionModal'

import api from '../services/api'
import { useEffect } from 'react'

export default function Detections(){
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/detections')
        const mapped = res.data.data.map(d => ({
          id: d.id,
          product: d.productName,
          source: d.website,
          confidence: d.similarity / 100,
          thumb: d.image,
          original: 'https://via.placeholder.com/300?text=Scan+Image',
          matched: d.image
        }))
        setDetections(mapped)
      } catch (err) {
        console.error("Failed to fetch detections", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetections()
  }, [])

  function handleOpen(d){ setActive(d); setOpen(true) }
  function handleClose(){ setOpen(false); setActive(null) }
  function handleApprove(d){
    // placeholder: call takedown API
    alert('Takedown approved (mock)')
    handleClose()
  }
  function handleIgnore(d){
    alert('Ignored (mock)')
    handleClose()
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Detections</h2>
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">Searching for infringements...</div>
        ) : detections.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No detections found yet. Try uploading a new design.</div>
        ) : (
          detections.map(d=> (
            <DetectionCard key={d.id} detection={d} onOpen={handleOpen} />
          ))
        )}
      </div>
      <DetectionModal open={open} detection={active} onClose={handleClose} onApprove={handleApprove} onIgnore={handleIgnore} />
    </div>
  )
}
