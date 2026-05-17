import { useState, useEffect, useRef } from 'react'
import { Search, Copy, Check, ExternalLink, Phone, MapPin, Calendar } from 'lucide-react'
import api from '../../lib/api'
import { categories as SERVICES_CATS } from '../../data/services'

const STATUS = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-700 border border-amber-300' },
  approved:  { label: 'مقبول',        cls: 'bg-emerald-100 text-emerald-700 border border-emerald-300' },
  published: { label: 'منشور',        cls: 'bg-orange-100 text-orange-600 border border-orange-300' },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-100 text-red-600 border border-red-300' },
}

export default function AdminSearch() {
  const [q, setQ]               = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [copied, setCopied]     = useState(null)
  const timerRef                = useRef(null)

  const catLabel = (specialty) => {
    if (!specialty || specialty === 'more_services') return 'خدمات متعددة'
    const cat = SERVICES_CATS.find(c => c.id === specialty)
    return cat?.nameAr || specialty
  }

  const doSearch = async (query) => {
    if (!query || query.trim().length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const data = await api.admin.searchAccount(query.trim())
      setResults(data)
      setSearched(true)
    } catch { setResults([]); setSearched(true) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(q), 400)
    return () => clearTimeout(timerRef.current)
  }, [q])

  const copyText = async (text, key) => {
    try { await navigator.clipboard.writeText(text) } catch { }
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const base = window.location.origin + (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-lg font-extrabold text-[#071B33]">بحث عن فني أو شركة</h1>
        <p className="text-xs text-slate-500 mt-0.5">ابحث بالاسم أو الكود أو رقم الهاتف أو واتساب</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="اكتب للبحث..."
          className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-sm text-[#071B33] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900]/50 shadow-sm transition-all"
          autoFocus
        />
        {loading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">جارٍ البحث...</span>
        )}
      </div>

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center text-slate-400 text-sm py-10">
          لا توجد نتائج لـ &quot;{q}&quot;
        </div>
      )}

      {/* Results */}
      {!loading && results.map((r) => {
        const isTech     = r.accountType === 'technician'
        const techLink   = `${base}/join?ref=${r.id}`
        const compLink   = `${base}/join-company?ref=${r.id}`
        const profileUrl = r.requestNumber ? `${base}/status/${r.requestNumber}` : null
        const statusInfo = STATUS[r.status] || STATUS.pending

        return (
          <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">

            {/* ── Header row ── */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isTech ? 'bg-blue-50' : 'bg-purple-50'}`}>
                  {isTech ? '🔧' : '🏢'}
                </div>
                <div>
                  <p className="font-bold text-[#071B33] text-sm leading-tight">{r.displayName}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{r.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border ${isTech ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                  {isTech ? 'فني' : 'شركة'}
                </span>
                <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold ${statusInfo.cls}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* ── Details grid ── */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" />
                <span dir="ltr">{r.phone}</span>
              </div>
              {r.whatsapp && r.whatsapp !== r.phone && (
                <div className="flex items-center gap-1.5">
                  <span>💬</span>
                  <span dir="ltr">{r.whatsapp}</span>
                </div>
              )}
              {r.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                  <span>{r.city}</span>
                </div>
              )}
              {r.specialty && (
                <div className="flex items-center gap-1.5">
                  <span>🛠</span>
                  <span>{catLabel(r.specialty)}</span>
                </div>
              )}
              {r.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 flex-shrink-0 text-slate-400" />
                  <span>{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              )}
              {r.requestNumber && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="text-slate-400">رقم الطلب:</span>
                  <span className="font-mono font-semibold text-[#071B33]">{r.requestNumber}</span>
                </div>
              )}
            </div>

            {/* ── Referral stats ── */}
            <div className="flex items-center gap-3 bg-[#FF7900]/8 border border-[#FF7900]/20 rounded-xl px-3 py-2.5">
              <span className="text-base">📊</span>
              <div className="flex gap-5 text-xs">
                <span>
                  <span className="text-[#071B33] font-bold">{r.referralStats?.registered ?? 0}</span>
                  <span className="text-slate-500"> تسجيل عبر رابطه</span>
                </span>
                <span>
                  <span className="text-[#071B33] font-bold">{r.referralStats?.accepted ?? 0}</span>
                  <span className="text-slate-500"> تم قبوله</span>
                </span>
              </div>
            </div>

            {/* ── Referral links ── */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-400 font-semibold">روابط الترشيح:</p>
              {[
                { label: '🔧 رابط تسجيل فني',   link: techLink, key: `tech-${r.id}`, short: `${window.location.hostname}/join…` },
                { label: '🏢 رابط تسجيل شركة', link: compLink, key: `comp-${r.id}`, short: `${window.location.hostname}/join-company…` },
              ].map(({ label, link, key, short }) => (
                <div key={key} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                  <span className="text-[11px] text-slate-500 flex-1 truncate">
                    <span className="font-medium text-slate-600">{label}: </span>
                    <span className="font-mono text-slate-400" dir="ltr">{short}</span>
                  </span>
                  <button
                    onClick={() => copyText(link, key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 active:scale-95 ${copied === key ? 'bg-emerald-100 text-emerald-600' : 'bg-[#071B33] text-white hover:bg-[#0f2a4a]'}`}
                  >
                    {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === key ? 'تم' : 'نسخ'}
                  </button>
                </div>
              ))}
            </div>

            {/* ── Profile link ── */}
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#FF7900] text-xs font-bold hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                عرض الملف في المنصة
              </a>
            )}

          </div>
        )
      })}
    </div>
  )
}
