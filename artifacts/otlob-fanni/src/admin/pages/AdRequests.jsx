import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, Trash2, X, ExternalLink, Phone, MapPin, Megaphone, Building2, ChevronDown } from 'lucide-react'
import api from '../../lib/api'
import { sections, categories } from '../../data/services'

const STATUS_MAP = {
  pending:  { label: 'قيد الانتظار', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' },
  approved: { label: 'مقبول',        cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  rejected: { label: 'مرفوض',        cls: 'bg-red-500/15 text-red-400 border border-red-500/20' },
}

const PLACEMENTS = [
  { value: 'home_after_all_specialties', label: 'الصفحة الرئيسية — تحت زر كل التخصصات' },
  { value: 'section_page',               label: 'صفحة قسم معين' },
  { value: 'category_page',              label: 'صفحة تخصص معين' },
  { value: 'all_specialties_page',       label: 'صفحة كل التخصصات' },
  { value: 'trusted_companies',          label: 'صفحة الشركات المعتمدة' },
  { value: 'global',                     label: 'كل الصفحات' },
]

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: '—', cls: 'bg-white/5 text-[#666680]' }
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.cls}`}>{s.label}</span>
}

function DetailRow({ label, value, dir }) {
  if (!value) return null
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#555570]">{label}</p>
      <p className={`text-sm text-white break-all leading-snug ${dir === 'ltr' ? 'font-mono text-xs' : ''}`} dir={dir}>{value}</p>
    </div>
  )
}

// ── Placement selection modal ─────────────────────────────────────────────────
function PlacementModal({ req, onClose, onConfirm }) {
  const [placement, setPlacement] = useState('home_after_all_specialties')
  const [sectionId, setSectionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const needsSection = placement === 'section_page'
  const needsCategory = placement === 'category_page'

  const filteredCats = sectionId
    ? categories.filter(c => c.sectionId === sectionId)
    : categories

  const handleConfirm = async () => {
    if (needsSection && !sectionId) return alert('يرجى اختيار القسم')
    if (needsCategory && !categoryId) return alert('يرجى اختيار التخصص')
    setSaving(true)
    await onConfirm({
      placement,
      sectionId: needsSection ? sectionId : null,
      categoryId: needsCategory ? categoryId : null,
      sortOrder: Number(sortOrder) || 0,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-[#0E0E17] border border-white/8 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#0E0E17] z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-white text-base">اختر مكان النشر</h2>
            <p className="text-xs text-[#666680] mt-0.5">{req.companyName || req.company_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8888A8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Placement */}
          <div>
            <label className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-1.5 block">مكان ظهور الإعلان</label>
            <div className="relative">
              <select
                value={placement}
                onChange={e => { setPlacement(e.target.value); setSectionId(''); setCategoryId('') }}
                className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50"
              >
                {PLACEMENTS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666680] pointer-events-none" />
            </div>
          </div>

          {/* Section picker */}
          {needsSection && (
            <div>
              <label className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-1.5 block">اختر القسم</label>
              <div className="relative">
                <select
                  value={sectionId}
                  onChange={e => { setSectionId(e.target.value); setCategoryId('') }}
                  className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50"
                >
                  <option value="">-- اختر قسمًا --</option>
                  {sections.filter(s => s.isActive).map(s => (
                    <option key={s.id} value={s.id}>{s.nameAr}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666680] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Category picker */}
          {needsCategory && (
            <div>
              <label className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-1.5 block">اختر التخصص</label>
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={sectionId}
                    onChange={e => { setSectionId(e.target.value); setCategoryId('') }}
                    className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50"
                  >
                    <option value="">-- تصفية بالقسم (اختياري) --</option>
                    {sections.filter(s => s.isActive).map(s => (
                      <option key={s.id} value={s.id}>{s.nameAr}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666680] pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50"
                  >
                    <option value="">-- اختر التخصص --</option>
                    {filteredCats.map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666680] pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Sort order */}
          <div>
            <label className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-1.5 block">ترتيب الإعلان</label>
            <input
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              min={0}
              className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FF7900]/50"
              placeholder="0"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-1.5 block">تاريخ البداية</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7900]/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8888A8] uppercase tracking-wider mb-1.5 block">تاريخ الانتهاء</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[#1A1A28] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7900]/50"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div
            className="flex items-center justify-between bg-[#1A1A28] rounded-xl px-4 py-3 border border-white/8 cursor-pointer"
            onClick={() => setIsActive(v => !v)}
          >
            <span className="text-sm text-white font-medium">نشر الإعلان فور الموافقة</span>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${isActive ? 'bg-emerald-500' : 'bg-white/15'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <CheckCircle className="w-4 h-4" />}
            تأكيد الموافقة ونشر الإعلان
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function DetailModal({ req, onClose, onApproveClick, onReject }) {
  if (!req) return null
  const title     = req.adTitle     || req.ad_title     || ''
  const desc      = req.adDescription || req.ad_description || ''
  const business  = req.companyName  || req.company_name  || ''
  const contact   = req.contactName  || req.contact_name  || ''
  const phone     = req.phone || ''
  const whatsapp  = req.whatsapp || ''
  const city      = req.city || ''
  const link      = req.websiteOrSocialLink || req.website_or_social_link || ''
  const notes     = req.notes || ''
  const image     = req.imagePreview  || req.image_preview  || ''
  const createdAt = req.createdAt     || req.created_at     || ''
  const isPending = req.status === 'pending'

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-[#0E0E17] border border-white/8 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#0E0E17] z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-white text-base">طلب إعلان</h2>
            <p className="text-xs text-[#666680] mt-0.5">{business}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={req.status} />
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8888A8]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {image && (
            <div className="rounded-xl overflow-hidden border border-white/8">
              <img src={image} alt="ad" className="w-full max-h-44 object-cover" />
            </div>
          )}

          {(title || desc) && (
            <div className="bg-white/3 rounded-xl p-4 space-y-2 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF7900]">محتوى الإعلان</p>
              {title && <p className="font-bold text-white text-sm">{title}</p>}
              {desc && <p className="text-[#8888A8] text-sm leading-relaxed">{desc}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="رقم الهاتف"   value={phone}    dir="ltr" />
            <DetailRow label="واتساب"        value={whatsapp} dir="ltr" />
            <DetailRow label="المدينة"       value={city}     />
            <DetailRow label="اسم المسؤول"  value={contact}  />
          </div>

          {link && (
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#555570]">الرابط</p>
              <a href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1 break-all">
                {link} <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}
          {notes && <DetailRow label="ملاحظات" value={notes} />}
          <DetailRow label="تاريخ الإرسال" value={createdAt ? new Date(createdAt).toLocaleString('ar-LY') : '—'} />

          {isPending && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { onClose(); onApproveClick(req) }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> قبول الطلب
              </button>
              <button
                onClick={() => onReject(req.id)}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors border border-red-500/20"
              >
                <XCircle className="w-4 h-4" /> رفض
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const reload = () => {
    setLoading(true)
    api.admin.adRequests.list()
      .then(rows => { setRequests(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const rejectRequest = async (id) => {
    try {
      await api.admin.adRequests.update(id, 'rejected')
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
      if (viewItem?.id === id) setViewItem(v => ({ ...v, status: 'rejected' }))
      showToast('تم رفض الطلب')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const handleApproveConfirm = async (req, placementSettings) => {
    try {
      const { placement, sectionId, categoryId, sortOrder, startDate, endDate, isActive } = placementSettings

      // 1. Update request status
      await api.admin.adRequests.update(req.id, 'approved')

      // 2. Create the ad with chosen placement
      await api.admin.ads.create({
        id:             'ad_' + req.id + '_' + Date.now(),
        title_ar:       req.adTitle || req.ad_title || req.companyName || req.company_name || '',
        title_en:       '',
        description_ar: req.adDescription || req.ad_description || '',
        image_url:      req.imagePreview  || req.image_preview  || null,
        link_url:       req.websiteOrSocialLink || req.website_or_social_link || null,
        placement,
        section_id:     sectionId  || null,
        category_id:    categoryId || null,
        sort_order:     sortOrder,
        start_date:     startDate  || null,
        end_date:       endDate    || null,
        is_active:      isActive,
      })

      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r))
      setApproveTarget(null)
      showToast('تم قبول الطلب وإنشاء الإعلان بنجاح')
    } catch (e) {
      showToast('حدث خطأ أثناء الحفظ', 'error')
    }
  }

  const deleteRequest = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await api.admin.adRequests.delete(id)
      setRequests(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم حذف الطلب')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const filtered = filter ? requests.filter(r => r.status === filter) : requests

  const counts = {
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-5" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {viewItem && (
        <DetailModal
          req={viewItem}
          onClose={() => setViewItem(null)}
          onApproveClick={(req) => setApproveTarget(req)}
          onReject={(id) => { rejectRequest(id); setViewItem(null) }}
        />
      )}

      {approveTarget && (
        <PlacementModal
          req={approveTarget}
          onClose={() => setApproveTarget(null)}
          onConfirm={(settings) => handleApproveConfirm(approveTarget, settings)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">طلبات الإعلانات</h1>
          <p className="text-sm text-[#666680] mt-0.5">إدارة طلبات الإعلان من الأنشطة التجارية</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'قيد الانتظار', count: counts.pending,  colorCls: 'text-amber-400',   bg: 'bg-amber-500/8',   key: 'pending'  },
          { label: 'مقبولة',       count: counts.approved, colorCls: 'text-emerald-400', bg: 'bg-emerald-500/8', key: 'approved' },
          { label: 'مرفوضة',       count: counts.rejected, colorCls: 'text-red-400',     bg: 'bg-red-500/8',     key: 'rejected' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? '' : s.key)}
            className={`rounded-2xl border p-4 text-center transition-all ${filter === s.key ? 'border-[#FF7900] bg-[#FF7900]/8' : `border-white/5 ${s.bg} hover:border-white/10`}`}
          >
            <p className={`text-3xl font-black ${s.colorCls}`}>{s.count}</p>
            <p className="text-xs text-[#666680] mt-1 font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-[#12121E] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">
            {filter ? `${STATUS_MAP[filter]?.label} (${filtered.length})` : `جميع الطلبات (${requests.length})`}
          </h2>
          {filter && (
            <button onClick={() => setFilter('')} className="text-xs text-[#FF7900] hover:underline">
              عرض الكل
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#FF7900] rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="w-10 h-10 text-[#333350] mx-auto mb-3" />
            <p className="text-[#555570] text-sm">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {filtered.map(r => {
              const business  = r.companyName  || r.company_name  || '—'
              const phone     = r.phone || '—'
              const city      = r.city || ''
              const title     = r.adTitle || r.ad_title || ''
              const createdAt = r.createdAt || r.created_at || ''
              const image     = r.imagePreview || r.image_preview || ''
              return (
                <div key={r.id} className="px-5 py-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-start gap-3">
                    {image ? (
                      <img src={image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/8" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-[#FF7900]/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm leading-tight">{business}</p>
                          {title && <p className="text-xs text-[#8888A8] mt-0.5 line-clamp-1">{title}</p>}
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-xs text-[#666680] flex items-center gap-1">
                          <Phone className="w-3 h-3" />{phone}
                        </span>
                        {city && (
                          <span className="text-xs text-[#666680] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{city}
                          </span>
                        )}
                      </div>
                      {createdAt && (
                        <p className="text-[10px] text-[#444460] mt-1.5">
                          {new Date(createdAt).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/4">
                    <button
                      onClick={() => setViewItem(r)}
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/15 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> عرض التفاصيل
                    </button>
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setApproveTarget(r)}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/8 hover:bg-emerald-500/15 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> قبول
                        </button>
                        <button
                          onClick={() => rejectRequest(r.id)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/8 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> رفض
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteRequest(r.id)}
                      className="mr-auto flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
