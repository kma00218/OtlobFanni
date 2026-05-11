import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAdmin } from '../context/AdminContext'
import { Wrench, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-[#0E0E17] border border-[#FF7900]/30 rounded-2xl mb-5 shadow-xl shadow-black/50 cursor-pointer hover:border-[#FF7900]/60 transition-colors"
            onClick={() => navigate('/')}
            title="العودة إلى التطبيق"
          >
            <Wrench className="w-8 h-8 text-[#FF7900]" />
          </div>
          <h1 className="text-2xl font-bold text-[#E8E8F0]">لوحة التحكم</h1>
          <p className="text-[#555570] mt-1 text-sm">اطلب فني — Otlob Fanni</p>
        </div>

        <div className="bg-[#0E0E17] rounded-2xl border border-white/8 shadow-2xl shadow-black/60 p-8">
          <h2 className="text-lg font-bold text-[#E8E8F0] mb-6">تسجيل الدخول</h2>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7070A0] mb-2 uppercase tracking-wider">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-sm text-[#C0C0E0] placeholder:text-[#444460] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7070A0] mb-2 uppercase tracking-wider">
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-sm text-[#C0C0E0] placeholder:text-[#444460] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900]/40 transition-colors pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444460] hover:text-[#7070A0] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF7900] hover:bg-[#e86d00] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#FF7900]/20"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#333350] mt-6">
          هذه الصفحة للإدارة فقط — غير متاحة للمستخدمين العاديين
        </p>
      </div>
    </div>
  )
}
