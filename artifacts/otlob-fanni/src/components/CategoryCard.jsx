import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { track } from '../lib/tracker'

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
  // Business Services (maintenance variants)
  shop_maintenance:         '/icons/services/shop_maintenance.svg',
  restaurant_maintenance:   '/icons/services/restaurant_maintenance.svg',
  office_maintenance:       '/icons/services/office_maintenance.svg',
  signs:                    '/icons/services/signs.svg',
  // Gardens & Pools
  landscaping:              '/icons/services/landscaping.svg',
  garden:                   '/icons/services/garden.svg',
  pool:                     '/icons/services/pool.svg',
  pool_cleaning:            '/icons/services/pool_cleaning.svg',
  // Moving & General
  workers:                  '/icons/services/workers.svg',
  pest_control:             '/icons/services/pest_control.svg',
  tank_cleaning:            '/icons/services/tank_cleaning.svg',
  // Tech & Security
  computer:                 '/icons/services/computer.svg',
  mobile_repair:            '/icons/services/mobile_repair.svg',
  satellite:                '/icons/services/satellite.svg',
  alarm:                    '/icons/services/alarm.svg',
  // Car Services
  car_mechanic:             '/icons/services/car_mechanic.svg',
  tire_repair:              '/icons/services/tire_repair.svg',
  car_battery:              '/icons/services/car_battery.svg',
  car_wash:                 '/icons/services/car_wash.svg',
  oil_change:               '/icons/services/oil_change.svg',
  car_diagnostics:          '/icons/services/car_diagnostics.svg',
  heavy_truck_driver:       '/icons/services/heavy_truck_driver.svg',
}

// 4-color palette: orange (brand), navy, slate, earth
const O = ['#FF7900', '#c45500']   // orange — brand primary
const N = ['#0f2d52', '#071B33']   // deep navy
const S = ['#2d3748', '#1a202c']   // dark slate
const E = ['#7c3a0e', '#4a1f07']   // deep earth/brown
const T = ['#065f46', '#033d2c']   // deep teal (water/nature only)

const COLORS = {
  electricity:      O,
  plumbing:         N,
  ac:               N,
  painting:         O,
  carpentry:        E,
  cleaning:         T,
  moving:           S,
  cctv:             N,
  networks:         N,
  maintenance:      S,
  appliances:       N,
  welding:          O,
  aluminum:         S,
  waterproof:       N,
  thermal:          O,
  gas:              E,
  locks:            S,
  contracting:      N,
  tiles:            E,
  gypsum:           O,
  satellite:        N,
  pumps:            N,
  gardens:          T,
  more:             S,
  // Car services
  car_mechanic:     S,
  auto_electrician: O,
  car_body:         S,
  tire_repair:      S,
  car_battery:      N,
  car_ac:           N,
  towing:           E,
  car_wash:         T,
  car_diagnostics:  N,
  oil_change:       E,
  // Construction
  concrete:         S,
  roofing:          N,
  // Tech & Security
  alarm:            O,
  computer:         N,
  mobile_repair:    N,
  access_control:   S,
  // Moving & General
  workers:          S,
  loading:          S,
  tank_cleaning:    N,
  pest_control:     E,
  // Gardens & Pools
  landscaping:      T,
  garden:           T,
  pool:             T,
  pool_cleaning:    T,
  irrigation:       N,
}

function getColors(category) {
  return COLORS[category.id] || COLORS.maintenance
}

export default function CategoryCard({ category, count = 0 }) {
  const { lang } = useLang()
  const name   = lang === 'ar' ? category.nameAr : category.nameEn
  const href   = category.id === 'more' ? '/category/more_services' : `/category/${category.id}`
  const [c1, c2] = getColors(category)
  const iconSrc  = iconMap[category.iconName] || iconMap[category.id] || iconMap.maintenance

  return (
    <Link href={href} onClick={() => track('category_click', category.id)}>
      <div className="flex flex-col items-center gap-1.5 select-none cursor-pointer active:scale-90 transition-transform duration-150">
        <div className="relative">
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
          {count > 0 && (
            <span className="absolute -top-1.5 -left-1.5 min-w-[20px] h-[20px] bg-white border-2 border-gray-100 text-[#071B33] text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
              {count}
            </span>
          )}
        </div>
        <span className="text-[12px] font-bold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5 max-w-[76px]">
          {name}
        </span>
      </div>
    </Link>
  )
}
