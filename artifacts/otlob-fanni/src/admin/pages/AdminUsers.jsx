import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, ToggleLeft, ToggleRight, AlertCircle, Copy, CheckCircle } from 'lucide-react'

export default function AdminUsers() {
  const { logActivity } = useAdmin()
  const [data, setData] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', city_id: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({ full_name: '', city_id: '', is_active: true })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    loadData()
    loadCities()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('profiles')
      .select('*,cities(name_ar)')
      .in('role', ['super_admin', 'sub_admin'])
      .order('created_at', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }

  const loadCities = async () => {
    const { data: c } = await supabase.from('cities').select('id,name_ar').eq('is_active', true).order('sort_order')
    setCities(c || [])
  }

  const filtered = data.filter(r =>
    !search || r.full_name?.includes(search) || r.email?.includes(search)
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-sub-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          city_id: form.city_id || null,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'حدث خطأ')
      await logActivity('create_sub_admin', 'profiles', result.user_id, `Created: ${form.email}`)
      setSuccessInfo({ email: form.email, password: form.password })
      setModalOpen(false)
      setForm({ full_name: '', email: '', password: '', city_id: '', is_active: true })
      loadData()
    } catch (err) {
      showToast(err.message, 'error')
    }
    setSaving(false)
  }

  const openEdit = (row) => {
    setEditItem(row)
    setEditForm({ full_name: row.full_name || '', city_id: row.city_id || '', is_active: row.is_active ?? true })
    setEditModalOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-admin-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          target_user_id: editItem.id,
          full_name: editForm.full_name,
          city_id: editForm.city_id || null,
          is_active: editForm.is_active,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'حدث خطأ')
      showToast('تم التحديث بنجاح')
      setEditModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message, 'error')
    }
    setEditSaving(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const columns = [
    {
      key: 'full_name', label: 'المستخدم',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v || '—'}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      )
    },
    {
      key: 'role', label: 'الدور',
      render: (v) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v === 'super_admin' ? 'bg-[#071B33] text-white' : 'bg-[#FF7900]/10 text-[#FF7900]'}`}>
          {v === 'super_admin' ? 'Super Admin' : 'Sub Admin'}
        </span>
      )
    },
    { key: 'cities', label: 'المدينة', render: (v) => v?.name_ar || '—' },
    {
      key: 'is_active', label: 'الحالة',
      render: (v) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {v ? 'نشط' : 'معطل'}
        </span>
      )
    },
    {
      key: 'created_at', label: 'تاريخ الإنشاء',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—'
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => row.role === 'sub_admin' ? (
        <button onClick={() => openEdit(row)} className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors">
          تعديل
        </button>
      ) : <span className="text-xs text-gray-300">—</span>
    },
  ]

  if (!isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالاسم أو البريد..."
        actions={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة مشرف فرعي
          </button>
        }
        emptyMessage="لا يوجد مستخدمون"
      />

      {/* Create Sub Admin Modal */}
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة مشرف فرعي" onSubmit={handleCreate} loading={saving} submitLabel="إنشاء">
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم الكامل *</label>
            <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="form-input" placeholder="محمد علي" />
          </div>
          <div>
            <label className="form-label">البريد الإلكتروني *</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" placeholder="admin@example.com" dir="ltr" />
          </div>
          <div>
            <label className="form-label">كلمة المرور المؤقتة *</label>
            <input required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input" placeholder="6 أحرف على الأقل" dir="ltr" />
          </div>
          <div>
            <label className="form-label">المدينة المسؤول عنها</label>
            <select value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} className="form-input">
              <option value="">بدون مدينة محددة</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>
        </div>
      </FormModal>

      {/* Edit Sub Admin Modal */}
      <FormModal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="تعديل المشرف" onSubmit={handleEdit} loading={editSaving} submitLabel="حفظ">
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم الكامل</label>
            <input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="form-input" />
          </div>
          <div>
            <label className="form-label">المدينة</label>
            <select value={editForm.city_id} onChange={e => setEditForm(f => ({ ...f, city_id: e.target.value }))} className="form-input">
              <option value="">بدون مدينة</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#FF7900]" />
              <span className="text-sm text-gray-700">حساب نشط</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Success Info Modal */}
      {successInfo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">تم إنشاء الحساب بنجاح</h3>
                <p className="text-xs text-gray-400">احفظ بيانات الدخول</p>
              </div>
            </div>
            <div className="bg-[#F7F8FA] rounded-xl p-4 space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">البريد الإلكتروني</p>
                <p className="font-mono text-sm text-gray-800">{successInfo.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">كلمة المرور المؤقتة</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm text-gray-800">{successInfo.password}</p>
                  <button onClick={() => copyToClipboard(`${successInfo.email}\n${successInfo.password}`)} className="text-[#FF7900] hover:text-[#e86d00]">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setSuccessInfo(null)} className="w-full bg-[#FF7900] text-white font-medium py-2.5 rounded-xl hover:bg-[#e86d00] transition-colors">
              حسناً
            </button>
          </div>
        </div>
      )}
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
