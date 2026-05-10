import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, Info, AlertCircle, Phone, MapPin, Briefcase, Clock, Star, Zap, Facebook, CheckCircle, XCircle, Image } from 'lucide-react'

const DEMO_KEY      = 'demo_join_requests_v1'
const TECHS_KEY     = 'demo_technicians_v1'

const CITY_ID_MAP = {
  'طرابلس': 'c1', 'بنغازي': 'c2', 'مصراتة': 'c3',
  'الزاوية': 'c4', 'سبها': 'c5', 'زوارة': 'c6',
  'زليتن': 'c7', 'الخمس': 'c8', 'سرت': 'c9', 'طبرق': 'c10',
}
const CAT_ID_MAP = {
  'سباكة': 'k1', 'plumbing': 'k1',
  'كهرباء': 'k2', 'electricity': 'k2',
  'تكييف': 'k3', 'ac': 'k3', 'ac services': 'k3',
  'نجارة': 'k4', 'carpentry': 'k4',
  'دهانات': 'k5', 'painting': 'k5', 'دهان': 'k5',
  'تنظيف': 'k6', 'cleaning': 'k6',
  'نقل أثاث': 'k7', 'furniture moving': 'k7',
  'كاميرات مراقبة': 'k8', 'cctv': 'k8',
  'شبكات وإنترنت': 'k9', 'networks & internet': 'k9',
  'صيانة عامة': 'k10', 'general maintenance': 'k10',
  'أجهزة منزلية': 'k11', 'home appliances': 'k11',
  'حدادة': 'k12', 'welding': 'k12',
}
const parseExperience = (exp) => {
  if (!exp) return 0
  if (exp.includes('أقل') || exp.includes('Less')) return 0
  if (exp.includes('10+') || exp.includes('أكثر')) return 11
  const nums = exp.match(/\d+/g)
  if (nums) return parseInt(nums[nums.length - 1]) || 0
  return 0
}

const joinRequestToTechnician = (req) => ({
  id:               't' + Date.now() + Math.random().toString(36).slice(2, 6),
  name_ar:          req.full_name || '',
  name_en:          '',
  phone:            req.phone || '',
  whatsapp:         req.whatsapp || req.phone || '',
  city_id:          CITY_ID_MAP[req.city] || 'c1',
  category_id:      CAT_ID_MAP[(req.specialty || '').toLowerCase()] || CAT_ID_MAP[req.specialty] || 'k10',
  experience_years: parseExperience(req.experience),
  price_from:       parseFloat(req.price_from) || 0,
  status:           req.available_now ? 'available' : 'inactive',
  description_ar:   req.description || '',
  description_en:   '',
  is_featured:      false,
  is_approved:      true,
  is_active:        true,
  created_at:       new Date().toISOString(),
})

const DEMO_SEED = [
  {
    id: 'jr1', full_name: 'فيصل الورفلي', phone: '+218911111111', whatsapp: '+218911111111',
    specialty: 'سباكة', city: 'طرابلس', area: 'حي الأندلس',
    experience: '6-10', type: 'individual', description: 'خبرة 7 سنوات في أعمال السباكة والصيانة المنزلية الشاملة',
    price_from: '80', available_now: true, working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday'],
    emergency: true, facebook: '', status: 'pending', created_at: '2026-05-08T09:00:00Z',
  },
  {
    id: 'jr2', full_name: 'نجم الدين فرج', phone: '+218922222222', whatsapp: '+218922222222',
    specialty: 'كهرباء', city: 'بنغازي', area: 'السابع',
    experience: '3-5', type: 'individual', description: 'كهربائي معتمد، تركيب وصيانة لوحات كهربائية وإضاءة LED',
    price_from: '100', available_now: true, working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday'],
    emergency: false, facebook: 'https://facebook.com/najm.faraj', status: 'approved', created_at: '2026-05-07T14:00:00Z',
  },
  {
    id: 'jr3', full_name: 'عادل بوعزة', phone: '+218933333333', whatsapp: '+218933333333',
    specialty: 'تكييف', city: 'مصراتة', area: 'الشارع الرئيسي',
    experience: '6-10', type: 'company', description: 'شركة متخصصة في صيانة وتركيب أجهزة التكييف المركزي والسبليت',
    price_from: '150', available_now: false, working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday'],
    emergency: true, facebook: '', status: 'pending', created_at: '2026-05-06T11:30:00Z',
  },
  {
    id: 'jr4', full_name: 'سليمان الزروق', phone: '+218944444444', whatsapp: '+218944444444',
    specialty: 'نجارة', city: 'الزاوية', area: 'وسط المدينة',
    experience: '1-2', type: 'individual', description: 'نجارة ديكور وأثاث منزلي',
    price_from: '60', available_now: true, working_days: ['Saturday','Sunday','Monday'],
    emergency: false, facebook: '', status: 'rejected', created_at: '2026-05-05T08:00:00Z',
  },
  {
    id: 'jr5', full_name: 'إبراهيم الأسود', phone: '+218955555555', whatsapp: '+218966666666',
    specialty: 'دهانات', city: 'سبها', area: 'حي النصر',
    experience: '3-5', type: 'individual', description: 'دهانات داخلية وخارجية، ديكور جبس بورد',
    price_from: '70', available_now: true, working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],
    emergency: false, facebook: 'https://facebook.com/ibrahim.alaswd', status: 'pending', created_at: '2026-05-04T16:00:00Z',
  },
]

const DAY_LABELS = {
  Saturday: 'السبت', Sunday: 'الأحد', Monday: 'الاثنين',
  Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة',
}

const STATUS_LABELS = {
  pending:  { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-600' },
  approved: { label: 'مقبول',        cls: 'bg-green-50 text-green-600' },
  rejected: { label: 'مرفوض',        cls: 'bg-red-50 text-red-500'   },
}

const loadDemo = () => {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return DEMO_SEED
}
const saveDemo = (list) => {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)) } catch (_) {}
}

export default function JoinRequests() {
  const { isDemoMode } = useAdmin()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (isDemoMode) {
      setData(loadDemo())
      setLoading(false)
    }
  }, [isDemoMode])

  const persist = (next) => { setData(next); saveDemo(next) }

  const setStatus = (id, status) => {
    const request = data.find(r => r.id === id)
    persist(data.map(r => r.id === id ? { ...r, status } : r))

    if (status === 'approved' && request) {
      try {
        const existing = JSON.parse(localStorage.getItem(TECHS_KEY) || 'null')
        const techList = Array.isArray(existing) ? existing : []
        const newTech = joinRequestToTechnician(request)
        localStorage.setItem(TECHS_KEY, JSON.stringify([newTech, ...techList]))
        showToast('✓ تم قبول الطلب وإضافة الفني تلقائياً')
      } catch (_) {
        showToast('تم قبول الطلب')
      }
    } else {
      showToast('تم رفض الطلب')
    }

    if (viewItem?.id === id) setViewItem(v => ({ ...v, status }))
  }

  const handleDelete = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    persist(data.filter(r => r.id !== id))
    showToast('تم حذف الطلب')
    if (viewItem?.id === id) setViewItem(null)
  }

  const filtered = data.filter(r => {
    const matchSearch = !search || r.full_name?.includes(search) || r.phone?.includes(search) || r.city?.includes(search) || r.specialty?.includes(search)
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'full_name', label: 'مقدم الطلب',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800">{v}</p>
          <p className="text-xs text-gray-400" dir="ltr">{row.phone}</p>
        </div>
      )
    },
    { key: 'specialty', label: 'التخصص' },
    { key: 'city',      label: 'المدينة' },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS_LABELS[v] || STATUS_LABELS.pending
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      }
    },
    {
      key: 'created_at', label: 'تاريخ الطلب',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—'
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => setStatus(row.id, 'approved')} className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium">قبول</button>
              <button onClick={() => setStatus(row.id, 'rejected')} className="px-2 py-1 text-xs bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors font-medium">رفض</button>
            </>
          )}
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  if (!isDemoMode) return <NotConfigured />

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {isDemoMode && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>وضع تجريبي — التعديلات لا تُحفظ في قاعدة البيانات. يمكنك تجربة تقديم طلب من صفحة <strong>انضم كفني</strong> وسيظهر هنا مباشرةً.</span>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>يوجد <strong>{pendingCount}</strong> {pendingCount === 1 ? 'طلب' : 'طلبات'} قيد المراجعة بانتظار الاتخاذ قرار.</span>
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
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        }
        emptyMessage="لا توجد طلبات انضمام"
      />

      {/* View Detail Modal */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل طلب الانضمام"
        submitLabel={viewItem?.status === 'pending' ? 'قبول الطلب' : 'إغلاق'}
        onSubmit={viewItem?.status === 'pending'
          ? (e) => { e.preventDefault(); setStatus(viewItem.id, 'approved') }
          : (e) => { e.preventDefault(); setViewItem(null) }
        }
        size="lg"
      >
        {viewItem && (
          <div className="space-y-5">

            {/* Status bar */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">الحالة:</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_LABELS[viewItem.status]?.cls}`}>
                  {STATUS_LABELS[viewItem.status]?.label}
                </span>
              </div>
              <span className="text-xs text-gray-400">{new Date(viewItem.created_at).toLocaleDateString('ar-LY')}</span>
            </div>

            {/* Personal info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> معلومات شخصية</p>
              <div className="grid grid-cols-2 gap-2.5">
                <InfoCell label="الاسم الكامل"     value={viewItem.full_name} />
                <InfoCell label="رقم الهاتف"       value={viewItem.phone}     dir="ltr" />
                <InfoCell label="واتساب"            value={viewItem.whatsapp}  dir="ltr" />
                <InfoCell label="المدينة"           value={viewItem.city} />
                {viewItem.area && <InfoCell label="المنطقة / الحي" value={viewItem.area} />}
              </div>
            </div>

            {/* Professional info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> معلومات مهنية</p>
              <div className="grid grid-cols-2 gap-2.5">
                <InfoCell label="التخصص"           value={viewItem.specialty} />
                <InfoCell label="سنوات الخبرة"      value={viewItem.experience} />
                <InfoCell label="نوع العمل"         value={viewItem.type === 'company' ? 'شركة' : 'فردي'} />
                <InfoCell label="السعر الابتدائي"   value={viewItem.price_from ? `${viewItem.price_from} د.ل` : '—'} />
              </div>
              {viewItem.description && (
                <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">وصف الخدمة</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> التوفر والجدول</p>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <InfoCell
                  label="متاح الآن"
                  value={viewItem.available_now ? '✓ نعم' : '✗ لا'}
                  valueClass={viewItem.available_now ? 'text-green-600 font-semibold' : 'text-gray-500'}
                />
                <InfoCell
                  label="خدمة الطوارئ 24/7"
                  value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                  valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-gray-500'}
                />
              </div>
              {viewItem.working_days?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2">أيام العمل</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.working_days.map(d => (
                      <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">{DAY_LABELS[d] || d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facebook */}
            {viewItem.facebook && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5" /> معلومات إضافية</p>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">صفحة فيسبوك</p>
                  <a href={viewItem.facebook} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline break-all" dir="ltr">{viewItem.facebook}</a>
                </div>
              </div>
            )}

            {/* Work Images */}
            {viewItem.work_images?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> صور من الأعمال ({viewItem.work_images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {viewItem.work_images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={src}
                        alt={`صورة ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No images notice */}
            {(!viewItem.work_images || viewItem.work_images.length === 0) && (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-gray-400">
                <Image className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">لم يتم رفع أي صور من الأعمال</p>
              </div>
            )}

            {/* Reject button */}
            {viewItem.status === 'pending' && (
              <button
                onClick={() => { setStatus(viewItem.id, 'rejected'); setViewItem(null) }}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                رفض الطلب
              </button>
            )}
          </div>
        )}
      </FormModal>
    </div>
  )
}

function InfoCell({ label, value, dir, valueClass }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-medium text-gray-800 text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-white rounded-2xl p-8 border border-amber-200 max-w-md">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-1">لم يتم ربط قاعدة البيانات</h3>
        <p className="text-gray-500 text-sm">أضف مفاتيح Supabase في إعدادات المشروع</p>
      </div>
    </div>
  )
}
