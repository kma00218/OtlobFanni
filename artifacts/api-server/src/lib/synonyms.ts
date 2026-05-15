/**
 * Bilingual synonym groups for Otlob Fanni search.
 * Each group contains related terms in Arabic + English.
 * When a query matches ANY term in a group, the search expands
 * to include ALL terms from that group.
 */

const SYNONYM_GROUPS: string[][] = [

  // ── ELECTRICITY ────────────────────────────────────────────────────────────
  ['كهرباء', 'كهربائي', 'كهربجي', 'electricity', 'electrical', 'electrician', 'electric', 'wiring', 'تأسيس كهرباء', 'لوحة كهربائية'],
  ['لوحة توزيع', 'distribution board', 'circuit breaker', 'قاطع', 'مفتاح كهربائي', 'switch', 'breaker', 'fuse', 'فيوز'],
  ['أسلاك', 'أسلاك كهربائية', 'wire', 'wires', 'cable', 'cables', 'كابل', 'كابلات', 'توصيلات'],
  ['إضاءة', 'نور', 'lighting', 'light', 'lights', 'lamp', 'لمبة', 'لمبات', 'led', 'ليد', 'spotlight', 'سبوت لايت'],
  ['مولد', 'مولدات', 'generator', 'generators', 'جنريتور', 'كهرباء احتياطية', 'backup power'],
  ['UPS', 'يو بي إس', 'uninterruptible power', 'طاقة احتياطية', 'بطارية مولد'],
  ['طاقة شمسية', 'solar', 'solar energy', 'solar panel', 'ألواح شمسية', 'photovoltaic', 'pv', 'كهرباء شمسية'],
  ['inverter', 'انفرتر', 'محول طاقة', 'charge controller', 'شاحن شمسي'],

  // ── AC & HVAC ──────────────────────────────────────────────────────────────
  ['تكييف', 'مكيف', 'مكيفات', 'تكييفات', 'AC', 'air conditioning', 'air conditioner', 'hvac', 'climate control'],
  ['سبليت', 'split', 'split unit', 'وحدة سبليت', 'مكيف سبليت'],
  ['شباك', 'window AC', 'window unit', 'مكيف شباك'],
  ['central AC', 'تكييف مركزي', 'central air', 'duct', 'دكت'],
  ['فريون', 'freon', 'refrigerant', 'gas AC', 'غاز مكيف', 'شحن فريون', 'recharge AC'],
  ['carrier', 'كارير', 'lg', 'samsung', 'سامسونج', 'gree', 'جري', 'midea', 'ميديا', 'haier', 'هاير', 'daikin', 'داكن', 'trane'],
  ['تهوية', 'ventilation', 'exhaust', 'مروحة شفط', 'exhaust fan', 'air flow'],

  // ── PLUMBING ───────────────────────────────────────────────────────────────
  ['سباكة', 'سباك', 'صحي', 'plumbing', 'plumber', 'pipes', 'pipe', 'أنابيب', 'مواسير', 'ماسورة'],
  ['تأسيس صحي', 'تمديد مواسير', 'pipe installation', 'water pipes', 'مواسير مياه'],
  ['تسريب مياه', 'water leak', 'leak', 'تسرب', 'كشف تسريب', 'leak detection'],
  ['انسداد', 'تسليك', 'blockage', 'blocked drain', 'clogged', 'drain cleaning', 'تسليك بالون'],
  ['صرف صحي', 'sewage', 'sewer', 'drainage', 'مجاري', 'بيارة', 'septic'],
  ['مضخة مياه', 'water pump', 'pump', 'مضخات', 'pumping', 'submersible pump', 'طلمبة'],
  ['خزان مياه', 'water tank', 'tank', 'خزانات', 'تنك', 'سترن'],
  ['سخان مياه', 'water heater', 'heater', 'boiler', 'بويلر', 'دش كهربائي', 'شاور'],
  ['حمام', 'bathroom', 'toilet', 'بانيو', 'مرحاض', 'shower', 'sink', 'حوض', 'bathtub'],

  // ── GAS ────────────────────────────────────────────────────────────────────
  ['غاز', 'gas', 'natural gas', 'غاز طبيعي', 'تمديد غاز', 'تأسيس غاز', 'gas pipes'],
  ['أسطوانة غاز', 'gas cylinder', 'gas bottle', 'غاز منزلي', 'بوتاغاز', 'gas stove'],
  ['كاشف غاز', 'gas detector', 'gas leak', 'تسريب غاز', 'gas alarm'],

  // ── PAINTING ───────────────────────────────────────────────────────────────
  ['دهان', 'دهانات', 'طلاء', 'painting', 'painter', 'paint', 'house painting'],
  ['جبس', 'جبصين', 'ديكور', 'gypsum', 'plaster', 'stucco', 'drywall'],
  ['ورق حائط', 'wallpaper', 'wall paper', 'ورق جدران'],
  ['epoxy', 'إيبوكسي', 'floor coating', 'floor paint', 'دهان أرضيات'],

  // ── CARPENTRY & FURNITURE ──────────────────────────────────────────────────
  ['نجارة', 'نجار', 'خشب', 'carpentry', 'carpenter', 'wood', 'woodwork', 'joinery'],
  ['أثاث', 'furniture', 'كراسي', 'طاولة', 'خزانة', 'wardrobe', 'cabinet', 'desk'],
  ['أبواب', 'door', 'doors', 'باب', 'بوابة', 'gate'],
  ['نوافذ', 'windows', 'window', 'شباك', 'نافذة', 'frame', 'إطار'],
  ['مطبخ', 'kitchen', 'kitchen cabinet', 'دولاب مطبخ', 'طقم مطبخ'],
  ['مفصلة', 'hinge', 'قفل', 'lock', 'مزلاج', 'latch', 'door handle', 'مقبض'],

  // ── TILES & FLOORING ──────────────────────────────────────────────────────
  ['بلاط', 'سيراميك', 'بورسلان', 'tiles', 'tile', 'ceramic', 'porcelain', 'flooring', 'floor tiles'],
  ['رخام', 'marble', 'granite', 'جرانيت', 'stone flooring', 'أرضيات رخام'],
  ['تركيب بلاط', 'tile installation', 'tile laying', 'بلاطي', 'فارش'],
  ['باركيه', 'parquet', 'hardwood floor', 'laminate', 'لامينيت', 'vinyl floor'],
  ['أرضيات', 'floor', 'flooring', 'أرضية', 'ground floor'],
  ['جدار', 'wall', 'walls', 'جدران', 'wall tiles', 'بلاط جدران'],

  // ── WELDING & METAL ────────────────────────────────────────────────────────
  ['حداد', 'حدادة', 'لحام', 'welding', 'welder', 'weld', 'metal work', 'metalwork'],
  ['حديد', 'iron', 'steel', 'فولاذ', 'stainless', 'ستانلس', 'inox', 'إينوكس'],
  ['بوابة حديد', 'iron gate', 'iron door', 'باب حديد', 'fence', 'سياج'],
  ['درابزين', 'railing', 'handrail', 'balustrade', 'حاجز'],
  ['ألمنيوم', 'aluminum', 'aluminium', 'أبواب ألمنيوم', 'واجهات ألمنيوم', 'aluminium door'],
  ['زجاج', 'glass', 'واجهات زجاجية', 'glass facade', 'glass door', 'مرآة', 'mirror'],

  // ── CONSTRUCTION & CIVIL ──────────────────────────────────────────────────
  ['بناء', 'بناء منازل', 'construction', 'building', 'contractor', 'مقاول', 'مقاولات'],
  ['خرسانة', 'cement', 'concrete', 'إسمنت', 'بلوك', 'block', 'block laying'],
  ['تشطيب', 'finishing', 'finishes', 'interior finishing', 'تشطيبات داخلية'],
  ['جدار حماية', 'retaining wall', 'سور', 'compound wall', 'boundary wall'],
  ['سقف', 'roof', 'ceiling', 'سقف مستعار', 'false ceiling', 'suspended ceiling'],
  ['عمود', 'pillar', 'column', 'beam', 'كمرة', 'slab', 'بلاطة', 'أساسات', 'foundation'],
  ['ترميم', 'renovation', 'refurbishment', 'restore', 'إصلاح منزل', 'تجديد'],

  // ── GYPSUM & DECOR ────────────────────────────────────────────────────────
  ['جبسيات', 'gypsum board', 'gypsum work', 'جبس بورد', 'gypsum ceiling', 'سقف جبس'],
  ['ديكور', 'decor', 'decoration', 'interior design', 'تصميم داخلي', 'design'],
  ['كورنيش', 'cornice', 'corniche', 'زخرفة جبس', 'gypsum moulding'],

  // ── APPLIANCES ─────────────────────────────────────────────────────────────
  ['أجهزة منزلية', 'appliances', 'home appliances', 'صيانة أجهزة', 'appliance repair'],
  ['غسالة', 'washing machine', 'washer', 'dryer', 'مجفف'],
  ['ثلاجة', 'fridge', 'refrigerator', 'freezer', 'فريزر'],
  ['بوتاغاز', 'gas cooker', 'cooker', 'oven', 'فرن', 'stove', 'طباخ'],
  ['شاشة', 'TV', 'television', 'تلفزيون', 'تلفاز', 'display', 'monitor', 'شاشة تلفزيون'],
  ['ميكروويف', 'microwave', 'microwave oven'],
  ['سخان مياه كهربائي', 'electric water heater', 'instant heater', 'سخان فوري'],
  ['ماكينة قهوة', 'coffee machine', 'coffee maker', 'espresso machine'],
  ['مكنسة كهربائية', 'vacuum cleaner', 'vacuum'],

  // ── COMPUTER & IT ──────────────────────────────────────────────────────────
  ['كمبيوتر', 'حاسوب', 'computer', 'pc', 'desktop', 'laptop', 'لابتوب', 'notebook'],
  ['صيانة كمبيوتر', 'computer repair', 'pc repair', 'tech support', 'technical support', 'دعم تقني'],
  ['برمجة', 'programming', 'software', 'software development', 'coding', 'developer', 'تطوير برمجيات', 'code'],
  ['تطبيق', 'app', 'application', 'mobile app', 'تطبيق موبايل', 'تطبيقات'],
  ['موقع إلكتروني', 'website', 'web', 'web design', 'web development', 'تصميم مواقع', 'wordpress'],
  ['شبكات', 'network', 'networking', 'شبكة', 'lan', 'wifi', 'واي فاي', 'internet', 'إنترنت'],
  ['سيرفر', 'server', 'server setup', 'cloud', 'كلاود', 'hosting'],
  ['كاميرات مراقبة', 'cctv', 'security cameras', 'surveillance', 'camera', 'ip camera', 'كاميرا', 'كاميرات'],
  ['نظام إنذار', 'alarm system', 'security system', 'burglar alarm', 'إنذار حريق', 'fire alarm'],
  ['access control', 'نظام دخول', 'بصمة', 'fingerprint', 'card reader', 'كارت ريدر', 'بوابة إلكترونية'],
  ['طابعة', 'printer', 'scanner', 'ماسح ضوئي', 'ink', 'حبر', 'toner', 'تونر'],
  ['بيانات', 'data', 'data recovery', 'استرجاع بيانات', 'backup', 'نسخ احتياطي'],
  ['فيروس', 'virus', 'malware', 'antivirus', 'مضاد فيروسات', 'ransomware'],
  ['تركيب ويندوز', 'windows installation', 'windows', 'os', 'operating system', 'نظام تشغيل'],

  // ── MOBILE PHONE ───────────────────────────────────────────────────────────
  ['موبايل', 'mobile', 'phone', 'smartphone', 'هاتف', 'جوال', 'تليفون', 'cell phone'],
  ['صيانة موبايل', 'phone repair', 'mobile repair', 'screen repair', 'iphone repair', 'samsung repair'],
  ['شاشة موبايل', 'phone screen', 'screen replacement', 'تغيير شاشة'],
  ['بطارية موبايل', 'phone battery', 'battery replacement', 'تغيير بطارية'],
  ['iphone', 'آيفون', 'apple', 'ios'],
  ['samsung', 'سامسونج', 'android', 'أندرويد', 'huawei', 'هواوي', 'xiaomi', 'شاومي'],

  // ── CAR SERVICES ───────────────────────────────────────────────────────────
  ['ميكانيك', 'ميكانيكي', 'mechanic', 'car mechanic', 'auto repair', 'car repair', 'صيانة سيارات'],
  ['محرك', 'engine', 'motor', 'موتور', 'engine repair', 'إصلاح محرك'],
  ['ناقل حركة', 'gearbox', 'transmission', 'gear', 'فتيس', 'تروس'],
  ['كهرباء سيارة', 'car electrical', 'auto electrical', 'كهربائي سيارات'],
  ['كمبيوتر سيارة', 'car computer', 'ecu', 'obd', 'car diagnostics', 'فحص سيارة'],
  ['دهان سيارة', 'car painting', 'auto body', 'body shop', 'كاروسيري', 'سمكرة'],
  ['زيت', 'oil', 'oil change', 'تغيير زيت', 'engine oil', 'زيت محرك', 'lube'],
  ['إطار', 'tire', 'tyre', 'إطارات', 'tyres', 'tires', 'تبديل إطارات', 'puncture', 'ثقب إطار'],
  ['برادة', 'brakes', 'brake pads', 'brake', 'تيل فرامل', 'فرامل', 'disc', 'drum brake'],
  ['تكييف سيارة', 'car AC', 'car air conditioning', 'فريون سيارة'],
  ['بطارية سيارة', 'car battery', 'battery', 'سلفتة', 'jump start'],
  ['سحب سيارة', 'towing', 'tow truck', 'ونش', 'recovery vehicle', 'انتشال سيارة'],
  ['فلتر', 'filter', 'air filter', 'fuel filter', 'oil filter', 'فلتر هواء', 'فلتر زيت'],
  ['رفرف', 'fender', 'bumper', 'بامبر', 'hood', 'كبوت', 'car body parts'],

  // ── SATELLITE & ELECTRONICS ───────────────────────────────────────────────
  ['دش', 'ستالايت', 'satellite dish', 'satellite', 'dish', 'تلفزيون فضائي', 'قمر صناعي'],
  ['ريسيفر', 'receiver', 'set top box', 'decoder', 'فريسات', 'nilesat', 'نايلسات'],
  ['تركيب دش', 'dish installation', 'satellite installation', 'توجيه دش'],
  ['إلكترونيات', 'electronics', 'electronic repair', 'صيانة إلكترونيات', 'circuit board'],
  ['شاشة LED', 'LED TV', 'OLED', 'QLED', 'smart tv', 'تلفزيون ذكي'],
  ['صوتيات', 'audio', 'sound system', 'speakers', 'سماعات', 'home theater', 'هوم ثيتر'],

  // ── HOME APPLIANCE BRANDS ─────────────────────────────────────────────────
  ['ariston', 'أريستون', 'siemens', 'سيمنز', 'bosch', 'بوش', 'electrolux', 'إلكترولوكس'],
  ['whirlpool', 'ويرلبول', 'zanussi', 'زانوسي', 'beko', 'بيكو', 'sharp', 'شارب'],
  ['تكنو', 'tecno', 'hisense', 'هايسنس', 'tcl', 'toshiba', 'توشيبا'],

  // ── MOVING & TRANSPORT ────────────────────────────────────────────────────
  ['نقل أثاث', 'moving', 'furniture moving', 'relocation', 'شحن أثاث', 'نقل عفش'],
  ['تغليف', 'packing', 'packaging', 'تعبئة', 'wrapping', 'boxes', 'صناديق'],
  ['مستودع', 'storage', 'warehouse', 'تخزين', 'self storage'],

  // ── CLEANING ───────────────────────────────────────────────────────────────
  ['تنظيف', 'cleaning', 'cleaner', 'house cleaning', 'تنظيف منازل', 'maid', 'خادمة'],
  ['غسيل كنب', 'sofa cleaning', 'couch cleaning', 'upholstery cleaning', 'تنظيف مجالس'],
  ['غسيل سجاد', 'carpet cleaning', 'rug cleaning', 'سجادة'],
  ['تنظيف خزان', 'tank cleaning', 'water tank cleaning', 'تعقيم خزان'],
  ['تنظيف واجهات', 'facade cleaning', 'building cleaning', 'window cleaning'],

  // ── PEST CONTROL ──────────────────────────────────────────────────────────
  ['مكافحة حشرات', 'pest control', 'extermination', 'fumigation', 'رش حشرات', 'insecticide'],
  ['صراصير', 'cockroach', 'roaches', 'نمل', 'ants', 'فئران', 'mice', 'rats', 'rodents'],
  ['بق', 'bedbugs', 'bed bugs', 'براغيث', 'fleas', 'mosquito', 'بعوض', 'بعوضة'],
  ['رش مبيدات', 'pesticide', 'spraying', 'مبيدات حشرية'],

  // ── LANDSCAPING & POOL ────────────────────────────────────────────────────
  ['تنسيق حدائق', 'landscaping', 'gardening', 'garden', 'حديقة', 'lawn', 'عشب'],
  ['نباتات', 'plants', 'trees', 'أشجار', 'shrubs', 'شجيرات', 'irrigation', 'ري'],
  ['حوض سباحة', 'swimming pool', 'pool', 'مسبح', 'pool maintenance', 'pool cleaning', 'صيانة مسبح'],
  ['كلور', 'chlorine', 'pool chemicals', 'مواد تنظيف مسبح', 'water treatment'],

  // ── LOCKS & SECURITY ─────────────────────────────────────────────────────
  ['قفل', 'lock', 'locksmith', 'locks', 'lockout', 'تغيير قفل', 'باب مقفل'],
  ['مفتاح', 'key', 'keys', 'duplicate key', 'نسخ مفتاح', 'master key'],
  ['خزنة', 'safe', 'safe box', 'cash safe', 'safe lock'],

  // ── ELEVATOR & ESCALATOR ──────────────────────────────────────────────────
  ['مصعد', 'elevator', 'lift', 'escalator', 'مصعد كهربائي', 'elevator maintenance'],
  ['تركيب مصعد', 'elevator installation', 'lift installation'],

  // ── CURTAINS & UPHOLSTERY ─────────────────────────────────────────────────
  ['ستائر', 'curtains', 'blinds', 'رول', 'roller blinds', 'vertical blinds', 'تركيب ستائر'],
  ['تنجيد', 'upholstery', 'reupholstery', 'كنبة', 'sofa', 'sofa repair'],

  // ── WATERPROOFING ─────────────────────────────────────────────────────────
  ['عزل مائي', 'waterproofing', 'waterproof', 'damp proofing', 'رطوبة', 'moisture', 'water damage'],
  ['عزل حراري', 'thermal insulation', 'insulation', 'heat insulation', 'عازل حرارة'],
  ['عزل صوتي', 'soundproofing', 'sound insulation', 'acoustic', 'عازل صوت'],

  // ── DOORS & WINDOWS (ALUMINUM/UPVC) ──────────────────────────────────────
  ['upvc', 'يو بي في سي', 'pvc doors', 'pvc windows', 'double glazing', 'زجاج مزدوج'],
  ['garage door', 'باب جراج', 'rolling door', 'باب أتوماتيك', 'automatic door', 'باب شاتر', 'شاتر'],

  // ── GENERAL MAINTENANCE ────────────────────────────────────────────────────
  ['صيانة', 'maintenance', 'repair', 'إصلاح', 'fix', 'service', 'خدمة'],
  ['تركيب', 'installation', 'install', 'setup', 'تنصيب', 'installing'],
  ['فحص', 'inspection', 'check', 'testing', 'اختبار', 'diagnosis', 'تشخيص'],
  ['طوارئ', 'emergency', 'urgent', 'عاجل', '24 hours', '24 ساعة', 'on call'],

  // ── CITIES (LIBYA) ────────────────────────────────────────────────────────
  ['طرابلس', 'tripoli', 'tripolis'],
  ['بنغازي', 'benghazi', 'bengazi'],
  ['مصراتة', 'misrata', 'misratah'],
  ['الزاوية', 'zawia', 'zawiya', 'az-zawiyah'],
  ['سبها', 'sebha', 'sabha'],
  ['الخمس', 'khoms', 'al khums', 'alkhumrs'],
  ['زليتن', 'zliten', 'zlitan'],
  ['البيضاء', 'al bayda', 'bayda'],
  ['درنة', 'derna', 'darnah'],
  ['أجدابيا', 'ajdabiya', 'agedabia'],
  ['ترهونة', 'tarhuna', 'tarhunah'],
  ['غريان', 'gharyan', 'gharian'],
  ['يفرن', 'yifren', 'jefren'],
  ['غدامس', 'ghadames', 'ghat'],
  ['مرزق', 'murzuq', 'murzuk'],
];

/**
 * For a given query string, return an expanded list of terms to search.
 * The original query is always included.
 * If the query matches a synonym group, all terms in that group are added.
 */
export function expandSearchTerms(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [query];

  const terms = new Set<string>([query]);

  for (const group of SYNONYM_GROUPS) {
    const matched = group.some(term => {
      const t = term.toLowerCase();
      return t === q || t.includes(q) || q.includes(t);
    });
    if (matched) {
      group.forEach(term => terms.add(term));
    }
  }

  return Array.from(terms);
}
