import { useState, useEffect, useRef } from 'react'
import { useLang } from '../context/LanguageContext'
import { useSeoMeta } from '../hooks/useSeoMeta'
import BackHeader from '../components/BackHeader'
import ServiceImageIcon from '../components/ServiceImageIcon'
import { categories } from '../data/services'
import { useRoute, useLocation, useSearch } from 'wouter'
import { getFileUrl, uploadFile } from '../lib/api'
import { SkeletonListCards } from '../components/Skeleton'
import {
  Star, MapPin, Phone, MessageSquare, Zap, Search,
  Users, Loader2, Building2, Heart, Navigation, Map, List, X as XIcon,
  Send, CheckCircle2, LogIn, UserPlus, Camera, Lock, User, AlertTriangle,
} from 'lucide-react'
import AdBanner from '../components/AdBanner'
import api from '../lib/api'
import MapView, { haversine, formatDist } from '../components/MapView'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import { useCustomerAccount } from '../context/CustomerAccountContext'

function useFavorites(storageKey) {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })
  const toggle = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }
  return { favs, toggle, isFav: (id) => favs.includes(id) }
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function TechCard({ tech, lang, onOpen, isFav, onToggleFav, categoryName, distance }) {
  const ar = lang === 'ar'
  const name = tech.nameAr || tech.name_ar || ''
  const firstName = name ? (name.trim().split(' ')[0] || '?') : '?'
  const photo = getFileUrl(tech.profilePhoto || tech.profile_photo || null)
  const availableNow = tech.availableNow ?? tech.available_now ?? (tech.status === 'available')
  const emergency = tech.emergency || false
  const isFeatured = tech.isFeatured ?? tech.is_featured ?? false
  const rating = tech.rating || 0
  const reviewsCount = tech.reviewsCount ?? tech.reviews_count ?? 0
  const priceFrom = tech.priceFrom ?? tech.price_from ?? 0
  const city = (ar ? tech.city_name_ar : tech.city_name_en) || tech.city_name_ar || tech.city_name || tech.city || ''
  const area = tech.area || ''
  const _td = tech.createdAt || tech.created_at
  const tecId = `TEC-${_td ? new Date(_td).getFullYear() : new Date().getFullYear()}-${String(tech.id || '').replace(/\D/g, '').slice(-6)}`

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onOpen(tech.id)}
    >
      <div className="relative">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
            <span className="text-white text-2xl font-bold text-center px-2">{firstName}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {availableNow && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ar ? 'متاح الآن' : 'Available'}
            </span>
          )}
          {emergency && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> {ar ? 'طوارئ' : 'Emergency'}
            </span>
          )}
          {isFeatured && (
            <span className="bg-[#FF7900] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5" fill="currentColor" /> {ar ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>
        {/* Heart button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(tech.id) }}
          className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isFav ? 'text-rose-500' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="p-3.5">
        <p className="font-bold text-gray-900 text-sm mb-0.5 leading-tight">{name}</p>
        <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-1">{tecId}</p>

        {categoryName && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#FF7900] flex-shrink-0" />
            <span className="text-sm font-extrabold text-[#FF7900] truncate">{categoryName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {city}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {distance != null && (
          <div className="flex items-center gap-1 mb-2">
            <Navigation className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-green-700">{formatDist(distance, ar)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Stars rating={rating} />
            {reviewsCount > 0 && (
              <span className="text-xs text-gray-400">({reviewsCount})</span>
            )}
          </div>
          {priceFrom > 0 && (
            <p className="text-xs font-bold text-[#FF7900]">
              {ar ? `من ${priceFrom} د.ل` : `From ${priceFrom} LYD`}
            </p>
          )}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <a
            href={`https://wa.me/${tech.whatsapp || tech.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {ar ? 'واتساب' : 'WhatsApp'}
          </a>
          <a
            href={`tel:${tech.phone}`}
            className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {ar ? 'اتصال' : 'Call'}
          </a>
        </div>
      </div>
    </div>
  )
}

function isNewProfile(createdAt) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

function CompanyCard({ company, lang, onOpen, isFav, onToggleFav, categoryName, distance }) {
  const ar = lang === 'ar'
  const name = company.companyName || company.company_name || ''
  const isNew = isNewProfile(company.createdAt || company.created_at)
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'
  const logo = getFileUrl(company.companyLogo || company.company_logo || null)
  const availableNow = company.availableNow ?? company.available_now ?? false
  const emergency = company.emergency || false
  const priceFrom = company.priceFrom || company.price_from || ''
  const city = company.city || ''
  const area = company.area || ''
  const _ccd = company.createdAt || company.created_at
  const comId = `COM-${_ccd ? new Date(_ccd).getFullYear() : new Date().getFullYear()}-${String(company.id || '').replace(/\D/g, '').slice(-6)}`

  return (
    <div
      className="bg-[#EBF5FF] rounded-2xl border border-blue-300 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onOpen(company.id)}
    >
      <div className="relative">
        {logo ? (
          <img src={logo} alt={name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
            <span className="text-white text-2xl font-bold text-center px-2">{firstWord}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Building2 className="w-2.5 h-2.5" /> {ar ? 'شركة خدمية' : 'Service Co.'}
          </span>
          {isNew && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {ar ? 'جديد' : 'New'}
            </span>
          )}
          {availableNow && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ar ? 'متاحة الآن' : 'Available'}
            </span>
          )}
          {emergency && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> {ar ? 'طوارئ' : 'Emergency'}
            </span>
          )}
        </div>
        {/* Heart button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(company.id) }}
          className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isFav ? 'text-rose-500' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
          <span className="text-[9px] font-black bg-[#071B33] text-white px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">خدمية</span>
        </div>
        <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-1">{comId}</p>

        {categoryName && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#FF7900] flex-shrink-0" />
            <span className="text-sm font-extrabold text-[#FF7900] truncate">{categoryName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {city}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {distance != null && (
          <div className="flex items-center gap-1 mb-2">
            <Navigation className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-green-700">{formatDist(distance, ar)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            {ar ? 'شركة / مؤسسة' : 'Business'}
          </span>
          {priceFrom && (
            <p className="text-xs font-bold text-[#FF7900]">
              {ar ? `من ${priceFrom} د.ل` : `From ${priceFrom} LYD`}
            </p>
          )}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <a
            href={`https://wa.me/${company.whatsapp || company.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {ar ? 'واتساب' : 'WhatsApp'}
          </a>
          <a
            href={`tel:${company.phone}`}
            className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {ar ? 'اتصال' : 'Call'}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── City Picker Step ────────────────────────────────────────────────────────
const MODAL_LABEL = "block text-[13px] font-bold text-[#071B33] mb-1.5"
const MODAL_INPUT = "w-full rounded-xl border-2 border-[#0a0a0a] bg-[#F0F2F5] px-3.5 py-3 text-[15px] font-medium text-[#071B33] placeholder:text-gray-400 focus:border-[#FF7900] focus:bg-white focus:ring-4 focus:ring-[#FF7900]/15 outline-none transition-all"
const REQUEST_TYPES_AR = ['صيانة وإصلاح', 'تركيب', 'فحص ومعاينة', 'تنفيذ مشروع', 'استشارة', 'أخرى']
const REQUEST_TYPES_EN = ['Repair & Maintenance', 'Installation', 'Inspection', 'Project', 'Consultation', 'Other']

function SendRequestModal({ open, onClose, cityId, cityName, categoryId, categoryName, ar }) {
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
    view === 'gate'     ? (ar ? 'تسجيل الدخول مطلوب'   : 'Login Required') :
    view === 'login'    ? (ar ? 'تسجيل الدخول'           : 'Log In') :
    view === 'register' ? (ar ? 'إنشاء حساب'             : 'Create Account') :
    view === 'done'     ? (ar ? 'تم إرسال طلبك!'         : 'Request Sent!') :
                          (ar ? 'أرسل طلبك إلى الفنيين'  : 'Send Your Request')

  return (
    <div className="fixed inset-0 z-[200]" dir={ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[#071B33]/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-3xl"
        style={{ maxHeight: '92dvh', overflowY: 'auto' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
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

          {/* ——— Auth Gate ——— */}
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

          {/* ——— Login Form ——— */}
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

          {/* ——— Register Form ——— */}
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

          {/* ——— Request Form ——— */}
          {view === 'form' && (
            <div className="space-y-5">
              {/* Context badge */}
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF7900] flex-shrink-0" />
                <span className="text-[13px] font-bold text-[#FF7900]">{categoryName}</span>
                {cityName && <><span className="text-orange-300">·</span><span className="text-[13px] text-orange-700 font-medium">{cityName}</span></>}
              </div>

              {/* نوع الطلب */}
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

              {/* وصف المشكلة */}
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

              {/* الصور */}
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

              {/* رقم التواصل */}
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

          {/* ——— Done ——— */}
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

function CityPicker({ cities, categoryName, categoryIcon, ar, onSelect }) {
  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={categoryName} />

      <main className="px-4 pt-5">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center overflow-hidden bg-[#FF7900]/10">
            <img src={categoryIcon} alt="" className="w-11 h-11 object-contain" />
          </div>
          <h2 className="text-xl font-black text-[#071B33]">
            {ar ? 'اختر المدينة' : 'Select City'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {ar ? 'اختر مدينتك لعرض الفنيين المتاحين' : 'Choose your city to see available providers'}
          </p>
        </div>

        {/* All cities button */}
        <button
          onClick={() => onSelect('')}
          className="w-full flex flex-col items-center justify-center bg-blue-600 rounded-2xl px-4 py-5 mb-5 active:scale-[0.98] transition-transform shadow-lg shadow-blue-200"
        >
          <p className="font-extrabold text-white text-2xl tracking-wide">{ar ? '🇱🇾 كل ليبيا' : '🇱🇾 All Libya'}</p>
          <p className="text-sm text-blue-100 mt-1">{ar ? 'عرض جميع الفنيين في البلاد' : 'Show all providers across the country'}</p>
        </button>

        {/* Section label */}
        <div className="px-1 pb-2 pt-1">
          <span className="inline-flex items-center bg-[#071B33] text-white text-[12px] font-bold px-3 py-1 rounded-full">
            {ar ? 'المدن' : 'Cities'}
          </span>
        </div>

        {/* Cities — 4-column grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {cities.map((city, idx) => {
            const cityName = ar ? (city.name_ar || city.nameAr || '') : (city.name_en || city.nameEn || '')
            const gradients = [
              'linear-gradient(145deg,#FF7900 0%,#FF9A3C 100%)',
              'linear-gradient(145deg,#071B33 0%,#1A3A5C 100%)',
              'linear-gradient(145deg,#C2410C 0%,#EA7A2A 100%)',
              'linear-gradient(145deg,#0E4D8C 0%,#1A73C8 100%)',
              'linear-gradient(145deg,#B45309 0%,#D97706 100%)',
              'linear-gradient(145deg,#1D4E6B 0%,#0E7490 100%)',
              'linear-gradient(145deg,#7C2D12 0%,#C2410C 100%)',
              'linear-gradient(145deg,#1E3A5F 0%,#2D6FA6 100%)',
            ]
            const bg = gradients[idx % gradients.length]
            return (
              <button
                key={city.id}
                onClick={() => onSelect(city.id)}
                className="flex flex-col items-center justify-center rounded-2xl active:scale-95 transition-transform aspect-square relative overflow-hidden"
                style={{ background: bg, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                <span className="text-white/40 text-[18px] mb-0.5 leading-none select-none">📍</span>
                <span className="text-white font-extrabold text-[13px] text-center leading-tight w-full px-1.5 line-clamp-2 drop-shadow-sm">{cityName}</span>
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 60%)' }} />
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default function CategoryTechnicians() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/category/:id')
  const [location, navigate] = useLocation()
  const categoryId = params?.id
  const { isFav, toggle: toggleFav } = useFavorites('fav_technicians')
  const { isFav: isCompanyFav, toggle: toggleCompanyFav } = useFavorites('fav_companies')

  const category = categories.find(c => c.id === categoryId)
  const categoryName = ar ? (category?.nameAr || '') : (category?.nameEn || '')

  const iconMap = {
    electricity:'/icons/services/electricity.svg', plumbing:'/icons/services/plumbing.svg',
    ac:'/icons/services/ac.svg', painting:'/icons/services/painting.svg',
    carpentry:'/icons/services/carpentry.svg', cleaning:'/icons/services/cleaning.svg',
    moving:'/icons/services/moving.svg', cctv:'/icons/services/cctv.svg',
    network:'/icons/services/network.svg', maintenance:'/icons/services/maintenance.svg',
    appliances:'/icons/services/appliances.svg', welding:'/icons/services/welding.svg',
    aluminum_glass:'/icons/services/aluminum-glass.svg', waterproofing:'/icons/services/waterproofing.svg',
    thermal_insulation:'/icons/services/thermal-insulation.svg', gas:'/icons/services/gas.svg',
    locks_doors:'/icons/services/locks-doors.svg', contracting:'/icons/services/contracting.svg',
    tiles:'/icons/services/tiles.svg', more:'/icons/services/more.svg',
  }
  const categoryIcon = iconMap[category?.iconName] || iconMap[categoryId] || '/icons/services/maintenance.svg'

  const searchStr = useSearch()
  const selectedCity = new URLSearchParams(searchStr).get('city') ?? ''
  const cityChosen   = searchStr.includes('city=')
  const [cities, setCities]             = useState([])
  const [selectedCityName, setSelectedCityName] = useState('')

  useSeoMeta({
    title: categoryName
      ? (selectedCityName
        ? (ar ? `${categoryName} في ${selectedCityName}` : `${categoryName} in ${selectedCityName}`)
        : categoryName)
      : null,
    description: categoryName
      ? (ar
        ? `اعثر على أفضل ${categoryName}${selectedCityName ? ` في ${selectedCityName}` : ''} عبر منصة اطلب فني في ليبيا`
        : `Find top ${categoryName}${selectedCityName ? ` in ${selectedCityName}` : ''} on Otlob Fanni Libya`)
      : null,
  })

  const [techs, setTechs]               = useState([])
  const [companies, setCompanies]       = useState([])
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [visibleTechs, setVisibleTechs]         = useState(20)
  const [visibleCompanies, setVisibleCompanies] = useState(20)
  const [userLocation, setUserLocation]   = useState(null)
  const [nearMeLoading, setNearMeLoading] = useState(false)
  const [viewMode, setViewMode]           = useState('list')
  const [showSendModal, setShowSendModal] = useState(false)


  useEffect(() => {
    api.cities().then(setCities).catch(() => {})
  }, [])

  // Resolve city name once cities are loaded
  useEffect(() => {
    if (!cities.length || !selectedCity) return
    const found = cities.find(c => c.id === selectedCity)
    setSelectedCityName(ar ? (found?.nameAr || found?.name_ar || '') : (found?.nameEn || found?.name_en || ''))
  }, [cities, selectedCity, ar])

  // After city is chosen, load results
  useEffect(() => {
    if (!categoryId || !cityChosen) return
    setLoading(true)
    setError(null)
    Promise.all([
      api.technicians({ category: categoryId, city_id: selectedCity || undefined }),
      api.companies({ specialty: categoryId, city: selectedCity || undefined }),
    ])
      .then(([techData, compData]) => {
        setTechs(techData)
        setCompanies(compData)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [categoryId, cityChosen, selectedCity])

  const handleCitySelect = (cityId) => {
    navigate(`/category/${categoryId}?city=${cityId}`)
  }

  const handleNearMe = () => {
    if (userLocation) { setUserLocation(null); return }
    if (!navigator.geolocation) return
    setNearMeLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMeLoading(false)
      },
      () => setNearMeLoading(false),
      { timeout: 8000 }
    )
  }

  useEffect(() => {
    setVisibleTechs(20)
    setVisibleCompanies(20)
  }, [search, categoryId, selectedCity])

  // Show city picker if no city in URL yet
  if (!cityChosen) {
    return (
      <CityPicker
        cities={cities}
        categoryName={categoryName}
        categoryIcon={categoryIcon}
        ar={ar}
        onSelect={handleCitySelect}
      />
    )
  }

  const withDist = (item) => ({
    ...item,
    _dist: (userLocation && item.lat && item.lng)
      ? haversine(userLocation.lat, userLocation.lng, item.lat, item.lng)
      : null,
  })
  const byDist = (a, b) => {
    if (a._dist == null && b._dist == null) return 0
    if (a._dist == null) return 1
    if (b._dist == null) return -1
    return a._dist - b._dist
  }

  const filteredTechs = techs
    .filter(t => {
      if (!search) return true
      const q = search.toLowerCase()
      const fields = [
        t.nameAr, t.name_ar, t.nameEn, t.name_en,
        t.city_name, t.city, t.area,
        t.descriptionAr, t.description_ar,
        t.descriptionEn, t.description_en,
        ...(Array.isArray(t.aiTags) ? t.aiTags : []),
        ...(Array.isArray(t.extraSpecialties) ? t.extraSpecialties : []),
      ]
      return fields.some(f => f && String(f).toLowerCase().includes(q))
    })
    .map(withDist)
    .sort(byDist)

  const filteredCompanies = companies
    .filter(c => {
      if (!search) return true
      const q = search.toLowerCase()
      const fields = [
        c.companyName, c.company_name,
        c.city, c.area,
        c.description,
        ...(Array.isArray(c.aiTags) ? c.aiTags : []),
      ]
      return fields.some(f => f && String(f).toLowerCase().includes(q))
    })
    .map(withDist)
    .sort(byDist)

  const shownTechs     = filteredTechs.slice(0, visibleTechs)
  const shownCompanies = filteredCompanies.slice(0, visibleCompanies)
  const totalCount     = filteredTechs.length + filteredCompanies.length

  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={categoryName || (ar ? 'مقدمو الخدمة' : 'Service Providers')} />

      <main className="px-4 pt-4 space-y-4">

        {/* شعار التخصص + المدينة */}
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
          <div className="w-12 h-12 bg-[#FF7900]/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={categoryIcon} alt="" className="w-9 h-9 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#071B33] text-base">{categoryName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#FF7900] flex-shrink-0" />
              <p className="text-xs text-gray-500 font-medium">
                {selectedCityName || (ar ? 'كل ليبيا' : 'All Libya')}
              </p>
              <span className="text-gray-300">·</span>
              <p className="text-xs text-gray-400">
                {loading ? (ar ? 'جارٍ التحميل...' : 'Loading...') : ar ? `${totalCount} مقدّم` : `${totalCount} providers`}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setCityChosen(false); setTechs([]); setCompanies([]) }}
            className="flex-shrink-0 bg-[#F2F2F7] text-[#071B33] text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            {ar ? 'غيّر المدينة' : 'Change'}
          </button>
        </div>

        {/* بحث + Near Me + View Toggle */}
        <div className="space-y-2">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 ${ar ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? 'بحث عن فني أو شركة...' : 'Search provider...'}
              className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 ${ar ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNearMe}
              disabled={nearMeLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all flex-shrink-0 ${
                userLocation
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-600 border-gray-200 active:scale-95'
              }`}
            >
              {nearMeLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Navigation className="w-3.5 h-3.5" />}
              {ar ? 'الأقرب إليّ' : 'Near Me'}
              {userLocation && (
                <span
                  onClick={e => { e.stopPropagation(); setUserLocation(null) }}
                  className="ml-0.5 text-green-600 hover:text-red-500 cursor-pointer"
                >
                  <XIcon className="w-3 h-3 inline" />
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 active:scale-95 transition-all flex-shrink-0"
            >
              {viewMode === 'list'
                ? <><Map className="w-3.5 h-3.5" />{ar ? 'خريطة' : 'Map'}</>
                : <><List className="w-3.5 h-3.5" />{ar ? 'قائمة' : 'List'}</>}
            </button>
          </div>
          {userLocation && (
            <p className="text-[11px] text-green-600 font-medium px-1">
              ✓ {ar ? 'يتم الترتيب حسب المسافة منك' : 'Sorted by distance from you'}
            </p>
          )}
        </div>

        {/* إعلان */}
        <AdBanner placement="category_page" categoryId={categoryId} dismissible />

        {/* زر إرسال الطلب إلى مقدمي الخدمة */}
        <button
          type="button"
          onClick={() => setShowSendModal(true)}
          className="w-full rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)', boxShadow: '0 6px 20px rgba(7,27,51,0.25)' }}
        >
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,121,0,0.18)' }}>
              <Send className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div className="flex-1 text-start">
              <p className="text-[15px] font-black text-white leading-tight">
                {ar ? 'أرسل طلبك إلى مقدمي الخدمة' : 'Send Your Request to Providers'}
              </p>
              <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                {ar
                  ? 'اكتب وصف المشكلة ليصل طلبك إلى الفنيين والشركات المطابقة في نفس المدينة والتخصص'
                  : 'Describe your issue and reach all matching providers in your city and specialty'}
              </p>
            </div>
            <div className="flex-shrink-0">
              {ar ? <span className="text-white/50 text-lg">‹</span> : <span className="text-white/50 text-lg">›</span>}
            </div>
          </div>
        </button>

        {/* Map View */}
        {viewMode === 'map' && !loading && (
          <MapView
            techs={filteredTechs}
            companies={filteredCompanies}
            userLocation={userLocation}
            ar={ar}
            onSelectTech={id => navigate(`/technician/${id}`)}
            onSelectCompany={id => navigate(`/company/${id}`)}
          />
        )}

        {/* القائمة */}
        {viewMode === 'list' && loading ? (
          <SkeletonListCards count={4} />
        ) : viewMode === 'list' && error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-red-500 text-sm">{ar ? 'حدث خطأ أثناء التحميل' : 'Error loading data'}</p>
            <button onClick={() => window.location.reload()}
              className="text-[#FF7900] text-sm font-medium hover:underline">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : viewMode === 'list' && totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-[#FF7900]/40" />
            </div>
            <div>
              <p className="text-[#071B33] font-extrabold text-base mb-1">
                {ar ? 'لم يتم العثور على نتائج' : 'No results found'}
              </p>
              <p className="text-gray-400 text-sm max-w-[240px] mx-auto leading-relaxed">
                {ar
                  ? 'جرّب تخصصاً أو مدينة أخرى'
                  : 'Try a different specialty or city'}
              </p>
            </div>
            {selectedCity && (
              <button
                onClick={() => { setSelectedCity(''); setCityChosen(false); navigate(`/category/${categoryId}`) }}
                className="bg-[#FF7900] text-white text-sm font-bold px-5 py-2.5 rounded-xl active:scale-[0.97] transition-transform shadow-sm shadow-[#FF7900]/30">
                {ar ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {/* الفنيون الأفراد */}
            {filteredTechs.length > 0 && (
              <div>
                {filteredCompanies.length > 0 && (
                  <div className="rounded-2xl mb-3 border-r-4 border-[#FF7900] overflow-hidden"
                    style={{ background: 'linear-gradient(to left, rgba(255,121,0,0.09), rgba(255,121,0,0.02))' }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">🔧</span>
                        <span className="text-[20px] font-black text-[#FF7900] leading-none">{ar ? 'الفنيون' : 'Technicians'}</span>
                      </div>
                      <span className="text-sm font-black bg-[#FF7900] text-white px-3 py-1 rounded-full leading-none">{filteredTechs.length}</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {shownTechs.map(tech => (
                    <TechCard
                      key={tech.id}
                      tech={tech}
                      lang={lang}
                      onOpen={(id) => navigate(`/technician/${id}`)}
                      isFav={isFav(tech.id)}
                      onToggleFav={toggleFav}
                      categoryName={categoryName}
                      distance={tech._dist}
                    />
                  ))}
                </div>
                {filteredTechs.length > visibleTechs && (
                  <button
                    onClick={() => setVisibleTechs(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-[#FF7900]/30 text-[#FF7900] font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredTechs.length - visibleTechs})`
                      : `Load More (${filteredTechs.length - visibleTechs})`}
                  </button>
                )}
              </div>
            )}

            {/* الشركات */}
            {filteredCompanies.length > 0 && (
              <div>
                {filteredTechs.length > 0 && (
                  <div className="rounded-2xl mb-3 border-r-4 border-[#1e40af] overflow-hidden"
                    style={{ background: 'linear-gradient(to left, rgba(30,64,175,0.09), rgba(30,64,175,0.02))' }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">🏢</span>
                        <span className="text-[20px] font-black text-[#1e40af] leading-none">{ar ? 'الشركات الخدمية' : 'Companies'}</span>
                      </div>
                      <span className="text-sm font-black bg-[#1e40af] text-white px-3 py-1 rounded-full leading-none">{filteredCompanies.length}</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {shownCompanies.map(company => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      lang={lang}
                      onOpen={(id) => navigate(`/company/${id}`)}
                      isFav={isCompanyFav(company.id)}
                      onToggleFav={toggleCompanyFav}
                      categoryName={categoryName}
                      distance={company._dist}
                    />
                  ))}
                </div>
                {filteredCompanies.length > visibleCompanies && (
                  <button
                    onClick={() => setVisibleCompanies(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-blue-300 text-blue-600 font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredCompanies.length - visibleCompanies})`
                      : `Load More (${filteredCompanies.length - visibleCompanies})`}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}

      </main>

      <SendRequestModal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        cityId={selectedCity}
        cityName={selectedCityName}
        categoryId={categoryId}
        categoryName={categoryName}
        ar={ar}
      />
    </div>
  )
}
