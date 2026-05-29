import { useState, useRef } from 'react'
import { X, Send, CheckCircle, Loader2, ClipboardList, Camera, XCircle } from 'lucide-react'
import { api } from '../lib/api'

const REQUEST_TYPES_AR = [
  'فحص ومعاينة',
  'صيانة',
  'تركيب',
  'إصلاح عاجل',
  'استشارة',
  'طلب عرض سعر',
  'أخرى',
]
const REQUEST_TYPES_EN = [
  'Inspection',
  'Maintenance',
  'Installation',
  'Emergency Repair',
  'Consultation',
  'Price Quote',
  'Other',
]

const OWNER_TYPE_LABEL_AR = {
  technician: 'الفني',
  company: 'الشركة',
  supplier: 'المورد',
}

const MAX_PHOTOS = 3

async function uploadPhoto(file) {
  const urlRes = await fetch('/api/storage/uploads/request-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  })
  if (!urlRes.ok) throw new Error('Failed to get upload URL')
  const { uploadURL, objectPath } = await urlRes.json()
  const putRes = await fetch(uploadURL, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!putRes.ok) throw new Error('Failed to upload photo')
  return objectPath
}

function buildWhatsAppMsg(form, ownerName, profileUrl, ar, photoServingUrls) {
  const photoSection = photoServingUrls.length > 0
    ? (ar ? `\n📷 الصور:\n` : `\n📷 Photos:\n`) + photoServingUrls.map((u, i) => `• ${u}`).join('\n')
    : ''

  if (ar) {
    return `طلب خدمة جديد من اطلب فني 🔧\n\n` +
      `الاسم: ${form.customerName}\n` +
      `الهاتف: ${form.phone}\n` +
      `المدينة: ${form.cityName}\n` +
      `نوع الطلب: ${form.requestType}\n` +
      (form.preferredDatetime ? `التاريخ المفضل: ${form.preferredDatetime}\n` : '') +
      (form.description ? `الوصف: ${form.description}\n` : '') +
      photoSection +
      `\nرابط الملف الشخصي: ${profileUrl}`
  }
  return `New Service Request via OtlobFanni 🔧\n\n` +
    `Name: ${form.customerName}\n` +
    `Phone: ${form.phone}\n` +
    `City: ${form.cityName}\n` +
    `Request Type: ${form.requestType}\n` +
    (form.preferredDatetime ? `Preferred Time: ${form.preferredDatetime}\n` : '') +
    (form.description ? `Description: ${form.description}\n` : '') +
    photoSection +
    `\nProfile: ${profileUrl}`
}

export default function RequestFormModal({
  open, onClose,
  ownerType, ownerId, ownerName, ownerWhatsapp,
  profileUrl, ar
}) {
  const [form, setForm] = useState({
    customerName: '', phone: '', cityName: '', requestType: '', description: '', preferredDatetime: '',
  })
  const [photos, setPhotos] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  if (!open) return null

  const types = ar ? REQUEST_TYPES_AR : REQUEST_TYPES_EN

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      objectPath: null,
    }))
    setPhotos(prev => [...prev, ...toAdd])
    e.target.value = ''
  }

  const removePhoto = (idx) => {
    setPhotos(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].preview)
      next.splice(idx, 1)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!form.customerName.trim()) { setError(ar ? 'الاسم مطلوب' : 'Name is required'); return }
    if (!form.phone.trim())        { setError(ar ? 'رقم الهاتف مطلوب' : 'Phone is required'); return }
    if (!form.requestType)         { setError(ar ? 'نوع الطلب مطلوب' : 'Request type is required'); return }
    setError('')
    setSubmitting(true)
    try {
      let uploadedPaths = []
      if (photos.length > 0) {
        uploadedPaths = await Promise.all(photos.map(p => uploadPhoto(p.file)))
      }
      const servingUrls = uploadedPaths.map(p => `${window.location.origin}/api/storage${p}`)

      await api.createServiceRequest({
        ownerId, ownerType,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        cityName: form.cityName.trim(),
        requestType: form.requestType,
        description: form.description.trim(),
        preferredDatetime: form.preferredDatetime.trim(),
        photoUrls: servingUrls.length > 0 ? servingUrls : undefined,
      })
      setDone(true)
      const clean = (ownerWhatsapp || '').replace(/\D/g, '')
      const waNum = clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
      const msg = buildWhatsAppMsg(form, ownerName, profileUrl, ar, servingUrls)
      setTimeout(() => {
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank')
      }, 400)
    } catch {
      setError(ar ? 'حدث خطأ، حاول مجدداً' : 'Something went wrong, try again')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview))
    setForm({ customerName: '', phone: '', cityName: '', requestType: '', description: '', preferredDatetime: '' })
    setPhotos([])
    setDone(false)
    setError('')
    onClose()
  }

  const ownerLabel = ar ? (OWNER_TYPE_LABEL_AR[ownerType] || 'المهني') : ownerName

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir={ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[calc(90dvh-72px)] overflow-y-auto mb-[72px]">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(255,121,0,0.15), rgba(255,121,0,0.05))', border: '1px solid rgba(255,121,0,0.2)' }}>
              <ClipboardList className="w-4 h-4 text-[#FF7900]" />
            </div>
            <div>
              <p className="font-black text-[#071B33] text-sm leading-tight">{ar ? 'أرسل طلب خدمة' : 'Request Service'}</p>
              <p className="text-[11px] text-gray-400">{ar ? `إلى ${ownerLabel}` : `To ${ownerLabel}`}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="font-black text-[#071B33] text-lg mb-1">
                {ar ? 'تم إرسال طلبك!' : 'Request Sent!'}
              </p>
              <p className="text-sm text-gray-500">
                {ar
                  ? 'تم حفظ طلبك وسيتم فتح واتساب لإرساله مباشرة'
                  : 'Your request is saved. WhatsApp is opening to send it directly.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-8 py-3 bg-[#FF7900] text-white font-bold rounded-2xl active:scale-95 transition-transform text-sm">
              {ar ? 'حسناً' : 'Done'}
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3.5">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? 'اسمك *' : 'Your Name *'}
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                placeholder={ar ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] transition-colors"
                dir={ar ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? 'رقم هاتفك *' : 'Your Phone *'}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="09XXXXXXXX"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] transition-colors"
                dir="ltr"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? 'مدينتك / منطقتك' : 'Your City / Area'}
              </label>
              <input
                type="text"
                value={form.cityName}
                onChange={e => setForm(f => ({ ...f, cityName: e.target.value }))}
                placeholder={ar ? 'مثال: طرابلس، السياحية' : 'e.g. Tripoli, Hay Andalus'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] transition-colors"
                dir={ar ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Request Type */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? 'نوع الطلب *' : 'Request Type *'}
              </label>
              <div className="flex flex-wrap gap-2">
                {types.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, requestType: ar ? REQUEST_TYPES_AR[i] : REQUEST_TYPES_EN[i] }))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
                    style={form.requestType === (ar ? REQUEST_TYPES_AR[i] : REQUEST_TYPES_EN[i])
                      ? { background: 'linear-gradient(135deg, #FF7900, #FF9500)', color: 'white', borderColor: '#FF7900' }
                      : { background: '#F8FAFC', color: '#64748B', borderColor: '#E8EDF2' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred datetime */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? 'الوقت المفضل (اختياري)' : 'Preferred Time (optional)'}
              </label>
              <input
                type="text"
                value={form.preferredDatetime}
                onChange={e => setForm(f => ({ ...f, preferredDatetime: e.target.value }))}
                placeholder={ar ? 'مثال: الخميس صباحاً أو 15/6 بعد الظهر' : 'e.g. Thursday morning or June 15 afternoon'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] transition-colors"
                dir={ar ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? 'وصف الطلب (اختياري)' : 'Description (optional)'}
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={ar ? 'اكتب تفاصيل إضافية هنا...' : 'Write additional details here...'}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF7900] transition-colors resize-none"
                dir={ar ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                {ar ? `أضف صور (اختياري — حتى ${MAX_PHOTOS})` : `Add Photos (optional — up to ${MAX_PHOTOS})`}
              </label>

              {/* Thumbnails row */}
              {photos.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                        <XCircle className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add button — only show if under limit */}
              {photos.length < MAX_PHOTOS && (
                <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500">
                    {ar ? 'اختر صورة' : 'Choose photo'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <p className="text-[11px] text-gray-400 text-center">
              {ar
                ? '✅ سيتم حفظ طلبك في المنصة وفتح واتساب تلقائياً'
                : '✅ Your request will be saved and WhatsApp will open automatically'}
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)', boxShadow: '0 4px 16px rgba(255,121,0,0.3)' }}>
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {ar ? 'جاري الإرسال...' : 'Sending...'}</>
                : <><Send className="w-4 h-4" /> {ar ? 'أرسل الطلب' : 'Send Request'}</>
              }
            </button>

            <div className="pb-2" />
          </div>
        )}
      </div>
    </div>
  )
}
