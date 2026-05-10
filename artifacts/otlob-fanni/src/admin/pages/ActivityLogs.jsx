import { useAdmin } from '../../context/AdminContext'
import { Info } from 'lucide-react'

export default function ActivityLogs() {
  const { isSuperAdmin } = useAdmin()

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white rounded-2xl p-8 border border-gray-100 max-w-md">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">غير متاح</h3>
          <p className="text-gray-400 text-sm">سجل النشاط متاح للمدير العام فقط</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">سجل النشاط سيكون متاحاً في تحديث قادم</p>
    </div>
  )
}
