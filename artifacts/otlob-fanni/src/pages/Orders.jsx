import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Orders() {
  const { t } = useLang();

  return (
    <div className="bg-background min-h-screen pt-16 pb-20">
      <BackHeader title={t('ordersTitle')} />
      
      <main className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <ClipboardList className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{t('ordersEmpty')}</h2>
        <p className="text-muted-foreground mb-8 max-w-[250px]">
          {t('ordersEmptyDesc')}
        </p>
        <Link href="/">
          <Button className="font-bold px-8 h-12 rounded-full">{t('backToHome')}</Button>
        </Link>
      </main>
    </div>
  );
}
