import { useState } from 'react'
import { useLocation } from 'wouter'
import { Briefcase, ArrowRight, ArrowLeft, Lock } from 'lucide-react'
import api from '../lib/api'
import { useLang } from '../context/LanguageContext'

const T = {
  ar: {
    title:         'أعمالي',
    sub:           'للفنيين والشركات والموردين فقط',
    back:          'العودة',
    phone:         'رقم الواتساب',
    phoneHint:     'أدخل الرقم المحلي فقط (مثال: 91، 92) بدون صفر في البداية',
    pin:           'PIN (4 أرقام)',
    forgot:        'نسيت PIN؟',
    enter:         'دخول',
    entering:      'جارٍ الدخول…',
    footer:        'هذا الدخول مخصص للفنيين والشركات والموردين المسجلين فقط.',
    notReg:        'إذا لم تكن مسجلاً،',
    joinNow:       'سجّل الآن',
    errPhone:      'أدخل رقم الواتساب كاملاً',
    errPin:        'أدخل PIN مكون من 4 أرقام',
    errWrong:      'رقم الواتساب أو PIN غير صحيح',
    errGeneral:    'حدث خطأ، حاول مجدداً',
    pinNotSetMsg:  'هذه أول مرة تدخل فيها إلى أعمالي. يرجى إنشاء PIN أولاً.',
    pinNotSetBtn:  'إنشاء PIN',
  },
  en: {
    title:         'My Business',
    sub:           'For technicians, companies & suppliers only',
    back:          'Back',
    phone:         'WhatsApp Number',
    phoneHint:     'Enter local number only (e.g. 91, 92) without leading zero',
    pin:           'PIN (4 digits)',
    forgot:        'Forgot PIN?',
    enter:         'Sign In',
    entering:      'Signing in…',
    footer:        'This login is for registered technicians, companies & suppliers only.',
    notReg:        'Not registered?',
    joinNow:       'Join now',
    errPhone:      'Enter your full WhatsApp number',
    errPin:        'Enter your 4-digit PIN',
    errWrong:      'Incorrect WhatsApp number or PIN',
    errGeneral:    'An error occurred, please try again',
    pinNotSetMsg:  'This is your first time signing in. Please create a PIN first.',
    pinNotSetBtn:  'Create PIN',
  },
}

export default function ProLogin() {
  const [, navigate] = useLocation()
  const { lang } = useLang()
  const ar = lang === 'ar'
  const t = T[lang]

  const [localPhone, setLocalPhone] = useState('')
  const [pin, setPin]               = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [pinNotSet, setPinNotSet]   = useState(false)

  const fullPhone = '+218' + localPhone.replace(/\D/g, '').replace(/^0/, '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPinNotSet(false)
    if (localPhone.replace(/\D/g, '').length < 9) { setError(t.errPhone); return }
    if (!/^\d{4}$/.test(pin))                     { setError(t.errPin);   return }
    setLoading(true)
    try {
      const data = await api.pro.login(fullPhone, pin)
      localStorage.setItem('pro_session', JSON.stringify(data))
      navigate('/pro')
    } catch (err) {
      if (err.message?.includes('403')) {
        setPinNotSet(true)
      } else if (err.message?.includes('401')) {
        setError(t.errWrong)
      } else {
        setError(t.errGeneral)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto"
      dir={ar ? 'rtl' : 'ltr'}
      style={{ background: '#F0F2F5' }}>

      <div className="relative px-5 pt-14 pb-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #071B33 0%, #0f2d52 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none opacity-15"
          style={{ background: 'radial-gradient(circle, #FF7900 0%, transparent 70%)' }} />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

        <button onClick={() => navigate('/more')}
          className="relative z-10 flex items-center gap-2 mb-8 px-3.5 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff' }}>
          {ar ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {t.back}
        </button>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)', boxShadow: '0 4px 16px rgba(255,121,0,0.4)' }}>
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">{t.title}</h1>
            <p className="text-white/80 text-sm mt-0.5">{t.sub}</p>
          </div>
        </div>
      </div>

      {/* PIN not set — shown only after 403 response */}
      {pinNotSet && (
        <div className="mx-4 mt-4 relative z-10">
          <div className="rounded-2xl px-4 py-4 flex flex-col gap-3"
            style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">🔑</span>
              <p className="text-sm font-semibold leading-relaxed" style={{ color: '#92400E' }}>
                {t.pinNotSetMsg}
              </p>
            </div>
            <button type="button"
              onClick={() => navigate('/pro-activate')}
              className="w-full py-3 rounded-xl font-extrabold text-white text-sm active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF7900 0%, #e06500 100%)' }}>
              {t.pinNotSetBtn}
            </button>
          </div>
        </div>
      )}

      <div className="mx-4 mt-4 relative z-10">
        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 space-y-5"
          style={{ border: '1.5px solid #E2E6EA', boxShadow: '0 4px 24px rgba(7,27,51,0.10)' }}>

          <div>
            <label className="block text-sm font-extrabold text-[#071B33] mb-2">{t.phone}</label>
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
            <p className="text-[11px] text-slate-400 mt-1.5 px-0.5">{t.phoneHint}</p>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-[#071B33] mb-2">{t.pin}</label>
            <div className="flex rounded-xl overflow-hidden bg-white transition-all"
              style={{ border: '1.5px solid #D1D5DB' }}>
              <div className="flex items-center px-3"
                style={{ background: '#F8F9FA', borderRight: '1.5px solid #D1D5DB' }}>
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
                autoComplete="current-password"
                onFocus={e => e.currentTarget.closest('.flex').style.border = '1.5px solid #FF7900'}
                onBlur={e => e.currentTarget.closest('.flex').style.border = '1.5px solid #D1D5DB'}
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => navigate('/pro-activate')}
                className="text-xs font-bold" style={{ color: '#FF7900' }}>
                {t.forgot}
              </button>
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
            {loading ? t.entering : t.enter}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6 px-6 leading-relaxed">
        {t.footer}<br />
        {t.notReg} <a href="/join-us" className="font-bold" style={{ color: '#FF7900' }}>{t.joinNow}</a>.
      </p>
    </div>
  )
}
