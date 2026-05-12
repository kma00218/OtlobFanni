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
  HardHat,
  Layers,
  SprayCan,
  LockKeyhole,
  Cctv,
  Router,
  Truck,
  CircleEllipsis,
  Coffee,
  UtensilsCrossed,
  ChefHat,
  Cookie,
  Users,
  Cpu,
  Sun,
  BatteryCharging,
  Server,
  Cable,
  Grid3x3,
  Hammer,
  Bug,
  Leaf,
  Waves,
  Sprout,
  CircleDot,
  Battery,
  Monitor,
  Smartphone,
  DoorOpen,
  Bell,
  SatelliteDish,
  Package,
  UserRound,
  Settings,
} from 'lucide-react'

const ICON_MAP = {
  // ── خدمات منزلية ───────────────────────────────────
  electricity:          Zap,
  plumbing:             Droplets,
  ac:                   Snowflake,
  painting:             PaintRoller,
  carpentry:            Drill,
  appliances:           WashingMachine,
  locks:                LockKeyhole,
  locks_doors:          LockKeyhole,
  gas:                  Flame,
  cleaning:             SprayCan,
  waterproof:           ShieldCheck,
  waterproofing:        ShieldCheck,
  thermal:              ThermometerSun,
  thermal_insulation:   ThermometerSun,
  acunits:              Fan,
  maintenance:          Wrench,

  // ── خدمات سيارات ───────────────────────────────────
  car_mechanic:         Wrench,
  auto_electrician:     Zap,
  car_body:             Hammer,
  tire_repair:          CircleDot,
  car_battery:          Battery,
  car_ac:               Snowflake,
  towing:               Truck,
  car_wash:             SprayCan,
  car_diagnostics:      Monitor,
  oil_change:           Droplets,

  // ── بناء وتشطيب ─────────────────────────────────────
  contracting:          HardHat,
  aluminum:             Layers,
  aluminum_glass:       Layers,
  tiles:                Grid3x3,
  gypsum:               PaintRoller,
  welding:              Anvil,
  plastering:           Hammer,
  concrete:             HardHat,
  roofing:              HardHat,

  // ── تقنية وأمن ──────────────────────────────────────
  cctv:                 Cctv,
  networks:             Router,
  network:              Router,
  satellite:            SatelliteDish,
  alarm:                Bell,
  computer:             Monitor,
  mobile_repair:        Smartphone,
  access_control:       DoorOpen,

  // ── نقل وخدمات عامة ─────────────────────────────────
  moving:               Truck,
  workers:              UserRound,
  loading:              Package,
  tank_cleaning:        Droplets,
  pest_control:         Bug,

  // ── حدائق ومسابح ────────────────────────────────────
  landscaping:          Sprout,
  garden:               Leaf,
  pool:                 Waves,
  pool_cleaning:        Waves,
  irrigation:           Droplets,

  // ── الطاقة والمولدات ─────────────────────────────────
  generator:            Cpu,
  generator_install:    Settings,
  solar:                Sun,
  battery_inverter:     BatteryCharging,
  ups:                  Server,
  backup_power:         Cable,
  energy_generators:    Zap,

  // ── الخدمات التجارية ─────────────────────────────────
  shop_maintenance:         Wrench,
  office_cleaning:          SprayCan,
  shop_cctv:                Cctv,
  restaurant_maintenance:   Wrench,
  office_maintenance:       Wrench,
  signs:                    CircleEllipsis,
  coffee_machine:           Coffee,
  restaurant_equipment:     UtensilsCrossed,
  shawarma:                 ChefHat,
  grill:                    Flame,
  pastry:                   Cookie,
  restaurant_staff:         Users,

  // ── عام ──────────────────────────────────────────────
  more:                 CircleEllipsis,
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
