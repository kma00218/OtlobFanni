import { useState, useEffect, useCallback } from 'react'
import { KeyRound, CheckCircle2, XCircle, Search, RefreshCw, Wrench, Building2, Package, MessageCircle } from 'lucide-react'
import api from '../../lib/api'

const TYPE_CONFIG = {
  technician: { label: 'فنيون',   icon: Wrench,    color: 'text-[#FF7900]', bg: 'bg-[#FF7900]/10', border: 'border-[#FF7900]/20' },
  company:    { label: 'شركات',   icon: Building2, color: 'text-blue-600',  bg: 'bg-blue-50',       border: 'border-blue-100' },
  supplier:   { label: 'موردون',  icon: Package,   color: 'text-purple-600', bg: 'bg-purple-50',    border: 'border-purple-100' },
}

function StatCard({ entityType, data }) {
  const cfg = TYPE_CONFIG[entityType]
  const Icon = cfg.icon
  const pct = data.total > 0 ? Math.round((data.activated / data.total) * 100) : 0
  const notActivated = data.total - data.activated

  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
          <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
        </div>
        <span className={`font-black text-base ${cfg.color}`}>{cfg.label}</span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-2xl font-black text-[#071B33]">{data.activated}<span className="text-sm font-bold text-gray-400">/{data.total}</span></p>
          <p className="text-xs text-gray-500 mt-0.5">فعّلوا الـ PIN</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-red-500">{notActivated}</p>
          <p className="text-xs text-gray-500 mt-0.5">لم يفعّلوا بعد</p>
        </div>
      </div>
      <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">{pct}% مكتمل</p>
    </div>
  )
}

function ProRow({ row }) {
  const cfg = TYPE_CONFIG[row.entityType] || TYPE_CONFIG.technician
  const Icon = cfg.icon
  const wa = row.whatsapp?.replace(/^0/, '218') || ''
  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(`مرحباً ${row.displayName}، يرجى تفعيل لوحة التحكم الخاصة بك على تطبيق اطلب فني`)}`

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#071B33] truncate">{row.displayName || '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{row.whatsapp}</p>
      </div>
      <div className="flex items-center gap-2">
        {row.activated ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" /> فعّل
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              <XCircle className="w-3 h-3" /> لم يفعّل
            </span>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
              title="تواصل عبر واتساب"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminPinActivation() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [typeFilter, setType]   = useState('')
  const [statusFilter, setStatus] = useState('not_activated')
  const [q, setQ]               = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter)   params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (q.trim())     params.set('q', q.trim())
      const res = await api.admin.proActivation.list(params.toString())
      setData(res)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statusFilter, q])

  useEffect(() => { load() }, [load])

  const stats   = data?.stats   || { technician: { total: 0, activated: 0 }, company: { total: 0, activated: 0 }, supplier: { total: 0, activated: 0 } }
  const list    = data?.list    || []
  const totalAll = stats.technician.total + stats.company.total + stats.supplier.total
  const totalActivated = stats.technician.activated + stats.company.activated + stats.supplier.activated
  const totalNot = totalAll - totalActivated

  return (
    <div className="p-4 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-[#FF7900]/10 border border-[#FF7900]/20 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-[#FF7900]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-[#071B33]">تفعيل لوحة التحكم</h1>
          <p className="text-xs text-gray-500">تتبّع من فعّل PIN الدخول ومن لم يفعّل بعد</p>
        </div>
        <button
          onClick={load}
          className="mr-auto w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overall summary */}
      <div className="bg-[#071B33] rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs mb-1">الإجمالي الكلي</p>
          <p className="text-3xl font-black text-white">{totalActivated}<span className="text-white/40 text-base">/{totalAll}</span></p>
          <p className="text-white/60 text-xs mt-0.5">فعّلوا الـ PIN</p>
        </div>
        <div className="text-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#FF7900" strokeWidth="3"
                strokeDasharray={`${totalAll > 0 ? (totalActivated / totalAll) * 100 : 0} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-white">
                {totalAll > 0 ? Math.round((totalActivated / totalAll) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-red-400">{totalNot}</p>
          <p className="text-white/60 text-xs mt-0.5">لم يفعّلوا بعد</p>
        </div>
      </div>

      {/* Per-type stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {Object.entries(stats).map(([type, d]) => (
          <StatCard key={type} entityType={type} data={d} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 p-3">
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full border border-gray-100 rounded-xl py-2.5 pr-9 pl-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 bg-gray-50"
            placeholder="بحث بالاسم أو واتساب..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1.5 flex-1">
            {[
              { v: '',             label: 'الكل' },
              { v: 'technician',   label: 'فنيون' },
              { v: 'company',      label: 'شركات' },
              { v: 'supplier',     label: 'موردون' },
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => setType(opt.v)}
                className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors ${
                  typeFilter === opt.v
                    ? 'bg-[#071B33] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {[
              { v: 'not_activated', label: '❌ لم يفعّل' },
              { v: 'activated',     label: '✓ فعّل' },
              { v: '',              label: 'الكل' },
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => setStatus(opt.v)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                  statusFilter === opt.v
                    ? 'bg-[#FF7900] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <span className="text-sm font-black text-[#071B33]">
            {statusFilter === 'not_activated' ? 'لم يفعّلوا بعد' : statusFilter === 'activated' ? 'فعّلوا الـ PIN' : 'الكل'}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-bold">{list.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin ml-2" />
            <span className="text-sm">جاري التحميل...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-bold">لا توجد نتائج</p>
          </div>
        ) : (
          list.map(row => <ProRow key={row.entityId} row={row} />)
        )}
      </div>
    </div>
  )
}
