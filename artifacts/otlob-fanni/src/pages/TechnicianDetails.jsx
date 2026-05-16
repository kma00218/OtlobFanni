import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import {
  MapPin, Phone, MessageSquare, Star, Zap, Briefcase,
  Clock, DollarSign, Image as ImageIcon, CheckCircle,
  Facebook, Instagram, Wrench, Heart, Send, X,
} from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { track } from '../lib/tracker'

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

const DAY_AR = {
  Saturday: 'السبت', Sunday: 'الأحد', Monday: 'الاثنين',
  Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة',
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

function SectionCard({ icon: Icon, title, children, accent = '#FF7900' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

function normalizeTech(t, cities = [], categories = []) {
  const city = cities.find(c => c.id === (t.city_id || t.cityId))
  const cat  = categories.find(c => c.id === (t.category_id || t.categoryId))
  return {
    id:             t.id,
    name:           t.name_ar || t.nameAr || t.name || '',
    phone:          t.phone || '',
    whatsapp:       t.whatsapp || t.phone || '',
    cityAr:         city?.name_ar || t.city_name_ar || t.city || '',
    cityEn:         city?.name_en || t.city_name_en || city?.name_ar || t.city_name_ar || t.city || '',
    city:           city?.name_ar || t.city_name_ar || t.city || '',
    area:           t.area || '',
    categoryId:     t.category_id || t.categoryId || '',
    categoryNameAr: cat?.name_ar || cat?.nameAr || t.categoryAr || t.category_ar || '',
    categoryNameEn: cat?.name_en || cat?.nameEn || t.categoryEn || t.category_en || cat?.name_ar || cat?.nameAr || t.categoryAr || '',
    photoUrl:       getFileUrl(t.profile_photo || t.profilePhoto || null),
    workImages:     (t.work_images || t.workImages || []).map(getFileUrl),
    rating:         Number(t.rating || 0),
    reviewsCount:   Number(t.reviews_count || t.reviewsCount || 0),
    priceFrom:      Number(t.price_from || t.priceFrom || 0),
    priceTo:        Number(t.price_to   || t.priceTo   || 0),
    experienceYears: Number(t.experience_years || t.experienceYears || 0),
    description:    t.description_ar || t.descriptionAr || t.description || '',
    availableNow:   t.available_now || t.availableNow || t.status === 'available' || false,
    workingDays:    t.working_days  || t.workingDays  || [],
    hoursFrom:      t.hours_from   || t.hoursFrom    || '',
    hoursTo:        t.hours_to     || t.hoursTo      || '',
    emergency:      t.emergency || false,
    serviceRadius:  t.service_radius || t.serviceRadius || '',
    facebook:       t.facebook  || '',
    instagram:      t.instagram || '',
    isFeatured:     t.is_featured || t.isFeatured || false,
    createdAt:      t.created_at  || t.createdAt  || null,
  }
}

const RATING_LABELS_AR = { 1: 'سيء', 2: 'مقبول', 3: 'جيد', 4: 'جيد جداً', 5: 'ممتاز' }
const RATING_LABELS_EN = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

export default function TechnicianDetails() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/technician/:id')
  const id = params?.id

  const [tech,        setTech]        = useState(null)
  const [lightbox,    setLightbox]    = useState(null)
  const [notFound,    setNotFound]    = useState(false)
  const [reviews,     setReviews]     = useState([])
  const [showReviews, setShowReviews] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [form,        setForm]        = useState({ name: '', rating: 0, comment: '' })
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const { isFav, toggle: toggleFav } = useFavorites('fav_technicians')

  useEffect(() => {
    if (!id) { setNotFound(true); return }
    track('profile_view', id)
    Promise.all([
      api.technician(id),
      api.cities(),
      api.categories(),
      api.technicianReviews(id),
    ]).then(([t, cities, cats, revs]) => {
      if (!t) { setNotFound(true); return }
      setTech(normalizeTech(t, cities, cats))
      setReviews(revs || [])
    }).catch(() => setNotFound(true))
  }, [id])

  const handleSubmitReview = async () => {
    if (!form.name.trim() || form.rating === 0) return
    setSubmitting(true)
    try {
      const newReview = await api.submitReview(id, {
        reviewer_name: form.name.trim(),
        rating:        form.rating,
        comment:       form.comment.trim() || null,
      })
      setReviews(prev => [newReview, ...prev])
      setTech(prev => {
        const total = prev.reviewsCount + 1
        const avg   = (prev.rating * prev.reviewsCount + form.rating) / total
        return { ...prev, rating: Math.round(avg * 10) / 10, reviewsCount: total }
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

  if (notFound) {
    return (
      <div className="bg-[#ECEEF2] min-h-screen pt-20" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />
        <div className="flex flex-col items-center justify-center py-20 text-center px-6 gap-4">
          <p className="text-gray-700 font-bold text-lg">{ar ? 'الفني غير موجود' : 'Technician not found'}</p>
          <p className="text-gray-400 text-sm">{ar ? 'ربما تم إلغاء تفعيله أو حذفه.' : 'This technician may have been removed.'}</p>
        </div>
      </div>
    )
  }

  if (!tech) return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  const catName  = ar ? tech.categoryNameAr : tech.categoryNameEn
  const cityName = ar ? tech.cityAr : tech.cityEn
  const initials = tech.name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-0" onClick={() => { setReviewModal(false); setForm({ name: '', rating: 0, comment: '' }) }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl overflow-y-auto" style={{ maxHeight: '90vh', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }} onClick={e => e.stopPropagation()}>
            <div className="p-6">
            {submitted ? (
              <div className="flex flex-col items-center py-6 gap-3 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-800 text-lg">{ar ? 'شكراً على تقييمك!' : 'Thank you for your review!'}</p>
                <p className="text-sm text-gray-400">{ar ? 'تقييمك سيساعد الآخرين في الاختيار' : 'Your review helps others choose'}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-extrabold text-[#071B33] text-lg">{ar ? 'أضف تقييمك' : 'Add Your Review'}</p>
                  <button onClick={() => { setReviewModal(false); setForm({ name: '', rating: 0, comment: '' }) }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="mb-5 text-center">
                  <p className="text-sm text-gray-500 mb-3">{ar ? 'كيف كانت تجربتك مع الفني؟' : 'How was your experience?'}</p>
                  <InteractiveStars value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                  {form.rating > 0 && (
                    <p className="text-sm font-bold text-amber-500 mt-2">
                      {ar ? RATING_LABELS_AR[form.rating] : RATING_LABELS_EN[form.rating]}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    {ar ? 'اسمك *' : 'Your name *'}
                  </label>
                  <input
                    dir={ar ? 'rtl' : 'ltr'}
                    type="text"
                    placeholder={ar ? 'أدخل اسمك' : 'Enter your name'}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] bg-gray-50"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">
                    {ar ? 'تعليقك (اختياري)' : 'Comment (optional)'}
                  </label>
                  <textarea
                    dir={ar ? 'rtl' : 'ltr'}
                    rows={3}
                    placeholder={ar ? 'اكتب تجربتك مع هذا الفني...' : 'Share your experience...'}
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] bg-gray-50 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !form.name.trim() || form.rating === 0}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #FF7900 0%, #cc6200 100%)', color: 'white' }}>
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Send className="w-4 h-4" /> {ar ? 'إرسال التقييم' : 'Submit Review'}</>
                  }
                </button>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      <main className="px-4 pt-4 space-y-3">

        {/* ── Profile Card ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Colored header strip */}
          <div className="h-16 w-full flex items-start justify-between p-2" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}>
            {tech.isFeatured ? (
              <span className="bg-[#FF7900] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-2.5 h-2.5" fill="currentColor" />
                {ar ? 'مميز' : 'Featured'}
              </span>
            ) : <span />}
            <button
              onClick={() => toggleFav(tech.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label={ar ? 'أضف للمفضلة' : 'Add to favorites'}
            >
              <Heart
                className="w-4 h-4 transition-colors"
                fill={isFav(tech.id) ? '#f43f5e' : 'none'}
                stroke={isFav(tech.id) ? '#f43f5e' : 'white'}
              />
            </button>
          </div>

          <div className="px-4 pb-4">
            {/* Avatar overlapping strip */}
            <div className="flex items-end gap-3 -mt-8 mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md flex-shrink-0 bg-[#071B33] flex items-center justify-center">
                {tech.photoUrl
                  ? <img src={tech.photoUrl} alt={tech.name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(tech.photoUrl)} />
                  : <span className="text-white text-2xl font-bold">{initials}</span>
                }
              </div>
              <div className="pb-1 flex-1 min-w-0">
                {tech.availableNow && (
                  <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    {ar ? 'متاح الآن' : 'Available Now'}
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <h1 className="font-extrabold text-[#071B33] text-xl leading-tight mb-1">{tech.name}</h1>
            {/* Reference ID */}
            <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-black px-3 py-1 rounded-full mb-2 tracking-wide shadow-sm">
              🪪 {ar ? 'رقم التعريف' : 'ID'}: TEC-{tech.createdAt ? new Date(tech.createdAt).getFullYear() : new Date().getFullYear()}-{String(tech.id).replace(/\D/g,'').slice(-6)}
            </span>

            {/* Specialty badge */}
            {catName && (
              <span className="inline-flex items-center gap-1.5 bg-[#FF7900]/10 border border-[#FF7900]/20 text-[#FF7900] text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Wrench className="w-3 h-3" />
                {catName}
              </span>
            )}

            {/* Rating — clickable to open reviews */}
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setShowReviews(v => !v)} className="flex items-center gap-2 active:opacity-70 transition-opacity">
                <Stars rating={tech.rating} count={tech.reviewsCount} />
                {tech.reviewsCount > 0 && (
                  <span className="text-xs text-[#FF7900] font-bold underline underline-offset-2">
                    {ar ? 'عرض التقييمات' : 'See reviews'}
                  </span>
                )}
              </button>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{cityName}{tech.area ? ` · ${tech.area}` : ''}</p>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tech.emergency && (
                <span className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {ar ? 'خدمة طوارئ' : 'Emergency'}
                </span>
              )}
              {tech.experienceYears > 0 && (
                <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {ar ? `${tech.experienceYears} سنوات خبرة` : `${tech.experienceYears} yrs exp`}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <a href={`https://wa.me/${tech.whatsapp}`} target="_blank" rel="noreferrer"
                onClick={() => track('whatsapp_click', id)}
                className="flex-1 bg-[#25D366] text-white text-sm font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
                <MessageSquare className="w-4 h-4" />
                {ar ? 'واتساب' : 'WhatsApp'}
              </a>
              <a href={`tel:${tech.phone}`}
                onClick={() => track('phone_click', id)}
                className="flex-1 bg-[#071B33] text-white text-sm font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
                <Phone className="w-4 h-4" />
                {ar ? 'اتصال' : 'Call'}
              </a>
            </div>
          </div>
        </div>

        {/* ── Price Range ───────────────────────────────────── */}
        {tech.priceFrom > 0 && (
          <SectionCard icon={DollarSign} title={ar ? 'نطاق السعر' : 'Price Range'}>
            <div className="flex items-stretch gap-3">
              <div className="flex-1 bg-[#FF7900]/8 rounded-xl p-3 text-center">
                <p className="text-[11px] text-gray-400 mb-0.5">{ar ? 'يبدأ من' : 'Starting from'}</p>
                <p className="text-2xl font-black text-[#FF7900] leading-none">{tech.priceFrom}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ar ? 'د.ل' : 'LYD'}</p>
              </div>
              {tech.priceTo > tech.priceFrom && (
                <>
                  <div className="flex items-center text-gray-200 font-light text-xl">—</div>
                  <div className="flex-1 bg-[#071B33]/5 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-400 mb-0.5">{ar ? 'حتى' : 'Up to'}</p>
                    <p className="text-2xl font-black text-[#071B33] leading-none">{tech.priceTo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ar ? 'د.ل' : 'LYD'}</p>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── About ─────────────────────────────────────────── */}
        {tech.description && (
          <SectionCard icon={Wrench} title={ar ? 'عن الفني' : 'About'} accent="#071B33">
            <p className="text-sm text-gray-700 leading-relaxed">{tech.description}</p>
          </SectionCard>
        )}

        {/* ── Work Schedule ─────────────────────────────────── */}
        {(tech.workingDays?.length > 0 || tech.hoursFrom) && (
          <SectionCard icon={Clock} title={ar ? 'جدول العمل' : 'Work Schedule'} accent="#071B33">
            {tech.workingDays?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tech.workingDays.map(d => (
                  <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                    {ar ? (DAY_AR[d] || d) : d}
                  </span>
                ))}
              </div>
            )}
            {tech.hoursFrom && tech.hoursTo && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700" dir="ltr">{tech.hoursFrom} – {tech.hoursTo}</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Emergency 24/7 ────────────────────────────────── */}
        <div className={`rounded-2xl border shadow-sm px-4 py-3.5 flex items-center justify-between ${tech.emergency ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tech.emergency ? 'bg-red-500' : 'bg-gray-200'}`}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold ${tech.emergency ? 'text-red-700' : 'text-gray-500'}`}>
                {ar ? 'خدمة الطوارئ 24/7' : 'Emergency Service 24/7'}
              </p>
              <p className={`text-xs mt-0.5 ${tech.emergency ? 'text-red-500' : 'text-gray-400'}`}>
                {tech.emergency
                  ? (ar ? 'متوفرة في أي وقت' : 'Available anytime')
                  : (ar ? 'غير متوفرة' : 'Not available')}
              </p>
            </div>
          </div>
          <CheckCircle className={`w-5 h-5 ${tech.emergency ? 'text-red-500' : 'text-gray-200'}`} />
        </div>

        {/* ── Work Gallery ──────────────────────────────────── */}
        {tech.workImages?.length > 0 && (
          <SectionCard icon={ImageIcon} title={ar ? `معرض الأعمال (${tech.workImages.length})` : `Work Gallery (${tech.workImages.length})`} accent="#071B33">
            <div className="grid grid-cols-3 gap-2">
              {tech.workImages.map((src, i) => (
                <img key={i} src={src} alt={`${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl border border-gray-100 cursor-zoom-in hover:opacity-90 transition-opacity shadow-sm"
                  onClick={() => setLightbox(src)} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Social Links ──────────────────────────────────── */}
        {(tech.facebook || tech.instagram) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
            {tech.facebook && (
              <a href={tech.facebook} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl py-3 text-sm font-bold active:scale-[0.98] transition-transform">
                <Facebook className="w-4 h-4" /> {ar ? 'فيسبوك' : 'Facebook'}
              </a>
            )}
            {tech.instagram && (
              <a href={tech.instagram} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-pink-50 border border-pink-200 text-pink-600 rounded-xl py-3 text-sm font-bold active:scale-[0.98] transition-transform">
                <Instagram className="w-4 h-4" /> {ar ? 'إنستغرام' : 'Instagram'}
              </a>
            )}
          </div>
        )}

        {/* ── Reviews Section ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FF790018' }}>
                <Star className="w-3.5 h-3.5 text-[#FF7900]" />
              </div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {ar ? `التقييمات (${tech.reviewsCount})` : `Reviews (${tech.reviewsCount})`}
              </p>
            </div>
          </div>

          <div className="px-4 py-3">
            {tech.reviewsCount === 0 ? (
              <div className="flex flex-col items-center py-5 gap-2 text-center">
                <Star className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">{ar ? 'لا يوجد تقييمات بعد' : 'No reviews yet'}</p>
                <p className="text-xs text-gray-300">{ar ? 'كن أول من يقيّم هذا الفني' : 'Be the first to review'}</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-amber-50 rounded-xl">
                  <div className="text-center flex-shrink-0">
                    <p className="text-3xl font-black text-amber-500">{tech.rating.toFixed(1)}</p>
                    <Stars rating={tech.rating} count={0} size="sm" />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {tech.reviewsCount} {ar ? 'تقييم' : 'reviews'}
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
                          <span className="text-[10px] text-gray-400 w-4">{cnt}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Reviews list */}
                <div className="space-y-3">
                  {(showReviews ? reviews : reviews.slice(0, 3)).map(r => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#071B33] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[11px] font-bold">
                              {(r.reviewer_name || r.reviewerName || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">{r.reviewer_name || r.reviewerName}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-amber-400' : 'text-gray-200'}`} fill={i <= r.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      {(r.comment) && (
                        <p className="text-xs text-gray-600 leading-relaxed mt-1" dir={ar ? 'rtl' : 'ltr'}>{r.comment}</p>
                      )}
                      <p className="text-[10px] text-gray-300 mt-1.5">
                        {new Date(r.created_at || r.createdAt).toLocaleDateString(ar ? 'ar-LY' : 'en-GB')}
                      </p>
                    </div>
                  ))}
                </div>

                {reviews.length > 3 && (
                  <button
                    onClick={() => setShowReviews(v => !v)}
                    className="w-full mt-3 py-2 text-xs font-bold text-[#FF7900] border border-[#FF7900]/30 rounded-xl hover:bg-[#FF7900]/5 transition-colors">
                    {showReviews
                      ? (ar ? 'عرض أقل' : 'Show less')
                      : (ar ? `عرض كل التقييمات (${reviews.length})` : `Show all reviews (${reviews.length})`)}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Prominent rate button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => setReviewModal(true)}
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150 font-bold text-white text-base"
              style={{ background: 'linear-gradient(90deg, #FF7900 0%, #d96400 100%)', boxShadow: '0 4px 18px rgba(255,121,0,0.35)' }}
            >
              <Star className="w-5 h-5" fill="currentColor" />
              {ar ? 'قيّم هذا الفني' : 'Rate this Technician'}
              <Star className="w-5 h-5" fill="currentColor" />
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
