import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import { Save, AlertCircle, Loader2 } from 'lucide-react'

const SETTING_FIELDS = [
  { key: 'app_name_ar', label: 'اسم التطبيق بالعربي', type: 'text' },
  { key: 'app_name_en', label: 'اسم التطبيق بالإنجليزي', type: 'text', dir: 'ltr' },
  { key: 'slogan_ar', label: 'السلوغان بالعربي', type: 'text' },
  { key: 'slogan_en', label: 'السلوغان بالإنجليزي', type: 'text', dir: 'ltr' },
  { key: 'support_whatsapp', label: 'رقم واتساب الدعم', type: 'text', dir: 'ltr' },
  { key: 'support_phone', label: 'رقم الهاتف', type: 'text', dir: 'ltr' },
  { key: 'support_email', label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
  { key: 'default_city', label: 'المدينة الافتراضية', type: 'text' },
  { key: 'ads_enabled', label: 'تفعيل الإعلانات', type: 'checkbox' },
]

export default function Settings() {
  const { logActivity } = useAdmin()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return }
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data } = await supabase.from('app_settings').select('key,value')
    const map = {}
    if (data) data.forEach(({ key, value }) => { map[key] = value })
    setSettings(map)
    setLoading(false)
  }

  const handleChange = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key, value: String(value), updated_at: new Date().toISOString()
      }))
      const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' })
      if (error) throw error
      await logActivity('update_settings', 'app_settings', null, 'Updated app settings')
      showToast('تم حفظ الإعدادات بنجاح')
    } catch (err) {
      showToast(err.message, 'error')
    }
    setSaving(false)
  }

  if (!isSupabaseConfigured) return <NotConfigured />

  return (
    <div className="max-w-2xl">
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <h2 className="font-bold text-[#071B33]">إعدادات التطبيق</h2>
          <p className="text-gray-400 text-sm mt-0.5">تعديل الإعدادات العامة للتطبيق</p>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
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
                      <span className="text-sm text-gray-600">{settings[key] === 'true' ? 'مفعّل' : 'معطّل'}</span>
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

            <div className="mt-6 pt-4 border-t border-gray-50">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#FF7900] text-white font-medium px-6 py-2.5 rounded-xl hover:bg-[#e86d00] transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ الإعدادات
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-white rounded-2xl p-8 border border-amber-200 max-w-md">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-1">لم يتم ربط قاعدة البيانات</h3>
        <p className="text-gray-500 text-sm">أضف مفاتيح Supabase في إعدادات المشروع</p>
      </div>
    </div>
  )
}
