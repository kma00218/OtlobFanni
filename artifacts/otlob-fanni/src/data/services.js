export const categories = [
  // --- الأساسية ---
  { id: 'electricity',    nameAr: 'كهرباء',             nameEn: 'Electricity',          iconName: 'electricity',        sortOrder: 1  },
  { id: 'plumbing',       nameAr: 'سباكة',              nameEn: 'Plumbing',             iconName: 'plumbing',           sortOrder: 2  },
  { id: 'ac',             nameAr: 'تكييف ومكيفات',      nameEn: 'AC Services',          iconName: 'ac',                 sortOrder: 3  },
  { id: 'painting',       nameAr: 'دهانات',             nameEn: 'Painting',             iconName: 'painting',           sortOrder: 4  },
  { id: 'carpentry',      nameAr: 'نجارة',              nameEn: 'Carpentry',            iconName: 'carpentry',          sortOrder: 5  },
  { id: 'cleaning',       nameAr: 'تنظيف',              nameEn: 'Cleaning',             iconName: 'cleaning',           sortOrder: 6  },
  { id: 'moving',         nameAr: 'نقل أثاث',           nameEn: 'Furniture Moving',     iconName: 'moving',             sortOrder: 7  },
  { id: 'cctv',           nameAr: 'كاميرات مراقبة',    nameEn: 'CCTV',                 iconName: 'cctv',               sortOrder: 8  },
  { id: 'networks',       nameAr: 'شبكات وإنترنت',     nameEn: 'Networks & Internet',  iconName: 'network',            sortOrder: 9  },
  { id: 'maintenance',    nameAr: 'صيانة عامة',         nameEn: 'General Maintenance',  iconName: 'general-maintenance', sortOrder: 10 },
  { id: 'appliances',     nameAr: 'أجهزة منزلية',      nameEn: 'Home Appliances',      iconName: 'appliances',         sortOrder: 11 },
  { id: 'welding',        nameAr: 'حدادة',              nameEn: 'Welding',              iconName: 'welding',            sortOrder: 12 },
  { id: 'aluminum',       nameAr: 'ألمنيوم وزجاج',     nameEn: 'Aluminum & Glass',     iconName: 'aluminum_glass',     sortOrder: 13 },
  { id: 'waterproof',     nameAr: 'عزل مائي',           nameEn: 'Waterproofing',        iconName: 'waterproofing',      sortOrder: 14 },
  { id: 'thermal',        nameAr: 'عزل حراري',          nameEn: 'Thermal Insulation',   iconName: 'thermal_insulation', sortOrder: 15 },
  { id: 'gas',            nameAr: 'تأسيس غاز',          nameEn: 'Gas Installation',     iconName: 'gas',                sortOrder: 16 },
  { id: 'locks',          nameAr: 'أقفال وأبواب',      nameEn: 'Locks & Doors',        iconName: 'locks_doors',        sortOrder: 17 },
  { id: 'contracting',    nameAr: 'مقاولات',            nameEn: 'Contracting',          iconName: 'contracting',        sortOrder: 18 },
  // --- الإضافية ---
  { id: 'tiles',          nameAr: 'بلاط وسيراميك',      nameEn: 'Tiles & Ceramics',     iconName: 'maintenance',        sortOrder: 19 },
  { id: 'gypsum',         nameAr: 'جبس وديكور',         nameEn: 'Gypsum & Decoration',  iconName: 'painting',           sortOrder: 20 },
  { id: 'satellite',      nameAr: 'ستلايت ورسيفر',     nameEn: 'Satellite & Receiver', iconName: 'network',            sortOrder: 21 },
  { id: 'pumps',          nameAr: 'مضخات مياه',         nameEn: 'Water Pumps',          iconName: 'plumbing',           sortOrder: 22 },
  { id: 'gardens',        nameAr: 'حدائق ومسابح',      nameEn: 'Gardens & Pools',      iconName: 'cleaning',           sortOrder: 23 },
  // --- دائماً آخر عنصر ---
  { id: 'more',           nameAr: 'المزيد من الخدمات', nameEn: 'More Services',        iconName: 'more',               sortOrder: 24 },
]

const cities = [
  { ar: 'طرابلس', en: 'Tripoli'  },
  { ar: 'بنغازي', en: 'Benghazi' },
  { ar: 'مصراتة', en: 'Misrata'  },
  { ar: 'سبها',   en: 'Sabha'    },
]

const namesAr     = ['أحمد','محمد','علي','عمر','محمود','خالد','مصطفى','عبدالله','حسن','حسين']
const namesEn     = ['Ahmed','Mohamed','Ali','Omar','Mahmoud','Khaled','Mustafa','Abdullah','Hassan','Hussein']
const lastNamesAr = ['الورفلي','المصراتي','الترهوني','الزنتاني','الزوي','المقرحي','القذافي','العبيدي','الفايدي','الفيتوري']
const lastNamesEn = ['Al-Warfali','Al-Misrati','Al-Tarhouni','Al-Zintani','Al-Zawi','Al-Magrahi','Gaddafi','Al-Obeidi','Al-Faydi','Al-Fitouri']
const colors      = ['#FF7900','#071B33','#4CAF50','#2196F3','#9C27B0','#F44336']

// ─── Admin → Public category/city mapping ───────────────────────────────────
const ADMIN_CAT_MAP = {
  k1: 'plumbing', k2: 'electricity', k3: 'ac', k4: 'carpentry',
  k5: 'painting', k6: 'cleaning',   k7: 'moving',  k8: 'cctv',
  k9: 'networks', k10: 'maintenance', k11: 'appliances', k12: 'welding',
}
const ADMIN_CITY_MAP = {
  c1:  { ar: 'طرابلس',  en: 'Tripoli'   },
  c2:  { ar: 'بنغازي',  en: 'Benghazi'  },
  c3:  { ar: 'مصراتة',  en: 'Misrata'   },
  c4:  { ar: 'الزاوية', en: 'Zawiya'    },
  c5:  { ar: 'سبها',    en: 'Sabha'     },
  c6:  { ar: 'زوارة',   en: 'Zuwara'   },
  c7:  { ar: 'زليتن',   en: 'Zliten'   },
  c8:  { ar: 'الخمس',   en: 'Al Khoms' },
  c9:  { ar: 'سرت',     en: 'Sirte'    },
  c10: { ar: 'طبرق',    en: 'Tobruk'   },
}
const AVATAR_COLORS = ['#FF7900','#071B33','#4CAF50','#2196F3','#9C27B0','#E91E63']

export function getAdminTechnicians() {
  try {
    const raw = localStorage.getItem('demo_technicians_v1')
    if (!raw) return []
    const list = JSON.parse(raw)
    return list
      .filter(t => t.is_active && t.is_approved && t.status !== 'inactive')
      .map((t, i) => {
        const catId = ADMIN_CAT_MAP[t.category_id] || t.category_id || 'maintenance'
        const cat   = categories.find(c => c.id === catId) || {}
        const city  = ADMIN_CITY_MAP[t.city_id] || { ar: t.city_id || '—', en: t.city_id || '—' }
        return {
          id:              t.id,
          nameAr:          t.name_ar  || '',
          nameEn:          t.name_en  || t.name_ar || '',
          categoryId:      catId,
          categoryAr:      cat.nameAr || '',
          categoryEn:      cat.nameEn || '',
          cityAr:          city.ar,
          cityEn:          city.en,
          rating:          t.rating   || (4 + (i % 10) * 0.1).toFixed(1),
          reviews:         t.reviews  || (i % 50) + 5,
          experienceYears: t.experience_years || 0,
          priceFrom:       t.price_from || 0,
          phone:           t.phone    || '',
          whatsapp:        t.whatsapp || t.phone || '',
          statusAr:        t.status === 'available' ? 'متاح الآن' : 'مشغول',
          statusEn:        t.status === 'available' ? 'Available Now' : 'Busy',
          available:       t.status === 'available',
          descriptionAr:   t.description_ar || '',
          descriptionEn:   t.description_en || t.description_ar || '',
          avatarColor:     AVATAR_COLORS[i % AVATAR_COLORS.length],
          fromAdmin:       true,
        }
      })
  } catch (_) { return [] }
}

export const technicians = []
let phoneCounter = 1

categories.forEach(cat => {
  if (cat.id === 'more') return
  for (let i = 0; i < 3; i++) {
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
