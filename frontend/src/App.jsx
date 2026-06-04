import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Features from './pages/Features'
import HowItWorks from './pages/HowItWorks'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductUpload from './pages/ProductUpload'
import ProductDetail from './pages/ProductDetail'
import Detections from './pages/Detections'
import Takedowns from './pages/Takedowns'
import Auth from './pages/Auth'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Profile from './pages/Profile'
import Subscription from './pages/Subscription'
import Settings from './pages/Settings'
import VerifyOTP from './pages/VerifyOTP'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminPlans from './pages/admin/Plans'
import AdminTemplates from './pages/admin/Templates'
import AdminIntegrations from './pages/admin/Integrations'
import AdminAuditLogs from './pages/admin/AuditLogs'
import Monitoring from './pages/Monitoring'
import Matches from './pages/Matches'
import Reports from './pages/Reports'
import ScanHistory from './pages/ScanHistory'
import IPAuthority from './pages/IPAuthority'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <div id="app-root" className="min-h-screen bg-slate-50 dark:bg-brand-dark-footer text-slate-900 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <Header />

      <Routes>
        <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />

        <Route
          path="/*"
          element={
            <div className="w-full p-2 sm:p-4 flex flex-col md:flex-row gap-4 sm:gap-6 flex-1">
              <ProtectedRoute>
                <div className="flex w-full gap-6">
                  <Sidebar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/history" element={<ScanHistory />} />
                      <Route path="/products/upload" element={<ProductUpload />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/detections" element={<Detections />} />
                      <Route path="/takedowns" element={<Takedowns />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/authority" element={<IPAuthority />} />
                      <Route path="/monitoring" element={<Monitoring />} />
                      <Route path="/matches" element={<Matches />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/profile" element={<Profile />} />
                      {/* Admin Routes */}
                      <Route path="/admin/*" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Routes>
                            <Route index element={<AdminDashboard />} />
                            <Route path="clients" element={<AdminUsers />} />
                            <Route path="plans" element={<AdminPlans />} />
                            <Route path="templates" element={<AdminTemplates />} />
                            <Route path="integrations" element={<AdminIntegrations />} />
                            <Route path="audit-logs" element={<AdminAuditLogs />} />
                          </Routes>
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            </div>
          }
        />
      </Routes>

      <Footer />
    </div>
  )
}
