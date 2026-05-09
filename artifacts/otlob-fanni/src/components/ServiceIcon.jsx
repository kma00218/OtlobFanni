import {
  Zap,
  Wrench,
  Snowflake,
  PaintRoller,
  Hammer,
  Sparkles,
  Truck,
  Cctv,
  Wifi,
  Settings,
  WashingMachine,
  Anvil,
  PanelsTopLeft,
  ShieldCheck,
  ThermometerSun,
  Flame,
  LockKeyhole,
  HardHat,
  AirVent,
  Grid2X2,
} from 'lucide-react'

const ICON_MAP = {
  electricity: Zap,
  plumbing:    Wrench,
  ac:          Snowflake,
  painting:    PaintRoller,
  carpentry:   Hammer,
  cleaning:    Sparkles,
  moving:      Truck,
  cctv:        Cctv,
  networks:    Wifi,
  maintenance: Settings,
  appliances:  WashingMachine,
  welding:     Anvil,
  aluminum:    PanelsTopLeft,
  waterproof:  ShieldCheck,
  thermal:     ThermometerSun,
  gas:         Flame,
  locks:       LockKeyhole,
  contracting: HardHat,
  acunits:     AirVent,
  more:        Grid2X2,
}

export default function ServiceIcon({ iconName, size = 34, strokeWidth = 1.8, className = '' }) {
  const Icon = ICON_MAP[iconName] || Wrench
  return (
    <Icon
      style={{ width: size, height: size }}
      strokeWidth={strokeWidth}
      className={className}
    />
  )
}
