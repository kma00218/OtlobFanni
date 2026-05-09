import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const PAGE_SIZE = 15

const emptyForm = {
  name_ar: '', name_en: '', phone: '', whatsapp: '', category_id: '', city_id: '',
  experience_years: 0, price_from: 0, status: 'available', description_ar: '', description_en: '',
  is_featured: false, is_approved: true, is_active: true,
}

export default function Technicians() {
  const { isSuperAdmin, cityId, logActivity } = useAdmin()
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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    loadLookups()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    loadData()
  }, [search, filterCity, filterCat, filterStatus, page])

  const loadLookups = async () => {
    const [{ data: c }, { data: cat }] = await Promise.all([
      supabase.from('cities').select('id,name_ar').eq('is_active', true).order('sort_order'),
      supabase.from('categories').select('id,name_ar').eq('is_active', true).order('sort_order'),
    ])
    setCities(c || [])
    setCategories(cat || [])
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
    const { error } = await supabase.from('technicians').delete().eq('id', id)
    if (error) { showToast(error.message, 'error'); return }
    await logActivity('delete_technician', 'technicians', id, 'Deleted technician')
    showToast('تم حذف الفني')
    loadData()
  }

  const toggleField = async (id, field, value) => {
    const { error } = await supabase.from('technicians').update({ [field]: !value }).eq('id', id)
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
      key: 'is_active', label: 'نشط',
      render: (v, row) => (
        <button onClick={() => toggleField(row.id, 'is_active', v)} className={`text-xs flex items-center gap-1 ${v ? 'text-green-600' : 'text-gray-400'}`}>
          {v ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {v ? 'نشط' : 'معطل'}
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
        <button onClick={() => toggleField(row.id, 'is_featured', v)} className={`${v ? 'text-[#FF7900]' : 'text-gray-300'}`}>
          <Star className="w-4 h-4" fill={v ? 'currentColor' : 'none'} />
        </button>
      )
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {isSuperAdmin && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    },
  ]

  if (!isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isSuperAdmin && (
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
        totalPages={Math.ceil(total / PAGE_SIZE)}
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
            <select required value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} className="form-input" disabled={!isSuperAdmin}>
              <option value="">اختر المدينة</option>
              {(isSuperAdmin ? cities : cities.filter(c => c.id === cityId)).map(c => (
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
