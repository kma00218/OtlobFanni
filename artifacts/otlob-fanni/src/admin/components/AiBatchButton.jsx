import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function AiBatchButton({ entityType }) {
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  const run = async () => {
    if (state === 'loading') return
    setState('loading')
    setResult(null)
    try {
      const r = await fetch(`${API_BASE}/admin/ai/batch-extract-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'خطأ غير معروف')
      setResult(d)
      setState('done')
    } catch (err) {
      setResult({ error: err.message })
      setState('error')
    }
  }

  const dismiss = () => { setState('idle'); setResult(null) }

  return (
    <div className="relative">
      <button
        onClick={run}
        disabled={state === 'loading'}
        title="استخراج التخصصات تلقائياً لجميع من لديهم وصف ولا تخصصات بعد"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors disabled:opacity-60">
        {state === 'loading'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Sparkles className="w-4 h-4" />}
        {state === 'loading' ? 'جارٍ المعالجة...' : 'استخراج الكل بالذكاء الاصطناعي'}
      </button>

      {(state === 'done' || state === 'error') && result && (
        <div className={`absolute top-full mt-2 right-0 z-50 w-64 rounded-2xl shadow-xl border p-4 text-sm ${state === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <button onClick={dismiss} className="absolute top-2 left-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
          {state === 'error' ? (
            <p className="text-red-600 font-medium">{result.error}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-violet-700 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>اكتملت المعالجة</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <p>✅ <span className="font-bold text-emerald-700">{result.processed}</span> عولجوا بنجاح</p>
                <p>⏭️ <span className="font-bold text-amber-600">{result.skipped}</span> متجاوزون (بدون وصف)</p>
                {result.failed > 0 && (
                  <p>❌ <span className="font-bold text-red-600">{result.failed}</span> فشلوا</p>
                )}
                {result.total === 0 && (
                  <p className="text-xs text-slate-400 mt-1">جميعهم يملكون تخصصات بالفعل ✓</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
