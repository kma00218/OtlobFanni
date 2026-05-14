/**
 * Comprehensive search index for Otlob Fanni.
 * Each entry has:
 *   type:        'category' | 'section'
 *   id:          the category or section id
 *   sectionId:   the parent section id (for categories)
 *   nameAr:      primary Arabic display name
 *   nameEn:      primary English display name
 *   iconName:    icon key
 *   keywords:    all searchable terms (Arabic + English + synonyms + colloquial)
 */

export const SEARCH_INDEX = [

  // ═══════════════════════════════════════════════════════════
  //  SECTIONS
  // ═══════════════════════════════════════════════════════════
  { type:'section', id:'home_services',     sectionId:null, nameAr:'خدمات منزلية',       nameEn:'Home Services',            iconName:'electricity',
    keywords:['خدمات منزلية','خدمة منزلية','منزل','بيت','شقة','مسكن','بيتي','الدار','home','home services','residential'] },

  { type:'section', id:'car_services',      sectionId:null, nameAr:'خدمات سيارات',        nameEn:'Car Services',             iconName:'maintenance',
    keywords:['خدمات سيارات','سيارة','سيارات','عربية','مركبة','كار','car','cars','car services','auto','vehicle'] },

  { type:'section', id:'construction',      sectionId:null, nameAr:'بناء وتشطيب',         nameEn:'Construction & Finishing', iconName:'contracting',
    keywords:['بناء','تشطيب','تشييد','إنشاء','عمارة','مقاولات','بنيان','construction','finishing','building'] },

  { type:'section', id:'tech_security',     sectionId:null, nameAr:'تقنية وأمن',          nameEn:'Technology & Security',    iconName:'cctv',
    keywords:['تقنية','أمن','تكنولوجيا','امن','حماية','tech','technology','security','IT'] },

  { type:'section', id:'moving_general',    sectionId:null, nameAr:'نقل وخدمات عامة',     nameEn:'Moving & General',         iconName:'moving',
    keywords:['نقل','خدمات عامة','نقلة','عفش','moving','transport','general','general services'] },

  { type:'section', id:'gardens_pools',     sectionId:null, nameAr:'حدائق ومسابح',        nameEn:'Gardens & Pools',          iconName:'cleaning',
    keywords:['حدائق','مسابح','حديقة','مسبح','خضرة','نباتات','gardens','pools','landscaping','garden','pool'] },

  { type:'section', id:'energy_generators', sectionId:null, nameAr:'الطاقة والمولدات',     nameEn:'Energy & Generators',      iconName:'energy_generators',
    keywords:['طاقة','مولدات','مولد','طاقة شمسية','كهرباء احتياطية','انقطاع كهرباء','energy','generators','generator','power','solar'] },

  { type:'section', id:'business_services', sectionId:null, nameAr:'الخدمات التجارية',     nameEn:'Business Services',        iconName:'maintenance',
    keywords:['خدمات تجارية','تجارية','محلات','مطاعم','شركات','مكاتب','business','commercial','shops','restaurants','offices'] },

  { type:'section', id:'more_services',     sectionId:null, nameAr:'المزيد من الخدمات',   nameEn:'More Services',            iconName:'more',
    keywords:['خدمات أخرى','تخصصات أخرى','أخرى','other','more','other services','misc','miscellaneous'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — خدمات منزلية
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'electricity', sectionId:'home_services', nameAr:'كهرباء', nameEn:'Electricity', iconName:'electricity',
    keywords:['كهرباء','كهربائي','كهربجي','تيار','لوحة كهربائية','قاطع','قواطع','فيوز','أسلاك','اسلاك','تمديد كهرباء','وصلات','مفتاح كهرباء','مقبس','بريزة','انارة','اضاءة','ضوء','نور','electricity','electrical','electrician','wiring','wire','circuit','breaker','socket','outlet','lighting'] },

  { type:'category', id:'plumbing', sectionId:'home_services', nameAr:'سباكة', nameEn:'Plumbing', iconName:'plumbing',
    keywords:['سباكة','سباك','مواسير','مواصير','ماسورة','صرف صحي','صرف','تسريب','تسرب','تسربات','مياه','ماء','حنفية','خرطوم','حمام','مجاري','بالوعة','خزان','مضخة','صنبور','شروع','bالوعة','plumbing','plumber','pipe','pipes','drain','drainage','water leak','leak','tap','faucet','toilet','bathroom'] },

  { type:'category', id:'ac', sectionId:'home_services', nameAr:'تكييف ومكيفات', nameEn:'Air Conditioning', iconName:'ac',
    keywords:['تكييف','مكيف','مكيفات','كيمافي','فريون','غاز تكييف','تبريد','برودة','سبليت','سنترال','صيانة مكيف','تعبئة غاز','شارژ','شارج غاز','ايركو','AC','air conditioning','aircon','air conditioner','split','central AC','cooling','refrigerant','freon'] },

  { type:'category', id:'painting', sectionId:'home_services', nameAr:'دهانات', nameEn:'Painting', iconName:'painting',
    keywords:['دهان','دهانات','دهن','صباغة','صباغ','طلاء','طلي','فينيش','بوية','دهن حيطان','ديكور','تشطيب دهان','دهان زيتي','دهان مائي','painting','painter','paint','wall paint','coat','coating','finish','decor'] },

  { type:'category', id:'carpentry', sectionId:'home_services', nameAr:'نجارة', nameEn:'Carpentry', iconName:'carpentry',
    keywords:['نجارة','نجار','خشب','مطبخ','مطابخ','غرفة نوم','دولاب','باب','أثاث','أثاث مدمج','كبتة','كيبانة','رف','رفوف','اثاث','خزانة','carpentry','carpenter','wood','wooden','kitchen cabinet','wardrobe','door','furniture','closet','bedroom'] },

  { type:'category', id:'cleaning', sectionId:'home_services', nameAr:'تنظيف منازل', nameEn:'Home Cleaning', iconName:'cleaning',
    keywords:['تنظيف','نظافة','غسيل','موكيت','سجادة','سجاد','كنبة','كنب','تعقيم','ترتيب منزل','تنظيف عميق','تنظيف منازل','بعد بناء','تنظيف بعد البناء','cleaning','cleaner','deep clean','housekeeping','maid','carpet','sofa','furniture cleaning'] },

  { type:'category', id:'appliances', sectionId:'home_services', nameAr:'أجهزة منزلية', nameEn:'Home Appliances', iconName:'appliances',
    keywords:['أجهزة منزلية','جهاز','ثلاجة','براد','غسالة','بوتاجاز','موقد','فرن','ميكروويف','تلفزيون','شاشة','طاسة','تنكة','مروحة','خلاط','مكنسة','صيانة أجهزة','appliances','fridge','refrigerator','washing machine','washer','cooker','stove','oven','microwave','TV','television','fan','repair'] },

  { type:'category', id:'locks', sectionId:'home_services', nameAr:'أقفال وأبواب', nameEn:'Locks & Doors', iconName:'locks_doors',
    keywords:['أقفال','قفل','باب','أبواب','مفتاح','مفاتيح','فتح باب','تغيير قفل','ياية','قفل سيفتي','سيف','قفل رقمي','locks','locksmith','door','key','lock','deadbolt','handle'] },

  { type:'category', id:'pumps', sectionId:'home_services', nameAr:'مضخات مياه', nameEn:'Water Pumps', iconName:'plumbing',
    keywords:['مضخة','مضخات','مضخة مياه','ضخ مياه','موتور مياه','موتور ماء','طلمبة','تالمبة','pumps','water pump','pump','motor','water motor'] },

  { type:'category', id:'gas', sectionId:'home_services', nameAr:'تأسيس غاز', nameEn:'Gas Installation', iconName:'gas',
    keywords:['غاز','تأسيس غاز','أنابيب غاز','نقطة غاز','موقد غاز','بوتوجاز','gas','gas installation','gas pipe','gas line','cooking gas','LPG'] },

  { type:'category', id:'home_help', sectionId:'home_services', nameAr:'مساعدة منزلية وتنظيف', nameEn:'Home Help & Cleaning', iconName:'cleaning',
    keywords:['مساعدة منزلية','عاملة منزل','خادمة','عاملة','ترتيب','تنظيف يومي','home help','maid','housekeeper','domestic worker','daily cleaning'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — خدمات سيارات
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'car_mechanic', sectionId:'car_services', nameAr:'ميكانيكي سيارات', nameEn:'Car Mechanic', iconName:'car_mechanic',
    keywords:['ميكانيكي','ميكانيكا','عطل سيارة','سيارة','كشف عطل','إصلاح سيارة','car mechanic','mechanic','engine','engine repair','auto repair','car repair'] },

  { type:'category', id:'auto_electrician', sectionId:'car_services', nameAr:'كهربائي سيارات', nameEn:'Auto Electrician', iconName:'electricity',
    keywords:['كهربائي سيارات','كهرباء سيارة','كهربائي عربية','auto electrician','car electrician','vehicle electrician','auto electric'] },

  { type:'category', id:'car_body', sectionId:'car_services', nameAr:'سمكري سيارات', nameEn:'Car Body Repair', iconName:'welding',
    keywords:['سمكرة','سمكري','سمكريات','دنكر','دهشة','هيكل سيارة','بلي','حوادث','car body','body repair','dent','dent repair','bodywork','panel beating','autobody'] },

  { type:'category', id:'tire_repair', sectionId:'car_services', nameAr:'بنشر متنقل', nameEn:'Mobile Tire Repair', iconName:'tire_repair',
    keywords:['بنشر','إطار','إطارات','كاوتش','كاوتشوك','تغيير إطار','ثقب كاوتش','tire','tyre','flat tire','puncture','wheel','rim','mobile tire'] },

  { type:'category', id:'car_battery', sectionId:'car_services', nameAr:'بطاريات سيارات', nameEn:'Car Batteries', iconName:'car_battery',
    keywords:['بطارية سيارة','بطارية عربية','شحن بطارية','تغيير بطارية','أكو','اكو','car battery','battery','battery replacement','jump start','battery charge'] },

  { type:'category', id:'car_ac', sectionId:'car_services', nameAr:'تكييف سيارات', nameEn:'Car AC', iconName:'ac',
    keywords:['تكييف سيارة','مكيف سيارة','غاز سيارة','فريون سيارة','car AC','car air conditioning','auto AC','car cooling','vehicle AC'] },

  { type:'category', id:'towing', sectionId:'car_services', nameAr:'ونش وسحب سيارات', nameEn:'Towing', iconName:'moving',
    keywords:['ونش','سحب سيارة','رافعة سيارة','انقلبت','عطلت','towing','tow truck','winch','roadside assistance','car tow'] },

  { type:'category', id:'car_wash', sectionId:'car_services', nameAr:'غسيل سيارات متنقل', nameEn:'Mobile Car Wash', iconName:'car_wash',
    keywords:['غسيل سيارة','كارواش','غسيل عربية','تلميع','وكس','car wash','carwash','mobile car wash','detailing','polish','wax'] },

  { type:'category', id:'car_diagnostics', sectionId:'car_services', nameAr:'فحص كمبيوتر سيارات', nameEn:'Car Diagnostics', iconName:'car_diagnostics',
    keywords:['فحص كمبيوتر','كمبيوتر سيارة','اسكانر','سكانر','تشخيص اعطال','car diagnostics','scanner','OBD','OBD2','computer scan','fault code','error code'] },

  { type:'category', id:'oil_change', sectionId:'car_services', nameAr:'تبديل زيت وفلاتر', nameEn:'Oil & Filter Change', iconName:'oil_change',
    keywords:['تغيير زيت','تبديل زيت','زيت سيارة','فلتر زيت','فلتر','سيرفس','صيانة دورية','oil change','oil filter','lube','filter change','service'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — بناء وتشطيب
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'contracting', sectionId:'construction', nameAr:'مقاولات', nameEn:'Contracting', iconName:'contracting',
    keywords:['مقاولات','مقاول','بناء','انشاء','تشييد','إنشاء','عمارة','فيلا','عقار','contracting','contractor','construction','build','builder','civil','general contractor'] },

  { type:'category', id:'aluminum', sectionId:'construction', nameAr:'ألمنيوم وزجاج', nameEn:'Aluminum & Glass', iconName:'aluminum_glass',
    keywords:['ألمنيوم','الألمنيوم','زجاج','شبابيك','نوافذ','باب ألمنيوم','واجهات','فاصل','مقسم','aluminum','aluminium','glass','window','windows','facade','partition','glazing'] },

  { type:'category', id:'tiles', sectionId:'construction', nameAr:'بلاط وسيراميك', nameEn:'Tiles & Ceramics', iconName:'tiles',
    keywords:['بلاط','تبليط','بلاطة','سيراميك','رخام','بورسلين','porcelain','أرضيات','tiles','tile','ceramic','marble','floor','flooring','tiling','grout'] },

  { type:'category', id:'gypsum', sectionId:'construction', nameAr:'جبس وديكور', nameEn:'Gypsum & Decor', iconName:'painting',
    keywords:['جبس','جبسون','جبس بورد','ديكور','تجصيص','سقف جبس','gypsum','drywall','plasterboard','ceiling','decor','decoration','interior','cornice'] },

  { type:'category', id:'welding', sectionId:'construction', nameAr:'حدادة', nameEn:'Welding', iconName:'welding',
    keywords:['حدادة','حداد','لحام','لحامة','بوابة','بوابات','شباك حديد','سور','قضبان','سلم حديد','welding','welder','weld','metal','iron','gate','fence','railing','steel','fabrication'] },

  { type:'category', id:'waterproof', sectionId:'construction', nameAr:'عزل مائي', nameEn:'Waterproofing', iconName:'waterproofing',
    keywords:['عزل مائي','عزل مياه','تسريب مياه','منع تسرب','سطح مسرب','رطوبة','حمام مسرب','waterproofing','water proofing','waterproof','leak','leaking roof','damp','moisture'] },

  { type:'category', id:'thermal', sectionId:'construction', nameAr:'عزل حراري', nameEn:'Thermal Insulation', iconName:'thermal_insulation',
    keywords:['عزل حراري','عزل الحرارة','عازل','سخونة','حرارة','thermal insulation','insulation','heat insulation','foam insulation'] },

  { type:'category', id:'concrete', sectionId:'construction', nameAr:'أعمال خرسانة', nameEn:'Concrete Works', iconName:'maintenance',
    keywords:['خرسانة','إسمنت','أسمنت','صب','سقف','أرضية خرسانة','concrete','cement','pouring','slab','foundation','reinforced concrete'] },

  { type:'category', id:'roofing', sectionId:'construction', nameAr:'أعمال أسقف', nameEn:'Roofing', iconName:'solar',
    keywords:['سقف','أسطح','سطح','تسقيف','صيانة سطح','صفيح','اسبستوس','roofing','roof','roof repair','flat roof','metal roof'] },

  { type:'category', id:'plastering', sectionId:'construction', nameAr:'عامل لياسة ومحارة', nameEn:'Plastering', iconName:'plastering',
    keywords:['لياسة','ليس','محارة','بياض','جص','تبييض','plaster','plastering','render','wall plaster','skimming'] },

  { type:'category', id:'excavator', sectionId:'construction', nameAr:'سائق حفار', nameEn:'Excavator', iconName:'heavy_truck_driver',
    keywords:['حفار','حفارة','حفر','تحفير','excavator','excavation','digger','digging','earth moving'] },

  { type:'category', id:'loader', sectionId:'construction', nameAr:'سائق كاشيك / لودر', nameEn:'Loader', iconName:'workers',
    keywords:['كاشيك','لودر','جرافة','تحريك تراب','loader','bulldozer','skid steer','front loader','earth mover'] },

  { type:'category', id:'heavy_equipment', sectionId:'construction', nameAr:'معدات ثقيلة', nameEn:'Heavy Equipment', iconName:'generator',
    keywords:['معدات ثقيلة','معدات','اليات','آليات','heavy equipment','machinery','crane','equipment','heavy machinery'] },

  { type:'category', id:'crusher_materials', sectionId:'construction', nameAr:'كسارة ومواد بناء', nameEn:'Crusher & Building Materials', iconName:'backup_power',
    keywords:['كسارة','رمل','حصى','حجارة','مواد بناء','ركام','فرزة','بريم','crusher','sand','gravel','aggregate','building materials','stone','construction materials'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — تقنية وأمن
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'cctv', sectionId:'tech_security', nameAr:'كاميرات مراقبة', nameEn:'CCTV', iconName:'cctv',
    keywords:['كاميرات','كاميرا','مراقبة','كاميرات مراقبة','DVR','NVR','تسجيل','حماية','CCTV','camera','surveillance','security camera','IP camera','recorder','monitoring'] },

  { type:'category', id:'networks', sectionId:'tech_security', nameAr:'شبكات وإنترنت', nameEn:'Networks & Internet', iconName:'network',
    keywords:['شبكات','انترنت','إنترنت','راوتر','روتر','كابل شبكة','واي فاي','wifi','نت','تمديد شبكة','LAN','switch','hub','network','internet','router','WiFi','cable','LAN','networking','broadband'] },

  { type:'category', id:'satellite', sectionId:'tech_security', nameAr:'ستلايت ورسيفر', nameEn:'Satellite', iconName:'satellite',
    keywords:['ستلايت','ستليت','ستالايت','دش','دشة','رسيفر','فضائية','قنوات فضائية','توجيه دش','satellite','dish','receiver','aerial','antenna','TV satellite','dish alignment'] },

  { type:'category', id:'alarm', sectionId:'tech_security', nameAr:'أنظمة إنذار', nameEn:'Alarm Systems', iconName:'alarm',
    keywords:['إنذار','إنذار حريق','انذار سرقة','أجراس','سنسور','alarm','fire alarm','burglar alarm','intruder alarm','sensor','detector','smoke detector'] },

  { type:'category', id:'computer', sectionId:'tech_security', nameAr:'صيانة كمبيوتر', nameEn:'Computer Maintenance', iconName:'computer',
    keywords:['كمبيوتر','لابتوب','حاسوب','PC','حاسب','ويندوز','صيانة كمبيوتر','تصليح لابتوب','فورمات','فيروس','شاشة كمبيوتر','طابعة','computer','laptop','PC','desktop','Windows','Mac','format','virus','repair','screen','printer','IT'] },

  { type:'category', id:'mobile_repair', sectionId:'tech_security', nameAr:'صيانة هواتف', nameEn:'Mobile Repair', iconName:'mobile_repair',
    keywords:['هاتف','موبايل','جوال','جهاز','تليفون','شاشة مكسورة','كسر شاشة','تصليح موبايل','آيفون','سامسونج','أندرويد','بطارية هاتف','mobile','phone','smartphone','iPhone','Samsung','Android','screen repair','broken screen','battery replace'] },

  { type:'category', id:'access_control', sectionId:'tech_security', nameAr:'أنظمة دخول وبوابات', nameEn:'Access Control', iconName:'locks_doors',
    keywords:['أنظمة دخول','بصمة','بصمة إصبع','قارئ بطاقة','باب كهربائي','بوابة كهربائية','أمن دخول','access control','fingerprint','card reader','electric door','electric gate','door controller','biometric'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — نقل وخدمات عامة
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'moving', sectionId:'moving_general', nameAr:'نقل أثاث', nameEn:'Furniture Moving', iconName:'moving',
    keywords:['نقل أثاث','نقلة','عفش','نقل عفش','نقل منزل','شحن','ترحيل','نقل','moving','furniture moving','relocation','house moving','removals','movers'] },

  { type:'category', id:'maintenance', sectionId:'moving_general', nameAr:'صيانة عامة', nameEn:'General Maintenance', iconName:'maintenance',
    keywords:['صيانة عامة','فني عام','صيانة','اعمال يدوية','handyman','general maintenance','general repair','odd jobs','fix'] },

  { type:'category', id:'workers', sectionId:'moving_general', nameAr:'عمالة يومية', nameEn:'Daily Workers', iconName:'workers',
    keywords:['عمالة','عمال','عامل','عمالة يومية','يومية','عمال يومية','أعمال','labor','worker','workers','daily worker','laborer','manpower','day labor'] },

  { type:'category', id:'loading', sectionId:'moving_general', nameAr:'تحميل وتنزيل', nameEn:'Loading & Unloading', iconName:'moving',
    keywords:['تحميل','تنزيل','شحن','تفريغ','تفريغ بضاعة','loading','unloading','cargo','freight','warehouse'] },

  { type:'category', id:'tank_cleaning', sectionId:'moving_general', nameAr:'تنظيف خزانات', nameEn:'Tank Cleaning', iconName:'tank_cleaning',
    keywords:['تنظيف خزان','خزان مياه','خزان','تطهير خزان','غسيل خزان','tank cleaning','water tank','tank','cistern','reservoir'] },

  { type:'category', id:'pest_control', sectionId:'moving_general', nameAr:'مكافحة حشرات', nameEn:'Pest Control', iconName:'pest_control',
    keywords:['حشرات','مكافحة حشرات','رش حشرات','مبيد','نمل','صراصير','بعوض','ذباب','فئران','جرذان','بق','pest control','pesticide','insects','cockroach','ants','mosquito','rats','mice','fumigation','exterminator'] },

  { type:'category', id:'truck_driver', sectionId:'moving_general', nameAr:'سائق شاحنة', nameEn:'Truck Driver', iconName:'moving',
    keywords:['سائق شاحنة','شاحنة','لوري','شاحنة نقل','سائق','truck','truck driver','lorry','cargo truck','delivery truck'] },

  { type:'category', id:'heavy_transport', sectionId:'moving_general', nameAr:'نقل ثقيل', nameEn:'Heavy Transport', iconName:'tire_repair',
    keywords:['نقل ثقيل','نقل معدات','نقل آليات','ترحيل معدات','heavy transport','heavy haulage','equipment transport','oversized load'] },

  { type:'category', id:'tipper_truck', sectionId:'moving_general', nameAr:'قلاب ودنبر', nameEn:'Tipper Truck', iconName:'tank_cleaning',
    keywords:['قلاب','دنبر','دمبر','رمل','ركام','تراب','tipper','tipper truck','dumper','dump truck','tipper lorry'] },

  { type:'category', id:'construction_transport', sectionId:'moving_general', nameAr:'نقل مواد بناء', nameEn:'Construction Materials Transport', iconName:'contracting',
    keywords:['نقل مواد بناء','مواد بناء','نقل ركام','توريد مواد','construction transport','building materials transport','materials delivery'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — حدائق ومسابح
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'landscaping', sectionId:'gardens_pools', nameAr:'تنسيق حدائق', nameEn:'Landscaping', iconName:'landscaping',
    keywords:['تنسيق حدائق','تصميم حدائق','حديقة منزلية','حديقة','landscaping','landscape design','garden design','lawn','turf','horticulture'] },

  { type:'category', id:'garden', sectionId:'gardens_pools', nameAr:'صيانة حدائق', nameEn:'Garden Maintenance', iconName:'garden',
    keywords:['صيانة حدائق','حديقة','نباتات','قص عشب','حشيش','زرع','ري','garden maintenance','garden','gardening','plants','lawn mowing','pruning','watering'] },

  { type:'category', id:'pool', sectionId:'gardens_pools', nameAr:'صيانة مسابح', nameEn:'Pool Maintenance', iconName:'pool',
    keywords:['مسبح','حوض سباحة','صيانة مسبح','كلور','معالجة مياه مسبح','pool','swimming pool','pool maintenance','chlorine','water treatment','jacuzzi'] },

  { type:'category', id:'pool_cleaning', sectionId:'gardens_pools', nameAr:'تنظيف مسابح', nameEn:'Pool Cleaning', iconName:'pool_cleaning',
    keywords:['تنظيف مسبح','نظافة مسبح','غسيل مسبح','pool cleaning','clean pool','pool scrub','pool service'] },

  { type:'category', id:'irrigation', sectionId:'gardens_pools', nameAr:'شبكات ري', nameEn:'Irrigation', iconName:'plumbing',
    keywords:['ري','شبكة ري','رش','مرشات','تقطير','ري بالتقطير','irrigation','sprinkler','drip irrigation','garden irrigation','watering system'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — الطاقة والمولدات
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'generator', sectionId:'energy_generators', nameAr:'صيانة مولدات', nameEn:'Generator Maintenance', iconName:'generator',
    keywords:['مولد','مولدات','جنريتور','صيانة مولد','انقطاع كهرباء','ديزل','generator','generator maintenance','power generator','diesel generator','genset','standby power'] },

  { type:'category', id:'generator_install', sectionId:'energy_generators', nameAr:'تركيب مولدات', nameEn:'Generator Installation', iconName:'generator_install',
    keywords:['تركيب مولد','تركيب جنريتور','تركيب كهرباء احتياطية','generator installation','generator setup','install generator','generator wiring'] },

  { type:'category', id:'solar', sectionId:'energy_generators', nameAr:'طاقة شمسية', nameEn:'Solar Energy', iconName:'solar',
    keywords:['طاقة شمسية','ألواح شمسية','لوح شمسي','بانل شمسي','سولار','شمسي','انرجي','solar','solar panel','solar energy','PV','photovoltaic','renewable energy','solar system','solar power'] },

  { type:'category', id:'battery_inverter', sectionId:'energy_generators', nameAr:'بطاريات وإنفرتر', nameEn:'Batteries & Inverters', iconName:'battery_inverter',
    keywords:['إنفرتر','انفرتر','انقطاع كهرباء','بطارية احتياطية','شارجر','inverter','battery','batteries','UPS battery','power backup','backup power','charger','charge controller'] },

  { type:'category', id:'ups', sectionId:'energy_generators', nameAr:'صيانة UPS', nameEn:'UPS Maintenance', iconName:'ups',
    keywords:['يو بي اس','UPS','ups','uninterruptible','طاقة لا تنقطع','صيانة ups','UPS maintenance','power protection'] },

  { type:'category', id:'backup_power', sectionId:'energy_generators', nameAr:'تمديدات كهرباء احتياطية', nameEn:'Backup Power Wiring', iconName:'backup_power',
    keywords:['تمديدات احتياطية','كهرباء احتياطية','خط احتياطي','backup power','backup wiring','emergency power','alternative power'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — الخدمات التجارية
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'shop_maintenance', sectionId:'business_services', nameAr:'صيانة محلات', nameEn:'Shop Maintenance', iconName:'shop_maintenance',
    keywords:['صيانة محل','محل','محلات','دكان','متجر','shop maintenance','shop repair','store maintenance','retail','commercial'] },

  { type:'category', id:'office_cleaning', sectionId:'business_services', nameAr:'تنظيف شركات ومكاتب', nameEn:'Office Cleaning', iconName:'cleaning',
    keywords:['تنظيف شركة','تنظيف مكتب','تنظيف مكاتب','نظافة مكاتب','office cleaning','commercial cleaning','corporate cleaning','office','workplace cleaning'] },

  { type:'category', id:'shop_cctv', sectionId:'business_services', nameAr:'تجهيز كاميرات للمحلات', nameEn:'Shop CCTV', iconName:'cctv',
    keywords:['كاميرات محل','كاميرات مراقبة محلات','كاميرا للمحل','أمن محل','shop camera','shop CCTV','store surveillance','retail security','shop security camera'] },

  { type:'category', id:'restaurant_maintenance', sectionId:'business_services', nameAr:'صيانة مطاعم', nameEn:'Restaurant Maintenance', iconName:'restaurant_maintenance',
    keywords:['صيانة مطعم','مطعم','مطاعم','كافيه','مقهى','فندق','restaurant maintenance','restaurant','cafe','coffee shop','hotel maintenance'] },

  { type:'category', id:'office_maintenance', sectionId:'business_services', nameAr:'صيانة مكاتب', nameEn:'Office Maintenance', iconName:'office_maintenance',
    keywords:['صيانة مكتب','صيانة مكاتب','صيانة شركة','office maintenance','corporate maintenance','facility management','office repair'] },

  { type:'category', id:'signs', sectionId:'business_services', nameAr:'لوحات وإعلانات', nameEn:'Signs & Advertising', iconName:'signs',
    keywords:['لوحات','لوحة محل','إعلانات','إعلان','لافتات','لافتة','شاشة إعلانية','يافطة','signs','signage','advertising','banner','billboard','LED sign','digital sign','sign board'] },

  { type:'category', id:'coffee_machine', sectionId:'business_services', nameAr:'فني ماكينة قهوة', nameEn:'Coffee Machine Technician', iconName:'coffee_machine',
    keywords:['ماكينة قهوة','قهوة','اسبريسو','espresso','كافيه','قهوجي','ماكينة','coffee machine','coffee maker','espresso machine','café equipment','barista machine','coffee grinder'] },

  { type:'category', id:'restaurant_equipment', sectionId:'business_services', nameAr:'فني معدات مطاعم ومقاهي', nameEn:'Restaurant Equipment', iconName:'restaurant_equipment',
    keywords:['معدات مطعم','معدات مطاعم','معدات مقهى','أجهزة مطعم','فرن مطعم','ثلاجة مطعم','مطبخ تجاري','restaurant equipment','commercial kitchen','kitchen equipment','catering equipment'] },

  { type:'category', id:'shawarma', sectionId:'business_services', nameAr:'أسطى شاورما', nameEn:'Shawarma', iconName:'shawarma',
    keywords:['شاورما','أسطى شاورما','شواء','دوار','دوارة شاورما','shawarma','shawerma','rotisserie','doner','shawarma maker'] },

  { type:'category', id:'grill', sectionId:'business_services', nameAr:'أسطى مشاوي', nameEn:'Grill Worker', iconName:'grill',
    keywords:['مشاوي','شواء','مشوي','كباب','برجر','شيش','grill','grilling','barbecue','BBQ','charcoal grill','mangal','kebab'] },

  { type:'category', id:'pastry', sectionId:'business_services', nameAr:'أسطى معجنات وبريوش وكريب', nameEn:'Pastry Worker', iconName:'pastry',
    keywords:['معجنات','بريوش','كريب','حلويات','خبز','كيك','مخبوزات','pastry','brioche','crepe','bakery','patisserie','cake','bread','confectionery'] },

  { type:'category', id:'restaurant_staff', sectionId:'business_services', nameAr:'عمالة مطاعم ومقاهي', nameEn:'Restaurant & Cafe Staff', iconName:'restaurant_staff',
    keywords:['عمالة مطعم','عمالة مقهى','نادل','ويتر','كاشير','cashier','طاقم مطعم','restaurant staff','waiter','waitress','cashier','barista','café staff','food service'] },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES — خدمات أخرى (catch-all)
  // ═══════════════════════════════════════════════════════════
  { type:'category', id:'more', sectionId:'more_services', nameAr:'خدمات أخرى', nameEn:'Other Services', iconName:'more',
    keywords:['خدمات أخرى','تخصصات أخرى','أخرى','مخصص','غير مصنف','other','more','other services','custom','misc','miscellaneous','special'] },
]

// ─── Arabic Normalizer ────────────────────────────────────────────────────────
// Strips diacritics, normalises hamza variants → ا, ة → ه, ى → ي
export function normalizeAr(s) {
  if (!s) return ''
  return s
    .replace(/[\u064B-\u065F\u0670]/g, '')   // diacritics / tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
}

// ─── Fuzzy Search ─────────────────────────────────────────────────────────────
// Returns scored, deduplicated results sorted best-first, capped at maxResults.
export function searchIndex(rawQuery, maxResults = 8) {
  const q = normalizeAr(rawQuery.trim())
  if (!q) return []

  const tokens = q.split(/\s+/).filter(Boolean)

  const scored = SEARCH_INDEX.map(entry => {
    const haystack = [
      entry.nameAr,
      entry.nameEn,
      ...(entry.keywords || []),
    ].map(normalizeAr)

    let best = 0

    for (const token of tokens) {
      for (const h of haystack) {
        if (!h) continue
        if (h === token)          { best = Math.max(best, 100); break }
        if (h.startsWith(token))  { best = Math.max(best, 80) }
        else if (h.includes(token)) { best = Math.max(best, 60) }
      }
    }

    // Multi-token bonus: if ALL tokens match something in this entry
    if (tokens.length > 1) {
      const allMatch = tokens.every(tok =>
        haystack.some(h => h.includes(tok))
      )
      if (allMatch) best += 15
    }

    // Prefer sections slightly less than categories (they are broader)
    if (entry.type === 'section') best = Math.max(0, best - 5)

    return { entry, score: best }
  })

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(r => r.entry)
}
