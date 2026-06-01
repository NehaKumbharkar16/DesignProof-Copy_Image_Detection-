import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ShoppingBag, Radio, ShieldAlert,
  FileText, CreditCard, Settings, Users, Layers,
  FileBox, Activity, Menu, Zap
} from 'lucide-react'

export default function Sidebar() {
  const { user, sidebarOpen, setSidebarOpen } = useAuth()

  const linkClass = ({ isActive }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
    ${isActive
      ? 'bg-brand-forest text-white shadow-md dark:bg-brand-gold dark:text-white'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white'
    }
  `

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-[80px] h-screen md:h-[calc(100vh-96px)] overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          w-64 z-40 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="p-6">
          {/* Logo for mobile sidebar header if needed, but usually header covers this. 
               We'll add a title or spacing here. */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Menu</div>

          <nav className="space-y-1">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              <ShoppingBag size={20} />
              <span className="font-medium">Products</span>
            </NavLink>
            <NavLink to="/monitoring" className={linkClass}>
              <Radio size={20} />
              <span className="font-medium">Monitoring</span>
            </NavLink>
            <NavLink to="/matches" className={linkClass}>
              <ShieldAlert size={20} />
              <span className="font-medium">Matches</span>
            </NavLink>
            <NavLink to="/takedowns" className={linkClass}>
              <FileBox size={20} />
              <span className="font-medium">Takedowns</span>
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              <FileText size={20} />
              <span className="font-medium">Reports</span>
            </NavLink>
          </nav>

          <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account</div>
          <nav className="space-y-1">
            <NavLink to="/subscription" className={linkClass}>
              <CreditCard size={20} />
              <span className="font-medium">Subscription</span>
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </NavLink>
          </nav>

          {user?.isAdmin && (
            <>
              <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Admin</div>
              <nav className="space-y-1">
                <NavLink to="/admin" className={linkClass} end>
                  <Activity size={20} />
                  <span className="font-medium">Overview</span>
                </NavLink>
                <NavLink to="/admin/clients" className={linkClass}>
                  <Users size={20} />
                  <span className="font-medium">Clients</span>
                </NavLink>
                <NavLink to="/admin/plans" className={linkClass}>
                  <Layers size={20} />
                  <span className="font-medium">Plans</span>
                </NavLink>
                <NavLink to="/admin/templates" className={linkClass}>
                  <FileText size={20} />
                  <span className="font-medium">Templates</span>
                </NavLink>
                <NavLink to="/admin/integrations" className={linkClass}>
                  <Zap size={20} />
                  <span className="font-medium">Integrations</span>
                </NavLink>
                <NavLink to="/admin/audit-logs" className={linkClass}>
                  <FileBox size={20} />
                  <span className="font-medium">Audit Logs</span>
                </NavLink>
              </nav>
            </>
          )}
        </div>

        {/* Sidebar Footer (Optional) */}
        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-gradient-to-r from-brand-navy to-brand-forest rounded-xl p-4 text-white text-center shadow-lg">
            <p className="text-xs font-medium opacity-80 mb-1">Protection Status</p>
            <p className="text-lg font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Active
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
