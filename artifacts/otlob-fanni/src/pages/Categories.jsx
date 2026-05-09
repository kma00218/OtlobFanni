import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import CategoryCard from '../components/CategoryCard';
import { categories } from '../data/services';

export default function Categories() {
  const { t } = useLang();

  return (
    <div className="bg-background min-h-screen pt-16 pb-6">
      <BackHeader title={t('categories')} />
      
      <main className="px-4 py-6">
        <div className="grid grid-cols-4 gap-3">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </main>
    </div>
  );
}
