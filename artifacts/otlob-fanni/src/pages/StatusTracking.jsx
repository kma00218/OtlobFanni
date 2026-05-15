import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import api from '../lib/api'
import { CheckCircle, Clock, XCircle, Megaphone, Search, Share2, Copy, Check } from 'lucide-react'

const STATUS_INFO = {
  ar: {
    pending:  { label: 'قيد المراجعة',  sub: 'طلبك وصل وسيتم مراجعته من قِبل الإدارة قريباً.', color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  Icon: Clock         },
    approved: { label: 'مقبول',          sub: 'تم قبول طلبك! ستظهر في التطبيق قريباً بعد النشر.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle   },
    published:{ label: 'منشور على المنصة', sub: 'مبروك! طلبك مقبول ومنشور. يمكن للعملاء رؤية ملفك الآن.', color: 'text-[#FF7900]',  bg: 'bg-orange-50', border: 'border-orange-200', Icon: Megaphone    },
    rejected: { label: 'مرفوض',          sub: 'للأسف، لم يتم قبول طلبك. يمكنك التواصل مع الدعم لمزيد من التفاصيل.', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', Icon: XCircle },
  },
  en: {
    pending:  { label: 'Under Review',   sub: 'Your request has been received and will be reviewed by our team shortly.', color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  Icon: Clock        },
    approved: { label: 'Accepted',       sub: 'Your application has been accepted! You will appear on the app soon after publishing.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle  },
    published:{ label: 'Live on Platform', sub: 'Congratulations! Your application is accepted and published. Clients can now see your profile.', color: 'text-[#FF7900]', bg: 'bg-orange-50', border: 'border-orange-200', Icon: Megaphone },
    rejected: { label: 'Rejected',       sub: 'Unfortunately your application was not accepted. Please contact support for more details.', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', Icon: XCircle },
  },
}

const STEPS = {
  ar: ['استلام الطلب', 'المراجعة', 'القبول', 'النشر'],
  en: ['Received', 'Review', 'Accepted', 'Published'],
}

function getStepIndex(status) {
  if (status === 'pending')   return 1
  if (status === 'approved')  return 2
  if (status === 'published') return 3
  return 0
}

export default function StatusTracking() {
  const { id } = useParams()
  const { ar } = useLang()
  const [, navigate] = useLocation()

  const [query, setQuery] = useState(id || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const doSearch = async (reqNum) => {
    const num = (reqNum || query).trim().toUpperCase()
    if (!num) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await api.trackRequest(num)
      setResult(data)
    } catch {
      setError(ar ? 'رقم الطلب غير موجود. تحقق من الرقم وحاول مرة أخرى.' : 'Request number not found. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) doSearch(id)
  }, [id])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: ar ? 'اطلب فني - تتبع طلبي' : 'Otlob Fanni - Track Request', url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsApp = () => {
    const url = window.location.href
    const text = ar
      ? `يمكنك متابعة حالة طلبي على منصة اطلب فني:\n${url}`
      : `Track my Otlob Fanni application status:\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const statusLang = ar ? STATUS_INFO.ar : STATUS_INFO.en
  const steps = ar ? STEPS.ar : STEPS.en
  const info = result ? (statusLang[result.status] || statusLang.pending) : null

  return (
    <div className="bg-[#ECEEF2] min-h-screen" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تتبع حالة الطلب' : 'Track Request Status'} />

      <main className="pt-20 pb-12 px-4 max-w-[480px] mx-auto">

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-sm font-semibold text-[#071B33] mb-3">
            {ar ? 'أدخل رقم تتبع طلبك' : 'Enter your tracking number'}
          </p>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder={ar ? 'مثال: OF-T-123456' : 'e.g. OF-T-123456'}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-blue-50 text-sm text-[#071B33] focus:outline-none focus:border-[#FF7900] transition-colors placeholder:text-gray-400 font-mono tracking-wider"
              dir="ltr"
            />
            <button
              onClick={() => doSearch()}
              disabled={loading || !query.trim()}
              className="px-4 py-3 bg-[#FF7900] text-white rounded-xl font-bold text-sm hover:bg-[#e86d00] disabled:opacity-50 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              {ar ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-10 h-10 border-4 border-[#FF7900]/30 border-t-[#FF7900] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">{ar ? 'جاري البحث...' : 'Searching...'}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {result && info && (
          <>
            <div className={`${info.bg} border ${info.border} rounded-2xl p-5 shadow-sm mb-4`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${info.bg} border ${info.border} flex items-center justify-center flex-shrink-0`}>
                  <info.Icon className={`w-7 h-7 ${info.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">
                    {result.type === 'technician'
                      ? (ar ? 'فني / حرفي' : 'Technician')
                      : (ar ? 'شركة / مؤسسة' : 'Company')}
                  </p>
                  <p className="font-bold text-[#071B33] text-base leading-tight mb-1 truncate">{result.fullName}</p>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${info.bg} ${info.color} border ${info.border}`}>
                    {info.label}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{info.sub}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {ar ? 'مراحل الطلب' : 'Request Progress'}
              </p>
              <div className="flex items-center gap-1">
                {steps.map((step, i) => {
                  const stepIdx = getStepIndex(result.status)
                  const done = i <= stepIdx
                  const active = i === stepIdx
                  const rejected = result.status === 'rejected'
                  return (
                    <div key={i} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          rejected && active ? 'bg-red-100 border-red-400 text-red-600'
                          : done ? 'bg-[#FF7900] border-[#FF7900] text-white'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                          {done && !rejected ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <p className={`text-[9px] mt-1 text-center leading-tight max-w-[50px] ${
                          done && !rejected ? 'text-[#FF7900] font-bold' : 'text-gray-400'
                        }`}>{step}</p>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1 rounded ${i < stepIdx ? 'bg-[#FF7900]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{ar ? 'رقم الطلب' : 'Request Number'}</span>
                <span>{ar ? 'تاريخ التقديم' : 'Submitted On'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#071B33] text-sm tracking-wider">{result.requestNumber}</span>
                <span className="text-sm text-gray-600">{result.createdAt ? new Date(result.createdAt).toLocaleDateString(ar ? 'ar-LY' : 'en-GB') : '—'}</span>
              </div>
            </div>

            {result.status === 'published' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <p className="text-xs font-bold text-gray-500 mb-3">{ar ? 'شارك حالة طلبك' : 'Share Your Status'}</p>
                <div className="flex gap-2">
                  <button onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    واتساب
                  </button>
                  <button onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#071B33] text-white rounded-xl text-xs font-bold hover:bg-[#0d2a4d] transition-colors">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? (ar ? 'تم النسخ' : 'Copied!') : (ar ? 'نسخ الرابط' : 'Copy Link')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 leading-relaxed">
              {ar
                ? 'أدخل رقم التتبع الذي حصلت عليه عند تقديم طلبك لمعرفة حالته.'
                : 'Enter the tracking number you received when submitting your application.'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
