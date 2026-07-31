import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.otlobfanni.app'
const DISMISS_KEY_ANDROID = 'otlob_smart_banner_android_dismissed'
const DISMISS_KEY_IOS     = 'otlob_smart_banner_ios_dismissed'

function detectPlatform() {
  const ua = navigator.userAgent || ''
  const inStandalone = window.matchMedia('(display-mode: standalone)').matches
  const inPWA = inStandalone || window.navigator.standalone === true
  const inTWA = document.referrer.startsWith('android-app://')

  if (inPWA || inTWA) return null // already installed — show nothing

  if (/android/i.test(ua)) return 'android'

  const isIOS = /iPad|iPhone|iPod/i.test(ua) && !window.MSStream
  if (!isIOS) return null

  // Only show on Safari — in-app browsers (FB, IG, WhatsApp…) can't install PWA
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edga|opr\//i.test(ua)
  const isInAppBrowser = /FBAN|FBAV|Instagram|Twitter|Snapchat|TikTok|Line\/|wechat|micromessenger|whatsapp/i.test(ua)
  if (!isSafari || isInAppBrowser) return null

  return 'ios'
}

export default function SmartAppBanner({ onIOSInstall }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [platform, setPlatform] = useState(null)

  useEffect(() => {
    const p = detectPlatform()
    if (!p) return
    const key = p === 'android' ? DISMISS_KEY_ANDROID : DISMISS_KEY_IOS
    if (!localStorage.getItem(key)) setPlatform(p)
  }, [])

  if (!platform) return null

  function dismiss() {
    const key = platform === 'android' ? DISMISS_KEY_ANDROID : DISMISS_KEY_IOS
    localStorage.setItem(key, '1')
    setPlatform(null)
  }

  const isAndroid = platform === 'android'

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className="w-full flex items-center gap-3 px-3 py-2.5 z-50"
      style={{
        background: isAndroid ? '#071B33' : '#1C1C1E',
        minHeight: 56,
      }}
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
          {isAndroid
            ? (ar ? 'متاح الآن على Google Play' : 'Now on Google Play')
            : (ar ? 'أضفه لشاشتك الرئيسية مجاناً' : 'Add to your home screen — free')}
        </p>
      </div>

      {/* CTA */}
      {isAndroid ? (
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
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.55l2.302 1.33a1 1 0 010 1.726l-2.302 1.33L15.396 12l2.302-2.843zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/>
          </svg>
          {ar ? 'تحميل' : 'Get'}
        </a>
      ) : (
        <button
          onClick={() => { onIOSInstall?.(); dismiss() }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs text-white active:scale-95 transition-transform"
          style={{ background: '#FF7900', whiteSpace: 'nowrap' }}
        >
          {/* Share / Add icon */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-white flex-shrink-0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          {ar ? 'أضف' : 'Add'}
        </button>
      )}

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
