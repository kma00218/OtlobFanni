import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'

const SECTIONS_AR = [
  {
    title: '1. طبيعة المنصة',
    body: 'اطلب فني هو منصة ودليل خدمات يهدف إلى تسهيل الوصول إلى الفنيين والشركات والخدمات داخل ليبيا. دور المنصة يقتصر على عرض بيانات مقدمي الخدمات وتسهيل التواصل بينهم وبين المستخدمين، ولا تعتبر المنصة طرفًا مباشرًا في أي اتفاق أو تعامل أو عقد يتم خارجها. المنصة لا تتحقق من هوية أو مؤهلات أو كفاءة مقدمي الخدمات بشكل كامل، وعرض الفني أو الشركة داخل المنصة لا يُعدّ توصية أو اعتمادًا رسميًا من إدارة المنصة.',
  },
  {
    title: '2. مسؤولية المستخدم',
    body: 'يتحمل المستخدم كامل المسؤولية عند اختيار مقدم الخدمة والتعامل معه، بما في ذلك الاتفاق على الأسعار، المواعيد، طبيعة الخدمة، الدفع، وأي تفاصيل أخرى متعلقة بالخدمة. على المستخدم التحقق بنفسه من أهلية مقدم الخدمة قبل الاستعانة به، ولا يحق له مطالبة المنصة بأي تعويض عن أي ضرر أو خسارة ناتجة عن هذا التعامل.',
  },
  {
    title: '3. مسؤولية الفنيين والشركات',
    body: 'يتحمل الفني أو الشركة المسؤولية الكاملة عن صحة ودقة البيانات والمعلومات والصور ووسائل التواصل التي يتم إضافتها داخل المنصة. ويتعهد مقدم الخدمة بعدم إدخال بيانات أو صور مزيفة أو مضللة، وعدم انتحال شخصية أو نشاط آخر، وعدم نشر محتوى مخالف أو غير قانوني، وعدم استخدام المنصة بطريقة تسيء للمستخدمين أو للمنصة. ويحق لإدارة المنصة حذف أو إيقاف أو إخفاء أي حساب مخالف في أي وقت دون إشعار مسبق.',
  },
  {
    title: '4. المراجعة والقبول',
    body: 'جميع طلبات التسجيل تخضع للمراجعة قبل النشر داخل المنصة، ويحق لإدارة اطلب فني قبول أو رفض أي طلب دون إبداء الأسباب. لا تعتبر أي مراجعة أو قبول للحساب ضمانًا لجودة الخدمة أو اعتمادًا رسميًا من المنصة، ولا تتحمل المنصة أي مسؤولية عن محتوى أو تصرفات الحسابات المقبولة.',
  },
  {
    title: '5. حدود مسؤولية المنصة',
    body: 'لا تتحمل منصة اطلب فني بأي حال من الأحوال أي مسؤولية عن: جودة الخدمات المقدمة أو عدم تقديمها، أي اتفاقات أو تعاملات مالية بين الأطراف، أي خسائر أو أضرار مادية أو معنوية أو تأخير أو خلافات تنتج عن استخدام المنصة، أي معلومات أو صور أو بيانات يضيفها الفنيون أو الشركات، أي تصرفات أو مخالفات أو إهمال يصدر من مقدمي الخدمات أو المستخدمين، أي احتيال أو غش أو ادعاءات كاذبة من أي طرف. يتم استخدام المنصة على مسؤولية المستخدم ومقدم الخدمة بالكامل.',
  },
  {
    title: '6. الأسعار والعروض',
    body: 'أي أسعار أو عروض أو معلومات يتم عرضها داخل المنصة هي مسؤولية مقدم الخدمة فقط، وقد تختلف حسب طبيعة العمل أو المدينة أو الاتفاق النهائي بين الطرفين. لا تضمن المنصة دقة هذه الأسعار أو ثباتها.',
  },
  {
    title: '7. المحتوى الممنوع',
    body: 'يُمنع استخدام المنصة لنشر أو مشاركة: محتوى مسيء أو غير أخلاقي، معلومات مضللة أو مزيفة، خدمات غير قانونية، صور أو بيانات لا يملك المستخدم حق استخدامها، أي محتوى يسيء للمنصة أو للمستخدمين أو يخالف القوانين المحلية. ويحق لإدارة المنصة حذف أي محتوى مخالف أو إيقاف الحسابات المخالفة في أي وقت دون الحاجة لإشعار مسبق.',
  },
  {
    title: '8. الروابط والخدمات الخارجية',
    body: 'قد تحتوي المنصة على روابط أو وسائل تواصل خارجية مثل واتساب أو مواقع وتطبيقات أخرى. استخدام هذه الخدمات يخضع لشروط وسياسات تلك الجهات، ولا تتحمل منصة اطلب فني أي مسؤولية عنها أو عن أي ضرر ينتج من استخدامها.',
  },
  {
    title: '9. إيقاف أو حذف الحسابات',
    body: 'يحق لإدارة المنصة إيقاف أو حذف أو تقييد أي حساب أو محتوى في حال: مخالفة الشروط، ورود شكاوى متكررة، الاشتباه في نشاط غير قانوني أو مضلل أو احتيالي، الإضرار بالمنصة أو بالمستخدمين بأي شكل. لا يحق لصاحب الحساب المطالبة بأي تعويض نتيجة إيقاف حسابه أو حذفه.',
  },
  {
    title: '10. التعديلات والتحديثات',
    body: 'يحق لإدارة اطلب فني تعديل أو تحديث أو تغيير هذه الشروط في أي وقت دون إشعار مسبق، ويعتبر استمرار استخدام المنصة بعد نشر النسخة المحدثة موافقة كاملة وغير مشروطة على الشروط الجديدة.',
  },
  {
    title: '11. الموافقة على الشروط',
    body: 'باستخدامك للمنصة أو التسجيل فيها سواء كمستخدم أو فني أو شركة، فإنك تقر بأنك قرأت هذه الشروط بالكامل ووافقت عليها وفهمت مضمونها وتلتزم بها. إذا كنت لا توافق على أي بند من هذه الشروط، يجب عليك التوقف عن استخدام المنصة فورًا.',
  },
  {
    title: '12. التقييمات والتعليقات',
    body: 'قد تسمح المنصة بإضافة تقييمات أو تعليقات أو آراء حول الفنيين والشركات. يتحمل صاحب التقييم أو التعليق المسؤولية الكاملة عن محتواه. يُمنع منعًا باتًا نشر تقييمات مزيفة أو مدفوعة أو غير حقيقية. يحق لإدارة المنصة حذف أي تقييم أو تعليق مخالف أو مسيء أو مضلل أو مشكوك في صحته دون إشعار. لا تتحمل المنصة مسؤولية دقة أو صحة التقييمات المنشورة من المستخدمين.',
  },
  {
    title: '13. الاستخدام المقبول',
    body: 'يوافق المستخدم والفني والشركة على استخدام المنصة بطريقة قانونية ومحترمة، وعدم محاولة: اختراق المنصة أو التأثير على عملها أو استقرارها، نسخ أو استخراج أو تجميع بيانات المنصة أو قواعد بياناتها بأي طريقة آلية أو يدوية بدون إذن مكتوب مسبق، إرسال رسائل مزعجة أو محتوى غير مرغوب فيه، استغلال المنصة لأغراض احتيالية أو تجارية غير مصرح بها أو غير قانونية. أي مخالفة لهذا البند تعرض صاحبها للحظر الفوري ولأي إجراءات قانونية مناسبة.',
  },
  {
    title: '14. الملكية الفكرية',
    body: 'جميع الشعارات والتصاميم والعلامات التجارية والمحتوى الخاص بمنصة اطلب فني تعتبر ملكًا حصريًا للمنصة، ولا يجوز نسخها أو استخدامها أو إعادة نشرها أو الاستفادة منها بأي شكل بدون إذن كتابي مسبق من إدارة المنصة. أي استخدام غير مصرح به يعرض صاحبه للمسؤولية القانونية.',
  },
  {
    title: '15. توفر الخدمة',
    body: 'تسعى المنصة لتوفير الخدمة بأفضل شكل ممكن، ولكن لا تضمن العمل المستمر أو الخالي من الأخطاء أو التوقفات التقنية. يحق للإدارة إيقاف أو تحديث أو تعديل أجزاء من المنصة أو إيقافها كليًا في أي وقت دون إشعار مسبق أو تحمل أي مسؤولية عن ذلك.',
  },
  {
    title: '16. إنهاء الاستخدام',
    body: 'يحق للمستخدم أو الفني أو الشركة التوقف عن استخدام المنصة في أي وقت. كما يحق لإدارة المنصة تعليق أو إنهاء الوصول إلى الخدمة بشكل فوري عند مخالفة أي من هذه الشروط أو إساءة الاستخدام، دون الحاجة لإشعار مسبق أو تعويض.',
  },
  {
    title: '17. الخصوصية والبيانات',
    body: 'باستخدام المنصة، فإنك توافق على جمع وعرض بعض البيانات المتعلقة بالحساب والخدمات داخل التطبيق بما يخدم عمل المنصة. تلتزم المنصة بعدم بيع البيانات الشخصية للمستخدمين أو مقدمي الخدمات لأي طرف خارجي تحت أي ظرف. يحق للمنصة الاحتفاظ ببيانات الحسابات المحذوفة أو الموقوفة لأغراض قانونية أو أمنية.',
  },
  {
    title: '18. القانون والتنظيم والاختصاص القضائي',
    body: 'يخضع استخدام منصة اطلب فني للقوانين والأنظمة المعمول بها في ليبيا. يتحمل المستخدم أو مقدم الخدمة مسؤولية الالتزام بالقوانين المحلية أثناء استخدام المنصة. في حال نشوء أي نزاع أو خلاف متعلق باستخدام المنصة، تكون المحاكم الليبية المختصة هي الجهة الوحيدة للفصل فيه، ولا يحق لأي طرف اللجوء إلى محاكم أخرى خارج ليبيا.',
  },
]

const SECTIONS_EN = [
  {
    title: '1. Nature of the Platform',
    body: 'Otlob Fanni is a service directory platform designed to facilitate access to technicians and companies within Libya. The platform\'s role is limited to displaying service provider information and enabling communication between them and users. The platform is not a direct party to any agreement, transaction, or contract made outside it. The platform does not fully verify the identity, qualifications, or competence of service providers. Listing a technician or company does not constitute an official endorsement or certification by the platform.',
  },
  {
    title: '2. User Responsibility',
    body: 'Users bear full responsibility when selecting and dealing with a service provider, including agreeing on prices, schedules, service details, payment, and any other related matters. Users must independently verify the suitability of any service provider before engaging them. Users may not hold the platform liable for any damages or losses resulting from such dealings.',
  },
  {
    title: '3. Technician and Company Responsibility',
    body: 'Technicians and companies bear full responsibility for the accuracy of all data, information, photos, and contact details added to the platform. Service providers agree not to submit false or misleading information, impersonate another person or business, publish illegal or inappropriate content, or use the platform in any way that harms users or the platform. The platform administration may delete, suspend, or hide any non-compliant account at any time without prior notice.',
  },
  {
    title: '4. Review and Approval',
    body: 'All registration requests are subject to admin review before being published on the platform. The platform reserves the right to accept or reject any request without providing reasons. Approval of an account does not guarantee service quality or constitute an official endorsement. The platform bears no responsibility for the content or actions of approved accounts.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'Otlob Fanni is under no circumstances responsible for: the quality or non-delivery of services, any financial agreements between parties, any material or moral damages, delays, or disputes arising from platform use, any information, images, or data submitted by technicians or companies, any actions, violations, or negligence by service providers or users, or any fraud, deceit, or false claims by any party. Use of the platform is entirely at the risk of the user and service provider.',
  },
  {
    title: '6. Prices and Offers',
    body: 'Any prices, offers, or information displayed on the platform are the sole responsibility of the service provider and may vary based on the nature of the work, location, or final agreement between parties. The platform does not guarantee the accuracy or stability of such prices.',
  },
  {
    title: '7. Prohibited Content',
    body: 'Using the platform to publish or share offensive or unethical content, misleading or false information, illegal services, unauthorized images or data, or any content that harms the platform, users, or local laws is strictly prohibited. The platform administration may remove any violating content or suspend non-compliant accounts at any time without prior notice.',
  },
  {
    title: '8. External Links and Services',
    body: 'The platform may include external links or communication channels such as WhatsApp or other websites. Use of these services is subject to their own terms and policies. Otlob Fanni bears no responsibility for external services or any damages resulting from their use.',
  },
  {
    title: '9. Account Suspension or Deletion',
    body: 'The platform administration may suspend, delete, or restrict any account or content in cases of terms violations, repeated complaints, suspected illegal or fraudulent activity, or harm to the platform or its users. Account holders have no right to claim compensation as a result of account suspension or deletion.',
  },
  {
    title: '10. Amendments and Updates',
    body: 'The platform administration may modify, update, or change these terms at any time without prior notice. Continued use of the platform after the updated version is published constitutes full and unconditional acceptance of the new terms.',
  },
  {
    title: '11. Acceptance of Terms',
    body: 'By using or registering on the platform — whether as a user, technician, or company — you confirm that you have read, understood, and agreed to these terms in full. If you do not agree to any provision of these terms, you must immediately stop using the platform.',
  },
  {
    title: '12. Reviews and Comments',
    body: 'The platform may allow users to add ratings, comments, or opinions about technicians and companies. The author of any review or comment bears full responsibility for its content. Posting fake, paid, or dishonest reviews is strictly prohibited. The platform administration may remove any violating, offensive, misleading, or suspicious review without notice. The platform is not responsible for the accuracy or validity of user-submitted reviews.',
  },
  {
    title: '13. Acceptable Use',
    body: 'Users, technicians, and companies agree to use the platform lawfully and respectfully, and not to attempt to: hack or disrupt the platform\'s operation or stability, copy, extract, or collect platform data or databases by any automated or manual means without prior written permission, send spam or unsolicited content, or exploit the platform for fraudulent, unauthorized, or illegal commercial purposes. Violations of this clause may result in immediate blocking and appropriate legal action.',
  },
  {
    title: '14. Intellectual Property',
    body: 'All logos, designs, trademarks, and content belonging to Otlob Fanni are the exclusive property of the platform and may not be copied, used, republished, or exploited in any form without prior written permission from the platform administration. Unauthorized use may result in legal liability.',
  },
  {
    title: '15. Service Availability',
    body: 'The platform strives to provide the best possible service but does not guarantee continuous, error-free operation or freedom from technical outages. The administration reserves the right to stop, update, or modify any part of the platform — or shut it down entirely — at any time without prior notice or liability.',
  },
  {
    title: '16. Termination of Use',
    body: 'Users, technicians, and companies may stop using the platform at any time. The platform administration may also immediately suspend or terminate access upon any violation of these terms or misuse, without prior notice or compensation.',
  },
  {
    title: '17. Privacy and Data',
    body: 'By using the platform, you consent to the collection and display of certain account and service-related data within the app to support platform operations. The platform is committed to never selling personal data of users or service providers to any third party under any circumstances. The platform reserves the right to retain data from deleted or suspended accounts for legal or security purposes.',
  },
  {
    title: '18. Governing Law and Jurisdiction',
    body: 'Use of the Otlob Fanni platform is governed by the laws and regulations in force in Libya. Users and service providers are responsible for complying with local laws while using the platform. In the event of any dispute related to the use of the platform, Libyan courts shall have exclusive jurisdiction, and no party may resort to courts outside of Libya.',
  },
]

export default function Terms() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const sections = ar ? SECTIONS_AR : SECTIONS_EN

  return (
    <div className="bg-background min-h-screen pt-20 pb-10" dir={ar ? 'rtl' : 'ltr'}>
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
          {ar ? 'آخر تحديث: 2026' : 'Last updated: 2026'} · www.otlobfanni.ly
        </p>
      </main>
    </div>
  )
}
