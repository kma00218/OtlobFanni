import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import CategoryCard from '../components/CategoryCard'
import { sections, categories } from '../data/services'
import AdBanner from '../components/AdBanner'

export default function Categories() {
  const { lang } = useLang()
  const ar = lang === 'ar'

  return (
    <div className="bg-background min-h-screen pt-16 pb-6">
      <BackHeader title={ar ? 'كل التخصصات' : 'All Specialties'} />

      <main className="px-4 py-6 space-y-6">
        <AdBanner placement="all_specialties_page" dismissible />

        {sections.filter(s => s.isActive).map(section => {
          const sectionCats = categories.filter(c => c.sectionId === section.id && c.id !== 'more')
          if (sectionCats.length === 0) return null
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-5 bg-[#FF7900] rounded-full inline-block flex-shrink-0" />
                <h3 className="text-sm font-bold text-[#071B33]">
                  {ar ? section.nameAr : section.nameEn}
                </h3>
                <span className="text-gray-400 font-normal text-xs">({sectionCats.length})</span>
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
