import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import { AlertCircle, RefreshCw, Info } from 'lucide-react'

const PAGE_SIZE = 20

const ACTION_LABELS = {
  add_technician:      'إضافة فني',
  update_technician:   'تعديل فني',
  delete_technician:   'حذف فني',
  add_category:        'إضافة تخصص',
  update_category:     'تعديل تخصص',
  add_city:            'إضافة مدينة',
  update_city:         'تعديل مدينة',
  update_request_status: 'تحديث طلب',
  add_ad:              'إضافة إعلان',
  update_ad:           'تعديل إعلان',
  create_sub_admin:    'إنشاء مشرف',
  update_admin_user:   'تعديل مشرف',
  update_settings:     'تعديل الإعدادات',
  approve_join:        'قبول انضمام',
  reject_join:         'رفض انضمام',
}

const ACTION_COLORS = {
  add_technician:      'bg-green-50 text-green-700',
  update_technician:   'bg-blue-50 text-blue-700',
  delete_technician:   'bg-red-50 text-red-700',
  create_sub_admin:    'bg-purple-50 text-purple-700',
  update_request_status: 'bg-orange-50 text-orange-700',
  approve_join:        'bg-teal-50 text-teal-700',
  reject_join:         'bg-red-50 text-red-600',
}

const DEMO_LOGS = [
  { id: 'l1',  profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'add_technician',      table_name: 'technicians',      details: 'Added: فيصل الغرياني',           created_at: '2026-05-10T09:30:00Z' },
  { id: 'l2',  profiles: { full_name: 'مشرف طرابلس',     email: 'tripoli@otlobfanni.ly' }, action: 'update_request_status', table_name: 'service_requests', details: 'Status: assigned',              created_at: '2026-05-10T09:15:00Z' },
  { id: 'l3',  profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'approve_join',        table_name: 'join_requests',    details: 'Approved: نجم الدين فرج',        created_at: '2026-05-10T08:45:00Z' },
  { id: 'l4',  profiles: { full_name: 'مشرف بنغازي',     email: 'benghazi@otlobfanni.ly' }, action: 'update_technician', table_name: 'technicians',      details: 'Updated: سالم علي',              created_at: '2026-05-09T16:00:00Z' },
  { id: 'l5',  profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'add_ad',             table_name: 'ads',              details: 'Added: عرض صيانة الصيف',         created_at: '2026-05-09T14:20:00Z' },
  { id: 'l6',  profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'create_sub_admin',   table_name: 'profiles',         details: 'Created: misrata@otlobfanni.ly', created_at: '2026-05-09T12:00:00Z' },
  { id: 'l7',  profiles: { full_name: 'مشرف طرابلس',     email: 'tripoli@otlobfanni.ly' }, action: 'update_request_status', table_name: 'service_requests', details: 'Status: completed',           created_at: '2026-05-08T17:30:00Z' },
  { id: 'l8',  profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'add_city',           table_name: 'cities',           details: 'Added: طبرق',                     created_at: '2026-05-08T11:00:00Z' },
  { id: 'l9',  profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'update_category',    table_name: 'categories',       details: 'Updated: كهرباء',                 created_at: '2026-05-07T10:00:00Z' },
  { id: 'l10', profiles: { full_name: 'مشرف بنغازي',     email: 'benghazi@otlobfanni.ly' }, action: 'reject_join',     table_name: 'join_requests',    details: 'Rejected: سليمان الزروق',        created_at: '2026-05-06T09:30:00Z' },
  { id: 'l11', profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'delete_technician',  table_name: 'technicians',      details: 'Deleted: حسين فرج',               created_at: '2026-05-05T15:45:00Z' },
  { id: 'l12', profiles: { full_name: 'Demo Super Admin', email: 'admin@otlobfanni.ly' }, action: 'update_settings',    table_name: 'app_settings',     details: 'Updated app settings',           created_at: '2026-05-04T08:00:00Z' },
]

export default function ActivityLogs() {
  const { isDemoMode } = useAdmin()
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)

  useEffect(() => {
    if (isDemoMode) { setData(DEMO_LOGS); setTotal(DEMO_LOGS.length); setLoading(false); return }
    if (!isSupabaseConfigured || !supabase) return
    loadData()
  }, [isDemoMode, page])

  const loadData = async () => {
    setLoading(true)
    const { data: rows, count } = await supabase
      .from('activity_logs')
      .select('*,profiles(full_name,email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    setData(rows || []); setTotal(count || 0); setLoading(false)
  }

  const filtered = data.filter(r =>
    !search ||
    ACTION_LABELS[r.action]?.includes(search) ||
    r.details?.includes(search) ||
    r.profiles?.full_name?.includes(search) ||
    r.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const paged      = isDemoMode ? filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE) : filtered
  const totalPages = isDemoMode ? Math.ceil(filtered.length / PAGE_SIZE) : Math.ceil(total / PAGE_SIZE)

  const columns = [
    {
      key: 'profiles', label: 'المستخدم',
      render: (v) => (
        <div>
          <p className="font-medium text-sm text-gray-800">{v?.full_name || 'غير محدد'}</p>
          <p className="text-xs text-gray-400">{v?.email || ''}</p>
        </div>
      )
    },
    {
      key: 'action', label: 'الإجراء',
      render: (v) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[v] || 'bg-gray-100 text-gray-600'}`}>
          {ACTION_LABELS[v] || v}
        </span>
      )
    },
    { key: 'table_name', label: 'الجدول', render: (v) => <span className="text-xs font-mono bg-[#F7F8FA] px-2 py-0.5 rounded text-gray-600">{v || '—'}</span> },
    { key: 'details',    label: 'التفاصيل', render: (v) => <span className="text-xs text-gray-500 max-w-[200px] truncate block">{v || '—'}</span> },
    {
      key: 'created_at', label: 'الوقت',
      render: (v) => v ? (
        <div>
          <p className="text-xs text-gray-600">{new Date(v).toLocaleDateString('ar-LY')}</p>
          <p className="text-xs text-gray-400">{new Date(v).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      ) : '—'
    },
  ]

  if (!isDemoMode && !isSupabaseConfigured) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-white rounded-2xl p-8 border border-amber-200 max-w-md">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-1">لم يتم ربط قاعدة البيانات</h3>
        <p className="text-gray-500 text-sm">أضف مفاتيح Supabase في إعدادات المشروع</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>وضع تجريبي — هذه سجلات توضيحية فقط.</span>
        </div>
      )}
      <DataTable
        columns={columns} data={paged} loading={loading}
        searchValue={search} onSearchChange={v => { setSearch(v); setPage(1) }} searchPlaceholder="بحث في السجلات..."
        actions={
          !isDemoMode && (
            <button onClick={loadData} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" /> تحديث
            </button>
          )
        }
        emptyMessage="لا توجد سجلات"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
