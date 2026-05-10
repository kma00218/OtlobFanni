import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AdminContext = createContext(null)

const SESSION_KEY = 'adminSession'

const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
const saveSession = (s) => {
  try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY) } catch {}
}

export function AdminProvider({ children }) {
  const [admin,   setAdmin]   = useState(loadSession)
  const [loading, setLoading] = useState(false)

  const isLoggedIn    = !!admin
  const isSuperAdmin  = admin?.role === 'super_admin'
  const isSubAdmin    = admin?.role === 'sub_admin'
  const isAdmin       = isSuperAdmin || isSubAdmin

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const result = await api.admin.login(email, password)
      setAdmin(result)
      saveSession(result)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setAdmin(null)
    saveSession(null)
  }

  const logActivity = () => {}

  return (
    <AdminContext.Provider value={{
      user:     admin ? { id: admin.id } : null,
      profile:  admin ? { full_name: admin.name, role: admin.role, is_active: admin.isActive } : null,
      admin,
      loading,
      isLoggedIn,
      isSuperAdmin,
      isSubAdmin,
      isAdmin,
      isDemoMode: false,
      cityId: null,
      signIn,
      signOut,
      logActivity,
      activateDemo: () => {},
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
