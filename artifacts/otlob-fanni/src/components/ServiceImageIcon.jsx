const iconMap = {
  electricity:        '/icons/services/electricity.svg',
  plumbing:           '/icons/services/plumbing.svg',
  ac:                 '/icons/services/ac.svg',
  painting:           '/icons/services/painting.svg',
  carpentry:          '/icons/services/carpentry.svg',
  cleaning:           '/icons/services/cleaning.svg',
  moving:             '/icons/services/moving.svg',
  cctv:               '/icons/services/cctv.svg',
  network:            '/icons/services/network.svg',
  networks:           '/icons/services/network.svg',
  maintenance:        '/icons/services/maintenance.svg',
  appliances:         '/icons/services/appliances.svg',
  welding:            '/icons/services/welding.svg',
  aluminum:           '/icons/services/aluminum-glass.svg',
  aluminum_glass:     '/icons/services/aluminum-glass.svg',
  'aluminum-glass':   '/icons/services/aluminum-glass.svg',
  waterproof:         '/icons/services/waterproofing.svg',
  waterproofing:      '/icons/services/waterproofing.svg',
  thermal:            '/icons/services/thermal-insulation.svg',
  thermal_insulation: '/icons/services/thermal-insulation.svg',
  'thermal-insulation':'/icons/services/thermal-insulation.svg',
  gas:                '/icons/services/gas.svg',
  locks:              '/icons/services/locks-doors.svg',
  locks_doors:        '/icons/services/locks-doors.svg',
  'locks-doors':      '/icons/services/locks-doors.svg',
  contracting:        '/icons/services/contracting.svg',
  acunits:            '/icons/services/ac-units.svg',
  ac_units:           '/icons/services/ac-units.svg',
  'ac-units':         '/icons/services/ac-units.svg',
  more:               '/icons/services/more.svg',
}

export default function ServiceImageIcon({ iconName, className = '' }) {
  const src = iconMap[iconName] || iconMap.more

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${className}`}
      style={{ backgroundColor: 'rgba(7,27,51,0.07)' }}>
      <img
        src={src}
        alt=""
        className="h-7 w-7 object-contain"
        loading="lazy"
        draggable="false"
      />
    </div>
  )
}
