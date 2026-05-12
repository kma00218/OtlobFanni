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
  networks:             '/icons/services/network.svg',
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
  // Energy & Generators
  energy_generators:    '/icons/services/electricity.svg',
  generator:            '/icons/services/generator.svg',
  generator_install:    '/icons/services/generator_install.svg',
  solar:                '/icons/services/solar.svg',
  battery_inverter:     '/icons/services/battery_inverter.svg',
  ups:                  '/icons/services/ups.svg',
  backup_power:         '/icons/services/backup_power.svg',
  // Business Services
  coffee_machine:       '/icons/services/coffee_machine.svg',
  restaurant_equipment: '/icons/services/restaurant_equipment.svg',
  shawarma:             '/icons/services/shawarma.svg',
  grill:                '/icons/services/grill.svg',
  pastry:               '/icons/services/pastry.svg',
  restaurant_staff:     '/icons/services/restaurant_staff.svg',
  // Construction
  plastering:           '/icons/services/plastering.svg',
}

const COLORS = {
  electricity:      ['#FF7900', '#CC5500'],
  plumbing:         ['#1E50A2', '#0F2F70'],
  ac:               ['#0891B2', '#065B7A'],
  painting:         ['#FF7900', '#CC5500'],
  carpentry:        ['#92400E', '#6B2D07'],
  cleaning:         ['#059669', '#03704F'],
  moving:           ['#6D28D9', '#4C1D95'],
  cctv:             ['#1E50A2', '#0F2F70'],
  networks:         ['#0891B2', '#065B7A'],
  maintenance:      ['#475569', '#2D3E52'],
  appliances:       ['#0891B2', '#065B7A'],
  welding:          ['#FF7900', '#CC5500'],
  aluminum:         ['#475569', '#2D3E52'],
  waterproof:       ['#1E50A2', '#0F2F70'],
  thermal:          ['#FF7900', '#CC5500'],
  gas:              ['#92400E', '#6B2D07'],
  locks:            ['#475569', '#2D3E52'],
  contracting:      ['#071B33', '#0a2849'],
  tiles:            ['#6D28D9', '#4C1D95'],
  gypsum:           ['#FF7900', '#CC5500'],
  satellite:        ['#0891B2', '#065B7A'],
  pumps:            ['#1E50A2', '#0F2F70'],
  gardens:          ['#059669', '#03704F'],
  more:             ['#071B33', '#0a2849'],
  // Car services
  car_mechanic:     ['#475569', '#2D3E52'],
  auto_electrician: ['#FF7900', '#CC5500'],
  car_body:         ['#6D28D9', '#4C1D95'],
  tire_repair:      ['#475569', '#2D3E52'],
  car_battery:      ['#071B33', '#0a2849'],
  car_ac:           ['#0891B2', '#065B7A'],
  towing:           ['#92400E', '#6B2D07'],
  car_wash:         ['#059669', '#03704F'],
  car_diagnostics:  ['#1E50A2', '#0F2F70'],
  oil_change:       ['#92400E', '#6B2D07'],
  // Construction
  concrete:         ['#475569', '#2D3E52'],
  roofing:          ['#071B33', '#0a2849'],
  // Tech & Security
  alarm:            ['#FF7900', '#CC5500'],
  computer:         ['#1E50A2', '#0F2F70'],
  mobile_repair:    ['#6D28D9', '#4C1D95'],
  access_control:   ['#071B33', '#0a2849'],
  // Moving & General
  workers:          ['#475569', '#2D3E52'],
  loading:          ['#6D28D9', '#4C1D95'],
  tank_cleaning:    ['#1E50A2', '#0F2F70'],
  pest_control:     ['#92400E', '#6B2D07'],
  // Gardens & Pools
  landscaping:      ['#059669', '#03704F'],
  garden:           ['#059669', '#03704F'],
  pool:             ['#0891B2', '#065B7A'],
  pool_cleaning:    ['#059669', '#03704F'],
  irrigation:       ['#1E50A2', '#0F2F70'],
}

function getColors(category) {
  return COLORS[category.id] || COLORS.maintenance
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
        <span className="text-[12px] font-bold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5 max-w-[76px]">
          {name}
        </span>
      </div>
    </Link>
  )
}
