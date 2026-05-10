import { useState, useRef } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { categories } from '../data/services'
import { CheckCircle, Camera, X, Plus, Upload, Lock, User, Briefcase, Clock, FileText, Image } from 'lucide-react'
import api from '../lib/api'

const CITIES = [
  { ar: 'طرابلس', en: 'Tripoli' }, { ar: 'بنغازي', en: 'Benghazi' },
  { ar: 'مصراتة', en: 'Misrata' }, { ar: 'الزاوية', en: 'Zawiya' },
  { ar: 'سبها',   en: 'Sabha'   }, { ar: 'زوارة',  en: 'Zuwara'  },
  { ar: 'زليتن', en: 'Zliten'   }, { ar: 'الخمس', en: 'Al Khoms' },
  { ar: 'سرت',   en: 'Sirte'    }, { ar: 'طبرق',  en: 'Tobruk'   },
]

const DAYS = {
  ar: ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'],
  en: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0')
  return `${h}:00`
})

const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors'
const sel = inp + ' appearance-none'

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#FF7900]" />
      </div>
      <h2 className="font-bold text-[#071B33] text-base">{children}</h2>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-[#FF7900] mr-0.5 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function DocUpload({ label, hint, value, onChange, ar }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button" onClick={() => onChange(null)}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-green-500/90 text-white text-xs text-center py-1 font-medium">
            {ar ? '✓ تم الرفع' : '✓ Uploaded'}
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors">
          <Upload className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500 text-center px-2">{ar ? 'انقر للرفع' : 'Click to upload'}</span>
          <input type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = ev => onChange(ev.target.result)
              reader.readAsDataURL(file)
            }}
          />
        </label>
      )}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export default function Join() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const photoInputRef = useRef(null)

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [workImages, setWorkImages] = useState([])
  const [idDocFront, setIdDocFront] = useState(null)
  const [idDocBack, setIdDocBack] = useState(null)
  const [workLicense, setWorkLicense] = useState(null)
  const [days, setDays] = useState([])

  const [form, setForm] = useState({
    full_name: '', phone: '', whatsapp: '', national_id: '',
    city: '', area: '', address: '',
    category: '', experience: '', type: 'individual',
    description: '', certifications: '',
    price_from: '', price_to: '',
    available_now: 'yes', emergency: 'no',
    hours_from: '08:00', hours_to: '18:00',
    service_radius: '',
    facebook: '', instagram: '',
    terms: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDay = (d) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const handleProfilePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setProfilePhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleWorkImages = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setWorkImages(p => p.length < 6 ? [...p, ev.target.result] : p)
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.submitTechnicianApplication({
        id:              'jr' + Date.now(),
        full_name:       form.full_name,
        phone:           form.phone,
        whatsapp:        form.whatsapp,
        national_id:     form.national_id,
        city:            form.city,
        area:            form.area,
        address:         form.address,
        specialty:       form.category,
        experience:      form.experience,
        type:            form.type,
        description:     form.description,
        certifications:  form.certifications,
        price_from:      form.price_from,
        price_to:        form.price_to,
        available_now:   form.available_now === 'yes',
        working_days:    days,
        hours_from:      form.hours_from,
        hours_to:        form.hours_to,
        emergency:       form.emergency === 'yes',
        service_radius:  form.service_radius,
        facebook:        form.facebook,
        instagram:       form.instagram,
        profile_photo:   profilePhoto,
        work_images:     workImages,
        id_doc_front:    idDocFront,
        id_doc_back:     idDocBack,
        work_license:    workLicense,
      })
      setSubmitted(true)
    } catch (err) {
      alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen flex items-center justify-center p-6" dir={ar ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-[#071B33] mb-3">
            {ar ? 'تم الإرسال بنجاح!' : 'Request Submitted!'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {ar
              ? 'تم إرسال طلبك بنجاح. سيتم مراجعة بياناتك من الإدارة، وبعد الموافقة سيظهر ملفك في التطبيق.'
              : 'Your application has been submitted successfully. The admin will review it, and after approval your profile will appear in the app.'}
          </p>
          <button onClick={() => window.history.back()}
            className="w-full bg-[#FF7900] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#e86d00] transition-colors active:scale-95">
            {ar ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    )
  }

  const initials = form.full_name.trim().split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <div className="bg-[#F7F8FA] min-h-screen" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'انضم كفني' : 'Join as Technician'} />

      <main className="pt-20 pb-12 px-4 max-w-[480px] mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold text-[#071B33] mb-1">{ar ? 'نموذج تسجيل الفنيين' : 'Technician Registration Form'}</h1>
          <p className="text-gray-500 text-sm">{ar ? 'أكمل جميع البيانات المطلوبة للانضمام إلى المنصة' : 'Complete all required fields to join the platform'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── 1. Profile Photo ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={Camera}>{ar ? 'الصورة الشخصية' : 'Profile Photo'}</SectionTitle>
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-28 h-28 rounded-full border-4 border-[#FF7900]/20 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-100"
                onClick={() => photoInputRef.current?.click()}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-full bg-[#071B33] flex items-center justify-center text-white font-bold text-xl">
                      {initials}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
              <div className="text-center">
                <button type="button" onClick={() => photoInputRef.current?.click()}
                  className="text-sm font-medium text-[#FF7900] hover:underline">
                  {profilePhoto ? (ar ? 'تغيير الصورة' : 'Change Photo') : (ar ? 'رفع صورة شخصية' : 'Upload Profile Photo')}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ar ? 'ستظهر هذه الصورة في ملفك على التطبيق' : 'This photo will appear on your profile in the app'}
                </p>
                {profilePhoto && (
                  <button type="button" onClick={() => setProfilePhoto(null)}
                    className="text-xs text-red-400 hover:underline mt-1 block">
                    {ar ? 'إزالة الصورة' : 'Remove photo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── 2. Personal Information ───────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={User}>{ar ? 'المعلومات الشخصية' : 'Personal Information'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'الاسم الكامل' : 'Full Name'} required>
                <input className={inp} required value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder={ar ? 'محمد الورفلي' : 'Mohamed Al-Warfali'} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'رقم الهاتف' : 'Phone'} required>
                  <input className={inp} type="tel" required value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+218910000000" dir="ltr" />
                </Field>
                <Field label={ar ? 'واتساب' : 'WhatsApp'} required>
                  <input className={inp} type="tel" required value={form.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)}
                    placeholder="+218910000000" dir="ltr" />
                </Field>
              </div>

              <Field label={ar ? 'الرقم الوطني / رقم الهوية' : 'National ID Number'}
                hint={ar ? 'سيُستخدم للتحقق من الهوية داخلياً' : 'Used for internal identity verification'}>
                <input className={inp} value={form.national_id}
                  onChange={e => set('national_id', e.target.value)}
                  placeholder={ar ? '1-2345-678901-2' : '1-2345-678901-2'} dir="ltr" />
              </Field>

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
                  <input className={inp} value={form.area}
                    onChange={e => set('area', e.target.value)}
                    placeholder={ar ? 'حي الأندلس' : 'Andalus district'} />
                </Field>
              </div>

              <Field label={ar ? 'العنوان التفصيلي' : 'Detailed Address'}>
                <input className={inp} value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder={ar ? 'الشارع، البناية، رقم المنزل...' : 'Street, building, house number...'} />
              </Field>
            </div>
          </div>

          {/* ── 3. Professional Information ───────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={Briefcase}>{ar ? 'المعلومات المهنية' : 'Professional Information'}</SectionTitle>
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
                <Field label={ar ? 'سنوات الخبرة' : 'Experience'} required>
                  <select className={sel} required value={form.experience} onChange={e => set('experience', e.target.value)}>
                    <option value="">{ar ? 'اختر...' : 'Select...'}</option>
                    {[
                      { v: 'less1',  ar: 'أقل من سنة',    en: 'Less than 1 yr' },
                      { v: '1-2',    ar: '1-2 سنوات',     en: '1-2 years'      },
                      { v: '3-5',    ar: '3-5 سنوات',     en: '3-5 years'      },
                      { v: '6-10',   ar: '6-10 سنوات',    en: '6-10 years'     },
                      { v: '10+',    ar: 'أكثر من 10',    en: 'More than 10'   },
                    ].map(o => <option key={o.v} value={o.v}>{ar ? o.ar : o.en}</option>)}
                  </select>
                </Field>
                <Field label={ar ? 'نوع العمل' : 'Work Type'} required>
                  <select className={sel} value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="individual">{ar ? 'فردي' : 'Individual'}</option>
                    <option value="company">{ar ? 'شركة / مؤسسة' : 'Company / Business'}</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'السعر الأدنى (د.ل)' : 'Min Price (LYD)'} required>
                  <input className={inp} type="number" min="0" required value={form.price_from}
                    onChange={e => set('price_from', e.target.value)} placeholder="50" />
                </Field>
                <Field label={ar ? 'السعر الأقصى (د.ل)' : 'Max Price (LYD)'}>
                  <input className={inp} type="number" min="0" value={form.price_to}
                    onChange={e => set('price_to', e.target.value)} placeholder="500" />
                </Field>
              </div>

              <Field label={ar ? 'وصف قصير عن خدمتك' : 'Service Description'} required>
                <textarea
                  className={inp + ' min-h-[90px] resize-none'} required value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={ar ? 'اكتب نبذة مختصرة عن خبرتك وخدماتك...' : 'Briefly describe your experience and services...'} />
              </Field>

              <Field label={ar ? 'الشهادات والمؤهلات' : 'Certifications & Qualifications'}
                hint={ar ? 'اذكر أي شهادات مهنية أو تدريبات متخصصة' : 'Mention any professional certificates or specialized training'}>
                <textarea
                  className={inp + ' min-h-[70px] resize-none'} value={form.certifications}
                  onChange={e => set('certifications', e.target.value)}
                  placeholder={ar ? 'مثال: شهادة كهرباء معتمدة، دورة صيانة...' : 'e.g., Certified electrician, maintenance course...'} />
              </Field>
            </div>
          </div>

          {/* ── 4. Availability & Schedule ────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={Clock}>{ar ? 'التوفر والجدول الزمني' : 'Availability & Schedule'}</SectionTitle>
            <div className="space-y-4">

              <Field label={ar ? 'هل أنت متاح الآن؟' : 'Available Now?'} required>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'yes', ar: 'نعم ✓', en: 'Yes ✓' }, { v: 'no', ar: 'لا', en: 'No' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => set('available_now', opt.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.available_now === opt.v ? 'bg-[#FF7900] border-[#FF7900] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF7900]/50'}`}>
                      {ar ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={ar ? 'أيام العمل' : 'Working Days'}>
                <div className="flex flex-wrap gap-2">
                  {DAYS[ar ? 'ar' : 'en'].map((day, i) => (
                    <button key={day} type="button" onClick={() => toggleDay(DAYS.en[i])}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${days.includes(DAYS.en[i]) ? 'bg-[#071B33] border-[#071B33] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {day}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'وقت بداية العمل' : 'Work Start Time'}>
                  <select className={sel} value={form.hours_from} onChange={e => set('hours_from', e.target.value)}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </Field>
                <Field label={ar ? 'وقت انتهاء العمل' : 'Work End Time'}>
                  <select className={sel} value={form.hours_to} onChange={e => set('hours_to', e.target.value)}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </Field>
              </div>

              <Field label={ar ? 'خدمة الطوارئ؟ (24/7)' : 'Emergency Service? (24/7)'}>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'yes', ar: 'نعم ✓', en: 'Yes ✓' }, { v: 'no', ar: 'لا', en: 'No' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => set('emergency', opt.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.emergency === opt.v ? 'bg-[#071B33] border-[#071B33] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {ar ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={ar ? 'نطاق الخدمة (بالكيلومتر)' : 'Service Radius (km)'}
                hint={ar ? 'أقصى مسافة تنتقل إليها للعمل' : 'Maximum distance you travel for work'}>
                <input className={inp} type="number" min="0" max="500" value={form.service_radius}
                  onChange={e => set('service_radius', e.target.value)} placeholder={ar ? 'مثال: 30' : 'e.g. 30'} />
              </Field>
            </div>
          </div>

          {/* ── 5. Documents (Internal Admin Use) ────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={Lock}>{ar ? 'الوثائق الرسمية (للاستخدام الداخلي فقط)' : 'Official Documents (Internal Use Only)'}</SectionTitle>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                {ar
                  ? 'هذه الوثائق سرية وتُستخدم فقط للتحقق من الهوية من قبل الإدارة. لن تظهر للعملاء.'
                  : 'These documents are confidential and used only for identity verification by admins. They will not be shown to customers.'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DocUpload
                  label={ar ? 'بطاقة الهوية (الوجه الأمامي)' : 'ID Card (Front)'}
                  hint={ar ? 'صورة واضحة' : 'Clear photo'}
                  value={idDocFront} onChange={setIdDocFront} ar={ar}
                />
                <DocUpload
                  label={ar ? 'بطاقة الهوية (الوجه الخلفي)' : 'ID Card (Back)'}
                  hint={ar ? 'صورة واضحة' : 'Clear photo'}
                  value={idDocBack} onChange={setIdDocBack} ar={ar}
                />
              </div>
              <DocUpload
                label={ar ? 'رخصة العمل / شهادة الكفاءة (اختياري)' : 'Work License / Competency Certificate (optional)'}
                hint={ar ? 'صورة أو ملف PDF' : 'Image or PDF file'}
                value={workLicense} onChange={setWorkLicense} ar={ar}
              />
            </div>
          </div>

          {/* ── 6. Work Portfolio ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={Image}>{ar ? 'معرض الأعمال (حتى 6 صور)' : 'Work Portfolio (up to 6 photos)'}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {workImages.map((src, i) => (
                <div key={i} className="relative w-[calc(33%-4px)] aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setWorkImages(p => p.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {workImages.length < 6 && (
                <label className="w-[calc(33%-4px)] aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors">
                  <Plus className="w-5 h-5 text-gray-400 mb-0.5" />
                  <span className="text-gray-400 text-xs">{ar ? 'إضافة' : 'Add'}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleWorkImages} />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {ar ? 'أضف صوراً من أعمالك السابقة لتعزيز ملفك الشخصي' : 'Add photos of previous work to strengthen your profile'}
            </p>
          </div>

          {/* ── 7. Social Media ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle icon={FileText}>{ar ? 'التواصل الاجتماعي (اختياري)' : 'Social Media (optional)'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'صفحة فيسبوك' : 'Facebook Page'}>
                <input className={inp} type="url" value={form.facebook}
                  onChange={e => set('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage" dir="ltr" />
              </Field>
              <Field label={ar ? 'حساب إنستغرام' : 'Instagram Account'}>
                <input className={inp} type="url" value={form.instagram}
                  onChange={e => set('instagram', e.target.value)}
                  placeholder="https://instagram.com/youraccount" dir="ltr" />
              </Field>
            </div>
          </div>

          {/* ── 8. Terms ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={form.terms}
                  onChange={e => set('terms', e.target.checked)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all pointer-events-none ${form.terms ? 'bg-[#FF7900] border-[#FF7900]' : 'border-gray-300'}`}>
                  {form.terms && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                {ar
                  ? 'أوافق على الشروط والأحكام وسياسة الخصوصية لمنصة اطلب فني، وأقر بصحة جميع البيانات المدخلة.'
                  : 'I agree to the Terms & Conditions and Privacy Policy of Otlob Fanni, and confirm all submitted information is accurate.'}
                <span className="text-[#FF7900] mx-0.5">*</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || !form.terms}
            className="w-full bg-[#FF7900] hover:bg-[#e86d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-colors active:scale-[0.98]"
          >
            {saving ? (ar ? 'جاري الإرسال...' : 'Submitting...') : (ar ? 'إرسال الطلب' : 'Submit Request')}
          </button>

          <p className="text-center text-xs text-gray-400 pb-2">
            {ar ? 'سيتم مراجعة طلبك خلال 24-48 ساعة والتواصل معك هاتفياً' : 'Your request will be reviewed within 24-48 hours and we will contact you by phone'}
          </p>
        </form>
      </main>
    </div>
  )
}
