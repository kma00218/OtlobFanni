import { useLang } from '../context/LanguageContext';
import { MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { dir, t, toggleLang, lang } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4 max-w-[480px] mx-auto">
      <div className="flex items-center gap-2">
        <MapPin className="text-primary h-5 w-5" />
        <span className="font-medium text-foreground text-sm">{t('location')}</span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleLang} className="font-bold text-foreground">
          {lang === 'ar' ? 'EN' : 'AR'}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-foreground" />
        </Button>
      </div>
    </header>
  );
}
