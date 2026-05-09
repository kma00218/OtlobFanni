import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'

const ICONS = ['Zap','Droplets','Wind','Paintbrush','Hammer','Sparkles','Truck','Camera','Wifi','Wrench','Tv','Flame','Square','Droplet','Thermometer','Gauge','Lock','Building2','AirVent','Grid3X3','Star','Package','Tool','Settings','Home']

export default function Categories() {
  const { logActivity } = useAdmin()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name_ar: '', name_en: '', icon: 'Wrench', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => { if (isSupabaseConfigured && supabase) loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: rows } = await supabase.from('categories').select('*').order('sort_order')
    setData(rows || [])
    setLoading(false)
  }

  const filtered = data.filter(r => !search || r.name_ar?.includes(search) || r.name_en?.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditItem(null); setForm({ name_ar: '', name_en: '', icon: 'Wrench', sort_order: data.length + 1 }); setModalOpen(true) }
  const openEdit = (row) => { setEditItem(row); setForm({ name_ar: row.name_ar, name_en: row.name_en, icon: row.icon || 'Wrench', sort_order: row.sort_order || 0 }); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 }
      if (editItem) {
        await supabase.from('categories').update(payload).eq('id', editItem.id)
        await logActivity('update_category', 'categories', editItem.id, `Updated: ${form.name_ar}`)
        showToast('تم تعديل التخصص')
      } else {
        await supabase.from('categories').insert({ ...payload, is_active: true })
        await logActivity('add_category', 'categories', null, `Added: ${form.name_ar}`)
        showToast('تم إضافة التخصص')
      }
      setModalOpen(false)
      loadData()
    } catch (err) { showToast(err.message, 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await supabase.from('categories').delete().eq('id', id)
    showToast('تم الحذف')
    loadData()
  }

  const toggleActive = async (id, val) => {
    await supabase.from('categories').update({ is_active: !val }).eq('id', id)
    loadData()
  }

  const columns = [
    {
      key: 'icon', label: 'الأيقونة', width: '60px',
      render: (v) => <span className="text-[#FF7900] font-mono text-xs bg-[#FF7900]/10 px-2 py-1 rounded-lg">{v || 'Wrench'}</span>
    },
    { key: 'name_ar', label: 'الاسم عربي', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'name_en', label: 'الاسم إنجليزي', render: (v) => <span dir="ltr" className="text-gray-500">{v}</span> },
    { key: 'sort_order', label: 'الترتيب', width: '80px' },
    {
      key: 'is_active', label: 'الحالة',
      render: (v, row) => (
        <button onClick={() => toggleActive(row.id, v)} className={`flex items-center gap-1 text-xs font-medium ${v ? 'text-green-600' : 'text-gray-400'}`}>
          {v ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {v ? 'نشط' : 'معطل'}
        </button>
      )
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    },
  ]

  if (!isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث عن تخصص..."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة تخصص
          </button>
        }
        emptyMessage="لا توجد تخصصات"
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'تعديل تخصص' : 'إضافة تخصص'} onSubmit={handleSubmit} loading={saving} submitLabel={editItem ? 'حفظ' : 'إضافة'}>
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم بالعربي *</label>
            <input required value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} className="form-input" placeholder="كهرباء" />
          </div>
          <div>
            <label className="form-label">الاسم بالإنجليزي *</label>
            <input required value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="form-input" placeholder="Electricity" dir="ltr" />
          </div>
          <div>
            <label className="form-label">الأيقونة (Lucide icon name)</label>
            <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="form-input">
              {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">الترتيب</label>
            <input type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className="form-input" />
          </div>
        </div>
      </FormModal>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-white rounded-2xl p-8 border border-amber-200 max-w-md">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-1">لم يتم ربط قاعدة البيانات</h3>
        <p className="text-gray-500 text-sm">أضف مفاتيح Supabase في إعدادات المشروع</p>
      </div>
    </div>
  )
}
