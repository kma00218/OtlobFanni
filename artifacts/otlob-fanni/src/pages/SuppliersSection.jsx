import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { SUPPLY_TYPES } from '../data/suppliers'
import api from '../lib/api'

const TYPE_COLORS = {
  workshop_tools:     ['#D97706', '#b35500'],
  electrical_tools:   ['#FF7900', '#CC5500'],
  plumbing_supplies:  ['#1E50A2', '#0F2F70'],
  ac_equipment:       ['#0891B2', '#065B7A'],
  security_cameras:   ['#6366F1', '#4338CA'],
  auto_parts:         ['#475569', '#2D3E52'],
  auto_tools:         ['#92400E', '#6B2D07'],
  safety_equipment:   ['#059669', '#03704F'],
  building_materials: ['#071B33', '#0a2849'],
  other:              ['#6B7280', '#374151'],
}

export default function SuppliersSection() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [, navigate] = useLocation()
  const [counts, setCounts] = useState({})
  const [total, setTotal] = useState(0)

  useEffect(() => {
    api.suppliers().then(list => {
      setTotal(list.length)
      const map = {}
      list.forEach(s => {
        const key = s.supplyType || 'other'
        map[key] = (map[key] || 0) + 1
      })
      setCounts(map)
    }).catch(() => {})
  }, [])

  const title = ar ? 'مستلزمات اطلب فني' : 'Otlob Fanni Supplies'

  return (
    <div className="bg-background min-h-screen pt-20 pb-6" dir={ar ? 'rtl' : 'ltr'}>
      <BackHeader title={title} />

      <main className="px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[#071B33] text-xl font-black">{title}</h1>
          {total > 0 && (
            <span className="bg-[#0e5c6d]/10 text-[#0e5c6d] text-xs font-black px-2.5 py-1 rounded-full">
              {total} {ar ? 'مزود' : 'suppliers'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {SUPPLY_TYPES.map(t => {
            const [c1, c2] = TYPE_COLORS[t.id] || TYPE_COLORS.other
            const count = counts[t.id] || 0
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/suppliers?type=${t.id}`)}
                className="flex flex-col items-center gap-1.5 select-none cursor-pointer active:scale-90 transition-transform duration-150"
              >
                <div className="relative">
                  <div
                    className="w-[70px] h-[70px] rounded-[18px] flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                  >
                    <span className="text-3xl leading-none">{t.emoji}</span>
                  </div>
                  {count > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[20px] h-[20px] bg-white border-2 border-gray-100 text-[#071B33] text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-bold text-center text-[#071B33] leading-tight line-clamp-2 w-full px-0.5 max-w-[76px]">
                  {ar ? t.nameAr : t.nameEn}
                </span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
