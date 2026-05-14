import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../context/LanguageContext'
import { Search, X, ChevronLeft, User } from 'lucide-react'
import { useLocation } from 'wouter'
import { searchIndex } from '../data/searchIndex'
import { sections } from '../data/services'
import { api, getFileUrl } from '../lib/api'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchBar({ onResultSelect } = {}) {
  const { t, dir, lang } = useLang()
  const [, navigate] = useLocation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [techResults, setTechResults] = useState([])
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const ar = lang === 'ar'
  const debouncedQuery = useDebounce(query, 280)

  // Local keyword results (specialties / sections)
  const specialtyResults = debouncedQuery.trim().length >= 1
    ? searchIndex(debouncedQuery, 5)
    : []

  // Fetch technician name results from API
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { setTechResults([]); return }
    let cancelled = false
    api.searchTechnicians(debouncedQuery.trim())
      .then(data => { if (!cancelled) setTechResults(data || []) })
      .catch(() => { if (!cancelled) setTechResults([]) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  const hasResults = specialtyResults.length > 0 || techResults.length > 0

  const handleSelectSpecialty = (entry) => {
    setQuery(''); setOpen(false); onResultSelect?.()
    if (entry.type === 'section') navigate(`/section/${entry.id}`)
    else {
      const href = entry.id === 'more' ? '/category/more_services' : `/category/${entry.id}`
      navigate(href)
    }
  }

  const handleSelectTech = (tech) => {
    setQuery(''); setOpen(false); onResultSelect?.()
    navigate(`/technician/${tech.id}`)
  }

  const handleClear = () => {
    setQuery(''); setOpen(false); setTechResults([])
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const getSectionName = (entry) => {
    if (entry.type === 'section' || !entry.sectionId) return null
    const sec = sections.find(s => s.id === entry.sectionId)
    return sec ? (ar ? sec.nameAr : sec.nameEn) : null
  }

  return (
    <div ref={containerRef} className="relative w-full" dir={dir}>
      {/* Search input row */}
      <div className={`flex items-center gap-2 rounded-2xl transition-all duration-200 bg-white ${
        focused
          ? 'border-2 border-[#FF7900] shadow-[0_0_0_4px_rgba(255,121,0,0.15)]'
          : 'border-2 border-[#FF7900]/60 shadow-[0_4px_16px_rgba(255,121,0,0.12)]'
      }`}>
        <button
          onClick={() => inputRef.current?.focus()}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#FF7900] rounded-xl m-1 transition-transform active:scale-95"
          style={{ borderRadius: '14px' }}
        >
          <Search className="w-5 h-5 text-white" />
        </button>
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
        {query.length > 0 && (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={handleClear}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors me-2"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && hasResults && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-y-auto z-50"
          style={{ maxHeight: '65vh', overscrollBehavior: 'contain' }}
          onTouchStart={e => e.stopPropagation()}
        >
          {/* ── Section 1: Specialties ── */}
          {specialtyResults.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  {ar ? 'التخصصات والأقسام' : 'Specialties & Departments'}
                </span>
              </div>
              {specialtyResults.map((entry, i) => {
                const name = ar ? entry.nameAr : entry.nameEn
                const sectionName = getSectionName(entry)
                const isSection = entry.type === 'section'
                let touchStartY = 0
                return (
                  <button
                    key={`spec-${entry.type}-${entry.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectSpecialty(entry) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => {
                      const delta = Math.abs(e.changedTouches[0].clientY - touchStartY)
                      if (delta < 10) handleSelectSpecialty(entry)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FF7900]/5 active:bg-[#FF7900]/10 transition-colors text-start border-t border-gray-50"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      isSection ? 'bg-[#071B33]/10' : 'bg-[#FF7900]/10'
                    }`}>
                      <img
                        src={`/icons/services/${entry.iconName || entry.id}.svg`}
                        alt=""
                        className="w-6 h-6 object-contain"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#071B33] font-bold text-sm block leading-tight">{name}</span>
                      {sectionName && (
                        <span className="text-[#FF7900] text-xs font-semibold leading-tight">{sectionName}</span>
                      )}
                      {isSection && (
                        <span className="text-gray-400 text-xs leading-tight">{ar ? 'قسم' : 'Department'}</span>
                      )}
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}

          {/* ── Section 2: Technicians ── */}
          {techResults.length > 0 && (
            <>
              <div className={`px-4 pb-1 ${specialtyResults.length > 0 ? 'pt-3 border-t border-gray-100 mt-1' : 'pt-3'}`}>
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  {ar ? 'الفنيون' : 'Technicians'}
                </span>
              </div>
              {techResults.map((tech) => {
                let touchStartY = 0
                const photoUrl = getFileUrl(tech.photoUrl)
                const categoryName = ar ? tech.categoryAr : tech.categoryEn
                const cityName = ar ? tech.cityNameAr : tech.cityNameEn
                return (
                  <button
                    key={`tech-${tech.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectTech(tech) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => {
                      const delta = Math.abs(e.changedTouches[0].clientY - touchStartY)
                      if (delta < 10) handleSelectTech(tech)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#071B33]/5 active:bg-[#071B33]/10 transition-colors text-start border-t border-gray-50"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-[#071B33]/10 flex items-center justify-center">
                      {tech.profilePhoto ? (
                        <img src={getFileUrl(tech.profilePhoto)} alt={ar ? tech.nameAr : tech.nameEn} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-[#071B33]/40" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[#071B33] font-bold text-sm block leading-tight">
                        {ar ? tech.nameAr : (tech.nameEn || tech.nameAr)}
                      </span>
                      <span className="text-gray-400 text-xs leading-tight">
                        {[categoryName, cityName].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* No results */}
      {open && debouncedQuery.trim().length >= 2 && !hasResults && (
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
