import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import ServiceImageIcon from './ServiceImageIcon'

export default function CategoryCard({ category }) {
  const { lang } = useLang()
  const name = lang === 'ar' ? category.nameAr : category.nameEn

  return (
    <Link
      href={`/category/${category.id}`}
      className="group flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-[18px] shadow-sm border border-gray-100 transition-all duration-200 active:scale-95 hover:border-[#FF7900]/30 hover:shadow-md cursor-pointer select-none"
    >
      <ServiceImageIcon
        iconName={category.iconName || category.id}
        className="transition-all duration-200 group-hover:brightness-110"
      />
      <span className="text-[10px] font-medium text-center text-[#071B33] leading-tight line-clamp-2 w-full">
        {name}
      </span>
    </Link>
  )
}
