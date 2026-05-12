import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { UserPlus, Building2, ChevronLeft, ChevronRight, Wrench, Star, CheckCircle2 } from 'lucide-react'

export default function JoinUs() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'

  return (
    <div className="min-h-screen pb-28 pt-14" style={{ background: 'linear-gradient(160deg, #071B33 0%, #0f2d4f 50%, #1a3f6b 100%)' }} dir={ar ? 'rtl' : 'ltr'}>

      {/* Language toggle */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex ${ar ? 'justify-start' : 'justify-end'} px-4 pt-3 max-w-[480px] mx-auto`}>
        <button
          onClick={toggleLang}
          className="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
      </div>

      {/* Header */}
      <div className="px-6 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
          <Star className="w-3.5 h-3.5 text-[#FF7900]" fill="#FF7900" />
          <span className="text-white/80 text-xs font-medium">{ar ? 'انضم إلى شبكتنا' : 'Join Our Network'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">
          {ar ? 'انضم إلينا' : 'Join Us'}
        </h1>
        <p className="text-white/60 text-sm leading-relaxed max-w-[260px] mx-auto">
          {ar
            ? 'اختر طريقة انضمامك وابدأ رحلتك مع اطلب فني'
            : 'Choose how to join and start your journey with Otlob Fanni'}
        </p>
      </div>

      {/* Cards */}
      <div className="px-5 space-y-5 mt-2">

        {/* Technician Card */}
        <Link href="/join">
          <div className="relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.97] transition-transform duration-150 select-none"
            style={{ background: 'linear-gradient(135deg, #34C759 0%, #1a9e3f 100%)' }}>

            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              {/* Big icon */}
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-green-900/30 border border-white/20">
                <UserPlus className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ar ? 'فردي' : 'Individual'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                  {ar ? 'انضم كفني' : 'Join as Technician'}
                </h2>
                <p className="text-white/75 text-xs leading-relaxed">
                  {ar
                    ? 'سجّل مهاراتك واستقبل طلبات من عملاء في منطقتك'
                    : 'Register your skills and receive requests from local clients'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {[ar ? 'مجاناً' : 'Free', ar ? 'سريع' : 'Fast', ar ? 'آمن' : 'Secure'].map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                {ar
                  ? <ChevronLeft className="w-6 h-6 text-white/60" />
                  : <ChevronRight className="w-6 h-6 text-white/60" />}
              </div>
            </div>

            {/* Bottom strip */}
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
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}>

            {/* Background decoration */}
            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -right-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              {/* Big icon */}
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-900/30 border border-white/20">
                <Building2 className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ar ? 'شركة / مؤسسة' : 'Company'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                  {ar ? 'انضم كشركة' : 'Join as Company'}
                </h2>
                <p className="text-white/75 text-xs leading-relaxed">
                  {ar
                    ? 'سجّل شركتك واحصل على عملاء جدد في منطقتك'
                    : 'Register your company and reach new clients nearby'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {[ar ? 'موثوق' : 'Trusted', ar ? 'نمو' : 'Growth', ar ? 'دعم' : 'Support'].map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                {ar
                  ? <ChevronLeft className="w-6 h-6 text-white/60" />
                  : <ChevronRight className="w-6 h-6 text-white/60" />}
              </div>
            </div>

            {/* Bottom strip */}
            <div className="bg-black/15 px-6 py-2.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/70 text-xs">
                {ar ? 'شركات صيانة، مقاولات، تنظيف، تكييف...' : 'Maintenance, contracting, cleaning companies...'}
              </span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
