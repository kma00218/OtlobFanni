import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../lib/api'

const PLACEMENTS = [
  { value: 'home',        label: 'الصفحة الرئيسية'   },
  { value: 'categories',  label: 'صفحة التخصصات'    },
  { value: 'technicians', label: 'صفحة الفنيين'      },
  { value: 'banner',      label: 'بانر عام'           },
]

const emptyForm = { title_ar: '', title_en: '', description_ar: '', description_en: '', image_url: '', link_url: '', placement: 'home', is_active: true, start_date: '', end_date: '' }

export default function Ads() {
  const { logActivity } = useAdmin()
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
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

  const filtered = data.filter(r => !search || r.title_ar?.includes(search) || r.title_en?.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (row) => {
    setEditItem(row)
    setForm({
      title_ar: row.title_ar||'', title_en: row.title_en||'',
      description_ar: row.description_ar||'', description_en: row.description_en||'',
      image_url: row.image_url||'', link_url: row.link_url||'',
      placement: row.placement||'home', is_active: row.is_active??true,
      start_date: row.start_date||'', end_date: row.end_date||''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, start_date: form.start_date || null, end_date: form.end_date || null }
      if (editItem) {
        await api.admin.ads.update(editItem.id, payload)
        showToast('تم تعديل الإعلان')
      } else {
        await api.admin.ads.create({ id: 'ad_' + Date.now(), ...payload })
        showToast('تم إضافة الإعلان')
      }
      setModalOpen(false); reload()
    } catch (err) { showToast(err.message, 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    try { await api.admin.ads.delete(id); showToast('تم حذف الإعلان'); reload() }
    catch { showToast('حدث خطأ', 'error') }
  }

  const toggleActive = async (id, val) => {
    try {
      await api.admin.ads.update(id, { is_active: !val })
      setData(prev => prev.map(a => a.id === id ? { ...a, is_active: !val } : a))
    } catch { showToast('حدث خطأ', 'error') }
  }

  const columns = [
    {
      key: 'title_ar', label: 'الإعلان',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          {row.image_url && <img src={row.image_url} alt="" className="w-12 h-8 object-cover rounded-lg flex-shrink-0" onError={e => e.target.style.display='none'} />}
          <div>
            <p className="font-medium text-white">{v || '—'}</p>
            <p className="text-xs text-[#555570]">{row.title_en || ''}</p>
          </div>
        </div>
      )
    },
    { key: 'placement', label: 'المكان', render: (v) => PLACEMENTS.find(p => p.value === v)?.label || v || '—' },
    {
      key: 'start_date', label: 'الفترة',
      render: (v, row) => (
        <span className="text-xs text-[#666680]">
          {v ? new Date(v).toLocaleDateString('en-GB') : '—'}
          {row.end_date ? ` ← ${new Date(row.end_date).toLocaleDateString('en-GB')}` : ''}
        </span>
      )
    },
    {
      key: 'is_active', label: 'الحالة',
      render: (v, row) => (
        <button onClick={() => toggleActive(row.id, v)} className={`flex items-center gap-1 text-xs font-medium ${v ? 'text-emerald-400' : 'text-[#444460]'}`}>
          {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {v ? 'نشط' : 'معطل'}
        </button>
      )
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}
      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث عن إعلان..."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة إعلان
          </button>
        }
        emptyMessage="لا توجد إعلانات"
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'تعديل إعلان' : 'إضافة إعلان'} onSubmit={handleSubmit} loading={saving} submitLabel={editItem ? 'حفظ' : 'إضافة'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">العنوان بالعربي</label><input value={form.title_ar} onChange={e => setForm(f => ({...f, title_ar: e.target.value}))} className="form-input" placeholder="عنوان الإعلان" /></div>
          <div><label className="form-label">العنوان بالإنجليزي</label><input value={form.title_en} onChange={e => setForm(f => ({...f, title_en: e.target.value}))} className="form-input" placeholder="Ad Title" dir="ltr" /></div>
          <div><label className="form-label">الوصف بالعربي</label><textarea rows={2} value={form.description_ar} onChange={e => setForm(f => ({...f, description_ar: e.target.value}))} className="form-input resize-none" /></div>
          <div><label className="form-label">الوصف بالإنجليزي</label><textarea rows={2} value={form.description_en} onChange={e => setForm(f => ({...f, description_en: e.target.value}))} className="form-input resize-none" dir="ltr" /></div>
          <div><label className="form-label">رابط الصورة</label><input value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} className="form-input" placeholder="https://..." dir="ltr" /></div>
          <div><label className="form-label">رابط الإعلان</label><input value={form.link_url} onChange={e => setForm(f => ({...f, link_url: e.target.value}))} className="form-input" placeholder="https://..." dir="ltr" /></div>
          <div>
            <label className="form-label">مكان الإعلان</label>
            <select value={form.placement} onChange={e => setForm(f => ({...f, placement: e.target.value}))} className="form-input">
              {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">الحالة</label>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="w-4 h-4 accent-[#FF7900]" />
              <span className="text-sm text-[#C0C0D8]">إعلان نشط</span>
            </label>
          </div>
          <div><label className="form-label">تاريخ البداية</label><input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className="form-input" /></div>
          <div><label className="form-label">تاريخ النهاية</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className="form-input" /></div>
        </div>
      </FormModal>
    </div>
  )
}
