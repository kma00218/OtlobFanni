import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Link } from 'wouter'
import {
  ClipboardList, Clock, Wrench, CheckCircle2,
  XCircle, Loader2, MapPin, Tag, FileText,
  RefreshCw, Phone, MessageSquare, CalendarDays,
} from 'lucide-react'

const STATUS = {
  new:         { ar: 'جديد',         en: 'New',         color: 'bg-orange-50 text-[#FF7900] border-orange-200',  icon: Clock        },
  assigned:    { ar: 'مُسند للفني',  en: 'Assigned',    color: 'bg-blue-50   text-blue-600  border-blue-200',    icon: Wrench       },
  in_progress: { ar: 'جارٍ التنفيذ', en: 'In Progress', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: Loader2      },
  completed:   { ar: 'مكتمل',        en: 'Completed',   color: 'bg-green-50  text-green-600  border-green-200',  icon: CheckCircle2 },
  cancelled:   { ar: 'ملغي',         en: 'Cancelled',   color: 'bg-red-50    text-red-500    border-red-200',    icon: XCircle      },
}

const lsA = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }

function loadMyRequests() {
  const ids  = lsA('myRequestIds')
  if (!ids.length) return []
  const all  = lsA('serviceRequests')
  const idSet = new Set(ids)
  return all
    .filter(r => idSet.has(r.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function lookupCity(cityId) {
  const cities = lsA('demo_cities_v1')
  return cities.find(c => c.id === cityId) || null
}

function lookupTechnician(techId) {
  if (!techId) return null
  const approved = lsA('technicians')
  const admin    = lsA('demo_technicians_v1')
  return approved.find(t => t.id === techId) || admin.find(t => t.id === techId) || null
}

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

function OrderCard({ req, lang }) {
  const ar = lang === 'ar'

  const city     = lookupCity(req.city)
  const cityName = city?.name_ar || req.city || '—'
  const catName  = ar ? (req.categoryNameAr || '—') : (req.categoryNameEn || req.categoryNameAr || '—')
  const date     = req.createdAt
    ? new Date(req.createdAt).toLocaleDateString('ar-LY', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const tech = req.status === 'assigned' ? lookupTechnician(req.assignedTechnicianId) : null
  const techName     = tech ? (tech.name_ar || tech.name || '') : null
  const techPhone    = tech?.phone    || null
  const techWhatsapp = tech?.whatsapp || tech?.phone || null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* رأس البطاقة: التخصص + الحالة */}
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

      {/* المدينة والمنطقة */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          {cityName}
          {req.area ? <span className="text-gray-400"> · {req.area}</span> : null}
        </p>
      </div>

      {/* وصف المشكلة */}
      {req.problemDescription && (
        <div className="px-4 py-3 border-b border-gray-50 flex items-start gap-3">
          <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{req.problemDescription}</p>
        </div>
      )}

      {/* رسالة الحالة */}
      {req.status === 'new' && (
        <div className="px-4 py-3 bg-orange-50/60 flex items-start gap-2">
          <Clock className="w-4 h-4 text-[#FF7900] flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-[#FF7900] leading-relaxed">
            {ar
              ? 'طلبك قيد المراجعة. سيتم إسناد فني قريبًا.'
              : 'Your request is under review. A technician will be assigned soon.'}
          </p>
        </div>
      )}

      {/* بيانات الفني — فقط عند حالة مُسند */}
      {req.status === 'assigned' && (
        <div className="px-4 py-3 bg-blue-50/40">
          <p className="text-xs text-gray-400 mb-2">{ar ? 'الفني المُسند' : 'Assigned Technician'}</p>
          {techName ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#071B33] flex items-center justify-center text-white text-sm font-bold">
                  {techName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <span className="font-medium text-gray-800 text-sm">{techName}</span>
              </div>
              <div className="flex gap-1.5">
                {techWhatsapp && (
                  <a
                    href={`https://wa.me/${techWhatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                  </a>
                )}
                {techPhone && (
                  <a
                    href={`tel:${techPhone}`}
                    className="w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-blue-500">{ar ? 'جاري تحديد الفني...' : 'Technician being assigned...'}</p>
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
  const [loaded,   setLoaded]   = useState(false)

  const reload = () => {
    setRequests(loadMyRequests())
    setLoaded(true)
  }

  useEffect(() => { reload() }, [])

  // ── لا توجد طلبات ──
  if (loaded && requests.length === 0) {
    return (
      <div className="bg-background min-h-screen pt-16 pb-20" dir={ar ? 'rtl' : 'ltr'}>
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
    in_progress: requests.filter(r => r.status === 'assigned' || r.status === 'in_progress').length,
    completed:   requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'طلباتي' : 'My Orders'} />

      <main className="px-4 pt-4 space-y-4">

        {/* ملخص */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: ar ? 'جديدة'   : 'New',         count: counts.new,         color: 'text-[#FF7900]', bg: 'bg-orange-50' },
            { label: ar ? 'جارية'   : 'In Progress',  count: counts.in_progress, color: 'text-blue-600',  bg: 'bg-blue-50'   },
            { label: ar ? 'مكتملة'  : 'Completed',    count: counts.completed,   color: 'text-green-600', bg: 'bg-green-50'  },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
              <p className={`text-xl font-black ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* header + refresh */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">
            {ar ? `${requests.length} طلب` : `${requests.length} request(s)`}
          </p>
          <button
            onClick={reload}
            className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* قائمة الطلبات */}
        {requests.map(req => (
          <OrderCard key={req.id} req={req} lang={lang} />
        ))}

      </main>
    </div>
  )
}
