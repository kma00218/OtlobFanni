import { Search, ChevronRight, ChevronLeft } from 'lucide-react'

export default function DataTable({
  columns,
  data,
  loading,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  actions,
  emptyMessage = 'لا توجد بيانات',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  return (
    <div className="bg-[#0E0E17] rounded-2xl border border-white/5 overflow-hidden">
      {(onSearchChange || actions) && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/5">
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444460]" />
              <input
                type="text"
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pr-9 pl-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-[#C0C0E0] placeholder:text-[#444460] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]/40 transition-colors"
              />
            </div>
          )}
          {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/3 border-b border-white/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right px-4 py-3 font-semibold text-[#666680] whitespace-nowrap text-xs uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/3">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-14 text-[#444460]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b border-white/3 hover:bg-white/3 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-[#C0C0D8]">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-sm text-[#555570]">صفحة {currentPage} من {totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#666680] hover:text-[#C0C0E0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[#666680] hover:text-[#C0C0E0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
