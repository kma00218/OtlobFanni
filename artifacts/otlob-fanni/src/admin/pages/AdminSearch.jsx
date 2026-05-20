import { useState, useEffect, useRef } from 'react'
import { Search, Copy, Check, ExternalLink, Phone, MapPin, Calendar, MessageCircle, Trash2, Eye, Pencil } from 'lucide-react'
import api from '../../lib/api'
import { categories as SERVICES_CATS } from '../../data/services'

const STATUS = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-800 border border-amber-300' },
  approved:  { label: 'مقبول',        cls: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
  published: { label: 'منشور',        cls: 'bg-orange-100 text-orange-700 border border-orange-300' },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-100 text-red-700 border border-red-300' },
}

export default function AdminSearch() {
  const [q, setQ]               = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [copied, setCopied]     = useState(null)
  const [actionMenu, setActionMenu] = useState(null)
  const [toast, setToast]           = useState(null)
  const [credsSending, setCredsSending] = useState(null)
  const [rejectModal, setRejectModal] = useState({ open: false, row: null, reason: '' })
  const timerRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3200)
  }

  const catLabel = (specialty) => {
    if (!specialty || specialty === 'more_services') return 'خدمات متعددة'
    const cat = SERVICES_CATS.find(c => c.id === specialty)
    return cat?.nameAr || specialty
  }

  const doSearch = async (query) => {
    if (!query || query.trim().length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const data = await api.admin.searchAccount(query.trim())
      setResults(data)
      setSearched(true)
    } catch { setResults([]); setSearched(true) }
    finally { setLoading(false) }
  }

  const refreshResults = async () => {
    if (q.trim().length >= 2) {
      try {
        const data = await api.admin.searchAccount(q.trim())
        setResults(data)
      } catch {}
    }
  }

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(q), 400)
    return () => clearTimeout(timerRef.current)
  }, [q])

  const copyText = async (text, key) => {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const setStatus = async (r, status, reason = null) => {
    try {
      const opts = reason ? { rejectionReason: reason } : {}
      if (r.accountType === 'technician') {
        await api.admin.technicianApplications.update(r.id, status, opts)
      } else if (r.accountType === 'supplier') {
        await api.admin.supplierApplications.update(r.id, status, opts)
      } else {
        await api.admin.companyApplications.update(r.id, status, opts)
      }
      await refreshResults()
      const labels = { approved: '✓ تم القبول', rejected: 'تم الرفض', pending: 'تمت الإعادة للمراجعة', published: '✓ تم النشر' }
      showToast(labels[status] || 'تم التحديث')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const deleteFn = async (r) => {
    if (!window.confirm(`هل تريد حذف "${r.displayName}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return
    try {
      if (r.accountType === 'technician') {
        await api.admin.technicianApplications.delete(r.id)
      } else if (r.accountType === 'supplier') {
        await api.admin.supplierApplications.delete(r.id)
      } else {
        await api.admin.companyApplications.delete(r.id)
      }
      setResults(prev => prev.filter(x => x.id !== r.id))
      showToast('تم الحذف بنجاح')
    } catch { showToast('حدث خطأ أثناء الحذف', 'error') }
  }

  const toggleSuspend = async (r) => {
    try {
      const techId = `tech_${r.id}`
      const newActive = r.technicianIsActive === false ? true : false
      await api.admin.technicians.update(techId, { is_active: newActive })
      await refreshResults()
      showToast(newActive ? '▶ تم تفعيل الفني' : '⏸ تم توقيف الفني')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const sendCredentials = async (r) => {
    setCredsSending(r.id)
    try {
      const data = await api.pro.generateCredentials(r.accountType, r.id)
      const phone = (data.whatsapp || '').replace(/\D/g, '')
      const platformUrl = 'otlobfanni.ly'
      const msg =
        `تم تفعيل حسابك المهني على منصة اطلب فني 🎉\n\n` +
        `يمكنك الآن الدخول إلى أدوات العمل والفواتير عبر منصة:\n` +
        `🌐 ${platformUrl}\n\n` +
        `من صفحة:\nالمزيد ← دخول الحسابات المهنية\n\n` +
        `اسم المستخدم:\n${data.whatsapp}\n\n` +
        `كلمة المرور:\n${data.password}`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
      showToast('✓ تم إرسال بيانات الدخول')
    } catch {
      showToast('حدث خطأ أثناء إنشاء بيانات الدخول', 'error')
    } finally {
      setCredsSending(null)
    }
  }

  const openWhatsApp = (r) => {
    const phone = r.whatsapp || r.phone
    const name = r.displayName
    const msg = r.status === 'approved'
      ? `مرحباً ${name}، تهانينا! ✅ تم قبول طلبك على منصة اطلب فني.\nرقم طلبك: ${r.requestNumber}\nتابع حالتك هنا: https://otlobfanni.ly/status/${r.requestNumber}`
      : `مرحباً ${name}، نأسف لإبلاغك بأن طلبك على منصة اطلب فني لم يتم قبوله.\nرقم طلبك: ${r.requestNumber}\nللاستفسار تواصل معنا.`
    window.open(`https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const base = window.location.origin + (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

  const editAdminPath = (r) => {
    if (r.accountType === 'technician' && r.status === 'published')
      return `/admin/technicians?edit=tech_${r.id}`
    if (r.accountType === 'company' && (r.status === 'approved' || r.status === 'published'))
      return `/admin/companies?edit=${r.id}`
    if (r.accountType === 'supplier' && (r.status === 'approved' || r.status === 'published'))
      return `/admin/suppliers?edit=${r.id}`
    return null
  }

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Action Menu Modal */}
      {actionMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setActionMenu(null)}>
          <div className="bg-[#0f2236] rounded-2xl w-full max-w-xs shadow-2xl border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">{actionMenu.accountType === 'technician' ? '🔧' : actionMenu.accountType === 'supplier' ? '📦' : '🏢'}</span>
                <div>
                  <p className="text-white font-bold text-base">{actionMenu.displayName}</p>
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">{actionMenu.requestNumber || actionMenu.id.slice(0, 16) + '…'}</p>
                </div>
              </div>
            </div>

            <div className="p-3 flex flex-col gap-2">
              {/* Send credentials */}
              {actionMenu.status === 'published' && (
                <button
                  onClick={async () => { await sendCredentials(actionMenu); setActionMenu(null) }}
                  disabled={credsSending === actionMenu.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm font-bold disabled:opacity-50">
                  <span>📨</span>
                  {credsSending === actionMenu.id ? 'جارٍ الإرسال…' : 'إرسال بيانات الدخول'}
                </button>
              )}
              {/* Edit in admin */}
              {editAdminPath(actionMenu) && (
                <a href={editAdminPath(actionMenu)}
                  onClick={() => setActionMenu(null)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF7900]/10 text-[#FF7900] hover:bg-[#FF7900]/20 transition-colors text-sm font-bold">
                  <Pencil className="w-4 h-4 flex-shrink-0" />
                  تعديل البيانات
                </a>
              )}
              {/* View profile */}
              {actionMenu.requestNumber && (
                <a href={`${base}/status/${actionMenu.requestNumber}`} target="_blank" rel="noopener noreferrer"
                  onClick={() => setActionMenu(null)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors text-sm font-medium">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  عرض الملف في المنصة
                </a>
              )}

              {/* pending → approve or reject */}
              {actionMenu.status === 'pending' && (
                <>
                  <button onClick={() => { setStatus(actionMenu, 'approved'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm font-bold">
                    <span>✓</span> قبول الطلب
                  </button>
                  <button onClick={() => { setActionMenu(null); setRejectModal({ open: true, row: actionMenu, reason: '' }) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm font-bold">
                    <span>✕</span> رفض الطلب
                  </button>
                </>
              )}

              {/* approved → publish or reject */}
              {actionMenu.status === 'approved' && (
                <>
                  <button onClick={() => { setStatus(actionMenu, 'published'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-colors text-sm font-bold">
                    <span>📢</span> نشر على المنصة
                  </button>
                  <button onClick={() => { setActionMenu(null); setRejectModal({ open: true, row: actionMenu, reason: '' }) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm font-bold">
                    <span>✕</span> رفض الطلب
                  </button>
                </>
              )}

              {/* rejected → approve or back to pending */}
              {actionMenu.status === 'rejected' && (
                <>
                  <button onClick={() => { setStatus(actionMenu, 'approved'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm font-bold">
                    <span>✓</span> قبول الطلب
                  </button>
                  <button onClick={() => { setStatus(actionMenu, 'pending'); setActionMenu(null) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm font-bold">
                    <span>↩</span> إعادة للمراجعة
                  </button>
                </>
              )}

              {/* published technician → suspend/activate */}
              {actionMenu.status === 'published' && actionMenu.accountType === 'technician' && (
                <button onClick={() => { toggleSuspend(actionMenu); setActionMenu(null) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-bold ${
                    actionMenu.technicianIsActive === false
                      ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  }`}>
                  <span>{actionMenu.technicianIsActive === false ? '▶' : '⏸'}</span>
                  {actionMenu.technicianIsActive === false ? 'تفعيل الفني' : 'توقيف الفني مؤقتاً'}
                </button>
              )}

              {/* WhatsApp */}
              {(actionMenu.status === 'approved' || actionMenu.status === 'rejected') && actionMenu.requestNumber && (
                <button onClick={() => { openWhatsApp(actionMenu); setActionMenu(null) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors text-sm font-medium">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  إرسال واتساب
                </button>
              )}

              {/* Delete */}
              <button onClick={() => { setActionMenu(null); deleteFn(actionMenu) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/15 transition-colors text-sm font-medium border border-red-500/20">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                حذف الطلب نهائياً
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

      {/* Reject Reason Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setRejectModal(m => ({ ...m, open: false }))}>
          <div className="bg-[#0f2236] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
            <p className="text-white font-bold text-base mb-1 text-right">سبب الرفض</p>
            <p className="text-slate-400 text-xs mb-4 text-right">اختياري — سيظهر للمتقدم في صفحة تتبع طلبه</p>
            <textarea
              dir="rtl" rows={3}
              placeholder="مثال: البيانات غير مكتملة، الصور غير واضحة..."
              className="w-full bg-slate-800 text-white text-sm rounded-xl p-3 border border-slate-600 focus:border-[#FF7900] focus:outline-none resize-none placeholder-slate-500"
              value={rejectModal.reason}
              onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  await setStatus(rejectModal.row, 'rejected', rejectModal.reason || null)
                  setRejectModal({ open: false, row: null, reason: '' })
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                تأكيد الرفض
              </button>
              <button onClick={() => setRejectModal({ open: false, row: null, reason: '' })}
                className="flex-1 border border-slate-600 text-slate-400 hover:bg-slate-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#071B33]">بحث عن فني أو شركة أو مورد</h1>
        <p className="text-sm text-slate-500 mt-1">ابحث بالاسم، الكود (TEC/COM/SUP)، رقم الهاتف، أو واتساب</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="مثال: محمد أو TEC-2026-612916 أو SUP-2026-... أو 0912..."
          className="w-full bg-white border-2 border-slate-200 rounded-2xl pr-12 pl-4 py-3.5 text-base text-[#071B33] placeholder-slate-400 focus:outline-none focus:border-[#FF7900] shadow-sm transition-all font-medium"
          autoFocus
        />
        {loading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">جارٍ البحث…</span>
        )}
      </div>

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-400 font-medium">لا توجد نتائج لـ &quot;{q}&quot;</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.map((r) => {
        const isTech     = r.accountType === 'technician'
        const isSupplier = r.accountType === 'supplier'
        const techLink   = `${base}/join?ref=${r.id}`
        const compLink   = `${base}/join-company?ref=${r.id}`
        const profileUrl = r.requestNumber ? `${base}/status/${r.requestNumber}` : null
        const statusInfo = STATUS[r.status] || STATUS.pending
        const isSuspended = isTech && r.status === 'published' && r.technicianIsActive === false

        return (
          <div key={r.id} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Coloured top bar */}
            <div className={`h-1.5 w-full ${isSuspended ? 'bg-slate-400' : isTech ? 'bg-blue-400' : isSupplier ? 'bg-teal-400' : 'bg-purple-400'}`} />

            <div className="p-5 space-y-4">

              {/* Header row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isTech ? 'bg-blue-50' : isSupplier ? 'bg-teal-50' : 'bg-purple-50'}`}>
                    {isTech ? '🔧' : isSupplier ? '📦' : '🏢'}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#071B33] text-base leading-tight">{r.displayName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 tracking-wide">{r.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${isTech ? 'bg-blue-50 text-blue-700 border-blue-200' : isSupplier ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {isTech ? 'فني' : isSupplier ? 'مورد' : 'شركة'}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                  {isSuspended && (
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-300">
                      ⏸ موقوف
                    </span>
                  )}
                  {/* Actions button */}
                  <button
                    onClick={() => setActionMenu(r)}
                    className="p-2 bg-[#071B33] text-white rounded-xl hover:bg-[#0f2a4a] transition-colors font-bold text-lg leading-none"
                    title="الإجراءات">
                    ⋮
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span className="font-semibold text-[#071B33]" dir="ltr">{r.phone}</span>
                </div>
                {r.whatsapp && r.whatsapp !== r.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="font-semibold text-[#071B33]" dir="ltr">{r.whatsapp}</span>
                  </div>
                )}
                {r.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="font-semibold text-[#071B33]">{r.city}</span>
                  </div>
                )}
                {r.specialty && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛠</span>
                    <span className="font-semibold text-[#071B33]">{catLabel(r.specialty)}</span>
                  </div>
                )}
                {r.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="font-semibold text-[#071B33]">{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {r.requestNumber && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-slate-500 text-sm">رقم الطلب:</span>
                    <span className="font-mono font-bold text-[#071B33] text-sm tracking-wider">{r.requestNumber}</span>
                  </div>
                )}
              </div>

              {/* Referral stats */}
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <span className="text-xl">📊</span>
                <div className="flex gap-6 text-sm">
                  <span>
                    <span className="text-[#071B33] font-extrabold text-base">{r.referralStats?.registered ?? 0}</span>
                    <span className="text-slate-600 font-medium mr-1">تسجيل عبر رابطه</span>
                  </span>
                  <span>
                    <span className="text-[#071B33] font-extrabold text-base">{r.referralStats?.accepted ?? 0}</span>
                    <span className="text-slate-600 font-medium mr-1">مقبول</span>
                  </span>
                </div>
              </div>

              {/* Referral links */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">روابط الترشيح</p>
                {[
                  { label: '🔧 رابط تسجيل فني',   link: techLink, key: `tech-${r.id}`, short: `${window.location.hostname}/join…` },
                  { label: '🏢 رابط تسجيل شركة', link: compLink, key: `comp-${r.id}`, short: `${window.location.hostname}/join-company…` },
                ].map(({ label, link, key, short }) => (
                  <div key={key} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                    <span className="text-sm font-semibold text-[#071B33] flex-1 truncate">
                      {label}
                      <span className="font-mono text-slate-500 font-normal text-xs mr-2" dir="ltr">{short}</span>
                    </span>
                    <button
                      onClick={() => copyText(link, key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0 active:scale-95 ${copied === key ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-[#071B33] text-white hover:bg-[#0f2a4a]'}`}>
                      {copied === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === key ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Edit + Profile links */}
              {(editAdminPath(r) || profileUrl) && (
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {editAdminPath(r) && (
                    <a href={editAdminPath(r)}
                      className="inline-flex items-center gap-2 bg-[#FF7900] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#e06d00] transition-colors shadow-sm">
                      <Pencil className="w-4 h-4" />
                      تعديل البيانات
                    </a>
                  )}
                  {profileUrl && (
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-[#071B33] transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      عرض الملف
                    </a>
                  )}
                </div>
              )}

            </div>
          </div>
        )
      })}
    </div>
  )
}
