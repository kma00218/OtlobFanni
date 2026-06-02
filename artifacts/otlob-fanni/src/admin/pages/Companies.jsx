import { useEffect, useState, useRef } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import {
  Eye, Pencil, Building2, Phone, MapPin, Briefcase, Clock,
  Facebook, Image, FileText, Lock, Shield, Info, XCircle, Upload, X,
  Plus, Trash2, Share2, AlertTriangle, Sparkles, UserPlus, MessageCircle, LogIn
} from 'lucide-react'
import api, { getFileUrl, uploadFile } from '../../lib/api'
import AiTagsModal from '../components/AiTagsModal'
import AiBatchButton from '../components/AiBatchButton'
import { sections as SECTIONS, categories as SERVICES_CATS } from '../../data/services'
import SpecialtyAccordion from '../../components/SpecialtyAccordion'

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const DAY_AR = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
}

const DAY_OPTIONS = [
  { en: 'Saturday',  ar: 'السبت'    },
  { en: 'Sunday',    ar: 'الأحد'    },
  { en: 'Monday',    ar: 'الاثنين'  },
  { en: 'Tuesday',   ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday',  ar: 'الخميس'   },
  { en: 'Friday',    ar: 'الجمعة'   },
]

const emptyForm = {
  company_name: '', contact_name: '', phone: '', whatsapp: '',
  commercial_reg: '', city: '', area: '', address: '',
  specialty: '', extra_specialties: [], years_active: '', description: '', certifications: '',
  price_from: '', price_to: '', available_now: false, emergency: false,
  working_days: [],
  hours_from: '', hours_to: '', service_radius: '', facebook: '', instagram: '',
  company_logo: '', work_images: [],
}

export default function Companies() {
  const { isSuperAdmin } = useAdmin()
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterCat, setFilterCat]               = useState('')
  const [filterIncomplete, setFilterIncomplete] = useState(false)
  const [viewItem, setViewItem]                 = useState(null)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const [categories, setCategories] = useState([])
  const [toast, setToast]           = useState(null)
  const [credsSending, setCredsSending] = useState(null)
  const [aiModal, setAiModal]           = useState(null)
  const [editSelectedCats, setEditSelectedCats] = useState([])
  const [editSuggestedSpecs, setEditSuggestedSpecs] = useState({})
  const [editNewDepts, setEditNewDepts] = useState([])
  const [editChipInputs, setEditChipInputs] = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const sendCredentials = async (row) => {
    setCredsSending(row.id)
    try {
      const data = await api.pro.generateCredentials('company', row.id)
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
    const name = (row.companyName || row.company_name || '').trim()
    const msg =
      `مرحباً ${name} 👋\n\n` +
      `رشّحكم أحد معارفكم للانضمام إلى منصة *اطلب فني* — الدليل الرقمي للفنيين والشركات في ليبيا 🇱🇾\n\n` +
      `سجّلوا شركتكم مجاناً وابدأوا تستقبلوا طلبات من عملاء في منطقتكم.\n\n` +
      `📲 سجّل من هنا: https://otlobfanni.ly/join-company`
    const phone = ((row.whatsapp || row.phone) || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendNudgeCompany = (row) => {
    const name = row.companyName || ''
    const missing = []
    if (!row.companyLogo) missing.push('— لا يوجد شعار')
    if (!(row.workImages || []).length) missing.push('— لا توجد صور أعمال')
    if (!missing.length) return
    const msg =
      `مرحباً ${name}، ملفكم على منصة اطلب فني يحتاج إلى تحسين وتعديل 🔧\n\n` +
      missing.join('\n') +
      `\n\nأضيفوها لتظهروا أكثر في نتائج البحث وتحصلوا على عملاء أكثر 📈\n\n` +
      `شاهدوا ملفكم من هنا:\nhttps://otlobfanni.ly/company/${row.id}\n\n` +
      `👆 اضغطوا على زر "تحديث أو إبلاغ" في الملف لإرسال الصور أو أي تعديل`
    const phone = ((row.whatsapp || row.phone) || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const catLabel = (id) => {
    if (!id) return '—'
    if (id === 'more_services') return 'تخصص آخر (مخصص)'
    const cat = SERVICES_CATS.find(c => c.id === id)
    if (cat) return cat.nameAr
    const dbCat = categories.find(c => c.id === id)
    return dbCat ? (dbCat.nameAr || dbCat.name_ar) : id
  }

  const catsBySection = SECTIONS.map(sec => ({
    ...sec,
    cats: SERVICES_CATS.filter(c => c.sectionId === sec.id && c.id !== 'more'),
  })).filter(s => s.cats.length > 0)

  const reload = () => {
    setLoading(true)
    api.admin.companies.list()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    reload()
    api.categories().then(setCategories).catch(() => {})
  }, [])

  const autoOpened = useRef(false)
  useEffect(() => {
    if (loading || autoOpened.current || !data.length) return
    const editId = new URLSearchParams(window.location.search).get('edit')
    if (!editId) return
    const row = data.find(r => String(r.id) === String(editId))
    if (row) { openEdit(row); autoOpened.current = true }
  }, [loading, data])

  const handleRevoke = async (id) => {
    if (!confirm('هل تريد إلغاء الموافقة على هذه الشركة؟ ستعود إلى قائمة الطلبات.')) return
    try {
      await api.admin.companies.setStatus(id, 'pending')
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم إلغاء الموافقة وإعادة الشركة إلى قائمة الطلبات')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const openEdit = (row) => {
    setEditItem(row)
    const primary = row.specialty || ''
    const extras  = row.extraSpecialties || row.extra_specialties || []
    setEditSelectedCats([primary, ...extras].filter(Boolean))
    setEditSuggestedSpecs({})
    setEditNewDepts([])
    setEditChipInputs({})
    setForm({
      company_name:    row.companyName   || '',
      contact_name:    row.contactName   || '',
      phone:           row.phone         || '',
      whatsapp:        row.whatsapp      || '',
      commercial_reg:  row.commercialReg || '',
      city:            row.city          || '',
      area:            row.area          || '',
      address:         row.address       || '',
      specialty:       primary,
      extra_specialties: extras,
      years_active:    row.yearsActive   || '',
      description:     row.description   || '',
      certifications:  row.certifications|| '',
      price_from:      row.priceFrom     || '',
      price_to:        row.priceTo       || '',
      available_now:   row.availableNow  ?? false,
      emergency:       row.emergency     ?? false,
      hours_from:      row.hoursFrom     || '',
      hours_to:        row.hoursTo       || '',
      service_radius:  row.serviceRadius || '',
      facebook:        row.facebook      || '',
      instagram:       row.instagram     || '',
      working_days:    row.workingDays   || [],
      company_logo:    row.companyLogo   || '',
      work_images:     row.workImages    || [],
    })
    setViewItem(null)
  }

  const companyToggleCat = (id) => {
    setEditSelectedCats(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setForm(f => ({ ...f, specialty: next[0] || '', extra_specialties: next.slice(1) }))
      return next
    })
  }
  const companyAddSuggested = (sId) => {
    const val = (editChipInputs[sId] || '').trim()
    if (!val) return
    setEditSuggestedSpecs(p => ({ ...p, [sId]: [...(p[sId] || []), val] }))
    setEditChipInputs(p => ({ ...p, [sId]: '' }))
  }
  const companyRemoveSuggested = (sId, idx) =>
    setEditSuggestedSpecs(p => ({ ...p, [sId]: (p[sId] || []).filter((_, i) => i !== idx) }))
  const companyAddNewDept = () => {
    const val = (editChipInputs['__new_dept__'] || '').trim()
    if (!val) return
    setEditNewDepts(p => [...p, val])
    setEditChipInputs(p => ({ ...p, '__new_dept__': '' }))
  }
  const companyRemoveNewDept = (idx) => setEditNewDepts(p => p.filter((_, i) => i !== idx))

  const openAdd = () => {
    setForm(emptyForm)
    setEditItem({ id: null })
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشركة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return
    try {
      await api.admin.companies.delete(id)
      setData(prev => prev.filter(r => r.id !== id))
      showToast('تم حذف الشركة بنجاح')
    } catch { showToast('حدث خطأ أثناء الحذف', 'error') }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem.id === null) {
        const created = await api.admin.companies.create(form)
        setData(prev => [created, ...prev])
        showToast('تم إضافة الشركة بنجاح')
      } else {
        const updated = await api.admin.companies.update(editItem.id, form)
        setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...updated } : r))
        showToast('تم حفظ التغييرات بنجاح')
      }
      setEditItem(null)
    } catch { showToast('حدث خطأ', 'error') }
    setSaving(false)
  }

  const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort()

  const sectionLabel = (specialtyId) => {
    if (!specialtyId || specialtyId === 'more_services') return ''
    const cat = SERVICES_CATS.find(c => c.id === specialtyId)
    return SECTIONS.find(s => s.id === cat?.sectionId)?.nameAr || ''
  }

  const filtered = data.filter(r => {
    const name    = r.companyName  || ''
    const contact = r.contactName  || ''
    const digits  = search.replace(/\D/g, '').slice(-6)
    const byId    = digits.length >= 4 && String(r.id).replace(/\D/g, '').slice(-6) === digits
    const s = !search || name.includes(search) || contact.includes(search) || r.phone?.includes(search) || r.city?.includes(search) || byId
    const c = !filterCity || r.city === filterCity
    const t = !filterCat  || r.specialty === filterCat
    const i = !filterIncomplete || !r.companyLogo || !(r.workImages || []).length
    return s && c && t && i
  })

  const columns = [
    {
      key: 'companyName', label: 'الشركة / المؤسسة',
      render: (v, row) => {
        const logo = getFileUrl(row.companyLogo || null)
        const contact = row.contactName || ''
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center rounded-xl">
                    <span className="text-white text-[10px] font-bold text-center px-0.5 leading-tight">{(v || '').trim().split(' ')[0]}</span>
                  </div>
              }
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-[#071B33] text-sm">{v || '—'}</p>
                {(() => {
                  const missing = []
                  if (!row.companyLogo) missing.push('بدون شعار')
                  if (!(row.workImages || []).length) missing.push('بدون صور أعمال')
                  return missing.length > 0 ? (
                    <span title={missing.join(' · ')} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200 cursor-default">
                      <AlertTriangle className="w-2.5 h-2.5" />{missing.length}
                    </span>
                  ) : null
                })()}
              </div>
              <p className="text-xs text-slate-500">{contact || '—'}</p>
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
    {
      key: 'phone', label: 'الهاتف',
      render: (v) => <span className="text-xs text-slate-400" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة', render: v => v || '—' },
    {
      key: 'specialty', label: 'القسم / التخصص',
      render: (v) => (
        <div>
          {sectionLabel(v) && <p className="text-xs text-[#FF7900]/70 font-medium">{sectionLabel(v)}</p>}
          <p className="text-sm text-slate-600">{catLabel(v)}</p>
        </div>
      ),
    },
    {
      key: 'yearsActive', label: 'سنوات النشاط',
      render: (v) => EXP_LABEL[v] || v || '—',
    },
    {
      key: 'createdAt', label: 'تاريخ الانضمام',
      render: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '—',
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => window.open(`https://wa.me/${((row.whatsapp || row.phone) || '').replace(/\D/g, '')}`, '_blank')}
              className="p-1.5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors"
              title="فتح واتساب">
              <WaIcon />
            </button>
          )}
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => window.open(`https://wa.me/${((row.whatsapp || row.phone) || '').replace(/\D/g, '')}?text=${encodeURIComponent(`مبروك ${row.companyName || row.company_name || ''}! 🎉 تم نشر شركتكم الآن على منصة اطلب فني 🇱🇾\n\nيمكنكم الآن مشاركة نشاطكم مع عملائكم عبر هذا الرابط:\n👉 https://otlobfanni.ly/company/${row.id}\n\n📲 لتثبيت التطبيق على هاتفك:\nافتح: www.otlobfanni.ly\n\n📢 تابع القناة الرسمية لمنصة اطلب فني على تيليجرام لمشاهدة:\n\n• الشركات الجديدة\n• التحديثات\n• الخدمات الجديدة\n• نصائح وتحسينات المنصة\n\n👉 https://t.me/OtlobFanni`)}`, '_blank')}
              className="p-1.5 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors"
              title="رسالة الترحيب 🎉">
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {(row.whatsapp || row.phone) && (
            <button
              onClick={() => window.open(`https://wa.me/${((row.whatsapp || row.phone) || '').replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${row.companyName || row.company_name || ''}، شكراً لانضمامكم لمنصة اطلب فني\nنتمنى منكم مشاركة المنصة مع عملائكم وشركائكم حتى يستفيد الجميع 👇\nhttps://otlobfanni.ly`)}`, '_blank')}
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
          {(row.whatsapp || row.phone) && (!row.companyLogo || !(row.workImages || []).length) && (
            <button
              onClick={() => sendNudgeCompany(row)}
              className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"
              title="نج لإكمال الملف">
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              localStorage.setItem('pro_session', JSON.stringify({ entityType: 'company', entityId: row.id, displayName: row.companyName || row.company_name || '' }))
              window.open('/pro', '_blank')
            }}
            className="p-1.5 hover:bg-teal-500/10 text-teal-400 rounded-lg transition-colors"
            title="دخول مباشر كهذه الشركة">
            <LogIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openEdit(row)}
            className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors" title="تعديل">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setAiModal({ ...row, entityType: 'company' })}
            className="p-1.5 hover:bg-violet-500/10 text-violet-400 rounded-lg transition-colors" title="استخراج تخصصات AI">
            <Sparkles className="w-3.5 h-3.5" />
          </button>
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
            className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="إلغاء الموافقة">
            <XCircle className="w-3.5 h-3.5" />
          </button>
          {isSuperAdmin && (
            <button onClick={() => handleDelete(row.id)}
              className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors" title="حذف نهائي">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>هذه الشركات تمت الموافقة عليها وأصبحت جزءاً من الدليل. يمكن تعديل بياناتها أو إلغاء الموافقة عليها.</span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالاسم أو الهاتف أو المدينة أو رقم التعريف..."
        actions={
          <div className="flex gap-2">
            <AiBatchButton entityType="company" onComplete={reload} />
            <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] hover:bg-[#e86d00] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> إضافة شركة
            </button>
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-slate-50">
              <option value="">كل المدن</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-slate-50">
              <option value="">كل التخصصات</option>
              {SECTIONS.map(sec => {
                const staticCats = SERVICES_CATS.filter(c => c.sectionId === sec.id && c.id !== 'more')
                const staticIds = new Set(staticCats.map(c => c.id))
                const dbExtra = categories.filter(c => (c.sectionId === sec.id || c.section_id === sec.id) && !staticIds.has(c.id))
                const cats = [...staticCats, ...dbExtra]
                if (!cats.length) return null
                return (
                  <optgroup key={sec.id} label={sec.nameAr}>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.nameAr || c.name_ar}</option>)}
                  </optgroup>
                )
              })}
              <option value="more_services">✏️ تخصص آخر (مخصص)</option>
            </select>
            <button
              onClick={() => setFilterIncomplete(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${filterIncomplete ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              غير مكتمل
            </button>
          </div>
        }
        emptyMessage="لا توجد شركات مقبولة بعد — قم بالموافقة على الطلبات من صفحة طلبات الشركات"
      />

      {/* ── View Modal ──────────────────────────────────────────────── */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل الشركة"
        submitLabel="تعديل البيانات"
        onSubmit={e => { e.preventDefault(); openEdit(viewItem) }}
        size="lg"
      >
        {viewItem && (() => {
          const compName    = viewItem.companyName  || ''
          const contactName = viewItem.contactName  || ''
          const logo        = getFileUrl(viewItem.companyLogo  || null)
          const workImgs    = (viewItem.workImages || []).map(getFileUrl)
          const availNow    = viewItem.availableNow ?? false
          const hoursFrom   = viewItem.hoursFrom    || ''
          const hoursTo     = viewItem.hoursTo      || ''
          const workDays    = viewItem.workingDays  || []
          const priceFrom   = viewItem.priceFrom    || ''
          const priceTo     = viewItem.priceTo      || ''
          const svcRadius   = viewItem.serviceRadius|| ''
          const commReg     = viewItem.commercialReg|| ''
          const commDoc     = getFileUrl(viewItem.commercialDoc|| null)
          const workLic     = getFileUrl(viewItem.workLicense  || null)
          const yearsActive = viewItem.yearsActive  || ''
          const createdAt   = viewItem.createdAt    || ''

          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-slate-200 shadow">
                  {logo
                    ? <img src={logo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(logo)} />
                    : <div className="w-full h-full bg-gradient-to-br from-[#071B33] to-[#1a56db] flex items-center justify-center rounded-xl">
                        <span className="text-white font-bold text-base text-center px-1 leading-tight">{compName.trim().split(' ')[0]}</span>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                    <h3 className="font-bold text-[#071B33] text-lg">{compName}</h3>
                  </div>
                  <p className="text-sm text-slate-400">
                    {catLabel(viewItem.specialty) || viewItem.specialty} • {viewItem.city}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{contactName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400">شركة مقبولة ✓</span>
                    <span className="text-xs text-slate-500">{createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : ''}</span>
                  </div>
                </div>
              </div>

              <Sec icon={Building2} title="معلومات الشركة">
                <G2>
                  <IC label="اسم الشركة"      value={compName} />
                  <IC label="جهة التواصل"      value={contactName || '—'} />
                  <IC label="رقم الهاتف"        value={viewItem.phone}    dir="ltr" />
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">واتساب</p>
                    <p className="font-medium text-[#071B33] text-sm" dir="ltr">{viewItem.whatsapp || '—'}</p>
                    {viewItem.whatsapp && (
                      <a href={`https://wa.me/${viewItem.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                         className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-green-400 hover:text-green-300 transition-colors">
                        <WaIcon /> فتح واتساب
                      </a>
                    )}
                  </div>
                  <IC label="البريد الإلكتروني"   value={viewItem.email || '—'} />
                  <IC label="السجل التجاري"     value={commReg || '—'} />
                  <IC label="المدينة"           value={viewItem.city} />
                  <IC label="المنطقة / الحي"    value={viewItem.area || '—'} />
                  <IC label="نطاق الخدمة"      value={svcRadius ? `${svcRadius} كم` : '—'} />
                </G2>
                {viewItem.address && (
                  <div className="mt-2 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-slate-600">{viewItem.address}</p>
                  </div>
                )}
              </Sec>

              <Sec icon={Briefcase} title="معلومات الخدمة">
                <G2>
                  <IC label="التخصص"       value={catLabel(viewItem.specialty) || viewItem.specialty} />
                  <IC label="سنوات النشاط" value={EXP_LABEL[yearsActive] || yearsActive} />
                  <IC label="السعر الأدنى"  value={priceFrom ? `${priceFrom} د.ل` : '—'} />
                  <IC label="السعر الأقصى"  value={priceTo   ? `${priceTo} د.ل`   : '—'} />
                </G2>
                {viewItem.description && (
                  <div className="mt-2.5 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">وصف الخدمات</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{viewItem.description}</p>
                  </div>
                )}
                {viewItem.certifications && (
                  <div className="mt-2 bg-blue-500/10 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> الشهادات والاعتمادات
                    </p>
                    <p className="text-sm text-blue-300 leading-relaxed">{viewItem.certifications}</p>
                  </div>
                )}
              </Sec>

              <Sec icon={Clock} title="التوفر والجدول">
                <G2>
                  <IC label="متاح الآن"
                    value={availNow ? '✓ نعم' : '✗ لا'}
                    valueClass={availNow ? 'text-emerald-400 font-semibold' : 'text-slate-500'} />
                  <IC label="خدمة الطوارئ 24/7"
                    value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                    valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-slate-500'} />
                  {hoursFrom && <IC label="بداية الدوام" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية الدوام" value={hoursTo}   dir="ltr" />}
                </G2>
                {workDays.length > 0 && (
                  <div className="mt-2.5 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-2">أيام العمل</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workDays.map(d => (
                        <span key={d} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">{DAY_AR[d] || d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Sec>

              {(viewItem.facebook || viewItem.instagram) && (
                <Sec icon={Facebook} title="التواصل الاجتماعي">
                  {viewItem.facebook && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-2">
                      <p className="text-xs text-slate-500 mb-0.5">فيسبوك</p>
                      <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all" dir="ltr">{viewItem.facebook}</a>
                    </div>
                  )}
                  {viewItem.instagram && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-0.5">إنستغرام</p>
                      <a href={viewItem.instagram} target="_blank" rel="noreferrer"
                        className="text-sm text-pink-400 hover:underline break-all" dir="ltr">{viewItem.instagram}</a>
                    </div>
                  )}
                </Sec>
              )}

              {workImgs.length > 0 && (
                <Sec icon={Image} title={`معرض الأعمال (${workImgs.length})`}>
                  <div className="grid grid-cols-3 gap-2">
                    {workImgs.map((src, i) => (
                      <img key={i} src={src} alt={`صورة ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(src)} />
                    ))}
                  </div>
                </Sec>
              )}

              <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-400">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">سرية تامة — لا تُشارك مع العملاء</p>
                </div>
                {(commDoc || workLic) ? (
                  <div className="space-y-3">
                    {commDoc && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">السجل التجاري / الترخيص</p>
                        <img src={commDoc} alt="commercial"
                          className="w-full max-h-40 rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(commDoc)} />
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-40 rounded-xl border border-slate-200 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(workLic)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-slate-500">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                  </div>
                )}
              </Sec>

              <button
                onClick={() => handleRevoke(viewItem.id)}
                className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                إلغاء الموافقة وإعادة إلى قائمة الطلبات
              </button>
            </div>
          )
        })()}
      </FormModal>

      {/* ── Edit Modal ──────────────────────────────────────────────── */}
      <FormModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={editItem?.id === null ? 'إضافة شركة جديدة' : `تعديل بيانات: ${editItem?.companyName || ''}`}
        submitLabel={saving ? 'جارٍ الحفظ...' : editItem?.id === null ? 'إضافة الشركة' : 'حفظ التغييرات'}
        onSubmit={handleSave}
        loading={saving}
        size="lg"
      >
        {editItem && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">شعار الشركة</label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                  {form.company_logo
                    ? <img src={getFileUrl(form.company_logo)} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    : <span className="text-slate-300 text-lg font-bold">{(form.company_name || '').charAt(0) || '؟'}</span>
                  }
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border border-[#FF7900]/40 text-[#FF7900] text-sm font-medium hover:bg-[#FF7900]/5 transition-colors ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-4 h-4" />
                    {logoUploading ? 'جاري الرفع...' : 'رفع شعار'}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setLogoUploading(true)
                      try {
                        const objectPath = await uploadFile(file)
                        setForm(f => ({ ...f, company_logo: objectPath }))
                      } catch { showToast('فشل رفع الصورة، حاول مجدداً', 'error') }
                      setLogoUploading(false)
                      e.target.value = ''
                    }} />
                  </label>
                  {form.company_logo && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, company_logo: '' }))}
                      className="text-xs text-red-400 hover:text-red-500 text-right">
                      حذف الشعار
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── معرض صور الأعمال ── */}
            <div className="sm:col-span-2">
              <label className="form-label flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-slate-400" />
                معرض الأعمال (صور)
              </label>
              <div className="mt-2 space-y-3">
                {(form.work_images || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(form.work_images || []).map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={getFileUrl(img)} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(getFileUrl(img))} />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, work_images: (f.work_images || []).filter((_, i) => i !== idx) }))}
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
                        setForm(f => ({ ...f, work_images: [...(f.work_images || []), ...paths] }))
                      } catch { showToast('فشل رفع الصورة', 'error') }
                      setGalleryUploading(false)
                      e.target.value = ''
                    }} />
                  </label>
                  {(form.work_images || []).length > 0 && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, work_images: [] }))}
                      className="text-xs text-red-400 hover:text-red-500">
                      حذف جميع الصور
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">اسم الشركة *</label>
              <input required value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">جهة التواصل</label>
              <input value={form.contact_name}
                onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">رقم الهاتف</label>
              <input value={form.phone} dir="ltr"
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">واتساب</label>
              <input value={form.whatsapp} dir="ltr"
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">السجل التجاري</label>
              <input value={form.commercial_reg}
                onChange={e => setForm(f => ({ ...f, commercial_reg: e.target.value }))}
                className="form-input" />
            </div>
            <div className="col-span-full">
              <label className="form-label">التخصصات</label>
              <p className="text-[11px] text-slate-400 mb-2">
                افتح أي قسم واختر تخصصاتك —{' '}
                <span className="text-[#FF7900] font-bold">أول اختيار هو التخصص الرئيسي</span>
              </p>
              {editSelectedCats.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {editSelectedCats.map((id, idx) => {
                    const cat = SERVICES_CATS.find(c => c.id === id)
                    if (!cat) return null
                    return (
                      <span key={id} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={idx === 0
                          ? { background: 'linear-gradient(135deg,#FF7900,#c45e00)', color: 'white' }
                          : { background: 'rgba(255,121,0,0.1)', color: '#c45e00' }}>
                        {idx === 0 && '★ '}{cat.nameAr}
                      </span>
                    )
                  })}
                </div>
              )}
              <SpecialtyAccordion
                selectedIds={editSelectedCats}
                onToggle={companyToggleCat}
                suggestedSpecialties={editSuggestedSpecs}
                onAddSuggested={companyAddSuggested}
                onRemoveSuggested={companyRemoveSuggested}
                newDeptSuggestions={editNewDepts}
                onAddNewDept={companyAddNewDept}
                onRemoveNewDept={companyRemoveNewDept}
                chipInputValues={editChipInputs}
                onChipInput={(key, val) => setEditChipInputs(p => ({ ...p, [key]: val }))}
              />
            </div>
            <div>
              <label className="form-label">المدينة</label>
              <input value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">المنطقة / الحي</label>
              <input value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">سنوات النشاط</label>
              <select value={form.years_active}
                onChange={e => setForm(f => ({ ...f, years_active: e.target.value }))}
                className="form-input">
                <option value="">اختر</option>
                {Object.entries(EXP_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">نطاق الخدمة (كم)</label>
              <input value={form.service_radius} type="number" min="0"
                onChange={e => setForm(f => ({ ...f, service_radius: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">السعر الأدنى (د.ل)</label>
              <input value={form.price_from} type="number" min="0"
                onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">السعر الأقصى (د.ل)</label>
              <input value={form.price_to} type="number" min="0"
                onChange={e => setForm(f => ({ ...f, price_to: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">وقت بداية الدوام</label>
              <input value={form.hours_from} type="time"
                onChange={e => setForm(f => ({ ...f, hours_from: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">وقت نهاية الدوام</label>
              <input value={form.hours_to} type="time"
                onChange={e => setForm(f => ({ ...f, hours_to: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">فيسبوك</label>
              <input value={form.facebook} dir="ltr"
                onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))}
                className="form-input" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="form-label">إنستغرام</label>
              <input value={form.instagram} dir="ltr"
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                className="form-input" placeholder="https://instagram.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">العنوان التفصيلي</label>
              <input value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">الوصف</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="form-input resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">الشهادات والاعتمادات</label>
              <textarea rows={2} value={form.certifications}
                onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))}
                className="form-input resize-none"
                placeholder="مثال: ISO 9001، شهادة اتحاد المقاولين..." />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">أيام العمل</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAY_OPTIONS.map(({ en, ar }) => {
                  const selected = (form.working_days || []).includes(en)
                  return (
                    <button
                      key={en}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        working_days: selected
                          ? (f.working_days || []).filter(d => d !== en)
                          : [...(f.working_days || []), en]
                      }))}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-medium ${
                        selected
                          ? 'bg-[#FF7900]/15 border-[#FF7900]/40 text-[#FF7900]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {ar}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-6">
              {[['available_now', 'متاح الآن'], ['emergency', 'طوارئ 24/7']].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))}
                    className="w-4 h-4 accent-[#FF7900]" />
                  <span className="text-sm text-slate-600">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </FormModal>

      <AiTagsModal
        open={!!aiModal}
        onClose={() => setAiModal(null)}
        entity={aiModal}
        onSaved={(tags) => {
          setData(prev => prev.map(r => r.id === aiModal?.id ? { ...r, aiTags: tags } : r))
          showToast('تم حفظ التخصصات بنجاح')
        }}
      />
    </div>
  )
}

function Sec({ icon: Icon, title, titleClass, children }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${titleClass || 'text-slate-500'}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {children}
    </div>
  )
}
function G2({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}
function IC({ label, value, dir, valueClass }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`font-medium text-[#071B33] text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
