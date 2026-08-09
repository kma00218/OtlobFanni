import { useRef, useState, useEffect, useCallback } from 'react'
import { useLang } from '../context/LanguageContext'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import SectionCard from '../components/SectionCard'
import { sections } from '../data/services'
import { useAllCategories } from '../hooks/useAllCategories'
import { ArrowLeft, ArrowRight, Building2, LayoutGrid, Users, Package, ChevronLeft, ChevronRight, Share2, UserPlus, Wrench, X, ClipboardList, MapPin, Clock, Search } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import AdBanner from '../components/AdBanner'
import StatsAdCarousel from '../components/StatsAdCarousel'
import { api, getFileUrl } from '../lib/api'
import { SkeletonRecentCard } from '../components/Skeleton'
import LibyaPhoneInput from '../components/LibyaPhoneInput'
import LibyaMap from '../components/LibyaMap'

function timeAgo(dateStr, ar) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return ar ? 'الآن' : 'Just now'
  if (mins < 60) return ar ? `منذ ${mins} دقيقة` : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return ar ? `منذ ${hrs} ساعة` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return ar ? `منذ ${days} يوم` : `${days}d ago`
}

function RecentRequestCard({ req, ar, onTap }) {
  const iconKey = req.iconName || req.categoryId
  const iconSrc = iconKey ? `/icons/categories/${iconKey}.png` : null
  return (
    <button
      type="button"
      onClick={() => onTap(req)}
      className="flex-shrink-0 w-52 flex items-center gap-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-2.5 active:scale-[0.98] transition-transform text-right"
    >
      <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,rgba(255,121,0,0.12),rgba(7,27,51,0.08))' }}>
        {iconSrc ? (
          <img src={iconSrc} alt="" className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display='none' }} />
        ) : (
          <ClipboardList className="w-5 h-5 text-[#FF7900]/60" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-[13px] font-bold text-[#071B33] truncate leading-tight">
          {req.categoryName || (ar ? 'طلب خدمة' : 'Service Request')}
        </p>
        {req.cityName && (
          <p className="text-[11px] text-[#FF7900] font-medium flex items-center gap-0.5 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />{req.cityName}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          {ar ? 'مفتوح' : 'Open'}
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />{timeAgo(req.createdAt, ar)}
        </span>
      </div>
    </button>
  )
}

function ProRequiredModal({ ar, onClose, onJoin }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pb-8 pt-5 shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-[#071B33]">
            {ar ? 'عرض تفاصيل الطلب' : 'View Request Details'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <p className="text-sm font-semibold text-[#071B33] leading-relaxed">
            {ar
              ? 'سجّل كفني أو شركة خدمات أو مورد مستلزمات لعرض تفاصيل الطلب وإرسال عرض.'
              : 'Register as a technician, service company, or supplier to view request details and send an offer.'}
          </p>
        </div>
        <button
          onClick={onJoin}
          className="w-full py-3.5 rounded-2xl text-white font-black text-sm active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg,#FF7900,#FF9500)' }}
        >
          {ar ? 'انضم الآن' : 'Join Now'}
        </button>
      </div>
    </div>
  )
}

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

const BROWSE_TYPES = [
  {
    key: 'tech',
    icon: '🔧',
    accent: '#FF7900',
    shadow: '0 6px 20px rgba(255,121,0,0.35)',
    href: '/categories',
    ar: 'فنيون',
    en: 'Technicians',
    subAr: 'كهرباء، سباكة، نجارة...',
    subEn: 'Electric, plumbing...',
  },
  {
    key: 'company',
    icon: '🏢',
    accent: '#1a56db',
    shadow: '0 6px 20px rgba(26,86,219,0.35)',
    href: '/companies',
    ar: 'شركات خدمات',
    en: 'Service Cos.',
    subAr: 'صيانة، تكييف، نظافة...',
    subEn: 'Maintenance, HVAC...',
  },
  {
    key: 'supplier',
    icon: '📦',
    accent: '#0d9488',
    shadow: '0 6px 20px rgba(13,148,136,0.35)',
    href: '/suppliers',
    ar: 'موردون',
    en: 'Suppliers',
    subAr: 'أدوات، مواد، معدات...',
    subEn: 'Tools, materials...',
  },
]

const JOIN_TYPES = [
  {
    key: 'tech',
    img: '/join-cards/technician-v2.png',
    accent: '#FF7900',
    shadow: '0 6px 20px rgba(255,121,0,0.35)',
    ar: 'هل أنت فني؟',
    en: 'Are you a Technician?',
    subAr: 'سجّل مجاناً',
    subEn: 'Register Free',
  },
  {
    key: 'company',
    img: '/join-cards/company-v2.png',
    accent: '#1a56db',
    shadow: '0 6px 20px rgba(26,86,219,0.35)',
    ar: 'لديك شركة خدمية؟',
    en: 'Have a Service Company?',
    subAr: 'سجّل شركتك',
    subEn: 'Register Now',
  },
  {
    key: 'supplier',
    img: '/join-cards/supplier-v2.png',
    accent: '#0d9488',
    shadow: '0 6px 20px rgba(13,148,136,0.35)',
    ar: 'مورّد مستلزمات؟',
    en: 'Are you a Supplier?',
    subAr: 'انضم إلينا',
    subEn: 'Join Us',
  },
]

function BrowseCards({ ar }) {
  return (
    <div className="flex gap-2">
      {BROWSE_TYPES.map(type => (
        <Link key={type.key} href={type.href} className="flex-1">
          <div
            className="rounded-2xl active:scale-95 transition-transform duration-150 select-none cursor-pointer flex flex-col items-center justify-center py-4 px-2 gap-2"
            style={{ background: type.accent, boxShadow: type.shadow }}
          >
            <span style={{ fontSize: '32px', lineHeight: 1 }}>{type.icon}</span>
            <p className="text-white font-black text-xs text-center leading-tight">{ar ? type.ar : type.en}</p>
            <p className="text-white/80 text-[10px] font-semibold text-center leading-tight">{ar ? type.subAr : type.subEn}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function JoinCards({ ar }) {
  return (
    <div className="flex gap-2">
      {JOIN_TYPES.map(type => (
        <Link key={type.key} href="/join-us" className="flex-1">
          <div
            className="relative overflow-hidden rounded-2xl active:scale-95 transition-transform duration-150 select-none cursor-pointer flex flex-col"
            style={{ boxShadow: type.shadow }}
          >
            <div className="relative w-full" style={{ paddingBottom: '90%' }}>
              <img src={type.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="w-full flex flex-col items-center justify-center py-2 px-1" style={{ background: type.accent }}>
              <p className="text-white font-black text-xs text-center leading-tight">{ar ? type.ar : type.en}</p>
              <p className="text-white/90 text-[11px] font-bold mt-0.5 text-center">{ar ? type.subAr : type.subEn}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Home() {
  const { dir, lang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef(null)
  const cityRef        = useRef(null)
  const [cityPulse, setCityPulse] = useState(false)
  const allCategoriesData = useAllCategories()
  const [recent, setRecent] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [citiesForFilter, setCitiesForFilter] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [showReferral, setShowReferral] = useState(false)
  const [referralForm, setReferralForm] = useState({ type: 'technician', name: '', phone: '', specialty: '', city: '', submitting: false })
  const [recentRequests, setRecentRequests] = useState([])
  const [showProModal, setShowProModal] = useState(false)


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
        setCitiesForFilter([...data].sort((a, b) => (b.total || 0) - (a.total || 0)))
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

  useEffect(() => {
    const load = () => api.recentGeneralRequests()
      .then(data => setRecentRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
    load()
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [])

  const activeSections = sections.filter(s => s.isActive)

  // All categories: popular first, then the rest (excluding 'more' meta-entry)
  const popularIds = new Set(topCategories.map(c => c.id))
  const remainingCats = allCategoriesData
    .filter(c => c.id !== 'more' && !popularIds.has(c.id))
    .map(c => ({ id: c.id, nameAr: c.nameAr, nameEn: c.nameEn, iconName: c.iconName }))
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
          direction: ltr;
        }
        .of-ticker-inner {
          display: inline-flex;
          align-items: center;
          height: 36px;
          white-space: nowrap;
          direction: ltr;
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
        <div className="flex justify-center" onClick={handleLogoClick} style={{ cursor: 'default' }}>
          <Logo />
        </div>

        {/* ── بطاقة الإطلاق + إعلانات home_top ── */}
        {stats && <StatsAdCarousel stats={stats} ar={ar} />}

        {/* ── قسم العميل ── */}
        <div>
          {/* Full-width search banner — tappable guide */}
          <button
            className="w-full rounded-2xl overflow-hidden mb-3 shadow-lg active:scale-[0.98] transition-transform text-right"
            style={{ background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)' }}
            dir={ar ? 'rtl' : 'ltr'}
            onClick={() => {
              cityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setCityPulse(true)
              setTimeout(() => setCityPulse(false), 3000)
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div
                className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(255,121,0,0.18)', border: '1.5px solid rgba(255,121,0,0.35)' }}
              >
                <Search className="w-5 h-5 text-[#FF7900]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black leading-tight" style={{ fontSize: '15px' }}>
                  {ar ? 'ابحث عن' : 'Search for'}
                </p>
                <p className="font-bold leading-tight mt-0.5" style={{ fontSize: '12px', color: '#FFA94D' }}>
                  {ar ? 'فنيون · شركات خدمية · موردو مستلزمات' : 'Technicians · Companies · Suppliers'}
                </p>
              </div>
              {/* Arrow hint */}
              <div className="flex-shrink-0 flex flex-col items-center gap-0.5 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                <div className="w-0.5 h-3 bg-white/40 rounded-full" />
                <div
                  className="w-0 h-0"
                  style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid rgba(255,255,255,0.6)' }}
                />
              </div>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(to right, #FF7900, #ffb347)' }} />
          </button>

          {citiesForFilter.length > 0 && (
            <div ref={cityRef}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[16px] font-black text-[#071B33]">
                  {ar ? '📍 اختر مدينتك' : '📍 Choose your city'}
                </p>
                {cityPulse && (
                  <span
                    className="text-[11px] font-bold text-[#FF7900] animate-pulse"
                  >
                    {ar ? 'ابدأ من هنا ↓' : 'Start here ↓'}
                  </span>
                )}
              </div>
              <div
                className="relative -mx-1 rounded-xl transition-all duration-300"
                style={cityPulse ? { outline: '2.5px solid #FF7900', outlineOffset: '3px', borderRadius: '12px' } : {}}
              >
                <div
                  className="flex gap-2 overflow-x-auto pb-0.5 px-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {citiesForFilter.map(city => {
                    const label = ar ? city.nameAr : (city.nameEn || city.nameAr)
                    return (
                      <button
                        key={city.id}
                        onClick={() => { setCityPulse(false); navigate(`/city/${city.id}`) }}
                        className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold active:scale-95 transition-all"
                        style={cityPulse
                          ? { background: '#FF7900', border: '1.5px solid #FF7900', color: '#fff' }
                          : { background: '#FFF3E6', border: '1.5px solid #FFA94D', color: '#071B33' }
                        }
                      >
                        {label}
                        {(city.total || 0) > 0 && (
                          <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 leading-none ${cityPulse ? 'bg-white/20 text-white' : 'bg-orange-50 text-[#FF7900]'}`}>
                            {city.total}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-8"
                  style={{ background: cityPulse ? 'transparent' : 'linear-gradient(to right, white 30%, transparent)' }} />
                <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-8"
                  style={{ background: cityPulse ? 'transparent' : 'linear-gradient(to left, white 30%, transparent)' }} />
              </div>
            </div>
          )}
        </div>

        {/* ── بحث ── */}
        <SearchBar />

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
              {allSortedCategories.map(cat => {
                const _iconKey = cat.iconName || cat.icon_name || cat.id
                const _isUrl   = _iconKey && (_iconKey.startsWith('http') || _iconKey.startsWith('/api/'))
                const _iconSrc = _isUrl ? _iconKey : `/icons/categories/${_iconKey}.png`
                return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,rgba(255,121,0,0.10),rgba(255,149,0,0.04))', border: '1.5px solid rgba(255,121,0,0.18)' }}>
                    <img
                      src={_iconSrc}
                      alt={ar ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const img = e.currentTarget
                        if (img.dataset.fallback === '1') { img.style.display = 'none'; return }
                        img.dataset.fallback = '1'
                        img.src = `/icons/categories/${cat.id}.png`
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#071B33] text-center w-16 leading-tight line-clamp-2">
                    {ar ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                  </span>
                </button>
              )
              })}
            </div>
          </div>
        )}

        {/* آخر الطلبات — hidden for now to keep home page focused */}


        {/* Recently Joined + divider + provider heading — grouped tight */}
        <div className="flex flex-col gap-2">
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

        </div>

        {/* ── قسم الانضمام — إطار برتقالي ── */}
        <div className="-mx-4 px-4 py-6"
          style={{ borderTop: '3px solid #FF7900', borderBottom: '3px solid #FF7900' }}>

          {/* أو divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {ar ? 'أو' : 'OR'}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* عنوان قسم الانضمام */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-[#FFF4E8] border-2 border-[#071B33] rounded-2xl px-4 py-2.5 mb-0.5 shadow-sm">
              <span className="text-lg">💼</span>
              <p className="text-[14px] font-black text-[#FF7900] leading-tight whitespace-nowrap" style={{ letterSpacing: '-0.3px' }}>
                {ar ? 'هل أنت فني أو شركة خدمية أو مورد مستلزمات؟' : 'Are you a technician, service company or supplier?'}
              </p>
            </div>
            <p className="text-[15px] font-extrabold text-[#071B33] leading-snug">
              {ar ? 'انضم إلينا مجاناً' : 'Join Us for Free'}
            </p>
          </div>

          {/* بطاقات الانضمام */}
          <JoinCards ar={ar} />
        </div>

        <div className="mt-6">
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

          {/* ── بطاقات الإجراءات الثلاث في صف ── */}
          <div className="mt-4 flex gap-2">
            {/* رشّح */}
            <button
              onClick={() => setShowReferral(true)}
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-3 px-2 active:scale-95 transition-transform select-none"
              style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)', boxShadow: '0 4px 14px rgba(255,121,0,0.35)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-black text-xs text-center leading-tight">
                {ar ? 'رشّح فني أو شركة أو مورّد' : 'Suggest a Tech / Co. / Supplier'}
              </p>
            </button>

            {/* قناة واتساب */}
            <a
              href="https://whatsapp.com/channel/0029Vb8BOc3KbYMKjnChAv0O"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-3 px-2 active:scale-95 transition-transform select-none"
              style={{ background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)', boxShadow: '0 4px 14px rgba(18,140,126,0.35)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <p className="text-white font-black text-xs text-center leading-tight">
                {ar ? 'قناة واتساب' : 'WA Channel'}
              </p>
            </a>

            {/* قناة تيليغرام */}
            <a
              href="https://t.me/otlobfanni"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-3 px-2 active:scale-95 transition-transform select-none"
              style={{ background: 'linear-gradient(135deg, #229ED9 0%, #1a7fb5 100%)', boxShadow: '0 4px 14px rgba(34,158,217,0.35)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <p className="text-white font-black text-xs text-center leading-tight">
                {ar ? 'قناة تيليغرام' : 'TG Channel'}
              </p>
            </a>

            {/* شارك */}
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
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-3 px-2 active:scale-95 transition-transform select-none"
              style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #5a1fa0 100%)', boxShadow: '0 4px 14px rgba(123,47,190,0.35)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-black text-xs text-center leading-tight">
                {ar ? 'شارك' : 'Share'}
              </p>
            </button>
          </div>

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

          {/* زر الانضمام المبسّط */}
          <Link href="/join-us">
            <div
              className="mt-4 rounded-2xl px-5 py-4 active:scale-95 transition-transform duration-150 shadow-lg flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(90deg, #34C759 0%, #248a3d 100%)', boxShadow: '0 4px 16px rgba(52,199,89,0.4)' }}
            >
              <UserPlus className="w-5 h-5 text-white flex-shrink-0" />
              <p className="text-white font-extrabold text-base leading-tight text-center">
                {ar ? 'هل أنت فني أو شركة أو مورد؟ انضم مجاناً' : 'Technician, Company or Supplier? Join free'}
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

    {showProModal && (
      <ProRequiredModal
        ar={ar}
        onClose={() => setShowProModal(false)}
        onJoin={() => { setShowProModal(false); navigate('/join-us') }}
      />
    )}
    </div>
  )
}
