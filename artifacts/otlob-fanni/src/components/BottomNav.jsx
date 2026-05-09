import { useLang } from '../context/LanguageContext';
import { Home, ClipboardList, Heart, MessageCircle, Menu } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function BottomNav() {
  const { t } = useLang();
  const [location] = useLocation();

  const tabs = [
    { id: 'home', path: '/', icon: Home, label: t('home') },
    { id: 'orders', path: '/orders', icon: ClipboardList, label: t('orders') },
    { id: 'favorites', path: '/favorites', icon: Heart, label: t('favorites') },
    { id: 'messages', path: '/messages', icon: MessageCircle, label: t('messages') },
    { id: 'more', path: '/more', icon: Menu, label: t('more') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t pb-safe z-50 max-w-[480px] mx-auto flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const active = location === tab.path || (tab.path !== '/' && location.startsWith(tab.path));
        const Icon = tab.icon;
        return (
          <Link key={tab.id} href={tab.path} className={`flex flex-col items-center justify-center w-16 gap-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
            <Icon className={`h-6 w-6 ${active ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
