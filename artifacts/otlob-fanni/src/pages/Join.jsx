import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { categories } from '../data/services'
import { CheckCircle, Upload, X, Plus } from 'lucide-react'

const CITIES = [
  { ar: 'طرابلس',   en: 'Tripoli'   },
  { ar: 'بنغازي',   en: 'Benghazi'  },
  { ar: 'مصراتة',   en: 'Misrata'   },
  { ar: 'الزاوية',  en: 'Zawiya'    },
  { ar: 'سبها',     en: 'Sabha'     },
  { ar: 'زوارة',    en: 'Zuwara'    },
  { ar: 'زليتن',    en: 'Zliten'    },
  { ar: 'الخمس',    en: 'Al Khoms'  },
  { ar: 'سرت',      en: 'Sirte'     },
  { ar: 'طبرق',     en: 'Tobruk'    },
]

const DAYS = {
  ar: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
  en: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
}

const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors'
const sel = inp + ' appearance-none'

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 bg-[#FF7900] rounded-full" />
      <h2 className="font-bold text-[#071B33] text-base">{children}</h2>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-[#FF7900] mr-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function Join() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imagePreviews, setImagePreviews] = useState([])
  const [days, setDays] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
    city: '',
    area: '',
    category: '',
    experience: '',
    type: 'individual',
    description: '',
    price_from: '',
    available_now: 'yes',
    emergency: 'no',
    facebook: '',
    terms: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDay = (d) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const handleImages = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setImagePreviews(p => p.length < 5 ? [...p, ev.target.result] : p)
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (i) => setImagePreviews(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    const request = {
      id: 'jr' + Date.now(),
      full_name: form.full_name,
      phone: form.phone,
      whatsapp: form.whatsapp,
      city: form.city,
      area: form.area,
      specialty: form.category,
      experience: form.experience,
      type: form.type,
      description: form.description,
      price_from: form.price_from,
      available_now: form.available_now === 'yes',
      working_days: days,
      emergency: form.emergency === 'yes',
      facebook: form.facebook,
      work_images: imagePreviews,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    try {
      const prev = JSON.parse(localStorage.getItem('demo_join_requests_v1') || '[]')
      localStorage.setItem('demo_join_requests_v1', JSON.stringify([request, ...prev]))
    } catch (_) {}
    setTimeout(() => { setSaving(false); setSubmitted(true) }, 600)
  }

  if (submitted) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen flex items-center justify-center p-6" dir={ar ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-[#071B33] mb-3">
            {ar ? 'تم الإرسال بنجاح' : 'Request Submitted'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {ar
              ? 'تم إرسال طلبك بنجاح، وسيتم مراجعته من الإدارة.'
              : 'Your request has been submitted successfully and will be reviewed by the admin.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#FF7900] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#e86d00] transition-colors active:scale-95"
          >
            {ar ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'انضم كفني' : 'Join as Technician'} />

      <main className="pt-20 pb-10 px-4 max-w-[480px] mx-auto">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FF7900]/10 rounded-2xl mb-3">
            <span className="text-2xl">🔧</span>
          </div>
          <p className="text-gray-500 text-sm">
            {ar ? 'أكمل النموذج التالي وسيتواصل معك فريقنا' : 'Complete the form below and our team will contact you'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>{ar ? 'المعلومات الشخصية' : 'Personal Information'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'الاسم الكامل' : 'Full Name'} required>
                <input
                  className={inp} required value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder={ar ? 'محمد الورفلي' : 'Mohamed Al-Warfali'}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'رقم الهاتف' : 'Phone'} required>
                  <input
                    className={inp} type="tel" required value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+218910000000" dir="ltr"
                  />
                </Field>
                <Field label={ar ? 'واتساب' : 'WhatsApp'} required>
                  <input
                    className={inp} type="tel" required value={form.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)}
                    placeholder="+218910000000" dir="ltr"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'المدينة' : 'City'} required>
                  <select className={sel} required value={form.city} onChange={e => set('city', e.target.value)}>
                    <option value="">{ar ? 'اختر...' : 'Select...'}</option>
                    {CITIES.map(c => (
                      <option key={c.en} value={ar ? c.ar : c.en}>{ar ? c.ar : c.en}</option>
                    ))}
                  </select>
                </Field>
                <Field label={ar ? 'المنطقة / الحي' : 'Area / District'}>
                  <input
                    className={inp} value={form.area}
                    onChange={e => set('area', e.target.value)}
                    placeholder={ar ? 'حي الأندلس' : 'Andalus district'}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>{ar ? 'المعلومات المهنية' : 'Professional Information'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'تخصص الخدمة' : 'Service Category'} required>
                <select className={sel} required value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">{ar ? 'اختر التخصص...' : 'Select category...'}</option>
                  {categories.filter(c => c.id !== 'more').map(c => (
                    <option key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'سنوات الخبرة' : 'Years of Experience'} required>
                  <select className={sel} required value={form.experience} onChange={e => set('experience', e.target.value)}>
                    <option value="">{ar ? 'اختر...' : 'Select...'}</option>
                    {['أقل من سنة / Less than 1 yr','1-2','3-5','6-10','أكثر من 10 / 10+'].map((v, i) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label={ar ? 'السعر الابتدائي (د.ل)' : 'Starting Price (LYD)'} required>
                  <input
                    className={inp} type="number" min="0" required value={form.price_from}
                    onChange={e => set('price_from', e.target.value)}
                    placeholder="50"
                  />
                </Field>
              </div>

              <Field label={ar ? 'نوع العمل' : 'Work Type'} required>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'individual', ar: 'فردي', en: 'Individual' },
                    { v: 'company',    ar: 'شركة',  en: 'Company'    },
                  ].map(opt => (
                    <button
                      key={opt.v} type="button"
                      onClick={() => set('type', opt.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.type === opt.v ? 'bg-[#FF7900] border-[#FF7900] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF7900]/50'}`}
                    >
                      {ar ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={ar ? 'وصف قصير عن خدمتك' : 'Short Service Description'} required>
                <textarea
                  className={inp + ' min-h-[90px] resize-none'} required value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={ar ? 'اكتب نبذة مختصرة عن خبرتك وخدماتك...' : 'Write a short summary of your experience and services...'}
                />
              </Field>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>{ar ? 'التوفر والجدول' : 'Availability & Schedule'}</SectionTitle>
            <div className="space-y-4">

              <Field label={ar ? 'هل أنت متاح الآن؟' : 'Available Now?'} required>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'yes', ar: 'نعم ✓', en: 'Yes ✓' }, { v: 'no', ar: 'لا', en: 'No' }].map(opt => (
                    <button
                      key={opt.v} type="button"
                      onClick={() => set('available_now', opt.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.available_now === opt.v ? 'bg-[#FF7900] border-[#FF7900] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF7900]/50'}`}
                    >
                      {ar ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={ar ? 'أيام العمل' : 'Working Days'}>
                <div className="flex flex-wrap gap-2">
                  {DAYS[ar ? 'ar' : 'en'].map((day, i) => (
                    <button
                      key={day} type="button"
                      onClick={() => toggleDay(DAYS.en[i])}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${days.includes(DAYS.en[i]) ? 'bg-[#071B33] border-[#071B33] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={ar ? 'خدمة الطوارئ؟' : 'Emergency Service?'} required>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'yes', ar: 'نعم (24/7)', en: 'Yes (24/7)' }, { v: 'no', ar: 'لا', en: 'No' }].map(opt => (
                    <button
                      key={opt.v} type="button"
                      onClick={() => set('emergency', opt.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.emergency === opt.v ? 'bg-[#071B33] border-[#071B33] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {ar ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Extra */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionTitle>{ar ? 'معلومات إضافية' : 'Additional Information'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'صفحة فيسبوك (اختياري)' : 'Facebook Page (optional)'}>
                <input
                  className={inp} type="url" value={form.facebook}
                  onChange={e => set('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage" dir="ltr"
                />
              </Field>

              <Field label={ar ? 'صور من أعمالك (حتى 5 صور)' : 'Work Images (up to 5)'}>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button" onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors">
                      <Plus className="w-5 h-5 text-gray-400 mb-0.5" />
                      <span className="text-gray-400 text-xs">{ar ? 'إضافة' : 'Add'}</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {ar ? 'أضف صوراً توضيحية لأعمالك السابقة (اختياري)' : 'Add sample photos of your previous work (optional)'}
                </p>
              </Field>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox" required checked={form.terms}
                  onChange={e => set('terms', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.terms ? 'bg-[#FF7900] border-[#FF7900]' : 'border-gray-300'}`}
                  onClick={() => set('terms', !form.terms)}
                >
                  {form.terms && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                {ar
                  ? 'أوافق على الشروط والأحكام وسياسة الخصوصية لمنصة اطلب فني'
                  : 'I agree to the Terms & Conditions and Privacy Policy of Otlob Fanni'}
                <span className="text-[#FF7900] mr-0.5 ml-0.5">*</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || !form.terms}
            className="w-full bg-[#FF7900] hover:bg-[#e86d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-colors active:scale-[0.98]"
          >
            {saving
              ? (ar ? 'جاري الإرسال...' : 'Submitting...')
              : (ar ? 'إرسال الطلب' : 'Submit Request')}
          </button>

        </form>
      </main>
    </div>
  )
}
