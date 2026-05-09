import { useLang } from '../context/LanguageContext';
import { Link } from 'wouter';
import * as Icons from 'lucide-react';

export default function CategoryCard({ category }) {
  const { lang } = useLang();
  const Icon = Icons[category.icon] || Icons.HelpCircle;

  return (
    <Link href={`/category/${category.id}`} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm border hover-elevate transition-transform active:scale-95">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="text-xs font-medium text-center text-foreground break-words w-full">
        {lang === 'ar' ? category.nameAr : category.nameEn}
      </span>
    </Link>
  );
}
