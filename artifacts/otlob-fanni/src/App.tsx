import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "./context/LanguageContext";
import { AdminProvider } from "./context/AdminContext";

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
            <Route path="/support" component={Messages} />
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
