export default function StatCard({ title, value, icon: Icon, color = 'orange', subtitle, loading }) {
  const colors = {
    orange: { bg: 'bg-[#FF7900]/10', icon: 'text-[#FF7900]',   border: 'border-[#FF7900]/15',  glow: 'hover:border-[#FF7900]/30' },
    navy:   { bg: 'bg-blue-500/10',  icon: 'text-blue-400',    border: 'border-blue-500/15',   glow: 'hover:border-blue-400/30'  },
    green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/15', glow: 'hover:border-emerald-400/30' },
    red:    { bg: 'bg-red-500/10',   icon: 'text-red-400',     border: 'border-red-500/15',    glow: 'hover:border-red-400/30'   },
    blue:   { bg: 'bg-blue-500/10',  icon: 'text-blue-400',    border: 'border-blue-500/15',   glow: 'hover:border-blue-400/30'  },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/15', glow: 'hover:border-purple-400/30' },
  }
  const c = colors[color] || colors.orange

  return (
    <div className={`bg-[#0E0E17] rounded-2xl border ${c.border} ${c.glow} p-5 transition-all duration-200 hover:bg-[#111120]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[#666680] text-xs font-medium mb-2 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white tabular-nums">{value ?? 0}</p>
          )}
          {subtitle && <p className="text-xs text-[#444460] mt-1.5">{subtitle}</p>}
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
