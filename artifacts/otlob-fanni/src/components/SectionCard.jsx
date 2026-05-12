import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { categories } from '../data/services'

const SECTION_COLORS = {
  home_services:  ['#FF7900', '#CC5500'],
  car_services:   ['#071B33', '#0a2849'],
  construction:   ['#92400E', '#6B2D07'],
  tech_security:  ['#1E50A2', '#0F2F70'],
  moving_general: ['#6D28D9', '#4C1D95'],
  gardens_pools:  ['#059669', '#03704F'],
  more_services:  ['#475569', '#2D3E52'],
}

const SECTION_ICON_MAP = {
  home_services:  '/icons/services/electricity.svg',
  car_services:   '/icons/services/maintenance.svg',
  construction:   '/icons/services/contracting.svg',
  tech_security:  '/icons/services/cctv.svg',
  moving_general: '/icons/services/moving.svg',
  gardens_pools:  '/icons/services/cleaning.svg',
  more_services:  '/icons/services/more.svg',
}

export default function SectionCard({ section }) {
  const { lang, dir } = useLang()
  const ar = lang === 'ar'
  const name = ar ? section.nameAr : section.nameEn
  const count = categories.filter(c => c.sectionId === section.id && c.id !== 'more').length
  const [c1, c2] = SECTION_COLORS[section.id] || SECTION_COLORS.more_services
  const iconSrc = SECTION_ICON_MAP[section.id] || '/icons/services/maintenance.svg'

  return (
    <Link href={`/section/${section.id}`}>
      <div className="flex items-center gap-3.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.97] transition-transform cursor-pointer select-none">
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
        >
          <img
            src={iconSrc}
            alt=""
            className="w-7 h-7 object-contain"
            onError={e => { e.currentTarget.src = '/icons/services/maintenance.svg' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#071B33] text-sm leading-tight">{name}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {count} {ar ? 'تخصص' : 'specialties'}
          </p>
        </div>
        {dir === 'rtl'
          ? <ArrowLeft className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
          : <ArrowRight className="w-4 h-4 text-[#FF7900] flex-shrink-0" />}
      </div>
    </Link>
  )
}
