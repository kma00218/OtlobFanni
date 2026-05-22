import { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle, User, Images, Plus } from 'lucide-react'
import { uploadFile, getFileUrl } from '../lib/api'
import LibyaPhoneInput from './LibyaPhoneInput'

const REQUEST_TYPES = [
  { id: 'data_update',         ar: 'تحديث بيانات',        en: 'Data Update' },
  { id: 'wrong_number',        ar: 'رقم هاتف غير صحيح',   en: 'Wrong Number' },
  { id: 'not_available',       ar: 'النشاط غير متوفر',     en: 'Not Available' },
  { id: 'city_correction',     ar: 'تصحيح المدينة',        en: 'City Correction' },
  { id: 'specialty_correction', ar: 'تصحيح التخصص',       en: 'Specialty Correction' },
  { id: 'other',               ar: 'أخرى',                 en: 'Other' },
]

export default function ReportModal({ open, onClose, entityType, entityId, entityName, city, ar = true }) {
  const [form, setForm]               = useState({ name: '', whatsapp: '', requestType: '', notes: '' })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [workPhotos, setWorkPhotos]   = useState([])
  const [uploading, setUploading]     = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState('')

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleProfilePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('profile')
    try {
      const path = await uploadFile(file)
      setProfilePhoto(path)
    } catch { setError(ar ? 'فشل رفع الصورة' : 'Upload failed') }
    setUploading(null)
    e.target.value = ''
  }

  const handleWorkPhotos = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading('work')
    try {
      const paths = await Promise.all(files.map(f => uploadFile(f)))
      setWorkPhotos(prev => [...prev, ...paths])
    } catch { setError(ar ? 'فشل رفع الصورة' : 'Upload failed') }
    setUploading(null)
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.requestType) { setError(ar ? 'اختر نوع الطلب' : 'Select request type'); return }
    if (!form.whatsapp || form.whatsapp === '+218') { setError(ar ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required'); return }
    setError('')
    setSubmitting(true)
    try {
      const allPhotos = [profilePhoto, ...workPhotos].filter(Boolean)
      const res = await fetch('/api/update-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type:     entityType,
          entity_id:       entityId,
          entity_name:     entityName,
          city:            city || '',
          requester_name:  form.name || null,
          requester_phone: form.whatsapp || null,
          request_type:    form.requestType,
          notes:           form.notes || null,
          photos:          allPhotos,
          profile_photo:   profilePhoto || null,
          work_photos:     workPhotos,
        }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch { setError(ar ? 'حدث خطأ، حاول مجدداً' : 'Error, try again') }
    setSubmitting(false)
  }

  const close = () => {
    setForm({ name: '', whatsapp: '', requestType: '', notes: '' })
    setProfilePhoto(null)
    setWorkPhotos([])
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

            {/* ── الصور — قسمان بارزان ── */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700">
                {ar ? 'الصور (اختياري)' : 'Photos (optional)'}
              </p>

              {/* صورة شخصية أو شعار */}
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#071B33]/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-[#071B33]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#071B33]">
                      {ar ? 'صورة شخصية أو شعار' : 'Profile Photo or Logo'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {ar ? 'صورة واحدة' : 'One image'}
                    </p>
                  </div>
                </div>

                {profilePhoto ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#FF7900]/30">
                    <img src={getFileUrl(profilePhoto)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProfilePhoto(null)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center gap-2 cursor-pointer w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:border-[#FF7900]/50 hover:text-[#FF7900] transition-colors ${uploading === 'profile' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                    {uploading === 'profile'
                      ? (ar ? 'جارٍ الرفع...' : 'Uploading...')
                      : (ar ? 'اختر صورة' : 'Choose photo')}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
                  </label>
                )}
              </div>

              {/* صور الأعمال */}
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0">
                    <Images className="w-3.5 h-3.5 text-[#FF7900]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#071B33]">
                      {ar ? 'صور الأعمال' : 'Work Photos'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {ar ? 'يمكن إضافة أكثر من صورة' : 'Multiple photos allowed'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {workPhotos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FF7900]/30">
                      <img src={getFileUrl(p)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setWorkPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  <label className={`w-16 h-16 flex flex-col items-center justify-center gap-1 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 hover:border-[#FF7900]/50 hover:text-[#FF7900] transition-colors ${uploading === 'work' ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading === 'work'
                      ? <span className="w-4 h-4 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
                      : <>
                          <Plus className="w-4 h-4" />
                          <span className="text-[9px] font-bold">{ar ? 'إضافة' : 'Add'}</span>
                        </>
                    }
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleWorkPhotos} />
                  </label>
                </div>
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

            {/* الواتساب */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {ar ? 'رقم واتساب *' : 'WhatsApp Number *'}
              </label>
              <LibyaPhoneInput
                value={form.whatsapp}
                onChange={v => set('whatsapp', v)}
                required
              />
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
