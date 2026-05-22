import { useLang } from '../context/LanguageContext';
import { Link } from 'wouter';
import { Star, MapPin, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { getFileUrl } from '../lib/api';
import { categories as CAT_LIST } from '../data/services';

const CAT_AR = Object.fromEntries(CAT_LIST.map(c => [c.id, c.nameAr]));
const CAT_EN = Object.fromEntries(CAT_LIST.map(c => [c.id, c.nameEn || c.nameAr]));

function isNewProfile(createdAt) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

export default function TechnicianCard({ technician }) {
  const { lang, dir, t } = useLang();
  const name        = (lang === 'ar' ? technician.nameAr : technician.nameEn) || technician.nameAr || technician.nameEn || '';
  const isNew = isNewProfile(technician.createdAt);
  const primarySpec = lang === 'ar' ? technician.categoryAr : technician.categoryEn;
  const extraIds    = technician.extraSpecialties || [];
  const extraNames  = extraIds
    .map(id => lang === 'ar' ? CAT_AR[id] : CAT_EN[id])
    .filter(Boolean);
  const allSpecialties = primarySpec
    ? [primarySpec, ...extraNames.filter(n => n !== primarySpec)]
    : extraNames;
  const specialty = allSpecialties.join(' · ');
  const city      = lang === 'ar'
    ? (technician.cityAr || technician.city_name_ar || technician.city || '')
    : (technician.cityEn || technician.city_name_en || technician.city_name_ar || technician.city || '');
  const status    = lang === 'ar' ? technician.statusAr   : technician.statusEn;
  const firstName = name ? (name.trim().split(' ')[0] || '؟') : '؟';

  return (
    <Link href={`/technician/${technician.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 active:scale-[0.98] transition-all">
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="h-14 w-14 rounded-xl flex-shrink-0 overflow-hidden border-2 border-gray-100 shadow-sm">
          {technician.profilePhoto ? (
            <img src={getFileUrl(technician.profilePhoto)} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-[#071B33] to-[#1a56db] text-center px-1 leading-tight"
              style={{ fontSize: name.length > 6 ? '8px' : '10px', wordBreak: 'break-word' }}
            >
              {name || '؟'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Status badge + name row */}
          <div className="flex justify-between items-center gap-2 mb-1">
            <h3 className="font-extrabold text-[#071B33] text-base leading-tight truncate">{name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isNew && (
                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {lang === 'ar' ? 'جديد' : 'New'}
                </span>
              )}
              <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${technician.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {status}
              </div>
            </div>
          </div>

          {/* Specialty — large prominent line */}
          {specialty && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1 h-5 rounded-full bg-[#FF7900] flex-shrink-0" />
              <span className="text-base font-extrabold text-[#FF7900] truncate">{specialty}</span>
            </div>
          )}

          {/* City + emergency */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">
              {city}{technician.area ? ` · ${technician.area}` : ''}
            </span>
            {technician.emergency && (
              <span className="flex items-center gap-0.5 bg-red-50 text-red-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ms-1">
                <Zap className="w-2.5 h-2.5" />
                {lang === 'ar' ? 'طوارئ' : 'Emergency'}
              </span>
            )}
          </div>

          {/* Rating + price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-800">{technician.rating}</span>
              <span className="text-[11px] text-gray-400">({technician.reviews})</span>
            </div>
            <span className="text-xs font-bold text-[#071B33]">
              {technician.priceTo > 0
                ? `${technician.priceFrom}–${technician.priceTo} ${t('lyd')}`
                : `${t('priceFrom')} ${technician.priceFrom} ${t('lyd')}`}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-gray-300 self-center">
          {dir === 'rtl' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>
    </Link>
  );
}
