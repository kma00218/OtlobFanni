import { useState, useEffect } from 'react'
import { useRoute } from 'wouter'
import { CheckCircle, XCircle, AlertCircle, Star, MapPin, Wrench, Clock, ThumbsUp } from 'lucide-react'
import { api } from '../lib/api'

const PHASE = {
  loading: 'loading',
  start:   'start',            // status=in_progress
  started: 'started',          // status=customer_confirmed_started (already confirmed)
  complete:'complete',          // status=pending_customer_completion_confirmation
  done:    'done',              // terminal
  invalid: 'invalid',
  error:   'error',
}

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FF7900, #d96400)' }}>
        <Wrench className="w-5 h-5 text-white" />
      </div>
      <div>
        <span className="font-black text-lg text-[#071B33] tracking-tight">اطلب فني</span>
        <span className="block text-[10px] text-gray-400 leading-none">Otlob Fanni</span>
      </div>
    </div>
  )
}

function InfoRow({ icon, text }) {
  if (!text) return null
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-[#FF7900]">{icon}</span>
      {text}
    </div>
  )
}

export default function ServiceConfirm() {
  const [, params] = useRoute('/service-confirm/:token')
  const token = params?.token

  const [data,       setData]       = useState(null)
  const [phase,      setPhase]      = useState(PHASE.loading)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState('')

  // Completion phase state
  const [action,        setAction]        = useState(null)   // 'confirm' | 'amount_dispute' | 'completion_dispute'
  const [rating,        setRating]        = useState(0)
  const [comment,       setComment]       = useState('')
  const [disputeAmount, setDisputeAmount] = useState('')
  const [disputeNote,   setDisputeNote]   = useState('')
  const [err,           setErr]           = useState('')

  useEffect(() => {
    if (!token) { setPhase(PHASE.invalid); return }
    api.serviceConfirm.get(token)
      .then(d => {
        setData(d)
        const s = d.status
        if (s === 'in_progress')                         setPhase(PHASE.start)
        else if (s === 'customer_confirmed_started')     setPhase(PHASE.started)
        else if (s === 'pending_customer_completion_confirmation') setPhase(PHASE.complete)
        else if (['completed_confirmed', 'amount_disputed', 'completion_disputed', 'completed', 'cancelled'].includes(s))
                                                          setPhase(PHASE.done)
        else                                              setPhase(PHASE.invalid)
      })
      .catch(() => setPhase(PHASE.error))
  }, [token])

  const handleConfirmStarted = async () => {
    setSubmitting(true); setErr('')
    try {
      await api.serviceConfirm.confirmStarted(token)
      setSuccess('شكراً لك! تم تأكيد بداية العمل بنجاح.')
      setPhase(PHASE.done)
    } catch { setErr('حدث خطأ، يرجى المحاولة مجدداً.') }
    finally { setSubmitting(false) }
  }

  const handleConfirmCompleted = async () => {
    setErr('')
    if (action === 'confirm' && rating === 0) { setErr('يرجى اختيار تقييم من 1 إلى 5 نجوم.'); return }
    if (action === 'amount_dispute' && !disputeAmount.trim()) { setErr('يرجى كتابة القيمة الصحيحة.'); return }
    setSubmitting(true)
    try {
      await api.serviceConfirm.confirmCompleted(token, { action, rating, comment, disputeAmount, disputeNote })
      if (action === 'confirm') setSuccess('شكراً! تم تأكيد انتهاء الخدمة وإرسال تقييمك.')
      else if (action === 'amount_dispute') setSuccess('تم إرسال اعتراضك على القيمة. سيتواصل معك الفني قريباً.')
      else setSuccess('تم تسجيل ملاحظتك. سيتواصل معك الفني قريباً.')
      setPhase(PHASE.done)
    } catch { setErr('حدث خطأ، يرجى المحاولة مجدداً.') }
    finally { setSubmitting(false) }
  }

  const ownerLabel = data?.ownerType === 'company' ? 'الشركة' : data?.ownerType === 'supplier' ? 'المورد' : 'الفني'

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] flex flex-col items-center pt-10 pb-16 px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <Logo />

        {/* ── Loading ── */}
        {phase === PHASE.loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error / Invalid ── */}
        {(phase === PHASE.error || phase === PHASE.invalid) && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-red-100">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-bold text-gray-700 text-base mb-1">الرابط غير صالح</p>
            <p className="text-sm text-gray-400">هذا الرابط غير صحيح أو منتهي الصلاحية.</p>
          </div>
        )}

        {/* ── Phase 1: Confirm work started ── */}
        {phase === PHASE.start && data && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 bg-[#FF7900]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-7 h-7 text-[#FF7900]" />
              </div>
              <h1 className="font-black text-[#071B33] text-lg leading-tight">هل بدأ {ownerLabel} العمل؟</h1>
              <p className="text-sm text-gray-400 mt-1">يرجى تأكيد بداية الخدمة</p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2.5">
              {data.ownerName && (
                <InfoRow icon={<Wrench className="w-4 h-4" />} text={`${ownerLabel}: ${data.ownerName}`} />
              )}
              {(data.requestType || data.categoryName) && (
                <InfoRow icon={<Wrench className="w-4 h-4" />} text={data.requestType || data.categoryName} />
              )}
              {data.cityName && (
                <InfoRow icon={<MapPin className="w-4 h-4" />} text={data.cityName} />
              )}
            </div>

            {err && <p className="text-xs text-red-600 font-semibold text-center">{err}</p>}

            <button onClick={handleConfirmStarted} disabled={submitting}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF7900, #d96400)' }}>
              {submitting
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> نعم، الفني بدأ العمل</>
              }
            </button>

            <p className="text-center text-[11px] text-gray-300">منصة اطلب فني • otlobfanni.ly</p>
          </div>
        )}

        {/* ── Phase 1 already confirmed ── */}
        {phase === PHASE.started && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-emerald-100">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-gray-700 text-base mb-1">تم التأكيد مسبقاً</p>
            <p className="text-sm text-gray-400">لقد قمت بتأكيد بداية العمل بالفعل. شكراً!</p>
          </div>
        )}

        {/* ── Phase 2: Confirm completion ── */}
        {phase === PHASE.complete && data && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ThumbsUp className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="font-black text-[#071B33] text-lg leading-tight">تأكيد انتهاء الخدمة</h1>
              <p className="text-sm text-gray-400 mt-1">يرجى مراجعة التفاصيل واختيار إجراء</p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2.5">
              {data.ownerName && (
                <InfoRow icon={<Wrench className="w-4 h-4" />} text={`${ownerLabel}: ${data.ownerName}`} />
              )}
              {(data.requestType || data.categoryName) && (
                <InfoRow icon={<Wrench className="w-4 h-4" />} text={data.requestType || data.categoryName} />
              )}
              {data.cityName && (
                <InfoRow icon={<MapPin className="w-4 h-4" />} text={data.cityName} />
              )}
              {data.serviceAmount && (
                <div className="flex items-center gap-2 text-sm font-bold text-[#071B33]">
                  <span className="text-[#FF7900] font-black text-base">د.ل</span>
                  قيمة الخدمة: {data.serviceAmount} د.ل
                </div>
              )}
            </div>

            {/* Action choice */}
            {!action && (
              <div className="space-y-2.5">
                <button onClick={() => setAction('confirm')}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-4 h-4" /> أؤكد انتهاء الخدمة
                </button>
                <button onClick={() => setAction('amount_dispute')}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-4 h-4" /> القيمة غير صحيحة
                </button>
                <button onClick={() => setAction('completion_dispute')}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all bg-red-50 text-red-600 border border-red-200">
                  <XCircle className="w-4 h-4" /> الخدمة لم تنتهِ
                </button>
              </div>
            )}

            {/* Confirm completion — rating form */}
            {action === 'confirm' && (
              <div className="space-y-3">
                <button onClick={() => setAction(null)} className="text-xs text-gray-400">← رجوع</button>
                <div>
                  <p className="text-sm font-bold text-[#071B33] mb-2">تقييم الخدمة *</p>
                  <div className="flex gap-2 justify-center">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRating(s)}
                        className="text-2xl transition-transform active:scale-90"
                        style={{ color: s <= rating ? '#FF7900' : '#D1D5DB' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">تعليق (اختياري)</label>
                  <textarea rows={2} placeholder="شاركنا رأيك في الخدمة..."
                    value={comment} onChange={e => setComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-[#071B33] resize-none focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30"
                    style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                </div>
                {err && <p className="text-xs text-red-600 font-semibold">{err}</p>}
                <button onClick={handleConfirmCompleted} disabled={submitting}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #065f46)' }}>
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><CheckCircle className="w-4 h-4" /> إرسال التقييم</>
                  }
                </button>
              </div>
            )}

            {/* Amount dispute form */}
            {action === 'amount_dispute' && (
              <div className="space-y-3">
                <button onClick={() => setAction(null)} className="text-xs text-gray-400">← رجوع</button>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">القيمة الصحيحة (د.ل) *</label>
                  <input type="number" min="0" placeholder="أدخل القيمة الصحيحة"
                    value={disputeAmount} onChange={e => setDisputeAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-[#071B33] focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ملاحظة (اختياري)</label>
                  <textarea rows={2} placeholder="أي تفاصيل إضافية..."
                    value={disputeNote} onChange={e => setDisputeNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-[#071B33] resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                </div>
                {err && <p className="text-xs text-red-600 font-semibold">{err}</p>}
                <button onClick={handleConfirmCompleted} disabled={submitting}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #D97706, #92400e)' }}>
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><AlertCircle className="w-4 h-4" /> إرسال الاعتراض</>
                  }
                </button>
              </div>
            )}

            {/* Completion dispute */}
            {action === 'completion_dispute' && (
              <div className="space-y-3">
                <button onClick={() => setAction(null)} className="text-xs text-gray-400">← رجوع</button>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3">
                  <p className="text-sm font-bold text-red-700 mb-1">الخدمة لم تنتهِ</p>
                  <p className="text-xs text-red-500">سيتواصل معك الفني أو الدعم لحل المشكلة</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ملاحظة (اختياري)</label>
                  <textarea rows={2} placeholder="ما المشكلة؟"
                    value={disputeNote} onChange={e => setDisputeNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-[#071B33] resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30"
                    style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0' }} />
                </div>
                {err && <p className="text-xs text-red-600 font-semibold">{err}</p>}
                <button onClick={handleConfirmCompleted} disabled={submitting}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #DC2626, #991b1b)' }}>
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><XCircle className="w-4 h-4" /> إرسال الملاحظة</>
                  }
                </button>
              </div>
            )}

            {!action && <p className="text-center text-[11px] text-gray-300">منصة اطلب فني • otlobfanni.ly</p>}
          </div>
        )}

        {/* ── Done / Success ── */}
        {phase === PHASE.done && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-emerald-100">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-gray-700 text-base mb-1">
              {success || 'تمت العملية بنجاح'}
            </p>
            <p className="text-sm text-gray-400 mt-2">شكراً لاستخدامك منصة اطلب فني</p>
            <a href="https://otlobfanni.ly" className="block mt-4 text-xs text-[#FF7900] font-semibold">
              زيارة اطلب فني
            </a>
          </div>
        )}

        {/* Success overlay for start phase */}
        {success && phase === PHASE.done && phase !== PHASE.done && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-emerald-700 font-bold">{success}</p>
          </div>
        )}
      </div>
    </div>
  )
}
