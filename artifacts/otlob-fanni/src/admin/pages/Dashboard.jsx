import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import StatCard from '../components/StatCard'
import {
  Wrench, Users, MapPin, ClipboardList, Tag, Megaphone,
  CheckCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatCard title="إجمالي الفنيين" value={stats.totalTechs} icon={Wrench} color="navy" loading={loading} />
        <StatCard title="الفنيون النشطون" value={stats.activeTechs} icon={CheckCircle} color="green" loading={loading} />
        <StatCard title="الطلبات الجديدة" value={stats.newRequests} icon={Clock} color="orange" loading={loading} />
        <StatCard title="الطلبات المكتملة" value={stats.completedRequests} icon={CheckCircle} color="green" loading={loading} />
        <StatCard title="عدد المدن" value={stats.totalCities} icon={MapPin} color="blue" loading={loading} />
        <StatCard title="عدد التخصصات" value={stats.totalCats} icon={Tag} color="purple" loading={loading} />
        <StatCard title="الإعلانات النشطة" value={stats.activeAds} icon={Megaphone} color="orange" loading={loading} />
        <StatCard title="المشرفون الفرعيون" value={stats.subAdmins} icon={Users} color="navy" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Requests by status - Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#071B33] mb-4">الطلبات حسب الحالة</h3>
          {loading ? (
            <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
          ) : requestsByStatus.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={160}>
                <PieChart>
                  <Pie data={requestsByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                    {requestsByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {requestsByStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                    <span className="text-gray-600 flex-1">{item.name}</span>
                    <span className="font-bold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Techs by city - Bar */}
        {isSuperAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-[#071B33] mb-4">الفنيون حسب المدينة</h3>
            {loading ? (
              <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
            ) : techsByCity.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={techsByCity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF7900" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-[#071B33]">آخر الطلبات</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3">
                  <div className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            ) : recentRequests.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">لا توجد طلبات</div>
            ) : (
              recentRequests.map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.customer_name || 'غير محدد'}</p>
                    <p className="text-xs text-gray-400">{r.cities?.name_ar || '—'} · {new Date(r.created_at).toLocaleDateString('ar-LY')}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Technicians */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-[#071B33]">آخر الفنيين المضافين</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3">
                  <div className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            ) : recentTechs.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">لا يوجد فنيون</div>
            ) : (
              recentTechs.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.name_ar}</p>
                    <p className="text-xs text-gray-400">{t.cities?.name_ar || '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'available' ? 'bg-green-50 text-green-600'
                    : t.status === 'busy' ? 'bg-amber-50 text-amber-600'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.status === 'available' ? 'متاح' : t.status === 'busy' ? 'مشغول' : 'غير نشط'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    new: ['جديد', 'bg-orange-50 text-[#FF7900]'],
    assigned: ['مُسند', 'bg-blue-50 text-blue-600'],
    in_progress: ['جارٍ', 'bg-purple-50 text-purple-600'],
    completed: ['مكتمل', 'bg-green-50 text-green-600'],
    cancelled: ['ملغي', 'bg-red-50 text-red-500'],
  }
  const [label, cls] = map[status] || ['—', 'bg-gray-100 text-gray-500']
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}
