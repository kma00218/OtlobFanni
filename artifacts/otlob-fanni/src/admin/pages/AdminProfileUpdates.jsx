import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, User, Building2, Package } from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'

const TYPE_LABEL = { technician: 'فني', company: 'شركة', supplier: 'مورد مستلزمات' }
const TYPE_ICON  = { technician: User, company: Building2, supplier: Package }

const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
}
const STATUS_LABELS = {
  pending:   'قيد المراجعة',
  approved:  'مقبول',
  rejected:  'مرفوض',
  cancelled: 'ملغي',
}

function ChangeRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  if (Array.isArray(value)) {
    if (value.length === 0) return null
    const isImages = typeof value[0] === 'string' && value[0].includes('/')
    return (
      <div className="py-2.5 border-b border-slate-100 last:border-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
        {isImages ? (
          <div className="flex flex-wrap gap-2">
            {value.map((src, i) => (
              <img key={i} src={getFileUrl(src)} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v, i) => (
              <span key={i} className="text-xs bg-[#FF7900]/10 text-[#FF7900] px-2 py-1 rounded-lg font-medium">{v}</span>
            ))}
          </div>
        )}
      </div>
    )
  }
  const isImagePath = typeof value === 'string' && (value.startsWith('uploads/') || value.includes('/o/'))
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      {isImagePath
        ? <img src={getFileUrl(value)} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
        : <p className="text-sm text-[#071B33] font-medium">{String(value)}</p>
      }
    </div>
  )
}

const CHANGE_LABELS = {
  nameAr:           'الاسم (عربي)',
  nameEn:           'الاسم (إنجليزي)',
  descriptionAr:    'الوصف',
  descriptionEn:    'الوصف (إنجليزي)',
  profilePhoto:     'صورة الملف الشخصي',
  companyLogo:      'شعار الشركة',
  logo:             'الشعار',
  workImages:       'صور الأعمال',
  shopImages:       'صور المحل',
  categoryId:       'التخصص',
  specialty:        'التخصص',
  supplyType:       'نوع المستلزمات',
  companyName:      'اسم الشركة',
  businessName:     'اسم النشاط',
  description:      'الوصف',
  extraSpecialties: 'تخصصات إضافية',
}

function RequestCard({ req, onReview }) {
  const [expanded, setExpanded] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote]         = useState('')
  const [loading, setLoading]   = useState(false)

  const Icon = TYPE_ICON[req.entityType] || User
  const changes = req.changes || {}
  const changeKeys = Object.keys(changes).filter(k => changes[k] !== undefined && changes[k] !== null)

  const handleAction = async (action) => {
    setLoading(true)
    try {
      await api.admin.profileUpdates.review(req.id, action, note || undefined)
      onReview(req.id, action === 'approve' ? 'approved' : 'rejected')
    } catch (err) {
      alert(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#071B33]/8 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#071B33]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#FF7900] bg-[#FF7900]/10 px-2 py-0.5 rounded-full">
              {TYPE_LABEL[req.entityType] || req.entityType}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[req.status] || STATUS_COLORS.pending}`}>
              {STATUS_LABELS[req.status] || req.status}
            </span>
          </div>
          <p className="text-sm font-bold text-[#071B33] mt-1 truncate">ID: {req.entityId}</p>
          <p className="text-xs text-slate-400 mt-0.5">{changeKeys.length} تعديل · {new Date(req.createdAt).toLocaleDateString('ar-LY')}</p>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-slate-400 hover:text-slate-600 transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* Changes */}
          <div className="px-4 py-3">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">التعديلات المطلوبة</p>
            {changeKeys.length === 0
              ? <p className="text-sm text-slate-400 text-center py-2">لا توجد تعديلات</p>
              : changeKeys.map(k => (
                <ChangeRow key={k} label={CHANGE_LABELS[k] || k} value={changes[k]} />
              ))
            }
          </div>

          {/* Admin note display */}
          {req.adminNote && (
            <div className="mx-4 mb-3 bg-slate-50 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-slate-500 mb-1">ملاحظة الإدارة</p>
              <p className="text-sm text-slate-700">{req.adminNote}</p>
            </div>
          )}

          {/* Actions (only for pending) */}
          {req.status === 'pending' && (
            <div className="px-4 pb-4 space-y-3">
              {/* Optional note */}
              {noteOpen ? (
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ملاحظة للمستخدم (اختياري)..."
                  rows={2}
                  dir="rtl"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-[#FF7900] resize-none transition-all"
                />
              ) : (
                <button onClick={() => setNoteOpen(true)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">
                  + إضافة ملاحظة للمستخدم
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 text-white active:scale-95 transition-all disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4" />
                  قبول
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-red-500 text-white active:scale-95 transition-all disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminProfileUpdates() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('pending')

  useEffect(() => {
    api.admin.profileUpdates.list()
      .then(data => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleReview = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const FILTERS = [
    { key: 'pending',  label: 'قيد المراجعة' },
    { key: 'approved', label: 'مقبولة' },
    { key: 'rejected', label: 'مرفوضة' },
    { key: 'all',      label: 'الكل' },
  ]

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="max-w-3xl mx-auto space-y-5" dir="rtl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-[#071B33]">طلبات تعديل الملفات</h1>
          {pendingCount > 0 && (
            <span className="bg-[#FF7900] text-white text-xs font-black px-2.5 py-1 rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mt-1">مراجعة طلبات التعديل المقدَّمة من الفنيين والشركات والموردين</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === f.key
                ? 'bg-[#071B33] text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
            {f.key === 'pending' && pendingCount > 0 && (
              <span className="mr-1.5 bg-[#FF7900] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#FF7900] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
          <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">لا توجد طلبات {filter !== 'all' ? STATUS_LABELS[filter] : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} onReview={handleReview} />
          ))}
        </div>
      )}
    </div>
  )
}
