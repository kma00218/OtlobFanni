import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'wouter'
import {
  ArrowRight, Camera, X, Plus, CheckCircle, AlertCircle,
  Send, ImagePlus, User, Building2, Package,
} from 'lucide-react'
import api, { getFileUrl, uploadFile } from '../lib/api'
import { SUPPLY_TYPES } from '../data/suppliers'

function getCurrentValues(profile, entityType) {
  if (!profile) return {}
  if (entityType === 'technician') return {
    nameAr:           profile.nameAr           || profile.name_ar           || '',
    nameEn:           profile.nameEn           || profile.name_en           || '',
    descriptionAr:    profile.descriptionAr    || profile.description_ar    || '',
    profilePhoto:     profile.profilePhoto     || profile.profile_photo     || null,
    workImages:       profile.workImages       || profile.work_images       || [],
    categoryId:       profile.categoryId       || profile.category_id       || '',
  }
  if (entityType === 'company') return {
    companyName:      profile.companyName      || profile.company_name      || '',
    description:      profile.description      || '',
    companyLogo:      profile.companyLogo      || profile.company_logo      || null,
    workImages:       profile.workImages       || profile.work_images       || [],
    specialty:        profile.specialty        || '',
  }
  if (entityType === 'supplier') return {
    businessName:     profile.businessName     || profile.business_name     || '',
    description:      profile.description      || '',
    logo:             profile.logo             || null,
    shopImages:       profile.shopImages       || profile.shop_images       || [],
    supplyType:       profile.supplyType       || profile.supply_type       || '',
  }
  return {}
}

// ── Avatar Uploader ───────────────────────────────────────────────────────────
function AvatarUploader({ value, onChange }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { onChange(await uploadFile(file)) }
    catch { alert('فشل رفع الصورة، حاول مجدداً') }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => !uploading && ref.current?.click()}
        className="relative w-28 h-28 rounded-full cursor-pointer group"
      >
        {/* Ring */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(135deg, #FF7900, #ff9a40)', padding: 3 }}>
          <div className="w-full h-full rounded-full overflow-hidden bg-[#F2F2F7]">
            {value
              ? <img src={getFileUrl(value)} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-slate-300" />
                </div>
            }
          </div>
        </div>

        {/* Camera badge */}
        <div className="absolute bottom-0 left-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
          {uploading
            ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <Camera className="w-4 h-4 text-white" />
          }
        </div>

        {/* Remove */}
        {value && !uploading && (
          <button type="button"
            onClick={e => { e.stopPropagation(); onChange(null) }}
            className="absolute top-0 right-0 w-7 h-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow">
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-xs text-slate-400 font-medium">اضغط لتغيير الصورة</p>
    </div>
  )
}

// ── Work Images Grid ──────────────────────────────────────────────────────────
function WorkImagesUploader({ value = [], onChange, max = 5 }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, max - value.length)
    if (!files.length) return
    setUploading(true)
    try { onChange([...value, ...await Promise.all(files.map(f => uploadFile(f)))]) }
    catch { alert('فشل رفع الصور، حاول مجدداً') }
    finally { setUploading(false); e.target.value = '' }
  }

  const remove = idx => onChange(value.filter((_, i) => i !== idx))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-[#FF7900]" />
          <span className="text-sm font-bold text-[#071B33]">صور الأعمال</span>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          {value.length}/{max}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {value.map((path, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
            <img src={getFileUrl(path)} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <button type="button" onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 active:opacity-70 disabled:opacity-50 transition-opacity bg-slate-50 hover:bg-slate-100 hover:border-[#FF7900]/40 transition-all">
            {uploading
              ? <div className="w-5 h-5 rounded-full border-2 border-[#FF7900] border-t-transparent animate-spin" />
              : <>
                  <Plus className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-semibold">إضافة</span>
                </>
            }
          </button>
        )}
      </div>

      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-bold text-[#071B33]">{label}</label>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-[#FF7900] outline-none text-sm text-[#071B33] transition-all placeholder:text-slate-300 font-medium"

function TextInput({ value, onChange, placeholder, dir = 'rtl', rows }) {
  return rows
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        dir={dir} rows={rows} className={inputCls + ' resize-none leading-relaxed'} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        dir={dir} className={inputCls} />
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={inputCls + ' cursor-pointer'}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FF7900, #ff9a40)' }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="font-black text-[#071B33] text-sm">{title}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProEditProfile() {
  const [, navigate] = useLocation()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login'); return }
    try {
      const s = JSON.parse(raw)
      setSession(s)
      Promise.all([
        api.pro.getProfile(s.entityType, s.entityId),
        fetch('/api/categories').then(r => r.json()).catch(() => []),
      ]).then(([prof, cats]) => {
        setCategories(cats)
        setForm(getCurrentValues(prof, s.entityType))
      }).catch(() => {}).finally(() => setLoading(false))
    } catch {
      localStorage.removeItem('pro_session')
      navigate('/pro-login')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session) return
    setSubmitting(true)
    setResult(null)
    try {
      await api.pro.requestUpdate(session.entityType, session.entityId, form)
      setResult({ type: 'success', text: 'تم إرسال طلب التعديل! ستُطبَّق التعديلات بعد مراجعة الإدارة.' })
      setTimeout(() => navigate('/pro/profile'), 2200)
    } catch (err) {
      setResult({ type: 'error', text: err.message || 'حدث خطأ، حاول مجدداً' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) return null

  const type = session.entityType
  const catOptions = categories.map(c => ({ value: String(c.id), label: c.nameAr || c.name_ar }))
  const supplyOptions = SUPPLY_TYPES.map(t => ({ value: t.id, label: `${t.emoji} ${t.nameAr}` }))
  const EntityIcon = type === 'technician' ? User : type === 'company' ? Building2 : Package
  const sectionTitle = type === 'technician' ? 'بيانات الفني' : type === 'company' ? 'بيانات الشركة' : 'بيانات المورد'

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" style={{ background: '#F0F2F5' }} dir="rtl">

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #071B33 0%, #0d2a4a 100%)' }}
        className="px-5 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF7900 0%, transparent 60%)' }} />
        <button onClick={() => navigate('/pro/profile')}
          className="flex items-center gap-1.5 text-white/50 text-sm mb-6 active:opacity-70 relative">
          <ArrowRight className="w-4 h-4" />
          العودة لملفي الشخصي
        </button>
        <h1 className="text-white font-black text-2xl relative">تعديل الملف الشخصي</h1>
        <p className="text-white/40 text-sm mt-1 relative">ستُراجَع التعديلات من الإدارة قبل تطبيقها</p>
      </div>

      <div className="flex-1 px-4 pt-5 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm font-medium">جارٍ التحميل…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Main card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

              {/* Photo section */}
              <div className="px-5 pt-6 pb-5"
                style={{ background: 'linear-gradient(160deg, #F8F9FC 0%, #ffffff 100%)' }}>
                <SectionHeader icon={EntityIcon} title={sectionTitle} />
                <div className="mt-5 flex justify-center">
                  <AvatarUploader
                    value={form.profilePhoto || form.companyLogo || form.logo}
                    onChange={set(type === 'technician' ? 'profilePhoto' : type === 'company' ? 'companyLogo' : 'logo')}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-5" />

              {/* Fields */}
              <div className="px-5 py-5 space-y-4">

                {/* Technician */}
                {type === 'technician' && <>
                  <Field label="الاسم بالعربي">
                    <TextInput value={form.nameAr || ''} onChange={set('nameAr')} placeholder="محمد الصادق" />
                  </Field>
                  <Field label="الاسم بالإنجليزي" hint="اختياري">
                    <TextInput value={form.nameEn || ''} onChange={set('nameEn')} placeholder="Mohammed Al-Sadeq" dir="ltr" />
                  </Field>
                  <Field label="نبذة تعريفية" hint="اختياري">
                    <TextInput value={form.descriptionAr || ''} onChange={set('descriptionAr')} placeholder="خبرة 10 سنوات في التمديدات…" rows={3} />
                  </Field>
                  <Field label="التخصص الرئيسي">
                    <SelectInput value={form.categoryId || ''} onChange={set('categoryId')} options={catOptions} placeholder="اختر التخصص" />
                  </Field>
                </>}

                {/* Company */}
                {type === 'company' && <>
                  <Field label="اسم الشركة">
                    <TextInput value={form.companyName || ''} onChange={set('companyName')} placeholder="شركة الخدمات المتكاملة" />
                  </Field>
                  <Field label="وصف الشركة" hint="اختياري">
                    <TextInput value={form.description || ''} onChange={set('description')} placeholder="نحن شركة متخصصة في…" rows={3} />
                  </Field>
                  <Field label="التخصص الرئيسي">
                    <SelectInput value={form.specialty || ''} onChange={set('specialty')} options={catOptions} placeholder="اختر التخصص" />
                  </Field>
                </>}

                {/* Supplier */}
                {type === 'supplier' && <>
                  <Field label="اسم المحل / النشاط التجاري">
                    <TextInput value={form.businessName || ''} onChange={set('businessName')} placeholder="محل الأدوات الفنية" />
                  </Field>
                  <Field label="وصف النشاط" hint="اختياري">
                    <TextInput value={form.description || ''} onChange={set('description')} placeholder="نوفر جميع مستلزمات…" rows={3} />
                  </Field>
                  <Field label="نوع المستلزمات">
                    <SelectInput value={form.supplyType || ''} onChange={set('supplyType')} options={supplyOptions} placeholder="اختر النوع" />
                  </Field>
                </>}
              </div>
            </div>

            {/* Work images card */}
            <div className="bg-white rounded-3xl shadow-sm px-5 py-5">
              <WorkImagesUploader
                value={form.workImages || form.shopImages || []}
                onChange={set(type === 'supplier' ? 'shopImages' : 'workImages')}
                max={5}
              />
            </div>

            {/* Result */}
            {result && (
              <div className={`rounded-2xl px-4 py-4 flex gap-3 items-start ${
                result.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.type === 'success'
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                }
                <p className={`text-sm font-semibold leading-relaxed ${
                  result.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                }`}>{result.text}</p>
              </div>
            )}

          </form>
        )}
      </div>

      {/* Sticky submit bar */}
      {!loading && (
        <div className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto px-4 pb-6 pt-3"
          style={{ background: 'linear-gradient(to top, #F0F2F5 70%, transparent)' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || result?.type === 'success'}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg"
            style={{ background: submitting ? '#ccc' : 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 8px 24px rgba(255,121,0,0.35)' }}
          >
            {submitting
              ? <><div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> جارٍ الإرسال…</>
              : <><Send className="w-5 h-5" /> إرسال طلب التعديل</>
            }
          </button>
        </div>
      )}

    </div>
  )
}
