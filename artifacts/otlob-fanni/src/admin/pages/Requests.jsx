import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
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

const DEMO_CITIES    = [
  { id: 'c1', name_ar: 'طرابلس' }, { id: 'c2', name_ar: 'بنغازي' },
  { id: 'c3', name_ar: 'مصراتة' }, { id: 'c4', name_ar: 'الزاوية' },
  { id: 'c5', name_ar: 'سبها'   },
]
const DEMO_CATS      = [
  { id: 'k1', name_ar: 'سباكة'    }, { id: 'k2', name_ar: 'كهرباء'     },
  { id: 'k3', name_ar: 'تكييف'    }, { id: 'k4', name_ar: 'نجارة'      },
  { id: 'k5', name_ar: 'دهانات'   }, { id: 'k6', name_ar: 'صيانة عامة' },
]
const DEMO_TECHS = [
  { id: 't1', name_ar: 'أحمد محمد',   city_id: 'c1' },
  { id: 't2', name_ar: 'سالم علي',    city_id: 'c2' },
  { id: 't3', name_ar: 'خالد حسن',    city_id: 'c3' },
  { id: 't4', name_ar: 'يوسف عمر',    city_id: 'c4' },
  { id: 't5', name_ar: 'محمود سالم',  city_id: 'c5' },
]
const DEMO_REQUESTS_SEED = [
  { id: 'r1',  customer_name: 'عمر الكيلاني',   customer_phone: '+218910111111', city_id: 'c1', category_id: 'k2', technician_id: 't1', status: 'new',         description: 'أحتاج كهربائي لتغيير لوحة الكهرباء',    created_at: '2026-05-10T08:00:00Z' },
  { id: 'r2',  customer_name: 'سارة المهدي',     customer_phone: '+218920222222', city_id: 'c1', category_id: 'k1', technician_id: 't1', status: 'assigned',    description: 'تسريب في الحمام',                         created_at: '2026-05-10T07:30:00Z' },
  { id: 'r3',  customer_name: 'فاطمة الزروق',    customer_phone: '+218930333333', city_id: 'c2', category_id: 'k3', technician_id: 't2', status: 'in_progress', description: 'صيانة مكيف مركزي',                        created_at: '2026-05-09T15:00:00Z' },
  { id: 'r4',  customer_name: 'محمد الورفلي',    customer_phone: '+218910444444', city_id: 'c2', category_id: 'k6', technician_id: null, status: 'new',         description: 'صيانة شاملة للمنزل',                      created_at: '2026-05-09T12:00:00Z' },
  { id: 'r5',  customer_name: 'حنان السويح',     customer_phone: '+218920555555', city_id: 'c3', category_id: 'k4', technician_id: 't3', status: 'completed',   description: 'تصليح باب خشبي',                         created_at: '2026-05-08T10:00:00Z' },
  { id: 'r6',  customer_name: 'طارق الجهاني',    customer_phone: '+218910666666', city_id: 'c1', category_id: 'k5', technician_id: null, status: 'new',         description: 'طلاء غرفة النوم',                         created_at: '2026-05-08T09:00:00Z' },
  { id: 'r7',  customer_name: 'نورا العبيدي',    customer_phone: '+218920777777', city_id: 'c4', category_id: 'k2', technician_id: 't4', status: 'assigned',    description: 'تركيب لمبات LED',                         created_at: '2026-05-07T14:00:00Z' },
  { id: 'r8',  customer_name: 'أنس الفيتوري',    customer_phone: '+218910888888', city_id: 'c3', category_id: 'k1', technician_id: 't3', status: 'completed',   description: 'تركيب خزان مياه جديد',                    created_at: '2026-05-07T11:00:00Z' },
  { id: 'r9',  customer_name: 'منى بوعزة',       customer_phone: '+218920999999', city_id: 'c5', category_id: 'k3', technician_id: 't5', status: 'in_progress', description: 'تنظيف وصيانة تكييف',                      created_at: '2026-05-06T16:00:00Z' },
  { id: 'r10', customer_name: 'إبراهيم الأسود',  customer_phone: '+218910000010', city_id: 'c2', category_id: 'k6', technician_id: 't2', status: 'cancelled',   description: 'صيانة غسالة — تم الإلغاء من العميل',      created_at: '2026-05-05T08:00:00Z' },
  { id: 'r11', customer_name: 'ليلى الطاهر',     customer_phone: '+218920000011', city_id: 'c1', category_id: 'k4', technician_id: null, status: 'new',         description: 'تركيب خزانة ملابس',                       created_at: '2026-05-04T13:00:00Z' },
  { id: 'r12', customer_name: 'وليد المصراتي',   customer_phone: '+218910000012', city_id: 'c4', category_id: 'k5', technician_id: 't4', status: 'completed',   description: 'دهان واجهة المنزل',                       created_at: '2026-05-03T09:00:00Z' },
]

const DEMO_KEY = 'demo_requests_v1'
const loadDemo  = () => { try { const r = localStorage.getItem(DEMO_KEY); if (r) return JSON.parse(r) } catch(_){} return DEMO_REQUESTS_SEED }
const saveDemo  = (l) => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(l)) } catch(_){} }

function enrich(rows) {
  return rows.map(r => ({
    ...r,
    cities:      DEMO_CITIES.find(c => c.id === r.city_id) || null,
    categories:  DEMO_CATS.find(c => c.id === r.category_id) || null,
    technicians: DEMO_TECHS.find(t => t.id === r.technician_id) || null,
  }))
}

export default function Requests() {
  const { isSuperAdmin, cityId: adminCityId, isDemoMode } = useAdmin()
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

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (isDemoMode) { setData(loadDemo()); setLoading(false); return }
    if (!isSupabaseConfigured || !supabase) return
    loadData()
  }, [isDemoMode])

  const loadData = async () => {
    setLoading(true)
    try {
      let q = supabase
        .from('service_requests')
        .select('*,cities(name_ar),categories(name_ar),technicians(name_ar)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (!isSuperAdmin && adminCityId) q = q.eq('city_id', adminCityId)
      if (filterCity)   q = q.eq('city_id', filterCity)
      if (filterStatus) q = q.eq('status', filterStatus)
      if (search)       q = q.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)
      const { data: rows, count } = await q
      setData(rows || []); setTotal(count || 0)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const persist = (next) => { setData(next); saveDemo(next) }

  const visible = isDemoMode
    ? enrich(data).filter(r => {
        if (!isSuperAdmin && adminCityId && r.city_id !== adminCityId) return false
        if (filterCity   && r.city_id !== filterCity)   return false
        if (filterStatus && r.status  !== filterStatus) return false
        if (search && !r.customer_name?.includes(search) && !r.customer_phone?.includes(search)) return false
        return true
      })
    : data

  const pagedData  = isDemoMode ? visible.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE) : visible
  const totalPages = isDemoMode ? Math.ceil(visible.length / PAGE_SIZE) : Math.ceil(total / PAGE_SIZE)

  const openEdit = (row) => { setEditItem(row); setNewStatus(row.status); setNewTech(row.technician_id || ''); }

  const handleStatusUpdate = async (e) => {
    e.preventDefault(); setSaving(true)
    if (isDemoMode) {
      persist(data.map(r => r.id === editItem.id ? { ...r, status: newStatus, technician_id: newTech || null } : r))
      showToast('تم تحديث الطلب (تجريبي)')
      setEditItem(null); setSaving(false); return
    }
    const updates = { status: newStatus }
    if (newTech) updates.technician_id = newTech
    const { error } = await supabase.from('service_requests').update(updates).eq('id', editItem.id)
    if (error) { showToast(error.message, 'error'); setSaving(false); return }
    showToast('تم تحديث الطلب'); setEditItem(null); loadData(); setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    if (isDemoMode) { persist(data.filter(r => r.id !== id)); showToast('تم حذف الطلب (تجريبي)'); return }
    await supabase.from('service_requests').delete().eq('id', id)
    showToast('تم حذف الطلب'); loadData()
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

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          {isSuperAdmin && (
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1) }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
              <option value="">كل المدن</option>
              {DEMO_CITIES.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
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
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="form-input">
              {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">إسناد إلى فني</label>
            <select value={newTech} onChange={e => setNewTech(e.target.value)} className="form-input">
              <option value="">بدون فني</option>
              {DEMO_TECHS
                .filter(t => !editItem?.city_id || t.city_id === editItem?.city_id)
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
