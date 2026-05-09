import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const { t } = useLang();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: t('success'),
      description: t('successMsg'),
    });
    e.target.reset();
  };

  return (
    <div className="bg-background min-h-screen pt-16 pb-6">
      <BackHeader title={t('contactTitle')} />
      
      <main className="px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('call')}</p>
              <p className="font-bold" dir="ltr">+218 91 123 4567</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('contactEmail')}</p>
              <p className="font-bold">support@otlobfanni.ly</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('location')}</p>
              <p className="font-bold">Tripoli, Libya</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-sm border p-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input id="name" required className="bg-background" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('contactEmail')}</Label>
            <Input id="email" type="email" required className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="msg">{t('message')}</Label>
            <textarea 
              id="msg" 
              required
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>

          <Button type="submit" className="w-full h-12 font-bold">
            {t('sendMessage')}
          </Button>
        </form>
      </main>
    </div>
  );
}
