import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Github, Chrome, CheckSquare, Square, AlertCircle, Eye, EyeOff } from 'lucide-react'
import SocialLoginButtons from '../components/SocialLoginButtons'
import api from '../services/api'

export default function Auth() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, register } = useAuth() // Now using real context methods

    // Determine initial mode based on URL
    const initialMode = 
        location.pathname === '/register' ? 'register' : 
        location.pathname === '/forgot-password' ? 'forgot' : 
        'login'
    const [mode, setMode] = useState(initialMode)

    // Handle OAuth Callback Token
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const token = params.get('token')
        const errorParam = params.get('error')

        if (token) {
            localStorage.setItem('access_token', token)
            // Redirect to dashboard, the AuthProvider will pick up the token
            window.location.href = '/dashboard'
        }

        if (errorParam) {
            setError("Social login failed. Please try again.")
        }
    }, [location.search])

    // Prefill remember me credentials on mount
    useEffect(() => {
        const storedRememberMe = localStorage.getItem('dp_remember_me') === 'true'
        if (storedRememberMe) {
            setRememberMe(true)
            const storedEmail = localStorage.getItem('dp_remember_email')
            const storedPassword = localStorage.getItem('dp_remember_password')
            if (storedEmail) setEmail(storedEmail)
            if (storedPassword) setPassword(storedPassword)
        }
    }, [])

    // Update mode if URL changes (e.g. back button)
    useEffect(() => {
        setMode(
            location.pathname === '/register' ? 'register' : 
            location.pathname === '/forgot-password' ? 'forgot' : 
            'login'
        )
    }, [location.pathname])

    // Form State
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [forgotStep, setForgotStep] = useState(1) // 1 = email, 2 = OTP & password reset
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', ''])
    const otpRefs = useRef([])
    const [recoveryTimer, setRecoveryTimer] = useState(300) // 5 minutes
    const [canResendRecovery, setCanResendRecovery] = useState(false)

    // Visibility State
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // UI State
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Handle Tab Switch
    const switchMode = (newMode) => {
        setMode(newMode)
        let path = '/login'
        if (newMode === 'register') path = '/register'
        else if (newMode === 'forgot') path = '/forgot-password'
        navigate(path, { replace: true })
        setError('')
        setSuccess('')
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    // Recovery Timer Countdown Effect
    useEffect(() => {
        if (mode !== 'forgot' || forgotStep !== 2) return
        if (recoveryTimer <= 0) {
            setCanResendRecovery(true)
            return
        }
        const interval = setInterval(() => {
            setRecoveryTimer((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [recoveryTimer, mode, forgotStep])

    // Format recovery seconds into MM:SS
    const formatRecoveryTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    // Traversal Handlers for OTP 6-Digit input boxes
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return
        const newOtp = [...otpArray]
        newOtp[index] = value.slice(-1)
        setOtpArray(newOtp)
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').trim()
        if (!/^\d{6}$/.test(pastedData)) return setError('Please paste a valid 6-digit code')
        const digits = pastedData.split('')
        setOtpArray(digits)
        otpRefs.current[5]?.focus()
    }

    // Call backend to resend recovery OTP
    const handleResendRecovery = async () => {
        setError('')
        setSuccess('')
        setIsLoading(true)
        try {
            const res = await api.post('/api/auth/send-otp', { email, purpose: 'reset_password' })
            if (res.data?.status === 'success') {
                setSuccess('A new 6-digit verification code has been sent!')
                setOtpArray(['', '', '', '', '', ''])
                setRecoveryTimer(300)
                setCanResendRecovery(false)
                setTimeout(() => {
                    otpRefs.current[0]?.focus()
                }, 50)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend recovery code')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        try {
            if (mode === 'register') {
                // Validation
                if (password.length < 6) throw new Error("Password must be at least 6 characters.")
                if (password !== confirmPassword) throw new Error("Passwords do not match.")

                // Register Call
                await register(name, email, password)
                setSuccess("Account created successfully! Redirecting to login...")
                setTimeout(() => {
                    switchMode('login')
                }, 1500)
            } else if (mode === 'forgot') {
                if (forgotStep === 1) {
                    // Step 1: Request Password Reset OTP
                    const res = await api.post('/api/auth/forgot-password', { email })
                    if (res.data?.status === 'success') {
                        setSuccess(res.data.message || "OTP code sent to email successfully.")
                        setForgotStep(2)
                        setRecoveryTimer(300)
                        setCanResendRecovery(false)
                        setOtpArray(['', '', '', '', '', ''])
                    } else {
                        throw new Error(res.data?.message || "Failed to request password reset OTP.")
                    }
                } else {
                    // Step 2: Verify OTP and Reset Password
                    const enteredOtp = otpArray.join('')
                    if (enteredOtp.length !== 6) throw new Error("Please enter all 6 digits of the OTP code.")
                    if (password.length < 6) throw new Error("Password must be at least 6 characters.")
                    if (password !== confirmPassword) throw new Error("Passwords do not match.")

                    const res = await api.post('/api/auth/reset-password', { email, otp: enteredOtp, password })
                    if (res.data?.status === 'success') {
                        setSuccess(res.data.message || "Your password has been successfully reset!")
                        setTimeout(() => {
                            switchMode('login')
                            setForgotStep(1)
                            setOtpArray(['', '', '', '', '', ''])
                            setPassword('')
                            setConfirmPassword('')
                        }, 2000)
                    } else {
                        throw new Error(res.data?.message || "Failed to reset password.")
                    }
                }
            } else {
                // Login Call
                const res = await login(email, password, rememberMe)
                if (rememberMe) {
                    localStorage.setItem('dp_remember_me', 'true')
                    localStorage.setItem('dp_remember_email', email)
                    localStorage.setItem('dp_remember_password', password)
                } else {
                    localStorage.removeItem('dp_remember_me')
                    localStorage.removeItem('dp_remember_email')
                    localStorage.removeItem('dp_remember_password')
                }
                if (res?.status === '2fa_required') {
                    navigate('/verify-otp', { state: { email: res.email } })
                } else {
                    navigate('/dashboard')
                }
            }
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

            {/* Left Side - Hero / Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-brand-navy dark:bg-slate-950 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium text-brand-gold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                        </span>
                        AI-Powered Brand Protection
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Protect your <span className="text-brand-gold">Creative Assets</span> with Intelligence.
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        Join thousands of designers and brands using DesignProof to automatically detect and remove intellectual property infringements across the web.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="text-2xl font-bold text-white mb-1">99.8%</div>
                            <div className="text-sm text-slate-400">Detection Accuracy</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="text-2xl font-bold text-white mb-1">24/7</div>
                            <div className="text-sm text-slate-400">Automated Monitoring</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-full max-w-md space-y-8">



                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-2 animate-in fade-in duration-300">
                            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Password Recovery'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 min-h-[40px] flex items-center justify-center animate-in fade-in duration-300">
                            {mode === 'login' 
                                ? 'Enter your credentials to access your dashboard' 
                                : mode === 'register' 
                                ? 'Start your brand protection journey today' 
                                : forgotStep === 1 
                                ? 'Enter your email address to receive a secure recovery OTP code.' 
                                : 'Enter the 6-digit OTP code and set your new password.'}
                        </p>
                    </div>

                    {/* Toggle Switch */}
                    {(mode === 'login' || mode === 'register') && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex relative animate-in fade-in duration-300">
                            <div
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-md shadow-sm transition-all duration-300 ease-in-out ${mode === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                            ></div>
                            <button
                                onClick={() => switchMode('login')}
                                className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-300 ${mode === 'login' ? 'text-brand-navy dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => switchMode('register')}
                                className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-300 ${mode === 'register' ? 'text-brand-navy dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {(mode === 'login' || mode === 'register') && <SocialLoginButtons />}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                <CheckSquare size={18} />
                                {success}
                            </div>
                        )}

                        {(mode === 'login' || mode === 'register') && (
                            <>
                                {mode === 'register' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {mode === 'register' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {mode === 'forgot' && (
                            <>
                                {forgotStep === 1 ? (
                                    <div className="space-y-1 animate-in fade-in duration-300">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block text-center">
                                                Verification OTP Code
                                            </label>
                                            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                                                {otpArray.map((digit, idx) => (
                                                    <input
                                                        key={idx}
                                                        type="text"
                                                        maxLength="1"
                                                        value={digit}
                                                        ref={(el) => (otpRefs.current[idx] = el)}
                                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                        className="w-12 h-14 text-center text-xl font-bold border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-all shadow-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-slate-400 font-medium px-1">
                                            <span>Expiration Time</span>
                                            <span className={`font-bold flex items-center gap-1 ${recoveryTimer > 60 ? 'text-slate-600 dark:text-slate-350' : 'text-red-500 animate-pulse'}`}>
                                                {recoveryTimer > 0 ? formatRecoveryTime(recoveryTimer) : 'Expired'}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={!canResendRecovery || isLoading}
                                            onClick={handleResendRecovery}
                                            className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${canResendRecovery ? 'border-brand-gold text-brand-gold hover:bg-brand-gold/5 cursor-pointer' : 'border-slate-200 dark:border-slate-805 text-slate-350 dark:text-slate-600 cursor-not-allowed'}`}
                                        >
                                            Resend Code
                                        </button>

                                        <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all dark:text-white"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex items-center justify-between">
                            {mode === 'login' && (
                                <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white transition-colors">
                                    {rememberMe ? <CheckSquare size={18} className="text-brand-gold animate-in zoom-in-50 duration-200" /> : <Square size={18} />}
                                    Remember me
                                </button>
                            )}
                            {mode === 'login' && (
                                <button type="button" onClick={() => switchMode('forgot')} className="text-sm font-medium text-brand-gold hover:text-yellow-600 transition-colors">
                                    Forgot Password?
                                </button>
                            )}
                            {mode === 'forgot' && (
                                <button type="button" onClick={() => { switchMode('login'); setForgotStep(1); }} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white transition-colors">
                                    ← Back to Log In
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy hover:bg-brand-forest dark:bg-brand-gold dark:hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : forgotStep === 1 ? 'Send OTP Code' : 'Reset Password'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        By continuing, you agree to our <a href="#" className="underline hover:text-brand-navy dark:hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-brand-navy dark:hover:text-white">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
