import { useState, useRef, useEffect } from 'react'
import { X, CheckCircle, Loader2, Camera, XCircle, Wrench, Building2, Package,
         Zap, Search, Hammer, MessageSquare, DollarSign, Phone, User, MapPin,
         Calendar, FileText, ChevronRight, Send, Star, ShieldCheck, Clock,
         MessageCircle } from 'lucide-react'
import { api } from '../lib/api'

/* ─────────────── Request types per entity ─────────────── */
const REQUEST_TYPES = {
  technician: [
    { ar: 'فحص ومعاينة',    en: 'Inspection',      icon: Search,       color: '#3B82F6' },
    { ar: 'صيانة',           en: 'Maintenance',     icon: Wrench,       color: '#10B981' },
    { ar: 'تركيب',           en: 'Installation',    icon: Hammer,       color: '#8B5CF6' },
    { ar: 'إصلاح عاجل',     en: 'Emergency',       icon: Zap,          color: '#EF4444' },
    { ar: 'استشارة',         en: 'Consultation',    icon: MessageSquare,color: '#F59E0B' },
    { ar: 'طلب عرض سعر',    en: 'Price Quote',     icon: DollarSign,   color: '#06B6D4' },
  ],
  company: [
    { ar: 'مشروع إنشائي',   en: 'Construction',    icon: Building2,    color: '#3B82F6' },
    { ar: 'صيانة دورية',    en: 'Maintenance',     icon: Wrench,       color: '#10B981' },
    { ar: 'تركيب أنظمة',   en: 'Systems Install', icon: Hammer,       color: '#8B5CF6' },
    { ar: 'طوارئ عاجل',    en: 'Emergency',       icon: Zap,          color: '#EF4444' },
    { ar: 'استشارة فنية',  en: 'Consultation',    icon: MessageSquare,color: '#F59E0B' },
    { ar: 'عقد صيانة',     en: 'Service Contract',icon: ShieldCheck,  color: '#06B6D4' },
    { ar: 'طلب عرض سعر',   en: 'Price Quote',     icon: DollarSign,   color: '#FF7900' },
  ],
  supplier: [
    { ar: 'شراء مستلزمات', en: 'Purchase',         icon: Package,      color: '#3B82F6' },
    { ar: 'طلب بالجملة',   en: 'Wholesale Order', icon: Hammer,       color: '#10B981' },
    { ar: 'طلب عرض سعر',   en: 'Price Quote',     icon: DollarSign,   color: '#8B5CF6' },
    { ar: 'استفسار منتج',  en: 'Product Inquiry', icon: Search,       color: '#F59E0B' },
    { ar: 'توريد مشروع',   en: 'Project Supply',  icon: Building2,    color: '#EF4444' },
    { ar: 'استشارة',        en: 'Consultation',    icon: MessageSquare,color: '#06B6D4' },
  ],
}

const ENTITY_META = {
  technician: { ar: 'الفني', en: 'Technician', icon: Wrench,    gradient: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' },
  company:    { ar: 'الشركة', en: 'Company',   icon: Building2, gradient: 'linear-gradient(135deg, #071B33 0%, #1a3a6e 100%)' },
  supplier:   { ar: 'المورد', en: 'Supplier',  icon: Package,   gradient: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)' },
}

async function uploadPhoto(file) {
  const urlRes = await fetch('/api/storage/uploads/request-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  })
  if (!urlRes.ok) throw new Error('Upload URL failed')
  const { uploadURL, objectPath } = await urlRes.json()
  const putRes = await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
  if (!putRes.ok) throw new Error('Upload failed')
  return objectPath
}

function buildWhatsAppMsg(form, ownerName, profileUrl, ar, photoUrls) {
  const photos = photoUrls.length > 0
    ? (ar ? `\n📷 صور:\n` : `\n📷 Photos:\n`) + photoUrls.map(u => `• ${u}`).join('\n')
    : ''
  if (ar) {
    return `🔧 طلب خدمة جديد — اطلب فني\n\n` +
      `👤 الاسم: ${form.customerName}\n` +
      `📱 واتساب: ${form.whatsappPhone}\n` +
      `📞 للاتصال: ${form.callPhone}\n` +
      `📍 المدينة: ${form.cityName || '—'}\n` +
      `🛠 نوع الطلب: ${form.requestType}\n` +
      (form.preferredDatetime ? `🗓 الوقت المفضل: ${form.preferredDatetime}\n` : '') +
      (form.description ? `📝 التفاصيل: ${form.description}\n` : '') +
      photos +
      `\n🔗 الملف الشخصي: ${profileUrl}`
  }
  return `🔧 New Service Request — OtlobFanni\n\n` +
    `👤 Name: ${form.customerName}\n` +
    `📱 WhatsApp: ${form.whatsappPhone}\n` +
    `📞 Call: ${form.callPhone}\n` +
    `📍 City: ${form.cityName || '—'}\n` +
    `🛠 Type: ${form.requestType}\n` +
    (form.preferredDatetime ? `🗓 Preferred Time: ${form.preferredDatetime}\n` : '') +
    (form.description ? `📝 Details: ${form.description}\n` : '') +
    photos +
    `\n🔗 Profile: ${profileUrl}`
}

/* ─────────────── Libyan phone input (inline, styled to match form) ─────────────── */
function LibyaPhoneField({ value, onChange, label, icon: Icon, required, ar }) {
  const local = (value || '').replace(/^\+218/, '').replace(/^00218/, '').replace(/^218/, '')

  function handleChange(e) {
    let raw = e.target.value.replace(/\D/g, '')
    if (raw.startsWith('218')) raw = raw.slice(3)
    if (raw.startsWith('0'))   raw = raw.slice(1)
    onChange(raw ? '+218' + raw : '')
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-[#FF7900]">*</span>}
      </label>
      <div
        className="flex rounded-xl overflow-hidden transition-all"
        style={{ border: '2px solid #94A3B8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', background: '#FFFFFF' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = '#FF7900'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,121,0,0.15)' }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
        dir="ltr"
      >
        <span className="flex items-center px-3 bg-slate-50 text-[#071B33] font-black text-sm border-r border-slate-200 select-none whitespace-nowrap">
          🇱🇾 +218
        </span>
        <input
          type="tel"
          value={local}
          onChange={handleChange}
          placeholder="91 0000000"
          inputMode="numeric"
          maxLength={9}
          dir="ltr"
          className="flex-1 bg-transparent outline-none px-3 py-3 text-sm font-semibold text-[#071B33] placeholder-slate-400"
        />
      </div>
      <p className="text-[10px] text-slate-400 px-0.5" dir={ar ? 'rtl' : 'ltr'}>
        {ar ? 'الرقم المحلي فقط (91، 92، 94...)' : 'Local number only (91, 92, 94…)'}
      </p>
    </div>
  )
}

/* ─────────────── InputField ─────────────── */
function InputField({ label, icon: Icon, children, required }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-[#FF7900]">*</span>}
      </label>
      {children}
    </div>
  )
}

/* ─────────────── Main Modal ─────────────── */
export default function RequestFormModal({
  open, onClose,
  ownerType, ownerId, ownerName, ownerWhatsapp,
  profileUrl, ar,
  ownerRating, ownerVerified,
}) {
  const meta   = ENTITY_META[ownerType] || ENTITY_META.technician
  const types  = REQUEST_TYPES[ownerType] || REQUEST_TYPES.technician
  const MAX_PHOTOS = 3

  const [form, setForm] = useState({
    customerName: '', whatsappPhone: '', callPhone: '',
    cityName: '', requestType: '', description: '', preferredDatetime: '',
  })
  const [photos, setPhotos]     = useState([])
  const [submitting, setSub]    = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')
  const [mounted, setMounted]   = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (open) { setTimeout(() => setMounted(true), 20) }
    else { setMounted(false) }
  }, [open])

  if (!open) return null

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const toAdd = files.slice(0, MAX_PHOTOS - photos.length).map(f => ({
      file: f, preview: URL.createObjectURL(f),
    }))
    setPhotos(p => [...p, ...toAdd])
    e.target.value = ''
  }

  const removePhoto = (i) => {
    setPhotos(p => { const n = [...p]; URL.revokeObjectURL(n[i].preview); n.splice(i,1); return n })
  }

  const validateLibyaPhone = (v) => {
    const digits = (v || '').replace(/\D/g,'')
    return digits.length >= 10
  }

  const handleSubmit = async () => {
    if (!form.customerName.trim())            { setError(ar ? 'الاسم مطلوب' : 'Name required'); return }
    if (!validateLibyaPhone(form.whatsappPhone)) { setError(ar ? 'رقم الواتساب مطلوب (91، 92، 94...)' : 'WhatsApp number required'); return }
    if (!validateLibyaPhone(form.callPhone))     { setError(ar ? 'رقم الاتصال مطلوب (91، 92، 94...)' : 'Call number required'); return }
    if (!form.requestType)                    { setError(ar ? 'اختر نوع الطلب' : 'Select request type'); return }
    setError(''); setSub(true)

    const clean  = (ownerWhatsapp || form.whatsappPhone || '').replace(/\D/g, '')
    const waNum  = clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
    const waWin  = window.open('about:blank', '_blank')

    try {
      let paths = []
      if (photos.length) paths = await Promise.all(photos.map(p => uploadPhoto(p.file)))
      const servingUrls = paths.map(p => `${window.location.origin}/api/storage${p}`)

      await api.createServiceRequest({
        ownerId, ownerType,
        customerName:      form.customerName.trim(),
        whatsappPhone:     form.whatsappPhone,
        callPhone:         form.callPhone,
        phone:             form.whatsappPhone,
        cityName:          form.cityName.trim(),
        requestType:       form.requestType,
        description:       form.description.trim(),
        preferredDatetime: form.preferredDatetime.trim(),
        photoUrls:         servingUrls.length ? servingUrls : undefined,
      })
      setDone(true)
      const msg = buildWhatsAppMsg(form, ownerName, profileUrl, ar, servingUrls)
      if (waWin) waWin.location.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`
      else setTimeout(() => window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank'), 100)
    } catch {
      if (waWin) waWin.close()
      setError(ar ? 'حدث خطأ، حاول مجدداً' : 'Something went wrong, try again')
    } finally { setSub(false) }
  }

  const handleClose = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview))
    setForm({ customerName:'', whatsappPhone:'', callPhone:'', cityName:'', requestType:'', description:'', preferredDatetime:'' })
    setPhotos([]); setDone(false); setError(''); onClose()
  }

  const EntityIcon = meta.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" dir={ar ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: mounted ? 'rgba(7,27,51,0.65)' : 'transparent', backdropFilter: mounted ? 'blur(4px)' : 'none' }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[500px] bg-white rounded-t-[28px] shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: 'calc(94dvh - 56px)',
          marginBottom: 56,
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(7,27,51,0.12)' }} />
        </div>

        {/* ── HEADER ── */}
        <div className="flex-shrink-0 px-5 pt-3 pb-5" style={{ background: meta.gradient }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                <EntityIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/70 text-[11px] font-bold tracking-widest uppercase mb-0.5">
                  {ar ? 'طلب خدمة' : 'Service Request'}
                </p>
                <p className="text-white font-black text-base leading-tight truncate">{ownerName}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {ownerVerified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {ar ? 'موثّق' : 'Verified'}
                    </span>
                  )}
                  {ownerRating && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      {ownerRating}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5" />
                    {ar ? 'يرد خلال ساعات' : 'Replies within hours'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <p className="text-white/50 text-[10px] font-semibold tracking-wider">
              {ar ? 'أكمل البيانات أدناه' : 'FILL IN YOUR DETAILS'}
            </p>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          {done ? (
            /* ── SUCCESS ── */
            <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 12px 40px rgba(16,185,129,0.35)' }}>
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#FF7900', boxShadow: '0 4px 12px rgba(255,121,0,0.4)' }}>
                  <span className="text-white text-sm">🎉</span>
                </div>
              </div>
              <div>
                <p className="font-black text-[#071B33] text-xl mb-2">
                  {ar ? 'تم إرسال طلبك!' : 'Request Sent!'}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                  {ar
                    ? 'طلبك محفوظ في المنصة وتم فتح واتساب لإرساله مباشرةً إلى المهني'
                    : 'Your request is saved. WhatsApp opened to send it directly to the professional.'}
                </p>
              </div>
              <div className="w-full max-w-[280px] rounded-2xl p-4 text-right space-y-2"
                style={{ background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', border: '1px solid #E2E8F0' }}>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  {ar ? 'ملخص الطلب' : 'Request Summary'}
                </p>
                {[
                  { label: ar ? 'الاسم' : 'Name',           val: form.customerName },
                  { label: ar ? 'واتساب' : 'WhatsApp',      val: form.whatsappPhone },
                  { label: ar ? 'للاتصال' : 'Call',         val: form.callPhone },
                  { label: ar ? 'نوع الطلب' : 'Type',       val: form.requestType },
                ].map(({ label, val }) => val ? (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{label}</span>
                    <span className="text-xs font-extrabold text-[#071B33]" dir="ltr">{val}</span>
                  </div>
                ) : null)}
              </div>
              <button onClick={handleClose}
                className="w-full max-w-[280px] py-3.5 rounded-2xl text-white font-black text-sm active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)', boxShadow: '0 6px 20px rgba(255,121,0,0.35)' }}>
                {ar ? 'إغلاق' : 'Close'}
              </button>
            </div>
          ) : (
            <div className="px-5 py-5 space-y-5" style={{ background: '#F5F7FA' }}>

              {/* ── Name ── */}
              <InputField label={ar ? 'الاسم' : 'Name'} icon={User} required>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder={ar ? 'أحمد محمد' : 'Ahmed Mohamed'}
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-400 focus:outline-none transition-all"
                  style={{ background: '#FFFFFF', border: '2px solid #94A3B8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  onFocus={e => { e.target.style.borderColor = '#FF7900'; e.target.style.boxShadow = '0 0 0 3px rgba(255,121,0,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#94A3B8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </InputField>

              {/* ── WhatsApp + Call phones ── */}
              <div className="grid grid-cols-2 gap-3">
                <LibyaPhoneField
                  value={form.whatsappPhone}
                  onChange={v => setForm(f => ({ ...f, whatsappPhone: v }))}
                  label={ar ? 'واتساب' : 'WhatsApp'}
                  icon={MessageCircle}
                  required
                  ar={ar}
                />
                <LibyaPhoneField
                  value={form.callPhone}
                  onChange={v => setForm(f => ({ ...f, callPhone: v }))}
                  label={ar ? 'للاتصال' : 'Call'}
                  icon={Phone}
                  required
                  ar={ar}
                />
              </div>

              {/* ── City ── */}
              <InputField label={ar ? 'المدينة / المنطقة' : 'City / Area'} icon={MapPin}>
                <input
                  type="text"
                  value={form.cityName}
                  onChange={e => setForm(f => ({ ...f, cityName: e.target.value }))}
                  placeholder={ar ? 'طرابلس، السياحية...' : 'Tripoli, Hay Andalus...'}
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-400 focus:outline-none transition-all"
                  style={{ background: '#FFFFFF', border: '2px solid #94A3B8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  onFocus={e => { e.target.style.borderColor = '#FF7900'; e.target.style.boxShadow = '0 0 0 3px rgba(255,121,0,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#94A3B8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </InputField>

              {/* ── Request Type ── */}
              <InputField label={ar ? 'نوع الطلب' : 'Request Type'} icon={FileText} required>
                <div className="grid grid-cols-3 gap-2">
                  {types.map((t) => {
                    const Icon = t.icon
                    const selected = form.requestType === (ar ? t.ar : t.en)
                    return (
                      <button
                        key={t.ar}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, requestType: ar ? t.ar : t.en }))}
                        className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all active:scale-95 text-center"
                        style={selected ? {
                          background: `linear-gradient(135deg, ${t.color}18, ${t.color}08)`,
                          border: `2px solid ${t.color}`,
                          boxShadow: `0 4px 16px ${t.color}25`,
                        } : {
                          background: '#FFFFFF',
                          border: '2px solid #94A3B8',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}>
                        {selected && (
                          <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: t.color }}>
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                          style={{ background: selected ? `${t.color}20` : '#F1F5F9' }}>
                          <Icon className="w-4.5 h-4.5" style={{ color: selected ? t.color : '#94A3B8', width: 18, height: 18 }} />
                        </div>
                        <span className="text-[10px] font-extrabold leading-tight"
                          style={{ color: selected ? t.color : '#64748B' }}>
                          {ar ? t.ar : t.en}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </InputField>

              {/* ── Preferred Time ── */}
              <InputField label={ar ? 'الوقت المفضل' : 'Preferred Time'} icon={Calendar}>
                <input
                  type="text"
                  value={form.preferredDatetime}
                  onChange={e => setForm(f => ({ ...f, preferredDatetime: e.target.value }))}
                  placeholder={ar ? 'مثال: الخميس صباحاً أو 15/6 بعد الظهر' : 'e.g. Thursday morning or June 15 PM'}
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-400 focus:outline-none transition-all"
                  style={{ background: '#FFFFFF', border: '2px solid #94A3B8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  onFocus={e => { e.target.style.borderColor = '#FF7900'; e.target.style.boxShadow = '0 0 0 3px rgba(255,121,0,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#94A3B8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </InputField>

              {/* ── Description ── */}
              <InputField label={ar ? 'تفاصيل الطلب' : 'Details'} icon={FileText}>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={ar
                    ? 'اشرح المشكلة أو الخدمة المطلوبة بالتفصيل...'
                    : 'Describe the issue or service needed in detail...'}
                  rows={3}
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-400 focus:outline-none transition-all resize-none"
                  style={{ background: '#FFFFFF', border: '2px solid #94A3B8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  onFocus={e => { e.target.style.borderColor = '#FF7900'; e.target.style.boxShadow = '0 0 0 3px rgba(255,121,0,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#94A3B8'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </InputField>

              {/* ── Photo Upload ── */}
              <InputField label={ar ? `صور المشكلة (حتى ${MAX_PHOTOS})` : `Photos (up to ${MAX_PHOTOS})`} icon={Camera}>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: '2px solid #E2E8F0' }}>
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.65)' }}>
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                      style={{ border: '2px dashed #CBD5E1', background: '#FFFFFF' }}>
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-400">
                        {ar ? 'إضافة' : 'Add'}
                      </span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </InputField>

              {/* ── Error ── */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        {!done && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100" style={{ background: '#FFFFFF' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)', boxShadow: '0 6px 20px rgba(255,121,0,0.35)' }}>
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {ar ? 'جاري الإرسال...' : 'Sending...'}</>
              ) : (
                <><Send className="w-5 h-5" /> {ar ? 'ثبّت الطلب وافتح واتساب' : 'Confirm & Open WhatsApp'}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
