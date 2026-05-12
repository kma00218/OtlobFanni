import { useState, useRef, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import { Search, X } from 'lucide-react'
import { useLocation } from 'wouter'
import { categories } from '../data/services'

export default function SearchBar() {
  const { t, dir, lang } = useLang()
  const [, navigate] = useLocation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const ar = lang === 'ar'

  const results = query.trim().length === 0 ? [] : categories.filter(c => {
    const q = query.trim().toLowerCase()
    return (
      (c.nameAr || '').includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q)
    )
  }).slice(0, 8)

  const handleSelect = (category) => {
    setQuery('')
    setOpen(false)
    navigate(`/category/${category.id}`)
  }

  const handleClear = () => {
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full" dir={dir}>
      {/* Input */}
      <div className="relative">
        <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-3' : 'left-3'} flex items-center pointer-events-none`}>
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          className={`w-full bg-card border border-gray-200 focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 outline-none rounded-full h-12 text-base transition-all ${dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
        />
        {query.length > 0 && (
          <button
            onMouseDown={e => { e.preventDefault(); handleClear() }}
            className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-3' : 'right-3'} flex items-center text-gray-400 hover:text-gray-600`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.map((cat, i) => (
            <button
              key={cat.id}
              onMouseDown={e => { e.preventDefault(); handleSelect(cat) }}
              onTouchEnd={() => handleSelect(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FF7900]/5 active:bg-[#FF7900]/10 transition-colors text-start ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF7900]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={`/icons/services/${cat.iconName || cat.id}.svg`}
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <span className="text-[#071B33] font-bold text-sm">
                {ar ? cat.nameAr : cat.nameEn}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-5 z-50 text-center">
          <p className="text-gray-400 text-sm">
            {ar ? 'لا توجد نتائج لـ' : 'No results for'}{' '}
            <span className="text-[#071B33] font-bold">"{query}"</span>
          </p>
        </div>
      )}
    </div>
  )
}
