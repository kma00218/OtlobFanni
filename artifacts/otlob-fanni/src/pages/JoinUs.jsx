import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { UserPlus, Building2, ChevronLeft, ChevronRight, Wrench, CheckCircle2, Info, Share2, ClipboardList } from 'lucide-react'

export default function JoinUs() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'اطلب فني – Otlob Fanni',
        text: lang === 'ar'
          ? 'دليل الفنيين والحرفيين في ليبيا – اطلب فني'
          : "Libya's technician & craftsman directory – Otlob Fanni",
        url: 'https://otlobfanni.ly',
      })
    } else {
      navigator.clipboard?.writeText('https://otlobfanni.ly')
    }
  }

  return (
    <div className="min-h-screen pb-28 bg-white" dir={ar ? 'rtl' : 'ltr'}>

      {/* Fixed header — Share | Icon | Lang */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center px-3 max-w-[480px] mx-auto">
        <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{ar ? 'مشاركة' : 'share'}</span>
        </button>
        <div className="flex-1 flex justify-center items-center">
          <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14" />
        </div>
        <button onClick={toggleLang} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-base text-white" style={{ background: '#FF7900' }}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </header>

      {/* Title */}
      <div className="pt-20 pb-2 flex flex-col items-center text-center px-6">
        <h1 className="text-4xl font-extrabold text-[#071B33] leading-tight mb-1">
          {ar ? 'انضم إلينا' : 'Join Us'}
        </h1>
        <p className="text-sm text-gray-400 max-w-[240px]">
          {ar
            ? 'اختر طريقة انضمامك وابدأ رحلتك مع اطلب فني'
            : 'Choose how to join and start your journey'}
        </p>
      </div>

      {/* Cards */}
      <div className="px-5 space-y-3">

        {/* Multi-specialty note */}
        <div className="rounded-2xl border-2 border-[#FF7900]/60 overflow-hidden" style={{ background: '#FFF4E8' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-200 bg-white">
            <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm font-extrabold text-red-600 tracking-wide">
              {ar ? '⚠ ملاحظة مهمة' : '⚠ Important Note'}
            </span>
          </div>
          <p className="px-4 py-3 text-base font-extrabold text-[#3d2200] leading-relaxed">
            {ar
              ? 'تعمل في أكثر من تخصص؟ أرسل طلبًا منفصلًا لكل تخصص.'
              : 'Work in multiple specialties? Submit a separate application for each.'}
          </p>
        </div>

        {/* Technician Card */}
        <Link href="/join">
          <div className="relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.97] transition-transform duration-150 select-none"
            style={{ background: 'linear-gradient(135deg, #1e8c3a 0%, #0f5c24 100%)' }}>

            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-green-900/30 border border-white/20">
                <UserPlus className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ar ? 'فردي' : 'Individual'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                  {ar ? 'انضم كفني' : 'Join as Technician'}
                </h2>
                <p className="text-white font-bold text-base leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {ar
                    ? 'سجّل مهاراتك واستقبل طلبات من عملاء في منطقتك'
                    : 'Register your skills and receive requests from local clients'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {[ar ? 'مجاناً' : 'Free', ar ? 'سريع' : 'Fast', ar ? 'آمن' : 'Secure'].map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-white text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                {ar
                  ? <ChevronLeft className="w-6 h-6 text-white/60" />
                  : <ChevronRight className="w-6 h-6 text-white/60" />}
              </div>
            </div>

            <div className="bg-black/15 px-6 py-2.5 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/70 text-xs">
                {ar ? 'فنيون، كهربائيون، سباكون، نجارون...' : 'Technicians, electricians, plumbers...'}
              </span>
            </div>
          </div>
        </Link>

        {/* Company Card */}
        <Link href="/join-company">
          <div className="relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.97] transition-transform duration-150 select-none"
            style={{ background: 'linear-gradient(135deg, #c45e00 0%, #8a3f00 100%)' }}>

            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -right-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-900/30 border border-white/20">
                <Building2 className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ar ? 'شركة / مؤسسة' : 'Company'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                  {ar ? 'انضم كشركة' : 'Join as Company'}
                </h2>
                <p className="text-white font-bold text-base leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {ar
                    ? 'سجّل شركتك واحصل على عملاء جدد في منطقتك'
                    : 'Register your company and reach new clients nearby'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {[ar ? 'موثوق' : 'Trusted', ar ? 'نمو' : 'Growth', ar ? 'دعم' : 'Support'].map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-white text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                {ar
                  ? <ChevronLeft className="w-6 h-6 text-white/60" />
                  : <ChevronRight className="w-6 h-6 text-white/60" />}
              </div>
            </div>

            <div className="bg-black/15 px-6 py-2.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/70 text-xs">
                {ar ? 'شركات صيانة، مقاولات، تنظيف، تكييف...' : 'Maintenance, contracting, cleaning companies...'}
              </span>
            </div>
          </div>
        </Link>

        {/* Track existing request — below company card */}
        <Link href="/status">
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer active:scale-[0.97] transition-all duration-150 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-base leading-tight">
                {ar ? 'تتبع حالة طلبك' : 'Track Your Request'}
              </p>
              <p className="text-white/80 text-xs mt-0.5">
                {ar ? 'قدّمت طلباً من قبل؟ اعرف حالته الآن' : 'Already applied? Check your status now'}
              </p>
            </div>
            <div className="flex-shrink-0">
              {ar ? <ChevronLeft className="w-5 h-5 text-white/70" /> : <ChevronRight className="w-5 h-5 text-white/70" />}
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
