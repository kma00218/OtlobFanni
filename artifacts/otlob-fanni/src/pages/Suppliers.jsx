import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Phone, MapPin, Package, MessageCircle, Search, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { SUPPLY_TYPES, supplyTypeLabel } from '../data/suppliers'
import { useSearch, useLocation } from 'wouter'

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// ─── City Picker (matches CategoryTechnicians style exactly) ──────────────────
function CityPicker({ cities, typeName, typeEmoji, ar, onSelect }) {
  return (
    <div className="bg-[#ECEEF2] min-h-screen pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={typeName} />

      <main className="px-4 pt-20">
        {/* Header */}
        <div className="text-center mb-6 pt-5">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-[#0e5c6d]/10 text-4xl">
            {typeEmoji}
          </div>
          <h2 className="text-xl font-black text-[#071B33]">
            {ar ? 'اختر المدينة' : 'Select City'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {ar ? 'اختر مدينتك لعرض المزودين المتاحين' : 'Choose your city to see available suppliers'}
          </p>
        </div>

        {/* All Libya button */}
        <button
          onClick={() => onSelect('')}
          className="w-full flex flex-col items-center justify-center bg-blue-600 rounded-2xl px-4 py-5 mb-5 active:scale-[0.98] transition-transform shadow-lg shadow-blue-200"
        >
          <p className="font-extrabold text-white text-2xl tracking-wide">🇱🇾 {ar ? 'كل ليبيا' : 'All Libya'}</p>
          <p className="text-sm text-blue-100 mt-1">{ar ? 'عرض جميع المزودين في البلاد' : 'Show all suppliers across the country'}</p>
        </button>

        {/* Cities label */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          {ar ? 'المدن' : 'Cities'}
        </p>

        {/* 4-col grid of cities */}
        <div className="grid grid-cols-4 gap-2.5">
          {cities.map((city) => {
            const cityName = ar ? (city.name_ar || city.nameAr || '') : (city.name_en || city.nameEn || '')
            return (
              <button
                key={city.id}
                onClick={() => onSelect(ar ? (city.name_ar || city.nameAr) : (city.name_en || city.nameEn))}
                className="flex items-center justify-center bg-white border border-gray-100 rounded-2xl active:scale-95 transition-transform shadow-sm aspect-square"
              >
                <span className="text-[#071B33] font-extrabold text-[17px] text-center leading-snug w-full px-1.5 line-clamp-2">{cityName}</span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Suppliers() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const searchStr = useSearch()
  const searchParams = new URLSearchParams(searchStr)
  const typeFromUrl = searchParams.get('type') || ''
  const cityFromUrl = searchParams.get('city') || ''

  const [, navigate] = useLocation()

  const [suppliers, setSuppliers] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState(typeFromUrl)
  const [filterCity, setFilterCity] = useState(cityFromUrl)
  const [showFilters, setShowFilters] = useState(false)

  // City picker shown when coming from a supply type and no city chosen yet
  const [cityChosen, setCityChosen] = useState(
    !typeFromUrl || !!cityFromUrl
  )
  const [selectedCityName, setSelectedCityName] = useState(cityFromUrl)

  useEffect(() => {
    Promise.all([
      api.suppliers(),
      api.cities(),
    ]).then(([sups, cts]) => {
      setSuppliers(sups)
      setCities(cts)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const typeInfo = SUPPLY_TYPES.find(t => t.id === typeFromUrl)
  const typeName = typeFromUrl
    ? (ar ? (typeInfo?.nameAr || typeFromUrl) : (typeInfo?.nameEn || typeFromUrl))
    : (ar ? 'مستلزمات اطلب فني' : 'Otlob Fanni Supplies')
  const typeEmoji = typeInfo?.emoji || '📦'

  const handleCitySelect = (cityName) => {
    setFilterCity(cityName)
    setSelectedCityName(cityName)
    setCityChosen(true)
  }

  // ── City Picker step ──────────────────────────────────────────────────────
  if (!cityChosen) {
    return (
      <CityPicker
        cities={cities}
        typeName={typeName}
        typeEmoji={typeEmoji}
        ar={ar}
        onSelect={handleCitySelect}
      />
    )
  }

  // ── Suppliers List ────────────────────────────────────────────────────────
  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.businessName?.toLowerCase().includes(q) ||
      s.contactName?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    const matchType = !filterType || s.supplyType === filterType || (filterType === 'other' && s.customSupplyType)
    const matchCity = !filterCity || s.city === filterCity
    return matchSearch && matchType && matchCity
  })

  const openWhatsApp = (phone) => {
    window.open(`https://wa.me/${(phone || '').replace(/\D/g, '')}`, '_blank')
  }

  const openPhone = (phone) => {
    window.open(`tel:${phone}`, '_self')
  }

  const getSupplyLabel = (s) => {
    if (s.supplyType === 'other' && s.customSupplyType) return s.customSupplyType
    return supplyTypeLabel(s.supplyType)
  }

  const getSupplyEmoji = (type) => {
    return SUPPLY_TYPES.find(t => t.id === type)?.emoji || '📦'
  }

  const pageTitle = selectedCityName
    ? `${typeName} — ${selectedCityName}`
    : typeName

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={pageTitle} />

      <div className="px-4 pt-3 pb-4 space-y-3">

        {/* City breadcrumb — tap to change city */}
        {typeFromUrl && (
          <button
            onClick={() => setCityChosen(false)}
            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm active:scale-[0.98] transition-transform w-full"
          >
            <MapPin className="w-4 h-4 text-[#0e5c6d] flex-shrink-0" />
            <span className="text-sm font-semibold text-[#071B33] flex-1 text-start">
              {selectedCityName || (ar ? '🇱🇾 كل ليبيا' : '🇱🇾 All Libya')}
            </span>
            <span className="text-xs text-[#FF7900] font-bold">
              {ar ? 'تغيير' : 'Change'}
            </span>
          </button>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" style={{ [ar ? 'right' : 'left']: '14px' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ar ? 'ابحث عن مورّد أو منتج...' : 'Search supplier or product...'}
            className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm text-sm text-[#071B33] placeholder-gray-400 focus:outline-none focus:border-[#FF7900] transition-colors py-3"
            style={{ [ar ? 'paddingRight' : 'paddingLeft']: '40px', [ar ? 'paddingLeft' : 'paddingRight']: '16px' }}
          />
        </div>

        {/* Filter toggle — only show when NOT coming from a type URL */}
        {!typeFromUrl && (
          <>
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 text-sm text-[#071B33] font-semibold px-1">
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              {ar ? 'تصفية النتائج' : 'Filter'}
              {(filterType || filterCity) && <span className="bg-[#FF7900] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {[filterType, filterCity].filter(Boolean).length}
              </span>}
            </button>

            {showFilters && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">{ar ? 'نوع المستلزمات' : 'Supply Type'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setFilterType('')}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${!filterType ? 'bg-[#071B33] text-white border-[#071B33]' : 'bg-white text-gray-600 border-gray-300'}`}>
                      {ar ? 'الكل' : 'All'}
                    </button>
                    {SUPPLY_TYPES.filter(t => t.id !== 'other').map(t => (
                      <button key={t.id} onClick={() => setFilterType(filterType === t.id ? '' : t.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${filterType === t.id ? 'bg-[#0e5c6d] text-white border-[#0e5c6d]' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {t.emoji} {ar ? t.nameAr : t.nameEn}
                      </button>
                    ))}
                  </div>
                </div>
                {cities.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">{ar ? 'المدينة' : 'City'}</p>
                    <select
                      className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 text-[#071B33] bg-white focus:outline-none focus:border-[#FF7900]"
                      value={filterCity}
                      onChange={e => setFilterCity(e.target.value)}>
                      <option value="">{ar ? 'كل المدن' : 'All Cities'}</option>
                      {cities.map(c => (
                        <option key={c.id} value={ar ? c.nameAr : c.nameEn}>{ar ? c.nameAr : c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Count */}
        {!loading && (
          <p className="text-xs text-gray-500 px-1">
            {ar ? `${filtered.length} مزود` : `${filtered.length} supplier${filtered.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#0e5c6d] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium text-sm">
              {ar ? 'لا توجد نتائج' : 'No results found'}
            </p>
          </div>
        )}

        {/* Supplier Cards */}
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

              {/* Teal top bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0e5c6d, #1a8fa8)' }} />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  {s.logo ? (
                    <img src={s.logo.startsWith('/objects/') ? `/api/storage${s.logo}` : s.logo}
                      alt={s.businessName}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: 'linear-gradient(135deg, #0e7c8f 0%, #071B33 100%)' }}>
                      {getSupplyEmoji(s.supplyType)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[#071B33] text-base leading-tight line-clamp-1">{s.businessName}</h3>
                    {s.contactName && (
                      <p className="text-xs text-gray-500 mt-0.5">{s.contactName}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="bg-[#0e5c6d]/10 text-[#0e5c6d] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {getSupplyEmoji(s.supplyType)} {getSupplyLabel(s)}
                      </span>
                      {s.city && (
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400 font-medium">
                          <MapPin className="w-3 h-3" />{s.city}
                          {s.area ? `, ${s.area}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {s.description && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">{s.description}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  {s.whatsapp && (
                    <button
                      onClick={() => openWhatsApp(s.whatsapp)}
                      className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                      <WaIcon /> {ar ? 'واتساب' : 'WhatsApp'}
                    </button>
                  )}
                  {s.phone && (
                    <button
                      onClick={() => openPhone(s.phone)}
                      className="flex-1 bg-[#071B33] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                      <Phone className="w-3.5 h-3.5" /> {ar ? 'اتصال' : 'Call'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
