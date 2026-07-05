import { useState, useEffect } from 'react'
import { ListChecks, MapPin, Tag, RefreshCw, Filter, ChevronDown, Star, Phone } from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'

const STATUS_CONFIG = {
  open:      { label: 'مفتوح — بانتظار العروض', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  assigned:  { label: 'تم اختيار عرض',          color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'ملغي',                    color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

const OFFER_STATUS_CONFIG = {
  pending:  { label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-600' },
  selected: { label: 'مقبول',        color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'مرفوض',        color: 'bg-red-50 text-red-500' },
}

const ENTITY_TYPE_LABELS = { technician: 'فني', company: 'شركة', supplier: 'مورد' }

function OfferRow({ offer }) {
  const cfg = OFFER_STATUS_CONFIG[offer.status] || OFFER_STATUS_CONFIG.pending
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
      {offer.providerPhoto ? (
        <img src={getFileUrl(offer.providerPhoto)} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#071B33] text-sm">{offer.providerName || '—'}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#071B33]/8 text-[#071B33]/60">
            {ENTITY_TYPE_LABELS[offer.entityType] || offer.entityType}
          </span>
          {offer.providerRating && (
            <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {offer.providerRating}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-gray-500">
          <span className="font-black text-[#FF7900]">{offer.price} د.ل</span>
          {offer.etaText && <span>{offer.etaText}</span>}
          <span className="text-[10px] text-gray-300">{new Date(offer.createdAt).toLocaleString('ar-LY')}</span>
        </div>
        {offer.note && <p className="text-xs text-gray-500 mt-1">{offer.note}</p>}
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
    </div>
  )
}

function RequestCard({ req }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.open
  const offers = req.offers || []

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${
      req.status === 'open' && offers.length === 0 ? 'border-amber-200' : 'border-gray-100'
    }`}>
      <button type="button" onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-start justify-between gap-3 text-right active:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#071B33] text-sm" dir="ltr">{req.orderNumber}</span>
            <span className="font-bold text-[#071B33] text-sm">{req.customerName}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{req.title}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {req.cityName && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {req.cityName}
              </span>
            )}
            {req.categoryName && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {req.categoryName}
              </span>
            )}
            <span className="text-[10px] text-gray-300">{new Date(req.createdAt).toLocaleString('ar-LY')}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-[10px] font-bold text-gray-400">{offers.length} عرض</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #F0F2F5' }}>
          <div className="pt-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {req.whatsapp}
            </span>
            <span className="text-[10px] text-gray-300" dir="ltr">كود التتبع: {req.trackingCode}</span>
          </div>

          {req.description && (
            <div className="bg-[#FF7900]/5 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600">{req.description}</p>
            </div>
          )}

          {req.photoUrls && req.photoUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {req.photoUrls.map((url, i) => (
                <a key={i} href={getFileUrl(url)} target="_blank" rel="noreferrer"
                  className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0">
                  <img src={getFileUrl(url)} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}

          <div className="pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
            <p className="text-xs font-bold text-gray-500 mb-2">
              العروض المقدمة ({offers.length})
            </p>
            {offers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">لا توجد عروض بعد</p>
            ) : (
              <div className="space-y-2">
                {offers.map(o => <OfferRow key={o.id} offer={o} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminGeneralRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const qs = params.toString()
      const data = await api.admin.generalRequests.list(qs ? '?' + qs : '')
      setRequests(data)
    } catch { setRequests([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])
  useEffect(() => {
    const interval = setInterval(load, 25000)
    return () => clearInterval(interval)
  }, [filterStatus])

  const counts = { all: requests.length }
  Object.keys(STATUS_CONFIG).forEach(s => { counts[s] = requests.filter(r => r.status === s).length })
  const noOffersYet = requests.filter(r => r.status === 'open' && (r.offers || []).length === 0).length

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
            <ListChecks className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#071B33]">طلبات خدمات عامة وعروض</h1>
            <p className="text-sm text-gray-500">
              {requests.length} طلب
              {noOffersYet > 0 && <span className="text-amber-500 font-bold"> · {noOffersYet} بدون عروض بعد</span>}
            </p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Filter className="w-3.5 h-3.5" /> فلترة
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'open', label: 'مفتوح' },
            { key: 'assigned', label: 'تم الاختيار' },
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
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <ListChecks className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => <RequestCard key={r.id} req={r} />)}
        </div>
      )}
    </div>
  )
}
