import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import { useCustomerAccount } from '../context/CustomerAccountContext'
import BackHeader from '../components/BackHeader'
import { useAllCategories } from '../hooks/useAllCategories'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import api, { uploadFile, getFileUrl } from '../lib/api'
import { CheckCircle2, ClipboardList, Loader2, PlusCircle, LogIn, UserPlus, LogOut, Camera, X, ChevronRight, ChevronLeft, ChevronDown, Lock, User, AlertTriangle } from 'lucide-react'

const FIELD_LABEL = "block text-[13px] font-bold text-[#071B33] mb-1.5 tracking-[0.01em]"
const FIELD_INPUT = "w-full rounded-xl border-2 border-[#0a0a0a] bg-[#F0F2F5] px-3.5 py-3 text-[15px] font-medium text-[#071B33] placeholder:text-gray-400 placeholder:font-normal focus:border-[#FF7900] focus:bg-white focus:ring-4 focus:ring-[#FF7900]/15 outline-none transition-all"
const FIELD_SELECT = `${FIELD_INPUT} appearance-none pe-9 cursor-pointer`

function FormCard({ ar, title, subtitle, onBack, children }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#0a0a0a] shadow-[0_8px_30px_rgba(7,27,51,0.12)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b-2 border-[#0a0a0a]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border-2 border-[#0a0a0a] hover:bg-gray-100 flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
            aria-label={ar ? 'رجوع للنموذج الرئيسي' : 'Back to main form'}
          >
            {ar ? <ChevronRight className="w-5 h-5 text-[#071B33]" /> : <ChevronLeft className="w-5 h-5 text-[#071B33]" />}
          </button>
        )}
        <div className={`flex-1 text-center ${onBack ? '-me-9' : ''}`}>
          <h2 className="text-[19px] font-black text-[#071B33] tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-[13px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

const STATUS_LABELS = {
  open:      { ar: 'بانتظار العروض', en: 'Awaiting offers', color: '#FF7900' },
  assigned:  { ar: 'تم اختيار فني',  en: 'Assigned',        color: '#34A853' },
  cancelled: { ar: 'ملغى',           en: 'Cancelled',       color: '#9CA3AF' },
}

export default function MyRequests() {
  const { lang, dir } = useLang()
  const ar = lang === 'ar'
  const { isLoggedIn } = useCustomerAccount()
  const [view, setView] = useState('landing') // landing | login | register | new | list

  return (
    <div dir={dir} className="min-h-[100dvh] bg-gray-50">
      <BackHeader title={ar ? 'طلباتي' : 'My Requests'} />
      <div className="pt-24 pb-40 px-4 max-w-[480px] mx-auto">
        {!isLoggedIn && view === 'landing' && (
          <AuthLanding ar={ar} onLogin={() => setView('login')} onRegister={() => setView('register')} />
        )}
        {!isLoggedIn && view === 'login' && (
          <LoginForm ar={ar} onBack={() => setView('landing')} onSuccess={() => setView('landing')} onSwitch={() => setView('register')} />
        )}
        {!isLoggedIn && view === 'register' && (
          <RegisterForm ar={ar} onBack={() => setView('landing')} onSuccess={() => setView('landing')} onSwitch={() => setView('login')} />
        )}

        {isLoggedIn && view === 'landing' && (
          <Dashboard ar={ar} onNew={() => setView('new')} />
        )}
        {isLoggedIn && view === 'new' && (
          <NewRequest ar={ar} onDone={() => setView('landing')} onBack={() => setView('landing')} />
        )}
      </div>
    </div>
  )
}

function AuthLanding({ ar, onLogin, onRegister }) {
  return (
    <div className="space-y-4 pt-4">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-black text-[#071B33]">{ar ? 'طلبات خدمات عامة وعروض' : 'General Service Requests & Offers'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {ar
            ? 'سجّل دخولك لإرسال طلب خدمة ومتابعة العروض المقدمة لك'
            : 'Log in to send a service request and track offers sent to you'}
        </p>
      </div>

      <button
        onClick={onLogin}
        className="w-full flex items-center gap-3 p-4 rounded-2xl text-white font-bold active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 6px 20px rgba(255,121,0,0.35)' }}
      >
        <LogIn className="w-6 h-6 flex-shrink-0" />
        <span className="text-right flex-1" dir="auto">
          <span className="block text-base">{ar ? 'تسجيل الدخول' : 'Log In'}</span>
          <span className="block text-xs font-normal opacity-90">{ar ? 'لديك حساب بالفعل؟ سجّل دخولك' : 'Already have an account? Log in'}</span>
        </span>
      </button>

      <button
        onClick={onRegister}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 font-bold active:scale-[0.98] transition-transform"
      >
        <UserPlus className="w-6 h-6 flex-shrink-0 text-[#071B33]" />
        <span className="text-right flex-1" dir="auto">
          <span className="block text-base text-[#071B33]">{ar ? 'إنشاء حساب جديد' : 'Create a New Account'}</span>
          <span className="block text-xs font-normal text-gray-500">{ar ? 'اسم مستخدم ورقم سري من 6 أرقام' : 'Username and a 6-digit PIN'}</span>
        </span>
      </button>
    </div>
  )
}

function LoginForm({ ar, onBack, onSuccess, onSwitch }) {
  const { login, loading } = useCustomerAccount()
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !/^\d{6}$/.test(pin)) {
      setError(ar ? 'يرجى إدخال اسم المستخدم ورقم سري مكوّن من 6 أرقام' : 'Please enter your username and a 6-digit PIN')
      return
    }
    try {
      await login({ username: username.trim(), pin })
      onSuccess()
    } catch (err) {
      setError(ar ? (err?.message || 'اسم المستخدم أو الرقم السري غير صحيح') : 'Incorrect username or PIN')
    }
  }

  return (
    <FormCard ar={ar} title={ar ? 'تسجيل الدخول' : 'Log In'} onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={FIELD_LABEL}>{ar ? 'اسم المستخدم' : 'Username'}</label>
          <div className="relative">
            <User className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-gray-400" />
            <input value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="off" autoCorrect="off"
              className={`${FIELD_INPUT} ps-9`} required />
          </div>
        </div>
        <div>
          <label className={FIELD_LABEL}>{ar ? 'الرقم السري (6 أرقام)' : 'PIN (6 digits)'}</label>
          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-gray-400" />
            <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              type="password" inputMode="numeric" maxLength={6} dir="ltr"
              className={`${FIELD_INPUT} ps-9 tracking-[0.3em] text-center`} required />
          </div>
        </div>
        {error && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-black text-[16px] tracking-wide text-white disabled:opacity-60 shadow-[0_6px_20px_rgba(255,121,0,0.3)] active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
          {loading ? (ar ? 'جارٍ الدخول...' : 'Logging in...') : (ar ? 'تسجيل الدخول' : 'Log In')}
        </button>
        <button type="button" onClick={onSwitch} className="w-full text-center text-[13px] font-bold text-[#FF7900]">
          {ar ? 'ليس لديك حساب؟ إنشاء حساب جديد' : "Don't have an account? Create one"}
        </button>
      </form>
    </FormCard>
  )
}

function RegisterForm({ ar, onBack, onSuccess, onSwitch }) {
  const { register, loading } = useCustomerAccount()
  const [form, setForm] = useState({ name: '', whatsapp: '', username: '', pin: '', pinConfirm: '' })
  const [error, setError] = useState('')

  function validateLibyaPhone(v) {
    const digits = (v || '').replace(/\D/g, '').replace(/^218/, '')
    return digits.length === 9
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.whatsapp.trim() || !form.username.trim() || !form.pin || !form.pinConfirm) {
      setError(ar ? 'يرجى تعبئة كل الحقول المطلوبة' : 'Please fill all required fields')
      return
    }
    if (!validateLibyaPhone(form.whatsapp)) {
      setError(ar ? 'رقم الواتساب غير مكتمل، يجب أن يتكون من 9 أرقام بعد 218+' : 'WhatsApp number is incomplete, it must be 9 digits after +218')
      return
    }
    if (!/^\d{6}$/.test(form.pin)) {
      setError(ar ? 'يجب أن يتكون الرقم السري من 6 أرقام' : 'PIN must be exactly 6 digits')
      return
    }
    if (form.pin !== form.pinConfirm) {
      setError(ar ? 'الرقم السري غير متطابق' : 'PINs do not match')
      return
    }
    try {
      await register({
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        username: form.username.trim(),
        pin: form.pin,
      })
      onSuccess()
    } catch (err) {
      const msg = err?.message || ''
      if (msg.includes('اسم المستخدم')) setError(ar ? msg : 'This username is already taken or invalid')
      else if (msg.includes('واتساب')) setError(ar ? msg : 'This WhatsApp number is already registered or invalid')
      else if (msg.includes('الرمز السري')) setError(ar ? msg : 'PIN must be 6 digits')
      else setError(ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again')
    }
  }

  return (
    <FormCard ar={ar} title={ar ? 'إنشاء حساب جديد' : 'Create a New Account'} onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={FIELD_LABEL}>{ar ? 'الاسم' : 'Name'} *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={FIELD_INPUT} required />
        </div>
        <div>
          <label className={FIELD_LABEL}>{ar ? 'رقم الواتساب' : 'WhatsApp number'} *</label>
          <LibyaPhoneInput value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} required />
        </div>
        <div>
          <label className={FIELD_LABEL}>{ar ? 'اسم المستخدم' : 'Username'} *</label>
          <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            autoCapitalize="off" autoCorrect="off" dir="ltr" placeholder="ahmed_92" className={FIELD_INPUT} required />
          <p className="text-[14px] font-extrabold text-[#0B5FBF] mt-1.5 px-0.5 leading-relaxed">
            {ar ? 'بالإنجليزية فقط: حروف وأرقام و "_" (مثال: ahmed_92)' : 'English only: letters, numbers, and "_" (example: ahmed_92)'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL}>{ar ? 'الرقم السري' : 'PIN'} *</label>
            <input value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              type="password" inputMode="numeric" maxLength={6} dir="ltr"
              className={`${FIELD_INPUT} tracking-[0.3em] text-center`} required />
          </div>
          <div>
            <label className={FIELD_LABEL}>{ar ? 'تأكيد الرقم' : 'Confirm PIN'} *</label>
            <input value={form.pinConfirm} onChange={e => setForm(f => ({ ...f, pinConfirm: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              type="password" inputMode="numeric" maxLength={6} dir="ltr"
              className={`${FIELD_INPUT} tracking-[0.3em] text-center`} required />
          </div>
        </div>
        <div className="flex items-start gap-2 text-[13.5px] font-extrabold text-white leading-relaxed bg-[#D92D20] border-2 border-[#8f1c12] rounded-xl px-3 py-3 shadow-[0_4px_14px_rgba(217,45,32,0.35)]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <span>{ar ? 'تنبيه: احفظ اسم المستخدم والرقم السري جيدًا، لا يمكن استعادتهما تلقائيًا — تواصل مع الدعم إذا نسيتهما' : 'Warning: Save your username and PIN carefully — they cannot be recovered automatically. Contact support if you forget them.'}</span>
        </div>
        {error && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-black text-[16px] tracking-wide text-white disabled:opacity-60 shadow-[0_6px_20px_rgba(255,121,0,0.3)] active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
          {loading ? (ar ? 'جارٍ الإنشاء...' : 'Creating...') : (ar ? 'إنشاء الحساب' : 'Create Account')}
        </button>
        <button type="button" onClick={onSwitch} className="w-full text-center text-[13px] font-bold text-[#FF7900]">
          {ar ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Log in'}
        </button>
      </form>
    </FormCard>
  )
}

function Dashboard({ ar, onNew }) {
  const { account, logout } = useCustomerAccount()
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [selecting, setSelecting] = useState(null)

  async function load() {
    try {
      const res = await api.generalRequests.mine()
      const flat = (res || []).map(entry => ({ ...entry.request, offers: entry.offers || [] }))
      setRequests(flat)
    } catch (err) {
      setError(ar ? 'تعذر تحميل طلباتك' : 'Could not load your requests')
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const interval = setInterval(load, 20000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSelect(request, offer) {
    if (!confirm(ar ? `تأكيد اختيار ${offer.providerName}؟` : `Confirm selecting ${offer.providerName}?`)) return
    setSelecting(offer.id)
    try {
      await api.generalRequests.selectOffer(request.id, { offerId: offer.id })
      await load()
    } catch (err) {
      alert(ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, try again')
    } finally { setSelecting(null) }
  }

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4">
        <div>
          <p className="text-[13px] text-gray-400">{ar ? 'مرحبًا' : 'Welcome'}</p>
          <p className="font-black text-[#071B33] text-[16px]">{account?.name}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 hover:text-red-600">
          <LogOut className="w-4 h-4" /> {ar ? 'خروج' : 'Logout'}
        </button>
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

      <div>
        <h3 className="font-black text-[#071B33] text-[15px] mb-3 px-1">{ar ? 'طلباتي' : 'My Requests'}</h3>
        {error && <p className="text-[13px] text-red-600 text-center py-4">{error}</p>}
        {requests === null && !error && (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
        )}
        {requests !== null && requests.length === 0 && (
          <p className="text-[13px] text-gray-400 text-center py-8">{ar ? 'لا توجد طلبات بعد' : 'No requests yet'}</p>
        )}
        <div className="space-y-3">
          {(requests || []).map(request => {
            const st = STATUS_LABELS[request.status] || STATUS_LABELS.open
            const offers = request.offers || []
            return (
              <div key={request.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-[#071B33] text-[14px]" dir="ltr">{request.orderNumber}</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: st.color }}>{ar ? st.ar : st.en}</span>
                </div>
                <p className="font-bold text-[#071B33] text-[15px]">{request.title}</p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{request.description}</p>

                {offers.length > 0 && (
                  <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
                    <p className="text-[12px] font-bold text-gray-400">{ar ? `العروض (${offers.length})` : `Offers (${offers.length})`}</p>
                    {offers.map(o => (
                      <div key={o.id} className={`rounded-xl border-2 p-3 ${request.assignedOfferId === o.id ? 'border-[#34A853] ring-4 ring-[#34A853]/10' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          {o.providerPhoto && <img src={getFileUrl(o.providerPhoto)} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200" />}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#071B33] text-[13px]">{o.providerName}</span>
                              <span className="font-black text-[#FF7900] text-[14px]">{o.price} {ar ? 'د.ل' : 'LYD'}</span>
                            </div>
                            {o.etaText && <span className="text-[11px] text-gray-400">{o.etaText}</span>}
                          </div>
                        </div>
                        {o.note && <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">{o.note}</p>}
                        {request.assignedOfferId === o.id ? (
                          <div className="mt-2 text-[12px] font-bold text-[#34A853] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {ar ? 'تم اختياره' : 'Selected'}
                            {o.providerWhatsapp && <a href={`https://wa.me/${o.providerWhatsapp.replace(/\D/g, '')}`} className="underline ms-1" dir="ltr" target="_blank" rel="noreferrer">{o.providerWhatsapp}</a>}
                          </div>
                        ) : !request.assignedOfferId ? (
                          <button onClick={() => handleSelect(request, o)} disabled={selecting === o.id}
                            className="mt-2 w-full py-2 rounded-lg text-[12px] font-bold text-white disabled:opacity-60" style={{ background: '#34A853' }}>
                            {selecting === o.id ? (ar ? 'جارٍ...' : 'Selecting...') : (ar ? 'اختيار هذا العرض' : 'Select this offer')}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                {offers.length === 0 && (
                  <p className="text-[12px] text-gray-400 mt-2.5">{ar ? 'لا توجد عروض بعد، تحقق لاحقًا' : 'No offers yet, check back later'}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NewRequest({ ar, onDone, onBack }) {
  const categories = useAllCategories()
  const [cities, setCities] = useState([])
  const [form, setForm] = useState({ cityId: '', categoryId: '', title: '', description: '' })
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
    if (!form.title.trim() || !form.description.trim()) {
      setError(ar ? 'يرجى تعبئة كل الحقول المطلوبة' : 'Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const city = cities.find(c => c.id === form.cityId)
      const cat = categories.find(c => c.id === form.categoryId)
      const res = await api.generalRequests.create({
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
      <FormCard ar={ar} title={ar ? 'تم إرسال طلبك!' : 'Request Sent!'}>
        <div className="text-center space-y-5">
          <CheckCircle2 className="w-16 h-16 mx-auto text-[#34A853]" />
          <p className="text-[14px] text-gray-500">
            {ar ? 'رقم الطلب:' : 'Order number:'} <span className="font-bold text-[#071B33]" dir="ltr">{result.orderNumber}</span>
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            {ar ? 'ستجد العروض المقدمة لك في صفحة طلباتي' : 'You will find offers sent to you in the My Requests page'}
          </p>
          <button onClick={onDone} className="w-full py-3.5 rounded-xl font-black text-[15px] tracking-wide text-white active:scale-[0.98] transition-transform" style={{ background: '#071B33' }}>
            {ar ? 'حسنًا' : 'Done'}
          </button>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard ar={ar} title={ar ? 'طلب جديد' : 'New Request'} subtitle={ar ? 'عبّي البيانات وسنوصلها للفنيين' : 'Fill in the details to reach technicians'} onBack={onBack}>
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FIELD_LABEL}>{ar ? 'المدينة' : 'City'}</label>
          <div className="relative">
            <select value={form.cityId} onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))}
              className={FIELD_SELECT}>
              <option value="">{ar ? 'اختر' : 'Select'}</option>
              {cities.map(c => <option key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label className={FIELD_LABEL}>{ar ? 'التخصص' : 'Category'}</label>
          <div className="relative">
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className={FIELD_SELECT}>
              <option value="">{ar ? 'اختر' : 'Select'}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <label className={FIELD_LABEL}>{ar ? 'عنوان الطلب' : 'Request title'} *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder={ar ? 'مثال: تسريب ماء في المطبخ' : 'e.g. Water leak in kitchen'}
          className={FIELD_INPUT} required />
      </div>

      <div>
        <label className={FIELD_LABEL}>{ar ? 'وصف المشكلة' : 'Description'} *</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4} className={`${FIELD_INPUT} resize-none leading-relaxed`} required />
      </div>

      <div>
        <label className={FIELD_LABEL}>{ar ? 'صور (اختياري، حتى 3)' : 'Photos (optional, up to 3)'}</label>
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200">
              <img src={getFileUrl(p)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setPhotos(ps => ps.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 hover:border-[#FF7900] hover:text-[#FF7900] transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full py-3.5 rounded-xl font-black text-[16px] tracking-wide text-white disabled:opacity-60 shadow-[0_6px_20px_rgba(255,121,0,0.3)] active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
        {submitting ? (ar ? 'جارٍ الإرسال...' : 'Sending...') : (ar ? 'إرسال الطلب' : 'Send Request')}
      </button>
    </form>
    </FormCard>
  )
}
