import { useLang } from '../context/LanguageContext';
import { ChevronRight, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4 max-w-[480px] mx-auto">
      <button
        onClick={() => window.history.back()}
        className="p-2 -ml-2 mr-2 text-foreground active:scale-95 transition-transform"
      >
        {dir === 'rtl' ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>
      <h1 className="text-lg font-bold text-foreground flex-1">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform duration-150"
        >
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
            <Share2 className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-[9px] font-semibold text-gray-500 leading-none">share</span>
        </button>
        <button
          onClick={toggleLang}
          className="flex items-center justify-center px-3 h-9 rounded-xl font-extrabold text-sm text-white active:scale-90 transition-transform"
          style={{ background: '#FF7900', minWidth: 44 }}
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
      </div>
    </header>
  );
}
