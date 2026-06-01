import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const { updateUser } = useAuth()

  // Retrieve temporary email stored during login redirect
  const email = location.state?.email || localStorage.getItem('temp_2fa_email') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(300) // 5 minutes (300 seconds) countdown
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  // Redirect back to login if no email is found in state
  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please sign in again.')
      navigate('/login')
    }
  }, [email, navigate])

  // Countdown timer for code expiry
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle digit input traversal
  const handleChange = (index, value) => {
    if (isNaN(value)) return // Allow numbers only

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Store single digit only
    setOtp(newOtp)

    // Traverse forward to next box if filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  // Handle backspace traversal
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  // Handle pasted numeric string
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return toast.error('Please paste a valid 6-digit code')

    const digits = pastedData.split('')
    setOtp(digits)
    inputRefs.current[5].focus()
  }

  // Verify code
  const handleSubmit = async (e) => {
    e.preventDefault()
    const enteredOtp = otp.join('')
    if (enteredOtp.length < 6) return toast.error('Please enter all 6 digits')

    try {
      setLoading(true)
      const res = await api.post('/api/auth/verify-otp', { email, otp: enteredOtp })
      
      if (res.data?.status === 'success') {
        const { token, user: userData } = res.data
        localStorage.setItem('access_token', token)
        localStorage.removeItem('temp_2fa_email')
        
        // Update user auth context
        updateUser(userData)
        
        toast.success('Successfully logged in')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    try {
      setResendLoading(true)
      const res = await api.post('/api/auth/resend-otp', { email })
      if (res.data?.status === 'success') {
        toast.success('A new OTP passcode has been sent!')
        setOtp(['', '', '', '', '', ''])
        setTimer(300) // Reset to 5 minutes
        setCanResend(false)
        inputRefs.current[0].focus()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code')
      console.error(err)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-brand-dark-footer transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl animate-in fade-in duration-500">
        
        {/* Verification icon header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold mb-4 animate-bounce-slow">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Verify Your Identity</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            We have sent a 6-digit verification code to
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate max-w-full">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* OTP digit inputs */}
          <div className="flex justify-between gap-2 sm:gap-4" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[idx] = el)}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          {/* Code expiry warning */}
          <div className="text-center flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Expiration Time</span>
            <span className={`font-bold flex items-center gap-1 ${timer > 60 ? 'text-slate-600 dark:text-slate-300' : 'text-red-500 animate-pulse'}`}>
              <KeyRound size={12} />
              {timer > 0 ? formatTime(timer) : 'Expired'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all shadow-md shadow-brand-gold/10"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                'Verify & Authenticate'
              )}
            </button>

            {/* Resend trigger */}
            <button
              type="button"
              disabled={!canResend || resendLoading}
              onClick={handleResend}
              className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${canResend ? 'border-brand-gold text-brand-gold hover:bg-brand-gold/5' : 'border-slate-200 dark:border-slate-850 text-slate-350 dark:text-slate-600 cursor-not-allowed'}`}
            >
              {resendLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                'Resend Code'
              )}
            </button>
          </div>
        </form>

        {/* Back navigation */}
        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  )
}
