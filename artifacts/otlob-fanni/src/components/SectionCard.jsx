import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { categories } from '../data/services'
import { Home, Car, HardHat, ShieldCheck, Truck, Leaf, Briefcase, MoreHorizontal } from 'lucide-react'

const SECTION_COLORS = {
  home_services:     ['#FF7900', '#d96300'],
  car_services:      ['#071B33', '#0f2d52'],
  construction:      ['#B45309', '#7c3700'],
  tech_security:     ['#1D4ED8', '#1238a8'],
  moving_general:    ['#6D28D9', '#4c1db0'],
  gardens_pools:     ['#047857', '#025c42'],
  business_services: ['#0369A1', '#024e7a'],
  more_services:     ['#374151', '#1f2937'],
}

const SECTION_IMAGE = {
  home_services: '/icons/sections/home_services.jpeg',
  tech_security: '/icons/sections/tech_security.jpeg',
}

const SECTION_ICON = {
  home_services:     Home,
  car_services:      Car,
  construction:      HardHat,
  tech_security:     ShieldCheck,
  moving_general:    Truck,
  gardens_pools:     Leaf,
  business_services: Briefcase,
  more_services:     MoreHorizontal,
}

export default function SectionCard({ section }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const name = ar ? section.nameAr : section.nameEn
  const count = categories.filter(c => c.sectionId === section.id && c.id !== 'more').length
  const [c1, c2] = SECTION_COLORS[section.id] || SECTION_COLORS.more_services
  const Icon = SECTION_ICON[section.id] || MoreHorizontal
  const customImage = SECTION_IMAGE[section.id]

  return (
    <Link href={`/section/${section.id}`}>
      <div
        className="bg-white rounded-[24px] px-3 py-5 flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.95] transition-transform cursor-pointer select-none"
        style={{ minHeight: 190 }}
      >
        {/* Icon container — 96px */}
        {customImage ? (
          <img
            src={customImage}
            alt=""
            draggable="false"
            style={{ width: 96, height: 96, borderRadius: 22, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div
            className="rounded-[22px] flex items-center justify-center shadow-md flex-shrink-0"
            style={{
              width: 96,
              height: 96,
              background: `linear-gradient(145deg, ${c1}, ${c2})`,
            }}
          >
            <Icon size={48} color="white" strokeWidth={1.6} />
          </div>
        )}

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
