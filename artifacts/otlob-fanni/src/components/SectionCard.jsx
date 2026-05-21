import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'

const SECTION_GRADIENT = {
  home_services:     { g1: '#42A5F5', g2: '#1565C0', shadow: '#1565C0' },
  car_services:      { g1: '#78909C', g2: '#263238', shadow: '#263238' },
  construction:      { g1: '#FFA726', g2: '#E65100', shadow: '#E65100' },
  tech_security:     { g1: '#5C6BC0', g2: '#1A237E', shadow: '#1A237E' },
  moving_general:    { g1: '#AB47BC', g2: '#4A148C', shadow: '#4A148C' },
  gardens_pools:     { g1: '#66BB6A', g2: '#1B5E20', shadow: '#1B5E20' },
  energy_generators: { g1: '#FFCA28', g2: '#E65100', shadow: '#E65100' },
  business_services: { g1: '#26A69A', g2: '#004D40', shadow: '#004D40' },
  more_services:     { g1: '#78909C', g2: '#263238', shadow: '#263238' },
}

export default function SectionCard({ section }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const name = ar ? section.nameAr : section.nameEn
  const iconSrc = `/icons/sections/${section.id}.png`

  return (
    <Link href={`/section/${section.id}`}>
      <div className="flex flex-col items-center gap-2 active:scale-[0.88] transition-transform duration-100 cursor-pointer select-none">
        <img
          src={iconSrc}
          alt={name}
          style={{
            width: 92,
            height: 92,
            borderRadius: 22,
            objectFit: 'cover',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)',
          }}
        />
        <p className="font-bold text-[#071B33] text-[13.5px] leading-snug text-center w-[92px] line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}
