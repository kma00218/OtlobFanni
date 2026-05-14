import { useLang } from '../context/LanguageContext'
import CategoryCard from '../components/CategoryCard'
import { sections, categories } from '../data/services'
import AdBanner from '../components/AdBanner'
import { Share2 } from 'lucide-react'

export default function AllSpecialties() {
  const { lang, toggleLang } = useLang()
  const ar = lang === 'ar'

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'اطلب فني – Otlob Fanni',
        text: lang === 'ar'
          ? 'دليل الفنيين والحرفيين في ليبيا – اطلب فني'
          : "Libya's technician & craftsman directory – Otlob Fanni",
        url: 'https://otlobfanni.ly',
      })
    } else {
      navigator.clipboard?.writeText('https://otlobfanni.ly')
    }
  }

  return (
    <div className="bg-background min-h-screen pt-20 pb-28" dir={ar ? 'rtl' : 'ltr'}>

      {/* Fixed header — Share | Icon | Lang */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center px-3 max-w-[480px] mx-auto">
        <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#7B2FBE' }}>
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{ar ? 'مشاركة' : 'share'}</span>
        </button>
        <div className="flex-1 flex justify-center items-center">
          <img src="/icon-192.png" alt="اطلب فني" className="w-14 h-14" />
        </div>
        <button onClick={toggleLang} className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150 flex-shrink-0">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-base text-white" style={{ background: '#FF7900' }}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </div>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </header>

      <div className="px-5 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-[#071B33]">
          {ar ? 'كل التخصصات' : 'All Specialties'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {ar ? 'تصفح جميع التخصصات والخدمات' : 'Browse all specialties and services'}
        </p>
      </div>

      <main className="px-4 pb-4 space-y-6">
        <AdBanner placement="all_specialties_page" dismissible />

        {sections.filter(s => s.isActive).map(section => {
          const sectionCats = categories.filter(c => c.sectionId === section.id && c.id !== 'more')
          if (sectionCats.length === 0) return null
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-6 bg-[#FF7900] rounded-full inline-block flex-shrink-0" />
                <h3 className="text-lg font-extrabold text-[#071B33]">
                  {ar ? section.nameAr : section.nameEn}
                </h3>
                <span className="text-gray-400 font-semibold text-sm">({sectionCats.length})</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {sectionCats.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
