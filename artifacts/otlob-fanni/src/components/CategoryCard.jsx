import { useLang } from '../context/LanguageContext'
import { Link } from 'wouter'
import { track } from '../lib/tracker'

export default function CategoryCard({ category, count = 0 }) {
  const { lang } = useLang()
  const name  = lang === 'ar' ? category.nameAr : category.nameEn
  const href  = category.id === 'more' ? '/category/more_services' : `/category/${category.id}`
  const iconSrc = `/icons/categories/${category.id}.png`

  return (
    <Link href={href} onClick={() => track('category_click', category.id)}>
      <div className="flex flex-col items-center gap-1.5 select-none cursor-pointer active:scale-90 transition-transform duration-150">
        <div className="relative">
          <img
            src={iconSrc}
            alt={name}
            className="w-[70px] h-[70px] rounded-[18px] object-cover"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)' }}
            loading="lazy"
            draggable="false"
            onError={(e) => { e.currentTarget.src = '/icons/categories/more.png' }}
          />
          {count > 0 && (
            <span className="absolute -top-1.5 -left-1.5 min-w-[20px] h-[20px] bg-white border-2 border-gray-100 text-[#071B33] text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
              {count}
            </span>
          )}
        </div>
        <span className="text-[12px] font-bold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5 max-w-[76px]">
          {name}
        </span>
      </div>
    </Link>
  )
}
