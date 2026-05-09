import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle } from 'lucide-react'

const PAGE_SIZE = 15
const STATUS_MAP = {
  new: ['جديد', 'bg-orange-50 text-[#FF7900]'],
  assigned: ['مُسند', 'bg-blue-50 text-blue-600'],
  in_progress: ['جارٍ', 'bg-purple-50 text-purple-600'],
  completed: ['مكتمل', 'bg-green-50 text-green-600'],
  cancelled: ['ملغي', 'bg-red-50 text-red-500'],
}

export default function Requests() {
  const { isSuperAdmin, cityId, logActivity } = useAdmin()
  const [data, setData] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewItem, setViewItem] = useState(null)
  const [editStatus, setEditStatus] = useState(null)
  const [editTech, setEditTech] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [newTech, setNewTech] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    loadLookups()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    loadData()
  }, [search, filterCity, filterStatus, page])

  const loadLookups = async () => {
    const [{ data: c }, { data: cat }, { data: techs }] = await Promise.all([
      supabase.from('cities').select('id,name_ar').eq('is_active', true).order('sort_order'),
      supabase.from('categories').select('id,name_ar').eq('is_active', true).order('sort_order'),
      supabase.from('technicians').select('id,name_ar,city_id').eq('is_active', true).eq('is_approved', true),
    ])
    setCities(c || [])
    setCategories(cat || [])
    setTechnicians(techs || [])
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase
        .from('service_requests')
        .select('*,cities(name_ar),categories(name_ar),technicians(name_ar)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (!isSuperAdmin && cityId) q = q.eq('city_id', cityId)
      if (filterCity) q = q.eq('city_id', filterCity)
      if (filterStatus) q = q.eq('status', filterStatus)
      if (search) q = q.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)

      const { data: rows, count } = await q
      setData(rows || [])
      setTotal(count || 0)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [search, filterCity, filterStatus, page, isSuperAdmin, cityId])

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    const updates = { status: newStatus }
    if (newTech) updates.technician_id = newTech
    const { error } = await supabase.from('service_requests').update(updates).eq('id', editStatus.id)
    if (error) { showToast(error.message, 'error'); setSaving(false); return }
    await logActivity('update_request_status', 'service_requests', editStatus.id, `Status: ${newStatus}`)
    showToast('تم تحديث الطلب')
    setEditStatus(null)
    loadData()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    await supabase.from('service_requests').delete().eq('id', id)
    showToast('تم حذف الطلب')
    loadData()
  }

  const columns = [
    {
      key: 'customer_name', label: 'العميل',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v || 'غير محدد'}</p>
          <p className="text-xs text-gray-400">{row.customer_phone || '—'}</p>
        </div>
      )
    },
    { key: 'cities', label: 'المدينة', render: (v) => v?.name_ar || '—' },
    { key: 'categories', label: 'التخصص', render: (v) => v?.name_ar || '—' },
    { key: 'technicians', label: 'الفني', render: (v) => v?.name_ar || '—' },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const [l, c] = STATUS_MAP[v] || ['—', 'bg-gray-100 text-gray-500']
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{l}</span>
      }
    },
    {
      key: 'created_at', label: 'التاريخ',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—'
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button
            onClick={() => { setEditStatus(row); setNewStatus(row.status); setNewTech(row.technician_id || '') }}
            className="p-1.5 hover:bg-[#FF7900]/10 text-[#FF7900] rounded-lg transition-colors text-xs font-medium px-2"
          >
            تحديث
          </button>
          {isSuperAdmin && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
      )
    },
  ]

  if (!isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isSuperAdmin && (
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1) }} className="select-field">
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="select-field">
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
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
        emptyMessage="لا توجد طلبات"
        currentPage={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
      />

      {/* View Modal */}
      <FormModal open={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل الطلب" onSubmit={e => { e.preventDefault(); setViewItem(null) }} submitLabel="إغلاق" size="md">
        {viewItem && (
          <div className="space-y-3 text-sm">
            {[
              ['العميل', viewItem.customer_name],
              ['الهاتف', viewItem.customer_phone],
              ['المدينة', viewItem.cities?.name_ar],
              ['التخصص', viewItem.categories?.name_ar],
              ['الفني', viewItem.technicians?.name_ar],
              ['الحالة', STATUS_MAP[viewItem.status]?.[0]],
              ['التاريخ', viewItem.created_at ? new Date(viewItem.created_at).toLocaleString('ar-LY') : '—'],
              ['الوصف', viewItem.description],
            ].map(([k, v]) => v ? (
              <div key={k} className="flex gap-2">
                <span className="text-gray-400 w-20 flex-shrink-0">{k}:</span>
                <span className="text-gray-800 font-medium">{v}</span>
              </div>
            ) : null)}
          </div>
        )}
      </FormModal>

      {/* Status Update Modal */}
      <FormModal open={!!editStatus} onClose={() => setEditStatus(null)} title="تحديث الطلب" onSubmit={handleStatusUpdate} loading={saving} submitLabel="حفظ">
        <div className="space-y-4">
          <div>
            <label className="form-label">الحالة الجديدة</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="form-input">
              {Object.entries(STATUS_MAP).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">إسناد إلى فني</label>
            <select value={newTech} onChange={e => setNewTech(e.target.value)} className="form-input">
              <option value="">بدون فني</option>
              {technicians
                .filter(t => !editStatus?.city_id || t.city_id === editStatus?.city_id)
                .map(t => <option key={t.id} value={t.id}>{t.name_ar}</option>)
              }
            </select>
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
