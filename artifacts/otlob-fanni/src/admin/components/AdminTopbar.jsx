import { Menu, Bell, LogOut } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { useLocation } from 'wouter'

const pageTitles = {
  '/admin/dashboard':               'لوحة التحكم',
  '/admin/technicians':             'إدارة الفنيين',
  '/admin/technician-applications': 'طلبات الفنيين',
  '/admin/companies':               'إدارة الشركات',
  '/admin/company-applications':    'طلبات الشركات',
  '/admin/ad-requests':             'طلبات الإعلانات',
  '/admin/categories':              'إدارة التخصصات',
  '/admin/cities':                  'إدارة المدن',
  '/admin/requests':                'إدارة الطلبات',
  '/admin/ads':                     'إدارة الإعلانات',
  '/admin/users':                   'إدارة المستخدمين',
  '/admin/settings':                'الإعدادات',
  '/admin/logs':                    'سجل النشاط',
}

export default function AdminTopbar({ onMenuClick, currentPath }) {
  const { admin, isSuperAdmin, signOut } = useAdmin()
  const profile = admin ? { full_name: admin.name } : null
  const [, navigate] = useLocation()
  const title = pageTitles[currentPath] || 'لوحة التحكم'

  return (
    <header className="h-14 bg-[#0A0A14] border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-[#7070A0] hover:text-[#C0C0E0] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2.5 flex-1">
        <div className="w-1 h-5 bg-[#FF7900] rounded-full" />
        <h1 className="text-white font-bold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-white/5 rounded-lg text-[#555570] hover:text-[#9090B0] relative transition-colors">
          <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </button>

        <div className="flex items-center gap-2.5 bg-white/5 border border-white/8 px-3 py-1.5 rounded-lg">
          <div className="w-6 h-6 bg-[#FF7900] rounded-full flex items-center justify-center shadow-sm shadow-[#FF7900]/30">
            <span className="text-white text-xs font-bold">
              {profile?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#C0C0E0] leading-none">{profile?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-[#555570] mt-0.5">{isSuperAdmin ? 'Super Admin' : 'Sub Admin'}</p>
          </div>
        </div>

        <button
          onClick={async () => { await signOut(); navigate('/admin/login') }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#555570] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  )
}
