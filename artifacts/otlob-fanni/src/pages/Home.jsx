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

        {/* إعلان أعلى الصفحة — تحت شريط البحث مباشرة */}
        <AdBanner placement="home_top" dismissible />

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

          <div className="grid grid-cols-3 gap-x-2 gap-y-5 px-1">
            {activeSections.map(section => (
              <div key={section.id} className="flex justify-center">
                <SectionCard section={section} />
              </div>
            ))}
          </div>

          {/* بطاقة الانطلاق — دعوة للفنيين والشركات */}
          <div
            className="mt-4 rounded-2xl p-6 flex flex-col items-center gap-4 text-center select-none"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #071B33 100%)' }}
          >
            <span className="text-5xl">🚀</span>
            <div className="flex flex-col gap-2">
              <p className="text-white font-extrabold text-xl leading-tight">
                اطلب فني ينطلق!
              </p>
              <p className="text-white font-medium text-sm leading-relaxed" dir="rtl">
                التطبيق جديد وقاعدة الفنيين والشركات تنمو كل يوم.
              </p>
              <p className="text-white/80 text-sm leading-relaxed" dir="ltr">
                Otlob Fanni is just getting started —<br />our network grows every day.
              </p>
            </div>
            <Link href="/join-us">
              <div className="bg-white rounded-xl px-6 py-3 active:scale-95 transition-transform duration-150 shadow-lg">
                <p className="text-[#FF7900] font-extrabold text-base leading-tight">
                  انضم إلينا كفني أو كشركة
                </p>
                <p className="text-[#071B33]/60 text-xs mt-1 font-medium">
                  Join as a Technician or Company
                </p>
              </div>
            </Link>
          </div>

          {/* كل التخصصات — زر بارز */}
          <Link href="/categories">
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 bg-[#FF7900] active:bg-[#e06a00] transition-colors cursor-pointer select-none shadow-md shadow-[#FF7900]/30">
              <LayoutGrid className="w-5 h-5 text-white" />
              <span className="text-base font-extrabold text-white tracking-wide">
                {ar ? 'كل التخصصات' : 'All Specialties'}
              </span>
              {dir === 'rtl'
                ? <ArrowLeft className="w-4 h-4 text-white" />
                : <ArrowRight className="w-4 h-4 text-white" />}
            </div>
          </Link>

          {/* إعلان أسفل الصفحة — بعد زر كل التخصصات */}
          <div className="mt-4">
            <AdBanner placement="home_bottom" compact />
          </div>
        </div>
      </main>
    </div>
  )
}
