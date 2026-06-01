import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile(){
  const { user } = useAuth()
  if(!user) return (
    <div className="bg-white p-6 rounded shadow">Please sign in to view your profile.</div>
  )

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Profile</h2>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <div className="mb-2"><strong>Name:</strong> {user.name}</div>
        <div className="mb-2"><strong>Email:</strong> {user.email}</div>
        <div className="mb-2"><strong>Role:</strong> {user.isAdmin? 'Admin':'Client'}</div>
      </div>
    </div>
  )
}
