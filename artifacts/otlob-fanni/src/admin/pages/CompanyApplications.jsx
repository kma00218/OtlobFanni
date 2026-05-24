import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, FileText, Image, Lock, Facebook, Instagram, Info, Building2, Shield, MessageCircle, MapPin, DollarSign, Zap, CheckCircle } from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'
import { sections as SECTIONS, categories as SERVICES_CATS } from '../../data/services'

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const STATUS = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-400/25 text-amber-300 border border-amber-400/40'   },
  approved:  { label: 'مقبول',        cls: 'bg-emerald-400/25 text-emerald-300 border border-emerald-400/40' },
  published: { label: 'منشور',        cls: 'bg-orange-400/25 text-orange-300 border border-orange-400/40' },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-400/25 text-red-300 border border-red-400/40'        },
}

const DAY_AR = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
}

export default function CompanyApplications() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [viewItem, setViewItem]               = useState(null)
  const [waDup, setWaDup]                     = useState(null)
  const [lightbox, setLightbox]               = useState(null)
  const [toast, setToast]                     = useState(null)
  const [lastPublished, setLastPublished]     = useState(null)
  const [specialtyAction, setSpecialtyAction] = useState('none')
  const [linkCatId, setLinkCatId]             = useState('')
  const [createSectionId, setCreateSectionId] = useState('')
  const [allCats, setAllCats]                 = useState([])
  const [categories, setCategories]           = useState([])
  const [rejectModal, setRejectModal]         = useState({ open: false, id: null, reason: '', isView: false })
  const [tab, setTab]                         = useState('all')
  const [actionMenu, setActionMenu]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const catLabel = (id) => {
    if (!id) return '—'
    if (id === 'more_services') return 'تخصص آخر (مخصص)'
    const cat = SERVICES_CATS.find(c => c.id === id)
    if (cat) return cat.nameAr
    const dbCat = categories.find(c => c.id === id)
    return dbCat ? (dbCat.nameAr || dbCat.name_ar) : id
  }

  const sectionLabel = (categoryId) => {
    if (!categoryId || categoryId === 'more_services') return ''
    const cat = SERVICES_CATS.find(c => c.id === categoryId)
    const sec = SECTIONS.find(s => s.id === cat?.sectionId)
    return sec ? sec.nameAr : ''
  }

  const reload = () => {
    setLoading(true)
    api.admin.companyApplications.list()
      .then(rows => { setData(rows.filter(r => r.status !== 'published')); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    reload()
    api.categories().then(cats => { setCategories(cats); setAllCats(cats) }).catch(() => {})
  }, [])

  useEffect(() => {
    setSpecialtyAction('none')
    setLinkCatId('')
  }, [viewItem?.id])

  useEffect(() => {
    if (!viewItem?.whatsapp) { setWaDup(null); return }
    setWaDup(null)
    api.checkWhatsapp(viewItem.whatsapp, { excludeId: viewItem.id, excludeType: 'company_app' })
      .then(({ available }) => setWaDup(!available))
      .catch(() => setWaDup(null))
  }, [viewItem?.id])

  const setStatus = async (id, status, rejectionReason = null) => {
    try {
      const opts = {}
      if (status === 'approved') {
        const app = data.find(r => r.id === id)
        if (app?.customSpecialty) {
          if (specialtyAction === 'create') {
            opts.createCategory = true
            if (createSectionId) opts.createInSectionId = createSectionId
          }
          if (specialtyAction === 'link' && linkCatId) opts.linkCategoryId = linkCatId
        }
      }
      if (status === 'rejected' && rejectionReason) opts.rejectionReason = rejectionReason
      await api.admin.companyApplications.update(id, status, opts)
      setData(prev => prev.map(r => r.id === id ? { ...r, status } : r))
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
      await api.admin.companyApplications.publish(id)
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      if (app?.phone && app?.requestNumber) {
        setLastPublished({ name: app.companyName || app.company_name || '', phone: app.whatsapp || app.phone, requestNumber: app.requestNumber })
      }
      showToast('✓ تم نشر الشركة على المنصة')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const createSuggestionCategory = async (s) => {
    try {
      const id = 'custom_' + Date.now()
      const sectionId = s.sectionId === 'new_department' ? 'more_services' : s.sectionId
      await api.admin.categories.create({ id, name_ar: s.name, name_en: s.name, section_id: sectionId, icon_name: 'more', sort_order: 99 })
      showToast(`✓ تمت إضافة "${s.name}" كتخصص جديد`)
    } catch { showToast('حدث خطأ أثناء الإضافة', 'error') }
  }

  const openWhatsApp = (phone, name, status, requestNumber) => {
    const msg = status === 'approved'
      ? `مرحباً ${name}، تهانينا! ✅ تم قبول طلب شركتك على منصة اطلب فني.\nرقم طلبك: ${requestNumber}\nتابع حالتك هنا: https://otlobfanni.ly/status/${requestNumber}`
      : `مرحباً ${name}، نأسف لإبلاغك بأن طلب شركتك على منصة اطلب فني لم يتم قبوله.\nرقم طلبك: ${requestNumber}\nللاستفسار تواصل معنا.`
    window.open(`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const openPublishedWhatsApp = ({ name, phone, requestNumber }) => {
    const msg = `مبروك ${name}! 🎉 تم نشر شركتك الآن على منصة اطلب فني 🇱🇾\n\nيمكنك الآن مشاركة نشاطكم مع عملائكم عبر هذا الرابط:\n👉 https://otlobfanni.ly/status/${requestNumber}\n\n📢 تابع القناة الرسمية لمنصة اطلب فني على تيليجرام لمشاهدة:\n\n• الفنيين الجدد\n• التحديثات\n• الخدمات الجديدة\n• نصائح وتحسينات المنصة\n\n👉 https://t.me/OtlobFanni`
    window.open(`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await api.admin.companyApplications.delete(id)
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم حذف الطلب')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const referredCount = data.filter(r => !!r.referredByName).length

  const filtered = data.filter(r => {
    const name = r.companyName || r.company_name || ''
    const contact = r.contactName || r.contact_name || ''
    const s = !search || name.includes(search) || contact.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const f = !filter || r.status === filter
    const t = tab === 'all' || (tab === 'referred' && !!r.referredByName)
    return s && f && t
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'companyName', label: 'الشركة / المؤسسة',
      render: (v, row) => {
        const logo = getFileUrl(row.companyLogo || row.company_logo)
        const contact = row.contactName || row.contact_name
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center rounded-xl">
                    <span className="text-white text-[10px] font-bold text-center px-0.5 leading-tight">{(v || '').trim().split(' ')[0]}</span>
                  </div>
              }
            </div>
            <div>
              <p className="font-medium text-[#071B33] text-sm">{v}</p>
              <p className="text-xs text-slate-500">{contact || '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone', label: 'الهاتف',
      render: (v) => <span className="text-xs text-slate-400" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة' },
    {
      key: 'specialty', label: 'القسم / التخصص',
      render: (v, row) => {
        const extras = row.extraSpecialties || row.extra_specialties || []
        if (row.customSpecialty) return (
          <div>
            <p className="text-xs text-[#FF7900]/70 font-medium">{sectionLabel(v) || 'تخصص مخصص'}</p>
            <p className="text-sm text-amber-400 font-medium">{row.customSpecialty}</p>
            {extras.length > 0 && extras.map(id => <p key={id} className="text-xs text-slate-400 mt-0.5">{catLabel(id)}</p>)}
          </div>
        )
        return (
          <div>
            {sectionLabel(v) && <p className="text-xs text-[#FF7900]/70 font-medium">{sectionLabel(v)}</p>}
            <p className="text-sm text-slate-600">{catLabel(v)}</p>
            {extras.map(id => <p key={id} className="text-xs text-slate-400 mt-0.5">+ {catLabel(id)}</p>)}
          </div>
        )
      },
    },
    {
      key: 'yearsActive', label: 'سنوات النشاط',
      render: (v) => EXP_LABEL[v] || v || '—',
    },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS[v] || STATUS.pending
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      },
    },
    {
      key: 'createdAt', label: 'تاريخ التقديم',
      render: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '—',
    },
    {
      key: 'requestNumber', label: 'رقم الطلب',
      render: (v, row) => (
        <div className="flex flex-col gap-0.5">
          {v ? <span className="text-xs font-mono text-slate-400 tracking-wider">{v}</span> : <span className="text-xs text-slate-600">—</span>}
          {row?.referredByName && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              <span className="text-[10px] bg-orange-100 text-[#FF7900] border border-orange-200 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                🔗 جاء عبر ترشيح
              </span>
              <span className="text-[10px] text-slate-400 px-0.5">👤 {row.referredByName}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <button
          onClick={() => setActionMenu(row)}
          className="p-2 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors font-bold text-lg leading-none"
          title="الإجراءات">
          ⋮
        </button>
      ),
    },
  ]

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
              <p className="text-white font-bold text-base text-right">{actionMenu.companyName || actionMenu.company_name || ''}</p>
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
                    <span className="text-base">📢</span>
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
                <button onClick={() => { openWhatsApp(actionMenu.whatsapp || actionMenu.phone, actionMenu.companyName || actionMenu.company_name || '', actionMenu.status, actionMenu.requestNumber); setActionMenu(null) }}
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

      {/* Published WhatsApp nudge */}
      {lastPublished && (
        <div className="bg-gradient-to-l from-green-600 to-green-500 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="text-2xl flex-shrink-0">🎉</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">تم نشر شركة {lastPublished.name}</p>
            <p className="text-green-100 text-xs mt-0.5">أرسل لهم واتساب ليشاركوا نشاطهم مع عملائهم</p>
          </div>
          <button
            onClick={() => openPublishedWhatsApp(lastPublished)}
            className="flex items-center gap-1.5 bg-white text-green-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-green-50 transition-colors flex-shrink-0">
            <WaIcon />
            أرسل
          </button>
          <button onClick={() => setLastPublished(null)} className="text-green-200 hover:text-white transition-colors flex-shrink-0 text-lg leading-none">×</button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>طلبات <strong>انضم كشركة</strong> — الخطوات: <strong>١. قبول</strong> (تظهر الشركة في الدليل) ← <strong>٢. نشر</strong> (يُرسل رسالة واتساب تسويقية مع الرابط).</span>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>يوجد <strong>{pendingCount}</strong> {pendingCount === 1 ? 'طلب' : 'طلبات'} قيد المراجعة.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'all' ? 'bg-[#FF7900] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
          الكل
        </button>
        <button onClick={() => setTab('referred')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'referred' ? 'bg-[#FF7900] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
          🔗 المرشَّحون
          {referredCount > 0 && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'referred' ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#FF7900]'}`}>
              {referredCount}
            </span>
          )}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالاسم أو الهاتف أو المدينة..."
        actions={
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white/5">
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبول — بانتظار النشر</option>
            <option value="rejected">مرفوض</option>
          </select>
        }
        emptyMessage="لا توجد طلبات تسجيل شركات بعد"
      />

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="ملف الشركة"
        submitLabel={viewItem?.status === 'pending' ? 'قبول الطلب ✓' : 'إغلاق'}
        onSubmit={viewItem?.status === 'pending'
          ? (e) => { e.preventDefault(); setStatus(viewItem.id, 'approved') }
          : (e) => { e.preventDefault(); setViewItem(null) }
        }
        size="lg"
      >
        {viewItem && (() => {
          const compName    = viewItem.companyName  || viewItem.company_name  || ''
          const contactName = viewItem.contactName  || viewItem.contact_name  || ''
          const logo        = getFileUrl(viewItem.companyLogo  || viewItem.company_logo  || null)
          const workImgs    = (viewItem.workImages || viewItem.work_images || []).map(getFileUrl)
          const availNow    = viewItem.availableNow ?? viewItem.available_now ?? false
          const hoursFrom   = viewItem.hoursFrom    || viewItem.hours_from    || ''
          const hoursTo     = viewItem.hoursTo      || viewItem.hours_to      || ''
          const workDays    = viewItem.workingDays  || viewItem.working_days  || []
          const priceFrom   = viewItem.priceFrom    || viewItem.price_from    || ''
          const priceTo     = viewItem.priceTo      || viewItem.price_to      || ''
          const svcRadius   = viewItem.serviceRadius|| viewItem.service_radius|| ''
          const commReg     = viewItem.commercialReg|| viewItem.commercial_reg|| ''
          const commDoc     = getFileUrl(viewItem.commercialDoc|| viewItem.commercial_doc|| null)
          const workLic     = getFileUrl(viewItem.workLicense  || viewItem.work_license  || null)
          const yearsActive = viewItem.yearsActive  || viewItem.years_active  || ''
          const createdAt   = viewItem.createdAt    || viewItem.created_at    || ''
          const firstWord   = compName ? (compName.trim().split(' ')[0] || '?') : '?'
          const phone       = viewItem.phone || ''
          const whatsapp    = viewItem.whatsapp || phone

          return (
            <div className="space-y-4">

              {/* ── بطاقة الشركة الرئيسية ── */}
              <div className="rounded-2xl border border-blue-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#0e3460] to-[#1a56db] px-4 pt-4 pb-6">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${STATUS[viewItem.status]?.cls}`}>
                      {STATUS[viewItem.status]?.label}
                    </span>
                    <span className="text-blue-200 text-xs">{createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : ''}</span>
                  </div>
                </div>
                <div className="bg-[#EBF5FF] px-4 pt-0 pb-4 -mt-5">
                  <div className="flex items-end gap-3 mb-3">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow flex-shrink-0 bg-[#0e3460] flex items-center justify-center cursor-zoom-in"
                         onClick={() => logo && setLightbox(logo)}>
                      {logo
                        ? <img src={logo} alt={compName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
                            <span className="text-white text-base font-bold text-center px-1 leading-tight">{firstWord}</span>
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0 mt-10">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{compName}</h3>
                      </div>
                      <p className="text-sm text-[#FF7900] font-medium mt-0.5">{catLabel(viewItem.specialty)}</p>
                      {(() => {
                        const extras = viewItem.extraSpecialties || viewItem.extra_specialties || []
                        if (extras.length === 0) return null
                        return (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {extras.map(id => (
                              <span key={id} className="bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/20 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                {catLabel(id) || id}
                              </span>
                            ))}
                          </div>
                        )
                      })()}
                      {contactName && <p className="text-xs text-gray-500 mt-0.5">جهة التواصل: {contactName}</p>}
                      {(() => {
                        const sugg = viewItem.suggestedSpecialties || viewItem.suggested_specialties || []
                        if (!sugg.length) return null
                        return (
                          <div className="mt-2.5 bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-1.5">
                            <p className="text-xs text-yellow-600 font-bold">💡 تخصصات مقترحة ({sugg.length})</p>
                            {sugg.map((s, i) => {
                              const isNewDept = s.sectionId === 'new_department'
                              const secLabel = isNewDept ? 'قسم جديد مقترح' : (SECTIONS.find(x => x.id === s.sectionId)?.nameAr || s.sectionId)
                              return (
                                <div key={i} className="bg-yellow-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                                  <div>
                                    <p className={`text-[10px] mb-0.5 ${isNewDept ? 'text-amber-600 font-bold' : 'text-yellow-600'}`}>{secLabel}</p>
                                    <p className="text-sm text-yellow-800 font-semibold">"{s.name}"</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => createSuggestionCategory(s)}
                                    className="flex-shrink-0 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/40 text-amber-700 px-2 py-1 rounded-lg transition-colors"
                                  >
                                    + إنشاء
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* City + area */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      {viewItem.city}{viewItem.area ? ` · ${viewItem.area}` : ''}
                      {svcRadius ? ` · نطاق ${svcRadius} كم` : ''}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {availNow && (
                      <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ● متاح الآن
                      </span>
                    )}
                    {viewItem.emergency && (
                      <span className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" /> طوارئ 24/7
                      </span>
                    )}
                    {yearsActive && (
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {EXP_LABEL[yearsActive] || yearsActive}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── أزرار التواصل ── */}
              {waDup === true && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <span className="text-red-600 text-[12px] font-bold">⚠️ رقم الواتساب مكرر — مسجّل في طلب آخر على المنصة</span>
                </div>
              )}
              <div className="flex gap-2">
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <WaIcon /> واتساب
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`}
                    className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Phone className="w-4 h-4" /> اتصال
                  </a>
                )}
              </div>

              {/* ── وصف الشركة ── */}
              {viewItem.description && (
                <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">عن الشركة</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
                </div>
              )}

              {/* ── السعر ── */}
              {priceFrom && (
                <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> نطاق السعر
                  </p>
                  <div className="flex items-center justify-between bg-[#FF7900]/5 rounded-xl p-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">يبدأ من</p>
                      <p className="text-xl font-black text-[#FF7900]">{priceFrom}</p>
                      <p className="text-xs text-gray-500">د.ل</p>
                    </div>
                    {priceTo && <>
                      <div className="text-gray-300 text-xl">—</div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">حتى</p>
                        <p className="text-xl font-black text-[#071B33]">{priceTo}</p>
                        <p className="text-xs text-gray-500">د.ل</p>
                      </div>
                    </>}
                  </div>
                </div>
              )}

              {/* ── أوقات العمل ── */}
              {(workDays.length > 0 || hoursFrom) && (
                <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> أوقات العمل
                  </p>
                  {(hoursFrom || hoursTo) && (
                    <div className="flex items-center gap-2 mb-3 bg-white rounded-xl px-3 py-2">
                      <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
                      <span className="text-sm text-gray-700 font-medium" dir="ltr">
                        {hoursFrom}{hoursTo ? ` – ${hoursTo}` : ''}
                      </span>
                    </div>
                  )}
                  {workDays.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {workDays.map(d => (
                        <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">
                          {DAY_AR[d] || d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── معرض الأعمال ── */}
              {workImgs.length > 0 && (
                <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> معرض الأعمال ({workImgs.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {workImgs.map((src, i) => (
                      <img key={i} src={src} alt={`صورة ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-blue-100 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(src)} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── التواصل الاجتماعي ── */}
              {(viewItem.facebook || viewItem.instagram) && (
                <div className="bg-[#EBF5FF] rounded-2xl border border-blue-200 p-4 space-y-2">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">التواصل الاجتماعي</p>
                  {viewItem.facebook && (
                    <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Facebook className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate" dir="ltr">{viewItem.facebook}</span>
                    </a>
                  )}
                  {viewItem.instagram && (
                    <a href={viewItem.instagram} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 bg-pink-50 rounded-xl px-3 py-2.5 text-pink-600 hover:bg-pink-100 transition-colors">
                      <Instagram className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate" dir="ltr">{viewItem.instagram}</span>
                    </a>
                  )}
                </div>
              )}

              {/* ── الشهادات والاعتمادات ── */}
              {viewItem.certifications && (
                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                  <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> الشهادات والاعتمادات
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">{viewItem.certifications}</p>
                </div>
              )}

              {/* ── تخصص مكتوب يدوياً ── */}
              {viewItem.customSpecialty && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-amber-700 text-xs font-bold">تخصص مكتوب يدوياً: "{viewItem.customSpecialty}"</p>
                  </div>
                  {viewItem.status === 'pending' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">إجراء التخصص عند القبول:</p>
                      {[
                        { v: 'none',   label: 'قبول بدون إنشاء تخصص جديد' },
                        { v: 'create', label: 'إنشاء تخصص جديد في قسم...' },
                        { v: 'link',   label: 'ربط بتخصص موجود' },
                      ].map(opt => (
                        <label key={opt.v} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="radio" name="specActionCo" value={opt.v}
                            checked={specialtyAction === opt.v}
                            onChange={() => setSpecialtyAction(opt.v)}
                            className="accent-[#FF7900]" />
                          <span className="text-xs text-gray-600">{opt.label}</span>
                        </label>
                      ))}
                      {specialtyAction === 'create' && (
                        <select
                          value={createSectionId}
                          onChange={e => setCreateSectionId(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                        >
                          <option value="">— اختر القسم —</option>
                          {SECTIONS.map(sec => (
                            <option key={sec.id} value={sec.id}>{sec.nameAr}</option>
                          ))}
                        </select>
                      )}
                      {specialtyAction === 'link' && (
                        <select
                          value={linkCatId}
                          onChange={e => setLinkCatId(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                        >
                          <option value="">— اختر القسم والتخصص —</option>
                          {SECTIONS.filter(s => s.id !== 'more_services').map(sec => {
                            const secCats = SERVICES_CATS.filter(c => c.sectionId === sec.id)
                            if (!secCats.length) return null
                            return (
                              <optgroup key={sec.id} label={sec.nameAr}>
                                {secCats.map(c => (
                                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                                ))}
                              </optgroup>
                            )
                          })}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── الوثائق الرسمية (داخلي فقط) ── */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider">الوثائق الرسمية — للاستخدام الداخلي فقط</p>
                </div>
                <p className="text-[11px] text-red-400 mb-3">سرية تامة — لا تُشارك مع العملاء</p>
                {commReg && (
                  <p className="text-xs text-gray-600 mb-2">السجل التجاري: <span className="font-semibold text-gray-800">{commReg}</span></p>
                )}
                {(commDoc || workLic) ? (
                  <div className="space-y-3">
                    {commDoc && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">صورة السجل التجاري / الترخيص</p>
                        <img src={commDoc} alt="commercial"
                          className="w-full max-h-44 rounded-xl border border-red-100 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(commDoc)} />
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-44 rounded-xl border border-red-100 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(workLic)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                  </div>
                )}
              </div>

              {/* ── أزرار الإجراءات حسب الحالة ── */}
              {viewItem.status === 'pending' && (
                <button
                  onClick={() => setRejectModal({ open: true, id: viewItem.id, reason: '', isView: true })}
                  className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                  رفض الطلب
                </button>
              )}
              {viewItem.status === 'approved' && (
                <button
                  onClick={() => setRejectModal({ open: true, id: viewItem.id, reason: '', isView: true })}
                  className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                  رفض الطلب
                </button>
              )}
              {viewItem.status === 'rejected' && (
                <div className="flex gap-2">
                  <button
                    onClick={async () => { await setStatus(viewItem.id, 'approved') }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                    قبول الطلب ✓
                  </button>
                  <button
                    onClick={async () => { await setStatus(viewItem.id, 'pending') }}
                    className="flex-1 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    إعادة للمراجعة
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </FormModal>

      {/* Rejection Reason Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setRejectModal(m => ({ ...m, open: false }))}>
          <div className="bg-[#0f2236] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
            <p className="text-white font-bold text-base mb-1 text-right">سبب الرفض</p>
            <p className="text-slate-400 text-xs mb-4 text-right">اختياري — سيظهر للمتقدم في صفحة تتبع طلبه</p>
            <textarea
              dir="rtl"
              rows={3}
              placeholder="مثال: البيانات غير مكتملة، المستندات غير واضحة..."
              className="w-full bg-slate-800 text-white text-sm rounded-xl p-3 border border-slate-600 focus:border-[#FF7900] focus:outline-none resize-none placeholder-slate-500"
              value={rejectModal.reason}
              onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  await setStatus(rejectModal.id, 'rejected', rejectModal.reason || null)
                  if (rejectModal.isView) setViewItem(null)
                  setRejectModal({ open: false, id: null, reason: '', isView: false })
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                تأكيد الرفض
              </button>
              <button
                onClick={() => setRejectModal({ open: false, id: null, reason: '', isView: false })}
                className="flex-1 border border-slate-600 text-slate-400 hover:bg-slate-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

