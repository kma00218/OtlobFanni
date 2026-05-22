import { useState, useEffect } from 'react'
import { X, Sparkles, Check, Plus, Loader2, AlertCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function AiTagsModal({ open, onClose, entity, onSaved }) {
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [suggested, setSuggested] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [custom, setCustom]     = useState('')
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!open || !entity) return
    const existingTags = entity.aiTags || entity.ai_tags || []
    setSelected(new Set(existingTags))
    setSuggested([])
    setError(null)
    setCustom('')
    setLoading(true)

    const desc = entity.descriptionAr || entity.descriptionEn || entity.description || ''
    const name = entity.nameAr || entity.name_ar || entity.companyName || entity.businessName || ''

    fetch(`${API_BASE}/admin/ai/extract-tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc, name, entity_type: entity.entityType }),
    })
      .then(r => r.json())
      .then(d => {
        const tags = d.tags || []
        setSuggested(tags)
        setSelected(prev => new Set([...prev, ...tags]))
      })
      .catch(() => setError('تعذّر الاتصال بالذكاء الاصطناعي'))
      .finally(() => setLoading(false))
  }, [open, entity?.id])

  const toggle = (tag) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

  const addCustom = () => {
    const tag = custom.trim()
    if (!tag) return
    setSuggested(prev => prev.includes(tag) ? prev : [...prev, tag])
    setSelected(prev => new Set([...prev, tag]))
    setCustom('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const r = await fetch(`${API_BASE}/admin/ai/save-tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entity.entityType, id: entity.id, tags: [...selected] }),
      })
      const d = await r.json()
      onSaved?.(d.tags)
      onClose()
    } catch {
      setError('فشل الحفظ، حاول مجدداً')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !entity) return null

  const existingTags = entity.aiTags || entity.ai_tags || []
  const allTags = [...new Set([...suggested, ...existingTags])]
  const entityName = entity.nameAr || entity.name_ar || entity.companyName || entity.businessName || ''
  const desc = entity.descriptionAr || entity.descriptionEn || entity.description || ''

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="bg-gradient-to-l from-violet-600 to-purple-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <div>
              <h2 className="font-bold text-white text-sm">استخراج التخصصات — ذكاء اصطناعي</h2>
              <p className="text-purple-200 text-xs mt-0.5 truncate max-w-[220px]">{entityName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {desc && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">الوصف المستخدم</p>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{desc}</p>
            </div>
          )}

          {!desc && !loading && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-amber-600">لا يوجد وصف — أضف التخصصات يدوياً أدناه.</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-violet-600 text-sm py-1">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>جارٍ تحليل الوصف واستخراج التخصصات...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {allTags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                التخصصات المقترحة — ✓ محدد = سيحفظ | مشطوب = لن يحفظ:
              </p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const checked = selected.has(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggle(tag)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        checked
                          ? 'bg-violet-50 text-violet-700 border-violet-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 flex-shrink-0" />}
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && !error && allTags.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-1">أضف التخصصات يدوياً أدناه.</p>
          )}

          <div className="flex gap-2">
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="أضف تخصصاً يدوياً..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 placeholder:text-slate-400"
              dir="rtl"
            />
            <button
              onClick={addCustom}
              className="p-2 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors border border-violet-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selected.size > 0 && (
            <p className="text-xs text-slate-500">
              سيتم حفظ <span className="font-bold text-violet-600">{selected.size}</span> تخصص
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-2 justify-end bg-slate-50/50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            إلغاء
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            حفظ التخصصات
          </button>
        </div>
      </div>
    </div>
  )
}
