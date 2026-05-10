import { useLang } from '../context/LanguageContext';
import { Link, useLocation } from 'wouter';

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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="16" y1="11" x2="22" y2="11"/>
      </svg>
    ),
  },
  {
    id: 'favorites',
    path: '/favorites',
    exact: false,
    labelAr: 'المفضلة',
    labelEn: 'Saved',
    bg: 'from-[#FF2D55] to-[#c4002e]',
    shadow: 'shadow-rose-200',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { lang } = useLang();
  const [location] = useLocation();
  const ar = lang === 'ar';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 max-w-[480px] mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around px-4 pt-2 pb-2">
        {TABS.map((tab) => {
          const active = tab.exact
            ? location === tab.path
            : location.startsWith(tab.path);
          const label = ar ? tab.labelAr : tab.labelEn;

          return (
            <Link key={tab.id} href={tab.path}>
              <div className="flex flex-col items-center gap-1.5 select-none cursor-pointer">
                {/* iPhone-style icon */}
                <div
                  className={`
                    w-[52px] h-[52px] rounded-[14px] flex items-center justify-center
                    bg-gradient-to-br ${tab.bg}
                    shadow-md ${tab.shadow}
                    transition-all duration-200
                    ${active ? 'scale-110 shadow-lg' : 'scale-100 opacity-80'}
                    active:scale-95
                  `}
                >
                  {tab.svg}
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] font-semibold leading-tight transition-colors duration-200 ${
                    active ? 'text-[#071B33]' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
