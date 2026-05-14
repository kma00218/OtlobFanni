import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import {
  MapPin, Phone, MessageSquare, Zap, Briefcase,
  Clock, DollarSign, Image as ImageIcon, Building2,
  Facebook, Instagram, CheckCircle, XCircle,
} from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { categories } from '../data/services'

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

function InfoRow({ label, value, dir }) {
  if (!value) return null
  return (
    <div className="bg-white/60 rounded-xl p-3 border border-blue-100">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800 text-sm" dir={dir}>{value}</p>
    </div>
  )
}

export default function CompanyDetails() {
  const { lang, dir } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/company/:id')
  const id = params?.id

  const [company,  setCompany]  = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) { setNotFound(true); return }
    api.company(id)
      .then(c => { if (!c) { setNotFound(true); return } setCompany(c) })
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) return (
    <div className="bg-[#EEF4FF] min-h-screen pt-16" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />
      <div className="flex flex-col items-center justify-center py-20 text-center px-6 gap-4">
        <p className="text-gray-700 font-bold text-lg">{ar ? 'الشركة غير موجودة' : 'Company not found'}</p>
        <p className="text-gray-400 text-sm">{ar ? 'ربما تم إيقافها.' : 'This company may have been removed.'}</p>
      </div>
    </div>
  )

  if (!company) return (
    <div className="bg-[#EEF4FF] min-h-screen pt-16" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  const name      = company.company_name || company.companyName || ''
  const logo      = getFileUrl(company.company_logo || company.companyLogo || null)
  const specialty = company.specialty || ''
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

  const initials   = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2) || '?'
  const catName    = ar ? (CAT_LABEL[specialty] || specialty) : (CAT_LABEL_EN[specialty] || specialty)
  const expLabel   = ar ? (EXP_AR[yearsActive] || yearsActive) : (EXP_EN[yearsActive] || yearsActive)

  return (
    <div className="bg-[#EEF4FF] min-h-screen pt-16 pb-28" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل الشركة' : 'Company Details'} />

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <main className="px-4 pt-4 space-y-4">

        {/* بطاقة الشركة الرئيسية */}
        <div className="bg-[#EBF5FF] rounded-2xl border border-blue-300 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0e3460] to-[#1a56db] px-4 pt-4 pb-6" />
          <div className="px-4 pt-0 pb-4 -mt-5">
            <div className="flex items-end gap-3 mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow flex-shrink-0 bg-[#0e3460] flex items-center justify-center">
                {logo
                  ? <img src={logo} alt={name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(logo)} />
                  : <span className="text-white text-2xl font-bold">{initials}</span>
                }
              </div>
              <div className="flex-1 min-w-0 mt-10">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
                  <h1 className="font-bold text-gray-900 text-lg leading-tight">{name}</h1>
                </div>
                <p className="text-sm text-[#FF7900] font-medium">{catName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{city}{area ? ` · ${area}` : ''}</p>
            </div>

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
                  onClick={() => setLightbox(src)}
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
      </main>
    </div>
  )
}
