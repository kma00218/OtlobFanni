import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import ServiceImageIcon from '../components/ServiceImageIcon'
import { categories } from '../data/services'
import { useRoute, useLocation } from 'wouter'
import { CheckCircle, User, Phone, MapPin, FileText, Clock, Zap } from 'lucide-react'

const lsA = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }

export default function CategoryTechnicians() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/category/:id')
  const [, navigate] = useLocation()
  const categoryId = params?.id

  const category = categories.find(c => c.id === categoryId)
  const categoryNameAr = category?.nameAr || 'طلب خدمة'
  const categoryNameEn = category?.nameEn || 'Service Request'
  const categoryName   = ar ? categoryNameAr : categoryNameEn

  const [cities, setCities] = useState([])
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', city: '', area: '',
    problemDescription: '', urgency: '', preferredTime: '',
  })
  const [errors, setErrors] = useState({})
  const [saving,    setSaving]    = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [savedId,   setSavedId]   = useState(null)

  useEffect(() => {
    setCities(lsA('demo_cities_v1'))
  }, [])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)

    const customerName        = (fd.get('customerName')        || form.customerName        || '').trim()
    const customerPhone       = (fd.get('customerPhone')       || form.customerPhone       || '').trim()
    const city                = (fd.get('city')                || form.city                || '')
    const area                = (fd.get('area')                || form.area                || '').trim()
    const problemDescription  = (fd.get('problemDescription')  || form.problemDescription  || '').trim()
    const urgency             = (fd.get('urgency')             || form.urgency             || '')
    const preferredTime       = (fd.get('preferredTime')       || form.preferredTime       || '').trim()

    const errs = {}
    if (!customerName)  errs.customerName  = ar ? 'الاسم مطلوب'       : 'Name is required'
    if (!customerPhone) errs.customerPhone = ar ? 'رقم الهاتف مطلوب'  : 'Phone is required'
    if (!city)          errs.city          = ar ? 'اختر مدينتك'       : 'Select your city'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const now = new Date().toISOString()
    const id  = 'sr_' + Date.now()

    const request = {
      id,
      customerName,
      customerPhone,
      city,
      area,
      categoryId:      categoryId || null,
      categoryNameAr,
      categoryNameEn,
      problemDescription,
      urgency,
      preferredTime,
      status:              'new',
      assignedTechnicianId: null,
      createdAt:  now,
      updatedAt:  now,
    }

    try {
      const prev = lsA('serviceRequests')
      localStorage.setItem('serviceRequests', JSON.stringify([request, ...prev]))

      const prevIds = lsA('myRequestIds')
      localStorage.setItem('myRequestIds', JSON.stringify([id, ...prevIds]))
    } catch (_) {}

    setSavedId(id)
    setSaving(false)
    setSubmitted(true)
  }

  const inputCls = (field) =>
    `w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 focus:border-[#FF7900] transition-colors ${errors[field] ? 'border-red-400' : 'border-gray-200'}`

  // ── نجاح ──
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
            <p className="text-sm font-medium text-gray-700">
              {ar ? 'الخدمة: ' : 'Service: '}
              <span className="text-[#FF7900]">{categoryName}</span>
            </p>
            <p className="text-sm font-medium text-gray-700">
              {ar ? 'الحالة: ' : 'Status: '}
              <span className="text-orange-500 font-bold">{ar ? 'جديد — قيد المراجعة' : 'New — Under Review'}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="bg-[#FF7900] text-white font-bold px-8 py-3 rounded-xl text-sm w-full max-w-[280px]"
          >
            {ar ? 'تابع طلباتك' : 'Track Your Orders'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 text-sm hover:text-gray-600 py-1"
          >
            {ar ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </main>
      </div>
    )
  }

  // ── النموذج ──
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

            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF7900]" />
                  {ar ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={set('customerName')}
                placeholder={ar ? 'مثال: محمد الورفلي' : 'e.g. John Doe'}
                className={inputCls('customerName')}
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            {/* الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#FF7900]" />
                  {ar ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={form.customerPhone}
                onChange={set('customerPhone')}
                placeholder="09xxxxxxxx"
                dir="ltr"
                className={inputCls('customerPhone')}
              />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
            </div>

            {/* المدينة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7900]" />
                  {ar ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                name="city"
                value={form.city}
                onChange={set('city')}
                className={inputCls('city')}
              >
                <option value="">{ar ? '— اختر مدينتك —' : '— Select your city —'}</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            {/* المنطقة / الحي */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {ar ? 'المنطقة أو الحي' : 'Area / Neighborhood'}
                </span>
              </label>
              <input
                type="text"
                name="area"
                value={form.area}
                onChange={set('area')}
                placeholder={ar ? 'مثال: حي الأندلس، طريق المطار...' : 'e.g. Al-Andalus, Airport Road...'}
                className={inputCls('area')}
              />
            </div>

            {/* وصف المشكلة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FF7900]" />
                  {ar ? 'وصف المشكلة أو الخدمة المطلوبة' : 'Describe the problem or service needed'}
                </span>
              </label>
              <textarea
                name="problemDescription"
                value={form.problemDescription}
                onChange={set('problemDescription')}
                placeholder={ar ? 'اكتب تفاصيل ما تحتاجه...' : 'Describe what you need...'}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 focus:border-[#FF7900] transition-colors resize-none"
              />
            </div>

            {/* الأولوية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF7900]" />
                  {ar ? 'الأولوية' : 'Urgency'}
                </span>
              </label>
              <select
                name="urgency"
                value={form.urgency}
                onChange={set('urgency')}
                className={inputCls('urgency')}
              >
                <option value="">{ar ? '— اختر الأولوية —' : '— Select urgency —'}</option>
                <option value="normal">{ar ? 'عادي'  : 'Normal'}</option>
                <option value="urgent">{ar ? 'عاجل'  : 'Urgent'}</option>
                <option value="emergency">{ar ? 'طارئ' : 'Emergency'}</option>
              </select>
            </div>

            {/* الوقت المفضل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
                  {ar ? 'الوقت المفضل للزيارة' : 'Preferred Visit Time'}
                </span>
              </label>
              <select
                name="preferredTime"
                value={form.preferredTime}
                onChange={set('preferredTime')}
                className={inputCls('preferredTime')}
              >
                <option value="">{ar ? '— اختر الوقت المفضل —' : '— Select preferred time —'}</option>
                <option value="morning">{ar   ? 'صباحاً (8ص — 12م)'   : 'Morning (8AM — 12PM)'}</option>
                <option value="afternoon">{ar ? 'ظهراً (12م — 4م)'    : 'Afternoon (12PM — 4PM)'}</option>
                <option value="evening">{ar   ? 'مساءً (4م — 8م)'     : 'Evening (4PM — 8PM)'}</option>
                <option value="anytime">{ar   ? 'أي وقت مناسب'        : 'Anytime'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#FF7900] hover:bg-[#e06b00] disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors mt-2"
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
