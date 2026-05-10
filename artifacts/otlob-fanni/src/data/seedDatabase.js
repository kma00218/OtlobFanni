/**
 * قاعدة البيانات الوهمية لاطلب فني
 * تعمل مرة واحدة عند أول تشغيل (تتحقق من مفتاح otlob_fanni_seed_v2)
 * لإعادة الضبط: احذف المفتاح otlob_fanni_seed_v2 من localStorage
 */

const SEED_KEY = 'otlob_fanni_seed_v2'

// ──────────────────────────────────────────────
// المدن
// ──────────────────────────────────────────────
const CITIES = [
  { id: 'c1',  name_ar: 'طرابلس',  name_en: 'Tripoli',   sort_order: 1,  is_active: true },
  { id: 'c2',  name_ar: 'بنغازي',  name_en: 'Benghazi',  sort_order: 2,  is_active: true },
  { id: 'c3',  name_ar: 'مصراتة',  name_en: 'Misrata',   sort_order: 3,  is_active: true },
  { id: 'c4',  name_ar: 'الزاوية', name_en: 'Zawiya',    sort_order: 4,  is_active: true },
  { id: 'c5',  name_ar: 'سبها',    name_en: 'Sabha',     sort_order: 5,  is_active: true },
  { id: 'c6',  name_ar: 'زوارة',   name_en: 'Zuwara',    sort_order: 6,  is_active: true },
  { id: 'c7',  name_ar: 'زليتن',   name_en: 'Zliten',    sort_order: 7,  is_active: true },
  { id: 'c8',  name_ar: 'الخمس',   name_en: 'Al Khoms',  sort_order: 8,  is_active: true },
  { id: 'c9',  name_ar: 'سرت',     name_en: 'Sirte',     sort_order: 9,  is_active: true },
  { id: 'c10', name_ar: 'طبرق',    name_en: 'Tobruk',    sort_order: 10, is_active: true },
]

// ──────────────────────────────────────────────
// التخصصات
// ──────────────────────────────────────────────
const CATEGORIES = [
  { id: 'k1',  name_ar: 'كهرباء',          name_en: 'Electricity',         icon: 'Zap',        sort_order: 1,  is_active: true  },
  { id: 'k2',  name_ar: 'سباكة',            name_en: 'Plumbing',            icon: 'Droplets',   sort_order: 2,  is_active: true  },
  { id: 'k3',  name_ar: 'تكييف ومكيفات',   name_en: 'AC Services',         icon: 'Wind',       sort_order: 3,  is_active: true  },
  { id: 'k4',  name_ar: 'دهانات',           name_en: 'Painting',            icon: 'Paintbrush', sort_order: 4,  is_active: true  },
  { id: 'k5',  name_ar: 'نجارة',            name_en: 'Carpentry',           icon: 'Hammer',     sort_order: 5,  is_active: true  },
  { id: 'k6',  name_ar: 'تنظيف',            name_en: 'Cleaning',            icon: 'Sparkles',   sort_order: 6,  is_active: true  },
  { id: 'k7',  name_ar: 'نقل أثاث',         name_en: 'Furniture Moving',    icon: 'Truck',      sort_order: 7,  is_active: true  },
  { id: 'k8',  name_ar: 'كاميرات مراقبة',  name_en: 'CCTV',                icon: 'Camera',     sort_order: 8,  is_active: true  },
  { id: 'k9',  name_ar: 'شبكات وإنترنت',   name_en: 'Networks & Internet', icon: 'Wifi',       sort_order: 9,  is_active: true  },
  { id: 'k10', name_ar: 'صيانة عامة',       name_en: 'General Maintenance', icon: 'Wrench',     sort_order: 10, is_active: true  },
  { id: 'k11', name_ar: 'أجهزة منزلية',    name_en: 'Home Appliances',     icon: 'Tv',         sort_order: 11, is_active: true  },
  { id: 'k12', name_ar: 'حدادة',            name_en: 'Welding',             icon: 'Flame',      sort_order: 12, is_active: true  },
]

// ──────────────────────────────────────────────
// الفنيون المعتمدون (مقبولون عبر طلبات التسجيل)
// يُقرأ بواسطة getApprovedTechnicians() في services.js
// category = معرّف التخصص من قائمة categories الثابتة (electricity, plumbing...)
// city = اسم المدينة بالعربي
// ──────────────────────────────────────────────
const TECHNICIANS = [
  {
    id: 'tech_app_001',
    applicationId: 'app_001',
    name: 'خالد الترهوني',
    name_ar: 'خالد الترهوني',
    phone: '0913456789',
    whatsapp: '0913456789',
    city: 'طرابلس',
    category: 'electricity',
    experienceYears: 8,
    priceFrom: 50,
    availableNow: true,
    description: 'فني كهرباء معتمد مع خبرة 8 سنوات في التركيبات المنزلية والتجارية',
    rating: 4.8,
    reviewsCount: 124,
    is_active: true,
    is_approved: true,
    is_featured: true,
    avatarColor: '#FF7900',
    created_at: '2026-03-10T08:00:00Z',
    approvedAt: '2026-03-10T08:00:00Z',
  },
  {
    id: 'tech_app_002',
    applicationId: 'app_002',
    name: 'محمد الزنتاني',
    name_ar: 'محمد الزنتاني',
    phone: '0921345678',
    whatsapp: '0921345678',
    city: 'طرابلس',
    category: 'plumbing',
    experienceYears: 12,
    priceFrom: 60,
    availableNow: true,
    description: 'متخصص في أعمال السباكة وإصلاح التسريبات وتركيب الأطباق الصحية',
    rating: 4.6,
    reviewsCount: 89,
    is_active: true,
    is_approved: true,
    is_featured: true,
    avatarColor: '#071B33',
    created_at: '2026-03-12T09:00:00Z',
    approvedAt: '2026-03-12T09:00:00Z',
  },
  {
    id: 'tech_app_003',
    applicationId: 'app_003',
    name: 'علي الورفلي',
    name_ar: 'علي الورفلي',
    phone: '0917654321',
    whatsapp: '0917654321',
    city: 'بنغازي',
    category: 'ac',
    experienceYears: 6,
    priceFrom: 80,
    availableNow: true,
    description: 'فني تكييف محترف متخصص في صيانة وتركيب جميع أنواع المكيفات',
    rating: 4.7,
    reviewsCount: 67,
    is_active: true,
    is_approved: true,
    is_featured: true,
    avatarColor: '#4CAF50',
    created_at: '2026-03-15T10:00:00Z',
    approvedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'tech_app_004',
    applicationId: 'app_004',
    name: 'أحمد المصراتي',
    name_ar: 'أحمد المصراتي',
    phone: '0912233445',
    whatsapp: '0912233445',
    city: 'مصراتة',
    category: 'painting',
    experienceYears: 10,
    priceFrom: 40,
    availableNow: false,
    description: 'فني دهان محترف للمنازل والمحلات التجارية مع خبرة طويلة في الديكور',
    rating: 4.5,
    reviewsCount: 52,
    is_active: true,
    is_approved: true,
    is_featured: false,
    avatarColor: '#2196F3',
    created_at: '2026-03-18T11:00:00Z',
    approvedAt: '2026-03-18T11:00:00Z',
  },
  {
    id: 'tech_app_005',
    applicationId: 'app_005',
    name: 'يوسف الزوي',
    name_ar: 'يوسف الزوي',
    phone: '0923344556',
    whatsapp: '0923344556',
    city: 'طرابلس',
    category: 'carpentry',
    experienceYears: 15,
    priceFrom: 70,
    availableNow: true,
    description: 'نجار محترف متخصص في الأثاث والأبواب والنوافذ الخشبية المصنوعة يدوياً',
    rating: 4.9,
    reviewsCount: 203,
    is_active: true,
    is_approved: true,
    is_featured: true,
    avatarColor: '#9C27B0',
    created_at: '2026-03-20T08:30:00Z',
    approvedAt: '2026-03-20T08:30:00Z',
  },
  {
    id: 'tech_app_006',
    applicationId: 'app_006',
    name: 'عمر الفيتوري',
    name_ar: 'عمر الفيتوري',
    phone: '0914455667',
    whatsapp: '0914455667',
    city: 'الزاوية',
    category: 'cleaning',
    experienceYears: 5,
    priceFrom: 30,
    availableNow: true,
    description: 'خدمة تنظيف شاملة للمنازل والمكاتب مع استخدام أحدث المعدات',
    rating: 4.4,
    reviewsCount: 41,
    is_active: true,
    is_approved: true,
    is_featured: false,
    avatarColor: '#FF7900',
    created_at: '2026-04-01T09:00:00Z',
    approvedAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'tech_app_007',
    applicationId: 'app_007',
    name: 'حسن المقرحي',
    name_ar: 'حسن المقرحي',
    phone: '0925566778',
    whatsapp: '0925566778',
    city: 'بنغازي',
    category: 'maintenance',
    experienceYears: 9,
    priceFrom: 45,
    availableNow: true,
    description: 'فني صيانة عامة يعمل على جميع أعمال الإصلاح المنزلي بكفاءة وسرعة',
    rating: 4.3,
    reviewsCount: 78,
    is_active: true,
    is_approved: true,
    is_featured: false,
    avatarColor: '#071B33',
    created_at: '2026-04-05T10:00:00Z',
    approvedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'tech_app_008',
    applicationId: 'app_008',
    name: 'مصطفى العبيدي',
    name_ar: 'مصطفى العبيدي',
    phone: '0916677889',
    whatsapp: '0916677889',
    city: 'مصراتة',
    category: 'networks',
    experienceYears: 7,
    priceFrom: 55,
    availableNow: true,
    description: 'متخصص في تركيب وإعداد الشبكات المنزلية والتجارية والكاميرات',
    rating: 4.6,
    reviewsCount: 55,
    is_active: true,
    is_approved: true,
    is_featured: true,
    avatarColor: '#4CAF50',
    created_at: '2026-04-08T11:00:00Z',
    approvedAt: '2026-04-08T11:00:00Z',
  },
  {
    id: 'tech_app_009',
    applicationId: 'app_009',
    name: 'إبراهيم الفايدي',
    name_ar: 'إبراهيم الفايدي',
    phone: '0927788990',
    whatsapp: '0927788990',
    city: 'سبها',
    category: 'appliances',
    experienceYears: 11,
    priceFrom: 35,
    availableNow: false,
    description: 'فني صيانة أجهزة منزلية يعمل على الثلاجات والغسالات والأفران',
    rating: 4.2,
    reviewsCount: 93,
    is_active: true,
    is_approved: true,
    is_featured: false,
    avatarColor: '#2196F3',
    created_at: '2026-04-10T08:00:00Z',
    approvedAt: '2026-04-10T08:00:00Z',
  },
  {
    id: 'tech_app_010',
    applicationId: 'app_010',
    name: 'سالم القذافي',
    name_ar: 'سالم القذافي',
    phone: '0918899001',
    whatsapp: '0918899001',
    city: 'طرابلس',
    category: 'cctv',
    experienceYears: 6,
    priceFrom: 65,
    availableNow: true,
    description: 'خبير في تركيب وبرمجة كاميرات المراقبة لجميع الأماكن',
    rating: 4.7,
    reviewsCount: 38,
    is_active: true,
    is_approved: true,
    is_featured: true,
    avatarColor: '#9C27B0',
    created_at: '2026-04-15T09:00:00Z',
    approvedAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'tech_app_011',
    applicationId: 'app_011',
    name: 'عبدالله الزنتاني',
    name_ar: 'عبدالله الزنتاني',
    phone: '0929900112',
    whatsapp: '0929900112',
    city: 'الخمس',
    category: 'electricity',
    experienceYears: 4,
    priceFrom: 45,
    availableNow: true,
    description: 'كهربائي منازل متخصص في تمديد الأسلاك وتركيب اللوحات الكهربائية',
    rating: 4.1,
    reviewsCount: 22,
    is_active: true,
    is_approved: true,
    is_featured: false,
    avatarColor: '#FF7900',
    created_at: '2026-04-20T10:00:00Z',
    approvedAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'tech_app_012',
    applicationId: 'app_012',
    name: 'طارق الترهوني',
    name_ar: 'طارق الترهوني',
    phone: '0911122334',
    whatsapp: '0911122334',
    city: 'زليتن',
    category: 'plumbing',
    experienceYears: 8,
    priceFrom: 55,
    availableNow: true,
    description: 'سباك محترف يتعامل مع جميع أنواع تسريبات المياه وإصلاح الحمامات',
    rating: 4.5,
    reviewsCount: 61,
    is_active: true,
    is_approved: true,
    is_featured: false,
    avatarColor: '#071B33',
    created_at: '2026-04-22T11:00:00Z',
    approvedAt: '2026-04-22T11:00:00Z',
  },
]

// ──────────────────────────────────────────────
// فنيون مضافون مباشرة من الأدمن
// city_id → يطابق CITIES ids (c1..c10)
// category_id → يطابق CATEGORIES ids (k1..k12)
// ──────────────────────────────────────────────
const ADMIN_TECHNICIANS = [
  {
    id: 'adm_tech_001',
    name_ar: 'نادر الشريف',
    name_en: 'Nader Al-Sharif',
    phone: '0912000111',
    whatsapp: '0912000111',
    city_id: 'c1',
    category_id: 'k7',
    experience_years: 7,
    price_from: 120,
    status: 'available',
    description_ar: 'شركة نقل أثاث متخصصة بسيارات مجهزة وفريق محترف',
    description_en: 'Specialized furniture moving company with equipped vehicles',
    is_featured: true,
    is_approved: true,
    is_active: true,
    rating: 4.8,
    reviews: 47,
    created_at: '2026-04-25T09:00:00Z',
  },
  {
    id: 'adm_tech_002',
    name_ar: 'فاضل الكوني',
    name_en: 'Fadel Al-Kuni',
    phone: '0923111222',
    whatsapp: '0923111222',
    city_id: 'c2',
    category_id: 'k12',
    experience_years: 14,
    price_from: 80,
    status: 'available',
    description_ar: 'حداد محترف للأبواب والنوافذ والأعمال المعدنية',
    description_en: 'Professional blacksmith for doors, windows and metalwork',
    is_featured: false,
    is_approved: true,
    is_active: true,
    rating: 4.6,
    reviews: 33,
    created_at: '2026-04-28T10:00:00Z',
  },
  {
    id: 'adm_tech_003',
    name_ar: 'رمضان البوسيفي',
    name_en: 'Ramadan Al-Busayfi',
    phone: '0914222333',
    whatsapp: '0914222333',
    city_id: 'c3',
    category_id: 'k6',
    experience_years: 3,
    price_from: 25,
    status: 'busy',
    description_ar: 'خدمة تنظيف منازل ومكاتب يومي وأسبوعي',
    description_en: 'Daily and weekly home and office cleaning service',
    is_featured: false,
    is_approved: true,
    is_active: false,
    rating: 4.0,
    reviews: 18,
    created_at: '2026-05-01T11:00:00Z',
  },
]

// ──────────────────────────────────────────────
// طلبات تسجيل الفنيين
// ──────────────────────────────────────────────
const TECHNICIAN_APPLICATIONS = [
  {
    id: 'app_001', full_name: 'خالد الترهوني', phone: '0913456789', whatsapp: '0913456789',
    national_id: '123456789', city: 'طرابلس', area: 'جنزور', address: 'شارع الجمهورية',
    specialty: 'electricity', experience: '6-10', type: 'individual',
    description: 'فني كهرباء معتمد مع خبرة 8 سنوات', certifications: 'شهادة فني كهرباء',
    price_from: '50', price_to: '200', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday'],
    hours_from: '08:00', hours_to: '20:00', emergency: true, service_radius: '30',
    facebook: '', instagram: '', profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'approved', created_at: '2026-03-08T10:00:00Z',
  },
  {
    id: 'app_002', full_name: 'محمد الزنتاني', phone: '0921345678', whatsapp: '0921345678',
    national_id: '234567890', city: 'طرابلس', area: 'السراج', address: 'طريق المطار',
    specialty: 'plumbing', experience: '10+', type: 'individual',
    description: 'متخصص في أعمال السباكة', certifications: 'شهادة سباك معتمد',
    price_from: '60', price_to: '250', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday'],
    hours_from: '07:00', hours_to: '19:00', emergency: true, service_radius: '25',
    facebook: '', instagram: '', profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'approved', created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'app_013', full_name: 'ناصر الأمين', phone: '0916543210', whatsapp: '0916543210',
    national_id: '345678901', city: 'طرابلس', area: 'تاجوراء', address: 'طريق جنزور',
    specialty: 'electricity', experience: '3-5', type: 'individual',
    description: 'كهربائي منازل متخصص', certifications: '',
    price_from: '40', price_to: '150', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday','Wednesday'],
    hours_from: '09:00', hours_to: '18:00', emergency: false, service_radius: '20',
    facebook: '', instagram: '', profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'pending', created_at: '2026-05-09T14:00:00Z',
  },
  {
    id: 'app_014', full_name: 'وليد الشاعري', phone: '0928765432', whatsapp: '0928765432',
    national_id: '456789012', city: 'بنغازي', area: 'الكيش', address: 'شارع عمر المختار',
    specialty: 'ac', experience: '3-5', type: 'individual',
    description: 'فني تكييف خبرة 4 سنوات', certifications: '',
    price_from: '70', price_to: '200', available_now: true,
    working_days: ['Saturday','Sunday','Monday','Tuesday'],
    hours_from: '08:00', hours_to: '17:00', emergency: false, service_radius: '15',
    facebook: '', instagram: '', profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'pending', created_at: '2026-05-10T08:30:00Z',
  },
  {
    id: 'app_015', full_name: 'عادل البوعيشة', phone: '0915432109', whatsapp: '0915432109',
    national_id: '567890123', city: 'مصراتة', area: 'القصبة', address: 'شارع الاستقلال',
    specialty: 'painting', experience: '1-2', type: 'individual',
    description: 'فني دهان مبتدئ', certifications: '',
    price_from: '30', price_to: '100', available_now: false,
    working_days: ['Saturday','Sunday','Monday'],
    hours_from: '10:00', hours_to: '16:00', emergency: false, service_radius: '10',
    facebook: '', instagram: '', profile_photo: null, work_images: [], id_doc_front: null, id_doc_back: null, work_license: null,
    status: 'rejected', created_at: '2026-05-08T12:00:00Z',
  },
]

// ──────────────────────────────────────────────
// طلبات الخدمة من العملاء
// technician_id يطابق IDs في TECHNICIANS
// city_id يطابق CITIES ids
// category_id يطابق CATEGORIES ids
// ──────────────────────────────────────────────
const SERVICE_REQUESTS = [
  {
    id: 'sr_001', customer_name: 'أحمد بن يوسف', customer_phone: '0911111111',
    description: 'مشكلة في الكهرباء الرئيسية، القاطع يفصل باستمرار',
    technician_id: 'tech_app_001', city_id: 'c1', category_id: 'k1',
    city_name: 'طرابلس', category_name: 'كهرباء',
    status: 'completed', created_at: '2026-04-20T09:00:00Z',
  },
  {
    id: 'sr_002', customer_name: 'فاطمة العبيدي', customer_phone: '0922222222',
    description: 'تسريب مياه من الحمام، الصنبور لا يغلق',
    technician_id: 'tech_app_002', city_id: 'c1', category_id: 'k2',
    city_name: 'طرابلس', category_name: 'سباكة',
    status: 'completed', created_at: '2026-04-22T10:30:00Z',
  },
  {
    id: 'sr_003', customer_name: 'خالد الشريف', customer_phone: '0933333333',
    description: 'المكيف لا يبرد، يحتاج شحن غاز أو صيانة',
    technician_id: 'tech_app_003', city_id: 'c2', category_id: 'k3',
    city_name: 'بنغازي', category_name: 'تكييف ومكيفات',
    status: 'in_progress', created_at: '2026-05-01T08:00:00Z',
  },
  {
    id: 'sr_004', customer_name: 'سليمان الورفلي', customer_phone: '0944444444',
    description: 'أريد دهان الشقة كاملة بعد التجديد، ثلاث غرف وصالة',
    technician_id: 'tech_app_004', city_id: 'c3', category_id: 'k4',
    city_name: 'مصراتة', category_name: 'دهانات',
    status: 'assigned', created_at: '2026-05-03T11:00:00Z',
  },
  {
    id: 'sr_005', customer_name: 'مريم الزواوي', customer_phone: '0955555555',
    description: 'باب الغرفة الرئيسية مكسور، يحتاج تصليح أو استبدال',
    technician_id: 'tech_app_005', city_id: 'c1', category_id: 'k5',
    city_name: 'طرابلس', category_name: 'نجارة',
    status: 'assigned', created_at: '2026-05-05T09:30:00Z',
  },
  {
    id: 'sr_006', customer_name: 'نوال الفرجاني', customer_phone: '0966666666',
    description: 'تنظيف شامل للفيلا قبل الانتقال إليها',
    technician_id: 'tech_app_006', city_id: 'c4', category_id: 'k6',
    city_name: 'الزاوية', category_name: 'تنظيف',
    status: 'in_progress', created_at: '2026-05-06T08:00:00Z',
  },
  {
    id: 'sr_007', customer_name: 'عبدالرحمن الكيلاني', customer_phone: '0977777777',
    description: 'الإنترنت بطيء جداً، يحتاج إعادة ضبط الراوتر وتمديد كابل',
    technician_id: 'tech_app_008', city_id: 'c3', category_id: 'k9',
    city_name: 'مصراتة', category_name: 'شبكات وإنترنت',
    status: 'completed', created_at: '2026-05-07T10:00:00Z',
  },
  {
    id: 'sr_008', customer_name: 'حنان القيسي', customer_phone: '0988888888',
    description: 'الثلاجة لا تبرد بشكل جيد منذ أسبوع',
    technician_id: 'tech_app_009', city_id: 'c5', category_id: 'k11',
    city_name: 'سبها', category_name: 'أجهزة منزلية',
    status: 'new', created_at: '2026-05-08T07:30:00Z',
  },
  {
    id: 'sr_009', customer_name: 'عمر الباروني', customer_phone: '0999999999',
    description: 'أريد تركيب 4 كاميرات مراقبة أمام المنزل والمدخل',
    technician_id: 'tech_app_010', city_id: 'c1', category_id: 'k8',
    city_name: 'طرابلس', category_name: 'كاميرات مراقبة',
    status: 'new', created_at: '2026-05-09T09:00:00Z',
  },
  {
    id: 'sr_010', customer_name: 'إيمان الزروق', customer_phone: '0900000001',
    description: 'صيانة عامة للمطبخ وإصلاح الخزانات العلوية',
    technician_id: 'tech_app_007', city_id: 'c2', category_id: 'k10',
    city_name: 'بنغازي', category_name: 'صيانة عامة',
    status: 'new', created_at: '2026-05-09T11:00:00Z',
  },
  {
    id: 'sr_011', customer_name: 'محمود البوسيف', customer_phone: '0900000002',
    description: 'مشكلة في التمديدات الكهربائية بالمكتب، يحتاج فحص كامل',
    technician_id: 'tech_app_011', city_id: 'c8', category_id: 'k1',
    city_name: 'الخمس', category_name: 'كهرباء',
    status: 'cancelled', created_at: '2026-05-04T14:00:00Z',
  },
  {
    id: 'sr_012', customer_name: 'سمية الغرياني', customer_phone: '0900000003',
    description: 'أنبوب مياه الحديقة مكسور، تسريب قوي',
    technician_id: 'tech_app_012', city_id: 'c7', category_id: 'k2',
    city_name: 'زليتن', category_name: 'سباكة',
    status: 'completed', created_at: '2026-05-02T08:00:00Z',
  },
  {
    id: 'sr_013', customer_name: 'زياد الطاهر', customer_phone: '0900000004',
    description: 'نقل أثاث شقة كاملة من الدور الثالث',
    technician_id: 'adm_tech_001', city_id: 'c1', category_id: 'k7',
    city_name: 'طرابلس', category_name: 'نقل أثاث',
    status: 'assigned', created_at: '2026-05-10T07:00:00Z',
  },
  {
    id: 'sr_014', customer_name: 'رانيا الشلماني', customer_phone: '0900000005',
    description: 'تركيب باب حديد للمستودع مع قفل أمان',
    technician_id: 'adm_tech_002', city_id: 'c2', category_id: 'k12',
    city_name: 'بنغازي', category_name: 'حدادة',
    status: 'new', created_at: '2026-05-10T10:30:00Z',
  },
  {
    id: 'sr_015', customer_name: 'بلال الكعبي', customer_phone: '0900000006',
    description: 'مكيف السيارة يحتاج تنظيف وتعبئة غاز فريون',
    technician_id: null, city_id: 'c3', category_id: 'k3',
    city_name: 'مصراتة', category_name: 'تكييف ومكيفات',
    status: 'new', created_at: '2026-05-10T12:00:00Z',
  },
]

// ──────────────────────────────────────────────
// الإعلانات
// ──────────────────────────────────────────────
const ADS = [
  {
    id: 'a1', title_ar: 'اطلب فنيك الآن', title_en: 'Book Your Technician Now',
    description_ar: 'أسرع خدمة صيانة في ليبيا', description_en: 'Fastest maintenance in Libya',
    image_url: 'https://placehold.co/600x200/FF7900/white?text=Otlob+Fanni',
    link_url: '/', placement: 'home', is_active: true,
    start_date: '2026-05-01', end_date: '2026-06-30', created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'a2', title_ar: 'خدمة الكهرباء المنزلية', title_en: 'Home Electrical Service',
    description_ar: 'فنيون معتمدون لكل أعمال الكهرباء', description_en: 'Certified electricians',
    image_url: 'https://placehold.co/600x200/071B33/white?text=Electricity',
    link_url: '/category/electricity', placement: 'categories', is_active: true,
    start_date: '2026-05-05', end_date: '2026-05-31', created_at: '2026-05-05T09:00:00Z',
  },
  {
    id: 'a3', title_ar: 'عرض صيانة الصيف', title_en: 'Summer Maintenance Offer',
    description_ar: 'خصم 20% على خدمات التكييف', description_en: '20% off on AC services',
    image_url: 'https://placehold.co/600x200/4CAF50/white?text=Summer+Offer',
    link_url: '/category/ac', placement: 'banner', is_active: false,
    start_date: '2026-06-01', end_date: '2026-08-31', created_at: '2026-05-02T14:00:00Z',
  },
]

// ──────────────────────────────────────────────
// مشرفو اللوحة
// ──────────────────────────────────────────────
const ADMIN_USERS = [
  { id: 'u1', full_name: 'Demo Super Admin', email: 'super@otlobfanni.ly',   role: 'super_admin', city_id: null,  is_active: true,  created_at: '2026-04-01T10:00:00Z' },
  { id: 'u2', full_name: 'مشرف طرابلس',     email: 'tripoli@otlobfanni.ly', role: 'sub_admin',   city_id: 'c1', is_active: true,  created_at: '2026-04-15T10:00:00Z' },
  { id: 'u3', full_name: 'مشرف بنغازي',     email: 'benghazi@otlobfanni.ly',role: 'sub_admin',   city_id: 'c2', is_active: true,  created_at: '2026-04-20T10:00:00Z' },
  { id: 'u4', full_name: 'مشرف مصراتة',     email: 'misrata@otlobfanni.ly', role: 'sub_admin',   city_id: 'c3', is_active: false, created_at: '2026-05-01T10:00:00Z' },
]

// ──────────────────────────────────────────────
// الإعدادات
// ──────────────────────────────────────────────
const SETTINGS = {
  app_name_ar: 'اطلب فني',
  app_name_en: 'Otlob Fanni',
  support_phone: '0910000000',
  support_email: 'support@otlobfanni.ly',
  default_city: 'c1',
  allow_registration: true,
  maintenance_mode: false,
}

// ──────────────────────────────────────────────
// دالة الزرع الرئيسية
// ──────────────────────────────────────────────
export function seedDatabase() {
  try {
    if (localStorage.getItem(SEED_KEY)) return // سبق الزرع

    const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))

    // لا تكتب فوق بيانات موجودة — فقط اكتب إذا كان المفتاح فارغاً
    const setIfEmpty = (key, val) => {
      if (!localStorage.getItem(key)) set(key, val)
    }

    setIfEmpty('demo_cities_v1',       CITIES)
    setIfEmpty('demo_categories_v1',   CATEGORIES)
    setIfEmpty('technicians',          TECHNICIANS)
    setIfEmpty('demo_technicians_v1',  ADMIN_TECHNICIANS)
    setIfEmpty('technicianApplications', TECHNICIAN_APPLICATIONS)
    setIfEmpty('service_requests',     SERVICE_REQUESTS)
    setIfEmpty('demo_ads_v1',          ADS)
    setIfEmpty('demo_admins_v1',       ADMIN_USERS)
    setIfEmpty('demo_settings_v1',     SETTINGS)

    localStorage.setItem(SEED_KEY, 'true')
    console.log('[seedDatabase] ✓ قاعدة البيانات الوهمية جاهزة')
  } catch (e) {
    console.warn('[seedDatabase] فشل الزرع:', e)
  }
}
