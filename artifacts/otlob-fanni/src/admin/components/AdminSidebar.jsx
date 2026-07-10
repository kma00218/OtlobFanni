import { useEffect, useState } from 'react'
import { useLocation, Link } from 'wouter'
import { useAdmin } from '../../context/AdminContext'
import {
  LayoutDashboard, Wrench, Building2, Tag, MapPin, FileCheck,
  Megaphone, Users, Settings, Activity, LogOut, X, Shield, Newspaper, Search,
  Image as ImageIcon, Package, Flag, UserPlus, FilePen, ClipboardList, Handshake, Link2, ListChecks, Users2, KeyRound,
} from 'lucide-react'
import api from '../../lib/api'

const NAV_GROUPS = [
  {
    id: 'main',
    items: [
      { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: 'orange' },
    ]
  },
  {
    id: 'directory',
    label: 'الدليل',
    color: 'blue',
    items: [
      { path: '/admin/technicians',  label: 'الفنيون',          icon: Wrench,    color: 'blue',   statsKey: 'totalTechs' },
      { path: '/admin/companies',    label: 'الشركات',          icon: Building2, color: 'blue',   statsKey: 'totalCompanies' },
      { path: '/admin/suppliers',    label: 'مزودو المستلزمات', icon: Package,   color: 'blue',   statsKey: 'totalSuppliers' },
      { path: '/admin/categories',   label: 'التخصصات',         icon: Tag,       color: 'blue',   superOnly: true, statsKey: 'totalCategories' },
      { path: '/admin/cities',       label: 'المدن',             icon: MapPin,    color: 'blue',   superOnly: true },
    ]
  },
  {
    id: 'joining',
    label: 'الانضمام',
    color: 'orange',
    items: [
      { path: '/admin/search',                  label: 'بحث عن حساب',      icon: Search,       color: 'gray' },
      { path: '/admin/technician-applications', label: 'طلبات الفنيين',    icon: FileCheck,    color: 'orange', badgeKey: 'pendingTechApps',     badgeColor: 'orange' },
      { path: '/admin/company-applications',    label: 'طلبات الشركات',    icon: Building2,    color: 'orange', badgeKey: 'pendingCompanyApps',  badgeColor: 'orange' },
      { path: '/admin/supplier-applications',   label: 'طلبات الموردين',   icon: Package,      color: 'orange', badgeKey: 'pendingSupplierApps', badgeColor: 'blue',   statsKey: 'activeSupplierApps' },
      { path: '/admin/referrals',               label: 'الترشيحات',         icon: UserPlus,     color: 'green',  badgeKey: 'pendingReferrals',    badgeColor: 'green' },
      { path: '/admin/profile-updates',         label: 'تعديلات الملفات',   icon: FilePen,      color: 'orange', badgeKey: 'pendingProfileUpdates', badgeColor: 'orange' },
      { path: '/admin/update-reports',          label: 'بلاغات التحديث',   icon: Flag,         color: 'red',    badgeKey: 'pendingUpdateReports',  badgeColor: 'red' },
      { path: '/admin/pin-activation',          label: 'تفعيل لوحة التحكم', icon: KeyRound,    color: 'teal' },
    ]
  },
  {
    id: 'customers',
    label: 'العملاء والطلبات',
    color: 'purple',
    items: [
      { path: '/admin/customer-accounts',  label: 'حسابات العملاء',       icon: Users2,        color: 'purple', statsKey: 'totalCustomerAccounts' },
      { path: '/admin/service-requests',   label: 'طلبات الخدمة',         icon: ClipboardList, color: 'purple', badgeKey: 'newRequests',          badgeColor: 'orange' },
      { path: '/admin/general-requests',   label: 'طلبات عامة وعروض',     icon: ListChecks,    color: 'purple', badgeKey: 'openGeneralRequests',  badgeColor: 'blue', statsKey: 'totalGeneralRequests' },
      { path: '/admin/deals',              label: 'الصفقات المؤكدة',       icon: Handshake,     color: 'purple' },
    ]
  },
  {
    id: 'marketing',
    label: 'التسويق والإعلانات',
    color: 'green',
    items: [
      { path: '/admin/affiliates', label: 'الإحالات والسفراء',  icon: Link2,     color: 'green' },
      { path: '/admin/poster',     label: 'توليد منشور',        icon: ImageIcon, color: 'green' },
      { path: '/admin/ad-requests', label: 'طلبات الإعلانات',   icon: Newspaper, color: 'yellow', badgeKey: 'pendingAdRequests', badgeColor: 'purple' },
      { path: '/admin/ads',         label: 'الإعلانات النشطة',  icon: Megaphone, color: 'yellow', superOnly: true, statsKey: 'activeAds' },
    ]
  },
  {
    id: 'system',
    label: 'النظام',
    color: 'red',
    superOnly: true,
    items: [
      { path: '/admin/users',    label: 'المستخدمون', icon: Users,    color: 'red', superOnly: true },
      { path: '/admin/settings', label: 'الإعدادات',  icon: Settings, color: 'red', superOnly: true },
      { path: '/admin/logs',     label: 'سجل النشاط', icon: Activity, color: 'red', superOnly: true },
    ]
  },
]

const ICON_COLORS = {
  orange: { bg: 'bg-[#FF7900]/20',  icon: 'text-[#FF7900]',  border: 'border-[#FF7900]/30' },
  blue:   { bg: 'bg-blue-500/20',   icon: 'text-blue-400',   border: 'border-blue-500/30' },
  purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400', border: 'border-purple-500/30' },
  green:  { bg: 'bg-emerald-500/20',icon: 'text-emerald-400',border: 'border-emerald-500/30' },
  teal:   { bg: 'bg-teal-500/20',   icon: 'text-teal-400',   border: 'border-teal-500/30' },
  red:    { bg: 'bg-red-500/20',    icon: 'text-red-400',    border: 'border-red-500/30' },
  yellow: { bg: 'bg-yellow-500/20', icon: 'text-yellow-400', border: 'border-yellow-500/30' },
  gray:   { bg: 'bg-white/10',      icon: 'text-white/60',   border: 'border-white/15' },
}

const GROUP_HEADER_COLORS = {
  blue:   { bar: 'bg-blue-500',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  orange: { bar: 'bg-[#FF7900]',  text: 'text-[#FF7900]',  border: 'border-[#FF7900]/30' },
  purple: { bar: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' },
  green:  { bar: 'bg-emerald-500',text: 'text-emerald-400',border: 'border-emerald-500/30' },
  red:    { bar: 'bg-red-500',    text: 'text-red-400',    border: 'border-red-500/30' },
}

function NavBadge({ count, color = 'orange' }) {
  if (!count || count <= 0) return null
  const colors = {
    orange: 'bg-[#FF7900] text-white',
    blue:   'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    green:  'bg-emerald-500 text-white',
    red:    'bg-red-500 text-white',
  }
  return (
    <span className={`${colors[color] || colors.orange} text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none flex-shrink-0`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function NavItem({ item, location, stats, onClose, isSuperAdmin }) {
  if (item.superOnly && !isSuperAdmin) return null

  const isActive = location === item.path || location.startsWith(item.path + '/')
  const badgeCount = item.badgeKey ? (stats[item.badgeKey] ?? 0) : null
  const grayCount  = item.statsKey ? (stats[item.statsKey] ?? 0) : null
  const showBadge  = item.badgeKey && badgeCount > 0

  const colorKey = item.color || 'gray'
  const ic = ICON_COLORS[colorKey] || ICON_COLORS.gray

  return (
    <Link
      href={item.path}
      onClick={onClose}
      className={`
        group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative
        ${isActive
          ? 'bg-white/15 shadow-inner border border-white/20'
          : 'hover:bg-white/8 border border-transparent'
        }
      `}
    >
      {/* colored icon box */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
        isActive ? `${ic.bg} ${ic.border}` : `${ic.bg} ${ic.border}`
      }`}>
        <item.icon className={`w-3.5 h-3.5 ${isActive ? ic.icon : ic.icon}`} />
      </div>

      {/* active indicator */}
      {isActive && (
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full ${ICON_COLORS[colorKey]?.bg.replace('/20', '') || 'bg-[#FF7900]'}`}
          style={{ background: colorKey === 'orange' ? '#FF7900' : undefined }}
        />
      )}

      <span className={`flex-1 truncate text-[13px] ${isActive ? 'text-white font-bold' : 'text-white/80 group-hover:text-white'}`}>
        {item.label}
      </span>

      {showBadge && <NavBadge count={badgeCount} color={item.badgeColor} />}
      {!showBadge && grayCount > 0 && (
        <span className="text-[10px] font-bold bg-white/15 text-white/70 px-1.5 py-0.5 rounded-full flex-shrink-0">
          {grayCount > 99 ? '99+' : grayCount}
        </span>
      )}
    </Link>
  )
}

function GroupHeader({ label, color }) {
  const hc = GROUP_HEADER_COLORS[color] || GROUP_HEADER_COLORS.blue
  return (
    <div className={`flex items-center gap-2 px-2 pt-4 pb-1.5`}>
      <div className={`w-1.5 h-4 rounded-full ${hc.bar}`} />
      <span className={`text-[11px] font-black uppercase tracking-widest ${hc.text}`}>
        {label}
      </span>
      <div className={`flex-1 h-px ${hc.bar} opacity-20`} />
    </div>
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
      <div className="px-4 py-4 flex items-center gap-3 flex-shrink-0 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}
        >
          <Wrench className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="text-white font-black text-sm leading-tight">اطلب فني</p>
          <p className="text-[#FF7900] text-[10px] font-semibold">لوحة التحكم</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mr-auto text-white/40 hover:text-white/80 lg:hidden transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {NAV_GROUPS.map(group => {
          if (group.superOnly && !isSuperAdmin) return null
          const visibleItems = group.items.filter(item => !item.superOnly || isSuperAdmin)
          if (visibleItems.length === 0) return null

          const hc = GROUP_HEADER_COLORS[group.color] || GROUP_HEADER_COLORS.blue

          return (
            <div
              key={group.id}
              className={`mb-2 rounded-2xl overflow-hidden ${
                group.label
                  ? `border border-white/8 bg-white/4`
                  : ''
              }`}
            >
              {group.label && <GroupHeader label={group.label} color={group.color} />}

              <div className={`${group.label ? 'px-1 pb-2' : ''} space-y-0.5`}>
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
            </div>
          )
        })}
      </nav>

      {/* User Card */}
      <div className="px-3 pb-4 flex-shrink-0 border-t border-white/10 pt-3 space-y-2">
        <div className="rounded-xl p-3 flex items-center gap-3 bg-white/8 border border-white/10">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{profile?.full_name || 'المسؤول'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="w-2.5 h-2.5 text-[#FF7900]" />
              <p className="text-white/50 text-[10px]">{isSuperAdmin ? 'Super Admin' : 'Sub Admin'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
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
