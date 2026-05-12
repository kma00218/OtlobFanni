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
  const [focused, setFocused] = useState(false)
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

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setFocused(false)
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
      {/* Search input row */}
      <div className={`flex items-center gap-2 rounded-2xl transition-all duration-200 bg-white ${
        focused
          ? 'border-2 border-[#FF7900] shadow-[0_0_0_4px_rgba(255,121,0,0.15)]'
          : 'border-2 border-[#FF7900]/60 shadow-[0_4px_16px_rgba(255,121,0,0.12)]'
      }`}>
        {/* Search icon button */}
        <button
          onClick={() => inputRef.current?.focus()}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#FF7900] rounded-xl m-1 transition-transform active:scale-95"
          style={{ borderRadius: '14px' }}
        >
          <Search className="w-5 h-5 text-white" />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); query.trim() && setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-[#071B33] placeholder-gray-400 text-base font-medium h-14 min-w-0"
          style={{ direction: dir }}
        />

        {/* Clear button */}
        {query.length > 0 && (
          <button
            onMouseDown={e => { e.preventDefault(); handleClear() }}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors me-2"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 px-4 py-5 z-50 text-center">
          <p className="text-gray-400 text-sm">
            {ar ? 'لا توجد نتائج لـ' : 'No results for'}{' '}
            <span className="text-[#071B33] font-bold">"{query}"</span>
          </p>
        </div>
      )}
    </div>
  )
}
