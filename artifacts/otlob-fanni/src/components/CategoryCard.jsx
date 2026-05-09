import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import ServiceIcon from './ServiceIcon'

export default function CategoryCard({ category }) {
  const { lang } = useLang()
  const name = lang === 'ar' ? category.nameAr : category.nameEn

  return (
    <Link
      href={`/category/${category.id}`}
      className="group flex flex-col items-center gap-2 p-3 bg-white rounded-[18px] shadow-sm border border-gray-100 transition-all duration-200 active:scale-95 hover:border-[#FF7900]/30 hover:shadow-md cursor-pointer select-none"
    >
      <div className="h-14 w-14 rounded-2xl bg-[#071B33]/8 flex items-center justify-center transition-colors duration-200 group-hover:bg-[#FF7900]/10 group-active:bg-[#FF7900]/15" style={{ backgroundColor: 'rgba(7,27,51,0.07)' }}>
        <ServiceIcon
          iconName={category.id}
          size={34}
          strokeWidth={1.8}
          className="text-[#071B33] transition-colors duration-200 group-hover:text-[#FF7900]"
        />
      </div>
      <span className="text-[11px] font-medium text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5">
        {name}
      </span>
    </Link>
  )
}
