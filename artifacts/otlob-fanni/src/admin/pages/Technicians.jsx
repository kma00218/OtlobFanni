import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, CheckCircle, XCircle } from 'lucide-react'

const PAGE_SIZE = 15

const CITIES_KEY   = 'demo_cities_v1'
const CATS_KEY     = 'demo_categories_v1'
const ADMIN_KEY    = 'demo_technicians_v1'   // أُضيفوا من الأدمن
const APPROVED_KEY = 'technicians'           // أُضيفوا عبر طلبات التسجيل

const emptyForm = {
  name_ar: '', name_en: '', phone: '', whatsapp: '',
  category_id: '', city_id: '',
  experience_years: 0, price_from: 0,
  status: 'available',
  description_ar: '', description_en: '',
  is_featured: false, is_approved: true, is_active: true,
}

// ── helpers لقراءة/كتابة localStorage ──────────────────────────────────────
const ls = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} },
}

// خريطة slug التخصص → معرف التخصص (k1..k12)
const SLUG_TO_CAT_ID = {
  electricity: 'k1', plumbing: 'k2', ac: 'k3', painting: 'k4',
  carpentry: 'k5', cleaning: 'k6', moving: 'k7', cctv: 'k8',
  networks: 'k9', maintenance: 'k10', appliances: 'k11', welding: 'k12',
}

// يُطبّع سجل الفني القادم من approved key ليطابق schema الأدمن
const normalizeApproved = (t) => ({
  id: t.id,
  _source: APPROVED_KEY,
  name_ar: t.name || t.name_ar || '',
  name_en: t.name_en || t.name || '',
  phone: t.phone || '',
  whatsapp: t.whatsapp || t.phone || '',
  // city_id: قد يكون ID (c1) أو اسم نصي (طرابلس) — نحتفظ بكليهما
  city_id:    t.city_id || '',
  city_name:  t.city    || '',
  // category_id: قد يكون ID (k1) أو slug (electricity) — نحول الـ slug إلى ID
  category_id:   SLUG_TO_CAT_ID[t.category] || t.category_id || t.category || '',
  category_slug: t.category || '',
  experience_years: t.experience_years || t.experienceYears || 0,
  price_from: t.price_from || t.priceFrom || 0,
  status: t.status || (t.availableNow ? 'available' : 'busy'),
  description_ar: t.description_ar || t.description || '',
  description_en: t.description_en || '',
  is_featured: t.is_featured ?? t.isFeatured ?? false,
  is_approved: t.is_approved ?? t.isApproved ?? true,
  is_active: t.is_active ?? t.isActive ?? true,
  created_at: t.created_at || t.approvedAt || new Date().toISOString(),
})

const normalizeAdmin = (t) => ({ ...t, _source: ADMIN_KEY })

// يُحضر قائمة موحّدة من المفتاحَين مع إزالة أي تكرارات
const loadAllTechs = () => {
  const approved  = ls.get(APPROVED_KEY).map(normalizeApproved)
  const adminAdded = ls.get(ADMIN_KEY).map(normalizeAdmin)
  // لا ندوّر المعتمدين مرتين إذا أعيد حفظهم في admin key
  const approvedIds = new Set(approved.map(t => t.id))
  const unique = adminAdded.filter(t => !approvedIds.has(t.id))
  const all = [...approved, ...unique]
  // إزالة التكرارات بالـ id (تحصين من بيانات قديمة مكررة)
  const seen = new Set()
  return all.filter(t => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
}

// يُحدّث سجلاً في مفتاحه الأصلي
const persistUpdate = (id, source, changes) => {
  const list = ls.get(source)
  const updated = list.map(t => t.id === id ? { ...t, ...changes } : t)
  ls.set(source, updated)
}

// يحذف سجلاً من مفتاحه الأصلي
const persistDelete = (id, source) => {
  const list = ls.get(source)
  ls.set(source, list.filter(t => t.id !== id))
}

// ────────────────────────────────────────────────────────────────────────────
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

  // ── تحميل المدن والتخصصات من localStorage ──
  useEffect(() => {
    setCities(ls.get(CITIES_KEY))
    setCategories(ls.get(CATS_KEY))
  }, [])

  // ── تحميل الفنيين ──
  const reloadTechs = useCallback(() => {
    setAllTechs(loadAllTechs())
    setLoading(false)
  }, [])

  useEffect(() => { reloadTechs() }, [reloadTechs])

  // ── تصفية وترتيب وتصفيح ──
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
      cities: {
        name_ar: cities.find(c => c.id === r.city_id)?.name_ar
               || cities.find(c => c.name_ar === r.city_name)?.name_ar
               || r.city_name || r.city_id || '—',
      },
      categories: {
        name_ar: categories.find(c => c.id === r.category_id)?.name_ar
               || r.category_id || '—',
      },
    }))
    setData(paged)
  }, [allTechs, search, filterCity, filterCat, filterStatus, page, isSuperAdmin, cityId, cities, categories])

  // ── فتح النموذج ──
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

  // ── حفظ (إضافة أو تعديل) ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      experience_years: parseInt(form.experience_years) || 0,
      price_from: parseFloat(form.price_from) || 0,
    }

    if (editItem) {
      const source = editItem._source || ADMIN_KEY
      persistUpdate(editItem.id, source, payload)
      logActivity?.('update_technician', 'technicians', editItem.id, `Updated: ${form.name_ar}`)
      showToast('تم تعديل الفني بنجاح')
    } else {
      const newItem = {
        id: 'ta_' + Date.now(),
        created_at: new Date().toISOString(),
        _source: ADMIN_KEY,
        ...payload,
      }
      const list = ls.get(ADMIN_KEY)
      ls.set(ADMIN_KEY, [newItem, ...list])
      logActivity?.('add_technician', 'technicians', newItem.id, `Added: ${form.name_ar}`)
      showToast('تم إضافة الفني بنجاح')
    }

    setModalOpen(false)
    setSaving(false)
    reloadTechs()
  }

  // ── حذف ──
  const handleDelete = (row) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفني؟')) return
    const source = row._source || ADMIN_KEY
    persistDelete(row.id, source)
    logActivity?.('delete_technician', 'technicians', row.id, `Deleted: ${row.name_ar}`)
    showToast('تم حذف الفني')
    reloadTechs()
  }

  // ── تبديل حقل (is_approved / is_featured) ──
  const toggleField = (row, field) => {
    const source = row._source || ADMIN_KEY
    const newVal = !row[field]
    persistUpdate(row.id, source, { [field]: newVal })
    // تحديث فوري للـ state بدون انتظار إعادة التحميل
    setAllTechs(prev => prev.map(t => t.id === row.id ? { ...t, [field]: newVal } : t))
    showToast(
      field === 'is_approved'
        ? (newVal ? 'تم اعتماد الفني' : 'تم إلغاء الاعتماد')
        : (newVal ? 'تم تمييز الفني' : 'تم إلغاء التمييز')
    )
  }

  // ── تفعيل/تعطيل ──
  const toggleActive = (row) => {
    const source = row._source || ADMIN_KEY
    const newActive = !row.is_active
    const newStatus = newActive
      ? (row.status === 'inactive' ? 'available' : row.status)
      : 'inactive'
    persistUpdate(row.id, source, { is_active: newActive, status: newStatus })
    // تحديث فوري للـ state بدون انتظار إعادة التحميل
    setAllTechs(prev =>
      prev.map(t => t.id === row.id ? { ...t, is_active: newActive, status: newStatus } : t)
    )
    showToast(newActive ? 'تم تفعيل الفني' : 'تم تعطيل الفني')
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
