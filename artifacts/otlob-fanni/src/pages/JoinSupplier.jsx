import { useState, useRef, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import LocationPicker from '../components/LocationPicker'
import { SUPPLY_TYPES } from '../data/suppliers'
import { CheckCircle, Camera, X, Upload, Building2, Phone, FileText, Facebook, Copy, Check, Package, MapPin as MapPinIcon } from 'lucide-react'
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
      <BackHeader title={ar ? 'انضم كمزود مستلزمات' : 'Join as Supplier'} />

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4 max-w-[600px] mx-auto">

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
              <div className="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 text-right">
                <span className="text-lg flex-shrink-0 leading-none">⭐</span>
                <div>
                  <p className="text-xs font-bold text-orange-900 leading-snug">
                    {ar
                      ? 'الأنشطة التي تعرض شعارها تبدو أكثر احترافية وتكسب ثقة الفنيين والشركات بشكل أسرع'
                      : 'Businesses with a logo appear more professional and gain trust from technicians & companies faster'}
                  </p>
                  <p className="text-[11px] text-orange-500 font-semibold mt-0.5">
                    {ar ? 'اختياري — لكنه يُحدث فارقاً كبيراً ✓' : 'Optional — but makes a big difference ✓'}
                  </p>
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
                <LibyaPhoneInput required value={form.whatsapp} onChange={v => set('whatsapp', v)} />
              </Field>
            </div>
            <div className="flex gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-3">
              <span className="text-amber-500 text-lg leading-none flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-amber-800 text-[12.5px] font-semibold leading-relaxed">
                {ar
                  ? 'رقم الواتساب إجباري ويجب أن يكون مفعّلاً على واتساب — التواصل سيتم عبر واتساب فقط.'
                  : 'WhatsApp number is required and must be active — all communication will be via WhatsApp only.'}
              </p>
            </div>
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
            <Field label={ar ? 'وصف النشاط' : 'Business Description'}
              hint={ar ? 'اذكر المنتجات الرئيسية التي تبيعها والعلامات التجارية إن وجدت' : 'Mention your main products and brands if any'}>
              <textarea className={inp} rows={3} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder={ar ? 'مثال: نبيع أدوات كهربائية من ماركات Bosch وMakita ومعدات ورش متنوعة...' : 'e.g., We sell Bosch and Makita electrical tools and various workshop equipment...'} />
            </Field>

            {/* Shop images — max 3 */}
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
                  <label className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 transition-colors flex-shrink-0">
                    <Upload className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 text-center">{ar ? 'إضافة' : 'Add'}</span>
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
    </div>
  )
}
