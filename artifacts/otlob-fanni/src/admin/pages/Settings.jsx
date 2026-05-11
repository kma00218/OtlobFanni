import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { Save, Loader2 } from 'lucide-react'

const SETTING_FIELDS = [
  { key: 'app_name_ar',      label: 'اسم التطبيق بالعربي',    type: 'text'     },
  { key: 'app_name_en',      label: 'اسم التطبيق بالإنجليزي', type: 'text', dir: 'ltr' },
  { key: 'slogan_ar',        label: 'السلوغان بالعربي',        type: 'text'     },
  { key: 'slogan_en',        label: 'السلوغان بالإنجليزي',     type: 'text', dir: 'ltr' },
  { key: 'support_whatsapp', label: 'رقم واتساب الدعم',        type: 'text', dir: 'ltr' },
  { key: 'support_phone',    label: 'رقم الهاتف',               type: 'text', dir: 'ltr' },
  { key: 'support_email',    label: 'البريد الإلكتروني',         type: 'email', dir: 'ltr' },
  { key: 'default_city',     label: 'المدينة الافتراضية',       type: 'text'     },
  { key: 'ads_enabled',      label: 'تفعيل الإعلانات',          type: 'checkbox' },
]

const DEFAULTS = {
  app_name_ar:      'اطلب فني',
  app_name_en:      'Otlob Fanni',
  slogan_ar:        'فنيك في دقائق',
  slogan_en:        'Your technician in minutes',
  support_whatsapp: '+218910000000',
  support_phone:    '+218910000000',
  support_email:    'support@otlobfanni.ly',
  default_city:     'طرابلس',
  ads_enabled:      'true',
}

const KEY = 'app_settings_v1'
const load = () => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULTS } } }
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }

export default function Settings() {
  const { logActivity } = useAdmin()
  const [settings, setSettings] = useState(load)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [toast,    setToast]    = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const handleChange = (key, value) => setSettings(s => ({ ...s, [key]: value }))

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    save(settings)
    logActivity?.('update_settings', 'app_settings', null)
    showToast('تم حفظ الإعدادات بنجاح')
    setSaved(true)
    setTimeout(() => { setSaved(false); setSaving(false) }, 1500)
  }

  return (
    <div className="max-w-2xl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-[#0E0E17] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <h2 className="font-bold text-[#E8E8F0]">إعدادات التطبيق</h2>
          <p className="text-[#666680] text-sm mt-0.5">تعديل الإعدادات العامة للتطبيق</p>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="space-y-4">
            {SETTING_FIELDS.map(({ key, label, type, dir }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                {type === 'checkbox' ? (
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key] === 'true' || settings[key] === true}
                      onChange={e => handleChange(key, e.target.checked ? 'true' : 'false')}
                      className="w-4 h-4 accent-[#FF7900]"
                    />
                    <span className="text-sm text-[#C0C0D8]">{settings[key] === 'true' ? 'مفعّل' : 'معطّل'}</span>
                  </label>
                ) : (
                  <input
                    type={type}
                    value={settings[key] || ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className="form-input"
                    dir={dir}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              type="submit" disabled={saving}
              className={`flex items-center gap-2 font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-[#FF7900] hover:bg-[#e86d00] text-white'}`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
