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
  ac_units:             '/icons/services/ac-units.svg',
  'ac-units':           '/icons/services/ac-units.svg',
  more:                 '/icons/services/more.svg',
  energy_generators:    '/icons/services/electricity.svg',
  generator:            '/icons/services/generator.svg',
  generator_install:    '/icons/services/generator_install.svg',
  solar:                '/icons/services/solar.svg',
  battery_inverter:     '/icons/services/battery_inverter.svg',
  ups:                  '/icons/services/ups.svg',
  backup_power:         '/icons/services/backup_power.svg',
  coffee_machine:       '/icons/services/coffee_machine.svg',
  restaurant_equipment: '/icons/services/restaurant_equipment.svg',
  shawarma:             '/icons/services/shawarma.svg',
  grill:                '/icons/services/grill.svg',
  pastry:               '/icons/services/pastry.svg',
  restaurant_staff:     '/icons/services/restaurant_staff.svg',
  plastering:               '/icons/services/plastering.svg',
  shop_maintenance:         '/icons/services/shop_maintenance.svg',
  restaurant_maintenance:   '/icons/services/restaurant_maintenance.svg',
  office_maintenance:       '/icons/services/office_maintenance.svg',
  signs:                    '/icons/services/signs.svg',
  landscaping:              '/icons/services/landscaping.svg',
  garden:                   '/icons/services/garden.svg',
  pool:                     '/icons/services/pool.svg',
  pool_cleaning:            '/icons/services/pool_cleaning.svg',
  workers:                  '/icons/services/workers.svg',
  pest_control:             '/icons/services/pest_control.svg',
  tank_cleaning:            '/icons/services/tank_cleaning.svg',
  computer:                 '/icons/services/computer.svg',
  mobile_repair:            '/icons/services/mobile_repair.svg',
  satellite:                '/icons/services/satellite.svg',
  alarm:                    '/icons/services/alarm.svg',
  car_mechanic:             '/icons/services/car_mechanic.svg',
  tire_repair:              '/icons/services/tire_repair.svg',
  car_battery:              '/icons/services/car_battery.svg',
  car_wash:                 '/icons/services/car_wash.svg',
  oil_change:               '/icons/services/oil_change.svg',
  car_diagnostics:          '/icons/services/car_diagnostics.svg',
  heavy_truck_driver:       '/icons/services/heavy_truck_driver.svg',
  furniture_install:        '/icons/services/furniture_install.png',
}

export default function ServiceImageIcon({ iconName, className = '' }) {
  const src = iconMap[iconName] || iconMap.maintenance

  return (
    <img
      src={src}
      alt=""
      className={`h-[70px] w-[70px] object-contain ${className}`}
      loading="lazy"
      draggable="false"
      onError={(e) => {
        e.currentTarget.src = '/icons/services/maintenance.svg'
      }}
    />
  )
}
