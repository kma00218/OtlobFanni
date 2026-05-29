import { useState, useEffect } from 'react'
import { ClipboardList, Phone, MapPin, Clock, CheckCircle, XCircle, MessageCircle, RefreshCw, Filter, ExternalLink } from 'lucide-react'
import api from '../../lib/api'

const STATUS_CONFIG = {
  new:       { label: 'جديد',          color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  contacted: { label: 'تم التواصل',    color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  completed: { label: 'مكتمل',         color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'ملغي',          color: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
}

const OWNER_TYPE_LABELS = {
  technician: 'فني',
  company:    'شركة',
  supplier:   'مورد',
}

const OWNER_TYPE_ROUTES = {
  technician: 'technician',
  company:    'company',
  supplier:   'supplier',
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

function RequestCard({ req, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.new
  const ownerLabel = OWNER_TYPE_LABELS[req.ownerType] || req.ownerType
  const profilePath = req.ownerId && req.ownerType
    ? `/${OWNER_TYPE_ROUTES[req.ownerType] || req.ownerType}/${req.ownerId}`
    : null

  const changeStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await api.admin.serviceRequests.update(req.id, newStatus)
      onStatusChange(req.id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  const buildWaUrl = () => {
    const clean = (req.phone || '').replace(/\D/g, '')
    if (!clean) return null
    const num = clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
    const msg = `السلام عليكم ${req.customerName}،\nبخصوص طلبك للخدمة على منصة اطلب فني 🔧\nنوع الطلب: ${req.requestType || '—'}\nهل يمكنكم تحديد موعد مناسب؟\nشكراً لتواصلكم 🙏`
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#071B33] text-sm">{req.customerName}</span>
            {req.ownerType && (
              profilePath ? (
                <a
                  href={profilePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#071B33]/8 text-[#071B33] hover:bg-[#071B33]/15 transition-colors">
                  → {ownerLabel} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#071B33]/8 text-[#071B33]/60">
                  → {ownerLabel}
                </span>
              )
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
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
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {req.preferredDatetime}
        </div>
      )}

      {/* Created at */}
      <p className="text-[10px] text-gray-300">
        {new Date(req.createdAt).toLocaleString('ar-LY')}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
        {/* View profile */}
        {profilePath && (
          <a href={profilePath} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#071B33]/6 text-[#071B33] hover:bg-[#071B33]/12 border border-[#071B33]/15 transition-colors">
            <ExternalLink className="w-3 h-3" /> عرض الملف الشخصي
          </a>
        )}
        {/* WhatsApp reply */}
        {req.phone && (
          <a href={buildWaUrl()} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors">
            <WaIcon /> رد على واتساب
          </a>
        )}
        {req.status !== 'contacted' && req.status !== 'completed' && req.status !== 'cancelled' && (
          <button onClick={() => changeStatus('contacted')} disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50">
            <MessageCircle className="w-3 h-3" /> تم التواصل
          </button>
        )}
        {req.status !== 'completed' && req.status !== 'cancelled' && (
          <button onClick={() => changeStatus('completed')} disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50">
            <CheckCircle className="w-3 h-3" /> مكتمل
          </button>
        )}
        {req.status !== 'cancelled' && (
          <button onClick={() => changeStatus('cancelled')} disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
            <XCircle className="w-3 h-3" /> إلغاء
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFilterStatus]       = useState('all')
  const [filterOwnerType, setFilterOwnerType] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all')    params.set('status', filterStatus)
      if (filterOwnerType !== 'all') params.set('ownerType', filterOwnerType)
      const qs = params.toString()
      const data = await api.admin.serviceRequests.list(qs ? '?' + qs : '')
      setRequests(data)
    } catch { setRequests([]) }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus, filterOwnerType])

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const counts = { all: requests.length }
  Object.keys(STATUS_CONFIG).forEach(s => { counts[s] = requests.filter(r => r.status === s).length })

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#071B33]">طلبات العملاء</h1>
            <p className="text-sm text-gray-500">{requests.length} طلب</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Filter className="w-3.5 h-3.5" /> فلترة
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'new', label: 'جديد' },
            { key: 'contacted', label: 'تم التواصل' },
            { key: 'completed', label: 'مكتمل' },
            { key: 'cancelled', label: 'ملغي' },
          ].map(s => (
            <button key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === s.key
                  ? 'bg-[#FF7900] text-white border-[#FF7900]'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}>
              {s.label}
              {counts[s.key] != null && (
                <span className={`mr-1.5 ${filterStatus === s.key ? 'opacity-80' : 'text-gray-400'}`}>
                  ({counts[s.key]})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'كل الأنواع' },
            { key: 'technician', label: 'فنيون' },
            { key: 'company', label: 'شركات' },
            { key: 'supplier', label: 'موردون' },
          ].map(t => (
            <button key={t.key}
              onClick={() => setFilterOwnerType(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filterOwnerType === t.key
                  ? 'bg-[#071B33] text-white border-[#071B33]'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <RequestCard key={r.id} req={r} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}
