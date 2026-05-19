import { useRef, useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import SectionCard from '../components/SectionCard'
import { sections } from '../data/services'
import { ArrowLeft, ArrowRight, Building2, LayoutGrid, Users, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import AdBanner from '../components/AdBanner'
import { api, getFileUrl } from '../lib/api'
import { SkeletonRecentCard } from '../components/Skeleton'

function RecentCard({ item, ar }) {
  const name = ar ? item.nameAr : (item.nameEn || item.nameAr)
  const city = ar ? item.cityAr : (item.cityEn || item.cityAr)
  const photo = getFileUrl(item.photo)
  const isCo = item.type === 'company'
  const href = isCo ? `/company/${item.id}` : `/technician/${item.id}`
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'

  return (
    <Link href={href}>
      <div className="w-36 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.97] transition-transform cursor-pointer">
        <div className="w-full h-24 bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center overflow-hidden">
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : isCo
              ? <Building2 className="w-8 h-8 text-white/60" />
              : <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-extrabold text-base">{firstWord.charAt(0)}</span>
                </div>
          }
        </div>
        <div className="p-2.5">
          <p className="text-xs font-bold text-[#071B33] truncate leading-tight">{name || '—'}</p>
          {city ? <p className="text-[10px] text-[#FF7900] font-medium mt-0.5 truncate">{city}</p> : null}
          <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            isCo ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-[#FF7900]'
          }`}>
            {isCo ? (ar ? 'شركة' : 'Company') : (ar ? 'فني' : 'Tech')}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const { dir, lang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef(null)
  const [recent, setRecent] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  const handleLogoClick = () => {
    logoClickCount.current += 1
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0
      navigate('/admin/login')
      return
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0
    }, 5000)
  }

  useEffect(() => {
    api.recentlyJoined()
      .then(data => setRecent(Array.isArray(data) ? data : []))
      .catch(() => setRecent([]))
      .finally(() => setRecentLoading(false))
  }, [])

  const activeSections = sections.filter(s => s.isActive)

  return (
    <div className="bg-background min-h-screen pt-16 pb-36">

      {/* Ticker bar */}
      <Link href="/join-us">
        <div className="w-full overflow-hidden cursor-pointer select-none" style={{ background: '#071B33', height: '38px', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'ticker-scroll 28s linear infinite' }}>
            {[0, 1].map(i => (
              <span key={i} className="text-white text-[13px] font-semibold" style={{ padding: '0 3rem' }}>
                🇱🇾 يجري الآن بناء أكبر دليل فنيين وشركات خدمات في ليبيا — التسجيل مفتوح مجاناً
              </span>
            ))}
          </div>
        </div>
        <style>{`@keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </Link>

      <main className="px-4 pt-2 pb-4 flex flex-col gap-4">
        <div className="text-center" onClick={handleLogoClick} style={{ cursor: 'default' }}>
          <Logo />
        </div>

        {/* زر الانضمام */}
        <Link href="/join-us">
          <div
            className="rounded-2xl px-5 py-3.5 text-center active:scale-95 transition-transform duration-150 select-none"
            style={{
              background: 'linear-gradient(90deg, #34C759 0%, #248a3d 100%)',
              boxShadow: '0 4px 20px rgba(52,199,89,0.35)',
            }}
          >
            <p className="text-white font-extrabold text-base leading-tight">
              {ar ? 'انضم إلينا كفني أو كشركة' : 'Join us as a Technician or Company'}
            </p>
          </div>
        </Link>

        <SearchBar />

        {/* إعلان أعلى الصفحة */}
        <AdBanner placement="home_top" dismissible />

        {/* Recently Joined */}
        {(recentLoading || recent.length > 0) && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-foreground">
                {ar ? 'انضموا مؤخراً' : 'Recently Joined'}
              </h2>
              <div className="flex items-center gap-1 text-[#FF7900]">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{recent.length}</span>
              </div>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {recentLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRecentCard key={i} />)
                : recent.map(item => (
                    <RecentCard key={`${item.type}-${item.id}`} item={item} ar={ar} />
                  ))
              }
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-foreground">
              {ar ? 'الأقسام الرئيسية' : 'Main Sections'}
            </h2>
            <Link href="/categories" className="text-primary text-sm font-medium flex items-center gap-1">
              {ar ? 'كل التخصصات' : 'All Specialties'}
              {dir === 'rtl' ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-3 px-1">
            {activeSections.map(section => (
              <div key={section.id} className="flex justify-center">
                <SectionCard section={section} />
              </div>
            ))}
          </div>

          {/* ── كرت مستلزمات العريض ── */}
          <Link href="/section/suppliers">
            <div
              className="mt-4 flex items-center gap-4 px-5 py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform select-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0e7c8f 0%, #071B33 100%)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
                  <path d="M3 8l9 5 9-5" stroke="white" strokeWidth="1.9"/>
                  <line x1="12" y1="13" x2="12" y2="21" stroke="white" strokeWidth="1.9"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-base leading-tight">
                  {ar ? 'مستلزمات اطلب فني' : 'Otlob Fanni Supplies'}
                </p>
                <p className="text-white/65 text-xs mt-1 font-medium">
                  {ar ? 'معدات • أدوات • قطع غيار • مورّدون' : 'Equipment • Tools • Parts • Suppliers'}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-70">
                {dir === 'rtl'
                  ? <ChevronLeft className="w-5 h-5 text-white" />
                  : <ChevronRight className="w-5 h-5 text-white" />}
              </div>
            </div>
          </Link>

          {/* بطاقة الانطلاق */}
          <div
            className="mt-4 rounded-2xl p-6 flex flex-col items-center gap-4 text-center select-none"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #071B33 100%)' }}
          >
            <span className="text-5xl">🚀</span>
            <div className="flex flex-col gap-2">
              <p className="text-white font-extrabold text-2xl leading-tight drop-shadow">
                {ar ? 'اطلب فني ينطلق!' : 'Otlob Fanni is Launching!'}
              </p>
              <p className="text-white font-semibold text-base leading-relaxed">
                {ar
                  ? 'التطبيق جديد وقاعدة الفنيين والشركات تنمو كل يوم'
                  : 'Our network of technicians & companies grows every day'}
              </p>
            </div>
            <Link href="/join-us">
              <div
                className="rounded-xl px-6 py-3 active:scale-95 transition-transform duration-150 shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #34C759 0%, #248a3d 100%)',
                  boxShadow: '0 4px 16px rgba(52,199,89,0.4)',
                }}
              >
                <p className="text-white font-extrabold text-base leading-tight">
                  {ar ? 'انضم إلينا كفني أو كشركة' : 'Join us as a Technician or Company'}
                </p>
              </div>
            </Link>
          </div>

          {/* كل التخصصات */}
          <Link href="/categories">
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 bg-[#FF7900] active:bg-[#e06a00] transition-colors cursor-pointer select-none shadow-md shadow-[#FF7900]/30">
              <LayoutGrid className="w-5 h-5 text-white" />
              <span className="text-base font-extrabold text-white tracking-wide">
                {ar ? 'كل التخصصات' : 'All Specialties'}
              </span>
              {dir === 'rtl'
                ? <ArrowLeft className="w-4 h-4 text-white" />
                : <ArrowRight className="w-4 h-4 text-white" />}
            </div>
          </Link>

          {/* إعلان أسفل الصفحة */}
          <div className="mt-4">
            <AdBanner placement="home_bottom" compact />
          </div>
        </div>
      </main>
    </div>
  )
}
