import { useRef, useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import SectionCard from '../components/SectionCard'
import { sections, categories as allCategoriesData } from '../data/services'
import { ArrowLeft, ArrowRight, Building2, LayoutGrid, Users, Package, ChevronLeft, ChevronRight, Share2, UserPlus } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import AdBanner from '../components/AdBanner'
import { api, getFileUrl } from '../lib/api'
import { SkeletonRecentCard } from '../components/Skeleton'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import LibyaMap from '../components/LibyaMap'

function RecentCard({ item, ar }) {
  const name = ar ? item.nameAr : (item.nameEn || item.nameAr)
  const city = ar ? item.cityAr : (item.cityEn || item.cityAr)
  const photo = getFileUrl(item.photo)
  const isCo   = item.type === 'company'
  const isSupp  = item.type === 'supplier'
  const href = isCo ? `/company/${item.id}` : isSupp ? `/supplier/${item.id}` : `/technician/${item.id}`
  const firstWord = name ? (name.trim().split(' ')[0] || '؟') : '؟'

  const bgClass   = isSupp ? 'from-teal-700 to-[#071B33]' : 'from-[#071B33] to-[#1a56db]'
  const badgeCls  = isCo   ? 'bg-blue-100 text-blue-700'
                 : isSupp  ? 'bg-teal-100 text-teal-700'
                 :           'bg-orange-100 text-[#FF7900]'
  const badgeTxt  = isCo   ? (ar ? 'شركة خدمية' : 'Service Co.')
                 : isSupp  ? (ar ? 'مستلزمات' : 'Supplier')
                 :           (ar ? 'فني'      : 'Tech')

  return (
    <Link href={href}>
      <div className="w-36 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.97] transition-transform cursor-pointer">
        <div className={`w-full h-24 bg-gradient-to-br ${bgClass} flex items-center justify-center overflow-hidden`}>
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : isCo
              ? <Building2 className="w-8 h-8 text-white/60" />
              : isSupp
                ? <Package className="w-8 h-8 text-white/60" />
                : <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center px-1">
                    <span className="text-white font-extrabold text-center leading-tight" style={{ fontSize: firstWord.length > 5 ? '9px' : '11px' }}>{firstWord}</span>
                  </div>
          }
        </div>
        <div className="p-2.5">
          <p className="text-xs font-bold text-[#071B33] truncate leading-tight">{name || '—'}</p>
          {city ? <p className="text-[10px] text-[#FF7900] font-medium mt-0.5 truncate">{city}</p> : null}
          <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>
            {badgeTxt}
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
  const [stats, setStats] = useState(null)
  const [citiesForFilter, setCitiesForFilter] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [showReferral, setShowReferral] = useState(false)
  const [referralForm, setReferralForm] = useState({ type: 'technician', name: '', phone: '', specialty: '', city: '', submitting: false })


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

    api.publicStats()
      .then(data => setStats(data))
      .catch(() => {})

    api.cityStats()
      .then(data => {
        if (!Array.isArray(data)) return
        setCitiesForFilter(data)
      })
      .catch(() => api.cities().then(data => {
        if (Array.isArray(data)) setCitiesForFilter(data.map(c => ({ ...c, total: 0 })))
      }).catch(() => {}))

    api.popularCategories()
      .then(data => {
        if (!Array.isArray(data)) return
        setTopCategories(data)
      })
      .catch(() => {})
  }, [])

  const activeSections = sections.filter(s => s.isActive)

  // All categories: popular first, then the rest (excluding 'more' meta-entry)
  const popularIds = new Set(topCategories.map(c => c.id))
  const remainingCats = allCategoriesData
    .filter(c => c.id !== 'more' && !popularIds.has(c.id))
    .map(c => ({ id: c.id, nameAr: c.nameAr, nameEn: c.nameEn }))
  const allSortedCategories = [...topCategories, ...remainingCats]

  return (
    <div className="bg-background min-h-screen pt-16 pb-36">

      {/* Ticker bar */}
      <style>{`
        @keyframes ofTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .of-ticker-outer {
          background: #071B33;
          height: 36px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          user-select: none;
        }
        .of-ticker-inner {
          display: inline-flex;
          align-items: center;
          height: 36px;
          white-space: nowrap;
          animation: ofTicker 70s linear infinite;
          will-change: transform;
        }
        .of-ticker-msg {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          padding: 0 40px;
          direction: rtl;
        }
        .of-sep { color: #FF7900; }
      `}</style>
      <Link href="/join-us">
        <div className="of-ticker-outer">
          <span className="of-ticker-inner">
            {[0, 1].map(i => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span className="of-ticker-msg">
                  🇱🇾 يجري الآن بناء أكبر دليل فنيين وشركات خدمات في ليبيا — التسجيل مفتوح مجاناً
                </span>
                <span className="of-sep">✦</span>
                <span className="of-ticker-msg">
                  🔧 سجّل بياناتك مجاناً وابدأ في استقبال الطلبات
                </span>
                <span className="of-sep">✦</span>
                <span className="of-ticker-msg">
                  📦 تصفّح مستلزمات ومعدات من أفضل الموردين في ليبيا
                </span>
                <span className="of-sep">✦</span>
                <span className="of-ticker-msg">
                  ⭐ انضم إلى آلاف الفنيين الموثوقين على المنصة
                </span>
                <span className="of-sep">✦</span>
                <span className="of-ticker-msg">
                  📍 خدمة متاحة في طرابلس، بنغازي، مصراتة، والمزيد
                </span>
                <span className="of-sep">✦</span>
                <span className="of-ticker-msg">
                  💼 هل أنت شركة خدمات؟ اعرض خدماتك الآن مجاناً
                </span>
                <span className="of-sep" style={{ padding: '0 20px' }}>◆</span>
              </span>
            ))}
          </span>
        </div>
      </Link>

      <main className="px-4 pt-2 pb-4 flex flex-col gap-4">
        <div className="text-center" onClick={handleLogoClick} style={{ cursor: 'default' }}>
          <Logo />
        </div>

        {/* ── بطاقة الإطلاق ── */}
        {stats && (() => {
          const LAUNCH = new Date('2026-05-20T00:00:00')
          const today  = new Date()
          today.setHours(0, 0, 0, 0)
          const dayNum = Math.max(1, Math.floor((today - LAUNCH) / 86400000) + 1)
          return (
            <div className="relative rounded-2xl overflow-hidden select-none" style={{ background: '#071B33' }}>
              {/* subtle radial glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,121,0,0.12) 0%, transparent 65%)' }} />

              <div className="relative flex items-center gap-3 px-4 pt-2.5 pb-5">
                {/* Day badge */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-bold text-white/90">{ar ? 'اليوم' : 'Day'}</span>
                  <span className="text-xl font-black text-[#FF7900] leading-none">{dayNum}</span>
                  <span className="text-[10px]">🚀</span>
                </div>

                <div className="w-px self-stretch bg-white/15" />

                {/* Stats inline */}
                <div className="flex flex-1 items-center justify-around">
                  <span className="text-[11px] font-bold text-white">
                    <span className="text-[#FF7900]">{stats.technicians}</span> {ar ? 'فني' : 'Tech'}
                  </span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-[11px] font-bold text-white">
                    <span className="text-blue-300">{stats.companies}</span> {ar ? 'شركة خدمات' : 'Service Co.'}
                  </span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-[11px] font-bold text-white">
                    <span className="text-teal-300">{stats.suppliers}</span> {ar ? 'مورد مستلزمات' : 'Supplier'}
                  </span>
                </div>

                <div className="w-px self-stretch bg-white/15" />

                {/* Grand total */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-2xl font-black text-[#FF7900] leading-none">
                    {stats.technicians + stats.companies + stats.suppliers}
                  </span>
                  <span className="text-[9px] font-bold text-white/60 mt-0.5">{ar ? 'إجمالي' : 'Total'}</span>
                </div>
              </div>

              {/* Single clean arc at the bottom */}
              <svg viewBox="0 0 400 14" preserveAspectRatio="none"
                className="absolute bottom-0 left-0 right-0 w-full" style={{ height: 14 }}>
                <path d="M0,14 L0,14 Q200,0 400,14 Z" fill="#F8FAFC" />
              </svg>
            </div>
          )
        })()}

        {/* زر الانضمام */}
        <Link href="/join-us">
          <div
            className="rounded-2xl px-5 py-3.5 text-center active:scale-95 transition-transform duration-150 select-none cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #34C759 0%, #248a3d 100%)',
              boxShadow: '0 4px 20px rgba(52,199,89,0.35)',
            }}
          >
            <p className="text-white font-extrabold text-base leading-tight flex items-center justify-center gap-2">
              <span className="text-xl flex-shrink-0">👆</span>
              <span>{ar ? 'انضم إلينا كفني أو كشركة خدمات أو كمزوّد مستلزمات' : 'Join us as a Technician, Service Company or Supplies Provider'}</span>
            </p>
          </div>
        </Link>

        <SearchBar />

        {/* ── أزرار المدن السريعة ── */}
        {citiesForFilter.length > 0 && (
          <div className="relative -mx-1">
            <div
              className="flex gap-2 overflow-x-auto pb-0.5 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {citiesForFilter.map(city => {
                const label = ar ? city.nameAr : (city.nameEn || city.nameAr)
                return (
                  <button
                    key={city.id}
                    onClick={() => navigate(`/city/${city.id}`)}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border transition-colors active:scale-95"
                    style={{ background: 'white', border: '1.5px solid #E2E8F0', color: '#071B33' }}
                  >
                    <span style={{ fontSize: '14px' }}>📍</span>
                    {label}
                    {(city.total || 0) > 0 && (
                      <span className="text-[11px] font-bold text-[#FF7900] bg-orange-50 rounded-full px-2 py-0.5 leading-none">
                        {city.total}
                      </span>
                    )}
                  </button>
                )
              })}
              {/* extra right padding so last pill doesn't touch the fade */}
              <div className="flex-shrink-0 w-6" />
            </div>
            {/* fade on the left (trailing edge in RTL) */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 left-0 w-10"
              style={{ background: 'linear-gradient(to right, #F8FAFC 40%, transparent)' }}
            />
            {/* subtle fade on the right (leading edge in RTL) */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 right-0 w-10"
              style={{ background: 'linear-gradient(to left, #F8FAFC 40%, transparent)' }}
            />
          </div>
        )}

        {/* ── كيف يعمل التطبيق ── */}
        <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #FFF7F0, #FFF3E8)', border: '1px solid rgba(255,121,0,0.15)' }}>
          {[
            { icon: '📍', text: ar ? 'اختر مدينة' : 'Pick a city' },
            { icon: '🔍', text: ar ? 'ابحث أو تصفّح' : 'Search or browse' },
            { icon: '📞', text: ar ? 'تواصل مباشرة' : 'Contact directly' },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-1.5 flex-1 justify-center">
              <span className="text-base leading-none">{step.icon}</span>
              <span className="text-[11px] font-bold text-[#071B33] leading-tight">{step.text}</span>
              {i < arr.length - 1 && (
                <span className="text-[#FF7900] font-black text-xs mx-0.5">{ar ? '←' : '→'}</span>
              )}
            </div>
          ))}
        </div>

        {/* ── التخصصات الأكثر طلباً ── */}
        {allSortedCategories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-[#071B33]">
                  {ar ? '🔥 الأكثر طلباً' : '🔥 Most Requested'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                  {ar ? 'من أصل كل التخصصات' : 'from all specialties'}
                </span>
              </div>
              <Link href="/categories" className="text-[11px] font-bold text-[#FF7900] flex items-center gap-0.5">
                {ar ? 'عرض الكل' : 'View all'}
                {ar ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </Link>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {allSortedCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm"
                    style={{ border: '1.5px solid rgba(255,121,0,0.18)' }}>
                    <img
                      src={`/icons/categories/${cat.id}.png`}
                      alt={ar ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.parentElement.style.background = 'rgba(255,121,0,0.08)' }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#071B33] text-center w-16 leading-tight line-clamp-2">
                    {ar ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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
              className="mt-4 relative overflow-hidden rounded-2xl shadow-xl active:scale-[0.98] transition-all duration-200 select-none cursor-pointer"
              style={{ background: 'linear-gradient(125deg, #0a4e60 0%, #0e7c8f 55%, #1a6b50 100%)' }}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-[#FF7900]/10 pointer-events-none" />
              <div className="absolute top-2 right-16 w-4 h-4 rounded-full bg-white/10 pointer-events-none" />

              <div className="relative flex items-center gap-4 px-5 py-4">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.2)' }}
                >
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.8"/>
                    <path d="M3 8l9 5 9-5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
                    <line x1="12" y1="13" x2="12" y2="21" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
                  </svg>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-extrabold text-[17px] leading-tight tracking-tight">
                      {ar ? 'مستلزمات اطلب فني' : 'Otlob Fanni Supplies'}
                    </p>
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 leading-none"
                      style={{ background: '#FF7900', color: 'white' }}
                    >
                      {ar ? 'جديد' : 'NEW'}
                    </span>
                  </div>
                  <p className="text-white text-sm font-semibold leading-snug">
                    {ar ? 'معدات • أدوات • قطع غيار • مورّدون' : 'Equipment • Tools • Parts • Suppliers'}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  {dir === 'rtl'
                    ? <ChevronLeft className="w-4 h-4 text-white" />
                    : <ChevronRight className="w-4 h-4 text-white" />}
                </div>
              </div>
            </div>
          </Link>

          {/* ── رشّح فني ── */}
          <button
            onClick={() => setShowReferral(true)}
            className="mt-4 w-full flex items-center gap-3 rounded-2xl px-5 py-3.5 active:scale-[0.98] transition-transform select-none"
            style={{ background: 'linear-gradient(90deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.3)' }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-white font-extrabold text-sm leading-tight">
                {ar ? 'رشّح فنياً أو شركة خدمية أو مورد مستلزمات' : 'Suggest a Technician, Service Company or Parts Supplier'}
              </p>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                {ar ? 'ساعدنا في توسيع الدليل' : 'Help us grow the directory'}
              </p>
            </div>
            <UserPlus className="w-4 h-4 text-white/40 flex-shrink-0" />
          </button>

          {/* ── قناة تيليغرام ── */}
          <a
            href="https://t.me/otlobfanni"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl px-5 py-3.5 active:scale-[0.98] transition-transform select-none"
            style={{ background: 'linear-gradient(90deg, #229ED9 0%, #1a7fb5 100%)', boxShadow: '0 4px 16px rgba(34,158,217,0.3)' }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </div>
            <div className="flex-1 text-right">
              <p className="text-white font-extrabold text-sm leading-tight">
                {ar ? 'تابعنا على تيليغرام' : 'Follow us on Telegram'}
              </p>
              <p className="text-white/70 text-xs font-medium mt-0.5">t.me/otlobfanni</p>
            </div>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/40 flex-shrink-0"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </a>

          {/* ── شارك التطبيق ── */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'اطلب فني – Otlob Fanni',
                  text: ar
                    ? 'دليل الفنيين والشركات والموردين في ليبيا – اطلب فني'
                    : "Libya's technician & company directory – Otlob Fanni",
                  url: 'https://otlobfanni.ly',
                })
              } else {
                navigator.clipboard?.writeText('https://otlobfanni.ly')
              }
            }}
            className="mt-4 w-full flex items-center gap-3 rounded-2xl px-5 py-3.5 active:scale-[0.98] transition-transform select-none"
            style={{ background: 'linear-gradient(90deg, #7B2FBE 0%, #5a1fa0 100%)', boxShadow: '0 4px 16px rgba(123,47,190,0.3)' }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-white font-extrabold text-sm leading-tight">
                {ar ? 'شارك التطبيق مع أصدقائك' : 'Share the app with friends'}
              </p>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                {ar ? 'ساعد في نشر اطلب فني في ليبيا' : 'Help spread Otlob Fanni in Libya'}
              </p>
            </div>
            <Share2 className="w-4 h-4 text-white/40 flex-shrink-0" />
          </button>

          {/* خريطة توزيع مقدمي الخدمات في ليبيا */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-sm font-extrabold text-[#071B33]">
                {ar ? '🗺️ مقدمو الخدمات في ليبيا' : '🗺️ Providers Across Libya'}
              </span>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900] inline-block" />
                  {ar ? 'نشط' : 'Active'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  {ar ? 'قريباً' : 'Soon'}
                </span>
              </div>
            </div>
            <LibyaMap stats={citiesForFilter} ar={ar} />
            <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-gray-400 font-medium">
              <span>🔧 {ar ? 'فنيون' : 'Technicians'}</span>
              <span>🏢 {ar ? 'شركات' : 'Companies'}</span>
              <span>📦 {ar ? 'موردون' : 'Suppliers'}</span>
            </div>
          </div>

          {/* زر الانضمام */}
          <Link href="/join-us">
            <div
              className="mt-3 rounded-2xl px-5 py-4 active:scale-95 transition-transform duration-150 shadow-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(90deg, #34C759 0%, #248a3d 100%)',
                boxShadow: '0 4px 16px rgba(52,199,89,0.4)',
              }}
            >
              <p className="text-white font-extrabold text-base leading-tight text-center">
                {ar ? 'انضم إلينا كفني أو كشركة خدمات أو كمزوّد مستلزمات' : 'Join us as a Technician, Service Company or Supplies Provider'}
              </p>
            </div>
          </Link>

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

    {/* ── Modal: رشّح / اقترح ── */}
    {showReferral && (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setShowReferral(false)}
      >
        <div
          className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 pb-28"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
          <h3 className="text-lg font-extrabold text-[#071B33] mb-1 text-center">
            {ar ? '💡 رشّح شخصاً تعرفه' : '💡 Recommend Someone'}
          </h3>
          <p className="text-xs text-gray-400 text-center mb-5">
            {ar ? 'أدخل بياناته وسنتواصل معه للانضمام' : 'Enter their info and we\'ll reach out'}
          </p>

          {/* اختيار النوع */}
          <div className="flex gap-2 mb-1">
            {[
              { key: 'technician', label: ar ? '👷 فني'            : '👷 Technician',        sub: ar ? 'كهربائي، سباك، نجار...'        : 'Electrician, plumber...' },
              { key: 'company',    label: ar ? '🏢 شركة خدمية'     : '🏢 Service Company',   sub: ar ? 'صيانة، تكييف، نظافة...'        : 'Maintenance, HVAC...' },
              { key: 'supplier',   label: ar ? '📦 مورّد مستلزمات' : '📦 Parts Supplier',    sub: ar ? 'قطع غيار، مواد بناء...'        : 'Spare parts, materials...' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setReferralForm(f => ({ ...f, type: t.key }))}
                className={`flex-1 py-2 px-1 rounded-xl text-center border-2 transition-all flex flex-col items-center gap-0.5 ${
                  referralForm.type === t.key
                    ? 'border-[#FF7900] bg-orange-50 text-[#FF7900]'
                    : 'border-gray-400 text-gray-500 hover:border-gray-500'
                }`}
              >
                <span className="text-[11px] font-extrabold leading-tight">{t.label}</span>
                <span className="text-[9px] opacity-70 leading-tight">{t.sub}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mb-3">
            {ar ? '* التطبيق مخصص للخدمات الفنية والحرفية فقط' : '* App is for technical & craft services only'}
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={ar ? 'الاسم *' : 'Full name *'}
              value={referralForm.name}
              onChange={e => setReferralForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-[#071B33] outline-none focus:border-[#FF7900]"
              dir="rtl"
            />
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 px-1">
                {ar ? 'رقم واتساب *' : 'WhatsApp number *'}
              </p>
              <LibyaPhoneInput
                required
                value={referralForm.phone}
                onChange={v => setReferralForm(f => ({ ...f, phone: v }))}
              />
            </div>
            <input
              type="text"
              placeholder={
                referralForm.type === 'technician'
                  ? (ar ? 'التخصص (اختياري)' : 'Specialty (optional)')
                  : referralForm.type === 'company'
                  ? (ar ? 'نوع الخدمة (اختياري)' : 'Service type (optional)')
                  : (ar ? 'نوع المستلزمات (اختياري)' : 'Product type (optional)')
              }
              value={referralForm.specialty}
              onChange={e => setReferralForm(f => ({ ...f, specialty: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-[#071B33] outline-none focus:border-[#FF7900]"
              dir="rtl"
            />
            <input
              type="text"
              placeholder={ar ? 'المدينة (اختياري)' : 'City (optional)'}
              value={referralForm.city}
              onChange={e => setReferralForm(f => ({ ...f, city: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-[#071B33] outline-none focus:border-[#FF7900]"
              dir="rtl"
            />
            <button
              disabled={referralForm.submitting || !referralForm.name.trim() || !referralForm.phone.trim()}
              onClick={async () => {
                setReferralForm(f => ({ ...f, submitting: true }))
                try {
                  await api.submitReferral({
                    type:      referralForm.type,
                    name:      referralForm.name.trim(),
                    phone:     referralForm.phone.trim(),
                    specialty: referralForm.specialty.trim() || null,
                    city:      referralForm.city.trim() || null,
                  })
                  setShowReferral(false)
                  setReferralForm({ type: 'technician', name: '', phone: '', specialty: '', city: '', submitting: false })
                  alert(ar ? '✅ شكراً! تم إرسال الترشيح بنجاح' : '✅ Thanks! Referral submitted.')
                } catch {
                  alert(ar ? 'حدث خطأ، حاول مرة أخرى' : 'Error, please try again.')
                  setReferralForm(f => ({ ...f, submitting: false }))
                }
              }}
              className="w-full rounded-xl py-3.5 text-sm font-extrabold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, #FF7900 0%, #c45e00 100%)' }}
            >
              {referralForm.submitting
                ? (ar ? 'جاري الإرسال...' : 'Sending...')
                : (ar ? '✅ إرسال الترشيح' : '✅ Submit Referral')}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
