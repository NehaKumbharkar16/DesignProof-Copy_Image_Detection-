import React, {useState} from 'react'
import Dropzone from '../components/Dropzone'

export default function OnboardingForm(){
  const [brand,setBrand] = useState('')
  const [website,setWebsite] = useState('')
  const [country,setCountry] = useState('')
  const [email,setEmail] = useState('')
  const [agreement,setAgreement] = useState(false)

  function handleSubmit(e){
    e.preventDefault()
    // placeholder: call onboarding API
    alert('Onboarding submitted — verification steps will follow (mock)')
  }

  return (
    <div className="max-w-2xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Brand Onboarding</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-slate-600">Brand name</label>
          <input value={brand} onChange={e=>setBrand(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Website URL</label>
          <input value={website} onChange={e=>setWebsite(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="https://example.com" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600">Country</label>
            <input value={country} onChange={e=>setCountry(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Business email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full mt-1 p-2 border rounded" required />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-600">Proof of ownership (optional)</label>
          <Dropzone onFiles={(files)=>console.log('ownership files',files)} />
          <p className="text-xs text-slate-500 mt-1">You can upload a verification file or add a meta tag later. DNS verification option available in actual deployment.</p>
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" checked={agreement} onChange={e=>setAgreement(e.target.checked)} />
          <div className="text-sm text-slate-700">I authorize DesignProof to act as my IP enforcement agent and accept the terms.</div>
        </div>

        <div className="flex justify-end">
          <button disabled={!agreement} className={`btn-gradient ${!agreement? 'opacity-50 cursor-not-allowed':''}`}>Start onboarding</button>
        </div>
      </form>
    </div>
  )
}
