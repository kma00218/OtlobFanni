export default function StatCard({ title, value, icon: Icon, color = 'orange', subtitle, loading }) {
  const colors = {
    orange: { bg: 'bg-[#FF7900]/10', icon: 'text-[#FF7900]', border: 'border-[#FF7900]/20' },
    navy: { bg: 'bg-[#071B33]/10', icon: 'text-[#071B33]', border: 'border-[#071B33]/20' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  }
  const c = colors[color] || colors.orange

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-[#071B33]">{value ?? 0}</p>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${c.bg} p-3 rounded-xl`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  )
}
