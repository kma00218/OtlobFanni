import { useEffect, useState } from 'react'
import { useLocation, Link } from 'wouter'
import { useAdmin } from '../../context/AdminContext'
import {
  LayoutDashboard, Wrench, Building2, Tag, MapPin, FileCheck,
  Megaphone, Users, Settings, Activity, LogOut, X, Shield, Newspaper,
} from 'lucide-react'
import api from '../../lib/api'

const NAV_GROUPS = [
  {
    id: 'main',
    items: [
      { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    ]
  },
  {
    id: 'directory',
    label: 'الدليل',
    items: [
      { path: '/admin/technicians',  label: 'الفنيون',    icon: Wrench,    statsKey: 'totalTechs' },
      { path: '/admin/companies',    label: 'الشركات',    icon: Building2, statsKey: 'totalCompanies' },
      { path: '/admin/categories',   label: 'التخصصات',  icon: Tag,       superOnly: true, statsKey: 'totalCategories' },
      { path: '/admin/cities',       label: 'المدن',      icon: MapPin,    superOnly: true },
    ]
  },
  {
    id: 'requests',
    label: 'الطلبات والانضمام',
    items: [
      { path: '/admin/technician-applications', label: 'طلبات الفنيين',   icon: FileCheck,  badgeKey: 'pendingTechApps',    badgeColor: 'orange' },
      { path: '/admin/company-applications',    label: 'طلبات الشركات',   icon: Building2,  badgeKey: 'pendingCompanyApps', badgeColor: 'orange' },
      { path: '/admin/ad-requests',             label: 'طلبات الإعلانات', icon: Newspaper,  badgeKey: 'pendingAdRequests',  badgeColor: 'purple' },
    ]
  },
  {
    id: 'ads',
    label: 'الإعلانات',
    items: [
      { path: '/admin/ads', label: 'الإعلانات النشطة', icon: Megaphone, superOnly: true, statsKey: 'activeAds' },
    ]
  },
  {
    id: 'system',
    label: 'النظام',
    superOnly: true,
    items: [
      { path: '/admin/users',    label: 'المستخدمون', icon: Users,    superOnly: true },
      { path: '/admin/settings', label: 'الإعدادات',  icon: Settings, superOnly: true },
      { path: '/admin/logs',     label: 'سجل النشاط', icon: Activity, superOnly: true },
    ]
  },
]

function NavBadge({ count, color = 'orange' }) {
  if (!count || count <= 0) return null
  const colors = {
    orange: 'bg-[#FF7900] text-white',
    blue:   'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    green:  'bg-emerald-500 text-white',
  }
  return (
    <span className={`${colors[color]} text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function NavItem({ item, location, stats, onClose, isSuperAdmin }) {
  if (item.superOnly && !isSuperAdmin) return null

  const isActive = location === item.path || location.startsWith(item.path + '/')
  const badge = item.badgeKey ? stats[item.badgeKey] : (item.statsKey ? stats[item.statsKey] : null)
  const showBadge = item.badgeKey && badge > 0

  return (
    <Link
      href={item.path}
      onClick={onClose}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
        ${isActive
          ? 'bg-[#FF7900] text-white shadow-lg shadow-[#FF7900]/40'
          : 'text-white/70 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {showBadge && <NavBadge count={badge} color={item.badgeColor} />}
      {item.statsKey && badge > 0 && !showBadge && (
        <span className="text-[10px] font-bold bg-white/15 text-white/80 px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </Link>
  )
}

export default function AdminSidebar({ open, onClose }) {
  const [location] = useLocation()
  const { isSuperAdmin, profile, signOut } = useAdmin()
  const [stats, setStats] = useState({})

  useEffect(() => {
    api.admin.stats()
      .then(s => setStats(s))
      .catch(() => {})
  }, [location])

  const [, navigate] = useLocation()

  const handleSignOut = () => {
    signOut()
    navigate('/admin/login')
  }

  const initials = (profile?.full_name || 'A').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="px-5 py-5 flex items-center gap-3 flex-shrink-0 border-b border-white/10">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}
        >
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-black text-base leading-tight">اطلب فني</p>
          <p className="text-[#FF7900] text-[11px] font-semibold">لوحة التحكم</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mr-auto text-white/40 hover:text-white/80 lg:hidden transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_GROUPS.map(group => {
          if (group.superOnly && !isSuperAdmin) return null
          const visibleItems = group.items.filter(item => !item.superOnly || isSuperAdmin)
          if (visibleItems.length === 0) return null
          return (
            <div key={group.id} className="mb-2">
              {group.label && (
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 py-2 mt-1">
                  {group.label}
                </p>
              )}
              {visibleItems.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  location={location}
                  stats={stats}
                  onClose={onClose}
                  isSuperAdmin={isSuperAdmin}
                />
              ))}
            </div>
          )
        })}
      </nav>

      {/* User Card */}
      <div className="px-3 pb-4 flex-shrink-0 space-y-2 border-t border-white/10 pt-3">
        <div className="rounded-xl p-3 flex items-center gap-3 bg-white/8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{profile?.full_name || 'المسؤول'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-[#FF7900]" />
              <p className="text-white/50 text-[11px] font-medium">
                {isSuperAdmin ? 'Super Admin' : 'Sub Admin'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0"
        style={{ background: '#071B33' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside
            className="absolute right-0 top-0 bottom-0 w-60 flex flex-col shadow-2xl"
            style={{ background: '#071B33' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
