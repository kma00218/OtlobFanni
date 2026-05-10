const iconMap = {
  electricity: "/icons/services/electricity.png",
  plumbing: "/icons/services/plumbing.png",
  ac: "/icons/services/ac.png",
  painting: "/icons/services/painting.png",
  carpentry: "/icons/services/carpentry.png",
  cleaning: "/icons/services/cleaning.png",
  moving: "/icons/services/moving.png",
  cctv: "/icons/services/cctv.png",
  network: "/icons/services/network.png",
  maintenance: "/icons/services/maintenance.png",
  appliances: "/icons/services/appliances.png",
  welding: "/icons/services/welding.png",
  aluminum_glass: "/icons/services/aluminum-glass.png",
  "aluminum-glass": "/icons/services/aluminum-glass.png",
  waterproofing: "/icons/services/waterproofing.png",
  thermal_insulation: "/icons/services/thermal-insulation.png",
  "thermal-insulation": "/icons/services/thermal-insulation.png",
  gas: "/icons/services/gas.png",
  locks_doors: "/icons/services/locks-doors.png",
  "locks-doors": "/icons/services/locks-doors.png",
  contracting: "/icons/services/contracting.png",
  ac_units: "/icons/services/ac-units.png",
  "ac-units": "/icons/services/ac-units.png",
  more: "/icons/services/more.png",
}

export default function ServiceImageIcon({ iconName, className = "" }) {
  const src = iconMap[iconName] || iconMap.maintenance

  return (
    <img
      src={src}
      alt=""
      className={`h-[70px] w-[70px] object-contain ${className}`}
      loading="lazy"
      draggable="false"
      onError={(e) => {
        e.currentTarget.src = "/icons/services/maintenance.png";
      }}
    />
  )
}
