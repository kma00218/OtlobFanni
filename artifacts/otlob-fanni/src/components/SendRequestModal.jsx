import { useState, useEffect, useRef } from 'react'
import { MapPin, Send, CheckCircle2, LogIn, UserPlus, Camera, Lock, User, AlertTriangle, Loader2, X as XIcon } from 'lucide-react'
import api from '../lib/api'
import LibyaPhoneInput from './LibyaPhoneInput'
import { useCustomerAccount } from '../context/CustomerAccountContext'

const MODAL_LABEL = "block text-[13px] font-bold text-[#071B33] mb-1.5"
const MODAL_INPUT = "w-full rounded-xl border-2 border-[#0a0a0a] bg-[#F0F2F5] px-3.5 py-3 text-[15px] font-medium text-[#071B33] placeholder:text-gray-400 focus:border-[#FF7900] focus:bg-white focus:ring-4 focus:ring-[#FF7900]/15 outline-none transition-all"
const REQUEST_TYPES_AR = ['صيانة وإصلاح', 'تركيب', 'فحص ومعاينة', 'تنفيذ مشروع', 'استشارة', 'أخرى']
const REQUEST_TYPES_EN = ['Repair & Maintenance', 'Installation', 'Inspection', 'Project', 'Consultation', 'Other']

export default function SendRequestModal({ open, onClose, cityId, cityName, categoryId, categoryName, ar }) {
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

  const headerTitle =
    view === 'gate'     ? (ar ? 'تسجيل الدخول مطلوب'  : 'Login Required') :
    view === 'login'    ? (ar ? 'تسجيل الدخول'          : 'Log In') :
    view === 'register' ? (ar ? 'إنشاء حساب'            : 'Create Account') :
    view === 'done'     ? (ar ? 'تم إرسال طلبك!'        : 'Request Sent!') :
                          (ar ? 'أرسل طلبك إلى الفنيين' : 'Send Your Request')

  return (
    <div className="fixed inset-0 z-[200]" dir={ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[#071B33]/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-3xl"
        style={{ maxHeight: '92dvh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center gap-3 px-5 pb-4 pt-2 border-b border-gray-100">
          <button
            onClick={view === 'login' || view === 'register' ? () => setView('gate') : onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0"
          >
            <XIcon className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="font-black text-[#071B33] text-[16px]">{headerTitle}</h2>
            {(view === 'form' || view === 'gate') && (
              <p className="text-[11px] text-[#FF7900] font-bold mt-0.5 truncate">
                {categoryName}{cityName ? ` · ${cityName}` : ''}
              </p>
            )}
          </div>
          <div className="w-8" />
        </div>

        <div className="px-5 py-5 space-y-5 pb-8">

          {view === 'gate' && (
            <div className="space-y-4">
              <p className="text-[14px] text-gray-600 text-center leading-relaxed">
                {ar
                  ? 'لإرسال طلبك إلى مقدمي الخدمة، يجب عليك تسجيل الدخول أو إنشاء حساب جديد.'
                  : 'To send your request to providers, please log in or create an account.'}
              </p>
              <button onClick={() => setView('login')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-white font-bold active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 6px 20px rgba(255,121,0,0.35)' }}>
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <span className="text-start flex-1">
                  <span className="block text-[15px]">{ar ? 'تسجيل الدخول' : 'Log In'}</span>
                  <span className="block text-[12px] font-normal opacity-90">{ar ? 'لديك حساب بالفعل' : 'Already have an account'}</span>
                </span>
              </button>
              <button onClick={() => setView('register')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200 font-bold active:scale-[0.98] transition-transform">
                <UserPlus className="w-5 h-5 flex-shrink-0 text-[#071B33]" />
                <span className="text-start flex-1">
                  <span className="block text-[15px] text-[#071B33]">{ar ? 'إنشاء حساب جديد' : 'Create a New Account'}</span>
                  <span className="block text-[12px] font-normal text-gray-500">{ar ? 'اسم مستخدم ورقم سري من 6 أرقام' : 'Username and 6-digit PIN'}</span>
                </span>
              </button>
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={MODAL_LABEL}>{ar ? 'اسم المستخدم' : 'Username'}</label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-gray-400" />
                  <input value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                    autoCapitalize="off" autoCorrect="off" className={`${MODAL_INPUT} ps-9`} required />
                </div>
              </div>
              <div>
                <label className={MODAL_LABEL}>{ar ? 'الرقم السري (6 أرقام)' : 'PIN (6 digits)'}</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-gray-400" />
                  <input value={loginPin} onChange={e => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    type="password" inputMode="numeric" maxLength={6} dir="ltr"
                    className={`${MODAL_INPUT} ps-9 tracking-[0.3em] text-center`} required />
                </div>
              </div>
              {authError && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{authError}</p>}
              <button type="submit" disabled={authLoading}
                className="w-full py-3.5 rounded-xl font-black text-[16px] text-white disabled:opacity-60 active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
                {authLoading ? (ar ? 'جارٍ الدخول...' : 'Logging in...') : (ar ? 'تسجيل الدخول' : 'Log In')}
              </button>
              <button type="button" onClick={() => { setAuthError(''); setView('register') }}
                className="w-full text-center text-[13px] font-bold text-[#FF7900]">
                {ar ? 'ليس لديك حساب؟ إنشاء حساب جديد' : "Don't have an account? Create one"}
              </button>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={MODAL_LABEL}>{ar ? 'الاسم' : 'Name'} *</label>
                <input value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  className={MODAL_INPUT} required />
              </div>
              <div>
                <label className={MODAL_LABEL}>{ar ? 'رقم الواتساب' : 'WhatsApp'} *</label>
                <LibyaPhoneInput value={regForm.whatsapp} onChange={v => setRegForm(f => ({ ...f, whatsapp: v }))} required />
              </div>
              <div>
                <label className={MODAL_LABEL}>{ar ? 'اسم المستخدم' : 'Username'} *</label>
                <input value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))}
                  autoCapitalize="off" autoCorrect="off" dir="ltr" placeholder="ahmed_92" className={MODAL_INPUT} required />
                <p className="text-[12px] font-bold text-blue-600 mt-1">{ar ? 'إنجليزي فقط: حروف، أرقام، "_"' : 'English only: letters, numbers, "_"'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={MODAL_LABEL}>{ar ? 'الرقم السري' : 'PIN'} *</label>
                  <input value={regForm.pin} onChange={e => setRegForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    type="password" inputMode="numeric" maxLength={6} dir="ltr"
                    className={`${MODAL_INPUT} tracking-[0.3em] text-center`} required />
                </div>
                <div>
                  <label className={MODAL_LABEL}>{ar ? 'تأكيد الرقم' : 'Confirm PIN'} *</label>
                  <input value={regForm.pinConfirm} onChange={e => setRegForm(f => ({ ...f, pinConfirm: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    type="password" inputMode="numeric" maxLength={6} dir="ltr"
                    className={`${MODAL_INPUT} tracking-[0.3em] text-center`} required />
                </div>
              </div>
              <div className="flex items-start gap-2 text-[12px] font-bold text-white bg-[#D92D20] rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{ar ? 'احفظ اسم المستخدم والرقم السري — لا يمكن استعادتهما تلقائيًا' : 'Save your username & PIN — they cannot be auto-recovered'}</span>
              </div>
              {authError && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{authError}</p>}
              <button type="submit" disabled={authLoading}
                className="w-full py-3.5 rounded-xl font-black text-[16px] text-white disabled:opacity-60 active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
                {authLoading ? (ar ? 'جارٍ الإنشاء...' : 'Creating...') : (ar ? 'إنشاء الحساب' : 'Create Account')}
              </button>
              <button type="button" onClick={() => { setAuthError(''); setView('login') }}
                className="w-full text-center text-[13px] font-bold text-[#FF7900]">
                {ar ? 'لديك حساب؟ تسجيل الدخول' : 'Have an account? Log in'}
              </button>
            </form>
          )}

          {view === 'form' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF7900] flex-shrink-0" />
                <span className="text-[13px] font-bold text-[#FF7900]">{categoryName}</span>
                {cityName && <><span className="text-orange-300">·</span><span className="text-[13px] text-orange-700 font-medium">{cityName}</span></>}
              </div>

              <div>
                <label className={MODAL_LABEL}>{ar ? 'نوع الطلب' : 'Request Type'} *</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {types.map(t => (
                    <button key={t} type="button"
                      onClick={() => setRequestType(t)}
                      className={`px-3.5 py-2 rounded-xl text-[13px] font-bold border-2 transition-all active:scale-95 ${
                        requestType === t
                          ? 'bg-[#FF7900] text-white border-[#FF7900]'
                          : 'bg-white text-[#071B33] border-gray-200'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={MODAL_LABEL}>{ar ? 'وصف المشكلة أو الخدمة' : 'Description'} *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder={ar ? 'اشرح المشكلة بالتفصيل...' : 'Describe the issue in detail...'}
                  className={`${MODAL_INPUT} resize-none`}
                />
              </div>

              <div>
                <label className={MODAL_LABEL}>{ar ? 'صور توضيحية (اختياري، حتى 3)' : 'Photos (optional, up to 3)'}</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                        <XIcon className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 bg-gray-50 active:scale-95 transition-transform">
                      <Camera className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-medium">{ar ? 'إضافة' : 'Add'}</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </div>

              <div>
                <label className={MODAL_LABEL}>{ar ? 'رقم الواتساب للتواصل' : 'WhatsApp Contact'}</label>
                <LibyaPhoneInput value={whatsapp} onChange={setWhatsapp} />
                <p className="text-[11px] text-gray-400 mt-1">{ar ? 'يُستخدم للتواصل معك من قِبل مقدمي الخدمة' : 'Used by providers to contact you'}</p>
              </div>

              {error && <p className="text-[13px] font-medium text-red-600 bg-red-50 border-2 border-red-100 rounded-xl px-3.5 py-2.5 text-center">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-2xl font-black text-[16px] text-white disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)', boxShadow: '0 8px 24px rgba(7,27,51,0.35)' }}>
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" />{ar ? 'جارٍ الإرسال...' : 'Sending...'}</>
                  : <><Send className="w-5 h-5" />{ar ? 'أرسل الطلب إلى الفنيين' : 'Send to Providers'}</>}
              </button>
            </div>
          )}

          {view === 'done' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-[#34A853]" />
              </div>
              <div>
                <p className="text-[17px] font-black text-[#071B33]">{ar ? 'طلبك في الطريق!' : 'Your request is on the way!'}</p>
                {result?.orderNumber && (
                  <p className="text-[13px] text-gray-500 mt-1">
                    {ar ? 'رقم الطلب:' : 'Order:'} <span className="font-bold text-[#FF7900]" dir="ltr">{result.orderNumber}</span>
                  </p>
                )}
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
                {ar
                  ? 'سيتواصل معك مقدمو الخدمة بعروضهم. تجد طلبك في صفحة "طلباتي".'
                  : 'Providers will contact you with offers. Find your request in "My Requests".'}
              </p>
              <button onClick={onClose}
                className="w-full py-3.5 rounded-xl font-black text-[15px] text-white active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}>
                {ar ? 'حسنًا، شكرًا' : 'Done, Thanks'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
