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
import TechnicianApplications from './pages/TechnicianApplications'
import CompanyApplications from './pages/CompanyApplications'
import Companies from './pages/Companies'
import AdRequests from './pages/AdRequests'
import AdminSearch from './pages/AdminSearch'
import PostGenerator from './pages/PostGenerator'
import SupplierApplications from './pages/SupplierApplications'
import AdminSuppliers from './pages/AdminSuppliers'
import UpdateReports from './pages/UpdateReports'
import { Shield } from 'lucide-react'

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 bg-red-50 border border-red-100">
          <Shield className="w-9 h-9 text-red-400" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">غير مصرح</h2>
        <p className="text-slate-500 text-sm">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    </div>
  )
}

function RedirectToDashboard() {
  const [, navigate] = useLocation()
  useEffect(() => { navigate('/admin/dashboard') }, [])
  return null
}

function AdminRoutes() {
  const { isSuperAdmin } = useAdmin()
  return (
    <Switch>
      <Route path="/admin/dashboard"               component={Dashboard} />
      <Route path="/admin/technicians"             component={Technicians} />
      <Route path="/admin/companies"               component={Companies} />
      <Route path="/admin/requests"                component={Requests} />
      <Route path="/admin/technician-applications" component={TechnicianApplications} />
      <Route path="/admin/company-applications"    component={CompanyApplications} />
      <Route path="/admin/ad-requests"             component={AdRequests} />
      <Route path="/admin/supplier-applications"   component={SupplierApplications} />
      <Route path="/admin/suppliers"               component={AdminSuppliers} />
      <Route path="/admin/update-reports"          component={UpdateReports} />
      <Route path="/admin/search"                  component={AdminSearch} />
      <Route path="/admin/poster"                  component={PostGenerator} />
      <Route path="/admin/categories">{isSuperAdmin ? <Categories /> : <AccessDenied />}</Route>
      <Route path="/admin/cities">    {isSuperAdmin ? <Cities />     : <AccessDenied />}</Route>
      <Route path="/admin/ads">       {isSuperAdmin ? <Ads />        : <AccessDenied />}</Route>
      <Route path="/admin/users">     {isSuperAdmin ? <AdminUsers /> : <AccessDenied />}</Route>
      <Route path="/admin/settings">  {isSuperAdmin ? <Settings />   : <AccessDenied />}</Route>
      <Route path="/admin/logs">      {isSuperAdmin ? <ActivityLogs /> : <AccessDenied />}</Route>
      <Route path="/admin"            component={RedirectToDashboard} />
      <Route                          component={RedirectToDashboard} />
    </Switch>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <ProtectedAdminRoute>
      <div className="flex h-screen overflow-hidden" style={{ background: '#E2E7EE' }} dir="rtl">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <AdminRoutes />
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  )
}
