import { useState, useEffect } from 'react'
import { Switch, Route, useLocation } from 'wouter'
import AdminSidebar from './components/AdminSidebar'
import AdminTopbar from './components/AdminTopbar'
import ProtectedAdminRoute from './ProtectedAdminRoute'
import { useAdmin } from '../context/AdminContext'
import Dashboard from './pages/Dashboard'
import Technicians from './pages/Technicians'
import Categories from './pages/Categories'
import Cities from './pages/Cities'
import Requests from './pages/Requests'
import Ads from './pages/Ads'
import AdminUsers from './pages/AdminUsers'
import Settings from './pages/Settings'
import ActivityLogs from './pages/ActivityLogs'
import JoinRequests from './pages/JoinRequests'
import { Shield } from 'lucide-react'

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">غير مصرح</h2>
        <p className="text-gray-500 text-sm">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    </div>
  )
}

function RedirectToDashboard() {
  const [, navigate] = useLocation()
  useEffect(() => {
    navigate('/admin/dashboard')
  }, [])
  return null
}

function AdminRoutes() {
  const { isSuperAdmin } = useAdmin()

  return (
    <Switch>
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/technicians" component={Technicians} />
      <Route path="/admin/requests" component={Requests} />
      <Route path="/admin/categories">
        {isSuperAdmin ? <Categories /> : <AccessDenied />}
      </Route>
      <Route path="/admin/cities">
        {isSuperAdmin ? <Cities /> : <AccessDenied />}
      </Route>
      <Route path="/admin/ads">
        {isSuperAdmin ? <Ads /> : <AccessDenied />}
      </Route>
      <Route path="/admin/users">
        {isSuperAdmin ? <AdminUsers /> : <AccessDenied />}
      </Route>
      <Route path="/admin/settings">
        {isSuperAdmin ? <Settings /> : <AccessDenied />}
      </Route>
      <Route path="/admin/join-requests" component={JoinRequests} />
      <Route path="/admin/logs">
        {isSuperAdmin ? <ActivityLogs /> : <AccessDenied />}
      </Route>
      <Route path="/admin" component={RedirectToDashboard} />
      <Route component={RedirectToDashboard} />
    </Switch>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [location] = useLocation()

  return (
    <ProtectedAdminRoute>
      <div className="flex h-screen bg-[#F7F8FA] overflow-hidden" dir="rtl">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} currentPath={location} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <AdminRoutes />
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  )
}
