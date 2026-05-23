import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import {
  ArrowRight, User, MapPin, Phone, Share2, ExternalLink,
  Lock, Eye, EyeOff, CheckCircle, XCircle, Clock, MessageSquare, Image,
  Pencil, AlertCircle,
} from 'lucide-react'
import api, { getFileUrl } from '../lib/api'

const TYPE_LABEL = {
  technician: 'فني',
  company:    'شركة خدمية',
  supplier:   'مورد مستلزمات',
}

const STATUS_INFO = {
  approved:   { label: 'مفعّل ويظهر في الدليل',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  published:  { label: 'مفعّل ويظهر في الدليل',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  reviewed:   { label: 'تمت المراجعة',            color: 'text-blue-700 bg-blue-50 border-blue-200',         icon: CheckCircle },
  pending:    { label: 'قيد المراجعة من الإدارة', color: 'text-amber-700 bg-amber-50 border-amber-200',      icon: Clock },
  draft:      { label: 'قيد المراجعة من الإدارة', color: 'text-amber-700 bg-amber-50 border-amber-200',      icon: Clock },
  rejected:   { label: 'مرفوض',                   color: 'text-red-700 bg-red-50 border-red-200',            icon: XCircle },
}

function getStatusKey(profile, entityType) {
  if (entityType === 'technician') {
    if (profile.isApproved && profile.isActive) return 'approved'
    return 'pending'
  }
  return profile.status || 'draft'
}

function getProfilePhoto(profile, entityType) {
  if (entityType === 'technician') return profile.profilePhoto || profile.profile_photo || null
  if (entityType === 'company')    return profile.companyLogo  || profile.company_logo   || null
  if (entityType === 'supplier')   return profile.logo         || null
  return null
}

function getPublicUrl(profile, entityType) {
  const isLive = entityType === 'technician'
    ? (profile.isApproved && profile.isActive)
    : (profile.status === 'published')
  if (!isLive) return null
  if (entityType === 'technician') return `/technician/${profile.id}`
  if (entityType === 'company')    return `/company/${profile.id}`
  if (entityType === 'supplier')   return `/supplier/${profile.id}`
  return null
}

function getDisplayName(profile, entityType) {
  if (entityType === 'technician') return profile.nameAr    || profile.name_ar    || ''
  if (entityType === 'company')    return profile.companyName || profile.company_name || ''
  if (entityType === 'supplier')   return profile.businessName || profile.business_name || ''
  return ''
}

function getSpecialty(profile, entityType) {
  if (entityType === 'technician') return profile.categoryAr || ''
  if (entityType === 'company')    return profile.categoryAr || profile.specialty || ''
  return null
}

function getCity(profile, entityType) {
  if (entityType === 'technician') return profile.cityNameAr || profile.city_name_ar || ''
  return profile.city || ''
}

function getWorkImages(profile, entityType) {
  if (entityType === 'technician') return profile.workImages || profile.work_images || []
  if (entityType === 'company')    return profile.workImages || []
  if (entityType === 'supplier')   return profile.shopImages || []
  return []
}

export default function ProProfile() {
  const [, navigate] = useLocation()
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [pendingReq, setPendingReq] = useState(null)

  const [cpOpen, setCpOpen]         = useState(false)
  const [cpCurrent, setCpCurrent]   = useState('')
  const [cpNew, setCpNew]           = useState('')
  const [cpConfirm, setCpConfirm]   = useState('')
  const [cpLoading, setCpLoading]   = useState(false)
  const [cpMsg, setCpMsg]           = useState(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login'); return }
    try {
      const s = JSON.parse(raw)
      setSession(s)
      Promise.all([
        api.pro.getProfile(s.entityType, s.entityId),
        api.pro.getPendingRequest(s.entityType, s.entityId).catch(() => null),
      ]).then(([data, req]) => {
        setProfile(data)
        if (req) setPendingReq(req)
      }).catch(() => setError('تعذّر تحميل الملف الشخصي'))
        .finally(() => setLoading(false))
    } catch {
      localStorage.removeItem('pro_session')
      navigate('/pro-login')
    }
  }, [])

  const handleShare = async () => {
    if (!profile || !session) return
    const url = getPublicUrl(profile, session.entityType)
    const shareUrl = url ? `https://otlobfanni.ly${url}` : 'https://otlobfanni.ly'
    if (navigator.share) {
      try { await navigator.share({ title: getDisplayName(profile, session.entityType), url: shareUrl }) } catch {}
    } else {
      navigator.clipboard?.writeText(shareUrl)
        .then(() => alert('تم نسخ الرابط ✓'))
        .catch(() => alert(shareUrl))
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setCpMsg(null)
    if (cpNew !== cpConfirm) { setCpMsg({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' }); return }
    if (cpNew.length < 4)    { setCpMsg({ type: 'error', text: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' }); return }
    setCpLoading(true)
    try {
      await api.pro.changePassword(session.entityType, session.entityId, cpCurrent, cpNew)
      setCpMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح ✓' })
      setCpCurrent(''); setCpNew(''); setCpConfirm('')
    } catch (err) {
      const msg = err.message || ''
      setCpMsg({ type: 'error', text: msg.includes('401') || msg.includes('الحالية') ? 'كلمة المرور الحالية غير صحيحة' : 'حدث خطأ، حاول مجدداً' })
    } finally { setCpLoading(false) }
  }

  if (!session) return null

  const typeLabel  = TYPE_LABEL[session?.entityType] || 'مهني'
  const photo      = profile ? getProfilePhoto(profile, session.entityType) : null
  const publicUrl  = profile ? getPublicUrl(profile, session.entityType)   : null
  const statusKey  = profile ? getStatusKey(profile, session.entityType)   : 'pending'
  const statusInfo = STATUS_INFO[statusKey] || STATUS_INFO.pending
  const StatusIcon = statusInfo.icon
  const workImages = profile ? getWorkImages(profile, session.entityType)  : []
  const waDigits   = (profile?.whatsapp || profile?.phone || '').replace(/\D/g, '')
  const phone      = profile?.phone || profile?.whatsapp || ''

  const pwFields = [
    { label: 'كلمة المرور الحالية',          val: cpCurrent,  set: setCpCurrent, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
    { label: 'كلمة المرور الجديدة',          val: cpNew,      set: setCpNew,     show: showNew,     toggle: () => setShowNew(v => !v) },
    { label: 'تأكيد كلمة المرور الجديدة',   val: cpConfirm,  set: setCpConfirm, show: showNew,     toggle: () => setShowNew(v => !v) },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col max-w-[480px] mx-auto" dir="rtl">

      <div className="bg-[#071B33] px-5 pt-14 pb-6">
        <button onClick={() => navigate('/pro')} className="flex items-center gap-1.5 text-white/60 text-sm mb-5 active:opacity-70">
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </button>
        <h1 className="text-white font-extrabold text-xl">ملفي الشخصي</h1>
        <p className="text-white/60 text-sm mt-0.5">كيف تظهر في دليل اطلب فني</p>
      </div>

      <div className="flex-1 px-4 pt-5 pb-10 space-y-4">

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 text-red-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-[#071B33] to-[#1a3a5c] px-5 py-5 flex items-center gap-4">
                {photo ? (
                  <img src={getFileUrl(photo)} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border-2 border-white/20" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#FF7900]/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-[#FF7900]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold text-[#FF7900] bg-[#FF7900]/20 px-2 py-0.5 rounded-full mb-1">{typeLabel}</span>
                  <p className="text-white font-extrabold text-base truncate">{getDisplayName(profile, session.entityType)}</p>
                  {getSpecialty(profile, session.entityType) && (
                    <p className="text-white/60 text-xs mt-0.5 truncate">{getSpecialty(profile, session.entityType)}</p>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4 flex-shrink-0" />
                  {statusInfo.label}
                </div>
                {getCity(profile, session.entityType) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
                    {getCity(profile, session.entityType)}
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600" dir="ltr">
                    <Phone className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
                    {phone}
                  </div>
                )}
                {workImages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Image className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
                    {workImages.length} صورة مرفوعة
                  </div>
                )}
              </div>
            </div>

            {/* Pending update request banner */}
            {pendingReq && pendingReq.status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-xs font-bold">طلب تعديل قيد المراجعة</p>
                  <p className="text-amber-700 text-xs mt-0.5">تم استلام طلبك وسيتم تطبيق التعديلات خلال 24 ساعة.</p>
                </div>
              </div>
            )}
            {pendingReq && pendingReq.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex gap-3">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-xs font-bold">طلب التعديل مرفوض</p>
                  {pendingReq.adminNote && <p className="text-red-700 text-xs mt-0.5">{pendingReq.adminNote}</p>}
                  <button onClick={() => navigate('/pro/edit-profile')} className="text-[#FF7900] text-xs font-bold mt-1 underline">
                    تعديل وإعادة الإرسال
                  </button>
                </div>
              </div>
            )}
            {pendingReq && pendingReq.status === 'approved' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-800 text-xs font-bold">تم قبول آخر طلب تعديل وتطبيقه على ملفك</p>
              </div>
            )}

            {/* Action buttons grid */}
            <div className="grid grid-cols-2 gap-3">
              {publicUrl && (
                <a href={publicUrl}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs font-bold text-[#071B33]">عرض ملفي العام</p>
                </a>
              )}

              <button onClick={handleShare}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-xs font-bold text-[#071B33]">مشاركة ملفي</p>
              </button>

              {waDigits && (
                <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer"
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform text-center">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs font-bold text-[#071B33]">واتساب</p>
                </a>
              )}

              <button onClick={() => { setCpOpen(v => !v); setCpMsg(null) }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-[#071B33]">تغيير كلمة المرور</p>
              </button>

              <button onClick={() => navigate('/pro/edit-profile')}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[#FF7900]/10 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-[#FF7900]" />
                </div>
                <p className="text-xs font-bold text-[#071B33]">تعديل ملفي</p>
              </button>
            </div>

            {/* Change password form */}
            {cpOpen && (
              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <p className="font-extrabold text-[#071B33] text-sm">تغيير كلمة المرور</p>
                {pwFields.map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{f.label}</label>
                    <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-[#FF7900] transition-all bg-white">
                      <input
                        type={f.show ? 'text' : 'password'}
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        dir="ltr"
                        className="flex-1 outline-none px-3 py-3 text-sm text-[#071B33] tracking-widest"
                        required
                      />
                      <button type="button" onClick={f.toggle} className="px-3 text-slate-400">
                        {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                {cpMsg && (
                  <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center ${cpMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {cpMsg.text}
                  </div>
                )}
                <button type="submit" disabled={cpLoading}
                  className="w-full py-3 rounded-xl font-extrabold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>
                  {cpLoading ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور'}
                </button>
              </form>
            )}

            {/* Not published note */}
            {!publicUrl && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-amber-800 text-xs font-medium leading-relaxed">
                  ⚠️ ملفك لم يُفعَّل بعد في الدليل. بعد مراجعة طلبك من الإدارة ستظهر تلقائياً.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
