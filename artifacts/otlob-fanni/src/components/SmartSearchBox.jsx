import { useState } from 'react'
import { useLocation } from 'wouter'
import { Sparkles, ChevronDown, Search, X, MapPin } from 'lucide-react'
import { api, getFileUrl } from '../lib/api'
import { useLang } from '../context/LanguageContext'

const T = {
  ar: {
    title:        'البحث الذكي',
    desc:         'اكتب مشكلتك وسنقترح لك أنسب فني أو شركة أو مورد في مدينتك',
    chooseCity:   'اختر المدينة',
    placeholder:  'مثال: المكيف لا يبرد، أريد تركيب كاميرات، أحتاج شركة تنظيف...',
    btn:          'اعرض الأنسب',
    searching:    'جارٍ البحث…',
    noCity:       'اختر المدينة أولاً',
    noDesc:       'اكتب وصف المشكلة',
    noResults:    'لا توجد نتائج في هذه المدينة لهذا الوصف',
    clarify:      'هل تبحث عن:',
    techBtn:      'فني',
    compBtn:      'شركة خدمية',
    suppBtn:      'مورد مستلزمات',
    techSection:  'فنيون مقترحون',
    compSection:  'شركات مقترحة',
    suppSection:  'موردون مقترحون',
    viewProfile:  'عرض الملف',
    rating:       'تقييم',
    clear:        'مسح',
  },
  en: {
    title:        'Smart Search',
    desc:         'Describe your problem and we\'ll suggest the best match in your city',
    chooseCity:   'Choose city',
    placeholder:  'E.g. AC not cooling, install cameras, need cleaning company...',
    btn:          'Show Best Match',
    searching:    'Searching…',
    noCity:       'Choose your city first',
    noDesc:       'Describe your problem',
    noResults:    'No results in this city for this description',
    clarify:      'Are you looking for:',
    techBtn:      'Technician',
    compBtn:      'Service Company',
    suppBtn:      'Supplier',
    techSection:  'Suggested Technicians',
    compSection:  'Suggested Companies',
    suppSection:  'Suggested Suppliers',
    viewProfile:  'View Profile',
    rating:       'Rating',
    clear:        'Clear',
  },
}

function StarRating({ value }) {
  const full = Math.round(value || 0)
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= full ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function TechCard({ item, ar, t, navigate }) {
  const name = ar ? item.nameAr : (item.nameEn || item.nameAr)
  const category = ar ? item.categoryAr : (item.categoryEn || item.categoryAr)
  const photo = getFileUrl(item.profilePhoto)
  return (
    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
      style={{ border: '1.5px solid #E8ECF0' }}>
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {photo
          ? <img src={photo} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">👷</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#071B33] text-sm truncate">{name}</p>
        {category && <p className="text-xs text-[#FF7900] font-semibold truncate">{category}</p>}
        {item.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating value={item.rating} />
            <span className="text-[11px] text-gray-400">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <button onClick={() => navigate(`/technicians/${item.id}`)}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
        style={{ background: '#FF7900' }}>
        {t.viewProfile}
      </button>
    </div>
  )
}

function CompCard({ item, ar, t, navigate }) {
  const category = ar ? item.categoryAr : (item.categoryEn || item.categoryAr)
  const logo = getFileUrl(item.companyLogo)
  return (
    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
      style={{ border: '1.5px solid #E8ECF0' }}>
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {logo
          ? <img src={logo} alt={item.companyName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">🏢</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#071B33] text-sm truncate">{item.companyName}</p>
        {category && <p className="text-xs text-[#FF7900] font-semibold truncate">{category}</p>}
        {item.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating value={item.rating} />
            <span className="text-[11px] text-gray-400">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <button onClick={() => navigate(`/companies/${item.id}`)}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
        style={{ background: '#071B33' }}>
        {t.viewProfile}
      </button>
    </div>
  )
}

function SuppCard({ item, ar, t, navigate }) {
  const logo = getFileUrl(item.logo)
  return (
    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
      style={{ border: '1.5px solid #E8ECF0' }}>
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {logo
          ? <img src={logo} alt={item.businessName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#071B33] text-sm truncate">{item.businessName}</p>
        {item.customSupplyType && (
          <p className="text-xs text-[#FF7900] font-semibold truncate">{item.customSupplyType}</p>
        )}
      </div>
      <button onClick={() => navigate(`/suppliers/${item.id}`)}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
        style={{ background: '#1a5c3a' }}>
        {t.viewProfile}
      </button>
    </div>
  )
}

export default function SmartSearchBox({ cities = [] }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const t = T[lang]
  const [, navigate] = useLocation()

  const [cityId, setCityId]           = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]         = useState(false)
  const [results, setResults]         = useState(null)
  const [ambiguous, setAmbiguous]     = useState(false)
  const [error, setError]             = useState('')
  const [showCityDrop, setShowCityDrop] = useState(false)

  const selectedCity = cities.find(c => c.id === cityId)
  const cityLabel = selectedCity
    ? (ar ? selectedCity.nameAr : (selectedCity.nameEn || selectedCity.nameAr))
    : ''

  const doSearch = async (overrideType) => {
    if (!cityId) { setError(t.noCity); return }
    if (!description.trim()) { setError(t.noDesc); return }
    setError('')
    setLoading(true)
    setResults(null)
    setAmbiguous(false)
    try {
      const data = await api.smartSearch({ cityId, description: description.trim(), forceType: overrideType })
      if (data.ambiguous && !overrideType) {
        setAmbiguous(true)
      } else {
        setResults(data)
      }
    } catch {
      setError(t.noResults)
    } finally {
      setLoading(false)
    }
  }

  const hasResults = results && (
    results.technicians?.length > 0 ||
    results.companies?.length > 0 ||
    results.suppliers?.length > 0
  )

  const clearAll = () => {
    setDescription('')
    setResults(null)
    setAmbiguous(false)
    setError('')
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '2px solid #FF7900', background: 'linear-gradient(135deg, #fff9f4 0%, #fff 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3"
        style={{ borderBottom: '1.5px solid #FFE4C9' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF7900, #e06500)' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-black text-[#071B33] text-sm leading-tight">{t.title}</p>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{t.desc}</p>
        </div>
        {(description || results) && (
          <button onClick={clearAll}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#F0F2F5' }}>
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* City selector */}
        <div className="relative">
          <button
            onClick={() => setShowCityDrop(v => !v)}
            className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-semibold text-start"
            style={{ background: '#F8F9FA', border: `1.5px solid ${cityId ? '#FF7900' : '#D1D5DB'}`, color: cityId ? '#071B33' : '#9CA3AF' }}>
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: cityId ? '#FF7900' : '#9CA3AF' }} />
            <span className="flex-1">{cityLabel || t.chooseCity}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
          {showCityDrop && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto"
              style={{ border: '1.5px solid #E2E6EA' }}>
              {cities.map(city => {
                const label = ar ? city.nameAr : (city.nameEn || city.nameAr)
                return (
                  <button key={city.id}
                    onClick={() => { setCityId(city.id); setShowCityDrop(false); setResults(null); setAmbiguous(false) }}
                    className="w-full text-start px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors"
                    style={{ color: city.id === cityId ? '#FF7900' : '#071B33' }}>
                    {label}
                    {city.total > 0 && (
                      <span className="ms-2 text-[11px] text-[#FF7900]">({city.total})</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Description input */}
        <textarea
          value={description}
          onChange={e => { setDescription(e.target.value); setResults(null); setAmbiguous(false); setError('') }}
          placeholder={t.placeholder}
          rows={2}
          dir={ar ? 'rtl' : 'ltr'}
          className="w-full px-3.5 py-3 rounded-xl text-sm resize-none outline-none leading-relaxed"
          style={{ background: '#F8F9FA', border: '1.5px solid #D1D5DB', color: '#071B33' }}
          onFocus={e => e.target.style.border = '1.5px solid #FF7900'}
          onBlur={e => e.target.style.border = '1.5px solid #D1D5DB'}
        />

        {error && (
          <p className="text-xs font-semibold text-red-500 px-1">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={() => doSearch(null)}
          disabled={loading || !description.trim() || !cityId}
          className="w-full py-3.5 rounded-xl font-extrabold text-white text-sm active:scale-95 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.3)' }}>
          {loading
            ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⟳</span> {t.searching}</span>
            : <span className="flex items-center justify-center gap-2"><Search className="w-4 h-4" /> {t.btn}</span>}
        </button>

        {/* Clarification buttons */}
        {ambiguous && !loading && (
          <div className="rounded-xl p-3.5" style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
            <p className="text-sm font-bold text-[#92400E] mb-2.5">{t.clarify}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'technician', label: t.techBtn, bg: '#FF7900' },
                { key: 'company',    label: t.compBtn,  bg: '#071B33' },
                { key: 'supplier',   label: t.suppBtn,  bg: '#1a5c3a' },
              ].map(({ key, label, bg }) => (
                <button key={key}
                  onClick={() => { setAmbiguous(false); doSearch(key) }}
                  className="px-4 py-2 rounded-xl text-sm font-extrabold text-white active:scale-95 transition-transform"
                  style={{ background: bg }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="space-y-4 pt-1">
            {!hasResults && (
              <p className="text-center text-sm text-gray-400 py-4">{t.noResults}</p>
            )}

            {results.technicians?.length > 0 && (
              <div>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-2">👷 {t.techSection}</p>
                <div className="space-y-2">
                  {results.technicians.map(item => (
                    <TechCard key={item.id} item={item} ar={ar} t={t} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {results.companies?.length > 0 && (
              <div>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-2">🏢 {t.compSection}</p>
                <div className="space-y-2">
                  {results.companies.map(item => (
                    <CompCard key={item.id} item={item} ar={ar} t={t} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {results.suppliers?.length > 0 && (
              <div>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-2">📦 {t.suppSection}</p>
                <div className="space-y-2">
                  {results.suppliers.map(item => (
                    <SuppCard key={item.id} item={item} ar={ar} t={t} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
