import { useState } from 'react'
import { useLang } from '../context/LanguageContext';
import { ChevronRight, ChevronLeft, Share2, Search, UserPlus } from 'lucide-react';
import SearchOverlay from './SearchOverlay'
import { Link, useLocation } from 'wouter'

export default function BackHeader({ title }) {
  const { dir, lang, toggleLang } = useLang();
  const [searchOpen, setSearchOpen] = useState(false)
  const [location] = useLocation()
  const hideJoin = location === '/join-us' || location === '/join' || location === '/join-company'

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'اطلب فني – Otlob Fanni',
        text: lang === 'ar'
          ? 'دليل الفنيين والحرفيين في ليبيا – اطلب فني'
          : "Libya's technician & craftsman directory – Otlob Fanni",
        url: 'https://otlobfanni.ly',
      })
    } else {
      navigator.clipboard?.writeText('https://otlobfanni.ly')
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-3 max-w-[480px] mx-auto"
      >
        {/* Leading group: Back + Join */}
        <div className="flex items-end gap-2 flex-shrink-0" style={{ position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => window.history.back()}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#071B33' }}>
              {dir === 'rtl'
                ? <ChevronRight className="h-5 w-5 text-white" />
                : <ChevronLeft className="h-5 w-5 text-white" />}
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">
              {lang === 'ar' ? 'رجوع' : 'Back'}
            </span>
          </button>

          {!hideJoin && (
            <Link href="/join-us" style={{ textDecoration: 'none' }} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34C759 0%, #248a3d 100%)' }}>
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'انضم' : 'Join'}</span>
            </Link>
          )}
        </div>

        {/* Logo — absolutely centered, never shifts */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14" />
        </div>

        {/* Trailing group: WhatsApp + Search + Share + Language */}
        <div className="flex items-end gap-2 flex-shrink-0" style={{ position: 'relative', zIndex: 2 }}>
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

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#FF7900' }}>
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">
              {lang === 'ar' ? 'بحث' : 'Search'}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
          </button>

          <button
            onClick={toggleLang}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-base text-white" style={{ background: '#071B33' }}>
              {lang === 'ar' ? 'EN' : 'AR'}
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
