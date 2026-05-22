import { useState, useEffect } from 'react'
import { Flag, Trash2, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Eye, ExternalLink, Pencil, MessageCircle, User, Images, ArrowLeftToLine } from 'lucide-react'
import api from '../../lib/api'

const STATUS_CONFIG = {
  new:      { label: 'جديد',          color: 'bg-blue-100 text-blue-700',     icon: Clock },
  reviewed: { label: 'قيد المراجعة',  color: 'bg-amber-100 text-amber-700',   icon: Eye },
  resolved: { label: 'تم الحل',       color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'مرفوض',         color: 'bg-red-100 text-red-700',       icon: XCircle },
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

const WA_MESSAGES = {
  resolved: (name, reqType) =>
    `السلام عليكم 👋\nبخصوص طلبك *${REQUEST_TYPE_LABELS[reqType] || reqType}* المتعلق بـ *${name}* على منصة اطلب فني،\n\nيسعدنا إعلامك بأنه تمت مراجعة طلبك ✅ وتم اتخاذ الإجراء اللازم بنجاح.\n\nشكراً لتواصلك معنا 🙏\nفريق اطلب فني`,

  resolved_change: (name, reqType) =>
    `السلام عليكم 👋\nبخصوص طلبك *${REQUEST_TYPE_LABELS[reqType] || reqType}* المتعلق بـ *${name}* على منصة اطلب فني،\n\nنُعلمك بأنه تم تنفيذ التعديل المطلوب ✅ وتم تحديث البيانات على المنصة.\n\nشكراً لمساعدتك في تحسين الدليل 🙏\nفريق اطلب فني`,

  reviewed: (name, reqType) =>
    `السلام عليكم 👋\nبخصوص طلبك *${REQUEST_TYPE_LABELS[reqType] || reqType}* المتعلق بـ *${name}* على منصة اطلب فني،\n\nنُعلمك بأن طلبك قيد المراجعة حالياً من قِبل فريقنا 🔍 وسنتواصل معك بمجرد الانتهاء.\n\nشكراً لصبرك 🙏\nفريق اطلب فني`,

  rejected: (name, reqType) =>
    `السلام عليكم 👋\nبخصوص طلبك *${REQUEST_TYPE_LABELS[reqType] || reqType}* المتعلق بـ *${name}* على منصة اطلب فني،\n\nبعد المراجعة، لم نتمكن من قبول هذا الطلب في الوقت الحالي ❌\n\nإن كان لديك استفسار يمكنك التواصل معنا مجدداً.\nشكراً 🙏\nفريق اطلب فني`,
}

const WA_ACTIONS = [
  { key: 'resolved',        label: 'تم الحل',        cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' },
  { key: 'resolved_change', label: 'تم التعديل',     cls: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200' },
  { key: 'reviewed',        label: 'قيد المراجعة',   cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' },
  { key: 'rejected',        label: 'مرفوض',          cls: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' },
]

function buildWaUrl(phone, actionKey, entityName, requestType) {
  const clean = phone.replace(/\D/g, '')
  const num = clean.startsWith('218') ? clean : clean.startsWith('0') ? '218' + clean.slice(1) : '218' + clean
  const msgFn = WA_MESSAGES[actionKey]
  if (!msgFn) return null
  const msg = msgFn(entityName || '—', requestType)
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const entityPath = (type, id) => {
  if (type === 'technician') return `/technician/${id}`
  if (type === 'company')    return `/company/${id}`
  if (type === 'supplier')   return `/supplier/${id}`
  return null
}

const adminEditPath = (type, id) => {
  if (type === 'technician') return `/admin/technicians?edit=${id}`
  if (type === 'company')    return `/admin/companies?edit=${id}`
  if (type === 'supplier')   return `/admin/suppliers?edit=${id}`
  return null
}

export default function UpdateReports() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [applying, setApplying] = useState({})
  const [applied, setApplied]   = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.admin.updateReports.list()
      setReports(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.admin.updateReports.setStatus(id, status)
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch { }
    setUpdating(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا الطلب؟')) return
    try {
      await api.admin.updateReports.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
      if (expanded === id) setExpanded(null)
    } catch { }
  }

  const handleApplyPhotos = async (id, opts) => {
    const key = `${id}_${opts.apply_profile ? 'p' : 'w'}`
    setApplying(prev => ({ ...prev, [key]: true }))
    try {
      await api.admin.updateReports.applyPhotos(id, opts)
      setApplied(prev => ({ ...prev, [key]: true }))
    } catch { alert('فشل تطبيق الصور، حاول مجدداً') }
    setApplying(prev => ({ ...prev, [key]: false }))
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
                      {entityPath(r.entityType, r.entityId) && (
                        <a href={entityPath(r.entityType, r.entityId)} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors">
                          <ExternalLink className="w-3 h-3" /> عرض
                        </a>
                      )}
                      {adminEditPath(r.entityType, r.entityId) && (
                        <a href={adminEditPath(r.entityType, r.entityId)} onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#FF7900]/10 text-[#FF7900] hover:bg-[#FF7900]/20 font-medium transition-colors">
                          <Pencil className="w-3 h-3" /> تعديل
                        </a>
                      )}
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
                          <p className="text-xs text-slate-400 mb-0.5">رقم الواتساب</p>
                          <p className="font-medium text-slate-700 dir-ltr text-right" dir="ltr">{r.requesterPhone}</p>
                        </div>
                      )}
                    </div>

                    {r.notes && (
                      <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">الملاحظات</p>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{r.notes}</p>
                      </div>
                    )}

                    {/* ── Photos — Profile + Work ── */}
                    {(r.profilePhoto || (Array.isArray(r.workPhotos) && r.workPhotos.length > 0) || (Array.isArray(r.photos) && r.photos.length > 0)) && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500">الصور المرفقة</p>

                        {/* Profile photo */}
                        {r.profilePhoto && (() => {
                          const src = r.profilePhoto.startsWith('/objects/') ? `/api/storage${r.profilePhoto}` : r.profilePhoto
                          const pKey = `${r.id}_p`
                          const isDone = applied[pKey]
                          const isBusy = applying[pKey]
                          return (
                            <div className="bg-white rounded-xl border border-slate-100 p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <User className="w-3.5 h-3.5 text-[#071B33]" />
                                <span className="text-xs font-bold text-[#071B33]">صورة شخصية / شعار</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <a href={src} target="_blank" rel="noreferrer"
                                  className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity flex-shrink-0">
                                  <img src={src} alt="" className="w-full h-full object-cover" />
                                </a>
                                <button
                                  disabled={isBusy || isDone}
                                  onClick={() => handleApplyPhotos(r.id, { apply_profile: true, apply_work: false })}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                    isDone
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                      : 'bg-[#071B33] text-white hover:bg-[#0f2d52] disabled:opacity-50'
                                  }`}>
                                  {isBusy
                                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : isDone
                                      ? <CheckCircle className="w-3.5 h-3.5" />
                                      : <ArrowLeftToLine className="w-3.5 h-3.5" />
                                  }
                                  {isDone ? 'تم التطبيق ✓' : 'تطبيق على الملف'}
                                </button>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Work photos */}
                        {Array.isArray(r.workPhotos) && r.workPhotos.length > 0 && (() => {
                          const wKey = `${r.id}_w`
                          const isDone = applied[wKey]
                          const isBusy = applying[wKey]
                          return (
                            <div className="bg-white rounded-xl border border-slate-100 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <Images className="w-3.5 h-3.5 text-[#FF7900]" />
                                  <span className="text-xs font-bold text-[#071B33]">صور الأعمال ({r.workPhotos.length})</span>
                                </div>
                                <button
                                  disabled={isBusy || isDone}
                                  onClick={() => handleApplyPhotos(r.id, { apply_profile: false, apply_work: true })}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isDone
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                      : 'bg-[#FF7900] text-white hover:bg-[#e66d00] disabled:opacity-50'
                                  }`}>
                                  {isBusy
                                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : isDone
                                      ? <CheckCircle className="w-3.5 h-3.5" />
                                      : <ArrowLeftToLine className="w-3.5 h-3.5" />
                                  }
                                  {isDone ? 'تمت الإضافة ✓' : 'إضافة لصور الأعمال'}
                                </button>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {r.workPhotos.map((p, i) => {
                                  const s = p.startsWith('/objects/') ? `/api/storage${p}` : p
                                  return (
                                    <a key={i} href={s} target="_blank" rel="noreferrer"
                                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity">
                                      <img src={s} alt="" className="w-full h-full object-cover" />
                                    </a>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}

                        {/* Legacy photos (old reports without split fields) */}
                        {!r.profilePhoto && !(Array.isArray(r.workPhotos) && r.workPhotos.length > 0) && Array.isArray(r.photos) && r.photos.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-100 p-3">
                            <p className="text-xs text-slate-400 mb-2">صور مرفقة ({r.photos.length})</p>
                            <div className="flex gap-2 flex-wrap">
                              {r.photos.map((p, i) => {
                                const s = p.startsWith('/objects/') ? `/api/storage${p}` : p
                                return (
                                  <a key={i} href={s} target="_blank" rel="noreferrer"
                                    className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity">
                                    <img src={s} alt="" className="w-full h-full object-cover" />
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        )}
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

                    {/* WhatsApp notify — only if requester left a number */}
                    {r.requesterPhone && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span className="text-xs font-semibold text-slate-600">إشعار مقدّم الطلب عبر واتساب:</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {WA_ACTIONS.map(action => {
                            const url = buildWaUrl(r.requesterPhone, action.key, r.entityName || r.entityId, r.requestType)
                            if (!url) return null
                            return (
                              <a key={action.key} href={url} target="_blank" rel="noreferrer"
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${action.cls}`}>
                                <WaIcon />
                                {action.label}
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}

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
