import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import { useSeoMeta } from '../hooks/useSeoMeta'
import BackHeader from '../components/BackHeader'
import { MapPin, Globe, Search, Building2, Package, Star, Phone, MessageSquare, Zap, Heart } from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { SkeletonListCards } from '../components/Skeleton'
import { categories as staticCategoriesData } from '../data/services'
import { useAllCategories } from '../hooks/useAllCategories'

function useFavorites(key) {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })
  const toggle = (id) => setFavs(prev => {
    const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    localStorage.setItem(key, JSON.stringify(next))
    return next
  })
  return { isFav: (id) => favs.includes(id), toggle }
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

function TechGrid({ tech, ar, onOpen, isFav, onToggleFav, categoryName }) {
  const name = (ar ? tech.nameAr : tech.nameEn) || tech.nameAr || ''
  const firstName = name ? (name.trim().split(' ')[0] || '؟') : '؟'
  const photo = getFileUrl(tech.profilePhoto || tech.profile_photo || null)
  const availableNow = tech.availableNow ?? tech.available_now ?? (tech.status === 'available')
  const emergency = tech.emergency || false
  const isFeatured = tech.isFeatured ?? tech.is_featured ?? false
  const rating = tech.rating || 0
  const reviewsCount = tech.reviewsCount ?? tech.reviews_count ?? 0
  const city = (ar ? tech.cityAr || tech.city_name_ar : tech.cityEn || tech.city_name_en) || tech.city_name_ar || tech.city || ''
  const area = tech.area || ''
  const phone = tech.phone || ''
  const whatsapp = tech.whatsapp || phone

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex flex-col border-t-[3px] border-t-[#FF7900]"
      onClick={() => onOpen(tech.id)}>
      <div className="relative">
        {photo
          ? <img src={photo} alt={name} className="w-full h-32 object-cover" />
          : <div className="w-full h-32 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
              <span className="text-white text-xl font-bold text-center px-2">{firstName}</span>
            </div>}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
          {availableNow && <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{ar ? 'متاح' : 'Available'}</span>}
          {emergency && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 leading-none"><Zap className="w-2 h-2" />{ar ? 'طوارئ' : 'Emergency'}</span>}
          {isFeatured && <span className="bg-[#FF7900] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 leading-none"><Star className="w-2 h-2" fill="currentColor" />{ar ? 'مميز' : 'Featured'}</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onToggleFav(tech.id) }}
          className="absolute top-1.5 left-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
          <Heart className={`w-3 h-3 ${isFav ? 'text-rose-500' : 'text-gray-400'}`} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="font-bold text-[#071B33] text-sm leading-tight mb-0.5 truncate">{name}</p>
        {categoryName && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="w-1 h-3 rounded-full bg-[#FF7900] flex-shrink-0" />
            <span className="text-xs font-extrabold text-[#FF7900] truncate">{categoryName}</span>
          </div>
        )}
        <div className="flex items-center gap-0.5 mb-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-[11px] text-gray-400 truncate">{city}{area ? ` · ${area}` : ''}</p>
        </div>
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Stars rating={rating} />
            {reviewsCount > 0 && <span className="text-[10px] text-gray-400">({reviewsCount})</span>}
          </div>
        )}
        <div className="flex gap-1.5 mt-auto" onClick={e => e.stopPropagation()}>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
            className="flex-1 bg-green-500 text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
            <MessageSquare className="w-3 h-3" />{ar ? 'واتساب' : 'WA'}
          </a>
          <a href={`tel:${phone}`}
            className="flex-1 bg-[#071B33] text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" />{ar ? 'اتصال' : 'Call'}
          </a>
        </div>
      </div>
    </div>
  )
}

function CompanyGrid({ company, ar, onOpen, isFav, onToggleFav }) {
  const name = company.companyName || company.company_name || ''
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'
  const logo = getFileUrl(company.companyLogo || company.company_logo || null)
  const category = ar ? company.categoryAr : company.categoryEn
  const availableNow = company.availableNow ?? company.available_now ?? false
  const emergency = company.emergency || false
  const isFeatured = company.isFeatured ?? company.is_featured ?? false
  const city = company.city || ''
  const area = company.area || ''
  const phone = company.phone || ''
  const whatsapp = company.whatsapp || phone

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex flex-col border-t-[3px] border-t-[#1e40af]"
      onClick={() => onOpen(company.id)}>
      <div className="relative">
        {logo
          ? <img src={logo} alt={name} className="w-full h-32 object-cover" />
          : <div className="w-full h-32 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
              <span className="text-white text-xl font-bold text-center px-2">{firstWord}</span>
            </div>}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"><Building2 className="w-2 h-2 inline" /> {ar ? 'خدمية' : 'Company'}</span>
          {availableNow && <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{ar ? 'متاح' : 'Available'}</span>}
          {emergency && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 leading-none"><Zap className="w-2 h-2" />{ar ? 'طوارئ' : 'Emergency'}</span>}
          {isFeatured && <span className="bg-[#FF7900] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 leading-none"><Star className="w-2 h-2" fill="currentColor" />{ar ? 'مميز' : 'Featured'}</span>}
        </div>
        {isFav !== undefined && (
          <button onClick={e => { e.stopPropagation(); onToggleFav(company.id) }}
            className="absolute top-1.5 left-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
            <Heart className={`w-3 h-3 ${isFav ? 'text-rose-500' : 'text-gray-400'}`} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="font-bold text-[#071B33] text-sm leading-tight mb-0.5 truncate">{name}</p>
        {category && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="w-1 h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-xs font-extrabold text-blue-600 truncate">{category}</span>
          </div>
        )}
        <div className="flex items-center gap-0.5 mb-2">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-[11px] text-gray-400 truncate">{city}{area ? ` · ${area}` : ''}</p>
        </div>
        <div className="flex gap-1.5 mt-auto" onClick={e => e.stopPropagation()}>
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
            className="flex-1 bg-green-500 text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
            <MessageSquare className="w-3 h-3" />{ar ? 'واتساب' : 'WA'}
          </a>}
          {phone && <a href={`tel:${phone}`}
            className="flex-1 bg-[#071B33] text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" />{ar ? 'اتصال' : 'Call'}
          </a>}
        </div>
      </div>
    </div>
  )
}

function SupplierGrid({ supplier, ar, onOpen }) {
  const name = supplier.businessName || supplier.business_name || ''
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'
  const logo = getFileUrl(supplier.logo || null)
  const supplyLabel = supplier.customSupplyType || supplier.custom_supply_type || supplier.supplyType || supplier.supply_type || ''
  const city = supplier.city || ''
  const phone = supplier.phone || ''
  const whatsapp = supplier.whatsapp || phone

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex flex-col border-t-[3px] border-t-[#0e7c8f]"
      onClick={() => onOpen(supplier.id)}>
      <div className="relative">
        {logo
          ? <img src={logo} alt={name} className="w-full h-32 object-cover" />
          : <div className="w-full h-32 bg-gradient-to-br from-[#0a4e60] to-[#0e7c8f] flex items-center justify-center">
              <span className="text-white text-xl font-bold text-center px-2">{firstWord}</span>
            </div>}
        <div className="absolute top-1.5 right-1.5">
          <span className="bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{ar ? 'مورد' : 'Supplier'}</span>
        </div>
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <p className="font-bold text-[#071B33] text-sm leading-tight mb-0.5 truncate">{name}</p>
        {supplyLabel && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="w-1 h-3 rounded-full bg-teal-500 flex-shrink-0" />
            <span className="text-xs font-extrabold text-teal-600 truncate">{supplyLabel}</span>
          </div>
        )}
        {city && (
          <div className="flex items-center gap-0.5 mb-2">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-[11px] text-gray-400 truncate">{city}</p>
          </div>
        )}
        <div className="flex gap-1.5 mt-auto" onClick={e => e.stopPropagation()}>
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
            className="flex-1 bg-green-500 text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
            <MessageSquare className="w-3 h-3" />{ar ? 'واتساب' : 'WA'}
          </a>}
          {phone && <a href={`tel:${phone}`}
            className="flex-1 bg-[#071B33] text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" />{ar ? 'اتصال' : 'Call'}
          </a>}
        </div>
      </div>
    </div>
  )
}

export default function CityTechnicians() {
  const { id } = useParams()
  const [, navigate] = useLocation()
  const { lang } = useLang()
  const ar = lang === 'ar'

  const allCategoriesData = useAllCategories()
  const [city, setCity] = useState(null)
  const [techs, setTechs] = useState([])
  const [companies, setCompanies] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visibleTechs, setVisibleTechs]         = useState(20)
  const [visibleCompanies, setVisibleCompanies] = useState(20)
  const [visibleSuppliers, setVisibleSuppliers] = useState(20)
  const [selectedCatId, setSelectedCatId]       = useState(null)
  const techFavs = useFavorites('city_fav_techs')
  const compFavs = useFavorites('city_fav_comps')

  const isLibya = id === 'libya'

  useEffect(() => {
    if (isLibya) {
      setCity({ nameAr: 'كل ليبيا', nameEn: 'All Libya', id: 'libya' })
      return
    }
    api.cities().then(cities => {
      setCity(cities.find(c => c.id === id) || null)
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.technicians({ city_id: id }),
      api.companies({ city: id }),
      isLibya ? api.suppliers() : api.suppliers({ city: id }),
    ]).then(([techData, compData, suppData]) => {
      setTechs(techData)
      setCompanies(compData)
      setSuppliers(suppData || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, isLibya])

  const cityName = city ? (ar ? city.nameAr : city.nameEn) : (ar ? 'المدينة' : 'City')
  const cityTotal = techs.length + companies.length + suppliers.length

  // Collect unique category IDs present in this city
  const citySpecialties = useMemo(() => {
    const ids = new Set()
    techs.forEach(t => {
      if (t.categoryId) ids.add(t.categoryId)
      if (Array.isArray(t.extraSpecialties)) t.extraSpecialties.forEach(s => s && ids.add(s))
    })
    companies.forEach(c => {
      if (c.specialty)   ids.add(c.specialty)
      if (c.categoryId)  ids.add(c.categoryId)
      if (Array.isArray(c.extraSpecialties))  c.extraSpecialties.forEach(s => s && ids.add(s))
      if (Array.isArray(c.extra_specialties)) c.extra_specialties.forEach(s => s && ids.add(s))
    })
    const catMap = Object.fromEntries(allCategoriesData.map(c => [c.id, c]))
    return [...ids]
      .map(id => catMap[id])
      .filter(Boolean)
      .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99))
  }, [techs, companies])
  const isWeakCity = !isLibya && !loading && cityTotal < 3

  useSeoMeta({
    title: city ? (ar ? `فنيو ${cityName}` : `Technicians in ${cityName}`) : null,
    description: city
      ? (ar
        ? `اعثر على أفضل الفنيين والشركات والموردين في ${cityName} — اطلب فني`
        : `Find top technicians and companies in ${cityName} on Otlob Fanni`)
      : null,
    noindex: isWeakCity,
  })

  const q = search.trim().toLowerCase()

  const matchesTech = (t) => {
    if (selectedCatId) {
      const inMain = t.categoryId === selectedCatId
      const inExtra = Array.isArray(t.extraSpecialties) && t.extraSpecialties.includes(selectedCatId)
      if (!inMain && !inExtra) return false
    }
    if (!q) return true
    const fields = [
      t.nameAr, t.nameEn,
      t.categoryAr, t.categoryEn,
      t.descriptionAr, t.descriptionEn,
      t.customSpecialty,
      ...(Array.isArray(t.aiTags) ? t.aiTags : []),
      ...(Array.isArray(t.extraSpecialties) ? t.extraSpecialties : []),
    ]
    return fields.some(f => f && f.toLowerCase().includes(q))
  }

  const matchesCompany = (c) => {
    if (selectedCatId) {
      const inMain  = c.specialty === selectedCatId || c.categoryId === selectedCatId
      const inExtra = (Array.isArray(c.extraSpecialties)  && c.extraSpecialties.includes(selectedCatId))
                   || (Array.isArray(c.extra_specialties) && c.extra_specialties.includes(selectedCatId))
      if (!inMain && !inExtra) return false
    }
    if (!q) return true
    const fields = [
      c.companyName, c.company_name,
      c.categoryAr, c.categoryEn,
      c.description,
      c.customSpecialty,
      ...(Array.isArray(c.aiTags) ? c.aiTags : []),
    ]
    return fields.some(f => f && f.toLowerCase().includes(q))
  }

  const matchesSupplier = (s) => {
    if (!q) return true
    const fields = [
      s.businessName, s.business_name,
      s.contactName, s.contact_name,
      s.description,
      s.supplyType, s.supply_type,
      s.customSupplyType, s.custom_supply_type,
      ...(Array.isArray(s.aiTags) ? s.aiTags : []),
    ]
    return fields.some(f => f && f.toLowerCase().includes(q))
  }

  const filteredTechs     = techs.filter(matchesTech)
  const filteredCompanies = companies.filter(matchesCompany)
  const filteredSuppliers = suppliers.filter(matchesSupplier)
  const total = filteredTechs.length + filteredCompanies.length + filteredSuppliers.length

  useEffect(() => {
    setVisibleTechs(20)
    setVisibleCompanies(20)
    setVisibleSuppliers(20)
    setSelectedCatId(null)
  }, [search, id])

  const shownTechs      = filteredTechs.slice(0, visibleTechs)
  const shownCompanies  = filteredCompanies.slice(0, visibleCompanies)
  const shownSuppliers  = filteredSuppliers.slice(0, visibleSuppliers)

  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={cityName} />

      <main className="px-4 pt-4 space-y-4">

        {/* City header */}
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isLibya ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isLibya
              ? <Globe className="w-6 h-6 text-green-600" />
              : <MapPin className="w-6 h-6 text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#071B33] text-base">{cityName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading
                ? (ar ? 'جارٍ التحميل...' : 'Loading...')
                : ar ? `${total} مقدّم خدمة` : `${total} providers`}
            </p>
          </div>
        </div>

        {/* Search within city */}
        <div className="rounded-2xl border-2 border-[#FF7900] bg-white shadow-[0_4px_16px_rgba(255,121,0,0.12)] overflow-hidden">
          {/* City scope label */}
          <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
            {isLibya
              ? <Globe className="w-3 h-3 text-[#FF7900] flex-shrink-0" />
              : <MapPin className="w-3 h-3 text-[#FF7900] flex-shrink-0" />}
            <span className="text-[10px] font-black text-[#FF7900] tracking-wide uppercase leading-none">
              {ar
                ? `بحث داخل ${cityName}`
                : `Search in ${cityName}`}
            </span>
          </div>
          {/* Input row */}
          <div className="flex items-center gap-2 px-3 pb-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? 'اسم، تخصص، وصف...' : 'Name, specialty, description...'}
              className="flex-1 bg-transparent outline-none text-sm text-[#071B33] placeholder-gray-400 font-medium"
              dir={ar ? 'rtl' : 'ltr'}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0"
              >
                <span className="text-gray-500 text-xs leading-none">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Specialty filter icons ── */}
        {!loading && citySpecialties.length > 0 && (
          <div
            className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {citySpecialties.map(cat => {
              const active = selectedCatId === cat.id
              const name = ar ? cat.nameAr : (cat.nameEn || cat.nameAr)
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCatId(active ? null : cat.id)
                    setVisibleTechs(20)
                    setVisibleCompanies(20)
                    setVisibleSuppliers(20)
                  }}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div
                    className="w-14 h-14 rounded-2xl overflow-hidden transition-all"
                    style={{
                      border: active ? '2.5px solid #FF7900' : '1.5px solid rgba(0,0,0,0.08)',
                      boxShadow: active ? '0 0 0 3px rgba(255,121,0,0.18)' : 'none',
                    }}
                  >
                    <img
                      src={`/icons/categories/${cat.id}.png`}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold text-center w-14 leading-tight line-clamp-2 transition-colors"
                    style={{ color: active ? '#FF7900' : '#071B33' }}
                  >
                    {name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* active filter badge */}
        {selectedCatId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{ar ? 'فلتر:' : 'Filter:'}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7900] bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              {ar
                ? allCategoriesData.find(c => c.id === selectedCatId)?.nameAr
                : allCategoriesData.find(c => c.id === selectedCatId)?.nameEn}
              <button onClick={() => setSelectedCatId(null)} className="text-gray-400 hover:text-gray-600 leading-none">✕</button>
            </span>
          </div>
        )}

        {loading ? (
          <SkeletonListCards count={4} />
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-[#FF7900]/40" />
            </div>
            <div>
              <p className="text-[#071B33] font-extrabold text-base mb-1">
                {ar ? 'لم يتم العثور على نتائج' : 'No results found'}
              </p>
              <p className="text-gray-400 text-sm max-w-[240px] mx-auto leading-relaxed">
                {ar ? 'جرّب تخصصاً أو مدينة أخرى' : 'Try a different specialty or city'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {filteredTechs.length > 0 && (
              <div>
                <div className="rounded-2xl mb-3 border-r-4 border-[#FF7900] overflow-hidden"
                  style={{ background: 'linear-gradient(to left, rgba(255,121,0,0.09), rgba(255,121,0,0.02))' }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">🔧</span>
                      <span className="text-[20px] font-black text-[#FF7900] leading-none">{ar ? 'الفنيون' : 'Technicians'}</span>
                    </div>
                    <span className="text-sm font-black bg-[#FF7900] text-white px-3 py-1 rounded-full leading-none">{filteredTechs.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {shownTechs.map(tech => {
                    const catId = tech.categoryId || tech.category_id
                    const catName = catId
                      ? (ar
                          ? allCategoriesData.find(c => c.id === catId)?.nameAr
                          : allCategoriesData.find(c => c.id === catId)?.nameEn)
                      : (ar ? tech.categoryAr : tech.categoryEn)
                    return (
                      <TechGrid
                        key={tech.id}
                        tech={tech}
                        ar={ar}
                        onOpen={id => navigate(`/technician/${id}`)}
                        isFav={techFavs.isFav(tech.id)}
                        onToggleFav={techFavs.toggle}
                        categoryName={catName}
                      />
                    )
                  })}
                </div>
                {filteredTechs.length > visibleTechs && (
                  <button onClick={() => setVisibleTechs(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-[#FF7900]/30 text-[#FF7900] font-bold text-sm active:scale-[0.98] transition-transform">
                    {ar ? `تحميل المزيد (${filteredTechs.length - visibleTechs})` : `Load More (${filteredTechs.length - visibleTechs})`}
                  </button>
                )}
              </div>
            )}

            {filteredCompanies.length > 0 && (
              <div>
                <div className="rounded-2xl mb-3 border-r-4 border-[#1e40af] overflow-hidden"
                  style={{ background: 'linear-gradient(to left, rgba(30,64,175,0.09), rgba(30,64,175,0.02))' }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">🏢</span>
                      <span className="text-[20px] font-black text-[#1e40af] leading-none">{ar ? 'الشركات الخدمية' : 'Companies'}</span>
                    </div>
                    <span className="text-sm font-black bg-[#1e40af] text-white px-3 py-1 rounded-full leading-none">{filteredCompanies.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {shownCompanies.map(company => (
                    <CompanyGrid
                      key={company.id}
                      company={company}
                      ar={ar}
                      onOpen={id => navigate(`/company/${id}`)}
                      isFav={compFavs.isFav(company.id)}
                      onToggleFav={compFavs.toggle}
                    />
                  ))}
                </div>
                {filteredCompanies.length > visibleCompanies && (
                  <button onClick={() => setVisibleCompanies(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-blue-300 text-blue-600 font-bold text-sm active:scale-[0.98] transition-transform">
                    {ar ? `تحميل المزيد (${filteredCompanies.length - visibleCompanies})` : `Load More (${filteredCompanies.length - visibleCompanies})`}
                  </button>
                )}
              </div>
            )}

            {filteredSuppliers.length > 0 && (
              <div>
                <div className="rounded-2xl mb-3 border-r-4 border-[#0e7c8f] overflow-hidden"
                  style={{ background: 'linear-gradient(to left, rgba(14,124,143,0.09), rgba(14,124,143,0.02))' }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">📦</span>
                      <span className="text-[20px] font-black text-[#0e7c8f] leading-none">{ar ? 'مزودو المستلزمات' : 'Suppliers'}</span>
                    </div>
                    <span className="text-sm font-black bg-[#0e7c8f] text-white px-3 py-1 rounded-full leading-none">{filteredSuppliers.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {shownSuppliers.map(supplier => (
                    <SupplierGrid
                      key={supplier.id}
                      supplier={supplier}
                      ar={ar}
                      onOpen={id => navigate(`/supplier/${id}`)}
                    />
                  ))}
                </div>
                {filteredSuppliers.length > visibleSuppliers && (
                  <button onClick={() => setVisibleSuppliers(v => v + 20)}
                    className="w-full mt-3 py-3 rounded-2xl bg-white border border-teal-300 text-teal-600 font-bold text-sm active:scale-[0.98] transition-transform">
                    {ar ? `تحميل المزيد (${filteredSuppliers.length - visibleSuppliers})` : `Load More (${filteredSuppliers.length - visibleSuppliers})`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
