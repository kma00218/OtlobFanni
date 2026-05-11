import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, Trash2, X, ExternalLink } from 'lucide-react'
import api from '../../lib/api'

const STATUS_MAP = {
  pending:  ['قيد الانتظار', 'bg-amber-500/10 text-amber-400'],
  approved: ['مقبول',        'bg-emerald-500/10 text-emerald-400'],
  rejected: ['مرفوض',        'bg-red-500/10 text-red-400'],
}

function StatusBadge({ status }) {
  const [label, cls] = STATUS_MAP[status] || ['—', 'bg-white/5 text-[#666680]']
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#555570] font-semibold">{label}</span>
      <span className="text-sm text-[#D8D8EC] break-all">{value}</span>
    </div>
  )
}

function DetailModal({ req, onClose, onApprove, onReject }) {
  if (!req) return null
  const title     = req.ad_title     || req.adTitle     || ''
  const desc      = req.ad_description || req.adDescription || ''
  const business  = req.business_name  || req.businessName  || ''
  const contact   = req.contact_name   || req.contactName   || ''
  const phone     = req.phone || ''
  const whatsapp  = req.whatsapp || ''
  const city      = req.city || ''
  const bType     = req.business_type  || req.businessType  || ''
  const placement = req.requested_placement || req.requestedPlacement || ''
  const link      = req.website_or_social_link || req.websiteOrSocialLink || ''
  const notes     = req.notes || ''
  const image     = req.image_preview  || req.imagePreview  || ''
  const createdAt = req.created_at     || req.createdAt     || ''

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0E0E17] border border-white/8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#0E0E17] z-10">
          <h2 className="font-bold text-[#E8E8F0] text-base">تفاصيل طلب الإعلان</h2>
          <button onClick={onClose} className="text-[#555570] hover:text-[#8888A8]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#8888A8]">الحالة</span>
            <StatusBadge status={req.status} />
          </div>
          {image && (
            <div>
              <p className="text-xs text-[#555570] font-semibold mb-2">صورة الإعلان</p>
              <img src={image} alt="ad" className="w-full max-h-48 object-cover rounded-xl border border-white/8" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="اسم النشاط"   value={business}  />
            <DetailRow label="اسم المسؤول"   value={contact}   />
            <DetailRow label="الهاتف"         value={phone}     />
            <DetailRow label="واتساب"         value={whatsapp}  />
            <DetailRow label="المدينة"         value={city}      />
            <DetailRow label="نوع النشاط"     value={bType}     />
          </div>
          <DetailRow label="مكان الإعلان المطلوب" value={placement} />
          <DetailRow label="عنوان الإعلان"        value={title}     />
          <DetailRow label="وصف الإعلان"          value={desc}      />
          {link && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#555570] font-semibold">الرابط</span>
              <a href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-400 flex items-center gap-1 hover:underline break-all">
                {link} <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}
          {notes && <DetailRow label="ملاحظات إضافية" value={notes} />}
          <DetailRow label="تاريخ الإرسال" value={createdAt ? new Date(createdAt).toLocaleString('ar-LY') : '—'} />
          {req.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => onApprove(req.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                <CheckCircle className="w-4 h-4" /> قبول
              </button>
              <button onClick={() => onReject(req.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                <XCircle className="w-4 h-4" /> رفض
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const reload = () => {
    setLoading(true)
    api.admin.adRequests.list()
      .then(rows => { setRequests(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.admin.adRequests.update(id, status)
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
      if (status === 'approved') {
        const req = requests.find(r => r.id === id)
        if (req) {
          await api.admin.ads.create({
            id: 'ad_from_' + id,
            title_ar:       req.ad_title || req.adTitle || '',
            description_ar: req.ad_description || req.adDescription || '',
            image_url:      req.image_preview || req.imagePreview || null,
            link_url:       req.website_or_social_link || req.websiteOrSocialLink || '',
            placement:      req.requested_placement || req.requestedPlacement || 'home',
            is_active:      true,
          }).catch(() => {})
        }
      }
      showToast(status === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب')
    } catch { showToast('حدث خطأ', 'error') }
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
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {viewItem && (
        <DetailModal
          req={viewItem}
          onClose={() => setViewItem(null)}
          onApprove={(id) => { updateStatus(id, 'approved'); setViewItem(null) }}
          onReject={(id) => { updateStatus(id, 'rejected'); setViewItem(null) }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#E8E8F0]">طلبات الإعلانات</h1>
          <p className="text-sm text-[#666680] mt-0.5">إدارة طلبات الإعلان من الأنشطة التجارية</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'قيد الانتظار', count: counts.pending,  color: 'amber',   key: 'pending'  },
          { label: 'مقبولة',       count: counts.approved, color: 'emerald', key: 'approved' },
          { label: 'مرفوضة',       count: counts.rejected, color: 'red',     key: 'rejected' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? '' : s.key)}
            className={`bg-[#0E0E17] rounded-2xl border p-3 text-center transition-all ${filter === s.key ? 'border-[#FF7900] shadow-md' : 'border-white/5 hover:border-white/10'}`}
          >
            <p className={`text-2xl font-black ${s.color === 'amber' ? 'text-amber-400' : s.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}>{s.count}</p>
            <p className="text-xs text-[#666680] mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-[#0E0E17] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#E8E8F0] text-sm">
            {filter ? `${STATUS_MAP[filter]?.[0]} (${filtered.length})` : `جميع الطلبات (${requests.length})`}
          </h2>
          {filter && <button onClick={() => setFilter('')} className="text-xs text-[#FF7900] hover:underline">عرض الكل</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/3 border-b border-white/5 text-[#8888A8]">
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">النشاط</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">المسؤول</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">الهاتف</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">المدينة</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">مكان الإعلان</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#444460]">جارٍ التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#444460]">لا توجد طلبات</td></tr>
              ) : (
                filtered.map(r => {
                  const business  = r.business_name  || r.businessName  || '—'
                  const contact   = r.contact_name   || r.contactName   || '—'
                  const phone     = r.phone || '—'
                  const city      = r.city || '—'
                  const bType     = r.business_type  || r.businessType  || ''
                  const placement = r.requested_placement || r.requestedPlacement || '—'
                  const createdAt = r.created_at     || r.createdAt     || ''
                  return (
                    <tr key={r.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#D8D8EC]">{business}</p>
                        <p className="text-xs text-[#555570]">{bType}</p>
                      </td>
                      <td className="px-4 py-3 text-[#C0C0D8]">{contact}</td>
                      <td className="px-4 py-3 text-[#C0C0D8] text-xs" dir="ltr">{phone}</td>
                      <td className="px-4 py-3 text-[#8888A8]">{city}</td>
                      <td className="px-4 py-3 text-[#8888A8] max-w-[140px]"><span className="text-xs">{placement}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-[#666680] text-xs whitespace-nowrap">
                        {createdAt ? new Date(createdAt).toLocaleDateString('ar-LY') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewItem(r)} title="عرض التفاصيل" className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"><Eye className="w-4 h-4" /></button>
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(r.id, 'approved')} title="قبول" className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => updateStatus(r.id, 'rejected')} title="رفض" className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><XCircle className="w-4 h-4" /></button>
                            </>
                          )}
                          <button onClick={() => deleteRequest(r.id)} title="حذف" className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
