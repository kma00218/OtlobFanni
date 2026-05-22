import { useState, useEffect } from 'react'
import { UserPlus, Building2, Package, Trash2, CheckCircle, Clock, XCircle, Phone, MessageSquare, Eye } from 'lucide-react'
import api from '../../lib/api'

const TYPES = [
  { key: 'all',        label: 'الكل',           icon: null },
  { key: 'technician', label: 'فنيون',           icon: UserPlus,  color: 'bg-orange-100 text-orange-700' },
  { key: 'company',    label: 'شركات خدمية',     icon: Building2, color: 'bg-blue-100 text-blue-700' },
  { key: 'supplier',   label: 'موردو المستلزمات', icon: Package,   color: 'bg-purple-100 text-purple-700' },
]

const STATUS_CFG = {
  new:       { label: 'جديد',        color: 'bg-blue-100 text-blue-700',     icon: Clock },
  reviewed:  { label: 'تمت المراجعة', color: 'bg-amber-100 text-amber-700',  icon: Eye },
  contacted: { label: 'تم التواصل',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected:  { label: 'مرفوض',       color: 'bg-red-100 text-red-700',       icon: XCircle },
}

const TYPE_BADGE = {
  technician: { label: 'فني',   color: 'bg-orange-100 text-orange-700' },
  company:    { label: 'شركة',  color: 'bg-blue-100 text-blue-700' },
  supplier:   { label: 'مورد',  color: 'bg-purple-100 text-purple-700' },
}

const INVITE_MSG = {
  technician: (name) =>
    `مرحباً ${name} 👋\n\n` +
    `رشّحك أحد معارفك للانضمام إلى منصة *اطلب فني* — الدليل الرقمي للفنيين والشركات في ليبيا 🇱🇾\n\n` +
    `سجّل مهاراتك مجاناً وابدأ تستقبل طلبات من عملاء في منطقتك.\n\n` +
    `📲 سجّل من هنا: https://otlobfanni.ly/join`,
  company: (name) =>
    `مرحباً ${name} 👋\n\n` +
    `رشّحكم أحد معارفكم للانضمام إلى منصة *اطلب فني* — الدليل الرقمي للفنيين والشركات في ليبيا 🇱🇾\n\n` +
    `سجّلوا شركتكم مجاناً وابدأوا تستقبلوا طلبات من عملاء في منطقتكم.\n\n` +
    `📲 سجّل من هنا: https://otlobfanni.ly/join-company`,
  supplier: (name) =>
    `مرحباً ${name} 👋\n\n` +
    `رشّحكم أحد معارفكم للانضمام إلى منصة *اطلب فني* — الدليل الرقمي للفنيين والشركات في ليبيا 🇱🇾\n\n` +
    `سجّلوا نشاطكم مجاناً وكونوا مرجعاً للفنيين والشركات في منطقتكم.\n\n` +
    `📲 سجّل من هنا: https://otlobfanni.ly/join-supplier`,
}

function normalizePhone(raw) {
  if (!raw) return ''
  let digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  if (!digits.startsWith('218')) digits = '218' + digits.replace(/^0+/, '')
  return digits
}

function ReferralCard({ r, onStatus, onDelete, updating }) {
  const sc  = STATUS_CFG[r.status] || STATUS_CFG.new
  const tc  = TYPE_BADGE[r.type] || {}
  const SI  = sc.icon || Clock
  const digits   = normalizePhone(r.phone)
  const display  = digits ? `+${digits}` : (r.phone || '—')
  const msgFn    = INVITE_MSG[r.type] || INVITE_MSG.technician
  const waText   = encodeURIComponent(msgFn(r.name || ''))
  const waLink   = digits ? `https://wa.me/${digits}?text=${waText}` : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-[#071B33] text-sm leading-tight truncate">{r.name}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.color}`}>{tc.label}</span>
            {r.specialty && <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{r.specialty}</span>}
            {r.city      && <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{r.city}</span>}
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${sc.color}`}>
          <SI className="w-3 h-3" />
          {sc.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {digits && (
          <a
            href={`tel:+${digits}`}
            className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-[#071B33] hover:bg-gray-100 transition-colors"
            dir="ltr"
          >
            <Phone className="w-3.5 h-3.5 text-[#FF7900]" />
            {display}
          </a>
        )}
        {waLink ? (
          <a
            href={waLink}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 bg-green-50 rounded-xl px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            واتساب
          </a>
        ) : (
          <span className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-gray-400">
            <Phone className="w-3.5 h-3.5" />
            لا يوجد رقم
          </span>
        )}
      </div>

      {r.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">{r.notes}</p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-50 flex-wrap">
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          key !== r.status && (
            <button
              key={key}
              disabled={updating === r.id}
              onClick={() => onStatus(r.id, key)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${cfg.color} border-current opacity-70 hover:opacity-100`}
            >
              {cfg.label}
            </button>
          )
        ))}
        <button
          disabled={updating === r.id}
          onClick={() => onDelete(r.id)}
          className="mr-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          حذف
        </button>
      </div>

      <p className="text-[10px] text-gray-400 -mt-1">
        {new Date(r.createdAt).toLocaleDateString('ar-LY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('all')
  const [updating, setUpdating]   = useState(null)

  const load = async () => {
    setLoading(true)
    try { setReferrals(await api.admin.referrals.list()) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.admin.referrals.setStatus(id, status)
      setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {}
    setUpdating(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا الترشيح؟')) return
    try {
      await api.admin.referrals.delete(id)
      setReferrals(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  const filtered = tab === 'all' ? referrals : referrals.filter(r => r.type === tab)

  const counts = { all: referrals.length }
  TYPES.slice(1).forEach(t => { counts[t.key] = referrals.filter(r => r.type === t.key).length })
  const newCount = referrals.filter(r => r.status === 'new').length

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF7900,#FF9500)' }}>
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#071B33]">الترشيحات</h1>
          <p className="text-xs text-gray-400">ترشيحات المستخدمين للانضمام للدليل</p>
        </div>
        {newCount > 0 && (
          <span className="mr-auto bg-[#FF7900] text-white text-xs font-black px-3 py-1 rounded-full">{newCount} جديد</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              tab === t.key
                ? 'bg-[#071B33] text-white shadow'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {t.icon && <t.icon className="w-3.5 h-3.5" />}
            {t.label}
            {counts[t.key] > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-[#FF7900] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-bold">لا توجد ترشيحات</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(r => (
            <ReferralCard
              key={r.id}
              r={r}
              onStatus={handleStatus}
              onDelete={handleDelete}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
