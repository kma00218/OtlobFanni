export const categories = [
  // Row 1
  { id: 'electricity', nameAr: 'كهرباء',            nameEn: 'Electricity',        iconName: 'electricity' },
  { id: 'plumbing',    nameAr: 'سباكة',             nameEn: 'Plumbing',           iconName: 'plumbing' },
  { id: 'ac',          nameAr: 'تكييف',             nameEn: 'Air Conditioning',   iconName: 'ac' },
  { id: 'painting',    nameAr: 'دهانات',            nameEn: 'Painting',           iconName: 'painting' },
  { id: 'carpentry',   nameAr: 'نجارة',             nameEn: 'Carpentry',          iconName: 'carpentry' },
  // Row 2
  { id: 'appliances',  nameAr: 'أجهزة منزلية',     nameEn: 'Home Appliances',    iconName: 'appliances' },
  { id: 'welding',     nameAr: 'حدادة',             nameEn: 'Welding',            iconName: 'welding' },
  { id: 'waterproof',  nameAr: 'عزل مائي',          nameEn: 'Waterproofing',      iconName: 'waterproof' },
  { id: 'thermal',     nameAr: 'عزل حراري',         nameEn: 'Thermal Insulation', iconName: 'thermal' },
  { id: 'gas',         nameAr: 'تأسيس غاز',         nameEn: 'Gas Installation',   iconName: 'gas' },
  // Row 3
  { id: 'maintenance', nameAr: 'صيانة عامة',        nameEn: 'General Maintenance',iconName: 'maintenance' },
  { id: 'acunits',     nameAr: 'مكيفات',            nameEn: 'AC Units',           iconName: 'acunits' },
  { id: 'contracting', nameAr: 'مقاولات',           nameEn: 'Contracting',        iconName: 'contracting' },
  { id: 'aluminum',    nameAr: 'الألمنيوم وزجاج',  nameEn: 'Aluminum & Glass',   iconName: 'aluminum' },
  { id: 'cleaning',    nameAr: 'تنظيف',             nameEn: 'Cleaning',           iconName: 'cleaning' },
  // Row 4
  { id: 'locks',       nameAr: 'أقفال وأبواب',     nameEn: 'Locks & Doors',      iconName: 'locks' },
  { id: 'cctv',        nameAr: 'كاميرات مراقبة',   nameEn: 'CCTV',               iconName: 'cctv' },
  { id: 'networks',    nameAr: 'شبكات وإنترنت',    nameEn: 'Networks & Internet', iconName: 'networks' },
  { id: 'moving',      nameAr: 'نقل أثاث',          nameEn: 'Furniture Moving',   iconName: 'moving' },
  { id: 'more',        nameAr: 'مزيد من الخدمات',  nameEn: 'More Services',      iconName: 'more' },
]

const cities = [
  { ar: 'طرابلس', en: 'Tripoli' },
  { ar: 'بنغازي', en: 'Benghazi' },
  { ar: 'مصراتة', en: 'Misrata' },
  { ar: 'سبها',   en: 'Sabha' },
]

const namesAr = ['أحمد', 'محمد', 'علي', 'عمر', 'محمود', 'خالد', 'مصطفى', 'عبدالله', 'حسن', 'حسين']
const namesEn = ['Ahmed', 'Mohamed', 'Ali', 'Omar', 'Mahmoud', 'Khaled', 'Mustafa', 'Abdullah', 'Hassan', 'Hussein']
const lastNamesAr = ['الورفلي', 'المصراتي', 'الترهوني', 'الزنتاني', 'الزوي', 'المقرحي', 'القذافي', 'العبيدي', 'الفايدي', 'الفيتوري']
const lastNamesEn = ['Al-Warfali', 'Al-Misrati', 'Al-Tarhouni', 'Al-Zintani', 'Al-Zawi', 'Al-Magrahi', 'Gaddafi', 'Al-Obeidi', 'Al-Faydi', 'Al-Fitouri']
const colors = ['#FF7900', '#071B33', '#4CAF50', '#2196F3', '#9C27B0', '#F44336']

export const technicians = []
let phoneCounter = 1

categories.forEach(cat => {
  for (let i = 0; i < 3; i++) {
    const isAvailable = Math.random() > 0.3
    const city = cities[Math.floor(Math.random() * cities.length)]
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
