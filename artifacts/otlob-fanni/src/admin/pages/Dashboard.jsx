import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import {
  Wrench, Users, MapPin, ClipboardList, Tag, Megaphone,
  CheckCircle, Clock, ShieldCheck, Newspaper, Building2, FileCheck,
  HardDrive, TrendingUp, AlertCircle, BarChart3, RefreshCw,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
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

const CUSTOM_TOOLTIP_STYLE = {
  background: '#111120',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#E0E0F0',
  fontSize: 12,
  padding: '8px 12px',
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])
  const [recentTechs, setRecentTechs] = useState([])
  const [requestsByStatus, setRequestsByStatus] = useState([])
  const [storageUsage, setStorageUsage] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = () => {
    setLoading(true)
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
      setLastRefresh(new Date())
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const usedMB  = storageUsage ? (storageUsage.usedBytes  / (1024 * 1024)).toFixed(1) : null
  const limitMB = storageUsage ? (storageUsage.limitBytes / (1024 * 1024)).toFixed(0) : null
  const usedPct = storageUsage ? Math.min(100, (storageUsage.usedBytes / storageUsage.limitBytes) * 100) : 0
  const usageFmt = usedMB !== null ? (usedMB >= 1024 ? `${(usedMB/1024).toFixed(2)} GB` : `${usedMB} MB`) : null
  const limitFmt = limitMB !== null ? (limitMB >= 1024 ? `${(limitMB/1024).toFixed(0)} GB` : `${limitMB} MB`) : null
  const barColor = usedPct > 85 ? '#EF4444' : usedPct > 60 ? '#FF7900' : '#10B981'

  // Build bar-chart data from recent requests by day
  const chartData = (() => {
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
    const counts = Array(7).fill(0)
    recentRequests.forEach(r => {
      if (r.created_at) {
        const d = new Date(r.created_at).getDay()
        counts[d]++
      }
    })
    return days.map((name, i) => ({ name, طلبات: counts[i] }))
  })()

  // Applications bar data
  const appsBarData = [
    { name: 'فنيون', pending: stats.pendingTechApps ?? 0, total: stats.totalTechApps ?? 0 },
    { name: 'شركات', pending: stats.pendingCompanyApps ?? 0, total: stats.totalCompanyApps ?? 0 },
    { name: 'إعلانات', pending: stats.pendingAdRequests ?? 0, total: stats.approvedAdRequests ?? 0 },
  ]

  return (
    <div className="space-y-6" dir="rtl">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">لوحة الإحصائيات</h1>
          <p className="text-[#8888A8] text-sm mt-0.5">
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl ring-1 ring-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* PRIMARY STATS — 4 hero cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الفنيين"     value={stats.totalTechs}        icon={Wrench}    color="orange" loading={loading} subtitle={`نشط: ${stats.activeTechs ?? 0}`} />
        <StatCard title="إجمالي الشركات"     value={stats.totalCompanies}     icon={Building2} color="blue"   loading={loading} />
        <StatCard title="الطلبات المكتملة"   value={stats.completedRequests}  icon={CheckCircle} color="green" loading={loading} subtitle={`جديدة: ${stats.newRequests ?? 0}`} />
        <StatCard title="الإعلانات النشطة"   value={stats.activeAds}          icon={Megaphone} color="purple" loading={loading} />
      </div>

      {/* SECONDARY STATS — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="طلبات فنيين معلّقة"  value={stats.pendingTechApps}    icon={FileCheck}  color="orange" loading={loading} subtitle={`إجمالي: ${stats.totalTechApps ?? 0}`} />
        <StatCard title="طلبات شركات معلّقة"  value={stats.pendingCompanyApps} icon={Building2}  color="red"    loading={loading} subtitle={`إجمالي: ${stats.totalCompanyApps ?? 0}`} />
        <StatCard title="طلبات إعلان معلّقة"  value={stats.pendingAdRequests}  icon={Newspaper}  color="teal"   loading={loading} subtitle={`مقبولة: ${stats.approvedAdRequests ?? 0}`} />
        <StatCard title="الطلبات الجديدة"     value={stats.newRequests}        icon={Clock}      color="navy"   loading={loading} />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart — requests by day */}
        <div className="lg:col-span-2 bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#FF7900]/15 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#FF7900]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">الطلبات — آخر 7 أيام</h3>
              <p className="text-[#555570] text-xs">توزيع الطلبات حسب اليوم</p>
            </div>
          </div>
          {loading ? (
            <div className="h-44 bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: '#8888A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="طلبات" fill="#FF7900" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — requests by status */}
        <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-500/15 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">الطلبات حسب الحالة</h3>
              <p className="text-[#555570] text-xs">توزيع نسبي</p>
            </div>
          </div>
          {loading ? (
            <div className="h-44 bg-white/5 rounded-xl animate-pulse" />
          ) : requestsByStatus.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-[#333350]" />
              <p className="text-[#444460] text-sm">لا توجد طلبات بعد</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={requestsByStatus} dataKey="value" cx="50%" cy="45%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {requestsByStatus.map(e => <Cell key={e.key} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!loading && requestsByStatus.length > 0 && (
            <div className="space-y-2 mt-2">
              {requestsByStatus.map(item => (
                <div key={item.key} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                  <span className="text-[#8888A8] flex-1">{item.name}</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* APPLICATIONS BAR + QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Applications grouped bar */}
        <div className="lg:col-span-2 bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">الطلبات المقدّمة</h3>
              <p className="text-[#555570] text-xs">معلّق مقابل مقبول / إجمالي</p>
            </div>
          </div>
          {loading ? (
            <div className="h-36 bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={appsBarData} barSize={24} barGap={4}>
                <XAxis dataKey="name" tick={{ fill: '#8888A8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="pending" name="معلّق"   fill="#FF7900"  radius={[6, 6, 0, 0]} />
                <Bar dataKey="total"   name="الإجمالي" fill="#3B82F6"  radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick counts */}
        <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-500/15 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-white font-bold text-sm">إحصائيات سريعة</h3>
          </div>
          {[
            { label: 'عدد المدن',        value: stats.totalCities,  color: 'text-blue-400',    icon: MapPin },
            { label: 'عدد التخصصات',     value: stats.totalCats,    color: 'text-violet-400',  icon: Tag },
            { label: 'المشرفون الفرعيون', value: stats.subAdmins,   color: 'text-emerald-400', icon: ShieldCheck },
            { label: 'فنيون نشطون',       value: stats.activeTechs, color: 'text-[#FF7900]',   icon: Users },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-3">
              <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} strokeWidth={1.8} />
              <span className="text-[#8888A8] text-sm flex-1">{label}</span>
              {loading
                ? <div className="h-5 w-8 bg-white/8 rounded animate-pulse" />
                : <span className={`font-black text-lg ${color}`}>{(value ?? 0).toLocaleString('en-US')}</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* RECENT REQUESTS TABLE */}
      <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FF7900]/15 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-[#FF7900]" />
          </div>
          <h3 className="font-bold text-white text-sm">آخر الطلبات</h3>
          {!loading && <span className="text-xs text-[#555570] mr-auto">{recentRequests.length} طلب</span>}
        </div>
        <div className="divide-y divide-white/4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <div className="h-4 bg-white/6 rounded flex-1 animate-pulse" />
                  <div className="h-4 w-20 bg-white/6 rounded animate-pulse" />
                </div>
              ))
            : recentRequests.length === 0
              ? (
                <div className="px-5 py-12 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-[#333350]" />
                  <p className="text-[#444460] text-sm">لا توجد طلبات بعد</p>
                </div>
              )
              : recentRequests.map(r => (
                  <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-white/2 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{r.customer_name || 'غير محدد'}</p>
                      <p className="text-xs text-[#666680] truncate mt-0.5">
                        {r.category_name || r.category_id || '—'} &nbsp;·&nbsp; {r.city_name || r.city_id || '—'} &nbsp;·&nbsp; {r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '—'}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))
          }
        </div>
      </div>

      {/* RECENT TECHS */}
      <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <h3 className="font-bold text-white text-sm">آخر الفنيين المضافين</h3>
          {!loading && <span className="text-xs text-[#555570] mr-auto">{recentTechs.length} فني</span>}
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : recentTechs.length === 0 ? (
          <div className="px-5 py-12 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-[#333350]" />
            <p className="text-[#444460] text-sm">لا يوجد فنيون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/6">
                  {['الاسم', 'التخصص', 'المدينة', 'الحالة', 'تاريخ الإضافة'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-bold text-[#8888A8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTechs.map((t, i) => (
                  <tr key={t.id || i} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 text-white font-semibold whitespace-nowrap">{t.name_ar || t.name || '—'}</td>
                    <td className="px-5 py-3.5 text-[#8888A8] whitespace-nowrap">{t.category_id || t.category || '—'}</td>
                    <td className="px-5 py-3.5 text-[#8888A8] whitespace-nowrap">{t.city_id || t.city || '—'}</td>
                    <td className="px-5 py-3.5">
                      {(t.is_active ?? t.isActive ?? true) && (t.is_approved ?? t.isApproved ?? true)
                        ? <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/25">● نشط</span>
                        : <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-white/6 text-[#666680] ring-1 ring-white/10">● غير نشط</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-[#666680] text-xs whitespace-nowrap">
                      {t.created_at || t.approvedAt ? new Date(t.created_at || t.approvedAt).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STORAGE */}
      <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-white/6 rounded-xl flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-[#8888A8]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">سعة التخزين</h3>
            <p className="text-[#555570] text-xs">Object Storage — Replit</p>
          </div>
          {storageUsage && (
            <div className="text-right">
              <span className="text-sm font-bold text-white">{usageFmt}</span>
              <span className="text-xs text-[#555570]"> / {limitFmt}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-3 bg-white/6 rounded-full animate-pulse" />
        ) : storageUsage ? (
          <>
            <div className="w-full h-3 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${usedPct}%`, background: barColor }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#555570]">{storageUsage.fileCount} ملف محفوظ</span>
              <span className={`font-bold ${usedPct > 85 ? 'text-red-400' : usedPct > 60 ? 'text-[#FF7900]' : 'text-emerald-400'}`}>
                {usedPct.toFixed(1)}% مستخدم
              </span>
            </div>
            {usedPct > 85 && (
              <p className="mt-4 text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
                ⚠️ التخزين يقترب من الحد الأقصى — احذف الملفات غير الضرورية أو رفّع باقتك
              </p>
            )}
          </>
        ) : (
          <div className="text-xs text-[#444460] text-center py-2">تعذّر تحميل بيانات التخزين</div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    new:         ['جديد',   'bg-[#FF7900]/12 text-[#FF7900] ring-[#FF7900]/25'],
    assigned:    ['مُسند',  'bg-blue-500/12 text-blue-400 ring-blue-500/25'],
    in_progress: ['جارٍ',   'bg-violet-500/12 text-violet-400 ring-violet-500/25'],
    completed:   ['مكتمل',  'bg-emerald-500/12 text-emerald-400 ring-emerald-500/25'],
    cancelled:   ['ملغي',   'bg-red-500/12 text-red-400 ring-red-500/25'],
  }
  const [label, cls] = map[status] || ['—', 'bg-white/6 text-[#666680] ring-white/12']
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ring-1 whitespace-nowrap ${cls}`}>{label}</span>
}
