import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, CheckCircle, XCircle } from 'lucide-react'
import api from '../../lib/api'

const PAGE_SIZE = 15

const emptyForm = {
  name_ar: '', name_en: '', phone: '', whatsapp: '',
  category_id: '', city_id: '',
  experience_years: 0, price_from: 0,
  status: 'available',
  description_ar: '', description_en: '',
  is_featured: false, is_approved: true, is_active: true,
}

export default function Technicians() {
  const { isSuperAdmin, cityId, logActivity } = useAdmin()

  const [allTechs, setAllTechs]     = useState([])
  const [cities, setCities]         = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  const [search, setSearch]           = useState('')
  const [filterCity, setFilterCity]   = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage]               = useState(1)

  const [data, setData]   = useState([])
  const [total, setTotal] = useState(0)

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
    api.cities().then(setCities).catch(() => {})
    api.categories().then(setCategories).catch(() => {})
  }, [reloadTechs])

  useEffect(() => {
    let rows = [...allTechs]

    if (!isSuperAdmin && cityId)
      rows = rows.filter(r => r.city_id === cityId)
    if (filterCity)   rows = rows.filter(r => r.city_id === filterCity)
    if (filterCat)    rows = rows.filter(r => r.category_id === filterCat)
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
      cities:     { name_ar: cities.find(c => c.id === r.city_id)?.name_ar || r.city_id || '—' },
      categories: { name_ar: categories.find(c => c.id === r.category_id)?.name_ar || r.category_id || '—' },
    }))
    setData(paged)
  }, [allTechs, search, filterCity, filterCat, filterStatus, page, isSuperAdmin, cityId, cities, categories])

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
      experience_years: row.experience_years || 0,
      price_from: row.price_from || 0,
      status: row.status || 'available',
      description_ar: row.description_ar || '',
      description_en: row.description_en || '',
      is_featured: row.is_featured || false,
      is_approved: row.is_approved ?? true,
      is_active: row.is_active ?? true,
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

  const toggleField = async (row, field) => {
    const newVal = !row[field]
    try {
      await api.admin.technicians.update(row.id, { [field]: newVal })
      setAllTechs(prev => prev.map(t => t.id === row.id ? { ...t, [field]: newVal } : t))
      showToast(
        field === 'is_approved'
          ? (newVal ? 'تم اعتماد الفني' : 'تم إلغاء الاعتماد')
          : (newVal ? 'تم تمييز الفني' : 'تم إلغاء التمييز')
      )
    } catch { showToast('حدث خطأ', 'error') }
  }

  const toggleActive = async (row) => {
    const newActive = !row.is_active
    const newStatus = newActive ? (row.status === 'inactive' ? 'available' : row.status) : 'inactive'
    try {
      await api.admin.technicians.update(row.id, { is_active: newActive, status: newStatus })
      setAllTechs(prev => prev.map(t => t.id === row.id ? { ...t, is_active: newActive, status: newStatus } : t))
      showToast(newActive ? 'تم تفعيل الفني' : 'تم تعطيل الفني')
    } catch { showToast('حدث خطأ', 'error') }
  }

  // ── أعمدة الجدول ──
  const columns = [
    {
      key: 'name_ar', label: 'الفني',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v}</p>
          <p className="text-xs text-gray-400">{row.phone}</p>
        </div>
      ),
    },
    { key: 'cities',     label: 'المدينة',  render: (v) => v?.name_ar || '—' },
    { key: 'categories', label: 'التخصص',   render: (v) => v?.name_ar || '—' },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const map = {
          available: ['متاح',    'text-green-600 bg-green-50'],
          busy:      ['مشغول',   'text-amber-600 bg-amber-50'],
          inactive:  ['غير نشط', 'text-gray-500  bg-gray-100'],
        }
        const [l, c] = map[v] || ['—', 'bg-gray-100']
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{l}</span>
      },
    },
    {
      key: 'is_active', label: 'تفعيل',
      render: (v, row) => (
        <button
          onClick={() => toggleActive(row)}
          className={`text-xs flex items-center gap-1 ${v ? 'text-green-600' : 'text-gray-400'}`}
        >
          {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {v ? 'مفعّل' : 'معطّل'}
        </button>
      ),
    },
    {
      key: 'is_approved', label: 'معتمد',
      render: (v, row) => (
        <button
          onClick={() => toggleField(row, 'is_approved')}
          className={`text-xs flex items-center gap-1 ${v ? 'text-blue-600' : 'text-red-500'}`}
        >
          {v ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {v ? 'معتمد' : 'غير معتمد'}
        </button>
      ),
    },
    {
      key: 'is_featured', label: 'مميز',
      render: (v, row) => (
        <button
          onClick={() => toggleField(row, 'is_featured')}
          className={v ? 'text-[#FF7900]' : 'text-gray-300'}
          title={v ? 'إلغاء التمييز' : 'تمييز'}
        >
          <Star className="w-4 h-4" fill={v ? 'currentColor' : 'none'} />
        </button>
      ),
    },
    {
      key: 'id', label: 'إجراءات',
      render: (_, row) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
            title="تعديل"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* فلاتر */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isSuperAdmin && (
            <select
              value={filterCity}
              onChange={e => { setFilterCity(e.target.value); setPage(1) }}
              className="select-field"
            >
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setPage(1) }}
            className="select-field"
          >
            <option value="">كل التخصصات</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="select-field"
          >
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
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors"
          >
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
            <input
              required
              value={form.name_ar}
              onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
              className="form-input"
              placeholder="أحمد محمد"
            />
          </div>
          <div>
            <label className="form-label">الاسم بالإنجليزي</label>
            <input
              value={form.name_en}
              onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
              className="form-input"
              placeholder="Ahmed Mohamed"
            />
          </div>
          <div>
            <label className="form-label">رقم الهاتف</label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="form-input"
              placeholder="+218910000000"
            />
          </div>
          <div>
            <label className="form-label">واتساب</label>
            <input
              value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              className="form-input"
              placeholder="218910000000"
            />
          </div>
          <div>
            <label className="form-label">المدينة *</label>
            <select
              required
              value={form.city_id}
              onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))}
              className="form-input"
              disabled={!isSuperAdmin && !!cityId}
            >
              <option value="">اختر المدينة</option>
              {(isSuperAdmin ? cities : cities.filter(c => c.id === cityId)).map(c => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">التخصص *</label>
            <select
              required
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="form-input"
            >
              <option value="">اختر التخصص</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">سنوات الخبرة</label>
            <input
              type="number" min="0"
              value={form.experience_years}
              onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">السعر يبدأ من (د.ل)</label>
            <input
              type="number" min="0"
              value={form.price_from}
              onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">الحالة</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="form-input"
            >
              <option value="available">متاح</option>
              <option value="busy">مشغول</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">الوصف بالعربي</label>
            <textarea
              rows={2}
              value={form.description_ar}
              onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))}
              className="form-input resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">الوصف بالإنجليزي</label>
            <textarea
              rows={2}
              value={form.description_en}
              onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
              className="form-input resize-none"
              dir="ltr"
            />
          </div>
          <div className="sm:col-span-2 flex gap-6">
            {[['is_featured', 'مميز'], ['is_approved', 'معتمد'], ['is_active', 'نشط']].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))}
                  className="w-4 h-4 accent-[#FF7900]"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </FormModal>
    </div>
  )
}
