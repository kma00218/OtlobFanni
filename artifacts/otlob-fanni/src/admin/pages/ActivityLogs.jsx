import { useAdmin } from '../../context/AdminContext'
import { Info } from 'lucide-react'

export default function ActivityLogs() {
  const { isSuperAdmin } = useAdmin()

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-[#0E0E17] rounded-2xl p-8 border border-white/5 max-w-md">
          <Info className="w-12 h-12 text-[#333350] mx-auto mb-3" />
          <h3 className="font-bold text-[#C0C0D8] mb-1">غير متاح</h3>
          <p className="text-[#555570] text-sm">سجل النشاط متاح للمدير العام فقط</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0E0E17] rounded-2xl border border-white/5 p-8 text-center">
      <Info className="w-10 h-10 text-[#333350] mx-auto mb-3" />
      <p className="text-[#666680] text-sm">سجل النشاط سيكون متاحاً في تحديث قادم</p>
    </div>
  )
}
