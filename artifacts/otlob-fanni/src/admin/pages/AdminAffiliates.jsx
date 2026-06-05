import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Building2, Package, Copy, Check, Plus, Trash2, Edit2, Link2, X, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../lib/api'
function AdminPhoneInput({ value, onChange }) {
  const local = value ? value.replace(/\s/g,'').replace(/^(\+218|00218|218)/, '') : ''
  const handle = e => {
    let raw = e.target.value.replace(/\D/g,'')
    if (raw.startsWith('0')) raw = raw.slice(1)
    onChange('+218' + raw)
  }
  return (
    <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#FF7900] focus-within:ring-2 focus-within:ring-[#FF7900]/20 transition-all" dir="ltr">
      <span className="flex items-center px-3 bg-gray-100 text-[#071B33] font-bold text-sm border-r border-gray-200 select-none whitespace-nowrap">🇱🇾 +218</span>
      <input type="tel" value={local} onChange={handle} placeholder="91 0000000" inputMode="numeric" maxLength={9} dir="ltr"
        className="flex-1 bg-white outline-none px-3 py-2 text-sm text-[#071B33] placeholder-gray-400" />
    </div>
  )
}

const BASE_URL = 'https://otlobfanni.ly'

function buildWaMessage(waNum, name, code) {
  const msg =
`السلام عليكم ${name} 👋

يسعدنا انضمامك كسفير لمنصة *اطلب فني* 🔧

شارك هذا الرابط مع من تعرفه من:
• *الفنيين المتخصصين* — سبّاك، كهربائي، نجار، تكييف، دهان...
• *شركات الخدمات والصيانة المنزلية* — شركات تقدم خدمات صيانة أو مقاولات (ليس شركات تجارية أو استيراد)
• *موردي مستلزمات البناء والتشطيب* — من يبيع مواد بناء أو كهرباء أو سباكة أو تكييف (ليس تاجر جملة عام)

👇 رابط التسجيل الخاص بك:
${BASE_URL}/ref/${code}

كل شخص يسجّل عن طريق رابطك يُحسب إحالة لك تلقائياً ✅`

  return `https://wa.me/${waNum.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  })
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-[#071B33]">{value}</p>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  )
}

function CopyLinkButton({ code }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => copyToClipboard(`${BASE_URL}/ref/${code}`, setCopied)}
      className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FF7900]/10 text-[#FF7900] hover:bg-[#FF7900]/20'}`}
      title="نسخ الرابط الموحّد"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'تم النسخ' : 'نسخ الرابط'}
    </button>
  )
}

function AmbassadorForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || { name: '', phone: '', whatsapp: '', code: '', notes: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const autoCode = () => {
    if (!form.code && form.name) {
      const slug = form.name.trim().replace(/\s+/g, '-').substring(0, 10)
      set('code', 'AMB-' + slug + '-' + Math.floor(100 + Math.random() * 900))
    }
  }

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">الاسم *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onBlur={autoCode}
            placeholder="محمد السفير"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF7900]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">كود الإحالة *</label>
          <input
            value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, '-'))}
            placeholder="AMB-001"
            dir="ltr"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#FF7900]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">الهاتف</label>
          <AdminPhoneInput value={form.phone || ''} onChange={v => set('phone', v)} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">واتساب</label>
          <AdminPhoneInput value={form.whatsapp || ''} onChange={v => set('whatsapp', v)} />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">ملاحظات</label>
        <input
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="مندوب المنطقة الغربية..."
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF7900]"
        />
      </div>
      {form.code && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">الرابط الموحّد</p>
          <p className="text-xs font-mono text-[#FF7900] break-all">{BASE_URL}/ref/{form.code}</p>
          <p className="text-[10px] text-gray-400">رابط واحد — الزائر يختار نوع حسابه بنفسه</p>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">إلغاء</button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.name || !form.code || saving}
          className="px-4 py-2 text-sm font-bold bg-[#FF7900] text-white rounded-xl hover:bg-[#e56c00] disabled:opacity-50 transition-colors"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>
    </div>
  )
}

function AmbassadorCard({ amb, stats, onDelete, onToggle, onEdit, updating }) {
  const [showLinks, setShowLinks] = useState(false)
  const s = stats[amb.code] || { technicians: 0, companies: 0, suppliers: 0 }
  const total = s.technicians + s.companies + s.suppliers
  const waNum = (amb.whatsapp || amb.phone || '').replace(/\D/g, '')

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 transition-all ${amb.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-extrabold text-[#071B33] text-sm truncate">{amb.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${amb.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {amb.isActive ? 'نشط' : 'معطّل'}
            </span>
          </div>
          <p className="text-xs font-mono text-[#FF7900] mt-0.5">{amb.code}</p>
          {amb.notes && <p className="text-[11px] text-gray-400 mt-0.5">{amb.notes}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(amb)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#FF7900] hover:bg-orange-50 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onToggle(amb)} disabled={updating === amb.id} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            {amb.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(amb.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'الكل', value: total, color: 'bg-[#071B33] text-white' },
          { label: 'فنيون', value: s.technicians, color: 'bg-orange-50 text-orange-700' },
          { label: 'شركات', value: s.companies, color: 'bg-blue-50 text-blue-700' },
          { label: 'موردون', value: s.suppliers, color: 'bg-purple-50 text-purple-700' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl px-2 py-1.5 text-center ${item.color}`}>
            <p className="font-black text-base leading-none">{item.value}</p>
            <p className="text-[10px] font-medium mt-0.5 opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <CopyLinkButton code={amb.code} />
        <button
          onClick={() => setShowLinks(p => !p)}
          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Link2 className="w-3 h-3" />
          روابط منفصلة
          {showLinks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {waNum && (
          <a
            href={buildWaMessage(waNum, amb.name, amb.code)}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.838L.057 23.804a.5.5 0 0 0 .61.61l5.966-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.073-1.384l-.363-.214-3.767.925.943-3.648-.236-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            إرسال الروابط
          </a>
        )}
      </div>

      {showLinks && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[10px] w-6">🔗</span>
            <span className="text-[#FF7900] break-all flex-1">{BASE_URL}/ref/{amb.code}</span>
            <button onClick={() => copyToClipboard(`${BASE_URL}/ref/${amb.code}`, () => {})} className="flex-shrink-0 p-1 rounded hover:bg-gray-200"><Copy className="w-3 h-3 text-gray-400" /></button>
          </div>
          <p className="text-[10px] text-gray-400 pr-6">رابط موحّد — يفتح صفحة اختيار النوع</p>
          <div className="border-t border-gray-200 pt-2 space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400">أو روابط مباشرة حسب النوع:</p>
            {[
              { label: '🔧 فني', path: '/join' },
              { label: '🏢 شركة', path: '/join-company' },
              { label: '📦 مورد', path: '/join-supplier' },
            ].map(l => {
              const url = `${BASE_URL}${l.path}?ref=${amb.code}`
              return (
                <div key={l.path} className="flex items-center gap-2">
                  <span className="text-gray-500 text-[10px] w-14 flex-shrink-0">{l.label}:</span>
                  <span className="text-gray-500 break-all flex-1 text-[10px]">{url}</span>
                  <button onClick={() => copyToClipboard(url, () => {})} className="flex-shrink-0 p-1 rounded hover:bg-gray-200"><Copy className="w-3 h-3 text-gray-400" /></button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ReferrerRow({ code, name, type, stats }) {
  const [open, setOpen] = useState(false)
  const total = (stats.technicians || 0) + (stats.companies || 0) + (stats.suppliers || 0)
  const typeLabel = { technician: 'فني', company: 'شركة', supplier: 'مورد', ambassador: 'سفير' }
  const typeBg = { technician: 'bg-orange-100 text-orange-700', company: 'bg-blue-100 text-blue-700', supplier: 'bg-purple-100 text-purple-700', ambassador: 'bg-emerald-100 text-emerald-700' }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-right"
      >
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${typeBg[type] || 'bg-gray-100 text-gray-600'}`}>{typeLabel[type] || type}</span>
        <span className="font-bold text-[#071B33] text-sm flex-1 truncate">{name || code}</span>
        <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">{code}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-black text-[#FF7900] text-sm">{total}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-2 border-t border-gray-50">
          <div className="bg-orange-50 rounded-xl p-2 text-center">
            <p className="font-black text-orange-700 text-lg">{stats.technicians || 0}</p>
            <p className="text-[10px] text-orange-600">فنيون</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2 text-center">
            <p className="font-black text-blue-700 text-lg">{stats.companies || 0}</p>
            <p className="text-[10px] text-blue-600">شركات</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-2 text-center">
            <p className="font-black text-purple-700 text-lg">{stats.suppliers || 0}</p>
            <p className="text-[10px] text-purple-600">موردون</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminAffiliates() {
  const [ambassadors, setAmbassadors] = useState([])
  const [affiliateStats, setAffiliateStats] = useState({ referrers: [], totals: {} })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(null)
  const [tab, setTab] = useState('ambassadors')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ambs, stats] = await Promise.all([
        api.admin.ambassadors.list(),
        api.admin.affiliateStats(),
      ])
      setAmbassadors(ambs)
      setAffiliateStats(stats)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const statsByCode = {}
  affiliateStats.referrers?.forEach(r => { statsByCode[r.code] = r })

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editItem) {
        const updated = await api.admin.ambassadors.update(editItem.id, form)
        setAmbassadors(prev => prev.map(a => a.id === editItem.id ? updated : a))
      } else {
        const created = await api.admin.ambassadors.create(form)
        setAmbassadors(prev => [created, ...prev])
      }
      setShowForm(false)
      setEditItem(null)
    } catch (e) {
      alert(e.message || 'حدث خطأ')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا السفير؟')) return
    await api.admin.ambassadors.delete(id)
    setAmbassadors(prev => prev.filter(a => a.id !== id))
  }

  const handleToggle = async (amb) => {
    setUpdating(amb.id)
    try {
      const updated = await api.admin.ambassadors.update(amb.id, { isActive: !amb.isActive })
      setAmbassadors(prev => prev.map(a => a.id === amb.id ? updated : a))
    } catch {}
    setUpdating(null)
  }

  const handleEdit = (amb) => {
    setEditItem(amb)
    setShowForm(true)
    setTab('ambassadors')
  }

  const totals = affiliateStats.totals || {}

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF7900,#FF9500)' }}>
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#071B33]">الإحالات والسفراء</h1>
          <p className="text-xs text-gray-400">تتبع من أحضر من وإدارة روابط السفراء</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users}    label="إجمالي المُحالين"  value={totals.total || 0}       color="bg-[#071B33]" />
        <StatCard icon={UserPlus} label="فنيون مُحالون"     value={totals.technicians || 0}  color="bg-[#FF7900]" />
        <StatCard icon={Building2} label="شركات مُحالة"     value={totals.companies || 0}    color="bg-blue-500" />
        <StatCard icon={Package}  label="موردون مُحالون"    value={totals.suppliers || 0}    color="bg-purple-500" />
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { key: 'ambassadors', label: `السفراء (${ambassadors.length})` },
          { key: 'tracking', label: `الإحالات المتعقَّبة (${affiliateStats.referrers?.length || 0})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-[#071B33] text-white shadow' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-[#FF7900] border-t-transparent animate-spin" />
        </div>
      ) : tab === 'ambassadors' ? (
        <div className="space-y-4">
          {(showForm || editItem) ? (
            <AmbassadorForm
              initial={editItem}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditItem(null) }}
              saving={saving}
            />
          ) : (
            <button
              onClick={() => { setShowForm(true); setEditItem(null) }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#FF7900]/30 text-[#FF7900] font-bold text-sm hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة سفير جديد
            </button>
          )}

          {ambassadors.length === 0 && !showForm ? (
            <div className="text-center py-16 text-gray-400">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-bold">لا يوجد سفراء بعد</p>
              <p className="text-sm mt-1">أضف أول سفير لاطلب فني</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {ambassadors.map(amb => (
                <AmbassadorCard
                  key={amb.id}
                  amb={amb}
                  stats={statsByCode}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  updating={updating}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {!affiliateStats.referrers?.length ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-bold">لا توجد إحالات مسجّلة بعد</p>
            </div>
          ) : (
            affiliateStats.referrers
              .sort((a, b) => (b.total || 0) - (a.total || 0))
              .map(r => (
                <ReferrerRow
                  key={r.code}
                  code={r.code}
                  name={r.name}
                  type={r.type}
                  stats={r}
                />
              ))
          )}
        </div>
      )}
    </div>
  )
}
