import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Eye, Trash2, Wrench, RefreshCw, SlidersHorizontal, UserCheck, Phone, Star } from 'lucide-react'
import api from '../../lib/api'

const PAGE_SIZE = 15

const STATUS_MAP = {
  new:         { label: 'جديد',        cls: 'bg-orange-500/10 text-[#FF7900]'   },
  assigned:    { label: 'مُسند',       cls: 'bg-blue-500/10 text-blue-400'      },
  contacted:   { label: 'تم التواصل', cls: 'bg-sky-500/10 text-sky-400'        },
  in_progress: { label: 'جارٍ',        cls: 'bg-purple-500/10 text-purple-400'  },
  completed:   { label: 'مكتمل',      cls: 'bg-emerald-500/10 text-emerald-400' },
  cancelled:   { label: 'ملغي',       cls: 'bg-red-500/10 text-red-400'        },
}

const URGENCY_MAP = {
  normal:    { label: 'عادي',  cls: 'text-[#666680]'            },
  urgent:    { label: 'عاجل',  cls: 'text-orange-400'           },
  emergency: { label: 'طارئ',  cls: 'text-red-400 font-bold'    },
}

export default function Requests() {
  const { isSuperAdmin, cityId: adminCityId } = useAdmin()

  const [data,         setData]         = useState([])
  const [cities,       setCities]       = useState([])
  const [allTechs,     setAllTechs]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterCity,   setFilterCity]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page,         setPage]         = useState(1)

  const [viewItem,       setViewItem]       = useState(null)
  const [editItem,       setEditItem]       = useState(null)
  const [newStatus,      setNewStatus]      = useState('')
  const [assignItem,     setAssignItem]     = useState(null)
  const [eligibles,      setEligibles]      = useState([])
  const [selectedTechId, setSelectedTechId] = useState('')

  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    Promise.all([
      api.admin.serviceRequests.list(),
      api.cities(),
      api.admin.technicians.list(),
    ]).then(([reqs, c, techs]) => {
      setData(reqs)
      setCities(c)
      setAllTechs(techs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const cityName = (val) => {
    if (!val) return '—'
    const found = cities.find(c => c.id === val || c.name_ar === val)
    return found?.name_ar || val
  }

  const visible = data.filter(r => {
    const city   = r.city_id  || r.city  || ''
    const status = r.status   || ''
    if (!isSuperAdmin && adminCityId && city !== adminCityId) return false
    if (filterCity   && city   !== filterCity)   return false
    if (filterStatus && status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      const name  = (r.customer_name  || r.customerName  || '').toLowerCase()
      const phone = (r.customer_phone || r.customerPhone || '')
      const cat   = (r.category_name_ar || r.categoryNameAr || '').toLowerCase()
      if (!name.includes(q) && !phone.includes(q) && !cat.includes(q)) return false
    }
    return true
  }).sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))

  const pagedData  = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(visible.length / PAGE_SIZE) || 1

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.admin.serviceRequests.update(editItem.id, newStatus)
      setData(prev => prev.map(r => r.id === editItem.id ? { ...r, status: newStatus } : r))
      showToast('تم تحديث الحالة')
      setEditItem(null)
    } catch { showToast('حدث خطأ', 'error') }
    setSaving(false)
  }

  const openAssign = (row) => {
    const cityVal = row.city_id || row.city || ''
    const catId   = row.category_id || ''
    const list = allTechs.filter(t =>
      t.is_active && t.is_approved &&
      (t.city_id === cityVal || t.city === cityVal || t.city === cityName(cityVal)) &&
      (t.category_id === catId || t.category === catId)
    ).map(t => ({
      id:       t.id,
      name_ar:  t.name_ar || '',
      phone:    t.phone || '',
      whatsapp: t.whatsapp || t.phone || '',
      rating:   t.rating || null,
    }))
    setEligibles(list)
    setSelectedTechId(list[0]?.id || '')
    setAssignItem(row)
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedTechId) { showToast('اختر فنياً أولاً', 'error'); return }
    const tech = eligibles.find(t => t.id === selectedTechId)
    if (!tech) return
    setSaving(true)
    try {
      await api.admin.serviceRequests.update(assignItem.id, 'assigned')
      setData(prev => prev.map(r =>
        r.id === assignItem.id
          ? { ...r, status: 'assigned', assigned_technician_id: tech.id, assigned_technician_name: tech.name_ar }
          : r
      ))
      showToast('تم إسناد الفني بنجاح')
      setAssignItem(null)
    } catch { showToast('حدث خطأ', 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await api.admin.serviceRequests.delete(id)
      setData(prev => prev.filter(r => r.id !== id))
      showToast('تم حذف الطلب')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const columns = [
    {
      key: 'customer_name', label: 'العميل',
      render: (v, row) => (
        <div>
          <p className="font-medium text-white text-sm">{v || row.customerName || '—'}</p>
          <p className="text-xs text-[#555570]" dir="ltr">{row.customer_phone || row.customerPhone || '—'}</p>
        </div>
      )
    },
    {
      key: 'city_id', label: 'المدينة',
      render: (v, row) => (
        <div>
          <p className="text-sm text-[#C0C0D8]">{cityName(v || row.city || '')}</p>
          {row.area && <p className="text-xs text-[#555570]">{row.area}</p>}
        </div>
      )
    },
    {
      key: 'category_name_ar', label: 'التخصص',
      render: (v, row) => <span className="text-sm text-[#C0C0D8]">{v || row.categoryNameAr || '—'}</span>
    },
    {
      key: 'urgency', label: 'الأولوية',
      render: (v) => {
        const u = URGENCY_MAP[v]
        return u
          ? <span className={`text-xs font-medium ${u.cls}`}>{u.label}</span>
          : <span className="text-xs text-[#444460]">—</span>
      }
    },
    {
      key: 'status', label: 'الحالة',
      render: (v) => {
        const s = STATUS_MAP[v] || { label: '—', cls: 'bg-white/5 text-[#666680]' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
      }
    },
    {
      key: 'created_at', label: 'التاريخ',
      render: (v, row) => {
        const d = v || row.createdAt
        return d ? new Date(d).toLocaleDateString('en-GB') : '—'
      }
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openAssign(row)} className="p-1.5 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors" title="إسناد فني" data-testid="assign-btn">
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setEditItem(row); setNewStatus(row.status) }} className="p-1.5 hover:bg-[#FF7900]/10 text-[#FF7900] rounded-lg transition-colors" title="تغيير الحالة">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          {isSuperAdmin && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="حذف">
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
      <div className="bg-[#0E0E17] rounded-2xl border border-white/5 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {isSuperAdmin && (
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1) }}
              className="border border-white/8 rounded-xl px-3 py-2 text-sm text-[#C0C0E0] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white/5">
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="border border-white/8 rounded-xl px-3 py-2 text-sm text-[#C0C0E0] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white/5">
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <span className="text-xs text-[#555570] flex-1">{visible.length} طلب</span>
          <button onClick={load} className="p-2 hover:bg-white/5 text-[#8888A8] rounded-xl border border-white/8 transition-colors" title="تحديث">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* الجدول */}
      <DataTable
        columns={columns} data={pagedData} loading={loading}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        searchPlaceholder="بحث بالاسم أو الهاتف أو التخصص..."
        emptyMessage="لا توجد طلبات"
        currentPage={page} totalPages={totalPages} onPageChange={setPage}
      />

      {/* مودال: عرض التفاصيل */}
      <FormModal open={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل الطلب" onSubmit={e => { e.preventDefault(); setViewItem(null) }} submitLabel="إغلاق" size="md">
        {viewItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['العميل',       viewItem.customer_name  || viewItem.customerName],
                ['الهاتف',       viewItem.customer_phone || viewItem.customerPhone],
                ['المدينة',      cityName(viewItem.city_id || viewItem.city || '')],
                ['المنطقة',      viewItem.area],
                ['التخصص',       viewItem.category_name_ar || viewItem.categoryNameAr],
                ['الأولوية',     URGENCY_MAP[viewItem.urgency]?.label || '—'],
                ['الوقت المفضل', viewItem.preferred_time || viewItem.preferredTime || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-[#555570] mb-0.5">{k}</p>
                  <p className="font-medium text-white text-sm">{v || '—'}</p>
                </div>
              ))}
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-[#555570] mb-0.5">الحالة</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[viewItem.status]?.cls || 'bg-white/5 text-[#666680]'}`}>
                  {STATUS_MAP[viewItem.status]?.label || '—'}
                </span>
              </div>
            </div>
            {(viewItem.assigned_technician_name || viewItem.assignedTechnicianName) && (
              <div className="bg-blue-500/10 rounded-xl p-3">
                <p className="text-xs text-[#555570] mb-1">الفني المُسند</p>
                <p className="text-sm font-medium text-white">{viewItem.assigned_technician_name || viewItem.assignedTechnicianName}</p>
              </div>
            )}
            {(viewItem.problem_description || viewItem.problemDescription) && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-[#555570] mb-1">وصف المشكلة</p>
                <p className="text-sm text-[#C0C0D8] leading-relaxed">{viewItem.problem_description || viewItem.problemDescription}</p>
              </div>
            )}
            <p className="text-xs text-[#444460] text-left" dir="ltr">
              {(viewItem.created_at || viewItem.createdAt) ? new Date(viewItem.created_at || viewItem.createdAt).toLocaleString('en-GB') : ''}
            </p>
          </div>
        )}
      </FormModal>

      {/* مودال: إسناد فني */}
      <FormModal open={!!assignItem} onClose={() => setAssignItem(null)} title="إسناد فني للطلب" onSubmit={handleAssign} loading={saving} submitLabel="إسناد الفني" size="md">
        {assignItem && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-3 text-sm">
              <p className="text-xs text-[#555570] mb-1">الطلب</p>
              <p className="font-medium text-white">
                {assignItem.customer_name || assignItem.customerName} — {assignItem.category_name_ar || assignItem.categoryNameAr}
              </p>
              <p className="text-xs text-[#666680] mt-0.5">
                {cityName(assignItem.city_id || assignItem.city || '')}
                {assignItem.area ? ` · ${assignItem.area}` : ''}
              </p>
            </div>
            {eligibles.length === 0 ? (
              <div className="text-center py-6">
                <Wrench className="w-10 h-10 text-[#222240] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#666680]">لا يوجد فنيون متاحون</p>
                <p className="text-xs text-[#444460] mt-1">لا يوجد فنيون نشطون ومعتمدون في هذه المدينة لهذا التخصص</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#555570]">{eligibles.length} فني متاح</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {eligibles.map(tech => (
                    <label key={tech.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedTechId === tech.id ? 'border-[#FF7900] bg-[#FF7900]/5' : 'border-white/8 hover:border-white/15 hover:bg-white/5'}`}>
                      <input type="radio" name="techSelect" value={tech.id} checked={selectedTechId === tech.id} onChange={() => setSelectedTechId(tech.id)} className="accent-[#FF7900]" data-testid="tech-radio" />
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold text-center px-0.5 leading-tight">{(tech.name_ar || '').trim().split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{tech.name_ar}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {tech.phone && <span className="flex items-center gap-1 text-xs text-[#555570]" dir="ltr"><Phone className="w-3 h-3" />{tech.phone}</span>}
                          {tech.rating && <span className="flex items-center gap-0.5 text-xs text-amber-400"><Star className="w-3 h-3 fill-current" />{tech.rating}</span>}
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
      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="تغيير حالة الطلب" onSubmit={handleStatusUpdate} loading={saving} submitLabel="حفظ">
        {editItem && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-3 text-sm text-[#C0C0D8]">
              <span className="text-[#555570] text-xs block mb-0.5">الطلب</span>
              {editItem.customer_name || editItem.customerName} — {editItem.category_name_ar || editItem.categoryNameAr}
            </div>
            <div>
              <label className="form-label">الحالة الجديدة</label>
              <select data-testid="status-select" value={newStatus} onChange={e => setNewStatus(e.target.value)} className="form-input">
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
