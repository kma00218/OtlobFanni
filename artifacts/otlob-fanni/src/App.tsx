import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "./context/LanguageContext";

// Pages
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryTechnicians from "./pages/CategoryTechnicians";
import TechnicianDetails from "./pages/TechnicianDetails";
import Join from "./pages/Join";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import More from "./pages/More";

// Components
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-[100dvh] max-w-[480px] mx-auto bg-background shadow-2xl relative shadow-black/10">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/categories" component={Categories} />
        <Route path="/category/:id" component={CategoryTechnicians} />
        <Route path="/technician/:id" component={TechnicianDetails} />
        <Route path="/join" component={Join} />
        <Route path="/contact" component={Contact} />
        <Route path="/orders" component={Orders} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/messages" component={Messages} />
        <Route path="/more" component={More} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
