import { useState, useEffect, useRef } from 'react'
import { ExternalLink, X } from 'lucide-react'
import api, { getFileUrl } from '../lib/api'

// ── Single horizontal banner card ──────────────────────────────────────────
function BannerCard({ ad, onDismiss, compact }) {
  const href = ad.link_url || ad.linkUrl || '#'
  const image = getFileUrl(ad.image_url || ad.imageUrl || ad.imagePreview || null)
  const title = ad.title_ar || ad.titleAr || ad.adTitle || ''
  const desc  = ad.description_ar || ad.descriptionAr || ad.adDescription || ''

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#FF7900]/20 bg-gradient-to-br from-[#FFF8F0] to-white shadow-sm">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 left-2 z-10 w-5 h-5 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="absolute top-2 right-2 z-10">
        <span className="bg-[#FF7900]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          إعلان
        </span>
      </div>

      <a href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="block">
        {image ? (
          <div className={compact ? 'h-20' : 'h-28'}>
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`${compact ? 'h-20' : 'h-28'} bg-gradient-to-r from-[#071B33] to-[#1a4a7a] flex items-center justify-center px-4`}>
            <p className="text-white font-bold text-base text-center">{title}</p>
          </div>
        )}

        {(title || desc) && image && (
          <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              {title && <p className="font-bold text-[#071B33] text-sm leading-tight truncate">{title}</p>}
              {desc && !compact && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{desc}</p>}
            </div>
            {href !== '#' && (
              <div className="flex-shrink-0 bg-[#FF7900] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                {href.startsWith('http') ? <ExternalLink className="w-3 h-3" /> : null}
                تفاصيل
              </div>
            )}
          </div>
        )}
      </a>
    </div>
  )
}

// ── Featured inline card (for technicians list) ─────────────────────────────
function FeaturedCard({ ad }) {
  const href  = ad.link_url || ad.linkUrl || '#'
  const image = getFileUrl(ad.image_url || ad.imageUrl || ad.imagePreview || null)
  const title = ad.title_ar || ad.titleAr || ad.adTitle || ''
  const desc  = ad.description_ar || ad.descriptionAr || ad.adDescription || ''

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : '_self'}
      rel="noreferrer"
      className="col-span-2 flex gap-3 items-center bg-gradient-to-r from-[#071B33] to-[#1a4a7a] rounded-2xl p-3.5 shadow-md"
    >
      {image && (
        <img src={image} alt={title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border-2 border-white/20" />
      )}
      <div className="min-w-0 flex-1">
        <span className="text-[#FF7900] text-[9px] font-bold uppercase tracking-wider">إعلان مميز</span>
        <p className="text-white font-bold text-sm leading-tight mt-0.5">{title}</p>
        {desc && <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{desc}</p>}
      </div>
      <div className="flex-shrink-0 bg-[#FF7900] text-white text-xs font-bold px-3 py-2 rounded-xl">
        تفاصيل
      </div>
    </a>
  )
}

// ── Main exported component ─────────────────────────────────────────────────
/**
 * placement: one of the defined placement keys or 'global'
 * variant: 'banner' (full-width rotating card) | 'featured' (inline 2-col card for grid)
 * compact: smaller height
 * dismissible: show X button
 * sectionId / categoryId: for targeted placements
 */
export default function AdBanner({
  placement,
  variant = 'banner',
  compact = false,
  dismissible = false,
  className = '',
  sectionId = null,
  categoryId = null,
}) {
  const [ads, setAds] = useState([])
  const [dismissed, setDismissed] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!placement) return
    // fetch this placement + global ads
    Promise.all([
      api.ads(placement).catch(() => []),
      api.ads('global').catch(() => []),
    ]).then(([placed, global]) => {
      // merge, dedup by id
      const merged = [...placed]
      for (const g of global) {
        if (!merged.find(a => a.id === g.id)) merged.push(g)
      }

      // filter by sectionId / categoryId if provided
      const filtered = merged.filter(ad => {
        if (ad.placement === 'section_page' && sectionId) {
          return (ad.section_id || ad.sectionId) === sectionId
        }
        if (ad.placement === 'category_page' && categoryId) {
          return (ad.category_id || ad.categoryId) === categoryId
        }
        return true
      })

      // sort by sortOrder
      filtered.sort((a, b) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0))
      setAds(filtered)
      setCurrentIndex(0)
    })
  }, [placement, sectionId, categoryId])

  // Rotate ads every 5 seconds
  useEffect(() => {
    if (ads.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [ads.length])

  if (ads.length === 0 || dismissed) return null

  const currentAd = ads[currentIndex]

  if (variant === 'featured') {
    return <FeaturedCard ad={currentAd} />
  }

  return (
    <div className={className}>
      <BannerCard
        ad={currentAd}
        compact={compact}
        onDismiss={dismissible ? () => setDismissed(true) : null}
      />
      {ads.length > 1 && (
        <div className="flex justify-center gap-1 mt-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-[#FF7900]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
