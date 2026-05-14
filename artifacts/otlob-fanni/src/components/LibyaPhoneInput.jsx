import { useLang } from '../context/LanguageContext'

function stripLocal(fullNumber) {
  if (!fullNumber) return ''
  const s = fullNumber.replace(/\s/g, '')
  if (s.startsWith('+218')) return s.slice(4)
  if (s.startsWith('00218')) return s.slice(5)
  if (s.startsWith('218')) return s.slice(3)
  return s
}

export default function LibyaPhoneInput({ value, onChange, required, className }) {
  const { lang } = useLang()
  const ar = lang === 'ar'

  const localValue = stripLocal(value)

  function handleChange(e) {
    let raw = e.target.value.replace(/\D/g, '')
    if (raw.startsWith('0')) raw = raw.slice(1)
    onChange('+218' + raw)
  }

  const hint = ar
    ? 'اكتب الرقم المحلي فقط (مثال: 91، 92، 94...) بدون صفر في البداية'
    : 'Local number only (e.g. 91…, 92…, 94…) — no leading zero'

  return (
    <div>
      <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:border-[#FF7900] focus-within:ring-2 focus-within:ring-[#FF7900]/20 transition-all" dir="ltr">
        <span className="flex items-center px-3 bg-gray-100 text-[#071B33] font-bold text-sm border-r border-gray-300 select-none whitespace-nowrap">
          🇱🇾 +218
        </span>
        <input
          type="tel"
          required={required}
          value={localValue}
          onChange={handleChange}
          placeholder="91 0000000"
          inputMode="numeric"
          maxLength={9}
          dir="ltr"
          className={`flex-1 bg-white outline-none px-3 py-2.5 text-sm text-[#071B33] placeholder-gray-400 ${className || ''}`}
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1 px-0.5" dir={ar ? 'rtl' : 'ltr'}>
        {hint}
      </p>
    </div>
  )
}
