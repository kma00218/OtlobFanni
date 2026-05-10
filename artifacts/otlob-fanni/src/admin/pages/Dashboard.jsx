import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import {
  Wrench, Users, MapPin, ClipboardList, Tag, Megaphone,
  CheckCircle, Clock, ShieldCheck, Newspaper,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const ls = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }

const STATUS_COLORS = {
  new:         '#FF7900',
  assigned:    '#3B82F6',
  in_progress: '#8B5CF6',
  completed:   '#10B981',
  cancelled:   '#EF4444',
}
const STATUS_LABELS = {
  new: 'جديد', assigned: 'مُسند', in_progress: 'جارٍ', completed: 'مكتمل', cancelled: 'ملغي',
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])
  const [recentTechs, setRecentTechs] = useState([])
  const [requestsByStatus, setRequestsByStatus] = useState([])

  useEffect(() => {
    const techs       = [...ls('technicians'), ...ls('demo_technicians_v1')]
    const requests    = ls('service_requests')
    const cities      = ls('demo_cities_v1')
    const cats        = ls('demo_categories_v1')
    const ads         = ls('demo_ads_v1')
    const admins      = ls('demo_admins_v1')
    const adRequests  = ls('adRequests')

    // إحصائيات
    const activeTechs    = techs.filter(t => (t.is_active ?? t.isActive ?? true) && (t.is_approved ?? t.isApproved ?? true))
    const newReqs        = requests.filter(r => r.status === 'new')
    const doneReqs       = requests.filter(r => r.status === 'completed')
    const activeAds      = ads.filter(a => a.is_active)
    const subAdmins      = admins.filter(a => a.role === 'sub_admin')
    const pendingAdReqs  = adRequests.filter(r => r.status === 'pending')
    const approvedAdReqs = adRequests.filter(r => r.status === 'approved')

    setStats({
      totalTechs:        techs.length,
      activeTechs:       activeTechs.length,
      newRequests:       newReqs.length,
      completedRequests: doneReqs.length,
      totalCities:       cities.length,
      totalCats:         cats.length,
      activeAds:         activeAds.length,
      subAdmins:         subAdmins.length,
      pendingAdRequests:  pendingAdReqs.length,
      approvedAdRequests: approvedAdReqs.length,
    })

    // آخر 5 طلبات
    const sortedReqs = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setRecentRequests(sortedReqs.slice(0, 5))

    // آخر 5 فنيين
    const sortedTechs = [...techs].sort((a, b) => new Date(b.created_at || b.approvedAt || 0) - new Date(a.created_at || a.approvedAt || 0))
    setRecentTechs(sortedTechs.slice(0, 5))

    // توزيع الطلبات حسب الحالة
    const statusCounts = {}
    requests.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1 })
    const pieData = Object.entries(STATUS_LABELS).map(([key, name]) => ({
      key, name, value: statusCounts[key] || 0, fill: STATUS_COLORS[key],
    })).filter(d => d.value > 0)
    setRequestsByStatus(pieData)

    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="إجمالي الفنيين"      value={stats.totalTechs}        icon={Wrench}        color="navy"   loading={loading} />
        <StatCard title="الفنيون النشطون"     value={stats.activeTechs}       icon={CheckCircle}   color="green"  loading={loading} />
        <StatCard title="الطلبات الجديدة"     value={stats.newRequests}       icon={Clock}         color="orange" loading={loading} />
        <StatCard title="الطلبات المكتملة"    value={stats.completedRequests} icon={ClipboardList} color="green"  loading={loading} />
        <StatCard title="عدد المدن"           value={stats.totalCities}       icon={MapPin}        color="blue"   loading={loading} />
        <StatCard title="عدد التخصصات"        value={stats.totalCats}         icon={Tag}           color="purple" loading={loading} />
        <StatCard title="الإعلانات النشطة"       value={stats.activeAds}          icon={Megaphone}   color="orange" loading={loading} />
        <StatCard title="المشرفون الفرعيون"    value={stats.subAdmins}          icon={ShieldCheck} color="navy"   loading={loading} />
        <StatCard title="طلبات إعلان معلّقة"   value={stats.pendingAdRequests}  icon={Newspaper}   color="orange" loading={loading} />
        <StatCard title="طلبات إعلان مقبولة"   value={stats.approvedAdRequests} icon={Newspaper}   color="green"  loading={loading} />
      </div>

      {/* Status Pie + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#071B33] mb-4">الطلبات حسب الحالة</h3>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : requestsByStatus.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">لا توجد طلبات بعد</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={requestsByStatus} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {requestsByStatus.map((entry) => <Cell key={entry.key} fill={entry.fill} />)}
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
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-[#071B33]">آخر الطلبات</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex gap-3">
                    <div className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))
              : recentRequests.length === 0
                ? <div className="px-5 py-8 text-center text-gray-400 text-sm">لا توجد طلبات بعد</div>
                : recentRequests.map((r) => (
                    <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.customer_name || 'غير محدد'}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {r.category_name || r.category_id || '—'} · {r.city_name || r.city_id || '—'} · {r.created_at ? new Date(r.created_at).toLocaleDateString('ar-LY') : '—'}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))
            }
          </div>
        </div>
      </div>

      {/* Recent Techs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-[#071B33]">آخر الفنيين المضافين</h3>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : recentTechs.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">لا يوجد فنيون بعد</div>
        ) : (
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
                {recentTechs.map((t, i) => (
                  <tr key={t.id || i} className="border-b border-gray-50 hover:bg-[#F7F8FA]/60">
                    <td className="px-4 py-3 text-gray-800 font-medium">{t.name_ar || t.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.category_id || t.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.city_id || t.city || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        (t.is_active ?? t.isActive ?? true) && (t.is_approved ?? t.isApproved ?? true)
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {(t.is_active ?? t.isActive ?? true) && (t.is_approved ?? t.isApproved ?? true) ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {t.created_at || t.approvedAt ? new Date(t.created_at || t.approvedAt).toLocaleDateString('ar-LY') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
