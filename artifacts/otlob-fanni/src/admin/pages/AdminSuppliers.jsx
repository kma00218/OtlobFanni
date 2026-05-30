// @refresh reset
import { useEffect, useState, useRef } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Package, Phone, MapPin, FileText, Facebook, Image, X, Upload, Instagram, ExternalLink, Plus, Trash2, Share2, AlertTriangle, Eye, Pencil, EyeOff, Sparkles, UserPlus, MessageCircle } from 'lucide-react'
import api, { getFileUrl, uploadFile } from '../../lib/api'
import AiTagsModal from '../components/AiTagsModal'
import AiBatchButton from '../components/AiBatchButton'
import { SUPPLY_TYPES, supplyTypeLabel } from '../../data/suppliers'

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function InfoBlock({ icon: Icon, label, value, dir, multiline, action }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {multiline
          ? <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{value || '—'}</p>
          : <p className="text-sm text-slate-700 font-semibold" dir={dir}>{value || '—'}</p>
        }
        {action && value && (
          <a href={action.href} target="_blank" rel="noreferrer"
            className="flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full flex-shrink-0 hover:bg-emerald-600 transition-colors">
            <action.icon />
          </a>
        )}
      </div>
    </div>
  )
}

const emptyForm = {
  business_name: '', contact_name: '', phone: '', whatsapp: '',
  city: '', area: '', address: '',
  supply_type: '', description: '',
  logo: '', shop_images: [], facebook: '', instagram: '', tiktok: '',
}

const inp = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 focus:border-[#FF7900] transition-colors placeholder:text-slate-400'
const sel = inp + ' appearance-none cursor-pointer'

export default function AdminSuppliers() {
  const { isSuperAdmin } = useAdmin()
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterType, setFilterType]             = useState('')
  const [filterIncomplete, setFilterIncomplete] = useState(false)
  const [viewItem, setViewItem]                 = useState(null)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const [toast, setToast]           = useState(null)
  const [credsSending, setCredsSending] = useState(null)
  const [aiModal, setAiModal]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const sendCredentials = async (row) => {
    setCredsSending(row.id)
    try {
      const data = await api.pro.generateCredentials('supplier', row.id)
      const phone = (data.whatsapp || '').replace(/\D/g, '')
      const msg =
        `تم تفعيل حسابك المهني على منصة اطلب فني 🎉\n\n` +
        `يمكنك الآن الدخول إلى أدوات العمل والفواتير عبر منصة:\n` +
        `🌐 otlobfanni.ly\n\n` +
        `من صفحة:\nالمزيد ← دخول الحسابات المهنية\n\n` +
        `اسم المستخدم:\n${data.whatsapp}\n\n` +
        `كلمة المرور:\n${data.password}`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
      showToast('✓ تم إرسال بيانات الدخول')
    } catch { showToast('حدث خطأ أثناء إنشاء بيانات الدخول', 'error') }
    finally { setCredsSending(null) }
  }

  const sendNominationInvite = (row) => {
    const name = (row.businessName || row.business_name || '').trim()
    const msg =
      `مرحباً ${name} 👋\n\n` +
      `رشّحكم أحد معارفكم للانضمام إلى منصة *اطلب فني* — الدليل الرقمي للفنيين والشركات في ليبيا 🇱🇾\n\n` +
      `سجّلوا نشاطكم مجاناً وكونوا مرجعاً للفنيين والشركات في منطقتكم.\n\n` +
      `📲 سجّل من هنا: https://otlobfanni.ly/join-supplier`
    const phone = ((row.whatsapp || row.phone) || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendNudgeSupplier = (row) => {
    const name = row.businessName || ''
    const missing = []
    if (!row.logo) missing.push('— لا يوجد شعار')
    if (!(row.shopImages || []).length) missing.push('— لا توجد صور أعمال')
    if (!missing.length) return
    const msg =
      `مرحباً ${name}، ملفكم على منصة اطلب فني يحتاج إلى تحسين وتعديل 🔧\n\n` +
      missing.join('\n') +
      `\n\nأضيفوها لتظهروا أكثر في نتائج البحث وتحصلوا على عملاء أكثر 📈\n\n` +
      `شاهدوا ملفكم من هنا:\nhttps://otlobfanni.ly/supplier/${row.id}\n\n` +
      `👆 اضغطوا على زر "تحديث أو إبلاغ" في الملف لإرسال الصور أو أي تعديل`
    const phone = ((row.whatsapp || row.phone) || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const reload = () => {
    setLoading(true)
    api.admin.suppliers.list()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const autoOpened = useRef(false)
  useEffect(() => {
    if (loading || autoOpened.current || !data.length) return
    const editId = new URLSearchParams(window.location.search).get('edit')
    if (!editId) return
    const row = data.find(r => String(r.id) === String(editId))
    if (row) { openEdit(row); autoOpened.current = true }
  }, [loading, data])

  const handleRevoke = async (id) => {
    if (!confirm('هل تريد إلغاء نشر هذا المزود؟ سيعود إلى قائمة الطلبات.')) return
    try {
      await api.admin.suppliers.setStatus(id, 'pending')
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم إلغاء النشر وإعادة المزود إلى قائمة الطلبات')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا المزود نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return
    try {
      await api.admin.suppliers.delete(id)
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم الحذف بنجاح')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const openEdit = (row) => {
    setEditItem(row)
    setForm({
      business_name: row.businessName  || '',
      contact_name:  row.contactName   || '',
      phone:         row.phone         || '',
      whatsapp:      row.whatsapp      || '',
      city:          row.city          || '',
      area:          row.area          || '',
      address:       row.address       || '',
      supply_type:   row.supplyType    || '',
      description:   row.description   || '',
      logo:          row.logo          || '',
      shop_images:   row.shopImages    || [],
      facebook:      row.facebook      || '',
      instagram:     row.instagram     || '',
      tiktok:        row.tiktok        || '',
    })
    setViewItem(null)
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditItem({ id: null })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem.id === null) {
        const created = await api.admin.suppliers.create(form)
        setData(prev => [created, ...prev])
        showToast('تم إضافة المزود بنجاح')
      } else {
        const updated = await api.admin.suppliers.update(editItem.id, form)
        setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...updated } : r))
        showToast('تم حفظ التغييرات بنجاح')
      }
      setEditItem(null)
    } catch { showToast('حدث خطأ', 'error') }
    setSaving(false)
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setLogoUploading(true)
    try {
      const path = await uploadFile(file)
      setForm(f => ({ ...f, logo: path }))
    } catch { showToast('فشل رفع الصورة', 'error') }
    setLogoUploading(false)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort()

  const filtered = data.filter(r => {
    const name    = r.businessName || ''
    const contact = r.contactName  || ''
    const digits  = search.replace(/\D/g, '').slice(-6)
    const byId    = digits.length >= 4 && String(r.id).replace(/\D/g, '').slice(-6) === digits
    const s = !search || name.includes(search) || contact.includes(search) || r.phone?.includes(search) || r.city?.includes(search) || byId
    const c = !filterCity || r.city === filterCity
    const t = !filterType || r.supplyType === filterType
    const i = !filterIncomplete || !r.logo || !(r.shopImages || []).length
    return s && c && t && i
  })

  const columns = [
    {
      key: 'businessName', label: 'النشاط',
      render: (v, row) => {
        const logo = getFileUrl(row.logo || null)
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-[#0e5c6d] to-[#072a36] flex items-center justify-center rounded-xl">
                    <span className="text-white text-[10px] font-bold text-center px-0.5 leading-tight">{(v || '').trim().split(' ')[0]}</span>
                  </div>
              }
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-[#071B33] text-sm">{v || '—'}</p>
                {(() => {
                  const missing = []
                  if (!row.logo) missing.push('بدون شعار')
                  if (!(row.shopImages || []).length) missing.push('بدون صور أعمال')
                  return missing.length > 0 ? (
                    <span title={missing.join(' · ')} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200 cursor-default">
                      <AlertTriangle className="w-2.5 h-2.5" />{missing.length}
                    </span>
                  ) : null
                })()}
              </div>
              <p className="text-xs text-slate-500">{row.contactName || '—'}</p>
              {(row.aiTags || row.ai_tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(row.aiTags || row.ai_tags).slice(0, 3).map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-200 text-[10px] font-medium">{t}</span>
                  ))}
                  {(row.aiTags || row.ai_tags).length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">+{(row.aiTags || row.ai_tags).length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    { key: 'phone', label: 'الهاتف', render: v => <span className="text-xs text-slate-400" dir="ltr">{v || '—'}</span> },
    { key: 'city',  label: 'المدينة', render: v => v || '—' },
    {
      key: 'supplyType', label: 'نوع المستلزمات',
      render: (v, row) => (
        <span className="text-sm text-slate-600">
          {supplyTypeLabel(v, 'ar')}{row.customSupplyType ? ` / ${row.customSupplyType}` : ''}
        </span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
            title="عرض">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openEdit(row)}
            className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors"
            title="تعديل">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setAiModal({ ...row, entityType: 'supplier' })}
            className="p-1.5 hover:bg-violet-500/10 text-violet-400 rounded-lg transition-colors"
            title="استخراج تخصصات AI">
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => window.open(`https://wa.me/${((row.whatsapp || row.phone) || '').replace(/\D/g, '')}?text=${encodeURIComponent(`مبروك ${row.businessName || row.business_name || ''}! 🎉 تم نشر نشاطكم الآن على دليل مزودي المستلزمات في منصة اطلب فني 🇱🇾\n\nيمكنكم الآن مشاركة نشاطكم مع عملائكم عبر هذا الرابط:\n👉 https://otlobfanni.ly/supplier/${row.id}\n\n📲 لتثبيت التطبيق على هاتفك:\nافتح: www.otlobfanni.ly\n\n📢 تابع القناة الرسمية لمنصة اطلب فني على تيليجرام لمشاهدة:\n\n• الفنيين الجدد\n• التحديثات\n• الخدمات الجديدة\n• نصائح وتحسينات المنصة\n\n👉 https://t.me/OtlobFanni`)}`, '_blank')}
              className="p-1.5 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors"
              title="رسالة الترحيب 🎉">
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => window.open(`https://wa.me/${((row.whatsapp || row.phone) || '').replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${row.businessName || row.business_name || ''}، شكراً لانضمامكم لمنصة اطلب فني\nنتمنى منكم مشاركة المنصة مع عملائكم وشركائكم حتى يستفيد الجميع 👇\nhttps://otlobfanni.ly`)}`, '_blank')}
              className="p-1.5 hover:bg-violet-500/10 text-violet-400 rounded-lg transition-colors"
              title="طلب المشاركة">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => sendNominationInvite(row)}
              className="p-1.5 hover:bg-cyan-500/10 text-cyan-400 rounded-lg transition-colors"
              title="دعوة مرشَّح للانضمام">
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}
          {(row.whatsapp || row.phone) && (!row.logo || !(row.shopImages || []).length) && (
            <button
              onClick={() => sendNudgeSupplier(row)}
              className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"
              title="نج لإكمال الملف">
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => sendCredentials(row)}
              disabled={credsSending === row.id}
              className="p-1.5 hover:bg-orange-500/10 text-orange-400 rounded-lg transition-colors disabled:opacity-50"
              title="إرسال بيانات الدخول">
              {credsSending === row.id
                ? <span className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin inline-block" />
                : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              }
            </button>
          )}
          <button onClick={() => handleRevoke(row.id)}
            className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"
            title="إلغاء النشر">
            <EyeOff className="w-3.5 h-3.5" />
          </button>
          {isSuperAdmin && (
            <button onClick={() => handleDelete(row.id)}
              className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
              title="حذف">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-xl ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#071B33]">مزودو المستلزمات</h1>
          <p className="text-slate-500 text-sm mt-0.5">هؤلاء المزودون تمت الموافقة عليهم وأصبحوا جزءاً من الدليل.</p>
        </div>
        <div className="flex items-center gap-3">
          <AiBatchButton entityType="supplier" onComplete={reload} />
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] hover:bg-[#e86d00] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> إضافة مزود
          </button>
          <div className="flex items-center gap-2 bg-[#0e5c6d]/10 border border-[#0e5c6d]/20 rounded-2xl px-4 py-2">
            <Package className="w-4 h-4 text-[#0e5c6d]" />
            <span className="text-[#0e5c6d] font-black text-lg">{data.length}</span>
            <span className="text-[#0e5c6d]/70 text-xs font-medium">مزود</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className={inp + ' flex-1 min-w-[180px]'}
          placeholder="بحث بالاسم أو الهاتف أو المدينة..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className={sel + ' w-40'} value={filterCity} onChange={e => setFilterCity(e.target.value)}>
          <option value="">كل المدن</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={sel + ' w-48'} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">كل الأنواع</option>
          {SUPPLY_TYPES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.nameAr}</option>)}
        </select>
        <button
          onClick={() => setFilterIncomplete(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${filterIncomplete ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          غير مكتمل
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="لا يوجد مزودون منشورون بعد — قم بالموافقة على الطلبات من صفحة طلبات المستلزمات"
      />

      {/* ── View Modal ────────────────────────────────────── */}
      {viewItem && (
        <FormModal open title={viewItem.businessName || 'تفاصيل المزود'} onClose={() => setViewItem(null)} size="lg" hideFooter>
          <div className="space-y-5">
            {/* Logo + name */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 flex-shrink-0">
                {getFileUrl(viewItem.logo)
                  ? <img src={getFileUrl(viewItem.logo)} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-[#0e5c6d] to-[#072a36] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{(viewItem.businessName || '').trim().split(' ')[0]}</span>
                    </div>
                }
              </div>
              <div>
                <h3 className="font-bold text-[#071B33] text-lg">{viewItem.businessName}</h3>
                <p className="text-slate-500 text-sm">{viewItem.contactName}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-100">
                  {supplyTypeLabel(viewItem.supplyType, 'ar')}{viewItem.customSupplyType ? ` / ${viewItem.customSupplyType}` : ''}
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <InfoBlock icon={Phone} label="الهاتف" value={viewItem.phone} dir="ltr" />
              <InfoBlock icon={Phone} label="واتساب" value={viewItem.whatsapp} dir="ltr"
                action={viewItem.whatsapp ? { href: `https://wa.me/${viewItem.whatsapp?.replace(/\D/g,'')}`, icon: WaIcon } : null} />
              <InfoBlock icon={MapPin} label="المدينة" value={viewItem.city} />
              <InfoBlock icon={MapPin} label="المنطقة / الحي" value={viewItem.area || '—'} />
            </div>
            {viewItem.email && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-400 font-medium">البريد الإلكتروني</p>
                </div>
                <a href={`mailto:${viewItem.email}`} className="text-sm text-blue-500 font-semibold hover:underline" dir="ltr">{viewItem.email}</a>
              </div>
            )}
            {viewItem.address && <InfoBlock icon={MapPin} label="العنوان التفصيلي" value={viewItem.address} />}
            {viewItem.description && <InfoBlock icon={FileText} label="وصف النشاط" value={viewItem.description} multiline />}

            {/* Shop images */}
            {viewItem.shopImages?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">صور المحل / المنتجات</p>
                <div className="flex gap-2 flex-wrap">
                  {viewItem.shopImages.map((img, i) => (
                    <button key={i} onClick={() => setLightbox(getFileUrl(img))}
                      className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                      <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Social */}
            {(viewItem.facebook || viewItem.instagram || viewItem.tiktok) && (
              <div className="flex flex-wrap gap-2">
                {viewItem.facebook && (
                  <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100">
                    <Facebook className="w-3.5 h-3.5" /> Facebook
                  </a>
                )}
                {viewItem.instagram && (
                  <a href={viewItem.instagram} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-xl text-xs font-semibold hover:bg-pink-100">
                    <Instagram className="w-3.5 h-3.5" /> Instagram
                  </a>
                )}
                {viewItem.tiktok && (
                  <a href={viewItem.tiktok} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100">
                    <ExternalLink className="w-3.5 h-3.5" /> TikTok
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => openEdit(viewItem)}
                className="flex-1 py-2.5 rounded-xl bg-[#071B33] text-white text-sm font-bold hover:bg-[#0f2a4a] transition-colors">
                تعديل البيانات
              </button>
              <button onClick={() => handleRevoke(viewItem.id)}
                className="px-4 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-sm font-bold hover:bg-amber-200 transition-colors">
                إلغاء النشر
              </button>
              {isSuperAdmin && (
                <button onClick={() => handleDelete(viewItem.id)}
                  className="px-4 py-2.5 rounded-xl bg-red-100 text-red-600 text-sm font-bold hover:bg-red-200 transition-colors">
                  حذف
                </button>
              )}
            </div>
          </div>
        </FormModal>
      )}

      {/* ── Edit Modal ────────────────────────────────────── */}
      {editItem && (
        <FormModal open title={editItem.id === null ? 'إضافة مزود جديد' : `تعديل: ${editItem.businessName || ''}`} onClose={() => setEditItem(null)} size="lg" onSubmit={handleSave} loading={saving} submitLabel={saving ? 'جارٍ الحفظ...' : (editItem.id === null ? 'إضافة المزود' : 'حفظ التغييرات')}>
          <div className="space-y-4">
            {/* Logo upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 flex-shrink-0 cursor-pointer relative"
                onClick={() => document.getElementById('logo-upload-edit')?.click()}>
                {getFileUrl(form.logo)
                  ? <img src={getFileUrl(form.logo)} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-[#0e5c6d] to-[#072a36] flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                }
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="logo-upload-edit" className="cursor-pointer text-sm font-semibold text-[#FF7900] hover:underline">
                  {form.logo ? 'تغيير الشعار' : 'رفع شعار'}
                </label>
                <input id="logo-upload-edit" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {form.logo && (
                  <button type="button" onClick={() => set('logo', '')}
                    className="block text-xs text-red-400 hover:underline mt-1">إزالة الشعار</button>
                )}
              </div>
            </div>

            {/* ── معرض صور المتجر ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-slate-400" />
                صور المتجر / المستلزمات
              </label>
              <div className="space-y-3">
                {(form.shop_images || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(form.shop_images || []).map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(getFileUrl(img))} />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, shop_images: (f.shop_images || []).filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border border-[#FF7900]/40 text-[#FF7900] text-sm font-medium hover:bg-[#FF7900]/5 transition-colors ${galleryUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-4 h-4" />
                    {galleryUploading ? 'جارٍ الرفع...' : 'إضافة صورة'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={async e => {
                      const files = Array.from(e.target.files || [])
                      if (!files.length) return
                      setGalleryUploading(true)
                      try {
                        const paths = await Promise.all(files.map(f => uploadFile(f)))
                        setForm(f => ({ ...f, shop_images: [...(f.shop_images || []), ...paths] }))
                      } catch { showToast('فشل رفع الصورة', 'error') }
                      setGalleryUploading(false)
                      e.target.value = ''
                    }} />
                  </label>
                  {(form.shop_images || []).length > 0 && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, shop_images: [] }))}
                      className="text-xs text-red-400 hover:text-red-500">
                      حذف جميع الصور
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">اسم النشاط *</label>
                <input className={inp} required value={form.business_name} onChange={e => set('business_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">اسم المسؤول *</label>
                <input className={inp} required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">نوع المستلزمات</label>
                <select className={sel} value={form.supply_type} onChange={e => set('supply_type', e.target.value)}>
                  <option value="">اختر...</option>
                  {SUPPLY_TYPES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.nameAr}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">الهاتف *</label>
                <input className={inp} dir="ltr" required value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">واتساب *</label>
                <input className={inp} dir="ltr" required value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">المدينة *</label>
                <input className={inp} required value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">المنطقة / الحي</label>
                <input className={inp} value={form.area} onChange={e => set('area', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">العنوان التفصيلي</label>
                <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">وصف النشاط</label>
                <textarea className={inp} rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Facebook</label>
                <input className={inp} dir="ltr" value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instagram</label>
                <input className={inp} dir="ltr" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">TikTok</label>
                <input className={inp} dir="ltr" value={form.tiktok} onChange={e => set('tiktok', e.target.value)} placeholder="https://tiktok.com/@..." />
              </div>
            </div>

          </div>
        </FormModal>
      )}

      <AiTagsModal
        open={!!aiModal}
        onClose={() => setAiModal(null)}
        entity={aiModal}
        onSaved={(tags) => {
          setData(prev => prev.map(r => r.id === aiModal?.id ? { ...r, aiTags: tags } : r))
          showToast('تم حفظ التخصصات بنجاح')
        }}
      />

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
