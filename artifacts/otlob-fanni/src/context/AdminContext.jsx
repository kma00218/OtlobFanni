import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (authUser) => {
    if (!authUser || !supabase) return null
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    return data
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await loadProfile(session.user)
        setProfile(p)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await loadProfile(session.user)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const p = await loadProfile(data.user)
    if (!p || !['super_admin', 'sub_admin'].includes(p.role) || !p.is_active) {
      await supabase.auth.signOut()
      throw new Error('غير مصرح لك بالدخول إلى لوحة التحكم')
    }
    setProfile(p)
    return { user: data.user, profile: p }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const logActivity = async (action, tableName, recordId, details) => {
    if (!supabase || !user) return
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId || null,
      details: details || null,
    })
  }

  const isSuperAdmin = profile?.role === 'super_admin'
  const isSubAdmin = profile?.role === 'sub_admin'
  const isAdmin = isSuperAdmin || isSubAdmin
  const cityId = profile?.city_id

  return (
    <AdminContext.Provider value={{
      user, profile, loading,
      isSuperAdmin, isSubAdmin, isAdmin,
      cityId,
      signIn, signOut, logActivity,
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
