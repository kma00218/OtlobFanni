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
  const colors = SECTION_GRADIENT[section.id] || SECTION_GRADIENT.more_services
  const iconSrc = `/icons/sections/${section.id}.png`

  return (
    <Link href={`/section/${section.id}`}>
      <div className="flex flex-col items-center gap-2 active:scale-[0.88] transition-transform duration-100 cursor-pointer select-none">
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 22,
            background: `linear-gradient(145deg, ${colors.g1} 0%, ${colors.g2} 100%)`,
            boxShadow: `0 6px 20px ${colors.shadow}55, 0 2px 6px ${colors.shadow}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '22px 22px 0 0',
            pointerEvents: 'none',
          }} />
          <img
            src={iconSrc}
            alt={name}
            style={{
              width: 64,
              height: 64,
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              borderRadius: 10,
            }}
          />
        </div>
        <p className="font-bold text-[#071B33] text-[13.5px] leading-snug text-center w-[92px] line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}
