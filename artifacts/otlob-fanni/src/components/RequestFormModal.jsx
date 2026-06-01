import { useState, useRef, useEffect } from 'react'
import { X, CheckCircle, Loader2, Camera, XCircle, Wrench, Building2, Package,
         Zap, Search, Hammer, MessageSquare, DollarSign, Phone, User, MapPin,
         Calendar, FileText, ChevronRight, Send, Star, ShieldCheck, Clock } from 'lucide-react'
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
      `📞 الهاتف: ${form.phone}\n` +
      `📍 المدينة: ${form.cityName || '—'}\n` +
      `🛠 نوع الطلب: ${form.requestType}\n` +
      (form.preferredDatetime ? `🗓 الوقت المفضل: ${form.preferredDatetime}\n` : '') +
      (form.description ? `📝 التفاصيل: ${form.description}\n` : '') +
      photos +
      `\n🔗 الملف الشخصي: ${profileUrl}`
  }
  return `🔧 New Service Request — OtlobFanni\n\n` +
    `👤 Name: ${form.customerName}\n` +
    `📞 Phone: ${form.phone}\n` +
    `📍 City: ${form.cityName || '—'}\n` +
    `🛠 Type: ${form.requestType}\n` +
    (form.preferredDatetime ? `🗓 Preferred Time: ${form.preferredDatetime}\n` : '') +
    (form.description ? `📝 Details: ${form.description}\n` : '') +
    photos +
    `\n🔗 Profile: ${profileUrl}`
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
    customerName: '', phone: '', cityName: '', requestType: '',
    description: '', preferredDatetime: '',
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

  const handleSubmit = async () => {
    if (!form.customerName.trim()) { setError(ar ? 'الاسم مطلوب' : 'Name required'); return }
    if (!form.phone.trim())        { setError(ar ? 'رقم الهاتف مطلوب' : 'Phone required'); return }
    if (!form.requestType)         { setError(ar ? 'اختر نوع الطلب' : 'Select request type'); return }
    setError(''); setSub(true)

    const clean  = (ownerWhatsapp || '').replace(/\D/g, '')
    const waNum  = clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
    const waWin  = window.open('about:blank', '_blank')

    try {
      let paths = []
      if (photos.length) paths = await Promise.all(photos.map(p => uploadPhoto(p.file)))
      const servingUrls = paths.map(p => `${window.location.origin}/api/storage${p}`)

      await api.createServiceRequest({
        ownerId, ownerType,
        customerName:      form.customerName.trim(),
        phone:             form.phone.trim(),
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
    setForm({ customerName:'', phone:'', cityName:'', requestType:'', description:'', preferredDatetime:'' })
    setPhotos([]); setDone(false); setError(''); onClose()
  }

  const EntityIcon = meta.icon

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir={ar ? 'rtl' : 'ltr'}>
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
              {/* Entity avatar */}
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

          {/* Decorative line */}
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
                  { label: ar ? 'الاسم' : 'Name',        val: form.customerName },
                  { label: ar ? 'الهاتف' : 'Phone',      val: form.phone },
                  { label: ar ? 'نوع الطلب' : 'Type',   val: form.requestType },
                ].map(({ label, val }) => val ? (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{label}</span>
                    <span className="text-xs font-extrabold text-[#071B33]">{val}</span>
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
            <div className="px-5 py-5 space-y-5">

              {/* ── Name + Phone row ── */}
              <div className="grid grid-cols-2 gap-3">
                <InputField label={ar ? 'الاسم' : 'Name'} icon={User} required>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    placeholder={ar ? 'أحمد محمد' : 'Ahmed Mohamed'}
                    className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-300 focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
                    onFocus={e => e.target.style.borderColor = '#FF7900'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    dir={ar ? 'rtl' : 'ltr'}
                  />
                </InputField>
                <InputField label={ar ? 'الهاتف' : 'Phone'} icon={Phone} required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="09XXXXXXXX"
                    className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-300 focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
                    onFocus={e => e.target.style.borderColor = '#FF7900'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    dir="ltr"
                  />
                </InputField>
              </div>

              {/* ── City ── */}
              <InputField label={ar ? 'المدينة / المنطقة' : 'City / Area'} icon={MapPin}>
                <input
                  type="text"
                  value={form.cityName}
                  onChange={e => setForm(f => ({ ...f, cityName: e.target.value }))}
                  placeholder={ar ? 'طرابلس، السياحية...' : 'Tripoli, Hay Andalus...'}
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-300 focus:outline-none transition-all"
                  style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
                  onFocus={e => e.target.style.borderColor = '#FF7900'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </InputField>

              {/* ── Request Type — Icon Cards ── */}
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
                          background: '#F8FAFC',
                          border: '1.5px solid #E8EDF2',
                        }}>
                        {selected && (
                          <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: t.color }}>
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                          style={{ background: selected ? `${t.color}20` : '#EEF2F7' }}>
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
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-300 focus:outline-none transition-all"
                  style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
                  onFocus={e => e.target.style.borderColor = '#FF7900'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
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
                  className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold text-[#071B33] placeholder:text-slate-300 focus:outline-none transition-all resize-none"
                  style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
                  onFocus={e => e.target.style.borderColor = '#FF7900'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </InputField>

              {/* ── Photo Upload ── */}
              <InputField label={ar ? `صور المشكلة (حتى ${MAX_PHOTOS})` : `Photos (up to ${MAX_PHOTOS})`} icon={Camera}>
                <div className="flex gap-2 flex-wrap">
                  {/* Thumbnails */}
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
                  {/* Add button */}
                  {photos.length < MAX_PHOTOS && (
                    <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer flex-shrink-0 transition-colors hover:border-[#FF7900] hover:bg-[#FF7900]/5"
                      style={{ border: '2px dashed #CBD5E1', background: '#F8FAFC' }}>
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-400">
                        {ar ? 'أضف' : 'Add'}
                      </span>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </InputField>

              {/* ── Error ── */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-xs font-bold">{error}</p>
                </div>
              )}

              {/* ── Trust line ── */}
              <div className="flex items-center justify-center gap-2 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[11px] text-slate-400 font-semibold">
                  {ar
                    ? 'بياناتك محمية ولن تُشارك مع أي طرف آخر'
                    : 'Your data is protected and will not be shared'}
                </p>
              </div>

              {/* ── Submit ── */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-60 text-sm"
                style={{
                  background: 'linear-gradient(135deg, #FF7900 0%, #FF9500 100%)',
                  boxShadow: '0 6px 24px rgba(255,121,0,0.4)',
                }}>
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{ar ? 'جاري الإرسال...' : 'Sending...'}</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {ar ? 'إرسال الطلب عبر واتساب' : 'Send via WhatsApp'}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/80">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </>
                )}
              </button>
              <div className="pb-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
