import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Link } from 'wouter'
import {
  ClipboardList, Phone, MessageSquare, CheckCircle2,
  Clock, Loader2, XCircle, Wrench, MapPin, Tag,
  ChevronLeft, AlertTriangle, RefreshCw
} from 'lucide-react'

const STATUS = {
  new:         { ar: 'جديد',         en: 'New',          color: 'bg-orange-50 text-[#FF7900] border-orange-200',  icon: Clock       },
  assigned:    { ar: 'مُسند للفني',  en: 'Assigned',     color: 'bg-blue-50   text-blue-600  border-blue-200',    icon: Wrench      },
  in_progress: { ar: 'جارٍ التنفيذ', en: 'In Progress',  color: 'bg-purple-50 text-purple-600 border-purple-200', icon: Loader2     },
  completed:   { ar: 'مكتمل',        en: 'Completed',    color: 'bg-green-50  text-green-600  border-green-200',  icon: CheckCircle2 },
  cancelled:   { ar: 'ملغي',         en: 'Cancelled',    color: 'bg-red-50    text-red-500    border-red-200',    icon: XCircle     },
}

const ls  = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
const lsA = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]')  } catch { return [] }  }

function loadMyRequests(myPhone) {
  const all = lsA('service_requests')
  if (!myPhone) return []
  return all.filter(r => r.customer_phone === myPhone)
}

function loadTech(id) {
  if (!id) return null
  const approved = lsA('technicians')
  const admin    = lsA('demo_technicians_v1')
  return (
    approved.find(t => t.id === id) ||
    admin.find(t => t.id === id)    ||
    null
  )
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

function RequestCard({ req, lang, onCancel }) {
  const ar = lang === 'ar'
  const tech = loadTech(req.technician_id)
  const techName = tech ? (tech.name_ar || tech.name || tech.nameAr || '') : null
  const techPhone = tech ? (tech.phone || '') : null
  const techWhatsapp = tech ? (tech.whatsapp || tech.phone || '') : null

  const catName   = req.category_name  || '—'
  const cityName  = req.city_name      || '—'
  const date      = req.created_at ? new Date(req.created_at).toLocaleDateString('ar-LY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const canCancel = ['new', 'assigned'].includes(req.status)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF7900]/10 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-[#FF7900]" />
          </div>
          <div>
            <p className="text-xs text-gray-400">{date}</p>
            <p className="text-xs font-medium text-gray-500">{ar ? catName : catName} · {cityName}</p>
          </div>
        </div>
        <StatusBadge status={req.status} lang={lang} />
      </div>

      {/* Description */}
      {req.description && (
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{req.description}</p>
        </div>
      )}

      {/* Technician */}
      {techName ? (
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs text-gray-400 mb-1.5">{ar ? 'الفني المُسند' : 'Assigned Technician'}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#071B33] flex items-center justify-center text-white text-xs font-bold">
                {techName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <span className="font-medium text-gray-800 text-sm">{techName}</span>
            </div>
            {req.status !== 'cancelled' && req.status !== 'completed' && (
              <div className="flex gap-1.5">
                {techWhatsapp && (
                  <a href={`https://wa.me/${techWhatsapp}`} target="_blank" rel="noreferrer"
                    className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
                {techPhone && (
                  <a href={`tel:${techPhone}`}
                    className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors">
                    <Phone className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ) : req.status === 'new' ? (
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2 text-orange-500">
            <Clock className="w-3.5 h-3.5" />
            <p className="text-xs font-medium">{ar ? 'في انتظار إسناد الفني من الإدارة' : 'Waiting for technician assignment'}</p>
          </div>
        </div>
      ) : null}

      {/* Status timeline */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1">
          {['new', 'assigned', 'in_progress', 'completed'].map((s, i) => {
            const steps = ['new', 'assigned', 'in_progress', 'completed']
            const currentIdx = steps.indexOf(req.status)
            const isCancelled = req.status === 'cancelled'
            const isDone = isCancelled ? false : i <= currentIdx
            const isActive = !isCancelled && i === currentIdx
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${isDone ? (isActive ? 'bg-[#FF7900]' : 'bg-green-400') : 'bg-gray-100'}`} />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1">
          {[
            { ar: 'استلمنا', en: 'Received' },
            { ar: 'مُسند',   en: 'Assigned' },
            { ar: 'جارٍ',    en: 'Active'   },
            { ar: 'مكتمل',  en: 'Done'     },
          ].map((lbl, i) => {
            const steps = ['new', 'assigned', 'in_progress', 'completed']
            const currentIdx = steps.indexOf(req.status)
            const isDone = req.status !== 'cancelled' && i <= currentIdx
            return (
              <span key={i} className={`text-[9px] ${isDone ? 'text-[#FF7900] font-bold' : 'text-gray-300'}`}>
                {ar ? lbl.ar : lbl.en}
              </span>
            )
          })}
        </div>
      </div>

      {/* Cancel button */}
      {canCancel && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onCancel(req.id)}
            className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            {ar ? 'إلغاء الطلب' : 'Cancel Request'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const { t, lang } = useLang()
  const ar = lang === 'ar'

  const [myPhone, setMyPhone]   = useState(() => ls('my_requests_phone') || '')
  const [requests, setRequests] = useState([])
  const [inputPhone, setInputPhone] = useState('')
  const [showInput, setShowInput]   = useState(false)

  const reload = (phone) => {
    const list = loadMyRequests(phone || myPhone)
    setRequests(list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  useEffect(() => {
    if (myPhone) reload(myPhone)
  }, [myPhone])

  const handleSetPhone = () => {
    const p = inputPhone.trim()
    if (!p) return
    localStorage.setItem('my_requests_phone', p)
    setMyPhone(p)
    setShowInput(false)
    setInputPhone('')
  }

  const handleCancel = (id) => {
    const all = lsA('service_requests')
    const updated = all.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
    localStorage.setItem('service_requests', JSON.stringify(updated))
    reload(myPhone)
  }

  const handleRefresh = () => reload(myPhone)

  // ── حالة: لا يوجد هاتف محفوظ ──
  if (!myPhone) {
    return (
      <div className="bg-background min-h-screen pt-16 pb-20" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={ar ? 'طلباتي' : 'My Orders'} />
        <main className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
          <div className="w-20 h-20 bg-[#FF7900]/10 rounded-full flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-[#FF7900]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {ar ? 'تابع طلباتك هنا' : 'Track Your Requests'}
            </h2>
            <p className="text-gray-400 text-sm max-w-[260px] mx-auto leading-relaxed">
              {ar
                ? 'أدخل رقم هاتفك لتتبع جميع طلبات الخدمة التي قدمتها'
                : 'Enter your phone number to track all your submitted service requests'}
            </p>
          </div>

          {showInput ? (
            <div className="w-full max-w-[300px] space-y-3">
              <input
                type="tel"
                value={inputPhone}
                onChange={e => setInputPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-base focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900]"
                autoFocus
              />
              <button
                onClick={handleSetPhone}
                className="w-full bg-[#FF7900] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#e06b00] transition-colors"
              >
                {ar ? 'عرض طلباتي' : 'Show My Orders'}
              </button>
              <button onClick={() => setShowInput(false)} className="w-full text-gray-400 text-sm py-1">
                {ar ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              <button
                onClick={() => setShowInput(true)}
                className="w-full bg-[#FF7900] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#e06b00] transition-colors"
              >
                {ar ? 'أدخل رقم هاتفك' : 'Enter Your Phone Number'}
              </button>
              <Link href="/">
                <button className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  {ar ? 'اطلب فني الآن' : 'Request a Technician'}
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ── حالة: لا توجد طلبات ──
  if (requests.length === 0) {
    return (
      <div className="bg-background min-h-screen pt-16 pb-20" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={ar ? 'طلباتي' : 'My Orders'} />
        <main className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">{ar ? 'لا توجد طلبات' : 'No Orders Yet'}</h2>
            <p className="text-gray-400 text-sm">
              {ar ? `لم نجد طلبات بالرقم ${myPhone}` : `No requests found for ${myPhone}`}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-[240px]">
            <Link href="/">
              <button className="w-full bg-[#FF7900] text-white font-bold py-3 rounded-xl text-sm">
                {ar ? 'اطلب فني الآن' : 'Request a Technician'}
              </button>
            </Link>
            <button
              onClick={() => { setMyPhone(''); localStorage.removeItem('my_requests_phone') }}
              className="text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              {ar ? 'تغيير رقم الهاتف' : 'Change Phone Number'}
            </button>
          </div>
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

        {/* ملخص الحالات */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: ar ? 'جديدة'    : 'New',        count: counts.new,         color: 'text-[#FF7900]', bg: 'bg-orange-50' },
            { label: ar ? 'جارية'   : 'In Progress', count: counts.in_progress, color: 'text-blue-600',  bg: 'bg-blue-50'   },
            { label: ar ? 'مكتملة'  : 'Completed',   count: counts.completed,   color: 'text-green-600', bg: 'bg-green-50'  },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
              <p className={`text-xl font-black ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Header مع زر تحديث */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-700">{ar ? 'طلباتك' : 'Your Requests'}</p>
            <p className="text-xs text-gray-400" dir="ltr">{myPhone}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={() => { setMyPhone(''); localStorage.removeItem('my_requests_phone') }}
              className="text-xs text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-xl px-2 py-1.5"
            >
              {ar ? 'تغيير' : 'Change'}
            </button>
          </div>
        </div>

        {/* قائمة الطلبات */}
        {requests.map(req => (
          <RequestCard key={req.id} req={req} lang={lang} onCancel={handleCancel} />
        ))}

        <p className="text-center text-xs text-gray-400 pb-2">
          {ar ? `إجمالي ${requests.length} طلب` : `${requests.length} total request(s)`}
        </p>
      </main>
    </div>
  )
}
