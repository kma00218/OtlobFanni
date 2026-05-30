import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'wouter'
import {
  ArrowRight, Camera, X, Plus, CheckCircle, AlertCircle,
  Send, ImagePlus, User, Building2, Package, ChevronDown,
  Star,
} from 'lucide-react'
import api, { getFileUrl, uploadFile } from '../lib/api'
import { sections, categories } from '../data/services'
import { SUPPLY_TYPES } from '../data/suppliers'

// ── Section gradients (match JoinCompany) ────────────────────────────────────
const SECTION_GRADIENT = {
  home_services:     ['#FF7900', '#e85e00'],
  car_services:      ['#1E40AF', '#0f2472'],
  construction:      ['#D97706', '#b35500'],
  tech_security:     ['#6366F1', '#4338CA'],
  moving_general:    ['#8B5CF6', '#6D28D9'],
  gardens_pools:     ['#10B981', '#047857'],
  energy_generators: ['#F59E0B', '#D97706'],
  business_services: ['#0EA5E9', '#0369A1'],
  more_services:     ['#6B7280', '#374151'],
}

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

// ── Avatar Uploader ───────────────────────────────────────────────────────────
function AvatarUploader({ value, onChange }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)
  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { onChange(await uploadFile(file)) }
    catch { alert('فشل رفع الصورة، حاول مجدداً') }
    finally { setUploading(false); e.target.value = '' }
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div onClick={() => !uploading && ref.current?.click()} className="relative w-28 h-28 rounded-full cursor-pointer">
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #FF7900, #ff9a40)', padding: 3 }}>
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
            {value
              ? <img src={getFileUrl(value)} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-slate-300" /></div>}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
          {uploading
            ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <Camera className="w-4 h-4 text-white" />}
        </div>
        {value && !uploading && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange(null) }}
            className="absolute top-0 right-0 w-7 h-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow">
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-xs text-slate-400 font-semibold mb-2">اضغط لتغيير الصورة</p>
      <div className="w-full rounded-2xl overflow-hidden">
        <div style={{ height: 3, background: 'linear-gradient(90deg, #FF7900, #FFB347, #FF7900)' }} />
        <div className="px-3.5 py-3" style={{ background: 'linear-gradient(145deg, #071B33 0%, #0d2544 100%)' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'rgba(255,121,0,0.22)', border: '1.5px solid rgba(255,121,0,0.4)' }}>
              📸
            </div>
            <p className="text-white font-black text-[13px] leading-tight">صورتك = ثقة فورية من العميل</p>
          </div>
          <div className="space-y-1 mb-2">
            {['✦ صورة وجهك الحقيقية تبني الثقة قبل أي كلمة', '✦ ارفع صورة واضحة واحترافية بجودة عالية'].map((t, i) => (
              <p key={i} className="text-white/80 text-[11px] font-semibold leading-snug">{t}</p>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
            style={{ background: 'rgba(255,121,0,0.18)', border: '1px solid rgba(255,121,0,0.35)' }}>
            <span className="text-orange-300 text-[10.5px] font-bold">⚡ يُحدث الفارق الأكبر</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Work Images ───────────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF7900]/10 flex items-center justify-center">
            <ImagePlus className="w-3.5 h-3.5 text-[#FF7900]" />
          </div>
          <span className="text-sm font-bold text-[#071B33]">صور الأعمال</span>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{value.length}/{max}</span>
      </div>
      <div className="rounded-2xl overflow-hidden mb-3">
        <div style={{ height: 3, background: 'linear-gradient(90deg, #FF7900, #FFB347, #FF7900)' }} />
        <div className="px-3.5 py-3" style={{ background: 'linear-gradient(145deg, #071B33 0%, #0d2544 100%)' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'rgba(255,121,0,0.22)', border: '1.5px solid rgba(255,121,0,0.4)' }}>
              🖼️
            </div>
            <p className="text-white font-black text-[13px] leading-tight">أعمالك تتكلم — دعها تُقنع بدلاً عنك</p>
          </div>
          <div className="space-y-1 mb-2">
            {['✦ أضف أحسن أعمالك — تركيبات، إصلاحات، مشاريع منجزة', '✦ الفنيون بمعرض أعمال يُفضَّلون دائماً على غيرهم'].map((t, i) => (
              <p key={i} className="text-white/80 text-[11px] font-semibold leading-snug">{t}</p>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
            style={{ background: 'rgba(255,121,0,0.18)', border: '1px solid rgba(255,121,0,0.35)' }}>
            <span className="text-orange-300 text-[10.5px] font-bold">⚡ يُحدث الفارق الأكبر</span>
          </div>
        </div>
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
            className="aspect-square rounded-2xl border-2 border-dashed border-[#FF7900] flex flex-col items-center justify-center gap-1 disabled:opacity-50 bg-[#FF7900]/8 hover:bg-[#FF7900]/15 active:scale-95 transition-all shadow-sm">
            {uploading
              ? <div className="w-6 h-6 rounded-full border-2 border-[#FF7900] border-t-transparent animate-spin" />
              : <><div className="w-9 h-9 rounded-full bg-[#FF7900]/15 flex items-center justify-center"><Plus className="w-5 h-5 text-[#FF7900]" strokeWidth={2.5} /></div><span className="text-[11px] text-[#FF7900] font-bold">أضف صورة</span></>}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Specialty Accordion Picker ────────────────────────────────────────────────
function SpecialtyAccordion({ selectedIds, onToggle, suggestedSpecialties, onAddSuggested, onRemoveSuggested, newDeptSuggestions, onAddNewDept, onRemoveNewDept, chipInputValues, onChipInput }) {
  const [expandedSections, setExpandedSections] = useState([])
  const toggleSection = id => setExpandedSections(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
      {sections.map(section => {
        const isMore = section.id === 'more_services'
        const sectionCats = isMore ? [] : categories.filter(c => c.sectionId === section.id && c.id !== 'more')
        const selectedCount = isMore ? newDeptSuggestions.length : sectionCats.filter(c => selectedIds.includes(c.id)).length
        const sugCount = (suggestedSpecialties[section.id] || []).length
        const totalCount = selectedCount + sugCount
        const isOpen = expandedSections.includes(section.id)
        const [c1, c2] = SECTION_GRADIENT[section.id] || ['#6B7280', '#374151']

        return (
          <div key={section.id}>
            {/* Section header */}
            <button type="button" onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-right">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                <img src={`/icons/services/${isMore ? 'more' : section.id}.svg`} alt=""
                  style={{ width: 18, height: 18 }} className="object-contain brightness-0 invert"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <span className="flex-1 font-bold text-[#071B33] text-sm text-right">{section.nameAr}</span>
              {totalCount > 0 && (
                <span className="text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[22px] text-center"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {totalCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Section body */}
            {isOpen && (
              <div className="border-t border-slate-100">
                {isMore ? (
                  /* New department suggestions */
                  <div className="px-4 py-3 bg-slate-50 space-y-2.5">
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      💡 اقترح قسماً أو تخصصاً غير موجود — اضغط + أو Enter لإضافته
                    </p>
                    {newDeptSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {newDeptSuggestions.map((name, i) => (
                          <span key={i} className="flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                            {name}
                            <button type="button" onClick={() => onRemoveNewDept(i)}><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#071B33] outline-none focus:border-[#FF7900] font-medium placeholder:text-slate-300"
                        value={chipInputValues['__new_dept__'] || ''}
                        onChange={e => onChipInput('__new_dept__', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddNewDept() } }}
                        placeholder="مثال: أنظمة الطاقة الشمسية" />
                      <button type="button" onClick={onAddNewDept}
                        className="w-9 h-9 flex-shrink-0 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base hover:bg-amber-600 transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Categories list */}
                    <div className="divide-y divide-slate-50">
                      {sectionCats.map(c => {
                        const checked = selectedIds.includes(c.id)
                        const isPrimary = selectedIds[0] === c.id
                        return (
                          <label key={c.id}
                            className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                            style={{ background: checked ? `${c1}08` : 'white' }}>
                            <input type="checkbox" className="w-4 h-4 accent-[#FF7900] flex-shrink-0"
                              checked={checked} onChange={() => onToggle(c.id)} />
                            <span className={`flex-1 text-sm font-medium ${checked ? 'text-[#071B33] font-bold' : 'text-slate-600'}`}>
                              {c.nameAr}
                            </span>
                            {isPrimary && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                رئيسي
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>

                    {/* Per-section suggestion input */}
                    <div className="px-4 py-3 bg-orange-50/50 border-t border-dashed border-orange-100 space-y-2">
                      <p className="text-[11px] text-slate-400 font-semibold">
                        💡 تخصص غير مذكور في هذا القسم؟ أضفه هنا
                      </p>
                      {(suggestedSpecialties[section.id] || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(suggestedSpecialties[section.id] || []).map((name, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
                              style={{ background: `${c1}15`, color: c1, borderColor: `${c1}30` }}>
                              {name}
                              <button type="button" onClick={() => onRemoveSuggested(section.id, i)}><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input type="text"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#071B33] outline-none focus:border-[#FF7900] font-medium placeholder:text-slate-300"
                          value={chipInputValues[section.id] || ''}
                          onChange={e => onChipInput(section.id, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddSuggested(section.id) } }}
                          placeholder="مثال: صيانة خزانات المياه" />
                        <button type="button" onClick={() => onAddSuggested(section.id)}
                          className="w-9 h-9 flex-shrink-0 rounded-xl text-white flex items-center justify-center font-bold text-base transition-colors"
                          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#FF7900] outline-none text-sm text-[#071B33] transition-all placeholder:text-slate-300 font-medium"

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-bold text-[#071B33]">{label}</label>
        {hint && <span className="text-[11px] text-slate-400 font-semibold">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function CardHeader({ icon: Icon, gradient, title }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
        style={{ background: gradient || 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
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
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  // Specialty picker state
  const [selectedCats, setSelectedCats] = useState([])           // first = primary
  const [suggestedSpecs, setSuggestedSpecs] = useState({})       // { sectionId: [name, …] }
  const [newDeptSuggestions, setNewDeptSuggestions] = useState([])
  const [chipInputs, setChipInputs] = useState({})

  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  const toggleCat = id => setSelectedCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const addSuggested = sectionId => {
    const val = (chipInputs[sectionId] || '').trim(); if (!val) return
    setSuggestedSpecs(p => ({ ...p, [sectionId]: [...(p[sectionId] || []), val] }))
    setChipInputs(p => ({ ...p, [sectionId]: '' }))
  }
  const removeSuggested = (sectionId, idx) =>
    setSuggestedSpecs(p => ({ ...p, [sectionId]: (p[sectionId] || []).filter((_, i) => i !== idx) }))
  const addNewDept = () => {
    const val = (chipInputs['__new_dept__'] || '').trim(); if (!val) return
    setNewDeptSuggestions(p => [...p, val])
    setChipInputs(p => ({ ...p, '__new_dept__': '' }))
  }
  const removeNewDept = idx => setNewDeptSuggestions(p => p.filter((_, i) => i !== idx))

  useEffect(() => {
    const raw = localStorage.getItem('pro_session')
    if (!raw) { navigate('/pro-login'); return }
    try {
      const s = JSON.parse(raw)
      setSession(s)
      api.pro.getProfile(s.entityType, s.entityId)
        .then(prof => {
          const vals = getCurrentValues(prof, s.entityType)
          setForm(vals)
          // pre-populate specialty picker
          if (s.entityType !== 'supplier') {
            const primary = vals.categoryId || vals.specialty
            const extras  = vals.extraSpecialties || []
            const all = [primary, ...extras].filter(Boolean)
            setSelectedCats(all)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } catch {
      localStorage.removeItem('pro_session')
      navigate('/pro-login')
    }
  }, [])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!session) return
    setSubmitting(true); setResult(null)

    const type = session.entityType
    const payload = { ...form }

    if (type !== 'supplier') {
      payload[type === 'technician' ? 'categoryId' : 'specialty'] = selectedCats[0] || ''
      payload.extraSpecialties = selectedCats.slice(1)
      payload.suggestedSpecialties = [
        ...Object.entries(suggestedSpecs)
          .flatMap(([sId, names]) => names.filter(n => n.trim()).map(name => ({ sectionId: sId, name }))),
        ...newDeptSuggestions.filter(n => n.trim()).map(name => ({ sectionId: 'new_department', name })),
      ]
    }

    try {
      await api.pro.requestUpdate(type, session.entityId, payload)
      setResult({ type: 'success', text: 'تم إرسال طلب التعديل! ستُطبَّق التعديلات بعد مراجعة الإدارة.' })
      setTimeout(() => navigate('/pro/profile'), 2200)
    } catch (err) {
      setResult({ type: 'error', text: err.message || 'حدث خطأ، حاول مجدداً' })
    } finally { setSubmitting(false) }
  }

  if (!session) return null
  const type = session.entityType
  const supplyOptions = SUPPLY_TYPES.map(t => ({ value: t.id, label: `${t.emoji} ${t.nameAr}` }))
  const EntityIcon = type === 'technician' ? User : type === 'company' ? Building2 : Package
  const entityLabel = type === 'technician' ? 'بيانات الفني' : type === 'company' ? 'بيانات الشركة' : 'بيانات المورد'
  const totalSpecCount = selectedCats.length + newDeptSuggestions.length +
    Object.values(suggestedSpecs).reduce((a, arr) => a + arr.length, 0)

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" style={{ background: '#F0F2F5' }} dir="rtl">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-100 px-4 pt-14 pb-0 sticky top-0 z-10">
        <div className="flex items-center gap-3 pb-3">
          <button onClick={() => navigate('/pro/profile')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#071B33] active:opacity-70 flex-shrink-0 transition-opacity">
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[#071B33] font-black text-lg leading-tight">تعديل الملف الشخصي</h1>
            <p className="text-slate-400 text-xs font-medium">ستُراجَع التعديلات من الإدارة قبل تطبيقها</p>
          </div>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #FF7900, #ffb366, transparent)' }} />
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-4 pt-4 pb-36">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">جارٍ التحميل…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Card 1: Basic Info ── */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {/* Avatar */}
              <div className="px-5 pt-6 pb-5 bg-gradient-to-b from-slate-50 to-white">
                <CardHeader icon={EntityIcon} title={entityLabel}
                  gradient={type === 'technician' ? 'linear-gradient(135deg,#FF7900,#c45e00)'
                    : type === 'company' ? 'linear-gradient(135deg,#1E40AF,#0f2472)'
                    : 'linear-gradient(135deg,#10B981,#047857)'} />
                <div className="flex justify-center">
                  <AvatarUploader
                    value={form.profilePhoto || form.companyLogo || form.logo}
                    onChange={set(type === 'technician' ? 'profilePhoto' : type === 'company' ? 'companyLogo' : 'logo')}
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 mx-5" />

              {/* Fields */}
              <div className="px-5 py-5 space-y-4">
                {type === 'technician' && <>
                  <Field label="الاسم بالعربي">
                    <input value={form.nameAr || ''} onChange={e => set('nameAr')(e.target.value)}
                      placeholder="محمد الصادق" className={inputCls} />
                  </Field>
                  <Field label="الاسم بالإنجليزي" hint="اختياري">
                    <input value={form.nameEn || ''} onChange={e => set('nameEn')(e.target.value)}
                      placeholder="Mohammed Al-Sadeq" dir="ltr" className={inputCls} />
                  </Field>
                  <Field label="نبذة تعريفية" hint="اختياري">
                    <textarea value={form.descriptionAr || ''} onChange={e => set('descriptionAr')(e.target.value)}
                      placeholder="خبرة 10 سنوات في التمديدات…" rows={3}
                      className={inputCls + ' resize-none leading-relaxed'} />
                  </Field>
                </>}

                {type === 'company' && <>
                  <Field label="اسم الشركة">
                    <input value={form.companyName || ''} onChange={e => set('companyName')(e.target.value)}
                      placeholder="شركة الخدمات المتكاملة" className={inputCls} />
                  </Field>
                  <Field label="وصف الشركة" hint="اختياري">
                    <textarea value={form.description || ''} onChange={e => set('description')(e.target.value)}
                      placeholder="نحن شركة متخصصة في…" rows={3}
                      className={inputCls + ' resize-none leading-relaxed'} />
                  </Field>
                </>}

                {type === 'supplier' && <>
                  <Field label="اسم المحل / النشاط التجاري">
                    <input value={form.businessName || ''} onChange={e => set('businessName')(e.target.value)}
                      placeholder="محل الأدوات الفنية" className={inputCls} />
                  </Field>
                  <Field label="وصف النشاط" hint="اختياري">
                    <textarea value={form.description || ''} onChange={e => set('description')(e.target.value)}
                      placeholder="نوفر جميع مستلزمات…" rows={3}
                      className={inputCls + ' resize-none leading-relaxed'} />
                  </Field>
                  <Field label="نوع المستلزمات">
                    <select value={form.supplyType || ''} onChange={e => set('supplyType')(e.target.value)}
                      className={inputCls + ' cursor-pointer'}>
                      <option value="">اختر النوع</option>
                      {supplyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                </>}
              </div>
            </div>

            {/* ── Card 2: Specialties (technician & company only) ── */}
            {type !== 'supplier' && (
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <CardHeader icon={Star} title="التخصصات"
                    gradient="linear-gradient(135deg,#F59E0B,#D97706)" />

                  {/* Summary row */}
                  {totalSpecCount > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {selectedCats.slice(0, 1).map(id => {
                        const cat = categories.find(c => c.id === id)
                        return cat ? (
                          <span key={id} className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full text-white"
                            style={{ background: 'linear-gradient(135deg,#FF7900,#c45e00)' }}>
                            ★ {cat.nameAr}
                          </span>
                        ) : null
                      })}
                      {selectedCats.slice(1).map(id => {
                        const cat = categories.find(c => c.id === id)
                        return cat ? (
                          <span key={id} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(255,121,0,0.1)', color: '#c45e00' }}>
                            {cat.nameAr}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Hint */}
                  <p className="text-[12px] text-slate-500 font-semibold leading-relaxed mb-3">
                    افتح أي قسم واختر تخصصاتك — <span className="text-[#FF7900] font-black">أول اختيار يصبح التخصص الرئيسي</span> تلقائياً
                  </p>
                </div>

                <div className="px-4 pb-5">
                  <SpecialtyAccordion
                    selectedIds={selectedCats}
                    onToggle={toggleCat}
                    suggestedSpecialties={suggestedSpecs}
                    onAddSuggested={addSuggested}
                    onRemoveSuggested={removeSuggested}
                    newDeptSuggestions={newDeptSuggestions}
                    onAddNewDept={addNewDept}
                    onRemoveNewDept={removeNewDept}
                    chipInputValues={chipInputs}
                    onChipInput={(k, v) => setChipInputs(p => ({ ...p, [k]: v }))}
                  />
                  {totalSpecCount === 0 && (
                    <p className="text-xs text-slate-400 font-semibold mt-2 text-center">
                      لم يتم اختيار أي تخصص بعد
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Card 3: Work Images ── */}
            <div className="bg-white rounded-3xl shadow-sm px-5 py-5">
              <WorkImagesUploader
                value={form.workImages || form.shopImages || []}
                onChange={set(type === 'supplier' ? 'shopImages' : 'workImages')}
                max={5}
              />
            </div>

            {/* Result banner */}
            {result && (
              <div className={`rounded-2xl px-4 py-4 flex gap-3 items-start border ${
                result.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {result.type === 'success'
                  ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <p className={`text-sm font-semibold leading-relaxed ${
                  result.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                }`}>{result.text}</p>
              </div>
            )}

          </form>
        )}
      </div>

      {/* ── Sticky submit ── */}
      {!loading && (
        <div className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto px-4 pb-6 pt-4"
          style={{ background: 'linear-gradient(to top, #F0F2F5 65%, transparent)' }}>
          <button onClick={handleSubmit}
            disabled={submitting || result?.type === 'success'}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2.5"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 8px 28px rgba(255,121,0,0.4)' }}>
            {submitting
              ? <><div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> جارٍ الإرسال…</>
              : <><Send className="w-5 h-5" /> إرسال طلب التعديل</>}
          </button>
        </div>
      )}

    </div>
  )
}
