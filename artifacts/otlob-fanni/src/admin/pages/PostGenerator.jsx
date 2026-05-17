import { useState, useCallback } from 'react'
import { Copy, Check, RefreshCw, ChevronDown } from 'lucide-react'
import api from '../../lib/api'
import { categories as SERVICES_CATS } from '../../data/services'

const Select = ({ label, value, onChange, children }) => (
  <div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 text-[#071B33] text-sm rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50">
        {children}
      </select>
      <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  </div>
)

export default function PostGenerator() {
  const [techCount,  setTechCount]  = useState(5)
  const [compCount,  setCompCount]  = useState(3)
  const [cityFilter, setCityFilter] = useState('')
  const [specFilter, setSpecFilter] = useState('')
  const [sortBy,     setSortBy]     = useState('recent')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
  const [cities,     setCities]     = useState([])
  const [postText,   setPostText]   = useState('')
  const [loading,    setLoading]    = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [citiesLoaded, setCitiesLoaded] = useState(false)

  const cats = SERVICES_CATS || []

  const ensureCities = useCallback(async () => {
    if (citiesLoaded) return
    try {
      const data = await api.cities()
      setCities(data)
      setCitiesLoaded(true)
    } catch { }
  }, [citiesLoaded])

  const base = typeof window !== 'undefined'
    ? window.location.origin + (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    : 'https://otlobfanni.ly'

  const generate = useCallback(async () => {
    setLoading(true)
    setPostText('')
    try {
      let techItems = [], compItems = []

      // Date range boundaries (start of from-day, end of to-day)
      const fromMs = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0)    : null
      const toMs   = dateTo   ? new Date(dateTo).setHours(23, 59, 59, 999) : null
      const inRange = (iso) => {
        if (!iso) return !(fromMs || toMs)
        const ms = new Date(iso).getTime()
        if (fromMs && ms < fromMs) return false
        if (toMs   && ms > toMs)   return false
        return true
      }

      if (techCount > 0) {
        const params = {}
        if (specFilter) params.category = specFilter
        if (cityFilter) params.city_id  = cityFilter
        const raw = await api.technicians(params)
        let filtered = raw.filter(t => inRange(t.createdAt || t.created_at))
        if (sortBy === 'recent') filtered.sort((a, b) => {
          const da = new Date(b.createdAt || b.created_at || 0).getTime()
          const db2 = new Date(a.createdAt || a.created_at || 0).getTime()
          return da - db2
        })
        techItems = filtered.slice(0, techCount).map(t => ({
          name:      t.nameAr || t.name_ar || '',
          specialty: t.categoryAr || '',
          city:      t.city_name_ar || '',
          url:       `${base}/technician/${t.id}`,
        }))
      }

      if (compCount > 0) {
        const params = {}
        if (specFilter) params.specialty = specFilter
        if (cityFilter) params.city      = cityFilter
        const raw = await api.companies(params)
        let filtered = raw.filter(c => inRange(c.createdAt || c.created_at))
        if (sortBy === 'recent') filtered.sort((a, b) => {
          const da = new Date(b.createdAt || b.created_at || 0).getTime()
          const db2 = new Date(a.createdAt || a.created_at || 0).getTime()
          return da - db2
        })
        compItems = filtered.slice(0, compCount).map(c => ({
          name:      c.companyName || c.company_name || '',
          specialty: c.categoryAr || c.specialty || '',
          city:      c.city || '',
          url:       `${base}/company/${c.id}`,
        }))
      }

      if (techItems.length === 0 && compItems.length === 0) {
        setPostText('لا توجد نتائج بهذه الفلاتر.')
        return
      }

      const lines = []

      lines.push('📢 انضم حديثاً إلى منصة اطلب فني 🇱🇾')
      lines.push('')

      if (techItems.length > 0) {
        lines.push('🔧 الفنيون:')
        lines.push('─────────────────────')
        lines.push('')
        techItems.forEach((t, i) => {
          lines.push(`${i + 1}. ${t.name}`)
          if (t.city) lines.push(`📍 ${t.city}`)
          lines.push(`🔗 ${t.url}`)
          lines.push('')
        })
        lines.push('─────────────────────')
        lines.push('')
      }

      if (compItems.length > 0) {
        lines.push('🏢 الشركات:')
        lines.push('─────────────────────')
        lines.push('')
        compItems.forEach((c, i) => {
          lines.push(`${i + 1}. ${c.name}`)
          if (c.city) lines.push(`📍 ${c.city}`)
          lines.push(`🔗 ${c.url}`)
          lines.push('')
        })
        lines.push('─────────────────────')
        lines.push('')
      }

      lines.push('🌐 www.otlobfanni.ly')
      lines.push('')
      lines.push('📱 سجّل الآن وأضف نشاطك مجاناً')

      setPostText(lines.join('\n'))
    } catch (e) {
      console.error(e)
      setPostText('حدث خطأ أثناء جلب البيانات.')
    } finally {
      setLoading(false)
    }
  }, [techCount, compCount, cityFilter, specFilter, sortBy, dateFrom, dateTo, cities, cats, base])

  const copyPost = async () => {
    try { await navigator.clipboard.writeText(postText) } catch { }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#071B33]">توليد منشور</h1>
        <p className="text-sm text-slate-500 mt-1">أنشئ نص منشور جاهز للنسخ والنشر على فيسبوك وواتساب وتيليجرام</p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">

        {/* Counts row */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="عدد الفنيين" value={techCount} onChange={v => setTechCount(Number(v))}>
            <option value={0}>بدون فنيين</option>
            {[1, 3, 5, 8, 10].map(n => <option key={n} value={n}>{n} فنيين</option>)}
          </Select>
          <Select label="عدد الشركات" value={compCount} onChange={v => setCompCount(Number(v))}>
            <option value={0}>بدون شركات</option>
            {[1, 3, 5, 8, 10].map(n => <option key={n} value={n}>{n} شركات</option>)}
          </Select>
        </div>

        {/* City + Specialty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">المدينة</p>
            <div className="relative">
              <select
                value={cityFilter}
                onFocus={ensureCities}
                onChange={e => setCityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-[#071B33] text-sm rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50"
              >
                <option value="">كل المدن</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <Select label="التخصص" value={specFilter} onChange={setSpecFilter}>
            <option value="">كل التخصصات</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
          </Select>
        </div>

        {/* Sort */}
        <Select label="الترتيب" value={sortBy} onChange={setSortBy}>
          <option value="recent">آخر المسجلين</option>
          <option value="featured">المميزون أولاً</option>
        </Select>

        {/* Date range */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            نطاق التاريخ <span className="normal-case font-normal text-slate-400">(اختياري)</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">من تاريخ</p>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="w-full bg-slate-50 border border-slate-200 text-[#071B33] text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7900]/50"
              />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-1">إلى تاريخ</p>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full bg-slate-50 border border-slate-200 text-[#071B33] text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7900]/50"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="mt-2 text-xs text-slate-400 hover:text-red-500 transition-colors underline"
            >
              مسح التواريخ
            </button>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || (techCount === 0 && compCount === 0)}
          className="w-full py-3 bg-[#071B33] text-white rounded-xl text-sm font-bold hover:bg-[#0f2a4a] transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'جارٍ التوليد…' : 'توليد المنشور'}
        </button>
      </div>

      {/* Output */}
      {postText && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-[#071B33]">نص المنشور</span>
            <span className="text-xs text-slate-400">جاهز للنسخ</span>
          </div>

          <pre
            dir="rtl"
            className="p-4 text-sm text-[#071B33] leading-relaxed whitespace-pre-wrap break-words font-sans select-all"
            style={{ fontFamily: 'Tahoma, "Segoe UI", Arial, sans-serif' }}
          >
            {postText}
          </pre>

          <div className="px-4 pb-4">
            <button
              onClick={copyPost}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] ${
                copied
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-[#FF7900] text-white hover:bg-orange-600'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ بنجاح ✓' : 'نسخ المنشور'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
