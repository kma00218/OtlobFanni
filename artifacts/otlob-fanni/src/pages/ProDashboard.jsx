import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation } from 'wouter'
import {
  Briefcase, FileText, Users, BarChart2, User, LogOut, ChevronLeft,
  Receipt, ArrowRight, Lock, Sparkles, ClipboardList, Phone, MapPin,
  Clock, CheckCircle, XCircle, MessageCircle, RefreshCw,
  Handshake, Plus, Share2, Calendar, DollarSign, Send, ChevronDown,
  TrendingUp, Star, Package, Building2, Wrench, Filter, PencilLine, Eye,
  PlayCircle, Flag, Trash2,
} from 'lucide-react'
import { api, getFileUrl } from '../lib/api'

// ── Type-specific config ────────────────────────────────────────────────────
const TYPE_CONFIG = {
  technician: {
    label:            'فني',
    icon:             <Wrench className="w-5 h-5" />,
    color:            '#FF7900',
    requestsTab:      'الطلبات',
    requestsTitle:    'طلبات العملاء',
    requestsEmpty:    'ستظهر هنا طلبات الخدمة الواردة من ملفك الشخصي',
    dealsTab:         'صفقاتي',
    dealsTitle:       'سجل الصفقات',
    dealsEmpty:       'سجّل أول صفقة مع عميلك واكسب نقاطاً',
    newDealBtn:       'صفقة جديدة',
    statsLabels:      { requests: 'طلبات واردة', deals: 'صفقات مكتملة', points: 'نقاطي' },
  },
  company: {
    label:            'شركة خدمية',
    icon:             <Building2 className="w-5 h-5" />,
    color:            '#0EA5E9',
    requestsTab:      'طلبات الشركة',
    requestsTitle:    'طلبات خدمة الشركة',
    requestsEmpty:    'ستظهر هنا طلبات الخدمة الموجهة لشركتك',
    dealsTab:         'العقود',
    dealsTitle:       'عقود وصفقات الشركة',
    dealsEmpty:       'سجّل أول عقد أو صفقة لشركتك',
    newDealBtn:       'تسجيل عقد',
    statsLabels:      { requests: 'طلبات الشركة', deals: 'عقود مؤكدة', points: 'نقاط الشركة' },
  },
  supplier: {
    label:            'مورد مستلزمات',
    icon:             <Package className="w-5 h-5" />,
    color:            '#10B981',
    requestsTab:      'الاستفسارات',
    requestsTitle:    'استفسارات العملاء',
    requestsEmpty:    'ستظهر هنا استفسارات العملاء عن مستلزماتك',
    dealsTab:         'الطلبيات',
    dealsTitle:       'طلبيات التوريد',
    dealsEmpty:       'سجّل أول طلبية توريد لعميلك',
    newDealBtn:       'طلبية جديدة',
    statsLabels:      { requests: 'استفسارات', deals: 'طلبيات مؤكدة', points: 'نقاطي' },
  },
}

const TOOLS = [
  { id: 'invoice-new', labelAr: 'إنشاء فاتورة', icon: <Receipt   className="w-6 h-6 text-white" />, bg: 'from-[#FF7900] to-[#c45e00]' },
  { id: 'invoices',    labelAr: 'فواتيري',        icon: <FileText  className="w-6 h-6 text-white" />, bg: 'from-[#3b82f6] to-[#1d4ed8]' },
  { id: 'clients',     labelAr: 'عملائي',         icon: <Users     className="w-6 h-6 text-white" />, bg: 'from-[#0EA5E9] to-[#0369A1]' },
  { id: 'stats',       labelAr: 'إحصائياتي',      icon: <BarChart2 className="w-6 h-6 text-white"/>, bg: 'from-[#10B981] to-[#065f46]' },
]

const DEAL_STATUS_CONFIG = {
  pending:   { label: 'بانتظار التأكيد', color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  confirmed: { label: 'مؤكدة ✓',         color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  disputed:  { label: 'مختلف عليها',     color: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  cancelled: { label: 'ملغية',           color: 'bg-gray-100 text-gray-500',      dot: 'bg-gray-400' },
}

const REQUEST_STATUS_CONFIG = {
  new:                              { label: 'جديد',                 color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'    },
  contacted:                        { label: 'تم التواصل',          color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'   },
  in_progress:                      { label: 'قيد التنفيذ',          color: 'bg-orange-100 text-orange-700',   dot: 'bg-orange-500'  },
  awaiting_customer_confirmation:   { label: 'بانتظار تأكيد العميل', color: 'bg-purple-100 text-purple-700',   dot: 'bg-purple-500'  },
  completed_confirmed:              { label: 'مكتمل ومؤكد ✓',        color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  amount_disputed:                  { label: 'خلاف على القيمة',      color: 'bg-yellow-100 text-yellow-700',   dot: 'bg-yellow-500'  },
  completion_disputed:              { label: 'خلاف على الإنهاء',     color: 'bg-red-100 text-red-700',         dot: 'bg-red-500'     },
  completed:                        { label: 'مكتمل',                color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled:                        { label: 'ملغي',                 color: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400'    },
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="flex-1 rounded-2xl px-3 py-3 flex flex-col items-center gap-1 min-w-0"
      style={{ background: 'rgba(255,255,255,0.09)', border: '1.5px solid rgba(255,255,255,0.22)', boxShadow: `0 0 0 1px ${accent}30 inset` }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}30`, border: `1px solid ${accent}50` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <p className="font-black text-white text-xl leading-none">{value}</p>
      <p className="text-[10px] text-white/90 text-center leading-tight">{label}</p>
    </div>
  )
}

// ── WA Icon ─────────────────────────────────────────────────────────────────
const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// ── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ deal, onDelete }) {
  const [expanded,  setExpanded]  = useState(false)
  const [copied,    setCopied]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const cfg = DEAL_STATUS_CONFIG[deal.status] || DEAL_STATUS_CONFIG.pending
  const confirmUrl = `${window.location.origin}/deal-confirm/${deal.confirmToken || ''}`
  const waMsg = `مرحباً! يرجى تأكيد الصفقة عبر الرابط التالي 👇\n${confirmUrl}`
  const waUrl = `https://wa.me/${deal.userPhone.replace(/\D/g, '').replace(/^0/, '218')}?text=${encodeURIComponent(waMsg)}`

  const copyLink = () => {
    navigator.clipboard.writeText(confirmUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDelete = async () => {
    if (!window.confirm('هل تريد حذف هذه الصفقة؟')) return
    setDeleting(true)
    try { await onDelete(deal.id) }
    finally { setDeleting(false) }
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
            {!deal.fromOrder && (
              <button onClick={handleDelete} disabled={deleting}
                className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setExpanded(p => !p)} className="p-1 rounded-lg hover:bg-gray-50">
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
          {deal.fromOrder && (
            <p className="text-[10px] text-[#FF7900]/70 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> تم إنشاؤها تلقائياً من طلب مكتمل
            </p>
          )}
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

// ── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({ req, onStatusChange, onMarkRead, proName, highlighted }) {
  const [updating,          setUpdating]          = useState(false)
  const [lifecycleUpdating, setLifecycleUpdating] = useState(false)
  const [expanded,          setExpanded]          = useState(!!highlighted)
  const [localRead,         setLocalRead]         = useState(req.isRead)
  const [showCompleteForm,  setShowCompleteForm]  = useState(false)
  const [completeAmount,    setCompleteAmount]    = useState('')
  const [completeNotes,     setCompleteNotes]     = useState('')
  const [completeErr,       setCompleteErr]       = useState('')
  const cardRef = useRef(null)
  const status = REQUEST_STATUS_CONFIG[req.status] || REQUEST_STATUS_CONFIG.new

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (!localRead) {
        setLocalRead(true)
        api.markRequestRead(req.id).catch(() => {})
        onMarkRead?.(req.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighted])

  const handleExpand = async () => {
    const opening = !expanded
    setExpanded(opening)
    if (opening && !localRead) {
      setLocalRead(true)
      try { await api.markRequestRead(req.id) } catch {}
      onMarkRead?.(req.id)
    }
  }

  const changeStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await api.updateServiceRequest(req.id, newStatus)
      onStatusChange(req.id, newStatus)
    } catch {}
    finally { setUpdating(false) }
  }

  const buildPhoneNum = () => {
    const clean = (req.phone || req.whatsappPhone || '').replace(/\D/g, '')
    if (!clean) return ''
    return clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
  }

  const buildWaUrl = () => {
    const num = buildPhoneNum()
    if (!num) return null
    const msg = `السلام عليكم ${req.customerName}،\nبخصوص طلبك على منصة اطلب فني 🔧\nنوع الطلب: ${req.requestType || '—'}\nهل يمكنكم تحديد موعد مناسب؟ شكراً 🙏`
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
  }

  const handleStartWork = async () => {
    setLifecycleUpdating(true)
    try {
      await api.startWork(req.id, { ownerName: proName || null })
      onStatusChange(req.id, 'in_progress')
    } catch {}
    finally { setLifecycleUpdating(false) }
  }

  const handleComplete = async () => {
    setCompleteErr('')
    if (!completeAmount.trim()) { setCompleteErr('قيمة الخدمة مطلوبة'); return }
    setLifecycleUpdating(true)
    try {
      const updated = await api.completeService(req.id, { serviceAmount: completeAmount, completionNotes: completeNotes || undefined })
      const tok = updated.confirmationToken
      const confirmLink = `${window.location.origin}/service-confirm/${tok}`
      const num = buildPhoneNum()
      if (num) {
        const msg = `مرحباً ${req.customerName}، تم تسجيل انتهاء الخدمة في منصة اطلب فني.\nقيمة الخدمة المسجلة: ${completeAmount} د.ل\nيرجى تأكيد انتهاء الخدمة وتقييم الفني من خلال الرابط التالي:\n${confirmLink}`
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
      }
      onStatusChange(req.id, 'awaiting_customer_confirmation')
      setShowCompleteForm(false)
      setCompleteAmount('')
      setCompleteNotes('')
    } catch { setCompleteErr('حدث خطأ، يرجى المحاولة مجدداً') }
    finally { setLifecycleUpdating(false) }
  }

  const isUnread   = !localRead
  const isTerminal = ['completed_confirmed', 'amount_disputed', 'completion_disputed', 'completed', 'cancelled', 'awaiting_customer_confirmation'].includes(req.status)
  const canStartWork = ['new', 'contacted'].includes(req.status)
  const canComplete  = ['in_progress'].includes(req.status)

  return (
    <div ref={cardRef} className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
      isUnread || highlighted ? 'ring-2 ring-[#FF7900]/40' : ''
    }`} style={{ border: isUnread || highlighted ? '1px solid #FF7900' : '1px solid #F0F2F5' }}>

      {/* ── Collapsed header (always visible) ── */}
      <button type="button" onClick={handleExpand}
        className="w-full p-4 flex items-start justify-between gap-2 text-right active:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-[#FF7900] flex-shrink-0 mt-0.5 animate-pulse" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#071B33] text-sm truncate">{req.customerName}</p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {req.cityName && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {req.cityName}
                </span>
              )}
              {req.requestType && (
                <span className="text-xs text-[#FF7900] font-semibold">{req.requestType}</span>
              )}
              <span className="text-[10px] text-gray-300">
                {new Date(req.createdAt).toLocaleDateString('ar-LY')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #F0F2F5' }}>
          <div className="pt-3 flex flex-wrap items-center gap-2">
            {req.phone && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {req.phone}
              </span>
            )}
            <span className="text-[10px] text-gray-300">
              {new Date(req.createdAt).toLocaleString('ar-LY')}
            </span>
          </div>

          {req.description && (
            <div className="bg-[#FF7900]/5 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600">{req.description}</p>
            </div>
          )}

          {req.photoUrls && req.photoUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {req.photoUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
                </a>
              ))}
            </div>
          )}

          {req.preferredDatetime && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {req.preferredDatetime}
            </p>
          )}

          {req.serviceAmount && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">قيمة الخدمة</span>
              <span className="text-sm font-black text-emerald-700">{req.serviceAmount} د.ل</span>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
            {buildWaUrl() && (
              <a href={buildWaUrl()} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                <WaIcon /> رد على واتساب
              </a>
            )}

            {canStartWork && (
              <>
                {req.status !== 'contacted' && (
                  <button onClick={() => changeStatus('contacted')} disabled={updating}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 disabled:opacity-50">
                    <MessageCircle className="w-3 h-3" /> تم التواصل
                  </button>
                )}
                <button onClick={handleStartWork} disabled={lifecycleUpdating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF7900, #d96400)' }}>
                  {lifecycleUpdating
                    ? <RefreshCw className="w-3 h-3 animate-spin" />
                    : <PlayCircle className="w-3 h-3" />
                  }
                  بدأت العمل
                </button>
              </>
            )}

            {canComplete && !showCompleteForm && (
              <button onClick={() => setShowCompleteForm(true)} disabled={lifecycleUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #065f46)' }}>
                <Flag className="w-3 h-3" /> إنهاء الخدمة
              </button>
            )}

            {!isTerminal && (
              <button onClick={() => changeStatus('cancelled')} disabled={updating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 disabled:opacity-50">
                <XCircle className="w-3 h-3" /> إلغاء
              </button>
            )}
          </div>

          {/* ── Complete service form ── */}
          {showCompleteForm && (
            <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-3 border border-emerald-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-[#071B33]">إنهاء الخدمة</p>
                <button type="button" onClick={() => { setShowCompleteForm(false); setCompleteErr('') }}
                  className="text-xs text-gray-400">إغلاق</button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">قيمة الخدمة (د.ل) *</label>
                <input type="number" min="0" placeholder="أدخل قيمة الخدمة"
                  value={completeAmount}
                  onChange={e => setCompleteAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  style={{ background: '#fff', border: '1.5px solid #E2E8F0' }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ملاحظات (اختياري)</label>
                <textarea rows={2} placeholder="أي ملاحظات عن الخدمة..."
                  value={completeNotes}
                  onChange={e => setCompleteNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-[#071B33] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  style={{ background: '#fff', border: '1.5px solid #E2E8F0' }} />
              </div>
              {completeErr && <p className="text-xs text-red-600 font-semibold">{completeErr}</p>}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <p className="text-[11px] text-blue-600">
                  سيتم فتح واتساب برسالة جاهزة للعميل • عمولة المنصة 2% تُحسب تلقائياً
                </p>
              </div>
              <button type="button" onClick={handleComplete} disabled={lifecycleUpdating}
                className="w-full py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #065f46)' }}>
                {lifecycleUpdating
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <><Flag className="w-4 h-4" /> إرسال وفتح واتساب</>
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Filter Chips ─────────────────────────────────────────────────────────────
function FilterChips({ active, onChange, counts }) {
  const filters = [
    { key: 'all',                            label: 'الكل',                 count: counts.all },
    { key: 'new',                            label: 'جديد',                 count: counts.new },
    { key: 'contacted',                      label: 'تم التواصل',          count: counts.contacted },
    { key: 'in_progress',                    label: 'قيد التنفيذ',          count: counts.in_progress },
    { key: 'awaiting_customer_confirmation', label: 'بانتظار تأكيد العميل', count: counts.awaiting_customer_confirmation },
    { key: 'completed',                      label: 'مكتمل',                count: counts.completed },
    { key: 'cancelled',                      label: 'ملغي',                 count: counts.cancelled },
  ]
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {filters.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            active === f.key
              ? 'bg-[#071B33] text-white shadow-sm'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}>
          {f.label}
          {f.count > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              active === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>{f.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Deal Filter Chips ─────────────────────────────────────────────────────────
function DealFilterChips({ active, onChange, counts }) {
  const filters = [
    { key: 'all',       label: 'الكل',          count: counts.all },
    { key: 'pending',   label: 'بانتظار التأكيد', count: counts.pending },
    { key: 'confirmed', label: 'مؤكدة',          count: counts.confirmed },
    { key: 'cancelled', label: 'ملغية',          count: counts.cancelled },
  ]
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {filters.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            active === f.key
              ? 'bg-[#071B33] text-white shadow-sm'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}>
          {f.label}
          {f.count > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              active === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>{f.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

const DEAL_FORM_DEFAULT = {
  userPhone: '', userName: '', serviceType: '', serviceValue: '', serviceDate: '', description: ''
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ProDashboard() {
  const [, navigate] = useLocation()
  const [session,        setSession]       = useState(null)
  const [requests,       setRequests]      = useState([])
  const [reqLoading,     setReqLoading]    = useState(false)
  const [reqFilter,      setReqFilter]     = useState('all')
  const [activeTab,      setActiveTab]     = useState('profile')
  const [deals,          setDeals]         = useState([])
  const [dealsLoading,   setDealsLoading]  = useState(false)
  const [dealFilter,     setDealFilter]    = useState('all')
  const [showDealForm,   setShowDealForm]  = useState(false)
  const [dealForm,       setDealForm]      = useState(DEAL_FORM_DEFAULT)
  const [submitting,     setSubmitting]    = useState(false)
  const [dealErr,        setDealErr]       = useState('')
  const [categories,     setCategories]    = useState([])
  const [cities,         setCities]        = useState([])
  const [perfStats,      setPerfStats]     = useState(null)
  const [perfLoading,    setPerfLoading]   = useState(false)
  const [highlightId,    setHighlightId]   = useState(null)
  const [genRequests,    setGenRequests]   = useState([])
  const [genOffers,      setGenOffers]     = useState([])
  const [genLoading,     setGenLoading]    = useState(false)
  const [genOfferForm,   setGenOfferForm]  = useState(null) // { requestId, price, etaText, note }
  const [genSubmitting,  setGenSubmitting] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login' + window.location.search); return }
    try { setSession(JSON.parse(raw)) }
    catch { localStorage.removeItem('pro_session'); navigate('/pro-login' + window.location.search) }

    const params = new URLSearchParams(window.location.search)
    const reqId = params.get('requestId')
    if (reqId) { setActiveTab('requests'); setHighlightId(reqId) }

    api.categories().then(cats => {
      setCategories(cats.filter(c => c.isActive !== false))
    }).catch(() => {})

    api.cities().then(setCities).catch(() => {})
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

  const loadPerfStats = useCallback(async (sess) => {
    if (!sess) return
    setPerfLoading(true)
    try {
      const data = await api.pro.myStats(sess.entityType, sess.entityId)
      setPerfStats(data)
    } catch { setPerfStats(null) }
    finally { setPerfLoading(false) }
  }, [])

  const loadGeneralRequests = useCallback(async (sess, { silent } = {}) => {
    if (!sess) return
    if (!silent) setGenLoading(true)
    try {
      const profile = await api.pro.getProfile(sess.entityType, sess.entityId)
      const params = sess.entityType === 'company'
        ? { cityName: profile?.city }
        : { cityId: profile?.cityId, cityName: profile?.cityNameAr }
      const primaryCatId = sess.entityType === 'company' ? profile?.specialty : profile?.categoryId
      const allCatIds = [primaryCatId, ...(profile?.extraSpecialties || [])].filter(Boolean)
      const catParams = { categoryIds: allCatIds.join(','), categoryName: profile?.categoryAr }
      const trackParams = {
        entityType:   sess.entityType,
        entityId:     sess.entityId,
        providerName: profile?.nameAr || profile?.name || profile?.tradeName || '',
        whatsapp:     profile?.whatsapp || profile?.phone || '',
      }
      const [reqs, offers] = await Promise.all([
        api.generalRequests.forPro({ ...params, ...catParams, ...trackParams }),
        api.generalRequests.myOffers(sess.entityType, sess.entityId),
      ])
      setGenRequests(reqs)
      setGenOffers(offers)
    } catch { if (!silent) { setGenRequests([]); setGenOffers([]) } }
    finally { if (!silent) setGenLoading(false) }
  }, [])

  // Load both on session ready (for stats strip accuracy)
  useEffect(() => {
    if (!session) return
    loadRequests(session)
    loadDeals(session)
    loadPerfStats(session)
    loadGeneralRequests(session)
  }, [session])

  // Reload when switching tabs (refresh)
  useEffect(() => {
    if (!session) return
    if (activeTab === 'requests') loadRequests(session)
    if (activeTab === 'deals')    loadDeals(session)
    if (activeTab === 'general')  loadGeneralRequests(session)
  }, [activeTab])

  // Background polling for general requests badge (every 25s, regardless of active tab)
  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => loadGeneralRequests(session, { silent: true }), 25000)
    return () => clearInterval(interval)
  }, [session, loadGeneralRequests])

  // ── Web Audio API notification sound ────────────────────────────────────────
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
      setTimeout(() => ctx.close(), 800)
    } catch {}
  }, [])

  // ── Polling — only when requests tab is active ───────────────────────────────
  const requestsRef = useRef([])
  useEffect(() => { requestsRef.current = requests }, [requests])

  useEffect(() => {
    if (activeTab !== 'requests' || !session) return
    const interval = setInterval(async () => {
      try {
        const data = await api.myServiceRequests(session.entityType, session.entityId)
        const knownIds = new Set(requestsRef.current.map(r => r.id))
        const hasNew   = data.some(r => !knownIds.has(r.id))
        if (hasNew && requestsRef.current.length > 0) playNotificationSound()
        setRequests(data)
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [activeTab, session, playNotificationSound])

  const logout = () => { localStorage.removeItem('pro_session'); navigate('/pro-login') }

  if (!session) return null

  const cfg          = TYPE_CONFIG[session.entityType] || TYPE_CONFIG.technician
  const initials     = (session.displayName || '').trim().slice(0, 1)
  const newCount     = requests.filter(r => r.status === 'new').length
  const pendingDeals = deals.filter(d => d.status === 'pending').length
  const offeredIds   = new Set(genOffers.map(o => o.requestId))
  const genNewCount  = genRequests.filter(r => !offeredIds.has(r.id)).length

  // Request counts for filter chips
  const reqCounts = {
    all:                            requests.length,
    new:                            requests.filter(r => r.status === 'new').length,
    contacted:                      requests.filter(r => r.status === 'contacted').length,
    in_progress:                    requests.filter(r => r.status === 'in_progress').length,
    awaiting_customer_confirmation: requests.filter(r => r.status === 'awaiting_customer_confirmation').length,
    completed:                      requests.filter(r => ['completed', 'completed_confirmed'].includes(r.status)).length,
    cancelled:                      requests.filter(r => r.status === 'cancelled').length,
  }

  // Status summary counters shown atop the requests tab
  const statusSummary = [
    { key: 'new',                            emoji: '🟠', label: 'جديدة',                  count: requests.filter(r => r.status === 'new').length },
    { key: 'in_progress',                    emoji: '🔵', label: 'قيد التنفيذ',             count: requests.filter(r => r.status === 'in_progress').length },
    { key: 'awaiting_customer_confirmation', emoji: '🟢', label: 'بانتظار تأكيد العميل',    count: requests.filter(r => r.status === 'awaiting_customer_confirmation').length },
    { key: 'completed',                      emoji: '⭐', label: 'مكتملة',                  count: requests.filter(r => ['completed', 'completed_confirmed'].includes(r.status)).length },
  ]

  // Deal counts for filter chips
  const dealCounts = {
    all:       deals.length,
    pending:   deals.filter(d => d.status === 'pending').length,
    confirmed: deals.filter(d => d.status === 'confirmed').length,
    cancelled: deals.filter(d => d.status === 'cancelled').length,
  }

  // Filtered lists
  const filteredRequests = reqFilter === 'all'
    ? requests
    : reqFilter === 'completed'
      ? requests.filter(r => ['completed', 'completed_confirmed'].includes(r.status))
      : requests.filter(r => r.status === reqFilter)
  const filteredDeals    = dealFilter === 'all' ? deals    : deals.filter(d => d.status === dealFilter)

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const handleMarkRead = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r))
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

  // Build category options grouped by section
  const sectionNames = {
    home_services:     'خدمات منزلية',
    car_services:      'خدمات سيارات',
    construction:      'بناء وتشطيب',
    tech_security:     'تقنية وأمن',
    moving_general:    'نقل وخدمات عامة',
    gardens_pools:     'حدائق ومسابح',
    energy_generators: 'الطاقة والمولدات',
    business_services: 'الخدمات التجارية',
    more_services:     'خدمات أخرى',
  }
  const catsBySection = categories.reduce((acc, c) => {
    const sec = c.sectionId || 'more_services'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(c)
    return acc
  }, {})

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2440 40%, #0d1f38 100%)' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div className="px-5 pt-14 pb-5 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${cfg.color} 0%, transparent 70%)` }} />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <button onClick={() => navigate('/more')}
            className="flex items-center gap-1.5 text-sm font-bold active:scale-95 transition-all px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>
            <ArrowRight className="w-4 h-4" /> العودة
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
            <LogOut className="w-3.5 h-3.5" /> خروج
          </button>
        </div>

        <div className="flex items-center gap-4 relative z-10 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}99 100%)` }}>
            {initials || cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1"
              style={{ color: cfg.color, background: `${cfg.color}22`, border: `1px solid ${cfg.color}44` }}>
              {cfg.icon}
              {cfg.label}
            </span>
            <h1 className="text-white font-extrabold text-xl leading-tight tracking-tight truncate">{session.displayName}</h1>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="flex gap-2 relative z-10">
          <StatCard
            label={cfg.statsLabels.requests}
            value={requests.length || '—'}
            icon={<ClipboardList className="w-4 h-4" />}
            accent={cfg.color}
          />
          <StatCard
            label={cfg.statsLabels.deals}
            value={dealCounts.confirmed || '—'}
            icon={<Handshake className="w-4 h-4" />}
            accent="#10B981"
          />
          <StatCard
            label={cfg.statsLabels.points}
            value={deals.filter(d => d.status === 'confirmed').reduce((s, d) => s + Number(d.proPoints || 0), 0) || '—'}
            icon={<Star className="w-4 h-4" />}
            accent="#F59E0B"
          />
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────── */}
      <div className="flex mx-4 mb-1 rounded-2xl p-1 gap-1"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        {[
          { key: 'profile',  label: 'ملفي',              badge: 0 },
          { key: 'requests', label: cfg.requestsTab,      badge: newCount },
          { key: 'general',  label: 'الطلبات العامة',     badge: genNewCount },
          { key: 'deals',    label: cfg.dealsTab,         badge: pendingDeals },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              if (tab.key === 'requests' && session) loadRequests(session)
              if (tab.key === 'deals'    && session) loadDeals(session)
              if (tab.key === 'general'  && session) loadGeneralRequests(session)
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-xl relative ${
              activeTab === tab.key ? 'bg-white text-[#071B33] shadow' : 'text-white/85'
            }`}>
            {tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#FF7900] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex-1 px-4 pb-12 pt-3"
        style={{ background: 'linear-gradient(180deg, transparent 0%, #F0F2F5 80px)' }}>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="space-y-3">

            {/* ── Quick summary cards — gradient fills ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Requests card */}
              <div className="rounded-2xl p-4 relative overflow-hidden shadow-md"
                style={{ background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}cc 100%)`, border: `1.5px solid ${cfg.color}` }}>
                <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full opacity-20"
                  style={{ background: 'rgba(255,255,255,0.4)' }} />
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <p className="font-black text-white text-3xl leading-none">{requests.length}</p>
                <p className="text-white text-[11px] font-semibold mt-1">{cfg.statsLabels.requests}</p>
                {newCount > 0 && (
                  <span className="inline-flex items-center gap-1 mt-2 bg-white/25 rounded-full px-2 py-0.5 text-[10px] font-black text-white">
                    ● {newCount} جديد
                  </span>
                )}
              </div>

              {/* Deals card */}
              <div className="rounded-2xl p-4 relative overflow-hidden shadow-md"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981cc 100%)', border: '1.5px solid #059669' }}>
                <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full opacity-20"
                  style={{ background: 'rgba(255,255,255,0.4)' }} />
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <p className="font-black text-white text-3xl leading-none">{dealCounts.confirmed}</p>
                <p className="text-white text-[11px] font-semibold mt-1">{cfg.statsLabels.deals}</p>
                {pendingDeals > 0 && (
                  <span className="inline-flex items-center gap-1 mt-2 bg-white/25 rounded-full px-2 py-0.5 text-[10px] font-black text-white">
                    ● {pendingDeals} معلّقة
                  </span>
                )}
              </div>
            </div>

            {/* ── Profile hero card ── */}
            <button type="button" onClick={() => navigate('/pro/profile')}
              className="w-full rounded-2xl overflow-hidden active:scale-[0.98] transition-transform select-none"
              style={{ WebkitTapHighlightColor: 'transparent', background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)', boxShadow: '0 4px 20px rgba(7,27,51,0.25)' }}>
              <div className="relative px-5 py-4 flex items-center gap-4">
                <div className="absolute top-0 left-0 w-28 h-28 rounded-full opacity-10 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${cfg.color} 0%, transparent 70%)`, transform: 'translate(-30%, -30%)' }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{ background: `${cfg.color}30`, border: `1.5px solid ${cfg.color}50` }}>
                  <User className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 text-right relative z-10">
                  <p className="text-white font-extrabold text-[15px] leading-tight">ملفي الشخصي</p>
                  <p className="text-white/85 text-[11px] mt-0.5">عرض · تعديل · كلمة المرور</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 relative z-10">
                  <ChevronLeft className="w-3.5 h-3.5 text-white/85" />
                </div>
              </div>
            </button>

            {/* ── Account Performance ── */}
            <div className="rounded-2xl overflow-hidden bg-white"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1.5px solid #E2E6EA' }}>
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${cfg.color}30`, border: `1px solid ${cfg.color}40` }}>
                    <BarChart2 className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm leading-tight">أداء حسابي</p>
                    <p className="text-white/75 text-[10px]">Account Performance</p>
                  </div>
                </div>
                <button onClick={() => loadPerfStats(session)} disabled={perfLoading}
                  className="p-1.5 rounded-lg active:scale-95 transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <RefreshCw className={`w-3.5 h-3.5 text-white/85 ${perfLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Metrics grid */}
              {[
                [
                  { icon: <Eye className="w-4 h-4" />,          label: 'مشاهدات',  value: perfStats?.profileViews ?? 0,    color: cfg.color,  bg: `${cfg.color}18`, border: `${cfg.color}30` },
                  { icon: <MessageCircle className="w-4 h-4" />, label: 'واتساب',   value: perfStats?.whatsappClicks ?? 0,  color: '#25D366',  bg: '#25D36618',      border: '#25D36630' },
                  { icon: <Phone className="w-4 h-4" />,         label: 'هاتف',     value: perfStats?.phoneClicks ?? 0,     color: '#3b82f6',  bg: '#3b82f618',      border: '#3b82f630' },
                ],
                [
                  { icon: <ClipboardList className="w-4 h-4" />, label: 'طلبات',   value: perfStats?.serviceRequests ?? 0, color: '#8b5cf6',  bg: '#8b5cf618',      border: '#8b5cf630' },
                  { icon: <Handshake className="w-4 h-4" />,     label: 'صفقات',   value: perfStats?.confirmedDeals ?? 0,  color: '#059669',  bg: '#05966918',      border: '#05966930' },
                  { icon: <Star className="w-4 h-4" />,          label: 'تقييم',   value: perfStats?.avgRating != null ? `${perfStats.avgRating}★` : '—', color: '#F59E0B', bg: '#F59E0B18', border: '#F59E0B30' },
                ],
              ].map((row, ri) => (
                <div key={ri}>
                  {ri > 0 && <div className="h-px bg-[#E8EBF0]" />}
                  <div className="grid grid-cols-3">
                    {row.map((m, i) => (
                      <div key={i}
                        className="py-4 flex flex-col items-center gap-2 relative"
                        style={{
                          background: m.bg,
                          borderRight: i < 2 ? `1px solid ${m.border}` : 'none',
                        }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: '#fff', border: `1.5px solid ${m.border}`, boxShadow: `0 2px 8px ${m.bg}` }}>
                          <span style={{ color: m.color }}>{m.icon}</span>
                        </div>
                        <p className={`font-black text-[#071B33] text-xl leading-none ${perfLoading ? 'opacity-30' : ''}`}>
                          {perfLoading ? '·' : m.value}
                        </p>
                        <p className="text-[10px] font-semibold text-center leading-tight" style={{ color: m.color }}>
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Coming soon tools ── */}
            <div className="rounded-2xl overflow-hidden bg-white"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1.5px solid #E2E6EA' }}>
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#F5F5F7]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#071B33] text-sm">أدوات الباقة المهنية</p>
                    <p className="text-[11px] text-slate-400">ستُفعَّل مع اشتراكك القريب</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                  <Sparkles className="w-3 h-3" /> قريباً
                </span>
              </div>
              <div className="grid grid-cols-2">
                {TOOLS.map((tool, i) => (
                  <div key={tool.id}
                    className={`px-4 py-5 flex flex-col items-center gap-2.5 ${i % 2 === 0 ? 'border-l border-[#F0F2F5]' : ''} ${i < 2 ? 'border-b border-[#F0F2F5]' : ''}`}>
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tool.bg} flex items-center justify-center opacity-30`}>
                      {tool.icon}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-400 text-[13px]">{tool.labelAr}</p>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}aa)` }}>
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-[#071B33] text-sm">{cfg.requestsTitle}</p>
                  <p className="text-[11px] text-gray-400">{requests.length} طلب</p>
                </div>
              </div>
              <button onClick={() => loadRequests(session)}
                className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${reqLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Status summary counters */}
            {requests.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {statusSummary.map(s => (
                  <button key={s.key} onClick={() => setReqFilter(reqFilter === s.key ? 'all' : s.key)}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                      reqFilter === s.key ? 'bg-white shadow-sm ring-1 ring-[#FF7900]/40' : 'bg-white/60'
                    }`}
                    style={{ border: '1px solid #F0F2F5' }}>
                    <span className="text-base leading-none">{s.emoji}</span>
                    <span className="font-black text-[#071B33] text-sm leading-none">{s.count}</span>
                    <span className="text-[9px] text-gray-400 text-center leading-tight px-0.5">{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Filter chips */}
            {requests.length > 0 && (
              <FilterChips active={reqFilter} onChange={setReqFilter} counts={reqCounts} />
            )}

            {reqLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${cfg.color} transparent transparent transparent` }} />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-400">
                  {reqFilter !== 'all' ? `لا توجد طلبات بحالة "${REQUEST_STATUS_CONFIG[reqFilter]?.label}"` : 'لا توجد طلبات بعد'}
                </p>
                <p className="text-xs text-gray-300 mt-1">{cfg.requestsEmpty}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map(r => (
                  <RequestCard key={r.id} req={r} onStatusChange={handleStatusChange} onMarkRead={handleMarkRead}
                    proName={session.displayName} highlighted={r.id === highlightId} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DEALS TAB ── */}
        {activeTab === 'deals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #071B33, #1e3a5f)' }}>
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-[#071B33] text-sm">{cfg.dealsTitle}</p>
                  <p className="text-[11px] text-gray-400">{deals.length} إجمالي</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadDeals(session)}
                  className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${dealsLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setShowDealForm(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
                  <Plus className="w-3.5 h-3.5" /> {cfg.newDealBtn}
                </button>
              </div>
            </div>

            {/* Deal filter chips */}
            {deals.length > 0 && (
              <DealFilterChips active={dealFilter} onChange={setDealFilter} counts={dealCounts} />
            )}

            {/* New Deal Form */}
            {showDealForm && (
              <form onSubmit={submitDeal}
                className="bg-white rounded-3xl p-5 space-y-3 shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <div className="flex items-center justify-between">
                  <p className="font-black text-[#071B33] text-sm">تسجيل {cfg.newDealBtn}</p>
                  <button type="button" onClick={() => { setShowDealForm(false); setDealErr(''); setDealForm(DEAL_FORM_DEFAULT) }}
                    className="text-gray-400 text-xs">إغلاق</button>
                </div>

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
                    {Object.entries(catsBySection).map(([secId, cats]) => (
                      <optgroup key={secId} label={sectionNames[secId] || secId}>
                        {cats.map(c => (
                          <option key={c.id} value={c.nameAr}>{c.nameAr}</option>
                        ))}
                      </optgroup>
                    ))}
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
                    تسجيل
                  </button>
                </div>
              </form>
            )}

            {/* Deals list */}
            {dealsLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-7 h-7 border-2 border-[#071B33] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <Handshake className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-400">
                  {dealFilter !== 'all' ? `لا توجد بيانات لهذا الفلتر` : 'لا توجد بيانات بعد'}
                </p>
                <p className="text-xs text-gray-300 mt-1">{cfg.dealsEmpty}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDeals.map(d => (
                  <DealCard key={d.id} deal={d} onDelete={async (id) => {
                    await api.deals.delete(id, session.entityId, session.entityType)
                    setDeals(prev => prev.filter(x => x.id !== id))
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GENERAL REQUESTS TAB ── */}
        {activeTab === 'general' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7B2FBE, #4c1d80)' }}>
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-[#071B33] text-sm">طلبات خدمات عامة وعروض</p>
                  <p className="text-[11px] text-gray-400">{genRequests.length} طلب متاح</p>
                </div>
              </div>
              <button onClick={() => loadGeneralRequests(session)}
                className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${genLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 text-xs text-purple-700">
              <p>هذه طلبات عامة من عملاء يبحثون عن فني — قدّم عرض سعر ليختارك العميل. لن يظهر رقم العميل إلا بعد اختيارك.</p>
            </div>

            {genLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#7B2FBE transparent transparent transparent' }} />
              </div>
            ) : genRequests.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-400">لا توجد طلبات عامة حاليًا</p>
                <p className="text-xs text-gray-300 mt-1">ستظهر هنا الطلبات المطابقة لمدينتك وتخصصك</p>
              </div>
            ) : (
              <div className="space-y-3">
                {genRequests.map(r => {
                  const myOffer = genOffers.find(o => o.requestId === r.id)
                  const formOpen = genOfferForm?.requestId === r.id
                  return (
                    <div key={r.id} className="bg-white rounded-3xl p-4 shadow-sm" style={{ border: '1px solid #F0F2F5' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-black text-[#071B33] text-sm truncate">{r.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            {r.cityName && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{r.cityName}</span>}
                            {r.categoryName && <span>• {r.categoryName}</span>}
                          </div>
                        </div>
                        {myOffer && (
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap ${
                            myOffer.status === 'selected' ? 'bg-emerald-100 text-emerald-700' : myOffer.status === 'rejected' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {myOffer.status === 'selected' ? 'تم اختيارك ✓' : myOffer.status === 'rejected' ? 'لم يتم اختيارك' : 'عرضك قيد المراجعة'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{r.description}</p>
                      {Array.isArray(r.photoUrls) && r.photoUrls.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {r.photoUrls.map((p, i) => (
                            <img key={i} src={getFileUrl(p)} alt="" className="w-14 h-14 rounded-lg object-cover" />
                          ))}
                        </div>
                      )}

                      {!myOffer && !formOpen && (
                        <button onClick={() => setGenOfferForm({ requestId: r.id, price: '', etaText: '', note: '' })}
                          className="mt-3 w-full py-2.5 rounded-xl text-xs font-black text-white active:scale-95 transition-all"
                          style={{ background: 'linear-gradient(135deg, #7B2FBE, #4c1d80)' }}>
                          تقديم عرض سعر
                        </button>
                      )}

                      {myOffer && myOffer.status !== 'rejected' && !formOpen && (
                        <button onClick={() => setGenOfferForm({ requestId: r.id, price: myOffer.price || '', etaText: myOffer.etaText || '', note: myOffer.note || '' })}
                          className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 active:scale-95 transition-all">
                          تعديل العرض ({myOffer.price} د.ل)
                        </button>
                      )}

                      {formOpen && (
                        <div className="mt-3 space-y-2 bg-gray-50 rounded-2xl p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" min="0" placeholder="السعر (د.ل) *" required
                              value={genOfferForm.price}
                              onChange={e => setGenOfferForm(f => ({ ...f, price: e.target.value }))}
                              className="px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B2FBE]/30" />
                            <input type="text" placeholder="المدة (مثال: خلال يوم)"
                              value={genOfferForm.etaText}
                              onChange={e => setGenOfferForm(f => ({ ...f, etaText: e.target.value }))}
                              className="px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B2FBE]/30" />
                          </div>
                          <textarea rows={2} placeholder="ملاحظة (اختياري)"
                            value={genOfferForm.note}
                            onChange={e => setGenOfferForm(f => ({ ...f, note: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7B2FBE]/30 resize-none" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setGenOfferForm(null)}
                              className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-500 bg-white border border-gray-200">
                              إلغاء
                            </button>
                            <button type="button" disabled={genSubmitting || !genOfferForm.price}
                              onClick={async () => {
                                setGenSubmitting(true)
                                try {
                                  await api.generalRequests.submitOffer(genOfferForm.requestId, {
                                    entityType: session.entityType, entityId: session.entityId,
                                    price: genOfferForm.price, etaText: genOfferForm.etaText || undefined, note: genOfferForm.note || undefined,
                                  })
                                  setGenOfferForm(null)
                                  loadGeneralRequests(session)
                                } catch { alert('حدث خطأ، حاول مرة أخرى') }
                                finally { setGenSubmitting(false) }
                              }}
                              className="flex-1 py-2 rounded-xl text-xs font-black text-white disabled:opacity-50"
                              style={{ background: 'linear-gradient(135deg, #7B2FBE, #4c1d80)' }}>
                              {genSubmitting ? 'جارٍ الإرسال...' : 'إرسال العرض'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
