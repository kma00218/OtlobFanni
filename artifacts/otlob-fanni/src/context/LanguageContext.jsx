import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = (key) => translations[lang][key] || key;
  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  
  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLang }}>
      <div dir={dir} lang={lang} style={{ fontFamily: lang === 'ar' ? 'system-ui, -apple-system, sans-serif' : 'system-ui, sans-serif' }} className="min-h-[100dvh] pb-[80px]">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
