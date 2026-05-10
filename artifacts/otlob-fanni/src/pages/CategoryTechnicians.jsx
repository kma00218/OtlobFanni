import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import TechnicianCard from '../components/TechnicianCard'
import { categories, technicians, getAdminTechnicians, getApprovedTechnicians } from '../data/services'
import { useRoute } from 'wouter'
import { AlertCircle } from 'lucide-react'

export default function CategoryTechnicians() {
  const { t, lang } = useLang()
  const [, params] = useRoute('/category/:id')
  const categoryId = params?.id

  const [allTechs, setAllTechs] = useState(technicians)

  useEffect(() => {
    const approvedTechs = getApprovedTechnicians()
    const adminTechs    = getAdminTechnicians()
    const seenIds = new Set()
    const merged = []
    for (const t of [...approvedTechs, ...adminTechs, ...technicians]) {
      if (!seenIds.has(t.id)) { seenIds.add(t.id); merged.push(t) }
    }
    setAllTechs(merged)
  }, [])

  const category = categories.find(c => c.id === categoryId)
  const title = category ? (lang === 'ar' ? category.nameAr : category.nameEn) : t('technicians')

  const categoryTechs = categoryId === 'more'
    ? allTechs
    : allTechs.filter(tech => tech.categoryId === categoryId)

  return (
    <div className="bg-background min-h-screen pt-16 pb-6">
      <BackHeader title={title} />

      <main className="px-4 py-6">
        {categoryTechs.length > 0 ? (
          <div className="flex flex-col">
            {categoryTechs.map(tech => (
              <TechnicianCard key={tech.id} technician={tech} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <AlertCircle className="h-16 w-16 mb-4 text-muted" />
            <p className="text-lg font-medium">{t('noTechnicians')}</p>
          </div>
        )}
      </main>
    </div>
  )
}
