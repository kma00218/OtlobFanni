import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, FileText, Image, Lock, Facebook, Info, Shield, MessageCircle } from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'
import { sections as SECTIONS, categories as SERVICES_CATS } from '../../data/services'
import ImageLightbox from '../../components/ImageLightbox'

const EXP_YEARS = {
  less1: 0, '1-2': 2, '3-5': 5, '6-10': 10, '10+': 11,
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

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

export default function TechnicianApplications() {
  const { isSuperAdmin } = useAdmin()
  const [data, setData]         = useState([])
  const [cities, setCities]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [viewItem, setViewItem]           = useState(null)
  const [lightbox, setLightbox]           = useState(null)
  const [toast, setToast]                 = useState(null)
  const [lastPublished, setLastPublished] = useState(null)
  const [specialtyAction, setSpecialtyAction] = useState('none')
  const [linkCatId, setLinkCatId]         = useState('')
  const [allCats, setAllCats]             = useState([])
  const [categories, setCategories]       = useState([])
  const [rejectModal, setRejectModal]     = useState({ open: false, id: null, reason: '', isView: false })
  const [tab, setTab]                     = useState('all')

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
    api.admin.technicianApplications.list()
      .then(rows => { setData(rows.filter(r => r.status !== 'published')); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    reload()
    api.cities().then(setCities).catch(() => {})
    api.categories().then(cats => { setCategories(cats); setAllCats(cats) }).catch(() => {})
  }, [])

  useEffect(() => {
    setSpecialtyAction('none')
    setLinkCatId('')
  }, [viewItem?.id])

  const setStatus = async (id, status, rejectionReason = null) => {
    const app = data.find(r => r.id === id)
    try {
      const opts = {}
      if (status === 'approved' && app?.customSpecialty) {
        if (specialtyAction === 'create') opts.createCategory = true
        if (specialtyAction === 'link' && linkCatId) opts.linkCategoryId = linkCatId
      }
      if (status === 'rejected' && rejectionReason) opts.rejectionReason = rejectionReason
      const result = await api.admin.technicianApplications.update(id, status, opts)
      const resolvedCatId = result?.resolvedCategoryId || null

      setData(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))

      if (status === 'approved') {
        showToast('✓ تم القبول — اضغط "نشر" لإرسال رسالة الترحيب وتفعيل الفني')
      } else {
        showToast('تم رفض الطلب')
      }
    } catch { showToast('حدث خطأ', 'error') }
  }

  const handlePublish = async (id) => {
    try {
      const app = data.find(r => r.id === id)
      await api.admin.technicianApplications.publish(id)
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      if (app?.phone && app?.requestNumber) {
        setLastPublished({ name: app.fullName || app.full_name || '', phone: app.whatsapp || app.phone, requestNumber: app.requestNumber })
      }
      showToast('✓ تم نشر الطلب على المنصة')
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
      ? `مرحباً ${name}، تهانينا! ✅ تم قبول طلبك على منصة اطلب فني.\nرقم طلبك: ${requestNumber}\nتابع حالتك هنا: https://otlobfanni.ly/status/${requestNumber}`
      : `مرحباً ${name}، نأسف لإبلاغك بأن طلبك على منصة اطلب فني لم يتم قبوله.\nرقم طلبك: ${requestNumber}\nللاستفسار تواصل معنا.`
    window.open(`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const openPublishedWhatsApp = ({ name, phone, requestNumber }) => {
    const msg = `مبروك ${name}! 🎉 تم نشر ملفك الآن على منصة اطلب فني 🇱🇾\n\nيمكنك الآن مشاركة نشاطك مع أصدقائك وعملائك عبر هذا الرابط:\n👉 https://otlobfanni.ly/status/${requestNumber}`
    window.open(`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await api.admin.technicianApplications.delete(id)
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم حذف الطلب')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const referredCount = data.filter(r => !!r.referredByName).length

  const filtered = data.filter(r => {
    const name = r.fullName || r.full_name || ''
    const s = !search || name.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const f = !filter || r.status === filter
    const t = tab === 'all' || (tab === 'referred' && !!r.referredByName)
    return s && f && t
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'fullName', label: 'مقدم الطلب',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-slate-200">
            {(row.profilePhoto || row.profile_photo)
              ? <img src={getFileUrl(row.profilePhoto || row.profile_photo)} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold text-center px-0.5 leading-tight">{(v || '').trim().split(' ')[0]}</span>
                </div>
            }
          </div>
          <div>
            <p className="font-medium text-[#071B33] text-sm">{v}</p>
            <p className="text-xs text-slate-500" dir="ltr">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'whatsapp', label: 'واتساب',
      render: (v) => <span className="text-xs text-slate-400" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة' },
    { key: 'area', label: 'المنطقة', render: (v) => v || '—' },
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
      key: 'experience', label: 'الخبرة',
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
            <>
              <button onClick={() => handlePublish(row.id)}
                className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg font-medium transition-colors">
                نشر
              </button>
              <button onClick={() => setRejectModal({ open: true, id: row.id, reason: '', isView: false })}
                className="px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium transition-colors">
                رفض
              </button>
            </>
          )}
          {row.status === 'rejected' && (
            <>
              <button onClick={() => setStatus(row.id, 'approved')}
                className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg font-medium transition-colors">
                قبول
              </button>
              <button onClick={() => setStatus(row.id, 'pending')}
                className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg font-medium transition-colors">
                إعادة
              </button>
            </>
          )}
          {(row.status === 'approved' || row.status === 'rejected') && row.phone && row.requestNumber && (
            <button
              onClick={() => openWhatsApp(row.whatsapp || row.phone, row.fullName || row.full_name || '', row.status, row.requestNumber)}
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
            <p className="text-white font-bold text-sm">تم نشر ملف {lastPublished.name}</p>
            <p className="text-green-100 text-xs mt-0.5">أرسل له واتساب ليشارك نشاطه مع عملائه</p>
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
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Info banner */}
      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>طلبات <strong>انضم كفني</strong> — الخطوات: <strong>١. قبول</strong> (يُنشئ سجل الفني) ← <strong>٢. نشر</strong> (يُرسل رسالة واتساب تسويقية مع الرابط).</span>
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
        emptyMessage="لا توجد طلبات تسجيل بعد"
      />

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل طلب التسجيل"
        submitLabel={viewItem?.status === 'pending' ? 'قبول الطلب ✓' : 'إغلاق'}
        onSubmit={viewItem?.status === 'pending'
          ? (e) => { e.preventDefault(); setStatus(viewItem.id, 'approved') }
          : (e) => { e.preventDefault(); setViewItem(null) }
        }
        size="lg"
      >
        {viewItem && (() => {
          const name       = viewItem.fullName || viewItem.full_name || ''
          const photo      = getFileUrl(viewItem.profilePhoto || viewItem.profile_photo || null)
          const workImgs   = (viewItem.workImages || viewItem.work_images || []).map(getFileUrl)
          const availNow   = viewItem.availableNow ?? viewItem.available_now ?? false
          const hoursFrom  = viewItem.hoursFrom  || viewItem.hours_from  || ''
          const hoursTo    = viewItem.hoursTo    || viewItem.hours_to    || ''
          const workDays   = viewItem.workingDays || viewItem.working_days || []
          const priceFrom  = viewItem.priceFrom  || viewItem.price_from  || ''
          const priceTo    = viewItem.priceTo    || viewItem.price_to    || ''
          const natId      = viewItem.nationalId || viewItem.national_id || ''
          const idFront    = getFileUrl(viewItem.idDocFront || viewItem.id_doc_front || null)
          const idBack     = getFileUrl(viewItem.idDocBack  || viewItem.id_doc_back  || null)
          const workLic    = getFileUrl(viewItem.workLicense|| viewItem.work_license || null)
          const svcRadius  = viewItem.serviceRadius || viewItem.service_radius || ''
          const createdAt  = viewItem.createdAt  || viewItem.created_at  || ''

          return (
            <div className="space-y-5">

              {/* Profile header */}
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-slate-200 shadow">
                  {photo
                    ? <img src={photo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox({ images: [photo], index: 0 })} />
                    : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
                        <span className="text-white font-bold text-base text-center px-1 leading-tight">{name.trim().split(' ')[0]}</span>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#071B33] text-lg leading-tight">{name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {catLabel(viewItem.specialty) || viewItem.specialty} • {viewItem.city}
                  </p>
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
                    <p className="text-[#071B33] font-semibold text-sm">"{viewItem.customSpecialty}"</p>
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
                            <input type="radio" name="specAction" value={opt.v}
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

              {/* Personal */}
              <Sec icon={Phone} title="المعلومات الشخصية">
                <G2>
                  <IC label="الاسم الكامل"   value={name} />
                  <IC label="رقم الهاتف"     value={viewItem.phone}     dir="ltr" />
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">واتساب</p>
                    <p className="font-medium text-[#071B33] text-sm" dir="ltr">{viewItem.whatsapp || '—'}</p>
                    {viewItem.whatsapp && (
                      <a href={`https://wa.me/${viewItem.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                         className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-green-400 hover:text-green-300 transition-colors">
                        <WaIcon /> فتح واتساب
                      </a>
                    )}
                  </div>
                  <IC label="الرقم الوطني"   value={natId || '—'} />
                  <IC label="المدينة"         value={viewItem.city} />
                  <IC label="المنطقة / الحي" value={viewItem.area || '—'} />
                </G2>
                {viewItem.address && (
                  <div className="mt-2 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-slate-600">{viewItem.address}</p>
                  </div>
                )}
              </Sec>

              {/* Professional */}
              <Sec icon={Briefcase} title="المعلومات المهنية">
                <G2>
                  <IC label="القسم الرئيسي"  value={sectionLabel(viewItem.specialty)} valueClass="text-[#FF7900] font-semibold" />
                  <IC label="التخصص / الخدمة" value={catLabel(viewItem.specialty) || viewItem.specialty} />
                  <IC label="سنوات الخبرة"   value={EXP_LABEL[viewItem.experience] || viewItem.experience} />
                  <IC label="نوع العمل"      value={viewItem.type === 'company' ? 'شركة / مؤسسة' : 'فردي'} />
                  <IC label="نطاق الخدمة"   value={svcRadius ? `${svcRadius} كم` : '—'} />
                  <IC label="السعر الأدنى"   value={priceFrom ? `${priceFrom} د.ل` : '—'} />
                  <IC label="السعر الأقصى"   value={priceTo   ? `${priceTo} د.ل`   : '—'} />
                </G2>
                {(() => {
                  const extras = viewItem.extraSpecialties || viewItem.extra_specialties || []
                  if (extras.length === 0) return null
                  return (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-semibold mb-2">تخصصات إضافية ({extras.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {extras.map(id => (
                          <span key={id} className="bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {catLabel(id) || id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                {viewItem.description && (
                  <div className="mt-2.5 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">وصف الخدمة</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{viewItem.description}</p>
                  </div>
                )}
                {viewItem.certifications && (
                  <div className="mt-2 bg-blue-500/10 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> الشهادات والمؤهلات
                    </p>
                    <p className="text-sm text-blue-300 leading-relaxed">{viewItem.certifications}</p>
                  </div>
                )}
                {(() => {
                  const sugg = viewItem.suggestedSpecialties || viewItem.suggested_specialties || []
                  if (!sugg.length) return null
                  return (
                    <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-yellow-400 font-bold flex items-center gap-1.5">
                        <span>💡</span> تخصصات مقترحة من الفني ({sugg.length})
                      </p>
                      {sugg.map((s, i) => {
                        const isNewDept = s.sectionId === 'new_department'
                        const secLabel = isNewDept ? 'قسم جديد مقترح' : (SECTIONS.find(x => x.id === s.sectionId)?.nameAr || s.sectionId)
                        return (
                          <div key={i} className="bg-slate-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                            <div>
                              <p className={`text-[10px] mb-0.5 ${isNewDept ? 'text-amber-400' : 'text-slate-400'}`}>{secLabel}</p>
                              <p className="text-sm text-white font-semibold">"{s.name}"</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => createSuggestionCategory(s)}
                              className="flex-shrink-0 text-[10px] font-bold bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 px-2 py-1 rounded-lg transition-colors"
                            >
                              + إنشاء
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
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
                  {hoursFrom && <IC label="بداية العمل" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية العمل" value={hoursTo}   dir="ltr" />}
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

              {/* Portfolio */}
              {workImgs.length > 0 ? (
                <Sec icon={Image} title={`معرض الأعمال (${workImgs.length})`}>
                  <div className="grid grid-cols-3 gap-2">
                    {workImgs.map((src, i) => (
                      <img key={i} src={src} alt={`صورة ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox({ images: workImgs, index: i })} />
                    ))}
                  </div>
                </Sec>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-slate-500">
                  <Image className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">لم يتم رفع صور من الأعمال</p>
                </div>
              )}

              {/* Documents — internal */}
              <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-400">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">سرية تامة — لا تُشارك مع العملاء</p>
                </div>
                {(idFront || idBack || workLic) ? (
                  <div className="space-y-3">
                    {(idFront || idBack) && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-2">بطاقة الهوية</p>
                        <div className="grid grid-cols-2 gap-2">
                          {idFront && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">الوجه الأمامي</p>
                              <img src={idFront} alt="front"
                                className="w-full rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                                onClick={() => setLightbox({ images: [idFront, idBack].filter(Boolean), index: 0 })} />
                            </div>
                          )}
                          {idBack && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">الوجه الخلفي</p>
                              <img src={idBack} alt="back"
                                className="w-full rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                                onClick={() => setLightbox({ images: [idFront, idBack].filter(Boolean), index: [idFront, idBack].filter(Boolean).indexOf(idBack) })} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">رخصة العمل / الشهادة المهنية</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-40 rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox({ images: [workLic], index: 0 })} />
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

              {/* Actions based on status */}
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
              placeholder="مثال: البيانات غير مكتملة، الصور غير واضحة..."
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
      <p className={`font-medium text-[#071B33] text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
