import { useState, useRef, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import { sections, categories } from '../data/services'
import { CheckCircle, Camera, X, Upload, Lock, Building2, Briefcase, Clock, FileText, Image, Facebook, Info, Copy, Check, ChevronDown, MapPin as MapPinIcon } from 'lucide-react'
import api, { uploadFile, getFileUrl } from '../lib/api'
import LocationPicker from '../components/LocationPicker'

const DAYS = {
  ar: ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'],
  en: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)

const inp = 'w-full px-4 py-3 rounded-xl border-2 border-gray-800 bg-blue-50 text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors placeholder:text-gray-400'
const sel = inp + ' appearance-none cursor-pointer'

const SECTION_GRADIENT = {
  home_services:     ['#FF7900', '#e85e00'],
  car_services:      ['#1E40AF', '#0f2472'],
  construction:      ['#D97706', '#b35500'],
  tech_security:     ['#6366F1', '#4338CA'],
  moving_general:    ['#8B5CF6', '#6D28D9'],
  gardens_pools:     ['#10B981', '#047857'],
  energy_generators: ['#F59E0B', '#D97706'],
  business_services: ['#0EA5E9', '#0369A1'],
  more_services:     ['#6B7280', '#374151'],
}

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
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const prev = URL.createObjectURL(file)
    setPreview(prev)
    setBusy(true)
    try {
      const objectPath = await uploadFile(file)
      onChange(objectPath)
    } catch {
      setPreview(null)
    } finally {
      setBusy(false)
    }
  }
  const displaySrc = preview || getFileUrl(value)
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {displaySrc ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28">
          <img src={displaySrc} alt="" className="w-full h-full object-cover" />
          {busy ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <button type="button" onClick={() => { onChange(null); setPreview(null) }}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-green-500/90 text-white text-xs text-center py-1 font-medium">
                {ar ? '✓ تم الرفع' : '✓ Uploaded'}
              </div>
            </>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors">
          <Upload className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500 text-center px-2">{ar ? 'انقر للرفع' : 'Click to upload'}</span>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
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

  const refCode = new URLSearchParams(window.location.search).get('ref')

  const [submitted, setSubmitted] = useState(false)
  const [requestNumber, setRequestNumber] = useState(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [companyLogo, setCompanyLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [workImages, setWorkImages] = useState([])
  const [workPreviews, setWorkPreviews] = useState([])
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
    instagram: '', tiktok: '',
    terms: false,
  })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [otherChecked, setOtherChecked] = useState(false)
  const [expandedSections, setExpandedSections] = useState([])
  const [suggestedSpecialties, setSuggestedSpecialties] = useState({})
  const [location, setLocation] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleCategory = (id) => setSelectedCategories(p =>
    p.includes(id) ? p.filter(x => x !== id) : [...p, id]
  )
  const toggleSection = (id) => setExpandedSections(p =>
    p.includes(id) ? p.filter(x => x !== id) : [...p, id]
  )
  const toggleDay = (d) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const handleLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    setUploading(n => n + 1)
    try {
      const objectPath = await uploadFile(file)
      setCompanyLogo(objectPath)
    } catch {
      alert(ar ? 'فشل رفع الصورة، حاول مرة أخرى' : 'Logo upload failed, please try again')
      setLogoPreview(null)
    } finally {
      setUploading(n => n - 1)
    }
  }

  const handleWorkImages = async (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(async (file) => {
      if (workImages.length >= 6) return
      const preview = URL.createObjectURL(file)
      setWorkPreviews(p => p.length < 6 ? [...p, preview] : p)
      setUploading(n => n + 1)
      try {
        const objectPath = await uploadFile(file)
        setWorkImages(p => p.length < 6 ? [...p, objectPath] : p)
      } catch {
        setWorkPreviews(p => p.filter(x => x !== preview))
      } finally {
        setUploading(n => n - 1)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const primarySpecialty = selectedCategories[0] || 'more_services'
      const extraSpecialties = selectedCategories.slice(1)
      const suggestions = Object.entries(suggestedSpecialties)
        .filter(([, name]) => name.trim())
        .map(([sectionId, name]) => ({ sectionId, name: name.trim() }))

      const result = await api.submitCompanyApplication({
        id:               'cr' + Date.now(),
        company_name:     form.company_name,
        contact_name:     form.contact_name,
        phone:            form.phone,
        whatsapp:         form.whatsapp,
        commercial_reg:   form.commercial_reg,
        city:             form.city,
        area:             form.area,
        address:          form.address,
        specialty:        primarySpecialty,
        extra_specialties: extraSpecialties,
        custom_specialty: otherChecked ? form.customSpecialty : undefined,
        suggested_specialties: suggestions.length ? suggestions : undefined,
        lat: location?.lat ?? undefined,
        lng: location?.lng ?? undefined,
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
        tiktok:         form.tiktok,
        company_logo:   companyLogo || null,
        work_images:    workImages,
        referred_by:    refCode || undefined,
      })
      if (result?.requestNumber) setRequestNumber(result.requestNumber)
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
      <div className="bg-[#ECEEF2] min-h-screen flex items-center justify-center p-6" dir={ar ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-[#071B33] mb-3">
            {ar ? 'تم الإرسال بنجاح!' : 'Application Submitted!'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            {ar
              ? 'تم إرسال طلب تسجيل شركتك بنجاح. سيتم مراجعة البيانات من الإدارة، وبعد الموافقة ستظهر شركتك في التطبيق.'
              : 'Your company registration has been submitted. After admin approval, your company will appear in the app.'}
          </p>
          {requestNumber && (
            <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{ar ? 'رقم تتبع طلبك' : 'Your tracking number'}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-[#071B33] font-mono tracking-widest">{requestNumber}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(requestNumber); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (ar ? 'تم النسخ' : 'Copied!') : (ar ? 'نسخ' : 'Copy')}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">{ar ? 'احتفظ بهذا الرقم لمتابعة حالة طلبك' : 'Save this number to track your request status'}</p>
            </div>
          )}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-2 text-right">
            <span className="text-blue-400 text-base mt-0.5">💡</span>
            <p className="text-xs text-blue-600 leading-relaxed">
              {ar
                ? 'إذا نسيت رقم التتبع، يمكنك البحث برقم هاتفك عبر: انضم إلينا ← تتبع حالة طلبك'
                : 'If you forget the tracking number, you can search by your phone number via: Join Us → Track your request status'}
            </p>
          </div>
          <div className="space-y-3">
            {requestNumber && (
              <a href={`/status/${requestNumber}`}
                className="block w-full border-2 border-[#FF7900] text-[#FF7900] font-bold py-3.5 rounded-2xl text-sm hover:bg-[#FF7900]/5 transition-colors active:scale-95">
                {ar ? 'تتبع حالة طلبك' : 'Track Request Status'}
              </a>
            )}
            <button onClick={() => window.history.back()}
              className="w-full bg-[#FF7900] text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-[#e86d00] transition-colors active:scale-95">
              {ar ? 'العودة' : 'Go Back'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const firstWord = form.company_name.trim().split(' ')[0] || '؟'

  return (
    <div className="bg-[#ECEEF2] min-h-screen" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'انضم كشركة' : 'Join as Company'} />

      <main className="pt-20 pb-12 px-4 max-w-[480px] mx-auto">

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 bg-[#071B33]/8 px-4 py-1.5 rounded-full mb-3">
            <Building2 className="w-4 h-4 text-[#071B33]" />
            <span className="text-xs font-bold text-[#071B33]">{ar ? 'تسجيل شركة / مؤسسة' : 'Company / Business Registration'}</span>
          </div>
          <h1 className="text-lg font-bold text-[#071B33] mb-1">{ar ? 'نموذج تسجيل الشركات' : 'Company Registration Form'}</h1>
          <p className="text-gray-500 text-sm">{ar ? 'أكمل جميع البيانات المطلوبة للانضمام إلى المنصة كشركة' : 'Complete all required fields to join the platform as a company'}</p>
        </div>

        {/* Multi-specialty tip */}
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl px-4 py-3.5 border-2 border-[#FF7900]/50" style={{ background: '#FFF4E8' }}>
          <Info className="w-4 h-4 text-[#FF7900] flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#3d2200] leading-relaxed">
            {ar
              ? 'يمكنك الاختيار من أكثر من قسم وأكثر من تخصص في طلب واحد.'
              : 'You can choose from multiple departments and multiple specialties in a single application.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── 1. Company Logo ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <SectionTitle icon={Camera} step={1}>{ar ? 'شعار الشركة' : 'Company Logo'}</SectionTitle>
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-28 h-28 rounded-2xl border-4 border-[#FF7900]/20 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-100"
                onClick={() => !uploading && logoInputRef.current?.click()}
              >
                {(logoPreview || companyLogo) ? (
                  <img src={logoPreview || getFileUrl(companyLogo)} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center rounded-2xl">
                    <span className="text-white font-bold text-base text-center px-2 leading-tight">{firstWord}</span>
                  </div>
                )}
                {uploading > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!uploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              <div className="text-center w-full">
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  className="text-sm font-bold text-[#FF7900] hover:underline" disabled={uploading > 0}>
                  {(logoPreview || companyLogo) ? (ar ? 'تغيير الشعار' : 'Change Logo') : (ar ? '🏢 أضف شعار شركتك' : '🏢 Add Your Company Logo')}
                </button>
                <div className="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 text-right">
                  <span className="text-lg flex-shrink-0 leading-none">⭐</span>
                  <div>
                    <p className="text-xs font-bold text-orange-900 leading-snug">
                      {ar ? 'الشركات التي تعرض شعارها تبدو أكثر احترافية وتكسب ثقة العملاء بشكل أسرع' : 'Companies with a logo appear more professional and gain client trust faster'}
                    </p>
                    <p className="text-[11px] text-orange-500 font-semibold mt-0.5">
                      {ar ? 'اختياري — لكنه يُحدث فارقاً كبيراً ✓' : 'Optional — but makes a big difference ✓'}
                    </p>
                  </div>
                </div>
                {(logoPreview || companyLogo) && (
                  <button type="button" onClick={() => { setCompanyLogo(null); setLogoPreview(null) }}
                    className="text-xs text-red-400 hover:underline mt-2 block mx-auto">
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
                  <LibyaPhoneInput required value={form.phone} onChange={v => set('phone', v)} />
                </Field>
                <Field label={ar ? 'واتساب' : 'WhatsApp'} required>
                  <LibyaPhoneInput required value={form.whatsapp} onChange={v => set('whatsapp', v)} />
                </Field>
              </div>

              {/* حقل السجل التجاري مخفي مؤقتاً في مرحلة الإطلاق */}

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
              {/* ── Multi-Section Specialty Picker ── */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-700">
                  {ar ? 'الأقسام والتخصصات' : 'Departments & Specialties'}
                  <span className="text-[#FF7900] font-bold text-sm">*</span>
                </label>
                <p className="text-[13px] text-[#071B33] font-semibold leading-relaxed">
                  {ar
                    ? 'افتح أي قسم واختر التخصصات التي تعمل بها — يمكنك الاختيار من أكثر من قسم'
                    : 'Open any section and select your specialties — you can choose from multiple sections'}
                </p>
                <div className="rounded-xl border-2 border-gray-800 overflow-hidden bg-blue-50 divide-y divide-gray-200">
                  {sections.map((section) => {
                    const isMore = section.id === 'more_services'
                    const sectionCats = isMore ? [] : categories.filter(c => c.sectionId === section.id && c.id !== 'more')
                    const selectedCount = isMore ? (otherChecked ? 1 : 0) : sectionCats.filter(c => selectedCategories.includes(c.id)).length
                    const isOpen = expandedSections.includes(section.id)
                    const [c1, c2] = SECTION_GRADIENT[section.id] || ['#6B7280', '#374151']
                    return (
                      <div key={section.id}>
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#FF7900]/5 active:bg-[#FF7900]/10 transition-colors text-start"
                        >
                          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                            <img src={`/icons/services/${isMore ? 'more' : section.id}.svg`} alt="" style={{ width: 18, height: 18 }} className="object-contain brightness-0 invert" onError={e => { e.currentTarget.style.display = 'none' }} />
                          </div>
                          <span className="flex-1 font-bold text-[#071B33] text-sm text-start">{ar ? section.nameAr : section.nameEn}</span>
                          {selectedCount > 0 && (
                            <span className="bg-[#FF7900] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">{selectedCount}</span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="bg-white border-t border-gray-100 divide-y divide-gray-50">
                            {isMore ? (
                              <div className="px-4 py-3 space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input type="checkbox" className="w-4 h-4 accent-[#FF7900] flex-shrink-0" checked={otherChecked} onChange={() => { setOtherChecked(v => !v); if (otherChecked) set('customSpecialty', '') }} />
                                  <span className="text-sm text-[#071B33] font-medium">{ar ? '✏️ تخصص غير مذكور في القائمة' : '✏️ Specialty not listed above'}</span>
                                </label>
                                {otherChecked && (
                                  <input className={inp} value={form.customSpecialty} onChange={e => set('customSpecialty', e.target.value)} placeholder={ar ? 'مثال: صيانة معدات ثقيلة' : 'e.g., Heavy equipment maintenance'} />
                                )}
                              </div>
                            ) : (
                              <>
                                {sectionCats.map(c => (
                                  <label key={c.id} className="flex items-center gap-3 px-6 py-2.5 cursor-pointer hover:bg-[#FF7900]/5 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 accent-[#FF7900] flex-shrink-0" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                                    <span className="text-sm text-[#071B33] font-medium">{ar ? c.nameAr : c.nameEn}</span>
                                  </label>
                                ))}
                                <div className="px-4 py-3 bg-orange-50/60 border-t border-dashed border-orange-200">
                                  <p className="text-[11px] text-gray-500 mb-1.5 font-medium">
                                    {ar ? '💡 اقترح تخصصاً غير مذكور في هذا القسم (اختياري)' : '💡 Suggest an unlisted specialty for this section (optional)'}
                                  </p>
                                  <input
                                    type="text"
                                    className={inp}
                                    value={suggestedSpecialties[section.id] || ''}
                                    onChange={e => setSuggestedSpecialties(p => ({ ...p, [section.id]: e.target.value }))}
                                    placeholder={ar ? 'مثال: صيانة خزانات المياه' : 'e.g., Water tank maintenance'}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-green-600 font-semibold">
                    {ar ? `✓ تم اختيار ${selectedCategories.length} تخصص` : `✓ ${selectedCategories.length} specialt${selectedCategories.length === 1 ? 'y' : 'ies'} selected`}
                  </p>
                )}
                {selectedCategories.length === 0 && !otherChecked && (
                  <input type="text" className="sr-only" required tabIndex={-1} readOnly value="" aria-hidden />
                )}
              </div>

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

              <Field label={ar ? 'وصف الخدمات المقدمة' : 'Services Description'} required>
                <textarea
                  className={inp + ' min-h-[90px] resize-none'} required value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={ar ? 'اكتب نبذة عن خدمات الشركة وخبراتها...' : 'Describe the company services and expertise...'} />
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
            <SectionTitle icon={Facebook} step={5}>{ar ? 'التواصل الاجتماعي (اختياري)' : 'Social Media (Optional)'}</SectionTitle>
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
              <Field label={ar ? 'حساب تيك توك' : 'TikTok Account'}
                hint={ar ? 'اختياري' : 'Optional'}>
                <input className={inp} type="url" value={form.tiktok}
                  onChange={e => set('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@company" dir="ltr" />
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
              {workPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} alt={`work ${i}`} className="w-full h-full object-cover" />
                  {workImages[i] ? (
                    <button type="button" onClick={() => {
                      setWorkImages(p => p.filter((_, idx) => idx !== i))
                      setWorkPreviews(p => p.filter((_, idx) => idx !== i))
                    }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}
              {workPreviews.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">{ar ? 'إضافة' : 'Add'}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleWorkImages} />
                </label>
              )}
            </div>
          </div>

          {/* ── 7.5 Location ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
            <div className="flex items-center gap-2 mb-1">
              <MapPinIcon className="w-5 h-5 text-[#FF7900]" />
              <h3 className="font-bold text-[#071B33] text-base">
                {ar ? 'موقع الشركة على الخريطة' : 'Company Location on Map'}
                <span className="text-gray-400 text-xs font-normal mr-1.5">{ar ? '(اختياري)' : '(optional)'}</span>
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              {ar
                ? 'يساعد تحديد موقع شركتك العملاء القريبين في إيجادكم بسرعة عبر ميزة "الأقرب إليّ".'
                : 'Pinning your company location helps nearby customers find you faster via the "Near Me" feature.'}
            </p>
            <LocationPicker value={location} onChange={setLocation} ar={ar} />
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
                {ar ? 'أوافق على ' : 'I agree to '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#FF7900] underline font-medium" onClick={e => e.stopPropagation()}>
                  {ar ? 'شروط وأحكام' : 'Terms & Conditions'}
                </a>
                {ar ? ' و' : ' and '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF7900] underline font-medium" onClick={e => e.stopPropagation()}>
                  {ar ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </a>
                {ar
                  ? ' لمنصة اطلب فني، وأؤكد أن جميع البيانات المدخلة صحيحة ودقيقة.'
                  : ' of Otlob Fanni, and confirm that all submitted information is accurate.'}
              </span>
            </label>
          </div>

          <button
            type="submit" disabled={saving || uploading > 0}
            className="w-full bg-[#FF7900] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#e86d00] transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#FF7900]/20"
          >
            {uploading > 0 ? (ar ? 'جارٍ رفع الصور...' : 'Uploading images...') : saving ? (ar ? 'جارٍ الإرسال...' : 'Submitting...') : (ar ? 'إرسال طلب التسجيل' : 'Submit Registration')}
          </button>

        </form>
      </main>
    </div>
  )
}
