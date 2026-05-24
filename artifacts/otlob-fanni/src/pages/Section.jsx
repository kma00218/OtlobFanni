import { useParams, useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import { useEffect, useState } from 'react'
import BackHeader from '../components/BackHeader'
import CategoryCard from '../components/CategoryCard'
import { sections } from '../data/services'
import AdBanner from '../components/AdBanner'
import api from '../lib/api'

export default function Section() {
  const { id } = useParams()
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const [counts, setCounts] = useState({})
  const [sectionCats, setSectionCats] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)

  useEffect(() => {
    api.categoryCounts().then(setCounts).catch(() => {})
  }, [])

  useEffect(() => {
    api.categories()
      .then(all => setSectionCats(all.filter(c => c.sectionId === id && c.isActive !== false)))
      .catch(() => setSectionCats([]))
      .finally(() => setLoadingCats(false))
  }, [id])

  const section = sections.find(s => s.id === id)

  useEffect(() => {
    if (loadingCats) return
    if (!section) { navigate('/categories', { replace: true }); return }
    if (sectionCats.length === 1 && id !== 'more_services') {
      navigate(`/category/${sectionCats[0].id}`, { replace: true })
    }
  }, [loadingCats, section, sectionCats])

  if (loadingCats || !section) return null

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
              <CategoryCard key={category.id} category={category} count={counts[category.id] || 0} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
