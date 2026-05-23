import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { Briefcase, FileText, Users, BarChart2, User, LogOut, ChevronLeft, Receipt, ArrowRight } from 'lucide-react'

const TYPE_LABEL = {
  technician: 'فني',
  company:    'شركة خدمية',
  supplier:   'مورد مستلزمات',
}

export default function ProDashboard() {
  const [, navigate] = useLocation()
  const [session, setSession] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login'); return }
    try {
      setSession(JSON.parse(raw))
    } catch {
      localStorage.removeItem('pro_session')
      navigate('/pro-login')
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('pro_session')
    navigate('/pro-login')
  }

  if (!session) return null

  const typeLabel = TYPE_LABEL[session.entityType] || 'مهني'

  const TOOLS = [
    {
      id: 'invoice-new',
      labelAr: 'إنشاء فاتورة',
      icon: <Receipt className="w-7 h-7 text-white" />,
      bg: 'bg-gradient-to-br from-[#FF7900] to-[#c45e00]',
      soon: true,
      onClick: () => navigate('/pro/soon'),
    },
    {
      id: 'invoices',
      labelAr: 'فواتيري',
      icon: <FileText className="w-7 h-7 text-white" />,
      bg: 'bg-gradient-to-br from-[#071B33] to-[#1a3a5c]',
      soon: true,
      onClick: () => navigate('/pro/soon'),
    },
    {
      id: 'clients',
      labelAr: 'عملائي',
      icon: <Users className="w-7 h-7 text-white" />,
      bg: 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1]',
      soon: true,
      onClick: () => navigate('/pro/soon'),
    },
    {
      id: 'stats',
      labelAr: 'إحصائياتي',
      icon: <BarChart2 className="w-7 h-7 text-white" />,
      bg: 'bg-gradient-to-br from-[#10B981] to-[#065f46]',
      soon: true,
      onClick: () => navigate('/pro/soon'),
    },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col max-w-[480px] mx-auto" dir="rtl">

      <div className="bg-[#071B33] px-5 pt-14 pb-8">
        <button onClick={() => navigate('/more')} className="flex items-center gap-1.5 text-white/60 text-sm mb-5 active:opacity-70">
          <ArrowRight className="w-4 h-4" />
          العودة
        </button>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7900] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium">{typeLabel}</p>
              <h1 className="text-white font-extrabold text-lg leading-tight">{session.displayName}</h1>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-medium transition-colors mt-1 active:scale-95">
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
        <div className="bg-white/10 rounded-2xl px-4 py-3">
          <p className="text-white font-bold text-base">مرحباً بك 👋</p>
          <p className="text-white/70 text-sm mt-0.5">أدوات العمل الخاصة بك في مكان واحد</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-10 space-y-4">

        {/* My Profile — active, at the top */}
        <button type="button" onClick={() => navigate('/pro/profile')}
          className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-5 cursor-pointer select-none active:scale-[0.98] transition-transform"
          style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#7B2FBE] to-[#4c1d95]">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-right">
            <p className="font-extrabold text-[#071B33] text-base">ملفي الشخصي</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">عرض ملفك وتغيير كلمة المرور</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-300 flex-shrink-0" />
        </button>

        {/* Coming soon banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🚧</span>
          <div>
            <p className="text-amber-800 font-extrabold text-sm">قريباً — أدوات إضافية</p>
            <p className="text-amber-700 text-xs mt-0.5">الأدوات التالية ستكون متاحة قريباً لمشتركي الباقة المهنية</p>
          </div>
        </div>

        {/* 2×2 grid — soon tools */}
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(tool => (
            <div key={tool.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center gap-3 opacity-50 select-none">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tool.bg}`}>
                {tool.icon}
              </div>
              <div className="text-center">
                <p className="font-bold text-[#071B33] text-sm leading-tight">{tool.labelAr}</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">قريباً</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
