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

// Base categories — exactly matching services.js
const BASE_CATEGORIES = [
  // ── Home Services ────────────────────────────────────────────────────────────
  { id: 'electricity',          nameAr: 'كهرباء',                          nameEn: 'Electricity',                            iconName: 'electricity',          sortOrder: 1,  isActive: true, sectionId: 'home_services'     },
  { id: 'plumbing',             nameAr: 'سباكة',                           nameEn: 'Plumbing',                               iconName: 'plumbing',             sortOrder: 2,  isActive: true, sectionId: 'home_services'     },
  { id: 'ac',                   nameAr: 'تكييف ومكيفات',                   nameEn: 'Air Conditioning',                       iconName: 'ac',                   sortOrder: 3,  isActive: true, sectionId: 'home_services'     },
  { id: 'painting',             nameAr: 'دهانات',                          nameEn: 'Painting',                               iconName: 'painting',             sortOrder: 4,  isActive: true, sectionId: 'home_services'     },
  { id: 'carpentry',            nameAr: 'نجارة',                           nameEn: 'Carpentry',                              iconName: 'carpentry',            sortOrder: 5,  isActive: true, sectionId: 'home_services'     },
  { id: 'cleaning',             nameAr: 'تنظيف منازل',                     nameEn: 'Home Cleaning',                          iconName: 'cleaning',             sortOrder: 6,  isActive: true, sectionId: 'home_services'     },
  { id: 'appliances',           nameAr: 'أجهزة منزلية',                    nameEn: 'Home Appliances',                        iconName: 'appliances',           sortOrder: 7,  isActive: true, sectionId: 'home_services'     },
  // ── Tech & Security ──────────────────────────────────────────────────────────
  { id: 'cctv',                 nameAr: 'كاميرات مراقبة',                  nameEn: 'CCTV',                                   iconName: 'cctv',                 sortOrder: 30, isActive: true, sectionId: 'tech_security'     },
  { id: 'networks',             nameAr: 'شبكات وإنترنت',                   nameEn: 'Networks & Internet',                    iconName: 'networks',             sortOrder: 31, isActive: true, sectionId: 'tech_security'     },
  // ── Moving & General ─────────────────────────────────────────────────────────
  { id: 'moving',               nameAr: 'نقل أثاث',                        nameEn: 'Furniture Moving',                       iconName: 'moving',               sortOrder: 37, isActive: true, sectionId: 'moving_general'    },
  { id: 'maintenance',          nameAr: 'صيانة عامة',                      nameEn: 'General Maintenance',                    iconName: 'maintenance',          sortOrder: 38, isActive: true, sectionId: 'moving_general'    },
  // ── Construction ─────────────────────────────────────────────────────────────
  { id: 'welding',              nameAr: 'حدادة',                           nameEn: 'Welding',                                iconName: 'welding',              sortOrder: 25, isActive: true, sectionId: 'construction'      },
  { id: 'plastering',           nameAr: 'عامل لياسة ومحارة',               nameEn: 'Plastering Worker',                      iconName: 'plastering',           sortOrder: 54, isActive: true, sectionId: 'construction'      },
  // ── Business Services ────────────────────────────────────────────────────────
  { id: 'coffee_machine',       nameAr: 'فني ماكينة قهوة',                 nameEn: 'Coffee Machine Technician',              iconName: 'coffee_machine',       sortOrder: 60, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_equipment', nameAr: 'فني معدات مطاعم ومقاهي',          nameEn: 'Restaurant & Cafe Equipment Technician', iconName: 'restaurant_equipment', sortOrder: 61, isActive: true, sectionId: 'business_services' },
  { id: 'shawarma',             nameAr: 'أسطى شاورما',                     nameEn: 'Shawarma Worker',                        iconName: 'shawarma',             sortOrder: 62, isActive: true, sectionId: 'business_services' },
  { id: 'grill',                nameAr: 'أسطى مشاوي',                      nameEn: 'Grill Worker',                           iconName: 'grill',                sortOrder: 63, isActive: true, sectionId: 'business_services' },
  { id: 'pastry',               nameAr: 'أسطى معجنات وبريوش وكريب',        nameEn: 'Pastry, Brioche & Crepe Worker',         iconName: 'pastry',               sortOrder: 64, isActive: true, sectionId: 'business_services' },
  { id: 'restaurant_staff',     nameAr: 'عمالة مطاعم ومقاهي',              nameEn: 'Restaurant & Cafe Staff',                iconName: 'restaurant_staff',     sortOrder: 65, isActive: true, sectionId: 'business_services' },
];

// All remaining categories — exactly matching services.js
const EXTRA_CATEGORIES = [
  // ── 1. Home Services ─────────────────────────────────────────────────────────
  { id: 'locks',                nameAr: 'أقفال وأبواب',                    nameEn: 'Locks & Doors',                          iconName: 'locks',                sortOrder: 8,  isActive: true, sectionId: 'home_services'      },
  { id: 'pumps',                nameAr: 'مضخات مياه',                      nameEn: 'Water Pumps',                            iconName: 'pumps',                sortOrder: 9,  isActive: true, sectionId: 'home_services'      },
  { id: 'gas',                  nameAr: 'تأسيس غاز',                       nameEn: 'Gas Installation',                       iconName: 'gas',                  sortOrder: 10, isActive: true, sectionId: 'home_services'      },
  { id: 'home_help',            nameAr: 'مساعدة منزلية وتنظيف',            nameEn: 'Home Help & Cleaning',                   iconName: 'home_help',            sortOrder: 75, isActive: true, sectionId: 'home_services'      },
  { id: 'furniture_install',    nameAr: 'تركيب أثاث',                       nameEn: 'Furniture Installation',                 iconName: 'furniture_install',    sortOrder: 76, isActive: true, sectionId: 'home_services'      },

  // ── 2. Car Services ───────────────────────────────────────────────────────────
  { id: 'car_mechanic',         nameAr: 'ميكانيكي سيارات',                 nameEn: 'Car Mechanic',                           iconName: 'car_mechanic',         sortOrder: 11, isActive: true, sectionId: 'car_services'        },
  { id: 'auto_electrician',     nameAr: 'كهربائي سيارات',                  nameEn: 'Auto Electrician',                       iconName: 'auto_electrician',     sortOrder: 12, isActive: true, sectionId: 'car_services'        },
  { id: 'car_body',             nameAr: 'سمكري سيارات',                    nameEn: 'Car Body Repair',                        iconName: 'car_body',             sortOrder: 13, isActive: true, sectionId: 'car_services'        },
  { id: 'tire_repair',          nameAr: 'بنشر متنقل',                      nameEn: 'Mobile Tire Repair',                     iconName: 'tire_repair',          sortOrder: 14, isActive: true, sectionId: 'car_services'        },
  { id: 'car_battery',          nameAr: 'بطاريات سيارات',                  nameEn: 'Car Batteries',                          iconName: 'car_battery',          sortOrder: 15, isActive: true, sectionId: 'car_services'        },
  { id: 'car_ac',               nameAr: 'تكييف سيارات',                    nameEn: 'Car AC',                                 iconName: 'car_ac',               sortOrder: 16, isActive: true, sectionId: 'car_services'        },
  { id: 'towing',               nameAr: 'ونش وسحب سيارات',                 nameEn: 'Towing Service',                         iconName: 'towing',               sortOrder: 17, isActive: true, sectionId: 'car_services'        },
  { id: 'car_wash',             nameAr: 'غسيل سيارات متنقل',               nameEn: 'Mobile Car Wash',                        iconName: 'car_wash',             sortOrder: 18, isActive: true, sectionId: 'car_services'        },
  { id: 'car_diagnostics',      nameAr: 'فحص كمبيوتر سيارات',              nameEn: 'Car Computer Diagnostics',               iconName: 'car_diagnostics',      sortOrder: 19, isActive: true, sectionId: 'car_services'        },
  { id: 'oil_change',           nameAr: 'تبديل زيت وفلاتر',                nameEn: 'Oil & Filter Change',                    iconName: 'oil_change',           sortOrder: 20, isActive: true, sectionId: 'car_services'        },

  // ── 3. Construction & Finishing ───────────────────────────────────────────────
  { id: 'contracting',          nameAr: 'مقاولات',                         nameEn: 'Contracting',                            iconName: 'contracting',          sortOrder: 21, isActive: true, sectionId: 'construction'        },
  { id: 'aluminum',             nameAr: 'ألمنيوم وزجاج',                   nameEn: 'Aluminum & Glass',                       iconName: 'aluminum',             sortOrder: 22, isActive: true, sectionId: 'construction'        },
  { id: 'tiles',                nameAr: 'بلاط وسيراميك',                   nameEn: 'Tiles & Ceramics',                       iconName: 'tiles',                sortOrder: 23, isActive: true, sectionId: 'construction'        },
  { id: 'gypsum',               nameAr: 'جبس وديكور',                      nameEn: 'Gypsum & Decor',                         iconName: 'gypsum',               sortOrder: 24, isActive: true, sectionId: 'construction'        },
  { id: 'waterproof',           nameAr: 'عزل مائي',                        nameEn: 'Waterproofing',                          iconName: 'waterproof',           sortOrder: 26, isActive: true, sectionId: 'construction'        },
  { id: 'thermal',              nameAr: 'عزل حراري',                       nameEn: 'Thermal Insulation',                     iconName: 'thermal',              sortOrder: 27, isActive: true, sectionId: 'construction'        },
  { id: 'concrete',             nameAr: 'أعمال خرسانة',                    nameEn: 'Concrete Works',                         iconName: 'concrete',             sortOrder: 28, isActive: true, sectionId: 'construction'        },
  { id: 'roofing',              nameAr: 'أعمال أسقف',                      nameEn: 'Roofing',                                iconName: 'roofing',              sortOrder: 29, isActive: true, sectionId: 'construction'        },
  { id: 'excavator',            nameAr: 'سائق حفار',                       nameEn: 'Excavator Operator',                     iconName: 'excavator',            sortOrder: 71, isActive: true, sectionId: 'construction'        },
  { id: 'loader',               nameAr: 'سائق كاشيك / لودر',               nameEn: 'Loader Operator',                        iconName: 'loader',               sortOrder: 72, isActive: true, sectionId: 'construction'        },
  { id: 'heavy_equipment',      nameAr: 'معدات ثقيلة',                     nameEn: 'Heavy Equipment',                        iconName: 'heavy_equipment',      sortOrder: 73, isActive: true, sectionId: 'construction'        },
  { id: 'crusher_materials',    nameAr: 'كسارة ومواد بناء',                nameEn: 'Crusher & Building Materials',           iconName: 'crusher_materials',    sortOrder: 74, isActive: true, sectionId: 'construction'        },
  { id: 'elevators',            nameAr: 'مصاعد كهربائية',                  nameEn: 'Electric Elevators',                     iconName: 'elevators',            sortOrder: 75, isActive: true, sectionId: 'construction'        },
  { id: 'surveying',            nameAr: 'مساحة وتقسيم أراضي',              nameEn: 'Land Surveying',                         iconName: 'surveying',            sortOrder: 77, isActive: true, sectionId: 'construction'        },

  // ── 4. Tech & Security ────────────────────────────────────────────────────────
  { id: 'satellite',            nameAr: 'ستلايت ورسيفر',                   nameEn: 'Satellite & Receiver',                   iconName: 'satellite',            sortOrder: 32, isActive: true, sectionId: 'tech_security'       },
  { id: 'alarm',                nameAr: 'أنظمة إنذار',                     nameEn: 'Alarm Systems',                          iconName: 'alarm',                sortOrder: 33, isActive: true, sectionId: 'tech_security'       },
  { id: 'computer',             nameAr: 'صيانة كمبيوتر',                   nameEn: 'Computer Maintenance',                   iconName: 'computer',             sortOrder: 34, isActive: true, sectionId: 'tech_security'       },
  { id: 'mobile_repair',        nameAr: 'صيانة هواتف',                     nameEn: 'Mobile Repair',                          iconName: 'mobile_repair',        sortOrder: 35, isActive: true, sectionId: 'tech_security'       },
  { id: 'access_control',       nameAr: 'أنظمة دخول وبوابات',              nameEn: 'Access Control',                         iconName: 'access_control',       sortOrder: 36, isActive: true, sectionId: 'tech_security'       },
  { id: 'screen_repair',        nameAr: 'صيانة الشاشات',                   nameEn: 'Screen Repair',                          iconName: 'screen_repair',        sortOrder: 37, isActive: true, sectionId: 'tech_security'       },
  { id: 'electronics',          nameAr: 'صيانة الإلكترونيات',              nameEn: 'Electronics Repair',                     iconName: 'electronics',          sortOrder: 38, isActive: true, sectionId: 'tech_security'       },
  { id: 'software_dev',         nameAr: 'تطوير مواقع وتطبيقات',            nameEn: 'Web & App Development',                  iconName: 'software_dev',         sortOrder: 39, isActive: true, sectionId: 'tech_security'       },
  { id: 'tech_support',         nameAr: 'دعم تقني',                        nameEn: 'Technical Support',                      iconName: 'tech_support',         sortOrder: 40, isActive: true, sectionId: 'tech_security'       },
  { id: 'pos_systems',          nameAr: 'أنظمة POS',                       nameEn: 'POS Systems',                            iconName: 'pos_systems',          sortOrder: 41, isActive: true, sectionId: 'tech_security'       },
  { id: 'social_media_mgmt',    nameAr: 'تصميم وإدارة صفحات',              nameEn: 'Social Media Management',                iconName: 'social_media_mgmt',    sortOrder: 42, isActive: true, sectionId: 'tech_security'       },

  // ── 5. Moving & General Services ──────────────────────────────────────────────
  { id: 'workers',              nameAr: 'عمالة يومية',                     nameEn: 'Daily Workers',                          iconName: 'workers',              sortOrder: 39, isActive: true, sectionId: 'moving_general'     },
  { id: 'loading',              nameAr: 'تحميل وتنزيل',                    nameEn: 'Loading & Unloading',                    iconName: 'loading',              sortOrder: 40, isActive: true, sectionId: 'moving_general'     },
  { id: 'tank_cleaning',        nameAr: 'تنظيف خزانات',                    nameEn: 'Tank Cleaning',                          iconName: 'tank_cleaning',        sortOrder: 41, isActive: true, sectionId: 'moving_general'     },
  { id: 'pest_control',         nameAr: 'مكافحة حشرات',                    nameEn: 'Pest Control',                           iconName: 'pest_control',         sortOrder: 42, isActive: true, sectionId: 'moving_general'     },
  { id: 'truck_driver',         nameAr: 'سائق شاحنة',                      nameEn: 'Truck Driver',                           iconName: 'truck_driver',         sortOrder: 67, isActive: true, sectionId: 'moving_general'     },
  { id: 'heavy_transport',      nameAr: 'نقل ثقيل',                        nameEn: 'Heavy Transport',                        iconName: 'heavy_transport',      sortOrder: 68, isActive: true, sectionId: 'moving_general'     },
  { id: 'tipper_truck',         nameAr: 'قلاب ودنبر',                      nameEn: 'Tipper Truck',                           iconName: 'tipper_truck',         sortOrder: 69, isActive: true, sectionId: 'moving_general'     },
  { id: 'construction_transport',nameAr: 'نقل مواد بناء',                  nameEn: 'Construction Materials Transport',       iconName: 'construction_transport', sortOrder: 70, isActive: true, sectionId: 'moving_general'   },

  // ── 6. Gardens & Pools ────────────────────────────────────────────────────────
  { id: 'landscaping',          nameAr: 'تنسيق حدائق',                     nameEn: 'Landscaping',                            iconName: 'landscaping',          sortOrder: 43, isActive: true, sectionId: 'gardens_pools'      },
  { id: 'garden',               nameAr: 'صيانة حدائق',                     nameEn: 'Garden Maintenance',                     iconName: 'garden',               sortOrder: 44, isActive: true, sectionId: 'gardens_pools'      },
  { id: 'pool',                 nameAr: 'صيانة مسابح',                     nameEn: 'Pool Maintenance',                       iconName: 'pool',                 sortOrder: 45, isActive: true, sectionId: 'gardens_pools'      },
  { id: 'pool_cleaning',        nameAr: 'تنظيف مسابح',                     nameEn: 'Pool Cleaning',                          iconName: 'pool_cleaning',        sortOrder: 46, isActive: true, sectionId: 'gardens_pools'      },
  { id: 'irrigation',           nameAr: 'شبكات ري',                        nameEn: 'Irrigation Systems',                     iconName: 'irrigation',           sortOrder: 47, isActive: true, sectionId: 'gardens_pools'      },

  // ── 7. Energy & Generators ────────────────────────────────────────────────────
  { id: 'generator',            nameAr: 'صيانة مولدات',                    nameEn: 'Generator Maintenance',                  iconName: 'generator',            sortOrder: 54, isActive: true, sectionId: 'energy_generators'  },
  { id: 'generator_install',    nameAr: 'تركيب مولدات',                    nameEn: 'Generator Installation',                 iconName: 'generator_install',    sortOrder: 55, isActive: true, sectionId: 'energy_generators'  },
  { id: 'solar',                nameAr: 'طاقة شمسية',                      nameEn: 'Solar Energy',                           iconName: 'solar',                sortOrder: 56, isActive: true, sectionId: 'energy_generators'  },
  { id: 'battery_inverter',     nameAr: 'بطاريات وإنفرتر',                 nameEn: 'Batteries & Inverters',                  iconName: 'battery_inverter',     sortOrder: 57, isActive: true, sectionId: 'energy_generators'  },
  { id: 'ups',                  nameAr: 'صيانة UPS',                       nameEn: 'UPS Maintenance',                        iconName: 'ups',                  sortOrder: 58, isActive: true, sectionId: 'energy_generators'  },
  { id: 'backup_power',         nameAr: 'تمديدات كهرباء احتياطية',         nameEn: 'Backup Power Wiring',                    iconName: 'backup_power',         sortOrder: 59, isActive: true, sectionId: 'energy_generators'  },

  // ── 8. Business Services ──────────────────────────────────────────────────────
  { id: 'shop_maintenance',     nameAr: 'صيانة محلات',                     nameEn: 'Shop Maintenance',                       iconName: 'shop_maintenance',     sortOrder: 48, isActive: true, sectionId: 'business_services'  },
  { id: 'office_cleaning',      nameAr: 'تنظيف شركات ومكاتب',              nameEn: 'Office Cleaning',                        iconName: 'cleaning',             sortOrder: 49, isActive: true, sectionId: 'business_services'  },
  { id: 'shop_cctv',            nameAr: 'تجهيز كاميرات للمحلات',           nameEn: 'Shop CCTV Setup',                        iconName: 'shop_cctv',            sortOrder: 50, isActive: true, sectionId: 'business_services'  },
  { id: 'restaurant_maintenance',nameAr: 'صيانة مطاعم',                    nameEn: 'Restaurant Maintenance',                 iconName: 'restaurant_maintenance',sortOrder:51, isActive: true, sectionId: 'business_services'  },
  { id: 'office_maintenance',   nameAr: 'صيانة مكاتب',                     nameEn: 'Office Maintenance',                     iconName: 'office_maintenance',   sortOrder: 52, isActive: true, sectionId: 'business_services'  },
  { id: 'signs',                nameAr: 'لوحات وإعلانات',                  nameEn: 'Signs & Advertising',                    iconName: 'signs',                sortOrder: 53, isActive: true, sectionId: 'business_services'  },
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

    // Hide legacy and renamed categories — keeps technician records intact.
    await db.execute(sql`
      UPDATE categories SET is_active = false
      WHERE id IN (
        'k1','k2','k3','k4','k5','k6','k7','k8','k9','k10','k11','k12','k13','k14','k15',
        'generators',
        'more_services',
        'custom_1780263635444',
        'custom_1780263637044'
      )
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

    // Remove obsolete categories that were retired from the directory
    await db.execute(sql`DELETE FROM categories WHERE id IN ('pipe_fittings')`);
    console.log('[seed] Removed obsolete categories (pipe_fittings)');

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
