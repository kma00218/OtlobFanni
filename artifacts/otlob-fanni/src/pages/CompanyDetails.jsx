import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import { useSeoMeta } from '../hooks/useSeoMeta'
import {
  MapPin, Phone, MessageSquare, Zap, Briefcase, Wrench,
  Clock, DollarSign, Image as ImageIcon, Building2,
  Facebook, Instagram, CheckCircle, Heart, Star, Send, X, Share2, ClipboardList, Sparkles,
} from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { track } from '../lib/tracker'
import { categories } from '../data/services'
import ImageLightbox from '../components/ImageLightbox'
import ShareSheet from '../components/ShareSheet'
import { SkeletonProfileHeader } from '../components/Skeleton'
import ReportModal from '../components/ReportModal'
import RequestFormModal from '../components/RequestFormModal'

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

const CAT_LABEL    = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))
const CAT_LABEL_EN = Object.fromEntries(categories.map(c => [c.id, c.nameEn || c.nameAr]))

const DAY_AR = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
}
const DAY_EN = {
  Saturday:'Saturday', Sunday:'Sunday', Monday:'Monday',
  Tuesday:'Tuesday', Wednesday:'Wednesday', Thursday:'Thursday', Friday:'Friday',
}

const EXP_AR = {
  less1:'أقل من سنة','1-2':'1-2 سنوات','3-5':'3-5 سنوات','6-10':'6-10 سنوات','10+':'أكثر من 10 سنوات',
}
const EXP_EN = {
  less1:'< 1 year','1-2':'1-2 years','3-5':'3-5 years','6-10':'6-10 years','10+':'10+ years',
}

const RATING_LABELS_AR = { 1: 'سيء', 2: 'مقبول', 3: 'جيد', 4: 'جيد جداً', 5: 'ممتاز' }
const RATING_LABELS_EN = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

function InfoRow({ label, value, dir }) {
  if (!value) return null
  return (
    <div className="bg-white/60 rounded-xl p-3 border border-blue-100">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800 text-sm" dir={dir}>{value}</p>
    </div>
  )
}

function Stars({ rating, count, size = 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
        ))}
      </div>
      {count > 0 && <span className="text-sm text-gray-500 font-medium">({count})</span>}
    </div>
  )
}

function InteractiveStars({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)} className="active:scale-90 transition-transform">
          <Star
            className={`w-9 h-9 transition-colors ${i <= value ? 'text-amber-400' : 'text-gray-200'}`}
            fill={i <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

export default function CompanyDetails() {
  const { lang, dir } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/company/:id')
  const id = params?.id

  const [company,      setCompany]      = useState(null)
  const [lightbox,     setLightbox]     = useState(null)
  const [notFound,     setNotFound]     = useState(false)
  const [reviews,      setReviews]      = useState([])
  const [showReviews,  setShowReviews]  = useState(false)
  const [reviewModal,  setReviewModal]  = useState(false)
  const [form,         setForm]         = useState({ name: '', rating: 0, comment: '' })
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [showComment,  setShowComment]  = useState(false)
  const [rating,       setRating]       = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [showShare,   setShowShare]   = useState(false)
  const [showReport,  setShowReport]  = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const { isFav, toggle: toggleFav } = useFavorites('fav_companies')

  const _seoCoName  = company?.company_name || company?.companyName || ''
  const _seoCoCatAr = company ? (CAT_LABEL[company.specialty] || company.specialty || '') : ''
  const _seoCoCatEn = company ? (CAT_LABEL_EN[company.specialty] || company.specialty || '') : ''
  const _seoCoCityAr = company?.city_ar || company?.city || ''
  const _seoCoCityEn = company?.city_en || company?.city || ''
  useSeoMeta({
    title: _seoCoName
      ? (ar
        ? `${_seoCoName}${_seoCoCatAr ? ` - ${_seoCoCatAr}` : ''}${_seoCoCityAr ? ` في ${_seoCoCityAr}` : ''}`
        : `${_seoCoName}${_seoCoCatEn ? ` - ${_seoCoCatEn}` : ''}${_seoCoCityEn ? ` in ${_seoCoCityEn}` : ''}`)
      : null,
    description: _seoCoName
      ? (ar
        ? `تعرّف على ${_seoCoName}${_seoCoCatAr ? `، ${_seoCoCatAr}` : ''}${_seoCoCityAr ? ` في ${_seoCoCityAr}` : ''} — اطلب فني`
        : `Discover ${_seoCoName}${_seoCoCatEn ? `, ${_seoCoCatEn}` : ''}${_seoCoCityEn ? ` in ${_seoCoCityEn}` : ''} on Otlob Fanni`)
      : null,
  })

  useEffect(() => {
    if (!id) { setNotFound(true); return }
    track('company_view', id)
    Promise.all([
      api.company(id),
      api.companyReviews(id),
    ]).then(([c, revs]) => {
      if (!c) { setNotFound(true); return }
      setCompany(c)
      setReviews(revs || [])
      setRating(Number(c.rating || 0))
      setReviewsCount(Number(c.reviews_count || c.reviewsCount || 0))
    }).catch(() => setNotFound(true))
  }, [id])

  const handleSubmitReview = async () => {
    if (!form.name.trim() || form.rating === 0) return
    setSubmitting(true)
    try {
      const newReview = await api.submitCompanyReview(id, {
        reviewer_name: form.name.trim(),
        rating:        form.rating,
        comment:       form.comment.trim() || null,
      })
      setReviews(prev => [newReview, ...prev])
      setReviewsCount(prev => {
        const total = prev + 1
        const avg   = (rating * prev + form.rating) / total
        setRating(Math.round(avg * 10) / 10)
        return total
      })
      setSubmitted(true)
      setTimeout(() => {
        setReviewModal(false)
        setSubmitted(false)
        setForm({ name: '', rating: 0, comment: '' })
        setShowReviews(true)
      }, 1800)
    } catch {
      alert(ar ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (notFound) return (
    <div className="bg-[#F4F6FA] min-h-screen pt-20" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />
      <div className="flex flex-col items-center justify-center py-20 text-center px-6 gap-4">
        <p className="text-gray-700 font-bold text-lg">{ar ? 'الشركة غير موجودة' : 'Company not found'}</p>
        <p className="text-gray-400 text-sm">{ar ? 'ربما تم إيقافها.' : 'This company may have been removed.'}</p>
      </div>
    </div>
  )

  if (!company) return (
    <div className="bg-[#F4F6FA] min-h-screen pt-20" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />
      <div className="px-4 pt-4 space-y-3">
        <SkeletonProfileHeader />
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse h-4 bg-gray-200 rounded-xl w-full" />
          ))}
        </div>
      </div>
    </div>
  )

  const name      = company.company_name || company.companyName || ''
  const logo      = getFileUrl(company.company_logo || company.companyLogo || null)
  const specialty = company.specialty || ''
  const extraIds = company.extra_specialties || company.extraSpecialties || []
  const extraCatNames = extraIds
    .map(id => ar ? (CAT_LABEL[id] || '') : (CAT_LABEL_EN[id] || ''))
    .filter(Boolean)
  const primaryCatName = ar ? (CAT_LABEL[specialty] || specialty) : (CAT_LABEL_EN[specialty] || specialty)
  const allCatNames = primaryCatName
    ? [primaryCatName, ...extraCatNames.filter(n => n !== primaryCatName)]
    : extraCatNames
  const allCategoryIds = specialty
    ? [specialty, ...extraIds.filter(id => id !== specialty)]
    : [...extraIds]
  const city      = company.city || ''
  const area      = company.area || ''
  const phone     = company.phone || ''
  const whatsapp  = company.whatsapp || phone
  const priceFrom = company.price_from || company.priceFrom || ''
  const priceTo   = company.price_to   || company.priceTo   || ''
  const availableNow  = company.available_now  ?? company.availableNow  ?? false
  const emergency     = company.emergency ?? false
  const yearsActive   = company.years_active   || company.yearsActive   || ''
  const workingDays   = company.working_days   || company.workingDays   || []
  const hoursFrom     = company.hours_from     || company.hoursFrom     || ''
  const hoursTo       = company.hours_to       || company.hoursTo       || ''
  const description   = company.description   || ''
  const certifications = company.certifications || ''
  const facebook    = company.facebook    || ''
  const instagram   = company.instagram   || ''
  const workImages  = (company.work_images || company.workImages || []).map(getFileUrl)
  const serviceRadius = company.service_radius || company.serviceRadius || ''
  const address       = company.address || ''
  const createdAt     = company.created_at || company.createdAt || null

  const firstWord  = name ? (name.trim().split(' ')[0] || '?') : '?'
  const catName    = allCatNames.join(' · ')
  const expLabel   = ar ? (EXP_AR[yearsActive] || yearsActive) : (EXP_EN[yearsActive] || yearsActive)

  return (
    <div className="bg-[#F4F6FA] min-h-screen pt-20 pb-28" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <main className="px-4 pt-4 space-y-4">

        {/* بطاقة الشركة الرئيسية */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1px solid #EEF2F8', boxShadow: '0 4px 28px rgba(7,27,51,0.1)' }}>

          {/* Hero */}
          <div className="relative h-36 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e3460 0%, #1a3d6e 55%, #1a56db 100%)' }}>
            <div className="absolute -top-8 -end-8 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FF7900, transparent)' }} />
            <div className="absolute -bottom-8 -start-8 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
            <div className="relative flex items-start justify-between p-3 z-10">
              <span className="inline-flex items-center gap-1 bg-white/15 text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20">
                <Building2 className="w-2.5 h-2.5" /> {ar ? 'شركة خدمات' : 'Service Co.'}
              </span>
              <button
                onClick={() => toggleFav(id)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}
                aria-label={ar ? 'أضف للمفضلة' : 'Add to favorites'}
              >
                <Heart className="w-4 h-4 transition-colors"
                  fill={isFav(id) ? '#f43f5e' : 'none'}
                  stroke={isFav(id) ? '#f43f5e' : 'white'} />
              </button>
            </div>
            {availableNow && (
              <div className="absolute bottom-3 start-4 z-10">
                <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-md"
                  style={{ background: 'rgba(16,185,129,0.88)' }}>
                  <span className="w-2 h-2 bg-white rounded-full" />
                  {ar ? 'متاح الآن' : 'Available Now'}
                </span>
              </div>
            )}
          </div>

          <div className="px-4 pb-5">
            {/* Avatar overlapping hero */}
            <div className="flex items-end gap-3 -mt-12 mb-1">
              <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ border: '4px solid white', boxShadow: '0 4px 20px rgba(7,27,51,0.18)', background: 'linear-gradient(135deg, #0e3460, #1a56db)', position: 'relative', zIndex: 1 }}>
                {logo
                  ? <img src={logo} alt={name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox({ images: [logo], index: 0 })} />
                  : <span className="text-white text-2xl font-black">{firstWord}</span>
                }
              </div>
              <div className="pb-1 flex-1" />
            </div>

            {/* Name + ID */}
            <h1 className="font-black text-[#071B33] text-2xl leading-tight mt-3 mb-2">{name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 text-blue-700 text-[11px] font-black px-3 py-1.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #EBF3FF, #DBEAFE)', border: '2px solid #93C5FD' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[8px] font-black"
                  style={{ background: '#2563EB' }}>ID</span>
                COM-{createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear()}-{String(company.id).replace(/\D/g,'').slice(-6)}
              </span>
              {createdAt && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(26,86,219,0.08)', border: '1px solid rgba(26,86,219,0.22)', color: '#1240a0' }}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {ar ? 'عضو منذ ' : 'Since '}{new Date(createdAt).toLocaleDateString(ar ? 'ar-LY' : 'en-GB', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Specialty icon grid */}
            {allCatNames.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {ar ? 'التخصصات' : 'Specialties'}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {allCatNames.map((name, i) => {
                    const catId = allCategoryIds[i]
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgba(255,121,0,0.12), rgba(255,149,0,0.04))', border: '1.5px solid rgba(255,121,0,0.22)' }}>
                          {catId
                            ? <img src={`/icons/categories/${catId}.png`} alt={name} className="w-full h-full object-cover" onError={e => { e.currentTarget.parentElement.style.background = 'rgba(255,121,0,0.08)' }} />
                            : <div className="w-full h-full flex items-center justify-center"><Wrench className="w-7 h-7 text-[#FF7900]" /></div>
                          }
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AI-extracted keyword tags */}
            {company.aiTags?.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {ar ? 'كلمات مفتاحية' : 'Keywords'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {company.aiTags.map((tag, i) => (
                    <span key={i} className="text-[11px] font-semibold text-violet-700 px-2.5 py-1 rounded-xl"
                      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats mini-cards */}
            <div className="flex gap-2 mb-4">
              {city && (
                <div className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1"
                  style={{ background: '#F8FAFC', border: '1px solid #E4EAF2' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,121,0,0.1)' }}>
                    <MapPin className="w-4 h-4 text-[#FF7900]" />
                  </div>
                  <span className="text-[10px] font-black text-[#071B33] text-center leading-tight truncate w-full px-1">
                    {city}{area ? ` · ${area}` : ''}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{ar ? 'الموقع' : 'Location'}</span>
                </div>
              )}
              {expLabel && (
                <div className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1"
                  style={{ background: '#EEF4FF', border: '1px solid #C7DCFF' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(26,86,219,0.12)' }}>
                    <Briefcase className="w-4 h-4 text-[#FF7900]" />
                  </div>
                  <span className="text-[10px] font-black text-[#FF7900] text-center leading-tight px-1">{expLabel}</span>
                  <span className="text-[9px] text-blue-400 font-semibold">{ar ? 'الخبرة' : 'Experience'}</span>
                </div>
              )}
              {emergency && (
                <div className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1"
                  style={{ background: '#FFF3F3', border: '1px solid #FFD0D0' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <Zap className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-[10px] font-black text-red-600 text-center">24/7</span>
                  <span className="text-[9px] text-red-400 font-semibold">{ar ? 'طوارئ' : 'Emergency'}</span>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setShowReviews(v => !v)} className="flex items-center gap-2 active:opacity-70 transition-opacity">
                <Stars rating={rating} count={reviewsCount} />
                {reviewsCount > 0 && (
                  <span className="text-xs text-[#FF7900] font-bold underline underline-offset-2">
                    {ar ? 'عرض التقييمات' : 'See reviews'}
                  </span>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mb-2">
              <a
                href={`https://wa.me/${whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، وجدت شركتكم على منصة اطلب فني وأرغب في الاستفسار عن خدماتكم.')}`}
                target="_blank" rel="noreferrer"
                className="flex-1 text-white text-sm font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #25D366, #1aad52)', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
                <MessageSquare className="w-4 h-4" />
                {ar ? 'واتساب' : 'WhatsApp'}
              </a>
              <a href={`tel:${phone}`}
                className="flex-1 text-white text-sm font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #071B33, #102848)', boxShadow: '0 4px 16px rgba(7,27,51,0.25)' }}>
                <Phone className="w-4 h-4" />
                {ar ? 'اتصال' : 'Call'}
              </a>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="w-full mt-1 flex items-center justify-center gap-2 text-sm font-black py-3 rounded-2xl active:scale-[0.98] transition-transform"
              style={{ background: '#F0F4F8', color: '#475569', border: '1.5px solid #D8E2EF', boxShadow: '0 2px 8px rgba(71,85,105,0.08)' }}>
              <Send className="w-3.5 h-3.5" />
              {ar ? 'مشاركة الملف الشخصي' : 'Share Profile'}
            </button>
            {/* ── Customer section ── */}
            <div className="flex items-center gap-3 mt-4 mb-2">
              <div className="flex-1 h-px" style={{ background: '#EEF2F8' }} />
              <span className="text-sm font-black text-[#071B33] tracking-wide px-1">
                {ar ? 'كعميل' : 'As a Customer'}
              </span>
              <div className="flex-1 h-px" style={{ background: '#EEF2F8' }} />
            </div>
            <button
              onClick={() => setShowRequest(true)}
              className="w-full rounded-3xl active:translate-y-[3px] transition-all duration-100 select-none"
              style={{
                background: 'linear-gradient(135deg, #FF7900 0%, #FF5500 100%)',
                boxShadow: '0 6px 0 #C44E00, 0 8px 28px rgba(255,121,0,0.45)',
                padding: '0',
              }}>
              <div className="flex items-center gap-4 px-5 py-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)' }}>
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-white text-base leading-tight tracking-tight">
                    {ar ? '🔧 اطلب خدمة الآن' : '🔧 Request Service Now'}
                  </p>
                  <p className="text-[13px] text-white/80 mt-0.5 font-semibold">
                    {ar ? 'أخبر الشركة بما تحتاجه' : 'Tell the company what you need'}
                  </p>
                </div>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <span className="text-white font-black text-sm leading-none">{ar ? '←' : '→'}</span>
                </div>
              </div>
            </button>
            <div className="mt-5 pt-4" style={{ borderTop: '1px dashed #D8E0EA' }}>
              <button
                onClick={() => setShowReport(true)}
                className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium py-2 rounded-xl transition-all hover:text-slate-600"
                style={{ background: 'transparent', border: '1px dashed #C8D3E0' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                {ar ? 'تحديث أو إبلاغ' : 'Update or Report'}
              </button>
            </div>
          </div>
        </div>

        {/* السعر */}
        {priceFrom && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <DollarSign className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? 'نطاق السعر' : 'Price Range'}</p>
            </div>
            <div className="px-5 py-4">
            <div className="flex items-center justify-between bg-[#FF7900]/5 rounded-xl p-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">{ar ? 'يبدأ من' : 'From'}</p>
                <p className="text-xl font-black text-[#FF7900]">{priceFrom}</p>
                <p className="text-xs text-gray-500">{ar ? 'د.ل' : 'LYD'}</p>
              </div>
              {priceTo && <>
                <div className="text-gray-300 text-xl">—</div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">{ar ? 'حتى' : 'Up to'}</p>
                  <p className="text-xl font-black text-[#071B33]">{priceTo}</p>
                  <p className="text-xs text-gray-500">{ar ? 'د.ل' : 'LYD'}</p>
                </div>
              </>}
            </div>
            </div>
          </div>
        )}

        {/* وصف الشركة */}
        {description && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Building2 className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? 'عن الشركة' : 'About'}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
              <Building2 className="w-4 h-4 text-[#FF7900]" />
            </div>
            <p className="font-bold text-white text-sm">{ar ? 'معلومات الشركة' : 'Company Info'}</p>
          </div>
          <div className="px-5 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <InfoRow label={ar ? 'المدينة' : 'City'}        value={city} />
            <InfoRow label={ar ? 'المنطقة' : 'Area'}       value={area} />
            <InfoRow label={ar ? 'التخصص' : 'Specialty'}    value={catName} />
            <InfoRow label={ar ? 'سنوات النشاط' : 'Experience'} value={expLabel} />
            {serviceRadius && <InfoRow label={ar ? 'نطاق الخدمة' : 'Service Radius'} value={`${serviceRadius} ${ar ? 'كم' : 'km'}`} />}
            {company.commercial_reg && <InfoRow label={ar ? 'السجل التجاري' : 'Commercial Reg.'} value={company.commercial_reg || company.commercialReg} />}
          </div>
          {address && (
            <div className="bg-gray-50 rounded-xl p-3 mt-2">
              <p className="text-xs text-gray-400 mb-0.5">{ar ? 'العنوان' : 'Address'}</p>
              <p className="text-sm text-gray-700">{address}</p>
            </div>
          )}
          {certifications && (
            <div className="bg-blue-50 rounded-xl p-3 mt-2">
              <p className="text-xs text-blue-400 mb-0.5">{ar ? 'الشهادات والاعتمادات' : 'Certifications'}</p>
              <p className="text-sm text-blue-800 leading-relaxed">{certifications}</p>
            </div>
          )}
          </div>
        </div>

        {/* أوقات العمل */}
        {(workingDays.length > 0 || hoursFrom) && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Clock className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? 'أوقات العمل' : 'Working Hours'}</p>
            </div>
            <div className="px-5 py-4">
              {(hoursFrom || hoursTo) && (
                <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-xl px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
                  <span className="text-sm text-gray-700 font-medium" dir="ltr">
                    {hoursFrom}{hoursTo ? ` – ${hoursTo}` : ''}
                  </span>
                </div>
              )}
              {workingDays.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {workingDays.map(d => (
                    <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">
                      {ar ? (DAY_AR[d] || d) : (DAY_EN[d] || d)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* معرض الأعمال */}
        {workImages.length > 0 && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <ImageIcon className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? `معرض الأعمال (${workImages.length})` : `Portfolio (${workImages.length})`}</p>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-3 gap-2">
                {workImages.map((src, i) => (
                  <img key={i} src={src} alt={`${i + 1}`}
                    className="w-full aspect-square object-cover rounded-2xl border border-gray-100 cursor-zoom-in hover:opacity-90"
                    onClick={() => setLightbox({ images: workImages, index: i })} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* التواصل الاجتماعي */}
        {(facebook || instagram) && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Share2 className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? 'التواصل الاجتماعي' : 'Social Media'}</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {facebook && (
                <a href={facebook} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5 text-blue-600 hover:bg-blue-100 transition-colors">
                  <Facebook className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate" dir="ltr">{facebook}</span>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-pink-50 rounded-xl px-3 py-2.5 text-pink-600 hover:bg-pink-100 transition-colors">
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate" dir="ltr">{instagram}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── قسم التقييمات ─────────────────────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Star className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">
                {ar ? `التقييمات (${reviewsCount})` : `Reviews (${reviewsCount})`}
              </p>
            </div>
          </div>

          <div className="px-5 py-4">
            {reviewsCount === 0 ? (
              <div className="flex flex-col items-center py-5 gap-2 text-center">
                <Star className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">{ar ? 'لا يوجد تقييمات بعد' : 'No reviews yet'}</p>
                <p className="text-xs text-gray-300">{ar ? 'كن أول من يقيّم هذه الشركة' : 'Be the first to review'}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4 p-3 bg-amber-50 rounded-xl">
                  <div className="text-center flex-shrink-0">
                    <p className="text-3xl font-black text-amber-500">{Number(rating).toFixed(1)}</p>
                    <Stars rating={rating} count={0} size="sm" />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {reviewsCount} {ar ? 'تقييم' : 'reviews'}
                    </p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map(star => {
                      const cnt = reviews.filter(r => r.rating === star).length
                      const pct = reviews.length > 0 ? (cnt / reviews.length) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-500 w-2">{star}</span>
                          <Star className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setShowReviews(v => !v)}
                  className="w-full text-center text-xs text-[#FF7900] font-semibold py-1 mb-2"
                >
                  {showReviews
                    ? (ar ? 'إخفاء التقييمات ▲' : 'Hide reviews ▲')
                    : (ar ? 'عرض كل التقييمات ▼' : 'Show all reviews ▼')}
                </button>

                {showReviews && (
                  <div className="space-y-3 mt-1">
                    {reviews.map(r => (
                      <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-800">{r.reviewer_name || r.reviewerName}</p>
                          <Stars rating={r.rating} count={0} size="sm" />
                        </div>
                        {(r.comment) && (
                          <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                        )}
                        <p className="text-[10px] text-gray-300 mt-1">
                          {new Date(r.created_at || r.createdAt).toLocaleDateString(ar ? 'ar-LY' : 'en-GB')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── نموذج إضافة تقييم ─────────────────────────────────────────── */}
        {reviewModal && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                  <Star className="w-4 h-4 text-[#FF7900]" />
                </div>
                <p className="font-bold text-white text-sm">
                  {ar ? 'أضف تقييمك' : 'Add Your Review'}
                </p>
              </div>
              <button onClick={() => setReviewModal(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-4">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    {ar ? 'شكراً على تقييمك!' : 'Thank you for your review!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2 text-center">
                      {ar ? 'كيف تقيّم هذه الشركة؟' : 'How would you rate this company?'}
                    </p>
                    <InteractiveStars value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                    {form.rating > 0 && (
                      <p className="text-center text-xs text-amber-500 font-semibold mt-1">
                        {ar ? RATING_LABELS_AR[form.rating] : RATING_LABELS_EN[form.rating]}
                      </p>
                    )}
                  </div>

                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={ar ? 'اسمك *' : 'Your name *'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] text-right"
                    dir={ar ? 'rtl' : 'ltr'}
                  />

                  {!showComment ? (
                    <button
                      type="button"
                      onClick={() => setShowComment(true)}
                      className="text-xs text-gray-400 underline underline-offset-2 w-full text-center"
                    >
                      {ar ? '+ أضف تعليقاً (اختياري)' : '+ Add a comment (optional)'}
                    </button>
                  ) : (
                    <textarea
                      value={form.comment}
                      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder={ar ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] resize-none text-right"
                      dir={ar ? 'rtl' : 'ltr'}
                    />
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || !form.name.trim() || form.rating === 0}
                    className="w-full bg-[#FF7900] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                    {ar ? 'إرسال التقييم' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!reviewModal && (
          <button
            onClick={() => { setReviewModal(true); setForm({ name: '', rating: 0, comment: '' }); setShowComment(false) }}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-[#FF7900] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            <Star className="w-4 h-4" />
            {ar ? 'أضف تقييمك' : 'Add Your Review'}
          </button>
        )}

      </main>

      {showShare && (
        <ShareSheet
          name={name}
          city={ar ? company.city_ar || company.city || '' : company.city_en || company.city || ''}
          profileUrl={window.location.href}
          onClose={() => setShowShare(false)}
        />
      )}
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        entityType="company"
        entityId={String(id)}
        entityName={name}
        city={city}
        ar={ar}
      />
      <RequestFormModal
        open={showRequest}
        onClose={() => setShowRequest(false)}
        ownerType="company"
        ownerId={String(id)}
        ownerName={name}
        ownerWhatsapp={company?.whatsapp || company?.phone || ''}
        profileUrl={window.location.href}
        ar={ar}
      />
    </div>
  )
}
