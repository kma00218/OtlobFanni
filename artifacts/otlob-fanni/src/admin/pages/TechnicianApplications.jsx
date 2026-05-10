import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, AlertCircle, Phone, Briefcase, Clock, MapPin, FileText, Image, Lock, Facebook, Info, Shield } from 'lucide-react'
import { categories } from '../../data/services'

const LS_KEY   = 'technicianApplications'
const TECH_KEY = 'technicians'

const EXP_YEARS = {
  less1: 0, '1-2': 2, '3-5': 5, '6-10': 10, '10+': 11,
}

const applicationToTechnician = (app) => ({
  id:             'tech_' + app.id,
  applicationId:  app.id,
  name:           app.full_name     || '',
  phone:          app.phone         || '',
  whatsapp:       app.whatsapp      || app.phone || '',
  city:           app.city          || '',
  area:           app.area          || '',
  address:        app.address       || '',
  category:       app.specialty     || '',
  experienceYears: EXP_YEARS[app.experience] ?? 0,
  description:    app.description   || '',
  certifications: app.certifications || '',
  priceFrom:      parseFloat(app.price_from) || 0,
  priceTo:        parseFloat(app.price_to)   || 0,
  profilePhoto:   app.profile_photo  || null,
  workImages:     app.work_images    || [],
  availableNow:   !!app.available_now,
  workingDays:    app.working_days   || [],
  hoursFrom:      app.hours_from     || '',
  hoursTo:        app.hours_to       || '',
  emergency:      !!app.emergency,
  serviceRadius:  app.service_radius || '',
  facebook:       app.facebook       || '',
  instagram:      app.instagram      || '',
  isActive:       true,
  isApproved:     true,
  isFeatured:     false,
  rating:         0,
  reviewsCount:   0,
  approvedAt:     new Date().toISOString(),
})

const saveTechnician = (app) => {
  try {
    const existing = JSON.parse(localStorage.getItem(TECH_KEY) || '[]')
    const alreadyExists = existing.some(t => t.applicationId === app.id)
    if (alreadyExists) return
    existing.unshift(applicationToTechnician(app))
    localStorage.setItem(TECH_KEY, JSON.stringify(existing))
    console.log('[technicians] record created for:', app.full_name, '| total:', existing.length)
  } catch (_) {}
}

const CAT_LABEL = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))

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

const load = () => {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : [] }
  catch (_) { return [] }
}
const save = (list) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch (_) {}
}

export default function TechnicianApplications() {
  const { isDemoMode } = useAdmin()
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

  useEffect(() => {
    setData(load())
    setLoading(false)
  }, [])

  const persist = (next) => { setData(next); save(next) }

  const setStatus = (id, status) => {
    const app = data.find(r => r.id === id)
    persist(data.map(r => r.id === id ? { ...r, status } : r))
    if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
    if (status === 'approved' && app) {
      saveTechnician(app)
      showToast('✓ تم قبول الطلب وإنشاء سجل الفني')
    } else {
      showToast('تم رفض الطلب')
    }
  }

  const handleDelete = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    persist(data.filter(r => r.id !== id))
    if (viewItem?.id === id) setViewItem(null)
    showToast('تم حذف الطلب')
  }

  const filtered = data.filter(r => {
    const s = !search || r.full_name?.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const f = !filter || r.status === filter
    return s && f
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'full_name', label: 'مقدم الطلب',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
            {row.profile_photo
              ? <img src={row.profile_photo} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white text-xs font-bold">
                  {v?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
            }
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{v}</p>
            <p className="text-xs text-gray-400" dir="ltr">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'whatsapp', label: 'واتساب',
      render: (v) => <span className="text-xs text-gray-600" dir="ltr">{v || '—'}</span>,
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
      key: 'created_at', label: 'تاريخ التقديم',
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
        <span>هذه الطلبات مقدمة عبر نموذج <strong>انضم كفني</strong> وتُحفظ في الجهاز. البيانات تبقى بعد إعادة التحميل.</span>
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
            <option value="approved">مقبول</option>
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
        {viewItem && (
          <div className="space-y-5">

            {/* Profile header */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow">
                {viewItem.profile_photo
                  ? <img src={viewItem.profile_photo} alt=""
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightbox(viewItem.profile_photo)} />
                  : <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white font-bold text-2xl">
                      {viewItem.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{viewItem.full_name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {CAT_LABEL[viewItem.specialty] || viewItem.specialty} • {viewItem.city}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS[viewItem.status]?.cls}`}>
                    {STATUS[viewItem.status]?.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(viewItem.created_at).toLocaleDateString('ar-LY')}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal */}
            <Sec icon={Phone} title="المعلومات الشخصية">
              <G2>
                <IC label="الاسم الكامل"   value={viewItem.full_name} />
                <IC label="رقم الهاتف"     value={viewItem.phone}     dir="ltr" />
                <IC label="واتساب"          value={viewItem.whatsapp}  dir="ltr" />
                <IC label="الرقم الوطني"   value={viewItem.national_id || '—'} />
                <IC label="المدينة"         value={viewItem.city} />
                <IC label="المنطقة / الحي" value={viewItem.area || '—'} />
              </G2>
              {viewItem.address && (
                <div className="mt-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">العنوان التفصيلي</p>
                  <p className="text-sm text-gray-700">{viewItem.address}</p>
                </div>
              )}
            </Sec>

            {/* Professional */}
            <Sec icon={Briefcase} title="المعلومات المهنية">
              <G2>
                <IC label="التخصص"         value={CAT_LABEL[viewItem.specialty] || viewItem.specialty} />
                <IC label="سنوات الخبرة"   value={EXP_LABEL[viewItem.experience] || viewItem.experience} />
                <IC label="نوع العمل"      value={viewItem.type === 'company' ? 'شركة / مؤسسة' : 'فردي'} />
                <IC label="نطاق الخدمة"   value={viewItem.service_radius ? `${viewItem.service_radius} كم` : '—'} />
                <IC label="السعر الأدنى"   value={viewItem.price_from ? `${viewItem.price_from} د.ل` : '—'} />
                <IC label="السعر الأقصى"   value={viewItem.price_to   ? `${viewItem.price_to} د.ل`   : '—'} />
              </G2>
              {viewItem.description && (
                <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">وصف الخدمة</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
                </div>
              )}
              {viewItem.certifications && (
                <div className="mt-2 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> الشهادات والمؤهلات
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">{viewItem.certifications}</p>
                </div>
              )}
            </Sec>

            {/* Availability */}
            <Sec icon={Clock} title="التوفر والجدول">
              <G2>
                <IC label="متاح الآن"
                  value={viewItem.available_now ? '✓ نعم' : '✗ لا'}
                  valueClass={viewItem.available_now ? 'text-green-600 font-semibold' : 'text-gray-500'} />
                <IC label="خدمة الطوارئ 24/7"
                  value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                  valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-gray-500'} />
                {viewItem.hours_from && <IC label="بداية العمل" value={viewItem.hours_from} dir="ltr" />}
                {viewItem.hours_to   && <IC label="نهاية العمل" value={viewItem.hours_to}   dir="ltr" />}
              </G2>
              {viewItem.working_days?.length > 0 && (
                <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2">أيام العمل</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.working_days.map(d => (
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

            {/* Portfolio */}
            {viewItem.work_images?.length > 0 ? (
              <Sec icon={Image} title={`معرض الأعمال (${viewItem.work_images.length})`}>
                <div className="grid grid-cols-3 gap-2">
                  {viewItem.work_images.map((src, i) => (
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

            {/* Documents — internal */}
            <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-500">
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-500">سرية تامة — لا تُشارك مع العملاء</p>
              </div>
              {(viewItem.id_doc_front || viewItem.id_doc_back || viewItem.work_license) ? (
                <div className="space-y-3">
                  {(viewItem.id_doc_front || viewItem.id_doc_back) && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-2">بطاقة الهوية</p>
                      <div className="grid grid-cols-2 gap-2">
                        {viewItem.id_doc_front && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">الوجه الأمامي</p>
                            <img src={viewItem.id_doc_front} alt="front"
                              className="w-full rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                              onClick={() => setLightbox(viewItem.id_doc_front)} />
                          </div>
                        )}
                        {viewItem.id_doc_back && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">الوجه الخلفي</p>
                            <img src={viewItem.id_doc_back} alt="back"
                              className="w-full rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                              onClick={() => setLightbox(viewItem.id_doc_back)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {viewItem.work_license && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">رخصة العمل / الشهادة المهنية</p>
                      <img src={viewItem.work_license} alt="license"
                        className="w-full max-h-40 rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(viewItem.work_license)} />
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
        )}
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
