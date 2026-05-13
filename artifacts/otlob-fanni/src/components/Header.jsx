import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import { MapPin, Bell, Loader2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function reverseGeocode(lat, lon, lang) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`,
      { headers: { 'Accept-Language': lang } }
    )
    const data = await res.json()
    const addr = data.address || {}
    // Prefer city > town > county > state
    return (
      addr.city     ||
      addr.town     ||
      addr.village  ||
      addr.county   ||
      addr.state    ||
      data.display_name?.split(',')[0] ||
      null
    )
  } catch {
    return null
  }
}

export default function Header() {
  const { dir, t, toggleLang, lang } = useLang()
  const [locationLabel, setLocationLabel] = useState(null)
  const [locState, setLocState] = useState('idle') // idle | loading | granted | denied

  const requestLocation = () => {
    if (!navigator.geolocation) return
    setLocState('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const label = await reverseGeocode(latitude, longitude, lang)
        setLocationLabel(label)
        setLocState('granted')
      },
      () => {
        setLocState('denied')
      },
      { timeout: 8000 }
    )
  }

  // Auto-request on mount
  useEffect(() => {
    // Only auto-request if permission was previously granted
    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') requestLocation()
    }).catch(() => {})
  }, [])

  // Re-resolve label if language changes and we already have permission
  useEffect(() => {
    if (locState === 'granted' && locationLabel) {
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude, lang)
        if (label) setLocationLabel(label)
      })
    }
  }, [lang])

  const displayLabel = locationLabel || t('location')

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4 max-w-[480px] mx-auto">
      {/* Location button — tappable to request GPS */}
      <button
        onClick={requestLocation}
        disabled={locState === 'loading'}
        className="flex items-center gap-1.5 active:opacity-70 transition-opacity min-w-0"
        title={locState === 'denied' ? 'Location access denied' : 'Tap to update location'}
      >
        {locState === 'loading' ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
        ) : (
          <MapPin className={`h-4 w-4 flex-shrink-0 ${locState === 'granted' ? 'text-primary' : 'text-gray-400'}`} />
        )}
        <span className={`font-medium text-sm truncate max-w-[160px] ${locState === 'granted' ? 'text-foreground' : 'text-gray-500'}`}>
          {displayLabel}
        </span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'اطلب فني – Otlob Fanni',
                text: lang === 'ar'
                  ? 'دليل الفنيين والحرفيين في ليبيا – اطلب فني'
                  : 'Libya\'s technician & craftsman directory – Otlob Fanni',
                url: 'https://otlobfanni.ly',
              })
            } else {
              navigator.clipboard?.writeText('https://otlobfanni.ly')
            }
          }}
          className="flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform duration-150"
        >
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
            <Share2 className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-[9px] font-semibold text-gray-500 leading-none">share</span>
        </button>
        <button
          onClick={toggleLang}
          className="flex items-center justify-center px-3 h-9 rounded-xl font-extrabold text-sm text-white active:scale-90 transition-transform"
          style={{ background: '#FF7900', minWidth: 44 }}
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-foreground" />
        </Button>
      </div>
    </header>
  )
}
