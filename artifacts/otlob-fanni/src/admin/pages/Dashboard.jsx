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
import { Eye, Share2, Smartphone as SmartphoneIcon, PhoneCall, MessageCircle } from 'lucide-react'

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
  background: '#ffffff',
  border: '1px solid #E8EDF2',
  borderRadius: 12,
  color: '#071B33',
  fontSize: 12,
  padding: '8px 14px',
  boxShadow: '0 4px 16px rgba(7,27,51,0.1)',
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [analytics, setAnalytics] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [recentTechs, setRecentTechs] = useState([])
  const [recentCompanies, setRecentCompanies] = useState([])
  const [requestsByStatus, setRequestsByStatus] = useState([])
  const [storageUsage, setStorageUsage] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = () => {
    setLoading(true)
    Promise.all([
      api.admin.stats(),
      api.admin.storageUsage().catch(() => null),
      api.admin.analytics().catch(() => null),
    ]).then(([s, usage, anl]) => {
      setStats(s)
      setAnalytics(anl)
      setRecentRequests(s.recentRequests || [])
      setRecentTechs(s.recentTechs || [])
      setRecentCompanies(s.recentCompanies || [])
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

  const areaData = (() => {
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
    const counts = Array(7).fill(0)
    recentRequests.forEach(r => {
      if (r.created_at) counts[new Date(r.created_at).getDay()]++
    })
    return days.map((name, i) => ({ name, طلبات: counts[i] }))
  })()

  const appsBarData = [
    { name: 'فنيون', معلّق: stats.pendingTechApps ?? 0, مقبول: (stats.totalTechApps ?? 0) - (stats.pendingTechApps ?? 0) },
    { name: 'شركات', معلّق: stats.pendingCompanyApps ?? 0, مقبول: (stats.totalCompanyApps ?? 0) - (stats.pendingCompanyApps ?? 0) },
    { name: 'إعلانات', معلّق: stats.pendingAdRequests ?? 0, مقبول: stats.approvedAdRequests ?? 0 },
  ]

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور'

  return (
    <div className="space-y-6" dir="rtl">

      {/* ── WELCOME BANNER ────────────────────────────────── */}
      <div className="relative rounded-3xl p-6 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2E52 50%, #FF7900 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 bg-[radial-gradient(circle,white,transparent_70%)]" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-4 left-8 w-20 h-20 rounded-full bg-[#FF7900]/20" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-white leading-tight">لوحة التحكم</h1>
            <p className="text-white/50 text-xs mt-1">
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

      {/* ── ANALYTICS STATS ───────────────────────────────── */}
      <SectionLabel icon={Activity} label="إحصائيات الزيارات والتفاعل" color="text-[#FF7900]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="زيارات (7 أيام)"    value={analytics?.visits?.last7d}      icon={Eye}           gradient="orange" loading={loading} subtitle={`إجمالي: ${(analytics?.visits?.total ?? 0).toLocaleString('en-US')}`} />
        <StatCard title="زوار مختلفون (7 أيام)" value={analytics?.uniqueVisitors?.last7d} icon={Users}      gradient="blue"   loading={loading} subtitle={`شهري: ${analytics?.uniqueVisitors?.last30d ?? 0}`} />
        <StatCard title="نقرات واتساب"        value={analytics?.whatsappClicks}      icon={MessageCircle} gradient="green"  loading={loading} subtitle={`هاتف: ${analytics?.phoneClicks ?? 0}`} />
        <StatCard title="مشاركة / تثبيت"     value={(analytics?.shares ?? 0) + (analytics?.installs ?? 0)} icon={Share2} gradient="purple" loading={loading} subtitle={`مشاركة: ${analytics?.shares ?? 0} · تثبيت: ${analytics?.installs ?? 0}`} />
      </div>

      {/* ── VISITS CHART + DEVICE BREAKDOWN ───────────────── */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
            <ChartHeader icon={Eye} iconBg="bg-orange-50" iconColor="text-[#FF7900]"
              title="الزيارات اليومية — آخر 30 يوم" sub="عدد مرات فتح التطبيق يومياً" />
            {loading ? <Skeleton h="h-44" /> : analytics.dailyVisits?.length === 0 ? (
              <EmptyState label="لا توجد زيارات مسجّلة بعد" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={(analytics.dailyVisits || []).map(d => ({ name: d.day?.slice(5), زيارات: d.count }))}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FF7900" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#FF7900" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EE" />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#CBD5E1', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Area type="monotone" dataKey="زيارات" stroke="#FF7900" strokeWidth={2.5} fill="url(#visitGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
            <ChartHeader icon={SmartphoneIcon} iconBg="bg-blue-50" iconColor="text-blue-500"
              title="توزيع الأجهزة" sub="آخر 30 يوم" />
            {loading ? <Skeleton h="h-36" /> : (analytics.devices || []).length === 0 ? (
              <EmptyState label="لا توجد بيانات بعد" />
            ) : (analytics.devices || []).map(({ device, count }) => {
              const total = (analytics.devices || []).reduce((a, b) => a + b.count, 0) || 1
              const pct = Math.round((count / total) * 100)
              const labels = { mobile: 'جوال', tablet: 'لوحي', desktop: 'حاسوب' }
              const colors = { mobile: '#FF7900', tablet: '#3B82F6', desktop: '#10B981' }
              return (
                <div key={device}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{labels[device] || device}</span>
                    <span className="text-xs font-bold text-[#071B33]">{pct}% ({count})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[device] || '#071B33' }} />
                  </div>
                </div>
              )
            })}
            <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-50 rounded-xl px-3 py-2 border border-orange-100 text-center">
                <p className="text-slate-400">واتساب</p>
                <p className="font-black text-[#FF7900] text-base">{analytics?.whatsappClicks ?? 0}</p>
              </div>
              <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100 text-center">
                <p className="text-slate-400">هاتف</p>
                <p className="font-black text-blue-600 text-base">{analytics?.phoneClicks ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP TECHNICIANS + TOP COMPANIES ────────────────── */}
      {analytics && (analytics.topTechs?.length > 0 || analytics.topCompanies?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {analytics.topTechs?.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
              <ChartHeader icon={Wrench} iconBg="bg-orange-50" iconColor="text-[#FF7900]"
                title="الفنيون الأكثر مشاهدة" sub="آخر 30 يوم" />
              <div className="space-y-1.5">
                {analytics.topTechs.map((t, i) => (
                  <a key={t.id} href={`/admin/technicians?id=${t.id}`}
                    className="flex items-center gap-3 text-sm px-2 py-1.5 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer group">
                    <span className="w-5 text-slate-400 text-xs font-bold text-center flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 text-slate-700 font-semibold truncate group-hover:text-[#FF7900] transition-colors">
                      {t.name || <span className="text-slate-400 font-mono text-xs">{t.id}</span>}
                    </span>
                    <span className="font-black text-[#FF7900] flex-shrink-0">{t.count}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {analytics.topCompanies?.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
              <ChartHeader icon={Building2} iconBg="bg-indigo-50" iconColor="text-indigo-500"
                title="الشركات الأكثر مشاهدة" sub="آخر 30 يوم" />
              <div className="space-y-1.5">
                {analytics.topCompanies.map((c, i) => (
                  <a key={c.id} href={`/admin/companies?id=${c.id}`}
                    className="flex items-center gap-3 text-sm px-2 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer group">
                    <span className="w-5 text-slate-400 text-xs font-bold text-center flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 text-slate-700 font-semibold truncate group-hover:text-indigo-600 transition-colors">
                      {c.name || <span className="text-slate-400 font-mono text-xs">{c.id}</span>}
                    </span>
                    <span className="font-black text-indigo-600 flex-shrink-0">{c.count}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TOP SEARCHES ────────────────── */}
      {analytics?.topSearches?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
            <ChartHeader icon={BarChart3} iconBg="bg-blue-50" iconColor="text-blue-500"
              title="أكثر كلمات البحث" sub="آخر 30 يوم" />
            <div className="space-y-2">
              {analytics.topSearches.map((s, i) => (
                <div key={s.query} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-slate-400 text-xs font-bold text-center">{i + 1}</span>
                  <span className="flex-1 text-slate-600 truncate" dir="rtl">{s.query}</span>
                  <span className="font-black text-blue-600">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DIRECTORY STATS ───────────────────────────────── */}
      <SectionLabel icon={Wrench} label="إحصائيات الفنيين والخدمات" color="text-emerald-600" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الفنيين"    value={stats.totalTechs}        icon={Wrench}       gradient="green"  loading={loading} subtitle={`نشط: ${stats.activeTechs ?? 0}`} />
        <StatCard title="إجمالي الشركات"    value={stats.totalCompanies}     icon={Building2}    gradient="indigo" loading={loading} />
        <StatCard title="الطلبات المكتملة"  value={stats.completedRequests}  icon={CheckCircle}  gradient="teal"   loading={loading} subtitle={`جديدة: ${stats.newRequests ?? 0}`} />
        <StatCard title="الإعلانات النشطة"  value={stats.activeAds}          icon={Megaphone}    gradient="rose"   loading={loading} />
      </div>

      {/* ── PENDING STATS ─────────────────────────────────── */}
      <SectionLabel icon={ClipboardList} label="الطلبات المعلّقة" color="text-amber-600" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="طلبات فنيين معلّقة"  value={stats.pendingTechApps}    icon={FileCheck}  gradient="orange" loading={loading} subtitle={`إجمالي: ${stats.totalTechApps ?? 0}`} />
        <StatCard title="طلبات شركات معلّقة"  value={stats.pendingCompanyApps} icon={Building2}  gradient="rose"   loading={loading} subtitle={`إجمالي: ${stats.totalCompanyApps ?? 0}`} />
        <StatCard title="طلبات إعلان معلّقة"  value={stats.pendingAdRequests}  icon={Newspaper}  gradient="purple" loading={loading} subtitle={`مقبولة: ${stats.approvedAdRequests ?? 0}`} />
        <StatCard title="الطلبات الجديدة"     value={stats.newRequests}         icon={Clock}      gradient="blue"   loading={loading} />
      </div>

      {/* ── CHARTS ROW ───────────────────────────────────── */}
      <SectionLabel icon={BarChart3} label="الرسوم البيانية" color="text-blue-600" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
          <ChartHeader icon={BarChart3} iconBg="bg-orange-50" iconColor="text-[#FF7900]"
            title="الطلبات — آخر 7 أيام" sub="توزيع الطلبات حسب اليوم" />
          {loading ? <Skeleton h="h-44" /> : !areaData.some(d => d.طلبات > 0) ? (
            <EmptyState label="لا توجد طلبات مسجّلة بعد" icon={ClipboardList} sub="سيظهر المخطط تلقائياً عند أول طلب خدمة" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF7900" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF7900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EE" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#CBD5E1', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ stroke: 'rgba(255,121,0,0.15)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="طلبات" stroke="#FF7900" strokeWidth={2.5} fill="url(#reqGrad)" dot={{ fill: '#FF7900', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
          <ChartHeader icon={ClipboardList} iconBg="bg-violet-50" iconColor="text-violet-500"
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
                    <span className="text-slate-500 flex-1">{item.name}</span>
                    <span className="font-black text-[#071B33]">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── APPLICATIONS BAR + QUICK STATS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Grouped bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
          <ChartHeader icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-500"
            title="الطلبات المقدّمة" sub="معلّق مقابل مقبول" />
          {loading ? <Skeleton h="h-36" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={appsBarData} barSize={22} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EE" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#CBD5E1', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill: 'rgba(7,27,51,0.03)' }} />
                <Bar dataKey="معلّق" fill="#FF7900" radius={[6, 6, 0, 0]} />
                <Bar dataKey="مقبول" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick counts */}
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
          <ChartHeader icon={BarChart3} iconBg="bg-emerald-50" iconColor="text-emerald-500"
            title="إحصائيات سريعة" sub="" />
          {[
            { label: 'عدد المدن',         value: stats.totalCities,  color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    icon: MapPin },
            { label: 'عدد التخصصات',      value: stats.totalCats,    color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100',  icon: Tag },
            { label: 'فنيون نشطون',        value: stats.activeTechs,  color: 'text-[#FF7900]',   bg: 'bg-orange-50',  border: 'border-orange-100',  icon: UserCheck },
            { label: 'المشرفون الفرعيون', value: stats.subAdmins,    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: ShieldCheck },
          ].map(({ label, value, color, bg, border, icon: Icon }) => (
            <div key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3 border ${border}`}>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 border ${border}`}>
                <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
              </div>
              <span className="text-slate-500 text-sm flex-1 leading-tight">{label}</span>
              {loading
                ? <div className="h-5 w-8 bg-slate-200 rounded animate-pulse" />
                : <span className={`font-black text-lg ${color}`}>{(value ?? 0).toLocaleString('en-US')}</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT REQUESTS ──────────────────────────────── */}
      <SectionLabel icon={ClipboardList} label="آخر الطلبات" color="text-[#FF7900]" />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
            <ClipboardList className="w-4 h-4 text-[#FF7900]" />
          </div>
          <h3 className="font-bold text-[#071B33] text-sm flex-1">آخر الطلبات</h3>
          {!loading && <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{recentRequests.length} طلب</span>}
        </div>
        <div className="divide-y divide-slate-50">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex gap-3">
                  <div className="h-4 bg-slate-100 rounded flex-1 animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              ))
            : recentRequests.length === 0
              ? <EmptyState label="لا توجد طلبات بعد" icon={ClipboardList} sub="ستظهر طلبات الخدمة هنا عند استقبالها" />
              : recentRequests.map(r => (
                  <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-orange-50/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#071B33] truncate">{r.customer_name || 'غير محدد'}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
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
      <SectionLabel icon={Wrench} label="آخر الفنيين المضافين" color="text-emerald-600" />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-[#071B33] text-sm flex-1">آخر الفنيين المضافين</h3>
          {!loading && <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{recentTechs.length} فني</span>}
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recentTechs.length === 0 ? (
          <EmptyState label="لا يوجد فنيون بعد" icon={Wrench} sub="سيظهر الفنيون هنا بعد قبول طلباتهم" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['الاسم', 'التخصص', 'المدينة', 'الحالة', 'تاريخ الإضافة'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-black text-[#071B33] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTechs.map((t, i) => (
                  <tr key={t.id || i} className="border-b border-slate-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-[#071B33] font-semibold whitespace-nowrap">{t.nameAr || t.nameEn || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{t.categoryId || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{t.cityId || '—'}</td>
                    <td className="px-5 py-3.5">
                      {t.isActive && t.isApproved
                        ? <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">● نشط</span>
                        : <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-400 ring-1 ring-slate-200">● معلّق</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── RECENT COMPANIES ─────────────────────────────── */}
      <SectionLabel icon={Building2} label="آخر الشركات المضافة" color="text-blue-600" />
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-[#071B33] text-sm flex-1">آخر الشركات المضافة</h3>
          {!loading && <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{recentCompanies.length} شركة</span>}
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recentCompanies.length === 0 ? (
          <EmptyState label="لا يوجد شركات بعد" icon={Building2} sub="ستظهر الشركات هنا بعد قبول طلباتها" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['الاسم', 'التخصص', 'المدينة', 'الحالة', 'تاريخ الإضافة'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-black text-[#071B33] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCompanies.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-[#071B33] font-semibold whitespace-nowrap">{c.companyName || c.nameAr || c.name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{c.specialty || c.categoryId || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{c.city || c.cityId || '—'}</td>
                    <td className="px-5 py-3.5">
                      {c.status === 'approved'
                        ? <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">● مقبول</span>
                        : c.status === 'rejected'
                        ? <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-red-50 text-red-500 ring-1 ring-red-200">● مرفوض</span>
                        : <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-600 ring-1 ring-amber-200">● معلّق</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── STORAGE ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
            <HardDrive className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#071B33] text-sm">سعة التخزين</h3>
            <p className="text-slate-400 text-xs">Object Storage</p>
          </div>
          {storageUsage && (
            <div className="text-left">
              <span className="text-sm font-black text-[#071B33]">{usageFmt}</span>
              <span className="text-xs text-slate-400"> / {limitFmt}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-3 bg-slate-100 rounded-full animate-pulse" />
        ) : storageUsage ? (
          <>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${usedPct}%`, background: `linear-gradient(90deg, ${barColor}cc, ${barColor})` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">{storageUsage.fileCount} ملف محفوظ</span>
              <span className={`font-black ${usedPct > 85 ? 'text-red-500' : usedPct > 60 ? 'text-[#FF7900]' : 'text-emerald-600'}`}>
                {usedPct.toFixed(1)}% مستخدم
              </span>
            </div>
            {usedPct > 85 && (
              <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                ⚠️ التخزين يقترب من الحد الأقصى — احذف الملفات غير الضرورية
              </p>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-400 text-center py-2">تعذّر تحميل بيانات التخزين</div>
        )}
      </div>

    </div>
  )
}

/* ── helpers ─────────────────────────────────────────────── */

function SectionLabel({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2.5 pt-2">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-xs font-black ${color} tracking-wide`}>{label}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
    </div>
  )
}

function ChartHeader({ icon: Icon, iconBg, iconColor, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-[#071B33] font-bold text-sm leading-tight">{title}</h3>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Skeleton({ h }) {
  return <div className={`${h} bg-slate-100 rounded-xl animate-pulse`} />
}

function EmptyState({ label, icon: Icon = BarChart3, sub = 'ستظهر هنا تلقائياً عند وجود بيانات' }) {
  return (
    <div className="py-10 flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-slate-600 text-sm font-bold">{label}</p>
        <p className="text-slate-400 text-xs mt-1">{sub}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    new:         ['جديد',   'bg-orange-50 text-[#FF7900] ring-orange-200'],
    assigned:    ['مُسند',  'bg-blue-50 text-blue-600 ring-blue-200'],
    in_progress: ['جارٍ',   'bg-violet-50 text-violet-600 ring-violet-200'],
    completed:   ['مكتمل',  'bg-emerald-50 text-emerald-600 ring-emerald-200'],
    cancelled:   ['ملغي',   'bg-red-50 text-red-500 ring-red-200'],
  }
  const [label, cls] = map[status] || ['—', 'bg-slate-100 text-slate-400 ring-slate-200']
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold ring-1 whitespace-nowrap ${cls}`}>{label}</span>
}
