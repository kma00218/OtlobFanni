import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useAllCategories } from '../hooks/useAllCategories'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import api, { uploadFile, getFileUrl } from '../lib/api'
import { CheckCircle2, ClipboardList, Loader2, PlusCircle, Search, Camera, X } from 'lucide-react'

const STATUS_LABELS = {
  open:      { ar: 'بانتظار العروض', en: 'Awaiting offers', color: '#FF7900' },
  assigned:  { ar: 'تم اختيار فني',  en: 'Assigned',        color: '#34A853' },
  cancelled: { ar: 'ملغى',           en: 'Cancelled',       color: '#9CA3AF' },
}

export default function MyRequests() {
  const { lang, dir } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const [view, setView] = useState('landing') // landing | new | track | result

  return (
    <div dir={dir} className="min-h-[100dvh] bg-gray-50">
      <BackHeader title={ar ? 'طلباتي' : 'My Requests'} />
      <div className="pt-24 pb-40 px-4 max-w-[480px] mx-auto">
        {view === 'landing' && <Landing ar={ar} onNew={() => setView('new')} onTrack={() => setView('track')} />}
        {view === 'new' && <NewRequest ar={ar} onDone={() => setView('landing')} />}
        {view === 'track' && <TrackRequest ar={ar} onBack={() => setView('landing')} />}
      </div>
    </div>
  )
}

function Landing({ ar, onNew, onTrack }) {
  return (
    <div className="space-y-4 pt-4">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-black text-[#071B33]">{ar ? 'طلبات خدمات عامة وعروض' : 'General Service Requests & Offers'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {ar
            ? 'صف مشكلتك وخلي الفنيين والشركات يقدملك عروض أسعار'
            : 'Describe your job and let technicians & companies send you quotes'}
        </p>
      </div>

      <button
        onClick={onNew}
        className="w-full flex items-center gap-3 p-4 rounded-2xl text-white font-bold active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 6px 20px rgba(255,121,0,0.35)' }}
      >
        <PlusCircle className="w-6 h-6 flex-shrink-0" />
        <span className="text-right flex-1" dir="auto">
          <span className="block text-base">{ar ? 'إرسال طلب خدمة جديد' : 'Send a New Service Request'}</span>
          <span className="block text-xs font-normal opacity-90">{ar ? 'استلم عروض أسعار من الفنيين والشركات' : 'Get quotes from technicians & companies'}</span>
        </span>
      </button>

      <button
        onClick={onTrack}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 font-bold active:scale-[0.98] transition-transform"
      >
        <Search className="w-6 h-6 flex-shrink-0 text-[#071B33]" />
        <span className="text-right flex-1" dir="auto">
          <span className="block text-base text-[#071B33]">{ar ? 'تتبع طلب سابق' : 'Track a Previous Request'}</span>
          <span className="block text-xs font-normal text-gray-500">{ar ? 'شوف العروض اللي وصلتك' : 'View offers you received'}</span>
        </span>
      </button>
    </div>
  )
}

function NewRequest({ ar, onDone }) {
  const categories = useAllCategories()
  const [cities, setCities] = useState([])
  const [form, setForm] = useState({ customerName: '', whatsapp: '', cityId: '', categoryId: '', title: '', description: '' })
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { api.cities().then(setCities).catch(() => {}) }, [])

  async function handlePhotoAdd(e) {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length)
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const path = await uploadFile(file)
        setPhotos(p => [...p, path])
      }
    } catch { setError(ar ? 'فشل رفع الصورة' : 'Photo upload failed') }
    finally { setUploading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.customerName.trim() || !form.whatsapp.trim() || !form.title.trim() || !form.description.trim()) {
      setError(ar ? 'يرجى تعبئة كل الحقول المطلوبة' : 'Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const city = cities.find(c => c.id === form.cityId)
      const cat = categories.find(c => c.id === form.categoryId)
      const res = await api.generalRequests.create({
        customerName: form.customerName.trim(),
        whatsapp: form.whatsapp.trim(),
        cityId: form.cityId || undefined,
        cityName: city ? (ar ? city.nameAr : city.nameEn) : undefined,
        categoryId: form.categoryId || undefined,
        categoryName: cat ? (ar ? cat.nameAr : cat.nameEn) : undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        photoUrls: photos.length ? photos : undefined,
      })
      setResult(res)
    } catch (err) {
      setError(err.message === 'HTTP 429'
        ? (ar ? 'وصلت الحد الأقصى للطلبات، حاول بعد ساعة' : 'You have reached the request limit, try again in an hour')
        : (ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again'))
    } finally { setSubmitting(false) }
  }

  if (result) {
    return (
      <div className="text-center py-10 space-y-4">
        <CheckCircle2 className="w-16 h-16 mx-auto text-[#34A853]" />
        <h2 className="text-lg font-black text-[#071B33]">{ar ? 'تم إرسال طلبك!' : 'Request Sent!'}</h2>
        <p className="text-sm text-gray-500">
          {ar ? 'رقم الطلب:' : 'Order number:'} <span className="font-bold text-[#071B33]" dir="ltr">{result.orderNumber}</span>
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-[#071B33]">
          <p className="font-bold mb-1">{ar ? 'كود التتبع:' : 'Tracking code:'}</p>
          <p className="text-2xl font-black tracking-widest" dir="ltr">{result.trackingCode}</p>
          <p className="text-xs text-gray-500 mt-2">
            {ar ? 'احفظ هذا الكود مع رقم الواتساب لتتبع العروض لاحقًا' : 'Save this code with your WhatsApp number to track offers later'}
          </p>
        </div>
        <button onClick={onDone} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: '#071B33' }}>
          {ar ? 'حسنًا' : 'Done'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-black text-[#071B33] text-center mb-2">{ar ? 'طلب جديد' : 'New Request'}</h2>

      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'الاسم' : 'Name'} *</label>
        <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 outline-none" required />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'رقم الواتساب' : 'WhatsApp number'} *</label>
        <LibyaPhoneInput value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'المدينة' : 'City'}</label>
          <select value={form.cityId} onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none bg-white">
            <option value="">{ar ? 'اختر' : 'Select'}</option>
            {cities.map(c => <option key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'التخصص' : 'Category'}</label>
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none bg-white">
            <option value="">{ar ? 'اختر' : 'Select'}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'عنوان الطلب' : 'Request title'} *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder={ar ? 'مثال: تسريب ماء في المطبخ' : 'e.g. Water leak in kitchen'}
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 outline-none" required />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'وصف المشكلة' : 'Description'} *</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 outline-none resize-none" required />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'صور (اختياري، حتى 3)' : 'Photos (optional, up to 3)'}</label>
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              <img src={getFileUrl(p)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setPhotos(ps => ps.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full py-3.5 rounded-xl font-black text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
        {submitting ? (ar ? 'جارٍ الإرسال...' : 'Sending...') : (ar ? 'إرسال الطلب' : 'Send Request')}
      </button>
    </form>
  )
}

function TrackRequest({ ar, onBack }) {
  const [whatsapp, setWhatsapp] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [selecting, setSelecting] = useState(null)

  async function handleTrack(e) {
    e.preventDefault()
    setError(''); setLoading(true); setData(null)
    try {
      const res = await api.generalRequests.track(whatsapp.trim(), code.trim().toUpperCase())
      setData(res)
    } catch {
      setError(ar ? 'لم يتم العثور على طلب بهذه البيانات' : 'No request found with this info')
    } finally { setLoading(false) }
  }

  async function refresh() {
    try {
      const res = await api.generalRequests.track(whatsapp.trim(), code.trim().toUpperCase())
      setData(res)
    } catch {}
  }

  useEffect(() => {
    if (!data) return
    const interval = setInterval(refresh, 20000)
    return () => clearInterval(interval)
  }, [data])

  async function handleSelect(offer) {
    if (!confirm(ar ? `تأكيد اختيار ${offer.providerName}؟` : `Confirm selecting ${offer.providerName}?`)) return
    setSelecting(offer.id)
    try {
      await api.generalRequests.selectOffer(data.request.id, {
        whatsapp: whatsapp.trim(), trackingCode: code.trim().toUpperCase(), offerId: offer.id,
      })
      await refresh()
    } catch {
      alert(ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, try again')
    } finally { setSelecting(null) }
  }

  if (data) {
    const { request, offers } = data
    const st = STATUS_LABELS[request.status] || STATUS_LABELS.open
    return (
      <div className="space-y-4">
        <button onClick={() => setData(null)} className="text-sm text-gray-500">{ar ? '‹ رجوع' : '‹ Back'}</button>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-black text-[#071B33]" dir="ltr">{request.orderNumber}</span>
            <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: st.color }}>{ar ? st.ar : st.en}</span>
          </div>
          <p className="font-bold text-[#071B33] mt-2">{request.title}</p>
          <p className="text-sm text-gray-500 mt-1">{request.description}</p>
        </div>

        <h3 className="font-bold text-[#071B33]">{ar ? `العروض (${offers.length})` : `Offers (${offers.length})`}</h3>
        {offers.length === 0 && <p className="text-sm text-gray-400 text-center py-6">{ar ? 'لا توجد عروض بعد، تحقق لاحقًا' : 'No offers yet, check back later'}</p>}
        <div className="space-y-3">
          {offers.map(o => (
            <div key={o.id} className={`bg-white rounded-2xl border p-4 ${request.assignedOfferId === o.id ? 'border-[#34A853] ring-2 ring-[#34A853]/20' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                {o.providerPhoto && <img src={getFileUrl(o.providerPhoto)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071B33]">{o.providerName}</span>
                    <span className="font-black text-[#FF7900]">{o.price} {ar ? 'د.ل' : 'LYD'}</span>
                  </div>
                  {o.etaText && <span className="text-xs text-gray-400">{o.etaText}</span>}
                </div>
              </div>
              {o.note && <p className="text-sm text-gray-500 mt-2">{o.note}</p>}
              {request.assignedOfferId === o.id ? (
                <div className="mt-2 text-sm font-bold text-[#34A853] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {ar ? 'تم اختياره — تواصل معك الفني' : 'Selected — contact will be shared'}
                  {o.providerWhatsapp && <a href={`https://wa.me/${o.providerWhatsapp.replace(/\D/g, '')}`} className="underline ms-1" target="_blank" rel="noreferrer">{o.providerWhatsapp}</a>}
                </div>
              ) : !request.assignedOfferId ? (
                <button onClick={() => handleSelect(o)} disabled={selecting === o.id}
                  className="mt-2 w-full py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60" style={{ background: '#34A853' }}>
                  {selecting === o.id ? (ar ? 'جارٍ...' : 'Selecting...') : (ar ? 'اختيار هذا العرض' : 'Select this offer')}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleTrack} className="space-y-4">
      <h2 className="text-lg font-black text-[#071B33] text-center mb-2">{ar ? 'تتبع طلب' : 'Track Request'}</h2>
      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'رقم الواتساب' : 'WhatsApp number'}</label>
        <LibyaPhoneInput value={whatsapp} onChange={setWhatsapp} required />
      </div>
      <div>
        <label className="block text-sm font-bold text-[#071B33] mb-1">{ar ? 'كود التتبع' : 'Tracking code'}</label>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} dir="ltr"
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm tracking-widest font-bold text-center outline-none focus:border-[#FF7900]" required />
      </div>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-black text-white disabled:opacity-60" style={{ background: '#071B33' }}>
        {loading ? (ar ? 'جارٍ البحث...' : 'Searching...') : (ar ? 'بحث' : 'Search')}
      </button>
      <button type="button" onClick={onBack} className="w-full text-sm text-gray-500">{ar ? '‹ رجوع' : '‹ Back'}</button>
    </form>
  )
}
