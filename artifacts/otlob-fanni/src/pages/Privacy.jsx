import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'

const SECTIONS_AR = [
  {
    title: '1. البيانات التي قد نجمعها',
    body: 'قد يجمع التطبيق بعض البيانات التي يرسلها المستخدم طوعًا، مثل: الاسم أو اسم الشركة، رقم الهاتف أو واتساب، المدينة والمنطقة، نوع الخدمة أو التخصص، وصف الخدمة، صور الأعمال أو الشعار، روابط التواصل الاجتماعي، بيانات طلبات التسجيل أو التواصل، أي معلومات يتم إدخالها داخل النماذج أو صفحات المنصة.',
  },
  {
    title: '2. كيفية استخدام البيانات',
    body: 'قد تُستخدم البيانات من أجل: عرض بيانات الفنيين والشركات داخل المنصة، تمكين التواصل بين المستخدمين ومقدمي الخدمات، مراجعة طلبات التسجيل، تحسين تجربة الاستخدام، تقديم الدعم الفني، حماية المنصة ومنع إساءة الاستخدام أو الحسابات المخالفة.',
  },
  {
    title: '3. البيانات الظاهرة للعامة',
    body: 'بعد موافقة الإدارة، قد تظهر بعض البيانات بشكل عام داخل التطبيق أو الموقع، مثل: الاسم أو اسم النشاط، المدينة، التخصص، وصف الخدمة، صور الأعمال، رقم التواصل أو واتساب. ويتحمل مقدم الخدمة مسؤولية البيانات التي يوافق على نشرها داخل المنصة.',
  },
  {
    title: '4. مسؤولية البيانات والمحتوى',
    body: 'يتحمل المستخدم أو مقدم الخدمة المسؤولية الكاملة عن صحة البيانات والصور والمعلومات التي يقوم بإضافتها داخل المنصة. ولا تتحمل منصة اطلب فني مسؤولية أي معلومات غير صحيحة أو مضللة يتم نشرها من قبل المستخدمين أو مقدمي الخدمات.',
  },
  {
    title: '5. مشاركة البيانات',
    body: 'لا تقوم المنصة ببيع بيانات المستخدمين تحت أي ظرف. وقد يتم استخدام أو مشاركة بعض البيانات عند الحاجة لتشغيل المنصة أو عند استخدام خدمات خارجية مثل: واتساب، روابط خرائط، خدمات الاستضافة أو التحليلات. ويخضع استخدام هذه الخدمات لسياسات الخصوصية الخاصة بها.',
  },
  {
    title: '6. ملفات تعريف الارتباط والتحليلات',
    body: 'قد تستخدم المنصة ملفات تعريف الارتباط (Cookies) أو أدوات تحليل الاستخدام لتحسين الأداء وفهم طريقة استخدام التطبيق والموقع.',
  },
  {
    title: '7. تخزين البيانات',
    body: 'يتم تخزين البيانات داخل أنظمة وقواعد بيانات مرتبطة بالمشروع، مع اتخاذ إجراءات مناسبة لحماية المعلومات من الوصول غير المصرح به. ومع ذلك، لا توجد وسيلة نقل أو تخزين إلكترونية آمنة بنسبة 100%.',
  },
  {
    title: '8. مدة الاحتفاظ بالبيانات',
    body: 'تحتفظ المنصة بالبيانات طوال فترة نشاط الحساب. في حال طلب الحذف أو إيقاف الحساب، قد تحتفظ المنصة ببعض البيانات لفترة معقولة لأغراض قانونية أو أمنية أو لمنع إساءة الاستخدام.',
  },
  {
    title: '9. حذف أو تعديل البيانات',
    body: 'يمكن للمستخدم أو مقدم الخدمة طلب تعديل أو حذف بياناته عبر التواصل مع إدارة المنصة من خلال وسائل التواصل الرسمية أو صفحة الدعم.',
  },
  {
    title: '10. الأطفال',
    body: 'المنصة غير مخصصة للأطفال، ولا يتم جمع بيانات الأطفال بشكل مقصود. إذا تبين أن بيانات طفل قد أُدخلت، يمكن التواصل معنا لحذفها فوراً.',
  },
  {
    title: '11. التعديلات والتحديثات',
    body: 'قد يتم تحديث سياسة الخصوصية من وقت لآخر، ويعتبر استمرار استخدام المنصة موافقة على النسخة المحدثة.',
  },
  {
    title: '12. الموافقة على سياسة الخصوصية',
    body: 'باستخدامك للمنصة أو التسجيل فيها، فإنك توافق على سياسة الخصوصية هذه بالكامل.',
  },
  {
    title: '13. التواصل معنا',
    body: 'لأي استفسار بخصوص الخصوصية أو البيانات، يمكن التواصل معنا عبر الموقع الرسمي: www.otlobfanni.ly أو من خلال صفحة الدعم داخل التطبيق.',
  },
]

const SECTIONS_EN = [
  {
    title: '1. Data We May Collect',
    body: 'The app may collect data voluntarily submitted by the user, such as: name or company name, phone number or WhatsApp, city and area, service type or specialty, service description, work photos or logo, social media links, registration or contact request data, and any information entered through forms or pages on the platform.',
  },
  {
    title: '2. How We Use Data',
    body: 'Data may be used to: display technician and company profiles on the platform, enable communication between users and service providers, review registration requests, improve the user experience, provide technical support, and protect the platform from misuse or violations.',
  },
  {
    title: '3. Publicly Visible Data',
    body: 'After admin approval, some data may appear publicly within the app or website, such as: name or business name, city, specialty, service description, work photos, and contact number or WhatsApp. The service provider bears responsibility for the data they agree to publish on the platform.',
  },
  {
    title: '4. Data Responsibility and Content',
    body: 'The user or service provider bears full responsibility for the accuracy of data, images, and information they add to the platform. Otlob Fanni is not responsible for any incorrect or misleading information published by users or service providers.',
  },
  {
    title: '5. Data Sharing',
    body: 'The platform does not sell user data under any circumstances. Some data may be used or shared when necessary to operate the platform or when using external services such as: WhatsApp, map links, or hosting and analytics services. Use of these services is subject to their own privacy policies.',
  },
  {
    title: '6. Cookies and Analytics',
    body: 'The platform may use cookies or usage analytics tools to improve performance and understand how the app and website are used.',
  },
  {
    title: '7. Data Storage',
    body: 'Data is stored within the project\'s systems and databases, with appropriate measures taken to protect information from unauthorized access. However, no method of electronic transmission or storage is 100% secure.',
  },
  {
    title: '8. Data Retention',
    body: 'The platform retains data for as long as the account is active. Upon a deletion request or account suspension, the platform may retain some data for a reasonable period for legal, security, or misuse-prevention purposes.',
  },
  {
    title: '9. Data Deletion or Correction',
    body: 'Users or service providers may request correction or deletion of their data by contacting platform administration through official contact channels or the support page.',
  },
  {
    title: '10. Children',
    body: 'The platform is not intended for children and does not intentionally collect children\'s data. If it is found that a child\'s data was entered, users may contact us to have it deleted immediately.',
  },
  {
    title: '11. Updates',
    body: 'This Privacy Policy may be updated from time to time. Continued use of the platform constitutes acceptance of the updated version.',
  },
  {
    title: '12. Acceptance of Privacy Policy',
    body: 'By using or registering on the platform, you agree to this Privacy Policy in full.',
  },
  {
    title: '13. Contact Us',
    body: 'For any inquiries regarding privacy or data, you can contact us through the official website: www.otlobfanni.ly or through the support page inside the app.',
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
              ? 'توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية البيانات داخل تطبيق وموقع اطلب فني.'
              : 'This Privacy Policy explains how Otlob Fanni collects, uses, and protects data inside the app and website.'}
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
