import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle, Info } from 'lucide-react'

const PLACEMENTS = [
  { value: 'home',        label: 'الصفحة الرئيسية'   },
  { value: 'categories',  label: 'صفحة التخصصات'    },
  { value: 'technicians', label: 'صفحة الفنيين'      },
  { value: 'banner',      label: 'بانر عام'           },
]

const DEMO_KEY = 'demo_ads_v1'
const DEMO_SEED = [
  {
    id: 'a1', title_ar: 'اطلب فنيك الآن', title_en: 'Book Your Technician Now',
    description_ar: 'أسرع خدمة صيانة في ليبيا', description_en: 'Fastest maintenance in Libya',
    image_url: 'https://placehold.co/600x200/FF7900/white?text=Otlob+Fanni',
    link_url: '/', placement: 'home', is_active: true,
    start_date: '2026-05-01', end_date: '2026-06-01', created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'a2', title_ar: 'خدمة الكهرباء المنزلية', title_en: 'Home Electrical Service',
    description_ar: 'فنيون معتمدون لكل أعمال الكهرباء', description_en: 'Certified electricians for all electrical work',
    image_url: 'https://placehold.co/600x200/071B33/white?text=Electricity',
    link_url: '/category/electricity', placement: 'categories', is_active: true,
    start_date: '2026-05-05', end_date: '2026-05-31', created_at: '2026-05-05T09:00:00Z',
  },
  {
    id: 'a3', title_ar: 'عرض صيانة الصيف', title_en: 'Summer Maintenance Offer',
    description_ar: 'خصم 20% على خدمات التكييف والتبريد', description_en: '20% off on AC & cooling services',
    image_url: 'https://placehold.co/600x200/4CAF50/white?text=Summer+Offer',
    link_url: '/category/ac', placement: 'banner', is_active: false,
    start_date: '2026-06-01', end_date: '2026-08-31', created_at: '2026-05-02T14:00:00Z',
  },
]

const emptyForm = { title_ar: '', title_en: '', description_ar: '', description_en: '', image_url: '', link_url: '', placement: 'home', is_active: true, start_date: '', end_date: '' }

const loadDemo = () => { try { const r = localStorage.getItem(DEMO_KEY); if (r) return JSON.parse(r) } catch(_){} return DEMO_SEED }
const saveDemo = (l) => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(l)) } catch(_){} }

export default function Ads() {
  const { logActivity, isDemoMode } = useAdmin()
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (isDemoMode) { setData(loadDemo()); setLoading(false); return }
    if (isSupabaseConfigured && supabase) loadData()
  }, [isDemoMode])

  const loadData = async () => {
    setLoading(true)
    const { data: rows } = await supabase.from('ads').select('*').order('created_at', { ascending: false })
    setData(rows || []); setLoading(false)
  }

  const persist = (next) => { setData(next); saveDemo(next) }

  const filtered = data.filter(r => !search || r.title_ar?.includes(search) || r.title_en?.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (row) => {
    setEditItem(row)
    setForm({ title_ar: row.title_ar||'', title_en: row.title_en||'', description_ar: row.description_ar||'', description_en: row.description_en||'', image_url: row.image_url||'', link_url: row.link_url||'', placement: row.placement||'home', is_active: row.is_active??true, start_date: row.start_date||'', end_date: row.end_date||'' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, start_date: form.start_date || null, end_date: form.end_date || null }
      if (isDemoMode) {
        if (editItem) {
          persist(data.map(a => a.id === editItem.id ? { ...a, ...payload } : a))
          showToast('تم تعديل الإعلان (تجريبي)')
        } else {
          persist([{ id: 'a' + Date.now(), created_at: new Date().toISOString(), ...payload }, ...data])
          showToast('تم إضافة الإعلان (تجريبي)')
        }
        setModalOpen(false); setSaving(false); return
      }
      if (editItem) {
        await supabase.from('ads').update(payload).eq('id', editItem.id)
        await logActivity('update_ad', 'ads', editItem.id, `Updated: ${form.title_ar}`)
        showToast('تم تعديل الإعلان')
      } else {
        await supabase.from('ads').insert(payload)
        await logActivity('add_ad', 'ads', null, `Added: ${form.title_ar}`)
        showToast('تم إضافة الإعلان')
      }
      setModalOpen(false); loadData()
    } catch (err) { showToast(err.message, 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    if (isDemoMode) { persist(data.filter(a => a.id !== id)); showToast('تم الحذف (تجريبي)'); return }
    await supabase.from('ads').delete().eq('id', id)
    showToast('تم حذف الإعلان'); loadData()
  }

  const toggleActive = async (id, val) => {
    if (isDemoMode) { persist(data.map(a => a.id === id ? { ...a, is_active: !val } : a)); return }
    await supabase.from('ads').update({ is_active: !val }).eq('id', id); loadData()
  }

  const columns = [
    {
      key: 'title_ar', label: 'الإعلان',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          {row.image_url && <img src={row.image_url} alt="" className="w-12 h-8 object-cover rounded-lg flex-shrink-0" onError={e => e.target.style.display='none'} />}
          <div>
            <p className="font-medium text-gray-800">{v || '—'}</p>
            <p className="text-xs text-gray-400">{row.title_en || ''}</p>
          </div>
        </div>
      )
    },
    { key: 'placement', label: 'المكان', render: (v) => PLACEMENTS.find(p => p.value === v)?.label || v || '—' },
    {
      key: 'start_date', label: 'الفترة',
      render: (v, row) => (
        <span className="text-xs text-gray-500">
          {v ? new Date(v).toLocaleDateString('ar-LY') : '—'}
          {row.end_date ? ` ← ${new Date(row.end_date).toLocaleDateString('ar-LY')}` : ''}
        </span>
      )
    },
    {
      key: 'is_active', label: 'الحالة',
      render: (v, row) => (
        <button onClick={() => toggleActive(row.id, v)} className={`flex items-center gap-1 text-xs font-medium ${v ? 'text-green-600' : 'text-gray-400'}`}>
          {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
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
              <span className="text-sm text-gray-700">إعلان نشط</span>
            </label>
          </div>
          <div><label className="form-label">تاريخ البداية</label><input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className="form-input" /></div>
          <div><label className="form-label">تاريخ النهاية</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className="form-input" /></div>
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
