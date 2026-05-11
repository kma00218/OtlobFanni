import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, FileText, Image, Lock, Facebook, Info, Shield } from 'lucide-react'
import { categories } from '../../data/services'
import api from '../../lib/api'

const EXP_YEARS = {
  less1: 0, '1-2': 2, '3-5': 5, '6-10': 10, '10+': 11,
}

const CAT_LABEL = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))

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

export default function TechnicianApplications() {
  const { isSuperAdmin } = useAdmin()
  const [data, setData]         = useState([])
  const [cities, setCities]     = useState([])
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
    api.admin.technicianApplications.list()
      .then(rows => { setData(rows.filter(r => r.status !== 'approved')); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    reload()
    api.cities().then(setCities).catch(() => {})
  }, [])

  const setStatus = async (id, status) => {
    const app = data.find(r => r.id === id)
    try {
      await api.admin.technicianApplications.update(id, status)
      if (status === 'approved') {
        setData(prev => prev.filter(r => r.id !== id))
        if (viewItem?.id === id) setViewItem(null)
      } else {
        setData(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
      }
      if (status === 'approved' && app) {
        const name = app.fullName || app.full_name || ''
        const phone = app.phone || ''
        if (name && phone) {
          try {
            const appCity = app.city || ''
            const cityRow = cities.find(c =>
              c.nameAr === appCity || c.nameEn === appCity || c.id === appCity
            )
            await api.admin.technicians.create({
              id:               'tech_' + app.id,
              name_ar:          name,
              phone:            phone,
              whatsapp:         app.whatsapp || phone,
              city_id:          cityRow?.id || null,
              area:             app.area || '',
              category_id:      app.specialty || null,
              experience_years: EXP_YEARS[app.experience] ?? 0,
              price_from:       parseFloat(app.priceFrom || app.price_from) || 0,
              price_to:         parseFloat(app.priceTo   || app.price_to)   || 0,
              description_ar:   app.description || '',
              profile_photo:    app.profilePhoto || app.profile_photo || null,
              work_images:      app.workImages   || app.work_images   || [],
              available_now:    !!(app.availableNow ?? app.available_now),
              emergency:        !!(app.emergency),
              is_active:        true,
              is_approved:      true,
              is_featured:      false,
              status:           (app.availableNow ?? app.available_now) ? 'available' : 'busy',
              application_id:   app.id,
            })
            showToast('✓ تم قبول الطلب وإنشاء سجل الفني')
          } catch (err) {
            showToast('تم قبول الطلب لكن فشل إنشاء سجل الفني — تحقق من الاتصال', 'error')
          }
        } else {
          showToast('✓ تم قبول الطلب (لا يوجد اسم أو هاتف لإنشاء السجل)')
        }
      } else {
        showToast('تم رفض الطلب')
      }
    } catch { showToast('حدث خطأ', 'error') }
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

  const filtered = data.filter(r => {
    const name = r.fullName || r.full_name || ''
    const s = !search || name.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const f = !filter || r.status === filter
    return s && f
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'fullName', label: 'مقدم الطلب',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/8">
            {(row.profilePhoto || row.profile_photo)
              ? <img src={row.profilePhoto || row.profile_photo} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#1A1A30] flex items-center justify-center text-white text-xs font-bold">
                  {(v || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
            }
          </div>
          <div>
            <p className="font-medium text-white text-sm">{v}</p>
            <p className="text-xs text-[#555570]" dir="ltr">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'whatsapp', label: 'واتساب',
      render: (v) => <span className="text-xs text-[#8888A8]" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة' },
    { key: 'area', label: 'المنطقة', render: (v) => v || '—' },
    {
      key: 'specialty', label: 'التخصص',
      render: (v) => CAT_LABEL[v] || v || '—',
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
        <span>هذه الطلبات مقدمة عبر نموذج <strong>انضم كفني</strong> وتُحفظ في قاعدة البيانات.</span>
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
          const photo      = viewItem.profilePhoto || viewItem.profile_photo || null
          const workImgs   = viewItem.workImages || viewItem.work_images || []
          const availNow   = viewItem.availableNow ?? viewItem.available_now ?? false
          const hoursFrom  = viewItem.hoursFrom  || viewItem.hours_from  || ''
          const hoursTo    = viewItem.hoursTo    || viewItem.hours_to    || ''
          const workDays   = viewItem.workingDays || viewItem.working_days || []
          const priceFrom  = viewItem.priceFrom  || viewItem.price_from  || ''
          const priceTo    = viewItem.priceTo    || viewItem.price_to    || ''
          const natId      = viewItem.nationalId || viewItem.national_id || ''
          const idFront    = viewItem.idDocFront || viewItem.id_doc_front || null
          const idBack     = viewItem.idDocBack  || viewItem.id_doc_back  || null
          const workLic    = viewItem.workLicense|| viewItem.work_license || null
          const svcRadius  = viewItem.serviceRadius || viewItem.service_radius || ''
          const createdAt  = viewItem.createdAt  || viewItem.created_at  || ''

          return (
            <div className="space-y-5">

              {/* Profile header */}
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/10 shadow">
                  {photo
                    ? <img src={photo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(photo)} />
                    : <div className="w-full h-full bg-[#1A1A30] flex items-center justify-center text-white font-bold text-2xl">
                        {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg leading-tight">{name}</h3>
                  <p className="text-sm text-[#8888A8] mt-0.5">
                    {CAT_LABEL[viewItem.specialty] || viewItem.specialty} • {viewItem.city}
                  </p>
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

              {/* Personal */}
              <Sec icon={Phone} title="المعلومات الشخصية">
                <G2>
                  <IC label="الاسم الكامل"   value={name} />
                  <IC label="رقم الهاتف"     value={viewItem.phone}     dir="ltr" />
                  <IC label="واتساب"          value={viewItem.whatsapp}  dir="ltr" />
                  <IC label="الرقم الوطني"   value={natId || '—'} />
                  <IC label="المدينة"         value={viewItem.city} />
                  <IC label="المنطقة / الحي" value={viewItem.area || '—'} />
                </G2>
                {viewItem.address && (
                  <div className="mt-2 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-[#C0C0D8]">{viewItem.address}</p>
                  </div>
                )}
              </Sec>

              {/* Professional */}
              <Sec icon={Briefcase} title="المعلومات المهنية">
                <G2>
                  <IC label="التخصص"         value={CAT_LABEL[viewItem.specialty] || viewItem.specialty} />
                  <IC label="سنوات الخبرة"   value={EXP_LABEL[viewItem.experience] || viewItem.experience} />
                  <IC label="نوع العمل"      value={viewItem.type === 'company' ? 'شركة / مؤسسة' : 'فردي'} />
                  <IC label="نطاق الخدمة"   value={svcRadius ? `${svcRadius} كم` : '—'} />
                  <IC label="السعر الأدنى"   value={priceFrom ? `${priceFrom} د.ل` : '—'} />
                  <IC label="السعر الأقصى"   value={priceTo   ? `${priceTo} د.ل`   : '—'} />
                </G2>
                {viewItem.description && (
                  <div className="mt-2.5 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-1">وصف الخدمة</p>
                    <p className="text-sm text-[#C0C0D8] leading-relaxed">{viewItem.description}</p>
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
                  {hoursFrom && <IC label="بداية العمل" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية العمل" value={hoursTo}   dir="ltr" />}
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

              {/* Portfolio */}
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
                        <p className="text-xs text-[#666680] font-medium mb-2">بطاقة الهوية</p>
                        <div className="grid grid-cols-2 gap-2">
                          {idFront && (
                            <div>
                              <p className="text-xs text-[#555570] mb-1">الوجه الأمامي</p>
                              <img src={idFront} alt="front"
                                className="w-full rounded-xl border border-white/8 object-cover cursor-zoom-in hover:opacity-90"
                                onClick={() => setLightbox(idFront)} />
                            </div>
                          )}
                          {idBack && (
                            <div>
                              <p className="text-xs text-[#555570] mb-1">الوجه الخلفي</p>
                              <img src={idBack} alt="back"
                                className="w-full rounded-xl border border-white/8 object-cover cursor-zoom-in hover:opacity-90"
                                onClick={() => setLightbox(idBack)} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-[#666680] font-medium mb-1">رخصة العمل / الشهادة المهنية</p>
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
