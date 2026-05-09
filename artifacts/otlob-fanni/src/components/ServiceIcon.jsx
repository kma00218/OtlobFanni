import {
  Zap,
  Droplets,
  Snowflake,
  PaintRoller,
  Drill,
  WashingMachine,
  Anvil,
  ShieldCheck,
  ThermometerSun,
  Flame,
  Wrench,
  Fan,
  Construction,
  AppWindow,
  SprayCan,
  LockKeyhole,
  Cctv,
  Router,
  Truck,
  CircleEllipsis,
} from 'lucide-react'

const ICON_MAP = {
  electricity: Zap,
  plumbing:    Droplets,
  ac:          Snowflake,
  painting:    PaintRoller,
  carpentry:   Drill,
  appliances:  WashingMachine,
  welding:     Anvil,
  waterproof:  ShieldCheck,
  thermal:     ThermometerSun,
  gas:         Flame,
  maintenance: Wrench,
  acunits:     Fan,
  contracting: Construction,
  aluminum:    AppWindow,
  cleaning:    SprayCan,
  locks:       LockKeyhole,
  cctv:        Cctv,
  networks:    Router,
  moving:      Truck,
  more:        CircleEllipsis,
}

export default function ServiceIcon({ iconName, size = 32, strokeWidth = 1.8, className = '' }) {
  const Icon = ICON_MAP[iconName] || Wrench
  return (
    <Icon
      style={{ width: size, height: size }}
      strokeWidth={strokeWidth}
      className={className}
    />
  )
}
