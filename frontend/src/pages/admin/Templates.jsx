import React from 'react'

const templates = [
  {id:1,name:'Standard Takedown',subject:'Notice of Infringement – {brand}'},
  {id:2,name:'Reminder',subject:'Final Reminder – {brand}'}
]

export default function Templates(){
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Legal Templates</h2>
      <div className="space-y-2">
        {templates.map(t=> (
          <div key={t.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-slate-600">{t.subject}</div>
            </div>
            <div><button className="px-3 py-1 border rounded">Edit</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
