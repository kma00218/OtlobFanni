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
    }).catch(() => setLoading(false))
  }, [])

  const usedMB   = storageUsage ? (storageUsage.usedBytes  / (1024 * 1024)).toFixed(1) : null
  const limitMB  = storageUsage ? (storageUsage.limitBytes / (1024 * 1024)).toFixed(0) : null
  const usedPct  = storageUsage ? Math.min(100, (storageUsage.usedBytes / storageUsage.limitBytes) * 100) : 0
  const usageFmt = usedMB !== null ? (usedMB >= 1024 ? `${(usedMB/1024).toFixed(2)} GB` : `${usedMB} MB`) : null
  const limitFmt = limitMB !== null ? (limitMB >= 1024 ? `${(limitMB/1024).toFixed(0)} GB` : `${limitMB} MB`) : null
  const barColor = usedPct > 85 ? '#EF4444' : usedPct > 60 ? '#FF7900' : '#10B981'

  return (
    <div className="space-y-5">
      {/* Storage Usage */}
      <div className="bg-[#0E0E17] rounded-2xl border border-white/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <HardDrive size={18} className="text-[#7070A0]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">سعة التخزين</h3>
            <p className="text-xs text-[#444460]">Object Storage — Replit</p>
          </div>
          {storageUsage && (
            <div className="mr-auto text-right">
              <span className="text-sm font-bold text-[#C0C0E0]">{usageFmt}</span>
              <span className="text-xs text-[#555570]"> / {limitFmt}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-2.5 bg-white/5 rounded-full animate-pulse" />
        ) : storageUsage ? (
          <>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${usedPct}%`, background: barColor }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-[#444460]">
              <span>{storageUsage.fileCount} ملف محفوظ</span>
              <span className={usedPct > 85 ? 'text-red-400 font-bold' : usedPct > 60 ? 'text-[#FF7900] font-semibold' : 'text-emerald-400'}>
                {usedPct.toFixed(1)}% مستخدم
              </span>
            </div>
            {usedPct > 85 && (
              <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/15 rounded-xl px-3 py-2">
                ⚠️ التخزين يقترب من الحد الأقصى — احذف الملفات غير الضرورية أو رفّع باقتك
              </p>
            )}
          </>
        ) : (
          <div className="text-xs text-[#444460] text-center py-1">تعذّر تحميل بيانات التخزين</div>
        )}
      </div>

      {/* Stats — Applications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="طلبات فنيين معلّقة"   value={stats.pendingTechApps}    icon={FileCheck}  color="orange" loading={loading} subtitle={`إجمالي: ${stats.totalTechApps ?? 0}`} />
        <StatCard title="طلبات شركات معلّقة"   value={stats.pendingCompanyApps} icon={Building2}  color="orange" loading={loading} subtitle={`إجمالي: ${stats.totalCompanyApps ?? 0}`} />
        <StatCard title="طلبات إعلان معلّقة"   value={stats.pendingAdRequests}  icon={Newspaper}  color="orange" loading={loading} subtitle={`مقبولة: ${stats.approvedAdRequests ?? 0}`} />
        <StatCard title="الإعلانات النشطة"      value={stats.activeAds}          icon={Megaphone}  color="green"  loading={loading} />
      </div>

      {/* Stats — General */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="إجمالي الفنيين"      value={stats.totalTechs}         icon={Wrench}        color="navy"   loading={loading} />
        <StatCard title="الفنيون النشطون"     value={stats.activeTechs}        icon={CheckCircle}   color="green"  loading={loading} />
        <StatCard title="الطلبات الجديدة"     value={stats.newRequests}        icon={Clock}         color="orange" loading={loading} />
        <StatCard title="الطلبات المكتملة"    value={stats.completedRequests}  icon={ClipboardList} color="green"  loading={loading} />
        <StatCard title="عدد المدن"           value={stats.totalCities}        icon={MapPin}        color="blue"   loading={loading} />
        <StatCard title="عدد التخصصات"        value={stats.totalCats}          icon={Tag}           color="purple" loading={loading} />
        <StatCard title="المشرفون الفرعيون"   value={stats.subAdmins}          icon={ShieldCheck}   color="navy"   loading={loading} />
        <StatCard title="طلبات إعلان مقبولة"  value={stats.approvedAdRequests} icon={Newspaper}     color="green"  loading={loading} />
      </div>

      {/* Pie + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie */}
        <div className="bg-[#0E0E17] rounded-2xl border border-white/5 p-5">
          <h3 className="font-bold text-white text-sm mb-4">الطلبات حسب الحالة</h3>
          {loading ? (
            <div className="h-48 bg-white/3 rounded-xl animate-pulse" />
          ) : requestsByStatus.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#444460] text-sm">لا توجد طلبات بعد</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={requestsByStatus} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {requestsByStatus.map((entry) => <Cell key={entry.key} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#C0C0E0' }}
                    formatter={(v, n) => [v, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {requestsByStatus.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                    <span className="text-[#8888A8] flex-1">{item.name}</span>
                    <span className="font-bold text-[#C0C0E0]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="bg-[#0E0E17] rounded-2xl border border-white/5 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-bold text-white text-sm">آخر الطلبات</h3>
          </div>
          <div className="divide-y divide-white/3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex gap-3">
                    <div className="h-4 bg-white/5 rounded flex-1 animate-pulse" />
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                ))
              : recentRequests.length === 0
                ? <div className="px-5 py-10 text-center text-[#444460] text-sm">لا توجد طلبات بعد</div>
                : recentRequests.map((r) => (
                    <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-white/2 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#C0C0E0] truncate">{r.customer_name || 'غير محدد'}</p>
                        <p className="text-xs text-[#555570] truncate">
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
      <div className="bg-[#0E0E17] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-bold text-white text-sm">آخر الفنيين المضافين</h3>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}
          </div>
        ) : recentTechs.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#444460] text-sm">لا يوجد فنيون بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/5 text-[#666680]">
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">الاسم</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">التخصص</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">المدينة</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody>
                {recentTechs.map((t, i) => (
                  <tr key={t.id || i} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-[#C0C0E0] font-medium">{t.name_ar || t.name || '—'}</td>
                    <td className="px-4 py-3 text-[#8888A8]">{t.category_id || t.category || '—'}</td>
                    <td className="px-4 py-3 text-[#8888A8]">{t.city_id || t.city || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        (t.is_active ?? t.isActive ?? true) && (t.is_approved ?? t.isApproved ?? true)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/5 text-[#555570] border border-white/8'
                      }`}>
                        {(t.is_active ?? t.isActive ?? true) && (t.is_approved ?? t.isApproved ?? true) ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555570] text-xs">
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
    new:         ['جديد',  'bg-[#FF7900]/10 text-[#FF7900] border-[#FF7900]/20'],
    assigned:    ['مُسند', 'bg-blue-500/10 text-blue-400 border-blue-500/20'],
    in_progress: ['جارٍ',  'bg-purple-500/10 text-purple-400 border-purple-500/20'],
    completed:   ['مكتمل', 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'],
    cancelled:   ['ملغي',  'bg-red-500/10 text-red-400 border-red-500/20'],
  }
  const [label, cls] = map[status] || ['—', 'bg-white/5 text-[#555570] border-white/8']
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${cls}`}>{label}</span>
}
