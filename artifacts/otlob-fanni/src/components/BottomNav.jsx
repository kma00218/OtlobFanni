import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { Link, useLocation } from 'wouter';
import api from '../lib/api';
import { categories, sections } from '../data/services';

const ALL_CATS = categories.filter(c => c.id !== 'more');

const TABS = [
  {
    id: 'home',
    path: '/',
    exact: true,
    labelAr: 'الرئيسية',
    labelEn: 'Home',
    bg: 'from-[#071B33] to-[#1a3a5c]',
    shadow: 'shadow-slate-300',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: 'cities',
    path: null,
    exact: false,
    labelAr: 'مدن',
    labelEn: 'Cities',
    bg: 'from-[#0ea5e9] to-[#0369a1]',
    shadow: 'shadow-sky-200',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'specialties',
    path: null,
    exact: false,
    labelAr: 'تخصصات',
    labelEn: 'Specialties',
    bg: 'from-[#FF7900] to-[#e86d00]',
    shadow: 'shadow-orange-200',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    id: 'join-us',
    path: '/join-us',
    exact: false,
    labelAr: 'انضم',
    labelEn: 'Join',
    bg: 'from-[#34C759] to-[#248a3d]',
    shadow: 'shadow-green-200',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="16" y1="11" x2="22" y2="11"/>
      </svg>
    ),
  },
  {
    id: 'more',
    path: '/more',
    exact: false,
    labelAr: 'المزيد',
    labelEn: 'More',
    bg: 'from-[#8E8E93] to-[#636366]',
    shadow: 'shadow-gray-300',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { lang } = useLang();
  const [location, navigate] = useLocation();
  const ar = lang === 'ar';

  // ── Sheet visibility ────────────────────────────────────────────────────────
  const [showCities, setShowCities] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────────
  const [cities, setCities] = useState([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  // ── Search ──────────────────────────────────────────────────────────────────
  const [citySearch, setCitySearch] = useState('');
  const [specSearch, setSpecSearch] = useState('');

  // no cross-filter state — each picker is independent

  // ── Keyboard offset ─────────────────────────────────────────────────────────
  const [kbOffset, setKbOffset] = useState(0);

  const anySheetOpen = showCities || showSpecs;

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !anySheetOpen) { setKbOffset(0); return; }
    const update = () => {
      setKbOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, [anySheetOpen]);

  // ── Load cities lazily ──────────────────────────────────────────────────────
  useEffect(() => {
    if (showCities && !citiesLoaded) {
      api.cityStats().then(data => {
        setCities([...data].sort((a, b) => (b.total || 0) - (a.total || 0)));
        setCitiesLoaded(true);
      }).catch(() => {});
    }
  }, [showCities, citiesLoaded]);

  // ── Filtered lists ──────────────────────────────────────────────────────────
  const filteredCities = cities.filter(c => {
    if (!citySearch.trim()) return true;
    const q = citySearch.trim().toLowerCase();
    return (c.nameAr || '').includes(citySearch.trim()) || (c.nameEn || '').toLowerCase().includes(q);
  });

  const filteredCats = ALL_CATS.filter(c => {
    if (!specSearch.trim()) return true;
    const q = specSearch.trim().toLowerCase();
    return (c.nameAr || '').includes(specSearch.trim()) || (c.nameEn || '').toLowerCase().includes(q);
  });

  // ── Grouped categories (for display without search) ─────────────────────────
  const groupedCats = sections.map(sec => ({
    ...sec,
    cats: filteredCats.filter(c => c.sectionId === sec.id),
  })).filter(g => g.cats.length > 0);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const closeAll = () => { setShowCities(false); setShowSpecs(false); setCitySearch(''); setSpecSearch(''); };

  // ── Remembered city (persists across navigation) ────────────────────────────
  const [rememberedCity, setRememberedCity] = useState(() => {
    try { return JSON.parse(localStorage.getItem('otlob_city') || 'null'); } catch { return null; }
  }); // { id, nameAr, nameEn }

  const rememberCity = (id, city) => {
    const val = id === 'libya' ? null : (city ? { id, nameAr: city.nameAr, nameEn: city.nameEn } : null);
    setRememberedCity(val);
    try { localStorage.setItem('otlob_city', JSON.stringify(val)); } catch {}
  };

  const getActiveCity = () => {
    // Priority 1: current URL (/city/:id or /category/:id?city=X)
    const cityPageMatch = location.match(/^\/city\/([^/?]+)/);
    if (cityPageMatch && cityPageMatch[1] !== 'libya') return cityPageMatch[1];
    const catPageMatch = location.match(/^\/category\/[^/?]+\?.*city=([^&]+)/);
    if (catPageMatch) return decodeURIComponent(catPageMatch[1]);
    // Priority 2: remembered city
    return rememberedCity?.id || null;
  };

  const handleCityClick = (cityId, city) => {
    closeAll();
    rememberCity(cityId, city);
    // If currently on a category page, stay on that category with the new city
    const catMatch = location.match(/^\/category\/([^/?]+)/);
    const catId = catMatch ? catMatch[1] : null;
    if (catId && cityId !== 'libya') {
      navigate(`/category/${catId}?city=${cityId}`);
    } else {
      navigate(`/city/${cityId}`);
    }
  };

  const handleCatClick = (cat) => {
    closeAll();
    const activeCity = getActiveCity();
    if (activeCity && activeCity !== 'libya') {
      navigate(`/category/${cat.id}?city=${activeCity}`);
    } else {
      navigate(`/category/${cat.id}`);
    }
  };

  const sheetStyle = {
    maxHeight: '82dvh',
    paddingBottom: 'env(safe-area-inset-bottom, 12px)',
    transform: `translateY(-${kbOffset}px)`,
    transition: kbOffset > 0 ? 'transform 0.2s ease-out' : 'transform 0.15s ease-in',
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 border-t border-[#EAEAEA] z-50 max-w-[480px] mx-auto bg-white"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {TABS.map((tab) => {
            const isCities = tab.id === 'cities';
            const isSpecs = tab.id === 'specialties';
            const active = isCities
              ? showCities || location.startsWith('/city/')
              : isSpecs
                ? showSpecs || location.startsWith('/category/')
                : tab.exact
                  ? location === tab.path
                  : location.startsWith(tab.path);
            const label = ar ? tab.labelAr : tab.labelEn;

            const inner = (
              <div className="flex flex-col items-center gap-1 select-none cursor-pointer relative">
                <div className={`
                  w-[46px] h-[46px] rounded-[13px] flex items-center justify-center
                  bg-gradient-to-br ${tab.bg}
                  shadow-md ${tab.shadow}
                  transition-all duration-200
                  ${active ? 'scale-110 shadow-lg' : 'scale-100 opacity-75'}
                  active:scale-95
                `}>
                  {tab.svg}
                </div>
                <span className={`text-[9.5px] font-semibold leading-tight transition-colors duration-200 ${
                  active ? 'text-[#071B33]' : 'text-gray-400'
                }`}>
                  {isCities && rememberedCity
                    ? (ar ? rememberedCity.nameAr : (rememberedCity.nameEn || rememberedCity.nameAr))
                    : label}
                </span>
              </div>
            );

            if (isCities) {
              return (
                <button key={tab.id} onClick={() => { setShowSpecs(false); setShowCities(v => !v); setCitySearch(''); }}>
                  {inner}
                </button>
              );
            }
            if (isSpecs) {
              return (
                <button key={tab.id} onClick={() => { setShowCities(false); setShowSpecs(v => !v); setSpecSearch(''); }}>
                  {inner}
                </button>
              );
            }

            return (
              <Link key={tab.id} href={tab.path}>
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── CITY PICKER ────────────────────────────────────────────────────────── */}
      {showCities && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end max-w-[480px] mx-auto left-0 right-0"
          onClick={closeAll}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-3xl overflow-hidden flex flex-col" style={sheetStyle}
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-4 pb-2 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[18px] font-black text-[#071B33]">
                  {ar ? '📍 اختر مدينة' : '📍 Choose a City'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ar ? 'اعثر على الفنيين والشركات في مدينتك' : 'Find technicians & companies in your city'}
                </p>
              </div>
              <button onClick={closeAll}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">
                ×
              </button>
            </div>


            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" value={citySearch} onChange={e => setCitySearch(e.target.value)}
                  placeholder={ar ? 'ابحث عن مدينة...' : 'Search city...'}
                  className="flex-1 bg-transparent text-sm text-[#071B33] placeholder-gray-400 outline-none"
                  dir={ar ? 'rtl' : 'ltr'} />
              </div>
            </div>

            {/* Libya-wide shortcut */}
            <div className="px-4 pb-2 flex-shrink-0">
              <button onClick={() => { rememberCity('libya', null); closeAll(); navigate('/city/libya'); }}
                className="w-full flex items-center justify-between bg-gradient-to-r from-[#071B33] to-[#1a3a5c] text-white rounded-2xl px-4 py-2.5 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇱🇾</span>
                  <div className="text-start">
                    <p className="font-black text-sm leading-tight">{ar ? 'كل ليبيا' : 'All Libya'}</p>
                    <p className="text-[11px] text-white/60">{ar ? 'عرض الجميع' : 'Show all'}</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
              {!citiesLoaded ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">{ar ? 'لا توجد نتائج' : 'No results'}</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredCities.map(city => {
                    const name = ar ? city.nameAr : (city.nameEn || city.nameAr);
                    const techs = city.technicians || 0;
                    const comps = city.companies || 0;
                    const sups = city.suppliers || 0;
                    const total = city.total || techs + comps + sups;
                    const hasAny = total > 0;
                    return (
                      <button key={city.id} onClick={() => handleCityClick(city.id, city)}
                        className="relative flex flex-col items-center justify-between bg-white border border-gray-100 rounded-2xl px-3 py-3.5 shadow-sm active:scale-[0.97] transition-transform text-center overflow-hidden"
                      >
                        <div className="absolute inset-0 pointer-events-none rounded-2xl"
                          style={{ background: 'linear-gradient(135deg, rgba(255,121,0,0.04) 0%, transparent 60%)' }} />
                        {hasAny && (
                          <span className="absolute top-2 left-2 text-[10px] font-black bg-[#071B33] text-white px-1.5 py-0.5 rounded-full leading-none">
                            {total}
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-xl bg-[#FF7900]/10 flex items-center justify-center mb-1.5 flex-shrink-0">
                          <svg className="w-4 h-4 text-[#FF7900]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                        </div>
                        <p className="font-black text-[#071B33] text-[15px] leading-tight mb-2">{name}</p>
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {techs > 0 && (
                            <span className="text-[11px] font-bold bg-[#FF7900]/10 text-[#FF7900] px-1.5 py-0.5 rounded-full leading-none">🔧 {techs}</span>
                          )}
                          {comps > 0 && (
                            <span className="text-[11px] font-bold bg-blue-50 text-[#1e40af] px-1.5 py-0.5 rounded-full leading-none">🏢 {comps}</span>
                          )}
                          {sups > 0 && (
                            <span className="text-[11px] font-bold bg-teal-50 text-[#0e7c8f] px-1.5 py-0.5 rounded-full leading-none">📦 {sups}</span>
                          )}
                          {!hasAny && (
                            <span className="text-[11px] text-gray-300 font-medium">{ar ? 'قريباً' : 'Soon'}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SPECIALTIES PICKER ─────────────────────────────────────────────────── */}
      {showSpecs && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end max-w-[480px] mx-auto left-0 right-0"
          onClick={closeAll}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-3xl overflow-hidden flex flex-col" style={sheetStyle}
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-4 pb-2 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[18px] font-black text-[#071B33]">
                  {ar ? '🔧 اختر تخصصاً' : '🔧 Choose a Specialty'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ar ? 'ابحث عن الفنيين حسب التخصص' : 'Find technicians by specialty'}
                </p>
              </div>
              <button onClick={closeAll}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">
                ×
              </button>
            </div>


            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" value={specSearch} onChange={e => setSpecSearch(e.target.value)}
                  placeholder={ar ? 'ابحث: كهرباء، سباكة، تكييف...' : 'Search: plumbing, AC...'}
                  className="flex-1 bg-transparent text-sm text-[#071B33] placeholder-gray-400 outline-none"
                  dir={ar ? 'rtl' : 'ltr'} />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
              {groupedCats.map(group => (
                <div key={group.id} className="mb-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-2">
                    {ar ? group.nameAr : group.nameEn}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {group.cats.map(cat => {
                      return (
                        <button key={cat.id} onClick={() => handleCatClick(cat)}
                          className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 shadow-sm rounded-2xl px-2 py-3 active:scale-[0.96] transition-transform text-center">
                          <img
                            src={`/icons/categories/${cat.iconName}.png`}
                            alt={cat.nameAr}
                            className="w-10 h-10 object-contain"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <p className="text-[11.5px] font-bold leading-tight line-clamp-2 text-[#071B33]">
                            {ar ? cat.nameAr : cat.nameEn}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredCats.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">{ar ? 'لا توجد نتائج' : 'No results'}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
