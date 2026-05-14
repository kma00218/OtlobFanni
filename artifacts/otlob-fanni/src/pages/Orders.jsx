import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Link } from 'wouter'
import {
  ClipboardList, Clock, Wrench, CheckCircle2,
  XCircle, Loader2, MapPin, Tag, FileText,
  RefreshCw, Phone, MessageSquare, CalendarDays,
  PhoneCall,
} from 'lucide-react'
import api from '../lib/api'

const STATUS = {
  new:         { ar: 'جديد',          en: 'New',          color: 'bg-orange-50 text-[#FF7900] border-orange-200',   icon: Clock        },
  assigned:    { ar: 'مُسند للفني',   en: 'Assigned',     color: 'bg-blue-50   text-blue-600  border-blue-200',     icon: Wrench       },
  contacted:   { ar: 'تم التواصل',   en: 'Contacted',    color: 'bg-sky-50    text-sky-600   border-sky-200',      icon: PhoneCall    },
  in_progress: { ar: 'جارٍ التنفيذ', en: 'In Progress',  color: 'bg-purple-50 text-purple-600 border-purple-200',  icon: Loader2      },
  completed:   { ar: 'مكتمل',         en: 'Completed',    color: 'bg-green-50  text-green-600  border-green-200',   icon: CheckCircle2 },
  cancelled:   { ar: 'ملغي',          en: 'Cancelled',    color: 'bg-red-50    text-red-500    border-red-200',     icon: XCircle      },
}

const lsA = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }
const lsSave = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function StatusBadge({ status, lang }) {
  const s = STATUS[status] || STATUS.new
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${s.color}`}>
      <Icon className="w-3 h-3" />
      {lang === 'ar' ? s.ar : s.en}
    </span>
  )
}

function OrderCard({ req, lang, cities, onCancel, onComplete }) {
  const ar = lang === 'ar'

  const city     = cities.find(c => c.id === (req.city_id || req.city))
  const cityName = city?.name_ar || req.city || '—'
  const catName  = ar
    ? (req.category_name_ar || req.categoryNameAr || req.category_id || '—')
    : (req.category_name_en || req.categoryNameEn || req.category_name_ar || '—')
  const date     = (req.created_at || req.createdAt)
    ? new Date(req.created_at || req.createdAt).toLocaleDateString('ar-LY', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const showTech     = req.status === 'assigned'
  const techName     = showTech ? (req.assigned_technician_name || req.assignedTechnicianName || null) : null
  const techPhone    = showTech ? (req.assigned_technician_phone || req.assignedTechnicianPhone || null) : null
  const techWhatsapp = showTech ? (req.assigned_technician_whatsapp || techPhone || null) : null
  const techInitials = techName ? techName.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'

  const problemDesc = req.problem_description || req.problemDescription

  const canCancel   = ['new', 'assigned'].includes(req.status)
  const canComplete = ['assigned', 'contacted', 'in_progress'].includes(req.status)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF7900]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-[#FF7900]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">{catName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <CalendarDays className="w-3 h-3 text-gray-300" />
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={req.status} lang={lang} />
      </div>

      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          {cityName}
          {req.area ? <span className="text-gray-400"> · {req.area}</span> : null}
        </p>
      </div>

      {problemDesc && (
        <div className="px-4 py-3 border-b border-gray-50 flex items-start gap-3">
          <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{problemDesc}</p>
        </div>
      )}

      {req.status === 'new' && (
        <div className="px-4 py-3 border-b border-gray-50 bg-orange-50/60 flex items-start gap-2">
          <Clock className="w-4 h-4 text-[#FF7900] flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-[#FF7900] leading-relaxed">
            {ar ? 'طلبك قيد المراجعة. سيتم إسناد فني قريبًا.' : 'Your request is under review. A technician will be assigned soon.'}
          </p>
        </div>
      )}
      {req.status === 'contacted' && (
        <div className="px-4 py-3 border-b border-gray-50 bg-sky-50/60 flex items-start gap-2">
          <PhoneCall className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-sky-600 leading-relaxed">
            {ar ? 'تم التواصل مع الفني. سيصلك قريبًا لإنجاز الخدمة.' : 'Technician has been contacted and will arrive soon.'}
          </p>
        </div>
      )}
      {req.status === 'in_progress' && (
        <div className="px-4 py-3 border-b border-gray-50 bg-purple-50/60 flex items-start gap-2">
          <Loader2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-purple-600 leading-relaxed">
            {ar ? 'الفني يعمل الآن على إنجاز الطلب.' : 'The technician is currently working on your request.'}
          </p>
        </div>
      )}
      {req.status === 'completed' && (
        <div className="px-4 py-3 border-b border-gray-50 bg-green-50/60 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-green-700 leading-relaxed">
            {ar ? 'تم إنجاز الطلب بنجاح. شكراً لاستخدامك اطلب فني.' : 'Request completed. Thank you for using Otlob Fanni.'}
          </p>
        </div>
      )}
      {req.status === 'cancelled' && (
        <div className="px-4 py-3 border-b border-gray-50 bg-red-50/60 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-500 leading-relaxed">
            {ar ? 'تم إلغاء هذا الطلب.' : 'This request has been cancelled.'}
          </p>
        </div>
      )}

      {showTech && techName && (
        <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-100">
          <p className="text-xs text-gray-400 mb-2.5">{ar ? 'الفني المُسند' : 'Assigned Technician'}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#071B33] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {techInitials}
              </div>
              <span className="font-semibold text-gray-800 text-sm">{techName}</span>
            </div>
            <div className="flex gap-2">
              {techWhatsapp && (
                <a href={`https://wa.me/${techWhatsapp}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors">
                  <MessageSquare className="w-4 h-4 text-white" />
                </a>
              )}
              {techPhone && (
                <a href={`tel:${techPhone}`} className="w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {(canCancel || canComplete) && (
        <div className={`px-4 py-3 flex gap-2`}>
          {canComplete && (
            <button onClick={() => onComplete(req.id)} data-testid="confirm-complete-btn" className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              {ar ? 'تأكيد الإنجاز' : 'Confirm Complete'}
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(req.id)} data-testid="cancel-btn" className="flex-1 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
              <XCircle className="w-4 h-4" />
              {ar ? 'إلغاء الطلب' : 'Cancel'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [requests, setRequests] = useState([])
  const [cities,   setCities]   = useState([])
  const [loaded,   setLoaded]   = useState(false)

  const reload = () => {
    const ids = lsA('myRequestIds')
    Promise.all([
      ids.length ? api.serviceRequestsByIds(ids) : Promise.resolve([]),
      api.cities(),
    ]).then(([reqs, c]) => {
      setRequests(reqs.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)))
      setCities(c)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }

  useEffect(() => { reload() }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.updateServiceRequest(id, status)
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }
  }

  const handleCancel = (id) => {
    if (!confirm(ar ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Cancel this request?')) return
    updateStatus(id, 'cancelled')
  }

  const handleComplete = (id) => {
    if (!confirm(ar ? 'هل تؤكد إنجاز هذه الخدمة؟' : 'Confirm this service is completed?')) return
    updateStatus(id, 'completed')
  }

  if (loaded && requests.length === 0) {
    return (
      <div className="bg-background min-h-screen pt-20 pb-20" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={ar ? 'طلباتي' : 'My Orders'} />
        <main className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">
              {ar ? 'لا توجد طلبات بعد' : 'No Orders Yet'}
            </h2>
            <p className="text-gray-400 text-sm max-w-[240px] mx-auto">
              {ar ? 'اطلب خدمة من الصفحة الرئيسية وستظهر طلباتك هنا.' : 'Request a service from the home page and your orders will appear here.'}
            </p>
          </div>
          <Link href="/">
            <button className="bg-[#FF7900] text-white font-bold px-8 py-3 rounded-xl text-sm">
              {ar ? 'اطلب خدمة الآن' : 'Request a Service'}
            </button>
          </Link>
        </main>
      </div>
    )
  }

  const counts = {
    new:         requests.filter(r => r.status === 'new').length,
    in_progress: requests.filter(r => ['assigned', 'contacted', 'in_progress'].includes(r.status)).length,
    completed:   requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'طلباتي' : 'My Orders'} />

      <main className="px-4 pt-4 space-y-4">

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: ar ? 'جديدة'  : 'New',         count: counts.new,         color: 'text-[#FF7900]', bg: 'bg-orange-50' },
            { label: ar ? 'جارية'  : 'In Progress',  count: counts.in_progress, color: 'text-blue-600',  bg: 'bg-blue-50'   },
            { label: ar ? 'مكتملة' : 'Completed',    count: counts.completed,   color: 'text-green-600', bg: 'bg-green-50'  },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
              <p className={`text-xl font-black ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">
            {ar ? `${requests.length} طلب` : `${requests.length} request(s)`}
          </p>
          <button onClick={reload} className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {requests.map(req => (
          <OrderCard
            key={req.id}
            req={req}
            lang={lang}
            cities={cities}
            onCancel={handleCancel}
            onComplete={handleComplete}
          />
        ))}

      </main>
    </div>
  )
}
