import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, useRouter } from "wouter";
import { useEffect, useState } from "react";
import { track } from "./lib/tracker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLang } from "./context/LanguageContext";
import { AdminProvider } from "./context/AdminContext";
import { Download, Search, UserPlus } from "lucide-react";
import NotificationPrompt from "./components/NotificationPrompt";
import LocationPrompt from "./components/LocationPrompt";
import BottomNav from "./components/BottomNav";
import SearchOverlay from "./components/SearchOverlay";

// Public Pages — lazy loaded
const Home = lazy(() => import("./pages/Home"));
const Categories = lazy(() => import("./pages/Categories"));
const Section = lazy(() => import("./pages/Section"));
const CategoryTechnicians = lazy(() => import("./pages/CategoryTechnicians"));
const TechnicianDetails = lazy(() => import("./pages/TechnicianDetails"));
const Companies = lazy(() => import("./pages/Companies"));
const CompanyDetails = lazy(() => import("./pages/CompanyDetails"));
const Join = lazy(() => import("./pages/Join"));
const JoinCompany = lazy(() => import("./pages/JoinCompany"));
const Contact = lazy(() => import("./pages/Contact"));
const Orders = lazy(() => import("./pages/Orders"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Messages = lazy(() => import("./pages/Messages"));
const More = lazy(() => import("./pages/More"));
const Support = lazy(() => import("./pages/Support"));
const JoinUs = lazy(() => import("./pages/JoinUs"));
const AdvertiseWithUs = lazy(() => import("./pages/AdvertiseWithUs"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AllSpecialties = lazy(() => import("./pages/AllSpecialties"));
const CityTechnicians = lazy(() => import("./pages/CityTechnicians"));
const NotFound = lazy(() => import("./pages/not-found"));

// Admin — lazy loaded as a separate chunk
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60dvh]">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF7900] border-t-transparent animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!location.startsWith('/admin')) {
      track('page_view');
    }
  }, [location]);
  return null;
}

function InstallFAB() {
  const [location, navigate] = useLocation();
  const { lang } = useLang();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  });

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    const mq = window.matchMedia('(display-mode: standalone)');
    const mqHandler = (e) => { if (e.matches) setIsInstalled(true); };
    mq.addEventListener('change', mqHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  if (isInstalled) return null;
  if (location === '/more') return null;

  const handleClick = async () => {
    if (installPrompt) { track('install'); installPrompt.prompt(); return; }
    navigate('/more');
    setTimeout(() => {
      document.getElementById('install-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg active:scale-95 transition-transform font-bold text-white text-sm"
      style={{
        background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)',
        left: '50%',
        transform: 'translateX(-50%)',
        boxShadow: '0 4px 20px rgba(255,121,0,0.4)',
      }}
    >
      <Download className="w-4 h-4" />
      {lang === 'ar' ? 'ثبّت التطبيق' : 'Install App'}
    </button>
  );
}

function SearchFAB() {
  const [location] = useLocation();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  // Hide on home (already has search bar) and on join form pages
  const hidden = location === '/' || location === '/join' || location === '/join-company' || location.startsWith('/admin');
  if (hidden) return null;

  const ar = lang === 'ar';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 active:scale-90 transition-transform duration-150"
        style={{
          bottom: '96px',
          [ar ? 'right' : 'left']: '16px',
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FF7900 0%, #d96400 100%)',
          boxShadow: '0 4px 20px rgba(255,121,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={ar ? 'بحث' : 'Search'}
      >
        <Search className="w-6 h-6 text-white" />
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function JoinFAB() {
  const [location] = useLocation();
  const { lang } = useLang();
  const ar = lang === 'ar';

  const hidden =
    location === '/' ||
    location === '/join-us' ||
    location === '/join' ||
    location === '/join-company' ||
    location.startsWith('/admin');
  if (hidden) return null;

  return (
    <a
      href="/join-us"
      className="fixed z-40 flex flex-col items-center active:scale-90 transition-transform duration-150"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        [ar ? 'right' : 'left']: '0',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'linear-gradient(180deg, #34C759 0%, #248a3d 100%)',
          boxShadow: '0 4px 16px rgba(52,199,89,0.45)',
          borderRadius: ar ? '14px 0 0 14px' : '0 14px 14px 0',
          padding: '10px 8px',
        }}
      >
        <UserPlus className="w-5 h-5 text-white" />
        <span style={{
          fontSize: '9px',
          fontWeight: 800,
          color: '#fff',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: ar ? 'rotate(180deg)' : 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '0.5px',
        }}>
          {ar ? 'انضم إلينا' : 'Join us'}
        </span>
      </div>
    </a>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminPath = location.startsWith("/admin");

  if (isAdminPath) {
    return (
      <AdminProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/:rest*" component={AdminLayout} />
          </Switch>
        </Suspense>
      </AdminProvider>
    );
  }

  return (
    <LanguageProvider>
      <TooltipProvider>
        <ScrollToTop />
        <div className="min-h-[100dvh] max-w-[480px] mx-auto bg-background shadow-2xl relative shadow-black/10">
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/categories" component={Categories} />
              <Route path="/section/:id" component={Section} />
              <Route path="/category/:id" component={CategoryTechnicians} />
              <Route path="/technician/:id" component={TechnicianDetails} />
              <Route path="/companies" component={Companies} />
              <Route path="/company/:id" component={CompanyDetails} />
              <Route path="/join" component={Join} />
              <Route path="/join-company" component={JoinCompany} />
              <Route path="/contact" component={Contact} />
              <Route path="/orders" component={Orders} />
              <Route path="/favorites" component={Favorites} />
              <Route path="/messages" component={Messages} />
              <Route path="/support" component={Support} />
              <Route path="/more" component={More} />
              <Route path="/join-us" component={JoinUs} />
              <Route path="/advertise" component={AdvertiseWithUs} />
              <Route path="/all-specialties" component={AllSpecialties} />
              <Route path="/city/:id" component={CityTechnicians} />
              <Route path="/about" component={About} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <BottomNav />
          <JoinFAB />
          <SearchFAB />
          <InstallFAB />
          <NotificationPrompt />
          <LocationPrompt />
        </div>
        <Toaster />
      </TooltipProvider>
    </LanguageProvider>
  );
}

function App() {
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 450);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppContent />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
