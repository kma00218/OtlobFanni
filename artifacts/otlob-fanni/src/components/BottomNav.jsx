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
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: 'all-specialties',
    path: '/all-specialties',
    exact: false,
    labelAr: 'كل التخصصات',
    labelEn: 'All Specialties',
    bg: 'from-[#FF7900] to-[#d96400]',
    shadow: 'shadow-orange-200',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
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
  const [location] = useLocation();
  const ar = lang === 'ar';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-[#EAEAEA] z-50 max-w-[480px] mx-auto bg-white"
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
