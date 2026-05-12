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
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0D0D1C', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Toolbar */}
      {(onSearchChange || actions) && (
        <div
          className="flex flex-col sm:flex-row gap-3 p-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {onSearchChange && (
            <div className="relative flex-1 min-w-0">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A3A60]" />
              <input
                type="text"
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-[#D0D0F0] placeholder:text-[#3A3A60] outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.07)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,121,0,0.4)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)' }}
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
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right px-5 py-3.5 font-black text-[#4040A0] text-[11px] uppercase tracking-wider whitespace-nowrap"
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
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <Database className="w-5 h-5 text-[#3A3A60]" />
                    </div>
                    <p className="text-[#4040A0] text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="group transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-[#B0B0D0]">
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
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs text-[#4040A0] font-medium">
            صفحة <span className="text-white font-bold">{currentPage}</span> من <span className="text-white font-bold">{totalPages}</span>
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl text-[#5050A0] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl text-[#5050A0] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
