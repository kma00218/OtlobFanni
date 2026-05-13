import { useLang } from '../context/LanguageContext';
import { Info, FileText, Shield, Mail, Globe, Megaphone, HelpCircle, Share2, Heart, Smartphone, Download } from 'lucide-react';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';

const ITEMS = [
  {
    icon: HelpCircle,
    labelAr: 'الدعم',
    labelEn: 'Support',
    path: '/support',
    bg: 'from-[#0EA5E9] to-[#0369A1]',
    shadow: 'shadow-sky-200',
  },
  {
    icon: Megaphone,
    labelAr: 'أعلن معنا',
    labelEn: 'Advertise',
    path: '/advertise',
    bg: 'from-[#FF9500] to-[#cc7700]',
    shadow: 'shadow-amber-200',
  },
  {
    icon: Heart,
    labelAr: 'المفضلة',
    labelEn: 'Favorites',
    path: '/favorites',
    bg: 'from-[#FF2D55] to-[#c4002e]',
    shadow: 'shadow-rose-200',
  },
  {
    icon: Info,
    labelAr: 'من نحن',
    labelEn: 'About Us',
    path: '/about',
    bg: 'from-[#30B0C7] to-[#1a7a8a]',
    shadow: 'shadow-cyan-200',
  },
  {
    icon: Shield,
    labelAr: 'سياسة الخصوصية',
    labelEn: 'Privacy',
    path: '/privacy',
    bg: 'from-[#636366] to-[#48484a]',
    shadow: 'shadow-gray-300',
  },
  {
    icon: FileText,
    labelAr: 'شروط الخدمة',
    labelEn: 'Terms',
    path: '/terms',
    bg: 'from-[#AF52DE] to-[#7b2fa6]',
    shadow: 'shadow-purple-200',
  },
  {
    icon: Mail,
    labelAr: 'تواصل معنا',
    labelEn: 'Contact Us',
    path: '/contact',
    bg: 'from-[#FF2D55] to-[#c4002e]',
    shadow: 'shadow-rose-200',
  },
]

const IOS_STEPS_AR = [
  { n: '1', text: 'افتح التطبيق في متصفح Safari' },
  { n: '2', text: 'اضغط على زر المشاركة في أسفل الشاشة (مربع مع سهم للأعلى ⬆)' },
  { n: '3', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
  { n: '4', text: 'اضغط "إضافة" — خلصت!' },
]
const IOS_STEPS_EN = [
  { n: '1', text: 'Open the app in Safari browser' },
  { n: '2', text: 'Tap the Share button at the bottom (box with arrow ⬆)' },
  { n: '3', text: 'Select "Add to Home Screen"' },
  { n: '4', text: 'Tap "Add" — done!' },
]
const AND_STEPS_AR = [
  { n: '1', text: 'افتح التطبيق في متصفح Chrome' },
  { n: '2', text: 'اضغط على النقاط الثلاث ⋮ في أعلى الشاشة' },
  { n: '3', text: 'اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"' },
  { n: '4', text: 'اضغط "تثبيت" — خلصت!' },
]
const AND_STEPS_EN = [
  { n: '1', text: 'Open the app in Chrome browser' },
  { n: '2', text: 'Tap the three dots ⋮ at the top right' },
  { n: '3', text: 'Select "Add to Home Screen" or "Install App"' },
  { n: '4', text: 'Tap "Install" — done!' },
]

export default function More() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'
  const [installTab, setInstallTab] = useState('ios')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') { setInstalled(true); setInstallPrompt(null) }
  }

  return (
    <div className="bg-[#F2F2F7] min-h-screen pt-16 pb-24" dir={ar ? 'rtl' : 'ltr'}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#071B33]">{ar ? 'المزيد' : 'More'}</h1>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'اطلب فني – Otlob Fanni',
                text: ar
                  ? 'دليل الفنيين والحرفيين في ليبيا – اطلب فني'
                  : "Libya's technician & craftsman directory – Otlob Fanni",
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
      </div>

      <div className="px-5 mb-6">
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#071B33] to-[#1a3a5c] flex items-center justify-center shadow-md shadow-slate-300 flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-start">
            <p className="font-semibold text-gray-800 text-sm">{ar ? 'تغيير اللغة' : 'Change Language'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{ar ? 'Switch to English' : 'التبديل للعربية'}</p>
          </div>
          <span className="bg-[#FF7900] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {ar ? 'EN' : 'AR'}
          </span>
        </button>
      </div>

      {/* Install App Section */}
      <div id="install-section" className="px-5 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #1a3a5c 100%)' }}>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base">{ar ? 'ثبّت التطبيق على جهازك' : 'Install App on Your Device'}</p>
              <p className="text-white/70 text-xs mt-0.5">{ar ? 'مجاناً – بدون متجر تطبيقات' : 'Free – No app store needed'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-3 bg-[#F2F2F7]">
            <button
              onClick={() => setInstallTab('ios')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${installTab === 'ios' ? 'bg-[#071B33] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              <span>🍎</span> iPhone / iPad
            </button>
            <button
              onClick={() => setInstallTab('android')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${installTab === 'android' ? 'bg-[#34A853] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              <span>🤖</span> Android
            </button>
          </div>

          {/* Steps */}
          <div className="px-5 pb-5 pt-3">

            {installTab === 'ios' && (
              <div className="space-y-3">
                {(ar ? IOS_STEPS_AR : IOS_STEPS_EN).map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#071B33] text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <p className="text-gray-800 text-sm font-semibold leading-snug pt-1">{step.text}</p>
                  </div>
                ))}
              </div>
            )}

            {installTab === 'android' && (
              <div className="space-y-3">
                {/* Auto-install button if browser supports it */}
                {installPrompt && !installed && (
                  <button
                    onClick={handleInstall}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-base text-white mb-4 shadow-lg active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #34A853 0%, #1a7a36 100%)' }}
                  >
                    <Download className="w-5 h-5" />
                    {ar ? '⚡ ثبّت التطبيق الآن مباشرة' : '⚡ Install App Now'}
                  </button>
                )}
                {installed && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-base text-white mb-4 bg-gray-400">
                    {ar ? '✓ تم التثبيت بنجاح!' : '✓ Installed successfully!'}
                  </div>
                )}
                {(ar ? AND_STEPS_AR : AND_STEPS_EN).map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#34A853] text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <p className="text-gray-800 text-sm font-semibold leading-snug pt-1">{step.text}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          {ITEMS.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link key={idx} href={item.path}>
                <div className="flex flex-col items-center gap-2 active:scale-90 transition-transform duration-150 cursor-pointer select-none">
                  <div className={`w-[72px] h-[72px] rounded-[18px] bg-gradient-to-br ${item.bg} flex items-center justify-center shadow-lg ${item.shadow}`}>
                    <Icon className="w-8 h-8 text-white drop-shadow" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight max-w-[72px]">
                    {ar ? item.labelAr : item.labelEn}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">Otlob Fanni v1.0.0</p>
      </div>
    </div>
  )
}
