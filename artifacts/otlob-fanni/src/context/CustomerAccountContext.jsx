import { createContext, useContext, useState } from 'react'
import api from '../lib/api'

const CustomerAccountContext = createContext(null)

const SESSION_KEY = 'otlobCustomerSession'

const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
const saveSession = (s) => {
  try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY) } catch {}
}

export function CustomerAccountProvider({ children }) {
  const [account, setAccount] = useState(loadSession)
  const [loading, setLoading] = useState(false)

  const isLoggedIn = !!account

  const register = async (data) => {
    setLoading(true)
    try {
      const result = await api.customerAccounts.register(data)
      setAccount(result)
      saveSession(result)
      return result
    } finally {
      setLoading(false)
    }
  }

  const login = async (data) => {
    setLoading(true)
    try {
      const result = await api.customerAccounts.login(data)
      setAccount(result)
      saveSession(result)
      return result
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAccount(null)
    saveSession(null)
  }

  return (
    <CustomerAccountContext.Provider value={{ account, isLoggedIn, loading, register, login, logout }}>
      {children}
    </CustomerAccountContext.Provider>
  )
}

export function useCustomerAccount() {
  const ctx = useContext(CustomerAccountContext)
  if (!ctx) throw new Error('useCustomerAccount must be used within CustomerAccountProvider')
  return ctx
}
