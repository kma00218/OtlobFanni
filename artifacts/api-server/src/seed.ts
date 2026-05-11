import { db } from "@workspace/db";
import { citiesTable, categoriesTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const CITIES = [
  { id: 'c1',  nameAr: 'طرابلس',        nameEn: 'Tripoli',        sortOrder: 1,  isActive: true },
  { id: 'c2',  nameAr: 'بنغازي',         nameEn: 'Benghazi',       sortOrder: 2,  isActive: true },
  { id: 'c3',  nameAr: 'مصراتة',         nameEn: 'Misrata',        sortOrder: 3,  isActive: true },
  { id: 'c4',  nameAr: 'الزاوية',        nameEn: 'Zawiya',         sortOrder: 4,  isActive: true },
  { id: 'c13', nameAr: 'أجدابيا',        nameEn: 'Ajdabiya',       sortOrder: 5,  isActive: true },
  { id: 'c5',  nameAr: 'سبها',           nameEn: 'Sabha',          sortOrder: 6,  isActive: true },
  { id: 'c6',  nameAr: 'زوارة',          nameEn: 'Zuwara',         sortOrder: 7,  isActive: true },
  { id: 'c7',  nameAr: 'زليتن',          nameEn: 'Zliten',         sortOrder: 8,  isActive: true },
  { id: 'c8',  nameAr: 'الخمس',          nameEn: 'Al Khoms',       sortOrder: 9,  isActive: true },
  { id: 'c14', nameAr: 'ترهونة',         nameEn: 'Tarhuna',        sortOrder: 10, isActive: true },
  { id: 'c32', nameAr: 'مسلاتة',         nameEn: 'Msallata',       sortOrder: 11, isActive: true },
  { id: 'c9',  nameAr: 'سرت',            nameEn: 'Sirte',          sortOrder: 12, isActive: true },
  { id: 'c10', nameAr: 'طبرق',           nameEn: 'Tobruk',         sortOrder: 13, isActive: true },
  { id: 'c11', nameAr: 'درنة',           nameEn: 'Derna',          sortOrder: 14, isActive: true },
  { id: 'c12', nameAr: 'غريان',          nameEn: 'Gharyan',        sortOrder: 15, isActive: true },
  { id: 'c33', nameAr: 'الزنتان',        nameEn: 'Zintan',         sortOrder: 16, isActive: true },
  { id: 'c15', nameAr: 'بني وليد',       nameEn: 'Bani Walid',     sortOrder: 17, isActive: true },
  { id: 'c16', nameAr: 'صبراتة',         nameEn: 'Sabratha',       sortOrder: 18, isActive: true },
  { id: 'c17', nameAr: 'البيضاء',        nameEn: 'Al Bayda',       sortOrder: 19, isActive: true },
  { id: 'c18', nameAr: 'المرج',          nameEn: 'Al Marj',        sortOrder: 20, isActive: true },
  { id: 'c19', nameAr: 'صرمان',          nameEn: 'Sorman',         sortOrder: 21, isActive: true },
  { id: 'c34', nameAr: 'مزدة',           nameEn: 'Mizda',          sortOrder: 22, isActive: true },
  { id: 'c20', nameAr: 'يفرن',           nameEn: 'Yefren',         sortOrder: 23, isActive: true },
  { id: 'c35', nameAr: 'جادو',           nameEn: 'Jadu',           sortOrder: 24, isActive: true },
  { id: 'c21', nameAr: 'نالوت',          nameEn: 'Nalut',          sortOrder: 25, isActive: true },
  { id: 'c36', nameAr: 'براك الشاطئ',    nameEn: 'Brak al-Shatti', sortOrder: 26, isActive: true },
  { id: 'c22', nameAr: 'مرزق',           nameEn: 'Murzuq',         sortOrder: 27, isActive: true },
  { id: 'c37', nameAr: 'القطرون',        nameEn: 'Al-Qatrun',      sortOrder: 28, isActive: true },
  { id: 'c23', nameAr: 'أوباري',         nameEn: 'Ubari',          sortOrder: 29, isActive: true },
  { id: 'c38', nameAr: 'درج',            nameEn: 'Dirj',           sortOrder: 30, isActive: true },
  { id: 'c24', nameAr: 'هون',            nameEn: 'Hun',            sortOrder: 31, isActive: true },
  { id: 'c39', nameAr: 'ودان',           nameEn: 'Waddan',         sortOrder: 32, isActive: true },
  { id: 'c40', nameAr: 'زلة',            nameEn: 'Zillah',         sortOrder: 33, isActive: true },
  { id: 'c41', nameAr: 'تمنهنت',         nameEn: 'Tamanhant',      sortOrder: 34, isActive: true },
  { id: 'c42', nameAr: 'رأس لانوف',      nameEn: 'Ras Lanuf',      sortOrder: 35, isActive: true },
  { id: 'c43', nameAr: 'البريقة',        nameEn: 'Al-Brega',       sortOrder: 36, isActive: true },
  { id: 'c25', nameAr: 'الكفرة',         nameEn: 'Kufra',          sortOrder: 37, isActive: true },
  { id: 'c44', nameAr: 'جالو',           nameEn: 'Jalu',           sortOrder: 38, isActive: true },
  { id: 'c45', nameAr: 'أوجلة',          nameEn: 'Awjilah',        sortOrder: 39, isActive: true },
  { id: 'c46', nameAr: 'الجغبوب',        nameEn: 'Al-Jaghbub',     sortOrder: 40, isActive: true },
  { id: 'c26', nameAr: 'غات',            nameEn: 'Ghat',           sortOrder: 41, isActive: true },
  { id: 'c27', nameAr: 'القره بوللي',    nameEn: 'Qarabuli',       sortOrder: 42, isActive: true },
  { id: 'c28', nameAr: 'العجيلات',       nameEn: 'Al Ajelat',      sortOrder: 43, isActive: true },
  { id: 'c47', nameAr: 'رقدالين',        nameEn: 'Rigdalin',       sortOrder: 44, isActive: true },
  { id: 'c48', nameAr: 'الأبيار',        nameEn: 'Al-Abyar',       sortOrder: 45, isActive: true },
  { id: 'c49', nameAr: 'القبة',          nameEn: 'Al-Quba',        sortOrder: 46, isActive: true },
  { id: 'c50', nameAr: 'سلوق',           nameEn: 'Suluq',          sortOrder: 47, isActive: true },
  { id: 'c51', nameAr: 'قمينس',          nameEn: 'Qaminis',        sortOrder: 48, isActive: true },
  { id: 'c29', nameAr: 'غدامس',          nameEn: 'Ghadames',       sortOrder: 49, isActive: true },
  { id: 'c30', nameAr: 'شحات',           nameEn: 'Shahat',         sortOrder: 50, isActive: true },
  { id: 'c31', nameAr: 'سوسة',           nameEn: 'Susah',          sortOrder: 51, isActive: true },
  { id: 'c52', nameAr: 'تيجي',           nameEn: 'Tiji',           sortOrder: 52, isActive: true },
  { id: 'c53', nameAr: 'تاجوراء',        nameEn: 'Tajoura',        sortOrder: 53, isActive: true },
  { id: 'c57', nameAr: 'سوكنة',          nameEn: 'Socna',          sortOrder: 54, isActive: true },
  { id: 'c58', nameAr: 'واو الناموس',    nameEn: 'Waw an Namus',   sortOrder: 55, isActive: true },
  { id: 'c59', nameAr: 'الرجبان',        nameEn: 'Al-Rajban',      sortOrder: 56, isActive: true },
];

const CATEGORIES = [
  { id: 'k1',  nameAr: 'كهرباء',           nameEn: 'Electricity',    iconName: 'Zap',         sortOrder: 1,  isActive: true },
  { id: 'k2',  nameAr: 'سباكة',             nameEn: 'Plumbing',       iconName: 'Droplets',    sortOrder: 2,  isActive: true },
  { id: 'k3',  nameAr: 'تكييف وتبريد',      nameEn: 'AC & Cooling',   iconName: 'Wind',        sortOrder: 3,  isActive: true },
  { id: 'k4',  nameAr: 'دهان وديكور',       nameEn: 'Painting',       iconName: 'Paintbrush',  sortOrder: 4,  isActive: true },
  { id: 'k5',  nameAr: 'نجارة',             nameEn: 'Carpentry',      iconName: 'Hammer',      sortOrder: 5,  isActive: true },
  { id: 'k6',  nameAr: 'تنظيف',             nameEn: 'Cleaning',       iconName: 'Sparkles',    sortOrder: 6,  isActive: true },
  { id: 'k7',  nameAr: 'نقل عفش',          nameEn: 'Moving',         iconName: 'Truck',       sortOrder: 7,  isActive: true },
  { id: 'k8',  nameAr: 'صيانة أجهزة',       nameEn: 'Appliances',     iconName: 'Wrench',      sortOrder: 8,  isActive: true },
  { id: 'k9',  nameAr: 'إنترنت وشبكات',     nameEn: 'Networks',       iconName: 'Wifi',        sortOrder: 9,  isActive: true },
  { id: 'k10', nameAr: 'صيانة تلفزيون',     nameEn: 'TV Repair',      iconName: 'Tv',          sortOrder: 10, isActive: true },
  { id: 'k11', nameAr: 'تدفئة',             nameEn: 'Heating',        iconName: 'Flame',       sortOrder: 11, isActive: true },
  { id: 'k12', nameAr: 'بلاط وسيراميك',     nameEn: 'Tiling',         iconName: 'Grid3X3',     sortOrder: 12, isActive: true },
  { id: 'k13', nameAr: 'أعمال حدادة',       nameEn: 'Ironwork',       iconName: 'Settings',    sortOrder: 13, isActive: true },
  { id: 'k14', nameAr: 'أعمال بناء',        nameEn: 'Construction',   iconName: 'Building2',   sortOrder: 14, isActive: true },
  { id: 'k15', nameAr: 'أمن وأقفال',        nameEn: 'Security',       iconName: 'Lock',        sortOrder: 15, isActive: true },
];

export async function seedDatabase(): Promise<void> {
  try {
    const [{ count: cityCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(citiesTable);

    if (cityCount === 0) {
      await db.insert(citiesTable).values(CITIES).onConflictDoNothing();
      console.log(`[seed] Inserted ${CITIES.length} cities`);
    }

    const [{ count: catCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(categoriesTable);

    if (catCount === 0) {
      await db.insert(categoriesTable).values(CATEGORIES).onConflictDoNothing();
      console.log(`[seed] Inserted ${CATEGORIES.length} categories`);
    }
  } catch (err) {
    console.error('[seed] Seed failed (non-fatal):', err);
  }
}
