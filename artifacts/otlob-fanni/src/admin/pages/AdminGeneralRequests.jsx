import { useState, useEffect } from 'react'
import { ListChecks, MapPin, Tag, RefreshCw, Filter, ChevronDown, Star, Phone, Trash2, XCircle, CheckCircle2, MessageCircle, Users, Eye } from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'

const STATUS_CONFIG = {
  open:      { label: 'مفتوح — بانتظار العروض', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  assigned:  { label: 'تم اختيار عرض',          color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'ملغي',                    color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

const OFFER_STATUS_CONFIG = {
  pending:  { label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-600' },
  selected: { label: 'مقبول ✓',     color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'مرفوض',       color: 'bg-red-50 text-red-500' },
}

const ENTITY_TYPE_LABELS = { technician: 'فني', company: 'شركة', supplier: 'مورد' }

function OfferRow({ offer, canSelect, onSelect, selecting }) {
  const cfg = OFFER_STATUS_CONFIG[offer.status] || OFFER_STATUS_CONFIG.pending
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 ${offer.status === 'selected' ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
      {offer.providerPhoto ? (
        <img src={getFileUrl(offer.providerPhoto)} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-black text-gray-500">
          {(offer.providerName || '?')[0]}
        </div>
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
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
        {canSelect && offer.status !== 'selected' && (
          <button
            onClick={() => onSelect(offer.id)}
            disabled={selecting}
            className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {selecting ? '...' : 'اختر هذا'}
          </button>
        )}
      </div>
    </div>
  )
}

const ENTITY_LABELS = { technician: 'فني', company: 'شركة', supplier: 'مورد' }

function RecipientRow({ r }) {
  const wa = r.whatsapp
    ? `https://wa.me/${r.whatsapp.replace(/^0/, '218').replace(/\D/g, '')}`
    : null
  const isViewed = r.source === 'view'
  return (
    <div className={`flex items-center gap-3 rounded-xl p-2.5 ${isViewed ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isViewed ? 'bg-emerald-100' : 'bg-orange-100'}`}>
        {isViewed
          ? <Eye className="w-3.5 h-3.5 text-emerald-600" />
          : <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#071B33] text-xs">{r.providerName || '—'}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
            {ENTITY_LABELS[r.entityType] || r.entityType}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isViewed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-50 text-orange-600'}`}>
            {isViewed ? '👁 فتح لوحته' : '📢 وصله الطلب'}
          </span>
        </div>
        {r.whatsapp && <p className="text-[10px] text-gray-400 mt-0.5" dir="ltr">{r.whatsapp}</p>}
      </div>
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg text-white flex-shrink-0"
          style={{ background: '#25D366' }}>
          <MessageCircle className="w-3 h-3" /> واتساب
        </a>
      )}
    </div>
  )
}

function RequestCard({ req, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [acting, setActing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [showRecipients, setShowRecipients] = useState(false)
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.open
  const offers = req.offers || []
  const recipients = req.recipients || []

  const handleCancel = async () => {
    if (!confirm('هل تريد إلغاء هذا الطلب؟')) return
    setActing('cancel')
    try { await api.admin.generalRequests.cancel(req.id); onRefresh() }
    catch { alert('فشل الإلغاء') }
    finally { setActing(null) }
  }

  const handleDelete = async () => {
    setActing('delete')
    try { await api.admin.generalRequests.remove(req.id); onRefresh() }
    catch { alert('فشل الحذف') }
    finally { setActing(null); setConfirmDelete(false) }
  }

  const handleSelectOffer = async (offerId) => {
    setSelecting(true)
    try { await api.admin.generalRequests.selectOffer(req.id, offerId); onRefresh() }
    catch { alert('فشل اختيار العرض') }
    finally { setSelecting(false) }
  }

  const whatsappUrl = req.whatsapp
    ? `https://wa.me/${req.whatsapp.replace(/^0/, '218')}`
    : null

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
          <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-0.5">
            <Eye className="w-2.5 h-2.5" />{recipients.length} استلم
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #F0F2F5' }}>
          {/* Contact + actions row */}
          <div className="pt-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> <span dir="ltr">{req.whatsapp}</span>
              </span>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl text-white active:scale-95 transition-all"
                  style={{ background: '#25D366' }}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> واتساب
                </a>
              )}
            </div>

            {/* Admin action buttons */}
            <div className="flex items-center gap-2">
              {req.status === 'open' && (
                <button
                  onClick={handleCancel}
                  disabled={!!acting}
                  className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {acting === 'cancel' ? 'جارٍ...' : 'إلغاء الطلب'}
                </button>
              )}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={!!acting}
                  className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    disabled={!!acting}
                    className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {acting === 'delete' ? 'جارٍ...' : 'تأكيد الحذف'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[11px] font-bold px-2 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    لا
                  </button>
                </div>
              )}
            </div>
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

          {/* Recipients section */}
          <div className="pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
            <button
              type="button"
              onClick={() => setShowRecipients(v => !v)}
              className="w-full flex items-center justify-between mb-2 text-right"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <p className="text-xs font-bold text-gray-500">من وصله الطلب ({recipients.length})</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showRecipients ? 'rotate-180' : ''}`} />
            </button>
            {showRecipients && (
              recipients.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">لم يصل الطلب لأي فني بعد</p>
              ) : (
                <div className="space-y-1.5 mb-2">
                  {recipients.map(r => <RecipientRow key={r.id} r={r} />)}
                </div>
              )
            )}
          </div>

          {/* Offers section */}
          <div className="pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500">العروض المقدمة ({offers.length})</p>
              {req.status === 'open' && offers.length > 0 && (
                <span className="text-[10px] text-gray-400">اضغط «اختر هذا» لتحديد العرض نيابةً عن العميل</span>
              )}
            </div>
            {offers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">لا توجد عروض بعد</p>
            ) : (
              <div className="space-y-2">
                {offers.map(o => (
                  <OfferRow
                    key={o.id}
                    offer={o}
                    canSelect={req.status === 'open'}
                    onSelect={handleSelectOffer}
                    selecting={selecting}
                  />
                ))}
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
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Admin capabilities info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
        <p>
          <span className="font-black">صلاحيات الأدمن: </span>
          يمكنك إلغاء الطلبات، حذفها، اختيار عرض نيابةً عن العميل، والتواصل مع العميل مباشرةً عبر واتساب.
        </p>
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
          {requests.map(r => <RequestCard key={r.id} req={r} onRefresh={load} />)}
        </div>
      )}
    </div>
  )
}
