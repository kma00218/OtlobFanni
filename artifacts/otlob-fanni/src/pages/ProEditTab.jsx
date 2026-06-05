import { useState, useEffect, useRef } from 'react'
import { api, uploadFile, getFileUrl, parseLocalPhone, validateLocalPhone } from '../lib/api'
import {
  Save, RefreshCw, Camera, ImagePlus, CheckCircle, AlertCircle,
  Clock, X, Trash2, Info,
} from 'lucide-react'

// ── Phone Input with fixed +218 prefix ──────────────────────────────────────
function PhoneInput({ label, hint, value, onChange, error }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-1">{label}</label>
      <div className={`flex rounded-xl overflow-hidden border-[1.5px] transition-colors ${
        error ? 'border-red-400' : 'border-[#E2E8F0] focus-within:border-[#FF7900]'
      }`} style={{ background: '#F8F9FA' }}>
        <span className="flex items-center px-3 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 border-l border-[#E2E8F0] whitespace-nowrap flex-shrink-0">
          +218 🇱🇾
        </span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="921101010"
          value={value}
          maxLength={9}
          onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm text-[#071B33] placeholder-gray-300 bg-transparent outline-none"
          dir="ltr"
        />
      </div>
      {error
        ? <p className="text-[11px] text-red-500 font-semibold mt-1">{error}</p>
        : hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
      }
    </div>
  )
}

// ── Text Input ───────────────────────────────────────────────────────────────
function TextInput({ label, hint, value, onChange, placeholder, multiline, rows = 3 }) {
  const cls = "w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#FF7900]/30 resize-none transition-all"
  const style = { background: '#F8F9FA', border: '1.5px solid #E2E8F0' }
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-1">{label}</label>
      {multiline
        ? <textarea rows={rows} placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)} className={cls} style={style} />
        : <input type="text" placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)} className={cls} style={style} />
      }
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ── Select Input ─────────────────────────────────────────────────────────────
function SelectInput({ label, hint, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] outline-none focus:ring-2 focus:ring-[#FF7900]/30 transition-all"
        style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }}>
        <option value="">-- اختر المدينة --</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.nameAr}</option>
        ))}
      </select>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ── Image Upload Box ─────────────────────────────────────────────────────────
function ImageUploadBox({ label, hint, currentUrl, previewUrl, onFileSelect, onClear, uploading }) {
  const inputRef = useRef()
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-1">{label}</label>
      <div className="relative">
        {previewUrl || currentUrl ? (
          <div className="relative w-24 h-24">
            <img src={previewUrl || currentUrl} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-[#FF7900]/30" />
            {previewUrl && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                جديد
              </span>
            )}
            <button type="button" onClick={() => { onClear(); inputRef.current.value = '' }}
              className="absolute -bottom-1 -left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current.click()}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#FF7900] hover:text-[#FF7900] transition-colors">
            {uploading
              ? <RefreshCw className="w-5 h-5 animate-spin" />
              : <><Camera className="w-5 h-5" /><span className="text-[10px] font-bold">اختر صورة</span></>
            }
          </button>
        )}
        {(previewUrl || currentUrl) && !uploading && (
          <button type="button" onClick={() => inputRef.current.click()}
            className="mt-2 text-[11px] text-[#FF7900] font-bold flex items-center gap-1">
            <Camera className="w-3 h-3" /> تغيير
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])} />
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ── Gallery Upload ────────────────────────────────────────────────────────────
function GalleryUpload({ label, hint, currentUrls, newFiles, onAdd, onRemoveCurrent, onRemoveNew }) {
  const inputRef = useRef()
  const total = currentUrls.length + newFiles.length
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {currentUrls.map((url, i) => (
          <div key={i} className="relative w-20 h-20">
            <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
            <button type="button" onClick={() => onRemoveCurrent(i)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {newFiles.map((f, i) => (
          <div key={i} className="relative w-20 h-20">
            <img src={f.preview} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-amber-400" />
            <span className="absolute -top-1 -left-1 bg-amber-400 text-white text-[9px] font-black px-1 rounded-full">جديد</span>
            <button type="button" onClick={() => onRemoveNew(i)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {total < 8 && (
          <button type="button" onClick={() => inputRef.current.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#FF7900] hover:text-[#FF7900] transition-colors">
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-bold">إضافة</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { [...e.target.files].slice(0, 8 - total).forEach(f => onAdd(f)); e.target.value = '' }} />
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ── Pending Image Banner ─────────────────────────────────────────────────────
function PendingBanner({ pending }) {
  if (!pending) return null
  const isImages = pending.changes && (
    pending.changes.profilePhoto || pending.changes.companyLogo || pending.changes.logo ||
    pending.changes.workImages || pending.changes.shopImages
  )
  if (!isImages) return null
  const colors = {
    pending:  'bg-amber-50 border-amber-200 text-amber-700',
    approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rejected: 'bg-red-50 border-red-200 text-red-700',
    cancelled:'bg-gray-50 border-gray-200 text-gray-500',
  }
  const labels = { pending: 'قيد مراجعة الأدمن', approved: 'تمت الموافقة ✓', rejected: 'تم الرفض', cancelled: 'ملغي' }
  const icons  = { pending: <Clock className="w-3.5 h-3.5" />, approved: <CheckCircle className="w-3.5 h-3.5" />, rejected: <AlertCircle className="w-3.5 h-3.5" />, cancelled: null }
  const s = pending.status || 'pending'
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold ${colors[s] || colors.pending}`}>
      {icons[s]}
      <span>آخر طلب صور: {labels[s] || s}</span>
      <span className="text-[10px] font-medium opacity-70 mr-auto">{new Date(pending.createdAt).toLocaleDateString('ar-LY')}</span>
    </div>
  )
}

// ── Main Edit Tab ─────────────────────────────────────────────────────────────
export default function ProEditTab({ session, cities, categories }) {
  const entityType = session.entityType
  const entityId   = session.entityId

  const [profile,      setProfile]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [saveErr,      setSaveErr]      = useState('')
  const [phoneErr,     setPhoneErr]     = useState({ phone: '', whatsapp: '' })

  // Text form fields
  const [form, setForm] = useState({
    name: '', name2: '', phone: '', whatsapp: '', city: '', cityId: '', description: '',
  })

  // Image state
  const [pendingRequest,   setPendingRequest]   = useState(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState(null)  // { file, preview }
  const [galleryNewFiles,  setGalleryNewFiles]  = useState([])    // [{ file, preview }]
  const [currentGallery,   setCurrentGallery]   = useState([])    // existing gallery URLs (display URLs)
  const [currentPhotoUrl,  setCurrentPhotoUrl]  = useState('')
  const [imgUploading,     setImgUploading]     = useState(false)
  const [imgSaved,         setImgSaved]         = useState(false)
  const [imgErr,           setImgErr]           = useState('')

  // ── Load profile + pending request on mount ────────────────────────────────
  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.pro.getProfile(entityType, entityId),
      api.pro.getPendingRequest(entityType, entityId),
    ]).then(([p, pending]) => {
      setProfile(p)
      setPendingRequest(pending)

      // Pre-fill text form
      if (entityType === 'technician') {
        setForm({
          name:      p.nameAr   || '',
          name2:     p.nameEn   || '',
          phone:     parseLocalPhone(p.phone),
          whatsapp:  parseLocalPhone(p.whatsapp),
          city:      '',
          cityId:    p.cityId   || '',
          description: p.descriptionAr || '',
        })
        setCurrentPhotoUrl(getFileUrl(p.profilePhoto) || '')
        setCurrentGallery((p.workImages || []).map(img => getFileUrl(img)).filter(Boolean))
      } else if (entityType === 'company') {
        setForm({
          name:      p.companyName  || '',
          name2:     p.contactName  || '',
          phone:     parseLocalPhone(p.phone),
          whatsapp:  parseLocalPhone(p.whatsapp),
          city:      p.city         || '',
          cityId:    '',
          description: p.description || '',
        })
        setCurrentPhotoUrl(getFileUrl(p.companyLogo) || '')
        setCurrentGallery((p.workImages || []).map(img => getFileUrl(img)).filter(Boolean))
      } else if (entityType === 'supplier') {
        setForm({
          name:      p.businessName || '',
          name2:     p.contactName  || '',
          phone:     parseLocalPhone(p.phone),
          whatsapp:  parseLocalPhone(p.whatsapp),
          city:      p.city         || '',
          cityId:    '',
          description: p.description || '',
        })
        setCurrentPhotoUrl(getFileUrl(p.logo) || '')
        setCurrentGallery((p.shopImages || []).map(img => getFileUrl(img)).filter(Boolean))
      }
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [entityType, entityId])

  // ── Field config by entity type ───────────────────────────────────────────
  const isTechnician = entityType === 'technician'
  const isCompany    = entityType === 'company'
  const isSupplier   = entityType === 'supplier'

  const LABELS = {
    name:    isTechnician ? 'الاسم الكامل' : isCompany ? 'اسم الشركة' : 'اسم النشاط',
    name2:   isTechnician ? '' : isCompany ? 'اسم المسؤول' : 'اسم المسؤول',
    photo:   isTechnician ? 'صورة الملف الشخصي' : isCompany ? 'شعار الشركة' : 'شعار النشاط',
    gallery: isTechnician ? 'معرض الأعمال' : isCompany ? 'صور المشاريع' : 'صور المحل / المستلزمات',
  }
  const HINTS = {
    name:      'الاسم كما يظهر في الدليل وصفحتك العامة',
    name2:     'الاسم الكامل للشخص المسؤول عن الحساب',
    phone:     '9 أرقام بدون صفر في البداية — مثال: 921101010',
    whatsapp:  'سيُستخدم لتواصل العملاء معك مباشرة — 9 أرقام بدون صفر',
    city:      'المدينة التي تعمل وتقدم خدماتك فيها',
    description: isTechnician
      ? 'صف خدماتك ومجال عملك باختصار — ما الذي يميزك عن غيرك؟'
      : isCompany
        ? 'صف نشاط شركتك وخدماتها الرئيسية'
        : 'صف أنواع المستلزمات التي تتخصص في توريدها',
    photo:     'الصور تحتاج موافقة الأدمن قبل ظهورها للعامة',
    gallery:   'حتى 8 صور — تحتاج موافقة الأدمن قبل ظهورها',
  }

  // ── Validate phones ────────────────────────────────────────────────────────
  const validate = () => {
    const errs = { phone: '', whatsapp: '' }
    if (form.phone && !validateLocalPhone(form.phone)) {
      errs.phone = 'يجب أن يكون 9 أرقام بدون صفر في البداية'
    }
    if (form.whatsapp && !validateLocalPhone(form.whatsapp)) {
      errs.whatsapp = 'يجب أن يكون 9 أرقام بدون صفر في البداية'
    }
    setPhoneErr(errs)
    return !errs.phone && !errs.whatsapp
  }

  // ── Save text fields ───────────────────────────────────────────────────────
  const saveText = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveErr('')
    setSaved(false)

    try {
      let fields = {}
      if (isTechnician) {
        fields = {
          nameAr:      form.name.trim() || undefined,
          phone:       form.phone       || undefined,
          whatsapp:    form.whatsapp    || undefined,
          cityId:      form.cityId      || undefined,
          descriptionAr: form.description.trim() || undefined,
        }
      } else if (isCompany) {
        fields = {
          companyName:  form.name.trim()  || undefined,
          contactName:  form.name2.trim() || undefined,
          phone:        form.phone        || undefined,
          whatsapp:     form.whatsapp     || undefined,
          city:         form.city         || undefined,
          description:  form.description.trim() || undefined,
        }
      } else if (isSupplier) {
        fields = {
          businessName: form.name.trim()  || undefined,
          contactName:  form.name2.trim() || undefined,
          phone:        form.phone        || undefined,
          whatsapp:     form.whatsapp     || undefined,
          city:         form.city         || undefined,
          description:  form.description.trim() || undefined,
        }
      }
      // Remove undefined
      Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k])

      await api.pro.updateProfile(entityType, entityId, fields)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveErr(err.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  // ── Image file handlers ────────────────────────────────────────────────────
  const handleProfilePhotoSelect = (file) => {
    const preview = URL.createObjectURL(file)
    setProfilePhotoFile({ file, preview })
  }
  const handleProfilePhotoClear = () => {
    if (profilePhotoFile?.preview) URL.revokeObjectURL(profilePhotoFile.preview)
    setProfilePhotoFile(null)
  }
  const handleGalleryAdd = (file) => {
    const preview = URL.createObjectURL(file)
    setGalleryNewFiles(prev => [...prev, { file, preview }])
  }
  const handleGalleryRemoveCurrent = (idx) => {
    setCurrentGallery(prev => prev.filter((_, i) => i !== idx))
  }
  const handleGalleryRemoveNew = (idx) => {
    const f = galleryNewFiles[idx]
    if (f?.preview) URL.revokeObjectURL(f.preview)
    setGalleryNewFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Submit images for approval ─────────────────────────────────────────────
  const submitImages = async () => {
    if (!profilePhotoFile && galleryNewFiles.length === 0) return
    setImgUploading(true)
    setImgErr('')
    setImgSaved(false)

    try {
      const changes = {}

      if (profilePhotoFile) {
        const path = await uploadFile(profilePhotoFile.file)
        if (isTechnician) changes.profilePhoto = path
        else if (isCompany) changes.companyLogo  = path
        else if (isSupplier) changes.logo        = path
      }

      if (galleryNewFiles.length > 0) {
        const uploadedPaths = await Promise.all(galleryNewFiles.map(f => uploadFile(f.file)))
        const galleryKey = isTechnician ? 'workImages' : isCompany ? 'workImages' : 'shopImages'
        // Keep current gallery paths (raw object paths) + new uploads
        const currentRaw = (profile ? (
          isTechnician ? (profile.workImages || []) :
          isCompany    ? (profile.workImages || []) :
          (profile.shopImages || [])
        ) : []).filter(p => currentGallery.includes(getFileUrl(p)))
        changes[galleryKey] = [...currentRaw, ...uploadedPaths]
      }

      await api.pro.requestUpdate(entityType, entityId, changes)

      // Refresh pending
      const pending = await api.pro.getPendingRequest(entityType, entityId)
      setPendingRequest(pending)
      setProfilePhotoFile(null)
      setGalleryNewFiles([])
      setImgSaved(true)
      setTimeout(() => setImgSaved(false), 4000)
    } catch (err) {
      setImgErr(err.message || 'فشل رفع الصور')
    } finally {
      setImgUploading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
      </div>
    )
  }

  const cityValue = isTechnician ? form.cityId : form.city
  const cityOnChange = isTechnician
    ? (v) => setForm(p => ({ ...p, cityId: v }))
    : (v) => {
        const found = cities.find(c => c.id === v)
        setForm(p => ({ ...p, city: found ? found.nameAr : v }))
      }
  const citySelectValue = isTechnician
    ? form.cityId
    : cities.find(c => c.nameAr === form.city)?.id || ''

  const hasNewImages = profilePhotoFile || galleryNewFiles.length > 0

  return (
    <div className="space-y-4">

      {/* ── Text Fields Section ── */}
      <form onSubmit={saveText} className="bg-white rounded-3xl p-5 shadow-sm space-y-4" style={{ border: '1px solid #F0F2F5' }}>

        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <div className="w-8 h-8 rounded-xl bg-[#FF7900]/10 flex items-center justify-center">
            <Save className="w-4 h-4 text-[#FF7900]" />
          </div>
          <div>
            <p className="font-black text-[#071B33] text-sm">البيانات الأساسية</p>
            <p className="text-[11px] text-gray-400">التغييرات تنعكس فوراً على ملفك العام</p>
          </div>
        </div>

        {/* Name */}
        <TextInput
          label={LABELS.name}
          hint={HINTS.name}
          value={form.name}
          onChange={v => setForm(p => ({ ...p, name: v }))}
          placeholder={isTechnician ? 'مثال: محمد الهادي الورفلي' : isCompany ? 'مثال: شركة البناء والتشطيب' : 'مثال: مستلزمات الخليج'}
        />

        {/* Name 2 (company / supplier only) */}
        {!isTechnician && (
          <TextInput
            label={LABELS.name2}
            hint={HINTS.name2}
            value={form.name2}
            onChange={v => setForm(p => ({ ...p, name2: v }))}
            placeholder="الاسم الكامل للمسؤول"
          />
        )}

        {/* Phone */}
        <PhoneInput
          label="رقم الهاتف"
          hint={HINTS.phone}
          value={form.phone}
          onChange={v => setForm(p => ({ ...p, phone: v }))}
          error={phoneErr.phone}
        />

        {/* WhatsApp */}
        <PhoneInput
          label="رقم الواتساب"
          hint={HINTS.whatsapp}
          value={form.whatsapp}
          onChange={v => setForm(p => ({ ...p, whatsapp: v }))}
          error={phoneErr.whatsapp}
        />

        {/* City */}
        <SelectInput
          label="المدينة"
          hint={HINTS.city}
          value={citySelectValue}
          onChange={cityOnChange}
          options={cities}
        />

        {/* Description */}
        <TextInput
          label="وصف النشاط"
          hint={HINTS.description}
          value={form.description}
          onChange={v => setForm(p => ({ ...p, description: v }))}
          placeholder={isTechnician ? 'مثال: أقدم خدمات تمديد الكهرباء والصيانة المنزلية...' : 'صف نشاطك وما تقدمه...'}
          multiline
          rows={4}
        />

        {/* Info note */}
        <div className="bg-blue-50 rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs text-blue-700">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>الهاتف والواتساب يُحفظان بالتنسيق الدولي الليبي (+218) تلقائياً</span>
        </div>

        {/* Error */}
        {saveErr && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-red-600 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {saveErr}
          </div>
        )}

        {/* Success */}
        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            تم حفظ البيانات وستنعكس فوراً على ملفك العام ✓
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>

      {/* ── Images Section ── */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-5" style={{ border: '1px solid #F0F2F5' }}>

        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <Camera className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="font-black text-[#071B33] text-sm">الصور</p>
            <p className="text-[11px] text-gray-400">تظهر للعامة فقط بعد موافقة الأدمن</p>
          </div>
        </div>

        {/* Pending status banner */}
        <PendingBanner pending={pendingRequest} />

        {/* Profile photo */}
        <ImageUploadBox
          label={LABELS.photo}
          hint={HINTS.photo}
          currentUrl={currentPhotoUrl}
          previewUrl={profilePhotoFile?.preview}
          onFileSelect={handleProfilePhotoSelect}
          onClear={handleProfilePhotoClear}
          uploading={imgUploading && !!profilePhotoFile}
        />

        {/* Gallery */}
        <GalleryUpload
          label={LABELS.gallery}
          hint={HINTS.gallery}
          currentUrls={currentGallery}
          newFiles={galleryNewFiles}
          onAdd={handleGalleryAdd}
          onRemoveCurrent={handleGalleryRemoveCurrent}
          onRemoveNew={handleGalleryRemoveNew}
        />

        {/* Image error */}
        {imgErr && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-red-600 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> {imgErr}
          </div>
        )}

        {/* Image success */}
        {imgSaved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-amber-700 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            تم إرسال الصور بنجاح — ستظهر بعد موافقة الأدمن ✓
          </div>
        )}

        {/* Submit images button */}
        {hasNewImages && (
          <button type="button" onClick={submitImages} disabled={imgUploading}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            {imgUploading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> جارٍ الرفع...</>
              : <><Camera className="w-4 h-4" /> إرسال الصور للمراجعة</>
            }
          </button>
        )}

        {/* Approval notice */}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-start gap-2 text-[11px] text-gray-500">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>الصور الحالية تبقى ظاهرة للعامة حتى يوافق الأدمن على الصور الجديدة أو يرفضها</span>
        </div>
      </div>
    </div>
  )
}
