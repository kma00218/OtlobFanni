import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, RefreshCw, ChevronDown } from 'lucide-react'
import api from '../../lib/api'
import { categories as SERVICES_CATS } from '../../data/services'

const W = 1080, H = 1080

const loadImg = (src) => new Promise((resolve) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload  = () => resolve(img)
  img.onerror = () => resolve(null)
  img.src = src
})

const rrect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export default function PosterGenerator() {
  const canvasRef  = useRef(null)
  const [type,        setType]        = useState('both')
  const [cityFilter,  setCityFilter]  = useState('')
  const [specFilter,  setSpecFilter]  = useState('')
  const [count,       setCount]       = useState(6)
  const [sortBy,      setSortBy]      = useState('recent')
  const [cities,      setCities]      = useState([])
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [drawn,       setDrawn]       = useState(false)

  const cats = SERVICES_CATS || []

  useEffect(() => {
    api.cities().then(setCities).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setDrawn(false)
    try {
      let techItems = [], compItems = []

      if (type === 'technician' || type === 'both') {
        const params = {}
        if (specFilter) params.category = specFilter
        if (cityFilter) params.city_id  = cityFilter
        const raw = await api.technicians(params)
        techItems = raw.map(t => ({
          id:        t.id,
          name:      t.nameAr || t.name_ar || '',
          specialty: t.categoryAr || '',
          city:      t.city_name_ar || '',
          photo:     t.profilePhoto || t.profile_photo || null,
          type:      'technician',
          featured:  t.isFeatured || t.is_featured || false,
        }))
      }

      if (type === 'company' || type === 'both') {
        const params = {}
        if (specFilter) params.specialty = specFilter
        if (cityFilter) params.city      = cityFilter
        const raw = await api.companies(params)
        compItems = raw.map(c => ({
          id:        c.id,
          name:      c.companyName || c.company_name || '',
          specialty: c.categoryAr || c.specialty || '',
          city:      c.city || '',
          photo:     c.logoUrl || c.logo_url || null,
          type:      'company',
          featured:  false,
        }))
      }

      let combined = [...techItems, ...compItems]

      if (sortBy === 'recent') {
        combined.sort((a, b) => String(b.id).localeCompare(String(a.id)))
      } else {
        combined.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      }

      setItems(combined.slice(0, count))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [type, cityFilter, specFilter, count, sortBy])

  useEffect(() => { fetchData() }, [fetchData])

  const drawPoster = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return

    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    const HEADER_H = 205
    const FOOTER_H = 88
    const BODY_Y   = HEADER_H
    const BODY_H   = H - HEADER_H - FOOTER_H
    const PAD      = 28
    const GAP      = 14
    const COLS     = 3
    const ROWS     = Math.ceil(items.length / 3)

    const CARD_W = (W - 2 * PAD - (COLS - 1) * GAP) / COLS

    let CARD_H, GRID_Y
    if (ROWS === 1) {
      CARD_H = Math.min(500, BODY_H - 2 * PAD)
      GRID_Y = BODY_Y + (BODY_H - CARD_H) / 2
    } else {
      CARD_H = (BODY_H - 2 * PAD - (ROWS - 1) * GAP) / ROWS
      GRID_Y = BODY_Y + PAD
    }

    const AVR = ROWS === 3 ? 38 : ROWS === 2 ? 50 : 66

    // Load assets
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    const [logoImg, ...avatarImgs] = await Promise.all([
      loadImg(base + '/official-logo.png'),
      ...items.map(it => it.photo ? loadImg(it.photo) : Promise.resolve(null)),
    ])

    // ── Full background ──
    ctx.fillStyle = '#EEF2F7'
    ctx.fillRect(0, 0, W, H)

    // ── Header ──
    const hg = ctx.createLinearGradient(0, 0, W, HEADER_H)
    hg.addColorStop(0, '#071B33')
    hg.addColorStop(1, '#0D2E58')
    ctx.fillStyle = hg
    ctx.fillRect(0, 0, W, HEADER_H)

    // orange bottom stripe on header
    ctx.fillStyle = '#FF7900'
    ctx.fillRect(0, HEADER_H - 7, W, 7)

    // Logo (right side)
    if (logoImg) {
      const lH = 96
      const lW = logoImg.width * (lH / logoImg.height)
      ctx.drawImage(logoImg, W - lW - 44, (HEADER_H - 7 - lH) / 2, lW, lH)
    }

    // Header text (right-aligned Arabic)
    ctx.direction  = 'rtl'
    ctx.textAlign  = 'right'
    ctx.textBaseline = 'alphabetic'

    ctx.fillStyle = '#FFFFFF'
    ctx.font      = `bold 44px Tahoma, "Segoe UI", Arial`
    ctx.fillText('انضموا حديثاً إلى اطلب فني', logoImg ? W - logoImg.width * (96 / logoImg.height) - 60 : W - 44, HEADER_H / 2 - 6)

    ctx.fillStyle = '#FF9933'
    ctx.font      = `28px Tahoma, "Segoe UI", Arial`
    ctx.fillText('فنيون وشركات خدمات', logoImg ? W - logoImg.width * (96 / logoImg.height) - 60 : W - 44, HEADER_H / 2 + 38)

    // ── Body background ──
    ctx.fillStyle = '#EEF2F7'
    ctx.fillRect(0, BODY_Y, W, BODY_H)

    // ── Cards ──
    for (let i = 0; i < items.length; i++) {
      const item  = items[i]
      const col   = i % COLS
      const row   = Math.floor(i / COLS)
      const cx    = PAD + col * (CARD_W + GAP)
      const cy    = GRID_Y + row * (CARD_H + GAP)
      const isTech  = item.type === 'technician'
      const accent  = isTech ? '#2563EB' : '#7C3AED'
      const avatBg  = isTech ? '#DBEAFE' : '#EDE9FE'
      const avatFg  = isTech ? '#1D4ED8' : '#6D28D9'

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.07)'
      rrect(ctx, cx + 4, cy + 4, CARD_W, CARD_H, 18)
      ctx.fill()

      // Card bg
      ctx.fillStyle = '#FFFFFF'
      rrect(ctx, cx, cy, CARD_W, CARD_H, 18)
      ctx.fill()

      // Top colour strip
      ctx.fillStyle = accent
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx + 18, cy)
      ctx.lineTo(cx + CARD_W - 18, cy)
      ctx.arcTo(cx + CARD_W, cy, cx + CARD_W, cy + 18, 18)
      ctx.lineTo(cx + CARD_W, cy + 12)
      ctx.lineTo(cx, cy + 12)
      ctx.lineTo(cx, cy + 18)
      ctx.arcTo(cx, cy, cx + 18, cy, 18)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Avatar
      const avCX = cx + CARD_W / 2
      const avCY = cy + 16 + AVR

      // white ring behind avatar
      ctx.beginPath()
      ctx.arc(avCX, avCY, AVR + 5, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()

      const imgEl = avatarImgs[i]
      ctx.save()
      ctx.beginPath()
      ctx.arc(avCX, avCY, AVR, 0, Math.PI * 2)
      ctx.clip()
      if (imgEl) {
        ctx.drawImage(imgEl, avCX - AVR, avCY - AVR, AVR * 2, AVR * 2)
      } else {
        ctx.fillStyle = avatBg
        ctx.fill()
        ctx.restore()
        // Draw initial
        ctx.save()
        ctx.fillStyle = avatFg
        const fs = Math.round(AVR * 0.72)
        ctx.font = `bold ${fs}px Tahoma, Arial`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.direction    = 'ltr'
        ctx.fillText((item.name || '?').charAt(0), avCX, avCY)
      }
      ctx.restore()

      // Avatar border ring
      ctx.beginPath()
      ctx.arc(avCX, avCY, AVR, 0, Math.PI * 2)
      ctx.strokeStyle = accent + '55'
      ctx.lineWidth   = 3
      ctx.stroke()

      // Text area
      const TY  = avCY + AVR + 22
      const LH  = ROWS === 3 ? 30 : 38
      const FSN = ROWS === 3 ? 20 : ROWS === 2 ? 24 : 30  // name font size
      const FSS = ROWS === 3 ? 16 : ROWS === 2 ? 19 : 22  // small font size

      // Type badge
      const badgeLabel = isTech ? 'فني' : 'شركة'
      const badgeW     = ROWS === 3 ? 72 : 84
      const badgeH2    = ROWS === 3 ? 22 : 26
      const badgeBX    = avCX - badgeW / 2
      const badgeBY    = TY
      rrect(ctx, badgeBX, badgeBY, badgeW, badgeH2, badgeH2 / 2)
      ctx.fillStyle = accent + '22'
      ctx.fill()
      ctx.strokeStyle = accent + '55'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle    = accent
      ctx.font         = `bold ${FSS - 2}px Tahoma, Arial`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.direction    = 'rtl'
      ctx.fillText(badgeLabel, avCX, badgeBY + badgeH2 / 2)

      // Name
      ctx.fillStyle    = '#071B33'
      ctx.font         = `bold ${FSN}px Tahoma, "Segoe UI", Arial`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.direction    = 'rtl'
      let name = item.name || ''
      const maxW = CARD_W - 24
      while (name.length > 1 && ctx.measureText(name).width > maxW) {
        name = name.slice(0, -1)
      }
      if (name !== item.name) name += '…'
      ctx.fillText(name, avCX, TY + badgeH2 + LH * 0.9)

      // Specialty
      if (item.specialty) {
        ctx.fillStyle = '#475569'
        ctx.font      = `${FSS}px Tahoma, Arial`
        let spec = '\u{1F527} ' + item.specialty
        while (spec.length > 3 && ctx.measureText(spec).width > maxW) {
          spec = spec.slice(0, -1)
        }
        if (spec !== '\u{1F527} ' + item.specialty) spec += '…'
        ctx.fillText(spec, avCX, TY + badgeH2 + LH * 0.9 + LH * 1.2)
      }

      // City
      if (item.city) {
        ctx.fillStyle = '#64748B'
        ctx.font      = `${FSS - 1}px Tahoma, Arial`
        ctx.fillText('\u{1F4CD} ' + item.city, avCX, TY + badgeH2 + LH * 0.9 + LH * 2.4)
      }
    }

    // ── Footer ──
    // Green thin stripe
    ctx.fillStyle = '#16A34A'
    ctx.fillRect(0, H - FOOTER_H, W, 6)

    ctx.fillStyle = '#FF7900'
    ctx.fillRect(0, H - FOOTER_H + 6, W, FOOTER_H - 6)

    ctx.fillStyle    = '#FFFFFF'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction    = 'ltr'
    ctx.font         = `bold 36px "Segoe UI", Tahoma, Arial`
    ctx.fillText('www.otlobfanni.ly', W / 2, H - (FOOTER_H - 6) / 2 - 6 + 6)

    setDrawn(true)
  }, [items])

  useEffect(() => { drawPoster() }, [drawPoster])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'otlobfanni-poster.png'
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#071B33]">توليد بوستر للنشر</h1>
        <p className="text-sm text-slate-500 mt-1">أنشئ صورة 1080×1080 جاهزة للنشر على فيسبوك</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">

        {/* Type */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">نوع الحسابات</p>
          <div className="flex gap-2">
            {[{ v: 'both', l: 'الكل' }, { v: 'technician', l: 'فنيون' }, { v: 'company', l: 'شركات' }].map(({ v, l }) => (
              <button key={v} onClick={() => setType(v)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${type === v ? 'bg-[#071B33] text-white border-[#071B33]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* City + Specialty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">المدينة</p>
            <div className="relative">
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50">
                <option value="">كل المدن</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">التخصص</p>
            <div className="relative">
              <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50">
                <option value="">كل التخصصات</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sort + Count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">الترتيب</p>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-[#FF7900]/50">
                <option value="recent">آخر المسجلين</option>
                <option value="featured">المميزون أولاً</option>
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">عدد البطاقات</p>
            <div className="flex gap-2">
              {[3, 6, 9].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${count === n ? 'bg-[#FF7900] text-white border-[#FF7900]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh */}
        <button onClick={fetchData} disabled={loading}
          className="w-full py-3 bg-[#071B33] text-white rounded-xl text-sm font-bold hover:bg-[#0f2a4a] transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'جارٍ التحديث…' : 'تحديث البوستر'}
        </button>
      </div>

      {/* No results */}
      {!loading && items.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-400 font-medium">لا توجد نتائج بهذه الفلاتر</p>
        </div>
      )}

      {/* Preview */}
      {items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-[#071B33]">معاينة البوستر</span>
            <span className="text-xs text-slate-400">1080 × 1080 px</span>
          </div>
          <div className="p-3 bg-slate-50 flex justify-center">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', maxWidth: 420, height: 'auto', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
            />
          </div>
        </div>
      )}

      {/* Download */}
      {drawn && (
        <button onClick={handleDownload}
          className="w-full py-4 bg-[#FF7900] text-white rounded-2xl text-base font-extrabold shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
          <Download className="w-5 h-5" />
          تحميل الصورة بجودة عالية
        </button>
      )}

    </div>
  )
}
