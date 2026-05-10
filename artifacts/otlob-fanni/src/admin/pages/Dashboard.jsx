import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import {
  Wrench, Users, MapPin, ClipboardList, Tag, Megaphone,
  CheckCircle, Clock, ShieldCheck,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const MOCK_STATS = {
  totalTechs: 128,
  activeTechs: 97,
  newRequests: 24,
  completedRequests: 186,
  totalCities: 23,
  totalCats: 19,
  activeAds: 7,
  subAdmins: 3,
}

const MOCK_REQUESTS = [
  { id: 1, customer_name: 'أحمد محمد', service: 'سباكة', status: 'new',         created_at: '2026-05-09T10:00:00Z', city: 'طرابلس' },
  { id: 2, customer_name: 'سارة علي',  service: 'كهرباء', status: 'assigned',    created_at: '2026-05-09T09:20:00Z', city: 'بنغازي' },
  { id: 3, customer_name: 'محمود سالم', service: 'تكييف', status: 'in_progress', created_at: '2026-05-09T08:10:00Z', city: 'مصراتة' },
  { id: 4, customer_name: 'خالد حسن',  service: 'نجارة', status: 'completed',   created_at: '2026-05-08T17:50:00Z', city: 'الزاوية' },
  { id: 5, customer_name: 'ريم عبدالله', service: 'دهان',  status: 'cancelled',   created_at: '2026-05-08T15:10:00Z', city: 'سبها' },
]

const MOCK_TECHS = [
  { id: 1, name_ar: 'أحمد محمد',  category: 'سباكة',  status: 'available', city: 'طرابلس',  created_at: '2026-05-09T11:00:00Z' },
  { id: 2, name_ar: 'سالم علي',   category: 'كهرباء', status: 'busy',      city: 'بنغازي',  created_at: '2026-05-09T10:15:00Z' },
  { id: 3, name_ar: 'خالد حسن',   category: 'تكييف',  status: 'inactive',  city: 'مصراتة',  created_at: '2026-05-09T08:40:00Z' },
  { id: 4, name_ar: 'يوسف عمر',   category: 'نجارة',  status: 'available', city: 'الزاوية', created_at: '2026-05-08T19:25:00Z' },
  { id: 5, name_ar: 'محمود سالم', category: 'دهان',   status: 'available', city: 'سبها',    created_at: '2026-05-08T16:05:00Z' },
]

const MOCK_STATUS = [
  { key: 'new',         name: 'جديد',  value: 24,  fill: '#FF7900' },
  { key: 'assigned',    name: 'مُسند', value: 18,  fill: '#3B82F6' },
  { key: 'in_progress', name: 'جارٍ',  value: 11,  fill: '#8B5CF6' },
  { key: 'completed',   name: 'مكتمل', value: 186, fill: '#10B981' },
  { key: 'cancelled',   name: 'ملغي',  value: 9,   fill: '#EF4444' },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])
  const [recentTechs, setRecentTechs] = useState([])
  const [requestsByStatus, setRequestsByStatus] = useState([])

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(MOCK_STATS)
      setRecentRequests(MOCK_REQUESTS)
      setRecentTechs(MOCK_TECHS)
      setRequestsByStatus(MOCK_STATUS)
      setLoading(false)
    }, 250)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-3">
        <StatCard title="إجمالي الفنيين"      value={stats.totalTechs}        icon={Wrench}        color="navy"   loading={loading} />
        <StatCard title="الفنيون النشطون"     value={stats.activeTechs}       icon={CheckCircle}   color="green"  loading={loading} />
        <StatCard title="الطلبات الجديدة"     value={stats.newRequests}       icon={Clock}         color="orange" loading={loading} />
        <StatCard title="الطلبات المكتملة"    value={stats.completedRequests} icon={ClipboardList} color="green"  loading={loading} />
        <StatCard title="عدد المدن"          value={stats.totalCities}       icon={MapPin}        color="blue"   loading={loading} />
        <StatCard title="عدد التخصصات"       value={stats.totalCats}         icon={Tag}           color="purple" loading={loading} />
        <StatCard title="الإعلانات النشطة"    value={stats.activeAds}         icon={Megaphone}     color="orange" loading={loading} />
        <StatCard title="المشرفون الفرعيون"   value={stats.subAdmins}         icon={ShieldCheck}   color="navy"   loading={loading} />
      </div>

      {/* Status Pie + Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Requests by status - Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#071B33] mb-4">الطلبات حسب الحالة</h3>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={requestsByStatus} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {requestsByStatus.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {requestsByStatus.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                    <span className="text-gray-600 flex-1">{item.name}</span>
                    <span className="font-bold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-[#071B33]">آخر 5 طلبات</h3>
            <span className="text-xs text-gray-400">بيانات تجريبية</span>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex gap-3">
                    <div className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))
              : recentRequests.map((r) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.customer_name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {r.service} · {r.city} · {new Date(r.created_at).toLocaleDateString('ar-LY')}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Recent Techs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-[#071B33]">آخر 5 فنيين</h3>
          <span className="text-xs text-gray-400">بيانات تجريبية</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-gray-100 text-gray-600">
                <th className="text-right px-4 py-3 font-semibold">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold">التخصص</th>
                <th className="text-right px-4 py-3 font-semibold">المدينة</th>
                <th className="text-right px-4 py-3 font-semibold">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold">تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : recentTechs.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-[#F7F8FA]/60">
                      <td className="px-4 py-3 text-gray-800 font-medium">{t.name_ar}</td>
                      <td className="px-4 py-3 text-gray-600">{t.category}</td>
                      <td className="px-4 py-3 text-gray-600">{t.city}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.status === 'available'
                              ? 'bg-green-50 text-green-600'
                              : t.status === 'busy'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {t.status === 'available' ? 'متاح' : t.status === 'busy' ? 'مشغول' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(t.created_at).toLocaleDateString('ar-LY')}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    new:         ['جديد',  'bg-orange-50 text-[#FF7900]'],
    assigned:    ['مُسند', 'bg-blue-50 text-blue-600'],
    in_progress: ['جارٍ',  'bg-purple-50 text-purple-600'],
    completed:   ['مكتمل', 'bg-green-50 text-green-600'],
    cancelled:   ['ملغي',  'bg-red-50 text-red-500'],
  }
  const [label, cls] = map[status] || ['—', 'bg-gray-100 text-gray-500']
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}
