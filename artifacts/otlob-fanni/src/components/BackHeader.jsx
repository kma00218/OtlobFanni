import { useLang } from '../context/LanguageContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackHeader({ title }) {
  const { dir, lang, toggleLang } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4 max-w-[480px] mx-auto">
      <button
        onClick={() => window.history.back()}
        className="p-2 -ml-2 mr-2 text-foreground active:scale-95 transition-transform"
      >
        {dir === 'rtl' ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>
      <h1 className="text-lg font-bold text-foreground flex-1">{title}</h1>
      <Button variant="ghost" size="icon" onClick={toggleLang} className="font-bold text-foreground text-sm">
        {lang === 'ar' ? 'EN' : 'AR'}
      </Button>
    </header>
  );
}
