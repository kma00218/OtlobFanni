import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'

export default function About() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  return (
    <div className="bg-background min-h-screen pt-16 pb-10" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'عن التطبيق' : 'About the App'} />
      <main className="px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
          <h1 className="text-xl font-bold text-[#071B33]">
            {ar ? 'عن تطبيق اطلب فني' : 'About Otlob Fanni'}
          </h1>
          {ar ? (
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                اطلب فني هو تطبيق ليبي يساعد المستخدمين على الوصول إلى الفنيين والشركات القريبة منهم في مجالات الخدمات المنزلية، السيارات، البناء والتشطيب، التقنية والأمن، النقل، الطاقة، والخدمات التجارية.
              </p>
              <p>
                يعمل التطبيق كدليل خدمات يسهّل التواصل بين المستخدم ومقدم الخدمة عبر الهاتف أو واتساب. يقوم فريق الإدارة بمراجعة طلبات انضمام الفنيين والشركات قبل ظهورهم داخل التطبيق، وذلك للمساعدة في تحسين جودة الخدمة وبناء الثقة.
              </p>
              <p>
                التطبيق لا ينفذ الخدمة بنفسه، ولا يعمل كجهة توظيف مباشرة، بل يوفر وسيلة سهلة للعثور على مقدمي الخدمات والتواصل معهم.
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Otlob Fanni is a Libyan service directory app that helps users find nearby technicians and service companies in home services, car services, construction, technology and security, moving, energy, and business services.
              </p>
              <p>
                The app helps users contact service providers directly by phone or WhatsApp. Technician and company applications are reviewed by the admin team before appearing publicly in the app to help improve service quality and trust.
              </p>
              <p>
                The app does not provide the services directly and does not act as an employer. It only helps connect users with available service providers.
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#FF7900]/5 border border-[#FF7900]/20 rounded-2xl p-4">
          <p className="text-xs text-[#FF7900] font-semibold text-center">
            {ar ? 'اطلب فني — الفني الأقرب إليك' : 'Otlob Fanni — The nearest technician to you'}
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">www.otlobfanni.ly</p>
        </div>
      </main>
    </div>
  )
}
