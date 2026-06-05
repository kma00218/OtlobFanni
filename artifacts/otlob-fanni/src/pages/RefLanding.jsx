import { useParams, useLocation } from 'wouter'
import { Wrench, Building2, Package, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function RefLanding() {
  const { code } = useParams()
  const [, navigate] = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 50)
  }, [])

  const options = [
    {
      icon: Wrench,
      titleAr: 'فني متخصص',
      titleEn: 'Technician',
      descAr: 'سبّاك، كهربائي، نجار، مكيّفات...',
      color: '#FF7900',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      path: `/join?ref=${code}`,
    },
    {
      icon: Building2,
      titleAr: 'شركة خدمية',
      titleEn: 'Service Company',
      descAr: 'شركة صيانة أو مقاولات أو خدمات منزلية',
      color: '#2563eb',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      path: `/join-company?ref=${code}`,
    },
    {
      icon: Package,
      titleAr: 'مورّد مستلزمات',
      titleEn: 'Supplier',
      descAr: 'تاجر أو مورّد مواد البناء والكهرباء والسباكة',
      color: '#7c3aed',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      path: `/join-supplier?ref=${code}`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071B33] to-[#0d2a4d] flex flex-col items-center justify-center px-4 py-10" dir="rtl">

      <div className={`transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} w-full max-w-sm`}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FF7900] flex items-center justify-center mb-3 shadow-lg shadow-orange-900/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">اطلب فني</h1>
          <p className="text-white/50 text-sm mt-1">Otlob Fanni</p>
        </div>

        {/* Invite text */}
        <div className="text-center mb-6">
          <p className="text-white/80 text-base font-bold">تمت دعوتك للانضمام إلى المنصة</p>
          <p className="text-white/40 text-sm mt-1">اختر نوع الحساب الذي تريد إنشاءه</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map(opt => (
            <button
              key={opt.path}
              onClick={() => navigate(opt.path)}
              className={`w-full ${opt.bg} ${opt.border} border rounded-2xl p-4 flex items-center gap-4 text-right hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-sm`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: opt.color }}
              >
                <opt.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[#071B33] text-base">{opt.titleAr}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{opt.descAr}</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 flex-shrink-0 rotate-180" />
            </button>
          ))}
        </div>

        {/* Ref code badge */}
        <div className="mt-6 text-center">
          <span className="text-white/30 text-xs font-mono">ref: {code}</span>
        </div>

      </div>
    </div>
  )
}
