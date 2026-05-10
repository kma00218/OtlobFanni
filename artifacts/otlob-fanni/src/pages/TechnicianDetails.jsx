import { useEffect } from 'react'
import { useLocation } from 'wouter'

export default function TechnicianDetails() {
  const [, navigate] = useLocation()
  useEffect(() => { navigate('/') }, [])
  return null
}
