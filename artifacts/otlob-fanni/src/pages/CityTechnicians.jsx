import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import TechnicianCard from '../components/TechnicianCard'
import { MapPin, Globe, Search, Building2, Phone, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import api, { getFileUrl } from '../lib/api'
import { SkeletonListCards } from '../components/Skeleton'

function CompanyRow({ company, ar, onOpen }) {
  const name = company.companyName || ''
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'
  const logo = getFileUrl(company.companyLogo || null)
  const category = ar ? company.categoryAr : company.categoryEn
  const ChevIcon = ar ? ChevronLeft : ChevronRight

  return (
    <button
      onClick={() => onOpen(company.id)}
      className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.98] transition-all text-start"
    >
      <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-blue-100 flex items-center justify-center">
        {logo
          ? <img src={logo} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center">
              <span className="text-white font-bold text-xs text-center px-1 leading-tight">{firstWord}</span>
            </div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#071B33] text-sm leading-tight truncate">{name}</p>
        {category && <p className="text-xs text-[#FF7900] font-medium mt-0.5">{category}</p>}
        {company.city && <p className="text-xs text-gray-400 mt-0.5">{company.city}</p>}
      </div>
      <Building2 className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </button>
  )
}

export default function CityTechnicians() {
  const { id } = useParams()
  const [, navigate] = useLocation()
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [city, setCity] = useState(null)
  const [techs, setTechs] = useState([])
  const [companies, setCompanies] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visibleTechs, setVisibleTechs]         = useState(20)
  const [visibleCompanies, setVisibleCompanies] = useState(20)
  const [visibleSuppliers, setVisibleSuppliers] = useState(20)

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
  const q = search.trim().toLowerCase()

  const matchesTech = (t) => {
    if (!q) return true
    const fields = [
      t.nameAr, t.nameEn,
      t.categoryAr, t.categoryEn,
      t.descriptionAr, t.descriptionEn,
      t.customSpecialty,
    ]
    return fields.some(f => f && f.toLowerCase().includes(q))
  }

  const matchesCompany = (c) => {
    if (!q) return true
    const fields = [
      c.companyName, c.company_name,
      c.categoryAr, c.categoryEn,
      c.description,
      c.customSpecialty,
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
              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-1 pb-1">
                  {ar ? 'الفنيون' : 'Technicians'}
                </p>
                {shownTechs.map(tech => (
                  <TechnicianCard key={tech.id} technician={tech} />
                ))}
                {filteredTechs.length > visibleTechs && (
                  <button
                    onClick={() => setVisibleTechs(v => v + 20)}
                    className="w-full mt-2 py-3 rounded-2xl bg-white border border-[#FF7900]/30 text-[#FF7900] font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredTechs.length - visibleTechs})`
                      : `Load More (${filteredTechs.length - visibleTechs})`}
                  </button>
                )}
              </div>
            )}
            {filteredCompanies.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-1 pb-1">
                  {ar ? 'الشركات' : 'Companies'}
                </p>
                {shownCompanies.map(company => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    ar={ar}
                    onOpen={(id) => navigate(`/company/${id}`)}
                  />
                ))}
                {filteredCompanies.length > visibleCompanies && (
                  <button
                    onClick={() => setVisibleCompanies(v => v + 20)}
                    className="w-full mt-2 py-3 rounded-2xl bg-white border border-blue-300 text-blue-600 font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredCompanies.length - visibleCompanies})`
                      : `Load More (${filteredCompanies.length - visibleCompanies})`}
                  </button>
                )}
              </div>
            )}
            {filteredSuppliers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-1 pb-1">
                  {ar ? 'مزودو المستلزمات' : 'Suppliers'}
                </p>
                {shownSuppliers.map(supplier => {
                  const name = supplier.businessName || supplier.business_name || ''
                  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'
                  const logo = getFileUrl(supplier.logo || null)
                  const supplyLabel = supplier.customSupplyType || supplier.custom_supply_type || supplier.supplyType || supplier.supply_type || ''
                  return (
                    <button
                      key={supplier.id}
                      onClick={() => navigate(`/suppliers?city=${id}`)}
                      className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.98] transition-all text-start"
                    >
                      <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-teal-100 flex items-center justify-center">
                        {logo
                          ? <img src={logo} alt={name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-teal-100 flex items-center justify-center">
                              <Package className="w-6 h-6 text-teal-600" />
                            </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#071B33] text-sm leading-tight truncate">{name}</p>
                        {supplyLabel && <p className="text-xs text-teal-600 font-medium mt-0.5">{supplyLabel}</p>}
                        {supplier.city && <p className="text-xs text-gray-400 mt-0.5">{supplier.city}</p>}
                      </div>
                      <Package className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </button>
                  )
                })}
                {filteredSuppliers.length > visibleSuppliers && (
                  <button
                    onClick={() => setVisibleSuppliers(v => v + 20)}
                    className="w-full mt-2 py-3 rounded-2xl bg-white border border-teal-300 text-teal-600 font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    {ar
                      ? `تحميل المزيد (${filteredSuppliers.length - visibleSuppliers})`
                      : `Load More (${filteredSuppliers.length - visibleSuppliers})`}
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
