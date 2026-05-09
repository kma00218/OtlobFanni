import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import { UserPlus, Info, FileText, Shield, Mail, Globe } from 'lucide-react';
import { Link } from 'wouter';

export default function More() {
  const { t, lang, toggleLang, dir } = useLang();

  const menuItems = [
    { icon: UserPlus, label: t('joinUs'), path: '/join' },
    { icon: Mail, label: t('contactTitle'), path: '/contact' },
    { icon: Info, label: t('aboutUs'), path: '#' },
    { icon: FileText, label: t('termsOfService'), path: '#' },
    { icon: Shield, label: t('privacyPolicy'), path: '#' },
  ];

  return (
    <div className="bg-background min-h-screen pt-16 pb-20">
      <BackHeader title={t('moreTitle')} />
      
      <main className="px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <button 
            onClick={toggleLang}
            className="w-full flex items-center gap-4 p-4 border-b hover:bg-muted/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {lang === 'ar' ? 'EN' : 'AR'}
            </div>
            <div className="flex-1 text-start">
              <span className="font-bold text-foreground block">تغيير اللغة / Change Language</span>
              <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}</span>
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </button>

          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === menuItems.length - 1;
            
            return (
              <Link 
                key={idx} 
                href={item.path}
                className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${!isLast ? 'border-b' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">Otlob Fanni v1.0.0</p>
        </div>
      </main>
    </div>
  );
}
