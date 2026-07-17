import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import { Megaphone, CheckCircle, Monitor, LayoutGrid, Globe, Layers, Calendar } from 'lucide-react'
import api, { uploadFile } from '../lib/api'
import { sections as SECTIONS } from '../data/services'

const AD_PLACEMENTS = [
  {
    value: 'home_top',
    labelAr: 'أعلى الصفحة الرئيسية',
    descAr: 'يظهر مباشرةً تحت شريط البحث، قبل الأقسام',
    labelEn: 'Home Page — Top',
    icon: Monitor,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  {
    value: 'home_bottom',
    labelAr: 'أسفل الصفحة الرئيسية',
    descAr: 'يظهر بعد زر "كل التخصصات" في الصفحة الرئيسية',
    labelEn: 'Home Page — Bottom',
    icon: Layers,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
  },
  {
    value: 'section_page',
    labelAr: 'صفحة قسم معين',
    descAr: 'يظهر داخل صفحة قسم محدد (خدمات منزلية، سيارات...)',
    labelEn: 'Section Page',
    icon: LayoutGrid,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-300',
  },
  {
    value: 'all_specialties_page',
    labelAr: 'صفحة كل التخصصات',
    descAr: 'يظهر في صفحة عرض جميع التخصصات',
    labelEn: 'All Specialties Page',
    icon: LayoutGrid,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  {
    value: 'global',
    labelAr: 'جميع صفحات المنصة',
    descAr: 'إعلانك يظهر في جميع صفحات التطبيق',
    labelEn: 'All Pages',
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
  },
]

const PRICING = {
  home_top:             { week: 120, month: 350 },
  home_bottom:          { week: 60,  month: 180 },
  section_page:         { week: 50,  month: 150 },
  all_specialties_page: { week: 60,  month: 180 },
  global:               { week: 250, month: 750 },
}

const emptyForm = {
  companyName: '',
  phone: '',
  whatsapp: '',
  email: '',
  adTitle: '',
  adDescription: '',
  websiteOrSocialLink: '',
  city: '',
  notes: '',
  adType: '',
  selectedSection: '',
  duration: '',
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function AdvertiseWithUs() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [form, setForm] = useState(emptyForm)
  const [imagePath, setImagePath] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'adType') next.selectedSection = ''
      return next
    })
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const computedPrice = form.adType && form.duration
    ? (PRICING[form.adType]?.[form.duration] ?? null)
    : null

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    setImageUploading(true)
    try {
      const objectPath = await uploadFile(file)
      setImagePath(objectPath)
    } catch {
      setImagePreview(null)
      setImagePath(null)
    } finally {
      setImageUploading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.companyName.trim()) errs.companyName = true
    if (!form.phone.trim() || form.phone === '+218') errs.phone = true
    if (!form.whatsapp.trim() || form.whatsapp === '+218') errs.whatsapp = true
    if (!form.adTitle.trim()) errs.adTitle = true
    if (!form.adDescription.trim()) errs.adDescription = true
    if (!form.adType) errs.adType = true
    if (form.adType === 'section_page' && !form.selectedSection) errs.selectedSection = true
    if (!form.duration) errs.duration = true
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const endDate = addDays(new Date(), form.duration === 'week' ? 7 : 30)

    setSubmitting(true)
    try {
      await api.submitAdRequest({
        id: 'adr_' + Date.now(),
        company_name: form.companyName,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email || null,
        ad_title: form.adTitle,
        ad_description: form.adDescription,
        website_or_social_link: form.websiteOrSocialLink || null,
        city: form.city || null,
        notes: form.notes || null,
        image_preview: imagePath || null,
        requested_placement: form.adType,
        section_id: form.adType === 'section_page' ? (form.selectedSection || null) : null,
        duration: form.duration,
        price: computedPrice,
        start_date: today,
        end_date: endDate,
        status: 'pending',
      })
      setSubmitted(true)
    } catch (_) {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  const inputCls = (field) =>
    `w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition bg-blue-50 text-gray-900 placeholder-gray-400 ${
      errors[field] ? 'border-red-400' : 'border-blue-100'
    }`

  const Label = ({ children, required }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 mr-1">*</span>}
    </label>
  )

  if (submitted) {
    return (
      <div className="bg-white min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={ar ? 'أعلن معنا' : 'Advertise With Us'} />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center gap-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-lg mb-2">
              {ar ? 'تم إرسال طلبك بنجاح!' : 'Request Submitted!'}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[300px] mx-auto">
              {ar
                ? 'تم إرسال طلب الإعلان بنجاح. سيتم التواصل معك من الإدارة قريبًا.'
                : 'Your advertising request has been submitted successfully. The admin will contact you soon.'}
            </p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setImagePreview(null); setImagePath(null); setSubmitted(false) }}
            className="mt-2 bg-[#FF7900] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            {ar ? 'إرسال طلب جديد' : 'Submit Another Request'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'أعلن معنا' : 'Advertise With Us'} />

      <main className="px-4 pt-4 space-y-4">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#071B33] to-[#1a3a5c] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF7900] rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">
              {ar ? 'أعلن معنا في اطلب فني' : 'Advertise with Otlob Fanni'}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {ar ? 'اوصل لآلاف العملاء يومياً في ليبيا' : 'Reach thousands of customers daily in Libya'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── ١. بيانات المعلن ── */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 space-y-4 [border-top:3px_solid_#FF7900]">
            <p className="font-bold text-[#071B33] text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF7900] text-white text-xs flex items-center justify-center font-black">١</span>
              {ar ? 'بيانات المعلِن' : 'Advertiser Details'}
            </p>

            <div>
              <Label required>{ar ? 'اسم المعلن / الشركة' : 'Advertiser / Company Name'}</Label>
              <input
                className={inputCls('companyName')}
                value={form.companyName}
                onChange={e => set('companyName', e.target.value)}
                placeholder={ar ? 'مثال: مطعم الشروق' : 'e.g. Sunrise Restaurant'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>{ar ? 'رقم الهاتف' : 'Phone'}</Label>
                <LibyaPhoneInput required value={form.phone} onChange={v => set('phone', v)} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{ar ? 'مطلوب' : 'Required'}</p>}
              </div>
              <div>
                <Label required>{ar ? 'واتساب' : 'WhatsApp'}</Label>
                <LibyaPhoneInput required value={form.whatsapp} onChange={v => set('whatsapp', v)} />
                {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{ar ? 'مطلوب' : 'Required'}</p>}
              </div>
            </div>

            <div>
              <Label>{ar ? 'البريد الإلكتروني' : 'Email'}</Label>
              <input
                className={inputCls('email')}
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder={ar ? 'اختياري' : 'Optional'}
                dir="ltr"
                type="email"
              />
            </div>

            <div>
              <Label>{ar ? 'المدينة' : 'City'}</Label>
              <input
                className={inputCls('city')}
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder={ar ? 'اختياري — مثال: طرابلس' : 'Optional — e.g. Tripoli'}
              />
            </div>
          </div>

          {/* ── ٢. موضع الإعلان ── */}
          <div className={`bg-white rounded-2xl border-2 shadow-sm p-5 space-y-3 [border-top:3px_solid_#071B33] ${errors.adType ? 'border-red-300' : 'border-gray-100'}`}>
            <p className="font-bold text-[#071B33] text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#071B33] text-white text-xs flex items-center justify-center font-black">٢</span>
              {ar ? 'موضع الإعلان' : 'Ad Placement'}
              <span className="text-red-400 font-black">*</span>
            </p>
            <p className="text-xs text-gray-400">
              {ar ? 'اختر أين تريد أن يظهر إعلانك في التطبيق' : 'Choose where your ad will appear in the app'}
            </p>
            {errors.adType && (
              <p className="text-red-400 text-xs">{ar ? 'يرجى اختيار موضع الإعلان' : 'Please select an ad placement'}</p>
            )}
            <div className="space-y-2">
              {AD_PLACEMENTS.map(type => {
                const Icon = type.icon
                const selected = form.adType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => set('adType', type.value)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-start transition-all ${
                      selected
                        ? `${type.bg} ${type.border} shadow-sm`
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? type.bg : 'bg-white'} border ${selected ? type.border : 'border-gray-200'}`}>
                      <Icon className={`w-4 h-4 ${selected ? type.color : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-tight ${selected ? type.color : 'text-gray-700'}`}>
                        {ar ? type.labelAr : type.labelEn}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{type.descAr}</p>
                    </div>
                    {selected && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${type.bg} border ${type.border}`}>
                        <span className={`text-[10px] font-black ${type.color}`}>✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* قسم مستهدف — يظهر فقط عند اختيار "صفحة قسم معين" */}
            {form.adType === 'section_page' && (
              <div className="pt-2 border-t border-pink-100 mt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {ar ? 'اختر القسم المستهدف' : 'Select Target Section'}
                  <span className="text-red-400 mr-1">*</span>
                </label>
                {errors.selectedSection && (
                  <p className="text-red-400 text-xs mb-1">{ar ? 'يرجى اختيار القسم' : 'Please select a section'}</p>
                )}
                <select
                  className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition bg-pink-50 text-gray-900 ${
                    errors.selectedSection ? 'border-red-400' : 'border-pink-200'
                  }`}
                  value={form.selectedSection}
                  onChange={e => {
                    setForm(prev => ({ ...prev, selectedSection: e.target.value }))
                    setErrors(prev => ({ ...prev, selectedSection: undefined }))
                  }}
                >
                  <option value="">{ar ? '-- اختر القسم --' : '-- Select Section --'}</option>
                  {SECTIONS.filter(s => s.isActive).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── ٣. مدة الإعلان ── */}
          <div className={`bg-white rounded-2xl border-2 shadow-sm p-5 space-y-3 [border-top:3px_solid_#FF7900] ${errors.duration ? 'border-red-300' : 'border-gray-100'}`}>
            <p className="font-bold text-[#071B33] text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF7900] text-white text-xs flex items-center justify-center font-black">٣</span>
              {ar ? 'مدة الإعلان' : 'Ad Duration'}
              <span className="text-red-400 font-black">*</span>
            </p>
            {errors.duration && (
              <p className="text-red-400 text-xs">{ar ? 'يرجى اختيار مدة الإعلان' : 'Please select a duration'}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* أسبوع */}
              <button
                type="button"
                onClick={() => set('duration', 'week')}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                  form.duration === 'week'
                    ? 'bg-orange-50 border-[#FF7900] shadow-sm'
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                }`}
              >
                <Calendar className={`w-6 h-6 ${form.duration === 'week' ? 'text-[#FF7900]' : 'text-gray-400'}`} />
                <p className={`text-sm font-bold ${form.duration === 'week' ? 'text-[#FF7900]' : 'text-gray-700'}`}>
                  {ar ? 'أسبوع' : 'One Week'}
                </p>
                <p className="text-[11px] text-gray-400">{ar ? '7 أيام' : '7 days'}</p>
                {form.adType && PRICING[form.adType] && (
                  <p className={`text-sm font-black mt-0.5 ${form.duration === 'week' ? 'text-[#FF7900]' : 'text-gray-500'}`}>
                    {PRICING[form.adType].week} {ar ? 'د.ل' : 'LYD'}
                  </p>
                )}
              </button>

              {/* شهر */}
              <button
                type="button"
                onClick={() => set('duration', 'month')}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                  form.duration === 'month'
                    ? 'bg-orange-50 border-[#FF7900] shadow-sm'
                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                }`}
              >
                <Calendar className={`w-6 h-6 ${form.duration === 'month' ? 'text-[#FF7900]' : 'text-gray-400'}`} />
                <p className={`text-sm font-bold ${form.duration === 'month' ? 'text-[#FF7900]' : 'text-gray-700'}`}>
                  {ar ? 'شهر' : 'One Month'}
                </p>
                <p className="text-[11px] text-gray-400">{ar ? '30 يوماً' : '30 days'}</p>
                {form.adType && PRICING[form.adType] && (
                  <p className={`text-sm font-black mt-0.5 ${form.duration === 'month' ? 'text-[#FF7900]' : 'text-gray-500'}`}>
                    {PRICING[form.adType].month} {ar ? 'د.ل' : 'LYD'}
                  </p>
                )}
              </button>
            </div>

            {/* ملخص السعر */}
            {computedPrice !== null && (
              <div className="bg-gradient-to-r from-[#FF7900]/10 to-orange-50 border border-[#FF7900]/30 rounded-xl p-4 flex items-center justify-between mt-1">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {ar ? 'إجمالي التكلفة' : 'Total Cost'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {form.duration === 'week'
                      ? (ar ? 'مدة 7 أيام' : '7-day period')
                      : (ar ? 'مدة 30 يوماً' : '30-day period')}
                  </p>
                </div>
                <div className="text-start">
                  <p className="text-2xl font-black text-[#FF7900]">
                    {computedPrice}
                    <span className="text-base font-bold text-[#FF7900]/80 mr-1"> {ar ? 'د.ل' : 'LYD'}</span>
                  </p>
                </div>
              </div>
            )}

            {/* جدول الأسعار */}
            {!form.adType && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 mb-2">{ar ? 'جدول الأسعار (د.ل)' : 'Price Table (LYD)'}</p>
                {AD_PLACEMENTS.map(p => (
                  <div key={p.value} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{p.labelAr}</span>
                    <span className="text-gray-500 font-mono">
                      {PRICING[p.value].week} / {PRICING[p.value].month}
                      <span className="text-gray-400 mr-1"> {ar ? '(أسبوع/شهر)' : '(wk/mo)'}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ٤. تفاصيل الإعلان ── */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 space-y-4 [border-top:3px_solid_#071B33]">
            <p className="font-bold text-[#071B33] text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#071B33] text-white text-xs flex items-center justify-center font-black">٤</span>
              {ar ? 'تفاصيل الإعلان' : 'Ad Details'}
            </p>

            <div>
              <Label required>{ar ? 'عنوان الإعلان' : 'Ad Title'}</Label>
              <input
                className={inputCls('adTitle')}
                value={form.adTitle}
                onChange={e => set('adTitle', e.target.value)}
                placeholder={ar ? 'عنوان قصير وجذاب' : 'Short catchy title'}
              />
            </div>

            <div>
              <Label required>{ar ? 'وصف قصير للإعلان' : 'Ad Description'}</Label>
              <textarea
                className={inputCls('adDescription') + ' resize-none'}
                rows={3}
                value={form.adDescription}
                onChange={e => set('adDescription', e.target.value)}
                placeholder={ar ? 'وصف مختصر لنشاطك وعروضك...' : 'Brief description of your business and offers...'}
              />
            </div>

            {/* صورة الإعلان */}
            <div>
              <Label>{ar ? 'صورة الإعلان' : 'Ad Image'}</Label>
              <p className="text-[11px] text-gray-400 mb-2">
                {ar ? 'يُفضّل صورة أفقية واضحة (JPG, PNG). الحجم الموصى به: 1200×400 بكسل' : 'Preferred: clear horizontal image (JPG, PNG). Recommended: 1200×400 px'}
              </p>
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-orange-50 hover:border-[#FF7900]/40 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#FF7900]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#FF7900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{ar ? 'اضغط لاختيار صورة' : 'Tap to choose an image'}</p>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              ) : (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="w-full h-36 rounded-xl border border-gray-200 object-cover" />
                  {imageUploading ? (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white text-xs font-medium">{ar ? 'جارٍ الرفع...' : 'Uploading...'}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImagePath(null) }}
                      className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center leading-none shadow-md"
                    >×</button>
                  )}
                  {!imageUploading && (
                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {ar ? 'تم الرفع' : 'Uploaded'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>{ar ? 'رابط الموقع أو السوشيال ميديا' : 'Website or Social Media Link'}</Label>
              <input
                className={inputCls('websiteOrSocialLink')}
                value={form.websiteOrSocialLink}
                onChange={e => set('websiteOrSocialLink', e.target.value)}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div>
              <Label>{ar ? 'ملاحظات إضافية' : 'Additional Notes'}</Label>
              <textarea
                className={inputCls('notes') + ' resize-none'}
                rows={2}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder={ar ? 'أي معلومات أخرى تريد إضافتها...' : 'Any other information...'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || imageUploading}
            className="w-full bg-[#FF7900] disabled:bg-[#FF7900]/50 text-white font-bold py-3.5 rounded-xl text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {imageUploading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{ar ? 'جارٍ رفع الصورة...' : 'Uploading image...'}</>
              : submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{ar ? 'جارٍ الإرسال...' : 'Sending...'}</>
              : (ar ? 'إرسال طلب الإعلان' : 'Submit Ad Request')
            }
          </button>

        </form>
      </main>
    </div>
  )
}
