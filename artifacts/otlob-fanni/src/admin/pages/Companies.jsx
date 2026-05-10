import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import {
  Eye, Building2, Phone, MapPin, Briefcase, Clock,
  Facebook, Image, FileText, Lock, Shield, Info, XCircle
} from 'lucide-react'
import { categories } from '../../data/services'
import api from '../../lib/api'

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

const DAY_AR = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
}

const CAT_LABEL = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))

export default function Companies() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const reload = () => {
    setLoading(true)
    api.admin.companies.list()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleRevoke = async (id) => {
    if (!confirm('هل تريد إلغاء الموافقة على هذه الشركة؟ ستعود إلى قائمة الطلبات.')) return
    try {
      await api.admin.companies.setStatus(id, 'pending')
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم إلغاء الموافقة وإعادة الشركة إلى قائمة الطلبات')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort()

  const filtered = data.filter(r => {
    const s = !search ||
      r.company_name?.includes(search) ||
      r.contact_name?.includes(search) ||
      r.phone?.includes(search) ||
      r.city?.includes(search)
    const c = !filterCity || r.city === filterCity
    return s && c
  })

  const columns = [
    {
      key: 'company_name', label: 'الشركة / المؤسسة',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
            {row.company_logo
              ? <img src={row.company_logo} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white text-xs font-bold rounded-xl">
                  {v?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
            }
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{v}</p>
            <p className="text-xs text-gray-400">{row.contact_name || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone', label: 'الهاتف',
      render: (v) => <span className="text-xs text-gray-600" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة', render: v => v || '—' },
    {
      key: 'specialty', label: 'التخصص',
      render: (v) => CAT_LABEL[v] || v || '—',
    },
    {
      key: 'years_active', label: 'سنوات النشاط',
      render: (v) => EXP_LABEL[v] || v || '—',
    },
    {
      key: 'created_at', label: 'تاريخ الانضمام',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—',
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleRevoke(row.id)}
            className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="إلغاء الموافقة">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>هذه الشركات تمت الموافقة عليها وأصبحت جزءاً من الدليل. يمكنك إلغاء الموافقة لإعادتها إلى قائمة الطلبات.</span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالاسم أو الهاتف أو المدينة..."
        actions={
          <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white">
            <option value="">كل المدن</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        }
        emptyMessage="لا توجد شركات مقبولة بعد — قم بالموافقة على الطلبات من صفحة طلبات الشركات"
      />

      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل الشركة"
        submitLabel="إغلاق"
        onSubmit={e => { e.preventDefault(); setViewItem(null) }}
        size="lg"
      >
        {viewItem && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white shadow">
                {viewItem.company_logo
                  ? <img src={viewItem.company_logo} alt=""
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightbox(viewItem.company_logo)} />
                  : <div className="w-full h-full bg-[#071B33] flex items-center justify-center text-white font-bold text-2xl rounded-xl">
                      {viewItem.company_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                  <h3 className="font-bold text-gray-900 text-lg">{viewItem.company_name}</h3>
                </div>
                <p className="text-sm text-gray-500">
                  {CAT_LABEL[viewItem.specialty] || viewItem.specialty} • {viewItem.city}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{viewItem.contact_name}</p>
                <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold bg-green-50 text-green-700">
                  شركة مقبولة ✓
                </span>
              </div>
            </div>

            <Sec icon={Building2} title="معلومات الشركة">
              <G2>
                <IC label="اسم الشركة"      value={viewItem.company_name} />
                <IC label="جهة التواصل"      value={viewItem.contact_name || '—'} />
                <IC label="رقم الهاتف"        value={viewItem.phone}    dir="ltr" />
                <IC label="واتساب"           value={viewItem.whatsapp} dir="ltr" />
                <IC label="السجل التجاري"     value={viewItem.commercial_reg || '—'} />
                <IC label="المدينة"           value={viewItem.city} />
                <IC label="المنطقة / الحي"    value={viewItem.area || '—'} />
                <IC label="نطاق الخدمة"      value={viewItem.service_radius ? `${viewItem.service_radius} كم` : '—'} />
              </G2>
              {viewItem.address && (
                <div className="mt-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">العنوان التفصيلي</p>
                  <p className="text-sm text-gray-700">{viewItem.address}</p>
                </div>
              )}
            </Sec>

            <Sec icon={Briefcase} title="معلومات الخدمة">
              <G2>
                <IC label="التخصص"       value={CAT_LABEL[viewItem.specialty] || viewItem.specialty} />
                <IC label="سنوات النشاط" value={EXP_LABEL[viewItem.years_active] || viewItem.years_active} />
                <IC label="السعر الأدنى"  value={viewItem.price_from ? `${viewItem.price_from} د.ل` : '—'} />
                <IC label="السعر الأقصى"  value={viewItem.price_to   ? `${viewItem.price_to} د.ل`   : '—'} />
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

            <Sec icon={Clock} title="التوفر والجدول">
              <G2>
                <IC label="متاح الآن"
                  value={viewItem.available_now ? '✓ نعم' : '✗ لا'}
                  valueClass={viewItem.available_now ? 'text-green-600 font-semibold' : 'text-gray-500'} />
                <IC label="خدمة الطوارئ 24/7"
                  value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                  valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-gray-500'} />
                {viewItem.hours_from && <IC label="بداية الدوام" value={viewItem.hours_from} dir="ltr" />}
                {viewItem.hours_to   && <IC label="نهاية الدوام" value={viewItem.hours_to}   dir="ltr" />}
              </G2>
              {viewItem.working_days?.length > 0 && (
                <div className="mt-2.5 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2">أيام العمل</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.working_days.map(d => (
                      <span key={d} className="bg-[#071B33] text-white text-xs px-2.5 py-1 rounded-lg">{DAY_AR[d] || d}</span>
                    ))}
                  </div>
                </div>
              )}
            </Sec>

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

            {viewItem.work_images?.length > 0 && (
              <Sec icon={Image} title={`معرض الأعمال (${viewItem.work_images.length})`}>
                <div className="grid grid-cols-3 gap-2">
                  {viewItem.work_images.map((src, i) => (
                    <img key={i} src={src} alt={`صورة ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90"
                      onClick={() => setLightbox(src)} />
                  ))}
                </div>
              </Sec>
            )}

            <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-500">
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-500">سرية تامة — لا تُشارك مع العملاء</p>
              </div>
              {(viewItem.commercial_doc || viewItem.work_license) ? (
                <div className="space-y-3">
                  {viewItem.commercial_doc && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">السجل التجاري / الترخيص</p>
                      <img src={viewItem.commercial_doc} alt="commercial"
                        className="w-full max-h-40 rounded-xl border object-cover cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(viewItem.commercial_doc)} />
                    </div>
                  )}
                  {viewItem.work_license && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
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

            <button
              onClick={() => { handleRevoke(viewItem.id) }}
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
              إلغاء الموافقة وإعادة إلى قائمة الطلبات
            </button>
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
