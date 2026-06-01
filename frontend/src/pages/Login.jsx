import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SocialLoginButtons from '../components/SocialLoginButtons'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    const pending = localStorage.getItem('dp_pending_registration')
    if (pending) {
      try {
        const parsed = JSON.parse(pending)
        const name = parsed.name || ''
        setInfoMessage(`Registration successful for ${name || parsed.email || ''} — please login.`)
      } catch (e) {
        setInfoMessage('Registration successful — please login.')
      }
      localStorage.removeItem('dp_pending_registration')
    }
  }, [])

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

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await login(email, password)
      if (res?.status === '2fa_required') {
        navigate('/verify-otp', { state: { email: res.email } })
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setInfoMessage(err.message)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/src/assets/bg.png')" }}
    >
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
                      <h2 className="text-2xl font-semibold mb-1 dark:text-white">Sign in to DesignProof</h2>
                      <p className="text-sm muted mb-3">Protect your brand — AI-assisted</p>
                    </div>

                    <SocialLoginButtons />

                    {infoMessage && (
                      <div className="p-3 rounded border-l-4 border-indigo-500 bg-indigo-50 text-indigo-700">
                        <div className="flex justify-between items-start">
                          <div className="text-sm">{infoMessage}</div>
                          <button onClick={() => setInfoMessage('')} className="text-indigo-600 ml-3">Dismiss</button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-300">Email</label>
                        <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full mt-2 p-3 border border-gray-200 dark:border-slate-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-slate-700 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-300">Password</label>
                        <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full mt-2 p-3 border border-gray-200 dark:border-slate-600 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-slate-700 dark:text-white" />
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <button className="w-40 btn-gradient shadow-lg" type="submit">Sign in</button>
                        <a className="text-sm accent-link" href="/register">Create account</a>
                      </div>
                    </form>
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
    </div>
  )
}
