import { useState, useEffect, useCallback } from 'react'
import { Users, Search, KeyRound, Phone, User as UserIcon, RefreshCw, ChevronDown, ClipboardList, ListChecks, MapPin, Tag, Calendar } from 'lucide-react'
import api from '../../lib/api'

const STATUS_STYLES = {
  new:         { label: 'جديد',        color: 'bg-orange-100 text-orange-700' },
  open:        { label: 'مفتوح',       color: 'bg-blue-100 text-blue-700' },
  assigned:    { label: 'مُسند',       color: 'bg-purple-100 text-purple-700' },
  in_progress: { label: 'جارٍ',        color: 'bg-indigo-100 text-indigo-700' },
  completed:   { label: 'مكتمل ✓',    color: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { label: 'ملغي',        color: 'bg-red-100 text-red-500' },
  disputed:    { label: 'خلاف',        color: 'bg-yellow-100 text-yellow-700' },
}

function OrderRow({ order }) {
  const st = STATUS_STYLES[order.status] || STATUS_STYLES.new
  const isGeneral = order.type === 'general'
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isGeneral ? 'bg-purple-100' : 'bg-[#FF7900]/10'
      }`}>
        {isGeneral
          ? <ListChecks className="w-3.5 h-3.5 text-purple-600" />
          : <ClipboardList className="w-3.5 h-3.5 text-[#FF7900]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-black text-gray-400" dir="ltr">{order.orderNumber}</span>
          <span className="text-xs font-bold text-[#071B33] truncate">
            {isGeneral ? order.title : order.categoryName}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 flex-wrap">
          {order.cityName && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{order.cityName}</span>}
          {!isGeneral && order.categoryName && <span className="flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{order.categoryName}</span>}
          <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{new Date(order.createdAt).toLocaleDateString('ar-LY')}</span>
        </div>
        {order.description && (
          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{order.description}</p>
        )}
      </div>
    </div>
  )
}

function CustomerCard({ acc, onResetPin, resetting }) {
  const [expanded, setExpanded] = useState(false)
  const [orders, setOrders] = useState(null)
  const [loadingOrders, setLoadingOrders] = useState(false)

  const toggleExpand = async () => {
    if (!expanded && orders === null) {
      setLoadingOrders(true)
      try {
        const data = await api.admin.customerAccounts.orders(acc.id)
        setOrders(data || [])
      } catch {
        setOrders([])
      } finally {
        setLoadingOrders(false)
      }
    }
    setExpanded(e => !e)
  }

  const total     = orders?.length ?? 0
  const completed = orders?.filter(o => o.status === 'completed').length ?? 0
  const active    = orders?.filter(o => ['new','open','assigned','in_progress'].includes(o.status)).length ?? 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full p-4 flex items-center justify-between gap-3 text-right hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #071B33, #0f2d52)' }}
          >
            {(acc.name || 'U')[0]}
          </div>
          <div>
            <p className="font-black text-[#071B33] text-sm">{acc.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
              <span className="flex items-center gap-0.5"><UserIcon className="w-3 h-3" /><span dir="ltr">{acc.username}</span></span>
              <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /><span dir="ltr">{acc.whatsapp}</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {orders !== null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{total} طلب</span>
              {active > 0 && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{active} نشط</span>}
              {completed > 0 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{completed} مكتمل</span>}
            </div>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid #F0F2F5' }}>
          <div className="flex items-center justify-between pt-3 pb-2">
            <p className="text-xs font-black text-gray-500">
              {loadingOrders ? 'جارٍ تحميل الطلبات...' : `الطلبات (${total})`}
            </p>
            <button
              onClick={e => { e.stopPropagation(); onResetPin(acc) }}
              disabled={resetting === acc.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-[#FF7900] text-xs font-bold border border-orange-100 disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {resetting === acc.id ? 'جارٍ...' : 'إعادة تعيين PIN'}
            </button>
          </div>

          {loadingOrders && (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingOrders && orders?.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">لا توجد طلبات لهذا العميل بعد</p>
          )}

          {!loadingOrders && orders && orders.length > 0 && (
            <div className="space-y-2">
              {orders.map(order => <OrderRow key={order.id} order={order} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminCustomerAccounts() {
  const [q, setQ]             = useState('')
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]  = useState(true)
  const [resetting, setResetting] = useState(null)

  const load = useCallback(async (query = '') => {
    setLoading(true)
    try {
      const res = await api.admin.customerAccounts.list(query)
      setAccounts(res || [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleSearch(e) {
    e.preventDefault()
    load(q.trim())
  }

  async function handleResetPin(acc) {
    const newPin = prompt(`رقم سري جديد لـ ${acc.name} (6 أرقام):`)
    if (!newPin) return
    if (!/^\d{6}$/.test(newPin)) { alert('الرقم السري يجب أن يكون 6 أرقام'); return }
    setResetting(acc.id)
    try {
      await api.admin.customerAccounts.resetPin(acc.id, newPin)
      alert('تم تعيين الرقم السري الجديد بنجاح')
    } catch (err) {
      alert(err?.message || 'حدث خطأ أثناء إعادة التعيين')
    } finally {
      setResetting(null)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}>
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-[#071B33]">حسابات العملاء</h1>
          <p className="text-xs text-gray-500">اضغط على أي عميل لرؤية سجل طلباته كاملاً</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم، أو الواتساب"
            className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/15 outline-none"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#071B33] text-white text-sm font-bold">بحث</button>
        <button type="button" onClick={() => { setQ(''); load('') }} className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 bg-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </form>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">لا توجد حسابات</p>
      )}

      {!loading && accounts.length > 0 && (
        <div className="space-y-2.5">
          {accounts.map(acc => (
            <CustomerCard
              key={acc.id}
              acc={acc}
              onResetPin={handleResetPin}
              resetting={resetting}
            />
          ))}
        </div>
      )}
    </div>
  )
}
