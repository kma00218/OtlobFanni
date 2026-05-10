import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, Wrench, RefreshCw, SlidersHorizontal, UserCheck, Phone, Star } from 'lucide-react'

const PAGE_SIZE = 15

const STATUS_MAP = {
  new:         { label: 'جديد',        cls: 'bg-orange-50 text-[#FF7900]'   },
  assigned:    { label: 'مُسند',       cls: 'bg-blue-50   text-blue-600'    },
  contacted:   { label: 'تم التواصل', cls: 'bg-sky-50    text-sky-600'     },
  in_progress: { label: 'جارٍ',        cls: 'bg-purple-50 text-purple-600'  },
  completed:   { label: 'مكتمل',      cls: 'bg-green-50  text-green-600'   },
  cancelled:   { label: 'ملغي',       cls: 'bg-red-50    text-red-500'     },
}

const URGENCY_MAP = {
  normal:    { label: 'عادي',  cls: 'text-gray-500'          },
  urgent:    { label: 'عاجل',  cls: 'text-orange-500'        },
  emergency: { label: 'طارئ',  cls: 'text-red-600 font-bold' },
}

// slug ← category_id (demo_technicians_v1 uses k-ids; request uses slugs)
const CAT_ID_TO_SLUG = {
  k1: 'electricity', k2: 'plumbing',    k3: 'ac',          k4: 'painting',
  k5: 'carpentry',   k6: 'cleaning',    k7: 'moving',      k8: 'cctv',
  k9: 'networks',    k10: 'maintenance', k11: 'appliances', k12: 'welding',
}

const REQ_KEY = 'serviceRequests'
const ls = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const loadRequests = () => ls(REQ_KEY)
const loadCities   = () => ls('demo_cities_v1')
const saveRequests = (list) => { try { localStorage.setItem(REQ_KEY, JSON.stringify(list)) } catch {} }

// جلب الفنيين المؤهلين لطلب معين (مدينة + تخصص + نشط + معتمد)
function getEligibleTechs(req, cities) {
  const cityObj    = cities.find(c => c.id === req.city)
  const cityNameAr = cityObj?.name_ar || ''
  const catSlug    = req.categoryId || ''

  // فنيون معتمدون (technicians) — يستخدمون city=اسم عربي، category=slug
  const approved = ls('technicians')
    .filter(t =>
      t.is_active  === true &&
      t.is_approved === true &&
      t.status !== 'inactive' &&
      t.city     === cityNameAr &&
      t.category === catSlug
    )
    .map(t => ({
      id:        t.id,
      name_ar:   t.name_ar || t.name || '',
      phone:     t.phone    || '',
      whatsapp:  t.whatsapp || t.phone || '',
      photo:     t.photo    || null,
      rating:    t.rating   || null,
      source:    'approved',
    }))

  // فنيو الأدمن (demo_technicians_v1) — يستخدمون city_id وcategory_id
  const adminTechs = ls('demo_technicians_v1')
    .filter(t =>
      t.is_active  === true &&
      t.is_approved === true &&
      t.status !== 'inactive' &&
      t.city_id     === req.city &&
      CAT_ID_TO_SLUG[t.category_id] === catSlug
    )
    .map(t => ({
      id:       t.id,
      name_ar:  t.name_ar || '',
      phone:    t.phone    || '',
      whatsapp: t.whatsapp || t.phone || '',
      photo:    t.photo    || null,
      rating:   t.rating   || null,
      source:   'admin',
    }))

  return [...approved, ...adminTechs]
}

export default function Requests() {
  const { isSuperAdmin, cityId: adminCityId } = useAdmin()

  const [data,         setData]         = useState([])
  const [cities,       setCities]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterCity,   setFilterCity]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page,         setPage]         = useState(1)

  const [viewItem,   setViewItem]   = useState(null)
  const [editItem,   setEditItem]   = useState(null)
  const [newStatus,  setNewStatus]  = useState('')
  const [assignItem, setAssignItem] = useState(null)   // طلب لإسناد فني
  const [eligibles,  setEligibles]  = useState([])    // فنيون مؤهلون
  const [selectedTechId, setSelectedTechId] = useState('')

  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    const c = loadCities()
    setCities(c)
    setData(loadRequests())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const persist = (next) => { setData(next); saveRequests(next) }

  const cityName = (cityId) => cities.find(c => c.id === cityId)?.name_ar || cityId || '—'

  const visible = data.filter(r => {
    if (!isSuperAdmin && adminCityId && r.city !== adminCityId) return false
    if (filterCity   && r.city   !== filterCity)   return false
    if (filterStatus && r.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !r.customerName?.toLowerCase().includes(q) &&
        !r.customerPhone?.includes(q)              &&
        !r.categoryNameAr?.includes(q)
      ) return false
    }
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const pagedData  = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(visible.length / PAGE_SIZE) || 1

  // ── تغيير الحالة ──
  const handleStatusUpdate = (e) => {
    e.preventDefault()
    setSaving(true)
    persist(data.map(r =>
      r.id === editItem.id
        ? { ...r, status: newStatus, updatedAt: new Date().toISOString() }
        : r
    ))
    showToast('تم تحديث الحالة')
    setEditItem(null)
    setSaving(false)
  }

  // ── فتح مودال إسناد الفني ──
  const openAssign = (row) => {
    const list = getEligibleTechs(row, cities)
    setEligibles(list)
    setSelectedTechId(list[0]?.id || '')
    setAssignItem(row)
  }

  // ── تأكيد الإسناد ──
  const handleAssign = (e) => {
    e.preventDefault()
    if (!selectedTechId) { showToast('اختر فنياً أولاً', 'error'); return }
    const tech = eligibles.find(t => t.id === selectedTechId)
    if (!tech) return
    setSaving(true)
    persist(data.map(r =>
      r.id === assignItem.id
        ? {
            ...r,
            status:                   'assigned',
            assignedTechnicianId:     tech.id,
            assignedTechnicianName:   tech.name_ar,
            assignedTechnicianPhone:  tech.phone,
            assignedTechnicianWhatsapp: tech.whatsapp,
            assignedTechnicianPhoto:  tech.photo || null,
            updatedAt: new Date().toISOString(),
          }
        : r
    ))
    showToast('تم إسناد الفني بنجاح')
    setAssignItem(null)
    setSaving(false)
  }

  // ── حذف ──
  const handleDelete = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    persist(data.filter(r => r.id !== id))
    showToast('تم حذف الطلب')
  }

  const columns = [
    {
      key: 'customerName', label: 'العميل',
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800 text-sm">{v || '—'}</p>
          <p className="text-xs text-gray-400" dir="ltr">{row.customerPhone || '—'}</p>
        </div>
      )
    },
    {
      key: 'city', label: 'المدينة',
      render: (v, row) => (
        <div>
          <p className="text-sm text-gray-700">{cityName(v)}</p>
          {row.area && <p className="text-xs text-gray-400">{row.area}</p>}
        </div>
      )
    },
    {
      key: 'categoryNameAr', label: 'التخصص',
      render: (v) => <span className="text-sm text-gray-700">{v || '—'}</span>
    },
    {
      key: 'urgency', label: 'الأولوية',
      render: (v) => {
        const u = URGENCY_MAP[v]
        return u
          ? <span className={`text-xs font-medium ${u.cls}`}>{u.label}</span>
          : <span className="text-xs text-gray-400">—</span>
      }
    },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS_MAP[v] || { label: '—', cls: 'bg-gray-100 text-gray-500' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      }
    },
    {
      key: 'createdAt', label: 'التاريخ',
      render: (v) => v ? new Date(v).toLocaleDateString('ar-LY') : '—'
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
            title="عرض التفاصيل"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openAssign(row)}
            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
            title="إسناد فني"
            data-testid="assign-btn"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setEditItem(row); setNewStatus(row.status) }}
            className="p-1.5 hover:bg-[#FF7900]/10 text-[#FF7900] rounded-lg transition-colors"
            title="تغيير الحالة"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* فلاتر */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {isSuperAdmin && (
            <select
              value={filterCity}
              onChange={e => { setFilterCity(e.target.value); setPage(1) }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white"
            >
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white"
          >
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 flex-1">{visible.length} طلب</span>
          <button
            onClick={load}
            className="p-2 hover:bg-gray-50 text-gray-500 rounded-xl border border-gray-200 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* الجدول */}
      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        searchPlaceholder="بحث بالاسم أو الهاتف أو التخصص..."
        emptyMessage="لا توجد طلبات"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* مودال: عرض التفاصيل */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل الطلب"
        onSubmit={e => { e.preventDefault(); setViewItem(null) }}
        submitLabel="إغلاق"
        size="md"
      >
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['العميل',       viewItem.customerName],
                ['الهاتف',       viewItem.customerPhone],
                ['المدينة',      cityName(viewItem.city)],
                ['المنطقة',      viewItem.area],
                ['التخصص',       viewItem.categoryNameAr],
                ['الأولوية',     URGENCY_MAP[viewItem.urgency]?.label || '—'],
                ['الوقت المفضل', viewItem.preferredTime || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-medium text-gray-800 text-sm">{v || '—'}</p>
                </div>
              ))}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">الحالة</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[viewItem.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_MAP[viewItem.status]?.label || '—'}
                </span>
              </div>
            </div>
            {viewItem.assignedTechnicianName && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">الفني المُسند</p>
                <p className="text-sm font-medium text-gray-800">{viewItem.assignedTechnicianName}</p>
                {viewItem.assignedTechnicianPhone && (
                  <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{viewItem.assignedTechnicianPhone}</p>
                )}
              </div>
            )}
            {viewItem.problemDescription && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">وصف المشكلة</p>
                <p className="text-sm text-gray-700 leading-relaxed">{viewItem.problemDescription}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-left" dir="ltr">
              {viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString('ar-LY') : ''}
            </p>
          </div>
        )}
      </FormModal>

      {/* مودال: إسناد فني */}
      <FormModal
        open={!!assignItem}
        onClose={() => setAssignItem(null)}
        title="إسناد فني للطلب"
        onSubmit={handleAssign}
        loading={saving}
        submitLabel="إسناد الفني"
        size="md"
      >
        {assignItem && (
          <div className="space-y-4">
            {/* ملخص الطلب */}
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="text-xs text-gray-400 mb-1">الطلب</p>
              <p className="font-medium text-gray-800">
                {assignItem.customerName} — {assignItem.categoryNameAr}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {cityName(assignItem.city)}{assignItem.area ? ` · ${assignItem.area}` : ''}
              </p>
            </div>

            {/* قائمة الفنيين */}
            {eligibles.length === 0 ? (
              <div className="text-center py-6">
                <Wrench className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">لا يوجد فنيون متاحون</p>
                <p className="text-xs text-gray-400 mt-1">
                  لا يوجد فنيون نشطون ومعتمدون في هذه المدينة لهذا التخصص
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">{eligibles.length} فني متاح</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {eligibles.map(tech => (
                    <label
                      key={tech.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedTechId === tech.id
                          ? 'border-[#FF7900] bg-[#FF7900]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="techSelect"
                        value={tech.id}
                        checked={selectedTechId === tech.id}
                        onChange={() => setSelectedTechId(tech.id)}
                        className="accent-[#FF7900]"
                        data-testid="tech-radio"
                      />
                      <div className="w-9 h-9 rounded-full bg-[#071B33] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {tech.name_ar.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{tech.name_ar}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {tech.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400" dir="ltr">
                              <Phone className="w-3 h-3" />
                              {tech.phone}
                            </span>
                          )}
                          {tech.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              {tech.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* مودال: تغيير الحالة */}
      <FormModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="تغيير حالة الطلب"
        onSubmit={handleStatusUpdate}
        loading={saving}
        submitLabel="حفظ"
      >
        {editItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
              <span className="text-gray-400 text-xs block mb-0.5">الطلب</span>
              {editItem.customerName} — {editItem.categoryNameAr}
            </div>
            <div>
              <label className="form-label">الحالة الجديدة</label>
              <select
                data-testid="status-select"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="form-input"
              >
                {Object.entries(STATUS_MAP).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
