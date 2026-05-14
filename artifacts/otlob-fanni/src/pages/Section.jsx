import { useParams, useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import { useEffect } from 'react'
import BackHeader from '../components/BackHeader'
import CategoryCard from '../components/CategoryCard'
import { sections, categories } from '../data/services'
import AdBanner from '../components/AdBanner'

export default function Section() {
  const { id } = useParams()
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()

  const section = sections.find(s => s.id === id)
  const sectionCats = categories.filter(c => c.sectionId === id)

  // If section not found, or only one category — redirect immediately
  const redirectTo = !section
    ? '/categories'
    : sectionCats.length === 1
      ? (sectionCats[0].id === 'more' ? '/category/more_services' : `/category/${sectionCats[0].id}`)
      : null

  useEffect(() => {
    if (redirectTo) navigate(redirectTo, { replace: true })
  }, [redirectTo])

  if (redirectTo) return null

  const title = ar ? section.nameAr : section.nameEn

  return (
    <div className="bg-background min-h-screen pt-20 pb-6">
      <BackHeader title={title} />

      <main className="px-4 py-6 space-y-4">
        <AdBanner placement="section_page" sectionId={id} dismissible />

        <h1 className="text-[#071B33] text-xl font-black" dir={ar ? 'rtl' : 'ltr'}>
          {title}
        </h1>

        {sectionCats.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              {ar ? 'لا توجد تخصصات في هذا القسم حاليًا' : 'No specialties in this section yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {sectionCats.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
