import { useLang } from '../context/LanguageContext'
import { Link, useLocation } from 'wouter'
import { UserPlus, Building2, ChevronLeft, ChevronRight, Wrench, CheckCircle2, Share2, ClipboardList, Search, Package } from 'lucide-react'

export default function JoinUs() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()

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

      {/* Fixed header — Share+Track | Icon | Lang */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center px-3 max-w-[480px] mx-auto">
        {/* Start group: Share + Track — fixed width to keep logo centered */}
        <div className="flex items-center gap-2 flex-shrink-0 w-[170px]">
          <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">{ar ? 'مشاركة' : 'share'}</span>
          </button>
          <button
            onClick={() => navigate('/status')}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0"
          >
            <div className="h-10 px-3 rounded-[12px] flex items-center gap-1 bg-[#1877F2]">
              <Search className="h-3.5 w-3.5 text-white flex-shrink-0" />
              <span className="text-white text-[11px] font-bold whitespace-nowrap">{ar ? 'تتبع' : 'Track'}</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">{ar ? 'طلبك' : 'request'}</span>
          </button>
        </div>

        {/* Center: Logo — always centered */}
        <div className="flex-1 flex justify-center items-center">
          <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14" />
        </div>

        {/* End group: WhatsApp + Lang — fixed width to match start group */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0 w-[170px]">
          <a
            href="https://wa.me/491791607597"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#25D366' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">WhatsApp</span>
          </a>
          <button onClick={toggleLang} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-base text-white" style={{ background: '#FF7900' }}>
              {lang === 'ar' ? 'EN' : 'AR'}
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
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

        {/* Technician Card */}
        <Link href="/join">
          <div className="relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.97] transition-transform duration-150 select-none"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #cc5f00 100%)' }}>

            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-900/30 border border-white/20">
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

            <div className="bg-black/15 px-6 py-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">
                {ar ? 'فنيون، كهربائيون، سباكون، نجارون...' : 'Technicians, electricians, plumbers...'}
              </span>
            </div>
          </div>
        </Link>

        {/* Company Card */}
        <Link href="/join-company">
          <div className="relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.97] transition-transform duration-150 select-none"
            style={{ background: 'linear-gradient(135deg, #1a56db 0%, #0f3d9e 100%)' }}>

            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -right-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-900/30 border border-white/20">
                <Building2 className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ar ? 'شركة / مؤسسة' : 'Company'}
                  </span>
                  <span className="bg-yellow-300 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {ar ? '🔨 تُقدّم خدمة' : '🔨 Provides Service'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                  {ar ? 'انضم كشركة خدمات' : 'Join as Services Company'}
                </h2>
                <p className="text-white font-bold text-base leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {ar
                    ? 'تذهب إلى العميل وتنجز العمل — بفريقك أو مقاوليك'
                    : 'You go to the client and do the work — with your team or contractors'}
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

            <div className="bg-black/15 px-6 py-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">
                {ar ? 'شركات صيانة، مقاولات، تنظيف، تكييف...' : 'Maintenance, contracting, cleaning companies...'}
              </span>
            </div>
          </div>
        </Link>

        {/* Company vs Supplier clarifier */}
        <div className="rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-50">
          <div className="bg-amber-400 px-4 py-2 flex items-center gap-2">
            <span className="text-amber-900 text-sm font-extrabold">❓</span>
            <p className="text-amber-900 text-[11px] font-extrabold uppercase tracking-wide">
              {ar ? 'لست متأكداً؟ — الفرق بين الشركة والمورد' : "Not sure? — Company vs Supplier"}
            </p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-amber-200">
            <div className="px-3.5 py-3 space-y-1">
              <p className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">🔨 {ar ? 'شركة خدمات' : 'Service Company'}</p>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">{ar ? '✔ تذهب إلى موقع العميل' : '✔ You go to the client'}</p>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">{ar ? '✔ تنجز العمل بنفسك أو بفريق' : '✔ You do the job yourself'}</p>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">{ar ? '✔ تكييف، سباكة، نظافة...' : '✔ A/C, plumbing, cleaning...'}</p>
            </div>
            <div className="px-3.5 py-3 space-y-1">
              <p className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">📦 {ar ? 'مورد مستلزمات' : 'Supplier'}</p>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">{ar ? '✔ عندك محل أو مستودع' : '✔ You have a shop / store'}</p>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">{ar ? '✔ تبيع أدوات أو مواد' : '✔ You sell tools or materials'}</p>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">{ar ? '✔ الفنيون يشترون منك' : '✔ Technicians buy from you'}</p>
            </div>
          </div>
        </div>

        {/* Supplier Card */}
        <Link href="/join-supplier">
          <div className="relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.97] transition-transform duration-150 select-none"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #065f5a 100%)' }}>

            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10" />

            <div className="relative p-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-[22px] bg-white/20 flex items-center justify-center flex-shrink-0 shadow-xl shadow-teal-900/30 border border-white/20">
                <Package className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ar ? 'محل / مورّد' : 'Shop / Supplier'}
                  </span>
                  <span className="bg-yellow-300 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {ar ? '📦 تبيع منتجات' : '📦 Sells Products'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight mb-1">
                  {ar ? 'انضم كمورد مستلزمات' : 'Join as Supplier'}
                </h2>
                <p className="text-white font-bold text-base leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {ar
                    ? 'تبيع أدوات أو مواد أو قطع غيار — الفنيون يأتون إليك'
                    : 'You sell tools, materials, or spare parts — technicians come to you'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {[ar ? 'مجاناً' : 'Free', ar ? 'دليل' : 'Directory', ar ? 'موثوق' : 'Trusted'].map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-white text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                {ar ? <ChevronLeft className="w-6 h-6 text-white/60" /> : <ChevronRight className="w-6 h-6 text-white/60" />}
              </div>
            </div>

            <div className="bg-black/15 px-6 py-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">
                {ar ? 'أدوات، معدات، قطع غيار، مواد بناء، سباكة...' : 'Tools, equipment, spare parts, building materials...'}
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
