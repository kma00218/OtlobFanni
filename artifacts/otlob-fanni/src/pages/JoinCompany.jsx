import { useState, useRef, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { sections, categories } from '../data/services'
import { CheckCircle, Camera, X, Upload, Lock, Building2, Briefcase, Clock, FileText, Image, Facebook } from 'lucide-react'
import api from '../lib/api'

const DAYS = {
  ar: ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'],
  en: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)

const inp = 'w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors placeholder:text-gray-400'
const sel = inp + ' appearance-none cursor-pointer'

function SectionTitle({ icon: Icon, step, children }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-gray-100">
      {step !== undefined && (
        <div className="w-7 h-7 rounded-full bg-[#FF7900] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-xs font-bold">{step}</span>
        </div>
      )}
      <div className="w-9 h-9 rounded-xl bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0 border border-[#FF7900]/20">
        <Icon className="text-[#FF7900]" style={{ width: 18, height: 18 }} />
      </div>
      <h2 className="font-bold text-[#071B33] text-[15px] flex-1 leading-tight">{children}</h2>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-700">
        {label}{required && <span className="text-[#FF7900] font-bold text-sm">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 leading-relaxed mt-1">{hint}</p>}
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
          <button type="button" onClick={() => onChange(null)}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
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
            }} />
        </label>
      )}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export default function JoinCompany() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const logoInputRef = useRef(null)

  const [cities, setCities] = useState([])
  useEffect(() => { api.cities().then(setCities).catch(() => {}) }, [])

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [companyLogo, setCompanyLogo] = useState(null)
  const [workImages, setWorkImages] = useState([])
  const [days, setDays] = useState([])

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    whatsapp: '',
    commercial_reg: '',
    city: '',
    area: '',
    address: '',
    section: '',
    category: '',
    customSpecialty: '',
    years_active: '',
    description: '',
    certifications: '',
    price_from: '',
    price_to: '',
    available_now: 'yes',
    emergency: 'no',
    hours_from: '08:00',
    hours_to: '18:00',
    service_radius: '',
    facebook: '',
    instagram: '',
    terms: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDay = (d) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCompanyLogo(ev.target.result)
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
      await api.submitCompanyApplication({
        id:             'cr' + Date.now(),
        company_name:   form.company_name,
        contact_name:   form.contact_name,
        phone:          form.phone,
        whatsapp:       form.whatsapp,
        commercial_reg: form.commercial_reg,
        city:           form.city,
        area:           form.area,
        address:        form.address,
        specialty:      form.section === 'more_services' ? 'more_services' : (form.category || form.section || 'other'),
        custom_specialty: form.section === 'more_services' ? form.customSpecialty : undefined,
        years_active:   form.years_active,
        description:    form.description,
        certifications: form.certifications,
        price_from:     form.price_from,
        price_to:       form.price_to,
        available_now:  form.available_now === 'yes',
        working_days:   days,
        hours_from:     form.hours_from,
        hours_to:       form.hours_to,
        emergency:      form.emergency === 'yes',
        service_radius: form.service_radius,
        facebook:       form.facebook,
        instagram:      form.instagram,
        company_logo:   companyLogo,
        work_images:    workImages,
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
            {ar ? 'تم الإرسال بنجاح!' : 'Application Submitted!'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {ar
              ? 'تم إرسال طلب تسجيل شركتك بنجاح. سيتم مراجعة البيانات من الإدارة، وبعد الموافقة ستظهر شركتك في التطبيق.'
              : 'Your company registration has been submitted. After admin approval, your company will appear in the app.'}
          </p>
          <button onClick={() => window.history.back()}
            className="w-full bg-[#FF7900] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#e86d00] transition-colors active:scale-95">
            {ar ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  const initials = form.company_name.trim().split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '؟'

  return (
    <div className="bg-[#F7F8FA] min-h-screen" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'انضم كشركة' : 'Join as Company'} />

      <main className="pt-20 pb-12 px-4 max-w-[480px] mx-auto">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#071B33]/8 px-4 py-1.5 rounded-full mb-3">
            <Building2 className="w-4 h-4 text-[#071B33]" />
            <span className="text-xs font-bold text-[#071B33]">{ar ? 'تسجيل شركة / مؤسسة' : 'Company / Business Registration'}</span>
          </div>
          <h1 className="text-lg font-bold text-[#071B33] mb-1">{ar ? 'نموذج تسجيل الشركات' : 'Company Registration Form'}</h1>
          <p className="text-gray-500 text-sm">{ar ? 'أكمل جميع البيانات المطلوبة للانضمام إلى المنصة كشركة' : 'Complete all required fields to join the platform as a company'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── 1. Company Logo ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Camera} step={1}>{ar ? 'شعار الشركة' : 'Company Logo'}</SectionTitle>
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-28 h-28 rounded-2xl border-4 border-[#FF7900]/20 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-100"
                onClick={() => logoInputRef.current?.click()}
              >
                {companyLogo ? (
                  <img src={companyLogo} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-xl bg-[#071B33] flex items-center justify-center text-white font-bold text-xl">
                      {initials}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              <div className="text-center">
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  className="text-sm font-medium text-[#FF7900] hover:underline">
                  {companyLogo ? (ar ? 'تغيير الشعار' : 'Change Logo') : (ar ? 'رفع شعار الشركة' : 'Upload Company Logo')}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ar ? 'سيظهر هذا الشعار في ملف الشركة على التطبيق' : 'This logo will appear on your company profile in the app'}
                </p>
                {companyLogo && (
                  <button type="button" onClick={() => setCompanyLogo(null)}
                    className="text-xs text-red-400 hover:underline mt-1 block">
                    {ar ? 'إزالة الشعار' : 'Remove logo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── 2. Company Information ─────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Building2} step={2}>{ar ? 'معلومات الشركة' : 'Company Information'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'اسم الشركة / المؤسسة' : 'Company / Business Name'} required>
                <input className={inp} required value={form.company_name}
                  onChange={e => set('company_name', e.target.value)}
                  placeholder={ar ? 'مؤسسة الأمل للصيانة' : 'Al-Amal Maintenance Co.'} />
              </Field>

              <Field label={ar ? 'اسم المسؤول / جهة التواصل' : 'Contact Person Name'} required>
                <input className={inp} required value={form.contact_name}
                  onChange={e => set('contact_name', e.target.value)}
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

              <Field label={ar ? 'رقم السجل التجاري / الترخيص' : 'Commercial Registration Number'}
                hint={ar ? 'سيُستخدم للتحقق من هوية الشركة داخلياً' : 'Used for internal company verification'}>
                <input className={inp} value={form.commercial_reg}
                  onChange={e => set('commercial_reg', e.target.value)}
                  placeholder={ar ? 'LY-2024-00001' : 'LY-2024-00001'} dir="ltr" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'المدينة' : 'City'} required>
                  <select className={sel} required value={form.city} onChange={e => set('city', e.target.value)}>
                    <option value="">{ar ? 'اختر...' : 'Select...'}</option>
                    {cities.map(c => (
                      <option key={c.id} value={ar ? c.nameAr : c.nameEn}>{ar ? c.nameAr : c.nameEn}</option>
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
                  placeholder={ar ? 'الشارع، البناية، رقم المكتب...' : 'Street, building, office number...'} />
              </Field>
            </div>
          </div>

          {/* ── 3. Service Information ──────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Briefcase} step={3}>{ar ? 'معلومات الخدمة' : 'Service Information'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'القسم الرئيسي' : 'Main Section'} required>
                <select className={sel} required value={form.section} onChange={e => { set('section', e.target.value); set('category', ''); set('customSpecialty', '') }}>
                  <option value="">{ar ? 'اختر القسم...' : 'Select section...'}</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{ar ? s.nameAr : s.nameEn}</option>
                  ))}
                </select>
              </Field>

              {form.section === 'more_services' ? (
                <Field label={ar ? 'اكتب تخصصك' : 'Write your specialty'} required>
                  <input
                    className={inp}
                    required
                    value={form.customSpecialty || ''}
                    onChange={e => set('customSpecialty', e.target.value)}
                    placeholder={ar ? 'مثال: صيانة معدات ثقيلة' : 'e.g., Heavy equipment maintenance'}
                  />
                </Field>
              ) : (
                <Field label={ar ? 'تخصص الخدمة' : 'Service Category'} required>
                  <select className={sel} required value={form.category} onChange={e => set('category', e.target.value)} disabled={!form.section}>
                    <option value="">{!form.section ? (ar ? 'اختر القسم أولاً...' : 'Select section first...') : (ar ? 'اختر التخصص...' : 'Select category...')}</option>
                    {categories.filter(c => c.sectionId === form.section && c.id !== 'more').map(c => (
                      <option key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn}</option>
                    ))}
                    <option value="__other__">{ar ? '✏️ تخصص آخر' : '✏️ Other Specialty'}</option>
                  </select>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'سنوات النشاط' : 'Years Active'} required>
                  <select className={sel} required value={form.years_active} onChange={e => set('years_active', e.target.value)}>
                    <option value="">{ar ? 'اختر...' : 'Select...'}</option>
                    {[
                      { v: 'less1', ar: 'أقل من سنة',  en: 'Less than 1 yr' },
                      { v: '1-2',   ar: '1-2 سنوات',   en: '1-2 years'      },
                      { v: '3-5',   ar: '3-5 سنوات',   en: '3-5 years'      },
                      { v: '6-10',  ar: '6-10 سنوات',  en: '6-10 years'     },
                      { v: '10+',   ar: 'أكثر من 10',  en: 'More than 10'   },
                    ].map(o => <option key={o.v} value={o.v}>{ar ? o.ar : o.en}</option>)}
                  </select>
                </Field>
                <Field label={ar ? 'نطاق الخدمة (كم)' : 'Service Radius (km)'}
                  hint="">
                  <input className={inp} type="number" min="0" max="500" value={form.service_radius}
                    onChange={e => set('service_radius', e.target.value)} placeholder={ar ? 'مثال: 50' : 'e.g. 50'} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={ar ? 'السعر الأدنى (د.ل)' : 'Min Price (LYD)'} required>
                  <input className={inp} type="number" min="0" required value={form.price_from}
                    onChange={e => set('price_from', e.target.value)} placeholder="50" />
                </Field>
                <Field label={ar ? 'السعر الأقصى (د.ل)' : 'Max Price (LYD)'}>
                  <input className={inp} type="number" min="0" value={form.price_to}
                    onChange={e => set('price_to', e.target.value)} placeholder="2000" />
                </Field>
              </div>

              <Field label={ar ? 'وصف الخدمات المقدمة' : 'Services Description'} required>
                <textarea
                  className={inp + ' min-h-[90px] resize-none'} required value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={ar ? 'اكتب نبذة عن خدمات الشركة وخبراتها...' : 'Describe the company services and expertise...'} />
              </Field>

              <Field label={ar ? 'الشهادات والتراخيص المهنية' : 'Certifications & Licenses'}
                hint={ar ? 'اذكر أي اعتمادات أو شراكات مهنية' : 'Mention any professional accreditations or partnerships'}>
                <textarea
                  className={inp + ' min-h-[70px] resize-none'} value={form.certifications}
                  onChange={e => set('certifications', e.target.value)}
                  placeholder={ar ? 'مثال: معتمدة من وزارة الاقتصاد، شريك رسمي لـ...' : 'e.g., Ministry-approved, Official partner of...'} />
              </Field>
            </div>
          </div>

          {/* ── 4. Availability ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Clock} step={4}>{ar ? 'أوقات العمل والتوفر' : 'Working Hours & Availability'}</SectionTitle>
            <div className="space-y-4">

              <Field label={ar ? 'هل الشركة متاحة الآن؟' : 'Company Available Now?'} required>
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
                <Field label={ar ? 'بداية الدوام' : 'Opening Time'}>
                  <select className={sel} value={form.hours_from} onChange={e => set('hours_from', e.target.value)}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </Field>
                <Field label={ar ? 'نهاية الدوام' : 'Closing Time'}>
                  <select className={sel} value={form.hours_to} onChange={e => set('hours_to', e.target.value)}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </Field>
              </div>

              <Field label={ar ? 'خدمة طوارئ؟ (24/7)' : 'Emergency Service? (24/7)'}>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'yes', ar: 'نعم ✓', en: 'Yes ✓' }, { v: 'no', ar: 'لا', en: 'No' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => set('emergency', opt.v)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${form.emergency === opt.v ? 'bg-[#071B33] border-[#071B33] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {ar ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── 5. Social Media ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Facebook} step={5}>{ar ? 'التواصل الاجتماعي' : 'Social Media'}</SectionTitle>
            <div className="space-y-4">
              <Field label={ar ? 'رابط فيسبوك' : 'Facebook Link'}
                hint={ar ? 'اختياري' : 'Optional'}>
                <input className={inp} type="url" value={form.facebook}
                  onChange={e => set('facebook', e.target.value)}
                  placeholder="https://facebook.com/company" dir="ltr" />
              </Field>
              <Field label={ar ? 'رابط إنستغرام' : 'Instagram Link'}
                hint={ar ? 'اختياري' : 'Optional'}>
                <input className={inp} type="url" value={form.instagram}
                  onChange={e => set('instagram', e.target.value)}
                  placeholder="https://instagram.com/company" dir="ltr" />
              </Field>
            </div>
          </div>

          {/* ── 6. Work Portfolio ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Image} step={6}>{ar ? 'معرض الأعمال (اختياري)' : 'Work Portfolio (Optional)'}</SectionTitle>
            <p className="text-xs text-gray-400 mb-3">
              {ar ? `${workImages.length}/6 صور` : `${workImages.length}/6 photos`}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {workImages.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} alt={`work ${i}`} className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => setWorkImages(p => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {workImages.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">{ar ? 'إضافة' : 'Add'}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleWorkImages} />
                </label>
              )}
            </div>
          </div>

          {/* ── 8. Terms & Submit ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={FileText} step={8}>{ar ? 'الشروط والأحكام' : 'Terms & Conditions'}</SectionTitle>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" required
                checked={form.terms} onChange={e => set('terms', e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#FF7900] flex-shrink-0"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                {ar
                  ? 'أوافق على شروط وأحكام منصة اطلب فني، وأؤكد أن جميع البيانات المدخلة صحيحة ودقيقة.'
                  : 'I agree to Otlob Fanni\'s terms and conditions, and confirm that all submitted information is accurate.'}
              </span>
            </label>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full bg-[#FF7900] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#e86d00] transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#FF7900]/20"
          >
            {saving
              ? (ar ? 'جارٍ الإرسال...' : 'Submitting...')
              : (ar ? 'إرسال طلب التسجيل' : 'Submit Registration')}
          </button>

        </form>
      </main>
    </div>
  )
}
