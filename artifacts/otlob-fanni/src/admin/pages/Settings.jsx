import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { Settings as SettingsIcon, Shield, Bell, Palette, Database, Globe, Lock, CheckCircle, Info } from 'lucide-react'

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
