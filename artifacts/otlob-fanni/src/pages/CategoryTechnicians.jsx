import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import ServiceImageIcon from '../components/ServiceImageIcon'
import { categories } from '../data/services'
import { useRoute } from 'wouter'
import { CheckCircle, User, Phone, MapPin, FileText } from 'lucide-react'

const ls  = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
const lsA = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]')  } catch { return [] }  }

export default function CategoryTechnicians() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/category/:id')
  const categoryId = params?.id

  const category = categories.find(c => c.id === categoryId)
  const categoryName = category ? (ar ? category.nameAr : category.nameEn) : (ar ? 'طلب خدمة' : 'Service Request')

  const [cities, setCities] = useState([])
  const [form, setForm]     = useState({ name: '', phone: '', city: '', description: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const saved = lsA('demo_cities_v1')
    setCities(saved)
    // استعادة الهاتف المحفوظ مسبقاً
    const savedPhone = ls('my_requests_phone')
    if (savedPhone) setForm(f => ({ ...f, phone: savedPhone }))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd       = new FormData(e.target)
    const nameVal  = (fd.get('customer_name')  || form.name        || '').trim()
    const phoneVal = (fd.get('customer_phone') || form.phone       || '').trim()
    const cityVal  = fd.get('city_id')         || form.city        || ''
    const descVal  = (fd.get('description')    || form.description || '').trim()

    const errs = {}
    if (!nameVal)  errs.name  = ar ? 'الاسم مطلوب'        : 'Name is required'
    if (!phoneVal) errs.phone = ar ? 'رقم الهاتف مطلوب'   : 'Phone is required'
    if (!cityVal)  errs.city  = ar ? 'اختر مدينتك'        : 'Select your city'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)

    const city = cities.find(c => c.id === cityVal)
    const request = {
      id:             'sr' + Date.now(),
      customer_name:  nameVal,
      customer_phone: phoneVal,
      description:    descVal,
      technician_id:  null,
      city_id:        cityVal,
      category_id:    categoryId || null,
      city_name:      city?.name_ar || cityVal,
      category_name:  category?.nameAr || categoryName,
      status:         'new',
      created_at:     new Date().toISOString(),
    }

    try {
      const prev = lsA('service_requests')
      localStorage.setItem('service_requests', JSON.stringify([request, ...prev]))
      if (phoneVal) localStorage.setItem('my_requests_phone', phoneVal)
    } catch (_) {}

    setSaving(false)
    setSubmitted(true)
  }

  const inputCls = (field) =>
    `w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 focus:border-[#FF7900] transition-colors ${errors[field] ? 'border-red-400' : 'border-gray-200'}`

  if (submitted) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-20" dir={ar ? 'rtl' : 'ltr'}>
        <BackHeader title={categoryName} />
        <main className="px-4 py-10 flex flex-col items-center text-center gap-5">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {ar ? 'تم إرسال طلبك بنجاح!' : 'Request Sent!'}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              {ar
                ? 'استلمنا طلبك وسيتواصل معك فريقنا قريباً لتأكيد الموعد وإرسال الفني المناسب.'
                : 'We received your request and our team will contact you soon to confirm the appointment.'}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 w-full max-w-[320px] text-right space-y-2">
            <p className="text-xs text-gray-400">{ar ? 'تفاصيل الطلب' : 'Request Details'}</p>
            <p className="text-sm font-medium text-gray-700">{ar ? 'الخدمة: ' : 'Service: '}<span className="text-[#FF7900]">{categoryName}</span></p>
            <p className="text-sm font-medium text-gray-700">{ar ? 'الحالة: ' : 'Status: '}<span className="text-orange-500 font-bold">{ar ? 'جديد — قيد المراجعة' : 'New — Under Review'}</span></p>
          </div>
          <a href="/orders">
            <button className="bg-[#FF7900] text-white font-bold px-8 py-3 rounded-xl text-sm">
              {ar ? 'تابع طلباتك' : 'Track Your Orders'}
            </button>
          </a>
          <a href="/">
            <button className="text-gray-400 text-sm hover:text-gray-600 py-1">
              {ar ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </a>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-20" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={categoryName} />

      <main className="px-4 py-5">

        {/* Category badge */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-3">
            <ServiceImageIcon iconName={category?.iconName || categoryId} size="lg" />
          </div>
          <h1 className="text-lg font-bold text-[#071B33]">{categoryName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {ar ? 'اطلب الخدمة الآن وسنتواصل معك' : 'Request the service and we will contact you'}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF7900]" />
                {ar ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                placeholder={ar ? 'مثال: محمد الورفلي' : 'e.g. John Doe'}
                className={inputCls('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF7900]" />
                {ar ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={form.phone}
                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: '' })) }}
                placeholder="09xxxxxxxx"
                dir="ltr"
                className={inputCls('phone')}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF7900]" />
                {ar ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
              </label>
              <select
                name="city_id"
                value={form.city}
                onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setErrors(er => ({ ...er, city: '' })) }}
                className={inputCls('city')}
              >
                <option value="">{ar ? '— اختر مدينتك —' : '— Select your city —'}</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FF7900]" />
                {ar ? 'وصف المشكلة أو الخدمة المطلوبة' : 'Describe the service needed'}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={ar ? 'اكتب تفاصيل ما تحتاجه...' : 'Write details about what you need...'}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 focus:border-[#FF7900] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#FF7900] hover:bg-[#e06b00] disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors"
            >
              {saving
                ? (ar ? 'جاري الإرسال...' : 'Sending...')
                : (ar ? 'إرسال الطلب' : 'Send Request')}
            </button>

          </form>
        </div>

      </main>
    </div>
  )
}
