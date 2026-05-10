import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Copy, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../lib/api'

export default function AdminUsers() {
  const { isSuperAdmin } = useAdmin()
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form,      setForm]      = useState({ name: '', email: '', role: 'sub_admin', password: '' })
  const [saving,    setSaving]    = useState(false)

  const [editItem,      setEditItem]      = useState(null)
  const [editForm,      setEditForm]      = useState({ name: '', is_active: true, password: '' })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editSaving,    setEditSaving]    = useState(false)

  const [successInfo, setSuccessInfo] = useState(null)
  const [copied,      setCopied]      = useState(false)
  const [toast,       setToast]       = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    api.admin.adminUsers.list()
      .then(users => { setData(users); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = data.filter(r =>
    !search || r.name?.includes(search) || r.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const password = form.password || Math.random().toString(36).slice(2, 10)
      await api.admin.adminUsers.create({
        name:     form.name,
        email:    form.email,
        role:     form.role,
        password,
        is_active: true,
      })
      setSuccessInfo({ email: form.email, password })
      setModalOpen(false)
      setForm({ name: '', email: '', role: 'sub_admin', password: '' })
      load()
    } catch (err) { showToast(err.message || 'حدث خطأ', 'error') }
    setSaving(false)
  }

  const openEdit = (row) => {
    setEditItem(row)
    setEditForm({ name: row.name || '', is_active: row.isActive ?? true, password: '' })
    setEditModalOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      const payload = { name: editForm.name, is_active: editForm.is_active }
      if (editForm.password) payload.password = editForm.password
      await api.admin.adminUsers.update(editItem.id, payload)
      showToast('تم التحديث بنجاح')
      setEditModalOpen(false)
      load()
    } catch (err) { showToast(err.message || 'حدث خطأ', 'error') }
    setEditSaving(false)
  }

  const toggleActive = async (row) => {
    if (row.role === 'super_admin') { showToast('لا يمكن تعطيل المدير العام', 'error'); return }
    try {
      await api.admin.adminUsers.update(row.id, { is_active: !row.isActive })
      setData(prev => prev.map(u => u.id === row.id ? { ...u, isActive: !u.isActive } : u))
    } catch { showToast('حدث خطأ', 'error') }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const columns = [
    {
      key: 'name', label: 'المستخدم',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v || '—'}</p>
          <p className="text-xs text-gray-400" dir="ltr">{row.email}</p>
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
    {
      key: 'isActive', label: 'الحالة',
      render: (v, row) => (
        row.role !== 'super_admin' ? (
          <button onClick={() => toggleActive(row)} className={`flex items-center gap-1 text-xs font-medium ${v ? 'text-green-600' : 'text-gray-400'}`}>
            {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {v ? 'نشط' : 'معطل'}
          </button>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-600">نشط</span>
        )
      )
    },
    {
      key: 'createdAt', label: 'تاريخ الإنشاء',
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

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث بالاسم أو البريد..."
        actions={
          isSuperAdmin && (
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
              <Plus className="w-4 h-4" /> إضافة مشرف فرعي
            </button>
          )
        }
        emptyMessage="لا يوجد مستخدمون"
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة مشرف فرعي" onSubmit={handleCreate} loading={saving} submitLabel="إنشاء">
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم الكامل *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="محمد علي" />
          </div>
          <div>
            <label className="form-label">البريد الإلكتروني *</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" placeholder="admin@example.com" dir="ltr" />
          </div>
          <div>
            <label className="form-label">كلمة المرور (اتركها فارغة لتوليد تلقائي)</label>
            <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input" placeholder="اتركها فارغة للتوليد التلقائي" dir="ltr" />
          </div>
        </div>
      </FormModal>

      <FormModal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="تعديل المشرف" onSubmit={handleEdit} loading={editSaving} submitLabel="حفظ">
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم الكامل</label>
            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="form-input" />
          </div>
          <div>
            <label className="form-label">كلمة مرور جديدة (اتركها فارغة للإبقاء)</label>
            <input type="text" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} className="form-input" dir="ltr" placeholder="اتركها فارغة للإبقاء على الحالية" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#FF7900]" />
              <span className="text-sm text-gray-700">حساب نشط</span>
            </label>
          </div>
        </div>
      </FormModal>

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
                <p className="font-mono text-sm text-gray-800" dir="ltr">{successInfo.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">كلمة المرور</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm text-gray-800" dir="ltr">{successInfo.password}</p>
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
