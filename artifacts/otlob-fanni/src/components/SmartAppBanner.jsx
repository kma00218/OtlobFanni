import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.otlobfanni.app'
const DISMISS_KEY = 'otlob_smart_banner_dismissed'

function isAndroidBrowser() {
  const ua = navigator.userAgent || ''
  if (!/android/i.test(ua)) return false
  // Already inside the TWA / standalone app — do not show
  const inStandalone = window.matchMedia('(display-mode: standalone)').matches
  const inTWA = document.referrer.startsWith('android-app://')
  return !inStandalone && !inTWA
}

export default function SmartAppBanner() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isAndroidBrowser()) return
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className="w-full flex items-center gap-3 px-3 py-2.5 z-50"
      style={{ background: '#071B33', minHeight: 56 }}
    >
      {/* App icon */}
      <img
        src="/icon-192.png"
        alt="اطلب فني"
        className="w-10 h-10 rounded-xl flex-shrink-0 shadow"
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-extrabold text-sm leading-tight truncate">
          {ar ? 'اطلب فني' : 'Otlob Fanni'}
        </p>
        <p className="text-white/60 text-[11px] leading-tight mt-0.5 truncate">
          {ar ? 'متاح الآن على Google Play' : 'Now on Google Play'}
        </p>
      </div>

      {/* CTA */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs text-white active:scale-95 transition-transform"
        style={{ background: '#34A853', whiteSpace: 'nowrap' }}
      >
        {/* Google Play icon */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white flex-shrink-0">
          <path d="M3.18 23.76c.3.17.64.22.98.14l11.65-11.65L11.7 8.14 3.18 23.76zm16.3-11.08L16.9 11.3 5.26.83a1.16 1.16 0 0 0-.48-.14l10.7 12zm1.37 1.08L17.6 12.5l2.48-1.36a1 1 0 0 0 0-1.74L17.6 7.76l3.25-3.6a1 1 0 0 0 0-1.43L18.51.96a1 1 0 0 0-1.42 0l-3.24 3.6-2.48-1.35a1 1 0 0 0-1.42.53L5.26.83l11.64 11.64L5.26 24.1a1.16 1.16 0 0 0 .48-.14l8.52-15.62 4.11 4.12 2.48-1.4a1 1 0 0 0 0-1.4z"/>
        </svg>
        {ar ? 'تحميل' : 'Get'}
      </a>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-white/70" />
      </button>
    </div>
  )
}
