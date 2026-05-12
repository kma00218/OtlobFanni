import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'

const SECTIONS_AR = [
  {
    title: '1. طبيعة التطبيق',
    body: 'اطلب فني هو منصة دليل خدمات تساعد المستخدمين على العثور على فنيين وشركات والتواصل معهم. التطبيق لا يضمن جودة الخدمة المقدمة من أي فني أو شركة، ولا يكون طرفًا مباشرًا في الاتفاق بين المستخدم ومقدم الخدمة.',
  },
  {
    title: '2. مسؤولية المستخدم',
    body: 'يتحمل المستخدم مسؤولية اختيار مقدم الخدمة المناسب، والاتفاق معه على السعر، الموعد، وطبيعة العمل قبل بدء الخدمة.',
  },
  {
    title: '3. مسؤولية الفنيين والشركات',
    body: 'يلتزم الفني أو الشركة بإدخال بيانات صحيحة، مثل الاسم، رقم الهاتف، المدينة، التخصص، وصف الخدمة، وصور الأعمال. يحق لإدارة التطبيق رفض أو إخفاء أو حذف أي حساب يحتوي على بيانات غير صحيحة أو محتوى غير مناسب.',
  },
  {
    title: '4. الموافقة والمراجعة',
    body: 'جميع طلبات انضمام الفنيين والشركات تخضع لمراجعة الإدارة قبل الظهور داخل التطبيق. لا يحق لأي مقدم خدمة الظهور العام قبل الموافقة.',
  },
  {
    title: '5. الأسعار',
    body: 'أي أسعار ظاهرة داخل التطبيق هي أسعار تقريبية أو تبدأ من مبلغ معين، وقد تختلف حسب طبيعة الخدمة والمكان والاتفاق بين المستخدم ومقدم الخدمة.',
  },
  {
    title: '6. المحتوى الممنوع',
    body: 'يمنع نشر أي محتوى مسيء، مضلل، غير قانوني، أو صور وبيانات لا تخص صاحب الحساب. يحق للإدارة حذف أي محتوى مخالف.',
  },
  {
    title: '7. التواصل الخارجي',
    body: 'قد يستخدم التطبيق روابط خارجية مثل واتساب أو مواقع أخرى. عند الانتقال إلى خدمة خارجية، تخضع لاستخدامك لشروط وسياسات تلك الخدمة.',
  },
  {
    title: '8. حدود المسؤولية',
    body: 'لا يتحمل تطبيق اطلب فني مسؤولية أي ضرر أو خسارة أو خلاف يحدث بين المستخدم ومقدم الخدمة. التطبيق يوفر وسيلة تواصل فقط.',
  },
  {
    title: '9. التعديل على الشروط',
    body: 'قد يتم تحديث هذه الشروط من وقت لآخر، وسيتم نشر النسخة المحدثة داخل التطبيق.',
  },
]

const SECTIONS_EN = [
  {
    title: '1. Nature of the App',
    body: 'Otlob Fanni is a service directory platform that helps users find and contact technicians and service companies. The app does not guarantee the quality of services provided by any technician or company and is not a direct party to any agreement between the user and the service provider.',
  },
  {
    title: '2. User Responsibility',
    body: 'Users are responsible for choosing the appropriate service provider and agreeing on price, timing, and service details before any work begins.',
  },
  {
    title: '3. Technician and Company Responsibility',
    body: 'Technicians and companies must provide accurate information, including name, phone number, city, service category, service description, and work images. The app administration may reject, hide, or remove any account that contains false information or inappropriate content.',
  },
  {
    title: '4. Review and Approval',
    body: 'All technician and company applications are subject to admin review before appearing publicly in the app.',
  },
  {
    title: '5. Prices',
    body: 'Any prices shown in the app are approximate or starting prices and may vary depending on the service, location, and agreement between the user and the service provider.',
  },
  {
    title: '6. Prohibited Content',
    body: 'Users and service providers must not publish offensive, misleading, illegal, or unauthorized content. The administration may remove any violating content.',
  },
  {
    title: '7. External Communication',
    body: 'The app may include external links such as WhatsApp or websites. When using external services, their own terms and policies apply.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'Otlob Fanni is not responsible for any damage, loss, dispute, or issue that occurs between users and service providers. The app only provides a connection tool.',
  },
  {
    title: '9. Changes to Terms',
    body: 'These terms may be updated from time to time, and the updated version will be published inside the app.',
  },
]

export default function Terms() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const sections = ar ? SECTIONS_AR : SECTIONS_EN

  return (
    <div className="bg-background min-h-screen pt-16 pb-10" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'شروط الخدمة' : 'Terms of Service'} />
      <main className="px-4 py-6 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h1 className="text-xl font-bold text-[#071B33] mb-1">
            {ar ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          <p className="text-xs text-gray-400 mb-4">
            {ar
              ? 'باستخدامك لتطبيق اطلب فني، فإنك توافق على الشروط التالية:'
              : 'By using Otlob Fanni, you agree to the following terms:'}
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
          {ar ? 'آخر تحديث: 2025' : 'Last updated: 2025'} · www.otlobfanni.ly
        </p>
      </main>
    </div>
  )
}
