import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../lib/api'
import { sections } from '../../data/services'

const ICONS = ['Zap','Droplets','Wind','Paintbrush','Hammer','Sparkles','Truck','Camera','Wifi','Wrench','Tv','Flame','Square','Droplet','Thermometer','Gauge','Lock','Building2','AirVent','Grid3X3','Star','Package','Settings','Home']

export default function Categories() {
  const { logActivity } = useAdmin()
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]     = useState({ name_ar: '', name_en: '', icon: 'Wrench', sort_order: 0, section_id: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const normalize = (row) => ({
    id:         row.id,
    name_ar:    row.name_ar    || row.nameAr    || '',
    name_en:    row.name_en    || row.nameEn    || '',
    icon:       row.icon       || row.iconName  || 'Wrench',
    section_id: row.section_id || row.sectionId || '',
    sort_order: row.sort_order ?? row.sortOrder  ?? 0,
    is_active:  row.is_active  ?? row.isActive  ?? true,
  })

  const reload = () => {
    setLoading(true)
    api.admin.categories.list()
      .then(rows => {
        const normalized = rows.map(normalize)
        normalized.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        setData(normalized)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const filtered = data.filter(r => !search || r.name_ar?.includes(search) || r.name_en?.toLowerCase().includes(search.toLowerCase()))

  const openAdd  = () => { setEditItem(null); setForm({ name_ar: '', name_en: '', icon: 'Wrench', sort_order: data.length + 1, section_id: '' }); setModalOpen(true) }
  const openEdit = (row) => {
    setEditItem(row)
    setForm({ name_ar: row.name_ar, name_en: row.name_en, icon: row.icon || 'Wrench', sort_order: row.sort_order || 0, section_id: row.section_id || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 }
      if (editItem) {
        await api.admin.categories.update(editItem.id, payload)
        showToast('تم تعديل التخصص')
      } else {
        await api.admin.categories.create({ id: 'k_' + Date.now(), is_active: true, ...payload })
        showToast('تم إضافة التخصص')
      }
      setModalOpen(false); reload()
    } catch (err) { showToast(err.message, 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try { await api.admin.categories.delete(id); showToast('تم الحذف'); reload() }
    catch { showToast('حدث خطأ', 'error') }
  }

  const toggleActive = async (id, val) => {
    try {
      await api.admin.categories.update(id, { is_active: !val })
      setData(prev => prev.map(c => c.id === id ? { ...c, is_active: !val } : c))
    } catch { showToast('حدث خطأ', 'error') }
  }

  const getSectionLabel = (sectionId) => {
    const s = sections.find(sec => sec.id === sectionId)
    return s ? s.nameAr : (sectionId || '—')
  }

  const columns = [
    { key: 'icon', label: 'الأيقونة', width: '80px', render: (v) => <span className="text-[#FF7900] font-mono text-xs bg-[#FF7900]/10 px-2 py-1 rounded-lg">{v || 'Wrench'}</span> },
    { key: 'name_ar', label: 'الاسم عربي',     render: (v) => <span className="font-medium text-white">{v}</span> },
    { key: 'name_en', label: 'الاسم إنجليزي',  render: (v) => <span dir="ltr" className="text-[#8888A8]">{v}</span> },
    { key: 'section_id', label: 'القسم', render: (v) => <span className="text-xs text-[#8888A8]">{getSectionLabel(v)}</span> },
    { key: 'sort_order', label: 'الترتيب', width: '70px' },
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
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث عن تخصص..."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة تخصص
          </button>
        }
        emptyMessage="لا توجد تخصصات"
      />
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'تعديل تخصص' : 'إضافة تخصص'} onSubmit={handleSubmit} loading={saving} submitLabel={editItem ? 'حفظ' : 'إضافة'}>
        <div className="space-y-4">
          <div><label className="form-label">الاسم بالعربي *</label><input required value={form.name_ar} onChange={e => setForm(f => ({...f, name_ar: e.target.value}))} className="form-input" placeholder="كهرباء" /></div>
          <div><label className="form-label">الاسم بالإنجليزي *</label><input required value={form.name_en} onChange={e => setForm(f => ({...f, name_en: e.target.value}))} className="form-input" placeholder="Electricity" dir="ltr" /></div>
          <div>
            <label className="form-label">القسم الرئيسي</label>
            <select value={form.section_id} onChange={e => setForm(f => ({...f, section_id: e.target.value}))} className="form-input">
              <option value="">— بدون قسم —</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">الأيقونة</label>
            <select value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} className="form-input">
              {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div><label className="form-label">الترتيب</label><input type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({...f, sort_order: e.target.value}))} className="form-input" /></div>
        </div>
      </FormModal>
    </div>
  )
}
