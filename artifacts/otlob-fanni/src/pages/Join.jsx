import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { categories } from '../data/services';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Join() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: t('success'),
      description: t('successMsg'),
    });
    setTimeout(() => {
      window.history.back();
    }, 2000);
  };

  return (
    <div className="bg-background min-h-screen pt-16 pb-6">
      <BackHeader title={t('joinTitle')} />
      
      <main className="px-4 py-6">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">{t('joinSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input id="name" required className="h-12 bg-white" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phoneNumber')}</Label>
            <Input id="phone" type="tel" required className="h-12 bg-white" dir="ltr" placeholder="+218910000000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">{t('specialty2')}</Label>
            <select 
              id="specialty" 
              required 
              className="flex h-12 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('specialty2')}...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('city2')}</Label>
            <Input id="city" required className="h-12 bg-white" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">{t('aboutUs')}</Label>
            <textarea 
              id="desc" 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>

          <Button type="submit" disabled={submitted} className="w-full h-14 mt-6 text-lg font-bold">
            {t('submit')}
          </Button>
        </form>
      </main>
    </div>
  );
}
