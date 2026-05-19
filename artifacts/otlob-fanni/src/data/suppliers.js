export const SUPPLY_TYPES = [
  { id: 'workshop_tools',     nameAr: 'معدات ورش',          nameEn: 'Workshop Tools',      emoji: '🔧' },
  { id: 'electrical_tools',   nameAr: 'أدوات كهرباء',        nameEn: 'Electrical Tools',    emoji: '⚡' },
  { id: 'plumbing_supplies',  nameAr: 'مواد سباكة',          nameEn: 'Plumbing Supplies',   emoji: '🚿' },
  { id: 'ac_equipment',       nameAr: 'معدات تكييف',         nameEn: 'AC Equipment',        emoji: '❄️' },
  { id: 'security_cameras',   nameAr: 'كاميرات وأنظمة أمن',  nameEn: 'Security Systems',    emoji: '📷' },
  { id: 'auto_parts',         nameAr: 'قطع غيار سيارات',     nameEn: 'Auto Parts',          emoji: '🚗' },
  { id: 'auto_tools',         nameAr: 'أدوات سيارات',        nameEn: 'Auto Tools',          emoji: '🔩' },
  { id: 'safety_equipment',   nameAr: 'معدات سلامة',         nameEn: 'Safety Equipment',    emoji: '🦺' },
  { id: 'building_materials', nameAr: 'مواد بناء وتشطيب',    nameEn: 'Building Materials',  emoji: '🏗️' },
  { id: 'other',              nameAr: 'أخرى',                nameEn: 'Other',               emoji: '📦' },
]

export const supplyTypeLabel = (id, nameAr) => {
  if (!id) return '—'
  const found = SUPPLY_TYPES.find(t => t.id === id)
  return found ? found.nameAr : (nameAr || id)
}
