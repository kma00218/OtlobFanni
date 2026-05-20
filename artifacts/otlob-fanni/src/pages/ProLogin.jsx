import { useState } from 'react'
import { useLocation } from 'wouter'
import { Briefcase, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react'
import api from '../lib/api'

export default function ProLogin() {
  const [, navigate] = useLocation()
  const [localPhone, setLocalPhone] = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const fullPhone = '+218' + localPhone.replace(/\D/g, '').replace(/^0/, '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (localPhone.replace(/\D/g, '').length < 9) {
      setError('أدخل رقم الواتساب كاملاً')
      return
    }
    if (!password.trim()) {
      setError('أدخل كلمة المرور')
      return
    }
    setLoading(true)
    try {
      const data = await api.pro.login(fullPhone, password.trim())
      localStorage.setItem('pro_session', JSON.stringify(data))
      navigate('/pro')
    } catch (err) {
      setError(err.message === 'HTTP 401' || err.message?.includes('401')
        ? 'رقم الواتساب أو كلمة المرور غير صحيحة'
        : 'حدث خطأ، حاول مجدداً')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col max-w-[480px] mx-auto" dir="rtl">

      <div className="bg-[#071B33] px-5 pt-14 pb-8">
        <button onClick={() => navigate('/more')} className="flex items-center gap-1.5 text-white/60 text-sm mb-6 active:opacity-70">
          <ArrowRight className="w-4 h-4" />
          العودة
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF7900] flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-xl leading-tight">دخول الحسابات المهنية</h1>
            <p className="text-white/60 text-sm mt-0.5">للفنيين والشركات والموردين فقط</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 pt-8 pb-10 space-y-5">

        <div>
          <label className="block text-sm font-bold text-[#071B33] mb-2">رقم الواتساب</label>
          <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-[#FF7900] transition-all bg-white" dir="ltr">
            <span className="flex items-center px-3 bg-slate-50 text-[#071B33] font-bold text-sm border-r border-slate-200 select-none whitespace-nowrap">
              🇱🇾 +218
            </span>
            <input
              type="tel"
              value={localPhone}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, '').replace(/^0/, '')
                setLocalPhone(v)
              }}
              placeholder="91 0000000"
              inputMode="numeric"
              maxLength={9}
              dir="ltr"
              className="flex-1 bg-white outline-none px-3 py-3.5 text-sm text-[#071B33] placeholder-slate-400"
              autoComplete="tel"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 px-0.5" dir="rtl">
            أدخل الرقم المحلي فقط (مثال: 91، 92) بدون صفر في البداية
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#071B33] mb-2">كلمة المرور</label>
          <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-[#FF7900] transition-all bg-white">
            <div className="flex items-center px-3 bg-slate-50 border-l border-slate-200">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              dir="ltr"
              className="flex-1 bg-white outline-none px-3 py-3.5 text-sm text-[#071B33] placeholder-slate-400 tracking-widest"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="px-3 text-slate-400 hover:text-slate-600 flex-shrink-0">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-extrabold text-white text-base transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7900 0%, #c45e00 100%)' }}
        >
          {loading ? 'جارٍ الدخول…' : 'دخول'}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          هذا الدخول مخصص للفنيين والشركات والموردين المسجلين فقط.<br/>
          إذا لم تكن مسجلاً، <a href="/join" className="text-[#FF7900] font-semibold">سجّل الآن</a>.
        </p>

      </form>
    </div>
  )
}
