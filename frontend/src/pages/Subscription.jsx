import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Check, Zap, ArrowRight, Plus, Download, History, Calendar, RefreshCw, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Subscription() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' or 'annual'
  const [loading, setLoading] = useState(false)
  const [activePlan, setActivePlan] = useState('Free') // Free, Growth, Enterprise
  const [planStatus, setPlanStatus] = useState('active') // 'active', 'canceled'
  const [expiryDate, setExpiryDate] = useState(null)
  const [transactions, setTransactions] = useState([])

  // Sandbox Payment simulation states
  const [showSandboxModal, setShowSandboxModal] = useState(false)
  const [sandboxOrderDetails, setSandboxOrderDetails] = useState(null)
  const [sandboxMethod, setSandboxMethod] = useState('card') // 'card', 'upi', 'netbanking', 'wallet'
  const [sandboxCardName, setSandboxCardName] = useState('')
  const [sandboxCardNumber, setSandboxCardNumber] = useState('')
  const [sandboxCardExpiry, setSandboxCardExpiry] = useState('')
  const [sandboxCardCVV, setSandboxCardCVV] = useState('')
  const [sandboxUpiId, setSandboxUpiId] = useState('')
  const [sandboxBank, setSandboxBank] = useState('hdfc')
  const [sandboxWallet, setSandboxWallet] = useState('paytm')


  const plans = [
    {
      name: 'Free Starter',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal for small creators testing design protection.',
      features: [
        '5 automated scans per month',
        'Web and Domain scanning',
        'Email matches summary',
        'Basic reverse image search'
      ],
      icon: <CreditCard className="text-slate-400" size={24} />,
      badge: 'Starter'
    },
    {
      name: 'Growth Plan',
      priceMonthly: 5999, // ₹5,999/mo (in INR)
      priceAnnual: 4166,  // ₹49,999/yr (~₹4,166/mo)
      description: 'Perfect for active indie designers and growing retail brands.',
      features: [
        '150 automated scans per month',
        'Shopify & Marketplace monitoring',
        'AI modified copy detection',
        'Automated DMCA takedowns (5/mo)',
        'Priority email support'
      ],
      icon: <Zap className="text-brand-gold animate-pulse" size={24} />,
      badge: 'Most Popular',
      popular: true
    },
    {
      name: 'Enterprise Scale',
      priceMonthly: 19999, // ₹19,999/mo
      priceAnnual: 14166,  // ₹169,999/yr
      description: 'Tailored for agencies and established fashion houses.',
      features: [
        'Unlimited automated scans',
        'Full social media & ad library crawler',
        'Automated DMCA takedowns (Unlimited)',
        'Dedicated IP attorney consultation',
        'REST API & Webhooks access',
        'Custom integration setup'
      ],
      icon: <Zap className="text-blue-500" size={24} />,
      badge: 'Ultimate Protection'
    }
  ]

  // Dynamically inject Razorpay Checkout Script on mount
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Sync active user states
  useEffect(() => {
    if (user) {
      setActivePlan(user.subscription_plan?.split(' ')[0] || 'Free')
      setPlanStatus(user.subscription_status || 'active')
      setExpiryDate(user.expiry_date)
    }
  }, [user])

  // Fetch actual transaction logs on load
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/subscriptions/transactions')
      if (res.data?.status === 'success') {
        setTransactions(res.data.transactions || [])
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Parse pricing page redirection queries
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const queryPlan = searchParams.get('plan')
    const queryCycle = searchParams.get('cycle') || 'monthly'

    if (queryPlan) {
      setBillingCycle(queryCycle)
      // Allow slight delay for Razorpay script compilation
      const timer = setTimeout(() => {
        handleUpgrade(queryPlan, queryCycle)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [location.search])

  const handleUpgrade = async (planName, selectedCycle = billingCycle) => {
    try {
      setLoading(true)
      
      // Step 1: Create Order on Backend
      const orderRes = await api.post('/api/subscriptions/create-order', {
        planName,
        cycle: selectedCycle
      })

      if (orderRes.data?.status === 'success') {
        // Handle immediate Free Plan switches (requires no payment processing)
        if (orderRes.data.freeUpgrade) {
          toast.success(`Successfully switched to the Free Starter plan!`)
          updateUser(orderRes.data.user)
          setLoading(false)
          // Clean up search query if present
          if (location.search) navigate('/subscription', { replace: true })
          return
        }

        const { order_id, amount, currency, key_id } = orderRes.data
        const isMockKey = !key_id || key_id.includes('mock');

        // Step 2: Open Secure Razorpay Popup OR Sandbox Portal
        if (window.Razorpay && !isMockKey) {
          const options = {
            key: key_id,
            amount: amount,
            currency: currency || 'INR',
            name: 'DesignProof Security',
            description: `Subscription Upgrade: ${planName}`,
            order_id: order_id,
            handler: async function (response) {
              try {
                setLoading(true)
                toast.loading('Verifying transaction signature...', { id: 'verify-payment-toast' })

                // Step 3: Verify Payment Signature on Backend
                const verifyRes = await api.post('/api/subscriptions/verify-payment', {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  planName,
                  cycle: selectedCycle
                })

                if (verifyRes.data?.status === 'success') {
                  toast.success('Billing confirmed! Subscription activated.', { id: 'verify-payment-toast' })
                  updateUser(verifyRes.data.user)
                  fetchTransactions()
                  if (location.search) navigate('/subscription', { replace: true })
                }
              } catch (err) {
                toast.error(err.response?.data?.message || 'Payment signature verification failed.', { id: 'verify-payment-toast' })
                console.error(err)
              } finally {
                setLoading(false)
              }
            },
            prefill: {
              name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.name || '',
              email: user?.email || ''
            },
            theme: {
              color: '#d97706' // Brand Accent (Amber-Gold)
            },
            modal: {
              ondismiss: function () {
                setLoading(false)
                toast.error('Payment checkout dismissed.')
              }
            }
          }
          const rzp = new window.Razorpay(options)
          rzp.open()
        } else {
          // Open Sandbox Modal
          setSandboxOrderDetails({
            order_id,
            amount,
            currency: currency || 'INR',
            planName,
            cycle: selectedCycle,
            key_id
          });
          setShowSandboxModal(true);
          setLoading(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment order.')
      console.error(err)
      setLoading(false)
    }
  }

  const handleSandboxPayment = async (simulateSuccess) => {
    if (!sandboxOrderDetails) return;
    
    setLoading(true);
    setShowSandboxModal(false);
    
    if (!simulateSuccess) {
      toast.error('Sandbox payment simulation declined.');
      setLoading(false);
      return;
    }
    
    // Simulate successful checkout completion only, without permanently upgrading the plan in the database or showing confirmation messages
    toast.success('Sandbox checkout simulation completed successfully! (No active subscription was upgraded)', {
      duration: 6000
    });
    
    setLoading(false);
  }



  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your active subscription? You will lose premium protection scans.')) return

    try {
      setLoading(true)
      const res = await api.post('/api/subscriptions/cancel')
      if (res.data?.status === 'success') {
        toast.success('Your subscription has been canceled.')
        updateUser(res.data.user)
      }
    } catch (err) {
      toast.error('Failed to cancel subscription.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = (inv) => {
    toast.loading(`Generating PDF receipt for transaction ${inv.id}...`, { id: 'invoice-toast' });
    
    setTimeout(() => {
      const receiptWindow = window.open('', '_blank');
      if (!receiptWindow) {
        toast.error('Pop-up blocked! Please allow pop-ups to download the invoice.', { id: 'invoice-toast' });
        return;
      }
      
      const invoiceDate = new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const invoiceNum = inv.id;
      const amountStr = inv.amount;
      const statusText = inv.status;
      const clientEmail = user?.email || "billing-client@designproof.ai";
      const clientName = `${user?.first_name || "Valued"} ${user?.last_name || "Customer"}`;
      
      // Determine the plan based on amount
      let detectedPlan = "Starter Protection Plan";
      if (amountStr.includes("2,999") || amountStr.includes("2999")) {
        detectedPlan = "Growth Protection Plan (Monthly)";
      } else if (amountStr.includes("29,990") || amountStr.includes("29990")) {
        detectedPlan = "Growth Protection Plan (Annual)";
      } else if (amountStr.includes("9,999") || amountStr.includes("9999")) {
        detectedPlan = "Enterprise Scale Plan (Monthly)";
      } else if (amountStr.includes("99,990") || amountStr.includes("99990")) {
        detectedPlan = "Enterprise Scale Plan (Annual)";
      } else if (amountStr.includes("5,999") || amountStr.includes("5999")) {
        detectedPlan = "Growth Plan Protection";
      }

      // Inject beautifully styled HTML Invoice
      receiptWindow.document.write(`
        <html>
          <head>
            <title>DesignProof_Invoice_${invoiceNum}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; background-color: #fafafa; }
              .invoice-container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 50px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 25px; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
              .logo span { color: #d97706; }
              .title { font-size: 14px; text-transform: uppercase; font-weight: 800; color: #d97706; letter-spacing: 2px; }
              
              .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .info-block h4 { margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1.5px; font-weight: 700; }
              .info-block p { margin: 0; font-size: 14px; color: #334155; font-weight: 500; }
              .info-block strong { color: #0f172a; font-weight: 700; }
              
              .table-section { margin-bottom: 40px; }
              table { width: 100%; border-collapse: collapse; }
              th { background: #f8fafc; padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
              td { padding: 15px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: #475569; }
              
              .total-block { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
              .total-row { display: flex; justify-content: space-between; width: 300px; margin-bottom: 8px; font-size: 13px; color: #64748b; }
              .total-row.grand { font-size: 20px; font-weight: 900; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 5px; }
              .total-row.grand span { color: #d97706; }
              
              .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
              .badge.paid { color: #16a34a; background: #dcfce7; }
              .badge.pending { color: #d97706; background: #fef3c7; }
              .badge.failed { color: #ef4444; background: #fee2e2; }
              
              .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
              
              @media print {
                body { background-color: #ffffff; padding: 0; }
                .invoice-container { box-shadow: none; border: none; padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <div class="logo">Design<span>Proof</span></div>
                <div>
                  <span class="badge ${statusText === 'Paid' ? 'paid' : statusText === 'Pending' ? 'pending' : 'failed'}">${statusText}</span>
                  <div class="title" style="margin-top: 10px; text-align: right;">Receipt Statement</div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-block">
                  <h4>Billing From</h4>
                  <p><strong>DesignProof Security Inc.</strong></p>
                  <p>12th Floor, Cyber Heights Towers</p>
                  <p>Financial District, Hyderabad - 500032</p>
                  <p>Support: billing@designproof.ai</p>
                </div>
                <div class="info-block" style="text-align: right;">
                  <h4>Billing To</h4>
                  <p><strong>${clientName}</strong></p>
                  <p>${clientEmail}</p>
                  <p style="margin-top: 15px;"></p>
                  <p><strong>Invoice ID:</strong> ${invoiceNum}</p>
                  <p><strong>Date of Issue:</strong> ${invoiceDate}</p>
                </div>
              </div>
              
              <div class="table-section">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 60%;">Description</th>
                      <th style="width: 20%; text-align: right;">Billing Cycle</th>
                      <th style="width: 20%; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>${detectedPlan}</strong><br>
                        <span style="font-size: 11px; color: #94a3b8;">High-speed automated IP infringement scanning, direct-copy detection engine access, automatic takedown generation, and secure DMCA email notice dispatch.</span>
                      </td>
                      <td style="text-align: right; text-transform: capitalize;">${detectedPlan.toLowerCase().includes('annual') ? 'Annual' : 'Monthly'}</td>
                      <td style="text-align: right; font-weight: 700; color: #0f172a;">${amountStr}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="total-block">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>${amountStr}</span>
                </div>
                <div class="total-row">
                  <span>Tax (0% GST / CGST)</span>
                  <span>₹0.00</span>
                </div>
                <div class="total-row grand">
                  <span>Total Paid</span>
                  <span>${amountStr}</span>
                </div>
              </div>
              
              <div class="footer">
                Thank you for subscribing to DesignProof! We secure your digital designs round the clock.<br>
                This is a computer-generated transaction receipt. No signature is required.
              </div>
            </div>
            
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      toast.success('Invoice receipt PDF prepared successfully!', { id: 'invoice-toast' });
    }, 1200);
  };

  // Helper: display the primary masked card/method based on transaction logs
  const getMaskedMethod = () => {
    if (transactions.length > 0 && planStatus === 'active' && activePlan !== 'Free') {
      return {
        card: 'Visa ending in 4242',
        expiry: 'Expires 12/2029 • Primary'
      }
    }
    return null
  }

  const paymentMethod = getMaskedMethod()

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <CreditCard className="text-brand-gold" />
            Subscription & Billing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage plans, credit balances, and download past receipts.</p>
        </div>
        
        {/* Billing period switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${billingCycle === 'annual' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            Annually
            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-1.5 py-0.5 rounded-full font-bold">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Main Billing Overview cards */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Current Plan Overview */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-brand-navy rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Plan</span>
                <h2 className="text-2xl font-black mt-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-brand-gold">{activePlan} Plan</h2>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${planStatus === 'active' ? 'bg-brand-gold text-white animate-pulse' : 'bg-red-600 text-white'}`}>
                {planStatus === 'active' ? 'Active Protection' : 'Canceled'}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 max-w-md">
              {activePlan === 'Free' ? (
                'Your brand is protected on the Free tier. Upgrade below to monitor full marketplaces.'
              ) : planStatus === 'canceled' ? (
                'Your subscription has been canceled. Your premium scanner remains active until expiration.'
              ) : (
                <>Your brand is secured. Next automatic invoice will be issued on <span className="font-semibold text-brand-gold">{expiryDate ? expiryDate.split('T')[0] : 'N/A'}</span> via saved payment method.</>
              )}
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-xs text-slate-400 font-medium">Plan Status Details</p>
              <p className="text-sm font-semibold mt-0.5 text-slate-300">
                {activePlan === 'Free' ? 'Free Forever' : `Expires/Renews: ${expiryDate ? expiryDate.split('T')[0] : 'N/A'}`}
              </p>
            </div>
            <div className="flex justify-start sm:justify-end gap-2 items-center">
              {activePlan !== 'Free' && planStatus === 'active' && (
                <button
                  disabled={loading}
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600/10 hover:bg-red-600/25 text-red-400 rounded-xl text-sm font-semibold transition-colors border border-red-500/20 flex items-center gap-1.5"
                >
                  <XCircle size={16} /> Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Protection Quota Indicator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-brand-gold animate-spin-slow" />
                Scan Credits
              </h3>
              <span className="text-xs text-brand-gold font-bold">Resets Monthly</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-3xl font-black text-slate-800 dark:text-white">
                    {activePlan === 'Free' ? '50' : activePlan === 'Growth' ? '500' : '2000'}
                  </span>
                  <span className="text-slate-400 text-sm ml-1">Credits Refresh</span>
                </div>
              </div>
              
              {/* Progress Bar placeholder */}
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-gold to-yellow-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
            One-time scanning consumes credits. Continuous scanning is covered by your plan level.
          </p>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Need higher protection limits?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Choose the protection level right for your catalog size.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((p, idx) => {
            const planShortName = p.name.split(' ')[0]
            const isActive = activePlan === planShortName
            const price = billingCycle === 'monthly' ? p.priceMonthly : p.priceAnnual

            return (
              <div 
                key={idx} 
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 flex flex-col justify-between relative transition-all duration-300 group hover:shadow-lg ${p.popular ? 'border-brand-gold shadow-md ring-1 ring-brand-gold' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {p.badge && (
                  <span className={`absolute -top-3.5 right-6 px-3 py-1 text-xs font-bold rounded-full text-white ${p.popular ? 'bg-brand-gold' : 'bg-slate-800 dark:bg-slate-700'}`}>
                    {p.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      {p.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400">{p.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-800 dark:text-white">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 text-sm font-medium"> / month</span>
                    {billingCycle === 'annual' && p.priceAnnual > 0 && (
                      <p className="text-xs text-green-500 font-bold mt-1">Billed annually (₹{(price * 12).toLocaleString('en-IN')}/yr)</p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex gap-2.5 items-start text-sm text-slate-600 dark:text-slate-400">
                        <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={loading || isActive}
                  onClick={() => handleUpgrade(p.name)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent' : p.popular ? 'bg-brand-gold text-white hover:bg-yellow-600 shadow-md shadow-brand-gold/10' : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {isActive ? 'Current Plan' : 'Select Plan'}
                  {!isActive && <ArrowRight size={16} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment methods & Invoice history */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-slate-400" />
              Saved Payment Methods
            </h3>
            {activePlan !== 'Free' ? (
              <span className="text-xs text-brand-gold font-bold">Managed via Gateway</span>
            ) : (
              <button onClick={() => handleUpgrade('Growth Plan')} className="text-xs text-brand-gold font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Payment Method
              </button>
            )}
          </div>

          <div className="space-y-4">
            {paymentMethod ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white font-black px-2.5 py-1 rounded text-sm italic">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{paymentMethod.card}</p>
                    <p className="text-xs text-slate-400">{paymentMethod.expiry}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">Active</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No saved payment methods on file. Subscribe to a premium plan to add your credentials securely.</p>
            )}
          </div>
        </div>

        {/* Invoice Log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            Transaction History & Invoices
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((inv, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors rounded px-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-350">{inv.id}</p>
                      <p className="text-xs text-slate-400">{inv.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{inv.amount}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{inv.status}</span>
                    <button onClick={() => handleDownloadInvoice(inv)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-brand-gold" title="Download Invoice Receipt">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No transaction logs recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* SECURE PAYMENT SANDBOX MODAL */}
      {showSandboxModal && sandboxOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[550px] shadow-2xl overflow-hidden text-white flex flex-col justify-between animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-gold/20 via-slate-900 to-slate-900 px-6 py-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white flex items-center gap-2">
                  <CreditCard className="text-brand-gold shrink-0" size={20} />
                  DesignProof Secure Payment Sandbox
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Mock gateway active because live API keys are not set</p>
              </div>
              <button 
                onClick={() => { setShowSandboxModal(false); toast.error('Payment checkout dismissed.'); }} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Order Info */}
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Upgrading to</span>
                  <h4 className="font-black text-white text-base mt-0.5">{sandboxOrderDetails.planName}</h4>
                  <p className="text-xs text-brand-gold font-semibold mt-0.5 capitalize">{sandboxOrderDetails.cycle} billing</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Billed</span>
                  <p className="text-2xl font-black text-brand-gold">₹{(sandboxOrderDetails.amount / 100).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">INR (Inc. Taxes)</p>
                </div>
              </div>

              {/* Payment Methods Selector Tabs */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {['card', 'upi', 'netbanking', 'wallet'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSandboxMethod(tab)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all capitalize ${sandboxMethod === tab ? 'bg-brand-gold text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {tab === 'netbanking' ? 'Net Banking' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="min-h-[170px] bg-slate-950/30 border border-slate-800 p-5 rounded-2xl">
                {sandboxMethod === 'card' && (
                  <div className="space-y-4">
                    {/* Visual Card Mockup */}
                    <div className="bg-gradient-to-br from-brand-gold to-yellow-600 rounded-2xl p-4 text-white shadow-md space-y-3 select-none">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold italic tracking-wider">DesignProof SECURE CARD</span>
                        <span className="bg-white/20 text-white font-black px-2 py-0.5 rounded text-[10px] italic">VISA</span>
                      </div>
                      <div className="text-lg font-mono tracking-widest py-1">
                        {sandboxCardNumber || '••••  ••••  ••••  4242'}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] uppercase text-yellow-100 font-semibold">Card Holder</p>
                          <p className="text-xs font-mono font-bold uppercase truncate max-w-[150px]">{sandboxCardName || 'John Doe'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase text-yellow-100 font-semibold">Expires</p>
                          <p className="text-xs font-mono font-bold">{sandboxCardExpiry || '12/29'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 1111 1111 4242"
                          maxLength={19}
                          value={sandboxCardNumber}
                          onChange={(e) => setSandboxCardNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm mt-1 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="12/29"
                          maxLength={5}
                          value={sandboxCardExpiry}
                          onChange={(e) => setSandboxCardExpiry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm mt-1 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CVV Code</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={sandboxCardCVV}
                          onChange={(e) => setSandboxCardCVV(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm mt-1 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={sandboxCardName}
                          onChange={(e) => setSandboxCardName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm mt-1 focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {sandboxMethod === 'upi' && (
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Enter your Virtual Payment Address (VPA) / UPI ID</label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        placeholder="success@paytm"
                        value={sandboxUpiId}
                        onChange={(e) => setSandboxUpiId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-20 py-2.5 text-sm focus:ring-1 focus:ring-brand-gold focus:border-brand-gold outline-none"
                      />
                      <button 
                        onClick={() => setSandboxUpiId('success@paytm')}
                        className="absolute right-1.5 top-1.5 px-3 py-1 bg-brand-gold/25 hover:bg-brand-gold/45 text-brand-gold text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Supported Apps</p>
                      <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-400 text-center">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                          <div key={app} className="p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-brand-gold hover:text-white transition-colors" onClick={() => setSandboxUpiId(`success@${app.toLowerCase().replace(' ', '')}`)}>
                            {app}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {sandboxMethod === 'netbanking' && (
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Select your Bank</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { id: 'hdfc', name: 'HDFC Bank' },
                        { id: 'icici', name: 'ICICI Bank' },
                        { id: 'sbi', name: 'State Bank of India' },
                        { id: 'axis', name: 'Axis Bank' }
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => setSandboxBank(bank.id)}
                          className={`p-3 text-xs font-bold rounded-xl text-left border transition-all ${sandboxBank === bank.id ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sandboxMethod === 'wallet' && (
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Select a Wallet</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { id: 'paytm', name: 'Paytm Wallet' },
                        { id: 'phonepe', name: 'PhonePe Wallet' },
                        { id: 'amazon', name: 'Amazon Pay' },
                        { id: 'mobikwik', name: 'MobiKwik' }
                      ].map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => setSandboxWallet(wallet.id)}
                          className={`p-3 text-xs font-bold rounded-xl text-left border transition-all ${sandboxWallet === wallet.id ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                        >
                          {wallet.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Warning/Guide message */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-[11px] text-slate-400 leading-relaxed space-y-1">
                <p className="font-bold text-amber-500 flex items-center gap-1.5">
                  <span>ℹ️</span> Sandbox Environment Notice
                </p>
                <p>This is a simulated secure check-out portal. No real transactions are executed, and no sensitive details are saved or sent over the network.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSandboxPayment(true)}
                className="flex-1 py-3 bg-brand-gold hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} /> Simulate Success
              </button>
              <button
                onClick={() => handleSandboxPayment(false)}
                className="py-3 px-4 bg-red-600/10 hover:bg-red-600/25 border border-red-500/20 text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                Simulate Failure
              </button>
              <button
                onClick={() => { setShowSandboxModal(false); toast.error('Payment checkout dismissed.'); }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

