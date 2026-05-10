import { useLang } from '../context/LanguageContext';
import { Link } from 'wouter';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TechnicianCard({ technician }) {
  const { lang, dir, t } = useLang();
  const name     = lang === 'ar' ? technician.nameAr     : technician.nameEn;
  const specialty = lang === 'ar' ? technician.categoryAr : technician.categoryEn;
  const city     = lang === 'ar' ? technician.cityAr     : technician.cityEn;
  const status   = lang === 'ar' ? technician.statusAr   : technician.statusEn;
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <Link href={`/technician/${technician.id}`} className="block bg-white rounded-xl shadow-sm border p-4 mb-3 hover-elevate active:scale-[0.98] transition-all">
      <div className="flex items-center gap-3">

        {/* Avatar — real photo or colored initials */}
        <div className="h-14 w-14 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-100">
          {technician.profilePhoto ? (
            <img src={technician.profilePhoto} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: technician.avatarColor }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-foreground truncate">{name}</h3>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${technician.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {status}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate mb-1">
            {specialty} • {city}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">{technician.rating}</span>
              <span className="text-xs text-muted-foreground">({technician.reviews})</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {t('priceFrom')} {technician.priceFrom} {t('lyd')}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-muted-foreground">
          {dir === 'rtl' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </div>
    </Link>
  );
}
