import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import {
  MapPin, Phone, MessageSquare, Star, Zap, Briefcase,
  Clock, DollarSign, Image as ImageIcon, CheckCircle, XCircle,
  Facebook, Instagram,
} from 'lucide-react'
import api from '../lib/api'

const DAY_AR = {
  Saturday: 'السبت', Sunday: 'الأحد', Monday: 'الاثنين',
  Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة',
}

function Stars({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      {count > 0 && <span className="text-sm text-gray-500">({count})</span>}
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
    city:           city?.name_ar || t.city || '',
    area:           t.area || '',
    categoryId:     t.category_id || t.categoryId || '',
    categoryNameAr: cat?.name_ar || cat?.nameAr || t.category_id || t.categoryId || '',
    categoryNameEn: cat?.name_en || cat?.nameEn || t.category_id || t.categoryId || '',
    photoUrl:       t.profile_photo || t.profilePhoto || null,
    workImages:     t.work_images  || t.workImages || [],
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
  }
}

export default function TechnicianDetails() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/technician/:id')
  const id = params?.id

  const [tech,     setTech]     = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) { setNotFound(true); return }
    Promise.all([
      api.technician(id),
      api.cities(),
      api.categories(),
    ]).then(([t, cities, cats]) => {
      if (!t) { setNotFound(true); return }
      setTech(normalizeTech(t, cities, cats))
    }).catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-16" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />
        <div className="flex flex-col items-center justify-center py-20 text-center px-6 gap-4">
          <p className="text-gray-700 font-bold text-lg">{ar ? 'الفني غير موجود' : 'Technician not found'}</p>
          <p className="text-gray-400 text-sm">{ar ? 'ربما تم إلغاء تفعيله أو حذفه.' : 'This technician may have been removed.'}</p>
        </div>
      </div>
    )
  }

  if (!tech) return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  const catName  = ar ? tech.categoryNameAr : tech.categoryNameEn
  const initials = tech.name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <main className="px-4 pt-4 space-y-4">

        {/* بطاقة الملف الشخصي */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-[#071B33] to-[#1a3a5c] relative">
            {tech.isFeatured && (
              <span className="absolute top-2 left-2 bg-[#FF7900] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5" fill="currentColor" /> {ar ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>
          <div className="px-4 pb-4 -mt-10">
            <div className="flex items-end gap-3 mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow flex-shrink-0 bg-[#071B33] flex items-center justify-center">
                {tech.photoUrl
                  ? <img src={tech.photoUrl} alt={tech.name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(tech.photoUrl)} />
                  : <span className="text-white text-2xl font-bold">{initials}</span>
                }
              </div>
              <div className="flex-1 min-w-0 mt-10">
                <h1 className="font-bold text-gray-900 text-lg leading-tight">{tech.name}</h1>
                <p className="text-sm text-[#FF7900] font-medium">{catName}</p>
              </div>
            </div>
            <Stars rating={tech.rating} count={tech.reviewsCount} />
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{tech.city}{tech.area ? ` · ${tech.area}` : ''}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {tech.availableNow && (
                <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {ar ? '● متاح الآن' : '● Available Now'}
                </span>
              )}
              {tech.emergency && (
                <span className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {ar ? 'خدمة طوارئ' : 'Emergency Service'}
                </span>
              )}
              {tech.experienceYears > 0 && (
                <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {ar ? `${tech.experienceYears} سنوات خبرة` : `${tech.experienceYears} yrs exp`}
                </span>
              )}
            </div>
          </div>
        </div>

        {tech.priceFrom > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> {ar ? 'نطاق السعر' : 'Price Range'}
            </p>
            <div className="flex items-center justify-between bg-[#FF7900]/5 rounded-xl p-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">{ar ? 'يبدأ من' : 'From'}</p>
                <p className="text-xl font-black text-[#FF7900]">{tech.priceFrom}</p>
                <p className="text-xs text-gray-500">{ar ? 'د.ل' : 'LYD'}</p>
              </div>
              <div className="text-gray-300 text-xl">—</div>
              <div className="text-center">
                <p className="text-xs text-gray-400">{ar ? 'حتى' : 'Up to'}</p>
                <p className="text-xl font-black text-[#071B33]">{tech.priceTo || tech.priceFrom}</p>
                <p className="text-xs text-gray-500">{ar ? 'د.ل' : 'LYD'}</p>
              </div>
            </div>
          </div>
        )}

        {tech.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">{ar ? 'عن الفني' : 'About'}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{tech.description}</p>
          </div>
        )}

        {(tech.workingDays?.length > 0 || tech.hoursFrom) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {ar ? 'جدول العمل' : 'Work Schedule'}
            </p>
            {tech.workingDays?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tech.workingDays.map(d => (
                  <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">
                    {ar ? (DAY_AR[d] || d) : d}
                  </span>
                ))}
              </div>
            )}
            {tech.hoursFrom && tech.hoursTo && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm text-gray-700" dir="ltr">{tech.hoursFrom} – {tech.hoursTo}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF7900]" />
              <p className="text-sm font-medium text-gray-700">{ar ? 'خدمة الطوارئ 24/7' : 'Emergency Service 24/7'}</p>
            </div>
            {tech.emergency ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
          </div>
        </div>

        {tech.workImages?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> {ar ? `معرض الأعمال (${tech.workImages.length})` : `Work Gallery (${tech.workImages.length})`}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {tech.workImages.map((src, i) => (
                <img key={i} src={src} alt={`${i + 1}`} className="w-full aspect-square object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity" onClick={() => setLightbox(src)} />
              ))}
            </div>
          </div>
        )}

        {(tech.facebook || tech.instagram) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
            {tech.facebook && (
              <a href={tech.facebook} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl py-2.5 text-sm font-medium">
                <Facebook className="w-4 h-4" /> {ar ? 'فيسبوك' : 'Facebook'}
              </a>
            )}
            {tech.instagram && (
              <a href={tech.instagram} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-pink-50 border border-pink-200 text-pink-600 rounded-xl py-2.5 text-sm font-medium">
                <Instagram className="w-4 h-4" /> {ar ? 'إنستغرام' : 'Instagram'}
              </a>
            )}
          </div>
        )}

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex gap-3 max-w-[480px] mx-auto" dir={ar ? 'rtl' : 'ltr'}>
        <a href={`https://wa.me/${tech.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
          <MessageSquare className="w-5 h-5" />
          {ar ? 'تواصل واتساب' : 'WhatsApp'}
        </a>
        <a href={`tel:${tech.phone}`} className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
          <Phone className="w-5 h-5" />
          {ar ? 'اتصال مباشر' : 'Call Now'}
        </a>
      </div>
    </div>
  )
}
