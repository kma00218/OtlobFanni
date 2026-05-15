import { X, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function FormModal({ open, onClose, title, children, onSubmit, loading, submitLabel = 'حفظ', size = 'md', hideFooter = false }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }[size] || 'max-w-lg'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      dir="rtl"
    >
      <div
        className={`w-full ${sizeClass} max-h-[90vh] flex flex-col rounded-3xl shadow-2xl bg-white`}
        style={{ border: '1px solid #E0E8F0', boxShadow: '0 24px 60px rgba(7,27,51,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#FF7900]" />
            <h3 className="text-base font-black text-[#071B33] tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="modal-form" onSubmit={onSubmit}>
            {children}
          </form>
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="flex gap-3 px-6 py-4 flex-shrink-0 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
            <button
              type="submit"
              form="modal-form"
              disabled={loading}
              className="flex items-center gap-2 font-bold text-white text-sm px-6 py-2.5 rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #FF7900, #FF9500)',
                boxShadow: '0 4px 16px rgba(255,121,0,0.35)',
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="font-medium text-slate-500 hover:text-slate-700 text-sm px-6 py-2.5 rounded-2xl transition-all bg-white border border-slate-200 hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
