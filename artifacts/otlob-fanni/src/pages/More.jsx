import { useLang } from '../context/LanguageContext';
import { Info, FileText, Shield, Mail, Globe, Megaphone, HelpCircle, UserPlus, Building2, Share2, Heart } from 'lucide-react';
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

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-xs">Otlob Fanni v1.0.0</p>
      </div>
    </div>
  )
}
