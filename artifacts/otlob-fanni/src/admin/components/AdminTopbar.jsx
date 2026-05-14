import { Menu, Bell, ChevronDown, ExternalLink } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { useLocation, Link } from 'wouter'

const BREADCRUMBS = {
  '/admin/dashboard':               ['لوحة التحكم'],
  '/admin/technicians':             ['الدليل', 'الفنيون'],
  '/admin/companies':               ['الدليل', 'الشركات'],
  '/admin/categories':              ['الدليل', 'التخصصات'],
  '/admin/cities':                  ['الدليل', 'المدن'],
  '/admin/technician-applications': ['الطلبات', 'طلبات الفنيين'],
  '/admin/company-applications':    ['الطلبات', 'طلبات الشركات'],
  '/admin/requests':                ['الطلبات', 'طلبات الخدمة'],
  '/admin/ad-requests':             ['الطلبات', 'طلبات الإعلانات'],
  '/admin/ads':                     ['الإعلانات', 'الإعلانات النشطة'],
  '/admin/users':                   ['النظام', 'المستخدمون'],
  '/admin/settings':                ['النظام', 'الإعدادات'],
  '/admin/logs':                    ['النظام', 'سجل النشاط'],
}

export default function AdminTopbar({ onMenuClick }) {
  const { admin, isSuperAdmin, signOut } = useAdmin()
  const [location, navigate] = useLocation()
  const profile = admin ? { full_name: admin.name } : null
  const crumbs = BREADCRUMBS[location] || ['لوحة التحكم']
  const pageTitle = crumbs[crumbs.length - 1]

  return (
    <header
      className="h-16 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20 flex-shrink-0"
      style={{
        background: 'rgba(15,23,42,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        {crumbs.length > 1 && (
          <>
            <span className="text-slate-400 text-sm">{crumbs[0]}</span>
            <span className="text-slate-500 text-sm">/</span>
          </>
        )}
        <h1 className="text-white font-bold text-base">{pageTitle}</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* View app button */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          عرض التطبيق
        </a>

        {/* Notifications (placeholder) */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </button>

        {/* User menu */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl cursor-default"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}
          >
            {(profile?.full_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white leading-none">{profile?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{isSuperAdmin ? 'Super Admin' : 'Sub Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
