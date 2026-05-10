import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle, Info } from 'lucide-react'

const DEMO_KEY = 'demo_cities_v1'
const DEMO_SEED = [
  { id: 'c1',  name_ar: 'طرابلس',  name_en: 'Tripoli',  sort_order: 1,  is_active: true },
  { id: 'c2',  name_ar: 'بنغازي',  name_en: 'Benghazi', sort_order: 2,  is_active: true },
  { id: 'c3',  name_ar: 'مصراتة',  name_en: 'Misrata',  sort_order: 3,  is_active: true },
  { id: 'c4',  name_ar: 'الزاوية', name_en: 'Zawiya',   sort_order: 4,  is_active: true },
  { id: 'c5',  name_ar: 'سبها',    name_en: 'Sabha',    sort_order: 5,  is_active: true },
  { id: 'c6',  name_ar: 'زوارة',   name_en: 'Zuwara',   sort_order: 6,  is_active: true },
  { id: 'c7',  name_ar: 'زليتن',   name_en: 'Zliten',   sort_order: 7,  is_active: true },
  { id: 'c8',  name_ar: 'الخمس',   name_en: 'Al Khoms', sort_order: 8,  is_active: true },
  { id: 'c9',  name_ar: 'سرت',     name_en: 'Sirte',    sort_order: 9,  is_active: true },
  { id: 'c10', name_ar: 'طبرق',    name_en: 'Tobruk',   sort_order: 10, is_active: true },
]
const loadDemo = () => {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return DEMO_SEED
}
const saveDemo = (list) => {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)) } catch (_) {}
}

export default function Cities() {
  const { logActivity, isDemoMode } = useAdmin()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name_ar: '', name_en: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (isDemoMode) {
      const list = loadDemo()
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      setData(list)
      setLoading(false)
      return
    }
    if (isSupabaseConfigured && supabase) loadData()
  }, [isDemoMode])

  const loadData = async () => {
    setLoading(true)
    const { data: rows } = await supabase.from('cities').select('*').order('sort_order')
    setData(rows || [])
    setLoading(false)
  }

  const persistDemo = (next) => {
    next.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    setData(next)
    saveDemo(next)
  }

  const filtered = data.filter(r => !search || r.name_ar?.includes(search) || r.name_en?.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditItem(null); setForm({ name_ar: '', name_en: '', sort_order: data.length + 1 }); setModalOpen(true) }
  const openEdit = (row) => { setEditItem(row); setForm({ name_ar: row.name_ar, name_en: row.name_en, sort_order: row.sort_order || 0 }); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 }

      if (isDemoMode) {
        if (editItem) {
          persistDemo(data.map(c => c.id === editItem.id ? { ...c, ...payload } : c))
          showToast('تم تعديل المدينة (تجريبي)')
        } else {
          persistDemo([...data, { id: 'c' + Date.now(), is_active: true, ...payload }])
          showToast('تم إضافة المدينة (تجريبي)')
        }
        setModalOpen(false)
        setSaving(false)
        return
      }

      if (editItem) {
        await supabase.from('cities').update(payload).eq('id', editItem.id)
        await logActivity('update_city', 'cities', editItem.id, `Updated: ${form.name_ar}`)
        showToast('تم تعديل المدينة')
      } else {
        await supabase.from('cities').insert({ ...payload, is_active: true })
        await logActivity('add_city', 'cities', null, `Added: ${form.name_ar}`)
        showToast('تم إضافة المدينة')
      }
      setModalOpen(false)
      loadData()
    } catch (err) { showToast(err.message, 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه المدينة؟')) return
    if (isDemoMode) {
      persistDemo(data.filter(c => c.id !== id))
      showToast('تم حذف المدينة (تجريبي)')
      return
    }
    const { error } = await supabase.from('cities').delete().eq('id', id)
    if (error) { showToast('لا يمكن حذف مدينة مرتبطة بفنيين', 'error'); return }
    showToast('تم حذف المدينة')
    loadData()
  }

  const toggleActive = async (id, val) => {
    if (isDemoMode) {
      persistDemo(data.map(c => c.id === id ? { ...c, is_active: !val } : c))
      return
    }
    await supabase.from('cities').update({ is_active: !val }).eq('id', id)
    loadData()
  }

  const columns = [
    { key: 'name_ar', label: 'الاسم عربي', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'name_en', label: 'الاسم إنجليزي', render: (v) => <span dir="ltr" className="text-gray-500">{v}</span> },
    { key: 'sort_order', label: 'الترتيب', width: '80px' },
    {
      key: 'is_active', label: 'الحالة',
      render: (v, row) => (
        <button onClick={() => toggleActive(row.id, v)} className={`flex items-center gap-1 text-xs font-medium ${v ? 'text-green-600' : 'text-gray-400'}`}>
          {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {v ? 'نشطة' : 'معطلة'}
        </button>
      )
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    },
  ]

  if (!isDemoMode && !isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      {isDemoMode && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>وضع تجريبي — التعديلات لا تُحفظ في قاعدة البيانات.</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث عن مدينة..."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة مدينة
          </button>
        }
        emptyMessage="لا توجد مدن"
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'تعديل مدينة' : 'إضافة مدينة'} onSubmit={handleSubmit} loading={saving} submitLabel={editItem ? 'حفظ' : 'إضافة'}>
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم بالعربي *</label>
            <input required value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} className="form-input" placeholder="طرابلس" />
          </div>
          <div>
            <label className="form-label">الاسم بالإنجليزي *</label>
            <input required value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="form-input" placeholder="Tripoli" dir="ltr" />
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
