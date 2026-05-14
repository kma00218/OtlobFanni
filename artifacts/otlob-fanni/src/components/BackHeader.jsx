import { useLang } from '../context/LanguageContext';
import { ChevronRight, ChevronLeft, Share2 } from 'lucide-react';

export default function BackHeader({ title }) {
  const { dir, lang, toggleLang } = useLang();

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
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center px-3 max-w-[480px] mx-auto">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="p-2 text-foreground active:scale-95 transition-transform flex-shrink-0"
      >
        {dir === 'rtl' ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>

      {/* Center icon */}
      <div className="flex-1 flex justify-center items-center">
        <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14" />
      </div>

      {/* Share + Lang */}
      <div className="flex items-end gap-3 flex-shrink-0">
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
        >
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'مشاركة' : 'share'}</span>
        </button>
        <button
          onClick={toggleLang}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
        >
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-base text-white" style={{ background: '#FF7900' }}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>
    </header>
  );
}
