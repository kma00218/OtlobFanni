import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import api from '../lib/api'
import { categories } from '../data/services'
import { CheckCircle, Clock, XCircle, Megaphone, Search, Copy, Check, Phone } from 'lucide-react'

const STATUS_INFO = {
  ar: {
    pending:  { label: 'قيد المراجعة',    sub: 'طلبك وصل وسيتم مراجعته من قِبل الإدارة قريباً.', color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  Icon: Clock       },
    approved: { label: 'مقبول',            sub: 'تم قبول طلبك! ستظهر في التطبيق قريباً بعد النشر.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle },
    published:{ label: 'منشور على المنصة', sub: 'مبروك! طلبك مقبول ومنشور. يمكن للعملاء رؤية ملفك الآن.', color: 'text-[#FF7900]', bg: 'bg-orange-50', border: 'border-orange-200', Icon: Megaphone   },
    rejected: { label: 'مرفوض',            sub: 'للأسف، لم يتم قبول طلبك. يمكنك التواصل مع الدعم لمزيد من التفاصيل.', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', Icon: XCircle },
  },
  en: {
    pending:  { label: 'Under Review',    sub: 'Your request has been received and will be reviewed by our team shortly.', color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  Icon: Clock       },
    approved: { label: 'Accepted',        sub: 'Your application has been accepted! You will appear on the app soon after publishing.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle },
    published:{ label: 'Live on Platform',sub: 'Congratulations! Your application is accepted and published. Clients can now see your profile.', color: 'text-[#FF7900]', bg: 'bg-orange-50', border: 'border-orange-200', Icon: Megaphone },
    rejected: { label: 'Rejected',        sub: 'Unfortunately your application was not accepted. Please contact support for more details.', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', Icon: XCircle },
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
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [tab, setTab]               = useState('number')
  const [query, setQuery]           = useState(id || '')
  const [phoneQuery, setPhoneQuery] = useState('')
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [phoneResults, setPhoneResults] = useState(null)
  const [error, setError]           = useState(null)
  const [copied, setCopied]         = useState(false)
  const [copiedMsg, setCopiedMsg]   = useState(false)

  const reset = () => { setResult(null); setPhoneResults(null); setError(null) }

  const getSpecialtyLabel = (specialty, customSpecialty) => {
    if (customSpecialty) return customSpecialty
    const cat = categories.find(c => c.id === specialty)
    return cat ? cat.nameAr : (specialty || 'خدمات فنية')
  }

  const buildShareMsg = (r) => {
    const specialty = getSpecialtyLabel(r.specialty, r.customSpecialty)
    const city = r.cityName || ''
    const platform = 'https://otlobfanni.ly'
    if (r.type === 'technician') {
      return `تم انضمامي الآن إلى منصة اطلب فني 🇱🇾\n\nيمكنكم التواصل معي عبر المنصة لخدمات:\n🔧 ${specialty}${city ? `\n📍 ${city}` : ''}\n\n🌐 ${platform}`
    }
    return `تم اعتماد شركتنا الآن في منصة اطلب فني 🇱🇾\n\nنقدم خدمات:\n🏢 ${r.fullName}\n🔧 ${specialty}${city ? `\n📍 ${city}` : ''}\n\n🌐 ${platform}`
  }

  const doSearch = async (reqNum) => {
    // Normalise: uppercase + fix only a leading "0F-" typed instead of "OF-"
    // Do NOT replace all zeros — numeric parts of the request number contain real zeros
    const num = (reqNum || query).trim().toUpperCase().replace(/^0F-/, 'OF-')
    if (!num) return
    setLoading(true); reset()
    try {
      const data = await api.trackRequest(num)
      setResult(data)
    } catch {
      setError(ar ? 'رقم الطلب غير موجود. تحقق من الرقم وحاول مرة أخرى.' : 'Request number not found. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  const doSearchByPhone = async () => {
    const phone = phoneQuery.trim()
    if (!phone) return
    setLoading(true); reset()
    try {
      const data = await api.trackRequestByPhone(phone)
      setPhoneResults(Array.isArray(data) ? data : [data])
    } catch {
      setError(ar ? 'لم يُعثر على طلبات بهذا الرقم. تحقق من رقم الهاتف وحاول مرة أخرى.' : 'No applications found for this phone number. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) doSearch(id)
  }, [id])

  const handleWhatsAppShare = (r) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareMsg(r))}`, '_blank')
  }

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://otlobfanni.ly')}`, '_blank')
  }

  const handleMessengerShare = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.open(`fb-messenger://share?link=${encodeURIComponent('https://otlobfanni.ly')}`, '_blank')
    } else {
      window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent('https://otlobfanni.ly')}&redirect_uri=${encodeURIComponent('https://otlobfanni.ly')}`, '_blank')
    }
  }

  const handleCopyMsg = (r) => {
    navigator.clipboard.writeText(buildShareMsg(r))
    setCopiedMsg(true)
    setTimeout(() => setCopiedMsg(false), 2500)
  }

  const statusLang = ar ? STATUS_INFO.ar : STATUS_INFO.en
  const steps      = ar ? STEPS.ar : STEPS.en
  const info       = result ? (statusLang[result.status] || statusLang.pending) : null

  const switchTab = (t) => { setTab(t); reset() }

  return (
    <div className="bg-[#ECEEF2] min-h-screen" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تتبع حالة الطلب' : 'Track Request Status'} />

      <main className="pt-20 pb-12 px-4 max-w-[480px] mx-auto">

        {/* Tab switcher */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm mb-4 flex gap-1">
          <button
            onClick={() => switchTab('number')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              tab === 'number' ? 'bg-[#FF7900] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Search className="w-4 h-4" />
            {ar ? 'رقم التتبع' : 'Tracking Number'}
          </button>
          <button
            onClick={() => switchTab('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              tab === 'phone' ? 'bg-[#FF7900] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Phone className="w-4 h-4" />
            {ar ? 'رقم الهاتف' : 'Phone Number'}
          </button>
        </div>

        {/* Search box */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          {tab === 'number' ? (
            <>
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
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#071B33] mb-1">
                {ar ? 'أدخل رقم الهاتف الذي سجّلت به' : 'Enter the phone number you registered with'}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {ar ? 'سيظهر لك جميع طلباتك المرتبطة بهذا الرقم' : 'All your applications linked to this number will appear'}
              </p>
              <div className="flex gap-2">
                <input
                  value={phoneQuery}
                  onChange={e => setPhoneQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearchByPhone()}
                  placeholder={ar ? 'مثال: 0913XXXXXXX' : 'e.g. 0913XXXXXXX'}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-blue-50 text-sm text-[#071B33] focus:outline-none focus:border-[#FF7900] transition-colors placeholder:text-gray-400"
                  dir="ltr"
                  type="tel"
                />
                <button
                  onClick={doSearchByPhone}
                  disabled={loading || !phoneQuery.trim()}
                  className="px-4 py-3 bg-[#FF7900] text-white rounded-xl font-bold text-sm hover:bg-[#e86d00] disabled:opacity-50 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  {ar ? 'بحث' : 'Search'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-10 h-10 border-4 border-[#FF7900]/30 border-t-[#FF7900] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">{ar ? 'جاري البحث...' : 'Searching...'}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Phone results list */}
        {phoneResults && !loading && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 px-1">
              {ar ? `${phoneResults.length} طلب مرتبط بهذا الرقم` : `${phoneResults.length} application(s) found`}
            </p>
            {phoneResults.map((r) => {
              const si = statusLang[r.status] || statusLang.pending
              return (
                <button
                  key={r.id}
                  onClick={() => { setTab('number'); setQuery(r.requestNumber); setPhoneResults(null); setResult(r) }}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-right flex items-center gap-4 hover:border-[#FF7900]/40 transition-colors active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-xl ${si.bg} border ${si.border} flex items-center justify-center flex-shrink-0`}>
                    <si.Icon className={`w-5 h-5 ${si.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-right" dir={ar ? 'rtl' : 'ltr'}>
                    <p className="font-bold text-[#071B33] text-sm truncate">{r.fullName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.requestNumber} · {r.type === 'technician' ? (ar ? 'فني' : 'Technician') : (ar ? 'شركة' : 'Company')}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${si.bg} ${si.color} border ${si.border}`}>
                    {si.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Single result detail */}
        {result && info && (
          <>
            {/* ── Celebration banner (published only) ── */}
            {result.status === 'published' && (
              <div className="bg-gradient-to-br from-[#FF7900] to-[#e86d00] rounded-2xl p-5 shadow-md mb-4 text-white text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-extrabold text-lg leading-tight mb-1">
                  {ar ? 'تم قبول حسابك ونشر نشاطك بنجاح!' : 'Your account is live on the platform!'}
                </p>
                <p className="text-sm text-orange-100 leading-relaxed">
                  {ar
                    ? 'أصبح نشاطك ظاهراً الآن داخل منصة اطلب فني 🇱🇾 — شارك الخبر مع أصدقائك!'
                    : 'Your profile is now visible on Otlob Fanni 🇱🇾 — share the news with your friends!'}
                </p>
              </div>
            )}

            <div className={`${info.bg} border ${info.border} rounded-2xl p-5 shadow-sm mb-4`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${info.bg} border ${info.border} flex items-center justify-center flex-shrink-0`}>
                  <info.Icon className={`w-7 h-7 ${info.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">
                    {result.type === 'technician' ? (ar ? 'فني / حرفي' : 'Technician') : (ar ? 'شركة / مؤسسة' : 'Company')}
                  </p>
                  <p className="font-bold text-[#071B33] text-base leading-tight mb-1 truncate">{result.fullName}</p>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${info.bg} ${info.color} border ${info.border}`}>
                    {info.label}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{info.sub}</p>
            </div>

            {result.status === 'rejected' && result.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm mb-4">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                  {ar ? 'سبب الرفض' : 'Rejection Reason'}
                </p>
                <p className="text-sm text-red-700 leading-relaxed" dir="rtl">{result.rejectionReason}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {ar ? 'مراحل الطلب' : 'Request Progress'}
              </p>
              <div className="flex items-center gap-1">
                {steps.map((step, i) => {
                  const stepIdx  = getStepIndex(result.status)
                  const done     = i <= stepIdx
                  const active   = i === stepIdx
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
                <p className="text-xs font-bold text-[#071B33] mb-1">{ar ? 'شارك نشاطك' : 'Share your profile'}</p>
                <p className="text-xs text-gray-400 mb-3">{ar ? 'اضغط على أي زر لمشاركة رسالة جاهزة عن نشاطك' : 'Tap any button to share a ready-made message about your profile'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* WhatsApp */}
                  <button onClick={() => handleWhatsAppShare(result)}
                    className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#20bc5a] transition-colors active:scale-95">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {ar ? 'واتساب' : 'WhatsApp'}
                  </button>
                  {/* Facebook */}
                  <button onClick={handleFacebookShare}
                    className="flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white rounded-xl text-xs font-bold hover:bg-[#0d6ae0] transition-colors active:scale-95">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    {ar ? 'فيسبوك' : 'Facebook'}
                  </button>
                  {/* Messenger */}
                  <button onClick={handleMessengerShare}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#0084FF] to-[#A033FF] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity active:scale-95">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.131 3.26 5.887-3.26-6.559 6.863z"/></svg>
                    {ar ? 'ماسنجر' : 'Messenger'}
                  </button>
                  {/* Copy message */}
                  <button onClick={() => handleCopyMsg(result)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${copiedMsg ? 'bg-green-500 text-white' : 'bg-[#071B33] text-white hover:bg-[#0d2a4d]'}`}>
                    {copiedMsg ? <Check className="w-4 h-4 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0" />}
                    {copiedMsg ? (ar ? 'تم النسخ!' : 'Copied!') : (ar ? 'نسخ الرسالة' : 'Copy Message')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!result && !phoneResults && !loading && !error && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            {tab === 'number'
              ? <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              : <Phone  className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            }
            <p className="text-sm text-gray-400 leading-relaxed">
              {tab === 'number'
                ? (ar ? 'أدخل رقم التتبع الذي حصلت عليه عند تقديم طلبك.' : 'Enter the tracking number you received when submitting your application.')
                : (ar ? 'أدخل رقم هاتفك لاسترجاع جميع طلباتك.' : 'Enter your phone number to retrieve all your applications.')}
            </p>
          </div>
        )}

      </main>
    </div>
  )
}
