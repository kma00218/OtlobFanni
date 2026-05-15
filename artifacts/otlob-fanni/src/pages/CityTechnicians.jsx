import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import TechnicianCard from '../components/TechnicianCard'
import { MapPin, Globe, Search, Building2, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import api, { getFileUrl } from '../lib/api'

function CompanyRow({ company, ar, onOpen }) {
  const name = company.companyName || ''
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '؟'
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
          : <span className="font-bold text-blue-600 text-base">{initials}</span>}
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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    ]).then(([techData, compData]) => {
      setTechs(techData)
      setCompanies(compData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const cityName = city ? (ar ? city.nameAr : city.nameEn) : (ar ? 'المدينة' : 'City')
  const q = search.toLowerCase()
  const filteredTechs = techs.filter(t =>
    !q || (t.nameAr || '').toLowerCase().includes(q) || (t.nameEn || '').toLowerCase().includes(q)
  )
  const filteredCompanies = companies.filter(c =>
    !q || (c.companyName || '').toLowerCase().includes(q)
  )
  const total = filteredTechs.length + filteredCompanies.length

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
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ar ? 'بحث داخل المدينة...' : 'Search within city...'}
            className="flex-1 bg-transparent outline-none text-sm text-[#071B33] placeholder-gray-400"
            dir={ar ? 'rtl' : 'ltr'}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {ar ? 'لا يوجد مقدمو خدمة في هذه المدينة بعد' : 'No providers in this city yet'}
            </p>
          </div>
        ) : (
          <>
            {filteredTechs.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-1 pb-1">
                  {ar ? 'الفنيون' : 'Technicians'}
                </p>
                {filteredTechs.map(tech => (
                  <TechnicianCard key={tech.id} technician={tech} />
                ))}
              </div>
            )}
            {filteredCompanies.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-1 pb-1">
                  {ar ? 'الشركات' : 'Companies'}
                </p>
                {filteredCompanies.map(company => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    ar={ar}
                    onOpen={(id) => navigate(`/company/${id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
