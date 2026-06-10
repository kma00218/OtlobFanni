import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { Link, useLocation } from 'wouter';
import api from '../lib/api';

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
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'join-us',
    path: '/join-us',
    exact: false,
    labelAr: 'انضم إلينا',
    labelEn: 'Join Us',
    bg: 'from-[#34C759] to-[#248a3d]',
    shadow: 'shadow-green-200',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
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

  const [showCities, setShowCities] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (showCities && !citiesLoaded) {
      api.cities().then(data => {
        const sorted = [...data].sort((a, b) => ((b.total || b.count || 0) - (a.total || a.count || 0)));
        setCities(sorted);
        setCitiesLoaded(true);
      }).catch(() => {});
    }
  }, [showCities, citiesLoaded]);

  const filteredCities = cities.filter(c => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (c.nameAr || '').includes(search.trim()) || (c.nameEn || '').toLowerCase().includes(q);
  });

  const handleCityClick = (cityId) => {
    setShowCities(false);
    setSearch('');
    navigate(`/city/${cityId}`);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 border-t border-[#EAEAEA] z-50 max-w-[480px] mx-auto bg-white"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <div className="flex items-center justify-around px-4 pt-2 pb-2">
          {TABS.map((tab) => {
            const isCities = tab.id === 'cities';
            const active = isCities
              ? showCities || location.startsWith('/city/')
              : tab.exact
                ? location === tab.path
                : location.startsWith(tab.path);
            const label = ar ? tab.labelAr : tab.labelEn;

            const inner = (
              <div className="flex flex-col items-center gap-1.5 select-none cursor-pointer">
                <div className={`
                  w-[52px] h-[52px] rounded-[14px] flex items-center justify-center
                  bg-gradient-to-br ${tab.bg}
                  shadow-md ${tab.shadow}
                  transition-all duration-200
                  ${active ? 'scale-110 shadow-lg' : 'scale-100 opacity-80'}
                  active:scale-95
                `}>
                  {tab.svg}
                </div>
                <span className={`text-[10px] font-semibold leading-tight transition-colors duration-200 ${
                  active ? 'text-[#071B33]' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            );

            if (isCities) {
              return (
                <button key={tab.id} onClick={() => { setShowCities(v => !v); setSearch(''); }}>
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

      {/* City picker bottom sheet */}
      {showCities && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end max-w-[480px] mx-auto left-0 right-0"
          onClick={() => { setShowCities(false); setSearch(''); }}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '80dvh', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[18px] font-black text-[#071B33]">
                  {ar ? '📍 اختر مدينة' : '📍 Choose a City'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ar ? 'اعثر على الفنيين والشركات في مدينتك' : 'Find technicians & companies in your city'}
                </p>
              </div>
              <button onClick={() => { setShowCities(false); setSearch(''); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">
                ×
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={ar ? 'ابحث عن مدينة...' : 'Search city...'}
                  className="flex-1 bg-transparent text-sm text-[#071B33] placeholder-gray-400 outline-none"
                  dir={ar ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            {/* Libya-wide shortcut */}
            <div className="px-4 pb-3 flex-shrink-0">
              <button
                onClick={() => handleCityClick('libya')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-[#071B33] to-[#1a3a5c] text-white rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
              >
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

            {/* Cities list */}
            <div className="overflow-y-auto flex-1 px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
              {!citiesLoaded ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {ar ? 'لا توجد نتائج' : 'No results'}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredCities.map(city => {
                    const name = ar ? city.nameAr : (city.nameEn || city.nameAr);
                    const count = city.total || city.count || 0;
                    return (
                      <button
                        key={city.id}
                        onClick={() => handleCityClick(city.id)}
                        className="w-full flex items-center justify-between bg-gray-50 hover:bg-orange-50 border border-gray-100 rounded-2xl px-4 py-3 active:scale-[0.98] transition-all text-start"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-[#FF7900]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                          <span className="font-bold text-[#071B33] text-sm">{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {count > 0 && (
                            <span className="text-xs font-bold bg-[#FF7900]/10 text-[#FF7900] px-2.5 py-1 rounded-full">
                              {count}
                            </span>
                          )}
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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
    </>
  );
}
