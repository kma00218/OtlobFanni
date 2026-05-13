import { useState, useEffect } from 'react'
import { Bell, X, BellOff } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const STORAGE_KEY = 'notif_prompt_seen'

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      new Notification('اطلب فني 🔔', {
        body: 'تم تفعيل الإشعارات بنجاح! سنبقيك على اطلاع دائم.',
        icon: '/icon-192.png',
      })
    }
    return result
  }

  return { permission, requestPermission }
}

export default function NotificationPrompt() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [visible, setVisible] = useState(false)
  const { permission, requestPermission } = useNotifications()

  useEffect(() => {
    if (permission !== 'default') return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen) return
    const timer = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(timer)
  }, [permission])

  const handleAllow = async () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'shown')
    await requestPermission()
  }

  const handleLater = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'shown')
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div
        className="w-full max-w-[480px] bg-white rounded-t-3xl px-5 pt-6 pb-10 shadow-2xl"
        dir={ar ? 'rtl' : 'ltr'}
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        <button
          onClick={handleLater}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          style={{ [ar ? 'left' : 'right']: '1rem', [ar ? 'right' : 'left']: 'auto' }}
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
            <Bell className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[#071B33] mb-1">
              {ar ? 'فعّل الإشعارات 🔔' : 'Enable Notifications 🔔'}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {ar
                ? 'كن أول من يعرف عن الفنيين الجدد والعروض في منطقتك'
                : 'Be the first to know about new technicians and offers in your area'}
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 mt-1">
            <button
              onClick={handleAllow}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white text-base active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}
            >
              {ar ? '✅ تفعيل الإشعارات' : '✅ Enable Notifications'}
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

export function NotificationSettingsRow({ ar }) {
  const { permission, requestPermission } = useNotifications()

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-[#34A853]">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{ar ? 'الإشعارات' : 'Notifications'}</p>
          <p className="text-xs text-[#34A853] font-medium mt-0.5">{ar ? '✓ مفعّلة' : '✓ Enabled'}</p>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-gray-300">
          <BellOff className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{ar ? 'الإشعارات' : 'Notifications'}</p>
          <p className="text-xs text-red-400 font-medium mt-0.5">
            {ar ? 'محظورة – فعّلها من إعدادات الجهاز' : 'Blocked – enable from device settings'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <button onClick={requestPermission} className="w-full text-start flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
        <Bell className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{ar ? 'تفعيل الإشعارات' : 'Enable Notifications'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{ar ? 'اضغط للتفعيل' : 'Tap to enable'}</p>
      </div>
      <span className="text-xs bg-[#FF7900] text-white font-bold px-2 py-0.5 rounded-lg">
        {ar ? 'جديد' : 'NEW'}
      </span>
    </button>
  )
}
