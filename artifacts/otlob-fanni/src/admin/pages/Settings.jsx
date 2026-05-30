import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { Settings as SettingsIcon, Shield, Bell, Palette, Database, Globe, Lock, CheckCircle, Info, Send, MessageCircle, Users, X, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../lib/api'

function Section({ icon: Icon, title, description, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#ffffff', border: '1px solid #E8EDF2', boxShadow: '0 1px 4px rgba(7,27,51,0.06)' }}
    >
      <div className="px-6 py-5 flex items-center gap-4" style={{ borderBottom: '1px solid #E8EDF2' }}>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,121,0,0.12)', border: '1px solid rgba(255,121,0,0.2)' }}
        >
          <Icon className="w-5 h-5 text-[#FF7900]" />
        </div>
        <div>
          <h3 className="font-black text-[#071B33] text-sm">{title}</h3>
          {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function ToggleRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div>
        <p className="text-sm font-semibold text-[#071B33]">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0`}
        style={{
          background: enabled ? 'linear-gradient(135deg, #FF7900, #FF9500)' : '#E2E8F0',
          boxShadow: enabled ? '0 2px 12px rgba(255,121,0,0.4)' : 'none',
        }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all"
          style={{ right: enabled ? '2px' : 'calc(100% - 22px)' }}
        />
      </button>
    </div>
  )
}

const PLATFORM_URL = 'otlobfanni.ly'
const TELEGRAM_LINK = 'https://t.me/otlobfanni'
const TYPE_LABEL = { technician: '🔧 فني', company: '🏢 شركة', supplier: '📦 مورد' }

function fmtDay(iso) {
  if (!iso) return 'تاريخ غير معروف'
  return new Date(iso).toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('ar-LY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function groupByDay(list) {
  const map = {}
  list.forEach(item => {
    const key = item.entityCreatedAt
      ? new Date(item.entityCreatedAt).toISOString().slice(0, 10)
      : '0000-00-00'
    if (!map[key]) map[key] = { key, label: fmtDay(item.entityCreatedAt), items: [] }
    map[key].items.push(item)
  })
  return Object.values(map).sort((a, b) => b.key.localeCompare(a.key))
}

function useProList() {
  const [loading, setLoading] = useState(false)
  const [list, setList]       = useState(null)
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const data = await api.pro.bulkCredentials()
      setList(data)
    } catch { setError('حدث خطأ أثناء تحميل البيانات') }
    finally { setLoading(false) }
  }

  const markSent = async (entityId, type) => {
    try {
      const { sentAt } = await api.pro.markSent(entityId, type)
      setList(prev => prev.map(i =>
        i.entityId === entityId
          ? { ...i, [type === 'credentials' ? 'credentialsSentAt' : 'telegramSentAt']: sentAt }
          : i
      ))
    } catch { }
  }

  return { loading, list, error, load, markSent, reset: () => setList(null) }
}

function DayGroup({ day, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EDF2' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
        style={{ background: 'linear-gradient(135deg, #F8FAFC, #F2F5FA)', borderBottom: open ? '1px solid #E8EDF2' : 'none' }}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          <span className="font-black text-[#071B33] text-xs">{day.label}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          {day.items.length} شخص
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function BulkCredentialsSection() {
  const { loading, list, error, load, markSent, reset } = useProList()

  const CRED_MSG = (wa, pass) =>
    `تم تفعيل حسابك المهني على منصة اطلب فني 🎉\n\n` +
    `يمكنك الآن الدخول إلى أدوات العمل عبر منصة:\n` +
    `🌐 ${PLATFORM_URL}\n\n` +
    `من صفحة:\nالمزيد ← دخول الحسابات المهنية\n\n` +
    `اسم المستخدم:\n${wa}\n\n` +
    `كلمة المرور:\n${pass}`

  const sendOne = (item) => {
    const phone = (item.whatsapp || '').replace(/\D/g, '')
    if (!phone) return
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(CRED_MSG(item.whatsapp, item.password))}`, '_blank')
    markSent(item.entityId, 'credentials')
  }

  if (!list) {
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="w-full rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(255,121,0,0.08),rgba(7,27,51,0.04))', border: '1.5px dashed rgba(255,121,0,0.3)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,121,0,0.12)', border: '1px solid rgba(255,121,0,0.2)' }}>
            <Users className="w-6 h-6 text-[#FF7900]" />
          </div>
          <div>
            <p className="font-black text-[#071B33] text-sm">إرسال بيانات الدخول لجميع المحترفين</p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              القائمة مقسّمة حسب يوم الانضمام — تتبّع من أرسلت له محفوظ في قاعدة البيانات
            </p>
          </div>
          <button onClick={load} disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#FF7900,#FF9500)', boxShadow: '0 4px 20px rgba(255,121,0,0.35)' }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري التحميل...</>
              : <><Send className="w-4 h-4" />تحضير القائمة</>}
          </button>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
        </div>
      </div>
    )
  }

  const groups = groupByDay(list)
  const sentCount = list.filter(i => i.credentialsSentAt).length

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'إجمالي',     value: list.length, color: '#071B33' },
          { label: 'جديد',       value: list.filter(i => i.isNew).length, color: '#FF7900' },
          { label: 'تم الإرسال', value: sentCount, color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: '#F8FAFC', border: '1px solid #E8EDF2' }}>
            <p className="font-black text-lg" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-[11px] font-semibold">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {groups.map(day => (
          <DayGroup key={day.key} day={day}>
            {day.items.map((item, i) => {
              const wasSent = !!item.credentialsSentAt
              return (
                <div key={item.entityId}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom: i < day.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                    background: wasSent ? 'rgba(16,185,129,0.03)' : 'white',
                  }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#071B33] text-sm truncate">{item.displayName || item.whatsapp}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">{TYPE_LABEL[item.entityType]}</span>
                      {item.isNew && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,121,0,0.12)', color: '#FF7900' }}>جديد</span>
                      )}
                      {wasSent && (
                        <span className="text-[10px] font-semibold text-emerald-600">
                          ✓ أُرسل {fmtTime(item.credentialsSentAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => sendOne(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-white text-xs flex-shrink-0 active:scale-95 transition-transform"
                    style={{
                      background: wasSent ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#25D366,#128C7E)',
                      boxShadow: wasSent ? '0 2px 10px rgba(16,185,129,0.3)' : '0 2px 10px rgba(37,211,102,0.35)',
                    }}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    {wasSent ? 'أعد الإرسال' : 'إرسال'}
                  </button>
                </div>
              )
            })}
          </DayGroup>
        ))}
      </div>

      <button onClick={reset}
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-3.5 h-3.5" /> إغلاق القائمة
      </button>
    </div>
  )
}

function TelegramInviteSection() {
  const { loading, list, error, load, markSent, reset } = useProList()

  const TG_MSG = (name) =>
    `مرحباً ${name ? name.split(' ')[0] : ''}،\n\n` +
    `ندعوك للانضمام إلى قناتنا الرسمية على تيليغرام 📣\n\n` +
    `تابع آخر أخبار منصة اطلب فني، العروض الحصرية، والتحديثات الجديدة:\n\n` +
    `👉 ${TELEGRAM_LINK}\n\n` +
    `فريق اطلب فني 🔧`

  const sendOne = (item) => {
    const phone = (item.whatsapp || '').replace(/\D/g, '')
    if (!phone) return
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(TG_MSG(item.displayName))}`, '_blank')
    markSent(item.entityId, 'telegram')
  }

  if (!list) {
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="w-full rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(41,182,246,0.08),rgba(7,27,51,0.04))', border: '1.5px dashed rgba(41,182,246,0.35)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(41,182,246,0.12)', border: '1px solid rgba(41,182,246,0.2)' }}>
            <Globe className="w-6 h-6" style={{ color: '#29B6F6' }} />
          </div>
          <div>
            <p className="font-black text-[#071B33] text-sm">دعوة متابعة قناة تيليغرام</p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              القائمة مقسّمة حسب يوم الانضمام — تتبّع من دعوته محفوظ في قاعدة البيانات
            </p>
          </div>
          <button onClick={load} disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#29B6F6,#0288D1)', boxShadow: '0 4px 20px rgba(41,182,246,0.35)' }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري التحميل...</>
              : <><Send className="w-4 h-4" />تحضير القائمة</>}
          </button>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
        </div>
      </div>
    )
  }

  const groups = groupByDay(list)
  const sentCount = list.filter(i => i.telegramSentAt).length

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'إجمالي',     value: list.length, color: '#071B33' },
          { label: 'تم الإرسال', value: sentCount,    color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: '#F8FAFC', border: '1px solid #E8EDF2' }}>
            <p className="font-black text-lg" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-[11px] font-semibold">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {groups.map(day => (
          <DayGroup key={day.key} day={day}>
            {day.items.map((item, i) => {
              const wasSent = !!item.telegramSentAt
              return (
                <div key={item.entityId}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom: i < day.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                    background: wasSent ? 'rgba(41,182,246,0.03)' : 'white',
                  }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#071B33] text-sm truncate">{item.displayName || item.whatsapp}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">{TYPE_LABEL[item.entityType]}</span>
                      {wasSent && (
                        <span className="text-[10px] font-semibold text-sky-600">
                          ✓ دُعي {fmtTime(item.telegramSentAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => sendOne(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-white text-xs flex-shrink-0 active:scale-95 transition-transform"
                    style={{
                      background: wasSent ? 'linear-gradient(135deg,#29B6F6,#0288D1)' : 'linear-gradient(135deg,#29B6F6,#0288D1)',
                      boxShadow: '0 2px 10px rgba(41,182,246,0.3)',
                      opacity: wasSent ? 0.85 : 1,
                    }}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    {wasSent ? 'أعد الإرسال' : 'دعوة'}
                  </button>
                </div>
              )
            })}
          </DayGroup>
        ))}
      </div>

      <button onClick={reset}
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-3.5 h-3.5" /> إغلاق القائمة
      </button>
    </div>
  )
}

export default function Settings() {
  const { isSuperAdmin, profile } = useAdmin()
  const [saved, setSaved] = useState(false)

  const [notifs, setNotifs] = useState({
    newTechApp:    true,
    newCompApp:    true,
    newRequest:    true,
    newAdRequest:  false,
    systemAlerts:  true,
  })

  const [general, setGeneral] = useState({
    maintenanceMode:  false,
    allowNewApps:     true,
    requireApproval:  true,
    showRatings:      true,
  })

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-black text-[#071B33] mb-1">غير مصرح</h2>
          <p className="text-slate-500 text-sm">الإعدادات متاحة للمدير العام فقط</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5" dir="rtl">
      {/* Saved toast */}
      {saved && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}
        >
          <CheckCircle className="w-4 h-4" />
          تم حفظ الإعدادات
        </div>
      )}

      {/* Admin Info */}
      <Section icon={Shield} title="معلومات الحساب" description="بيانات حساب المدير العام">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['الاسم الكامل', profile?.full_name || '—'],
            ['الدور', 'Super Admin'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl p-3.5" style={{ background: '#F8FAFC' }}>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">{k}</p>
              <p className="text-[#071B33] text-sm font-bold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl p-3.5 flex items-start gap-3" style={{ background: 'rgba(255,121,0,0.06)', border: '1px solid rgba(255,121,0,0.15)' }}>
          <Info className="w-4 h-4 text-[#FF7900] mt-0.5 flex-shrink-0" />
          <p className="text-[#FF9A3C] text-xs leading-relaxed">
            لتغيير البريد الإلكتروني أو كلمة المرور، يُرجى التواصل مع مطور النظام.
          </p>
        </div>
      </Section>

      {/* App Settings */}
      <Section icon={Globe} title="إعدادات التطبيق" description="التحكم في سلوك التطبيق وميزاته">
        <div>
          <ToggleRow
            label="وضع الصيانة"
            description="إيقاف التطبيق مؤقتاً للزوار والمستخدمين"
            enabled={general.maintenanceMode}
            onChange={v => setGeneral(g => ({ ...g, maintenanceMode: v }))}
          />
          <ToggleRow
            label="قبول الطلبات الجديدة"
            description="السماح بتقديم طلبات انضمام الفنيين والشركات"
            enabled={general.allowNewApps}
            onChange={v => setGeneral(g => ({ ...g, allowNewApps: v }))}
          />
          <ToggleRow
            label="الموافقة المسبقة للفنيين"
            description="يحتاج الفنيون موافقة يدوية قبل الظهور في التطبيق"
            enabled={general.requireApproval}
            onChange={v => setGeneral(g => ({ ...g, requireApproval: v }))}
          />
          <ToggleRow
            label="عرض التقييمات والمراجعات"
            description="إظهار تقييمات الفنيين في التطبيق"
            enabled={general.showRatings}
            onChange={v => setGeneral(g => ({ ...g, showRatings: v }))}
          />
        </div>
        <button
          onClick={showSaved}
          className="mt-5 w-full py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)', boxShadow: '0 4px 20px rgba(255,121,0,0.25)' }}
        >
          حفظ إعدادات التطبيق
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="إشعارات لوحة التحكم" description="تخصيص الإشعارات التي تراها في لوحة التحكم">
        <div>
          <ToggleRow
            label="طلبات انضمام فنيين جدد"
            enabled={notifs.newTechApp}
            onChange={v => setNotifs(n => ({ ...n, newTechApp: v }))}
          />
          <ToggleRow
            label="طلبات انضمام شركات جدد"
            enabled={notifs.newCompApp}
            onChange={v => setNotifs(n => ({ ...n, newCompApp: v }))}
          />
          <ToggleRow
            label="طلبات خدمة جديدة"
            enabled={notifs.newRequest}
            onChange={v => setNotifs(n => ({ ...n, newRequest: v }))}
          />
          <ToggleRow
            label="طلبات إعلانات جديدة"
            enabled={notifs.newAdRequest}
            onChange={v => setNotifs(n => ({ ...n, newAdRequest: v }))}
          />
          <ToggleRow
            label="تنبيهات النظام"
            enabled={notifs.systemAlerts}
            onChange={v => setNotifs(n => ({ ...n, systemAlerts: v }))}
          />
        </div>
        <button
          onClick={showSaved}
          className="mt-5 w-full py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)', boxShadow: '0 4px 20px rgba(255,121,0,0.25)' }}
        >
          حفظ إعدادات الإشعارات
        </button>
      </Section>

      {/* Bulk Credentials */}
      <Section icon={Send} title="إرسال بيانات الدخول للمحترفين" description="أرسل اسم المستخدم وكلمة المرور لكل الفنيين والشركات والموردين دفعة واحدة">
        <BulkCredentialsSection />
      </Section>

      {/* Telegram Invite */}
      <Section icon={Globe} title="دعوة متابعة قناة تيليغرام" description="أرسل دعوة واتساب لكل المحترفين لمتابعة القناة الرسمية على تيليغرام">
        <TelegramInviteSection />
      </Section>

      {/* System Info */}
      <Section icon={Database} title="معلومات النظام" description="بيانات تقنية عن الخادم والبيئة">
        <div className="space-y-2">
          {[
            ['اسم التطبيق',     'اطلب فني — Otlob Fanni'],
            ['الإصدار',         'v1.0.0'],
            ['البيئة',          'Production'],
            ['قاعدة البيانات',  'PostgreSQL (Replit DB)'],
            ['التخزين',         'Replit Object Storage'],
            ['واجهة برمجية',    '/api (Express.js)'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: '#F8FAFC' }}>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{k}</span>
              <span className="text-slate-600 text-xs font-mono">{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
