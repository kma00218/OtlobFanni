import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import {
  Eye, Trash2, Phone, FileText, Facebook, Instagram, MapPin,
  MessageCircle, Building2, CheckCircle, Package, X,
} from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'
import { SUPPLY_TYPES, supplyTypeLabel } from '../../data/suppliers'

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function InfoRow({ icon: Icon, label, value, isCustom }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-medium ${isCustom ? 'text-amber-300' : 'text-slate-200'}`}>{value}</p>
        {isCustom && <p className="text-xs text-amber-500/70">نوع مخصص (يحتاج مراجعة)</p>}
      </div>
    </div>
  )
}

const STATUS = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-400/25 text-amber-300 border border-amber-400/40'   },
  approved:  { label: 'مقبول',        cls: 'bg-emerald-400/25 text-emerald-300 border border-emerald-400/40' },
  published: { label: 'منشور',        cls: 'bg-orange-400/25 text-orange-300 border border-orange-400/40' },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-400/25 text-red-300 border border-red-400/40'        },
}

export default function SupplierApplications() {
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [viewItem, setViewItem]   = useState(null)
  const [lightbox, setLightbox]   = useState(null)
  const [toast, setToast]         = useState(null)
  const [lastPublished, setLastPublished] = useState(null)
  const [specialtyAction, setSpecialtyAction] = useState('none')
  const [linkTypeId, setLinkTypeId]           = useState('')
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '', isView: false })
  const [tab, setTab]             = useState('all')
  const [actionMenu, setActionMenu] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const getSupplyLabel = (row) => {
    if (row.supplyType === 'other' && row.customSupplyType) return row.customSupplyType
    return supplyTypeLabel(row.supplyType || row.supply_type)
  }

  const reload = () => {
    setLoading(true)
    api.admin.supplierApplications.list()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    setSpecialtyAction('none')
    setLinkTypeId('')
  }, [viewItem?.id])

  const setStatus = async (id, status, rejectionReason = null) => {
    try {
      const opts = {}
      if (status === 'rejected' && rejectionReason) opts.rejectionReason = rejectionReason
      if (status === 'approved') {
        const app = data.find(r => r.id === id)
        if (app?.customSupplyType && specialtyAction === 'link' && linkTypeId) {
          opts.supply_type = linkTypeId
          opts.custom_supply_type = null
        }
      }
      await api.admin.supplierApplications.update(id, status, opts)
      setData(prev => prev.map(r => r.id === id ? { ...r, status, ...(opts.supply_type ? { supplyType: opts.supply_type, customSupplyType: null } : {}) } : r))
      if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
      if (status === 'approved') {
        showToast('✓ تم القبول — اضغط "نشر" الآن لإرسال رسالة الترحيب على واتساب')
      } else {
        showToast('تم رفض الطلب')
      }
    } catch { showToast('حدث خطأ', 'error') }
  }

  const handlePublish = async (id) => {
    try {
      const app = data.find(r => r.id === id)
      await api.admin.supplierApplications.update(id, 'published')
      setData(prev => prev.map(r => r.id === id ? { ...r, status: 'published' } : r))
      if (viewItem?.id === id) setViewItem(v => ({ ...v, status: 'published' }))
      if (app?.whatsapp || app?.phone) {
        setLastPublished({ name: app.businessName || app.business_name || '', phone: app.whatsapp || app.phone, requestNumber: app.requestNumber })
      }
      showToast('✓ تم نشر المورّد على المنصة')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const openWhatsApp = (phone, name, status, requestNumber) => {
    const msg = status === 'approved'
      ? `مرحباً ${name}، تهانينا! ✅ تم قبول طلب انضمامكم إلى دليل مزودي المستلزمات على منصة اطلب فني.\nرقم طلبك: ${requestNumber}`
      : `مرحباً ${name}، نأسف لإبلاغك بأن طلبك على منصة اطلب فني لم يتم قبوله.\nرقم طلبك: ${requestNumber}`
    window.open(`https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const openPublishedWhatsApp = ({ name, phone, requestNumber }) => {
    const msg = `مبروك ${name}! 🎉 تم نشر نشاطك الآن على دليل مزودي المستلزمات في منصة اطلب فني 🇱🇾\n\nيمكنك مشاركة نشاطك مع عملائك:\n👉 https://otlobfanni.ly/suppliers`
    window.open(`https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await api.admin.supplierApplications.delete(id)
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم حذف الطلب')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const filtered = data.filter(r => {
    const name = r.businessName || r.business_name || ''
    const contact = r.contactName || r.contact_name || ''
    const s = !search || name.includes(search) || contact.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const t = tab === 'all' || r.status === tab
    return s && t
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'businessName', label: 'المورّد / النشاط',
      render: (v, row) => {
        const logo = getFileUrl(row.logo)
        const contact = row.contactName || row.contact_name
        const supplyLabel = getSupplyLabel(row)
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-[#0e5c6d] to-[#072a36] flex items-center justify-center rounded-xl">
                    <span className="text-white text-lg">📦</span>
                  </div>
              }
            </div>
            <div>
              <p className="font-medium text-[#071B33] text-sm">{v || row.business_name || '—'}</p>
              <p className="text-xs text-slate-500">{contact || '—'}</p>
              <p className="text-xs text-teal-400 mt-0.5">{supplyLabel}</p>
            </div>
          </div>
        )
      },
    },
    { key: 'phone', label: 'الهاتف', render: (v) => <span className="text-xs text-slate-400" dir="ltr">{v || '—'}</span> },
    { key: 'city',  label: 'المدينة' },
    {
      key: 'supplyType', label: 'نوع المستلزمات',
      render: (v, row) => {
        const lbl = getSupplyLabel(row)
        const isCustom = (v === 'other' || !v) && row.customSupplyType
        return (
          <div>
            {isCustom && <p className="text-xs text-amber-400 font-medium">مخصص</p>}
            <p className="text-sm text-slate-300">{lbl || '—'}</p>
          </div>
        )
      },
    },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS[v] || STATUS.pending
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      },
    },
    { key: 'createdAt', label: 'تاريخ التقديم', render: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '—' },
    { key: 'requestNumber', label: 'رقم الطلب', render: (v) => <span className="text-xs font-mono text-slate-400">{v || '—'}</span> },
    {
      key: '__actions', label: '',
      render: (_, row) => (
        <button
          onClick={e => { e.stopPropagation(); setActionMenu(row) }}
          className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 text-base font-bold transition-colors">
          ⋮
        </button>
      ),
    },
  ]

  return (
    <div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Action Menu Modal ─────────────────────────────────── */}
      {actionMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setActionMenu(null)}>
          <div className="bg-[#0f2236] rounded-2xl w-full max-w-xs shadow-2xl border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 border-b border-slate-700">
              <p className="text-white font-bold text-base text-right">{actionMenu.businessName || actionMenu.business_name || ''}</p>
              <p className="text-slate-400 text-xs text-right mt-0.5">{actionMenu.requestNumber}</p>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <button onClick={() => { setViewItem(actionMenu); setActionMenu(null) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors text-sm font-medium text-right">
                <Eye className="w-4 h-4 flex-shrink-0" />
                عرض التفاصيل
              </button>

              {actionMenu.status === 'pending' && (
                <>
                  <button onClick={() => { setStatus(actionMenu.id, 'approved'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm font-bold text-right">
                    <span className="text-base">✓</span>
                    قبول الطلب
                  </button>
                  <button onClick={() => { setRejectModal({ open: true, id: actionMenu.id, reason: '', isView: false }); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm font-bold text-right">
                    <span className="text-base">✕</span>
                    رفض الطلب
                  </button>
                </>
              )}

              {actionMenu.status === 'approved' && (
                <>
                  <button onClick={() => { handlePublish(actionMenu.id); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-colors text-sm font-bold text-right">
                    <span className="text-base">📦</span>
                    نشر على المنصة
                  </button>
                  <button onClick={() => { setRejectModal({ open: true, id: actionMenu.id, reason: '', isView: false }); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm font-bold text-right">
                    <span className="text-base">✕</span>
                    رفض الطلب
                  </button>
                </>
              )}

              {actionMenu.status === 'rejected' && (
                <>
                  <button onClick={() => { setStatus(actionMenu.id, 'approved'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm font-bold text-right">
                    <span className="text-base">✓</span>
                    قبول الطلب
                  </button>
                  <button onClick={() => { setStatus(actionMenu.id, 'pending'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-bold text-right">
                    <span className="text-base">↩</span>
                    إعادة للمراجعة
                  </button>
                </>
              )}

              {(actionMenu.status === 'approved' || actionMenu.status === 'rejected') && actionMenu.requestNumber && (
                <button onClick={() => { openWhatsApp(actionMenu.whatsapp || actionMenu.phone, actionMenu.businessName || actionMenu.business_name || '', actionMenu.status, actionMenu.requestNumber); setActionMenu(null) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors text-sm font-medium text-right">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  إرسال واتساب
                </button>
              )}

              <button onClick={() => { handleDelete(actionMenu.id); setActionMenu(null) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/15 transition-colors text-sm font-medium text-right border border-red-500/20">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                حذف الطلب
              </button>
            </div>
            <div className="px-3 pb-3">
              <button onClick={() => setActionMenu(null)}
                className="w-full py-3 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-700 text-sm transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last published WhatsApp banner */}
      {lastPublished && (
        <div className="mb-4 bg-gradient-to-l from-green-600 to-green-500 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="text-2xl flex-shrink-0">🎉</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">تم نشر {lastPublished.name}</p>
            <p className="text-green-100 text-xs mt-0.5">أرسل رسالة واتساب الترحيب</p>
          </div>
          <button onClick={() => { openPublishedWhatsApp(lastPublished); setLastPublished(null) }}
            className="flex items-center gap-1.5 bg-white text-green-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-green-50 transition-colors flex-shrink-0">
            <WaIcon /> أرسل
          </button>
          <button onClick={() => setLastPublished(null)} className="text-green-200 hover:text-white transition-colors flex-shrink-0 text-lg leading-none">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'all',       label: `الكل (${data.length})` },
          { id: 'pending',   label: `قيد المراجعة (${data.filter(r => r.status === 'pending').length})` },
          { id: 'approved',  label: `مقبول (${data.filter(r => r.status === 'approved').length})` },
          { id: 'published', label: `منشور (${data.filter(r => r.status === 'published').length})` },
          { id: 'rejected',  label: `مرفوض (${data.filter(r => r.status === 'rejected').length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${tab === t.id ? 'bg-[#0e5c6d] text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <DataTable
        title="طلبات مزودي المستلزمات"
        badge={pendingCount > 0 ? pendingCount : null}
        columns={columns}
        data={filtered}
        loading={loading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="اسم النشاط، المدينة، الهاتف..."
        onRowClick={row => setViewItem(row)}
        rowClassName="cursor-pointer hover:bg-slate-700/50"
      />

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-white text-lg mb-3">سبب الرفض</h3>
            <textarea
              className="w-full rounded-xl bg-slate-700 border border-slate-600 text-white text-sm p-3 focus:outline-none focus:border-[#FF7900] resize-none"
              rows={3}
              value={rejectModal.reason}
              onChange={e => setRejectModal(r => ({ ...r, reason: e.target.value }))}
              placeholder="اكتب سبب الرفض للمتقدم..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(r => ({ ...r, open: false }))}
                className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-700 transition-colors">
                إلغاء
              </button>
              <button onClick={async () => {
                await setStatus(rejectModal.id, 'rejected', rejectModal.reason)
                setRejectModal({ open: false, id: null, reason: '', isView: false })
              }}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewItem && (
        <FormModal title={viewItem.businessName || viewItem.business_name || 'طلب مورّد'} onClose={() => setViewItem(null)} size="lg">
          <div className="space-y-5 text-sm">

            {/* Status badge */}
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${(STATUS[viewItem.status] || STATUS.pending).cls}`}>
                {(STATUS[viewItem.status] || STATUS.pending).label}
              </span>
              {viewItem.requestNumber && (
                <span className="text-xs font-mono text-slate-400">{viewItem.requestNumber}</span>
              )}
            </div>

            {/* Business info */}
            <div className="bg-slate-800/60 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">معلومات النشاط</p>
              <InfoRow icon={Building2} label="اسم النشاط"  value={viewItem.businessName || viewItem.business_name} />
              <InfoRow icon={FileText}  label="المسؤول"     value={viewItem.contactName  || viewItem.contact_name} />
              <InfoRow icon={MapPin}    label="المدينة"     value={viewItem.city} />
              <InfoRow icon={Package}   label="نوع المستلزمات" value={getSupplyLabel(viewItem)} isCustom={(viewItem.supplyType === 'other' || !viewItem.supplyType) && viewItem.customSupplyType} />
              {viewItem.description && (
                <InfoRow icon={FileText} label="الوصف" value={viewItem.description} />
              )}
            </div>

            {/* Contact */}
            <div className="bg-slate-800/60 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">بيانات التواصل</p>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-white font-mono" dir="ltr">{viewItem.phone}</span>
                <button onClick={() => openWhatsApp(viewItem.whatsapp || viewItem.phone, viewItem.businessName || viewItem.business_name, viewItem.status, viewItem.requestNumber)}
                  className="flex items-center gap-1 bg-[#25D366]/20 text-[#25D366] text-xs font-bold px-2 py-0.5 rounded-lg mr-auto">
                  <WaIcon /> واتساب
                </button>
              </div>
              {viewItem.whatsapp && viewItem.whatsapp !== viewItem.phone && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-white font-mono text-sm" dir="ltr">{viewItem.whatsapp}</span>
                </div>
              )}
              {viewItem.facebook && (
                <div className="flex items-center gap-3">
                  <Facebook className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={viewItem.facebook} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs break-all">{viewItem.facebook}</a>
                </div>
              )}
              {viewItem.instagram && (
                <div className="flex items-center gap-3">
                  <Instagram className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={viewItem.instagram} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline text-xs break-all">{viewItem.instagram}</a>
                </div>
              )}
            </div>

            {/* Custom supply type action */}
            {viewItem.customSupplyType && viewItem.status === 'pending' && (
              <div className="bg-amber-900/30 border border-amber-600/40 rounded-2xl p-4">
                <p className="text-amber-300 font-bold text-xs mb-2">⚠️ نوع مستلزمات مخصص: "{viewItem.customSupplyType}"</p>
                <p className="text-slate-400 text-xs mb-3">اختر كيف تريد معالجة هذا النوع عند القبول:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="accent-[#FF7900]" checked={specialtyAction === 'none'} onChange={() => setSpecialtyAction('none')} />
                    <span className="text-slate-300 text-sm">قبوله كما هو (سيظهر في الدليل بالنوع المخصص)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="accent-[#FF7900]" checked={specialtyAction === 'link'} onChange={() => setSpecialtyAction('link')} />
                    <span className="text-slate-300 text-sm">ربطه بتصنيف موجود</span>
                  </label>
                  {specialtyAction === 'link' && (
                    <select className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-[#FF7900]"
                      value={linkTypeId} onChange={e => setLinkTypeId(e.target.value)}>
                      <option value="">اختر التصنيف...</option>
                      {SUPPLY_TYPES.filter(t => t.id !== 'other').map(t => (
                        <option key={t.id} value={t.id}>{t.emoji} {t.nameAr}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Logo */}
            {viewItem.logo && (
              <div className="bg-slate-800/60 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-3">شعار النشاط</p>
                <img src={getFileUrl(viewItem.logo)} alt="logo"
                  className="w-20 h-20 rounded-xl object-cover border border-slate-600 cursor-pointer"
                  onClick={() => setLightbox(getFileUrl(viewItem.logo))} />
              </div>
            )}

            {/* Shop images */}
            {viewItem.shopImages && viewItem.shopImages.length > 0 && (
              <div className="bg-slate-800/60 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-3">صور المحل ({viewItem.shopImages.length})</p>
                <div className="flex flex-wrap gap-2">
                  {viewItem.shopImages.map((img, idx) => (
                    <img key={idx} src={getFileUrl(img)} alt={`shop-${idx}`}
                      className="w-24 h-24 rounded-xl object-cover border border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setLightbox(getFileUrl(img))} />
                  ))}
                </div>
              </div>
            )}

            {/* Referral */}
            {viewItem.referredBy && (
              <div className="bg-slate-800/60 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">جهة الإحالة</p>
                <p className="text-slate-200 text-sm">{viewItem.referredBy}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {viewItem.status === 'pending' && (
                <>
                  <button onClick={() => setStatus(viewItem.id, 'approved')}
                    className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors">
                    ✓ قبول
                  </button>
                  <button onClick={() => setRejectModal({ open: true, id: viewItem.id, reason: '', isView: true })}
                    className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors">
                    ✕ رفض
                  </button>
                </>
              )}
              {viewItem.status === 'approved' && (
                <button onClick={() => handlePublish(viewItem.id)}
                  className="flex-1 min-w-[120px] font-bold py-2.5 px-4 rounded-xl text-white transition-colors"
                  style={{ background: 'linear-gradient(135deg, #0e5c6d, #072a36)' }}>
                  📦 نشر على المنصة
                </button>
              )}
              {viewItem.status === 'published' && (
                <button onClick={() => openPublishedWhatsApp({ name: viewItem.businessName || '', phone: viewItem.whatsapp || viewItem.phone, requestNumber: viewItem.requestNumber })}
                  className="flex-1 min-w-[120px] bg-[#25D366] hover:bg-[#1db954] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <WaIcon /> رسالة الترحيب
                </button>
              )}
              <button onClick={() => handleDelete(viewItem.id)}
                className="bg-red-900/40 hover:bg-red-900/70 text-red-400 font-bold py-2.5 px-4 rounded-xl transition-colors border border-red-800/40">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </FormModal>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  )
}
