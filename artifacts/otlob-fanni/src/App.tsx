import { Switch, Route, Router as WouterRouter, useLocation, useRouter } from "wouter";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LanguageProvider, useLang } from "./context/LanguageContext";
import { AdminProvider } from "./context/AdminContext";
import { Download } from "lucide-react";
import NotificationPrompt from "./components/NotificationPrompt";
import LocationPrompt from "./components/LocationPrompt";

// Public Pages
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Section from "./pages/Section";
import CategoryTechnicians from "./pages/CategoryTechnicians";
import TechnicianDetails from "./pages/TechnicianDetails";
import Companies from "./pages/Companies";
import CompanyDetails from "./pages/CompanyDetails";
import Join from "./pages/Join";
import JoinCompany from "./pages/JoinCompany";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import More from "./pages/More";
import Support from "./pages/Support";
import JoinUs from "./pages/JoinUs";
import AdvertiseWithUs from "./pages/AdvertiseWithUs";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AllSpecialties from "./pages/AllSpecialties";

// Admin
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";

// Components
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function InstallFAB() {
  const [location, navigate] = useLocation();
  const { lang } = useLang();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('install-dismissed') === '1');
  const ar = lang === 'ar';

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    const mq = window.matchMedia('(display-mode: standalone)');
    const mqHandler = (e: MediaQueryListEvent) => { if (e.matches) setIsInstalled(true); };
    mq.addEventListener('change', mqHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  if (isInstalled || dismissed) return null;
  if (location === '/more') return null;

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
    } else {
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('install-dismissed', '1');
    setDismissed(true);
  };

  return (
    <>
      {/* Install Banner */}
      <div
        className="fixed bottom-20 z-50 mx-3"
        style={{ left: 0, right: 0 }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)',
            boxShadow: '0 6px 24px rgba(255,121,0,0.45)',
          }}
        >
          <div className="text-2xl flex-shrink-0">📲</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight">
              {ar ? 'ثبّت التطبيق مجاناً' : 'Install App for Free'}
            </p>
            <p className="text-white/75 text-[11px] font-medium mt-0.5">
              {ar ? 'أسرع وأسهل بدون متجر' : 'Faster & easier, no store needed'}
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="flex-shrink-0 bg-white font-black text-[#FF7900] text-xs px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            {ar ? 'ثبّت' : 'Install'}
          </button>
          <button onClick={handleDismiss} className="text-white/60 hover:text-white text-lg leading-none flex-shrink-0">×</button>
        </div>
      </div>

      {/* Step-by-step guide modal for when native prompt unavailable */}
      {showGuide && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10" dir={ar ? 'rtl' : 'ltr'}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-[#071B33] font-black text-lg mb-4 text-center">
              {ar ? '📲 كيف تثبّت التطبيق؟' : '📲 How to Install?'}
            </p>
            <div className="space-y-3">
              {(ar ? [
                { n: '1', text: 'افتح قائمة المتصفح (النقاط الثلاث ⋮ في الأعلى)' },
                { n: '2', text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
                { n: '3', text: 'اضغط "إضافة" وسيظهر التطبيق على شاشتك' },
              ] : [
                { n: '1', text: 'Tap the browser menu (⋮ three dots at top)' },
                { n: '2', text: 'Select "Add to Home Screen"' },
                { n: '3', text: 'Tap "Add" — the app icon will appear on your screen' },
              ]).map(s => (
                <div key={s.n} className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3">
                  <span className="w-7 h-7 rounded-full bg-[#FF7900] text-white font-black text-sm flex items-center justify-center flex-shrink-0">{s.n}</span>
                  <p className="text-[#071B33] text-sm font-semibold">{s.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full mt-5 py-3 rounded-2xl font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}
            >
              {ar ? 'فهمت ✓' : 'Got it ✓'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminPath = location.startsWith("/admin");

  if (isAdminPath) {
    return (
      <AdminProvider>
        <ScrollToTop />
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/:rest*" component={AdminLayout} />
        </Switch>
      </AdminProvider>
    );
  }

  return (
    <LanguageProvider>
      <TooltipProvider>
        <ScrollToTop />
        <div className="min-h-[100dvh] max-w-[480px] mx-auto bg-background shadow-2xl relative shadow-black/10">
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
            <Route path="/about" component={About} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route component={NotFound} />
          </Switch>
          <BottomNav />
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
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppContent />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
