import React, { useState } from 'react'
import { Mail, MessageSquare, MapPin, Calendar, Upload, Clock, FileText, Video, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle, Shield, AlertCircle } from 'lucide-react'

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'Support',
    priority: 'Normal',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSent(true)
  }

  const contactCards = [
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: "Email Support",
      info: "support@designproof.ai",
      sub: "Response within 24 hrs",
      color: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-green-600" />,
      title: "Live Chat",
      info: "Chat with us",
      sub: "Mon–Fri, 9 AM – 6 PM IST",
      color: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: <MapPin className="w-6 h-6 text-purple-600" />,
      title: "Office Address",
      info: "Mumbai, India",
      sub: "DesignProof HQ",
      color: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: <Calendar className="w-6 h-6 text-brand-gold" />,
      title: "Book Demo",
      info: "Schedule a call",
      sub: "With a product expert",
      color: "bg-amber-50 dark:bg-amber-900/20"
    }
  ]

  const faqs = [
    { q: "What is the typical response time?", a: "We aim to respond to all inquiries within 12-24 hours during business days." },
    { q: "Do you offer phone support?", a: "Phone support is available for Enterprise plans. For other plans, we offer email and live chat support." },
    { q: "Where can I find tutorials?", a: "Check out our Help Center and Video Tutorials section for step-by-step guides on using DesignProof." },
    { q: "How do I report a bug?", a: "Please select 'Technical Support' in the subject dropdown and provide as much detail as possible, including screenshots." }
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">

      {/* Header */}
      <div className="bg-brand-navy text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Get in <span className="text-brand-gold">Touch</span></h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Have questions about DesignProof? Our team is here to help you protect your brand.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20">

        {/* Contact Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {contactCards.map((card, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className={`p-3 rounded-full mb-4 ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{card.title}</h3>
              <p className="text-brand-navy dark:text-brand-gold font-medium mb-1">{card.info}</p>
              <p className="text-xs text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6">Send us a Message</h2>

            {isSent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Thank you for contacting us. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-6 text-brand-navy dark:text-brand-gold font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                      placeholder="Acme Inc."
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none transition-all appearance-none"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option>General Support</option>
                        <option>Billing Question</option>
                        <option>Request a Demo</option>
                        <option>Technical Issue</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                  <div className="flex gap-4">
                    {['Low', 'Normal', 'High', 'Urgent'].map(p => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={formData.priority === p}
                          onChange={e => setFormData({ ...formData, priority: e.target.value })}
                          className="text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Attachments (Optional)</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="text-sm">Click to upload or drag and drop</span>
                    <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={14} />
                    We usually reply within 12-24 hours.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-navy hover:bg-brand-forest dark:bg-brand-gold dark:hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : (
                      <>
                        Send Message <Send size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Support Hours */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-brand-navy dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-brand-gold" /> Support Hours
              </h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-medium">9 AM – 6 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday – Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  * Emergency support available 24/7 for Enterprise customers.
                </div>
              </div>
            </div>

            {/* Help Center */}
            <div className="bg-brand-navy rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-bold mb-4 relative z-10">Before you contact us...</h3>
              <p className="text-sm text-slate-300 mb-6 relative z-10">
                Did you know that 85% of questions are answered in our help center?
              </p>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                  <HelpCircle size={18} className="text-brand-gold" />
                  <span className="text-sm font-medium">Help Center</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                  <FileText size={18} className="text-brand-gold" />
                  <span className="text-sm font-medium">Documentation</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                  <Video size={18} className="text-brand-gold" />
                  <span className="text-sm font-medium">Video Tutorials</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15081.654760460451!2d72.86873919830386!3d19.08955956038166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1709825456214!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>

          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-brand-navy dark:text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {faq.q}
                  {openFaq === index ? <ChevronUp size={20} className="text-brand-gold" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">Still have questions?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Our team is ready to help you protect your brand.</p>
          <button className="bg-brand-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:-translate-y-1 transition-transform">
            Book a Demo
          </button>
        </div>

      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 bg-brand-navy hover:bg-brand-forest text-white p-4 rounded-full shadow-2xl z-50 transition-all hover:scale-110 flex items-center gap-2 group">
        <MessageSquare size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium whitespace-nowrap">Chat with us</span>
      </button>

    </div>
  )
}
