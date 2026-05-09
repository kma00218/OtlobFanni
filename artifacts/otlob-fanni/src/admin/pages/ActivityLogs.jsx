import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import DataTable from '../components/DataTable'
import { AlertCircle, RefreshCw } from 'lucide-react'

const PAGE_SIZE = 20

const ACTION_LABELS = {
  add_technician: 'إضافة فني',
  update_technician: 'تعديل فني',
  delete_technician: 'حذف فني',
  add_category: 'إضافة تخصص',
  update_category: 'تعديل تخصص',
  add_city: 'إضافة مدينة',
  update_city: 'تعديل مدينة',
  update_request_status: 'تحديث طلب',
  add_ad: 'إضافة إعلان',
  update_ad: 'تعديل إعلان',
  create_sub_admin: 'إنشاء مشرف',
  update_admin_user: 'تعديل مشرف',
  update_settings: 'تعديل الإعدادات',
}

const ACTION_COLORS = {
  add_technician: 'bg-green-50 text-green-700',
  update_technician: 'bg-blue-50 text-blue-700',
  delete_technician: 'bg-red-50 text-red-700',
  create_sub_admin: 'bg-purple-50 text-purple-700',
  update_request_status: 'bg-orange-50 text-orange-700',
}

export default function ActivityLogs() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    const { data: rows, count } = await supabase
      .from('activity_logs')
      .select('*,profiles(full_name,email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    setData(rows || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const filtered = data.filter(r =>
    !search ||
    r.action?.includes(search) ||
    r.details?.includes(search) ||
    r.profiles?.full_name?.includes(search) ||
    r.profiles?.email?.includes(search)
  )

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
    {
      key: 'table_name', label: 'الجدول',
      render: (v) => <span className="text-xs font-mono bg-[#F7F8FA] px-2 py-0.5 rounded text-gray-600">{v || '—'}</span>
    },
    {
      key: 'details', label: 'التفاصيل',
      render: (v) => <span className="text-xs text-gray-500 max-w-[200px] truncate block">{v || '—'}</span>
    },
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

  if (!isSupabaseConfigured) return (
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
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث في السجلات..."
        actions={
          <button onClick={loadData} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        }
        emptyMessage="لا توجد سجلات"
        currentPage={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
      />
    </div>
  )
}
