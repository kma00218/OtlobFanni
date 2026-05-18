import { useEffect, useRef, useState } from 'react'
import { Navigation, X, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export default function LocationPicker({ value, onChange, ar }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markerRef    = useRef(null)
  const [loading, setLoading] = useState(false)
  const [geoError, setGeoError] = useState(false)

  useEffect(() => {
    let mounted = true
    import('leaflet').then(({ default: L }) => {
      if (!mounted || !containerRef.current || mapRef.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl:       new URL('leaflet/dist/images/marker-icon.png',   import.meta.url).href,
        shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
      })

      const map = L.map(containerRef.current, { zoomControl: true })
        .setView([26.3351, 17.2283], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (value?.lat && value?.lng) {
        markerRef.current = L.marker([value.lat, value.lng]).addTo(map)
        map.setView([value.lat, value.lng], 13)
      }

      map.on('click', (e) => {
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    setGeoError(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        import('leaflet').then(({ default: L }) => {
          if (!mapRef.current) return
          if (markerRef.current) markerRef.current.remove()
          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
          mapRef.current.setView([lat, lng], 14)
          onChange({ lat, lng })
          setLoading(false)
        })
      },
      () => { setLoading(false); setGeoError(true) },
      { timeout: 8000 }
    )
  }

  const clearLocation = () => {
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border-2 border-gray-200"
        style={{ height: 200, zIndex: 0 }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#071B33] text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-60"
        >
          <Navigation className="w-3.5 h-3.5" />
          {loading
            ? (ar ? 'جارٍ التحديد...' : 'Locating...')
            : (ar ? 'استخدم موقعي الحالي' : 'Use my location')}
        </button>
        {value?.lat && (
          <button
            type="button"
            onClick={clearLocation}
            className="flex items-center gap-1 text-xs text-red-500 font-semibold px-3 py-2 rounded-xl border border-red-200 active:scale-95 transition-transform"
          >
            <X className="w-3.5 h-3.5" />
            {ar ? 'مسح' : 'Clear'}
          </button>
        )}
      </div>

      {geoError && (
        <p className="text-xs text-red-500 font-medium">
          {ar ? 'تعذّر تحديد موقعك — انقر على الخريطة يدوياً' : 'Could not detect location — tap the map manually'}
        </p>
      )}

      {value?.lat ? (
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          {ar
            ? `✓ تم تحديد الموقع (${value.lat.toFixed(4)}, ${value.lng.toFixed(4)})`
            : `✓ Location set (${value.lat.toFixed(4)}, ${value.lng.toFixed(4)})`}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400">
          {ar ? 'انقر على الخريطة لتحديد موقعك بدقة' : 'Tap the map to pin your exact location'}
        </p>
      )}
    </div>
  )
}
