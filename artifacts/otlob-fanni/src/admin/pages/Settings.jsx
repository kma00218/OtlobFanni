import { Info } from 'lucide-react'

export default function Settings() {
  return (
    <div className="max-w-2xl">
      <div className="bg-[#0E0E17] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <h2 className="font-bold text-white">إعدادات التطبيق</h2>
          <p className="text-[#666680] text-sm mt-0.5">الإعدادات العامة للتطبيق</p>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-4 bg-blue-500/8 border border-blue-500/20 rounded-2xl px-5 py-4">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-semibold text-sm mb-1">قيد التطوير</p>
              <p className="text-[#8888A8] text-sm leading-relaxed">
                إعدادات التطبيق سيتم ربطها بقاعدة البيانات لاحقًا.
                حاليًا لا يوجد endpoint جاهز لحفظ هذه الإعدادات على الخادم.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
