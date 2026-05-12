import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'

const SECTION_SVG = {
  home_services: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/>
      <path d="M9 21V12h6v9"/>
      <path d="M20 14a2.5 2.5 0 00-3.5 3.5L14 20l1 1 2.5-2.5A2.5 2.5 0 0020 14z" strokeWidth="1.4"/>
    </svg>
  ),
  car_services: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a1 1 0 01-1-1v-4l2.5-5.5h13L20 12v4a1 1 0 01-1 1h-2"/>
      <circle cx="7.5" cy="17" r="2.5"/>
      <circle cx="16.5" cy="17" r="2.5"/>
      <path d="M10 17h4"/>
      <path d="M7 11h10"/>
      <path d="M15.5 6.5l1 4.5M8.5 6.5l-1 4.5"/>
      <path d="M17 5a2 2 0 100 2 2 2 0 000-2z" strokeWidth="1.3" fill="rgba(255,255,255,0.25)"/>
      <line x1="17" y1="7" x2="19" y2="9" strokeWidth="1.5"/>
    </svg>
  ),
  construction: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17.5a10 5.5 0 0120 0"/>
      <path d="M12 5v7"/>
      <path d="M8.5 12a3.5 3.5 0 017 0"/>
      <rect x="1.5" y="17.5" width="21" height="3" rx="1.5"/>
      <circle cx="12" cy="4" r="1.5" fill="white" strokeWidth="0"/>
    </svg>
  ),
  tech_security: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-7-4-7-10V5l7-3 7 3v7c0 6-7 10-7 10z"/>
      <rect x="8.5" y="9" width="7" height="5.5" rx="1" strokeWidth="1.4"/>
      <circle cx="12" cy="11.75" r="1.5" strokeWidth="1.3"/>
      <path d="M15.5 9l1.5-2" strokeWidth="1.3"/>
    </svg>
  ),
  moving_general: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="11" rx="1"/>
      <path d="M15 9h3.5L22 13.5V17h-7V9z"/>
      <circle cx="5.5" cy="18.5" r="1.5"/>
      <circle cx="18.5" cy="18.5" r="1.5"/>
      <line x1="1" y1="11" x2="15" y2="11" strokeWidth="1.2"/>
      <line x1="4" y1="6" x2="4" y2="11" strokeWidth="1.2"/>
      <line x1="8" y1="6" x2="8" y2="11" strokeWidth="1.2"/>
    </svg>
  ),
  gardens_pools: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C17 8 12 2 4 4c0 8 6 13 13 11"/>
      <path d="M11 13L7 9"/>
      <path d="M3 18.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" strokeWidth="1.5"/>
      <path d="M3 21.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" strokeWidth="1.5"/>
    </svg>
  ),
  business_services: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V9l9-6 9 6v12H3z"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <rect x="9.5" y="13" width="5" height="8"/>
      <line x1="12" y1="13" x2="12" y2="21" strokeWidth="1.2"/>
      <rect x="5" y="12" width="2.5" height="4" rx="0.5" strokeWidth="1.2"/>
      <rect x="16.5" y="12" width="2.5" height="4" rx="0.5" strokeWidth="1.2"/>
    </svg>
  ),
  energy_generators: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  more_services: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1"/>
      <rect x="10" y="3" width="5" height="5" rx="1"/>
      <rect x="17" y="3" width="5" height="5" rx="1"/>
      <rect x="3" y="10" width="5" height="5" rx="1"/>
      <rect x="10" y="10" width="5" height="5" rx="1"/>
      <rect x="17" y="10" width="5" height="5" rx="1"/>
      <rect x="3" y="17" width="5" height="5" rx="1"/>
      <rect x="10" y="17" width="5" height="5" rx="1"/>
      <rect x="17" y="17" width="5" height="5" rx="1"/>
    </svg>
  ),
}

const SECTION_GRADIENT = {
  home_services:     ['#FF7900', '#e85e00'],
  car_services:      ['#1E40AF', '#0f2472'],
  construction:      ['#D97706', '#b35500'],
  tech_security:     ['#6366F1', '#4338CA'],
  moving_general:    ['#8B5CF6', '#6D28D9'],
  gardens_pools:     ['#10B981', '#047857'],
  energy_generators: ['#F59E0B', '#D97706'],
  business_services: ['#0EA5E9', '#0369A1'],
  more_services:     ['#6B7280', '#374151'],
}

export default function SectionCard({ section }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const name = ar ? section.nameAr : section.nameEn
  const svg = SECTION_SVG[section.id] || SECTION_SVG.more_services
  const [c1, c2] = SECTION_GRADIENT[section.id] || SECTION_GRADIENT.more_services

  return (
    <Link href={`/section/${section.id}`}>
      <div className="flex flex-col items-center gap-2 active:scale-[0.88] transition-transform duration-100 cursor-pointer select-none">
        <div
          className="flex items-center justify-center shadow-lg"
          style={{
            width: 76,
            height: 76,
            borderRadius: 20,
            background: `linear-gradient(150deg, ${c1} 0%, ${c2} 100%)`,
          }}
        >
          {svg}
        </div>
        <p className="font-semibold text-[#071B33] text-[11.5px] leading-snug text-center w-[80px] line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}
