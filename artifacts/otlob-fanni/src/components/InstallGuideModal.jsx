import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

function detectEnv() {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/i.test(ua) && !window.MSStream
  const isAndroid = /android/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edga|opr\//i.test(ua)
  const isInApp = /FBAN|FBAV|Instagram|Twitter|Snapchat|TikTok|Line\/|wechat|micromessenger|whatsapp/i.test(ua)
  return { isIOS, isAndroid, isSafari, isInApp }
}

/* ─── iOS Safari view ──────────────────────────────────────── */
function IosSafariView({ ar, onClose }) {
  return (
    <div className="px-5 pb-10 pt-3">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <p className="text-[#071B33] font-black text-lg">
          {ar ? '📲 أضف التطبيق لهاتفك' : '📲 Add App to Phone'}
        </p>
        <div className="w-8" />
      </div>

      {/* Visual indicator */}
      <div className="relative bg-gradient-to-b from-[#071B33] to-[#0d2544] rounded-3xl px-6 py-6 mb-6 overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <img src="/icon-192.png" alt="اطلب فني" className="w-16 h-16 rounded-2xl shadow-lg" />
          <p className="text-white font-bold text-sm">{ar ? 'اطلب فني' : 'Otlob Fanni'}</p>
          <p className="text-white/60 text-xs">{ar ? 'اضغط على زر المشاركة أدناه' : 'Tap the Share button below'}</p>
        </div>

        {/* Animated arrow pointing down */}
        <div className="flex justify-center mt-4">
          <div style={{ animation: 'installArrow 1.3s ease-in-out infinite' }}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-8 bg-[#FF7900]" />
              <div className="w-0 h-0" style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '10px solid #FF7900'
              }} />
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-[11px] mt-2">
          {ar ? '(زر السهم في شريط Safari أسفل الشاشة)' : '(Share icon in Safari\'s bottom bar)'}
        </p>
      </div>

      {/* 2 simple steps */}
      <div className="space-y-3">
        <Step n={1} icon="⬆️" color="#FF7900"
          title={ar ? 'اضغط زر المشاركة' : 'Tap the Share button'}
          desc={ar ? 'الزر في أسفل الشاشة — مربع فيه سهم للأعلى ⬆' : 'At the bottom — box with upward arrow ⬆'} />
        <Step n={2} icon="📱" color="#FF7900"
          title={ar ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Tap "Add to Home Screen"'}
          desc={ar ? 'مرر للأسفل في القائمة واضغط عليها ثم اضغط "إضافة"' : 'Scroll down in the list and tap it, then tap "Add"'} />
      </div>

      <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5">
        <span className="text-amber-500 text-base flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-700 font-semibold leading-snug">
          {ar ? 'تأكد أنك في متصفح Safari وليس Chrome أو أي متصفح آخر' : 'Make sure you\'re using Safari, not Chrome or another browser'}
        </p>
      </div>

      <style>{`@keyframes installArrow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }`}</style>
    </div>
  )
}

/* ─── iOS NOT Safari view ──────────────────────────────────── */
function IosNotSafariView({ ar, onClose }) {
  const [copied, setCopied] = useState(false)
  const url = 'otlobfanni.ly'

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://' + url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="px-5 pb-10 pt-3">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <p className="text-[#071B33] font-black text-lg">
          {ar ? '📲 تثبيت التطبيق' : '📲 Install App'}
        </p>
        <div className="w-8" />
      </div>

      {/* Big warning card */}
      <div className="rounded-3xl overflow-hidden mb-5">
        <div style={{ height: 4, background: 'linear-gradient(90deg, #FF7900, #FFB347, #FF7900)' }} />
        <div className="px-5 py-5 text-center" style={{ background: 'linear-gradient(145deg, #071B33, #0d2544)' }}>
          <div className="text-4xl mb-3">🧭</div>
          <p className="text-white font-black text-base mb-1">
            {ar ? 'يجب فتح الرابط في Safari' : 'Open in Safari to Install'}
          </p>
          <p className="text-white/60 text-xs leading-relaxed">
            {ar
              ? 'المتصفح الحالي لا يدعم تثبيت التطبيق. انسخ الرابط ثم افتحه في Safari'
              : 'Your current browser doesn\'t support installation. Copy the link and open it in Safari'}
          </p>
        </div>
      </div>

      {/* URL + Copy */}
      <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 mb-4">
        <p className="flex-1 text-[#071B33] font-bold text-sm text-center" dir="ltr">{url}</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95"
          style={{ background: copied ? '#34A853' : '#FF7900' }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? (ar ? 'تم النسخ!' : 'Copied!') : (ar ? 'نسخ' : 'Copy')}
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        <Step n={1} icon="📋" color="#6366f1"
          title={ar ? 'انسخ الرابط أعلاه' : 'Copy the link above'}
          desc={ar ? 'اضغط زر "نسخ"' : 'Tap the "Copy" button'} />
        <Step n={2} icon="🧭" color="#6366f1"
          title={ar ? 'افتح تطبيق Safari' : 'Open the Safari app'}
          desc={ar ? 'ابحث عن Safari في هاتفك' : 'Find Safari on your phone'} />
        <Step n={3} icon="📲" color="#6366f1"
          title={ar ? 'الصق الرابط واضغط "إضافة إلى الشاشة الرئيسية"' : 'Paste link → "Add to Home Screen"'}
          desc={ar ? 'من شريط المشاركة ⬆ في أسفل Safari' : 'Via the Share ⬆ button in Safari\'s bottom bar'} />
      </div>
    </div>
  )
}

/* ─── Android no prompt view ───────────────────────────────── */
function AndroidView({ ar, onClose }) {
  return (
    <div className="px-5 pb-10 pt-3">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <p className="text-[#071B33] font-black text-lg">
          {ar ? '📲 أضف التطبيق لهاتفك' : '📲 Add App to Phone'}
        </p>
        <div className="w-8" />
      </div>

      <div className="bg-[#E8F5E9] rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#34A853] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M17.523 0.976l-1.401 2.425a6.977 6.977 0 0 0-8.244 0L6.477.976a.5.5 0 0 0-.686.182.5.5 0 0 0 .182.687L7.35 3.24A6.978 6.978 0 0 0 5 8.5h14a6.978 6.978 0 0 0-2.35-5.26l.877-1.395a.5.5 0 0 0-.686-.869zM9.5 6a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm5 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zM3 9.5A1.5 1.5 0 0 0 1.5 11v5A1.5 1.5 0 0 0 3 17.5 1.5 1.5 0 0 0 4.5 16v-5A1.5 1.5 0 0 0 3 9.5zm18 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5v-5a1.5 1.5 0 0 0-1.5-1.5zM5 9.5v9a1.5 1.5 0 0 0 1.5 1.5H7v3a1.5 1.5 0 0 0 1.5 1.5A1.5 1.5 0 0 0 10 23v-3h4v3a1.5 1.5 0 0 0 1.5 1.5A1.5 1.5 0 0 0 17 23v-3h.5a1.5 1.5 0 0 0 1.5-1.5v-9z"/>
          </svg>
        </div>
        <p className="text-[#1b5e20] text-xs font-bold leading-snug">
          {ar ? 'تأكد أنك تستخدم متصفح Chrome' : 'Make sure you\'re using Chrome browser'}
        </p>
      </div>

      <div className="space-y-3">
        <Step n={1} icon="⋮" color="#34A853"
          title={ar ? 'اضغط النقاط الثلاث ⋮' : 'Tap the three dots ⋮'}
          desc={ar ? 'في أعلى يمين متصفح Chrome' : 'Top right corner of Chrome'} />
        <Step n={2} icon="📱" color="#34A853"
          title={ar ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Tap "Add to Home Screen"'}
          desc={ar ? 'أو "تثبيت التطبيق" إذا ظهرت' : 'Or "Install App" if it appears'} />
        <Step n={3} icon="✅" color="#34A853"
          title={ar ? 'اضغط "تثبيت"' : 'Tap "Install"'}
          desc={ar ? 'ستجد التطبيق على شاشتك مثل أي تطبيق عادي!' : 'The app will appear on your home screen!'} />
      </div>
    </div>
  )
}

/* ─── Shared Step component ────────────────────────────────── */
function Step({ n, icon, color, title, desc }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: color }}>
        <span>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#071B33] text-sm leading-tight flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black flex-shrink-0"
            style={{ background: color }}>{n}</span>
          {title}
        </p>
        <p className="text-gray-500 text-xs mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  )
}

/* ─── Main export ──────────────────────────────────────────── */
export default function InstallGuideModal({ ar, onClose }) {
  const { isIOS, isSafari, isInApp } = detectEnv()

  let scenario = 'android'
  if (isIOS && isSafari && !isInApp) scenario = 'ios_safari'
  else if (isIOS && (!isSafari || isInApp)) scenario = 'ios_not_safari'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-white rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
        dir={ar ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>
        {scenario === 'ios_safari'     && <IosSafariView ar={ar} onClose={onClose} />}
        {scenario === 'ios_not_safari' && <IosNotSafariView ar={ar} onClose={onClose} />}
        {scenario === 'android'        && <AndroidView ar={ar} onClose={onClose} />}
      </div>
    </div>
  )
}
