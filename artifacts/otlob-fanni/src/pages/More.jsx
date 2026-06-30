import { useLang } from '../context/LanguageContext';
import { Info, FileText, Shield, Globe, Megaphone, HelpCircle, Share2, Heart, Download, Facebook, Instagram, ExternalLink, Bell, Briefcase, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { track } from '../lib/tracker';
import { NotificationSettingsRow } from '../components/NotificationPrompt';
import LibyaPhoneInput from '../components/LibyaPhoneInput';
import api from '../lib/api';

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

function IconGrid({ title, titleIcon, items, ar }) {
  return (
    <div className="px-4 mb-4">
      <div className={`flex items-center gap-2 mb-2 px-1 ${ar ? 'flex-row-reverse justify-end' : ''}`}>
        <span className="text-base">{titleIcon}</span>
        <p className="text-sm font-bold text-gray-500">{title}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-4 gap-y-4">
          {items.map((item, idx) => {
            const inner = (
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center shadow-sm ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-gray-600 text-center leading-tight w-full px-0.5 truncate">
                  {ar ? item.labelAr : item.labelEn}
                </span>
              </div>
            )
            if (item.external) {
              return (
                <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer" className="flex justify-center active:scale-90 transition-transform">
                  {inner}
                </a>
              )
            }
            if (item.onClick) {
              return (
                <button key={idx} onClick={item.onClick} className="flex justify-center active:scale-90 transition-transform">
                  {inner}
                </button>
              )
            }
            return (
              <Link key={idx} href={item.href} className="flex justify-center active:scale-90 transition-transform">
                {inner}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function More() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const [installTab, setInstallTab] = useState('ios')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [referralForm, setReferralForm] = useState({ type: 'technician', name: '', phone: '', specialty: '', city: '', submitting: false })

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

  const handleShare = () => {
    track('share')
    if (navigator.share) {
      navigator.share({
        title: 'اطلب فني – Otlob Fanni',
        text: ar ? 'دليل الفنيين والحرفيين في ليبيا – اطلب فني' : "Libya's technician & craftsman directory – Otlob Fanni",
        url: 'https://otlobfanni.ly',
      })
    } else {
      navigator.clipboard?.writeText('https://otlobfanni.ly')
    }
  }

  const followItems = [
    {
      labelAr: 'الموقع',
      labelEn: 'Website',
      href: 'https://otlobfanni.ly',
      external: true,
      bg: 'bg-gradient-to-br from-[#FF7900] to-[#c45e00]',
      icon: <Globe className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'تيك توك',
      labelEn: 'TikTok',
      href: 'https://www.tiktok.com/@otlobfanni',
      external: true,
      bg: 'bg-[#010101]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
        </svg>
      ),
    },
    {
      labelAr: 'إنستغرام',
      labelEn: 'Instagram',
      href: 'https://www.instagram.com/otlobfanni',
      external: true,
      bg: 'bg-gradient-to-br from-[#E1306C] to-[#833AB4]',
      icon: <Instagram className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'فيسبوك',
      labelEn: 'Facebook',
      href: 'https://www.facebook.com/otlobfanni.ly',
      external: true,
      bg: 'bg-[#1877F2]',
      icon: <Facebook className="w-6 h-6 text-white" strokeWidth={2} />,
    },
  ]

  const quickItems = [
    {
      labelAr: 'أعلن معنا',
      labelEn: 'Advertise',
      href: '/advertise',
      bg: 'bg-gradient-to-br from-[#FF9500] to-[#cc7700]',
      icon: <Megaphone className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'مشاركة',
      labelEn: 'Share',
      onClick: handleShare,
      bg: 'bg-[#7B2FBE]',
      icon: <Share2 className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'الخصوصية',
      labelEn: 'Privacy',
      href: '/privacy',
      bg: 'bg-gradient-to-br from-[#636366] to-[#48484a]',
      icon: <Shield className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'عن التطبيق',
      labelEn: 'About',
      href: '/about',
      bg: 'bg-gradient-to-br from-[#30B0C7] to-[#1a7a8a]',
      icon: <Info className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'المفضلة',
      labelEn: 'Favorites',
      href: '/favorites',
      bg: 'bg-gradient-to-br from-[#FF2D55] to-[#c4002e]',
      icon: <Heart className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'الدعم',
      labelEn: 'Support',
      href: '/support',
      bg: 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1]',
      icon: <HelpCircle className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'شروط الخدمة',
      labelEn: 'Terms',
      href: '/terms',
      bg: 'bg-gradient-to-br from-[#AF52DE] to-[#7b2fa6]',
      icon: <FileText className="w-6 h-6 text-white" strokeWidth={2} />,
    },
    {
      labelAr: 'واتساب',
      labelEn: 'WhatsApp',
      href: 'https://wa.me/491791607597',
      external: true,
      bg: 'bg-[#25D366]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
  ]

  return (
    <>
    <div className="bg-[#F2F2F7] min-h-screen pt-20 pb-28" dir={ar ? 'rtl' : 'ltr'}>

      {/* Fixed header — Share+WA | Icon (absolute center) | Lang */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-3 max-w-[480px] mx-auto">
        <div className="flex items-end gap-2 flex-shrink-0" style={{ position: 'relative', zIndex: 2 }}>
          <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">{ar ? 'مشاركة' : 'share'}</span>
          </button>
          <a
            href="https://wa.me/491791607597"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#25D366' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">WhatsApp</span>
          </a>
        </div>

        {/* Logo — absolutely centered, never shifts */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14" />
        </div>

        <button onClick={toggleLang} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0" style={{ position: 'relative', zIndex: 2 }}>
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-base text-white" style={{ background: '#FF7900' }}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </header>

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-[#071B33]">{ar ? 'المزيد' : 'More'}</h1>
      </div>

      {/* Professional Login Button */}
      <style>{`
        @keyframes orbitGlow {
          0%,100% { box-shadow: 0 0 0 3px #FF7900, 0 0 22px 4px rgba(255,121,0,0.45); }
          50%      { box-shadow: 0 0 0 3px #ffaa44, 0 0 36px 8px rgba(255,121,0,0.25); }
        }
        @keyframes iconPulse {
          0%,100% { box-shadow: 0 0 0 0px rgba(255,121,0,0.5); }
          60%      { box-shadow: 0 0 0 8px rgba(255,121,0,0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
      `}</style>
      <div className="px-4 mb-4">
        <button
          className="w-full text-start"
          onClick={() => {
            const session = localStorage.getItem('pro_session')
            navigate(session ? '/pro' : '/pro-login')
          }}>
          <div className="relative overflow-hidden flex items-center gap-4 px-4 py-5 rounded-2xl active:scale-[0.97] transition-transform cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #071B33 0%, #0e2647 60%, #1a1a2e 100%)',
              animation: 'orbitGlow 2.8s ease-in-out infinite',
            }}>

            {/* shimmer sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
                animation: 'shimmer 3.5s ease-in-out infinite',
              }} />
            </div>

            {/* orange top accent line */}
            <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, #FF7900, transparent)' }} />

            {/* icon */}
            <div className="relative flex-shrink-0">
              <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF7900 0%, #e05f00 100%)',
                  animation: 'iconPulse 2.8s ease-in-out infinite',
                }}>
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* text */}
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-white font-black text-lg leading-tight tracking-wide">
                  {ar ? 'أعمالي' : 'My Business'}
                </p>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                  style={{ background: '#FF7900', color: '#fff', letterSpacing: '0.05em' }}>
                  PRO
                </span>
              </div>
              <p className="text-white/55 text-xs leading-snug">
                {ar ? 'فنيين · شركات · موردين' : 'Technicians · Companies · Suppliers'}
              </p>
            </div>

            {/* arrow */}
            <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,121,0,0.18)', border: '1.5px solid rgba(255,121,0,0.4)' }}>
              <ExternalLink className="w-3.5 h-3.5" style={{ color: '#FF7900' }} />
            </div>
          </div>
        </button>
      </div>

      {/* Language Toggle */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#071B33] to-[#1a3a5c] flex items-center justify-center shadow-md shadow-slate-300 flex-shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-start">
              <p className="font-semibold text-gray-800 text-sm">{ar ? 'اللغة' : 'Language'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ar ? 'العربية / English' : 'Arabic / English'}</p>
            </div>
          </div>
          <div className="flex mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
            <button
              onClick={() => lang !== 'ar' && toggleLang()}
              className={`flex-1 py-2 text-sm font-bold transition-all duration-200 ${ar ? 'bg-[#FF7900] text-white shadow-sm' : 'text-gray-400'}`}
            >
              العربية
            </button>
            <button
              onClick={() => lang !== 'en' && toggleLang()}
              className={`flex-1 py-2 text-sm font-bold transition-all duration-200 ${!ar ? 'bg-[#FF7900] text-white shadow-sm' : 'text-gray-400'}`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Install App Section */}
      <div id="install-section" className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #071B33 0%, #1a3a5c 100%)' }}>
            <div className="w-9 h-9 rounded-[10px] bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">{ar ? 'ثبّت التطبيق على جهازك' : 'Install App on Your Device'}</p>
              <p className="text-white/70 text-xs mt-0.5">{ar ? 'مجاناً – بدون متجر تطبيقات' : 'Free – No app store needed'}</p>
            </div>
          </div>
          <div className="flex gap-2 p-3 bg-[#F2F2F7]">
            <button
              onClick={() => setInstallTab('ios')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${installTab === 'ios' ? 'bg-[#071B33] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              <svg viewBox="0 0 814 1000" className="w-4 h-4 fill-current flex-shrink-0"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.9 0 111.1 2.6 168.3 87.1zm-174.5-73.4c-9-37.6-32.6-75.9-65.6-99.5C514.4 143.5 475 126 435.6 126c-5.8 0-11.6.6-17.4 1.3 24.4 38.3 39.1 80.4 39.1 123.8 0 43.4-14.7 85.5-39.1 123.8 5.2.6 10.4.6 15.6.6 41.5 0 84.7-19.8 118-54.4 21.1-21.9 36.5-48.1 42.8-74.2 3.4-16.5 5.2-32.6 5.2-48.7-.6-1.3-.6-1.3-.6-1.9z"/></svg>
              iPhone / iPad
            </button>
            <button
              onClick={() => setInstallTab('android')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${installTab === 'android' ? 'bg-[#34A853] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.523 0.976l-1.401 2.425a6.977 6.977 0 0 0-8.244 0L6.477.976a.5.5 0 0 0-.686.182.5.5 0 0 0 .182.687L7.35 3.24A6.978 6.978 0 0 0 5 8.5h14a6.978 6.978 0 0 0-2.35-5.26l.877-1.395a.5.5 0 0 0-.686-.869zM9.5 6a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm5 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zM3 9.5A1.5 1.5 0 0 0 1.5 11v5A1.5 1.5 0 0 0 3 17.5 1.5 1.5 0 0 0 4.5 16v-5A1.5 1.5 0 0 0 3 9.5zm18 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5v-5a1.5 1.5 0 0 0-1.5-1.5zM5 9.5v9a1.5 1.5 0 0 0 1.5 1.5H7v3a1.5 1.5 0 0 0 1.5 1.5A1.5 1.5 0 0 0 10 23v-3h4v3a1.5 1.5 0 0 0 1.5 1.5A1.5 1.5 0 0 0 17 23v-3h.5a1.5 1.5 0 0 0 1.5-1.5v-9z"/></svg>
              Android
            </button>
          </div>
          <div className="px-4 pb-4 pt-2">
            {installTab === 'ios' && (
              <div className="space-y-3">
                {(ar ? IOS_STEPS_AR : IOS_STEPS_EN).map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#071B33] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <p className="text-gray-800 text-sm font-medium leading-snug pt-0.5">{step.text}</p>
                  </div>
                ))}
              </div>
            )}
            {installTab === 'android' && (
              <div className="space-y-3">
                {installPrompt && !installed && (
                  <button
                    onClick={handleInstall}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm text-white mb-3 shadow-md active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #34A853 0%, #1a7a36 100%)' }}
                  >
                    <Download className="w-4 h-4" />
                    {ar ? '⚡ ثبّت التطبيق الآن مباشرة' : '⚡ Install App Now'}
                  </button>
                )}
                {installed && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white mb-3 bg-gray-400">
                    {ar ? '✓ تم التثبيت بنجاح!' : '✓ Installed successfully!'}
                  </div>
                )}
                {(ar ? AND_STEPS_AR : AND_STEPS_EN).map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#34A853] text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <p className="text-gray-800 text-sm font-medium leading-snug pt-0.5">{step.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Contact Card */}
      <div className="px-4 mb-4">
        <a
          href="https://wa.me/491791607597"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-sm"
          style={{ background: 'linear-gradient(135deg, #25D366 0%, #1aab52 100%)' }}
        >
          <div className={`flex items-center gap-3 ${ar ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className={ar ? 'text-right' : 'text-left'}>
              <p className="text-white font-extrabold text-sm leading-tight">WhatsApp</p>
              <p className="text-white/80 text-xs mt-0.5 font-medium" dir="ltr">+1 929 718 6991</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </a>
      </div>

      {/* Telegram Channel Card */}
      <div className="px-4 mb-4">
        <a
          href="https://t.me/otlobfanni"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-sm"
          style={{ background: 'linear-gradient(90deg, #229ED9 0%, #1a7fb5 100%)', boxShadow: '0 4px 16px rgba(34,158,217,0.3)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <div className="flex-1 text-right">
            <p className="text-white font-extrabold text-sm leading-tight">
              {ar ? 'تابعنا على تيليغرام' : 'Follow us on Telegram'}
            </p>
            <p className="text-white/70 text-xs font-medium mt-0.5">t.me/otlobfanni</p>
          </div>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/40 flex-shrink-0">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      </div>

      {/* Referral Card */}
      <div className="px-4 mb-3">
        <button
          onClick={() => setShowReferral(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-sm"
          style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.3)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-white font-extrabold text-sm leading-tight">
              {ar ? 'رشّح فنياً أو شركة خدمية أو مورد مستلزمات' : 'Suggest a Technician or Business'}
            </p>
            <p className="text-white/70 text-xs mt-0.5 font-medium">
              {ar ? 'ساعدنا في توسيع الدليل' : 'Help us grow the directory'}
            </p>
          </div>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/50 flex-shrink-0 rotate-180" style={{ transform: 'rotate(180deg)' }}>
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>
      </div>

      {/* Share Card */}
      <div className="px-4 mb-4">
        <button
          onClick={handleShare}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-sm"
          style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #4c1578 100%)', boxShadow: '0 4px 16px rgba(107,33,168,0.3)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-white font-extrabold text-sm leading-tight">
              {ar ? 'شارك التطبيق مع أصدقائك' : 'Share App with Friends'}
            </p>
            <p className="text-white/70 text-xs mt-0.5 font-medium">
              {ar ? 'ساعد في نشر اطلب فني في ليبيا' : 'Help spread Otlob Fanni in Libya'}
            </p>
          </div>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/50 flex-shrink-0" style={{ transform: 'rotate(180deg)' }}>
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>
      </div>

      {/* Section: تابعنا / Follow Us */}
      <IconGrid
        ar={ar}
        title={ar ? 'تابعنا' : 'Follow Us'}
        titleIcon="👥"
        items={followItems}
      />

      {/* Section: روابط سريعة / Quick Links */}
      <IconGrid
        ar={ar}
        title={ar ? 'روابط سريعة' : 'Quick Links'}
        titleIcon="🔗"
        items={quickItems}
      />

      {/* Notifications Row */}
      <div className="px-4 mb-4">
        <div className="px-1 pb-2 pt-1">
          <span className="inline-flex items-center bg-[#071B33] text-white text-[12px] font-bold px-3 py-1 rounded-full">
            {ar ? 'الإشعارات' : 'Notifications'}
          </span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <NotificationSettingsRow ar={ar} />
        </div>
      </div>

      <div className="mt-4 mb-2 text-center">
        <p className="text-gray-400 text-xs">Otlob Fanni v1.0.0</p>
      </div>
    </div>

    {/* Referral Modal */}
    {showReferral && (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setShowReferral(false)}
      >
        <div
          className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 pb-28"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
          <h3 className="text-lg font-extrabold text-[#071B33] mb-1 text-center">
            {ar ? '💡 رشّح شخصاً تعرفه' : '💡 Recommend Someone'}
          </h3>
          <p className="text-xs text-gray-400 text-center mb-5">
            {ar ? 'أدخل بياناته وسنتواصل معه للانضمام' : "Enter their info and we'll reach out"}
          </p>

          <div className="flex gap-2 mb-1">
            {[
              { key: 'technician', label: ar ? '👷 فني'            : '👷 Technician',      sub: ar ? 'كهربائي، سباك، نجار...'  : 'Electrician, plumber...' },
              { key: 'company',    label: ar ? '🏢 شركة خدمية'     : '🏢 Service Company', sub: ar ? 'صيانة، تكييف، نظافة...'  : 'Maintenance, HVAC...' },
              { key: 'supplier',   label: ar ? '📦 مورّد مستلزمات' : '📦 Parts Supplier',  sub: ar ? 'قطع غيار، مواد بناء...' : 'Spare parts, materials...' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setReferralForm(f => ({ ...f, type: t.key }))}
                className={`flex-1 py-2 px-1 rounded-xl text-center border-2 transition-all flex flex-col items-center gap-0.5 ${
                  referralForm.type === t.key
                    ? 'border-[#FF7900] bg-orange-50 text-[#FF7900]'
                    : 'border-gray-400 text-gray-500 hover:border-gray-500'
                }`}
              >
                <span className="text-[11px] font-extrabold leading-tight">{t.label}</span>
                <span className="text-[9px] opacity-70 leading-tight">{t.sub}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mb-3">
            {ar ? '* التطبيق مخصص للخدمات الفنية والحرفية فقط' : '* App is for technical & craft services only'}
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={ar ? 'الاسم *' : 'Full name *'}
              value={referralForm.name}
              onChange={e => setReferralForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-[#071B33] outline-none focus:border-[#FF7900]"
              dir="rtl"
            />
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 px-1">
                {ar ? 'رقم واتساب *' : 'WhatsApp number *'}
              </p>
              <LibyaPhoneInput
                required
                value={referralForm.phone}
                onChange={v => setReferralForm(f => ({ ...f, phone: v }))}
              />
            </div>
            <input
              type="text"
              placeholder={
                referralForm.type === 'technician'
                  ? (ar ? 'التخصص (اختياري)' : 'Specialty (optional)')
                  : referralForm.type === 'company'
                  ? (ar ? 'نوع الخدمة (اختياري)' : 'Service type (optional)')
                  : (ar ? 'نوع المستلزمات (اختياري)' : 'Product type (optional)')
              }
              value={referralForm.specialty}
              onChange={e => setReferralForm(f => ({ ...f, specialty: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-[#071B33] outline-none focus:border-[#FF7900]"
              dir="rtl"
            />
            <input
              type="text"
              placeholder={ar ? 'المدينة (اختياري)' : 'City (optional)'}
              value={referralForm.city}
              onChange={e => setReferralForm(f => ({ ...f, city: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-[#071B33] outline-none focus:border-[#FF7900]"
              dir="rtl"
            />
            <button
              disabled={referralForm.submitting || !referralForm.name.trim() || !referralForm.phone.trim()}
              onClick={async () => {
                setReferralForm(f => ({ ...f, submitting: true }))
                try {
                  await api.submitReferral({
                    type:      referralForm.type,
                    name:      referralForm.name.trim(),
                    phone:     referralForm.phone.trim(),
                    specialty: referralForm.specialty.trim() || null,
                    city:      referralForm.city.trim() || null,
                  })
                  setShowReferral(false)
                  setReferralForm({ type: 'technician', name: '', phone: '', specialty: '', city: '', submitting: false })
                  alert(ar ? '✅ شكراً! تم إرسال الترشيح بنجاح' : '✅ Thanks! Referral submitted.')
                } catch {
                  alert(ar ? 'حدث خطأ، حاول مرة أخرى' : 'Error, please try again.')
                  setReferralForm(f => ({ ...f, submitting: false }))
                }
              }}
              className="w-full rounded-xl py-3.5 text-sm font-extrabold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, #FF7900 0%, #c45e00 100%)' }}
            >
              {referralForm.submitting
                ? (ar ? 'جاري الإرسال...' : 'Sending...')
                : (ar ? '✅ إرسال الترشيح' : '✅ Submit Referral')}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
