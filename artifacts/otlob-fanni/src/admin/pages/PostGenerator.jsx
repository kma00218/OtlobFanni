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

      if (techCount > 0) {
        const params = {}
        if (specFilter) params.category = specFilter
        if (cityFilter) params.city_id  = cityFilter
        const raw = await api.technicians(params)
        let sorted = [...raw]
        if (sortBy === 'recent') sorted.sort((a, b) => String(b.id).localeCompare(String(a.id)))
        techItems = sorted.slice(0, techCount).map(t => ({
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
        let sorted = [...raw]
        if (sortBy === 'recent') sorted.sort((a, b) => String(b.id).localeCompare(String(a.id)))
        compItems = sorted.slice(0, compCount).map(c => ({
          name:      c.companyName || c.company_name || '',
          specialty: c.categoryAr || c.specialty || '',
          city:      c.city || '',
          url:       `${base}/company/${c.id}`,
        }))
      }

      const lines = []

      const cityLabel = cities.find(c => c.id === cityFilter)?.nameAr || ''
      const specLabel = cats.find(c => c.id === specFilter)?.nameAr || ''
      const filterNote = [cityLabel, specLabel].filter(Boolean).join(' · ')

      lines.push('📢 انضم إلى منصة اطلب فني' + (filterNote ? ` — ${filterNote}` : ''))
      lines.push('ابحث عن أفضل الفنيين والشركات الموثوقة في ليبيا')
      lines.push('')

      if (techItems.length > 0) {
        lines.push('🔧 فنيون مسجّلون في المنصة:')
        lines.push('─────────────────────')
        techItems.forEach((t, i) => {
          lines.push(`${i + 1}. ${t.name}`)
          const details = [t.city && `📍 ${t.city}`, t.specialty && `🛠 ${t.specialty}`].filter(Boolean).join('  ')
          if (details) lines.push(`   ${details}`)
          lines.push(`   🔗 ${t.url}`)
          lines.push('')
        })
      }

      if (compItems.length > 0) {
        lines.push('🏢 شركات خدمات مسجّلة في المنصة:')
        lines.push('─────────────────────')
        compItems.forEach((c, i) => {
          lines.push(`${i + 1}. ${c.name}`)
          const details = [c.city && `📍 ${c.city}`, c.specialty && `🛠 ${c.specialty}`].filter(Boolean).join('  ')
          if (details) lines.push(`   ${details}`)
          lines.push(`   🔗 ${c.url}`)
          lines.push('')
        })
      }

      if (techItems.length === 0 && compItems.length === 0) {
        setPostText('لا توجد نتائج بهذه الفلاتر.')
        return
      }

      lines.push('─────────────────────')
      lines.push('🌐 www.otlobfanni.ly')
      lines.push('📱 سجّل الآن وأضف ملفك مجاناً')

      setPostText(lines.join('\n'))
    } catch (e) {
      console.error(e)
      setPostText('حدث خطأ أثناء جلب البيانات.')
    } finally {
      setLoading(false)
    }
  }, [techCount, compCount, cityFilter, specFilter, sortBy, cities, cats, base])

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
