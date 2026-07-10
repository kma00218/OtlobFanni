import { useState } from 'react'
import { ListChecks, MapPin, Tag, ChevronDown, Phone, Star, Filter, RefreshCw, Trash2, XCircle, CheckCircle2, MessageCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open:      { label: 'مفتوح — بانتظار العروض', color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  assigned:  { label: 'تم اختيار عرض',           color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'ملغي',                     color: 'bg-red-100 text-red-700',         dot: 'bg-red-500' },
}

const OFFER_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-600' },
  selected: { label: 'مقبول ✓',     color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'مرفوض',       color: 'bg-red-50 text-red-500' },
}

type Offer = { id: string; providerName: string; entityType: string; price: string; etaText: string; note: string; status: string; providerRating: string; createdAt: string }
type Request = { id: string; orderNumber: string; customerName: string; whatsapp: string; cityName: string; categoryName: string; title: string; description: string; status: string; createdAt: string; offers: Offer[] }

const SAMPLE_REQUESTS: Request[] = [
  {
    id: 'demo_gr_001', orderNumber: 'GR-001', customerName: 'أحمد الورفلي',
    whatsapp: '0911234567', cityName: 'طرابلس', categoryName: 'كهربائي',
    title: 'تركيب لوحة كهربائية جديدة',
    description: 'أريد تركيب لوحة كهربائية جديدة للمنزل مع تحديث كامل للأسلاك في غرفتين. الوضع الحالي قديم جداً.',
    status: 'open', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), offers: [],
  },
  {
    id: 'demo_gr_002', orderNumber: 'GR-002', customerName: 'فاطمة البوسيفي',
    whatsapp: '0921987654', cityName: 'طرابلس', categoryName: 'سباك',
    title: 'إصلاح تسرب مياه في الحمام',
    description: 'يوجد تسرب مياه تحت حوض الغسيل منذ يومين، الأرضية بدأت تتأثر. أحتاج إصلاح عاجل.',
    status: 'open', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    offers: [
      { id: 'o1', providerName: 'محمد السني', entityType: 'technician', price: '150', etaText: 'خلال يوم', note: 'أستطيع الحضور صباحاً', status: 'pending', providerRating: '4.8', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'o2', providerName: 'شركة الماء والنور', entityType: 'company', price: '200', etaText: 'خلال ساعتين', note: '', status: 'pending', providerRating: '4.5', createdAt: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    id: 'demo_gr_003', orderNumber: 'GR-003', customerName: 'خالد المنتصر',
    whatsapp: '0915556677', cityName: 'طرابلس', categoryName: 'تكييف',
    title: 'صيانة وتنظيف مكيفين',
    description: 'مكيفان في الصالون وغرفة النوم يحتاجان تنظيف فلاتر وصيانة دورية قبل الصيف. يُفضل أسرع وقت.',
    status: 'assigned', createdAt: new Date(Date.now() - 3600000).toISOString(),
    offers: [
      { id: 'o3', providerName: 'فني برد وحرارة', entityType: 'technician', price: '120', etaText: 'خلال 3 ساعات', note: 'خبرة 10 سنوات في تكييف', status: 'selected', providerRating: '4.9', createdAt: new Date(Date.now() - 1200000).toISOString() },
    ],
  },
]

function OfferRow({ offer, canSelect }: { offer: Offer; canSelect: boolean }) {
  const cfg = OFFER_STATUS[offer.status] || OFFER_STATUS.pending
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 ${offer.status === 'selected' ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
      <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-black text-gray-500">
        {offer.providerName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#071B33] text-sm">{offer.providerName}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/8 text-black/50">
            {offer.entityType === 'technician' ? 'فني' : 'شركة'}
          </span>
          {offer.providerRating && (
            <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {offer.providerRating}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
          <span className="font-black text-[#FF7900]">{offer.price} د.ل</span>
          {offer.etaText && <span>{offer.etaText}</span>}
        </div>
        {offer.note && <p className="text-xs text-gray-500 mt-1">{offer.note}</p>}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
        {canSelect && offer.status !== 'selected' && (
          <button className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-600 text-white">
            اختر هذا
          </button>
        )}
      </div>
    </div>
  )
}

function RequestCard({ req }: { req: Request }) {
  const [expanded, setExpanded] = useState(req.id === 'demo_gr_002')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.open
  const offers = req.offers || []
  const noOffers = req.status === 'open' && offers.length === 0

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${noOffers ? 'border-amber-200' : 'border-gray-100'}`}>
      <button type="button" onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-start justify-between gap-3 text-right">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#071B33] text-sm" dir="ltr">{req.orderNumber}</span>
            <span className="font-bold text-[#071B33] text-sm">{req.customerName}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{req.title}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.cityName}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Tag className="w-3 h-3" /> {req.categoryName}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-[10px] font-bold text-gray-400">{offers.length} عرض</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #F0F2F5' }}>
          {/* Contact + Admin actions */}
          <div className="pt-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> <span dir="ltr">{req.whatsapp}</span></span>
              <a href={`https://wa.me/218${req.whatsapp.slice(1)}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl text-white"
                style={{ background: '#25D366' }}>
                <MessageCircle className="w-3.5 h-3.5" /> واتساب
              </a>
            </div>
            <div className="flex items-center gap-2">
              {req.status === 'open' && (
                <button className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50">
                  <XCircle className="w-3.5 h-3.5" /> إلغاء الطلب
                </button>
              )}
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-xl border border-red-200 text-red-600 bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              ) : (
                <div className="flex gap-1">
                  <button className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-red-600 text-white">تأكيد الحذف</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-[11px] font-bold px-2 py-1.5 rounded-xl bg-gray-100 text-gray-600">لا</button>
                </div>
              )}
            </div>
          </div>

          {req.description && (
            <div className="bg-[#FF7900]/5 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600">{req.description}</p>
            </div>
          )}

          <div className="pt-1" style={{ borderTop: '1px solid #F0F2F5' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500">العروض المقدمة ({offers.length})</p>
              {req.status === 'open' && offers.length > 0 && (
                <span className="text-[10px] text-gray-400">اضغط «اختر هذا» لتحديد عرض نيابةً عن العميل</span>
              )}
            </div>
            {offers.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">لا توجد عروض بعد</p>
              : <div className="space-y-2">{offers.map(o => <OfferRow key={o.id} offer={o} canSelect={req.status === 'open'} />)}</div>
            }
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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#071B33]">طلبات خدمات عامة وعروض</h1>
              <p className="text-sm text-gray-500">
                {SAMPLE_REQUESTS.length} طلب
                {noOffersCount > 0 && <span className="text-amber-500 font-bold"> · {noOffersCount} بدون عروض بعد</span>}
              </p>
            </div>
          </div>
          <button className="p-2 rounded-xl hover:bg-gray-100"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
        </div>

        {/* Admin capabilities banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
          <p><span className="font-black">صلاحيات الأدمن: </span>يمكنك إلغاء الطلبات، حذفها، اختيار عرض نيابةً عن العميل، والتواصل مع العميل عبر واتساب.</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><Filter className="w-3.5 h-3.5" /> فلترة</div>
          <div className="flex flex-wrap gap-2">
            {[{ k: 'all', l: 'الكل', c: 3 }, { k: 'open', l: 'مفتوح', c: 2 }, { k: 'assigned', l: 'تم الاختيار', c: 1 }, { k: 'cancelled', l: 'ملغي', c: 0 }].map((s, i) => (
              <button key={s.k} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${i === 0 ? 'bg-[#FF7900] text-white border-[#FF7900]' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {s.l} <span className={i === 0 ? 'opacity-80' : 'text-gray-400'}>({s.c})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {SAMPLE_REQUESTS.map(r => <RequestCard key={r.id} req={r} />)}
        </div>
      </div>
    </div>
  )
}
