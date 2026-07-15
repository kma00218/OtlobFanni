import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, useRouter, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect, useState } from "react";
import { track } from "./lib/tracker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLang } from "./context/LanguageContext";
import { AdminProvider } from "./context/AdminContext";
import { CustomerAccountProvider } from "./context/CustomerAccountContext";
import { Download, Search, UserPlus, ClipboardList } from "lucide-react";
import NotificationPrompt from "./components/NotificationPrompt";
import LocationPrompt from "./components/LocationPrompt";
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import SearchOverlay from "./components/SearchOverlay";
import InstallGuideModal from "./components/InstallGuideModal";

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
const JoinSupplier = lazy(() => import("./pages/JoinSupplier"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const SupplierDetails = lazy(() => import("./pages/SupplierDetails"));
const SuppliersSection = lazy(() => import("./pages/SuppliersSection"));
const Contact = lazy(() => import("./pages/Contact"));
const Orders = lazy(() => import("./pages/Orders"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Messages = lazy(() => import("./pages/Messages"));
const More = lazy(() => import("./pages/More"));
const Support = lazy(() => import("./pages/Support"));
const JoinUs = lazy(() => import("./pages/JoinUs"));
const AdvertiseWithUs = lazy(() => import("./pages/AdvertiseWithUs"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AllSpecialties = lazy(() => import("./pages/AllSpecialties"));
const CityTechnicians = lazy(() => import("./pages/CityTechnicians"));
import StatusTracking from "./pages/StatusTracking";
const NotFound = lazy(() => import("./pages/not-found"));
const ProLogin = lazy(() => import("./pages/ProLogin"));
const ProActivate = lazy(() => import("./pages/ProActivate"));
const ProDashboard = lazy(() => import("./pages/ProDashboard"));
const ProSoon = lazy(() => import("./pages/ProSoon"));
const ServiceConfirm = lazy(() => import("./pages/ServiceConfirm"));
const ProProfile = lazy(() => import("./pages/ProProfile"));
const ProEditProfile = lazy(() => import("./pages/ProEditProfile"));
const DealConfirm = lazy(() => import("./pages/DealConfirm"));
const RefLanding = lazy(() => import("./pages/RefLanding"));


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
  const [showModal, setShowModal] = useState(false);

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
  if (location === '/more' || location === '/pro-login' || location === '/pro-activate' || location === '/pro' || location === '/pro/soon' || location === '/pro/profile' || location === '/pro/edit-profile') return null;

  const handleFABClick = async () => {
    if (installPrompt) {
      // Android Chrome — trigger system prompt directly, no modal needed
      track('install_direct');
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') { setIsInstalled(true); setInstallPrompt(null); }
    } else {
      // iOS or Android without prompt — show guidance modal
      setShowModal(true);
    }
  };

  const hasDirectInstall = !!installPrompt;

  return (
    <>
      <button
        onClick={handleFABClick}
        className="fixed bottom-24 z-50 flex items-center gap-1.5 px-4 py-3.5 rounded-2xl shadow-xl active:scale-95 transition-transform font-black text-white whitespace-nowrap"
        style={{
          background: hasDirectInstall
            ? 'linear-gradient(135deg, #34A853 0%, #1a7a36 100%)'
            : 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: hasDirectInstall
            ? '0 6px 28px rgba(52,168,83,0.55)'
            : '0 6px 28px rgba(255,121,0,0.5)',
          fontSize: 'clamp(13px, 4vw, 17px)',
          maxWidth: '94vw',
          animation: 'installPulse 2s ease-in-out infinite',
        }}
      >
        <Download className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
        {hasDirectInstall
          ? (lang === 'ar' ? 'ثبّت الآن' : 'Install Now')
          : (lang === 'ar' ? 'ثبّت التطبيق' : 'Install App')}
      </button>
      <style>{`@keyframes installPulse { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.045)} }`}</style>

      {showModal && (
        <InstallGuideModal
          ar={lang === 'ar'}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function SearchFAB() {
  const [location] = useLocation();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  // Hide on home (already has search bar) and on join form pages
  const hidden = location === '/' || location === '/join' || location === '/join-company' || location === '/join-supplier' || location.startsWith('/admin') || location === '/pro-login' || location === '/pro-activate' || location === '/pro' || location === '/pro/soon' || location === '/pro/profile' || location === '/pro/edit-profile';
  if (hidden) return null;

  const ar = lang === 'ar';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 active:scale-90 transition-transform duration-150"
        style={{
          bottom: '160px',
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


function MyRequestsFAB() {
  const [location] = useLocation();
  const { lang } = useLang();
  const ar = lang === 'ar';

  const hidden = location === '/my-requests' || location.startsWith('/admin') || location === '/pro-login' || location === '/pro-activate' || location === '/pro' || location === '/pro/soon' || location === '/pro/profile' || location === '/pro/edit-profile' || location === '/join' || location === '/join-company' || location === '/join-supplier';
  if (hidden) return null;

  return (
    <Link
      href="/my-requests"
      className="fixed z-40 flex items-center gap-3 active:scale-[0.96] transition-transform duration-150"
      style={{
        bottom: '160px',
        [ar ? 'left' : 'right']: '16px',
        padding: '12px 20px 12px 12px',
        borderRadius: '20px',
        minWidth: '200px',
        background: 'linear-gradient(135deg, #071B33 0%, #0f2d52 100%)',
        border: '2.5px solid #FF7900',
        boxShadow: '0 10px 32px rgba(7,27,51,0.45), 0 2px 8px rgba(255,121,0,0.25)',
        textDecoration: 'none',
      }}
      aria-label={ar ? 'طلباتي' : 'My Requests'}
    >
      <span
        className="flex items-center justify-center flex-shrink-0 rounded-full"
        style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}
      >
        <ClipboardList className="w-[21px] h-[21px] text-white" />
      </span>
      <span className="flex flex-col" style={{ alignItems: ar ? 'flex-end' : 'flex-start' }}>
        <span className="text-[15px] font-black leading-tight whitespace-nowrap" style={{ color: '#ffffff' }}>
          {ar ? 'اطلب خدمة الآن' : 'Request a Service'}
        </span>
        <span className="text-[11px] font-bold leading-tight whitespace-nowrap" style={{ color: '#FF9A3C' }}>
          {ar ? 'تتبّع طلباتك • عروض الفنيين' : 'Track requests • Get offers'}
        </span>
      </span>
    </Link>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminPath = location.startsWith("/admin");

  if (isAdminPath) {
    return (
      <AdminProvider>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/:rest*" component={AdminLayout} />
            </Switch>
          </Suspense>
        </ErrorBoundary>
      </AdminProvider>
    );
  }

  const hasOwnHeader = location === '/join-us' || location === '/more' || location === '/pro-login' || location === '/pro-activate' || location === '/pro' || location === '/pro/soon' || location === '/pro/profile' || location === '/pro/edit-profile' || location.startsWith('/service-confirm');

  return (
    <LanguageProvider>
      <CustomerAccountProvider>
      <TooltipProvider>
        <ScrollToTop />
        <div className="min-h-[100dvh] max-w-[480px] mx-auto bg-background shadow-2xl relative shadow-black/10">
          {!hasOwnHeader && <Header woodTexture={location === '/'} />}
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/categories" component={Categories} />
              <Route path="/section/suppliers" component={SuppliersSection} />
              <Route path="/section/:id" component={Section} />
              <Route path="/category/:id" component={CategoryTechnicians} />
              <Route path="/technician/:id" component={TechnicianDetails} />
              <Route path="/companies" component={Companies} />
              <Route path="/company/:id" component={CompanyDetails} />
              <Route path="/ref/:code" component={RefLanding} />
              <Route path="/join" component={Join} />
              <Route path="/join-company" component={JoinCompany} />
              <Route path="/join-supplier" component={JoinSupplier} />
              <Route path="/suppliers" component={Suppliers} />
              <Route path="/supplier/:id" component={SupplierDetails} />
              <Route path="/contact" component={Contact} />
              <Route path="/orders" component={Orders} />
              <Route path="/favorites" component={Favorites} />
              <Route path="/messages" component={Messages} />
              <Route path="/support" component={Support} />
              <Route path="/more" component={More} />
              <Route path="/join-us" component={JoinUs} />
              <Route path="/advertise" component={AdvertiseWithUs} />
              <Route path="/my-requests" component={MyRequests} />
              <Route path="/all-specialties" component={AllSpecialties} />
              <Route path="/city/:id" component={CityTechnicians} />
              <Route path="/status/:id" component={StatusTracking} />
              <Route path="/status" component={StatusTracking} />
              <Route path="/pro-login" component={ProLogin} />
              <Route path="/pro-activate" component={ProActivate} />
              <Route path="/pro/soon" component={ProSoon} />
              <Route path="/pro/edit-profile" component={ProEditProfile} />
              <Route path="/pro/profile" component={ProProfile} />
              <Route path="/service-confirm/:token" component={ServiceConfirm} />
              <Route path="/deal-confirm/:token" component={DealConfirm} />
              <Route path="/pro" component={ProDashboard} />
              <Route path="/about" component={About} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          </ErrorBoundary>
          {location !== '/pro-login' && location !== '/pro-activate' && location !== '/pro' && location !== '/pro/soon' && location !== '/pro/profile' && location !== '/pro/edit-profile' && !location.startsWith('/service-confirm') && <BottomNav />}
          <SearchFAB />
          <InstallFAB />
          <NotificationPrompt />
          <LocationPrompt />
        </div>
        <Toaster />
      </TooltipProvider>
      </CustomerAccountProvider>
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
