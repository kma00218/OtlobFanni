import { db } from "@workspace/db";
import { citiesTable, categoriesTable, adminsTable } from "@workspace/db/schema";
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
  { id: 'electricity',         nameAr: 'كهرباء',                                    nameEn: 'Electricity',                              iconName: 'zap',                  sortOrder: 1,  isActive: true },
  { id: 'plumbing',            nameAr: 'سباكة',                                     nameEn: 'Plumbing',                                 iconName: 'droplets',             sortOrder: 2,  isActive: true },
  { id: 'ac',                  nameAr: 'تكييف',                                     nameEn: 'AC & HVAC',                                iconName: 'wind',                 sortOrder: 3,  isActive: true },
  { id: 'painting',            nameAr: 'دهانات',                                    nameEn: 'Painting',                                 iconName: 'paintbrush',           sortOrder: 4,  isActive: true },
  { id: 'carpentry',           nameAr: 'نجارة',                                     nameEn: 'Carpentry',                                iconName: 'hammer',               sortOrder: 5,  isActive: true },
  { id: 'cleaning',            nameAr: 'تنظيف',                                     nameEn: 'Cleaning',                                 iconName: 'sparkles',             sortOrder: 6,  isActive: true },
  { id: 'moving',              nameAr: 'نقل عفش',                                   nameEn: 'Moving',                                   iconName: 'truck',                sortOrder: 7,  isActive: true },
  { id: 'cctv',                nameAr: 'كاميرات مراقبة',                            nameEn: 'CCTV',                                     iconName: 'camera',               sortOrder: 8,  isActive: true },
  { id: 'networks',            nameAr: 'شبكات',                                     nameEn: 'Networks & IT',                            iconName: 'wifi',                 sortOrder: 9,  isActive: true },
  { id: 'maintenance',         nameAr: 'صيانة عامة',                                nameEn: 'General Maintenance',                      iconName: 'wrench',               sortOrder: 10, isActive: true },
  { id: 'appliances',          nameAr: 'أجهزة منزلية',                              nameEn: 'Appliances',                               iconName: 'monitor',              sortOrder: 11, isActive: true },
  { id: 'welding',             nameAr: 'لحام',                                      nameEn: 'Welding',                                  iconName: 'flame',                sortOrder: 12, isActive: true },
  { id: 'coffee_machine',      nameAr: 'فني ماكينة قهوة',                           nameEn: 'Coffee Machine Technician',                iconName: 'coffee_machine',       sortOrder: 60, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_equipment',nameAr: 'فني معدات مطاعم ومقاهي',                   nameEn: 'Restaurant & Cafe Equipment Technician',   iconName: 'restaurant_equipment', sortOrder: 61, isActive: true, sectionId: 'business_services' },
  { id: 'shawarma',            nameAr: 'أسطى شاورما',                               nameEn: 'Shawarma Worker',                          iconName: 'shawarma',             sortOrder: 62, isActive: true, sectionId: 'business_services' },
  { id: 'grill',               nameAr: 'أسطى مشاوي',                               nameEn: 'Grill Worker',                             iconName: 'grill',                sortOrder: 63, isActive: true, sectionId: 'business_services' },
  { id: 'pastry',              nameAr: 'أسطى معجنات وبريوش وكريب',                 nameEn: 'Pastry, Brioche & Crepe Worker',           iconName: 'pastry',               sortOrder: 64, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_staff',    nameAr: 'عمالة مطاعم ومقاهي',                       nameEn: 'Restaurant & Cafe Staff',                  iconName: 'restaurant_staff',     sortOrder: 65, isActive: true, sectionId: 'business_services' },
  { id: 'plastering',          nameAr: 'عامل لياسة ومحارة',                        nameEn: 'Plastering Worker',                        iconName: 'plastering',           sortOrder: 66, isActive: true, sectionId: 'construction'       },

  // ── Home Services (additional) ───────────────────────────────────────────────
  { id: 'gas',             nameAr: 'تمديد غاز',         nameEn: 'Gas Installation',       iconName: 'flame',         sortOrder: 13, isActive: true, sectionId: 'home_services'  },
  { id: 'pumps',           nameAr: 'مضخات مياه',        nameEn: 'Water Pumps',            iconName: 'droplets',      sortOrder: 14, isActive: true, sectionId: 'home_services'  },
  { id: 'locks',           nameAr: 'أقفال ومفاتيح',     nameEn: 'Locks & Locksmith',      iconName: 'key',           sortOrder: 15, isActive: true, sectionId: 'home_services'  },
  { id: 'tank_cleaning',   nameAr: 'تنظيف خزانات',      nameEn: 'Tank Cleaning',          iconName: 'container',     sortOrder: 16, isActive: true, sectionId: 'home_services'  },
  { id: 'home_help',       nameAr: 'مساعدة منزلية',     nameEn: 'Home Help',              iconName: 'home',          sortOrder: 17, isActive: true, sectionId: 'home_services'  },

  // ── Construction & Finishing (additional) ────────────────────────────────────
  { id: 'tiles',           nameAr: 'بلاط وسيراميك',     nameEn: 'Tiles & Ceramic',        iconName: 'grid',          sortOrder: 20, isActive: true, sectionId: 'construction'   },
  { id: 'gypsum',          nameAr: 'جبسيات',            nameEn: 'Gypsum Work',            iconName: 'layers',        sortOrder: 21, isActive: true, sectionId: 'construction'   },
  { id: 'aluminum',        nameAr: 'ألمنيوم وزجاج',     nameEn: 'Aluminum & Glass',       iconName: 'square',        sortOrder: 22, isActive: true, sectionId: 'construction'   },
  { id: 'waterproof',      nameAr: 'عزل مائي',          nameEn: 'Waterproofing',          iconName: 'droplets',      sortOrder: 23, isActive: true, sectionId: 'construction'   },
  { id: 'thermal',         nameAr: 'عزل حراري',         nameEn: 'Thermal Insulation',     iconName: 'thermometer',   sortOrder: 24, isActive: true, sectionId: 'construction'   },
  { id: 'concrete',        nameAr: 'أعمال خرسانية',     nameEn: 'Concrete Works',         iconName: 'building',      sortOrder: 25, isActive: true, sectionId: 'construction'   },
  { id: 'roofing',         nameAr: 'أسطح وعزل',         nameEn: 'Roofing',                iconName: 'home',          sortOrder: 26, isActive: true, sectionId: 'construction'   },
  { id: 'contracting',     nameAr: 'مقاولات عامة',      nameEn: 'General Contracting',    iconName: 'hard_hat',      sortOrder: 27, isActive: true, sectionId: 'construction'   },

  // ── Tech & Security (additional) ─────────────────────────────────────────────
  { id: 'satellite',       nameAr: 'دش وستالايت',       nameEn: 'Satellite & TV',         iconName: 'antenna',       sortOrder: 30, isActive: true, sectionId: 'tech_security'  },
  { id: 'alarm',           nameAr: 'إنذار وحماية',      nameEn: 'Alarm Systems',          iconName: 'bell',          sortOrder: 31, isActive: true, sectionId: 'tech_security'  },
  { id: 'access_control',  nameAr: 'تحكم بالدخول',      nameEn: 'Access Control',         iconName: 'shield',        sortOrder: 32, isActive: true, sectionId: 'tech_security'  },
  { id: 'computer',        nameAr: 'كمبيوتر وصيانة',    nameEn: 'Computer Repair',        iconName: 'monitor',       sortOrder: 33, isActive: true, sectionId: 'tech_security'  },
  { id: 'mobile_repair',   nameAr: 'صيانة موبايل',      nameEn: 'Mobile Repair',          iconName: 'smartphone',    sortOrder: 34, isActive: true, sectionId: 'tech_security'  },

  // ── Car Services ─────────────────────────────────────────────────────────────
  { id: 'car_mechanic',    nameAr: 'ميكانيك سيارات',    nameEn: 'Car Mechanic',           iconName: 'car',           sortOrder: 40, isActive: true, sectionId: 'car_services'   },
  { id: 'auto_electrician',nameAr: 'كهرباء سيارات',     nameEn: 'Auto Electrician',       iconName: 'zap',           sortOrder: 41, isActive: true, sectionId: 'car_services'   },
  { id: 'car_body',        nameAr: 'كاروسيري وسمكرة',   nameEn: 'Car Body & Paint',       iconName: 'paintbrush',    sortOrder: 42, isActive: true, sectionId: 'car_services'   },
  { id: 'tire_repair',     nameAr: 'إطارات',            nameEn: 'Tire Repair',            iconName: 'circle',        sortOrder: 43, isActive: true, sectionId: 'car_services'   },
  { id: 'car_ac',          nameAr: 'تكييف سيارات',      nameEn: 'Car AC',                 iconName: 'wind',          sortOrder: 44, isActive: true, sectionId: 'car_services'   },
  { id: 'car_battery',     nameAr: 'بطارية سيارات',     nameEn: 'Car Battery',            iconName: 'battery',       sortOrder: 45, isActive: true, sectionId: 'car_services'   },
  { id: 'car_diagnostics', nameAr: 'فحص وكمبيوتر سيارات',nameEn: 'Car Diagnostics',      iconName: 'search',        sortOrder: 46, isActive: true, sectionId: 'car_services'   },
  { id: 'oil_change',      nameAr: 'تغيير زيت',         nameEn: 'Oil Change',             iconName: 'droplets',      sortOrder: 47, isActive: true, sectionId: 'car_services'   },
  { id: 'car_wash',        nameAr: 'غسيل سيارات',       nameEn: 'Car Wash',               iconName: 'sparkles',      sortOrder: 48, isActive: true, sectionId: 'car_services'   },
  { id: 'towing',          nameAr: 'سحب سيارات',        nameEn: 'Towing',                 iconName: 'truck',         sortOrder: 49, isActive: true, sectionId: 'car_services'   },

  // ── General Services (additional) ────────────────────────────────────────────
  { id: 'solar',           nameAr: 'طاقة شمسية',        nameEn: 'Solar Energy',           iconName: 'sun',           sortOrder: 50, isActive: true, sectionId: 'moving_general' },
  { id: 'generators',      nameAr: 'مولدات كهربائية',   nameEn: 'Generators',             iconName: 'zap',           sortOrder: 51, isActive: true, sectionId: 'moving_general' },
  { id: 'pest_control',    nameAr: 'مكافحة حشرات',      nameEn: 'Pest Control',           iconName: 'bug',           sortOrder: 52, isActive: true, sectionId: 'moving_general' },
  { id: 'landscaping',     nameAr: 'تنسيق حدائق',       nameEn: 'Landscaping',            iconName: 'tree',          sortOrder: 53, isActive: true, sectionId: 'moving_general' },
  { id: 'pool',            nameAr: 'مسابح',             nameEn: 'Pool Services',          iconName: 'waves',         sortOrder: 54, isActive: true, sectionId: 'moving_general' },
  { id: 'workers',         nameAr: 'عمال يومية',         nameEn: 'Daily Workers',          iconName: 'users',         sortOrder: 55, isActive: true, sectionId: 'moving_general' },
  { id: 'more_services',   nameAr: 'خدمات أخرى',        nameEn: 'Other Services',         iconName: 'plus',          sortOrder: 56, isActive: true, sectionId: 'moving_general' },
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

    await db.insert(categoriesTable).values(CATEGORIES).onConflictDoUpdate({
      target: categoriesTable.id,
      set: {
        nameAr: sql`excluded.name_ar`,
        nameEn: sql`excluded.name_en`,
        iconName: sql`excluded.icon_name`,
        sortOrder: sql`excluded.sort_order`,
        isActive: sql`excluded.is_active`,
      },
    });
    console.log(`[seed] Upserted ${CATEGORIES.length} categories`);

    const [{ count: adminCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminsTable);

    if (adminCount === 0) {
      await db.insert(adminsTable).values({
        name: 'Super Admin',
        email: 'admin@otlobfanni.ly',
        passwordHash: 'demo1234',
        role: 'super_admin',
        isActive: true,
      }).onConflictDoNothing();
      console.log('[seed] Inserted default super admin');
    }
  } catch (err) {
    console.error('[seed] Seed failed (non-fatal):', err);
  }
}
