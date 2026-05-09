import { useLang } from '../context/LanguageContext';
import Header from '../components/Header';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import { categories } from '../data/services';
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { t, dir } = useLang();
  
  // Show first 11 + "more" at the end if we want, or just first 12 if "more" is included in first 12
  // the data file actually has "more" as the 20th item. We want 11 items + "more"
  const displayCategories = [...categories.slice(0, 11), categories.find(c => c.id === 'more')];

  return (
    <div className="bg-background min-h-screen pt-16">
      <Header />
      
      <main className="px-4 py-6 flex flex-col gap-6">
        <div className="text-center">
          <Logo />
          <p className="text-muted-foreground mt-1 font-medium">{t('slogan')}</p>
        </div>
        
        <SearchBar />
        
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-2">
            <MapPin className="h-4 w-4" />
            {t('myLocation')}
          </Button>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground">{t('categories')}</h2>
            <Link href="/categories" className="text-primary text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {displayCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
        
        <div className="mt-4 pb-4">
          <Link href="/categories">
            <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 gap-2">
              {t('requestNow')}
              {dir === 'rtl' ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
