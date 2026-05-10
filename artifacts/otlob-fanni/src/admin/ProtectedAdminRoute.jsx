import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAdmin } from '../context/AdminContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedAdminRoute({ children }) {
  const { admin, isAdmin } = useAdmin()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!admin || !isAdmin) {
      navigate('/admin/login')
    }
  }, [admin, isAdmin, navigate])

  if (!admin || !isAdmin) return null

  return children
}
