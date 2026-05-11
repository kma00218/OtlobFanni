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
  electricity:          ['#FF9500', '#cc7700'],
  plumbing:             ['#007AFF', '#0051b3'],
  ac:                   ['#30B0C7', '#1a7a8a'],
  painting:             ['#FF2D55', '#c4002e'],
  carpentry:            ['#FF7900', '#d96400'],
  cleaning:             ['#34C759', '#248a3d'],
  moving:               ['#5856D6', '#3634A3'],
  cctv:                 ['#FF3B30', '#b52119'],
  networks:             ['#32ADE6', '#1a7ab3'],
  maintenance:          ['#8E8E93', '#48484a'],
  appliances:           ['#00C7BE', '#007f79'],
  welding:              ['#1D3461', '#0f1e3d'],
  aluminum:             ['#5AC8FA', '#2a9fd6'],
  waterproof:           ['#1D3461', '#0f1e3d'],
  thermal:              ['#FF6B35', '#d94b1a'],
  gas:                  ['#FFCC00', '#b38f00'],
  locks:                ['#FF3B30', '#b52119'],
  contracting:          ['#636366', '#3a3a3c'],
  tiles:                ['#AF52DE', '#7b2fa6'],
  gypsum:               ['#FF9F0A', '#c47500'],
  satellite:            ['#32ADE6', '#1a7ab3'],
  pumps:                ['#007AFF', '#0051b3'],
  gardens:              ['#34C759', '#248a3d'],
  more:                 ['#AF52DE', '#7b2fa6'],
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
        <span className="text-[11px] font-semibold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5 max-w-[76px]">
          {name}
        </span>
      </div>
    </Link>
  )
}
