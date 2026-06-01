import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'wouter'
import { CheckCircle, XCircle, Wrench, Building2, Package, AlertTriangle, Loader } from 'lucide-react'
import { api } from '../lib/api'

const SERVICE_TYPES = {
  technician: 'فني',
  company:    'شركة خدمية',
  supplier:   'مورد مستلزمات',
}

const STATUS_MAP = {
  confirmed: { label: 'مؤكدة ✓',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  disputed:  { label: 'مختلف عليها', color: 'text-red-600',  bg: 'bg-red-50 border-red-200' },
  pending:   { label: 'بانتظار تأكيدك', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
}

export default function DealConfirm() {
  const { token } = useParams()
  const [, navigate] = useLocation()
  const [deal, setDeal]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [userName, setUserName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]       = useState(null)

  useEffect(() => {
    if (!token) { setError('رابط غير صالح'); setLoading(false); return }
    api.deals.getByToken(token)
      .then(d => { setDeal(d); setLoading(false) })
      .catch(() => { setError('الصفقة غير موجودة أو انتهت صلاحية الرابط'); setLoading(false) })
  }, [token])

  const respond = async (confirmed) => {
    setSubmitting(true)
    try {
      const updated = await api.deals.respond(token, { confirmed, userName: userName.trim() || undefined })
      setDone(confirmed)
      setDeal(updated)
    } catch (e) {
      if (e?.message?.includes('Already responded') || e?.status === 409) {
        setError('لقد سبق لك الرد على هذه الصفقة')
      } else {
        setError('حدث خطأ، يرجى المحاولة مجدداً')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const ProIcon = deal?.proType === 'technician' ? Wrench
    : deal?.proType === 'company' ? Building2 : Package

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2440 100%)' }}>
      <Loader className="w-8 h-8 text-[#FF7900] animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2440 100%)' }} dir="rtl">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-black text-[#071B33] text-lg mb-2">تعذّر تحميل الصفقة</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <button onClick={() => navigate('/')} className="mt-6 w-full py-3 rounded-2xl font-bold text-white text-sm" style={{ background: '#FF7900' }}>
          الصفحة الرئيسية
        </button>
      </div>
    </div>
  )

  const alreadyResponded = deal.userConfirmed !== null
  const statusInfo = STATUS_MAP[deal.status] || STATUS_MAP.pending

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start py-10 px-4"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2440 40%, #0d1f38 100%)' }} dir="rtl">

      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-4">
            <span className="text-xs font-bold text-white/70">اطلب فني</span>
          </div>
          <h1 className="text-white font-black text-2xl">تأكيد الصفقة</h1>
          <p className="text-white/50 text-sm mt-1">يرجاك التحقق من تفاصيل الخدمة والرد</p>
        </div>

        {/* Deal card */}
        <div className="bg-white rounded-3xl p-5 shadow-xl space-y-4">

          {/* Pro info */}
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F0F2F5' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
              <ProIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-[#071B33] text-base">{deal.proName || SERVICE_TYPES[deal.proType] || 'مهني'}</p>
              <p className="text-xs text-gray-400">{SERVICE_TYPES[deal.proType] || ''}</p>
            </div>
          </div>

          {/* Deal details */}
          <div className="space-y-3">
            <Row label="نوع الخدمة" value={deal.serviceType} />
            {deal.serviceValue && <Row label="قيمة الخدمة" value={`${Number(deal.serviceValue).toLocaleString('ar-LY')} د.ل`} />}
            <Row label="تاريخ الخدمة" value={deal.serviceDate} />
            {deal.description && <Row label="تفاصيل" value={deal.description} />}
          </div>

          {/* Status badge */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${statusInfo.bg}`}>
            <span className="text-xs text-gray-500 font-semibold">حالة الصفقة</span>
            <span className={`text-sm font-black ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>

          {/* Points preview */}
          {!alreadyResponded && (
            <div className="flex gap-3">
              <div className="flex-1 bg-[#FF7900]/5 border border-[#FF7900]/20 rounded-2xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-gray-400 font-semibold mb-0.5">نقاطك إن أكّدت</p>
                <p className="text-lg font-black text-[#FF7900]">+5</p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-gray-400 font-semibold mb-0.5">نقاط المهني</p>
                <p className="text-lg font-black text-blue-600">+10</p>
              </div>
            </div>
          )}
        </div>

        {/* Response section */}
        {alreadyResponded ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
            {deal.userConfirmed ? (
              <>
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="font-black text-emerald-700 text-lg">شكراً على التأكيد!</p>
                <p className="text-sm text-gray-400 mt-1">تم تسجيل تأكيدك بنجاح</p>
                <p className="mt-3 text-[#FF7900] font-black text-xl">+5 نقاط</p>
                <p className="text-xs text-gray-400">أُضيفت إلى رصيدك</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="font-black text-red-700 text-lg">تم تسجيل اعتراضك</p>
                <p className="text-sm text-gray-400 mt-1">سيتم مراجعة الصفقة من قِبَل الإدارة</p>
              </>
            )}
          </div>
        ) : done !== null ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
            {done ? (
              <>
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="font-black text-emerald-700 text-lg">تم التأكيد بنجاح!</p>
                <p className="text-sm text-gray-400 mt-1">حصلت على 5 نقاط</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="font-black text-red-700 text-lg">تم تسجيل اعتراضك</p>
                <p className="text-sm text-gray-400 mt-1">سيتم مراجعة الصفقة من قِبَل الإدارة</p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 shadow-xl space-y-4">
            <p className="font-bold text-[#071B33] text-sm text-center">هل تؤكد هذه الخدمة؟</p>

            <input
              type="text"
              placeholder="اسمك (اختياري)"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium text-[#071B33] placeholder-gray-300 focus:outline-none focus:ring-2"
              style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0', focusRingColor: '#FF7900' }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => respond(false)}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-2xl font-bold text-red-600 text-sm border-2 border-red-200 bg-red-50 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                لا، أعترض
              </button>
              <button
                onClick={() => respond(true)}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}>
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                نعم، أؤكد
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-white/30 text-xs pb-4">
          منصة اطلب فني — otlobfanni.ly
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-400 font-semibold flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-bold text-[#071B33] text-left">{value}</span>
    </div>
  )
}
