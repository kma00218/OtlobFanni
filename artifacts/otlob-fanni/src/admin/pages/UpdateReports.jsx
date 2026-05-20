import { useState, useEffect } from 'react'
import { Flag, Trash2, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import api from '../../lib/api'

const STATUS_CONFIG = {
  new:      { label: 'جديد',    labelEn: 'New',      color: 'bg-blue-100 text-blue-700',    icon: Clock },
  reviewed: { label: 'تمت المراجعة', labelEn: 'Reviewed', color: 'bg-amber-100 text-amber-700', icon: Eye },
  resolved: { label: 'تم الحل',  labelEn: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'مرفوض',   labelEn: 'Rejected', color: 'bg-red-100 text-red-700',     icon: XCircle },
}

const REQUEST_TYPE_LABELS = {
  data_update:          'تحديث بيانات',
  wrong_number:         'رقم غير صحيح',
  not_available:        'النشاط غير متوفر',
  city_correction:      'تصحيح المدينة',
  specialty_correction: 'تصحيح التخصص',
  other:                'أخرى',
}

const ENTITY_TYPE_LABELS = {
  technician: 'فني',
  company:    'شركة',
  supplier:   'مورد',
}

export default function UpdateReports() {
  const [reports, setReports]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [expanded, setExpanded]     = useState(null)
  const [updating, setUpdating]     = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.admin.updateReports.list()
      setReports(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.admin.updateReports.setStatus(id, status)
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch { /* ignore */ }
    setUpdating(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا الطلب؟')) return
    try {
      await api.admin.updateReports.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
      if (expanded === id) setExpanded(null)
    } catch { /* ignore */ }
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)
  const counts = { all: reports.length, new: 0, reviewed: 0, resolved: 0, rejected: 0 }
  reports.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++ })

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#071B33] flex items-center gap-2">
            <Flag className="w-6 h-6 text-[#FF7900]" />
            طلبات التحديث والإبلاغ
          </h1>
          <p className="text-sm text-gray-400 mt-1">مراجعة الطلبات المُرسلة من الزوار</p>
        </div>
        <button onClick={load}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors">
          تحديث
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all',      label: 'الكل' },
          { key: 'new',      label: 'جديد' },
          { key: 'reviewed', label: 'قيد المراجعة' },
          { key: 'resolved', label: 'تم الحل' },
          { key: 'rejected', label: 'مرفوض' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
              filter === key
                ? 'bg-[#FF7900] border-[#FF7900] text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#FF7900]/50'
            }`}>
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20 border border-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <Flag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const StatusIcon = STATUS_CONFIG[r.status]?.icon || Clock
            const statusCfg  = STATUS_CONFIG[r.status] || STATUS_CONFIG.new
            const isExpanded = expanded === r.id
            const isUpdating = updating === r.id

            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Row header */}
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : r.id)}>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#071B33] text-sm truncate">{r.entityName || r.entityId}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        {ENTITY_TYPE_LABELS[r.entityType] || r.entityType}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
                        {REQUEST_TYPE_LABELS[r.requestType] || r.requestType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.city && <span className="ml-2">{r.city}</span>}
                      {new Date(r.createdAt).toLocaleDateString('ar-LY', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {r.requesterName && (
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-xs text-slate-400 mb-0.5">اسم مُقدّم الطلب</p>
                          <p className="font-medium text-slate-700">{r.requesterName}</p>
                        </div>
                      )}
                      {r.requesterPhone && (
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-xs text-slate-400 mb-0.5">رقم الهاتف</p>
                          <p className="font-medium text-slate-700 dir-ltr text-right">{r.requesterPhone}</p>
                        </div>
                      )}
                    </div>

                    {r.notes && (
                      <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">الملاحظات</p>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{r.notes}</p>
                      </div>
                    )}

                    {Array.isArray(r.photos) && r.photos.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">الصور المرفقة ({r.photos.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {r.photos.map((p, i) => (
                            <a key={i} href={p.startsWith('/objects/') ? `/api/storage${p}` : p}
                              target="_blank" rel="noreferrer"
                              className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity bg-slate-100 flex items-center justify-center">
                              <img src={p.startsWith('/objects/') ? `/api/storage${p}` : p}
                                alt="" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="flex gap-2 flex-wrap items-center border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-400 font-medium ml-auto">تغيير الحالة:</span>
                      {Object.entries(STATUS_CONFIG).filter(([k]) => k !== r.status).map(([k, cfg]) => (
                        <button key={k} disabled={isUpdating}
                          onClick={() => handleStatus(r.id, k)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${cfg.color} hover:opacity-80`}>
                          {cfg.label}
                        </button>
                      ))}
                      <button onClick={() => handleDelete(r.id)} disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
