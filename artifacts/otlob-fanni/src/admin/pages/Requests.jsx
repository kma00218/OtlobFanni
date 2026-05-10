import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Info } from 'lucide-react'

const PAGE_SIZE = 15

const STATUS_MAP = {
  new:         { label: 'جديد',   cls: 'bg-orange-50 text-[#FF7900]' },
  assigned:    { label: 'مُسند',  cls: 'bg-blue-50 text-blue-600'    },
  in_progress: { label: 'جارٍ',   cls: 'bg-purple-50 text-purple-600' },
  completed:   { label: 'مكتمل', cls: 'bg-green-50 text-green-600'   },
  cancelled:   { label: 'ملغي',  cls: 'bg-red-50 text-red-500'      },
}

const REQ_KEY    = 'service_requests'
const CITIES_KEY = 'demo_cities_v1'
const CATS_KEY   = 'demo_categories_v1'

const ls = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

const loadRequests = () => ls(REQ_KEY)
const saveRequests = (list) => { try { localStorage.setItem(REQ_KEY, JSON.stringify(list)) } catch {} }
const loadCities   = () => ls(CITIES_KEY)
const loadCats     = () => ls(CATS_KEY)

// تحميل جميع الفنيين: المعتمدون + المضافون من الأدمن
const loadTechs = () => {
  const approved = ls('technicians')
  const admin    = ls('demo_technicians_v1')
  const merged = [
    ...approved.map(t => ({
      id: t.id,
      name_ar: t.name_ar || t.name || t.nameAr || '',
      city_id: t.city_id || null,
      source: 'approved',
    })),
    ...admin.map(t => ({
      id: t.id,
      name_ar: t.name_ar || '',
      city_id: t.city_id || null,
      source: 'admin',
    })),
  ]
  return merged.filter(t => t.name_ar)
}

const enrich = (rows, cities, cats, techs) => rows.map(r => ({
  ...r,
  cities: cities.find(c => c.id === r.city_id) || null,
  categories: cats.find(c => c.id === r.category_id) || null,
  technicians: techs.find(t => t.id === r.technician_id) || null,
}))

export default function Requests() {
  const { isSuperAdmin, cityId: adminCityId } = useAdmin()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewItem, setViewItem] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [newTech, setNewTech] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [cities, setCities] = useState([])
  const [cats, setCats] = useState([])
  const [techs, setTechs] = useState([])

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    setCities(loadCities())
    setCats(loadCats())
    setTechs(loadTechs())
    const reqs = loadRequests()
    setData(reqs)
    setLoading(false)
  }, [])

  const persist = (next) => { setData(next); saveRequests(next) }

  const visible = enrich(data, cities, cats, techs).filter(r => {
    if (!isSuperAdmin && adminCityId && r.city_id !== adminCityId) return false
    if (filterCity && r.city_id !== filterCity) return false
    if (filterStatus && r.status !== filterStatus) return false
    if (search && !r.customer_name?.includes(search) && !r.customer_phone?.includes(search)) return false
    return true
  })

  const pagedData  = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(visible.length / PAGE_SIZE) || 1

  const openEdit = (row) => { setEditItem(row); setNewStatus(row.status); setNewTech(row.technician_id || ''); }

  const handleStatusUpdate = async (e) => {
    e.preventDefault(); setSaving(true)
    const updates = { status: newStatus, technician_id: newTech || null }
    persist(data.map(r => r.id === editItem.id ? { ...r, ...updates } : r))
    showToast('تم تحديث الطلب')
    setEditItem(null)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    persist(data.filter(r => r.id !== id))
    showToast('تم حذف الطلب')
  }

  const columns = [
    {
      key: 'customer_name', label: 'العميل',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v || 'غير محدد'}</p>
          <p className="text-xs text-gray-400" dir="ltr">{row.customer_phone || '—'}</p>
        </div>
      )
    },
    { key: 'cities',      label: 'المدينة',  render: (v) => v?.name_ar || '—' },
    { key: 'categories',  label: 'التخصص',   render: (v) => v?.name_ar || '—' },
    { key: 'technicians', label: 'الفني',     render: (v) => v?.name_ar || <span className="text-xs text-gray-400">غير مُسند</span> },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS_MAP[v] || { label: '—', cls: 'bg-gray-100 text-gray-500' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      }
    },
    { key: 'created_at', label: 'التاريخ', render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—' },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="عرض"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => openEdit(row)} className="px-2 py-1 hover:bg-[#FF7900]/10 text-[#FF7900] rounded-lg transition-colors text-xs font-medium">تحديث</button>
          {isSuperAdmin && <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          {isSuperAdmin && (
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1) }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <div className="flex-1 text-left text-xs text-gray-400 flex items-center">
            {visible.length} طلب
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        searchPlaceholder="بحث بالاسم أو الهاتف..."
        emptyMessage="لا توجد طلبات"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <FormModal open={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل الطلب" onSubmit={e => { e.preventDefault(); setViewItem(null) }} submitLabel="إغلاق" size="md">
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['العميل', viewItem.customer_name],
                ['الهاتف', viewItem.customer_phone],
                ['المدينة', viewItem.cities?.name_ar],
                ['التخصص', viewItem.categories?.name_ar],
                ['الفني', viewItem.technicians?.name_ar || 'غير مُسند'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-medium text-gray-800 text-sm">{v || '—'}</p>
                </div>
              ))}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">الحالة</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[viewItem.status]?.cls}`}>{STATUS_MAP[viewItem.status]?.label || '—'}</span>
              </div>
            </div>
            {viewItem.description && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">وصف الطلب</p>
                <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-left">{viewItem.created_at ? new Date(viewItem.created_at).toLocaleString('ar-LY') : ''}</p>
          </div>
        )}
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="تحديث الطلب" onSubmit={handleStatusUpdate} loading={saving} submitLabel="حفظ">
        <div className="space-y-4">
          <div>
            <label className="form-label">الحالة الجديدة</label>
            <select
              data-testid="status-select"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="form-input"
            >
              {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">إسناد إلى فني</label>
            <select
              data-testid="tech-select"
              value={newTech}
              onChange={e => setNewTech(e.target.value)}
              className="form-input"
            >
              <option value="">بدون فني</option>
              {techs.map(t => <option key={t.id} value={t.id}>{t.name_ar}</option>)}
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
