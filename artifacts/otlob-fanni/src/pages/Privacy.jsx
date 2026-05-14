import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'

const SECTIONS_AR = [
  {
    title: '1. البيانات التي قد نجمعها',
    body: 'قد يجمع التطبيق البيانات التالية: الاسم، رقم الهاتف، رقم واتساب، المدينة والمنطقة، نوع الخدمة أو التخصص، وصف الخدمة، صورة شخصية أو شعار الشركة، صور الأعمال السابقة، روابط التواصل الاجتماعي الاختيارية، بيانات طلبات الانضمام أو طلبات التواصل، أي معلومات يرسلها المستخدم طوعًا عبر النماذج داخل التطبيق.',
  },
  {
    title: '2. كيف نستخدم البيانات',
    body: 'نستخدم البيانات من أجل: عرض بيانات الفنيين والشركات بعد موافقة الإدارة، تمكين المستخدمين من التواصل مع مقدمي الخدمات، مراجعة طلبات الانضمام، تحسين جودة التطبيق، تقديم الدعم والرد على الاستفسارات، ومنع الحسابات أو المحتوى غير المناسب.',
  },
  {
    title: '3. البيانات التي تظهر للعامة',
    body: 'بعد موافقة الإدارة، قد تظهر بعض بيانات مقدم الخدمة داخل التطبيق، مثل: الاسم أو اسم الشركة، المدينة والمنطقة، التخصص، وصف الخدمة، رقم الهاتف أو واتساب، صورة الملف أو شعار الشركة، وصور الأعمال. لا يتم عرض أي بيانات داخلية أو معلومات غير مخصصة للنشر العام.',
  },
  {
    title: '4. مشاركة البيانات',
    body: 'لا نبيع بيانات المستخدمين. قد تتم مشاركة بعض البيانات فقط عند الضرورة لتشغيل التطبيق أو عند استخدام خدمات خارجية مثل واتساب أو رابط موقع خارجي. عند استخدام خدمات خارجية، تخضع البيانات لسياسات تلك الخدمات.',
  },
  {
    title: '5. تخزين البيانات',
    body: 'يتم تخزين بيانات التطبيق داخل أنظمة التخزين الخاصة بالمشروع. يتم حفظ البيانات المنظمة في قاعدة البيانات، بينما يتم حفظ الصور والملفات في نظام تخزين الملفات عند الحاجة.',
  },
  {
    title: '6. حماية البيانات',
    body: 'نستخدم إجراءات مناسبة للمساعدة في حماية البيانات من الوصول غير المصرح به أو الاستخدام غير المناسب. ومع ذلك، لا توجد وسيلة تخزين أو نقل عبر الإنترنت آمنة بنسبة 100%.',
  },
  {
    title: '7. حذف أو تعديل البيانات',
    body: 'يمكن لمقدم الخدمة طلب تعديل أو حذف بياناته من خلال التواصل مع إدارة التطبيق عبر صفحة الدعم أو وسائل التواصل الرسمية.',
  },
  {
    title: '8. الأطفال',
    body: 'التطبيق غير موجه للأطفال. إذا تبين أن بيانات طفل تم إدخالها بدون موافقة مناسبة، يمكن التواصل معنا لحذفها.',
  },
  {
    title: '9. التحديثات',
    body: 'قد يتم تحديث سياسة الخصوصية من وقت لآخر. سيتم نشر النسخة المحدثة داخل التطبيق.',
  },
  {
    title: '10. التواصل معنا',
    body: 'لأي استفسار بخصوص الخصوصية أو حذف البيانات، يمكن التواصل معنا عبر صفحة الدعم داخل التطبيق أو عبر الموقع: otlobfanni.ly',
  },
]

const SECTIONS_EN = [
  {
    title: '1. Data We May Collect',
    body: 'The app may collect the following data: Name, phone number, WhatsApp number, city and area, service category or specialty, service description, personal photo or company logo, work gallery images, optional social media links, technician/company application data or contact request data, and any information voluntarily submitted through forms inside the app.',
  },
  {
    title: '2. How We Use Data',
    body: 'We use data to: display technician and company profiles after admin approval, enable users to contact service providers, review service provider applications, improve app quality, provide support and respond to inquiries, and prevent inappropriate accounts or content.',
  },
  {
    title: '3. Publicly Visible Data',
    body: 'After admin approval, some service provider data may appear publicly in the app, such as: name or company name, city and area, service category, service description, phone or WhatsApp number, profile photo or company logo, and work images. Internal or non-public data is not displayed publicly.',
  },
  {
    title: '4. Data Sharing',
    body: 'We do not sell user data. Some data may be shared only when necessary to operate the app or when using external services such as WhatsApp or external website links. External services are governed by their own privacy policies.',
  },
  {
    title: '5. Data Storage',
    body: 'App data is stored within the project\'s storage systems. Structured data is stored in the database, while images and files are stored in file storage when needed.',
  },
  {
    title: '6. Data Security',
    body: 'We use reasonable measures to help protect data from unauthorized access or misuse. However, no method of internet transmission or storage is 100% secure.',
  },
  {
    title: '7. Data Deletion or Correction',
    body: 'Service providers may request correction or deletion of their data by contacting the app administration through the support page or official contact channels.',
  },
  {
    title: '8. Children',
    body: 'The app is not directed to children. If we learn that a child\'s data was submitted without appropriate consent, users may contact us to request deletion.',
  },
  {
    title: '9. Updates',
    body: 'This Privacy Policy may be updated from time to time. The updated version will be published inside the app.',
  },
  {
    title: '10. Contact Us',
    body: 'For privacy questions or data deletion requests, contact us through the support page inside the app or through: otlobfanni.ly',
  },
]

export default function Privacy() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const sections = ar ? SECTIONS_AR : SECTIONS_EN

  return (
    <div className="bg-background min-h-screen pt-20 pb-10" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'سياسة الخصوصية' : 'Privacy Policy'} />
      <main className="px-4 py-6 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h1 className="text-xl font-bold text-[#071B33] mb-1">
            {ar ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-gray-400 mb-4">
            {ar
              ? 'توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية البيانات داخل تطبيق اطلب فني.'
              : 'This Privacy Policy explains how Otlob Fanni collects, uses, and protects data inside the app.'}
          </p>
          <div className="space-y-4">
            {sections.map((s, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-[#071B33] mb-1">{s.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center pb-2">
          {ar ? 'آخر تحديث: 2026' : 'Last updated: 2026'} · www.otlobfanni.ly
        </p>
      </main>
    </div>
  )
}
