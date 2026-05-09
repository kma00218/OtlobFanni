import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { technicians } from '../data/services';
import { useRoute } from 'wouter';
import { Star, MapPin, Briefcase, Phone, MessageSquare, Tag, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TechnicianDetails() {
  const { t, lang, dir } = useLang();
  const [, params] = useRoute('/technician/:id');
  const techId = params?.id;
  
  const technician = technicians.find(tech => tech.id === techId);
  
  if (!technician) return null;

  const name = lang === 'ar' ? technician.nameAr : technician.nameEn;
  const specialty = lang === 'ar' ? technician.categoryAr : technician.categoryEn;
  const city = lang === 'ar' ? technician.cityAr : technician.cityEn;
  const status = lang === 'ar' ? technician.statusAr : technician.statusEn;
  const description = lang === 'ar' ? technician.descriptionAr : technician.descriptionEn;
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <div className="bg-background min-h-screen pt-16 pb-[100px]">
      <BackHeader title={name} />
      
      <main className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center">
          <div 
            className="h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4"
            style={{ backgroundColor: technician.avatarColor }}
          >
            {initials}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-1">{name}</h2>
          
          <div className={`px-3 py-1 rounded-full text-xs font-bold mb-3 ${technician.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status}
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold text-foreground">{technician.rating}</span>
            <span className="text-sm text-muted-foreground ml-1">({technician.reviews} {t('reviews')})</span>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('experience')}</span>
              <span className="font-bold text-foreground">{technician.experienceYears} {t('years')}</span>
            </div>
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <Tag className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('priceFrom')}</span>
              <span className="font-bold text-foreground">{technician.priceFrom} {t('lyd')}</span>
            </div>
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <MapPin className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('city2')}</span>
              <span className="font-bold text-foreground">{city}</span>
            </div>
            <div className="bg-card rounded-xl p-3 flex flex-col items-center justify-center">
              <Wrench className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground mb-0.5">{t('specialty2')}</span>
              <span className="font-bold text-foreground text-center line-clamp-1">{specialty}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="text-lg font-bold text-foreground mb-2">{t('aboutTech')}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </main>

      <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-white border-t z-40 max-w-[480px] mx-auto flex gap-3">
        <a 
          href={`https://wa.me/${technician.whatsapp}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1"
        >
          <Button className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl gap-2 text-lg">
            <MessageSquare className="h-5 w-5 fill-current" />
            {t('whatsapp')}
          </Button>
        </a>
        <a 
          href={`tel:${technician.phone}`}
          className="flex-1"
        >
          <Button className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2 text-lg">
            <Phone className="h-5 w-5 fill-current" />
            {t('call')}
          </Button>
        </a>
      </div>
    </div>
  );
}
