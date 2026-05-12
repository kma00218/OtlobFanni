import { useAdmin } from '../../context/AdminContext'
import { Activity, Lock, Clock, Info } from 'lucide-react'

function LogEntry({ icon: Icon, color, bg, text, time }) {
  return (
    <div className="flex items-start gap-3.5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#D0D0F0] text-sm leading-relaxed">{text}</p>
      </div>
      <span className="text-[#3A3A60] text-xs font-mono flex-shrink-0 mt-0.5">{time}</span>
    </div>
  )
}

export default function ActivityLogs() {
  const { isSuperAdmin } = useAdmin()

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-black text-white mb-1">غير مصرح</h2>
          <p className="text-[#5050A0] text-sm">سجل النشاط متاح للمدير العام فقط</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5" dir="rtl">
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D0D1C', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,121,0,0.12)', border: '1px solid rgba(255,121,0,0.2)' }}
          >
            <Activity className="w-5 h-5 text-[#FF7900]" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm">سجل النشاط</h3>
            <p className="text-[#5050A0] text-xs mt-0.5">سجل عمليات لوحة التحكم</p>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-bold text-sm mb-1">قيد التطوير</p>
              <p className="text-[#6060A0] text-sm leading-relaxed">
                سيتم تفعيل سجل النشاط الكامل في تحديث قادم.
                سيتضمن تتبع جميع عمليات الإضافة والحذف والتعديل التي تتم في لوحة التحكم.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
