import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import CategoryCard from '../components/CategoryCard'
import { sections } from '../data/services'
import AdBanner from '../components/AdBanner'
import BackHeader from '../components/BackHeader'
import { useAllCategories } from '../hooks/useAllCategories'
import api from '../lib/api'
import { Link } from 'wouter'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AllSpecialties() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [counts, setCounts] = useState({})
  const allCats = useAllCategories()

  useEffect(() => {
    api.categoryCounts().then(setCounts).catch(() => {})
  }, [])

  return (
    <div className="bg-background min-h-screen pt-20 pb-28" dir={ar ? 'rtl' : 'ltr'}>

      <BackHeader />

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
          const sectionCats = allCats.filter(c => c.sectionId === section.id && c.isActive !== false)
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
                  <CategoryCard key={category.id} category={category} count={counts[category.id] || 0} />
                ))}
              </div>
            </div>
          )
        })}

        {/* ── كرت مستلزمات اطلب فني ── */}
        <Link href="/section/suppliers">
          <div
            className="relative overflow-hidden rounded-2xl shadow-xl active:scale-[0.98] transition-all duration-200 select-none cursor-pointer"
            style={{ background: 'linear-gradient(125deg, #0a4e60 0%, #0e7c8f 55%, #1a6b50 100%)' }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-[#FF7900]/10 pointer-events-none" />
            <div className="relative flex items-center gap-4 px-5 py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.2)' }}
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.8"/>
                  <path d="M3 8l9 5 9-5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
                  <line x1="12" y1="13" x2="12" y2="21" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-extrabold text-[17px] leading-tight tracking-tight">
                    {ar ? 'مستلزمات اطلب فني' : 'Otlob Fanni Supplies'}
                  </p>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 leading-none"
                    style={{ background: '#FF7900', color: 'white' }}>
                    {ar ? 'جديد' : 'NEW'}
                  </span>
                </div>
                <p className="text-white text-sm font-semibold leading-snug">
                  {ar ? 'معدات • أدوات • قطع غيار • مورّدون' : 'Equipment • Tools • Parts • Suppliers'}
                </p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.18)' }}>
                {ar
                  ? <ChevronLeft className="w-4 h-4 text-white" />
                  : <ChevronRight className="w-4 h-4 text-white" />}
              </div>
            </div>
          </div>
        </Link>
      </main>
    </div>
  )
}
