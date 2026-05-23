import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'wouter'
import {
  ArrowRight, Camera, X, Plus, CheckCircle, Clock, AlertCircle, Upload,
} from 'lucide-react'
import api, { getFileUrl, uploadFile } from '../lib/api'
import { SUPPLY_TYPES } from '../data/suppliers'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentValues(profile, entityType) {
  if (!profile) return {}
  if (entityType === 'technician') return {
    nameAr:           profile.nameAr           || profile.name_ar           || '',
    nameEn:           profile.nameEn           || profile.name_en           || '',
    descriptionAr:    profile.descriptionAr    || profile.description_ar    || '',
    profilePhoto:     profile.profilePhoto     || profile.profile_photo     || null,
    workImages:       profile.workImages       || profile.work_images       || [],
    categoryId:       profile.categoryId       || profile.category_id       || '',
    extraSpecialties: profile.extraSpecialties || profile.extra_specialties || [],
  }
  if (entityType === 'company') return {
    companyName:      profile.companyName      || profile.company_name      || '',
    description:      profile.description      || '',
    companyLogo:      profile.companyLogo      || profile.company_logo      || null,
    workImages:       profile.workImages       || profile.work_images       || [],
    specialty:        profile.specialty        || '',
    extraSpecialties: profile.extraSpecialties || profile.extra_specialties || [],
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

// ── Photo Upload Component ────────────────────────────────────────────────────

function PhotoUploader({ label, value, onChange, circle = false }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadFile(file)
      onChange(path)
    } catch {
      alert('فشل رفع الصورة، حاول مجدداً')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const shape = circle ? 'rounded-full' : 'rounded-2xl'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => !uploading && ref.current?.click()}
        className={`relative w-24 h-24 ${shape} overflow-hidden border-2 border-dashed border-[#FF7900]/40 bg-[#FF7900]/5 flex items-center justify-center cursor-pointer active:opacity-70 transition-opacity`}
      >
        {value ? (
          <img src={getFileUrl(value)} alt="" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-7 h-7 text-[#FF7900]/60" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(null) }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}

// ── Multi-photo Component ─────────────────────────────────────────────────────

function MultiPhotoUploader({ label, value = [], onChange, max = 5 }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const remaining = max - value.length
    const toUpload = files.slice(0, remaining)
    if (!toUpload.length) return
    setUploading(true)
    try {
      const paths = await Promise.all(toUpload.map(f => uploadFile(f)))
      onChange([...value, ...paths])
    } catch {
      alert('فشل رفع بعض الصور، حاول مجدداً')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {value.map((path, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
            <img src={getFileUrl(path)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-[#FF7900]/40 bg-[#FF7900]/5 flex flex-col items-center justify-center gap-1 active:opacity-70 transition-opacity disabled:opacity-50"
          >
            {uploading
              ? <div className="w-5 h-5 rounded-full border-2 border-[#FF7900] border-t-transparent animate-spin" />
              : <Plus className="w-5 h-5 text-[#FF7900]/60" />
            }
            {!uploading && <span className="text-[10px] text-[#FF7900]/60 font-medium">إضافة</span>}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
      <p className="text-[10px] text-slate-400 mt-1.5">بحد أقصى {max} صور</p>
    </div>
  )
}

// ── Field Component ───────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, dir = 'rtl', multiline = false }) {
  const cls = "w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-[#FF7900] outline-none text-sm text-[#071B33] transition-all bg-white"
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={dir} rows={3} className={cls + ' resize-none'} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={dir} className={cls} />
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-[#FF7900] outline-none text-sm text-[#071B33] transition-all bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProEditProfile() {
  const [, navigate] = useLocation()
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [categories, setCategories] = useState([])

  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]     = useState(null) // { type: 'success'|'error', text }

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

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
        setProfile(prof)
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
      setResult({ type: 'success', text: 'تم إرسال طلب التعديل بنجاح! سيتم مراجعته من الإدارة قريباً.' })
      setTimeout(() => navigate('/pro/profile'), 2500)
    } catch (err) {
      setResult({ type: 'error', text: err.message || 'حدث خطأ، حاول مجدداً' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) return null

  const catOptions = categories.map(c => ({ value: String(c.id), label: c.nameAr || c.name_ar }))
  const supplyOptions = SUPPLY_TYPES.map(t => ({ value: t.id, label: `${t.emoji} ${t.nameAr}` }))

  const type = session.entityType

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col max-w-[480px] mx-auto" dir="rtl">

      {/* Header */}
      <div className="bg-[#071B33] px-5 pt-14 pb-6">
        <button onClick={() => navigate('/pro/profile')} className="flex items-center gap-1.5 text-white/60 text-sm mb-5 active:opacity-70">
          <ArrowRight className="w-4 h-4" />
          العودة لملفي الشخصي
        </button>
        <h1 className="text-white font-extrabold text-xl">تعديل الملف الشخصي</h1>
        <p className="text-white/60 text-sm mt-0.5">سيتم مراجعة التعديلات من الإدارة قبل تطبيقها</p>
      </div>

      <div className="flex-1 px-4 pt-5 pb-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs font-medium leading-relaxed">
                بعد إرسال الطلب، سيتم مراجعة تعديلاتك من فريق اطلب فني وتطبيقها على ملفك العام خلال 24 ساعة.
              </p>
            </div>

            {/* ── Technician fields ── */}
            {type === 'technician' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
                <p className="font-extrabold text-[#071B33] text-sm border-b border-slate-100 pb-3">البيانات الأساسية</p>

                <div className="flex justify-center">
                  <PhotoUploader
                    label="صورة الملف الشخصي"
                    value={form.profilePhoto}
                    onChange={set('profilePhoto')}
                    circle
                  />
                </div>

                <Field label="الاسم بالعربي">
                  <TextInput value={form.nameAr || ''} onChange={set('nameAr')} placeholder="محمد الصادق" />
                </Field>

                <Field label="الاسم بالإنجليزي (اختياري)">
                  <TextInput value={form.nameEn || ''} onChange={set('nameEn')} placeholder="Mohammed Al-Sadeq" dir="ltr" />
                </Field>

                <Field label="نبذة تعريفية (اختياري)">
                  <TextInput value={form.descriptionAr || ''} onChange={set('descriptionAr')} placeholder="خبرة 10 سنوات في..." multiline />
                </Field>

                <Field label="التخصص الرئيسي">
                  <SelectInput
                    value={form.categoryId || ''}
                    onChange={set('categoryId')}
                    options={catOptions}
                    placeholder="اختر التخصص"
                  />
                </Field>

                <MultiPhotoUploader
                  label="صور الأعمال"
                  value={form.workImages || []}
                  onChange={set('workImages')}
                  max={5}
                />
              </div>
            )}

            {/* ── Company fields ── */}
            {type === 'company' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
                <p className="font-extrabold text-[#071B33] text-sm border-b border-slate-100 pb-3">بيانات الشركة</p>

                <div className="flex justify-center">
                  <PhotoUploader
                    label="شعار الشركة"
                    value={form.companyLogo}
                    onChange={set('companyLogo')}
                  />
                </div>

                <Field label="اسم الشركة">
                  <TextInput value={form.companyName || ''} onChange={set('companyName')} placeholder="شركة الخدمات المتكاملة" />
                </Field>

                <Field label="وصف الشركة (اختياري)">
                  <TextInput value={form.description || ''} onChange={set('description')} placeholder="نحن شركة متخصصة في..." multiline />
                </Field>

                <Field label="التخصص الرئيسي">
                  <SelectInput
                    value={form.specialty || ''}
                    onChange={set('specialty')}
                    options={catOptions}
                    placeholder="اختر التخصص"
                  />
                </Field>

                <MultiPhotoUploader
                  label="صور الأعمال"
                  value={form.workImages || []}
                  onChange={set('workImages')}
                  max={5}
                />
              </div>
            )}

            {/* ── Supplier fields ── */}
            {type === 'supplier' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
                <p className="font-extrabold text-[#071B33] text-sm border-b border-slate-100 pb-3">بيانات المورد</p>

                <div className="flex justify-center">
                  <PhotoUploader
                    label="شعار المحل"
                    value={form.logo}
                    onChange={set('logo')}
                  />
                </div>

                <Field label="اسم المحل / النشاط التجاري">
                  <TextInput value={form.businessName || ''} onChange={set('businessName')} placeholder="محل الأدوات الفنية" />
                </Field>

                <Field label="وصف النشاط (اختياري)">
                  <TextInput value={form.description || ''} onChange={set('description')} placeholder="نوفر جميع مستلزمات..." multiline />
                </Field>

                <Field label="نوع المستلزمات">
                  <SelectInput
                    value={form.supplyType || ''}
                    onChange={set('supplyType')}
                    options={supplyOptions}
                    placeholder="اختر النوع"
                  />
                </Field>

                <MultiPhotoUploader
                  label="صور المحل والمنتجات"
                  value={form.shopImages || []}
                  onChange={set('shopImages')}
                  max={5}
                />
              </div>
            )}

            {/* Result message */}
            {result && (
              <div className={`rounded-2xl px-4 py-4 flex gap-3 items-start ${result.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                {result.type === 'success'
                  ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                }
                <p className={`text-sm font-medium leading-relaxed ${result.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {result.text}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !!result?.type === 'success'}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-base transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  جارٍ الإرسال…
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  إرسال طلب التعديل
                </>
              )}
            </button>

          </form>
        )}
      </div>
    </div>
  )
}
