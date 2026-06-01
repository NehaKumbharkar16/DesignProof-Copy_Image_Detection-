import React from 'react'

const sample = [
  {id:1,brand:'Brand A',email:'admin@brand.com',status:'active'},
  {id:2,brand:'Brand B',email:'ops@brandb.com',status:'suspended'}
]

export default function Users(){
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Clients</h2>
      <div className="space-y-2">
        {sample.map(u => (
          <div key={u.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{u.brand}</div>
              <div className="text-sm text-slate-600">{u.email}</div>
            </div>
            <div className="text-sm">{u.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
