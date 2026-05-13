import { useLang } from '../context/LanguageContext';
import { Info, FileText, Shield, Mail, Globe, Megaphone, HelpCircle, Share2, Heart, Smartphone, Download } from 'lucide-react';
import { Link } from 'wouter';

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

export default function More() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'

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

      <div className="px-5">
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

      {/* Install App Section */}
      <div className="px-5 mt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #071B33 0%, #1a3a5c 100%)' }}>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base">{ar ? 'حمّل التطبيق على جهازك' : 'Install App on Your Device'}</p>
              <p className="text-white/70 text-xs mt-0.5">{ar ? 'مجاناً – بدون متجر تطبيقات' : 'Free – No app store needed'}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* iOS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <p className="font-extrabold text-[#071B33] text-base">{ar ? 'آيفون (iPhone / iPad)' : 'iPhone / iPad (iOS)'}</p>
              </div>
              <div className="space-y-2.5">
                {(ar ? [
                  { n: '١', text: 'افتح التطبيق في متصفح Safari' },
                  { n: '٢', text: 'اضغط على زر المشاركة في أسفل الشاشة (مربع مع سهم للأعلى ⬆)' },
                  { n: '٣', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
                  { n: '٤', text: 'اضغط "إضافة" — خلصت!' },
                ] : [
                  { n: '1', text: 'Open the app in Safari browser' },
                  { n: '2', text: 'Tap the Share button at the bottom (box with arrow ⬆)' },
                  { n: '3', text: 'Select "Add to Home Screen"' },
                  { n: '4', text: 'Tap "Add" — done!' },
                ]).map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <p className="text-gray-700 text-sm font-semibold leading-snug">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Android */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-[#34A853] flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <p className="font-extrabold text-[#071B33] text-base">{ar ? 'أندرويد (Android)' : 'Android'}</p>
              </div>
              <div className="space-y-2.5">
                {(ar ? [
                  { n: '١', text: 'افتح التطبيق في متصفح Chrome' },
                  { n: '٢', text: 'اضغط على النقاط الثلاث ⋮ في أعلى الشاشة' },
                  { n: '٣', text: 'اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"' },
                  { n: '٤', text: 'اضغط "تثبيت" — خلصت!' },
                ] : [
                  { n: '1', text: 'Open the app in Chrome browser' },
                  { n: '2', text: 'Tap the three dots ⋮ at the top of the screen' },
                  { n: '3', text: 'Select "Add to Home Screen" or "Install App"' },
                  { n: '4', text: 'Tap "Install" — done!' },
                ]).map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#34A853] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <p className="text-gray-700 text-sm font-semibold leading-snug">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-xs">Otlob Fanni v1.0.0</p>
      </div>
    </div>
  )
}
