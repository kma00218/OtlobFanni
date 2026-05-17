import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import {
  MapPin, Phone, MessageSquare, Zap, Briefcase,
  Clock, DollarSign, Image as ImageIcon, Building2,
  Facebook, Instagram, CheckCircle, Heart, Star, Send, X,
} from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { categories } from '../data/services'
import ImageLightbox from '../components/ImageLightbox'

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
  const [reviewModal,  setReviewModal]  = useState(true)
  const [form,         setForm]         = useState({ name: '', rating: 0, comment: '' })
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [showComment,  setShowComment]  = useState(false)
  const [rating,       setRating]       = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const { isFav, toggle: toggleFav } = useFavorites('fav_companies')

  useEffect(() => {
    if (!id) { setNotFound(true); return }
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
    <div className="bg-[#EEF4FF] min-h-screen pt-20" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />
      <div className="flex flex-col items-center justify-center py-20 text-center px-6 gap-4">
        <p className="text-gray-700 font-bold text-lg">{ar ? 'الشركة غير موجودة' : 'Company not found'}</p>
        <p className="text-gray-400 text-sm">{ar ? 'ربما تم إيقافها.' : 'This company may have been removed.'}</p>
      </div>
    </div>
  )

  if (!company) return (
    <div className="bg-[#EEF4FF] min-h-screen pt-20" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
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
    <div className="bg-[#EEF4FF] min-h-screen pt-20 pb-28" dir={dir}>
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
        <div className="bg-[#EBF5FF] rounded-2xl border border-blue-300 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0e3460] to-[#1a56db] px-4 pt-4 pb-6 flex items-start justify-end">
            <button
              onClick={() => toggleFav(id)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label={ar ? 'أضف للمفضلة' : 'Add to favorites'}
            >
              <Heart
                className="w-4 h-4 transition-colors"
                fill={isFav(id) ? '#f43f5e' : 'none'}
                stroke={isFav(id) ? '#f43f5e' : 'white'}
              />
            </button>
          </div>
          <div className="px-4 pt-0 pb-4 -mt-5">
            <div className="flex items-end gap-3 mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow flex-shrink-0 bg-[#0e3460] flex items-center justify-center">
                {logo
                  ? <img src={logo} alt={name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox({ images: [logo], index: 0 })} />
                  : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
                      <span className="text-white text-lg font-bold text-center px-1 leading-tight">{firstWord}</span>
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0 mt-10">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
                  <h1 className="font-bold text-gray-900 text-lg leading-tight">{name}</h1>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-black px-3 py-1 rounded-full my-1 tracking-wide shadow-sm">
                  🪪 {ar ? 'رقم التعريف' : 'ID'}: COM-{createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear()}-{String(company.id).replace(/\D/g,'').slice(-6)}
                </span>
                <p className="text-sm text-[#FF7900] font-medium">{catName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{city}{area ? ` · ${area}` : ''}</p>
            </div>

            {/* التقييم */}
            <button onClick={() => setShowReviews(v => !v)} className="flex items-center gap-2 mb-2 active:opacity-70 transition-opacity">
              <Stars rating={rating} count={reviewsCount} />
              {reviewsCount > 0 && (
                <span className="text-xs text-[#FF7900] font-bold underline underline-offset-2">
                  {ar ? 'عرض التقييمات' : 'See reviews'}
                </span>
              )}
            </button>

            <div className="flex flex-wrap gap-2 mt-3">
              {availableNow && (
                <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {ar ? '● متاح الآن' : '● Available Now'}
                </span>
              )}
              {emergency && (
                <span className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {ar ? 'خدمة طوارئ 24/7' : 'Emergency 24/7'}
                </span>
              )}
              {expLabel && (
                <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {expLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* أزرار التواصل */}
        <div className="flex gap-2">
          <a
            href={`https://wa.me/${whatsapp?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {ar ? 'واتساب' : 'WhatsApp'}
          </a>
          <a
            href={`tel:${phone}`}
            className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            {ar ? 'اتصال' : 'Call'}
          </a>
        </div>

        {/* السعر */}
        {priceFrom && (
          <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> {ar ? 'نطاق السعر' : 'Price Range'}
            </p>
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
        )}

        {/* وصف الشركة */}
        {description && (
          <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
              {ar ? 'عن الشركة' : 'About'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 shadow-sm p-4 space-y-2">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-3">
            {ar ? 'معلومات الشركة' : 'Company Info'}
          </p>
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

        {/* أوقات العمل */}
        {(workingDays.length > 0 || hoursFrom) && (
          <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {ar ? 'أوقات العمل' : 'Working Hours'}
            </p>
            {(hoursFrom || hoursTo) && (
              <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl px-3 py-2">
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
        )}

        {/* معرض الأعمال */}
        {workImages.length > 0 && (
          <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {ar ? `معرض الأعمال (${workImages.length})` : `Work Portfolio (${workImages.length})`}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {workImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl border border-gray-100 cursor-zoom-in hover:opacity-90"
                  onClick={() => setLightbox({ images: workImages, index: i })}
                />
              ))}
            </div>
          </div>
        )}

        {/* التواصل الاجتماعي */}
        {(facebook || instagram) && (
          <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 shadow-sm p-4 space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {ar ? 'التواصل الاجتماعي' : 'Social Media'}
            </p>
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
        )}

        {/* ── قسم التقييمات ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FF790018' }}>
                <Star className="w-3.5 h-3.5 text-[#FF7900]" />
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {ar ? `التقييمات (${reviewsCount})` : `Reviews (${reviewsCount})`}
              </p>
            </div>
          </div>

          <div className="px-4 py-3">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-50">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
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
    </div>
  )
}
