import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, FileText, Image, Lock, Facebook, Info, Building2, Shield } from 'lucide-react'
import { categories } from '../../data/services'
import api from '../../lib/api'

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

const STATUS = {
  pending:  { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-600'  },
  approved: { label: 'مقبول',        cls: 'bg-green-50 text-green-700'  },
  rejected: { label: 'مرفوض',        cls: 'bg-red-50   text-red-500'    },
}

const DAY_AR = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
}

const CAT_LABEL = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))

export default function CompanyApplications() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const reload = () => {
    setLoading(true)
    api.admin.companyApplications.list()
      .then(rows => { setData(rows.filter(r => r.status !== 'approved')); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const setStatus = async (id, status) => {
    try {
      await api.admin.companyApplications.update(id, status)
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
        const logo = row.companyLogo || row.company_logo
        const contact = row.contactName || row.contact_name
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white text-xs font-bold rounded-xl">
                    {(v || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
              }
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{v}</p>
              <p className="text-xs text-gray-400">{contact || '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone', label: 'الهاتف',
      render: (v) => <span className="text-xs text-gray-600" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة' },
    {
      key: 'specialty', label: 'التخصص',
      render: (v) => CAT_LABEL[v] || v || '—',
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
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—',
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => setStatus(row.id, 'approved')}
                className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors">
                قبول
              </button>
              <button onClick={() => setStatus(row.id, 'rejected')}
                className="px-2 py-1 text-xs bg-red-50 text-red-500 hover:bg-red-100 rounded-lg font-medium transition-colors">
                رفض
              </button>
            </>
          )}
          <button onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="حذف">
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
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>هذه الطلبات مقدمة عبر نموذج <strong>انضم كشركة</strong>. عند القبول تظهر الشركة مباشرة في التطبيق.</span>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
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
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
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
          const logo        = viewItem.companyLogo  || viewItem.company_logo  || null
          const workImgs    = viewItem.workImages   || viewItem.work_images   || []
          const availNow    = viewItem.availableNow ?? viewItem.available_now ?? false
          const hoursFrom   = viewItem.hoursFrom    || viewItem.hours_from    || ''
          const hoursTo     = viewItem.hoursTo      || viewItem.hours_to      || ''
          const workDays    = viewItem.workingDays  || viewItem.working_days  || []
          const priceFrom   = viewItem.priceFrom    || viewItem.price_from    || ''
          const priceTo     = viewItem.priceTo      || viewItem.price_to      || ''
          const svcRadius   = viewItem.serviceRadius|| viewItem.service_radius|| ''
          const commReg     = viewItem.commercialReg|| viewItem.commercial_reg|| ''
          const commDoc     = viewItem.commercialDoc|| viewItem.commercial_doc|| null
          const workLic     = viewItem.workLicense  || viewItem.work_license  || null
          const yearsActive = viewItem.yearsActive  || viewItem.years_active  || ''
          const createdAt   = viewItem.createdAt    || viewItem.created_at    || ''

          return (
            <div className="space-y-5">

              {/* Company header */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow">
                  {logo
                    ? <img src={logo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(logo)} />
                    : <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white font-bold text-2xl rounded-xl">
                        {compName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{compName}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {CAT_LABEL[viewItem.specialty] || viewItem.specialty} • {viewItem.city}
                  </p>
                  {contactName && (
                    <p className="text-xs text-gray-400 mt-0.5">جهة التواصل: {contactName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS[viewItem.status]?.cls}`}>
                      {STATUS[viewItem.status]?.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {createdAt ? new Date(createdAt).toLocaleDateString('ar-LY') : ''}
                    </span>
                  </div>
                </div>
              </div>

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
                  <div className="mt-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-gray-700">{viewItem.address}</p>
                  </div>
                )}
              </Sec>

              {/* Service info */}
              <Sec icon={Briefcase} title="معلومات الخدمة">
                <G2>
                  <IC label="التخصص"       value={CAT_LABEL[viewItem.specialty] || viewItem.specialty} />
                  <IC label="سنوات النشاط" value={EXP_LABEL[yearsActive] || yearsActive} />
                  <IC label="السعر الأدنى"  value={priceFrom ? `${priceFrom} د.ل` : '—'} />
                  <IC label="السعر الأقصى"  value={priceTo   ? `${priceTo} د.ل`   : '—'} />
                </G2>
                {viewItem.description && (
                  <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">وصف الخدمات</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
                  </div>
                )}
                {viewItem.certifications && (
                  <div className="mt-2 bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> الشهادات والاعتمادات
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">{viewItem.certifications}</p>
                  </div>
                )}
              </Sec>

              {/* Availability */}
              <Sec icon={Clock} title="التوفر والجدول">
                <G2>
                  <IC label="متاح الآن"
                    value={availNow ? '✓ نعم' : '✗ لا'}
                    valueClass={availNow ? 'text-green-600 font-semibold' : 'text-gray-500'} />
                  <IC label="خدمة الطوارئ 24/7"
                    value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                    valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-gray-500'} />
                  {hoursFrom && <IC label="بداية الدوام" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية الدوام" value={hoursTo}   dir="ltr" />}
                </G2>
                {workDays.length > 0 && (
                  <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-2">أيام العمل</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workDays.map(d => (
                        <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">
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
                    <div className="bg-gray-50 rounded-xl p-3 mb-2">
                      <p className="text-xs text-gray-400 mb-0.5">فيسبوك</p>
                      <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline break-all" dir="ltr">
                        {viewItem.facebook}
                      </a>
                    </div>
                  )}
                  {viewItem.instagram && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">إنستغرام</p>
                      <a href={viewItem.instagram} target="_blank" rel="noreferrer"
                        className="text-sm text-pink-500 hover:underline break-all" dir="ltr">
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
                        className="w-full aspect-square object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(src)} />
                    ))}
                  </div>
                </Sec>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-gray-400">
                  <Image className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">لم يتم رفع صور من الأعمال</p>
                </div>
              )}

              {/* Documents */}
              <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-500">
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-500">سرية تامة — لا تُشارك مع العملاء</p>
                </div>
                {(commDoc || workLic) ? (
                  <div className="space-y-3">
                    {commDoc && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">السجل التجاري / الترخيص</p>
                        <img src={commDoc} alt="commercial"
                          className="w-full max-h-40 rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(commDoc)} />
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-40 rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(workLic)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-gray-400">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                  </div>
                )}
              </Sec>

              {/* Reject */}
              {viewItem.status === 'pending' && (
                <button
                  onClick={() => { setStatus(viewItem.id, 'rejected'); setViewItem(null) }}
                  className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
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
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${titleClass || 'text-gray-400'}`}>
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
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-medium text-gray-800 text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
