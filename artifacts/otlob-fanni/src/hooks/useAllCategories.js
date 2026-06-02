import { useState, useEffect } from 'react'
import { categories as staticCategories } from '../data/services'
import api from '../lib/api'

let _cache = null
let _promise = null

export function useAllCategories() {
  const [merged, setMerged] = useState(_cache || [])

  useEffect(() => {
    if (_cache) { setMerged(_cache); return }
    if (!_promise) {
      _promise = api.categories().catch(() => [])
    }
    _promise.then(dbCats => {
      const dbIds = new Set(dbCats.map(c => c.id))
      const staticOnly = staticCategories.filter(c => !dbIds.has(c.id))
      const all = [
        ...dbCats.map(c => ({
          ...c,
          nameAr:   c.nameAr   || c.name_ar   || c.id,
          nameEn:   c.nameEn   || c.name_en   || c.nameAr || c.name_ar || c.id,
          iconName: c.iconName || c.icon_name  || 'more',
          sectionId: c.sectionId || c.section_id || 'more_services',
        })),
        ...staticOnly,
      ]
      _cache = all
      setMerged(all)
    })
  }, [])

  return merged
}

export function clearAllCategoriesCache() {
  _cache = null
  _promise = null
}
