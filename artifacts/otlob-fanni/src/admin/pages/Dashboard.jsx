import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import {
  Wrench, Users, MapPin, ClipboardList, Tag, Megaphone,
  CheckCircle, Clock, ShieldCheck, Newspaper, Building2, FileCheck,
  HardDrive,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'

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
  const [storageUsage, setStorageUsage] = useState(null)

  useEffect(() => {
    Promise.all([
      api.admin.stats(),
      api.admin.storageUsage().catch(() => null),
    ]).then(([s, usage]) => {
        setStats(s)
        setRecentRequests(s.recentRequests || [])
        setRecentTechs(s.recentTechs || [])
        const statusCounts = {}
        ;(s.recentRequests || []).forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1 })
        const pieData = Object.entries(STATUS_LABELS).map(([key, name]) => ({
          key, name, value: statusCounts[key] || 0, fill: STATUS_COLORS[key],
        })).filter(d => d.value > 0)
        setRequestsByStatus(pieData)
        if (usage) setStorageUsage(usage)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const usedMB  = storageUsage ? (storageUsage.usedBytes  / (1024 * 1024)).toFixed(1) : null
  const limitMB  = storageUsage ? (storageUsage.limitBytes / (1024 * 1024)).toFixed(0) : null
  const usedPct  = storageUsage ? Math.min(100, (storageUsage.usedBytes / storageUsage.limitBytes) * 100) : 0
  const usageFmt = usedMB !== null
    ? usedMB >= 1024
      ? `${(usedMB / 1024).toFixed(2)} GB`
      : `${usedMB} MB`
    : null
  const limitFmt = limitMB !== null
    ? limitMB >= 1024
      ? `${(limitMB / 1024).toFixed(0)} GB`
      : `${limitMB} MB`
    : null
  const barColor = usedPct > 85 ? '#EF4444' : usedPct > 60 ? '#FF7900' : '#10B981'

  return (
    <div className="space-y-6">
      {/* Storage Usage Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#071B33]/5 flex items-center justify-center">
            <HardDrive size={18} className="text-[#071B33]" />
          </div>
          <div>
            <h3 className="font-bold text-[#071B33] text-sm">سعة التخزين</h3>
            <p className="text-xs text-gray-400">Object Storage — Replit</p>
          </div>
          {storageUsage && (
            <div className="mr-auto text-right">
              <span className="text-sm font-bold text-gray-800">{usageFmt}</span>
              <span className="text-xs text-gray-400"> / {limitFmt}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-3 bg-gray-100 rounded-full animate-pulse" />
        ) : storageUsage ? (
          <>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${usedPct}%`, background: barColor }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>{storageUsage.fileCount} ملف محفوظ</span>
              <span className={usedPct > 85 ? 'text-red-500 font-bold' : usedPct > 60 ? 'text-orange-500 font-semibold' : 'text-green-500'}>
                {usedPct.toFixed(1)}% مستخدم
              </span>
            </div>
            {usedPct > 85 && (
              <p className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                ⚠️ التخزين يقترب من الحد الأقصى — احذف الملفات غير الضرورية أو رفّع باقتك
              </p>
            )}
          </>
        ) : (
          <div className="text-xs text-gray-400 text-center py-1">تعذّر تحميل بيانات التخزين</div>
        )}
      </div>

      {/* Stats Grid */}
      {/* ── طلبات التسجيل ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="طلبات فنيين معلّقة"   value={stats.pendingTechApps}    icon={FileCheck}   color="orange" loading={loading} subtitle={`إجمالي: ${stats.totalTechApps ?? 0}`} />
        <StatCard title="طلبات شركات معلّقة"   value={stats.pendingCompanyApps} icon={Building2}   color="orange" loading={loading} subtitle={`إجمالي: ${stats.totalCompanyApps ?? 0}`} />
        <StatCard title="طلبات إعلان معلّقة"   value={stats.pendingAdRequests}  icon={Newspaper}   color="orange" loading={loading} subtitle={`مقبولة: ${stats.approvedAdRequests ?? 0}`} />
        <StatCard title="الإعلانات النشطة"      value={stats.activeAds}          icon={Megaphone}   color="green"  loading={loading} />
      </div>

      {/* ── إحصائيات عامة ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="إجمالي الفنيين"      value={stats.totalTechs}        icon={Wrench}        color="navy"   loading={loading} />
        <StatCard title="الفنيون النشطون"     value={stats.activeTechs}       icon={CheckCircle}   color="green"  loading={loading} />
        <StatCard title="الطلبات الجديدة"     value={stats.newRequests}       icon={Clock}         color="orange" loading={loading} />
        <StatCard title="الطلبات المكتملة"    value={stats.completedRequests} icon={ClipboardList} color="green"  loading={loading} />
        <StatCard title="عدد المدن"           value={stats.totalCities}       icon={MapPin}        color="blue"   loading={loading} />
        <StatCard title="عدد التخصصات"        value={stats.totalCats}         icon={Tag}           color="purple" loading={loading} />
        <StatCard title="المشرفون الفرعيون"   value={stats.subAdmins}         icon={ShieldCheck}   color="navy"   loading={loading} />
        <StatCard title="طلبات إعلان مقبولة"  value={stats.approvedAdRequests} icon={Newspaper}   color="green"  loading={loading} />
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
