import generalMaintenanceIcon from '@assets/FEDF1B47-A50F-4565-B698-F2AC4C47E388_1778371983257.png'

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
  maintenance:          generalMaintenanceIcon,
  'general-maintenance':'/icons/services/general-maintenance.png',
  appliances:           '/icons/services/appliances.svg',
  welding:              '/icons/services/welding.svg',
  aluminum:             '/icons/services/aluminum-glass.svg',
  aluminum_glass:       '/icons/services/aluminum-glass.svg',
  'aluminum-glass':     '/icons/services/aluminum-glass.svg',
  waterproof:           '/icons/services/waterproofing.svg',
  waterproofing:        '/icons/services/waterproofing.svg',
  thermal:              '/icons/services/thermal-insulation.svg',
  thermal_insulation:   '/icons/services/thermal-insulation.svg',
  'thermal-insulation': '/icons/services/thermal-insulation.svg',
  gas:                  '/icons/services/gas.svg',
  locks:                '/icons/services/locks-doors.svg',
  locks_doors:          '/icons/services/locks-doors.svg',
  'locks-doors':        '/icons/services/locks-doors.svg',
  contracting:          '/icons/services/contracting.svg',
  acunits:              '/icons/services/ac-units.svg',
  ac_units:             '/icons/services/ac-units.svg',
  'ac-units':           '/icons/services/ac-units.svg',
  more:                 '/icons/services/more.svg',
}

export default function ServiceImageIcon({ iconName }) {
  const src = iconMap[iconName] || iconMap.more

  return (
    <img
      src={src}
      alt=""
      className="service-icon-img h-[68px] w-[68px] object-contain"
      loading="lazy"
      draggable="false"
    />
  )
}
