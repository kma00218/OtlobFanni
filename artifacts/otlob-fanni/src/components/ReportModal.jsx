import { useState } from 'react'
import { X, AlertCircle, CheckCircle, User, Images, Plus, Camera, Send, FileText, Phone } from 'lucide-react'
import { uploadFile, getFileUrl } from '../lib/api'
import LibyaPhoneInput from './LibyaPhoneInput'

const REQUEST_TYPES = [
  { id: 'data_update',          ar: 'تحديث بيانات',        icon: '✏️' },
  { id: 'wrong_number',         ar: 'رقم غير صحيح',        icon: '📵' },
  { id: 'not_available',        ar: 'النشاط متوقف',         icon: '🚫' },
  { id: 'city_correction',      ar: 'تصحيح المدينة',        icon: '📍' },
  { id: 'specialty_correction', ar: 'تصحيح التخصص',        icon: '🔧' },
  { id: 'other',                ar: 'أخرى',                 icon: '💬' },
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={close}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header with gradient accent ── */}
        <div className="relative overflow-hidden bg-gradient-to-l from-[#FF7900] to-[#ff9a3c] px-5 pt-5 pb-4">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 left-10 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-lg leading-tight tracking-tight">
                {ar ? 'تحديث أو إبلاغ' : 'Update or Report'}
              </h3>
              <p className="text-white/70 text-xs mt-0.5 truncate max-w-[200px] font-medium">{entityName}</p>
            </div>
            <button onClick={close}
              className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-center space-y-1">
              <p className="font-black text-[#071B33] text-lg">{ar ? 'تم الإرسال!' : 'Sent!'}</p>
              <p className="text-sm text-slate-400">{ar ? 'سيراجعه فريقنا قريباً' : 'Our team will review it soon'}</p>
            </div>
            <button onClick={close}
              className="mt-1 px-8 py-3 bg-[#071B33] text-white text-sm font-bold rounded-2xl hover:bg-[#0f2d52] transition-colors">
              {ar ? 'إغلاق' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[72vh] overflow-y-auto" dir="rtl">
            <div className="px-5 py-5 space-y-5">

              {/* ── نوع الطلب ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-lg bg-[#FF7900] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-black text-[#071B33] tracking-wide uppercase">
                    {ar ? 'نوع الطلب' : 'Request Type'}
                  </span>
                  <span className="text-[10px] text-[#FF7900] font-bold bg-[#FF7900]/10 px-1.5 py-0.5 rounded-full">مطلوب</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {REQUEST_TYPES.map(t => {
                    const active = form.requestType === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => set('requestType', t.id)}
                        className={`relative py-3 px-2 rounded-2xl text-center transition-all duration-200 ${
                          active
                            ? 'bg-[#FF7900] shadow-lg shadow-[#FF7900]/30 scale-[1.03]'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        <span className="block text-base mb-0.5">{t.icon}</span>
                        <span className={`block text-[10px] font-bold leading-tight ${active ? 'text-white' : 'text-slate-600'}`}>
                          {ar ? t.ar : t.id}
                        </span>
                        {active && (
                          <span className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center">
                            <CheckCircle className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── الصور ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-black text-[#071B33] tracking-wide uppercase">
                    {ar ? 'الصور' : 'Photos'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{ar ? '(اختياري)' : '(optional)'}</span>
                </div>

                {/* Profile photo */}
                <div className="bg-gradient-to-l from-slate-50 to-blue-50/50 rounded-2xl p-3.5 mb-2.5 border border-slate-200">
                  <div className="flex items-center gap-3">
                    {profilePhoto ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={getFileUrl(profilePhoto)}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FF7900]/20 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setProfilePhoto(null)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <label className={`w-16 h-16 flex-shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                        uploading === 'profile'
                          ? 'border-[#FF7900]/40 bg-[#FF7900]/5 opacity-60 pointer-events-none'
                          : 'border-slate-200 hover:border-[#FF7900]/50 hover:bg-[#FF7900]/5 bg-white'
                      }`}>
                        {uploading === 'profile'
                          ? <span className="w-4 h-4 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
                          : <User className="w-5 h-5 text-slate-300" />
                        }
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
                      </label>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#071B33]">{ar ? 'صورة شخصية أو شعار' : 'Profile Photo or Logo'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ar ? 'صورة واحدة للملف الشخصي' : 'One profile image'}</p>
                      {!profilePhoto && (
                        <label className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          uploading === 'profile'
                            ? 'bg-slate-100 text-slate-400 pointer-events-none'
                            : 'bg-[#071B33]/5 text-[#071B33] hover:bg-[#071B33]/10'
                        }`}>
                          {uploading === 'profile' ? (ar ? 'جارٍ الرفع...' : 'Uploading...') : (ar ? 'اختر صورة' : 'Choose')}
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Work photos */}
                <div className="bg-gradient-to-l from-slate-50 to-orange-50/40 rounded-2xl p-3.5 border border-slate-200">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <p className="text-xs font-bold text-[#071B33]">{ar ? 'صور الأعمال' : 'Work Photos'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ar ? 'أضف أكثر من صورة' : 'Multiple photos'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Images className="w-3.5 h-3.5 text-[#FF7900]" />
                      {workPhotos.length > 0 && (
                        <span className="text-[10px] font-black text-[#FF7900]">{workPhotos.length}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workPhotos.map((p, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                        <img src={getFileUrl(p)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setWorkPhotos(prev => prev.filter((_, j) => j !== i))}
                          className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group"
                        >
                          <X className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    ))}
                    <label className={`w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      uploading === 'work'
                        ? 'border-[#FF7900]/40 bg-[#FF7900]/5 opacity-60 pointer-events-none'
                        : 'border-slate-200 bg-white hover:border-[#FF7900]/60 hover:bg-[#FF7900]/5'
                    }`}>
                      {uploading === 'work'
                        ? <span className="w-4 h-4 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
                        : <>
                            <Plus className="w-4 h-4 text-slate-300" />
                            <span className="text-[9px] font-bold text-slate-300">{ar ? 'إضافة' : 'Add'}</span>
                          </>
                      }
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleWorkPhotos} />
                    </label>
                  </div>
                </div>
              </div>

              {/* ── الاسم والواتساب ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-black text-[#071B33] tracking-wide uppercase">
                    {ar ? 'بياناتك' : 'Your Info'}
                  </span>
                </div>

                {/* Name */}
                <div className="relative">
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder={ar ? 'اسمك (اختياري)' : 'Your name (optional)'}
                    className="w-full pr-4 pl-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]/50 focus:bg-white transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#FF7900]/20 focus-within:border-[#FF7900]/50 focus-within:bg-white transition-all">
                  <LibyaPhoneInput
                    value={form.whatsapp}
                    onChange={v => set('whatsapp', v)}
                    required
                  />
                </div>
              </div>

              {/* ── الملاحظات ── */}
              <div>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder={ar ? 'ملاحظات أو تفاصيل إضافية...' : 'Additional notes or details...'}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]/50 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="flex items-center gap-2.5 text-red-600 text-xs bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-l from-[#FF7900] to-[#ff9a3c] hover:from-[#e66d00] hover:to-[#ff8c20] disabled:opacity-50 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-[#FF7900]/30 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {ar ? 'جارٍ الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {ar ? 'إرسال الطلب' : 'Submit Request'}
                  </>
                )}
              </button>

            </div>
          </form>
        )}
      </div>
    </div>
  )
}
