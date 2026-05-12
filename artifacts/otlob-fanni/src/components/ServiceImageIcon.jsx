const iconMap = {
  electricity: '/icons/services/electricity.svg',
  plumbing: '/icons/services/plumbing.svg',
  ac: '/icons/services/ac.svg',
  painting: '/icons/services/painting.svg',
  carpentry: '/icons/services/carpentry.svg',
  cleaning: '/icons/services/cleaning.svg',
  moving: '/icons/services/moving.svg',
  cctv: '/icons/services/cctv.svg',
  network: '/icons/services/network.svg',
  maintenance: '/icons/services/maintenance.svg',
  appliances: '/icons/services/appliances.svg',
  welding: '/icons/services/welding.svg',
  aluminum_glass: '/icons/services/aluminum-glass.svg',
  'aluminum-glass': '/icons/services/aluminum-glass.svg',
  waterproofing: '/icons/services/waterproofing.svg',
  thermal_insulation: '/icons/services/thermal-insulation.svg',
  'thermal-insulation': '/icons/services/thermal-insulation.svg',
  gas: '/icons/services/gas.svg',
  locks_doors: '/icons/services/locks-doors.svg',
  'locks-doors': '/icons/services/locks-doors.svg',
  contracting: '/icons/services/contracting.svg',
  ac_units: '/icons/services/ac-units.svg',
  'ac-units': '/icons/services/ac-units.svg',
  more: '/icons/services/more.svg',
  energy_generators: '/icons/services/electricity.svg',
  generator:         '/icons/services/maintenance.svg',
  generator_install: '/icons/services/maintenance.svg',
  solar:             '/icons/services/electricity.svg',
  battery_inverter:  '/icons/services/maintenance.svg',
  ups:               '/icons/services/maintenance.svg',
  backup_power:      '/icons/services/electricity.svg',
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
