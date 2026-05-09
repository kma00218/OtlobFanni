import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Favorites() {
  const { t } = useLang();

  return (
    <div className="bg-background min-h-screen pt-16 pb-20">
      <BackHeader title={t('favoritesTitle')} />
      
      <main className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{t('favoritesEmpty')}</h2>
        <Link href="/">
          <Button className="font-bold px-8 h-12 rounded-full mt-4">{t('backToHome')}</Button>
        </Link>
      </main>
    </div>
  );
}
