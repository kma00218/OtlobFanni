import { useState, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import api from '../lib/api'

// ── Single horizontal banner card ──────────────────────────────────────────
function BannerCard({ ad, onDismiss, compact }) {
  const href = ad.link_url || ad.linkUrl || '#'
  const image = ad.image_url || ad.imageUrl || ad.imagePreview || null
  const title = ad.title_ar || ad.titleAr || ad.adTitle || ''
  const desc  = ad.description_ar || ad.descriptionAr || ad.adDescription || ''

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#FF7900]/20 bg-gradient-to-br from-[#FFF8F0] to-white shadow-sm">
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 left-2 z-10 w-5 h-5 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Sponsored badge */}
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
  const image = ad.image_url || ad.imageUrl || ad.imagePreview || null
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
 * placement: 'home' | 'categories' | 'technicians' | 'banner'
 * variant: 'banner' (full-width card) | 'featured' (inline 2-col card for grid)
 * compact: smaller height
 * dismissible: show X button
 */
export default function AdBanner({ placement, variant = 'banner', compact = false, dismissible = false, className = '' }) {
  const [ads, setAds] = useState([])
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    if (!placement) return
    api.ads(placement).then(setAds).catch(() => {})
  }, [placement])

  const visible = ads.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  if (variant === 'featured') {
    return (
      <>
        {visible.map(ad => (
          <FeaturedCard key={ad.id} ad={ad} />
        ))}
      </>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visible.map(ad => (
        <BannerCard
          key={ad.id}
          ad={ad}
          compact={compact}
          onDismiss={dismissible ? () => setDismissed(prev => new Set([...prev, ad.id])) : null}
        />
      ))}
    </div>
  )
}
