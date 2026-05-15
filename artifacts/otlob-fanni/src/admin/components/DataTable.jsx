import { Search, ChevronRight, ChevronLeft, Database } from 'lucide-react'

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
    <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(7,27,51,0.06)' }}>
      {/* Toolbar */}
      {(onSearchChange || actions) && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          {onSearchChange && (
            <div className="relative flex-1 min-w-0">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all bg-slate-50 border border-slate-200 focus:border-[#FF7900] focus:bg-white focus:ring-2 focus:ring-[#FF7900]/10"
              />
            </div>
          )}
          {actions && <div className="flex gap-2 flex-shrink-0 items-center">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right px-5 py-3.5 font-black text-[#071B33] text-[11px] uppercase tracking-wider whitespace-nowrap"
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
                <tr key={i} className="border-b border-slate-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 rounded-lg animate-pulse bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100">
                      <Database className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b border-slate-50 hover:bg-orange-50/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-slate-600">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400 font-medium">
            صفحة <span className="text-[#071B33] font-bold">{currentPage}</span> من <span className="text-[#071B33] font-bold">{totalPages}</span>
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl text-slate-400 hover:text-[#071B33] hover:bg-white border border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl text-slate-400 hover:text-[#071B33] hover:bg-white border border-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
