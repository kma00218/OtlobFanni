import { useRef } from 'react'
import { useLang } from '../context/LanguageContext'
import Header from '../components/Header'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import SectionCard from '../components/SectionCard'
import { sections, categories } from '../data/services'
import { ArrowLeft, ArrowRight, Building2, LayoutGrid } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import AdBanner from '../components/AdBanner'

export default function Home() {
  const { dir, lang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef(null)

  const handleLogoClick = () => {
    logoClickCount.current += 1
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0
      navigate('/admin/login')
      return
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0
    }, 5000)
  }

  const activeSections = sections.filter(s => s.isActive)

  return (
    <div className="bg-background min-h-screen pt-16 pb-36">
      <Header />

      <main className="px-4 pt-2 pb-4 flex flex-col gap-4">
        <div className="text-center" onClick={handleLogoClick} style={{ cursor: 'default' }}>
          <Logo />
        </div>

        <SearchBar />

        <AdBanner placement="home" dismissible />

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-foreground">
              {ar ? 'الأقسام الرئيسية' : 'Main Sections'}
            </h2>
            <Link href="/categories" className="text-primary text-sm font-medium flex items-center gap-1">
              {ar ? 'كل التخصصات' : 'All Specialties'}
              {dir === 'rtl' ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeSections.map(section => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>

          {/* كل التخصصات — زر بارز */}
          <Link href="/categories">
            <div className="mt-4 flex items-center justify-center gap-2 border border-[#FF7900]/30 rounded-2xl py-3.5 bg-[#FFF3E8] active:bg-[#ffe0c0] transition-colors cursor-pointer select-none">
              <LayoutGrid className="w-4 h-4 text-[#FF7900]" />
              <span className="text-sm font-bold text-[#FF7900]">
                {ar ? 'كل التخصصات' : 'All Specialties'}
              </span>
              {dir === 'rtl'
                ? <ArrowLeft className="w-3.5 h-3.5 text-[#FF7900]" />
                : <ArrowRight className="w-3.5 h-3.5 text-[#FF7900]" />}
            </div>
          </Link>
        </div>

        <Link href="/companies">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#071B33] to-[#1a3a5c] px-4 py-4 flex items-center gap-3 shadow-md active:scale-[0.98] transition-transform cursor-pointer">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                {ar ? 'الشركات المعتمدة' : 'Verified Companies'}
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                {ar ? 'تعاقد مع شركات موثوقة في مجالك' : 'Partner with trusted companies in your area'}
              </p>
            </div>
            {dir === 'rtl'
              ? <ArrowLeft className="w-4 h-4 text-[#FF7900] flex-shrink-0" />
              : <ArrowRight className="w-4 h-4 text-[#FF7900] flex-shrink-0" />}
          </div>
        </Link>

        <AdBanner placement="banner" compact />
      </main>
    </div>
  )
}
