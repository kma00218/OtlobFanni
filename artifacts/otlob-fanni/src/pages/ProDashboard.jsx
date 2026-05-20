import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { Briefcase, FileText, Users, BarChart2, User, LogOut, ChevronLeft, Receipt, Clock } from 'lucide-react'

const TOOLS = [
  {
    id: 'invoice-new',
    labelAr: 'إنشاء فاتورة',
    icon: <Receipt className="w-7 h-7 text-white" />,
    bg: 'bg-gradient-to-br from-[#FF7900] to-[#c45e00]',
    soon: true,
  },
  {
    id: 'invoices',
    labelAr: 'فواتيري',
    icon: <FileText className="w-7 h-7 text-white" />,
    bg: 'bg-gradient-to-br from-[#071B33] to-[#1a3a5c]',
    soon: true,
  },
  {
    id: 'clients',
    labelAr: 'عملائي',
    icon: <Users className="w-7 h-7 text-white" />,
    bg: 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1]',
    soon: true,
  },
  {
    id: 'stats',
    labelAr: 'إحصائياتي',
    icon: <BarChart2 className="w-7 h-7 text-white" />,
    bg: 'bg-gradient-to-br from-[#10B981] to-[#065f46]',
    soon: true,
  },
  {
    id: 'profile',
    labelAr: 'ملفي الشخصي',
    icon: <User className="w-7 h-7 text-white" />,
    bg: 'bg-gradient-to-br from-[#7B2FBE] to-[#4c1d95]',
    soon: true,
  },
]

const TYPE_LABEL = {
  technician: 'فني',
  company: 'شركة',
  supplier: 'مورد مستلزمات',
}

export default function ProDashboard() {
  const [, navigate] = useLocation()
  const [session, setSession] = useState(null)
  const [soonToast, setSoonToast] = useState(false)

  const showSoon = () => {
    setSoonToast(true)
    setTimeout(() => setSoonToast(false), 2000)
  }

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

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col max-w-[480px] mx-auto" dir="rtl">

      {soonToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#071B33] text-white text-sm font-bold px-6 py-3.5 rounded-2xl shadow-xl whitespace-nowrap">
          <Clock className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
          هذه الميزة قريباً ✦
        </div>
      )}

      <div className="bg-[#071B33] px-5 pt-14 pb-8">
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
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-medium transition-colors mt-1 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
        <div className="bg-white/10 rounded-2xl px-4 py-3">
          <p className="text-white font-bold text-base">مرحباً بك 👋</p>
          <p className="text-white/70 text-sm mt-0.5">أدوات العمل الخاصة بك في مكان واحد</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-10">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">أدوات العمل</p>
        <div className="space-y-3">
          {TOOLS.map(tool => (
            <div key={tool.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={tool.soon ? showSoon : undefined}
                className="w-full flex items-center gap-4 px-4 py-4 active:bg-slate-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tool.bg}`}>
                  {tool.icon}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-[#071B33] text-base">{tool.labelAr}</p>
                  {tool.soon && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">قريباً</p>
                  )}
                </div>
                {!tool.soon && (
                  <ChevronLeft className="w-5 h-5 text-slate-300 flex-shrink-0" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
