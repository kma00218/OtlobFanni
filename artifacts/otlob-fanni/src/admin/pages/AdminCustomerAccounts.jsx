import { useState, useEffect, useCallback } from 'react'
import { Users, Search, KeyRound, Phone, User as UserIcon, RefreshCw } from 'lucide-react'
import api from '../../lib/api'

export default function AdminCustomerAccounts() {
  const [q, setQ] = useState('')
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-[#FF7900]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-[#071B33]">حسابات العملاء</h1>
          <p className="text-xs text-gray-500">حسابات "طلباتي" — تسجيل عام بدون OTP، اسم مستخدم ورقم سري</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم، أو الواتساب"
            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/15 outline-none"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#071B33] text-white text-sm font-bold">بحث</button>
        <button type="button" onClick={() => { setQ(''); load('') }} className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </form>

      {loading && <p className="text-center text-sm text-gray-400 py-10">جارٍ التحميل...</p>}

      {!loading && accounts.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">لا توجد حسابات</p>
      )}

      <div className="space-y-2.5">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-bold text-[#071B33] text-sm">{acc.name}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /><span dir="ltr">{acc.username}</span></span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /><span dir="ltr">{acc.whatsapp}</span></span>
              </div>
            </div>
            <button
              onClick={() => handleResetPin(acc)}
              disabled={resetting === acc.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-50 text-[#FF7900] text-xs font-bold disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {resetting === acc.id ? 'جارٍ...' : 'إعادة تعيين الرقم السري'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
