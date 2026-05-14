import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import SearchBar from './SearchBar'

export default function SearchOverlay({ open, onClose }) {
  const { dir, lang } = useLang()
  const overlayRef = useRef(null)

  // Auto-focus the input inside SearchBar when overlay opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const input = overlayRef.current?.querySelector('input')
        input?.focus()
      }, 120)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(3px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      onTouchStart={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Search panel — slides down from top */}
      <div
        ref={overlayRef}
        className="bg-white w-full max-w-[480px] mx-auto rounded-b-3xl px-4 pt-5 pb-6 shadow-2xl"
        style={{
          animation: 'slideDown 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {/* Header row */}
        <div className={`flex items-center gap-3 mb-4 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
          >
            <X className="w-5 h-5 text-[#071B33]" />
          </button>
          <span className="flex-1 text-[#071B33] font-black text-base" dir={dir}>
            {lang === 'ar' ? 'ابحث عن خدمة' : 'Search a service'}
          </span>
        </div>

        {/* The search bar — fully functional */}
        <SearchBar onResultSelect={onClose} />
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  )
}
