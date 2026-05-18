import { useEffect, useRef } from 'react'
import { getFileUrl } from '../lib/api'
import 'leaflet/dist/leaflet.css'

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDist(km, ar) {
  if (km < 1) return ar ? `${Math.round(km * 1000)} م` : `${Math.round(km * 1000)} m`
  return ar ? `${km.toFixed(1)} كم` : `${km.toFixed(1)} km`
}

export default function MapView({ techs = [], companies = [], userLocation, ar, onSelectTech, onSelectCompany }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)

  const allItems = [
    ...techs.map(t => ({ ...t, _type: 'tech' })),
    ...companies.map(c => ({ ...c, _type: 'company' })),
  ].filter(i => i.lat && i.lng)

  useEffect(() => {
    let mounted = true
    import('leaflet').then(({ default: L }) => {
      if (!mounted || !containerRef.current || mapRef.current) return

      delete L.Icon.Default.prototype._getIconUrl

      const defaultCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : allItems.length
          ? [allItems[0].lat, allItems[0].lng]
          : [32.9, 13.18]

      const map = L.map(containerRef.current).setView(defaultCenter, userLocation ? 12 : 10)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (userLocation) {
        const meIcon = L.divIcon({
          html: `<div style="width:20px;height:20px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(34,197,94,0.25)"></div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
        L.marker([userLocation.lat, userLocation.lng], { icon: meIcon }).addTo(map)
          .bindPopup(`<b>${ar ? 'موقعك' : 'Your location'}</b>`)
      }

      allItems.forEach(item => {
        const isCompany = item._type === 'company'
        const name = item.nameAr || item.name_ar || item.companyName || item.company_name || ''
        const initial = name.charAt(0) || '?'
        const color = isCompany ? '#1e40af' : '#FF7900'
        const dist = userLocation
          ? haversine(userLocation.lat, userLocation.lng, item.lat, item.lng)
          : null

        const icon = L.divIcon({
          html: `<div style="width:34px;height:34px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:13px;font-family:system-ui">${initial}</div>`,
          className: '',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        })

        const distHtml = dist != null
          ? `<span style="color:#6b7280;font-size:11px">${formatDist(dist, ar)}</span><br/>`
          : ''

        const btnId = `mapbtn_${item.id}`
        const popup = L.popup({ maxWidth: 160 }).setContent(
          `<div style="text-align:center;padding:2px 0">
            <b style="font-size:13px">${name}</b><br/>
            ${distHtml}
            <button id="${btnId}" style="margin-top:6px;background:${color};color:white;border:none;padding:5px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">
              ${ar ? 'عرض' : 'View'}
            </button>
          </div>`
        )

        const marker = L.marker([item.lat, item.lng], { icon }).addTo(map)
        marker.bindPopup(popup)
        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.getElementById(btnId)
            if (btn) {
              btn.onclick = () => {
                if (isCompany) onSelectCompany?.(item.id)
                else onSelectTech?.(item.id)
              }
            }
          }, 50)
        })
      })

      if (allItems.length > 1) {
        const bounds = L.latLngBounds(allItems.map(i => [i.lat, i.lng]))
        if (userLocation) bounds.extend([userLocation.lat, userLocation.lng])
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
      }

      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 150)
    })

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const totalItems = techs.length + companies.length

  return (
    <div className="space-y-2">
      {allItems.length < totalItems && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-amber-700 font-medium">
            {ar
              ? `${allItems.length} من أصل ${totalItems} مزود لديهم موقع محدد على الخريطة`
              : `${allItems.length} of ${totalItems} providers have a pinned location`}
          </p>
        </div>
      )}
      {allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📍</span>
          </div>
          <p className="text-gray-500 text-sm font-medium max-w-[220px]">
            {ar
              ? 'لا يوجد مزودو خدمة بموقع محدد في هذا التخصص بعد'
              : 'No providers have pinned their location yet for this specialty'}
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
          style={{ height: '58vh', minHeight: 300 }}
        />
      )}
    </div>
  )
}
