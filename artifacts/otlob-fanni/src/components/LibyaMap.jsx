import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

const COORDS = {
  c1:  [32.9028, 13.1805],
  c2:  [32.1194, 20.0870],
  c3:  [32.3754, 15.0925],
  c4:  [32.7522, 12.7278],
  c5:  [27.0371, 14.4290],
  c6:  [32.9233, 12.0820],
  c7:  [32.4676, 14.5688],
  c8:  [32.6486, 14.2619],
  c9:  [31.2089, 16.5887],
  c10: [32.0833, 23.9833],
  c11: [32.7667, 22.6333],
  c12: [32.1733, 13.0200],
  c13: [30.7554, 20.2264],
  c14: [32.4351, 13.6357],
  c15: [31.7500, 13.9833],
  c16: [32.7936, 12.4878],
  c17: [32.7667, 21.7500],
  c18: [32.5000, 20.8333],
  c19: [32.7500, 13.0000],
  c20: [32.0633, 12.5269],
  c21: [31.8681, 10.9795],
  c22: [25.9167, 13.9167],
  c23: [26.5933, 12.7769],
  c24: [29.1267, 15.9467],
  c25: [24.1820, 23.3140],
  c26: [24.9650, 10.1731],
  c27: [32.7500, 13.4167],
  c28: [32.7833, 12.3667],
  c29: [30.1327,  9.5019],
  c30: [32.8167, 21.8667],
  c31: [32.9000, 21.9667],
  c32: [32.4000, 14.0000],
  c33: [31.9267, 12.2581],
  c34: [31.8942, 13.0072],
  c35: [32.0333, 12.0167],
  c36: [27.5333, 14.2667],
  c37: [24.9500, 14.6333],
  c38: [30.1436, 10.4203],
  c39: [29.1603, 16.1408],
  c40: [28.5500, 17.5500],
  c41: [28.9667, 13.7167],
  c42: [30.5000, 18.5667],
  c43: [30.3667, 19.5667],
  c44: [29.0333, 21.5500],
  c45: [29.1083, 21.2892],
  c46: [29.7500, 24.5167],
  c47: [32.8500, 11.8333],
  c48: [32.2000, 20.5833],
  c49: [32.7500, 22.2167],
  c50: [31.6667, 20.2500],
  c51: [32.0000, 20.0333],
  c52: [31.7769, 10.9128],
  c53: [32.8806, 13.3522],
  c57: [29.1167, 15.9833],
  c58: [24.9167, 17.4500],
  c59: [31.8167, 12.4167],
}

function dotRadius(total) {
  if (total >= 11) return 13
  if (total >= 4)  return 9
  if (total >= 1)  return 6
  return 3.5
}

export default function LibyaMap({ stats = [], ar = true }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let mounted = true

    import('leaflet').then(({ default: L }) => {
      if (!mounted || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
        tap: false,
        doubleClickZoom: false,
      })
      mapRef.current = map

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 12 }
      ).addTo(map)

      map.fitBounds([[19.3, 9.3], [33.5, 25.4]])

      layerGroupRef.current = L.layerGroup().addTo(map)
    })

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        layerGroupRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!stats.length || !mapRef.current || !layerGroupRef.current) return

    import('leaflet').then(({ default: L }) => {
      if (!mapRef.current || !layerGroupRef.current) return

      layerGroupRef.current.clearLayers()

      stats.forEach(city => {
        const coords = COORDS[city.id]
        if (!coords) return

        const total  = city.total ?? (city.technicians ?? 0) + (city.companies ?? 0) + (city.suppliers ?? 0)
        const active = total > 0
        const radius = dotRadius(total)

        const circle = L.circleMarker(coords, {
          radius,
          fillColor:   active ? '#FF7900' : '#3a4a5c',
          color:       active ? '#ff9a3c' : '#2a3a4c',
          weight:      active ? 1.5 : 1,
          fillOpacity: active ? 0.92 : 0.45,
          opacity:     1,
        }).addTo(layerGroupRef.current)

        if (active) {
          const techs = city.technicians ?? 0
          const cos   = city.companies  ?? 0
          const sups  = city.suppliers  ?? 0
          const rows = [
            techs > 0 ? `<div>🔧 <b>${techs}</b> ${ar ? 'فني' : 'Tech'}</div>` : '',
            cos   > 0 ? `<div>🏢 <b>${cos}</b> ${ar ? 'شركة' : 'Co.'}</div>` : '',
            sups  > 0 ? `<div>📦 <b>${sups}</b> ${ar ? 'مورد' : 'Sup.'}</div>` : '',
          ].filter(Boolean).join('')

          circle.bindPopup(
            `<div style="direction:rtl;text-align:right;font-family:system-ui,sans-serif;min-width:120px;padding:2px 0">
              <div style="font-weight:800;font-size:13px;color:#071B33;margin-bottom:5px">${ar ? city.nameAr : (city.nameEn || city.nameAr)}</div>
              <div style="font-size:12px;line-height:1.9;color:#374151">${rows}</div>
            </div>`,
            { closeButton: false, maxWidth: 180 }
          )
          circle.on('click', () => circle.openPopup())
        }
      })
    })
  }, [stats, ar])

  return (
    <div
      ref={containerRef}
      style={{
        height: '272px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    />
  )
}
