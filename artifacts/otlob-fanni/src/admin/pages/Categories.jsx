import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Sparkles, Grid3X3, X, Check, Wand2, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import { sections } from '../../data/services'

const ALL_ICONS = [
  'ac','access_control','alarm','aluminum','appliances','auto_electrician',
  'backup_power','battery_inverter','car_ac','car_battery','car_body',
  'car_diagnostics','car_mechanic','carpentry','car_wash','cctv','cleaning',
  'coffee_machine','computer','concrete','construction_transport','contracting',
  'crusher_materials','electricity','elevators','eng_consultancy','excavator',
  'furniture_install','garden','gas','generator','generator_install','generators',
  'grill','gypsum','heavy_equipment','heavy_transport','home_help','irrigation',
  'landscaping','loader','loading','locks','maintenance','mobile_repair','more',
  'moving','networks','office_cleaning','office_maintenance','oil_change',
  'painting','pastry','pest_control','pipe_fittings','plastering','plumbing',
  'pool','pool_cleaning','pumps','restaurant_equipment','restaurant_maintenance',
  'restaurant_staff','roofing','satellite','shawarma','shop_cctv','shop_maintenance',
  'signs','solar','tank_cleaning','thermal','tiles','tipper_truck','tire_repair',
  'towing','truck_driver','ups','waterproof','welding','workers',
]

const KEYWORD_MAP = [
  { keywords: ['كهرب','electric','كهر'], icon: 'electricity' },
  { keywords: ['سباك','plumb','مياه','ماء','أنابيب','pipes'], icon: 'plumbing' },
  { keywords: ['تكييف','برودة','مكيف','تبريد','ac ','cooling'], icon: 'ac' },
  { keywords: ['كاميرا','cctv','مراقبة','cameras'], icon: 'cctv' },
  { keywords: ['حراسة','أمن','alarm','إنذار','alarm'], icon: 'alarm' },
  { keywords: ['دهان','paint','ديكور','decor','طلاء'], icon: 'painting' },
  { keywords: ['نجار','carpent','أثاث','خشب','wood'], icon: 'carpentry' },
  { keywords: ['مطبخ','kitchen','فرنيتر','أثاث','furniture','تفصيل'], icon: 'furniture_install' },
  { keywords: ['ألمونيوم','زجاج','alumin','glass','نافذ'], icon: 'aluminum' },
  { keywords: ['حاسوب','كمبيوتر','computer','شاشة','تقني','برمجة','تطبيق','software','laptop','screen'], icon: 'computer' },
  { keywords: ['موبايل','هاتف','جوال','phone','mobile','repair'], icon: 'mobile_repair' },
  { keywords: ['شبكة','نت','internet','network','wifi','روتر'], icon: 'networks' },
  { keywords: ['ستلايت','satellite','هوائي','دش','dish'], icon: 'satellite' },
  { keywords: ['مولد','generator','كهرباء احتياطي'], icon: 'generator' },
  { keywords: ['طاقة شمسية','solar','ألواح شمسية'], icon: 'solar' },
  { keywords: ['بطارية','inverter','يو بي اس','ups'], icon: 'battery_inverter' },
  { keywords: ['نقل','شحن','حمل','moving','transport','شاحنة'], icon: 'moving' },
  { keywords: ['تنظيف','cleaning','غسيل','تلميع'], icon: 'cleaning' },
  { keywords: ['حشرات','آفات','pest','رش','مبيدات'], icon: 'pest_control' },
  { keywords: ['حديقة','garden','نباتات','أشجار','ري'], icon: 'garden' },
  { keywords: ['حفر','بناء','خرسان','concrete','إنشاء','contracting'], icon: 'concrete' },
  { keywords: ['مطعم','restaurant','مطاعم'], icon: 'restaurant_maintenance' },
  { keywords: ['لحام','welding','حداد'], icon: 'welding' },
  { keywords: ['بلاط','tiles','سيراميك','ceramic'], icon: 'tiles' },
  { keywords: ['جبس','gypsum','أسقف'], icon: 'gypsum' },
  { keywords: ['صيانة','maintenance','إصلاح'], icon: 'maintenance' },
  { keywords: ['مصعد','elevator','lift'], icon: 'elevators' },
  { keywords: ['مسبح','pool','حوض سباحة'], icon: 'pool' },
  { keywords: ['استشارة','استشاري','engineer','هندس','eng'], icon: 'eng_consultancy' },
  { keywords: ['سيار','car','مركب','vehicle','auto'], icon: 'car_mechanic' },
  { keywords: ['مكتب','office'], icon: 'office_maintenance' },
  { keywords: ['متجر','محل','shop','store'], icon: 'shop_maintenance' },
  { keywords: ['غاز','gas'], icon: 'gas' },
  { keywords: ['ضخ','pump','مضخ'], icon: 'pumps' },
  { keywords: ['قفل','أقفال','locks','lock'], icon: 'locks' },
  { keywords: ['سقف','roof','waterproof','عزل'], icon: 'waterproof' },
]

function suggestIcon(nameAr, nameEn) {
  const combined = ((nameAr || '') + ' ' + (nameEn || '')).toLowerCase()
  for (const { keywords, icon } of KEYWORD_MAP) {
    if (keywords.some(kw => combined.includes(kw.toLowerCase()))) return icon
  }
  return null
}

function IconPickerModal({ open, onClose, current, nameAr, nameEn, onSelect }) {
  const [search, setSearch] = useState('')
  const suggestion = suggestIcon(nameAr, nameEn)

  if (!open) return null
  const filtered = search
    ? ALL_ICONS.filter(ic => ic.includes(search.toLowerCase()))
    : ALL_ICONS

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center" dir="rtl">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#151530] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <p className="font-black text-white text-sm">اختر أيقونة</p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {suggestion && suggestion !== current && (
          <div className="px-4 py-2 bg-[#FF7900]/10 border-b border-[#FF7900]/20 flex-shrink-0">
            <p className="text-[11px] text-[#FF7900] font-bold mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> اقتراح الذكاء الاصطناعي
            </p>
            <button
              onClick={() => { onSelect(suggestion); onClose() }}
              className="flex items-center gap-2 bg-[#FF7900]/20 hover:bg-[#FF7900]/30 border border-[#FF7900]/40 rounded-xl px-3 py-2 transition-colors"
            >
              <img src={`/icons/categories/${suggestion}.png`} alt={suggestion}
                className="w-8 h-8 rounded-lg object-cover"
                onError={e => { e.currentTarget.style.display='none' }} />
              <span className="text-[#FF7900] font-bold text-xs">{suggestion}</span>
              <Check className="w-3.5 h-3.5 text-[#FF7900] mr-auto" />
            </button>
          </div>
        )}

        <div className="px-3 py-2 border-b border-white/10 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن أيقونة..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF7900]/50"
            dir="ltr"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-5 gap-2">
            {filtered.map(icon => {
              const isSelected = icon === current
              return (
                <button
                  key={icon}
                  onClick={() => { onSelect(icon); onClose() }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={isSelected ? {
                    background: 'rgba(255,121,0,0.2)',
                    border: '2px solid #FF7900',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '2px solid transparent',
                  }}
                >
                  <img
                    src={`/icons/categories/${icon}.png`}
                    alt={icon}
                    className="w-9 h-9 rounded-lg object-cover"
                    onError={e => { e.currentTarget.src = '/icons/categories/more.png' }}
                  />
                  <span className="text-[9px] text-white/50 font-mono leading-tight text-center truncate w-full">
                    {icon.replace(/_/g,' ')}
                  </span>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-white/30 text-sm py-8">لا نتائج</p>
          )}
        </div>
      </div>
    </div>
  )
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .slice(0, 40) || ('cat_' + Date.now())
}

export default function Categories() {
  const { logActivity } = useAdmin()
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]     = useState({ name_ar: '', name_en: '', icon_name: '', sort_order: 0, section_id: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [generatingIcon, setGeneratingIcon] = useState(false)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const normalize = (row) => ({
    id:         row.id,
    name_ar:    row.name_ar    || row.nameAr    || '',
    name_en:    row.name_en    || row.nameEn    || '',
    icon_name:  row.icon_name  || row.iconName  || row.icon || '',
    section_id: row.section_id || row.sectionId || '',
    sort_order: row.sort_order ?? row.sortOrder  ?? 0,
    is_active:  row.is_active  ?? row.isActive  ?? true,
  })

  const reload = () => {
    setLoading(true)
    api.admin.categories.list()
      .then(rows => {
        const normalized = rows.map(normalize)
        normalized.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        setData(normalized)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const filtered = data.filter(r => !search || r.name_ar?.includes(search) || r.name_en?.toLowerCase().includes(search.toLowerCase()))

  const openAdd  = () => {
    setEditItem(null)
    setForm({ name_ar: '', name_en: '', icon_name: '', sort_order: data.length + 1, section_id: '' })
    setModalOpen(true)
  }
  const openEdit = (row) => {
    setEditItem(row)
    setForm({ name_ar: row.name_ar, name_en: row.name_en, icon_name: row.icon_name || '', sort_order: row.sort_order || 0, section_id: row.section_id || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        name_ar:   form.name_ar,
        name_en:   form.name_en,
        icon_name: form.icon_name || slugify(form.name_en || form.name_ar),
        sort_order: parseInt(form.sort_order) || 0,
        section_id: form.section_id || null,
      }
      if (editItem) {
        await api.admin.categories.update(editItem.id, payload)
        logActivity?.('update_category', editItem.id)
        showToast('تم تعديل التخصص')
      } else {
        const newId = slugify(form.name_en || form.name_ar)
        await api.admin.categories.create({ id: newId, is_active: true, ...payload })
        logActivity?.('create_category', newId)
        showToast('تم إضافة التخصص')
      }
      setModalOpen(false); reload()
    } catch (err) { showToast(err.message || 'حدث خطأ', 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try { await api.admin.categories.delete(id); showToast('تم الحذف'); reload() }
    catch { showToast('حدث خطأ', 'error') }
  }

  const toggleActive = async (id, val) => {
    try {
      await api.admin.categories.update(id, { is_active: !val })
      setData(prev => prev.map(c => c.id === id ? { ...c, is_active: !val } : c))
    } catch { showToast('حدث خطأ', 'error') }
  }

  const getSectionLabel = (sectionId) => {
    const s = sections.find(sec => sec.id === sectionId)
    return s ? s.nameAr : (sectionId || '—')
  }

  const autoSuggest = () => {
    const suggestion = suggestIcon(form.name_ar, form.name_en)
    if (suggestion) setForm(f => ({ ...f, icon_name: suggestion }))
    else showToast('لا يوجد اقتراح مناسب، اختر يدوياً', 'error')
  }

  const generateAiIcon = async () => {
    if (!form.name_ar && !form.name_en) { showToast('أدخل اسم التخصص أولاً', 'error'); return }
    setGeneratingIcon(true)
    try {
      const res = await api.admin.categories.generateIcon({ nameAr: form.name_ar, nameEn: form.name_en })
      setForm(f => ({ ...f, icon_name: res.url }))
      showToast('تم توليد الصورة بنجاح ✨')
    } catch (err) {
      showToast(err.message || 'فشل توليد الصورة', 'error')
    } finally {
      setGeneratingIcon(false)
    }
  }

  const resolveIconSrc = (v, row) => {
    const key = v || row?.id || 'more'
    return (key.startsWith('http') || key.startsWith('/api/')) ? key : `/icons/categories/${key}.png`
  }

  const columns = [
    {
      key: 'icon_name', label: 'أيقونة', width: '64px',
      render: (v, row) => (
        <img
          src={resolveIconSrc(v, row)}
          alt=""
          className="w-9 h-9 rounded-xl object-cover"
          onError={e => { e.currentTarget.src = '/icons/categories/more.png' }}
        />
      )
    },
    { key: 'name_ar', label: 'الاسم عربي',     render: (v) => <span className="font-medium text-white">{v}</span> },
    { key: 'name_en', label: 'الاسم إنجليزي',  render: (v) => <span dir="ltr" className="text-[#8888A8]">{v}</span> },
    { key: 'section_id', label: 'القسم', render: (v) => <span className="text-xs text-[#8888A8]">{getSectionLabel(v)}</span> },
    { key: 'sort_order', label: 'الترتيب', width: '70px' },
    {
      key: 'is_active', label: 'الحالة',
      render: (v, row) => (
        <button onClick={() => toggleActive(row.id, v)} className={`flex items-center gap-1 text-xs font-medium ${v ? 'text-emerald-400' : 'text-[#444460]'}`}>
          {v ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {v ? 'نشط' : 'معطل'}
        </button>
      )
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث عن تخصص..."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF7900] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e86d00] transition-colors">
            <Plus className="w-4 h-4" /> إضافة تخصص
          </button>
        }
        emptyMessage="لا توجد تخصصات"
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'تعديل تخصص' : 'إضافة تخصص'}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editItem ? 'حفظ' : 'إضافة'}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">الاسم بالعربي *</label>
            <input
              required
              value={form.name_ar}
              onChange={e => setForm(f => ({...f, name_ar: e.target.value}))}
              className="form-input"
              placeholder="كهرباء"
            />
          </div>
          <div>
            <label className="form-label">الاسم بالإنجليزي *</label>
            <input
              required
              value={form.name_en}
              onChange={e => setForm(f => ({...f, name_en: e.target.value}))}
              className="form-input"
              placeholder="Electricity"
              dir="ltr"
            />
          </div>
          <div>
            <label className="form-label">القسم الرئيسي</label>
            <select
              value={form.section_id}
              onChange={e => setForm(f => ({...f, section_id: e.target.value}))}
              className="form-input"
            >
              <option value="">— بدون قسم —</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
            </select>
          </div>

          {/* ── Icon picker ── */}
          <div>
            <label className="form-label">الأيقونة</label>

            {/* Current icon preview + actions */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {form.icon_name ? (
                  <img
                    src={resolveIconSrc(form.icon_name, null)}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={e => { e.currentTarget.src = '/icons/categories/more.png' }}
                  />
                ) : (
                  <span className="text-white/20 text-2xl">?</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-[10px] font-mono truncate mb-1.5">
                  {form.icon_name || 'لم يتم اختيار أيقونة'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Grid3X3 className="w-3 h-3" />
                    استعراض
                  </button>
                  <button
                    type="button"
                    onClick={autoSuggest}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#FF7900] hover:text-orange-300 bg-[#FF7900]/10 hover:bg-[#FF7900]/20 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    اقتراح
                  </button>
                  <button
                    type="button"
                    onClick={generateAiIcon}
                    disabled={generatingIcon}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1.5 rounded-lg transition-colors"
                  >
                    {generatingIcon
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> جاري التوليد...</>
                      : <><Wand2 className="w-3 h-3" /> توليد بالذكاء الاصطناعي</>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Manual input */}
            <input
              value={form.icon_name}
              onChange={e => setForm(f => ({...f, icon_name: e.target.value.replace(/\s/g,'_').toLowerCase()}))}
              className="form-input"
              placeholder="مثال: electricity أو mobile_repair"
              dir="ltr"
            />
            <p className="text-[11px] text-[#6666A0] mt-1">
              ولّد صورة بالذكاء الاصطناعي، أو اختر من المكتبة، أو اكتب الاسم يدوياً
            </p>
          </div>

          <div>
            <label className="form-label">الترتيب</label>
            <input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={e => setForm(f => ({...f, sort_order: e.target.value}))}
              className="form-input"
            />
          </div>
        </div>
      </FormModal>

      <IconPickerModal
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        current={form.icon_name}
        nameAr={form.name_ar}
        nameEn={form.name_en}
        onSelect={icon => setForm(f => ({...f, icon_name: icon}))}
      />
    </div>
  )
}
