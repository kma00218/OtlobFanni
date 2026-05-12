import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Megaphone, CheckCircle } from 'lucide-react'
import api from '../lib/api'

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
}

export default function AdvertiseWithUs() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errs = {}
    if (!form.companyName.trim()) errs.companyName = true
    if (!form.phone.trim()) errs.phone = true
    if (!form.whatsapp.trim()) errs.whatsapp = true
    if (!form.adTitle.trim()) errs.adTitle = true
    if (!form.adDescription.trim()) errs.adDescription = true
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
        image_preview: imagePreview || null,
        status: 'pending',
      })
      setSubmitted(true)
    } catch (_) {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  const inputCls = (field) =>
    `w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
    }`

  const Label = ({ children, required }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {children}{required && <span className="text-red-400 mr-1">*</span>}
    </label>
  )

  if (submitted) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
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
            onClick={() => { setForm(emptyForm); setImagePreview(null); setImageFile(null); setSubmitted(false) }}
            className="mt-2 bg-[#FF7900] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
          >
            {ar ? 'إرسال طلب جديد' : 'Submit Another Request'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'أعلن معنا' : 'Advertise With Us'} />

      <main className="px-4 pt-4 space-y-4">
        <div className="bg-gradient-to-br from-[#071B33] to-[#1a3a5c] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF7900] rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">
              {ar ? 'أعلن معنا في اطلب فني' : 'Advertise with Otlob Fanni'}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {ar ? 'اوصل لآلاف العملاء يومياً' : 'Reach thousands of customers daily'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

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
              <input
                className={inputCls('phone')}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="09xxxxxxxx"
                dir="ltr"
                type="tel"
              />
            </div>
            <div>
              <Label required>{ar ? 'واتساب' : 'WhatsApp'}</Label>
              <input
                className={inputCls('whatsapp')}
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="09xxxxxxxx"
                dir="ltr"
                type="tel"
              />
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
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                >×</button>
              </div>
            )}
          </div>

          <div>
            <Label>{ar ? 'رابط الإعلان' : 'Ad Link'}</Label>
            <input
              className={inputCls('websiteOrSocialLink')}
              value={form.websiteOrSocialLink}
              onChange={e => set('websiteOrSocialLink', e.target.value)}
              placeholder="https://..."
              dir="ltr"
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#FF7900] disabled:bg-[#FF7900]/50 text-white font-bold py-3.5 rounded-xl text-base mt-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{ar ? 'جارٍ الإرسال...' : 'Sending...'}</>
              : (ar ? 'إرسال طلب الإعلان' : 'Submit Ad Request')
            }
          </button>
        </form>
      </main>
    </div>
  )
}
