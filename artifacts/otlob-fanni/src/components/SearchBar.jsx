import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../context/LanguageContext'
import { Search, X, ChevronLeft, User, Building2, MapPin, Globe, Clock, Trash2, Package } from 'lucide-react'
import { useLocation } from 'wouter'
import { searchIndex } from '../data/searchIndex'
import { sections } from '../data/services'
import { api, getFileUrl } from '../lib/api'
import { track } from '../lib/tracker'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const HISTORY_KEY = 'otlob_search_history'
const MAX_HISTORY = 5

function useSearchHistory() {
  const getHistory = () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
  }
  const [history, setHistory] = useState(getHistory)

  const addEntry = useCallback((q) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase())
      const next = [trimmed, ...filtered].slice(0, MAX_HISTORY)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    try { localStorage.removeItem(HISTORY_KEY) } catch {}
    setHistory([])
  }, [])

  return { history, addEntry, clearHistory }
}

export default function SearchBar({ onResultSelect } = {}) {
  const { t, dir, lang } = useLang()
  const [, navigate] = useLocation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [techResults, setTechResults] = useState([])
  const [companyResults, setCompanyResults] = useState([])
  const [cityResults, setCityResults] = useState([])
  const [supplierResults, setSupplierResults] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const { history, addEntry, clearHistory } = useSearchHistory()

  const ar = lang === 'ar'
  const debouncedQuery = useDebounce(query, 280)

  const specialtyResults = debouncedQuery.trim().length >= 1
    ? searchIndex(debouncedQuery, 5)
    : []

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setTechResults([]); setCompanyResults([]); setCityResults([]); setSupplierResults([])
      setActiveFilter('all')
      return
    }
    const q = debouncedQuery.trim()
    track('search', q)
    let cancelled = false
    api.search(q)
      .then(data => {
        if (!cancelled) {
          setTechResults(data?.technicians || [])
          setCompanyResults(data?.companies || [])
          setCityResults(data?.cities || [])
          setSupplierResults(data?.suppliers || [])
          setActiveFilter('all')
        }
      })
      .catch(() => {
        if (!cancelled) { setTechResults([]); setCompanyResults([]); setCityResults([]); setSupplierResults([]) }
      })
    return () => { cancelled = true }
  }, [debouncedQuery])

  const hasResults = specialtyResults.length > 0 || techResults.length > 0 || companyResults.length > 0 || cityResults.length > 0 || supplierResults.length > 0
  const showHistory = open && focused && query.trim() === '' && history.length > 0

  /* ── Contextual filter chips ── */
  const showFilters = (techResults.length > 0 || companyResults.length > 0) && debouncedQuery.trim().length >= 2

  const uniqueSpecialties = (() => {
    if (!showFilters) return []
    const seen = new Set()
    const list = []
    ;[...techResults, ...companyResults].forEach(item => {
      const name = ar
        ? (item.categoryAr || item.specialty || '')
        : (item.categoryEn || item.specialty || '')
      if (name && !seen.has(name)) { seen.add(name); list.push(name) }
    })
    return list
  })()

  const filterChips = showFilters
    ? [
        { id: 'all',      label: ar ? 'الكل' : 'All' },
        ...uniqueSpecialties.map(s => ({ id: s, label: s })),
        ...(companyResults.length > 0 ? [{ id: 'companies', label: ar ? 'شركات' : 'Companies' }] : []),
      ]
    : []

  const filteredTechs = activeFilter === 'all' || activeFilter === 'companies'
    ? (activeFilter === 'companies' ? [] : techResults)
    : techResults.filter(t => {
        const name = ar ? t.categoryAr : t.categoryEn
        return name === activeFilter
      })

  const filteredCompanies = activeFilter === 'all'
    ? companyResults
    : activeFilter === 'companies'
      ? companyResults
      : companyResults.filter(c => {
          const name = ar ? c.categoryAr : c.categoryEn
          return name === activeFilter
        })

  /* ── Handlers ── */
  const handleSelectSpecialty = (entry, fromHistory = false) => {
    if (!fromHistory) addEntry(ar ? entry.nameAr : entry.nameEn)
    setQuery(''); setOpen(false); onResultSelect?.()
    if (entry.type === 'section') navigate(`/section/${entry.id}`)
    else {
      const href = entry.id === 'more' ? '/category/more_services' : `/category/${entry.id}`
      navigate(href)
    }
  }

  const handleSelectTech = (tech) => {
    addEntry(ar ? tech.nameAr : (tech.nameEn || tech.nameAr))
    setQuery(''); setOpen(false); onResultSelect?.()
    navigate(`/technician/${tech.id}`)
  }

  const handleSelectCompany = (company) => {
    addEntry(company.companyName || company.company_name || '')
    setQuery(''); setOpen(false); onResultSelect?.()
    navigate(`/company/${company.id}`)
  }

  const handleSelectCity = (city) => {
    addEntry(ar ? city.nameAr : city.nameEn)
    setQuery(''); setOpen(false); onResultSelect?.()
    navigate(`/city/${city.id}`)
  }

  const handleSelectSupplier = (supplier) => {
    addEntry(supplier.businessName || '')
    setQuery(''); setOpen(false); onResultSelect?.()
    navigate('/suppliers')
  }

  const handleHistorySelect = (q) => {
    setQuery(q)
    setOpen(true)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setQuery(''); setOpen(false)
    setTechResults([]); setCompanyResults([]); setCityResults([])
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

  const SectionHeader = ({ label, hasBorder }) => (
    <div className={`px-4 pb-1 ${hasBorder ? 'pt-3 border-t border-gray-100 mt-1' : 'pt-3'}`}>
      <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{label}</span>
    </div>
  )

  return (
    <div ref={containerRef} className="relative w-full" dir={dir}>
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
          onFocus={() => { setFocused(true); setOpen(true) }}
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

      {/* ── Search History ── */}
      {showHistory && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          onTouchStart={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {ar ? 'عمليات بحث سابقة' : 'Recent Searches'}
            </span>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={clearHistory}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-400 transition-colors font-semibold"
            >
              <Trash2 className="w-3 h-3" />
              {ar ? 'مسح' : 'Clear'}
            </button>
          </div>
          {history.map((q, i) => (
            <button
              key={i}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleHistorySelect(q)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-start border-t border-gray-50"
            >
              <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="text-[#071B33] text-sm font-medium truncate">{q}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Search Results ── */}
      {open && hasResults && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-y-auto z-50"
          style={{ maxHeight: '65vh', overscrollBehavior: 'contain' }}
          onTouchStart={e => e.stopPropagation()}
        >
          {/* ── Filter chips ── */}
          {filterChips.length > 1 && (
            <div
              className="flex gap-2 px-3 pt-3 pb-2 overflow-x-auto border-b border-gray-100"
              style={{ scrollbarWidth: 'none' }}
            >
              {filterChips.map(chip => (
                <button
                  key={chip.id}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    activeFilter === chip.id
                      ? 'bg-[#FF7900] text-white shadow-sm shadow-[#FF7900]/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Specialties ── */}
          {specialtyResults.length > 0 && activeFilter === 'all' && (
            <>
              <SectionHeader label={ar ? 'التخصصات والأقسام' : 'Specialties & Departments'} hasBorder={false} />
              {specialtyResults.map((entry) => {
                const name = ar ? entry.nameAr : entry.nameEn
                const sectionName = getSectionName(entry)
                const isSection = entry.type === 'section'
                let touchStartY = 0
                return (
                  <button
                    key={`spec-${entry.type}-${entry.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectSpecialty(entry) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => { if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 10) handleSelectSpecialty(entry) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FF7900]/5 active:bg-[#FF7900]/10 transition-colors text-start border-t border-gray-50"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${isSection ? 'bg-[#071B33]/10' : 'bg-[#FF7900]/10'}`}>
                      <img
                        src={`/icons/services/${entry.iconName || entry.id}.svg`}
                        alt=""
                        className="w-6 h-6 object-contain"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#071B33] font-bold text-sm block leading-tight">{name}</span>
                      {sectionName && <span className="text-[#FF7900] text-xs font-semibold leading-tight">{sectionName}</span>}
                      {isSection && <span className="text-gray-400 text-xs leading-tight">{ar ? 'قسم' : 'Department'}</span>}
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}

          {/* ── Technicians ── */}
          {filteredTechs.length > 0 && (
            <>
              <SectionHeader label={ar ? 'الفنيون' : 'Technicians'} hasBorder={specialtyResults.length > 0 && activeFilter === 'all'} />
              {filteredTechs.map((tech) => {
                let touchStartY = 0
                return (
                  <button
                    key={`tech-${tech.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectTech(tech) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => { if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 10) handleSelectTech(tech) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#071B33]/5 active:bg-[#071B33]/10 transition-colors text-start border-t border-gray-50"
                  >
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-[#071B33]/10 flex items-center justify-center">
                      {tech.profilePhoto ? (
                        <img src={getFileUrl(tech.profilePhoto)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-[#071B33]/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#071B33] font-bold text-sm block leading-tight">
                        {ar ? tech.nameAr : (tech.nameEn || tech.nameAr)}
                      </span>
                      <span className="text-gray-400 text-xs leading-tight">
                        {[ar ? tech.categoryAr : tech.categoryEn, ar ? tech.cityNameAr : tech.cityNameEn].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}

          {/* ── Companies ── */}
          {filteredCompanies.length > 0 && (
            <>
              <SectionHeader label={ar ? 'الشركات' : 'Companies'} hasBorder={specialtyResults.length > 0 || filteredTechs.length > 0} />
              {filteredCompanies.map((company) => {
                let touchStartY = 0
                return (
                  <button
                    key={`company-${company.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectCompany(company) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => { if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 10) handleSelectCompany(company) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100 transition-colors text-start border-t border-gray-50"
                  >
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden bg-blue-100 flex items-center justify-center">
                      {company.companyLogo ? (
                        <img src={getFileUrl(company.companyLogo)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#071B33] font-bold text-sm leading-tight">{company.companyName}</span>
                        <span className="text-[9px] font-black bg-[#071B33] text-white px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">خدمية</span>
                      </div>
                      <span className="text-gray-400 text-xs leading-tight">
                        {[ar ? company.categoryAr : company.categoryEn, company.city].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}

          {/* ── Suppliers ── */}
          {supplierResults.length > 0 && activeFilter === 'all' && (
            <>
              <SectionHeader label={ar ? 'مزودو المستلزمات' : 'Suppliers'} hasBorder={specialtyResults.length > 0 || filteredTechs.length > 0 || filteredCompanies.length > 0} />
              {supplierResults.map((supplier) => {
                let touchStartY = 0
                return (
                  <button
                    key={`supplier-${supplier.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectSupplier(supplier) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => { if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 10) handleSelectSupplier(supplier) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 active:bg-teal-100 transition-colors text-start border-t border-gray-50"
                  >
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden bg-teal-100 flex items-center justify-center">
                      {supplier.logo ? (
                        <img src={getFileUrl(supplier.logo)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#071B33] font-bold text-sm block leading-tight">{supplier.businessName}</span>
                      <span className="text-gray-400 text-xs leading-tight">
                        {[supplier.city, supplier.customSupplyType || supplier.supplyType].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}

          {/* ── Cities ── */}
          {cityResults.length > 0 && activeFilter === 'all' && (
            <>
              <SectionHeader label={ar ? 'المدن' : 'Cities'} hasBorder={specialtyResults.length > 0 || filteredTechs.length > 0 || filteredCompanies.length > 0} />
              {cityResults.map((city) => {
                let touchStartY = 0
                return (
                  <button
                    key={`city-${city.id}`}
                    onMouseDown={e => { e.preventDefault(); handleSelectCity(city) }}
                    onTouchStart={e => { touchStartY = e.touches[0].clientY }}
                    onTouchEnd={e => { if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 10) handleSelectCity(city) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 active:bg-green-100 transition-colors text-start border-t border-gray-50"
                  >
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-green-100">
                      {city.id === 'libya'
                        ? <Globe className="w-5 h-5 text-green-600" />
                        : <MapPin className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#071B33] font-bold text-sm block leading-tight">
                        {ar ? city.nameAr : city.nameEn}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {city.id === 'libya'
                          ? (ar ? 'عرض جميع مقدمي الخدمة في ليبيا' : 'Show all providers in Libya')
                          : (ar ? 'عرض فنيي المدينة' : 'Show city technicians')}
                      </span>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 flex-shrink-0 ${ar ? '' : 'rotate-180'}`} />
                  </button>
                )
              })}
            </>
          )}

          {/* empty filtered state */}
          {activeFilter !== 'all' && filteredTechs.length === 0 && filteredCompanies.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              {ar ? 'لا توجد نتائج لهذا الفلتر' : 'No results for this filter'}
            </div>
          )}
        </div>
      )}

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
