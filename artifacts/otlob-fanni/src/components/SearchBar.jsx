import { useLang } from '../context/LanguageContext';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchBar() {
  const { t, dir } = useLang();

  return (
    <div className="relative w-full">
      <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-3' : 'left-3'} flex items-center pointer-events-none`}>
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input 
        type="search" 
        placeholder={t('searchPlaceholder')} 
        className={`w-full bg-card border-none rounded-full h-12 text-base ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
      />
    </div>
  );
}
