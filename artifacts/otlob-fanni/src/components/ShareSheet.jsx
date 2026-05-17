import { useState } from 'react'
import { X, MessageSquare, Send, Copy, Check, Share2 } from 'lucide-react'

export default function ShareSheet({ name, city, profileUrl, onClose }) {
  const [copied, setCopied] = useState(false)

  const text = `${name}${city ? ` · ${city}` : ''}\n${profileUrl}\n\nاطلب فني 🇱🇾 — www.otlobfanni.ly`

  const share = (platform) => {
    const encoded = encodeURIComponent(text)
    const urls = {
      whatsapp:  `https://wa.me/?text=${encoded}`,
      telegram:  `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`${name}${city ? ` · ${city}` : ''}\n\nاطلب فني 🇱🇾 — www.otlobfanni.ly`)}`,
      messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(profileUrl)}&app_id=291494417518994&redirect_uri=${encodeURIComponent(profileUrl)}`,
    }
    window.open(urls[platform], '_blank', 'noopener,noreferrer')
    onClose()
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => { setCopied(false); onClose() }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl px-4 pt-4 pb-28 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-[#071B33]">مشاركة الملف الشخصي</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed bg-gray-50 rounded-xl px-3 py-2 font-medium">
          {name}{city ? ` · ${city}` : ''}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => share('whatsapp')}
            className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl px-4 py-3 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">واتساب</span>
          </button>

          <button
            onClick={() => share('telegram')}
            className="flex items-center gap-3 bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-2xl px-4 py-3 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-[#229ED9] flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">تيليجرام</span>
          </button>

          <button
            onClick={() => share('messenger')}
            className="flex items-center gap-3 bg-[#0099FF]/10 border border-[#0099FF]/20 rounded-2xl px-4 py-3 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0099FF] to-[#A033FF] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">ماسنجر</span>
          </button>

          <button
            onClick={copyLink}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 active:scale-[0.97] transition-all border ${
              copied
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              copied ? 'bg-emerald-500' : 'bg-[#071B33]'
            }`}>
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            </div>
            <span className={`text-sm font-bold transition-colors ${copied ? 'text-emerald-700' : 'text-gray-800'}`}>
              {copied ? 'تم النسخ ✓' : 'نسخ الرابط'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
