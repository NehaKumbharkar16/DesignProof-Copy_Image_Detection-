import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Info, Shield, CreditCard, Lock, Star, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Pricing() {
  const { user } = useAuth()
  const [isYearly, setIsYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      price: 0,
      description: "Perfect for individuals just starting out.",
      features: [
        { name: "50 credits/month", included: true },
        { name: "Weekly monitoring", included: true },
        { name: "Basic reverse image search", included: true },
        { name: "Legal takedown support", included: false },
        { name: "Real-time alerts", included: false },
        { name: "API Access", included: false },
      ],
      buttonText: "Start for Free",
      buttonVariant: "outline",
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 49,
      description: "Best for growing brands and agencies.",
      features: [
        { name: "500 credits/month", included: true },
        { name: "Daily monitoring", included: true },
        { name: "AI infringement detection", included: true },
        { name: "Legal notice templates", included: true },
        { name: "Email alerts", included: true },
        { name: "Priority Support", included: true },
      ],
      buttonText: "Get Started",
      buttonVariant: "primary",
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: "For large organizations with high volume.",
      features: [
        { name: "2000+ credits", included: true },
        { name: "Real-time monitoring", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Priority takedown support", included: true },
        { name: "API access", included: true },
        { name: "Custom integrations", included: true },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false
    }
  ]

  const faqs = [
    { q: "What happens when credits finish?", a: "If you run out of credits, monitoring will pause until the next billing cycle. You can always upgrade your plan or purchase a credit top-up pack instantly." },
    { q: "Can I upgrade or downgrade anytime?", a: "Yes/! You can change your plan at any time. Prorated charges will apply automatically for upgrades." },
    { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee if you're not satisfied with our service, no questions asked." },
    { q: "What counts as a 'credit'?", a: "One credit equals one image scan or one URL check against our database. Monitoring a single design daily uses about 30 credits per month." },
    { q: "Is there a free trial?", a: "Yes! Our Free Starter plan is yours forever, with 50 credits refreshed every month." }
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Hero Section */}
      <div className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy dark:text-white mb-6">
          Simple, Transparent <span className="text-brand-gold">Pricing</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
          Protect your creative work without breaking the bank. Choose the plan that fits your needs.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-brand-navy dark:text-white' : 'text-slate-500'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-8 bg-brand-navy dark:bg-slate-700 rounded-full p-1 relative transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 ${isYearly ? 'text-brand-navy dark:text-white' : 'text-slate-500'}`}>
            Yearly <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">-20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl p-8 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group
                ${plan.popular ? 'border-brand-gold shadow-lg ring-1 ring-brand-gold/20' : 'border-slate-200 dark:border-slate-800 shadow-sm'}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-white px-4 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                  <Star size={14} fill="currentColor" /> Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-4xl font-bold text-brand-navy dark:text-white">
                        ${isYearly ? Math.round(plan.price * 0.8) : plan.price}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">/mo</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-brand-navy dark:text-white">{plan.price}</span>
                  )}
                </div>
                {isYearly && typeof plan.price === 'number' && plan.price > 0 && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Billed ${Math.round(plan.price * 0.8) * 12} yearly
                  </div>
                )}
              </div>

              {user ? (
                <Link
                  to={plan.id === 'enterprise' ? '/contact' : `/subscription?plan=${plan.name} Plan&cycle=${isYearly ? 'annual' : 'monthly'}`}
                  className={`w-full block text-center py-3 rounded-xl font-bold transition-all duration-200 mb-8
                    ${user?.subscription_plan?.split(' ')[0] === plan.name.split(' ')[0]
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                      : plan.buttonVariant === 'primary'
                        ? 'bg-brand-navy hover:bg-brand-forest text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {user?.subscription_plan?.split(' ')[0] === plan.name.split(' ')[0] ? 'Current Plan' : 'Select Plan'}
                </Link>
              ) : (
                <Link
                  to={plan.id === 'enterprise' ? '/contact' : '/register'}
                  className={`w-full block text-center py-3 rounded-xl font-bold transition-all duration-200 mb-8
                    ${plan.buttonVariant === 'primary'
                      ? 'bg-brand-navy hover:bg-brand-forest text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}
                  `}
                >
                  {plan.buttonText}
                </Link>
              )}

              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                  KEY FEATURES
                  <div className="group relative">
                    <Info size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Features update automatically with your plan.
                    </div>
                  </div>
                </div>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 p-0.5 rounded-full">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="mt-0.5 text-slate-300 dark:text-slate-600 p-0.5">
                        <X size={14} />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 line-through decoration-slate-300'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Elements */}
      <div className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Lock size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white">Secure Payment</h4>
            <p className="text-xs text-slate-500">256-bit SSL Encryption</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
              <CreditCard size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white">Cancel Anytime</h4>
            <p className="text-xs text-slate-500">No long-term contracts</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
              <Check size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white">No Hidden Fees</h4>
            <p className="text-xs text-slate-500">Transparent pricing</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
              <Star size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white">Trusted Brand</h4>
            <p className="text-xs text-slate-500">Used by 100+ Companies</p>
          </div>
        </div>
      </div>

      {/* ROI Section */}
      <div className="py-20 px-6 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-gold font-bold text-sm mb-6">
            <Zap size={16} fill="currentColor" /> HIGH ROI
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Brands lose <span className="text-brand-gold">$50K+ yearly</span> to design theft.</h2>
          <p className="text-xl text-slate-300 mb-10">
            Protect your intellectual property for less than the cost of a coffee a day.
            Don't let copycats dilute your brand value.
          </p>
          <button className="bg-brand-gold hover:bg-yellow-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Start Protecting Now
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-brand-navy dark:text-white mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 dark:text-white"
              >
                {faq.q}
                {openFaq === index ? <ChevronUp size={20} className="text-brand-gold" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              <div
                className={`px-5 text-slate-600 dark:text-slate-400 overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-10 md:p-16 text-center border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-brand-navy dark:text-white mb-4">Still not sure?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Talk to our experts to see how DesignProof can help protect your specific brand assets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-brand-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Book a Demo
            </Link>
            <Link to="/register" className="px-8 py-3 bg-brand-navy text-white rounded-lg font-semibold hover:bg-brand-forest transition-colors shadow-lg flex items-center gap-2">
              Get Started for Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
