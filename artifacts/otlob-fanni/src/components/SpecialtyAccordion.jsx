import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { sections, categories } from '../data/services'

export const SECTION_GRADIENT = {
  home_services:     ['#FF7900', '#e85e00'],
  car_services:      ['#1E40AF', '#0f2472'],
  construction:      ['#D97706', '#b35500'],
  tech_security:     ['#6366F1', '#4338CA'],
  moving_general:    ['#8B5CF6', '#6D28D9'],
  gardens_pools:     ['#10B981', '#047857'],
  energy_generators: ['#F59E0B', '#D97706'],
  business_services: ['#0EA5E9', '#0369A1'],
  more_services:     ['#6B7280', '#374151'],
}

export default function SpecialtyAccordion({
  selectedIds = [],
  onToggle,
  suggestedSpecialties = {},
  onAddSuggested,
  onRemoveSuggested,
  newDeptSuggestions = [],
  onAddNewDept,
  onRemoveNewDept,
  chipInputValues = {},
  onChipInput,
}) {
  const [expandedSections, setExpandedSections] = useState([])
  const toggleSection = id =>
    setExpandedSections(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
      {sections.map(section => {
        const isMore = section.id === 'more_services'
        const sectionCats = isMore ? [] : categories.filter(c => c.sectionId === section.id && c.id !== 'more')
        const selectedCount = isMore
          ? newDeptSuggestions.length
          : sectionCats.filter(c => selectedIds.includes(c.id)).length
        const sugCount = (suggestedSpecialties[section.id] || []).length
        const totalCount = selectedCount + sugCount
        const isOpen = expandedSections.includes(section.id)
        const [c1, c2] = SECTION_GRADIENT[section.id] || ['#6B7280', '#374151']

        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-right"
            >
              <div
                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
              >
                <img
                  src={`/icons/services/${isMore ? 'more' : section.id}.svg`}
                  alt=""
                  style={{ width: 18, height: 18 }}
                  className="object-contain brightness-0 invert"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <span className="flex-1 font-bold text-[#071B33] text-sm text-right">{section.nameAr}</span>
              {totalCount > 0 && (
                <span
                  className="text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[22px] text-center"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                >
                  {totalCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="border-t border-slate-100">
                {isMore ? (
                  <div className="px-4 py-3 bg-slate-50 space-y-2.5">
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      💡 اقترح قسماً أو تخصصاً غير موجود — اضغط + أو Enter لإضافته
                    </p>
                    {newDeptSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {newDeptSuggestions.map((name, i) => (
                          <span key={i} className="flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                            {name}
                            <button type="button" onClick={() => onRemoveNewDept(i)}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#071B33] outline-none focus:border-[#FF7900] font-medium placeholder:text-slate-300"
                        value={chipInputValues['__new_dept__'] || ''}
                        onChange={e => onChipInput('__new_dept__', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddNewDept() } }}
                        placeholder="مثال: أنظمة الطاقة الشمسية"
                      />
                      <button
                        type="button"
                        onClick={onAddNewDept}
                        className="w-9 h-9 flex-shrink-0 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base hover:bg-amber-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-50">
                      {sectionCats.map(c => {
                        const checked = selectedIds.includes(c.id)
                        const isPrimary = selectedIds[0] === c.id
                        return (
                          <label
                            key={c.id}
                            className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                            style={{ background: checked ? `${c1}08` : 'white' }}
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[#FF7900] flex-shrink-0"
                              checked={checked}
                              onChange={() => onToggle(c.id)}
                            />
                            <span className={`flex-1 text-sm font-medium ${checked ? 'text-[#071B33] font-bold' : 'text-slate-600'}`}>
                              {c.nameAr}
                            </span>
                            {isPrimary && (
                              <span
                                className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                              >
                                رئيسي
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                    <div className="px-4 py-3 bg-orange-50/50 border-t border-dashed border-orange-100 space-y-2">
                      <p className="text-[11px] text-slate-400 font-semibold">
                        💡 تخصص غير مذكور في هذا القسم؟ أضفه هنا
                      </p>
                      {(suggestedSpecialties[section.id] || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(suggestedSpecialties[section.id] || []).map((name, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
                              style={{ background: `${c1}15`, color: c1, borderColor: `${c1}30` }}
                            >
                              {name}
                              <button type="button" onClick={() => onRemoveSuggested(section.id, i)}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#071B33] outline-none focus:border-[#FF7900] font-medium placeholder:text-slate-300"
                          value={chipInputValues[section.id] || ''}
                          onChange={e => onChipInput(section.id, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddSuggested(section.id) } }}
                          placeholder="مثال: صيانة خزانات المياه"
                        />
                        <button
                          type="button"
                          onClick={() => onAddSuggested(section.id)}
                          className="w-9 h-9 flex-shrink-0 rounded-xl text-white flex items-center justify-center font-bold text-base transition-colors"
                          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
