import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import BackHeader from '../components/BackHeader'
import { useRoute } from 'wouter'
import { useSeoMeta } from '../hooks/useSeoMeta'
import {
  MapPin, Phone, Package, Heart, Image as ImageIcon,
  Star, X, Send, Share2, ClipboardList, Sparkles, Clock,
} from 'lucide-react'
import api from '../lib/api'
import { track } from '../lib/tracker'
import { SUPPLY_TYPES, supplyTypeLabel } from '../data/suppliers'
import ImageLightbox from '../components/ImageLightbox'
import { SkeletonProfileHeader } from '../components/Skeleton'
import ReportModal from '../components/ReportModal'
import RequestFormModal from '../components/RequestFormModal'

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

function Stars({ rating, count, size = 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
        ))}
      </div>
      {count > 0 && <span className="text-sm text-gray-500 font-medium">({count})</span>}
    </div>
  )
}

function InteractiveStars({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)} className="active:scale-90 transition-transform">
          <Star
            className={`w-9 h-9 transition-colors ${i <= value ? 'text-amber-400' : 'text-gray-200'}`}
            fill={i <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS_AR = { 1: 'سيء', 2: 'مقبول', 3: 'جيد', 4: 'جيد جداً', 5: 'ممتاز' }
const RATING_LABELS_EN = { 1: 'Poor',  2: 'Fair',  3: 'Good', 4: 'Very Good', 5: 'Excellent' }

export default function SupplierDetails() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const dir = ar ? 'rtl' : 'ltr'
  const [, params] = useRoute('/supplier/:id')
  const id = params?.id

  const [supplier,     setSupplier]     = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [lightbox,     setLightbox]     = useState(null)
  const [reviews,      setReviews]      = useState([])
  const [showReviews,  setShowReviews]  = useState(false)
  const [reviewModal,  setReviewModal]  = useState(false)
  const [form,         setForm]         = useState({ name: '', rating: 0, comment: '' })
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [showComment,  setShowComment]  = useState(false)
  const [showReport,   setShowReport]   = useState(false)
  const [showRequest,  setShowRequest]  = useState(false)
  const { isFav, toggle: toggleFav } = useFavorites('favSuppliers')

  const _seoSupName = supplier?.businessName || supplier?.business_name || ''
  const _seoSupCity = supplier?.city || ''
  useSeoMeta({
    title: _seoSupName
      ? (ar
        ? `${_seoSupName}${_seoSupCity ? ` في ${_seoSupCity}` : ''}`
        : `${_seoSupName}${_seoSupCity ? ` in ${_seoSupCity}` : ''}`)
      : null,
    description: _seoSupName
      ? (ar
        ? `تعرّف على ${_seoSupName}${_seoSupCity ? ` في ${_seoSupCity}` : ''} — مورد مواد وأدوات في ليبيا | اطلب فني`
        : `Discover ${_seoSupName}${_seoSupCity ? ` in ${_seoSupCity}` : ''} — supplier in Libya | Otlob Fanni`)
      : null,
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.supplier(id),
      api.supplierReviews(id),
    ]).then(([data, revs]) => {
      setSupplier(data)
      setReviews(revs || [])
      setLoading(false)
    }).catch(() => setLoading(false))
    track('supplier_view', id)
  }, [id])

  const handleSubmitReview = async () => {
    if (!form.name.trim() || form.rating === 0) return
    setSubmitting(true)
    try {
      const newReview = await api.submitSupplierReview(id, {
        reviewer_name: form.name.trim(),
        rating:        form.rating,
        comment:       form.comment.trim() || null,
      })
      setReviews(prev => [newReview, ...prev])
      setSupplier(prev => {
        const total = (prev.reviewsCount || 0) + 1
        const avg   = ((prev.rating || 0) * (prev.reviewsCount || 0) + form.rating) / total
        return { ...prev, rating: Math.round(avg * 10) / 10, reviewsCount: total }
      })
      setSubmitted(true)
      setTimeout(() => {
        setReviewModal(false)
        setSubmitted(false)
        setForm({ name: '', rating: 0, comment: '' })
        setShowReviews(true)
      }, 1800)
    } catch {
      alert(ar ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#F4F6FA] min-h-screen pt-20" dir={dir}>
        <BackHeader title={ar ? 'تفاصيل المورد' : 'Supplier Details'} />
        <main className="px-4 pt-4"><SkeletonProfileHeader /></main>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="bg-[#F4F6FA] min-h-screen pt-20 flex flex-col" dir={dir}>
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
  const rating           = Number(supplier.rating || 0)
  const reviewsCount     = Number(supplier.reviewsCount || reviews.length || 0)

  const getSupplyEmoji = (type) => SUPPLY_TYPES.find(t => t.id === type)?.emoji || '📦'
  const supplyLabel    = customSupplyType || supplyTypeLabel(supplyType)
  const supplyEmoji    = getSupplyEmoji(supplyType)

  const idBadge = requestNumber ||
    `SUP-${createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear()}-${String(id).replace(/\D/g, '').slice(-6)}`

  const openWa    = () => window.open(`https://wa.me/${(whatsapp || phone).replace(/\D/g,'').replace(/^00218/,'218').replace(/^0/,'218')}?text=${encodeURIComponent('السلام عليكم، وجدت نشاطكم على منصة اطلب فني وأرغب في الاستفسار عن المستلزمات.')}`, '_blank')
  const openPhone = () => window.open(`tel:${phone}`, '_self')

  return (
    <div className="bg-[#F4F6FA] min-h-screen pt-20 pb-28" dir={dir}>
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
        <div className="bg-white rounded-3xl overflow-hidden" style={{ border: '1px solid #EEF2F8', boxShadow: '0 4px 28px rgba(7,27,51,0.1)' }}>

          {/* Hero */}
          <div className="relative h-36 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e5c6d 0%, #0e7c8f 55%, #1a9fb8 100%)' }}>
            <div className="absolute -top-8 -end-8 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FF7900, transparent)' }} />
            <div className="absolute -bottom-8 -start-8 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a7f3d0, transparent)' }} />
            <div className="relative flex items-start justify-between p-3 z-10">
              <span className="inline-flex items-center gap-1 bg-white/15 text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20">
                <Package className="w-2.5 h-2.5" /> {ar ? 'مورد مستلزمات' : 'Supplier'}
              </span>
              <button
                onClick={() => toggleFav(id)}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}
                aria-label={ar ? 'أضف للمفضلة' : 'Add to favorites'}
              >
                <Heart className="w-4 h-4 transition-colors"
                  fill={isFav(id) ? '#f43f5e' : 'none'}
                  stroke={isFav(id) ? '#f43f5e' : 'white'} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-5">
            {/* Avatar overlapping hero */}
            <div className="flex items-end gap-3 -mt-12 mb-1">
              <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ border: '4px solid white', boxShadow: '0 4px 20px rgba(7,27,51,0.18)', background: 'linear-gradient(135deg, #0e5c6d, #0e7c8f)', position: 'relative', zIndex: 1 }}>
                {logo
                  ? <img src={logo} alt={name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox({ images: [logo], index: 0 })} />
                  : <span className="text-4xl">{supplyEmoji}</span>
                }
              </div>
              <div className="pb-1 flex-1" />
            </div>

            {/* Name + ID */}
            <h1 className="font-black text-[#071B33] text-2xl leading-tight mt-3 mb-2">{name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 text-blue-700 text-[11px] font-black px-3 py-1.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #EBF3FF, #DBEAFE)', border: '2px solid #93C5FD' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[8px] font-black"
                  style={{ background: '#2563EB' }}>ID</span>
                {idBadge}
              </span>
              {createdAt && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(14,124,143,0.08)', border: '1px solid rgba(14,124,143,0.22)', color: '#0a6475' }}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {ar ? 'عضو منذ ' : 'Since '}{new Date(createdAt).toLocaleDateString(ar ? 'ar-LY' : 'en-GB', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Supply type icon grid */}
            {supplyType && (
              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  {ar ? 'نوع المستلزمات' : 'Supply Type'}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={`/icons/supplies/${supplyType}.png`}
                        alt={supplyLabel}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = '/icons/supplies/other.png' }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{supplyLabel}</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI-extracted keyword tags */}
            {supplier.aiTags?.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {ar ? 'كلمات مفتاحية' : 'Keywords'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.aiTags.map((tag, i) => (
                    <span key={i} className="text-[11px] font-semibold text-violet-700 px-2.5 py-1 rounded-xl"
                      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats mini-cards */}
            {city && (
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1"
                  style={{ background: '#F8FAFC', border: '1px solid #E4EAF2' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(14,124,143,0.1)' }}>
                    <MapPin className="w-4 h-4 text-[#0e7c8f]" />
                  </div>
                  <span className="text-[10px] font-black text-[#071B33] text-center leading-tight truncate w-full px-1">
                    {city}{area ? ` · ${area}` : ''}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{ar ? 'الموقع' : 'Location'}</span>
                </div>
                {contactName && (
                  <div className="flex-2 flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2"
                    style={{ background: '#F0FAF9', border: '1px solid #C0E8E4', minWidth: 0, flex: 2 }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(14,124,143,0.12)' }}>
                      <span className="text-lg">👤</span>
                    </div>
                    <span className="text-[10px] font-black text-[#0e5c6d] text-center leading-tight truncate w-full px-1">
                      {contactName}
                    </span>
                    <span className="text-[9px] text-teal-400 font-semibold">{ar ? 'المسؤول' : 'Contact'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setShowReviews(v => !v)} className="flex items-center gap-2 active:opacity-70 transition-opacity">
                <Stars rating={rating} count={reviewsCount} />
                {reviewsCount > 0 && (
                  <span className="text-xs text-[#0e5c6d] font-bold underline underline-offset-2">
                    {ar ? 'عرض التقييمات' : 'See reviews'}
                  </span>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mb-2">
              {(whatsapp || phone) && (
                <button onClick={openWa}
                  className="flex-1 text-white text-sm font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #25D366, #1aad52)', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
                  <WaIcon /> {ar ? 'واتساب' : 'WhatsApp'}
                </button>
              )}
              {phone && (
                <button onClick={openPhone}
                  className="flex-1 text-white text-sm font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #071B33, #102848)', boxShadow: '0 4px 16px rgba(7,27,51,0.25)' }}>
                  <Phone className="w-4 h-4" /> {ar ? 'اتصال' : 'Call'}
                </button>
              )}
            </div>
            {/* ── Customer section ── */}
            <div className="flex items-center gap-3 mt-4 mb-2">
              <div className="flex-1 h-px" style={{ background: '#EEF2F8' }} />
              <span className="text-sm font-black text-[#071B33] tracking-wide px-1">
                {ar ? 'كعميل' : 'As a Customer'}
              </span>
              <div className="flex-1 h-px" style={{ background: '#EEF2F8' }} />
            </div>
            <button
              onClick={() => setShowRequest(true)}
              className="w-full rounded-3xl active:translate-y-[3px] transition-all duration-100 select-none"
              style={{
                background: 'linear-gradient(135deg, #FF7900 0%, #FF5500 100%)',
                boxShadow: '0 6px 0 #C44E00, 0 8px 28px rgba(255,121,0,0.45)',
                padding: '0',
              }}>
              <div className="flex items-center gap-4 px-5 py-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)' }}>
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-white text-base leading-tight tracking-tight">
                    {ar ? '🔧 اطلب خدمة الآن' : '🔧 Request Service Now'}
                  </p>
                  <p className="text-[13px] text-white/80 mt-0.5 font-semibold">
                    {ar ? 'أخبر المورد بما تحتاجه' : 'Tell the supplier what you need'}
                  </p>
                </div>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <span className="text-white font-black text-sm leading-none">{ar ? '←' : '→'}</span>
                </div>
              </div>
            </button>
            <div className="mt-5 pt-4" style={{ borderTop: '1px dashed #D8E0EA' }}>
              <button
                onClick={() => setShowReport(true)}
                className="w-full flex items-center justify-center gap-1.5 text-black text-xs font-black py-2.5 rounded-xl transition-all"
                style={{ background: '#F8F8F8', border: '2px solid #000' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                {ar ? 'تحديث أو إبلاغ' : 'Update or Report'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Basic Info ── */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
              <MapPin className="w-4 h-4 text-[#FF7900]" />
            </div>
            <p className="font-bold text-white text-sm">{ar ? 'المعلومات الأساسية' : 'Basic Info'}</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {contactName && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{ar ? 'المسؤول' : 'Contact Person'}</p>
                <p className="font-medium text-gray-800 text-sm">{contactName}</p>
              </div>
            )}
            {city && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{ar ? 'الموقع' : 'Location'}</p>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7900] flex-shrink-0" />
                  <p className="font-medium text-gray-800 text-sm">{city}{area ? ` · ${area}` : ''}</p>
                </div>
              </div>
            )}
            {supplyLabel && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{ar ? 'نوع المستلزمات' : 'Supply Type'}</p>
                <p className="font-medium text-gray-800 text-sm">{supplyEmoji} {supplyLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        {description && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Package className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? 'عن النشاط' : 'About'}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>
        )}

        {/* ── Shop Images ── */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
              <ImageIcon className="w-4 h-4 text-[#FF7900]" />
            </div>
            <p className="font-bold text-white text-sm">
              {ar
                ? `صور النشاط${shopImages.length > 0 ? ` (${shopImages.length})` : ''}`
                : `Shop Photos${shopImages.length > 0 ? ` (${shopImages.length})` : ''}`}
            </p>
          </div>
          <div className="px-5 py-4">
            {shopImages.length > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-[#0e5c6d]/10 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[#0e5c6d]/50" />
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  {ar ? 'لا توجد صور بعد' : 'No photos yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Social Media ── */}
        {(facebook || instagram || tiktok) && (
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Share2 className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">{ar ? 'وسائل التواصل' : 'Social Media'}</p>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              {facebook && (
                <a href={facebook.startsWith('http') ? facebook : `https://${facebook}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 active:opacity-70 transition-opacity">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">f</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 truncate">{facebook}</span>
                </a>
              )}
              {instagram && (
                <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 active:opacity-70 transition-opacity">
                  <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📸</span>
                  </div>
                  <span className="text-sm font-medium text-pink-600 truncate">{instagram}</span>
                </a>
              )}
              {tiktok && (
                <a href={tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok.replace('@', '')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 active:opacity-70 transition-opacity">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎵</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{tiktok}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Reviews Section ── */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(7,27,51,0.10)', borderTop: '3px solid #FF7900', boxShadow: '0 8px 32px rgba(7,27,51,0.14), 0 2px 8px rgba(255,121,0,0.07)', background: '#fff' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #071B33 0%, #0D2545 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <Star className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="font-bold text-white text-sm">
                {ar ? 'التقييمات' : 'Reviews'}
              </p>
            </div>
            {reviews.length > 0 && (
              <button
                onClick={() => setShowReviews(v => !v)}
                className="text-xs font-bold text-orange-300 underline underline-offset-2 active:opacity-70"
              >
                {showReviews
                  ? (ar ? 'إخفاء' : 'Hide')
                  : (ar ? `عرض الكل (${reviews.length})` : `Show all (${reviews.length})`)}
              </button>
            )}
          </div>

          <div className="px-4 py-4">
            {/* Summary row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-4xl font-black text-[#071B33]">{rating > 0 ? rating.toFixed(1) : '—'}</p>
                <Stars rating={rating} count={0} size="sm" />
                <p className="text-xs text-gray-400 mt-0.5">
                  {reviewsCount} {ar ? 'تقييم' : 'reviews'}
                </p>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map(s => {
                  const cnt = reviews.filter(r => r.rating === s).length
                  const pct = reviews.length ? (cnt / reviews.length) * 100 : 0
                  return (
                    <div key={s} className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-gray-400 w-3 text-right">{s}</span>
                      <Star className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" />
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-400 w-4">{cnt}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Write review prompt */}
            {reviewModal && !submitted && (
              <div className="bg-[#EEF9F8] border border-teal-200 rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-[#071B33] mb-3 text-center">
                  {ar ? `قيّم ${name}` : `Rate ${name}`}
                </p>
                <InteractiveStars value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                {form.rating > 0 && (
                  <p className="text-center text-xs font-bold text-amber-500 mt-1">
                    {ar ? RATING_LABELS_AR[form.rating] : RATING_LABELS_EN[form.rating]}
                  </p>
                )}
                <input
                  type="text"
                  placeholder={ar ? 'اسمك (مطلوب)' : 'Your name (required)'}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-3 w-full border border-teal-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0e5c6d]/30"
                  dir={dir}
                />
                {!showComment ? (
                  <button
                    onClick={() => setShowComment(true)}
                    className="mt-2 text-xs text-[#0e5c6d] underline underline-offset-2 w-full text-center active:opacity-70"
                  >
                    {ar ? '+ أضف تعليقاً (اختياري)' : '+ Add a comment (optional)'}
                  </button>
                ) : (
                  <textarea
                    rows={3}
                    placeholder={ar ? 'تعليقك (اختياري)' : 'Your comment (optional)'}
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    className="mt-2 w-full border border-teal-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0e5c6d]/30 resize-none"
                    dir={dir}
                  />
                )}
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !form.name.trim() || form.rating === 0}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{ background: '#0e5c6d' }}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? (ar ? 'جارٍ الإرسال...' : 'Sending...') : (ar ? 'إرسال التقييم' : 'Submit Review')}
                </button>
              </div>
            )}

            {/* Success state */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 text-center">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm font-bold text-green-700">
                  {ar ? 'شكراً! تم إرسال تقييمك.' : 'Thanks! Your review was submitted.'}
                </p>
              </div>
            )}

            {/* Reviews list */}
            {showReviews && reviews.length > 0 && (
              <div className="space-y-3 mt-2">
                {reviews.map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-800">{r.reviewerName}</p>
                      <Stars rating={r.rating} count={0} size="sm" />
                    </div>
                    {r.comment && <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>}
                    <p className="text-[10px] text-gray-300 mt-1">
                      {new Date(r.createdAt).toLocaleDateString(ar ? 'ar-LY' : 'en-LY', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {reviews.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">
                  {ar ? 'لا توجد تقييمات بعد. كن أول من يقيّم!' : 'No reviews yet. Be the first to rate!'}
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        entityType="supplier"
        entityId={String(id)}
        entityName={name}
        city={city}
        ar={ar}
      />
      <RequestFormModal
        open={showRequest}
        onClose={() => setShowRequest(false)}
        ownerType="supplier"
        ownerId={String(id)}
        ownerName={name}
        ownerWhatsapp={whatsapp || ''}
        profileUrl={window.location.href}
        ar={ar}
      />
    </div>
  )
}
