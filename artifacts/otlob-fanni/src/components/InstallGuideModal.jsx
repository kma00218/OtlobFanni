import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

function detectDevice() {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/i.test(ua) && !window.MSStream
  const isAndroid = /android/i.test(ua)
  const isInSafari = /safari/i.test(ua) && !/chrome/i.test(ua)
  const isInChrome = /chrome/i.test(ua)
  return { isIOS, isAndroid, isInSafari, isInChrome }
}

const STEPS = {
  ios: {
    ar: [
      { icon: '🌐', title: 'افتح في Safari', desc: 'تأكد أنك تستخدم متصفح Safari (مش Chrome أو غيره)' },
      { icon: '⬆️', title: 'اضغط زر المشاركة', desc: 'الزر في أسفل الشاشة — مربع فيه سهم للأعلى' },
      { icon: '📱', title: 'اختر "إضافة إلى الشاشة الرئيسية"', desc: 'مرر للأسفل في القائمة واضغط عليها' },
      { icon: '✅', title: 'اضغط "إضافة"', desc: 'ستجد التطبيق على شاشتك مثل أي تطبيق عادي!' },
    ],
    en: [
      { icon: '🌐', title: 'Open in Safari', desc: 'Make sure you\'re using Safari (not Chrome or Firefox)' },
      { icon: '⬆️', title: 'Tap the Share button', desc: 'Find it at the bottom of the screen — box with arrow' },
      { icon: '📱', title: 'Tap "Add to Home Screen"', desc: 'Scroll down in the menu to find it' },
      { icon: '✅', title: 'Tap "Add"', desc: 'The app will appear on your home screen like any app!' },
    ],
  },
  android: {
    ar: [
      { icon: '🌐', title: 'افتح في Chrome', desc: 'تأكد أنك تستخدم متصفح Chrome' },
      { icon: '⋮', title: 'اضغط النقاط الثلاث', desc: 'في أعلى يمين الشاشة (⋮)' },
      { icon: '📱', title: 'اختر "إضافة إلى الشاشة الرئيسية"', desc: 'أو "تثبيت التطبيق" إذا ظهرت' },
      { icon: '✅', title: 'اضغط "تثبيت"', desc: 'ستجد التطبيق على شاشتك مثل أي تطبيق عادي!' },
    ],
    en: [
      { icon: '🌐', title: 'Open in Chrome', desc: 'Make sure you\'re using Chrome browser' },
      { icon: '⋮', title: 'Tap the three dots', desc: 'Top right corner of the screen (⋮)' },
      { icon: '📱', title: 'Tap "Add to Home Screen"', desc: 'Or "Install App" if it appears' },
      { icon: '✅', title: 'Tap "Install"', desc: 'The app will appear on your home screen like any app!' },
    ],
  },
}

export default function InstallGuideModal({ ar, onClose, installPrompt, onInstall }) {
  const { isIOS, isAndroid } = detectDevice()
  const [tab, setTab] = useState(isIOS ? 'ios' : 'android')

  const steps = STEPS[tab][ar ? 'ar' : 'en']
  const iosColor  = '#071B33'
  const droidColor = '#34A853'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-white rounded-t-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #071B33 0%, #1a3a5c 100%)' }}
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold text-base leading-tight">
              {ar ? '📲 أضف التطبيق لهاتفك' : '📲 Add App to Your Phone'}
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              {ar ? 'مجاناً – بدون متجر تطبيقات' : 'Free – No app store needed'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device auto-detected banner */}
        {(isIOS || isAndroid) && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
            <Smartphone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-xs font-bold text-blue-700">
              {ar
                ? `تم اكتشاف جهازك تلقائياً: ${isIOS ? 'iPhone / iPad' : 'Android'}`
                : `Device detected: ${isIOS ? 'iPhone / iPad' : 'Android'}`}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-3 bg-[#F2F2F7] mx-4 mt-3 rounded-2xl">
          <button
            onClick={() => setTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'ios' ? 'bg-[#071B33] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <svg viewBox="0 0 814 1000" className="w-4 h-4 fill-current flex-shrink-0">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.9 0 111.1 2.6 168.3 87.1zm-174.5-73.4c-9-37.6-32.6-75.9-65.6-99.5C514.4 143.5 475 126 435.6 126c-5.8 0-11.6.6-17.4 1.3 24.4 38.3 39.1 80.4 39.1 123.8 0 43.4-14.7 85.5-39.1 123.8 5.2.6 10.4.6 15.6.6 41.5 0 84.7-19.8 118-54.4 21.1-21.9 36.5-48.1 42.8-74.2 3.4-16.5 5.2-32.6 5.2-48.7-.6-1.3-.6-1.3-.6-1.9z"/>
            </svg>
            iPhone / iPad
          </button>
          <button
            onClick={() => setTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'android' ? 'bg-[#34A853] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
              <path d="M17.523 0.976l-1.401 2.425a6.977 6.977 0 0 0-8.244 0L6.477.976a.5.5 0 0 0-.686.182.5.5 0 0 0 .182.687L7.35 3.24A6.978 6.978 0 0 0 5 8.5h14a6.978 6.978 0 0 0-2.35-5.26l.877-1.395a.5.5 0 0 0-.686-.869zM9.5 6a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm5 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zM3 9.5A1.5 1.5 0 0 0 1.5 11v5A1.5 1.5 0 0 0 3 17.5 1.5 1.5 0 0 0 4.5 16v-5A1.5 1.5 0 0 0 3 9.5zm18 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5v-5a1.5 1.5 0 0 0-1.5-1.5zM5 9.5v9a1.5 1.5 0 0 0 1.5 1.5H7v3a1.5 1.5 0 0 0 1.5 1.5A1.5 1.5 0 0 0 10 23v-3h4v3a1.5 1.5 0 0 0 1.5 1.5A1.5 1.5 0 0 0 17 23v-3h.5a1.5 1.5 0 0 0 1.5-1.5v-9z"/>
            </svg>
            Android
          </button>
        </div>

        {/* One-click install for Android (when prompt available) */}
        {tab === 'android' && installPrompt && (
          <div className="px-4 mt-3">
            <button
              onClick={onInstall}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-base text-white shadow-lg active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #34A853 0%, #1a7a36 100%)', boxShadow: '0 4px 20px rgba(52,168,83,0.4)' }}
            >
              <Download className="w-5 h-5" />
              {ar ? '⚡ ثبّت الآن بنقرة واحدة!' : '⚡ Install Now in One Tap!'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2 font-medium">
              {ar ? 'أو اتبع الخطوات أدناه يدوياً' : 'Or follow the steps below manually'}
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="px-4 py-4 space-y-3 pb-8" dir="rtl">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-2xl"
              style={{ background: i === 0 ? (tab === 'ios' ? '#f0f4ff' : '#f0fff4') : '#f9f9f9' }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm"
                style={{ background: tab === 'ios' ? iosColor : droidColor, color: 'white' }}
              >
                <span>{step.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#071B33] text-sm leading-tight">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black ml-1"
                    style={{ background: tab === 'ios' ? iosColor : droidColor }}
                  >
                    {i + 1}
                  </span>
                  {' '}{step.title}
                </p>
                <p className="text-gray-500 text-xs mt-0.5 leading-snug">{step.desc}</p>
              </div>
            </div>
          ))}

          {/* iOS Safari hint */}
          {tab === 'ios' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mt-1">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 font-medium">
                {ar
                  ? 'مهم: يجب أن تكون في متصفح Safari وليس Chrome أو أي متصفح آخر حتى تظهر خاصية الإضافة'
                  : 'Important: You must be in Safari browser (not Chrome) for the "Add to Home Screen" option to appear'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
