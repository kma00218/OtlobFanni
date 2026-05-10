import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, Wrench, RefreshCw, SlidersHorizontal } from 'lucide-react'

const PAGE_SIZE = 15

const STATUS_MAP = {
  new:         { label: 'جديد',   cls: 'bg-orange-50 text-[#FF7900]'   },
  assigned:    { label: 'مُسند',  cls: 'bg-blue-50   text-blue-600'    },
  in_progress: { label: 'جارٍ',   cls: 'bg-purple-50 text-purple-600'  },
  completed:   { label: 'مكتمل', cls: 'bg-green-50  text-green-600'   },
  cancelled:   { label: 'ملغي',  cls: 'bg-red-50    text-red-500'     },
}

const URGENCY_MAP = {
  normal:    { label: 'عادي',  cls: 'text-gray-500'      },
  urgent:    { label: 'عاجل',  cls: 'text-orange-500'    },
  emergency: { label: 'طارئ',  cls: 'text-red-600 font-bold' },
}

const REQ_KEY = 'serviceRequests'
const ls = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const loadRequests  = () => ls(REQ_KEY)
const loadCities    = () => ls('demo_cities_v1')
const saveRequests  = (list) => { try { localStorage.setItem(REQ_KEY, JSON.stringify(list)) } catch {} }

export default function Requests() {
  const { isSuperAdmin, cityId: adminCityId } = useAdmin()

  const [data,         setData]         = useState([])
  const [cities,       setCities]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterCity,   setFilterCity]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page,         setPage]         = useState(1)

  const [viewItem, setViewItem] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setCities(loadCities())
    setData(loadRequests())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const persist = (next) => { setData(next); saveRequests(next) }

  // تحديث cityName من قائمة المدن
  const cityName = (cityId) => cities.find(c => c.id === cityId)?.name_ar || cityId || '—'

  const visible = data.filter(r => {
    if (!isSuperAdmin && adminCityId && r.city !== adminCityId) return false
    if (filterCity   && r.city   !== filterCity)   return false
    if (filterStatus && r.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !r.customerName?.toLowerCase().includes(q) &&
        !r.customerPhone?.includes(q)              &&
        !r.categoryNameAr?.includes(q)
      ) return false
    }
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const pagedData  = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(visible.length / PAGE_SIZE) || 1

  const handleStatusUpdate = (e) => {
    e.preventDefault()
    setSaving(true)
    const now = new Date().toISOString()
    persist(data.map(r =>
      r.id === editItem.id ? { ...r, status: newStatus, updatedAt: now } : r
    ))
    showToast('تم تحديث الحالة')
    setEditItem(null)
    setSaving(false)
  }

  const handleDelete = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    persist(data.filter(r => r.id !== id))
    showToast('تم حذف الطلب')
  }

  const columns = [
    {
      key: 'customerName', label: 'العميل',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800 text-sm">{v || '—'}</p>
          <p className="text-xs text-gray-400" dir="ltr">{row.customerPhone || '—'}</p>
        </div>
      )
    },
    {
      key: 'city', label: 'المدينة',
      render: (v, row) => (
        <div>
          <p className="text-sm text-gray-700">{cityName(v)}</p>
          {row.area && <p className="text-xs text-gray-400">{row.area}</p>}
        </div>
      )
    },
    {
      key: 'categoryNameAr', label: 'التخصص',
      render: (v) => <span className="text-sm text-gray-700">{v || '—'}</span>
    },
    {
      key: 'urgency', label: 'الأولوية',
      render: (v) => {
        const u = URGENCY_MAP[v]
        return u
          ? <span className={`text-xs font-medium ${u.cls}`}>{u.label}</span>
          : <span className="text-xs text-gray-400">—</span>
      }
    },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS_MAP[v] || { label: '—', cls: 'bg-gray-100 text-gray-500' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      }
    },
    {
      key: 'createdAt', label: 'التاريخ',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—'
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex items-center gap-1">
          {/* عرض التفاصيل */}
          <button
            onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
            title="عرض التفاصيل"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* إسناد فني — غير مفعّل حتى الآن */}
          <button
            disabled
            className="p-1.5 text-gray-300 rounded-lg cursor-not-allowed"
            title="إسناد فني (قريباً)"
          >
            <Wrench className="w-3.5 h-3.5" />
          </button>

          {/* تغيير الحالة */}
          <button
            onClick={() => { setEditItem(row); setNewStatus(row.status) }}
            className="px-2 py-1 hover:bg-[#FF7900]/10 text-[#FF7900] rounded-lg transition-colors text-xs font-medium"
            title="تغيير الحالة"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* حذف */}
          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* فلاتر */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {isSuperAdmin && (
            <select
              value={filterCity}
              onChange={e => { setFilterCity(e.target.value); setPage(1) }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white"
            >
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white"
          >
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 flex-1">{visible.length} طلب</span>
          <button
            onClick={load}
            className="p-2 hover:bg-gray-50 text-gray-500 rounded-xl border border-gray-200 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* الجدول */}
      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        searchPlaceholder="بحث بالاسم أو الهاتف أو التخصص..."
        emptyMessage="لا توجد طلبات"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* مودال: عرض التفاصيل */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل الطلب"
        onSubmit={e => { e.preventDefault(); setViewItem(null) }}
        submitLabel="إغلاق"
        size="md"
      >
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['العميل',      viewItem.customerName],
                ['الهاتف',      viewItem.customerPhone],
                ['المدينة',     cityName(viewItem.city)],
                ['المنطقة',     viewItem.area],
                ['التخصص',      viewItem.categoryNameAr],
                ['الأولوية',    URGENCY_MAP[viewItem.urgency]?.label || '—'],
                ['الوقت المفضل', viewItem.preferredTime || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-medium text-gray-800 text-sm">{v || '—'}</p>
                </div>
              ))}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">الحالة</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[viewItem.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_MAP[viewItem.status]?.label || '—'}
                </span>
              </div>
            </div>
            {viewItem.problemDescription && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">وصف المشكلة</p>
                <p className="text-sm text-gray-700 leading-relaxed">{viewItem.problemDescription}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-left" dir="ltr">
              {viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString('ar-LY') : ''}
            </p>
          </div>
        )}
      </FormModal>

      {/* مودال: تغيير الحالة */}
      <FormModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="تغيير حالة الطلب"
        onSubmit={handleStatusUpdate}
        loading={saving}
        submitLabel="حفظ"
      >
        {editItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
              <span className="text-gray-400 text-xs block mb-0.5">الطلب</span>
              {editItem.customerName} — {editItem.categoryNameAr}
            </div>
            <div>
              <label className="form-label">الحالة الجديدة</label>
              <select
                data-testid="status-select"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="form-input"
              >
                {Object.entries(STATUS_MAP).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
