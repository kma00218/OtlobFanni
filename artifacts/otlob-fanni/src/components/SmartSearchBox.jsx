import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Sparkles, Search, X } from 'lucide-react'
import { api, getFileUrl } from '../lib/api'
import { useLang } from '../context/LanguageContext'

const T = {
  ar: {
    triggerBtn:  'بحث ذكي بالذكاء الاصطناعي 🤖',
    title:       'البحث الذكي بالذكاء الاصطناعي',
    desc:        'اكتب مشكلتك بلغتك الطبيعية وسنعرض أنسب النتائج',
    placeholder: 'مثال: المكيف لا يبرد، أريد تركيب كاميرات، تسريب ماء في الحمام...',
    btn:         'اعرض الأنسب',
    searching:   'جارٍ البحث…',
    noDesc:      'اكتب وصف المشكلة أولاً',
    noResults:   'لا توجد نتائج مطابقة في هذه المدينة',
    clarify:     'هل تبحث عن:',
    techBtn:     '👷 فني',
    compBtn:     '🏢 شركة خدمية',
    suppBtn:     '📦 مورد مستلزمات',
    techSection: 'فنيون مقترحون',
    compSection: 'شركات مقترحة',
    suppSection: 'موردون مقترحون',
    viewProfile: 'عرض الملف',
  },
  en: {
    triggerBtn:  'AI Smart Search 🤖',
    title:       'AI Smart Search',
    desc:        'Describe your problem naturally and we\'ll find the best match',
    placeholder: 'E.g. AC not cooling, install cameras, water leak in bathroom...',
    btn:         'Show Best Match',
    searching:   'Searching…',
    noDesc:      'Describe your problem first',
    noResults:   'No matching results in this city',
    clarify:     'Are you looking for:',
    techBtn:     '👷 Technician',
    compBtn:     '🏢 Service Company',
    suppBtn:     '📦 Supplier',
    techSection: 'Suggested Technicians',
    compSection: 'Suggested Companies',
    suppSection: 'Suggested Suppliers',
    viewProfile: 'View Profile',
  },
}

function StarRating({ value }) {
  const full = Math.round(value || 0)
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= full ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function TechCard({ item, ar, t, navigate, onClose }) {
  const name = ar ? item.nameAr : (item.nameEn || item.nameAr)
  const category = ar ? item.categoryAr : (item.categoryEn || item.categoryAr)
  const photo = getFileUrl(item.profilePhoto)
  const isExact = item.matchLevel === 'exact'
  return (
    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
      style={{ border: `1.5px solid ${isExact ? '#FFD4A3' : '#E8ECF0'}` }}>
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
        {photo
          ? <img src={photo} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">👷</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-bold text-[#071B33] text-sm truncate">{name}</p>
          {isExact && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
              style={{ background: '#FF7900' }}>الأنسب</span>
          )}
        </div>
        {item.matchReason
          ? <p className="text-xs font-semibold truncate" style={{ color: '#FF7900' }}>{item.matchReason}</p>
          : category
            ? <p className="text-xs font-semibold truncate" style={{ color: '#FF7900' }}>{category}</p>
            : null}
        {item.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating value={item.rating} />
            <span className="text-[11px] text-gray-400">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <button onClick={() => { navigate(`/technician/${item.id}`); onClose() }}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
        style={{ background: '#FF7900' }}>
        {t.viewProfile}
      </button>
    </div>
  )
}

function CompCard({ item, ar, t, navigate, onClose }) {
  const category = ar ? item.categoryAr : (item.categoryEn || item.categoryAr)
  const logo = getFileUrl(item.companyLogo)
  const name = ar ? (item.company?.nameAr || item.nameAr) : (item.company?.nameEn || item.nameEn || item.nameAr)
  return (
    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
      style={{ border: '1.5px solid #E8ECF0' }}>
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {logo
          ? <img src={logo} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">🏢</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#071B33] text-sm truncate">{name || item.tradeName}</p>
        {category && <p className="text-xs font-semibold truncate" style={{ color: '#071B33' }}>{category}</p>}
        {item.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating value={item.rating} />
            <span className="text-[11px] text-gray-400">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <button onClick={() => { navigate(`/company/${item.id}`); onClose() }}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
        style={{ background: '#071B33' }}>
        {t.viewProfile}
      </button>
    </div>
  )
}

function SuppCard({ item, ar, t, navigate, onClose }) {
  const logo = getFileUrl(item.logo)
  return (
    <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
      style={{ border: '1.5px solid #E8ECF0' }}>
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {logo
          ? <img src={logo} alt={item.businessName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#071B33] text-sm truncate">{item.businessName}</p>
        {item.supplyType && <p className="text-xs text-gray-500 truncate">{item.supplyType}</p>}
        {item.customSupplyType && (
          <p className="text-xs font-semibold truncate" style={{ color: '#FF7900' }}>{item.customSupplyType}</p>
        )}
      </div>
      <button onClick={() => { navigate(`/supplier/${item.id}`); onClose() }}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
        style={{ background: '#1a5c3a' }}>
        {t.viewProfile}
      </button>
    </div>
  )
}

/**
 * SmartSearchBox — compact trigger button + bottom sheet modal.
 * Accepts `cityId` directly (city page already knows the city).
 */
export default function SmartSearchBox({ cityId }) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const t = T[lang]
  const [, navigate] = useLocation()

  const [open, setOpen]           = useState(false)
  const [description, setDescription] = useState('')
  const [loading, setLoading]     = useState(false)
  const [results, setResults]     = useState(null)
  const [ambiguous, setAmbiguous] = useState(false)
  const [error, setError]         = useState('')
  const [showAllTechs, setShowAllTechs] = useState(false)

  const INITIAL_TECH_LIMIT = 6

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const doSearch = async (overrideType) => {
    if (!description.trim()) { setError(t.noDesc); return }
    setError('')
    setLoading(true)
    setResults(null)
    setAmbiguous(false)
    setShowAllTechs(false)
    try {
      const data = await api.smartSearch({ cityId, description: description.trim(), forceType: overrideType })
      if (data.ambiguous && !overrideType) {
        setAmbiguous(true)
      } else {
        setResults(data)
      }
    } catch {
      setError(t.noResults)
    } finally {
      setLoading(false)
    }
  }

  const hasResults = results && (
    results.technicians?.length > 0 ||
    results.companies?.length > 0 ||
    results.suppliers?.length > 0
  )

  const closeSheet = () => {
    setOpen(false)
  }

  const resetAll = () => {
    setDescription('')
    setResults(null)
    setAmbiguous(false)
    setError('')
  }

  return (
    <>
      {/* ── Compact trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl font-extrabold text-white text-sm active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.25)' }}
        dir={ar ? 'rtl' : 'ltr'}
      >
        <Sparkles className="w-5 h-5 flex-shrink-0" />
        <span>{t.triggerBtn}</span>
      </button>

      {/* ── Bottom sheet overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col justify-end"
          style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSheet() }}
        >
          <div
            className="w-full rounded-t-3xl flex flex-col"
            style={{
              background: '#fff',
              maxHeight: '90dvh',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1.5px solid #F0F2F5' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF7900, #e06500)' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1" dir={ar ? 'rtl' : 'ltr'}>
                <p className="font-black text-[#071B33] text-sm leading-tight">{t.title}</p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{t.desc}</p>
              </div>
              <button
                onClick={closeSheet}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0F2F5' }}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" dir={ar ? 'rtl' : 'ltr'}>
              {/* Textarea */}
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); setResults(null); setAmbiguous(false); setError('') }}
                placeholder={t.placeholder}
                rows={3}
                autoFocus
                className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none leading-relaxed"
                style={{ background: '#F8F9FA', border: '1.5px solid #D1D5DB', color: '#071B33' }}
                onFocus={e => e.target.style.border = '1.5px solid #FF7900'}
                onBlur={e => e.target.style.border = '1.5px solid #D1D5DB'}
              />

              {error && <p className="text-xs font-semibold text-red-500 px-1">{error}</p>}

              {/* Search button */}
              <button
                onClick={() => doSearch(null)}
                disabled={loading || !description.trim()}
                className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm active:scale-95 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.3)' }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⟳</span> {t.searching}</span>
                  : <span className="flex items-center justify-center gap-2"><Search className="w-4 h-4" /> {t.btn}</span>}
              </button>

              {/* Clarification */}
              {ambiguous && !loading && (
                <div className="rounded-2xl p-4" style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
                  <p className="text-sm font-bold text-[#92400E] mb-3">{t.clarify}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'technician', label: t.techBtn, bg: '#FF7900' },
                      { key: 'company',    label: t.compBtn,  bg: '#071B33' },
                      { key: 'supplier',   label: t.suppBtn,  bg: '#1a5c3a' },
                    ].map(({ key, label, bg }) => (
                      <button key={key}
                        onClick={() => { setAmbiguous(false); doSearch(key) }}
                        className="px-4 py-2 rounded-xl text-sm font-extrabold text-white active:scale-95 transition-transform"
                        style={{ background: bg }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {results && !loading && (
                <div className="space-y-4 pt-1 pb-4">
                  {!hasResults && (
                    <p className="text-center text-sm text-gray-400 py-6">{t.noResults}</p>
                  )}

                  {results.technicians?.length > 0 && (() => {
                    const exactList   = results.technicians.filter(i => i.matchLevel === 'exact')
                    const relatedList = results.technicians.filter(i => i.matchLevel !== 'exact')
                    const visibleTechs = showAllTechs
                      ? results.technicians
                      : results.technicians.slice(0, INITIAL_TECH_LIMIT)
                    const hiddenCount = results.technicians.length - INITIAL_TECH_LIMIT
                    return (
                      <div>
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">
                          👷 {t.techSection} ({results.technicians.length})
                        </p>
                        <div className="space-y-2">
                          {visibleTechs.map((item, idx) => {
                            const prevItem = visibleTechs[idx - 1]
                            const showRelatedDivider = item.matchLevel === 'related' && (!prevItem || prevItem.matchLevel === 'exact') && exactList.length > 0
                            return (
                              <div key={item.id}>
                                {showRelatedDivider && (
                                  <p className="text-[10px] font-bold text-gray-400 px-1 pt-2 pb-1">
                                    — {ar ? 'ذو صلة' : 'Related'}
                                  </p>
                                )}
                                <TechCard item={item} ar={ar} t={t} navigate={navigate} onClose={closeSheet} />
                              </div>
                            )
                          })}
                        </div>
                        {!showAllTechs && hiddenCount > 0 && (
                          <button
                            onClick={() => setShowAllTechs(true)}
                            className="w-full mt-2 py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
                            style={{ background: '#FFF3E8', color: '#FF7900', border: '1.5px solid #FFD4A3' }}>
                            ⬇ {ar ? `عرض ${hiddenCount} فني إضافي` : `Show ${hiddenCount} more`}
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {results.companies?.length > 0 && (
                    <div>
                      <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">🏢 {t.compSection}</p>
                      <div className="space-y-2">
                        {results.companies.map(item => (
                          <CompCard key={item.id} item={item} ar={ar} t={t} navigate={navigate} onClose={closeSheet} />
                        ))}
                      </div>
                    </div>
                  )}

                  {results.suppliers?.length > 0 && (
                    <div>
                      <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">📦 {t.suppSection}</p>
                      <div className="space-y-2">
                        {results.suppliers.map(item => (
                          <SuppCard key={item.id} item={item} ar={ar} t={t} navigate={navigate} onClose={closeSheet} />
                        ))}
                      </div>
                    </div>
                  )}

                  {hasResults && (
                    <button onClick={resetAll}
                      className="w-full py-2.5 rounded-2xl text-sm font-bold text-gray-500 active:scale-95 transition-transform"
                      style={{ background: '#F0F2F5' }}>
                      🔄 بحث جديد
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
