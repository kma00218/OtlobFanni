import { X, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function FormModal({ open, onClose, title, children, onSubmit, loading, submitLabel = 'حفظ', size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }[size] || 'max-w-lg'

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      dir="rtl"
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#071B33]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <form id="modal-form" onSubmit={onSubmit}>
            {children}
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-start px-6 py-4 border-t border-gray-100">
          <button
            type="submit"
            form="modal-form"
            disabled={loading}
            className="bg-[#FF7900] hover:bg-[#e86d00] text-white font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
