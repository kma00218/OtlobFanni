import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { Heart, MapPin, Phone, MessageSquare, Star, Zap, Trash2 } from 'lucide-react'
import { Link } from 'wouter'
import api from '../lib/api'

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

export default function Favorites() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const [favIds, setFavIds]     = useState([])
  const [techs, setTechs]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('fav_technicians') || '[]')
      setFavIds(ids)
    } catch { setFavIds([]) }
  }, [])

  useEffect(() => {
    if (!favIds.length) { setLoading(false); return }
    api.technicians()
      .then(all => {
        setTechs(all.filter(t => favIds.includes(t.id)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [favIds])

  const removeFav = (id) => {
    const next = favIds.filter(f => f !== id)
    setFavIds(next)
    setTechs(prev => prev.filter(t => t.id !== id))
    localStorage.setItem('fav_technicians', JSON.stringify(next))
  }

  return (
    <div className="bg-[#F2F2F7] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'المفضلة' : 'Favorites'} />

      <main className="px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : techs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
            <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <Heart className="w-12 h-12 text-rose-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {ar ? 'لا يوجد فنيون في المفضلة' : 'No favorites yet'}
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-[220px] leading-relaxed">
              {ar
                ? 'اضغط على أيقونة القلب على بطاقة أي فني لإضافته للمفضلة'
                : 'Tap the heart icon on any technician card to save them here'}
            </p>
            <Link href="/">
              <button className="bg-[#FF7900] text-white font-bold px-8 py-3 rounded-2xl text-sm">
                {ar ? 'تصفح الفنيين' : 'Browse Technicians'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium mb-3">
              {ar ? `${techs.length} فني محفوظ` : `${techs.length} saved`}
            </p>
            {techs.map(tech => {
              const name     = tech.nameAr || tech.name_ar || ''
              const photo    = tech.profilePhoto || tech.profile_photo || null
              const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0,2) || '?'
              const avail    = tech.availableNow ?? tech.available_now ?? (tech.status === 'available')
              const emergency= tech.emergency || false
              const rating   = tech.rating || 0
              const reviews  = tech.reviewsCount ?? tech.reviews_count ?? 0
              const price    = tech.priceFrom ?? tech.price_from ?? 0
              const city     = tech.city_name || tech.city || ''

              return (
                <div key={tech.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {/* Photo */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {photo
                        ? <img src={photo} alt={name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a3a5c] flex items-center justify-center">
                            <span className="text-white text-xl font-bold">{initials}</span>
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
                        <button
                          onClick={() => removeFav(tech.id)}
                          className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title={ar ? 'إزالة من المفضلة' : 'Remove'}>
                          <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
                        </button>
                      </div>

                      {city && (
                        <div className="flex items-center gap-1 mt-0.5 mb-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-400">{city}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <Stars rating={rating} />
                        {reviews > 0 && <span className="text-xs text-gray-400">({reviews})</span>}
                        {avail && (
                          <span className="text-[10px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-full">
                            {ar ? 'متاح' : 'Available'}
                          </span>
                        )}
                        {emergency && (
                          <span className="text-[10px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" />{ar ? 'طوارئ' : 'Emergency'}
                          </span>
                        )}
                      </div>

                      {price > 0 && (
                        <p className="text-xs font-bold text-[#FF7900] mb-2">
                          {ar ? `من ${price} د.ل` : `From ${price} LYD`}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <a href={`https://wa.me/${tech.whatsapp || tech.phone}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 bg-green-500 text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ar ? 'واتساب' : 'WhatsApp'}
                        </a>
                        <a href={`tel:${tech.phone}`}
                          className="flex-1 bg-[#071B33] text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3" />
                          {ar ? 'اتصال' : 'Call'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
