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
  { id: 'c6',  nameAر: 'زوارة',          nameEn: 'Zuwara',         sortOrder: 7,  isActive: true },
  { id: 'c7',  nameAر: 'زليتن',          nameEn: 'Zliten',         sortOrder: 8,  isActive: true },
  { id: 'c8',  nameAر: 'الخمس',          nameEn: 'Al Khoms',       sortOrder: 9,  isActive: true },
  { id: 'c14', nameAر: 'ترهونة',         nameEn: 'Tarhuna',        sortOrder: 10, isActive: true },
  { id: 'c32', nameAر: 'مسلاتة',         nameEn: 'Msallata',       sortOrder: 11, isActive: true },
  { id: 'c9',  nameAر: 'سرت',            nameEn: 'Sirte',          sortOrder: 12, isActive: true },
  { id: 'c10', nameAر: 'طبرق',           nameEn: 'Tobruk',         sortOrder: 13, isActive: true },
  { id: 'c11', nameAر: 'درنة',           nameEn: 'Derna',          sortOrder: 14, isActive: true },
  { id: 'c12', nameAر: 'غريان',          nameEn: 'Gharyan',        sortOrder: 15, isActive: true },
  { id: 'c33', nameAر: 'الزنتان',        nameEn: 'Zintan',         sortOrder: 16, isActive: true },
  { id: 'c15', nameAر: 'بني وليد',       nameEn: 'Bani Walid',     sortOrder: 17, isActive: true },
  { id: 'c16', nameAر: 'صبراتة',         nameEn: 'Sabratha',       sortOrder: 18, isActive: true },
  { id: 'c17', nameAر: 'البيضاء',        nameEn: 'Al Bayda',       sortOrder: 19, isActive: true },
  { id: 'c18', nameAر: 'المرج',          nameEn: 'Al Marj',        sortOrder: 20, isActive: true },
  { id: 'c19', nameAر: 'صرمان',          nameEn: 'Sorman',         sortOrder: 21, isActive: true },
  { id: 'c34', nameAر: 'مزدة',           nameEn: 'Mizda',          sortOrder: 22, isActive: true },
  { id: 'c20', nameAر: 'يفرن',           nameEn: 'Yefren',         sortOrder: 23, isActive: true },
  { id: 'c35', nameAر: 'جادو',           nameEn: 'Jadu',           sortOrder: 24, isActive: true },
  { id: 'c21', nameAر: 'نالوت',          nameEn: 'Nalut',          sortOrder: 25, isActive: true },
  { id: 'c36', nameAر: 'براك الشاطئ',    nameEn: 'Brak al-Shatti', sortOrder: 26, isActive: true },
  { id: 'c22', nameAر: 'مرزق',           nameEn: 'Murzuq',         sortOrder: 27, isActive: true },
  { id: 'c37', nameAر: 'القطرون',        nameEn: 'Al-Qatrun',      sortOrder: 28, isActive: true },
  { id: 'c23', nameAر: 'أوباري',         nameEn: 'Ubari',          sortOrder: 29, isActive: true },
  { id: 'c38', nameAر: 'درج',            nameEn: 'Dirj',           sortOrder: 30, isActive: true },
  { id: 'c24', nameAر: 'هون',            nameEn: 'Hun',            sortOrder: 31, isActive: true },
  { id: 'c39', nameAر: 'ودان',           nameEn: 'Waddan',         sortOrder: 32, isActive: true },
  { id: 'c40', nameAر: 'زلة',            nameEn: 'Zillah',         sortOrder: 33, isActive: true },
  { id: 'c41', nameAر: 'تمنهنت',         nameEn: 'Tamanhant',      sortOrder: 34, isActive: true },
  { id: 'c42', nameAر: 'رأس لانوف',      nameEn: 'Ras Lanuf',      sortOrder: 35, isActive: true },
  { id: 'c43', nameAر: 'البريقة',        nameEن: 'Al-Brega',       sortOrder: 36, isActive: true },
  { id: 'c25', nameAر: 'الكفرة',         nameEن: 'Kufra',          sortOrder: 37, isActive: true },
  { id: 'c44', nameAر: 'جالو',           nameEن: 'Jalu',           sortOrder: 38, isActive: true },
  { id: 'c45', nameAر: 'أوجلة',          nameEن: 'Awjilah',        sortOrder: 39, isActive: true },
  { id: 'c46', nameAر: 'الجغبوب',        nameEن: 'Al-Jaghbub',     sortOrder: 40, isActive: true },
  { id: 'c26', nameAر: 'غات',            nameEن: 'Ghat',           sortOrder: 41, isActive: true },
  { id: 'c27', nameAر: 'القره بوللي',    nameEن: 'Qarabuli',       sortOrder: 42, isActive: true },
  { id: 'c28', nameAر: 'العجيلات',       nameEن: 'Al Ajelat',      sortOrder: 43, isActive: true },
  { id: 'c47', nameAر: 'رقدالين',        nameEن: 'Rigdalin',       sortOrder: 44, isActive: true },
  { id: 'c48', nameAر: 'الأبيار',        nameEن: 'Al-Abyar',       sortOrder: 45, isActive: true },
  { id: 'c49', nameAر: 'القبة',          nameEن: 'Al-Quba',        sortOrder: 46, isActive: true },
  { id: 'c50', nameAر: 'سلوق',           nameEن: 'Suluq',          sortOrder: 47, isActive: true },
  { id: 'c51', nameAر: 'قمينس',          nameEن: 'Qaminis',        sortOrder: 48, isActive: true },
  { id: 'c29', nameAر: 'غدامس',          nameEن: 'Ghadames',       sortOrder: 49, isActive: true },
  { id: 'c30', nameAر: 'شحات',           nameEن: 'Shahat',         sortOrder: 50, isActive: true },
  { id: 'c31', nameAر: 'سوسة',           nameEن: 'Susah',          sortOrder: 51, isActive: true },
  { id: 'c52', nameAر: 'تيجي',           nameEن: 'Tiji',           sortOrder: 52, isActive: true },
  { id: 'c53', nameAر: 'تاجوراء',        nameEن: 'Tajoura',        sortOrder: 53, isActive: true },
  { id: 'c57', nameAر: 'سوكنة',          nameEن: 'Socna',          sortOrder: 54, isActive: true },
  { id: 'c58', nameAر: 'واو الناموس',    nameEن: 'Waw an Namus',   sortOrder: 55, isActive: true },
  { id: 'c59', nameAر: 'الرجبان',        nameEن: 'Al-Rajban',      sortOrder: 56, isActive: true },
];

// Original 19 base categories — upserted on every boot to keep names/icons current.
const BASE_CATEGORIES = [
  { id: 'electricity',          nameAr: 'كهرباء',                   nameEn: 'Electricity',                           iconName: 'zap',                  sortOrder: 1,  isActive: true, sectionId: 'home_services'     },
  { id: 'plumbing',             nameAr: 'سباكة',                    nameEn: 'Plumbing',                              iconName: 'droplets',             sortOrder: 2,  isActive: true, sectionId: 'home_services'     },
  { id: 'ac',                   nameAr: 'تكييف',                    nameEn: 'AC & HVAC',                             iconName: 'wind',                 sortOrder: 3,  isActive: true, sectionId: 'home_services'     },
  { id: 'painting',             nameAr: 'دهانات',                   nameEn: 'Painting',                              iconName: 'paintbrush',           sortOrder: 4,  isActive: true, sectionId: 'home_services'     },
  { id: 'carpentry',            nameAر: 'نجارة',                    nameEn: 'Carpentry',                             iconName: 'hammer',               sortOrder: 5,  isActive: true, sectionId: 'home_services'     },
  { id: 'cleaning',             nameAر: 'تنظيف',                    nameEن: 'Cleaning',                              iconName: 'sparkles',             sortOrder: 6,  isActive: true, sectionId: 'home_services'     },
  { id: 'moving',               nameAر: 'نقل عفش',                  nameEن: 'Moving',                                iconName: 'truck',                sortOrder: 7,  isActive: true, sectionId: 'moving_general'    },
  { id: 'cctv',                 nameAر: 'كاميرات مراقبة',           nameEن: 'CCTV',                                  iconName: 'camera',               sortOrder: 8,  isActive: true, sectionId: 'tech_security'     },
  { id: 'networks',             nameAر: 'شبكات',                    nameEن: 'Networks & IT',                         iconName: 'wifi',                 sortOrder: 9,  isActive: true, sectionId: 'tech_security'     },
  { id: 'maintenance',          nameAر: 'صيانة عامة',               nameEن: 'General Maintenance',                   iconName: 'wrench',               sortOrder: 10, isActive: true, sectionId: 'moving_general'    },
  { id: 'appliances',           nameAر: 'أجهزة منزلية',             nameEن: 'Appliances',                            iconName: 'monitor',              sortOrder: 11, isActive: true, sectionId: 'home_services'     },
  { id: 'welding',              nameAر: 'لحام',                     nameEن: 'Welding',                               iconName: 'flame',                sortOrder: 12, isActive: true, sectionId: 'construction'      },
  { id: 'coffee_machine',       nameAر: 'فني ماكينة قهوة',          nameEن: 'Coffee Machine Technician',             iconName: 'coffee_machine',       sortOrder: 60, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_equipment', nameAر: 'فني معدات مطاعم ومقاهي',  nameEن: 'Restaurant & Cafe Equipment Technician',iconName: 'restaurant_equipment', sortOrder: 61, isActive: true, sectionId: 'business_services' },
  { id: 'shawarma',             nameAر: 'أسطى شاورما',              nameEن: 'Shawarma Worker',                       iconName: 'shawarma',             sortOrder: 62, isActive: true, sectionId: 'business_services' },
  { id: 'grill',                nameAر: 'أسطى مشاوي',              nameEن: 'Grill Worker',                          iconName: 'grill',                sortOrder: 63, isActive: true, sectionId: 'business_services' },
  { id: 'pastry',               nameAر: 'أسطى معجنات وبريوش وكريب',nameEن: 'Pastry, Brioche & Crepe Worker',        iconName: 'pastry',               sortOrder: 64, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_staff',     nameAر: 'عمالة مطاعم ومقاهي',      nameEن: 'Restaurant & Cafe Staff',               iconName: 'restaurant_staff',     sortOrder: 65, isActive: true, sectionId: 'business_services' },
  { id: 'plastering',           nameAر: 'عامل لياسة ومحارة',       nameEن: 'Plastering Worker',                     iconName: 'plastering',           sortOrder: 66, isActive: true, sectionId: 'construction'      },
];

// 35 additional categories inserted only when missing (ON CONFLICT DO NOTHING).
// These cover technician specialties that existed in the DB but lacked seed entries.
const EXTRA_CATEGORIES = [
  // ── Home Services ─────────────────────────────────────────────────────────────
  { id: 'gas',            nameAر: 'تمديد غاز',           nameEن: 'Gas Installation',    iconName: 'flame',       sortOrder: 13, isActive: true, sectionId: 'home_services'  },
  { id: 'pumps',          nameAر: 'مضخات مياه',          nameEن: 'Water Pumps',         iconName: 'droplets',    sortOrder: 14, isActive: true, sectionId: 'home_services'  },
  { id: 'locks',          nameAر: 'أقفال ومفاتيح',       nameEن: 'Locks & Locksmith',   iconName: 'key',         sortOrder: 15, isActive: true, sectionId: 'home_services'  },
  { id: 'tank_cleaning',  nameAر: 'تنظيف خزانات',        nameEن: 'Tank Cleaning',       iconName: 'container',   sortOrder: 16, isActive: true, sectionId: 'home_services'  },
  { id: 'home_help',      nameAر: 'مساعدة منزلية',       nameEن: 'Home Help',           iconName: 'home',        sortOrder: 17, isActive: true, sectionId: 'home_services'  },

  // ── Construction & Finishing ──────────────────────────────────────────────────
  { id: 'tiles',          nameAر: 'بلاط وسيراميك',       nameEن: 'Tiles & Ceramic',     iconName: 'grid',        sortOrder: 20, isActive: true, sectionId: 'construction'   },
  { id: 'gypsum',         nameAر: 'جبسيات',              nameEن: 'Gypsum Work',         iconName: 'layers',      sortOrder: 21, isActive: true, sectionId: 'construction'   },
  { id: 'aluminum',       nameAر: 'ألمنيوم وزجاج',       nameEن: 'Aluminum & Glass',    iconName: 'square',      sortOrder: 22, isActive: true, sectionId: 'construction'   },
  { id: 'waterproof',     nameAر: 'عزل مائي',            nameEن: 'Waterproofing',       iconName: 'droplets',    sortOrder: 23, isActive: true, sectionId: 'construction'   },
  { id: 'thermal',        nameAر: 'عزل حراري',           nameEن: 'Thermal Insulation',  iconName: 'thermometer', sortOrder: 24, isActive: true, sectionId: 'construction'   },
  { id: 'concrete',       nameAر: 'أعمال خرسانية',       nameEن: 'Concrete Works',      iconName: 'building',    sortOrder: 25, isActive: true, sectionId: 'construction'   },
  { id: 'roofing',        nameAر: 'أسطح وعزل',           nameEن: 'Roofing',             iconName: 'home',        sortOrder: 26, isActive: true, sectionId: 'construction'   },
  { id: 'contracting',    nameAر: 'مقاولات عامة',        nameEن: 'General Contracting', iconName: 'hard_hat',    sortOrder: 27, isActive: true, sectionId: 'construction'   },

  // ── Tech & Security ───────────────────────────────────────────────────────────
  { id: 'satellite',      nameAر: 'دش وستالايت',         nameEن: 'Satellite & TV',      iconName: 'antenna',     sortOrder: 30, isActive: true, sectionId: 'tech_security'  },
  { id: 'alarm',          nameAر: 'إنذار وحماية',        nameEن: 'Alarm Systems',       iconName: 'bell',        sortOrder: 31, isActive: true, sectionId: 'tech_security'  },
  { id: 'access_control', nameAر: 'تحكم بالدخول',        nameEن: 'Access Control',      iconName: 'shield',      sortOrder: 32, isActive: true, sectionId: 'tech_security'  },
  { id: 'computer',       nameAر: 'كمبيوتر وصيانة',      nameEن: 'Computer Repair',     iconName: 'monitor',     sortOrder: 33, isActive: true, sectionId: 'tech_security'  },
  { id: 'mobile_repair',  nameAر: 'صيانة موبايل',        nameEن: 'Mobile Repair',       iconName: 'smartphone',  sortOrder: 34, isActive: true, sectionId: 'tech_security'  },

  // ── Car Services ─────────────────────────────────────────────────────────────
  { id: 'car_mechanic',    nameAر: 'ميكانيك سيارات',     nameEن: 'Car Mechanic',        iconName: 'car',         sortOrder: 40, isActive: true, sectionId: 'car_services'   },
  { id: 'auto_electrician',nameAر: 'كهرباء سيارات',      nameEن: 'Auto Electrician',    iconName: 'zap',         sortOrder: 41, isActive: true, sectionId: 'car_services'   },
  { id: 'car_body',        nameAر: 'كاروسيري وسمكرة',    nameEن: 'Car Body & Paint',    iconName: 'paintbrush',  sortOrder: 42, isActive: true, sectionId: 'car_services'   },
  { id: 'tire_repair',     nameAر: 'إطارات',             nameEن: 'Tire Repair',         iconName: 'circle',      sortOrder: 43, isActive: true, sectionId: 'car_services'   },
  { id: 'car_ac',          nameAر: 'تكييف سيارات',       nameEن: 'Car AC',              iconName: 'wind',        sortOrder: 44, isActive: true, sectionId: 'car_services'   },
  { id: 'car_battery',     nameAر: 'بطارية سيارات',      nameEن: 'Car Battery',         iconName: 'battery',     sortOrder: 45, isActive: true, sectionId: 'car_services'   },
  { id: 'car_diagnostics', nameAر: 'فحص وكمبيوتر سيارات',nameEن: 'Car Diagnostics',    iconName: 'search',      sortOrder: 46, isActive: true, sectionId: 'car_services'   },
  { id: 'oil_change',      nameAر: 'تغيير زيت',          nameEن: 'Oil Change',          iconName: 'droplets',    sortOrder: 47, isActive: true, sectionId: 'car_services'   },
  { id: 'car_wash',        nameAر: 'غسيل سيارات',        nameEن: 'Car Wash',            iconName: 'sparkles',    sortOrder: 48, isActive: true, sectionId: 'car_services'   },
  { id: 'towing',          nameAر: 'سحب سيارات',         nameEن: 'Towing',              iconName: 'truck',       sortOrder: 49, isActive: true, sectionId: 'car_services'   },

  // ── General Services ─────────────────────────────────────────────────────────
  { id: 'solar',          nameAر: 'طاقة شمسية',          nameEن: 'Solar Energy',        iconName: 'sun',         sortOrder: 50, isActive: true, sectionId: 'moving_general' },
  { id: 'generators',     nameAر: 'مولدات كهربائية',     nameEن: 'Generators',          iconName: 'zap',         sortOrder: 51, isActive: true, sectionId: 'moving_general' },
  { id: 'pest_control',   nameAر: 'مكافحة حشرات',        nameEن: 'Pest Control',        iconName: 'bug',         sortOrder: 52, isActive: true, sectionId: 'moving_general' },
  { id: 'landscaping',    nameAر: 'تنسيق حدائق',         nameEن: 'Landscaping',         iconName: 'tree',        sortOrder: 53, isActive: true, sectionId: 'moving_general' },
  { id: 'pool',           nameAر: 'مسابح',               nameEن: 'Pool Services',       iconName: 'waves',       sortOrder: 54, isActive: true, sectionId: 'moving_general' },
  { id: 'workers',        nameAر: 'عمال يومية',           nameEن: 'Daily Workers',       iconName: 'users',       sortOrder: 55, isActive: true, sectionId: 'moving_general' },
  { id: 'more_services',  nameAر: 'خدمات أخرى',          nameEن: 'Other Services',      iconName: 'plus',        sortOrder: 56, isActive: true, sectionId: 'moving_general' },
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

    // Upsert the original 19 base categories (names/icons may evolve)
    await db.insert(categoriesTable).values(BASE_CATEGORIES).onConflictDoUpdate({
      target: categoriesTable.id,
      set: {
        nameAr:    sql`excluded.name_ar`,
        nameEn:    sql`excluded.name_en`,
        iconName:  sql`excluded.icon_name`,
        sortOrder: sql`excluded.sort_order`,
        isActive:  sql`excluded.is_active`,
        sectionId: sql`excluded.section_id`,
      },
    });
    console.log(`[seed] Upserted ${BASE_CATEGORIES.length} base categories`);

    // Insert the 35 extra categories only when they don't already exist
    await db.insert(categoriesTable).values(EXTRA_CATEGORIES).onConflictDoNothing();
    console.log(`[seed] Ensured ${EXTRA_CATEGORIES.length} extra categories`);

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
