import { useState, useEffect, useRef } from 'react'
import { useLang } from '../context/LanguageContext'
import { MapPin, Loader2 } from 'lucide-react'
import { useLocation, Link } from 'wouter'

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

export default function Header({ woodTexture = false }) {
  const { dir, t, toggleLang, lang } = useLang()
  const [, navigate] = useLocation()
  const [locationLabel, setLocationLabel] = useState(null)
  const [locState, setLocState] = useState('idle') // idle | loading | granted | denied
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef(null)

  const handleLogoClick = () => {
    logoClickCount.current += 1
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0
      navigate('/admin/login')
      return
    }
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0 }, 5000)
  }

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
    <header className="fixed top-0 left-0 right-0 h-16 z-50 grid grid-cols-[auto_1fr_auto] items-center px-3 max-w-[480px] mx-auto bg-white border-b border-[#EAEAEA]">

      {/* Left — location */}
      <button
        onClick={requestLocation}
        disabled={locState === 'loading'}
        className="flex items-center gap-1 active:opacity-70 transition-opacity min-w-0"
        title={locState === 'denied' ? 'Location access denied' : 'Tap to update location'}
      >
        {locState === 'loading' ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
        ) : (
          <MapPin className={`h-4 w-4 flex-shrink-0 ${locState === 'granted' ? 'text-primary' : 'text-gray-400'}`} />
        )}
        <span className={`font-medium text-xs truncate max-w-[90px] ${locState === 'granted' ? 'text-foreground' : 'text-gray-500'}`}>
          {displayLabel}
        </span>
      </button>

      {/* Center — logo (tappable: 5× → admin) */}
      <div className="flex justify-center" onClick={handleLogoClick} style={{ cursor: 'default' }}>
        <img
          src="/logo.png"
          alt="اطلب فني"
          draggable={false}
          style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Right — EN toggle + WhatsApp */}
      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <a
          href="https://wa.me/491791607597"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center active:scale-90 transition-transform duration-150"
          style={{ background: '#25D366' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-4.5 w-4.5" style={{ width: 18, height: 18 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-sm text-white active:scale-90 transition-transform duration-150"
          style={{ background: '#FF7900' }}
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
      </div>
    </header>
  )
}
