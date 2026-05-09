import { useLang } from '../context/LanguageContext';
import BackHeader from '../components/BackHeader';
import TechnicianCard from '../components/TechnicianCard';
import { categories, technicians } from '../data/services';
import { useRoute } from 'wouter';
import { AlertCircle } from 'lucide-react';

export default function CategoryTechnicians() {
  const { t, lang } = useLang();
  const [, params] = useRoute('/category/:id');
  const categoryId = params?.id;
  
  const category = categories.find(c => c.id === categoryId);
  const title = category ? (lang === 'ar' ? category.nameAr : category.nameEn) : t('technicians');
  
  // if "more", it might show all or we should handle it. For now, filter by exact ID unless "more"
  let categoryTechs = technicians.filter(t => t.categoryId === categoryId);
  if (categoryId === 'more') {
    categoryTechs = technicians;
  }

  return (
    <div className="bg-background min-h-screen pt-16 pb-6">
      <BackHeader title={title} />
      
      <main className="px-4 py-6">
        {categoryTechs.length > 0 ? (
          <div className="flex flex-col">
            {categoryTechs.map(tech => (
              <TechnicianCard key={tech.id} technician={tech} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <AlertCircle className="h-16 w-16 mb-4 text-muted" />
            <p className="text-lg font-medium">{t('noTechnicians')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
