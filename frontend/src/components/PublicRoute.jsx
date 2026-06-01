import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        // Show a spinner or nothing while checking auth status
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    }

    // If logged in, redirect to Dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}
