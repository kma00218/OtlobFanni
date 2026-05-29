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

function BulkCredentialsSection() {
  const [loading, setLoading]   = useState(false)
  const [list, setList]         = useState(null)
  const [sent, setSent]         = useState({})
  const [error, setError]       = useState('')
  const [showAll, setShowAll]   = useState(false)

  const PLATFORM_URL = 'otlobfanni.ly'
  const MSG = (wa, pass) =>
    `تم تفعيل حسابك المهني على منصة اطلب فني 🎉\n\n` +
    `يمكنك الآن الدخول إلى أدوات العمل عبر منصة:\n` +
    `🌐 ${PLATFORM_URL}\n\n` +
    `من صفحة:\nالمزيد ← دخول الحسابات المهنية\n\n` +
    `اسم المستخدم:\n${wa}\n\n` +
    `كلمة المرور:\n${pass}`

  const TYPE_LABEL = { technician: '🔧 فني', company: '🏢 شركة', supplier: '📦 مورد' }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.pro.bulkCredentials()
      setList(data)
    } catch {
      setError('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const sendOne = (item) => {
    const phone = (item.whatsapp || '').replace(/\D/g, '')
    if (!phone) return
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(MSG(item.whatsapp, item.password))}`, '_blank')
    setSent(s => ({ ...s, [item.entityId]: true }))
  }

  const newCount  = list ? list.filter(i => i.isNew).length : 0
  const allCount  = list ? list.length : 0
  const sentCount = Object.keys(sent).length
  const visible   = list ? (showAll ? list : list.slice(0, 8)) : []

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
              يجلب كل الفنيين والشركات والموردين المفعّلين<br/>ويعرضهم مع رابط واتساب جاهز لكل واحد
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#FF7900,#FF9500)', boxShadow: '0 4px 20px rgba(255,121,0,0.35)' }}
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري التحميل...</>
              : <><Send className="w-4 h-4" /> تحضير قائمة الإرسال</>}
          </button>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'إجمالي', value: allCount,  color: '#071B33' },
          { label: 'جديد',   value: newCount,   color: '#FF7900' },
          { label: 'تم الإرسال', value: sentCount, color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: '#F8FAFC', border: '1px solid #E8EDF2' }}>
            <p className="font-black text-lg" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-[11px] font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8EDF2' }}>
        {visible.map((item, i) => {
          const isSent = sent[item.entityId]
          return (
            <div key={item.entityId}
              className="flex items-center gap-3 px-4 py-3 transition-colors"
              style={{
                borderBottom: i < visible.length - 1 ? '1px solid #F1F5F9' : 'none',
                background: isSent ? 'rgba(16,185,129,0.04)' : 'white',
              }}>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#071B33] text-sm truncate">{item.displayName || item.whatsapp}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-400">{TYPE_LABEL[item.entityType]}</span>
                  {item.isNew && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,121,0,0.12)', color: '#FF7900' }}>جديد</span>
                  )}
                  {isSent && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>✓ أُرسل</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => sendOne(item)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-white text-xs flex-shrink-0 transition-all active:scale-95"
                style={{
                  background: isSent
                    ? 'linear-gradient(135deg,#10B981,#059669)'
                    : 'linear-gradient(135deg,#25D366,#128C7E)',
                  boxShadow: isSent
                    ? '0 2px 10px rgba(16,185,129,0.3)'
                    : '0 2px 10px rgba(37,211,102,0.35)',
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {isSent ? 'أعد الإرسال' : 'إرسال'}
              </button>
            </div>
          )
        })}
      </div>

      {list.length > 8 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-bold text-slate-500 transition-colors hover:text-[#FF7900]"
          style={{ background: '#F8FAFC', border: '1px solid #E8EDF2' }}
        >
          {showAll ? <><ChevronUp className="w-4 h-4" /> عرض أقل</> : <><ChevronDown className="w-4 h-4" /> عرض الكل ({list.length})</>}
        </button>
      )}

      <button
        onClick={() => { setList(null); setSent({}) }}
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
      >
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
