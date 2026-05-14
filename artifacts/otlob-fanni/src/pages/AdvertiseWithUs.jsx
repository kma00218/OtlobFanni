import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import { Megaphone, CheckCircle, Monitor, Sparkles, LayoutGrid, Globe } from 'lucide-react'
import api, { uploadFile } from '../lib/api'

const AD_TYPES = [
  {
    value: 'home',
    labelAr: 'بانر رئيسي',
    descAr: 'يظهر في أعلى الصفحة الرئيسية',
    labelEn: 'Home Banner',
    icon: Monitor,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  {
    value: 'vertical',
    labelAr: 'إعلان رأسي',
    descAr: 'إعلان بصورة عمودية طويلة',
    labelEn: 'Vertical Ad',
    icon: LayoutGrid,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-300',
  },
  {
    value: 'featured',
    labelAr: 'إعلان مميز',
    descAr: 'يظهر بشكل بارز داخل القوائم',
    labelEn: 'Featured Ad',
    icon: Sparkles,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
  {
    value: 'banner',
    labelAr: 'بانر عام',
    descAr: 'بانر أفقي في صفحات التخصصات',
    labelEn: 'General Banner',
    icon: Megaphone,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  {
    value: 'sidebar',
    labelAr: 'إعلان جانبي',
    descAr: 'يظهر في الجانب بين النتائج',
    labelEn: 'Sidebar Ad',
    icon: LayoutGrid,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
  },
  {
    value: 'global',
    labelAr: 'كل الصفحات',
    descAr: 'إعلانك يظهر في جميع صفحات التطبيق',
    labelEn: 'All Pages',
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
  },
]

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
    setForm(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

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

          {/* ── 1. بيانات المعلن ── */}
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

          {/* ── 2. نوع الإعلان ── */}
          <div className={`bg-white rounded-2xl border-2 shadow-sm p-5 space-y-3 [border-top:3px_solid_#071B33] ${errors.adType ? 'border-red-300' : 'border-gray-100'}`}>
            <p className="font-bold text-[#071B33] text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#071B33] text-white text-xs flex items-center justify-center font-black">٢</span>
              {ar ? 'نوع الإعلان' : 'Ad Type'}
              <span className="text-red-400 font-black">*</span>
            </p>
            {errors.adType && (
              <p className="text-red-400 text-xs">{ar ? 'يرجى اختيار نوع الإعلان' : 'Please select an ad type'}</p>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              {AD_TYPES.map(type => {
                const Icon = type.icon
                const selected = form.adType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => set('adType', type.value)}
                    className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-start transition-all ${
                      selected
                        ? `${type.bg} ${type.border} shadow-sm`
                        : 'bg-green-50 border-green-100 hover:border-green-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? type.bg : 'bg-white'}`}>
                      <Icon className={`w-4 h-4 ${selected ? type.color : 'text-green-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold leading-tight ${selected ? type.color : 'text-gray-700'}`}>
                        {ar ? type.labelAr : type.labelEn}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{type.descAr}</p>
                    </div>
                    {selected && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${type.bg} ${type.color} border ${type.border}`}>
                        ✓ {ar ? 'محدد' : 'Selected'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── 3. تفاصيل الإعلان ── */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 space-y-4 [border-top:3px_solid_#FF7900]">
            <p className="font-bold text-[#071B33] text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF7900] text-white text-xs flex items-center justify-center font-black">٣</span>
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

            <div>
              <Label>{ar ? 'صورة الإعلان' : 'Ad Image'}</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#FF7900]/10 file:text-[#FF7900] hover:file:bg-[#FF7900]/20 cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img src={imagePreview} alt="preview" className="h-28 w-auto rounded-xl border border-gray-200 object-cover" />
                  {imageUploading ? (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <button type="button"
                      onClick={() => { setImagePreview(null); setImagePath(null) }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                    >×</button>
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
