import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'wouter'
import {
  Briefcase, FileText, Users, BarChart2, User, LogOut, ChevronLeft,
  Receipt, ArrowRight, Lock, Sparkles, ClipboardList, Phone, MapPin,
  Clock, CheckCircle, XCircle, MessageCircle, RefreshCw,
  Handshake, Plus, Share2, Calendar, DollarSign, Send, ChevronDown,
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

const DEAL_STATUS_CONFIG = {
  pending:   { label: 'بانتظار العميل', color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  confirmed: { label: 'مؤكدة ✓',        color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  disputed:  { label: 'مختلف عليها',    color: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  cancelled: { label: 'ملغية',          color: 'bg-gray-100 text-gray-500',      dot: 'bg-gray-400' },
}

const SERVICE_TYPES_AR = [
  'صيانة كهربائية', 'صيانة سباكة', 'تكييف وتبريد', 'نجارة وأثاث',
  'دهانات وديكور', 'أعمال بناء', 'خدمات تنظيف', 'حراسة وأمن',
  'خدمات تقنية', 'أعمال حدادة', 'أعمال ألومنيوم', 'خدمات أخرى',
]

function DealCard({ deal }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied]     = useState(false)
  const cfg = DEAL_STATUS_CONFIG[deal.status] || DEAL_STATUS_CONFIG.pending
  const confirmUrl = `${window.location.origin}/deal-confirm/${deal.confirmToken || ''}`
  const waMsg = `مرحباً! يرجى تأكيد الصفقة عبر الرابط التالي 👇\n${confirmUrl}`
  const waUrl = `https://wa.me/${deal.userPhone.replace(/\D/g, '').replace(/^0/, '218')}?text=${encodeURIComponent(waMsg)}`

  const copyLink = () => {
    navigator.clipboard.writeText(confirmUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #F0F2F5' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#071B33] text-sm">{deal.serviceType}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {deal.userPhone && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {deal.userPhone}
                </span>
              )}
              {deal.userName && <span className="text-xs text-gray-400">{deal.userName}</span>}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {deal.serviceDate}
              </span>
              {deal.serviceValue && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {Number(deal.serviceValue).toLocaleString('ar-LY')} د.ل
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <button onClick={() => setExpanded(p => !p)} className="p-1 rounded-lg hover:bg-gray-50">
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
          {deal.description && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{deal.description}</p>
          )}

          {deal.status === 'confirmed' && (
            <div className="flex gap-3">
              <div className="flex-1 bg-[#FF7900]/5 border border-[#FF7900]/20 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-gray-400">نقاطك</p>
                <p className="font-black text-[#FF7900] text-lg">{deal.proPoints}</p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-gray-400">نقاط العميل</p>
                <p className="font-black text-blue-600 text-lg">{deal.userPoints}</p>
              </div>
            </div>
          )}

          {deal.status === 'pending' && deal.confirmToken && (
            <div className="flex gap-2">
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 active:scale-95 transition-all">
                <Send className="w-3 h-3" /> أرسل عبر واتساب
              </a>
              <button onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 active:scale-95 transition-all">
                <Share2 className="w-3 h-3" /> {copied ? 'تم!' : 'نسخ الرابط'}
              </button>
            </div>
          )}

          <p className="text-[10px] text-gray-300">{new Date(deal.createdAt).toLocaleString('ar-LY')}</p>
        </div>
      )}
    </div>
  )
}

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

      {/* Photos */}
      {req.photoUrls && req.photoUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {req.photoUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer"
              className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0 hover:opacity-90 transition-opacity">
              <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
            </a>
          ))}
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

const DEAL_FORM_DEFAULT = {
  userPhone: '', userName: '', serviceType: '', serviceValue: '', serviceDate: '', description: ''
}

export default function ProDashboard() {
  const [, navigate] = useLocation()
  const [session,      setSession]     = useState(null)
  const [requests,     setRequests]    = useState([])
  const [reqLoading,   setReqLoading]  = useState(false)
  const [activeTab,    setActiveTab]   = useState('profile')
  const [deals,        setDeals]       = useState([])
  const [dealsLoading, setDealsLoading] = useState(false)
  const [showDealForm, setShowDealForm] = useState(false)
  const [dealForm,     setDealForm]    = useState(DEAL_FORM_DEFAULT)
  const [submitting,   setSubmitting]  = useState(false)
  const [dealErr,      setDealErr]     = useState('')

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

  const loadDeals = useCallback(async (sess) => {
    if (!sess) return
    setDealsLoading(true)
    try {
      const data = await api.deals.mine(sess.entityId, sess.entityType)
      setDeals(data)
    } catch { setDeals([]) }
    finally { setDealsLoading(false) }
  }, [])

  useEffect(() => {
    if (session && activeTab === 'requests') loadRequests(session)
    if (session && activeTab === 'deals')    loadDeals(session)
  }, [session, activeTab])

  const logout = () => { localStorage.removeItem('pro_session'); navigate('/pro-login') }

  if (!session) return null

  const typeLabel  = TYPE_LABEL[session.entityType] || 'مهني'
  const initials   = (session.displayName || '').trim().slice(0, 1)
  const newCount   = requests.filter(r => r.status === 'new').length
  const pendingDeals = deals.filter(d => d.status === 'pending').length

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const submitDeal = async (e) => {
    e.preventDefault()
    setDealErr('')
    if (!dealForm.userPhone || !dealForm.serviceType || !dealForm.serviceDate) {
      setDealErr('يرجى ملء الحقول المطلوبة: رقم الهاتف، نوع الخدمة، تاريخ الخدمة')
      return
    }
    setSubmitting(true)
    try {
      const newDeal = await api.deals.create({
        proId:        session.entityId,
        proType:      session.entityType,
        proName:      session.displayName,
        userPhone:    dealForm.userPhone.trim(),
        userName:     dealForm.userName.trim() || undefined,
        serviceType:  dealForm.serviceType,
        serviceValue: dealForm.serviceValue ? Number(dealForm.serviceValue) : undefined,
        serviceDate:  dealForm.serviceDate,
        description:  dealForm.description.trim() || undefined,
      })
      setDeals(prev => [newDeal, ...prev])
      setShowDealForm(false)
      setDealForm(DEAL_FORM_DEFAULT)
    } catch {
      setDealErr('حدث خطأ أثناء الإرسال، يرجى المحاولة مجدداً')
    } finally {
      setSubmitting(false)
    }
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
          className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl ${
            activeTab === 'profile' ? 'bg-white text-[#071B33] shadow' : 'text-white/60'
          }`}>
          ملفي
        </button>
        <button
          onClick={() => { setActiveTab('requests'); if (session) loadRequests(session) }}
          className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl relative ${
            activeTab === 'requests' ? 'bg-white text-[#071B33] shadow' : 'text-white/60'
          }`}>
          الطلبات
          {newCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#FF7900] text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {newCount > 9 ? '9+' : newCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('deals'); if (session) loadDeals(session) }}
          className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl relative ${
            activeTab === 'deals' ? 'bg-white text-[#071B33] shadow' : 'text-white/60'
          }`}>
          صفقاتي
          {pendingDeals > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {pendingDeals > 9 ? '9+' : pendingDeals}
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

        {/* ── DEALS TAB ── */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #071B33, #1e3a5f)' }}>
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-[#071B33] text-sm">صفقاتي</p>
                  <p className="text-[11px] text-gray-400">{deals.length} صفقة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadDeals(session)}
                  className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-100">
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${dealsLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setShowDealForm(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
                  <Plus className="w-3.5 h-3.5" /> صفقة جديدة
                </button>
              </div>
            </div>

            {/* New Deal Form */}
            {showDealForm && (
              <form onSubmit={submitDeal}
                className="bg-white rounded-3xl p-5 space-y-3 shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <p className="font-black text-[#071B33] text-sm">تسجيل صفقة جديدة</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">رقم هاتف العميل *</label>
                    <input type="tel" required placeholder="09XXXXXXXX"
                      value={dealForm.userPhone}
                      onChange={e => setDealForm(p => ({ ...p, userPhone: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                      style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">اسم العميل</label>
                    <input type="text" placeholder="اختياري"
                      value={dealForm.userName}
                      onChange={e => setDealForm(p => ({ ...p, userName: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                      style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">نوع الخدمة *</label>
                  <select required
                    value={dealForm.serviceType}
                    onChange={e => setDealForm(p => ({ ...p, serviceType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                    style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }}>
                    <option value="">اختر نوع الخدمة</option>
                    {SERVICE_TYPES_AR.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">تاريخ الخدمة *</label>
                    <input type="date" required
                      value={dealForm.serviceDate}
                      onChange={e => setDealForm(p => ({ ...p, serviceDate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                      style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">قيمة الخدمة (د.ل)</label>
                    <input type="number" min="0" placeholder="اختياري"
                      value={dealForm.serviceValue}
                      onChange={e => setDealForm(p => ({ ...p, serviceValue: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                      style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">تفاصيل الخدمة</label>
                  <textarea rows={2} placeholder="وصف مختصر للعمل المنجز..."
                    value={dealForm.description}
                    onChange={e => setDealForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 resize-none"
                    style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                </div>

                {dealErr && <p className="text-xs text-red-600 font-semibold">{dealErr}</p>}

                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700">
                  <p className="font-bold mb-0.5">كيف يعمل النظام؟</p>
                  <p>بعد التسجيل ستحصل على رابط تأكيد — أرسله للعميل عبر واتساب، وبمجرد تأكيده تحصل على <strong>+10 نقاط</strong></p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowDealForm(false); setDealErr(''); setDealForm(DEAL_FORM_DEFAULT) }}
                    className="flex-1 py-3 rounded-2xl font-bold text-gray-500 text-sm bg-gray-100 active:scale-95 transition-all">
                    إلغاء
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    تسجيل الصفقة
                  </button>
                </div>
              </form>
            )}

            {/* Deals list */}
            {dealsLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-7 h-7 border-2 border-[#071B33] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <Handshake className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-400">لا توجد صفقات بعد</p>
                <p className="text-xs text-gray-300 mt-1">سجّل أول صفقة مع عميلك واكسب نقاطاً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deals.map(d => <DealCard key={d.id} deal={d} />)}
              </div>
            )}
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
