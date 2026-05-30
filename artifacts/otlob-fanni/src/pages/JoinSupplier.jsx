import { useState, useRef, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import LocationPicker from '../components/LocationPicker'
import { SUPPLY_TYPES } from '../data/suppliers'
import { CheckCircle, Camera, X, Upload, Plus, Building2, Phone, FileText, Facebook, Copy, Check, Package, MapPin as MapPinIcon, Info } from 'lucide-react'
import api, { uploadFile, getFileUrl } from '../lib/api'

const inp = 'w-full px-4 py-3 rounded-xl border-2 border-gray-800 bg-blue-50 text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors placeholder:text-gray-400'
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

export default function JoinSupplier() {
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
  const [whatsappStatus, setWhatsappStatus] = useState('idle')
  const [uploading, setUploading] = useState(0)
  const [location, setLocation] = useState(null)
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [shopImages, setShopImages] = useState([])
  const [shopPreviews, setShopPreviews] = useState([])

  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    area: '',
    address: '',
    supply_type: '',
    custom_supply_type: '',
    description: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    terms: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleWhatsappBlur = async () => {
    const num = form.whatsapp.replace(/\D/g, '')
    if (num.length < 10) { setWhatsappStatus('idle'); return }
    setWhatsappStatus('checking')
    try {
      const { available } = await api.checkWhatsapp(form.whatsapp)
      setWhatsappStatus(available ? 'available' : 'taken')
    } catch {
      setWhatsappStatus('idle')
    }
  }

  const isOther = form.supply_type === 'other'

  // First word of business name for logo placeholder
  const firstWord = (form.business_name || '').trim().split(' ')[0] || '📦'

  const handleLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    setUploading(n => n + 1)
    try {
      const path = await uploadFile(file)
      setLogo(path)
    } catch {
      alert(ar ? 'فشل رفع الصورة، حاول مرة أخرى' : 'Photo upload failed, please try again')
      setLogoPreview(null)
    } finally {
      setUploading(n => n - 1)
    }
  }

  const handleShopImages = async (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(async (file) => {
      if (shopImages.length >= 3) return
      const preview = URL.createObjectURL(file)
      setShopPreviews(p => p.length < 3 ? [...p, preview] : p)
      setUploading(n => n + 1)
      try {
        const path = await uploadFile(file)
        setShopImages(p => p.length < 3 ? [...p, path] : p)
      } catch {
        setShopPreviews(p => p.filter(x => x !== preview))
      } finally {
        setUploading(n => n - 1)
      }
    })
  }

  const removeShopImage = (idx) => {
    setShopImages(p => p.filter((_, i) => i !== idx))
    setShopPreviews(p => p.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (whatsappStatus === 'taken') {
      alert(ar ? 'رقم الواتساب مسجّل مسبقاً. يرجى استخدام رقم آخر.' : 'This WhatsApp number is already registered. Please use a different number.')
      return
    }
    if (!form.supply_type) {
      alert(ar ? 'يرجى اختيار نوع المستلزمات' : 'Please select a supply type')
      return
    }
    if (isOther && !form.custom_supply_type.trim()) {
      alert(ar ? 'يرجى كتابة نوع المستلزمات' : 'Please specify the supply type')
      return
    }
    setSaving(true)
    try {
      const result = await api.submitSupplierApplication({
        business_name:      form.business_name,
        contact_name:       form.contact_name,
        phone:              form.phone,
        whatsapp:           form.whatsapp,
        city:               form.city,
        area:               form.area || null,
        address:            form.address || null,
        lat:                location?.lat ?? undefined,
        lng:                location?.lng ?? undefined,
        supply_type:        form.supply_type,
        custom_supply_type: isOther ? form.custom_supply_type.trim() : null,
        description:        form.description || null,
        logo:               logo || null,
        shop_images:        shopImages,
        email:              form.email || null,
        facebook:           form.facebook || null,
        instagram:          form.instagram || null,
        tiktok:             form.tiktok || null,
        referred_by:        refCode || null,
      })
      if (result?.requestNumber) setRequestNumber(result.requestNumber)
      setSubmitted(true)
    } catch (err) {
      alert(ar ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#ECEEF2] min-h-screen flex items-center justify-center p-6" dir={ar ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-[#071B33] mb-3">
            {ar ? 'تم الإرسال بنجاح!' : 'Application Submitted!'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            {ar
              ? 'تم استلام طلبك بنجاح. سيتم مراجعة بياناتك من الإدارة وسنتواصل معك عبر واتساب بعد القبول.'
              : 'Your application has been received. Admin will review your details and contact you via WhatsApp after approval.'}
          </p>
          {requestNumber && (
            <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{ar ? 'رقم تتبع طلبك' : 'Your tracking number'}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-[#071B33] font-mono tracking-widest">{requestNumber}</p>
                <button
                  onClick={() => { navigator.clipboard?.writeText(requestNumber); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (ar ? 'تم النسخ' : 'Copied!') : (ar ? 'نسخ' : 'Copy')}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">{ar ? 'احتفظ بهذا الرقم لمتابعة حالة طلبك' : 'Save this number to track your request'}</p>
            </div>
          )}
          <button onClick={() => window.history.back()}
            className="w-full text-white font-bold py-3.5 rounded-2xl text-sm transition-colors active:scale-95"
            style={{ background: 'linear-gradient(135deg, #0e5c6d 0%, #072a36 100%)' }}>
            {ar ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ECEEF2] pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'انضم كمورد مستلزمات' : 'Join as Supplier'} />

      <main className="pt-20 pb-12 px-4 max-w-[480px] mx-auto">

      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-[#071B33]/8 px-4 py-1.5 rounded-full mb-3">
          <Package className="w-4 h-4 text-[#071B33]" />
          <span className="text-xs font-bold text-[#071B33]">{ar ? 'تسجيل مورد مستلزمات' : 'Supplier Registration'}</span>
        </div>
        <h1 className="text-lg font-bold text-[#071B33] mb-1">{ar ? 'نموذج تسجيل الموردين' : 'Supplier Registration Form'}</h1>
        <p className="text-gray-500 text-sm">{ar ? 'أكمل جميع البيانات المطلوبة للانضمام إلى المنصة كمورد' : 'Complete all required fields to join the platform as a supplier'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── 1. شعار النشاط ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <SectionTitle icon={Camera} step={1}>{ar ? 'شعار النشاط' : 'Business Logo'}</SectionTitle>
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-28 h-28 rounded-2xl border-4 border-[#FF7900]/20 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-100"
              onClick={() => !uploading && logoInputRef.current?.click()}
            >
              {(logoPreview || logo) ? (
                <img src={logoPreview || getFileUrl(logo)} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0e5c6d] to-[#072a36] flex items-center justify-center rounded-2xl">
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
                {(logoPreview || logo)
                  ? (ar ? 'تغيير الشعار' : 'Change Logo')
                  : (ar ? '🏪 أضف شعار نشاطك' : '🏪 Add Your Business Logo')}
              </button>
              <div className="mt-2 rounded-2xl overflow-hidden" dir="rtl">
                <div style={{ height: 3, background: 'linear-gradient(90deg, #FF7900, #FFB347, #FF7900)' }} />
                <div className="px-4 py-3.5" style={{ background: 'linear-gradient(145deg, #071B33 0%, #0d2544 100%)' }}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(255,121,0,0.22)', border: '1.5px solid rgba(255,121,0,0.4)' }}>
                      🏪
                    </div>
                    <div>
                      <p className="text-white font-black text-[14px] leading-tight">
                        {ar ? 'شعارك = أول ما يراه الفنيون والشركات' : 'Your logo = first thing technicians see'}
                      </p>
                      <p className="text-orange-300 text-[11.5px] font-semibold mt-0.5">
                        {ar ? 'نشاطٌ بشعار يُعامَل كمؤسسة لا كبائع عشوائي' : 'A business with a logo looks like a real institution'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {(ar ? [
                      '✦ الأنشطة بشعار تحصل على ثقة الفنيين والشركات أسرع',
                      '✦ شعارك يعكس جدية نشاطك التجاري ومصداقيته',
                      '✦ ارفع شعاراً بجودة عالية وخلفية نظيفة',
                    ] : [
                      '✦ Businesses with logos earn technician & company trust faster',
                      '✦ Your logo reflects the seriousness of your business',
                      '✦ Upload a high-quality logo with a clean background',
                    ]).map((t, i) => (
                      <p key={i} className="text-white/85 text-[11.5px] font-semibold leading-snug">{t}</p>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: 'rgba(255,121,0,0.18)', border: '1px solid rgba(255,121,0,0.35)' }}>
                    <span className="text-orange-300 text-[11px] font-bold">
                      {ar ? '⚡ اختياري — لكنه يُحدث الفارق الأكبر' : '⚡ Optional — but makes the biggest difference'}
                    </span>
                  </div>
                </div>
              </div>
              {(logoPreview || logo) && (
                <button type="button" onClick={() => { setLogo(null); setLogoPreview(null) }}
                  className="text-xs text-red-400 hover:underline mt-2 block mx-auto">
                  {ar ? 'إزالة الشعار' : 'Remove logo'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. معلومات النشاط ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <SectionTitle icon={Building2} step={2}>{ar ? 'معلومات النشاط' : 'Business Information'}</SectionTitle>
          <div className="space-y-4">
            <Field label={ar ? 'اسم النشاط / المحل' : 'Business / Shop Name'} required>
              <input className={inp} required value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                placeholder={ar ? 'مثال: مستلزمات الخليج للأدوات' : 'e.g., Gulf Tools & Supplies'} />
            </Field>
            <Field label={ar ? 'اسم المسؤول' : 'Contact Person'} required>
              <input className={inp} required value={form.contact_name}
                onChange={e => set('contact_name', e.target.value)}
                placeholder={ar ? 'الاسم الكامل' : 'Full name'} />
            </Field>
          </div>
        </div>

        {/* ── 3. بيانات التواصل ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <SectionTitle icon={Phone} step={3}>{ar ? 'بيانات التواصل' : 'Contact Details'}</SectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={ar ? 'رقم الهاتف' : 'Phone'} required>
                <LibyaPhoneInput required value={form.phone} onChange={v => set('phone', v)} />
              </Field>
              <Field label={ar ? 'واتساب' : 'WhatsApp'} required>
                <LibyaPhoneInput
                  required
                  value={form.whatsapp}
                  onChange={v => { set('whatsapp', v); setWhatsappStatus('idle') }}
                  onBlur={handleWhatsappBlur}
                />
                {whatsappStatus === 'checking' && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    {ar ? 'جاري التحقق...' : 'Checking...'}
                  </p>
                )}
                {whatsappStatus === 'available' && (
                  <p className="text-xs text-green-600 font-semibold mt-1">✅ {ar ? 'الرقم متاح، يمكنك المتابعة' : 'Number is available'}</p>
                )}
                {whatsappStatus === 'taken' && (
                  <p className="text-xs text-red-600 font-semibold mt-1">⚠️ {ar ? 'هذا الرقم مسجّل مسبقاً في المنصة' : 'This number is already registered'}</p>
                )}
              </Field>
            </div>
            <div className="rounded-xl border-2 border-red-300 bg-red-50 overflow-hidden">
              <div className="bg-red-500 px-3.5 py-2 flex items-center gap-2">
                <span className="text-white text-base leading-none">📱</span>
                <p className="text-white text-[11px] font-extrabold uppercase tracking-wide">
                  {ar ? 'تنبيه مهم جداً — رقم الواتساب' : 'Critical Notice — WhatsApp Number'}
                </p>
              </div>
              <div className="px-3.5 py-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black text-sm flex-shrink-0 leading-snug">①</span>
                  <p className="text-red-800 text-[12.5px] font-bold leading-snug">
                    {ar
                      ? 'يجب أن يكون الرقم مفعّلاً على واتساب فعلاً — لا تُدخل رقماً عادياً غير مسجّل في واتساب.'
                      : 'The number must be truly active on WhatsApp — do not enter a regular number not registered on WhatsApp.'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black text-sm flex-shrink-0 leading-snug">②</span>
                  <p className="text-red-800 text-[12.5px] font-bold leading-snug">
                    {ar
                      ? 'الفنيون والشركات سيتواصلون معك عبر هذا الرقم مباشرةً — تأكد من أنك متاح ومتجاوب.'
                      : 'Technicians and companies will contact you directly through this number — make sure you are available and responsive.'}
                  </p>
                </div>
              </div>
            </div>
            <Field label={ar ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}>
              <input className={inp} type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="example@email.com" dir="ltr" />
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
                placeholder={ar ? 'الشارع، البناية، رقم المحل...' : 'Street, building, shop number...'} />
            </Field>
          </div>
        </div>

        {/* ── 4. نوع المستلزمات ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <SectionTitle icon={Package} step={4}>{ar ? 'نوع المستلزمات' : 'Supply Type'}</SectionTitle>
          <div className="space-y-4">
            <p className="text-[13px] text-gray-500 -mt-2">
              {ar ? 'اختر التصنيف الأقرب لنشاطك' : 'Select the category that best matches your business'}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {SUPPLY_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => set('supply_type', type.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-sm font-semibold transition-all text-start ${
                    form.supply_type === type.id
                      ? 'border-[#FF7900] bg-[#FF7900]/10 text-[#FF7900]'
                      : 'border-gray-200 bg-gray-50 text-[#071B33] hover:border-gray-300'
                  }`}>
                  <span className="text-xl flex-shrink-0">{type.emoji}</span>
                  <span className="leading-tight">{ar ? type.nameAr : type.nameEn}</span>
                </button>
              ))}
            </div>
            {isOther && (
              <Field label={ar ? 'اكتب نوع المستلزمات' : 'Specify Supply Type'} required>
                <input className={inp}
                  value={form.custom_supply_type}
                  onChange={e => set('custom_supply_type', e.target.value)}
                  placeholder={ar ? 'مثال: مستلزمات أنظمة الري' : 'e.g., Irrigation system supplies'} />
                <p className="text-xs text-gray-400 mt-1">
                  {ar ? 'سيراجع الأدمن هذا الاقتراح عند القبول.' : 'Admin will review this suggestion upon approval.'}
                </p>
              </Field>
            )}
          </div>
        </div>

        {/* ── 5. عن النشاط ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <SectionTitle icon={FileText} step={5}>{ar ? 'عن النشاط' : 'About Your Business'}</SectionTitle>
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 overflow-hidden">
              <div className="bg-gradient-to-l from-violet-600 to-purple-700 px-3.5 py-2 flex items-center gap-2">
                <span className="text-white text-base leading-none">✍️</span>
                <p className="text-white text-[11px] font-extrabold uppercase tracking-wide">
                  {ar ? 'وصف النشاط — اقرأ هذا أولاً' : 'Business Description — Read This First'}
                </p>
              </div>
              <div className="px-3.5 py-3">
                <p className="text-violet-800 text-[12px] font-extrabold mb-2">
                  {ar ? 'كيف تكتب وصفاً يجعل الفنيين والشركات يجدونك؟' : 'How to write a description so technicians and companies find you?'}
                </p>
                <ul className="space-y-1.5 mb-2">
                  {(ar ? [
                    '📦 اذكر جميع المنتجات والمواد التي تبيعها بالتفصيل (أدوات، معدات، قطع غيار، مواد بناء...)',
                    '🏷️ سمّ العلامات التجارية التي تتعامل معها (Bosch، Makita، Hilti، LG...)',
                    '🔧 وضّح من هم عملاؤك المستهدفون (فنيون، مقاولون، أصحاب مشاريع...)',
                    '📍 اذكر منطقتك وإذا كان لديك توصيل أو خدمة ميدانية',
                  ] : [
                    '📦 List all products and materials you sell in detail (tools, equipment, spare parts, building materials...)',
                    '🏷️ Name the brands you carry (Bosch, Makita, Hilti, LG...)',
                    '🔧 Clarify who your target customers are (technicians, contractors, project owners...)',
                    '📍 Mention your area and whether you offer delivery or field service',
                  ]).map((item, i) => (
                    <li key={i} className="text-[12px] text-violet-700 font-semibold leading-snug list-none">{item}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-violet-500 font-bold border-t border-violet-200 pt-2">
                  {ar
                    ? '💡 الوصف الدقيق يجعل الفنيين والشركات يجدونك بسهولة — كن واضحاً ومفصّلاً'
                    : '💡 A precise description helps technicians and companies find you easily — be clear and detailed'}
                </p>
              </div>
            </div>
            <Field label={ar ? 'وصف النشاط' : 'Business Description'}>
              <textarea className={inp + ' min-h-[130px] resize-none'} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder={ar
                  ? 'مثال: نبيع أدوات كهربائية من ماركات Bosch وMakita وHilti، ومعدات ورش، وقطع غيار للمحركات والمضخات. نوفر خدمة توصيل داخل طرابلس. نخدم الفنيين والمقاولين وأصحاب المشاريع.'
                  : 'Example: We sell electrical tools from Bosch, Makita, and Hilti, workshop equipment, and spare parts for motors and pumps. We offer delivery within Tripoli. We serve technicians, contractors, and project owners.'} />
            </Field>

            {/* Shop images — max 3 */}
            <div className="rounded-2xl overflow-hidden" dir="rtl">
              <div style={{ height: 3, background: 'linear-gradient(90deg, #FF7900, #FFB347, #FF7900)' }} />
              <div className="px-4 py-3.5" style={{ background: 'linear-gradient(145deg, #071B33 0%, #0d2544 100%)' }}>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(255,121,0,0.22)', border: '1.5px solid rgba(255,121,0,0.4)' }}>
                    📦
                  </div>
                  <div>
                    <p className="text-white font-black text-[14px] leading-tight">
                      {ar ? 'أظهر بضاعتك — من يرى يثق، من يثق يشتري' : 'Show your goods — seeing is believing, believing is buying'}
                    </p>
                    <p className="text-orange-300 text-[11.5px] font-semibold mt-0.5">
                      {ar ? 'الفنيون يختارون المورد الذي يرون منتجاته بوضوح' : 'Technicians choose the supplier whose products they can see'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {(ar ? [
                    '✦ أضف صوراً للمحل من الداخل أو للمنتجات التي تبيعها',
                    '✦ صور المنتجات الحقيقية تبني الثقة وتُغني عن الوصف',
                    '✦ الموردون بصور يُفضَّلون على غيرهم دائماً',
                  ] : [
                    '✦ Add photos of your shop interior or the products you sell',
                    '✦ Real product photos build trust and eliminate doubt',
                    '✦ Suppliers with photos are always preferred over those without',
                  ]).map((t, i) => (
                    <p key={i} className="text-white/85 text-[11.5px] font-semibold leading-snug">{t}</p>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: 'rgba(255,121,0,0.18)', border: '1px solid rgba(255,121,0,0.35)' }}>
                  <span className="text-orange-300 text-[11px] font-bold">
                    {ar ? '⚡ اختياري — لكنه يُحدث الفارق الأكبر' : '⚡ Optional — but makes the biggest difference'}
                  </span>
                </div>
              </div>
            </div>
            <Field label={ar ? 'صور المحل أو المنتجات (اختياري — حتى 3 صور)' : 'Shop / Product Photos (Optional — max 3)'}>
              <div className="flex gap-2 flex-wrap">
                {shopPreviews.map((src, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 w-24 h-24 flex-shrink-0">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeShopImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {shopPreviews.length < 3 && (
                  <label className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-[#FF7900] cursor-pointer bg-[#FF7900]/8 hover:bg-[#FF7900]/15 active:scale-95 transition-all flex-shrink-0 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-[#FF7900]/15 flex items-center justify-center mb-1">
                      <Plus className="w-5 h-5 text-[#FF7900]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[#FF7900] text-[11px] font-bold">{ar ? 'أضف صورة' : 'Add'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleShopImages} />
                  </label>
                )}
              </div>
            </Field>
          </div>
        </div>

        {/* ── 6. التواصل الاجتماعي (اختياري) ─────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <SectionTitle icon={Facebook} step={6}>{ar ? 'التواصل الاجتماعي (اختياري)' : 'Social Media (Optional)'}</SectionTitle>
          <div className="space-y-4">
            <Field label="Facebook">
              <input className={inp} value={form.facebook} onChange={e => set('facebook', e.target.value)}
                placeholder="https://facebook.com/..." dir="ltr" />
            </Field>
            <Field label="Instagram">
              <input className={inp} value={form.instagram} onChange={e => set('instagram', e.target.value)}
                placeholder="https://instagram.com/..." dir="ltr" />
            </Field>
            <Field label="TikTok">
              <input className={inp} value={form.tiktok} onChange={e => set('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@..." dir="ltr" />
            </Field>
          </div>
        </div>

        {/* ── الموقع على الخريطة ───────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200 [border-top:3px_solid_#FF7900]">
          <div className="flex items-center gap-2 mb-1">
            <MapPinIcon className="w-5 h-5 text-[#FF7900]" />
            <h3 className="font-bold text-[#071B33] text-base">
              {ar ? 'موقع النشاط على الخريطة' : 'Business Location on Map'}
              <span className="text-gray-400 text-xs font-normal mr-1.5">{ar ? '(اختياري)' : '(optional)'}</span>
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            {ar
              ? 'يساعد تحديد الموقع الفنيين والشركات القريبة منك في إيجادك بسرعة أكبر عبر ميزة "الأقرب إليّ".'
              : 'Pinning your location helps nearby technicians and companies find you faster via the "Near Me" feature.'}
          </p>
          <LocationPicker value={location} onChange={setLocation} ar={ar} />
        </div>

        {/* ── الإقرار والإرسال ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" required className="w-5 h-5 mt-0.5 accent-[#FF7900] flex-shrink-0"
              checked={form.terms} onChange={e => set('terms', e.target.checked)} />
            <span className="text-sm text-gray-600 leading-relaxed">
              {ar
                ? 'أقر بصحة جميع البيانات المدخلة، وأوافق على شروط الاستخدام وسياسة الخصوصية لمنصة اطلب فني.'
                : "I confirm all entered information is accurate and agree to Otlob Fanni's Terms of Service and Privacy Policy."}
            </span>
          </label>

          <button type="submit" disabled={saving || uploading > 0}
            className="mt-5 w-full font-extrabold py-4 rounded-2xl text-base transition-all active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white"
            style={{ background: 'linear-gradient(135deg, #0e5c6d 0%, #072a36 100%)' }}>
            {saving
              ? (ar ? 'جارٍ الإرسال...' : 'Submitting...')
              : uploading > 0
                ? (ar ? 'جارٍ رفع الصور...' : 'Uploading images...')
                : (ar ? 'إرسال الطلب' : 'Submit Application')}
          </button>

          <div className="flex items-center gap-2 mt-3 justify-center">
            <span className="text-gray-400 text-xs">🔒</span>
            <p className="text-[11px] text-gray-400">
              {ar ? 'طلبك سيبقى قيد المراجعة حتى موافقة الإدارة' : 'Your application will be reviewed by admin before publishing'}
            </p>
          </div>
        </div>

      </form>
    </main>
    </div>
  )
}
