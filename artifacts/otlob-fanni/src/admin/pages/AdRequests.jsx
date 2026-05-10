import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, Trash2, X, ExternalLink } from 'lucide-react'

const ls = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} },
}

const STATUS_MAP = {
  pending:  ['قيد الانتظار', 'bg-amber-50 text-amber-600'],
  approved: ['مقبول',        'bg-green-50 text-green-600'],
  rejected: ['مرفوض',        'bg-red-50 text-red-500'],
}

function StatusBadge({ status }) {
  const [label, cls] = STATUS_MAP[status] || ['—', 'bg-gray-100 text-gray-500']
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value}</span>
    </div>
  )
}

function DetailModal({ req, onClose, onApprove, onReject }) {
  if (!req) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-[#071B33] text-base">تفاصيل طلب الإعلان</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">الحالة</span>
            <StatusBadge status={req.status} />
          </div>

          {/* Image */}
          {req.imagePreview && (
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2">صورة الإعلان</p>
              <img src={req.imagePreview} alt="ad" className="w-full max-h-48 object-cover rounded-xl border border-gray-200" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="اسم النشاط" value={req.businessName} />
            <DetailRow label="اسم المسؤول" value={req.contactName} />
            <DetailRow label="الهاتف" value={req.phone} />
            <DetailRow label="واتساب" value={req.whatsapp} />
            <DetailRow label="المدينة" value={req.city} />
            <DetailRow label="نوع النشاط" value={req.businessType} />
          </div>

          <DetailRow label="مكان الإعلان المطلوب" value={req.requestedPlacement} />
          <DetailRow label="عنوان الإعلان" value={req.adTitle} />
          <DetailRow label="وصف الإعلان" value={req.adDescription} />

          {req.websiteOrSocialLink && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-semibold">الرابط</span>
              <a
                href={req.websiteOrSocialLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 flex items-center gap-1 hover:underline break-all"
              >
                {req.websiteOrSocialLink}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {req.notes && <DetailRow label="ملاحظات إضافية" value={req.notes} />}

          <DetailRow label="تاريخ الإرسال" value={req.createdAt ? new Date(req.createdAt).toLocaleString('ar-LY') : '—'} />

          {/* Action buttons */}
          {req.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onApprove(req.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> قبول
              </button>
              <button
                onClick={() => onReject(req.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
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

export default function AdRequests() {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => setRequests(ls.get('adRequests'))

  useEffect(() => { load() }, [])

  const updateStatus = (id, status) => {
    const updated = requests.map(r =>
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
    )
    setRequests(updated)
    ls.set('adRequests', updated)
    if (viewItem?.id === id) setViewItem(prev => ({ ...prev, status, updatedAt: new Date().toISOString() }))
    showToast(status === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب')

    // If approved — also create an ad entry in demo_ads_v1
    if (status === 'approved') {
      const req = requests.find(r => r.id === id)
      if (req) {
        const adList = ls.get('demo_ads_v1')
        const alreadyExists = adList.some(a => a.sourceRequestId === id)
        if (!alreadyExists) {
          adList.unshift({
            id: 'ad_from_' + id,
            titleAr: req.adTitle,
            titleEn: req.adTitle,
            descriptionAr: req.adDescription,
            imageUrl: req.imagePreview || null,
            linkUrl: req.websiteOrSocialLink || '',
            placement: req.requestedPlacement,
            isActive: true,
            sourceRequestId: id,
            createdAt: new Date().toISOString(),
          })
          ls.set('demo_ads_v1', adList)
        }
      }
    }
  }

  const deleteRequest = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    const updated = requests.filter(r => r.id !== id)
    setRequests(updated)
    ls.set('adRequests', updated)
    if (viewItem?.id === id) setViewItem(null)
    showToast('تم حذف الطلب')
  }

  const filtered = filter ? requests.filter(r => r.status === filter) : requests

  const counts = {
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-5" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Detail Modal */}
      {viewItem && (
        <DetailModal
          req={viewItem}
          onClose={() => setViewItem(null)}
          onApprove={(id) => { updateStatus(id, 'approved'); setViewItem(null) }}
          onReject={(id) => { updateStatus(id, 'rejected'); setViewItem(null) }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#071B33]">طلبات الإعلانات</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة طلبات الإعلان من الأنشطة التجارية</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'قيد الانتظار', count: counts.pending,  color: 'amber',  key: 'pending'  },
          { label: 'مقبولة',       count: counts.approved, color: 'green',  key: 'approved' },
          { label: 'مرفوضة',       count: counts.rejected, color: 'red',    key: 'rejected' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? '' : s.key)}
            className={`bg-white rounded-2xl border p-3 text-center transition-all ${filter === s.key ? 'border-[#FF7900] shadow-md' : 'border-gray-100'}`}
          >
            <p className={`text-2xl font-black ${
              s.color === 'amber' ? 'text-amber-500' :
              s.color === 'green' ? 'text-green-500' : 'text-red-500'
            }`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#071B33] text-sm">
            {filter ? `${STATUS_MAP[filter]?.[0]} (${filtered.length})` : `جميع الطلبات (${requests.length})`}
          </h2>
          {filter && (
            <button onClick={() => setFilter('')} className="text-xs text-[#FF7900] hover:underline">
              عرض الكل
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-gray-100 text-gray-600">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">لا توجد طلبات</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-[#F7F8FA]/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.businessName}</p>
                      <p className="text-xs text-gray-400">{r.businessType}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.contactName}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs" dir="ltr">{r.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{r.city}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px]">
                      <span className="text-xs">{r.requestedPlacement}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-LY') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewItem(r)}
                          title="عرض التفاصيل"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(r.id, 'approved')}
                              title="قبول"
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(r.id, 'rejected')}
                              title="رفض"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteRequest(r.id)}
                          title="حذف"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
