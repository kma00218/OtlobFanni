import { useState, useEffect, useRef } from 'react'
import { Search, Copy, Check, ExternalLink, Phone, MapPin, Calendar } from 'lucide-react'
import api from '../../lib/api'
import { categories as SERVICES_CATS } from '../../data/services'

const STATUS = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-800 border border-amber-300' },
  approved:  { label: 'مقبول',        cls: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
  published: { label: 'منشور',        cls: 'bg-orange-100 text-orange-700 border border-orange-300' },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-100 text-red-700 border border-red-300' },
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
        <h1 className="text-xl font-extrabold text-[#071B33]">بحث عن فني أو شركة</h1>
        <p className="text-sm text-slate-500 mt-1">ابحث بالاسم، الكود، رقم الهاتف، أو واتساب</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="مثال: محمد أو TEC-2026-612916 أو 0912..."
          className="w-full bg-white border-2 border-slate-200 rounded-2xl pr-12 pl-4 py-3.5 text-base text-[#071B33] placeholder-slate-400 focus:outline-none focus:border-[#FF7900] shadow-sm transition-all font-medium"
          autoFocus
        />
        {loading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">جارٍ البحث…</span>
        )}
      </div>

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-400 font-medium">لا توجد نتائج لـ &quot;{q}&quot;</p>
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
          <div key={r.id} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">

            {/* ── Coloured top bar ── */}
            <div className={`h-1.5 w-full ${isTech ? 'bg-blue-400' : 'bg-purple-400'}`} />

            <div className="p-5 space-y-4">

              {/* ── Header row ── */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isTech ? 'bg-blue-50' : 'bg-purple-50'}`}>
                    {isTech ? '🔧' : '🏢'}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#071B33] text-base leading-tight">{r.displayName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 tracking-wide">{r.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${isTech ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {isTech ? 'فني' : 'شركة'}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* ── Details grid ── */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span className="font-semibold text-[#071B33]" dir="ltr">{r.phone}</span>
                </div>
                {r.whatsapp && r.whatsapp !== r.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="font-semibold text-[#071B33]" dir="ltr">{r.whatsapp}</span>
                  </div>
                )}
                {r.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="font-semibold text-[#071B33]">{r.city}</span>
                  </div>
                )}
                {r.specialty && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛠</span>
                    <span className="font-semibold text-[#071B33]">{catLabel(r.specialty)}</span>
                  </div>
                )}
                {r.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="font-semibold text-[#071B33]">{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {r.requestNumber && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-slate-500 text-sm">رقم الطلب:</span>
                    <span className="font-mono font-bold text-[#071B33] text-sm tracking-wider">{r.requestNumber}</span>
                  </div>
                )}
              </div>

              {/* ── Referral stats ── */}
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <span className="text-xl">📊</span>
                <div className="flex gap-6 text-sm">
                  <span>
                    <span className="text-[#071B33] font-extrabold text-base">{r.referralStats?.registered ?? 0}</span>
                    <span className="text-slate-600 font-medium mr-1">تسجيل عبر رابطه</span>
                  </span>
                  <span>
                    <span className="text-[#071B33] font-extrabold text-base">{r.referralStats?.accepted ?? 0}</span>
                    <span className="text-slate-600 font-medium mr-1">مقبول</span>
                  </span>
                </div>
              </div>

              {/* ── Referral links ── */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">روابط الترشيح</p>
                {[
                  { label: '🔧 رابط تسجيل فني',   link: techLink, key: `tech-${r.id}`, short: `${window.location.hostname}/join…` },
                  { label: '🏢 رابط تسجيل شركة', link: compLink, key: `comp-${r.id}`, short: `${window.location.hostname}/join-company…` },
                ].map(({ label, link, key, short }) => (
                  <div key={key} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                    <span className="text-sm font-semibold text-[#071B33] flex-1 truncate">
                      {label}
                      <span className="font-mono text-slate-500 font-normal text-xs mr-2" dir="ltr">{short}</span>
                    </span>
                    <button
                      onClick={() => copyText(link, key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0 active:scale-95 ${copied === key ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-[#071B33] text-white hover:bg-[#0f2a4a]'}`}
                    >
                      {copied === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === key ? 'تم النسخ' : 'نسخ'}
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
                  className="inline-flex items-center gap-2 text-[#FF7900] text-sm font-bold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  عرض الملف في المنصة
                </a>
              )}

            </div>
          </div>
        )
      })}
    </div>
  )
}
