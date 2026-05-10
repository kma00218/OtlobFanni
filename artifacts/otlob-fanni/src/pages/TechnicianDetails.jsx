import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import { categories } from '../data/services'
import {
  MapPin, Phone, MessageSquare, Star, Zap, Briefcase,
  Clock, DollarSign, Image as ImageIcon, CheckCircle, XCircle,
  Facebook, Instagram,
} from 'lucide-react'

const lsA = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }

const CAT_ID_TO_SLUG = {
  k1: 'electricity', k2: 'plumbing',    k3: 'ac',          k4: 'painting',
  k5: 'carpentry',   k6: 'cleaning',    k7: 'moving',      k8: 'cctv',
  k9: 'networks',    k10: 'maintenance', k11: 'appliances', k12: 'welding',
}

const DAY_AR = {
  Saturday: 'السبت', Sunday: 'الأحد', Monday: 'الاثنين',
  Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة',
}

function findTechnician(id) {
  // ── من طلبات الانضمام المعتمدة ──
  const approved = lsA('technicians')
  const fromApproved = approved.find(t => t.id === id)
  if (fromApproved) {
    const catSlug = fromApproved.category || ''
    const cat = categories.find(c => c.id === catSlug)
    return {
      id:             fromApproved.id,
      name:           fromApproved.name           || '',
      phone:          fromApproved.phone           || '',
      whatsapp:       fromApproved.whatsapp        || fromApproved.phone || '',
      city:           fromApproved.city            || '',
      area:           fromApproved.area            || '',
      categoryId:     catSlug,
      categoryNameAr: cat?.nameAr                 || catSlug,
      categoryNameEn: cat?.nameEn                 || catSlug,
      photoUrl:       fromApproved.profilePhoto    || null,
      workImages:     fromApproved.workImages      || [],
      rating:         fromApproved.rating          || 0,
      reviewsCount:   fromApproved.reviewsCount    || 0,
      priceFrom:      fromApproved.priceFrom       || 0,
      priceTo:        fromApproved.priceTo         || 0,
      experienceYears: fromApproved.experienceYears || 0,
      description:    fromApproved.description     || '',
      certifications: fromApproved.certifications  || '',
      availableNow:   fromApproved.availableNow    || false,
      workingDays:    fromApproved.workingDays     || [],
      hoursFrom:      fromApproved.hoursFrom       || '',
      hoursTo:        fromApproved.hoursTo         || '',
      emergency:      fromApproved.emergency       || false,
      serviceRadius:  fromApproved.serviceRadius   || '',
      facebook:       fromApproved.facebook        || '',
      instagram:      fromApproved.instagram       || '',
      isFeatured:     fromApproved.isFeatured      || false,
    }
  }

  // ── من الفنيين المضافين يدوياً ──
  const cities = lsA('demo_cities_v1')
  const admin = lsA('demo_technicians_v1')
  const fromAdmin = admin.find(t => t.id === id)
  if (fromAdmin) {
    const catSlug = CAT_ID_TO_SLUG[fromAdmin.category_id] || fromAdmin.category_id
    const cat = categories.find(c => c.id === catSlug)
    const city = cities.find(c => c.id === fromAdmin.city_id)
    return {
      id:             fromAdmin.id,
      name:           fromAdmin.name_ar            || fromAdmin.name || '',
      phone:          fromAdmin.phone              || '',
      whatsapp:       fromAdmin.whatsapp           || fromAdmin.phone || '',
      city:           city?.name_ar               || fromAdmin.city_id || '',
      area:           fromAdmin.area              || '',
      categoryId:     catSlug,
      categoryNameAr: cat?.nameAr                 || catSlug,
      categoryNameEn: cat?.nameEn                 || catSlug,
      photoUrl:       fromAdmin.profilePhoto       || fromAdmin.profile_photo || null,
      workImages:     [],
      rating:         fromAdmin.rating            || 0,
      reviewsCount:   fromAdmin.reviewsCount       || 0,
      priceFrom:      fromAdmin.price_from        || 0,
      priceTo:        fromAdmin.price_to          || 0,
      experienceYears: fromAdmin.experience_years  || 0,
      description:    fromAdmin.description_ar    || fromAdmin.description || '',
      certifications: '',
      availableNow:   fromAdmin.status === 'available',
      workingDays:    [],
      hoursFrom:      '',
      hoursTo:        '',
      emergency:      fromAdmin.emergency         || false,
      serviceRadius:  '',
      facebook:       fromAdmin.facebook          || '',
      instagram:      fromAdmin.instagram         || '',
      isFeatured:     fromAdmin.is_featured       || false,
    }
  }

  return null
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

export default function TechnicianDetails() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/technician/:id')
  const id = params?.id

  const [tech, setTech] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) { setNotFound(true); return }
    const found = findTechnician(id)
    if (found) setTech(found)
    else setNotFound(true)
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

  if (!tech) return null

  const catName = ar ? tech.categoryNameAr : tech.categoryNameEn
  const initials = tech.name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'تفاصيل الفني' : 'Technician Details'} />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <main className="px-4 pt-4 space-y-4">

        {/* بطاقة الملف الشخصي */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* غلاف + صورة */}
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

            {/* تقييم */}
            <Stars rating={tech.rating} count={tech.reviewsCount} />

            {/* موقع */}
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                {tech.city}{tech.area ? ` · ${tech.area}` : ''}
              </p>
            </div>

            {/* شارات */}
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

        {/* نطاق السعر */}
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

        {/* وصف الخدمة */}
        {tech.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
              {ar ? 'عن الفني' : 'About'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{tech.description}</p>
          </div>
        )}

        {/* جدول العمل */}
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
                <p className="text-sm text-gray-700" dir="ltr">
                  {tech.hoursFrom} – {tech.hoursTo}
                </p>
              </div>
            )}
          </div>
        )}

        {/* خدمة الطوارئ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF7900]" />
              <p className="text-sm font-medium text-gray-700">{ar ? 'خدمة الطوارئ 24/7' : 'Emergency Service 24/7'}</p>
            </div>
            {tech.emergency
              ? <CheckCircle className="w-5 h-5 text-green-500" />
              : <XCircle className="w-5 h-5 text-gray-300" />}
          </div>
        </div>

        {/* معرض الأعمال */}
        {tech.workImages?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> {ar ? `معرض الأعمال (${tech.workImages.length})` : `Work Gallery (${tech.workImages.length})`}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {tech.workImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => setLightbox(src)}
                />
              ))}
            </div>
          </div>
        )}

        {/* التواصل الاجتماعي */}
        {(tech.facebook || tech.instagram) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
            {tech.facebook && (
              <a
                href={tech.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl py-2.5 text-sm font-medium"
              >
                <Facebook className="w-4 h-4" /> {ar ? 'فيسبوك' : 'Facebook'}
              </a>
            )}
            {tech.instagram && (
              <a
                href={tech.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-pink-50 border border-pink-200 text-pink-600 rounded-xl py-2.5 text-sm font-medium"
              >
                <Instagram className="w-4 h-4" /> {ar ? 'إنستغرام' : 'Instagram'}
              </a>
            )}
          </div>
        )}

      </main>

      {/* شريط الاتصال الثابت */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex gap-3 max-w-[480px] mx-auto"
        dir={ar ? 'rtl' : 'ltr'}
      >
        <a
          href={`https://wa.me/${tech.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          {ar ? 'تواصل واتساب' : 'WhatsApp'}
        </a>
        <a
          href={`tel:${tech.phone}`}
          className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Phone className="w-5 h-5" />
          {ar ? 'اتصال مباشر' : 'Call Now'}
        </a>
      </div>
    </div>
  )
}
