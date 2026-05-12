import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, Image, Link2, MapPin, Calendar, Search, Megaphone,
  Monitor, LayoutGrid, Users, Sparkles,
} from 'lucide-react'
import api from '../../lib/api'

const PLACEMENTS = [
  { value: 'home',        labelAr: 'الصفحة الرئيسية',  icon: Monitor,     color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { value: 'categories',  labelAr: 'صفحة التخصصات',   icon: LayoutGrid,  color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  { value: 'technicians', labelAr: 'قائمة الفنيين',    icon: Users,       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'banner',      labelAr: 'بانر عام',          icon: Sparkles,    color: 'text-amber-400',   bg: 'bg-amber-500/10' },
]

const emptyForm = {
  title_ar: '', title_en: '',
  description_ar: '', description_en: '',
  image_url: '', link_url: '',
  placement: 'home', is_active: true,
  start_date: '', end_date: '',
}

function PlacementBadge({ placement }) {
  const p = PLACEMENTS.find(x => x.value === placement)
  if (!p) return <span className="text-xs text-[#666680]">{placement || '—'}</span>
  const Icon = p.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${p.bg} ${p.color}`}>
      <Icon className="w-3 h-3" />
      {p.labelAr}
    </span>
  )
}

function AdCard({ ad, onEdit, onDelete, onToggle }) {
  const isActive = ad.is_active ?? ad.isActive ?? true
  const titleAr  = ad.title_ar  || ad.titleAr  || '—'
  const titleEn  = ad.title_en  || ad.titleEn  || ''
  const descAr   = ad.description_ar || ad.descriptionAr || ''
  const imageUrl = ad.image_url || ad.imageUrl || ''
  const linkUrl  = ad.link_url  || ad.linkUrl  || ''
  const placement = ad.placement || ''
  const startDate = ad.start_date || ad.startDate || ''
  const endDate   = ad.end_date   || ad.endDate   || ''

  return (
    <div className={`bg-[#12121E] rounded-2xl border overflow-hidden transition-all ${isActive ? 'border-white/8' : 'border-white/4 opacity-60'}`}>
      {imageUrl ? (
        <div className="relative h-36 bg-[#0A0A14]">
          <img
            src={imageUrl}
            alt={titleAr}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
          <div className="hidden w-full h-full items-center justify-center">
            <Image className="w-8 h-8 text-[#333350]" />
          </div>
          <div className="absolute top-2 right-2">
            <PlacementBadge placement={placement} />
          </div>
          <div className="absolute top-2 left-2">
            <button
              onClick={() => onToggle(ad.id, isActive)}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow ${isActive ? 'bg-emerald-500 text-white' : 'bg-[#1a1a28] text-[#666680] border border-white/10'}`}
            >
              {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              {isActive ? 'نشط' : 'معطل'}
            </button>
          </div>
        </div>
      ) : (
        <div className={`h-36 flex flex-col items-center justify-center gap-2 relative ${
          placement === 'home'        ? 'bg-gradient-to-br from-blue-900/40 to-[#0A0A14]' :
          placement === 'categories'  ? 'bg-gradient-to-br from-purple-900/40 to-[#0A0A14]' :
          placement === 'technicians' ? 'bg-gradient-to-br from-emerald-900/40 to-[#0A0A14]' :
                                        'bg-gradient-to-br from-amber-900/40 to-[#0A0A14]'
        }`}>
          <Megaphone className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-xs">لا توجد صورة</p>
          <div className="absolute top-2 right-2">
            <PlacementBadge placement={placement} />
          </div>
          <div className="absolute top-2 left-2">
            <button
              onClick={() => onToggle(ad.id, isActive)}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow ${isActive ? 'bg-emerald-500 text-white' : 'bg-[#1a1a28] text-[#666680] border border-white/10'}`}
            >
              {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              {isActive ? 'نشط' : 'معطل'}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2">
        <div>
          <p className="font-bold text-white text-sm leading-tight">{titleAr}</p>
          {titleEn && <p className="text-xs text-[#555570] mt-0.5" dir="ltr">{titleEn}</p>}
        </div>
        {descAr && <p className="text-xs text-[#666680] line-clamp-2 leading-relaxed">{descAr}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          {linkUrl && (
            <span className="flex items-center gap-1 text-[10px] text-blue-400/70 bg-blue-500/8 px-2 py-0.5 rounded-full">
              <Link2 className="w-2.5 h-2.5" />
              رابط
            </span>
          )}
          {(startDate || endDate) && (
            <span className="flex items-center gap-1 text-[10px] text-[#555570] bg-white/4 px-2 py-0.5 rounded-full">
              <Calendar className="w-2.5 h-2.5" />
              {startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
              {endDate ? ` ← ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex border-t border-white/5">
        <button
          onClick={() => onEdit(ad)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-[#8888A8] hover:text-blue-400 hover:bg-blue-500/5 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> تعديل
        </button>
        <div className="w-px bg-white/5" />
        <button
          onClick={() => onDelete(ad.id)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-[#8888A8] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> حذف
        </button>
      </div>
    </div>
  )
}

function AdFormModal({ open, onClose, title, form, setForm, onSubmit, saving }) {
  if (!open) return null

  const F = ({ label, children }) => (
    <div>
      <label className="block text-xs font-bold text-[#8888A8] mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
  const inp = "w-full bg-[#0A0A14] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#444460] focus:outline-none focus:border-[#FF7900]/50 focus:ring-1 focus:ring-[#FF7900]/20 transition"

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-[#0E0E17] border border-white/8 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0E0E17] z-10 rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="font-bold text-white text-base">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8888A8]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="العنوان بالعربي">
              <input value={form.title_ar} onChange={e => setForm(f => ({...f, title_ar: e.target.value}))} className={inp} placeholder="عنوان الإعلان" />
            </F>
            <F label="العنوان بالإنجليزي">
              <input value={form.title_en} onChange={e => setForm(f => ({...f, title_en: e.target.value}))} className={inp} placeholder="Ad Title" dir="ltr" />
            </F>
            <F label="الوصف بالعربي">
              <textarea rows={2} value={form.description_ar} onChange={e => setForm(f => ({...f, description_ar: e.target.value}))} className={inp + ' resize-none'} placeholder="وصف مختصر..." />
            </F>
            <F label="الوصف بالإنجليزي">
              <textarea rows={2} value={form.description_en} onChange={e => setForm(f => ({...f, description_en: e.target.value}))} className={inp + ' resize-none'} placeholder="Short description..." dir="ltr" />
            </F>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="رابط الصورة">
              <div className="relative">
                <Image className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444460]" />
                <input value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} className={inp + ' pr-9'} placeholder="https://..." dir="ltr" />
              </div>
            </F>
            <F label="رابط الإعلان">
              <div className="relative">
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444460]" />
                <input value={form.link_url} onChange={e => setForm(f => ({...f, link_url: e.target.value}))} className={inp + ' pr-9'} placeholder="https://..." dir="ltr" />
              </div>
            </F>
          </div>

          <F label="مكان الإعلان">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLACEMENTS.map(p => {
                const Icon = p.icon
                const selected = form.placement === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm(f => ({...f, placement: p.value}))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      selected
                        ? `border-[#FF7900] bg-[#FF7900]/10 ${p.color}`
                        : 'border-white/8 bg-white/2 text-[#666680] hover:border-white/15'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {p.labelAr}
                  </button>
                )
              })}
            </div>
          </F>

          <div className="grid grid-cols-2 gap-4">
            <F label="تاريخ البداية">
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className={inp} />
            </F>
            <F label="تاريخ النهاية">
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className={inp} />
            </F>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">حالة الإعلان</p>
              <p className="text-xs text-[#555570] mt-0.5">{form.is_active ? 'الإعلان نشط ويظهر للمستخدمين' : 'الإعلان معطل ولا يظهر'}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({...f, is_active: !f.is_active}))}
              className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-[#333350]'}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {form.image_url && (
            <div>
              <p className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-2">معاينة الصورة</p>
              <img src={form.image_url} alt="preview" className="w-full h-40 object-cover rounded-xl border border-white/8" onError={e => e.target.style.display='none'} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#FF7900] hover:bg-[#e86d00] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الحفظ...</>
                : title.includes('تعديل') ? 'حفظ التعديلات' : 'إضافة الإعلان'
              }
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/8 text-[#8888A8] text-sm font-medium transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Ads() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterPlacement, setFilterPlacement] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const reload = () => {
    setLoading(true)
    api.admin.ads.list()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const filtered = data.filter(r => {
    const titleAr = r.title_ar || r.titleAr || ''
    const titleEn = r.title_en || r.titleEn || ''
    const matchSearch = !search || titleAr.includes(search) || titleEn.toLowerCase().includes(search.toLowerCase())
    const matchPlacement = !filterPlacement || (r.placement === filterPlacement)
    return matchSearch && matchPlacement
  })

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (row) => {
    setEditItem(row)
    setForm({
      title_ar:       row.title_ar       || row.titleAr        || '',
      title_en:       row.title_en       || row.titleEn        || '',
      description_ar: row.description_ar || row.descriptionAr  || '',
      description_en: row.description_en || row.descriptionEn  || '',
      image_url:      row.image_url      || row.imageUrl       || '',
      link_url:       row.link_url       || row.linkUrl        || '',
      placement:      row.placement      || 'home',
      is_active:      row.is_active      ?? row.isActive       ?? true,
      start_date:     row.start_date     || row.startDate      || '',
      end_date:       row.end_date       || row.endDate        || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, start_date: form.start_date || null, end_date: form.end_date || null }
      if (editItem) {
        await api.admin.ads.update(editItem.id, payload)
        showToast('تم تعديل الإعلان بنجاح')
      } else {
        await api.admin.ads.create({ id: 'ad_' + Date.now(), ...payload })
        showToast('تم إضافة الإعلان بنجاح')
      }
      setModalOpen(false); reload()
    } catch (err) { showToast(err.message || 'حدث خطأ', 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    try { await api.admin.ads.delete(id); showToast('تم حذف الإعلان'); reload() }
    catch { showToast('حدث خطأ', 'error') }
  }

  const toggleActive = async (id, currentVal) => {
    try {
      await api.admin.ads.update(id, { is_active: !currentVal })
      setData(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentVal, isActive: !currentVal } : a))
    } catch { showToast('حدث خطأ', 'error') }
  }

  const activeCount   = data.filter(a => a.is_active ?? a.isActive).length
  const inactiveCount = data.length - activeCount

  return (
    <div className="space-y-5" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <AdFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'تعديل إعلان' : 'إضافة إعلان جديد'}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">الإعلانات</h1>
          <p className="text-sm text-[#666680] mt-0.5">إدارة الإعلانات المعروضة في التطبيق</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-[#FF7900] hover:bg-[#e86d00] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة إعلان
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#12121E] rounded-2xl border border-white/5 p-4 text-center">
          <p className="text-3xl font-black text-white">{data.length}</p>
          <p className="text-xs text-[#666680] mt-1 font-medium">إجمالي الإعلانات</p>
        </div>
        <div className="bg-[#12121E] rounded-2xl border border-white/5 p-4 text-center">
          <p className="text-3xl font-black text-emerald-400">{activeCount}</p>
          <p className="text-xs text-[#666680] mt-1 font-medium">نشطة</p>
        </div>
        <div className="bg-[#12121E] rounded-2xl border border-white/5 p-4 text-center">
          <p className="text-3xl font-black text-[#444460]">{inactiveCount}</p>
          <p className="text-xs text-[#666680] mt-1 font-medium">معطلة</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444460]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن إعلان..."
            className="w-full bg-[#12121E] border border-white/8 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-[#444460] focus:outline-none focus:border-[#FF7900]/40 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterPlacement('')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${!filterPlacement ? 'bg-[#FF7900] text-white' : 'bg-white/5 text-[#666680] hover:text-white hover:bg-white/8'}`}
          >
            الكل
          </button>
          {PLACEMENTS.map(p => {
            const Icon = p.icon
            const active = filterPlacement === p.value
            return (
              <button
                key={p.value}
                onClick={() => setFilterPlacement(active ? '' : p.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${active ? `${p.bg} ${p.color} border border-current/30` : 'bg-white/5 text-[#666680] hover:text-white hover:bg-white/8'}`}
              >
                <Icon className="w-3 h-3" />
                {p.labelAr}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#FF7900] rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Megaphone className="w-12 h-12 text-[#222235] mx-auto mb-3" />
          <p className="text-[#555570] font-medium">لا توجد إعلانات</p>
          {!search && !filterPlacement && (
            <button onClick={openAdd} className="mt-4 text-sm text-[#FF7900] hover:underline">
              أضف أول إعلان
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ad => (
            <AdCard
              key={ad.id}
              ad={ad}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={toggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
