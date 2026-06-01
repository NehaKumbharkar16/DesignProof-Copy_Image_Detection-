import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SocialLoginButtons from '../components/SocialLoginButtons'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(name, email, password)
      const pending = { name, email }
      try { localStorage.setItem('dp_pending_registration', JSON.stringify(pending)) } catch (e) { }
      navigate('/login')
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    const prevBg = document.body.style.backgroundImage
    const prevBgSize = document.body.style.backgroundSize
    const prevBgPos = document.body.style.backgroundPosition
    document.body.style.backgroundImage = "url('/src/assets/bg.png')"
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
    const appRoot = document.getElementById('app-root')
    const prevAppBg = appRoot?.style?.background
    if (appRoot) appRoot.style.background = 'transparent'
    return () => {
      document.body.style.backgroundImage = prevBg
      document.body.style.backgroundSize = prevBgSize
      document.body.style.backgroundPosition = prevBgPos
      if (appRoot) appRoot.style.background = prevAppBg || ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat">

      {/* Card - positioned right on desktop, centered on mobile */}
      <div className="relative z-10 min-h-[calc(100vh-6rem)] flex items-center">
        <div className="w-full px-6">
          <div className="max-w-6xl mx-auto">
            <div className="md:relative">
              <div className="md:absolute md:right-24 lg:right-40 top-1/2 md:transform md:-translate-y-1/2 w-full md:w-auto">
                <div className="w-full max-w-sm mx-auto auth-card relative z-50">
                  <div className="auth-topband"></div>
                  <div className="p-6 space-y-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-1 dark:text-white">Create your account</h2>
                      <p className="text-sm muted mb-3">Start monitoring and protecting your designs</p>
                    </div>

                    <SocialLoginButtons />

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-300">Name</label>
                        <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full mt-2 p-3 border border-gray-200 dark:border-slate-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-slate-700 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-300">Email</label>
                        <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full mt-2 p-3 border border-gray-200 dark:border-slate-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-slate-700 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-300">Password</label>
                        <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full mt-2 p-3 border border-gray-200 dark:border-slate-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-slate-700 dark:text-white" />
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <button className="w-44 btn-gradient shadow-lg" type="submit">Create account</button>
                        <a className="text-sm accent-link" href="/login">Already have an account?</a>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Left hero text & icon placed near the auth card */}
      <div className="hidden md:flex absolute left-12 top-1/2 transform -translate-y-1/2 items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-14 h-14 text-purple-600" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2m0 14v2M4.2 7.8A8 8 0 1119.8 16.2M12 7a3 3 0 100 6 3 3 0 000-6z" />
        </svg>
        <div className="text-left flex items-center gap-3">
          <h2 className="text-4xl font-semibold text-purple-700">Protect your brand — AI assisted</h2>
          <img src="/src/assets/brain.png" alt="AI brain" className="hidden md:inline-block w-36 h-36 object-contain ml-4" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
      </div>
    </div>
  )
}
