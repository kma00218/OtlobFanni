import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAdmin } from '../context/AdminContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedAdminRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAdmin()
  const [location, navigate] = useLocation()

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        navigate('/admin/login')
      } else if (!isAdmin || !profile.is_active) {
        navigate('/admin/login')
      }
    }
  }, [loading, user, profile, isAdmin, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF7900] animate-spin" />
          <p className="text-gray-500 text-sm">جاري التحقق...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !isAdmin || !profile.is_active) {
    return null
  }

  return children
}
