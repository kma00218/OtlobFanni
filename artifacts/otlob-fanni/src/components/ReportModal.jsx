import { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { uploadFile } from '../lib/api'

const REQUEST_TYPES = [
  { id: 'data_update',        ar: 'تحديث بيانات',        en: 'Data Update' },
  { id: 'wrong_number',       ar: 'رقم هاتف غير صحيح',   en: 'Wrong Number' },
  { id: 'not_available',      ar: 'النشاط غير متوفر',     en: 'Not Available' },
  { id: 'city_correction',    ar: 'تصحيح المدينة',        en: 'City Correction' },
  { id: 'specialty_correction',ar: 'تصحيح التخصص',       en: 'Specialty Correction' },
  { id: 'other',              ar: 'أخرى',                 en: 'Other' },
]

export default function ReportModal({ open, onClose, entityType, entityId, entityName, city, ar = true }) {
  const [form, setForm]           = useState({ name: '', phone: '', requestType: '', notes: '' })
  const [photos, setPhotos]       = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const paths = await Promise.all(files.map(f => uploadFile(f)))
      setPhotos(prev => [...prev, ...paths])
    } catch { setError(ar ? 'فشل رفع الصورة' : 'Upload failed') }
    setUploading(false)
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.requestType) { setError(ar ? 'اختر نوع الطلب' : 'Select request type'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/update-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type:     entityType,
          entity_id:       entityId,
          entity_name:     entityName,
          city:            city || '',
          requester_name:  form.name || null,
          requester_phone: form.phone || null,
          request_type:    form.requestType,
          notes:           form.notes || null,
          photos,
        }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch { setError(ar ? 'حدث خطأ، حاول مجدداً' : 'Error, try again') }
    setSubmitting(false)
  }

  const close = () => {
    setForm({ name: '', phone: '', requestType: '', notes: '' })
    setPhotos([])
    setDone(false)
    setError('')
    onClose()
  }

  const inp = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors placeholder:text-slate-400'

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={close}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-[#071B33] text-base">
              {ar ? 'تحديث أو إبلاغ' : 'Update or Report'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{entityName}</p>
          </div>
          <button onClick={close} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="font-bold text-[#071B33] text-center">
              {ar ? 'تم إرسال طلبك بنجاح' : 'Request submitted successfully'}
            </p>
            <p className="text-sm text-slate-500 text-center">
              {ar ? 'سيراجعه فريقنا قريباً' : 'Our team will review it soon'}
            </p>
            <button onClick={close}
              className="mt-2 px-6 py-2.5 bg-[#071B33] text-white text-sm font-bold rounded-xl">
              {ar ? 'إغلاق' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* نوع الطلب */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                {ar ? 'نوع الطلب *' : 'Request Type *'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REQUEST_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('requestType', t.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-right ${
                      form.requestType === t.id
                        ? 'bg-[#FF7900] border-[#FF7900] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#FF7900]/50'
                    }`}
                  >
                    {ar ? t.ar : t.en}
                  </button>
                ))}
              </div>
            </div>

            {/* الاسم */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {ar ? 'اسمك (اختياري)' : 'Your Name (optional)'}
              </label>
              <input className={inp} value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder={ar ? 'اسمك' : 'Your name'} />
            </div>

            {/* الهاتف */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {ar ? 'رقم هاتفك (اختياري)' : 'Your Phone (optional)'}
              </label>
              <input className={inp} value={form.phone} dir="ltr"
                onChange={e => set('phone', e.target.value)}
                placeholder="0912345678" />
            </div>

            {/* الملاحظات */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {ar ? 'الملاحظات أو التفاصيل' : 'Notes or Details'}
              </label>
              <textarea className={inp} rows={3} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder={ar ? 'اكتب تفاصيل الطلب...' : 'Write details...'} />
            </div>

            {/* صور */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {ar ? 'صور (اختياري)' : 'Photos (optional)'}
              </label>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((_, i) => (
                    <div key={i} className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center relative">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <button type="button" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:border-[#FF7900]/40 hover:text-[#FF7900] transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-3.5 h-3.5" />
                {uploading ? (ar ? 'جارٍ الرفع...' : 'Uploading...') : (ar ? 'إرفاق صورة' : 'Attach Photo')}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full bg-[#071B33] hover:bg-[#0f2d52] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{ar ? 'جارٍ الإرسال...' : 'Sending...'}</>
                : ar ? 'إرسال الطلب' : 'Submit Request'
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
