export default function StatCard({ title, value, icon: Icon, color = 'orange', subtitle, loading, trend }) {
  const palette = {
    orange: { bg: 'bg-[#FF7900]/15', icon: 'text-[#FF7900]',    ring: 'ring-[#FF7900]/20',    glow: 'shadow-[#FF7900]/10' },
    green:  { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', ring: 'ring-emerald-500/20',  glow: 'shadow-emerald-500/10' },
    blue:   { bg: 'bg-blue-500/15',  icon: 'text-blue-400',     ring: 'ring-blue-500/20',     glow: 'shadow-blue-500/10' },
    purple: { bg: 'bg-violet-500/15', icon: 'text-violet-400',  ring: 'ring-violet-500/20',   glow: 'shadow-violet-500/10' },
    navy:   { bg: 'bg-sky-500/15',   icon: 'text-sky-400',      ring: 'ring-sky-500/20',      glow: 'shadow-sky-500/10' },
    red:    { bg: 'bg-red-500/15',   icon: 'text-red-400',      ring: 'ring-red-500/20',      glow: 'shadow-red-500/10' },
    teal:   { bg: 'bg-teal-500/15',  icon: 'text-teal-400',     ring: 'ring-teal-500/20',     glow: 'shadow-teal-500/10' },
  }
  const c = palette[color] || palette.orange

  return (
    <div className={`relative bg-[#0E0E17] rounded-2xl p-5 ring-1 ${c.ring} hover:ring-2 transition-all duration-200 group overflow-hidden`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.glow} blur-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[#8888A8] text-xs font-semibold uppercase tracking-wider mb-3 leading-tight">{title}</p>
          {loading ? (
            <div className="h-9 w-20 bg-white/8 rounded-xl animate-pulse" />
          ) : (
            <p className="text-4xl font-black text-white tabular-nums leading-none">{(value ?? 0).toLocaleString('en-US')}</p>
          )}
          {subtitle && !loading && (
            <p className="text-xs text-[#555570] mt-2 font-medium">{subtitle}</p>
          )}
          {trend !== undefined && !loading && (
            <p className={`text-xs mt-2 font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${c.bg} p-3.5 rounded-2xl ring-1 ${c.ring} flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${c.icon}`} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  )
}
