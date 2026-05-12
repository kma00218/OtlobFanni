import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAdmin } from '../context/AdminContext'
import { Wrench, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn } = useAdmin()
  const [, navigate] = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070F] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF7900]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#071B33]/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF7900]/3 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 shadow-2xl shadow-[#FF7900]/30 transition-transform hover:scale-105 active:scale-95 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)' }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-3xl" />
            <Wrench className="w-9 h-9 text-white relative z-10" strokeWidth={2} />
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight">اطلب فني</h1>
          <p className="text-[#6060A0] text-sm mt-1.5 font-medium">لوحة التحكم الإدارية</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl shadow-black/60"
          style={{
            background: 'linear-gradient(145deg, #0F0F1D, #0A0A15)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">تسجيل الدخول</h2>
            <p className="text-[#6060A0] text-sm mt-1">أدخل بيانات حسابك للوصول إلى لوحة التحكم</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#8080B0] mb-2 tracking-wider uppercase">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@otlobfanni.ly"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-[#3A3A60] transition-all outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,121,0,0.5)'; e.target.style.background = 'rgba(255,121,0,0.04)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8080B0] mb-2 tracking-wider uppercase">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pl-12 rounded-2xl text-sm text-white placeholder:text-[#3A3A60] transition-all outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,121,0,0.5)'; e.target.style.background = 'rgba(255,121,0,0.04)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#404070] hover:text-[#8080B0] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-[0.98] disabled:opacity-60 mt-2 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FF7900, #FF9500)', boxShadow: '0 8px 32px rgba(255,121,0,0.35)' }}
            >
              <span className="relative z-10">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الدخول...</span>
                  : 'دخول إلى لوحة التحكم'
                }
              </span>
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 w-full mt-5 text-[#404070] hover:text-[#8080B0] text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          العودة إلى التطبيق
        </button>
      </div>
    </div>
  )
}
