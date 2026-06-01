import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function Header() {
  const { user, logout, setSidebarOpen } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  // ... (existing code)


  return (
    <header className="sticky top-0 z-50 bg-brand-forest dark:bg-slate-900 text-white py-3 shadow transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="md:hidden p-2 -ml-2 rounded text-white/90 hover:bg-white/10"
              aria-label="Toggle Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          )}
          <div className="w-10 h-10 rounded overflow-hidden flex items-center justify-center bg-white/10">
            <img src="/src/assets/logo.png" alt="DesignProof" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span className="font-bold text-sm text-white/90">DP</span>
          </div>
          <h1 className="text-lg font-semibold">DesignProof</h1>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <nav className="hidden md:flex items-center gap-2">
                <Link to="/" className="text-sm px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand-gold transition-all duration-300">Home</Link>
                <Link to="/features" className="text-sm px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand-gold transition-all duration-300">Features</Link>
                <Link to="/how-it-works" className="text-sm px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand-gold transition-all duration-300">How It Works</Link>
                <Link to="/pricing" className="text-sm px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand-gold transition-all duration-300">Pricing</Link>
                <Link to="/contact" className="text-sm px-3 py-2 rounded-md hover:bg-white/10 hover:text-brand-gold transition-all duration-300">Contact</Link>
              </nav>
              <div className="hidden sm:block text-sm">Protect your brand — AI-assisted</div>
              <div className="hidden md:flex gap-2 items-center">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/90 hover:text-yellow-400"
                  aria-label="Toggle Theme"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/10 hover:border-white/30 group">
                  <div className="bg-brand-gold rounded-full p-1 text-white group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <span className="font-medium text-sm">Sign In</span>
                </Link>
              </div>

              {/* mobile menu toggle */}
              <button className="md:hidden p-2 rounded bg-white/10" onClick={() => setMobileOpen(s => !s)} aria-expanded={mobileOpen} aria-label="Menu">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {mobileOpen && (
                <div className="absolute left-0 right-0 top-full bg-white text-slate-900 p-4 shadow-md md:hidden">
                  <nav className="flex flex-col gap-2">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="py-2">Home</Link>
                    <Link to="/features" onClick={() => setMobileOpen(false)} className="py-2">Features</Link>
                    <Link to="/how-it-works" onClick={() => setMobileOpen(false)} className="py-2">How It Works</Link>
                    <Link to="/pricing" onClick={() => setMobileOpen(false)} className="py-2">Pricing</Link>
                    <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-2">Contact</Link>

                    <div className="flex items-center justify-between py-2 border-t dark:border-slate-800 mt-2">
                      <span>Theme</span>
                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                      </button>
                    </div>

                    <div className="pt-2">
                      <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-brand-gold text-white px-4 py-3 rounded-lg shadow-md font-medium hover:bg-yellow-600 transition-colors" onClick={() => setMobileOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Sign In / Register
                      </Link>
                    </div>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 relative">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/90 hover:text-yellow-400"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* Profile Dropdown Trigger */}
              <button
                onClick={() => setMobileOpen((prev) => prev === 'profile' ? false : 'profile')}
                className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-transparent hover:border-white/10"
              >
                <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`hidden sm:block transition-transform ${mobileOpen === 'profile' ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>

              {/* Profile Dropdown Menu */}
              {mobileOpen === 'profile' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMobileOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">

                    {/* User Info Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy dark:text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{user.email || 'admin@designproof.ai'}</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                        Admin Administrator
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-brand-gold transition-colors"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span className="font-medium">My Profile</span>
                      </Link>
                      <Link to="/admin/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-brand-gold transition-colors"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        <span className="font-medium">Settings</span>
                      </Link>
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                      <button onClick={() => { logout(); navigate('/') }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/70 group-hover:text-red-600 transition-colors"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
