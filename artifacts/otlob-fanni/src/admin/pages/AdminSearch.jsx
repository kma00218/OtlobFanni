import { useState, useEffect, useRef } from 'react'
import { Search, Copy, Check, ExternalLink, Phone, MapPin, Calendar } from 'lucide-react'
import api from '../../lib/api'
import { categories as SERVICES_CATS } from '../../data/services'

const STATUS = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-400/25 text-amber-300 border border-amber-400/40' },
  approved:  { label: 'مقبول',        cls: 'bg-emerald-400/25 text-emerald-300 border border-emerald-400/40' },
  published: { label: 'منشور',        cls: 'bg-orange-400/25 text-orange-300 border border-orange-400/40' },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-400/25 text-red-300 border border-red-400/40' },
}

export default function AdminSearch() {
  const [q, setQ]             = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [copied, setCopied]   = useState(null)
  const timerRef              = useRef(null)

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
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-lg font-extrabold text-white">بحث عن فني أو شركة</h1>
        <p className="text-xs text-slate-500 mt-0.5">ابحث بالاسم أو الكود أو رقم الهاتف أو واتساب</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="اكتب للبحث..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pr-11 pl-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 focus:border-[#FF7900]/40 transition-all"
          autoFocus
        />
        {loading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">جارٍ البحث...</span>
        )}
      </div>

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-10">
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
          <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">

            {/* ── Header row ── */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isTech ? 'bg-blue-500/15' : 'bg-purple-500/15'}`}>
                  {isTech ? '🔧' : '🏢'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">{r.displayName}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{r.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${isTech ? 'bg-blue-500/15 text-blue-300' : 'bg-purple-500/15 text-purple-300'}`}>
                  {isTech ? 'فني' : 'شركة'}
                </span>
                <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold ${statusInfo.cls}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* ── Details grid ── */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 flex-shrink-0" />
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
                  <MapPin className="w-3 h-3 flex-shrink-0" />
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
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              )}
              {r.requestNumber && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="text-slate-600">رقم الطلب:</span>
                  <span className="font-mono text-slate-300">{r.requestNumber}</span>
                </div>
              )}
            </div>

            {/* ── Referral stats ── */}
            <div className="flex items-center gap-3 bg-[#FF7900]/10 border border-[#FF7900]/20 rounded-xl px-4 py-2.5">
              <span className="text-base">📊</span>
              <div className="flex gap-5 text-xs">
                <span>
                  <span className="text-white font-bold">{r.referralStats?.registered ?? 0}</span>
                  <span className="text-slate-400"> تسجيل عبر رابطه</span>
                </span>
                <span>
                  <span className="text-white font-bold">{r.referralStats?.accepted ?? 0}</span>
                  <span className="text-slate-400"> تم قبوله</span>
                </span>
              </div>
            </div>

            {/* ── Referral links ── */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500 font-semibold">روابط الترشيح:</p>
              {[
                { label: '🔧 رابط تسجيل فني',   link: techLink, key: `tech-${r.id}`, short: `${window.location.hostname}/join…` },
                { label: '🏢 رابط تسجيل شركة', link: compLink, key: `comp-${r.id}`, short: `${window.location.hostname}/join-company…` },
              ].map(({ label, link, key, short }) => (
                <div key={key} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-[11px] text-slate-500 flex-1 truncate">
                    <span className="text-slate-400 font-medium">{label}: </span>
                    <span className="font-mono" dir="ltr">{short}</span>
                  </span>
                  <button
                    onClick={() => copyText(link, key)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 active:scale-95"
                  >
                    {copied === key ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
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
