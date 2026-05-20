import { useLocation } from 'wouter'
import { Clock, ChevronRight } from 'lucide-react'

export default function ProSoon() {
  const [, navigate] = useLocation()

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto" dir="rtl">
      <div className="text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF7900] to-[#c45e00] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
          <Clock className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#071B33] mb-3">قريباً</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          نعمل على تجهيز هذه الميزة<br />وستكون متاحة في الإصدار القادم
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/pro')}
        className="mt-12 flex items-center gap-2 bg-[#071B33] text-white font-bold px-8 py-3.5 rounded-2xl active:opacity-80"
      >
        العودة للرئيسية
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
