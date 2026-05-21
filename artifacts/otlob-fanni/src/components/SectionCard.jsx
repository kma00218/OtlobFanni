import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'

const SECTION_SVG = {

  home_services: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11L12 3l9 8v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z"
        fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="2.2"/>
      <path d="M10 23V16h4v7" stroke="white" strokeWidth="2"/>
      <circle cx="19.5" cy="6" r="2.8" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="2"/>
      <line x1="17.5" y1="8" x2="15" y2="10.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
    </svg>
  ),

  car_services: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14.5l2.5-5.5h13l2.5 5.5H3z"
        fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="2"/>
      <path d="M2 14.5v2a1 1 0 001 1h1M20 17.5h1a1 1 0 001-1v-2" stroke="white" strokeWidth="2"/>
      <circle cx="7" cy="17.5" r="2.5" fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth="2.2"/>
      <circle cx="17" cy="17.5" r="2.5" fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth="2.2"/>
      <circle cx="19.5" cy="4.5" r="2.5" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="2"/>
      <line x1="17.7" y1="6.3" x2="16" y2="8" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  ),

  construction: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="13" width="9" height="3.5" rx="0.8" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.7"/>
      <rect x="12.5" y="13" width="9.5" height="3.5" rx="0.8" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.7"/>
      <rect x="2" y="17.5" width="6" height="3.5" rx="0.8" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.7"/>
      <rect x="9.5" y="17.5" width="7" height="3.5" rx="0.8" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.7"/>
      <rect x="18" y="17.5" width="4" height="3.5" rx="0.8" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.7"/>
      <line x1="17" y1="2.5" x2="12" y2="8" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M12 8 L6.5 10.5 L9 13 L12 8z" fill="white" stroke="white" strokeWidth="0.8" strokeLinejoin="round"/>
    </svg>
  ),

  tech_security: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5.5V11c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V5.5L12 2z"
        fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="2"/>
      <rect x="8.5" y="12" width="7" height="5.5" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.8"/>
      <path d="M9.5 12V9.5a2.5 2.5 0 015 0V12" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="14.2" r="1.1" fill="white"/>
      <path d="M12 15.3v1.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),

  moving_general: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="12" rx="1.2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2.2"/>
      <path d="M15 9.5h4l3 4.5V18h-7V9.5z" fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth="2.2"/>
      <circle cx="5" cy="19.5" r="2.2" fill="rgba(255,255,255,0.32)" stroke="white" strokeWidth="2"/>
      <circle cx="19" cy="19.5" r="2.2" fill="rgba(255,255,255,0.32)" stroke="white" strokeWidth="2"/>
      <path d="M16 10.5h2.5l1.5 2.5H16v-2.5z" fill="rgba(255,255,255,0.38)" stroke="white" strokeWidth="1.4"/>
    </svg>
  ),

  gardens_pools: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3C18 3 12 2 5 6c0 9 7 13 13 11 0 0 1-8-3-12C13 3 18 3 18 3z"
        fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2.2"/>
      <path d="M5 6l6 7" stroke="white" strokeWidth="2"/>
      <path d="M11 13l-1 3" stroke="white" strokeWidth="1.8"/>
      <path d="M2 18.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"
        stroke="white" strokeWidth="2.2" fill="none"/>
    </svg>
  ),

  energy_generators: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="18" height="10" rx="2" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2.4"/>
      <rect x="20" y="10" width="2.5" height="4" rx="1" fill="white"/>
      <path d="M13 8.5L9 13h4.5L8 22l9-10.5h-4.5L13 8.5z" fill="white"/>
    </svg>
  ),

  business_services: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 21V9l10-7 10 7v12H2z" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2.2"/>
      <path d="M2 9h20" stroke="white" strokeWidth="2"/>
      <rect x="9.5" y="14" width="5" height="7" rx="0.6" fill="rgba(255,255,255,0.32)" stroke="white" strokeWidth="1.8"/>
      <rect x="4" y="11.5" width="4" height="4" rx="0.6" fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth="1.6"/>
      <rect x="16" y="11.5" width="4" height="4" rx="0.6" fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth="1.6"/>
    </svg>
  ),

  more_services: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.8"/>
      <rect x="9" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.8"/>
      <rect x="16" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.8"/>
      <rect x="2" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.8"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.8"/>
      <rect x="16" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.8"/>
      <rect x="2" y="16" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.8"/>
      <rect x="9" y="16" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.8"/>
      <rect x="16" y="16" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1.8"/>
    </svg>
  ),
}

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
  const svg = SECTION_SVG[section.id] || SECTION_SVG.more_services
  const colors = SECTION_GRADIENT[section.id] || SECTION_GRADIENT.more_services

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
          {/* Top highlight shimmer */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '22px 22px 0 0',
            pointerEvents: 'none',
          }} />
          {svg}
        </div>
        <p className="font-bold text-[#071B33] text-[13.5px] leading-snug text-center w-[92px] line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}
