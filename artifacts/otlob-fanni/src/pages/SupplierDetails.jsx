import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import { MapPin, Phone, Package, Heart, Image as ImageIcon } from 'lucide-react'
import api from '../lib/api'
import { track } from '../lib/tracker'
import { SUPPLY_TYPES, supplyTypeLabel } from '../data/suppliers'
import ImageLightbox from '../components/ImageLightbox'
import { SkeletonProfileHeader } from '../components/Skeleton'

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

function useFavorites(storageKey) {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })
  const toggle = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }
  return { isFav: (id) => favs.includes(id), toggle }
}

export default function SupplierDetails() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const dir = ar ? 'rtl' : 'ltr'
  const [, params] = useRoute('/supplier/:id')
  const id = params?.id

  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const { isFav, toggle: toggleFav } = useFavorites('favSuppliers')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.supplier(id)
      .then(data => { setSupplier(data); setLoading(false) })
      .catch(() => setLoading(false))
    track('supplier_view', { id })
  }, [id])

  if (loading) {
    return (
      <div className="bg-[#EEF9F8] min-h-screen" dir={dir}>
        <BackHeader title={ar ? 'تفاصيل المورد' : 'Supplier Details'} />
        <main className="px-4 pt-4">
          <SkeletonProfileHeader />
        </main>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="bg-[#EEF9F8] min-h-screen flex flex-col" dir={dir}>
        <BackHeader title={ar ? 'تفاصيل المورد' : 'Supplier Details'} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">{ar ? 'لم يتم العثور على المورد' : 'Supplier not found'}</p>
        </div>
      </div>
    )
  }

  const name             = supplier.businessName || ''
  const contactName      = supplier.contactName || ''
  const logo             = supplier.logo
    ? (supplier.logo.startsWith('/objects/') ? `/api/storage${supplier.logo}` : supplier.logo)
    : null
  const city             = supplier.city || ''
  const area             = supplier.area || ''
  const description      = supplier.description || ''
  const phone            = supplier.phone || ''
  const whatsapp         = supplier.whatsapp || ''
  const facebook         = supplier.facebook || ''
  const instagram        = supplier.instagram || ''
  const tiktok           = supplier.tiktok || ''
  const shopImages       = (supplier.shopImages || []).map(img =>
    img.startsWith('/objects/') ? `/api/storage${img}` : img
  )
  const supplyType       = supplier.supplyType || ''
  const customSupplyType = supplier.customSupplyType || ''
  const requestNumber    = supplier.requestNumber || ''
  const createdAt        = supplier.createdAt || null

  const getSupplyEmoji = (type) => SUPPLY_TYPES.find(t => t.id === type)?.emoji || '📦'
  const supplyLabel    = customSupplyType || supplyTypeLabel(supplyType)
  const supplyEmoji    = getSupplyEmoji(supplyType)

  const idBadge = requestNumber ||
    `SUP-${createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear()}-${String(id).replace(/\D/g, '').slice(-6)}`

  const openWa    = () => window.open(`https://wa.me/${(whatsapp || phone).replace(/\D/g, '')}`, '_blank')
  const openPhone = () => window.open(`tel:${phone}`, '_self')

  return (
    <div className="bg-[#EEF9F8] min-h-screen pb-28" dir={dir}>
      <BackHeader title={ar ? 'تفاصيل المورد' : 'Supplier Details'} />

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <main className="px-4 pt-4 space-y-4">

        {/* ── Header card ── */}
        <div className="bg-[#E4F7F6] rounded-2xl border border-teal-300 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0e5c6d] to-[#1a8fa8] px-4 pt-4 pb-6 flex items-start justify-end">
            <button
              onClick={() => toggleFav(id)}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label={ar ? 'أضف للمفضلة' : 'Add to favorites'}
            >
              <Heart
                className="w-4 h-4 transition-colors"
                fill={isFav(id) ? '#f43f5e' : 'none'}
                stroke={isFav(id) ? '#f43f5e' : 'white'}
              />
            </button>
          </div>

          <div className="px-4 pt-0 pb-4 -mt-5">
            <div className="flex items-end gap-3 mb-3">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0e7c8f 0%, #071B33 100%)' }}
              >
                {logo
                  ? <img src={logo} alt={name} className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightbox({ images: [logo], index: 0 })} />
                  : <span className="text-3xl">{supplyEmoji}</span>
                }
              </div>

              <div className="flex-1 min-w-0 mt-10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Package className="w-4 h-4 text-[#0e5c6d] flex-shrink-0" />
                  <h1 className="font-bold text-gray-900 text-lg leading-tight">{name}</h1>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-black px-3 py-1 rounded-full my-1 tracking-wide shadow-sm">
                  🪪 {ar ? 'رقم التعريف' : 'ID'}: {idBadge}
                </span>
                {supplyLabel && (
                  <p className="text-sm text-[#0e5c6d] font-medium">{supplyEmoji} {supplyLabel}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {(whatsapp || phone) && (
                <button onClick={openWa}
                  className="flex-1 bg-green-500 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                  <WaIcon /> {ar ? 'واتساب' : 'WhatsApp'}
                </button>
              )}
              {phone && (
                <button onClick={openPhone}
                  className="flex-1 bg-[#071B33] text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                  <Phone className="w-4 h-4" /> {ar ? 'اتصال' : 'Call'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Info section ── */}
        <div className="bg-[#E4F7F6] rounded-2xl border border-teal-200 shadow-sm p-4 space-y-3">
          <p className="text-xs font-bold text-[#0e5c6d] uppercase tracking-wider">
            {ar ? 'المعلومات الأساسية' : 'Basic Info'}
          </p>
          {contactName && (
            <div className="bg-white/60 rounded-xl p-3 border border-teal-100">
              <p className="text-xs text-gray-400 mb-0.5">{ar ? 'المسؤول' : 'Contact Person'}</p>
              <p className="font-medium text-gray-800 text-sm">{contactName}</p>
            </div>
          )}
          {city && (
            <div className="bg-white/60 rounded-xl p-3 border border-teal-100">
              <p className="text-xs text-gray-400 mb-0.5">{ar ? 'الموقع' : 'Location'}</p>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0e5c6d] flex-shrink-0" />
                <p className="font-medium text-gray-800 text-sm">{city}{area ? ` · ${area}` : ''}</p>
              </div>
            </div>
          )}
          {supplyLabel && (
            <div className="bg-white/60 rounded-xl p-3 border border-teal-100">
              <p className="text-xs text-gray-400 mb-0.5">{ar ? 'نوع المستلزمات' : 'Supply Type'}</p>
              <p className="font-medium text-gray-800 text-sm">{supplyEmoji} {supplyLabel}</p>
            </div>
          )}
        </div>

        {/* ── Description ── */}
        {description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {ar ? 'عن النشاط' : 'About'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* ── Shop images ── */}
        {shopImages.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-[#0e5c6d]" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {ar ? 'صور النشاط' : 'Shop Photos'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {shopImages.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in"
                  onClick={() => setLightbox({ images: shopImages, index: i })}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Social media ── */}
        {(facebook || instagram || tiktok) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              {ar ? 'وسائل التواصل' : 'Social Media'}
            </p>
            <div className="space-y-2.5">
              {facebook && (
                <a
                  href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 active:opacity-70 transition-opacity"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">f</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 truncate">{facebook}</span>
                </a>
              )}
              {instagram && (
                <a
                  href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 active:opacity-70 transition-opacity"
                >
                  <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📸</span>
                  </div>
                  <span className="text-sm font-medium text-pink-600 truncate">{instagram}</span>
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok.replace('@', '')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 active:opacity-70 transition-opacity"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎵</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{tiktok}</span>
                </a>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
