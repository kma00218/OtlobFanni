import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex]   = useState(startIndex)
  const [scale, setScale]   = useState(1)

  const touchStartX      = useRef(null)
  const pinchStartDist   = useRef(null)
  const pinchStartScale  = useRef(1)
  const isPinching       = useRef(false)

  const prev = () => { setIndex(i => (i - 1 + images.length) % images.length); setScale(1) }
  const next = () => { setIndex(i => (i + 1) % images.length); setScale(1) }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const getDist = (touches) =>
    Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY
    )

  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      isPinching.current  = false
    } else if (e.touches.length === 2) {
      isPinching.current     = true
      pinchStartDist.current = getDist(e.touches)
      pinchStartScale.current = scale
    }
  }

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDist.current) {
      e.preventDefault()
      const dist     = getDist(e.touches)
      const newScale = Math.min(Math.max(pinchStartScale.current * (dist / pinchStartDist.current), 1), 4)
      setScale(newScale)
    }
  }

  const onTouchEnd = (e) => {
    if (!isPinching.current && touchStartX.current !== null && scale === 1) {
      const diff = touchStartX.current - (e.changedTouches[0]?.clientX ?? touchStartX.current)
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev()
      }
    }
    if (e.touches.length < 2) isPinching.current = false
    touchStartX.current = null
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        {images.length > 1
          ? <span className="text-white/60 text-sm font-medium tabular-nums">{index + 1} / {images.length}</span>
          : <span />
        }
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Image area ── */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={scale === 1 ? onClose : undefined}
      >
        <img
          src={images[index]}
          alt={`${index + 1}`}
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `scale(${scale})`,
            transition: scale === 1 ? 'transform 0.2s ease' : 'none',
          }}
          onClick={e => e.stopPropagation()}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 active:scale-90 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div
          className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 overflow-x-auto"
          onClick={e => e.stopPropagation()}
          style={{ touchAction: 'pan-x' }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setScale(1) }}
              className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === index
                  ? 'border-[#FF7900] opacity-100 scale-105'
                  : 'border-white/20 opacity-50 hover:opacity-75'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
