import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import { useSeoMeta } from '../hooks/useSeoMeta'
import BackHeader from '../components/BackHeader'
import ServiceImageIcon from '../components/ServiceImageIcon'
import { categories } from '../data/services'
import { useRoute, useLocation } from 'wouter'
import { getFileUrl } from '../lib/api'
import { SkeletonListCards } from '../components/Skeleton'
import {
  Star, MapPin, Phone, MessageSquare, Zap, Search,
  Users, Loader2, Building2, Heart, Navigation, Map, List, X as XIcon,
} from 'lucide-react'
import AdBanner from '../components/AdBanner'
import api from '../lib/api'
import MapView, { haversine, formatDist } from '../components/MapView'

function useFavorites(storageKey) {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })
  const toggle = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }
  return { favs, toggle, isFav: (id) => favs.includes(id) }
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function TechCard({ tech, lang, onOpen, isFav, onToggleFav, categoryName, distance }) {
  const ar = lang === 'ar'
  const name = tech.nameAr || tech.name_ar || ''
  const firstName = name ? (name.trim().split(' ')[0] || '?') : '?'
  const photo = getFileUrl(tech.profilePhoto || tech.profile_photo || null)
  const availableNow = tech.availableNow ?? tech.available_now ?? (tech.status === 'available')
  const emergency = tech.emergency || false
  const isFeatured = tech.isFeatured ?? tech.is_featured ?? false
  const rating = tech.rating || 0
  const reviewsCount = tech.reviewsCount ?? tech.reviews_count ?? 0
  const priceFrom = tech.priceFrom ?? tech.price_from ?? 0
  const city = (ar ? tech.city_name_ar : tech.city_name_en) || tech.city_name_ar || tech.city_name || tech.city || ''
  const area = tech.area || ''
  const _td = tech.createdAt || tech.created_at
  const tecId = `TEC-${_td ? new Date(_td).getFullYear() : new Date().getFullYear()}-${String(tech.id || '').replace(/\D/g, '').slice(-6)}`

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onOpen(tech.id)}
    >
      <div className="relative">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
            <span className="text-white text-2xl font-bold text-center px-2">{firstName}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {availableNow && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ar ? 'متاح الآن' : 'Available'}
            </span>
          )}
          {emergency && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> {ar ? 'طوارئ' : 'Emergency'}
            </span>
          )}
          {isFeatured && (
            <span className="bg-[#FF7900] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5" fill="currentColor" /> {ar ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>
        {/* Heart button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(tech.id) }}
          className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isFav ? 'text-rose-500' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="p-3.5">
        <p className="font-bold text-gray-900 text-sm mb-0.5 leading-tight">{name}</p>
        <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-1">{tecId}</p>

        {categoryName && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#FF7900] flex-shrink-0" />
            <span className="text-sm font-extrabold text-[#FF7900] truncate">{categoryName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {city}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {distance != null && (
          <div className="flex items-center gap-1 mb-2">
            <Navigation className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-green-700">{formatDist(distance, ar)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Stars rating={rating} />
            {reviewsCount > 0 && (
              <span className="text-xs text-gray-400">({reviewsCount})</span>
            )}
          </div>
          {priceFrom > 0 && (
            <p className="text-xs font-bold text-[#FF7900]">
              {ar ? `من ${priceFrom} د.ل` : `From ${priceFrom} LYD`}
            </p>
          )}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <a
            href={`https://wa.me/${tech.whatsapp || tech.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {ar ? 'واتساب' : 'WhatsApp'}
          </a>
          <a
            href={`tel:${tech.phone}`}
            className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {ar ? 'اتصال' : 'Call'}
          </a>
        </div>
      </div>
    </div>
  )
}

function isNewProfile(createdAt) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

function CompanyCard({ company, lang, onOpen, isFav, onToggleFav, categoryName, distance }) {
  const ar = lang === 'ar'
  const name = company.companyName || company.company_name || ''
  const isNew = isNewProfile(company.createdAt || company.created_at)
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'
  const logo = getFileUrl(company.companyLogo || company.company_logo || null)
  const availableNow = company.availableNow ?? company.available_now ?? false
  const emergency = company.emergency || false
  const priceFrom = company.priceFrom || company.price_from || ''
  const city = company.city || ''
  const area = company.area || ''
  const _ccd = company.createdAt || company.created_at
  const comId = `COM-${_ccd ? new Date(_ccd).getFullYear() : new Date().getFullYear()}-${String(company.id || '').replace(/\D/g, '').slice(-6)}`

  return (
    <div
      className="bg-[#EBF5FF] rounded-2xl border border-blue-300 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onOpen(company.id)}
    >
      <div className="relative">
        {logo ? (
          <img src={logo} alt={name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
            <span className="text-white text-2xl font-bold text-center px-2">{firstWord}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Building2 className="w-2.5 h-2.5" /> {ar ? 'شركة خدمية' : 'Service Co.'}
          </span>
          {isNew && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {ar ? 'جديد' : 'New'}
            </span>
          )}
          {availableNow && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ar ? 'متاحة الآن' : 'Available'}
            </span>
          )}
          {emergency && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> {ar ? 'طوارئ' : 'Emergency'}
            </span>
          )}
        </div>
        {/* Heart button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(company.id) }}
          className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isFav ? 'text-rose-500' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
          <span className="text-[9px] font-black bg-[#071B33] text-white px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">خدمية</span>
        </div>
        <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-1">{comId}</p>

        {categoryName && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1 h-4 rounded-full bg-[#FF7900] flex-shrink-0" />
            <span className="text-sm font-extrabold text-[#FF7900] truncate">{categoryName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {city}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {distance != null && (
          <div className="flex items-center gap-1 mb-2">
            <Navigation className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-green-700">{formatDist(distance, ar)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            {ar ? 'شركة / مؤسسة' : 'Business'}
          </span>
          {priceFrom && (
            <p className="text-xs font-bold text-[#FF7900]">
              {ar ? `من ${priceFrom} د.ل` : `From ${priceFrom} LYD`}
            </p>
          )}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <a
            href={`https://wa.me/${company.whatsapp || company.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {ar ? 'واتساب' : 'WhatsApp'}
          </a>
          <a
            href={`tel:${company.phone}`}
            className="flex-1 bg-[#071B33] hover:bg-[#0f2d52] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {ar ? 'اتصال' : 'Call'}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── City Picker Step ────────────────────────────────────────────────────────
function CityPicker({ cities, categoryName, categoryIcon, ar, onSelect }) {
  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={categoryName} />

      <main className="px-4 pt-5">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center overflow-hidden bg-[#FF7900]/10">
            <img src={categoryIcon} alt="" className="w-11 h-11 object-contain" />
          </div>
          <h2 className="text-xl font-black text-[#071B33]">
            {ar ? 'اختر المدينة' : 'Select City'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {ar ? 'اختر مدينتك لعرض الفنيين المتاحين' : 'Choose your city to see available providers'}
          </p>
        </div>

        {/* All cities button */}
        <button
          onClick={() => onSelect('')}
          className="w-full flex flex-col items-center justify-center bg-blue-600 rounded-2xl px-4 py-5 mb-5 active:scale-[0.98] transition-transform shadow-lg shadow-blue-200"
        >
          <p className="font-extrabold text-white text-2xl tracking-wide">{ar ? '🇱🇾 كل ليبيا' : '🇱🇾 All Libya'}</p>
          <p className="text-sm text-blue-100 mt-1">{ar ? 'عرض جميع الفنيين في البلاد' : 'Show all providers across the country'}</p>
        </button>

        {/* Section label */}
        <div className="px-1 pb-2 pt-1">
          <span className="inline-flex items-center bg-[#071B33] text-white text-[12px] font-bold px-3 py-1 rounded-full">
            {ar ? 'المدن' : 'Cities'}
          </span>
        </div>

        {/* Cities — 4-column grid, name on card */}
        <div className="grid grid-cols-4 gap-2.5">
          {cities.map((city) => {
            const cityName = ar ? (city.name_ar || city.nameAr || '') : (city.name_en || city.nameEn || '')
            return (
              <button
                key={city.id}
                onClick={() => onSelect(city.id)}
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

export default function CategoryTechnicians() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/category/:id')
  const [location, navigate] = useLocation()
  const categoryId = params?.id
  const { isFav, toggle: toggleFav } = useFavorites('fav_technicians')
  const { isFav: isCompanyFav, toggle: toggleCompanyFav } = useFavorites('fav_companies')

  const category = categories.find(c => c.id === categoryId)
  const categoryName = ar ? (category?.nameAr || '') : (category?.nameEn || '')

  const iconMap = {
    electricity:'/icons/services/electricity.svg', plumbing:'/icons/services/plumbing.svg',
    ac:'/icons/services/ac.svg', painting:'/icons/services/painting.svg',
    carpentry:'/icons/services/carpentry.svg', cleaning:'/icons/services/cleaning.svg',
    moving:'/icons/services/moving.svg', cctv:'/icons/services/cctv.svg',
    network:'/icons/services/network.svg', maintenance:'/icons/services/maintenance.svg',
    appliances:'/icons/services/appliances.svg', welding:'/icons/services/welding.svg',
    aluminum_glass:'/icons/services/aluminum-glass.svg', waterproofing:'/icons/services/waterproofing.svg',
    thermal_insulation:'/icons/services/thermal-insulation.svg', gas:'/icons/services/gas.svg',
    locks_doors:'/icons/services/locks-doors.svg', contracting:'/icons/services/contracting.svg',
    tiles:'/icons/services/tiles.svg', more:'/icons/services/more.svg',
  }
  const categoryIcon = iconMap[category?.iconName] || iconMap[categoryId] || '/icons/services/maintenance.svg'

  const [cityChosen, setCityChosen] = useState(
    () => window.location.search.includes('city=')
  )
  const [selectedCity, setSelectedCity] = useState(
    () => new URLSearchParams(window.location.search).get('city') ?? ''
  )
  const [cities, setCities]             = useState([])
  const [selectedCityName, setSelectedCityName] = useState('')

  useSeoMeta({
    title: categoryName
      ? (selectedCityName
        ? (ar ? `${categoryName} في ${selectedCityName}` : `${categoryName} in ${selectedCityName}`)
        : categoryName)
      : null,
    description: categoryName
      ? (ar
        ? `اعثر على أفضل ${categoryName}${selectedCityName ? ` في ${selectedCityName}` : ''} عبر منصة اطلب فني في ليبيا`
        : `Find top ${categoryName}${selectedCityName ? ` in ${selectedCityName}` : ''} on Otlob Fanni Libya`)
      : null,
  })

  const [techs, setTechs]               = useState([])
  const [companies, setCompanies]       = useState([])
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [visibleTechs, setVisibleTechs]         = useState(20)
  const [visibleCompanies, setVisibleCompanies] = useState(20)
  const [userLocation, setUserLocation]   = useState(null)
  const [nearMeLoading, setNearMeLoading] = useState(false)
  const [viewMode, setViewMode]           = useState('list')

  // Sync state with URL when user presses browser back/forward
  useEffect(() => {
    const onPop = () => {
      const city = new URLSearchParams(window.location.search).get('city') ?? ''
      setSelectedCity(city)
      setCityChosen(window.location.search.includes('city='))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    api.cities().then(setCities).catch(() => {})
  }, [])

  // Resolve city name once cities are loaded
  useEffect(() => {
    if (!cities.length || !selectedCity) return
    const found = cities.find(c => c.id === selectedCity)
    setSelectedCityName(ar ? (found?.name_ar || '') : (found?.name_en || ''))
  }, [cities, selectedCity, ar])

  // After city is chosen, load results
  useEffect(() => {
    if (!categoryId || !cityChosen) return
    setLoading(true)
    setError(null)
    Promise.all([
      api.technicians({ category: categoryId, city_id: selectedCity || undefined }),
      api.companies({ specialty: categoryId, city: selectedCity || undefined }),
    ])
      .then(([techData, compData]) => {
        setTechs(techData)
        setCompanies(compData)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [categoryId, cityChosen, selectedCity])

  const handleCitySelect = (cityId) => {
    setSelectedCity(cityId)
    setCityChosen(true)
    navigate(`/category/${categoryId}?city=${cityId}`)
  }

  const handleNearMe = () => {
    if (userLocation) { setUserLocation(null); return }
    if (!navigator.geolocation) return
    setNearMeLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMeLoading(false)
      },
      () => setNearMeLoading(false),
      { timeout: 8000 }
    )
  }

  useEffect(() => {
    setVisibleTechs(20)
    setVisibleCompanies(20)
  }, [search, categoryId, selectedCity])

  // Show city picker if no city in URL yet
  if (!cityChosen) {
    return (
      <CityPicker
        cities={cities}
        categoryName={categoryName}
        categoryIcon={categoryIcon}
        ar={ar}
        onSelect={handleCitySelect}
      />
    )
  }

  const withDist = (item) => ({
    ...item,
    _dist: (userLocation && item.lat && item.lng)
      ? haversine(userLocation.lat, userLocation.lng, item.lat, item.lng)
      : null,
  })
  const byDist = (a, b) => {
    if (a._dist == null && b._dist == null) return 0
    if (a._dist == null) return 1
    if (b._dist == null) return -1
    return a._dist - b._dist
  }

  const filteredTechs = techs
    .filter(t => {
      if (!search) return true
      const name = (t.nameAr || t.name_ar || '').toLowerCase()
      const city = (t.city_name || t.city || '').toLowerCase()
      const area = (t.area || '').toLowerCase()
      const q    = search.toLowerCase()
      return name.includes(q) || city.includes(q) || area.includes(q)
    })
    .map(withDist)
    .sort(byDist)

  const filteredCompanies = companies
    .filter(c => {
      if (!search) return true
      const name = (c.companyName || c.company_name || '').toLowerCase()
      const city = (c.city || '').toLowerCase()
      const area = (c.area || '').toLowerCase()
      const q    = search.toLowerCase()
      return name.includes(q) || city.includes(q) || area.includes(q)
    })
    .map(withDist)
    .sort(byDist)

  const shownTechs     = filteredTechs.slice(0, visibleTechs)
  const shownCompanies = filteredCompanies.slice(0, visibleCompanies)
  const totalCount     = filteredTechs.length + filteredCompanies.length

  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={categoryName || (ar ? 'مقدمو الخدمة' : 'Service Providers')} />

      <main className="px-4 pt-4 space-y-4">

        {/* شعار التخصص + المدينة */}
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
          <div className="w-12 h-12 bg-[#FF7900]/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={categoryIcon} alt="" className="w-9 h-9 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#071B33] text-base">{categoryName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#FF7900] flex-shrink-0" />
              <p className="text-xs text-gray-500 font-medium">
                {selectedCityName || (ar ? 'كل ليبيا' : 'All Libya')}
              </p>
              <span className="text-gray-300">·</span>
              <p className="text-xs text-gray-400">
                {loading ? (ar ? 'جارٍ التحميل...' : 'Loading...') : ar ? `${totalCount} مقدّم` : `${totalCount} providers`}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setCityChosen(false); setTechs([]); setCompanies([]) }}
            className="flex-shrink-0 bg-[#F2F2F7] text-[#071B33] text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            {ar ? 'غيّر المدينة' : 'Change'}
          </button>
        </div>

        {/* بحث + Near Me + View Toggle */}
        <div className="space-y-2">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 ${ar ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? 'بحث عن فني أو شركة...' : 'Search provider...'}
              className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 ${ar ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNearMe}
              disabled={nearMeLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all flex-shrink-0 ${
                userLocation
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-600 border-gray-200 active:scale-95'
              }`}
            >
              {nearMeLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Navigation className="w-3.5 h-3.5" />}
              {ar ? 'الأقرب إليّ' : 'Near Me'}
              {userLocation && (
                <span
                  onClick={e => { e.stopPropagation(); setUserLocation(null) }}
                  className="ml-0.5 text-green-600 hover:text-red-500 cursor-pointer"
                >
                  <XIcon className="w-3 h-3 inline" />
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 active:scale-95 transition-all flex-shrink-0"
            >
              {viewMode === 'list'
                ? <><Map className="w-3.5 h-3.5" />{ar ? 'خريطة' : 'Map'}</>
                : <><List className="w-3.5 h-3.5" />{ar ? 'قائمة' : 'List'}</>}
            </button>
          </div>
          {userLocation && (
            <p className="text-[11px] text-green-600 font-medium px-1">
              ✓ {ar ? 'يتم الترتيب حسب المسافة منك' : 'Sorted by distance from you'}
            </p>
          )}
        </div>

        {/* إعلان */}
        <AdBanner placement="category_page" categoryId={categoryId} dismissible />

        {/* Map View */}
        {viewMode === 'map' && !loading && (
          <MapView
            techs={filteredTechs}
            companies={filteredCompanies}
            userLocation={userLocation}
            ar={ar}
            onSelectTech={id => navigate(`/technician/${id}`)}
            onSelectCompany={id => navigate(`/company/${id}`)}
          />
        )}

        {/* القائمة */}
        {viewMode === 'list' && loading ? (
          <SkeletonListCards count={4} />
        ) : viewMode === 'list' && error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-red-500 text-sm">{ar ? 'حدث خطأ أثناء التحميل' : 'Error loading data'}</p>
            <button onClick={() => window.location.reload()}
              className="text-[#FF7900] text-sm font-medium hover:underline">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : viewMode === 'list' && totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-[#FF7900]/40" />
            </div>
            <div>
              <p className="text-[#071B33] font-extrabold text-base mb-1">
                {ar ? 'لم يتم العثور على نتائج' : 'No results found'}
              </p>
              <p className="text-gray-400 text-sm max-w-[240px] mx-auto leading-relaxed">
                {ar
                  ? 'جرّب تخصصاً أو مدينة أخرى'
                  : 'Try a different specialty or city'}
              </p>
            </div>
            {selectedCity && (
              <button
                onClick={() => { setSelectedCity(''); setCityChosen(false); navigate(`/category/${categoryId}`) }}
                className="bg-[#FF7900] text-white text-sm font-bold px-5 py-2.5 rounded-xl active:scale-[0.97] transition-transform shadow-sm shadow-[#FF7900]/30">
                {ar ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {/* الفنيون الأفراد */}
            {filteredTechs.length > 0 && (
              <div>
                {filteredCompanies.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                    <Users className="w-4 h-4 text-[#FF7900]" />
                    <p className="text-sm font-bold text-[#FF7900]">
                      {ar ? `فنيون (${filteredTechs.length})` : `Technicians (${filteredTechs.length})`}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {shownTechs.map(tech => (
                    <TechCard
                      key={tech.id}
                      tech={tech}
                      lang={lang}
                      onOpen={(id) => navigate(`/technician/${id}`)}
                      isFav={isFav(tech.id)}
                      onToggleFav={toggleFav}
                      categoryName={categoryName}
                      distance={tech._dist}
                    />
                  ))}
                </div>
                {filteredTechs.length > visibleTechs && (
                  <button
                    onClick={() => setVisibleTechs(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-[#FF7900]/30 text-[#FF7900] font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredTechs.length - visibleTechs})`
                      : `Load More (${filteredTechs.length - visibleTechs})`}
                  </button>
                )}
              </div>
            )}

            {/* الشركات */}
            {filteredCompanies.length > 0 && (
              <div>
                {filteredTechs.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-600 rounded-xl">
                    <Building2 className="w-4 h-4 text-white" />
                    <p className="text-sm font-bold text-white">
                      {ar ? `شركات ومؤسسات (${filteredCompanies.length})` : `Companies (${filteredCompanies.length})`}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {shownCompanies.map(company => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      lang={lang}
                      onOpen={(id) => navigate(`/company/${id}`)}
                      isFav={isCompanyFav(company.id)}
                      onToggleFav={toggleCompanyFav}
                      categoryName={categoryName}
                      distance={company._dist}
                    />
                  ))}
                </div>
                {filteredCompanies.length > visibleCompanies && (
                  <button
                    onClick={() => setVisibleCompanies(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-blue-300 text-blue-600 font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredCompanies.length - visibleCompanies})`
                      : `Load More (${filteredCompanies.length - visibleCompanies})`}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}

      </main>
    </div>
  )
}
