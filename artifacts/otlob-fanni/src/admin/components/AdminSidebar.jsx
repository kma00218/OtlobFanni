import { useLocation, Link } from 'wouter'
import { useAdmin } from '../../context/AdminContext'
import {
  LayoutDashboard, Users, Wrench, MapPin, ClipboardList,
  Megaphone, Settings, Activity, LogOut, X, Shield, Tag, FileCheck, Newspaper, Building2
} from 'lucide-react'

const navItems = [
  { path: '/admin/dashboard',                label: 'لوحة التحكم',      icon: LayoutDashboard, superOnly: false },
  { path: '/admin/technicians',              label: 'الفنيون',           icon: Wrench,          superOnly: false },
  { path: '/admin/technician-applications',  label: 'طلبات الفنيين',     icon: FileCheck,       superOnly: false },
  { path: '/admin/company-applications',     label: 'طلبات الشركات',     icon: Building2,       superOnly: false },
  { path: '/admin/ad-requests',              label: 'طلبات الإعلانات',   icon: Newspaper,       superOnly: false },
  { path: '/admin/categories',    label: 'التخصصات',       icon: Tag,             superOnly: true  },
  { path: '/admin/cities',        label: 'المدن',          icon: MapPin,          superOnly: true  },
  { path: '/admin/ads',           label: 'الإعلانات',      icon: Megaphone,       superOnly: true  },
  { path: '/admin/users',         label: 'المستخدمون',     icon: Users,           superOnly: true  },
  { path: '/admin/settings',      label: 'الإعدادات',      icon: Settings,        superOnly: true  },
  { path: '/admin/logs',          label: 'سجل النشاط',     icon: Activity,        superOnly: true  },
]

function SidebarNav({ location, visibleItems, onClose }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {visibleItems.map(({ path, label, icon: Icon }) => {
        const isActive = location === path || location.startsWith(path + '/')
        return (
          <Link
            key={path}
            href={path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-[#FF7900] text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminSidebar({ open, onClose }) {
  const [location] = useLocation()
  const { isSuperAdmin, profile, signOut } = useAdmin()

  const visibleItems = navItems.filter(item => !item.superOnly || isSuperAdmin)

  const header = (
    <div className="px-5 py-5 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#FF7900] rounded-xl flex items-center justify-center flex-shrink-0">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">اطلب فني</p>
          <p className="text-white/50 text-xs">لوحة التحكم</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mr-auto text-white/50 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )

  const userInfo = (
    <div className="px-5 py-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-[#FF7900]" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'المسؤول'}</p>
          <p className="text-white/50 text-xs">{isSuperAdmin ? 'Super Admin' : 'Sub Admin'}</p>
        </div>
      </div>
    </div>
  )

  const footer = (
    <div className="px-3 py-4 border-t border-white/10">
      <button
        onClick={signOut}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#071B33] h-screen sticky top-0 flex-shrink-0">
        {header}
        {userInfo}
        <SidebarNav location={location} visibleItems={visibleItems} onClose={undefined} />
        {footer}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute right-0 top-0 bottom-0 w-60 bg-[#071B33] flex flex-col shadow-2xl">
            {header}
            {userInfo}
            <SidebarNav location={location} visibleItems={visibleItems} onClose={onClose} />
            {footer}
          </aside>
        </div>
      )}
    </>
  )
}
