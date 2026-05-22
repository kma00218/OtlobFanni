import { useEffect } from 'react'

const SITE = 'اطلب فني'
const DEFAULT_DESC = 'دليل الفنيين والحرفيين في ليبيا — اعثر على أفضل فني في مدينتك'

function setMetaEl(attr, val, content) {
  let el = document.querySelector(`meta[${attr}="${val}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, val)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useSeoMeta({ title, description, noindex = false } = {}) {
  useEffect(() => {
    if (!title) return
    const fullTitle = `${title} | ${SITE}`
    const desc = description || DEFAULT_DESC
    document.title = fullTitle
    setMetaEl('name', 'description', desc)
    setMetaEl('property', 'og:title', fullTitle)
    setMetaEl('property', 'og:description', desc)
    setMetaEl('name', 'robots', noindex ? 'noindex, follow' : 'index, follow')
    return () => {
      document.title = `${SITE} - Otlob Fanni`
      setMetaEl('name', 'description', DEFAULT_DESC)
      setMetaEl('property', 'og:title', `${SITE} - Otlob Fanni`)
      setMetaEl('property', 'og:description', 'الفني الأقرب إليك')
      setMetaEl('name', 'robots', 'index, follow')
    }
  }, [title, description, noindex])
}
