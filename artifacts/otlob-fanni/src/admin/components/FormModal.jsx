import { X, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function FormModal({ open, onClose, title, children, onSubmit, loading, submitLabel = 'حفظ', size = 'md' }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }[size] || 'max-w-lg'

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      dir="rtl"
    >
      <div className={`bg-[#0E0E17] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 w-full ${sizeClass} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#555570] hover:text-[#C0C0E0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form id="modal-form" onSubmit={onSubmit}>
            {children}
          </form>
        </div>

        <div className="flex gap-3 justify-start px-6 py-4 border-t border-white/5">
          <button
            type="submit"
            form="modal-form"
            disabled={loading}
            className="bg-[#FF7900] hover:bg-[#e86d00] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg shadow-[#FF7900]/20"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 border border-white/8 text-[#9090B0] hover:text-[#C0C0E0] font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
