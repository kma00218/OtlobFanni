import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

const PAGE_SIZE = 15

const emptyForm = {
  name_ar: '', name_en: '', phone: '', whatsapp: '', category_id: '', city_id: '',
  experience_years: 0, price_from: 0, status: 'available', description_ar: '', description_en: '',
  is_featured: false, is_approved: true, is_active: true,
}

// ───────── Demo data ─────────
const DEMO_CITIES = [
  { id: 'c1', name_ar: 'طرابلس' },
  { id: 'c2', name_ar: 'بنغازي' },
  { id: 'c3', name_ar: 'مصراتة' },
  { id: 'c4', name_ar: 'الزاوية' },
  { id: 'c5', name_ar: 'سبها' },
]
const DEMO_CATEGORIES = [
  { id: 'k1', name_ar: 'سباكة' },
  { id: 'k2', name_ar: 'كهرباء' },
  { id: 'k3', name_ar: 'تكييف' },
  { id: 'k4', name_ar: 'نجارة' },
  { id: 'k5', name_ar: 'دهان' },
]
const DEMO_TECHS_SEED = [
  { id: 't1', name_ar: 'أحمد محمد',  phone: '+218910000001', whatsapp: '218910000001', city_id: 'c1', category_id: 'k1', experience_years: 8,  price_from: 50,  status: 'available', is_featured: true,  is_approved: true,  is_active: true,  created_at: '2026-05-09T10:00:00Z' },
  { id: 't2', name_ar: 'سالم علي',   phone: '+218910000002', whatsapp: '218910000002', city_id: 'c2', category_id: 'k2', experience_years: 5,  price_from: 40,  status: 'busy',      is_featured: false, is_approved: true,  is_active: true,  created_at: '2026-05-08T18:00:00Z' },
  { id: 't3', name_ar: 'خالد حسن',   phone: '+218910000003', whatsapp: '218910000003', city_id: 'c3', category_id: 'k3', experience_years: 12, price_from: 70,  status: 'inactive',  is_featured: false, is_approved: false, is_active: false, created_at: '2026-05-07T09:00:00Z' },
  { id: 't4', name_ar: 'يوسف عمر',   phone: '+218910000004', whatsapp: '218910000004', city_id: 'c4', category_id: 'k4', experience_years: 3,  price_from: 35,  status: 'available', is_featured: false, is_approved: true,  is_active: true,  created_at: '2026-05-06T14:00:00Z' },
  { id: 't5', name_ar: 'محمود سالم', phone: '+218910000005', whatsapp: '218910000005', city_id: 'c5', category_id: 'k5', experience_years: 7,  price_from: 45,  status: 'available', is_featured: true,  is_approved: true,  is_active: true,  created_at: '2026-05-05T11:00:00Z' },
  { id: 't6', name_ar: 'علي ميلاد',  phone: '+218910000006', whatsapp: '218910000006', city_id: 'c1', category_id: 'k2', experience_years: 6,  price_from: 55,  status: 'busy',      is_featured: false, is_approved: true,  is_active: true,  created_at: '2026-05-04T08:00:00Z' },
  { id: 't7', name_ar: 'مصطفى رمضان',phone: '+218910000007', whatsapp: '218910000007', city_id: 'c2', category_id: 'k1', experience_years: 9,  price_from: 60,  status: 'available', is_featured: false, is_approved: true,  is_active: true,  created_at: '2026-05-03T20:00:00Z' },
  { id: 't8', name_ar: 'حسين فرج',   phone: '+218910000008', whatsapp: '218910000008', city_id: 'c3', category_id: 'k4', experience_years: 4,  price_from: 38,  status: 'available', is_featured: false, is_approved: false, is_active: true,  created_at: '2026-05-02T07:30:00Z' },
]

const DEMO_KEY = 'demo_technicians_v1'
const LIVE_KEY = 'technicians'
const loadDemoTechs = () => {
  try {
    const liveRaw = localStorage.getItem(LIVE_KEY)
    const liveList = liveRaw ? JSON.parse(liveRaw) : []
    const demoRaw = localStorage.getItem(DEMO_KEY)
    const demoList = demoRaw ? JSON.parse(demoRaw) : []
    const normalizedLive = liveList.map(t => ({
      id: t.id,
      name_ar: t.name || t.name_ar || '',
      name_en: t.name_en || t.name || '',
      phone: t.phone || '',
      whatsapp: t.whatsapp || t.phone || '',
      city_id: t.city_id || t.city || '',
      category_id: t.category_id || t.category || '',
      experience_years: t.experience_years || t.experienceYears || 0,
      price_from: t.price_from || t.priceFrom || 0,
      status: t.status || (t.availableNow ? 'available' : 'busy'),
      description_ar: t.description_ar || t.description || '',
      description_en: t.description_en || t.description || '',
      is_featured: t.is_featured ?? t.isFeatured ?? false,
      is_approved: t.is_approved ?? t.isApproved ?? true,
      is_active: t.is_active ?? t.isActive ?? true,
      created_at: t.created_at || t.approvedAt || new Date().toISOString(),
    }))
    return [...normalizedLive, ...demoList]
  } catch (_) {}
  return DEMO_TECHS_SEED
}
const saveDemoTechs = (list) => {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)) } catch (_) {}
}

export default function Technicians() {
  const { isSuperAdmin, cityId, logActivity, isDemoMode } = useAdmin()
  const [data, setData] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [demoTechs, setDemoTechs] = useState(() => (isDemoMode ? loadDemoTechs() : []))

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── lookups ──
  useEffect(() => {
    if (isDemoMode) {
      setCities(DEMO_CITIES)
      setCategories(DEMO_CATEGORIES)
      return
    }
    if (!isSupabaseConfigured || !supabase) return
    loadLookups()
  }, [isDemoMode])

  const loadLookups = async () => {
    const [{ data: c }, { data: cat }] = await Promise.all([
      supabase.from('cities').select('id,name_ar').eq('is_active', true).order('sort_order'),
      supabase.from('categories').select('id,name_ar').eq('is_active', true).order('sort_order'),
    ])
    setCities(c || [])
    setCategories(cat || [])
  }

  // ── data ──
  useEffect(() => {
    if (isDemoMode) {
      applyDemoFilters(demoTechs)
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured || !supabase) return
    loadData()
  }, [search, filterCity, filterCat, filterStatus, page, isDemoMode, demoTechs])

  const applyDemoFilters = (list) => {
    let rows = [...list]
    if (filterCity) rows = rows.filter(r => r.city_id === filterCity)
    if (filterCat) rows = rows.filter(r => r.category_id === filterCat)
    if (filterStatus) rows = rows.filter(r => r.status === filterStatus)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(r =>
        (r.name_ar || '').toLowerCase().includes(s) ||
        (r.phone || '').toLowerCase().includes(s)
      )
    }
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setTotal(rows.length)
    const start = (page - 1) * PAGE_SIZE
    const paged = rows.slice(start, start + PAGE_SIZE).map(r => ({
      ...r,
      cities: { name_ar: DEMO_CITIES.find(c => c.id === r.city_id)?.name_ar || '—' },
      categories: { name_ar: DEMO_CATEGORIES.find(c => c.id === r.category_id)?.name_ar || '—' },
    }))
    setData(paged)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase
        .from('technicians')
        .select('*,cities(name_ar),categories(name_ar)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (!isSuperAdmin && cityId) q = q.eq('city_id', cityId)
      if (filterCity) q = q.eq('city_id', filterCity)
      if (filterCat) q = q.eq('category_id', filterCat)
      if (filterStatus) q = q.eq('status', filterStatus)
      if (search) q = q.or(`name_ar.ilike.%${search}%,phone.ilike.%${search}%`)

      const { data: rows, count, error } = await q
      if (error) throw error
      setData(rows || [])
      setTotal(count || 0)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [search, filterCity, filterCat, filterStatus, page, isSuperAdmin, cityId])

  const openAdd = () => {
    setEditItem(null)
    setForm({ ...emptyForm, city_id: (!isSuperAdmin && cityId) ? cityId : '' })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditItem(row)
    setForm({
      name_ar: row.name_ar || '', name_en: row.name_en || '',
      phone: row.phone || '', whatsapp: row.whatsapp || '',
      category_id: row.category_id || '', city_id: row.city_id || '',
      experience_years: row.experience_years || 0, price_from: row.price_from || 0,
      status: row.status || 'available', description_ar: row.description_ar || '',
      description_en: row.description_en || '', is_featured: row.is_featured || false,
      is_approved: row.is_approved ?? true, is_active: row.is_active ?? true,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
        price_from: parseFloat(form.price_from) || 0,
      }

      if (isDemoMode) {
        let next
        if (editItem) {
          next = demoTechs.map(t => t.id === editItem.id ? { ...t, ...payload } : t)
          showToast('تم تعديل الفني (تجريبي)')
        } else {
          const newItem = {
            id: 't' + Date.now(),
            created_at: new Date().toISOString(),
            ...payload,
          }
          next = [newItem, ...demoTechs]
          showToast('تم إضافة الفني (تجريبي)')
        }
        setDemoTechs(next)
        saveDemoTechs(next)
        setModalOpen(false)
        setSaving(false)
        return
      }

      if (editItem) {
        const { error } = await supabase.from('technicians').update(payload).eq('id', editItem.id)
        if (error) throw error
        await logActivity('update_technician', 'technicians', editItem.id, `Updated: ${form.name_ar}`)
        showToast('تم تعديل الفني بنجاح')
      } else {
        const { error } = await supabase.from('technicians').insert(payload)
        if (error) throw error
        await logActivity('add_technician', 'technicians', null, `Added: ${form.name_ar}`)
        showToast('تم إضافة الفني بنجاح')
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message, 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفني؟')) return
    if (isDemoMode) {
      const next = demoTechs.filter(t => t.id !== id)
      setDemoTechs(next)
      saveDemoTechs(next)
      showToast('تم حذف الفني (تجريبي)')
      return
    }
    const { error } = await supabase.from('technicians').delete().eq('id', id)
    if (error) { showToast(error.message, 'error'); return }
    await logActivity('delete_technician', 'technicians', id, 'Deleted technician')
    showToast('تم حذف الفني')
    loadData()
  }

  const toggleField = async (id, field, value) => {
    if (isDemoMode) {
      const next = demoTechs.map(t => t.id === id ? { ...t, [field]: !value } : t)
      setDemoTechs(next)
      saveDemoTechs(next)
      return
    }
    const { error } = await supabase.from('technicians').update({ [field]: !value }).eq('id', id)
    if (error) { showToast(error.message, 'error'); return }
    loadData()
  }

  const toggleActive = async (row) => {
    if (isDemoMode) {
      const newActive = !row.is_active
      const next = demoTechs.map(t => t.id === row.id ? {
        ...t,
        is_active: newActive,
        status: newActive ? (t.status === 'inactive' ? 'available' : t.status) : 'inactive',
      } : t)
      setDemoTechs(next)
      saveDemoTechs(next)
      showToast(newActive ? 'تم تفعيل الفني (تجريبي)' : 'تم تعطيل الفني (تجريبي)')
      return
    }
    const newActive = !row.is_active
    const { error } = await supabase.from('technicians').update({
      is_active: newActive,
      status: newActive ? (row.status === 'inactive' ? 'available' : row.status) : 'inactive',
    }).eq('id', row.id)
    if (error) { showToast(error.message, 'error'); return }
    loadData()
  }

  const columns = [
    {
      key: 'name_ar', label: 'الفني',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v}</p>
          <p className="text-xs text-gray-400">{row.phone}</p>
        </div>
      )
    },
    { key: 'cities', label: 'المدينة', render: (v) => v?.name_ar || '—' },
    { key: 'categories', label: 'التخصص', render: (v) => v?.name_ar || '—' },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const map = { available: ['متاح', 'text-green-600 bg-green-50'], busy: ['مشغول', 'text-amber-600 bg-amber-50'], inactive: ['غير نشط', 'text-gray-500 bg-gray-100'] }
        const [l, c] = map[v] || ['—', 'bg-gray-100']
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{l}</span>
      }
    },
    {
      key: 'is_active', label: 'تفعيل',
      render: (v, row) => (
        <button onClick={() => toggleActive(row)} className={`text-xs flex items-center gap-1 ${v ? 'text-green-600' : 'text-gray-400'}`}>
          {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {v ? 'مفعّل' : 'معطّل'}
        </button>
      )
    },
    {
      key: 'is_approved', label: 'معتمد',
      render: (v, row) => (
        <button onClick={() => toggleField(row.id, 'is_approved', v)} className={`text-xs flex items-center gap-1 ${v ? 'text-blue-600' : 'text-red-500'}`}>
          {v ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {v ? 'معتمد' : 'غير معتمد'}
        </button>
      )
    },
    {
      key: 'is_featured', label: 'مميز',
      render: (v, row) => (
        <button onClick={() => toggleField(row.id, 'is_featured', v)} className={`${v ? 'text-[#FF7900]' : 'text-gray-300'}`} title={v ? 'إلغاء التمييز' : 'تمييز'}>
          <Star className="w-4 h-4" fill={v ? 'currentColor' : 'none'} />
        </button>
      )
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="تعديل">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {(isSuperAdmin || isDemoMode) && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="حذف">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    },
  ]

  if (!isDemoMode && !isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {isDemoMode && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>وضع تجريبي — التعديلات لا تُحفظ في قاعدة البيانات.</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(isSuperAdmin || isDemoMode) && (
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1) }} className="select-field">
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }} className="select-field">
            <option value="">كل التخصصات</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="select-field">
            <option value="">كل الحالات</option>
            <option value="available">متاح</option>
            <option value="busy">مشغول</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        searchPlaceholder="بحث بالاسم أو الهاتف..."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة فني
          </button>
        }
        emptyMessage="لا يوجد فنيون"
        currentPage={page}
        totalPages={Math.ceil(total / PAGE_SIZE) || 1}
        onPageChange={setPage}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'تعديل فني' : 'إضافة فني جديد'}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editItem ? 'حفظ التغييرات' : 'إضافة'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">الاسم بالعربي *</label>
            <input required value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} className="form-input" placeholder="أحمد محمد" />
          </div>
          <div>
            <label className="form-label">الاسم بالإنجليزي</label>
            <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="form-input" placeholder="Ahmed Mohamed" />
          </div>
          <div>
            <label className="form-label">رقم الهاتف</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input" placeholder="+218910000000" />
          </div>
          <div>
            <label className="form-label">واتساب</label>
            <input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} className="form-input" placeholder="218910000000" />
          </div>
          <div>
            <label className="form-label">المدينة *</label>
            <select required value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} className="form-input" disabled={!isSuperAdmin && !isDemoMode}>
              <option value="">اختر المدينة</option>
              {((isSuperAdmin || isDemoMode) ? cities : cities.filter(c => c.id === cityId)).map(c => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">التخصص *</label>
            <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="form-input">
              <option value="">اختر التخصص</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">سنوات الخبرة</label>
            <input type="number" min="0" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} className="form-input" />
          </div>
          <div>
            <label className="form-label">السعر يبدأ من (د.ل)</label>
            <input type="number" min="0" value={form.price_from} onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))} className="form-input" />
          </div>
          <div>
            <label className="form-label">الحالة</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input">
              <option value="available">متاح</option>
              <option value="busy">مشغول</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">الوصف بالعربي</label>
            <textarea rows={2} value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} className="form-input resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">الوصف بالإنجليزي</label>
            <textarea rows={2} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} className="form-input resize-none" dir="ltr" />
          </div>
          <div className="sm:col-span-2 flex gap-6">
            {[['is_featured', 'مميز'], ['is_approved', 'معتمد'], ['is_active', 'نشط']].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))} className="w-4 h-4 accent-[#FF7900]" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </FormModal>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-white rounded-2xl p-8 border border-amber-200 shadow-sm max-w-md">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-1">لم يتم ربط قاعدة البيانات</h3>
        <p className="text-gray-500 text-sm">أضف مفاتيح Supabase في إعدادات المشروع</p>
      </div>
    </div>
  )
}
