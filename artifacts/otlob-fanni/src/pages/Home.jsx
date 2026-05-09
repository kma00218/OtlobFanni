import { useRef } from 'react'
import { useLang } from '../context/LanguageContext'
import Header from '../components/Header'
import Logo from '../components/Logo'
import SearchBar from '../components/SearchBar'
import CategoryCard from '../components/CategoryCard'
import { categories } from '../data/services'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { t, dir } = useLang()
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

  return (
    <div className="bg-background min-h-screen pt-16">
      <Header />

      <main className="px-4 py-4 flex flex-col gap-5">
        <div className="text-center" onClick={handleLogoClick} style={{ cursor: 'default' }}>
          <Logo />
        </div>

        <SearchBar />

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-foreground">{t('categories')}</h2>
            <Link href="/categories" className="text-primary text-sm font-medium flex items-center gap-1">
              {t('viewAll')}
              {dir === 'rtl' ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        <div className="pb-4">
          <Link href="/categories">
            <Button className="w-full h-13 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 gap-2">
              {t('requestNow')}
              {dir === 'rtl' ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
