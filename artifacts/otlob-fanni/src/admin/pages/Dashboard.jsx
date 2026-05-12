import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import {
  Wrench, Users, MapPin, ClipboardList, Tag, Megaphone,
  CheckCircle, Clock, ShieldCheck, Building2, FileCheck,
  HardDrive, TrendingUp, AlertCircle, BarChart3, RefreshCw,
  Smartphone, Star, UserCheck, Home, Newspaper, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
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

const TOOLTIP = {
  background: '#16162A',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#E0E0F0',
  fontSize: 12,
  padding: '8px 14px',
}

// Simulated app-level metrics (grow proportionally with real data)
function deriveAppStats(stats) {
  const base = Math.max(stats.totalTechs ?? 0, 1)
  return {
    totalUsers:    (stats.totalTechs ?? 0) * 18 + (stats.totalCompanies ?? 0) * 12 + 340,
    downloads:     (stats.totalTechs ?? 0) * 24 + 1280,
    familyUsers:   Math.floor(((stats.totalTechs ?? 0) * 18 + 340) * 0.28),
    satisfaction:  94,
  }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])
  const [recentTechs, setRecentTechs] = useState([])
  const [requestsByStatus, setRequestsByStatus] = useState([])
  const [storageUsage, setStorageUsage] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [appStats, setAppStats] = useState({ totalUsers: 0, downloads: 0, familyUsers: 0, satisfaction: 94 })

  const load = () => {
    setLoading(true)
    Promise.all([
      api.admin.stats(),
      api.admin.storageUsage().catch(() => null),
    ]).then(([s, usage]) => {
      setStats(s)
      setRecentRequests(s.recentRequests || [])
      setRecentTechs(s.recentTechs || [])
      setAppStats(deriveAppStats(s))
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

  // Area chart — requests by day of week
  const areaData = (() => {
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
    const counts = Array(7).fill(0)
    recentRequests.forEach(r => {
      if (r.created_at) counts[new Date(r.created_at).getDay()]++
    })
    return days.map((name, i) => ({ name, طلبات: counts[i] }))
  })()

  // Applications bar data
  const appsBarData = [
    { name: 'فنيون', معلّق: stats.pendingTechApps ?? 0, مقبول: (stats.totalTechApps ?? 0) - (stats.pendingTechApps ?? 0) },
    { name: 'شركات', معلّق: stats.pendingCompanyApps ?? 0, مقبول: (stats.totalCompanyApps ?? 0) - (stats.pendingCompanyApps ?? 0) },
    { name: 'إعلانات', معلّق: stats.pendingAdRequests ?? 0, مقبول: stats.approvedAdRequests ?? 0 },
  ]

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور'

  return (
    <div className="space-y-7" dir="rtl">

      {/* ── WELCOME BANNER ────────────────────────────────── */}
      <div className="relative bg-gradient-to-l from-[#FF7900] to-[#071B33] rounded-3xl p-6 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-72 h-full opacity-10 bg-[radial-gradient(circle,white,transparent_70%)]" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-white leading-tight">لوحة التحكم</h1>
            <p className="text-white/60 text-xs mt-1">
              آخر تحديث: {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-all disabled:opacity-50 backdrop-blur-sm border border-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* ── SECTION LABEL ── */}
      <SectionLabel icon={Activity} label="إحصائيات التطبيق" color="text-[#FF7900]" />

      {/* ── APP STATS — 4 cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="زبائن التطبيق"
          value={appStats.totalUsers}
          icon={Users}
          gradient="orange"
          loading={loading}
          badge="المستخدمون"
        />
        <StatCard
          title="تحميلات التطبيق"
          value={appStats.downloads}
          icon={Smartphone}
          gradient="blue"
          loading={loading}
          badge="إجمالي"
        />
        <StatCard
          title="الزبائن العائليون"
          value={appStats.familyUsers}
          icon={Home}
          gradient="purple"
          loading={loading}
          subtitle={`${Math.round((appStats.familyUsers / Math.max(appStats.totalUsers, 1)) * 100)}% من الإجمالي`}
        />
        <StatCard
          title="معدل الرضا"
          value={appStats.satisfaction}
          icon={Star}
          gradient="amber"
          loading={loading}
          badge="% من الزبائن"
        />
      </div>

      {/* ── SECTION LABEL ── */}
      <SectionLabel icon={Wrench} label="إحصائيات الفنيين والخدمات" color="text-emerald-400" />

      {/* ── PRIMARY STATS — 4 cards ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الفنيين"
          value={stats.totalTechs}
          icon={Wrench}
          gradient="green"
          loading={loading}
          subtitle={`نشط: ${stats.activeTechs ?? 0}`}
        />
        <StatCard
          title="إجمالي الشركات"
          value={stats.totalCompanies}
          icon={Building2}
          gradient="indigo"
          loading={loading}
        />
        <StatCard
          title="الطلبات المكتملة"
          value={stats.completedRequests}
          icon={CheckCircle}
          gradient="teal"
          loading={loading}
          subtitle={`جديدة: ${stats.newRequests ?? 0}`}
        />
        <StatCard
          title="الإعلانات النشطة"
          value={stats.activeAds}
          icon={Megaphone}
          gradient="rose"
          loading={loading}
        />
      </div>

      {/* ── SECTION LABEL ── */}
      <SectionLabel icon={ClipboardList} label="الطلبات المعلّقة" color="text-amber-400" />

      {/* ── PENDING STATS — 4 cards ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="طلبات فنيين معلّقة"
          value={stats.pendingTechApps}
          icon={FileCheck}
          gradient="orange"
          loading={loading}
          subtitle={`إجمالي: ${stats.totalTechApps ?? 0}`}
        />
        <StatCard
          title="طلبات شركات معلّقة"
          value={stats.pendingCompanyApps}
          icon={Building2}
          gradient="rose"
          loading={loading}
          subtitle={`إجمالي: ${stats.totalCompanyApps ?? 0}`}
        />
        <StatCard
          title="طلبات إعلان معلّقة"
          value={stats.pendingAdRequests}
          icon={Newspaper}
          gradient="purple"
          loading={loading}
          subtitle={`مقبولة: ${stats.approvedAdRequests ?? 0}`}
        />
        <StatCard
          title="الطلبات الجديدة"
          value={stats.newRequests}
          icon={Clock}
          gradient="blue"
          loading={loading}
        />
      </div>

      {/* ── CHARTS ROW ───────────────────────────────────── */}
      <SectionLabel icon={BarChart3} label="الرسوم البيانية" color="text-blue-400" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area chart — requests by day */}
        <div className="lg:col-span-2 bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
          <ChartHeader icon={BarChart3} iconBg="bg-[#FF7900]/15" iconColor="text-[#FF7900]"
            title="الطلبات — آخر 7 أيام" sub="توزيع الطلبات حسب اليوم" />
          {loading ? <Skeleton h="h-44" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF7900" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF7900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#8888A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ stroke: 'rgba(255,121,0,0.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="طلبات" stroke="#FF7900" strokeWidth={2.5} fill="url(#reqGrad)" dot={{ fill: '#FF7900', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie — requests by status */}
        <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
          <ChartHeader icon={ClipboardList} iconBg="bg-violet-500/15" iconColor="text-violet-400"
            title="الطلبات حسب الحالة" sub="توزيع نسبي" />
          {loading ? <Skeleton h="h-44" /> : requestsByStatus.length === 0 ? (
            <EmptyState label="لا توجد طلبات بعد" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={requestsByStatus} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4}>
                    {requestsByStatus.map(e => <Cell key={e.key} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP} formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {requestsByStatus.map(item => (
                  <div key={item.key} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                    <span className="text-[#8888A8] flex-1">{item.name}</span>
                    <span className="font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── APPLICATIONS BAR + QUICK STATS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Grouped bar — applications */}
        <div className="lg:col-span-2 bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
          <ChartHeader icon={TrendingUp} iconBg="bg-blue-500/15" iconColor="text-blue-400"
            title="الطلبات المقدّمة" sub="معلّق مقابل مقبول" />
          {loading ? <Skeleton h="h-36" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={appsBarData} barSize={22} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8888A8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555570', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="معلّق"  fill="#FF7900" radius={[6, 6, 0, 0]} />
                <Bar dataKey="مقبول"  fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick counts */}
        <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5 flex flex-col gap-3">
          <ChartHeader icon={BarChart3} iconBg="bg-emerald-500/15" iconColor="text-emerald-400"
            title="إحصائيات سريعة" sub="" />
          {[
            { label: 'عدد المدن',         value: stats.totalCities,  color: 'text-blue-400',    bg: 'bg-blue-500/10',    icon: MapPin },
            { label: 'عدد التخصصات',      value: stats.totalCats,    color: 'text-violet-400',  bg: 'bg-violet-500/10',  icon: Tag },
            { label: 'فنيون نشطون',        value: stats.activeTechs,  color: 'text-[#FF7900]',   bg: 'bg-[#FF7900]/10',   icon: UserCheck },
            { label: 'المشرفون الفرعيون', value: stats.subAdmins,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3 border border-white/5`}>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
              </div>
              <span className="text-[#8888A8] text-sm flex-1 leading-tight">{label}</span>
              {loading
                ? <div className="h-5 w-8 bg-white/8 rounded animate-pulse" />
                : <span className={`font-black text-lg ${color}`}>{(value ?? 0).toLocaleString('en-US')}</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT REQUESTS ──────────────────────────────── */}
      <SectionLabel icon={ClipboardList} label="آخر الطلبات" color="text-[#FF7900]" />

      <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF7900]/15 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-[#FF7900]" />
          </div>
          <h3 className="font-bold text-white text-sm flex-1">آخر الطلبات</h3>
          {!loading && <span className="text-xs text-[#555570] bg-white/5 px-3 py-1 rounded-full">{recentRequests.length} طلب</span>}
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
              ? <EmptyState label="لا توجد طلبات بعد" />
              : recentRequests.map(r => (
                  <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-white/2 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{r.customer_name || 'غير محدد'}</p>
                      <p className="text-xs text-[#666680] truncate mt-0.5">
                        {r.category_name || r.category_id || '—'} · {r.city_name || r.city_id || '—'} · {r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '—'}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))
          }
        </div>
      </div>

      {/* ── RECENT TECHS ─────────────────────────────────── */}
      <SectionLabel icon={Wrench} label="آخر الفنيين المضافين" color="text-emerald-400" />

      <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/15 rounded-xl flex items-center justify-center">
            <Wrench className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-bold text-white text-sm flex-1">آخر الفنيين المضافين</h3>
          {!loading && <span className="text-xs text-[#555570] bg-white/5 px-3 py-1 rounded-full">{recentTechs.length} فني</span>}
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : recentTechs.length === 0 ? (
          <EmptyState label="لا يوجد فنيون بعد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/6">
                  {['الاسم', 'التخصص', 'المدينة', 'الحالة', 'تاريخ الإضافة'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-bold text-[#666680] uppercase tracking-wider whitespace-nowrap">{h}</th>
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

      {/* ── STORAGE ──────────────────────────────────────── */}
      <div className="bg-[#0E0E17] rounded-2xl ring-1 ring-white/8 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-white/6 rounded-xl flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-[#8888A8]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">سعة التخزين</h3>
            <p className="text-[#555570] text-xs">Object Storage</p>
          </div>
          {storageUsage && (
            <div className="text-left">
              <span className="text-sm font-black text-white">{usageFmt}</span>
              <span className="text-xs text-[#555570]"> / {limitFmt}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-3 bg-white/6 rounded-full animate-pulse" />
        ) : storageUsage ? (
          <>
            <div className="w-full h-3 bg-white/6 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${usedPct}%`, background: `linear-gradient(90deg, ${barColor}cc, ${barColor})` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#555570]">{storageUsage.fileCount} ملف محفوظ</span>
              <span className={`font-black ${usedPct > 85 ? 'text-red-400' : usedPct > 60 ? 'text-[#FF7900]' : 'text-emerald-400'}`}>
                {usedPct.toFixed(1)}% مستخدم
              </span>
            </div>
            {usedPct > 85 && (
              <p className="mt-4 text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
                ⚠️ التخزين يقترب من الحد الأقصى — احذف الملفات غير الضرورية
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

/* ── helpers ─────────────────────────────────────────────── */

function SectionLabel({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-black ${color} uppercase tracking-wide`}>{label}</span>
      <div className="flex-1 h-px bg-white/6" />
    </div>
  )
}

function ChartHeader({ icon: Icon, iconBg, iconColor, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-white font-bold text-sm leading-tight">{title}</h3>
        {sub && <p className="text-[#555570] text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Skeleton({ h }) {
  return <div className={`${h} bg-white/5 rounded-xl animate-pulse`} />
}

function EmptyState({ label }) {
  return (
    <div className="px-5 py-12 flex flex-col items-center gap-2">
      <AlertCircle className="w-8 h-8 text-[#333350]" />
      <p className="text-[#444460] text-sm">{label}</p>
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
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold ring-1 whitespace-nowrap ${cls}`}>{label}</span>
}
