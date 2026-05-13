import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, FileText, Image, Lock, Facebook, Info, Building2, Shield } from 'lucide-react'
import api, { getFileUrl } from '../../lib/api'
import { sections as SECTIONS } from '../../data/services'

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

const STATUS = {
  pending:  { label: 'قيد المراجعة', cls: 'bg-amber-500/10 text-amber-400'   },
  approved: { label: 'مقبول',        cls: 'bg-emerald-500/10 text-emerald-400' },
  rejected: { label: 'مرفوض',        cls: 'bg-red-500/10 text-red-400'        },
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
  const [specialtyAction, setSpecialtyAction] = useState('none')
  const [linkCatId, setLinkCatId]             = useState('')
  const [allCats, setAllCats]                 = useState([])
  const [categories, setCategories]           = useState([])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const catLabel = (id) => {
    const cat = categories.find(c => c.id === id)
    return cat ? (cat.nameAr || cat.name_ar) : (id || '—')
  }

  const sectionLabel = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    const sectionId = cat?.sectionId || cat?.section_id
    if (!sectionId) return '—'
    const sec = SECTIONS.find(s => s.id === sectionId)
    return sec ? sec.nameAr : sectionId
  }

  const reload = () => {
    setLoading(true)
    api.admin.companyApplications.list()
      .then(rows => { setData(rows.filter(r => r.status !== 'approved')); setLoading(false) })
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

  const setStatus = async (id, status) => {
    try {
      const opts = {}
      if (status === 'approved') {
        const app = data.find(r => r.id === id)
        if (app?.customSpecialty) {
          if (specialtyAction === 'create') opts.createCategory = true
          if (specialtyAction === 'link' && linkCatId) opts.linkCategoryId = linkCatId
        }
      }
      await api.admin.companyApplications.update(id, status, opts)
      if (status === 'approved') {
        setData(prev => prev.filter(r => r.id !== id))
        if (viewItem?.id === id) setViewItem(null)
        showToast('✓ تم قبول طلب الشركة — تجدها الآن في صفحة الشركات المقبولة')
      } else {
        setData(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
        showToast('تم رفض الطلب')
      }
    } catch { showToast('حدث خطأ', 'error') }
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
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/8">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#1A1A30] flex items-center justify-center text-white text-xs font-bold rounded-xl">
                    {(v || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
              }
            </div>
            <div>
              <p className="font-medium text-white text-sm">{v}</p>
              <p className="text-xs text-[#555570]">{contact || '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone', label: 'الهاتف',
      render: (v) => <span className="text-xs text-[#8888A8]" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة' },
    {
      key: 'specialty', label: 'التخصص',
      render: (v, row) => row.customSpecialty
        ? <span className="text-amber-400 text-xs font-medium">{row.customSpecialty}</span>
        : (catLabel(v) || v || '—'),
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
              <button onClick={() => setStatus(row.id, 'rejected')}
                className="px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium transition-colors">
                رفض
              </button>
            </>
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

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>هذه الطلبات مقدمة عبر نموذج <strong>انضم كشركة</strong>. عند القبول تظهر الشركة مباشرة في التطبيق.</span>
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
            className="border border-white/8 rounded-xl px-3 py-2 text-sm text-[#C0C0E0] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white/5">
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
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
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white/10 shadow">
                  {logo
                    ? <img src={logo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(logo)} />
                    : <div className="w-full h-full bg-[#1A1A30] flex items-center justify-center text-white font-bold text-2xl rounded-xl">
                        {compName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                    <h3 className="font-bold text-white text-lg leading-tight">{compName}</h3>
                  </div>
                  <p className="text-sm text-[#8888A8]">
                    {catLabel(viewItem.specialty) || viewItem.specialty} • {viewItem.city}
                  </p>
                  {contactName && (
                    <p className="text-xs text-[#555570] mt-0.5">جهة التواصل: {contactName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS[viewItem.status]?.cls}`}>
                      {STATUS[viewItem.status]?.label}
                    </span>
                    <span className="text-xs text-[#555570]">
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
                  <div className="bg-white/8 rounded-xl px-3 py-2.5">
                    <p className="text-white font-semibold text-sm">"{viewItem.customSpecialty}"</p>
                  </div>
                  {viewItem.status === 'pending' && (
                    <div className="space-y-2.5">
                      <p className="text-xs text-[#8888A8] font-medium">إجراء التخصص عند القبول:</p>
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
                            <span className="text-xs text-[#C0C0E0] group-hover:text-white transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                      {specialtyAction === 'link' && (
                        <select
                          value={linkCatId}
                          onChange={e => setLinkCatId(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-[#C0C0E0] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
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
                  <IC label="واتساب"             value={viewItem.whatsapp}  dir="ltr" />
                  <IC label="السجل التجاري"      value={commReg || '—'} />
                  <IC label="المدينة"            value={viewItem.city} />
                  <IC label="المنطقة / الحي"     value={viewItem.area || '—'} />
                  <IC label="نطاق الخدمة"       value={svcRadius ? `${svcRadius} كم` : '—'} />
                </G2>
                {viewItem.address && (
                  <div className="mt-2 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-[#C0C0D8]">{viewItem.address}</p>
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
                  <div className="mt-2.5 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-1">وصف الخدمات</p>
                    <p className="text-sm text-[#C0C0D8] leading-relaxed">{viewItem.description}</p>
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
                    valueClass={availNow ? 'text-emerald-400 font-semibold' : 'text-[#555570]'} />
                  <IC label="خدمة الطوارئ 24/7"
                    value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                    valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-[#555570]'} />
                  {hoursFrom && <IC label="بداية الدوام" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية الدوام" value={hoursTo}   dir="ltr" />}
                </G2>
                {workDays.length > 0 && (
                  <div className="mt-2.5 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-2">أيام العمل</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workDays.map(d => (
                        <span key={d} className="bg-white/10 text-[#C0C0D8] text-xs px-2.5 py-1 rounded-lg">
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
                    <div className="bg-white/5 rounded-xl p-3 mb-2">
                      <p className="text-xs text-[#555570] mb-0.5">فيسبوك</p>
                      <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all" dir="ltr">
                        {viewItem.facebook}
                      </a>
                    </div>
                  )}
                  {viewItem.instagram && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-[#555570] mb-0.5">إنستغرام</p>
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
                        className="w-full aspect-square object-cover rounded-xl border border-white/8 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(src)} />
                    ))}
                  </div>
                </Sec>
              ) : (
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2 text-[#555570]">
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
                        <p className="text-xs text-[#666680] font-medium mb-1">السجل التجاري / الترخيص</p>
                        <img src={commDoc} alt="commercial"
                          className="w-full max-h-40 rounded-xl border border-white/8 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(commDoc)} />
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-[#666680] font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-40 rounded-xl border border-white/8 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(workLic)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2 text-[#555570]">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                  </div>
                )}
              </Sec>

              {/* Reject */}
              {viewItem.status === 'pending' && (
                <button
                  onClick={() => { setStatus(viewItem.id, 'rejected'); setViewItem(null) }}
                  className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                  رفض الطلب
                </button>
              )}
            </div>
          )
        })()}
      </FormModal>
    </div>
  )
}

function Sec({ icon: Icon, title, titleClass, children }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${titleClass || 'text-[#555570]'}`}>
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
    <div className="bg-white/5 rounded-xl p-3">
      <p className="text-xs text-[#555570] mb-0.5">{label}</p>
      <p className={`font-medium text-white text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
