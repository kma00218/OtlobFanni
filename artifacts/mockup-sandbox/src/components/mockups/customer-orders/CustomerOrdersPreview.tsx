import { useState } from 'react'
import { Users, Search, KeyRound, Phone, User as UserIcon, ChevronDown, ClipboardList, ListChecks, MapPin, Tag, RefreshCw } from 'lucide-react'

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  open:        { label: 'مفتوح',        color: 'bg-blue-100 text-blue-700' },
  new:         { label: 'جديد',         color: 'bg-orange-100 text-orange-700' },
  assigned:    { label: 'مُسند',        color: 'bg-purple-100 text-purple-700' },
  in_progress: { label: 'جارٍ',         color: 'bg-indigo-100 text-indigo-700' },
  completed:   { label: 'مكتمل ✓',     color: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { label: 'ملغي',         color: 'bg-red-100 text-red-600' },
  disputed:    { label: 'خلاف',         color: 'bg-yellow-100 text-yellow-700' },
}

type ServiceReq = { id: string; orderNumber: string; category: string; city: string; status: string; date: string; type: 'service' }
type GeneralReq = { id: string; orderNumber: string; title: string; city: string; status: string; date: string; type: 'general'; offersCount: number }
type AnyReq = ServiceReq | GeneralReq

type Customer = {
  id: string; name: string; username: string; whatsapp: string; joinedAt: string;
  requests: AnyReq[]
}

const CUSTOMERS: Customer[] = [
  {
    id: 'c1', name: 'أحمد الورفلي', username: 'ahmed_w', whatsapp: '0911234567',
    joinedAt: '2026-05-10',
    requests: [
      { id: 'r1', orderNumber: 'SR-3021', category: 'كهربائي',    city: 'طرابلس', status: 'completed',   date: '2026-06-15', type: 'service' },
      { id: 'r2', orderNumber: 'SR-3087', category: 'سباك',       city: 'طرابلس', status: 'in_progress', date: '2026-07-08', type: 'service' },
      { id: 'r3', orderNumber: 'GR-001',  title: 'تركيب لوحة كهربائية', city: 'طرابلس', status: 'open', date: '2026-07-10', type: 'general', offersCount: 0 },
    ],
  },
  {
    id: 'c2', name: 'فاطمة البوسيفي', username: 'fatima_b', whatsapp: '0921987654',
    joinedAt: '2026-04-22',
    requests: [
      { id: 'r4', orderNumber: 'SR-2910', category: 'تكييف',      city: 'طرابلس', status: 'completed',  date: '2026-05-30', type: 'service' },
      { id: 'r5', orderNumber: 'SR-3044', category: 'نجار',       city: 'طرابلس', status: 'cancelled',  date: '2026-06-28', type: 'service' },
      { id: 'r6', orderNumber: 'GR-002',  title: 'إصلاح تسرب مياه', city: 'طرابلس', status: 'assigned', date: '2026-07-09', type: 'general', offersCount: 2 },
    ],
  },
  {
    id: 'c3', name: 'خالد المنتصر', username: 'khaled_m', whatsapp: '0915556677',
    joinedAt: '2026-06-01',
    requests: [
      { id: 'r7', orderNumber: 'SR-3099', category: 'دهان',       city: 'طرابلس', status: 'new',        date: '2026-07-09', type: 'service' },
      { id: 'r8', orderNumber: 'GR-003',  title: 'صيانة مكيفين',  city: 'طرابلس', status: 'open',       date: '2026-07-10', type: 'general', offersCount: 1 },
    ],
  },
  {
    id: 'c4', name: 'مريم الزروق', username: 'mariam_z', whatsapp: '0913334455',
    joinedAt: '2026-03-15',
    requests: [
      { id: 'r9',  orderNumber: 'SR-2799', category: 'كهربائي',   city: 'بنغازي', status: 'completed',  date: '2026-04-10', type: 'service' },
      { id: 'r10', orderNumber: 'SR-2844', category: 'سباك',      city: 'بنغازي', status: 'completed',  date: '2026-05-05', type: 'service' },
      { id: 'r11', orderNumber: 'SR-3010', category: 'تكييف',     city: 'بنغازي', status: 'disputed',   date: '2026-06-20', type: 'service' },
    ],
  },
]

function RequestRow({ req }: { req: AnyReq }) {
  const st = STATUS_STYLES[req.status] || STATUS_STYLES.open
  const isGeneral = req.type === 'general'
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isGeneral ? 'bg-purple-100' : 'bg-[#FF7900]/10'}`}>
        {isGeneral
          ? <ListChecks className="w-3.5 h-3.5 text-purple-600" />
          : <ClipboardList className="w-3.5 h-3.5 text-[#FF7900]" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-gray-400" dir="ltr">{req.orderNumber}</span>
          <span className="text-xs font-bold text-[#071B33] truncate">
            {isGeneral ? (req as GeneralReq).title : (req as ServiceReq).category}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{req.city}</span>
          {isGeneral && <span>· {(req as GeneralReq).offersCount} عروض</span>}
          <span>· {req.date}</span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
        </div>
      </div>
    </div>
  )
}

function CustomerCard({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(customer.id === 'c2')
  const total = customer.requests.length
  const completed = customer.requests.filter(r => r.status === 'completed').length
  const active = customer.requests.filter(r => ['new','open','assigned','in_progress'].includes(r.status)).length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button type="button" onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-center justify-between gap-3 text-right hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #071B33, #0f2d52)' }}>
            {customer.name[0]}
          </div>
          <div>
            <p className="font-black text-[#071B33] text-sm">{customer.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-0.5"><UserIcon className="w-3 h-3" />{customer.username}</span>
              <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /><span dir="ltr">{customer.whatsapp}</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{total} طلب</span>
              {active > 0 && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{active} نشط</span>}
              {completed > 0 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{completed} مكتمل</span>}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid #F0F2F5' }}>
          <div className="flex items-center justify-between pt-3 pb-1">
            <p className="text-xs font-black text-gray-500">سجل الطلبات</p>
            <button className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF7900] border border-orange-100">
              <KeyRound className="w-3 h-3" /> إعادة تعيين PIN
            </button>
          </div>
          {customer.requests.map(req => <RequestRow key={req.id} req={req} />)}
        </div>
      )}
    </div>
  )
}

export default function CustomerOrdersPreview() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] p-5" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#071B33]">حسابات العملاء</h1>
            <p className="text-sm text-gray-500">{CUSTOMERS.length} عميل مسجّل — اضغط لرؤية طلباته</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
            <input readOnly placeholder="بحث بالاسم، اسم المستخدم، أو الواتساب"
              className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-[#071B33] text-white text-sm font-bold">بحث</button>
          <button className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 bg-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'إجمالي الطلبات', value: CUSTOMERS.reduce((s,c)=>s+c.requests.length,0), color: 'text-[#071B33]' },
            { label: 'طلبات نشطة', value: CUSTOMERS.reduce((s,c)=>s+c.requests.filter(r=>['new','open','assigned','in_progress'].includes(r.status)).length,0), color: 'text-orange-600' },
            { label: 'مكتملة', value: CUSTOMERS.reduce((s,c)=>s+c.requests.filter(r=>r.status==='completed').length,0), color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Customer cards */}
        <div className="space-y-3">
          {CUSTOMERS.map(c => <CustomerCard key={c.id} customer={c} />)}
        </div>
      </div>
    </div>
  )
}
