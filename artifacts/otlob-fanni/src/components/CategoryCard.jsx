import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import ServiceImageIcon from './ServiceImageIcon'

export default function CategoryCard({ category }) {
  const { lang } = useLang()
  const name = lang === 'ar' ? category.nameAr : category.nameEn
  const href = category.id === 'more' ? '/categories' : `/category/${category.id}`

  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[104px] transition-all duration-200 active:scale-95 hover:shadow-md hover:border-[#FF7900]/25 cursor-pointer select-none"
    >
      <ServiceImageIcon iconName={category.iconName || category.id} />
      <span className="text-[11px] font-semibold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5">
        {name}
      </span>
    </Link>
  )
}
