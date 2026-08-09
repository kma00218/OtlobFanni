import { useState, useEffect, useRef } from 'react'
import api, { getFileUrl } from '../lib/api'

const INTERVAL_MS = 5000

const DEMO_AD = {
  id: '__demo__',
  adTitle: 'مطعم الشروق — طرابلس',
  adDescription: 'أشهى المأكولات الليبية الأصيلة بأسعار لا تُقاوم',
  linkUrl: '#',
  imagePreview: null,
  _isDemo: true,
}

export default function StatsAdCarousel({ stats, ar }) {
  const [ads, setAds]         = useState([])
  const [slideIndex, setSlide] = useState(0)
  const timerRef              = useRef(null)

  useEffect(() => {
    Promise.all([
      api.ads('home_top').catch(() => []),
      api.ads('global').catch(() => []),
    ]).then(([placed, global]) => {
      const merged = [...placed]
      for (const g of global) {
        if (!merged.find(a => a.id === g.id)) merged.push(g)
      }
      merged.sort((a, b) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0))
      if (merged.length > 0) {
        setAds(merged)
      } else if (import.meta.env.DEV) {
        // demo only in development — never shown in production
        setAds([DEMO_AD])
        setSlide(1)
      }
    })
  }, [])

  const totalSlides = 1 + ads.length

  useEffect(() => {
    clearInterval(timerRef.current)
    if (totalSlides <= 1) return
    timerRef.current = setInterval(() => {
      setSlide(prev => (prev + 1) % totalSlides)
    }, INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [totalSlides])

  const isStats = slideIndex === 0

  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      style={{ background: '#fff', border: '1.5px solid #F0F2F5', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
    >
      {/* ── Stats slide — always rendered so container keeps its height ── */}
      <div className={`relative z-10 transition-opacity duration-500 ${isStats ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 px-3 pt-5 pb-6">
          <div className="flex flex-1 items-center justify-around">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-2xl font-black text-[#FF7900] leading-none">{stats.technicians}</span>
              <span className="text-[14px] font-extrabold text-gray-500 mt-1.5 whitespace-nowrap">{ar ? 'فني' : 'Tech'}</span>
            </div>
            <div className="w-px self-stretch bg-gray-100" />
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-2xl font-black text-blue-500 leading-none">{stats.companies}</span>
              <span className="text-[14px] font-extrabold text-gray-500 mt-1.5 whitespace-nowrap">{ar ? 'شركة خدمات' : 'Service Co.'}</span>
            </div>
            <div className="w-px self-stretch bg-gray-100" />
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-2xl font-black text-teal-500 leading-none">{stats.suppliers}</span>
              <span className="text-[14px] font-extrabold text-gray-500 mt-1.5 whitespace-nowrap">{ar ? 'مورد مستلزمات' : 'Supplier'}</span>
            </div>
          </div>
          <div className="w-px self-stretch bg-gray-200" />
          <div className="flex flex-col items-center flex-shrink-0 px-1">
            <span className="text-3xl font-black text-[#FF7900] leading-none">
              {stats.technicians + stats.companies + stats.suppliers}
            </span>
            <span className="text-[14px] font-extrabold text-gray-500 mt-1.5">{ar ? 'إجمالي' : 'Total'}</span>
          </div>
        </div>
      </div>

      {/* ── Ad slides — absolutely cover the stats area ── */}
      {ads.map((ad, i) => {
        const isActive = slideIndex === i + 1
        const href   = ad.link_url || ad.linkUrl || '#'
        const image  = getFileUrl(ad.image_url || ad.imageUrl || ad.imagePreview || null)
        const title  = ad.title_ar || ad.titleAr || ad.adTitle || ''
        const desc   = ad.description_ar || ad.descriptionAr || ad.adDescription || ''

        return (
          <div
            key={ad.id}
            className={`absolute inset-0 z-20 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <a
              href={href}
              target={href.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="block w-full h-full"
            >
              {image ? (
                <>
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                  {(title || desc) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex items-end px-3 pb-6">
                      <div className="min-w-0">
                        {title && <p className="text-white font-bold text-sm leading-tight truncate">{title}</p>}
                        {desc  && <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{desc}</p>}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* no-image: rich branded card */
                <div className="flex items-center gap-3 w-full h-full px-4 py-3"
                  style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2540 60%, #FF7900 200%)' }}>
                  {/* icon circle */}
                  <div className="w-11 h-11 rounded-xl bg-[#FF7900] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-xl">🍽️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {title && <p className="text-white font-black text-sm leading-tight">{title}</p>}
                    {desc  && <p className="text-white/70 text-xs mt-0.5 line-clamp-2 leading-snug">{desc}</p>}
                  </div>
                  <div className="flex-shrink-0 bg-[#FF7900] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow">
                    {ar ? 'تفاصيل' : 'Details'}
                  </div>
                </div>
              )}

            </a>

            {/* إعلان badge */}
            <div className="absolute top-2 right-2 z-30">
              <span className="bg-[#FF7900]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {ar ? 'إعلان' : 'Ad'}
              </span>
            </div>
          </div>
        )
      })}

      {/* ── Dot indicators ── */}
      {totalSlides > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-40">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); setSlide(i) }}
              className={`rounded-full transition-all duration-300 ${
                i === slideIndex
                  ? 'bg-[#FF7900] w-3.5 h-1.5'
                  : 'bg-white/40 w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Bottom orange accent line ── */}
      <div className="absolute bottom-0 left-0 right-0 z-50" style={{ height: '3px', background: 'linear-gradient(to right, #FF7900, #ffb347)' }} />
    </div>
  )
}
