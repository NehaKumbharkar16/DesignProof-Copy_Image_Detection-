import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api' // import the configured axios instance

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const res = await api.get('/api/auth/me')
          if (res.data?.status === 'success') {
            setUser(res.data.user)
          } else {
            localStorage.removeItem('access_token')
          }
        } catch (e) {
          console.error("Auth me Check Failed", e)
          localStorage.removeItem('access_token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password })
      if (res.data?.status === 'success') {
        const { user: userData, token } = res.data
        setUser(userData)
        localStorage.setItem('access_token', token)
        return userData
      } else {
        throw new Error(res.data?.message || 'Registration failed')
      }
    } catch (e) {
      throw new Error(e.response?.data?.message || e.message)
    }
  }

  const login = async (email, password, rememberMe) => {
    try {
      const res = await api.post('/api/auth/login', { email, password, rememberMe })
      if (res.data?.status === 'success') {
        const { user, token } = res.data
        setUser(user)
        localStorage.setItem('access_token', token)
        return { status: 'success', user }
      } else if (res.data?.status === '2fa_required') {
        localStorage.setItem('temp_2fa_email', res.data.email)
        return { status: '2fa_required', email: res.data.email }
      } else {
        throw new Error(res.data?.message || 'Login failed')
      }
    } catch (e) {
      throw new Error(e.response?.data?.message || e.message)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('access_token')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, sidebarOpen, setSidebarOpen, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

