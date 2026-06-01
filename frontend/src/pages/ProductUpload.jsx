import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductUpload(){
  const [name,setName] = useState('')
  const [brand,setBrand] = useState('')
  const [files,setFiles] = useState(null)
  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    if (files && files.length > 0) {
      formData.append('image', files[0]); // Current backend handles single image upload
    }

    import('../services/api').then(({ default: api }) => {
      api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(res => {
        console.log('Upload successful', res.data);
        navigate('/products');
      })
      .catch(err => {
        console.error('Upload failed', err);
        alert('Failed to upload product: ' + (err.response?.data?.error || err.message));
      });
    });
  }

  return (
    <div className="max-w-2xl card">
      <h2 className="text-xl font-semibold mb-4">Upload Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-slate-600">Product name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Brand</label>
          <input value={brand} onChange={e=>setBrand(e.target.value)} className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Images</label>
          <input type="file" multiple onChange={e=>setFiles(e.target.files)} className="mt-1" />
        </div>
        <div className="flex justify-end">
          <button className="btn-gradient">Upload</button>
        </div>
      </form>
    </div>
  )
}
