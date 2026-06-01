import React from 'react'

export default function Plans(){
  const plans = [
    {id:'free',name:'Free',credits:50},
    {id:'growth',name:'Growth',credits:500},
    {id:'scale',name:'Scale',credits:2000}
  ]
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
      <div className="grid gap-3">
        {plans.map(p=> (
          <div key={p.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-slate-600">Credits: {p.credits}</div>
            </div>
            <div><button className="px-3 py-1 border rounded">Edit</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
