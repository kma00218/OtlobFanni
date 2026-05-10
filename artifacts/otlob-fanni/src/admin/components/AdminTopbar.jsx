import { Menu, Bell, LogOut } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { useLocation } from 'wouter'

const pageTitles = {
  '/admin/dashboard': 'لوحة التحكم',
  '/admin/technicians': 'إدارة الفنيين',
  '/admin/categories': 'إدارة التخصصات',
  '/admin/cities': 'إدارة المدن',
  '/admin/requests': 'إدارة الطلبات',
  '/admin/ads': 'إدارة الإعلانات',
  '/admin/users': 'إدارة المستخدمين',
  '/admin/settings': 'الإعدادات',
  '/admin/logs': 'سجل النشاط',
}

export default function AdminTopbar({ onMenuClick, currentPath }) {
  const { admin, isSuperAdmin, signOut } = useAdmin()
  const profile = admin ? { full_name: admin.name } : null
  const [, navigate] = useLocation()
  const title = pageTitles[currentPath] || 'لوحة التحكم'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-10">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-[#071B33] font-bold text-lg flex-1">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications placeholder */}
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 relative transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2 bg-[#F7F8FA] px-3 py-1.5 rounded-lg">
          <div className="w-6 h-6 bg-[#FF7900] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {profile?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-[#071B33] leading-none">{profile?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-gray-400">{isSuperAdmin ? 'Super Admin' : 'Sub Admin'}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut()
            navigate('/admin/login')
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#071B33] hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          خروج
        </button>
      </div>
    </header>
  )
}
