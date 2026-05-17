import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Users, Search, RefreshCw, CheckCircle, Clock, UserCheck } from 'lucide-react'

const STATUS_LABELS = {
  not_registered: { label: 'لم يسجل',   color: 'bg-gray-100 text-gray-600',         dot: 'bg-gray-400'    },
  registered:     { label: 'سجّل',       color: 'bg-blue-100 text-blue-700',          dot: 'bg-blue-500'    },
  approved:       { label: 'تم قبوله',   color: 'bg-emerald-100 text-emerald-700',    dot: 'bg-emerald-500' },
}

const TYPE_LABELS = {
  technician: 'فني',
  company:    'شركة',
}

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || STATUS_LABELS.not_registered
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-black text-[#071B33]">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function Referrals() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [saving, setSaving]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.admin.referrals.list()
      setRows(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setSaving(id)
    try {
      await api.admin.referrals.update(id, status)
      setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {
      // ignore
    } finally {
      setSaving(null)
    }
  }

  const filtered = rows.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || (
      r.referredName?.toLowerCase().includes(q) ||
      r.referredPhone?.includes(q) ||
      r.referredCity?.toLowerCase().includes(q) ||
      r.referredSpecialty?.toLowerCase().includes(q) ||
      r.referrerName?.toLowerCase().includes(q)
    )
    return matchFilter && matchSearch
  })

  const total       = rows.length
  const notReg      = rows.filter(r => r.status === 'not_registered').length
  const registered  = rows.filter(r => r.status === 'registered').length
  const approved    = rows.filter(r => r.status === 'approved').length

  return (
    <div dir="rtl" className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-[#071B33] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF7900]" />
            الفنيون المرشحون
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">قائمة الفنيين والشركات التي رشّحها المستخدمون</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Users}     value={total}      label="إجمالي"   color="bg-orange-50 text-[#FF7900]" />
        <StatCard icon={Clock}     value={notReg}     label="لم يسجل"  color="bg-gray-100 text-gray-500" />
        <StatCard icon={UserCheck} value={registered} label="سجّل"     color="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle} value={approved} label="تم قبوله" color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الهاتف، المدينة، التخصص..."
            className="w-full border border-gray-200 rounded-xl py-2 pr-9 pl-3 text-sm text-[#071B33] outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all','الكل'],['not_registered','لم يسجل'],['registered','سجّل'],['approved','تم قبوله']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === val ? 'bg-[#071B33] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-[#FF7900]/30 border-t-[#FF7900] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">جارٍ التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-[#071B33] text-sm truncate">{r.referredName}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2">
                    <p className="text-xs text-gray-500">📱 {r.referredPhone}</p>
                    <p className="text-xs text-gray-500">💬 {r.referredWhatsapp}</p>
                    <p className="text-xs text-gray-500">🔧 {r.referredSpecialty}</p>
                    <p className="text-xs text-gray-500">📍 {r.referredCity}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-gray-400">رشّحه:</span>
                    <span className="text-[11px] font-semibold text-[#071B33]">{r.referrerName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${r.referrerType === 'technician' ? 'bg-orange-50 text-[#FF7900]' : 'bg-blue-50 text-blue-600'}`}>
                      {TYPE_LABELS[r.referrerType] || r.referrerType}
                    </span>
                    <span className="text-[11px] text-gray-300 mr-auto">
                      {new Date(r.createdAt).toLocaleDateString('ar-LY', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status Changer */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {Object.entries(STATUS_LABELS).map(([val, { label, color }]) => (
                    r.status !== val && (
                      <button key={val}
                        disabled={saving === r.id}
                        onClick={() => handleStatus(r.id, val)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${color} border-transparent hover:opacity-80`}>
                        {saving === r.id ? '...' : `→ ${label}`}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
