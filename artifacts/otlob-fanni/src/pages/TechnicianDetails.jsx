import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { technicians, getAdminTechnicians, getApprovedTechnicians } from '../data/services'
import { useRoute } from 'wouter'
import { Star, MapPin, Briefcase, Phone, MessageSquare, Tag, Wrench, X, CheckCircle, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ls = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }

export default function TechnicianDetails() {
  const { t, lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/technician/:id')
  const techId = params?.id

  const [technician, setTechnician] = useState(() =>
    technicians.find(tech => tech.id === techId) || null
  )
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', description: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const approvedTechs = getApprovedTechnicians()
    const adminTechs    = getAdminTechnicians()
    const found =
      approvedTechs.find(t => t.id === techId) ||
      adminTechs.find(t => t.id === techId)    ||
      technicians.find(t => t.id === techId)   ||
      null
    setTechnician(found)
  }, [techId])

  if (!technician) return (
    <div className="bg-background min-h-screen pt-16 flex items-center justify-center">
      <p className="text-muted-foreground">{t('noTechnicians')}</p>
    </div>
  )

  const name        = lang === 'ar' ? technician.nameAr        : technician.nameEn
  const specialty   = lang === 'ar' ? (technician.categoryAr || technician.specialty) : (technician.categoryEn || technician.specialty)
  const city        = lang === 'ar' ? (technician.cityAr || technician.city) : (technician.cityEn || technician.city)
  const status      = lang === 'ar' ? technician.statusAr      : technician.statusEn
  const description = lang === 'ar' ? technician.descriptionAr : technician.descriptionEn
  const initials    = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = ar ? 'الاسم مطلوب' : 'Name is required'
    if (!form.phone.trim()) e.phone = ar ? 'رقم الهاتف مطلوب' : 'Phone is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)

    const request = {
      id:             'sr' + Date.now(),
      customer_name:  form.name.trim(),
      customer_phone: form.phone.trim(),
      description:    form.description.trim(),
      technician_id:  technician.id,
      city_id:        technician.city_id || technician.cityId || null,
      category_id:    technician.category_id || technician.categoryId || null,
      technician_name: technician.nameAr || name,
      city_name:      technician.cityAr || city || '',
      category_name:  technician.categoryAr || specialty || '',
      status:         'new',
      created_at:     new Date().toISOString(),
    }

    try {
      const prev = ls('service_requests')
      localStorage.setItem('service_requests', JSON.stringify([request, ...prev]))
    } catch (_) {}

    setTimeout(() => {
      setSaving(false)
      setSubmitted(true)
    }, 600)
  }

  const closeForm = () => {
    setShowForm(false)
    setSubmitted(false)
    setForm({ name: '', phone: '', description: '' })
    setErrors({})
  }

  return (
    <div className="bg-background min-h-screen pt-16 pb-[100px]">
      <BackHeader title={name} />

      <main className="px-4 py-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center">

          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-100 mb-4 flex-shrink-0">
            {technician.profilePhoto ? (
              <img src={technician.profilePhoto} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-3xl"
                style={{ backgroundColor: technician.avatarColor || '#FF7900' }}
              >
                {initials}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">{name}</h2>

          <div className={`px-3 py-1 rounded-full text-xs font-bold mb-3 ${technician.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status}
          </div>

          <div className="flex items-center gap-1 mb-4">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold text-foreground">{technician.rating}</span>
            <span className="text-sm text-muted-foreground ml-1">({technician.reviews} {t('reviews')})</span>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('experience')}</span>
              <span className="font-bold text-foreground">{technician.experienceYears} {t('years')}</span>
            </div>
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <Tag className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('priceFrom')}</span>
              <span className="font-bold text-foreground">{technician.priceFrom} {t('lyd')}</span>
            </div>
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <MapPin className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('city2')}</span>
              <span className="font-bold text-foreground">{city}</span>
            </div>
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <Wrench className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('specialty2')}</span>
              <span className="font-bold text-foreground text-center line-clamp-1">{specialty}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="text-base font-bold text-foreground mb-2">{t('aboutTech')}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
          </div>
        )}

      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-[80px] left-0 right-0 bg-white border-t z-40 max-w-[480px] mx-auto px-4 pt-3 pb-3 flex flex-col gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="w-full h-12 bg-[#FF7900] hover:bg-[#e06b00] active:bg-[#c95f00] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-base transition-colors"
        >
          <ClipboardList className="h-5 w-5" />
          {ar ? 'أرسل طلب خدمة' : 'Send Service Request'}
        </button>
        <div className="flex gap-2">
          <a href={`https://wa.me/${technician.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1">
            <Button className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl gap-2 text-sm">
              <MessageSquare className="h-4 w-4 fill-current" />
              {t('whatsapp')}
            </Button>
          </a>
          <a href={`tel:${technician.phone}`} className="flex-1">
            <Button className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2 text-sm">
              <Phone className="h-4 w-4 fill-current" />
              {t('call')}
            </Button>
          </a>
        </div>
      </div>

      {/* Service Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) closeForm() }}>
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6 pb-10 animate-slide-up" dir={ar ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">
                {ar ? 'طلب خدمة' : 'Service Request'}
              </h2>
              <button onClick={closeForm} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {submitted ? (
              /* Success state */
              <div className="flex flex-col items-center text-center py-6 gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {ar ? 'تم إرسال طلبك بنجاح!' : 'Request Sent!'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {ar
                    ? 'سيتواصل معك الفني أو فريقنا قريباً لتأكيد الموعد.'
                    : 'The technician or our team will contact you soon to confirm the appointment.'}
                </p>
                <button
                  onClick={closeForm}
                  className="mt-2 w-full h-12 bg-[#FF7900] text-white font-bold rounded-xl"
                >
                  {ar ? 'حسناً' : 'OK'}
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Technician name (read-only) */}
                <div className="bg-orange-50 rounded-xl px-4 py-3 text-sm text-[#FF7900] font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4 flex-shrink-0" />
                  {ar ? `الفني: ${name}` : `Technician: ${name}`}
                </div>

                {/* Customer name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ar ? 'اسمك الكامل' : 'Your Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                    placeholder={ar ? 'مثال: محمد الورفلي' : 'e.g. John Doe'}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ar ? 'رقم هاتفك' : 'Your Phone Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: '' })) }}
                    placeholder="09xxxxxxxx"
                    dir="ltr"
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ar ? 'وصف المشكلة أو الخدمة المطلوبة' : 'Describe the problem or service needed'}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={ar ? 'اكتب تفاصيل ما تحتاجه...' : 'Describe what you need...'}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-13 py-3.5 bg-[#FF7900] hover:bg-[#e06b00] disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors"
                >
                  {saving
                    ? (ar ? 'جاري الإرسال...' : 'Sending...')
                    : (ar ? 'إرسال الطلب' : 'Send Request')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
