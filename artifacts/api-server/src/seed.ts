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

// Original 19 base categories — upserted on every boot to keep names/icons current.
const BASE_CATEGORIES = [
  { id: 'electricity',          nameAr: 'كهرباء',                    nameEn: 'Electricity',                            iconName: 'zap',                  sortOrder: 1,  isActive: true, sectionId: 'home_services'     },
  { id: 'plumbing',             nameAr: 'سباكة',                     nameEn: 'Plumbing',                               iconName: 'droplets',             sortOrder: 2,  isActive: true, sectionId: 'home_services'     },
  { id: 'ac',                   nameAr: 'تكييف',                     nameEn: 'AC & HVAC',                              iconName: 'wind',                 sortOrder: 3,  isActive: true, sectionId: 'home_services'     },
  { id: 'painting',             nameAr: 'دهانات',                    nameEn: 'Painting',                               iconName: 'paintbrush',           sortOrder: 4,  isActive: true, sectionId: 'home_services'     },
  { id: 'carpentry',            nameAr: 'نجارة',                     nameEn: 'Carpentry',                              iconName: 'hammer',               sortOrder: 5,  isActive: true, sectionId: 'home_services'     },
  { id: 'cleaning',             nameAr: 'تنظيف',                     nameEn: 'Cleaning',                               iconName: 'sparkles',             sortOrder: 6,  isActive: true, sectionId: 'home_services'     },
  { id: 'moving',               nameAr: 'نقل عفش',                   nameEn: 'Moving',                                 iconName: 'truck',                sortOrder: 7,  isActive: true, sectionId: 'moving_general'    },
  { id: 'cctv',                 nameAr: 'كاميرات مراقبة',            nameEn: 'CCTV',                                   iconName: 'camera',               sortOrder: 8,  isActive: true, sectionId: 'tech_security'     },
  { id: 'networks',             nameAr: 'شبكات',                     nameEn: 'Networks & IT',                          iconName: 'wifi',                 sortOrder: 9,  isActive: true, sectionId: 'tech_security'     },
  { id: 'maintenance',          nameAr: 'صيانة عامة',                nameEn: 'General Maintenance',                    iconName: 'wrench',               sortOrder: 10, isActive: true, sectionId: 'moving_general'    },
  { id: 'appliances',           nameAr: 'أجهزة منزلية',              nameEn: 'Appliances',                             iconName: 'monitor',              sortOrder: 11, isActive: true, sectionId: 'home_services'     },
  { id: 'welding',              nameAr: 'لحام',                      nameEn: 'Welding',                                iconName: 'flame',                sortOrder: 12, isActive: true, sectionId: 'construction'      },
  { id: 'coffee_machine',       nameAr: 'فني ماكينة قهوة',           nameEn: 'Coffee Machine Technician',              iconName: 'coffee_machine',       sortOrder: 48, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_equipment', nameAr: 'فني معدات مطاعم ومقاهي',   nameEn: 'Restaurant & Cafe Equipment Technician', iconName: 'restaurant_equipment', sortOrder: 49, isActive: true, sectionId: 'business_services' },
  { id: 'shawarma',             nameAr: 'أسطى شاورما',               nameEn: 'Shawarma Worker',                        iconName: 'shawarma',             sortOrder: 50, isActive: true, sectionId: 'business_services' },
  { id: 'grill',                nameAr: 'أسطى مشاوي',               nameEn: 'Grill Worker',                           iconName: 'grill',                sortOrder: 51, isActive: true, sectionId: 'business_services' },
  { id: 'pastry',               nameAr: 'أسطى معجنات وبريوش وكريب', nameEn: 'Pastry, Brioche & Crepe Worker',         iconName: 'pastry',               sortOrder: 52, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_staff',     nameAr: 'عمالة مطاعم ومقاهي',       nameEn: 'Restaurant & Cafe Staff',                iconName: 'restaurant_staff',     sortOrder: 53, isActive: true, sectionId: 'business_services' },
  { id: 'plastering',           nameAr: 'عامل لياسة ومحارة',        nameEn: 'Plastering Worker',                      iconName: 'plastering',           sortOrder: 54, isActive: true, sectionId: 'construction'      },
];

// 35 additional categories — upserted with correct section assignments.
const EXTRA_CATEGORIES = [
  // ── Home Services ─────────────────────────────────────────────────────────────
  { id: 'gas',             nameAr: 'تمديد غاز',            nameEn: 'Gas Installation',    iconName: 'flame',       sortOrder: 13, isActive: true, sectionId: 'home_services'      },
  { id: 'pumps',           nameAr: 'مضخات مياه',           nameEn: 'Water Pumps',         iconName: 'droplets',    sortOrder: 14, isActive: true, sectionId: 'home_services'      },
  { id: 'locks',           nameAr: 'أقفال ومفاتيح',        nameEn: 'Locks & Locksmith',   iconName: 'key',         sortOrder: 15, isActive: true, sectionId: 'home_services'      },
  { id: 'tank_cleaning',   nameAr: 'تنظيف خزانات',         nameEn: 'Tank Cleaning',       iconName: 'container',   sortOrder: 16, isActive: true, sectionId: 'home_services'      },
  { id: 'home_help',       nameAr: 'مساعدة منزلية',        nameEn: 'Home Help',           iconName: 'home',        sortOrder: 17, isActive: true, sectionId: 'home_services'      },

  // ── Construction & Finishing ──────────────────────────────────────────────────
  { id: 'tiles',           nameAr: 'بلاط وسيراميك',        nameEn: 'Tiles & Ceramic',     iconName: 'grid',        sortOrder: 18, isActive: true, sectionId: 'construction'        },
  { id: 'gypsum',          nameAr: 'جبسيات',               nameEn: 'Gypsum Work',         iconName: 'layers',      sortOrder: 19, isActive: true, sectionId: 'construction'        },
  { id: 'aluminum',        nameAr: 'ألمنيوم وزجاج',        nameEn: 'Aluminum & Glass',    iconName: 'square',      sortOrder: 20, isActive: true, sectionId: 'construction'        },
  { id: 'waterproof',      nameAr: 'عزل مائي',             nameEn: 'Waterproofing',       iconName: 'droplets',    sortOrder: 21, isActive: true, sectionId: 'construction'        },
  { id: 'thermal',         nameAr: 'عزل حراري',            nameEn: 'Thermal Insulation',  iconName: 'thermometer', sortOrder: 22, isActive: true, sectionId: 'construction'        },
  { id: 'concrete',        nameAr: 'أعمال خرسانية',        nameEn: 'Concrete Works',      iconName: 'building',    sortOrder: 23, isActive: true, sectionId: 'construction'        },
  { id: 'roofing',         nameAr: 'أسطح وعزل',            nameEn: 'Roofing',             iconName: 'home',        sortOrder: 24, isActive: true, sectionId: 'construction'        },
  { id: 'contracting',     nameAr: 'مقاولات عامة',         nameEn: 'General Contracting', iconName: 'hard_hat',    sortOrder: 25, isActive: true, sectionId: 'construction'        },

  // ── Tech & Security ───────────────────────────────────────────────────────────
  { id: 'satellite',       nameAr: 'دش وستالايت',          nameEn: 'Satellite & TV',      iconName: 'antenna',     sortOrder: 26, isActive: true, sectionId: 'tech_security'       },
  { id: 'alarm',           nameAr: 'إنذار وحماية',         nameEn: 'Alarm Systems',       iconName: 'bell',        sortOrder: 27, isActive: true, sectionId: 'tech_security'       },
  { id: 'access_control',  nameAr: 'تحكم بالدخول',         nameEn: 'Access Control',      iconName: 'shield',      sortOrder: 28, isActive: true, sectionId: 'tech_security'       },
  { id: 'computer',        nameAr: 'كمبيوتر وصيانة',       nameEn: 'Computer Repair',     iconName: 'monitor',     sortOrder: 29, isActive: true, sectionId: 'tech_security'       },
  { id: 'mobile_repair',   nameAr: 'صيانة موبايل',         nameEn: 'Mobile Repair',       iconName: 'smartphone',  sortOrder: 30, isActive: true, sectionId: 'tech_security'       },

  // ── Car Services ─────────────────────────────────────────────────────────────
  { id: 'car_mechanic',    nameAr: 'ميكانيك سيارات',       nameEn: 'Car Mechanic',        iconName: 'car',         sortOrder: 31, isActive: true, sectionId: 'car_services'        },
  { id: 'auto_electrician',nameAr: 'كهرباء سيارات',        nameEn: 'Auto Electrician',    iconName: 'zap',         sortOrder: 32, isActive: true, sectionId: 'car_services'        },
  { id: 'car_body',        nameAr: 'كاروسيري وسمكرة',      nameEn: 'Car Body & Paint',    iconName: 'paintbrush',  sortOrder: 33, isActive: true, sectionId: 'car_services'        },
  { id: 'tire_repair',     nameAr: 'إطارات',               nameEn: 'Tire Repair',         iconName: 'circle',      sortOrder: 34, isActive: true, sectionId: 'car_services'        },
  { id: 'car_ac',          nameAr: 'تكييف سيارات',         nameEn: 'Car AC',              iconName: 'wind',        sortOrder: 35, isActive: true, sectionId: 'car_services'        },
  { id: 'car_battery',     nameAr: 'بطارية سيارات',        nameEn: 'Car Battery',         iconName: 'battery',     sortOrder: 36, isActive: true, sectionId: 'car_services'        },
  { id: 'car_diagnostics', nameAr: 'فحص وكمبيوتر سيارات', nameEn: 'Car Diagnostics',     iconName: 'search',      sortOrder: 37, isActive: true, sectionId: 'car_services'        },
  { id: 'oil_change',      nameAr: 'تغيير زيت',            nameEn: 'Oil Change',          iconName: 'droplets',    sortOrder: 38, isActive: true, sectionId: 'car_services'        },
  { id: 'car_wash',        nameAr: 'غسيل سيارات',          nameEn: 'Car Wash',            iconName: 'sparkles',    sortOrder: 39, isActive: true, sectionId: 'car_services'        },
  { id: 'towing',          nameAr: 'سحب سيارات',           nameEn: 'Towing',              iconName: 'truck',       sortOrder: 40, isActive: true, sectionId: 'car_services'        },

  // ── Energy & Generators ───────────────────────────────────────────────────────
  { id: 'solar',           nameAr: 'طاقة شمسية',           nameEn: 'Solar Energy',        iconName: 'sun',         sortOrder: 41, isActive: true, sectionId: 'energy_generators'  },
  { id: 'generators',      nameAr: 'مولدات كهربائية',      nameEn: 'Generators',          iconName: 'zap',         sortOrder: 42, isActive: true, sectionId: 'energy_generators'  },

  // ── Moving & General Services ─────────────────────────────────────────────────
  { id: 'pest_control',    nameAr: 'مكافحة حشرات',         nameEn: 'Pest Control',        iconName: 'bug',         sortOrder: 43, isActive: true, sectionId: 'moving_general'     },
  { id: 'workers',         nameAr: 'عمال يومية',            nameEn: 'Daily Workers',       iconName: 'users',       sortOrder: 46, isActive: true, sectionId: 'moving_general'     },
  { id: 'more_services',   nameAr: 'خدمات أخرى',           nameEn: 'Other Services',      iconName: 'plus',        sortOrder: 47, isActive: true, sectionId: 'moving_general'     },

  // ── Gardens & Pools ───────────────────────────────────────────────────────────
  { id: 'landscaping',     nameAr: 'تنسيق حدائق',          nameEn: 'Landscaping',         iconName: 'tree',        sortOrder: 44, isActive: true, sectionId: 'gardens_pools'      },
  { id: 'pool',            nameAr: 'مسابح',                nameEn: 'Pool Services',       iconName: 'waves',       sortOrder: 45, isActive: true, sectionId: 'gardens_pools'      },
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

    // Upsert base categories — always update names/icons/section.
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

    // Upsert extra categories — always update section assignments.
    await db.insert(categoriesTable).values(EXTRA_CATEGORIES).onConflictDoUpdate({
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
    console.log(`[seed] Upserted ${EXTRA_CATEGORIES.length} extra categories`);

    // Hide legacy k1–k15 categories — they are duplicates of the named seed categories.
    // Deactivating prevents them from appearing in section listings while keeping
    // any technician records that reference them intact.
    await db.execute(sql`
      UPDATE categories SET is_active = false
      WHERE id IN ('k1','k2','k3','k4','k5','k6','k7','k8','k9','k10','k11','k12','k13','k14','k15')
    `);

    // Remove duplicate admin-created categories: keep only the earliest per name+section.
    await db.execute(sql`
      DELETE FROM categories
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY section_id, name_ar ORDER BY id) AS rn
          FROM categories
          WHERE id LIKE 'custom_%'
        ) t WHERE rn > 1
      )
    `);
    console.log('[seed] Cleaned up duplicate custom categories');

    const [{ count: adminCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminsTable);

    if (adminCount === 0) {
      await db.insert(adminsTable).values({
        name: 'مدير النظام',
        email: 'admin@otlobfanni.ly',
        passwordHash: 'khaled13110G',
        role: 'super_admin',
        isActive: true,
      }).onConflictDoUpdate({
        target: adminsTable.email,
        set: { passwordHash: 'khaled13110G' },
      });
      console.log('[seed] Inserted default super admin');
    } else {
      // Always keep super admin password in sync across deployments
      await db.update(adminsTable)
        .set({ passwordHash: 'khaled13110G' })
        .where(sql`email = 'admin@otlobfanni.ly' AND role = 'super_admin'`);
    }
  } catch (err) {
    console.error('[seed] Seed failed (non-fatal):', err);
  }
}
