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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      dir="rtl"
    >
      <div
        className={`w-full ${sizeClass} max-h-[90vh] flex flex-col rounded-3xl shadow-2xl`}
        style={{
          background: 'linear-gradient(145deg, #0F0F1D, #0A0A15)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-base font-black text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all text-[#4040A0] hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
          <div
            className="flex gap-3 px-6 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              type="submit"
              form="modal-form"
              disabled={loading}
              className="flex items-center gap-2 font-bold text-white text-sm px-6 py-2.5 rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FF7900, #FF9500)',
                boxShadow: '0 4px 20px rgba(255,121,0,0.3)',
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="font-medium text-[#8080B0] hover:text-white text-sm px-6 py-2.5 rounded-2xl transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
