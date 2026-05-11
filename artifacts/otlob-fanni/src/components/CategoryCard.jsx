import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'

const iconMap = {
  electricity:          '/icons/services/electricity.svg',
  plumbing:             '/icons/services/plumbing.svg',
  ac:                   '/icons/services/ac.svg',
  painting:             '/icons/services/painting.svg',
  carpentry:            '/icons/services/carpentry.svg',
  cleaning:             '/icons/services/cleaning.svg',
  moving:               '/icons/services/moving.svg',
  cctv:                 '/icons/services/cctv.svg',
  network:              '/icons/services/network.svg',
  maintenance:          '/icons/services/maintenance.svg',
  'general-maintenance':'/icons/services/maintenance.svg',
  appliances:           '/icons/services/appliances.svg',
  welding:              '/icons/services/welding.svg',
  aluminum_glass:       '/icons/services/aluminum-glass.svg',
  'aluminum-glass':     '/icons/services/aluminum-glass.svg',
  waterproofing:        '/icons/services/waterproofing.svg',
  thermal_insulation:   '/icons/services/thermal-insulation.svg',
  'thermal-insulation': '/icons/services/thermal-insulation.svg',
  gas:                  '/icons/services/gas.svg',
  locks_doors:          '/icons/services/locks-doors.svg',
  'locks-doors':        '/icons/services/locks-doors.svg',
  contracting:          '/icons/services/contracting.svg',
  tiles:                '/icons/services/tiles.svg',
  more:                 '/icons/services/more.svg',
}

const COLORS = {
  electricity:          ['#FF7900', '#CC5500'],
  plumbing:             ['#1E50A2', '#0F2F70'],
  ac:                   ['#0891B2', '#065B7A'],
  painting:             ['#FF7900', '#CC5500'],
  carpentry:            ['#92400E', '#6B2D07'],
  cleaning:             ['#059669', '#03704F'],
  moving:               ['#6D28D9', '#4C1D95'],
  cctv:                 ['#1E50A2', '#0F2F70'],
  networks:             ['#0891B2', '#065B7A'],
  maintenance:          ['#475569', '#2D3E52'],
  appliances:           ['#0891B2', '#065B7A'],
  welding:              ['#FF7900', '#CC5500'],
  aluminum:             ['#475569', '#2D3E52'],
  waterproof:           ['#1E50A2', '#0F2F70'],
  thermal:              ['#FF7900', '#CC5500'],
  gas:                  ['#92400E', '#6B2D07'],
  locks:                ['#475569', '#2D3E52'],
  contracting:          ['#071B33', '#0a2849'],
  tiles:                ['#6D28D9', '#4C1D95'],
  gypsum:               ['#FF7900', '#CC5500'],
  satellite:            ['#0891B2', '#065B7A'],
  pumps:                ['#1E50A2', '#0F2F70'],
  gardens:              ['#059669', '#03704F'],
  more:                 ['#071B33', '#0a2849'],
}

const ID_TO_COLOR_KEY = {
  electricity: 'electricity',
  plumbing:    'plumbing',
  ac:          'ac',
  painting:    'painting',
  carpentry:   'carpentry',
  cleaning:    'cleaning',
  moving:      'moving',
  cctv:        'cctv',
  networks:    'networks',
  maintenance: 'maintenance',
  appliances:  'appliances',
  welding:     'welding',
  aluminum:    'aluminum',
  waterproof:  'waterproof',
  thermal:     'thermal',
  gas:         'gas',
  locks:       'locks',
  contracting: 'contracting',
  tiles:       'tiles',
  gypsum:      'gypsum',
  satellite:   'satellite',
  pumps:       'pumps',
  gardens:     'gardens',
  more:        'more',
}

function getColors(category) {
  const key = ID_TO_COLOR_KEY[category.id] || 'maintenance'
  return COLORS[key] || COLORS.maintenance
}

export default function CategoryCard({ category }) {
  const { lang } = useLang()
  const name   = lang === 'ar' ? category.nameAr : category.nameEn
  const href   = category.id === 'more' ? '/categories' : `/category/${category.id}`
  const [c1, c2] = getColors(category)
  const iconSrc  = iconMap[category.iconName] || iconMap[category.id] || iconMap.maintenance

  return (
    <Link href={href}>
      <div className="flex flex-col items-center gap-1.5 select-none cursor-pointer active:scale-90 transition-transform duration-150">
        {/* iPhone-style icon */}
        <div
          className="w-[70px] h-[70px] rounded-[18px] flex items-center justify-center shadow-lg overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
        >
          <img
            src={iconSrc}
            alt=""
            className="w-12 h-12 object-contain"
            loading="lazy"
            draggable="false"
            onError={(e) => { e.currentTarget.src = '/icons/services/maintenance.svg' }}
          />
        </div>
        {/* Label */}
        <span className="text-[12px] font-bold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5 max-w-[76px]">
          {name}
        </span>
      </div>
    </Link>
  )
}
