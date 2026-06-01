import React, { useState, useEffect } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()

  // Account form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')

  // Security fields
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [is2faEnabled, setIs2faEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  // show/hide password toggles
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // Fetch current user settings on mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/auth/me')
        if (res.data?.status === 'success' && res.data.user) {
          const u = res.data.user
          setFullName(u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || '')
          setEmail(u.email || '')
          if (u.brands && u.brands.length > 0) {
            setCompany(u.brands[0].name || '')
          } else {
            setCompany('')
          }
          setIs2faEnabled(u.two_factor_enabled || false)
        }
      } catch (err) {
        console.error('Failed to load settings from server:', err)
        // Fallback to AuthContext local state if API fails
        if (user) {
          setFullName(user.name || '')
          setEmail(user.email || '')
          if (user.brands && user.brands.length > 0) {
            setCompany(user.brands[0].name || '')
          }
          setIs2faEnabled(user.two_factor_enabled || false)
        }
      } finally {
        setLoading(false)
      }
    }
    loadUserSettings()
  }, [user])

  const handleSaveAccount = async () => {
    try {
      setLoading(true)
      const res = await api.patch('/api/users/me', { fullName, email, company })
      if (res.data?.status === 'success') {
        toast.success('Account details saved')
        if (res.data.user) {
          updateUser(res.data.user)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save account')
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return toast.error('Please fill all fields')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    try {
      setLoading(true)
      const res = await api.post('/api/users/change-password', { current_password: currentPassword, new_password: newPassword })
      if (res.data?.status === 'success') {
        toast.success('Password changed successfully')
        setShowChangePassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
      console.error(err)
    } finally { setLoading(false) }
  }

  const toggle2FA = async () => {
    try {
      setLoading(true)
      const target2FAState = !is2faEnabled
      if (target2FAState) {
        const res = await api.post('/api/users/2fa')
        if (res.data?.status === 'success') {
          setIs2faEnabled(true)
          if (user) {
            updateUser({ ...user, two_factor_enabled: true })
          }
          toast.success('Two-factor enabled (check your email for setup)')
        }
      } else {
        const res = await api.delete('/api/users/2fa')
        if (res.data?.status === 'success') {
          setIs2faEnabled(false)
          if (user) {
            updateUser({ ...user, two_factor_enabled: false })
          }
          toast.success('Two-factor disabled')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update two-factor auth')
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return
    try {
      setLoading(true)
      const res = await api.delete('/api/users/me')
      if (res.data?.status === 'success') {
        toast.success('Account deleted successfully')
        logout()
        navigate('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account')
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-500">Update account, notifications, and preferences.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={handleSaveAccount} className="btn-primary" disabled={loading}>Save</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Account Details</h2>
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row gap-4">
                <label className="w-full">
                  <div className="text-xs font-medium text-slate-500">Full Name</div>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                </label>
                <label className="w-full">
                  <div className="text-xs font-medium text-slate-500">Email</div>
                  <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                </label>
              </div>
              <label>
                <div className="text-xs font-medium text-slate-500">Company</div>
                <input value={company} onChange={e => setCompany(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
              </label>
            </div>
            <div className="mt-4 md:hidden flex gap-2">
              <button onClick={handleSaveAccount} className="btn-primary" disabled={loading}>Save</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                <span>Receive enforcement emails</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" />
                <span>Weekly summary</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Security</h3>
            <div className="space-y-4 text-sm text-slate-500">
              <div>
                <button onClick={() => setShowChangePassword(s => !s)} className="text-sm text-brand-forest hover:underline">Change password</button>
                {showChangePassword && (
                  <form onSubmit={handleChangePassword} className="mt-3 space-y-2">
                    <div className="relative">
                      <input type={showCurrentPwd ? 'text' : 'password'} placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 pr-10" />
                      <button type="button" aria-label="Toggle current password visibility" onClick={() => setShowCurrentPwd(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                        {showCurrentPwd ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    <div className="relative">
                      <input type={showNewPwd ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 pr-10" />
                      <button type="button" aria-label="Toggle new password visibility" onClick={() => setShowNewPwd(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                        {showNewPwd ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    <div className="relative">
                      <input type={showConfirmPwd ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 pr-10" />
                      <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPwd(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                        {showConfirmPwd ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary" disabled={loading}>Save Password</button>
                      <button type="button" onClick={() => setShowChangePassword(false)} className="btn-outline">Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              {/* TWO-FACTOR AUTHENTICATION (2FA) PREMIUM CARD */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      Two-Factor Authentication (2FA)
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${is2faEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {is2faEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                      Secure your creative workspace by requiring a secure time-sensitive 6-digit OTP verification code sent to your registered Gmail address on every sign-in.
                    </p>
                  </div>

                  {/* Beautiful custom switch toggle slider button */}
                  <button
                    type="button"
                    onClick={toggle2FA}
                    disabled={loading}
                    className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 relative focus:outline-none shrink-0 flex items-center ${is2faEnabled ? 'bg-brand-gold shadow-md' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${is2faEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Expanded info block when 2FA is active */}
                {is2faEnabled ? (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 mt-3 space-y-3 animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <span className="text-base">🛡️</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">OTP Code Delivery Active</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Codes are securely dispatched to <span className="font-semibold text-brand-gold">{email || user?.email}</span> via encrypted SMTP relays. Ensure you have active access to this inbox.</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button 
                        type="button" 
                        disabled={loading}
                        onClick={async () => {
                          try {
                            setLoading(true);
                            // Call standard OTP sender to trigger a test mail
                            const res = await api.post('/api/auth/send-otp', { email: email || user?.email, purpose: '2fa' });
                            if (res.data?.status === 'success') {
                              toast.success('Test verification code successfully sent to email!');
                            }
                          } catch (err) {
                            toast.error('Failed to dispatch test OTP mail.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold rounded-lg text-xs font-bold transition-all"
                      >
                        Send Test OTP Email
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 rounded-xl p-4 mt-3 flex items-start gap-3">
                    <span className="text-base">⚠️</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Security Warning</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Without 2FA enabled, your account remains vulnerable to standard password-guessing and session-sniffing scripts. We strongly recommend sliding the toggle active.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-3">Delete your account and all associated data. This action is irreversible.</p>
            <button onClick={handleDeleteAccount} className="w-full py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
