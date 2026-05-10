import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import {
  Eye, Trash2, Info, AlertCircle, Phone, Briefcase, Clock,
  Facebook, Image, Lock, User, Instagram, MapPin, FileText, Shield
} from 'lucide-react'

const DEMO_KEY  = 'demo_join_requests_v1'
const TECHS_KEY = 'demo_technicians_v1'

const CITY_ID_MAP = {
  'طرابلس':'c1','بنغازي':'c2','مصراتة':'c3','الزاوية':'c4','سبها':'c5',
  'زوارة':'c6','زليتن':'c7','الخمس':'c8','سرت':'c9','طبرق':'c10',
  'Tripoli':'c1','Benghazi':'c2','Misrata':'c3','Zawiya':'c4','Sabha':'c5',
  'Zuwara':'c6','Zliten':'c7','Al Khoms':'c8','Sirte':'c9','Tobruk':'c10',
}
const CAT_ID_MAP = {
  'سباكة':'k1','plumbing':'k1','كهرباء':'k2','electricity':'k2',
  'تكييف':'k3','ac':'k3','نجارة':'k4','carpentry':'k4',
  'دهانات':'k5','painting':'k5','تنظيف':'k6','cleaning':'k6',
  'نقل أثاث':'k7','moving':'k7','كاميرات مراقبة':'k8','cctv':'k8',
  'شبكات وإنترنت':'k9','networks':'k9','صيانة عامة':'k10','maintenance':'k10',
  'أجهزة منزلية':'k11','appliances':'k11','حدادة':'k12','welding':'k12',
}
const parseExperience = (exp) => {
  if (!exp) return 0
  if (exp === 'less1' || exp.includes('أقل') || exp.includes('Less')) return 0
  if (exp === '10+' || exp.includes('10+') || exp.includes('أكثر')) return 11
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
  profile_photo:    req.profile_photo || null,
  is_featured:      false,
  is_approved:      true,
  is_active:        true,
  created_at:       new Date().toISOString(),
})

const DEMO_SEED = [
  {
    id: 'jr1', full_name: 'فيصل الورفلي', phone: '+218911111111', whatsapp: '+218911111111',
    national_id: '1-1234-567890-1', specialty: 'سباكة', city: 'طرابلس', area: 'حي الأندلس',
    address: 'شارع عمر المختار، بناية 12', experience: '6-10', type: 'individual',
    description: 'خبرة 7 سنوات في أعمال السباكة والصيانة المنزلية الشاملة',
    certifications: 'شهادة فنية من معهد التدريب المهني طرابلس',
    price_from: '80', price_to: '400', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday'],
    hours_from: '08:00', hours_to: '18:00', service_radius: '30',
    emergency: true, facebook: '', instagram: '',
    profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'pending', created_at: '2026-05-08T09:00:00Z',
  },
  {
    id: 'jr2', full_name: 'نجم الدين فرج', phone: '+218922222222', whatsapp: '+218922222222',
    national_id: '1-2345-678901-2', specialty: 'كهرباء', city: 'بنغازي', area: 'السابع',
    address: 'شارع الجمهورية، مبنى 5', experience: '3-5', type: 'individual',
    description: 'كهربائي معتمد، تركيب وصيانة لوحات كهربائية وإضاءة LED',
    certifications: 'معتمد من شركة العامة للكهرباء',
    price_from: '100', price_to: '600', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday'],
    hours_from: '09:00', hours_to: '20:00', service_radius: '50',
    emergency: false, facebook: 'https://facebook.com/najm.faraj', instagram: '',
    profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'approved', created_at: '2026-05-07T14:00:00Z',
  },
  {
    id: 'jr3', full_name: 'عادل بوعزة', phone: '+218933333333', whatsapp: '+218933333333',
    national_id: '1-3456-789012-3', specialty: 'تكييف', city: 'مصراتة', area: 'الشارع الرئيسي',
    address: 'حي الكورنيش', experience: '6-10', type: 'company',
    description: 'شركة متخصصة في صيانة وتركيب أجهزة التكييف المركزي والسبليت',
    certifications: 'وكيل معتمد لشركة Gree و Midea',
    price_from: '150', price_to: '1000', available_now: false,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday'],
    hours_from: '08:00', hours_to: '17:00', service_radius: '80',
    emergency: true, facebook: '', instagram: 'https://instagram.com/adel_ac',
    profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'pending', created_at: '2026-05-06T11:30:00Z',
  },
  {
    id: 'jr4', full_name: 'سليمان الزروق', phone: '+218944444444', whatsapp: '+218944444444',
    national_id: '1-4567-890123-4', specialty: 'نجارة', city: 'الزاوية', area: 'وسط المدينة',
    address: 'سوق الجمعة', experience: '1-2', type: 'individual',
    description: 'نجارة ديكور وأثاث منزلي',
    certifications: '',
    price_from: '60', price_to: '300', available_now: true,
    working_days: ['Saturday','Sunday','Monday'],
    hours_from: '09:00', hours_to: '16:00', service_radius: '20',
    emergency: false, facebook: '', instagram: '',
    profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'rejected', created_at: '2026-05-05T08:00:00Z',
  },
  {
    id: 'jr5', full_name: 'إبراهيم الأسود', phone: '+218955555555', whatsapp: '+218966666666',
    national_id: '1-5678-901234-5', specialty: 'دهانات', city: 'سبها', area: 'حي النصر',
    address: 'شارع النصر، مقابل المسجد الكبير', experience: '3-5', type: 'individual',
    description: 'دهانات داخلية وخارجية، ديكور جبس بورد',
    certifications: 'دورة دهانات احترافية – 2023',
    price_from: '70', price_to: '350', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],
    hours_from: '07:00', hours_to: '19:00', service_radius: '60',
    emergency: false, facebook: 'https://facebook.com/ibrahim.alaswd', instagram: '',
    profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'pending', created_at: '2026-05-04T16:00:00Z',
  },
]

const DAY_LABELS = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
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
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [viewItem, setViewItem]   = useState(null)
  const [lightbox, setLightbox]   = useState(null)
  const [toast, setToast]         = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (isDemoMode) { setData(loadDemo()); setLoading(false) }
  }, [isDemoMode])

  const persist = (next) => { setData(next); saveDemo(next) }

  const setRequestStatus = (id, status) => {
    const request = data.find(r => r.id === id)
    persist(data.map(r => r.id === id ? { ...r, status } : r))
    if (status === 'approved' && request) {
      try {
        const existing = JSON.parse(localStorage.getItem(TECHS_KEY) || 'null')
        const techList = Array.isArray(existing) ? existing : []
        localStorage.setItem(TECHS_KEY, JSON.stringify([joinRequestToTechnician(request), ...techList]))
        showToast('✓ تم قبول الطلب وإضافة الفني تلقائياً')
      } catch (_) { showToast('تم قبول الطلب') }
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
    const s = !search || r.full_name?.includes(search) || r.phone?.includes(search) || r.city?.includes(search) || r.specialty?.includes(search)
    const f = !statusFilter || r.status === statusFilter
    return s && f
  })

  const pendingCount = data.filter(r => r.status === 'pending').length

  const columns = [
    {
      key: 'full_name', label: 'مقدم الطلب',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
            {row.profile_photo ? (
              <img src={row.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white text-xs font-bold">
                {v?.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{v}</p>
            <p className="text-xs text-gray-400" dir="ltr">{row.phone}</p>
          </div>
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
              <button onClick={() => setRequestStatus(row.id, 'approved')} className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium">قبول</button>
              <button onClick={() => setRequestStatus(row.id, 'rejected')} className="px-2 py-1 text-xs bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors font-medium">رفض</button>
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

      {isDemoMode && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>وضع تجريبي — يمكنك تجربة تقديم طلب من صفحة <strong>انضم كفني</strong> وسيظهر هنا مباشرةً.</span>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>يوجد <strong>{pendingCount}</strong> {pendingCount === 1 ? 'طلب' : 'طلبات'} قيد المراجعة بانتظار اتخاذ قرار.</span>
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
          <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        }
        emptyMessage="لا توجد طلبات انضمام"
      />

      {/* ── Detail Modal ─────────────────────────────────────────────── */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل طلب الانضمام"
        submitLabel={viewItem?.status === 'pending' ? 'قبول الطلب ✓' : 'إغلاق'}
        onSubmit={viewItem?.status === 'pending'
          ? (e) => { e.preventDefault(); setRequestStatus(viewItem.id, 'approved') }
          : (e) => { e.preventDefault(); setViewItem(null) }
        }
        size="lg"
      >
        {viewItem && (
          <div className="space-y-5">

            {/* ── Profile header ── */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow">
                {viewItem.profile_photo ? (
                  <img
                    src={viewItem.profile_photo}
                    alt="" className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setLightbox(viewItem.profile_photo)}
                  />
                ) : (
                  <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white font-bold text-2xl">
                    {viewItem.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{viewItem.full_name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{viewItem.specialty} • {viewItem.city}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_LABELS[viewItem.status]?.cls}`}>
                    {STATUS_LABELS[viewItem.status]?.label}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(viewItem.created_at).toLocaleDateString('ar-LY')}</span>
                </div>
              </div>
            </div>

            {/* ── Personal info ── */}
            <Section icon={User} title="المعلومات الشخصية">
              <Grid2>
                <InfoCell label="الاسم الكامل"       value={viewItem.full_name} />
                <InfoCell label="رقم الهاتف"         value={viewItem.phone}      dir="ltr" />
                <InfoCell label="واتساب"              value={viewItem.whatsapp}   dir="ltr" />
                <InfoCell label="الرقم الوطني"        value={viewItem.national_id || '—'} />
                <InfoCell label="المدينة"             value={viewItem.city} />
                <InfoCell label="المنطقة / الحي"      value={viewItem.area || '—'} />
              </Grid2>
              {viewItem.address && (
                <div className="mt-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">العنوان التفصيلي</p>
                  <p className="text-sm text-gray-700">{viewItem.address}</p>
                </div>
              )}
            </Section>

            {/* ── Professional info ── */}
            <Section icon={Briefcase} title="المعلومات المهنية">
              <Grid2>
                <InfoCell label="التخصص"             value={viewItem.specialty} />
                <InfoCell label="سنوات الخبرة"        value={viewItem.experience} />
                <InfoCell label="نوع العمل"           value={viewItem.type === 'company' ? 'شركة / مؤسسة' : 'فردي'} />
                <InfoCell label="نطاق الخدمة"         value={viewItem.service_radius ? `${viewItem.service_radius} كم` : '—'} />
                <InfoCell label="السعر الأدنى"        value={viewItem.price_from ? `${viewItem.price_from} د.ل` : '—'} />
                <InfoCell label="السعر الأقصى"        value={viewItem.price_to   ? `${viewItem.price_to} د.ل`   : '—'} />
              </Grid2>
              {viewItem.description && (
                <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">وصف الخدمة</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
                </div>
              )}
              {viewItem.certifications && (
                <div className="mt-2 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-400 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> الشهادات والمؤهلات</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{viewItem.certifications}</p>
                </div>
              )}
            </Section>

            {/* ── Availability ── */}
            <Section icon={Clock} title="التوفر والجدول">
              <Grid2>
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
                {viewItem.hours_from && <InfoCell label="بداية العمل" value={viewItem.hours_from} dir="ltr" />}
                {viewItem.hours_to   && <InfoCell label="نهاية العمل" value={viewItem.hours_to}   dir="ltr" />}
              </Grid2>
              {viewItem.working_days?.length > 0 && (
                <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2">أيام العمل</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.working_days.map(d => (
                      <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">{DAY_LABELS[d] || d}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* ── Social media ── */}
            {(viewItem.facebook || viewItem.instagram) && (
              <Section icon={Facebook} title="التواصل الاجتماعي">
                {viewItem.facebook && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-2">
                    <p className="text-xs text-gray-400 mb-0.5">فيسبوك</p>
                    <a href={viewItem.facebook} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline break-all" dir="ltr">{viewItem.facebook}</a>
                  </div>
                )}
                {viewItem.instagram && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">إنستغرام</p>
                    <a href={viewItem.instagram} target="_blank" rel="noreferrer" className="text-sm text-pink-500 hover:underline break-all" dir="ltr">{viewItem.instagram}</a>
                  </div>
                )}
              </Section>
            )}

            {/* ── Work portfolio ── */}
            {viewItem.work_images?.length > 0 ? (
              <Section icon={Image} title={`معرض الأعمال (${viewItem.work_images.length} صور)`}>
                <div className="grid grid-cols-3 gap-2">
                  {viewItem.work_images.map((src, i) => (
                    <img key={i} src={src} alt={`صورة ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                      onClick={() => setLightbox(src)}
                    />
                  ))}
                </div>
              </Section>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-gray-400">
                <Image className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">لم يتم رفع صور من الأعمال</p>
              </div>
            )}

            {/* ── Official Documents (internal) ── */}
            <Section icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-600">
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
                            <img src={viewItem.id_doc_front} alt="ID front"
                              className="w-full rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                              onClick={() => setLightbox(viewItem.id_doc_front)}
                            />
                          </div>
                        )}
                        {viewItem.id_doc_back && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">الوجه الخلفي</p>
                            <img src={viewItem.id_doc_back} alt="ID back"
                              className="w-full rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                              onClick={() => setLightbox(viewItem.id_doc_back)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {viewItem.work_license && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">رخصة العمل / الشهادة المهنية</p>
                      <img src={viewItem.work_license} alt="work license"
                        className="w-full rounded-xl border object-cover max-h-40 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(viewItem.work_license)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-gray-400">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                </div>
              )}
            </Section>

            {/* ── Reject button ── */}
            {viewItem.status === 'pending' && (
              <button
                onClick={() => { setRequestStatus(viewItem.id, 'rejected'); setViewItem(null) }}
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

/* ── Sub-components ────────────────────────────────────────────────────── */

function Section({ icon: Icon, title, titleClass, children }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${titleClass || 'text-gray-400'}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {children}
    </div>
  )
}
function Grid2({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
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
