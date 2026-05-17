import { useState } from 'react'
import { X, Plus, Trash2, Send, CheckCircle, Users } from 'lucide-react'
import api from '../lib/api'

const EMPTY_CARD = () => ({
  name: '', phone: '', whatsapp: '', specialty: '', city: '',
})

function stripLocal(v) {
  if (!v) return ''
  const s = v.replace(/\s/g, '')
  if (s.startsWith('+218')) return s.slice(4)
  if (s.startsWith('00218')) return s.slice(5)
  if (s.startsWith('218')) return s.slice(3)
  return s
}

function PhoneField({ label, value, onChange, required }) {
  const local = stripLocal(value)
  function handle(e) {
    let raw = e.target.value.replace(/\D/g, '')
    if (raw.startsWith('0')) raw = raw.slice(1)
    onChange('+218' + raw)
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-[#071B33] mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#FF7900] focus-within:ring-2 focus-within:ring-[#FF7900]/20 transition-all" dir="ltr">
        <span className="flex items-center px-3 bg-gray-50 text-[#071B33] font-bold text-xs border-r border-gray-200 select-none whitespace-nowrap">
          🇱🇾 +218
        </span>
        <input
          type="tel"
          required={required}
          value={local}
          onChange={handle}
          placeholder="91 0000000"
          inputMode="numeric"
          maxLength={9}
          dir="ltr"
          className="flex-1 bg-white outline-none px-3 py-2 text-sm text-[#071B33] placeholder-gray-400"
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1">اكتب الرقم المحلي فقط بدون صفر في البداية.</p>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#071B33] mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 rounded-xl px-3 py-2 text-sm text-[#071B33] outline-none transition-all"
      />
    </div>
  )
}

export default function ReferralModal({ referrerId, referrerName, referrerType, onClose }) {
  const [cards, setCards]   = useState([EMPTY_CARD()])
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')

  const updateCard = (i, field, val) =>
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))

  const addCard = () => {
    if (cards.length >= 5) return
    setCards(prev => [...prev, EMPTY_CARD()])
  }

  const removeCard = (i) =>
    setCards(prev => prev.filter((_, idx) => idx !== i))

  const validate = () => {
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      if (!c.name.trim())      return `الترشيح ${i + 1}: الاسم مطلوب`
      if (!c.phone || c.phone.replace(/\D/g,'').length < 10) return `الترشيح ${i + 1}: رقم الهاتف غير مكتمل`
      if (!c.whatsapp || c.whatsapp.replace(/\D/g,'').length < 10) return `الترشيح ${i + 1}: رقم الواتساب غير مكتمل`
      if (!c.specialty.trim()) return `الترشيح ${i + 1}: التخصص مطلوب`
      if (!c.city.trim())      return `الترشيح ${i + 1}: المدينة مطلوبة`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setSaving(true)
    try {
      await api.submitReferrals({
        referrals: cards,
        referrerId,
        referrerName,
        referrerType,
      })
      setDone(true)
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF7900]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#FF7900]" />
            </div>
            <div>
              <p className="font-bold text-[#071B33] text-sm">رشّح فنيين وشركات</p>
              <p className="text-[11px] text-gray-400">حتى 5 ترشيحات</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          /* ── Success State ── */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-[#071B33] text-lg mb-2">تم الإرسال بنجاح!</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              تم إرسال الترشيحات بنجاح، شكراً لمساهمتك في بناء منصة اطلب فني.
            </p>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-[#FF7900] text-white rounded-xl font-bold text-sm hover:bg-[#e86d00] transition-colors active:scale-95">
              إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {cards.map((card, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-[#071B33] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FF7900] text-white text-[10px] flex items-center justify-center font-black">{i + 1}</span>
                    ترشيح #{i + 1}
                  </p>
                  {cards.length > 1 && (
                    <button type="button" onClick={() => removeCard(i)}
                      className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <TextField
                  label="الاسم الكامل"
                  value={card.name}
                  onChange={v => updateCard(i, 'name', v)}
                  placeholder="مثال: أحمد علي المنصوري"
                  required
                />
                <PhoneField
                  label="رقم الهاتف"
                  value={card.phone}
                  onChange={v => updateCard(i, 'phone', v)}
                  required
                />
                <PhoneField
                  label="رقم الواتساب"
                  value={card.whatsapp}
                  onChange={v => updateCard(i, 'whatsapp', v)}
                  required
                />
                <TextField
                  label="التخصص"
                  value={card.specialty}
                  onChange={v => updateCard(i, 'specialty', v)}
                  placeholder="مثال: كهربائي، سباك، نجار..."
                  required
                />
                <TextField
                  label="المدينة"
                  value={card.city}
                  onChange={v => updateCard(i, 'city', v)}
                  placeholder="مثال: طرابلس، بنغازي، مصراتة..."
                  required
                />
              </div>
            ))}

            {cards.length < 5 && (
              <button type="button" onClick={addCard}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#FF7900]/40 text-[#FF7900] rounded-2xl text-sm font-bold hover:border-[#FF7900]/70 hover:bg-[#FF7900]/5 transition-all active:scale-95">
                <Plus className="w-4 h-4" />
                إضافة فني آخر ({cards.length}/5)
              </button>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF7900] hover:bg-[#e86d00] disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-colors active:scale-95">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />
              }
              {saving ? 'جارٍ الإرسال...' : `إرسال ${cards.length > 1 ? `${cards.length} ترشيحات` : 'الترشيح'}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
