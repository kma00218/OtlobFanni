import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { MessageCircle, Phone, ChevronDown, ChevronUp, Send, LifeBuoy } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/19297186991';
const PHONE_NUMBER = 'tel:+19297186991';

const faqs = {
  ar: [
    {
      q: 'كيف أطلب فني؟',
      a: 'اختر التخصص المناسب من الصفحة الرئيسية، ثم اختر الفني الذي يناسبك وتواصل معه مباشرة عبر واتساب أو الاتصال.',
    },
    {
      q: 'هل الخدمة مجانية؟',
      a: 'نعم، تصفح التطبيق وطلب الفني مجاني تماماً. الاتفاق على السعر يتم مباشرة بينك وبين الفني.',
    },
    {
      q: 'كيف أنضم كفني؟',
      a: 'اضغط على "المزيد" ثم "انضم كفني"، أو من خلال شريط التنقل. أكمل بياناتك وسنتواصل معك.',
    },
    {
      q: 'كيف أبلغ عن فني غير مناسب؟',
      a: 'تواصل معنا مباشرة عبر واتساب أو الاتصال وأخبرنا بالتفاصيل، وسنتابع الأمر فوراً.',
    },
  ],
  en: [
    {
      q: 'How do I request a technician?',
      a: 'Choose the right specialty from the home page, select your technician, and contact them directly via WhatsApp or call.',
    },
    {
      q: 'Is the service free?',
      a: 'Yes, browsing the app and requesting a technician is completely free. Pricing is agreed directly between you and the technician.',
    },
    {
      q: 'How do I join as a technician?',
      a: 'Tap "More" then "Join as Technician", or use the navigation bar. Fill in your details and we\'ll contact you.',
    },
    {
      q: 'How do I report an inappropriate technician?',
      a: 'Contact us directly via WhatsApp or call with the details, and we\'ll follow up immediately.',
    },
  ],
};

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-4 text-right bg-white"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[#071B33] text-sm">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#FF7900] flex-shrink-0 ms-2" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ms-2" />}
      </button>
      {open && (
        <div className="px-4 pb-4 bg-gray-50 text-sm text-gray-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Messages() {
  const { t, lang } = useLang();
  const faqList = faqs[lang] || faqs.ar;
  const isAr = lang === 'ar';

  return (
    <div className="bg-[#ECEEF2] min-h-screen pt-20 pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      <BackHeader title={t('messagesTitle')} />

      <main className="px-4 py-6 space-y-5">

        {/* Hero card */}
        <div className="bg-[#071B33] rounded-3xl px-6 py-7 flex flex-col items-center text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-[#FF7900]/20 flex items-center justify-center mb-4">
            <LifeBuoy className="w-7 h-7 text-[#FF7900]" />
          </div>
          <h2 className="text-white text-lg font-bold mb-1">
            {isAr ? 'الدعم والمساعدة' : 'Support & Help'}
          </h2>
          <p className="text-gray-300 text-sm">
            {t('messagesEmpty')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 bg-[#25D366] text-white rounded-2xl py-5 shadow-sm active:opacity-80 transition-opacity"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="text-sm font-semibold">
              {isAr ? 'واتساب' : 'WhatsApp'}
            </span>
          </a>

          <a
            href={PHONE_NUMBER}
            className="flex flex-col items-center justify-center gap-2 bg-[#071B33] text-white rounded-2xl py-5 shadow-sm active:opacity-80 transition-opacity"
          >
            <Phone className="w-7 h-7" />
            <span className="text-sm font-semibold">
              {isAr ? 'اتصال' : 'Call Us'}
            </span>
          </a>
        </div>

        {/* Report issue button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-white border-2 border-[#FF7900] text-[#FF7900] rounded-2xl py-4 font-semibold text-sm shadow-sm active:opacity-80 transition-opacity"
        >
          <Send className="w-5 h-5" />
          {isAr ? 'إرسال مشكلة أو شكوى' : 'Send an Issue or Complaint'}
        </a>

        {/* FAQ */}
        <div>
          <h3 className="text-[#071B33] font-bold text-base mb-3">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h3>
          <div className="space-y-2">
            {faqList.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
