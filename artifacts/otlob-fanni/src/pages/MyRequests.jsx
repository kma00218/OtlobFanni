import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import { useCustomerAccount } from '../context/CustomerAccountContext'
import BackHeader from '../components/BackHeader'
import { useAllCategories } from '../hooks/useAllCategories'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import api, { uploadFile, getFileUrl } from '../lib/api'
import { CheckCircle2, ClipboardList, Loader2, PlusCircle, LogIn, UserPlus, LogOut, Camera, X, ChevronRight, ChevronLeft, ChevronDown, Lock, User, AlertTriangle, MapPin } from 'lucide-react'

const FIELD_LABEL = "block text-[13px] font-bold text-[#071B33] mb-1.5 tracking-[0.01em]"
const FIELD_INPUT = "w-full rounded-xl border-2 border-[#0a0a0a] bg-[#F0F2F5] px-3.5 py-3 text-[15px] font-medium text-[#071B33] placeholder:text-gray-400 placeholder:font-normal focus:border-[#FF7900] focus:bg-white focus:ring-4 focus:ring-[#FF7900]/15 outline-none transition-all"
const FIELD_SELECT = `${FIELD_INPUT} appearance-none pe-9 cursor-pointer`

function FormCard({ ar, title, subtitle, onBack, children }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(7,27,51,0.18)]" style={{ border: '2px solid #071B33' }}>
      <div className="relative flex items-center justify-center px-4 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute start-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] text-[#071B33] bg-white active:scale-90 transition-all"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
            aria-label={ar ? 'رجوع' : 'Back'}
          >
            {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{ar ? 'رجوع' : 'Back'}</span>
          </button>
        )}
        <div className="text-center">
          <h2 className="text-[19px] font-black text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-[13px] text-white/60 mt-0.5">{subtitle}</p>}
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
        <div className="space-y-5">
          {(requests || []).map(request => {
            const st = STATUS_LABELS[request.status] || STATUS_LABELS.open
            const offers = request.offers || []
            return (
              <div key={request.id} className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '2.5px solid #071B33', boxShadow: '0 4px 16px rgba(7,27,51,0.15)' }}>
                {/* ── Coloured header strip ── */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: st.color + '18', borderBottom: `2px solid ${st.color}30` }}>
                  <span className="font-black text-[#071B33] text-[13px] tracking-wide" dir="ltr">{request.orderNumber}</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: st.color }}>{ar ? st.ar : st.en}</span>
                </div>

                {/* ── Request body ── */}
                <div className="px-4 pt-3 pb-4">
                  <p className="font-black text-[#071B33] text-[15px] leading-snug">{request.title}</p>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{request.description}</p>

                  {offers.length > 0 && (
                    <div className="mt-3 space-y-2.5 pt-3" style={{ borderTop: '1.5px dashed #D1D9E6' }}>
                      <p className="text-[12px] font-bold text-gray-400">{ar ? `العروض (${offers.length})` : `Offers (${offers.length})`}</p>
                      {offers.map(o => (
                        <div key={o.id}
                          className={`rounded-xl border-2 p-3 ${request.assignedOfferId === o.id ? 'border-[#34A853] bg-green-50/60' : 'border-[#E8EDF3] bg-[#F8FAFC]'}`}>
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NewRequest({ ar, onDone, onBack }) {
  const [step, setStep] = useState(1)
  const [cityStats, setCityStats] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityCategories, setCityCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [description, setDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [tags, setTags] = useState(null)
  const [providerCount, setProviderCount] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    Promise.all([api.cities(), api.cityStats()])
      .then(([allCities, stats]) => {
        const statsMap = Object.fromEntries(stats.map(s => [s.id, s]))
        const merged = allCities.map(c => ({
          ...c,
          technicians: statsMap[c.id]?.technicians || 0,
          companies:   statsMap[c.id]?.companies   || 0,
          suppliers:   statsMap[c.id]?.suppliers   || 0,
          total:       statsMap[c.id]?.total        || 0,
        })).sort((a, b) => b.total - a.total)
        setCityStats(merged)
      }).catch(() => {}).finally(() => setLoadingCities(false))
  }, [])

  async function handleCitySelect(city) {
    setSelectedCity(city)
    setSelectedCategory(null)
    setTags(null)
    setDescription('')
    setProviderCount(null)
    setLoadingCategories(true)
    try {
      const cats = await api.categoriesByCity(city.id)
      setCityCategories(cats)
    } catch { setCityCategories([]) }
    finally { setLoadingCategories(false) }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  async function handleCategorySelect(cat) {
    setSelectedCategory(cat)
    setTags(null)
    setDescription('')
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'instant' })
    api.providersCount({ cityId: selectedCity.id, categoryId: cat.id })
      .then(d => setProviderCount(d.count))
      .catch(() => {})
  }

  async function handleAnalyze() {
    if (description.trim().length < 10) return
    setAnalyzing(true)
    setError('')
    try {
      const { tags: extracted } = await api.analyzeRequest(description)
      setTags(extracted || [])
    } catch { setTags([]) }
    finally { setAnalyzing(false) }
  }

  async function handleSubmit() {
    if (!description.trim()) return
    setError('')
    setSubmitting(true)
    try {
      const tagsSuffix = tags?.length
        ? `\n\n--- وسوم ذكية: ${tags.join('، ')} ---`
        : ''
      const res = await api.generalRequests.create({
        cityId: selectedCity.id,
        cityName: ar ? selectedCity.nameAr : selectedCity.nameEn,
        categoryId: selectedCategory?.id || undefined,
        categoryName: selectedCategory ? (ar ? selectedCategory.nameAr : selectedCategory.nameEn) : undefined,
        title: tags?.length
          ? tags.slice(0, 2).join(' + ')
          : (selectedCategory ? (ar ? selectedCategory.nameAr : selectedCategory.nameEn) : (ar ? 'طلب خدمة' : 'Service Request')),
        description: description.trim() + tagsSuffix,
      })
      setResult(res)
    } catch (err) {
      setError(err.message === 'HTTP 429'
        ? (ar ? 'وصلت الحد الأقصى للطلبات، حاول بعد ساعة' : 'Request limit reached, try again in an hour')
        : (ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again'))
    } finally { setSubmitting(false) }
  }

  if (result) {
    return (
      <FormCard ar={ar} title={ar ? 'تم إرسال طلبك!' : 'Request Sent!'}>
        <div className="text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-[#34A853]" />
          </div>
          <div>
            <p className="text-[16px] font-black text-[#071B33]">{ar ? 'طلبك في الطريق!' : 'Your request is on the way!'}</p>
            <p className="text-[13px] text-gray-500 mt-1">
              {ar ? 'رقم الطلب:' : 'Order:'} <span className="font-bold text-[#FF7900]" dir="ltr">{result.orderNumber}</span>
            </p>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
            {ar
              ? 'سيتواصل معك مقدمو الخدمة بعروضهم، ستجدها في صفحة طلباتي'
              : 'Service providers will send you offers. Find them in My Requests.'}
          </p>
          <button onClick={onDone} className="w-full py-3.5 rounded-xl font-black text-[15px] tracking-wide text-white active:scale-[0.98] transition-transform" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}>
            {ar ? 'حسنًا، شكرًا' : 'Done, Thanks'}
          </button>
        </div>
      </FormCard>
    )
  }

  if (step === 1) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] text-[#071B33] bg-white border-2 border-[#071B33] active:scale-90 transition-all">
            <ChevronRight className="w-4 h-4" />
            <span>{ar ? 'رجوع' : 'Back'}</span>
          </button>
          <p className="text-[13px] font-bold text-gray-400">{ar ? 'الخطوة 1 من 3' : 'Step 1 of 3'}</p>
        </div>

        <div className="text-center">
          <p className="text-[22px] font-black text-[#071B33]">📍 {ar ? 'اختر مدينتك' : 'Choose Your City'}</p>
        </div>

        {loadingCities ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#FF7900]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cityStats.map(city => {
              const hasProviders = city.total > 0
              return (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="flex items-center justify-between px-3.5 py-3.5 rounded-2xl active:scale-95 transition-transform"
                  style={hasProviders
                    ? { background: '#FFF3E6', border: '1.5px solid #FFA94D', boxShadow: '0 2px 8px rgba(255,121,0,0.12)' }
                    : { background: '#F5F7FA', border: '1.5px solid #D8DFE8', boxShadow: '0 1px 4px rgba(7,27,51,0.05)' }
                  }
                >
                  <span className="text-[15px] font-black" style={{ color: hasProviders ? '#071B33' : '#8A96A3' }}>
                    {ar ? city.nameAr : city.nameEn}
                  </span>
                  <span className="text-[12px] font-black px-2 py-0.5 rounded-full min-w-[28px] text-center"
                    style={hasProviders
                      ? { background: '#FF7900', color: 'white' }
                      : { background: '#D8DFE8', color: '#8A96A3' }
                    }>
                    {city.total}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (step === 2) {
    const city = selectedCity
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'instant' }) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] text-[#071B33] bg-white border-2 border-[#071B33] active:scale-90 transition-all">
            <ChevronRight className="w-4 h-4" />
            <span>{ar ? 'رجوع' : 'Back'}</span>
          </button>
          <p className="text-[13px] font-bold text-gray-400">{ar ? 'الخطوة 2 من 3' : 'Step 2 of 3'}</p>
        </div>

        {/* City stats card — matches CityTechnicians page */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '2px solid #D1D9E6', boxShadow: '0 4px 16px rgba(7,27,51,0.12)' }}>
          {/* Orange top accent */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #FF7900, #ffb347)' }} />
          {/* City name + icon */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #F0F4F8' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(255,121,0,0.15),rgba(255,121,0,0.05))' }}>
              <MapPin className="w-5 h-5" style={{ color: '#FF7900' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[#071B33] text-[17px] leading-tight">{ar ? city?.nameAr : city?.nameEn}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{city?.total ?? 0} {ar ? 'مقدّم خدمة' : 'providers'}</p>
            </div>
          </div>
          {/* 4-column breakdown — direction rtl so فنيون appears on the right */}
          <div className="grid grid-cols-4 divide-x divide-x-reverse" style={{ direction: 'rtl' }}>
            {/* فنيون */}
            <div className="flex flex-col items-center py-4 px-1.5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-2 overflow-hidden"
                style={{ boxShadow: '0 4px 12px rgba(255,121,0,0.20)', border: '1.5px solid rgba(255,121,0,0.15)' }}>
                <img src="/icons/categories/workers.png" alt="technicians" className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <p className="text-[20px] font-black leading-none" style={{ color: '#FF7900' }}>{city?.technicians ?? 0}</p>
              <p className="text-[11px] font-bold text-[#374151] mt-1 text-center leading-tight">{ar ? 'فنيون' : 'Technicians'}</p>
            </div>
            {/* شركات خدمية */}
            <div className="flex flex-col items-center py-4 px-1.5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-2 overflow-hidden"
                style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.25)', border: '1.5px solid rgba(59,130,246,0.15)' }}>
                <img src="/icons/sections/service_companies.png" alt="companies" className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <p className="text-[20px] font-black leading-none" style={{ color: '#1e40af' }}>{city?.companies ?? 0}</p>
              <p className="text-[11px] font-bold text-[#374151] mt-1 text-center leading-tight">{ar ? 'شركات خدمية' : 'Service Co.'}</p>
            </div>
            {/* موردو مستلزمات */}
            <div className="flex flex-col items-center py-4 px-1.5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-2 overflow-hidden"
                style={{ boxShadow: '0 4px 12px rgba(14,124,143,0.20)', border: '1.5px solid rgba(14,124,143,0.15)' }}>
                <img src="/icons/sections/more_services.png" alt="suppliers" className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <p className="text-[20px] font-black leading-none" style={{ color: '#0e7c8f' }}>{city?.suppliers ?? 0}</p>
              <p className="text-[11px] font-bold text-[#374151] mt-1 text-center leading-tight">{ar ? 'موردو مستلزمات' : 'Suppliers'}</p>
            </div>
            {/* الإجمالي */}
            <div className="flex flex-col items-center py-4 px-1.5" style={{ background: 'rgba(7,27,51,0.03)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: 'linear-gradient(145deg, #1e3a5f 0%, #071B33 100%)', boxShadow: '0 4px 12px rgba(7,27,51,0.35)' }}>
                <span className="text-white font-black leading-none select-none" style={{ fontSize: '32px', marginTop: '-2px' }}>Σ</span>
              </div>
              <p className="text-[20px] font-black leading-none text-[#071B33]">{city?.total ?? 0}</p>
              <p className="text-[11px] font-bold text-[#374151] mt-1 text-center leading-tight">{ar ? 'الإجمالي' : 'Total'}</p>
            </div>
          </div>
        </div>

        {/* Category grid */}
        {loadingCategories ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#FF7900]" /></div>
        ) : cityCategories.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-gray-400 text-[14px] font-bold">{ar ? 'لا توجد تخصصات في هذه المدينة بعد' : 'No specialties yet in this city'}</p>
            <p className="text-gray-300 text-[12px]">{ar ? 'يمكنك تقديم طلبك وسيصل لأقرب الفنيين' : 'You can still submit and we\'ll reach nearby pros'}</p>
          </div>
        ) : (
          <>
            <p className="text-[14px] font-extrabold text-[#071B33] text-center">{ar ? 'اختر التخصص المطلوب' : 'Choose the specialty'}</p>
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {cityCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className="w-[72px] h-[72px] rounded-[18px] overflow-hidden shadow-sm">
                    <img
                      src={`/icons/categories/${cat.id}.png`}
                      alt={ar ? cat.nameAr : cat.nameEn}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = '/icons/categories/more.png' }}
                    />
                  </div>
                  <span className="text-[12px] font-bold text-[#071B33] text-center leading-tight line-clamp-2 w-full">
                    {ar ? cat.nameAr : cat.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <FormCard
      ar={ar}
      title={ar ? 'وصف المشكلة' : 'Describe the Issue'}
      subtitle={ar ? 'الخطوة 3 من 3' : 'Step 3 of 3'}
      onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'instant' }) }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] px-3 py-1 rounded-full font-bold text-white" style={{ background: '#071B33' }}>
            {ar ? selectedCity?.nameAr : selectedCity?.nameEn}
          </span>
          {selectedCategory && (
            <span className="text-[12px] px-3 py-1 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
              {ar ? selectedCategory.nameAr : selectedCategory.nameEn}
            </span>
          )}
        </div>

        <div>
          <label className={FIELD_LABEL}>{ar ? 'اكتب وصف المشكلة أو الخدمة التي تحتاجها' : 'Describe your problem or needed service'} *</label>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setTags(null) }}
            rows={5}
            placeholder={ar ? 'مثال: عندي تسريب مياه في المطبخ تحت الحوض، الأنبوب القديم بدأ يقطّر...' : 'e.g. I have a water leak under the kitchen sink, the old pipe started dripping...'}
            className={`${FIELD_INPUT} resize-none leading-relaxed`}
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || description.trim().length < 10}
          className="w-full py-3 rounded-xl font-black text-[14px] text-white disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4B0082 0%, #7B2FBE 100%)', boxShadow: '0 4px 14px rgba(75,0,130,0.3)' }}
        >
          {analyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>{ar ? 'جارٍ التحليل...' : 'Analyzing...'}</span></>
          ) : (
            <><span>✨</span><span>{ar ? 'تحليل بالذكاء الاصطناعي' : 'AI Analysis'}</span></>
          )}
        </button>

        {tags !== null && (
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 px-4 py-3 space-y-2">
            <p className="text-[12px] font-extrabold text-purple-700 flex items-center gap-1">
              <span>✨</span>
              <span>{ar ? 'وسوم ذكية' : 'Smart Tags'}</span>
            </p>
            {tags.length === 0 ? (
              <p className="text-[12px] text-gray-400">{ar ? 'لم يتم استخراج وسوم — يرجى تفصيل المشكلة أكثر' : 'No tags extracted — please add more detail'}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-[12px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4B0082)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {tags !== null && providerCount !== null && (
          <div className="rounded-2xl border-2 border-[#FF7900]/30 bg-orange-50 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">📢</span>
            <p className="text-[13px] font-bold text-[#071B33] leading-relaxed flex-1">
              {ar
                ? `سيصل طلبك إلى ${providerCount} مقدم خدمة مطابق في ${selectedCity?.nameAr}`
                : `Your request will reach ${providerCount} matching providers in ${selectedCity?.nameEn}`}
            </p>
          </div>
        )}

        {error && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{error}</p>}

        {tags !== null && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            className="w-full py-4 rounded-xl font-black text-[16px] tracking-wide text-white disabled:opacity-60 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 6px 20px rgba(255,121,0,0.3)' }}
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span>{ar ? 'جارٍ الإرسال...' : 'Sending...'}</span></>
            ) : (
              <><span>🚀</span><span>{ar ? 'إرسال الطلب' : 'Send Request'}</span></>
            )}
          </button>
        )}

        {tags === null && (
          <p className="text-center text-[12px] text-gray-400">
            {ar ? 'اضغط "تحليل بالذكاء الاصطناعي" أولاً ثم أرسل طلبك' : 'Tap AI Analysis first, then send your request'}
          </p>
        )}
      </div>
    </FormCard>
  )
}
