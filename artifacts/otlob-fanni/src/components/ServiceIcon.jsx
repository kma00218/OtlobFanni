import {
  Zap,
  Droplets,
  Snowflake,
  PaintRoller,
  Hammer,
  Sparkles,
  Truck,
  Cctv,
  Wifi,
  Wrench,
  WashingMachine,
  Anvil,
  AppWindow,
  ShieldCheck,
  ThermometerSun,
  Flame,
  LockKeyhole,
  HardHat,
  AirVent,
  Grid2X2,
} from 'lucide-react'

const ICON_MAP = {
  electricity: Zap,           // برق وكهرباء
  plumbing:    Droplets,      // قطرات ماء = سباكة
  ac:          Snowflake,     // ثلج = تكييف
  painting:    PaintRoller,   // بكرة دهان
  carpentry:   Hammer,        // مطرقة = نجارة
  cleaning:    Sparkles,      // لمعة = تنظيف
  moving:      Truck,         // شاحنة = نقل أثاث
  cctv:        Cctv,          // كاميرا مراقبة
  networks:    Wifi,          // واي فاي = شبكات
  maintenance: Wrench,        // مفتاح ربط = صيانة عامة
  appliances:  WashingMachine,// غسالة = أجهزة منزلية
  welding:     Anvil,         // سندان = حدادة
  aluminum:    AppWindow,     // نافذة = ألمنيوم وزجاج
  waterproof:  ShieldCheck,   // درع = عزل مائي
  thermal:     ThermometerSun,// شمس + ترمومتر = عزل حراري
  gas:         Flame,         // لهب = تأسيس غاز
  locks:       LockKeyhole,   // قفل = أقفال وأبواب
  contracting: HardHat,       // خوذة = مقاولات
  acunits:     AirVent,       // فتحة هواء = مكيفات
  more:        Grid2X2,       // شبكة = المزيد
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
