import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useLocation } from 'wouter'
import {
  MapPin, Phone, Search, Building2, Zap, Briefcase, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { SkeletonCompanyCard } from '../components/Skeleton'
import { categories } from '../data/services'
import AdBanner from '../components/AdBanner'

const CAT_LABEL = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))
const CAT_LABEL_EN = Object.fromEntries(categories.map(c => [c.id, c.nameEn || c.nameAr]))

const EXP_LABEL_AR = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

function isNewProfile(createdAt) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

function CompanyCard({ company, lang, onOpen }) {
  const ar = lang === 'ar'
  const name = company.company_name || company.companyName || ''
  const isNew = isNewProfile(company.createdAt || company.created_at)
  const firstWord = name ? (name.trim().split(' ')[0] || '?') : '?'
  const logo = getFileUrl(company.company_logo || company.companyLogo || null)
  const city = company.city || ''
  const area = company.area || ''
  const specialty = company.specialty || ''
  const extraIds = company.extra_specialties || company.extraSpecialties || []
  const extraNames = extraIds
    .map(id => ar ? (CAT_LABEL[id] || '') : (CAT_LABEL_EN[id] || ''))
    .filter(Boolean)
  const primaryName = ar ? (CAT_LABEL[specialty] || specialty) : (CAT_LABEL_EN[specialty] || specialty)
  const allSpecialtyNames = primaryName
    ? [primaryName, ...extraNames.filter(n => n !== primaryName)]
    : extraNames
  const availableNow = company.available_now ?? company.availableNow ?? false
  const emergency = company.emergency || false
  const yearsActive = company.years_active || company.yearsActive || ''
  const priceFrom = company.price_from || company.priceFrom || ''

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
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
          {isNew && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {ar ? 'جديد' : 'New'}
            </span>
          )}
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
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Building2 className="w-3.5 h-3.5 text-[#FF7900] flex-shrink-0" />
          <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
        </div>

        {allSpecialtyNames.length > 0 && (
          <p className="text-xs text-[#FF7900] font-medium mb-2 truncate">
            {allSpecialtyNames.join(' · ')}
          </p>
        )}

        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {city}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {yearsActive && (
          <div className="flex items-center gap-1 mb-2">
            <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              {ar ? (EXP_LABEL_AR[yearsActive] || yearsActive) : yearsActive}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          {priceFrom ? (
            <span className="text-xs text-gray-600">
              {ar ? 'يبدأ من' : 'From'}{' '}
              <span className="font-bold text-[#FF7900]">{priceFrom}</span>{' '}
              {ar ? 'د.ل' : 'LYD'}
            </span>
          ) : <span />}
          <span className="text-[10px] bg-[#071B33] text-white px-2.5 py-1 rounded-full font-medium">
            {ar ? 'عرض التفاصيل' : 'View'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Companies() {
  const { lang, dir } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()

  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)

  useEffect(() => {
    api.companies()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort()
  const specs  = [...new Set(data.map(r => r.specialty).filter(Boolean))]

  const filtered = data.filter(r => {
    const name = r.company_name || r.companyName || ''
    const phone = r.phone || ''
    const city = r.city || ''
    const s = !search || name.includes(search) || phone.includes(search) || city.includes(search)
    const c = !filterCity || city === filterCity
    const sp = !filterSpec || (r.specialty || '') === filterSpec
    return s && c && sp
  })

  useEffect(() => {
    setVisibleCount(20)
  }, [search, filterCity, filterSpec])

  const shownCompanies = filtered.slice(0, visibleCount)

  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-28" dir={dir}>
      <BackHeader title={ar ? 'الشركات' : 'Companies'} />

      <main className="px-4 pt-4 space-y-4">
        <AdBanner placement="trusted_companies" dismissible />

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" style={dir === 'ltr' ? {right:'auto',left:'12px'} : {}} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ar ? 'بحث باسم الشركة أو المدينة...' : 'Search by company name or city...'}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
            style={dir === 'ltr' ? {paddingRight:'16px', paddingLeft:'40px'} : {}}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 bg-white focus:outline-none"
          >
            <option value="">{ar ? 'كل المدن' : 'All Cities'}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterSpec}
            onChange={e => setFilterSpec(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 bg-white focus:outline-none"
          >
            <option value="">{ar ? 'كل التخصصات' : 'All Specialties'}</option>
            {specs.map(s => <option key={s} value={s}>{ar ? (CAT_LABEL[s] || s) : (CAT_LABEL_EN[s] || s)}</option>)}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-gray-400 px-1">
            {ar ? `${filtered.length} شركة` : `${filtered.length} companies`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="h-36 bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
              <Building2 className="w-10 h-10 text-[#FF7900]/40" />
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
            <div className="grid grid-cols-2 gap-3">
              {shownCompanies.map(c => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  lang={lang}
                  onOpen={id => navigate(`/company/${id}`)}
                />
              ))}
            </div>
            {filtered.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(v => v + 20)}
                className="w-full mt-3 py-3 rounded-2xl bg-white border border-[#FF7900]/30 text-[#FF7900] font-bold text-sm active:scale-[0.98] transition-transform"
              >
                {ar
                  ? `تحميل المزيد (${filtered.length - visibleCount})`
                  : `Load More (${filtered.length - visibleCount})`}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}
