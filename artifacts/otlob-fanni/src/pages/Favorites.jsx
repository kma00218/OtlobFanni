import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Heart, MapPin, Phone, MessageSquare, Star, Zap, Building2 } from 'lucide-react'
import { Link } from 'wouter'
import api, { getFileUrl } from '../lib/api'

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

function TechRow({ tech, ar, onRemove }) {
  const name     = tech.nameAr || tech.name_ar || ''
  const photo    = getFileUrl(tech.profilePhoto || tech.profile_photo || null)
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0,2) || '?'
  const avail    = tech.availableNow ?? tech.available_now ?? (tech.status === 'available')
  const emergency= tech.emergency || false
  const rating   = tech.rating || 0
  const reviews  = tech.reviewsCount ?? tech.reviews_count ?? 0
  const price    = tech.priceFrom ?? tech.price_from ?? 0
  const city     = tech.city_name || tech.city || ''

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a3a5c] flex items-center justify-center">
                <span className="text-white text-xl font-bold">{initials}</span>
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
            <button onClick={() => onRemove(tech.id)}
              className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
              <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            </button>
          </div>
          {(tech.categoryAr || tech.categoryEn) && (
            <div className="flex items-center gap-1.5 mt-0.5 mb-1">
              <div className="w-1 h-4 rounded-full bg-[#FF7900] flex-shrink-0" />
              <span className="text-sm font-extrabold text-[#FF7900] truncate">
                {ar ? (tech.categoryAr || tech.categoryEn) : (tech.categoryEn || tech.categoryAr)}
              </span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-1 mt-0.5 mb-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">{city}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Stars rating={rating} />
            {reviews > 0 && <span className="text-xs text-gray-400">({reviews})</span>}
            {avail && <span className="text-[10px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-full">{ar ? 'متاح' : 'Available'}</span>}
            {emergency && <span className="text-[10px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Zap className="w-2.5 h-2.5"/>{ar ? 'طوارئ' : 'Emergency'}</span>}
          </div>
          {price > 0 && <p className="text-xs font-bold text-[#FF7900] mb-2">{ar ? `من ${price} د.ل` : `From ${price} LYD`}</p>}
          <div className="flex gap-2">
            <a href={`https://wa.me/${tech.whatsapp || tech.phone}`} target="_blank" rel="noreferrer"
              className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3" />{ar ? 'واتساب' : 'WhatsApp'}
            </a>
            <a href={`tel:${tech.phone}`}
              className="flex-1 bg-[#071B33] text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" />{ar ? 'اتصال' : 'Call'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompanyRow({ company, ar, onRemove }) {
  const name     = company.companyName || company.company_name || ''
  const logo     = getFileUrl(company.companyLogo || company.company_logo || null)
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0,2) || '؟'
  const avail    = company.availableNow ?? company.available_now ?? false
  const emergency= company.emergency || false
  const price    = company.priceFrom || company.price_from || ''
  const city     = company.city || ''

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          {logo
            ? <img src={logo} alt={name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#0e3460] flex items-center justify-center relative">
                <Building2 className="w-7 h-7 text-white/30 absolute" />
                <span className="text-white text-xl font-bold relative">{initials}</span>
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
              {(company.categoryAr || company.categoryEn) && (
                <div className="flex items-center gap-1.5 mt-0.5 mb-0.5">
                  <div className="w-1 h-4 rounded-full bg-[#FF7900] flex-shrink-0" />
                  <span className="text-sm font-extrabold text-[#FF7900] truncate">
                    {ar ? (company.categoryAr || company.categoryEn) : (company.categoryEn || company.categoryAr)}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium inline-block mt-0.5">
                {ar ? 'شركة / مؤسسة' : 'Business'}
              </span>
            </div>
            <button onClick={() => onRemove(company.id)}
              className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
              <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            </button>
          </div>
          {city && (
            <div className="flex items-center gap-1 mt-1 mb-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">{city}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            {avail && <span className="text-[10px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-full">{ar ? 'متاحة' : 'Available'}</span>}
            {emergency && <span className="text-[10px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Zap className="w-2.5 h-2.5"/>{ar ? 'طوارئ' : 'Emergency'}</span>}
            {price && <p className="text-xs font-bold text-[#FF7900]">{ar ? `من ${price} د.ل` : `From ${price} LYD`}</p>}
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/${company.whatsapp || company.phone}`} target="_blank" rel="noreferrer"
              className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3" />{ar ? 'واتساب' : 'WhatsApp'}
            </a>
            <a href={`tel:${company.phone}`}
              className="flex-1 bg-[#071B33] text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" />{ar ? 'اتصال' : 'Call'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Favorites() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [favTechIds, setFavTechIds]         = useState([])
  const [favCompanyIds, setFavCompanyIds]   = useState([])
  const [techs, setTechs]                   = useState([])
  const [companies, setCompanies]           = useState([])
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    try {
      setFavTechIds(JSON.parse(localStorage.getItem('fav_technicians') || '[]'))
      setFavCompanyIds(JSON.parse(localStorage.getItem('fav_companies') || '[]'))
    } catch {}
  }, [])

  useEffect(() => {
    const hasTechs     = favTechIds.length > 0
    const hasCompanies = favCompanyIds.length > 0
    if (!hasTechs && !hasCompanies) { setLoading(false); return }

    const techPromise    = hasTechs     ? api.technicians() : Promise.resolve([])
    const companyPromise = hasCompanies ? api.companies()   : Promise.resolve([])

    Promise.all([techPromise, companyPromise])
      .then(([allTechs, allCompanies]) => {
        setTechs(allTechs.filter(t => favTechIds.includes(t.id)))
        setCompanies(allCompanies.filter(c => favCompanyIds.includes(c.id)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [favTechIds, favCompanyIds])

  const removeTech = (id) => {
    const next = favTechIds.filter(f => f !== id)
    setFavTechIds(next)
    setTechs(prev => prev.filter(t => t.id !== id))
    localStorage.setItem('fav_technicians', JSON.stringify(next))
  }

  const removeCompany = (id) => {
    const next = favCompanyIds.filter(f => f !== id)
    setFavCompanyIds(next)
    setCompanies(prev => prev.filter(c => c.id !== id))
    localStorage.setItem('fav_companies', JSON.stringify(next))
  }

  const totalCount = techs.length + companies.length

  return (
    <div className="bg-[#F2F2F7] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'المفضلة' : 'Favorites'} />

      <main className="px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
            <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <Heart className="w-12 h-12 text-rose-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {ar ? 'لا يوجد مفضلات بعد' : 'No favorites yet'}
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-[240px] leading-relaxed">
              {ar
                ? 'اضغط على أيقونة القلب على بطاقة أي فني أو شركة لإضافتها للمفضلة'
                : 'Tap the heart icon on any technician or company card to save them here'}
            </p>
            <Link href="/">
              <button className="bg-[#FF7900] text-white font-bold px-8 py-3 rounded-2xl text-sm">
                {ar ? 'تصفح الآن' : 'Browse Now'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 font-medium">
              {ar ? `${totalCount} محفوظ` : `${totalCount} saved`}
            </p>

            {/* فنيون */}
            {techs.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  👷 {ar ? `فنيون (${techs.length})` : `Technicians (${techs.length})`}
                </p>
                {techs.map(tech => (
                  <TechRow key={tech.id} tech={tech} ar={ar} onRemove={removeTech} />
                ))}
              </div>
            )}

            {/* شركات */}
            {companies.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  🏢 {ar ? `شركات (${companies.length})` : `Companies (${companies.length})`}
                </p>
                {companies.map(company => (
                  <CompanyRow key={company.id} company={company} ar={ar} onRemove={removeCompany} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
