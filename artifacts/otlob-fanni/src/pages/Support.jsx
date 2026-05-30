import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { ChevronDown, ChevronUp } from 'lucide-react'

const QA_AR = [
  {
    q: 'ما هو اطلب فني؟',
    a: 'اطلب فني هو دليل إلكتروني متخصص يجمع الفنيين والحرفيين في ليبيا في مكان واحد، ليسهل على المواطنين العثور على الخدمة المناسبة بسرعة.',
  },
  {
    q: 'كيف أجد فنياً؟',
    a: 'اختر التخصص الذي تحتاجه من الصفحة الرئيسية أو قسم التخصصات، ثم اختر مدينتك وستظهر قائمة بالفنيين المتاحين.',
  },
  {
    q: 'هل الخدمة مجانية؟',
    a: 'الخدمة مجانية حالياً لفترة محدودة. سيتم الإعلان عن أي تغييرات مسبقاً.',
  },
  {
    q: 'كيف أتواصل مع الفني؟',
    a: 'بالضغط على بطاقة الفني ستجد رقم هاتفه مباشرة، يمكنك الاتصال أو التواصل معه عبر واتساب.',
  },
  {
    q: 'كيف أسجّل كفني؟',
    a: 'اضغط على "انضم كفني" من الصفحة الرئيسية أو من قسم "انضم معنا"، وأكمل بيانات التسجيل وسيتم مراجعة طلبك.',
  },
  {
    q: 'هل يمكنني إضافة شركة؟',
    a: 'نعم، من قسم "انضم كشركة" يمكنك تسجيل شركتك وإضافة بياناتها لتظهر في الدليل.',
  },
  {
    q: 'ما المدن المتاحة؟',
    a: 'يغطي التطبيق جميع مدن ليبيا الرئيسية، ويتم إضافة مدن جديدة باستمرار.',
  },
  {
    q: 'كيف أُعلن في التطبيق؟',
    a: 'من قسم "أعلن معنا" في صفحة المزيد يمكنك التواصل معنا لمعرفة تفاصيل الإعلان والأسعار.',
  },
]

const QA_EN = [
  {
    q: 'What is Otlob Fanni?',
    a: 'Otlob Fanni is a specialized online directory that brings together technicians and craftsmen in Libya in one place, making it easy for people to find the right service quickly.',
  },
  {
    q: 'How do I find a technician?',
    a: 'Choose the specialty you need from the home page or the specialties section, then select your city and a list of available technicians will appear.',
  },
  {
    q: 'Is the service free?',
    a: 'The service is currently free for a limited period. Any changes will be announced in advance.',
  },
  {
    q: 'How do I contact a technician?',
    a: 'By tapping on the technician card, you will find their phone number directly. You can call or contact them via WhatsApp.',
  },
  {
    q: 'How do I register as a technician?',
    a: 'Tap "Join as a Technician" from the home page or the "Join Us" section, complete the registration details, and your request will be reviewed.',
  },
  {
    q: 'Can I add a company?',
    a: 'Yes, from the "Join as a Company" section you can register your company and add its details to appear in the directory.',
  },
  {
    q: 'What cities are available?',
    a: 'The app covers all major cities in Libya, and new cities are added continuously.',
  },
  {
    q: 'How do I advertise in the app?',
    a: 'From the "Advertise with Us" section in the More page, you can contact us to learn about advertising details and pricing.',
  },
]

function QAItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-start"
    >
      <div className={`px-4 py-4 transition-colors ${open ? 'bg-orange-50' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
              style={{ background: '#FF7900' }}
            >
              {index + 1}
            </span>
            <p className="font-semibold text-gray-800 text-sm leading-snug">{q}</p>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          }
        </div>
        {open && (
          <p className="text-gray-500 text-sm leading-relaxed mt-3 ms-9">
            {a}
          </p>
        )}
      </div>
    </button>
  )
}

export default function Support() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const qa = ar ? QA_AR : QA_EN

  return (
    <div className="bg-[#F2F2F7] min-h-screen pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={ar ? 'الدعم والمساعدة' : 'Support & Help'} />

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 mb-4">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}
          >
            <span className="text-white font-extrabold text-base">?</span>
          </div>
          <div>
            <p className="font-extrabold text-[#071B33] text-sm">
              {ar ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {ar ? 'اضغط على السؤال لعرض الإجابة' : 'Tap a question to see the answer'}
            </p>
          </div>
        </div>

        {/* Q&A List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {qa.map((item, idx) => (
            <QAItem key={idx} q={item.q} a={item.a} index={idx} />
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-5">
          <p className="text-xs text-center text-gray-400 mb-3">
            {ar ? 'لم تجد إجابتك؟ تواصل معنا مباشرة' : "Didn't find your answer? Contact us directly"}
          </p>
          <a
            href="https://wa.me/491791607597"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-4 rounded-2xl shadow-sm active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #1aab52 100%)' }}
          >
            <div className={`flex items-center gap-3 ${ar ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className={ar ? 'text-right' : 'text-left'}>
                <p className="text-white font-extrabold text-sm">
                  {ar ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp'}
                </p>
                <p className="text-white/80 text-xs mt-0.5 font-medium" dir="ltr">+49 157 3513 9486</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
