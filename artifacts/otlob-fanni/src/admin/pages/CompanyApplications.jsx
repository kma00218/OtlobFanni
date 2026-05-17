import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, FileText, Image, Lock, Facebook, Info, Building2, Shield, MessageCircle } from 'lucide-react'
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
  const [lightbox, setLightbox]               = useState(null)
  const [toast, setToast]                     = useState(null)
  const [lastPublished, setLastPublished]     = useState(null)
  const [specialtyAction, setSpecialtyAction] = useState('none')
  const [linkCatId, setLinkCatId]             = useState('')
  const [allCats, setAllCats]                 = useState([])
  const [categories, setCategories]           = useState([])
  const [rejectModal, setRejectModal]         = useState({ open: false, id: null, reason: '', isView: false })

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

  const setStatus = async (id, status, rejectionReason = null) => {
    try {
      const opts = {}
      if (status === 'approved') {
        const app = data.find(r => r.id === id)
        if (app?.customSpecialty) {
          if (specialtyAction === 'create') opts.createCategory = true
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
        setLastPublished({ name: app.companyName || app.company_name || '', phone: app.phone, requestNumber: app.requestNumber })
      }
      showToast('✓ تم نشر الشركة على المنصة')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const openWhatsApp = (phone, name, status, requestNumber) => {
    const msg = status === 'approved'
      ? `مرحباً ${name}، تهانينا! ✅ تم قبول طلب شركتك على منصة اطلب فني.\nرقم طلبك: ${requestNumber}\nتابع حالتك هنا: https://otlobfanni.ly/status/${requestNumber}`
      : `مرحباً ${name}، نأسف لإبلاغك بأن طلب شركتك على منصة اطلب فني لم يتم قبوله.\nرقم طلبك: ${requestNumber}\nللاستفسار تواصل معنا.`
    window.open(`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const openPublishedWhatsApp = ({ name, phone, requestNumber }) => {
    const msg = `مبروك ${name}! 🎉 تم نشر شركتك الآن على منصة اطلب فني 🇱🇾\n\nيمكنك الآن مشاركة نشاطكم مع عملائكم عبر هذا الرابط:\n👉 https://otlobfanni.ly/status/${requestNumber}`
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

  const filtered = data.filter(r => {
    const name = r.companyName || r.company_name || ''
    const contact = r.contactName || r.contact_name || ''
    const s = !search || name.includes(search) || contact.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const f = !filter || r.status === filter
    return s && f
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
                : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold rounded-xl">
                    {(v || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
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
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => setStatus(row.id, 'approved')}
                className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg font-medium transition-colors">
                قبول
              </button>
              <button onClick={() => setRejectModal({ open: true, id: row.id, reason: '', isView: false })}
                className="px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium transition-colors">
                رفض
              </button>
            </>
          )}
          {row.status === 'approved' && (
            <button onClick={() => handlePublish(row.id)}
              className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg font-medium transition-colors">
              نشر
            </button>
          )}
          {(row.status === 'approved' || row.status === 'rejected') && row.phone && row.requestNumber && (
            <button
              onClick={() => openWhatsApp(row.phone, row.companyName || row.company_name || '', row.status, row.requestNumber)}
              className="p-1.5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors"
              title="إشعار واتساب">
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
        title="تفاصيل طلب تسجيل الشركة"
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

          return (
            <div className="space-y-5">

              {/* Company header */}
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-slate-200 shadow">
                  {logo
                    ? <img src={logo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(logo)} />
                    : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-2xl rounded-xl">
                        {compName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                    <h3 className="font-bold text-white text-lg leading-tight">{compName}</h3>
                  </div>
                  <p className="text-sm text-slate-400">
                    {catLabel(viewItem.specialty) || viewItem.specialty} • {viewItem.city}
                  </p>
                  {contactName && (
                    <p className="text-xs text-slate-500 mt-0.5">جهة التواصل: {contactName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS[viewItem.status]?.cls}`}>
                      {STATUS[viewItem.status]?.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Specialty Banner */}
              {viewItem.customSpecialty && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-amber-400 text-xs font-bold tracking-wide">تخصص مكتوب يدوياً — المزيد من الخدمات</p>
                  </div>
                  <div className="bg-slate-100 rounded-xl px-3 py-2.5">
                    <p className="text-white font-semibold text-sm">"{viewItem.customSpecialty}"</p>
                  </div>
                  {viewItem.status === 'pending' && (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-400 font-medium">إجراء التخصص عند القبول:</p>
                      <div className="space-y-2">
                        {[
                          { v: 'none',   label: 'قبول بدون إنشاء تخصص جديد' },
                          { v: 'create', label: 'إنشاء تخصص جديد في "المزيد من الخدمات"' },
                          { v: 'link',   label: 'ربط بتخصص موجود' },
                        ].map(opt => (
                          <label key={opt.v} className="flex items-center gap-2.5 cursor-pointer group">
                            <input type="radio" name="specActionCo" value={opt.v}
                              checked={specialtyAction === opt.v}
                              onChange={() => setSpecialtyAction(opt.v)}
                              className="accent-[#FF7900]" />
                            <span className="text-xs text-slate-600 group-hover:text-white transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                      {specialtyAction === 'link' && (
                        <select
                          value={linkCatId}
                          onChange={e => setLinkCatId(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                        >
                          <option value="">اختر التخصص الموجود...</option>
                          {allCats.filter(c => c.id !== 'more').map(c => (
                            <option key={c.id} value={c.id}>{c.nameAr || c.nameEn}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Company info */}
              <Sec icon={Building2} title="معلومات الشركة">
                <G2>
                  <IC label="اسم الشركة"       value={compName} />
                  <IC label="جهة التواصل"       value={contactName || '—'} />
                  <IC label="رقم الهاتف"         value={viewItem.phone}     dir="ltr" />
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">واتساب</p>
                    <p className="font-medium text-white text-sm" dir="ltr">{viewItem.whatsapp || '—'}</p>
                    {viewItem.whatsapp && (
                      <a href={`https://wa.me/${viewItem.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                         className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-green-400 hover:text-green-300 transition-colors">
                        <WaIcon /> فتح واتساب
                      </a>
                    )}
                  </div>
                  <IC label="السجل التجاري"      value={commReg || '—'} />
                  <IC label="المدينة"            value={viewItem.city} />
                  <IC label="المنطقة / الحي"     value={viewItem.area || '—'} />
                  <IC label="نطاق الخدمة"       value={svcRadius ? `${svcRadius} كم` : '—'} />
                </G2>
                {viewItem.address && (
                  <div className="mt-2 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-slate-600">{viewItem.address}</p>
                  </div>
                )}
              </Sec>

              {/* Service info */}
              <Sec icon={Briefcase} title="معلومات الخدمة">
                <G2>
                  <IC label="القسم الرئيسي"   value={sectionLabel(viewItem.specialty)} valueClass="text-[#FF7900] font-semibold" />
                  <IC label="التخصص / الخدمة" value={catLabel(viewItem.specialty) || viewItem.specialty} />
                  <IC label="سنوات النشاط"    value={EXP_LABEL[yearsActive] || yearsActive} />
                  <IC label="السعر الأدنى"     value={priceFrom ? `${priceFrom} د.ل` : '—'} />
                  <IC label="السعر الأقصى"     value={priceTo   ? `${priceTo} د.ل`   : '—'} />
                </G2>
                {viewItem.description && (
                  <div className="mt-2.5 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">وصف الخدمات</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{viewItem.description}</p>
                  </div>
                )}
                {viewItem.certifications && (
                  <div className="mt-2 bg-blue-500/10 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> الشهادات والاعتمادات
                    </p>
                    <p className="text-sm text-blue-300 leading-relaxed">{viewItem.certifications}</p>
                  </div>
                )}
              </Sec>

              {/* Availability */}
              <Sec icon={Clock} title="التوفر والجدول">
                <G2>
                  <IC label="متاح الآن"
                    value={availNow ? '✓ نعم' : '✗ لا'}
                    valueClass={availNow ? 'text-emerald-400 font-semibold' : 'text-slate-500'} />
                  <IC label="خدمة الطوارئ 24/7"
                    value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                    valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-slate-500'} />
                  {hoursFrom && <IC label="بداية الدوام" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية الدوام" value={hoursTo}   dir="ltr" />}
                </G2>
                {workDays.length > 0 && (
                  <div className="mt-2.5 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-2">أيام العمل</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workDays.map(d => (
                        <span key={d} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
                          {DAY_AR[d] || d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Sec>

              {/* Social */}
              {(viewItem.facebook || viewItem.instagram) && (
                <Sec icon={Facebook} title="التواصل الاجتماعي">
                  {viewItem.facebook && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-2">
                      <p className="text-xs text-slate-500 mb-0.5">فيسبوك</p>
                      <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all" dir="ltr">
                        {viewItem.facebook}
                      </a>
                    </div>
                  )}
                  {viewItem.instagram && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-0.5">إنستغرام</p>
                      <a href={viewItem.instagram} target="_blank" rel="noreferrer"
                        className="text-sm text-pink-400 hover:underline break-all" dir="ltr">
                        {viewItem.instagram}
                      </a>
                    </div>
                  )}
                </Sec>
              )}

              {/* Work Portfolio */}
              {workImgs.length > 0 ? (
                <Sec icon={Image} title={`معرض الأعمال (${workImgs.length})`}>
                  <div className="grid grid-cols-3 gap-2">
                    {workImgs.map((src, i) => (
                      <img key={i} src={src} alt={`صورة ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(src)} />
                    ))}
                  </div>
                </Sec>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-slate-500">
                  <Image className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">لم يتم رفع صور من الأعمال</p>
                </div>
              )}

              {/* Documents */}
              <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-400">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">سرية تامة — لا تُشارك مع العملاء</p>
                </div>
                {(commDoc || workLic) ? (
                  <div className="space-y-3">
                    {commDoc && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">السجل التجاري / الترخيص</p>
                        <img src={commDoc} alt="commercial"
                          className="w-full max-h-40 rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(commDoc)} />
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-40 rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(workLic)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-slate-500">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                  </div>
                )}
              </Sec>

              {/* Reject */}
              {viewItem.status === 'pending' && (
                <button
                  onClick={() => setRejectModal({ open: true, id: viewItem.id, reason: '', isView: true })}
                  className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                  رفض الطلب
                </button>
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

function Sec({ icon: Icon, title, titleClass, children }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${titleClass || 'text-slate-500'}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {children}
    </div>
  )
}
function G2({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}
function IC({ label, value, dir, valueClass }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`font-medium text-white text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
