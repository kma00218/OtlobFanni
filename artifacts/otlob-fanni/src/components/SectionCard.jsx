import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import {
  Home, Car, HardHat, Camera, Truck,
  TreePine, Zap, Store, LayoutGrid,
} from 'lucide-react'

const SECTION_ICON = {
  home_services:     Home,
  car_services:      Car,
  construction:      HardHat,
  tech_security:     Camera,
  moving_general:    Truck,
  gardens_pools:     TreePine,
  energy_generators: Zap,
  business_services: Store,
  more_services:     LayoutGrid,
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
  const Icon = SECTION_ICON[section.id] || LayoutGrid
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
          <Icon size={36} color="white" strokeWidth={1.7} />
        </div>
        <p className="font-semibold text-[#071B33] text-[11.5px] leading-snug text-center w-[80px] line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}
