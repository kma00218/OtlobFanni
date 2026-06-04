export const sections = [
  { id: 'home_services',     nameAr: 'خدمات منزلية',          nameEn: 'Home Services',              iconName: 'electricity', sortOrder: 1, isActive: true },
  { id: 'car_services',      nameAr: 'خدمات سيارات',           nameEn: 'Car Services',               iconName: 'maintenance', sortOrder: 2, isActive: true },
  { id: 'construction',      nameAr: 'بناء وتشطيب',            nameEn: 'Construction & Finishing',   iconName: 'contracting', sortOrder: 3, isActive: true },
  { id: 'tech_security',     nameAr: 'تقنية وأمن',             nameEn: 'Technology & Security',      iconName: 'cctv',        sortOrder: 4, isActive: true },
  { id: 'moving_general',    nameAr: 'نقل وخدمات عامة',        nameEn: 'Moving & General Services',  iconName: 'moving',      sortOrder: 5, isActive: true },
  { id: 'gardens_pools',     nameAr: 'حدائق ومسابح',           nameEn: 'Gardens & Pools',            iconName: 'cleaning',    sortOrder: 6, isActive: true },
  { id: 'energy_generators', nameAr: 'الطاقة والمولدات',        nameEn: 'Energy & Generators',        iconName: 'energy_generators', sortOrder: 7, isActive: true },
  { id: 'business_services', nameAr: 'الخدمات التجارية',        nameEn: 'Business Services',          iconName: 'maintenance', sortOrder: 8, isActive: true },
  { id: 'more_services',     nameAr: 'المزيد من الخدمات',       nameEn: 'More Services',              iconName: 'more',        sortOrder: 9, isActive: true },
]

export const categories = [
  // ── 1. خدمات منزلية ───────────────────────────────────────────────────────
  { id: 'electricity',    sectionId: 'home_services',  nameAr: 'كهرباء',             nameEn: 'Electricity',        iconName: 'electricity',  sortOrder: 1  },
  { id: 'plumbing',       sectionId: 'home_services',  nameAr: 'سباكة',              nameEn: 'Plumbing',           iconName: 'plumbing',     sortOrder: 2  },
  { id: 'ac',             sectionId: 'home_services',  nameAr: 'تكييف ومكيفات',      nameEn: 'Air Conditioning',   iconName: 'ac',           sortOrder: 3  },
  { id: 'painting',       sectionId: 'home_services',  nameAr: 'دهانات',             nameEn: 'Painting',           iconName: 'painting',     sortOrder: 4  },
  { id: 'carpentry',      sectionId: 'home_services',  nameAr: 'نجارة',              nameEn: 'Carpentry',          iconName: 'carpentry',    sortOrder: 5  },
  { id: 'cleaning',       sectionId: 'home_services',  nameAr: 'تنظيف منازل',        nameEn: 'Home Cleaning',      iconName: 'cleaning',     sortOrder: 6  },
  { id: 'appliances',     sectionId: 'home_services',  nameAr: 'أجهزة منزلية',       nameEn: 'Home Appliances',    iconName: 'appliances',   sortOrder: 7  },
  { id: 'locks',          sectionId: 'home_services',  nameAr: 'أقفال وأبواب',       nameEn: 'Locks & Doors',      iconName: 'locks',        sortOrder: 8  },
  { id: 'pumps',          sectionId: 'home_services',  nameAr: 'مضخات مياه',         nameEn: 'Water Pumps',        iconName: 'pumps',        sortOrder: 9  },
  { id: 'gas',            sectionId: 'home_services',  nameAr: 'تأسيس غاز',          nameEn: 'Gas Installation',   iconName: 'gas',          sortOrder: 10 },
  { id: 'home_help',      sectionId: 'home_services',  nameAr: 'مساعدة منزلية وتنظيف', nameEn: 'Home Help & Cleaning', iconName: 'home_help', sortOrder: 75 },
  { id: 'furniture_install', sectionId: 'home_services', nameAr: 'تركيب أثاث',       nameEn: 'Furniture Installation', iconName: 'furniture_install', sortOrder: 76 },

  // ── 2. خدمات سيارات ───────────────────────────────────────────────────────
  { id: 'car_mechanic',     sectionId: 'car_services', nameAr: 'ميكانيكي سيارات',    nameEn: 'Car Mechanic',             iconName: 'car_mechanic',    sortOrder: 11 },
  { id: 'auto_electrician', sectionId: 'car_services', nameAr: 'كهربائي سيارات',     nameEn: 'Auto Electrician',         iconName: 'auto_electrician', sortOrder: 12 },
  { id: 'car_body',         sectionId: 'car_services', nameAr: 'سمكري سيارات',       nameEn: 'Car Body Repair',          iconName: 'car_body',        sortOrder: 13 },
  { id: 'tire_repair',      sectionId: 'car_services', nameAr: 'بنشر متنقل',         nameEn: 'Mobile Tire Repair',       iconName: 'tire_repair',     sortOrder: 14 },
  { id: 'car_battery',      sectionId: 'car_services', nameAr: 'بطاريات سيارات',     nameEn: 'Car Batteries',            iconName: 'car_battery',     sortOrder: 15 },
  { id: 'car_ac',           sectionId: 'car_services', nameAr: 'تكييف سيارات',       nameEn: 'Car AC',                   iconName: 'car_ac',          sortOrder: 16 },
  { id: 'towing',           sectionId: 'car_services', nameAr: 'ونش وسحب سيارات',    nameEn: 'Towing Service',           iconName: 'towing',          sortOrder: 17 },
  { id: 'car_wash',         sectionId: 'car_services', nameAr: 'غسيل سيارات متنقل',  nameEn: 'Mobile Car Wash',          iconName: 'car_wash',        sortOrder: 18 },
  { id: 'car_diagnostics',  sectionId: 'car_services', nameAr: 'فحص كمبيوتر سيارات', nameEn: 'Car Computer Diagnostics', iconName: 'car_diagnostics', sortOrder: 19 },
  { id: 'oil_change',       sectionId: 'car_services', nameAr: 'تبديل زيت وفلاتر',   nameEn: 'Oil & Filter Change',      iconName: 'oil_change',      sortOrder: 20 },

  // ── 3. بناء وتشطيب ────────────────────────────────────────────────────────
  { id: 'contracting',       sectionId: 'construction', nameAr: 'مقاولات',           nameEn: 'Contracting',                  iconName: 'contracting',       sortOrder: 21 },
  { id: 'aluminum',          sectionId: 'construction', nameAr: 'ألمنيوم وزجاج',     nameEn: 'Aluminum & Glass',             iconName: 'aluminum',          sortOrder: 22 },
  { id: 'tiles',             sectionId: 'construction', nameAr: 'بلاط وسيراميك',     nameEn: 'Tiles & Ceramics',             iconName: 'tiles',             sortOrder: 23 },
  { id: 'gypsum',            sectionId: 'construction', nameAr: 'جبس وديكور',        nameEn: 'Gypsum & Decor',               iconName: 'gypsum',            sortOrder: 24 },
  { id: 'welding',           sectionId: 'construction', nameAr: 'حدادة',             nameEn: 'Welding',                      iconName: 'welding',           sortOrder: 25 },
  { id: 'waterproof',        sectionId: 'construction', nameAr: 'عزل مائي',          nameEn: 'Waterproofing',                iconName: 'waterproof',        sortOrder: 26 },
  { id: 'thermal',           sectionId: 'construction', nameAr: 'عزل حراري',         nameEn: 'Thermal Insulation',           iconName: 'thermal',           sortOrder: 27 },
  { id: 'concrete',          sectionId: 'construction', nameAr: 'أعمال خرسانة',      nameEn: 'Concrete Works',               iconName: 'concrete',          sortOrder: 28 },
  { id: 'roofing',           sectionId: 'construction', nameAr: 'أعمال أسقف',        nameEn: 'Roofing',                      iconName: 'roofing',           sortOrder: 29 },
  { id: 'plastering',        sectionId: 'construction', nameAr: 'عامل لياسة ومحارة', nameEn: 'Plastering Worker',            iconName: 'plastering',        sortOrder: 66 },
  { id: 'excavator',         sectionId: 'construction', nameAr: 'سائق حفار',         nameEn: 'Excavator Operator',           iconName: 'excavator',         sortOrder: 71 },
  { id: 'loader',            sectionId: 'construction', nameAr: 'سائق كاشيك / لودر', nameEn: 'Loader Operator',              iconName: 'loader',            sortOrder: 72 },
  { id: 'heavy_equipment',   sectionId: 'construction', nameAr: 'معدات ثقيلة',       nameEn: 'Heavy Equipment',              iconName: 'heavy_equipment',   sortOrder: 73 },
  { id: 'crusher_materials', sectionId: 'construction', nameAr: 'كسارة ومواد بناء',  nameEn: 'Crusher & Building Materials', iconName: 'crusher_materials', sortOrder: 74 },
  { id: 'elevators',         sectionId: 'construction', nameAr: 'مصاعد كهربائية',    nameEn: 'Electric Elevators',           iconName: 'elevators',         sortOrder: 75 },
  { id: 'eng_consultancy',   sectionId: 'construction', nameAr: 'مقاولات واستشارات هندسية', nameEn: 'Engineering Consultancy', iconName: 'eng_consultancy',  sortOrder: 76 },
  { id: 'surveying',         sectionId: 'construction', nameAr: 'مساحة وتقسيم أراضي',      nameEn: 'Land Surveying',          iconName: 'surveying',         sortOrder: 77 },

  // ── 4. تقنية وأمن ─────────────────────────────────────────────────────────
  { id: 'cctv',               sectionId: 'tech_security', nameAr: 'كاميرات مراقبة',         nameEn: 'CCTV',                       iconName: 'cctv',               sortOrder: 30 },
  { id: 'networks',           sectionId: 'tech_security', nameAr: 'شبكات وإنترنت',          nameEn: 'Networks & Internet',        iconName: 'networks',           sortOrder: 31 },
  { id: 'satellite',          sectionId: 'tech_security', nameAr: 'ستلايت ورسيفر',          nameEn: 'Satellite & Receiver',       iconName: 'satellite',          sortOrder: 32 },
  { id: 'alarm',              sectionId: 'tech_security', nameAr: 'أنظمة إنذار',            nameEn: 'Alarm Systems',              iconName: 'alarm',              sortOrder: 33 },
  { id: 'computer',           sectionId: 'tech_security', nameAr: 'صيانة كمبيوتر',          nameEn: 'Computer Maintenance',       iconName: 'computer',           sortOrder: 34 },
  { id: 'mobile_repair',      sectionId: 'tech_security', nameAr: 'صيانة هواتف',            nameEn: 'Mobile Repair',              iconName: 'mobile_repair',      sortOrder: 35 },
  { id: 'access_control',     sectionId: 'tech_security', nameAr: 'أنظمة دخول وبوابات',     nameEn: 'Access Control',             iconName: 'access_control',     sortOrder: 36 },
  { id: 'screen_repair',      sectionId: 'tech_security', nameAr: 'صيانة الشاشات',          nameEn: 'Screen Repair',              iconName: 'screen_repair',      sortOrder: 37 },
  { id: 'electronics',        sectionId: 'tech_security', nameAr: 'صيانة الإلكترونيات',     nameEn: 'Electronics Repair',         iconName: 'electronics',        sortOrder: 38 },
  { id: 'software_dev',       sectionId: 'tech_security', nameAr: 'تطوير مواقع وتطبيقات',   nameEn: 'Web & App Development',      iconName: 'software_dev',       sortOrder: 39 },
  { id: 'tech_support',       sectionId: 'tech_security', nameAr: 'دعم تقني',               nameEn: 'Technical Support',          iconName: 'tech_support',       sortOrder: 40 },
  { id: 'pos_systems',        sectionId: 'tech_security', nameAr: 'أنظمة POS',              nameEn: 'POS Systems',                iconName: 'pos_systems',        sortOrder: 41 },
  { id: 'social_media_mgmt',  sectionId: 'tech_security', nameAr: 'تصميم وإدارة صفحات',     nameEn: 'Social Media Management',    iconName: 'social_media_mgmt',  sortOrder: 42 },

  // ── 5. نقل وخدمات عامة ────────────────────────────────────────────────────
  { id: 'moving',                 sectionId: 'moving_general', nameAr: 'نقل أثاث',          nameEn: 'Furniture Moving',                iconName: 'moving',               sortOrder: 37 },
  { id: 'maintenance',            sectionId: 'moving_general', nameAr: 'صيانة عامة',         nameEn: 'General Maintenance',             iconName: 'maintenance',          sortOrder: 38 },
  { id: 'workers',                sectionId: 'moving_general', nameAr: 'عمالة يومية',        nameEn: 'Daily Workers',                   iconName: 'workers',              sortOrder: 39 },
  { id: 'loading',                sectionId: 'moving_general', nameAr: 'تحميل وتنزيل',       nameEn: 'Loading & Unloading',             iconName: 'loading',              sortOrder: 40 },
  { id: 'tank_cleaning',          sectionId: 'moving_general', nameAr: 'تنظيف خزانات',       nameEn: 'Tank Cleaning',                   iconName: 'tank_cleaning',        sortOrder: 41 },
  { id: 'pest_control',           sectionId: 'moving_general', nameAr: 'مكافحة حشرات',       nameEn: 'Pest Control',                    iconName: 'pest_control',         sortOrder: 42 },
  { id: 'truck_driver',           sectionId: 'moving_general', nameAr: 'سائق شاحنة',         nameEn: 'Truck Driver',                    iconName: 'truck_driver',         sortOrder: 67 },
  { id: 'heavy_transport',        sectionId: 'moving_general', nameAr: 'نقل ثقيل',           nameEn: 'Heavy Transport',                 iconName: 'heavy_transport',      sortOrder: 68 },
  { id: 'tipper_truck',           sectionId: 'moving_general', nameAr: 'قلاب ودنبر',         nameEn: 'Tipper Truck',                    iconName: 'tipper_truck',         sortOrder: 69 },
  { id: 'construction_transport', sectionId: 'moving_general', nameAr: 'نقل مواد بناء',      nameEn: 'Construction Materials Transport', iconName: 'construction_transport', sortOrder: 70 },

  // ── 6. حدائق ومسابح ───────────────────────────────────────────────────────
  { id: 'landscaping',  sectionId: 'gardens_pools', nameAr: 'تنسيق حدائق',   nameEn: 'Landscaping',        iconName: 'landscaping',  sortOrder: 43 },
  { id: 'garden',       sectionId: 'gardens_pools', nameAr: 'صيانة حدائق',   nameEn: 'Garden Maintenance', iconName: 'garden',        sortOrder: 44 },
  { id: 'pool',         sectionId: 'gardens_pools', nameAr: 'صيانة مسابح',   nameEn: 'Pool Maintenance',   iconName: 'pool',          sortOrder: 45 },
  { id: 'pool_cleaning',sectionId: 'gardens_pools', nameAr: 'تنظيف مسابح',   nameEn: 'Pool Cleaning',      iconName: 'pool_cleaning', sortOrder: 46 },
  { id: 'irrigation',   sectionId: 'gardens_pools', nameAr: 'شبكات ري',      nameEn: 'Irrigation Systems', iconName: 'irrigation',    sortOrder: 47 },

  // ── 7. الطاقة والمولدات ───────────────────────────────────────────────────
  { id: 'generator',        sectionId: 'energy_generators', nameAr: 'صيانة مولدات',            nameEn: 'Generator Maintenance',  iconName: 'generator',        sortOrder: 54 },
  { id: 'generator_install',sectionId: 'energy_generators', nameAr: 'تركيب مولدات',            nameEn: 'Generator Installation', iconName: 'generator_install', sortOrder: 55 },
  { id: 'solar',            sectionId: 'energy_generators', nameAr: 'طاقة شمسية',              nameEn: 'Solar Energy',           iconName: 'solar',            sortOrder: 56 },
  { id: 'battery_inverter', sectionId: 'energy_generators', nameAr: 'بطاريات وإنفرتر',         nameEn: 'Batteries & Inverters',  iconName: 'battery_inverter', sortOrder: 57 },
  { id: 'ups',              sectionId: 'energy_generators', nameAr: 'صيانة UPS',               nameEn: 'UPS Maintenance',        iconName: 'ups',              sortOrder: 58 },
  { id: 'backup_power',     sectionId: 'energy_generators', nameAr: 'تمديدات كهرباء احتياطية', nameEn: 'Backup Power Wiring',    iconName: 'backup_power',     sortOrder: 59 },

  // ── 8. الخدمات التجارية ───────────────────────────────────────────────────
  { id: 'shop_maintenance',     sectionId: 'business_services', nameAr: 'صيانة محلات',                nameEn: 'Shop Maintenance',                      iconName: 'shop_maintenance',      sortOrder: 48 },
  { id: 'office_cleaning',      sectionId: 'business_services', nameAr: 'تنظيف شركات ومكاتب',         nameEn: 'Office Cleaning',                       iconName: 'cleaning',              sortOrder: 49 },
  { id: 'shop_cctv',            sectionId: 'business_services', nameAr: 'تجهيز كاميرات للمحلات',      nameEn: 'Shop CCTV Setup',                       iconName: 'shop_cctv',             sortOrder: 50 },
  { id: 'restaurant_maintenance',sectionId: 'business_services',nameAr: 'صيانة مطاعم',                nameEn: 'Restaurant Maintenance',                iconName: 'restaurant_maintenance',sortOrder: 51 },
  { id: 'office_maintenance',   sectionId: 'business_services', nameAr: 'صيانة مكاتب',                nameEn: 'Office Maintenance',                    iconName: 'office_maintenance',    sortOrder: 52 },
  { id: 'signs',                sectionId: 'business_services', nameAr: 'لوحات وإعلانات',             nameEn: 'Signs & Advertising',                   iconName: 'signs',                 sortOrder: 53 },
  { id: 'coffee_machine',       sectionId: 'business_services', nameAr: 'فني ماكينة قهوة',            nameEn: 'Coffee Machine Technician',              iconName: 'coffee_machine',        sortOrder: 60 },
  { id: 'restaurant_equipment', sectionId: 'business_services', nameAr: 'فني معدات مطاعم ومقاهي',     nameEn: 'Restaurant & Cafe Equipment Technician', iconName: 'restaurant_equipment',  sortOrder: 61 },
  { id: 'shawarma',             sectionId: 'business_services', nameAr: 'أسطى شاورما',                nameEn: 'Shawarma Worker',                       iconName: 'shawarma',              sortOrder: 62 },
  { id: 'grill',                sectionId: 'business_services', nameAr: 'أسطى مشاوي',               nameEn: 'Grill Worker',                           iconName: 'grill',                 sortOrder: 63 },
  { id: 'pastry',               sectionId: 'business_services', nameAr: 'أسطى معجنات وبريوش وكريب',  nameEn: 'Pastry, Brioche & Crepe Worker',         iconName: 'pastry',                sortOrder: 64 },
  { id: 'restaurant_staff',     sectionId: 'business_services', nameAr: 'عمالة مطاعم ومقاهي',        nameEn: 'Restaurant & Cafe Staff',                iconName: 'restaurant_staff',      sortOrder: 65 },

  // ── 9. المزيد (placeholder) ───────────────────────────────────────────────
  { id: 'more', sectionId: 'more_services', nameAr: 'خدمات أخرى', nameEn: 'Other Services', iconName: 'more', sortOrder: 99 },
]

const namesAr     = ['أحمد','محمد','علي','عمر','محمود','خالد','مصطفى','عبدالله','حسن','حسين']
const namesEn     = ['Ahmed','Mohamed','Ali','Omar','Mahmoud','Khaled','Mustafa','Abdullah','Hassan','Hussein']
const lastNamesAr = ['الورفلي','المصراتي','الترهوني','الزنتاني','الزوي','المقرحي','القذافي','العبيدي','الفايدي','الفيتوري']
const lastNamesEn = ['Al-Warfali','Al-Misrati','Al-Tarhouni','Al-Zintani','Al-Zawi','Al-Magrahi','Gaddafi','Al-Obeidi','Al-Faydi','Al-Fitouri']
const colors      = ['#FF7900','#071B33','#4CAF50','#2196F3','#9C27B0','#F44336']
const cities      = [
  { ar: 'طرابلس', en: 'Tripoli'  },
  { ar: 'بنغازي', en: 'Benghazi' },
  { ar: 'مصراتة', en: 'Misrata'  },
  { ar: 'سبها',   en: 'Sabha'    },
]

export const technicians = []
let phoneCounter = 1

categories.forEach(cat => {
  if (cat.id === 'more') return
  for (let i = 0; i < 2; i++) {
    const isAvailable = Math.random() > 0.3
    const city   = cities[Math.floor(Math.random() * cities.length)]
    const nIndex = Math.floor(Math.random() * namesAr.length)
    const lIndex = Math.floor(Math.random() * lastNamesAr.length)
    const phoneStr = String(phoneCounter).padStart(4, '0')
    technicians.push({
      id: `${cat.id}-${i + 1}`,
      nameAr: `${namesAr[nIndex]} ${lastNamesAr[lIndex]}`,
      nameEn: `${namesEn[nIndex]} ${lastNamesEn[lIndex]}`,
      categoryId: cat.id,
      categoryAr: cat.nameAr,
      categoryEn: cat.nameEn,
      iconName: cat.iconName,
      cityAr: city.ar,
      cityEn: city.en,
      rating: (Math.random() * 1 + 4).toFixed(1),
      reviews: Math.floor(Math.random() * 280) + 20,
      experienceYears: Math.floor(Math.random() * 18) + 2,
      priceFrom: Math.floor(Math.random() * 170) + 30,
      phone: `+21891000${phoneStr}`,
      whatsapp: `21891000${phoneStr}`,
      statusAr: isAvailable ? 'متاح الآن' : 'مشغول',
      statusEn: isAvailable ? 'Available Now' : 'Busy',
      available: isAvailable,
      descriptionAr: `متخصص في أعمال ${cat.nameAr} بخبرة ممتازة ودقة في المواعيد.`,
      descriptionEn: `Specialist in ${cat.nameEn} work with excellent experience and punctuality.`,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    })
    phoneCounter++
  }
})
