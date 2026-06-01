import React from 'react'

export default function AdminDashboard(){
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">Total Clients: <div className="text-2xl font-semibold mt-2">24</div></div>
        <div className="card">Pending Verifications: <div className="text-2xl font-semibold mt-2">2</div></div>
        <div className="card">Emails Sent (30d): <div className="text-2xl font-semibold mt-2">312</div></div>
      </div>
    </div>
  )
}
