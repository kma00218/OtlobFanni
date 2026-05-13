import { useLang } from '../context/LanguageContext'
import CategoryCard from '../components/CategoryCard'
import { sections, categories } from '../data/services'
import AdBanner from '../components/AdBanner'

export default function AllSpecialties() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  return (
    <div className="bg-background min-h-screen pt-16 pb-28" dir={ar ? 'rtl' : 'ltr'}>
      <div className="px-5 pt-5 pb-3">
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
