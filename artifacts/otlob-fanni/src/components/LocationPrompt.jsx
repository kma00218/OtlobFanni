import { useState, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const STORAGE_KEY = 'location_prompt_seen'

export default function LocationPrompt() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen) return
    if (!navigator.geolocation) return

    navigator.permissions?.query({ name: 'geolocation' }).then(result => {
      if (result.state !== 'prompt') return
      const timer = setTimeout(() => setVisible(true), 6000)
      return () => clearTimeout(timer)
    }).catch(() => {
      const timer = setTimeout(() => setVisible(true), 6000)
      return () => clearTimeout(timer)
    })
  }, [])

  const handleAllow = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'shown')
    navigator.geolocation.getCurrentPosition(() => {}, () => {})
  }

  const handleLater = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'shown')
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[998] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div
        className="w-full max-w-[480px] bg-white rounded-t-3xl px-5 pt-6 pb-10 shadow-2xl"
        dir={ar ? 'rtl' : 'ltr'}
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        <button
          onClick={handleLater}
          className="absolute top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          style={{ [ar ? 'left' : 'right']: '1rem' }}
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #071B33, #1a3a5c)' }}>
            <MapPin className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[#071B33] mb-1">
              {ar ? 'السماح بالوصول للموقع 📍' : 'Allow Location Access 📍'}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {ar
                ? 'للعثور على أقرب الفنيين والحرفيين في مدينتك بسهولة'
                : 'To find the nearest technicians and craftsmen in your city'}
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 mt-1">
            <button
              onClick={handleAllow}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white text-base active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #071B33, #1a3a5c)' }}
            >
              {ar ? '📍 السماح بالوصول' : '📍 Allow Access'}
            </button>
            <button
              onClick={handleLater}
              className="w-full py-3 rounded-2xl font-semibold text-gray-400 text-sm active:scale-95 transition-transform"
            >
              {ar ? 'لاحقاً' : 'Maybe later'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
