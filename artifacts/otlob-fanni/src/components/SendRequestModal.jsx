import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { MapPin, Send, CheckCircle2, LogIn, UserPlus, Camera, Lock, User, AlertTriangle, Loader2, X as XIcon, ChevronRight, ClipboardList } from 'lucide-react'
import api from '../lib/api'
import LibyaPhoneInput from './LibyaPhoneInput'
import { useCustomerAccount } from '../context/CustomerAccountContext'

const INPUT = "w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-[15px] font-medium text-[#071B33] placeholder:text-gray-400 focus:border-[#FF7900] focus:ring-4 focus:ring-[#FF7900]/10 outline-none transition-all shadow-sm"
const LABEL = "block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2"

const REQUEST_TYPES_AR = [
  { label: 'صيانة وإصلاح', icon: '🔧' },
  { label: 'تركيب',         icon: '⚙️' },
  { label: 'فحص ومعاينة',  icon: '🔍' },
  { label: 'تنفيذ مشروع',  icon: '🏗️' },
  { label: 'استشارة',       icon: '💬' },
  { label: 'أخرى',          icon: '📋' },
]
const REQUEST_TYPES_EN = [
  { label: 'Repair & Maintenance', icon: '🔧' },
  { label: 'Installation',          icon: '⚙️' },
  { label: 'Inspection',            icon: '🔍' },
  { label: 'Project',               icon: '🏗️' },
  { label: 'Consultation',          icon: '💬' },
  { label: 'Other',                 icon: '📋' },
]

export default function SendRequestModal({ open, onClose, cityId, cityName, categoryId, categoryName, ar }) {
  const [, navigate] = useLocation()
  const { isLoggedIn, account, login, register, loading: authLoading } = useCustomerAccount()
  const [view, setView] = useState('gate')
  const [requestType, setRequestType] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState([])
  const [whatsapp, setWhatsapp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [regForm, setRegForm] = useState({ name: '', whatsapp: '', username: '', pin: '', pinConfirm: '' })
  const [authError, setAuthError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setView(isLoggedIn ? 'form' : 'gate')
    setRequestType(''); setDescription(''); setPhotos([]); setError(''); setResult(null)
    setAuthError(''); setLoginUsername(''); setLoginPin('')
    setRegForm({ name: '', whatsapp: '', username: '', pin: '', pinConfirm: '' })
  }, [open])

  useEffect(() => {
    if (account?.whatsapp) setWhatsapp(account.whatsapp)
  }, [account])

  if (!open) return null

  const types = ar ? REQUEST_TYPES_AR : REQUEST_TYPES_EN

  function validatePhone(v) {
    return (v || '').replace(/\D/g, '').replace(/^218/, '').length === 9
  }

  async function handleLogin(e) {
    e.preventDefault(); setAuthError('')
    if (!loginUsername.trim() || !/^\d{6}$/.test(loginPin)) {
      setAuthError(ar ? 'أدخل اسم المستخدم ورقمًا سريًا مكوّنًا من 6 أرقام' : 'Enter username and 6-digit PIN')
      return
    }
    try {
      await login({ username: loginUsername.trim(), pin: loginPin })
      setView('form')
    } catch (err) {
      setAuthError(ar ? (err?.message || 'اسم المستخدم أو الرقم السري غير صحيح') : 'Incorrect username or PIN')
    }
  }

  async function handleRegister(e) {
    e.preventDefault(); setAuthError('')
    if (!regForm.name.trim() || !regForm.whatsapp.trim() || !regForm.username.trim() || !regForm.pin || !regForm.pinConfirm) {
      setAuthError(ar ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields'); return
    }
    if (!validatePhone(regForm.whatsapp)) {
      setAuthError(ar ? 'رقم الواتساب غير مكتمل (9 أرقام بعد 218+)' : 'WhatsApp must be 9 digits after +218'); return
    }
    if (!/^\d{6}$/.test(regForm.pin)) {
      setAuthError(ar ? 'الرقم السري يجب أن يكون 6 أرقام' : 'PIN must be 6 digits'); return
    }
    if (regForm.pin !== regForm.pinConfirm) {
      setAuthError(ar ? 'الرقم السري غير متطابق' : 'PINs do not match'); return
    }
    try {
      await register({ name: regForm.name.trim(), whatsapp: regForm.whatsapp.trim(), username: regForm.username.trim(), pin: regForm.pin })
      setView('form')
    } catch (err) {
      setAuthError(ar ? (err?.message || 'حدث خطأ، حاول مرة أخرى') : 'Something went wrong, try again')
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length)
    const added = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setPhotos(p => [...p, ...added])
    e.target.value = ''
  }

  function removePhoto(i) {
    setPhotos(p => { const n = [...p]; URL.revokeObjectURL(n[i].preview); n.splice(i, 1); return n })
  }

  async function handleSubmit() {
    if (!requestType) { setError(ar ? 'اختر نوع الطلب' : 'Select request type'); return }
    if (description.trim().length < 10) { setError(ar ? 'اكتب وصفًا للمشكلة (10 أحرف على الأقل)' : 'Write a description (at least 10 chars)'); return }
    setError(''); setSubmitting(true)
    try {
      let tags = []
      try { const { tags: t } = await api.analyzeRequest(description); tags = t || [] } catch {}
      const tagsSuffix = tags.length ? `\n\n--- وسوم ذكية: ${tags.join('، ')} ---` : ''
      const res = await api.generalRequests.create({
        cityId,
        cityName,
        categoryId: categoryId || undefined,
        categoryName: categoryName || undefined,
        title: requestType,
        description: description.trim() + tagsSuffix,
      })
      setResult(res)
      setView('done')
    } catch (err) {
      setError(err.message === 'HTTP 429'
        ? (ar ? 'وصلت الحد الأقصى للطلبات، حاول بعد ساعة' : 'Request limit reached, try in an hour')
        : (ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong'))
    } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-[200]" dir={ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[#071B33]/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#F4F5F7] rounded-t-[28px] flex flex-col"
        style={{ maxHeight: '93dvh' }}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* ── FORM HEADER ── */}
        {(view === 'form' || view === 'gate' || view === 'login' || view === 'register') && (
          <div className="flex-shrink-0 px-5 pt-4 pb-5 bg-white rounded-t-[28px] border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={view === 'login' || view === 'register' ? () => setView('gate') : onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <XIcon className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-9" />
            </div>

            {view === 'form' && (
              <>
                <h2 className="text-[22px] font-black text-[#071B33] leading-tight text-center">
                  {ar ? 'أرسل طلبك إلى الفنيين' : 'Send Your Request'}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 bg-[#FF7900]/10 text-[#FF7900] text-[12px] font-bold px-3 py-1 rounded-full">
                    <span className="text-[11px]">⚡</span>
                    {categoryName}
                  </span>
                  {cityName && (
                    <>
                      <span className="text-gray-300 text-[12px]">›</span>
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[12px] font-semibold px-3 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {cityName}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}

            {view === 'gate' && (
              <div className="text-center mt-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
                  <Send className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-[20px] font-black text-[#071B33]">{ar ? 'أرسل طلبك للفنيين' : 'Send Your Request'}</h2>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                  {ar ? 'سجّل دخولك لإرسال طلبك إلى جميع مقدمي الخدمة في منطقتك' : 'Log in to send your request to all providers in your area'}
                </p>
              </div>
            )}

            {(view === 'login' || view === 'register') && (
              <div className="text-center mt-1">
                <h2 className="text-[20px] font-black text-[#071B33]">
                  {view === 'login' ? (ar ? 'مرحبًا بعودتك' : 'Welcome Back') : (ar ? 'إنشاء حساب' : 'Create Account')}
                </h2>
                <p className="text-[13px] text-gray-500 mt-1">
                  {view === 'login' ? (ar ? 'أدخل بيانات حسابك للمتابعة' : 'Enter your credentials to continue') : (ar ? 'أنشئ حسابك في ثوانٍ' : 'Set up your account in seconds')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 space-y-5"
          style={{ scrollbarWidth: 'none' }}>

          {/* ── GATE ── */}
          {view === 'gate' && (
            <div className="space-y-3 pt-1">
              <button onClick={() => setView('login')}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl text-white active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 8px 24px rgba(255,121,0,0.3)' }}>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <span className="text-start flex-1">
                  <span className="block text-[15px] font-black">{ar ? 'تسجيل الدخول' : 'Log In'}</span>
                  <span className="block text-[12px] font-medium opacity-80">{ar ? 'لديك حساب بالفعل' : 'Already have an account'}</span>
                </span>
                <ChevronRight className={`w-5 h-5 opacity-70 ${ar ? 'rotate-180' : ''}`} />
              </button>

              <button onClick={() => setView('register')}
                className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-200 active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[#071B33]/10 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-[#071B33]" />
                </div>
                <span className="text-start flex-1">
                  <span className="block text-[15px] font-black text-[#071B33]">{ar ? 'إنشاء حساب جديد' : 'Create a New Account'}</span>
                  <span className="block text-[12px] font-medium text-gray-500">{ar ? 'اسم مستخدم ورقم سري من 6 أرقام' : 'Username and 6-digit PIN'}</span>
                </span>
                <ChevronRight className={`w-5 h-5 text-gray-400 ${ar ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div>
                <label className={LABEL}>{ar ? 'اسم المستخدم' : 'Username'}</label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-gray-400" />
                  <input value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                    autoCapitalize="off" autoCorrect="off" dir="ltr"
                    placeholder="ahmed_92"
                    className={`${INPUT} ps-11`} required />
                </div>
              </div>
              <div>
                <label className={LABEL}>{ar ? 'الرقم السري (6 أرقام)' : 'PIN (6 digits)'}</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-gray-400" />
                  <input value={loginPin} onChange={e => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    type="password" inputMode="numeric" maxLength={6} dir="ltr"
                    placeholder="••••••"
                    className={`${INPUT} ps-11 tracking-[0.4em] text-center`} required />
                </div>
              </div>
              {authError && <ErrorBanner msg={authError} />}
              <button type="submit" disabled={authLoading}
                className="w-full py-4 rounded-2xl font-black text-[16px] text-white disabled:opacity-60 active:scale-[0.98] transition-all mt-2"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 8px 24px rgba(255,121,0,0.3)' }}>
                {authLoading ? (ar ? 'جارٍ الدخول...' : 'Logging in...') : (ar ? 'تسجيل الدخول' : 'Log In')}
              </button>
              <p className="text-center text-[13px] text-gray-500">
                {ar ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
                <button type="button" onClick={() => { setAuthError(''); setView('register') }}
                  className="font-bold text-[#FF7900]">
                  {ar ? 'إنشاء حساب' : 'Create one'}
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 pt-1">
              <div>
                <label className={LABEL}>{ar ? 'الاسم الكامل' : 'Full Name'}</label>
                <input value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={ar ? 'أحمد محمد' : 'John Smith'}
                  className={INPUT} required />
              </div>
              <div>
                <label className={LABEL}>{ar ? 'رقم الواتساب' : 'WhatsApp'}</label>
                <LibyaPhoneInput value={regForm.whatsapp} onChange={v => setRegForm(f => ({ ...f, whatsapp: v }))} required />
              </div>
              <div>
                <label className={LABEL}>{ar ? 'اسم المستخدم' : 'Username'}</label>
                <input value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))}
                  autoCapitalize="off" autoCorrect="off" dir="ltr" placeholder="ahmed_92"
                  className={INPUT} required />
                <p className="text-[11px] font-medium text-gray-400 mt-1.5 ps-1">
                  {ar ? 'إنجليزي فقط: حروف، أرقام، "_"' : 'English only: letters, numbers, "_"'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>{ar ? 'الرقم السري' : 'PIN'}</label>
                  <input value={regForm.pin} onChange={e => setRegForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    type="password" inputMode="numeric" maxLength={6} dir="ltr" placeholder="••••••"
                    className={`${INPUT} tracking-[0.4em] text-center`} required />
                </div>
                <div>
                  <label className={LABEL}>{ar ? 'تأكيد الرقم' : 'Confirm PIN'}</label>
                  <input value={regForm.pinConfirm} onChange={e => setRegForm(f => ({ ...f, pinConfirm: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    type="password" inputMode="numeric" maxLength={6} dir="ltr" placeholder="••••••"
                    className={`${INPUT} tracking-[0.4em] text-center`} required />
                </div>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-[12px] font-semibold text-amber-800 leading-relaxed">
                  {ar ? 'احفظ اسم المستخدم والرقم السري — لا يمكن استعادتهما تلقائيًا' : 'Save your username & PIN — they cannot be auto-recovered'}
                </span>
              </div>
              {authError && <ErrorBanner msg={authError} />}
              <button type="submit" disabled={authLoading}
                className="w-full py-4 rounded-2xl font-black text-[16px] text-white disabled:opacity-60 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 8px 24px rgba(255,121,0,0.3)' }}>
                {authLoading ? (ar ? 'جارٍ الإنشاء...' : 'Creating...') : (ar ? 'إنشاء الحساب' : 'Create Account')}
              </button>
              <p className="text-center text-[13px] text-gray-500">
                {ar ? 'لديك حساب؟ ' : 'Have an account? '}
                <button type="button" onClick={() => { setAuthError(''); setView('login') }}
                  className="font-bold text-[#FF7900]">
                  {ar ? 'تسجيل الدخول' : 'Log in'}
                </button>
              </p>
            </form>
          )}

          {/* ── FORM ── */}
          {view === 'form' && (
            <div className="space-y-3 pt-1">

              {/* Request type */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <label className={LABEL}>{ar ? 'نوع الطلب' : 'Request Type'} <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {types.map(({ label, icon }) => (
                    <button key={label} type="button"
                      onClick={() => setRequestType(label)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-[12px] font-bold transition-all active:scale-95 ${
                        requestType === label
                          ? 'bg-[#FF7900] text-white border-[#FF7900] shadow-md shadow-orange-200'
                          : 'bg-gray-50 text-[#071B33] border-gray-200 hover:border-[#FF7900]/40'
                      }`}>
                      <span className="text-[18px] leading-none">{icon}</span>
                      <span className="leading-tight text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <label className={LABEL}>{ar ? 'وصف المشكلة أو الخدمة' : 'Description'} <span className="text-red-400">*</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder={ar ? 'اشرح المشكلة بالتفصيل حتى يتمكن الفني من تقديم عرض دقيق...' : 'Describe the issue so providers can give an accurate quote...'}
                  className={`${INPUT} resize-none leading-relaxed`}
                />
                {description.length > 0 && (
                  <div className="flex justify-end mt-1.5">
                    <span className={`text-[11px] font-medium ${description.length < 10 ? 'text-red-400' : 'text-green-500'}`}>
                      {description.length} {ar ? 'حرف' : 'chars'}
                    </span>
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <label className={LABEL}>
                  {ar ? 'صور توضيحية' : 'Photos'}
                  <span className="text-gray-400 font-normal normal-case ms-1">{ar ? '(اختياري، حتى 3)' : '(optional, up to 3)'}</span>
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-[88px] h-[88px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1.5 end-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <XIcon className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-[88px] h-[88px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 bg-gray-50 active:scale-95 transition-transform hover:border-[#FF7900]/60 hover:bg-orange-50 group">
                      <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#FF7900] transition-colors" />
                      <span className="text-[11px] text-gray-400 font-semibold group-hover:text-[#FF7900] transition-colors">{ar ? 'إضافة' : 'Add'}</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </div>

              {/* WhatsApp */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <label className={LABEL}>{ar ? 'رقم الواتساب للتواصل' : 'WhatsApp Contact'}</label>
                <LibyaPhoneInput value={whatsapp} onChange={setWhatsapp} />
                <p className="text-[11px] text-gray-400 mt-2 ps-1">
                  {ar ? 'يُستخدم للتواصل معك من قِبل مقدمي الخدمة' : 'Used by providers to contact you'}
                </p>
              </div>

              {error && <ErrorBanner msg={error} />}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-2xl font-black text-[16px] text-white disabled:opacity-60 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)', boxShadow: '0 10px 30px rgba(7,27,51,0.3)' }}>
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{ar ? 'جارٍ الإرسال...' : 'Sending...'}</span></>
                  : <><Send className="w-5 h-5" /><span>{ar ? 'أرسل الطلب إلى الفنيين' : 'Send to Providers'}</span></>}
              </button>
            </div>
          )}

          {/* ── DONE ── */}
          {view === 'done' && (
            <div className="text-center space-y-5 py-8">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-[#34A853]" />
                </div>
                <span className="absolute -bottom-1 -end-1 text-2xl animate-bounce">🎉</span>
              </div>
              <div>
                <p className="text-[22px] font-black text-[#071B33]">{ar ? 'طلبك في الطريق!' : 'Your request is on the way!'}</p>
                {result?.orderNumber && (
                  <p className="text-[13px] text-gray-500 mt-1.5">
                    {ar ? 'رقم الطلب' : 'Order'}{' '}
                    <span className="font-black text-[#FF7900] text-[15px]" dir="ltr">{result.orderNumber}</span>
                  </p>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl px-5 py-4 text-start space-y-2.5">
                <p className="text-[13px] text-gray-600 font-medium">
                  {ar ? '📲 سيتواصل معك مقدمو الخدمة عبر الواتساب بعروضهم' : '📲 Providers will contact you on WhatsApp with their offers'}
                </p>
                <p className="text-[13px] text-gray-600 font-medium">
                  {ar ? '📋 تابع حالة طلبك من صفحة "طلباتي"' : '📋 Track your request status from "My Requests"'}
                </p>
              </div>

              <button
                onClick={() => { onClose(); navigate('/my-requests') }}
                className="w-full py-4 rounded-2xl font-black text-[16px] text-white flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 10px 30px rgba(255,121,0,0.3)' }}>
                <ClipboardList className="w-5 h-5" />
                <span>{ar ? 'عرض طلباتي' : 'View My Requests'}</span>
              </button>

              <button onClick={onClose}
                className="w-full py-3 rounded-2xl font-bold text-[14px] text-gray-500 bg-gray-100 active:scale-[0.98] transition-all">
                {ar ? 'إغلاق' : 'Close'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function ErrorBanner({ msg }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
      <span className="text-base flex-shrink-0">⚠️</span>
      <span>{msg}</span>
    </div>
  )
}
