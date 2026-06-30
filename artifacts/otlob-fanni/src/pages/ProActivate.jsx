import { useState } from 'react'
import { useLocation } from 'wouter'
import { Briefcase, ArrowRight, Lock, KeyRound } from 'lucide-react'
import api from '../lib/api'

export default function ProActivate() {
  const [, navigate] = useLocation()
  const [localPhone, setLocalPhone] = useState('')
  const [pin, setPin]               = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const digits = localPhone.replace(/\D/g, '')
    if (digits.length < 9) { setError('أدخل رقم الواتساب كاملاً'); return }
    if (!/^\d{4}$/.test(pin)) { setError('PIN يجب أن يكون 4 أرقام فقط'); return }
    if (pin !== pinConfirm) { setError('PIN وتأكيد PIN غير متطابقَين'); return }

    const fullPhone = '+218' + digits.replace(/^0/, '')
    setLoading(true)
    try {
      const data = await api.pro.activate(fullPhone, pin)
      localStorage.setItem('pro_session', JSON.stringify({
        entityType: data.entityType,
        entityId:   data.entityId,
        displayName: data.displayName,
      }))
      navigate('/pro')
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('غير مسجل') || msg.includes('404')) {
        setError('هذا الرقم غير مسجل في منصة اطلب فني')
      } else if (msg.includes('تواصل')) {
        setError('لم يتم تفعيل حسابك بعد، تواصل مع الإدارة')
      } else {
        setError('حدث خطأ، حاول مجدداً')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto" dir="rtl"
      style={{ background: '#F0F2F5' }}>

      <div className="relative px-5 pt-14 pb-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #071B33 0%, #0f2d52 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none opacity-15"
          style={{ background: 'radial-gradient(circle, #FF7900 0%, transparent 70%)' }} />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

        <button onClick={() => navigate('/pro-login')}
          className="relative z-10 flex items-center gap-2 mb-8 px-3.5 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff' }}>
          <ArrowRight className="w-4 h-4" />
          العودة
        </button>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.4)' }}>
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">إنشاء PIN</h1>
            <p className="text-white/80 text-sm mt-0.5">أول دخول للوحة أعمالك</p>
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-5 relative z-10">
        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 space-y-5"
          style={{ border: '1.5px solid #E2E6EA', boxShadow: '0 4px 24px rgba(7,27,51,0.10)' }}>

          <div>
            <label className="block text-sm font-extrabold text-[#071B33] mb-2">رقم الواتساب</label>
            <div className="flex rounded-xl overflow-hidden transition-all bg-white"
              dir="ltr"
              style={{ border: '1.5px solid #D1D5DB' }}>
              <span className="flex items-center px-3 text-[#071B33] font-bold text-sm select-none whitespace-nowrap"
                style={{ background: '#F8F9FA', borderRight: '1.5px solid #D1D5DB' }}>
                🇱🇾 +218
              </span>
              <input
                type="tel"
                value={localPhone}
                onChange={e => setLocalPhone(e.target.value.replace(/\D/g, '').replace(/^0/, ''))}
                placeholder="91 0000000"
                inputMode="numeric"
                maxLength={9}
                dir="ltr"
                className="flex-1 bg-white outline-none px-3 py-3.5 text-sm text-[#071B33] placeholder-slate-400"
                autoComplete="tel"
                onFocus={e => e.currentTarget.closest('[dir="ltr"]').style.border = '1.5px solid #FF7900'}
                onBlur={e => e.currentTarget.closest('[dir="ltr"]').style.border = '1.5px solid #D1D5DB'}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 px-0.5">
              أدخل الرقم المحلي فقط (مثال: 91، 92) بدون صفر في البداية
            </p>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-[#071B33] mb-2">PIN (4 أرقام)</label>
            <div className="flex rounded-xl overflow-hidden bg-white transition-all"
              style={{ border: '1.5px solid #D1D5DB' }}>
              <div className="flex items-center px-3"
                style={{ background: '#F8F9FA', borderLeft: '1.5px solid #D1D5DB' }}>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                inputMode="numeric"
                maxLength={4}
                dir="ltr"
                className="flex-1 bg-white outline-none px-3 py-3.5 text-sm text-[#071B33] placeholder-slate-400 tracking-[0.5em]"
                autoComplete="new-password"
                onFocus={e => e.currentTarget.closest('.flex').style.border = '1.5px solid #FF7900'}
                onBlur={e => e.currentTarget.closest('.flex').style.border = '1.5px solid #D1D5DB'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-[#071B33] mb-2">تأكيد PIN</label>
            <div className="flex rounded-xl overflow-hidden bg-white transition-all"
              style={{ border: '1.5px solid #D1D5DB' }}>
              <div className="flex items-center px-3"
                style={{ background: '#F8F9FA', borderLeft: '1.5px solid #D1D5DB' }}>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                inputMode="numeric"
                maxLength={4}
                dir="ltr"
                className="flex-1 bg-white outline-none px-3 py-3.5 text-sm text-[#071B33] placeholder-slate-400 tracking-[0.5em]"
                autoComplete="new-password"
                onFocus={e => e.currentTarget.closest('.flex').style.border = '1.5px solid #FF7900'}
                onBlur={e => e.currentTarget.closest('.flex').style.border = '1.5px solid #D1D5DB'}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold text-center"
              style={{ background: '#FFF5F5', border: '1.5px solid #FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-base transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.35)' }}>
            {loading ? 'جارٍ الحفظ…' : 'إنشاء PIN والدخول'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6 px-6 leading-relaxed">
        PIN مكون من 4 أرقام تختاره أنت ويستخدم لتسجيل الدخول لاحقاً.<br />
        لديك PIN بالفعل؟{' '}
        <button onClick={() => navigate('/pro-login')}
          className="font-bold" style={{ color: '#FF7900' }}>
          سجّل دخولك
        </button>
      </p>
    </div>
  )
}
