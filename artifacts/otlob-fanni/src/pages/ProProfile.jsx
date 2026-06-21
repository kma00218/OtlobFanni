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
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" dir="rtl"
      style={{ background: '#F0F2F5' }}>

      {/* ── Top bar ── */}
      <div className="px-4 pt-14 pb-0 sticky top-0 z-10"
        style={{ background: '#fff', borderBottom: '1.5px solid #E8EBF0' }}>
        <div className="flex items-center gap-3 pb-3">
          <button onClick={() => navigate('/pro')}
            className="flex items-center justify-center w-9 h-9 rounded-xl active:scale-95 transition-all flex-shrink-0"
            style={{ background: '#071B33', boxShadow: '0 2px 8px rgba(7,27,51,0.25)' }}>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[#071B33] font-black text-lg leading-tight">ملفي الشخصي</h1>
            <p className="text-slate-400 text-xs font-medium">كيف تظهر في دليل اطلب فني</p>
          </div>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #FF7900, #ffb366, transparent)' }} />
      </div>

      <div className="flex-1 px-4 pt-4 pb-10 space-y-3">

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl px-4 py-4 text-red-700 text-sm font-medium text-center"
            style={{ background: '#FFF0F0', border: '1.5px solid #FECACA' }}>
            {error}
          </div>
        )}

        {!loading && profile && (
          <>
            {/* ── Profile hero card ── */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E2E6EA', boxShadow: '0 4px 20px rgba(7,27,51,0.12)' }}>
              {/* Dark hero */}
              <div className="relative px-5 py-5 flex items-center gap-4 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}>
                {/* Glow blobs */}
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-20"
                  style={{ background: 'radial-gradient(circle, #FF7900 0%, transparent 70%)' }} />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none opacity-10"
                  style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

                {photo ? (
                  <img src={getFileUrl(photo)} alt=""
                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 relative z-10"
                    style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ background: 'rgba(255,121,0,0.2)', border: '1.5px solid rgba(255,121,0,0.35)' }}>
                    <User className="w-8 h-8 text-[#FF7900]" />
                  </div>
                )}

                <div className="flex-1 min-w-0 relative z-10">
                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5"
                    style={{ color: '#FF7900', background: 'rgba(255,121,0,0.2)', border: '1px solid rgba(255,121,0,0.35)' }}>
                    {typeLabel}
                  </span>
                  <p className="text-white font-black text-base truncate leading-tight">
                    {getDisplayName(profile, session.entityType)}
                  </p>
                  {getSpecialty(profile, session.entityType) && (
                    <p className="text-white/55 text-xs mt-0.5 truncate">
                      {getSpecialty(profile, session.entityType)}
                    </p>
                  )}
                </div>
              </div>

              {/* Info strip */}
              <div className="bg-white px-5 py-4 space-y-2.5">
                {/* Status */}
                <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold border ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4 flex-shrink-0" />
                  {statusInfo.label}
                </div>
                {/* City + Phone row */}
                <div className="flex items-center gap-4 flex-wrap">
                  {getCity(profile, session.entityType) && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#FF7900] flex-shrink-0" />
                      {getCity(profile, session.entityType)}
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-[#FF7900] flex-shrink-0" />
                      {phone}
                    </div>
                  )}
                  {workImages.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Image className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {workImages.length} صورة
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Pending request banners ── */}
            {pendingReq && pendingReq.status === 'pending' && (
              <div className="rounded-2xl px-4 py-3 flex gap-3"
                style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-xs font-bold">طلب تعديل قيد المراجعة</p>
                  <p className="text-amber-700 text-xs mt-0.5">تم استلام طلبك وسيتم تطبيق التعديلات خلال 24 ساعة.</p>
                </div>
              </div>
            )}
            {pendingReq && pendingReq.status === 'rejected' && (
              <div className="rounded-2xl px-4 py-3 flex gap-3"
                style={{ background: '#FFF5F5', border: '1.5px solid #FECACA' }}>
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
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
              <div className="rounded-2xl px-4 py-3 flex gap-3"
                style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-800 text-xs font-bold">تم قبول آخر طلب تعديل وتطبيقه على ملفك</p>
              </div>
            )}

            {/* ── Primary CTA — Edit profile ── */}
            <button onClick={() => navigate('/pro/edit-profile')}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-extrabold text-white text-[15px] active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.35)', border: '1.5px solid #FF7900' }}>
              <Pencil className="w-4 h-4" />
              تعديل ملفي
            </button>

            {/* ── Secondary action grid ── */}
            <div className="grid grid-cols-2 gap-3">
              {publicUrl && (
                <a href={publicUrl}
                  className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform text-center bg-white"
                  style={{ border: '1.5px solid #DBEAFE', boxShadow: '0 2px 10px rgba(59,130,246,0.08)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}>
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-[#071B33]">عرض ملفي العام</p>
                </a>
              )}

              <button onClick={handleShare}
                className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform bg-white"
                style={{ border: '1.5px solid #EDE9FE', boxShadow: '0 2px 10px rgba(139,92,246,0.08)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}>
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-[#071B33]">مشاركة ملفي</p>
              </button>

              {waDigits && (
                <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer"
                  className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform text-center bg-white"
                  style={{ border: '1.5px solid #D1FAE5', boxShadow: '0 2px 10px rgba(16,185,129,0.08)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' }}>
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-[#071B33]">واتساب</p>
                </a>
              )}

              <button onClick={() => { setCpOpen(v => !v); setCpMsg(null) }}
                className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform bg-white"
                style={{ border: '1.5px solid #FEF3C7', boxShadow: '0 2px 10px rgba(245,158,11,0.08)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)' }}>
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-[#071B33]">تغيير المرور</p>
              </button>
            </div>

            {/* ── Change password form ── */}
            {cpOpen && (
              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-5 space-y-4"
                style={{ border: '1.5px solid #E2E6EA', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}>
                    <Lock className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="font-extrabold text-[#071B33] text-sm">تغيير كلمة المرور</p>
                </div>
                {pwFields.map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                    <div className="flex rounded-xl overflow-hidden bg-white transition-all"
                      style={{ border: '1.5px solid #E2E6EA' }}
                      onFocus={e => e.currentTarget.style.border = '1.5px solid #FF7900'}
                      onBlur={e => e.currentTarget.style.border = '1.5px solid #E2E6EA'}>
                      <input
                        type={f.show ? 'text' : 'password'}
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        dir="ltr"
                        className="flex-1 outline-none px-3 py-3 text-sm text-[#071B33] tracking-widest bg-transparent"
                        required
                      />
                      <button type="button" onClick={f.toggle} className="px-3 text-slate-400">
                        {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                {cpMsg && (
                  <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center ${cpMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {cpMsg.text}
                  </div>
                )}
                <button type="submit" disabled={cpLoading}
                  className="w-full py-3 rounded-xl font-extrabold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 3px 10px rgba(255,121,0,0.3)' }}>
                  {cpLoading ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور'}
                </button>
              </form>
            )}

            {/* ── Not published note ── */}
            {!publicUrl && (
              <div className="rounded-2xl px-4 py-3" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
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
