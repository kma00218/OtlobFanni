import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { Briefcase, FileText, Users, BarChart2, User, LogOut, ChevronLeft, Receipt, ArrowRight, Lock, Sparkles } from 'lucide-react'

const TYPE_LABEL = {
  technician: 'فني',
  company:    'شركة خدمية',
  supplier:   'مورد مستلزمات',
}

const TOOLS = [
  { id: 'invoice-new', labelAr: 'إنشاء فاتورة', icon: <Receipt className="w-6 h-6 text-white" />, bg: 'from-[#FF7900] to-[#c45e00]' },
  { id: 'invoices',    labelAr: 'فواتيري',       icon: <FileText className="w-6 h-6 text-white" />, bg: 'from-[#3b82f6] to-[#1d4ed8]' },
  { id: 'clients',     labelAr: 'عملائي',        icon: <Users    className="w-6 h-6 text-white" />, bg: 'from-[#0EA5E9] to-[#0369A1]' },
  { id: 'stats',       labelAr: 'إحصائياتي',     icon: <BarChart2 className="w-6 h-6 text-white"/>, bg: 'from-[#10B981] to-[#065f46]' },
]

export default function ProDashboard() {
  const [, navigate] = useLocation()
  const [session, setSession] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login'); return }
    try { setSession(JSON.parse(raw)) }
    catch { localStorage.removeItem('pro_session'); navigate('/pro-login') }
  }, [])

  const logout = () => { localStorage.removeItem('pro_session'); navigate('/pro-login') }

  if (!session) return null

  const typeLabel = TYPE_LABEL[session.entityType] || 'مهني'
  const initials  = (session.displayName || '').trim().slice(0, 1)

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2440 40%, #0d1f38 100%)' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div className="px-5 pt-14 pb-6 relative overflow-hidden">

        {/* decorative glow */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF7900 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

        {/* nav row */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => navigate('/more')}
            className="flex items-center gap-1.5 text-white/50 text-sm active:opacity-70 hover:text-white/80 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-white/40 text-xs active:opacity-70 hover:text-white/70 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            خروج
          </button>
        </div>

        {/* identity */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-2xl text-white shadow-lg shadow-black/30"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
            {initials || <Briefcase className="w-7 h-7" />}
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold text-[#FF7900] bg-[#FF7900]/15 border border-[#FF7900]/30 px-2 py-0.5 rounded-full mb-1">
              {typeLabel}
            </span>
            <h1 className="text-white font-extrabold text-xl leading-tight tracking-tight">{session.displayName}</h1>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex-1 px-4 pb-12 space-y-4"
        style={{ background: 'linear-gradient(180deg, transparent 0%, #F0F2F5 80px)' }}>

        {/* ── Profile card — hero ─────────────────── */}
        <button type="button" onClick={() => navigate('/pro/profile')}
          className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/30 active:scale-[0.97] transition-transform select-none group"
          style={{ WebkitTapHighlightColor: 'transparent' }}>
          <div className="relative px-6 py-6 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 60%, #9a4800 100%)' }}>
            {/* subtle grid pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,.15) 20px,rgba(255,255,255,.15) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.15) 20px,rgba(255,255,255,.15) 21px)' }} />
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10 backdrop-blur-sm">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-right relative z-10">
              <p className="text-white/80 text-xs font-semibold mb-0.5">متاح الآن</p>
              <p className="text-white font-extrabold text-lg leading-tight">ملفي الشخصي</p>
              <p className="text-white/70 text-xs mt-0.5">عرض ملفك وتغيير كلمة المرور</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10 group-active:bg-white/30 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </div>
        </button>

        {/* ── Coming soon section ─────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: '#fff' }}>

          {/* section header */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <p className="font-extrabold text-[#071B33] text-sm">أدوات الباقة المهنية</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ستُفعَّل مع اشتراكك القريب</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-[#FF7900] bg-[#FF7900]/10 border border-[#FF7900]/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              قريباً
            </span>
          </div>

          {/* tools grid */}
          <div className="grid grid-cols-2 gap-px bg-slate-100">
            {TOOLS.map(tool => (
              <div key={tool.id}
                className="bg-white px-4 py-5 flex flex-col items-center gap-3 select-none">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.bg} flex items-center justify-center opacity-40`}>
                  {tool.icon}
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-400 text-sm leading-tight">{tool.labelAr}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Lock className="w-2.5 h-2.5 text-slate-300" />
                    <p className="text-[10px] text-slate-300 font-semibold">قريباً</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
