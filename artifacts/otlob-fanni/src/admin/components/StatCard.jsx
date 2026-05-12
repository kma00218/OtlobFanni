export default function StatCard({ title, value, icon: Icon, gradient, subtitle, loading, trend, badge }) {
  const gradients = {
    orange:  { card: 'from-[#FF7900] to-[#FF9A3C]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    blue:    { card: 'from-[#2563EB] to-[#3B82F6]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    green:   { card: 'from-[#059669] to-[#10B981]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    purple:  { card: 'from-[#7C3AED] to-[#A78BFA]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    rose:    { card: 'from-[#E11D48] to-[#FB7185]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    teal:    { card: 'from-[#0D9488] to-[#2DD4BF]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    amber:   { card: 'from-[#D97706] to-[#FCD34D]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/80' },
    indigo:  { card: 'from-[#4338CA] to-[#818CF8]',  icon: 'bg-white/20', text: 'text-white', sub: 'text-white/70' },
    dark:    { card: 'from-[#1E1E2E] to-[#2A2A3E]',  icon: 'bg-white/10', text: 'text-white', sub: 'text-[#8888A8]' },
  }

  const g = gradients[gradient] || gradients.dark

  return (
    <div className={`relative bg-gradient-to-br ${g.card} rounded-2xl p-5 overflow-hidden shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default`}>
      {/* Decorative circle */}
      <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-white/10 blur-sm" />
      <div className="absolute -bottom-8 -right-4 w-24 h-24 rounded-full bg-black/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`${g.sub} text-xs font-semibold uppercase tracking-wider mb-3 leading-tight`}>{title}</p>
          {loading ? (
            <div className="h-9 w-20 bg-white/20 rounded-xl animate-pulse" />
          ) : (
            <p className={`text-4xl font-black ${g.text} tabular-nums leading-none`}>
              {(value ?? 0).toLocaleString('en-US')}
            </p>
          )}
          {subtitle && !loading && (
            <p className={`text-xs ${g.sub} mt-2 font-medium`}>{subtitle}</p>
          )}
          {trend !== undefined && !loading && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-white/20 text-white' : 'bg-black/20 text-white/80'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </div>
          )}
          {badge && !loading && (
            <div className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
              {badge}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${g.icon} p-3 rounded-2xl flex-shrink-0 backdrop-blur-sm`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  )
}
