import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'

const SECTION_SVG = {

  /* ── 1. خدمات منزلية: بيت + مفتاح صيانة ────────────────────────────── */
  home_services: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* House body filled */}
      <path d="M3 11L12 3l9 8v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z"
        fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2"/>
      {/* Door */}
      <path d="M10 23V16h4v7" stroke="white" strokeWidth="1.9"/>
      {/* Wrench — circle head + diagonal handle */}
      <circle cx="19.5" cy="6.5" r="3" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.8"/>
      <line x1="17.4" y1="8.6" x2="14.5" y2="11.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      <line x1="13.5" y1="12.5" x2="15" y2="14" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),

  /* ── 2. خدمات سيارات: سيارة + مفتاح صيانة ──────────────────────────── */
  car_services: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Car body */}
      <path d="M2 14.5v2a1 1 0 001 1h1M20 17.5h1a1 1 0 001-1v-2"
        stroke="white" strokeWidth="2"/>
      <path d="M3 14.5l2.5-5.5h13l2.5 5.5H3z"
        fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.9"/>
      {/* Windows */}
      <path d="M6 14.5l1.5-3.5h9l1.5 3.5" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.22)"/>
      {/* Wheels */}
      <circle cx="7" cy="17.5" r="2.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
      <circle cx="17" cy="17.5" r="2.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
      {/* Wrench — small top-right */}
      <circle cx="20.5" cy="4.5" r="2.5" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.6"/>
      <line x1="18.7" y1="6.3" x2="16.5" y2="8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),

  /* ── 3. بناء وتشطيب: خوذة بناء + طوب ───────────────────────────────── */
  construction: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Hard hat dome */}
      <path d="M3 14a9 7 0 0118 0" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2.2"/>
      {/* Hat brim */}
      <rect x="1.5" y="14" width="21" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="2"/>
      {/* Vent line on top */}
      <path d="M12 5v4" stroke="white" strokeWidth="2.2"/>
      <path d="M9 8.5a3 3 0 016 0" stroke="white" strokeWidth="1.8"/>
      {/* Brick row below hat */}
      <rect x="3" y="19" width="5" height="3" rx="0.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
      <rect x="9.5" y="19" width="5" height="3" rx="0.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
      <rect x="16" y="19" width="5" height="3" rx="0.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
    </svg>
  ),

  /* ── 4. تقنية وأمن: درع + قفل ────────────────────────────────────── */
  tech_security: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Shield */}
      <path d="M12 2L4 5.5V11c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V5.5L12 2z"
        fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="1.8"/>
      {/* Lock body */}
      <rect x="8.5" y="12" width="7" height="5.5" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.7"/>
      {/* Lock shackle */}
      <path d="M9.5 12V9.5a2.5 2.5 0 015 0V12" stroke="white" strokeWidth="1.8" fill="none"/>
      {/* Keyhole */}
      <circle cx="12" cy="14.2" r="1" fill="white"/>
      <path d="M12 15.2v1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),

  /* ── 5. نقل وخدمات عامة: شاحنة + صندوق ─────────────────────────────── */
  moving_general: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Truck cargo */}
      <rect x="1" y="6" width="14" height="12" rx="1" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2"/>
      {/* Cab */}
      <path d="M15 9.5h4l3 4.5V18h-7V9.5z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
      {/* Wheels */}
      <circle cx="5" cy="19.5" r="2" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.9"/>
      <circle cx="19" cy="19.5" r="2" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.9"/>
      {/* Box on cargo */}
      <rect x="3.5" y="8.5" width="5" height="5" rx="0.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
      <line x1="3.5" y1="11" x2="8.5" y2="11" stroke="white" strokeWidth="1.2"/>
      <line x1="6" y1="8.5" x2="6" y2="13.5" stroke="white" strokeWidth="1.2"/>
      {/* Cabin window */}
      <path d="M16 10.5h2.5l1.5 2.5H16v-2.5z" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.2"/>
    </svg>
  ),

  /* ── 6. حدائق ومسابح: ورقة نبات + موجات ماء ─────────────────────────── */
  gardens_pools: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Leaf filled */}
      <path d="M18 3C18 3 12 2 5 6c0 9 7 13 13 11 0 0 1-8-3-12C13 3 18 3 18 3z"
        fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="2"/>
      {/* Leaf vein */}
      <path d="M5 6l6 7" stroke="white" strokeWidth="1.8"/>
      <path d="M11 13l-1 3" stroke="white" strokeWidth="1.6"/>
      {/* Water waves */}
      <path d="M2 18.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"
        stroke="white" strokeWidth="2" fill="none"/>
      <path d="M2 21.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"
        stroke="white" strokeWidth="1.6" fill="none"/>
    </svg>
  ),

  /* ── 7. الخدمات التجارية: محل + ترس ─────────────────────────────────── */
  business_services: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Building facade */}
      <path d="M2 21V9l10-7 10 7v12H2z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2"/>
      {/* Shop awning */}
      <path d="M2 9h20" stroke="white" strokeWidth="1.8"/>
      {/* Door */}
      <rect x="9.5" y="14" width="5" height="7" rx="0.5" fill="rgba(255,255,255,0.28)" stroke="white" strokeWidth="1.7"/>
      {/* Windows */}
      <rect x="4" y="11.5" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.4"/>
      <rect x="16" y="11.5" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.4"/>
      {/* Gear badge bottom-right */}
      <circle cx="19.5" cy="19.5" r="2.5" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.5"/>
      <circle cx="19.5" cy="19.5" r="1" fill="white"/>
    </svg>
  ),

  /* ── 8. الطاقة والمولدات: بطارية + برق ──────────────────────────────── */
  energy_generators: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Battery body */}
      <rect x="2" y="7" width="18" height="10" rx="2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2.2"/>
      {/* Battery positive terminal */}
      <path d="M20 10.5v3" stroke="white" strokeWidth="2.2" strokeLinecap="butt"/>
      <rect x="20" y="10" width="2.5" height="4" rx="1" fill="white"/>
      {/* Lightning bolt inside battery */}
      <path d="M13 8.5L9 13h4.5L8 22l9-10.5h-4.5L13 8.5z"
        fill="white" stroke="none"/>
    </svg>
  ),

  /* ── 9. المزيد من الخدمات: شبكة مربعات متنوعة ───────────────────────── */
  more_services: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Row 1 */}
      <rect x="2" y="2" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.6"/>
      <rect x="9" y="2" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.6"/>
      <rect x="16" y="2" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.6"/>
      {/* Row 2 */}
      <rect x="2" y="9" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.6"/>
      <rect x="9" y="9" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.6"/>
      <rect x="16" y="9" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.6"/>
      {/* Row 3 */}
      <rect x="2" y="16" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.6"/>
      <rect x="9" y="16" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.6"/>
      <rect x="16" y="16" width="6" height="6" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.6"/>
      {/* Small tools inside some squares */}
      <line x1="5" y1="4" x2="5" y2="6.5" stroke="white" strokeWidth="1.4"/>
      <line x1="3.5" y1="4" x2="6.5" y2="4" stroke="white" strokeWidth="1.4"/>
      <circle cx="19" cy="5" r="1.2" fill="white"/>
      <circle cx="12" cy="12" r="1.5" stroke="white" strokeWidth="1.4" fill="rgba(255,255,255,0.2)"/>
      <line x1="10.5" y1="12" x2="13.5" y2="12" stroke="white" strokeWidth="1.3"/>
      <line x1="12" y1="10.5" x2="12" y2="13.5" stroke="white" strokeWidth="1.3"/>
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
        <p className="font-bold text-[#071B33] text-[13.5px] leading-snug text-center w-[80px] line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}
