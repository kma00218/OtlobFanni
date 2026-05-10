import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, ToggleLeft, ToggleRight, Info, AlertCircle } from 'lucide-react'

const DEMO_KEY = 'demo_join_requests_v1'

const DEMO_SEED = [
  { id: 'jr1', full_name: 'فيصل الورفلي',   phone: '+218911111111', specialty: 'سباكة',   city: 'طرابلس', description: 'خبرة 7 سنوات في أعمال السباكة والصيانة', status: 'pending',  created_at: '2026-05-08T09:00:00Z' },
  { id: 'jr2', full_name: 'نجم الدين فرج',  phone: '+218922222222', specialty: 'كهرباء',  city: 'بنغازي', description: 'كهربائي معتمد بخبرة 10 سنوات',              status: 'approved', created_at: '2026-05-07T14:00:00Z' },
  { id: 'jr3', full_name: 'عادل بوعزة',     phone: '+218933333333', specialty: 'تكييف',   city: 'مصراتة', description: 'صيانة وتركيب أجهزة التكييف المركزي',       status: 'pending',  created_at: '2026-05-06T11:30:00Z' },
  { id: 'jr4', full_name: 'سليمان الزروق',  phone: '+218944444444', specialty: 'نجارة',   city: 'الزاوية','description': 'نجارة ديكور وأثاث منزلي',                status: 'rejected', created_at: '2026-05-05T08:00:00Z' },
  { id: 'jr5', full_name: 'إبراهيم الأسود', phone: '+218955555555', specialty: 'دهان',    city: 'سبها',   description: 'دهانات داخلية وخارجية',                   status: 'pending',  created_at: '2026-05-04T16:00:00Z' },
]

const STATUS_LABELS = {
  pending:  { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-600' },
  approved: { label: 'مقبول',        cls: 'bg-green-50 text-green-600' },
  rejected: { label: 'مرفوض',        cls: 'bg-red-50 text-red-500'   },
}

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

export default function JoinRequests() {
  const { isDemoMode } = useAdmin()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (isDemoMode) {
      setData(loadDemo())
      setLoading(false)
    }
  }, [isDemoMode])

  const persist = (next) => { setData(next); saveDemo(next) }

  const setStatus = (id, status) => {
    persist(data.map(r => r.id === id ? { ...r, status } : r))
    showToast(status === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب')
    if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
  }

  const handleDelete = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    persist(data.filter(r => r.id !== id))
    showToast('تم حذف الطلب')
    if (viewItem?.id === id) setViewItem(null)
  }

  const filtered = data.filter(r => {
    const matchSearch = !search || r.full_name?.includes(search) || r.phone?.includes(search) || r.city?.includes(search) || r.specialty?.includes(search)
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'full_name', label: 'مقدم الطلب',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v}</p>
          <p className="text-xs text-gray-400" dir="ltr">{row.phone}</p>
        </div>
      )
    },
    { key: 'specialty', label: 'التخصص' },
    { key: 'city',      label: 'المدينة' },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS_LABELS[v] || STATUS_LABELS.pending
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      }
    },
    {
      key: 'created_at', label: 'تاريخ الطلب',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—'
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => setStatus(row.id, 'approved')} className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium">قبول</button>
              <button onClick={() => setStatus(row.id, 'rejected')} className="px-2 py-1 text-xs bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors font-medium">رفض</button>
            </>
          )}
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  if (!isDemoMode) return <NotConfigured />

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
          <span>وضع تجريبي — التعديلات لا تُحفظ في قاعدة البيانات. يمكنك تجربة تقديم طلب من صفحة <strong>انضم كفني</strong> وسيظهر هنا مباشرةً.</span>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>يوجد <strong>{pendingCount}</strong> {pendingCount === 1 ? 'طلب' : 'طلبات'} قيد المراجعة بانتظار الاتخاذ قرار.</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالاسم أو الهاتف أو المدينة..."
        actions={
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        }
        emptyMessage="لا توجد طلبات انضمام"
      />

      {/* View Detail Modal */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل طلب الانضمام"
        submitLabel={viewItem?.status === 'pending' ? 'قبول الطلب' : null}
        onSubmit={viewItem?.status === 'pending' ? (e) => { e.preventDefault(); setStatus(viewItem.id, 'approved') } : null}
        size="md"
      >
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">الاسم الكامل</p>
                <p className="font-medium text-gray-800 text-sm">{viewItem.full_name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">رقم الهاتف</p>
                <p className="font-medium text-gray-800 text-sm" dir="ltr">{viewItem.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">التخصص</p>
                <p className="font-medium text-gray-800 text-sm">{viewItem.specialty}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">المدينة</p>
                <p className="font-medium text-gray-800 text-sm">{viewItem.city}</p>
              </div>
            </div>
            {viewItem.description && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">نبذة عن الفني</p>
                <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">الحالة:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[viewItem.status]?.cls}`}>
                  {STATUS_LABELS[viewItem.status]?.label}
                </span>
              </div>
              <span className="text-xs text-gray-400">{new Date(viewItem.created_at).toLocaleDateString('ar-LY')}</span>
            </div>
            {viewItem.status === 'pending' && (
              <button
                onClick={() => setStatus(viewItem.id, 'rejected')}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2 rounded-xl text-sm transition-colors"
              >
                رفض الطلب
              </button>
            )}
          </div>
        )}
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
