import { useState } from 'react'
import { ListChecks, MapPin, Tag, ChevronDown, Phone, Star, Filter, RefreshCw } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open:     { label: 'مفتوح — بانتظار العروض', color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  assigned: { label: 'تم اختيار عرض',          color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
}

const OFFER_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-600' },
  selected: { label: 'مقبول',        color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'مرفوض',        color: 'bg-red-50 text-red-500' },
}

const SAMPLE_REQUESTS = [
  {
    id: 'demo_gr_001',
    orderNumber: 'GR-001',
    customerName: 'أحمد الورفلي',
    whatsapp: '0911234567',
    cityName: 'طرابلس',
    categoryName: 'كهربائي',
    title: 'تركيب لوحة كهربائية جديدة',
    description: 'أريد تركيب لوحة كهربائية جديدة للمنزل مع تحديث كامل للأسلاك في غرفتين. الوضع الحالي قديم جداً.',
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    offers: [],
  },
  {
    id: 'demo_gr_002',
    orderNumber: 'GR-002',
    customerName: 'فاطمة البوسيفي',
    whatsapp: '0921987654',
    cityName: 'طرابلس',
    categoryName: 'سباك',
    title: 'إصلاح تسرب مياه في الحمام',
    description: 'يوجد تسرب مياه تحت حوض الغسيل منذ يومين، الأرضية بدأت تتأثر. أحتاج إصلاح عاجل.',
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    offers: [
      { id: 'o1', providerName: 'محمد السني', entityType: 'technician', price: '150', etaText: 'خلال يوم', note: 'أستطيع الحضور صباحاً', status: 'pending', providerRating: '4.8', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'o2', providerName: 'شركة الماء والنور', entityType: 'company', price: '200', etaText: 'خلال ساعتين', note: '', status: 'pending', providerRating: '4.5', createdAt: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    id: 'demo_gr_003',
    orderNumber: 'GR-003',
    customerName: 'خالد المنتصر',
    whatsapp: '0915556677',
    cityName: 'طرابلس',
    categoryName: 'تكييف',
    title: 'صيانة وتنظيف مكيفين',
    description: 'مكيفان في الصالون وغرفة النوم يحتاجان تنظيف فلاتر وصيانة دورية قبل الصيف. يُفضل أسرع وقت.',
    status: 'assigned',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    offers: [
      { id: 'o3', providerName: 'فني برد وحرارة', entityType: 'technician', price: '120', etaText: 'خلال 3 ساعات', note: 'خبرة 10 سنوات في تكييف', status: 'selected', providerRating: '4.9', createdAt: new Date(Date.now() - 1200000).toISOString() },
    ],
  },
]

function OfferRow({ offer }: { offer: typeof SAMPLE_REQUESTS[0]['offers'][0] }) {
  const cfg = OFFER_STATUS[offer.status] || OFFER_STATUS.pending
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
      <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-black text-gray-500">
        {offer.providerName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#071B33] text-sm">{offer.providerName}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#071B33]/8 text-[#071B33]/60">
            {offer.entityType === 'technician' ? 'فني' : 'شركة'}
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
        </div>
        {offer.note && <p className="text-xs text-gray-500 mt-1">{offer.note}</p>}
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
    </div>
  )
}

function RequestCard({ req }: { req: typeof SAMPLE_REQUESTS[0] }) {
  const [expanded, setExpanded] = useState(req.id === 'demo_gr_002')
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.open
  const offers = req.offers || []
  const noOffers = req.status === 'open' && offers.length === 0

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${noOffers ? 'border-amber-200' : 'border-gray-100'}`}>
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
              <Phone className="w-3 h-3" /> <span dir="ltr">{req.whatsapp}</span>
            </span>
          </div>
          {req.description && (
            <div className="bg-[#FF7900]/5 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600">{req.description}</p>
            </div>
          )}
          <div className="pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
            <p className="text-xs font-bold text-gray-500 mb-2">العروض المقدمة ({offers.length})</p>
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

export default function AdminGeneralRequestsPreview() {
  const noOffersCount = SAMPLE_REQUESTS.filter(r => r.status === 'open' && r.offers.length === 0).length

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-5" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#071B33]">طلبات خدمات عامة وعروض</h1>
              <p className="text-sm text-gray-500">
                {SAMPLE_REQUESTS.length} طلب
                {noOffersCount > 0 && (
                  <span className="text-amber-500 font-bold"> · {noOffersCount} بدون عروض بعد</span>
                )}
              </p>
            </div>
          </div>
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Filter className="w-3.5 h-3.5" /> فلترة
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل', count: 3 },
              { key: 'open', label: 'مفتوح', count: 2 },
              { key: 'assigned', label: 'تم الاختيار', count: 1 },
              { key: 'cancelled', label: 'ملغي', count: 0 },
            ].map((s, i) => (
              <button key={s.key}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  i === 0
                    ? 'bg-[#FF7900] text-white border-[#FF7900]'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                {s.label}
                <span className={`mr-1.5 ${i === 0 ? 'opacity-80' : 'text-gray-400'}`}>({s.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Request Cards */}
        <div className="space-y-3">
          {SAMPLE_REQUESTS.map(r => <RequestCard key={r.id} req={r} />)}
        </div>
      </div>
    </div>
  )
}
