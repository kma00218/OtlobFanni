import { useEffect, useState } from 'react'
import {
  Handshake, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle,
  Wrench, Building2, Package, Phone, Calendar, DollarSign, ChevronDown,
} from 'lucide-react'
import api from '../../lib/api'

const STATUS_CONFIG = {
  pending:   { label: 'بانتظار العميل', color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  confirmed: { label: 'مؤكدة',          color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  disputed:  { label: 'مختلف عليها',    color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  cancelled: { label: 'ملغية',          color: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400' },
}

const PRO_TYPE_ICONS = {
  technician: Wrench,
  company:    Building2,
  supplier:   Package,
}

const PRO_TYPE_LABELS = {
  technician: 'فني',
  company:    'شركة',
  supplier:   'مورد',
}

function DealRow({ deal, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[deal.status] || STATUS_CONFIG.pending
  const Icon = PRO_TYPE_ICONS[deal.proType] || Wrench

  const setStatus = async (status) => {
    setUpdating(true)
    try {
      await api.deals.adminSetStatus(deal.id, status)
      onStatusChange(deal.id, status)
    } catch { /* ignore */ }
    finally { setUpdating(false) }
  }

  const confirmLink = `${window.location.origin}/deal-confirm/${deal.confirmToken || ''}`

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#071B33] text-sm">{deal.proName || PRO_TYPE_LABELS[deal.proType]}</p>
                <p className="text-xs text-gray-400">{PRO_TYPE_LABELS[deal.proType]} • {deal.serviceType}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {deal.userPhone}
              </span>
              {deal.userName && (
                <span className="text-xs text-gray-500">{deal.userName}</span>
              )}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {deal.serviceDate}
              </span>
              {deal.serviceValue && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {Number(deal.serviceValue).toLocaleString('ar-LY')} د.ل
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setExpanded(p => !p)}
            className="p-1.5 rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0">
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {deal.description && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{deal.description}</p>
          )}

          {/* Points */}
          {deal.status === 'confirmed' && (
            <div className="flex gap-3">
              <div className="flex-1 bg-[#FF7900]/5 border border-[#FF7900]/20 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-gray-400">نقاط المهني</p>
                <p className="font-black text-[#FF7900]">{deal.proPoints}</p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-gray-400">نقاط العميل</p>
                <p className="font-black text-blue-600">{deal.userPoints}</p>
              </div>
            </div>
          )}

          {/* Confirm link (only for pending) */}
          {deal.status === 'pending' && deal.confirmToken && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <p className="text-[10px] text-gray-400 mb-1">رابط التأكيد للعميل</p>
              <p className="text-xs text-blue-700 font-mono break-all">{confirmLink}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-gray-400 space-y-0.5">
            <p>أُنشئت: {new Date(deal.createdAt).toLocaleString('ar-LY')}</p>
            {deal.confirmedAt && <p>تم الرد: {new Date(deal.confirmedAt).toLocaleString('ar-LY')}</p>}
          </div>

          {/* Admin actions */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
            {deal.status !== 'confirmed' && (
              <button onClick={() => setStatus('confirmed')} disabled={updating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 disabled:opacity-50 transition-colors">
                <CheckCircle className="w-3 h-3" /> تأكيد يدوي
              </button>
            )}
            {deal.status !== 'disputed' && (
              <button onClick={() => setStatus('disputed')} disabled={updating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 disabled:opacity-50 transition-colors">
                <AlertTriangle className="w-3 h-3" /> وضع خلاف
              </button>
            )}
            {deal.status !== 'cancelled' && (
              <button onClick={() => setStatus('cancelled')} disabled={updating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 disabled:opacity-50 transition-colors">
                <XCircle className="w-3 h-3" /> إلغاء
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDeals() {
  const [deals, setDeals]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [statusFilter, setStatus] = useState('')
  const [typeFilter, setType]     = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.deals.adminList({ status: statusFilter || undefined, proType: typeFilter || undefined })
      setDeals(data)
    } catch { setDeals([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter, typeFilter])

  const handleStatusChange = (id, status) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  const counts = {
    all:       deals.length,
    pending:   deals.filter(d => d.status === 'pending').length,
    confirmed: deals.filter(d => d.status === 'confirmed').length,
    disputed:  deals.filter(d => d.status === 'disputed').length,
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#071B33]">الصفقات المؤكدة</h1>
          <p className="text-sm text-gray-400 mt-0.5">نظام التحقق المتبادل من إتمام الخدمات</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'الكل',          count: counts.all,       color: 'bg-[#071B33]',  text: 'text-white' },
          { label: 'بانتظار رد',    count: counts.pending,   color: 'bg-amber-500',  text: 'text-white' },
          { label: 'مؤكدة',         count: counts.confirmed, color: 'bg-emerald-500',text: 'text-white' },
          { label: 'مختلف عليها',   count: counts.disputed,  color: 'bg-red-500',    text: 'text-white' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl px-4 py-3 flex flex-col items-center`}>
            <p className={`text-2xl font-black ${s.text}`}>{s.count}</p>
            <p className={`text-xs font-semibold ${s.text} opacity-80`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none">
          <option value="">كل الحالات</option>
          <option value="pending">بانتظار العميل</option>
          <option value="confirmed">مؤكدة</option>
          <option value="disputed">مختلف عليها</option>
          <option value="cancelled">ملغية</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none">
          <option value="">كل الأنواع</option>
          <option value="technician">فنيون</option>
          <option value="company">شركات</option>
          <option value="supplier">موردون</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <Handshake className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-400">لا توجد صفقات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map(d => (
            <DealRow key={d.id} deal={d} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}
