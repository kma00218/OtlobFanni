import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'wouter'
import {
  Briefcase, FileText, Users, BarChart2, User, LogOut, ChevronLeft,
  Receipt, ArrowRight, Lock, Sparkles, ClipboardList, Phone, MapPin,
  Clock, CheckCircle, XCircle, MessageCircle, RefreshCw,
} from 'lucide-react'
import { api } from '../lib/api'

const TYPE_LABEL = {
  technician: 'فني',
  company:    'شركة خدمية',
  supplier:   'مورد مستلزمات',
}

const TOOLS = [
  { id: 'invoice-new', labelAr: 'إنشاء فاتورة', icon: <Receipt   className="w-6 h-6 text-white" />, bg: 'from-[#FF7900] to-[#c45e00]' },
  { id: 'invoices',    labelAr: 'فواتيري',        icon: <FileText  className="w-6 h-6 text-white" />, bg: 'from-[#3b82f6] to-[#1d4ed8]' },
  { id: 'clients',     labelAr: 'عملائي',         icon: <Users     className="w-6 h-6 text-white" />, bg: 'from-[#0EA5E9] to-[#0369A1]' },
  { id: 'stats',       labelAr: 'إحصائياتي',      icon: <BarChart2 className="w-6 h-6 text-white"/>, bg: 'from-[#10B981] to-[#065f46]' },
]

const STATUS_CONFIG = {
  new:       { label: 'جديد',        color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  contacted: { label: 'تم التواصل', color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  completed: { label: 'مكتمل',       color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'ملغي',        color: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

function RequestCard({ req, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.new

  const changeStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await api.updateServiceRequest(req.id, newStatus)
      onStatusChange(req.id, newStatus)
    } catch { /* ignore */ }
    finally { setUpdating(false) }
  }

  const buildWaUrl = () => {
    const clean = (req.phone || '').replace(/\D/g, '')
    if (!clean) return null
    const num = clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
    const msg = `السلام عليكم ${req.customerName}،\nبخصوص طلبك على منصة اطلب فني 🔧\nنوع الطلب: ${req.requestType || '—'}\nهل يمكنكم تحديد موعد مناسب؟ شكراً 🙏`
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#071B33] text-sm">{req.customerName}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {req.phone && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {req.phone}
              </span>
            )}
            {req.cityName && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {req.cityName}
              </span>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Request type + description */}
      {req.requestType && (
        <div className="bg-[#FF7900]/5 rounded-xl px-3 py-2">
          <p className="text-xs font-bold text-[#FF7900]">{req.requestType}</p>
          {req.description && <p className="text-xs text-gray-600 mt-0.5">{req.description}</p>}
        </div>
      )}

      {/* Preferred datetime */}
      {req.preferredDatetime && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> {req.preferredDatetime}
        </p>
      )}

      {/* Created at */}
      <p className="text-[10px] text-gray-300">
        {new Date(req.createdAt).toLocaleString('ar-LY')}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
        {req.phone && (
          <a href={buildWaUrl()} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors">
            <WaIcon /> رد على واتساب
          </a>
        )}
        {req.status !== 'contacted' && req.status !== 'completed' && req.status !== 'cancelled' && (
          <button onClick={() => changeStatus('contacted')} disabled={updating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 disabled:opacity-50 transition-colors">
            <MessageCircle className="w-3 h-3" /> تم التواصل
          </button>
        )}
        {req.status !== 'completed' && req.status !== 'cancelled' && (
          <button onClick={() => changeStatus('completed')} disabled={updating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 disabled:opacity-50 transition-colors">
            <CheckCircle className="w-3 h-3" /> مكتمل
          </button>
        )}
        {req.status !== 'cancelled' && (
          <button onClick={() => changeStatus('cancelled')} disabled={updating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 disabled:opacity-50 transition-colors">
            <XCircle className="w-3 h-3" /> إلغاء
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProDashboard() {
  const [, navigate] = useLocation()
  const [session,   setSession]   = useState(null)
  const [requests,  setRequests]  = useState([])
  const [reqLoading, setReqLoading] = useState(false)
  const [activeTab, setActiveTab]  = useState('profile')

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login'); return }
    try { setSession(JSON.parse(raw)) }
    catch { localStorage.removeItem('pro_session'); navigate('/pro-login') }
  }, [])

  const loadRequests = useCallback(async (sess) => {
    if (!sess) return
    setReqLoading(true)
    try {
      const data = await api.myServiceRequests(sess.entityType, sess.entityId)
      setRequests(data)
    } catch { setRequests([]) }
    finally { setReqLoading(false) }
  }, [])

  useEffect(() => {
    if (session && activeTab === 'requests') loadRequests(session)
  }, [session, activeTab])

  const logout = () => { localStorage.removeItem('pro_session'); navigate('/pro-login') }

  if (!session) return null

  const typeLabel  = TYPE_LABEL[session.entityType] || 'مهني'
  const initials   = (session.displayName || '').trim().slice(0, 1)
  const newCount   = requests.filter(r => r.status === 'new').length

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2440 40%, #0d1f38 100%)' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div className="px-5 pt-14 pb-6 relative overflow-hidden">
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

      {/* ── Tab Bar ────────────────────────────────── */}
      <div className="flex mx-4 mb-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-sm font-bold transition-all rounded-xl ${
            activeTab === 'profile' ? 'bg-white text-[#071B33] shadow' : 'text-white/60'
          }`}>
          الملف الشخصي
        </button>
        <button
          onClick={() => { setActiveTab('requests'); if (session) loadRequests(session) }}
          className={`flex-1 py-3 text-sm font-bold transition-all rounded-xl relative ${
            activeTab === 'requests' ? 'bg-white text-[#071B33] shadow' : 'text-white/60'
          }`}>
          طلبات العملاء
          {newCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#FF7900] text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {newCount > 9 ? '9+' : newCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex-1 px-4 pb-12 pt-3"
        style={{ background: 'linear-gradient(180deg, transparent 0%, #F0F2F5 80px)' }}>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Profile hero card */}
            <button type="button" onClick={() => navigate('/pro/profile')}
              className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/30 active:scale-[0.97] transition-transform select-none group"
              style={{ WebkitTapHighlightColor: 'transparent' }}>
              <div className="relative px-6 py-6 flex items-center gap-5"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 60%, #9a4800 100%)' }}>
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

            {/* Coming soon tools */}
            <div className="rounded-3xl overflow-hidden shadow-sm bg-white">
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
              <div className="grid grid-cols-2 gap-px bg-slate-100">
                {TOOLS.map(tool => (
                  <div key={tool.id} className="bg-white px-4 py-5 flex flex-col items-center gap-3 select-none">
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
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-[#071B33] text-sm">طلبات العملاء</p>
                  <p className="text-[11px] text-gray-400">{requests.length} طلب</p>
                </div>
              </div>
              <button onClick={() => loadRequests(session)}
                className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-100">
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${reqLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {reqLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-7 h-7 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-400">لا توجد طلبات بعد</p>
                <p className="text-xs text-gray-300 mt-1">ستظهر هنا طلبات الخدمة من ملفك الشخصي</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(r => (
                  <RequestCard key={r.id} req={r} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
