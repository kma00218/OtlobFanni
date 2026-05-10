import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import ServiceImageIcon from '../components/ServiceImageIcon'
import { categories } from '../data/services'
import { useRoute, useLocation } from 'wouter'
import {
  Star, MapPin, Phone, MessageSquare, Zap, Search,
  Users, Loader2,
} from 'lucide-react'
import AdBanner from '../components/AdBanner'
import api from '../lib/api'

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

function TechCard({ tech, lang, onOpen }) {
  const ar = lang === 'ar'
  const name = tech.name_ar || tech.nameAr || ''
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || '?'
  const photo = tech.profile_photo || tech.profilePhoto || null
  const availableNow = tech.available_now ?? tech.availableNow ?? (tech.status === 'available')
  const emergency = tech.emergency || false
  const isFeatured = tech.is_featured ?? tech.isFeatured ?? false
  const rating = tech.rating || 0
  const reviewsCount = tech.reviews_count ?? tech.reviewsCount ?? 0
  const priceFrom = tech.price_from ?? tech.priceFrom ?? 0
  const city = tech.city_name || tech.city || ''
  const area = tech.area || ''

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onOpen(tech.id)}
    >
      <div className="relative">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-[#071B33] to-[#1a3a5c] flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{initials}</span>
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
      </div>

      <div className="p-3.5">
        <p className="font-bold text-gray-900 text-sm mb-1 leading-tight">{name}</p>

        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {city}{area ? ` · ${area}` : ''}
          </p>
        </div>

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

export default function CategoryTechnicians() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, params] = useRoute('/category/:id')
  const [, navigate] = useLocation()
  const categoryId = params?.id

  const category = categories.find(c => c.id === categoryId)
  const categoryName = ar ? (category?.nameAr || '') : (category?.nameEn || '')

  const [cities, setCities]         = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [techs, setTechs]           = useState([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    api.cities().then(setCities).catch(() => {})
  }, [])

  useEffect(() => {
    if (!categoryId) return
    setLoading(true)
    setError(null)
    api.technicians({ category: categoryId, city_id: selectedCity || undefined })
      .then(data => { setTechs(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [categoryId, selectedCity])

  const filtered = techs.filter(t => {
    if (!search) return true
    const name = (t.name_ar || t.nameAr || '').toLowerCase()
    const city = (t.city_name || t.city || '').toLowerCase()
    const area = (t.area || '').toLowerCase()
    const q    = search.toLowerCase()
    return name.includes(q) || city.includes(q) || area.includes(q)
  })

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={categoryName || (ar ? 'الفنيون' : 'Technicians')} />

      <main className="px-4 pt-4 space-y-4">

        {/* شعار التخصص */}
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
          <div className="w-12 h-12 bg-[#FF7900]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ServiceImageIcon iconName={category?.iconName || categoryId} size="md" />
          </div>
          <div>
            <p className="font-bold text-[#071B33] text-base">{categoryName}</p>
            <p className="text-xs text-gray-400">
              {loading
                ? (ar ? 'جارٍ التحميل...' : 'Loading...')
                : ar
                  ? `${filtered.length} فني متاح`
                  : `${filtered.length} technician${filtered.length !== 1 ? 's' : ''} available`
              }
            </p>
          </div>
        </div>

        {/* فلتر المدينة + بحث */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 ${ar ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? 'بحث عن فني...' : 'Search technician...'}
              className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 ${ar ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
            />
          </div>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 min-w-[100px]"
          >
            <option value="">{ar ? 'كل المدن' : 'All Cities'}</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{ar ? c.name_ar : c.name_en}</option>
            ))}
          </select>
        </div>

        {/* إعلان */}
        <AdBanner placement="technicians" dismissible />

        {/* قائمة الفنيين */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#FF7900] animate-spin" />
            <p className="text-gray-400 text-sm">{ar ? 'جارٍ التحميل...' : 'Loading...'}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-red-500 text-sm">{ar ? 'حدث خطأ أثناء التحميل' : 'Error loading data'}</p>
            <button onClick={() => window.location.reload()}
              className="text-[#FF7900] text-sm font-medium hover:underline">
              {ar ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <div>
              <p className="text-gray-700 font-bold text-base mb-1">
                {ar ? 'لا يوجد فنيون متاحون' : 'No technicians available'}
              </p>
              <p className="text-gray-400 text-sm max-w-[240px] mx-auto">
                {ar
                  ? 'لم يتم إضافة فنيين لهذا التخصص بعد، أو جرب تغيير المدينة.'
                  : 'No technicians found for this category. Try changing the city.'}
              </p>
            </div>
            {selectedCity && (
              <button onClick={() => setSelectedCity('')}
                className="text-[#FF7900] text-sm font-medium hover:underline">
                {ar ? 'عرض كل المدن' : 'Show all cities'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(tech => (
              <TechCard
                key={tech.id}
                tech={tech}
                lang={lang}
                onOpen={(id) => navigate(`/technician/${id}`)}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
