import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, CheckCircle,
  XCircle, Eye, X, Phone, MapPin, Briefcase, Clock, Facebook, Instagram,
  Image, Shield, Zap, User, Settings2,
} from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'
import { sections as SECTIONS, categories as SERVICES_CATS } from '../../data/services'

const PAGE_SIZE = 15

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const DAY_OPTIONS = [
  { en: 'Saturday',  ar: 'السبت'    },
  { en: 'Sunday',    ar: 'الأحد'    },
  { en: 'Monday',    ar: 'الاثنين'  },
  { en: 'Tuesday',   ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday',  ar: 'الخميس'   },
  { en: 'Friday',    ar: 'الجمعة'   },
]

const emptyForm = {
  name_ar: '', name_en: '', phone: '', whatsapp: '',
  category_id: '', city_id: '', area: '',
  experience_years: 0, price_from: 0, price_to: 0,
  status: 'available',
  description_ar: '', description_en: '',
  profile_photo: '',
  facebook: '', instagram: '',
  emergency: false, available_now: false,
  is_featured: false, is_approved: true, is_active: true,
  rating: 0, reviews_count: 0,
}

function FieldGroup({ title, icon: Icon, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-slate-500">
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {children}
    </div>
  )
}
function InfoCell({ label, value, dir, valueClass }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`font-medium text-[#071B33] text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
function Grid2({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

function DetailModal({ tech, cities, categories, onClose, onEdit }) {
  const [lightbox, setLightbox] = useState(null)
  if (!tech) return null

  const nameAr      = tech.nameAr      || tech.name_ar      || ''
  const nameEn      = tech.nameEn      || tech.name_en      || ''
  const phone       = tech.phone       || ''
  const whatsapp    = tech.whatsapp    || ''
  const area        = tech.area        || ''
  const priceFrom   = tech.priceFrom   ?? tech.price_from   ?? ''
  const priceTo     = tech.priceTo     ?? tech.price_to     ?? ''
  const exp         = tech.experienceYears ?? tech.experience_years ?? 0
  const descAr      = tech.descriptionAr || tech.description_ar || ''
  const descEn      = tech.descriptionEn || tech.description_en || ''
  const photo       = getFileUrl(tech.profilePhoto  || tech.profile_photo  || null)
  const workImgs    = (tech.workImages || tech.work_images || []).map(getFileUrl)
  const emergency   = tech.emergency     ?? false
  const availNow    = tech.availableNow  ?? tech.available_now ?? false
  const isFeatured  = tech.isFeatured    ?? tech.is_featured  ?? false
  const isApproved  = tech.isApproved    ?? tech.is_approved  ?? true
  const isActive    = tech.isActive      ?? tech.is_active    ?? true
  const rating      = tech.rating        || 0
  const reviews     = tech.reviewsCount  || tech.reviews_count || 0
  const fb          = tech.facebook      || ''
  const ig          = tech.instagram     || ''
  const createdAt   = tech.createdAt     || tech.created_at   || ''

  const cityName    = cities.find(c => c.id === (tech.cityId || tech.city_id))?.nameAr || tech.cityId || tech.city_id || ''
  const catObj      = categories.find(c => c.id === (tech.categoryId || tech.category_id))
  const catName     = catObj?.nameAr || catObj?.name_ar || tech.categoryId || tech.category_id || ''
  const sectionId   = catObj?.sectionId || catObj?.section_id || ''
  const sectionName = SECTIONS.find(s => s.id === sectionId)?.nameAr || sectionId || ''

  const statusMap = {
    available: { label: 'متاح',    cls: 'bg-emerald-500/15 text-emerald-400' },
    busy:      { label: 'مشغول',   cls: 'bg-amber-500/15 text-amber-400' },
    inactive:  { label: 'غير نشط', cls: 'bg-slate-100 text-slate-500' },
  }
  const statusInfo = statusMap[tech.status] || statusMap.inactive

  const initials = nameAr.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={e => { e.stopPropagation(); setLightbox(null) }}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
      <div
        className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-[#071B33] text-base">تفاصيل الفني</h2>
            <p className="text-xs text-slate-500 mt-0.5">{nameAr}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); onEdit(tech) }} className="flex items-center gap-1.5 bg-[#FF7900]/15 text-[#FF7900] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#FF7900]/25 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> تعديل
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Header card */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-slate-200 shadow">
              {photo
                ? <img src={photo} alt={nameAr} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(photo)} />
                : <div className="w-full h-full bg-gradient-to-br from-[#FF7900]/30 to-[#071B33] flex items-center justify-center text-white font-bold text-2xl">
                    {initials || <User className="w-8 h-8 opacity-50" />}
                  </div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#071B33] text-lg leading-tight">{nameAr}</h3>
              {nameEn && <p className="text-sm text-slate-400" dir="ltr">{nameEn}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusInfo.cls}`}>{statusInfo.label}</span>
                {isFeatured && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#FF7900]/15 text-[#FF7900]">⭐ مميز</span>}
                {isApproved  && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-500/15 text-blue-400">✓ معتمد</span>}
                {!isActive   && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-500/15 text-red-400">✕ معطّل</span>}
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
                  ))}
                  <span className="text-xs text-slate-500 mr-1">{rating.toFixed(1)} ({reviews} تقييم)</span>
                </div>
              )}
            </div>
          </div>

          <FieldGroup title="معلومات الاتصال" icon={Phone}>
            <Grid2>
              <InfoCell label="رقم الهاتف"  value={phone}    dir="ltr" />
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">واتساب</p>
                <p className="font-medium text-[#071B33] text-sm" dir="ltr">{whatsapp || '—'}</p>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                     className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-green-400 hover:text-green-300 transition-colors">
                    <WaIcon /> فتح واتساب
                  </a>
                )}
              </div>
            </Grid2>
          </FieldGroup>

          <FieldGroup title="الموقع والخدمة" icon={MapPin}>
            <Grid2>
              <InfoCell label="القسم الرئيسي" value={sectionName} />
              <InfoCell label="التخصص"        value={catName} />
              <InfoCell label="المدينة"       value={cityName} />
              <InfoCell label="المنطقة / الحي" value={area} />
            </Grid2>
          </FieldGroup>

          <FieldGroup title="التفاصيل المهنية" icon={Briefcase}>
            <Grid2>
              <InfoCell label="سنوات الخبرة"  value={exp > 0 ? `${exp} سنوات` : '—'} />
              <InfoCell label="السعر الأدنى"  value={priceFrom ? `${priceFrom} د.ل` : '—'} />
              <InfoCell label="السعر الأقصى"  value={priceTo   ? `${priceTo} د.ل`   : '—'} />
              <InfoCell
                label="الطوارئ"
                value={emergency ? '✓ متاح للطوارئ' : '✗ لا'}
                valueClass={emergency ? 'text-[#FF7900]' : 'text-slate-500'}
              />
            </Grid2>
            {descAr && (
              <div className="mt-2 bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">الوصف بالعربي</p>
                <p className="text-sm text-slate-600 leading-relaxed">{descAr}</p>
              </div>
            )}
            {descEn && (
              <div className="mt-2 bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">الوصف بالإنجليزي</p>
                <p className="text-sm text-slate-600 leading-relaxed" dir="ltr">{descEn}</p>
              </div>
            )}
          </FieldGroup>

          <FieldGroup title="حالة التوفر" icon={Clock}>
            <Grid2>
              <InfoCell
                label="متاح الآن"
                value={availNow ? '✓ متاح' : '✗ غير متاح'}
                valueClass={availNow ? 'text-emerald-400' : 'text-slate-500'}
              />
              <InfoCell label="تاريخ الانضمام" value={createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : '—'} />
            </Grid2>
          </FieldGroup>

          {(fb || ig) && (
            <FieldGroup title="التواصل الاجتماعي" icon={Facebook}>
              {fb && (
                <div className="bg-slate-50 rounded-xl p-3 mb-2">
                  <p className="text-xs text-slate-500 mb-0.5">فيسبوك</p>
                  <a href={fb} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline break-all" dir="ltr">{fb}</a>
                </div>
              )}
              {ig && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">إنستغرام</p>
                  <a href={ig} target="_blank" rel="noreferrer" className="text-sm text-pink-400 hover:underline break-all" dir="ltr">{ig}</a>
                </div>
              )}
            </FieldGroup>
          )}

          {workImgs.length > 0 && (
            <FieldGroup title={`معرض الأعمال (${workImgs.length})`} icon={Image}>
              <div className="grid grid-cols-3 gap-2">
                {workImgs.map((src, i) => (
                  <img key={i} src={src} alt={`صورة ${i+1}`}
                    className="w-full aspect-square object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:opacity-90"
                    onClick={() => setLightbox(src)}
                  />
                ))}
              </div>
            </FieldGroup>
          )}
        </div>
      </div>
    </div>
  )
}

function TechFormModal({ open, onClose, title, form, setForm, onSubmit, saving, cities, categories, isSuperAdmin, cityId }) {
  if (!open) return null

  const inp = "form-input"
  const lbl = "form-label"

  const selectedCat = SERVICES_CATS.find(c => c.id === form.category_id)
  const selectedSectionId = selectedCat?.sectionId || ''

  const catsBySection = SECTIONS.map(sec => ({
    ...sec,
    cats: SERVICES_CATS.filter(c => c.sectionId === sec.id && c.id !== 'more'),
  })).filter(s => s.cats.length > 0)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="font-bold text-[#071B33] text-base">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">

          {/* ── الاسم والصورة ── */}
          <Section label="الهوية الأساسية" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>الاسم بالعربي *</label>
                <input required value={form.name_ar} onChange={e => setForm(f => ({...f, name_ar: e.target.value}))} className={inp} placeholder="أحمد محمد" />
              </div>
              <div>
                <label className={lbl}>الاسم بالإنجليزي</label>
                <input value={form.name_en} onChange={e => setForm(f => ({...f, name_en: e.target.value}))} className={inp} placeholder="Ahmed Mohamed" dir="ltr" />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>رابط صورة البروفايل</label>
                <input value={form.profile_photo} onChange={e => setForm(f => ({...f, profile_photo: e.target.value}))} className={inp} placeholder="https://..." dir="ltr" />
                {form.profile_photo && (
                  <img src={form.profile_photo} alt="" className="mt-2 w-16 h-16 rounded-xl object-cover border border-slate-200" onError={e => e.target.style.display='none'} />
                )}
              </div>
            </div>
          </Section>

          {/* ── الاتصال ── */}
          <Section label="معلومات الاتصال" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>رقم الهاتف *</label>
                <input required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className={inp} placeholder="09xxxxxxxx" dir="ltr" />
              </div>
              <div>
                <label className={lbl}>واتساب</label>
                <input value={form.whatsapp} onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))} className={inp} placeholder="09xxxxxxxx" dir="ltr" />
              </div>
              <div>
                <label className={lbl}>فيسبوك</label>
                <input value={form.facebook} onChange={e => setForm(f => ({...f, facebook: e.target.value}))} className={inp} placeholder="https://facebook.com/..." dir="ltr" />
              </div>
              <div>
                <label className={lbl}>إنستغرام</label>
                <input value={form.instagram} onChange={e => setForm(f => ({...f, instagram: e.target.value}))} className={inp} placeholder="https://instagram.com/..." dir="ltr" />
              </div>
            </div>
          </Section>

          {/* ── الموقع والتخصص ── */}
          <Section label="الموقع والتخصص" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>المدينة *</label>
                <select required value={form.city_id} onChange={e => setForm(f => ({...f, city_id: e.target.value}))} className={inp} disabled={!isSuperAdmin && !!cityId}>
                  <option value="">اختر المدينة</option>
                  {(isSuperAdmin ? cities : cities.filter(c => c.id === cityId)).map(c => (
                    <option key={c.id} value={c.id}>{c.nameAr || c.name_ar}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>المنطقة / الحي</label>
                <input value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} className={inp} placeholder="مثال: سوق الجمعة" />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>التخصص *</label>
                <select required value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))} className={inp}>
                  <option value="">اختر التخصص</option>
                  {catsBySection.map(sec => (
                    <optgroup key={sec.id} label={sec.nameAr}>
                      {sec.cats.map(c => (
                        <option key={c.id} value={c.id}>{c.nameAr}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="more_services">✏️ تخصص آخر (مخصص)</option>
                </select>
                {selectedSectionId && (
                  <p className="text-xs text-[#FF7900]/70 mt-1.5">
                    القسم الرئيسي: {SECTIONS.find(s => s.id === selectedSectionId)?.nameAr || selectedSectionId}
                  </p>
                )}
                {form.category_id === 'more_services' && (
                  <p className="text-xs text-amber-400/80 mt-1.5">تخصص مخصص — لم يختر الفني من القائمة الرئيسية</p>
                )}
              </div>
            </div>
          </Section>

          {/* ── التفاصيل المهنية ── */}
          <Section label="التفاصيل المهنية" icon={Briefcase}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>سنوات الخبرة</label>
                <input type="number" min="0" max="50" value={form.experience_years} onChange={e => setForm(f => ({...f, experience_years: e.target.value}))} className={inp} />
              </div>
              <div>
                <label className={lbl}>السعر الأدنى (د.ل)</label>
                <input type="number" min="0" value={form.price_from} onChange={e => setForm(f => ({...f, price_from: e.target.value}))} className={inp} />
              </div>
              <div>
                <label className={lbl}>السعر الأقصى (د.ل)</label>
                <input type="number" min="0" value={form.price_to} onChange={e => setForm(f => ({...f, price_to: e.target.value}))} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={lbl}>الوصف بالعربي</label>
                <textarea rows={3} value={form.description_ar} onChange={e => setForm(f => ({...f, description_ar: e.target.value}))} className={inp + ' resize-none'} />
              </div>
              <div>
                <label className={lbl}>الوصف بالإنجليزي</label>
                <textarea rows={3} value={form.description_en} onChange={e => setForm(f => ({...f, description_en: e.target.value}))} className={inp + ' resize-none'} dir="ltr" />
              </div>
            </div>
          </Section>

          {/* ── الحالة والإعدادات ── */}
          <Section label="الحالة والإعدادات" icon={Settings2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>حالة الفني</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className={inp}>
                  <option value="available">متاح</option>
                  <option value="busy">مشغول</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              <div>
                <label className={lbl}>التقييم (0-5)</label>
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({...f, rating: e.target.value}))} className={inp} />
              </div>
              <div>
                <label className={lbl}>عدد التقييمات</label>
                <input type="number" min="0" value={form.reviews_count} onChange={e => setForm(f => ({...f, reviews_count: e.target.value}))} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {[
                { field: 'is_featured',  label: '⭐ مميز',          color: 'text-[#FF7900]'  },
                { field: 'is_approved',  label: '✓ معتمد',          color: 'text-blue-400'   },
                { field: 'is_active',    label: '◉ نشط',            color: 'text-emerald-400'},
                { field: 'emergency',    label: '⚡ طوارئ 24/7',    color: 'text-red-400'    },
                { field: 'available_now',label: '🟢 متاح الآن',     color: 'text-emerald-400'},
              ].map(({ field, label, color }) => (
                <label key={field} className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${form[field] ? 'border-[#FF7900]/30 bg-[#FF7900]/5' : 'border-slate-200 bg-transparent'}`}>
                  <input type="checkbox" checked={!!form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.checked}))} className="w-4 h-4 accent-[#FF7900] flex-shrink-0" />
                  <span className={`text-xs font-semibold ${form[field] ? color : 'text-slate-500'}`}>{label}</span>
                </label>
              ))}
            </div>
          </Section>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-[#FF7900] hover:bg-[#e86d00] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الحفظ...</>
                : title.includes('تعديل') ? 'حفظ التغييرات' : 'إضافة الفني'
              }
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm transition-colors">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ label, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#FF7900]" />
        <p className="text-xs font-bold text-[#FF7900] uppercase tracking-wider">{label}</p>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      {children}
    </div>
  )
}

export default function Technicians() {
  const { isSuperAdmin, cityId } = useAdmin()

  const [allTechs, setAllTechs]     = useState([])
  const [cities, setCities]         = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  const [search, setSearch]             = useState('')
  const [filterCity, setFilterCity]     = useState('')
  const [filterCat, setFilterCat]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage]                 = useState(1)

  const [data, setData]   = useState([])
  const [total, setTotal] = useState(0)

  const [viewItem, setViewItem]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const reloadTechs = useCallback(() => {
    setLoading(true)
    api.admin.technicians.list()
      .then(rows => { setAllTechs(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    reloadTechs()
    api.admin.cities.list().then(setCities).catch(() => {})
    api.admin.categories.list().then(setCategories).catch(() => {})
  }, [reloadTechs])

  useEffect(() => {
    let rows = [...allTechs]
    if (!isSuperAdmin && cityId)
      rows = rows.filter(r => (r.cityId || r.city_id) === cityId)
    if (filterCity)
      rows = rows.filter(r => (r.cityId || r.city_id) === filterCity)
    if (filterCat)
      rows = rows.filter(r => (r.categoryId || r.category_id) === filterCat)
    if (filterStatus)
      rows = rows.filter(r => r.status === filterStatus)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(r =>
        (r.nameAr || r.name_ar || '').toLowerCase().includes(s) ||
        (r.phone || '').toLowerCase().includes(s) ||
        (r.area || '').toLowerCase().includes(s)
      )
    }
    rows.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    setTotal(rows.length)
    const start = (page - 1) * PAGE_SIZE
    setData(rows.slice(start, start + PAGE_SIZE).map(r => ({
      ...r,
      _cityName: cities.find(c => c.id === (r.cityId || r.city_id))?.nameAr || '',
      _catName:  (() => {
        const catId = r.categoryId || r.category_id
        if (!catId) return ''
        if (catId === 'more_services') return 'تخصص آخر'
        const cat = SERVICES_CATS.find(c => c.id === catId)
        if (cat) return cat.nameAr
        const dbCat = categories.find(c => c.id === catId)
        return dbCat?.nameAr || dbCat?.name_ar || catId
      })(),
      _sectionName: (() => {
        const catId = r.categoryId || r.category_id
        if (!catId || catId === 'more_services') return ''
        const cat = SERVICES_CATS.find(c => c.id === catId)
        return SECTIONS.find(s => s.id === cat?.sectionId)?.nameAr || ''
      })(),
    })))
  }, [allTechs, search, filterCity, filterCat, filterStatus, page, isSuperAdmin, cityId, cities, categories])

  const openAdd = () => {
    setEditItem(null)
    setForm({ ...emptyForm, city_id: (!isSuperAdmin && cityId) ? cityId : '' })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditItem(row)
    setForm({
      name_ar:          row.nameAr          || row.name_ar          || '',
      name_en:          row.nameEn          || row.name_en          || '',
      phone:            row.phone           || '',
      whatsapp:         row.whatsapp        || '',
      category_id:      row.categoryId      || row.category_id      || '',
      city_id:          row.cityId          || row.city_id          || '',
      area:             row.area            || '',
      experience_years: row.experienceYears ?? row.experience_years ?? 0,
      price_from:       row.priceFrom       ?? row.price_from       ?? 0,
      price_to:         row.priceTo         ?? row.price_to         ?? 0,
      status:           row.status          || 'available',
      description_ar:   row.descriptionAr   || row.description_ar   || '',
      description_en:   row.descriptionEn   || row.description_en   || '',
      profile_photo:    row.profilePhoto    || row.profile_photo    || '',
      facebook:         row.facebook        || '',
      instagram:        row.instagram       || '',
      emergency:        row.emergency       ?? false,
      available_now:    row.availableNow    ?? row.available_now    ?? false,
      is_featured:      row.isFeatured      ?? row.is_featured      ?? false,
      is_approved:      row.isApproved      ?? row.is_approved      ?? true,
      is_active:        row.isActive        ?? row.is_active        ?? true,
      rating:           row.rating          || 0,
      reviews_count:    row.reviewsCount    || row.reviews_count    || 0,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      experience_years: parseInt(form.experience_years) || 0,
      price_from: parseFloat(form.price_from) || 0,
      price_to:   parseFloat(form.price_to)   || 0,
      rating:     parseFloat(form.rating)     || 0,
      reviews_count: parseInt(form.reviews_count) || 0,
    }
    try {
      if (editItem) {
        await api.admin.technicians.update(editItem.id, payload)
        showToast('تم تعديل الفني بنجاح')
      } else {
        await api.admin.technicians.create({ id: 'ta_' + Date.now(), ...payload })
        showToast('تم إضافة الفني بنجاح')
      }
      setModalOpen(false)
      reloadTechs()
    } catch { showToast('حدث خطأ', 'error') }
    setSaving(false)
  }

  const handleDelete = async (row) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفني؟')) return
    try {
      await api.admin.technicians.delete(row.id)
      showToast('تم حذف الفني')
      reloadTechs()
    } catch { showToast('حدث خطأ', 'error') }
  }

  const toggleField = async (row, field, labelOpts) => {
    const camel = field === 'is_approved' ? 'isApproved' : field === 'is_featured' ? 'isFeatured' : 'isActive'
    const cur = row[camel] ?? row[field] ?? false
    try {
      await api.admin.technicians.update(row.id, { [field]: !cur })
      setAllTechs(prev => prev.map(t => t.id === row.id ? { ...t, [camel]: !cur, [field]: !cur } : t))
      showToast(!cur ? labelOpts[0] : labelOpts[1])
    } catch { showToast('حدث خطأ', 'error') }
  }

  const toggleActive = async (row) => {
    const cur = row.isActive ?? row.is_active ?? true
    const newStatus = !cur ? (row.status === 'inactive' ? 'available' : row.status) : 'inactive'
    try {
      await api.admin.technicians.update(row.id, { is_active: !cur, status: newStatus })
      setAllTechs(prev => prev.map(t => t.id === row.id ? { ...t, isActive: !cur, is_active: !cur, status: newStatus } : t))
      showToast(!cur ? 'تم تفعيل الفني' : 'تم تعطيل الفني')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  return (
    <div className="space-y-4" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <DetailModal tech={viewItem} cities={cities} categories={categories} onClose={() => setViewItem(null)} onEdit={openEdit} />
      <TechFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `تعديل: ${editItem.nameAr || editItem.name_ar || ''}` : 'إضافة فني جديد'}
        form={form} setForm={setForm}
        onSubmit={handleSubmit} saving={saving}
        cities={cities} categories={categories}
        isSuperAdmin={isSuperAdmin} cityId={cityId}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#071B33]">الفنيون</h1>
          <p className="text-sm text-slate-500 mt-0.5">إدارة جميع الفنيين في الدليل ({total} فني)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] hover:bg-[#e86d00] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
          <Plus className="w-4 h-4" /> إضافة فني
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث بالاسم أو الهاتف..."
            className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#FF7900]/40 transition"
          />
          {isSuperAdmin && (
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1) }} className="select-field">
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.nameAr || c.name_ar}</option>)}
            </select>
          )}
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }} className="select-field">
            <option value="">كل التخصصات</option>
            {SECTIONS.map(sec => {
              const cats = SERVICES_CATS.filter(c => c.sectionId === sec.id && c.id !== 'more')
              if (!cats.length) return null
              return (
                <optgroup key={sec.id} label={sec.nameAr}>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
                </optgroup>
              )
            })}
            <option value="more_services">✏️ تخصص آخر (مخصص)</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="select-field">
            <option value="">كل الحالات</option>
            <option value="available">متاح</option>
            <option value="busy">مشغول</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs">
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">الفني</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">القسم / التخصص</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">المدينة</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">السعر</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">تفعيل</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">اعتماد</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">تمييز</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-[#FF7900] rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-slate-400">لا يوجد فنيون</td></tr>
              ) : data.map(row => {
                const active   = row.isActive   ?? row.is_active   ?? true
                const approved = row.isApproved ?? row.is_approved ?? true
                const featured = row.isFeatured ?? row.is_featured ?? false
                const photo    = getFileUrl(row.profilePhoto || row.profile_photo || null)
                const initials = (row.nameAr || row.name_ar || '').split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2)
                const pFrom    = row.priceFrom ?? row.price_from ?? 0
                const pTo      = row.priceTo   ?? row.price_to   ?? 0
                return (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                          {photo
                            ? <img src={photo} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gradient-to-br from-[#FF7900]/20 to-[#071B33] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-[#071B33] text-sm">{row.nameAr || row.name_ar || '—'}</p>
                          <p className="text-xs text-slate-500" dir="ltr">{row.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row._sectionName && <p className="text-xs text-[#FF7900]/70 font-medium">{row._sectionName}</p>}
                      <p className="text-sm text-slate-600">{row._catName || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      <p>{row._cityName || '—'}</p>
                      {row.area && <p className="text-xs text-slate-500">{row.area}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const map = {
                          available: ['متاح',    'text-emerald-400 bg-emerald-500/10'],
                          busy:      ['مشغول',   'text-amber-400 bg-amber-500/10'],
                          inactive:  ['غير نشط', 'text-slate-500 bg-slate-100'],
                        }
                        const [l, c] = map[row.status] || map.inactive
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{l}</span>
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {pFrom > 0 || pTo > 0
                        ? <>{pFrom > 0 ? pFrom : '—'}{pTo > 0 ? ` - ${pTo}` : ''} <span className="text-[10px]">د.ل</span></>
                        : '—'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(row)} className={`text-xs flex items-center gap-1 ${active ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(row, 'is_approved', ['تم اعتماد الفني', 'تم إلغاء الاعتماد'])} className={`${approved ? 'text-blue-400' : 'text-red-400/50'}`}>
                        {approved ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(row, 'is_featured', ['تم تمييز الفني', 'تم إلغاء التمييز'])} className={featured ? 'text-[#FF7900]' : 'text-slate-300'}>
                        <Star className="w-4 h-4" fill={featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewItem(row)} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="عرض التفاصيل">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors" title="تعديل">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => handleDelete(row)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">صفحة {page} من {totalPages} — {total} فني</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs disabled:opacity-30 hover:bg-slate-200 transition-colors">
                السابق
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs disabled:opacity-30 hover:bg-slate-200 transition-colors">
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
