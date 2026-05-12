import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { categories } from '../data/services'

const SECTION_COLORS = {
  home_services:     ['#FF7900', '#e86d00'],
  car_services:      ['#071B33', '#1a3a5c'],
  construction:      ['#B45309', '#92400E'],
  tech_security:     ['#1D4ED8', '#1E50A2'],
  moving_general:    ['#7C3AED', '#6D28D9'],
  gardens_pools:     ['#059669', '#047857'],
  business_services: ['#0891B2', '#065B7A'],
  more_services:     ['#475569', '#334155'],
}

const SECTION_ICON_MAP = {
  home_services:     '/icons/services/electricity.svg',
  car_services:      '/icons/services/maintenance.svg',
  construction:      '/icons/services/contracting.svg',
  tech_security:     '/icons/services/cctv.svg',
  moving_general:    '/icons/services/moving.svg',
  gardens_pools:     '/icons/services/cleaning.svg',
  business_services: '/icons/services/maintenance.svg',
  more_services:     '/icons/services/more.svg',
}

export default function SectionCard({ section }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const name = ar ? section.nameAr : section.nameEn
  const count = categories.filter(c => c.sectionId === section.id && c.id !== 'more').length
  const [c1, c2] = SECTION_COLORS[section.id] || SECTION_COLORS.more_services
  const iconSrc = SECTION_ICON_MAP[section.id] || '/icons/services/maintenance.svg'

  return (
    <Link href={`/section/${section.id}`}>
      <div
        className="bg-white rounded-[24px] px-3 py-5 flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.95] transition-transform cursor-pointer select-none"
        style={{ minHeight: 190 }}
      >
        {/* Icon container — 96px */}
        <div
          className="rounded-[24px] flex items-center justify-center shadow-md flex-shrink-0"
          style={{
            width: 96, height: 96,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
          }}
        >
          <img
            src={iconSrc}
            alt=""
            style={{ width: 56, height: 56 }}
            className="object-contain"
            draggable="false"
            onError={e => { e.currentTarget.src = '/icons/services/maintenance.svg' }}
          />
        </div>

        {/* Labels */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center">
          <p className="font-bold text-[#071B33] text-[13px] leading-snug">{name}</p>
          <p className="text-gray-400 text-[11px]">
            {count} {ar ? 'تخصص' : 'spec.'}
          </p>
        </div>

        {/* View badge */}
        <span
          className="text-[11px] font-semibold px-4 py-1 rounded-full"
          style={{ background: '#FFF3E8', color: '#FF7900' }}
        >
          {ar ? 'عرض' : 'View'}
        </span>
      </div>
    </Link>
  )
}
