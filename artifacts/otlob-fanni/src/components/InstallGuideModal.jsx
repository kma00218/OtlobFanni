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
          <p className="text-white/60 text-xs">{ar ? 'ابحث عن زر المشاركة في أسفل الشاشة' : 'Find the Share button at the bottom'}</p>
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
          {ar ? '(زر مربع فيه سهم للأعلى ⬆ في شريط Safari)' : '(A square icon with an upward arrow ⬆ on Safari\'s bar)'}
        </p>
      </div>

      {/* 3 simple steps */}
      <div className="space-y-3">
        <Step n={1} icon="⋯" color="#FF7900"
          title={ar ? 'لا ترى زر المشاركة مباشرة؟' : 'Don\'t see the Share button right away?'}
          desc={ar ? 'اضغط أولاً على النقاط الثلاث ⋯ في شريط Safari أسفل الشاشة' : 'First tap the three dots ⋯ on Safari\'s bottom bar'} />
        <Step n={2} icon="⬆️" color="#FF7900"
          title={ar ? 'اضغط زر المشاركة' : 'Tap the Share button'}
          desc={ar ? 'مربع فيه سهم للأعلى ⬆ — إما في الشريط مباشرة أو داخل قائمة النقاط الثلاث' : 'A box with an upward arrow ⬆ — either directly on the bar, or inside the "•••" menu'} />
        <Step n={3} icon="📱" color="#FF7900"
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
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.otlobfanni.app'

function AndroidView({ ar, onClose }) {
  return (
    <div className="px-5 pb-10 pt-3">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <p className="text-[#071B33] font-black text-lg">
          {ar ? '📲 حمّل التطبيق' : '📲 Get the App'}
        </p>
        <div className="w-8" />
      </div>

      {/* App card */}
      <div className="bg-gradient-to-br from-[#071B33] to-[#0d2a4a] rounded-2xl px-5 py-5 mb-5 flex items-center gap-4">
        <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14 rounded-2xl shadow-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base leading-tight">{ar ? 'اطلب فني' : 'Otlob Fanni'}</p>
          <p className="text-white/60 text-xs mt-1 leading-snug">
            {ar ? 'التطبيق الرسمي — متاح الآن على Google Play' : 'Official app — now on Google Play'}
          </p>
        </div>
      </div>

      {/* Play Store button */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-white text-base shadow-lg active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #34A853 0%, #1a7a36 100%)' }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.55l2.302 1.33a1 1 0 010 1.726l-2.302 1.33L15.396 12l2.302-2.843zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/>
        </svg>
        {ar ? 'تحميل من Google Play' : 'Get it on Google Play'}
      </a>

      <p className="text-center text-gray-400 text-xs mt-3">
        {ar ? 'مجاني — Android 5.0 أو أحدث' : 'Free — Android 5.0 or later'}
      </p>
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
